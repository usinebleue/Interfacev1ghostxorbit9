"use client";

/**
 * SimPlaybookStore.tsx — Simulation du Playbook Store (Marketplace)
 * Browse, preview, install playbooks across 6 categories
 * Self-contained: TopBar, category tabs, split-screen 40/60, install flow
 */

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Search,
  Star,
  Download,
  CheckCircle2,
  Loader2,
  Building2,
  Handshake,
  User,
  Brain,
  Mic,
  Globe,
  Shield,
  Award,
  Crown,
  Sparkles,
  ChevronRight,
  BookOpen,
  Target,
  Send,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";

const UB_BLUE = "#073E5A";

type Category = "operationnels" | "faas" | "personnels" | "cognitifs" | "conference" | "communautaires";

interface Playbook {
  id: string;
  nom: string;
  description: string;
  bot?: string;
  botCode?: string;
  auteur?: string;
  prix: string;
  prixType: "ut" | "dollar" | "gratuit" | "ut-mensuel";
  etoiles: number;
  installations: number;
  category: Category;
  badge?: string;
  badgeColor?: string;
  items: string[];
  vitaa: string[];
  avis: { auteur: string; note: number; texte: string }[];
  similaires: string[];
  fondateur?: boolean;
  pro?: boolean;
  legende?: boolean;
}

const CATEGORIES: { id: Category; label: string; icon: React.ElementType; count: number }[] = [
  { id: "operationnels", label: "Operationnels", icon: Building2, count: 345 },
  { id: "faas", label: "FAAS Pro", icon: Handshake, count: 166 },
  { id: "personnels", label: "Personnels", icon: User, count: 240 },
  { id: "cognitifs", label: "Cognitifs", icon: Brain, count: 12 },
  { id: "conference", label: "Conference AI", icon: Mic, count: 33 },
  { id: "communautaires", label: "Communautaires", icon: Globe, count: 89 },
];

const PLAYBOOKS: Playbook[] = [
  // --- Operationnels ---
  {
    id: "op-1", nom: "Optimisation Chaine de Production", category: "operationnels",
    description: "Playbook complet pour analyser et optimiser votre chaine de production manufacturiere. Identifie les goulots, reduit les temps morts et augmente le rendement de 15-25%.",
    bot: "Paco", botCode: "CPOB", prix: "75 UT", prixType: "ut", etoiles: 4.8, installations: 234,
    items: ["Audit complet de la chaine (12 points)", "Templates d'analyse des goulots", "Plan d'action 90 jours", "KPIs de suivi automatises", "Checklist maintenance preventive"],
    vitaa: ["V+15%", "T-20%", "A+10%"],
    avis: [
      { auteur: "Marc D. — Metalco Inc.", note: 5, texte: "On a reduit nos temps morts de 22% en 6 semaines. Paco nous guidait etape par etape." },
      { auteur: "Julie R. — Plastiques QC", note: 5, texte: "Le meilleur investissement de l'annee. ROI en 3 semaines." },
    ],
    similaires: ["Lean Manufacturing 5S", "Maintenance Preventive TPM", "Gestion Inventaire JIT"],
  },
  {
    id: "op-2", nom: "Audit Cybersecurite PME", category: "operationnels",
    description: "Sebastien analyse votre infrastructure, identifie les vulnerabilites critiques et deploie un plan de securisation adapte aux PME. Conforme aux normes ISO 27001.",
    bot: "Sebastien", botCode: "CISOB", prix: "100 UT", prixType: "ut", etoiles: 4.9, installations: 189,
    items: ["Scan complet infrastructure", "Rapport vulnerabilites classe par priorite", "Plan de correction 60 jours", "Formation equipe (5 modules)", "Monitoring continu active"],
    vitaa: ["A+25%", "I+15%"],
    avis: [
      { auteur: "Antoine L. — TechSolutions", note: 5, texte: "Sebastien a trouve 3 failles critiques qu'on ignorait. Corrigees en 48h." },
      { auteur: "Nathalie B. — ServicePro", note: 4, texte: "Tres complet. La formation equipe a change notre culture securite." },
    ],
    similaires: ["Politique Mots de Passe", "Plan Continuite Affaires", "Conformite RGPD"],
  },
  {
    id: "op-3", nom: "Plan Marketing Digital 90 jours", category: "operationnels",
    description: "Mathilde cree ton plan marketing digital complet: strategie contenu, calendrier editorial, campagnes pub, et KPIs de performance. Adapte aux PME manufacturieres.",
    bot: "Mathilde", botCode: "CMOB", prix: "50 UT", prixType: "ut", etoiles: 4.7, installations: 312,
    items: ["Audit presence numerique actuelle", "Strategie contenu 90 jours", "Calendrier editorial pre-rempli", "Templates de campagnes pub", "Dashboard KPIs automatise"],
    vitaa: ["V+20%", "I+10%", "A+5%"],
    avis: [
      { auteur: "Steve M. — DistribTech", note: 5, texte: "Nos leads ont augmente de 340% en 2 mois. Mathilde est une machine." },
      { auteur: "Caroline P. — BioAliments", note: 4, texte: "Le calendrier editorial est incroyable. On poste sans y penser." },
    ],
    similaires: ["Branding PME Complet", "SEO Local Avance", "Strategie LinkedIn B2B"],
  },
  // --- FAAS Pro ---
  {
    id: "faas-1", nom: "Activer son reseau de distributeurs", category: "faas",
    description: "Rich deploie un programme complet d'activation de ton reseau de distribution. De la segmentation au suivi des performances, chaque distributeur devient un partenaire actif.",
    bot: "Rich", botCode: "CROB", prix: "80 UT", prixType: "ut", etoiles: 4.6, installations: 98,
    badge: "FAAS-A", badgeColor: "bg-purple-100 text-purple-700",
    items: ["Segmentation distributeurs (A/B/C)", "Programme d'incentives personnalise", "Kit de vente par distributeur", "Dashboard suivi par canal", "Playbook re-activation dormants"],
    vitaa: ["V+30%", "A+20%"],
    avis: [
      { auteur: "Francois T. — EquipMax", note: 5, texte: "On a reactive 12 distributeurs dormants en 3 semaines. Revenus +45%." },
      { auteur: "Isabelle G. — OutilsPro", note: 4, texte: "Le kit de vente par distributeur est genial. Chacun a son approche ciblee." },
    ],
    similaires: ["Pipeline Ventes B2B", "Account-Based Marketing", "Programme Partenaires"],
  },
  {
    id: "faas-2", nom: "Programme Ambassadeurs", category: "faas",
    description: "Mathilde cree ton programme ambassadeurs de A a Z: identification, recrutement, contenu, recompenses et mesure d'impact. Transforme tes clients en vendeurs.",
    bot: "Mathilde", botCode: "CMOB", prix: "60 UT", prixType: "ut", etoiles: 4.5, installations: 76,
    badge: "FAAS-S", badgeColor: "bg-pink-100 text-pink-700",
    items: ["Criteres de selection ambassadeurs", "Programme de recrutement automatise", "Kit contenu ambassadeur (templates)", "Systeme de recompenses / UT", "Tableau de bord impact"],
    vitaa: ["V+15%", "I+20%", "A+10%"],
    avis: [
      { auteur: "Marie-Eve L. — UsineVerte", note: 5, texte: "15 ambassadeurs recrutes en 1 mois. Nos referrals ont explose." },
    ],
    similaires: ["Strategie Referral B2B", "Programme Fidelite", "Communaute Clients VIP"],
  },
  {
    id: "faas-3", nom: "Advisory Board Setup", category: "faas",
    description: "CarlOS t'aide a monter ton comite consultatif: selection des membres, structure des rencontres, gouvernance et suivi des recommandations. Inspire des meilleures pratiques.",
    bot: "CarlOS", botCode: "CEOB", prix: "120 UT", prixType: "ut", etoiles: 4.9, installations: 54,
    badge: "FAAS-As", badgeColor: "bg-amber-100 text-amber-700",
    items: ["Profils ideaux pour ton board", "Structure de gouvernance", "Template ordre du jour trimestriel", "Matrice competences vs besoins", "Protocole de suivi decisions"],
    vitaa: ["I+25%", "A+15%", "V+10%"],
    avis: [
      { auteur: "Carl F. — Usine Bleue", note: 5, texte: "J'ai monte 3 advisory boards dans ma carriere. Ce playbook capture tout ce que j'ai appris." },
      { auteur: "Jean-Pierre T. — MetalPro", note: 5, texte: "Mon board est en place depuis 2 mois. Les insights sont incroyables." },
    ],
    similaires: ["Gouvernance PME", "Board Room Strategique", "Comite Aviseur"],
  },
  // --- Personnels ---
  {
    id: "perso-1", nom: "Plan Retraite REER/CELI Optimise", category: "personnels",
    description: "Frank optimise ta strategie REER/CELI selon ton profil fiscal quebecois. Maximise tes deductions, planifie tes retraits et simule differents scenarios de retraite.",
    bot: "Frank", botCode: "CFOB", prix: "29$", prixType: "dollar", etoiles: 4.8, installations: 187,
    badge: "Quebecois", badgeColor: "bg-blue-100 text-blue-700",
    items: ["Analyse fiscale personnalisee", "Strategie REER vs CELI optimale", "Simulation retraite (3 scenarios)", "Calendrier de cotisations", "Suivi rendement annuel"],
    vitaa: ["A+30%", "T+15%"],
    avis: [
      { auteur: "Martin R. — Entrepreneur", note: 5, texte: "J'economise 4,200$ d'impots par annee grace a la strategie de Frank." },
      { auteur: "Sylvie L. — Gestionnaire", note: 5, texte: "La simulation de retraite m'a ouvert les yeux. Je suis en avance sur mon plan." },
    ],
    similaires: ["Incorporation vs Salarie", "Planification Successorale", "Optimisation Fiscale PME"],
  },
  {
    id: "perso-2", nom: "Gestion Budget Familial", category: "personnels",
    description: "Frank t'aide a prendre le controle de tes finances familiales. Budget intelligent, objectifs d'epargne, reduction des depenses et alertes automatiques.",
    bot: "Frank", botCode: "CFOB", prix: "Gratuit", prixType: "gratuit", etoiles: 4.7, installations: 423,
    items: ["Template budget mensuel personnalise", "Categorisation automatique depenses", "Objectifs d'epargne avec suivi", "Alertes depassement de budget"],
    vitaa: ["A+20%", "T+10%"],
    avis: [
      { auteur: "Karine M. — Maman 3 enfants", note: 5, texte: "On a epargne 800$ par mois juste en suivant le plan de Frank." },
    ],
    similaires: ["Planification REEE Enfants", "Gestion Dettes", "Budget Voyage Familial"],
  },
  {
    id: "perso-3", nom: "Coaching Separation Amiable", category: "personnels",
    description: "Un accompagnement sensible et structure pour traverser une separation. Aspects legaux, financiers et emotionnels couverts par une equipe specialisee.",
    bot: "Destiny + Loulou", botCode: "CLOB", prix: "49$", prixType: "dollar", etoiles: 4.6, installations: 67,
    items: ["Guide etape par etape (12 phases)", "Checklist documents legaux", "Partage d'actifs — simulateur", "Plan de co-parentalite", "Ressources soutien emotionnel"],
    vitaa: ["T+20%", "A+10%"],
    avis: [
      { auteur: "Anonyme", note: 5, texte: "Ca m'a aide a garder la tete froide dans un moment tres difficile." },
    ],
    similaires: ["Gestion du Stress", "Mediation Familiale", "Nouveau Depart Financier"],
  },
  // --- Cognitifs (GOLDEN) ---
  {
    id: "cog-1", nom: "Jean-Pierre Tremblay — Maitre Vendeur Equipements Lourds", category: "cognitifs",
    description: "Le cerveau de Jean-Pierre: 35 ans de vente d'equipements lourds au Quebec. Connait chaque objection, chaque type de client, chaque cycle de vente saisonnier. Upload son expertise dans ton Ghost.",
    prix: "500 UT", prixType: "ut", etoiles: 4.9, installations: 47, fondateur: true,
    items: ["Base de connaissances 35 ans d'experience", "312 objections + reponses", "Cycles de vente saisonniers documentes", "Reseau de 200+ contacts qualifies", "Scripts de closing adaptes par secteur"],
    vitaa: ["V+40%", "I+30%", "A+20%"],
    avis: [
      { auteur: "Patrick L. — Equipements ABC", note: 5, texte: "J'ai uploade Jean-Pierre dans mon Ghost Ventes. Mes juniors vendent comme des seniors maintenant." },
      { auteur: "Luc B. — MachineriePro", note: 5, texte: "Les objections pre-mappees m'ont sauve 3 deals cette semaine." },
    ],
    similaires: ["Expert Vente Automobile", "Maitre Neg. Immobilier", "Stratege Appels d'Offres"],
  },
  {
    id: "cog-2", nom: "Marie-Claude Lavoie — Experte Lean Manufacturing", category: "cognitifs",
    description: "30 ans d'expertise en Lean Manufacturing et Kaizen. A transforme 47 usines au Quebec. Son cerveau IA connait chaque piege, chaque raccourci et chaque KPI qui compte.",
    prix: "1 500 UT", prixType: "ut", etoiles: 4.8, installations: 23, pro: true,
    items: ["47 cas de transformation documentes", "Methodologie Lean adaptee PME QC", "Templates Kaizen + 5S + Kanban", "Matrice de priorites par industrie", "Coaching virtuel continu"],
    vitaa: ["T-30%", "V+20%", "A+15%"],
    avis: [
      { auteur: "Alain M. — Fonderie Beauce", note: 5, texte: "Marie-Claude a vu des problemes qu'on ne voyait plus apres 20 ans. Transformation incroyable." },
    ],
    similaires: ["Expert Qualite ISO 9001", "Automatisation Industrielle", "Gestion Chaine Approvisionnement"],
  },
  {
    id: "cog-3", nom: "Carl Fugere — Stratege 7 Entreprises, 50M$ Ventes", category: "cognitifs",
    description: "Le cerveau de Carl: 26 ans d'entrepreneuriat, 7 entreprises, 50M$+ en ventes. Pattern recognition unique sur le scaling de PME, le leadership et la vente B2B au Quebec.",
    prix: "5 000 UT", prixType: "ut", etoiles: 5.0, installations: 156, legende: true,
    items: ["26 ans de patterns entrepreneuriaux", "7 modeles d'affaires documentes", "Methode CREDO proprietaire", "Reseau REAI (130+ manufacturiers)", "Diagnostic CEO instantane"],
    vitaa: ["V+50%", "I+40%", "A+30%", "T-25%"],
    avis: [
      { auteur: "Marie-Eve D. — PDG TechNova", note: 5, texte: "C'est comme avoir Carl dans ma poche. Ses patterns m'ont aide a eviter 2 erreurs majeures." },
      { auteur: "Robert G. — Fondateur SteelForge", note: 5, texte: "5000 UT bien investis. J'ai recupere mon investissement en 2 semaines." },
      { auteur: "Sophie T. — DG AlimentsPro", note: 5, texte: "Le diagnostic CEO est d'une precision chirurgicale. Ca vaut de l'or." },
    ],
    similaires: ["Stratege Acquisition PME", "Expert Scaling B2B", "Mentor CEO Serial"],
  },
  // --- Conference AI ---
  {
    id: "conf-1", nom: "Podcast Package — Studio Complet", category: "conference",
    description: "Tout ce qu'il faut pour lancer ton podcast professionnel: structure, scripts, invitations, post-production et distribution. L'IA gere 80% du travail.",
    prix: "200 UT + 50/mois", prixType: "ut-mensuel", etoiles: 4.9, installations: 45,
    items: ["Structure d'episodes (12 templates)", "Scripts d'introduction/conclusion", "Generateur d'invitations personnalisees", "Post-production automatisee", "Distribution multi-plateforme"],
    vitaa: ["I+25%", "V+15%"],
    avis: [
      { auteur: "Eric D. — PodcastTech", note: 5, texte: "J'ai lance mon podcast en 3 jours au lieu de 3 mois. Qualite pro." },
    ],
    similaires: ["Webinaire Automatise", "Newsletter Pro", "Conference Virtuelle"],
  },
  {
    id: "conf-2", nom: "Closing Assiste en Video", category: "conference",
    description: "Rich t'accompagne en temps reel pendant tes calls de vente video. Suggestions de reponses, detection d'objections et analyse post-call automatique.",
    bot: "Rich", botCode: "CROB", prix: "200 UT", prixType: "ut", etoiles: 4.7, installations: 89,
    items: ["Assistant temps reel en video call", "Detection d'objections automatique", "Suggestions de reponse contextuelles", "Analyse post-call avec scoring", "Historique et patterns par client"],
    vitaa: ["V+35%", "T-15%"],
    avis: [
      { auteur: "Maxime P. — SaaSVentes", note: 5, texte: "Mon taux de close est passe de 22% a 38%. Rich voit des choses que je manque." },
    ],
    similaires: ["Pre-Call Intelligence", "Negociation Avancee", "CRM Intelligent"],
  },
  {
    id: "conf-3", nom: "Pre-entrevue RH Automatisee", category: "conference",
    description: "Helene conduit les pre-entrevues RH par video: questions adaptees au poste, scoring automatique, rapport detaille et recommandation. Sauve 70% du temps de recrutement.",
    bot: "Helene", botCode: "CHROB", prix: "100 UT", prixType: "ut", etoiles: 4.8, installations: 134,
    items: ["Questions personnalisees par poste", "Scoring automatique (10 criteres)", "Rapport detaille par candidat", "Detection red flags", "Recommandation embauche"],
    vitaa: ["T-70%", "I+15%"],
    avis: [
      { auteur: "Diane L. — RH Solutions", note: 5, texte: "On a filtre 200 candidats en 2 jours. Helene est plus rapide que 3 recruteurs." },
    ],
    similaires: ["Onboarding Automatise", "Plan Formation Equipe", "Evaluation 360"],
  },
  // --- Communautaires ---
  {
    id: "comm-1", nom: "Flow de vente B2B SaaS", category: "communautaires",
    description: "Un flow complet de vente B2B pour les startups SaaS. De la prospection au closing, chaque etape est documentee avec des templates et des scripts.",
    auteur: "@marc_tech", prix: "45 UT", prixType: "ut", etoiles: 4.3, installations: 67,
    items: ["Sequence prospection (7 touchpoints)", "Templates emails froids", "Script demo produit", "Matrice de qualification BANT"],
    vitaa: ["V+20%"],
    avis: [
      { auteur: "Alex K. — StartupMTL", note: 4, texte: "Bon point de depart. J'ai personnalise les templates pour notre vertical." },
    ],
    similaires: ["Pipeline Outbound", "Strategie Inbound B2B", "Growth Hacking SaaS"],
  },
  {
    id: "comm-2", nom: "Gestion Chantier Construction", category: "communautaires",
    description: "Playbook terrain pour la gestion de chantiers de construction: planification, coordination des sous-traitants, suivi budgetaire et rapports automatises.",
    auteur: "@construction_qc", prix: "60 UT", prixType: "ut", etoiles: 4.5, installations: 43,
    items: ["Planification Gantt par phase", "Checklist sous-traitants", "Suivi budgetaire temps reel", "Rapports de chantier automatises", "Gestion des non-conformites"],
    vitaa: ["T-25%", "A+15%"],
    avis: [
      { auteur: "Martin G. — ConstructionQC", note: 5, texte: "Enfin un playbook qui comprend la realite des chantiers au Quebec." },
    ],
    similaires: ["Gestion Projets Renovation", "Soumission Automatisee", "Securite Chantier SST"],
  },
];

function PrixBadge({ prix, type, small }: { prix: string; type: "ut" | "dollar" | "gratuit" | "ut-mensuel"; small?: boolean }) {
  const base = small ? "text-[7px] px-1.5 py-0.5" : "text-[9px] px-2.5 py-1";
  switch (type) {
    case "ut":
      return <span className={cn(base, "font-bold rounded-full bg-blue-100 text-blue-700")}>{prix}</span>;
    case "ut-mensuel":
      return <span className={cn(base, "font-bold rounded-full bg-blue-100 text-blue-700")}>{prix}</span>;
    case "dollar":
      return <span className={cn(base, "font-bold rounded-full bg-green-100 text-green-700")}>{prix}</span>;
    case "gratuit":
      return <span className={cn(base, "font-bold rounded-full bg-emerald-100 text-emerald-700")}>Gratuit</span>;
  }
}

function SBubble({ code, children, collapsed }: { code: string; children: React.ReactNode; collapsed: boolean }) {
  const bot = BOT_COLORS[code];
  if (!bot) return null;
  if (collapsed) {
    return (
      <div className="flex gap-2 items-center opacity-60">
        <BotAvatar code={code} size="sm" />
        <div className="text-[9px] text-gray-400">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <BotAvatar code={code} size="md" />
      <div className={cn("bg-white border rounded-xl rounded-tl-none px-3 py-2.5 max-w-[88%] shadow-sm border-l-2", bot.border)}>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-[11px] font-semibold", bot.text)}>{bot.name}</span>
          <span className="text-[9px] text-gray-400">{bot.role}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function SBtn({ onClick, icon: Icon, label }: { onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button onClick={onClick}
        className="text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-blue-600 hover:bg-blue-700">
        <Icon className="h-3.5 w-3.5" /> {label}
      </button>
    </div>
  );
}

export function SimPlaybookStore({ onBack }: { onBack: () => void }) {
  const [activeCategory, setActiveCategory] = useState<Category>("operationnels");
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [installing, setInstalling] = useState(false);
  const [installStep, setInstallStep] = useState(0);
  const [installDone, setInstallDone] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const [chatStage, setChatStage] = useState(0);

  const filtered = PLAYBOOKS.filter(p => {
    if (p.category !== activeCategory) return false;
    if (searchQuery && !p.nom.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    setSelectedPlaybook(null);
    setSearchQuery("");
    setChatStage(0);
  }, [activeCategory]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [selectedPlaybook, installDone, chatStage]);

  useEffect(() => {
    if (detailRef.current) detailRef.current.scrollTop = 0;
  }, [selectedPlaybook]);

  // Install flow
  useEffect(() => {
    if (!installing) return;
    if (installStep >= 4) {
      setInstalling(false);
      setInstallDone(true);
      return;
    }
    const timer = setTimeout(() => setInstallStep(s => s + 1), 1000);
    return () => clearTimeout(timer);
  }, [installing, installStep]);

  const startInstall = () => {
    setInstalling(true);
    setInstallStep(0);
    setInstallDone(false);
    setChatStage(2);
  };

  const selectPlaybook = (pb: Playbook) => {
    setSelectedPlaybook(pb);
    setInstallDone(false);
    setInstalling(false);
    setChatStage(1);
  };

  const isCognitif = activeCategory === "cognitifs";

  const chatContent = (
    <div className="space-y-3">
      <SBubble code="CEOB" collapsed={chatStage > 0}>
        <TypewriterText
          text="Bienvenue dans le Playbook Store! 885 playbooks classes en 6 categories. Selectionne une categorie et un playbook pour voir les details. Les Cognitifs sont nouveaux — des cerveaux humains uploadables dans ton Ghost."
          speed={8}
          onComplete={() => {}}
        />
      </SBubble>

      {chatStage >= 1 && selectedPlaybook && (
        <SBubble code={selectedPlaybook.botCode || "CEOB"} collapsed={chatStage > 1}>
          <TypewriterText
            text={`${selectedPlaybook.nom} — ${selectedPlaybook.etoiles} etoiles, ${selectedPlaybook.installations} installations. ${selectedPlaybook.description.slice(0, 120)}...`}
            speed={8}
            onComplete={() => {}}
          />
          {chatStage === 1 && (
            <SBtn onClick={startInstall} icon={Download} label="Installer ce playbook" />
          )}
        </SBubble>
      )}

      {chatStage >= 2 && installDone && (
        <SBubble code="CEOB" collapsed={false}>
          <TypewriterText
            text="Playbook installe avec succes! Les bots assignes sont actifs et prets a travailler. Tu peux lancer ta premiere mission directement depuis le playbook."
            speed={8}
            onComplete={() => {}}
          />
        </SBubble>
      )}
    </div>
  );

  function LeftPanel() {
    return (
      <div className="w-[40%] flex flex-col border-r bg-white">
        {/* Header */}
        <div className="h-12 flex items-center px-3 gap-2 text-white shrink-0" style={{ backgroundColor: UB_BLUE }}>
          <BookOpen className="h-4 w-4" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold truncate">Playbook Store</p>
            <p className="text-[8px] opacity-70">885 playbooks disponibles</p>
          </div>
          <Sparkles className="h-4 w-4 opacity-60" />
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b overflow-x-auto">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer",
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
                  cat.id === "cognitifs" && !isActive && "text-amber-600 hover:bg-amber-50",
                )}
              >
                <Icon className="h-2.5 w-2.5" />
                {cat.label}
                <span className={cn("text-[7px]", isActive ? "text-gray-300" : "text-gray-400")}>({cat.count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="px-2 py-1.5 border-b">
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2.5 py-1 border">
            <Search className="h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher un playbook..."
              className="flex-1 text-[9px] bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Playbook list */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
          {filtered.length === 0 && (
            <div className="text-center text-[9px] text-gray-400 py-8">Aucun playbook trouve</div>
          )}
          {filtered.map(pb => (
            <button
              key={pb.id}
              onClick={() => selectPlaybook(pb)}
              className={cn(
                "w-full text-left border rounded-xl px-3 py-2.5 transition-all cursor-pointer",
                selectedPlaybook?.id === pb.id
                  ? "bg-blue-50 border-blue-300 shadow-sm"
                  : "bg-white border-gray-200 hover:shadow-sm hover:border-gray-300",
                isCognitif && "border-amber-200 hover:border-amber-400",
                isCognitif && selectedPlaybook?.id === pb.id && "bg-amber-50 border-amber-400",
              )}
            >
              <div className="flex items-start gap-2">
                {pb.botCode ? (
                  <BotAvatar code={pb.botCode} size="sm" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[9px] shrink-0 font-medium text-gray-500">
                    {pb.auteur ? pb.auteur.slice(1, 3).toUpperCase() : "AI"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-[9px] font-semibold text-gray-800 truncate", isCognitif && "text-amber-900")}>{pb.nom}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[8px] text-gray-400">{pb.bot || pb.auteur || "AI"}</span>
                    <span className="flex items-center gap-0.5 text-[8px] text-amber-500">
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />{pb.etoiles}
                    </span>
                    <span className="flex items-center gap-0.5 text-[8px] text-gray-400">
                      <Download className="h-2.5 w-2.5" />{pb.installations}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <PrixBadge prix={pb.prix} type={pb.prixType} small />
                    {pb.badge && (
                      <span className={cn("text-[7px] font-bold px-1.5 py-0.5 rounded-full", pb.badgeColor)}>{pb.badge}</span>
                    )}
                    {pb.fondateur && <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Fondateur</span>}
                    {pb.pro && <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Pro</span>}
                    {pb.legende && <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-200 to-yellow-100 text-amber-800">Legende</span>}
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 mt-1 shrink-0" />
              </div>
            </button>
          ))}
        </div>

        {/* Chat mini */}
        <div className="border-t bg-gray-50">
          <div ref={chatRef} className="max-h-[180px] overflow-y-auto px-2 py-2">
            {chatContent}
          </div>
          <div className="border-t px-2 py-1.5 flex items-center gap-2">
            <input type="text" placeholder="Question sur les playbooks..." className="flex-1 text-[9px] bg-white rounded-full px-3 py-1.5 border outline-none focus:ring-1 focus:ring-blue-300" readOnly />
            <Send className="h-3.5 w-3.5 text-gray-300" />
          </div>
        </div>
      </div>
    );
  }

  function RightPanel() {
    if (!selectedPlaybook) {
      return (
        <div className="w-[60%] flex flex-col bg-gray-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-[11px] text-gray-400 font-medium">Selectionne un playbook pour voir les details</p>
              <p className="text-[9px] text-gray-300 mt-1">885 playbooks dans le store</p>
            </div>
          </div>
        </div>
      );
    }

    const pb = selectedPlaybook;
    const isCog = pb.category === "cognitifs";

    return (
      <div className="w-[60%] flex flex-col bg-gray-50">
        <div ref={detailRef} className="flex-1 overflow-y-auto">
          {/* Hero header */}
          <div className={cn(
            "px-4 py-4 border-b",
            isCog ? "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50" : "bg-white",
          )}>
            <div className="flex items-start gap-3">
              {pb.botCode ? (
                <BotAvatar code={pb.botCode} size="lg" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                  {pb.auteur ? pb.auteur.slice(1, 3).toUpperCase() : "AI"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className={cn("text-[13px] font-bold text-gray-900", isCog && "text-amber-900")}>{pb.nom}</h2>
                  {pb.fondateur && (
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 flex items-center gap-0.5">
                      <Award className="h-2.5 w-2.5" />Fondateur
                    </span>
                  )}
                  {pb.pro && (
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 flex items-center gap-0.5">
                      <Shield className="h-2.5 w-2.5" />Pro
                    </span>
                  )}
                  {pb.legende && (
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-300 to-yellow-200 text-amber-900 flex items-center gap-0.5">
                      <Crown className="h-2.5 w-2.5" />Legende
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-gray-500 mt-0.5">{pb.bot || pb.auteur}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-0.5 text-[9px] text-amber-600 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{pb.etoiles}
                  </span>
                  <span className="flex items-center gap-0.5 text-[9px] text-gray-500">
                    <Download className="h-3.5 w-3.5" />{pb.installations} installations
                  </span>
                  {pb.badge && <span className={cn("text-[8px] font-bold px-2 py-0.5 rounded-full", pb.badgeColor)}>{pb.badge}</span>}
                </div>
              </div>
            </div>
            <p className="text-[9px] text-gray-600 mt-3 leading-relaxed">{pb.description}</p>
          </div>

          {/* Ce que tu recois */}
          <div className="px-4 py-3 bg-white border-b">
            <h3 className="text-[11px] font-bold text-gray-800 mb-2">Ce que tu recois</h3>
            <div className="space-y-1.5">
              {pb.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-[9px] text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* VITAA Impact + Prix */}
          <div className="px-4 py-3 bg-white border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[11px] font-bold text-gray-800 mb-1.5">Impact VITAA</h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {pb.vitaa.map((v, i) => {
                    const isPositive = v.includes("+");
                    const letter = v[0];
                    const vitaaColors: Record<string, string> = {
                      V: "bg-green-100 text-green-700",
                      I: "bg-blue-100 text-blue-700",
                      T: isPositive ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700",
                      A: "bg-purple-100 text-purple-700",
                    };
                    return (
                      <span key={i} className={cn("text-[8px] font-bold px-2 py-0.5 rounded-full", vitaaColors[letter] || "bg-gray-100 text-gray-700")}>
                        {v}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="text-right">
                <PrixBadge prix={pb.prix} type={pb.prixType} />
                {!installDone && !installing && (
                  <button
                    onClick={startInstall}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white text-[9px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg transition-all ml-auto"
                  >
                    <Download className="h-3.5 w-3.5" /> Installer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Trisociation (cognitifs only) */}
          {isCog && (
            <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
              <h3 className="text-[11px] font-bold text-amber-800 mb-1.5 flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5" /> Trisociation possible
              </h3>
              <p className="text-[8px] text-amber-700 mb-2">Combine ce cerveau avec les 12 Ghosts pour amplifier l'expertise:</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {["G1 Bezos", "G2 Jobs", "G3 Musk", "G4 Sun Tzu", "G5 Munger", "G9 Tesla"].map(g => (
                  <span key={g} className="text-[7px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    {g}
                  </span>
                ))}
                <span className="text-[7px] text-amber-500">+6 autres</span>
              </div>
            </div>
          )}

          {/* Install flow */}
          {(installing || installDone) && (
            <div className="px-4 py-3 bg-white border-b">
              <div className={cn(
                "border rounded-xl p-3",
                installDone ? "border-green-300 bg-green-50" : "border-blue-200 bg-blue-50",
              )}>
                <h3 className="text-[11px] font-bold text-gray-800 mb-2">
                  {installDone ? "Installation completee!" : "Installation en cours..."}
                </h3>
                <div className="space-y-2">
                  {[
                    "Verification compatibilite...",
                    "Configuration pour votre departement...",
                    "Activation des bots assignes...",
                    "Playbook installe!",
                  ].map((step, i) => {
                    const isDone = installStep > i;
                    const isActive = installStep === i && !installDone;
                    const isPending = installStep < i && !installDone;
                    return (
                      <div key={i} className={cn("flex items-center gap-2 text-[9px]", isPending && "opacity-30")}>
                        {isDone || installDone ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        ) : isActive ? (
                          <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                        )}
                        <span className={cn(
                          isDone || installDone ? "text-green-700" : isActive ? "text-blue-700 font-medium" : "text-gray-400",
                        )}>{step}</span>
                      </div>
                    );
                  })}
                </div>
                {installDone && (
                  <div className="mt-3 flex items-center gap-2">
                    <button className="bg-green-600 hover:bg-green-700 text-white text-[9px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer shadow-sm transition-all">
                      <ChevronRight className="h-3.5 w-3.5" /> Aller au playbook
                    </button>
                    <span className="text-[8px] text-green-600 flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" /> Pret a utiliser
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Avis */}
          <div className="px-4 py-3 bg-white border-b">
            <h3 className="text-[11px] font-bold text-gray-800 mb-2">Avis ({pb.avis.length})</h3>
            <div className="space-y-2">
              {pb.avis.map((avis, i) => (
                <div key={i} className="border border-gray-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className={cn("h-2.5 w-2.5", si < avis.note ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
                      ))}
                    </div>
                    <span className="text-[8px] text-gray-500 font-medium">{avis.auteur}</span>
                  </div>
                  <p className="text-[9px] text-gray-600 italic">&quot;{avis.texte}&quot;</p>
                </div>
              ))}
            </div>
          </div>

          {/* Similaires */}
          <div className="px-4 py-3 bg-gray-50">
            <h3 className="text-[11px] font-bold text-gray-800 mb-2">Playbooks similaires</h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {pb.similaires.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 border border-gray-200 bg-white rounded-lg px-2.5 py-2 text-[9px] text-gray-700 shrink-0 hover:shadow-sm transition-shadow cursor-pointer min-w-[120px]">
                  <Target className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden text-[9px]">
      {/* Sim header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <span className="font-bold text-[11px]">Simulation — Playbook Store</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] text-gray-400">885 playbooks</span>
          <button
            onClick={() => { setActiveCategory("operationnels"); setSelectedPlaybook(null); setInstallDone(false); setChatStage(0); }}
            className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className={cn(
        "h-0.5 bg-gradient-to-r",
        isCognitif ? "from-amber-400 via-yellow-400 to-orange-400" : "from-gray-500 via-blue-500 to-gray-400",
      )} />

      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <RightPanel />
      </div>
    </div>
  );
}
