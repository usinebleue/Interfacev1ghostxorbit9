/**
 * workspace-block-renderers.tsx — Registre de composants de rendu par type de block
 *
 * Chaque renderer reçoit un WorkspaceBlock + callback d'action.
 * Patterns portés depuis les simulations (FocusDiscussionView, LiveReflexionView, etc.)
 */

import { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  Pin, Search, Swords, Pencil, RotateCcw, Layers,
  CheckCircle2, AlertTriangle, TrendingUp, Lightbulb,
  Clock, Activity, FileText, ClipboardCopy,
  Check, X, Trash2, Code,
  ThumbsUp, ThumbsDown, Trophy, Zap, Shield,
  Target, Globe, ExternalLink,
  MessageCircle, Mic, Video,
  BarChart3, Loader2, ChevronDown, Users, Gauge,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { formatCristallise } from "./content-formatters";
import { BotBadgeFull } from "../../v2/zones/center/shared/BotBadgeFull";
import { ThinkingAnimation, BotAvatar } from "../simulation/primitives";
import type { ThinkingStep } from "../simulation/sim-types";
import { BOT_NAME } from "../../v2/api/types";
import { api } from "../../v2/api/client";
import type { WorkspaceBlock, WorkspaceBlockType, ActionSuggestion } from "../core/types";

// ═══ Lucide icons used by inline section actions ═══
import { ArrowRight, RefreshCw, Merge } from "lucide-react";

// ═══ Rich markdown → HTML (meme formatage que les bulles discussion) ═══
function applyInlineFmt(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-gray-600 italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-800">$1</code>');
}

function formatBlockMarkdown(text: string): string {
  if (!text) return "";
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = html.split("\n");
  const result: string[] = [];
  let listTag: "ul" | "ol" | null = null;
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockLines: string[] = [];
  let tableLines: string[] = [];

  const closeList = () => { if (listTag) { result.push(`</${listTag}>`); listTag = null; } };

  const flushTable = () => {
    if (tableLines.length === 0) return;
    const rows = tableLines.map(r => r.replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim()));
    let headerEnd = -1;
    for (let r = 0; r < rows.length; r++) {
      if (rows[r].every(c => /^[-:]+$/.test(c))) { headerEnd = r; break; }
    }
    let tbl = '<div class="my-2 rounded-lg overflow-hidden border border-gray-200"><table class="text-sm border-collapse w-full">';
    let bodyRowIdx = 0;
    for (let r = 0; r < rows.length; r++) {
      if (headerEnd >= 0 && r === headerEnd) continue;
      const isHead = headerEnd > 0 && r < headerEnd;
      const tag = isHead ? "th" : "td";
      const cls = isHead
        ? 'class="px-3 py-1.5 text-left font-semibold text-gray-900 border-b border-gray-300 bg-gray-50"'
        : `class="px-3 py-1.5 text-left text-gray-700 border-b border-gray-100 ${bodyRowIdx % 2 === 1 ? "bg-gray-50/50" : ""}"`;
      if (!isHead) bodyRowIdx++;
      tbl += "<tr>" + rows[r].map(c => `<${tag} ${cls}>${applyInlineFmt(c)}</${tag}>`).join("") + "</tr>";
    }
    tbl += "</table></div>";
    result.push(tbl);
    tableLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        closeList(); flushTable(); inCodeBlock = true;
        codeBlockLang = line.trim().replace(/^```/, "").trim();
        codeBlockLines = []; continue;
      } else {
        inCodeBlock = false;
        const langLabel = codeBlockLang ? `<div class="text-[10px] text-gray-400 mb-1 font-mono">${codeBlockLang}</div>` : "";
        result.push(`<div class="my-2 rounded-lg bg-gray-900 text-gray-100 p-3"><pre class="text-xs font-mono whitespace-pre-wrap break-all leading-relaxed">${langLabel}${codeBlockLines.join("\n")}</pre></div>`);
        codeBlockLines = []; codeBlockLang = ""; continue;
      }
    }
    if (inCodeBlock) { codeBlockLines.push(line); continue; }

    // Table rows: lines starting with |
    if (/^\s*\|/.test(line)) {
      closeList();
      tableLines.push(line.trim());
      continue;
    }
    // Flush table if we exit table context
    if (tableLines.length > 0) { flushTable(); }

    if (/^[━─═\-]{3,}$/.test(line.trim())) { closeList(); result.push('<hr class="my-3 border-gray-200">'); continue; }

    const headingMatch = line.trim().match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      const hText = applyInlineFmt(headingMatch[2]);
      if (level === 1) {
        result.push(`<div class="font-bold text-gray-900 text-base mt-4 mb-2">${hText}</div>`);
      } else if (level === 2) {
        result.push(`<div class="font-semibold text-sm text-gray-900 border-b border-gray-100 pb-1 mt-3 mb-2">${hText}</div>`);
      } else {
        result.push(`<div class="font-medium text-xs text-gray-700 mt-2 mb-1">${hText}</div>`);
      }
      continue;
    }

    // Callout/blockquote (lines starting with >)
    const quoteMatch = line.match(/^\s*&gt;\s?(.*)/);
    if (quoteMatch) {
      closeList();
      result.push(`<div class="my-1.5 pl-3 py-1.5 border-l-4 border-blue-300 bg-blue-50/50 rounded-r-lg"><p class="text-sm text-blue-900/80 leading-relaxed">${applyInlineFmt(quoteMatch[1])}</p></div>`);
      continue;
    }

    const numberedMatch = line.match(/^(\s*)(\d+)[.)]\s+(.+)/);
    if (numberedMatch) {
      if (listTag !== "ol") { closeList(); result.push('<ol class="space-y-1.5 my-2 list-none">'); listTag = "ol"; }
      result.push(`<li class="flex items-start gap-2 text-sm"><span class="text-gray-400 mt-0.5 shrink-0 font-semibold">${numberedMatch[2]}.</span><span>${applyInlineFmt(numberedMatch[3])}</span></li>`);
      continue;
    }

    const bulletMatch = line.match(/^(\s*)([-*•]|\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s+(.+)/u);
    if (bulletMatch) {
      if (listTag !== "ul") { closeList(); result.push('<ul class="space-y-1.5 my-2">'); listTag = "ul"; }
      const emoji = /^[-*•]$/.test(bulletMatch[2]) ? "" : bulletMatch[2] + " ";
      result.push(`<li class="flex items-start gap-2 text-sm"><span class="text-gray-400 mt-0.5 shrink-0">${emoji || "•"}</span><span>${applyInlineFmt(bulletMatch[3])}</span></li>`);
      continue;
    }

    if (listTag && line.trim() !== "") { closeList(); }
    if (line.trim() === "") { result.push('<div class="h-2"></div>'); continue; }

    if (/^\*\*(.+)\*\*\s*:?\s*$/.test(line.trim())) {
      result.push(`<div class="font-semibold text-gray-900 mt-3 mb-1">${line.trim().replace(/^\*\*(.+)\*\*\s*:?\s*$/, "$1")}</div>`);
      continue;
    }

    result.push(`<p class="text-sm leading-relaxed">${applyInlineFmt(line)}</p>`);
  }

  closeList();
  flushTable();
  if (inCodeBlock && codeBlockLines.length > 0) {
    const langLabel = codeBlockLang ? `<div class="text-[10px] text-gray-400 mb-1 font-mono">${codeBlockLang}</div>` : "";
    result.push(`<div class="my-2 rounded-lg bg-gray-900 text-gray-100 p-3"><pre class="text-xs font-mono whitespace-pre-wrap break-all leading-relaxed">${langLabel}${codeBlockLines.join("\n")}</pre></div>`);
  }
  return result.join("\n");
}

// ═══ Compact mode context — discussion blocks: 1 colonne, pas de BlockActions lourdes ═══
export const BlockDisplayContext = createContext({ compact: false, primaryBotCode: "" });

// ═══ Bot Accent Borders (B.9 — pattern BOT_COLORS from sim-data.ts) ═══

export const BOT_ACCENT_BORDERS: Record<string, string> = {
  BCO: "border-l-blue-400", CEOB: "border-l-blue-400",
  BCT: "border-l-violet-400", CTOB: "border-l-violet-400",
  BCF: "border-l-emerald-400", CFOB: "border-l-emerald-400",
  BCM: "border-l-pink-400", CMOB: "border-l-pink-400",
  BCS: "border-l-red-400", CSOB: "border-l-red-400",
  BOO: "border-l-orange-400", COOB: "border-l-orange-400",
  CPOB: "border-l-slate-400",
  CHROB: "border-l-teal-400",
  CINOB: "border-l-rose-400",
  CROB: "border-l-amber-400",
  CLOB: "border-l-indigo-400",
  CISOB: "border-l-zinc-400",
};

// ═══ Source badges enrichis (B.11) ═══

const SOURCE_CONFIG: Record<string, { icon: React.ElementType; bg: string; text: string; label: string }> = {
  chat: { icon: MessageCircle, bg: "bg-sky-100", text: "text-sky-600", label: "Chat" },
  voice: { icon: Mic, bg: "bg-violet-100", text: "text-violet-600", label: "Vocal" },
  meeting: { icon: Video, bg: "bg-amber-100", text: "text-amber-600", label: "Reunion" },
};

// ═══ Sprint 3A.1: AnimatedBlockEntry — ThinkingAnimation before reveal ═══

const ANIMATED_THINKING_STEPS: Record<string, ThinkingStep[]> = {
  diagnostic: [
    { icon: Search, text: "Analyse des axes..." },
    { icon: Activity, text: "Evaluation des scores..." },
    { icon: TrendingUp, text: "Compilation du diagnostic..." },
  ],
  brainstorm: [
    { icon: Lightbulb, text: "Generation d'idees..." },
    { icon: TrendingUp, text: "Evaluation d'impact..." },
    { icon: Layers, text: "Clustering des concepts..." },
  ],
  "5pourquoi": [
    { icon: Search, text: "Exploration niveau 1..." },
    { icon: Target, text: "Approfondissement..." },
    { icon: AlertTriangle, text: "Identification cause racine..." },
  ],
  deep_search: [
    { icon: Globe, text: "Recherche de sources..." },
    { icon: CheckCircle2, text: "Verification de fiabilite..." },
    { icon: BarChart3, text: "Scoring des resultats..." },
  ],
  challenge: [
    { icon: Swords, text: "Formulation du challenge..." },
    { icon: Shield, text: "Construction de la defense..." },
    { icon: Trophy, text: "Deliberation du verdict..." },
  ],
  scamper: [
    { icon: Lightbulb, text: "Activation des 7 angles..." },
    { icon: Layers, text: "Generation par lettre..." },
    { icon: TrendingUp, text: "Synthese creatrice..." },
  ],
  etat_des_lieux: [
    { icon: Search, text: "Analyse de la situation..." },
    { icon: Users, text: "Consultation des experts..." },
    { icon: BarChart3, text: "Evaluation globale..." },
  ],
  rapport: [
    { icon: Search, text: "Compilation des blocs..." },
    { icon: BarChart3, text: "Analyse des decisions..." },
    { icon: FileText, text: "Structuration du rapport..." },
  ],
  _default: [
    { icon: Search, text: "Analyse en cours..." },
    { icon: TrendingUp, text: "Structuration..." },
    { icon: CheckCircle2, text: "Finalisation..." },
  ],
};

function AnimatedBlockEntry({ children }: {
  block: WorkspaceBlock;
  children: React.ReactNode;
  animated?: boolean;
}) {
  // Animation retirée — les blocs apparaissent directement dans le workspace
  return <>{children}</>;
}

// ═══ Block Action Types ═══

export type BlockActionType = "pin" | "deepen" | "challenge" | "edit" | "rework" | "merge" | "delete";

interface BlockRendererProps {
  block: WorkspaceBlock;
  onAction: (action: BlockActionType, blockId: string, payload?: string) => void;
  animated?: boolean;
}

// ═══ Shared: Block Actions Bar ═══

function BlockActions({ block, onAction }: BlockRendererProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(block.summary);
  // S3.4 — Feedback thumbs up/down (local state, foundation for future backend persistence)
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  if (isEditing) {
    return (
      <div className="mt-3 space-y-2">
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full min-h-[100px] text-xs text-gray-700 leading-relaxed p-3 rounded-lg border border-blue-200 bg-blue-50/30 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-y"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <button onClick={() => { onAction("edit", block.id, editText); setIsEditing(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer">
            <Check className="h-3 w-3" /> Sauvegarder
          </button>
          <button onClick={() => { setEditText(block.summary); setIsEditing(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium transition-colors cursor-pointer">
            <X className="h-3 w-3" /> Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 border-t border-gray-100 mt-3 space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => onAction("pin", block.id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-gray-200 text-gray-600 hover:bg-gray-50">
          <Pin className="h-3 w-3" /> Épingler
        </button>
        <button onClick={() => onAction("deepen", block.id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50">
          <Search className="h-3 w-3" /> Approfondir
        </button>
        <button onClick={() => onAction("challenge", block.id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-amber-200 text-amber-700 hover:bg-amber-50">
          <Swords className="h-3 w-3" /> Challenger
        </button>
        <button onClick={() => onAction("rework", block.id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-sky-200 text-sky-700 hover:bg-sky-50">
          <RotateCcw className="h-3 w-3" /> Retravailler
        </button>
        <button onClick={() => setIsEditing(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-gray-200 text-gray-600 hover:bg-gray-50">
          <Pencil className="h-3 w-3" /> Modifier
        </button>
        {/* S2.3.1: Bouton Rejeter */}
        <button onClick={() => onAction("delete", block.id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-red-200 text-red-600 hover:bg-red-50">
          <X className="h-3 w-3" /> Rejeter
        </button>
        {/* S4.4 — Export Markdown (clipboard) */}
        <button onClick={() => {
          const md = `## ${block.title}\n\n${block.summary}`;
          navigator.clipboard.writeText(md).then(() => {
            // Brief visual feedback via button text swap handled by state below
          });
        }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-indigo-200 text-indigo-600 hover:bg-indigo-50">
          <ClipboardCopy className="h-3 w-3" /> Exporter
        </button>
        {/* Assigner — deleguer a un bot via CustomEvent */}
        <button onClick={() => {
          window.dispatchEvent(new CustomEvent("bt-delegate-task", {
            detail: { titre: block.title, bot: block.source, blockId: block.id },
          }));
        }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer border-emerald-200 text-emerald-600 hover:bg-emerald-50">
          <Zap className="h-3 w-3" /> Assigner
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <BotBadgeFull botCode={block.source} compact />
        {(() => {
          const src = SOURCE_CONFIG[block.sourceType] || SOURCE_CONFIG.chat;
          return (
            <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-medium", src.bg, src.text)}>
              <src.icon className="h-2.5 w-2.5" /> {src.label}
            </span>
          );
        })()}
        {/* S3.4 + S5.2 — Feedback thumbs (wired to backend) */}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => {
              const next = feedback === "up" ? null : "up";
              setFeedback(next);
              if (next) fetch("/api/v1/workspace/feedback", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ block_id: block.id, rating: "up", user_id: 0 }),
              }).catch(() => {});
            }}
            className={cn(
              "p-1 rounded-md transition-colors cursor-pointer",
              feedback === "up" ? "bg-emerald-100 text-emerald-600" : "text-gray-300 hover:text-emerald-500 hover:bg-emerald-50"
            )}
          >
            <ThumbsUp className="h-3 w-3" />
          </button>
          <button
            onClick={() => {
              const next = feedback === "down" ? null : "down";
              setFeedback(next);
              if (next) fetch("/api/v1/workspace/feedback", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ block_id: block.id, rating: "down", user_id: 0 }),
              }).catch(() => {});
            }}
            className={cn(
              "p-1 rounded-md transition-colors cursor-pointer",
              feedback === "down" ? "bg-red-100 text-red-500" : "text-gray-300 hover:text-red-400 hover:bg-red-50"
            )}
          >
            <ThumbsDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ Shared: Block Wrapper ═══

function BlockWrapper({ block, onAction, label, labelColor, children }: BlockRendererProps & { label: string; labelColor: string; children: React.ReactNode }) {
  const displayCtx = useContext(BlockDisplayContext);
  const [isHoverEdit, setIsHoverEdit] = useState(false);
  // Sprint 2A Phase 6A: fade-in + slide-up animation (pattern FocusReflexionView L164-167)
  const [appeared, setAppeared] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAppeared(true), 80);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className={cn(
        "group/edit rounded-xl border bg-white p-4 shadow-sm transition-all duration-300",
        "border-gray-200 hover:shadow-md",
        "hover:ring-1 hover:ring-blue-200 hover:border-blue-200",
        appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        block.source && BOT_ACCENT_BORDERS[block.source] && cn("border-l-[3px]", BOT_ACCENT_BORDERS[block.source])
      )}
      onMouseEnter={() => setIsHoverEdit(true)}
      onMouseLeave={() => setIsHoverEdit(false)}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold", labelColor)}>{label}</span>
        {/* S3A.1: BotAvatar attribution */}
        {block.source && (
          <div className="flex items-center gap-1 shrink-0">
            <BotAvatar code={block.source} size="sm" />
            <span className="text-[10px] text-gray-400 font-medium">{BOT_NAME[block.source] || block.source}</span>
          </div>
        )}
        {/* S2.2.3: Confidence badge */}
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
          block.confidence >= 0.8 ? "bg-emerald-100 text-emerald-700" :
          block.confidence >= 0.5 ? "bg-amber-100 text-amber-700" :
          "bg-red-100 text-red-700"
        )}>
          {Math.round(block.confidence * 100)}%
        </span>
        <h4 className="text-sm font-bold text-gray-900 flex-1 truncate">{block.title}</h4>
        {/* Sprint 2A: Hover "Modifier" flottant (pattern WorkspaceSection.tsx L142-156) */}
        <button
          onClick={() => onAction("edit", block.id)}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium",
            "border border-blue-200 bg-blue-50 text-blue-600 cursor-pointer",
            "transition-opacity duration-150",
            isHoverEdit ? "opacity-100" : "opacity-0"
          )}
        >
          <Pencil className="h-2.5 w-2.5" /> Modifier
        </button>
        <span className="text-[10px] text-gray-300">{new Date(block.timestamp).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      {children}
      {/* Compact mode (discussion): footer leger — SAUF pour rapport qui garde les boutons complets */}
      {/* Primary bot blocks = captures de la discussion → PAS de boutons actions */}
      {!(displayCtx.primaryBotCode && block.source === displayCtx.primaryBotCode) && (
        displayCtx.compact && block.type !== "rapport" ? (
          <CompactBlockFooter block={block} onAction={onAction} />
        ) : (
          <BlockActions block={block} onAction={onAction} />
        )
      )}
    </div>
  );
}

// ═══ Compact footer pour discussion — CTAs dynamiques selon le type d'analyse ═══

type CompactCTA = { label: string; icon: typeof CheckCircle2; action: BlockActionType | "approve"; color: string; activeColor: string };

// CTAs discussion (C→R→E→D): construire la reflexion, PAS executer.
// L'execution vit dans le rapport final (O) qui garde BlockActions complet.
const BLOCK_CTAS: Record<string, CompactCTA[]> = {
  diagnostic:      [
    { label: "Approuver", icon: CheckCircle2, action: "approve", color: "border-emerald-200 text-emerald-700 hover:bg-emerald-50", activeColor: "bg-emerald-100 border-emerald-300 text-emerald-800" },
    { label: "Challenger", icon: Swords, action: "challenge", color: "border-amber-200 text-amber-700 hover:bg-amber-50", activeColor: "" },
    { label: "Approfondir", icon: Search, action: "deepen", color: "border-blue-200 text-blue-700 hover:bg-blue-50", activeColor: "" },
  ],
  brainstorm:      [
    { label: "Approuver", icon: CheckCircle2, action: "approve", color: "border-emerald-200 text-emerald-700 hover:bg-emerald-50", activeColor: "bg-emerald-100 border-emerald-300 text-emerald-800" },
    { label: "Challenger", icon: Swords, action: "challenge", color: "border-amber-200 text-amber-700 hover:bg-amber-50", activeColor: "" },
    { label: "Approfondir", icon: Search, action: "deepen", color: "border-blue-200 text-blue-700 hover:bg-blue-50", activeColor: "" },
  ],
  plan_action:     [
    { label: "Approuver", icon: CheckCircle2, action: "approve", color: "border-emerald-200 text-emerald-700 hover:bg-emerald-50", activeColor: "bg-emerald-100 border-emerald-300 text-emerald-800" },
    { label: "Challenger", icon: Swords, action: "challenge", color: "border-amber-200 text-amber-700 hover:bg-amber-50", activeColor: "" },
    { label: "Modifier", icon: Pencil, action: "edit", color: "border-gray-200 text-gray-600 hover:bg-gray-50", activeColor: "" },
  ],
  taches:          [
    { label: "Approuver", icon: CheckCircle2, action: "approve", color: "border-emerald-200 text-emerald-700 hover:bg-emerald-50", activeColor: "bg-emerald-100 border-emerald-300 text-emerald-800" },
    { label: "Challenger", icon: Swords, action: "challenge", color: "border-amber-200 text-amber-700 hover:bg-amber-50", activeColor: "" },
  ],
  recommandations: [
    { label: "Approuver", icon: CheckCircle2, action: "approve", color: "border-emerald-200 text-emerald-700 hover:bg-emerald-50", activeColor: "bg-emerald-100 border-emerald-300 text-emerald-800" },
    { label: "Challenger", icon: Swords, action: "challenge", color: "border-amber-200 text-amber-700 hover:bg-amber-50", activeColor: "" },
    { label: "Approfondir", icon: Search, action: "deepen", color: "border-blue-200 text-blue-700 hover:bg-blue-50", activeColor: "" },
  ],
  risques:         [
    { label: "Approuver", icon: CheckCircle2, action: "approve", color: "border-emerald-200 text-emerald-700 hover:bg-emerald-50", activeColor: "bg-emerald-100 border-emerald-300 text-emerald-800" },
    { label: "Challenger", icon: Swords, action: "challenge", color: "border-amber-200 text-amber-700 hover:bg-amber-50", activeColor: "" },
  ],
  _default:        [
    { label: "Approuver", icon: CheckCircle2, action: "approve", color: "border-emerald-200 text-emerald-700 hover:bg-emerald-50", activeColor: "bg-emerald-100 border-emerald-300 text-emerald-800" },
    { label: "Challenger", icon: Swords, action: "challenge", color: "border-amber-200 text-amber-700 hover:bg-amber-50", activeColor: "" },
    { label: "Approfondir", icon: Search, action: "deepen", color: "border-blue-200 text-blue-700 hover:bg-blue-50", activeColor: "" },
  ],
};

function CompactBlockFooter({ block, onAction }: BlockRendererProps) {
  const [approved, setApproved] = useState(false);
  const ctas = BLOCK_CTAS[block.type] || BLOCK_CTAS._default;

  const handleCTA = (cta: CompactCTA) => {
    if (cta.action === "approve") {
      setApproved(!approved);
      onAction("pin", block.id); // Approuver = officialiser ce point
    } else {
      onAction(cta.action as BlockActionType, block.id);
    }
  };

  return (
    <div className="pt-2 border-t border-gray-100 mt-3 space-y-2">
      {/* CTAs dynamiques */}
      <div className="flex flex-wrap gap-1.5">
        {ctas.map((cta) => {
          const isApproveActive = cta.action === "approve" && approved;
          return (
            <button key={cta.label} onClick={() => handleCTA(cta)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                isApproveActive ? cta.activeColor : cta.color,
              )}>
              <cta.icon className="h-3 w-3" />
              {isApproveActive ? "Approuvé ✓" : cta.label}
            </button>
          );
        })}
      </div>
      {/* Source bot + timestamp */}
      <div className="flex items-center gap-2">
        <BotBadgeFull botCode={block.source} compact />
        <span className="text-[9px] text-gray-300 ml-auto">{new Date(block.timestamp).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}

// ═══ 1. Diagnostic — KPI cards + points de friction (pattern FocusReflexionView StepDiagnostic) ═══

function DiagnosticRenderer({ block, onAction }: BlockRendererProps) {
  const { compact } = useContext(BlockDisplayContext);
  const data = block.structured_data as { axes?: { label: string; score: number; color?: string; description?: string; detail?: string; bot?: string; action?: string; expanded?: { gap?: string; effort?: string; actions?: string[]; impact?: string } }[]; conclusion?: string; frictions?: string[]; score_global?: number } | undefined;
  // S3A.1: Staggered reveal for axes with animated score bars
  const [revealedAxes, setRevealedAxes] = useState(0);
  useEffect(() => {
    if (!data?.axes) return;
    setRevealedAxes(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    data.axes.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedAxes(c => c + 1), 300 + i * 400));
    });
    return () => timers.forEach(clearTimeout);
  }, [data?.axes?.length]); // eslint-disable-line react-hooks/exhaustive-deps
  // Score normalization: handles both /10 and /100 scales from backend
  const isScale10 = data?.axes ? data.axes.every(a => a.score <= 10) : true;
  const normScore = (s: number) => isScale10 ? s * 10 : s;
  const globalScore = data?.score_global ?? (data?.axes ? Math.round(data.axes.reduce((sum, a) => sum + normScore(a.score), 0) / (data.axes.length || 1)) : 0);
  const criticalCount = data?.axes?.filter(a => normScore(a.score) < 40).length ?? 0;
  const scoreStyle = (s: number) => {
    const pct = isScale10 ? s * 10 : s;
    return pct < 40
      ? { border: "border-orange-400", bg: "bg-gradient-to-b from-orange-50 to-white", hdr: "bg-orange-100/60", badge: "bg-orange-600 text-white", bar: "bg-orange-500", tag: "bg-orange-100 text-orange-700", btn: "bg-orange-600 text-white hover:bg-orange-700" }
      : pct < 60
      ? { border: "border-amber-300", bg: "bg-gradient-to-b from-amber-50 to-white", hdr: "bg-amber-100/60", badge: "bg-amber-500 text-white", bar: "bg-amber-500", tag: "bg-amber-100 text-amber-700", btn: "bg-amber-500 text-white hover:bg-amber-600" }
      : { border: "border-emerald-300", bg: "bg-gradient-to-b from-emerald-50 to-white", hdr: "bg-emerald-100/60", badge: "bg-emerald-500 text-white", bar: "bg-emerald-500", tag: "bg-emerald-100 text-emerald-700", btn: "bg-emerald-500 text-white hover:bg-emerald-600" };
  };
  const globalBarColor = globalScore < 40 ? "bg-orange-400" : globalScore < 60 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <BlockWrapper block={block} onAction={onAction} label="Diagnostic" labelColor="bg-orange-100 text-orange-700">
      {/* Pattern MagDiagnostic SimAmorcer — Score global + grille axes */}
      {data?.axes ? (
        <div className="space-y-4">
          {/* Score de maturite global — pattern MagDiagnostic L1843-1873 */}
          <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Gauge className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Score de maturite global</span>
              <span className="text-xs font-bold bg-gray-900 text-white px-2.5 py-0.5 rounded-full ml-auto">{globalScore}%</span>
            </div>
            <div className="px-4 py-3 space-y-3">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", globalBarColor)} style={{ width: `${globalScore}%`, transition: "width 1.2s ease-out" }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-400">Axes critiques</p>
                  <p className="text-xs font-bold text-orange-600">{criticalCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Axes evalues</p>
                  <p className="text-xs font-bold text-blue-600">{data.axes.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Score moyen</p>
                  <p className="text-xs font-bold text-emerald-600">{globalScore}%</p>
                </div>
              </div>
              {data.conclusion && (
                <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Recommandation:</span>
                  <span className="text-xs text-orange-700 font-medium line-clamp-1">{data.conclusion}</span>
                </div>
              )}
            </div>
          </div>

          {/* Grille axes — pattern MagDiagnostic L1877-1965 */}
          <div className={cn("grid gap-3", compact ? "grid-cols-1" : "grid-cols-2")}>
            {data.axes.map((ax, i) => {
              const pct = normScore(ax.score);
              const sc = scoreStyle(ax.score);
              const isRevealed = i < revealedAxes;
              return (
                <div key={i}
                  className={cn(
                    "rounded-xl overflow-hidden border-2 shadow-sm transition-all duration-500 hover:shadow-md",
                    sc.border, sc.bg,
                    isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  )}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {/* Header avec score badge proéminent */}
                  <div className={cn("px-3 py-2 flex items-center justify-between", sc.hdr)}>
                    <span className="text-xs text-gray-900 font-bold">{ax.label}</span>
                    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold", sc.badge)}>
                      {pct}%
                    </div>
                  </div>
                  <div className="px-3 py-2.5 space-y-2">
                    {ax.description && <p className="text-[11px] text-gray-700 font-medium">{ax.description}</p>}
                    {/* Score bar — h-2 (thicker, pattern MagDiagnostic L1921) */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", sc.bar)} style={{ width: isRevealed ? `${pct}%` : "0%", transition: "width 0.8s ease-out", transitionDelay: `${i * 100 + 200}ms` }} />
                    </div>
                    {ax.detail && <p className="text-[10px] text-gray-600 font-medium">{ax.detail}</p>}
                    {/* Bot attribution + Action button — pattern MagDiagnostic L1925-1931 */}
                    <div className="flex items-center gap-1.5">
                      {ax.bot && <BotAvatar code={ax.bot} size="sm" />}
                      {ax.bot && <span className="text-[10px] text-gray-500 font-medium">{BOT_NAME[ax.bot] || ax.bot}</span>}
                      {ax.action && (
                        <button onClick={() => onAction("deepen", block.id, ax.label)}
                          className={cn("text-[10px] px-3 py-1.5 rounded-full font-bold cursor-pointer ml-auto shadow-sm transition-all", sc.btn)}>
                          {ax.action}
                        </button>
                      )}
                    </div>
                    {/* Expanded details — pattern MagDiagnostic L1934-1960 */}
                    {ax.expanded && (
                      <div className="mt-1 pt-2 border-t border-gray-200 space-y-2">
                        <div className="flex items-center gap-2">
                          {ax.expanded.gap && <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", sc.tag)}>{ax.expanded.gap}</span>}
                          {ax.expanded.effort && <span className="text-[10px] text-gray-400">Effort: {ax.expanded.effort}</span>}
                        </div>
                        {ax.expanded.actions && (
                          <div className="space-y-1">
                            {ax.expanded.actions.map((a, j) => (
                              <div key={j} className="flex items-center gap-1.5 text-[10px] text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                <span>{a}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {ax.expanded.impact && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-2 flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span className="text-[10px] text-emerald-700 font-bold">Impact: {ax.expanded.impact}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Points de friction */}
          {data.frictions && data.frictions.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" /> Points de friction
              </h4>
              <div className="space-y-2">
                {data.frictions.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-gray-800">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Analyse</h4>
            <div className="space-y-2">
              {parseSummaryItems(block.summary).map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-gray-400 font-mono shrink-0 w-4 text-right">{i + 1}.</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </BlockWrapper>
  );
}

// ═══ 2. Brainstorm — Hover-cards avec pin (pattern SimPhaseReflexion capture buttons) ═══

function BrainstormRenderer({ block, onAction }: BlockRendererProps) {
  const { compact } = useContext(BlockDisplayContext);
  const data = block.structured_data as { items?: { id: number; title: string; detail: string; impact?: string; effort?: string }[] } | undefined;
  const IDEA_COLORS = ["border-amber-300", "border-blue-300", "border-green-300", "border-purple-300", "border-pink-300", "border-cyan-300"];
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [expanded, setExpanded] = useState<number | null>(null);
  // S3A.1: Staggered reveal — items appear 2 by 2 (300ms apart)
  const [revealedItems, setRevealedItems] = useState(0);
  useEffect(() => {
    if (!data?.items) return;
    setRevealedItems(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    data.items.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedItems(c => c + 1), 200 + Math.floor(i / 2) * 300));
    });
    return () => timers.forEach(clearTimeout);
  }, [data?.items?.length]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <BlockWrapper block={block} onAction={onAction} label="Brainstorm" labelColor="bg-amber-100 text-amber-700">
      {data?.items ? (
        <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-2")}>
          {data.items.map((item, idx) => (
            <div key={item.id}
              className={cn(
                "group/idea rounded-xl border-2 overflow-hidden bg-white hover:shadow-md cursor-pointer",
                IDEA_COLORS[(item.id - 1) % IDEA_COLORS.length],
                "transition-all duration-500",
                idx < revealedItems ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              )}
              style={{ transitionDelay: `${Math.floor(idx / 2) * 80}ms` }}
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div className="px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.detail}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onAction("pin", block.id); }}
                    className="opacity-0 group-hover/idea:opacity-100 p-1 rounded hover:bg-amber-100 transition-all cursor-pointer shrink-0" title="Epingler">
                    <Pin className="h-3 w-3 text-amber-500" />
                  </button>
                </div>
              </div>
              {/* Expanded: Impact/Effort + Voting (pattern AtelierBrainstorm L1480-1527) */}
              {expanded === item.id && (
                <div className="px-3 pb-2.5 pt-2 border-t border-gray-100 space-y-2">
                  {(item.impact || item.effort) && (
                    <div className="flex gap-2">
                      {item.impact && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Impact: {item.impact}</span>}
                      {item.effort && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Effort: {item.effort}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setVotes(v => ({ ...v, [item.id]: (v[item.id] || 0) + 1 })); }}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] text-green-600 hover:bg-green-50 cursor-pointer transition-colors">
                      <ThumbsUp className="h-2.5 w-2.5" /> +1
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setVotes(v => ({ ...v, [item.id]: (v[item.id] || 0) - 1 })); }}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] text-red-500 hover:bg-red-50 cursor-pointer transition-colors">
                      <ThumbsDown className="h-2.5 w-2.5" /> -1
                    </button>
                    {(votes[item.id] ?? 0) !== 0 && (
                      <span className={cn("text-xs font-bold", (votes[item.id] ?? 0) > 0 ? "text-green-600" : "text-red-500")}>
                        {(votes[item.id] ?? 0) > 0 ? "+" : ""}{votes[item.id]}
                      </span>
                    )}
                    <div className="flex-1" />
                    <button onClick={(e) => { e.stopPropagation(); onAction("deepen", block.id); }}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer transition-colors">
                      Développer
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onAction("challenge", block.id); }}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-100 cursor-pointer transition-colors">
                      Challenger
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-2")}>
          {parseSummaryItems(block.summary).map((item, i) => (
            <div key={i} className={cn("rounded-lg border border-gray-200 border-l-[3px] bg-white px-3 py-2.5 hover:shadow-sm hover:bg-amber-50/30 transition-all", IDEA_COLORS[i % IDEA_COLORS.length])}>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="h-3 w-3 text-amber-600" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed flex-1">{item}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </BlockWrapper>
  );
}

// ═══ 3. SCAMPER — Pipeline visual avec letter badges (pattern AtelierBrainstorm L1532-1562) ═══

function ScamperRenderer({ block, onAction }: BlockRendererProps) {
  const { compact } = useContext(BlockDisplayContext);
  const data = block.structured_data as { letters?: Record<string, string[]>; activeStep?: number } | undefined;
  const LETTERS = ["S", "C", "A", "M", "P", "E", "R"] as const;
  const LABELS: Record<string, string> = { S: "Substituer", C: "Combiner", A: "Adapter", M: "Modifier", P: "Put to other use", E: "Éliminer", R: "Renverser" };
  const DESCS: Record<string, string> = { S: "Remplacer un element", C: "Fusionner des idees", A: "Emprunter d'ailleurs", M: "Changer forme/echelle", P: "Autre usage possible", E: "Supprimer le superflu", R: "Inverser la logique" };
  const BADGE_COLORS: Record<string, { card: string; badge: string; dot: string; dotDone: string }> = {
    S: { card: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700 border-red-300", dot: "bg-red-500", dotDone: "bg-red-100 text-red-700 border-red-300" },
    C: { card: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700 border-orange-300", dot: "bg-orange-500", dotDone: "bg-orange-100 text-orange-700 border-orange-300" },
    A: { card: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700 border-amber-300", dot: "bg-amber-500", dotDone: "bg-amber-100 text-amber-700 border-amber-300" },
    M: { card: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-700 border-green-300", dot: "bg-green-500", dotDone: "bg-green-100 text-green-700 border-green-300" },
    P: { card: "bg-teal-50 border-teal-200", badge: "bg-teal-100 text-teal-700 border-teal-300", dot: "bg-teal-500", dotDone: "bg-teal-100 text-teal-700 border-teal-300" },
    E: { card: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700 border-blue-300", dot: "bg-blue-500", dotDone: "bg-blue-100 text-blue-700 border-blue-300" },
    R: { card: "bg-violet-50 border-violet-200", badge: "bg-violet-100 text-violet-700 border-violet-300", dot: "bg-violet-500", dotDone: "bg-violet-100 text-violet-700 border-violet-300" },
  };
  const activeStep = data?.activeStep ?? (data?.letters ? Object.keys(data.letters).length : 7);

  return (
    <BlockWrapper block={block} onAction={onAction} label="SCAMPER" labelColor="bg-purple-100 text-purple-700">
      {/* Help section */}
      <div className="rounded-lg border border-purple-200 bg-purple-50/50 px-3 py-2 mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-purple-600 shrink-0" />
          <p className="text-xs text-purple-700 font-medium">Methode SCAMPER — 7 angles creatifs pour generer des idees</p>
        </div>
      </div>
      {/* Pipeline dots — colored per letter (rainbow) */}
      <div className="flex items-center gap-0 mb-4 px-1">
        {LETTERS.map((letter, i) => {
          const idx = LETTERS.indexOf(letter);
          const bc = BADGE_COLORS[letter];
          const isComplete = idx < activeStep;
          const isActive = idx === activeStep;
          return (
            <div key={letter} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-0.5">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all shrink-0",
                  isComplete ? bc.dotDone :
                  isActive ? cn(bc.dot, "text-white border-transparent") :
                  "bg-gray-100 text-gray-400 border-gray-200"
                )}>
                  {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : letter}
                  {isActive && <span className="absolute w-2 h-2 rounded-full bg-white animate-pulse" />}
                </div>
                <span className="text-[7px] text-gray-400 font-medium leading-none">{LABELS[letter].slice(0, 5)}</span>
              </div>
              {i < LETTERS.length - 1 && (
                <div className={cn("h-0.5 flex-1 mx-0.5 rounded-full transition-all mt-[-10px]", isComplete ? bc.dot.replace("bg-", "bg-").replace("500", "300") : "bg-gray-200")} />
              )}
            </div>
          );
        })}
      </div>
      {/* Letter cards with content — colored per letter */}
      {data?.letters ? (
        <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-2")}>
          {LETTERS.map((letter) => {
            const bc = BADGE_COLORS[letter];
            return (
              <div key={letter} className={cn("rounded-lg border bg-white px-3 py-2 transition-all hover:shadow-sm", bc.card)}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border", bc.badge)}>{letter}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700">{LABELS[letter]}</p>
                    <p className="text-[8px] text-gray-400 leading-tight">{DESCS[letter]}</p>
                  </div>
                </div>
                <ul className="space-y-0.5">
                  {(data.letters?.[letter] || []).map((item, i) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                      <span className="text-gray-300 mt-0.5">•</span> {item}
                    </li>
                  ))}
                  {(!data.letters?.[letter] || data.letters[letter].length === 0) && (
                    <li className="text-xs text-gray-300 italic">—</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBlockMarkdown(block.summary) }} />
      )}
    </BlockWrapper>
  );
}

// ═══ 4. 5 Pourquoi — Arbre avec debats inter-bot (pattern MagCinqPourquoi L2342-2530) ═══

function CinqPourquoiRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as {
    levels?: {
      question: string; answer: string; reflexion?: string; bot?: string;
      debate?: { challenger: string; challengeText: string; defense: string; defenseText: string; verdict: string };
    }[];
    rootCause?: string;
  } | undefined;
  // Progressive color depth (MagCinqPourquoi exact pattern)
  const DEPTH_COLORS = [
    { dot: "bg-orange-300", text: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200", line: "from-orange-200 to-orange-300", num: "bg-orange-100 text-orange-700 border-orange-300" },
    { dot: "bg-orange-400", text: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", line: "from-orange-300 to-amber-400", num: "bg-orange-200 text-orange-800 border-orange-400" },
    { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", line: "from-amber-400 to-red-300", num: "bg-amber-200 text-amber-800 border-amber-400" },
    { dot: "bg-red-400", text: "text-red-600", bg: "bg-red-50", border: "border-red-200", line: "from-red-300 to-red-500", num: "bg-red-200 text-red-800 border-red-400" },
    { dot: "bg-red-600", text: "text-red-700", bg: "bg-red-50", border: "border-red-300", line: "from-red-500 to-red-600", num: "bg-red-300 text-red-900 border-red-500" },
  ];
  // Progress indicator — pattern MagCinqPourquoi progress dots
  const totalLevels = data?.levels?.length || 5;
  // Auto-reveal stagger state
  const [revealedCount, setRevealedCount] = useState(0);
  const [showDebate, setShowDebate] = useState<number | null>(null);
  useEffect(() => {
    if (!data?.levels) return;
    setRevealedCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    data.levels.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedCount(c => c + 1), 400 + i * 600));
    });
    return () => timers.forEach(clearTimeout);
  }, [data?.levels?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const isActiveLevel = (i: number) => data?.levels && i === revealedCount - 1 && revealedCount < data.levels.length;

  return (
    <BlockWrapper block={block} onAction={onAction} label="5 Pourquoi" labelColor="bg-orange-100 text-orange-700">
      {data?.levels ? (
        <div className="space-y-0">
          {/* Progress indicator — MagCinqPourquoi pattern */}
          <div className="flex items-center gap-0 mb-4 px-1">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className={cn("flex items-center", n > 1 ? "flex-1" : "")}>
                {n > 1 && <div className={cn("flex-1 h-0.5 transition-all duration-500", n <= revealedCount ? "bg-orange-400" : "bg-gray-200")} />}
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all shrink-0",
                  n <= revealedCount ? (DEPTH_COLORS[n - 1] || DEPTH_COLORS[4]).num : "bg-gray-100 text-gray-400 border-gray-200",
                  n === revealedCount && "ring-2 ring-orange-300 ring-offset-1"
                )}>
                  {n <= revealedCount ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
                </div>
              </div>
            ))}
          </div>

          {data.levels.map((level, i) => {
            const depth = DEPTH_COLORS[i] || DEPTH_COLORS[4];
            const isLast = i === data.levels!.length - 1;
            const isRevealed = i < revealedCount;
            const isActive = isActiveLevel(i);
            return (
              <div
                key={i}
                className={cn("flex gap-2 transition-all duration-700", isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}
                style={{ paddingLeft: `${i * 16}px`, transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex flex-col items-center shrink-0 pt-1">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white transition-all",
                    depth.dot,
                    isLast && "ring-2 ring-red-300 ring-offset-1",
                    isActive && "animate-pulse ring-2 ring-orange-300 ring-offset-1"
                  )}>{i + 1}</div>
                  {!isLast && <div className={cn("w-0.5 flex-1 mt-1 rounded-full bg-gradient-to-b", depth.line)} />}
                </div>
                <div className={cn("pb-3 flex-1 min-w-0 rounded-lg px-3 py-2 -ml-1 transition-colors", isLast ? depth.bg : "", isActive && "bg-orange-50/50")}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-bold", depth.text)}>Pourquoi {i + 1}?</p>
                      <p className="text-sm text-gray-700">{level.question}</p>
                      <p className="text-xs text-gray-500 mt-0.5">→ {level.answer}</p>
                      {level.reflexion && (
                        <p className="text-[10px] text-gray-400 mt-1 italic">{level.reflexion}</p>
                      )}
                    </div>
                    {/* Bot attribution + debate toggle — pattern MagCinqPourquoi */}
                    <div className="flex gap-1 shrink-0">
                      {level.bot && <BotAvatar code={level.bot} size="sm" />}
                      {level.debate && (
                        <button
                          onClick={() => setShowDebate(showDebate === i ? null : i)}
                          className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium cursor-pointer transition-colors",
                            showDebate === i ? "bg-orange-100 border border-orange-200 text-orange-700" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
                          )}
                        >
                          {showDebate === i ? "Fermer" : "Voir le debat"}
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Inter-bot debate — pattern MagCinqPourquoi debate section */}
                  {showDebate === i && level.debate && (
                    <div className="mt-1.5 ml-2 space-y-1.5 border-l-2 border-orange-200 pl-3 animate-in fade-in duration-300">
                      <div className="flex items-start gap-2">
                        <BotAvatar code={level.debate.challenger} size="sm" />
                        <div className="bg-amber-50 border border-amber-200 rounded-lg rounded-tl-none px-2.5 py-1.5 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-bold text-amber-700">{BOT_NAME[level.debate.challenger] || level.debate.challenger}</span>
                            <span className="text-[10px] bg-amber-200 text-amber-800 px-1 py-0.5 rounded">Challenge</span>
                          </div>
                          <p className="text-xs text-gray-700">{level.debate.challengeText}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <BotAvatar code={level.debate.defense} size="sm" />
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg rounded-tl-none px-2.5 py-1.5 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-bold text-emerald-700">{BOT_NAME[level.debate.defense] || level.debate.defense}</span>
                            <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1 py-0.5 rounded">Defense</span>
                          </div>
                          <p className="text-xs text-gray-700">{level.debate.defenseText}</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <p className="text-xs text-blue-700 font-medium">{level.debate.verdict}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {/* Root cause highlight + bonification synthese — pattern MagCinqPourquoi */}
          {data.rootCause && (
            <div
              className={cn("pt-2 border-t border-orange-200 mt-2 transition-all duration-700", revealedCount >= (data.levels?.length || 0) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}
              style={{ transitionDelay: `${(data.levels?.length || 0) * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">{totalLevels}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">Cause racine</p>
                  <p className="text-sm text-gray-800 mt-0.5 leading-relaxed font-medium">{data.rootCause}</p>
                </div>
              </div>
              {/* Bonification — synthesis of debates verdicts */}
              {data.levels?.some(l => l.debate) && (
                <div className="ml-9 mt-2 bg-orange-50 rounded-lg px-3 py-2 border border-orange-200">
                  <p className="text-xs font-bold text-orange-700 mb-1">Bonification — Synthese des debats:</p>
                  <div className="space-y-1">
                    {data.levels.filter(l => l.debate).map((l, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-orange-600">
                        <span className="w-3 h-3 rounded-full bg-orange-200 flex items-center justify-center text-[8px] font-bold text-orange-700 shrink-0">{i + 1}</span>
                        <span>{l.debate!.verdict}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Action buttons — pattern MagCinqPourquoi bottom actions */}
              <div className="flex flex-wrap gap-1.5 mt-3 ml-9">
                <button onClick={() => onAction("deepen", block.id, "rootCause")}
                  className="text-[10px] bg-orange-600 text-white px-2.5 py-1 rounded-full font-medium cursor-pointer hover:bg-orange-700 transition-colors">Creuser cette cause</button>
                <button onClick={() => onAction("challenge", block.id, "rootCause")}
                  className="text-[10px] bg-white border border-orange-200 text-orange-700 px-2.5 py-1 rounded-full font-medium cursor-pointer hover:bg-orange-50 transition-colors">Challenger la conclusion</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBlockMarkdown(block.summary) }} />
      )}
    </BlockWrapper>
  );
}

// ═══ 5. Plan d'action — Checklist ═══

function PlanActionRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { actions?: { titre: string; assignee?: string; priorite?: string; done: boolean }[] } | undefined;
  const PRIO: Record<string, string> = { haute: "bg-red-100 text-red-700", normale: "bg-gray-100 text-gray-600", basse: "bg-green-100 text-green-700" };
  // S4.3 — Interactive checklist toggle
  const [localActions, setLocalActions] = useState(data?.actions || []);
  const doneCount = localActions.filter(a => a.done).length;
  const toggleAction = (idx: number) => {
    setLocalActions(prev => prev.map((a, i) => i === idx ? { ...a, done: !a.done } : a));
  };
  return (
    <BlockWrapper block={block} onAction={onAction} label="Plan d'action" labelColor="bg-green-100 text-green-700">
      {localActions.length > 0 ? (
        <div className="space-y-1.5">
          {localActions.length > 1 && (
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
              <span className="font-medium">{doneCount}/{localActions.length}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${(doneCount / localActions.length) * 100}%` }} />
              </div>
            </div>
          )}
          {localActions.map((a, i) => (
            <div
              key={i}
              onClick={() => toggleAction(i)}
              className={cn(
                "rounded-xl border bg-white px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-all",
                a.done ? "border-green-200 bg-green-50/30" : "border-gray-200 hover:border-green-300 hover:bg-green-50/10"
              )}
            >
              <CheckCircle2 className={cn("h-4 w-4 shrink-0 transition-colors", a.done ? "text-green-500" : "text-gray-300")} />
              <div className="flex-1 min-w-0">
                <span className={cn("text-xs font-medium transition-all", a.done ? "text-gray-400 line-through" : "text-gray-900")}>{a.titre}</span>
              </div>
              {a.priorite && <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", PRIO[a.priorite] || PRIO.normale)}>{a.priorite}</span>}
              {a.assignee && <span className="text-xs text-gray-400 shrink-0">{a.assignee}</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBlockMarkdown(block.summary) }} />
      )}
    </BlockWrapper>
  );
}

// ═══ 6. Budget — Tableau formaté ═══

function BudgetRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { rows?: { poste: string; montant: number; note?: string }[]; total?: number } | undefined;
  return (
    <BlockWrapper block={block} onAction={onAction} label="Budget" labelColor="bg-emerald-100 text-emerald-700">
      {data?.rows ? (
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-sm font-semibold text-left px-3 py-2">Poste</th>
                <th className="text-sm font-semibold text-right px-3 py-2">Montant</th>
                <th className="text-sm font-semibold text-left px-3 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="text-sm text-gray-700 px-3 py-2">{r.poste}</td>
                  <td className="text-sm text-gray-900 font-medium text-right px-3 py-2">{r.montant.toLocaleString()} $</td>
                  <td className="text-xs text-gray-500 px-3 py-2">{r.note || "—"}</td>
                </tr>
              ))}
              {data.total !== undefined && (
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="text-sm font-bold text-gray-900 px-3 py-2">Total</td>
                  <td className="text-sm font-bold text-gray-900 text-right px-3 py-2">{data.total.toLocaleString()} $</td>
                  <td className="px-3 py-2" />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div>{formatCristallise(block.summary)}</div>
      )}
    </BlockWrapper>
  );
}

// ═══ 7. Timeline — Vertical timeline ═══

function TimelineRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { events?: { date: string; action: string; type: string }[] } | undefined;
  const TI: Record<string, { icon: typeof Clock; color: string }> = {
    decision:   { icon: CheckCircle2, color: "text-green-500" },
    document:   { icon: FileText,     color: "text-blue-500" },
    mission:    { icon: Layers,       color: "text-violet-500" },
    diagnostic: { icon: Activity,     color: "text-amber-500" },
    default:    { icon: Clock,        color: "text-gray-400" },
  };
  return (
    <BlockWrapper block={block} onAction={onAction} label="Timeline" labelColor="bg-sky-100 text-sky-700">
      {data?.events ? (
        <div className="space-y-0">
          {data.events.map((e, i) => {
            const ti = TI[e.type] || TI.default;
            const TIcon = ti.icon;
            return (
              <div key={i} className="flex gap-3 py-2.5 border-b border-gray-100 last:border-0">
                <span className="text-xs text-gray-400 w-12 shrink-0 pt-0.5 text-right">{e.date}</span>
                <div className="flex flex-col items-center shrink-0">
                  <TIcon className={cn("h-3.5 w-3.5", ti.color)} />
                  {i < data.events.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-sm text-gray-700 leading-relaxed">{e.action}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBlockMarkdown(block.summary) }} />
      )}
    </BlockWrapper>
  );
}

// ═══ 8. Métriques — KPI cards with delta ═══

function MetriquesRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { kpis?: { label: string; value: string; delta?: string; positive?: boolean }[] } | undefined;
  return (
    <BlockWrapper block={block} onAction={onAction} label="Métriques" labelColor="bg-blue-100 text-blue-700">
      {data?.kpis ? (
        <div className="grid grid-cols-3 gap-2">
          {data.kpis.map((kpi, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-3 flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", kpi.positive !== false ? "bg-green-100" : "bg-red-100")}>
                <TrendingUp className={cn("h-4 w-4", kpi.positive !== false ? "text-green-600" : "text-red-600")} />
              </div>
              <div>
                <p className="text-xs text-gray-400">{kpi.label}</p>
                <p className="text-xs font-bold text-gray-900">{kpi.value}</p>
                {kpi.delta && <p className={cn("text-[9px] font-medium", kpi.positive !== false ? "text-green-600" : "text-red-600")}>{kpi.delta}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBlockMarkdown(block.summary) }} />
      )}
    </BlockWrapper>
  );
}

// ═══ 9. Projets — Liste avec progress ═══

function ProjetsRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { projets?: { titre: string; phase?: string; pct: number; bot?: string }[] } | undefined;
  return (
    <BlockWrapper block={block} onAction={onAction} label="Projets" labelColor="bg-violet-100 text-violet-700">
      {data?.projets ? (
        <div className="space-y-2">
          {data.projets.map((p, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-900">{p.titre}</span>
                <span className="text-xs font-bold text-gray-500">{p.pct}%</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full">
                <div className="h-full bg-violet-400 rounded-full transition-all" style={{ width: `${p.pct}%` }} />
              </div>
              {(p.phase || p.bot) && (
                <div className="flex items-center gap-2 mt-1.5">
                  {p.phase && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{p.phase}</span>}
                  {p.bot && <BotBadgeFull botCode={p.bot} compact />}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBlockMarkdown(block.summary) }} />
      )}
    </BlockWrapper>
  );
}

// ═══ 10. Tâches — Checklist ═══

function TachesRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { taches?: { titre: string; assignee?: string; done: boolean }[] } | undefined;
  // S4.3 — Interactive checklist: local state for toggle done/not done
  const [localTaches, setLocalTaches] = useState(data?.taches || []);
  const doneCount = localTaches.filter(t => t.done).length;
  const toggleDone = (idx: number) => {
    setLocalTaches(prev => prev.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  };
  return (
    <BlockWrapper block={block} onAction={onAction} label="Tâches" labelColor="bg-green-100 text-green-700">
      {localTaches.length > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
            <span className="font-medium">{doneCount}/{localTaches.length} complétées</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${(doneCount / localTaches.length) * 100}%` }} />
            </div>
          </div>
          {localTaches.map((t, i) => (
            <div
              key={i}
              onClick={() => toggleDone(i)}
              className={cn(
                "rounded-xl border bg-white px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-all",
                t.done ? "border-green-200 bg-green-50/30" : "border-gray-200 hover:border-green-300 hover:bg-green-50/10"
              )}
            >
              <CheckCircle2 className={cn("h-4 w-4 shrink-0 transition-colors", t.done ? "text-green-500" : "text-gray-300")} />
              <div className="flex-1 min-w-0">
                <span className={cn("text-xs font-medium transition-all", t.done ? "text-gray-400 line-through" : "text-gray-900")}>{t.titre}</span>
              </div>
              {t.assignee && <span className="text-xs text-gray-400 shrink-0">{t.assignee}</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBlockMarkdown(block.summary) }} />
      )}
    </BlockWrapper>
  );
}

// ═══ 11. Recommandations ═══

function RecommandationsRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { items?: { id: number; title: string; detail: string }[] } | undefined;
  return (
    <BlockWrapper block={block} onAction={onAction} label="Recommandations" labelColor="bg-sky-100 text-sky-700">
      {data?.items ? (
        <div className="space-y-2">
          {data.items.map((item) => (
            <div key={item.id} className="rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold text-sky-500 mt-0.5 w-4 shrink-0">{item.id}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBlockMarkdown(block.summary) }} />
      )}
    </BlockWrapper>
  );
}

// ═══ 12. Risques — Badges sévérité ═══

function RisquesRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { risques?: { zone: string; severite: string; desc: string }[] } | undefined;
  const SEV: Record<string, { bg: string; text: string }> = {
    critique: { bg: "bg-red-100", text: "text-red-700" },
    modere:   { bg: "bg-amber-100", text: "text-amber-700" },
    faible:   { bg: "bg-green-100", text: "text-green-700" },
  };
  return (
    <BlockWrapper block={block} onAction={onAction} label="Risques" labelColor="bg-red-100 text-red-700">
      {data?.risques ? (
        <div className="space-y-2">
          {data.risques.map((r, i) => {
            const s = SEV[r.severite] || SEV.modere;
            return (
              <div key={i} className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={cn("h-3.5 w-3.5", s.text)} />
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", s.bg, s.text)}>{r.severite}</span>
                  <span className="text-xs font-medium text-gray-900 flex-1">{r.zone}</span>
                </div>
                <p className="text-xs text-gray-600 ml-5">{r.desc}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBlockMarkdown(block.summary) }} />
      )}
    </BlockWrapper>
  );
}

// ═══ 13. Benchmark — Cards avec source + score (pattern FocusDiscussionView StatCard) ═══

function BenchmarkRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { benchmarks?: { source: string; score?: string; insight: string }[] } | undefined;
  return (
    <BlockWrapper block={block} onAction={onAction} label="Benchmark" labelColor="bg-indigo-100 text-indigo-700">
      {data?.benchmarks ? (
        <div className="space-y-2">
          {data.benchmarks.map((b, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white px-4 py-3 hover:bg-indigo-50/30 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-3 w-3 text-indigo-600" />
                </div>
                <span className="text-xs font-medium text-gray-900 flex-1">{b.source}</span>
                {b.score && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">{b.score}</span>}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed ml-8">{b.insight}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {parseSummaryItems(block.summary).map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white px-4 py-3 hover:bg-indigo-50/30 transition-colors">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="h-3 w-3 text-indigo-600" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed flex-1">{item}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </BlockWrapper>
  );
}

// ═══ 14. Challenge — Contre-arguments avec AlertTriangle (pattern FocusReflexionView StepAnalyse) ═══

function ChallengeRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as {
    arguments?: { point: string; severity?: string }[];
    // S3A.1: 3-phase format (challenge → defense → verdict)
    challenge?: string[];
    defense?: string[];
    verdict?: string;
  } | undefined;
  // S3A.1: 3-phase sequential reveal (1.2s apart)
  const has3Phase = data?.challenge && data?.defense;
  const [revealPhase, setRevealPhase] = useState(0);
  useEffect(() => {
    if (!has3Phase) return;
    setRevealPhase(0);
    const t1 = setTimeout(() => setRevealPhase(1), 800);
    const t2 = setTimeout(() => setRevealPhase(2), 2000);
    const t3 = setTimeout(() => setRevealPhase(3), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [has3Phase]);
  // Stagger for legacy arguments
  const [revealedArgs, setRevealedArgs] = useState(0);
  useEffect(() => {
    if (has3Phase || !data?.arguments) return;
    setRevealedArgs(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    data.arguments.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedArgs(c => c + 1), 300 + i * 400));
    });
    return () => timers.forEach(clearTimeout);
  }, [data?.arguments?.length, has3Phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BlockWrapper block={block} onAction={onAction} label="Challenge" labelColor="bg-amber-100 text-amber-700">
      {has3Phase ? (
        <div className="bg-white border-2 border-amber-300 rounded-xl overflow-hidden">
          <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">Challenge: {block.title}</span>
          </div>
          <div className="p-4 space-y-3">
            {/* Phase 1: Challenge (amber) — pattern MagChallenge */}
            <div className={cn("flex items-start gap-3 transition-all duration-700", revealPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
              <BotAvatar code={(data as any).challengerBot || "CSOB"} size="sm" />
              <div className="flex-1 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold text-amber-700">{BOT_NAME[(data as any).challengerBot] || "Challenger"}</span>
                  <span className="text-[10px] bg-amber-200 text-amber-800 px-1 py-0.5 rounded">Challenge</span>
                </div>
                <div className="space-y-1.5">
                  {data.challenge!.map((pt, i) => (
                    <p key={i} className="text-xs text-gray-700">• {pt}</p>
                  ))}
                </div>
              </div>
            </div>
            {/* Phase 2: Defense (emerald) — pattern MagChallenge */}
            <div className={cn("flex items-start gap-3 transition-all duration-700", revealPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
              <BotAvatar code={(data as any).defenderBot || "CEOB"} size="sm" />
              <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold text-emerald-700">{BOT_NAME[(data as any).defenderBot] || "Defense"}</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1 py-0.5 rounded">Defense</span>
                </div>
                <div className="space-y-1.5">
                  {data.defense!.map((pt, i) => (
                    <p key={i} className="text-xs text-gray-700">• {pt}</p>
                  ))}
                </div>
              </div>
            </div>
            {/* Phase 3: Verdict (blue) — pattern MagChallenge */}
            {data.verdict && (
              <div className={cn("flex items-start gap-3 transition-all duration-700", revealPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
                <BotAvatar code={block.source || "CEOB"} size="sm" />
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Trophy className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-blue-700">Verdict</span>
                    <span className="text-[10px] bg-blue-200 text-blue-800 px-1 py-0.5 rounded">Final</span>
                  </div>
                  <p className="text-xs text-gray-700 font-medium">{data.verdict}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-3 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Avocat du diable</span>
          </div>
          {data?.arguments ? (
            <div className="space-y-2 ml-6">
              {data.arguments.map((a, i) => {
                const sevColor = a.severity === "critique" ? "text-red-600" : a.severity === "modere" ? "text-amber-600" : "text-gray-600";
                return (
                  <div key={i} className={cn(
                    "flex items-start gap-2 transition-all duration-500",
                    i < revealedArgs ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  )} style={{ transitionDelay: `${i * 100}ms` }}>
                    <span className={cn("text-xs font-bold shrink-0 mt-0.5", sevColor)}>{i + 1}.</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{a.point}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2 ml-6">
              {parseSummaryItems(block.summary).map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-amber-600 shrink-0 mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </BlockWrapper>
  );
}

// ═══ 15. Synthèse — Résumé exécutif (pattern FocusReflexionView StepPrerapport) ═══

function SyntheseRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { points?: { label: string; done?: boolean }[]; conclusion?: string } | undefined;
  return (
    <BlockWrapper block={block} onAction={onAction} label="Synthèse" labelColor="bg-sky-100 text-sky-700">
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Résumé exécutif</h4>
        {data?.points ? (
          <div className="space-y-2">
            {data.points.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", p.done !== false ? "text-green-500" : "text-gray-300")} />
                <span className="text-gray-800">{p.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {parseSummaryItems(block.summary).map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span className="text-gray-800">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {data?.conclusion && (
        <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">{data.conclusion}</p>
          </div>
        </div>
      )}
    </BlockWrapper>
  );
}

// ═══ 16. Rapport — Document multi-sections (pattern MagPreRapport L2908-3149) ═══

const SECTION_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  tension: { icon: Zap, color: "text-red-600", bg: "bg-red-50" },
  analyse: { icon: Search, color: "text-blue-600", bg: "bg-blue-50" },
  idees: { icon: Lightbulb, color: "text-amber-600", bg: "bg-amber-50" },
  decisions: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  plan: { icon: Target, color: "text-violet-600", bg: "bg-violet-50" },
  budget: { icon: BarChart3, color: "text-green-600", bg: "bg-green-50" },
  risques: { icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
  recommandations: { icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50" },
};

function guessSectionIcon(title: string): { icon: React.ElementType; color: string; bg: string } {
  const t = title.toLowerCase();
  if (t.includes("tension") || t.includes("probleme") || t.includes("enjeu")) return SECTION_ICONS.tension;
  if (t.includes("analyse") || t.includes("constat") || t.includes("diagnostic") || t.includes("etat")) return SECTION_ICONS.analyse;
  if (t.includes("idee") || t.includes("brainstorm") || t.includes("proposit") || t.includes("explor")) return SECTION_ICONS.idees;
  if (t.includes("decision") || t.includes("valid") || t.includes("choix") || t.includes("priorit")) return SECTION_ICONS.decisions;
  if (t.includes("plan") || t.includes("action") || t.includes("etape") || t.includes("timeline")) return SECTION_ICONS.plan;
  if (t.includes("budget") || t.includes("cout") || t.includes("financ") || t.includes("invest")) return SECTION_ICONS.budget;
  if (t.includes("risque") || t.includes("danger") || t.includes("attention")) return SECTION_ICONS.risques;
  return SECTION_ICONS.recommandations;
}

function RapportRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as {
    sections?: { title: string; content: string; bot?: string; icon?: string }[];
    votes?: { bot: string; vote: string; reason: string }[];
    metrics?: { label: string; value: string; sub?: string; color?: string; delta?: string; positive?: boolean }[];
    tasks?: { titre: string; priorite: string; bot?: string; assignee?: string; status: string; echeance?: string }[];
    timeline?: { date: string; action: string; bot?: string; type: string }[];
    pipeline?: { phase: string; status: string; pct: number }[];
  } | undefined;
  // S3B.1: Accordion state for expandable sections
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };
  // S3A.1: Staggered reveal — progressive compilation (pattern MagPreRapport)
  const [revealedSections, setRevealedSections] = useState(0);
  const sections = data?.sections || parseSummarySections(block.summary).map(s => ({ title: s.title, content: s.body }));
  useEffect(() => {
    setRevealedSections(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    sections.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedSections(c => c + 1), 300 + i * 400));
    });
    return () => timers.forEach(clearTimeout);
  }, [sections.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const [pinnedSection, setPinnedSection] = useState<number | null>(null);
  // Inline action state: which section has an active action + result
  const [activeAction, setActiveAction] = useState<{ sectionId: number; action: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResults, setActionResults] = useState<Record<number, { action: string; data: Record<string, unknown> }>>({});
  const [sectionContents, setSectionContents] = useState<Record<number, string>>({});
  const isCompiling = revealedSections < sections.length;

  // Inline action handler — calls API and stores result per section
  const handleSectionAction = async (sectionIdx: number, action: "approfondir" | "reformuler" | "challenger") => {
    const s = sections[sectionIdx];
    if (!s) return;
    setActiveAction({ sectionId: sectionIdx, action });
    setActionLoading(true);
    try {
      const result = await api.sectionAction({
        action,
        section_title: s.title || `Section ${sectionIdx + 1}`,
        section_content: sectionContents[sectionIdx] || s.content,
        block_id: block.id,
        bot_code: (s as any).bot || "CPOB",
      });
      setActionResults(prev => ({ ...prev, [sectionIdx]: { action, data: result } }));
    } catch {
      setActionResults(prev => ({ ...prev, [sectionIdx]: { action, data: { error: true } } }));
    } finally {
      setActionLoading(false);
    }
  };

  // Apply reformulation — replace section content
  const applyReformulation = (sectionIdx: number, newContent: string) => {
    setSectionContents(prev => ({ ...prev, [sectionIdx]: newContent }));
    setActionResults(prev => { const n = { ...prev }; delete n[sectionIdx]; return n; });
    setActiveAction(null);
  };

  return (
    <BlockWrapper block={block} onAction={onAction} label="Rapport" labelColor="bg-gray-200 text-gray-700">
      {/* Compilation progress bar — pattern MagPreRapport */}
      {isCompiling && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-2.5 flex items-center gap-3 mb-3">
          <Loader2 className="h-4 w-4 text-orange-500 animate-spin shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-orange-600 font-medium">Compilation du rapport... {revealedSections}/{sections.length} sections</p>
            <div className="h-1.5 bg-orange-100 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${(revealedSections / sections.length) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Sections accordion — pattern MagPreRapport sections with inline actions */}
      <div className="space-y-2">
        {sections.map((s, i) => {
          const isExpanded = expandedSections.has(i);
          const isRevealed = i < revealedSections;
          const isPinned = pinnedSection === i;
          const si = guessSectionIcon(s.title);
          const SectionIcon = si.icon;
          const displayContent = sectionContents[i] || s.content;
          const inlineResult = actionResults[i];
          const isThisLoading = actionLoading && activeAction?.sectionId === i;
          return (
            <div key={i} className={cn(
              "rounded-xl border-2 bg-white overflow-hidden transition-all duration-500",
              isPinned ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200",
              isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )} style={{ transitionDelay: `${i * 100}ms` }}>
              {/* Section header with icon + bot */}
              <button
                onClick={() => toggleSection(i)}
                className={cn("flex items-center gap-2 w-full px-4 py-2.5 transition-colors cursor-pointer", si.bg)}
              >
                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", si.bg)}>
                  <SectionIcon className={cn("h-3.5 w-3.5", si.color)} />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-gray-600 font-bold shrink-0">{i + 1}</span>
                <h4 className="text-xs font-bold text-gray-900 flex-1 text-left">{s.title || `Section ${i + 1}`}</h4>
                {(s as any).bot && <BotAvatar code={(s as any).bot} size="sm" />}
                <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform shrink-0", isExpanded && "rotate-180")} />
              </button>
              {isExpanded && (
                <div className="px-4 pb-3 pt-2 animate-in fade-in duration-200">
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{displayContent}</p>
                  {/* Micro-actions bar — Approfondir + Reformuler + Challenger + Fusionner + Epingler */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleSectionAction(i, "approfondir")}
                      disabled={isThisLoading}
                      className={cn("text-[9px] px-2 py-0.5 rounded font-medium cursor-pointer transition-colors",
                        activeAction?.sectionId === i && activeAction?.action === "approfondir"
                          ? "bg-blue-100 border border-blue-200 text-blue-700"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      )}
                    >Approfondir</button>
                    <button
                      onClick={() => handleSectionAction(i, "reformuler")}
                      disabled={isThisLoading}
                      className={cn("text-[9px] px-2 py-0.5 rounded font-medium cursor-pointer transition-colors",
                        activeAction?.sectionId === i && activeAction?.action === "reformuler"
                          ? "bg-violet-100 border border-violet-200 text-violet-700"
                          : "bg-violet-50 text-violet-600 hover:bg-violet-100"
                      )}
                    >Reformuler</button>
                    <button
                      onClick={() => handleSectionAction(i, "challenger")}
                      disabled={isThisLoading}
                      className={cn("text-[9px] px-2 py-0.5 rounded font-medium cursor-pointer transition-colors",
                        activeAction?.sectionId === i && activeAction?.action === "challenger"
                          ? "bg-amber-100 border border-amber-200 text-amber-700"
                          : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                      )}
                    >Challenger</button>
                    <button
                      onClick={() => onAction("merge", block.id, s.title)}
                      className="text-[9px] px-2 py-0.5 rounded font-medium cursor-pointer bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                    >Fusionner</button>
                    <button
                      onClick={() => setPinnedSection(isPinned ? null : i)}
                      className={cn("text-[9px] px-2 py-0.5 rounded font-medium cursor-pointer transition-colors",
                        isPinned
                          ? "bg-blue-100 border border-blue-200 text-blue-700"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      )}
                    >{isPinned ? "Desepingler" : "Epingler"}</button>
                  </div>

                  {/* Loading indicator — bouncing dots */}
                  {isThisLoading && (
                    <div className={cn("mt-3 rounded-lg border p-3 flex items-center gap-2",
                      activeAction?.action === "reformuler" ? "border-amber-200 bg-amber-50" : "border-violet-200 bg-violet-50"
                    )}>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(d => (
                          <div key={d} className={cn("w-1.5 h-1.5 rounded-full animate-bounce",
                            activeAction?.action === "reformuler" ? "bg-amber-400" : "bg-violet-400"
                          )} style={{ animationDelay: `${d * 150}ms` }} />
                        ))}
                      </div>
                      <span className={cn("text-[10px] font-medium",
                        activeAction?.action === "reformuler" ? "text-amber-600" : "text-violet-600"
                      )}>
                        {activeAction?.action === "approfondir" ? "Analyse approfondie en cours..." :
                         activeAction?.action === "reformuler" ? "Reformulation en cours..." :
                         "Challenge en cours..."}
                      </span>
                    </div>
                  )}

                  {/* ═══ INLINE RESULT: Approfondir ═══ */}
                  {inlineResult?.action === "approfondir" && !isThisLoading && (
                    <div className="mt-3 rounded-lg border-2 border-violet-200 bg-violet-50/50 p-3 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <BotAvatar code={String(inlineResult.data.bot || "CPOB")} size="sm" />
                        <span className="text-[10px] font-bold text-violet-700">
                          Analyse approfondie par {BOT_NAME[String(inlineResult.data.bot || "CPOB")] || "Expert"}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg border border-violet-100 p-2.5 mb-2">
                        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {String(inlineResult.data.expanded || "")}
                        </p>
                      </div>
                      {Array.isArray(inlineResult.data.data_points) && (inlineResult.data.data_points as string[]).length > 0 && (
                        <ul className="space-y-1 mb-2">
                          {(inlineResult.data.data_points as string[]).map((dp, j) => (
                            <li key={j} className="flex items-start gap-1.5 text-[10px] text-violet-700">
                              <BarChart3 className="h-3 w-3 mt-0.5 shrink-0 text-violet-400" />
                              <span>{dp}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            const expanded = String(inlineResult.data.expanded || "");
                            setSectionContents(prev => ({ ...prev, [i]: displayContent + "\n\n" + expanded }));
                            setActionResults(prev => { const n = { ...prev }; delete n[i]; return n; });
                            setActiveAction(null);
                          }}
                          className="text-[9px] px-2 py-1 rounded bg-violet-600 text-white font-medium hover:bg-violet-700 cursor-pointer transition-colors"
                        >Integrer au rapport</button>
                        <button
                          onClick={() => handleSectionAction(i, "approfondir")}
                          className="text-[9px] px-2 py-1 rounded bg-violet-100 text-violet-700 font-medium hover:bg-violet-200 cursor-pointer transition-colors"
                        >Encore plus profond</button>
                      </div>
                    </div>
                  )}

                  {/* ═══ INLINE RESULT: Reformuler ═══ */}
                  {inlineResult?.action === "reformuler" && !isThisLoading && (
                    <div className="mt-3 rounded-lg border-2 border-amber-200 bg-amber-50/50 p-3 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="rounded-lg bg-gray-100 p-2">
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Avant</span>
                          <p className="text-[10px] text-gray-400 mt-1 line-through leading-relaxed">
                            {String(inlineResult.data.before || displayContent)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-amber-100 p-2">
                          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Apres</span>
                          <p className="text-[10px] text-amber-800 mt-1 leading-relaxed">
                            {String(inlineResult.data.after || "")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => applyReformulation(i, String(inlineResult.data.after || ""))}
                          className="text-[9px] px-2 py-1 rounded bg-amber-600 text-white font-medium hover:bg-amber-700 cursor-pointer transition-colors"
                        >Appliquer la reformulation</button>
                        <button
                          onClick={() => handleSectionAction(i, "reformuler")}
                          className="text-[9px] px-2 py-1 rounded bg-amber-100 text-amber-700 font-medium hover:bg-amber-200 cursor-pointer transition-colors"
                        >Autre version</button>
                        <button
                          onClick={() => { setActionResults(prev => { const n = { ...prev }; delete n[i]; return n; }); setActiveAction(null); }}
                          className="text-[9px] px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 cursor-pointer transition-colors"
                        >Garder l'original</button>
                      </div>
                    </div>
                  )}

                  {/* ═══ INLINE RESULT: Challenger ═══ */}
                  {inlineResult?.action === "challenger" && !isThisLoading && (
                    <div className="mt-3 rounded-lg border-2 border-red-200 bg-red-50/50 p-3 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Swords className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-[10px] font-bold text-red-700">Challenge</span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white rounded-lg border border-red-100 p-2">
                          <p className="text-[9px] font-bold text-red-600 uppercase mb-0.5">Contre-argument</p>
                          <p className="text-xs text-gray-700 leading-relaxed">{String(inlineResult.data.challenge || "")}</p>
                        </div>
                        {inlineResult.data.risk && (
                          <div className="bg-white rounded-lg border border-amber-100 p-2">
                            <p className="text-[9px] font-bold text-amber-600 uppercase mb-0.5">Risque</p>
                            <p className="text-xs text-gray-700 leading-relaxed">{String(inlineResult.data.risk)}</p>
                          </div>
                        )}
                        {inlineResult.data.alternative && (
                          <div className="bg-white rounded-lg border border-emerald-100 p-2">
                            <p className="text-[9px] font-bold text-emerald-600 uppercase mb-0.5">Alternative</p>
                            <p className="text-xs text-gray-700 leading-relaxed">{String(inlineResult.data.alternative)}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        <button
                          onClick={() => { setActionResults(prev => { const n = { ...prev }; delete n[i]; return n; }); setActiveAction(null); }}
                          className="text-[9px] px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 cursor-pointer transition-colors"
                        >Fermer</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Team vote grid — pattern MagPreRapport passage en Conception */}
      {data?.votes && data.votes.length > 0 && (
        <div className={cn("border border-gray-200 rounded-xl overflow-hidden mt-3 transition-all duration-700",
          revealedSections >= sections.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        )}>
          <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200 flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Vote equipe</span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-gray-200">
            {data.votes.map((v, i) => (
              <div key={i} className="bg-white px-2.5 py-2 flex items-start gap-2">
                <BotAvatar code={v.bot} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-700">{BOT_NAME[v.bot] || v.bot}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                      v.vote === "GO" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>{v.vote}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{v.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget/ROI/Timeline metric cards — pattern MagPreRapport 3-col metrics */}
      {data?.metrics && data.metrics.length > 0 && (
        <div className={cn("grid gap-2 mt-3 transition-all duration-700",
          data.metrics.length === 3 ? "grid-cols-3" : "grid-cols-2",
          revealedSections >= sections.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        )}>
          {data.metrics.map((m, i) => {
            const mc = m.color || ["emerald", "blue", "orange"][i % 3];
            return (
              <div key={i} className={cn("border rounded-lg px-3 py-2 text-center",
                `bg-${mc}-50 border-${mc}-200`
              )}>
                <div className="flex items-center justify-center gap-1">
                  <p className={cn("text-lg font-extrabold", `text-${mc}-700`)}>{m.value}</p>
                  {m.delta && (
                    <span className={cn("text-[10px] font-bold", m.positive ? "text-emerald-600" : "text-red-500")}>
                      {m.positive ? "↑" : "↓"}{m.delta}
                    </span>
                  )}
                </div>
                <p className={cn("text-[10px]", `text-${mc}-600`)}>{m.label}</p>
                {m.sub && <p className="text-[9px] text-gray-400 mt-0.5">{m.sub}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Tasks checklist — plan d'action actionnable ═══ */}
      {data?.tasks && data.tasks.length > 0 && (
        <div className={cn("mt-3 transition-all duration-700",
          revealedSections >= sections.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        )}>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200 flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Plan d'action</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500 font-bold">{data.tasks.length}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {data.tasks.map((t, i) => {
                const prioColor = t.priorite === "haute" ? "bg-red-100 text-red-700" : t.priorite === "moyenne" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500";
                return (
                  <div key={i} className="px-3 py-2 flex items-start gap-2.5">
                    <div className={cn("mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors",
                      t.status === "fait" ? "bg-emerald-500 border-emerald-500" : "border-gray-300 hover:border-gray-400"
                    )}>
                      {t.status === "fait" && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn("text-xs font-medium", t.status === "fait" ? "text-gray-400 line-through" : "text-gray-800")}>{t.titre}</span>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", prioColor)}>{t.priorite}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {t.bot && <BotAvatar code={t.bot} size="sm" />}
                        {t.assignee && <span className="text-[10px] text-gray-400">{t.assignee}</span>}
                        {t.echeance && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{t.echeance}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const detail = { titre: t.titre, priorite: t.priorite, bot: t.bot, assignee: t.assignee, blockId: block.id };
                        window.dispatchEvent(new CustomEvent("bt-delegate-task", { detail }));
                      }}
                      className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 cursor-pointer transition-colors shrink-0"
                    >Deleguer</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Timeline verticale — chronologie de la discussion ═══ */}
      {data?.timeline && data.timeline.length > 0 && (
        <div className={cn("mt-3 transition-all duration-700",
          revealedSections >= sections.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        )}>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Chronologie</span>
            </div>
            <div className="px-3 py-2">
              {data.timeline.map((t, i) => {
                const dotColor = t.type === "decision" ? "bg-blue-500" : t.type === "action" ? "bg-emerald-500" : t.type === "insight" ? "bg-amber-500" : "bg-purple-500";
                const typeBadge = t.type === "decision" ? "bg-blue-50 text-blue-600" : t.type === "action" ? "bg-emerald-50 text-emerald-600" : t.type === "insight" ? "bg-amber-50 text-amber-600" : "bg-purple-50 text-purple-600";
                return (
                  <div key={i} className="flex gap-3 relative">
                    {/* Vertical line */}
                    {i < data.timeline!.length - 1 && (
                      <div className="absolute left-[7px] top-5 bottom-0 w-px bg-gray-200" />
                    )}
                    <div className={cn("w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 ring-2 ring-white", dotColor)} />
                    <div className="flex-1 pb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {t.bot && <BotAvatar code={t.bot} size="sm" />}
                        <span className="text-xs font-medium text-gray-800">{t.action}</span>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", typeBadge)}>{t.type}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">{t.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Pipeline CREDO — progression 5 phases ═══ */}
      {data?.pipeline && data.pipeline.length > 0 && (
        <div className={cn("mt-3 transition-all duration-700",
          revealedSections >= sections.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        )}>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200 flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Progression CREDO</span>
            </div>
            <div className="px-3 py-3 flex items-center gap-1">
              {data.pipeline.map((p, i) => {
                const isDone = p.status === "done";
                const isActive = p.status === "active";
                const letter = p.phase.charAt(0).toUpperCase();
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                      isDone ? "bg-emerald-500 text-white" : isActive ? "bg-blue-500 text-white animate-pulse" : "bg-gray-200 text-gray-400"
                    )}>
                      {isDone ? <Check className="h-3.5 w-3.5" /> : letter}
                    </div>
                    <span className={cn("text-[9px] font-medium text-center",
                      isDone ? "text-emerald-600" : isActive ? "text-blue-600" : "text-gray-400"
                    )}>{p.phase}</span>
                    <span className={cn("text-[8px]",
                      isDone ? "text-emerald-500" : isActive ? "text-blue-500" : "text-gray-300"
                    )}>{p.pct}%</span>
                    {/* Connector bar */}
                    {i < data.pipeline!.length - 1 && (
                      <div className={cn("absolute h-0.5 w-full top-3.5",
                        isDone ? "bg-emerald-300" : "bg-gray-200"
                      )} style={{ display: "none" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </BlockWrapper>
  );
}

// ═══ 17. Libre — Texte avec sections parsées (pattern parseContentSections) ═══

function LibreRenderer({ block, onAction }: BlockRendererProps) {
  const [expanded, setExpanded] = useState(false);
  const imageUrl = block.structured_data?.image_url as string | undefined;
  const isVision = imageUrl || block.structured_data?.vision;
  const isLong = (block.summary || "").length > 800;
  return (
    <BlockWrapper block={block} onAction={onAction} label={isVision ? "Vision" : "Note"} labelColor={isVision ? "bg-cyan-100 text-cyan-700" : "bg-gray-100 text-gray-600"}>
      {/* Image capture from CarlOS Vision */}
      {imageUrl && (
        <div className="mb-3 rounded-lg overflow-hidden border border-cyan-200">
          <img
            src={imageUrl}
            alt={block.title || "Vision capture"}
            className="w-full h-auto max-h-[300px] object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="relative">
        <div
          className={cn("text-sm text-gray-700 leading-relaxed overflow-hidden transition-all duration-300",
            isLong && !expanded && "max-h-[300px]"
          )}
          dangerouslySetInnerHTML={{ __html: formatBlockMarkdown(block.summary) }}
        />
        {isLong && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1"
        >
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", expanded && "rotate-180")} />
          {expanded ? "Réduire" : "Voir tout"}
        </button>
      )}
    </BlockWrapper>
  );
}

// ═══ 17b. Code — Rendu code monospace avec coloration et copie ═══

function parseCodeBlocks(text: string): { language: string; code: string }[] {
  if (!text) return [];
  const fenceRegex = /```(\w*)\n([\s\S]*?)```/g;
  const blocks: { language: string; code: string }[] = [];
  let match;
  while ((match = fenceRegex.exec(text)) !== null) {
    blocks.push({ language: match[1] || "text", code: match[2].trimEnd() });
  }
  if (blocks.length === 0 && text.trim()) {
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    blocks.push({ language: "text", code: cleaned.trim() });
  }
  return blocks;
}

const LANG_LABELS: Record<string, { label: string; color: string }> = {
  typescript: { label: "TypeScript", color: "text-blue-400" },
  ts: { label: "TypeScript", color: "text-blue-400" },
  tsx: { label: "TSX", color: "text-blue-400" },
  javascript: { label: "JavaScript", color: "text-yellow-400" },
  js: { label: "JavaScript", color: "text-yellow-400" },
  jsx: { label: "JSX", color: "text-yellow-400" },
  python: { label: "Python", color: "text-green-400" },
  py: { label: "Python", color: "text-green-400" },
  sql: { label: "SQL", color: "text-orange-400" },
  bash: { label: "Bash", color: "text-lime-400" },
  sh: { label: "Shell", color: "text-lime-400" },
  json: { label: "JSON", color: "text-amber-400" },
  html: { label: "HTML", color: "text-red-400" },
  css: { label: "CSS", color: "text-pink-400" },
  yaml: { label: "YAML", color: "text-cyan-400" },
  yml: { label: "YAML", color: "text-cyan-400" },
  text: { label: "Code", color: "text-gray-400" },
};

function CodeBlockView({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const langInfo = LANG_LABELS[language.toLowerCase()] || { label: language || "Code", color: "text-gray-400" };
  const lines = code.split("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl border border-gray-700 bg-[#1e1e2e] shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#181825] border-b border-gray-700">
        <div className="flex items-center gap-1.5">
          <Code className={cn("h-3 w-3", langInfo.color)} />
          <span className={cn("text-[10px] font-medium", langInfo.color)}>{langInfo.label}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <ClipboardCopy className="h-3 w-3" />}
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      {/* Code content with scroll for wide lines */}
      <div className="overflow-auto max-h-[500px]">
        <pre className="p-3 text-sm leading-relaxed">
          <code className="font-mono text-[13px] text-gray-200">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="select-none text-gray-600 text-right w-8 pr-3 shrink-0 text-[11px] leading-relaxed">{i + 1}</span>
                <span className="flex-1 whitespace-pre">{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

function CodeRenderer({ block, onAction }: BlockRendererProps) {
  const lang = (block.structured_data?.language as string) || "";
  const codeBlocks = parseCodeBlocks(block.summary || "");
  const descriptionText = (block.summary || "")
    .replace(/```\w*\n[\s\S]*?```/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return (
    <BlockWrapper block={block} onAction={onAction} label="Code" labelColor="bg-violet-100 text-violet-700">
      {descriptionText && (
        <div className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">{descriptionText}</div>
      )}
      <div className="space-y-3">
        {codeBlocks.map((cb, i) => (
          <CodeBlockView key={i} language={lang || cb.language} code={cb.code} />
        ))}
      </div>
    </BlockWrapper>
  );
}

// ═══ 18. Débat — POUR/CONTRE colonnes + verdict (pattern AtelierDebat L450-600) ═══

function DebatRenderer({ block, onAction }: BlockRendererProps) {
  const { compact } = useContext(BlockDisplayContext);
  const data = block.structured_data as {
    pour?: { point: string; force?: string }[];
    contre?: { point: string; force?: string }[];
    verdict?: string;
  } | undefined;
  return (
    <BlockWrapper block={block} onAction={onAction} label="Débat" labelColor="bg-red-100 text-red-700">
      {(data?.pour || data?.contre) ? (
        <div className="space-y-3">
          <div className={cn("grid gap-3", compact ? "grid-cols-1" : "grid-cols-2")}>
            {/* POUR */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 mb-2">
                <ThumbsUp className="h-3 w-3 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Pour</span>
              </div>
              {(data?.pour || []).map((p, i) => (
                <div key={i} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <p className="text-xs text-gray-700">{p.point}</p>
                  {p.force && <span className="text-[9px] text-emerald-600 font-medium mt-0.5 inline-block">{p.force}</span>}
                </div>
              ))}
            </div>
            {/* CONTRE */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 mb-2">
                <ThumbsDown className="h-3 w-3 text-red-600" />
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Contre</span>
              </div>
              {(data?.contre || []).map((c, i) => (
                <div key={i} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-xs text-gray-700">{c.point}</p>
                  {c.force && <span className="text-[9px] text-red-600 font-medium mt-0.5 inline-block">{c.force}</span>}
                </div>
              ))}
            </div>
          </div>
          {/* Verdict — Trophy moment (pattern AtelierDebat verdict) */}
          {data?.verdict && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex items-start gap-2">
                <Trophy className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Verdict</p>
                  <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{data.verdict}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBlockMarkdown(block.summary) }} />
      )}
    </BlockWrapper>
  );
}

// ═══ 19. Décision — Matrice pondérée + verdict (pattern AtelierDecision) ═══

function DecisionRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as {
    options?: { label: string; scores?: Record<string, number>; total?: number }[];
    criteres?: string[];
    verdict?: string;
  } | undefined;
  return (
    <BlockWrapper block={block} onAction={onAction} label="Décision" labelColor="bg-green-100 text-green-700">
      {data?.options ? (
        <div className="space-y-3">
          {/* Matrix table */}
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-xs font-bold text-left px-3 py-2 text-gray-600">Option</th>
                  {(data.criteres || []).map((c, i) => (
                    <th key={i} className="text-xs font-bold text-center px-2 py-2 text-gray-500">{c}</th>
                  ))}
                  <th className="text-xs font-bold text-center px-3 py-2 text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.options.map((opt, i) => {
                  const isWinner = data.options && opt.total === Math.max(...data.options.map(o => o.total || 0));
                  return (
                    <tr key={i} className={cn("border-t border-gray-100", isWinner && "bg-green-50")}>
                      <td className={cn("text-xs px-3 py-2", isWinner ? "font-bold text-green-700" : "text-gray-700")}>{opt.label}</td>
                      {(data.criteres || []).map((c, j) => (
                        <td key={j} className="text-xs text-center px-2 py-2 text-gray-600">
                          {opt.scores?.[c] ?? "—"}
                        </td>
                      ))}
                      <td className={cn("text-xs text-center px-3 py-2 font-bold", isWinner ? "text-green-700" : "text-gray-700")}>
                        {opt.total ?? "—"}
                        {isWinner && <Trophy className="inline h-3 w-3 ml-1 text-green-500" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data.verdict && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-bold text-green-700 uppercase tracking-wider">Décision recommandée</p>
                  <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{data.verdict}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBlockMarkdown(block.summary) }} />
      )}
    </BlockWrapper>
  );
}

// ═══ 20. Crise — Urgence rouge/orange (pattern AtelierCrise) ═══

function CriseRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as {
    actions?: { titre: string; urgence: string; responsable?: string }[];
    situation?: string;
  } | undefined;
  const URG: Record<string, { bg: string; text: string; border: string }> = {
    critique: { bg: "bg-red-50", text: "text-red-700", border: "border-red-300" },
    urgent: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300" },
    important: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  };
  return (
    <BlockWrapper block={block} onAction={onAction} label="Crise" labelColor="bg-red-100 text-red-700">
      <div className="space-y-3">
        {/* Situation banner */}
        {data?.situation && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-600 animate-pulse shrink-0" />
              <p className="text-sm font-bold text-red-700">{data.situation}</p>
            </div>
          </div>
        )}
        {/* Crisis actions */}
        {data?.actions ? (
          <div className="space-y-1.5">
            {data.actions.map((a, i) => {
              const u = URG[a.urgence] || URG.important;
              return (
                <div key={i} className={cn("rounded-xl border px-4 py-2.5 flex items-center gap-3 transition-all", u.bg, u.border)}>
                  <Zap className={cn("h-3.5 w-3.5 shrink-0", u.text, a.urgence === "critique" && "animate-bounce")} />
                  <div className="flex-1 min-w-0">
                    <span className={cn("text-xs font-bold", u.text)}>{a.titre}</span>
                  </div>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase", u.bg, u.text)}>{a.urgence}</span>
                  {a.responsable && <span className="text-xs text-gray-400 shrink-0">{a.responsable}</span>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {parseSummaryItems(block.summary).map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <Zap className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </BlockWrapper>
  );
}

// ═══ 21. Deep Search — Source cards avec progress bar live (pattern MagDeepSearch L2532-2685) ═══

function DeepSearchRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as {
    sources?: { title: string; detail: string; score?: number; url?: string; type?: string; crossRef?: string[] }[];
    status?: string;
    conclusion?: string;
    total_expected?: number;
  } | undefined;
  // S3A.1: Staggered reveal — sources appear one by one (600ms apart)
  const [revealedSources, setRevealedSources] = useState(0);
  useEffect(() => {
    if (!data?.sources) return;
    setRevealedSources(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    data.sources.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedSources(c => c + 1), 400 + i * 600));
    });
    return () => timers.forEach(clearTimeout);
  }, [data?.sources?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const sourceCount = data?.sources?.length || 0;
  const totalExpected = data?.total_expected || sourceCount;
  const isSearching = data?.status !== "complete" && revealedSources < sourceCount;
  const avgScore = sourceCount > 0 ? Math.round((data?.sources || []).reduce((sum, s) => sum + (s.score || 0), 0) / sourceCount) : 0;

  // Circular score component
  const CircularScore = ({ score }: { score: number }) => {
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? "text-green-500" : score >= 50 ? "text-amber-500" : "text-red-500";
    const strokeColor = score >= 80 ? "stroke-green-500" : score >= 50 ? "stroke-amber-500" : "stroke-red-500";
    return (
      <div className="relative w-10 h-10 shrink-0">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="3" />
          <circle cx="18" cy="18" r={radius} fill="none" className={strokeColor} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        </svg>
        <span className={cn("absolute inset-0 flex items-center justify-center text-[9px] font-bold", color)}>
          {score}
        </span>
      </div>
    );
  };

  // Source type icon
  const sourceTypeIcon = (type?: string) => {
    if (type === "academic") return "bg-violet-100 text-violet-600";
    if (type === "industry") return "bg-blue-100 text-blue-600";
    if (type === "news") return "bg-amber-100 text-amber-600";
    return "bg-cyan-100 text-cyan-600";
  };

  return (
    <BlockWrapper block={block} onAction={onAction} label="Deep Search" labelColor="bg-cyan-100 text-cyan-700">
      {/* Status + progress bar — pattern MagDeepSearch */}
      <div className="rounded-lg border border-cyan-200 bg-cyan-50/30 p-2.5 mb-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold",
            data?.status === "complete" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          )}>
            {data?.status === "complete" ? <CheckCircle2 className="h-3 w-3" /> : <Activity className="h-3 w-3 animate-pulse" />}
            {data?.status === "complete" ? "Recherche terminee" : "Recherche en cours..."}
          </div>
          <span className="text-[10px] text-gray-500 ml-auto">{revealedSources}/{totalExpected} sources</span>
          {data?.status === "complete" && avgScore > 0 && (
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full",
              avgScore >= 70 ? "bg-green-100 text-green-700" : avgScore >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
            )}>Score moyen: {avgScore}%</span>
          )}
        </div>
        {/* Live progress bar */}
        <div className="h-1.5 bg-cyan-100 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-500",
            data?.status === "complete" ? "bg-green-500" : "bg-cyan-500"
          )} style={{ width: `${totalExpected > 0 ? (revealedSources / totalExpected) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Source cards with ranking */}
      {data?.sources ? (
        <div className="space-y-2">
          {data.sources.map((source, i) => (
            <div key={i} className={cn(
              "rounded-xl border-2 bg-white overflow-hidden hover:shadow-md",
              "transition-all duration-500",
              source.score !== undefined && source.score >= 80 ? "border-green-200" :
              source.score !== undefined && source.score >= 50 ? "border-gray-200" : "border-gray-200",
              i < revealedSources ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )} style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Ranking number */}
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", sourceTypeIcon(source.type))}>
                  <span className="text-xs font-bold">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-gray-900 truncate">{source.title}</p>
                    {source.url && (
                      <ExternalLink className="h-2.5 w-2.5 text-gray-300 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{source.detail}</p>
                  {/* Cross-reference badges — pattern MagDeepSearch */}
                  {source.crossRef && source.crossRef.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {source.crossRef.map((ref, j) => (
                        <span key={j} className="text-[8px] px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-medium">{ref}</span>
                      ))}
                    </div>
                  )}
                </div>
                {source.score !== undefined && <CircularScore score={source.score} />}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {parseSummaryItems(block.summary).map((item, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <div className="flex items-start gap-2">
                <Globe className="h-3.5 w-3.5 text-cyan-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed flex-1">{item}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Conclusion — enhanced with score summary */}
      {data?.conclusion && (
        <div className="rounded-xl border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-white p-3 mt-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider mb-1">Synthese de la recherche</p>
              <p className="text-sm text-gray-700 leading-relaxed">{data.conclusion}</p>
            </div>
          </div>
        </div>
      )}
    </BlockWrapper>
  );
}

// ═══ 22. Etat des Lieux — Multi-agent diagnostic rapide (Sprint 3A.2) ═══

function EtatDesLieuxRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as {
    perspectives?: { bot: string; analysis: string; score?: number }[];
    temperature?: number;
    temperature_label?: string;
  } | undefined;
  // Staggered reveal for perspectives
  const [revealedPerspectives, setRevealedPerspectives] = useState(0);
  useEffect(() => {
    if (!data?.perspectives) return;
    setRevealedPerspectives(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    data.perspectives.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedPerspectives(c => c + 1), 300 + i * 400));
    });
    return () => timers.forEach(clearTimeout);
  }, [data?.perspectives?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const tempColor = (data?.temperature ?? 50) >= 70 ? "text-red-600" :
    (data?.temperature ?? 50) >= 40 ? "text-amber-600" : "text-emerald-600";
  const tempBg = (data?.temperature ?? 50) >= 70 ? "bg-red-500" :
    (data?.temperature ?? 50) >= 40 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <BlockWrapper block={block} onAction={onAction} label="Etat des lieux" labelColor="bg-sky-100 text-sky-700">
      {/* Temperature gauge — pattern MagDiagnostic score card */}
      {data?.temperature !== undefined && (
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden mb-3">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100",
            (data.temperature ?? 50) >= 70 ? "bg-red-50" : (data.temperature ?? 50) >= 40 ? "bg-amber-50" : "bg-emerald-50"
          )}>
            <Activity className={cn("h-4 w-4", tempColor)} />
            <span className="text-sm font-bold text-gray-900">Temperature de la situation</span>
            <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full ml-auto text-white",
              (data.temperature ?? 50) >= 70 ? "bg-red-600" : (data.temperature ?? 50) >= 40 ? "bg-amber-500" : "bg-emerald-500"
            )}>{data.temperature}/100</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", tempBg)} style={{ width: `${data.temperature}%`, transition: "width 1s ease-out" }} />
            </div>
            {data.temperature_label && (
              <p className={cn("text-xs font-medium", tempColor)}>{data.temperature_label}</p>
            )}
          </div>
        </div>
      )}
      {/* Agent perspectives — pattern ReflexionChat multi-bot analysis */}
      {data?.perspectives ? (
        <div className="space-y-2">
          {data.perspectives.map((p, i) => {
            const isRevealed = i < revealedPerspectives;
            return (
              <div key={i} className={cn(
                "flex items-start gap-3 rounded-xl border-2 overflow-hidden transition-all duration-500",
                p.score !== undefined && p.score < 4 ? "border-red-300 bg-gradient-to-r from-red-50 to-white" :
                p.score !== undefined && p.score < 7 ? "border-amber-300 bg-gradient-to-r from-amber-50 to-white" :
                "border-emerald-300 bg-gradient-to-r from-emerald-50 to-white",
                isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              )} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className={cn("px-3 py-3 flex flex-col items-center gap-1 shrink-0",
                  p.score !== undefined && p.score < 4 ? "bg-red-100/60" :
                  p.score !== undefined && p.score < 7 ? "bg-amber-100/60" :
                  "bg-emerald-100/60"
                )}>
                  <BotAvatar code={p.bot} size="sm" />
                  {p.score !== undefined && (
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold",
                      p.score >= 7 ? "bg-emerald-500 text-white" :
                      p.score >= 4 ? "bg-amber-500 text-white" :
                      "bg-red-500 text-white"
                    )}>{p.score}/10</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-2.5 pr-3">
                  <span className="text-xs font-bold text-gray-800">{BOT_NAME[p.bot] || p.bot}</span>
                  <p className="text-sm text-gray-700 leading-relaxed mt-0.5">{p.analysis}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {parseSummaryItems(block.summary).map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-sky-500 shrink-0 mt-0.5" />
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      )}
    </BlockWrapper>
  );
}

// ═══ Helpers: Parse summary text into structured items/sections ═══

function parseSummaryItems(text: string): string[] {
  if (!text) return [];
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const items: string[] = [];
  for (const line of lines) {
    const clean = line.replace(/^\s*(?:\d+[.)]\s*|[-*•]\s*|→\s*)/, "").trim();
    if (clean.length > 15) items.push(clean);
  }
  return items.length > 0 ? items : [text];
}

function parseSummarySections(text: string): { title: string; body: string }[] {
  if (!text) return [];
  const sections: { title: string; body: string }[] = [];
  const lines = text.split("\n");
  let current: { title: string; body: string } | null = null;
  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/) || line.match(/^\*\*(.+?)\*\*/);
    const numberedMatch = line.match(/^\s*\d+[.)]\s+(.+)/);
    if (headingMatch || numberedMatch) {
      if (current) sections.push(current);
      current = { title: (headingMatch?.[1] || numberedMatch?.[1] || "").trim(), body: "" };
    } else if (current) {
      current.body += (current.body ? "\n" : "") + line;
    } else {
      current = { title: "", body: line };
    }
  }
  if (current) sections.push(current);
  return sections.length > 0 ? sections : [{ title: "", body: text }];
}

// ═══ CatchingUpRenderer — Skeleton pulse while bot loads ═══

function CatchingUpRenderer({ block }: BlockRendererProps) {
  const [appeared, setAppeared] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAppeared(true), 80);
    return () => clearTimeout(t);
  }, []);
  const botName = BOT_NAME[block.source] || block.source;
  const badgeColors = BOT_BADGE_COLORS[block.source] || { bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <div className={cn(
      "rounded-xl border-2 border-dashed overflow-hidden shadow-sm transition-all duration-300",
      "border-gray-300 bg-gradient-to-b from-gray-50/80 to-white",
      appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
    )}>
      <div className={cn("px-3 py-2.5 flex items-center gap-2.5", badgeColors.bg)}>
        <BotAvatar code={block.source} size="md" />
        <div className="flex-1 min-w-0">
          <span className={cn("text-xs font-bold", badgeColors.text)}>{botName}</span>
          <span className="text-[10px] text-gray-500 ml-1.5">prend connaissance...</span>
        </div>
        <Loader2 className="h-4 w-4 text-gray-400 animate-spin shrink-0" />
      </div>
      <div className="px-3 py-3 space-y-2.5">
        <div className="h-4 bg-gray-200/60 rounded-full w-4/5 animate-pulse" />
        <div className="h-3 bg-gray-200/40 rounded-full w-3/5 animate-pulse" style={{ animationDelay: "150ms" }} />
        <div className="h-3 bg-gray-200/30 rounded-full w-2/5 animate-pulse" style={{ animationDelay: "300ms" }} />
        <p className="text-[10px] text-gray-400 italic mt-1">Analyse de la discussion en cours...</p>
      </div>
    </div>
  );
}

// ═══ Registre central ═══

const BLOCK_RENDERERS: Record<WorkspaceBlockType, React.FC<BlockRendererProps>> = {
  diagnostic: DiagnosticRenderer,
  brainstorm: BrainstormRenderer,
  scamper: ScamperRenderer,
  "5pourquoi": CinqPourquoiRenderer,
  plan_action: PlanActionRenderer,
  budget: BudgetRenderer,
  timeline: TimelineRenderer,
  metriques: MetriquesRenderer,
  projets: ProjetsRenderer,
  taches: TachesRenderer,
  recommandations: RecommandationsRenderer,
  risques: RisquesRenderer,
  benchmark: BenchmarkRenderer,
  challenge: ChallengeRenderer,
  synthese: SyntheseRenderer,
  rapport: RapportRenderer,
  libre: LibreRenderer,
  debat: DebatRenderer,
  decision: DecisionRenderer,
  crise: CriseRenderer,
  deep_search: DeepSearchRenderer,
  etat_des_lieux: EtatDesLieuxRenderer,
  // S4.2 — DocForge types route to existing renderers
  docforge_section: RapportRenderer,
  docforge_code: CodeRenderer,
  docforge_tableur: BudgetRenderer,
  action_result: LibreRenderer,
  catching_up: CatchingUpRenderer,
};

// ═══ Default action suggestions per bot role ═══
const DEFAULT_ACTIONS: Record<string, ActionSuggestion[]> = {
  CFOB: [
    { label: "Ajuster budget", prompt: "Propose un ajustement budgetaire base sur cette analyse.", target_bot: "CFOB" },
    { label: "Planifier revision", prompt: "Planifie une revision financiere de ce volet.", target_bot: "CFOB" },
  ],
  CTOB: [
    { label: "Creer plan technique", prompt: "Cree un plan technique detaille pour cette recommandation.", target_bot: "CTOB" },
    { label: "Evaluer faisabilite", prompt: "Evalue la faisabilite technique de cette approche.", target_bot: "CTOB" },
  ],
  CMOB: [
    { label: "Lancer campagne", prompt: "Propose un plan de campagne marketing base sur cette analyse.", target_bot: "CMOB" },
    { label: "Preparer brief", prompt: "Prepare un brief creatif pour cette initiative.", target_bot: "CMOB" },
  ],
  CSOB: [
    { label: "Plan de vente", prompt: "Developpe un plan de vente actionnable.", target_bot: "CSOB" },
    { label: "Analyse concurrence", prompt: "Fais une analyse concurrentielle approfondie.", target_bot: "CSOB" },
  ],
  COOB: [
    { label: "Optimiser processus", prompt: "Propose une optimisation des processus impliques.", target_bot: "COOB" },
    { label: "Plan execution", prompt: "Cree un plan d'execution operationnel.", target_bot: "COOB" },
  ],
  CEOB: [
    { label: "Decision strategique", prompt: "Formule une recommandation de decision strategique.", target_bot: "CEOB" },
    { label: "Planifier rencontre", prompt: "Propose un ordre du jour pour une rencontre sur ce sujet.", target_bot: "CEOB" },
  ],
};

function getActionsForBlock(block: WorkspaceBlock): ActionSuggestion[] {
  if (block.is_action_result) return []; // Anti-loop: no actions on action results
  if (block.action_suggestions && block.action_suggestions.length > 0) return block.action_suggestions;
  return DEFAULT_ACTIONS[block.source] || [
    { label: "Approfondir l'analyse", prompt: "Approfondis cette analyse avec plus de details.", target_bot: block.source },
  ];
}

// ═══ ExpertBlockWrapper — style simulation diagnostic (rounded-xl white card + badge pill) ═══
// Pattern: FocusReflexionView.tsx StepDiagnostic. Blocks OPEN by default, manual close only.

const BOT_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  CEOB: { bg: "bg-blue-100", text: "text-blue-700" }, BCO: { bg: "bg-blue-100", text: "text-blue-700" },
  CTOB: { bg: "bg-violet-100", text: "text-violet-700" }, BCT: { bg: "bg-violet-100", text: "text-violet-700" },
  CFOB: { bg: "bg-emerald-100", text: "text-emerald-700" }, BCF: { bg: "bg-emerald-100", text: "text-emerald-700" },
  CMOB: { bg: "bg-pink-100", text: "text-pink-700" }, BCM: { bg: "bg-pink-100", text: "text-pink-700" },
  CSOB: { bg: "bg-red-100", text: "text-red-700" }, BCS: { bg: "bg-red-100", text: "text-red-700" },
  COOB: { bg: "bg-orange-100", text: "text-orange-700" }, BOO: { bg: "bg-orange-100", text: "text-orange-700" },
  CPOB: { bg: "bg-slate-100", text: "text-slate-700" },
  CHROB: { bg: "bg-teal-100", text: "text-teal-700" },
  CINOB: { bg: "bg-rose-100", text: "text-rose-700" },
  CROB: { bg: "bg-amber-100", text: "text-amber-700" },
  CLOB: { bg: "bg-indigo-100", text: "text-indigo-700" },
  CISOB: { bg: "bg-zinc-100", text: "text-zinc-700" },
};

const BOT_ROLE: Record<string, string> = {
  CEOB: "CEO", BCO: "CEO",
  CTOB: "CTO", BCT: "CTO",
  CFOB: "CFO", BCF: "CFO",
  CMOB: "CMO", BCM: "CMO",
  CSOB: "CSO", BCS: "CSO",
  COOB: "COO", BOO: "COO",
  CPOB: "CPO",
  CHROB: "CHRO",
  CINOB: "CINO",
  CROB: "CRO",
  CLOB: "CLO",
  CISOB: "CISO",
};

function ExpertBlockWrapper({ block, onAction, children }: BlockRendererProps & { children: React.ReactNode }) {
  const { primaryBotCode } = useContext(BlockDisplayContext);
  const isPrimaryBot = !!(primaryBotCode && block.source === primaryBotCode);
  const [appeared, setAppeared] = useState(false);
  const [expanded, setExpanded] = useState(true); // Blocks start expanded — no auto-collapse
  const [correction, setCorrection] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setAppeared(true), 80);
    return () => clearTimeout(t);
  }, []);

  const botName = BOT_NAME[block.source] || block.source;
  const botRole = BOT_ROLE[block.source] || "Expert";

  // Confidence-based coloring (pattern DiagnosticRenderer scoreStyle)
  const pct = Math.round(block.confidence * 100);
  const confStyle = pct < 40
    ? { border: "border-orange-400", bg: "bg-gradient-to-b from-orange-50 to-white", hdr: "bg-orange-100/60", badge: "bg-orange-600 text-white", bar: "bg-orange-500" }
    : pct < 70
    ? { border: "border-amber-300", bg: "bg-gradient-to-b from-amber-50 to-white", hdr: "bg-amber-100/60", badge: "bg-amber-500 text-white", bar: "bg-amber-500" }
    : { border: "border-emerald-300", bg: "bg-gradient-to-b from-emerald-50 to-white", hdr: "bg-emerald-100/60", badge: "bg-emerald-500 text-white", bar: "bg-emerald-500" };

  // Compact summary for collapsed state
  const compactSummary = (block.summary || "").replace(/\n/g, " ").slice(0, 100) + ((block.summary || "").length > 100 ? "..." : "");

  const handleCorrection = () => {
    if (!correction.trim()) return;
    onAction("correct", block.id + "||" + correction.trim());
    setCorrection("");
  };

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden border-2 shadow-sm transition-all duration-300 hover:shadow-md",
        confStyle.border, confStyle.bg,
        appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
      )}
    >
      {/* Header — pattern DiagnosticRenderer (colored header + score badge) */}
      <div
        className={cn("px-3 py-2.5 flex items-center gap-2.5 cursor-pointer select-none", confStyle.hdr)}
        onClick={() => setExpanded(!expanded)}
      >
        <BotAvatar code={block.source} size="md" />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-gray-900">{botName}</span>
          <span className="text-[10px] text-gray-500 ml-1.5">{botRole}</span>
        </div>
        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold", confStyle.badge)}>
          {pct}%
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform duration-300 shrink-0", expanded && "rotate-180")} />
      </div>

      {/* Body */}
      <div className="px-3 py-2.5 space-y-2">
        {/* Title */}
        <h3 className="text-[11px] font-bold text-gray-900">{block.title}</h3>

        {/* Confidence bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", confStyle.bar)} style={{ width: `${pct}%`, transition: "width 0.8s ease-out" }} />
        </div>

        {/* Collapsed summary */}
        {!expanded && (
          <p className="text-[10px] text-gray-600 font-medium">{compactSummary}</p>
        )}

        {/* Expanded content — OUVERT par defaut */}
        {expanded && (
          <>
            <div className="text-[11px] text-gray-700 leading-relaxed">
              {children}
            </div>

            {/* Input de correction + actions — SEULEMENT pour bots secondaires (pas le bot primaire) */}
            {!block.is_action_result && !isPrimaryBot && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Corriger ou preciser..."
                    value={correction}
                    onChange={(e) => setCorrection(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCorrection(); }}
                    className="flex-1 text-[11px] border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-200 bg-white placeholder:text-gray-300"
                  />
                  {correction.trim() && (
                    <button
                      onClick={handleCorrection}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-500 text-white text-[10px] font-bold hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                      Corriger
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Expert actions: Relancer + Approfondir + Challenger — SEULEMENT bots secondaires */}
            {!block.is_action_result && !isPrimaryBot && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onAction("rework", block.id); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer border-violet-200 text-violet-700 hover:bg-violet-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Relancer
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAction("deepen", block.id); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Search className="h-3.5 w-3.5" /> Approfondir
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAction("challenge", block.id); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <Swords className="h-3.5 w-3.5" /> Challenger
                </button>
              </div>
            )}

            {/* Action buttons contextuels — SEULEMENT bots secondaires */}
            {!block.is_action_result && !isPrimaryBot && (() => {
              const actions = getActionsForBlock(block);
              if (actions.length === 0) return null;
              return (
                <div className="mt-2 flex flex-wrap gap-2">
                  {actions.map((a, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); onAction("execute_action", JSON.stringify(a)); }}
                      className="px-3 py-1.5 rounded-lg border border-sky-200 text-sky-700 text-xs font-bold bg-sky-50/50 hover:bg-sky-100 transition-colors cursor-pointer"
                    >
                      ⚡ {a.label}
                    </button>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

export function BlockRenderer({ block, onAction, animated }: BlockRendererProps) {
  // Catching-up skeleton: render directly without ExpertBlockWrapper
  if (block.is_catching_up || block.type === "catching_up") {
    return (
      <AnimatedBlockEntry block={block} animated={animated}>
        <CatchingUpRenderer block={block} onAction={onAction} />
      </AnimatedBlockEntry>
    );
  }

  const Renderer = BLOCK_RENDERERS[block.type] || LibreRenderer;

  // Expert blocks (sourceType=chat) get enhanced ExpertBlockWrapper with large avatar/fonts
  if (block.sourceType === "chat" && block.source) {
    return (
      <AnimatedBlockEntry block={block} animated={animated}>
        <ExpertBlockWrapper block={block} onAction={onAction}>
          <div
            className="text-sm leading-relaxed text-gray-700 prose-sm"
            dangerouslySetInnerHTML={{ __html: formatBlockMarkdown(block.summary) }}
          />
        </ExpertBlockWrapper>
      </AnimatedBlockEntry>
    );
  }

  return (
    <AnimatedBlockEntry block={block} animated={animated}>
      <Renderer block={block} onAction={onAction} />
    </AnimatedBlockEntry>
  );
}

export const BLOCK_TYPE_LABELS: Record<WorkspaceBlockType, string> = {
  diagnostic: "Diagnostic",
  brainstorm: "Brainstorm",
  scamper: "SCAMPER",
  "5pourquoi": "5 Pourquoi",
  plan_action: "Plan d'action",
  budget: "Budget",
  timeline: "Timeline",
  metriques: "Métriques",
  projets: "Projets",
  taches: "Tâches",
  recommandations: "Recommandations",
  risques: "Risques",
  benchmark: "Benchmark",
  challenge: "Challenge",
  synthese: "Synthèse",
  rapport: "Rapport",
  libre: "Note",
  debat: "Débat",
  decision: "Décision",
  crise: "Crise",
  deep_search: "Deep Search",
  etat_des_lieux: "Etat des lieux",
  docforge_section: "Section",
  docforge_code: "Code",
  docforge_tableur: "Tableur",
  action_result: "Action",
  catching_up: "En cours...",
};

// ═══ Sprint 2A Phase 6A: Skeleton loading block (pattern WorkspaceSection.tsx L104-109) ═══

export function SkeletonBlock({ label }: { label?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-4 w-16 bg-gray-100 rounded-full" />
        <div className="h-3 w-32 bg-gray-100 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
      </div>
      {label && (
        <p className="mt-3 text-xs text-gray-400 text-center">{label}</p>
      )}
    </div>
  );
}
