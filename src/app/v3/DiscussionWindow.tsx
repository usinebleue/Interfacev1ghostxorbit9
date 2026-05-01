/**
 * DiscussionWindow.tsx — Zone Discussion V3 (système unifié)
 *
 * Architecture:
 *   1. Header h-12 UB_BLUE — avatar bot actif, roster, AgentSelector (+)
 *   2. Messages — V3MessageList (rendu natif V3: bulles colorées par bot,
 *      options cliquables, streaming cursor, thinking steps, coaching sentinelle)
 *   3. Input — ChatBoxV3 (texte, voice call LiveKit, upload fichier)
 *   4. Accueil — DeptWelcomeScreen quand la discussion est vide
 *
 * Pipeline unique:
 *   AmorcerContext (activeBotCode) → BotCodeSync → FrameMasterContext
 *   ChatBoxV3 envoie sendMessage(text, activeBotCode) via ChatContext
 *   V3MessageList lit messages via ChatContext (même source unique)
 *
 * ZERO LiveChat V2. UN SEUL système de rendu. Pas de spaghetti.
 */

import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type ChangeEvent } from "react";
import {
  Bot, Atom, Plus, Send, ChevronUp, X, Check, ChevronDown, ChevronRight,
  Phone, PhoneOff, Video, Glasses, Paperclip, Globe, Zap, Activity,
  Brain, Target, AlertTriangle, Scale, Sparkles, MessageSquare,
  Mic, MicOff, Loader2, Upload, MessageCircle, Clock,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useAmorcer } from "./AmorcerContext";
import { useChatContext } from "../v2/context/ChatContext";
import { BOT_AVATAR, BOT_NAME, BOT_ROLE } from "../v2/api/types";
import { api } from "../v2/api/client";
import { BOT_CODES } from "./constants";
import { DEPT_DASH_ICON, DEPT_GRADIENT, BOT_DISPLAY, PHASE_COLORS } from "./sections/shared/dept-data";
import { DEPT_GREETING, DEPT_ACTIONS, ACTION_COLORS } from "./data/dept-welcome";
import {
  Room, RoomEvent, Track,
  type RemoteTrack, type RemoteTrackPublication,
  type Participant, type DisconnectReason,
} from "livekit-client";


// ═══ V3 BUBBLE PALETTE — couleurs par bot (1 source de vérité) ═══
const V3_STYLE: Record<string, { text: string; border: string; ring: string; bubble: string }> = {
  CEOB:  { text: "text-blue-700",    border: "border-blue-400",    ring: "ring-blue-300",    bubble: "bg-blue-50/40" },
  CTOB:  { text: "text-violet-700",  border: "border-violet-400",  ring: "ring-violet-300",  bubble: "bg-violet-50/40" },
  CFOB:  { text: "text-emerald-700", border: "border-emerald-400", ring: "ring-emerald-300", bubble: "bg-emerald-50/40" },
  CMOB:  { text: "text-pink-700",    border: "border-pink-400",    ring: "ring-pink-300",    bubble: "bg-pink-50/40" },
  CSOB:  { text: "text-red-700",     border: "border-red-400",     ring: "ring-red-300",     bubble: "bg-red-50/40" },
  COOB:  { text: "text-orange-700",  border: "border-orange-400",  ring: "ring-orange-300",  bubble: "bg-orange-50/40" },
  CPOB:  { text: "text-slate-700",   border: "border-slate-400",   ring: "ring-slate-300",   bubble: "bg-slate-50/40" },
  CHROB: { text: "text-teal-700",    border: "border-teal-400",    ring: "ring-teal-300",    bubble: "bg-teal-50/40" },
  CINOB: { text: "text-rose-700",    border: "border-rose-400",    ring: "ring-rose-300",    bubble: "bg-rose-50/40" },
  CROB:  { text: "text-amber-700",   border: "border-amber-400",   ring: "ring-amber-300",   bubble: "bg-amber-50/40" },
  CLOB:  { text: "text-indigo-700",  border: "border-indigo-400",  ring: "ring-indigo-300",  bubble: "bg-indigo-50/40" },
  CISOB: { text: "text-zinc-700",    border: "border-zinc-400",    ring: "ring-zinc-300",    bubble: "bg-zinc-50/40" },
};
const DEFAULT_STYLE = V3_STYLE.CEOB;

/** Markdown léger → HTML (bold, italic, code, listes, linebreaks) */
function formatMarkdown(text: string): string {
  if (!text) return "";
  let h = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Bold, italic, inline code
  h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/\*(.+?)\*/g, "<em>$1</em>");
  h = h.replace(/`(.+?)`/g, '<code class="text-xs bg-gray-100 px-1 py-0.5 rounded font-mono">$1</code>');
  // Bullet lists: lines starting with * or -
  h = h.replace(/^[\*\-]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  // Numbered lists: lines starting with 1. 2. etc
  h = h.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');
  // Line breaks (but not inside <li>)
  h = h.replace(/\n/g, "<br />");
  // Clean up <br /> before/after <li>
  h = h.replace(/<br \/><li/g, "<li").replace(/<\/li><br \/>/g, "</li>");
  return h;
}

// ═══ V3 MESSAGE LIST — Système unique de rendu des discussions ═══
// Gère: bulles V3, options cliquables, streaming, thinking, coaching, voice
function V3MessageList() {
  const { messages, isTyping, sendMessage, thinkingSteps, parkThread, activeRoster } = useChatContext();
  const { activeBotCode } = useAmorcer();
  const endRef = useRef<HTMLDivElement>(null);
  const isAnyStreaming = messages.some(m => m.isStreaming);

  // Dernier message bot (pour afficher les options seulement sur le dernier)
  const lastBotId = [...messages].reverse().find(m => m.role === "assistant" && !m.isStreaming)?.id;

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);
  useEffect(() => {
    if (!isAnyStreaming) return;
    const id = setInterval(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 250);
    return () => clearInterval(id);
  }, [isAnyStreaming]);

  // Option click — gère les cas spéciaux coaching + envoi standard
  const handleOption = useCallback((opt: string) => {
    if (isTyping) return;
    const lower = opt.toLowerCase();
    if (lower.includes("parker") && lower.includes("thread")) { parkThread(); return; }
    if (lower.includes("synthes") || lower.includes("synthét")) {
      sendMessage("Fais une synthèse structurée de notre discussion.", activeBotCode);
      return;
    }
    // Default: envoyer le texte de l'option au bot actif
    sendMessage(opt, activeBotCode);
  }, [isTyping, sendMessage, activeBotCode, parkThread]);

  return (
    <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
      {messages.map((msg) => {
        if (msg.role === "system") return null;
        if (msg.isStreaming && !msg.content) return null;

        const isUser = msg.role === "user";
        const botCode = msg.agent || activeBotCode || "CEOB";
        const s = V3_STYLE[botCode] || DEFAULT_STYLE;
        const isCoaching = msg.msgType === "coaching";
        const isLast = msg.id === lastBotId;

        // ── User bubble ──
        if (isUser) {
          return (
            <div key={msg.id} className="flex gap-2.5 justify-end">
              <div className="bg-blue-50 border border-blue-100 rounded-xl rounded-tr-none px-3.5 py-2.5 max-w-[80%] shadow-sm">
                <p className="text-sm text-blue-900 whitespace-pre-wrap">{msg.content}</p>
              </div>
              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 ring-2 ring-blue-300">
                <img src="/agents/carl-fugere.jpg" alt="Carl" className="w-full h-full object-cover" />
              </div>
            </div>
          );
        }

        // ── Coaching bubble (CarlOS sentinelle — style ambre) ──
        if (isCoaching) {
          return (
            <div key={msg.id} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 ring-amber-300 mt-0.5">
                <img src={BOT_AVATAR.CEOB} alt="CarlOS" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 max-w-[85%]">
                <div className="border-l-[3px] border-amber-400 border border-amber-200 rounded-xl rounded-tl-none px-3.5 py-2.5 shadow-sm bg-amber-50/40">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                    <span className="text-[11px] font-semibold text-amber-700">CarlOS — Sentinelle</span>
                  </div>
                  <p className="text-sm text-amber-800">{msg.content}</p>
                </div>
                {/* Options coaching */}
                {isLast && msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.options.map((opt, i) => (
                      <button key={i} onClick={() => handleOption(opt)}
                        className="text-[11px] px-3 py-1.5 rounded-full border border-amber-300 bg-white text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer font-medium">
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }

        // ── Bot bubble standard ──
        return (
          <div key={msg.id} className="flex gap-2.5">
            <div className={cn("w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 mt-0.5", s.ring)}>
              <img src={BOT_AVATAR[botCode] || `/agents/${botCode.toLowerCase()}.png`}
                alt={BOT_NAME[botCode] || botCode} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 max-w-[85%]">
              <div className={cn("border-l-[3px] border border-gray-200 rounded-xl rounded-tl-none px-3.5 py-2.5 shadow-sm", s.border, s.bubble)}>
                {/* Agent name + role */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={cn("text-[11px] font-semibold", s.text)}>{BOT_NAME[botCode] || botCode}</span>
                  <span className="text-[10px] text-gray-400">{BOT_ROLE[botCode] || ""}</span>
                </div>
                {/* Content — streaming OU formatted */}
                {msg.isStreaming ? (
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                    <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-text-bottom" />
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                )}
              </div>
              {/* Options — boutons cliquables (seulement sur le dernier message bot) */}
              {isLast && !msg.isStreaming && msg.options && msg.options.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.options.map((opt, i) => (
                    <button key={i} onClick={() => handleOption(opt)}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors cursor-pointer font-medium shadow-sm">
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Thinking steps — animation pendant la réflexion du bot (même pattern que ThinkingAnimation V2) */}
      {isTyping && thinkingSteps.length > 0 && (() => {
        const streamMsg = [...messages].reverse().find(m => m.role === "assistant" && m.isStreaming);
        const thinkBot = streamMsg?.agent || activeBotCode;
        const ts = V3_STYLE[thinkBot] || DEFAULT_STYLE;
        const botName = BOT_NAME[thinkBot] || "CarlOS";
        return (
          <div className="flex gap-2.5 animate-in fade-in duration-500">
            <div className={cn("w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 mt-0.5", ts.ring)}>
              <img src={BOT_AVATAR[thinkBot] || `/agents/${thinkBot.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
            </div>
            <div className={cn("border-l-[3px] border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 shadow-sm min-w-64", ts.border, ts.bubble)}>
              {/* Header — "{bot} réfléchit..." avec Brain pulse */}
              <div className={cn("text-xs font-semibold mb-2 flex items-center gap-1.5", ts.text)}>
                <Brain className="h-3 w-3 animate-pulse" />
                {botName} réfléchit...
              </div>
              <div className="space-y-1.5">
                {thinkingSteps.map((step, i) => {
                  const isActive = i === thinkingSteps.length - 1;
                  const isDone = i < thinkingSteps.length - 1;
                  return (
                    <div key={i} className={cn(
                      "flex items-center gap-2 text-sm transition-all duration-300",
                      isActive && ts.text,
                      isDone && "text-green-600 opacity-60",
                    )}>
                      {isActive && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
                      {isDone && <Check className="h-3.5 w-3.5 shrink-0" />}
                      <span className={cn(isDone && "line-through")}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Typing dots — quand le bot réfléchit sans thinking steps */}
      {isTyping && !isAnyStreaming && thinkingSteps.length === 0 && (() => {
        const ts = V3_STYLE[activeBotCode] || DEFAULT_STYLE;
        return (
          <div className="flex gap-2.5">
            <div className={cn("w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 mt-0.5", ts.ring)}>
              <img src={BOT_AVATAR[activeBotCode] || `/agents/${activeBotCode.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="border border-gray-200 rounded-xl rounded-tl-none px-3.5 py-3 shadow-sm bg-white">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        );
      })()}

      <div ref={endRef} />
    </div>
  );
}

// ═══ AGENT SELECTOR — dropdown d'ajout d'agents dans le header ═══
function AgentSelector({ activeRoster, addBotToRoster, removeBotFromRoster }: {
  activeRoster: string[];
  addBotToRoster: (code: string) => void;
  removeBotFromRoster: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        title="Ajouter un agent"
      >
        <Plus className="h-3 w-3 text-white/70" />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-30 max-h-[360px] overflow-auto">
          <div className="px-3 py-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Agents Brain Team</div>
          {BOT_CODES.map((code) => {
            const inRoster = activeRoster.includes(code);
            return (
              <button
                key={code}
                onClick={() => { inRoster ? removeBotFromRoster(code) : addBotToRoster(code); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-gray-200 shrink-0">
                  <img src={BOT_AVATAR[code] || `/agents/${code.toLowerCase()}.png`} alt={BOT_NAME[code]} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-gray-800 block truncate">{BOT_NAME[code]}</span>
                  <span className="text-[9px] text-gray-400 block truncate">{BOT_ROLE[code]}</span>
                </div>
                {inRoster && <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══ DEPT WELCOME SCREEN — accueil dynamique par département ═══
function DeptWelcomeScreen({ botCode, onAction, onResumeThread, threads }: {
  botCode: string;
  onAction: (text: string) => void;
  onResumeThread: (threadId: string) => void;
  threads: Array<{ id: string; title: string; primaryBot?: string; updatedAt?: string; status?: string; workPhase?: string }>;
}) {
  const DeptIcon = DEPT_DASH_ICON[botCode] || Bot;
  const gradient = DEPT_GRADIENT[botCode] || "from-blue-700 to-blue-500";
  const greeting = DEPT_GREETING[botCode] || "Comment puis-je t'aider?";
  const actions = DEPT_ACTIONS[botCode] || [];
  const botName = BOT_NAME[botCode] || "CarlOS";
  const botDisplay = BOT_DISPLAY[botCode];
  const recentThreads = threads.slice(0, 5);

  return (
    <div className="flex justify-center py-10">
      <div className="text-center space-y-5 max-w-lg w-full">
        {/* Bot icon with department gradient */}
        <div className={cn("inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br shadow-lg", gradient)}>
          <DeptIcon className="h-8 w-8 text-white" />
        </div>

        {/* Greeting */}
        <div>
          <h3 className="text-lg font-bold text-gray-800">{botName}</h3>
          {botDisplay && <p className="text-[10px] text-gray-400 font-medium mt-0.5">{botDisplay.role} — {botDisplay.dept}</p>}
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{greeting}</p>
        </div>

        {/* Action buttons — style pilules colorées (SuggestionsWelcome pattern) */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {actions.map((action) => {
              const colors = ACTION_COLORS[action.color] || ACTION_COLORS.blue;
              return (
                <button
                  key={action.label}
                  onClick={() => onAction(action.description)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border font-medium transition-colors cursor-pointer",
                    colors
                  )}
                >
                  <action.icon className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Recent threads — cards with CREDO phase indicator */}
        {recentThreads.length > 0 && (
          <div className="pt-4 text-left max-w-md mx-auto w-full">
            <div className="flex items-center gap-1.5 mb-3 px-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Reprendre une discussion</span>
            </div>
            <div className="space-y-2">
              {recentThreads.map((thread) => {
                // 5 phases de travail: discussion, reflexion, creation (conception), execution, retroaction
                // Default à "discussion" si la phase n'est pas définie (threads créés avant le feature)
                const phaseKey = thread.workPhase || "discussion";
                const phaseData = PHASE_COLORS[phaseKey as keyof typeof PHASE_COLORS] || PHASE_COLORS.discussion;
                // "parked" = état normal (thread mis de côté) — ne pas afficher. Seulement "Terminée" est pertinent.
                const statusLabel = thread.status === "completed" ? "Terminée" : null;
                const statusStyle = thread.status === "completed" ? "bg-green-100 text-green-600" : "";
                return (
                  <button
                    key={thread.id}
                    onClick={() => onResumeThread(thread.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer text-left group"
                  >
                    {/* Phase dot — seulement si la phase existe sur le thread */}
                    {phaseData ? (
                      <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", phaseData.dot)} title={phaseData.label} />
                    ) : (
                      <MessageCircle className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                    )}
                    {/* Thread info */}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-700 block truncate">{thread.title || "Discussion sans titre"}</span>
                      {(phaseData || statusLabel) && (
                        <div className="flex items-center gap-2 mt-0.5">
                          {phaseData && <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", phaseData.badge)}>{phaseData.label}</span>}
                          {statusLabel && (
                            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", statusStyle)}>{statusLabel}</span>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Arrow indicator */}
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export function DiscussionWindow() {
  const { cockpitTab, activeBotCode, activePhase, setActivePhase, setRightSection, setReflexionContext, setFocusType, setActiveDeliverable } = useAmorcer();
  const { activeRoster, addBotToRoster, removeBotFromRoster, messages, sendMessage, threads, resumeThread } = useChatContext();
  const isOrbit9 = cockpitTab === "orbit9";
  const isEmpty = messages.length === 0;

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

            {/* Agents du roster — avatars empilés */}
            <div className="flex items-center -space-x-1.5">
              {activeRoster.map((code) => (
                <div key={code} className="relative group">
                  <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-[#073E5A] shrink-0">
                    <img src={BOT_AVATAR[code] || `/agents/${code.toLowerCase()}.png`} alt={BOT_NAME[code] || code} className="w-full h-full object-cover" />
                  </div>
                  {/* Remove button on hover (sauf le premier = bot principal) */}
                  {activeRoster.indexOf(code) > 0 && (
                    <button
                      onClick={() => removeBotFromRoster(code)}
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title={`Retirer ${BOT_NAME[code]}`}
                    >
                      <X className="h-2 w-2" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Nom du bot principal */}
            {activeRoster.length > 0 && (
              <div className="flex items-center gap-1 ml-1">
                <span className="text-[9px] text-white font-medium">{BOT_NAME[activeRoster[0]] || activeRoster[0]}</span>
                {activeRoster.length > 1 && (
                  <span className="text-[9px] text-white/50">+{activeRoster.length - 1}</span>
                )}
              </div>
            )}

            {/* Bouton + pour ajouter un agent */}
            <AgentSelector
              activeRoster={activeRoster}
              addBotToRoster={addBotToRoster}
              removeBotFromRoster={removeBotFromRoster}
            />
          </>
        )}
      </div>

      {/* Zone principale: DeptWelcomeScreen quand vide, V3MessageList sinon */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isEmpty ? (
          <div className="flex-1 overflow-auto">
            <DeptWelcomeScreen
              botCode={activeBotCode}
              onAction={(text) => {
                sendMessage(text, activeBotCode);
                // Basculer le workspace du cockpit vers le contenu de phase
                setReflexionContext(text.substring(0, 80));
                setFocusType("chantier");
                setRightSection(null);
                setActivePhase("observation" as any);
              }}
              onResumeThread={(threadId) => {
                const thread = threads.find(t => t.id === threadId);
                const restoredPhase = resumeThread(threadId, activePhase);
                const phase = restoredPhase || "observation";
                const context = thread?.title || "";

                // Restaurer le contexte de réflexion (même logique que handleWorkAction)
                if (context) {
                  setReflexionContext(context);
                  setFocusType("chantier");
                }

                // Router vers la bonne vue workspace selon la phase du thread
                // Même pattern que handleWorkAction dans WorkspacePhasesPanel
                switch (phase) {
                  case "execution":
                    setActivePhase("execution" as any);
                    try { sessionStorage.setItem("bt_exec_tab_request", "live"); } catch {}
                    setRightSection("execution");
                    break;
                  case "retroaction":
                    // Retroaction = tab dans ExecutionView (même section)
                    setActivePhase("execution" as any);
                    try { sessionStorage.setItem("bt_exec_tab_request", "retroaction"); } catch {}
                    setRightSection("execution");
                    break;
                  case "creation":
                  case "conception":
                    setActivePhase("creation" as any);
                    setActiveDeliverable("document");
                    setRightSection(null);
                    break;
                  case "reflexion":
                    setActivePhase("reflexion" as any);
                    setRightSection(null);
                    break;
                  case "discussion":
                    setActivePhase("discussion" as any);
                    setRightSection(null);
                    break;
                  default:
                    // observation, attention, moderation → VueEnsemble
                    setActivePhase("observation" as any);
                    setRightSection(null);
                }
              }}
              threads={threads.filter((t) => t.primaryBot === activeBotCode)}
            />
          </div>
        ) : (
          <V3MessageList />
        )}
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

