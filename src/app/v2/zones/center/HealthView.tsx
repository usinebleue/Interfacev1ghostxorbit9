/**
 * HealthView.tsx — Sante Globale de l'entreprise
 * VITAA Radar (5 piliers) avec benchmark integre + Triangle du Feu + Diagnostics
 * Layout 2 colonnes — pas de gros blocs empiles
 */

import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { cn } from "../../../components/ui/utils";
import {
  Heart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  ShieldCheck,
  Cpu,
  Factory,
  Truck,
  Package,
  Zap,
  BarChart3,
  FileSearch,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  Users,
} from "lucide-react";
import { useFrameMaster } from "../../context/FrameMasterContext";

/* ============ VITAA DATA (avec benchmark integre) ============ */
const VITAA_PILLARS = [
  { pilier: "V", label: "Vente", score: 72, avg: 65, color: "bg-blue-500", description: "Revenus, pipeline, positionnement" },
  { pilier: "I", label: "Idee", score: 45, avg: 55, color: "bg-purple-500", description: "Innovation, PI, potentiel disruption" },
  { pilier: "T", label: "Temps", score: 88, avg: 70, color: "bg-emerald-500", description: "Capacite equipe, efficacite processus" },
  { pilier: "A", label: "Argent", score: 31, avg: 50, color: "bg-amber-500", description: "Tresorerie, capacite investissement" },
  { pilier: "A2", label: "Actif", score: 62, avg: 60, color: "bg-red-500", description: "Equipements, infra numerique, PI" },
];

/* ============ VITAA BAR (avec benchmark) ============ */
function VitaaBar({ pilier, score, avg, label, color, description }: {
  pilier: string; score: number; avg: number; label: string; color: string; description: string;
}) {
  const letter = pilier === "A2" ? "A" : pilier;
  const status = score < 35 ? "critique" : score < 50 ? "risque" : "sain";
  const statusBadge = status === "critique" ? "text-red-600 bg-red-50" : status === "risque" ? "text-amber-600 bg-amber-50" : "text-green-600 bg-green-50";
  const StatusIcon = score >= 70 ? TrendingUp : score >= 45 ? Minus : TrendingDown;
  const statusColor = score >= 70 ? "text-green-500" : score >= 45 ? "text-gray-400" : "text-red-500";

  return (
    <div className="py-2">
      <div className="flex items-center gap-2 mb-1">
        <div className={cn("w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0", color)}>{letter}</div>
        <span className="text-sm font-medium text-gray-800 flex-1">{label}</span>
        <span className={cn("text-xs font-bold", score >= avg ? "text-green-600" : "text-red-600")}>{score}</span>
        <span className="text-[10px] text-gray-400">/ {avg} sect.</span>
        <StatusIcon className={cn("h-3 w-3", statusColor)} />
        <Badge variant="outline" className={cn("text-[8px] px-1.5", statusBadge)}>{status}</Badge>
      </div>
      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden ml-8">
        <div className="h-full rounded-full bg-gray-200/80 absolute" style={{ width: `${avg}%` }} />
        <div className={cn("h-full rounded-full absolute", color)} style={{ width: `${score}%` }} />
      </div>
      <p className="text-[10px] text-gray-400 ml-8 mt-0.5">{description}</p>
    </div>
  );
}

/* ============ TRIANGLE DU FEU ============ */
function TriangleDuFeu({ criticalCount }: { criticalCount: number }) {
  const status = criticalCount >= 3 ? "brule" : criticalCount === 2 ? "couve" : criticalCount === 1 ? "meurt" : "eteint";
  const configs = {
    brule: { label: "BRULE", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: Flame, desc: "3+ piliers en risque — ACTION IMMEDIATE" },
    couve: { label: "COUVE", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle, desc: "2 piliers en risque — SURVEILLER" },
    meurt: { label: "MEURT", color: "text-orange-600", bg: "bg-orange-50 border-orange-200", icon: TrendingDown, desc: "1 pilier critique — INTERVENTION" },
    eteint: { label: "SAIN", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: CheckCircle2, desc: "Tous piliers sains — MAINTENIR" },
  };
  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={cn("rounded-lg border p-3 flex items-center gap-3", config.bg)}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white shadow-sm shrink-0">
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn("text-sm font-bold", config.color)}>Triangle du Feu: {config.label}</span>
        <p className="text-[10px] text-gray-500 mt-0.5">{config.desc}</p>
      </div>
      <Badge variant="outline" className={cn("text-[9px] shrink-0", config.color)}>{criticalCount} risque{criticalCount !== 1 ? "s" : ""}</Badge>
    </div>
  );
}

/* ============ DATA ============ */
const QUICK_WINS = [
  { text: "Revoir la structure de couts — 15K$ de potentiel", bot: "CFO", priority: "haute" },
  { text: "Augmenter capacite Innovation — pilier I faible (45)", bot: "CTO", priority: "haute" },
  { text: "Consolider tresorerie — Argent critique (31)", bot: "CFO", priority: "critique" },
  { text: "Optimiser utilisation des actifs existants", bot: "COO", priority: "moyenne" },
];

const DIAGNOSTICS = [
  { id: "ia", title: "IA & Automatisation", description: "Maturite IA, processus automatisables, gains potentiels", icon: Cpu, color: "text-violet-600", bgColor: "bg-violet-50", borderColor: "border-violet-200", status: "disponible" as const, duration: "20 min", value: "5-15K$" },
  { id: "securite", title: "Securite", description: "Cybersecurite, vulnerabilites, conformite NIST/ISO", icon: ShieldCheck, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", status: "disponible" as const, duration: "30 min", value: "Actifs critiques" },
  { id: "robotique", title: "Robotique & 4.0", description: "Potentiel robotisation, ROI par cellule", icon: Factory, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", status: "disponible" as const, duration: "25 min", value: "ROI 18 mois" },
  { id: "logistique", title: "Logistique", description: "Chaine d'approvisionnement, stocks, flux", icon: Truck, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", status: "disponible" as const, duration: "20 min", value: "-10-25% couts" },
  { id: "emballage", title: "Fins de Lignes", description: "Efficacite lignes, taux defaut, emballage", icon: Package, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200", status: "bientot" as const, duration: "15 min", value: "+15-30%" },
  { id: "energie", title: "Energetique", description: "Consommation, optimisation, subventions", icon: Zap, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200", status: "bientot" as const, duration: "15 min", value: "-8-20% facture" },
];

const STATUS_CONFIG = {
  disponible: { label: "Dispo", color: "bg-green-100 text-green-700 border-green-300" },
  complete: { label: "Fait", color: "bg-blue-100 text-blue-700 border-blue-300" },
  bientot: { label: "Bientot", color: "bg-gray-100 text-gray-600 border-gray-300" },
};

const DEPT_SCORES = [
  { label: "Direction (CEO)", score: 92 },
  { label: "Finance (CFO)", score: 88 },
  { label: "Technologie (CTO)", score: 85 },
  { label: "Strategie (CSO)", score: 82 },
  { label: "Vente (CRO)", score: 80 },
  { label: "Marketing (CMO)", score: 78 },
  { label: "Innovation (CPO)", score: 76 },
  { label: "Production", score: 74 },
  { label: "Operations (COO)", score: 71 },
  { label: "Legal", score: 69 },
  { label: "RH (CHRO)", score: 65 },
  { label: "Securite", score: 58 },
].sort((a, b) => b.score - a.score);

/* ============ HEALTH VIEW ============ */
export function HealthView() {
  const { setActiveView } = useFrameMaster();
  const scoreGlobal = Math.round(VITAA_PILLARS.reduce((s, p) => s + p.score, 0) / VITAA_PILLARS.length);
  const criticalCount = VITAA_PILLARS.filter(p => p.score < 50).length;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3 max-w-5xl mx-auto pb-12">

        {/* ── ROW 1: Score global header (compact) ── */}
        <Card className="p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-3 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-white">Bilan de Sante VITAA</h2>
              <p className="text-[10px] text-white/70">5 piliers · Benchmark sectoriel integre</p>
            </div>
            <div className="text-right shrink-0">
              <span className={cn("text-3xl font-bold", scoreGlobal >= 70 ? "text-green-300" : scoreGlobal >= 50 ? "text-amber-300" : "text-red-300")}>{scoreGlobal}</span>
              <span className="text-sm text-white/60">/100</span>
            </div>
          </div>
          <div className="px-4 py-2">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-green-500 rounded-full" style={{ width: `${scoreGlobal}%` }} />
            </div>
          </div>
        </Card>

        {/* ── ROW 2: VITAA bars (gauche) + Triangle + Quick Wins (droite) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {/* VITAA bars avec benchmark — prend 3 cols */}
          <Card className="p-0 overflow-hidden lg:col-span-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-500">
              <BarChart3 className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">VITAA — Toi vs Secteur</span>
              <div className="ml-auto flex items-center gap-2">
                <span className="flex items-center gap-1 text-[9px] text-white/70"><span className="w-2 h-2 rounded-full bg-white/50" /> Secteur</span>
                <span className="flex items-center gap-1 text-[9px] text-white/70"><span className="w-2 h-2 rounded-full bg-white" /> Toi</span>
              </div>
            </div>
            <div className="px-3 py-1 divide-y divide-gray-50">
              {VITAA_PILLARS.map((p) => (
                <VitaaBar key={p.pilier} {...p} />
              ))}
            </div>
          </Card>

          {/* Colonne droite: Triangle + Quick Wins — prend 2 cols */}
          <div className="lg:col-span-2 space-y-3">
            {/* Triangle du Feu */}
            <TriangleDuFeu criticalCount={criticalCount} />

            {/* Quick Wins */}
            <Card className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Actions Rapides</span>
                <Badge className="ml-auto bg-white/20 text-white border-white/30 text-[9px]" variant="outline">{QUICK_WINS.length}</Badge>
              </div>
              <div className="p-3 space-y-2">
                {QUICK_WINS.map((qw, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                      qw.priority === "critique" ? "bg-red-500" : qw.priority === "haute" ? "bg-amber-500" : "bg-blue-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-tight">{qw.text}</p>
                      <p className="text-[10px] text-gray-400">{qw.bot}</p>
                    </div>
                    <button
                      onClick={() => setActiveView("live-chat")}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 cursor-pointer shrink-0"
                    >
                      Go <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* ── ROW 3: 3 Benchmark types ── */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
              <BarChart3 className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Externe</span>
            </div>
            <div className="p-3">
              <p className="text-[11px] text-gray-500 leading-tight">Competiteurs et mediane sectorielle de ton industrie.</p>
              <Button size="sm" variant="outline" className="text-[10px] mt-2 gap-1 h-7"><Eye className="h-3 w-3" /> Rapport</Button>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <Users className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Pairs</span>
            </div>
            <div className="p-3">
              <p className="text-[11px] text-gray-500 leading-tight">8 membres de ton Cercle Orbit9 (anonymise).</p>
              <Button size="sm" variant="outline" className="text-[10px] mt-2 gap-1 h-7"><Eye className="h-3 w-3" /> Rapport</Button>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
              <TrendingUp className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Historique</span>
            </div>
            <div className="p-3">
              <p className="text-[11px] text-gray-500 leading-tight">Ta trajectoire sur 6 mois. Mesure ta progression.</p>
              <Button size="sm" variant="outline" className="text-[10px] mt-2 gap-1 h-7"><Eye className="h-3 w-3" /> Rapport</Button>
            </div>
          </Card>
        </div>

        {/* ── ROW 4: Diagnostics (gauche) + Departements (droite) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Diagnostics */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-violet-100 to-indigo-100 px-3 py-2 border-b border-violet-200 flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-bold text-violet-900">Diagnostics</span>
              <Badge variant="outline" className="ml-auto text-[9px] text-violet-600 bg-violet-50 border-violet-300">{DIAGNOSTICS.length}</Badge>
            </div>
            <div className="p-3 space-y-2">
              {DIAGNOSTICS.map((diag) => {
                const Icon = diag.icon;
                const statusCfg = STATUS_CONFIG[diag.status];
                return (
                  <div key={diag.id} className={cn(
                    "flex items-center gap-2.5 p-2 rounded-lg border transition-shadow",
                    diag.status === "disponible" ? "hover:shadow-sm cursor-pointer bg-white" : "opacity-60 bg-gray-50"
                  )}>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", diag.bgColor)}>
                      <Icon className={cn("h-4 w-4", diag.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-800 truncate">{diag.title}</span>
                        <Badge variant="outline" className={cn("text-[8px] px-1 shrink-0", statusCfg.color)}>{statusCfg.label}</Badge>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate">{diag.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-gray-400 flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{diag.duration}</span>
                      <span className="text-[9px] font-medium text-gray-500">{diag.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scores par departement */}
          <Card className="p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-500 px-3 py-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Departements</span>
            </div>
            <div className="px-3 py-2 space-y-1.5">
              {DEPT_SCORES.map((d) => {
                const color = d.score >= 80 ? "bg-green-500" : d.score >= 60 ? "bg-amber-500" : "bg-red-500";
                const textColor = d.score >= 80 ? "text-green-600" : d.score >= 60 ? "text-amber-600" : "text-red-600";
                return (
                  <div key={d.label} className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-700 w-28 truncate">{d.label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", color)} style={{ width: `${d.score}%` }} />
                    </div>
                    <span className={cn("text-[11px] font-bold w-8 text-right", textColor)}>{d.score}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

      </div>
    </ScrollArea>
  );
}
