/**
 * workspace-block-renderers.tsx — Registre de composants de rendu par type de block
 *
 * Chaque renderer reçoit un WorkspaceBlock + callback d'action.
 * Patterns portés depuis les simulations (FocusDiscussionView, LiveReflexionView, etc.)
 */

import { useState } from "react";
import {
  Pin, Search, Swords, Pencil, RotateCcw, Layers,
  CheckCircle2, AlertTriangle, TrendingUp, Lightbulb,
  Clock, Activity, FileText,
  Check, X,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { formatCristallise } from "./content-formatters";
import { BotBadgeFull } from "../../v2/zones/center/shared/BotBadgeFull";
import type { WorkspaceBlock, WorkspaceBlockType } from "../core/types";

// ═══ Block Action Types ═══

export type BlockActionType = "pin" | "deepen" | "challenge" | "edit" | "rework" | "merge";

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
          className="w-full min-h-[100px] text-[10px] text-gray-700 leading-relaxed p-3 rounded-lg border border-blue-200 bg-blue-50/30 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-y"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <button onClick={() => { onAction("edit", block.id, editText); setIsEditing(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold transition-colors cursor-pointer">
            <Check className="h-3 w-3" /> Sauvegarder
          </button>
          <button onClick={() => { setEditText(block.summary); setIsEditing(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-[10px] font-medium transition-colors cursor-pointer">
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
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-colors cursor-pointer border-gray-200 text-gray-600 hover:bg-gray-50">
          <Pin className="h-3 w-3" /> Épingler
        </button>
        <button onClick={() => onAction("deepen", block.id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-colors cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50">
          <Search className="h-3 w-3" /> Approfondir
        </button>
        <button onClick={() => onAction("challenge", block.id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-colors cursor-pointer border-amber-200 text-amber-700 hover:bg-amber-50">
          <Swords className="h-3 w-3" /> Challenger
        </button>
        <button onClick={() => onAction("rework", block.id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-colors cursor-pointer border-sky-200 text-sky-700 hover:bg-sky-50">
          <RotateCcw className="h-3 w-3" /> Retravailler
        </button>
        <button onClick={() => setIsEditing(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-colors cursor-pointer border-gray-200 text-gray-600 hover:bg-gray-50">
          <Pencil className="h-3 w-3" /> Modifier
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <BotBadgeFull botCode={block.source} compact />
        <span className="text-[9px] text-gray-400">
          {block.sourceType === "voice" ? "Vocal" : "Chat"}
        </span>
      </div>
    </div>
  );
}

// ═══ Shared: Block Wrapper ═══

function BlockWrapper({ block, onAction, label, labelColor, children }: BlockRendererProps & { label: string; labelColor: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", labelColor)}>{label}</span>
        <h4 className="text-[10px] font-bold text-gray-900 flex-1 truncate">{block.title}</h4>
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
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Indicateurs cles</h4>
            <div className="grid grid-cols-2 gap-3">
              {data.axes.map((ax, i) => {
                const s = SEV[ax.color] || SEV.amber;
                return (
                  <div key={i} className={cn("rounded-lg p-3", s.bg.replace("100", "50"))}>
                    <p className="text-[10px] text-gray-400 mb-1">{ax.label}</p>
                    <div className="flex items-center gap-2">
                      <p className={cn("text-[10px] font-bold", s.text)}>{ax.score}/10</p>
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
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Points de friction</h4>
              <div className="space-y-2">
                {data.frictions.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px]">
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
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Analyse</h4>
            <div className="space-y-2">
              {parseSummaryItems(block.summary).map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px]">
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
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
            <p className="text-[11px] text-gray-700 leading-relaxed italic">{data.conclusion}</p>
          </div>
        </div>
      )}
    </BlockWrapper>
  );
}

// ═══ 2. Brainstorm — Hover-cards avec pin (pattern SimPhaseReflexion capture buttons) ═══

function BrainstormRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { items?: { id: number; title: string; detail: string }[] } | undefined;
  const IDEA_COLORS = ["border-l-amber-400", "border-l-blue-400", "border-l-green-400", "border-l-purple-400", "border-l-pink-400", "border-l-cyan-400"];
  return (
    <BlockWrapper block={block} onAction={onAction} label="Brainstorm" labelColor="bg-amber-100 text-amber-700">
      {data?.items ? (
        <div className="grid grid-cols-2 gap-2">
          {data.items.map((item) => (
            <div key={item.id} className={cn("group/idea rounded-lg border border-gray-200 border-l-[3px] bg-white px-3 py-2.5 hover:shadow-sm hover:bg-amber-50/30 transition-all", IDEA_COLORS[(item.id - 1) % IDEA_COLORS.length])}>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="h-3 w-3 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-gray-900">{item.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{item.detail}</p>
                </div>
                <button onClick={() => onAction("pin", block.id)}
                  className="opacity-0 group-hover/idea:opacity-100 p-1 rounded hover:bg-amber-100 transition-all cursor-pointer shrink-0" title="Epingler">
                  <Pin className="h-3 w-3 text-amber-500" />
                </button>
              </div>
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
                <p className="text-[11px] text-gray-700 leading-relaxed flex-1">{item}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </BlockWrapper>
  );
}

// ═══ 3. SCAMPER — Grille 7 cellules ═══

function ScamperRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { letters?: Record<string, string[]> } | undefined;
  const LABELS: Record<string, string> = { S: "Substituer", C: "Combiner", A: "Adapter", M: "Modifier", P: "Put to other use", E: "Éliminer", R: "Renverser" };
  const COLORS: Record<string, string> = { S: "border-l-blue-400", C: "border-l-green-400", A: "border-l-amber-400", M: "border-l-purple-400", P: "border-l-pink-400", E: "border-l-red-400", R: "border-l-orange-400" };
  return (
    <BlockWrapper block={block} onAction={onAction} label="SCAMPER" labelColor="bg-purple-100 text-purple-700">
      {data?.letters ? (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(LABELS).map(([letter, label]) => (
            <div key={letter} className={cn("rounded-lg border border-gray-200 border-l-[3px] bg-white px-3 py-2", COLORS[letter])}>
              <p className="text-[10px] font-bold text-gray-500 uppercase">{letter} — {label}</p>
              <ul className="mt-1 space-y-0.5">
                {(data.letters?.[letter] || []).map((item, i) => (
                  <li key={i} className="text-[10px] text-gray-700 flex items-start gap-1">
                    <span className="text-gray-300 mt-0.5">•</span> {item}
                  </li>
                ))}
                {(!data.letters?.[letter] || data.letters[letter].length === 0) && (
                  <li className="text-[10px] text-gray-300 italic">—</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
      )}
    </BlockWrapper>
  );
}

// ═══ 4. 5 Pourquoi — Arbre hiérarchique indenté ═══

function CinqPourquoiRenderer({ block, onAction }: BlockRendererProps) {
  const data = block.structured_data as { levels?: { question: string; answer: string }[] } | undefined;
  return (
    <BlockWrapper block={block} onAction={onAction} label="5 Pourquoi" labelColor="bg-orange-100 text-orange-700">
      {data?.levels ? (
        <div className="space-y-0">
          {data.levels.map((level, i) => (
            <div key={i} className="flex gap-2" style={{ paddingLeft: `${i * 16}px` }}>
              <div className="flex flex-col items-center shrink-0 pt-1">
                <div className={cn("w-2.5 h-2.5 rounded-full", i === data.levels!.length - 1 ? "bg-red-400" : "bg-orange-300")} />
                {i < data.levels!.length - 1 && <div className="w-px flex-1 bg-orange-200 mt-1" />}
              </div>
              <div className="pb-3 flex-1 min-w-0">
                <p className="text-[10px] font-bold text-orange-600">Pourquoi {i + 1}?</p>
                <p className="text-[11px] text-gray-700">{level.question}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">→ {level.answer}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
                <span className={cn("text-[10px] font-medium", a.done ? "text-gray-400 line-through" : "text-gray-900")}>{a.titre}</span>
              </div>
              {a.priorite && <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", PRIO[a.priorite] || PRIO.normale)}>{a.priorite}</span>}
              {a.assignee && <span className="text-[10px] text-gray-400 shrink-0">{a.assignee}</span>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
                <th className="text-[11px] font-semibold text-left px-3 py-2">Poste</th>
                <th className="text-[11px] font-semibold text-right px-3 py-2">Montant</th>
                <th className="text-[11px] font-semibold text-left px-3 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="text-[11px] text-gray-700 px-3 py-2">{r.poste}</td>
                  <td className="text-[11px] text-gray-900 font-medium text-right px-3 py-2">{r.montant.toLocaleString()} $</td>
                  <td className="text-[10px] text-gray-500 px-3 py-2">{r.note || "—"}</td>
                </tr>
              ))}
              {data.total !== undefined && (
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="text-[11px] font-bold text-gray-900 px-3 py-2">Total</td>
                  <td className="text-[11px] font-bold text-gray-900 text-right px-3 py-2">{data.total.toLocaleString()} $</td>
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
                <span className="text-[10px] text-gray-400 w-12 shrink-0 pt-0.5 text-right">{e.date}</span>
                <div className="flex flex-col items-center shrink-0">
                  <TIcon className={cn("h-3.5 w-3.5", ti.color)} />
                  {i < data.events.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-[11px] text-gray-700 leading-relaxed">{e.action}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
                <p className="text-[10px] text-gray-400">{kpi.label}</p>
                <p className="text-[10px] font-bold text-gray-900">{kpi.value}</p>
                {kpi.delta && <p className={cn("text-[9px] font-medium", kpi.positive !== false ? "text-green-600" : "text-red-600")}>{kpi.delta}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
                <span className="text-[10px] font-medium text-gray-900">{p.titre}</span>
                <span className="text-[10px] font-bold text-gray-500">{p.pct}%</span>
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
        <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
          <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-2">
            <span className="font-medium">{doneCount}/{taches.length} complétées</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full" style={{ width: `${(doneCount / taches.length) * 100}%` }} />
            </div>
          </div>
          {taches.map((t, i) => (
            <div key={i} className={cn("rounded-xl border bg-white px-4 py-2.5 flex items-center gap-3", t.done ? "border-green-200 bg-green-50/30" : "border-gray-200")}>
              <CheckCircle2 className={cn("h-4 w-4 shrink-0", t.done ? "text-green-500" : "text-gray-300")} />
              <div className="flex-1 min-w-0">
                <span className={cn("text-[10px] font-medium", t.done ? "text-gray-400 line-through" : "text-gray-900")}>{t.titre}</span>
              </div>
              {t.assignee && <span className="text-[10px] text-gray-400 shrink-0">{t.assignee}</span>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
                <span className="text-[10px] font-bold text-sky-500 mt-0.5 w-4 shrink-0">{item.id}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-gray-900">{item.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
                  <span className="text-[10px] font-medium text-gray-900 flex-1">{r.zone}</span>
                </div>
                <p className="text-[10px] text-gray-600 ml-5">{r.desc}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</p>
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
                <span className="text-[10px] font-medium text-gray-900 flex-1">{b.source}</span>
                {b.score && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">{b.score}</span>}
              </div>
              <p className="text-[10px] text-gray-600 leading-relaxed ml-8">{b.insight}</p>
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
                <p className="text-[11px] text-gray-700 leading-relaxed flex-1">{item}</p>
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
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Avocat du diable</span>
        </div>
        {data?.arguments ? (
          <div className="space-y-2 ml-6">
            {data.arguments.map((a, i) => {
              const sevColor = a.severity === "critique" ? "text-red-600" : a.severity === "modere" ? "text-amber-600" : "text-gray-600";
              return (
                <div key={i} className="flex items-start gap-2">
                  <span className={cn("text-[10px] font-bold shrink-0 mt-0.5", sevColor)}>{i + 1}.</span>
                  <p className="text-[11px] text-gray-700 leading-relaxed">{a.point}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2 ml-6">
            {parseSummaryItems(block.summary).map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-amber-600 shrink-0 mt-0.5">{i + 1}.</span>
                <p className="text-[11px] text-gray-700 leading-relaxed">{item}</p>
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
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Résumé exécutif</h4>
        {data?.points ? (
          <div className="space-y-2">
            {data.points.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", p.done !== false ? "text-green-500" : "text-gray-300")} />
                <span className="text-gray-800">{p.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {parseSummaryItems(block.summary).map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
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
            <p className="text-[11px] text-gray-700 leading-relaxed">{data.conclusion}</p>
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
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">{i + 1}</span>
                <h4 className="text-[10px] font-bold text-gray-900">{s.title}</h4>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {parseSummarySections(block.summary).map((s, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
              {s.title && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">{i + 1}</span>
                  <h4 className="text-[10px] font-bold text-gray-900">{s.title}</h4>
                </div>
              )}
              <p className="text-[11px] text-gray-600 leading-relaxed">{s.body}</p>
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
  return (
    <BlockWrapper block={block} onAction={onAction} label="Note" labelColor="bg-gray-100 text-gray-600">
      {items.length > 1 ? (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-gray-400 mt-0.5 w-4 shrink-0">{i + 1}.</span>
                <p className="text-[11px] text-gray-700 leading-relaxed flex-1">{item}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">{block.summary}</div>
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
};
