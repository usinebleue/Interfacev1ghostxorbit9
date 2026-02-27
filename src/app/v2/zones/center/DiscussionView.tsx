/**
 * DiscussionView.tsx — Chat avec le bot actif
 * Titre discussion + Mode reflexion active (wireframe p.3)
 * Zone messages + indicateur CREDO + loading
 * Options cliquables apres chaque reponse du bot (arbre de pensee CREDO Trissocie)
 * Sprint A — Frame Master V2
 */

import { useRef, useEffect } from "react";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { BOT_EMOJI, CREDO_PHASES, REFLECTION_MODES } from "../../api/types";
import { cn } from "../../../components/ui/utils";
import { ArrowRight, GitBranch } from "lucide-react";

export function DiscussionView() {
  const { messages, isTyping, currentCREDOPhase, activeReflectionMode, sendMessage } =
    useChatContext();
  const { activeBotCode, activeBot } = useFrameMaster();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const botEmoji = BOT_EMOJI[activeBotCode] || "🤖";
  const botName = activeBot?.nom || "CarlOS";
  const activeMode = REFLECTION_MODES.find((m) => m.id === activeReflectionMode);

  // Quand l'utilisateur clique sur une option, on l'envoie comme message
  const handleOptionClick = (option: string) => {
    sendMessage(option, activeBotCode);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Titre de la discussion + mode de reflexion actif (wireframe p.3) */}
      <div className="px-4 py-2.5 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            Discussion : {botName}
          </span>
          {activeMode && (
            <Badge
              className={cn(
                "text-[10px] px-2",
                activeMode.color,
                "text-white"
              )}
            >
              {activeMode.label}
            </Badge>
          )}
        </div>

        {/* PHASES CREDO */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">CREDO:</span>
          {CREDO_PHASES.map((phase) => (
            <Badge
              key={phase.id}
              variant={currentCREDOPhase === phase.id ? "default" : "outline"}
              className={cn(
                "text-[10px] px-1.5",
                currentCREDOPhase === phase.id && phase.color + " text-white"
              )}
            >
              {phase.id}
            </Badge>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <span className="text-4xl block mb-4">{botEmoji}</span>
              <p className="text-sm font-medium">
                Commencez une conversation avec {botName}
              </p>
              <p className="text-xs mt-2 opacity-60 max-w-md mx-auto">
                Dans ses reponses, {botName} propose toujours des options pour
                creer un arbre de developpement de la pensee supporte par le
                protocole CREDO Trissocie. L'idee est d'isoler les idees et les
                developper en mode de branche.
              </p>
              <div className="flex items-center justify-center gap-1 mt-3 text-xs text-muted-foreground">
                <GitBranch className="h-3 w-3" />
                <span>Arbre de pensee CREDO</span>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={msg.id}>
              {/* Message bubble */}
              <div
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <span className="text-lg mt-1 shrink-0">{botEmoji}</span>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-2.5 max-w-[80%]",
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-muted border"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] opacity-60">
                      {msg.timestamp.toLocaleTimeString("fr-CA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.tier && (
                      <span className="text-[10px] opacity-40">{msg.tier}</span>
                    )}
                    {msg.latence_ms && (
                      <span className="text-[10px] opacity-40">
                        {msg.latence_ms}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Options cliquables — arbre de developpement de la pensee (wireframe p.3) */}
              {msg.role === "assistant" &&
                msg.options &&
                msg.options.length > 0 &&
                idx === messages.length - 1 && (
                  <div className="ml-9 mt-2 space-y-1.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <GitBranch className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Developper cette idee :
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.options.map((option, oi) => (
                        <Button
                          key={oi}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-3 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                          onClick={() => handleOptionClick(option)}
                          disabled={isTyping}
                        >
                          {option}
                          <ArrowRight className="ml-1 h-3 w-3 opacity-50" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <span className="text-lg mt-1">{botEmoji}</span>
              <div className="bg-muted border rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <Skeleton className="w-2 h-2 rounded-full animate-bounce" />
                  <Skeleton className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <Skeleton className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
