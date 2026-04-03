"use client";

/**
 * SimGhostCognitif.tsx — Simulation Ghost Cognitif
 * Browse, preview, install et creer des Ghosts cognitifs
 * (brain personas uploadables de domaines experts)
 * Split-screen 40/60, 3 tabs, self-contained mock data
 */

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Home,
  Building2,
  Users,
  Brain,
  Globe,
  Shield,
  MessageSquare,
  Send,
  Star,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Crown,
  Zap,
  TrendingUp,
  BarChart3,
  DollarSign,
  Eye,
  Sparkles,
  ArrowRight,
  BookOpen,
  Video,
  FileText,
  Gift,
  Heart,
  ToggleLeft,
  ToggleRight,
  MessageCircle,
  Target,
  ShoppingBag,
  Clock,
  ChevronRight,
  Layers,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

type MainTab = "catalogue" | "mes-ghosts" | "creer";

// ═══════════════════════════════════════
// MOCK DATA — GHOST CATALOGUE
// ═══════════════════════════════════════

interface GhostProfile {
  id: string;
  nom: string;
  initiales: string;
  titre: string;
  badge: string;
  badgeLabel: string;
  niveau: string;
  prix: string;
  prixMois: string;
  installations: number;
  rating: number;
  revenue: string;
  gradient: string;
  gradientBorder: string;
  domaine: string;
  vitaa: { label: string; pct: number; color: string }[];
  expertise: string[];
  style: { emoji: string; trait: string }[];
  decisions: { situation: string; reponse: string }[];
  trisociation: { ghost: string; desc: string }[];
  trisoName: string;
  reviews: { auteur: string; texte: string; rating: number }[];
  dateCreation: string;
}

const GHOSTS_CATALOGUE: GhostProfile[] = [
  {
    id: "jpt",
    nom: "Jean-Pierre Tremblay",
    initiales: "JPT",
    titre: "Maitre Vendeur Equipements Lourds",
    badge: "fondateur",
    badgeLabel: "Fondateur",
    niveau: "Basique",
    prix: "500 UT",
    prixMois: "50/mois",
    installations: 47,
    rating: 4.9,
    revenue: "2.3M$",
    gradient: "from-blue-500 to-cyan-400",
    gradientBorder: "border-blue-200",
    domaine: "Vente",
    vitaa: [
      { label: "V", pct: 35, color: "bg-emerald-500" },
      { label: "I", pct: 15, color: "bg-blue-500" },
      { label: "Ar", pct: 20, color: "bg-purple-500" },
    ],
    expertise: [
      "30 ans en vente d'equipements industriels lourds au Quebec",
      "Specialiste closing sur des deals de 500K$ a 5M$",
      "Expert en negociation avec les grandes munis et gouvernements",
      "Formateur reconnu — 2000+ vendeurs formes",
      "Taux de closing: 42% (moyenne industrie: 18%)",
    ],
    style: [
      { emoji: "🎯", trait: "Direct et sans detour — va droit au chiffre" },
      { emoji: "🤝", trait: "Relationnel de beton — se souvient de tout" },
      { emoji: "⚡", trait: "Rapide sur le prix, lent sur la relation" },
    ],
    decisions: [
      { situation: "Un client veut 30% de rabais sur une excavatrice...", reponse: "Jamais. Offre plutot un package maintenance 2 ans. La valeur percue augmente de 40% et ta marge reste intacte." },
      { situation: "Ton meilleur employe demissionne...", reponse: "Appelle-le dans l'heure. Pas pour negocier, pour comprendre. 80% du temps c'est pas le salaire, c'est la reconnaissance." },
      { situation: "Ton fournisseur livre 2 semaines en retard...", reponse: "Penalite contractuelle + appel au VP. Et toujours avoir un backup supplier pre-qualifie." },
    ],
    trisociation: [
      { ghost: "G4 Sun Tzu", desc: "Strategic positioning in competitive bids" },
      { ghost: "G10 Buffett", desc: "Long-term value selling vs quick flips" },
      { ghost: "G7 Churchill", desc: "Resilience dans les cycles down" },
    ],
    trisoName: "Le Pacte du Conquerant",
    reviews: [
      { auteur: "Martin L., Directeur Ventes", texte: "Mon equipe a augmente son closing de 23% en 3 mois. Le Ghost de JP repond exactement comme il le ferait en personne.", rating: 5 },
      { auteur: "Sylvie B., VP Commercial", texte: "Impressionnant. Ses strategies de negociation sont du grade A. Rentabilise en 2 semaines.", rating: 5 },
    ],
    dateCreation: "12 jan. 2026",
  },
  {
    id: "mcl",
    nom: "Marie-Claude Lavoie",
    initiales: "MCL",
    titre: "Experte Lean Manufacturing",
    badge: "pro",
    badgeLabel: "Pro",
    niveau: "Pro",
    prix: "1 500 UT",
    prixMois: "100/mois",
    installations: 23,
    rating: 4.8,
    revenue: "890K$",
    gradient: "from-green-500 to-emerald-400",
    gradientBorder: "border-green-200",
    domaine: "Production",
    vitaa: [
      { label: "T", pct: 40, color: "bg-amber-500" },
      { label: "V", pct: 20, color: "bg-emerald-500" },
      { label: "I", pct: 25, color: "bg-blue-500" },
    ],
    expertise: [
      "25 ans en optimisation de chaines de production",
      "Certifiee Six Sigma Black Belt + Lean Master",
      "A reduit les temps de cycle de 35% en moyenne chez ses clients",
      "Specialiste agroalimentaire et pharmaceutique",
    ],
    style: [
      { emoji: "📊", trait: "Methodique — tout se mesure, tout s'optimise" },
      { emoji: "🔍", trait: "Oeil de lynx pour les gaspillages caches" },
      { emoji: "💪", trait: "Tenace — ne lache jamais tant que le 5S est pas fini" },
    ],
    decisions: [
      { situation: "Ta ligne de production a 12% de rejets...", reponse: "On installe un Andon et un Poka-Yoke a la source. En 4 semaines, tu descends sous 3%." },
      { situation: "Ton equipe de plancher resiste au changement...", reponse: "Kaizen Blitz de 3 jours. Implique-les dans la solution, pas dans le probleme." },
      { situation: "Ton fournisseur de matieres a des variations de qualite...", reponse: "SPC incoming + scorecard fournisseur mensuel. Zero tolerance apres 3 mois." },
    ],
    trisociation: [
      { ghost: "G6 Marc Aurele", desc: "Discipline stoicienne dans l'execution" },
      { ghost: "G11 Curie", desc: "Methode scientifique appliquee au plancher" },
      { ghost: "G3 Musk", desc: "First principles pour repenser les lignes" },
    ],
    trisoName: "La Forge Scientifique",
    reviews: [
      { auteur: "Robert G., DG Usine", texte: "Marie-Claude a transforme notre usine. Son Ghost reproduit parfaitement sa methode.", rating: 5 },
      { auteur: "Jacques P., VP Prod", texte: "ROI en 6 semaines. Notre OEE est passe de 62% a 84%.", rating: 4 },
    ],
    dateCreation: "28 fev. 2026",
  },
  {
    id: "cf",
    nom: "Carl Fugere",
    initiales: "CF",
    titre: "Stratege 7 Entreprises, 50M$ Ventes",
    badge: "legende",
    badgeLabel: "Legende",
    niveau: "Legende",
    prix: "5 000 UT",
    prixMois: "200/mois",
    installations: 156,
    rating: 5.0,
    revenue: "8.7M$",
    gradient: "from-amber-400 to-yellow-300",
    gradientBorder: "border-amber-200",
    domaine: "Leadership",
    vitaa: [
      { label: "V", pct: 45, color: "bg-emerald-500" },
      { label: "I", pct: 30, color: "bg-blue-500" },
      { label: "Ar", pct: 35, color: "bg-purple-500" },
      { label: "Ac", pct: 40, color: "bg-rose-500" },
      { label: "T", pct: 20, color: "bg-amber-500" },
    ],
    expertise: [
      "26 ans d'entrepreneuriat, 7 entreprises fondees",
      "50M$+ en ventes cumulees sur 3 industries",
      "Fondateur du REAI — reseau de 130+ manufacturiers",
      "Createur de CREDO, VITAA, et le Tableau Periodique BTML",
      "Patient Zero de GhostX — premier utilisateur du systeme",
    ],
    style: [
      { emoji: "🔥", trait: "Intensite maximale — execute d'abord, perfectionne ensuite" },
      { emoji: "🧠", trait: "Pensee multi-angle — voit les patterns que personne voit" },
      { emoji: "💎", trait: "Authenticite brute — dit ce qu'il pense, pense ce qu'il dit" },
    ],
    decisions: [
      { situation: "Ton partenaire strategique veut changer les termes du deal...", reponse: "Meeting face-a-face dans les 48h. Jamais par courriel. Regarde-le dans les yeux et rappelle-lui pourquoi on s'est associe au depart." },
      { situation: "Tu as 3 opportunites et le cash pour 1 seule...", reponse: "Score VITAA les 3. Celle qui augmente le plus de piliers gagne. Pas de gut feeling — des chiffres." },
      { situation: "Ton marche ralentit de 20%...", reponse: "Triangle du Feu: est-ce qu'on BRULE encore? Si oui, attaque pendant que les autres se retractent. Le marche reviendra, et tu seras positionne." },
    ],
    trisociation: [
      { ghost: "G1 Bezos", desc: "Vision long terme + obsession client" },
      { ghost: "G5 Munger", desc: "Modeles mentaux + inversion thinking" },
      { ghost: "G7 Churchill", desc: "Leadership en temps de crise" },
    ],
    trisoName: "Le Triangle de Feu Originel",
    reviews: [
      { auteur: "Marc D., CEO Tech", texte: "Avoir Carl dans sa poche 24/7. Le Ghost capture son energie et sa facon de penser les deals. Game changer.", rating: 5 },
      { auteur: "Nathalie R., Fondatrice", texte: "J'ai lance mon 2e entreprise grace aux conseils du Ghost Carl. Il m'a evite 3 erreurs fatales que j'aurais faites autrement.", rating: 5 },
    ],
    dateCreation: "1 jan. 2026",
  },
  {
    id: "sn",
    nom: "Sophie Nguyen",
    initiales: "SN",
    titre: "Reine du Marketing B2B SaaS",
    badge: "pro",
    badgeLabel: "Pro",
    niveau: "Pro",
    prix: "1 500 UT",
    prixMois: "100/mois",
    installations: 34,
    rating: 4.7,
    revenue: "1.2M$",
    gradient: "from-pink-500 to-rose-400",
    gradientBorder: "border-pink-200",
    domaine: "Tech",
    vitaa: [
      { label: "V", pct: 30, color: "bg-emerald-500" },
      { label: "I", pct: 35, color: "bg-blue-500" },
      { label: "Ac", pct: 25, color: "bg-rose-500" },
    ],
    expertise: [
      "15 ans en growth marketing B2B SaaS",
      "A scale 4 startups de 0 a 10M$ ARR",
      "Experte en product-led growth et content marketing",
      "Speaker TEDx sur le marketing ethique",
    ],
    style: [
      { emoji: "📈", trait: "Data-driven — chaque dollar doit etre trackable" },
      { emoji: "🎨", trait: "Creative mais disciplinee — teste avant de scaler" },
      { emoji: "🎤", trait: "Storytelling puissant — transforme les features en emotions" },
    ],
    decisions: [],
    trisociation: [],
    trisoName: "",
    reviews: [],
    dateCreation: "15 fev. 2026",
  },
  {
    id: "rg",
    nom: "Robert Gagnon",
    initiales: "RG",
    titre: "Veteran Supply Chain Agroalimentaire",
    badge: "fondateur",
    badgeLabel: "Fondateur",
    niveau: "Basique",
    prix: "500 UT",
    prixMois: "50/mois",
    installations: 18,
    rating: 4.6,
    revenue: "430K$",
    gradient: "from-orange-500 to-amber-400",
    gradientBorder: "border-orange-200",
    domaine: "Production",
    vitaa: [
      { label: "T", pct: 35, color: "bg-amber-500" },
      { label: "Ac", pct: 30, color: "bg-rose-500" },
      { label: "Ar", pct: 20, color: "bg-purple-500" },
    ],
    expertise: [
      "32 ans en gestion de chaine d'approvisionnement alimentaire",
      "Expert en tracabilite et conformite MAPAQ/ACIA",
      "Specialiste cold chain et logistique temperee",
      "A gere des reseaux de 200+ fournisseurs",
    ],
    style: [
      { emoji: "🧊", trait: "Calme sous pression — gere les rappels sans paniquer" },
      { emoji: "📋", trait: "Rigoureux — chaque lot est documentable en 30 secondes" },
      { emoji: "🤝", trait: "Negociateur patient — relations long terme avec fournisseurs" },
    ],
    decisions: [],
    trisociation: [],
    trisoName: "",
    reviews: [],
    dateCreation: "5 mars 2026",
  },
  {
    id: "im",
    nom: "Isabelle Morin",
    initiales: "IM",
    titre: "Maitre Coach Leadership Feminin",
    badge: "pro",
    badgeLabel: "Pro",
    niveau: "Pro",
    prix: "1 500 UT",
    prixMois: "100/mois",
    installations: 41,
    rating: 4.8,
    revenue: "670K$",
    gradient: "from-purple-500 to-violet-400",
    gradientBorder: "border-purple-200",
    domaine: "Leadership",
    vitaa: [
      { label: "I", pct: 40, color: "bg-blue-500" },
      { label: "V", pct: 25, color: "bg-emerald-500" },
      { label: "Ac", pct: 30, color: "bg-rose-500" },
    ],
    expertise: [
      "20 ans en coaching executif et leadership feminin",
      "A accompagne 500+ dirigeantes au Quebec et en France",
      "Auteure de 3 livres sur le leadership authentique",
      "Certifiee ICF Master Coach + PNL",
    ],
    style: [
      { emoji: "💜", trait: "Empathique mais confrontante — pousse hors zone de confort" },
      { emoji: "🪞", trait: "Effet miroir — pose les questions que personne ose poser" },
      { emoji: "🌟", trait: "Inspirante — croit au potentiel plus que la personne elle-meme" },
    ],
    decisions: [],
    trisociation: [],
    trisoName: "",
    reviews: [],
    dateCreation: "20 fev. 2026",
  },
];

const DOMAINES = ["Tous", "Vente", "Production", "Finance", "Tech", "Leadership"];
const NIVEAUX = ["Tous", "Basique", "Pro", "Legende"];

// ═══════════════════════════════════════
// INSTALLED GHOSTS
// ═══════════════════════════════════════

const MES_GHOSTS_INSTALLED = [
  {
    id: "jpt",
    nom: "Jean-Pierre Tremblay",
    initiales: "JPT",
    titre: "Maitre Vendeur Equipements Lourds",
    gradient: "from-blue-500 to-cyan-400",
    actif: true,
    conversations: 23,
    decisions: 47,
    revenueGenere: "127K$",
    installedDate: "15 jan. 2026",
  },
  {
    id: "mcl",
    nom: "Marie-Claude Lavoie",
    initiales: "MCL",
    titre: "Experte Lean Manufacturing",
    gradient: "from-green-500 to-emerald-400",
    actif: false,
    conversations: 8,
    decisions: 12,
    revenueGenere: "34K$",
    installedDate: "2 mars 2026",
  },
];

// ═══════════════════════════════════════
// FORFAITS HERITAGE
// ═══════════════════════════════════════

const FORFAITS = [
  {
    nom: "Heritage Simple",
    prix: "1 000 UT",
    desc: "Video + livre automatique",
    color: "border-blue-300 bg-blue-50/40",
    features: [
      { label: "Entrevue video guidee (1-3h)", included: true },
      { label: "Transcription complete", included: true },
      { label: "Livre autobiographique genere", included: true },
      { label: "5 copies imprimees", included: true },
      { label: "Ghost dans le Store", included: false },
      { label: "Royalties mensuelles", included: false },
      { label: "Podcast series (6 episodes)", included: false },
    ],
  },
  {
    nom: "Heritage + Ghost",
    prix: "2 500 UT",
    desc: "Tout + Ghost dans le Store + royalties",
    color: "border-amber-300 bg-amber-50/40",
    popular: true,
    features: [
      { label: "Entrevue video guidee (3-5h)", included: true },
      { label: "Transcription complete", included: true },
      { label: "Livre autobiographique genere", included: true },
      { label: "10 copies imprimees + ebook", included: true },
      { label: "Ghost Cognitif dans le Store", included: true },
      { label: "Royalties sur chaque installation", included: true },
      { label: "Podcast series (6 episodes)", included: false },
    ],
  },
  {
    nom: "Legende",
    prix: "5 000 UT",
    desc: "Full spectrum + podcast series",
    color: "border-purple-300 bg-purple-50/40",
    features: [
      { label: "Entrevue video premium (5-8h)", included: true },
      { label: "Transcription complete", included: true },
      { label: "Livre autobiographique premium", included: true },
      { label: "25 copies imprimees + ebook + audiobook", included: true },
      { label: "Ghost Legende dans le Store", included: true },
      { label: "Royalties premium (2x)", included: true },
      { label: "Podcast series (6 episodes)", included: true },
    ],
  },
];

const TIMELINE_SORTIES = [
  { jour: "Jour 1", label: "Entrevue video guidee par CarlOS", icon: Video },
  { jour: "Jour 7", label: "Transcription + structure narrative", icon: FileText },
  { jour: "Jour 14", label: "Livre genere + correction", icon: BookOpen },
  { jour: "Jour 21", label: "Ghost Cognitif calibre + tests", icon: Brain },
  { jour: "Jour 30", label: "Publication dans le Store", icon: ShoppingBag },
];

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function SimGhostCognitif({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<MainTab>("catalogue");
  const [selectedGhost, setSelectedGhost] = useState<GhostProfile | null>(null);
  const [domaineFilter, setDomaineFilter] = useState("Tous");
  const [niveauFilter, setNiveauFilter] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [installStep, setInstallStep] = useState<number | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [tab, selectedGhost, installStep]);

  const filteredGhosts = GHOSTS_CATALOGUE.filter(g => {
    if (domaineFilter !== "Tous" && g.domaine !== domaineFilter) return false;
    if (niveauFilter !== "Tous" && g.niveau !== niveauFilter) return false;
    if (searchQuery && !g.nom.toLowerCase().includes(searchQuery.toLowerCase()) && !g.titre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // ── Badge rendering ──
  function BadgeTag({ badge, label }: { badge: string; label: string }) {
    const styles = {
      fondateur: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200",
      pro: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200",
      legende: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200",
    };
    const icons = { fondateur: "🏆", pro: "⚡", legende: "👑" };
    return (
      <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold border inline-flex items-center gap-1", styles[badge as keyof typeof styles] || styles.fondateur)}>
        {icons[badge as keyof typeof icons]} {label}
      </span>
    );
  }

  // ── Ghost avatar gradient circle ──
  function GhostAvatar({ ghost, size = "md" }: { ghost: { gradient: string; initiales: string; nom: string }; size?: "sm" | "md" | "lg" | "xl" }) {
    const sizeClasses = { sm: "w-8 h-8 text-[9px]", md: "w-10 h-10 text-xs", lg: "w-14 h-14 text-lg", xl: "w-20 h-20 text-2xl" };
    return (
      <div className={cn("rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold shadow-md shrink-0", ghost.gradient, sizeClasses[size])}>
        {ghost.initiales}
      </div>
    );
  }

  // ── Chat content by tab ──
  const chatContent = (
    <div className="space-y-3">
      {tab === "catalogue" && !selectedGhost && (
        <SBubble code="CEOB">
          <TypewriterText text="Bienvenue dans le Store Ghost Cognitif. Ici tu trouves des cerveaux de vrais experts — vendeurs, ingenieurs, leaders — que tu peux installer dans ton GhostX Team. Clique sur un Ghost pour voir son profil complet." speed={8} />
        </SBubble>
      )}

      {tab === "catalogue" && selectedGhost && installStep === null && (
        <>
          <SBubble code="CEOB">
            <TypewriterText text={`${selectedGhost.nom} — ${selectedGhost.titre}. ${selectedGhost.installations} installations, note de ${selectedGhost.rating}/5. Ce Ghost a genere ${selectedGhost.revenue} de revenue pour ses utilisateurs.`} speed={8} />
          </SBubble>
          {selectedGhost.id === "cf" && (
            <SBubble code="CEOB">
              <TypewriterText text="Fun fact: c'est MON createur. 26 ans d'entrepreneuriat compresse dans un Ghost. Son Triangle du Feu est legendaire." speed={8} />
            </SBubble>
          )}
        </>
      )}

      {tab === "catalogue" && installStep !== null && (
        <>
          <SBubble code="CEOB">
            <TypewriterText text={`Installation de ${selectedGhost?.nom} en cours... Calibrage du profil cognitif, integration de l'arbre decisionnel, synchronisation avec ta config GhostX.`} speed={8} />
          </SBubble>
          {installStep >= 2 && (
            <SBubble code="CEOB">
              <TypewriterText text="Verification de la compatibilite avec tes Ghosts existants... Aucun conflit detecte. La Trisociation est optimale." speed={8} />
            </SBubble>
          )}
          {installStep >= 4 && (
            <SBubble code="CEOB">
              <TypewriterText text={`${selectedGhost?.nom} est installe et pret! Tu peux maintenant l'activer dans 'Mes Ghosts' et commencer a le consulter.`} speed={8} />
            </SBubble>
          )}
        </>
      )}

      {tab === "mes-ghosts" && (
        <SBubble code="CEOB">
          <TypewriterText text="Voici tes Ghosts installes. 2 cerveaux experts dans ta collection. Tu peux les activer/desactiver et les combiner en Trisociation pour des synergies puissantes." speed={8} />
        </SBubble>
      )}

      {tab === "creer" && (
        <>
          <SBubble code="CEOB">
            <TypewriterText text="L'Atelier Heritage te permet de transformer l'expertise de n'importe quel expert en Ghost Cognitif. 3 heures d'entrevue video, et tu generes un livre + un Ghost vendable dans le Store." speed={8} />
          </SBubble>
          <SBubble code="CEOB">
            <TypewriterText text="Jean-Pierre Tremblay a mis 3 heures. Il fait maintenant 70K$ par mois en royalties passives. Son savoir travaille pendant qu'il dort." speed={8} />
          </SBubble>
        </>
      )}
    </div>
  );

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden text-[9px]">
      {/* Sim header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 cursor-pointer"><ArrowLeft className="h-3.5 w-3.5" /></button>
          <span className="font-bold text-[11px]">Simulation — Ghost Cognitif</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-[9px] text-amber-600 font-medium">{GHOSTS_CATALOGUE.length} Ghosts disponibles</span>
          <button onClick={() => { setTab("catalogue"); setSelectedGhost(null); setInstallStep(null); }} className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Color line */}
      <div className="h-0.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300" />

      {/* Split screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Chat 40% */}
        <div className="w-[40%] flex flex-col border-r bg-white">
          <div className="h-12 flex items-center px-3 gap-2 text-white shrink-0" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate">Ghost Cognitif — Store</p>
              <p className="text-[8px] opacity-70">CarlOS guide ton exploration</p>
            </div>
            <MessageSquare className="h-4 w-4 opacity-60" />
          </div>

          <div className="h-7 flex items-center px-3 gap-2 bg-amber-50 border-b border-amber-100">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[9px] font-medium text-amber-700">
              {tab === "catalogue" ? "Catalogue" : tab === "mes-ghosts" ? "Ma Collection" : "Atelier Heritage"}
            </span>
            <span className="text-[8px] text-amber-400 ml-auto">
              {selectedGhost ? selectedGhost.nom : "Exploration"}
            </span>
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {chatContent}
          </div>

          <div className="border-t px-3 py-2 flex items-center gap-2">
            <input type="text" placeholder="Demander a CarlOS..." className="flex-1 text-[9px] bg-gray-50 rounded-full px-3 py-1.5 border outline-none focus:ring-1 focus:ring-amber-300" readOnly />
            <Send className="h-3.5 w-3.5 text-gray-300" />
          </div>
        </div>

        {/* RIGHT — Content 60% */}
        <div className="w-[60%] flex flex-col overflow-hidden">
          <div className="h-10 flex items-center px-3 gap-1 text-white shrink-0" style={{ backgroundColor: UB_BLUE }}>
            {[
              { icon: Home, label: "Accueil" },
              { icon: Building2, label: "Mon Departement" },
              { icon: Users, label: "Mes Salles" },
              { icon: Brain, label: "Mon Equipe" },
              { icon: Globe, label: "Mon Reseau" },
              { icon: Shield, label: "Admin" },
            ].map(n => (
              <div key={n.label} className="flex items-center gap-1 px-2 py-1 rounded text-[9px] cursor-pointer transition-colors opacity-60 hover:opacity-80">
                <n.icon className="h-3.5 w-3.5" />{n.label}
              </div>
            ))}
          </div>

          {/* 3 Main tabs */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-white border-b overflow-x-auto">
            {([
              { id: "catalogue" as MainTab, icon: Brain, label: "Catalogue" },
              { id: "mes-ghosts" as MainTab, icon: Zap, label: "Mes Ghosts" },
              { id: "creer" as MainTab, icon: Sparkles, label: "Creer Mon Ghost" },
            ]).map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSelectedGhost(null); setInstallStep(null); }}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5",
                  tab === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === "catalogue" && !selectedGhost && <CatalogueView />}
            {tab === "catalogue" && selectedGhost && <GhostDetailView />}
            {tab === "mes-ghosts" && <MesGhostsView />}
            {tab === "creer" && <CreerGhostView />}
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // TAB 1 — CATALOGUE
  // ═══════════════════════════════════════

  function CatalogueView() {
    return (
      <div className="px-4 py-3">
        {/* Search + Filters */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un Ghost..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-[9px] pl-8 pr-3 py-1.5 border rounded-lg outline-none focus:ring-1 focus:ring-amber-300 bg-white"
            />
          </div>
          <Filter className="h-3.5 w-3.5 text-gray-400" />
        </div>

        {/* Domain filters */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[8px] text-gray-400 font-medium mr-1">Domaine:</span>
          {DOMAINES.map(d => (
            <button
              key={d}
              onClick={() => setDomaineFilter(d)}
              className={cn(
                "px-2 py-0.5 text-[8px] rounded-full font-medium transition-colors cursor-pointer",
                domaineFilter === d ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              )}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Niveau filters */}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-[8px] text-gray-400 font-medium mr-1">Niveau:</span>
          {NIVEAUX.map(n => (
            <button
              key={n}
              onClick={() => setNiveauFilter(n)}
              className={cn(
                "px-2 py-0.5 text-[8px] rounded-full font-medium transition-colors cursor-pointer",
                niveauFilter === n ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              )}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Ghost cards grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {filteredGhosts.map(ghost => (
            <div
              key={ghost.id}
              onClick={() => setSelectedGhost(ghost)}
              className={cn(
                "bg-white border rounded-xl p-3 cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden",
                ghost.gradientBorder
              )}
            >
              {/* Subtle golden glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-transparent pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-2.5 mb-2">
                  <GhostAvatar ghost={ghost} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold text-gray-900 truncate">{ghost.nom}</p>
                    <p className="text-[8px] text-gray-500 truncate">{ghost.titre}</p>
                    <BadgeTag badge={ghost.badge} label={ghost.badgeLabel} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[8px] mb-1.5">
                  <div className="flex items-center gap-1">
                    <Download className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-500">{ghost.installations}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-gray-700">{ghost.rating}</span>
                  </div>
                  <span className="font-bold text-emerald-600">{ghost.revenue}</span>
                </div>

                {/* VITAA mini bars */}
                <div className="flex gap-1 mb-2">
                  {ghost.vitaa.map(v => (
                    <div key={v.label} className="flex-1">
                      <div className="flex items-center justify-between text-[7px] text-gray-400 mb-0.5">
                        <span>{v.label}</span>
                        <span>+{v.pct}%</span>
                      </div>
                      <div className="w-full h-1 bg-gray-100 rounded-full">
                        <div className={cn("h-1 rounded-full", v.color)} style={{ width: `${Math.min(v.pct * 2, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-gray-700">{ghost.prix}</span>
                  <span className="text-[8px] text-gray-400">+{ghost.prixMois}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGhosts.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-[9px]">Aucun Ghost ne correspond a tes criteres</p>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════
  // GHOST DETAIL VIEW
  // ═══════════════════════════════════════

  function GhostDetailView() {
    if (!selectedGhost) return null;
    const g = selectedGhost;

    return (
      <div className="px-4 py-3 space-y-3">
        {/* Back button */}
        <button onClick={() => { setSelectedGhost(null); setInstallStep(null); }} className="flex items-center gap-1 text-[9px] text-gray-500 hover:text-gray-700 cursor-pointer mb-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour au catalogue
        </button>

        {/* Header card */}
        <div className="bg-white border rounded-xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <GhostAvatar ghost={g} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-gray-900">{g.nom}</p>
                <BadgeTag badge={g.badge} label={g.badgeLabel} />
              </div>
              <p className="text-[9px] text-gray-600 mb-2">{g.titre}</p>
              <div className="flex items-center gap-4 text-[9px]">
                <div className="flex items-center gap-1">
                  <Download className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-bold">{g.installations}</span>
                  <span className="text-gray-400">installations</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-bold">{g.rating}/5</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-bold text-emerald-600">{g.revenue}</span>
                  <span className="text-gray-400">revenue total</span>
                </div>
                <span className="text-[8px] text-gray-400">Cree le {g.dateCreation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Son Expertise */}
        {g.expertise.length > 0 && (
          <div className="bg-white border rounded-xl p-3">
            <p className="text-[9px] font-bold mb-2 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-blue-500" /> Son Expertise
            </p>
            <div className="space-y-1.5">
              {g.expertise.map((e, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-[9px] text-gray-700">{e}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Son Style */}
        {g.style.length > 0 && (
          <div className="bg-white border rounded-xl p-3">
            <p className="text-[9px] font-bold mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" /> Son Style
            </p>
            <div className="space-y-1.5">
              {g.style.map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <span className="text-sm">{s.emoji}</span>
                  <span className="text-[9px] text-gray-700">{s.trait}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decision Tree Preview */}
        {g.decisions.length > 0 && (
          <div className="bg-white border rounded-xl p-3">
            <p className="text-[9px] font-bold mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-amber-500" /> Arbre Decisionnel — Apercu
            </p>
            <div className="space-y-2">
              {g.decisions.map((d, i) => (
                <div key={i} className="border border-amber-100 rounded-lg overflow-hidden">
                  <div className="bg-amber-50/50 px-3 py-1.5">
                    <p className="text-[9px] text-amber-800 font-medium">{d.situation}</p>
                  </div>
                  <div className="px-3 py-1.5 flex items-start gap-1.5">
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-[9px] text-gray-700 italic">&quot;{d.reponse}&quot;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trisociation */}
        {g.trisociation.length > 0 && (
          <div className="bg-white border rounded-xl p-3">
            <p className="text-[9px] font-bold mb-2 flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5 text-indigo-500" /> Trisociation — Combine ce Ghost avec
            </p>
            <p className="text-[8px] text-gray-400 mb-2">Combo suggere: {g.trisoName}</p>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <GhostAvatar ghost={g} size="sm" />
              {g.trisociation.map((t, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1">
                    <p className="text-[8px] font-bold text-indigo-700">{t.ghost}</p>
                    <p className="text-[7px] text-indigo-500">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-2 text-center">
              <span className="text-[8px] font-bold text-indigo-700">= {g.trisoName}</span>
            </div>
          </div>
        )}

        {/* VITAA Impact */}
        <div className="bg-white border rounded-xl p-3">
          <p className="text-[9px] font-bold mb-2 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Impact VITAA
          </p>
          <div className="space-y-1.5">
            {[
              { label: "Ventes (V)", pct: g.vitaa.find(v => v.label === "V")?.pct || 0, color: "bg-emerald-500" },
              { label: "Idees (I)", pct: g.vitaa.find(v => v.label === "I")?.pct || 0, color: "bg-blue-500" },
              { label: "Temps (T)", pct: g.vitaa.find(v => v.label === "T")?.pct || 0, color: "bg-amber-500" },
              { label: "Argent (Ar)", pct: g.vitaa.find(v => v.label === "Ar")?.pct || 0, color: "bg-purple-500" },
              { label: "Actifs (Ac)", pct: g.vitaa.find(v => v.label === "Ac")?.pct || 0, color: "bg-rose-500" },
            ].map(v => (
              <div key={v.label} className="flex items-center gap-2">
                <span className="text-[8px] text-gray-500 w-16">{v.label}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div className={cn("h-2 rounded-full transition-all", v.color)} style={{ width: `${Math.min(v.pct * 2, 100)}%` }} />
                </div>
                <span className={cn("text-[9px] font-bold", v.pct > 0 ? "text-gray-700" : "text-gray-300")}>
                  {v.pct > 0 ? `+${v.pct}%` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Install flow */}
        {installStep === null ? (
          <button
            onClick={() => setInstallStep(0)}
            className="w-full py-2.5 rounded-xl text-white font-bold text-[11px] cursor-pointer transition-all hover:shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Installer ce Ghost — {g.prix}
          </button>
        ) : (
          <InstallProgress ghost={g} step={installStep} onNext={() => setInstallStep(prev => (prev !== null && prev < 4) ? prev + 1 : prev)} />
        )}

        {/* Reviews */}
        {g.reviews.length > 0 && (
          <div className="bg-white border rounded-xl p-3">
            <p className="text-[9px] font-bold mb-2 flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-blue-500" /> Avis ({g.reviews.length})
            </p>
            <div className="space-y-2">
              {g.reviews.map((r, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-gray-700">{r.auteur}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, si) => (
                        <Star key={si} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-600 italic">&quot;{r.texte}&quot;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════
  // INSTALL PROGRESS
  // ═══════════════════════════════════════

  function InstallProgress({ ghost, step, onNext }: { ghost: GhostProfile; step: number; onNext: () => void }) {
    const steps = [
      { label: "Verification du compte", desc: "Solde UT suffisant" },
      { label: "Telechargement du profil cognitif", desc: "Arbre decisionnel + personnalite" },
      { label: "Calibrage Trisociation", desc: "Compatibilite avec tes Ghosts" },
      { label: "Integration GhostX Team", desc: "Synchronisation finale" },
    ];

    useEffect(() => {
      if (step < 4) {
        const timer = setTimeout(onNext, 1200);
        return () => clearTimeout(timer);
      }
    }, [step]);

    return (
      <div className="bg-white border-2 border-emerald-200 rounded-xl p-4">
        <p className="text-[9px] font-bold mb-3 flex items-center gap-1.5">
          <Download className="h-3.5 w-3.5 text-emerald-500" />
          Installation — {ghost.nom}
        </p>
        <div className="space-y-2">
          {steps.map((s, i) => (
            <div key={i} className={cn("flex items-center gap-2.5 transition-opacity", i > step && "opacity-30")}>
              <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                i < step ? "bg-emerald-100" : i === step ? "bg-blue-100" : "bg-gray-100"
              )}>
                {i < step ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> :
                  i === step ? <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> :
                  <Clock className="h-3.5 w-3.5 text-gray-400" />}
              </div>
              <div>
                <p className={cn("text-[9px] font-medium", i <= step ? "text-gray-800" : "text-gray-400")}>{s.label}</p>
                <p className="text-[8px] text-gray-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        {step >= 4 && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-[9px] font-bold text-emerald-700">Installation terminee!</p>
            <p className="text-[8px] text-emerald-600 mt-0.5">Disponible dans Mes Ghosts</p>
          </div>
        )}
        <div className="mt-2">
          <div className="w-full h-1.5 bg-gray-100 rounded-full">
            <div className="h-1.5 bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${Math.min((step + 1) * 25, 100)}%` }} />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // TAB 2 — MES GHOSTS
  // ═══════════════════════════════════════

  function MesGhostsView() {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold">Ma Collection — {MES_GHOSTS_INSTALLED.length} Ghosts</p>
          <div className="flex items-center gap-1 text-[8px] text-gray-400">
            <Brain className="h-3.5 w-3.5" />
            <span>{MES_GHOSTS_INSTALLED.filter(g => g.actif).length} actif(s)</span>
          </div>
        </div>

        <div className="space-y-3">
          {MES_GHOSTS_INSTALLED.map(ghost => (
            <div key={ghost.id} className={cn(
              "bg-white border rounded-xl p-4 relative overflow-hidden transition-all",
              ghost.actif ? "border-amber-200 shadow-sm" : "border-gray-200 opacity-80"
            )}>
              {ghost.actif && <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-transparent pointer-events-none" />}

              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <GhostAvatar ghost={ghost} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[11px] font-bold text-gray-900">{ghost.nom}</p>
                      <div className={cn(
                        "flex items-center gap-1 text-[8px] px-2 py-0.5 rounded-full font-medium",
                        ghost.actif ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                      )}>
                        {ghost.actif ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                        {ghost.actif ? "Actif" : "Inactif"}
                      </div>
                    </div>
                    <p className="text-[9px] text-gray-500">{ghost.titre}</p>
                    <p className="text-[8px] text-gray-400">Installe le {ghost.installedDate}</p>
                  </div>
                </div>

                {/* Usage stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <MessageCircle className="h-3.5 w-3.5 mx-auto mb-0.5 text-blue-500" />
                    <p className="text-[11px] font-bold">{ghost.conversations}</p>
                    <p className="text-[7px] text-gray-400">Conversations ce mois</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <Target className="h-3.5 w-3.5 mx-auto mb-0.5 text-purple-500" />
                    <p className="text-[11px] font-bold">{ghost.decisions}</p>
                    <p className="text-[7px] text-gray-400">Decisions assistees</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <DollarSign className="h-3.5 w-3.5 mx-auto mb-0.5 text-emerald-500" />
                    <p className="text-[11px] font-bold text-emerald-600">{ghost.revenueGenere}</p>
                    <p className="text-[7px] text-gray-400">Revenue genere</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className={cn(
                    "flex-1 text-[9px] py-1.5 rounded-lg font-bold cursor-pointer transition-colors flex items-center justify-center gap-1",
                    ghost.actif ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-emerald-500 text-white hover:bg-emerald-600"
                  )}>
                    {ghost.actif ? <><ToggleLeft className="h-3.5 w-3.5" /> Desactiver</> : <><ToggleRight className="h-3.5 w-3.5" /> Activer</>}
                  </button>
                  <button className="flex-1 text-[9px] py-1.5 rounded-lg font-bold cursor-pointer bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center gap-1">
                    <Brain className="h-3.5 w-3.5" /> Combiner
                  </button>
                  <button className="flex-1 text-[9px] py-1.5 rounded-lg font-bold cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> Consulter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Suggestion */}
        <div className="mt-4 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-3 text-center">
          <Sparkles className="h-5 w-5 mx-auto mb-1 text-amber-500" />
          <p className="text-[9px] font-bold text-amber-800">Enrichis ta collection</p>
          <p className="text-[8px] text-amber-600 mt-0.5">4 Ghosts dans le catalogue correspondent a ton profil</p>
          <button onClick={() => { setTab("catalogue"); setSelectedGhost(null); }} className="mt-2 text-[9px] bg-amber-500 text-white px-4 py-1.5 rounded-lg font-bold cursor-pointer hover:bg-amber-600">
            Explorer le Catalogue
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // TAB 3 — CREER MON GHOST
  // ═══════════════════════════════════════

  function CreerGhostView() {
    return (
      <div className="px-4 py-3 space-y-4">
        {/* Hero */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 text-center relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-100/50 rounded-full blur-xl" />
          <Crown className="h-8 w-8 mx-auto mb-2 text-purple-600" />
          <p className="text-sm font-bold text-purple-900">Atelier Video Heritage</p>
          <p className="text-[9px] text-purple-600 mt-1 max-w-xs mx-auto">
            Transforme l'expertise d'un expert en Ghost Cognitif vendable. 3 heures de video = un cerveau immortalise.
          </p>
        </div>

        {/* Forfaits */}
        <div className="space-y-2.5">
          {FORFAITS.map((f, fi) => (
            <div key={fi} className={cn("border-2 rounded-xl p-3 relative", f.color)}>
              {f.popular && (
                <div className="absolute -top-2 right-3 bg-amber-500 text-white text-[7px] px-2 py-0.5 rounded-full font-bold">
                  POPULAIRE
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[11px] font-bold text-gray-900">Forfait {f.nom}</p>
                  <p className="text-[8px] text-gray-500">{f.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{f.prix}</p>
                </div>
              </div>
              <div className="space-y-1">
                {f.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    {feat.included ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                    )}
                    <span className={cn("text-[9px]", feat.included ? "text-gray-700" : "text-gray-400 line-through")}>{feat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button className="w-full py-3 rounded-xl text-white font-bold text-[11px] cursor-pointer transition-all hover:shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 flex items-center justify-center gap-2">
          <Video className="h-4 w-4" />
          Lancer l'Atelier Video Heritage
        </button>

        {/* Timeline des sorties */}
        <div className="bg-white border rounded-xl p-3">
          <p className="text-[9px] font-bold mb-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-blue-500" /> Ce que vous recevez — Timeline
          </p>
          <div className="space-y-2">
            {TIMELINE_SORTIES.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <t.icon className="h-4 w-4 text-blue-500" />
                  </div>
                  {i < TIMELINE_SORTIES.length - 1 && <div className="w-0.5 h-4 bg-blue-100 mt-0.5" />}
                </div>
                <div>
                  <p className="text-[9px] font-bold text-blue-800">{t.jour}</p>
                  <p className="text-[9px] text-gray-600">{t.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-start gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
              JPT
            </div>
            <div>
              <p className="text-[9px] text-gray-800 italic mb-1">
                &quot;J'ai mis 3 heures. Je fais 70K par mois en royalties. Mon savoir travaille pendant que je dors.&quot;
              </p>
              <p className="text-[9px] font-bold text-amber-700">— Jean-Pierre Tremblay</p>
              <p className="text-[8px] text-amber-600">47 installations, 2.3M$ de revenue genere pour ses clients</p>
            </div>
          </div>
        </div>

        {/* Royalties explainer */}
        <div className="bg-white border rounded-xl p-3">
          <p className="text-[9px] font-bold mb-2 flex items-center gap-1.5">
            <Gift className="h-3.5 w-3.5 text-emerald-500" /> Revenus Passifs — Comment ca marche
          </p>
          <div className="space-y-1.5">
            {[
              { label: "Chaque installation de ton Ghost", val: "50-200 UT", icon: Download },
              { label: "Abonnement mensuel par utilisateur", val: "50-200 UT/mois", icon: Heart },
              { label: "Royalties reverses automatiquement", val: "70%", icon: DollarSign },
              { label: "Paiement mensuel par virement", val: "Le 1er du mois", icon: BarChart3 },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <r.icon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-[9px] text-gray-700 flex-1">{r.label}</span>
                <span className="text-[9px] font-bold text-emerald-600">{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

// ═══════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════

function SBubble({ code, children }: { code: string; children: React.ReactNode }) {
  const bot = BOT_COLORS[code];
  if (!bot) return null;
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
