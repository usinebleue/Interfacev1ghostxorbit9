/**
 * CockpitPanel.tsx — Cockpit sidebar droite (MVP2 Discussion Architecture)
 * 4 onglets: "État" (défaut) | "Discussions" | "Équipe AI" | "Humains"
 * + InputBar compact en bas (on communique avec CarlOS depuis le cockpit)
 */

import { useState, useMemo } from "react";
import {
  Activity,
  Bot,
  Users,
  UserCircle,
  Zap,
  Brain,
  BarChart3,
  Phone,
  ArrowRight,
  MessageSquare,
  Flame,
  Bookmark,
  GitBranch,
  Trash2,
  Scale,
  Target,
  Sparkles,
  Swords,
  ClipboardList,
  Rocket,
  MessagesSquare,
  Waves,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster, type ActiveView } from "../../context/FrameMasterContext";
import { useChantiers } from "../../api/hooks";
import { CarlOsPulse } from "./CarlOsPulse";
import { InputBar } from "../center/InputBar";
import { BOT_NAME, BOT_ROLE, BOT_AVATAR } from "../../api/types";

// ──────────────────────────────────────────
// Les 12 bots dans l'ordre C-Level
// ──────────────────────────────────────────
const ALL_BOTS = [
  "CEOB", "CTOB", "CFOB", "CMOB", "CSOB", "COOB",
  "CPOB", "CHROB", "CINOB", "CROB", "CLOB", "CISOB",
] as const;

// ──────────────────────────────────────────
// Quick Actions — 8 actions par bot (spécialités)
// ──────────────────────────────────────────
type QuickAction = { label: string; icon: React.ElementType; message: string; color: string; bg: string };

const BOT_QUICK_ACTIONS: Record<string, QuickAction[]> = {
  CEOB: [
    { label: "Diagnostic rapide", icon: Zap, message: "Fais un diagnostic rapide de ma situation", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { label: "Cahier de projet", icon: ClipboardList, message: "Aide-moi à monter un cahier de projet", color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
    { label: "Plan stratégique", icon: Target, message: "Je veux bâtir un plan stratégique", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
    { label: "Vision d'ensemble", icon: Sparkles, message: "Donne-moi une vision d'ensemble de ma situation", color: "text-cyan-600", bg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
    { label: "Priorisation", icon: Target, message: "Aide-moi à prioriser mes projets", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200" },
    { label: "Nouveau chantier", icon: Flame, message: "Je veux démarrer un nouveau chantier", color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
    { label: "Plan d'action", icon: Rocket, message: "Aide-moi à faire un plan d'action concret", color: "text-purple-600", bg: "bg-purple-50 hover:bg-purple-100 border-purple-200" },
    { label: "Analyse VITAA", icon: Activity, message: "Fais une analyse VITAA de mon entreprise", color: "text-red-600", bg: "bg-red-50 hover:bg-red-100 border-red-200" },
  ],
  CFOB: [
    { label: "Analyse financière", icon: BarChart3, message: "Fais une analyse financière", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
    { label: "Budget prévisionnel", icon: ClipboardList, message: "Aide-moi à bâtir un budget prévisionnel", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { label: "ROI rapide", icon: Zap, message: "Calcule-moi un ROI rapide", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
    { label: "Cash flow", icon: Activity, message: "Analyse mon cash flow", color: "text-cyan-600", bg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
    { label: "Ratios clés", icon: BarChart3, message: "Montre-moi mes ratios financiers clés", color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
    { label: "Subventions", icon: Sparkles, message: "Quelles subventions sont disponibles pour moi?", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200" },
    { label: "Coûts de revient", icon: Target, message: "Aide-moi à calculer mes coûts de revient", color: "text-red-600", bg: "bg-red-50 hover:bg-red-100 border-red-200" },
    { label: "Rentabilité", icon: Rocket, message: "Analyse la rentabilité de mes produits", color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
  ],
  CTOB: [
    { label: "Audit techno", icon: Zap, message: "Fais un audit technologique de mon entreprise", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200" },
    { label: "Architecture", icon: Brain, message: "Aide-moi à structurer mon architecture technologique", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { label: "Roadmap techno", icon: Target, message: "Bâtis une roadmap technologique", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
    { label: "Sécurité", icon: Activity, message: "Évalue la sécurité de mes systèmes", color: "text-red-600", bg: "bg-red-50 hover:bg-red-100 border-red-200" },
    { label: "Automatisation", icon: Sparkles, message: "Quels processus automatiser en priorité?", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
    { label: "Stack actuel", icon: ClipboardList, message: "Analyse mon stack technologique actuel", color: "text-cyan-600", bg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
    { label: "IA & données", icon: Brain, message: "Comment intégrer l'IA dans mes opérations?", color: "text-pink-600", bg: "bg-pink-50 hover:bg-pink-100 border-pink-200" },
    { label: "Migration cloud", icon: Rocket, message: "Planifie une migration cloud", color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
  ],
  CMOB: [
    { label: "Plan marketing", icon: Target, message: "Bâtis un plan marketing", color: "text-pink-600", bg: "bg-pink-50 hover:bg-pink-100 border-pink-200" },
    { label: "Positionnement", icon: Sparkles, message: "Analyse mon positionnement de marché", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200" },
    { label: "Campagne", icon: Rocket, message: "Crée une campagne marketing", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { label: "Persona client", icon: Users, message: "Définis mes personas clients", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
    { label: "Contenu", icon: ClipboardList, message: "Aide-moi avec ma stratégie de contenu", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
    { label: "Réseaux sociaux", icon: MessagesSquare, message: "Optimise ma présence sur les réseaux sociaux", color: "text-cyan-600", bg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
    { label: "Image de marque", icon: Zap, message: "Travaille sur mon image de marque", color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
    { label: "Événements", icon: Activity, message: "Planifie mes événements marketing", color: "text-red-600", bg: "bg-red-50 hover:bg-red-100 border-red-200" },
  ],
  CSOB: [
    { label: "Plan stratégique", icon: Target, message: "Je veux bâtir un plan stratégique", color: "text-red-600", bg: "bg-red-50 hover:bg-red-100 border-red-200" },
    { label: "Analyse concurrence", icon: Swords, message: "Analyse ma concurrence", color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
    { label: "Avantage compétitif", icon: Sparkles, message: "Quel est mon avantage compétitif?", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
    { label: "Nouveaux marchés", icon: Rocket, message: "Identifie de nouveaux marchés pour moi", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { label: "Partenariats", icon: Users, message: "Quels partenariats stratégiques explorer?", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200" },
    { label: "Risques", icon: Flame, message: "Évalue mes risques stratégiques", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
    { label: "Veille sectorielle", icon: Brain, message: "Fais une veille de mon secteur", color: "text-cyan-600", bg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
    { label: "Vision 3 ans", icon: Target, message: "Aide-moi à définir ma vision à 3 ans", color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
  ],
  COOB: [
    { label: "Audit opérations", icon: ClipboardList, message: "Fais un audit de mes opérations", color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
    { label: "Processus", icon: Activity, message: "Optimise mes processus opérationnels", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { label: "KPIs", icon: BarChart3, message: "Définis mes KPIs opérationnels", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
    { label: "Chaîne valeur", icon: Target, message: "Analyse ma chaîne de valeur", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200" },
    { label: "Qualité", icon: Sparkles, message: "Mets en place un programme qualité", color: "text-cyan-600", bg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
    { label: "Lean", icon: Zap, message: "Applique les principes Lean à mes opérations", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
    { label: "Logistique", icon: Rocket, message: "Optimise ma logistique", color: "text-red-600", bg: "bg-red-50 hover:bg-red-100 border-red-200" },
    { label: "Tableau de bord", icon: BarChart3, message: "Crée un tableau de bord opérationnel", color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
  ],
  CPOB: [
    { label: "Diagnostic terrain", icon: Zap, message: "Fais un diagnostic terrain de mon usine", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { label: "Cahier industriel", icon: ClipboardList, message: "Aide-moi à monter un cahier industriel", color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
    { label: "Sélection équipement", icon: Target, message: "Aide-moi à sélectionner un équipement", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
    { label: "ROI automatisation", icon: BarChart3, message: "Calcule le ROI d'un projet d'automatisation", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
    { label: "Benchmarks secteur", icon: Brain, message: "Montre-moi les benchmarks de mon secteur", color: "text-cyan-600", bg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
    { label: "Audit 4.0", icon: Sparkles, message: "Évalue ma maturité Industrie 4.0", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200" },
    { label: "Subventions", icon: Rocket, message: "Quelles subventions pour mon projet industriel?", color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
    { label: "Réseau fournisseurs", icon: Users, message: "Connecte-moi au réseau de fournisseurs", color: "text-red-600", bg: "bg-red-50 hover:bg-red-100 border-red-200" },
  ],
  CHROB: [
    { label: "Audit RH", icon: ClipboardList, message: "Fais un audit de mes ressources humaines", color: "text-teal-600", bg: "bg-teal-50 hover:bg-teal-100 border-teal-200" },
    { label: "Recrutement", icon: Users, message: "Aide-moi avec mon recrutement", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { label: "Formation", icon: Brain, message: "Planifie un programme de formation", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200" },
    { label: "Rétention", icon: Target, message: "Améliore la rétention de mes employés", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
    { label: "Culture", icon: Sparkles, message: "Travaille sur la culture d'entreprise", color: "text-pink-600", bg: "bg-pink-50 hover:bg-pink-100 border-pink-200" },
    { label: "Évaluations", icon: BarChart3, message: "Mets en place un système d'évaluation", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
    { label: "Bien-être", icon: Activity, message: "Programme de bien-être au travail", color: "text-cyan-600", bg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
    { label: "Politiques RH", icon: ClipboardList, message: "Révise mes politiques RH", color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
  ],
  CINOB: [
    { label: "Veille innovation", icon: Sparkles, message: "Fais une veille innovation pour mon secteur", color: "text-cyan-600", bg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
    { label: "R&D", icon: Brain, message: "Structure mon département R&D", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200" },
    { label: "Propriété intel.", icon: Target, message: "Protège ma propriété intellectuelle", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { label: "Nouveaux produits", icon: Rocket, message: "Développe de nouveaux produits", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
    { label: "Tendances", icon: Activity, message: "Identifie les tendances de mon industrie", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
    { label: "Pivots possibles", icon: Zap, message: "Quels pivots stratégiques envisager?", color: "text-red-600", bg: "bg-red-50 hover:bg-red-100 border-red-200" },
    { label: "Open innovation", icon: Users, message: "Explore l'open innovation", color: "text-pink-600", bg: "bg-pink-50 hover:bg-pink-100 border-pink-200" },
    { label: "Design thinking", icon: Brain, message: "Applique le design thinking à mon défi", color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
  ],
  CROB: [
    { label: "Pipeline ventes", icon: BarChart3, message: "Analyse mon pipeline de ventes", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
    { label: "Stratégie vente", icon: Target, message: "Bâtis une stratégie de vente", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { label: "Prospection", icon: Rocket, message: "Améliore ma prospection", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
    { label: "Négociation", icon: Swords, message: "Prépare-moi pour une négociation", color: "text-red-600", bg: "bg-red-50 hover:bg-red-100 border-red-200" },
    { label: "CRM", icon: ClipboardList, message: "Optimise mon utilisation du CRM", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200" },
    { label: "Closing", icon: Zap, message: "Améliore mon taux de closing", color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
    { label: "Équipe ventes", icon: Users, message: "Coaching pour mon équipe de ventes", color: "text-cyan-600", bg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
    { label: "Upsell/Cross-sell", icon: Sparkles, message: "Stratégie d'upsell et cross-sell", color: "text-pink-600", bg: "bg-pink-50 hover:bg-pink-100 border-pink-200" },
  ],
  CLOB: [
    { label: "Conformité", icon: ClipboardList, message: "Vérifie ma conformité légale", color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
    { label: "Contrats", icon: Target, message: "Révise mes contrats", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { label: "Propriété intel.", icon: Brain, message: "Protège ma propriété intellectuelle", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200" },
    { label: "Risques légaux", icon: Flame, message: "Évalue mes risques légaux", color: "text-red-600", bg: "bg-red-50 hover:bg-red-100 border-red-200" },
    { label: "Normes", icon: Activity, message: "Quelles normes s'appliquent à moi?", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
    { label: "Gouvernance", icon: Users, message: "Structure ma gouvernance d'entreprise", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
    { label: "RGPD/Vie privée", icon: Zap, message: "Assure ma conformité vie privée", color: "text-cyan-600", bg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
    { label: "Droit du travail", icon: Sparkles, message: "Vérifie mes obligations en droit du travail", color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
  ],
  CISOB: [
    { label: "Audit sécurité", icon: Zap, message: "Fais un audit de cybersécurité", color: "text-zinc-600", bg: "bg-zinc-50 hover:bg-zinc-100 border-zinc-200" },
    { label: "Plan de sécurité", icon: Target, message: "Bâtis un plan de cybersécurité", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { label: "Formation sécu", icon: Brain, message: "Programme de sensibilisation cybersécurité", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200" },
    { label: "Incidents", icon: Flame, message: "Plan de réponse aux incidents", color: "text-red-600", bg: "bg-red-50 hover:bg-red-100 border-red-200" },
    { label: "Backups", icon: Activity, message: "Vérifie ma stratégie de backup", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
    { label: "Accès & mots passe", icon: Users, message: "Audit de mes contrôles d'accès", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
    { label: "Risques cyber", icon: Swords, message: "Évalue mes risques cyber", color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
    { label: "Conformité", icon: ClipboardList, message: "Conformité aux normes de sécurité", color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
  ],
};

// Fallback — actions par défaut si bot inconnu
const DEFAULT_QUICK_ACTIONS: QuickAction[] = BOT_QUICK_ACTIONS.CEOB;

// ──────────────────────────────────────────
// Modes de réflexion = les 8+1 modes de pensée (COMMENT on réfléchit)
// ──────────────────────────────────────────
const REFLECTION_MODES = [
  { label: "Brainstorm", icon: Brain, mode: "brainstorm", color: "text-amber-500", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
  { label: "Analyse", icon: BarChart3, mode: "analyse", color: "text-red-500", bg: "bg-red-50 hover:bg-red-100 border-red-200" },
  { label: "Décision", icon: Scale, mode: "decision", color: "text-indigo-500", bg: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
  { label: "Stratégie", icon: Target, mode: "strategie", color: "text-emerald-500", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
  { label: "Crise", icon: Swords, mode: "crise", color: "text-red-600", bg: "bg-red-50 hover:bg-red-100 border-red-200" },
  { label: "Innovation", icon: Sparkles, mode: "innovation", color: "text-pink-500", bg: "bg-pink-50 hover:bg-pink-100 border-pink-200" },
  { label: "Débat", icon: MessagesSquare, mode: "debat", color: "text-orange-500", bg: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
  { label: "Deep", icon: Waves, mode: "deep", color: "text-cyan-600", bg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
];

// ──────────────────────────────────────────
// Tab "État" — onglet par défaut (alertes, recommandations, quick actions, modes)
// ──────────────────────────────────────────
function TabEtat({ onQuickAction, onReflectionMode, onNavigate }: {
  onQuickAction: (msg: string, bot: string) => void;
  onReflectionMode: (mode: string) => void;
  onNavigate: (view: string, bot?: string) => void;
}) {
  const { chantiers } = useChantiers();
  const { activeBotCode } = useFrameMaster();

  const activeBotName = BOT_NAME[activeBotCode] || "CarlOS";
  const botActions = BOT_QUICK_ACTIONS[activeBotCode] || DEFAULT_QUICK_ACTIONS;

  // Alertes = NAVIGATION (pas de discussion) — cliquables, naviguent vers la section
  const alerts = useMemo(() => {
    const items: { icon: React.ElementType; color: string; text: string; navView: string; navBot?: string }[] = [];
    const brulants = chantiers.filter((c) => c.chaleur === "brule");
    if (brulants.length > 0) {
      items.push({
        icon: Flame, color: "text-orange-500",
        text: `${brulants.length} chantier${brulants.length > 1 ? "s" : ""} en feu`,
        navView: "espace-bureau",
      });
    }
    return items;
  }, [chantiers]);

  return (
    <div className="p-3 space-y-3 overflow-y-auto h-full text-[9px]">
      {/* Signaux — petit bandeau alerte */}
      <CarlOsPulse compact />

      {/* Alertes — cliquables, NAVIGUENT vers la section (pas de discussion) */}
      {alerts.length > 0 && (
        <div>
          <div className="font-semibold text-gray-600 mb-2 text-[9px] uppercase tracking-wider flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-yellow-500" /> {activeBotName} recommande
          </div>
          <div className="space-y-1">
            {alerts.map((a, i) => (
              <button
                key={i}
                onClick={() => onNavigate(a.navView, a.navBot)}
                className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5 w-full text-left cursor-pointer hover:bg-orange-50 transition-colors"
              >
                <a.icon className={cn("h-3.5 w-3.5 shrink-0", a.color)} />
                <span className="text-gray-700 flex-1 truncate">{a.text}</span>
                <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2 colonnes: Actions rapides (8 par bot) | Modes de réflexion (8 fixes) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Actions rapides — spécifiques au bot actif */}
        <div>
          <div className="font-semibold text-gray-600 mb-1.5 text-[9px] uppercase tracking-wider">Actions</div>
          <div className="space-y-1">
            {botActions.map((a) => (
              <button
                key={a.label}
                onClick={() => onQuickAction(a.message, activeBotCode)}
                className={cn(
                  "flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg border text-left transition-all cursor-pointer",
                  a.bg
                )}
              >
                <a.icon className={cn("h-3.5 w-3.5 shrink-0", a.color)} />
                <span className="text-[9px] text-gray-700 font-medium truncate">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modes de réflexion — COMMENT on réfléchit (8 fixes, mêmes pour tous les bots) */}
        <div>
          <div className="font-semibold text-gray-600 mb-1.5 text-[9px] uppercase tracking-wider">Réflexion</div>
          <div className="space-y-1">
            {REFLECTION_MODES.map((m) => (
              <button
                key={m.mode}
                onClick={() => onReflectionMode(m.mode)}
                className={cn(
                  "flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg border text-left transition-all cursor-pointer",
                  m.bg
                )}
              >
                <m.icon className={cn("h-3.5 w-3.5 shrink-0", m.color)} />
                <span className="text-[9px] text-gray-700 font-medium truncate">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// Tab "Discussions" — threads actifs + branches cliquables
// ──────────────────────────────────────────
function TabDiscussions() {
  const { threads, activeThreadId, messages, resumeThread, deleteThread, newConversation } = useChatContext();
  const { setActiveView } = useFrameMaster();

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const parkedThreads = threads.filter((t) => t.id !== activeThreadId);
  const hasActiveMessages = messages.length > 0;

  const handleNewDiscussion = () => {
    newConversation();
    setActiveView("live-chat");
  };

  const handleDeleteActive = () => {
    if (activeThreadId) {
      deleteThread(activeThreadId);
    }
  };

  return (
    <div className="p-3 space-y-3 overflow-y-auto h-full text-[9px]">
      {/* Bouton Nouvelle discussion — toujours visible */}
      <button
        onClick={handleNewDiscussion}
        className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors cursor-pointer"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Nouvelle discussion
      </button>

      {/* Discussion active */}
      {activeThread && hasActiveMessages && (
        <div className="flex items-center gap-1.5 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200 group">
          <MessageSquare className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <button
            onClick={() => setActiveView("live-chat")}
            className="flex-1 text-left text-blue-700 font-medium truncate cursor-pointer hover:text-blue-800 transition-colors"
          >
            {activeThread.title || "Discussion en cours"}
          </button>
          <button
            onClick={handleDeleteActive}
            className="p-1 rounded hover:bg-red-100 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {!hasActiveMessages && parkedThreads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-4 text-gray-400">
          <div className="text-center">Aucune discussion en cours.</div>
        </div>
      )}

      {/* Branches parkées — cliquables + supprimables */}
      {parkedThreads.length > 0 && (
        <div>
          <div className="font-semibold text-gray-600 mb-2 text-[9px] uppercase tracking-wider flex items-center gap-1">
            <GitBranch className="h-3.5 w-3.5 text-violet-500" /> Branches ({parkedThreads.length})
          </div>
          <div className="space-y-1">
            {parkedThreads.map((t) => (
              <div key={t.id} className="flex items-center gap-1.5 bg-violet-50 rounded-lg px-2.5 py-1.5 border border-violet-100 group">
                <Bookmark className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                <button
                  onClick={() => {
                    resumeThread(t.id);
                    setActiveView("live-chat");
                  }}
                  className="flex-1 text-left text-gray-700 truncate cursor-pointer hover:text-violet-700 transition-colors"
                  title="Reprendre cette branche"
                >
                  {t.title || "Branche sans titre"}
                </button>
                <button
                  onClick={() => deleteThread(t.id)}
                  className="p-1 rounded hover:bg-red-100 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// Tab "Mon Équipe d'Agents AI" — 12 agents
// ──────────────────────────────────────────
function TabEquipeAI() {
  const { activeBotCode, setActiveBotCode, setActiveView } = useFrameMaster();

  const handleSelectBot = (code: string) => {
    setActiveBotCode(code);
    setActiveView("live-chat");
  };

  return (
    <div className="p-2 overflow-y-auto h-full text-[9px]">
      <div className="space-y-0.5">
        {ALL_BOTS.map((code) => {
          const isActive = activeBotCode === code;
          return (
            <div
              key={code}
              className={cn(
                "flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all group",
                isActive ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"
              )}
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-gray-100">
                <img
                  src={BOT_AVATAR[code]}
                  alt={BOT_NAME[code]}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              {/* Name + Role — "Communiquer avec [Nom]" */}
              <button
                onClick={() => handleSelectBot(code)}
                className="flex-1 min-w-0 text-left cursor-pointer"
                title={`Communiquer avec ${BOT_NAME[code]}`}
              >
                <div className={cn("text-[11px] font-medium truncate", isActive ? "text-blue-700" : "text-gray-800")}>
                  {BOT_NAME[code]}
                </div>
                <div className="text-[9px] text-gray-400 truncate">{BOT_ROLE[code]}</div>
              </button>

              {/* Call icon */}
              <button
                onClick={() => {
                  setActiveBotCode(code);
                  const sidebar = document.querySelector("[data-sidebar-right]");
                  sidebar?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="p-1.5 rounded-full hover:bg-green-100 text-gray-300 hover:text-green-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                title={`Appeler ${BOT_NAME[code]}`}
              >
                <Phone className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// Tab "Humains" — placeholder
// ──────────────────────────────────────────
function TabEquipeHumaine() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-[9px] p-4">
      <UserCircle className="h-8 w-8 mb-2 text-gray-300" />
      <div className="font-medium text-gray-500">Mon équipe humaine</div>
      <div className="text-center mt-1">
        Ajoutez des membres humains à votre équipe pour collaborer avec vos agents AI.
      </div>
      <button className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer font-medium">
        Inviter un membre
      </button>
    </div>
  );
}

// ──────────────────────────────────────────
// CockpitPanel — composant principal (4 onglets)
// ──────────────────────────────────────────
type CockpitTab = "etat" | "discussions" | "equipe_ai" | "equipe_humaine";

export function CockpitPanel() {
  const [activeTab, setActiveTab] = useState<CockpitTab>("etat");
  const { sendMessage, setReflectionMode, newConversation } = useChatContext();
  const { activeBotCode, setActiveBotCode, setActiveView } = useFrameMaster();

  // Actions rapides — TOUJOURS nouvelle discussion
  const handleQuickAction = (message: string, botCode: string) => {
    newConversation();
    setActiveBotCode(botCode);
    setActiveView("live-chat");
    setTimeout(() => sendMessage(message, botCode), 150);
  };

  // Modes de réflexion — TOUJOURS nouvelle discussion dans ce mode
  const handleReflectionMode = (mode: string) => {
    newConversation();
    setReflectionMode(mode as import("../../api/types").ReflectionMode);
    setActiveView("live-chat");
  };

  // Alertes = NAVIGATION (pas de discussion)
  const handleNavigate = (view: string, bot?: string) => {
    if (bot) setActiveBotCode(bot);
    setActiveView(view as ActiveView);
  };

  const tabs: { id: CockpitTab; label: string; icon: React.ElementType }[] = [
    { id: "etat", label: "État", icon: Activity },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "equipe_ai", label: "Agents AI", icon: Bot },
    { id: "equipe_humaine", label: "Humains", icon: Users },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden" data-sidebar-right>
      {/* Tab bar — 4 onglets */}
      <div className="flex border-b shrink-0 bg-gray-50/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-2 text-[9px] font-medium transition-colors cursor-pointer",
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-500 bg-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "etat" ? (
          <TabEtat onQuickAction={handleQuickAction} onReflectionMode={handleReflectionMode} onNavigate={handleNavigate} />
        ) : activeTab === "discussions" ? (
          <TabDiscussions />
        ) : activeTab === "equipe_ai" ? (
          <TabEquipeAI />
        ) : (
          <TabEquipeHumaine />
        )}
      </div>

      {/* InputBar compact — toujours visible en bas du cockpit */}
      <div className="shrink-0 border-t">
        <InputBar compact />
      </div>
    </div>
  );
}
