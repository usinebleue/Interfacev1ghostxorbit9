"use client";

/**
 * LiveChat.tsx — Chat reel avec CarlOS via l'API REST
 * Pas de simulation — chaque message part au backend et revient.
 * Sprint A — Frame Master V2
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Loader2,
  ArrowLeft,
  Zap,
  Brain,
  Scale,
  AlertTriangle,
  Target,
  Sparkles,
  MessageSquare,
  Bot,
  Clock,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { sendMessage, type ChatResponse } from "./carlosApi";

// ══════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  agent?: string;
  tier?: string;
  modele?: string;
  latence_ms?: number;
  cout_usd?: number;
  timestamp: Date;
}

const MODE_CONFIG: Record<string, { label: string; icon: typeof Zap; color: string }> = {
  analyse: { label: "Analyse", icon: Zap, color: "text-red-500" },
  brainstorm: { label: "Brainstorm", icon: Brain, color: "text-amber-500" },
  decision: { label: "Decision", icon: Scale, color: "text-indigo-500" },
  crise: { label: "Crise", icon: AlertTriangle, color: "text-red-600" },
  strategie: { label: "Strategie", icon: Target, color: "text-emerald-500" },
  debat: { label: "Debat", icon: MessageSquare, color: "text-violet-500" },
  innovation: { label: "Innovation", icon: Sparkles, color: "text-fuchsia-500" },
  deep_resonance: { label: "Deep Resonance", icon: Brain, color: "text-cyan-500" },
};

const AGENT_NAMES: Record<string, { name: string; color: string }> = {
  BCO: { name: "CarlOS", color: "text-blue-600" },
  BCF: { name: "CFO Bot", color: "text-emerald-600" },
  BCT: { name: "CTO Bot", color: "text-purple-600" },
  BOO: { name: "COO Bot", color: "text-orange-600" },
  BCM: { name: "CMO Bot", color: "text-pink-600" },
  BCS: { name: "CSO Bot", color: "text-red-600" },
  BRO: { name: "CRO Bot", color: "text-amber-600" },
  BHR: { name: "CHRO Bot", color: "text-teal-600" },
  BSE: { name: "CISO Bot", color: "text-zinc-600" },
  BLE: { name: "CLO Bot", color: "text-indigo-600" },
  BPO: { name: "CINO Bot", color: "text-fuchsia-600" },
  BFA: { name: "CPO Bot", color: "text-slate-600" },
};

// ══════════════════════════════════════════════
// Markdown-light formatter for bot responses
// ══════════════════════════════════════════════

function formatBotText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^[━─═]+$/gm, '<hr class="my-2 border-gray-200">')
    .replace(/\n/g, '<br>');
}

// ══════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════

export function LiveChat({
  initialMode = "analyse",
  onBack,
}: {
  initialMode?: string;
  onBack?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode] = useState(initialMode);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const modeInfo = MODE_CONFIG[mode] || MODE_CONFIG.analyse;
  const ModeIcon = modeInfo.icon;

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setError(null);

    // Add user message
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const resp: ChatResponse = await sendMessage(text, {
        mode,
        direct: true,
        userId: 1,
      });

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: "bot",
        text: resp.response,
        agent: resp.agent,
        tier: resp.tier,
        modele: resp.modele,
        latence_ms: resp.latence_ms,
        cout_usd: resp.cout_usd,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, isLoading, mode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center")}>
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
              CarlOS
              <span className={cn("text-xs font-normal flex items-center gap-1", modeInfo.color)}>
                <ModeIcon className="h-3 w-3" /> {modeInfo.label}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Pipeline GHML — Reponses en direct
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-green-600 font-medium">LIVE</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-4 pb-4">

          {/* Empty state */}
          {messages.length === 0 && !isLoading && (
            <div className="flex justify-center py-20">
              <div className="text-center space-y-4 max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <ModeIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Mode {modeInfo.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Decris ta tension ou ton probleme. CarlOS et ses specialistes analysent en temps reel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3", msg.role === "user" && "justify-end")}>
              {msg.role === "bot" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={cn(
                "rounded-xl px-4 py-3 shadow-sm max-w-[85%]",
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-white border rounded-tl-none border-l-[3px] border-l-blue-500"
              )}>
                {msg.role === "bot" && msg.agent && (
                  <div className={cn("text-xs mb-1.5 font-medium", AGENT_NAMES[msg.agent]?.color || "text-blue-600")}>
                    {AGENT_NAMES[msg.agent]?.name || msg.agent}
                  </div>
                )}
                {msg.role === "bot" ? (
                  <div
                    className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatBotText(msg.text) }}
                  />
                ) : (
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                )}
                {msg.role === "bot" && (
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
                    {msg.tier && <span>{msg.tier}</span>}
                    {msg.modele && <span>{msg.modele}</span>}
                    {msg.latence_ms !== undefined && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" /> {(msg.latence_ms / 1000).toFixed(1)}s
                      </span>
                    )}
                    {msg.cout_usd !== undefined && msg.cout_usd > 0 && (
                      <span>${msg.cout_usd.toFixed(4)}</span>
                    )}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0 text-xs font-bold text-gray-600">
                  CF
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-blue-500">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  CarlOS reflechit...
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t bg-white px-4 py-3 shrink-0">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Decris ta tension ou pose ta question..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ minHeight: 42, maxHeight: 120 }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer",
              input.trim() && !isLoading
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                : "bg-gray-100 text-gray-400"
            )}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
