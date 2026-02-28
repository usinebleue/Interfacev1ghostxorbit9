/**
 * Orbit9DetailView.tsx — Simulation individuelle par sous-section Orbit9
 * Chaque section a sa propre page avec contenu reel tire de la Bible Produit
 * Sprint B — Task Orbit9 simulations
 */

import { ArrowLeft, Search, Handshake, Crown, Rocket, Store, Calendar, Newspaper, Gauge, Users, TrendingUp, Shield, Zap, CheckCircle2, Clock, DollarSign, Target, Star, ArrowRight } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

// ── Configuration par section ──

interface Orbit9SectionConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  borderColor: string;
  status: "live" | "beta" | "coming" | "concept";
  description: string;
  features: { title: string; description: string; icon: React.ElementType }[];
  metrics: { label: string; value: string; trend?: string }[];
  userFlow: { step: string; description: string }[];
  timeline: string;
}

const SECTION_CONFIGS: Record<string, Orbit9SectionConfig> = {
  matching: {
    id: "matching",
    title: "Matching Engine",
    subtitle: "P-420 — Matching Cognitif Bidirectionnel",
    icon: Search,
    color: "text-blue-600",
    bgGradient: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
    status: "concept",
    description: "Le Matching Engine connecte automatiquement les besoins d'un cote avec les solutions de l'autre, sans intervention humaine. Il opere en 3 phases : intra-cercle, inter-cercles, et co-creation.",
    features: [
      { title: "Matching Intra-Cercle", description: "Recherche automatique de solutions DANS le meme cercle de 9 membres", icon: Search },
      { title: "Matching Inter-Cercles", description: "Recherche elargie A TRAVERS tous les cercles du reseau Orbit9", icon: Users },
      { title: "Co-Creation Automatique", description: "Detection de tendances — 15+ membres cherchent la meme chose = projet commun", icon: Zap },
      { title: "Scoring VITAA", description: "Vecteurs du Tableau Periodique (232 elements) pour comparer les capacites", icon: Target },
    ],
    metrics: [
      { label: "Elements proprietaires", value: "232", trend: "4 groupes S/P/T/H" },
      { label: "Temps de matching", value: "48h", trend: "vs 3-6 mois humain" },
      { label: "Phases", value: "3", trend: "Intra → Inter → Co-creation" },
      { label: "Negociation Bot", value: "Auto", trend: "CFO+CTO+CSO en parallele" },
    ],
    userFlow: [
      { step: "Detection", description: "CarlOS detecte un besoin ou une opportunite de marche (ex: usinage medical +15%/an)" },
      { step: "Activation Engine", description: "Le moteur identifie les partenaires complementaires dans le reseau" },
      { step: "Proposition", description: "CarlOS presente l'opportunite a chaque dirigeant avec ROI estime" },
      { step: "Negociation Bot", description: "Les bots CFO/CTO/CSO negocient en parallele — dossier complet en 48h" },
      { step: "Accord Humain", description: "Chaque dirigeant valide. Contributions trackees via TimeTokens + VITAA" },
      { step: "Execution & Distribution", description: "Bots coordonnent le projet. Revenus distribues selon la formule VITAA" },
    ],
    timeline: "Sprint D+ (apres 50+ entreprises actives)",
  },
  collaboration: {
    id: "collaboration",
    title: "Cercles de Collaboration",
    subtitle: "Max 9 membres — Bots qui collaborent entre entreprises",
    icon: Handshake,
    color: "text-emerald-600",
    bgGradient: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200",
    status: "beta",
    description: "Chaque entreprise forme un Cercle Orbit9 avec ses partenaires (max 9 membres). Les bots de chaque entreprise collaborent automatiquement — coordination, matching, budget partage.",
    features: [
      { title: "Max 9 par cercle", description: "Cap dur. Une entreprise = un seul cercle. Prix verrouille : jamais de baisse de palier", icon: Users },
      { title: "Coordination Inter-Bots", description: "Les bots se parlent entre entreprises : specs, budgets, timelines synchronises", icon: Handshake },
      { title: "Effet Duplicateur", description: "Chaque nouveau membre = ses contacts analyses = nouveaux cercles potentiels", icon: TrendingUp },
      { title: "Rabais Progressif", description: "De 0% (solo) a -25% (9 membres). Le palier atteint ne descend JAMAIS", icon: DollarSign },
    ],
    metrics: [
      { label: "Membres max/cercle", value: "9" },
      { label: "Rabais max", value: "-25%", trend: "Verrouille a vie" },
      { label: "Coordination add-on", value: "+500$/mo", trend: "Par membre" },
      { label: "Valeur reseau (Metcalfe)", value: "n²", trend: "9 = 36 connexions" },
    ],
    userFlow: [
      { step: "Analyse silencieuse (Sem 2-3)", description: "CarlOS analyse les contacts du client — qui travaille avec qui regulierement" },
      { step: "Proposition (Sem 3-4)", description: "CarlOS propose un cercle : 'Tu travailles souvent avec X, Y, Z. Un cercle vous sauverait 15%.'" },
      { step: "Invitations automatisees", description: "Client approuve → CarlOS envoie des invitations personnalisees aux partenaires" },
      { step: "Cercle active", description: "Les bots se connectent. Coordination + matching + budget partage" },
      { step: "Multiplication", description: "Chaque membre du cercle → ses contacts analyses → nouveaux cercles → boucle infinie" },
    ],
    timeline: "Activation en cours (Vague 1 — Pionniers)",
  },
  gouvernance: {
    id: "gouvernance",
    title: "Gouvernance Holacratique",
    subtitle: "P-400 — Modele Holacratique Adapte GHML",
    icon: Crown,
    color: "text-amber-600",
    bgGradient: "from-amber-50 to-yellow-50",
    borderColor: "border-amber-200",
    status: "concept",
    description: "Chaque Cercle Orbit9 a sa propre gouvernance autonome basee sur 4 axiomes non-negociables adaptes de l'holacratie au contexte manufacturier.",
    features: [
      { title: "Process avant les gens", description: "Des roles structures (porte-parole elu), pas de hierarchie classique", icon: Crown },
      { title: "Domaine souverain", description: "Chaque cercle gere son propre perimetre — regles independantes", icon: Shield },
      { title: "Tension = carburant", description: "Les besoins non-resolus alimentent l'evolution (isomorphe CREDO Phase C)", icon: Zap },
      { title: "Evolution continue", description: "Gouvernance evolue une tension a la fois — pas de gros overhauls", icon: TrendingUp },
    ],
    metrics: [
      { label: "Axiomes", value: "4", trend: "Non-negociables" },
      { label: "Quadrants de sortie", value: "4", trend: "Volontaire/Involontaire" },
      { label: "IP Protection", value: "100%", trend: "Attribution irreversible" },
      { label: "TimeTokens", value: "Immutable", trend: "Chaque contribution trackee" },
    ],
    userFlow: [
      { step: "Formation du cercle", description: "9 membres max, roles elus (pas nommes par hierarchie)" },
      { step: "Domaine defini", description: "Chaque cercle definit son propre scope d'action et ses propres regles" },
      { step: "Tensions surfacees", description: "Un besoin emerge → tension enregistree → meeting pour resoudre" },
      { step: "Resolution incrementale", description: "Une gouvernance change par mois, pas des refondations completes" },
      { step: "Matrice de sortie", description: "4 quadrants : sortie volontaire (bonne/conflit) et involontaire (performance/externe)" },
    ],
    timeline: "Integre au Sprint D",
  },
  pionniers: {
    id: "pionniers",
    title: "Pionniers Bleus",
    subtitle: "9 places — Programme fondateur Usine Bleue",
    icon: Rocket,
    color: "text-indigo-600",
    bgGradient: "from-indigo-50 to-purple-50",
    borderColor: "border-indigo-200",
    status: "live",
    description: "Le Cercle des Pionniers Usine Bleue = 9 entreprises, 1 leader par secteur strategique. Conditions a vie. Recrutes personnellement par Carl en 30 jours.",
    features: [
      { title: "C-Suite complet (6 bots)", description: "1,350$/mois (vs 1,800$ regulier) — rabais -25% verrouille A VIE", icon: Users },
      { title: "Ambassadeur Or automatique", description: "Statut normalement requis 3 cercles + 25 membres — offert d'emblee", icon: Star },
      { title: "Onboarding VIP gratuit", description: "Carl s'assoit avec toi personnellement. Setup complet. Valeur 500$", icon: CheckCircle2 },
      { title: "Commission 5% sur ton cercle", description: "Tu recrutes tes partenaires → tu gagnes sur leur abonnement", icon: DollarSign },
    ],
    metrics: [
      { label: "Places totales", value: "9", trend: "Pas 10. Pas 20. Neuf." },
      { label: "Prix pionnier/mois", value: "1,350$", trend: "vs 1,800$ regulier" },
      { label: "Economie annuelle", value: "25,800$", trend: "Garantie a vie" },
      { label: "Secteurs cibles", value: "9", trend: "1 leader par secteur" },
    ],
    userFlow: [
      { step: "Teaser envoye", description: "Message personnalise au prospect cible dans son secteur" },
      { step: "Meeting 45 min (5 actes)", description: "Hook → Demo live CarlOS → Exclusivite sectorielle → Conditions → Close" },
      { step: "FOMO active", description: "'La place [SECTEUR] est a toi ou a ton competiteur. Je le rencontre jeudi.'" },
      { step: "Close en 48h", description: "Recap + lien Stripe. Relance J+1 (FOMO). Dernier appel J+2." },
      { step: "Kickoff collectif", description: "Visio avec les 9 Pionniers. CarlOS configure. Les bots se connectent." },
    ],
    timeline: "EN COURS — 30 jours (fev-mars 2026)",
  },
  marketplace: {
    id: "marketplace",
    title: "Bot Marketplace",
    subtitle: "P-069 — Expert Marketplace — Trisociation$$$",
    icon: Store,
    color: "text-orange-600",
    bgGradient: "from-orange-50 to-red-50",
    borderColor: "border-orange-200",
    status: "concept",
    description: "Le marketplace connecte les brouillons IA (80% complets) avec la finalisation d'experts humains (20% restant). Triple source de revenus sur chaque transaction.",
    features: [
      { title: "80% Bot + 20% Expert", description: "Le bot genere le brouillon, l'expert finalise et valide", icon: Zap },
      { title: "Triple revenus (Trisociation)", description: "Subscription client + Commission matching + Membership expert", icon: DollarSign },
      { title: "Recrutement Inverse", description: "On recrute les experts avec un mandat pret en main — personne refuse", icon: Target },
      { title: "Amelioration continue", description: "Chaque correction d'expert = donnees d'entrainement pour le bot", icon: TrendingUp },
    ],
    metrics: [
      { label: "Commission matching", value: "15-20%", trend: "Sur chaque mandat expert" },
      { label: "Taux completion bot", value: "80%", trend: "Brouillon automatique" },
      { label: "Experts initiaux (REAI)", value: "130+", trend: "Fournisseurs existants" },
      { label: "Multiplicateur", value: "550x", trend: "Capacite organisationnelle" },
    ],
    userFlow: [
      { step: "Client utilise Legal Bot", description: "Le bot genere 80% d'un contrat commercial (brouillon structure)" },
      { step: "CarlOS matche un avocat", description: "Matching Engine identifie le meilleur expert du reseau pour ce type de contrat" },
      { step: "Expert finalise (20%)", description: "L'avocat revise, ajuste les clauses, valide la conformite" },
      { step: "3 flux de revenus", description: "Subscription SaaS + 15% commission expert + membership expert" },
      { step: "Bot s'ameliore", description: "Les corrections de l'expert sont des donnees d'entrainement — le bot apprend" },
    ],
    timeline: "Sprint D (Phase 2)",
  },
  evenements: {
    id: "evenements",
    title: "Evenements",
    subtitle: "Rencontres de cercle + Grande Offensive",
    icon: Calendar,
    color: "text-rose-600",
    bgGradient: "from-rose-50 to-pink-50",
    borderColor: "border-rose-200",
    status: "concept",
    description: "Les evenements servent 3 objectifs : rassembler les cercles, presenter des demos live, et recruter des experts pour le marketplace.",
    features: [
      { title: "Rassemblements de Cercle", description: "Trimestriels pour les Ambassadeurs Or, annuels pour les Bronze", icon: Users },
      { title: "Demos sectorielles", description: "Coordination inter-bots en direct — voir les bots collaborer live", icon: Zap },
      { title: "Introductions d'experts", description: "Recrutement marketplace — experts rencontrent les entreprises", icon: Handshake },
      { title: "Grande Offensive", description: "Campagnes de lancement pour nouvelles villes/secteurs — immersion 2-3 jours", icon: Rocket },
    ],
    metrics: [
      { label: "Frequence (Or)", value: "Trim.", trend: "4x/an + diners prives" },
      { label: "Frequence (Argent)", value: "2x/an" },
      { label: "Frequence (Bronze)", value: "1x/an" },
      { label: "Grande Offensive", value: "Sprint D+", trend: "Expansion regionale" },
    ],
    userFlow: [
      { step: "Invitation par CarlOS", description: "Le bot detecte le calendrier et propose les prochains evenements" },
      { step: "Rassemblement de cercle", description: "Les 9 membres se retrouvent — bilan, coordination, nouvelles opportunites" },
      { step: "Demo live", description: "CarlOS fait une demo de coordination inter-bots sur un cas reel du cercle" },
      { step: "Networking d'experts", description: "Experts du marketplace rencontrent les entreprises — mandats en direct" },
    ],
    timeline: "Phase 2+ (apres etablissement des cercles)",
  },
  nouvelles: {
    id: "nouvelles",
    title: "Nouvelles",
    subtitle: "Fil d'actualite + Campagne LinkedIn",
    icon: Newspaper,
    color: "text-sky-600",
    bgGradient: "from-sky-50 to-cyan-50",
    borderColor: "border-sky-200",
    status: "beta",
    description: "Le fil de nouvelles dans CarlOS affiche les opportunites detectees, les jalons de cercle, et les performances. La strategie LinkedIn cree du FOMO pour la Vague 2.",
    features: [
      { title: "Opportunites detectees", description: "'Ton bot a trouve 3 partenaires potentiels pour ton projet'", icon: Search },
      { title: "Jalons de cercle", description: "'Ton cercle a atteint 9 membres — rabais -25% active!'", icon: CheckCircle2 },
      { title: "Performance", description: "'Ton bot a genere 47K$ en nouvelles opportunites ce mois-ci'", icon: TrendingUp },
      { title: "Campagne LinkedIn (7 posts)", description: "Progression du cercle Pionniers — 'Il reste X places' — FOMO maximum", icon: Target },
    ],
    metrics: [
      { label: "Posts LinkedIn", value: "7", trend: "Sur 30 jours" },
      { label: "Objectif conversion", value: "80%+", trend: "Teaser → meeting" },
      { label: "Close rate", value: "60%+", trend: "Meeting → signature" },
      { label: "Waitlist Vague 2", value: "30+", trend: "Hot leads qualifies" },
    ],
    userFlow: [
      { step: "Semaine 0 — Teaser", description: "'Apres 26 ans en manufacturier, j'ai bati ce que j'aurais voulu au jour 1. 9 places.'" },
      { step: "Semaine 1 — Momentum", description: "'3 des 9 places prises. 3 leaders. 3 secteurs differents. 6 places.'" },
      { step: "Semaine 2 — Urgence", description: "'6 des 9. Un Pionnier m'a dit : Carl, j'attendais ca depuis 15 ans. 3 places.'" },
      { step: "Semaine 3 — Fermeture", description: "'Le Cercle des Pionniers est COMPLET. 9 leaders. Vague 2 dans 6 mois. Waitlist.'" },
      { step: "Ongoing — Victoires", description: "Series hebdo : 'Pionnier en metallurgie vient de closer un deal de 2M$'" },
    ],
    timeline: "EN COURS (partie du lancement Pionniers)",
  },
  benchmark: {
    id: "benchmark",
    title: "Benchmark",
    subtitle: "Positionnement concurrentiel et trajectoire",
    icon: Gauge,
    color: "text-violet-600",
    bgGradient: "from-violet-50 to-purple-50",
    borderColor: "border-violet-200",
    status: "coming",
    description: "Le benchmark positionne l'entreprise par rapport a son secteur, ses pairs dans le cercle, et sa propre trajectoire historique. Base sur les 5 piliers VITAA.",
    features: [
      { title: "Benchmark externe", description: "Comparaison vs competiteurs et mediane sectorielle", icon: TrendingUp },
      { title: "Benchmark Cercle (pairs)", description: "Comparaison vs les autres membres du cercle Orbit9", icon: Users },
      { title: "Benchmark historique", description: "Ta trajectoire sur 6 mois — evolution de tes 5 piliers VITAA", icon: Clock },
      { title: "Bilan de Sante VITAA", description: "Scoring 0-100 sur Vente, Idee, Temps, Argent, Actif", icon: Target },
    ],
    metrics: [
      { label: "Piliers VITAA", value: "5", trend: "V/I/T/A/A" },
      { label: "Types de benchmark", value: "3", trend: "Externe/Pairs/Historique" },
      { label: "Score max", value: "100", trend: "Par pilier" },
      { label: "Triangle du Feu", value: "3 niveaux", trend: "Brule/Couve/Meurt" },
    ],
    userFlow: [
      { step: "Diagnostic VITAA", description: "CarlOS evalue les 5 piliers : Vente, Idee, Temps, Argent, Actif (0-100 chaque)" },
      { step: "Triangle du Feu", description: "3+ piliers forts = BRULE (sain), 2 = COUVE (attention), 1 = MEURT (urgent)" },
      { step: "Positionnement sectoriel", description: "'Tu es dans le top 20% pour les Ventes, bottom 30% pour l'efficacite des Actifs'" },
      { step: "Comparaison pairs", description: "Comment tu te compares aux autres membres de ton cercle (anonymise)" },
      { step: "Plan d'action", description: "CarlOS genere les enjeux prioritaires bases sur les gaps identifies" },
    ],
    timeline: "Integre Sprint A+ (diagnostics de base)",
  },
};

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  live: { label: "EN PRODUCTION", color: "bg-green-100 text-green-700 border-green-300" },
  beta: { label: "BETA", color: "bg-blue-100 text-blue-700 border-blue-300" },
  coming: { label: "BIENTOT", color: "bg-amber-100 text-amber-700 border-amber-300" },
  concept: { label: "CONCEPT", color: "bg-gray-100 text-gray-600 border-gray-300" },
};

export function Orbit9DetailView() {
  const { activeOrbit9Section, setActiveView } = useFrameMaster();
  const config = SECTION_CONFIGS[activeOrbit9Section || "matching"];
  if (!config) return null;

  const Icon = config.icon;
  const statusBadge = STATUS_BADGES[config.status];

  return (
    <div className="h-full overflow-auto bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className={cn("bg-gradient-to-r", config.bgGradient, "border-b px-6 py-5")}>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setActiveView("department")}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm", config.borderColor, "border")}>
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">{config.title}</h1>
              <Badge variant="outline" className={cn("text-[10px] font-bold", statusBadge.color)}>
                {statusBadge.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">{config.subtitle}</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed max-w-3xl">{config.description}</p>
      </div>

      <div className="px-6 py-5 space-y-6 max-w-4xl">
        {/* Metriques cles */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Metriques cles</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {config.metrics.map((m, i) => (
              <Card key={i} className="p-3 bg-white">
                <div className="text-[10px] text-gray-400 uppercase font-medium">{m.label}</div>
                <div className={cn("text-xl font-bold mt-1", config.color)}>{m.value}</div>
                {m.trend && <div className="text-[10px] text-gray-500 mt-0.5">{m.trend}</div>}
              </Card>
            ))}
          </div>
        </div>

        {/* Fonctionnalites */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Fonctionnalites</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.features.map((f, i) => {
              const FIcon = f.icon;
              return (
                <Card key={i} className={cn("p-4 bg-white border-l-4", config.borderColor)}>
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br", config.bgGradient)}>
                      <FIcon className={cn("h-4 w-4", config.color)} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{f.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.description}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Parcours utilisateur */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Parcours utilisateur</h2>
          <div className="space-y-0">
            {config.userFlow.map((step, i) => (
              <div key={i} className="flex gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0",
                    config.color.replace("text-", "bg-")
                  )}>
                    {i + 1}
                  </div>
                  {i < config.userFlow.length - 1 && (
                    <div className={cn("w-0.5 flex-1 min-h-[24px]", config.borderColor.replace("border-", "bg-"))} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-4">
                  <div className="text-sm font-semibold text-gray-800">{step.step}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <Card className={cn("p-4 border-l-4", config.borderColor)}>
          <div className="flex items-center gap-2">
            <Clock className={cn("h-4 w-4", config.color)} />
            <span className="text-sm font-semibold text-gray-800">Echeancier :</span>
            <span className="text-sm text-gray-600">{config.timeline}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
