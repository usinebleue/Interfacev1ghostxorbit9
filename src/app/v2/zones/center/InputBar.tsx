/**
 * InputBar.tsx — Boite de dialogue en bas de la zone centrale
 * Layout : Textarea (grande) + Envoyer | Clip | Vocal Telephone Camera
 * CarlOS = Sherpa/GPS — il route automatiquement vers le bon mode
 * Sprint B — UX Sherpa
 */

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Swords,
  Lightbulb,
  Flame,
  Search,
  Scale,
  Map,
  Sparkles,
  Brain,
  Compass,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../../components/ui/tooltip";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { ReflectionMode } from "../../api/types";
import { cn } from "../../../components/ui/utils";
import { useSpeechToText } from "../../api/useVocal";

// Modes de reflexion — CarlOS route automatiquement (Sherpa GPS)
// L'utilisateur ne choisit PAS manuellement, mais on affiche le mode actif
const MODE_META: Partial<Record<ReflectionMode, { label: string; icon: React.ElementType; color: string }>> = {
  debat: { label: "Debat", icon: Swords, color: "bg-red-600" },
  brainstorm: { label: "Brainstorm", icon: Lightbulb, color: "bg-yellow-500" },
  crise: { label: "Crise", icon: Flame, color: "bg-orange-600" },
  analyse: { label: "Analyse", icon: Search, color: "bg-green-600" },
  decision: { label: "Decision", icon: Scale, color: "bg-purple-600" },
  strategie: { label: "Strategie", icon: Map, color: "bg-indigo-600" },
  innovation: { label: "Innov.", icon: Sparkles, color: "bg-pink-600" },
  deep: { label: "Deep", icon: Brain, color: "bg-cyan-600" },
};

export function InputBar() {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isTyping, activeReflectionMode, setReflectionMode } =
    useChatContext();
  const { activeBotCode, activeBot, setActiveView } = useFrameMaster();
  const stt = useSpeechToText();

  const botName = activeBot?.nom || "CarlOS";

  // Quand le transcript change, injecter dans le textarea
  useEffect(() => {
    if (stt.fullTranscript) {
      setText(stt.fullTranscript);
    }
  }, [stt.fullTranscript]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    // Arreter l'ecoute micro si active
    if (stt.isListening) stt.stopListening();
    stt.clearTranscript();
    setActiveView("live-chat");
    sendMessage(trimmed, activeBotCode);
    setText("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-white px-4 py-3 shrink-0 space-y-2 min-h-[136px]">
      {/* Ligne 1 : Textarea + Envoyer | Clip | Vocal/Tel/Cam */}
      <div className="flex items-end gap-3">
        {/* Textarea + Envoyer ensemble */}
        <div className="flex-1 flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Exprime une tension, lance une idee, pose une question a ${botName}...`}
            className="min-h-[72px] max-h-[180px] resize-none flex-1 text-sm"
            rows={3}
            disabled={isTyping}
          />
          <Button
            size="icon"
            className="h-10 w-10 bg-blue-600 hover:bg-blue-700 shrink-0 mb-0.5"
            onClick={handleSend}
            disabled={!text.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Micro — Speech-to-Text */}
        {stt.isSupported && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 mb-0.5 shrink-0 transition-all",
                  stt.isListening && "bg-red-50 text-red-600 hover:bg-red-100 ring-2 ring-red-300 animate-pulse"
                )}
                onClick={stt.toggleListening}
                disabled={isTyping}
              >
                {stt.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{stt.isListening ? "Arreter l'ecoute" : "Parler a " + botName}</TooltipContent>
          </Tooltip>
        )}

        {/* Clip (piece jointe) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 mb-0.5 shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Joindre un fichier</TooltipContent>
        </Tooltip>
      </div>

      {/* Indicateur micro actif */}
      {stt.isListening && (
        <div className="flex items-center gap-2 text-xs text-red-600 animate-in fade-in duration-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          Ecoute en cours... parle naturellement
          {stt.interimTranscript && (
            <span className="text-gray-400 italic truncate max-w-[200px]">{stt.interimTranscript}</span>
          )}
        </div>
      )}
      {stt.error && (
        <div className="text-xs text-red-500">{stt.error}</div>
      )}

      {/* Ligne 2 : Modes de reflexion cliquables */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(Object.entries(MODE_META) as [ReflectionMode, { label: string; icon: React.ElementType; color: string }][]).map(
          ([mode, meta]) => {
            const Icon = meta.icon;
            const isActive = activeReflectionMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setReflectionMode(isActive ? null : mode)}
                className={cn(
                  "flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer",
                  isActive
                    ? cn("text-white shadow-sm", meta.color)
                    : "text-gray-500 bg-gray-100 hover:bg-gray-200"
                )}
              >
                <Icon className="h-3 w-3" />
                {meta.label}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}
