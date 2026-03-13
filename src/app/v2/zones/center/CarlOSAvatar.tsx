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

// Config avatar par bot — originaux circuits neuronaux (fev 25) + Simone v2 validée
const AVATAR_CONFIG: Record<string, {
  photo: string;
  standby: string;
  name: string;
  role: string;
  color: string;
  glowColor: string;
  accentClass: string;
}> = {
  CEOB: { photo: `/agents/generated/ceo-carlos-profil-v3.png${IMG_V}`, standby: `/agents/generated/ceo-carlos-standby-v3.png${IMG_V}`, name: "CarlOS", role: "CEO", color: "blue", glowColor: "rgba(59, 130, 246, 0.6)", accentClass: "from-blue-600/30" },
  CTOB: { photo: `/agents/generated/cto-thierry-profil-v3.png${IMG_V}`, standby: `/agents/generated/cto-thierry-standby-v3.png${IMG_V}`, name: "Tim", role: "CTO", color: "violet", glowColor: "rgba(139, 92, 246, 0.6)", accentClass: "from-violet-600/30" },
  CFOB: { photo: `/agents/generated/cfo-francois-profil-v3.png${IMG_V}`, standby: `/agents/generated/cfo-francois-standby-v3.png${IMG_V}`, name: "Frank", role: "CFO", color: "emerald", glowColor: "rgba(16, 185, 129, 0.6)", accentClass: "from-emerald-600/30" },
  CMOB: { photo: `/agents/generated/cmo-martine-profil-v3.png${IMG_V}`, standby: `/agents/generated/cmo-martine-standby-v3.png${IMG_V}`, name: "Mathilde", role: "CMO", color: "pink", glowColor: "rgba(236, 72, 153, 0.6)", accentClass: "from-pink-600/30" },
  CSOB: { photo: `/agents/generated/cso-sophie-profil-v3.png${IMG_V}`, standby: `/agents/generated/cso-sophie-standby-v3.png${IMG_V}`, name: "Simone", role: "CSO", color: "red", glowColor: "rgba(239, 68, 68, 0.6)", accentClass: "from-red-600/30" },
  COOB: { photo: `/agents/generated/coo-olivier-profil-v3.png${IMG_V}`, standby: `/agents/generated/coo-olivier-standby-v3.png${IMG_V}`, name: "Olivier", role: "COO", color: "orange", glowColor: "rgba(249, 115, 22, 0.6)", accentClass: "from-orange-600/30" },
  CPOB: { photo: `/agents/generated/factory-bot-profil-v3.png${IMG_V}`, standby: `/agents/generated/factory-bot-standby-v3.png${IMG_V}`, name: "Paco", role: "CPO", color: "slate", glowColor: "rgba(100, 116, 139, 0.6)", accentClass: "from-slate-600/30" },
  CHROB: { photo: `/agents/generated/chro-helene-profil-v3.png${IMG_V}`, standby: `/agents/generated/chro-helene-standby-v3.png${IMG_V}`, name: "Hélène", role: "CHRO", color: "teal", glowColor: "rgba(20, 184, 166, 0.6)", accentClass: "from-teal-600/30" },
  CINOB: { photo: `/agents/generated/cino-ines-profil-v3.png${IMG_V}`, standby: `/agents/generated/cino-ines-standby-v3.png${IMG_V}`, name: "Inès", role: "CINO", color: "rose", glowColor: "rgba(244, 63, 94, 0.6)", accentClass: "from-rose-600/30" },
  CROB: { photo: `/agents/generated/cro-raphael-profil-v3.png${IMG_V}`, standby: `/agents/generated/cro-raphael-standby-v3.png${IMG_V}`, name: "Rich", role: "CRO", color: "amber", glowColor: "rgba(245, 158, 11, 0.6)", accentClass: "from-amber-600/30" },
  CLOB: { photo: `/agents/generated/clo-louise-profil-v3.png${IMG_V}`, standby: `/agents/generated/clo-louise-standby-v3.png${IMG_V}`, name: "Loulou", role: "CLO", color: "indigo", glowColor: "rgba(99, 102, 241, 0.6)", accentClass: "from-indigo-600/30" },
  CISOB: { photo: `/agents/generated/ciso-secbot-profil-v3.png${IMG_V}`, standby: `/agents/generated/ciso-secbot-standby-v3.png${IMG_V}`, name: "Sébastien", role: "CISO", color: "zinc", glowColor: "rgba(113, 113, 122, 0.6)", accentClass: "from-zinc-600/30" },
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

  const config = AVATAR_CONFIG[activeBotCode] || AVATAR_CONFIG.CEOB;

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

        {/* Gradient overlay bottom — pour lisibilité audio bars */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Gradient overlay top — pour lisibilité identité */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/50 to-transparent" />

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

      {/* ===== TOP LEFT: Identité agent (overlay sur l'image) ===== */}
      <div className="absolute top-0 left-0 z-20 px-3 py-2.5 flex items-start gap-2.5">
        {/* Photo profil ronde mini */}
        <div
          className={cn(
            "w-9 h-9 rounded-full overflow-hidden border-2 shrink-0 transition-all duration-300",
            isSpeaking ? "border-green-400/80" : "border-white/40"
          )}
          style={{
            boxShadow: isSpeaking
              ? `0 0 10px ${config.glowColor}`
              : "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          <img src={config.photo} alt={config.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col gap-0.5 pt-0.5">
          {/* Nom + Rôle */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75",
                isSpeaking ? "bg-green-400 animate-ping" : isTyping ? "bg-amber-400 animate-ping" : "bg-white/20"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                isSpeaking ? "bg-green-400" : isTyping ? "bg-amber-400" : "bg-white/40"
              )} />
            </span>
            <span className="text-[12px] font-bold text-white/95 uppercase tracking-wider drop-shadow-lg">
              {config.name}
            </span>
            <span className="text-[9px] font-semibold text-white/50 uppercase tracking-widest drop-shadow-md">
              {config.role}
            </span>
          </div>

          {/* Speaking / Thinking indicator */}
          {isSpeaking && (
            <span className="text-[9px] text-green-300 font-semibold animate-pulse drop-shadow-md flex items-center gap-1">
              <Radio className="h-2.5 w-2.5" /> En direct
            </span>
          )}
          {isTyping && !isSpeaking && (
            <span className="text-[9px] text-amber-300 font-semibold animate-pulse drop-shadow-md flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> Réflexion...
            </span>
          )}
          {!isSpeaking && !isTyping && (
            <span className="text-[9px] text-white/35 font-medium drop-shadow-md flex items-center gap-1">
              <Video className="h-2.5 w-2.5" /> En attente
            </span>
          )}
        </div>
      </div>

      {/* ===== TOP RIGHT: Contrôles ===== */}
      <div className="absolute top-0 right-0 z-20 px-2 py-2 flex items-center gap-1">
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

      {/* ===== CENTER: Profile photo flottante quand il parle ===== */}
      <div className="flex-1 relative z-10 flex items-center justify-center">
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

      {/* ===== BOTTOM: Audio visualizer pleine largeur ===== */}
      <div className="absolute bottom-0 inset-x-0 z-20 px-3 pb-2 pt-4">
        {/* Sous-titre compact — seulement quand il parle */}
        {isSpeaking && lastBotMsg && (
          <p className="text-white/60 text-[9px] leading-relaxed line-clamp-1 text-center drop-shadow-md px-6 mb-1.5">
            {lastBotMsg.content.slice(0, 120)}
            {lastBotMsg.content.length > 120 && "..."}
          </p>
        )}

        {/* Audio visualizer — pleine largeur, barres plus hautes */}
        <div className="flex items-end justify-center gap-[1.5px] h-8 w-full">
          {Array.from({ length: 60 }).map((_, i) => {
            const barHeight = isSpeaking
              ? 3 + Math.sin(Date.now() / 150 + i * 0.35) * audioLevel * 22
              : isTyping
                ? 2 + Math.sin(Date.now() / 500 + i * 0.25) * 4
                : 1.5;
            return (
              <div
                key={i}
                className={cn(
                  "rounded-full transition-all duration-75 shrink-0",
                  isSpeaking ? "bg-green-400/80" : isTyping ? "bg-amber-400/30" : "bg-white/8"
                )}
                style={{
                  height: `${Math.max(1.5, barHeight)}px`,
                  width: "2px",
                  boxShadow: isSpeaking && barHeight > 10
                    ? `0 0 4px ${config.glowColor.replace("0.6", "0.3")}`
                    : "none",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
