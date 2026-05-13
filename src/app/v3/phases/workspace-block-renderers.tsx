/**
 * workspace-block-renderers.tsx — Registre de composants de rendu par type de block
 *
 * Chaque renderer reçoit un WorkspaceBlock + callback d'action.
 * Patterns portés depuis les simulations (FocusDiscussionView, LiveReflexionView, etc.)
 */

import { useState, useEffect } from "react";
import {
  Pin, Search, Swords, Pencil, RotateCcw, Layers,
  CheckCircle2, AlertTriangle, TrendingUp, Lightbulb,
  Clock, Activity, FileText,
  Check, X, Trash2,
  ThumbsUp, ThumbsDown, Trophy, Zap, Shield,
  Target, Globe, ExternalLink,
  MessageCircle, Mic, Video,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { formatCristallise } from "./content-formatters";
import { BotBadgeFull } from "../../v2/zones/center/shared/BotBadgeFull";
import type { WorkspaceBlock, WorkspaceBlockType } from "../core/types";

// ═══ Bot Accent Borders (B.9 — pattern BOT_COLORS from sim-data.ts) ═══

const BOT_ACCENT_BORDERS: Record<string, string> = {
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

// ═══ Block Action Types ═══

export type BlockActionType = "pin" | "deepen" | "challenge" | "edit" | "rework" | "merge" | "delete";

interface BlockRendererProps {
  block: WorkspaceBlock;
  onAction: (action: BlockActionType, blockId: string, payload?: string) => void;
}

// ═══ Shared: Block Actions Bar ═══

function BlockActions({ block, onAction }: BlockRendererProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(block.summary);

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
      </div>
    </div>
  );
}

// ═══ Shared: Block Wrapper ═══

function BlockWrapper({ block, onAction, label, labelColor, children }: BlockRendererProps & { label: string; labelColor: string; children: React.ReactNode }) {
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
        {/* S2.2.3: Confidence badge */}
        <span className={cn(
          "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
          block.confidence >= 0.8 ? "bg-emerald-100 text-emerald-700" :
          block.confidence >= 0.5 ? "bg-amber-100 text-amber-700" :
          "bg-red-100 text-red-700"
        )}>
          {Math.round(block.confidence * 100)}%
        </span>
        <h4 className="text-xs font-bold text-gray-900 flex-1 truncate">{block.title}</h4>
        {/* Sprint 2A: Hover "Modifier" flottant (pattern WorkspaceSection.tsx L142-156) */}
        <button
          onClick={() => onAction("edit", block.id)}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-medium",
            "border border-blue-200 bg-blue-50 text-blue-600 cursor-pointer",
            "transition-opacity duration-150",
            isHoverEdit ? "opacity-100" : "opacity-0"
          )}
        >
          <Pencil className="h-2.5 w-2.5" /> Modifier
        </button>
        <span className="text-[9px] text-gray-300">{new Date(block.timestamp).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      {children}
      <BlockActions block={block} onAction={onAction} />
    </div>
  );
}

// ═══ 1. Diagnostic — KPI cards + points de friction (pattern FocusReflexionView StepDiagnostic) ═══

function DiagnosticRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { axes?: { label: string; score: number; color: string }[]; conclusion?: string; frictions?: string[] } | undefined;
  const SEV: Record<string, { bg: string; text: string; border: string }> = {
    green: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
    amber: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
    red:   { bg: "bg-red-100",   text: "text-red-700",   border: "border-red-200" },
  };
  return (
    <BlockWrapper block={block} onAction={onAction} label="Diagnostic" labelColor="bg-orange-100 text-orange-700">
      {/* KPI Grid — pattern StatCard FocusDiscussionView L887-899 */}
      {data?.axes ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Indicateurs cles</h4>
            <div className="grid grid-cols-2 gap-3">
              {data.axes.map((ax, i) => {
                const s = SEV[ax.color] || SEV.amber;
                return (
                  <div key={i} className={cn("rounded-lg p-3", s.bg.replace("100", "50"))}>
                    <p className="text-xs text-gray-400 mb-1">{ax.label}</p>
                    <div className="flex items-center gap-2">
                      <p className={cn("text-xs font-bold", s.text)}>{ax.score}/10</p>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", s.bg)} style={{ width: `${ax.score * 10}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Points de friction — pattern FocusReflexionView StepDiagnostic */}
          {data.frictions && data.frictions.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Points de friction</h4>
              <div className="space-y-2">
                {data.frictions.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
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
      {data?.conclusion && (
        <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-3 mt-2">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-orange-600 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed italic">{data.conclusion}</p>
          </div>
        </div>
      )}
    </BlockWrapper>
  );
}

// ═══ 2. Brainstorm — Hover-cards avec pin (pattern SimPhaseReflexion capture buttons) ═══

function BrainstormRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { items?: { id: number; title: string; detail: string; impact?: string; effort?: string }[] } | undefined;
  const IDEA_COLORS = ["border-l-amber-400", "border-l-blue-400", "border-l-green-400", "border-l-purple-400", "border-l-pink-400", "border-l-cyan-400"];
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <BlockWrapper block={block} onAction={onAction} label="Brainstorm" labelColor="bg-amber-100 text-amber-700">
      {data?.items ? (
        <div className="grid grid-cols-2 gap-2">
          {data.items.map((item) => (
            <div key={item.id}
              className={cn("group/idea rounded-lg border border-gray-200 border-l-[3px] bg-white px-3 py-2.5 hover:shadow-sm hover:bg-amber-50/30 transition-all cursor-pointer", IDEA_COLORS[(item.id - 1) % IDEA_COLORS.length])}
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="h-3 w-3 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.detail}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onAction("pin", block.id); }}
                  className="opacity-0 group-hover/idea:opacity-100 p-1 rounded hover:bg-amber-100 transition-all cursor-pointer shrink-0" title="Epingler">
                  <Pin className="h-3 w-3 text-amber-500" />
                </button>
              </div>
              {/* Expanded: Impact/Effort + Voting (pattern AtelierBrainstorm L1480-1527) */}
              {expanded === item.id && (
                <div className="mt-2 pt-2 border-t border-gray-100 space-y-2">
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
        <div className="grid grid-cols-2 gap-2">
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
        <div className="grid grid-cols-2 gap-2">
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
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
      )}
    </BlockWrapper>
  );
}

// ═══ 4. 5 Pourquoi — Arbre hiérarchique indenté ═══

function CinqPourquoiRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { levels?: { question: string; answer: string }[]; rootCause?: string } | undefined;
  // Progressive color depth (pattern SimPhaseReflexion L652-665)
  const DEPTH_COLORS = [
    { dot: "bg-orange-300", text: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200", line: "from-orange-200 to-orange-300" },
    { dot: "bg-orange-400", text: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", line: "from-orange-300 to-amber-400" },
    { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", line: "from-amber-400 to-red-300" },
    { dot: "bg-red-400", text: "text-red-600", bg: "bg-red-50", border: "border-red-200", line: "from-red-300 to-red-500" },
    { dot: "bg-red-600", text: "text-red-700", bg: "bg-red-50", border: "border-red-300", line: "from-red-500 to-red-600" },
  ];
  // Auto-reveal stagger state
  const [revealedCount, setRevealedCount] = useState(0);
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
          {data.levels.map((level, i) => {
            const depth = DEPTH_COLORS[i] || DEPTH_COLORS[4];
            const isLast = i === data.levels!.length - 1;
            const isRevealed = i < revealedCount;
            const isActive = isActiveLevel(i);
            return (
              <div
                key={i}
                className={cn("flex gap-2 transition-all duration-700", isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}
                style={{ paddingLeft: `${i * 20}px`, transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex flex-col items-center shrink-0 pt-1">
                  <div className={cn(
                    "w-4 h-4 rounded-full transition-all",
                    depth.dot,
                    isLast && "ring-2 ring-red-300 ring-offset-1",
                    isActive && "animate-pulse ring-2 ring-orange-300 ring-offset-1"
                  )} />
                  {!isLast && <div className={cn("w-0.5 flex-1 mt-1 rounded-full bg-gradient-to-b", depth.line)} />}
                </div>
                <div className={cn("pb-3 flex-1 min-w-0 rounded-lg px-3 py-1.5 -ml-1 transition-colors", isLast ? depth.bg : "", isActive && "bg-orange-50/50")}>
                  <p className={cn("text-xs font-bold", depth.text)}>Pourquoi {i + 1}?</p>
                  <p className="text-sm text-gray-700">{level.question}</p>
                  <p className="text-xs text-gray-500 mt-0.5">→ {level.answer}</p>
                </div>
              </div>
            );
          })}
          {/* Root cause highlight — Target icon, prominent red */}
          {data.rootCause && (
            <div
              className={cn("mt-3 rounded-xl border-2 border-red-300 bg-red-50 p-4 transition-all duration-700", revealedCount >= (data.levels?.length || 0) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}
              style={{ marginLeft: `${((data.levels?.length || 1) - 1) * 20}px`, transitionDelay: `${(data.levels?.length || 0) * 100}ms` }}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <Target className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Cause racine identifiee</p>
                  <p className="text-sm text-gray-800 mt-1 leading-relaxed font-medium">{data.rootCause}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
      )}
    </BlockWrapper>
  );
}

// ═══ 5. Plan d'action — Checklist ═══

function PlanActionRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { actions?: { titre: string; assignee?: string; priorite?: string; done: boolean }[] } | undefined;
  const PRIO: Record<string, string> = { haute: "bg-red-100 text-red-700", normale: "bg-gray-100 text-gray-600", basse: "bg-green-100 text-green-700" };
  return (
    <BlockWrapper block={block} onAction={onAction} label="Plan d'action" labelColor="bg-green-100 text-green-700">
      {data?.actions ? (
        <div className="space-y-1.5">
          {data.actions.map((a, i) => (
            <div key={i} className={cn("rounded-xl border bg-white px-4 py-2.5 flex items-center gap-3", a.done ? "border-green-200 bg-green-50/30" : "border-gray-200")}>
              <CheckCircle2 className={cn("h-4 w-4 shrink-0", a.done ? "text-green-500" : "text-gray-300")} />
              <div className="flex-1 min-w-0">
                <span className={cn("text-xs font-medium", a.done ? "text-gray-400 line-through" : "text-gray-900")}>{a.titre}</span>
              </div>
              {a.priorite && <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", PRIO[a.priorite] || PRIO.normale)}>{a.priorite}</span>}
              {a.assignee && <span className="text-xs text-gray-400 shrink-0">{a.assignee}</span>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
      )}
    </BlockWrapper>
  );
}

// ═══ 10. Tâches — Checklist ═══

function TachesRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { taches?: { titre: string; assignee?: string; done: boolean }[] } | undefined;
  const taches = data?.taches || [];
  const doneCount = taches.filter(t => t.done).length;
  return (
    <BlockWrapper block={block} onAction={onAction} label="Tâches" labelColor="bg-green-100 text-green-700">
      {taches.length > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
            <span className="font-medium">{doneCount}/{taches.length} complétées</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full" style={{ width: `${(doneCount / taches.length) * 100}%` }} />
            </div>
          </div>
          {taches.map((t, i) => (
            <div key={i} className={cn("rounded-xl border bg-white px-4 py-2.5 flex items-center gap-3", t.done ? "border-green-200 bg-green-50/30" : "border-gray-200")}>
              <CheckCircle2 className={cn("h-4 w-4 shrink-0", t.done ? "text-green-500" : "text-gray-300")} />
              <div className="flex-1 min-w-0">
                <span className={cn("text-xs font-medium", t.done ? "text-gray-400 line-through" : "text-gray-900")}>{t.titre}</span>
              </div>
              {t.assignee && <span className="text-xs text-gray-400 shrink-0">{t.assignee}</span>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
  const data = block.structured_data as { arguments?: { point: string; severity?: string }[] } | undefined;
  return (
    <BlockWrapper block={block} onAction={onAction} label="Challenge" labelColor="bg-amber-100 text-amber-700">
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
                <div key={i} className="flex items-start gap-2">
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

// ═══ 16. Rapport — Document multi-sections (pattern FocusReflexionView Pre-rapport) ═══

function RapportRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { sections?: { title: string; content: string }[] } | undefined;
  return (
    <BlockWrapper block={block} onAction={onAction} label="Rapport" labelColor="bg-gray-200 text-gray-700">
      {data?.sections ? (
        <div className="space-y-3">
          {data.sections.map((s, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">{i + 1}</span>
                <h4 className="text-xs font-bold text-gray-900">{s.title}</h4>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {parseSummarySections(block.summary).map((s, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
              {s.title && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">{i + 1}</span>
                  <h4 className="text-xs font-bold text-gray-900">{s.title}</h4>
                </div>
              )}
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      )}
    </BlockWrapper>
  );
}

// ═══ 17. Libre — Texte avec sections parsées (pattern parseContentSections) ═══

function LibreRenderer({ block, onAction }: BlockRendererProps) {
  const items = parseSummaryItems(block.summary);
  const imageUrl = block.structured_data?.image_url as string | undefined;
  const isVision = imageUrl || block.structured_data?.vision;
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
      {items.length > 1 ? (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold text-gray-400 mt-0.5 w-4 shrink-0">{i + 1}.</span>
                <p className="text-sm text-gray-700 leading-relaxed flex-1">{item}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</div>
      )}
    </BlockWrapper>
  );
}

// ═══ 18. Débat — POUR/CONTRE colonnes + verdict (pattern AtelierDebat L450-600) ═══

function DebatRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as {
    pour?: { point: string; force?: string }[];
    contre?: { point: string; force?: string }[];
    verdict?: string;
  } | undefined;
  return (
    <BlockWrapper block={block} onAction={onAction} label="Débat" labelColor="bg-red-100 text-red-700">
      {(data?.pour || data?.contre) ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
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
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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

// ═══ 21. Deep Search — Source cards avec score circulaire (pattern FocusReflexionView DeepSearch) ═══

function DeepSearchRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as {
    sources?: { title: string; detail: string; score?: number; url?: string }[];
    status?: string;
    conclusion?: string;
  } | undefined;

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

  return (
    <BlockWrapper block={block} onAction={onAction} label="Deep Search" labelColor="bg-cyan-100 text-cyan-700">
      {/* Status badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold",
          data?.status === "complete" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
        )}>
          {data?.status === "complete" ? <CheckCircle2 className="h-3 w-3" /> : <Activity className="h-3 w-3 animate-pulse" />}
          {data?.status === "complete" ? "Recherche terminee" : "Recherche en cours..."}
        </div>
      </div>
      {/* Source cards */}
      {data?.sources ? (
        <div className="space-y-2">
          {data.sources.map((source, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-cyan-50/30 hover:border-cyan-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
                  <Globe className="h-3.5 w-3.5 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-900 truncate">{source.title}</p>
                    {source.url && (
                      <ExternalLink className="h-2.5 w-2.5 text-gray-300 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{source.detail}</p>
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
      {/* Conclusion */}
      {data?.conclusion && (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-3 mt-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-600 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed italic">{data.conclusion}</p>
          </div>
        </div>
      )}
    </BlockWrapper>
  );
}

// ═══ Helpers: Parse summary text into structured items/sections ═══

function parseSummaryItems(text: string): string[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const items: string[] = [];
  for (const line of lines) {
    const clean = line.replace(/^\s*(?:\d+[.)]\s*|[-*•]\s*|→\s*)/, "").trim();
    if (clean.length > 15) items.push(clean);
  }
  return items.length > 0 ? items : [text];
}

function parseSummarySections(text: string): { title: string; body: string }[] {
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
};

export function BlockRenderer({ block, onAction }: BlockRendererProps) {
  const Renderer = BLOCK_RENDERERS[block.type] || LibreRenderer;
  return <Renderer block={block} onAction={onAction} />;
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
