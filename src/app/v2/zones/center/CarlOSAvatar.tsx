/**
 * CarlOSAvatar.tsx — Avatar video CarlOS
 * Photo statique quand silencieux, animation quand il parle (TTS)
 * Pret pour Tavus embed quand TAVUS_API_KEY sera configure
 * D-079 — Avatar video CarlOS pour demos + site web
 * Sprint B — Task 7
 */

import { useState, useEffect, useRef } from "react";
import {
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Mic,
  Radio,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster } from "../../context/FrameMasterContext";

// Config avatar par bot — chemin photo + couleur dominante
const AVATAR_CONFIG: Record<string, { photo: string; name: string; role: string; color: string; glowColor: string }> = {
  BCO: { photo: "/agents/CEO - Carlos AI.png", name: "CarlOS", role: "CEO", color: "blue", glowColor: "rgba(59, 130, 246, 0.5)" },
  BCT: { photo: "/agents/CTO Thomas AI.png", name: "Thomas", role: "CTO", color: "violet", glowColor: "rgba(139, 92, 246, 0.5)" },
  BCF: { photo: "/agents/CFO - François AI.png", name: "Francois", role: "CFO", color: "emerald", glowColor: "rgba(16, 185, 129, 0.5)" },
  BCM: { photo: "/agents/Sofia - CMO2.png", name: "Sofia", role: "CMO", color: "pink", glowColor: "rgba(236, 72, 153, 0.5)" },
  BCS: { photo: "/agents/CSO - Marc.png", name: "Marc", role: "CSO", color: "red", glowColor: "rgba(239, 68, 68, 0.5)" },
  BOO: { photo: "/agents/COO - Lise2.png", name: "Lise", role: "COO", color: "orange", glowColor: "rgba(249, 115, 22, 0.5)" },
  BFA: { photo: "/agents/CEO - Carlos AI.png", name: "FactoryBot", role: "Factory", color: "slate", glowColor: "rgba(100, 116, 139, 0.5)" },
  BHR: { photo: "/agents/David - CHRO.png", name: "David", role: "CHRO", color: "teal", glowColor: "rgba(20, 184, 166, 0.5)" },
  BIO: { photo: "/agents/Hélène - CIO.png", name: "Helene", role: "CIO", color: "cyan", glowColor: "rgba(6, 182, 212, 0.5)" },
  BCC: { photo: "/agents/CCO - Émilie2.png", name: "Emilie", role: "CCO", color: "rose", glowColor: "rgba(244, 63, 94, 0.5)" },
  BPO: { photo: "/agents/CPO - Alex2.png", name: "Alex", role: "CPO", color: "fuchsia", glowColor: "rgba(217, 70, 239, 0.5)" },
  BRO: { photo: "/agents/CRO - Julien2.png", name: "Julien", role: "CRO", color: "amber", glowColor: "rgba(245, 158, 11, 0.5)" },
  BLE: { photo: "/agents/CLO - Isabelle3.png", name: "Isabelle", role: "Legal", color: "indigo", glowColor: "rgba(99, 102, 241, 0.5)" },
  BSE: { photo: "/agents/CEO - Carlos AI.png", name: "SecBot", role: "CISO", color: "zinc", glowColor: "rgba(113, 113, 122, 0.5)" },
};

interface Props {
  onClose: () => void;
}

export function CarlOSAvatar({ onClose }: Props) {
  const { messages, isTyping, autoTTSEnabled, toggleAutoTTS } = useChatContext();
  const { activeBotCode } = useFrameMaster();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const animFrame = useRef<number>(0);

  const config = AVATAR_CONFIG[activeBotCode] || AVATAR_CONFIG.BCO;

  // Detecter si speechSynthesis est en train de parler
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const checkSpeaking = () => {
      const speaking = window.speechSynthesis.speaking;
      setIsSpeaking(speaking);

      // Simuler un niveau audio pour l'animation (random smooth)
      if (speaking) {
        setAudioLevel((prev) => {
          const target = 0.3 + Math.random() * 0.7;
          return prev + (target - prev) * 0.3;
        });
      } else {
        setAudioLevel((prev) => prev * 0.8);
      }

      animFrame.current = requestAnimationFrame(checkSpeaking);
    };

    animFrame.current = requestAnimationFrame(checkSpeaking);
    return () => cancelAnimationFrame(animFrame.current);
  }, []);

  // Dernier message bot pour affichage
  const lastBotMsg = [...messages].reverse().find((m) => m.role === "assistant" && m.msgType !== "coaching");

  return (
    <div className={cn(
      "flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 transition-all duration-500",
      isExpanded ? "h-full" : "h-[320px] shrink-0"
    )}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/30">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75",
              isSpeaking ? "bg-green-400 animate-ping" : "bg-gray-500"
            )} />
            <span className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              isSpeaking ? "bg-green-500" : "bg-gray-500"
            )} />
          </span>
          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-widest">
            {config.name} — {config.role}
          </span>
          {isSpeaking && (
            <span className="text-[10px] text-green-400 font-medium animate-pulse">En train de parler...</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Auto-TTS toggle */}
          <button
            onClick={toggleAutoTTS}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer",
              autoTTSEnabled ? "text-green-400 bg-green-900/30" : "text-white/40 hover:text-white/70"
            )}
            title={autoTTSEnabled ? "Desactiver la voix auto" : "Activer la voix auto"}
          >
            {autoTTSEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          {/* Expand/collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-white/40 hover:text-white/70 rounded-lg transition-colors cursor-pointer"
            title={isExpanded ? "Reduire" : "Agrandir"}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white/70 rounded-lg transition-colors cursor-pointer"
            title="Fermer la video"
          >
            <VideoOff className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Avatar zone */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Ambient glow ring */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            background: isSpeaking
              ? `radial-gradient(circle at center, ${config.glowColor} 0%, transparent 70%)`
              : "none",
            opacity: isSpeaking ? 0.4 + audioLevel * 0.3 : 0,
            transition: "opacity 0.15s ease",
          }}
        />

        {/* Audio wave rings — visible when speaking */}
        {isSpeaking && (
          <>
            <div
              className="absolute rounded-full border border-white/10"
              style={{
                width: `${180 + audioLevel * 60}px`,
                height: `${180 + audioLevel * 60}px`,
                transition: "all 0.15s ease",
              }}
            />
            <div
              className="absolute rounded-full border border-white/5"
              style={{
                width: `${220 + audioLevel * 80}px`,
                height: `${220 + audioLevel * 80}px`,
                transition: "all 0.2s ease",
              }}
            />
            <div
              className="absolute rounded-full border border-white/[0.03]"
              style={{
                width: `${260 + audioLevel * 100}px`,
                height: `${260 + audioLevel * 100}px`,
                transition: "all 0.25s ease",
              }}
            />
          </>
        )}

        {/* Avatar photo — circular with glow */}
        <div className="relative z-10">
          <div
            className={cn(
              "w-40 h-40 rounded-full overflow-hidden border-4 transition-all duration-300",
              isSpeaking
                ? "border-green-400/60 shadow-2xl scale-105"
                : "border-white/20 shadow-lg"
            )}
            style={{
              boxShadow: isSpeaking
                ? `0 0 ${20 + audioLevel * 30}px ${config.glowColor}, 0 0 ${40 + audioLevel * 50}px ${config.glowColor}`
                : "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <img
              src={config.photo}
              alt={config.name}
              className={cn(
                "w-full h-full object-cover transition-transform duration-300",
                isSpeaking && "scale-[1.02]"
              )}
            />
          </div>

          {/* Status badge */}
          <div className={cn(
            "absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
            isSpeaking
              ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
              : isTyping
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                : "bg-gray-700 text-gray-300"
          )}>
            {isSpeaking ? (
              <><Radio className="h-3 w-3 animate-pulse" /> En direct</>
            ) : isTyping ? (
              <><Mic className="h-3 w-3 animate-pulse" /> Reflexion...</>
            ) : (
              <><Video className="h-3 w-3" /> En attente</>
            )}
          </div>
        </div>
      </div>

      {/* Sous-titre live — dernier message bot en apercu */}
      {lastBotMsg && (
        <div className="px-6 pb-3 text-center">
          <p className="text-white/60 text-xs leading-relaxed line-clamp-2">
            {lastBotMsg.content.slice(0, 200)}
            {lastBotMsg.content.length > 200 && "..."}
          </p>
        </div>
      )}

      {/* Barre audio visualizer */}
      <div className="flex items-end justify-center gap-[2px] h-6 px-4 pb-2">
        {Array.from({ length: 32 }).map((_, i) => {
          const barHeight = isSpeaking
            ? 3 + Math.sin(Date.now() / 200 + i * 0.5) * audioLevel * 16
            : 2;
          return (
            <div
              key={i}
              className={cn(
                "w-[3px] rounded-full transition-all duration-75",
                isSpeaking ? "bg-green-400/60" : "bg-white/10"
              )}
              style={{ height: `${Math.max(2, barHeight)}px` }}
            />
          );
        })}
      </div>
    </div>
  );
}
