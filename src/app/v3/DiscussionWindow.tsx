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

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import {
  Bot, Atom, Plus, Send, ChevronUp,
  Phone, Video, Glasses, Paperclip, Globe, Zap, Activity,
  Brain, Target, AlertTriangle, Scale, Sparkles, MessageSquare,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { LiveChat } from "../v2/zones/center/LiveChat";
import { useAmorcer } from "./AmorcerContext";
import { useChatContext } from "../v2/context/ChatContext";
import { BOT_AVATAR, BOT_NAME, BOT_ROLE } from "../v2/api/types";

const ALL_BOT_CODES = ["CEOB","CTOB","CFOB","CMOB","CSOB","COOB","CPOB","CHROB","CINOB","CROB","CLOB","CISOB"];

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
  const { activeRoster, addBotToRoster, removeBotFromRoster } = useChatContext();
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

            {/* Équipe active — dynamique depuis ChatContext */}
            {activeRoster.map((code) => (
              <div key={code} className="flex items-center gap-1 ml-1">
                <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white/30 shrink-0">
                  <img src={BOT_AVATAR[code] || `/agents/${code.toLowerCase()}.png`} alt={BOT_NAME[code] || code} className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] text-white font-medium">{BOT_NAME[code] || code}</span>
                <span className="text-[9px] text-white/50">{BOT_ROLE[code] || ""}</span>
                {activeRoster.length > 1 && (
                  <button onClick={() => removeBotFromRoster(code)} className="text-white/30 hover:text-white/70 cursor-pointer transition-colors" title={`Retirer ${BOT_NAME[code]}`}>
                    <span className="text-xs">×</span>
                  </button>
                )}
              </div>
            ))}

            {/* Dropdown ajout de bot — custom avec avatars */}
            {activeRoster.length < 3 && <BotAddDropdown activeRoster={activeRoster} addBotToRoster={addBotToRoster} />}
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

// ═══ CHATBOX V3 — DESIGN MODÉLISÉ (Style Claude AI) ═══

function ChatBoxV3() {
  const [inputText, setInputText] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const { sendMessage } = useChatContext();

  // Fermer menu attach si click extérieur
  useEffect(() => {
    if (!showAttachMenu) return;
    function handleClick(e: MouseEvent) {
      if (attachRef.current && !attachRef.current.contains(e.target as Node)) setShowAttachMenu(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAttachMenu]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    sendMessage(text);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 bg-white px-3 pb-2 pt-1">
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
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Ajouter"
            >
              <Plus className="h-4 w-4" />
            </button>
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-1 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-20">
                <button onClick={() => setShowAttachMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
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

          {/* 3 modes: Discussion, Conférence, Vision */}
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100" title="Discussion vocale">
            <Phone className="h-3.5 w-3.5" /><span className="hidden lg:inline">Discussion</span>
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="Conférence vidéo">
            <Video className="h-3.5 w-3.5" /><span className="hidden lg:inline">Conférence</span>
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer bg-cyan-50 text-cyan-600 hover:bg-cyan-100" title="Vision Ray-Ban">
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

// ═══ DROPDOWN AJOUT BOT AVEC AVATARS ═══

function BotAddDropdown({ activeRoster, addBotToRoster }: { activeRoster: string[]; addBotToRoster: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fermer si click extérieur
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const available = ALL_BOT_CODES.filter((c) => !activeRoster.includes(c));

  return (
    <div className="relative ml-1" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[9px] text-white/70 bg-white/10 border border-dashed border-white/30 rounded-full px-2 py-0.5 cursor-pointer hover:bg-white/20 transition-colors"
      >
        <Plus className="h-3 w-3" />
        Agent
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 max-h-72 overflow-y-auto">
          {available.map((code) => (
            <button
              key={code}
              onClick={() => { addBotToRoster(code); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-gray-100">
                <img src={BOT_AVATAR[code] || `/agents/${code.toLowerCase()}.png`} alt={BOT_NAME[code] || code} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-medium text-gray-800">{BOT_NAME[code] || code}</span>
                <span className="text-[9px] text-gray-400 ml-1">{BOT_ROLE[code] || ""}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
