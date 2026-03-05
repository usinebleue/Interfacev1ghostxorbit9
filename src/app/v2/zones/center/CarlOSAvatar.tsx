/**
 * CarlOSAvatar.tsx — Avatar AI Premium
 * Image 16:9 standby NanoBanana + animations audio quand il parle
 * Profile photo ronde en overlay quand actif
 * D-079 — Avatar video CarlOS pour demos + site web
 * V2 — Mars 2026 — NanoBanana generated images
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
  Sparkles,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster } from "../../context/FrameMasterContext";

// Cache-bust (incrementer apres chaque changement d'images)
// PROTOCOLE: pour changer une image → modifier ICI + VideoCallWidget.tsx BOT_STANDBY + LiveChat.tsx BOT_COLORS + types.ts BOT_AVATAR
const IMG_V = "?v=5";

// Config avatar par bot — originaux circuits neuronaux (fev 25) + Sophie v2 validée
const AVATAR_CONFIG: Record<string, {
  photo: string;
  standby: string;
  name: string;
  role: string;
  color: string;
  glowColor: string;
  accentClass: string;
}> = {
  BCO: { photo: `/agents/generated/ceo-carlos-profil-v3.png${IMG_V}`, standby: `/agents/generated/ceo-carlos-standby-v3.png${IMG_V}`, name: "CarlOS", role: "CEO", color: "blue", glowColor: "rgba(59, 130, 246, 0.6)", accentClass: "from-blue-600/30" },
  BCT: { photo: `/agents/generated/cto-thierry-profil-v3.png${IMG_V}`, standby: `/agents/generated/cto-thierry-standby-v3.png${IMG_V}`, name: "Thierry", role: "CTO", color: "violet", glowColor: "rgba(139, 92, 246, 0.6)", accentClass: "from-violet-600/30" },
  BCF: { photo: `/agents/generated/cfo-francois-profil-v3.png${IMG_V}`, standby: `/agents/generated/cfo-francois-standby-v3.png${IMG_V}`, name: "François", role: "CFO", color: "emerald", glowColor: "rgba(16, 185, 129, 0.6)", accentClass: "from-emerald-600/30" },
  BCM: { photo: `/agents/generated/cmo-martine-profil-v3.png${IMG_V}`, standby: `/agents/generated/cmo-martine-standby-v3.png${IMG_V}`, name: "Martine", role: "CMO", color: "pink", glowColor: "rgba(236, 72, 153, 0.6)", accentClass: "from-pink-600/30" },
  BCS: { photo: `/agents/generated/cso-sophie-profil-v3.png${IMG_V}`, standby: `/agents/generated/cso-sophie-standby-v3.png${IMG_V}`, name: "Sophie", role: "CSO", color: "red", glowColor: "rgba(239, 68, 68, 0.6)", accentClass: "from-red-600/30" },
  BOO: { photo: `/agents/generated/coo-olivier-profil-v3.png${IMG_V}`, standby: `/agents/generated/coo-olivier-standby-v3.png${IMG_V}`, name: "Olivier", role: "COO", color: "orange", glowColor: "rgba(249, 115, 22, 0.6)", accentClass: "from-orange-600/30" },
  BFA: { photo: `/agents/generated/factory-bot-profil-v3.png${IMG_V}`, standby: `/agents/generated/factory-bot-standby-v3.png${IMG_V}`, name: "Fabien", role: "CPO", color: "slate", glowColor: "rgba(100, 116, 139, 0.6)", accentClass: "from-slate-600/30" },
  BHR: { photo: `/agents/generated/chro-helene-profil-v3.png${IMG_V}`, standby: `/agents/generated/chro-helene-standby-v3.png${IMG_V}`, name: "Hélène", role: "CHRO", color: "teal", glowColor: "rgba(20, 184, 166, 0.6)", accentClass: "from-teal-600/30" },
  BIO: { photo: `/agents/generated/cino-ines-profil-v3.png${IMG_V}`, standby: `/agents/generated/cino-ines-standby-v3.png${IMG_V}`, name: "Inès", role: "CINO", color: "rose", glowColor: "rgba(244, 63, 94, 0.6)", accentClass: "from-rose-600/30" },
  BCC: { photo: `/agents/generated/cco-catherine-profil-v3.png${IMG_V}`, standby: `/agents/generated/cco-catherine-standby-v3.png${IMG_V}`, name: "Catherine", role: "CCO", color: "cyan", glowColor: "rgba(6, 182, 212, 0.6)", accentClass: "from-cyan-600/30" },
  BPO: { photo: `/agents/generated/cpo-philippe-profil-v3.png${IMG_V}`, standby: `/agents/generated/cpo-philippe-standby-v3.png${IMG_V}`, name: "Philippe", role: "CPO", color: "fuchsia", glowColor: "rgba(217, 70, 239, 0.6)", accentClass: "from-fuchsia-600/30" },
  BRO: { photo: `/agents/generated/cro-raphael-profil-v3.png${IMG_V}`, standby: `/agents/generated/cro-raphael-standby-v3.png${IMG_V}`, name: "Raphaël", role: "CRO", color: "amber", glowColor: "rgba(245, 158, 11, 0.6)", accentClass: "from-amber-600/30" },
  BLE: { photo: `/agents/generated/clo-louise-profil-v3.png${IMG_V}`, standby: `/agents/generated/clo-louise-standby-v3.png${IMG_V}`, name: "Louise", role: "CLO", color: "indigo", glowColor: "rgba(99, 102, 241, 0.6)", accentClass: "from-indigo-600/30" },
  BSE: { photo: `/agents/generated/ciso-secbot-profil-v3.png${IMG_V}`, standby: `/agents/generated/ciso-secbot-standby-v3.png${IMG_V}`, name: "Sébastien", role: "CISO", color: "zinc", glowColor: "rgba(113, 113, 122, 0.6)", accentClass: "from-zinc-600/30" },
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

      if (speaking) {
        setAudioLevel((prev) => {
          const target = 0.3 + Math.random() * 0.7;
          return prev + (target - prev) * 0.3;
        });
      } else {
        setAudioLevel((prev) => prev * 0.85);
      }

      animFrame.current = requestAnimationFrame(checkSpeaking);
    };

    animFrame.current = requestAnimationFrame(checkSpeaking);
    return () => cancelAnimationFrame(animFrame.current);
  }, []);

  // Dernier message bot pour sous-titre
  const lastBotMsg = [...messages].reverse().find((m) => m.role === "assistant" && m.msgType !== "coaching");

  return (
    <div className={cn(
      "flex flex-col transition-all duration-500 relative overflow-hidden",
      isExpanded ? "h-full" : "h-[320px] shrink-0"
    )}>

      {/* ===== BACKGROUND: Image standby 16:9 ===== */}
      <div className="absolute inset-0 z-0">
        <img
          src={config.standby}
          alt={`${config.name} — ${config.role}`}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            isSpeaking && "scale-[1.03] brightness-110",
            isTyping && !isSpeaking && "brightness-90",
            !isSpeaking && !isTyping && "brightness-75"
          )}
        />

        {/* Gradient overlay bottom — pour lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Color accent overlay top — couleur du bot */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b to-transparent transition-opacity duration-500",
          config.accentClass,
          isSpeaking ? "opacity-60" : "opacity-20"
        )} />

        {/* Speaking glow pulse sur les bords */}
        {isSpeaking && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{
              boxShadow: `inset 0 0 ${30 + audioLevel * 40}px ${config.glowColor}, inset 0 0 ${60 + audioLevel * 80}px ${config.glowColor.replace("0.6", "0.2")}`,
              opacity: 0.5 + audioLevel * 0.3,
            }}
          />
        )}
      </div>

      {/* ===== TOOLBAR ===== */}
      <div className="relative z-20 flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          {/* Status indicator */}
          <span className="relative flex h-2.5 w-2.5">
            <span className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75",
              isSpeaking ? "bg-green-400 animate-ping" : isTyping ? "bg-amber-400 animate-ping" : "bg-white/30"
            )} />
            <span className={cn(
              "relative inline-flex rounded-full h-2.5 w-2.5",
              isSpeaking ? "bg-green-400" : isTyping ? "bg-amber-400" : "bg-white/40"
            )} />
          </span>

          {/* Bot name + role */}
          <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest drop-shadow-md">
            {config.name} — {config.role}
          </span>

          {/* Speaking indicator */}
          {isSpeaking && (
            <span className="text-[10px] text-green-300 font-semibold animate-pulse drop-shadow-md flex items-center gap-1">
              <Radio className="h-3 w-3" /> En direct
            </span>
          )}
          {isTyping && !isSpeaking && (
            <span className="text-[10px] text-amber-300 font-semibold animate-pulse drop-shadow-md flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Réflexion...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleAutoTTS}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer",
              autoTTSEnabled ? "text-green-300 bg-green-500/20 backdrop-blur-sm" : "text-white/40 hover:text-white/70"
            )}
            title={autoTTSEnabled ? "Desactiver la voix auto" : "Activer la voix auto"}
          >
            {autoTTSEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-white/40 hover:text-white/70 rounded-lg transition-colors cursor-pointer"
            title={isExpanded ? "Reduire" : "Agrandir"}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white/70 rounded-lg transition-colors cursor-pointer"
            title="Fermer"
          >
            <VideoOff className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ===== CENTER: Profile photo flottante quand il parle ===== */}
      <div className="flex-1 relative z-10 flex items-center justify-center">
        {/* Profile photo — visible quand il parle ou réfléchit */}
        <div className={cn(
          "transition-all duration-500",
          isSpeaking || isTyping ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}>
          {/* Wave rings */}
          {isSpeaking && (
            <>
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none"
                style={{
                  width: `${130 + audioLevel * 50}px`,
                  height: `${130 + audioLevel * 50}px`,
                  borderColor: config.glowColor.replace("0.6", "0.15"),
                  transition: "all 0.15s ease",
                }}
              />
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none"
                style={{
                  width: `${160 + audioLevel * 70}px`,
                  height: `${160 + audioLevel * 70}px`,
                  borderColor: config.glowColor.replace("0.6", "0.08"),
                  transition: "all 0.2s ease",
                }}
              />
            </>
          )}

          {/* Profile circle */}
          <div
            className={cn(
              "w-24 h-24 rounded-full overflow-hidden border-[3px] transition-all duration-300 relative",
              isSpeaking
                ? "border-green-400/70 shadow-2xl"
                : "border-white/30 shadow-lg"
            )}
            style={{
              boxShadow: isSpeaking
                ? `0 0 ${15 + audioLevel * 25}px ${config.glowColor}, 0 0 ${35 + audioLevel * 45}px ${config.glowColor.replace("0.6", "0.3")}`
                : "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <img
              src={config.photo}
              alt={config.name}
              className={cn(
                "w-full h-full object-cover transition-transform duration-300",
                isSpeaking && "scale-[1.05]"
              )}
            />
          </div>
        </div>
      </div>

      {/* ===== BOTTOM: Sous-titre + Audio bars ===== */}
      <div className="relative z-20 px-4 pb-2 space-y-1.5">
        {/* Sous-titre — dernier message bot */}
        {lastBotMsg && (
          <p className="text-white/70 text-[11px] leading-relaxed line-clamp-2 text-center drop-shadow-md px-8">
            {lastBotMsg.content.slice(0, 200)}
            {lastBotMsg.content.length > 200 && "..."}
          </p>
        )}

        {/* Status badge central */}
        {!isSpeaking && !isTyping && (
          <div className="flex justify-center">
            <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-medium bg-white/5 backdrop-blur-sm rounded-full px-3 py-1">
              <Video className="h-3 w-3" /> En attente
            </div>
          </div>
        )}

        {/* Audio visualizer */}
        <div className="flex items-end justify-center gap-[2px] h-5">
          {Array.from({ length: 40 }).map((_, i) => {
            const barHeight = isSpeaking
              ? 2 + Math.sin(Date.now() / 180 + i * 0.4) * audioLevel * 14
              : isTyping
                ? 2 + Math.sin(Date.now() / 500 + i * 0.3) * 3
                : 1.5;
            return (
              <div
                key={i}
                className={cn(
                  "w-[2px] rounded-full transition-all duration-75",
                  isSpeaking ? "bg-green-400/70" : isTyping ? "bg-amber-400/30" : "bg-white/10"
                )}
                style={{ height: `${Math.max(1.5, barHeight)}px` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
