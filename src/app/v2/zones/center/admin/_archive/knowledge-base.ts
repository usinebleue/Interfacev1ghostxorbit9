/**
 * knowledge-base.ts — Contenu statique pour TabAide
 * V1 = contenu dans le code. V2 futur = DB editable.
 */

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

export interface KBArticle {
  id: string;
  titre: string;
  categorie: string;
  corps: string;
  tags: string[];
}

export interface FAQItem {
  question: string;
  reponse: string;
  groupe: string;
}

export interface AdminGuideSection {
  tabId: string;
  titre: string;
  description: string;
  features: string[];
}

// ═══════════════════════════════════════
// Guide Admin — description de chaque tab
// ═══════════════════════════════════════

export const ADMIN_GUIDE: AdminGuideSection[] = [
  {
    tabId: "dashboard",
    titre: "Dashboard",
    description: "Vue d'ensemble de votre instance avec les indicateurs cles (KPI), la sante du systeme et l'activite recente.",
    features: ["KPI en temps reel (tenants, utilisateurs, revenus)", "Statut des services (API, PostgreSQL, LiveKit)", "Activite et decisions recentes"],
  },
  {
    tabId: "tenants",
    titre: "Tenants",
    description: "Gestion des instances client. Creer, configurer et suspendre des organisations.",
    features: ["Liste de toutes les instances actives", "Creation de nouveaux tenants", "Configuration par tenant (vertical, tier, parametres)"],
  },
  {
    tabId: "users",
    titre: "Utilisateurs",
    description: "Gestion des comptes, invitations, approbations et sessions actives.",
    features: ["Liste des utilisateurs avec roles et statuts", "Inviter de nouveaux membres par email", "Approuver ou rejeter les demandes d'acces", "Voir et revoquer les sessions actives"],
  },
  {
    tabId: "billing",
    titre: "Facturation",
    description: "Gestion des tiers d'abonnement, overrides de prix et suivi de la consommation UT.",
    features: ["5 tiers d'abonnement (Free, Solo, Direction, C-Suite, Pioneer)", "Overrides de prix par tenant", "Suivi de la consommation d'Unites de Travail (UT)"],
  },
  {
    tabId: "monitoring",
    titre: "Monitoring",
    description: "Sante du systeme, activites recentes, tensions en cours et decisions prises.",
    features: ["Statut des services en temps reel", "Journal d'activite", "Gestion des tensions (resoudre, escalader)", "Historique des decisions avec annulation possible"],
  },
  {
    tabId: "deploy",
    titre: "Deploiement",
    description: "Pipeline de chantiers, missions COMMAND, playbooks et briefings compiles.",
    features: ["Vue pipeline des chantiers en cours", "Lancer des missions COMMAND", "Deployer des playbooks strategiques", "Compiler des briefings (quotidien, CA)"],
  },
  {
    tabId: "marketplace",
    titre: "Marketplace",
    description: "Gestion Orbit9 : membres, cellules de jumelage et matches inter-entreprises.",
    features: ["Liste des membres inscrits", "Cellules de jumelage actives", "Historique des matches et scores"],
  },
  {
    tabId: "logs",
    titre: "Logs",
    description: "6 sources de logs centralisees : decisions, auth, activites, discussions, meetings et COMMAND.",
    features: ["Decision log avec filtres par type", "Evenements d'authentification", "Journal d'activite du systeme", "Historique des discussions et meetings"],
  },
  {
    tabId: "support",
    titre: "Support",
    description: "Diagnostics IA, bibliotheques DocForge et templates de documents.",
    features: ["Diagnostics IA complets (VITAA, Triangle du Feu)", "Bibliotheques DocForge avec statut de traitement", "Catalogue de templates documentaires"],
  },
  {
    tabId: "config",
    titre: "Config",
    description: "Gouvernance CarlOS, niveaux d'autonomie des 12 bots et informations systeme.",
    features: ["Configuration de gouvernance globale", "Regler l'autonomie de chaque bot (1-5)", "Informations systeme et version"],
  },
  {
    tabId: "verticals",
    titre: "Verticaux",
    description: "Gestion des 13 verticaux industriels, regions et pionniers par secteur.",
    features: ["CRUD des verticaux industriels", "Regions geographiques associees", "Pionniers par vertical"],
  },
  {
    tabId: "training",
    titre: "Trial-Brain",
    description: "Statistiques d'entrainement BTML et missions du bot Tim (CTO).",
    features: ["Stats des runs d'entrainement", "Missions Tim en cours et completees"],
  },
  {
    tabId: "prospects",
    titre: "Prospects",
    description: "Campagnes de prospection, cibles et sessions de demonstration.",
    features: ["Gestion des campagnes", "Suivi des cibles par campagne", "Sessions de demo actives"],
  },
  {
    tabId: "analytics",
    titre: "Analytiques",
    description: "Couts API, distribution par tier de routage et economie d'Unites de Travail.",
    features: ["Couts par provider (Gemini, Claude)", "Distribution des requetes par tier (T0-T4)", "Consommation et balance UT"],
  },
  {
    tabId: "telephonie",
    titre: "Telephonie",
    description: "Appels telephoniques, authentification NIP et sessions vocales LiveKit.",
    features: ["Historique des appels entrants/sortants", "Gestion des NIP d'authentification", "Sessions vocales actives"],
  },
  {
    tabId: "setup",
    titre: "Setup",
    description: "Configuration du profil client, connexions API externes et checklist d'onboarding.",
    features: ["Profil entreprise (nom, secteur, taille)", "Grille de services connectables (Google, CRM, ERP, etc.)", "Checklist de mise en route"],
  },
  {
    tabId: "aide",
    titre: "Aide",
    description: "Guide complet de la plateforme, base de connaissances et FAQ.",
    features: ["Guide admin et utilisateur", "Articles de la base de connaissances", "FAQ par theme"],
  },
];

// ═══════════════════════════════════════
// Guide Utilisateur — comment utiliser CarlOS
// ═══════════════════════════════════════

export const USER_GUIDE_SECTIONS = [
  {
    categorie: "Navigation",
    articles: [
      { titre: "Mon Departement", corps: "Chaque bot C-Level a son propre departement avec cockpit, pipeline (chantiers/projets/missions/taches), documents et diagnostics. Cliquez sur un bot dans la sidebar pour acceder a son departement." },
      { titre: "Mon Bureau", corps: "Votre espace personnel : taches, documents, agenda, discussions et notifications. Accessible via la sidebar gauche." },
      { titre: "Mes Salles", corps: "3 salles de reunion virtuelles : Board Room (CA), War Room (crises), Think Room (ideation). Chaque salle a son propre contexte de discussion." },
    ],
  },
  {
    categorie: "Communication",
    articles: [
      { titre: "Chat avec CarlOS", corps: "Le chat central permet de discuter avec CarlOS et son equipe de 12 bots. CarlOS compose automatiquement l'equipe ideale pour votre question." },
      { titre: "Appel vocal", corps: "Lancez un appel vocal avec n'importe quel bot. La voix est generee par ElevenLabs avec une voix unique par bot." },
      { titre: "Video avatar", corps: "Activez l'avatar video pour une experience plus immersive. L'avatar synchronise les levres avec la voix du bot." },
    ],
  },
  {
    categorie: "Collaboration",
    articles: [
      { titre: "Chantiers et Projets", corps: "Organisez votre travail en chantiers (grands objectifs) contenant des projets, missions et taches. Chaque element a un responsable bot ou humain." },
      { titre: "Blueprint", corps: "Le Blueprint est votre plan strategique. Il contient les objectifs, le SWOT et la vision de votre departement ou entreprise." },
      { titre: "Discussions", corps: "Creez des discussions thematiques qui peuvent etre promues en missions ou archivees. Les discussions alimentent le contexte des bots." },
    ],
  },
  {
    categorie: "Pipeline",
    articles: [
      { titre: "Missions COMMAND", corps: "Le protocole COMMAND permet aux bots d'executer des missions de maniere autonome selon leur niveau d'autonomie configure." },
      { titre: "Playbooks", corps: "Des plans d'action pre-configures que vous pouvez deployer en un clic pour lancer un ensemble de chantiers/projets/missions." },
      { titre: "Briefings", corps: "Compilations automatiques de l'etat de vos projets. Briefing quotidien ou briefing CA pour les reunions du conseil." },
    ],
  },
];

// ═══════════════════════════════════════
// Base de connaissances — articles KB
// ═══════════════════════════════════════

export const KB_ARTICLES: KBArticle[] = [
  {
    id: "credo",
    titre: "Le protocole CREDO",
    categorie: "Concepts CarlOS",
    corps: "CREDO = Connecter, Rechercher, Exposer, Demontrer, Obtenir. C'est le protocole maitre qui gouverne toutes les interactions dans CarlOS. Chaque conversation suit naturellement ces 5 phases pour maximiser la valeur de chaque echange.",
    tags: ["credo", "protocole", "phases"],
  },
  {
    id: "vitaa",
    titre: "Les 5 piliers VITAA",
    categorie: "Concepts CarlOS",
    corps: "VITAA = Vente, Idee, Temps, Argent, Actif. Ce sont les 5 piliers de scoring qui evaluent la sante d'une entreprise sur une echelle de 0 a 100. Le Triangle du Feu determine si l'entreprise BRULE (3+ piliers forts), COUVE (2 piliers) ou MEURT (1 seul).",
    tags: ["vitaa", "piliers", "scoring", "triangle-du-feu"],
  },
  {
    id: "trisociation",
    titre: "La Trisociation",
    categorie: "Concepts CarlOS",
    corps: "Chaque bot C-Level combine 3 personnalites cognitives (OS) : un Primaire, un Calibrateur et un Amplificateur. Par exemple, CarlOS combine Bezos (vision) + Munger (jugement) + Churchill (leadership). Cette combinaison unique donne a chaque bot sa personnalite distinctive.",
    tags: ["trisociation", "os", "personnalite", "ghosts"],
  },
  {
    id: "command",
    titre: "Le moteur COMMAND",
    categorie: "Concepts CarlOS",
    corps: "COMMAND est le systeme d'execution autonome des bots. Selon leur niveau d'autonomie (1 a 5), les bots peuvent executer des missions avec plus ou moins d'approbation humaine requise. Niveau 1 = tout approuver, Niveau 5 = autonomie totale.",
    tags: ["command", "autonomie", "missions", "execution"],
  },
  {
    id: "ghosts",
    titre: "Les 12 Ghosts",
    categorie: "Concepts CarlOS",
    corps: "Les Ghosts sont les personnalites cognitives qui animent les bots : G1 Bezos, G2 Jobs, G3 Musk, G4 Sun Tzu, G5 Munger, G6 Marc Aurele, G7 Churchill, G8 Disney, G9 Tesla (constante universelle), G10 Buffett, G11 Curie, G12 Oprah.",
    tags: ["ghosts", "personnalites", "cognitif"],
  },
  {
    id: "ut",
    titre: "Les Unites de Travail (UT)",
    categorie: "Facturation",
    corps: "Les UT sont l'unite de valeur de CarlOS. Chaque interaction avec les bots consomme des UT selon la complexite (tier de routage). Votre abonnement inclut un nombre d'UT mensuelles. Le routage intelligent (80%+ sur tiers gratuits) optimise votre consommation.",
    tags: ["ut", "unites-travail", "facturation", "routage"],
  },
  {
    id: "orbit9",
    titre: "Orbit9 — Moteur de jumelage",
    categorie: "Reseau",
    corps: "Orbit9 est le moteur de developpement economique de CarlOS. Il analyse les profils des entreprises membres pour creer des cellules de jumelage et faciliter les transactions inter-entreprises. Le scoring IA evalue la compatibilite des matches.",
    tags: ["orbit9", "jumelage", "matching", "reseau"],
  },
  {
    id: "btml",
    titre: "BTML — Brain Team Modeling Language",
    categorie: "Concepts CarlOS",
    corps: "BTML est le framework proprietary qui modelise l'intelligence d'affaires. Il utilise un tableau periodique de 220+ elements (Savoir, Pratique, Technologie, Humain) pour creer des reactions cognitives. C'est le moteur sous le capot de GhostX.",
    tags: ["btml", "framework", "tableau-periodique"],
  },
  {
    id: "routage",
    titre: "Le routage 5 tiers",
    categorie: "Administration",
    corps: "CarlOS utilise un routage intelligent a 5 niveaux : T0 (cache/regex, gratuit), T1 (Gemini Flash, gratuit), T2 (Gemini Pro, gratuit), T3 (Claude Sonnet), T4 (Claude Opus). 80%+ des requetes sont traitees sur les tiers gratuits pour optimiser les couts.",
    tags: ["routage", "tiers", "couts", "optimisation"],
  },
  {
    id: "gouvernance",
    titre: "Gouvernance CarlOS",
    categorie: "Administration",
    corps: "Le protocole de gouvernance regit comment les decisions sont prises et tracees. Chaque action significative est logguee dans le decision_log. Les tensions (problemes detectes) declenchent des cascades d'actions selon le niveau d'autonomie configure.",
    tags: ["gouvernance", "decisions", "tensions", "autonomie"],
  },
];

// ═══════════════════════════════════════
// FAQ — Questions frequentes
// ═══════════════════════════════════════

export const FAQ_ITEMS: FAQItem[] = [
  {
    groupe: "Premiers pas",
    question: "Comment commencer avec CarlOS ?",
    reponse: "Apres la connexion, vous arrivez sur le departement CarlOS (CEO). Explorez les 12 departements via la sidebar gauche, lancez votre premiere discussion dans le chat central, et consultez votre Blueprint pour definir vos objectifs.",
  },
  {
    groupe: "Premiers pas",
    question: "Comment naviguer entre les departements ?",
    reponse: "Cliquez sur un bot dans la section 'Mon Equipe' de la sidebar gauche. Chaque bot a son propre departement avec cockpit, pipeline, documents et diagnostics.",
  },
  {
    groupe: "Bots",
    question: "Combien de bots ai-je acces ?",
    reponse: "Cela depend de votre abonnement : Free (1 bot), Solo (1 bot), Direction (6 bots), C-Suite (12 bots), Pioneer (12 bots). Chaque bot a une specialite C-Level unique.",
  },
  {
    groupe: "Bots",
    question: "Comment changer le niveau d'autonomie d'un bot ?",
    reponse: "Allez dans Config > Autonomie Bots. Chaque bot a un niveau de 1 (tout approuver) a 5 (autonomie totale). Le niveau determine ce que le bot peut faire sans votre approbation.",
  },
  {
    groupe: "Facturation",
    question: "Comment fonctionnent les Unites de Travail (UT) ?",
    reponse: "Chaque interaction consomme des UT selon sa complexite. Le routage intelligent envoie 80%+ des requetes sur des tiers gratuits (Gemini Flash/Pro). Votre balance UT est visible dans Analytics.",
  },
  {
    groupe: "Facturation",
    question: "Comment changer mon abonnement ?",
    reponse: "Rendez-vous dans Facturation > Abonnement pour voir votre tier actuel. Pour changer de tier, contactez votre administrateur ou l'equipe GhostX.",
  },
  {
    groupe: "Integrations",
    question: "Quels services puis-je connecter ?",
    reponse: "CarlOS supporte : Google Workspace (Calendar, Drive, Docs), CRM (HubSpot, Pipedrive, Salesforce), ERP (SAP, Odoo, NetSuite), Communication (Slack, Teams), Comptabilite (QuickBooks, Xero) et E-commerce (Shopify).",
  },
  {
    groupe: "Integrations",
    question: "Comment configurer une integration ?",
    reponse: "Allez dans Setup > Connexions API. Cliquez sur 'Configurer' a cote du service souhaite, entrez vos credentials, puis cliquez sur 'Tester' pour verifier la connexion.",
  },
  {
    groupe: "Securite",
    question: "Comment sont proteges mes donnees ?",
    reponse: "CarlOS utilise HTTPS, JWT pour l'authentification, rate limiting (30 req/min), CORS restrictif, et chiffrement des credentials. Les donnees sont isolees par tenant (organisation).",
  },
  {
    groupe: "Securite",
    question: "Comment revoquer une session active ?",
    reponse: "Allez dans Utilisateurs > Sessions. Vous verrez toutes les sessions actives avec leur IP et date de connexion. Cliquez sur 'Revoquer' pour deconnecter une session.",
  },
];
