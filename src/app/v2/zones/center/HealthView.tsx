/**
 * HealthView.tsx — Sante Globale de l'entreprise
 * Layout: 4 KPI cards + VITAA|QuickWins + Diagnostics Hero + Benchmark|Depts
 * Double bot supprime — CarlOSPresence gere le bandeau d'accueil
 */

import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Card } from "../../../components/ui/card";
import { cn } from "../../../components/ui/utils";
import {
  Heart,
  AlertTriangle,
  TrendingUp,
  Flame,
  ShieldCheck,
  Cpu,
  Factory,
  Truck,
  Package,
  Zap,
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  Users,
  Target,
  FileSearch,
  ArrowRight,
} from "lucide-react";
import { useCanvasActions } from "../../context/CanvasActionContext";
import { CarlOSPresence } from "./CarlOSPresence";

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

/* ============ DIAGNOSTICS — avec gradient per-card ============ */
const DIAGNOSTICS = [
  { id: "ia",         title: "IA & Automatisation", desc: "Maturite IA, processus automatisables",    icon: Cpu,       status: "disponible" as const, duration: "20 min", value: "5-15K$",          gradient: "from-violet-600 to-indigo-500" },
  { id: "securite",   title: "Securite",             desc: "Cybersecurite, conformite NIST/ISO",       icon: ShieldCheck, status: "disponible" as const, duration: "30 min", value: "Actifs critiques", gradient: "from-red-600 to-rose-500" },
  { id: "robotique",  title: "Robotique & 4.0",      desc: "Potentiel robotisation, ROI cellule",      icon: Factory,   status: "disponible" as const, duration: "25 min", value: "ROI 18 mois",      gradient: "from-blue-600 to-cyan-500" },
  { id: "logistique", title: "Logistique",            desc: "Approvisionnement, stocks, flux",          icon: Truck,     status: "disponible" as const, duration: "20 min", value: "-10-25%",          gradient: "from-emerald-600 to-teal-500" },
  { id: "emballage",  title: "Fins de Lignes",        desc: "Efficacite, defauts, emballage",           icon: Package,   status: "bientot"    as const, duration: "15 min", value: "+15-30%",          gradient: "from-orange-500 to-amber-400" },
  { id: "energie",    title: "Energetique",           desc: "Consommation, subventions",                icon: Zap,       status: "bientot"    as const, duration: "15 min", value: "-8-20%",           gradient: "from-amber-600 to-yellow-500" },
];

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
        <div className="text-[10px] text-gray-500">{sub}</div>
      </div>
    </Card>
  );
}

/* Mapping pilier VITAA → bot */
const VITAA_BOT: Record<string, string> = {
  Vente: "BCS", Idee: "BPO", Temps: "BOO", Argent: "BCF", Actif: "BOO",
};

/* Mapping role → bot code */
const QW_BOT_CODE: Record<string, string> = {
  CFO: "BCF", CTO: "BCT", COO: "BOO", CEO: "BCO", CRO: "BRO",
};

/* ============ HEALTH VIEW ============ */
export function HealthView() {
  const { dispatch } = useCanvasActions();

  const handleFocus = (title: string, elementType: string, data: unknown, bot = "BCO") => {
    dispatch({ type: "focus", layer: "bouche", data: { title, element_type: elementType, data }, bot });
  };

  return (
    <ScrollArea className="h-full">
      <div className="max-w-5xl mx-auto px-10 py-5 space-y-2.5 pb-12">

        <CarlOSPresence />

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
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex-1">VITAA — Toi vs Secteur</span>
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
                    <span className="text-[10px] text-gray-400 w-8">/ {p.avg}</span>
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
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex-1">Actions Prioritaires</h3>
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
                      <p className="text-[10px] text-gray-400 mt-0.5">{qw.bot} · <span className={cn(
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

        {/* ── Diagnostics HERO — full width, cartes gradient sexy ── */}
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100 px-3 py-2 flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-violet-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex-1">Diagnostics Strategiques</h3>
            <Badge variant="outline" className="text-[9px] px-1.5 text-violet-600 border-violet-300">
              {DIAGNOSTICS.filter(d => d.status === "disponible").length} disponibles
            </Badge>
          </div>
          <div className="p-3 grid grid-cols-3 gap-3">
            {DIAGNOSTICS.map((diag) => {
              const Icon = diag.icon;
              const isDispo = diag.status === "disponible";
              return (
                <div
                  key={diag.id}
                  className={cn(
                    "rounded-xl overflow-hidden border transition-all duration-200",
                    isDispo
                      ? "cursor-pointer hover:shadow-xl hover:-translate-y-0.5 border-transparent shadow-md"
                      : "opacity-55 border-gray-200 shadow-sm"
                  )}
                  onClick={() => isDispo && handleFocus(`Diagnostic ${diag.title}`, "diagnostic", diag, "BCO")}
                >
                  {/* Gradient header */}
                  <div className={cn("bg-gradient-to-r px-3 py-3 flex items-center gap-2.5", diag.gradient)}>
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white leading-tight">{diag.title}</p>
                      <p className="text-[10px] text-white/70 mt-0.5 leading-tight">{diag.desc}</p>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="bg-white px-3 py-2.5 flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{diag.value}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-[10px] text-gray-500">{diag.duration}</span>
                      </div>
                    </div>
                    {isDispo ? (
                      <div className="flex items-center gap-1 bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shrink-0">
                        Lancer <ArrowRight className="h-3 w-3" />
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[9px] text-gray-400 border-gray-200 shrink-0">Bientot</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Benchmark + Departements (2 cols) ── */}
        <div className="grid grid-cols-2 gap-2.5">

          {/* Benchmark */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-2.5 py-1.5 flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex-1">Benchmark</h3>
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
                        <p className="text-[10px] text-gray-400">{bm.desc}</p>
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
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex-1">Departements</h3>
            </div>
            <div className="p-2.5 space-y-1">
              {DEPT_SCORES.map((d) => {
                const color = d.score >= 80 ? "bg-green-500" : d.score >= 60 ? "bg-amber-500" : "bg-red-500";
                const textColor = d.score >= 80 ? "text-green-600" : d.score >= 60 ? "text-amber-600" : "text-red-600";
                return (
                  <div key={d.label} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-700 w-16 truncate">{d.label}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", color)} style={{ width: `${d.score}%` }} />
                    </div>
                    <span className={cn("text-[10px] font-bold w-7 text-right", textColor)}>{d.score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </ScrollArea>
  );
}
