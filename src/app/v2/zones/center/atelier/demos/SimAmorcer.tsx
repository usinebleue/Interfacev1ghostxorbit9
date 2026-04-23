"use client";

/**
 * SimAmorcer.tsx — Protocole AMORCER (self-contained)
 *
 * Carl vocal 11h26:
 * - Tabs AMORCER dans le PANEL DROIT (pas en haut full-width)
 * - Color line uniquement dans le panel droit
 * - Bande breadcrumb drill-down sous les tabs (section cockpit)
 * - PAS de bande pastel dans la discussion (juste couleur boutons)
 * - Bots: ecrire "Equipe" + noms a cote des avatars
 * - Observation = vue d'ensemble, Attention/Moderation = overlays
 * - Qualite visuelle: reutiliser patterns design-system.md
 *
 * COULEURS: A=red, M=pink, O=blue, R=orange, C=yellow, E=green, R=emerald
 */

import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  Scale,
  Eye,
  Brain,
  Hammer,
  Rocket,
  BarChart3,
  MessageCircle,
  Send,
  Users,
  FolderOpen,
  Target,
  CheckCircle2,
  Activity,
  Zap,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Clock,
  ShieldAlert,
  Lightbulb,
  ArrowRight,
  FileText,
  Paperclip,
  Filter,
  ChevronRight,
  Home,
  Phone,
  Video,
  Glasses,
  Image,
  File,
  Camera,
  ChevronUp,
  Globe,
  Plus,
  Palette,
  Flame,
  TowerControl,
  Shield,
  Bot,
  Settings,
  MessageSquare,
  Bell,
  Search,
  Sparkles,
  Star,
  Calendar,
  Briefcase,
  Crown,
  Compass,
  Handshake,
  Building2,
  Layers,
  LayoutDashboard,
  HeartPulse,
  Gauge,
  Map,
  Megaphone,
  Package,
  Stethoscope,
  ChevronDown,
  ArrowLeft,
  Pencil,
  Trash2,
  Lock,
  Mail,
  Mic,
  RefreshCw,
  Link,
  Cpu,
  Cog,
  Factory,
  Coins,
  CreditCard,
  Hexagon,
  Trophy,
  BookOpen,
  Play,
  Monitor,
  UserCircle,
  GitBranch,
  ListChecks,
  Copy,
  Bookmark,
  Swords,
  Heart,
  Loader2,
  SortAsc,
  LayoutGrid,
  List,
  Table2,
  Network,
  Atom,
  GraduationCap,
  HardHat,
  Library,
  User,
  LogOut,
  HelpCircle,
  Inbox,
  DoorOpen,
  ShieldCheck,
  PiggyBank,
  Receipt,
  Bug,
  Wrench,
  ClipboardList,
  Newspaper,
  LineChart,
  CalendarDays,
  Route,
  EyeOff,
  Landmark,
  Gem,
  Server,
  Radio,
  FileBarChart,
  X,
  Award,
  Crosshair,
  Pin,
  Navigation,
  ThumbsUp,
  ThumbsDown,
  Database,
  Repeat,
  Timer,
  Code2,
  Presentation,
  Terminal,
  FlaskConical,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../../../../components/ui/resizable";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BlueprintView, DataRoomView, PlaybookStoreView, ConferenceAIView, CockpitView, LivingHero, DEPT_DASH_ICON, DEPT_FULL_LABEL, DEPT_SHORT_LABEL, BLUEPRINT_HEADER_TABS, type HeaderView } from "../../blueprint/BlueprintDepartement";
import { HierarchieTab } from "../../BlueprintView";
import { SanteGlobaleView } from "../../SanteGlobaleView";
import { DocumentsUnifie } from "../../shared/DocumentsUnifie";
import { CanvasActionProvider } from "../../../../context/CanvasActionContext";
import { BOT_COLORS } from "../../shared/simulation-data";
import { SF } from "../../../../../v3/core/styles";

export const UB_BLUE = "#073E5A";

// ========== PHASE CONFIG (couleurs confirmees Carl) ==========

export type PhaseKey = "attention" | "moderation" | "observation" | "reflexion" | "creation" | "execution" | "retroaction" | "discussion" | "operations";

export interface PhaseStyle {
  label: string;
  letter: string;
  Icon: React.ElementType;
  dot: string;
  badge: string;
  bg: string;
  border: string;
  text: string;
  btnBg: string;
  btnText: string;
  btnBorder: string;
  btnHover: string;
  line: string;
}

export const PC: Record<PhaseKey, PhaseStyle> = {
  discussion:  { label: "Discussion",  letter: "D", Icon: MessageCircle,  dot: "bg-sky-500",     badge: "bg-sky-100 text-sky-700",         bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     btnBg: "bg-sky-50",     btnText: "text-sky-700",     btnBorder: "border-sky-200",     btnHover: "hover:bg-sky-100",     line: "bg-sky-500" },
  attention:   { label: "Attention",   letter: "A", Icon: AlertTriangle, dot: "bg-red-500",     badge: "bg-red-100 text-red-700",         bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     btnBg: "bg-red-50",     btnText: "text-red-700",     btnBorder: "border-red-200",     btnHover: "hover:bg-red-100",     line: "bg-red-500" },
  moderation:  { label: "Modération",  letter: "M", Icon: Scale,         dot: "bg-pink-500",    badge: "bg-pink-100 text-pink-700",       bg: "bg-pink-50",    border: "border-pink-200",    text: "text-pink-700",    btnBg: "bg-pink-50",    btnText: "text-pink-700",    btnBorder: "border-pink-200",    btnHover: "hover:bg-pink-100",    line: "bg-pink-500" },
  observation: { label: "Observation", letter: "O", Icon: Eye,           dot: "bg-blue-500",    badge: "bg-blue-100 text-blue-700",       bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    btnBg: "bg-blue-50",    btnText: "text-blue-700",    btnBorder: "border-blue-200",    btnHover: "hover:bg-blue-100",    line: "bg-blue-500" },
  reflexion:   { label: "Réflexion",   letter: "R", Icon: Brain,         dot: "bg-orange-500",  badge: "bg-orange-100 text-orange-700",   bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  btnBg: "bg-orange-50",  btnText: "text-orange-700",  btnBorder: "border-orange-200",  btnHover: "hover:bg-orange-100",  line: "bg-orange-500" },
  creation:    { label: "Conception",    letter: "C", Icon: Hammer,        dot: "bg-yellow-500",  badge: "bg-yellow-100 text-yellow-700",   bg: "bg-yellow-50",  border: "border-yellow-200",  text: "text-yellow-700",  btnBg: "bg-yellow-50",  btnText: "text-yellow-700",  btnBorder: "border-yellow-200",  btnHover: "hover:bg-yellow-100",  line: "bg-yellow-500" },
  execution:   { label: "Exécution",   letter: "E", Icon: Rocket,        dot: "bg-green-500",   badge: "bg-green-100 text-green-700",     bg: "bg-green-50",   border: "border-green-200",   text: "text-green-700",   btnBg: "bg-green-50",   btnText: "text-green-700",   btnBorder: "border-green-200",   btnHover: "hover:bg-green-100",   line: "bg-green-500" },
  retroaction: { label: "Rétroaction", letter: "R", Icon: BarChart3,     dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", btnBg: "bg-emerald-50", btnText: "text-emerald-700", btnBorder: "border-emerald-200", btnHover: "hover:bg-emerald-100", line: "bg-emerald-500" },
  operations:  { label: "Opérations",  letter: "P", Icon: Repeat,        dot: "bg-cyan-500",    badge: "bg-cyan-100 text-cyan-700",       bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700",    btnBg: "bg-cyan-50",    btnText: "text-cyan-700",    btnBorder: "border-cyan-200",    btnHover: "hover:bg-cyan-100",    line: "bg-cyan-500" },
};

export const PHASES: PhaseKey[] = ["attention", "moderation", "observation", "reflexion", "creation", "execution", "retroaction", "operations"];

// ========== DASHBOARD DATA ==========

export const KPIS = [
  { label: "Revenus Q4", value: "2.4M$", delta: "+8.3%", up: true, icon: DollarSign },
  { label: "Pipeline", value: "890K$", delta: "-12%", up: false, icon: TrendingUp },
  { label: "Équipe", value: "47", delta: "+3 ce mois", up: true, icon: Users },
  { label: "Projets actifs", value: "12", delta: "3 en retard", up: false, icon: FolderOpen },
];

export const CHANTIERS = [
  { name: "Transformation Numérique", progress: 72, bot: "CTOB", botName: "Tim", phase: "execution" as PhaseKey },
  { name: "Expansion Marché US", progress: 45, bot: "CSOB", botName: "Simone", phase: "reflexion" as PhaseKey },
  { name: "Optimisation Production", progress: 88, bot: "CPOB", botName: "Paco", phase: "execution" as PhaseKey },
  { name: "Restructuration RH", progress: 20, bot: "CHROB", botName: "Hélène", phase: "creation" as PhaseKey },
];

export const PROJETS = [
  { name: "Migration serveurs cloud", chantier: "Transformation Numérique", phase: "execution" as PhaseKey, bot: "CTOB" },
  { name: "Soumission Hydro-Québec", chantier: "Expansion Marché US", phase: "reflexion" as PhaseKey, bot: "CSOB" },
  { name: "Automatisation ligne 3", chantier: "Optimisation Production", phase: "retroaction" as PhaseKey, bot: "CPOB" },
  { name: "Plan de rétention", chantier: "Restructuration RH", phase: "creation" as PhaseKey, bot: "CHROB" },
];

export const MISSIONS_DATA = [
  { name: "Audit coûts hébergement", bot: "CFOB", phase: "execution" as PhaseKey, urgent: false },
  { name: "Analyse pipeline Q1", bot: "CROB", phase: "attention" as PhaseKey, urgent: true },
  { name: "Benchmark concurrence US", bot: "CSOB", phase: "reflexion" as PhaseKey, urgent: false },
  { name: "Prototype IA qualité", bot: "CTOB", phase: "creation" as PhaseKey, urgent: false },
  { name: "Rapport rétention employés", bot: "CHROB", phase: "attention" as PhaseKey, urgent: true },
];

export const INDUSTRIE_NEWS = [
  { title: "Adoption IA manufacturière +39 pts en 2025", source: "STIQ", hot: true },
  { title: "Pénurie main-d'œuvre: 25K postes vacants au Québec", source: "ISQ", hot: true },
  { title: "Robotique collaborative: ROI moyen 18 mois", source: "IFR", hot: false },
  { title: "Subventions CDPQ: 50M$ pour automatisation PME", source: "Gouv. QC", hot: false },
];

export const BOT_FEED = [
  { bot: "CFOB", action: "Rapport mensuel Q4 complété", time: "Il y a 2h" },
  { bot: "CTOB", action: "Migration DB — phase 2 lancée", time: "Il y a 4h" },
  { bot: "CMOB", action: "Campagne email analysée — taux 3.2%", time: "Il y a 6h" },
  { bot: "CROB", action: "3 leads qualifiés cette semaine", time: "Hier" },
];

export const DECISIONS_DATA = [
  { id: "D-108", title: "Ajuster prix gamme A (+5%)", status: "Approuvée", sc: "text-emerald-600 bg-emerald-50" },
  { id: "D-107", title: "Embauche développeur senior", status: "En attente", sc: "text-amber-600 bg-amber-50" },
  { id: "D-106", title: "Renouvellement contrat fournisseur", status: "Approuvée", sc: "text-emerald-600 bg-emerald-50" },
];

// ========== ALERTS DATA ==========

export const ALERTS = [
  { id: 1, severity: "critique" as const, icon: ShieldAlert, bc: "border-red-400", bgc: "bg-red-50", tc: "text-red-700",
    title: "Marge brute en baisse de 4.2% vs Q3", source: "Frank (CFO)", bot: "CFOB",
    detail: "Coûts matières premières +12% sans ajustement prix. Impact: 38K$/mois." },
  { id: 2, severity: "critique" as const, icon: TrendingDown, bc: "border-red-400", bgc: "bg-red-50", tc: "text-red-700",
    title: "Pipeline ventes stagne depuis 3 semaines", source: "Rich (CRO)", bot: "CROB",
    detail: "Aucun nouveau lead qualifié. Conversion: 0.8% (cible 2.1%)." },
  { id: 3, severity: "attention" as const, icon: Clock, bc: "border-amber-400", bgc: "bg-amber-50", tc: "text-amber-700",
    title: "Retard livraison Infrastructure Tech", source: "Tim (CTO)", bot: "CTOB",
    detail: "Migration serveurs en retard de 2 semaines. Bloquant déploiement Q1." },
  { id: 4, severity: "attention" as const, icon: AlertTriangle, bc: "border-amber-400", bgc: "bg-amber-50", tc: "text-amber-700",
    title: "3 employés clés en entrevue ailleurs", source: "Hélène (CHRO)", bot: "CHROB",
    detail: "LinkedIn/Glassdoor: lead dev, dir. marketing, analyste senior." },
  { id: 5, severity: "opportunite" as const, icon: Lightbulb, bc: "border-emerald-400", bgc: "bg-emerald-50", tc: "text-emerald-700",
    title: "Appel d'offres Hydro-Québec — 12 jours", source: "Simone (CSO)", bot: "CSOB",
    detail: "Contrat 2.1M$ en automatisation. Match: 87%. Pas de soumission encore." },
];

// ========== BOT TEAM ==========

export const TEAM = [
  { code: "CFOB", name: "Frank CFO" },
  { code: "CTOB", name: "Tim CTO" },
  { code: "CSOB", name: "Simone CSO" },
];

// ========== ORBIT9 TYPES & DATA ==========

type ContextMode = "brainteam" | "orbit9";

interface VitaaScore { v: number; i: number; t: number; a1: number; a2: number; }
interface CelluleMember { name: string; role: string; avatar: string; vitaa: VitaaScore; }
interface Cellule {
  name: string; type: "interne" | "externe"; members: number; maxMembers: number;
  gradient: string; membres: CelluleMember[]; sousCellules: string[]; status: string;
}

export const ORBIT9_CELLULES: Cellule[] = [
  {
    name: "Les Titans", type: "interne", members: 6, maxMembers: 9,
    gradient: "from-teal-600 to-teal-500",
    membres: [
      { name: "Carl F.", role: "Fondateur", avatar: "CF", vitaa: { v: 0.7, i: 0.8, t: 0.6, a1: 0.5, a2: 0.4 } },
      { name: "Marie D.", role: "Ops", avatar: "MD", vitaa: { v: 0.5, i: 0.6, t: 0.8, a1: 0.3, a2: 0.2 } },
      { name: "Jean-P. L.", role: "Ventes", avatar: "JL", vitaa: { v: 0.9, i: 0.4, t: 0.5, a1: 0.7, a2: 0.6 } },
      { name: "Sophie B.", role: "Marketing", avatar: "SB", vitaa: { v: 0.6, i: 0.7, t: 0.5, a1: 0.4, a2: 0.8 } },
      { name: "Luc T.", role: "Tech", avatar: "LT", vitaa: { v: 0.3, i: 0.9, t: 0.7, a1: 0.6, a2: 0.3 } },
      { name: "Nathalie R.", role: "Finance", avatar: "NR", vitaa: { v: 0.5, i: 0.5, t: 0.4, a1: 0.8, a2: 0.7 } },
    ],
    sousCellules: ["Marketing", "Ops", "Stratégie"],
    status: "execution",
  },
  {
    name: "Escouade Ventes", type: "interne", members: 3, maxMembers: 9,
    gradient: "from-teal-600 to-teal-500",
    membres: [
      { name: "Jean-P. L.", role: "Lead Ventes", avatar: "JL", vitaa: { v: 0.9, i: 0.4, t: 0.5, a1: 0.7, a2: 0.6 } },
      { name: "Marc A.", role: "Rep. Senior", avatar: "MA", vitaa: { v: 0.8, i: 0.3, t: 0.6, a1: 0.5, a2: 0.4 } },
      { name: "Chantal V.", role: "Rep. Junior", avatar: "CV", vitaa: { v: 0.6, i: 0.5, t: 0.4, a1: 0.3, a2: 0.2 } },
    ],
    sousCellules: ["Prospection", "Closing"],
    status: "creation",
  },
  {
    name: "Innovation Lab", type: "interne", members: 4, maxMembers: 9,
    gradient: "from-teal-600 to-teal-500",
    membres: [
      { name: "Luc T.", role: "Lead Tech", avatar: "LT", vitaa: { v: 0.3, i: 0.9, t: 0.7, a1: 0.6, a2: 0.3 } },
      { name: "Amélie C.", role: "R&D", avatar: "AC", vitaa: { v: 0.4, i: 0.8, t: 0.9, a1: 0.5, a2: 0.4 } },
      { name: "David M.", role: "Data", avatar: "DM", vitaa: { v: 0.2, i: 0.7, t: 0.8, a1: 0.4, a2: 0.3 } },
      { name: "Sophie B.", role: "Design", avatar: "SB", vitaa: { v: 0.6, i: 0.7, t: 0.5, a1: 0.4, a2: 0.8 } },
    ],
    sousCellules: ["Prototypage", "Veille"],
    status: "reflexion",
  },
  {
    name: "Collab MetalPro", type: "externe", members: 5, maxMembers: 9,
    gradient: "from-cyan-600 to-cyan-500",
    membres: [
      { name: "Carl F.", role: "Usine Bleue", avatar: "CF", vitaa: { v: 0.7, i: 0.8, t: 0.6, a1: 0.5, a2: 0.4 } },
      { name: "Pierre G.", role: "MetalPro CEO", avatar: "PG", vitaa: { v: 0.8, i: 0.5, t: 0.4, a1: 0.6, a2: 0.7 } },
      { name: "Anne L.", role: "MetalPro COO", avatar: "AL", vitaa: { v: 0.6, i: 0.4, t: 0.7, a1: 0.5, a2: 0.3 } },
      { name: "François D.", role: "MetalPro CTO", avatar: "FD", vitaa: { v: 0.4, i: 0.7, t: 0.8, a1: 0.3, a2: 0.2 } },
      { name: "Julie M.", role: "MetalPro Ventes", avatar: "JM", vitaa: { v: 0.9, i: 0.3, t: 0.5, a1: 0.6, a2: 0.5 } },
    ],
    sousCellules: ["Joint-Venture", "Distribution"],
    status: "observation",
  },
];

const ORBIT9_FEED = [
  { type: "bot" as const, code: "CROB", text: "3 leads qualifiés cette semaine via Orbit⁹", time: "Il y a 2h" },
  { type: "humain" as const, name: "Marie D.", text: "Nouveau contrat signé avec Emballages Éco+!", time: "Il y a 4h" },
  { type: "bot-to-bot" as const, codes: ["CSOB", "CROB"], text: "Simone à Rich: Match Orbit⁹ trouvé — score 87%", time: "Hier" },
  { type: "bot" as const, code: "CMOB", text: "Campagne cellule Les Titans — taux d'engagement 4.1%", time: "Hier" },
  { type: "humain" as const, name: "Jean-P. L.", text: "Pipeline Q1 en bonne voie, 3 propositions envoyées", time: "Il y a 2j" },
  { type: "bot" as const, code: "CFOB", text: "Budget cellule Innovation Lab: 82% utilisé, prévision OK", time: "Il y a 2j" },
  { type: "bot-to-bot" as const, codes: ["CTOB", "CINOB"], text: "Tim à Inès: Prototype IoT v2 prêt pour validation", time: "Il y a 3j" },
  { type: "humain" as const, name: "Luc T.", text: "Démo client réussie — MetalPro veut avancer", time: "Il y a 3j" },
];

const ORBIT9_CHAT = [
  { code: "CEOB", text: "Mode Orbit⁹ activé. Tu as 4 cellules actives: 3 internes et 1 collaboration externe avec MetalPro. Les Titans brûlent fort — ton équipe principale est en feu." },
  { code: "CSOB", text: "Match détecté: MetalPro cherche un fournisseur d'automatisation. Score Orbit⁹: 87%. Je recommande une rencontre cette semaine." },
  { code: "CROB", text: "Pipeline cellule Escouade Ventes: 3 leads qualifiés cette semaine. Conversion à 2.3% — au-dessus de la cible." },
];

const ORBIT9_BOTS = ["CSOB", "CROB", "CMOB"];

type Orbit9Tab = "dashboard" | "blueprint" | "cellules" | "jumelage" | "gouvernance" | "pionniers" | "vitaa" | "perso" | "creer-cellule";

const O9_TABS: { key: Orbit9Tab; label: string; Icon: React.ElementType }[] = [
  { key: "dashboard", label: "Accueil", Icon: Home },
  { key: "blueprint", label: "Blueprint", Icon: BookOpen },
  { key: "cellules", label: "Cellules", Icon: Atom },
  { key: "jumelage", label: "Jumelage", Icon: Handshake },
  { key: "gouvernance", label: "Gouvernance", Icon: Shield },
  { key: "pionniers", label: "Pionniers", Icon: Rocket },
  { key: "vitaa", label: "VITAA", Icon: Activity },
  { key: "perso", label: "Mon profil", Icon: UserCircle },
];

const ALL_BOTS = [
  { code: "CEOB", name: "CarlOS" }, { code: "CTOB", name: "Tim" }, { code: "CFOB", name: "Frank" },
  { code: "CMOB", name: "Mathilde" }, { code: "CSOB", name: "Simone" }, { code: "COOB", name: "Olivier" },
  { code: "CPOB", name: "Paco" }, { code: "CHROB", name: "Hélène" }, { code: "CINOB", name: "Inès" },
  { code: "CROB", name: "Rich" }, { code: "CLOB", name: "Loulou" }, { code: "CISOB", name: "Sébastien" },
];

// ========== CEOB BLOCS DATA (pattern DepartmentTourDeControle) ==========

// CEOB blocs — headers PASTEL UB_BLUE + indicateurs d'état AMORCER
// phase = état actuel du bloc (détermine l'indicateur coloré)
const UB_LOGO = "#00B4D8"; // bleu cyan du mot "bleue" dans le logo Usine Bleue
export const UB_PASTEL = "bg-[#00B4D8]/10"; // pastel du bleu logo
const CEOB_BLOCS = [
  {
    icon: Shield, title: "Pilotage Stratégique",
    phase: "execution" as PhaseKey,
    items: [
      { primary: "Décisions actives", secondary: "Decision Log", value: "3" },
      { primary: "Chantiers en cours", secondary: "3 départements impliqués", value: "3" },
      { primary: "Bots actifs", secondary: "Ghost Team complète", value: "12" },
    ],
  },
  {
    icon: Target, title: "Objectifs CEO",
    phase: "reflexion" as PhaseKey,
    items: [
      { primary: "Vision & roadmap", secondary: "Discutez avec CarlOS" },
      { primary: "Objectif trimestre", secondary: "Pipeline +25% vs Q3" },
      { primary: "Prochaine étape", secondary: "Diagnostic VITAA" },
    ],
  },
  {
    icon: ShieldAlert, title: "Gouvernance",
    phase: "observation" as PhaseKey,
    items: [
      { primary: "Protocole CREDO", secondary: "5 phases opérationnelles", value: "Actif" },
      { primary: "Protocole COMMAND", secondary: "Multi-domaine", value: "Actif" },
      { primary: "Decision Log", secondary: "Capture automatique", value: "Prêt" },
    ],
  },
  {
    icon: DollarSign, title: "KPIs Entreprise",
    phase: "attention" as PhaseKey,
    items: [
      { primary: "Revenus Q4", secondary: "+8.3% vs Q3", value: "2.4M$" },
      { primary: "Pipeline ventes", secondary: "-12% (attention)", value: "890K$" },
      { primary: "Marge brute", secondary: "En baisse de 4.2%", value: "38.1%" },
    ],
  },
  {
    icon: Globe, title: "Réseau & Expansion",
    phase: "execution" as PhaseKey,
    items: [
      { primary: "Contacts Orbit⁹", secondary: "4 cellules actives", value: "24" },
      { primary: "Opportunités", secondary: "Matching actif", value: "3" },
      { primary: "Marché US", secondary: "Expansion en cours", value: "45%" },
    ],
  },
  {
    icon: MessageSquare, title: "Communication",
    phase: "observation" as PhaseKey,
    items: [
      { primary: "Chat CarlOS", secondary: "Texte + vocal + vidéo", value: "Prêt" },
      { primary: "Ghost Team", secondary: "Multi-perspectives actif", value: "12 bots" },
      { primary: "Documents", secondary: "Templates + génération AI", value: "141" },
    ],
  },
  {
    icon: Crosshair, title: "Missions",
    phase: "execution" as PhaseKey,
    items: [
      { primary: "Missions actives", secondary: "Réparties sur 3 chantiers", value: "8" },
      { primary: "Missions complétées", secondary: "Ce trimestre", value: "14" },
      { primary: "Tâches en cours", secondary: "Assignées aux bots", value: "23" },
    ],
  },
  {
    icon: HeartPulse, title: "Santé",
    phase: "retroaction" as PhaseKey,
    items: [
      { primary: "Score VITAA", secondary: "Dernier diagnostic", value: "72%" },
      { primary: "Triangle du Feu", secondary: "3 piliers actifs", value: "🔥" },
      { primary: "Tendance", secondary: "Amélioration sur 30j", value: "+8%" },
    ],
  },
  {
    icon: Search, title: "Veille",
    phase: "observation" as PhaseKey,
    items: [
      { primary: "Alertes sectorielles", secondary: "Actif après diagnostic", value: "5" },
      { primary: "Veille concurrentielle", secondary: "Alimentée par CarlOS" },
      { primary: "Tendances industrie", secondary: "IA adoption +39 pts" },
    ],
  },
  {
    icon: Brain, title: "Intelligence",
    phase: "creation" as PhaseKey,
    items: [
      { primary: "Diagnostics", secondary: "5 types disponibles", value: "5" },
      { primary: "Recommandations AI", secondary: "Générées après diagnostic" },
      { primary: "Apprentissage", secondary: "CarlOS évolue avec vous" },
    ],
  },
];

// Reflexion section content for the magazine page
const REFLEXION_SECTIONS = [
  { id: "diagnostic", title: "Diagnostic Initial", icon: Stethoscope, color: "orange" },
  { id: "perspectives", title: "Perspectives Multi-Bots", icon: Users, color: "blue" },
  { id: "synthese", title: "Synthèse Croisée", icon: Target, color: "indigo" },
  { id: "brainstorm", title: "Brainstorm & Idéation", icon: Lightbulb, color: "yellow" },
  { id: "causes", title: "Analyse des Causes (5 Pourquoi)", icon: Search, color: "red" },
  { id: "recherche", title: "Recherche & Validation", icon: Globe, color: "cyan" },
  { id: "challenge", title: "Challenge & Contre-arguments", icon: Shield, color: "amber" },
  { id: "prerapport", title: "Pré-rapport de Réflexion", icon: FileText, color: "emerald" },
];

// ========== MOCK DATA — copied from SimPhaseReflexion ==========

const SPR_BRAINSTORM_IDEAS = [
  { id: 1, text: "Campagne micro-influenceurs régionale", bot: "CMOB", tag: "Marketing", color: "bg-yellow-100 border-yellow-300" },
  { id: 2, text: "Partenariat distributeurs automatisation", bot: "CSOB", tag: "Stratégie", color: "bg-blue-100 border-blue-300" },
  { id: 3, text: "Webinaires VITAA pour prospects", bot: "CEOB", tag: "Contenu", color: "bg-green-100 border-green-300" },
  { id: 4, text: "Programme referral clients existants", bot: "CFOB", tag: "Finance", color: "bg-pink-100 border-pink-300" },
  { id: 5, text: "Contenu éducatif LinkedIn série", bot: "CMOB", tag: "Marketing", color: "bg-purple-100 border-purple-300" },
  { id: 6, text: "Salon virtuel manufacturiers Q3", bot: "COOB", tag: "Opérations", color: "bg-orange-100 border-orange-300" },
];

const SPR_DEEP_SEARCH_SOURCES = [
  { icon: FileText, title: "Rapport MESI 2025", detail: "Tendances numériques PME manufacturières", score: 94 },
  { icon: BarChart3, title: "Benchmark secteur", detail: "Coût acquisition client SaaS B2B: 340-890$", score: 87 },
  { icon: TrendingUp, title: "Étude CEFRIO", detail: "72% des PME sous-investissent en marketing digital", score: 91 },
  { icon: Target, title: "Analyse concurrents", detail: "3 solutions comparables, aucune avec AI CEO intégrée", score: 82 },
];

const SPR_REPORT_SECTIONS = [
  { id: 1, title: "Contexte et enjeux", content: "Le chantier Marketing Q2 vise à augmenter la visibilité d'Usine Bleue auprès des PME manufacturières du Québec. Budget actuel: 12K$/mois. Objectif: +40% de leads qualifiés." },
  { id: 2, title: "Diagnostic initial", content: "3 tensions identifiées: coût acquisition élevé (780$/lead), faible conversion site web (1.2%), pipeline trop dépendant du bouche-à-oreille (65%)." },
  { id: 3, title: "Perspectives multi-bot", content: "CMO: repositionner le message sur le ROI concret. CFO: budget réallocation content vs ads. CTO: automatiser le nurturing email." },
  { id: 4, title: "Brainstorm — 6 idées", content: "Micro-influenceurs, partenariats distributeurs, webinaires VITAA, referral program, content LinkedIn, salon virtuel Q3." },
  { id: 5, title: "Analyse 5 Pourquoi", content: "Cause racine: le messaging actuel parle de technologie, pas de résultats business. Les PME ne se reconnaissent pas." },
  { id: 6, title: "Deep Search — 4 sources", content: "MESI 2025, benchmark SaaS B2B, étude CEFRIO, analyse concurrentielle. Consensus: le marché est prêt mais mal adressé." },
  { id: 7, title: "Challenge et défense", content: "Challenge sur le budget: Frank démontre ROI > 3x avec le programme referral seul. Risque identifié: timeline agressive pour Q2." },
  { id: 8, title: "Recommandations", content: "Prioriser: (1) Programme referral (quick win), (2) Content LinkedIn (moyen terme), (3) Webinaires VITAA (long terme). Budget total: 3,800$/mois." },
];

const SPR_DIAG_ITEMS = [
  { label: "Présence web", what: "Qualité et modernité du site", score: 45, detail: "Site vieillissant, pas mobile-first", action: "Lancer un audit UX", bot: "CMOB",
    expanded: { gap: "55% à combler", actions: ["Refonte mobile-first (priorité 1)", "Moderniser le design (UI/UX)", "Ajouter un chatbot de conversion"], impact: "Conversion +2.5% estimée", effort: "Moyen — 3-4 semaines" } },
  { label: "SEO technique", what: "Visibilité dans les moteurs de recherche", score: 80, detail: "Bonne base, 47 optimisations", action: "Voir les recommandations", bot: "CTOB",
    expanded: { gap: "20% à combler", actions: ["47 optimisations mineures identifiées", "Corriger les balises meta manquantes", "Améliorer le sitemap XML"], impact: "Trafic organique +15%", effort: "Faible — 1 semaine" } },
  { label: "Conversion", what: "Taux de visiteurs qui deviennent clients", score: 32, detail: "Aucun CTA clair, pas de funnel", action: "Analyser le funnel", bot: "CMOB",
    expanded: { gap: "68% à combler — CRITIQUE", actions: ["Créer un funnel de conversion 5 étapes", "Ajouter des CTA clairs sur chaque page", "Déployer un chatbot AI (conversion 3-4%)", "A/B tester les landing pages"], impact: "Conversion 1.2% → 3-4%", effort: "Élevé — 4-6 semaines" } },
  { label: "Mobile", what: "Expérience sur téléphone et tablette", score: 65, detail: "Responsive basic, pas natif", action: "Test responsive", bot: "CTOB",
    expanded: { gap: "35% à combler", actions: ["Optimiser le responsive (breakpoints)", "Tester sur 5 appareils cibles", "PWA pour expérience native"], impact: "Engagement mobile +40%", effort: "Moyen — 2-3 semaines" } },
  { label: "Vitesse", what: "Temps de chargement des pages", score: 38, detail: "Bundle 4.2MB, images non opt.", action: "Optimiser le bundle", bot: "CTOB",
    expanded: { gap: "62% à combler — CRITIQUE", actions: ["Réduire le bundle JS (code splitting)", "Optimiser les images (WebP, lazy load)", "CDN pour les assets statiques", "Cache navigateur agressif"], impact: "Temps chargement 4.8s → 1.5s", effort: "Moyen — 2 semaines" } },
  { label: "Accessibilité", what: "Conformité aux standards d'accessibilité", score: 55, detail: "WCAG AA partiel", action: "Audit WCAG", bot: "COOB",
    expanded: { gap: "45% à combler", actions: ["Audit WCAG 2.1 AA complet", "Corriger les contrastes de couleur", "Ajouter les attributs ARIA manquants"], impact: "Conformité légale + SEO bonus", effort: "Faible — 1-2 semaines" } },
];

// ========== MAIN COMPONENT ==========

export function SimAmorcer({ onBack, attentionTrigger = 0, cockpitTab = "departement", o9Section = "cellules", onO9Section, rightSection: rightSectionProp = null, onCloseSection, activeBotCode = "CEOB", showIconCatalog = false }: { onBack: () => void; attentionTrigger?: number; cockpitTab?: string; o9Section?: string; onO9Section?: (s: string) => void; rightSection?: string | null; onCloseSection?: () => void; activeBotCode?: string; showIconCatalog?: boolean }) {
  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const [activePhase, setActivePhase] = useState<PhaseKey>("observation");
  const [chatStage, setChatStage] = useState(0);
  const [typed, setTyped] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [o9ChatTyped, setO9ChatTyped] = useState(false);
  const [reflexionContext, setReflexionContext] = useState<string | null>(null);
  const [rightSection, setRightSection] = useState<string | null>(rightSectionProp);
  const [blueprintHeaderView, setBlueprintHeaderView] = useState<HeaderView>("blueprint");
  const [blueprintStats, setBlueprintStats] = useState<{ tier: string; tierLabel: string; score: number } | null>(null);
  const [conceptionStage, setConceptionStage] = useState(0);
  const [conceptionTyped, setConceptionTyped] = useState(false);

  const showBlueprint = !!rightSection;

  useEffect(() => { setRightSection(rightSectionProp); if (rightSectionProp) setActivePhase("observation"); }, [rightSectionProp]);

  const isOrbit9 = cockpitTab === "orbit9";

  const pc = PC[activePhase];

  const prevPhaseRef = useRef(activePhase);
  useEffect(() => {
    // Don't reset chatStage when switching between reflexion<->creation (preserves reflexion progress)
    const isReflexionCreationSwitch =
      (prevPhaseRef.current === "reflexion" && activePhase === "creation") ||
      (prevPhaseRef.current === "creation" && activePhase === "reflexion");
    if (!isReflexionCreationSwitch) { setChatStage(0); }
    setTyped(false);
    prevPhaseRef.current = activePhase;
  }, [activePhase]);
  useEffect(() => { if (attentionTrigger > 0) { setActivePhase("attention"); } }, [attentionTrigger]);
  useEffect(() => { chatRef.current && (chatRef.current.scrollTop = chatRef.current.scrollHeight); }, [chatStage, typed]);
  useEffect(() => { rightRef.current && (rightRef.current.scrollTop = 0); }, [chatStage]);

  const advance = () => { setTyped(false); setChatStage(s => s + 1); };
  const advanceConception = () => { setConceptionTyped(false); setConceptionStage(s => s + 1); };
  const startReflexion = (chantier: string) => { setReflexionContext(chantier); setActivePhase("reflexion"); };
  const startConception = () => { setActivePhase("creation"); setConceptionStage(0); setConceptionTyped(false); };
  const isDash = activePhase === "observation" || activePhase === "attention" || activePhase === "moderation";

  return (
    <div className="h-full flex flex-col bg-white">
      <ResizablePanelGroup direction="horizontal" autoSaveId="sim-amorcer-split" className="flex-1">

        {/* ═══ LEFT — Discussion ═══ */}
        <ResizablePanel defaultSize={40} minSize={20} maxSize={60}>
          <div className="h-full flex flex-col border-r border-gray-200 bg-white">

            {/* Header UB_BLUE — dynamique selon cockpit tab */}
            <div className="h-12 px-3 shrink-0 flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
              {isOrbit9 ? (
                <>
                  <Atom className="h-4 w-4 text-white" />
                  <span className="text-[11px] text-white font-medium">Orbit<sup className="text-[9px]">9</sup></span>
                  <div className="flex-1" />
                  {/* Bande noms humains + bots (Carl vocal 14h24) */}
                  {ORBIT9_CELLULES[0].membres.slice(0, 3).map((m, i) => (
                    <span key={i} className="text-xs text-white/70 ml-1">{m.name}</span>
                  ))}
                  <span className="text-xs text-white/40 ml-0.5">+{ORBIT9_CELLULES[0].membres.length - 3}</span>
                  {ORBIT9_BOTS.map(code => (
                    <div key={code} className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white/30 ml-0.5">
                      <BotAvatar code={code} size="sm" />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 text-white" />
                  <span className="text-[11px] text-white font-medium">Brain Team</span>
                  <div className="flex-1" />
                  <span className="text-xs text-white/50 font-medium mr-1">Cellules de travail</span>
                  {TEAM.map(b => (
                    <div key={b.code} className="flex items-center gap-1 ml-0.5">
                      <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white/30">
                        <BotAvatar code={b.code} size="sm" />
                      </div>
                      <span className="text-xs text-white/70 hidden xl:inline">{b.name}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Discussion — scrollable */}
            <div ref={chatRef} className="flex-1 overflow-auto">
              {isOrbit9 ? (
                <div className="p-3 space-y-3">
                  <Orbit9Chat typed={o9ChatTyped} setTyped={setO9ChatTyped} selectedCellule={null} />
                </div>
              ) : (
                <div className="p-3 space-y-3">
                  {activePhase === "reflexion" && (
                    <ReflexionChat stage={chatStage} typed={typed} setTyped={setTyped} advance={advance} pc={pc} context={reflexionContext} />
                  )}
                  {activePhase === "creation" && (
                    <ConceptionChat stage={conceptionStage} typed={conceptionTyped} setTyped={setConceptionTyped} advance={advanceConception} onBackToReflexion={() => setActivePhase("reflexion")} />
                  )}
                  {activePhase === "observation" && (
                    <ObservationChat typed={typed} setTyped={setTyped} />
                  )}
                  {activePhase === "attention" && (
                    <AttentionChat stage={chatStage} typed={typed} setTyped={setTyped} advance={advance} pc={pc} />
                  )}
                  {activePhase === "moderation" && (
                    <ModerationChat stage={chatStage} typed={typed} setTyped={setTyped} advance={advance} pc={pc} />
                  )}
                  {!isDash && activePhase !== "creation" && (
                    <PlaceholderChat phase={activePhase} />
                  )}
                </div>
              )}
            </div>

            {/* Input box style Claude AI — boutons integres dans la box */}
            <div className="shrink-0 bg-white px-3 pb-2 pt-1">
              <div className="relative rounded-2xl border border-gray-300 bg-white shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                {/* Textarea */}
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Parle à CarlOS..."
                  className="w-full text-sm px-4 pt-3 pb-2 rounded-t-2xl border-0 focus:outline-none min-h-[70px] resize-none bg-transparent"
                  rows={3}
                />
                {/* Barre de boutons integree en bas de la box */}
                <div className="flex items-center gap-1 px-2 pb-2">
                  {/* Menu + (piece jointe, Drive, GitHub, connecteurs) */}
                  <div className="relative">
                    <button
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Ajouter"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    {showAttachMenu && (
                      <div className="absolute bottom-full left-0 mb-1 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-20">
                        <button onClick={() => setShowAttachMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-700">Pièce jointe</span>
                        </button>
                        <button onClick={() => setShowAttachMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                          <Globe className="h-4 w-4 text-amber-500" />
                          <span className="text-xs text-gray-700">Depuis Google Drive</span>
                        </button>
                        <button onClick={() => setShowAttachMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                          <Zap className="h-4 w-4 text-gray-700" />
                          <span className="text-xs text-gray-700">Depuis GitHub</span>
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        <button onClick={() => setShowAttachMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                          <Activity className="h-4 w-4 text-indigo-500" />
                          <div>
                            <span className="text-xs text-gray-700">Connecteurs API</span>
                            <span className="block text-xs text-gray-400">Intégrez vos logiciels SaaS</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 3 modes: Discussion, Conference, Vision */}
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100" title="Discussion vocale">
                    <Phone className="h-3.5 w-3.5" /><span className="hidden lg:inline">Discussion</span>
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="Conférence vidéo">
                    <Video className="h-3.5 w-3.5" /><span className="hidden lg:inline">Conférence</span>
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer bg-cyan-50 text-cyan-600 hover:bg-cyan-100" title="Vision Ray-Ban">
                    <Glasses className="h-3.5 w-3.5" /><span className="hidden lg:inline">Vision</span>
                  </button>

                  <div className="flex-1" />

                  {/* Bouton Envoyer — apparait quand il y a du texte */}
                  <button
                    className={cn(
                      "p-2 rounded-lg transition-all cursor-pointer",
                      inputText.trim()
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        : "bg-gray-100 text-gray-300 cursor-default"
                    )}
                    title="Envoyer"
                    disabled={!inputText.trim()}
                  >
                    {inputText.trim() ? <ChevronUp className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {/* Disclaimer */}
              <p className="text-center text-xs text-gray-400 mt-1.5">
                Brain Team est une équipe d&apos;agents IA et peut faire des erreurs. Veuillez vérifier les réponses.
              </p>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle className="w-1 bg-gray-200 hover:bg-blue-400 transition-colors cursor-col-resize" />

        {/* ═══ RIGHT — AMORCER tabs TOUJOURS en haut (Carl vocal 13h25) + contenu Orbit⁹ en dessous ═══ */}
        <ResizablePanel defaultSize={60} minSize={40} maxSize={80}>
          <div className="h-full flex flex-col overflow-hidden">

            {/* Header département pastel h-12 — intègre les sous-tabs de la section active */}
            {(() => {
              const DeptIcon = isOrbit9 ? Atom : (DEPT_DASH_ICON[activeBotCode] || Home);
              const deptLabel = isOrbit9 ? "" : (DEPT_FULL_LABEL[activeBotCode] || "");
              const O9_LABEL: Record<string, string> = { dashboard: "Dashboard", blueprint: "Blueprint", chantiers: "Chantiers", projets: "Projets", missions: "Missions", taches: "Tâches", discussions: "Discussions", documents: "Documents", agenda: "Agenda", "sante-reseau": "Santé réseau", cellules: "Cellules", jumelage: "Jumelage", gouvernance: "Gouvernance", pionniers: "Pionniers", vitaa: "VITAA", perso: "Mon profil", feed: "Nouvelles", evenements: "Événements", "creer-cellule": "Créer une cellule" };
              const sectionLabel = isOrbit9
                ? (O9_LABEL[o9Section] || "Orbit⁹")
                : rightSection === "cockpit" ? "Cockpit" : rightSection === "blueprint" ? "Blueprint" : rightSection === "dataroom" ? "Data Room" : rightSection === "playbooks" ? "Playbook Store" : rightSection === "conferenceai" ? "Conference AI" : activePhase === "reflexion" ? "Réflexion" : activePhase === "creation" ? "Conception" : "Cockpit";
              const titleText = isOrbit9
                ? `Orbit⁹ — ${sectionLabel}`
                : `Département ${deptLabel} — ${sectionLabel}`;
              const showBlueprintTabs = !isOrbit9 && rightSection === "blueprint";
              return (
                <div className="h-12 px-3 shrink-0 flex items-center gap-2 border-b border-gray-200" style={{ backgroundColor: "rgba(0, 180, 216, 0.12)" }}>
                  <DeptIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-[11px] font-bold text-gray-900 shrink-0">{titleText}</span>
                  {/* Sous-tabs Blueprint — séparés par un divider vertical */}
                  {showBlueprintTabs && (
                    <>
                      <div className="w-px h-5 bg-gray-300 mx-1.5" />
                      <div className="flex items-center gap-1">
                        {BLUEPRINT_HEADER_TABS.filter(t => !t.ceoOnly || activeBotCode === "CEOB").map(tab => (
                          <button
                            key={tab.key}
                            onClick={() => setBlueprintHeaderView(tab.key)}
                            className="px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                            style={blueprintHeaderView === tab.key
                              ? { backgroundColor: UB_BLUE, color: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }
                              : {}
                            }
                          >
                            <tab.icon className="h-3.5 w-3.5" />
                            {tab.key === "blueprint" ? (DEPT_SHORT_LABEL[activeBotCode] || "Direction") : tab.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {!isOrbit9 && activePhase === "reflexion" && reflexionContext && !rightSection && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-[11px] font-medium text-orange-600">{reflexionContext}</span>
                    </>
                  )}
                  {!isOrbit9 && activePhase === "creation" && !rightSection && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                      <Hammer className="h-3.5 w-3.5 text-yellow-600" />
                      <span className="text-[11px] font-medium text-yellow-600">Conception du chantier</span>
                    </>
                  )}
                  {!isOrbit9 && activePhase !== "observation" && activePhase !== "reflexion" && activePhase !== "creation" && !rightSection && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                      <span className={cn("text-[11px] font-medium", pc.text)}>{pc.label}</span>
                    </>
                  )}
                  <div className="flex-1" />
                  {/* Tier + % completion à droite pour Blueprint */}
                  {showBlueprintTabs && blueprintStats && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-gray-500">{blueprintStats.tierLabel}</span>
                      <span className="text-[10px] font-bold bg-gray-900 text-white px-2 py-0.5 rounded-full">{blueprintStats.score}%</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Content */}
            <div ref={rightRef} className="flex-1 overflow-auto bg-gray-50">
              {rightSection ? (
                <div className="max-w-4xl mx-auto px-6 py-4 pb-12 sim-blueprint-pastel">
                  <style>{`
                    .sim-blueprint-pastel [class*="bg-gradient-to-r"] {
                      background-image: none !important;
                      background-color: rgba(0, 180, 216, 0.1) !important;
                    }
                    .sim-blueprint-pastel [class*="bg-gradient-to-r"] * {
                      color: #111827 !important;
                    }
                    .sim-blueprint-pastel [class*="bg-white\\/"] {
                      background-color: rgba(0, 180, 216, 0.15) !important;
                      color: #111827 !important;
                    }
                  `}</style>
                  <CanvasActionProvider>
                    {rightSection === "cockpit" && <CockpitView embedded initialDept={activeBotCode} onAction={(phase, context) => { setActivePhase(phase as PhaseKey); setReflexionContext(context); setRightSection(null); }} />}
                    {rightSection === "blueprint" && <BlueprintView botCode={activeBotCode} headerGradient="from-blue-600 to-blue-500" hideHeader activeHeaderView={blueprintHeaderView} onHeaderViewChange={setBlueprintHeaderView} onStats={setBlueprintStats} />}
                    {rightSection === "dataroom" && <DataRoomView botCode={activeBotCode} headerGradient="from-blue-600 to-blue-500" showHeader />}
                    {rightSection === "playbooks" && <PlaybookStoreView botCode={activeBotCode} headerGradient="from-blue-600 to-blue-500" showHeader />}
                    {rightSection === "conferenceai" && <ConferenceAIView headerGradient="from-blue-600 to-blue-500" onNavigateToStore={() => setRightSection("playbooks")} />}
                  </CanvasActionProvider>
                </div>
              ) : isOrbit9 ? (
                <div className="max-w-4xl mx-auto px-6 py-4 pb-12">
                  <CanvasActionProvider>
                  {o9Section === "dashboard" && <Orbit9SocialHome />}
                  {o9Section === "blueprint" && <Orbit9BlueprintCollaboration />}
                  {o9Section === "cellules" && <MesCellules onSelect={() => {}} activePhase={activePhase} />}
                  {o9Section === "vitaa" && <VITAADashboard selectedCellule={ORBIT9_CELLULES[0]} />}
                  {o9Section === "perso" && <MonProfilOrbit9 />}
                  {o9Section === "gouvernance" && <Orbit9Gouvernance />}
                  {o9Section === "jumelage" && <JumelageOrbit9 />}
                  {o9Section === "pionniers" && <PionniersOrbit9 />}
                  {o9Section === "creer-cellule" && <CreerCellulePage />}
                  </CanvasActionProvider>
                </div>
              ) : showIconCatalog ? (
                <IconCatalog />
              ) : isDash ? (
                <VueEnsemble phase={activePhase} chatStage={chatStage} onStartReflexion={startReflexion} />
              ) : activePhase === "reflexion" ? (
                <PhaseReflexion stage={chatStage} context={reflexionContext} onStartConception={startConception} />
              ) : activePhase === "creation" ? (
                <ConceptionWizard stage={conceptionStage} context={reflexionContext} />
              ) : activePhase === "operations" ? (
                <OperationsDrillDown />
              ) : (
                <ChantierDrillDown phase={activePhase} />
              )}
            </div>
          </div>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
}

// ========== CHAT HELPERS ==========

export function SBubble({ code, children, collapsed }: { code: string; children: React.ReactNode; collapsed?: boolean }) {
  const name = BOT_COLORS[code]?.name || code;
  const role = BOT_COLORS[code]?.role || "";
  return (
    <div className={cn("flex gap-2 transition-all", collapsed && "opacity-60")}>
      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
        <BotAvatar code={code} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[11px] font-semibold text-blue-700">{name}</span>
          <span className="text-xs text-gray-400">{role}</span>
        </div>
        <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-blue-400 bg-blue-50/30">
          {children}
        </div>
      </div>
    </div>
  );
}

function SBtn({ onClick, icon: Icon, label, pc }: { onClick: () => void; icon: React.ElementType; label: string; pc: PhaseStyle }) {
  return (
    <button onClick={onClick} className={cn(
      "mt-2 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer border",
      pc.btnBg, pc.btnText, pc.btnBorder, pc.btnHover
    )}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

// ========== OBSERVATION CHAT ==========

export function ObservationChat({ typed, setTyped }: { typed: boolean; setTyped: (v: boolean) => void }) {
  return (
    <>
      <SBubble code="CEOB">
        <TypewriterText
          text="Bonjour Carl. Voici ta vue d'ensemble. 12 projets actifs, 3 en retard. Ton pipeline est à 890K$ — en baisse de 12% ce mois. Les bots travaillent sur leurs missions. Besoin de mon attention sur quelque chose?"
          speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
        />
      </SBubble>
      {typed && (
        <>
          <SBubble code="CFOB" collapsed>
            <p className="text-xs text-gray-500 italic">Frank — Rapport Q4 terminé, marges sous surveillance</p>
          </SBubble>
          <SBubble code="CTOB" collapsed>
            <p className="text-xs text-gray-500 italic">Tim — Migration DB phase 2 en cours, ETA 3 jours</p>
          </SBubble>
          <SBubble code="CSOB" collapsed>
            <p className="text-xs text-gray-500 italic">Simone — Appel d'offres HQ identifié, soumission à préparer</p>
          </SBubble>
        </>
      )}
    </>
  );
}

// ========== ATTENTION CHAT (8 stages progressifs) ==========

export function AttentionChat({ stage, typed, setTyped, advance, pc }: {
  stage: number; typed: boolean; setTyped: (v: boolean) => void; advance: () => void; pc: PhaseStyle;
}) {
  return (
    <>
      {stage >= 0 && (
        <SBubble code="CEOB" collapsed={stage > 0}>
          {stage === 0 ? (
            <>
              <TypewriterText text="Mode Attention activé. Je scanne ton environnement d'affaires pour détecter les signaux qui méritent ton focus immédiat." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={Zap} label="Lancer le scan" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Démarrage scan — mode Attention</p>}
        </SBubble>
      )}

      {stage >= 1 && (
        <SBubble code="CEOB" collapsed={stage > 1}>
          {stage === 1 ? (
            <>
              <TypewriterText text="Scan terminé. 5 signaux détectés: 2 alertes critiques, 2 tensions à surveiller, 1 opportunité à saisir. Les bots concernés sont en ligne." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={AlertTriangle} label="Voir les alertes" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">5 signaux — 2 critiques, 2 attention, 1 opportunité</p>}
        </SBubble>
      )}

      {stage >= 2 && (
        <SBubble code="CEOB" collapsed={stage > 2}>
          {stage === 2 ? (
            <>
              <TypewriterText text="Alerte urgente: ta marge brute baisse de 4.2%. Frank a les détails. Le pipeline ventes stagne aussi — Rich a sonné l'alarme." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={DollarSign} label="Analyse de Frank" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Priorisation — marge + pipeline</p>}
        </SBubble>
      )}

      {stage >= 3 && (
        <SBubble code="CFOB" collapsed={stage > 3}>
          {stage === 3 ? (
            <>
              <TypewriterText text="Carl, la marge brute est passée de 42.3% à 38.1%. Cause: coûts matières +12% sans ajustement prix. Impact: 38K$/mois. Je recommande un ajustement de 5-7% sur les produits les plus touchés." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={Activity} label="Risque tech de Tim" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Frank — marge en baisse, ajustement prix recommandé</p>}
        </SBubble>
      )}

      {stage >= 4 && (
        <SBubble code="CTOB" collapsed={stage > 4}>
          {stage === 4 ? (
            <>
              <TypewriterText text="Le projet Infrastructure a 2 semaines de retard. 3 tables critiques sans backup automatisé. J'ai besoin de 2 jours de dev supplémentaires sinon le déploiement Q1 est compromis." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={Lightbulb} label="Opportunité de Simone" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Tim — retard infra, 2 jours dev nécessaires</p>}
        </SBubble>
      )}

      {stage >= 5 && (
        <SBubble code="CSOB" collapsed={stage > 5}>
          {stage === 5 ? (
            <>
              <TypewriterText text="Opportunité: Hydro-Québec — appel d'offres 2.1M$ en automatisation. Match Orbit9: 87%. Deadline 12 jours. On a les compétences mais pas de soumission. Je recommande le mode Conception rapidement." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={BarChart3} label="Voir la synthèse" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Simone — HQ 2.1M$, 12 jours</p>}
        </SBubble>
      )}

      {stage >= 6 && (
        <SBubble code="CEOB" collapsed={stage > 6}>
          {stage === 6 ? (
            <>
              <TypewriterText text="Synthèse: 3 actions prioritaires. (1) Ajustement prix — 38K$/mois. (2) Débloquer infra — 2 jours. (3) Soumission HQ — 12 jours. Je recommande de passer en Modération pour prioriser." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={Target} label="Trier par priorité" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Synthèse — 3 actions prioritaires</p>}
        </SBubble>
      )}

      {stage >= 7 && (
        <div className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-300 rounded-xl px-4 py-3">
          <TypewriterText text="Prêt pour la Modération. Les 5 signaux sont documentés. On filtre et on décide quoi traiter en premier." speed={8} className="text-sm text-pink-800 font-medium" onComplete={() => setTyped(true)} />
          {typed && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500" />
              <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              <div className="w-3.5 h-3.5 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-xs text-pink-700 font-semibold ml-1">Attention → Modération</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ========== MODERATION CHAT ==========

export function ModerationChat({ stage, typed, setTyped, advance, pc }: {
  stage: number; typed: boolean; setTyped: (v: boolean) => void; advance: () => void; pc: PhaseStyle;
}) {
  return (
    <>
      <SBubble code="CEOB" collapsed={stage > 0}>
        {stage === 0 ? (
          <>
            <TypewriterText text="Mode Modération. On filtre et priorise les 5 signaux détectés. Je recommande: (1) Marge brute — impact financier immédiat. (2) Infra tech — bloquant. (3) Soumission HQ — deadline courte. Les 2 autres sont à surveiller." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
            {typed && <SBtn onClick={advance} icon={Filter} label="Appliquer le tri" pc={pc} />}
          </>
        ) : <p className="text-xs text-gray-400 italic">Tri appliqué — 3 prioritaires, 2 en surveillance</p>}
      </SBubble>
      {stage >= 1 && (
        <SBubble code="CEOB">
          <TypewriterText text="Tri appliqué. Les 3 priorités sont classées. Prêt à passer en Réflexion pour analyser en profondeur, ou en Conception pour agir directement?" speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
          {typed && (
            <div className="mt-2 flex gap-2">
              <button className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-orange-100 font-medium cursor-pointer">
                <Brain className="h-3.5 w-3.5" /> Réflexion
              </button>
              <button className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-yellow-100 font-medium cursor-pointer">
                <Hammer className="h-3.5 w-3.5" /> Conception
              </button>
            </div>
          )}
        </SBubble>
      )}
    </>
  );
}

// ========== VUE D'ENSEMBLE (partagee observation/attention/moderation) ==========

export function VueEnsemble({ phase, chatStage, onStartReflexion }: { phase: PhaseKey; chatStage: number; onStartReflexion: (chantier: string) => void }) {
  return (
    <div className="space-y-4">

      {/* ═══ VITAA — 5 piliers de valeur (même pattern que KPIs existants) ═══ */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Ventes", value: "890K$", delta: "+12%", up: true, icon: TrendingUp },
          { label: "Idées", value: "47", delta: "+8 ce mois", up: true, icon: Lightbulb },
          { label: "Temps", value: "186h", delta: "92% alloué", up: true, icon: Clock },
          { label: "Argent", value: "2.4M$", delta: "+18%", up: true, icon: DollarSign },
          { label: "Actifs", value: "63", delta: "+5 ce mois", up: true, icon: Activity },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_PASTEL)}>
              <kpi.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">{kpi.label}</span>
            </div>
            <div className="px-4 py-3">
              <div className="text-2xl font-bold text-gray-800">{kpi.value}</div>
              <div className={cn("text-xs flex items-center gap-1 mt-0.5", kpi.up ? "text-emerald-600" : "text-red-500")}>
                {kpi.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {kpi.delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ ROW 2 — Chantiers + Projets + Signaux d'attention ═══ */}
      <div className="grid grid-cols-3 gap-3">
        {/* Chantiers en cours — avec tags d'état AMORCER */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_PASTEL)}>
            <FolderOpen className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Chantiers</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 ml-auto">{CHANTIERS.length}</span>
          </div>
          <div className="p-3 space-y-2">
            {CHANTIERS.map(ch => {
              const ps = PC[ch.phase];
              return (
                <div key={ch.name} className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 rounded-lg p-1.5 -m-1.5 transition-colors group"
                  onClick={() => onStartReflexion(ch.name)}>
                  <BotAvatar code={ch.bot} size="sm" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-gray-800 truncate block">{ch.name}</span>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div className={cn("h-full rounded-full transition-all duration-1000", ps.line)} style={{ width: `${ch.progress}%` }} />
                    </div>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", ps.badge)}>{ps.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projets actifs — avec tags d'état */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_PASTEL)}>
            <Target className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Projets</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 ml-auto">{PROJETS.length}</span>
          </div>
          <div className="p-3 space-y-2">
            {PROJETS.map(p => {
              const ps = PC[p.phase];
              return (
                <div key={p.name} className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 rounded-lg p-1.5 -m-1.5 transition-colors"
                  onClick={() => onStartReflexion(p.name)}>
                  <BotAvatar code={p.bot} size="sm" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-gray-800 truncate block">{p.name}</span>
                    <span className="text-xs text-gray-400">{p.chantier}</span>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", ps.badge)}>{ps.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Signaux d'attention */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_PASTEL)}>
            <AlertTriangle className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Signaux</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-50 text-red-600 ml-auto">{ALERTS.filter(a => a.severity === "critique").length} urgents</span>
          </div>
          <div className="p-3 space-y-2">
            {ALERTS.slice(0, 4).map(alert => (
              <div key={alert.id} className={cn("flex items-start gap-2 rounded-lg p-2 cursor-pointer hover:shadow-sm transition-shadow", alert.bgc)}>
                <alert.icon className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", alert.tc)} />
                <div className="flex-1 min-w-0">
                  <span className={cn("text-xs font-medium block truncate", alert.tc)}>{alert.title}</span>
                  <span className="text-xs text-gray-500">{alert.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ ROW 3 — Missions + Industrie + Décisions ═══ */}
      <div className="grid grid-cols-3 gap-3">
        {/* Missions & Tâches */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_PASTEL)}>
            <Crosshair className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Missions</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 ml-auto">{MISSIONS_DATA.length}</span>
          </div>
          <div className="p-3 space-y-2">
            {MISSIONS_DATA.map(m => {
              const ps = PC[m.phase];
              return (
                <div key={m.name} className="flex items-center gap-2.5">
                  <BotAvatar code={m.bot} size="sm" />
                  <span className="text-xs text-gray-700 flex-1 truncate">{m.name}</span>
                  {m.urgent && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Urgent" />}
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", ps.badge)}>{ps.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Industrie & Benchmarks */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_PASTEL)}>
            <LineChart className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Industrie</span>
          </div>
          <div className="p-3 space-y-2">
            {INDUSTRIE_NEWS.map((n, i) => (
              <div key={i} className="flex items-start gap-2">
                {n.hot ? <Flame className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" /> : <Newspaper className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-700 leading-snug block">{n.title}</span>
                  <span className="text-xs text-gray-400">{n.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Décisions récentes */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_PASTEL)}>
            <CheckCircle2 className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Décisions</span>
          </div>
          <div className="divide-y divide-gray-50">
            {DECISIONS_DATA.map(d => (
              <div key={d.id} className="px-4 py-2.5 flex items-center gap-2.5">
                <span className="text-xs font-mono text-gray-400 shrink-0">{d.id}</span>
                <span className="text-xs text-gray-700 flex-1 truncate">{d.title}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", d.sc)}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ ROW 4 — Activité bots + Réseau + Finances ═══ */}
      <div className="grid grid-cols-3 gap-3">
        {/* Activité récente */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_PASTEL)}>
            <Activity className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Activité bots</span>
          </div>
          <div className="divide-y divide-gray-50">
            {BOT_FEED.map((act, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-2.5">
                <BotAvatar code={act.bot} size="sm" />
                <span className="text-xs text-gray-700 flex-1 leading-snug">{act.action}</span>
                <span className="text-xs text-gray-400 shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Réseau Orbit⁹ */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_PASTEL)}>
            <Globe className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Réseau Orbit<sup>9</sup></span>
          </div>
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Cellules actives</span>
              <span className="text-sm font-bold text-gray-800">4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Contacts réseau</span>
              <span className="text-sm font-bold text-gray-800">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Opportunités matching</span>
              <span className="text-sm font-bold text-gray-800">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Expansion US</span>
              <span className="text-sm font-bold text-gray-800">45%</span>
            </div>
          </div>
        </div>

        {/* Finances */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_PASTEL)}>
            <DollarSign className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Finances</span>
          </div>
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Marge brute</span>
              <span className="text-sm font-bold text-red-500">38.1% <TrendingDown className="h-3.5 w-3.5 inline" /></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Projets actifs</span>
              <span className="text-sm font-bold text-gray-800">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Budget utilisé</span>
              <span className="text-sm font-bold text-amber-600">67%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Score VITAA</span>
              <span className="text-sm font-bold text-gray-800">72%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== PLACEHOLDERS (Reflexion/Creation/Execution/Retroaction) ==========

export function PlaceholderChat({ phase }: { phase: PhaseKey }) {
  const pc = PC[phase];
  return (
    <SBubble code="CEOB">
      <p className="text-sm text-gray-700 leading-relaxed">
        Mode <strong className={pc.text}>{pc.label}</strong> activé.{" "}
        {phase === "reflexion" ? "On analyse en profondeur avec le Brain Team." :
         phase === "creation" ? "On conceptualise les solutions et on bâtit les plans." :
         phase === "execution" ? "Le protocole COMMAND prend le relais." :
         "On mesure les résultats et tire les leçons."}
      </p>
    </SBubble>
  );
}

// ========== REFLEXION CHAT (left panel — EXACT copy from SimPhaseReflexion) ==========

export function ReflexionChat({ stage, typed, setTyped, advance, pc, context }: {
  stage: number; typed: boolean; setTyped: (v: boolean) => void; advance: () => void; pc: PhaseStyle; context: string | null;
}) {
  return (
    <>
      {/* Stage 0: reflexion-start — Animation invitation bots */}
      {stage >= 0 && (
        <>
          {stage === 0 && (
            <div className="flex items-center gap-1.5 ml-10 bg-orange-50 border border-orange-200 rounded-lg px-2 py-1">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs text-orange-600 font-medium">Mode Réflexion actif</span>
            </div>
          )}
          <SBubble code="CEOB" collapsed={stage > 0}>
            {stage === 0 ? (
              <>
                <TypewriterText text={`Mode Réflexion activé sur « ${context || "ce sujet"} ». Je mobilise 3 spécialistes pour cette mission.`} speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
                {typed && (
                  <div className="mt-3 space-y-1.5">
                    {[
                      { code: "CMOB", name: "Mathilde", role: "CMO — Analyse marché", delay: "0ms" },
                      { code: "CFOB", name: "Frank", role: "CFO — Budget et ROI", delay: "400ms" },
                      { code: "CTOB", name: "Tim", role: "CTO — Faisabilité technique", delay: "800ms" },
                    ].map(bot => (
                      <div key={bot.code} className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: bot.delay, animationFillMode: "both", animationDuration: "500ms" }}>
                        <BotAvatar code={bot.code} size="sm" />
                        <div className="flex-1">
                          <span className="text-xs font-bold text-gray-700">{bot.name}</span>
                          <span className="text-xs text-gray-500 ml-1.5">{bot.role}</span>
                        </div>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs text-emerald-600 font-medium">Rejoint</span>
                      </div>
                    ))}
                  </div>
                )}
                {typed && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {["Brainstorm", "Analyser", "Rechercher", "Challenger", "Deep Search", "5 Pourquoi"].map(b => (
                      <span key={b} className="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-2.5 py-1 rounded-full font-medium">{b}</span>
                    ))}
                  </div>
                )}
                {typed && <SBtn onClick={advance} icon={Search} label="Commencer l'analyse" pc={pc} />}
              </>
            ) : <p className="text-xs text-gray-400 italic">Analyse démarrée — 3 bots mobilisés</p>}
          </SBubble>
        </>
      )}

      {/* Stage 1: diagnostic — 3 questions de cadrage */}
      {stage >= 1 && (
        <>
          <SBubble code="CEOB" collapsed={stage > 1}>
            {stage === 1 ? (
              <>
                <TypewriterText text="Diagnostic initial — 3 questions de cadrage rapides pour orienter la réflexion:" speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
                {typed && (
                  <div className="mt-2 space-y-1.5">
                    {[
                      { q: "Q1", text: "Quel est votre coût d'acquisition actuel par lead?" },
                      { q: "Q2", text: "D'où viennent vos leads aujourd'hui (%, par canal)?" },
                      { q: "Q3", text: "Quel budget mensuel marketing total?" },
                    ].map(item => (
                      <div key={item.q} className="text-sm text-gray-700 bg-red-50 rounded-lg px-3 py-1.5 border-l-2 border-red-400">
                        <span className="font-semibold text-red-700">{item.q}.</span> {item.text}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : <p className="text-xs text-gray-400 italic">Diagnostic — 3 questions de cadrage</p>}
          </SBubble>
          {stage === 1 && typed && (
            <>
              <div className="flex justify-end">
                <div className="bg-blue-50 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
                  <p className="text-sm text-blue-900">780$/lead environ. 65% bouche-à-oreille, 20% site web, 15% salons. Budget: 12K$/mois.</p>
                </div>
              </div>
              <SBtn onClick={advance} icon={Users} label="Lancer la consultation multi-bot" pc={pc} />
            </>
          )}
        </>
      )}

      {/* Stage 2: multi-consult — animation 3 bots en parallèle */}
      {stage >= 2 && (
        <>
          {stage === 2 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-red-600 font-medium">3 bots analysent en parallèle...</span>
              </div>
              <div className="space-y-1">
                {[
                  { code: "CMOB", text: "Mathilde analyse le positionnement marché..." },
                  { code: "CFOB", text: "Frank modèle le budget et le ROI..." },
                  { code: "CTOB", text: "Tim évalue la faisabilité technique..." },
                ].map(b => (
                  <div key={b.code} className="flex items-center gap-2 text-xs text-gray-600">
                    <BotAvatar code={b.code} size="sm" />
                    <span>{b.text}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-auto" />
                  </div>
                ))}
              </div>
              <SBtn onClick={advance} icon={Eye} label="Voir les perspectives" pc={pc} />
            </div>
          )}
          {stage > 2 && (
            <div className="opacity-60">
              <p className="text-xs text-gray-400 italic ml-9">Consultation multi-bot — 3 analyses parallèles</p>
            </div>
          )}
        </>
      )}

      {/* Stage 3: perspective-cmo */}
      {stage >= 3 && (
        <SBubble code="CMOB" collapsed={stage > 3}>
          {stage === 3 ? (
            <>
              <TypewriterText text="3 insights marché: (1) Le message actuel parle de technologie, pas de ROI — les PME décrochent. (2) Le canal LinkedIn est sous-exploité — 0 contenu organique depuis 3 mois. (3) Les concurrents investissent 3x plus en content marketing. Recommandation: pivoter le messaging vers les résultats business concrets." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={DollarSign} label="Perspective CFO" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Mathilde — messaging ROI, LinkedIn, concurrence</p>}
        </SBubble>
      )}

      {/* Stage 4: perspective-cfo */}
      {stage >= 4 && (
        <SBubble code="CFOB" collapsed={stage > 4}>
          {stage === 4 ? (
            <>
              <TypewriterText text="Analyse financière: Le CAC de 780$ est 2.3x au-dessus du benchmark SaaS B2B (340$). Le ROI marketing est de 1.8x — sous le seuil de 3x recommandé. Proposition: réallouer 40% du budget salons vers digital. Économie projetée: 2,880$/mois. ROI projeté: 3.2x en 6 mois." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && (
                <div className="mt-2 bg-emerald-50 rounded-lg px-3 py-2 text-xs">
                  <div className="flex items-center gap-4">
                    <div><span className="font-bold text-emerald-700">CAC actuel:</span> 780$</div>
                    <div><span className="font-bold text-emerald-700">Cible:</span> 340$</div>
                    <div><span className="font-bold text-emerald-700">ROI projeté:</span> 3.2x</div>
                  </div>
                </div>
              )}
              {typed && <SBtn onClick={advance} icon={Brain} label="Perspective CTO" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Frank — CAC 780$ vs 340$, ROI 3.2x</p>}
        </SBubble>
      )}

      {/* Stage 5: perspective-cto */}
      {stage >= 5 && (
        <SBubble code="CTOB" collapsed={stage > 5}>
          {stage === 5 ? (
            <>
              <TypewriterText text="Faisabilité technique: (1) Le site web convertit à 1.2% — déployer un chatbot AI augmenterait à 3-4%. (2) Email nurturing inexistant — on peut automatiser 80% avec les outils déjà bâtis. (3) Risque: timeline agressive pour Q2, je recommande Q2+Q3 pour les automatisations lourdes." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">Conversion: 1.2% → 3-4%</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Risque: timeline Q2</span>
                </div>
              )}
              {typed && <SBtn onClick={advance} icon={Layers} label="Voir la synthèse" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Tim — conversion 1.2%→3-4%, nurturing auto</p>}
        </SBubble>
      )}

      {/* Stage 6: synthese */}
      {stage >= 6 && (
        <SBubble code="CEOB" collapsed={stage > 6}>
          {stage === 6 ? (
            <>
              <TypewriterText text="Synthèse des 3 perspectives: Consensus sur le pivot messaging (ROI > tech). Divergence sur la timeline — Mathilde veut Q2 agressif, Tim recommande Q2+Q3. Frank confirme le budget est là si on réalloue les salons. Je recommande le brainstorm pour générer des idées concrètes." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={Lightbulb} label="Lancer le Brainstorm" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Consensus messaging, divergence timeline</p>}
        </SBubble>
      )}

      {/* Stage 7: brainstorm — CEOB intro (auto-advance) */}
      {stage >= 7 && (
        <SBubble code="CEOB" collapsed={stage > 7}>
          {stage === 7 ? (
            <TypewriterText text="Mode Brainstorm activé. J'ai généré 6 idées SCAMPER avec l'équipe — chaque bot a contribué selon sa spécialité. Les idées sont affichées à droite, votez pour prioriser." speed={8} className="text-sm text-gray-700" onComplete={() => setTimeout(() => advance(), 1500)} />
          ) : <p className="text-xs text-gray-400 italic">6 idées SCAMPER générées</p>}
        </SBubble>
      )}

      {/* Stage 8: brainstorm — CMOB perspective créative (auto-advance) */}
      {stage >= 8 && (
        <SBubble code="CMOB" collapsed={stage > 8}>
          {stage === 8 ? (
            <TypewriterText text="Perspective créative — 3 angles disruptifs identifiés. Le programme de referral peut être gamifié pour doubler l'engagement. Le contenu LinkedIn devrait cibler les décideurs C-Level avec des études de cas ROI. Et l'idée de webinaire VITAA est une mine d'or pour le pipeline." speed={8} className="text-sm text-gray-700" onComplete={() => setTimeout(() => advance(), 1500)} />
          ) : <p className="text-xs text-gray-400 italic">3 angles créatifs — gamification, C-Level, webinaires</p>}
        </SBubble>
      )}

      {/* Stage 9: brainstorm — CTOB faisabilité (manual) */}
      {stage >= 9 && (
        <SBubble code="CTOB" collapsed={stage > 9}>
          {stage === 9 ? (
            <>
              <TypewriterText text="Faisabilité technique — 3 idées réalisables en 30 jours. Le referral gamifié nécessite juste un module de scoring (2 jours dev). Le ciblage LinkedIn utilise notre CRM existant. Les webinaires VITAA s'appuient sur LiveKit qu'on a déjà. Tout est scalable." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={Layers} label="Synthétiser les idées" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">3 idées réalisables en 30 jours — infra existante</p>}
        </SBubble>
      )}

      {/* Stage 10: synthese-brainstorm — CEOB consolidation (auto-advance) */}
      {stage >= 10 && (
        <SBubble code="CEOB" collapsed={stage > 10}>
          {stage === 10 ? (
            <TypewriterText text="Consolidation des 6 idées en 3 axes stratégiques. J'ai fusionné le referral gamifié de Mathilde avec l'analyse ROI de Frank, et le ciblage C-Level avec la data CRM de Tim. Le résultat est un plan intégré à droite." speed={8} className="text-sm text-gray-700" onComplete={() => setTimeout(() => advance(), 1500)} />
          ) : <p className="text-xs text-gray-400 italic">6 idées consolidées en 3 axes</p>}
        </SBubble>
      )}

      {/* Stage 11: synthese-brainstorm — CFOB validation budget (manual) */}
      {stage >= 11 && (
        <SBubble code="CFOB" collapsed={stage > 11}>
          {stage === 11 ? (
            <>
              <TypewriterText text="Validation financière — l'axe 1 (Referral) a le meilleur ROI à 4.2x pour un budget de 1,200$/mois. L'axe 2 (Content LinkedIn) est à 2.8x mais crée un actif long terme. L'axe 3 (Webinaires) est le plus risqué avec le plus haut potentiel. Je recommande de prioriser axes 1+2." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={Search} label="Creuser avec les 5 Pourquoi" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Validation budget — axes 1+2 prioritaires, ROI 4.2x</p>}
        </SBubble>
      )}

      {/* Stage 12: cinq-pourquoi — CEOB activation (auto-advance) */}
      {stage >= 12 && (
        <SBubble code="CEOB" collapsed={stage > 12}>
          {stage === 12 ? (
            <TypewriterText text="Méthode 5 Pourquoi activée — on creuse la cause racine de la sous-performance marketing. Pourquoi le taux de conversion stagne à 2.1%? L'arbre de causes se construit à droite." speed={8} className="text-sm text-gray-700" onComplete={() => setTimeout(() => advance(), 1500)} />
          ) : <p className="text-xs text-gray-400 italic">5 Pourquoi — analyse cause racine lancée</p>}
        </SBubble>
      )}

      {/* Stage 13: cinq-pourquoi — CTOB blocage technique (auto-advance) */}
      {stage >= 13 && (
        <SBubble code="CTOB" collapsed={stage > 13}>
          {stage === 13 ? (
            <TypewriterText text="Pourquoi 3 révèle le vrai blocage : l'infrastructure legacy du site. Temps de chargement à 4.2s (vs 1.5s industrie), mobile score 38/100, et le SEO technique bloque 60% du trafic organique. C'est un problème de fondation, pas de messaging." speed={8} className="text-sm text-gray-700" onComplete={() => setTimeout(() => advance(), 1500)} />
          ) : <p className="text-xs text-gray-400 italic">Pourquoi 3 — blocage infra legacy, mobile 38/100</p>}
        </SBubble>
      )}

      {/* Stage 14: cinq-pourquoi — CEOB cause racine (manual) */}
      {stage >= 14 && (
        <SBubble code="CEOB" collapsed={stage > 14}>
          {stage === 14 ? (
            <>
              <TypewriterText text="Cause racine identifiée : le messaging parle technologie au lieu de résultats, ET l'infra web ne convertit pas le trafic existant. 2 leviers d'action : refonte messaging ROI + optimisation technique rapide. On lance le Deep Search pour valider avec des données externes." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={Globe} label="Lancer le Deep Search" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Cause racine — messaging + infra, 2 leviers</p>}
        </SBubble>
      )}

      {/* Stage 15: deep-search — CEOB lancement (auto-advance) */}
      {stage >= 15 && (
        <SBubble code="CEOB" collapsed={stage > 15}>
          {stage === 15 ? (
            <TypewriterText text="Deep Search lancé sur 4 sources : benchmarks industrie, études de cas similaires, données marché et tendances sectorielles. Les résultats s'affichent à droite avec des scores de pertinence." speed={8} className="text-sm text-gray-700" onComplete={() => setTimeout(() => advance(), 1500)} />
          ) : <p className="text-xs text-gray-400 italic">Deep Search — 4 sources analysées</p>}
        </SBubble>
      )}

      {/* Stage 16: deep-search — CMOB benchmarks (manual) */}
      {stage >= 16 && (
        <SBubble code="CMOB" collapsed={stage > 16}>
          {stage === 16 ? (
            <>
              <TypewriterText text="Les benchmarks montrent un écart de 3x vs industrie sur le taux de conversion. Les entreprises B2B qui utilisent des études de cas ROI convertissent à 6.4% vs notre 2.1%. La source McKinsey confirme que 73% des décideurs préfèrent du contenu basé sur les résultats." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={Layers} label="Synthétiser les recherches" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Benchmarks — écart 3x conversion, 73% veulent du ROI</p>}
        </SBubble>
      )}

      {/* Stage 17: synthese-recherche — CEOB synthèse (auto-advance) */}
      {stage >= 17 && (
        <SBubble code="CEOB" collapsed={stage > 17}>
          {stage === 17 ? (
            <TypewriterText text="Synthèse croisée des 4 sources avec la cause racine des 5 Pourquoi et les axes du brainstorm. 3 constats validés par les données, 2 hypothèses à vérifier terrain, 1 risque de cannibalisation identifié." speed={8} className="text-sm text-gray-700" onComplete={() => setTimeout(() => advance(), 1500)} />
          ) : <p className="text-xs text-gray-400 italic">Synthèse — 3 constats, 2 hypothèses, 1 risque</p>}
        </SBubble>
      )}

      {/* Stage 18: synthese-recherche — CFOB risques (manual) */}
      {stage >= 18 && (
        <SBubble code="CFOB" collapsed={stage > 18}>
          {stage === 18 ? (
            <>
              <TypewriterText text="3 risques identifiés, 2 mitigables. Le risque de cannibalisation entre referral et contenu LinkedIn est gérable avec un calendrier décalé. Le budget total reste dans l'enveloppe si on phase les investissements. Seul le risque de capacité interne nécessite une décision." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={AlertTriangle} label="Challenger les conclusions" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">3 risques — 2 mitigables, 1 décision requise</p>}
        </SBubble>
      )}

      {/* Stage 19: challenge — CFOB attaque (auto-advance) */}
      {stage >= 19 && (
        <>
          {stage === 19 && (
            <div className="flex justify-end">
              <div className="bg-blue-50 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
                <p className="text-sm text-blue-900">Je challenge le budget: 8K$/mois ça semble trop agressif vu notre taille.</p>
              </div>
            </div>
          )}
          <SBubble code="CFOB" collapsed={stage > 19}>
            {stage === 19 ? (
              <TypewriterText text="Challenge accepté. Le programme referral seul coûte 1,200$/mois avec un ROI de 4.2x. Le plan complet à 8K$ inclut des postes non essentiels. Si on coupe le paid ads et qu'on priorise referral + contenu organique, on tombe à 3,800$/mois avec un ROI de 3.6x." speed={8} className="text-sm text-gray-700" onComplete={() => setTimeout(() => advance(), 1500)} />
            ) : <p className="text-xs text-gray-400 italic">Challenge budget — plan complet trop agressif</p>}
          </SBubble>
        </>
      )}

      {/* Stage 20: challenge — CTOB défense (auto-advance) */}
      {stage >= 20 && (
        <SBubble code="CTOB" collapsed={stage > 20}>
          {stage === 20 ? (
            <TypewriterText text="Je défends : l'infra est scalable, le coût marginal est de 0.12$/user après le setup initial. Le referral gamifié utilise notre stack existante — pas de nouveau SaaS. Et le module de scoring prend 2 jours de dev, pas 2 semaines. Le ROI technique est immédiat." speed={8} className="text-sm text-gray-700" onComplete={() => setTimeout(() => advance(), 1500)} />
          ) : <p className="text-xs text-gray-400 italic">Défense — infra scalable, coût marginal 0.12$/user</p>}
        </SBubble>
      )}

      {/* Stage 21: challenge — CEOB verdict (manual) */}
      {stage >= 21 && (
        <SBubble code="CEOB" collapsed={stage > 21}>
          {stage === 21 ? (
            <>
              <TypewriterText text="Verdict : 2 propositions validées (referral + LinkedIn), 1 à retravailler (webinaires — budget à réduire de 40%). Plan révisé : 3,800$/mois au lieu de 8K$, ROI combiné 3.6x. Le challenge de Frank a permis d'économiser 4,200$/mois." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && (
                <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs">
                  <div className="font-semibold text-emerald-700 mb-1">Plan révisé (conservateur):</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>Referral: 1,200$/mois → ROI 4.2x</div>
                    <div>LinkedIn: 2,600$/mois → ROI 2.8x</div>
                    <div className="font-bold text-emerald-800 col-span-2">Total: 3,800$/mois → ROI combiné 3.6x</div>
                  </div>
                </div>
              )}
              {typed && <SBtn onClick={advance} icon={FileText} label="Générer le pré-rapport" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Verdict — plan 3,800$/mois, ROI 3.6x</p>}
        </SBubble>
      )}

      {/* Stage 22: pre-rapport — CEOB compilation (auto-advance) */}
      {stage >= 22 && (
        <SBubble code="CEOB" collapsed={stage > 22}>
          {stage === 22 ? (
            <TypewriterText text="Le pré-rapport compile les 7 sections précédentes. Table des matières sur le côté à droite, contenu détaillé pour chaque section. Diagnostic, brainstorm, analyses, challenge — tout est documenté et traçable." speed={8} className="text-sm text-gray-700" onComplete={() => setTimeout(() => advance(), 1500)} />
          ) : <p className="text-xs text-gray-400 italic">Pré-rapport — compilation 7 sections</p>}
        </SBubble>
      )}

      {/* Stage 23: pre-rapport — CEOB livrables (auto-advance) */}
      {stage >= 23 && (
        <SBubble code="CEOB" collapsed={stage > 23}>
          {stage === 23 ? (
            <TypewriterText text="3 livrables identifiés pour la phase Conception : 1) Plan marketing intégré referral + LinkedIn avec calendrier Q2, 2) Cahier des charges technique pour l'optimisation web, 3) Budget prévisionnel 6 mois avec jalons de validation ROI." speed={8} className="text-sm text-gray-700" onComplete={() => setTimeout(() => advance(), 1500)} />
          ) : <p className="text-xs text-gray-400 italic">3 livrables — plan marketing, cahier technique, budget</p>}
        </SBubble>
      )}

      {/* Stage 24: pre-rapport — CEOB phase complete + options (manual) */}
      {stage >= 24 && (
        <SBubble code="CEOB" collapsed={stage > 24}>
          {stage === 24 ? (
            <>
              <TypewriterText text="Phase Réflexion complète. Les 8 sections sont sauvegardées. 3 options : cristalliser en document formel, passer en Atelier pour créer le plan d'action concret, ou continuer l'analyse." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && (
                <div className="mt-2 space-y-1.5">
                  {[
                    { label: "Cristalliser en document", desc: "Génère un PDF avec les 8 sections", icon: FileText },
                    { label: "Passer en Atelier", desc: "Créer le plan d'action concret", icon: Zap },
                    { label: "Continuer l'analyse", desc: "SWOT, scénarios, benchmarks", icon: Search },
                  ].map(opt => (
                    <button key={opt.label} onClick={advance}
                      className={cn("w-full flex items-center gap-2 border rounded-lg px-3 py-2 text-left cursor-pointer transition-colors", pc.bg, pc.border, pc.btnHover)}
                    >
                      <opt.icon className={cn("h-3.5 w-3.5 shrink-0", pc.text)} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-800">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : <p className="text-xs text-gray-400 italic">Phase complète — 3 options finales</p>}
        </SBubble>
      )}

      {/* Stage 25: transition — passage vers Conception */}
      {stage >= 25 && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-300 rounded-xl px-4 py-3">
          <TypewriterText text="Prêt pour Créer! Les 8 sections sont sauvegardées. On va maintenant cristalliser le plan d'action concret à partir de tout ce qu'on a analysé." speed={10} className="text-sm text-orange-800 font-medium" onComplete={() => setTyped(true)} />
          {typed && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-orange-500" />
              <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-xs text-orange-700 font-semibold ml-1">Réflexion → Conception</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ========== REFLEXION MAGAZINE SUB-COMPONENTS (EXACT copy from SimPhaseReflexion — stacked) ==========

function MagDiagnostic({ stage = 99 }: { stage?: number }) {
  /* Pattern progressif: chaque Mag* peut recevoir `stage` en prop pour rendre son contenu progressif.
     Ce pattern sera répliqué pour PhaseConception, PhaseExecution, PhaseRetroaction. */
  const REVEAL_STAGE: Record<string, number> = { "Présence web": 3, "Conversion": 3, "SEO technique": 5, "Mobile": 5, "Vitesse": 5, "Accessibilité": 6 };
  const [chantierLoading, setChantierLoading] = useState<string | null>(null);
  const [chantierDone, setChantierDone] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      {/* Score de maturité global — EN PREMIER, pattern V3 card */}
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden hover:shadow-md hover:border-blue-200 transition-all">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Gauge className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Score de maturite global</span>
          <span className="text-xs font-bold bg-gray-900 text-white px-2.5 py-0.5 rounded-full ml-auto">{stage >= 6 ? "42%" : "..."}</span>
        </div>
        <div className="px-4 py-3 space-y-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: stage >= 6 ? "42%" : "0%" }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-400">Axes critiques</p>
              <p className="text-xs font-bold text-orange-600">{stage >= 6 ? "3" : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Bots mobilises</p>
              <p className="text-xs font-bold text-blue-600">{stage >= 3 ? "4" : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Actions identifiees</p>
              <p className="text-xs font-bold text-emerald-600">{stage >= 6 ? "18" : "—"}</p>
            </div>
          </div>
          {stage >= 6 && (
          <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
            <span className="text-xs text-gray-500">Recommandation Paco:</span>
            <span className="text-xs text-orange-700 font-medium">Prioriser Palettisation (score 15%) puis IoT (8%)</span>
          </div>
          )}
        </div>
      </div>

      {/* Diagnostic — grille axes */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {SPR_DIAG_ITEMS.map(d => {
            const revealAt = REVEAL_STAGE[d.label] ?? 6;
            const revealed = stage >= revealAt;
            if (stage < 2) return (
              <div key={d.label} className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 space-y-2 animate-pulse">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-2 w-full bg-gray-200 rounded" />
                <div className="h-2 w-3/4 bg-gray-200 rounded" />
              </div>
            );
            if (!revealed) return (
              <div key={d.label} className="rounded-xl border-2 border-gray-200 bg-gray-50/80 overflow-hidden">
                <div className="px-3 py-2 bg-gray-100/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">{d.label}</span>
                  <span className="text-xs bg-gray-200 text-gray-400 px-2 py-0.5 rounded-full">—</span>
                </div>
                <div className="px-3 py-3 flex items-center gap-2">
                  <div className="h-3 w-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-gray-400">Analyse en cours...</span>
                </div>
              </div>
            );
            return (
            <div key={d.label}
              className={cn(
                "rounded-xl overflow-hidden border-2 shadow-sm transition-all hover:shadow-md",
                d.score < 40 ? "border-orange-400 bg-gradient-to-b from-orange-50 to-white" : d.score < 60 ? "border-amber-300 bg-gradient-to-b from-amber-50 to-white" : "border-emerald-300 bg-gradient-to-b from-emerald-50 to-white"
              )}
            >
              {/* Header avec score proéminent */}
              <div className={cn("px-3 py-2 flex items-center justify-between",
                d.score < 40 ? "bg-orange-100/60" : d.score < 60 ? "bg-amber-100/60" : "bg-emerald-100/60"
              )}>
                <span className="text-xs text-gray-900 font-bold">{d.label}</span>
                <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                  d.score < 40 ? "bg-orange-600 text-white" : d.score < 60 ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                )}>
                  {d.score}%
                </div>
              </div>
              <div className="px-3 py-2.5 space-y-2">
                <p className="text-[11px] text-gray-700 font-medium">{d.what}</p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", d.score >= 70 ? "bg-emerald-500" : d.score >= 50 ? "bg-amber-500" : "bg-orange-500")} style={{ width: `${d.score}%` }} />
                </div>
                <p className="text-[10px] text-gray-600 font-medium">{d.detail}</p>
                <div className="flex items-center gap-1.5">
                  <BotAvatar code={d.bot} size="sm" />
                  <span className="text-[10px] text-gray-500 font-medium">{BOT_COLORS[d.bot]?.name}</span>
                  <button className={cn("text-[10px] px-3 py-1.5 rounded-full font-bold cursor-pointer ml-auto shadow-sm transition-all",
                    d.score < 40 ? "bg-orange-600 text-white hover:bg-orange-700" : d.score < 60 ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-emerald-500 text-white hover:bg-emerald-600"
                  )}>{d.action}</button>
                </div>

                {/* Détails avec actions */}
                <div className="mt-1 pt-2 border-t border-gray-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                      d.score < 40 ? "bg-orange-100 text-orange-700" : d.score < 60 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    )}>{d.expanded.gap}</span>
                    <span className="text-[10px] text-gray-400">Effort: {d.expanded.effort}</span>
                  </div>
                  <div className="space-y-1">
                    {d.expanded.actions.map((a: string, j: number) => (
                      <div key={j} className="flex items-center gap-1.5 text-[10px] text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-2 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[10px] text-emerald-700 font-bold">Impact: {d.expanded.impact}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <button onClick={() => { if (!chantierDone) { setChantierLoading(d.label); setTimeout(() => { setChantierLoading(null); setChantierDone(d.label); }, 1500); } }}
                      className={cn("text-[10px] px-2.5 py-1 rounded-full font-medium cursor-pointer flex items-center gap-1 transition-colors", chantierDone === d.label ? "bg-emerald-600 text-white" : "bg-orange-600 text-white hover:bg-orange-700")}
                    >{chantierLoading === d.label ? <><Loader2 className="h-3 w-3 animate-spin" /> Création...</> : chantierDone === d.label ? <><CheckCircle2 className="h-3 w-3" /> Chantier créé</> : <>Lancer un chantier</>}</button>
                    <button className="text-[10px] bg-white border border-orange-200 text-orange-700 px-2.5 py-1 rounded-full font-medium cursor-pointer hover:bg-orange-50">Épingler</button>
                    <button className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full font-medium cursor-pointer hover:bg-gray-50">Consulter un bot</button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

function MagBrainstorm() {
  const [activeStep, setActiveStep] = useState(0);
  const [expandedIdea, setExpandedIdea] = useState<number | null>(null);
  const [brainstormVotes, setBrainstormVotes] = useState<Record<number, "up" | "down" | null>>({});
  const [developedIdea, setDevelopedIdea] = useState<number | null>(null);

  // Auto-avance progressive — les bots travaillent en live
  useEffect(() => {
    if (activeStep < 4) {
      const timer = setTimeout(() => setActiveStep(prev => prev + 1), 3000);
      return () => clearTimeout(timer);
    }
  }, [activeStep]);

  const STEPS = [
    { label: "Cadrage", desc: "Definir le probleme et les contraintes avant de generer des idees." },
    { label: "Vague 1", desc: "Generation libre — chaque bot propose des idees sans filtre, quantite > qualite." },
    { label: "SCAMPER", desc: "Methode creative: Substituer, Combiner, Adapter, Modifier, Put to other use, Eliminer, Reorganiser." },
    { label: "Clusters", desc: "Regrouper les idees par theme, identifier les convergences entre bots." },
    { label: "Synthese", desc: "Fusionner les meilleures idees en propositions actionnables et budgetees." },
  ];

  const CLUSTERS = [
    { theme: "Acquisition digitale", idees: ["Content LinkedIn", "Chatbot AI site web", "Mini-serie YouTube"], bot: "CMOB", score: 87, color: "border-pink-200 bg-pink-50" },
    { theme: "Referral & reseau", idees: ["Programme referral", "Ambassadeurs clients", "Partenariat distributeurs"], bot: "CFOB", score: 92, color: "border-emerald-200 bg-emerald-50" },
    { theme: "Evenements repenses", idees: ["Demo AI live mensuelle", "Salon virtuel Q3", "Webinaires VITAA"], bot: "COOB", score: 78, color: "border-orange-200 bg-orange-50" },
  ];

  const SYNTHESIS = [
    { title: "Axe 1: Referral + Ambassadeurs", desc: "Mobiliser les clients satisfaits comme canal #1 d'acquisition", budget: "1,200$/mois", roi: "4.2x", timeline: "Semaine 1-2", priority: "QUICK WIN", color: "bg-emerald-50 border-emerald-200", champion: "CFOB" },
    { title: "Axe 2: Content LinkedIn + YouTube", desc: "Positionner l'expertise sectorielle pour attirer les decideurs", budget: "2,600$/mois", roi: "2.8x", timeline: "Mois 1-3", priority: "MOYEN TERME", color: "bg-pink-50 border-pink-200", champion: "CMOB" },
    { title: "Axe 3: Demo AI live mensuelle", desc: "Differencier par la preuve tangible avec demos interactives", budget: "800$/mois", roi: "3.1x", timeline: "Mois 2", priority: "DIFFERENCIANT", color: "bg-violet-50 border-violet-200", champion: "CTOB" },
  ];

  return (
    <div className="space-y-4">
      {/* Titre retiré — déjà affiché dans le hero compact */}

      {/* Pipeline etapes SCAMPER */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-1 shrink-0">
            {i > 0 && <div className={cn("w-4 h-0.5", i <= activeStep ? "bg-orange-400" : "bg-gray-200")} />}
            <button
              onClick={() => setActiveStep(i)}
              className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all",
                i < activeStep ? "bg-orange-100 text-orange-700" : i === activeStep ? "bg-orange-500 text-white shadow-sm" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              )}
            >
              {i < activeStep && <CheckCircle2 className="h-3.5 w-3.5" />}
              {i === activeStep && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              {step.label}
            </button>
          </div>
        ))}
      </div>

      {/* Step description */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2">
        <BookOpen className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <p className="text-xs text-gray-500">{STEPS[activeStep].desc}</p>
      </div>

      {/* STEP 0-1: Cadrage + Vague 1 */}
      {activeStep <= 1 && (
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> {activeStep === 0 ? "Cadrage — Probleme a resoudre" : "Vague 1 — 6 idees brutes (zero filtre)"}
          </p>
          {activeStep === 0 ? (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-xs font-bold text-orange-800 mb-2">Probleme: Comment augmenter les leads qualifies de 40% en Q2?</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>Contrainte budget: max 8K$/mois</p>
                <p>Contrainte temps: resultats mesurables avant fin Q2</p>
                <p>Equipe: 3 bots mobilises (Mathilde, Frank, Tim)</p>
              </div>
              <button onClick={() => setActiveStep(1)} className="mt-3 text-xs bg-orange-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-700">Lancer la generation d'idees</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {SPR_BRAINSTORM_IDEAS.map(idea => (
                <div key={idea.id}
                  onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                  className={cn("border rounded-lg px-3 py-2.5 cursor-pointer transition-all", idea.color,
                    expandedIdea === idea.id ? "ring-1 ring-orange-300 shadow-sm" : "hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <BotAvatar code={idea.bot} size="sm" />
                    <span className="text-xs font-medium text-gray-700">{BOT_COLORS[idea.bot]?.name}</span>
                    <span className="text-xs bg-white/60 text-gray-600 px-1.5 py-0.5 rounded ml-auto">{idea.tag}</span>
                  </div>
                  <p className="text-xs text-gray-800 mb-2">{idea.text}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setBrainstormVotes(prev => ({ ...prev, [idea.id]: prev[idea.id] === "up" ? null : "up" })); }}
                      className={cn("p-0.5 rounded cursor-pointer transition-colors",
                        brainstormVotes[idea.id] === "up" ? "text-green-600 bg-green-100" : "text-gray-400 hover:text-green-500"
                      )}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setBrainstormVotes(prev => ({ ...prev, [idea.id]: prev[idea.id] === "down" ? null : "down" })); }}
                      className={cn("p-0.5 rounded cursor-pointer transition-colors",
                        brainstormVotes[idea.id] === "down" ? "text-red-600 bg-red-100" : "text-gray-400 hover:text-red-500"
                      )}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs text-gray-400 ml-auto">
                      {brainstormVotes[idea.id] === "up" ? "+1" : brainstormVotes[idea.id] === "down" ? "-1" : ""}
                    </span>
                  </div>
                  {expandedIdea === idea.id && (
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                      <p className="text-xs text-gray-600">Impact estime: eleve | Effort: moyen | Delai: 2-4 semaines</p>
                      <div className="flex gap-1">
                        <button onClick={() => setDevelopedIdea(developedIdea === idea.id ? null : idea.id)}
                          className={cn("text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer flex items-center gap-1 transition-colors", developedIdea === idea.id ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}
                        >{developedIdea === idea.id ? <><CheckCircle2 className="h-3 w-3" /> Développé</> : <>Developper</>}</button>
                        <button className="text-xs bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-medium cursor-pointer hover:bg-gray-50">Combiner</button>
                        <button className="text-xs bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-medium cursor-pointer hover:bg-gray-50">Challenger</button>
                      </div>
                      {developedIdea === idea.id && (
                        <div className="mt-1.5 space-y-1 pl-2 border-l-2 border-orange-200 animate-in fade-in slide-in-from-top-1" style={{ animationDuration: "300ms" }}>
                          <p className="text-xs text-gray-600">1. Définir les personas cibles et leurs pain points spécifiques</p>
                          <p className="text-xs text-gray-600">2. Créer un prototype testable en 2 semaines (MVP lean)</p>
                          <p className="text-xs text-gray-600">3. Mesurer le taux de conversion sur un échantillon de 100 leads</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: SCAMPER Challenge */}
      {activeStep === 2 && (
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-orange-500" /> SCAMPER Challenge — COMBINER + ADAPTER + SUBSTITUER
          </p>
          <p className="text-xs text-gray-500 mb-2">Les bots appliquent les 7 leviers SCAMPER aux idees de la Vague 1 pour creer des combinaisons innovantes.</p>
          <div className="space-y-1.5">
            {[
              { letter: "C", method: "Combiner", text: "Referral + LinkedIn: programme ambassadeur avec contenu co-cree par les clients satisfaits", bot: "CMOB", votes: 4, color: "bg-pink-50 border-pink-200" },
              { letter: "A", method: "Adapter", text: "Adapter webinaire VITAA en mini-serie YouTube (5 episodes, 10min) — format snackable", bot: "CEOB", votes: 3, color: "bg-blue-50 border-blue-200" },
              { letter: "S", method: "Substituer", text: "Remplacer les salons physiques par une demo AI live mensuelle — cout 10x moins cher", bot: "CTOB", votes: 5, color: "bg-violet-50 border-violet-200" },
              { letter: "M", method: "Modifier", text: "Modifier le messaging: au lieu de 'AI CEO Bot', dire '40% plus de leads en 90 jours'", bot: "CMOB", votes: 6, color: "bg-amber-50 border-amber-200" },
              { letter: "E", method: "Eliminer", text: "Eliminer les salons sans ROI mesurable — economie de 4,800$/trimestre", bot: "CFOB", votes: 4, color: "bg-emerald-50 border-emerald-200" },
            ].map((note, i) => (
              <div key={i} className={cn("rounded-lg p-2.5 border cursor-pointer hover:shadow-sm transition-all", note.color)}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded bg-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{note.letter}</span>
                  <span className="text-xs font-bold text-orange-700">{note.method}</span>
                  <BotAvatar code={note.bot} size="sm" />
                  <span className="text-xs font-medium text-gray-500">{BOT_COLORS[note.bot]?.name}</span>
                  <span className="flex items-center gap-0.5 text-xs text-amber-600 ml-auto">
                    <Star className="h-3.5 w-3.5" /> {note.votes}
                  </span>
                </div>
                <p className="text-xs text-gray-800">{note.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Clusters */}
      {activeStep === 3 && (
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-blue-500" /> Clusters — 3 themes identifies
          </p>
          <p className="text-xs text-gray-500 mb-2">Les idees convergent autour de 3 axes strategiques. Chaque cluster regroupe les propositions complementaires.</p>
          <div className="space-y-2">
            {CLUSTERS.map((cluster, i) => (
              <div key={i} className={cn("rounded-xl p-3 border", cluster.color)}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">{i + 1}</span>
                  <span className="text-xs font-bold text-gray-800">{cluster.theme}</span>
                  <BotAvatar code={cluster.bot} size="sm" />
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${cluster.score}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{cluster.score}%</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {cluster.idees.map((idee, j) => (
                    <span key={j} className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{idee}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center gap-2 mt-2">
            <Users className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-blue-700">3 bots convergent sur l'acquisition digitale — consensus fort</span>
          </div>
        </div>
      )}

      {/* STEP 4: Synthese */}
      {activeStep === 4 && (
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Synthese — 3 axes actionnables
          </p>
          <p className="text-xs text-gray-500 mb-2">Les clusters sont consolides en axes strategiques budgetes et planifies. Pret a passer en phase Creer.</p>
          <div className="space-y-2">
            {SYNTHESIS.map((axe, i) => (
              <div key={i} className={cn("rounded-xl border p-3", axe.color)}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-800">{axe.title}</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold ml-auto">{axe.priority}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{axe.desc}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Budget</p>
                    <p className="text-xs font-bold text-gray-800">{axe.budget}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">ROI</p>
                    <p className="text-xs font-bold text-emerald-700">{axe.roi}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Timeline</p>
                    <p className="text-xs font-bold text-gray-800">{axe.timeline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <BotAvatar code={axe.champion} size="sm" />
                  <span className="text-xs text-gray-500">Champion: {BOT_COLORS[axe.champion]?.name}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2 mt-2">
            <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-emerald-700">Budget total: 4,600$/mois — ROI combine: 3.4x</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              {["CEOB", "CMOB", "CFOB", "CTOB"].map(code => (
                <BotAvatar key={code} code={code} size="sm" />
              ))}
            </div>
            <span className="text-xs font-bold text-emerald-700">Consensus: 4 bots GO / 0 NO-GO</span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button className="text-xs bg-orange-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-700">Ajouter une idee</button>
        <button className="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-100">Combiner 2 idees</button>
        <button className="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-100">Prioriser par votes</button>
        <button className="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-100">Challenger une idee</button>
        <button className="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-100">Epingler au rapport</button>
      </div>
    </div>
  );
}

function MagSyntheseBrainstorm() {
  const [revealCount, setRevealCount] = useState(0);
  useEffect(() => {
    if (revealCount < 5) {
      const timer = setTimeout(() => setRevealCount(prev => prev + 1), 1200);
      return () => clearTimeout(timer);
    }
  }, [revealCount]);
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg px-4 py-3">
        <p className="text-sm font-semibold text-gray-800">3 bots, 1 vision convergente</p>
        <p className="text-xs text-gray-600 mt-0.5">Les meilleures idees du brainstorm fusionnees en un plan d'action unifie.</p>
      </div>

      <div className={cn("bg-white border-2 border-orange-200 rounded-xl overflow-hidden transition-all duration-700", revealCount >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
        <div className="bg-orange-50 px-4 py-2 border-b border-orange-200 flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-orange-600" />
          <span className="text-xs font-bold text-orange-800">Plan integre — Referral + Content LinkedIn</span>
        </div>
        <div className="p-4 space-y-3">
          {[
            { title: "Programme Referral", source: "Frank (CFO)", detail: "1,200$/mois, ROI 4.2x, lancement Q2 semaine 1", color: "border-emerald-300 bg-emerald-50" },
            { title: "Content LinkedIn Educatif", source: "Mathilde (CMO)", detail: "Serie 12 posts, 1 webinaire/mois, budget 2,600$/mois", color: "border-pink-300 bg-pink-50" },
            { title: "Chatbot AI site web", source: "Tim (CTO)", detail: "Deploiement semaine 3, conversion cible 3-4%", color: "border-violet-300 bg-violet-50" },
          ].map((item, i) => (
            <div key={i} className={cn("border rounded-lg p-3", item.color)}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-800">{item.title}</span>
                <span className="text-xs bg-white/70 text-gray-600 px-1.5 py-0.5 rounded ml-auto">{item.source}</span>
              </div>
              <p className="text-xs text-gray-700">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={cn("grid grid-cols-2 gap-3 transition-all duration-700", revealCount >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">AVANT bonification</p>
          <p className="text-lg font-extrabold text-gray-400">6 idees</p>
          <p className="text-xs text-gray-400">separees, non priorisees</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
          <p className="text-xs text-orange-600 mb-1">APRES bonification</p>
          <p className="text-lg font-extrabold text-orange-700">3 axes</p>
          <p className="text-xs text-orange-600">integres, budgetes, planifies</p>
        </div>
      </div>

      {/* Timeline mini et risques */}
      <div className={cn("bg-white border border-gray-200 rounded-lg p-3 transition-all duration-700", revealCount >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Timeline de deploiement</p>
        <div className="flex items-center gap-1">
          {[
            { label: "Sem 1-2", axe: "Referral", color: "bg-emerald-500" },
            { label: "Sem 3-4", axe: "Chatbot", color: "bg-violet-500" },
            { label: "Sem 5-8", axe: "LinkedIn", color: "bg-pink-500" },
            { label: "Sem 9-12", axe: "Mesure", color: "bg-blue-500" },
          ].map((t, i) => (
            <div key={i} className="flex-1">
              <div className={cn("h-2 rounded-full", t.color)} />
              <p className="text-[10px] text-gray-500 mt-0.5">{t.label}</p>
              <p className="text-[10px] text-gray-700 font-medium">{t.axe}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risques identifies */}
      <div className={cn("bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 transition-all duration-700", revealCount >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
        <p className="text-xs font-bold text-amber-700 mb-1">Risques identifies (2)</p>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-gray-600">Timeline agressive si equipe surchargee</span>
            <span className="text-[10px] bg-amber-200 text-amber-800 px-1 py-0.5 rounded ml-auto">Moyen</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-gray-600">Chatbot AI: conversion non validee en niche manufacturing</span>
            <span className="text-[10px] bg-amber-200 text-amber-800 px-1 py-0.5 rounded ml-auto">Faible</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="text-xs bg-orange-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-700">Rechallenger le plan</button>
        <button className="text-xs bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-50">Re-synthetiser</button>
        <button className="text-xs bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-50">Ajouter un axe</button>
        <button className="text-xs bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-50">Affiner les budgets</button>
        <button className="text-xs bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-50">Evaluer les risques</button>
      </div>
    </div>
  );
}


function MagCinqPourquoi() {
  const [revealedLevel, setRevealedLevel] = useState(0);
  const [showDebate, setShowDebate] = useState<number | null>(null);

  const questions = [
    {
      q: "les leads ne convertissent pas",
      a: "Le message ne resonne pas avec les PME.",
      reflexion: "Est-ce que le probleme est le canal ou le message? Mathilde a valide: c'est le message.",
      bot: "CMOB",
      debate: {
        challenger: "CFOB",
        challengeText: "Et si c'etait le prix plutot que le message? Nos tarifs sont 20% au-dessus du marche.",
        defense: "CMOB",
        defenseText: "Non \u2014 les clients qui signent ne mentionnent jamais le prix. C'est le messaging: ils ne comprennent pas la valeur avant la demo.",
        verdict: "Mathilde a raison. Le prix n'est pas le bloqueur \u2014 c'est la comprehension de la valeur.",
      },
    },
    {
      q: "le message ne resonne pas",
      a: "On parle de features AI, pas de resultats business.",
      reflexion: "Frank confirme: les clients actuels mentionnent toujours le ROI comme facteur #1 de decision.",
      bot: "CFOB",
      debate: {
        challenger: "CTOB",
        challengeText: "Les features sont quand meme importantes \u2014 c'est ce qui nous differencie techniquement.",
        defense: "CFOB",
        defenseText: "Tim, les PME n'achetent pas de la tech. Elles achetent du temps gagne et de l'argent economise. Le ROI, pas les specs.",
        verdict: "Consensus: communiquer en resultats business, pas en features techniques.",
      },
    },
    {
      q: "parle-t-on de features",
      a: "Le contenu est ecrit par des devs, pas par le marketing.",
      reflexion: "Tim admet: l'equipe tech produit du contenu sans brief marketing. Aucun processus editorial.",
      bot: "CTOB",
      debate: {
        challenger: "CMOB",
        challengeText: "On pourrait former les devs a ecrire differemment plutot que tout centraliser au marketing.",
        defense: "CTOB",
        defenseText: "Realiste? Non. Les devs ecrivent du code, pas du copywriting. Il faut un processus: dev fournit les facts, marketing ecrit le message.",
        verdict: "Processus editorial necessaire: separation faits techniques / messaging client.",
      },
    },
    {
      q: "les devs ecrivent le contenu",
      a: "Pas de ressource marketing dediee, l'equipe est trop petite.",
      reflexion: "CarlOS note: le budget marketing existe (12K$/mois) mais est mal alloue \u2014 65% en salons.",
      bot: "CEOB",
      debate: {
        challenger: "CFOB",
        challengeText: "Les salons generent quand meme 35% de nos leads actuels. On ne peut pas tout couper.",
        defense: "CEOB",
        defenseText: "Pas tout couper \u2014 reallouer. 65% en salons = 7,800$/mois pour 35% des leads. Si on met la moitie en digital, on double potentiellement pour moins cher.",
        verdict: "Reallocation progressive: garder les 2 meilleurs salons, basculer le reste en digital.",
      },
    },
  ];

  useEffect(() => {
    if (revealedLevel < questions.length + 1) {
      const timer = setTimeout(() => setRevealedLevel(prev => prev + 1), 1200);
      return () => clearTimeout(timer);
    }
  }, [revealedLevel, questions.length]);

  return (
    <div className="space-y-4">
      {/* Titre retiré — déjà affiché dans le hero compact */}

      {/* Progress indicator — pleine largeur */}
      <div className="flex items-center gap-0">
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n} className={cn("flex items-center", n > 1 ? "flex-1" : "")}>
            {n > 1 && <div className={cn("flex-1 h-0.5 transition-all duration-500", n <= revealedLevel ? "bg-orange-400" : "bg-gray-200")} />}
            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shrink-0",
              n <= revealedLevel ? (n === 5 ? "bg-orange-500 text-white scale-110" : "bg-orange-100 text-orange-700") : "bg-gray-100 text-gray-300"
            )}>
              {n <= revealedLevel && n < 5 ? <CheckCircle2 className="h-4 w-4 text-orange-500" /> : n}
            </div>
          </div>
        ))}
        <span className="text-xs font-bold text-gray-500 ml-3 shrink-0">{Math.min(revealedLevel, 5)}/5</span>
      </div>

      <div className="space-y-2">
        {questions.map((item, i) => (
          <div key={i} className={cn("transition-all duration-700", i < revealedLevel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 h-0 overflow-hidden")}>
            <div className="flex items-start gap-3 py-1.5">
              <span className={cn("shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                i < revealedLevel - 1 ? "bg-orange-100 text-orange-700" : "bg-orange-500 text-white animate-pulse"
              )}>{i + 1}</span>
              <div className="flex-1">
                <p className="text-xs"><span className="font-semibold text-orange-700">Pourquoi</span> {item.q}?</p>
                <p className="text-xs text-gray-600 mt-0.5">{"\u2192"} {item.a}</p>
              </div>
              {i < questions.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-1" />}
            </div>

            <div className="ml-9 mt-0.5 mb-2">
              <div className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border-l-2 border-gray-300">
                <BotAvatar code={item.bot} size="sm" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 italic">{item.reflexion}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setShowDebate(showDebate === i ? null : i)}
                    className={cn("text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer transition-colors",
                      showDebate === i ? "bg-orange-100 border border-orange-200 text-orange-700" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
                    )}
                  >
                    {showDebate === i ? "Fermer" : "Voir le debat"}
                  </button>
                  <button className="text-xs bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-medium cursor-pointer hover:bg-gray-100">Creuser</button>
                  <button className="text-xs bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-medium cursor-pointer hover:bg-gray-100">Pivoter</button>
                </div>
              </div>

              {showDebate === i && (
                <div className="mt-1.5 ml-2 space-y-1.5 border-l-2 border-orange-200 pl-3 animate-in fade-in duration-300">
                  <div className="flex items-start gap-2">
                    <BotAvatar code={item.debate.challenger} size="sm" />
                    <div className="bg-amber-50 border border-amber-200 rounded-lg rounded-tl-none px-2.5 py-1.5 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-bold text-amber-700">{BOT_COLORS[item.debate.challenger]?.name}</span>
                        <span className="text-xs bg-amber-200 text-amber-800 px-1 py-0.5 rounded">Challenge</span>
                      </div>
                      <p className="text-xs text-gray-700">{item.debate.challengeText}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <BotAvatar code={item.debate.defense} size="sm" />
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg rounded-tl-none px-2.5 py-1.5 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-bold text-emerald-700">{BOT_COLORS[item.debate.defense]?.name}</span>
                        <span className="text-xs bg-emerald-200 text-emerald-800 px-1 py-0.5 rounded">Defense</span>
                      </div>
                      <p className="text-xs text-gray-700">{item.debate.defenseText}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-700 font-medium">{item.debate.verdict}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Cause racine */}
        <div className={cn("pt-2 border-t border-orange-200 transition-all duration-700",
          revealedLevel >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">5</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-orange-800">CAUSE RACINE</p>
              <p className="text-xs text-orange-700 mt-0.5">L'absence de strategie de contenu structuree fait que le messaging reste technique au lieu d'etre oriente resultats business.</p>
            </div>
          </div>
          <div className="ml-9 mt-2 bg-orange-50 rounded-lg px-3 py-2 border border-orange-200">
            <p className="text-xs font-bold text-orange-700 mb-1">Bonification \u2014 Synthese des 4 debats:</p>
            <div className="space-y-1">
              {questions.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-orange-600">
                  <span className="w-3 h-3 rounded-full bg-orange-200 flex items-center justify-center text-xs font-bold text-orange-700 shrink-0">{i + 1}</span>
                  <span>{item.debate.verdict}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-2">
              <button className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-orange-300">Epingler cette synthese</button>
              <button className="text-xs bg-white text-orange-700 px-2 py-0.5 rounded-full font-medium border border-orange-200 cursor-pointer hover:bg-orange-50">Relancer un 5 Pourquoi</button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="text-xs bg-orange-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-700">Creuser cette cause</button>
        <button className="text-xs bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-50">Pivoter l'analyse</button>
        <button className="text-xs bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-50">Synthese des causes</button>
        <button className="text-xs bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-50">Challenger la conclusion</button>
        <button className="text-xs bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-50">Combiner avec le brainstorm</button>
      </div>
    </div>
  );
}

function MagDeepSearch() {
  const [expandedSource, setExpandedSource] = useState<number | null>(null);
  const [deepening, setDeepening] = useState(false);
  const [deepened, setDeepened] = useState(false);
  const [revealedSources, setRevealedSources] = useState(0);

  // Sources apparaissent une par une — simulation de recherche en direct
  useEffect(() => {
    if (revealedSources < 4) {
      const timer = setTimeout(() => setRevealedSources(prev => prev + 1), 1500);
      return () => clearTimeout(timer);
    }
  }, [revealedSources]);

  const DEEP_CITATIONS: Record<number, { type: string; date: string; author: string; citations: { text: string; page: string }[]; crossRef: string }> = {
    0: { type: "Rapport gouvernemental", date: "2025-Q4", author: "MESI Quebec", citations: [
      { text: "72% des PME manufacturieres sous-investissent en marketing digital par rapport aux benchmarks sectoriels.", page: "p.34" },
      { text: "Le programme PCAN offre jusqu'a 50,000$ en accompagnement numerique pour les PME.", page: "p.67" },
    ], crossRef: "Valide le constat #1 du diagnostic" },
    1: { type: "Etude sectorielle", date: "2025-11", author: "CEFRIO / BDC", citations: [
      { text: "Le cout d'acquisition moyen en B2B SaaS au Quebec est de 340$/lead.", page: "p.12" },
      { text: "Les programmes referral generent un ROI 3.5-5x superieur aux canaux traditionnels.", page: "p.28" },
    ], crossRef: "Confirme l'axe Referral du brainstorm" },
    2: { type: "Benchmark industrie", date: "2026-01", author: "HubSpot State of Marketing", citations: [
      { text: "Taux de conversion moyen B2B SaaS: 2.8%. Top performers: 5.2%.", page: "p.44" },
      { text: "Le contenu educatif convertit 3.2x mieux que le contenu produit.", page: "p.51" },
    ], crossRef: "Valide la cause racine des 5 Pourquoi" },
    3: { type: "Article scientifique", date: "2025-09", author: "MIT Sloan Review", citations: [
      { text: "Les chatbots AI bien implementes augmentent la conversion de 2.1-3.8x dans les 90 premiers jours.", page: "Vol.67 No.1" },
    ], crossRef: "Appuie la proposition CTO (chatbot)" },
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Sources externes trouvees pour valider les hypotheses du diagnostic. Chaque source a un score de pertinence.</p>
      {/* Barre de progression recherche */}
      <div className="grid grid-cols-4 gap-1.5">
        {["Gouvernement", "Sectoriel", "Benchmark", "Academique"].map((cat, i) => (
          <div key={i} className="text-center">
            <div className="h-1 bg-blue-500 rounded-full mb-0.5" />
            <span className="text-[10px] text-gray-400">{cat}</span>
          </div>
        ))}
      </div>

      {/* Barre de progression recherche live */}
      {revealedSources < 4 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center gap-3">
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-blue-600 font-medium">Recherche en cours... {revealedSources}/4 sources trouvées</p>
            <div className="h-1.5 bg-blue-100 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${(revealedSources / 4) * 100}%` }} />
            </div>
          </div>
        </div>
      )}
      {revealedSources >= 4 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-700 font-medium">4/4 sources validées — analyse croisée complète</p>
        </div>
      )}

      <div className="space-y-2">
        {SPR_DEEP_SEARCH_SOURCES.map((src, i) => {
          const Icon = src.icon;
          const meta = DEEP_CITATIONS[i];
          const isExpanded = expandedSource === i;
          if (i >= revealedSources) return (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 bg-gray-200 rounded" />
                <div className="h-2 w-48 bg-gray-200 rounded" />
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200" />
            </div>
          );
          return (
            <div key={i} className="bg-white border border-blue-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow animate-in fade-in slide-in-from-bottom-2" style={{ animationDuration: "500ms" }}>
              <div className="p-3 flex items-start gap-3 cursor-pointer" onClick={() => setExpandedSource(isExpanded ? null : i)}>
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800">{src.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{src.detail}</p>
                  {meta && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{meta.type}</span>
                      <span className="text-[10px] text-gray-400">{meta.author}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{src.score}%</span>
                  </div>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                </div>
              </div>
              {isExpanded && meta && (
                <div className="px-3 pb-3 border-t border-blue-100 pt-2 space-y-2">
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Citations cles</p>
                  {meta.citations.map((c, j) => (
                    <div key={j} className="bg-blue-50/50 border-l-2 border-blue-300 rounded-r-lg px-3 py-1.5">
                      <p className="text-xs text-gray-700 italic">"{c.text}"</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{c.page}</p>
                    </div>
                  ))}
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full border border-emerald-200">{meta.crossRef}</span>
                  <div className="flex gap-1.5">
                    <button className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-blue-700">Cristalliser</button>
                    <button className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Verifier</button>
                    <button className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Chercher plus</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Croisement automatique des sources */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        <p className="text-xs font-bold text-blue-700 mb-1">Croisement automatique des sources</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { ok: true, text: "4/4 sources confirment le ROI referral" },
            { ok: true, text: "3/4 sources confirment la cause racine" },
            { ok: false, text: "Chatbot AI: donnees limitees au Quebec" },
            { ok: true, text: "Budget 3,800$ aligne avec benchmarks" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
              {item.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => { if (!deepened) { setDeepening(true); setTimeout(() => { setDeepening(false); setDeepened(true); }, 2000); } }}
          className={cn("text-xs px-3 py-1.5 rounded-full font-medium cursor-pointer flex items-center gap-1.5 transition-colors", deepened ? "bg-emerald-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700")}
        >{deepening ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyse approfondie...</> : deepened ? <><CheckCircle2 className="h-3.5 w-3.5" /> Source approfondie</> : <>Approfondir une source</>}</button>
        <button className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Relancer la recherche</button>
        <button className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Combiner les sources</button>
        <button className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Synthese des donnees</button>
        <button className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Extraire les chiffres cles</button>
      </div>
    </div>
  );
}

function MagSyntheseRecherche() {
  const [revealCount, setRevealCount] = useState(0);
  useEffect(() => {
    if (revealCount < 4) {
      const timer = setTimeout(() => setRevealCount(prev => prev + 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [revealCount]);
  return (
    <div className="space-y-4">

      <div className={cn("space-y-2 transition-all duration-700", revealCount >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Constats valides (3)
        </p>
        {[
          { id: 1, text: "Le marche est pret (MESI + CEFRIO confirment): 72% des PME sous-investissent en marketing digital", score: 94 },
          { id: 2, text: "Le messaging technique = cause racine du faible taux de conversion (1.2%)", score: 91 },
          { id: 3, text: "Le programme referral est le quick win le plus rentable (ROI 4.2x confirme par benchmark)", score: 87 },
        ].map(c => (
          <div key={c.id} className="bg-white border border-emerald-200 rounded-lg p-3 flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">{c.id}</span>
            <p className="text-xs text-gray-700 flex-1">{c.text}</p>
            <span className="text-xs font-bold text-emerald-600 shrink-0">{c.score}%</span>
          </div>
        ))}
      </div>

      <div className={cn("space-y-2 transition-all duration-700", revealCount >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <Search className="h-3.5 w-3.5 text-amber-500" /> Hypotheses a verifier (2)
        </p>
        {[
          { text: "Le chatbot AI peut reellement tripler la conversion (besoin A/B test)", action: "Lancer un test" },
          { text: "Le contenu LinkedIn educatif va generer des leads qualifies (3 mois minimum)", action: "Definir les KPIs" },
        ].map((h, i) => (
          <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <p className="text-xs text-gray-700 flex-1">{h.text}</p>
            <button className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-amber-300 shrink-0">{h.action}</button>
          </div>
        ))}
      </div>

      <div className={cn("bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3 transition-all duration-700", revealCount >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-bold text-red-800">Risque identifie</p>
          <p className="text-xs text-red-700">Timeline Q2 agressive pour tout deployer \u2014 Tim recommande Q2+Q3</p>
        </div>
        <button className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-red-300 shrink-0">Mitiger</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-700">Challenger ces conclusions</button>
        <button className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Relancer le Deep Search</button>
        <button className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Combiner avec d'autres donnees</button>
        <button className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Exporter la synthese</button>
      </div>
    </div>
  );
}

function MagChallenge() {
  const [activeRound, setActiveRound] = useState(0);
  const [verdictLoading, setVerdictLoading] = useState(false);
  const [verdictAccepted, setVerdictAccepted] = useState(false);
  const [roundStep, setRoundStep] = useState(0);

  // Reset animation on round change
  useEffect(() => {
    setRoundStep(0);
  }, [activeRound]);

  // Progressive reveal: challenge(1) → defense(2) → verdict+metrics(3) → buttons(4)
  useEffect(() => {
    if (roundStep < 4) {
      const timer = setTimeout(() => setRoundStep(prev => prev + 1), 1200);
      return () => clearTimeout(timer);
    }
  }, [roundStep]);

  const CHALLENGE_ROUNDS = [
    {
      title: "Budget trop agressif (8K$/mois)",
      challenger: "CFOB", challengerName: "Frank (CFO)",
      challengeText: "Le plan initial a 8K$/mois represente 96K$/an \u2014 8% du CA. C'est au-dessus du benchmark manufacturier (5-6%). Risque de tresorerie en Q3.",
      defender: "CMOB", defenderName: "Mathilde (CMO)",
      defenseText: "Le programme referral seul coute 1,200$/mois avec un ROI de 4.2x. Plan revise a 3,800$/mois pour un ROI de 3.6x. Conservateur et validable en Q2.",
      verdict: "Plan revise a 3,800$/mois accepte \u2014 ROI 3.6x valide",
      confidence: 91,
      metrics: [
        { label: "ROI projete", value: "3.6x", color: "text-emerald-600" },
        { label: "/mois revise", value: "3,800$", color: "text-blue-600" },
        { label: "vs initial", value: "-53%", color: "text-amber-600" },
      ],
    },
    {
      title: "Timeline Q2 trop serree",
      challenger: "COOB", challengerName: "Olivier (COO)",
      challengeText: "Deployer 3 axes en parallele en Q2 = surcharge equipe. Le projet CRM est deja en cours. Risque d'execution eleve.",
      defender: "CTOB", defenderName: "Tim (CTO)",
      defenseText: "Le chatbot est deployable en 3 semaines (stack validee). Le referral est un processus RH. Seul LinkedIn demande du contenu regulier \u2014 externalisable.",
      verdict: "Deploiement sequentiel: referral S1 \u2192 chatbot S3 \u2192 LinkedIn S5",
      confidence: 84,
      metrics: [
        { label: "Referral", value: "Sem 1", color: "text-emerald-600" },
        { label: "Chatbot", value: "Sem 3", color: "text-blue-600" },
        { label: "LinkedIn", value: "Sem 5", color: "text-violet-600" },
      ],
    },
    {
      title: "Messaging ROI pas prouve",
      challenger: "CTOB", challengerName: "Tim (CTO)",
      challengeText: "On assume que pivoter vers le messaging ROI va augmenter les leads. Mais on n'a aucune donnee interne. Les benchmarks externes ne s'appliquent peut-etre pas.",
      defender: "CEOB", defenderName: "CarlOS (CEO)",
      defenseText: "Le Deep Search montre que 72% des PME sous-investissent en digital. Les 5 clients actuels mentionnent tous le ROI comme facteur #1. L'A/B test LinkedIn validera en 4 semaines.",
      verdict: "A/B test LinkedIn (messaging tech vs ROI) en semaine 1 \u2014 decision basee sur donnees",
      confidence: 78,
      metrics: [
        { label: "Confiance", value: "78%", color: "text-amber-600" },
        { label: "Validation", value: "4 sem", color: "text-blue-600" },
        { label: "Methode", value: "A/B test", color: "text-violet-600" },
      ],
    },
  ];

  const round = CHALLENGE_ROUNDS[activeRound];

  return (
    <div className="space-y-4">
      {/* Titre retiré — déjà affiché dans le hero compact */}

      {/* Rounds navigation */}
      <div className="flex items-center gap-1">
        {CHALLENGE_ROUNDS.map((r, i) => (
          <button key={i} onClick={() => setActiveRound(i)}
            className={cn("flex-1 text-xs py-1.5 px-2 rounded-lg font-medium cursor-pointer transition-all truncate",
              i === activeRound ? "bg-amber-500 text-white shadow-sm" : i < activeRound ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
            )}>
            {i < activeRound && <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />}
            Round {i + 1}
          </button>
        ))}
      </div>

      <div className="bg-white border-2 border-amber-300 rounded-xl overflow-hidden">
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-xs font-bold text-amber-800">Challenge: {round.title}</span>
        </div>
        <div className="p-4 space-y-3">
          {/* Challenge */}
          <div className={cn("flex items-start gap-3 transition-all duration-700", roundStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
            <BotAvatar code={round.challenger} size="sm" />
            <div className="flex-1 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-amber-700">{round.challengerName}</span>
                <span className="text-[10px] bg-amber-200 text-amber-800 px-1 py-0.5 rounded">Challenge</span>
              </div>
              <p className="text-xs text-gray-600">{round.challengeText}</p>
            </div>
          </div>
          {/* Defense */}
          <div className={cn("flex items-start gap-3 transition-all duration-700", roundStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
            <BotAvatar code={round.defender} size="sm" />
            <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-emerald-700">{round.defenderName}</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1 py-0.5 rounded">Defense</span>
              </div>
              <p className="text-xs text-gray-600">{round.defenseText}</p>
            </div>
          </div>
          {/* Verdict */}
          <div className={cn("bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-start gap-2 transition-all duration-700", roundStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-blue-700 font-medium">{round.verdict}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-gray-400">Confiance equipe:</span>
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-1000", round.confidence >= 85 ? "bg-emerald-500" : round.confidence >= 70 ? "bg-amber-500" : "bg-orange-500")} style={{ width: roundStep >= 3 ? `${round.confidence}%` : '0%' }} />
                </div>
                <span className={cn("text-xs font-bold", round.confidence >= 85 ? "text-emerald-600" : round.confidence >= 70 ? "text-amber-600" : "text-orange-600")}>{roundStep >= 3 ? round.confidence : 0}%</span>
              </div>
            </div>
          </div>
          {/* Metrics */}
          <div className={cn("grid grid-cols-3 gap-2 transition-all duration-700", roundStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
            {round.metrics.map((m, i) => (
              <div key={i} className="text-center bg-white border border-gray-200 rounded-lg p-2">
                <p className={cn("text-lg font-extrabold", m.color)}>{m.value}</p>
                <p className="text-xs text-gray-500">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cn("flex flex-wrap gap-2 transition-all duration-700", roundStep >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
        <button onClick={() => { if (!verdictAccepted) { setVerdictLoading(true); setTimeout(() => { setVerdictLoading(false); setVerdictAccepted(true); }, 1500); } }}
          className={cn("text-xs px-3 py-1.5 rounded-full font-medium cursor-pointer flex items-center gap-1.5 transition-colors", verdictAccepted ? "bg-emerald-700 text-white" : "bg-emerald-600 text-white hover:bg-emerald-700")}
        >{verdictLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Validation...</> : verdictAccepted ? <><CheckCircle2 className="h-3.5 w-3.5" /> Verdict accepté</> : <>Accepter le verdict</>}</button>
        {!verdictAccepted && <>
        <button className="text-xs bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-amber-50">Re-challenger</button>
        <button className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-gray-50">Demander un 2e avis</button>
        <button className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-gray-50">Voir l'alternative</button>
        <button className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-gray-50">Synthese des 3 rounds</button>
        </>}
      </div>
      {verdictAccepted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 flex items-center gap-2 animate-in fade-in slide-in-from-top-1" style={{ animationDuration: "300ms" }}>
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-700 font-medium">Verdict accepté — 2 propositions validées, plan révisé à 3,800$/mois (ROI 3.6x)</p>
        </div>
      )}
    </div>
  );
}

function MagPreRapport() {
  const [activeAction, setActiveAction] = useState<{ sectionId: number; action: string } | null>(null);
  const [pinnedSection, setPinnedSection] = useState<number | null>(null);
  const [crystallizing, setCrystallizing] = useState(false);
  const [crystallized, setCrystallized] = useState(false);
  const [crystalProgress, setCrystalProgress] = useState(0);
  const [revealedSections, setRevealedSections] = useState(0);
  const sectionsFilled = SPR_REPORT_SECTIONS.map(s => s.id);

  // Sections du rapport apparaissent une par une — compilation en direct
  useEffect(() => {
    if (revealedSections < sectionsFilled.length) {
      const timer = setTimeout(() => setRevealedSections(prev => prev + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [revealedSections, sectionsFilled.length]);

  const APPROFONDIR_RESULTS: Record<number, { bot: string; expanded: string; data: string[] }> = {
    2: {
      bot: "CEOB",
      expanded: "Analyse approfondie des 3 tensions: Le cout d'acquisition de 780$/lead est 2.3x le benchmark SaaS B2B (340$). La conversion de 1.2% est critique \u2014 la moyenne secteur est 2.8%. La dependance au bouche-a-oreille (65%) rend le pipeline fragile et imprevisible.",
      data: ["CAC: 780$ vs 340$ benchmark (-56% a atteindre)", "Conversion: 1.2% vs 2.8% secteur (+133% requis)", "Pipeline: 65% referral = risque concentration"],
    },
    3: {
      bot: "CMOB",
      expanded: "Chaque perspective apporte un axe complementaire. Mathilde cible le messaging (ROI > tech), Frank optimise l'allocation budget, Tim identifie les leviers techniques. Les 3 convergent sur un point: le contenu doit parler resultats, pas features.",
      data: ["Messaging: 0 mention ROI sur le site actuel", "Budget: 7,800$/mois en salons (65%), 0$/mois en digital", "Tech: chatbot AI = conversion 3-4% (vs 1.2% actuel)"],
    },
  };

  const REFORMULER_RESULTS: Record<number, { before: string; after: string; bot: string }> = {
    2: {
      before: "3 tensions identifiees: cout acquisition eleve (780$/lead), faible conversion site web (1.2%), pipeline trop dependant du bouche-a-oreille (65%).",
      after: "Le pipeline marketing presente 3 failles structurelles: un cout d'acquisition 2.3x au-dessus du benchmark (780$ vs 340$), un tunnel de conversion defaillant (1.2% vs 2.8% secteur), et une dependance critique au bouche-a-oreille (65%) qui fragilise la previsibilite.",
      bot: "CEOB",
    },
    5: {
      before: "Cause racine: le messaging actuel parle de technologie, pas de resultats business. Les PME ne se reconnaissent pas.",
      after: "La cause fondamentale est un desalignement entre le discours (features technologiques) et ce que les decideurs PME recherchent (ROI mesurable, temps gagne, risques reduits). Ce gap messaging \u2192 attentes client explique 80% de la perte de leads qualifies.",
      bot: "CMOB",
    },
  };

  const handleAction = (sectionId: number, action: string) => {
    if (activeAction?.sectionId === sectionId && activeAction?.action === action) {
      setActiveAction(null);
    } else {
      setActiveAction({ sectionId, action });
    }
  };

  const handlePin = (sectionId: number) => {
    setPinnedSection(sectionId);
    setTimeout(() => setPinnedSection(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
          {SPR_REPORT_SECTIONS.filter(s => sectionsFilled.includes(s.id)).filter((_, i) => i < revealedSections).map((s, idx) => (
            <div key={s.id} className={cn("border-l-[3px] rounded-r-lg px-3 py-2.5 group transition-all animate-in fade-in slide-in-from-bottom-2",
              activeAction?.sectionId === s.id ? "border-orange-500 bg-orange-50 ring-1 ring-orange-200" : "border-orange-400 bg-orange-50/50",
              pinnedSection === s.id ? "ring-2 ring-blue-400 animate-pulse" : ""
            )}>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-orange-700">{s.id}. {s.title}</h4>
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-auto">
                  {s.id <= 2 ? "CarlOS" : s.id === 3 ? "Multi-bot" : s.id === 4 ? "Brainstorm" : s.id === 5 ? "5 Pourquoi" : s.id === 6 ? "Deep Search" : s.id === 7 ? "Frank" : "CarlOS"}
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{s.content}</p>

              <div className="flex flex-wrap gap-1.5 mt-2 opacity-70 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handlePin(s.id)}
                  className={cn("text-xs font-medium cursor-pointer flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors",
                    pinnedSection === s.id ? "text-blue-700 bg-blue-100 border border-blue-300" : "text-orange-600 hover:text-orange-700 bg-white border border-orange-200 hover:bg-orange-50"
                  )}>
                  <Pin className="h-3.5 w-3.5" /> {pinnedSection === s.id ? "Epingle!" : "Epingler"}
                </button>
                <button onClick={() => handleAction(s.id, "approfondir")}
                  className={cn("text-xs font-medium cursor-pointer flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors",
                    activeAction?.sectionId === s.id && activeAction?.action === "approfondir" ? "text-violet-700 bg-violet-100 border border-violet-300" : "text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                  )}>
                  <BookOpen className="h-3.5 w-3.5" /> Approfondir
                </button>
                <button onClick={() => handleAction(s.id, "reformuler")}
                  className={cn("text-xs font-medium cursor-pointer flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors",
                    activeAction?.sectionId === s.id && activeAction?.action === "reformuler" ? "text-amber-700 bg-amber-100 border border-amber-300" : "text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                  )}>
                  <RefreshCw className="h-3.5 w-3.5" /> Reformuler
                </button>
                <button className="text-xs text-gray-500 hover:text-gray-700 font-medium cursor-pointer flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-0.5 hover:bg-gray-50">
                  <AlertTriangle className="h-3.5 w-3.5" /> Challenger
                </button>
                <button className="text-xs text-gray-500 hover:text-gray-700 font-medium cursor-pointer flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-0.5 hover:bg-gray-50">
                  <Layers className="h-3.5 w-3.5" /> Fusionner
                </button>
              </div>

              {/* APPROFONDIR result */}
              {activeAction?.sectionId === s.id && activeAction?.action === "approfondir" && (
                <div className="mt-3 border-t border-orange-200 pt-3 space-y-2">
                  {APPROFONDIR_RESULTS[s.id] ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <BotAvatar code={APPROFONDIR_RESULTS[s.id].bot} size="sm" />
                        <span className="text-xs font-bold text-violet-700">Analyse approfondie par {BOT_COLORS[APPROFONDIR_RESULTS[s.id].bot]?.name}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse ml-auto" />
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed bg-violet-50 rounded-lg px-3 py-2 border border-violet-200">
                        {APPROFONDIR_RESULTS[s.id].expanded}
                      </p>
                      <div className="space-y-1">
                        {APPROFONDIR_RESULTS[s.id].data.map((d, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs text-violet-700 bg-white rounded px-2.5 py-1 border border-violet-100">
                            <BarChart3 className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <button className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-violet-700">Integrer au rapport</button>
                        <button className="text-xs bg-white text-violet-700 px-2 py-0.5 rounded-full font-medium border border-violet-200 cursor-pointer hover:bg-violet-50">Encore plus profond</button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-lg px-3 py-2 border border-violet-200">
                      <BotAvatar code="CEOB" size="sm" />
                      <div className="flex-1">
                        <p className="text-xs text-violet-700 font-medium">CarlOS analyse cette section en profondeur...</p>
                        <div className="flex gap-1 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* REFORMULER result */}
              {activeAction?.sectionId === s.id && activeAction?.action === "reformuler" && (
                <div className="mt-3 border-t border-orange-200 pt-3 space-y-2">
                  {REFORMULER_RESULTS[s.id] ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <BotAvatar code={REFORMULER_RESULTS[s.id].bot} size="sm" />
                        <span className="text-xs font-bold text-amber-700">Reformulation par {BOT_COLORS[REFORMULER_RESULTS[s.id].bot]?.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Avant</p>
                          <p className="text-xs text-gray-500 line-through leading-relaxed">{REFORMULER_RESULTS[s.id].before}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                          <p className="text-xs text-amber-600 font-bold uppercase mb-1">Apres</p>
                          <p className="text-xs text-amber-800 leading-relaxed">{REFORMULER_RESULTS[s.id].after}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-amber-700">Appliquer la reformulation</button>
                        <button className="text-xs bg-white text-amber-700 px-2 py-0.5 rounded-full font-medium border border-amber-200 cursor-pointer hover:bg-amber-50">Autre version</button>
                        <button onClick={() => setActiveAction(null)} className="text-xs bg-white text-gray-500 px-2 py-0.5 rounded-full font-medium border border-gray-200 cursor-pointer hover:bg-gray-50">Garder l'original</button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                      <BotAvatar code="CEOB" size="sm" />
                      <div className="flex-1">
                        <p className="text-xs text-amber-700 font-medium">CarlOS reformule cette section...</p>
                        <div className="flex gap-1 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Indicateur de compilation */}
          {revealedSections < sectionsFilled.length && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 flex items-center gap-3">
              <Loader2 className="h-4 w-4 text-orange-500 animate-spin shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-orange-600 font-medium">Compilation du rapport... {revealedSections}/{sectionsFilled.length} sections</p>
                <div className="h-1.5 bg-orange-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${(revealedSections / sectionsFilled.length) * 100}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Passage en Conception — vote et budget */}
          <div className={cn("border border-gray-200 rounded-lg overflow-hidden mt-3 transition-all duration-700", revealedSections >= sectionsFilled.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
            <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200 flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Vote equipe — Passage en Conception</span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-gray-200">
              {[
                { bot: "CFOB", name: "Frank (CFO)", vote: "GO", reason: "Budget aligne, ROI valide par Deep Search" },
                { bot: "CMOB", name: "Mathilde (CMO)", vote: "GO", reason: "Messaging pivot necessaire, timing Q2 ideal" },
                { bot: "CTOB", name: "Tim (CTO)", vote: "GO", reason: "Chatbot deployable en 3 semaines, stack validee" },
                { bot: "COOB", name: "Olivier (COO)", vote: "GO", reason: "Ressources disponibles, pas d'impact operations" },
              ].map(v => (
                <div key={v.bot} className="bg-white px-2.5 py-2 flex items-start gap-2">
                  <BotAvatar code={v.bot} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-700">{v.name}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">{v.vote}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">{v.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-extrabold text-emerald-700">3,800$</p>
              <p className="text-[10px] text-emerald-600">/mois budget total</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-extrabold text-blue-700">3.6x</p>
              <p className="text-[10px] text-blue-600">ROI projete</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-extrabold text-orange-700">12 sem</p>
              <p className="text-[10px] text-orange-600">deploiement complet</p>
            </div>
          </div>
        </div>
    </div>
  );
}

// ========== CONCEPTION WIZARD — setup chantier en theme jaune (panel droit) ==========

const CONCEPTION_SECTIONS = [
  { id: 1, title: "Vue d'ensemble du chantier", icon: Flame },
  { id: 2, title: "Objectifs & Crit\u00e8res de succ\u00e8s", icon: Target },
  { id: 3, title: "Projets identifi\u00e9s", icon: FolderOpen },
  { id: 4, title: "Missions par projet", icon: Target },
  { id: 5, title: "T\u00e2ches par mission", icon: ListChecks },
  { id: 6, title: "\u00c9quipe & Attribution", icon: Users },
  { id: 7, title: "Budget & Ressources", icon: DollarSign },
  { id: 8, title: "Timeline & Jalons", icon: Calendar },
];

// ========== CONCEPTION DOCFORGE — sections progressives (même pattern que REFLEXION_DOCFORGE_SECTIONS) ==========
const CONCEPTION_DOCFORGE_SECTIONS: { id: number; title: string; icon: React.ElementType; minStage: number }[] = [
  { id: 1, title: "Vue d'ensemble du chantier", icon: Flame, minStage: 0 },
  { id: 2, title: "Objectifs & Critères de succès", icon: Target, minStage: 1 },
  { id: 3, title: "Projets identifiés", icon: FolderOpen, minStage: 2 },
  { id: 4, title: "Missions par projet", icon: Target, minStage: 2 },
  { id: 5, title: "Tâches par mission", icon: ListChecks, minStage: 3 },
  { id: 6, title: "Équipe & Attribution", icon: Users, minStage: 3 },
  { id: 7, title: "Budget & Ressources", icon: DollarSign, minStage: 4 },
  { id: 8, title: "Timeline & Jalons", icon: Calendar, minStage: 4 },
];

const CONCEPTION_DATA: Record<number, { content: React.ReactNode }> = {
  1: { content: (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          <p className="text-xs text-yellow-600 font-bold uppercase">Titre</p>
          <p className="text-xs font-bold text-gray-800">Strat\u00e9gie Marketing Q2-Q3</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          <p className="text-xs text-yellow-600 font-bold uppercase">Chaleur</p>
          <p className="text-xs font-bold text-gray-800">\ud83d\udd25 Critique \u2014 Pipeline stagne</p>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Description</p>
        <p className="text-[10px] text-gray-700 leading-relaxed">Refonte compl\u00e8te de la strat\u00e9gie d'acquisition marketing. Pivot du messaging technologique vers le ROI concret. Programme referral + content LinkedIn + webinaires VITAA.</p>
      </div>
    </div>
  )},
  2: { content: (
    <div className="space-y-2">
      {[
        { obj: "R\u00e9duire le CAC de 780$ \u00e0 340$", kpi: "CAC mensuel", cible: "340$", actuel: "780$" },
        { obj: "Augmenter la conversion de 1.2% \u00e0 3.5%", kpi: "Taux conversion", cible: "3.5%", actuel: "1.2%" },
        { obj: "G\u00e9n\u00e9rer 15 leads qualifi\u00e9s/mois", kpi: "Leads/mois", cible: "15", actuel: "4" },
      ].map((o, i) => (
        <div key={i} className="bg-yellow-50/50 border border-yellow-200 rounded-lg px-3 py-2">
          <p className="text-xs font-bold text-gray-800">{o.obj}</p>
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span className="text-gray-500">KPI: {o.kpi}</span>
            <span className="text-red-600">Actuel: {o.actuel}</span>
            <span className="text-emerald-600 font-bold">Cible: {o.cible}</span>
          </div>
        </div>
      ))}
    </div>
  )},
  3: { content: (
    <div className="space-y-2">
      {[
        { name: "Programme R\u00e9f\u00e9rencement Clients", priority: "Haute", bot: "CFOB", botName: "Frank" },
        { name: "Content Marketing LinkedIn", priority: "Haute", bot: "CMOB", botName: "Mathilde" },
        { name: "D\u00e9monstration AI Mensuelle", priority: "Moyenne", bot: "CTOB", botName: "Tim" },
      ].map((p, i) => (
        <div key={i} className="bg-yellow-50/50 border border-yellow-200 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold bg-yellow-600 text-white w-5 h-5 rounded-full flex items-center justify-center">{i+1}</span>
            <span className="text-xs font-bold text-gray-800">{p.name}</span>
            <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium ml-auto", p.priority === "Haute" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600")}>{p.priority}</span>
          </div>
          <div className="flex items-center gap-2 ml-7">
            <BotAvatar code={p.bot} size="sm" />
            <span className="text-xs text-gray-500">Pilot\u00e9 par {p.botName}</span>
          </div>
        </div>
      ))}
    </div>
  )},
  4: { content: (
    <div className="space-y-3">
      {[
        { project: "Programme R\u00e9f\u00e9rencement", missions: ["Cr\u00e9er landing pages t\u00e9moignages", "Mettre en place programme fid\u00e9lit\u00e9", "Automatiser demandes de recommandation"] },
        { project: "Content Marketing LinkedIn", missions: ["Calendrier \u00e9ditorial Q2", "Automatiser publication", "Analyse performance hebdo"] },
        { project: "D\u00e9monstration AI", missions: ["Organiser premier webinar", "Pr\u00e9parer d\u00e9mos live", "Suivi post-webinar"] },
      ].map((p, i) => (
        <div key={i}>
          <p className="text-xs font-bold text-yellow-700 mb-1">{p.project}</p>
          <div className="space-y-1 ml-3">
            {p.missions.map((m, j) => (
              <div key={j} className="flex items-center gap-2 text-xs text-gray-700 bg-white border border-gray-100 rounded px-2.5 py-1">
                <Target className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                <span>Mission {i+1}.{j+1}: {m}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )},
  5: { content: (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 italic">T\u00e2ches d\u00e9riv\u00e9es des missions \u2014 27 t\u00e2ches atomiques</p>
      {[
        { mission: "Landing pages t\u00e9moignages", tasks: ["R\u00e9diger 5 cas clients", "Design template t\u00e9moignage", "Int\u00e9grer au site web", "A/B test des CTAs"] },
        { mission: "Calendrier \u00e9ditorial Q2", tasks: ["D\u00e9finir 12 th\u00e8mes", "R\u00e9diger 4 posts/semaine", "Planifier dans l'outil"] },
      ].map((m, i) => (
        <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <p className="text-xs font-bold text-gray-600 mb-1">{m.mission}</p>
          <div className="space-y-0.5">
            {m.tasks.map((t, j) => (
              <div key={j} className="flex items-center gap-1.5 text-xs text-gray-600">
                <ListChecks className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )},
  6: { content: (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {[
          { code: "CEOB", name: "CarlOS", role: "Coordination" },
          { code: "CMOB", name: "Mathilde", role: "Marketing" },
          { code: "CFOB", name: "Frank", role: "Budget" },
          { code: "CTOB", name: "Tim", role: "Tech" },
        ].map(b => (
          <div key={b.code} className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-2.5 py-2">
            <BotAvatar code={b.code} size="sm" />
            <div>
              <p className="text-xs font-bold text-gray-800">{b.name}</p>
              <p className="text-xs text-gray-500">{b.role}</p>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg px-2.5 py-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <Plus className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400">Humain</p>
        </div>
      </div>
    </div>
  )},
  7: { content: (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          <p className="text-xs text-yellow-600 font-bold uppercase">Budget mensuel</p>
          <p className="text-xs font-bold text-gray-800">3,800$/mois</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <p className="text-xs text-emerald-600 font-bold uppercase">ROI projet\u00e9</p>
          <p className="text-xs font-bold text-emerald-700">3.6x</p>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <p className="text-xs text-gray-500 font-bold uppercase mb-1">R\u00e9partition</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Referral Program</span>
            <span className="font-bold text-gray-800">1,200$/mois</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Content LinkedIn</span>
            <span className="font-bold text-gray-800">2,600$/mois</span>
          </div>
        </div>
      </div>
    </div>
  )},
  8: { content: (
    <div className="space-y-2">
      {[
        { phase: "Q2 \u2014 Avril-Juin", items: ["Lancement programme referral", "Premiers posts LinkedIn", "Setup automatisations email"], color: "bg-amber-100 text-amber-700" },
        { phase: "Q3 \u2014 Juillet-Sept", items: ["Premier webinar VITAA", "Scale content LinkedIn", "Analyse ROI et ajustements"], color: "bg-emerald-100 text-emerald-700" },
      ].map((p, i) => (
        <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold", p.color)}>{p.phase}</span>
          <div className="mt-2 space-y-1">
            {p.items.map((item, j) => (
              <div key={j} className="flex items-center gap-1.5 text-xs text-gray-700">
                <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )},
};

function ConceptionBlock({ section, validated, onValidate }: {
  section: typeof CONCEPTION_SECTIONS[0]; validated: boolean; onValidate: () => void;
}) {
  const [appeared, setAppeared] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAppeared(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div className={cn("border-l-[3px] rounded-r-lg transition-all duration-500",
      validated ? "border-emerald-400" : "border-yellow-400",
      appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
    )}>
      <div className="flex items-center gap-2 px-3 py-2">
        <Hammer className="h-3.5 w-3.5 text-yellow-600 shrink-0" />
        <span className="text-xs font-bold text-gray-800">{section.id}. {section.title}</span>
        {validated ? (
          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium ml-auto bg-emerald-100 text-emerald-600">Valid\u00e9 \u2713</span>
        ) : (
          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium ml-auto bg-yellow-100 text-yellow-600">En cours</span>
        )}
      </div>
      <div className="px-3 pb-2">
        {CONCEPTION_DATA[section.id]?.content}
        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100">
          <button className="text-xs text-gray-500 hover:text-orange-700 font-medium cursor-pointer flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-0.5 hover:bg-orange-50">
            <AlertTriangle className="h-3.5 w-3.5" /> Rechallenger
          </button>
          <button className="text-xs text-gray-500 hover:text-amber-700 font-medium cursor-pointer flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-0.5 hover:bg-amber-50">
            <RefreshCw className="h-3.5 w-3.5" /> Ajuster
          </button>
          {!validated && (
            <button onClick={onValidate} className="text-xs text-emerald-700 font-medium cursor-pointer flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 hover:bg-emerald-100">
              <CheckCircle2 className="h-3.5 w-3.5" /> Valider \u2713
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ConceptionWizard({ stage, context }: { stage: number; context: string | null }) {
  const [validatedSections, setValidatedSections] = useState<Set<number>>(new Set());
  const validatedCount = validatedSections.size;
  const allValidated = validatedCount === CONCEPTION_SECTIONS.length;

  const handleValidate = (id: number) => {
    setValidatedSections(prev => { const next = new Set(prev); next.add(id); return next; });
  };

  // Sections appear progressively with conception stage
  const visibleSections = CONCEPTION_SECTIONS.filter((_, i) => stage >= i);

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12">
      <div className="flex gap-4">
        {/* TOC sidebar */}
        <div className="w-48 shrink-0 space-y-1">
          <div className="flex items-center gap-1.5 mb-3">
            <Hammer className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-bold text-gray-800">Conception du Chantier</span>
          </div>
          {CONCEPTION_SECTIONS.map(s => {
            const visible = visibleSections.includes(s);
            const validated = validatedSections.has(s.id);
            return (
              <div key={s.id} className={cn("flex items-center gap-1.5 text-[10px] px-2 py-1.5 rounded transition-all",
                validated ? "bg-emerald-50 text-emerald-700 font-medium" :
                visible ? "bg-yellow-50 text-yellow-700 font-medium" : "text-gray-400"
              )}>
                {validated ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> :
                 visible ? <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shrink-0" /> :
                 <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />}
                <span className="truncate">{s.id}. {s.title}</span>
              </div>
            );
          })}
          <div className="mt-3 text-[10px] text-gray-500 px-2">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${(validatedCount / CONCEPTION_SECTIONS.length) * 100}%` }} />
            </div>
            <span className="mt-1 block">{validatedCount} / {CONCEPTION_SECTIONS.length} valid\u00e9es</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {visibleSections.map(s => (
            <ConceptionBlock
              key={s.id}
              section={s}
              validated={validatedSections.has(s.id)}
              onValidate={() => handleValidate(s.id)}
            />
          ))}

          {/* Ceremonie finale */}
          {allValidated && (
            <div className="py-4">
              <div className="bg-gradient-to-r from-yellow-100 to-emerald-100 border-2 border-emerald-300 rounded-xl px-6 py-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Hammer className="h-5 w-5 text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-emerald-600" />
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
                    <Rocket className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-sm font-bold text-emerald-800">Chantier structur\u00e9!</p>
                <p className="text-xs text-emerald-600 mt-1">3 projets \u2022 9 missions \u2022 27 t\u00e2ches</p>
                <div className="mt-4">
                  <button className="text-xs bg-emerald-600 text-white px-5 py-2.5 rounded-full font-bold cursor-pointer hover:bg-emerald-700">
                    Lancer le Chantier
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== CONCEPTION CHAT — panel gauche quand activePhase === "creation" ==========

export function ConceptionChat({ stage, typed, setTyped, advance, onBackToReflexion }: {
  stage: number; typed: boolean; setTyped: (v: boolean) => void; advance: () => void; onBackToReflexion: () => void;
}) {
  const pc = PC["creation"];
  return (
    <>
      {/* Bouton retour */}
      <button onClick={onBackToReflexion} className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium cursor-pointer mb-2">
        <ArrowLeft className="h-3.5 w-3.5" /> Retour au rapport
      </button>

      {/* Stage 0: intro */}
      {stage >= 0 && (
        <SBubble code="CEOB" collapsed={stage > 0}>
          {stage === 0 ? (
            <>
              <TypewriterText text="Le rapport de réflexion est prêt. Passons à la conception du chantier. Je vais structurer les recommandations en projets, missions et tâches concrètes." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={Flame} label="Vue d'ensemble" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Passage en mode Conception</p>}
        </SBubble>
      )}

      {/* Stage 1: vue d'ensemble */}
      {stage >= 1 && (
        <SBubble code="CEOB" collapsed={stage > 1}>
          {stage === 1 ? (
            <>
              <TypewriterText text="Vue d'ensemble du chantier « Stratégie Marketing Q2-Q3 ». Les données du rapport sont pré-remplies à droite. Vérifie le titre, la description et le niveau de chaleur. Valide quand c'est bon." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={Target} label="Définir les objectifs" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Vue d'ensemble validée</p>}
        </SBubble>
      )}

      {/* Stage 2: projets */}
      {stage >= 2 && (
        <SBubble code="CEOB" collapsed={stage > 2}>
          {stage === 2 ? (
            <>
              <TypewriterText text="3 projets identifiés à partir de l'analyse. Chaque projet est assigné à un bot spécialiste. Vérifie les priorités et les attributions à droite." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && (
                <div className="mt-2 space-y-1">
                  {[
                    { code: "CFOB", name: "Frank", role: "Pilote le Programme Referral" },
                    { code: "CMOB", name: "Mathilde", role: "Pilote le Content LinkedIn" },
                    { code: "CTOB", name: "Tim", role: "Pilote les Démos AI" },
                  ].map(b => (
                    <div key={b.code} className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5">
                      <BotAvatar code={b.code} size="sm" />
                      <span className="text-xs font-bold text-gray-700">{b.name}</span>
                      <span className="text-xs text-gray-500">— {b.role}</span>
                    </div>
                  ))}
                </div>
              )}
              {typed && <SBtn onClick={advance} icon={ListChecks} label="Détailler missions et tâches" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">3 projets, 3 bots assignés</p>}
        </SBubble>
      )}

      {/* Stage 3: missions et taches */}
      {stage >= 3 && (
        <SBubble code="CEOB" collapsed={stage > 3}>
          {stage === 3 ? (
            <>
              <TypewriterText text="Missions et tâches décomposées. 9 missions, 27 tâches atomiques dérivées de l'analyse. Chaque tâche est assignée et estimée. Vérifie la granularité à droite." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={advance} icon={DollarSign} label="Budget et timeline" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">9 missions, 27 tâches</p>}
        </SBubble>
      )}

      {/* Stage 4: budget + timeline */}
      {stage >= 4 && (
        <SBubble code="CEOB" collapsed={stage > 4}>
          {stage === 4 ? (
            <>
              <TypewriterText text="Budget 3,800$/mois, ROI projeté 3.6x. Timeline: Q2 pour les quick wins (referral + LinkedIn), Q3 pour le scale (webinaires + optimisation). Vérifie les chiffres à droite et valide pour finaliser." speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)} />
              {typed && (
                <div className="mt-2 bg-emerald-50 rounded-lg px-3 py-2 text-xs">
                  <div className="flex items-center gap-4">
                    <div><span className="font-bold text-emerald-700">Budget:</span> 3,800$/mois</div>
                    <div><span className="font-bold text-emerald-700">ROI:</span> 3.6x</div>
                    <div><span className="font-bold text-emerald-700">Durée:</span> Q2-Q3</div>
                  </div>
                </div>
              )}
              {typed && <SBtn onClick={advance} icon={Rocket} label="Finaliser le chantier" pc={pc} />}
            </>
          ) : <p className="text-xs text-gray-400 italic">Budget 3,800$/mois, ROI 3.6x</p>}
        </SBubble>
      )}

      {/* Stage 5: validation finale */}
      {stage >= 5 && (
        <div className="bg-gradient-to-r from-yellow-50 to-emerald-50 border border-emerald-300 rounded-xl px-4 py-3">
          <TypewriterText text="Chantier structuré! Valide les 8 sections à droite pour lancer le chantier. Chaque section peut être rechallengée ou ajustée avant le lancement." speed={10} className="text-sm text-emerald-800 font-medium" onComplete={() => setTyped(true)} />
          {typed && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-500" />
              <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-700 font-semibold ml-1">Conception → Lancement</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ========== MAG CONCEPTION — 8 composants animés (même pattern que MagDiagnostic, MagBrainstorm, etc.) ==========

function MagConceptionVueEnsemble() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = [setTimeout(() => setStep(1), 300), setTimeout(() => setStep(2), 600), setTimeout(() => setStep(3), 900)];
    return () => t.forEach(clearTimeout);
  }, []);
  return (
    <div className="space-y-3">
      <div className={cn("grid grid-cols-2 gap-2 transition-all duration-500", step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5">
          <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider">Chantier</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">Stratégie Marketing Q2-Q3</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5">
          <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider">Chaleur</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">🔥 Critique — Pipeline stagne</p>
        </div>
      </div>
      <div className={cn("transition-all duration-500", step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2.5">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Description</p>
          <p className="text-xs text-gray-700 leading-relaxed">Refonte complète de la stratégie d'acquisition marketing. Pivot du messaging technologique vers le ROI concret. Programme referral + content LinkedIn + webinaires VITAA.</p>
        </div>
      </div>
      <div className={cn("transition-all duration-500", step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
        <div className="bg-orange-50/50 border border-orange-100 rounded-lg px-3 py-2 flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-600">Issu de la Phase Réflexion — Diagnostic + Brainstorm SCAMPER + Deep Search + Pré-rapport</p>
        </div>
      </div>
    </div>
  );
}

function MagConceptionObjectifs() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = [setTimeout(() => setStep(1), 300), setTimeout(() => setStep(2), 700), setTimeout(() => setStep(3), 1100)];
    return () => t.forEach(clearTimeout);
  }, []);
  const objectives = [
    { obj: "Réduire le CAC de 780$ à 340$", kpi: "CAC mensuel", cible: "340$", actuel: "780$", progress: 44 },
    { obj: "Augmenter la conversion de 1.2% à 3.5%", kpi: "Taux conversion", cible: "3.5%", actuel: "1.2%", progress: 34 },
    { obj: "Générer 15 leads qualifiés/mois", kpi: "Leads/mois", cible: "15", actuel: "4", progress: 27 },
  ];
  return (
    <div className="space-y-2">
      {objectives.map((o, i) => (
        <div key={i} className={cn("bg-yellow-50/50 border border-yellow-200 rounded-lg px-3 py-2.5 transition-all duration-500", step >= i + 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
          <p className="text-xs font-bold text-gray-800">{o.obj}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs">
            <span className="text-gray-500">KPI: {o.kpi}</span>
            <span className="text-red-600 font-medium">Actuel: {o.actuel}</span>
            <ArrowRight className="h-3 w-3 text-gray-300" />
            <span className="text-emerald-600 font-bold">Cible: {o.cible}</span>
          </div>
          <div className="mt-2 h-1.5 bg-yellow-100 rounded-full overflow-hidden">
            <div className={cn("h-full bg-yellow-500 rounded-full transition-all duration-1000", step >= i + 1 ? "" : "!w-0")} style={{ width: `${o.progress}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MagConceptionProjets() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = [setTimeout(() => setStep(1), 300), setTimeout(() => setStep(2), 600), setTimeout(() => setStep(3), 900)];
    return () => t.forEach(clearTimeout);
  }, []);
  const projets = [
    { name: "Programme Référencement Clients", priority: "Haute", bot: "CFOB", botName: "Frank" },
    { name: "Content Marketing LinkedIn", priority: "Haute", bot: "CMOB", botName: "Mathilde" },
    { name: "Démonstration AI Mensuelle", priority: "Moyenne", bot: "CTOB", botName: "Tim" },
  ];
  return (
    <div className="space-y-2">
      {projets.map((p, i) => (
        <div key={i} className={cn("bg-yellow-50/50 border border-yellow-200 rounded-lg px-3 py-2.5 transition-all duration-500", step >= i + 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3")}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold bg-yellow-600 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
            <span className="text-xs font-bold text-gray-800 flex-1">{p.name}</span>
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", p.priority === "Haute" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600")}>{p.priority}</span>
          </div>
          <div className="flex items-center gap-2 ml-7">
            <BotAvatar code={p.bot} size="sm" />
            <span className="text-xs text-gray-500">Piloté par {p.botName}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MagConceptionMissions() {
  const [openProject, setOpenProject] = useState(0);
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = [setTimeout(() => setStep(1), 200), setTimeout(() => setStep(2), 500), setTimeout(() => setStep(3), 800)];
    return () => t.forEach(clearTimeout);
  }, []);
  const projects = [
    { project: "Programme Référencement", missions: ["Créer landing pages témoignages", "Mettre en place programme fidélité", "Automatiser demandes de recommandation"] },
    { project: "Content Marketing LinkedIn", missions: ["Calendrier éditorial Q2", "Automatiser publication", "Analyse performance hebdo"] },
    { project: "Démonstration AI", missions: ["Organiser premier webinar", "Préparer démos live", "Suivi post-webinar"] },
  ];
  return (
    <div className="space-y-3">
      {projects.map((p, i) => (
        <div key={i} className={cn("transition-all duration-500", step >= i + 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
          <button type="button" onClick={() => setOpenProject(openProject === i ? -1 : i)}
            className="flex items-center gap-2 w-full text-left mb-1 cursor-pointer">
            <ChevronRight className={cn("h-3.5 w-3.5 text-yellow-600 transition-transform", openProject === i && "rotate-90")} />
            <span className="text-xs font-bold text-yellow-700">{p.project}</span>
            <span className="text-[10px] text-gray-400 ml-auto">{p.missions.length} missions</span>
          </button>
          {openProject === i && (
            <div className="space-y-1 ml-5 animate-in fade-in slide-in-from-top-1" style={{ animationDuration: "200ms" }}>
              {p.missions.map((m, j) => (
                <div key={j} className="flex items-center gap-2 text-xs text-gray-700 bg-white border border-gray-100 rounded px-2.5 py-1.5">
                  <Target className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                  <span>Mission {i + 1}.{j + 1}: {m}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MagConceptionTaches() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = [setTimeout(() => setStep(1), 300), setTimeout(() => setStep(2), 700)];
    return () => t.forEach(clearTimeout);
  }, []);
  const taskGroups = [
    { mission: "Landing pages témoignages", tasks: ["Rédiger 5 cas clients", "Design template témoignage", "Intégrer au site web", "A/B test des CTAs"] },
    { mission: "Calendrier éditorial Q2", tasks: ["Définir 12 thèmes", "Rédiger 4 posts/semaine", "Planifier dans l'outil"] },
  ];
  return (
    <div className="space-y-3">
      <div className={cn("flex items-center gap-2 transition-all duration-500", step >= 1 ? "opacity-100" : "opacity-0")}>
        <div className="bg-yellow-100 rounded-full px-2.5 py-0.5">
          <span className="text-[10px] font-bold text-yellow-700">27 tâches atomiques</span>
        </div>
        <span className="text-[10px] text-gray-400">dérivées de 9 missions</span>
      </div>
      {taskGroups.map((m, i) => (
        <div key={i} className={cn("bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 transition-all duration-500", step >= i + 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
          <p className="text-xs font-bold text-gray-600 mb-1.5">{m.mission}</p>
          <div className="space-y-1">
            {m.tasks.map((t, j) => (
              <div key={j} className="flex items-center gap-1.5 text-xs text-gray-600">
                <ListChecks className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MagConceptionEquipe() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = [setTimeout(() => setStep(1), 200), setTimeout(() => setStep(2), 500), setTimeout(() => setStep(3), 800), setTimeout(() => setStep(4), 1100)];
    return () => t.forEach(clearTimeout);
  }, []);
  const bots = [
    { code: "CEOB", name: "CarlOS", role: "Coordination", color: "bg-blue-50 border-blue-200" },
    { code: "CMOB", name: "Mathilde", role: "Marketing", color: "bg-pink-50 border-pink-200" },
    { code: "CFOB", name: "Frank", role: "Budget", color: "bg-emerald-50 border-emerald-200" },
    { code: "CTOB", name: "Tim", role: "Tech", color: "bg-cyan-50 border-cyan-200" },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {bots.map((b, i) => (
          <div key={b.code} className={cn("flex items-center gap-2 rounded-lg px-2.5 py-2.5 border transition-all duration-500", b.color, step >= i + 1 ? "opacity-100 scale-100" : "opacity-0 scale-95")}>
            <BotAvatar code={b.code} size="sm" />
            <div>
              <p className="text-xs font-bold text-gray-800">{b.name}</p>
              <p className="text-[10px] text-gray-500">{b.role}</p>
            </div>
            {step >= i + 1 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto" />}
          </div>
        ))}
      </div>
      <div className={cn("transition-all duration-500", step >= 4 ? "opacity-100" : "opacity-0")}>
        <div className="flex items-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg px-2.5 py-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <Plus className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400">Ajouter un membre humain</p>
        </div>
      </div>
    </div>
  );
}

function MagConceptionBudget() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = [setTimeout(() => setStep(1), 300), setTimeout(() => setStep(2), 700), setTimeout(() => setStep(3), 1000)];
    return () => t.forEach(clearTimeout);
  }, []);
  return (
    <div className="space-y-3">
      <div className={cn("grid grid-cols-2 gap-2 transition-all duration-500", step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-3 text-center">
          <p className="text-xl font-extrabold text-yellow-700">3,800$</p>
          <p className="text-[10px] text-yellow-600">/mois budget total</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-3 text-center">
          <p className="text-xl font-extrabold text-emerald-700">3.6x</p>
          <p className="text-[10px] text-emerald-600">ROI projeté</p>
        </div>
      </div>
      <div className={cn("transition-all duration-500", step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2.5">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Répartition par projet</p>
          {[
            { label: "Referral Program", amount: "1,200$/mois", pct: 32 },
            { label: "Content LinkedIn", amount: "2,600$/mois", pct: 68 },
          ].map((r, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="text-gray-600">{r.label}</span>
                <span className="font-bold text-gray-800">{r.amount}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full bg-yellow-400 rounded-full transition-all duration-1000", step >= 2 ? "" : "!w-0")} style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={cn("transition-all duration-500", step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-3 text-xs">
          <BarChart3 className="h-4 w-4 text-blue-500 shrink-0" />
          <div>
            <span className="font-bold text-blue-700">Payback: 4.2 mois</span>
            <span className="text-blue-500 ml-2">— investissement récupéré avant fin Q2</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MagConceptionTimeline() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = [setTimeout(() => setStep(1), 300), setTimeout(() => setStep(2), 700), setTimeout(() => setStep(3), 1100)];
    return () => t.forEach(clearTimeout);
  }, []);
  const phases = [
    { phase: "Q2 — Avril-Juin", label: "Quick Wins", color: "bg-amber-100 text-amber-700 border-amber-200", items: ["Lancement programme referral", "Premiers posts LinkedIn", "Setup automatisations email"] },
    { phase: "Q3 — Juillet-Sept", label: "Scale", color: "bg-emerald-100 text-emerald-700 border-emerald-200", items: ["Premier webinar VITAA", "Scale content LinkedIn", "Analyse ROI et ajustements"] },
  ];
  return (
    <div className="space-y-3">
      {/* Timeline visual */}
      <div className={cn("flex items-center gap-2 transition-all duration-500", step >= 1 ? "opacity-100" : "opacity-0")}>
        <div className="flex-1 h-px bg-yellow-300" />
        {phases.map((p, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={cn("w-3 h-3 rounded-full", i === 0 ? "bg-amber-500" : "bg-emerald-500")} />
            <span className="text-[10px] font-bold text-gray-600">{p.label}</span>
            {i < phases.length - 1 && <div className="w-12 h-px bg-gray-300" />}
          </div>
        ))}
        <div className="flex-1 h-px bg-emerald-300" />
      </div>
      {/* Phase cards */}
      {phases.map((p, i) => (
        <div key={i} className={cn("bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 transition-all duration-500", step >= i + 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold border", p.color)}>{p.phase}</span>
          <div className="mt-2 space-y-1">
            {p.items.map((item, j) => (
              <div key={j} className="flex items-center gap-1.5 text-xs text-gray-700">
                <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ========== PHASE CONCEPTION V3 — right panel (même pattern que PhaseReflexion) ==========

export function PhaseConception({ stage, context, onStartExecution, onSelectDeliverable }: { stage: number; context: string | null; onStartExecution?: () => void; onSelectDeliverable?: (id: string) => void }) {
  const visibleSections = CONCEPTION_DOCFORGE_SECTIONS.filter(s => stage >= s.minStage);
  const visibleCount = visibleSections.length;
  const [activeSection, setActiveSection] = useState(1);
  const [validatedSections, setValidatedSections] = useState<Set<number>>(new Set());

  // Auto-avance vers la dernière section débloquée
  useEffect(() => {
    if (visibleSections.length > 0) {
      setActiveSection(visibleSections[visibleSections.length - 1].id);
    }
  }, [visibleCount]);

  const activeDef = CONCEPTION_DOCFORGE_SECTIONS.find(s => s.id === activeSection);
  const ActiveIcon = activeDef?.icon || Hammer;

  const handleValidate = (id: number) => {
    setValidatedSections(prev => { const next = new Set(prev); next.add(id); return next; });
  };

  // Map section id → contenu (MagConception* composants animés)
  const SECTION_CONTENT: Record<number, React.ReactNode> = {
    1: <MagConceptionVueEnsemble />,
    2: <MagConceptionObjectifs />,
    3: <MagConceptionProjets />,
    4: <MagConceptionMissions />,
    5: <MagConceptionTaches />,
    6: <MagConceptionEquipe />,
    7: <MagConceptionBudget />,
    8: <MagConceptionTimeline />,
  };

  // Status de la section
  const getSectionStatus = (id: number): DocForgeStatus => {
    if (validatedSections.has(id)) return "complete";
    const nextSection = CONCEPTION_DOCFORGE_SECTIONS.find(s => s.id === id + 1);
    if (!nextSection) return stage >= 5 ? "en-cours" : "en-cours";
    return stage >= nextSection.minStage ? "en-cours" : "en-cours";
  };

  const allValidated = validatedSections.size === CONCEPTION_DOCFORGE_SECTIONS.length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">
      {stage < 0 ? (
        <div className="text-center py-12">
          <Hammer className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">La conception commence...</p>
          <p className="text-xs text-gray-300">Les sections apparaîtront au fur et à mesure de la structuration</p>
        </div>
      ) : (
        <>
          {/* 1. HERO COMPACT — icône + titre + progression (COPIE EXACTE pattern PhaseReflexion) */}
          <div className="relative w-full rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center px-6 py-4">
            <div className="absolute rounded-full blur-[100px] opacity-60 bg-yellow-100/70" style={{ top: '-50%', left: '-10%', width: '50%', height: '200%' }} />
            <div className="absolute rounded-full blur-[120px] opacity-50 bg-amber-100/40" style={{ bottom: '-50%', right: '10%', width: '60%', height: '200%' }} />
            <div className="absolute inset-0 bg-pattern-grid opacity-[0.35]" />
            <div className="relative z-20 flex items-center gap-4 w-full">
              {activeDef && (() => { const Icon = activeDef.icon; return <Icon className="h-7 w-7 text-yellow-500 shrink-0 stroke-[2]" />; })()}
              <h2 className="text-lg font-extrabold text-gray-900 shrink-0">{activeDef ? `${activeDef.id}. ${activeDef.title}` : "Conception du chantier"}</h2>
              <div className="flex-1" />
              <span className="text-xs font-bold text-gray-900 shrink-0">Étape {visibleCount} de {CONCEPTION_DOCFORGE_SECTIONS.length}</span>
              <div className="w-28 h-2 bg-yellow-100 rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${(visibleCount / CONCEPTION_DOCFORGE_SECTIONS.length) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* 2. SIDEBAR SF + CONTENU — UNE section à la fois (pattern DocForge) */}
          <div className="flex gap-4">
            {/* TOC sidebar — SF.sidebarW */}
            <div className={SF.sidebarW}>
              {CONCEPTION_DOCFORGE_SECTIONS.map(s => {
                const unlocked = stage >= s.minStage;
                const isActive = activeSection === s.id;
                const validated = validatedSections.has(s.id);
                return (
                  <button key={s.id} onClick={() => unlocked && setActiveSection(s.id)}
                    className={cn(SF.btnBase,
                      isActive && unlocked ? SF.btnActive : SF.btnInactive,
                      !unlocked && "opacity-40 cursor-default"
                    )}>
                    {unlocked
                      ? <s.icon className={isActive ? SF.iconActive : SF.iconInactive} />
                      : <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                    }
                    <span className={isActive && unlocked ? SF.labelActive : SF.labelInactive}>{s.id}. {s.title}</span>
                    {unlocked && (
                      <span className={cn("text-[10px] px-1 py-0.5 rounded-full font-medium",
                        validated ? "bg-emerald-100 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {validated ? "✓" : "…"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content — UNE SEULE section + validation buttons */}
            <div className={SF.content}>
              {stage >= (CONCEPTION_DOCFORGE_SECTIONS.find(s => s.id === activeSection)?.minStage ?? 999) && (
                <DocForgeBlock index={activeSection} title={activeDef?.title || ""} icon={ActiveIcon} status={getSectionStatus(activeSection)}>
                  {SECTION_CONTENT[activeSection]}
                  {/* Validation buttons — Rechallenger / Ajuster / Valider */}
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button type="button" className="text-xs text-gray-500 hover:text-orange-700 font-medium cursor-pointer flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2.5 py-1 hover:bg-orange-50">
                      <AlertTriangle className="h-3.5 w-3.5" /> Rechallenger
                    </button>
                    <button type="button" className="text-xs text-gray-500 hover:text-amber-700 font-medium cursor-pointer flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2.5 py-1 hover:bg-amber-50">
                      <RefreshCw className="h-3.5 w-3.5" /> Ajuster
                    </button>
                    {!validatedSections.has(activeSection) && (
                      <button type="button" onClick={() => handleValidate(activeSection)}
                        className="text-xs text-emerald-700 font-medium cursor-pointer flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 hover:bg-emerald-100">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Valider ✓
                      </button>
                    )}
                    {validatedSections.has(activeSection) && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 ml-auto">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Section validée
                      </span>
                    )}
                  </div>
                </DocForgeBlock>
              )}

              {/* Validation counter */}
              {visibleCount === CONCEPTION_DOCFORGE_SECTIONS.length && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {CONCEPTION_DOCFORGE_SECTIONS.map(s => (
                      <div key={s.id} className={cn("w-2.5 h-2.5 rounded-full transition-all", validatedSections.has(s.id) ? "bg-emerald-500" : "bg-gray-200")} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-700">{validatedSections.size}/{CONCEPTION_DOCFORGE_SECTIONS.length} sections validées</span>
                </div>
              )}

              {/* Conception des livrables (Level 2) — grille de types quand toutes les sections sont visibles */}
              {visibleCount === CONCEPTION_DOCFORGE_SECTIONS.length && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-yellow-200 bg-yellow-50/50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-yellow-200 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs font-bold text-gray-800">Concevoir les livrables du chantier</span>
                      <span className="text-[10px] text-gray-400 ml-auto">Niveau 2 — Éléments individuels</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3">
                      {[
                        { id: "document", icon: FileText, label: "Rapport stratégique", desc: "Cahier de projet, plan marketing", color: "border-amber-200 bg-amber-50 hover:bg-amber-100", text: "text-amber-700", iconColor: "text-amber-600" },
                        { id: "spreadsheet", icon: Table2, label: "Tableur & Données", desc: "Analyse, tableaux, dashboards", color: "border-teal-200 bg-teal-50 hover:bg-teal-100", text: "text-teal-700", iconColor: "text-teal-600" },
                        { id: "presentation", icon: Presentation, label: "Présentation", desc: "Pitch deck, slides CA, rapport au board", color: "border-blue-200 bg-blue-50 hover:bg-blue-100", text: "text-blue-700", iconColor: "text-blue-600" },
                        { id: "code", icon: Code2, label: "Code avec Tim", desc: "Scripts, automatisations, intégrations", color: "border-violet-200 bg-violet-50 hover:bg-violet-100", text: "text-violet-700", iconColor: "text-violet-600" },
                      ].map(type => (
                        <button key={type.id} type="button"
                          onClick={() => onSelectDeliverable?.(type.id)}
                          className={cn("border rounded-xl p-3 flex items-start gap-2.5 text-left transition-all cursor-pointer", type.color)}>
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/60")}>
                            <type.icon className={cn("h-4 w-4", type.iconColor)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs font-bold", type.text)}>{type.label}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{type.desc}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Transition vers Exécution — quand TOUTES les sections sont validées */}
              {allValidated && (
                <div className="mt-4">
                  <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="bg-[#00B4D8]/10 px-6 py-4">
                      <div className="flex items-center justify-center gap-4 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <Hammer className="h-4 w-4 text-yellow-600 stroke-[2.5]" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 stroke-[2.5]" />
                        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                          <Rocket className="h-4 w-4 text-green-600 stroke-[2.5]" />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900 text-center">Chantier structuré — Prêt pour l'Exécution</p>
                      <p className="text-[10px] text-gray-500 mt-1 text-center">8 sections validées — 3 projets, 9 missions, 27 tâches</p>
                    </div>
                    <div className="px-6 py-3 flex gap-2 justify-center border-t border-gray-100">
                      <button type="button" onClick={onStartExecution} className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-gray-800">
                        Lancer l'Exécution
                      </button>
                      <button type="button" className="text-xs bg-white text-gray-700 px-4 py-2 rounded-lg font-bold border border-gray-200 cursor-pointer hover:bg-gray-50">
                        Exporter le plan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ========== LEVEL 2 — CONCEPTION DES LIVRABLES (Document, Tableur, Présentation, Code) ==========

// --- AnimBlock: progressive reveal wrapper ---
function AnimBlock({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className={cn("transition-all duration-500", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
      {children}
    </div>
  );
}

// --- LiveTerminalV3: character-by-character code typing ---
function LiveTerminalV3({ content, speed = 12 }: { content: string; speed?: number }) {
  const [chars, setChars] = useState(0);
  useEffect(() => { setChars(0); }, [content]);
  useEffect(() => {
    if (chars < content.length) {
      const nextChar = content[chars];
      const delay = nextChar === "\n" ? speed * 4 : speed;
      const timer = setTimeout(() => setChars(prev => prev + 1), delay);
      return () => clearTimeout(timer);
    }
  }, [chars, content.length, speed, content]);
  const done = chars >= content.length;
  return (
    <div className="bg-gray-950 rounded-lg overflow-hidden">
      <div className="px-3 py-1.5 flex items-center gap-2 border-b border-gray-800">
        <Terminal className="h-3.5 w-3.5 text-green-400" />
        <span className="text-[9px] font-bold text-green-300">Tim — Terminal</span>
        {!done && <div className="flex items-center gap-1.5 ml-auto"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /><span className="text-[8px] text-green-400/70">En cours...</span></div>}
        {done && <CheckCircle2 className="h-3.5 w-3.5 text-green-400 ml-auto" />}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>
      <pre className="p-3 text-[9px] leading-relaxed font-mono max-h-[280px] overflow-y-auto">
        <code className="text-green-400">{content.slice(0, chars)}</code>
        {!done && <span className="text-green-300 animate-pulse">{"\u2588"}</span>}
      </pre>
    </div>
  );
}

// --- L2 Theme configs ---
const L2_THEMES = {
  amber: { bgLight: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500", progressBg: "bg-amber-100", progressFill: "bg-amber-400", heroBlur1: "bg-amber-100/70", heroBlur2: "bg-yellow-100/40", iconColor: "text-amber-500", validBg: "bg-amber-50", validText: "text-amber-600", borderLeft: "border-amber-400", sectionBg: "bg-amber-50/50" },
  teal: { bgLight: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", dot: "bg-teal-500", progressBg: "bg-teal-100", progressFill: "bg-teal-400", heroBlur1: "bg-teal-100/70", heroBlur2: "bg-cyan-100/40", iconColor: "text-teal-500", validBg: "bg-teal-50", validText: "text-teal-600", borderLeft: "border-teal-400", sectionBg: "bg-teal-50/50" },
  blue: { bgLight: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500", progressBg: "bg-blue-100", progressFill: "bg-blue-400", heroBlur1: "bg-blue-100/70", heroBlur2: "bg-indigo-100/40", iconColor: "text-blue-500", validBg: "bg-blue-50", validText: "text-blue-600", borderLeft: "border-blue-400", sectionBg: "bg-blue-50/50" },
  violet: { bgLight: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", dot: "bg-violet-500", progressBg: "bg-violet-100", progressFill: "bg-violet-400", heroBlur1: "bg-violet-100/70", heroBlur2: "bg-purple-100/40", iconColor: "text-violet-500", validBg: "bg-violet-50", validText: "text-violet-600", borderLeft: "border-violet-400", sectionBg: "bg-violet-50/50" },
};

// --- L2 Section configs ---
const DOCUMENT_DOCFORGE_SECTIONS = [
  { id: 1, title: "Contexte", icon: FileText, minStage: 0 },
  { id: 2, title: "Objectifs SMART", icon: Target, minStage: 0 },
  { id: 3, title: "Strategie SWOT", icon: Shield, minStage: 1 },
  { id: 4, title: "Plan d'action", icon: Wrench, minStage: 1 },
  { id: 5, title: "Budget", icon: DollarSign, minStage: 2 },
  { id: 6, title: "Timeline", icon: Clock, minStage: 2 },
  { id: 7, title: "Indicateurs KPI", icon: BarChart3, minStage: 3 },
];
const TABLEUR_DOCFORGE_SECTIONS = [
  { id: 1, title: "Structure du tableur", icon: Table2, minStage: 0 },
  { id: 2, title: "Donnees de reference", icon: Database, minStage: 0 },
  { id: 3, title: "Projections mensuelles", icon: TrendingUp, minStage: 1 },
  { id: 4, title: "Formules & Calculs", icon: ListChecks, minStage: 1 },
  { id: 5, title: "Graphiques & Tendances", icon: LineChart, minStage: 2 },
  { id: 6, title: "Export & Partage", icon: ArrowRight, minStage: 2 },
];
const PRESENTATION_DOCFORGE_SECTIONS = [
  { id: 1, title: "Slide \u2014 Enjeu", icon: AlertTriangle, minStage: 0 },
  { id: 2, title: "Slide \u2014 Strategie", icon: Compass, minStage: 0 },
  { id: 3, title: "Slide \u2014 Budget & ROI", icon: DollarSign, minStage: 1 },
  { id: 4, title: "Slide \u2014 Timeline", icon: Calendar, minStage: 1 },
  { id: 5, title: "Design & Visuels", icon: Palette, minStage: 2 },
  { id: 6, title: "Notes presentateur", icon: FileText, minStage: 2 },
];
const CODE_DOCFORGE_SECTIONS = [
  { id: 1, title: "Plan & Architecture", icon: FileText, minStage: 0 },
  { id: 2, title: "Code", icon: Code2, minStage: 1 },
  { id: 3, title: "Debug", icon: Bug, minStage: 2 },
  { id: 4, title: "Tests", icon: FlaskConical, minStage: 3 },
  { id: 5, title: "Deploiement", icon: Rocket, minStage: 4 },
];

// --- Tim code strings (V3 enhanced) ---
const TIM_CODE_V3 = [
  "$ tim create ChatWidget.tsx",
  "[Tim] Analyzing requirements...",
  "[Tim] Creating component structure...",
  "",
  "import { useState, useEffect, useRef } from 'react';",
  "import DOMPurify from 'dompurify';",
  "",
  "interface ChatWidgetProps {",
  "  apiEndpoint: string;",
  "  botCode?: string;",
  "}",
  "",
  "export function ChatWidget({ apiEndpoint, botCode = 'CEOB' }: ChatWidgetProps) {",
  "  const [messages, setMessages] = useState<Message[]>([]);",
  "  const [sessionId, setSessionId] = useState<string | null>(null);",
  "  const [input, setInput] = useState('');",
  "  const [isStreaming, setIsStreaming] = useState(false);",
  "  const abortRef = useRef<AbortController | null>(null);",
  "",
  "  useEffect(() => {",
  "    const initSession = async () => {",
  "      const res = await fetch(`${apiEndpoint}/chat/init`, {",
  "        method: 'POST',",
  "        headers: { 'Content-Type': 'application/json' },",
  "        body: JSON.stringify({ botCode }),",
  "      });",
  "      const data = await res.json();",
  "      setSessionId(data.sessionId);",
  "    };",
  "    initSession();",
  "    return () => { abortRef.current?.abort(); };",
  "  }, [apiEndpoint, botCode]);",
  "",
  "  const sendMessage = async (text: string) => {",
  "    if (!sessionId || isStreaming) return;",
  "    setIsStreaming(true);",
  "    abortRef.current = new AbortController();",
  "    const sanitized = DOMPurify.sanitize(text);",
  "    // ... streaming + DOMPurify sanitization",
  "    setIsStreaming(false);",
  "  };",
  "",
  "  return <div className=\"chat-widget\">{ /* UI */ }</div>;",
  "}",
  "",
  "[Tim] Component created \u2014 42 lines",
  "[Tim] Integrating DOMPurify sanitizer...",
  "[Tim] Security patch applied",
  "[Tim] Adding rate limiter (5 init/min per fingerprint)...",
  "[Tim] Rate limiter added",
].join("\n");

const TIM_DEBUG_V3 = [
  "$ tim debug ChatWidget.tsx",
  "[Tim] Running static analysis...",
  "[Tim] Scanning 42 lines for issues...",
  "",
  "[WARN] Line 28: Timeout at 30s with no fallback message",
  "  \u2192 Fix: Adding fallback after 15s",
  "  \u2192 Applied: setTimeout(() => setFallback(true), 15000)",
  "",
  "[WARN] Line 35: useEffect cleanup missing on unmount",
  "  \u2192 Fix: Adding AbortController cleanup",
  "  \u2192 Applied: return () => abortRef.current?.abort()",
  "",
  "[Tim] Re-scanning...",
  "[Tim] 0 issues remaining",
  "[Tim] 2 bugs fixed \u2014 code is clean",
].join("\n");

const TIM_TEST_V3 = [
  "$ tim test ChatWidget.test.tsx",
  "Running 4 tests...",
  "",
  "  \u2713 test_init_session         25%   (12ms)",
  "  \u2713 test_send_message         50%   (8ms)",
  "  \u2713 test_stream_response      75%   (15ms)",
  "  \u2713 test_timeout_fallback     100%  (6ms)",
  "",
  "=================== 4 passed in 0.041s ===================",
  "All tests green!",
].join("\n");

// ========== MAG CONTENT — Document strategique (amber) ==========

function MagDocContexte() {
  return (
    <AnimBlock>
      <div className="border-l-[3px] border-amber-400 bg-amber-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-amber-700 mb-1 flex items-center gap-1.5">
          1. Contexte
          <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">depuis Analyse</span>
        </h4>
        <p className="text-[9px] text-gray-700 leading-relaxed">Chantier Marketing Q2 \u2014 Augmenter la visibilite d'Usine Bleue. Budget: 12K$/mois. CAC actuel: 780$. Sources: 65% bouche-a-oreille, 20% web, 15% salons.</p>
        <div className="mt-1 flex items-center gap-1.5 text-[9px] text-gray-400">
          <BotAvatar code="CEOB" size="sm" />
          <span>Pre-rempli depuis l'Analyse</span>
        </div>
      </div>
    </AnimBlock>
  );
}

function MagDocObjectifs() {
  return (
    <AnimBlock delay={100}>
      <div className="border-l-[3px] border-amber-400 bg-amber-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-amber-700 mb-1">2. Objectifs SMART</h4>
        <div className="space-y-1">
          {["Reduire le CAC de 780$ a 400$ d'ici fin Q3", "Augmenter la conversion web de 1.2% a 3% d'ici fin Q2", "Diversifier les sources: bouche-a-oreille < 40% d'ici Q4"].map((obj, i) => (
            <div key={i} className="flex items-center gap-2 text-[9px] text-gray-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>{obj}</span>
            </div>
          ))}
        </div>
      </div>
    </AnimBlock>
  );
}

function MagDocSwot() {
  const [expandedSwot, setExpandedSwot] = useState<string | null>(null);
  return (
    <AnimBlock delay={150}>
      <div className="border-l-[3px] border-amber-400 bg-amber-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-amber-700 mb-2">3. Matrice SWOT</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "forces", label: "Forces", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", content: "text-emerald-800" },
            { key: "faiblesses", label: "Faiblesses", bg: "bg-red-50", border: "border-red-200", text: "text-red-700", content: "text-red-800" },
            { key: "opportunites", label: "Opportunites", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", content: "text-blue-800" },
            { key: "menaces", label: "Menaces", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", content: "text-orange-800" },
          ].map(quad => (
            <div key={quad.key} className={cn("border rounded-lg px-2 py-1.5 cursor-pointer transition-all", quad.bg, quad.border, expandedSwot === quad.key ? "ring-2 ring-amber-300 shadow-md" : "hover:shadow-sm")} onClick={() => setExpandedSwot(expandedSwot === quad.key ? null : quad.key)}>
              <div className={cn("text-[9px] font-bold mb-1", quad.text)}>{quad.label}</div>
              {(SWOT_DATA as Record<string, string[]>)[quad.key].map((f: string, i: number) => (
                <div key={i} className={cn("text-[9px]", quad.content, expandedSwot === quad.key ? "" : i > 0 ? "hidden" : "")}>
                  {"\u2022"} {f}
                </div>
              ))}
              {expandedSwot !== quad.key && (SWOT_DATA as Record<string, string[]>)[quad.key].length > 1 && (
                <p className="text-[8px] text-gray-400 mt-0.5">+{(SWOT_DATA as Record<string, string[]>)[quad.key].length - 1} autres...</p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[9px] text-gray-400">
          <BotAvatar code="CSOB" size="sm" />
          <span>Simone (CSO) \u2014 analyse strategique</span>
        </div>
      </div>
    </AnimBlock>
  );
}

function MagDocPlanAction() {
  return (
    <AnimBlock delay={200}>
      <div className="border-l-[3px] border-amber-400 bg-amber-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-amber-700 mb-2">4. Plan d'action</h4>
        <div className="space-y-2">
          {GANTT_MILESTONES.map(m => (
            <div key={m.id} className="flex items-center gap-2">
              <BotAvatar code={m.bot} size="sm" />
              <div className="flex-1">
                <div className="text-[9px] font-medium text-gray-800">{m.label}</div>
                <div className="text-[9px] text-gray-500">{m.start} \u2192 {m.end}</div>
              </div>
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimBlock>
  );
}

function MagDocBudget() {
  return (
    <AnimBlock delay={100}>
      <div className="border-l-[3px] border-amber-400 bg-amber-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-amber-700 mb-2">5. Budget</h4>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-amber-50 border-b border-amber-200">
                {["Poste", "Mensuel", "Annuel", "%"].map(h => (
                  <th key={h} className="text-[9px] font-bold text-amber-800 px-2.5 py-1.5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BUDGET_ROWS.map((row, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="text-[9px] text-gray-700 px-2.5 py-1.5 font-medium">{row.poste}</td>
                  <td className="text-[9px] text-gray-700 px-2.5 py-1.5">{row.mensuel}</td>
                  <td className="text-[9px] text-gray-700 px-2.5 py-1.5">{row.annuel}</td>
                  <td className="text-[9px] px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${row.pct}%` }} />
                      </div>
                      <span className="text-gray-500">{row.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[9px] text-gray-400">
          <BotAvatar code="CFOB" size="sm" />
          <span>Frank (CFO) \u2014 Total: 3,800$/mois, ROI projete: 3.6x</span>
        </div>
      </div>
    </AnimBlock>
  );
}

function MagDocTimeline() {
  return (
    <AnimBlock delay={150}>
      <div className="border-l-[3px] border-amber-400 bg-amber-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-amber-700 mb-2">6. Timeline</h4>
        <div className="space-y-1.5">
          {[
            { phase: "Phase 1", range: "S1\u2013S4", label: "Referral + LinkedIn", color: "bg-amber-100 border-amber-300" },
            { phase: "Phase 2", range: "S5\u2013S10", label: "Chatbot + Nurturing", color: "bg-amber-50 border-amber-200" },
            { phase: "Phase 3", range: "S11\u2013S14", label: "Optimisation", color: "bg-yellow-50 border-yellow-200" },
          ].map(p => (
            <div key={p.phase} className={cn("border rounded-lg px-2.5 py-1.5 flex items-center gap-2", p.color)}>
              <span className="text-[9px] font-bold text-gray-700 w-14 shrink-0">{p.phase}</span>
              <span className="text-[9px] text-gray-500 w-14 shrink-0">{p.range}</span>
              <span className="text-[9px] text-gray-700">{p.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-gray-500 mt-1.5">Checkpoint S7 \u2014 revue mi-parcours avec l'equipe</p>
      </div>
    </AnimBlock>
  );
}

function MagDocIndicateurs() {
  return (
    <AnimBlock delay={200}>
      <div className="border-l-[3px] border-amber-400 bg-amber-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-amber-700 mb-2">7. Indicateurs KPI</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { kpi: "CAC", cible: "400$", actuel: "780$", trend: "-49%", good: true },
            { kpi: "Conversion web", cible: "3%", actuel: "1.2%", trend: "+150%", good: true },
            { kpi: "Part bouche-a-oreille", cible: "<40%", actuel: "65%", trend: "-38%", good: true },
            { kpi: "ROI marketing", cible: "3x+", actuel: "1.2x", trend: "+150%", good: true },
          ].map(k => (
            <div key={k.kpi} className="bg-white border border-gray-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-gray-800">{k.kpi}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-gray-500">Actuel: {k.actuel}</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
                <span className="text-[9px] font-bold text-emerald-600">Cible: {k.cible}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-600">{k.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimBlock>
  );
}

// ========== MAG CONTENT — Tableur & Donnees (teal) ==========

function MagTableurStructure() {
  return (
    <AnimBlock>
      <div className="border-l-[3px] border-teal-400 bg-teal-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-teal-700 mb-2">1. Structure du tableur</h4>
        <div className="space-y-1.5">
          {[
            { col: "Mois", type: "Texte", desc: "Avril \u2192 Juillet (Q2)" },
            { col: "Leads", type: "Nombre", desc: "Leads generes par canal" },
            { col: "CAC", type: "Devise", desc: "Cout d'acquisition client" },
            { col: "Conversion", type: "%", desc: "Taux de conversion web" },
            { col: "Revenue", type: "Devise", desc: "Revenu genere par cohorte" },
          ].map(c => (
            <div key={c.col} className="flex items-center gap-2 text-[9px]">
              <span className="font-bold text-teal-700 w-20 shrink-0">{c.col}</span>
              <span className="bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded text-[8px] font-medium w-12 text-center shrink-0">{c.type}</span>
              <span className="text-gray-600">{c.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </AnimBlock>
  );
}

function MagTableurDonnees() {
  return (
    <AnimBlock delay={100}>
      <div className="border-l-[3px] border-teal-400 bg-teal-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-teal-700 mb-2">2. Donnees de reference</h4>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-teal-50 border-b border-teal-200">
                {["Mois", "Leads", "CAC", "Conv.", "Revenue"].map(h => (
                  <th key={h} className="text-[9px] font-bold text-teal-800 px-2.5 py-1.5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLEUR_DATA.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-teal-50/30 transition-colors">
                  <td className="text-[9px] text-gray-700 px-2.5 py-1.5 font-medium">{row.mois}</td>
                  <td className="text-[9px] px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-700">{row.leads}</span>
                      <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(row.leads / 95) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="text-[9px] text-gray-700 px-2.5 py-1.5">{row.cac}</td>
                  <td className="text-[9px] text-gray-700 px-2.5 py-1.5">{row.conv}</td>
                  <td className="text-[9px] text-gray-700 px-2.5 py-1.5 font-medium">{row.rev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-gray-400">
          <BotAvatar code="CFOB" size="sm" />
          <span>Frank (CFO) \u2014 donnees historiques + projections</span>
        </div>
      </div>
    </AnimBlock>
  );
}

function MagTableurProjections() {
  return (
    <AnimBlock delay={150}>
      <div className="border-l-[3px] border-teal-400 bg-teal-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-teal-700 mb-2">3. Projections mensuelles</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Leads Q2", value: "280", delta: "+111%", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
            { label: "CAC moyen", value: "485$", delta: "-38%", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
            { label: "Revenue Q2", value: "182K$", delta: "+67%", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          ].map(t => (
            <div key={t.label} className={cn("border rounded-xl p-2.5 text-center", t.color)}>
              <p className="text-[9px] font-bold">{t.label}</p>
              <p className="text-sm font-extrabold">{t.value}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <TrendingUp className="h-3 w-3" />
                <span className="text-[9px] font-bold">{t.delta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimBlock>
  );
}

function MagTableurFormules() {
  return (
    <AnimBlock delay={200}>
      <div className="border-l-[3px] border-teal-400 bg-teal-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-teal-700 mb-2">4. Formules & Calculs</h4>
        <div className="space-y-1.5">
          {[
            { formula: "CAC = Budget / Leads", result: "12,000 / 45 = 267$" },
            { formula: "ROI = (Revenue - Budget) / Budget", result: "(182K - 45K) / 45K = 3.04x" },
            { formula: "Conv. = Clients / Leads \u00d7 100", result: "7 / 280 \u00d7 100 = 2.5%" },
            { formula: "LTV/CAC = LTV moyen / CAC", result: "2,400 / 485 = 4.95x" },
          ].map((f, i) => (
            <div key={i} className="bg-gray-900 rounded-lg px-3 py-1.5">
              <code className="text-[9px] text-teal-300 font-mono">{f.formula}</code>
              <code className="text-[9px] text-gray-400 font-mono ml-2">{"\u2192"} {f.result}</code>
            </div>
          ))}
        </div>
      </div>
    </AnimBlock>
  );
}

function MagTableurGraphiques() {
  return (
    <AnimBlock delay={100}>
      <div className="border-l-[3px] border-teal-400 bg-teal-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-teal-700 mb-2">5. Graphiques & Tendances</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Leads", trend: "+111%", dir: "up", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
            { label: "CAC", trend: "-46%", dir: "down", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
            { label: "Revenue", trend: "+111%", dir: "up", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          ].map(t => (
            <div key={t.label} className={cn("border rounded-xl p-2.5 text-center", t.color)}>
              <p className="text-[9px] font-bold">{t.label}</p>
              <p className="text-sm font-extrabold">{t.trend}</p>
              <TrendingUp className={cn("h-3.5 w-3.5 mx-auto mt-0.5", t.dir === "down" ? "rotate-180" : "")} />
            </div>
          ))}
        </div>
        <p className="text-[9px] text-gray-500 mt-1.5">Graphiques auto-generes depuis les donnees de reference</p>
      </div>
    </AnimBlock>
  );
}

function MagTableurExport() {
  return (
    <AnimBlock delay={150}>
      <div className="border-l-[3px] border-teal-400 bg-teal-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-teal-700 mb-2">6. Export & Partage</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { format: "CSV", desc: "Donnees brutes pour Excel/Sheets", icon: Table2 },
            { format: "PDF", desc: "Rapport avec graphiques integres", icon: FileText },
            { format: "Google Sheets", desc: "Partage live avec l'equipe", icon: Globe },
            { format: "Dashboard", desc: "Vue temps reel dans Brain Team", icon: BarChart3 },
          ].map(e => (
            <div key={e.format} className="bg-white border border-gray-200 rounded-lg p-2 flex items-center gap-2 cursor-pointer hover:border-teal-300 transition-colors">
              <e.icon className="h-4 w-4 text-teal-500 shrink-0" />
              <div>
                <p className="text-[9px] font-bold text-gray-800">{e.format}</p>
                <p className="text-[8px] text-gray-500">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimBlock>
  );
}

// ========== MAG CONTENT — Presentation (blue) ==========

function MagPresEnjeu() {
  return (
    <AnimBlock>
      <div className="border-l-[3px] border-blue-400 bg-blue-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-blue-700 mb-2">1. Slide \u2014 Enjeu</h4>
        <div className={cn("border-2 rounded-xl p-4", PRESENTATION_SLIDES[0].color)}>
          <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Slide 1/4</span>
          <h4 className="text-sm font-bold text-gray-900 mt-2 mb-2">{PRESENTATION_SLIDES[0].title}</h4>
          <div className="space-y-1.5">
            {PRESENTATION_SLIDES[0].bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-white/50 border border-dashed border-gray-300 rounded-lg p-3 text-center">
            <Image className="h-5 w-5 text-gray-300 mx-auto mb-1" />
            <p className="text-[8px] text-gray-400">Zone visuelle \u2014 graphique ou image</p>
          </div>
        </div>
      </div>
    </AnimBlock>
  );
}

function MagPresStrategie() {
  return (
    <AnimBlock delay={100}>
      <div className="border-l-[3px] border-blue-400 bg-blue-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-blue-700 mb-2">2. Slide \u2014 Strategie</h4>
        <div className={cn("border-2 rounded-xl p-4", PRESENTATION_SLIDES[1].color)}>
          <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Slide 2/4</span>
          <h4 className="text-sm font-bold text-gray-900 mt-2 mb-2">{PRESENTATION_SLIDES[1].title}</h4>
          <div className="space-y-1.5">
            {PRESENTATION_SLIDES[1].bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-gray-400">
          <BotAvatar code="CMOB" size="sm" />
          <span>Mathilde (CMO) \u2014 strategie marketing</span>
        </div>
      </div>
    </AnimBlock>
  );
}

function MagPresBudget() {
  return (
    <AnimBlock delay={150}>
      <div className="border-l-[3px] border-blue-400 bg-blue-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-blue-700 mb-2">3. Slide \u2014 Budget & ROI</h4>
        <div className={cn("border-2 rounded-xl p-4", PRESENTATION_SLIDES[2].color)}>
          <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Slide 3/4</span>
          <h4 className="text-sm font-bold text-gray-900 mt-2 mb-2">{PRESENTATION_SLIDES[2].title}</h4>
          <div className="space-y-1.5">
            {PRESENTATION_SLIDES[2].bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-gray-400">
          <BotAvatar code="CFOB" size="sm" />
          <span>Frank (CFO) \u2014 validation financiere</span>
        </div>
      </div>
    </AnimBlock>
  );
}

function MagPresTimeline() {
  return (
    <AnimBlock delay={200}>
      <div className="border-l-[3px] border-blue-400 bg-blue-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-blue-700 mb-2">4. Slide \u2014 Timeline</h4>
        <div className={cn("border-2 rounded-xl p-4", PRESENTATION_SLIDES[3].color)}>
          <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Slide 4/4</span>
          <h4 className="text-sm font-bold text-gray-900 mt-2 mb-2">{PRESENTATION_SLIDES[3].title}</h4>
          <div className="space-y-1.5">
            {PRESENTATION_SLIDES[3].bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimBlock>
  );
}

function MagPresDesign() {
  return (
    <AnimBlock delay={100}>
      <div className="border-l-[3px] border-blue-400 bg-blue-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-blue-700 mb-2">5. Design & Visuels</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Palette", desc: "Bleu Brain Team + accents amber", icon: Palette },
            { label: "Typographie", desc: "Inter / SF Pro \u2014 titres bold", icon: FileText },
            { label: "Graphiques", desc: "Bar charts + donuts + trends", icon: BarChart3 },
            { label: "Images", desc: "Photos equipe + produit live", icon: Image },
          ].map(d => (
            <div key={d.label} className="bg-white border border-gray-200 rounded-lg p-2 flex items-center gap-2">
              <d.icon className="h-4 w-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-[9px] font-bold text-gray-800">{d.label}</p>
                <p className="text-[8px] text-gray-500">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimBlock>
  );
}

function MagPresNotes() {
  return (
    <AnimBlock delay={150}>
      <div className="border-l-[3px] border-blue-400 bg-blue-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-blue-700 mb-2">6. Notes presentateur</h4>
        <div className="space-y-1.5">
          {[
            { slide: 1, note: "Ouvrir avec le chiffre choc: 780$ par lead. Laisser le silence s'installer." },
            { slide: 2, note: "Montrer le benchmark concurrence. Insister sur le programme referral comme quick win." },
            { slide: 3, note: "Utiliser la phrase: ROI 3.6x = chaque dollar investi rapporte 3.60$. Point mort mois 4." },
            { slide: 4, note: "Terminer avec la question: Qui dans l'equipe prend ownership du referral?" },
          ].map(n => (
            <div key={n.slide} className="bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
              <span className="text-[8px] font-bold text-blue-600">Slide {n.slide}</span>
              <p className="text-[9px] text-gray-700 mt-0.5">{n.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-gray-400">
          <BotAvatar code="CMOB" size="sm" />
          <span>Mathilde (CMO) \u2014 coaching presentation</span>
        </div>
      </div>
    </AnimBlock>
  );
}

// ========== MAG CONTENT — Code avec Tim (violet) ==========

function MagCodePlan() {
  return (
    <AnimBlock>
      <div className="border-l-[3px] border-violet-400 bg-violet-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-violet-700 mb-2">1. Plan & Architecture</h4>
        <div className="space-y-1.5">
          {[
            { step: "Composant React", desc: "ChatWidget.tsx \u2014 widget embeddable avec streaming" },
            { step: "Securite", desc: "DOMPurify + rate limiter + AbortController" },
            { step: "API", desc: "POST /chat/init + POST /chat/message (streaming SSE)" },
            { step: "Tests", desc: "4 tests unitaires: init, send, stream, timeout" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-[9px]">
              <span className="font-bold text-violet-600 bg-violet-100 w-5 h-5 rounded-full flex items-center justify-center text-[8px] shrink-0">{i + 1}</span>
              <div>
                <span className="font-medium text-gray-800">{s.step}</span>
                <span className="text-gray-500 ml-1">\u2014 {s.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[9px] text-gray-400">
          <BotAvatar code="CTOB" size="sm" />
          <span>Tim (CTO) \u2014 architecture validee</span>
        </div>
      </div>
    </AnimBlock>
  );
}

function MagCodeTerminal() {
  return (
    <AnimBlock delay={100}>
      <div className="border-l-[3px] border-violet-400 bg-violet-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-violet-700 mb-2">2. Code</h4>
        <LiveTerminalV3 content={TIM_CODE_V3} speed={8} />
      </div>
    </AnimBlock>
  );
}

function MagCodeDebug() {
  return (
    <AnimBlock delay={150}>
      <div className="border-l-[3px] border-violet-400 bg-violet-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-violet-700 mb-2">3. Debug</h4>
        <LiveTerminalV3 content={TIM_DEBUG_V3} speed={15} />
      </div>
    </AnimBlock>
  );
}

function MagCodeTests() {
  return (
    <AnimBlock delay={200}>
      <div className="border-l-[3px] border-violet-400 bg-violet-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-violet-700 mb-2">4. Tests</h4>
        <LiveTerminalV3 content={TIM_TEST_V3} speed={15} />
        <div className="mt-2 grid grid-cols-4 gap-2">
          {["Init", "Message", "Stream", "Timeout"].map(t => (
            <div key={t} className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 text-center">
              <p className="text-[9px] text-emerald-600 font-bold">{t}</p>
              <p className="text-[9px] font-bold text-emerald-800">PASSED</p>
            </div>
          ))}
        </div>
      </div>
    </AnimBlock>
  );
}

function MagCodeDeploy() {
  return (
    <AnimBlock delay={100}>
      <div className="border-l-[3px] border-violet-400 bg-violet-50/50 rounded-r-lg px-3 py-2">
        <h4 className="text-[9px] font-bold text-violet-700 mb-2">5. Deploiement</h4>
        <div className="space-y-1.5">
          {[
            { step: "Build", status: "done", detail: "vite build \u2014 0 erreurs, 42 lignes" },
            { step: "Securite", status: "done", detail: "DOMPurify + rate limit valides" },
            { step: "Staging", status: "done", detail: "dev.usinebleue.ai \u2014 test OK" },
            { step: "Production", status: "ready", detail: "app.usinebleue.ai \u2014 pret au deploy" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-[9px]">
              {s.status === "done" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <Rocket className="h-4 w-4 text-violet-500 shrink-0 animate-pulse" />
              )}
              <span className="font-medium text-gray-800 w-16 shrink-0">{s.step}</span>
              <span className="text-gray-500">{s.detail}</span>
            </div>
          ))}
        </div>
        <button type="button" className="mt-2 w-full bg-violet-600 text-white text-[10px] font-bold py-2 rounded-lg hover:bg-violet-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
          <Rocket className="h-3.5 w-3.5" /> Deployer en production
        </button>
      </div>
    </AnimBlock>
  );
}

// ========== GENERIC LIVRABLE LAYOUT — PhaseConceptionLivrable ==========

type L2Theme = typeof L2_THEMES.amber;
type L2Section = { id: number; title: string; icon: React.ElementType; minStage: number };

function PhaseConceptionLivrable({
  stage, onBack, theme, sections, icon: MainIcon, title, sectionContent,
}: {
  stage: number;
  onBack?: () => void;
  theme: L2Theme;
  sections: L2Section[];
  icon: React.ElementType;
  title: string;
  sectionContent: Record<number, React.ReactNode>;
}) {
  const [activeSection, setActiveSection] = useState(1);
  const [validatedSections, setValidatedSections] = useState<number[]>([]);

  const visibleSections = sections.filter(s => s.minStage <= stage);
  const allValidated = validatedSections.length === sections.length;

  // Auto-advance to last unlocked section
  useEffect(() => {
    const last = visibleSections[visibleSections.length - 1];
    if (last) setActiveSection(last.id);
  }, [visibleSections.length]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">
      {/* Retour */}
      {onBack && (
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-700 transition-colors cursor-pointer mb-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour au chantier
        </button>
      )}

      {/* Hero compact */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white px-5 py-4">
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-50" style={{ background: "currentColor" }} />
        <div className={cn("absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-30", theme.heroBlur1)} />
        <div className={cn("absolute -bottom-4 -left-4 w-16 h-16 rounded-full blur-xl opacity-20", theme.heroBlur2)} />
        <div className="relative flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", theme.bgLight, theme.border, "border")}>
            <MainIcon className={cn("h-5 w-5", theme.iconColor)} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">{visibleSections.length} / {sections.length} sections disponibles</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {sections.map(s => (
              <div key={s.id} className={cn("w-2 h-2 rounded-full transition-all",
                validatedSections.includes(s.id) ? "bg-emerald-500" :
                visibleSections.some(v => v.id === s.id) ? theme.dot :
                "bg-gray-200"
              )} />
            ))}
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className={cn("flex-1 h-1.5 rounded-full", theme.progressBg)}>
            <div className={cn("h-full rounded-full transition-all duration-500", theme.progressFill)} style={{ width: `${(validatedSections.length / sections.length) * 100}%` }} />
          </div>
          <span className="text-[9px] font-bold text-gray-500">{Math.round((validatedSections.length / sections.length) * 100)}%</span>
        </div>
      </div>

      {/* DocForge: sidebar + content */}
      <div className="flex gap-4">
        {/* Sidebar */}
        <div className={cn("shrink-0 space-y-1", SF.sidebarW)}>
          {sections.map(s => {
            const isVisible = visibleSections.some(v => v.id === s.id);
            const isActive = s.id === activeSection;
            const isValidated = validatedSections.includes(s.id);
            const Icon = s.icon;
            return (
              <button key={s.id} type="button" disabled={!isVisible}
                onClick={() => isVisible && setActiveSection(s.id)}
                className={cn(SF.btnBase,
                  isActive ? SF.btnActive :
                  isValidated ? "bg-emerald-50 text-emerald-700 font-medium" :
                  isVisible ? SF.btnInactive :
                  "text-gray-300 cursor-not-allowed"
                )}>
                {isValidated ? <CheckCircle2 className={cn(SF.iconSize, "text-emerald-500 shrink-0")} /> :
                 isActive ? <Icon className={cn(SF.iconSize, theme.iconColor, "shrink-0")} /> :
                 <div className={cn(SF.iconSize, "rounded-full border border-gray-300 shrink-0")} />}
                <span className="truncate">{s.id}. {s.title}</span>
              </button>
            );
          })}
          {/* Progress indicator */}
          <div className="mt-2 px-2">
            <div className={cn("h-1.5 rounded-full", theme.progressBg)}>
              <div className={cn("h-full rounded-full transition-all", theme.progressFill)} style={{ width: `${(validatedSections.length / sections.length) * 100}%` }} />
            </div>
            <span className="text-[9px] text-gray-500 mt-1 block">{validatedSections.length}/{sections.length} valides</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {visibleSections.map(s => (
            <div key={s.id} className={cn(s.id !== activeSection && "hidden")}>
              <DocForgeBlock>
                {sectionContent[s.id] || (
                  <div className={cn("border-l-[3px] rounded-r-lg px-3 py-4 text-center", theme.borderLeft, theme.sectionBg)}>
                    <s.icon className={cn("h-5 w-5 mx-auto mb-1", theme.iconColor)} />
                    <p className={cn("text-[10px] font-medium", theme.text)}>Section en cours de generation...</p>
                  </div>
                )}
              </DocForgeBlock>

              {/* Validate button */}
              {!validatedSections.includes(s.id) && (
                <button type="button" onClick={() => setValidatedSections(prev => [...prev, s.id])}
                  className={cn("mt-2 w-full border-2 border-dashed rounded-lg px-4 py-2 text-[10px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5", theme.border, theme.text, "hover:bg-opacity-50", theme.bgLight)}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Valider cette section
                </button>
              )}
            </div>
          ))}

          {/* Empty state */}
          {visibleSections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <MainIcon className="h-8 w-8" />
              <p className="text-xs font-medium">En attente des instructions...</p>
              <p className="text-[9px]">Parle a CarlOS dans le chat pour commencer</p>
            </div>
          )}
        </div>
      </div>

      {/* Completion card */}
      {allValidated && (
        <AnimBlock delay={300}>
          <div className={cn("border rounded-xl p-4 text-center", theme.bgLight, theme.border)}>
            <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-900">Livrable complet</p>
            <p className={cn("text-[10px] mt-1", theme.text)}>{sections.length} sections validees \u2014 pret pour export</p>
            <div className="mt-3 flex gap-2 justify-center">
              <button type="button" className="text-[10px] bg-gray-900 text-white px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-gray-800 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Exporter PDF
              </button>
              {onBack && (
                <button type="button" onClick={onBack} className="text-[10px] bg-white text-gray-700 px-4 py-2 rounded-lg font-bold border border-gray-300 cursor-pointer hover:bg-gray-50 flex items-center gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" /> Retour au chantier
                </button>
              )}
            </div>
          </div>
        </AnimBlock>
      )}
    </div>
  );
}

// ========== 4 EXPORTED WRAPPERS ==========

export function PhaseConceptionDocument({ stage, onBack }: { stage: number; onBack?: () => void }) {
  return (
    <PhaseConceptionLivrable stage={stage} onBack={onBack} theme={L2_THEMES.amber}
      sections={DOCUMENT_DOCFORGE_SECTIONS} icon={FileText} title="Rapport strategique \u2014 Marketing Q2"
      sectionContent={{
        1: <MagDocContexte />, 2: <MagDocObjectifs />, 3: <MagDocSwot />,
        4: <MagDocPlanAction />, 5: <MagDocBudget />, 6: <MagDocTimeline />,
        7: <MagDocIndicateurs />,
      }} />
  );
}

export function PhaseConceptionTableur({ stage, onBack }: { stage: number; onBack?: () => void }) {
  return (
    <PhaseConceptionLivrable stage={stage} onBack={onBack} theme={L2_THEMES.teal}
      sections={TABLEUR_DOCFORGE_SECTIONS} icon={Table2} title="Tableur de suivi \u2014 Projections Q2"
      sectionContent={{
        1: <MagTableurStructure />, 2: <MagTableurDonnees />, 3: <MagTableurProjections />,
        4: <MagTableurFormules />, 5: <MagTableurGraphiques />, 6: <MagTableurExport />,
      }} />
  );
}

export function PhaseConceptionPresentation({ stage, onBack }: { stage: number; onBack?: () => void }) {
  return (
    <PhaseConceptionLivrable stage={stage} onBack={onBack} theme={L2_THEMES.blue}
      sections={PRESENTATION_DOCFORGE_SECTIONS} icon={Presentation} title="Pitch Deck \u2014 Marketing Q2"
      sectionContent={{
        1: <MagPresEnjeu />, 2: <MagPresStrategie />, 3: <MagPresBudget />,
        4: <MagPresTimeline />, 5: <MagPresDesign />, 6: <MagPresNotes />,
      }} />
  );
}

export function PhaseConceptionCode({ stage, onBack }: { stage: number; onBack?: () => void }) {
  return (
    <PhaseConceptionLivrable stage={stage} onBack={onBack} theme={L2_THEMES.violet}
      sections={CODE_DOCFORGE_SECTIONS} icon={Code2} title="Tim Code \u2014 Chatbot AI Site Web"
      sectionContent={{
        1: <MagCodePlan />, 2: <MagCodeTerminal />, 3: <MagCodeDebug />,
        4: <MagCodeTests />, 5: <MagCodeDeploy />,
      }} />
  );
}

// ========== DELIVERABLE CONCEPTION CHAT ==========

const L2_CHAT_CONFIGS: Record<string, { bot: string; botName: string; messages: { from: string; text: string }[][] }> = {
  document: {
    bot: "CSOB", botName: "Simone (CSO)",
    messages: [
      [{ from: "bot", text: "On commence le rapport strategique. Je vais pre-remplir le contexte depuis ton analyse." }],
      [{ from: "bot", text: "Contexte et objectifs SMART integres. Je lance la matrice SWOT avec les donnees du chantier." }],
      [{ from: "bot", text: "SWOT et plan d'action valides. Frank va maintenant chiffrer le budget et la timeline." }],
      [{ from: "bot", text: "Budget et timeline integres. Derniere etape: les indicateurs KPI pour le suivi." }],
    ],
  },
  spreadsheet: {
    bot: "CFOB", botName: "Frank (CFO)",
    messages: [
      [{ from: "bot", text: "Je prepare le tableur de projections Q2. Structure et colonnes d'abord." }],
      [{ from: "bot", text: "Donnees de reference importees. Je calcule les projections mensuelles maintenant." }],
      [{ from: "bot", text: "Projections OK. J'ajoute les formules de calcul et les graphiques de tendances." }],
    ],
  },
  presentation: {
    bot: "CMOB", botName: "Mathilde (CMO)",
    messages: [
      [{ from: "bot", text: "On monte le pitch deck. Slide 1: l'enjeu marketing avec les chiffres chocs." }],
      [{ from: "bot", text: "Les 2 premieres slides sont pretes. On passe au budget et a la timeline." }],
      [{ from: "bot", text: "Slides completes! J'ajoute les recommandations design et les notes presentateur." }],
    ],
  },
  code: {
    bot: "CTOB", botName: "Tim (CTO)",
    messages: [
      [{ from: "bot", text: "Plan d'architecture valide. Je lance la creation du composant ChatWidget.tsx." }],
      [{ from: "bot", text: "Code genere. Je lance le debug automatique pour trouver les issues." }],
      [{ from: "bot", text: "2 bugs fixes. Je lance la suite de tests maintenant." }],
      [{ from: "bot", text: "4/4 tests green! Le composant est pret pour le deploiement." }],
      [{ from: "bot", text: "Deploiement pret. Build OK, securite validee, staging teste." }],
    ],
  },
};

export function DeliverableConceptionChat({ deliverable, stage, typed, setTyped, advance, onBack }: {
  deliverable: string;
  stage: number;
  typed: boolean;
  setTyped: (v: boolean) => void;
  advance: () => void;
  onBack?: () => void;
}) {
  const config = L2_CHAT_CONFIGS[deliverable];
  if (!config) return null;

  const visibleMessages = config.messages.slice(0, stage + 1);
  const allDone = stage >= config.messages.length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        {onBack && (
          <button type="button" onClick={onBack} className="text-[9px] text-gray-500 hover:text-gray-700 cursor-pointer flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Retour
          </button>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <BotAvatar code={config.bot} size="sm" />
          <span className="text-[9px] text-gray-500 font-medium">{config.botName}</span>
        </div>
      </div>

      {/* Messages */}
      {visibleMessages.map((group, gi) => (
        <div key={gi}>
          {group.map((msg, mi) => (
            <div key={mi} className="flex items-start gap-2 mb-2">
              <BotAvatar code={config.bot} size="sm" />
              <div className="bg-gray-100 rounded-xl px-3 py-2 max-w-[85%]">
                <p className="text-xs text-gray-700">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Continue button */}
      {!allDone && !typed && (
        <button type="button" onClick={() => { setTyped(true); advance(); }}
          className="w-full text-[10px] bg-gray-900 text-white py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5" /> Continuer
        </button>
      )}

      {/* Completion */}
      {allDone && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-center">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-[10px] font-bold text-emerald-700">Livrable genere avec succes</p>
          <p className="text-[9px] text-emerald-600 mt-0.5">Toutes les sections sont disponibles dans le workspace</p>
        </div>
      )}
    </div>
  );
}

// ========== MAG TRANSITION (legacy, kept for reference) ==========

function MagTransition() {
  return (
    <div className="py-4">
      <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300 rounded-xl px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <ArrowRight className="h-5 w-5 text-amber-600" />
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
            <Target className="h-5 w-5 text-white" />
          </div>
        </div>
        <p className="text-sm font-bold text-amber-800">Pret pour Creer</p>
        <p className="text-xs text-amber-600 mt-1">8 sections d'analyse sauvegardees \u2014 Phase Analyse completee</p>
        <div className="mt-4 flex gap-2 justify-center">
          <button className="text-xs bg-amber-600 text-white px-4 py-2 rounded-full font-bold cursor-pointer hover:bg-amber-700">Passer en mode Creer</button>
          <button className="text-xs bg-white text-amber-700 px-4 py-2 rounded-full font-bold border border-amber-300 cursor-pointer hover:bg-amber-50">Cristalliser d'abord</button>
        </div>
      </div>
    </div>
  );
}

// ========== REFLEXION MAGAZINE PAGE (right panel \u2014 stacked sections from SimPhaseReflexion) ==========

// ========== DOCFORGE BLOCK — wrapper generique pour chaque section du rapport ==========

type DocForgeStatus = "empty" | "en-cours" | "complete";

function DocForgeBlock({ children }: {
  index?: number; title?: string; icon?: React.ElementType; status?: DocForgeStatus;
  children: React.ReactNode; themeColor?: "orange" | "yellow";
}) {
  const [appeared, setAppeared] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAppeared(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div className={cn("transition-all duration-500",
      appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
    )}>
      {children}
    </div>
  );
}

// ========== REFLEXION DOCFORGE SECTIONS CONFIG ==========

const REFLEXION_DOCFORGE_SECTIONS: { id: number; title: string; icon: React.ElementType; minStage: number }[] = [
  { id: 1, title: "Diagnostic initial", icon: Stethoscope, minStage: 1 },
  { id: 2, title: "Brainstorm SCAMPER", icon: Lightbulb, minStage: 7 },
  { id: 3, title: "Synth\u00e8se brainstorm", icon: Layers, minStage: 10 },
  { id: 4, title: "Analyse 5 Pourquoi", icon: Search, minStage: 12 },
  { id: 5, title: "Deep Search", icon: Globe, minStage: 15 },
  { id: 6, title: "Synth\u00e8se recherche", icon: FileBarChart, minStage: 17 },
  { id: 7, title: "Challenge / D\u00e9fense", icon: Swords, minStage: 19 },
  { id: 8, title: "Pr\u00e9-rapport", icon: FileText, minStage: 22 },
];

function MagConclusions() {
  return (
    <div className="space-y-3">
      {[
        { rank: 1, title: "Programme Referral Clients", desc: "Quick win \u2014 ROI 4.2x, budget 1,200$/mois. Levier le bouche-\u00e0-oreille existant avec des incitatifs structur\u00e9s.", bot: "CFOB" },
        { rank: 2, title: "Content Marketing LinkedIn", desc: "Moyen terme \u2014 repositionner le messaging vers le ROI concret. Calendrier \u00e9ditorial Q2-Q3.", bot: "CMOB" },
        { rank: 3, title: "Webinaires VITAA Mensuels", desc: "Long terme \u2014 d\u00e9montrer l'IA en action. Premier webinar Q2, r\u00e9currence mensuelle Q3.", bot: "CEOB" },
      ].map(r => (
        <div key={r.rank} className="bg-orange-50/50 border border-orange-200 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold bg-orange-600 text-white w-5 h-5 rounded-full flex items-center justify-center">{r.rank}</span>
            <span className="text-xs font-bold text-gray-800">{r.title}</span>
            <BotAvatar code={r.bot} size="sm" />
          </div>
          <p className="text-[10px] text-gray-600 leading-relaxed ml-7">{r.desc}</p>
        </div>
      ))}
      {/* Vote des bots */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200 flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Vote equipe \u2014 Passage en Conception</span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-gray-200">
          {[
            { bot: "CFOB", name: "Frank (CFO)", vote: "GO", reason: "Budget aligne, ROI valide par Deep Search" },
            { bot: "CMOB", name: "Mathilde (CMO)", vote: "GO", reason: "Messaging pivot necessaire, timing Q2 ideal" },
            { bot: "CTOB", name: "Tim (CTO)", vote: "GO", reason: "Chatbot deployable en 3 semaines, stack validee" },
            { bot: "COOB", name: "Olivier (COO)", vote: "GO", reason: "Ressources disponibles, pas d'impact operations" },
          ].map(v => (
            <div key={v.bot} className="bg-white px-2.5 py-2 flex items-start gap-2">
              <BotAvatar code={v.bot} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-700">{v.name}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">{v.vote}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">{v.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget et KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-center">
          <p className="text-lg font-extrabold text-emerald-700">3,800$</p>
          <p className="text-[10px] text-emerald-600">/mois budget total</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center">
          <p className="text-lg font-extrabold text-blue-700">3.6x</p>
          <p className="text-[10px] text-blue-600">ROI projete</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-center">
          <p className="text-lg font-extrabold text-orange-700">12 sem</p>
          <p className="text-[10px] text-orange-600">deploiement complet</p>
        </div>
      </div>

      {/* Prochaines etapes */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <p className="text-xs font-bold text-gray-700 mb-1.5">Prochaines etapes</p>
        <div className="space-y-1">
          {[
            { step: "Cristalliser le rapport de reflexion", bot: "CEOB", done: true },
            { step: "Creer le chantier Marketing Q2-Q3", bot: "CEOB", done: false },
            { step: "Definir les 3 projets et missions", bot: "COOB", done: false },
            { step: "Assigner les bots responsables", bot: "CEOB", done: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {s.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />}
              <span className={s.done ? "text-gray-800 font-medium" : "text-gray-500"}>{s.step}</span>
              <BotAvatar code={s.bot} size="sm" />
              <span className={cn("text-[10px] px-1 py-0.5 rounded ml-auto", s.done ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400")}>{s.done ? "Pret" : "En attente"}</span>
            </div>
          ))}
        </div>
      </div>

      {crystallized ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 animate-in fade-in slide-in-from-top-1" style={{ animationDuration: "300ms" }}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-xs font-bold text-emerald-700">Document cristallisé — Phase Conception débloquée</p>
          </div>
          <p className="text-xs text-emerald-600">Rapport de réflexion sauvegardé avec les 8 sections complètes</p>
        </div>
      ) : crystallizing ? (
        <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="h-4 w-4 text-orange-600 animate-spin" />
            <p className="text-xs font-bold text-orange-700">Compilation en cours...</p>
          </div>
          <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: `${crystalProgress}%` }} />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => {
            setCrystallizing(true);
            let p = 0;
            const iv = setInterval(() => { p += 5; setCrystalProgress(p); if (p >= 100) { clearInterval(iv); setCrystallizing(false); setCrystallized(true); } }, 100);
          }}
            className="text-xs bg-orange-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-700 flex items-center gap-1.5"
          >Cristalliser le rapport</button>
          <button className="text-xs bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-50">Exporter en PDF</button>
          <button className="text-xs bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-orange-50">Partager avec l'equipe</button>
          <button className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-gray-50">Relancer l'analyse</button>
        </div>
      )}
    </div>
  );
}

export function PhaseReflexion({ stage, context, onStartConception }: { stage: number; context: string | null; onStartConception?: () => void }) {
  const visibleSections = REFLEXION_DOCFORGE_SECTIONS.filter(s => stage >= s.minStage);
  const visibleCount = visibleSections.length;
  const [activeSection, setActiveSection] = useState(1);

  // Auto-avance vers la dernière section débloquée
  useEffect(() => {
    if (visibleSections.length > 0) {
      setActiveSection(visibleSections[visibleSections.length - 1].id);
    }
  }, [visibleCount]);

  const activeDef = REFLEXION_DOCFORGE_SECTIONS.find(s => s.id === activeSection);
  const ActiveIcon = activeDef?.icon || Brain;

  // Map section id → contenu (Mag* composants existants)
  const SECTION_CONTENT: Record<number, React.ReactNode> = {
    1: <MagDiagnostic stage={stage} />,
    2: <MagBrainstorm />,
    3: <MagSyntheseBrainstorm />,
    4: <MagCinqPourquoi />,
    5: <MagDeepSearch />,
    6: <MagSyntheseRecherche />,
    7: <MagChallenge />,
    8: <MagPreRapport />,
  };

  // Status de la section
  const getSectionStatus = (id: number): DocForgeStatus => {
    const nextSection = REFLEXION_DOCFORGE_SECTIONS.find(s => s.id === id + 1);
    if (!nextSection) return stage >= 25 ? "complete" : "en-cours";
    return stage >= nextSection.minStage ? "complete" : "en-cours";
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">
      {stage < 1 ? (
        <div className="text-center py-12">
          <Brain className="h-8 w-8 text-orange-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Le diagnostic commence...</p>
          <p className="text-xs text-gray-300">Les sections apparaitront au fur et a mesure de l'analyse</p>
        </div>
      ) : (
        <>
          {/* 1. HERO COMPACT — icône + titre + progression sur UNE ligne */}
          <div className="relative w-full rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center px-6 py-4">
            <div className="absolute rounded-full blur-[100px] opacity-60 bg-orange-100/70" style={{ top: '-50%', left: '-10%', width: '50%', height: '200%' }} />
            <div className="absolute rounded-full blur-[120px] opacity-50 bg-amber-100/40" style={{ bottom: '-50%', right: '10%', width: '60%', height: '200%' }} />
            <div className="absolute inset-0 bg-pattern-grid opacity-[0.35]" />
            <div className="relative z-20 flex items-center gap-4 w-full">
              {activeDef && (() => { const Icon = activeDef.icon; return <Icon className="h-7 w-7 text-orange-500 shrink-0 stroke-[2]" />; })()}
              <h2 className="text-lg font-extrabold text-gray-900 shrink-0">{activeDef ? `${activeDef.id}. ${activeDef.title}` : "Session de réflexion"}</h2>
              <div className="flex-1" />
              <span className="text-xs font-bold text-gray-900 shrink-0">Étape {visibleCount} de {REFLEXION_DOCFORGE_SECTIONS.length}</span>
              <div className="w-28 h-2 bg-orange-100 rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${(visibleCount / REFLEXION_DOCFORGE_SECTIONS.length) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* 3. SIDEBAR SF + CONTENU — UNE section à la fois (pattern DocForge/Cockpit) */}
          <div className="flex gap-4">
            {/* TOC sidebar — SF.sidebarW, click = navigation */}
            <div className={SF.sidebarW}>
              {REFLEXION_DOCFORGE_SECTIONS.map(s => {
                const unlocked = stage >= s.minStage;
                const isActive = activeSection === s.id;
                return (
                  <button key={s.id} onClick={() => unlocked && setActiveSection(s.id)}
                    className={cn(SF.btnBase,
                      isActive && unlocked ? SF.btnActive : SF.btnInactive,
                      !unlocked && "opacity-40 cursor-default"
                    )}>
                    {unlocked
                      ? <s.icon className={isActive ? SF.iconActive : SF.iconInactive} />
                      : <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                    }
                    <span className={isActive && unlocked ? SF.labelActive : SF.labelInactive}>{s.id}. {s.title}</span>
                    {unlocked && (
                      <span className={cn("text-[10px] px-1 py-0.5 rounded-full font-medium", getSectionStatus(s.id) === "complete" ? "bg-emerald-100 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                        {getSectionStatus(s.id) === "complete" ? "✓" : "…"}
                      </span>
                    )}
                  </button>
                );
              })}
              {/* Actions retirées du sidebar — les vrais boutons d'action sont sous le contenu cristallisé dans le workspace */}
            </div>

            {/* Content — UNE SEULE section affichée (celle sélectionnée dans la sidebar) */}
            <div className={SF.content}>
              {stage >= (REFLEXION_DOCFORGE_SECTIONS.find(s => s.id === activeSection)?.minStage ?? 999) && (
                <DocForgeBlock
                  index={activeSection}
                  title={activeDef?.title || ""}
                  icon={ActiveIcon}
                  status={getSectionStatus(activeSection)}
                >
                  {SECTION_CONTENT[activeSection]}
                </DocForgeBlock>
              )}

              {/* Transition vers Conception — visible quand toutes les sections sont complétées */}
              {visibleCount === REFLEXION_DOCFORGE_SECTIONS.length && stage >= 25 && onStartConception && (
                <div className="mt-4">
                  <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="bg-[#00B4D8]/10 px-6 py-4">
                      <div className="flex items-center justify-center gap-4 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-orange-600 stroke-[2.5]" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 stroke-[2.5]" />
                        <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <Hammer className="h-4 w-4 text-yellow-600 stroke-[2.5]" />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900 text-center">Rapport complet — Prêt pour la Conception</p>
                      <p className="text-[10px] text-gray-500 mt-1 text-center">8 sections d'analyse sauvegardées</p>
                    </div>
                    <div className="px-6 py-3 flex gap-2 justify-center border-t border-gray-100">
                      <button onClick={onStartConception} className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-gray-800">
                        Passer en mode Conception
                      </button>
                      <button className="text-xs bg-white text-gray-700 px-4 py-2 rounded-lg font-bold border border-gray-200 cursor-pointer hover:bg-gray-50">
                        Cristalliser d'abord
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ========== CHANTIER DRILL-DOWN DATA ==========

export const CHANTIER_DRILLDOWN = [
  {
    name: "Transformation Numérique", bot: "CTOB", botName: "Tim", progress: 72, bar: "bg-blue-500",
    projets: [
      { name: "Site web corporatif", progress: 85, missions: ["Maquette V1", "Contenu rédactionnel", "Tests QA", "SEO technique"] },
      { name: "CRM intégration", progress: 45, missions: ["Audit besoins", "Migration données", "Formation équipe"] },
      { name: "Automatisation usine", progress: 60, missions: ["Capteurs IoT", "Dashboard temps réel", "Alertes automatisées"] },
    ],
  },
  {
    name: "Expansion Marché US", bot: "CSOB", botName: "Simone", progress: 45, bar: "bg-indigo-500",
    projets: [
      { name: "Étude de marché", progress: 90, missions: ["Analyse concurrence", "Segments cibles", "Positionnement prix"] },
      { name: "Partenariats distribution", progress: 30, missions: ["Prospection", "Négociations", "Contrats"] },
    ],
  },
  {
    name: "Optimisation Production", bot: "CPOB", botName: "Paco", progress: 88, bar: "bg-emerald-500",
    projets: [
      { name: "Ligne A — Lean", progress: 95, missions: ["5S implantation", "Kaizen sprint", "Mesure OEE"] },
      { name: "Maintenance prédictive", progress: 70, missions: ["Collecte données", "Modèle ML", "Alertes prédictives"] },
    ],
  },
];

export function ChantierDrillDown({ phase }: { phase: PhaseKey }) {
  const pc = PC[phase];
  const [openChantier, setOpenChantier] = useState(0);
  const [openProjet, setOpenProjet] = useState(0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
      {/* En-tete de phase */}
      <div className={cn("rounded-xl border overflow-hidden shadow-sm", pc.border)}>
        <div className={cn("flex items-center gap-3 px-4 py-3", pc.bg)}>
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", pc.dot)}>
            <pc.Icon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className={cn("text-sm font-bold", pc.text)}>{pc.label}</p>
            <p className="text-xs text-gray-500">
              {phase === "reflexion" ? "Chantiers en phase d'analyse — Brain Team actif" :
               phase === "creation" ? "Chantiers en conception — Plans et documents" :
               phase === "execution" ? "Chantiers en exécution — Protocole COMMAND actif" :
               "Mesure des résultats et apprentissages"}
            </p>
          </div>
        </div>
      </div>

      {/* Chantiers drill-down */}
      {CHANTIER_DRILLDOWN.map((ch, ci) => (
        <div key={ci} className={cn("rounded-xl border overflow-hidden shadow-sm bg-white", openChantier === ci ? "border-blue-200" : "border-gray-200")}>
          <button
            onClick={() => setOpenChantier(ci)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <BotAvatar code={ch.bot} size="sm" />
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-800 truncate">{ch.name}</span>
                <span className="text-xs text-gray-400">{ch.botName}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1 max-w-[200px]">
                <div className={cn("h-full rounded-full", ch.bar)} style={{ width: `${ch.progress}%` }} />
              </div>
            </div>
            <span className="text-xs font-bold text-gray-500">{ch.progress}%</span>
            <ChevronRight className={cn("h-4 w-4 text-gray-400 transition-transform", openChantier === ci && "rotate-90")} />
          </button>

          {openChantier === ci && (
            <div className="border-t border-gray-200">
              {ch.projets.map((proj, pi) => (
                <div key={pi} className="border-b border-gray-100 last:border-0">
                  <button
                    onClick={() => setOpenProjet(pi)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 pl-8 text-left cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Target className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span className="text-[11px] text-gray-700 font-medium truncate flex-1">{proj.name}</span>
                    <span className="text-xs text-gray-400">{proj.progress}%</span>
                    <ChevronRight className={cn("h-3.5 w-3.5 text-gray-300 transition-transform", openChantier === ci && openProjet === pi && "rotate-90")} />
                  </button>

                  {openProjet === pi && (
                    <div className="bg-gray-50/50">
                      {proj.missions.map((m, mi) => (
                        <div key={mi} className="flex items-center gap-2 px-4 py-2 pl-14 hover:bg-gray-100 transition-colors">
                          <FileText className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[11px] text-gray-600 flex-1">{m}</span>
                          {mi === 0 && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ========== OPERATIONS DRILL-DOWN (même pattern que ChantierDrillDown — CAPEX→OPEX) ==========

export const OPERATIONS_DRILLDOWN = [
  {
    name: "Gestion financière mensuelle", bot: "CFOB", botName: "Frank", regularity: 83, bar: "bg-emerald-500",
    cadence: "Mensuel", sla: "48h", chaleur: "couve" as const,
    processus: [
      {
        name: "Clôture comptable", regularity: 95, cadence: "Mensuel", sla: "24h",
        routines: [
          { name: "Rapprochement bancaire", status: "complete" as const, cadence: "Mensuel" },
          { name: "Écritures de régularisation", status: "en_cours" as const, cadence: "Mensuel" },
          { name: "Balance de vérification", status: "a-faire" as const, cadence: "Mensuel" },
        ],
      },
      {
        name: "Remises gouvernementales", regularity: 70, cadence: "Trimestriel", sla: "72h",
        routines: [
          { name: "Remise TPS/TVQ", status: "complete" as const, cadence: "Trimestriel" },
          { name: "Acomptes provisionnels", status: "a-faire" as const, cadence: "Trimestriel" },
        ],
      },
      {
        name: "Paie et avantages", regularity: 98, cadence: "Bi-mensuel", sla: "12h",
        routines: [
          { name: "Traitement paie", status: "complete" as const, cadence: "Bi-mensuel" },
          { name: "Remise déductions source", status: "complete" as const, cadence: "Mensuel" },
          { name: "Rapports CNESST", status: "a-faire" as const, cadence: "Trimestriel" },
        ],
      },
    ],
  },
  {
    name: "Maintenance préventive usine", bot: "CPOB", botName: "Paco", regularity: 91, bar: "bg-blue-500",
    cadence: "Hebdo", sla: "24h", chaleur: "stable" as const,
    processus: [
      {
        name: "Inspection équipements ligne A", regularity: 95, cadence: "Hebdo", sla: "8h",
        routines: [
          { name: "Vérification pression hydraulique", status: "complete" as const, cadence: "Hebdo" },
          { name: "Calibration capteurs température", status: "complete" as const, cadence: "Hebdo" },
          { name: "Lubrification points critiques", status: "en_cours" as const, cadence: "Hebdo" },
        ],
      },
      {
        name: "Audit qualité produits", regularity: 88, cadence: "Mensuel", sla: "48h",
        routines: [
          { name: "Échantillonnage lot", status: "complete" as const, cadence: "Mensuel" },
          { name: "Tests conformité", status: "a-faire" as const, cadence: "Mensuel" },
        ],
      },
    ],
  },
  {
    name: "Cycle de vente et pipeline", bot: "CROB", botName: "Rich", regularity: 72, bar: "bg-amber-500",
    cadence: "Hebdo", sla: "4h", chaleur: "brule" as const,
    processus: [
      {
        name: "Revue pipeline hebdo", regularity: 65, cadence: "Hebdo", sla: "2h",
        routines: [
          { name: "Mise à jour CRM", status: "en_cours" as const, cadence: "Hebdo" },
          { name: "Forecast ajustement", status: "a-faire" as const, cadence: "Hebdo" },
          { name: "Relances prioritaires", status: "a-faire" as const, cadence: "Hebdo" },
        ],
      },
      {
        name: "Rapport commissions", regularity: 80, cadence: "Mensuel", sla: "24h",
        routines: [
          { name: "Calcul commissions", status: "complete" as const, cadence: "Mensuel" },
          { name: "Validation manager", status: "a-faire" as const, cadence: "Mensuel" },
        ],
      },
    ],
  },
];

const CHALEUR_STYLE = {
  brule: { badge: "bg-red-100 text-red-700", label: "Brûle" },
  couve: { badge: "bg-amber-100 text-amber-700", label: "Couve" },
  stable: { badge: "bg-emerald-100 text-emerald-700", label: "Stable" },
};

const ROUTINE_STATUS = {
  complete: { Icon: CheckCircle2, color: "text-green-500" },
  en_cours: { Icon: Loader2, color: "text-amber-500" },
  "a-faire": { Icon: Target, color: "text-gray-400" },
};

export function OperationsDrillDown() {
  const [openOp, setOpenOp] = useState(0);
  const [openProc, setOpenProc] = useState(0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
      {/* En-tête — même pattern que ChantierDrillDown */}
      <div className="rounded-xl border overflow-hidden shadow-sm border-cyan-200">
        <div className="flex items-center gap-3 px-4 py-3 bg-cyan-50">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500">
            <Repeat className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-cyan-700">Opérations</p>
            <p className="text-xs text-gray-500">Processus récurrents — CAPEX transformé en OPEX</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700 font-medium">{OPERATIONS_DRILLDOWN.length} opérations</span>
          </div>
        </div>
      </div>

      {/* Opérations — même cards que chantiers */}
      {OPERATIONS_DRILLDOWN.map((op, oi) => {
        const ch = CHALEUR_STYLE[op.chaleur];
        return (
          <div key={oi} className={cn("rounded-xl border overflow-hidden shadow-sm bg-white", openOp === oi ? "border-cyan-200" : "border-gray-200")}>
            <button
              onClick={() => setOpenOp(oi)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <BotAvatar code={op.bot} size="sm" />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800 truncate">{op.name}</span>
                  <span className="text-xs text-gray-400">{op.botName}</span>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", ch.badge)}>{ch.label}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[160px] flex-1">
                    <div className={cn("h-full rounded-full", op.bar)} style={{ width: `${op.regularity}%` }} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Repeat className="h-3.5 w-3.5" />
                    <span>{op.cadence}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Timer className="h-3.5 w-3.5" />
                    <span>SLA {op.sla}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500">{op.regularity}%</span>
              <ChevronRight className={cn("h-4 w-4 text-gray-400 transition-transform", openOp === oi && "rotate-90")} />
            </button>

            {/* Processus (≡ Projets) — même drill-down */}
            {openOp === oi && (
              <div className="border-t border-gray-200">
                {op.processus.map((proc, pi) => (
                  <div key={pi} className="border-b border-gray-100 last:border-0">
                    <button
                      onClick={() => setOpenProc(pi)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 pl-8 text-left cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <FolderOpen className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span className="text-[11px] text-gray-700 font-medium truncate flex-1">{proc.name}</span>
                      <span className="text-[10px] text-gray-400 px-1 py-0.5 rounded bg-gray-100">{proc.cadence}</span>
                      <span className="text-xs text-gray-400">{proc.regularity}%</span>
                      <ChevronRight className={cn("h-3.5 w-3.5 text-gray-300 transition-transform", openOp === oi && openProc === pi && "rotate-90")} />
                    </button>

                    {/* Routines (≡ Missions) avec statut */}
                    {openProc === pi && (
                      <div className="bg-gray-50/50">
                        {proc.routines.map((r, ri) => {
                          const st = ROUTINE_STATUS[r.status];
                          return (
                            <div key={ri} className="flex items-center gap-2 px-4 py-2 pl-14 hover:bg-gray-100 transition-colors">
                              <st.Icon className={cn("h-3.5 w-3.5 shrink-0", st.color)} />
                              <span className={cn("text-[11px] flex-1", r.status === "complete" ? "text-gray-400 line-through" : "text-gray-600")}>{r.name}</span>
                              <span className="text-[10px] text-gray-400 px-1 py-0.5 rounded bg-gray-100">{r.cadence}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ========== ICON CATALOG V3 — Cristallisation officielle (audit 134 icônes, 206 fichiers) ==========

type IconEntry = { Icon: React.ElementType; label: string; usage: string; color?: string; files?: number };
type IconTier = {
  tier: string;
  tierColor: string;
  tierBg: string;
  tierDesc: string;
  sections: { title: string; icons: IconEntry[] }[];
};

const ICON_TIERS: IconTier[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // A. OFFICIELLES — Structure du Frame Amorcer V3 (3 zones + header)
  // Chaque icône = UN SEUL usage. Pas de doublons entre sections.
  // ═══════════════════════════════════════════════════════════════════════
  {
    tier: "OFFICIELLES",
    tierColor: "text-emerald-700",
    tierBg: "bg-emerald-50 border-emerald-200",
    tierDesc: "Icônes verrouillées du frame Brain Team. Une icône = un seul usage. Ne pas réutiliser ailleurs.",
    sections: [
      {
        title: "Header principal — Barre blanche Brain Team",
        icons: [
          { Icon: Palette, label: "Icônes", usage: "Ouvrir le catalogue d'icônes (ce panneau)", color: "text-gray-500" },
          { Icon: Settings, label: "Réglages", usage: "Configuration et préférences utilisateur", color: "text-gray-500" },
          { Icon: ShieldAlert, label: "Admin", usage: "Panneau d'administration", color: "text-red-600" },
        ],
      },
      {
        title: "Zone 1 — Tour de Contrôle (panneau gauche 280px)",
        icons: [
          { Icon: TowerControl, label: "Tour de contrôle", usage: "Header du panneau gauche — navigation et bots", color: "text-gray-700" },
          { Icon: Home, label: "Bureau", usage: "Tab Bureau — vue département", color: "text-gray-700" },
          { Icon: Atom, label: "Orbit⁹", usage: "Tab Orbit⁹ — réseau inter-entreprises", color: "text-teal-500" },
          { Icon: Bot, label: "Brain Team", usage: "Sub-tab — liste des 12 bots C-Level", color: "text-blue-600" },
          { Icon: Network, label: "Mes Cellules", usage: "Sub-tab — cellules de trisociation", color: "text-teal-500" },
          { Icon: ArrowRight, label: "Aller", usage: "Naviguer vers le département d'un bot", color: "text-blue-600" },
        ],
      },
      {
        title: "Tour de Contrôle — 8 boutons grille navigation",
        icons: [
          { Icon: Gauge, label: "Cockpit", usage: "Vue cockpit du département — KPIs et performance", color: "text-gray-600" },
          { Icon: Flame, label: "Chantiers", usage: "Chantiers stratégiques du département", color: "text-red-500" },
          { Icon: Video, label: "Conférence AI", usage: "Conférence vidéo avec les bots", color: "text-emerald-600" },
          { Icon: Calendar, label: "Agenda", usage: "Calendrier et événements", color: "text-cyan-500" },
          { Icon: Layers, label: "Blueprint", usage: "Document stratégique du département", color: "text-gray-700" },
          { Icon: Database, label: "Data Room", usage: "Données et registres", color: "text-gray-600" },
          { Icon: BookOpen, label: "Playbook Store", usage: "Bibliothèque de playbooks", color: "text-indigo-500" },
          { Icon: Atom, label: "Orbit9", usage: "Accès au réseau Orbit⁹", color: "text-teal-500" },
        ],
      },
      {
        title: "Tour de Contrôle — Menu Orbit⁹ (8 sections)",
        icons: [
          { Icon: Home, label: "Accueil", usage: "Page d'accueil sociale Orbit⁹", color: "text-gray-700" },
          { Icon: BookOpen, label: "Blueprint", usage: "Blueprint collaboration réseau", color: "text-indigo-500" },
          { Icon: Atom, label: "Cellules", usage: "Gestion des cellules de trisociation", color: "text-teal-500" },
          { Icon: Handshake, label: "Jumelage", usage: "Partenariats inter-entreprises", color: "text-emerald-500" },
          { Icon: Shield, label: "Gouvernance", usage: "Règles et gouvernance du réseau", color: "text-gray-600" },
          { Icon: Rocket, label: "Pionniers", usage: "Programme des premiers adopteurs", color: "text-green-500" },
          { Icon: Activity, label: "VITAA", usage: "Scoring 5 piliers (Vente, Idée, Temps, Argent, Actif)", color: "text-blue-500" },
          { Icon: UserCircle, label: "Mon profil", usage: "Profil utilisateur Orbit⁹", color: "text-gray-500" },
        ],
      },
      {
        title: "Zone 2 — Discussion (panneau central 500px)",
        icons: [
          { Icon: Phone, label: "Discussion vocale", usage: "Appel vocal LiveKit", color: "text-blue-600" },
          { Icon: Video, label: "Conférence vidéo", usage: "Vidéo Tavus/LiveKit", color: "text-emerald-600" },
          { Icon: Glasses, label: "Vision", usage: "Ray-Ban Meta / Vision Live", color: "text-cyan-600" },
          { Icon: Plus, label: "Ajouter", usage: "Menu pièces jointes et connecteurs", color: "text-gray-500" },
          { Icon: Send, label: "Envoyer", usage: "Soumettre le message", color: "text-blue-600" },
          { Icon: Paperclip, label: "Pièce jointe", usage: "Attacher un fichier", color: "text-gray-500" },
          { Icon: Globe, label: "Google Drive", usage: "Import depuis Drive", color: "text-amber-500" },
        ],
      },
      {
        title: "Zone 3 — Atelier (panneau droit flex-1) — 5 Actions AMORCER",
        icons: [
          { Icon: MessageCircle, label: "Discussion", usage: "Déclenche une discussion sur un point d'intérêt — action par défaut", color: "text-sky-500" },
          { Icon: Brain, label: "Réflexion", usage: "Déclenche la réflexion approfondie — techniques de brassage d'idées", color: "text-orange-500" },
          { Icon: Hammer, label: "Conception", usage: "Déclenche la structuration et planification", color: "text-yellow-500" },
          { Icon: Rocket, label: "Exécution", usage: "Déclenche le lancement et la production", color: "text-green-500" },
          { Icon: BarChart3, label: "Rétroaction", usage: "Déclenche le bilan et le feedback", color: "text-emerald-500" },
        ],
      },
      {
        title: "Atelier — 2 états d'alerte (automatiques)",
        icons: [
          { Icon: AlertTriangle, label: "Attention", usage: "Alerte bot sur une section cockpit — signal à traiter", color: "text-red-500" },
          { Icon: Scale, label: "Modération", usage: "Modération naturelle de l'utilisateur — arbitrage", color: "text-pink-500" },
        ],
      },
      {
        title: "Hiérarchie de travail — Entités drill-down",
        icons: [
          { Icon: Flame, label: "Chantier", usage: "Initiative stratégique — niveau le plus haut", color: "text-red-500" },
          { Icon: FolderOpen, label: "Projet", usage: "Projet regroupé sous un chantier", color: "text-blue-600" },
          { Icon: Target, label: "Mission", usage: "Mission assignée à un bot ou utilisateur", color: "text-green-600" },
          { Icon: ListChecks, label: "Tâche", usage: "Tâche élémentaire à compléter", color: "text-gray-600" },
        ],
      },
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════
  // B. SPÉCIALISÉES — Contextuelles au domaine
  // Icônes qui ne sont PAS dans la structure du frame mais dans le contenu
  // ═══════════════════════════════════════════════════════════════════════
  {
    tier: "SPÉCIALISÉES",
    tierColor: "text-amber-700",
    tierBg: "bg-amber-50 border-amber-200",
    tierDesc: "Icônes de contenu — départements, techniques de réflexion, finance. Pas dans la navigation du frame.",
    sections: [
      {
        title: "12 Bots C-Level — Icônes de département (une par bot, réservée)",
        icons: [
          { Icon: Crown, label: "CarlOS — CEO", usage: "Direction générale", color: "text-blue-600" },
          { Icon: Cpu, label: "Tim — CTO", usage: "Technologie", color: "text-violet-500" },
          { Icon: DollarSign, label: "Frank — CFO", usage: "Finances", color: "text-emerald-500" },
          { Icon: Megaphone, label: "Mathilde — CMO", usage: "Marketing (Palette dans grille playbooks)", color: "text-pink-500" },
          { Icon: Compass, label: "Simone — CSO", usage: "Stratégie", color: "text-red-500" },
          { Icon: Settings, label: "Olivier — COO", usage: "Opérations", color: "text-orange-500" },
          { Icon: Factory, label: "Paco — CPO", usage: "Usine / Production", color: "text-slate-500" },
          { Icon: Users, label: "Hélène — CHRO", usage: "Ressources Humaines", color: "text-cyan-500" },
          { Icon: Lightbulb, label: "Inès — CINO", usage: "Innovation (Sparkles dans grille playbooks)", color: "text-rose-500" },
          { Icon: TrendingUp, label: "Rich — CRO", usage: "Revenus", color: "text-amber-500" },
          { Icon: Scale, label: "Loulou — CLO", usage: "Juridique (Shield dans grille playbooks)", color: "text-indigo-500" },
          { Icon: ShieldCheck, label: "Sébastien — CISO", usage: "Sécurité", color: "text-zinc-500" },
        ],
      },
      {
        title: "Techniques de réflexion — Sous-modes dans la phase Réflexion",
        icons: [
          { Icon: Search, label: "Analyse", usage: "Analyse approfondie d'un sujet", color: "text-orange-400" },
          { Icon: Sparkles, label: "Brainstorm", usage: "Génération d'idées créatives", color: "text-orange-400" },
          { Icon: Crosshair, label: "Décision", usage: "Cadrage pour prise de décision", color: "text-orange-400" },
          { Icon: ShieldAlert, label: "Crise", usage: "Gestion de crise — cas spécial urgence", color: "text-red-600" },
          { Icon: Swords, label: "Débat", usage: "Argumentation contradictoire multi-bots", color: "text-orange-400" },
          { Icon: Eye, label: "Innovation", usage: "Exploration disruptive et veille", color: "text-orange-400" },
          { Icon: Brain, label: "Deep Resonance", usage: "Réflexion profonde avec tous les bots", color: "text-orange-600" },
        ],
      },
      {
        title: "Finance & Business",
        icons: [
          { Icon: DollarSign, label: "Revenus", usage: "Finance, budgets, KPI monétaires", color: "text-emerald-600" },
          { Icon: CreditCard, label: "Facturation", usage: "Paiements, abonnement", color: "text-gray-600" },
          { Icon: Coins, label: "Monnaie", usage: "Coûts, TimeTokens", color: "text-amber-500" },
          { Icon: PiggyBank, label: "Budget", usage: "Épargne, budget département", color: "text-emerald-500" },
          { Icon: Briefcase, label: "Business", usage: "Affaires, entreprise", color: "text-gray-600" },
          { Icon: Star, label: "Favoris", usage: "Évaluation, rating, préférence", color: "text-yellow-500" },
        ],
      },
      {
        title: "CTA — Actions dans les bulles de chat",
        icons: [
          { Icon: Copy, label: "Copier", usage: "Copier le message", color: "text-gray-500" },
          { Icon: Bookmark, label: "Cristalliser", usage: "Sauvegarder un message clé", color: "text-amber-500" },
          { Icon: ThumbsUp, label: "Accord", usage: "Réaction positive", color: "text-green-500" },
          { Icon: ThumbsDown, label: "Désaccord", usage: "Réaction négative", color: "text-red-400" },
        ],
      },
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════
  // C. UTILITAIRES — Chrome UI minimale + statuts
  // Icônes de navigation pure, pas de contenu. Le minimum nécessaire.
  // ═══════════════════════════════════════════════════════════════════════
  {
    tier: "UTILITAIRES",
    tierColor: "text-gray-600",
    tierBg: "bg-gray-50 border-gray-200",
    tierDesc: "Navigation et indicateurs de base. Le strict minimum — pas tout a besoin d'une icône.",
    sections: [
      {
        title: "Navigation",
        icons: [
          { Icon: ArrowLeft, label: "Retour", usage: "Navigation arrière, drill-down", color: "text-gray-400" },
          { Icon: ChevronRight, label: "Suivant", usage: "Breadcrumb, drill-down", color: "text-gray-400" },
          { Icon: ChevronDown, label: "Ouvrir", usage: "Accordion, dropdown", color: "text-gray-400" },
          { Icon: X, label: "Fermer", usage: "Dismiss, fermer", color: "text-gray-400" },
          { Icon: Search, label: "Recherche", usage: "Barre de recherche", color: "text-gray-500" },
        ],
      },
      {
        title: "Indicateurs",
        icons: [
          { Icon: CheckCircle2, label: "Succès", usage: "Complétion, validation", color: "text-green-500" },
          { Icon: TrendingUp, label: "Hausse", usage: "Croissance, progression", color: "text-green-500" },
          { Icon: TrendingDown, label: "Baisse", usage: "Déclin, alerte", color: "text-red-500" },
          { Icon: Clock, label: "Temps", usage: "Délai, en attente", color: "text-amber-500" },
          { Icon: Lock, label: "Bloqué", usage: "Accès fermé, meurt", color: "text-gray-400" },
        ],
      },
      {
        title: "Actions de contenu",
        icons: [
          { Icon: FileText, label: "Document", usage: "Fichiers, rapports", color: "text-indigo-600" },
          { Icon: Pencil, label: "Modifier", usage: "Édition", color: "text-gray-600" },
          { Icon: Play, label: "Démarrer", usage: "Lancer un playbook", color: "text-green-500" },
        ],
      },
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════
  // D. RÈGLES — Ce qui NE PREND PAS d'icône + Pool variable
  // Philosophie : moins d'icônes = moins de bruit. Texte suffit souvent.
  // ═══════════════════════════════════════════════════════════════════════
  {
    tier: "RÈGLES",
    tierColor: "text-blue-700",
    tierBg: "bg-blue-50 border-blue-200",
    tierDesc: "Pas tout a besoin d'une icône. Voici ce qui en prend et ce qui n'en prend PAS.",
    sections: [
      {
        title: "⛔ VERROUILLÉES — Ne JAMAIS réutiliser dans le contenu",
        icons: [
          { Icon: AlertTriangle, label: "Attention", usage: "RÉSERVÉ — alerte bot uniquement", color: "text-red-500" },
          { Icon: Scale, label: "Modération", usage: "RÉSERVÉ — état d'alerte uniquement", color: "text-pink-500" },
          { Icon: Target, label: "Mission", usage: "RÉSERVÉ — hiérarchie de travail", color: "text-green-600" },
          { Icon: Brain, label: "Réflexion", usage: "RÉSERVÉ — phase AMORCER", color: "text-orange-500" },
          { Icon: Rocket, label: "Exécution", usage: "RÉSERVÉ — phase AMORCER + Pionniers", color: "text-green-500" },
          { Icon: Crown, label: "CarlOS CEO", usage: "RÉSERVÉ — bot CEO", color: "text-blue-600" },
          { Icon: Cpu, label: "Tim CTO", usage: "RÉSERVÉ — bot CTO", color: "text-violet-500" },
          { Icon: Megaphone, label: "Mathilde CMO", usage: "RÉSERVÉ — bot CMO", color: "text-pink-500" },
          { Icon: Factory, label: "Paco CPO", usage: "RÉSERVÉ — bot CPO", color: "text-slate-500" },
          { Icon: Lightbulb, label: "Inès CINO", usage: "RÉSERVÉ — bot CINO", color: "text-rose-500" },
        ],
      },
      {
        title: "✅ Prend une icône — Éléments variables qui en ont BESOIN",
        icons: [
          { Icon: Users, label: "Départements (12)", usage: "Chaque bot a son icône dédiée (section B)", color: "text-gray-600" },
          { Icon: Activity, label: "Piliers VITAA (5)", usage: "V-I-T-A-A avec couleurs distinctes", color: "text-blue-500" },
          { Icon: FileText, label: "Types de docs (3-4)", usage: "Playbook, Blueprint, Rapport, Template", color: "text-indigo-500" },
        ],
      },
      {
        title: "❌ PAS d'icône — Le texte suffit",
        icons: [
          { Icon: X, label: "Sections internes", usage: "Les sections dans un Cockpit, Blueprint, Data Room — texte + numérotation", color: "text-gray-300" },
          { Icon: X, label: "Familles conférence", usage: "Les 15 familles ConferenceAI — texte suffit, pas 15 icônes", color: "text-gray-300" },
          { Icon: X, label: "Registres Data Room", usage: "Les 6-8 registres par département — texte suffit", color: "text-gray-300" },
          { Icon: X, label: "Catégories playbooks", usage: "Les catégories de playbooks — la couleur département suffit", color: "text-gray-300" },
          { Icon: X, label: "Sous-items de liste", usage: "Les éléments dans une liste — bullet + texte", color: "text-gray-300" },
          { Icon: X, label: "KPI individuels", usage: "Les KPIs dans les cockpits — la valeur parle d'elle-même", color: "text-gray-300" },
        ],
      },
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════
  // E. CONTENU VARIABLE — Banque d'icônes pour boxes et catégories
  // Ces icônes sont LIBRES — aucun conflit avec les officielles.
  // À utiliser dans: boxes cockpit, types playbooks, familles conférence.
  // ═══════════════════════════════════════════════════════════════════════
  {
    tier: "CONTENU VARIABLE",
    tierColor: "text-purple-700",
    tierBg: "bg-purple-50 border-purple-200",
    tierDesc: "Banque d'icônes libres pour les boxes cockpit, types de playbooks, familles conférence. Aucune ne duplique une icône officielle.",
    sections: [
      {
        title: "Pool libre — Disponibles pour boxes et catégories",
        icons: [
          { Icon: Bell, label: "Signaux", usage: "Notifications, alertes dans boxes cockpit", color: "text-amber-500" },
          { Icon: Award, label: "Performance", usage: "Objectifs, OKR, résultats atteints", color: "text-yellow-600" },
          { Icon: Star, label: "Évaluation", usage: "Rating, scoring, favoris", color: "text-yellow-500" },
          { Icon: Receipt, label: "Transactions", usage: "Facturation, achats, comptabilité", color: "text-gray-600" },
          { Icon: Stethoscope, label: "Diagnostic", usage: "Audit, évaluation, santé org.", color: "text-red-500" },
          { Icon: GraduationCap, label: "Formation", usage: "Coaching, apprentissage, certifications", color: "text-sky-600" },
          { Icon: Wrench, label: "Maintenance", usage: "Outils, réparation, configuration", color: "text-gray-500" },
          { Icon: Briefcase, label: "Affaires", usage: "Portfolio, contrats, projets business", color: "text-gray-600" },
          { Icon: Package, label: "Produits", usage: "Livraisons, stocks, fabrication", color: "text-orange-500" },
          { Icon: Newspaper, label: "Veille", usage: "Articles, nouvelles, tendances", color: "text-blue-500" },
          { Icon: PiggyBank, label: "Budget", usage: "Épargne, budget département", color: "text-emerald-500" },
          { Icon: CreditCard, label: "Paiements", usage: "Abonnements, transactions carte", color: "text-gray-600" },
          { Icon: Coins, label: "Monnaie", usage: "Coûts, TimeTokens, devise", color: "text-amber-500" },
          { Icon: Trophy, label: "Milestones", usage: "Récompenses, jalons, accomplissements", color: "text-yellow-600" },
          { Icon: Route, label: "Processus", usage: "Workflow, parcours, étapes", color: "text-blue-500" },
          { Icon: LineChart, label: "Analyses", usage: "Graphiques, courbes, tendances", color: "text-indigo-500" },
          { Icon: CalendarDays, label: "Planification", usage: "Horaires, échéances (≠ Agenda)", color: "text-cyan-500" },
          { Icon: FileBarChart, label: "Rapports", usage: "Rapports analytiques, bilans", color: "text-indigo-600" },
          { Icon: Radio, label: "Diffusion", usage: "Communication, annonces, podcast", color: "text-violet-500" },
          { Icon: Bug, label: "Problèmes", usage: "Bugs, incidents techniques", color: "text-red-400" },
        ],
      },
      {
        title: "✅ Conflits corrigés — Remplacements effectués dans le code",
        icons: [
          { Icon: Flame, label: "Chantier (playbook)", usage: "Était Layers (Blueprint) → corrigé en Flame (cohérent avec hiérarchie)", color: "text-green-500" },
          { Icon: Bell, label: "Signaux (cockpit)", usage: "Était AlertTriangle (Attention) → corrigé en Bell (notification)", color: "text-green-500" },
          { Icon: Award, label: "OKR (cockpit)", usage: "Était Target (Mission) → corrigé en Award (objectifs)", color: "text-green-500" },
          { Icon: Handshake, label: "Médiation (conférence)", usage: "Était Scale (Modération) → corrigé en Handshake", color: "text-green-500" },
          { Icon: Sparkles, label: "Idées VITAA + Créativité", usage: "Était Lightbulb (Inès CINO) → corrigé en Sparkles", color: "text-green-500" },
          { Icon: Cog, label: "Cognitif (playbook)", usage: "Était Brain (Réflexion) → corrigé en Cog", color: "text-green-500" },
          { Icon: User, label: "Comité/Contacts (cockpit)", usage: "Était Users (Membres) → corrigé en User (singulier)", color: "text-green-500" },
          { Icon: HardHat, label: "Verticaux (conférence)", usage: "Était Factory (Paco CPO) → corrigé en HardHat (industrie)", color: "text-green-500" },
          { Icon: Newspaper, label: "Campagnes (cockpit)", usage: "Était Megaphone (Mathilde CMO) → corrigé en Newspaper", color: "text-green-500" },
          { Icon: Route, label: "Personnel (conférence)", usage: "Était Compass (Simone CSO) → corrigé en Route (parcours)", color: "text-green-500" },
        ],
      },
    ],
  },
];

export function IconCatalog() {
  const totalIcons = ICON_TIERS.reduce((sum, t) => sum + t.sections.reduce((s, sec) => s + sec.icons.length, 0), 0);
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-5">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 shadow-sm">
        <p className="text-sm font-bold text-white">Catalogue d'icônes — Brain Team</p>
        <p className="text-xs text-white/70 mt-0.5">
          {totalIcons} icônes · {ICON_TIERS.length} niveaux · Frame Amorcer V3
        </p>
      </div>

      {ICON_TIERS.map((tier, ti) => (
        <div key={ti} className="space-y-3">
          {/* Tier header */}
          <div className={cn("rounded-lg border px-4 py-2.5", tier.tierBg)}>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-black tracking-wider uppercase", tier.tierColor)}>{tier.tier}</span>
              <span className="text-xs text-gray-500">·</span>
              <span className="text-xs text-gray-500">{tier.sections.reduce((s, sec) => s + sec.icons.length, 0)} icônes</span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">{tier.tierDesc}</p>
          </div>

          {/* Sections within tier */}
          {tier.sections.map((section, si) => (
            <div key={si} className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-bold text-gray-800">{section.title}</p>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {section.icons.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      item.color ? "bg-white border border-gray-200" : "bg-gray-100"
                    )}>
                      <item.Icon className={cn("h-4 w-4", item.color || "text-gray-700")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-gray-800 block">{item.label}</span>
                      <span className="text-xs text-gray-500 block truncate">{item.usage}</span>
                      {item.color && (
                        <span className="text-xs text-gray-400 font-mono block">{item.color.replace("text-", "")}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ========== ORBIT9 SECTION MENU (style Bureau > Département Direction — Carl vocal 13h25) ==========

function Orbit9SectionMenu({ activeSection, onSection }: { activeSection: Orbit9Tab; onSection: (s: Orbit9Tab) => void }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-100 bg-[#00B4D8]/10">
        <Atom className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
        <span className="text-[11px] font-bold text-gray-900">Réseau Orbit<sup className="text-[9px]">9</sup></span>
      </div>
      <div className="p-2 grid grid-cols-3 gap-1.5">
        {O9_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onSection(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer",
              activeSection === tab.key
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-700 border border-gray-200"
            )}
          >
            <tab.Icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ========== ORBIT9 CELLULES COMPACT — liste compacte dans le left panel (Carl vocal 13h48: "même structure que chantiers") ==========

function Orbit9CellulesCompact({ onSelect, selectedCellule }: { onSelect: (i: number) => void; selectedCellule: number | null }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 px-1">
        <Atom className="h-3.5 w-3.5 text-gray-900" />
        <span className="text-[11px] font-bold text-gray-700">Cellules</span>
        <span className="text-xs text-gray-400 ml-auto">{ORBIT9_CELLULES.length}</span>
      </div>
      {ORBIT9_CELLULES.map((cell, i) => {
        const ph = PC[cell.status as PhaseKey];
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-left transition-all cursor-pointer",
              selectedCellule === i
                ? "border-blue-200 bg-blue-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full shrink-0", ph?.dot || "bg-gray-400")} />
              <span className="text-xs font-medium text-gray-800 flex-1 truncate">{cell.name}</span>
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0",
                cell.type === "interne" ? "bg-gray-100 text-gray-600" : "bg-cyan-50 text-cyan-600"
              )}>
                {cell.type === "interne" ? "Int" : "Ext"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">{cell.members}/{cell.maxMembers}</span>
              </div>
              <div className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">{cell.sousCellules.length}</span>
              </div>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-400"
                  style={{ width: `${Math.round((cell.membres.reduce((s, m) => s + (m.vitaa.v + m.vitaa.i + m.vitaa.t) / 3, 0) / cell.membres.length) * 100)}%` }}
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ========== ORBIT9 CHAT — animé style feed réseau social (Carl vocal 13h25) ==========

function Orbit9Chat({ typed, setTyped, selectedCellule }: { typed: boolean; setTyped: (v: boolean) => void; selectedCellule: number | null }) {
  const [feedIndex, setFeedIndex] = useState(0);

  useEffect(() => {
    if (!typed) return;
    if (feedIndex >= ORBIT9_FEED.length) return;
    const timer = setTimeout(() => setFeedIndex(i => i + 1), 1800);
    return () => clearTimeout(timer);
  }, [typed, feedIndex]);

  const cellule = selectedCellule !== null ? ORBIT9_CELLULES[selectedCellule] : null;

  return (
    <>
      {/* CarlOS intro */}
      <SBubble code="CEOB">
        <TypewriterText
          text="Mode Orbit⁹ activé. Tu as 4 cellules: 3 internes et 1 collab avec MetalPro. Les Titans brûlent fort 🔥 — ton équipe principale est en feu. Voici le fil d'actualité de ton réseau."
          speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
        />
      </SBubble>

      {/* Animated feed — items appear one by one like tweets */}
      {typed && ORBIT9_FEED.slice(0, feedIndex).map((item, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 transition-all duration-500">
          <div className="flex items-start gap-2.5">
            {item.type === "bot" && (
              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-100">
                <BotAvatar code={item.code!} size="sm" />
              </div>
            )}
            {item.type === "humain" && (
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 ring-2 ring-emerald-50">
                <User className="h-3.5 w-3.5 text-emerald-600" />
              </div>
            )}
            {item.type === "bot-to-bot" && (
              <div className="flex -space-x-2 shrink-0">
                {(item as { codes: string[] }).codes.map((code: string) => (
                  <div key={code} className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-violet-50">
                    <BotAvatar code={code} size="sm" />
                  </div>
                ))}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={cn("text-[11px] font-bold",
                  item.type === "bot" ? "text-blue-700" :
                  item.type === "humain" ? "text-emerald-700" : "text-violet-700"
                )}>
                  {item.type === "bot" ? (BOT_COLORS[item.code!]?.name || item.code) :
                   item.type === "humain" ? (item as { name: string }).name : "Bot-to-Bot"}
                </span>
                <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium",
                  item.type === "bot" ? "bg-blue-50 text-blue-500" :
                  item.type === "humain" ? "bg-emerald-50 text-emerald-500" :
                  "bg-violet-50 text-violet-500"
                )}>
                  {item.type === "bot" ? "🤖 Bot" : item.type === "humain" ? "👤 Humain" : "🔗 B2B"}
                </span>
                <span className="text-xs text-gray-400 ml-auto">{item.time}</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{item.text}</p>
              {/* Engagement buttons */}
              <div className="flex items-center gap-3 mt-1.5">
                <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 cursor-pointer transition-colors">
                  <MessageSquare className="h-3.5 w-3.5" /> Répondre
                </button>
                <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors">
                  <Heart className="h-3.5 w-3.5" /> {i + 2}
                </button>
                <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-amber-500 cursor-pointer transition-colors">
                  <Bookmark className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Cellule context message */}
      {typed && cellule && (
        <SBubble code="CSOB">
          <p className="text-sm text-gray-700">
            <Atom className="h-3.5 w-3.5 inline text-blue-500 mr-1" />
            Cellule <strong className="text-gray-800">{cellule.name}</strong> — {cellule.members}/{cellule.maxMembers} membres.
            {" "}Phase: <strong>{PC[cellule.status as PhaseKey]?.label || cellule.status}</strong>
          </p>
        </SBubble>
      )}

      {/* Loading indicator while feed is still arriving */}
      {typed && feedIndex < ORBIT9_FEED.length && (
        <div className="flex items-center gap-2 px-3 py-2">
          <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin" />
          <span className="text-xs text-gray-400">Chargement du fil...</span>
        </div>
      )}
    </>
  );
}

// ========== MES CELLULES — Vue Observation (enrichie depuis CellulesPage.tsx + MonReseauView) ==========

export function MesCellules({ onSelect, activePhase }: { onSelect: (i: number) => void; activePhase?: PhaseKey }) {
  const totalMembres = ORBIT9_CELLULES.reduce((s, c) => s + c.members, 0);
  const maxTotal = ORBIT9_CELLULES.reduce((s, c) => s + c.maxMembers, 0);
  const avgPerCell = Math.round(totalMembres / ORBIT9_CELLULES.length);
  const getDiscount = (n: number) => n >= 9 ? 25 : n >= 7 ? 20 : n >= 5 ? 15 : n >= 3 ? 10 : 0;
  const discount = getDiscount(avgPerCell);
  const nextTier = avgPerCell < 3 ? 3 : avgPerCell < 5 ? 5 : avgPerCell < 7 ? 7 : avgPerCell < 9 ? 9 : 9;
  const connections = Math.floor(totalMembres * (totalMembres - 1) / 2);
  const economie = totalMembres * 450;
  const phCfg = activePhase ? PC[activePhase] : null;

  return (
    <div className="space-y-4">
      {/* Phase indicator */}
      {phCfg && (
        <div className="flex items-center gap-2">
          <phCfg.Icon className="h-3.5 w-3.5 text-blue-500" />
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", phCfg.badge)}>{phCfg.label}</span>
          <span className="text-xs text-gray-400">Vue d'ensemble du réseau et des cellules</span>
        </div>
      )}

      {/* Header pastel */}
      <div className="rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 bg-[#00B4D8]/10">
        <Atom className="h-5 w-5 text-gray-900 stroke-[2.5]" />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Mes Cellules</p>
          <p className="text-xs text-gray-500">{ORBIT9_CELLULES.length} cellules · {totalMembres}/{maxTotal} membres · {ORBIT9_CELLULES.filter(c => c.type === "interne").length} internes · {ORBIT9_CELLULES.filter(c => c.type === "externe").length} externe</p>
        </div>
      </div>

      {/* KPIs (Membres, Rabais, Connexions B2B, Économie) */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Membres", value: `${totalMembres}/${maxTotal}`, icon: Users, sub: `${maxTotal - totalMembres} places disponibles`, up: true },
          { label: "Rabais actif", value: `-${discount}%`, icon: DollarSign, sub: avgPerCell < 9 ? `Prochain: -${getDiscount(nextTier)}% à ${nextTier}` : "Maximum!", up: true },
          { label: "Connexions B2B", value: `${connections}`, icon: Network, sub: "Loi de Metcalfe: n(n-1)/2", up: true },
          { label: "Économie/mois", value: `${economie.toLocaleString()}$`, icon: TrendingUp, sub: "Collective pour le réseau", up: true },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <kpi.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">{kpi.label}</span>
            </div>
            <div className="px-4 py-3">
              <div className="text-2xl font-bold text-gray-800">{kpi.value}</div>
              <div className="text-xs text-gray-500">{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progression rabais de groupe */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <DollarSign className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Progression du rabais de groupe</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3">Plus vous avez de membres par cellule, plus le rabais collectif augmente. Le palier atteint ne redescend JAMAIS, même si des membres quittent.</p>
          <div className="flex items-center gap-1 mb-2">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <div key={n} className="flex-1 flex flex-col items-center">
                <div className={cn("w-full h-3.5 rounded-sm transition-all",
                  n <= avgPerCell ? "bg-emerald-500" : n <= avgPerCell + 1 ? "bg-emerald-200" : "bg-gray-100"
                )} />
                <span className="text-xs text-gray-400 mt-0.5">{n}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>0% (solo)</span>
            <span className="font-semibold text-emerald-600">← Moyenne: {avgPerCell} membres → -{discount}%</span>
            <span>-25% (9 max)</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              { seuil: "3+", pct: "10%", active: avgPerCell >= 3 },
              { seuil: "5+", pct: "15%", active: avgPerCell >= 5 },
              { seuil: "7+", pct: "20%", active: avgPerCell >= 7 },
              { seuil: "9", pct: "25%", active: avgPerCell >= 9 },
            ].map(tier => (
              <div key={tier.seuil} className={cn("text-center py-1.5 rounded-lg text-xs font-medium border",
                tier.active ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-400"
              )}>
                {tier.seuil} = -{tier.pct}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cellules cards — enrichies (B2B connexions + rabais par cellule) */}
      {ORBIT9_CELLULES.map((cell, i) => {
        const stDot = PC[cell.status as PhaseKey]?.dot || "bg-gray-400";
        const stLabel = PC[cell.status as PhaseKey]?.label || cell.status;
        const stBadge = PC[cell.status as PhaseKey]?.badge || "bg-gray-100 text-gray-700";
        const cellDiscount = getDiscount(cell.members);
        const cellConn = Math.floor(cell.members * (cell.members - 1) / 2);
        return (
          <button key={i} onClick={() => onSelect(i)} className="w-full rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer text-left">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Atom className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900 flex-1">{cell.name}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                cell.type === "interne" ? "bg-gray-100 text-gray-600" : "bg-cyan-100 text-cyan-700"
              )}>{cell.type === "interne" ? "Interne" : "Externe"}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1", stBadge)}>
                <span className={cn("w-2 h-2 rounded-full", stDot)} />
                {stLabel}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">{cell.members}/{cell.maxMembers}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">{cell.sousCellules.length} s-cellules</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Network className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">{cellConn} B2B</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-emerald-600 font-medium">-{cellDiscount}%</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {cell.membres.slice(0, 6).map((m, mi) => (
                  <div key={mi} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 ring-1 ring-white">{m.avatar}</div>
                ))}
                {cell.membres.length > 6 && <span className="text-xs text-gray-400 ml-1">+{cell.membres.length - 6}</span>}
                <div className="flex-1" />
                {cell.sousCellules.map(sc => (
                  <span key={sc} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{sc}</span>
                ))}
              </div>
            </div>
          </button>
        );
      })}

      {/* Performance des Cellules */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <BarChart3 className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Performance des Cellules</span>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500">Métriques de productivité et de collaboration par cellule. En mode Observation, ces données sont en lecture seule.</p>
          {[
            { cellule: "Les Titans", heuresSauvees: 42, livrables: "87%", roi: "2.4x", confiance: 92 },
            { cellule: "Escouade Ventes", heuresSauvees: 18, livrables: "94%", roi: "1.6x", confiance: 85 },
            { cellule: "Innovation Lab", heuresSauvees: 12, livrables: "100%", roi: "—", confiance: 78 },
            { cellule: "Collab MetalPro", heuresSauvees: 28, livrables: "91%", roi: "1.8x", confiance: 88 },
          ].map(cell => (
            <div key={cell.cellule} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-xs font-bold text-gray-800 mb-2">{cell.cellule}</div>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center"><div className="text-sm font-bold text-sky-600">{cell.heuresSauvees}h</div><div className="text-xs text-gray-500">Heures sauvées</div></div>
                <div className="text-center"><div className="text-sm font-bold text-emerald-600">{cell.livrables}</div><div className="text-xs text-gray-500">Livrables à temps</div></div>
                <div className="text-center"><div className="text-sm font-bold text-violet-600">{cell.roi}</div><div className="text-xs text-gray-500">ROI chantiers</div></div>
                <div className="text-center"><div className="text-sm font-bold text-orange-600">{cell.confiance}/100</div><div className="text-xs text-gray-500">Confiance</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meetings Cellule — LiveKit */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Video className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Meetings Cellule</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">LiveKit</span>
        </div>
        <div className="p-4 space-y-2">
          <p className="text-xs text-gray-500 mb-2">Meetings SUR la plateforme. CarlOS transcrit, détecte les tensions et génère les action items en temps réel.</p>
          {[
            { cellule: "Les Titans", date: "12 avril 14:00", participants: ["Carl F.", "Marie D.", "Jean-P. L."], sujet: "Revue Q1 + pipeline ventes", status: "planifie" as const },
            { cellule: "Collab MetalPro", date: "14 avril 10:00", participants: ["Carl F.", "Pierre G.", "François D."], sujet: "Kick-off projet robotique — specs & échéancier", status: "planifie" as const },
            { cellule: "Les Titans", date: "8 avril 14:00", participants: ["Carl F.", "Marie D.", "Luc T."], sujet: "Revue tech + roadmap Q2", status: "termine" as const },
          ].map(m => (
            <div key={m.date + m.cellule} className={cn("flex items-center gap-3 p-3 rounded-lg border",
              m.status === "termine" ? "bg-gray-50 border-gray-200" : "bg-[#00B4D8]/5 border-gray-200"
            )}>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                m.status === "termine" ? "bg-gray-100" : "bg-[#00B4D8]/10"
              )}>
                <Video className={cn("h-3.5 w-3.5", m.status === "termine" ? "text-gray-400" : "text-gray-700")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-gray-800">{m.cellule}</div>
                <div className="text-xs text-gray-600 truncate">{m.sujet}</div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {m.participants.map(p => (
                    <span key={p} className="text-xs bg-white text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">{p}</span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-gray-700">{m.date}</div>
                <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full",
                  m.status === "termine" ? "bg-gray-100 text-gray-500" : "bg-gray-100 text-gray-600"
                )}>{m.status === "termine" ? "Terminé" : "Planifié"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CarlOS Médiateur Proactif */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Bot className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">CarlOS — Médiateur Proactif</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">Futur</span>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500">CarlOS écoute les meetings entre membres d'une cellule, détecte les tensions en temps réel, intervient pour corriger les interactions et génère automatiquement les action items.</p>
          {[
            { text: "Détection: SoudurePlus a dit « on va essayer » — langage flou avec historique 2 retards/3. Intervention envoyée.", time: "Il y a 2h", Icon: AlertTriangle, color: "text-amber-500" },
            { text: "Action items générés du meeting du 8 avril: 4 tâches assignées automatiquement.", time: "Hier", Icon: CheckCircle2, color: "text-emerald-500" },
            { text: "Budget chantier MetalPro à 78% — recommandation: réviser scope avant dépassement.", time: "Il y a 3 jours", Icon: Bell, color: "text-red-500" },
          ].map((log, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 bg-violet-50/50 rounded-lg border border-violet-100">
              <log.Icon className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", log.color)} />
              <div className="flex-1">
                <p className="text-xs text-gray-700">{log.text}</p>
                <span className="text-xs text-gray-400">{log.time}</span>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Transcription live", desc: "Deepgram capte chaque mot en temps réel", Icon: Activity },
              { label: "Détection tensions", desc: "Analyse sémantique des engagements flous", Icon: AlertTriangle },
              { label: "Actions auto", desc: "Tâches assignées sans effort humain", Icon: CheckCircle2 },
            ].map(feat => (
              <div key={feat.label} className="p-2 bg-white rounded-lg border border-violet-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <feat.Icon className="h-3.5 w-3.5 text-violet-600" />
                  <span className="text-xs font-bold text-violet-800">{feat.label}</span>
                </div>
                <p className="text-xs text-gray-600">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Opportunités actives — Système Main Levée */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Handshake className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Opportunités actives</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">Système Main Levée</span>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500">Les opportunités sont attribuées au premier partenaire qualifié qui lève la main. En Observation, vous voyez les matchings en cours.</p>
          {[
            { besoin: "Robot soudage MIG/TIG automatisé", client: "MetalPro", score: 87, status: "active" as const, candidats: 3 },
            { besoin: "Cellule injection automatisée + vision qualité", client: "QC Plasturgie", score: 72, status: "scout" as const, candidats: 1 },
            { besoin: "Emballage automatisé ligne #3 — HACCP", client: "Alimentation Boréal", score: 91, status: "complete" as const, candidats: 2 },
          ].map((match, i) => (
            <div key={i} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-800">{match.besoin}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                  match.status === "complete" ? "bg-emerald-100 text-emerald-700" :
                  match.status === "scout" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                )}>{match.status === "complete" ? "Complété" : match.status === "scout" ? "Scout requis" : "Actif"}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>Client: {match.client}</span>
                <span>Score: <strong className="text-blue-600">{match.score}%</strong></span>
                <span>{match.candidats} candidat(s)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activité récente */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <RefreshCw className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Activité récente</span>
        </div>
        <div className="p-4 space-y-2">
          {[
            { time: "Il y a 1h", text: "Bot CTO d'AutomaTech a envoyé les specs du cobot à Bot CTO d'Usinage Précision", Icon: Network, color: "text-blue-600", bg: "bg-blue-100" },
            { time: "Il y a 3h", text: "Nouveau matching détecté: LogiFlow peut optimiser l'entrepôt de MetalPro", Icon: Search, color: "text-green-600", bg: "bg-green-100" },
            { time: "Hier", text: "Budget projet soudage mis à jour: 125K$ → 145K$ (ajout formation)", Icon: DollarSign, color: "text-amber-600", bg: "bg-amber-100" },
            { time: "2 jours", text: "Innovation Lab a complété la revue tech du prototype Alpha", Icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
          ].map((act, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", act.bg)}>
                <act.Icon className={cn("h-3.5 w-3.5", act.color)} />
              </div>
              <p className="text-xs text-gray-600 flex-1">{act.text}</p>
              <span className="text-xs text-gray-400 shrink-0">{act.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CarlOS Proactif */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-[#00B4D8]/10">
        <div className="p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold shrink-0">C</div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-900">CarlOS — Facilitateur de Cellule Proactif</h3>
            <p className="text-xs text-gray-600 mt-1 italic">"Carl, j'ai remarqué quelque chose. Tu travailles régulièrement avec Automation Plus, Acier Québec et PrécisionCNC. Si vous formiez une Cellule Orbit⁹, vos bots se coordonneraient et vous économiseriez TOUS 15%. Tu veux que je prépare les invitations?"</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== CELLULE DRILL-DOWN ==========

function CelluleDrillDown({ cellule, onBack }: { cellule: Cellule; onBack: () => void }) {
  const avgVitaa = {
    v: cellule.membres.reduce((s, m) => s + m.vitaa.v, 0) / cellule.membres.length,
    i: cellule.membres.reduce((s, m) => s + m.vitaa.i, 0) / cellule.membres.length,
    t: cellule.membres.reduce((s, m) => s + m.vitaa.t, 0) / cellule.membres.length,
    a1: cellule.membres.reduce((s, m) => s + m.vitaa.a1, 0) / cellule.membres.length,
    a2: cellule.membres.reduce((s, m) => s + m.vitaa.a2, 0) / cellule.membres.length,
  };
  const vit = avgVitaa.v * avgVitaa.i * avgVitaa.t;
  const formulaResult = Math.exp(vit);

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
        <ArrowLeft className="h-3.5 w-3.5" /> Retour aux cellules
      </button>

      <div className="rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 bg-[#00B4D8]/10">
        <Atom className="h-5 w-5 text-gray-900 stroke-[2.5]" />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">{cellule.name}</p>
          <p className="text-xs text-gray-500">{cellule.members} membres · {cellule.type}</p>
        </div>
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1",
          PC[cellule.status as PhaseKey]?.badge || "bg-gray-100 text-gray-700"
        )}>
          <span className={cn("w-2 h-2 rounded-full", PC[cellule.status as PhaseKey]?.dot || "bg-gray-400")} />
          {PC[cellule.status as PhaseKey]?.label || cellule.status}
        </span>
      </div>

      {/* VITAA collectif compact */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Activity className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Score VITAA collectif</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">e^(V×I×T) = {formulaResult.toFixed(2)}</span>
        </div>
        <div className="p-4 space-y-2">
          {[
            { label: "Vente", key: "v" as const, color: "bg-red-500" },
            { label: "Idée", key: "i" as const, color: "bg-blue-500" },
            { label: "Temps", key: "t" as const, color: "bg-amber-500" },
            { label: "Argent", key: "a1" as const, color: "bg-emerald-500" },
            { label: "Actif", key: "a2" as const, color: "bg-violet-500" },
          ].map(p => (
            <div key={p.key} className="flex items-center gap-3">
              <span className="text-[11px] text-gray-600 w-12 shrink-0">{p.label}</span>
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000", p.color)} style={{ width: `${avgVitaa[p.key] * 100}%` }} />
              </div>
              <span className="text-[11px] font-bold text-gray-700 w-8 text-right">{(avgVitaa[p.key] * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Membres */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Membres</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{cellule.members}</span>
        </div>
        <div className="divide-y divide-gray-100">
          {cellule.membres.map((m, i) => {
            const mvit = m.vitaa.v * m.vitaa.i * m.vitaa.t;
            return (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-700">
                  {m.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-800">{m.name}</span>
                    <span className="text-xs text-gray-400">{m.role}</span>
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {[
                      { label: "V", val: m.vitaa.v, color: "bg-red-400" },
                      { label: "I", val: m.vitaa.i, color: "bg-blue-400" },
                      { label: "T", val: m.vitaa.t, color: "bg-amber-400" },
                      { label: "A", val: m.vitaa.a1, color: "bg-emerald-400" },
                      { label: "A", val: m.vitaa.a2, color: "bg-violet-400" },
                    ].map((p, pi) => (
                      <div key={pi} className="flex items-center gap-0.5">
                        <span className="text-xs text-gray-400">{p.label}</span>
                        <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", p.color)} style={{ width: `${p.val * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <span className="text-xs font-mono text-gray-400">V×I×T={mvit.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sous-cellules */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Layers className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Sous-cellules</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{cellule.sousCellules.length}</span>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {cellule.sousCellules.map(sc => (
            <div key={sc} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
              <Atom className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-xs font-medium text-gray-700">{sc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== VITAA DASHBOARD ==========

export function VITAADashboard({ selectedCellule }: { selectedCellule: Cellule }) {
  const avg = {
    v: selectedCellule.membres.reduce((s, m) => s + m.vitaa.v, 0) / selectedCellule.membres.length,
    i: selectedCellule.membres.reduce((s, m) => s + m.vitaa.i, 0) / selectedCellule.membres.length,
    t: selectedCellule.membres.reduce((s, m) => s + m.vitaa.t, 0) / selectedCellule.membres.length,
    a1: selectedCellule.membres.reduce((s, m) => s + m.vitaa.a1, 0) / selectedCellule.membres.length,
    a2: selectedCellule.membres.reduce((s, m) => s + m.vitaa.a2, 0) / selectedCellule.membres.length,
  };
  const vit = avg.v * avg.i * avg.t;
  const formulaResult = Math.exp(vit);

  // Solo scores (first member as example)
  const solo = selectedCellule.membres[0]?.vitaa || { v: 0, i: 0, t: 0, a1: 0, a2: 0 };
  const soloVit = solo.v * solo.i * solo.t;

  const pillars = [
    { label: "Vente", short: "V", avg: avg.v, solo: solo.v, color: "bg-red-500", soloColor: "bg-red-300" },
    { label: "Idée", short: "I", avg: avg.i, solo: solo.i, color: "bg-blue-500", soloColor: "bg-blue-300" },
    { label: "Temps", short: "T", avg: avg.t, solo: solo.t, color: "bg-amber-500", soloColor: "bg-amber-300" },
    { label: "Argent", short: "A₁", avg: avg.a1, solo: solo.a1, color: "bg-emerald-500", soloColor: "bg-emerald-300" },
    { label: "Actif", short: "A₂", avg: avg.a2, solo: solo.a2, color: "bg-violet-500", soloColor: "bg-violet-300" },
  ];

  const fireStatus = selectedCellule.status;

  return (
    <div className="space-y-4">
      {/* Header pastel */}
      <div className="rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 bg-[#00B4D8]/10">
        <Activity className="h-5 w-5 text-gray-900 stroke-[2.5]" />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">VITAA × Orbit⁹ — {selectedCellule.name}</p>
          <p className="text-xs text-gray-500">Scoring des 5 piliers · Triangle du Feu · Formule exponentielle</p>
        </div>
      </div>

      {/* Formule + Triangle du Feu */}
      <div className="grid grid-cols-2 gap-3">
        {/* Formule */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Zap className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Formule e^(V×I×T)</span>
          </div>
          <div className="p-4 text-center">
            <div className="text-4xl font-bold text-indigo-600">{formulaResult.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1 font-mono">e^({avg.v.toFixed(2)} × {avg.i.toFixed(2)} × {avg.t.toFixed(2)}) = e^({vit.toFixed(3)})</p>
            <p className="text-[11px] text-gray-500 mt-2">Score collectif de la cellule</p>
          </div>
        </div>

        {/* Phase AMORCER */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Atom className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Phase AMORCER</span>
          </div>
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={cn("w-3 h-3 rounded-full", PC[fireStatus as PhaseKey]?.dot || "bg-gray-400")} />
              <span className="text-2xl font-bold text-gray-800">{PC[fireStatus as PhaseKey]?.label || fireStatus}</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Score collectif e^(V×I×T) = {formulaResult.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Comparaison Seul vs Cellule */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <BarChart3 className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Seul vs Cellule</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
            Solo: e^{soloVit.toFixed(2)} = {Math.exp(soloVit).toFixed(2)} | Cellule: {formulaResult.toFixed(2)}
          </span>
        </div>
        <div className="p-4 space-y-3">
          {pillars.map(p => (
            <div key={p.short} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-600 w-12 shrink-0">{p.label}</span>
                <span className="text-xs text-gray-400 w-8">Solo</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-1000", p.soloColor)} style={{ width: `${p.solo * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-gray-500 w-8 text-right">{(p.solo * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-600 w-12 shrink-0" />
                <span className="text-xs text-blue-500 w-8">Cell.</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-1000", p.color)} style={{ width: `${p.avg * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-gray-700 w-8 text-right">{(p.avg * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAAS — grisé */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white opacity-50">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-100">
          <Lock className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-bold text-gray-500">FAAS — Mode Perso</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">Bientôt</span>
        </div>
        <div className="p-4 text-center">
          <p className="text-xs text-gray-400">Le scoring FAAS (Fun, Autonomie, Argent, Sens) sera disponible en mode perso.</p>
        </div>
      </div>
    </div>
  );
}

// ========== NOUVELLES & INTELLIGENCE INDUSTRIE ==========

function FeedSocial({ activePhase }: { activePhase?: PhaseKey }) {
  const [subTab, setSubTab] = useState<"fil" | "industrie" | "opportunites">("fil");
  const ph = PC[activePhase || "observation"];

  // Extra industry news items to complement ORBIT9_FEED
  const INDUSTRIE_NEWS = [
    { type: "industrie" as const, icon: Factory, text: "Adoption IA manufacturière QC atteint 43% — bond de +39 pts depuis 2019", source: "STIQ/MEIE 2025", time: "Aujourd'hui", color: "violet" },
    { type: "industrie" as const, icon: TrendingUp, text: "Programme Grand V (IQ): 1 G$ déployé en 5 mois — 225 projets financés", source: "IQ 2024-2025", time: "Cette semaine", color: "emerald" },
    { type: "industrie" as const, icon: AlertTriangle, text: "Productivité QC à 65.90$/h — écart de -10.5% vs Ontario persiste", source: "ISQ 2024", time: "Cette semaine", color: "amber" },
    { type: "industrie" as const, icon: Cpu, text: "51% des PME ont un ERP mais seulement 3% complètement connecté — dette technique massive", source: "MEIE 2025", time: "Il y a 3j", color: "blue" },
    { type: "industrie" as const, icon: Globe, text: "76% des PME exportent aux USA — risque tarifaire Trump 2025 pousse à diversifier", source: "STIQ 2025", time: "Il y a 5j", color: "indigo" },
  ];

  // Combined feed for "Fil" tab: interleave orbit9 + industrie
  const combinedFeed = [
    ...ORBIT9_FEED.map(f => ({ ...f, category: "orbit9" as const })),
    ...INDUSTRIE_NEWS.map(n => ({ ...n, category: "industrie" as const })),
  ].sort(() => 0.5 - Math.random()).slice(0, 12); // shuffle and limit

  return (
    <div className="space-y-4">
      {/* Header pastel */}
      <div className="rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 bg-[#00B4D8]/10">
        <Newspaper className="h-5 w-5 text-gray-900 stroke-[2.5]" />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Nouvelles & Intelligence Industrie</p>
          <p className="text-xs text-gray-500">Fil Orbit⁹ + données manufacturières Québec 2024-2026</p>
        </div>
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", ph.badge)}>
          {ph.label}
        </span>
      </div>

      {/* 4 KPIs industrie */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { value: "218 G$", label: "Revenus Manuf. QC", trend: "+22.8%", up: true, icon: Factory },
          { value: "417K", label: "Emplois Manufacturiers", trend: "-0.8%", up: false, icon: Users },
          { value: "43%", label: "Adoption IA (PME)", trend: "+39 pts", up: true, icon: Cpu },
          { value: "65.90$/h", label: "Productivité QC", trend: "-10.5% vs ON", up: false, icon: TrendingUp },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <kpi.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">{kpi.label}</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
              <p className={cn("text-xs flex items-center gap-1 mt-0.5", kpi.up ? "text-emerald-600" : "text-red-500")}>
                {kpi.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {kpi.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1">
        {([
          { key: "fil" as const, label: "Fil Orbit⁹", Icon: Newspaper },
          { key: "industrie" as const, label: "Intelligence Industrie", Icon: Factory },
          { key: "opportunites" as const, label: "Opportunités", Icon: Lightbulb },
        ]).map(tab => (
          <button key={tab.key} onClick={() => setSubTab(tab.key)} className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer transition-all",
            subTab === tab.key ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          )}>
            <tab.Icon className="h-3.5 w-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ===== FIL ORBIT⁹ ===== */}
      {subTab === "fil" && (
        <div className="space-y-3">
          {/* Activity summary */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
            <Activity className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
            <span className="text-xs text-gray-500">
              <strong className="text-gray-700">{ORBIT9_FEED.length} activités Orbit⁹</strong> + <strong className="text-gray-700">{INDUSTRIE_NEWS.length} nouvelles industrie</strong> — dernières 72h
            </span>
          </div>

          {/* Feed items */}
          <div className="space-y-2">
            {combinedFeed.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white px-4 py-3">
                <div className="flex items-start gap-3">
                  {/* Avatar / Icon */}
                  {"code" in item && item.type === "bot" && (
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                      <BotAvatar code={(item as { code: string }).code} size="sm" />
                    </div>
                  )}
                  {"name" in item && item.type === "humain" && (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                  )}
                  {"codes" in item && item.type === "bot-to-bot" && (
                    <div className="flex -space-x-2 shrink-0">
                      {(item as { codes: string[] }).codes.map((code: string) => (
                        <div key={code} className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white">
                          <BotAvatar code={code} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}
                  {"icon" in item && item.type === "industrie" && (() => {
                    const IIcon = (item as { icon: React.ElementType }).icon;
                    return (
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", `bg-${(item as { color: string }).color}-100`)}>
                        <IIcon className={cn("h-3.5 w-3.5", `text-${(item as { color: string }).color}-600`)} />
                      </div>
                    );
                  })()}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {"code" in item && item.type === "bot" && (
                        <span className="text-[11px] font-semibold text-blue-700">{BOT_COLORS[(item as { code: string }).code]?.name || (item as { code: string }).code}</span>
                      )}
                      {"name" in item && item.type === "humain" && (
                        <span className="text-[11px] font-semibold text-emerald-700">{(item as { name: string }).name}</span>
                      )}
                      {item.type === "bot-to-bot" && (
                        <span className="text-[11px] font-semibold text-violet-700">Bot-to-Bot</span>
                      )}
                      {item.type === "industrie" && (
                        <span className="text-[11px] font-semibold text-indigo-700">Intelligence Industrie</span>
                      )}
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full font-medium",
                        item.type === "bot" ? "bg-blue-50 text-blue-600" :
                        item.type === "humain" ? "bg-emerald-50 text-emerald-600" :
                        item.type === "bot-to-bot" ? "bg-violet-50 text-violet-600" :
                        "bg-indigo-50 text-indigo-600"
                      )}>
                        {item.type === "bot" ? "Bot" : item.type === "humain" ? "Humain" : item.type === "bot-to-bot" ? "B2B" : "Industrie"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700">{item.text}</p>
                    {"source" in item && (
                      <p className="text-xs text-gray-400 italic mt-0.5">{(item as { source: string }).source}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CarlOS Proactif */}
          <div className="rounded-xl border border-gray-200 bg-[#00B4D8]/10 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                <BotAvatar code="CEOB" size="sm" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 mb-1">CarlOS — Résumé Intelligence</p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  L'adoption de l'IA au Québec fait un bond historique à 43% (+39 pts en 5 ans). Tes cellules Orbit⁹ sont bien positionnées: 3 leads qualifiés cette semaine, un match à 87% avec MetalPro, et l'Escouade Ventes performe au-dessus des cibles. Le programme Grand V de 1 G$ ouvre des opportunités de financement pour tes membres.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== INTELLIGENCE INDUSTRIE ===== */}
      {subTab === "industrie" && (
        <div className="space-y-4">
          {/* Portrait manufacturier */}
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-600" />
                <span className="text-sm font-bold text-gray-900">Portrait Manufacturier Québec 2024-2026</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Établissements", value: "13,694", detail: "800+ en automatisation", source: "ISQ/REAI 2024" },
                  { label: "ERP Adoption", value: "51%", detail: "Seulement 3% connecté", source: "MEIE 2025" },
                  { label: "Maturité Numérique Haute", value: "19%", detail: "24% font 4+ types d'innovation", source: "MEIE/STIQ 2025" },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">{s.label}</p>
                    <p className="text-lg font-bold text-gray-800">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.detail}</p>
                    <p className="text-xs text-gray-400 italic mt-1">{s.source}</p>
                  </div>
                ))}
              </div>

              {/* Adoption techno bars */}
              <p className="text-xs font-bold text-gray-700 mb-2">Taux d'Adoption Technologique (PME QC)</p>
              <div className="space-y-2">
                {[
                  { tech: "CAO/DAO", rate: 61 },
                  { tech: "ERP/MRP", rate: 51 },
                  { tech: "Infonuagique", rate: 49 },
                  { tech: "IA / Machine Learning", rate: 43 },
                  { tech: "Robotique / FMS / MES", rate: 38 },
                  { tech: "Impression 3D", rate: 16 },
                ].map(t => (
                  <div key={t.tech} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 min-w-[120px]">{t.tech}</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", t.rate >= 50 ? "bg-emerald-500" : t.rate >= 30 ? "bg-blue-500" : "bg-amber-500")} style={{ width: `${t.rate}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 min-w-[28px] text-right">{t.rate}%</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 italic">Sources: MEIE 2025, STIQ, StatCan</p>
            </div>
          </div>

          {/* Top secteurs */}
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-bold text-gray-900">Top Secteurs — 62% du PIB Manufacturier</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { secteur: "Transport / Aérospatiale", poids: "17.1%" },
                  { secteur: "Produits Métalliques", poids: "14.6%" },
                  { secteur: "Aliments", poids: "13.5%" },
                  { secteur: "Première Transfo. Métaux", poids: "12.9%" },
                  { secteur: "Machines", poids: "8.5%" },
                  { secteur: "Chimie", poids: "8.5%" },
                ].map(s => (
                  <div key={s.secteur} className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <p className="text-xs font-bold text-emerald-800">{s.secteur}</p>
                    <p className="text-xs text-emerald-600 font-bold">{s.poids} du PIB</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 italic">Source: STIQ Baromètre 16e édition 2025</p>
            </div>
          </div>

          {/* ROI transformation numérique */}
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-bold text-gray-900">ROI de la Transformation Numérique</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-center">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">Retour moyen</p>
                  <p className="text-2xl font-bold text-emerald-600">1.60$</p>
                  <p className="text-xs text-gray-500">par dollar investi en techno</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                  <p className="text-xs text-emerald-600 uppercase font-bold mb-1">Leaders numériques</p>
                  <p className="text-2xl font-bold text-emerald-700">2.40$</p>
                  <p className="text-xs text-emerald-600">par dollar investi</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  { impact: "Productivité augmentée", pct: "56%" },
                  { impact: "Tâches répétitives réduites", pct: "56%" },
                  { impact: "Coûts diminués", pct: "36%" },
                  { impact: "Qualité améliorée", pct: "30%" },
                  { impact: "Rentabilité < 2 ans", pct: "55%" },
                ].map(r => (
                  <div key={r.impact} className="flex items-center gap-2 p-2 rounded bg-gray-50">
                    <span className="text-xs text-gray-700 flex-1">{r.impact}</span>
                    <span className="text-xs font-bold text-emerald-600">{r.pct}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-blue-50 border border-blue-200">
                <Zap className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="text-xs text-blue-700">L'IA générative permet d'économiser 2.05h pour chaque 0.97h investie (FCEI 2025)</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 italic">Sources: STIQ 16e éd. 2025 / FCEI 2025</p>
            </div>
          </div>

          {/* Obstacles à l'adoption */}
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-bold text-gray-900">Obstacles à l'Adoption — 2024-2026</span>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {[
                  { obstacle: "Manque de connaissances sur l'IA", pct: 67 },
                  { obstacle: "Manque de personnel qualifié", pct: 66 },
                  { obstacle: "Manque de temps", pct: 66 },
                  { obstacle: "Difficulté à évaluer le ROI", pct: 53 },
                  { obstacle: "Manque de compétences numériques", pct: 51 },
                  { obstacle: "Coûts élevés", pct: 48 },
                ].map(o => (
                  <div key={o.obstacle}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-700 flex-1">{o.obstacle}</span>
                      <span className="text-xs font-bold text-gray-700">{o.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", o.pct >= 60 ? "bg-red-400" : o.pct >= 50 ? "bg-amber-400" : "bg-blue-400")} style={{ width: `${o.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 italic">Source: STIQ 2025 / FCEI 2025</p>
            </div>
          </div>

          {/* Sources de données */}
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900">Sources de Données — 28 Références</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { source: "ISQ (Inst. Statistique QC)", type: "Provincial" },
                  { source: "STIQ Baromètre 16e éd.", type: "Provincial" },
                  { source: "MEIE (Min. Économie)", type: "Provincial" },
                  { source: "Statistique Canada", type: "Fédéral" },
                  { source: "REAI (130+ membres)", type: "Associatif" },
                  { source: "IFR World Robotics", type: "International" },
                  { source: "Invest. Québec (Grand V)", type: "Provincial" },
                  { source: "FCEI / BDC", type: "Fédéral" },
                  { source: "Scale AI / Mila", type: "Écosystème IA" },
                ].map(s => (
                  <div key={s.source} className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs font-bold text-gray-800">{s.source}</p>
                    <p className="text-xs text-gray-600">{s.type}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== OPPORTUNITÉS ===== */}
      {subTab === "opportunites" && (
        <div className="space-y-4">
          {/* 6 opportunités stratégiques */}
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-bold text-gray-900">Opportunités Stratégiques — 2024-2026</span>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {[
                { sector: "IA Générative & Prédictive", opportunity: "43% adoption mais 47% n'utilisent toujours pas l'IA — marché massif non pénétré", impact: "Très élevé", data: "+39 pts depuis 2019", source: "STIQ/MEIE 2025" },
                { sector: "ERP & Intégration Systèmes", opportunity: "51% ont un ERP mais SEULEMENT 3% complètement connecté — dette technique massive", impact: "Critique", data: "14% d'interconnexion élevée", source: "MEIE 2025" },
                { sector: "Cybersécurité OT", opportunity: "Convergence IT/OT + Loi 25 = besoin explosif", impact: "Élevé", data: "Cloud à 48.5% = surface d'attaque élargie", source: "FCCQ 2024" },
                { sector: "Automatisation PME", opportunity: "73% utilisent l'automatisation MAIS investissement moyen PME = 40,715$/an seulement", impact: "Élevé", data: "ROI cobot 14-18 mois, 1.60$/$ investi", source: "MEIE/FCEI 2025" },
                { sector: "ESG & Dév. Durable", opportunity: "Grand V lie les milliards à la 'productivité durable' — nouveau critère obligatoire", impact: "Moyen-élevé", data: "IoT + IA pour optimiser conso énergétique", source: "IQ 2024-2025" },
                { sector: "Diversification Export", opportunity: "76% exportent aux USA — risque tarifaire = urgence diversification", impact: "Stratégique", data: "29% des innovantes exportent hors USA", source: "STIQ 2025" },
              ].map((o, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-100 hover:shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span className="text-sm font-semibold text-gray-800 flex-1">{o.sector}</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium",
                      o.impact === "Critique" ? "bg-red-50 text-red-600" :
                      o.impact === "Très élevé" ? "bg-orange-50 text-orange-600" :
                      "bg-indigo-50 text-indigo-600"
                    )}>{o.impact}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{o.opportunity}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600">{o.data}</span>
                    <span className="text-xs text-gray-400 italic">{o.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contexte mondial robotique */}
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-bold text-gray-900">Contexte Mondial — Densité Robotique (IFR 2024-2025)</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { pays: "Corée du Sud", densite: "1,012", note: "Leader mondial" },
                  { pays: "Singapour", densite: "770", note: "2e mondial" },
                  { pays: "Chine", densite: "470", note: "Doublement en 4 ans" },
                  { pays: "Canada", densite: "~200", note: "3,800 installations 2024" },
                ].map(p => (
                  <div key={p.pays} className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-gray-800">{p.pays}</span>
                      <span className="text-xs font-bold text-blue-600">{p.densite}/10K</span>
                    </div>
                    <p className="text-xs text-gray-500">{p.note}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 italic">Densité = robots pour 10,000 employés. Moyenne mondiale record: 162 (2023). Source: IFR 2025</p>
            </div>
          </div>

          {/* Coûts par solution */}
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-bold text-gray-900">Coûts par Type de Solution</span>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {[
                { type: "Robot Collaboratif (Cobot)", total: "124k$", materiel: "25-75k$" },
                { type: "Robot Industriel 6 axes", total: "403k$", materiel: "80-250k$" },
                { type: "Robot Mobile AMR", total: "183k$", materiel: "40-120k$" },
                { type: "Système Vision IA", total: "89k$", materiel: "15-60k$" },
              ].map(r => (
                <div key={r.type} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{r.type}</p>
                    <p className="text-xs text-gray-500">Matériel: {r.materiel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-700">{r.total}</p>
                    <p className="text-xs text-gray-400">1ère année</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-xs text-amber-700">Estimations — IFR 2024, REAI, fournisseurs QC. Varient selon intégrateur.</span>
              </div>
            </div>
          </div>

          {/* Études de référence */}
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-gray-900">Études de Référence 2024-2026</span>
              </div>
            </div>
            <div className="p-4 space-y-1.5">
              {[
                { title: "Baromètre industriel québécois 16e éd.", source: "STIQ", year: "2025" },
                { title: "Enquête numérique manufacturier QC", source: "MEIE", year: "2025" },
                { title: "Rapport annuel d'activités 2024-2025", source: "Investissement Québec", year: "2025" },
                { title: "World Robotics Report", source: "IFR", year: "2025" },
                { title: "Transformation numérique des PME", source: "FCEI", year: "2025" },
                { title: "Adoption et utilisation de l'IA au QC", source: "ISQ / StatCan", year: "2025" },
                { title: "Impact de l'IA sur les entreprises QC", source: "Aviseo / CPQ", year: "2024" },
                { title: "Rapport écosystème tech Québec", source: "Québec Tech", year: "2025" },
              ].map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100">
                  <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-800">{doc.title}</p>
                    <p className="text-xs text-gray-400">{doc.source} · {doc.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== MON PROFIL ORBIT9 (enrichi: fiche entreprise + VITAA perso + personnalisation) ==========

export function MonProfilOrbit9() {
  const [celluleName, setCelluleName] = useState("Les Titans");
  const myVitaa = ORBIT9_CELLULES[0].membres[0].vitaa; // Carl F. = premier membre

  return (
    <div className="space-y-4">
      {/* Header pastel */}
      <div className="rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 bg-[#00B4D8]/10">
        <UserCircle className="h-5 w-5 text-gray-900 stroke-[2.5]" />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Mon Profil Orbit⁹</p>
          <p className="text-xs text-gray-500">Fiche entreprise, scores VITAA, personnalisation</p>
        </div>
      </div>

      {/* Fiche entreprise */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Building2 className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Fiche entreprise</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <Camera className="h-5 w-5 text-gray-300" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 w-24">Entreprise</span>
                <span className="text-xs text-gray-800 font-bold">Usine Bleue AI</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 w-24">Secteur</span>
                <span className="text-xs text-gray-600">Automatisation industrielle</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 w-24">Région</span>
                <span className="text-xs text-gray-600">Québec, Canada</span>
              </div>
            </div>
          </div>
          {/* Certifications */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {["ISO 9001", "Membre REAI", "Pionnier V1"].map(cert => (
              <span key={cert} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium border border-emerald-200">
                {cert}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mon score VITAA */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Activity className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Mon score VITAA</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
            e^(V×I×T) = {Math.exp(myVitaa.v * myVitaa.i * myVitaa.t).toFixed(2)}
          </span>
        </div>
        <div className="p-4 space-y-2">
          {[
            { label: "Vente", val: myVitaa.v, color: "bg-red-500" },
            { label: "Idée", val: myVitaa.i, color: "bg-blue-500" },
            { label: "Temps", val: myVitaa.t, color: "bg-amber-500" },
            { label: "Argent", val: myVitaa.a1, color: "bg-emerald-500" },
            { label: "Actif", val: myVitaa.a2, color: "bg-violet-500" },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-3">
              <span className="text-[11px] text-gray-600 w-12 shrink-0">{p.label}</span>
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000", p.color)} style={{ width: `${p.val * 100}%` }} />
              </div>
              <span className="text-[11px] font-bold text-gray-700 w-8 text-right">{(p.val * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Indice de confiance */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <ShieldCheck className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Indice de confiance</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-gray-800">87%</div>
            <div className="flex-1 space-y-1">
              {[
                { label: "Profil complété", val: 90 },
                { label: "Engagements tenus", val: 85 },
                { label: "Activité réseau", val: 78 },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-28 shrink-0">{m.label}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${m.val}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-8 text-right">{m.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Personnalisation — nom cellule + bots */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Settings className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Personnalisation</span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-[11px] font-medium text-gray-600 mb-1 block">Nom de ma cellule</label>
            <input
              type="text"
              value={celluleName}
              onChange={(e) => setCelluleName(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="Nom de la cellule..."
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600 mb-1.5 block">Mes bots</label>
            <div className="space-y-2">
              {[
                { code: "CEOB", defaultName: "CarlOS" },
                { code: "CSOB", defaultName: "Simone" },
                { code: "CROB", defaultName: "Rich" },
              ].map(bot => (
                <div key={bot.code} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                    <BotAvatar code={bot.code} size="sm" />
                  </div>
                  <input
                    type="text"
                    defaultValue={bot.defaultName}
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Perso/Pro — disabled */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white opacity-50">
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
          <Lock className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-bold text-gray-500">Mode Perso / Pro</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">Bientôt</span>
        </div>
        <div className="p-4 text-center">
          <p className="text-xs text-gray-400">Basculez entre votre profil personnel (FAAS) et professionnel (VITAA).</p>
        </div>
      </div>
    </div>
  );
}

// ========== ORBIT9 DASHBOARD — Remplacé par DeptDashboardView botCode="ORBIT9" (Pattern A) ==========
// Config ORBIT9 dans BlueprintDepartement.tsx → DEPT_DASHBOARD_SECTIONS.ORBIT9

// ========== ORBIT9 GOUVERNANCE (4 sub-tabs: Principes, Rôles, TimeTokens, Matrice Sortie + Standards qualité) ==========

export function Orbit9Gouvernance({ fixedTab }: { fixedTab?: "principes" | "roles" | "timetokens" | "sortie" } = {}) {
  type GovTab = "principes" | "roles" | "timetokens" | "sortie";
  const [govTab, setGovTab] = useState<GovTab>(fixedTab || "principes");
  const GOV_TABS: { key: GovTab; label: string; Icon: React.ElementType }[] = [
    { key: "principes", label: "Principes", Icon: BookOpen },
    { key: "roles", label: "Rôles", Icon: Users },
    { key: "timetokens", label: "TimeTokens", Icon: DollarSign },
    { key: "sortie", label: "Matrice Sortie", Icon: Scale },
  ];

  return (
    <div className="space-y-4">
      {/* Header + intro */}
      <div className="rounded-xl border border-gray-200 px-4 py-3 bg-[#00B4D8]/10">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-5 w-5 text-gray-900 stroke-[2.5]" />
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">Gouvernance Augmentée par IA</p>
            <p className="text-xs text-gray-500">Inspiré Holacracy — adapté pour la collaboration IA + Humain</p>
          </div>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed">
          Le pouvoir ne réside pas dans une personne mais dans un <strong>processus défini</strong>. Chaque décision suit un protocole transparent où les bots IA et les humains ont des rôles clairs avec des responsabilités précises.
        </p>
      </div>

      {/* Sub-tabs (hidden when fixedTab is set from Blueprint sidebar) */}
      {!fixedTab && (
        <div className="flex gap-1.5">
          {GOV_TABS.map(t => (
            <button key={t.key} onClick={() => setGovTab(t.key)} className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              govTab === t.key ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}>
              <t.Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ═══ TAB: PRINCIPES ═══ */}
      {govTab === "principes" && (<>
        {/* 5 principes fondateurs */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <BookOpen className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">5 Principes fondateurs</span>
          </div>
          <div className="p-4 space-y-3">
            {[
              { title: "Basé sur les TENSIONS", icon: Zap, color: "text-amber-500", bgColor: "bg-amber-50 border-amber-200",
                desc: "Une tension = un écart entre la situation actuelle et ce qui pourrait être. C'est le moteur de toute amélioration.",
                examples: ["Le budget du projet n'est pas clair (problème)", "On pourrait automatiser ce processus (opportunité)"] },
              { title: "Rôles dynamiques, pas hiérarchie statique", icon: RefreshCw, color: "text-blue-500", bgColor: "bg-blue-50 border-blue-200",
                desc: "Les agents IA ET les humains occupent des rôles avec responsabilités précises. Ces rôles évoluent selon les tensions rencontrées.",
                examples: ["CarlOS a des responsabilités définies qui peuvent évoluer", "Rôles ajustés via réunions de gouvernance"] },
              { title: "Deux types de réunions distinctes", icon: Layers, color: "text-violet-500", bgColor: "bg-violet-50 border-violet-200",
                desc: "Gouvernance (structure: qui fait quoi) vs Tactique (opérations: quoi est en retard). Jamais mélangées.",
                examples: ["Gouvernance: \"Clarifier qui gère les subventions — CFO ou CTO?\"", "Tactique: \"Le devis pour Acier Québec est en retard\""] },
              { title: "Intégration des propositions", icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-50 border-emerald-200",
                desc: "Chaque proposition est testée par consentement (pas par consensus). Une objection est valide seulement si elle protège un rôle existant.",
                examples: ["Proposition → Questions → Réactions → Objections → Intégration", "Le silence = consentement implicite"] },
              { title: "Transparence radicale des données", icon: Eye, color: "text-cyan-500", bgColor: "bg-cyan-50 border-cyan-200",
                desc: "Chaque bot partage ses métriques, ses décisions et ses rationnels. Tout est auditable par tous les membres de la cellule.",
                examples: ["Historique complet de chaque décision par les bots", "Dashboards temps réel accessibles à tous"] },
            ].map((p, i) => (
              <div key={i} className={cn("rounded-lg border p-3", p.bgColor)}>
                <div className="flex items-center gap-2 mb-1.5">
                  <p.icon className={cn("h-4 w-4", p.color)} />
                  <span className="text-xs font-bold text-gray-800">{p.title}</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed mb-2">{p.desc}</p>
                <div className="space-y-1">
                  {p.examples.map((ex, ei) => (
                    <div key={ei} className="flex items-start gap-1.5">
                      <span className="text-xs text-gray-400 mt-0.5">→</span>
                      <span className="text-xs text-gray-500 italic">{ex}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Protocole décisionnel (processus en 5 étapes) */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Route className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Processus décisionnel</span>
          </div>
          <div className="p-4">
            <p className="text-[11px] text-gray-500 mb-3">Chaque décision du réseau suit ce processus en 5 étapes. Les bots IA participent à chaque étape aux côtés des humains.</p>
            <div className="flex items-center gap-1">
              {[
                { label: "Proposition", color: "bg-blue-500" },
                { label: "Questions", color: "bg-sky-500" },
                { label: "Réactions", color: "bg-amber-500" },
                { label: "Objections", color: "bg-orange-500" },
                { label: "Intégration", color: "bg-emerald-500" },
              ].map((st, si) => (
                <div key={si} className="flex-1 flex flex-col items-center relative">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold", st.color)}>{si + 1}</div>
                  <span className="text-xs font-medium text-gray-600 mt-1 text-center leading-tight">{st.label}</span>
                  {si < 4 && <div className="absolute top-3.5 left-[60%] w-[80%] h-0.5 bg-gray-200" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Règles actives de la cellule */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <ListChecks className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Règles actives</span>
          </div>
          <div className="p-4 space-y-2">
            {[
              { rule: "Maximum 9 membres par cellule", icon: Users, active: true },
              { rule: "Trisociation obligatoire (3 OS par bot)", icon: Atom, active: true },
              { rule: "Scoring VITAA minimum 40% pour rester actif", icon: Activity, active: true },
              { rule: "Anti-cartel: pas de monopole sectoriel", icon: ShieldAlert, active: true },
              { rule: "Rotation des rôles tous les 90 jours", icon: RefreshCw, active: false },
            ].map((r, i) => (
              <div key={i} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg border", r.active ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-50")}>
                <r.icon className={cn("h-3.5 w-3.5 shrink-0", r.active ? "text-blue-500" : "text-gray-400")} />
                <span className="text-xs text-gray-700 flex-1">{r.rule}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", r.active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400")}>{r.active ? "Actif" : "Bientôt"}</span>
              </div>
            ))}
          </div>
        </div>
      </>)}

      {/* ═══ TAB: RÔLES ═══ */}
      {govTab === "roles" && (<>
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Rôles dans le Cercle Orbit⁹</span>
          </div>
          <div className="p-4">
            <p className="text-[11px] text-gray-500 mb-3">Chaque cercle (cellule) possède 4 rôles structurels. Les agents IA et les humains se partagent ces responsabilités.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { role: "Facilitateur", occupant: "CarlOS (CEO-AI)", type: "Agent IA", typeColor: "bg-violet-50 text-violet-600", icon: Bot, color: "text-violet-500", border: "border-violet-200",
              duties: ["Faciliter les réunions de gouvernance", "S'assurer que le processus est respecté", "Détecter les tensions non-exprimées"] },
            { role: "Secrétaire", occupant: "Olivier (COO-AI)", type: "Agent IA", typeColor: "bg-violet-50 text-violet-600", icon: Bot, color: "text-blue-500", border: "border-blue-200",
              duties: ["Enregistrer les décisions", "Maintenir les registres", "Planifier les réunions"] },
            { role: "Leader du Cercle", occupant: "Carl (Fondateur)", type: "Humain", typeColor: "bg-blue-50 text-blue-600", icon: Crown, color: "text-amber-500", border: "border-amber-200",
              duties: ["Vision stratégique", "Allocation des ressources", "Décisions finales sur la direction"] },
            { role: "Représentant", occupant: "Élu par le cercle", type: "Humain", typeColor: "bg-blue-50 text-blue-600", icon: Compass, color: "text-emerald-500", border: "border-emerald-200",
              duties: ["Représenter le cercle dans les cercles supérieurs", "Reporter les tensions du cercle", "Protéger les intérêts du cercle"] },
          ].map((r, i) => (
            <div key={i} className={cn("rounded-xl border overflow-hidden shadow-sm bg-white", r.border)}>
              <div className="px-3 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <r.icon className={cn("h-4 w-4", r.color)} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-800">{r.role}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-500">{r.occupant}</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", r.typeColor)}>{r.type}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-1.5">
                {r.duties.map((d, di) => (
                  <div key={di} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-gray-600">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>)}

      {/* ═══ TAB: TIMETOKENS ═══ */}
      {govTab === "timetokens" && (<>
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "TT accumulés", value: "1,240", icon: Coins, sub: "Vos contributions" },
            { label: "Phase", value: "V1", icon: Server, sub: "Off-chain (SQLite)" },
            { label: "Formule", value: "5D", icon: Cpu, sub: "A × D × I × Z × P" },
            { label: "Valeur TT", value: "~3.2$", icon: DollarSign, sub: "Par token (estimé)" },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                <kpi.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900">{kpi.label}</span>
              </div>
              <div className="px-4 py-3">
                <div className="text-2xl font-bold text-gray-800">{kpi.value}</div>
                <div className="text-xs text-gray-500">{kpi.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pourquoi les bots rendent les smart contracts meilleurs */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Sparkles className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Pourquoi les Bots rendent les TimeTokens fiables</span>
          </div>
          <div className="p-4">
            <p className="text-[11px] text-gray-500 mb-3">Dans une DAO traditionnelle, les humains auto-déclarent leurs contributions. Avec CarlOS, les bots mesurent automatiquement — zéro manipulation possible.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 space-y-1.5">
                <span className="text-xs font-bold text-red-600 uppercase">DAO Traditionnelle</span>
                {["Humains auto-déclarent leurs contributions", "\"J'ai travaillé 40h\" — vraiment?", "Gaming du système, conflits, bureaucratie"].map((t, i) => (
                  <div key={i} className="flex items-start gap-1.5"><X className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" /><span className="text-xs text-gray-600">{t}</span></div>
                ))}
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 space-y-1.5">
                <span className="text-xs font-bold text-emerald-600 uppercase">Solution CarlOS</span>
                {["Bots trackent automatiquement chaque action", "CTO Bot mesure les heures de dev réelles", "Zéro self-reporting, zéro gaming"].map((t, i) => (
                  <div key={i} className="flex items-start gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /><span className="text-xs text-gray-600">{t}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Évolution en 3 phases */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Route className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Évolution en 3 phases</span>
          </div>
          <div className="p-4 flex gap-3">
            {[
              { phase: "Phase 1", label: "Off-Chain", desc: "SQLite local, tracking par bots, rapports mensuels", status: "Actif", statusColor: "bg-emerald-50 text-emerald-600", border: "border-emerald-300", color: "text-emerald-600" },
              { phase: "Phase 2", label: "Hybrid", desc: "PostgreSQL centralisé, API REST, audit trail immutable", status: "12-24 mois", statusColor: "bg-blue-50 text-blue-600", border: "border-blue-200", color: "text-blue-600" },
              { phase: "Phase 3", label: "On-Chain", desc: "Ethereum/Polygon L2, smart contracts, distribution auto", status: "24-36 mois", statusColor: "bg-violet-50 text-violet-600", border: "border-violet-200", color: "text-violet-600" },
            ].map((ph, pi) => (
              <div key={pi} className={cn("flex-1 rounded-xl border p-3", ph.border)}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("text-xs font-bold", ph.color)}>{ph.phase}</span>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium ml-auto", ph.statusColor)}>{ph.status}</span>
                </div>
                <p className="text-xs font-bold text-gray-800 mb-1">{ph.label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{ph.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </>)}

      {/* ═══ TAB: MATRICE SORTIE ═══ */}
      {govTab === "sortie" && (<>
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Scale className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Matrice de Sortie — 4 Quadrants</span>
          </div>
          <div className="p-4">
            <p className="text-[11px] text-gray-500 mb-3">Quand un membre quitte une cellule, le protocole de sortie dépend du contexte. Chaque scénario a un processus clair pour protéger toutes les parties.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "Volontaire + Bons termes", icon: CheckCircle2, border: "border-emerald-200", bg: "bg-emerald-50", color: "text-emerald-600",
              desc: "Rachat TimeTokens à valeur marchande. Transition planifiée sur 90 jours. Les bots continuent le suivi pendant la période de transition." },
            { title: "Volontaire + Conflit", icon: Scale, border: "border-amber-200", bg: "bg-amber-50", color: "text-amber-600",
              desc: "Médiation intégrative par CarlOS basée sur le protocole CREDO. Arbitrage neutre si échec de la médiation. Protection PI via TimeTokens." },
            { title: "Involontaire (Performance)", icon: AlertTriangle, border: "border-orange-200", bg: "bg-orange-50", color: "text-orange-600",
              desc: "3 niveaux d'avertissement progressifs. Plan d'amélioration sur 60 jours avec coaching de CarlOS. VITAA < 40% pendant 3 mois = sortie." },
            { title: "Événement externe", icon: Shield, border: "border-red-200", bg: "bg-red-50", color: "text-red-600",
              desc: "Clause de succession automatique. Un suppléant désigné prend le relai immédiatement. Continuité orbitale garantie — la cellule ne s'arrête jamais." },
          ].map((q, i) => (
            <div key={i} className={cn("rounded-xl border overflow-hidden shadow-sm bg-white", q.border)}>
              <div className={cn("px-3 py-2.5 border-b flex items-center gap-2", q.bg, q.border)}>
                <q.icon className={cn("h-4 w-4", q.color)} />
                <span className="text-xs font-bold text-gray-800">{q.title}</span>
              </div>
              <div className="p-3">
                <p className="text-[11px] text-gray-600 leading-relaxed">{q.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Protection PI */}
        <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-bold text-violet-800">Protection de la Propriété Intellectuelle</span>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-2">
            Chaque contribution intellectuelle est trackée via TimeTokens et attribuée de façon <strong>irréversible</strong>. Quitter un cercle ne supprime pas vos contributions — elles restent traçables à jamais.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Revenus distribués", "Équité dans les co-créations", "Commission sur nouveaux membres"].map((b, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">{b}</span>
            ))}
          </div>
        </div>
      </>)}

      {/* ═══ STANDARDS QUALITÉ (toujours visible) ═══ */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Star className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Standards Qualité — Seuils Minimaux</span>
        </div>
        <div className="p-3">
          <p className="text-xs text-gray-400 mb-2">Réévaluation annuelle de chaque membre. Le réseau élite maintient ses standards.</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "Certifications à jour", seuil: "Min. 1 active", ok: true },
              { label: "Assurances valides", seuil: "Responsabilité + spécifique", ok: true },
              { label: "Score réputation", seuil: "> 70/100", ok: true },
              { label: "Litiges ouverts", seuil: "0 majeur", ok: true },
              { label: "Taux livraison à temps", seuil: "> 80%", ok: true },
              { label: "Charte réseau signée", seuil: "Obligatoire", ok: true },
              { label: "Activité réseau", seuil: "Min. 1 interaction/90 jours", ok: false },
              { label: "Références vérifiées", seuil: "Min. 2 actives", ok: true },
            ].map((sq, qi) => (
              <div key={qi} className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-lg", sq.ok ? "bg-emerald-50" : "bg-amber-50")}>
                {sq.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-gray-700 block truncate">{sq.label}</span>
                  <span className="text-xs text-gray-400 block truncate">{sq.seuil}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== JUMELAGE ORBIT9 ==========

export function JumelageOrbit9() {
  const matches = [
    { a: "Usine Bleue AI", b: "MetalPro Inc.", score: 87, status: "Introduction", bot: "CSOB" },
    { a: "Usine Bleue AI", b: "TechFab Solutions", score: 73, status: "Qualification", bot: "CROB" },
    { a: "Escouade Ventes", b: "Emballages Éco+", score: 68, status: "Découverte", bot: "CROB" },
    { a: "Innovation Lab", b: "LogiTrans QC", score: 65, status: "Qualification", bot: "COOB" },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 bg-[#00B4D8]/10">
        <Handshake className="h-5 w-5 text-gray-900 stroke-[2.5]" />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Jumelage Orbit⁹</p>
          <p className="text-xs text-gray-500">Pipeline de jumelage inter-entreprises · 5 étapes</p>
        </div>
      </div>
      {/* Pipeline visuel */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Route className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Pipeline</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-1">
            {[
              { label: "Découverte", icon: Search, color: "bg-blue-500", active: true },
              { label: "Qualification", icon: Target, color: "bg-blue-500", active: true },
              { label: "Introduction", icon: Handshake, color: "bg-violet-500", active: false },
              { label: "Collaboration", icon: Rocket, color: "bg-emerald-500", active: false },
              { label: "Intégration", icon: Atom, color: "bg-amber-500", active: false },
            ].map((st, si) => (
              <div key={si} className="flex-1 flex flex-col items-center relative">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", st.active ? st.color : "bg-gray-300")}>
                  <st.icon className="h-3.5 w-3.5" />
                </div>
                <span className={cn("text-xs font-medium mt-1 text-center", st.active ? "text-gray-700" : "text-gray-400")}>{st.label}</span>
                {si < 4 && <div className={cn("absolute top-4 left-[60%] w-[80%] h-0.5", st.active ? "bg-blue-300" : "bg-gray-200")} />}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Matches en cours */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Handshake className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Matches en cours</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{matches.length}</span>
        </div>
        <div className="divide-y divide-gray-100">
          {matches.map((m, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0"><BotAvatar code={m.bot} size="sm" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800">{m.a} ↔ {m.b}</p>
                <p className="text-xs text-gray-400">Étape: {m.status}</p>
              </div>
              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.score}%` }} />
              </div>
              <span className="text-xs font-bold text-blue-600">{m.score}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== PIONNIERS ORBIT9 ==========

export function PionniersOrbit9() {
  const sectors = [
    { name: "Automatisation", status: "pris" as const, company: "AutomaTech Inc.", contact: "Martin L." },
    { name: "Usinage / Métal", status: "pris" as const, company: "Usinage Précision QC", contact: "Jean-P. R." },
    { name: "Plastique", status: "prospect" as const, company: "PlastiForm (en discussion)", contact: "—" },
    { name: "Logistique", status: "pris" as const, company: "LogiFlow", contact: "Sophie D." },
    { name: "Soudage", status: "pris" as const, company: "MetalPro Inc.", contact: "Pierre T." },
    { name: "Alimentaire", status: "disponible" as const, company: "", contact: "" },
    { name: "Pharmaceutique", status: "disponible" as const, company: "", contact: "" },
    { name: "Emballage", status: "prospect" as const, company: "En discussion", contact: "—" },
    { name: "Électronique", status: "disponible" as const, company: "", contact: "" },
  ];
  const pris = sectors.filter(s => s.status === "pris").length;
  const prospects = sectors.filter(s => s.status === "prospect").length;

  return (
    <div className="space-y-4">
      {/* Phase indicator */}
      <div className="flex items-center gap-2">
        <Eye className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Observation</span>
        <span className="text-xs text-gray-400">État du cercle des pionniers et stratégie de recrutement</span>
      </div>

      {/* Header pastel */}
      <div className="rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 bg-[#00B4D8]/10">
        <Rocket className="h-5 w-5 text-gray-900 stroke-[2.5]" />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Cercle des Pionniers Orbit⁹</p>
          <p className="text-xs text-gray-500">9 places · 9 leaders · 1 par secteur stratégique · Les portes ferment</p>
        </div>
        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">{pris}/9</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Confirmés", value: `${pris}`, icon: Users, sub: "Pionniers actifs" },
          { label: "En discussion", value: `${prospects}`, icon: Clock, sub: "Prospects actifs" },
          { label: "Prix pionnier", value: "1,350$", icon: DollarSign, sub: "/mois vs 2,500$ vague 2" },
          { label: "Économie/an", value: "13,800$", icon: Target, sub: "Garanti à vie" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <kpi.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">{kpi.label}</span>
            </div>
            <div className="px-4 py-3">
              <div className="text-2xl font-bold text-gray-800">{kpi.value}</div>
              <div className="text-xs text-gray-500">{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modèle de croissance 9 → 81 */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Rocket className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Modèle de Croissance — 9 × 9 = 81</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-600 mb-3">Chaque pionnier anime sa propre Cellule Orbit⁹. Effet réseau: les bots de toutes les cellules communiquent entre eux.</p>
          <div className="flex items-center justify-between gap-3">
            {[
              { value: "9", label: "Pionniers", desc: "1 leader / secteur", color: "indigo", Icon: Rocket },
              { value: "×9", label: "Cellule chacun", desc: "Chaque pionnier recrute", color: "blue", Icon: Users },
              { value: "81", label: "Membres actifs", desc: "Réseau auto-suffisant", color: "emerald", Icon: Target },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 flex-1">
                <div className={cn("p-3 rounded-xl border text-center flex-1", `bg-${step.color}-100 border-${step.color}-200`)}>
                  <step.Icon className={cn("h-5 w-5 mx-auto mb-1", `text-${step.color}-600`)} />
                  <p className={cn("text-2xl font-bold", `text-${step.color}-700`)}>{step.value}</p>
                  <p className="text-xs font-semibold text-gray-700">{step.label}</p>
                  <p className="text-xs text-gray-500">{step.desc}</p>
                </div>
                {i < 2 && <ArrowRight className="h-5 w-5 text-gray-300 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grille 9 places — 1 leader par secteur */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Target className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">9 Places — 1 Leader par Secteur Stratégique</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {sectors.map((s, i) => (
              <div key={i} className={cn("p-3 rounded-lg border transition-all",
                s.status === "pris" ? "bg-indigo-50 border-indigo-200" :
                s.status === "prospect" ? "bg-amber-50 border-amber-200 border-dashed" :
                "bg-gray-50 border-gray-200 border-dashed"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-xs font-bold",
                    s.status === "pris" ? "text-indigo-700" :
                    s.status === "prospect" ? "text-amber-700" : "text-gray-500"
                  )}>{s.name}</span>
                  {s.status === "pris" ? <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" /> :
                   s.status === "prospect" ? <Clock className="h-3.5 w-3.5 text-amber-600" /> :
                   <Plus className="h-3.5 w-3.5 text-gray-400" />}
                </div>
                <p className="text-xs text-gray-500">{s.company || "Disponible"}</p>
                {s.contact && s.contact !== "—" && <p className="text-xs text-gray-400 mt-0.5">Contact: {s.contact}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Package Pionnier — Conditions à Vie */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Award className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Package Pionnier — Conditions à Vie</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3">En devenant pionnier, vous verrouillez ces avantages de façon permanente, même quand le prix augmente pour les vagues suivantes.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { Icon: Users, label: "C-Suite complet (6 bots)", detail: "1,350$/mois vs 2,500$ vague 2 = -46% garanti à vie" },
              { Icon: GraduationCap, label: "Ambassadeur Or automatique", detail: "Statut premium dès le jour 1 (normalement 3 cercles + 25 membres)" },
              { Icon: Crown, label: "Onboarding VIP gratuit", detail: "Carl s'assoit avec toi. Setup complet. Valeur 500$." },
              { Icon: DollarSign, label: "Commission 5% sur ton cercle", detail: "Tu recrutes tes partenaires → tu gagnes sur leur abonnement" },
              { Icon: Rocket, label: "6 mois d'avance", detail: "Tes bots apprennent ton business pendant que la vague 2 attend" },
              { Icon: Target, label: "Voix au roadmap produit", detail: "Tu influences ce qu'on développe. Accès direct à l'équipe." },
            ].map((perk, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg hover:bg-indigo-50/50">
                <perk.Icon className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-indigo-800">{perk.label}</p>
                  <p className="text-xs text-indigo-600">{perk.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Script de Rencontre — 45 min, 5 actes */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Handshake className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Script de Rencontre — 45 min, 5 actes</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3">En personne (JAMAIS Zoom). Café ou bureau du prospect. iPad avec CarlOS prêt à rouler. Pas de PowerPoint.</p>
          <div className="space-y-2">
            {[
              { act: "1", title: "L'Accroche", dur: "5 min", desc: "Tu portes 8 chapeaux. Pas de CFO, CTO, CMO. Tu gères les urgences lundi au vendredi. Je me trompe?", color: "blue" },
              { act: "2", title: "Démo Live iPad", dur: "15 min", desc: "CarlOS analyse en temps réel. Les mots s'écrivent devant le prospect. Le WOW moment.", color: "indigo" },
              { act: "3", title: "Exclusivité Sectorielle", dur: "10 min", desc: "Tableau 9 places physique. « Ta place [Secteur] = toi ou [concurrent]. Je le rencontre vendredi. »", color: "violet" },
              { act: "4", title: "Conditions Pionnier", dur: "5 min", desc: "1 consultant = 5-10K$/mois. Toi = 6 cerveaux C-Level 24/7 pour 1,350$. = 61$/jour ouvrable.", color: "purple" },
              { act: "5", title: "Le Close", dur: "10 min", desc: "4 closes: Direct / Compétitif / Deadline 48h / Affordability. Lien Stripe prêt par texto.", color: "fuchsia" },
            ].map(act => (
              <div key={act.act} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0", `bg-${act.color}-600`)}>{act.act}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800">{act.title}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{act.dur}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendrier Sprint 30 Jours */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Calendar className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Calendrier Sprint 30 Jours</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3">Plan de recrutement des 9 pionniers en 4 semaines. Pression progressive, urgence croissante.</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { week: "Sem 1", title: "Les 3 premiers", desc: "3 rencontres. Post LinkedIn « 3/9 prises »", status: "done" as const },
              { week: "Sem 2", title: "Momentum", desc: "3 suivants. « 6 places prises. Il en reste 3. »", status: "active" as const },
              { week: "Sem 3", title: "Urgence max", desc: "3 derniers. Pression maximale. « Cercle COMPLET. »", status: "pending" as const },
              { week: "Sem 4", title: "Fermeture", desc: "Relance indécis 48h. Kick-off collectif 9 pionniers.", status: "pending" as const },
            ].map(w => (
              <div key={w.week} className={cn("p-3 rounded-lg border",
                w.status === "done" ? "bg-emerald-50 border-emerald-200" :
                w.status === "active" ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200"
              )}>
                <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-full inline-block mb-1",
                  w.status === "done" ? "bg-emerald-100 text-emerald-600" :
                  w.status === "active" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                )}>{w.week}</span>
                <p className="text-xs font-bold text-gray-800">{w.title}</p>
                <p className="text-xs text-gray-500 mt-1">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Processus de sélection rigoureux */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Shield className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Processus de Sélection Rigoureux</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3">Réseau élite augmenté AI — on ne prend pas n'importe qui. Même les fournisseurs invités gratuitement passent par le processus complet.</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { step: "1", title: "Invitation", desc: "Client UB a besoin d'un fournisseur → CarlOS invite le prospect gratuitement", Icon: Bell },
              { step: "2", title: "Qualification AI", desc: "CarlOS valide: réputation web, NEQ, LinkedIn, références, certifications, litiges", Icon: Bot },
              { step: "3", title: "Critères REAI", desc: "Entreprise 2+ ans, assurances valides, 0 litige majeur, 1+ certification, charte signée", Icon: CheckCircle2 },
              { step: "4", title: "Admission", desc: "Score calculé → Profil créé → Sceaux vérifiés → CarlOS assigne → Premier jumelage", Icon: Crown },
            ].map(s => (
              <div key={s.step} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-black bg-blue-200 text-blue-800 w-4 h-4 rounded-full flex items-center justify-center">{s.step}</span>
                  <s.Icon className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-bold text-gray-800">{s.title}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-[#00B4D8]/10 rounded-lg">
            <p className="text-xs text-gray-800 font-semibold text-center">
              FLYWHEEL: Fournisseur invité gratuitement → découvre CarlOS → devient client → invite SES fournisseurs → réseau grossit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== EVENEMENTS ORBIT9 ==========

function EvenementsOrbit9() {
  const events = [
    { title: "Meetup Pionniers #1", date: "15 avril 2026", type: "Présentiel", lieu: "Montréal", attendees: 9, color: "bg-blue-500" },
    { title: "Webinaire VITAA 101", date: "22 avril 2026", type: "Virtuel", lieu: "Zoom", attendees: 25, color: "bg-blue-500" },
    { title: "Hackathon Bot-to-Bot", date: "5 mai 2026", type: "Hybride", lieu: "Québec", attendees: 18, color: "bg-violet-500" },
    { title: "Conférence Orbit⁹ v1.0", date: "15 juin 2026", type: "Présentiel", lieu: "Montréal", attendees: 81, color: "bg-amber-500" },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 bg-[#00B4D8]/10">
        <Calendar className="h-5 w-5 text-gray-900 stroke-[2.5]" />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Événements Orbit⁹</p>
          <p className="text-xs text-gray-500">{events.length} événements à venir</p>
        </div>
      </div>
      <div className="space-y-3">
        {events.map((evt, i) => (
          <div key={i} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="flex items-stretch">
              <div className={cn("w-1.5 shrink-0", evt.color)} />
              <div className="flex-1 px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-800">{evt.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{evt.type}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {evt.date}</span>
                  <span className="flex items-center gap-1"><Map className="h-3.5 w-3.5" /> {evt.lieu}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {evt.attendees}</span>
                </div>
              </div>
              <div className="flex items-center px-3">
                <button className="text-xs bg-[#00B4D8]/10 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-100 font-medium cursor-pointer">S'inscrire</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== CREER CELLULE PAGE ==========

export function CreerCellulePage() {
  const [step, setStep] = useState(1);
  const [nom, setNom] = useState("");
  const [cellType, setCellType] = useState<"interne" | "externe">("interne");
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 bg-[#00B4D8]/10">
        <Plus className="h-5 w-5 text-gray-900 stroke-[2.5]" />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Créer une cellule</p>
          <p className="text-xs text-gray-500">Étape {step}/3 — {step === 1 ? "Informations" : step === 2 ? "Membres" : "Confirmation"}</p>
        </div>
      </div>
      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", s <= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400")}>{s}</div>
            <span className={cn("text-xs font-medium", s <= step ? "text-blue-700" : "text-gray-400")}>{s === 1 ? "Infos" : s === 2 ? "Membres" : "Confirmer"}</span>
            {s < 3 && <div className={cn("flex-1 h-0.5 rounded", s < step ? "bg-blue-400" : "bg-gray-200")} />}
          </div>
        ))}
      </div>
      {/* Step 1 */}
      {step === 1 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Pencil className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Informations de base</span>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-[11px] font-medium text-gray-600 mb-1 block">Nom de la cellule</label>
              <input type="text" value={nom} onChange={e => setNom(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Ex: Les Titans, Escouade Innovation..." />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 mb-1.5 block">Type de cellule</label>
              <div className="flex gap-3">
                {([{ val: "interne" as const, label: "Interne", desc: "Équipe interne", icon: Building2 }, { val: "externe" as const, label: "Externe", desc: "Collaboration inter-entreprises", icon: Globe }]).map(t => (
                  <button key={t.val} onClick={() => setCellType(t.val)} className={cn("flex-1 rounded-xl border p-3 text-left cursor-pointer transition-all", cellType === t.val ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-blue-200")}>
                    <t.icon className={cn("h-4 w-4 mb-1", cellType === t.val ? "text-blue-600" : "text-gray-400")} />
                    <p className="text-xs font-medium text-gray-800">{t.label}</p>
                    <p className="text-xs text-gray-400">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 mb-1 block">Description (optionnel)</label>
              <textarea className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none h-20 resize-none" placeholder="Objectif de cette cellule..." />
            </div>
          </div>
        </div>
      )}
      {/* Step 2 */}
      {step === 2 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Ajouter des membres</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Max 9</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-blue-200 bg-blue-50/50">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-700">CF</div>
              <div className="flex-1"><span className="text-xs font-medium text-gray-800">Carl F.</span><span className="text-xs text-gray-400 ml-2">Fondateur</span></div>
              <Crown className="h-3.5 w-3.5 text-amber-500" />
            </div>
            {[2, 3, 4, 5, 6, 7, 8, 9].map(slot => (
              <button key={slot} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed border-gray-300 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Plus className="h-3.5 w-3.5 text-gray-400" /></div>
                <span className="text-xs text-gray-400">Ajouter le membre #{slot}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Step 3 */}
      {step === 3 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <CheckCircle2 className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Confirmer la création</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Atom className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-bold text-gray-800">{nom || "Ma nouvelle cellule"}</p>
                <p className="text-xs text-gray-400">{cellType === "interne" ? "Cellule interne" : "Cellule externe"} · 1 membre</p>
              </div>
            </div>
            <div className="bg-[#00B4D8]/10 rounded-lg p-3 text-[11px] text-gray-700">CarlOS va configurer votre cellule et activer les bots.</div>
          </div>
        </div>
      )}
      {/* Nav buttons */}
      <div className="flex items-center justify-between">
        {step > 1 ? <button onClick={() => setStep(s => s - 1)} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"><ArrowLeft className="h-3.5 w-3.5" /> Précédent</button> : <div />}
        <button onClick={() => step < 3 ? setStep(s => s + 1) : null} className={cn("text-xs font-medium px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer transition-all", step < 3 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-emerald-600 text-white hover:bg-emerald-700")}>
          {step < 3 ? (<>Suivant <ArrowRight className="h-3.5 w-3.5" /></>) : (<><CheckCircle2 className="h-3.5 w-3.5" /> Créer la cellule</>)}
        </button>
      </div>
    </div>
  );
}

// ========== ORBIT9 BLUEPRINT COLLABORATION (Pattern B — DocForge sidebar) ==========

type O9BpSection = "vue_consolidee" | "profil" | "capacites" | "cellules" | "jumelage" | "vitaafast" | "gouvernance" | "roles" | "timetokens" | "pionniers" | "croissance" | "sortie";

const O9_BP_SECTIONS: { id: O9BpSection; label: string; Icon: React.ElementType }[] = [
  { id: "vue_consolidee", label: "Vue consolidée", Icon: LayoutDashboard },
  { id: "profil", label: "Profil réseau", Icon: Building2 },
  { id: "capacites", label: "Capacités & Offres", Icon: Package },
  { id: "cellules", label: "Cellules", Icon: Atom },
  { id: "jumelage", label: "Jumelage", Icon: Handshake },
  { id: "vitaafast", label: "VITAAFAST collectif", Icon: Activity },
  { id: "gouvernance", label: "Gouvernance S3", Icon: Shield },
  { id: "roles", label: "Rôles & Responsab.", Icon: Users },
  { id: "timetokens", label: "TimeTokens", Icon: Coins },
  { id: "pionniers", label: "Pionniers", Icon: Rocket },
  { id: "croissance", label: "Croissance 9→81", Icon: TrendingUp },
  { id: "sortie", label: "Matrice de sortie", Icon: Scale },
];

// ========== ORBIT9 SOCIAL HOME — Page d'accueil sociale vivante ==========

export function Orbit9SocialHome() {
  const UB_P = "bg-[#00B4D8]/10";

  const kpis = [
    { label: "Cellules actives", value: "7", delta: "+2 ce mois", up: true, Icon: Atom },
    { label: "Membres réseau", value: "34", delta: "+5 cette sem.", up: true, Icon: Users },
    { label: "Matches actifs", value: "12", delta: "3 en attente", up: true, Icon: Handshake },
    { label: "Score VITAA", value: "78", delta: "+4 pts", up: true, Icon: Activity },
    { label: "ROI Réseau", value: "42K$", delta: "+18% Q1", up: true, Icon: TrendingUp },
  ];

  const alertes = [
    { text: "Score confiance MetalPro en baisse (72→64)", type: "warning" as const, time: "Il y a 35min" },
    { text: "Contrat Boréal expire dans 12 jours — renouvellement requis", type: "urgent" as const, time: "Il y a 2h" },
    { text: "Ghost Delegate: 2 négociations en attente d'approbation", type: "info" as const, time: "Il y a 4h" },
  ];

  const vedette = {
    name: "Les Titans", type: "Interne", members: 6, score: 92,
    badge: "Or" as const, trend: "+8 pts ce mois",
    avatars: ["CF", "TM", "SM", "OL", "PC", "HL"],
  };

  const matches = [
    { company: "MetalPro Inc.", score: 87, stage: "Qualification", agent: "Simone", stageColor: "bg-amber-100 text-amber-700" },
    { company: "Boréal Automatisation", score: 91, stage: "Intégration", agent: "Rich", stageColor: "bg-emerald-100 text-emerald-700" },
    { company: "Précision Aéro", score: 74, stage: "Découverte", agent: "CarlOS", stageColor: "bg-blue-100 text-blue-700" },
  ];

  const feed = [
    { avatar: "CS", name: "CarlOS", text: "Trisociation complétée: Carl × Marc (Boréal) — Résumé: entente cadre d'approvisionnement signée. Valeur estimée: 180K$/an.", time: "Il y a 45min", type: "trisociation" as const, icon: Phone },
    { avatar: "RH", name: "Rich", text: "Lead qualifié: Précision Aéro cherche un partenaire soudure TIG/MIG. Score match: 74%. Pipeline mis à jour.", time: "Il y a 2h", type: "match" as const, icon: Handshake },
    { avatar: "SM", name: "Simone", text: "Analyse stratégique: le secteur manufacturier Québec montre une consolidation accélérée. 3 opportunités de cellules identifiées.", time: "Il y a 3h", type: "strategie" as const, icon: Target },
    { avatar: "OL", name: "Olivier", text: "Mission complétée: Audit processus livraison cellule Escouade Ventes. Recommandation: standardiser les SLA inter-membres.", time: "Il y a 5h", type: "mission" as const, icon: CheckCircle2 },
    { avatar: "TM", name: "Tim", text: "Infrastructure réseau: latence API Orbit9 réduite de 340ms → 120ms. Trisociation LiveKit stable à 99.2%.", time: "Il y a 6h", type: "tech" as const, icon: Cpu },
    { avatar: "IN", name: "Inès", text: "Veille techno: nouveau framework d'agents collaboratifs publié par Stanford. Pertinence pour Ghost Delegate: haute.", time: "Hier", type: "veille" as const, icon: Lightbulb },
  ];

  const intel = [
    { title: "Consolidation manufacturière QC", source: "Deloitte 2026", tag: "Tendance" },
    { title: "Subvention MESI — automatisation PME", source: "Gouvernement QC", tag: "Opportunité" },
    { title: "Pénurie soudeurs certifiés +23%", source: "CSMO Métallurgie", tag: "Risque" },
  ];

  const events = [
    { title: "Trisociation — MetalPro × Usine Bleue", date: "8 avril", time: "10h00", type: "trisociation" },
    { title: "Assemblée gouvernance S3 — Titans", date: "10 avril", time: "14h00", type: "gouvernance" },
    { title: "Webinaire IA manufacturier", date: "12 avril", time: "11h00", type: "webinaire" },
  ];

  const pionniers = [
    { name: "Carl F.", status: "fondateur" }, { name: "Marc B.", status: "pionnier" },
    { name: "Sophie M.", status: "pionnier" }, { name: "Jean-F. L.", status: "pionnier" },
    { name: "Nathalie R.", status: "pionnier" }, { name: "Patrick D.", status: "nouveau" },
    { name: "—", status: "vide" }, { name: "—", status: "vide" }, { name: "—", status: "vide" },
  ];

  const delegate = {
    status: "actif" as const, negotiations: 2, lastAction: "Contre-offre envoyée à MetalPro (rabais 8%)",
    preflight: ["Marge minimale: 22%", "Pas d'exclusivité >12 mois", "Paiement net 30 max"],
  };

  const badgeColor: Record<string, string> = { Bronze: "bg-amber-700", Argent: "bg-gray-400", Or: "bg-yellow-500", Platine: "bg-purple-500" };
  const typeIcon: Record<string, string> = { trisociation: "bg-cyan-50", match: "bg-emerald-50", strategie: "bg-violet-50", mission: "bg-blue-50", tech: "bg-gray-50", veille: "bg-amber-50" };

  return (
    <div className="space-y-4">
      {/* ═══ HERO V20 — Stellar Orbit ═══ */}
      <LivingHero blur1="bg-violet-100/70" blur2="bg-indigo-100/60" subtitleColor="text-violet-600" subtitle="Écosystème & Synergie" title="Votre galaxie d'opportunités, interconnectée." description="Les cellules gravitent autour du cœur. C'est l'essence du réseau global, le mouvement perpétuel." scaleClass="scale-[0.80]">
        <div className="relative flex items-center justify-center overflow-visible" style={{ width: 340, height: 160 }}>
          <svg viewBox="0 0 200 200" className="overflow-visible" style={{ width: 300, height: 300 }}>
            <circle cx="100" cy="100" r="16" fill="url(#o9-core-grad)" filter="drop-shadow(0 0 15px #a78bfa)"/>
            <circle cx="100" cy="100" r="18" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="2 2" className="anim-orb-1"/>
            <g className="anim-orb-1"><circle cx="100" cy="100" r="35" fill="none" stroke="#c084fc" strokeWidth="0.75" strokeDasharray="4 8" opacity="0.6"/><circle cx="135" cy="100" r="4.5" fill="#d8b4fe" className="anim-dot" style={{ color: '#d8b4fe' }} /></g>
            <g className="anim-orb-2"><circle cx="100" cy="100" r="60" fill="none" stroke="#818cf8" strokeWidth="1.5" opacity="0.4"/><circle cx="100" cy="40" r="5" fill="#6366f1" className="anim-dot" style={{ color: '#6366f1' }}/><circle cx="100" cy="160" r="3.5" fill="#818cf8" className="anim-dot" style={{ color: '#818cf8' }}/></g>
            <g className="anim-orb-3"><circle cx="100" cy="100" r="90" fill="none" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 6" opacity="0.8"/><circle cx="190" cy="100" r="18" fill="rgba(167, 139, 250, 0.15)"/><circle cx="190" cy="100" r="13" fill="none" stroke="#c084fc" strokeWidth="0.5"/><circle cx="190" cy="100" r="7" fill="#8b5cf6" className="anim-dot" style={{ color: '#8b5cf6' }}/><path d="M 116 100 L 183 100" fill="none" stroke="url(#o9-link-grad)" strokeWidth="1" opacity="0.5" /></g>
            <defs>
              <radialGradient id="o9-core-grad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ffffff"/><stop offset="40%" stopColor="#d8b4fe"/><stop offset="100%" stopColor="#7c3aed"/></radialGradient>
              <linearGradient id="o9-link-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#c084fc" stopOpacity="0"/><stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8"/><stop offset="100%" stopColor="#c084fc" stopOpacity="0"/></linearGradient>
            </defs>
          </svg>
        </div>
      </LivingHero>

      {/* ═══ ROW 0 — KPIs ═══ */}
      <div className="grid grid-cols-5 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className={cn("flex items-center gap-2 px-3 py-2 border-b border-gray-100", UB_P)}>
              <k.Icon className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
              <span className="text-[10px] font-bold text-gray-900">{k.label}</span>
            </div>
            <div className="px-3 py-2.5">
              <div className="text-2xl font-bold text-gray-900">{k.value}</div>
              <div className="flex items-center gap-1 mt-0.5">
                {k.up ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                <span className={cn("text-xs font-medium", k.up ? "text-emerald-600" : "text-red-600")}>{k.delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ ROW 1 — Alertes + Cellule vedette + Matches pipeline ═══ */}
      <div className="grid grid-cols-3 gap-3">
        {/* Signaux & Alertes */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_P)}>
            <AlertTriangle className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
            <span className="text-xs font-bold text-gray-900">Signaux & Alertes</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">{alertes.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {alertes.map((a, i) => (
              <div key={i} className="px-4 py-2.5 flex items-start gap-2">
                <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", a.type === "urgent" ? "bg-red-500" : a.type === "warning" ? "bg-amber-500" : "bg-blue-500")} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-700 leading-snug">{a.text}</p>
                  <span className="text-xs text-gray-400">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cellule vedette */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_P)}>
            <Star className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
            <span className="text-xs font-bold text-gray-900">Cellule vedette</span>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-gray-900">{vedette.name}</h4>
              <span className={cn("text-xs px-2 py-0.5 rounded-full text-white font-bold", badgeColor[vedette.badge])}>{vedette.badge}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{vedette.type}</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {vedette.avatars.map(a => (
                <div key={a} className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold -ml-1 first:ml-0 border-2 border-white">{a}</div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-gray-900">{vedette.score}</span>
                <span className="text-xs text-gray-500">/100</span>
              </div>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />{vedette.trend}</span>
            </div>
            <div className="mt-1.5 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${vedette.score}%` }} />
            </div>
          </div>
        </div>

        {/* Matches en cours */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_P)}>
            <Handshake className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
            <span className="text-xs font-bold text-gray-900">Matches en cours</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{matches.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {matches.map((m, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-gray-900 truncate">{m.company}</span>
                    <span className="text-xs font-bold text-cyan-600">{m.score}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", m.stageColor)}>{m.stage}</span>
                    <span className="text-xs text-gray-400">via {m.agent}</span>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ ROW 2 — Fil d'activité (2 cols) + Intelligence + Événements ═══ */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_P)}>
            <Newspaper className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
            <span className="text-xs font-bold text-gray-900">Fil d'activité</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[320px] overflow-y-auto">
            {feed.map((f, i) => {
              const FIcon = f.icon;
              return (
                <div key={i} className={cn("px-4 py-3 flex items-start gap-3", typeIcon[f.type])}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-bold shrink-0">{f.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-900">{f.name}</span>
                      <FIcon className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs text-gray-400 ml-auto shrink-0">{f.time}</span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">{f.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_P)}>
              <Factory className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
              <span className="text-xs font-bold text-gray-900">Intelligence industrie</span>
            </div>
            <div className="divide-y divide-gray-50">
              {intel.map((item, i) => (
                <div key={i} className="px-4 py-2.5">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium",
                    item.tag === "Opportunité" ? "bg-emerald-100 text-emerald-700" : item.tag === "Risque" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  )}>{item.tag}</span>
                  <p className="text-[10px] font-medium text-gray-900 mt-1">{item.title}</p>
                  <span className="text-xs text-gray-400">{item.source}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_P)}>
              <Calendar className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
              <span className="text-xs font-bold text-gray-900">Prochains événements</span>
            </div>
            <div className="divide-y divide-gray-50">
              {events.map((ev, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center gap-2">
                  <div className="text-center shrink-0 w-10">
                    <div className="text-xs font-bold text-cyan-600">{ev.date}</div>
                    <div className="text-xs text-gray-400">{ev.time}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-gray-900 truncate">{ev.title}</p>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{ev.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ROW 3 — Pionniers + Économie réseau + Ghost Delegate ═══ */}
      <div className="grid grid-cols-3 gap-3">
        {/* Pionniers 9x9 */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_P)}>
            <Rocket className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
            <span className="text-xs font-bold text-gray-900">Pionniers</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">6/9</span>
          </div>
          <div className="px-4 py-3">
            <div className="grid grid-cols-3 gap-2">
              {pionniers.map((p, i) => (
                <div key={i} className={cn("rounded-lg p-2 text-center border",
                  p.status === "fondateur" ? "bg-yellow-50 border-yellow-200" :
                  p.status === "pionnier" ? "bg-cyan-50 border-cyan-200" :
                  p.status === "nouveau" ? "bg-emerald-50 border-emerald-200" :
                  "bg-gray-50 border-dashed border-gray-200"
                )}>
                  <div className={cn("w-7 h-7 rounded-full mx-auto flex items-center justify-center text-xs font-bold",
                    p.status === "vide" ? "bg-gray-100 text-gray-300" : "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                  )}>{p.status === "vide" ? "?" : p.name.split(" ").map(w => w[0]).join("")}</div>
                  <div className="text-xs text-gray-600 mt-1 truncate">{p.name}</div>
                  {p.status !== "vide" && (
                    <span className={cn("text-xs px-1 rounded-full",
                      p.status === "fondateur" ? "bg-yellow-200 text-yellow-800" :
                      p.status === "nouveau" ? "bg-emerald-200 text-emerald-800" :
                      "bg-cyan-200 text-cyan-800"
                    )}>{p.status}</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">3 places restantes pour compléter le cercle fondateur</p>
          </div>
        </div>

        {/* Économie réseau */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_P)}>
            <DollarSign className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
            <span className="text-xs font-bold text-gray-900">Économie réseau</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">42K$</span>
                <span className="text-xs text-emerald-600 font-medium">+18% Q1</span>
              </div>
              <span className="text-xs text-gray-500">Valeur totale générée par le réseau</span>
            </div>
            <div className="space-y-2">
              {[
                { label: "Revenus partagés", val: "28K$", pct: 67 },
                { label: "Temps économisé", val: "8.5K$", pct: 20 },
                { label: "Négociations optimisées", val: "5.5K$", pct: 13 },
              ].map(r => (
                <div key={r.label}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{r.label}</span>
                    <span className="text-xs font-bold text-gray-900">{r.val}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-0.5">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs text-gray-600">TimeTokens en circulation: <strong>1,240 TT</strong></span>
            </div>
          </div>
        </div>

        {/* Ghost Delegate */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", UB_P)}>
            <Bot className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
            <span className="text-xs font-bold text-gray-900">Ghost Delegate</span>
            <span className="ml-auto flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Actif
            </span>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div>
              <span className="text-xs text-gray-500">Dernière action</span>
              <p className="text-[10px] font-medium text-gray-900 mt-0.5">{delegate.lastAction}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Négociations actives</span>
              <div className="text-lg font-bold text-gray-900">{delegate.negotiations}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />Pre-flight Check (garde-fous)</span>
              <div className="mt-1 space-y-1">
                {delegate.preflight.map((rule, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs text-gray-600">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Orbit9BlueprintCollaboration() {
  const [activeSub, setActiveSub] = useState<O9BpSection>("vue_consolidee");

  return (
    <div className="space-y-4">
      {/* Header gradient */}
      <div className="rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 p-4 text-white">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-white" />
          <div className="flex-1">
            <h2 className="text-sm font-bold">Blueprint Collaboration Orbit⁹</h2>
            <p className="text-xs text-white/80">Guide structuré pour déployer et gérer votre réseau collaboratif</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: '35%' }} />
          </div>
          <span className="text-[10px] font-bold text-white">35%</span>
        </div>
      </div>

      <div className="flex gap-3">
        {/* SIDEBAR — Table des matières */}
        <div className="w-[180px] shrink-0 space-y-0.5">
          {O9_BP_SECTIONS.map(section => {
            const isActive = activeSub === section.id;
            const isConsolidee = section.id === "vue_consolidee";
            return (
              <button
                key={section.id}
                onClick={() => setActiveSub(section.id)}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                  isActive
                    ? "bg-blue-50 border border-blue-200 shadow-sm"
                    : "hover:bg-gray-50 border border-transparent",
                  isConsolidee && !isActive && "bg-gradient-to-r from-slate-50 to-blue-50/50 border-blue-100/50"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <section.Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-blue-600" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>
                    {section.label}
                  </span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-blue-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* CONTENU — Section active */}
        <div className="flex-1 min-w-0">
          {activeSub === "vue_consolidee" && <O9BpConsolidee onNav={setActiveSub} />}
          {activeSub === "profil" && <MonProfilOrbit9 />}
          {activeSub === "capacites" && <O9BpCapacites />}
          {activeSub === "cellules" && <MesCellules onSelect={() => {}} />}
          {activeSub === "jumelage" && <JumelageOrbit9 />}
          {activeSub === "vitaafast" && <VITAADashboard selectedCellule={ORBIT9_CELLULES[0]} />}
          {activeSub === "gouvernance" && <Orbit9Gouvernance fixedTab="principes" />}
          {activeSub === "roles" && <Orbit9Gouvernance fixedTab="roles" />}
          {activeSub === "timetokens" && <Orbit9Gouvernance fixedTab="timetokens" />}
          {activeSub === "pionniers" && <PionniersOrbit9 />}
          {activeSub === "croissance" && <CreerCellulePage />}
          {activeSub === "sortie" && <Orbit9Gouvernance fixedTab="sortie" />}
        </div>
      </div>
    </div>
  );
}

// Vue consolidée — résumé de toutes les sections du Blueprint Collaboration
function O9BpConsolidee({ onNav }: { onNav: (id: O9BpSection) => void }) {
  const summaries: { id: O9BpSection; Icon: React.ElementType; title: string; value: string; detail: string }[] = [
    { id: "profil", Icon: Building2, title: "Profil réseau", value: "87%", detail: "Indice de confiance" },
    { id: "capacites", Icon: Package, title: "Capacités & Offres", value: "5", detail: "Capacités listées" },
    { id: "cellules", Icon: Atom, title: "Cellules", value: "4", detail: "Cellules actives" },
    { id: "jumelage", Icon: Handshake, title: "Jumelage", value: "4", detail: "Matches en cours" },
    { id: "vitaafast", Icon: Activity, title: "VITAAFAST", value: "76%", detail: "Score collectif" },
    { id: "gouvernance", Icon: Shield, title: "Gouvernance S3", value: "5", detail: "Principes actifs" },
    { id: "roles", Icon: Users, title: "Rôles", value: "4", detail: "Rôles définis" },
    { id: "timetokens", Icon: Coins, title: "TimeTokens", value: "1,240", detail: "TT accumulés" },
    { id: "pionniers", Icon: Rocket, title: "Pionniers", value: "4/9", detail: "Places confirmées" },
    { id: "croissance", Icon: TrendingUp, title: "Croissance", value: "9→81", detail: "Objectif réseau" },
    { id: "sortie", Icon: Scale, title: "Matrice sortie", value: "4", detail: "Scénarios documentés" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <LayoutDashboard className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Vue consolidée</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 ml-auto">12 sections</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-600 mb-4">Aperçu de votre Blueprint Collaboration. Cliquez une section pour la compléter.</p>
          <div className="grid grid-cols-3 gap-2">
            {summaries.map(s => (
              <button
                key={s.id}
                onClick={() => onNav(s.id)}
                className="p-3 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <s.Icon className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs font-bold text-gray-700">{s.title}</span>
                </div>
                <div className="text-lg font-bold text-gray-800">{s.value}</div>
                <div className="text-xs text-gray-400">{s.detail}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Capacités & Offres — ce que l'entreprise offre au réseau et ce qu'elle cherche
function O9BpCapacites() {
  const offres = [
    { label: "Automatisation industrielle", level: "Expert", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { label: "Intégration robotique", level: "Expert", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { label: "IA appliquée manufacturier", level: "Avancé", color: "bg-blue-50 border-blue-200 text-blue-700" },
    { label: "Consultation stratégique", level: "Intermédiaire", color: "bg-amber-50 border-amber-200 text-amber-700" },
    { label: "Formation technique", level: "Avancé", color: "bg-blue-50 border-blue-200 text-blue-700" },
  ];
  const besoins = [
    { label: "Soudure spécialisée TIG/MIG", urgence: "Élevé", color: "text-red-600" },
    { label: "Usinage CNC 5 axes", urgence: "Moyen", color: "text-amber-600" },
    { label: "Transport & logistique régional", urgence: "Moyen", color: "text-amber-600" },
    { label: "Tests qualité / certification", urgence: "Faible", color: "text-gray-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 bg-[#00B4D8]/10">
        <Package className="h-5 w-5 text-gray-900 stroke-[2.5]" />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Capacités & Offres</p>
          <p className="text-xs text-gray-500">Ce que vous offrez au réseau et ce que vous cherchez</p>
        </div>
      </div>

      {/* Ce que nous offrons */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Rocket className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Ce que nous offrons</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 ml-auto">{offres.length}</span>
        </div>
        <div className="p-4 space-y-2">
          {offres.map((o, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="text-xs text-gray-800 flex-1">{o.label}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium border", o.color)}>{o.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ce que nous cherchons */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Search className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Ce que nous cherchons</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 ml-auto">{besoins.length}</span>
        </div>
        <div className="p-4 space-y-2">
          {besoins.map((b, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50">
              <Target className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span className="text-xs text-gray-800 flex-1">{b.label}</span>
              <span className={cn("text-xs font-medium", b.color)}>Urgence: {b.urgence}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CarlOS suggestion */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-[#00B4D8]/10">
        <div className="p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold shrink-0">C</div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-900">CarlOS — Suggestion</h3>
            <p className="text-xs text-gray-600 mt-1 italic">{`"D'après vos besoins en soudure TIG/MIG, MetalPro Inc. dans le cercle des Pionniers est un match à 87%. Je peux organiser une introduction?"`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== PATTERN C — SECTION HEADER (local, same as DepartmentTourDeControle) ==========

interface O9SubTabDef {
  id: string;
  label: string;
  icon?: React.ElementType;
  gradient: string;
  count?: number;
}

function O9SectionHeader({ icon: Icon, title, subtitle, tabs, activeTab, onTabChange, gradient }: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  tabs: O9SubTabDef[];
  activeTab: string;
  onTabChange: (id: string) => void;
  gradient?: string;
}) {
  const currentGradient = gradient || tabs.find(t => t.id === activeTab)?.gradient || "from-cyan-600 to-blue-500";
  return (
    <div className={cn("bg-gradient-to-r rounded-xl p-4 transition-all duration-300", currentGradient)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                  activeTab === tab.id
                    ? "bg-white/25 text-white shadow-sm"
                    : "text-white/60 hover:bg-white/10 hover:text-white/80"
                )}
              >
                {TabIcon && <TabIcon className="h-3.5 w-3.5" />}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/20">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const O9_GRADIENT = "from-cyan-600 to-blue-500";

const O9_HIER_FILTERS: O9SubTabDef[] = [
  { id: "tous", label: "Tous", gradient: O9_GRADIENT },
  { id: "interne", label: "Internes", gradient: "from-slate-600 to-slate-500" },
  { id: "externe", label: "Externes", gradient: "from-emerald-600 to-emerald-500" },
  { id: "inter-cellules", label: "Inter-cellules", gradient: "from-amber-600 to-amber-500" },
];

// ========== TAB SECONDAIRE: CHANTIERS RÉSEAU ==========

function O9ChantiersTab({ onSection }: { onSection: (tab: string, filter?: { type: string; id: number; titre: string }) => void }) {
  const [sub, setSub] = useState("tous");
  const [parentFilter, setParentFilter] = useState<{ type: string; id: number; titre: string } | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "list" | "kanban" | "spreadsheet">("cards");

  return (
    <div className="space-y-3">
      <O9SectionHeader icon={Flame} title="Chantiers réseau" subtitle="Initiatives collaboratives" tabs={O9_HIER_FILTERS} activeTab={sub} onTabChange={setSub} gradient={O9_GRADIENT} />
      <HierarchieTab
        key={`o9-chantiers-${sub}`}
        level="chantiers"
        compact
        categorieFilter={sub === "tous" ? undefined : sub}
        goTo={(tab, filter) => {
          const mapped = tab as string;
          if (mapped === "chantiers" || mapped === "projets" || mapped === "missions" || mapped === "taches") {
            onSection(mapped, filter || undefined);
          }
        }}
        parentFilter={parentFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
    </div>
  );
}

// ========== TAB SECONDAIRE: PROJETS RÉSEAU ==========

function O9ProjetsTab({ onSection, initialFilter }: { onSection: (tab: string, filter?: { type: string; id: number; titre: string }) => void; initialFilter?: { type: string; id: number; titre: string } | null }) {
  const [sub, setSub] = useState("tous");
  const [parentFilter, setParentFilter] = useState<{ type: string; id: number; titre: string } | null>(initialFilter || null);
  const [viewMode, setViewMode] = useState<"cards" | "list" | "kanban" | "spreadsheet">("cards");

  return (
    <div className="space-y-3">
      <O9SectionHeader icon={Package} title="Projets réseau" subtitle="Projets inter-entreprises" tabs={O9_HIER_FILTERS} activeTab={sub} onTabChange={setSub} gradient={O9_GRADIENT} />
      <HierarchieTab
        key={`o9-projets-${sub}`}
        level="projets"
        compact
        categorieFilter={sub === "tous" ? undefined : sub}
        goTo={(tab, filter) => {
          const mapped = tab as string;
          if (mapped === "chantiers" || mapped === "projets" || mapped === "missions" || mapped === "taches") {
            onSection(mapped, filter || undefined);
          }
        }}
        parentFilter={parentFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
    </div>
  );
}

// ========== TAB SECONDAIRE: MISSIONS RÉSEAU + MARKETPLACE ==========

function O9MissionsTab({ onSection, initialFilter }: { onSection: (tab: string, filter?: { type: string; id: number; titre: string }) => void; initialFilter?: { type: string; id: number; titre: string } | null }) {
  const [sub, setSub] = useState("tous");
  const [parentFilter, setParentFilter] = useState<{ type: string; id: number; titre: string } | null>(initialFilter || null);
  const [viewMode, setViewMode] = useState<"cards" | "list" | "kanban" | "spreadsheet">("cards");

  const missionFilters: O9SubTabDef[] = [
    ...O9_HIER_FILTERS,
    { id: "marketplace", label: "Marketplace", icon: Sparkles, gradient: "from-purple-600 to-pink-500" },
  ];

  return (
    <div className="space-y-3">
      <O9SectionHeader icon={ListChecks} title="Missions réseau" subtitle="Collaboration et marketplace" tabs={missionFilters} activeTab={sub} onTabChange={setSub} gradient={O9_GRADIENT} />
      {sub === "marketplace" ? (
        <O9MissionMarketplace />
      ) : (
        <HierarchieTab
          key={`o9-missions-${sub}`}
          level="missions"
          compact
          categorieFilter={sub === "tous" ? undefined : sub}
          goTo={(tab, filter) => {
            const mapped = tab as string;
            if (mapped === "chantiers" || mapped === "projets" || mapped === "missions" || mapped === "taches") {
              onSection(mapped, filter || undefined);
            }
          }}
          parentFilter={parentFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}
    </div>
  );
}

/** Mission Marketplace — Missions publiées par les bots AI cherchant des mains humaines */
function O9MissionMarketplace() {
  const MARKETPLACE_MISSIONS = [
    { id: 1, bot: "CTOB", botName: "Tim", title: "Audit sécurité réseau partenaire", reward: "15 TT", urgency: "haute", skills: ["Cybersécurité", "Audit"], desc: "Besoin d'un expert humain pour valider les configurations réseau du partenaire MetalPro." },
    { id: 2, bot: "CROB", botName: "Rich", title: "Visite terrain — qualification prospect", reward: "25 TT", urgency: "moyenne", skills: ["Ventes B2B", "Terrain"], desc: "Prospect qualifié à 78% mais nécessite une rencontre physique pour conclure." },
    { id: 3, bot: "COOB", botName: "Olivier", title: "Inspection qualité lot #2847", reward: "10 TT", urgency: "haute", skills: ["Qualité", "Manufacturier"], desc: "Lot en attente — inspection manuelle requise avant expédition." },
    { id: 4, bot: "CINOB", botName: "Inès", title: "Test utilisateur prototype V3", reward: "20 TT", urgency: "basse", skills: ["UX", "R&D"], desc: "Prototype prêt, besoin de 5 testeurs humains pour feedback." },
    { id: 5, bot: "CMOB", botName: "Mathilde", title: "Témoignage vidéo client satisfait", reward: "12 TT", urgency: "moyenne", skills: ["Communication", "Vidéo"], desc: "Client identifié et d'accord — besoin de tourner le témoignage." },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="h-3.5 w-3.5 text-purple-500" />
        <span className="text-xs text-gray-500">Missions où les bots AI cherchent des mains humaines — rémunérées en TimeTokens</span>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {MARKETPLACE_MISSIONS.map(m => (
          <div key={m.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", "bg-purple-50")}>
              <Bot className="h-3.5 w-3.5 text-purple-600 stroke-[2.5]" />
              <span className="text-xs font-bold text-gray-900">{m.botName} demande</span>
              <span className={cn("ml-auto text-xs px-2 py-0.5 rounded-full font-medium",
                m.urgency === "haute" ? "bg-red-100 text-red-700" : m.urgency === "moyenne" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
              )}>{m.urgency}</span>
            </div>
            <div className="px-4 py-3">
              <h4 className="text-sm font-semibold text-gray-900">{m.title}</h4>
              <p className="text-[10px] text-gray-500 mt-1">{m.desc}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {m.skills.map(s => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{s}</span>
                ))}
                <span className="ml-auto text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5" />{m.reward}
                </span>
              </div>
              <button className="mt-3 w-full px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors cursor-pointer">
                Accepter la mission
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== TAB SECONDAIRE: TÂCHES RÉSEAU ==========

function O9TachesTab({ onSection, initialFilter }: { onSection: (tab: string, filter?: { type: string; id: number; titre: string }) => void; initialFilter?: { type: string; id: number; titre: string } | null }) {
  const [sub, setSub] = useState("tous");
  const [parentFilter, setParentFilter] = useState<{ type: string; id: number; titre: string } | null>(initialFilter || null);
  const [viewMode, setViewMode] = useState<"cards" | "list" | "kanban" | "spreadsheet">("cards");

  return (
    <div className="space-y-3">
      <O9SectionHeader icon={CheckCircle2} title="Tâches réseau" subtitle="Actions collaboratives" tabs={O9_HIER_FILTERS} activeTab={sub} onTabChange={setSub} gradient={O9_GRADIENT} />
      <HierarchieTab
        key={`o9-taches-${sub}`}
        level="taches"
        compact
        categorieFilter={sub === "tous" ? undefined : sub}
        goTo={(tab, filter) => {
          const mapped = tab as string;
          if (mapped === "chantiers" || mapped === "projets" || mapped === "missions" || mapped === "taches") {
            onSection(mapped, filter || undefined);
          }
        }}
        parentFilter={parentFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
    </div>
  );
}

// ========== TAB SECONDAIRE: DISCUSSIONS (INDUSTRY ROOMS) ==========

function O9DiscussionsTab() {
  const INDUSTRY_ROOMS = [
    { id: "manufacturing", name: "Productivité manufacturière", members: 34, messages: 128, icon: Factory, color: "bg-blue-50 text-blue-600" },
    { id: "ai-adoption", name: "Adoption IA en PME", members: 52, messages: 203, icon: Brain, color: "bg-purple-50 text-purple-600" },
    { id: "supply-chain", name: "Chaîne d'approvisionnement", members: 28, messages: 87, icon: Route, color: "bg-amber-50 text-amber-600" },
    { id: "workforce", name: "Main-d'œuvre & talents", members: 41, messages: 156, icon: Users, color: "bg-emerald-50 text-emerald-600" },
    { id: "sustainability", name: "Développement durable", members: 19, messages: 45, icon: Globe, color: "bg-green-50 text-green-600" },
    { id: "automation", name: "Automatisation industrielle", members: 37, messages: 167, icon: Cpu, color: "bg-cyan-50 text-cyan-600" },
  ];

  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const room = INDUSTRY_ROOMS.find(r => r.id === activeRoom);

  if (room) {
    const RoomIcon = room.icon;
    return (
      <div className="space-y-3">
        <button onClick={() => setActiveRoom(null)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
          <ArrowLeft className="h-3.5 w-3.5" />Retour aux salles
        </button>
        <div className={cn("bg-gradient-to-r rounded-xl p-4", O9_GRADIENT)}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center"><RoomIcon className="h-4 w-4 text-white" /></div>
            <div>
              <h2 className="text-lg font-bold text-white">{room.name}</h2>
              <p className="text-sm text-white/70">{room.members} membres · {room.messages} messages</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="space-y-3">
            {[
              { author: "Carl F.", time: "Il y a 2h", text: "Quelqu'un a testé les nouveaux robots collaboratifs Universal Robots? On évalue le UR20 pour notre ligne." },
              { author: "CarlOS", time: "Il y a 1h45", text: "Résumé Trisociation: Marc (Boréal) et Sophie (MetalPro) ont discuté intégration UR20. Conclusion: ROI positif en 14 mois si volume > 500 pièces/jour.", isBot: true },
              { author: "Sophie M.", time: "Il y a 1h", text: "On l'a déployé il y a 6 mois. Retour: fiable, mais formation opérateurs = 3 semaines minimum." },
            ].map((msg, i) => (
              <div key={i} className={cn("p-3 rounded-lg", msg.isBot ? "bg-[#00B4D8]/10" : "bg-gray-50")}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-900">{msg.author}</span>
                  {msg.isBot && <span className="text-xs px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-medium">AI</span>}
                  <span className="text-xs text-gray-400 ml-auto">{msg.time}</span>
                </div>
                <p className="text-[10px] text-gray-600">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <O9SectionHeader icon={MessageSquare} title="Discussions" subtitle="Industry Rooms du réseau" tabs={[
        { id: "actives", label: "Actives", gradient: O9_GRADIENT },
        { id: "mes-salles", label: "Mes salles", gradient: "from-slate-600 to-slate-500" },
      ]} activeTab="actives" onTabChange={() => {}} gradient={O9_GRADIENT} />
      <div className="grid grid-cols-2 gap-3">
        {INDUSTRY_ROOMS.map(r => {
          const RIcon = r.icon;
          return (
            <button key={r.id} onClick={() => setActiveRoom(r.id)} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white text-left cursor-pointer hover:shadow-md transition-shadow">
              <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100", "bg-[#00B4D8]/10")}>
                <RIcon className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                <span className="text-xs font-bold text-gray-900">{r.name}</span>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{r.members}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{r.messages}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ========== TAB SECONDAIRE: DOCUMENTS ==========

function O9DocumentsTab() {
  return (
    <div className="space-y-3">
      <O9SectionHeader icon={FileText} title="Documents" subtitle="Ressources partagées du réseau" tabs={[
        { id: "tous", label: "Tous", gradient: O9_GRADIENT },
        { id: "partages", label: "Partagés", gradient: "from-emerald-600 to-emerald-500" },
        { id: "mes-docs", label: "Mes docs", gradient: "from-slate-600 to-slate-500" },
      ]} activeTab="tous" onTabChange={() => {}} gradient={O9_GRADIENT} />
      <DocumentsUnifie botFilter="CEOB" hideHeader />
    </div>
  );
}

// ========== TAB SECONDAIRE: AGENDA ==========

function O9AgendaTab() {
  const UPCOMING_EVENTS = [
    { id: 1, title: "Trisociation — MetalPro × Usine Bleue", date: "8 avril 2026", time: "10h00", type: "trisociation", icon: Handshake, color: "bg-cyan-50 text-cyan-600" },
    { id: 2, title: "Assemblée gouvernance S3 — Cellule Titans", date: "10 avril 2026", time: "14h00", type: "gouvernance", icon: Shield, color: "bg-purple-50 text-purple-600" },
    { id: 3, title: "Webinaire — IA en manufacturier", date: "12 avril 2026", time: "11h00", type: "webinaire", icon: Globe, color: "bg-blue-50 text-blue-600" },
    { id: 4, title: "Revue pipeline — Escouade Ventes", date: "14 avril 2026", time: "09h00", type: "cellule", icon: Atom, color: "bg-emerald-50 text-emerald-600" },
    { id: 5, title: "Demo produit — Prospect Boréal", date: "15 avril 2026", time: "15h30", type: "prospect", icon: Rocket, color: "bg-amber-50 text-amber-600" },
    { id: 6, title: "Formation TimeTokens — Nouveaux membres", date: "17 avril 2026", time: "13h00", type: "formation", icon: GraduationCap, color: "bg-pink-50 text-pink-600" },
  ];

  return (
    <div className="space-y-3">
      <O9SectionHeader icon={Calendar} title="Agenda réseau" subtitle="Événements et rencontres" tabs={[
        { id: "a-venir", label: "À venir", gradient: O9_GRADIENT },
        { id: "passes", label: "Passés", gradient: "from-slate-600 to-slate-500" },
        { id: "mes-rdv", label: "Mes RDV", gradient: "from-emerald-600 to-emerald-500" },
      ]} activeTab="a-venir" onTabChange={() => {}} gradient={O9_GRADIENT} />
      <div className="space-y-2">
        {UPCOMING_EVENTS.map(ev => {
          const EvIcon = ev.icon;
          return (
            <div key={ev.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", ev.color.split(" ")[0])}>
                  <EvIcon className={cn("h-4 w-4", ev.color.split(" ")[1])} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-gray-900 truncate">{ev.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-500">{ev.date}</span>
                    <span className="text-[10px] font-medium text-gray-700">{ev.time}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{ev.type}</span>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========== TAB SECONDAIRE: SANTÉ RÉSEAU ==========

function O9SanteReseauTab() {
  return (
    <div className="space-y-3">
      <O9SectionHeader icon={HeartPulse} title="Santé réseau" subtitle="Diagnostic holistique de l'écosystème" tabs={[
        { id: "vue-ensemble", label: "Vue d'ensemble", gradient: O9_GRADIENT },
        { id: "diagnostics", label: "Diagnostics", gradient: "from-violet-600 to-violet-500" },
        { id: "resultats", label: "Résultats", gradient: "from-emerald-600 to-emerald-500" },
      ]} activeTab="vue-ensemble" onTabChange={() => {}} gradient={O9_GRADIENT} />
      <SanteGlobaleView botCode="CEOB" santeSub="vue-ensemble" />
    </div>
  );
}
