/**
 * MasterCapacitesPage.tsx — Capacites par Departement & ROI
 * Source: Capacites-6-Departements-GhostX.md + POTENTIEL-ANNUEL-GHOSTX-TEAM.md
 * Master GHML — Session 48
 */

import {
  Calculator, Users, DollarSign, Clock, TrendingUp,
  Briefcase, BarChart3, CheckCircle2, ArrowRight, Zap,
  Crown, Network, Building2, FileText, Brain, Shield,
  Target, PieChart, Cpu, Factory, Bot,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ======================================================================
// DATA — Capacites par departement
// ======================================================================

const DEPT_CAPACITES: {
  dept: string; bot: string; color: string; icon: React.ElementType;
  equivHumain: string; coutHumain: string; tachesCount: number;
  heuresMois: string; exemples: string[];
}[] = [
  {
    dept: "Direction", bot: "CEOB", color: "blue", icon: Crown,
    equivHumain: "CEO conseil / Coach executif", coutHumain: "100-200K$",
    tachesCount: 15, heuresMois: "80-120h",
    exemples: ["Preparation CA", "Decisions strategiques", "Vision & roadmap", "Gestion parties prenantes"],
  },
  {
    dept: "Finance", bot: "CFOB", color: "emerald", icon: DollarSign,
    equivHumain: "CFO fractionnaire", coutHumain: "150-250K$",
    tachesCount: 18, heuresMois: "100-160h",
    exemples: ["Budget annuel", "Analyse ROI projets", "Tresorerie", "Subventions & financement"],
  },
  {
    dept: "Technologie", bot: "CTOB", color: "violet", icon: Cpu,
    equivHumain: "CTO fractionnaire", coutHumain: "150-300K$",
    tachesCount: 16, heuresMois: "120-180h",
    exemples: ["Architecture techno", "Selection fournisseurs", "Cybersecurite", "Automatisation"],
  },
  {
    dept: "Marketing", bot: "CMOB", color: "pink", icon: Target,
    equivHumain: "Directeur marketing", coutHumain: "120-200K$",
    tachesCount: 14, heuresMois: "100-160h",
    exemples: ["Strategie marketing", "Generation leads", "Positionnement", "Campagnes"],
  },
  {
    dept: "Strategie", bot: "CSOB", color: "red", icon: TrendingUp,
    equivHumain: "Consultant strategie", coutHumain: "120-200K$",
    tachesCount: 12, heuresMois: "80-120h",
    exemples: ["Analyse concurrentielle", "Plan strategique", "Diversification", "M&A screening"],
  },
  {
    dept: "Operations", bot: "COOB", color: "orange", icon: Factory,
    equivHumain: "Directeur operations", coutHumain: "120-200K$",
    tachesCount: 15, heuresMois: "120-200h",
    exemples: ["Optimisation processus", "Gestion qualite", "Lean manufacturing", "Chaine d'approvisionnement"],
  },
];

// ======================================================================
// DATA — 7 Angles Inexploites
// ======================================================================

const ANGLES_INEXPLOITES = [
  { name: "BaaS pour REAI", desc: "Bot-as-a-Service pour les 130+ membres du REAI", potentiel: "500K$/an" },
  { name: "API GhostX", desc: "API publique pour integrateurs et developpeurs tiers", potentiel: "200K$/an" },
  { name: "Audit Maturite", desc: "Diagnostic IA payant pour entreprises non-clientes", potentiel: "300K$/an" },
  { name: "Processus Hydro-Quebec", desc: "Instance specialisee efficacite energetique (EEA)", potentiel: "800K$/an" },
  { name: "TimeToken Economy", desc: "Monnaie interne de collaboration (off-chain)", potentiel: "100K$/an" },
  { name: "Programme Fidelite", desc: "Recompenses utilisation + referral", potentiel: "150K$/an" },
  { name: "White-Label Associations", desc: "Instances blanches pour ordres professionnels, associations", potentiel: "1M$/an" },
];

// ======================================================================
// DATA — Throughput
// ======================================================================

const THROUGHPUT = [
  { metric: "Requetes/an", value: "52M", detail: "100 req/client/jour x 365 jours" },
  { metric: "Rapports/an", value: "525K", detail: "Diagnostics + cahiers + documents" },
  { metric: "Posts sociaux/an", value: "6.3M", detail: "Via CMO bot" },
  { metric: "Ratio vitesse", value: "500x", detail: "Rapport: 4-8h humain → 60s GhostX" },
];

// ======================================================================
// MAIN COMPONENT
// ======================================================================

export function MasterCapacitesPage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Calculator}
          iconColor="text-orange-600"
          title="Capacites & ROI"
          subtitle="90+ taches par departement, ROI 97%, modele revenus 6 flux, 7 angles inexploites"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ROI Summary — detail complet dans Vision & Strategie (B.2) */}
      <Card className="p-4 bg-emerald-50 border border-emerald-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">1.35M$</div>
              <div className="text-[9px] text-gray-500">C-Suite humain</div>
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-500 shrink-0" />
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">21,600$</div>
              <div className="text-[9px] text-gray-500">GhostX/an</div>
            </div>
            <div className="px-2 py-1 bg-emerald-100 rounded-lg text-center">
              <div className="text-lg font-bold text-emerald-700">97%</div>
              <div className="text-[9px] text-emerald-600">economies</div>
            </div>
          </div>
          <div className="flex-1 ml-3">
            <p className="text-xs text-emerald-700">Le client paie ~2% de la valeur equivalente. Pricing, projections et concurrence detailles dans Vision & Strategie.</p>
          </div>
          <button
            onClick={() => setActiveView("master-strategie")}
            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shrink-0"
          >
            Voir B.2
          </button>
        </div>
      </Card>

      <SectionDivider />

      {/* CAPACITES PAR DEPARTEMENT */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1"><span className="text-[9px] font-bold text-gray-400 mr-1">C.4.1</span>Capacites par Departement</h3>
        <p className="text-xs text-gray-400 mb-4">90+ taches automatisees, 660-1,170 heures/mois economisees.</p>

        <div className="space-y-3">
          {DEPT_CAPACITES.map((dept) => {
            const Icon = dept.icon;
            return (
              <Card key={dept.bot} className={cn("p-4 bg-white border shadow-sm", `border-${dept.color}-100`)}>
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", `bg-${dept.color}-100`)}>
                    <Icon className={cn("h-4 w-4", `text-${dept.color}-600`)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-800">{dept.dept}</span>
                      <Badge className={cn("text-[9px]", `bg-${dept.color}-100 text-${dept.color}-700 border-${dept.color}-200`)}>{dept.bot}</Badge>
                      <span className="text-[9px] text-gray-400 ml-auto">{dept.equivHumain}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="p-2 bg-gray-50 rounded-lg text-center">
                        <div className="text-sm font-bold text-gray-800">{dept.tachesCount}</div>
                        <div className="text-[9px] text-gray-500">taches</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg text-center">
                        <div className="text-sm font-bold text-gray-800">{dept.heuresMois}</div>
                        <div className="text-[9px] text-gray-500">heures/mois</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg text-center">
                        <div className="text-sm font-bold text-red-600">{dept.coutHumain}</div>
                        <div className="text-[9px] text-gray-500">equiv. humain</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dept.exemples.map((ex) => (
                        <Badge key={ex} className="bg-gray-100 text-gray-600 border-gray-200 text-[9px]">{ex}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Total */}
        <Card className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">90+</div>
              <div className="text-[9px] text-gray-500">Taches total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">660-1,170</div>
              <div className="text-[9px] text-gray-500">Heures/mois</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">760K-1.35M$</div>
              <div className="text-[9px] text-gray-500">Equiv. humain/an</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-600">2,995$</div>
              <div className="text-[9px] text-gray-500">Prix GhostX/mois</div>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* THROUGHPUT */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1"><span className="text-[9px] font-bold text-gray-400 mr-1">C.4.2</span>Capacite de Traitement (Throughput)</h3>
        <p className="text-xs text-gray-400 mb-4">GhostX Team operant 24/7 — capacite annuelle.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {THROUGHPUT.map((t) => (
            <Card key={t.metric} className="p-3 bg-white border border-gray-100 shadow-sm text-center">
              <div className="text-lg font-bold text-gray-800">{t.value}</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wide">{t.metric}</div>
              <div className="text-[9px] text-gray-400 mt-1">{t.detail}</div>
            </Card>
          ))}
        </div>

        <Card className="mt-3 p-3 bg-amber-50 border border-amber-100 shadow-sm">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">
              <span className="font-bold">Ratio 22,000x :</span> 200 employes a 80K$/an = 16M$/an vs API GhostX ~730$/an.
            </p>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* 6 FLUX DE REVENUS */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1"><span className="text-[9px] font-bold text-gray-400 mr-1">C.4.3</span>6 Flux de Revenus</h3>
        <p className="text-xs text-gray-400 mb-4">Projections An 1→3 par flux.</p>

        <div className="space-y-2">
          {[
            { flux: "SaaS Subscriptions", an1: "1.08M$", an3: "21.2M$", pct: "70%", color: "blue", icon: Briefcase },
            { flux: "Expert Marketplace", an1: "100K$", an3: "3.5M$", pct: "12%", color: "violet", icon: Network },
            { flux: "Subventions Matching", an1: "50K$", an3: "800K$", pct: "5%", color: "emerald", icon: DollarSign },
            { flux: "CMO-as-a-Service", an1: "80K$", an3: "2M$", pct: "7%", color: "pink", icon: Target },
            { flux: "GhostX Academy", an1: "30K$", an3: "500K$", pct: "3%", color: "amber", icon: Brain },
            { flux: "Intelligence de Marche", an1: "10K$", an3: "1M$", pct: "3%", color: "gray", icon: BarChart3 },
          ].map((f) => {
            const FIcon = f.icon;
            return (
              <Card key={f.flux} className="p-3 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", `bg-${f.color}-100`)}>
                    <FIcon className={cn("h-3.5 w-3.5", `text-${f.color}-600`)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-800">{f.flux}</span>
                      <Badge className={cn("text-[9px]", `bg-${f.color}-100 text-${f.color}-700 border-${f.color}-200`)}>{f.pct}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-gray-400">An 1 → An 3</div>
                    <div className="text-xs font-bold text-gray-700">{f.an1} → {f.an3}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* 7 ANGLES INEXPLOITES */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1"><span className="text-[9px] font-bold text-gray-400 mr-1">C.4.4</span>7 Angles de Revenus Inexploites</h3>
        <p className="text-xs text-gray-400 mb-4">Opportunites identifiees, pas encore activees.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ANGLES_INEXPLOITES.map((a) => (
            <Card key={a.name} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-gray-800">{a.name}</span>
                <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-emerald-200 text-[9px]">{a.potentiel}</Badge>
              </div>
              <p className="text-[9px] text-gray-500">{a.desc}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-3 p-3 bg-violet-50 border border-violet-100 shadow-sm text-center">
          <div className="text-[9px] text-violet-600 uppercase tracking-wide">Potentiel combine inexploite</div>
          <div className="text-lg font-bold text-violet-700">~3.05M$/an</div>
        </Card>
      </div>

      <SectionDivider />

      {/* ORBIT9 COORDINATION ROI */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">C.4.5</span>Multiplicateur Orbit9 (9x)</h3>
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-white border border-orange-100 shadow-sm">
          <div className="space-y-2">
            {[
              "9 entreprises coordonnees = 1,000 taches/mois",
              "36 connexions bot-to-bot = 36 opportunites de collaboration",
              "Valeur economique estimee: 8M$/an pour 377K$/an de cout",
              "ROI cercle: 21x le cout d'abonnement",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                <span className="text-xs text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* SOURCES */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">C.4.6</span>Documents Source</h3>
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-2">
            {[
              { name: "Capacites-6-Departements-GhostX.md", desc: "529 lignes — matrice taches/ROI" },
              { name: "POTENTIEL-ANNUEL-GHOSTX-TEAM.md", desc: "289 lignes — throughput + revenus" },
              { name: "Modele-Affaires-GhostX.md", desc: "525 lignes — cout/client, projections" },
            ].map((doc) => (
              <div key={doc.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <code className="text-[9px] font-mono text-gray-700">{doc.name}</code>
                <span className="text-[9px] text-gray-400">— {doc.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
