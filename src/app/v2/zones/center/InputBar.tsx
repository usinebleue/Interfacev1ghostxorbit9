/**
 * InputBar.tsx — Boite de dialogue en bas de la zone centrale
 * Layout : Textarea (grande) + Envoyer | Clip | Vocal Telephone Camera
 * CarlOS = Sherpa/GPS — il route automatiquement vers le bon mode
 * Sprint B — UX Sherpa
 */

import { useState, useRef, type KeyboardEvent } from "react";
import {
  Send,
  Paperclip,
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

  const botName = activeBot?.nom || "CarlOS";

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
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

      {/* Ligne 2 : Badge Sherpa — CarlOS route automatiquement */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Compass className="h-3 w-3" />
          <span>CarlOS pilote</span>
        </div>
        {activeReflectionMode && MODE_META[activeReflectionMode] && (() => {
          const meta = MODE_META[activeReflectionMode];
          const Icon = meta.icon;
          return (
            <span className={cn(
              "flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium text-white shadow-sm",
              meta.color
            )}>
              <Icon className="h-3 w-3" />
              {meta.label}
            </span>
          );
        })()}
      </div>
    </div>
  );
}
