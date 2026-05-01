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

// ═══ Greeting personnalisé par bot ═══
export const DEPT_GREETING: Record<string, string> = {
  CEOB: "Salut! CarlOS ici. Direction et vision — qu'est-ce qu'on attaque?",
  CTOB: "Hey Carl, Tim au rapport. Techno, archi, code — shoot.",
  CFOB: "Frank ici. Finance, budget, tresorerie — je suis pret.",
  CMOB: "Mathilde a votre service! Marketing, croissance, branding — on y va?",
  CSOB: "Simone ici. Strategie, positionnement, veille — qu'est-ce qu'on planifie?",
  COOB: "Olivier au poste. Operations, processus, logistique — dis-moi.",
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
}>> = {
  CEOB: [
    { label: "Diagnostic rapide", icon: Gauge, description: "Fais un diagnostic rapide de ma situation d'entreprise", color: "red" },
    { label: "Brainstorm", icon: Brain, description: "Lance un brainstorm sur une idee que j'ai", color: "amber" },
    { label: "Decision Go/No-Go", icon: Target, description: "Aide-moi a prendre une decision Go ou No-Go", color: "indigo" },
    { label: "Plan strategique", icon: Compass, description: "Travaillons sur mon plan strategique", color: "emerald" },
    { label: "Scan VITAA", icon: Zap, description: "Fais un scan VITAA de mon entreprise — Ventes, Idees, Temps, Argent, Actifs", color: "violet" },
    { label: "Triangle du Feu", icon: Flame, description: "Analyse mon Triangle du Feu — est-ce que mon projet brule, couve ou meurt?", color: "orange" },
    { label: "Analyse de risques", icon: AlertTriangle, description: "Identifie les principaux risques pour mon entreprise", color: "pink" },
    { label: "Vision 2026", icon: Eye, description: "Travaillons sur ma vision d'entreprise pour les 12 prochains mois", color: "blue" },
  ],
  CTOB: [
    { label: "Audit technique", icon: Search, description: "Fais un audit technique de mon infrastructure", color: "violet" },
    { label: "Sprint planning", icon: Rocket, description: "Planifions le prochain sprint de developpement", color: "blue" },
    { label: "Architecture", icon: Cpu, description: "Revoyons l'architecture technique du projet", color: "indigo" },
    { label: "Debug", icon: Code, description: "J'ai un probleme technique a resoudre", color: "red" },
    { label: "Stack techno", icon: Layers, description: "Evaluons notre stack technologique actuelle", color: "amber" },
    { label: "Migration", icon: Database, description: "Planifions une migration de systeme ou de donnees", color: "emerald" },
    { label: "Securite infra", icon: Shield, description: "Verifions la securite de notre infrastructure", color: "orange" },
    { label: "Performance", icon: Gauge, description: "Analysons les performances et goulots d'etranglement", color: "teal" },
  ],
  CFOB: [
    { label: "Analyse financiere", icon: BarChart3, description: "Analyse ma situation financiere actuelle", color: "emerald" },
    { label: "Budget", icon: DollarSign, description: "Travaillons sur le budget et les projections", color: "blue" },
    { label: "Tresorerie", icon: TrendingUp, description: "Regardons l'etat de ma tresorerie", color: "amber" },
    { label: "ROI", icon: Target, description: "Calcule le ROI d'un investissement", color: "indigo" },
    { label: "Couts", icon: Receipt, description: "Analysons nos structures de couts et marges", color: "red" },
    { label: "Financement", icon: Landmark, description: "Explorons les options de financement disponibles", color: "violet" },
    { label: "Previsions", icon: LineChart, description: "Faisons des previsions financieres sur 12 mois", color: "teal" },
    { label: "Risques financiers", icon: AlertTriangle, description: "Evaluons nos risques financiers actuels", color: "orange" },
  ],
  CMOB: [
    { label: "Strategie marketing", icon: Megaphone, description: "Definissons une strategie marketing", color: "pink" },
    { label: "Campagne", icon: Rocket, description: "Planifions une nouvelle campagne", color: "violet" },
    { label: "Branding", icon: Briefcase, description: "Travaillons sur le positionnement de marque", color: "amber" },
    { label: "Contenu", icon: FileText, description: "Creons du contenu marketing percutant", color: "blue" },
    { label: "Reseaux sociaux", icon: Globe, description: "Optimisons notre strategie sur les reseaux sociaux", color: "cyan" },
    { label: "SEO / Visibilite", icon: Search, description: "Ameliorons notre visibilite en ligne et SEO", color: "emerald" },
    { label: "Analyse audience", icon: PieChart, description: "Analysons notre audience cible et personas", color: "indigo" },
    { label: "Lancement produit", icon: Zap, description: "Planifions le lancement d'un nouveau produit", color: "red" },
  ],
  CSOB: [
    { label: "Analyse strategique", icon: Compass, description: "Analysons notre positionnement strategique", color: "red" },
    { label: "Veille concurrentielle", icon: Search, description: "Que font nos concurrents en ce moment?", color: "amber" },
    { label: "Plan de croissance", icon: TrendingUp, description: "Elaborons un plan de croissance", color: "emerald" },
    { label: "Scenario", icon: Lightbulb, description: "Explorons differents scenarios strategiques", color: "violet" },
    { label: "Partenariats", icon: Handshake, description: "Identifions des opportunites de partenariats strategiques", color: "blue" },
    { label: "Avantage concurrentiel", icon: Award, description: "Definissons notre avantage concurrentiel unique", color: "indigo" },
    { label: "Pivots possibles", icon: GitBranch, description: "Explorons des pivots strategiques potentiels", color: "orange" },
    { label: "Cartographie marche", icon: Map, description: "Cartographions notre marche et segments cibles", color: "teal" },
  ],
  COOB: [
    { label: "Audit processus", icon: Settings, description: "Auditons nos processus operationnels", color: "orange" },
    { label: "Optimisation", icon: Wrench, description: "Optimisons nos operations", color: "blue" },
    { label: "Logistique", icon: Truck, description: "Regardons notre chaine logistique", color: "amber" },
    { label: "KPI operations", icon: Gauge, description: "Revoyons nos indicateurs operationnels", color: "emerald" },
    { label: "Checklists", icon: ClipboardCheck, description: "Creons des checklists operationnelles standardisees", color: "indigo" },
    { label: "Fournisseurs", icon: Handshake, description: "Evaluons et optimisons nos relations fournisseurs", color: "violet" },
    { label: "Qualite", icon: Award, description: "Mettons en place un controle qualite", color: "red" },
    { label: "Flux de travail", icon: GitBranch, description: "Optimisons nos flux de travail et processus", color: "teal" },
  ],
  CPOB: [
    { label: "Audit production", icon: Factory, description: "Auditons notre ligne de production", color: "amber" },
    { label: "Automatisation", icon: Cpu, description: "Quelles taches peut-on automatiser?", color: "violet" },
    { label: "5S / Lean", icon: Wrench, description: "Appliquons une methodologie Lean", color: "blue" },
    { label: "Capacite", icon: Gauge, description: "Analysons notre capacite de production", color: "emerald" },
    { label: "Maintenance", icon: Settings, description: "Planifions la maintenance preventive des equipements", color: "orange" },
    { label: "Controle qualite", icon: ClipboardCheck, description: "Mettons en place des controles qualite production", color: "red" },
    { label: "Industrie 4.0", icon: Network, description: "Explorons les technologies Industrie 4.0 applicables", color: "cyan" },
    { label: "Couts production", icon: DollarSign, description: "Analysons et reduisons nos couts de production", color: "indigo" },
  ],
  CHROB: [
    { label: "Recrutement", icon: Users, description: "Planifions un recrutement", color: "teal" },
    { label: "Culture d'equipe", icon: Heart, description: "Travaillons sur notre culture d'entreprise", color: "amber" },
    { label: "Formation", icon: GraduationCap, description: "Identifions les besoins de formation", color: "violet" },
    { label: "Retention", icon: Shield, description: "Comment retenir nos meilleurs talents?", color: "emerald" },
    { label: "Evaluation", icon: ClipboardCheck, description: "Mettons en place un processus d'evaluation", color: "blue" },
    { label: "Bien-etre", icon: Brain, description: "Ameliorons le bien-etre au travail", color: "pink" },
    { label: "Onboarding", icon: Rocket, description: "Optimisons notre processus d'integration", color: "indigo" },
    { label: "Conflits", icon: Scale, description: "Gerons une situation de conflit en equipe", color: "red" },
  ],
  CINOB: [
    { label: "Veille techno", icon: Search, description: "Quelles technologies emergentes surveiller?", color: "cyan" },
    { label: "R&D", icon: Microscope, description: "Explorons des pistes de recherche", color: "violet" },
    { label: "Prototype", icon: Rocket, description: "Concevons un prototype rapide", color: "amber" },
    { label: "Innovation", icon: Brain, description: "Brainstormons sur une innovation produit", color: "pink" },
    { label: "Brevets", icon: Lock, description: "Evaluons les opportunites de brevets et PI", color: "indigo" },
    { label: "Tendances", icon: TrendingUp, description: "Analysons les tendances de notre industrie", color: "emerald" },
    { label: "Lab d'idees", icon: Lightbulb, description: "Lancons un lab d'idees avec l'equipe", color: "orange" },
    { label: "Benchmark", icon: BarChart3, description: "Faisons un benchmark de solutions innovantes", color: "blue" },
  ],
  CROB: [
    { label: "Pipeline ventes", icon: TrendingUp, description: "Analysons notre pipeline de ventes", color: "amber" },
    { label: "Prospection", icon: Search, description: "Identifions de nouveaux prospects", color: "blue" },
    { label: "Closing", icon: Target, description: "Strategisons pour closer un deal", color: "red" },
    { label: "Revenus", icon: DollarSign, description: "Optimisons nos sources de revenus", color: "emerald" },
    { label: "CRM", icon: Users, description: "Ameliorons notre gestion de la relation client", color: "violet" },
    { label: "Pricing", icon: Receipt, description: "Revoyons notre strategie de prix", color: "indigo" },
    { label: "Upselling", icon: Zap, description: "Identifions des opportunites d'upsell et cross-sell", color: "orange" },
    { label: "Previsions ventes", icon: LineChart, description: "Faisons des previsions de ventes pour le trimestre", color: "teal" },
  ],
  CLOB: [
    { label: "Revue contrats", icon: FileText, description: "Revoyons nos contrats en cours", color: "indigo" },
    { label: "Conformite", icon: Shield, description: "Verifions notre conformite reglementaire", color: "emerald" },
    { label: "Propriete intellectuelle", icon: Lock, description: "Protegeons notre PI", color: "violet" },
    { label: "Risques juridiques", icon: Scale, description: "Evaluons nos risques juridiques", color: "red" },
    { label: "RGPD / Vie privee", icon: Fingerprint, description: "Verifions notre conformite RGPD et protection des donnees", color: "blue" },
    { label: "Litiges", icon: AlertTriangle, description: "Gerons un litige ou conflit juridique en cours", color: "orange" },
    { label: "Incorporation", icon: Landmark, description: "Conseils sur la structure corporative optimale", color: "amber" },
    { label: "Reglementation", icon: BookOpen, description: "Analysons les nouvelles reglementations de notre secteur", color: "teal" },
  ],
  CISOB: [
    { label: "Scan securite", icon: Shield, description: "Lance un scan de securite de nos systemes", color: "red" },
    { label: "Cyber-risques", icon: Siren, description: "Evaluons nos risques cyber", color: "amber" },
    { label: "Plan de continuite", icon: FileText, description: "Revoyons notre plan de continuite", color: "blue" },
    { label: "Audit acces", icon: Key, description: "Auditons les acces et permissions", color: "indigo" },
    { label: "Sensibilisation", icon: Users, description: "Planifions une formation cybersecurite pour l'equipe", color: "violet" },
    { label: "Incident response", icon: AlertTriangle, description: "Preparons un plan de reponse aux incidents", color: "orange" },
    { label: "Backup / DR", icon: Database, description: "Verifions notre strategie de backup et reprise", color: "emerald" },
    { label: "Zero Trust", icon: Lock, description: "Evaluons l'adoption d'une architecture Zero Trust", color: "teal" },
  ],
};
