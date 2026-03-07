/**
 * MasterVisionAffairesPage.tsx — Vision d'Affaires
 * Consolidation complete: modele d'affaires, pricing, segments, projections, Orbit9 economique
 * Master GHML — Session 47
 */

import {
  TrendingUp, DollarSign, Users, Building2, Target, Rocket,
  CheckCircle2, AlertCircle, ArrowRight, BarChart3, Crown,
  Globe, Layers, Star, Shield, Zap, Network, Briefcase,
  PieChart, Award, Clock, Eye, MapPin, Calculator,
  Handshake, AlertTriangle, FileText, Database, Cpu,
  Package, Brain, MessageSquare, Mic, Video, Monitor, Phone, Settings,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ======================================================================
// HELPER COMPONENTS
// ======================================================================

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

function FeatureStatusBadge({ status }: { status: "live" | "en-cours" | "planifie" }) {
  const config = {
    "live": { label: "LIVE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "en-cours": { label: "EN COURS", className: "bg-amber-100 text-amber-700 border-amber-200" },
    "planifie": { label: "PLANIFIE", className: "bg-gray-100 text-gray-500 border-gray-200" },
  }[status];

  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", config.className)}>
      {config.label}
    </span>
  );
}

// ======================================================================
// DATA — Identite Produit (absorbed from BibleProduitPage)
// ======================================================================

const FEATURES = [
  { name: "LiveChat multi-bot", status: "live" as const, icon: MessageSquare },
  { name: "12 Bots C-Level", status: "live" as const, icon: Users },
  { name: "Voice pipeline (LiveKit)", status: "live" as const, icon: Mic },
  { name: "Video avatar (Tavus)", status: "live" as const, icon: Video },
  { name: "Canvas auto-nav", status: "live" as const, icon: Monitor },
  { name: "COMMAND Engine", status: "live" as const, icon: Zap },
  { name: "Mon Bureau (PostgreSQL)", status: "live" as const, icon: Database },
  { name: "Orbit9 Matching", status: "live" as const, icon: Globe },
  { name: "Decision Log", status: "live" as const, icon: FileText },
  { name: "Templates (141)", status: "live" as const, icon: Layers },
  { name: "Telephonie (Telnyx)", status: "en-cours" as const, icon: Phone },
  { name: "Auth JWT", status: "planifie" as const, icon: Shield },
  { name: "Multi-tenant", status: "planifie" as const, icon: Settings },
  { name: "Bot-to-Bot V2", status: "planifie" as const, icon: Brain },
];

// ======================================================================
// DATA CONSTANTS
// ======================================================================

const PRICING_FONDATEURS = [
  {
    plan: "CEO Solo",
    prix: "500$",
    cible: "Solopreneur, micro",
    inclus: "CarlOS seul, chat illimite, 1 carnet",
    color: "blue",
    icon: Star,
  },
  {
    plan: "Direction",
    prix: "1,000$",
    cible: "PME 5-20 employes",
    inclus: "CarlOS + 2 C-Level au choix",
    color: "emerald",
    icon: Users,
  },
  {
    plan: "C-Suite Complet",
    prix: "1,800$",
    cible: "PME 20-200",
    inclus: "6 bots complets, onboarding, priorite",
    color: "violet",
    icon: Crown,
    popular: true,
  },
  {
    plan: "Enterprise",
    prix: "Sur mesure",
    cible: "200+ employes",
    inclus: "Multi-users, API, white-label",
    color: "gray",
    icon: Building2,
  },
  {
    plan: "Partner",
    prix: "299$",
    cible: "Experts, consultants",
    inclus: "Instance partenaire, matching",
    color: "amber",
    icon: Network,
  },
];

const ORBIT9_RABAIS = [
  { membres: 1, rabais: "0%" },
  { membres: 3, rabais: "-10%" },
  { membres: 5, rabais: "-15%" },
  { membres: 7, rabais: "-20%" },
  { membres: 9, rabais: "-25%" },
];

const PROJECTIONS = [
  {
    scenario: "Pessimiste",
    subtitle: "Le Prudent",
    color: "amber",
    icon: Shield,
    rows: [
      { year: "Y1", clients: "36", revenue: "557K$", profit: "221K$" },
      { year: "Y2", clients: "265", revenue: "1.86M$", profit: "840K$" },
      { year: "Y3", clients: "957", revenue: "5.96M$", profit: "2.96M$" },
      { year: "Y5", clients: "3,409", revenue: "15M$", profit: "—" },
    ],
    valuation: "150M$",
  },
  {
    scenario: "Realiste",
    subtitle: "Le Plan de Match",
    color: "emerald",
    icon: Target,
    rows: [
      { year: "Y1", clients: "62", revenue: "1.08M$", profit: "—" },
      { year: "Y2", clients: "700", revenue: "5.27M$", profit: "3.11M$" },
      { year: "Y3", clients: "3,000", revenue: "21.2M$", profit: "15.2M$" },
      { year: "Y5", clients: "9,500", revenue: "55M$", profit: "—" },
    ],
    valuation: "825M$",
  },
  {
    scenario: "Optimiste",
    subtitle: "Le Moonshot",
    color: "violet",
    icon: Rocket,
    rows: [
      { year: "Y1", clients: "—", revenue: "16.8M$", profit: "—" },
      { year: "Y2", clients: "—", revenue: "27.2M$", profit: "20M$" },
      { year: "Y3", clients: "—", revenue: "75M$", profit: "—" },
      { year: "Y5", clients: "50,000", revenue: "200M$", profit: "—" },
    ],
    valuation: "4G$",
  },
];

// ======================================================================
// MAIN COMPONENT
// ======================================================================

export function MasterVisionAffairesPage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={TrendingUp}
          iconColor="text-green-600"
          title="Vision d'Affaires & Produit"
          subtitle="Identite, fonctionnalites, pricing, segments, projections, modele d'affaires"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ============================================================ */}
      {/* SECTION 0 — Identite Produit (absorbed from Bible Produit) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Identite Produit</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <Brain className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-sm text-gray-800">CarlOS</div>
                <div className="text-[9px] text-gray-400 uppercase tracking-wide">CEO Bot IA</div>
              </div>
            </div>
            <p className="text-xs text-gray-600">CEO Bot IA pour dirigeants de PME. Instance personnelle de Carl du systeme GhostX. Orchestrateur de toute l'equipe C-Level.</p>
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                <Zap className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <div className="font-bold text-sm text-gray-800">GhostX</div>
                <div className="text-[9px] text-gray-400 uppercase tracking-wide">La marque</div>
              </div>
            </div>
            <p className="text-xs text-gray-600">ghostx.ai — Formule chimique: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">Gh(OS)T·X</code>. Plateforme d'intelligence d'affaires cognitive.</p>
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Layers className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-bold text-sm text-gray-800">GHML</div>
                <div className="text-[9px] text-gray-400 uppercase tracking-wide">Moteur proprietaire</div>
              </div>
            </div>
            <p className="text-xs text-gray-600">Ghost Modeling Language — modelise l'intelligence d'affaires comme la chimie modelise la matiere. 232 elements, 4 groupes, 7 periodes.</p>
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Globe className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="font-bold text-sm text-gray-800">4 Skins planifiees</div>
                <div className="text-[9px] text-gray-400 uppercase tracking-wide">White-label cognitif</div>
              </div>
            </div>
            <div className="text-xs text-gray-600 space-y-0.5">
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-gray-400 shrink-0" /><span>CarlOS (CEO) — Instance personnelle</span></div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-gray-400 shrink-0" /><span>Fonds Investissement</span></div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-gray-400 shrink-0" /><span>Specialiste Industriel</span></div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-gray-400 shrink-0" /><span>Marketplace (Orbit9)</span></div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 0B — Fonctionnalites Cles (absorbed from Bible Produit) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Fonctionnalites Cles (Etat Actuel)</h3>
        <p className="text-xs text-gray-400 mb-3">
          {FEATURES.filter(f => f.status === "live").length} LIVE | {FEATURES.filter(f => f.status === "en-cours").length} EN COURS | {FEATURES.filter(f => f.status === "planifie").length} PLANIFIE
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {FEATURES.map((feature) => {
            const FIcon = feature.icon;
            return (
              <div
                key={feature.name}
                className={cn(
                  "flex items-center gap-3 py-2.5 px-3 rounded-lg",
                  feature.status === "live" ? "bg-white border border-gray-100" :
                  feature.status === "en-cours" ? "bg-amber-50 border border-amber-100" :
                  "bg-gray-50 border border-gray-100"
                )}
              >
                <FIcon className={cn(
                  "h-4 w-4 shrink-0",
                  feature.status === "live" ? "text-emerald-500" :
                  feature.status === "en-cours" ? "text-amber-500" :
                  "text-gray-400"
                )} />
                <span className="text-xs text-gray-700 flex-1">{feature.name}</span>
                <FeatureStatusBadge status={feature.status} />
              </div>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 1 — Vue d'Ensemble */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Vue d'Ensemble</h3>

        {/* Hero gradient card */}
        <Card className="p-0 overflow-hidden border-0 shadow-md mb-4">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-5">
            <div className="text-center">
              <p className="text-sm font-bold text-white leading-relaxed">
                "GhostX : Un C-Suite complet pour le prix d'un lunch d'affaires"
              </p>
            </div>
          </div>
        </Card>

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "TAM Quebec", value: "335,000", sub: "PME", icon: Building2, color: "blue" },
            { label: "Marge brute", value: "94-95%", sub: "SaaS", icon: TrendingUp, color: "emerald" },
            { label: "LTV:CAC", value: "6.6x", sub: "ratio", icon: BarChart3, color: "violet" },
            { label: "Payback", value: "3.2", sub: "mois", icon: Clock, color: "amber" },
          ].map((stat) => {
            const StatIcon = stat.icon;
            return (
              <Card key={stat.label} className="p-3 bg-white border border-gray-100 shadow-sm text-center">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2", `bg-${stat.color}-100`)}>
                  <StatIcon className={cn("h-4 w-4", `text-${stat.color}-600`)} />
                </div>
                <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">{stat.sub}</div>
                <div className="text-[9px] text-gray-400 mt-0.5">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        {/* Positioning statement */}
        <Card className="p-4 bg-gray-50 border border-gray-100 shadow-sm">
          <div className="flex items-start gap-2.5">
            <Eye className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600 leading-relaxed">
              GhostX se positionne entre <span className="font-semibold text-gray-700">ChatGPT</span> (20$/mois, generique) et{" "}
              <span className="font-semibold text-gray-700">McKinsey</span> (10K$/mois, humain).{" "}
              <span className="font-bold text-green-700">Sweet spot : 500-2K$/mois</span> pour un C-Suite IA specialise 24/7.
            </p>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 2 — Pricing Tarifs Fondateurs (V1) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">Pricing — Tarifs Fondateurs (V1)</h3>
        <p className="text-xs text-gray-400 mb-4">Tarifs lancement verrouilles pour les premiers clients.</p>

        <div className="space-y-2.5">
          {PRICING_FONDATEURS.map((plan) => {
            const PlanIcon = plan.icon;
            return (
              <Card
                key={plan.plan}
                className={cn(
                  "p-4 bg-white border shadow-sm relative overflow-hidden",
                  plan.popular ? "border-violet-200 ring-1 ring-violet-100" : "border-gray-100"
                )}
              >
                {plan.popular && (
                  <Badge className="absolute top-2 right-2 bg-violet-100 text-violet-700 border-violet-200 text-[9px]">
                    Populaire
                  </Badge>
                )}
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", `bg-${plan.color}-100`)}>
                    <PlanIcon className={cn("h-4 w-4", `text-${plan.color}-600`)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-gray-800">{plan.plan}</span>
                      <span className={cn("text-sm font-bold", `text-${plan.color}-600`)}>{plan.prix}<span className="text-[9px] font-normal text-gray-400">/mois</span></span>
                    </div>
                    <div className="text-[9px] text-gray-500 mt-0.5">{plan.cible}</div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-xs text-gray-600">{plan.inclus}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2 md:hidden">{plan.inclus}</div>
              </Card>
            );
          })}
        </div>

        {/* Add-ons */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "+195$/bot", desc: "Bot additionnel" },
            { label: "+95$/user", desc: "Utilisateur extra" },
            { label: "500$ one-time", desc: "Onboarding VIP" },
          ].map((addon) => (
            <div key={addon.label} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-center">
              <div className="text-xs font-bold text-gray-700">{addon.label}</div>
              <div className="text-[9px] text-gray-500">{addon.desc}</div>
            </div>
          ))}
        </div>

        {/* Pricing V2 */}
        <Card className="mt-4 p-4 bg-amber-50 border border-amber-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">Pricing V2 (regulier — apres fondateurs)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { plan: "Solo", prix: "699$" },
              { plan: "Direction", prix: "1,499$" },
              { plan: "C-Suite", prix: "2,499$" },
              { plan: "Partner", prix: "499$" },
            ].map((v2) => (
              <div key={v2.plan} className="p-2 bg-white rounded-lg border border-amber-200 text-center">
                <div className="text-[9px] font-medium text-amber-600">{v2.plan}</div>
                <div className="text-sm font-bold text-gray-800">{v2.prix}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 3 — Pricing Orbit9 — Rabais Cercle */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">Pricing Orbit9 — Rabais Cercle</h3>
        <p className="text-xs text-gray-400 mb-4">Plus le cercle grandit, plus le prix baisse — pour tous les membres.</p>

        {/* Dynamic pricing table */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm mb-4">
          <div className="grid grid-cols-5 gap-2">
            {ORBIT9_RABAIS.map((r, idx) => (
              <div
                key={r.membres}
                className={cn(
                  "p-3 rounded-lg text-center border",
                  idx === ORBIT9_RABAIS.length - 1
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-gray-50 border-gray-100"
                )}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className={cn("h-4 w-4", idx === ORBIT9_RABAIS.length - 1 ? "text-emerald-600" : "text-gray-400")} />
                </div>
                <div className={cn(
                  "text-lg font-bold",
                  idx === ORBIT9_RABAIS.length - 1 ? "text-emerald-700" : "text-gray-700"
                )}>
                  {r.rabais}
                </div>
                <div className="text-[9px] text-gray-500">{r.membres} membre{r.membres > 1 ? "s" : ""}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-start gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-[9px] text-blue-700 leading-relaxed">
              Le prix plancher ne redescend jamais. Si un cercle de 9 tombe a 7, le <span className="font-bold">-20% reste verrouille</span>.
            </p>
          </div>
        </Card>

        {/* Pioneer Package */}
        <Card className="p-0 overflow-hidden border-0 shadow-md">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Pioneer Package</span>
              <Badge className="ml-auto bg-white/20 text-white border-white/30 text-[9px]">Exclusif</Badge>
            </div>
            <div className="text-2xl font-bold text-white">1,350$/mois</div>
            <div className="text-[9px] text-white/80">verrouille a vie</div>
          </div>
          <div className="p-4 bg-white">
            <div className="space-y-2 mb-3">
              {[
                "9 places exclusives, 1 par secteur",
                "Ambassadeur Or + commission 5% + voix roadmap",
                "C-Suite complet 6 bots + onboarding VIP inclus",
                "Rabais cercle -25% verrouille",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-xs text-gray-600">{item}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-center">
              <div className="text-[9px] text-amber-600 font-medium uppercase tracking-wide">Revenu Pioneer</div>
              <div className="text-sm font-bold text-amber-800">9 x 1,350$ = 12,150$/mois = 145,800$/an</div>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 4 — Segments Clients — 3 Niveaux */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">Segments Clients — 3 Niveaux</h3>
        <p className="text-xs text-gray-400 mb-4">Trois marches distincts, trois moteurs de croissance.</p>

        <div className="space-y-4">
          {/* Nivel 1 — PME Individuelles */}
          <Card className="p-0 overflow-hidden bg-white border-l-4 border-l-blue-500 border border-gray-100 shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">Nivel 1 — PME Individuelles</div>
                  <div className="text-[9px] text-gray-500">Marche principal, volume eleve</div>
                </div>
                <Badge className="ml-auto bg-blue-50 text-blue-700 border-blue-200 text-[9px]">500-1,800$/mois</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: "Cible", value: "PME manufacturiere quebecoise 10-150 employes", icon: Target },
                  { label: "Marche", value: "~35,000 au Quebec, ~300,000 au Canada", icon: MapPin },
                  { label: "Douleur", value: "Pas de CFO/CTO, 8 chapeaux, decisions improvisees", icon: AlertCircle },
                  { label: "Signal d'achat", value: "\"Je me noie\"", icon: Zap },
                ].map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
                      <ItemIcon className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">{item.label}</div>
                        <div className="text-xs text-gray-700 mt-0.5">{item.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 text-center font-medium">
                  "Un C-Suite complet pour 2% du cout d'un consultant"
                </p>
              </div>
            </div>
          </Card>

          {/* Nivel 2 — Fonds d'investissement */}
          <Card className="p-0 overflow-hidden bg-white border-l-4 border-l-emerald-500 border border-gray-100 shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <PieChart className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">Nivel 2 — Fonds d'investissement</div>
                  <div className="text-[9px] text-gray-500">Haute valeur, volume faible</div>
                </div>
                <Badge className="ml-auto bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px]">10K-50K$/mois</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {[
                  { label: "Cible", value: "9 grands fonds quebecois (616G$ AUM cumule)", icon: Building2 },
                  { label: "Plus", value: "50+ fonds regionaux, 100+ VC/PE", icon: Globe },
                  { label: "Douleur", value: "5% couverture portefeuille, risques non detectes (Northvolt -510M$)", icon: AlertCircle },
                  { label: "Signal", value: "\"On veut voir 100% du portefeuille, pas 5%\"", icon: Eye },
                ].map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
                      <ItemIcon className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">{item.label}</div>
                        <div className="text-xs text-gray-700 mt-0.5">{item.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { tier: "Starter", prix: "10K$/mois", detail: "≤100 PME" },
                  { tier: "Pro", prix: "25K$/mois", detail: "≤1000 PME" },
                  { tier: "Enterprise", prix: "50K$/mois", detail: "Illimite" },
                ].map((t) => (
                  <div key={t.tier} className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                    <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">{t.tier}</div>
                    <div className="text-sm font-bold text-gray-800">{t.prix}</div>
                    <div className="text-[9px] text-gray-500">{t.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Nivel 3 — Reseau d'experts */}
          <Card className="p-0 overflow-hidden bg-white border-l-4 border-l-violet-500 border border-gray-100 shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Network className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">Nivel 3 — Reseau d'experts</div>
                  <div className="text-[9px] text-gray-500">Marketplace et commissions</div>
                </div>
                <Badge className="ml-auto bg-violet-50 text-violet-700 border-violet-200 text-[9px]">Commission 15-20%</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {[
                  { label: "Cible", value: "Experts fractionnels, consultants, integrateurs", icon: Users },
                  { label: "Modele", value: "Commission 15-20% sur mandats", icon: DollarSign },
                  { label: "Cotisation", value: "Cotisation annuelle reseau", icon: Award },
                  { label: "Avantage", value: "Leur bot apprend de chaque mandat → meilleur matching", icon: Zap },
                ].map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
                      <ItemIcon className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">{item.label}</div>
                        <div className="text-xs text-gray-700 mt-0.5">{item.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2.5 bg-violet-50 rounded-lg border border-violet-100">
                <p className="text-xs text-violet-700 text-center font-medium">
                  Projection : 500 experts x 2K$ commission = 1M$/mois a maturite
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 5 — 4 Moteurs de Revenus */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">4 Moteurs de Revenus</h3>
        <p className="text-xs text-gray-400 mb-4">Quatre couches de monetisation complementaires.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Layer 1 — Abonnements SaaS */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Layers className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">Layer 1 — Abonnements SaaS</div>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[9px]">~70% revenus</Badge>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                "Recurrent mensuel, 94-95% marge",
                "Pioneer Circle : 145,800$/an",
                "Upsell interne : Solo → Direction → C-Suite (+260% revenue meme client)",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="text-[9px] text-gray-600 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Layer 2 — Fees de Performance */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">Layer 2 — Fees de Performance</div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px]">~15%</Badge>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                "3-5% commission sur valeur creee par cercles",
                "2% sur economies achats groupes",
                "Bonus sur pertes evitees (detection risques)",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-[9px] text-gray-600 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Layer 3 — Expert Marketplace */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Network className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">Layer 3 — Expert Marketplace</div>
                <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-[9px]">~10%</Badge>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                "15-20% commission sur mandats",
                "Cotisation annuelle experts",
                "Knowledge monetization (bots qui s'ameliorent)",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-violet-500 shrink-0" />
                  <span className="text-[9px] text-gray-600 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Layer 4 — Data & Intelligence */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">Layer 4 — Data & Intelligence</div>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px]">~5% futur</Badge>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                "Rapports sectoriels anonymises",
                "API data pour recherche (MILA, universites)",
                "Analytics predictifs",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-[9px] text-gray-600 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 6 — Projections Financieres — 3 Scenarios */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">Projections Financieres — 3 Scenarios</h3>
        <p className="text-xs text-gray-400 mb-4">Pessimiste, realiste, optimiste — basees sur les metriques fondateurs.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PROJECTIONS.map((proj) => {
            const ProjIcon = proj.icon;
            return (
              <Card key={proj.scenario} className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm">
                <div className={cn("px-4 py-3", `bg-${proj.color}-50 border-b border-${proj.color}-100`)}>
                  <div className="flex items-center gap-2">
                    <ProjIcon className={cn("h-4 w-4", `text-${proj.color}-600`)} />
                    <div>
                      <div className={cn("text-sm font-bold", `text-${proj.color}-800`)}>{proj.scenario}</div>
                      <div className={cn("text-[9px]", `text-${proj.color}-600`)}>{proj.subtitle}</div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {proj.rows.map((row) => (
                      <div key={row.year} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <Badge className="bg-gray-200 text-gray-700 border-gray-300 text-[9px]">{row.year}</Badge>
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-800">{row.revenue}</div>
                          {row.clients !== "—" && (
                            <div className="text-[9px] text-gray-500">{row.clients} clients</div>
                          )}
                          {row.profit !== "—" && (
                            <div className="text-[9px] text-emerald-600">Profit {row.profit}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={cn("mt-3 p-2.5 rounded-lg text-center", `bg-${proj.color}-50 border border-${proj.color}-100`)}>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wide">Valuation Y5</div>
                    <div className={cn("text-lg font-bold", `text-${proj.color}-700`)}>{proj.valuation}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Optimiste detail callout */}
        <Card className="mt-3 p-3 bg-violet-50 border border-violet-100 shadow-sm">
          <div className="flex items-start gap-2">
            <Rocket className="h-4 w-4 text-violet-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-violet-800 mb-0.5">Scenario Optimiste — Hypotheses</div>
              <p className="text-[9px] text-violet-600 leading-relaxed">
                Y1 : CDPQ 5M$ + Scale AI 5M$ = 16.8M$ total. Y3 : Expansion Canada + Francophonie. Y5 : 50,000 clients, 200M$ revenus, valuation 4G$.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* === SECTIONS 7-12 CONTINUE IN PART 2 === */}
      {/* === SECTIONS 7-12 === */}

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 7 — Potentiel Economique Orbit9 */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Potentiel Economique Orbit9</h3>
        <p className="text-xs text-gray-400 mb-4">
          Multiplicateur economique regional — de 9 PME a 366M$+ d'impact annuel.
        </p>

        <div className="space-y-3">
          {/* Card 1 — Cercle Type */}
          <Card className="p-5 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <Network className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">Cercle Type — Metal Quebec (9 PME)</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {[
                "MetalPro (usinage CNC)", "SoudurePro", "TraitSurface", "DesignMeca",
                "QualitePlus", "LogiTrans", "FinanceVert", "ExportQC",
              ].map((name) => (
                <Badge key={name} className="bg-blue-100 text-blue-700 border-blue-200 text-[9px]">{name}</Badge>
              ))}
              <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-[9px] border-dashed">1 ouvert</Badge>
            </div>

            <div className="space-y-2 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Handshake className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span className="text-xs text-gray-600">
                  <span className="font-bold text-gray-800">36</span> connexions bot-to-bot = 36 opportunites de collaboration
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-xs text-gray-600">
                  10% creent des deals: <span className="font-bold text-gray-800">3.6 deals/an</span> x 50K$ = <span className="font-bold text-emerald-600">180K$</span> nouvelle valeur/cercle
                </span>
              </div>
            </div>
          </Card>

          {/* Card 2 — FTQ Potentiel */}
          <Card className="p-5 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">FTQ (4,000 PME) — Potentiel reseau</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>4,000 PME / 9 par cercle = <span className="font-bold text-gray-800">~445 cercles</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>445 x 180K$/cercle = <span className="font-bold text-emerald-600">80.1M$/an</span> de valeur creee</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>+ Achats groupes: <span className="font-bold text-emerald-600">286M$/an</span> economises</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>+ Talent sharing, co-innovation, export</span>
              </div>
              <div className="mt-3 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
                <div className="text-center">
                  <span className="text-lg font-bold text-emerald-700">= 366M$+</span>
                  <span className="text-xs text-emerald-600 ml-2">d'impact economique annuel</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 3 — Quote */}
          <Card className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-0 shadow-sm">
            <p className="text-sm font-medium text-white text-center italic leading-relaxed">
              "Ce n'est pas juste un SaaS. C'est du developpement economique regional."
            </p>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 8 — Strategie Go-to-Market */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Strategie Go-to-Market</h3>
        <p className="text-xs text-gray-400 mb-4">
          3 phases: Pioneer Blitz (30j) → Effet Domino Orbit9 (viral) → Conquete 9 Fonds.
        </p>

        <div className="space-y-4">
          {/* Phase 1 — Pioneer Blitz */}
          <Card className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Phase 1 — Pioneer Blitz (30 jours)</span>
                <Badge className="ml-auto bg-white/20 text-white border-white/30 text-[9px]">FOMO</Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-3">
                {[
                  "9 places, 1 par secteur strategique",
                  "Face-a-face avec Carl — tournee du baton de pelerin",
                  "\"Si c'est pas toi, c'est ton concurrent que je vois vendredi\"",
                  "Deadline: 48h par prospect, pas d'extension",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="text-xs text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="text-[9px] font-bold text-red-600 uppercase tracking-wide mb-1">LinkedIn Sequence</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {["Teaser", "\"3/9 prises\"", "\"6/9\"", "\"COMPLET\"", "Waitlist"].map((step, i) => (
                    <div key={step} className="flex items-center gap-1.5">
                      <Badge className={cn(
                        "text-[9px]",
                        i < 4 ? "bg-red-100 text-red-700 border-red-200" : "bg-gray-100 text-gray-600 border-gray-200"
                      )}>{step}</Badge>
                      {i < 4 && <ArrowRight className="h-3.5 w-3.5 text-gray-300" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Phase 2 — Effet Domino */}
          <Card className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Phase 2 — Effet Domino Orbit9</span>
                <Badge className="ml-auto bg-white/20 text-white border-white/30 text-[9px]">Viral, CAC ~0$</Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {[
                  { gen: "Gen 0", count: "Carl (1)", color: "bg-gray-100 text-gray-700" },
                  { gen: "Gen 1", count: "9 cercle", color: "bg-amber-100 text-amber-700" },
                  { gen: "Gen 2", count: "50-70", color: "bg-amber-200 text-amber-800" },
                  { gen: "Gen 3", count: "150-200", color: "bg-amber-300 text-amber-900" },
                ].map((g, i) => (
                  <div key={g.gen} className="flex items-center gap-1.5">
                    <div className={cn("px-2 py-1 rounded text-[9px] font-bold", g.color)}>
                      {g.gen}: {g.count}
                    </div>
                    {i < 3 && <ArrowRight className="h-3.5 w-3.5 text-gray-300" />}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="text-[9px] font-bold text-amber-600 uppercase tracking-wide mb-1">12-18 Mois</div>
                  <div className="text-xs text-gray-700"><span className="font-bold">200+ clients</span>, CAC = 0$</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="text-[9px] font-bold text-amber-600 uppercase tracking-wide mb-1">Conversion Warm</div>
                  <div className="text-xs text-gray-700"><span className="font-bold">30-50%</span> (vs 1-3% cold marketing)</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Phase 3 — Conquete 9 Fonds */}
          <Card className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm">
            <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Phase 3 — Conquete 9 Fonds quebecois</span>
                <Badge className="ml-auto bg-white/20 text-white border-white/30 text-[9px]">~616G$ AUM</Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                {[
                  { name: "CDPQ", aum: "517G$" },
                  { name: "BDC", aum: "43G$" },
                  { name: "Fonds FTQ", aum: "23G$" },
                  { name: "Novacap", aum: "10.5G$" },
                  { name: "IQ", aum: "7.5G$" },
                  { name: "Claridge", aum: "5.25G$" },
                  { name: "Fondaction", aum: "4.28G$" },
                  { name: "CRCD", aum: "2.81G$" },
                  { name: "Teralys", aum: "2.5G$" },
                ].map((fund) => (
                  <div key={fund.name} className={cn(
                    "p-2 rounded-lg text-center border",
                    fund.name === "Teralys" ? "bg-violet-100 border-violet-300" : "bg-gray-50 border-gray-100"
                  )}>
                    <div className="text-xs font-bold text-gray-800">{fund.name}</div>
                    <div className="text-[9px] text-gray-500">{fund.aum}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                <Globe className="h-3.5 w-3.5 text-violet-500" />
                <span>Total: <span className="font-bold text-gray-800">~616G$ AUM</span>, 7,000+ entreprises portefeuille</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span>Premier domino: <span className="font-bold text-violet-600">Teralys</span> (Q2 2026)</span>
              </div>
            </div>
          </Card>

          {/* ROI Math */}
          <Card className="p-4 bg-gradient-to-br from-violet-50 to-white border border-violet-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-bold text-gray-800">ROI Math — 0.2% amelioration performance</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-violet-100">
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-[9px]">CDPQ</Badge>
                <span className="text-xs text-gray-600 flex-1">
                  0.2% de 517G$ = <span className="font-bold text-emerald-600">1,034M$</span> gain vs 600K$ cout
                </span>
                <span className="text-sm font-bold text-violet-700">ROI 1,723x</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-violet-100">
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-[9px]">9 Fonds</Badge>
                <span className="text-xs text-gray-600 flex-1">
                  <span className="font-bold text-emerald-600">1,232M$</span> gain vs 3.06M$ cout
                </span>
                <span className="text-sm font-bold text-violet-700">ROI 403x</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 9 — Unit Economics */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Unit Economics</h3>
        <p className="text-xs text-gray-400 mb-4">
          Metriques SaaS — LTV:CAC 6.6x, marge brute 94-95%, payback 3.2 mois.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "CAC", value: "2,800$", detail: "Reseau chaud", color: "blue", icon: Target },
            { label: "LTV", value: "18,500$", detail: "24 mois tenure", color: "emerald", icon: TrendingUp },
            { label: "LTV:CAC", value: "6.6x", detail: "Excellent, cible >3x", color: "violet", icon: BarChart3 },
            { label: "Churn mensuel", value: "2%", detail: "NPS 72", color: "amber", icon: Users },
            { label: "ARR / client", value: "10,800$", detail: "Mix plans", color: "blue", icon: DollarSign },
            { label: "Payback", value: "3.2 mois", detail: "Rapide", color: "emerald", icon: Clock },
            { label: "Marge brute", value: "94-95%", detail: "SaaS premium", color: "violet", icon: TrendingUp },
            { label: "Cout API/client", value: "20-30$/mois", detail: "5-tier routing", color: "amber", icon: Cpu },
          ].map((kpi) => {
            const KIcon = kpi.icon;
            return (
              <Card key={kpi.label} className="p-3 bg-white border border-gray-100 text-center">
                <KIcon className={cn("h-4 w-4 mx-auto mb-1.5", `text-${kpi.color}-500`)} />
                <div className="text-lg font-bold text-gray-800">{kpi.value}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">{kpi.label}</div>
                <div className="text-[9px] text-gray-400 mt-0.5">{kpi.detail}</div>
              </Card>
            );
          })}
        </div>

        {/* Burn Rate */}
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-white border border-amber-100 shadow-sm">
          <div className="text-xs font-bold text-gray-700 mb-3">Burn Rate & Runway</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Burn mensuel", value: "85,000$", color: "red" },
              { label: "Cash", value: "420,000$", color: "emerald" },
              { label: "Runway", value: "4.9 mois", color: "amber" },
              { label: "MRR", value: "12,450$", color: "blue" },
            ].map((item) => (
              <div key={item.label} className="p-3 bg-white rounded-lg border border-gray-100 text-center">
                <div className={cn("text-lg font-bold", `text-${item.color}-600`)}>{item.value}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">{item.label}</div>
                {item.label === "MRR" && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[9px] mt-1">+96% QoQ</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 10 — Avantages Competitifs — Le Moat */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Avantages Competitifs — Le Moat</h3>
        <p className="text-xs text-gray-400 mb-4">
          4 couches defensives empilees. Plus le temps passe, plus le moat s'elargit.
        </p>

        {/* 4 Moat Layers */}
        <div className="space-y-2 mb-4">
          {[
            {
              layer: 1,
              title: "GHML Framework",
              desc: "220 elements proprietaires, 7 ans R&D, pas copiable en <2 ans",
              color: "blue",
              icon: Layers,
            },
            {
              layer: 2,
              title: "Network Effects (Orbit9)",
              desc: "Chaque cercle verrouille 9 entreprises, prix baisse = lock-in",
              color: "emerald",
              icon: Network,
            },
            {
              layer: 3,
              title: "Data",
              desc: "1,000+ interactions PME = training data, benchmarks sectoriels Quebec",
              color: "violet",
              icon: Database,
            },
            {
              layer: 4,
              title: "Distribution",
              desc: "REAI 130+ membres, reseau 26 ans de Carl, 7,000+ via fonds",
              color: "amber",
              icon: Globe,
            },
          ].map((moat) => {
            const MIcon = moat.icon;
            return (
              <Card key={moat.layer} className={cn(
                "p-4 bg-white border shadow-sm",
                `border-${moat.color}-100`
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    `bg-${moat.color}-100`
                  )}>
                    <MIcon className={cn("h-4 w-4", `text-${moat.color}-600`)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-[9px]", `bg-${moat.color}-100 text-${moat.color}-700 border-${moat.color}-200`)}>
                        Couche {moat.layer}
                      </Badge>
                      <span className="text-xs font-bold text-gray-800">{moat.title}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{moat.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Competitors Table */}
        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[140px_1fr] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Concurrent</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Faiblesse vs GhostX</span>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { name: "ChatGPT/Claude", weakness: "Pas de structure business, pas de persistance" },
              { name: "Jasper/Copy.ai", weakness: "Marketing seulement" },
              { name: "Consultants", weakness: "10-50x plus cher, pas 24/7" },
              { name: "ERP (SAP/Oracle)", weakness: "Overkill pour PME, 6 mois implantation" },
              { name: "Notion AI", weakness: "Pas de profondeur intelligence" },
            ].map((row) => (
              <div key={row.name} className="grid grid-cols-[140px_1fr] gap-2 px-4 py-2.5 items-center hover:bg-gray-50 transition-colors">
                <span className="text-xs font-bold text-gray-800">{row.name}</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs text-gray-600">{row.weakness}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 11 — Risques & Mitigations */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Risques & Mitigations</h3>
        <p className="text-xs text-gray-400 mb-4">
          5 risques identifies avec probabilite, impact et mitigation.
        </p>

        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_70px_70px_1fr] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Risque</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Prob.</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Impact</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Mitigation</span>
          </div>

          <div className="divide-y divide-gray-50">
            {[
              {
                risk: "Responsabilite legale (mauvais conseil)",
                prob: "Moyen",
                probColor: "amber",
                impact: "Critique",
                impactColor: "red",
                mitigation: "Disclaimers, assurance E&O",
              },
              {
                risk: "Vie privee (Loi 25)",
                prob: "Faible",
                probColor: "emerald",
                impact: "Critique",
                impactColor: "red",
                mitigation: "Hebergement QC, chiffrement, DPA",
              },
              {
                risk: "Dependance API",
                prob: "Faible",
                probColor: "emerald",
                impact: "Moyen",
                impactColor: "amber",
                mitigation: "Multi-fournisseur (5 tiers), backup",
              },
              {
                risk: "Cycle de vente fonds trop long",
                prob: "Moyen",
                probColor: "amber",
                impact: "Eleve",
                impactColor: "red",
                mitigation: "Commencer petit (Teralys), effet domino",
              },
              {
                risk: "BigTech entre dans PME",
                prob: "Moyen",
                probColor: "amber",
                impact: "Moyen",
                impactColor: "amber",
                mitigation: "GHML unique, positionnement QC, lock-in",
              },
            ].map((row) => (
              <div key={row.risk} className="grid grid-cols-[1fr_70px_70px_1fr] gap-2 px-4 py-3 items-start">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-700">{row.risk}</span>
                </div>
                <Badge className={cn("text-[9px] w-fit", `bg-${row.probColor}-100 text-${row.probColor}-700 border-${row.probColor}-200`)}>
                  {row.prob}
                </Badge>
                <Badge className={cn("text-[9px] w-fit", `bg-${row.impactColor}-100 text-${row.impactColor}-700 border-${row.impactColor}-200`)}>
                  {row.impact}
                </Badge>
                <div className="flex items-start gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-600">{row.mitigation}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 12 — Documents Source sur Drive */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Documents Source sur Drive</h3>
        <p className="text-xs text-gray-400 mb-4">
          Documents de reference ayant alimente cette vision d'affaires.
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-2">
            {[
              { name: "Modele-Affaires-GhostX.md", lines: "980 lignes", desc: "Modele complet" },
              { name: "Strategie-Lancement-Pionniers.md", lines: "685 lignes", desc: "Blitz 30 jours" },
              { name: "Plan-Conquete-9-Fonds.md", lines: "500+ lignes", desc: "Strategie fonds" },
              { name: "Proposition-Valeur-GhostX-Fonds.md", lines: "1,320 lignes", desc: "ROI math" },
              { name: "Spec-Instance-Fonds-Investissement.md", lines: "", desc: "Pricing fonds" },
              { name: "Bible-Produit-GhostX.md", lines: "", desc: "Source verite produit V2.1" },
              { name: "JOURNAL-DECISIONS.md", lines: "", desc: "D-039 (Business Model), D-043 (Pricing), D-091 (COMMAND)" },
            ].map((doc) => (
              <div key={doc.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono font-bold text-gray-800 truncate">{doc.name}</code>
                    {doc.lines && (
                      <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-[9px] shrink-0">{doc.lines}</Badge>
                    )}
                  </div>
                  <div className="text-[9px] text-gray-400 mt-0.5">{doc.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* FOOTER — Key Numbers */}
      {/* ============================================================ */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Couches revenus", value: "4", subtext: "SaaS + usage + reseau + fonds", color: "blue" },
            { label: "Niveaux clients", value: "3", subtext: "Pioneer, PME, Fonds", color: "emerald" },
            { label: "Fonds cibles", value: "9", subtext: "~616G$ AUM total", color: "violet" },
            { label: "Marge brute", value: "94-95%", subtext: "SaaS premium", color: "amber" },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 bg-white border border-gray-100 text-center">
              <div className={cn("text-lg font-bold", `text-${stat.color}-600`)}>{stat.value}</div>
              <div className="text-xs font-medium text-gray-700">{stat.label}</div>
              <div className="text-[9px] text-gray-400">{stat.subtext}</div>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
