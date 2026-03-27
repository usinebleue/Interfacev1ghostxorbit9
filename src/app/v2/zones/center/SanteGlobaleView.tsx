/**
 * SanteGlobaleView.tsx — Sante de l'entreprise (refonte S71)
 * 3 Sub-tabs (controles par parent DepartmentTourDeControle):
 *   Vue d'ensemble | Diagnostics | Resultats
 * Props: botCode (CEOB = Direction master, autre = departement specifique)
 *        santeSub (vue-ensemble | diagnostics | resultats)
 * Direction = vue CEO agregee (carte de chaleur 12 depts, VITAA global)
 * Departement = vue specifique (score ce dept, contribution VITAA, diagnostics filtres)
 */

import { useState, useEffect, useMemo } from "react";
import { cn } from "../../../components/ui/utils";
import {
  Heart,
  AlertTriangle,
  TrendingUp,
  Flame,
  BarChart3,
  CheckCircle2,
  Eye,
  Users,
  Target,
  Activity,
  Stethoscope,
  LayoutGrid,
  Zap,
  ChevronRight,
  Inbox,
} from "lucide-react";
import {
  Radar as RechartsRadar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useCanvasActions } from "../../context/CanvasActionContext";
import { BOT_AVATAR } from "../../api/types";
import { api } from "../../api/client";
import type { DiagnosticCatalogue, DiagnosticIA } from "../../api/types";
import { DiagnosticHub } from "./diagnostic/DiagnosticHub";
import { getNiveau } from "./diagnostic/diagnostic-questions";
import { BotBadgeFull } from "./shared/BotBadgeFull";
import { BOT_INFO } from "./shared/section-config";

/* ============ BOT GRADIENTS ============ */
const BOT_GRADIENTS: Record<string, string> = {
  CEOB: "from-blue-600 to-blue-500",
  CTOB: "from-violet-600 to-violet-500",
  CFOB: "from-emerald-600 to-emerald-500",
  CMOB: "from-pink-600 to-pink-500",
  CSOB: "from-red-600 to-red-500",
  COOB: "from-orange-600 to-orange-500",
  CPOB: "from-amber-600 to-amber-500",
  CHROB: "from-teal-600 to-teal-500",
  CINOB: "from-rose-600 to-rose-500",
  CROB: "from-amber-600 to-amber-500",
  CLOB: "from-indigo-600 to-indigo-500",
  CISOB: "from-gray-600 to-gray-500",
};

/* ============ DEPT LABELS ============ */
const DEPT_LABELS: Record<string, { label: string; gradient: string; bot: string }> = {
  direction:   { label: "Direction (CEO)",        gradient: "from-blue-600 to-blue-500",     bot: "CEOB" },
  finance:     { label: "Finance (CFO)",          gradient: "from-emerald-600 to-emerald-500", bot: "CFOB" },
  technologie: { label: "Technologie (CTO)",      gradient: "from-violet-600 to-violet-500", bot: "CTOB" },
  marketing:   { label: "Marketing (CMO)",        gradient: "from-pink-600 to-pink-500",     bot: "CMOB" },
  strategie:   { label: "Strategie (CSO)",        gradient: "from-red-600 to-red-500",       bot: "CSOB" },
  operations:  { label: "Operations (COO)",       gradient: "from-orange-600 to-orange-500", bot: "COOB" },
  production:  { label: "Production (CPO)",       gradient: "from-amber-600 to-amber-500",   bot: "CPOB" },
  rh:          { label: "RH (CHRO)",              gradient: "from-teal-600 to-teal-500",     bot: "CHROB" },
  innovation:  { label: "Innovation (CINO)",      gradient: "from-rose-600 to-rose-500",     bot: "CINOB" },
  ventes:      { label: "Ventes (CRO)",           gradient: "from-amber-600 to-amber-500",   bot: "CROB" },
  legal:       { label: "Legal (CLO)",            gradient: "from-indigo-600 to-indigo-500", bot: "CLOB" },
  securite:    { label: "Securite (CISO)",        gradient: "from-gray-600 to-gray-500",     bot: "CISOB" },
};

/* Bot → dept key mapping */
const BOT_TO_DEPT_KEY: Record<string, string> = {
  CEOB: "direction", CTOB: "technologie", CFOB: "finance", CMOB: "marketing",
  CSOB: "strategie", COOB: "operations", CPOB: "production", CHROB: "rh",
  CINOB: "innovation", CROB: "ventes", CLOB: "legal", CISOB: "securite",
};

/* VITAA pillar → contributing departments */
const VITAA_DEPTS: Record<string, string[]> = {
  Vente:  ["marketing", "ventes"],
  Idee:   ["innovation", "technologie"],
  Temps:  ["operations", "rh"],
  Argent: ["finance", "direction"],
  Actif:  ["production", "strategie"],
};

/* ============ KPI CARD (meme pattern partout) ============ */
function KpiCard({ icon: Icon, label, value, sub, gradient, onClick }: {
  icon: React.ElementType; label: string; value: string; sub: string; gradient: string; onClick?: () => void;
}) {
  return (
    <div
      className={cn("overflow-hidden rounded-lg border shadow-sm transition-shadow", onClick && "cursor-pointer hover:shadow-md")}
      onClick={onClick}
    >
      <div className={cn("flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r", gradient)}>
        <Icon className="h-3.5 w-3.5 text-white" />
        <span className="text-xs font-bold text-white">{label}</span>
      </div>
      <div className="px-3 py-2.5">
        <div className="text-xl font-bold text-gray-900">{value}</div>
        <div className="text-[9px] text-gray-500">{sub}</div>
      </div>
    </div>
  );
}

/* ============ PROPS ============ */
interface SanteGlobaleViewProps {
  botCode?: string;
  santeSub?: string;
}

/* ============ MAIN COMPONENT ============ */
export function SanteGlobaleView({ botCode = "CEOB", santeSub = "vue-ensemble" }: SanteGlobaleViewProps) {
  const { dispatch } = useCanvasActions();
  const [diagnosticsEnrichis, setDiagnosticsEnrichis] = useState<DiagnosticCatalogue[]>([]);
  const [lastDiag, setLastDiag] = useState<DiagnosticIA | null>(null);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [diagLoading, setDiagLoading] = useState(true);

  const isCEO = botCode === "CEOB";
  const deptKey = BOT_TO_DEPT_KEY[botCode] || "direction";

  useEffect(() => {
    api.listDiagnosticsEnrichis().then(d => setDiagnosticsEnrichis(d || [])).catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.diagnosticIAList(1, "complete");
        const items = data.items || [];
        setTotalCompleted(items.length);
        if (items.length > 0) setLastDiag(items[items.length - 1]);
      } catch { /* silent */ }
      finally { setDiagLoading(false); }
    })();
  }, [santeSub]);

  const handleFocus = (title: string, elementType: string, data: unknown, bot = "CEOB") => {
    dispatch({ type: "focus", layer: "bouche", data: { title, element_type: elementType, data }, bot });
  };

  // ── Computed data from last diagnostic ──
  const ds = lastDiag?.scores_departements || {};

  const VITAA = useMemo(() => [
    { letter: "V", label: "Vente", score: ds.ventes || 0, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee", score: ds.innovation || 0, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps", score: ds.operations || 0, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent", score: ds.finance || 0, avg: 50, color: "bg-amber-500" },
    { letter: "A2", label: "Actif", score: ds.production || 0, avg: 50, color: "bg-red-500" },
  ], [ds]);

  const SCORE_GLOBAL = lastDiag?.score_dia || 0;
  const CRITIQUES = VITAA.filter(p => p.score > 0 && p.score < 35).length;
  const TRIANGLE_STATUS = !lastDiag ? "—" : CRITIQUES >= 3 ? "BRULE" : CRITIQUES >= 2 ? "COUVE" : CRITIQUES >= 1 ? "RISQUE" : "SAIN";

  const QUICK_WINS = useMemo(() =>
    (lastDiag?.top_gaps || []).map(gap => ({
      text: gap.label,
      bot: gap.botCode,
      priority: (gap.score < 30 ? "critique" : gap.score < 50 ? "haute" : "moyenne") as "critique" | "haute" | "moyenne",
    }))
  , [lastDiag]);

  const DEPT_SCORES = useMemo(() =>
    lastDiag?.scores_departements
      ? Object.entries(lastDiag.scores_departements)
          .map(([key, score]) => ({
            key,
            label: DEPT_LABELS[key]?.label?.split(" (")[0] || key,
            score,
            bot: DEPT_LABELS[key]?.bot || "CEOB",
            gradient: DEPT_LABELS[key]?.gradient || "from-gray-500 to-gray-400",
          }))
          .sort((a, b) => b.score - a.score)
      : []
  , [lastDiag]);

  const avgScore = DEPT_SCORES.length > 0 ? Math.round(DEPT_SCORES.reduce((s, d) => s + d.score, 0) / DEPT_SCORES.length) : 0;
  const thisDeptScore = ds[deptKey] || 0;

  // Diagnostics filtered by department for non-CEO
  const filteredDiagCatalogue = useMemo(() => {
    if (isCEO) return diagnosticsEnrichis;
    return diagnosticsEnrichis.filter(d => d.departement === deptKey);
  }, [diagnosticsEnrichis, isCEO, deptKey]);

  // Group catalogue by department
  const diagByDept = useMemo(() => {
    const depts = [...new Set(filteredDiagCatalogue.map(d => d.departement))].sort();
    return depts.map(dept => ({ dept, items: filteredDiagCatalogue.filter(d => d.departement === dept) }));
  }, [filteredDiagCatalogue]);

  // Radar data
  const radarData = useMemo(() =>
    lastDiag?.scores_departements
      ? Object.entries(lastDiag.scores_departements).map(([key, score]) => ({
          dept: DEPT_LABELS[key]?.label?.split(" ")[0] || key,
          score,
          fullMark: 100,
        }))
      : []
  , [lastDiag]);

  const niveau = lastDiag ? getNiveau(lastDiag.score_dia) : null;
  const topGaps = lastDiag?.top_gaps?.slice(0, 3) || [];
  const ghostTeam = lastDiag?.ghost_team?.slice(0, 3) || [];

  // Which VITAA pillar this department contributes to
  const deptVitaaContrib = useMemo(() => {
    if (isCEO) return null;
    for (const [pillar, depts] of Object.entries(VITAA_DEPTS)) {
      if (depts.includes(deptKey)) return pillar;
    }
    return null;
  }, [isCEO, deptKey]);

  /* ══════════════════════════════════════════ */
  /* RENDER                                     */
  /* ══════════════════════════════════════════ */

  return (
    <div className="space-y-3">

      {/* ══════════════════════════════════════════ */}
      {/* SUB-TAB: VUE D'ENSEMBLE                    */}
      {/* ══════════════════════════════════════════ */}
      {santeSub === "vue-ensemble" && (
        <>
          {/* ── 4 KPI cards ── */}
          <div className="grid grid-cols-4 gap-2">
            {isCEO ? (
              <>
                <KpiCard
                  icon={Heart}
                  label="Score VITAA"
                  value={`${SCORE_GLOBAL}/100`}
                  sub="Moyenne des 5 piliers"
                  gradient={BOT_GRADIENTS[botCode] || "from-blue-600 to-blue-500"}
                  onClick={() => handleFocus("Score VITAA Global", "health_vitaa", VITAA, "CEOB")}
                />
                <KpiCard
                  icon={CRITIQUES >= 2 ? Flame : CRITIQUES === 1 ? AlertTriangle : CheckCircle2}
                  label="Triangle du Feu"
                  value={TRIANGLE_STATUS}
                  sub={`${CRITIQUES} pilier${CRITIQUES !== 1 ? "s" : ""} en risque`}
                  gradient={cn(CRITIQUES >= 2 ? "from-red-600 to-red-500" : CRITIQUES === 1 ? "from-amber-600 to-amber-500" : "from-green-600 to-green-500")}
                  onClick={() => handleFocus("Triangle du Feu", "health_triangle", { status: TRIANGLE_STATUS, critiques: CRITIQUES, vitaa: VITAA }, "CEOB")}
                />
                <KpiCard
                  icon={BarChart3}
                  label="vs Secteur"
                  value={VITAA.filter(p => p.score >= p.avg).length + "/5"}
                  sub="Piliers au-dessus moyenne"
                  gradient="from-violet-600 to-violet-500"
                  onClick={() => handleFocus("Benchmark vs Secteur", "health_benchmark", VITAA, "CSOB")}
                />
                <KpiCard
                  icon={TrendingUp}
                  label="Departements"
                  value={DEPT_SCORES.length > 0 ? `${DEPT_SCORES[0].score}%` : "—"}
                  sub={DEPT_SCORES.length > 0 ? `Meilleur: ${DEPT_SCORES[0].label}` : "Aucun score"}
                  gradient="from-slate-700 to-slate-600"
                  onClick={() => handleFocus("Scores Departements", "health_depts", DEPT_SCORES, "CEOB")}
                />
              </>
            ) : (
              <>
                <KpiCard
                  icon={Target}
                  label="Score departement"
                  value={`${thisDeptScore}/100`}
                  sub={DEPT_LABELS[deptKey]?.label || deptKey}
                  gradient={BOT_GRADIENTS[botCode] || "from-blue-600 to-blue-500"}
                  onClick={() => handleFocus(`Score ${DEPT_LABELS[deptKey]?.label || deptKey}`, "dept_score", { key: deptKey, score: thisDeptScore }, botCode)}
                />
                <KpiCard
                  icon={Heart}
                  label="Score entreprise"
                  value={`${SCORE_GLOBAL}/100`}
                  sub="Score VITAA global"
                  gradient="from-blue-600 to-blue-500"
                  onClick={() => handleFocus("Score VITAA Global", "health_vitaa", VITAA, "CEOB")}
                />
                <KpiCard
                  icon={BarChart3}
                  label="vs Moyenne"
                  value={thisDeptScore > 0 ? `${thisDeptScore > avgScore ? "+" : ""}${thisDeptScore - avgScore}` : "—"}
                  sub={`Moyenne entreprise: ${avgScore}`}
                  gradient={thisDeptScore >= avgScore ? "from-green-600 to-green-500" : "from-amber-600 to-amber-500"}
                />
                <KpiCard
                  icon={Activity}
                  label={`Pilier ${deptVitaaContrib || "VITAA"}`}
                  value={deptVitaaContrib ? `${VITAA.find(v => v.label === deptVitaaContrib)?.score || 0}/100` : "—"}
                  sub={`Contribution a ${deptVitaaContrib || "VITAA"}`}
                  gradient="from-violet-600 to-violet-500"
                />
              </>
            )}
          </div>

          {/* ── CARTE DE CHALEUR 12 DEPARTEMENTS (CEO only) ── */}
          {isCEO && DEPT_SCORES.length > 0 && (
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-blue-100 flex items-center gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">Carte de chaleur — 12 departements</span>
                <span className="text-[9px] text-gray-400">Cliquez pour naviguer</span>
              </div>
              <div className="p-3 grid grid-cols-3 md:grid-cols-4 gap-2">
                {DEPT_SCORES.map(d => {
                  const scoreColor = d.score >= 70 ? "border-green-300 bg-green-50" : d.score >= 40 ? "border-amber-300 bg-amber-50" : "border-red-300 bg-red-50";
                  const textColor = d.score >= 70 ? "text-green-600" : d.score >= 40 ? "text-amber-600" : "text-red-600";
                  const barColor = d.score >= 70 ? "bg-green-400" : d.score >= 40 ? "bg-amber-400" : "bg-red-400";
                  return (
                    <button
                      key={d.key}
                      onClick={() => handleFocus(`${d.label} — Score ${d.score}/100`, "dept_score", { key: d.key, score: d.score }, d.bot)}
                      className={cn("p-2.5 rounded-lg border transition-all cursor-pointer text-left hover:shadow-md group", scoreColor)}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <img
                          src={BOT_AVATAR[d.bot] || BOT_AVATAR["CEOB"]}
                          alt={d.bot}
                          className="w-6 h-6 rounded-md object-cover shrink-0 ring-1 ring-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-gray-700 truncate">{d.label}</p>
                        </div>
                        <span className={cn("text-sm font-bold", textColor)}>{d.score}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${d.score}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── VITAA + Quick Wins (CEO) ── */}
          {isCEO && (
            <div className="grid grid-cols-5 gap-2">
              {/* VITAA — col-span-3 */}
              <div className="col-span-3 border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-blue-100 flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">VITAA — Toi vs Secteur</span>
                  <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Secteur</span>
                  <span className="flex items-center gap-1 text-[9px] text-gray-400 ml-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Toi</span>
                </div>
                <div className="p-2.5 space-y-2">
                  {VITAA.map((p) => (
                    <div
                      key={p.letter}
                      className="cursor-pointer rounded-lg hover:bg-blue-50 px-1 -mx-1 transition-colors group"
                      onClick={() => handleFocus(`${p.label} — Pilier VITAA (${p.score}/100)`, "vitaa_pillar", p, "CEOB")}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0", p.color)}>{p.letter[0]}</div>
                        <span className="text-xs font-medium text-gray-800 flex-1">{p.label}</span>
                        <span className={cn("text-xs font-bold", p.score >= p.avg ? "text-green-600" : "text-red-600")}>{p.score}</span>
                        <span className="text-[9px] text-gray-400 w-8">/ {p.avg}</span>
                        <span className={cn("text-[8px] px-1 py-0.5 rounded border font-medium",
                          p.score < 35 ? "text-red-600 bg-red-50 border-red-200" :
                          p.score < 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
                          "text-green-600 bg-green-50 border-green-200"
                        )}>{p.score < 35 ? "critique" : p.score < 50 ? "risque" : "sain"}</span>
                      </div>
                      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden ml-7">
                        <div className="h-full rounded-full bg-gray-200/80 absolute" style={{ width: `${p.avg}%` }} />
                        <div className={cn("h-full rounded-full absolute", p.color)} style={{ width: `${p.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Wins — col-span-2 */}
              <div className="col-span-2 border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100 px-2.5 py-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  <h3 className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">Actions Prioritaires</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">{QUICK_WINS.length}</span>
                </div>
                <div className="p-2.5 space-y-1.5">
                  {QUICK_WINS.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-400">Aucune action prioritaire</p>
                      <p className="text-[9px] text-gray-300 mt-1">Lancez un diagnostic pour generer des recommandations</p>
                    </div>
                  ) : QUICK_WINS.map((qw, i) => (
                    <div
                      key={i}
                      className="cursor-pointer group rounded-lg hover:bg-red-50 px-2 py-1.5 -mx-1 transition-colors border border-transparent hover:border-red-100"
                      onClick={() => handleFocus(qw.text, "quick_win", qw, qw.bot || "CEOB")}
                    >
                      <div className="flex items-start gap-1.5">
                        <span className={cn(
                          "w-2 h-2 rounded-full mt-1 shrink-0",
                          qw.priority === "critique" ? "bg-red-500" : qw.priority === "haute" ? "bg-amber-500" : "bg-blue-400"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-800 group-hover:text-red-700 leading-tight font-medium">{qw.text}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <BotBadgeFull botCode={qw.bot || "CEOB"} />
                            <span className={cn("text-[9px] font-medium",
                              qw.priority === "critique" ? "text-red-500" : qw.priority === "haute" ? "text-amber-500" : "text-blue-400"
                            )}>{qw.priority}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── DEPARTMENT-SPECIFIC: Score bars + position ── */}
          {!isCEO && (
            <>
              {/* Position vs entreprise */}
              {thisDeptScore > 0 && (
                <div className="border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-blue-100 flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">Position vs autres departements</span>
                  </div>
                  <div className="p-3 space-y-1.5">
                    {DEPT_SCORES.map(d => {
                      const isThisDept = d.key === deptKey;
                      const barColor = d.score >= 70 ? "bg-green-400" : d.score >= 40 ? "bg-amber-400" : "bg-red-400";
                      const textColor = d.score >= 70 ? "text-green-600" : d.score >= 40 ? "text-amber-600" : "text-red-600";
                      return (
                        <div key={d.key} className={cn("flex items-center gap-2 px-2 py-1 rounded-lg", isThisDept && "bg-blue-50 border border-blue-200")}>
                          <img src={BOT_AVATAR[d.bot] || BOT_AVATAR["CEOB"]} alt={d.bot} className="w-5 h-5 rounded-md object-cover shrink-0" />
                          <span className={cn("text-[9px] w-20 truncate", isThisDept ? "font-bold text-blue-700" : "text-gray-600")}>{d.label}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", isThisDept ? "bg-blue-500" : barColor)} style={{ width: `${d.score}%` }} />
                          </div>
                          <span className={cn("text-[9px] font-bold w-7 text-right", isThisDept ? "text-blue-600" : textColor)}>{d.score}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick diagnostic shortcuts for this dept */}
              {filteredDiagCatalogue.length > 0 && (
                <div className="border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-3 py-2 border-b border-violet-100 flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5 text-violet-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">Diagnostics recommandes</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600">{filteredDiagCatalogue.length}</span>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {filteredDiagCatalogue.slice(0, 4).map(diag => (
                      <button
                        key={diag.id}
                        onClick={() => handleFocus(`Diagnostic ${diag.titre}`, "diagnostic_enrichi", diag, diag.bot_primaire)}
                        className="p-2.5 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn("w-7 h-7 rounded-lg bg-gradient-to-r flex items-center justify-center shrink-0", BOT_GRADIENTS[diag.bot_primaire] || "from-gray-500 to-gray-400")}>
                            <Stethoscope className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-gray-700 truncate group-hover:text-violet-700">{diag.titre}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[8px] px-1 py-0.5 rounded bg-cyan-50 text-cyan-700">{diag.duree_minutes} min</span>
                              <span className="text-[8px] px-1 py-0.5 rounded bg-gray-50 text-gray-500">{diag.nb_questions} q.</span>
                            </div>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-violet-500 shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── ACTIONS RECOMMANDEES — CTAs basees sur les scores VITAA (CEO only) ── */}
          {isCEO && (
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-3 py-2 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">Projets recommandes — basé sur vos scores</span>
              </div>
              <div className="p-3 space-y-2">
                {(() => {
                  // Generate CTAs from VITAA scores
                  const ctaItems: { pillar: string; score: number; deptLabel: string; bot: string; action: string; severity: "critique" | "risque" | "sain" }[] = [];
                  const VITAA_CTA: Record<string, { dept: string; bot: string; actions: Record<string, string> }> = {
                    Vente:  { dept: "Ventes", bot: "CROB", actions: { critique: "Revoir votre pitch de vente et analyser votre pipeline commercial", risque: "Optimiser votre processus de conversion et former l'equipe ventes", sain: "Maintenir la cadence — explorer de nouveaux marches" } },
                    Idee:   { dept: "Innovation", bot: "CINOB", actions: { critique: "Lancer un audit R&D — identifier les opportunites d'innovation manquees", risque: "Accelerer la veille technologique et les projets pilotes", sain: "Continuer l'innovation — brevets et partenariats strategiques" } },
                    Temps:  { dept: "Operations", bot: "COOB", actions: { critique: "Analyser vos goulots de production — le TRG est probablement trop bas", risque: "Optimiser la planification et reduire les temps d'arret", sain: "Affiner le lean manufacturing et l'amelioration continue" } },
                    Argent: { dept: "Finance", bot: "CFOB", actions: { critique: "Revue urgente des flux de tresorerie et des marges par produit", risque: "Analyser les couts fixes et identifier les economies possibles", sain: "Planifier les investissements strategiques" } },
                  };
                  VITAA.forEach(p => {
                    if (p.label === "Actif") return; // Skip duplicate A
                    const cta = VITAA_CTA[p.label];
                    if (!cta) return;
                    const severity = p.score < 35 ? "critique" : p.score < 50 ? "risque" : "sain";
                    ctaItems.push({ pillar: p.label, score: p.score, deptLabel: cta.dept, bot: cta.bot, action: cta.actions[severity], severity });
                  });
                  // Sort: critique first, then risque, then sain
                  ctaItems.sort((a, b) => {
                    const order = { critique: 0, risque: 1, sain: 2 };
                    return order[a.severity] - order[b.severity];
                  });

                  if (ctaItems.length === 0 || !lastDiag) {
                    return (
                      <div className="text-center py-4">
                        <p className="text-xs text-gray-400">Completez un diagnostic pour voir les recommandations</p>
                        <p className="text-[9px] text-gray-300 mt-1">Les projets seront generes automatiquement selon vos scores</p>
                      </div>
                    );
                  }

                  return ctaItems.map((cta) => {
                    const severityColor = cta.severity === "critique" ? "border-red-200 bg-red-50/50" : cta.severity === "risque" ? "border-amber-200 bg-amber-50/50" : "border-green-200 bg-green-50/50";
                    const severityBadge = cta.severity === "critique" ? "bg-red-100 text-red-700" : cta.severity === "risque" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";
                    const severityDot = cta.severity === "critique" ? "bg-red-500" : cta.severity === "risque" ? "bg-amber-500" : "bg-green-500";
                    return (
                      <div key={cta.pillar}
                        className={cn("flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all group", severityColor)}
                        onClick={() => handleFocus(`Projet: ${cta.action}`, "recommended_project", cta, cta.bot)}
                      >
                        <img src={BOT_AVATAR[cta.bot] || BOT_AVATAR["CEOB"]} alt={cta.bot} className="w-8 h-8 rounded-lg object-cover shrink-0 ring-1 ring-gray-200" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("w-2 h-2 rounded-full shrink-0", severityDot)} />
                            <span className="text-xs font-bold text-gray-800">Pilier {cta.pillar} — {cta.deptLabel}</span>
                            <span className={cn("text-[8px] px-1.5 py-0.5 rounded font-bold", severityBadge)}>{cta.severity.toUpperCase()} ({cta.score}/100)</span>
                          </div>
                          <p className="text-[9px] text-gray-600 leading-relaxed">{cta.action}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <BotBadgeFull botCode={cta.bot} />
                            <span className="text-[8px] text-blue-600 font-medium group-hover:underline">Lancer un projet →</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 shrink-0 mt-1" />
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Empty state if no diagnostic at all */}
          {!lastDiag && !diagLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
              <Stethoscope className="h-8 w-8" />
              <span className="text-sm">Aucun diagnostic complete</span>
              <span className="text-[9px] text-gray-300">Lancez votre premier diagnostic pour voir les scores</span>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* SUB-TAB: DIAGNOSTICS — Hub unifie (3 vagues) */}
      {/* ══════════════════════════════════════════ */}
      {santeSub === "diagnostics" && (
        <DiagnosticHub
          botCode={botCode}
          completedCount={totalCompleted}
        />
      )}

      {/* ══════════════════════════════════════════ */}
      {/* SUB-TAB: RESULTATS                          */}
      {/* ══════════════════════════════════════════ */}
      {santeSub === "resultats" && (
        <>
          {diagLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
              <Stethoscope className="h-8 w-8 animate-pulse" />
              <span className="text-sm">Chargement...</span>
            </div>
          ) : !lastDiag ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Stethoscope className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-gray-800">Aucun diagnostic complete</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-md">
                  Lancez votre premier diagnostic pour obtenir une vue complete de la sante de votre entreprise.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* 4 KPI cards */}
              <div className="grid grid-cols-4 gap-2">
                <KpiCard
                  icon={Target}
                  label="Score DIA"
                  value={`${lastDiag.score_dia}/100`}
                  sub="Score global du dernier diagnostic"
                  gradient={BOT_GRADIENTS[botCode] || "from-blue-600 to-blue-500"}
                  onClick={() => handleFocus("Score DIA", "diagnostic_score", lastDiag, "CEOB")}
                />
                <KpiCard
                  icon={TrendingUp}
                  label="Niveau"
                  value={niveau?.label || "—"}
                  sub={niveau?.description || ""}
                  gradient={(lastDiag.score_dia || 0) >= 80 ? "from-blue-600 to-blue-500" :
                    (lastDiag.score_dia || 0) >= 60 ? "from-green-600 to-green-500" :
                    (lastDiag.score_dia || 0) >= 40 ? "from-amber-600 to-amber-500" :
                    "from-red-600 to-red-500"}
                  onClick={() => handleFocus("Niveau Diagnostic", "diagnostic_niveau", { niveau, lastDiag }, "CEOB")}
                />
                <KpiCard
                  icon={BarChart3}
                  label="Diagnostics"
                  value={String(totalCompleted)}
                  sub={`diagnostic${totalCompleted !== 1 ? "s" : ""} complete${totalCompleted !== 1 ? "s" : ""}`}
                  gradient="from-violet-600 to-violet-500"
                />
                <KpiCard
                  icon={AlertTriangle}
                  label="Gap non exploite"
                  value={`${100 - (lastDiag.score_sei || 0)}%`}
                  sub="Potentiel d'amelioration SEI"
                  gradient="from-amber-600 to-amber-500"
                  onClick={() => handleFocus("Gap SEI", "diagnostic_sei", lastDiag, "CEOB")}
                />
              </div>

              {/* Radar + Gaps */}
              <div className="grid grid-cols-5 gap-2">
                {/* Radar — col-span-3 */}
                <div className="col-span-3 border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-blue-100 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700">Radar departements</span>
                  </div>
                  {radarData.length > 0 ? (
                    <div className="p-2.5" style={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="dept" tick={{ fontSize: 10, fill: "#6b7280" }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                          <RechartsRadar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-400">Pas de donnees radar</div>
                  )}
                </div>

                {/* Gaps + Ghost Team — col-span-2 */}
                <div className="col-span-2 border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-2.5 py-2 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700">Top Gaps — Actions prioritaires</span>
                  </div>
                  <div className="p-2.5 space-y-2">
                    {topGaps.length > 0 ? topGaps.map((gap, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white border cursor-pointer hover:shadow-sm"
                        onClick={() => handleFocus(`Gap: ${gap.label}`, "diagnostic_gap", gap, gap.botCode || "CEOB")}
                      >
                        <img
                          src={BOT_AVATAR[gap.botCode] || BOT_AVATAR["CEOB"]}
                          alt={gap.botCode}
                          className="w-7 h-7 rounded-lg object-cover shrink-0 ring-1 ring-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-800">{gap.label}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", gap.score < 40 ? "bg-red-400" : gap.score < 60 ? "bg-amber-400" : "bg-green-400")}
                                style={{ width: `${gap.score}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-bold text-gray-600">{gap.score}/100</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-gray-400 text-center py-4">Aucun gap identifie</p>
                    )}

                    {/* Ghost Team */}
                    {ghostTeam.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Ghost Team recommandee</p>
                        <div className="flex gap-1.5">
                          {ghostTeam.map((bot, i) => (
                            <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-100">
                              <img
                                src={BOT_AVATAR[bot.botCode] || BOT_AVATAR["CEOB"]}
                                alt={bot.botCode}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span className="text-[9px] font-medium text-blue-700">{BOT_INFO[bot.botCode]?.label || bot.botCode}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Full scores par departement */}
              {lastDiag.scores_departements && (
                <div className="border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-2.5 py-2 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700">Scores par departement</span>
                  </div>
                  <div className="p-2.5 space-y-1.5">
                    {Object.entries(lastDiag.scores_departements)
                      .sort(([, a], [, b]) => b - a)
                      .map(([key, score]) => {
                        const cfg = DEPT_LABELS[key];
                        const bc = cfg?.bot || "CEOB";
                        const isThisDept = !isCEO && key === deptKey;
                        return (
                          <div key={key} className={cn("flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer hover:shadow-sm", isThisDept ? "bg-blue-50 border-blue-200" : "bg-white")}
                            onClick={() => handleFocus(`${cfg?.label || key} — Score ${score}/100`, "dept_score", { key, score, cfg }, bc)}
                          >
                            <img
                              src={BOT_AVATAR[bc] || BOT_AVATAR["CEOB"]}
                              alt={bc}
                              className="w-7 h-7 rounded-lg object-cover shrink-0 ring-1 ring-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className={cn("text-xs font-bold", isThisDept ? "text-blue-700" : "text-gray-800")}>{cfg?.label || key}</span>
                                <span className={cn("text-xs font-bold",
                                  score >= 70 ? "text-green-600" : score >= 40 ? "text-amber-600" : "text-red-600"
                                )}>{score}/100</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full", score >= 70 ? "bg-green-400" : score >= 40 ? "bg-amber-400" : "bg-red-400")}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

    </div>
  );
}
