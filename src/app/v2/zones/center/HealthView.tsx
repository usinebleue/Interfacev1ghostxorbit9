/**
 * HealthView.tsx — Sante Globale de l'entreprise
 * VITAA Radar (5 piliers) + Triangle du Feu + Diagnostics disponibles
 * Sprint B — Enrichi avec concepts Bible Produit
 */

import { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
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
} from "lucide-react";
import { useFrameMaster } from "../../context/FrameMasterContext";

/* ============ VITAA PILLAR BAR ============ */
function VitaaBar({ pilier, score, label, description }: {
  pilier: string;
  score: number;
  label: string;
  description: string;
}) {
  const barColor = score >= 70 ? "bg-green-500" : score >= 45 ? "bg-amber-500" : "bg-red-500";
  const scoreColor = score >= 70 ? "text-green-600" : score >= 45 ? "text-amber-600" : "text-red-600";
  const statusIcon = score >= 70 ? TrendingUp : score >= 45 ? Minus : TrendingDown;
  const StatusIcon = statusIcon;
  const statusColor = score >= 70 ? "text-green-500" : score >= 45 ? "text-gray-400" : "text-red-500";

  return (
    <div className="py-2.5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-gray-500 w-6">{pilier}</span>
        <span className="text-sm font-medium text-gray-800 flex-1">{label}</span>
        <StatusIcon className={cn("h-3.5 w-3.5", statusColor)} />
        <span className={cn("text-sm font-bold w-10 text-right", scoreColor)}>{score}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-6" />
        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", barColor)}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <p className="text-[10px] text-gray-400 ml-8 mt-0.5">{description}</p>
    </div>
  );
}

/* ============ TRIANGLE DU FEU ============ */
function TriangleDuFeu({ criticalCount }: { criticalCount: number }) {
  const status = criticalCount >= 3 ? "brule" : criticalCount === 2 ? "couve" : criticalCount === 1 ? "meurt" : "eteint";
  const configs = {
    brule: { label: "BRULE", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: Flame, desc: "3+ piliers en risque — ACTION IMMEDIATE REQUISE" },
    couve: { label: "COUVE", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle, desc: "2 piliers en risque — SURVEILLER DE PRES" },
    meurt: { label: "MEURT", color: "text-orange-600", bg: "bg-orange-50 border-orange-200", icon: TrendingDown, desc: "1 pilier critique — INTERVENTION CIBLEE" },
    eteint: { label: "SAIN", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: CheckCircle2, desc: "Tous les piliers sains — MAINTENIR LE CAP" },
  };
  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={cn("rounded-lg border p-3 flex items-center gap-3", config.bg)}>
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-white shadow-sm")}>
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-bold", config.color)}>Triangle du Feu: {config.label}</span>
          <Badge variant="outline" className={cn("text-[9px]", config.color)}>{criticalCount} pilier{criticalCount !== 1 ? "s" : ""} en risque</Badge>
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5">{config.desc}</p>
      </div>
    </div>
  );
}

/* ============ DIAGNOSTIC BOX ============ */
interface DiagnosticConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  status: "disponible" | "complete" | "bientot";
  duration: string;
  value: string;
}

const DIAGNOSTICS: DiagnosticConfig[] = [
  {
    id: "ia", title: "Diagnostic IA & Automatisation",
    description: "Evaluez votre maturite IA, identifiez les processus automatisables et estimez les gains potentiels",
    icon: Cpu, color: "text-violet-600", bgColor: "bg-violet-50", borderColor: "border-violet-200",
    status: "disponible", duration: "20 min", value: "Valeur: 5-15K$ en optimisation"
  },
  {
    id: "securite", title: "Diagnostic Securite",
    description: "Audit de cybersecurite, vulnerabilites, conformite NIST/ISO 27001, plan de remediation",
    icon: ShieldCheck, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200",
    status: "disponible", duration: "30 min", value: "Protection: actifs numeriques critiques"
  },
  {
    id: "robotique", title: "Diagnostic Robotique & 4.0",
    description: "Potentiel de robotisation, ROI par cellule, integration avec systemes existants",
    icon: Factory, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200",
    status: "disponible", duration: "25 min", value: "ROI moyen: 18 mois"
  },
  {
    id: "logistique", title: "Diagnostic Logistique",
    description: "Chaine d'approvisionnement, gestion de stocks, optimisation des flux et transport",
    icon: Truck, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200",
    status: "disponible", duration: "20 min", value: "Reduction couts: 10-25%"
  },
  {
    id: "emballage", title: "Fins de Lignes & Emballage",
    description: "Efficacite des lignes de production, taux de defaut, automatisation emballage",
    icon: Package, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200",
    status: "bientot", duration: "15 min", value: "Gains productivite: 15-30%"
  },
  {
    id: "energie", title: "Diagnostic Energetique",
    description: "Consommation energetique, optimisation, programmes de subventions disponibles",
    icon: Zap, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200",
    status: "bientot", duration: "15 min", value: "Economies: 8-20% facture energie"
  },
];

const STATUS_CONFIG = {
  disponible: { label: "Disponible", color: "bg-green-100 text-green-700 border-green-300" },
  complete: { label: "Complete", color: "bg-blue-100 text-blue-700 border-blue-300" },
  bientot: { label: "Bientot", color: "bg-gray-100 text-gray-600 border-gray-300" },
};

/* ============ VITAA DATA ============ */
const VITAA_PILLARS = [
  { pilier: "V", label: "Vente", score: 72, description: "Capacite de generation de revenus, pipeline, positionnement marche" },
  { pilier: "I", label: "Idee", score: 45, description: "Innovation, PI, idees strategiques, potentiel de disruption" },
  { pilier: "T", label: "Temps", score: 88, description: "Heures operationnelles, capacite equipe, efficacite processus" },
  { pilier: "A", label: "Argent", score: 31, description: "Tresorerie, capacite investissement, reserves financieres" },
  { pilier: "A", label: "Actif", score: 62, description: "Equipements, infrastructure numerique, propriete intellectuelle" },
];

/* ============ QUICK WINS ============ */
const QUICK_WINS = [
  { text: "Revoir la structure de couts — 15K$ de potentiel identifie", bot: "CFO", priority: "haute" },
  { text: "Augmenter la capacite Innovation — pilier I faible (45/100)", bot: "CTO", priority: "haute" },
  { text: "Consolider la tresorerie — pilier Argent critique (31/100)", bot: "CFO", priority: "critique" },
  { text: "Optimiser l'utilisation des actifs existants", bot: "COO", priority: "moyenne" },
];

/* ============ HEALTH VIEW ============ */
export function HealthView() {
  const { setActiveView } = useFrameMaster();
  const scoreGlobal = Math.round(VITAA_PILLARS.reduce((s, p) => s + p.score, 0) / VITAA_PILLARS.length);
  const criticalCount = VITAA_PILLARS.filter(p => p.score < 50).length;

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-4 max-w-4xl mx-auto">

        {/* Header — Bilan de Sante VITAA */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-5 flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">Bilan de Sante VITAA</h2>
              <p className="text-sm text-white/70">5 piliers fondamentaux · Mis a jour en temps reel</p>
            </div>
            <div className="text-right">
              <span className={cn("text-4xl font-bold", scoreGlobal >= 70 ? "text-green-300" : scoreGlobal >= 50 ? "text-amber-300" : "text-red-300")}>{scoreGlobal}</span>
              <span className="text-lg text-white/60">/100</span>
            </div>
          </div>

          {/* Score global bar */}
          <div className="px-5 pt-4 pb-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Score global</span>
              <span className="text-sm font-bold text-gray-700">{scoreGlobal}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-green-500 rounded-full" style={{ width: `${scoreGlobal}%` }} />
            </div>
          </div>

          {/* VITAA Pillars */}
          <div className="px-5 pb-3 pt-1 divide-y divide-gray-50">
            {VITAA_PILLARS.map((p, i) => (
              <VitaaBar key={i} {...p} />
            ))}
          </div>

          {/* Triangle du Feu */}
          <div className="px-5 pb-4">
            <TriangleDuFeu criticalCount={criticalCount} />
          </div>
        </Card>

        {/* Quick Wins — Recommandations rapides */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-white" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Recommandations Rapides</h3>
            <Badge className="ml-auto bg-white/20 text-white border-white/30 text-[9px]" variant="outline">{QUICK_WINS.length} actions</Badge>
          </div>
          <div className="p-4 space-y-2.5">
            {QUICK_WINS.map((qw, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className={cn(
                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                  qw.priority === "critique" ? "bg-red-500" : qw.priority === "haute" ? "bg-amber-500" : "bg-blue-400"
                )} />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{qw.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Explorer avec le {qw.bot}</p>
                </div>
                <button
                  onClick={() => setActiveView("live-chat")}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer shrink-0"
                >
                  Explorer <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Diagnostics disponibles */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileSearch className="h-4 w-4 text-gray-600" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Diagnostics Disponibles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DIAGNOSTICS.map((diag) => {
              const Icon = diag.icon;
              const statusCfg = STATUS_CONFIG[diag.status];
              return (
                <Card key={diag.id} className={cn("p-4 border-l-4 transition-shadow", diag.borderColor, diag.status === "disponible" ? "hover:shadow-md cursor-pointer" : "opacity-70")}>
                  <div className="flex items-start gap-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", diag.bgColor)}>
                      <Icon className={cn("h-4.5 w-4.5", diag.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-800 truncate">{diag.title}</h3>
                        <Badge variant="outline" className={cn("text-[9px] shrink-0", statusCfg.color)}>{statusCfg.label}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{diag.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {diag.duration}
                        </span>
                        <span className="text-[10px] text-gray-400">{diag.value}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Departements — scores par departement */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-gray-600 to-gray-500 px-4 py-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-white" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Scores par Departement</h3>
          </div>
          <div className="px-5 py-3 divide-y divide-gray-50">
            {[
              { label: "Direction (CEO)", score: 92 },
              { label: "Finance (CFO)", score: 88 },
              { label: "Technologie (CTO)", score: 85 },
              { label: "Strategie (CSO)", score: 82 },
              { label: "Vente (CRO)", score: 80 },
              { label: "Marketing (CMO)", score: 78 },
              { label: "Innovation (CPO)", score: 76 },
              { label: "Production (Factory)", score: 74 },
              { label: "Operations (COO)", score: 71 },
              { label: "Legal", score: 69 },
              { label: "RH (CHRO)", score: 65 },
              { label: "Securite", score: 58 },
            ].sort((a, b) => b.score - a.score).map((d) => {
              const color = d.score >= 80 ? "bg-green-500" : d.score >= 60 ? "bg-amber-500" : "bg-red-500";
              const textColor = d.score >= 80 ? "text-green-600" : d.score >= 60 ? "text-amber-600" : "text-red-600";
              return (
                <div key={d.label} className="flex items-center gap-3 py-2">
                  <span className="text-xs text-gray-700 w-32 truncate">{d.label}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", color)} style={{ width: `${d.score}%` }} />
                  </div>
                  <span className={cn("text-xs font-bold w-10 text-right", textColor)}>{d.score}%</span>
                </div>
              );
            })}
          </div>
        </Card>

      </div>
    </ScrollArea>
  );
}
