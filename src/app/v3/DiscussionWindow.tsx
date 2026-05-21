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
  Bot, BrainCog, Atom, Plus, Send, ChevronUp, X, Pin, Check, CheckCircle2, ChevronDown, ChevronRight,
  Phone, PhoneOff, Video, Glasses, Paperclip, Globe, Zap, Activity, Users,
  Brain, Target, AlertTriangle, Scale, Sparkles, MessageSquare,
  Mic, MicOff, Loader2, Upload, MessageCircle, Clock, Network, Pencil,
  BookOpen, Search, BarChart2, Lightbulb, FileText,
  Eye, Swords, Shield, Crown, type LucideIcon,
  UserPlus, GraduationCap, Handshake, RotateCcw, Presentation, Timer, DollarSign, UserCheck,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { DrivePickerModal } from "./DrivePickerModal";
import { IntegrationsPanel } from "./IntegrationsPanel";
import { useAmorcer } from "./AmorcerContext";
import { useDemo } from "./DemoContext";
import { DemoChatPlayer } from "./DemoChatPlayer";
import { useChatContext } from "../v2/context/ChatContext";
import { BOT_AVATAR, BOT_NAME, BOT_ROLE } from "../v2/api/types";
import { useIsMobile } from "../components/ui/use-mobile";
import { api } from "../v2/api/client";
import { BOT_CODES } from "./constants";
import { DEPT_DASH_ICON, DEPT_GRADIENT, BOT_DISPLAY, PHASE_COLORS } from "./sections/shared/dept-data";
import { DEPT_GREETING, DEPT_ACTIONS, ACTION_COLORS } from "./data/dept-welcome";
import type { PhaseKey } from "./core/types";
import { PHASE_CONFIG } from "./core/phases";
import { detectPhaseFromMessage } from "./core/phase-router";
// getContextualActions retire — remplace par footer 2 niveaux (Bible Live 4.14)
import { getPhaseSteps } from "./phases/phase-config";
import { buildExpertContext } from "./phases/LiveDiscussionView";
import { BubbleActions } from "./phases/BubbleActions";
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

/** Inline formatting: bold, italic, code — copié du V2 LiveChat (source de vérité) */
function applyInlineFormatting(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-gray-600 italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-800">$1</code>');
}

/** Rich markdown → HTML — copié du V2 formatBotText (source de vérité) */
function formatMarkdown(text: string): string {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = html.split("\n");
  const result: string[] = [];
  let listTag: "ul" | "ol" | null = null;  // Track open list type
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockLines: string[] = [];
  let tableLines: string[] = [];

  const closeList = () => {
    if (listTag) { result.push(`</${listTag}>`); listTag = null; }
  };

  const flushTable = () => {
    if (tableLines.length === 0) return;
    const rows = tableLines.map(r => r.replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim()));
    // Detect separator row (---|---) to split header from body
    let headerEnd = -1;
    for (let r = 0; r < rows.length; r++) {
      if (rows[r].every(c => /^[-:]+$/.test(c))) { headerEnd = r; break; }
    }
    let html = '<div class="my-2"><table class="text-sm border-collapse w-full">';
    for (let r = 0; r < rows.length; r++) {
      if (headerEnd >= 0 && r === headerEnd) continue; // skip separator
      const isHead = headerEnd > 0 && r < headerEnd;
      const tag = isHead ? "th" : "td";
      const cls = isHead
        ? 'class="px-3 py-1.5 text-left font-semibold text-gray-900 border-b border-gray-300 bg-gray-50"'
        : 'class="px-3 py-1.5 text-left text-gray-700 border-b border-gray-100"';
      html += "<tr>" + rows[r].map(c => `<${tag} ${cls}>${applyInlineFormatting(c)}</${tag}>`).join("") + "</tr>";
    }
    html += "</table></div>";
    result.push(html);
    tableLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Code blocks: ``` or ```language
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        closeList();
        inCodeBlock = true;
        codeBlockLang = line.trim().replace(/^```/, "").trim();
        codeBlockLines = [];
        continue;
      } else {
        // Closing code block
        inCodeBlock = false;
        const langLabel = codeBlockLang ? `<div class="text-[10px] text-gray-400 mb-1 font-mono">${codeBlockLang}</div>` : "";
        result.push(`<div class="my-2 rounded-lg bg-gray-900 text-gray-100 p-3"><pre class="text-xs font-mono whitespace-pre-wrap break-all leading-relaxed">${langLabel}${codeBlockLines.join("\n")}</pre></div>`);
        codeBlockLines = [];
        codeBlockLang = "";
        continue;
      }
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Horizontal rules: --- ━━━ ═══
    if (/^[━─═\-]{3,}$/.test(line.trim())) {
      closeList();
      result.push('<hr class="my-3 border-gray-200">');
      continue;
    }

    // Inline option chips: "1. text | 2. text" or "1 · text | 2 · text"
    if (/^\p{Emoji}?\s*\d+\s*[·.]\s*.+\|/u.test(line.trim())) {
      closeList();
      const options = line.split(/\s*\|\s*/);
      result.push('<div class="flex flex-wrap gap-2 my-3">');
      for (const opt of options) {
        const cleaned = opt.replace(/^\p{Emoji}?\s*\d+\s*[·.]\s*/u, "").trim();
        if (cleaned) result.push(`<span class="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">${cleaned}</span>`);
      }
      result.push("</div>");
      continue;
    }

    // Headers: ### or ##
    if (/^#{1,3}\s+/.test(line.trim())) {
      closeList();
      const hText = applyInlineFormatting(line.replace(/^#{1,3}\s+/, ""));
      result.push(`<div class="font-semibold text-gray-900 mt-3 mb-1">${hText}</div>`);
      continue;
    }

    // Numbered list: 1. 2) etc
    const numberedMatch = line.match(/^(\s*)(\d+)[.)]\s+(.+)/);
    if (numberedMatch) {
      if (listTag !== "ol") { closeList(); result.push('<ol class="space-y-1.5 my-2 list-none">'); listTag = "ol"; }
      const content = applyInlineFormatting(numberedMatch[3]);
      result.push(`<li class="flex items-start gap-2 text-sm"><span class="text-gray-400 mt-0.5 shrink-0 font-semibold">${numberedMatch[2]}.</span><span>${content}</span></li>`);
      continue;
    }

    // Bullet list: * - • or emoji bullets
    const bulletMatch = line.match(/^(\s*)([-*•]|\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s+(.+)/u);
    if (bulletMatch) {
      if (listTag !== "ul") { closeList(); result.push('<ul class="space-y-1.5 my-2">'); listTag = "ul"; }
      const content = applyInlineFormatting(bulletMatch[3]);
      const emoji = /^[-*•]$/.test(bulletMatch[2]) ? "" : bulletMatch[2] + " ";
      result.push(`<li class="flex items-start gap-2 text-sm"><span class="text-gray-400 mt-0.5 shrink-0">${emoji || "•"}</span><span>${content}</span></li>`);
      continue;
    }

    // Close list if we hit a non-list line
    if (listTag && line.trim() !== "") {
      closeList();
    }

    // Table rows: lines starting with |
    if (/^\s*\|/.test(line)) {
      closeList();
      tableLines.push(line.trim());
      continue;
    }
    // Flush table if we exit table lines
    if (tableLines.length > 0) {
      flushTable();
    }

    // Empty line = spacing
    if (line.trim() === "") {
      result.push('<div class="h-2"></div>');
      continue;
    }

    // Bold-only line = header
    if (/^\*\*(.+)\*\*\s*:?\s*$/.test(line.trim())) {
      const headerText = line.trim().replace(/^\*\*(.+)\*\*\s*:?\s*$/, "$1");
      result.push(`<div class="font-semibold text-gray-900 mt-3 mb-1">${headerText}</div>`);
      continue;
    }

    // Regular paragraph
    result.push(`<p class="text-sm leading-relaxed">${applyInlineFormatting(line)}</p>`);
  }

  closeList();
  flushTable();
  // Flush any unclosed code block (e.g. during streaming)
  if (inCodeBlock && codeBlockLines.length > 0) {
    const langLabel = codeBlockLang ? `<div class="text-[10px] text-gray-400 mb-1 font-mono">${codeBlockLang}</div>` : "";
    result.push(`<div class="my-2 rounded-lg bg-gray-900 text-gray-100 p-3"><pre class="text-xs font-mono whitespace-pre-wrap break-all leading-relaxed">${langLabel}${codeBlockLines.join("\n")}</pre></div>`);
  }
  return result.join("\n");
}

// ═══ SEGMENTATION & CRISTALLISATION MANUELLE (phase discussion) ═══

/** Parse un message bot en segments par headers ### */
function parseMessageSegments(content: string): { title: string | null; text: string }[] {
  if (!content) return [];
  const parts = content.split(/(?=^#{1,4}\s)/m);
  const segments: { title: string | null; text: string }[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const headerMatch = trimmed.match(/^#{1,4}\s+(.+?)(?:\n|$)/);
    if (headerMatch) {
      segments.push({
        title: headerMatch[1].trim(),
        text: trimmed.replace(/^#{1,4}\s+.+?\n?/, "").trim(),
      });
    } else {
      segments.push({ title: null, text: trimmed });
    }
  }
  return segments;
}

/** Card contribution secondaire — style ConferenceAI (avatar + role badge + contenu complet + collapse) */
function ContributionCard({ agent, nom, contenu, style }: {
  agent: string; nom: string; contenu: string;
  style: { text: string; border: string; ring: string; bubble: string };
}) {
  const [expanded, setExpanded] = useState(false);
  const safe = contenu || "";
  const isLong = safe.length > 300;

  return (
    <div className={cn("border-l-[3px] rounded-lg rounded-tl-none px-3 py-2", style.border, "bg-white/60")}>
      {/* Header: avatar + nom + role badge pill */}
      <div className="flex items-center gap-2 mb-1">
        <div className={cn("w-5 h-5 rounded-full overflow-hidden shrink-0 ring-1", style.ring)}>
          <img src={BOT_AVATAR[agent] || `/agents/${agent.toLowerCase()}.png`}
            alt="" className="w-full h-full object-cover" />
        </div>
        <span className={cn("text-[11px] font-bold", style.text)}>{nom}</span>
        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", style.bubble, style.text)}>
          {BOT_ROLE[agent] || "Consultant"}
        </span>
      </div>
      {/* Contenu complet avec markdown — scroll au lieu de tronquer */}
      <div className={cn(
        "text-[12px] text-gray-700 leading-relaxed",
        isLong && !expanded && "max-h-[200px] overflow-y-auto"
      )}
        dangerouslySetInnerHTML={{ __html: formatMarkdown(safe) }} />
      {/* Toggle expand/collapse */}
      {isLong && (
        <button onClick={() => setExpanded(!expanded)}
          className="text-[10px] text-blue-600 hover:text-blue-800 mt-1 cursor-pointer font-medium">
          {expanded ? "▲ Voir moins" : "▼ Voir la réponse complète"}
        </button>
      )}
    </div>
  );
}

/** S109 — Label dynamique par bot dans la bulle multi-thinking (etapes variees contextuelles) */
function ThinkingLabel({ botCode, userText }: { botCode: string; userText?: string }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 1800);
    return () => clearInterval(t);
  }, []);

  const STOPS = new Set([
    "dans","pour","avec","comment","quel","quelle","cette","votre","notre",
    "quels","quelles","faire","faut","veux","voudrais","aimerais","peux",
    "peut","dois","doit","aussi","encore","comme","juste","vraiment",
    "toujours","suis","sont","être","etre","avoir","tout","tous",
    "mais","puis","donc","alors","meme","tres","plus","moins",
  ]);
  const kw = userText
    ? userText.replace(/[?!.,;:'"()]/g, "").split(" ")
        .filter((w) => w.length > 3 && !STOPS.has(w.toLowerCase()))
        .slice(0, 2).join(" ")
    : "";

  const ANGLES: Record<string, [string, string]> = {
    CEOB: ["Vision strategique", "Priorites"], CFOB: ["Modelisation", "Projection"],
    CMOB: ["Positionnement", "Acquisition"], CSOB: ["Risques", "Scenarios"],
    CTOB: ["Architecture", "Faisabilite"], COOB: ["Operations", "Execution"],
    CPOB: ["Chaine valeur", "Flux"], CHROB: ["Equipe", "Talent"],
    CINOB: ["Tendances", "Benchmark"], CROB: ["Pipeline", "Conversion"],
    CLOB: ["Conformite", "Juridique"], CISOB: ["Securite", "Protection"],
  };

  const [a1, a2] = ANGLES[botCode] || ["Analyse", "Evaluation"];
  const phases = kw
    ? [kw, a1, "Enjeux", a2, "Formulation"]
    : [a1, "Contexte", a2, "Evaluation", "Formulation"];
  const label = phases[tick % phases.length];

  return (
    <span className="text-[9px] text-gray-400 text-center truncate max-w-[80px]">
      {label}...
    </span>
  );
}

/** ExpertSuggestionChips — small chips in bubble footer for quick expert consultation */
function ExpertSuggestionChips({ suggestions, onConsult }: {
  suggestions: Array<{ consult: string; consult_nom: string; consult_emoji: string; reason: string }>;
  onConsult: (s: { consult: string; reason: string }) => void;
}) {
  return (
    <div className="mt-2 pt-2 border-t border-gray-100">
      <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">Experts suggérés</span>
      <div className="flex flex-wrap gap-1 mt-1">
        {suggestions.map((s, i) => (
          <button
            key={`expert-${i}`}
            onClick={() => onConsult(s)}
            className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 text-[10px] text-blue-700 hover:bg-blue-100 hover:border-blue-300 cursor-pointer transition-all font-medium"
            title={s.reason}
          >
            <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[9px] shrink-0">
              {s.consult_emoji || "👤"}
            </span>
            <span>{s.consult_nom}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** CascadeChips — small chips in bubble footer for cascade/reflexion actions */
function CascadeChips({ suggestions, onAction }: {
  suggestions: Array<{ target_section: string; message: string; view: string; sub_section: string }>;
  onAction: (s: { message: string; view: string; target_section: string }) => void;
}) {
  return (
    <div className="mt-2 pt-2 border-t border-gray-100">
      <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wide flex items-center gap-1">
        <Zap className="h-2.5 w-2.5" /> Actions suggérées
      </span>
      <div className="flex flex-wrap gap-1 mt-1">
        {suggestions.map((s, i) => (
          <button
            key={`cascade-${i}`}
            onClick={() => onAction(s)}
            className="flex items-center gap-1 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5 text-[10px] text-violet-700 hover:bg-violet-100 hover:border-violet-300 cursor-pointer transition-all font-medium"
          >
            <Brain className="h-2.5 w-2.5 shrink-0" />
            <span>{s.message || s.target_section}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** CREDOProgressDots — 5 dots showing C/R/E/D/O phase progress */
function CREDOProgressDots({ currentPhase }: { currentPhase: string }) {
  const phases = [
    { letter: "C", label: "Connexion", active: "bg-blue-500 text-white ring-2 ring-blue-200" },
    { letter: "R", label: "Recherche", active: "bg-amber-500 text-white ring-2 ring-amber-200" },
    { letter: "E", label: "Exposition", active: "bg-green-500 text-white ring-2 ring-green-200" },
    { letter: "D", label: "Demo", active: "bg-purple-500 text-white ring-2 ring-purple-200" },
    { letter: "O", label: "Obtention", active: "bg-emerald-500 text-white ring-2 ring-emerald-200" },
  ];
  const norm = (currentPhase || "C").charAt(0).toUpperCase();
  const activeIdx = Math.max(0, phases.findIndex(p => p.letter === norm));

  return (
    <div className="flex items-center gap-1" title={`Phase: ${phases[activeIdx]?.label || "Connexion"}`}>
      {phases.map((p, i) => (
        <div key={p.letter} className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-all",
          i < activeIdx ? "bg-emerald-100 text-emerald-600"
          : i === activeIdx ? p.active
          : "bg-gray-100 text-gray-400"
        )}>
          {p.letter}
        </div>
      ))}
    </div>
  );
}

// CristalliseBar removed — cristallisation is now automatic via useWorkspaceCapture

/** Helper: cristallisation intelligente via API (shared par tous les chemins) */
async function cristalliseViaAPI(
  content: string,
  opts: {
    botCode: string;
    sectionId: string;
    credoStep: "C" | "R" | "E" | "D" | "O";
    userMsg?: string;
    addWorkspaceBlock: (block: import("./core/types").WorkspaceBlock) => void;
  },
) {
  const { botCode, sectionId, credoStep, userMsg, addWorkspaceBlock } = opts;
  try {
    const apiKey = (import.meta as Record<string, Record<string, string>>).env?.VITE_API_KEY || "";
    const res = await fetch("/api/v1/workspace/cristallise", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
      body: JSON.stringify({
        content,
        user_msg: userMsg || "",
        credo_phase: credoStep,
      }),
    });
    const block = await res.json();
    addWorkspaceBlock({
      id: `blk-${Date.now()}`,
      type: block.type || "libre",
      title: block.title || content.substring(0, 60),
      summary: block.summary || content.substring(0, 300),
      structured_data: { ...block.structured_data, originalContent: content },
      credo_step: credoStep,
      confidence: block.confidence || 0.5,
      source: botCode,
      sourceType: "chat",
      sectionId,
      timestamp: Date.now(),
    });
  } catch {
    // Fallback copie brute si API echoue
    addWorkspaceBlock({
      id: `blk-${Date.now()}`,
      type: "libre",
      title: content.substring(0, 60),
      summary: content,
      credo_step: credoStep,
      confidence: 1.0,
      source: botCode,
      sourceType: "chat",
      sectionId,
      timestamp: Date.now(),
    });
  }
}

/** Contenu bot segmenté — sous-bulles (cristallisation automatique via useWorkspaceCapture) */
function SegmentedBotContent({ content }: {
  content: string;
  botCode: string;
  activePhase: string;
  addWorkspaceBlock: (block: import("./core/types").WorkspaceBlock) => void;
  lastUserMessage?: string;
}) {
  const segments = parseMessageSegments(content);

  // Pas de segmentation (1 seul bloc sans titre) → rendu normal
  if (segments.length <= 1) {
    return (
      <div
        className="text-sm text-gray-700 leading-relaxed isolate overflow-hidden [&>p]:my-0.5 [&>ul]:my-1 [&>ol]:my-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>hr]:my-2 [&_li]:break-words [&_p]:break-words"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
      />
    );
  }

  // Segments multiples → sous-bulles
  return (
    <div className="space-y-2">
      {segments.map((seg, i) => (
        <div key={i} className="rounded-lg bg-white/60 border border-gray-100 px-3 py-2">
          {seg.title && (
            <div className="text-xs font-semibold text-gray-800 mb-1">{seg.title}</div>
          )}
          <div
            className="text-sm text-gray-700 leading-relaxed [&>p]:my-0.5 [&>ul]:my-1 [&>ol]:my-1"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(seg.text) }}
          />
        </div>
      ))}
    </div>
  );
}

// ═══ InlineOptions — Checkboxes visibles + multi-select natif + réponse inline questions ═══

function InlineOptions({ options, onSend, isActive, msgType, agent, activeRoster, workspacePhase }: {
  options: string[];
  onSend: (text: string, targetBot?: string, meta?: unknown, extra?: { workspacePhase?: string }) => void;
  isActive: boolean;
  msgType?: string;
  agent?: string;
  activeRoster: string[];
  workspacePhase?: string;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [inlineTexts, setInlineTexts] = useState<Record<number, string>>({});
  const [precisionTexts, setPrecisionTexts] = useState<Record<number, string>>({});
  const [globalPrecision, setGlobalPrecision] = useState("");
  const [showInputFor, setShowInputFor] = useState<number | null>(null);

  // Strip markdown résiduel (** et *) + filtrer "Ouvrir l'atelier"
  const stripMd = (s: string) => s.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1').replace(/\*/g, '').trim();
  const filteredOpts = options.map(stripMd).filter(opt => opt && !/ouvrir\s+l'atelier/i.test(opt));
  if (filteredOpts.length === 0) return null;

  const isQuestion = (opt: string) => /\?\s*$/.test(opt.trim());
  const hasSelection = selected.size > 0;

  const doSend = (text: string) => {
    if (msgType === "consultation" && agent && activeRoster.length > 1) {
      onSend(text, agent, undefined, { workspacePhase });
    } else {
      onSend(text, undefined, undefined, { workspacePhase });
    }
    setSelected(new Set());
    setInlineTexts({});
    setPrecisionTexts({});
    setGlobalPrecision("");
    setShowInputFor(null);
  };

  const toggleSelect = (i: number) => {
    if (!isActive) return;
    const opt = filteredOpts[i];

    // Question → toggle input inline
    if (isQuestion(opt)) {
      const next = new Set(selected);
      if (next.has(i)) {
        next.delete(i);
        setShowInputFor(null);
        const nextTexts = { ...inlineTexts };
        delete nextTexts[i];
        setInlineTexts(nextTexts);
      } else {
        next.add(i);
        setShowInputFor(i);
      }
      setSelected(next);
      return;
    }

    // Non-question → toggle sélection
    const next = new Set(selected);
    if (next.has(i)) {
      next.delete(i);
      const nextP = { ...precisionTexts };
      delete nextP[i];
      setPrecisionTexts(nextP);
    } else {
      next.add(i);
    }
    setSelected(next);
  };

  const handleSendAll = () => {
    if (selected.size === 0) return;
    const parts: string[] = [];
    for (const i of Array.from(selected).sort()) {
      if (isQuestion(filteredOpts[i]) && inlineTexts[i]?.trim()) {
        parts.push(inlineTexts[i].trim());
      } else {
        let optText = filteredOpts[i];
        if (precisionTexts[i]?.trim()) optText += ` — ${precisionTexts[i].trim()}`;
        parts.push(optText);
      }
    }
    let finalText = parts.join("\n\n");
    if (globalPrecision.trim()) finalText += `\n\nContexte: ${globalPrecision.trim()}`;
    doSend(finalText);
  };

  const handleInlineSubmit = (i: number) => {
    if (!inlineTexts[i]?.trim()) return;
    doSend(inlineTexts[i].trim());
  };

  const borderColors = ["border-l-blue-500", "border-l-amber-500", "border-l-green-500", "border-l-red-500"];
  const hoverBgs = isActive ? ["hover:bg-blue-50", "hover:bg-amber-50", "hover:bg-green-50", "hover:bg-red-50"] : [""];

  return (
    <div className={cn("mt-3 space-y-1.5", !isActive && "opacity-40 pointer-events-none")}>
      {filteredOpts.map((opt, i) => {
        const isSel = selected.has(i);
        const isQ = isQuestion(opt);
        const isInputOpen = isQ && showInputFor === i;
        return (
          <div key={i}>
            <button
              disabled={!isActive}
              onClick={() => toggleSelect(i)}
              style={isActive ? { animation: `fadeSlideUp 0.3s ease-out ${i * 0.08}s both` } : undefined}
              className={cn(
                "w-full text-left border rounded-lg px-3 py-2 transition-all",
                "border-l-[3px]",
                borderColors[i % borderColors.length],
                isSel ? "bg-blue-50 border-blue-300 ring-1 ring-blue-200" : "border-gray-200",
                isInputOpen ? "bg-amber-50/50 border-amber-200" : "",
                isActive && !isSel && !isInputOpen && hoverBgs[i % hoverBgs.length],
                isActive ? "hover:shadow-sm cursor-pointer group/opt" : "cursor-default",
                isActive && "active:scale-[0.98] focus:outline-none touch-manipulation",
              )}
            >
              <div className="flex items-start gap-2">
                <span className={cn(
                  "mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  isSel ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300"
                )}>
                  {isSel && <Check className="h-3 w-3" />}
                </span>
                <span className={cn("text-sm font-medium flex-1", isActive ? "text-gray-700 group-hover/opt:text-gray-900" : "text-gray-400")}>
                  {opt}
                </span>
                {isQ && <MessageCircle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />}
              </div>
            </button>
            {/* Input inline pour les options-questions */}
            {isInputOpen && (
              <div ref={(el) => { if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50); }} className="mt-1 ml-6 flex gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <input
                  type="text"
                  autoFocus
                  placeholder="Votre réponse..."
                  value={inlineTexts[i] || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setInlineTexts(prev => ({ ...prev, [i]: e.target.value }))}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleInlineSubmit(i); } }}
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                />
                <button
                  onClick={() => handleInlineSubmit(i)}
                  disabled={!inlineTexts[i]?.trim()}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium disabled:opacity-40 hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {/* Precision input pour les options non-question selectionnees */}
            {isSel && !isQ && (
              <div ref={(el) => { if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50); }} className="mt-1 ml-6 animate-in fade-in slide-in-from-top-1 duration-200">
                <input
                  type="text"
                  placeholder="Preciser (optionnel)..."
                  value={precisionTexts[i] || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPrecisionTexts(prev => ({ ...prev, [i]: e.target.value }))}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendAll(); } }}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-200 bg-gray-50/50 placeholder:text-gray-300"
                />
              </div>
            )}
          </div>
        );
      })}
      {/* Global context input quand 2+ options selectionnees */}
      {selected.size > 1 && (
        <div className="mt-1 animate-in fade-in duration-200">
          <input
            type="text"
            placeholder="Contexte global pour vos choix (optionnel)..."
            value={globalPrecision}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setGlobalPrecision(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendAll(); } }}
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-200 bg-gray-50/50 placeholder:text-gray-300"
          />
        </div>
      )}
      {/* Bouton Envoyer — toujours visible dès qu'une option est cochée */}
      {hasSelection && (
        <button
          ref={(el) => { if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50); }}
          onClick={handleSendAll}
          className="w-full mt-1.5 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors cursor-pointer shadow-sm animate-in fade-in duration-200"
        >
          <Send className="h-4 w-4" />
          Envoyer{selected.size > 1 ? ` (${selected.size} sélectionnés)` : ""}
        </button>
      )}
    </div>
  );
}

// ═══ V3 MESSAGE LIST — Système unique de rendu des discussions ═══
// Gère: bulles V3, options cliquables, streaming, thinking, coaching, voice
function V3MessageList() {
  const { messages, isTyping, sendMessage, sendMultiPerspective, thinkingSteps, parkThread, activeRoster, chatTargetBot } = useChatContext();
  const { activeBotCode, activePhase, setActivePhase, setRightSection, setReflexionContext, reflexionContext, credoPhase, addWorkflowItem, workflowItems, chatStage, addWorkspaceBlock, workspaceBlocks, focusType, activeDocumentSection, startDeliverable } = useAmorcer();
  // Enrichir activePhase avec le step CREDO pour que le backend injecte le bon prompt
  // URL-based fallback: activePhase peut être "reflexion" si l'état a dérivé
  const _credoSteps = ["comprendre", "rechercher", "exposer", "demontrer", "objectif"];
  const _isDiscussionURL = window.location.pathname.includes("/discussion/");
  const _effectiveDiscussion = activePhase === "discussion" || (_isDiscussionURL && !activePhase.startsWith("discussion"));
  const workspacePhase = _effectiveDiscussion && chatStage < _credoSteps.length
    ? `discussion_${_credoSteps[chatStage]}`
    : activePhase;
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);
  const isAnyStreaming = messages.some(m => m.isStreaming);
  // Si le DERNIER message est un assistant non-streaming avec contenu, le bot a fini de repondre
  // → supprimer TOUT indicateur de reflexion (thinking steps + typing dots)
  const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
  const botAlreadyResponded = lastMsg?.role === "assistant" && !lastMsg.isStreaming && (lastMsg.content?.length ?? 0) > 0;

  // Dernier message bot (pour afficher les options seulement sur le dernier)
  const lastBotId = [...messages].reverse().find(m => m.role === "assistant" && !m.isStreaming)?.id;
  // Dernier message user (pour cristallisation intelligente)
  const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content || "";

  // Détecter si l'user a scrollé vers le haut (désactive l'auto-scroll)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      userScrolledUp.current = distFromBottom > 120;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll intelligent — seulement si l'user est en bas
  useEffect(() => {
    if (!userScrolledUp.current) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);
  // Streaming scroll — instant (pas smooth) pour éviter le race condition où
  // l'animation smooth n'a pas fini → distFromBottom > 120 → userScrolledUp=true → scroll perdu
  useEffect(() => {
    if (!isAnyStreaming) return;
    const id = setInterval(() => {
      if (!userScrolledUp.current && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 80);
    return () => clearInterval(id);
  }, [isAnyStreaming]);
  // Quand le streaming se termine, les options apparaissent → scroll pour les montrer
  const prevStreamingRef = useRef(false);
  useEffect(() => {
    if (prevStreamingRef.current && !isAnyStreaming) {
      setTimeout(() => {
        if (!userScrolledUp.current) {
          endRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
    prevStreamingRef.current = isAnyStreaming;
  }, [isAnyStreaming]);

  // Option click — gère les cas spéciaux coaching + envoi standard
  const handleOption = useCallback((opt: string) => {
    if (isTyping) return;
    const lower = opt.toLowerCase();
    if (lower.includes("parker") && lower.includes("thread")) { parkThread(); return; }
    if (lower.includes("synthes") || lower.includes("synthét") || lower.includes("faire le point")) {
      sendMessage("Fais une synthèse structurée de notre discussion.", chatTargetBot);
      return;
    }

    // Detection livrable DocForge — "Ouvrir l'atelier X"
    // JUMELAGE EXCLU: doit etre demande explicitement par l'utilisateur via navigation sidebar
    // (protocole de questions + contexte ressource requis avant jumelage)
    const atelierMatch = opt.match(/(?:ouvrir|activer|lancer)\s+l'atelier\s+(document|tableur|presentation|code)/i);
    if (atelierMatch) {
      const deliverableType = atelierMatch[1].toLowerCase();
      startDeliverable(deliverableType);
      return;
    }

    // Retour au cockpit (fin de rétroaction)
    if (lower.includes("retour au cockpit")) {
      setActivePhase("observation" as PhaseKey);
      setReflexionContext(null);
      setRightSection("cockpit");
      return;
    }

    // Transition de phase workspace (option cliquable "Passer en mode X")
    // Les boutons contextuels (contextual-actions.ts) contrôlent déjà QUELS boutons sont visibles
    const phaseMatch = lower.match(/passer en mode (discussion|réflexion|conception|exécution|rétroaction)/);
    if (phaseMatch) {
      const labelToPhase: Record<string, string> = {
        "discussion": "discussion",
        "réflexion": "reflexion",
        "conception": "creation",
        "exécution": "execution",
        "rétroaction": "retroaction",
      };
      const targetPhase = labelToPhase[phaseMatch[1]];
      if (targetPhase) {
        const context = reflexionContext || "discussion en cours";
        // Flux inter-phases: injecter les notes épinglées de la phase précédente
        const prevPhaseNotes = workflowItems.filter(w => w.phase === activePhase);
        const notesContext = prevPhaseNotes.length > 0
          ? `\n\nNotes de la phase ${activePhase}:\n${prevPhaseNotes.map(n => `• ${n.text}`).join("\n")}`
          : "";
        setActivePhase(targetPhase as PhaseKey);
        setReflexionContext(context);
        if (targetPhase === "execution" || targetPhase === "retroaction") {
          setRightSection(null);
        } else {
          setRightSection(null);
        }
        const prompts: Record<string, string> = {
          discussion: "Parlons de",
          reflexion: "Analyse approfondie :",
          creation: "Conception pour",
          execution: "Plan d'exécution pour",
          retroaction: "Bilan et rétroaction sur",
        };
        setTimeout(() => sendMessage(`${prompts[targetPhase]} ${context}${notesContext}`, chatTargetBot, undefined, { workspacePhase: targetPhase }), 80);
        return;
      }
    }

    // Techniques de réflexion — envoyer le VRAI prompt, pas juste le label
    const TECHNIQUE_PROMPTS: Record<string, string> = {
      "brainstorm": "Lance un brainstorm créatif tous azimuts sur: ",
      "scamper": "Applique SCAMPER (Substituer, Combiner, Adapter, Modifier, Put to other use, Éliminer, Réorganiser) à: ",
      "5 pourquoi": "Analyse les 5 Pourquoi en profondeur pour: ",
      "6 chapeaux": "Analyse avec les 6 Chapeaux de Bono (Blanc=faits, Rouge=émotions, Noir=risques, Jaune=bénéfices, Vert=créativité, Bleu=processus) pour: ",
      "challenger": "Joue l'avocat du diable, challenge cette approche et trouve les failles de: ",
      "deep search": "Recherche approfondie — tendances, benchmarks, meilleures pratiques pour: ",
      "analyser": "Analyse approfondie structurée de: ",
    };
    const techniquePrompt = TECHNIQUE_PROMPTS[lower];
    if (techniquePrompt) {
      const topic = reflexionContext || messages.filter(m => m.role === "user").pop()?.content?.substring(0, 100) || "discussion en cours";
      // Transition vers Reflexion SEULEMENT si on n'est pas en Discussion
      // En Discussion, on applique la technique sans changer de phase (Bible Live 4.18)
      // La transition explicite se fait via le bouton "Passer en mode reflexion"
      if (activePhase !== "reflexion" && activePhase !== "discussion") {
        setActivePhase("reflexion" as PhaseKey);
        setReflexionContext(topic);
        setRightSection(null);
      }
      sendMessage(techniquePrompt + topic, chatTargetBot, undefined, { workspacePhase });
      return;
    }

    // "Cristalliser vers [Section]" — Sprint 6
    if (lower.startsWith("cristalliser vers ")) {
      const lastBotMsg = messages.filter(m => m.role === "assistant").pop();
      if (lastBotMsg && activeDocumentSection) {
        const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content;
        cristalliseViaAPI(lastBotMsg.content, {
          botCode: activeBotCode,
          sectionId: activeDocumentSection,
          credoStep: "C",
          userMsg: lastUserMsg,
          addWorkspaceBlock,
        });
      }
      return;
    }

    // Log decision as workspace block when user selects an option
    if (activePhase === "discussion") {
      const lastBotMsg = [...messages].reverse().find(m => m.role === "assistant" && m.content);
      const _credoLetters: ("C" | "R" | "E" | "D" | "O")[] = ["C", "R", "E", "D", "O"];
      const credoStep = _credoLetters[Math.min(chatStage, _credoLetters.length - 1)];
      addWorkspaceBlock({
        id: `decision-${Date.now()}`,
        type: "decision",
        title: `Decision: ${opt.substring(0, 50)}`,
        summary: `**Choix**: ${opt}${lastBotMsg ? `\n**Contexte**: ${lastBotMsg.content.substring(0, 200)}` : ""}`,
        credo_step: credoStep,
        confidence: 1.0,
        source: activeBotCode,
        sourceType: "chat",
        timestamp: Date.now(),
      });
    }

    // W.1: Discussion 1:1 — toujours single-bot (experts dans le workspace)
    sendMessage(opt, chatTargetBot, undefined, { workspacePhase, workspaceExpertContext: buildExpertContext(workspaceBlocks, activeBotCode) });
  }, [isTyping, sendMessage, sendMultiPerspective, chatTargetBot, activeBotCode, activeRoster, parkThread, setActivePhase, setRightSection, setReflexionContext, reflexionContext, activePhase, workspacePhase, messages, activeDocumentSection, addWorkspaceBlock, workflowItems, chatStage]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-3 space-y-3 scrollbar-discussion">
      {messages.map((msg) => {
        if (msg.role === "system") return null;
        if (msg.isStreaming && !msg.content) return null;
        if ((msg.msgType as string) === "team_proposal") return null; // W.1: team_proposal consumed by workspace, not shown in chat

        // ── Multi-thinking bubble — animation consultation multi-agent ──
        // Variante "join" (msg.content = bot code) : un bot rejoint la discussion
        // Variante "consult" (msg.content vide) : consultation de tous les bots
        if ((msg.msgType as string) === "multi-thinking") {
          const joinBotCode = msg.content && msg.content.length <= 10 && msg.content.match(/^[A-Z]+$/) ? msg.content : null;
          const userText = (msg as any).userText as string | undefined;
          const headerText = joinBotCode
            ? `${BOT_NAME[joinBotCode] || joinBotCode} rejoint la discussion...`
            : "Consultation des départements...";
          return (
            <div key={msg.id} className="flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="ml-2 flex-1">
                <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl px-5 py-4 shadow-md">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Network className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                    </div>
                    <span className="text-xs font-bold text-blue-900 tracking-wide">{headerText}</span>
                  </div>
                  <div className="flex items-start justify-center gap-6">
                    {activeRoster.map((code) => {
                      const ts = V3_STYLE[code] || DEFAULT_STYLE;
                      const isNewBot = joinBotCode === code;
                      const isExisting = !!joinBotCode && joinBotCode !== code;
                      return (
                        <div key={code} className={cn(
                          "flex flex-col items-center gap-1.5 transition-all duration-500",
                          isNewBot && "scale-110",
                        )}>
                          <div className={cn(
                            "relative w-12 h-12 rounded-full overflow-hidden border-2 shadow-md transition-all",
                            isNewBot ? cn(ts.ring, "shadow-lg ring-2 ring-offset-1", ts.ring) : isExisting ? "border-green-400 shadow-green-100" : cn("border-2", ts.ring),
                          )}>
                            <img src={BOT_AVATAR[code] || `/agents/${code.toLowerCase()}.png`} alt=""
                              className={cn("w-full h-full object-cover", (isNewBot || !joinBotCode) && "opacity-60")} />
                            {(isNewBot || !joinBotCode) && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                <Loader2 className={cn("h-5 w-5 animate-spin", ts.text)} />
                              </div>
                            )}
                            {isExisting && (
                              <div className="absolute inset-0 flex items-center justify-center bg-green-500/10">
                                <CheckCircle2 className="h-5 w-5 text-green-500 drop-shadow-sm" />
                              </div>
                            )}
                          </div>
                          <span className={cn("text-[11px] font-semibold", isNewBot ? ts.text : isExisting ? "text-gray-500" : ts.text)}>
                            {BOT_NAME[code]}
                          </span>
                          <span className={cn("text-[10px]", isExisting ? "text-gray-400" : ts.text)}>
                            {BOT_ROLE[code] || ""}
                          </span>
                          {isExisting
                            ? <span className="text-[9px] text-green-600 font-medium">✓ Terminé</span>
                            : <ThinkingLabel botCode={code} userText={userText} />
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // ── Typing bubble — animation dots pour un bot spécifique ──
        if ((msg.msgType as string) === "typing") {
          const tCode = msg.agent || activeBotCode;
          const ts = V3_STYLE[tCode] || DEFAULT_STYLE;
          return (
            <div key={msg.id} className="flex gap-2.5 animate-in fade-in duration-300">
              <div className={cn("w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 mt-0.5", ts.ring)}>
                <img src={BOT_AVATAR[tCode] || `/agents/${tCode.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="border border-gray-200 rounded-xl rounded-tl-none px-3.5 py-3 shadow-sm bg-white">
                <div className="flex items-center gap-2">
                  <span className={cn("text-[11px] font-semibold", ts.text)}>{BOT_NAME[tCode]}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // ── Bot-join bubble — animation quand un bot rejoint la discussion ──
        if ((msg.msgType as string) === "bot-join") {
          const jCode = msg.agent || "CEOB";
          const js = V3_STYLE[jCode] || DEFAULT_STYLE;
          return (
            <div key={msg.id} className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm", js.bubble, js.border)}>
                <div className={cn("w-6 h-6 rounded-full overflow-hidden ring-2 shrink-0", js.ring)}>
                  <img src={BOT_AVATAR[jCode] || `/agents/${jCode.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
                </div>
                <span className={cn("text-xs font-semibold", js.text)}>{BOT_NAME[jCode]}</span>
                <span className="text-xs text-gray-500">a rejoint la discussion</span>
              </div>
            </div>
          );
        }

        // ── S102 — Synthesis bar after multi-bot responses ──
        if ((msg.msgType as string) === "synthesis-bar") {
          return (
            <div key={msg.id} className="flex gap-2 justify-center py-3 px-4 animate-in fade-in duration-300">
              {(msg.options || []).map((opt, i) => {
                const msgTypes = ["fusionner", "challenge", "plan_action"] as const;
                return (
                  <button
                    key={i}
                    onClick={() => sendMessage(opt, chatTargetBot, undefined, { msgType: msgTypes[i] || "fusionner", workspacePhase })}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors text-gray-600 hover:text-gray-800"
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          );
        }

        // ── S102-B — Bulle consolidee multi-agent ──
        if ((msg.msgType as string) === "multi-enriched") {
          const mCode = msg.agent || activeBotCode || "CEOB";
          const ms = V3_STYLE[mCode] || DEFAULT_STYLE;
          const secondaries = ((msg as any).secondaryInputs || []) as Array<{agent: string; nom: string; contenu: string}>;
          const modeActif = (msg as any).modeActif as string | undefined;
          const modeSteps = ((msg as any).modeSteps || []) as Array<{id: string; label: string}>;
          return (
            <div key={msg.id} className="flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className={cn("w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 mt-0.5", ms.ring)}>
                <img src={BOT_AVATAR[mCode] || `/agents/${mCode.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className={cn("flex-1 border-l-[3px] border rounded-xl rounded-tl-none px-3.5 py-2.5 shadow-sm max-w-[85%]", ms.border, ms.bubble)}>
                {/* Header primaire */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn("text-[11px] font-semibold", ms.text)}>{BOT_NAME[mCode]}</span>
                  <span className="text-[9px] text-gray-400">{BOT_ROLE[mCode]}</span>
                  {msg.branchLabel && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{msg.branchLabel}</span>
                  )}
                </div>
                {/* Contenu principal (markdown) */}
                <div className="text-sm text-gray-800 leading-relaxed prose-sm"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                {/* Contributions secondaires — ContributionCards style ConferenceAI */}
                {secondaries.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-gray-200/60 space-y-2">
                    {secondaries.map((sec) => {
                      const secStyle = V3_STYLE[sec.agent] || DEFAULT_STYLE;
                      return (
                        <ContributionCard
                          key={sec.agent}
                          agent={sec.agent}
                          nom={sec.nom}
                          contenu={sec.contenu}
                          style={secStyle}
                        />
                      );
                    })}
                  </div>
                )}
                {/* Options inline — InlineOptions avec coches + precision */}
                {msg.options && msg.options.length > 0 && (
                  <InlineOptions
                    options={msg.options}
                    onSend={(text, targetBot, _meta, extra) => {
                      if (targetBot) {
                        sendMessage(text, targetBot, undefined, extra);
                      } else {
                        handleOption(text);
                      }
                    }}
                    isActive={true}
                    msgType={msg.msgType as string}
                    agent={msg.agent}
                    activeRoster={activeRoster}
                    workspacePhase={workspacePhase}
                  />
                )}
                {/* S102-B Phase 7 — Mode steps indicator */}
                {modeSteps.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider mr-1">{modeActif}</span>
                    {modeSteps.map((step, i) => (
                      <div key={i} className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-medium border",
                        i === 0
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-gray-50 border-gray-200 text-gray-400"
                      )}>
                        {step.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }

        const isUser = msg.role === "user";
        const botCode = msg.agent || activeBotCode || "CEOB";
        const s = V3_STYLE[botCode] || DEFAULT_STYLE;
        const isCoaching = msg.msgType === "coaching";
        const isLast = msg.id === lastBotId;

        // ── User bubble ──
        if (isUser) {
          // S3B.2: Detect workspace-sourced actions (pill indicator)
          const wsMatch = (msg.content || "").match(/^(Approfondir en detail|Challenge cet element, trouve les failles|Retravaille et enrichis):\s*(.+?)(?:\n|$)/);
          const wsLabel = wsMatch ? (wsMatch[1].startsWith("Approfondir") ? "Approfondir" : wsMatch[1].startsWith("Challenge") ? "Challenger" : "Modifier") : null;
          const wsTitle = wsMatch?.[2]?.substring(0, 60) || null;
          return (
            <div key={msg.id} className="flex gap-2.5 justify-end">
              <div className="max-w-[80%]">
                {wsLabel && wsTitle && (
                  <div className="flex justify-end mb-1">
                    <span className="text-[10px] bg-sky-50 border border-sky-200 rounded-full px-2 py-0.5 text-sky-600 font-medium">
                      [{wsLabel}] {wsTitle}
                    </span>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-100 rounded-xl rounded-tr-none px-3.5 py-2.5 shadow-sm">
                  <p className="text-sm text-blue-900 whitespace-pre-wrap">{msg.content}</p>
                </div>
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
          <div key={msg.id} className="flex gap-3 group/msg">
            <div className={cn("w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 mt-1 shadow-sm", s.ring)}>
              <img src={BOT_AVATAR[botCode] || `/agents/${botCode.toLowerCase()}.png`}
                alt={BOT_NAME[botCode] || botCode} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 max-w-[85%] relative">
              <div className={cn(
                "border-l-[3px] rounded-2xl rounded-tl-none px-4 py-3 shadow-sm",
                "bg-gradient-to-br from-white via-white to-gray-50/80",
                "border border-gray-100",
                s.border, s.bubble
              )}>
                {/* Agent name + role badge */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn("text-[12px] font-bold tracking-tight", s.text)}>{BOT_NAME[botCode] || botCode}</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide">{BOT_ROLE[botCode] || ""}</span>
                </div>
                {/* Content — formatMarkdown TOUJOURS (key stable = pas d'unmount/remount) */}
                <div
                  key={msg.id}
                  className="text-[13px] text-gray-700 leading-[1.7] isolate overflow-hidden [&>p]:my-1 [&>ul]:my-1.5 [&>ol]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>hr]:my-3 [&_li]:break-words [&_p]:break-words [&>ul]:pl-4 [&>ol]:pl-4 [&_strong]:text-gray-900 [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                />
                {msg.isStreaming && (
                  <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-text-bottom" />
                )}
                {/* ═══ Niveau 1 — Options DANS la bulle (multi-select + réponse inline questions) ═══ */}
                {!msg.isStreaming && msg.options && msg.options.length > 0 && (
                  <InlineOptions
                    options={msg.options}
                    onSend={(text, targetBot, _meta, extra) => {
                      if (targetBot) {
                        sendMessage(text, targetBot, undefined, extra);
                      } else {
                        handleOption(text);
                      }
                    }}
                    isActive={isLast}
                    msgType={msg.msgType}
                    agent={msg.agent}
                    activeRoster={activeRoster}
                    workspacePhase={workspacePhase}
                  />
                )}
                {/* ═══ Expert suggestion chips — quick consult from bubble footer ═══ */}
                {!msg.isStreaming && isLast && msg.consultationSuggestions && msg.consultationSuggestions.length > 0 && (
                  <ExpertSuggestionChips
                    suggestions={msg.consultationSuggestions}
                    onConsult={(s) => sendMessage(s.reason, s.consult)}
                  />
                )}
                {/* ═══ Cascade suggestion chips — reflexion/workspace actions ═══ */}
                {!msg.isStreaming && isLast && msg.cascadeSuggestions && msg.cascadeSuggestions.length > 0 && (
                  <CascadeChips
                    suggestions={msg.cascadeSuggestions}
                    onAction={(s) => sendMessage(s.message, chatTargetBot)}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Thinking step — UNE ligne qui défile, contextuelle par bot + icones S102-B */}
      {isTyping && !botAlreadyResponded && thinkingSteps.length > 0 && (() => {
        const streamMsg = [...messages].reverse().find(m => m.role === "assistant" && m.isStreaming);
        const thinkBot = streamMsg?.agent || activeBotCode;
        const ts = V3_STYLE[thinkBot] || DEFAULT_STYLE;
        const botName = BOT_NAME[thinkBot] || "CarlOS";
        const currentStep = thinkingSteps[thinkingSteps.length - 1];
        return (
          <div className="flex gap-2.5 animate-in fade-in duration-300">
            <div className={cn("w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 mt-0.5", ts.ring)}>
              <img src={BOT_AVATAR[thinkBot] || `/agents/${thinkBot.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
            </div>
            <div className={cn("border-l-[3px] border border-gray-200 rounded-xl rounded-tl-none px-3.5 py-2.5 shadow-sm", ts.border, ts.bubble)}>
              <div className={cn("flex items-center gap-2 text-sm", ts.text)}>
                {(() => { const DIcon = DEPT_DASH_ICON[thinkBot] || Bot; return <DIcon className="h-4 w-4 shrink-0 animate-pulse" />; })()}
                <span className="font-medium">{botName}</span>
                <span className="text-gray-500 animate-in fade-in duration-500" key={currentStep}>{currentStep}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Typing dots — quand le bot réfléchit sans thinking steps (seulement avant la reponse bot) */}
      {isTyping && !botAlreadyResponded && !isAnyStreaming && thinkingSteps.length === 0 && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (() => {
        const thinkBot2 = activeBotCode;
        const ts = V3_STYLE[thinkBot2] || DEFAULT_STYLE;
        const botName2 = BOT_NAME[thinkBot2] || "CarlOS";
        const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content;
        return (
          <div className="flex gap-2.5 animate-in fade-in duration-300">
            <div className={cn("w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 mt-0.5", ts.ring)}>
              <img src={BOT_AVATAR[thinkBot2] || `/agents/${thinkBot2.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
            </div>
            <div className={cn("border-l-[3px] border border-gray-200 rounded-xl rounded-tl-none px-3.5 py-2.5 shadow-sm", ts.border, ts.bubble)}>
              <div className={cn("flex items-center gap-2 text-sm", ts.text)}>
                {(() => { const DIcon = DEPT_DASH_ICON[thinkBot2] || Bot; return <DIcon className="h-4 w-4 shrink-0 animate-pulse" />; })()}
                <span className="font-medium">{botName2}</span>
                <ThinkingLabel botCode={thinkBot2} userText={lastUserMsg} />
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
function AgentSelector({ activeRoster, addBotToRoster, removeBotFromRoster, onConsultExpert }: {
  activeRoster: string[];
  addBotToRoster: (code: string) => void;
  removeBotFromRoster: (code: string) => void;
  onConsultExpert?: (code: string) => void;
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
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl border border-gray-200 shadow-xl py-2 z-30 max-h-[420px] overflow-auto">
          <div className="px-4 py-2 flex items-center gap-2 border-b border-gray-100 mb-1">
            <Users className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Brain Team</span>
            <span className="text-[9px] text-gray-400 ml-auto">{activeRoster.length} actifs</span>
          </div>
          {BOT_CODES.map((code) => {
            const inRoster = activeRoster.includes(code);
            const st = V3_STYLE[code] || DEFAULT_STYLE;
            return (
              <button
                key={code}
                onClick={() => {
                  if (inRoster) {
                    removeBotFromRoster(code);
                  } else {
                    addBotToRoster(code);
                    onConsultExpert?.(code);
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 transition-all cursor-pointer text-left group/agent mx-1 rounded-xl",
                  inRoster
                    ? "bg-blue-50/70 hover:bg-blue-50"
                    : "hover:bg-gray-50"
                )}
                style={{ width: "calc(100% - 8px)" }}
              >
                <div className={cn("w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 shadow-sm transition-all group-hover/agent:shadow-md", inRoster ? "ring-blue-400" : st.ring)}>
                  <img src={BOT_AVATAR[code] || `/agents/${code.toLowerCase()}.png`} alt={BOT_NAME[code]} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-gray-900 truncate">{BOT_NAME[code]}</span>
                    <span className={cn(
                      "text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0",
                      inRoster ? "bg-blue-200 text-blue-700" : "bg-gray-100 text-gray-500"
                    )}>{BOT_ROLE[code]?.split(" ")[0] || ""}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block truncate">{BOT_ROLE[code]}</span>
                </div>
                {inRoster ? (
                  <div className="shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <div className="shrink-0 w-5 h-5 rounded-full border-2 border-gray-200 group-hover/agent:border-blue-300 transition-colors" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══ DEPT WELCOME SCREEN — accueil dynamique par département ═══
function DeptWelcomeScreen({ botCode, onAction, onResumeThread, onDeleteThread, onRenameThread, threads }: {
  botCode: string;
  onAction: (text: string, phase?: PhaseKey) => void;
  onResumeThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onRenameThread: (threadId: string, newTitle: string) => void;
  threads: Array<{ id: string; title: string; primaryBot?: string; createdAt?: string; updatedAt?: string; status?: string; workPhase?: string }>;
}) {
  const DeptIcon = DEPT_DASH_ICON[botCode] || Bot;
  const gradient = DEPT_GRADIENT[botCode] || "from-blue-700 to-blue-500";
  const greeting = DEPT_GREETING[botCode] || "Comment puis-je t'aider?";
  const actions = DEPT_ACTIONS[botCode] || [];
  const botName = BOT_NAME[botCode] || "CarlOS";
  const botDisplay = BOT_DISPLAY[botCode];
  const recentThreads = threads;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

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
                  onClick={() => onAction(action.description, action.phase)}
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
                      {editingId === thread.id ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const trimmed = editValue.trim();
                              if (trimmed && trimmed !== thread.title) onRenameThread(thread.id, trimmed);
                              setEditingId(null);
                            } else if (e.key === "Escape") {
                              setEditingId(null);
                            }
                          }}
                          onBlur={() => {
                            const trimmed = editValue.trim();
                            if (trimmed && trimmed !== thread.title) onRenameThread(thread.id, trimmed);
                            setEditingId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-medium text-gray-700 w-full bg-white border border-blue-300 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-700 block truncate">{thread.title || "Discussion sans titre"}</span>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {phaseData && <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", phaseData.badge)}>{phaseData.label}</span>}
                        {statusLabel && (
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", statusStyle)}>{statusLabel}</span>
                        )}
                        {(thread.updatedAt || thread.createdAt) && (() => {
                          const dateStr = thread.updatedAt || thread.createdAt!;
                          const d = new Date(dateStr);
                          if (isNaN(d.getTime())) return null;
                          const now = Date.now();
                          const diffMs = now - d.getTime();
                          const diffMin = Math.floor(diffMs / 60000);
                          const diffH = Math.floor(diffMs / 3600000);
                          const diffD = Math.floor(diffMs / 86400000);
                          let label: string;
                          if (diffMin < 1) label = "a l'instant";
                          else if (diffMin < 60) label = `il y a ${diffMin} min`;
                          else if (diffH < 24) label = `il y a ${diffH} h`;
                          else if (diffD < 7) label = `il y a ${diffD} j`;
                          else label = d.toLocaleDateString("fr-CA", { day: "numeric", month: "short" });
                          return <span className="text-[9px] text-gray-400">{label}</span>;
                        })()}
                      </div>
                    </div>
                    {/* Rename button on hover */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditValue(thread.title || ""); setEditingId(thread.id); }}
                      className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-blue-100 transition-all cursor-pointer shrink-0"
                      title="Renommer"
                    >
                      <Pencil className="h-3 w-3 text-blue-400" />
                    </button>
                    {/* Delete button on hover */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteThread(thread.id); }}
                      className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all cursor-pointer shrink-0"
                      title="Supprimer"
                    >
                      <X className="h-3 w-3 text-red-400" />
                    </button>
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
  const { demoSimId } = useDemo();

  // Mode demo actif → afficher DemoChatPlayer a la place du vrai chat
  if (demoSimId) {
    return <DemoChatPlayer />;
  }

  return <DiscussionWindowInner />;
}

function DiscussionWindowInner() {
  const { cockpitTab, activeBotCode, activePhase, setActivePhase, setRightSection, setReflexionContext, setFocusType, setActiveDeliverable, credoPhase, reflexionContext, addWorkflowItem, activeMeeting: dwActiveMeeting, addWorkspaceBlock, workspaceBlocks, chatStage } = useAmorcer();
  const { activeRoster, addBotToRoster, removeBotFromRoster, messages, sendMessage, threads, resumeThread, deleteThread, renameThread, chatTargetBot, activeThreadId } = useChatContext();
  const isMobile = useIsMobile();
  const isOrbit9 = cockpitTab === "orbit9";
  const isEmpty = messages.length === 0;

  // S117: Lifted ControlPanel state — shared with ChatBoxV3 buttons
  const [cpOpen, setCpOpen] = useState(false);
  const [cpTab, setCpTab] = useState<"modes" | "agents" | "reunion">("modes");

  // URL-aware thread sync — quand l'URL contient /discussion/thread-XXXX,
  // charger ce thread si ce n'est pas déjà le thread actif
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/discussion\/(thread-[a-zA-Z0-9_-]+)/);
    if (!match) return;
    const urlThreadId = match[1];
    if (urlThreadId && urlThreadId !== activeThreadId) {
      const found = threads.find(t => t.id === urlThreadId);
      if (found) {
        resumeThread(urlThreadId, activePhase);
      }
    }
  }, [threads, activeThreadId, activePhase, resumeThread]);

  // Expert consultation moved to workspace SuggestedExpertsPanel (LiveDiscussionView)

  // Reset workspace au cockpit quand la discussion est vide (refresh, nouveau thread)
  // Évite d'avoir une phase orpheline sans messages
  // GUARD: ne PAS reset pendant un meeting actif (la discussion est vide au début, le transcript arrive après)
  useEffect(() => {
    if (isEmpty && activePhase && !dwActiveMeeting && !["observation", "attention", "moderation", "execution", "retroaction"].includes(activePhase)) {
      setActivePhase("observation" as PhaseKey);
      setReflexionContext(null);
      setRightSection("cockpit");
    }
  }, [isEmpty]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header UB_BLUE h-12 — design modélisé V3 */}
      <div className={cn("h-12 shrink-0 flex items-center gap-2 bg-[#073E5A]", "px-3")}>
        {isOrbit9 ? (
          <>
            <Atom className="h-4 w-4 text-white" />
            <span className="text-[11px] text-white font-medium">Orbit<sup className="text-[8px]">9</sup></span>
            <div className="flex-1" />
          </>
        ) : (
          <>
            <BrainCog className="h-4 w-4 text-white" />
            <span className="text-[11px] text-white font-medium">Brain Team</span>
            <div className="flex-1" />

            {/* Primary bot avatar only — experts moved to workspace */}
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white/30 shrink-0">
                <img src={BOT_AVATAR[activeBotCode] || `/agents/${activeBotCode.toLowerCase()}.png`} alt={BOT_NAME[activeBotCode] || activeBotCode} className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] text-white/80 font-medium">{BOT_NAME[activeBotCode] || activeBotCode}</span>
            </div>

          </>
        )}
      </div>

      {/* Zone principale: DeptWelcomeScreen quand vide, V3MessageList sinon */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isEmpty ? (
          <div className="flex-1 overflow-auto">
            <DeptWelcomeScreen
              botCode={activeBotCode}
              onAction={(text, phase) => {
                sendMessage(text, chatTargetBot, undefined, { workspacePhase: phase || "discussion" });
                setReflexionContext(text.substring(0, 80));
                setFocusType("chantier");
                setRightSection(null);
                // Phase explicite (du bouton) OU discussion par defaut — JAMAIS d'auto-détection
                const targetPhase = phase || "discussion";
                setActivePhase(targetPhase as any);
              }}
              onResumeThread={(threadId) => {
                const thread = threads.find(t => t.id === threadId);
                resumeThread(threadId, activePhase);
                const context = thread?.title || "";

                // Restaurer le contexte de réflexion (même logique que handleWorkAction)
                if (context) {
                  setReflexionContext(context);
                  setFocusType("chantier");
                }

                // Toujours afficher la discussion d'abord quand on reprend un thread
                // L'utilisateur veut voir les messages, pas le workspace
                setActivePhase("discussion" as any);
                setRightSection(null);
              }}
              onDeleteThread={(threadId) => deleteThread(threadId)}
              onRenameThread={(threadId, newTitle) => renameThread(threadId, newTitle)}
              threads={threads.filter((t) => t.primaryBot === activeBotCode).sort((a, b) => {
                const da = new Date(a.updatedAt || a.createdAt || 0).getTime();
                const db = new Date(b.updatedAt || b.createdAt || 0).getTime();
                return db - da;
              })}
            />
          </div>
        ) : (
          <V3MessageList />
        )}
      </div>

      {/* S117 Phase 3A: ControlPanel retractable — Modes / Agents / Reunion */}
      <ControlPanel isOpen={cpOpen} setIsOpen={setCpOpen} activeTab={cpTab} setActiveTab={setCpTab} />

      {/* ChatBox V3 — design Claude AI (SimAmorcer L676-754) branché sur sendMessage réel */}
      <ChatBoxV3 onOpenPanel={(tab: "modes" | "agents" | "reunion") => {
        if (cpOpen && cpTab === tab) { setCpOpen(false); }
        else { setCpTab(tab); setCpOpen(true); }
      }} />
    </div>
  );
}

// ═══ S117 Phase 3A: CONTROL PANEL — Footer retractable (Modes / Agents / Reunion) ═══
// Refonte v2: qualification flow, orange theme, no scroll agents, workspace routing

const REFLEXION_MODES: { id: string; label: string; icon: LucideIcon; color: string; prompt: string }[] = [
  { id: "brainstorm", label: "Brainstorm", icon: Lightbulb, color: "amber", prompt: "Lance un brainstorm créatif tous azimuts sur: " },
  { id: "analyser", label: "Analyser", icon: Eye, color: "blue", prompt: "Analyse approfondie structurée de: " },
  { id: "challenger", label: "Challenger", icon: Shield, color: "red", prompt: "Joue l'avocat du diable, challenge cette approche et trouve les failles de: " },
  { id: "debat", label: "Debat", icon: Swords, color: "rose", prompt: "Lance un debat structure pour/contre sur: " },
  { id: "deep_search", label: "Deep Search", icon: Globe, color: "cyan", prompt: "Recherche approfondie — tendances, benchmarks, meilleures pratiques pour: " },
  { id: "decision", label: "Decision", icon: CheckCircle2, color: "emerald", prompt: "Aide-moi a prendre une decision structuree sur: " },
  { id: "strategie", label: "Strategie", icon: Target, color: "purple", prompt: "Analyse strategique complete (SWOT, positionnement, recommandations) sur: " },
  { id: "crise", label: "Crise", icon: Zap, color: "orange", prompt: "Evaluation de crise et plan d'action 48h pour: " },
  { id: "innovation", label: "Innovation", icon: Sparkles, color: "pink", prompt: "Exploration innovation — tendances, disruption, opportunites pour: " },
];

const MODE_BUTTON_STYLES: Record<string, { bg: string; text: string; border: string; hover: string; iconColor: string }> = {
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   hover: "hover:bg-amber-100 hover:border-amber-300",     iconColor: "text-amber-500" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    hover: "hover:bg-blue-100 hover:border-blue-300",       iconColor: "text-blue-500" },
  red:     { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     hover: "hover:bg-red-100 hover:border-red-300",         iconColor: "text-red-500" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    hover: "hover:bg-rose-100 hover:border-rose-300",       iconColor: "text-rose-500" },
  cyan:    { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",    hover: "hover:bg-cyan-100 hover:border-cyan-300",       iconColor: "text-cyan-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", hover: "hover:bg-emerald-100 hover:border-emerald-300", iconColor: "text-emerald-500" },
  purple:  { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  hover: "hover:bg-purple-100 hover:border-purple-300",   iconColor: "text-purple-500" },
  orange:  { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  hover: "hover:bg-orange-100 hover:border-orange-300",   iconColor: "text-orange-500" },
  pink:    { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200",    hover: "hover:bg-pink-100 hover:border-pink-300",       iconColor: "text-pink-500" },
};

const PLAYBOOKS: { id: string; label: string; icon: LucideIcon; bots: string[]; desc: string; color: string; stages: string[] }[] = [
  { id: "libre", label: "Libre", icon: Video, bots: [], desc: "Sans format", color: "blue", stages: [] },
  { id: "board", label: "Board / CA", icon: Crown, bots: ["CEOB", "CFOB", "CSOB"], desc: "PV officiel, decisions", color: "indigo", stages: ["Ouverture", "Points a l'ordre", "Varia", "Cloture"] },
  { id: "client", label: "Rencontre Client", icon: Users, bots: ["CEOB", "CROB", "CMOB"], desc: "Discovery, objections", color: "emerald", stages: ["Decouverte", "Besoins", "Objections", "Conclusion"] },
  { id: "brainstorm", label: "Brainstorm", icon: Lightbulb, bots: ["CEOB", "CTOB", "CMOB"], desc: "Divergence → convergence", color: "amber", stages: ["Divergence", "Tri", "Convergence"] },
  { id: "crise", label: "Crise", icon: AlertTriangle, bots: ["CEOB", "COOB", "CFOB"], desc: "Evaluation, plan 48h", color: "red", stages: ["Evaluation", "Plan d'action", "Suivi"] },
  { id: "diagnostic", label: "Diagnostic VITAA", icon: Search, bots: ["CEOB", "COOB"], desc: "Etat des lieux", color: "sky", stages: ["Etat des lieux", "Analyse", "Recommandations"] },
  { id: "travail", label: "Reunion de travail", icon: Pencil, bots: ["CEOB"], desc: "Session de travail", color: "gray", stages: ["Objectifs", "Travail", "Recap"] },
  { id: "podcast", label: "Podcast", icon: Mic, bots: ["CEOB", "CMOB"], desc: "Co-animation", color: "pink", stages: ["Intro", "Discussion", "Outro"] },
  { id: "debat", label: "Debat", icon: Swords, bots: ["CEOB", "CSOB", "CMOB"], desc: "Pour/contre, verdict", color: "orange", stages: ["These", "Antithese", "Synthese"] },
  { id: "standup", label: "Stand-up", icon: Timer, bots: ["CEOB", "COOB"], desc: "Sync quotidien rapide", color: "cyan", stages: ["Tour de table", "Blocages", "Prochaines etapes"] },
  { id: "onboarding", label: "Onboarding", icon: UserPlus, bots: ["CEOB", "CHROB"], desc: "Accueil nouvel employe", color: "teal", stages: ["Presentation", "Culture", "Formation", "Plan 90j"] },
  { id: "formation", label: "Formation", icon: GraduationCap, bots: ["CEOB", "CHROB", "CTOB"], desc: "Session d'apprentissage", color: "violet", stages: ["Objectifs", "Contenu", "Exercices", "Evaluation"] },
  { id: "negociation", label: "Negociation", icon: Handshake, bots: ["CEOB", "CROB", "CFOB"], desc: "Fournisseur, partenaire", color: "lime", stages: ["Preparation", "Offre", "Contre-offre", "Accord"] },
  { id: "retro", label: "Retrospective", icon: RotateCcw, bots: ["CEOB", "COOB", "CTOB"], desc: "Bilan et amelioration", color: "purple", stages: ["Bilan", "Problemes", "Actions"] },
  { id: "pitch", label: "Pitch", icon: Presentation, bots: ["CEOB", "CMOB", "CFOB"], desc: "Investisseur, client", color: "blue", stages: ["Accroche", "Probleme", "Solution", "Ask"] },
  { id: "one_on_one", label: "One-on-one", icon: UserCheck, bots: ["CEOB"], desc: "Rencontre individuelle", color: "rose", stages: ["Check-in", "Objectifs", "Feedback"] },
  { id: "revue_finance", label: "Revue financiere", icon: DollarSign, bots: ["CEOB", "CFOB", "CROB"], desc: "Budget, resultats, previsions", color: "green", stages: ["Resultats", "Budget", "Previsions", "Decisions"] },
];

// colorName used to derive Tailwind classes: bg-{colorName}-50, border-{colorName}-200, text-{colorName}-700
const BOT_LIST_CP = [
  { code: "CEOB", name: "CarlOS", role: "CEO", color: "bg-sky-500", colorName: "sky" },
  { code: "CTOB", name: "Tim", role: "CTO", color: "bg-violet-500", colorName: "violet" },
  { code: "CFOB", name: "Frank", role: "CFO", color: "bg-emerald-500", colorName: "emerald" },
  { code: "CMOB", name: "Mathilde", role: "CMO", color: "bg-pink-500", colorName: "pink" },
  { code: "CSOB", name: "Simone", role: "CSO", color: "bg-red-500", colorName: "red" },
  { code: "COOB", name: "Olivier", role: "COO", color: "bg-orange-500", colorName: "orange" },
  { code: "CPOB", name: "Paco", role: "CPO", color: "bg-sky-600", colorName: "sky" },
  { code: "CHROB", name: "Helene", role: "CHRO", color: "bg-amber-500", colorName: "amber" },
  { code: "CROB", name: "Rich", role: "CRO", color: "bg-lime-600", colorName: "lime" },
  { code: "CISOB", name: "Sebastien", role: "CISO", color: "bg-slate-600", colorName: "slate" },
  { code: "CLOB", name: "Loulou", role: "CLO", color: "bg-indigo-500", colorName: "indigo" },
  { code: "CINOB", name: "Ines", role: "CINO", color: "bg-teal-500", colorName: "teal" },
];

// Tailwind color class map for dynamic bot-colored pills (all classes explicit for JIT)
const BOT_PILL_STYLES: Record<string, { bg: string; border: string; text: string; textLight: string; ring: string }> = {
  sky: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", textLight: "text-sky-400", ring: "ring-sky-200" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", textLight: "text-violet-400", ring: "ring-violet-200" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", textLight: "text-emerald-400", ring: "ring-emerald-200" },
  pink: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", textLight: "text-pink-400", ring: "ring-pink-200" },
  red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", textLight: "text-red-400", ring: "ring-red-200" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", textLight: "text-orange-400", ring: "ring-orange-200" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", textLight: "text-amber-400", ring: "ring-amber-200" },
  lime: { bg: "bg-lime-50", border: "border-lime-200", text: "text-lime-700", textLight: "text-lime-400", ring: "ring-lime-200" },
  slate: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", textLight: "text-slate-400", ring: "ring-slate-200" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", textLight: "text-indigo-400", ring: "ring-indigo-200" },
  teal: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", textLight: "text-teal-400", ring: "ring-teal-200" },
};

function ControlPanel({ isOpen, setIsOpen, activeTab, setActiveTab }: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  activeTab: "modes" | "agents" | "reunion";
  setActiveTab: (v: "modes" | "agents" | "reunion") => void;
}) {
  // Qualification flow state (modes)
  const [qualMode, setQualMode] = useState<typeof REFLEXION_MODES[0] | null>(null);
  const [qualParticipants, setQualParticipants] = useState<"solo" | "duo" | "equipe">("duo");
  const [qualExperts, setQualExperts] = useState<string[]>([]);
  const [qualSubject, setQualSubject] = useState("");
  // Qualification flow state (reunion)
  const [qualPlaybook, setQualPlaybook] = useState<typeof PLAYBOOKS[0] | null>(null);
  const [reunionSubject, setReunionSubject] = useState("");

  const { activeBotCode, setActivePhase, setReflexionContext, setRightSection, setActiveMeeting, setReflexionSetup } = useAmorcer();
  const { activeRoster, addBotToRoster, removeBotFromRoster, sendMessage } = useChatContext();

  const startQualification = useCallback((mode: typeof REFLEXION_MODES[0]) => {
    setQualMode(mode);
    setQualExperts([]);
    setQualSubject("");
    setQualParticipants("duo");
  }, []);

  const cancelQualification = useCallback(() => {
    setQualMode(null);
  }, []);

  const launchMode = useCallback(() => {
    if (!qualMode) return;
    // Route to workspace setup panel (ReflexionSetupPanel in LiveDiscussionView)
    setReflexionSetup({
      mode: qualMode.id,
      participants: qualParticipants,
      experts: qualExperts,
      subject: qualSubject.trim(),
    });
    setActivePhase("reflexion" as PhaseKey);
    setRightSection(null);
    setIsOpen(false);
    setQualMode(null);
  }, [qualMode, qualSubject, qualExperts, qualParticipants, setReflexionSetup, setActivePhase, setRightSection, setIsOpen]);

  const toggleExpert = useCallback((code: string) => {
    setQualExperts(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  }, []);

  const startPlaybookQualification = useCallback((pb: typeof PLAYBOOKS[0]) => {
    setQualPlaybook(pb);
    setReunionSubject("");
  }, []);

  const cancelPlaybookQualification = useCallback(() => {
    setQualPlaybook(null);
  }, []);

  const launchPlaybook = useCallback(() => {
    if (!qualPlaybook) return;
    const bots = qualPlaybook.bots.length > 0 ? qualPlaybook.bots : (activeRoster.length > 0 ? activeRoster : [activeBotCode]);
    bots.forEach(code => {
      if (!activeRoster.includes(code)) addBotToRoster(code);
    });
    setActiveMeeting({
      type: qualPlaybook.id,
      title: reunionSubject.trim() || `${qualPlaybook.label}: ${qualPlaybook.desc}`,
      botCodes: bots,
    });
    setRightSection(null);
    setIsOpen(false);
    setQualPlaybook(null);
  }, [qualPlaybook, reunionSubject, activeRoster, activeBotCode, addBotToRoster, setActiveMeeting, setRightSection, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="shrink-0 bg-white border-t border-gray-200 flex flex-col">
      {/* No internal tab bar — toolbar buttons ARE the tabs. Just a close button. */}
      <div className="flex items-center justify-end px-3 pt-2">
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
          <X className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>

      {/* Tab content */}
      <div className="px-3 pb-3">
        {/* ═══ MODES DE REFLEXION ═══ */}
        {activeTab === "modes" && !qualMode && (
          <div>
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Lancer un mode de reflexion</div>
            <div className="grid grid-cols-3 gap-1.5">
              {REFLEXION_MODES.map(mode => {
                const ms = MODE_BUTTON_STYLES[mode.color] || MODE_BUTTON_STYLES.amber;
                return (
                  <button
                    key={mode.id}
                    onClick={() => startQualification(mode)}
                    className={cn("flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[10px] font-medium border cursor-pointer transition-colors", ms.bg, ms.text, ms.border, ms.hover)}
                  >
                    <mode.icon className={cn("h-3.5 w-3.5 shrink-0", ms.iconColor)} />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ QUALIFICATION FLOW — MODES (replaces grid when mode selected) ═══ */}
        {activeTab === "modes" && qualMode && (
          <div>
            <div className="px-3 py-2 -mx-3 -mt-0 bg-orange-50 border-b border-orange-100 flex items-center gap-2 mb-3">
              <qualMode.icon className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-bold text-orange-700">{qualMode.label}</span>
              <button onClick={cancelQualification} className="ml-auto text-[9px] text-gray-400 hover:text-gray-600 cursor-pointer">
                ✕ Annuler
              </button>
            </div>
            <div className="space-y-3">
              {/* Q1: Participants */}
              <div>
                <div className="text-[10px] font-bold text-gray-600 mb-1.5">Qui participe?</div>
                <div className="flex gap-1.5">
                  {([
                    { key: "solo" as const, label: "Solo" },
                    { key: "duo" as const, label: "Duo (1 expert)" },
                    { key: "equipe" as const, label: "Equipe (2-4)" },
                  ]).map(p => (
                    <button
                      key={p.key}
                      onClick={() => setQualParticipants(p.key)}
                      className={cn(
                        "flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border text-center cursor-pointer transition-colors",
                        qualParticipants === p.key
                          ? "border-orange-300 bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                          : "border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Q2: Experts — pills colored per bot */}
              {qualParticipants !== "solo" && (
                <div>
                  <div className="text-[10px] font-bold text-gray-600 mb-1.5">Quel(s) expert(s)?</div>
                  <div className="flex flex-wrap gap-1">
                    {BOT_LIST_CP.filter(b => b.code !== activeBotCode).map(bot => {
                      const isSelected = qualExperts.includes(bot.code);
                      const ps = BOT_PILL_STYLES[bot.colorName] || BOT_PILL_STYLES.sky;
                      return (
                        <button
                          key={bot.code}
                          onClick={() => toggleExpert(bot.code)}
                          className={cn(
                            "px-2 py-1 rounded-full text-[9px] font-medium border flex items-center gap-1 cursor-pointer transition-colors",
                            isSelected
                              ? `${ps.border} ${ps.bg} ${ps.text} ring-1 ${ps.ring}`
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          )}
                        >
                          {(() => { const DeptIcon = DEPT_DASH_ICON[bot.code]; return DeptIcon ? <DeptIcon className={cn("h-3 w-3 shrink-0", ps.text)} /> : null; })()}
                          {bot.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Q3: Sujet */}
              <div>
                <div className="text-[10px] font-bold text-gray-600 mb-1.5">Sujet de la reflexion</div>
                <input
                  type="text"
                  value={qualSubject}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setQualSubject(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && launchMode()}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-300 bg-white outline-none"
                  placeholder="Decris le sujet..."
                />
              </div>
              {/* Launch button */}
              <button
                onClick={launchMode}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 shadow-sm cursor-pointer transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                Lancer →
              </button>
            </div>
          </div>
        )}

        {/* ═══ AGENTS ═══ */}
        {activeTab === "agents" && (
          <div className="space-y-3">
            {/* Section 1 — Bots actifs */}
            {activeRoster.length > 0 && (
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2">Bots actifs</div>
                <div className="space-y-1.5">
                  {activeRoster.map(code => {
                    const bot = BOT_LIST_CP.find(b => b.code === code);
                    const ps = BOT_PILL_STYLES[bot?.colorName || "sky"] || BOT_PILL_STYLES.sky;
                    const avatarUrl = BOT_AVATAR[code];
                    return (
                      <div key={code} className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl border shadow-sm",
                        ps.bg, ps.border
                      )}>
                        <div className={cn("w-9 h-9 rounded-full shrink-0 overflow-hidden ring-2", ps.ring)}>
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={bot?.name || code} className="w-full h-full object-cover" />
                          ) : (
                            <span className={cn("w-full h-full flex items-center justify-center text-white text-[10px] font-bold", bot?.color || "bg-sky-500")}>
                              {(bot?.name || code).substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-900">{bot?.name || code}</div>
                          <div className="text-[10px] text-gray-500">{bot?.role}</div>
                        </div>
                        <button onClick={() => removeBotFromRoster(code)} className="text-[10px] text-red-400 hover:text-red-600 cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Section 2 — Ajouter un expert — style tour de controle avec avatar photo */}
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2">Ajouter un expert</div>
              <div className="grid grid-cols-4 gap-2">
                {BOT_LIST_CP.filter(b => !activeRoster.includes(b.code) && b.code !== activeBotCode).map(bot => {
                  const avatarUrl = BOT_AVATAR[bot.code];
                  const ps = BOT_PILL_STYLES[bot.colorName] || BOT_PILL_STYLES.sky;
                  const gradientMap: Record<string, string> = {
                    sky: "from-sky-100 to-sky-200", violet: "from-violet-100 to-violet-200",
                    emerald: "from-emerald-100 to-emerald-200", pink: "from-pink-100 to-pink-200",
                    red: "from-red-100 to-red-200", orange: "from-orange-100 to-orange-200",
                    amber: "from-amber-100 to-amber-200", lime: "from-lime-100 to-lime-200",
                    slate: "from-slate-100 to-slate-200", indigo: "from-indigo-100 to-indigo-200",
                    teal: "from-teal-100 to-teal-200",
                  };
                  const shadowMap: Record<string, string> = {
                    sky: "group-hover:shadow-sky-200/60", violet: "group-hover:shadow-violet-200/60",
                    emerald: "group-hover:shadow-emerald-200/60", pink: "group-hover:shadow-pink-200/60",
                    red: "group-hover:shadow-red-200/60", orange: "group-hover:shadow-orange-200/60",
                    amber: "group-hover:shadow-amber-200/60", lime: "group-hover:shadow-lime-200/60",
                    slate: "group-hover:shadow-slate-200/60", indigo: "group-hover:shadow-indigo-200/60",
                    teal: "group-hover:shadow-teal-200/60",
                  };
                  return (
                    <button
                      key={bot.code}
                      onClick={() => addBotToRoster(bot.code)}
                      className={cn(
                        "group relative flex flex-col items-center rounded-xl overflow-hidden bg-white border border-gray-100 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
                        shadowMap[bot.colorName] || "group-hover:shadow-gray-200/60"
                      )}
                    >
                      {/* Gradient banner top */}
                      <div className={cn("w-full h-5 bg-gradient-to-r", gradientMap[bot.colorName] || "from-sky-400 to-sky-600")} />
                      {/* Avatar overlapping the banner */}
                      <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white -mt-4 shadow-sm">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={bot.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className={cn("w-full h-full flex items-center justify-center text-white text-[11px] font-bold", bot.color)}>
                            {bot.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Name + role — punchy style */}
                      <div className="text-center px-1 pt-1.5 pb-2.5">
                        <div className={cn("text-[11px] font-extrabold tracking-tight leading-none", ps.text)}>{bot.name}</div>
                        <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider leading-tight mt-0.5">{bot.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ REUNION ═══ */}
        {activeTab === "reunion" && !qualPlaybook && (
          <div>
            {/* Nouvelle reunion (libre) — top card dashed */}
            <button
              onClick={() => startPlaybookQualification(PLAYBOOKS[0])}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-colors mb-3"
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-blue-200 flex items-center justify-center shrink-0">
                <Video className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[10px] font-bold text-gray-800">Nouvelle reunion</div>
                <div className="text-[9px] text-gray-500">Format libre, choisissez vos participants</div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            </button>

            {/* Ou choisir un playbook */}
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ou choisir un playbook</div>
            <div className="grid grid-cols-4 gap-1.5">
              {PLAYBOOKS.slice(1).map(pb => {
                const hoverMap: Record<string, string> = {
                  indigo: "hover:bg-indigo-50 hover:border-indigo-200",
                  emerald: "hover:bg-emerald-50 hover:border-emerald-200",
                  amber: "hover:bg-amber-50 hover:border-amber-200",
                  red: "hover:bg-red-50 hover:border-red-200",
                  sky: "hover:bg-sky-50 hover:border-sky-200",
                  gray: "hover:bg-gray-50 hover:border-gray-300",
                  pink: "hover:bg-pink-50 hover:border-pink-200",
                  orange: "hover:bg-orange-50 hover:border-orange-200",
                  cyan: "hover:bg-cyan-50 hover:border-cyan-200",
                  teal: "hover:bg-teal-50 hover:border-teal-200",
                  violet: "hover:bg-violet-50 hover:border-violet-200",
                  lime: "hover:bg-lime-50 hover:border-lime-200",
                  purple: "hover:bg-purple-50 hover:border-purple-200",
                  blue: "hover:bg-blue-50 hover:border-blue-200",
                  rose: "hover:bg-rose-50 hover:border-rose-200",
                  green: "hover:bg-green-50 hover:border-green-200",
                };
                const iconColorMap: Record<string, string> = {
                  indigo: "text-indigo-500", emerald: "text-emerald-500", amber: "text-amber-500",
                  red: "text-red-500", sky: "text-sky-500", gray: "text-gray-400",
                  pink: "text-pink-500", orange: "text-orange-500", cyan: "text-cyan-500",
                  teal: "text-teal-500", violet: "text-violet-500", lime: "text-lime-600",
                  purple: "text-purple-500", blue: "text-blue-500", rose: "text-rose-500",
                  green: "text-green-600",
                };
                return (
                  <button
                    key={pb.id}
                    onClick={() => startPlaybookQualification(pb)}
                    className={cn(
                      "flex flex-col items-center gap-1 px-1.5 py-2 rounded-lg border border-gray-200 bg-white cursor-pointer transition-colors text-center",
                      hoverMap[pb.color] || "hover:bg-gray-50 hover:border-gray-300"
                    )}
                  >
                    <pb.icon className={cn("h-4 w-4 shrink-0", iconColorMap[pb.color] || "text-gray-500")} />
                    <div className="text-[9px] font-bold text-gray-700 leading-tight">{pb.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ QUALIFICATION FLOW — REUNION (replaces grid when playbook selected) ═══ */}
        {activeTab === "reunion" && qualPlaybook && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <qualPlaybook.icon className="h-4 w-4 text-gray-600" />
              <span className="text-xs font-bold text-gray-700">{qualPlaybook.label}</span>
              <button onClick={cancelPlaybookQualification} className="ml-auto text-[9px] text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer">
                ← Retour
              </button>
            </div>
            <div className="space-y-3">
              {/* Flow stages pills — per-playbook numbered stages */}
              {qualPlaybook.stages.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-gray-600 mb-1">Deroulement (playbook)</div>
                  <div className="flex gap-1 flex-wrap">
                    {qualPlaybook.stages.map((stage, i) => {
                      const isFirst = i === 0;
                      const isLast = i === qualPlaybook.stages.length - 1;
                      return (
                        <span
                          key={stage}
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[8px] font-medium border",
                            isFirst ? "bg-sky-100 text-sky-700 border-sky-200"
                              : isLast ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-600 border-blue-100"
                          )}
                        >
                          {i + 1}. {stage}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Bots invites — colored per bot with role */}
              <div>
                <div className="text-[10px] font-bold text-gray-600 mb-1">Bots invites <span className="font-normal text-gray-400">(modifiable)</span></div>
                <div className="flex flex-wrap gap-1">
                  {qualPlaybook.bots.map(code => {
                    const bot = BOT_LIST_CP.find(b => b.code === code);
                    const ps = BOT_PILL_STYLES[bot?.colorName || "sky"] || BOT_PILL_STYLES.sky;
                    return (
                      <span key={code} className={cn("px-2 py-1 rounded-full text-[9px] font-medium border flex items-center gap-1", ps.bg, ps.text, ps.border)}>
                        {(() => { const DeptIcon = DEPT_DASH_ICON[code]; return DeptIcon ? <DeptIcon className="h-3 w-3 shrink-0" /> : null; })()}
                        {bot?.name || code} <span className={ps.textLight}>{bot?.role}</span>
                      </span>
                    );
                  })}
                  <button
                    onClick={() => { setActiveTab("agents"); }}
                    className="px-2 py-1 rounded-full text-[9px] font-medium border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 cursor-pointer transition-colors"
                  >
                    + Ajouter
                  </button>
                </div>
              </div>
              {/* Sujet */}
              <div>
                <div className="text-[10px] font-bold text-gray-600 mb-1">Sujet de la reunion</div>
                <input
                  type="text"
                  value={reunionSubject}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setReunionSubject(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && launchPlaybook()}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white outline-none"
                  placeholder="Ex: Budget Q3, Expansion Ontario..."
                />
              </div>
              {/* Launch button — dark navy */}
              <button
                onClick={launchPlaybook}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#073E5A] text-white text-xs font-bold hover:opacity-90 shadow-sm cursor-pointer transition-colors"
              >
                <Video className="h-3.5 w-3.5" />
                Demarrer la reunion →
              </button>
            </div>
          </div>
        )}
      </div>
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

function ChatBoxV3({ onOpenPanel }: { onOpenPanel?: (tab: "modes" | "agents" | "reunion") => void }) {
  const [inputText, setInputText] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [showIntegrationsPanel, setShowIntegrationsPanel] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // visionInputRef retiré — Vision = app mobile (Ray-Ban Meta)
  const { sendMessage, sendMultiPerspective, injectVoiceMessage, newConversation, chatTargetBot, activeRoster } = useChatContext();
  const { activeBotCode, activePhase, setRightSection, reflexionContext, setReflexionContext, setFocusType, setActivePhase, activeMeeting, chatStage, workspaceBlocks } = useAmorcer();
  // setRightSection utilisé par "Connecteurs API" dans le menu + pour Drive picker
  // Enrichir activePhase avec le step CREDO pour que le backend injecte le bon prompt
  const _credoStepsCB = ["comprendre", "rechercher", "exposer", "demontrer", "objectif"];
  const workspacePhase = activePhase === "discussion" && chatStage < _credoStepsCB.length
    ? `discussion_${_credoStepsCB[chatStage]}`
    : activePhase;

  // ═══ VOICE CALL STATE ═══
  const [callState, setCallState] = useState<CallState>("idle");
  const [micOn, setMicOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ file: File; previewUrl?: string; isImage: boolean } | null>(null);
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

  // ═══ MEETING TRANSCRIPT POLLING ═══
  const meetingPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const meetingCursorRef = useRef(0);

  useEffect(() => {
    // Quand activeMeeting a un slug → démarrer le polling transcript
    const slug = activeMeeting?.slug;
    if (!slug) {
      if (meetingPollRef.current) { clearInterval(meetingPollRef.current); meetingPollRef.current = null; }
      meetingCursorRef.current = 0;
      return;
    }
    meetingCursorRef.current = 0;
    meetingPollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/v1/meetings/${slug}/transcript?cursor=${meetingCursorRef.current}`,
          { headers: { "X-API-Key": import.meta.env.VITE_API_KEY || "" } }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.entries?.length > 0) {
          for (const entry of data.entries) {
            const role = entry.speaker === "user" ? "user" : "assistant";
            injectRef.current(role, entry.text, entry.agent || undefined, role === "assistant" ? {
              options: entry.options,
              canvasActions: entry.canvas_actions,
              teamProposal: entry.team_proposal,
              phaseCredo: entry.phase_credo,
              bubbleContext: entry.bubble_context,
              isDiagnostic: entry.is_diagnostic,
              ghostActif: entry.ghost_actif,
              cascadeSuggestions: entry.cascade_suggestions,
              scaffoldProgress: entry.scaffold_progress,
            } : undefined);
          }
          meetingCursorRef.current = data.cursor ?? (meetingCursorRef.current + data.entries.length);
        }
      } catch { /* retry next poll */ }
    }, 3000);
    return () => {
      if (meetingPollRef.current) { clearInterval(meetingPollRef.current); meetingPollRef.current = null; }
    };
  }, [activeMeeting?.slug]);

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
            if (evt.type === "user_transcript") {
              // Transcript immediat — affiche le texte user des qu'il parle
              if (evt.user_text) injectRef.current("user", evt.user_text);
            } else if (evt.type === "exchange") {
              if (evt.user_text) injectRef.current("user", evt.user_text);
              if (evt.bot_text) injectRef.current("assistant", evt.bot_text, evt.agent, {
                options: evt.options,
                canvasActions: evt.canvas_actions,
                teamProposal: evt.team_proposal,
                phaseCredo: evt.phase_credo,
                bubbleContext: evt.bubble_context,
                isDiagnostic: evt.is_diagnostic,
                ghostActif: evt.ghost_actif,
                tier: evt.tier,
                latenceMs: evt.latence_ms,
                cascadeSuggestions: evt.cascade_suggestions,
                scaffoldProgress: evt.scaffold_progress,
              });
            }
          }
          pollCursorRef.current = data.cursor;
        }
      } catch { /* retry next poll */ }
    }, 800);
  }, []);

  const stopVoicePolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    pollCursorRef.current = 0;
  }, []);

  // ═══ END CALL ═══
  const endCall = useCallback(() => {
    userHangupRef.current = true;
    // Notify backend to cleanup voice events for this room
    const roomName = roomRef.current?.name;
    if (roomName) {
      fetch(`/api/v1/voice/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": import.meta.env.VITE_API_KEY || "" },
        body: JSON.stringify({ room_name: roomName }),
      }).catch(() => {});
    }
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
    // PAS de newConversation() — le vocal injecte dans la discussion active
    // Le user voit ses messages texte + vocaux dans le meme fil

    // Mobile autoplay fix: warm up AudioContext during user gesture (synchronous, before any await)
    // iOS/Android require AudioContext.resume() within a tap/click context
    try {
      const _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (_ctx.state === "suspended") _ctx.resume();
    } catch {}

    // Pre-create audio element during user gesture
    if (!audioElRef.current) {
      audioElRef.current = document.createElement("audio");
      audioElRef.current.autoplay = true;
      document.body.appendChild(audioElRef.current);
    }

    try {
      const tokenData = await api.voiceToken(activeBotCode, 1, false);
      const room = new Room({ adaptiveStream: true, dynacast: true, disconnectOnPageLeave: false });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub: RemoteTrackPublication, _p: Participant) => {
        if (track.kind === Track.Kind.Audio) {
          if (!audioElRef.current) {
            audioElRef.current = document.createElement("audio");
            audioElRef.current.autoplay = true;
            (audioElRef.current as any).playsInline = true;
            document.body.appendChild(audioElRef.current);
          }
          track.attach(audioElRef.current);
          audioElRef.current.play().catch(() => {});
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
      // LiveKit native autoplay handler — enables audio playback on mobile browsers
      room.startAudio().catch(() => {});
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
      if (injectRef.current) {
        injectRef.current("system",
          "Connexion vocale échouée. Vérifiez votre micro et réessayez.",
          undefined, {}
        );
      }
      setTimeout(() => setCallState("idle"), 5000);
    }
  }, [activeBotCode, callState, endCall, startVoicePolling]);

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
  const [visionActive, setVisionActive] = useState(false);
  const handleVision = useCallback(() => {
    // Mobile: deep link vers l'APK CarlOS Vision + polling transcripts
    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobileDevice) {
      window.location.href = "cameraaccess://launch";
    }
    // Start polling vision room transcripts (mobile + desktop pour la demo)
    startVoicePolling("carlos-vision-rayban");
    setVisionActive(true);
  }, [startVoicePolling]);

  // ═══ FILE UPLOAD — sélection locale → preview chip, upload au Send ═══
  const handleFileUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setShowAttachMenu(false);
    const isImage = file.type.startsWith("image/");
    const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
    setPendingFile({ file, previewUrl, isImage });
  }, []);

  const removePendingFile = useCallback(() => {
    setPendingFile(prev => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  }, []);

  // ═══ TEXT HANDLERS ═══
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text && !pendingFile) return;
    setInputText("");

    // FIX Lacune 1 + Sprint 3: Entrer en Discussion AVANT le sendMessage pour que workspacePhase
    // soit "discussion_comprendre" des le premier message (au lieu de "observation")
    let effectivePhase = workspacePhase;
    if (!reflexionContext) {
      setReflexionContext((text || pendingFile?.file.name || "").substring(0, 80));
    }
    // Sprint 3 fix: si workspacePhase est falsy ou incohérent avec l'URL discussion, corriger
    const _isDiscURL = window.location.pathname.includes("/discussion/");
    if (!effectivePhase || effectivePhase === "observation" || (_isDiscURL && !effectivePhase.startsWith("discussion"))) {
      setActivePhase("discussion" as any);
      setRightSection(null);
      effectivePhase = `discussion_${_credoStepsCB[chatStage] || "comprendre"}`;
    }

    // Si un fichier est en attente — upload au moment du Send
    if (pendingFile) {
      const fileCopy = pendingFile;
      setPendingFile(null);
      if (fileCopy.previewUrl) URL.revokeObjectURL(fileCopy.previewUrl);
      setUploading(true);
      try {
        const docExts = [".pdf", ".docx", ".doc", ".txt", ".md", ".rtf"];
        const ext = fileCopy.file.name.substring(fileCopy.file.name.lastIndexOf(".")).toLowerCase();
        const isDocument = docExts.includes(ext);
        if (isDocument) {
          const formData = new FormData();
          formData.append("file", fileCopy.file);
          formData.append("bot_code", chatTargetBot);
          const res = await fetch("/api/v1/workspace/upload-restructure", {
            method: "POST",
            headers: { "X-API-Key": localStorage.getItem("bt_api_key") || "" },
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            const msg = text ? `${text}\n\n[Document: ${fileCopy.file.name}]` : `Document: ${fileCopy.file.name}`;
            sendMessage(msg, chatTargetBot, undefined, { workspacePhase: effectivePhase, workspaceExpertContext: buildExpertContext(workspaceBlocks, activeBotCode) });
            if (data.sections?.length) {
              window.dispatchEvent(new CustomEvent("bt-start-deliverable", {
                detail: { deliverableType: "docforge_section", sections: data.sections, fileName: fileCopy.file.name },
              }));
            }
          } else {
            const result = await api.uploadBureauFile(fileCopy.file, fileCopy.file.name);
            const msg = text ? `${text}\n\n[Fichier joint: ${result.titre || fileCopy.file.name}]` : `Fichier joint: ${result.titre || fileCopy.file.name}`;
            sendMessage(msg, chatTargetBot, undefined, { workspacePhase: effectivePhase, workspaceExpertContext: buildExpertContext(workspaceBlocks, activeBotCode) });
          }
        } else {
          const result = await api.uploadBureauFile(fileCopy.file, fileCopy.file.name);
          const msg = text ? `${text}\n\n[Fichier joint: ${result.titre || fileCopy.file.name}]` : `Fichier joint: ${result.titre || fileCopy.file.name}`;
          sendMessage(msg, chatTargetBot, undefined, { workspacePhase: effectivePhase, workspaceExpertContext: buildExpertContext(workspaceBlocks, activeBotCode) });
        }
      } catch (err) {
        console.error("[ChatBoxV3] Upload error:", err);
      } finally {
        setUploading(false);
      }
    } else {
      // W.1: Discussion 1:1 — toujours single-bot (experts dans le workspace)
      sendMessage(text, chatTargetBot, undefined, { workspacePhase: effectivePhase, workspaceExpertContext: buildExpertContext(workspaceBlocks, activeBotCode) });
    }

    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isInCall = callState === "connected" || callState === "connecting";
  const botName = BOT_NAME[chatTargetBot] || BOT_NAME[activeBotCode] || "CarlOS";

  return (
    <div className="shrink-0 bg-white px-3 pb-2 pt-1">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
      {/* Drive / fichiers picker */}
      {showDrivePicker && (
        <DrivePickerModal
          botCode={chatTargetBot}
          onClose={() => setShowDrivePicker(false)}
          onSelect={(content, label) => {
            setShowDrivePicker(false);
            sendMessage(`[Fichier joint: ${label}]\n\n${content}`, chatTargetBot);
          }}
        />
      )}
      {/* Panneau connecteurs API */}
      {showIntegrationsPanel && (
        <IntegrationsPanel onClose={() => setShowIntegrationsPanel(false)} />
      )}
      {/* Vision toast — disponible dans l'app mobile */}
      {visionToast && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-4 py-2 rounded-full shadow-lg z-30 whitespace-nowrap">
          Ouvre l&apos;app CarlOS Vision sur ton téléphone
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

      <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/50 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100/80 focus-within:shadow-md transition-all">
        {/* Fichier en attente — preview avant envoi */}
        {pendingFile && (
          <div className="px-3 pt-2.5 pb-1 flex items-center gap-2">
            {pendingFile.isImage && pendingFile.previewUrl ? (
              <img
                src={pendingFile.previewUrl}
                alt={pendingFile.file.name}
                className="h-14 w-14 rounded-lg object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2.5 py-1.5 max-w-[180px]">
                <FileText className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                <span className="text-[11px] text-gray-700 truncate">{pendingFile.file.name}</span>
              </div>
            )}
            <button
              onClick={removePendingFile}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              title="Retirer"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          </div>
        )}
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Parle a ${botName}...`}
          className="w-full text-[13px] leading-relaxed px-4 pt-3.5 pb-2 rounded-t-2xl border-0 focus:outline-none min-h-[72px] resize-none bg-transparent placeholder:text-gray-400"
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
                <button onClick={() => { setShowAttachMenu(false); setTimeout(() => fileInputRef.current?.click(), 10); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                  <Paperclip className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-700">Pièce jointe</span>
                </button>
                <button onClick={() => { setShowAttachMenu(false); setShowIntegrationsPanel(false); setShowDrivePicker(true); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                  <Globe className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-gray-700">Depuis Google Drive</span>
                </button>
                <button onClick={() => { setShowAttachMenu(false); setShowDrivePicker(true); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                  <Zap className="h-4 w-4 text-gray-700" />
                  <span className="text-xs text-gray-700">Depuis GitHub</span>
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => { setShowAttachMenu(false); setShowIntegrationsPanel(true); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                  <Activity className="h-4 w-4 text-indigo-500" />
                  <div>
                    <span className="text-xs text-gray-700">Connecteurs API</span>
                    <span className="block text-xs text-gray-400">Slack, HubSpot, GitHub, Stripe...</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Toolbar compact: Discussion / Réunion / Vision | Réflexions / Agents */}
          <button
            onClick={isInCall ? endCall : startCall}
            className={cn(
              "flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer",
              isInCall ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            )}
            title={isInCall ? "Raccrocher" : "Discussion vocale"}
          >
            {callState === "connecting" ? <Loader2 className="h-3 w-3 animate-spin" /> : isInCall ? <PhoneOff className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
            {isInCall ? "Raccrocher" : "Discussion"}
          </button>
          <button
            onClick={() => onOpenPanel?.("reunion")}
            className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            title="Réunion AI"
          >
            <Video className="h-3 w-3" />Reunion
          </button>
          <button
            onClick={visionActive ? () => { stopVoicePolling(); setVisionActive(false); } : handleVision}
            className={cn(
              "flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer",
              visionActive ? "bg-cyan-600 text-white hover:bg-cyan-700" : "bg-cyan-50 text-cyan-600 hover:bg-cyan-100"
            )}
            title={visionActive ? "Arrêter Vision" : "Vision Ray-Ban"}
          >
            <Glasses className="h-3 w-3" />{visionActive ? "Vision ON" : "Vision"}
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <button
            onClick={() => onOpenPanel?.("modes")}
            className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer bg-orange-50 text-orange-600 hover:bg-orange-100"
            title="Modes de réflexion"
          >
            <Brain className="h-3 w-3" />Modes
          </button>
          <button
            onClick={() => onOpenPanel?.("agents")}
            className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer bg-orange-50 text-orange-600 hover:bg-orange-100"
            title="Agents impliqués"
          >
            <Bot className="h-3 w-3" />+ Agents
          </button>

          <div className="flex-1" />

          {/* Bouton Envoyer — apparait quand il y a du texte */}
          <button
            onClick={handleSend}
            className={cn(
              "p-2.5 rounded-xl transition-all cursor-pointer",
              inputText.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95"
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

