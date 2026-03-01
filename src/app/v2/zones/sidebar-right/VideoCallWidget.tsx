/**
 * VideoCallWidget.tsx — Bloc Communication unifie avec LiveKit WebRTC
 * Video bot 16:9 (change par departement) + call bar
 * Call bar: avatar Carl + presence + boutons Appel/Video
 * Sprint B — Bloc Communication (D-078)
 *
 * Appel vocal : Mic Carl → LiveKit → Deepgram STT → CarlOS Pipeline → ElevenLabs TTS → Speaker
 * Video : meme pipeline + Tavus avatar (Sprint C)
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useChatContext } from "../../context/ChatContext";
import { BOT_AVATAR, BOT_SUBTITLE } from "../../api/types";
import { api } from "../../api/client";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrackPublication,
  RemoteTrack,
  Participant,
  DisconnectReason,
} from "livekit-client";

const BOT_GRADIENT: Record<string, string> = {
  BCO: "from-blue-600 to-blue-500",
  BCT: "from-violet-600 to-violet-500",
  BCF: "from-emerald-600 to-emerald-500",
  BCM: "from-pink-600 to-pink-500",
  BCS: "from-red-600 to-red-500",
  BOO: "from-orange-600 to-orange-500",
  BFA: "from-slate-600 to-slate-500",
  BHR: "from-teal-600 to-teal-500",
  BIO: "from-cyan-600 to-cyan-500",
  BCC: "from-rose-600 to-rose-500",
  BPO: "from-fuchsia-600 to-fuchsia-500",
  BRO: "from-amber-600 to-amber-500",
  BLE: "from-indigo-600 to-indigo-500",
  BSE: "from-zinc-600 to-zinc-500",
};

const BOT_ROLES: Record<string, string> = {
  BCO: "CEO", BCT: "CTO", BCF: "CFO", BCM: "CMO",
  BCS: "CSO", BOO: "COO", BFA: "Factory", BHR: "CHRO",
  BIO: "CIO", BCC: "CCO", BPO: "CPO", BRO: "CRO",
  BLE: "Legal", BSE: "Security",
};

type CallState = "idle" | "connecting" | "connected" | "error";

export function VideoCallWidget() {
  const { activeBotCode, activeBot } = useFrameMaster();
  const { injectVoiceMessage } = useChatContext();

  // Call state
  const [callState, setCallState] = useState<CallState>("idle");
  const [micOn, setMicOn] = useState(true);
  const [botAudioOn, setBotAudioOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastTranscript, setLastTranscript] = useState("");

  // LiveKit refs
  const roomRef = useRef<Room | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCursorRef = useRef(0);
  const roomNameRef = useRef<string>("");

  const avatar = BOT_AVATAR[activeBotCode];
  const botName = activeBot?.nom || BOT_ROLES[activeBotCode] || "CarlOS";
  const botRole = BOT_ROLES[activeBotCode] || "Agent";
  const gradient = BOT_GRADIENT[activeBotCode] || "from-blue-600 to-blue-500";

  // --- Attach remote audio tracks ---
  const attachRemoteAudio = useCallback((track: RemoteTrack) => {
    if (track.kind === Track.Kind.Audio) {
      if (!audioElRef.current) {
        audioElRef.current = document.createElement("audio");
        audioElRef.current.autoplay = true;
        document.body.appendChild(audioElRef.current);
      }
      track.attach(audioElRef.current);
    }
  }, []);

  // --- Start call ---
  const startCall = useCallback(async () => {
    if (callState === "connecting" || callState === "connected") return;

    setCallState("connecting");
    setErrorMsg("");
    setCallDuration(0);

    try {
      // 1. Get LiveKit token from our API
      const tokenData = await api.voiceToken(activeBotCode);

      // 2. Create room and connect
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      roomRef.current = room;

      // Listen for remote audio (bot's voice via ElevenLabs TTS)
      room.on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, _pub: RemoteTrackPublication, _participant: Participant) => {
          attachRemoteAudio(track);
        }
      );

      room.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
        console.log("[CarlOS Voice] Disconnected:", reason);
        endCall();
      });

      room.on(RoomEvent.Reconnecting, () => {
        console.log("[CarlOS Voice] Reconnecting...");
        setCallState("connecting");
      });

      room.on(RoomEvent.Reconnected, () => {
        console.log("[CarlOS Voice] Reconnected!");
        setCallState("connected");
      });

      // 3. Connect to LiveKit Cloud
      await room.connect(tokenData.livekit_url, tokenData.token);

      // 4. Publish microphone
      await room.localParticipant.setMicrophoneEnabled(true);

      setCallState("connected");
      roomNameRef.current = tokenData.room_name;

      // Start polling for voice transcripts → LiveChat
      startVoicePolling(tokenData.room_name);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);

      console.log(`[CarlOS Voice] Connected to room: ${tokenData.room_name}`);
    } catch (err: unknown) {
      console.error("[CarlOS Voice] Connection failed:", err);
      setCallState("error");
      setErrorMsg(err instanceof Error ? err.message : "Connexion echouee");
      // Auto-reset after 3s
      setTimeout(() => {
        setCallState("idle");
        setErrorMsg("");
      }, 3000);
    }
  }, [activeBotCode, callState, attachRemoteAudio]);

  // --- Polling voice transcript listener ---
  const injectRef = useRef(injectVoiceMessage);
  injectRef.current = injectVoiceMessage;

  const startVoicePolling = useCallback((roomName: string) => {
    // Stop any existing polling
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollCursorRef.current = 0;

    console.log(`[Voice Poll] Starting polling for room: ${roomName}`);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/v1/voice/events/${roomName}?cursor=${pollCursorRef.current}`,
          { headers: { "X-API-Key": "ghostx-dev-key-2026" } }
        );
        if (!res.ok) return;
        const data = await res.json();

        if (data.events && data.events.length > 0) {
          for (const evt of data.events) {
            if (evt.type === "exchange") {
              if (evt.user_text) {
                injectRef.current("user", evt.user_text);
                setLastTranscript(evt.user_text);
              }
              if (evt.bot_text) {
                injectRef.current("assistant", evt.bot_text, evt.agent);
              }
            }
          }
          pollCursorRef.current = data.cursor;
        }
      } catch {
        // Silent fail — will retry on next poll
      }
    }, 2000);
  }, []);

  const stopVoicePolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollCursorRef.current = 0;
  }, []);

  // --- End call ---
  const endCall = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (audioElRef.current) {
      audioElRef.current.srcObject = null;
      audioElRef.current.remove();
      audioElRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopVoicePolling();
    roomNameRef.current = "";
    setCallState("idle");
    setCallDuration(0);
    setMicOn(true);
    setLastTranscript("");
  }, [stopVoicePolling]);

  // --- Toggle mic ---
  const toggleMic = useCallback(async () => {
    if (roomRef.current && callState === "connected") {
      const newState = !micOn;
      await roomRef.current.localParticipant.setMicrophoneEnabled(newState);
      setMicOn(newState);
    }
  }, [micOn, callState]);

  // --- Toggle bot audio ---
  const toggleBotAudio = useCallback(() => {
    setBotAudioOn((prev) => {
      if (audioElRef.current) {
        audioElRef.current.muted = prev; // toggle: if was on, mute
      }
      return !prev;
    });
  }, []);

  // Cleanup ONLY on full unmount — not on re-renders
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      // Don't disconnect room on unmount — let user explicitly hang up
    };
  }, []);

  // Format duration
  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const isInCall = callState === "connected";
  const isConnecting = callState === "connecting";

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
              isInCall ? "bg-green-400" : "bg-gray-300"
            )}
          />
          <span
            className={cn(
              "relative inline-flex rounded-full h-1.5 w-1.5",
              isInCall ? "bg-green-500" : "bg-gray-400"
            )}
          />
        </span>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {isInCall ? "En appel" : isConnecting ? "Connexion..." : "CarlOS Live"}
        </span>
        {isInCall && (
          <span className="text-[10px] font-mono text-green-600 ml-auto">
            {formatDuration(callDuration)}
          </span>
        )}
      </div>

      {/* Bot video — 16:9 */}
      <div className="relative rounded-t-lg overflow-hidden aspect-video bg-gray-900">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", gradient)} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {avatar ? (
            <img
              src={avatar}
              alt={botName}
              className={cn(
                "w-10 h-10 rounded-full ring-2 object-cover transition-all",
                isInCall ? "ring-green-400 ring-[3px] animate-pulse" : "ring-white/40"
              )}
            />
          ) : (
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all",
                isInCall ? "bg-green-500/30 ring-2 ring-green-400" : "bg-white/20"
              )}
            >
              {botRole.slice(0, 2)}
            </div>
          )}
          <span className="text-[10px] text-white/90 font-medium mt-1">{botName}</span>
          <span className="text-[8px] text-white/50 max-w-[140px] truncate text-center">
            {isInCall
              ? (lastTranscript ? `"${lastTranscript.slice(0, 40)}${lastTranscript.length > 40 ? "..." : ""}"` : "Ecoute...")
              : BOT_SUBTITLE[activeBotCode] || botRole}
          </span>
        </div>

        {/* Audio toggle — top right */}
        <button
          onClick={toggleBotAudio}
          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white/80 transition-colors cursor-pointer"
        >
          {botAudioOn ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
        </button>

        {/* Role badge — bottom left */}
        <div className="absolute bottom-1.5 left-1.5">
          <span className="text-[9px] text-white/70 bg-black/30 px-1.5 py-0.5 rounded">
            {botRole}
          </span>
        </div>

        {/* Mic status — bottom right (in call only) */}
        {isInCall && (
          <button
            onClick={toggleMic}
            className={cn(
              "absolute bottom-1.5 right-1.5 p-1 rounded-full transition-colors cursor-pointer",
              micOn ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"
            )}
            title={micOn ? "Couper le micro" : "Activer le micro"}
          >
            {micOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Call bar — avatar Carl + presence + Appel / Video */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-b-lg px-2.5 py-2 -mt-2">
        {/* Avatar Carl + presence */}
        <div className="relative shrink-0">
          <img
            src="/agents/carl-fugere.jpg"
            alt="Carl"
            className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200"
          />
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-white",
              isInCall ? "bg-green-500" : "bg-gray-400"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-gray-700 leading-tight">Carl Fugere</p>
          <p className={cn("text-[9px] font-medium", isInCall ? "text-green-600" : "text-gray-400")}>
            {isInCall ? "En appel" : isConnecting ? "Connexion..." : "En ligne"}
          </p>
        </div>

        {/* Error message */}
        {callState === "error" && (
          <span className="text-[8px] text-red-500 max-w-[80px] truncate" title={errorMsg}>
            Erreur
          </span>
        )}

        {/* Appel vocal */}
        <button
          onClick={isInCall ? endCall : startCall}
          disabled={isConnecting}
          className={cn(
            "p-2 rounded-full transition-all cursor-pointer",
            isInCall
              ? "bg-red-100 text-red-600 ring-1 ring-red-300 shadow-sm hover:bg-red-200"
              : isConnecting
                ? "bg-blue-50 text-blue-400 cursor-wait"
                : "bg-white text-gray-400 hover:bg-blue-50 hover:text-blue-500 border border-gray-200"
          )}
          title={isInCall ? "Raccrocher" : isConnecting ? "Connexion..." : "Appeler"}
        >
          {isConnecting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isInCall ? (
            <PhoneOff className="h-3.5 w-3.5" />
          ) : (
            <Phone className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Video — desactive pour V1, sera Tavus Sprint C */}
        <button
          disabled
          className="p-2 rounded-full bg-white text-gray-300 border border-gray-100 cursor-not-allowed"
          title="Video — bientot (Tavus Sprint C)"
        >
          <VideoOff className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
