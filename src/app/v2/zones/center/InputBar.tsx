/**
 * InputBar.tsx — Boite de dialogue en bas de la zone centrale
 * Layout : Textarea (grande) + Envoyer | Clip | Vocal Telephone Camera
 * Ligne 2 : Modes de reflexion + separateur + raccourcis Productivite
 * Sprint A — Frame Master V2
 */

import { useState, useRef, type KeyboardEvent } from "react";
import {
  Send,
  Mic,
  Phone,
  Video,
  Paperclip,
  Swords,
  Lightbulb,
  Flame,
  Search,
  Scale,
  Map,
  Sparkles,
  Brain,
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

// Modes de reflexion avec icones (CREDO = mode par defaut, pas dans la liste)
const MODES: { id: ReflectionMode; label: string; icon: React.ElementType; color: string }[] = [
  { id: "debat", label: "Debat", icon: Swords, color: "bg-red-600" },
  { id: "brainstorm", label: "Brainstorm", icon: Lightbulb, color: "bg-yellow-500" },
  { id: "crise", label: "Crise", icon: Flame, color: "bg-orange-600" },
  { id: "analyse", label: "Analyse", icon: Search, color: "bg-green-600" },
  { id: "decision", label: "Decision", icon: Scale, color: "bg-purple-600" },
  { id: "strategie", label: "Strategie", icon: Map, color: "bg-indigo-600" },
  { id: "innovation", label: "Innov.", icon: Sparkles, color: "bg-pink-600" },
  { id: "deep", label: "Deep", icon: Brain, color: "bg-cyan-600" },
];

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
    setActiveView("discussion");
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

        {/* Separateur visuel */}
        <div className="w-px h-8 bg-gray-200 mb-1 shrink-0" />

        {/* Vocal / Telephone / Camera — au bout */}
        <div className="flex gap-0.5 mb-0.5 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Mic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Vocal</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Telephone</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Video className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Videoconference</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Ligne 2 : Modes de reflexion */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground shrink-0">
          Mode de reflexion
        </span>
        <div className="flex gap-1 flex-wrap">
          {MODES.map((mode) => {
            const active = activeReflectionMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setReflectionMode(mode.id)}
                className={cn(
                  "flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full transition-all font-medium",
                  active
                    ? mode.color + " text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <mode.icon className="h-3 w-3" />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
