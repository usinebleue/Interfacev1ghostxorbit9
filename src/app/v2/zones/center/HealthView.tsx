/**
 * HealthView.tsx — Sante Globale de l'entreprise
 * 3 Tabs: Etat de sante | Diagnostics | Par departement
 * Double bot supprime — CarlOSPresence gere le bandeau d'accueil
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
} from "lucide-react";
import { useCanvasActions } from "../../context/CanvasActionContext";
import { PageLayout } from "./layouts/PageLayout";
import { BOT_AVATAR } from "../../api/types";
import { api } from "../../api/client";
import type { DiagnosticCatalogue } from "../../api/types";

/* ============ BOT GRADIENTS (same as Pipeline) ============ */
const BOT_GRADIENTS: Record<string, string> = {
  BCO: "from-blue-600 to-blue-500",
  BCT: "from-violet-600 to-violet-500",
  BCF: "from-emerald-600 to-emerald-500",
  BCM: "from-pink-600 to-pink-500",
  BCS: "from-red-600 to-red-500",
  BOO: "from-orange-600 to-orange-500",
  BFA: "from-amber-600 to-amber-500",
  BHR: "from-teal-600 to-teal-500",
  BIO: "from-rose-600 to-rose-500",
  BRO: "from-amber-600 to-amber-500",
  BLE: "from-indigo-600 to-indigo-500",
  BSE: "from-gray-600 to-gray-500",
};

/* ============ DEPT LABELS ============ */
const DEPT_LABELS: Record<string, { label: string; gradient: string; bot: string }> = {
  direction:   { label: "Direction (CEO)",     gradient: "from-slate-700 to-slate-600",   bot: "BCO" },
  finance:     { label: "Finance (CFO)",       gradient: "from-emerald-600 to-teal-500",  bot: "BCF" },
  technologie: { label: "Technologie (CTO)",   gradient: "from-blue-700 to-indigo-600",   bot: "BCT" },
  marketing:   { label: "Marketing (CMO)",     gradient: "from-fuchsia-600 to-pink-500",  bot: "BCM" },
  strategie:   { label: "Strategie (CSO)",     gradient: "from-violet-700 to-purple-600", bot: "BCS" },
  operations:  { label: "Operations (COO)",    gradient: "from-orange-600 to-orange-500", bot: "BOO" },
  production:  { label: "Production (CPO)",    gradient: "from-slate-600 to-slate-500",   bot: "BFA" },
  rh:          { label: "RH (CHRO)",           gradient: "from-teal-600 to-teal-500",     bot: "BHR" },
  innovation:  { label: "Innovation (CINO)",   gradient: "from-rose-600 to-rose-500",     bot: "BIO" },
  ventes:      { label: "Ventes (CRO)",        gradient: "from-amber-600 to-amber-500",   bot: "BRO" },
  legal:       { label: "Legal (CLO)",         gradient: "from-indigo-600 to-indigo-500", bot: "BLE" },
  securite:    { label: "Securite (CISO)",     gradient: "from-zinc-700 to-zinc-600",     bot: "BSE" },
};

/* ============ VITAA DATA ============ */
const VITAA = [
  { letter: "V", label: "Vente", score: 72, avg: 65, color: "bg-blue-500" },
  { letter: "I", label: "Idee", score: 45, avg: 55, color: "bg-purple-500" },
  { letter: "T", label: "Temps", score: 88, avg: 70, color: "bg-emerald-500" },
  { letter: "A", label: "Argent", score: 31, avg: 50, color: "bg-amber-500" },
  { letter: "A", label: "Actif", score: 62, avg: 60, color: "bg-red-500" },
];

const SCORE_GLOBAL = Math.round(VITAA.reduce((s, p) => s + p.score, 0) / VITAA.length);
const CRITIQUES = VITAA.filter(p => p.score < 50).length;
const TRIANGLE_STATUS = CRITIQUES >= 3 ? "BRULE" : CRITIQUES === 2 ? "COUVE" : CRITIQUES === 1 ? "MEURT" : "SAIN";

/* ============ QUICK WINS ============ */
const QUICK_WINS = [
  { text: "Consolider tresorerie — Argent critique (31)", bot: "CFO", priority: "critique" as const },
  { text: "Augmenter capacite Innovation — pilier I (45)", bot: "CTO", priority: "haute" as const },
  { text: "Revoir structure de couts — 15K$ potentiel", bot: "CFO", priority: "haute" as const },
  { text: "Optimiser utilisation des actifs existants", bot: "COO", priority: "moyenne" as const },
];

/* ============ DEPARTEMENTS ============ */
const DEPT_SCORES = [
  { label: "Direction",   score: 92 },
  { label: "Finance",     score: 88 },
  { label: "Techno",      score: 85 },
  { label: "Strategie",   score: 82 },
  { label: "Vente",       score: 80 },
  { label: "Marketing",   score: 78 },
  { label: "Innovation",  score: 76 },
  { label: "Production",  score: 74 },
  { label: "Operations",  score: 71 },
  { label: "Legal",       score: 69 },
  { label: "RH",          score: 65 },
  { label: "Securite",    score: 58 },
].sort((a, b) => b.score - a.score);

/* ============ KPI CARD ============ */
function KpiCard({ icon: Icon, label, value, sub, gradient, onClick }: {
  icon: React.ElementType; label: string; value: string; sub: string; gradient: string; onClick?: () => void;
}) {
  return (
    <Card
      className={cn("p-0 overflow-hidden transition-shadow", onClick && "cursor-pointer hover:shadow-lg hover:ring-1 hover:ring-blue-300")}
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
  Vente: "BCS", Idee: "BIO", Temps: "BOO", Argent: "BCF", Actif: "BOO",
};

/* Mapping role → bot code */
const QW_BOT_CODE: Record<string, string> = {
  CFO: "BCF", CTO: "BCT", COO: "BOO", CEO: "BCO", CRO: "BRO",
};

/* ============ TABS ============ */
type HealthTab = "etat" | "diagnostics" | "departements";
const HEALTH_TABS: { id: HealthTab; label: string; icon: React.ElementType }[] = [
  { id: "etat", label: "Etat de sante", icon: Activity },
  { id: "diagnostics", label: "Diagnostics", icon: Stethoscope },
  { id: "departements", label: "Par departement", icon: LayoutGrid },
];

/* ============ HEALTH VIEW ============ */
export function HealthView() {
  const { dispatch } = useCanvasActions();
  const [activeTab, setActiveTab] = useState<HealthTab>("etat");
  const [diagnosticsEnrichis, setDiagnosticsEnrichis] = useState<DiagnosticCatalogue[]>([]);
  const [diagFilter, setDiagFilter] = useState<string | null>(null);
  const [diagBotFilter, setDiagBotFilter] = useState<string | null>(null);

  useEffect(() => {
    api.listDiagnosticsEnrichis().then(d => setDiagnosticsEnrichis(d || [])).catch(() => {});
  }, []);

  const handleFocus = (title: string, elementType: string, data: unknown, bot = "BCO") => {
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

  return (
    <PageLayout maxWidth="5xl" spacing="space-y-2.5">

        {/* ── GRADIENT HEADER + TABS (Pipeline pattern) ── */}
        <div className={cn("bg-gradient-to-r rounded-xl p-4 transition-all duration-300",
          activeTab === "etat" ? "from-orange-600 to-amber-500" :
          activeTab === "diagnostics" ? "from-violet-600 to-purple-500" :
          "from-emerald-600 to-teal-500"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Sante Globale</h2>
                <p className="text-sm text-white/70">
                  {activeTab === "etat" ? "Vue d'ensemble de votre entreprise" :
                   activeTab === "diagnostics" ? `${diagnosticsEnrichis.length} diagnostics disponibles` :
                   `${diagByDept.length} departements analyses`}
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
                    {tab.id === "diagnostics" && diagnosticsEnrichis.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20">{diagnosticsEnrichis.length}</span>
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
            onClick={() => handleFocus("Score VITAA Global", "health_vitaa", VITAA, "BCO")}
          />
          <KpiCard
            icon={CRITIQUES >= 2 ? Flame : CRITIQUES === 1 ? AlertTriangle : CheckCircle2}
            label="Triangle du Feu"
            value={TRIANGLE_STATUS}
            sub={`${CRITIQUES} pilier${CRITIQUES !== 1 ? "s" : ""} en risque`}
            gradient={cn("bg-gradient-to-r", CRITIQUES >= 2 ? "from-red-600 to-red-500" : CRITIQUES === 1 ? "from-amber-600 to-amber-500" : "from-green-600 to-green-500")}
            onClick={() => handleFocus("Triangle du Feu", "health_triangle", { status: TRIANGLE_STATUS, critiques: CRITIQUES, vitaa: VITAA }, "BCO")}
          />
          <KpiCard
            icon={BarChart3}
            label="vs Secteur"
            value={VITAA.filter(p => p.score >= p.avg).length + "/5"}
            sub="Piliers au-dessus moyenne"
            gradient="bg-gradient-to-r from-violet-600 to-violet-500"
            onClick={() => handleFocus("Benchmark vs Secteur", "health_benchmark", VITAA, "BCS")}
          />
          <KpiCard
            icon={TrendingUp}
            label="Departements"
            value={`${DEPT_SCORES[0].score}%`}
            sub={`Meilleur: ${DEPT_SCORES[0].label}`}
            gradient="bg-gradient-to-r from-slate-700 to-slate-600"
            onClick={() => handleFocus("Scores Départements", "health_depts", DEPT_SCORES, "BCO")}
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
                  onClick={() => handleFocus(`${p.label} — Pilier VITAA (${p.score}/100)`, "vitaa_pillar", p, VITAA_BOT[p.label] || "BCO")}
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
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden ml-7">
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
              {QUICK_WINS.map((qw, i) => (
                <div
                  key={i}
                  className="cursor-pointer group rounded-lg hover:bg-red-50 px-2 py-1.5 -mx-1 transition-colors border border-transparent hover:border-red-100"
                  onClick={() => handleFocus(qw.text, "quick_win", qw, QW_BOT_CODE[qw.bot] || "BCO")}
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
              {DEPT_SCORES.map((d) => {
                const color = d.score >= 80 ? "bg-green-500" : d.score >= 60 ? "bg-amber-500" : "bg-red-500";
                const textColor = d.score >= 80 ? "text-green-600" : d.score >= 60 ? "text-amber-600" : "text-red-600";
                return (
                  <div key={d.label} className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-700 w-16 truncate">{d.label}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
        {/* TAB 2 — DIAGNOSTICS (43 enrichis from API) */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === "diagnostics" && (
          <div className="space-y-3">
            {/* Filtre par departement */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setDiagFilter(null)}
                className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer", !diagFilter ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
              >
                Tous ({diagnosticsEnrichis.length})
              </button>
              {diagDepts.map(dept => (
                <button key={dept} onClick={() => setDiagFilter(dept === diagFilter ? null : dept)}
                  className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer", diagFilter === dept ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
                >
                  {DEPT_LABELS[dept]?.label || dept} ({diagnosticsEnrichis.filter(d => d.departement === dept).length})
                </button>
              ))}
            </div>

            {/* Filtre par bot (agent AI) */}
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-[9px] text-gray-400 font-medium py-1">Agent AI:</span>
              <button
                onClick={() => setDiagBotFilter(null)}
                className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer", !diagBotFilter ? "bg-blue-600 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
              >
                Tous
              </button>
              {diagBots.map(bot => {
                const avatar = BOT_AVATAR[bot];
                return (
                  <button key={bot} onClick={() => setDiagBotFilter(bot === diagBotFilter ? null : bot)}
                    className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1", diagBotFilter === bot ? "bg-blue-600 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
                  >
                    {avatar && <img src={avatar} alt={bot} className="w-3.5 h-3.5 rounded-full object-cover" />}
                    {bot} ({diagnosticsEnrichis.filter(d => d.bot_primaire === bot).length})
                  </button>
                );
              })}
            </div>

            {/* Grille diagnostics */}
            <div className="grid grid-cols-2 gap-3">
              {filteredDiag.map(diag => {
                const deptCfg = DEPT_LABELS[diag.departement];
                const gradient = diag.gradient || deptCfg?.gradient || "from-gray-500 to-gray-600";
                const botGradient = BOT_GRADIENTS[diag.bot_primaire] || gradient;
                const botAvatar = BOT_AVATAR[diag.bot_primaire];
                const dpCount = diag.data_points?.length || 0;
                return (
                  <Card key={diag.id} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group" onClick={() => handleFocus(`Diagnostic ${diag.titre}`, "diagnostic_enrichi", diag, diag.bot_primaire)}>
                    <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center gap-2.5", botGradient)}>
                      {botAvatar ? (
                        <img src={botAvatar} alt={diag.bot_primaire} className="w-8 h-8 rounded-lg object-cover shrink-0 ring-1 ring-white/30" />
                      ) : (
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                          <Stethoscope className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{diag.titre}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-white/60">{deptCfg?.label || diag.departement}</span>
                          <span className="text-[9px] text-white/40">— Leader</span>
                        </div>
                      </div>
                      {dpCount > 0 && <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full shrink-0">{dpCount} indicateurs</span>}
                    </div>
                    <div className="px-3 py-2.5 space-y-2">
                      <p className="text-[9px] text-gray-500 line-clamp-2 leading-relaxed">{diag.description}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 font-medium">{diag.duree_minutes} min</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{diag.nb_questions} questions</span>
                      </div>
                      {diag.valeur_potentielle && (
                        <p className="text-[9px] text-emerald-600 leading-relaxed line-clamp-1">{diag.valeur_potentielle}</p>
                      )}
                      {diag.gaps_typiques && diag.gaps_typiques.length > 0 && (
                        <div className="text-[9px] text-amber-600 bg-amber-50 rounded px-2 py-1">
                          Gap: {diag.gaps_typiques[0].gap.slice(0, 80)}...
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            {filteredDiag.length === 0 && (
              <div className="text-center py-12">
                <Stethoscope className="h-5 w-5 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun diagnostic trouve</p>
                <p className="text-[9px] text-gray-400 mt-1">Modifiez les filtres pour voir les diagnostics disponibles</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB 3 — PAR DEPARTEMENT (grouped)          */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === "departements" && (
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
                const botCode = deptCfg?.bot || "BCO";
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
