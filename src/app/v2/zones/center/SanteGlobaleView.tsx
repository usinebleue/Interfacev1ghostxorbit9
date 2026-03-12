/**
 * SanteGlobaleView.tsx — Sante Globale de l'entreprise (unifie)
 * 4 Tabs: Etat de sante | Diagnostics | Resultats | Reference
 * Merge Health + DiagnosticHub en une seule vue
 * Sprint C — Phase 4
 */

import { useState, useEffect } from "react";
import { Badge } from "../../../components/ui/badge";
import { Card } from "../../../components/ui/card";
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
  BookOpen,
} from "lucide-react";
import {
  Radar as RechartsRadar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useCanvasActions } from "../../context/CanvasActionContext";
import { PageLayout } from "./layouts/PageLayout";
import { BOT_AVATAR } from "../../api/types";
import { api } from "../../api/client";
import type { DiagnosticCatalogue, DiagnosticIA } from "../../api/types";
import { DiagnosticIAPage } from "./diagnostic/DiagnosticIAPage";
import { getNiveau } from "./diagnostic/diagnostic-questions";

/* ============ BOT GRADIENTS (same as Pipeline) ============ */
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
  direction:   { label: "Tactique (CEO)",       gradient: "from-slate-700 to-slate-600",   bot: "CEOB" },
  finance:     { label: "Finance (CFO)",       gradient: "from-emerald-600 to-teal-500",  bot: "CFOB" },
  technologie: { label: "Technologie (CTO)",   gradient: "from-blue-700 to-indigo-600",   bot: "CTOB" },
  marketing:   { label: "Marketing (CMO)",     gradient: "from-fuchsia-600 to-pink-500",  bot: "CMOB" },
  strategie:   { label: "Strategie (CSO)",     gradient: "from-violet-700 to-purple-600", bot: "CSOB" },
  operations:  { label: "Operations (COO)",    gradient: "from-orange-600 to-orange-500", bot: "COOB" },
  production:  { label: "Production (CPO)",    gradient: "from-slate-600 to-slate-500",   bot: "CPOB" },
  rh:          { label: "RH (CHRO)",           gradient: "from-teal-600 to-teal-500",     bot: "CHROB" },
  innovation:  { label: "Innovation (CINO)",   gradient: "from-rose-600 to-rose-500",     bot: "CINOB" },
  ventes:      { label: "Ventes (CRO)",        gradient: "from-amber-600 to-amber-500",   bot: "CROB" },
  legal:       { label: "Legal (CLO)",         gradient: "from-indigo-600 to-indigo-500", bot: "CLOB" },
  securite:    { label: "Securite (CISO)",     gradient: "from-zinc-700 to-zinc-600",     bot: "CISOB" },
};

/* ============ VITAA / SCORE / QUICK WINS / DEPT SCORES ============ */
/* Calcules dynamiquement dans le composant depuis lastDiag (dernier diagnostic complete) */

/* ============ KPI CARD ============ */
function KpiCard({ icon: Icon, label, value, sub, gradient, onClick }: {
  icon: React.ElementType; label: string; value: string; sub: string; gradient: string; onClick?: () => void;
}) {
  return (
    <Card
      className={cn("p-0 overflow-hidden transition-shadow", onClick && "cursor-pointer hover:shadow-md")}
      onClick={onClick}
    >
      <div className={cn("flex items-center gap-2 px-3 py-2", gradient)}>
        <Icon className="h-4 w-4 text-white" />
        <span className="text-sm font-bold text-white">{label}</span>
      </div>
      <div className="px-3 py-2">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-[9px] text-gray-500">{sub}</div>
      </div>
    </Card>
  );
}

/* Mapping pilier VITAA → bot */
const VITAA_BOT: Record<string, string> = {
  Vente: "CSOB", Idee: "CINOB", Temps: "COOB", Argent: "CFOB", Actif: "COOB",
};

/* Mapping role → bot code */
const QW_BOT_CODE: Record<string, string> = {
  CFO: "CFOB", CTO: "CTOB", COO: "COOB", CEO: "CEOB", CRO: "CROB",
};

/* ============ TABS ============ */
type HealthTab = "etat" | "diagnostics-ia" | "resultats" | "reference";
const HEALTH_TABS: { id: HealthTab; label: string; icon: React.ElementType }[] = [
  { id: "etat", label: "Etat de sante", icon: Activity },
  { id: "diagnostics-ia", label: "Diagnostics", icon: Stethoscope },
  { id: "resultats", label: "Resultats", icon: BarChart3 },
  { id: "reference", label: "Reference", icon: BookOpen },
];

/* ============ HEALTH VIEW ============ */
export function SanteGlobaleView() {
  const { dispatch } = useCanvasActions();
  const [activeTab, setActiveTab] = useState<HealthTab>("etat");
  const [diagnosticsEnrichis, setDiagnosticsEnrichis] = useState<DiagnosticCatalogue[]>([]);
  const [diagFilter, setDiagFilter] = useState<string | null>(null);
  const [diagBotFilter, setDiagBotFilter] = useState<string | null>(null);
  const [lastDiag, setLastDiag] = useState<DiagnosticIA | null>(null);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [diagLoading, setDiagLoading] = useState(true);

  useEffect(() => {
    api.listDiagnosticsEnrichis().then(d => setDiagnosticsEnrichis(d || [])).catch(() => {});
  }, []);

  // Load completed diagnostics for Resultats tab
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
  }, [activeTab]);

  const handleFocus = (title: string, elementType: string, data: unknown, bot = "CEOB") => {
    dispatch({ type: "focus", layer: "bouche", data: { title, element_type: elementType, data }, bot });
  };

  // Diagnostics filtered
  const diagDepts = [...new Set(diagnosticsEnrichis.map(d => d.departement))].sort();
  const diagBots = [...new Set(diagnosticsEnrichis.map(d => d.bot_primaire))].sort();
  const filteredDiag = diagnosticsEnrichis
    .filter(d => !diagFilter || d.departement === diagFilter)
    .filter(d => !diagBotFilter || d.bot_primaire === diagBotFilter);

  // Group by department
  const diagByDept = diagDepts.map(dept => ({
    dept,
    items: diagnosticsEnrichis.filter(d => d.departement === dept),
  }));

  // ── Tab 1 — Etat de sante (calcule depuis dernier diagnostic) ──
  const ds = lastDiag?.scores_departements || {};
  const VITAA = lastDiag ? [
    { letter: "V", label: "Vente", score: ds.ventes || 0, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee", score: ds.innovation || 0, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps", score: ds.operations || 0, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent", score: ds.finance || 0, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif", score: ds.production || 0, avg: 50, color: "bg-red-500" },
  ] : [
    { letter: "V", label: "Vente", score: 0, avg: 0, color: "bg-blue-500" },
    { letter: "I", label: "Idee", score: 0, avg: 0, color: "bg-purple-500" },
    { letter: "T", label: "Temps", score: 0, avg: 0, color: "bg-emerald-500" },
    { letter: "A", label: "Argent", score: 0, avg: 0, color: "bg-amber-500" },
    { letter: "A", label: "Actif", score: 0, avg: 0, color: "bg-red-500" },
  ];
  const SCORE_GLOBAL = lastDiag?.score_dia || 0;
  const CRITIQUES = VITAA.filter(p => p.score > 0 && p.score < 35).length;
  const TRIANGLE_STATUS = !lastDiag ? "—" : CRITIQUES >= 3 ? "BRULE" : CRITIQUES >= 2 ? "COUVE" : CRITIQUES >= 1 ? "RISQUE" : "SAIN";
  const QUICK_WINS: { text: string; bot: string; priority: "critique" | "haute" | "moyenne" }[] =
    (lastDiag?.top_gaps || []).map(gap => ({
      text: gap.label,
      bot: gap.botCode,
      priority: (gap.score < 30 ? "critique" : gap.score < 50 ? "haute" : "moyenne") as "critique" | "haute" | "moyenne",
    }));
  const DEPT_SCORES: { label: string; score: number }[] = lastDiag?.scores_departements
    ? Object.entries(lastDiag.scores_departements)
        .map(([key, score]) => ({ label: DEPT_LABELS[key]?.label?.split(" (")[0] || key, score }))
        .sort((a, b) => b.score - a.score)
    : [];

  // ── Tab 3 — Resultats (radar + gaps + ghost team) ──
  const niveau = lastDiag ? getNiveau(lastDiag.score_dia) : null;
  const radarData = lastDiag?.scores_departements
    ? Object.entries(lastDiag.scores_departements).map(([key, score]) => ({
        dept: DEPT_LABELS[key]?.label?.split(" ")[0] || key,
        score,
        fullMark: 100,
      }))
    : [];
  const topGaps = lastDiag?.top_gaps?.slice(0, 3) || [];
  const ghostTeam = lastDiag?.ghost_team?.slice(0, 3) || [];

  return (
    <PageLayout maxWidth="5xl" spacing="space-y-2.5">

        {/* ── GRADIENT HEADER + TABS (Pipeline pattern) ── */}
        <div className={cn("bg-gradient-to-r rounded-xl p-4 transition-all duration-300",
          activeTab === "etat" ? "from-orange-600 to-amber-500" :
          activeTab === "diagnostics-ia" ? "from-violet-600 to-purple-500" :
          activeTab === "resultats" ? "from-blue-600 to-indigo-500" :
          "from-emerald-600 to-teal-500"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Sante Globale</h2>
                <p className="text-sm text-white/70">
                  {activeTab === "etat" ? "Vue d'ensemble de votre entreprise" :
                   activeTab === "diagnostics-ia" ? "Lancez et gerez vos diagnostics" :
                   activeTab === "resultats" ? `${totalCompleted} diagnostic${totalCompleted !== 1 ? "s" : ""} complete${totalCompleted !== 1 ? "s" : ""}` :
                   `${diagnosticsEnrichis.length} diagnostics disponibles`}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {HEALTH_TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                      activeTab === tab.id
                        ? "bg-white/25 text-white shadow-sm"
                        : "text-white/60 hover:bg-white/10 hover:text-white/80"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                    {tab.id === "reference" && diagnosticsEnrichis.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20">{diagnosticsEnrichis.length}</span>
                    )}
                    {tab.id === "resultats" && totalCompleted > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20">{totalCompleted}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* TAB 1 — ETAT DE SANTE ACTUEL              */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === "etat" && (<>

        {/* ── 4 KPI cards ── */}
        <div className="grid grid-cols-4 gap-2.5">
          <KpiCard
            icon={Heart}
            label="Score VITAA"
            value={`${SCORE_GLOBAL}/100`}
            sub="Moyenne des 5 piliers"
            gradient="bg-gradient-to-r from-orange-600 to-orange-500"
            onClick={() => handleFocus("Score VITAA Global", "health_vitaa", VITAA, "CEOB")}
          />
          <KpiCard
            icon={CRITIQUES >= 2 ? Flame : CRITIQUES === 1 ? AlertTriangle : CheckCircle2}
            label="Triangle du Feu"
            value={TRIANGLE_STATUS}
            sub={`${CRITIQUES} pilier${CRITIQUES !== 1 ? "s" : ""} en risque`}
            gradient={cn("bg-gradient-to-r", CRITIQUES >= 2 ? "from-red-600 to-red-500" : CRITIQUES === 1 ? "from-amber-600 to-amber-500" : "from-green-600 to-green-500")}
            onClick={() => handleFocus("Triangle du Feu", "health_triangle", { status: TRIANGLE_STATUS, critiques: CRITIQUES, vitaa: VITAA }, "CEOB")}
          />
          <KpiCard
            icon={BarChart3}
            label="vs Secteur"
            value={VITAA.filter(p => p.score >= p.avg).length + "/5"}
            sub="Piliers au-dessus moyenne"
            gradient="bg-gradient-to-r from-violet-600 to-violet-500"
            onClick={() => handleFocus("Benchmark vs Secteur", "health_benchmark", VITAA, "CSOB")}
          />
          <KpiCard
            icon={TrendingUp}
            label="Departements"
            value={DEPT_SCORES.length > 0 ? `${DEPT_SCORES[0].score}%` : "—"}
            sub={DEPT_SCORES.length > 0 ? `Meilleur: ${DEPT_SCORES[0].label}` : "Aucun score"}
            gradient="bg-gradient-to-r from-slate-700 to-slate-600"
            onClick={() => handleFocus("Scores Départements", "health_depts", DEPT_SCORES, "CEOB")}
          />
        </div>

        {/* ── VITAA (3/5) + Quick Wins (2/5) ── */}
        <div className="grid grid-cols-5 gap-2.5">

          {/* VITAA — col-span-3 */}
          <div className="col-span-3 bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-1.5 border-b border-orange-100 flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">VITAA — Toi vs Secteur</span>
              <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Secteur</span>
              <span className="flex items-center gap-1 text-[9px] text-gray-400 ml-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Toi</span>
            </div>
            <div className="p-2.5 space-y-2">
              {VITAA.map((p, i) => (
                <div
                  key={i}
                  className="cursor-pointer rounded-lg hover:bg-blue-50 px-1 -mx-1 transition-colors group"
                  onClick={() => handleFocus(`${p.label} — Pilier VITAA (${p.score}/100)`, "vitaa_pillar", p, VITAA_BOT[p.label] || "CEOB")}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0", p.color)}>{p.letter}</div>
                    <span className="text-xs font-medium text-gray-800 flex-1">{p.label}</span>
                    <span className={cn("text-xs font-bold", p.score >= p.avg ? "text-green-600" : "text-red-600")}>{p.score}</span>
                    <span className="text-[9px] text-gray-400 w-8">/ {p.avg}</span>
                    <Badge variant="outline" className={cn("text-[8px] px-1",
                      p.score < 35 ? "text-red-600 bg-red-50 border-red-200" :
                      p.score < 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
                      "text-green-600 bg-green-50 border-green-200"
                    )}>{p.score < 35 ? "critique" : p.score < 50 ? "risque" : "sain"}</Badge>
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
          <div className="col-span-2 bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100 px-2.5 py-1.5 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <h3 className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">Actions Prioritaires</h3>
              <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3.5">{QUICK_WINS.length}</Badge>
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
                  onClick={() => handleFocus(qw.text, "quick_win", qw, QW_BOT_CODE[qw.bot] || "CEOB")}
                >
                  <div className="flex items-start gap-1.5">
                    <span className={cn(
                      "w-2 h-2 rounded-full mt-1 shrink-0",
                      qw.priority === "critique" ? "bg-red-500" : qw.priority === "haute" ? "bg-amber-500" : "bg-blue-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 group-hover:text-red-700 leading-tight font-medium">{qw.text}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{qw.bot} · <span className={cn(
                        "font-medium",
                        qw.priority === "critique" ? "text-red-500" : qw.priority === "haute" ? "text-amber-500" : "text-blue-400"
                      )}>{qw.priority}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Benchmark + Departements (2 cols) ── */}
        <div className="grid grid-cols-2 gap-2.5">

          {/* Benchmark */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-2.5 py-1.5 flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
              <h3 className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">Benchmark</h3>
            </div>
            <div className="p-2.5 space-y-1">
              {[
                { title: "Externe", desc: "Competiteurs et mediane sectorielle", icon: BarChart3, iconColor: "text-blue-500" },
                { title: "Pairs Orbit9", desc: "8 membres de ton cercle (anonymise)", icon: Users, iconColor: "text-emerald-500" },
                { title: "Historique", desc: "Ta trajectoire sur 6 mois", icon: TrendingUp, iconColor: "text-violet-500" },
              ].map((bm) => {
                const BIcon = bm.icon;
                return (
                  <div key={bm.title} className="cursor-pointer group rounded-lg hover:bg-blue-50 px-2 py-1.5 -mx-1 transition-colors">
                    <div className="flex items-center gap-2">
                      <BIcon className={cn("h-4 w-4 shrink-0", bm.iconColor)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 group-hover:text-blue-600">{bm.title}</p>
                        <p className="text-[9px] text-gray-400">{bm.desc}</p>
                      </div>
                      <Eye className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-500 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scores Departements */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-2.5 py-1.5 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-green-500" />
              <h3 className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">Departements</h3>
            </div>
            <div className="p-2.5 space-y-1">
              {DEPT_SCORES.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-xs text-gray-400">Aucun score</p>
                  <p className="text-[9px] text-gray-300 mt-1">Completez un diagnostic</p>
                </div>
              ) : DEPT_SCORES.map((d) => {
                const color = d.score >= 80 ? "bg-green-500" : d.score >= 60 ? "bg-amber-500" : "bg-red-500";
                const textColor = d.score >= 80 ? "text-green-600" : d.score >= 60 ? "text-amber-600" : "text-red-600";
                return (
                  <div key={d.label} className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-700 w-16 truncate">{d.label}</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", color)} style={{ width: `${d.score}%` }} />
                    </div>
                    <span className={cn("text-[9px] font-bold w-7 text-right", textColor)}>{d.score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        </>)}

        {/* ══════════════════════════════════════════ */}
        {/* TAB 2 — DIAGNOSTICS IA (wizard integre)    */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === "diagnostics-ia" && (
          <DiagnosticIAPage />
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB 3 — RESULTATS (dernier diagnostic)     */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === "resultats" && (
          <>
            {diagLoading ? (
              <div className="text-center py-12">
                <Stethoscope className="h-5 w-5 text-gray-300 mx-auto mb-2 animate-pulse" />
                <p className="text-sm text-gray-500">Chargement...</p>
              </div>
            ) : !lastDiag ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Stethoscope className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Aucun diagnostic complete</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                    Lancez votre premier diagnostic pour obtenir une vue complete de la sante de votre entreprise.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("diagnostics-ia")}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Lancer un diagnostic
                </button>
              </div>
            ) : (
              <>
                {/* 4 KPI cards */}
                <div className="grid grid-cols-4 gap-2.5">
                  <KpiCard
                    icon={Target}
                    label="Score DIA"
                    value={`${lastDiag.score_dia}/100`}
                    sub="Score global du dernier diagnostic"
                    gradient="bg-gradient-to-r from-blue-600 to-blue-500"
                    onClick={() => handleFocus("Score DIA", "diagnostic_score", lastDiag, "CEOB")}
                  />
                  <KpiCard
                    icon={TrendingUp}
                    label="Niveau"
                    value={niveau?.label || "—"}
                    sub={niveau?.description || ""}
                    gradient={`bg-gradient-to-r ${
                      (lastDiag.score_dia || 0) >= 80 ? "from-blue-600 to-blue-500" :
                      (lastDiag.score_dia || 0) >= 60 ? "from-green-600 to-green-500" :
                      (lastDiag.score_dia || 0) >= 40 ? "from-yellow-600 to-yellow-500" :
                      "from-red-600 to-red-500"
                    }`}
                    onClick={() => handleFocus("Niveau Diagnostic", "diagnostic_niveau", { niveau, lastDiag }, "CEOB")}
                  />
                  <KpiCard
                    icon={BarChart3}
                    label="Diagnostics"
                    value={String(totalCompleted)}
                    sub={`diagnostic${totalCompleted !== 1 ? "s" : ""} complete${totalCompleted !== 1 ? "s" : ""}`}
                    gradient="bg-gradient-to-r from-violet-600 to-violet-500"
                  />
                  <KpiCard
                    icon={AlertTriangle}
                    label="Gap non exploite"
                    value={`${100 - (lastDiag.score_sei || 0)}%`}
                    sub="Potentiel d'amelioration SEI"
                    gradient="bg-gradient-to-r from-amber-600 to-amber-500"
                    onClick={() => handleFocus("Gap SEI", "diagnostic_sei", lastDiag, "CEOB")}
                  />
                </div>

                {/* Radar + Gaps */}
                <div className="grid grid-cols-5 gap-2.5">
                  {/* Radar — col-span-3 */}
                  <div className="col-span-3 bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 border-b border-blue-100 flex items-center gap-1.5">
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
                  <div className="col-span-2 bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-2.5 py-1.5 flex items-center gap-1.5">
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
                              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
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

                      {/* Ghost Team recommandee */}
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
                                <span className="text-[9px] font-medium text-blue-700">{bot.botCode}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scores par departement */}
                {lastDiag.scores_departements && (
                  <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-2.5 py-1.5 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700">Scores par departement</span>
                    </div>
                    <div className="p-2.5 space-y-1.5">
                      {Object.entries(lastDiag.scores_departements)
                        .sort(([, a], [, b]) => b - a)
                        .map(([key, score]) => {
                          const cfg = DEPT_LABELS[key];
                          const botCode = cfg?.bot || "CEOB";
                          return (
                            <div key={key} className="flex items-center gap-3 bg-white border rounded-lg px-3 py-2 cursor-pointer hover:shadow-sm"
                              onClick={() => handleFocus(`${cfg?.label || key} — Score ${score}/100`, "dept_score", { key, score, cfg }, botCode)}
                            >
                              <img
                                src={BOT_AVATAR[botCode] || BOT_AVATAR["CEOB"]}
                                alt={botCode}
                                className="w-7 h-7 rounded-lg object-cover shrink-0 ring-1 ring-gray-200"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-xs font-bold text-gray-800">{cfg?.label || key}</span>
                                  <span className={cn("text-xs font-bold",
                                    score >= 70 ? "text-green-600" : score >= 40 ? "text-amber-600" : "text-red-600"
                                  )}>{score}/100</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
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

        {/* ══════════════════════════════════════════ */}
        {/* TAB 4 — REFERENCE (catalogue diagnostics)  */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === "reference" && (
          <div className="space-y-4">
            {diagByDept.length === 0 ? (
              <div className="text-center py-12">
                <LayoutGrid className="h-5 w-5 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chargement des diagnostics...</p>
              </div>
            ) : (
              diagByDept.map(({ dept, items }) => {
                const deptCfg = DEPT_LABELS[dept];
                const gradient = deptCfg?.gradient || "from-gray-500 to-gray-600";
                const botCode = deptCfg?.bot || "CEOB";
                const botAvatar = BOT_AVATAR[botCode];
                return (
                  <div key={dept} className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
                    {/* Department header */}
                    <div className={cn("bg-gradient-to-r px-4 py-3 flex items-center gap-3", gradient)}>
                      {botAvatar ? (
                        <img src={botAvatar} alt={botCode} className="w-9 h-9 rounded-lg object-cover shrink-0 ring-1 ring-white/30" />
                      ) : (
                        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                          <LayoutGrid className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white">{deptCfg?.label || dept}</h3>
                        <p className="text-[9px] text-white/60">{items.length} diagnostic{items.length !== 1 ? "s" : ""} disponible{items.length !== 1 ? "s" : ""}</p>
                      </div>
                      <Badge className="text-[9px] bg-white/20 text-white border-0">{items.length}</Badge>
                    </div>
                    {/* Diagnostic cards inside department */}
                    <div className="p-3 grid grid-cols-2 gap-2.5">
                      {items.map(diag => (
                        <Card
                          key={diag.id}
                          className="p-3 hover:shadow-md transition-shadow cursor-pointer group border border-gray-100"
                          onClick={() => handleFocus(`Diagnostic ${diag.titre}`, "diagnostic_enrichi", diag, diag.bot_primaire)}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={cn("w-7 h-7 rounded-lg bg-gradient-to-r flex items-center justify-center shrink-0 mt-0.5", BOT_GRADIENTS[diag.bot_primaire] || "from-gray-500 to-gray-600")}>
                              <Stethoscope className="h-3.5 w-3.5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-blue-600">{diag.titre}</h4>
                              <p className="text-[9px] text-gray-500 line-clamp-2 leading-relaxed mt-0.5">{diag.description}</p>
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 font-medium">{diag.duree_minutes} min</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{diag.nb_questions} q.</span>
                                {diag.data_points?.length > 0 && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600">{diag.data_points.length} KPIs</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

    </PageLayout>
  );
}
