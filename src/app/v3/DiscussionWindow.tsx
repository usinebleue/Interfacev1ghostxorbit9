/**
 * DiscussionWindow.tsx — Zone Discussion V3
 * Zone centrale — Header Brain Team modélisé + VRAI LiveChat V2
 * Architecture V3 — Intégration Backend
 *
 * Le header h-12 bleu UB est le design modélisé V3 (SimAmorcer L572-606).
 * Équipe active dynamique via activeRoster (ChatContext).
 * Le LiveChat V2 gère messages, input et streaming (sans son propre header).
 * BotCodeSync synchronise AmorcerContext → FrameMasterContext en amont.
 * ChatBox V3 = design Claude AI (SimAmorcer L676-754) branché sur sendMessage réel.
 */

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import {
  Bot, Atom, Plus, Send, ChevronUp,
  Phone, PhoneOff, Video, Glasses, Paperclip, Globe, Zap, Activity,
  Brain, Target, AlertTriangle, Scale, Sparkles, MessageSquare,
  Mic, MicOff, Loader2, Upload,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { LiveChat } from "../v2/zones/center/LiveChat";
import { useAmorcer } from "./AmorcerContext";
import { useChatContext } from "../v2/context/ChatContext";
import { BOT_AVATAR, BOT_NAME, BOT_ROLE } from "../v2/api/types";
import { api } from "../v2/api/client";
import {
  Room, RoomEvent, Track,
  type RemoteTrack, type RemoteTrackPublication,
  type Participant, type DisconnectReason,
} from "livekit-client";


// CREDO phase colors for PhaseBar dots
const CREDO_DOT: Record<string, { active: string; label: string }> = {
  C: { active: "bg-blue-500 text-white", label: "Connecter" },
  R: { active: "bg-purple-500 text-white", label: "Rechercher" },
  E: { active: "bg-amber-500 text-white", label: "Exposer" },
  D: { active: "bg-green-500 text-white", label: "Demontrer" },
  O: { active: "bg-red-500 text-white", label: "Obtenir" },
};

// Reflection mode badges
const MODE_BADGE: Record<string, { label: string; style: string }> = {
  analyse: { label: "Analyse", style: "bg-red-100 text-red-700" },
  brainstorm: { label: "Brainstorm", style: "bg-amber-100 text-amber-700" },
  decision: { label: "Decision", style: "bg-indigo-100 text-indigo-700" },
  crise: { label: "Crise", style: "bg-red-100 text-red-700" },
  strategie: { label: "Strategie", style: "bg-emerald-100 text-emerald-700" },
  debat: { label: "Debat", style: "bg-violet-100 text-violet-700" },
  innovation: { label: "Innovation", style: "bg-fuchsia-100 text-fuchsia-700" },
  deep: { label: "Deep Resonance", style: "bg-cyan-100 text-cyan-700" },
};

// ═══ PHASE BAR — indicateur CREDO + mode + flow type ═══
function PhaseBar() {
  const { currentCREDOPhase, currentMode, messages } = useChatContext();
  // Get bubbleContext from last bot message
  const lastBot = [...messages].reverse().find(m => m.role === "assistant" && m.bubbleContext);
  const bubbleCtx = lastBot?.bubbleContext;

  return (
    <div className="h-8 px-3 flex items-center gap-3 bg-gray-50 border-b border-gray-200 shrink-0">
      {/* CREDO dots */}
      <div className="flex items-center gap-1">
        {(["C","R","E","D","O"] as const).map(p => (
          <div
            key={p}
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] transition-colors",
              p === currentCREDOPhase
                ? CREDO_DOT[p].active
                : "bg-gray-200 text-gray-400"
            )}
            title={CREDO_DOT[p].label}
          >
            {p}
          </div>
        ))}
      </div>

      {/* Mode badge — visible quand mode != standard/credo */}
      {currentMode && currentMode !== "credo" && MODE_BADGE[currentMode] && (
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", MODE_BADGE[currentMode].style)}>
          {MODE_BADGE[currentMode].label}
        </span>
      )}

      {/* Flow indicator — DATA vs ACTION */}
      {bubbleCtx?.flow_type && (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-medium",
          bubbleCtx.flow_type === "action"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-500"
        )}>
          {bubbleCtx.flow_type === "action" ? `Action: ${bubbleCtx.flow_step || ""}` : "Consultation"}
        </span>
      )}
    </div>
  );
}

export function DiscussionWindow() {
  const { cockpitTab } = useAmorcer();
  const { activeRoster } = useChatContext();
  const isOrbit9 = cockpitTab === "orbit9";

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header UB_BLUE h-12 — design modélisé V3 */}
      <div className="h-12 px-3 shrink-0 flex items-center gap-2 bg-[#073E5A]">
        {isOrbit9 ? (
          <>
            <Atom className="h-4 w-4 text-white" />
            <span className="text-[11px] text-white font-medium">Orbit<sup className="text-[8px]">9</sup></span>
            <div className="flex-1" />
          </>
        ) : (
          <>
            <Bot className="h-4 w-4 text-white" />
            <span className="text-[11px] text-white font-medium">Brain Team</span>
            <div className="flex-1" />

            {/* Bot actif — affichage statique */}
            {activeRoster.slice(0, 1).map((code) => (
              <div key={code} className="flex items-center gap-1.5 ml-1">
                <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white/30 shrink-0">
                  <img src={BOT_AVATAR[code] || `/agents/${code.toLowerCase()}.png`} alt={BOT_NAME[code] || code} className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] text-white font-medium">{BOT_NAME[code] || code}</span>
                <span className="text-[9px] text-white/50">{BOT_ROLE[code] || ""}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* LiveChat réel — sans header, sans BotRosterBar (splitMode masque le roster interne) */}
      <div className="flex-1 overflow-hidden">
        <LiveChat splitMode hideHeader />
      </div>

      {/* ChatBox V3 — design Claude AI (SimAmorcer L676-754) branché sur sendMessage réel */}
      <ChatBoxV3 />
    </div>
  );
}

// ═══ CHATBOX V3 — DESIGN MODÉLISÉ (Style Claude AI) + BACKEND BRANCHÉ ═══

type CallState = "idle" | "connecting" | "connected" | "error";

const formatCallDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

function ChatBoxV3() {
  const [inputText, setInputText] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // visionInputRef retiré — Vision = app mobile (Ray-Ban Meta)
  const { sendMessage, injectVoiceMessage, newConversation } = useChatContext();
  const { activeBotCode, setRightSection } = useAmorcer();

  // ═══ VOICE CALL STATE ═══
  const [callState, setCallState] = useState<CallState>("idle");
  const [micOn, setMicOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const roomRef = useRef<Room | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCursorRef = useRef(0);
  const userHangupRef = useRef(false);
  const injectRef = useRef(injectVoiceMessage);
  injectRef.current = injectVoiceMessage;

  // Fermer menu attach si click extérieur
  useEffect(() => {
    if (!showAttachMenu) return;
    function handleClick(e: MouseEvent) {
      if (attachRef.current && !attachRef.current.contains(e.target as Node)) setShowAttachMenu(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAttachMenu]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ═══ VOICE POLLING ═══
  const startVoicePolling = useCallback((roomName: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollCursorRef.current = 0;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/v1/voice/events/${roomName}?cursor=${pollCursorRef.current}`,
          { headers: { "X-API-Key": import.meta.env.VITE_API_KEY || "" } }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.events?.length > 0) {
          for (const evt of data.events) {
            if (evt.type === "exchange") {
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

  // ═══ END CALL ═══
  const endCall = useCallback(() => {
    userHangupRef.current = true;
    if (roomRef.current) { roomRef.current.disconnect(); roomRef.current = null; }
    if (audioElRef.current) { audioElRef.current.srcObject = null; audioElRef.current.remove(); audioElRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    stopVoicePolling();
    setCallState("idle");
    setCallDuration(0);
    setMicOn(true);
  }, [stopVoicePolling]);

  // ═══ START CALL ═══
  const startCall = useCallback(async () => {
    if (callState === "connecting" || callState === "connected") return;
    setCallState("connecting");
    setCallDuration(0);
    newConversation();
    try {
      const tokenData = await api.voiceToken(activeBotCode, 1, false);
      const room = new Room({ adaptiveStream: true, dynacast: true, disconnectOnPageLeave: false });
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
          setTimeout(() => setCallState("idle"), 3000);
        } else {
          endCall();
        }
      });
      room.on(RoomEvent.Reconnecting, () => setCallState("connecting"));
      room.on(RoomEvent.Reconnected, () => setCallState("connected"));

      await room.connect(tokenData.livekit_url, tokenData.token);
      await room.localParticipant.setMicrophoneEnabled(true);
      setCallState("connected");

      // Connection sound (A major chord)
      try {
        const ac = new AudioContext();
        const t = ac.currentTime;
        [440, 554, 659].forEach((freq) => {
          const o = ac.createOscillator(); const g = ac.createGain();
          o.type = "sine"; o.frequency.value = freq;
          o.connect(g); g.connect(ac.destination);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.08, t + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
          o.start(t); o.stop(t + 0.9);
        });
      } catch { /* silent */ }

      startVoicePolling(tokenData.room_name);
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } catch (err) {
      console.error("[ChatBoxV3] Voice connection failed:", err);
      setCallState("error");
      setTimeout(() => setCallState("idle"), 3000);
    }
  }, [activeBotCode, callState, newConversation, endCall, startVoicePolling]);

  // ═══ TOGGLE MIC ═══
  const toggleMic = useCallback(async () => {
    if (roomRef.current && callState === "connected") {
      const next = !micOn;
      await roomRef.current.localParticipant.setMicrophoneEnabled(next);
      setMicOn(next);
    }
  }, [micOn, callState]);

  // ═══ VISION — Carlos Vision (Ray-Ban Meta / app mobile) ═══
  const [visionToast, setVisionToast] = useState(false);
  const handleVision = useCallback(() => {
    setVisionToast(true);
    setTimeout(() => setVisionToast(false), 3000);
  }, []);

  // ═══ FILE UPLOAD — pièce jointe → bureau upload ═══
  const handleFileUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setShowAttachMenu(false);
    setUploading(true);
    try {
      const result = await api.uploadBureauFile(file, file.name);
      sendMessage(`Fichier joint: ${result.titre || file.name}`, activeBotCode);
    } catch (err) {
      console.error("[ChatBoxV3] Upload error:", err);
    } finally {
      setUploading(false);
    }
  }, [sendMessage]);

  // ═══ TEXT HANDLERS ═══
  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    sendMessage(text, activeBotCode);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isInCall = callState === "connected" || callState === "connecting";
  const botName = BOT_NAME[activeBotCode] || "CarlOS";

  return (
    <div className="shrink-0 bg-white px-3 pb-2 pt-1">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
      {/* Vision toast — disponible dans l'app mobile */}
      {visionToast && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-4 py-2 rounded-full shadow-lg z-30 whitespace-nowrap">
          Carlos Vision sera disponible dans l&apos;app mobile
        </div>
      )}

      {/* Inline call bar — visible pendant un appel vocal */}
      {isInCall && (
        <div className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-2 mb-1.5 shadow-sm",
          callState === "connecting" ? "bg-amber-50 border border-amber-200" : "bg-blue-50 border border-blue-200"
        )}>
          {callState === "connecting" ? (
            <Loader2 className="h-3.5 w-3.5 text-amber-600 animate-spin" />
          ) : (
            <Phone className="h-3.5 w-3.5 text-blue-600" />
          )}
          <span className="text-xs font-medium text-gray-700 flex-1">
            {callState === "connecting" ? `Connexion à ${botName}...` : `Appel avec ${botName}`}
          </span>
          {callState === "connected" && (
            <span className="text-xs font-mono text-gray-500">{formatCallDuration(callDuration)}</span>
          )}
          {callState === "connected" && (
            <button onClick={toggleMic} className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer",
              micOn ? "text-gray-500 hover:bg-gray-100" : "bg-red-100 text-red-600"
            )} title={micOn ? "Couper le micro" : "Activer le micro"}>
              {micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
            </button>
          )}
          <button onClick={endCall} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer" title="Raccrocher">
            <PhoneOff className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="relative rounded-2xl border border-gray-300 bg-white shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Parle à CarlOS..."
          className="w-full text-sm px-4 pt-3 pb-2 rounded-t-2xl border-0 focus:outline-none min-h-[70px] resize-none bg-transparent"
          rows={3}
        />
        {/* Barre de boutons intégrée en bas de la box */}
        <div className="flex items-center gap-1 px-2 pb-2">
          {/* Menu + (pièce jointe, Drive, GitHub, connecteurs) */}
          <div className="relative" ref={attachRef}>
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={cn("p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer", uploading && "pointer-events-none")}
              title="Ajouter"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </button>
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-1 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-20">
                <button onClick={() => { setShowAttachMenu(false); fileInputRef.current?.click(); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                  <Paperclip className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-700">Pièce jointe</span>
                </button>
                <button onClick={() => setShowAttachMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                  <Globe className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-gray-700">Depuis Google Drive</span>
                </button>
                <button onClick={() => setShowAttachMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                  <Zap className="h-4 w-4 text-gray-700" />
                  <span className="text-xs text-gray-700">Depuis GitHub</span>
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => setShowAttachMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                  <Activity className="h-4 w-4 text-indigo-500" />
                  <div>
                    <span className="text-xs text-gray-700">Connecteurs API</span>
                    <span className="block text-xs text-gray-400">Intégrez vos logiciels SaaS</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* 3 modes: Discussion, Conférence, Vision — BRANCHÉS */}
          <button
            onClick={isInCall ? endCall : startCall}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              isInCall ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            )}
            title={isInCall ? "Raccrocher" : "Discussion vocale"}
          >
            {callState === "connecting" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isInCall ? <PhoneOff className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
            <span className="hidden lg:inline">{isInCall ? "Raccrocher" : "Discussion"}</span>
          </button>
          <button
            onClick={() => setRightSection("conferenceai")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            title="Réunion AI"
          >
            <Video className="h-3.5 w-3.5" /><span className="hidden lg:inline">Réunion</span>
          </button>
          <button
            onClick={handleVision}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer bg-cyan-50 text-cyan-600 hover:bg-cyan-100"
            title="Vision Ray-Ban"
          >
            <Glasses className="h-3.5 w-3.5" /><span className="hidden lg:inline">Vision</span>
          </button>

          <div className="flex-1" />

          {/* Bouton Envoyer — apparaît quand il y a du texte */}
          <button
            onClick={handleSend}
            className={cn(
              "p-2 rounded-lg transition-all cursor-pointer",
              inputText.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                : "bg-gray-100 text-gray-300 cursor-default"
            )}
            title="Envoyer"
            disabled={!inputText.trim()}
          >
            {inputText.trim() ? <ChevronUp className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {/* Disclaimer */}
      <p className="text-center text-xs text-gray-400 mt-1.5">
        Brain Team est une équipe d&apos;agents IA et peut faire des erreurs. Veuillez vérifier les réponses.
      </p>
    </div>
  );
}

