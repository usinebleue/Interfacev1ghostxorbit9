/**
 * dept-welcome.ts — Données d'accueil personnalisées par département/agent
 *
 * Utilisé par DeptWelcomeScreen dans DiscussionWindow.tsx
 * Chaque bot a: greeting, actions de réflexion, icône associée
 */

import {
  Target, Brain, Lightbulb, TrendingUp, Shield, Search,
  BarChart3, DollarSign, Megaphone, Compass, Users, Factory,
  Settings, Scale, Code, Cpu, Briefcase, Rocket,
  FileText, Gauge, Wrench, Lock, Zap, GitBranch,
  Eye, LineChart, PieChart, Layers, Handshake, Award,
  BookOpen, Microscope, Flame, Map, Truck, ClipboardCheck,
  Heart, GraduationCap, Fingerprint, Network, Globe, Puzzle,
  Receipt, Landmark, AlertTriangle, Siren, Database, Key,
} from "lucide-react";
import type { PhaseKey } from "../core/types";

// ═══ Greeting personnalisé par bot ═══
export const DEPT_GREETING: Record<string, string> = {
  CEOB: "Salut! CarlOS ici. Direction et vision — qu'est-ce qu'on attaque?",
  CTOB: "Hey Carl, Tim au rapport. Techno, archi, code — shoot.",
  CFOB: "Frank ici. Finance, budget, tresorerie — je suis pret.",
  CMOB: "Mathilde a votre service! Marketing, croissance, branding — on y va?",
  CSOB: "Simone ici. Stratégie, positionnement, veille — qu'est-ce qu'on planifie?",
  COOB: "Olivier au poste. Opérations, processus, logistique — dis-moi.",
  CPOB: "Paco ici. Production, automatisation, usine — qu'est-ce qu'on optimise?",
  CHROB: "Helene a l'ecoute. RH, talents, culture — comment je peux aider?",
  CINOB: "Ines ici! Innovation, R&D, veille techno — qu'est-ce qu'on explore?",
  CROB: "Rich au rapport. Ventes, revenus, pipeline — on pousse?",
  CLOB: "Loulou ici. Juridique, conformite, contrats — qu'est-ce qu'on protege?",
  CISOB: "Sebastien en poste. Securite, cyber, conformite — qu'est-ce qu'on securise?",
};

// ═══ Couleurs pilules (même pattern que SuggestionsWelcome) ═══
export const ACTION_COLORS: Record<string, string> = {
  red: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
  amber: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
  violet: "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100",
  blue: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
  pink: "bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100",
  teal: "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100",
  orange: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
  cyan: "bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100",
};

// ═══ Actions rapides par département (8 par dept) ═══
export const DEPT_ACTIONS: Record<string, Array<{
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  phase: PhaseKey;
}>> = {
  CEOB: [
    { label: "Diagnostic rapide", icon: Gauge, description: "Fais un diagnostic rapide de ma situation d'entreprise", color: "red", phase: "discussion" },
    { label: "Brainstorm", icon: Brain, description: "Lance un brainstorm sur une idee que j'ai", color: "amber", phase: "discussion" },
    { label: "Decision Go/No-Go", icon: Target, description: "Aide-moi a prendre une decision Go ou No-Go", color: "indigo", phase: "discussion" },
    { label: "Plan strategique", icon: Compass, description: "Travaillons sur mon plan strategique", color: "emerald", phase: "discussion" },
    { label: "Scan VITAA", icon: Zap, description: "Fais un scan VITAA de mon entreprise — Ventes, Idees, Temps, Argent, Actifs", color: "violet", phase: "discussion" },
    { label: "Triangle du Feu", icon: Flame, description: "Analyse mon Triangle du Feu — est-ce que mon projet brule, couve ou meurt?", color: "orange", phase: "discussion" },
    { label: "Analyse de risques", icon: AlertTriangle, description: "Identifie les principaux risques pour mon entreprise", color: "pink", phase: "discussion" },
    { label: "Vision 2026", icon: Eye, description: "Travaillons sur ma vision d'entreprise pour les 12 prochains mois", color: "blue", phase: "discussion" },
  ],
  CTOB: [
    { label: "Audit technique", icon: Search, description: "Fais un audit technique de mon infrastructure", color: "violet", phase: "discussion" },
    { label: "Sprint planning", icon: Rocket, description: "Planifions le prochain sprint de developpement", color: "blue", phase: "discussion" },
    { label: "Architecture", icon: Cpu, description: "Revoyons l'architecture technique du projet", color: "indigo", phase: "discussion" },
    { label: "Debug", icon: Code, description: "J'ai un probleme technique a resoudre", color: "red", phase: "discussion" },
    { label: "Stack techno", icon: Layers, description: "Evaluons notre stack technologique actuelle", color: "amber", phase: "discussion" },
    { label: "Migration", icon: Database, description: "Planifions une migration de systeme ou de donnees", color: "emerald", phase: "discussion" },
    { label: "Sécurité infra", icon: Shield, description: "Verifions la securite de notre infrastructure", color: "orange", phase: "discussion" },
    { label: "Performance", icon: Gauge, description: "Analysons les performances et goulots d'etranglement", color: "teal", phase: "discussion" },
  ],
  CFOB: [
    { label: "Analyse financiere", icon: BarChart3, description: "Analyse ma situation financiere actuelle", color: "emerald", phase: "discussion" },
    { label: "Budget", icon: DollarSign, description: "Travaillons sur le budget et les projections", color: "blue", phase: "discussion" },
    { label: "Tresorerie", icon: TrendingUp, description: "Regardons l'etat de ma tresorerie", color: "amber", phase: "discussion" },
    { label: "ROI", icon: Target, description: "Calcule le ROI d'un investissement", color: "indigo", phase: "discussion" },
    { label: "Couts", icon: Receipt, description: "Analysons nos structures de couts et marges", color: "red", phase: "discussion" },
    { label: "Financement", icon: Landmark, description: "Explorons les options de financement disponibles", color: "violet", phase: "discussion" },
    { label: "Previsions", icon: LineChart, description: "Faisons des previsions financieres sur 12 mois", color: "teal", phase: "discussion" },
    { label: "Risques financiers", icon: AlertTriangle, description: "Evaluons nos risques financiers actuels", color: "orange", phase: "discussion" },
  ],
  CMOB: [
    { label: "Strategie marketing", icon: Megaphone, description: "Definissons une strategie marketing", color: "pink", phase: "discussion" },
    { label: "Campagne", icon: Rocket, description: "Planifions une nouvelle campagne", color: "violet", phase: "discussion" },
    { label: "Branding", icon: Briefcase, description: "Travaillons sur le positionnement de marque", color: "amber", phase: "discussion" },
    { label: "Contenu", icon: FileText, description: "Creons du contenu marketing percutant", color: "blue", phase: "discussion" },
    { label: "Reseaux sociaux", icon: Globe, description: "Optimisons notre strategie sur les reseaux sociaux", color: "cyan", phase: "discussion" },
    { label: "SEO / Visibilite", icon: Search, description: "Ameliorons notre visibilite en ligne et SEO", color: "emerald", phase: "discussion" },
    { label: "Analyse audience", icon: PieChart, description: "Analysons notre audience cible et personas", color: "indigo", phase: "discussion" },
    { label: "Lancement produit", icon: Zap, description: "Planifions le lancement d'un nouveau produit", color: "red", phase: "discussion" },
  ],
  CSOB: [
    { label: "Analyse strategique", icon: Compass, description: "Analysons notre positionnement strategique", color: "red", phase: "discussion" },
    { label: "Veille concurrentielle", icon: Search, description: "Que font nos concurrents en ce moment?", color: "amber", phase: "discussion" },
    { label: "Plan de croissance", icon: TrendingUp, description: "Elaborons un plan de croissance", color: "emerald", phase: "discussion" },
    { label: "Scenario", icon: Lightbulb, description: "Explorons differents scenarios strategiques", color: "violet", phase: "discussion" },
    { label: "Partenariats", icon: Handshake, description: "Identifions des opportunites de partenariats strategiques", color: "blue", phase: "discussion" },
    { label: "Avantage concurrentiel", icon: Award, description: "Definissons notre avantage concurrentiel unique", color: "indigo", phase: "discussion" },
    { label: "Pivots possibles", icon: GitBranch, description: "Explorons des pivots strategiques potentiels", color: "orange", phase: "discussion" },
    { label: "Cartographie marche", icon: Map, description: "Cartographions notre marche et segments cibles", color: "teal", phase: "discussion" },
  ],
  COOB: [
    { label: "Audit processus", icon: Settings, description: "Auditons nos processus operationnels", color: "orange", phase: "discussion" },
    { label: "Optimisation", icon: Wrench, description: "Optimisons nos operations", color: "blue", phase: "discussion" },
    { label: "Logistique", icon: Truck, description: "Regardons notre chaine logistique", color: "amber", phase: "discussion" },
    { label: "KPI operations", icon: Gauge, description: "Revoyons nos indicateurs operationnels", color: "emerald", phase: "discussion" },
    { label: "Checklists", icon: ClipboardCheck, description: "Creons des checklists operationnelles standardisees", color: "indigo", phase: "discussion" },
    { label: "Fournisseurs", icon: Handshake, description: "Evaluons et optimisons nos relations fournisseurs", color: "violet", phase: "discussion" },
    { label: "Qualite", icon: Award, description: "Mettons en place un controle qualite", color: "red", phase: "discussion" },
    { label: "Flux de travail", icon: GitBranch, description: "Optimisons nos flux de travail et processus", color: "teal", phase: "discussion" },
  ],
  CPOB: [
    { label: "Audit production", icon: Factory, description: "Auditons notre ligne de production", color: "amber", phase: "discussion" },
    { label: "Automatisation", icon: Cpu, description: "Quelles taches peut-on automatiser?", color: "violet", phase: "discussion" },
    { label: "5S / Lean", icon: Wrench, description: "Appliquons une methodologie Lean", color: "blue", phase: "discussion" },
    { label: "Capacite", icon: Gauge, description: "Analysons notre capacite de production", color: "emerald", phase: "discussion" },
    { label: "Maintenance", icon: Settings, description: "Planifions la maintenance preventive des equipements", color: "orange", phase: "discussion" },
    { label: "Controle qualite", icon: ClipboardCheck, description: "Mettons en place des controles qualite production", color: "red", phase: "discussion" },
    { label: "Industrie 4.0", icon: Network, description: "Explorons les technologies Industrie 4.0 applicables", color: "cyan", phase: "discussion" },
    { label: "Couts production", icon: DollarSign, description: "Analysons et reduisons nos couts de production", color: "indigo", phase: "discussion" },
  ],
  CHROB: [
    { label: "Recrutement", icon: Users, description: "Planifions un recrutement", color: "teal", phase: "discussion" },
    { label: "Culture d'equipe", icon: Heart, description: "Travaillons sur notre culture d'entreprise", color: "amber", phase: "discussion" },
    { label: "Formation", icon: GraduationCap, description: "Identifions les besoins de formation", color: "violet", phase: "discussion" },
    { label: "Retention", icon: Shield, description: "Comment retenir nos meilleurs talents?", color: "emerald", phase: "discussion" },
    { label: "Evaluation", icon: ClipboardCheck, description: "Mettons en place un processus d'evaluation", color: "blue", phase: "discussion" },
    { label: "Bien-etre", icon: Brain, description: "Ameliorons le bien-etre au travail", color: "pink", phase: "discussion" },
    { label: "Onboarding", icon: Rocket, description: "Optimisons notre processus d'integration", color: "indigo", phase: "discussion" },
    { label: "Conflits", icon: Scale, description: "Gerons une situation de conflit en equipe", color: "red", phase: "discussion" },
  ],
  CINOB: [
    { label: "Veille techno", icon: Search, description: "Quelles technologies emergentes surveiller?", color: "cyan", phase: "discussion" },
    { label: "R&D", icon: Microscope, description: "Explorons des pistes de recherche", color: "violet", phase: "discussion" },
    { label: "Prototype", icon: Rocket, description: "Concevons un prototype rapide", color: "amber", phase: "discussion" },
    { label: "Innovation", icon: Brain, description: "Brainstormons sur une innovation produit", color: "pink", phase: "discussion" },
    { label: "Brevets", icon: Lock, description: "Evaluons les opportunites de brevets et PI", color: "indigo", phase: "discussion" },
    { label: "Tendances", icon: TrendingUp, description: "Analysons les tendances de notre industrie", color: "emerald", phase: "discussion" },
    { label: "Lab d'idees", icon: Lightbulb, description: "Lancons un lab d'idees avec l'equipe", color: "orange", phase: "discussion" },
    { label: "Benchmark", icon: BarChart3, description: "Faisons un benchmark de solutions innovantes", color: "blue", phase: "discussion" },
  ],
  CROB: [
    { label: "Pipeline ventes", icon: TrendingUp, description: "Analysons notre pipeline de ventes", color: "amber", phase: "discussion" },
    { label: "Prospection", icon: Search, description: "Identifions de nouveaux prospects", color: "blue", phase: "discussion" },
    { label: "Closing", icon: Target, description: "Strategisons pour closer un deal", color: "red", phase: "discussion" },
    { label: "Revenus", icon: DollarSign, description: "Optimisons nos sources de revenus", color: "emerald", phase: "discussion" },
    { label: "CRM", icon: Users, description: "Ameliorons notre gestion de la relation client", color: "violet", phase: "discussion" },
    { label: "Pricing", icon: Receipt, description: "Revoyons notre strategie de prix", color: "indigo", phase: "discussion" },
    { label: "Upselling", icon: Zap, description: "Identifions des opportunites d'upsell et cross-sell", color: "orange", phase: "discussion" },
    { label: "Previsions ventes", icon: LineChart, description: "Faisons des previsions de ventes pour le trimestre", color: "teal", phase: "discussion" },
  ],
  CLOB: [
    { label: "Revue contrats", icon: FileText, description: "Revoyons nos contrats en cours", color: "indigo", phase: "discussion" },
    { label: "Conformite", icon: Shield, description: "Verifions notre conformite reglementaire", color: "emerald", phase: "discussion" },
    { label: "Propriete intellectuelle", icon: Lock, description: "Protegeons notre PI", color: "violet", phase: "discussion" },
    { label: "Risques juridiques", icon: Scale, description: "Evaluons nos risques juridiques", color: "red", phase: "discussion" },
    { label: "RGPD / Vie privee", icon: Fingerprint, description: "Verifions notre conformite RGPD et protection des donnees", color: "blue", phase: "discussion" },
    { label: "Litiges", icon: AlertTriangle, description: "Gerons un litige ou conflit juridique en cours", color: "orange", phase: "discussion" },
    { label: "Incorporation", icon: Landmark, description: "Conseils sur la structure corporative optimale", color: "amber", phase: "discussion" },
    { label: "Reglementation", icon: BookOpen, description: "Analysons les nouvelles reglementations de notre secteur", color: "teal", phase: "discussion" },
  ],
  CISOB: [
    { label: "Scan securite", icon: Shield, description: "Lance un scan de securite de nos systemes", color: "red", phase: "discussion" },
    { label: "Cyber-risques", icon: Siren, description: "Evaluons nos risques cyber", color: "amber", phase: "discussion" },
    { label: "Plan de continuite", icon: FileText, description: "Revoyons notre plan de continuite", color: "blue", phase: "discussion" },
    { label: "Audit acces", icon: Key, description: "Auditons les acces et permissions", color: "indigo", phase: "discussion" },
    { label: "Sensibilisation", icon: Users, description: "Planifions une formation cybersecurite pour l'equipe", color: "violet", phase: "discussion" },
    { label: "Incident response", icon: AlertTriangle, description: "Preparons un plan de reponse aux incidents", color: "orange", phase: "discussion" },
    { label: "Backup / DR", icon: Database, description: "Verifions notre strategie de backup et reprise", color: "emerald", phase: "discussion" },
    { label: "Zero Trust", icon: Lock, description: "Evaluons l'adoption d'une architecture Zero Trust", color: "teal", phase: "discussion" },
  ],
};
