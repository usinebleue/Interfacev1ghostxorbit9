/**
 * HealthView.tsx — Sante Globale de l'entreprise
 * Pattern: bandeau proactif + 4 KPI cards + VITAA benchmark + 4 widgets grille
 * Memes patterns que DepartmentDetailView + CockpitView
 */

import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { cn } from "../../../components/ui/utils";
import {
  Heart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Flame,
  ShieldCheck,
  Cpu,
  Factory,
  Truck,
  Package,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  Users,
  Target,
  FileSearch,
} from "lucide-react";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { BOT_AVATAR } from "../../api/types";

/* ============ VITAA DATA (avec benchmark integre) ============ */
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

/* ============ DIAGNOSTICS (priorises par besoin) ============ */
const DIAGNOSTICS = [
  { id: "ia", title: "IA & Automatisation", desc: "Maturite IA, processus automatisables", icon: Cpu, iconColor: "text-violet-500", status: "disponible" as const, duration: "20 min", value: "5-15K$", priority: 1 },
  { id: "securite", title: "Securite", desc: "Cybersecurite, conformite NIST/ISO", icon: ShieldCheck, iconColor: "text-red-500", status: "disponible" as const, duration: "30 min", value: "Actifs critiques", priority: 2 },
  { id: "robotique", title: "Robotique & 4.0", desc: "Potentiel robotisation, ROI cellule", icon: Factory, iconColor: "text-blue-500", status: "disponible" as const, duration: "25 min", value: "ROI 18 mois", priority: 3 },
  { id: "logistique", title: "Logistique", desc: "Approvisionnement, stocks, flux", icon: Truck, iconColor: "text-emerald-500", status: "disponible" as const, duration: "20 min", value: "-10-25%", priority: 4 },
  { id: "emballage", title: "Fins de Lignes", desc: "Efficacite, defauts, emballage", icon: Package, iconColor: "text-orange-500", status: "bientot" as const, duration: "15 min", value: "+15-30%", priority: 5 },
  { id: "energie", title: "Energetique", desc: "Consommation, subventions", icon: Zap, iconColor: "text-amber-500", status: "bientot" as const, duration: "15 min", value: "-8-20%", priority: 6 },
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
  { label: "Direction", code: "CEO", score: 92 },
  { label: "Finance", code: "CFO", score: 88 },
  { label: "Techno", code: "CTO", score: 85 },
  { label: "Strategie", code: "CSO", score: 82 },
  { label: "Vente", code: "CRO", score: 80 },
  { label: "Marketing", code: "CMO", score: 78 },
  { label: "Innovation", code: "CPO", score: 76 },
  { label: "Production", code: "FAC", score: 74 },
  { label: "Operations", code: "COO", score: 71 },
  { label: "Legal", code: "LEG", score: 69 },
  { label: "RH", code: "CHRO", score: 65 },
  { label: "Securite", code: "SEC", score: 58 },
].sort((a, b) => b.score - a.score);

/* ============ KPI CARD — pattern CockpitView ============ */
function KpiCard({ icon: Icon, label, value, sub, gradient }: {
  icon: React.ElementType; label: string; value: string; sub: string; gradient: string;
}) {
  return (
    <Card className="p-0 overflow-hidden">
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

/* ============ HEALTH VIEW ============ */
export function HealthView() {
  const { setActiveView } = useFrameMaster();
  const avatar = BOT_AVATAR["BCO"];

  // Message proactif base sur l'etat de sante
  const proactiveMsg = CRITIQUES >= 2
    ? `${CRITIQUES} piliers en zone critique. Argent (${VITAA[3].score}) et Idee (${VITAA[1].score}) demandent une intervention. Je recommande de commencer par la tresorerie.`
    : CRITIQUES === 1
    ? `1 pilier critique: Argent a ${VITAA[3].score}/100. Le reste tient bien. Voulez-vous explorer des pistes avec le CFO?`
    : "Tous les piliers sont stables. Score global de " + SCORE_GLOBAL + "/100. On continue sur cette lancee!";

  // Color map pour widgets (pattern DepartmentDetailView)
  const colorMap: Record<string, string> = {
    "text-red-500": "from-red-50 to-rose-50 border-red-100",
    "text-blue-500": "from-blue-50 to-indigo-50 border-blue-100",
    "text-purple-500": "from-purple-50 to-violet-50 border-purple-100",
    "text-green-500": "from-green-50 to-emerald-50 border-green-100",
    "text-orange-500": "from-orange-50 to-amber-50 border-orange-100",
    "text-violet-500": "from-violet-50 to-purple-50 border-violet-100",
    "text-emerald-500": "from-emerald-50 to-green-50 border-emerald-100",
    "text-amber-500": "from-amber-50 to-yellow-50 border-amber-100",
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-2.5 pb-12">

        {/* ── Bandeau proactif CarlOS — pattern DepartmentDetailView ── */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-3 shrink-0">
          {avatar ? (
            <img src={avatar} alt="CarlOS" className="w-7 h-7 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-7 h-7 bg-gray-200 rounded-full shrink-0" />
          )}
          <p className="text-xs text-gray-700 flex-1">
            <b>CarlOS:</b> {proactiveMsg}
          </p>
          <Button size="sm" className="h-6 text-xs shrink-0 px-2" onClick={() => setActiveView("live-chat")}>
            Explorer <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>

        {/* ── 4 KPI cards — pattern CockpitView ── */}
        <div className="grid grid-cols-4 gap-2.5">
          <KpiCard
            icon={Heart}
            label="Score VITAA"
            value={`${SCORE_GLOBAL}/100`}
            sub="Moyenne des 5 piliers"
            gradient="bg-gradient-to-r from-orange-600 to-orange-500"
          />
          <KpiCard
            icon={CRITIQUES >= 2 ? Flame : CRITIQUES === 1 ? AlertTriangle : CheckCircle2}
            label="Triangle du Feu"
            value={TRIANGLE_STATUS}
            sub={`${CRITIQUES} pilier${CRITIQUES !== 1 ? "s" : ""} en risque`}
            gradient={cn("bg-gradient-to-r", CRITIQUES >= 2 ? "from-red-600 to-red-500" : CRITIQUES === 1 ? "from-amber-600 to-amber-500" : "from-green-600 to-green-500")}
          />
          <KpiCard
            icon={BarChart3}
            label="vs Secteur"
            value={VITAA.filter(p => p.score >= p.avg).length + "/5"}
            sub="Piliers au-dessus moyenne"
            gradient="bg-gradient-to-r from-violet-600 to-violet-500"
          />
          <KpiCard
            icon={TrendingUp}
            label="Departements"
            value={`${DEPT_SCORES[0].score}%`}
            sub={`Meilleur: ${DEPT_SCORES[0].label}`}
            gradient="bg-gradient-to-r from-slate-700 to-slate-600"
          />
        </div>

        {/* ── VITAA Barres avec benchmark — compact ── */}
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-1.5 border-b border-orange-100 flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex-1">VITAA — Toi vs Secteur</span>
            <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Secteur</span>
            <span className="flex items-center gap-1 text-[9px] text-gray-400 ml-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Toi</span>
          </div>
          <div className="p-2.5 space-y-2">
            {VITAA.map((p, i) => (
              <div key={i}>
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

        {/* ── 4 Widgets grille — pattern DepartmentDetailView ── */}
        <div className="grid grid-cols-4 gap-2.5">

          {/* Widget 1: Actions Rapides (Quick Wins) */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-red-100 px-2.5 py-1.5 border-b flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex-1">Actions Prioritaires</h3>
              <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3.5">{QUICK_WINS.length}</Badge>
            </div>
            <div className="p-2.5 space-y-1.5">
              {QUICK_WINS.map((qw, i) => (
                <div key={i} className="cursor-pointer group" onClick={() => setActiveView("live-chat")}>
                  <div className="flex items-start gap-1.5">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                      qw.priority === "critique" ? "bg-red-500" : qw.priority === "haute" ? "bg-amber-500" : "bg-blue-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 group-hover:text-blue-600 leading-tight">{qw.text}</p>
                      <p className="text-[10px] text-gray-400">{qw.bot}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Diagnostics Recommandes */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-100 px-2.5 py-1.5 border-b flex items-center gap-1.5">
              <FileSearch className="h-3.5 w-3.5 text-violet-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex-1">Diagnostics</h3>
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 text-violet-600 border-violet-300">{DIAGNOSTICS.filter(d => d.status === "disponible").length}</Badge>
            </div>
            <div className="p-2.5 space-y-1.5">
              {DIAGNOSTICS.map((diag) => {
                const Icon = diag.icon;
                return (
                  <div key={diag.id} className={cn("cursor-pointer group", diag.status === "bientot" && "opacity-50")}>
                    <div className="flex items-center gap-1.5">
                      <Icon className={cn("h-3.5 w-3.5 shrink-0", diag.iconColor)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 truncate group-hover:text-blue-600">{diag.title}</p>
                        <p className="text-[10px] text-gray-400">{diag.duration} · {diag.value}</p>
                      </div>
                      <Badge variant="outline" className={cn("text-[8px] px-1 py-0 h-3.5 shrink-0",
                        diag.status === "disponible" ? "border-green-300 text-green-600" : "border-gray-300 text-gray-500"
                      )}>{diag.status === "disponible" ? "dispo" : "bientot"}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Widget 3: Benchmark (3 types) */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 px-2.5 py-1.5 border-b flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex-1">Benchmark</h3>
            </div>
            <div className="p-2.5 space-y-1.5">
              {[
                { title: "Externe", desc: "Competiteurs et mediane sectorielle", icon: BarChart3, iconColor: "text-blue-500" },
                { title: "Pairs Orbit9", desc: "8 membres de ton cercle (anonymise)", icon: Users, iconColor: "text-emerald-500" },
                { title: "Historique", desc: "Ta trajectoire sur 6 mois", icon: TrendingUp, iconColor: "text-violet-500" },
              ].map((bm) => {
                const BIcon = bm.icon;
                return (
                  <div key={bm.title} className="cursor-pointer group">
                    <div className="flex items-center gap-1.5">
                      <BIcon className={cn("h-3.5 w-3.5 shrink-0", bm.iconColor)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 group-hover:text-blue-600">{bm.title}</p>
                        <p className="text-[10px] text-gray-400">{bm.desc}</p>
                      </div>
                      <Eye className="h-3 w-3 text-gray-300 group-hover:text-blue-500 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Widget 4: Scores Departements */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100 px-2.5 py-1.5 border-b flex items-center gap-1.5">
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
