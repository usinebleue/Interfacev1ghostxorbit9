/**
 * MobileCallFAB.tsx — Bouton flottant pour appeler CarlOS sur mobile
 * Ray-Ban Meta prototype — appel vocal direct via LiveKit
 * Les lunettes Bluetooth = mic + speakers automatiquement
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Phone, PhoneOff, Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "../../components/ui/utils";
import { useFrameMaster } from "../context/FrameMasterContext";
import { useChatContext } from "../context/ChatContext";
import { useCanvasActions } from "../context/CanvasActionContext";
import { api } from "../api/client";
import type { CanvasAction } from "../api/types";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrackPublication,
  RemoteTrack,
  Participant,
  DisconnectReason,
} from "livekit-client";

const BOT_NAMES: Record<string, string> = {
  CEOB: "CarlOS", CTOB: "Thierry", CFOB: "François", CMOB: "Martine",
  CSOB: "Sophie", COOB: "Olivier", CPOB: "Fabien", CHROB: "Hélène",
  CINOB: "Inès", CROB: "Raphaël", CLOB: "Louise", CISOB: "Sébastien",
};

type CallState = "idle" | "connecting" | "connected" | "error";

export function MobileCallFAB() {
  const { activeBotCode, activeView, setActiveView } = useFrameMaster();
  const { injectVoiceMessage, newConversation } = useChatContext();
  const { dispatchBatch } = useCanvasActions();

  const [callState, setCallState] = useState<CallState>("idle");
  const [micOn, setMicOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  const roomRef = useRef<Room | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCursorRef = useRef(0);
  const userHangupRef = useRef(false);

  const injectRef = useRef(injectVoiceMessage);
  injectRef.current = injectVoiceMessage;
  const dispatchBatchRef = useRef(dispatchBatch);
  dispatchBatchRef.current = dispatchBatch;
  const setActiveViewRef = useRef(setActiveView);
  setActiveViewRef.current = setActiveView;
  const activeViewRef = useRef(activeView);
  activeViewRef.current = activeView;
  const hasAutoSwitchedRef = useRef(false);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // --- Voice polling (transcripts → LiveChat) ---
  const startVoicePolling = useCallback((roomName: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollCursorRef.current = 0;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/v1/voice/events/${roomName}?cursor=${pollCursorRef.current}`,
          { headers: { "X-API-Key": import.meta.env.VITE_API_KEY || "missing-key" } }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.events?.length > 0) {
          for (const evt of data.events) {
            if (evt.canvas_actions?.length > 0) {
              const filtered = (evt.canvas_actions as CanvasAction[]).filter(
                (a) => a.type !== "push_content"
              );
              if (filtered.length > 0) dispatchBatchRef.current(filtered);
            }
            if (evt.type === "exchange") {
              if (!hasAutoSwitchedRef.current && activeViewRef.current !== "live-chat") {
                setActiveViewRef.current("live-chat");
                hasAutoSwitchedRef.current = true;
              }
              if (evt.user_text) injectRef.current("user", evt.user_text);
              if (evt.bot_text) injectRef.current("assistant", evt.bot_text, evt.agent);
            }
          }
          pollCursorRef.current = data.cursor;
        }
      } catch { /* retry next poll */ }
    }, 2000);
  }, []);

  const stopVoicePolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    pollCursorRef.current = 0;
  }, []);

  // --- End call ---
  const endCall = useCallback(() => {
    userHangupRef.current = true;
    if (roomRef.current) { roomRef.current.disconnect(); roomRef.current = null; }
    if (audioElRef.current) { audioElRef.current.srcObject = null; audioElRef.current.remove(); audioElRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    stopVoicePolling();
    hasAutoSwitchedRef.current = false;
    setCallState("idle");
    setCallDuration(0);
    setMicOn(true);
  }, [stopVoicePolling]);

  // --- Start call ---
  const startCall = useCallback(async () => {
    if (callState === "connecting" || callState === "connected") return;
    setCallState("connecting");
    setCallDuration(0);
    newConversation();

    try {
      const tokenData = await api.voiceToken(activeBotCode, 1, false);

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        disconnectOnPageLeave: false,
        reconnectPolicy: {
          nextRetryDelayInMs: (ctx) => Math.min(1000 * Math.pow(2, Math.min(ctx.retryCount, 5)), 30000),
        },
      });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub: RemoteTrackPublication, _p: Participant) => {
        if (track.kind === Track.Kind.Audio) {
          if (!audioElRef.current) {
            audioElRef.current = document.createElement("audio");
            audioElRef.current.autoplay = true;
            document.body.appendChild(audioElRef.current);
          }
          track.attach(audioElRef.current);
        }
      });

      room.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
        if (userHangupRef.current) { userHangupRef.current = false; return; }
        if (reason !== undefined && reason !== 0) {
          setCallState("error");
          if (timerRef.current) clearInterval(timerRef.current);
          if (pollRef.current) clearInterval(pollRef.current);
          setTimeout(() => { setCallState("idle"); }, 3000);
        } else {
          endCall();
        }
      });

      room.on(RoomEvent.Reconnecting, () => setCallState("connecting"));
      room.on(RoomEvent.Reconnected, () => setCallState("connected"));

      await room.connect(tokenData.livekit_url, tokenData.token);
      await room.localParticipant.setMicrophoneEnabled(true);

      setCallState("connected");

      // Son de connexion compact
      try {
        const ac = new AudioContext();
        const t = ac.currentTime;
        [440, 554, 659].forEach((freq) => {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.type = "sine";
          o.frequency.value = freq;
          o.connect(g);
          g.connect(ac.destination);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.08, t + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
          o.start(t);
          o.stop(t + 0.9);
        });
      } catch { /* silent */ }

      startVoicePolling(tokenData.room_name);
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } catch (err) {
      console.error("[MobileCallFAB] Connection failed:", err);
      setCallState("error");
      setTimeout(() => setCallState("idle"), 3000);
    }
  }, [activeBotCode, callState, newConversation, endCall, startVoicePolling]);

  // --- Toggle mic ---
  const toggleMic = useCallback(async () => {
    if (roomRef.current && callState === "connected") {
      const newState = !micOn;
      await roomRef.current.localParticipant.setMicrophoneEnabled(newState);
      setMicOn(newState);
    }
  }, [micOn, callState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const isInCall = callState === "connected";
  const isConnecting = callState === "connecting";
  const botName = BOT_NAMES[activeBotCode] || "CarlOS";

  // --- En appel: barre compacte au-dessus du tab bar ---
  if (isInCall || isConnecting) {
    return (
      <div className="fixed bottom-14 left-0 right-0 z-50 px-3 pb-1">
        <div className={cn(
          "flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg",
          isInCall ? "bg-green-600" : "bg-blue-600"
        )}>
          {/* Pulse indicator */}
          <span className={cn(
            "w-2.5 h-2.5 rounded-full shrink-0",
            isInCall ? "bg-white animate-pulse" : "bg-white/50 animate-pulse"
          )} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              {isConnecting ? "Connexion..." : `${botName} — En appel`}
            </p>
            {isInCall && (
              <p className="text-white/70 text-[9px] font-mono">{formatDuration(callDuration)}</p>
            )}
          </div>

          {/* Mic toggle */}
          {isInCall && (
            <button
              onClick={toggleMic}
              className={cn(
                "p-2 rounded-full transition-colors",
                micOn ? "bg-white/20 text-white" : "bg-red-500 text-white"
              )}
            >
              {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>
          )}

          {/* Loading or End */}
          {isConnecting ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <button
              onClick={endCall}
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- Idle: FAB flottant ---
  return (
    <button
      onClick={startCall}
      disabled={callState === "error"}
      className={cn(
        "fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full shadow-lg transition-all active:scale-95",
        "bg-blue-600 text-white px-5 py-3.5",
        "hover:bg-blue-700 hover:shadow-xl",
        callState === "error" && "bg-red-500 opacity-70"
      )}
    >
      <Phone className="h-5 w-5" />
      <span className="text-sm font-semibold">{botName}</span>
    </button>
  );
}
