/**
 * VideoCallWidget.tsx — Bloc Communication unifie avec LiveKit WebRTC
 * Video bot 16:9 (change par departement) + call bar
 * Call bar: avatar Carl + presence + boutons Appel/Video
 * Sprint B — Bloc Communication (D-078)
 *
 * Appel vocal : Mic Carl → LiveKit → Deepgram STT → CarlOS Pipeline → ElevenLabs TTS → Speaker
 * Video : meme pipeline + Tavus avatar lip-sync sur le TTS audio
 */

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
  Glasses,
  Camera,
  RefreshCw,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useChatContext } from "../../context/ChatContext";
import { useCanvasActions } from "../../context/CanvasActionContext";
import { BOT_SUBTITLE } from "../../api/types";
import { AGENTS, AG_KEYFRAMES } from "../center/orbit9/AgentGalleryPage";
import type { AgentConfig } from "../center/orbit9/AgentGalleryPage";
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
  CEOB: "from-blue-600 to-blue-500",
  CTOB: "from-violet-600 to-violet-500",
  CFOB: "from-emerald-600 to-emerald-500",
  CMOB: "from-pink-600 to-pink-500",
  CSOB: "from-red-600 to-red-500",
  COOB: "from-orange-600 to-orange-500",
  CPOB: "from-slate-600 to-slate-500",
  CHROB: "from-teal-600 to-teal-500",
  CINOB: "from-rose-600 to-rose-500",
  CROB: "from-amber-600 to-amber-500",
  CLOB: "from-indigo-600 to-indigo-500",
  CISOB: "from-zinc-600 to-zinc-500",
};

const BOT_ROLES: Record<string, string> = {
  CEOB: "CEO", CTOB: "CTO", CFOB: "CFO", CMOB: "CMO",
  CSOB: "CSO", COOB: "COO", CPOB: "CPO", CHROB: "CHRO",
  CINOB: "CINO", CROB: "CRO",
  CLOB: "CLO", CISOB: "CISO",
};

const BOT_NAMES: Record<string, string> = {
  CEOB: "CarlOS", CTOB: "Tim", CFOB: "Frank", CMOB: "Mathilde",
  CSOB: "Simone", COOB: "Olivier", CPOB: "Paco", CHROB: "Hélène",
  CINOB: "Inès", CROB: "Rich",
  CLOB: "Loulou", CISOB: "Sébastien",
};

// Images standby — originaux avec circuits neuronaux (fev 25) + Simone v2 validée par Carl
// object-fit: cover adapte les carrés en 16:9 automatiquement
// PROTOCOLE: pour changer une image → modifier ICI + CarlOSAvatar.tsx + LiveChat.tsx BOT_COLORS + types.ts BOT_AVATAR
const IMG_V = "?v=5";
const BOT_STANDBY: Record<string, string> = {
  CEOB: `/agents/generated/ceo-carlos-standby-v3.png${IMG_V}`,
  CTOB: `/agents/generated/cto-thierry-standby-v3.png${IMG_V}`,
  CFOB: `/agents/generated/cfo-francois-standby-v3.png${IMG_V}`,
  CMOB: `/agents/generated/cmo-martine-standby-v3.png${IMG_V}`,
  CSOB: `/agents/generated/cso-sophie-standby-v3.png${IMG_V}`,
  COOB: `/agents/generated/coo-olivier-standby-v3.png${IMG_V}`,
  CPOB: `/agents/generated/factory-bot-standby-v3.png${IMG_V}`,
  CHROB: `/agents/generated/chro-helene-standby-v3.png${IMG_V}`,
  CINOB: `/agents/generated/cino-ines-standby-v3.png${IMG_V}`,
  CROB: `/agents/generated/cro-raphael-standby-v3.png${IMG_V}`,
  CLOB: `/agents/generated/clo-louise-standby-v3.png${IMG_V}`,
  CISOB: `/agents/generated/ciso-secbot-standby-v3.png${IMG_V}`,
};

const AVATAR_CONFIG_GLOW: Record<string, string> = {
  CEOB: "rgba(59, 130, 246, 0.4)",
  CTOB: "rgba(139, 92, 246, 0.4)",
  CFOB: "rgba(16, 185, 129, 0.4)",
  CMOB: "rgba(236, 72, 153, 0.4)",
  CSOB: "rgba(239, 68, 68, 0.4)",
  COOB: "rgba(249, 115, 22, 0.4)",
  CHROB: "rgba(20, 184, 166, 0.4)",
  CINOB: "rgba(244, 63, 94, 0.4)",
  CROB: "rgba(245, 158, 11, 0.4)",
  CLOB: "rgba(99, 102, 241, 0.4)",
};

type CallState = "idle" | "connecting" | "connected" | "error";

/** Waveform animé overlay — bas de l'image 16:9 pendant un appel */
function VoiceWaveformOverlay() {
  const [bars, setBars] = useState<number[]>(Array.from({ length: 20 }, () => 3));
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    animRef.current = setInterval(() => {
      setBars((prev) => prev.map(() => Math.floor(Math.random() * 12) + 2));
    }, 100);
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, []);

  return (
    <div className="flex items-end justify-center gap-[1.5px] h-5 mt-2">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-blue-400/80 to-cyan-300/60"
          style={{
            height: `${h * 1.5}px`,
            transition: "height 80ms ease-out",
          }}
        />
      ))}
    </div>
  );
}

export function VideoCallWidget() {
  const { activeBotCode, activeBot, activeView, setActiveView } = useFrameMaster();
  const { injectVoiceMessage, newConversation } = useChatContext();
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

  // Vision mode state
  const [visionMode, setVisionMode] = useState(false);
  const [visionAuto, setVisionAuto] = useState(false);
  const [visionBusy, setVisionBusy] = useState(false);
  const visionVideoRef = useRef<HTMLVideoElement | null>(null);
  const visionStreamRef = useRef<MediaStream | null>(null);
  const visionAutoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const visionCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const openJitsi = () => {
    const room = `ghostx-${activeBotCode.toLowerCase()}-${Date.now().toString(36)}`;
    setJitsiRoom(room);
    setJitsiOpen(true);
  };

  // ── Vision mode — camera + Gemini Vision ──

  const startVision = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      visionStreamRef.current = stream;
      setVisionMode(true);
      // Attach stream to video element after render
      requestAnimationFrame(() => {
        if (visionVideoRef.current) {
          visionVideoRef.current.srcObject = stream;
        }
      });
    } catch {
      // Fallback to user-facing camera (desktop)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        visionStreamRef.current = stream;
        setVisionMode(true);
        requestAnimationFrame(() => {
          if (visionVideoRef.current) {
            visionVideoRef.current.srcObject = stream;
          }
        });
      } catch {
        setErrorMsg("Camera non disponible");
        setTimeout(() => setErrorMsg(""), 3000);
      }
    }
  }, []);

  const stopVision = useCallback(() => {
    if (visionStreamRef.current) {
      visionStreamRef.current.getTracks().forEach((t) => t.stop());
      visionStreamRef.current = null;
    }
    if (visionAutoRef.current) {
      clearInterval(visionAutoRef.current);
      visionAutoRef.current = null;
    }
    setVisionMode(false);
    setVisionAuto(false);
    setVisionBusy(false);
  }, []);

  const captureAndSend = useCallback(async () => {
    if (visionBusy) return;
    const video = visionVideoRef.current;
    if (!video || video.readyState < 2) return;

    // Create offscreen canvas to capture frame
    let canvas = visionCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      visionCanvasRef.current = canvas;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    // Convert to base64 JPEG (strip data:image/jpeg;base64, prefix)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    const base64 = dataUrl.split(",")[1];
    if (!base64) return;

    setVisionBusy(true);

    // Auto-switch vers live-chat au centre pour voir le flow
    if (activeViewRef.current !== "live-chat") {
      setActiveViewRef.current("live-chat");
    }

    // Injecter le message user dans le flow
    injectVoiceMessage("user", "[Vision] Qu'est-ce que tu vois?");

    try {
      const result = await api.chatVision(base64, "Qu'est-ce que tu vois?", activeBotCode);
      if (result.response) {
        injectVoiceMessage("assistant", result.response, result.agent || activeBotCode);
      }
    } catch (err) {
      console.error("Vision capture error:", err);
      injectVoiceMessage("assistant", "Erreur de capture — reessaye.", activeBotCode);
    } finally {
      setVisionBusy(false);
    }
  }, [visionBusy, activeBotCode, injectVoiceMessage]);

  // Auto-capture toggle
  useEffect(() => {
    if (visionAuto && visionMode) {
      // Capture immediately then every 10s
      captureAndSend();
      visionAutoRef.current = setInterval(captureAndSend, 10_000);
    } else if (visionAutoRef.current) {
      clearInterval(visionAutoRef.current);
      visionAutoRef.current = null;
    }
    return () => {
      if (visionAutoRef.current) {
        clearInterval(visionAutoRef.current);
        visionAutoRef.current = null;
      }
    };
  }, [visionAuto, visionMode, captureAndSend]);

  // Cleanup vision on unmount
  useEffect(() => {
    return () => {
      if (visionStreamRef.current) {
        visionStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ── Vision RayBan room polling — always active ──
  // Poll carlos-vision-rayban room for exchanges from the APK
  const visionPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const visionCursorRef = useRef(0);

  useEffect(() => {
    visionPollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/v1/voice/events/carlos-vision-rayban?cursor=${visionCursorRef.current}`,
          { headers: { "X-API-Key": import.meta.env.VITE_API_KEY || "missing-key" } }
        );
        if (!res.ok) return;
        const data = await res.json();

        if (data.events && data.events.length > 0) {
          for (const evt of data.events) {
            if (evt.type === "exchange") {
              if (evt.user_text) {
                injectVoiceMessage("user", `[Vision] ${evt.user_text}`);
              }
              if (evt.bot_text) {
                injectVoiceMessage("assistant", evt.bot_text, evt.agent || "CEOB");
              }
            }
          }
          visionCursorRef.current = data.cursor;
        }
      } catch {
        // Silent fail
      }
    }, 3000);

    return () => {
      if (visionPollRef.current) clearInterval(visionPollRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LiveKit refs
  const roomRef = useRef<Room | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCursorRef = useRef(0);
  const roomNameRef = useRef<string>("");
  const userHangupRef = useRef(false);

  const standbyImg = BOT_STANDBY[activeBotCode] || BOT_STANDBY.CEOB;
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

    // Nouvelle conversation — pas de vieux messages dans le chat
    newConversation();

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

      // B.4.7 — Frontend heartbeat via data channel (keeps WebRTC alive)
      const heartbeatInterval = setInterval(async () => {
        try {
          if (room.state === "connected") {
            await room.localParticipant.publishData(
              new TextEncoder().encode('{"type":"heartbeat"}'),
              { reliable: true }
            );
          }
        } catch { /* room closed */ }
      }, 25_000);
      room.on(RoomEvent.Disconnected, () => clearInterval(heartbeatInterval));

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
  }, [activeBotCode, callState, attachRemoteAudio, attachRemoteVideo, newConversation]);

  // --- Polling voice transcript listener ---
  const injectRef = useRef(injectVoiceMessage);
  injectRef.current = injectVoiceMessage;
  const dispatchBatchRef = useRef(dispatchBatch);
  dispatchBatchRef.current = dispatchBatch;
  const setActiveViewRef = useRef(setActiveView);
  setActiveViewRef.current = setActiveView;
  const activeViewRef = useRef(activeView);
  activeViewRef.current = activeView;
  const hasAutoSwitchedRef = useRef(false);

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
              // Auto-switch vers live-chat si pas deja dessus (vocal = tout dans le chat)
              if (!hasAutoSwitchedRef.current && activeViewRef.current !== "live-chat") {
                setActiveViewRef.current("live-chat");
                hasAutoSwitchedRef.current = true;
              }
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
    hasAutoSwitchedRef.current = false;
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
      {/* CSS keyframes for agent SVG animations */}
      <style>{AG_KEYFRAMES}</style>
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

        {/* Bot standby — version animee FE4B (circuits SVG + waveform) */}
        {(() => {
          const agentData = AGENTS.find(a => a.code === activeBotCode);
          const pid = activeBotCode.toLowerCase();
          return (
            <div className={cn(
              "absolute inset-0 w-full h-full transition-all duration-500 z-[1]",
              hasVideoTrack && "opacity-0",
              !isInCall && "brightness-90"
            )}>
              {/* Photo de base */}
              <img
                src={standbyImg}
                alt={botName}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* SVG Overlay — Circuit Dots + Unique Element */}
              {agentData && (
                <svg
                  viewBox="0 0 330 185"
                  preserveAspectRatio="xMidYMid slice"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 3,
                    mixBlendMode: "screen",
                    pointerEvents: "none",
                  }}
                >
                  <defs>
                    <filter id="ag-glow-sb">
                      <feGaussianBlur stdDeviation="1.2" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  {/* Suit Circuit Paths */}
                  {agentData.suitPaths.map((d, i) => (
                    <path key={`sb-${pid}-p${i}`} id={`sb-${pid}-p${i}`} d={d} fill="none" stroke="none" />
                  ))}
                  {/* Traveling Dots */}
                  {agentData.suitPaths.map((_, i) => {
                    const dur1 = 5.4 + (i % 5) * 0.5;
                    const begin1 = (i * 0.7) % 4;
                    const begin2 = begin1 + dur1 * 0.5;
                    return (
                      <g key={`sb-${pid}-dots-${i}`}>
                        <circle r="0.7" fill={agentData.dotColor} filter="url(#ag-glow-sb)" opacity="0.7">
                          <animateMotion dur={`${dur1}s`} repeatCount="indefinite" begin={`${begin1}s`}>
                            <mpath href={`#sb-${pid}-p${i}`} />
                          </animateMotion>
                        </circle>
                        {i % 2 === 0 && (
                          <circle r="0.5" fill={agentData.dotColorLight} filter="url(#ag-glow-sb)" opacity="0.5">
                            <animateMotion dur={`${dur1}s`} repeatCount="indefinite" begin={`${begin2}s`}>
                              <mpath href={`#sb-${pid}-p${i}`} />
                            </animateMotion>
                          </circle>
                        )}
                      </g>
                    );
                  })}
                  {/* Unique Element */}
                  {agentData.uniqueElement}
                </svg>
              )}
              {/* Vignette */}
              <div style={{
                position: "absolute",
                inset: 0,
                zIndex: 4,
                background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,14,26,0.3) 100%)",
                pointerEvents: "none",
              }} />
            </div>
          );
        })()}
        {/* Business card identity + voice waveform overlay */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 z-[5] transition-opacity duration-500",
          hasVideoTrack ? "opacity-0" : "opacity-100",
        )}>
          <div className="bg-gradient-to-t from-black/80 to-transparent px-3.5 pt-10 pb-2.5">
            <div className="text-lg text-white font-extrabold tracking-wide drop-shadow-lg leading-none">
              {BOT_NAMES[activeBotCode] || botName}
            </div>
            <div className="text-[9px] text-white/70 font-medium tracking-[0.2em] uppercase drop-shadow-md mt-1">
              {botRole} AI · Usine Bleue
            </div>
            {isInCall && lastTranscript && (
              <p className="text-[9px] text-white/50 mt-1.5 truncate italic">
                &quot;{lastTranscript.slice(0, 50)}{lastTranscript.length > 50 ? "..." : ""}&quot;
              </p>
            )}
            {/* Voice waveform — overlay bottom of 16:9 image during call */}
            {isInCall && <VoiceWaveformOverlay />}
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

        {/* ── Vision mode — camera feed overlay ── */}
        {visionMode && (
          <div className="absolute inset-0 z-30 rounded-t-lg overflow-hidden bg-black">
            <video
              ref={visionVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 z-40 bg-cyan-600/90 px-3 py-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] text-white font-semibold tracking-wide">
                VISION ACTIVE
              </span>
              {visionBusy && (
                <Loader2 className="h-3.5 w-3.5 text-white animate-spin ml-auto" />
              )}
            </div>
            {/* Controls bar */}
            <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent px-3 pt-6 pb-2.5 flex items-center gap-2">
              <button
                onClick={captureAndSend}
                disabled={visionBusy}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-semibold transition-all cursor-pointer",
                  visionBusy
                    ? "bg-gray-500 text-gray-300 cursor-wait"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                )}
              >
                <Camera className="h-3.5 w-3.5" />
                Capturer
              </button>
              <button
                onClick={() => setVisionAuto((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-semibold transition-all cursor-pointer",
                  visionAuto
                    ? "bg-cyan-500 text-white"
                    : "bg-white/20 text-white hover:bg-white/30"
                )}
              >
                <RefreshCw className={cn("h-3.5 w-3.5", visionAuto && "animate-spin")} />
                Auto 10s
              </button>
              <button
                onClick={stopVision}
                className="ml-auto p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white cursor-pointer transition-colors"
                title="Fermer la vision"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
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

      {/* Call bar — status + 3 boutons */}
      <div className="bg-gray-50 border border-gray-200 rounded-b-lg px-3 py-2.5 -mt-2 space-y-2">
        {/* Status line */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-2 h-2 rounded-full shrink-0",
            visionMode ? "bg-cyan-500 animate-pulse" : isInCall ? "bg-green-500" : isConnecting ? "bg-amber-400 animate-pulse" : "bg-emerald-500"
          )} />
          <p className={cn("text-[9px] font-semibold leading-tight", visionMode ? "text-cyan-600" : isInCall ? "text-green-600" : isConnecting ? "text-amber-500" : "text-emerald-600")}>
            {visionMode ? "Vision active" : isInCall ? (isVideoCall ? "Vidéo en cours" : "En appel vocal") : isConnecting ? "Connexion..." : "Communiquez avec CarlOS"}
          </p>
          {isInCall && (
            <span className="text-[9px] font-mono text-green-600 ml-auto">{formatDuration(callDuration)}</span>
          )}
          {callState === "error" && (
            <span className="text-[9px] text-red-500 ml-auto truncate" title={errorMsg}>Erreur</span>
          )}
        </div>

        {/* 3 boutons: Discussion AI + Conférence AI + Vision AI */}
        <div className="grid grid-cols-3 gap-1.5">
          {/* Discutez Live — appel vocal */}
          <button
            onClick={isInCall ? endCall : () => startCall(false)}
            disabled={isConnecting}
            className={cn(
              "flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg font-medium text-[9px] transition-all cursor-pointer shadow-sm",
              isInCall
                ? "bg-red-500 text-white hover:bg-red-600 shadow-red-200"
                : isConnecting
                  ? "bg-blue-100 text-blue-400 cursor-wait"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
            )}
            title={isInCall ? "Raccrocher" : "Discussion AI avec CarlOS"}
          >
            {isConnecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            ) : isInCall ? (
              <PhoneOff className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Phone className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{isInCall ? "Raccrocher" : "Discussion AI"}</span>
          </button>

          {/* Conférence AI — Meeting LiveKit */}
          <button
            onClick={() => setActiveView("meeting-room")}
            className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg font-medium text-[9px] transition-all cursor-pointer shadow-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
            title="Conférence AI — Salle de réunion LiveKit"
          >
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>Conférence AI</span>
          </button>

          {/* Vision Rayban — Camera + Gemini Vision */}
          <button
            onClick={visionMode ? stopVision : startVision}
            disabled={isConnecting || isInCall}
            className={cn(
              "flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg font-medium text-[9px] transition-all cursor-pointer shadow-sm",
              visionMode
                ? "bg-red-500 text-white hover:bg-red-600 shadow-red-200"
                : isConnecting
                  ? "bg-cyan-100 text-cyan-400 cursor-wait"
                  : isInCall
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-200"
            )}
            title="Vision AI"
          >
            <Glasses className="h-3.5 w-3.5 shrink-0" />
            <span>{visionMode ? "Fermer" : "Vision AI"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
