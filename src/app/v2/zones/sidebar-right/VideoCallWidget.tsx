/**
 * VideoCallWidget.tsx — Bloc Communication unifie avec LiveKit WebRTC
 * Video bot 16:9 (change par departement) + call bar
 * Call bar: avatar Carl + presence + boutons Appel/Video
 * Sprint B — Bloc Communication (D-078)
 *
 * Appel vocal : Mic Carl → LiveKit → Deepgram STT → CarlOS Pipeline → ElevenLabs TTS → Speaker
 * Video : meme pipeline + Tavus avatar lip-sync sur le TTS audio
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  Users,
  X,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useChatContext } from "../../context/ChatContext";
import { useCanvasActions } from "../../context/CanvasActionContext";
import { BOT_SUBTITLE } from "../../api/types";
import type { CanvasAction } from "../../api/types";
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
  BCS: "CSO", BOO: "COO", BFA: "Production", BHR: "CHRO",
  BIO: "CIO", BCC: "CCO", BPO: "CPO", BRO: "CRO",
  BLE: "CLO", BSE: "CISO",
};

const BOT_NAMES: Record<string, string> = {
  BCO: "CarlOS", BCT: "Thierry", BCF: "François", BCM: "Martine",
  BCS: "Sophie", BOO: "Olivier", BFA: "Fabien", BHR: "Hélène",
  BIO: "Isabelle", BCC: "Catherine", BPO: "Philippe", BRO: "Raphaël",
  BLE: "Louise", BSE: "Sébastien",
};

// Images standby — originaux avec circuits neuronaux (fev 25) + Sophie v2 validée par Carl
// object-fit: cover adapte les carrés en 16:9 automatiquement
// PROTOCOLE: pour changer une image → modifier ICI + CarlOSAvatar.tsx + LiveChat.tsx BOT_COLORS + types.ts BOT_AVATAR
const IMG_V = "?v=5";
const BOT_STANDBY: Record<string, string> = {
  BCO: `/agents/generated/ceo-carlos-standby-v3.png${IMG_V}`,
  BCT: `/agents/generated/cto-thierry-standby-v3.png${IMG_V}`,
  BCF: `/agents/generated/cfo-francois-standby-v3.png${IMG_V}`,
  BCM: `/agents/generated/cmo-martine-standby-v3.png${IMG_V}`,
  BCS: `/agents/generated/cso-sophie-standby-v3.png${IMG_V}`,
  BOO: `/agents/generated/coo-olivier-standby-v3.png${IMG_V}`,
  BFA: `/agents/generated/factory-bot-standby-v3.png${IMG_V}`,
  BHR: `/agents/generated/chro-helene-standby-v3.png${IMG_V}`,
  BIO: `/agents/generated/cio-isabelle-standby-v3.png${IMG_V}`,
  BCC: `/agents/generated/cco-catherine-standby-v3.png${IMG_V}`,
  BPO: `/agents/generated/cpo-philippe-standby-v3.png${IMG_V}`,
  BRO: `/agents/generated/cro-raphael-standby-v3.png${IMG_V}`,
  BLE: `/agents/generated/clo-louise-standby-v3.png${IMG_V}`,
  BSE: `/agents/generated/ciso-secbot-standby-v3.png${IMG_V}`,
};

const AVATAR_CONFIG_GLOW: Record<string, string> = {
  BCO: "rgba(59, 130, 246, 0.4)",
  BCT: "rgba(139, 92, 246, 0.4)",
  BCF: "rgba(16, 185, 129, 0.4)",
  BCM: "rgba(236, 72, 153, 0.4)",
  BCS: "rgba(239, 68, 68, 0.4)",
  BOO: "rgba(249, 115, 22, 0.4)",
  BHR: "rgba(20, 184, 166, 0.4)",
  BIO: "rgba(6, 182, 212, 0.4)",
  BCC: "rgba(244, 63, 94, 0.4)",
  BPO: "rgba(217, 70, 239, 0.4)",
  BRO: "rgba(245, 158, 11, 0.4)",
  BLE: "rgba(99, 102, 241, 0.4)",
};

type CallState = "idle" | "connecting" | "connected" | "error";

export function VideoCallWidget() {
  const { activeBotCode, activeBot } = useFrameMaster();
  const { injectVoiceMessage } = useChatContext();
  const { dispatchBatch } = useCanvasActions();

  // Call state
  const [callState, setCallState] = useState<CallState>("idle");
  const [micOn, setMicOn] = useState(true);
  const [botAudioOn, setBotAudioOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastTranscript, setLastTranscript] = useState("");
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [hasVideoTrack, setHasVideoTrack] = useState(false);

  // Jitsi state
  const [jitsiOpen, setJitsiOpen] = useState(false);
  const [jitsiRoom, setJitsiRoom] = useState("");

  const openJitsi = () => {
    const room = `ghostx-${activeBotCode.toLowerCase()}-${Date.now().toString(36)}`;
    setJitsiRoom(room);
    setJitsiOpen(true);
  };

  // LiveKit refs
  const roomRef = useRef<Room | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCursorRef = useRef(0);
  const roomNameRef = useRef<string>("");
  const userHangupRef = useRef(false);

  const standbyImg = BOT_STANDBY[activeBotCode] || BOT_STANDBY.BCO;
  const botName = activeBot?.nom || BOT_ROLES[activeBotCode] || "CarlOS";
  const botRole = BOT_ROLES[activeBotCode] || "Agent";
  const gradient = BOT_GRADIENT[activeBotCode] || "from-blue-600 to-blue-500";

  // --- Attach remote audio track ---
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

  // --- Attach remote video track (Tavus avatar) ---
  const attachRemoteVideo = useCallback((track: RemoteTrack, participant: Participant) => {
    if (track.kind === Track.Kind.Video) {
      console.log(`[CarlOS Video] Video track from: ${participant.identity}`);
      if (videoElRef.current) {
        track.attach(videoElRef.current);
        setHasVideoTrack(true);
      }
    }
  }, []);

  // --- Start call ---
  const startCall = useCallback(async (withVideo = false) => {
    if (callState === "connecting" || callState === "connected") return;

    setCallState("connecting");
    setErrorMsg("");
    setCallDuration(0);
    setIsVideoCall(withVideo);
    setHasVideoTrack(false);

    try {
      // 1. Get LiveKit token from our API
      const tokenData = await api.voiceToken(activeBotCode, 1, withVideo);

      // 2. Create room and connect
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        disconnectOnPageLeave: false,   // Fix B.4.7 — ne pas couper si l'onglet perd le focus
        reconnectPolicy: {
          nextRetryDelayInMs: (ctx) => {
            // Reconnexion illimitee — cap a 30s entre chaque tentative (fix B.4.7)
            return Math.min(1000 * Math.pow(2, Math.min(ctx.retryCount, 5)), 30000);
          },
        },
      });
      roomRef.current = room;

      // Listen for remote tracks (audio = bot voice, video = Tavus avatar)
      room.on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, _pub: RemoteTrackPublication, participant: Participant) => {
          if (track.kind === Track.Kind.Audio) {
            attachRemoteAudio(track);
          } else if (track.kind === Track.Kind.Video) {
            attachRemoteVideo(track, participant);
          }
        }
      );

      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Video) {
          setHasVideoTrack(false);
        }
      });

      room.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
        console.log("[CarlOS Voice] Disconnected:", reason, "userHangup:", userHangupRef.current);
        // Si l'utilisateur a raccroché volontairement, pas d'erreur
        if (userHangupRef.current) {
          userHangupRef.current = false;
          return;
        }
        // DisconnectReason 0=ClientInitiated (normal), others=network/server issues
        if (reason !== undefined && reason !== 0) {
          setCallState("error");
          setErrorMsg("Connexion perdue — appuyez sur Discuter pour reconnecter");
          if (timerRef.current) clearInterval(timerRef.current);
          if (pollRef.current) clearInterval(pollRef.current);
        } else {
          endCall();
        }
      });

      room.on(RoomEvent.Reconnecting, () => {
        console.log("[CarlOS Voice] Reconnecting...");
        setCallState("connecting");
        setErrorMsg("Reconnexion en cours...");
      });

      room.on(RoomEvent.Reconnected, () => {
        console.log("[CarlOS Voice] Reconnected!");
        setCallState("connected");
        setErrorMsg("");
      });

      // 3. Connect to LiveKit Cloud
      await room.connect(tokenData.livekit_url, tokenData.token);

      // 4. Publish microphone
      await room.localParticipant.setMicrophoneEnabled(true);

      setCallState("connected");
      roomNameRef.current = tokenData.room_name;

      // Son de connexion — "Neural Link Activated" futuriste
      try {
        const ac = new AudioContext();
        const t = ac.currentTime;

        // Layer 1: Sub bass sweep (montée grave → donne le feeling "power up")
        const sub = ac.createOscillator();
        const subGain = ac.createGain();
        sub.type = "sine";
        sub.frequency.setValueAtTime(60, t);
        sub.frequency.exponentialRampToValueAtTime(180, t + 0.8);
        sub.connect(subGain);
        subGain.connect(ac.destination);
        subGain.gain.setValueAtTime(0, t);
        subGain.gain.linearRampToValueAtTime(0.2, t + 0.15);
        subGain.gain.setValueAtTime(0.2, t + 0.6);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        sub.start(t);
        sub.stop(t + 1.1);

        // Layer 2: Frequency sweep avec filtre resonant (whoosh sci-fi)
        const noise = ac.createOscillator();
        const noiseFilter = ac.createBiquadFilter();
        const noiseGain = ac.createGain();
        noise.type = "sawtooth";
        noise.frequency.setValueAtTime(80, t);
        noise.frequency.exponentialRampToValueAtTime(2400, t + 0.7);
        noise.frequency.exponentialRampToValueAtTime(400, t + 1.0);
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(200, t);
        noiseFilter.frequency.exponentialRampToValueAtTime(4000, t + 0.7);
        noiseFilter.frequency.exponentialRampToValueAtTime(800, t + 1.0);
        noiseFilter.Q.value = 8;
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ac.destination);
        noiseGain.gain.setValueAtTime(0, t);
        noiseGain.gain.linearRampToValueAtTime(0.06, t + 0.1);
        noiseGain.gain.setValueAtTime(0.06, t + 0.6);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        noise.start(t);
        noise.stop(t + 1.1);

        // Layer 3: Ton de confirmation final (chord pur — "connected")
        [440, 554, 659].forEach((freq) => {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.type = "sine";
          o.frequency.value = freq;
          o.connect(g);
          g.connect(ac.destination);
          g.gain.setValueAtTime(0, t + 0.75);
          g.gain.linearRampToValueAtTime(0.1, t + 0.82);
          g.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
          o.start(t + 0.75);
          o.stop(t + 1.7);
        });
      } catch { /* silent fallback */ }

      // Start polling for voice transcripts → LiveChat
      startVoicePolling(tokenData.room_name);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);

      console.log(`[CarlOS ${withVideo ? "Video" : "Voice"}] Connected to room: ${tokenData.room_name}`);
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
  }, [activeBotCode, callState, attachRemoteAudio, attachRemoteVideo]);

  // --- Polling voice transcript listener ---
  const injectRef = useRef(injectVoiceMessage);
  injectRef.current = injectVoiceMessage;
  const dispatchBatchRef = useRef(dispatchBatch);
  dispatchBatchRef.current = dispatchBatch;

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
          { headers: { "X-API-Key": import.meta.env.VITE_API_KEY || "missing-key" } }
        );
        if (!res.ok) return;
        const data = await res.json();

        if (data.events && data.events.length > 0) {
          for (const evt of data.events) {
            // Canvas actions: navigate + annotate seulement (PAS push_content — la réponse va dans le chat)
            if (evt.canvas_actions && evt.canvas_actions.length > 0) {
              const filtered = (evt.canvas_actions as CanvasAction[]).filter(
                (a) => a.type !== "push_content"
              );
              if (filtered.length > 0) dispatchBatchRef.current(filtered);
            }
            // Transcript: seulement pour les exchanges
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
    userHangupRef.current = true;
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
    setIsVideoCall(false);
    setHasVideoTrack(false);
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
      {/* Bot video — 16:9 */}
      <div className="relative rounded-t-lg overflow-hidden aspect-video bg-gray-900">
        {/* Tavus video track — shown when available */}
        <video
          ref={videoElRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            hasVideoTrack ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        />

        {/* Bot standby image — belle image par département */}
        <img
          src={standbyImg}
          alt={botName}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-500 z-[1]",
            hasVideoTrack && "opacity-0",
            !isInCall && "brightness-90"
          )}
        />
        {/* Business card identity — clean, no extra overlay */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 z-[5] transition-opacity duration-500",
          hasVideoTrack ? "opacity-0" : "opacity-100",
        )}>
          <div className="bg-gradient-to-t from-black/80 to-transparent px-3.5 pt-10 pb-2.5">
            <div className="text-lg text-white font-extrabold tracking-wide drop-shadow-lg leading-none">
              {BOT_NAMES[activeBotCode] || botName}
            </div>
            <div className="text-[10px] text-white/70 font-medium tracking-[0.2em] uppercase drop-shadow-md mt-1">
              {botRole} AI · Usine Bleue
            </div>
            {isInCall && lastTranscript && (
              <p className="text-[9px] text-white/50 mt-1.5 truncate italic">
                &quot;{lastTranscript.slice(0, 50)}{lastTranscript.length > 50 ? "..." : ""}&quot;
              </p>
            )}
          </div>
        </div>

        {/* ── Jitsi overlay — visioconférence humain ── */}
        {jitsiOpen && (
          <div className="absolute inset-0 z-30 rounded-t-lg overflow-hidden">
            <iframe
              src={`https://meet.jit.si/${jitsiRoom}`}
              className="w-full h-full border-0"
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              title="Visioconférence Jitsi"
            />
            <button
              onClick={() => setJitsiOpen(false)}
              className="absolute top-1.5 right-1.5 z-40 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white cursor-pointer transition-colors"
              title="Fermer la visio"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Loading Tavus avatar indicator */}
        {isVideoCall && isInCall && !hasVideoTrack && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-full">
              <Loader2 className="h-3 w-3 text-white animate-spin" />
              <span className="text-[9px] text-white/80">Chargement avatar...</span>
            </div>
          </div>
        )}

        {/* Audio toggle — top right */}
        <button
          onClick={toggleBotAudio}
          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white/80 transition-colors cursor-pointer z-20"
        >
          {botAudioOn ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
        </button>

        {/* Role badge removed — identity is on the business card overlay */}

        {/* Mic status — bottom right (in call only) */}
        {isInCall && (
          <button
            onClick={toggleMic}
            className={cn(
              "absolute bottom-1.5 right-1.5 p-1 rounded-full transition-colors cursor-pointer z-20",
              micOn ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"
            )}
            title={micOn ? "Couper le micro" : "Activer le micro"}
          >
            {micOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Call bar — status + 2 boutons principaux */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-b-lg px-3 py-2.5 -mt-2">
        {/* Status + label */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className={cn(
            "w-2 h-2 rounded-full shrink-0",
            isInCall ? "bg-green-500" : isConnecting ? "bg-amber-400 animate-pulse" : "bg-emerald-500"
          )} />
          <p className={cn("text-[11px] font-semibold leading-tight", isInCall ? "text-green-600" : isConnecting ? "text-amber-500" : "text-emerald-600")}>
            {isInCall ? (isVideoCall ? "Vidéo en cours" : "En appel vocal") : isConnecting ? "Connexion..." : "A l'écoute"}
          </p>
          {isInCall && (
            <span className="text-[10px] font-mono text-green-600 ml-auto">{formatDuration(callDuration)}</span>
          )}
        </div>

        {/* Error message */}
        {callState === "error" && (
          <span className="text-[9px] text-red-500 max-w-[70px] truncate" title={errorMsg}>Erreur</span>
        )}

        {/* Bouton Discutez avec CarlOS — appel vocal */}
        <button
          onClick={isInCall ? endCall : () => startCall(false)}
          disabled={isConnecting}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all cursor-pointer shadow-sm",
            isInCall
              ? "bg-red-500 text-white hover:bg-red-600 shadow-red-200"
              : isConnecting
                ? "bg-blue-100 text-blue-400 cursor-wait"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
          )}
          title={isInCall ? "Raccrocher" : isConnecting ? "Connexion..." : `Discuter avec ${BOT_NAMES[activeBotCode] || "CarlOS"}`}
        >
          {isConnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isInCall ? (
            <PhoneOff className="h-4 w-4" />
          ) : (
            <Phone className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{isInCall ? "Fin" : `Discuter avec ${BOT_NAMES[activeBotCode] || "CarlOS"}`}</span>
        </button>

        {/* Bouton Visio Jitsi — vert */}
        <button
          onClick={jitsiOpen ? () => setJitsiOpen(false) : openJitsi}
          disabled={isConnecting}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all cursor-pointer shadow-sm",
            jitsiOpen
              ? "bg-red-500 text-white hover:bg-red-600 shadow-red-200"
              : isConnecting
                ? "bg-emerald-100 text-emerald-400 cursor-wait"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
          )}
          title={jitsiOpen ? "Fermer la visio" : "Vidéoconférence humain"}
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">{jitsiOpen ? "Fin" : "Visio"}</span>
        </button>
      </div>
    </div>
  );
}
