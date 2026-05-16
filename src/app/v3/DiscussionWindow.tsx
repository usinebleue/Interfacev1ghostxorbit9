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
  Phone, PhoneOff, Video, Glasses, Paperclip, Globe, Zap, Activity,
  Brain, Target, AlertTriangle, Scale, Sparkles, MessageSquare,
  Mic, MicOff, Loader2, Upload, MessageCircle, Clock, Network, Pencil,
  BookOpen, Search, BarChart2, Lightbulb,
} from "lucide-react";
import { cn } from "../components/ui/utils";
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
import { detectPhaseFromMessage } from "./core/phase-router";
// getContextualActions retire — remplace par footer 2 niveaux (Bible Live 4.14)
import { getPhaseSteps } from "./phases/phase-config";
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
  const isLong = contenu.length > 300;
  const displayed = isLong && !expanded ? contenu.slice(0, 280) + "…" : contenu;

  return (
    <div className={cn("border-l-[3px] rounded-lg rounded-tl-none px-3 py-2", style.border, "bg-white/60")}>
      {/* Header: avatar + nom + role badge */}
      <div className="flex items-center gap-2 mb-1">
        <div className={cn("w-5 h-5 rounded-full overflow-hidden shrink-0 ring-1", style.ring)}>
          <img src={BOT_AVATAR[agent] || `/agents/${agent.toLowerCase()}.png`}
            alt="" className="w-full h-full object-cover" />
        </div>
        <span className={cn("text-[10px] font-semibold", style.text)}>{nom}</span>
        <span className="text-[9px] text-gray-400">{BOT_ROLE[agent]}</span>
        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium ml-auto", style.bubble, style.text)}>
          Consultant
        </span>
      </div>
      {/* Contenu complet avec markdown */}
      <div className="text-[12px] text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(displayed) }} />
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

/** Barre de boutons CREDO pour cristalliser un contenu dans une section workspace */
function CristalliseBar({ content, botCode, activePhase, addWorkspaceBlock, lastUserMessage }: {
  content: string;
  botCode: string;
  activePhase: string;
  addWorkspaceBlock: (block: import("./core/types").WorkspaceBlock) => void;
  lastUserMessage?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const steps = getPhaseSteps(activePhase);
  if (steps.length === 0) return null;

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-400 hover:text-sky-600 transition-colors cursor-pointer group/crist"
      >
        <Pin className="h-2.5 w-2.5" />
        <span>Cristalliser</span>
        <ChevronRight className="h-2.5 w-2.5 group-hover/crist:translate-x-0.5 transition-transform" />
      </button>
    );
  }

  const handleCristallise = async (step: ReturnType<typeof getPhaseSteps>[number]) => {
    const credoLetter = (step.id.split("-")[1]?.charAt(0)?.toUpperCase() || "C") as "C" | "R" | "E" | "D" | "O";
    setLoading(true);
    try {
      const apiKey = (import.meta as Record<string, Record<string, string>>).env?.VITE_API_KEY || "";
      const res = await fetch("/api/v1/workspace/cristallise", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
        body: JSON.stringify({
          content,
          user_msg: lastUserMessage || "",
          credo_phase: credoLetter,
        }),
      });
      const block = await res.json();
      addWorkspaceBlock({
        id: `blk-${Date.now()}`,
        type: block.type || "libre",
        title: block.title || content.substring(0, 60),
        summary: block.summary || content.substring(0, 300),
        structured_data: { ...block.structured_data, originalContent: content },
        credo_step: credoLetter,
        confidence: block.confidence || 0.5,
        source: botCode,
        sourceType: "chat",
        sectionId: step.id,
        timestamp: Date.now(),
      });
    } catch {
      // Fallback copie brute si API echoue
      addWorkspaceBlock({
        id: `blk-${Date.now()}`,
        type: "libre",
        title: content.substring(0, 60),
        summary: content,
        credo_step: credoLetter,
        confidence: 1.0,
        source: botCode,
        sourceType: "chat",
        sectionId: step.id,
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
      setExpanded(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 mt-2 animate-in fade-in duration-200">
      {loading ? (
        <span className="flex items-center gap-1.5 px-3 py-1 text-[10px] text-sky-600 font-medium">
          <Loader2 className="h-3 w-3 animate-spin" />
          Cristallisation intelligente...
        </span>
      ) : (
        <>
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => handleCristallise(step)}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-sky-200 bg-sky-50 text-[10px] font-medium text-sky-700 hover:bg-sky-100 hover:border-sky-300 cursor-pointer transition-all"
            >
              <step.icon className="h-2.5 w-2.5" />
              {step.title}
            </button>
          ))}
          <button
            onClick={() => setExpanded(false)}
            className="flex items-center px-1.5 py-1 rounded-md border border-gray-200 text-[10px] text-gray-400 hover:bg-gray-50 cursor-pointer"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </>
      )}
    </div>
  );
}

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

/** Contenu bot segmenté — sous-bulles avec cristallise individuel */
function SegmentedBotContent({ content, botCode, activePhase, addWorkspaceBlock, lastUserMessage }: {
  content: string;
  botCode: string;
  activePhase: string;
  addWorkspaceBlock: (block: import("./core/types").WorkspaceBlock) => void;
  lastUserMessage?: string;
}) {
  const segments = parseMessageSegments(content);

  // Pas de segmentation (1 seul bloc sans titre) → rendu normal + 1 bouton cristallise
  if (segments.length <= 1) {
    return (
      <>
        <div
          className="text-sm text-gray-700 leading-relaxed isolate overflow-hidden [&>p]:my-0.5 [&>ul]:my-1 [&>ol]:my-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>hr]:my-2 [&_li]:break-words [&_p]:break-words"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
        />
        <CristalliseBar content={content} botCode={botCode} activePhase={activePhase} addWorkspaceBlock={addWorkspaceBlock} lastUserMessage={lastUserMessage} />
      </>
    );
  }

  // Segments multiples → sous-bulles avec cristallise individuel
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
          <CristalliseBar
            content={seg.title ? `### ${seg.title}\n${seg.text}` : seg.text}
            botCode={botCode}
            activePhase={activePhase}
            addWorkspaceBlock={addWorkspaceBlock}
            lastUserMessage={lastUserMessage}
          />
        </div>
      ))}
    </div>
  );
}

// ═══ InlineOptions — Click=envoi immédiat (défaut) + toggle multi-select + réponse inline questions ═══

function InlineOptions({ options, onSend, isActive, msgType, agent, activeRoster, workspacePhase }: {
  options: string[];
  onSend: (text: string, targetBot?: string, meta?: unknown, extra?: { workspacePhase?: string }) => void;
  isActive: boolean;
  msgType?: string;
  agent?: string;
  activeRoster: string[];
  workspacePhase?: string;
}) {
  const [multiMode, setMultiMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [inlineTexts, setInlineTexts] = useState<Record<number, string>>({});
  const [showInputFor, setShowInputFor] = useState<number | null>(null);

  // Filtrer "Ouvrir l'atelier"
  const filteredOpts = options.filter(opt => !/ouvrir\s+l'atelier/i.test(opt));
  if (filteredOpts.length === 0) return null;

  const isQuestion = (opt: string) => /\?\s*$/.test(opt.trim());

  const doSend = (text: string) => {
    if (msgType === "consultation" && agent && activeRoster.length > 1) {
      onSend(text, agent, undefined, { workspacePhase });
    } else {
      onSend(text, undefined, undefined, { workspacePhase });
    }
    setSelected(new Set());
    setInlineTexts({});
    setShowInputFor(null);
    setMultiMode(false);
  };

  const handleClick = (i: number) => {
    if (!isActive) return;
    const opt = filteredOpts[i];

    // Question → toujours montrer l'input inline (pas d'envoi immédiat)
    if (isQuestion(opt)) {
      setShowInputFor(showInputFor === i ? null : i);
      return;
    }

    // Mode multi-select → toggle la sélection
    if (multiMode) {
      const next = new Set(selected);
      if (next.has(i)) next.delete(i); else next.add(i);
      setSelected(next);
      return;
    }

    // Mode normal → envoi immédiat (comportement classique)
    doSend(opt);
  };

  const handleSendAll = () => {
    if (selected.size === 0) return;
    const parts: string[] = [];
    for (const i of Array.from(selected).sort()) {
      parts.push(filteredOpts[i]);
    }
    doSend(parts.join("\n\n"));
  };

  const handleInlineSubmit = (i: number) => {
    if (!inlineTexts[i]?.trim()) return;
    doSend(inlineTexts[i].trim());
  };

  const borderColors = ["border-l-blue-500", "border-l-amber-500", "border-l-green-500", "border-l-red-500"];
  const hoverBgs = isActive ? ["hover:bg-blue-50", "hover:bg-amber-50", "hover:bg-green-50", "hover:bg-red-50"] : [""];

  return (
    <div className={cn("mt-3 space-y-1.5", !isActive && "opacity-40 pointer-events-none")}>
      {/* Toggle multi-select (discret, en haut à droite) */}
      {isActive && filteredOpts.length > 1 && (
        <button
          onClick={() => { setMultiMode(!multiMode); if (multiMode) setSelected(new Set()); }}
          className={cn(
            "flex items-center gap-1 ml-auto px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer",
            multiMode ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <CheckCircle2 className="h-3 w-3" />
          {multiMode ? "Multi ✓" : "Multi"}
        </button>
      )}
      {filteredOpts.map((opt, i) => {
        const isSel = selected.has(i);
        const isQ = isQuestion(opt);
        const isInputOpen = isQ && showInputFor === i;
        return (
          <div key={i}>
            <button
              disabled={!isActive}
              onClick={() => handleClick(i)}
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
                {multiMode ? (
                  <span className={cn(
                    "mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    isSel ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300"
                  )}>
                    {isSel && <Check className="h-3 w-3" />}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-gray-400 mt-0.5 shrink-0">{i + 1}.</span>
                )}
                <span className={cn("text-sm font-medium flex-1", isActive ? "text-gray-700 group-hover/opt:text-gray-900" : "text-gray-400")}>
                  {opt}
                </span>
                {isQ && <MessageCircle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />}
              </div>
            </button>
            {/* Input inline pour les options-questions */}
            {isInputOpen && (
              <div className="mt-1 ml-6 flex gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
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
          </div>
        );
      })}
      {/* Bouton envoi multi-sélection */}
      {multiMode && selected.size > 0 && (
        <button
          onClick={handleSendAll}
          className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors cursor-pointer animate-in fade-in duration-200"
        >
          <Send className="h-3.5 w-3.5" />
          Envoyer ({selected.size} sélectionné{selected.size > 1 ? "s" : ""})
        </button>
      )}
    </div>
  );
}

// ═══ V3 MESSAGE LIST — Système unique de rendu des discussions ═══
// Gère: bulles V3, options cliquables, streaming, thinking, coaching, voice
function V3MessageList() {
  const { messages, isTyping, sendMessage, sendMultiPerspective, thinkingSteps, parkThread, activeRoster, chatTargetBot } = useChatContext();
  const { activeBotCode, activePhase, setActivePhase, setRightSection, setReflexionContext, reflexionContext, credoPhase, addWorkflowItem, workflowItems, chatStage, addWorkspaceBlock, focusType, activeDocumentSection, startDeliverable } = useAmorcer();
  // Enrichir activePhase avec le step CREDO pour que le backend injecte le bon prompt
  const _credoSteps = ["comprendre", "rechercher", "exposer", "demontrer", "objectif"];
  const workspacePhase = activePhase === "discussion" && chatStage < _credoSteps.length
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
  useEffect(() => {
    if (!isAnyStreaming) return;
    const id = setInterval(() => {
      if (!userScrolledUp.current) {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, 250);
    return () => clearInterval(id);
  }, [isAnyStreaming]);

  // Option click — gère les cas spéciaux coaching + envoi standard
  const handleOption = useCallback((opt: string) => {
    if (isTyping) return;
    const lower = opt.toLowerCase();
    if (lower.includes("parker") && lower.includes("thread")) { parkThread(); return; }
    if (lower.includes("synthes") || lower.includes("synthét")) {
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

    // Default: envoyer le texte de l'option — multi-perspective si roster > 1
    if (activeRoster.length > 1) {
      sendMultiPerspective(opt, activeRoster, undefined, { primaryAgent: chatTargetBot, workspacePhase });
    } else {
      sendMessage(opt, chatTargetBot, undefined, { workspacePhase });
    }
  }, [isTyping, sendMessage, sendMultiPerspective, chatTargetBot, activeBotCode, activeRoster, parkThread, setActivePhase, setRightSection, setReflexionContext, reflexionContext, activePhase, workspacePhase, messages, activeDocumentSection, addWorkspaceBlock, workflowItems]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-3 space-y-3 scrollbar-discussion">
      {messages.map((msg) => {
        if (msg.role === "system") return null;
        if (msg.isStreaming && !msg.content) return null;

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
                {/* Options inline — filtrer "Ouvrir l'atelier" (navigation via sidebar) */}
                {msg.options && msg.options.length > 0 && (() => {
                  const filteredOpts = msg.options.filter(opt => !/ouvrir\s+l'atelier/i.test(opt));
                  if (filteredOpts.length === 0) return null;
                  return (
                  <div className="mt-3 pt-2 border-t border-gray-200/60 space-y-1">
                    {filteredOpts.map((opt, i) => (
                      <button key={i} onClick={() => handleOption(opt)}
                        className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer group/opt">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-bold text-gray-400 mt-0.5 shrink-0">{i + 1}.</span>
                          <span className="text-sm text-gray-700 group-hover/opt:text-gray-900 font-medium">{opt}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  );
                })()}
                {/* Synthese actions inline */}
                <div className="mt-2 pt-2 border-t border-gray-200/60 flex flex-wrap gap-1.5">
                  {["Fusionner", "Challenger", "Plan d'action"].map((label, i) => {
                    const msgTypes = ["fusionner", "challenge", "plan_action"] as const;
                    return (
                      <button key={i}
                        onClick={() => sendMessage(label, msg.agent || chatTargetBot, undefined, { msgType: msgTypes[i] || "fusionner", workspacePhase })}
                        className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors text-gray-500 hover:text-gray-700 cursor-pointer">
                        {label}
                      </button>
                    );
                  })}
                </div>
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
          const wsMatch = msg.content.match(/^(Approfondir en detail|Challenge cet element, trouve les failles|Retravaille et enrichis):\s*(.+?)(?:\n|$)/);
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
          <div key={msg.id} className="flex gap-2.5 group/msg">
            <div className={cn("w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 mt-0.5", s.ring)}>
              <img src={BOT_AVATAR[botCode] || `/agents/${botCode.toLowerCase()}.png`}
                alt={BOT_NAME[botCode] || botCode} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 max-w-[85%] relative">
              <div className={cn("border-l-[3px] border border-gray-200 rounded-xl rounded-tl-none px-3.5 py-2.5 shadow-sm", s.border, s.bubble)}>
                {/* Agent name + role */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={cn("text-[11px] font-semibold", s.text)}>{BOT_NAME[botCode] || botCode}</span>
                  <span className="text-[10px] text-gray-400">{BOT_ROLE[botCode] || ""}</span>
                </div>
                {/* Content — formatMarkdown TOUJOURS (key stable = pas d'unmount/remount) */}
                <div
                  key={msg.id}
                  className="text-sm text-gray-700 leading-relaxed isolate overflow-hidden [&>p]:my-0.5 [&>ul]:my-1 [&>ol]:my-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>hr]:my-2 [&_li]:break-words [&_p]:break-words"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                />
                {msg.isStreaming && (
                  <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-text-bottom" />
                )}
                {/* Cristallise bar — boutons pour ajouter ce contenu dans une section workspace */}
                {!msg.isStreaming && msg.content && (
                  <CristalliseBar content={msg.content} botCode={botCode} activePhase={activePhase} addWorkspaceBlock={addWorkspaceBlock} lastUserMessage={lastUserMessage} />
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
              </div>
              {/* ═══ Niveau 2 — Actions structurelles SOUS la bulle (phase-gatees) ═══ */}
              {/* S102-B: masquer en multi-bot (les options inline de la bulle consolidee suffisent) */}
              {/* Visible sur TOUS les messages bot (pas seulement le dernier) */}
              {/* Transition de phase + GPS seulement sur le dernier */}
              {!msg.isStreaming && activeRoster.length <= 1 && (() => {
                // Phase transition — JAMAIS en discussion (transitions via ControlTowerPanel uniquement)
                const MIN_STAGE: Record<string, number> = { reflexion: 4, creation: 2, execution: 2, retroaction: 2 };
                const NEXT_LABEL: Record<string, string> = { reflexion: "Passer en mode conception", creation: "Passer en mode execution", execution: "Passer en mode retroaction", retroaction: "Retour au cockpit" };
                const minStage = MIN_STAGE[activePhase] ?? 99;
                const transitionLabel = isLast && activePhase !== "discussion" && chatStage >= minStage ? (NEXT_LABEL[activePhase] || null) : null;

                return (
                  <BubbleActions
                    chatStage={chatStage}
                    messageContent={msg.content}
                    backendOptions={undefined}
                    onAction={(prompt) => sendMessage(prompt, msg.agent || chatTargetBot, undefined, { workspacePhase })}
                    onCristallise={() => {
                      const CREDO_SECTIONS = ["comprendre", "rechercher", "exposer", "demontrer", "objectif"];
                      const credoSection = CREDO_SECTIONS[chatStage] || "comprendre";
                      const steps = getPhaseSteps(activePhase);
                      const targetSection = steps[chatStage]?.id || credoSection;
                      if (targetSection) {
                        const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content;
                        cristalliseViaAPI(msg.content, {
                          botCode: msg.agent || activeBotCode,
                          sectionId: targetSection,
                          credoStep: (["C","R","E","D","O"] as const)[chatStage] || "C",
                          userMsg: lastUserMsg,
                          addWorkspaceBlock,
                        });
                      }
                    }}
                    phaseTransition={transitionLabel}
                    onPhaseTransition={transitionLabel ? () => handleOption(transitionLabel) : undefined}
                    gpsSuggestion={msg.cristallisationSuggestion || undefined}
                    onGpsCristallise={isLast && msg.cristallisationSuggestion ? () => {
                      const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content;
                      cristalliseViaAPI(msg.content, {
                        botCode: msg.agent || activeBotCode,
                        sectionId: msg.cristallisationSuggestion!.section_id,
                        credoStep: (["C","R","E","D","O"] as const)[chatStage] || "C",
                        userMsg: lastUserMsg,
                        addWorkspaceBlock,
                      });
                    } : undefined}
                  />
                );
              })()}
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
  const { cockpitTab, activeBotCode, activePhase, setActivePhase, setRightSection, setReflexionContext, setFocusType, setActiveDeliverable, credoPhase, reflexionContext, addWorkflowItem, activeMeeting: dwActiveMeeting } = useAmorcer();
  const { activeRoster, addBotToRoster, removeBotFromRoster, messages, sendMessage, threads, resumeThread, deleteThread, renameThread, chatTargetBot } = useChatContext();
  const isMobile = useIsMobile();
  const isOrbit9 = cockpitTab === "orbit9";
  const isEmpty = messages.length === 0;

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

            {/* Agents du roster — avatar + nom */}
            <div className="flex items-center gap-2">
              {activeRoster.map((code) => (
                <div key={code} className="relative group flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white/30 shrink-0">
                    <img src={BOT_AVATAR[code] || `/agents/${code.toLowerCase()}.png`} alt={BOT_NAME[code] || code} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[9px] text-white/80 font-medium">{BOT_NAME[code]}</span>
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
  const { sendMessage, sendMultiPerspective, injectVoiceMessage, newConversation, chatTargetBot, activeRoster } = useChatContext();
  const { activeBotCode, activePhase, setRightSection, reflexionContext, setReflexionContext, setFocusType, setActivePhase, activeMeeting, chatStage } = useAmorcer();
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
      setTimeout(() => setCallState("idle"), 3000);
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

  // ═══ FILE UPLOAD — pièce jointe → bureau upload ═══
  const handleFileUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setShowAttachMenu(false);
    setUploading(true);

    // S3C.2: Document type detection — route documents to DocForge restructuration
    const docExts = [".pdf", ".docx", ".doc", ".txt", ".md", ".rtf"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const isDocument = docExts.includes(ext);

    try {
      if (isDocument) {
        // Upload + restructure → auto-switch to Conception
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bot_code", chatTargetBot);
        const res = await fetch("/api/v1/workspace/upload-restructure", {
          method: "POST",
          headers: { "X-API-Key": localStorage.getItem("bt_api_key") || "" },
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          sendMessage(`Document analyse: ${file.name} — ${data.sections?.length || 0} sections detectees`, chatTargetBot);
          // Dispatch event to trigger DocForge with pre-populated sections
          if (data.sections?.length) {
            window.dispatchEvent(new CustomEvent("bt-start-deliverable", {
              detail: { deliverableType: "docforge_section", sections: data.sections, fileName: file.name },
            }));
          }
        } else {
          // Fallback: upload as regular bureau file
          const result = await api.uploadBureauFile(file, file.name);
          sendMessage(`Fichier joint: ${result.titre || file.name}`, chatTargetBot);
        }
      } else {
        const result = await api.uploadBureauFile(file, file.name);
        sendMessage(`Fichier joint: ${result.titre || file.name}`, chatTargetBot);
      }
    } catch (err) {
      console.error("[ChatBoxV3] Upload error:", err);
    } finally {
      setUploading(false);
    }
  }, [sendMessage, chatTargetBot]);

  // ═══ TEXT HANDLERS ═══
  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");

    // FIX Lacune 1 + Sprint 3: Entrer en Discussion AVANT le sendMessage pour que workspacePhase
    // soit "discussion_comprendre" des le premier message (au lieu de "observation")
    let effectivePhase = workspacePhase;
    if (!reflexionContext) {
      setReflexionContext(text.substring(0, 80));
    }
    // Sprint 3 fix: si workspacePhase est falsy (pas de phase active), forcer discussion
    if (!effectivePhase || effectivePhase === "observation") {
      setActivePhase("discussion" as any);
      setRightSection(null);
      effectivePhase = `discussion_${_credoStepsCB[chatStage] || "comprendre"}`;
    }

    // Multi-bot: si 2+ bots dans le roster, consultation multi-perspectives
    if (activeRoster.length > 1) {
      sendMultiPerspective(text, activeRoster, undefined, { primaryAgent: chatTargetBot, workspacePhase: effectivePhase });
    } else {
      sendMessage(text, chatTargetBot, undefined, { workspacePhase: effectivePhase });
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
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
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

      <div className="relative rounded-2xl border border-gray-300 bg-white shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={activeRoster.length > 1 ? `Parle à ${activeRoster.map(c => BOT_NAME[c] || c).join(" & ")}...` : `Parle à ${botName}...`}
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
            onClick={visionActive ? () => { stopVoicePolling(); setVisionActive(false); } : handleVision}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              visionActive ? "bg-cyan-600 text-white hover:bg-cyan-700" : "bg-cyan-50 text-cyan-600 hover:bg-cyan-100"
            )}
            title={visionActive ? "Arrêter Vision" : "Vision Ray-Ban"}
          >
            <Glasses className="h-3.5 w-3.5" /><span className="hidden lg:inline">{visionActive ? "Vision ON" : "Vision"}</span>
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

