/**
 * MasterBibleVisuelCiblePage.tsx — A.5 Bible Visuelle Cible
 * Bibliotheque vide de standards visuels — 14 categories, ~120 composants a definir
 * Carl remplit chaque slot en pointant vers A.1 (conceptuel) ou A.4 (live)
 * Session 50
 */

import { useState } from "react";
import {
  Crosshair,
  Layout, PanelTop, CreditCard, Compass,
  Zap, Pencil, Type, Palette,
  MessageSquare, Image, Activity, Layers,
  SlidersHorizontal, MonitorSmartphone,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ================================================================
// TABS — 14 categories de composants
// ================================================================

const TABS = [
  { id: "structure", label: "1. Structure", icon: Layout },
  { id: "headers", label: "2. Headers", icon: PanelTop },
  { id: "cards", label: "3. Cards", icon: CreditCard },
  { id: "navigation", label: "4. Navigation", icon: Compass },
  { id: "boutons", label: "5. Boutons", icon: Zap },
  { id: "inputs", label: "6. Inputs", icon: Pencil },
  { id: "typographie", label: "7. Typo", icon: Type },
  { id: "couleurs", label: "8. Couleurs", icon: Palette },
  { id: "messages", label: "9. Messages", icon: MessageSquare },
  { id: "media", label: "10. Media", icon: Image },
  { id: "indicateurs", label: "11. Status", icon: Activity },
  { id: "data-display", label: "12. Data", icon: SlidersHorizontal },
  { id: "complexes", label: "13. Complexes", icon: Layers },
  { id: "responsive", label: "14. Mobile", icon: MonitorSmartphone },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ================================================================
// SLOT DATA — Chaque slot = un composant a standardiser
// ================================================================

interface SlotDef {
  id: string;
  name: string;
  desc: string;
  refs: string[];
  wireframe?: React.ReactNode;
}

interface CategoryDef {
  title: string;
  desc: string;
  color: string;
  slots: SlotDef[];
}

const CATEGORIES: Record<TabId, CategoryDef> = {
  // ────────────────────────────────────────────────────────────
  // 1. STRUCTURE DE PAGE
  // ────────────────────────────────────────────────────────────
  structure: {
    title: "Structure de Page",
    desc: "Wrappers, grilles, espacements, scroll, zones fixes vs dynamiques",
    color: "blue",
    slots: [
      { id: "wrapper-page", name: "Wrapper de page standard", desc: "max-w-4xl mx-auto px-10 py-5 pb-12 — squelette de toute sous-page", refs: ["A.4.3.1"],
        wireframe: <div className="h-12 border border-gray-300 rounded p-1.5 flex items-center justify-center"><div className="w-3/4 h-full bg-gray-200 rounded" /></div> },
      { id: "layout-3-zones", name: "Layout 3 zones (sidebar-centre-sidebar)", desc: "ResizablePanelGroup horizontal, min/max widths, collapse/expand", refs: ["A.4.3.2"],
        wireframe: <div className="h-12 flex gap-1"><div className="w-1/5 bg-gray-200 rounded" /><div className="flex-1 bg-gray-300 rounded" /><div className="w-1/5 bg-gray-200 rounded" /></div> },
      { id: "layout-2-col", name: "Layout 2 colonnes centre", desc: "Split centre pour departement + chat cote a cote ou stacked", refs: ["A.4.3.3"],
        wireframe: <div className="h-12 flex gap-1"><div className="flex-1 bg-gray-200 rounded" /><div className="flex-1 bg-gray-200 rounded" /></div> },
      { id: "layout-full-width", name: "Layout pleine largeur", desc: "Dashboard blocs en stretch, sans max-width, grilles adaptatives", refs: ["A.4.3.4"],
        wireframe: <div className="h-12"><div className="w-full h-full bg-gray-200 rounded" /></div> },
      { id: "spacing-vertical", name: "Espacement vertical entre sections", desc: "Gaps entre blocs (space-y-6 vs space-y-4), padding interne cards", refs: ["A.4.7"],
        wireframe: <div className="h-14 flex flex-col justify-between"><div className="h-3 bg-gray-300 rounded" /><div className="h-3 bg-gray-300 rounded" /><div className="h-3 bg-gray-300 rounded" /></div> },
      { id: "spacing-horizontal", name: "Espacement horizontal", desc: "Gaps de grilles (gap-3 vs gap-4 vs gap-6), marges laterales", refs: ["A.4.7"],
        wireframe: <div className="h-12 flex justify-between gap-2"><div className="flex-1 bg-gray-300 rounded" /><div className="flex-1 bg-gray-300 rounded" /><div className="flex-1 bg-gray-300 rounded" /></div> },
      { id: "dividers", name: "Separateurs visuels", desc: "Gradient tricolore, border-t simple, border dashed, section breaks", refs: ["A.4.17.4"],
        wireframe: <div className="h-12 flex flex-col justify-around px-1"><div className="h-px bg-gray-400" /><div className="h-px border-t border-dashed border-gray-400" /><div className="h-1 rounded bg-gradient-to-r from-green-300 via-blue-300 to-purple-300" /></div> },
      { id: "scroll-zones", name: "Zones scrollables", desc: "overflow-y-auto, custom scrollbar, scroll-smooth, zone fixe vs scroll", refs: ["A.4.3"],
        wireframe: <div className="h-14 flex gap-1"><div className="flex-1 flex flex-col gap-0.5 overflow-hidden"><div className="h-2 bg-gray-200 rounded" /><div className="h-2 bg-gray-200 rounded" /><div className="h-2 bg-gray-200 rounded" /><div className="h-2 bg-gray-200 rounded" /><div className="h-2 bg-gray-200 rounded" /></div><div className="w-1 bg-gray-300 rounded-full" /></div> },
      { id: "z-index", name: "Couches Z-index", desc: "Hierarchie z-10/20/30/40/50 — sidebar, modals, overlays, toasts, dropdowns", refs: ["Nouveau"],
        wireframe: <div className="h-14 relative"><div className="absolute top-0 left-0 w-8 h-8 bg-gray-200 rounded border border-gray-300" /><div className="absolute top-2 left-3 w-8 h-8 bg-gray-300 rounded border border-gray-400" /><div className="absolute top-4 left-6 w-8 h-8 bg-gray-400 rounded border border-gray-500" /></div> },
      { id: "panel-resize", name: "Panels redimensionnables", desc: "ResizablePanel min/max/default sizes, handle grip visuel", refs: ["A.4.3.2"],
        wireframe: <div className="h-12 flex items-stretch gap-0"><div className="flex-1 bg-gray-200 rounded-l" /><div className="w-2 bg-gray-400 flex flex-col items-center justify-center gap-0.5"><div className="w-0.5 h-0.5 bg-gray-600 rounded-full" /><div className="w-0.5 h-0.5 bg-gray-600 rounded-full" /><div className="w-0.5 h-0.5 bg-gray-600 rounded-full" /></div><div className="flex-1 bg-gray-200 rounded-r" /></div> },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 2. HEADERS
  // ────────────────────────────────────────────────────────────
  headers: {
    title: "Headers",
    desc: "Tous les types d'en-tetes — objectif: normaliser de 17+ improvises a 4-5 standards",
    color: "violet",
    slots: [
      { id: "page-header", name: "PageHeader standard", desc: "Icon + titre + sous-titre + bouton back + rightSlot — header par defaut", refs: ["A.4.4.1"],
        wireframe: <div className="h-10 flex items-center gap-1.5"><div className="w-5 h-5 bg-gray-300 rounded" /><div className="w-5 h-5 bg-gray-300 rounded-full" /><div className="flex-1 flex flex-col gap-0.5"><div className="h-2.5 w-2/3 bg-gray-300 rounded" /><div className="h-1.5 w-1/3 bg-gray-200 rounded" /></div><div className="w-8 h-5 bg-gray-200 rounded" /></div> },
      { id: "gradient-dept", name: "Header gradient departement", desc: "Bandeau colore rounded-xl, icon bg-white/20, titre lg, 4 sub-tabs", refs: ["A.4.4.5"],
        wireframe: <div className="h-10 bg-gradient-to-r from-blue-400 to-blue-300 rounded-lg px-2 flex items-center gap-1.5"><div className="w-5 h-5 bg-white/20 rounded" /><div className="h-2.5 w-1/3 bg-white/40 rounded" /><div className="flex-1" /><div className="flex gap-0.5">{["","",""].map((_,i)=><div key={i} className="w-6 h-3.5 bg-white/20 rounded" />)}</div></div> },
      { id: "card-header-gradient", name: "Header de card gradient", desc: "px-4 py-2.5 integre dans une card, titre + badge count + icon", refs: ["A.4.4.6", "A.4.4.16"],
        wireframe: <div className="h-8 bg-gradient-to-r from-violet-400 to-violet-300 rounded-t-lg px-2 flex items-center gap-1"><div className="w-3.5 h-3.5 bg-white/30 rounded" /><div className="h-2 w-1/3 bg-white/40 rounded" /><div className="flex-1" /><div className="w-4 h-4 bg-white/30 rounded-full" /></div> },
      { id: "mini-header", name: "Header compact (mini)", desc: "py-1.5 px-3, petit texte, pour sous-sections internes et slots", refs: ["A.4.4.17"],
        wireframe: <div className="h-5 bg-gray-200 rounded px-2 flex items-center"><div className="h-1.5 w-1/4 bg-gray-400 rounded" /></div> },
      { id: "chat-header", name: "Header LiveChat complexe", desc: "backdrop-blur bg-white/80, titre bot, boutons Park/Idees/Threads/New/LIVE", refs: ["A.4.4.2"],
        wireframe: <div className="h-10 bg-white/80 rounded-lg border border-gray-200 px-2 flex items-center gap-1.5"><div className="w-5 h-5 bg-blue-200 rounded-full" /><div className="h-2.5 w-1/4 bg-gray-300 rounded" /><div className="flex-1" /><div className="flex gap-0.5">{[1,2,3,4].map(i=><div key={i} className="w-4 h-4 bg-gray-200 rounded" />)}</div></div> },
      { id: "mode-bar", name: "ModeBar (8 modes)", desc: "Pills colores horizontaux, branch progress bar, Avancer/Terminer/Annuler", refs: ["A.4.4.3"],
        wireframe: <div className="h-8 flex items-center gap-0.5 overflow-hidden">{["bg-amber-300","bg-red-300","bg-emerald-300","bg-blue-300","bg-purple-300","bg-pink-300","bg-teal-300","bg-orange-300"].map((c,i)=><div key={i} className={`h-4 w-5 rounded-full ${c}`} />)}</div> },
      { id: "roster-bar", name: "BotRosterBar equipe", desc: "Emoji pills max 3 bots, bouton +Bot, label Equipe active", refs: ["A.4.4.4"],
        wireframe: <div className="h-8 flex items-center gap-1"><div className="h-2 w-8 bg-gray-200 rounded" /><div className="w-4 h-4 bg-blue-200 rounded-full" /><div className="w-4 h-4 bg-emerald-200 rounded-full" /><div className="w-4 h-4 bg-pink-200 rounded-full" /><div className="w-4 h-4 border border-dashed border-gray-300 rounded-full flex items-center justify-center text-[7px] text-gray-400">+</div></div> },
      { id: "block-header-dash", name: "BlockHeader dashboard", desc: "Marges negatives (-mx-4 -mt-4), gradient, icon w-7 h-7, uppercase tracking", refs: ["A.4.4.6"],
        wireframe: <div className="h-8 bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-lg px-2 flex items-center gap-1"><div className="w-4 h-4 bg-white/30 rounded" /><div className="h-1.5 w-1/3 bg-white/40 rounded" /><div className="flex-1" /><div className="w-5 h-3.5 bg-white/20 rounded-full" /></div> },
      { id: "diagnostic-header", name: "Header diagnostic card", desc: "Avatar bot w-8 rounded-lg + gradient couleur departement + titre", refs: ["A.4.4.11", "A.4.4.14"],
        wireframe: <div className="h-8 flex items-center gap-1"><div className="w-5 h-5 bg-gray-300 rounded-full" /><div className="flex-1 h-6 bg-gradient-to-r from-teal-300 to-teal-200 rounded px-1.5 flex items-center"><div className="h-1.5 w-1/2 bg-white/40 rounded" /></div></div> },
      { id: "tab-header-dynamic", name: "Header tabs dynamique", desc: "Gradient qui change de couleur selon le tab actif (3+ etats)", refs: ["A.4.4.13"],
        wireframe: <div className="h-9 bg-gradient-to-r from-violet-400 to-violet-300 rounded-lg px-2 flex items-center gap-1"><div className="h-2 w-1/4 bg-white/40 rounded" /><div className="flex-1" /><div className="flex gap-0.5"><div className="w-5 h-3.5 bg-white/50 rounded" /><div className="w-5 h-3.5 bg-white/20 rounded" /><div className="w-5 h-3.5 bg-white/20 rounded" /></div></div> },
      { id: "pastel-subheader", name: "Header pastel sous-section", desc: "from-xxx-50 leger, border-b subtle, texte sombre, dans HealthView", refs: ["A.4.4.15"],
        wireframe: <div className="h-6 bg-blue-50 border-b border-blue-100 rounded-t px-2 flex items-center"><div className="h-1.5 w-1/4 bg-blue-300 rounded" /></div> },
      { id: "hero-banner", name: "Banner hero / splash", desc: "aspect-[3/1], overlay gradient noir, avatar large ring-3, nom + role", refs: ["A.4.4"],
        wireframe: <div className="h-16 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg flex items-center justify-center relative"><div className="w-8 h-8 bg-gray-500 rounded-full ring-2 ring-white/30" /><div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1/3 bg-white/30 rounded" /></div> },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 3. CARDS
  // ────────────────────────────────────────────────────────────
  cards: {
    title: "Cards",
    desc: "Tous les types de cartes — KPI, departement, diagnostic, action, info, etc.",
    color: "emerald",
    slots: [
      { id: "kpi-card", name: "KPI Card standard", desc: "Icone + valeur grande + label + trend arrow, padding uniforme", refs: ["A.4.6", "A.1"],
        wireframe: <div className="h-14 bg-white rounded-lg border border-gray-200 p-1.5 flex flex-col justify-between"><div className="flex items-center gap-1"><div className="w-3.5 h-3.5 bg-gray-200 rounded" /><div className="h-1.5 w-1/3 bg-gray-200 rounded" /></div><div className="h-3 w-1/2 bg-gray-300 rounded" /><div className="flex items-center gap-0.5"><div className="text-[7px] text-emerald-400">↑</div><div className="h-1 w-6 bg-emerald-100 rounded" /></div></div> },
      { id: "dept-bloc", name: "Bloc departement cliquable", desc: "Header gradient + 4 KPIs + onClick Focus Mode + bandeau trio", refs: ["A.4.6"],
        wireframe: <div className="h-16 bg-white rounded-lg border border-gray-200 overflow-hidden"><div className="h-4 bg-gradient-to-r from-blue-400 to-blue-300" /><div className="p-1 grid grid-cols-2 gap-0.5"><div className="h-3.5 bg-gray-100 rounded" /><div className="h-3.5 bg-gray-100 rounded" /><div className="h-3.5 bg-gray-100 rounded" /><div className="h-3.5 bg-gray-100 rounded" /></div></div> },
      { id: "diagnostic-card", name: "Card diagnostic", desc: "Avatar bot + header gradient dept + KPIs badge + contenu analyse", refs: ["A.4.6"],
        wireframe: <div className="h-14 bg-white rounded-lg border border-gray-200 overflow-hidden"><div className="h-4 flex items-center gap-1 px-1 bg-gradient-to-r from-teal-300 to-teal-200"><div className="w-3 h-3 bg-white/40 rounded-full" /><div className="h-1.5 w-1/3 bg-white/40 rounded" /></div><div className="p-1 space-y-0.5"><div className="h-1.5 w-full bg-gray-200 rounded" /><div className="h-1.5 w-3/4 bg-gray-200 rounded" /></div></div> },
      { id: "info-card", name: "Card info simple", desc: "Titre + description, border subtle, pas de header gradient, contenu texte", refs: ["A.4.6"],
        wireframe: <div className="h-12 bg-white rounded-lg border border-gray-200 p-1.5 space-y-1"><div className="h-2 w-1/2 bg-gray-300 rounded" /><div className="h-1.5 w-full bg-gray-200 rounded" /><div className="h-1.5 w-2/3 bg-gray-200 rounded" /></div> },
      { id: "action-card", name: "Card action / CTA", desc: "Bouton CTA integre, hover effect, icone, pour lancer un flow ou action", refs: ["A.4.6"],
        wireframe: <div className="h-14 bg-white rounded-lg border border-gray-200 p-1.5 flex flex-col justify-between"><div className="space-y-0.5"><div className="h-2 w-1/2 bg-gray-300 rounded" /><div className="h-1.5 w-full bg-gray-200 rounded" /></div><div className="flex justify-end"><div className="h-3 w-8 bg-blue-400 rounded" /></div></div> },
      { id: "room-card", name: "Card room thematique", desc: "Gradient ambre/rouge/cyan, liste membres, bouton action, objectif", refs: ["A.4.3.5"],
        wireframe: <div className="h-14 bg-amber-50 rounded-lg border border-amber-200 p-1.5 space-y-1"><div className="h-2 w-1/2 bg-amber-300 rounded" /><div className="flex gap-0.5"><div className="w-3 h-3 bg-amber-200 rounded-full" /><div className="w-3 h-3 bg-amber-200 rounded-full" /><div className="w-3 h-3 bg-amber-200 rounded-full" /></div></div> },
      { id: "bot-identity-card", name: "Card identite bot", desc: "Avatar 3:1 + nom + role + code 3 lettres + trisociation + status", refs: ["A.4.1", "A.4.2"],
        wireframe: <div className="h-14 bg-white rounded-lg border border-gray-200 p-1.5 flex gap-2"><div className="w-8 h-full bg-gray-200 rounded-full" /><div className="flex-1 flex flex-col justify-center gap-0.5"><div className="h-2 w-2/3 bg-gray-300 rounded" /><div className="h-1.5 w-1/2 bg-gray-200 rounded" /><div className="flex gap-0.5"><div className="h-2 w-4 bg-blue-100 rounded-full" /><div className="h-2 w-4 bg-emerald-100 rounded-full" /><div className="h-2 w-4 bg-pink-100 rounded-full" /></div></div></div> },
      { id: "template-card", name: "Card template", desc: "Titre + nb sections + categorie dept + bouton Utiliser", refs: ["A.4.6"],
        wireframe: <div className="h-12 bg-white rounded-lg border border-gray-200 p-1.5 flex flex-col justify-between"><div className="flex items-center gap-1"><div className="h-2 w-1/2 bg-gray-300 rounded" /><div className="w-4 h-3 bg-blue-100 rounded-full" /></div><div className="flex items-center gap-1"><div className="h-1.5 w-8 bg-gray-200 rounded" /><div className="flex-1" /><div className="h-3 w-6 bg-blue-400 rounded" /></div></div> },
      { id: "chantier-card", name: "Card chantier / mission", desc: "Titre + statut + chaleur emoji + departement + date + actions", refs: ["A.4.6"],
        wireframe: <div className="h-12 bg-white rounded-lg border border-gray-200 p-1.5 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /><div className="flex-1 flex flex-col gap-0.5"><div className="h-2 w-2/3 bg-gray-300 rounded" /><div className="h-1.5 w-1/3 bg-gray-200 rounded" /></div><div className="text-[7px]">🔥</div><div className="h-1.5 w-6 bg-gray-200 rounded" /></div> },
      { id: "stat-card", name: "Card statistique compacte", desc: "Nombre grand + label + variation, pour dashboards resumes", refs: ["A.4.6"],
        wireframe: <div className="h-12 bg-white rounded-lg border border-gray-200 p-1.5 flex flex-col items-center justify-center"><div className="h-3.5 w-8 bg-gray-300 rounded" /><div className="h-1.5 w-10 bg-gray-200 rounded mt-0.5" /></div> },
      { id: "empty-state-card", name: "Card etat vide", desc: "Icone centree + message Aucun element + bouton CTA optionnel", refs: ["Nouveau"],
        wireframe: <div className="h-14 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1"><div className="w-5 h-5 bg-gray-200 rounded-full" /><div className="h-1.5 w-12 bg-gray-200 rounded" /></div> },
      { id: "collapsible-card", name: "Card pliable / accordeon", desc: "Header cliquable + contenu toggle show/hide, chevron rotation", refs: ["A.4.6"],
        wireframe: <div className="h-14 bg-white rounded-lg border border-gray-200 overflow-hidden"><div className="h-5 bg-gray-100 border-b border-gray-200 px-1.5 flex items-center gap-1"><div className="text-[7px] text-gray-400">&#9660;</div><div className="h-1.5 w-1/3 bg-gray-300 rounded" /></div><div className="p-1 space-y-0.5"><div className="h-1.5 w-full bg-gray-200 rounded" /><div className="h-1.5 w-2/3 bg-gray-200 rounded" /></div></div> },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 4. NAVIGATION
  // ────────────────────────────────────────────────────────────
  navigation: {
    title: "Navigation",
    desc: "Sidebar items, tabs, sous-tabs, breadcrumbs, selecteurs, menus",
    color: "amber",
    slots: [
      { id: "sidebar-item-expanded", name: "Item sidebar (expanded)", desc: "Icone + label tronque + active state bg-accent, py-1.5, hover", refs: ["A.4.16.1"],
        wireframe: <div className="h-8 flex items-center"><div className="w-full h-6 bg-gray-200 rounded-lg px-1.5 flex items-center gap-1"><div className="w-3.5 h-3.5 bg-gray-400 rounded" /><div className="h-1.5 w-2/3 bg-gray-400 rounded" /></div></div> },
      { id: "sidebar-item-collapsed", name: "Item sidebar (collapsed)", desc: "Icone seule centree, tooltip title au hover, py-1.5", refs: ["A.4.16.2"],
        wireframe: <div className="h-8 flex items-center justify-center"><div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center"><div className="w-3.5 h-3.5 bg-gray-400 rounded" /></div></div> },
      { id: "sidebar-section-title", name: "Titre de section sidebar", desc: "Uppercase tracking-wide, text-xs font-semibold text-muted, separateur", refs: ["A.4.16.3"],
        wireframe: <div className="h-6 flex items-center"><div className="h-1 w-1/3 bg-gray-300 rounded" /></div> },
      { id: "tabs-horizontal", name: "Tabs horizontaux", desc: "Onglets en ligne, active = border-b-2 ou bg-accent, spacing entre tabs", refs: ["A.4.5"],
        wireframe: <div className="h-8 flex items-end gap-2 border-b border-gray-200"><div className="h-5 w-8 border-b-2 border-blue-400 flex items-center justify-center"><div className="h-1.5 w-5 bg-blue-300 rounded" /></div><div className="h-5 w-8 flex items-center justify-center"><div className="h-1.5 w-5 bg-gray-200 rounded" /></div><div className="h-5 w-8 flex items-center justify-center"><div className="h-1.5 w-5 bg-gray-200 rounded" /></div></div> },
      { id: "sub-tabs-right", name: "Sub-tabs a droite", desc: "Positionnes a droite dans un header, plus petits, secondaires", refs: ["A.4.5"],
        wireframe: <div className="h-8 flex items-center"><div className="h-2 w-1/3 bg-gray-300 rounded" /><div className="flex-1" /><div className="flex gap-0.5"><div className="h-4 w-6 bg-blue-200 rounded" /><div className="h-4 w-6 bg-gray-200 rounded" /></div></div> },
      { id: "tabs-pills", name: "Tabs pills / toggle", desc: "Boutons arrondis en groupe, active = bg colore, pour filtres", refs: ["A.4.5"],
        wireframe: <div className="h-8 flex items-center gap-1"><div className="h-4 w-8 bg-blue-400 rounded-full" /><div className="h-4 w-8 bg-gray-200 rounded-full" /><div className="h-4 w-8 bg-gray-200 rounded-full" /></div> },
      { id: "collapsible-trigger", name: "Trigger section pliable", desc: "ChevronDown/Right + label uppercase tracking-wide, Collapsible", refs: ["A.4.16.5"],
        wireframe: <div className="h-8 flex items-center gap-1"><div className="text-[7px] text-gray-400">&#9654;</div><div className="h-1.5 w-1/3 bg-gray-300 rounded" /></div> },
      { id: "dept-selector", name: "Selecteur departement", desc: "12 items avec icone coloree + nom dept, selection active highlight", refs: ["A.4.16.4"],
        wireframe: <div className="h-14 flex flex-col gap-0.5"><div className="flex items-center gap-1 px-1 py-0.5 bg-blue-50 rounded"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /><div className="h-1 w-2/3 bg-blue-300 rounded" /></div><div className="flex items-center gap-1 px-1 py-0.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /><div className="h-1 w-2/3 bg-gray-200 rounded" /></div><div className="flex items-center gap-1 px-1 py-0.5"><div className="w-1.5 h-1.5 bg-pink-400 rounded-full" /><div className="h-1 w-2/3 bg-gray-200 rounded" /></div></div> },
      { id: "back-button", name: "Bouton retour", desc: "ArrowLeft + action retour, position standard dans PageHeader", refs: ["A.4.4.1"],
        wireframe: <div className="h-8 flex items-center"><div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-[7px] text-gray-400">&#8592;</div></div> },
      { id: "breadcrumbs", name: "Fil d'Ariane", desc: "Section > Sous-section > Page, separateurs chevron, cliquables", refs: ["Nouveau"],
        wireframe: <div className="h-8 flex items-center gap-1"><div className="h-1.5 w-6 bg-gray-300 rounded" /><span className="text-[7px] text-gray-300">&#8250;</span><div className="h-1.5 w-8 bg-gray-300 rounded" /><span className="text-[7px] text-gray-300">&#8250;</span><div className="h-1.5 w-10 bg-gray-400 rounded" /></div> },
      { id: "master-ghml-nav", name: "Navigation Master GHML", desc: "7 blocs A-G avec sous-items, collapsible, 24+ entrees", refs: ["A.4.16"],
        wireframe: <div className="h-16 flex flex-col gap-0.5 overflow-hidden"><div className="flex items-center gap-0.5"><div className="text-[7px] font-bold text-gray-400">A</div><div className="h-1.5 w-1/2 bg-gray-300 rounded" /></div><div className="pl-3 flex flex-col gap-0.5"><div className="h-1 w-2/3 bg-gray-200 rounded" /><div className="h-1 w-1/2 bg-gray-200 rounded" /></div><div className="flex items-center gap-0.5"><div className="text-[7px] font-bold text-gray-400">B</div><div className="h-1.5 w-1/2 bg-gray-300 rounded" /></div><div className="pl-3"><div className="h-1 w-2/3 bg-gray-200 rounded" /></div></div> },
      { id: "context-menu", name: "Menu contextuel", desc: "Clic droit ou ... bouton, dropdown actions, separateurs, icones", refs: ["Nouveau"],
        wireframe: <div className="h-16 flex justify-end"><div className="w-16 bg-white rounded-lg border border-gray-200 shadow-sm p-1 flex flex-col gap-0.5"><div className="h-2.5 bg-gray-100 rounded flex items-center px-1"><div className="h-1 w-2/3 bg-gray-300 rounded" /></div><div className="h-2.5 bg-gray-100 rounded flex items-center px-1"><div className="h-1 w-1/2 bg-gray-300 rounded" /></div><div className="h-px bg-gray-200" /><div className="h-2.5 bg-red-50 rounded flex items-center px-1"><div className="h-1 w-1/2 bg-red-300 rounded" /></div></div></div> },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 5. BOUTONS & ACTIONS
  // ────────────────────────────────────────────────────────────
  boutons: {
    title: "Boutons & Actions",
    desc: "Boutons primaires, secondaires, icones, FAB, destructifs, groupes",
    color: "rose",
    slots: [
      { id: "btn-primaire", name: "Bouton primaire", desc: "bg-blue-600 text-white, rounded-lg, hover:bg-blue-700, padding standard", refs: ["A.4.8"],
        wireframe: <div className="h-8 flex items-center justify-center"><div className="h-5 w-16 bg-blue-500 rounded-lg" /></div> },
      { id: "btn-secondaire", name: "Bouton secondaire / outline", desc: "border + text-gray, bg transparent, hover:bg-gray-50", refs: ["A.4.8"],
        wireframe: <div className="h-8 flex items-center justify-center"><div className="h-5 w-16 border border-gray-300 rounded-lg" /></div> },
      { id: "btn-icone", name: "Bouton icone seul", desc: "Rond ou carre, icone centree, tailles h-7/h-8/h-9, hover bg-accent", refs: ["A.4.8"],
        wireframe: <div className="h-8 flex items-center justify-center gap-2"><div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center"><div className="w-2.5 h-2.5 bg-gray-400 rounded" /></div><div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center"><div className="w-2.5 h-2.5 bg-gray-400 rounded-full" /></div></div> },
      { id: "btn-toggle", name: "Toggle / Switch", desc: "On/Off visuel, couleur change, pour preferences et activations", refs: ["A.4.8"],
        wireframe: <div className="h-8 flex items-center justify-center gap-3"><div className="w-8 h-4 bg-blue-400 rounded-full flex items-center justify-end px-0.5"><div className="w-3 h-3 bg-white rounded-full" /></div><div className="w-8 h-4 bg-gray-300 rounded-full flex items-center justify-start px-0.5"><div className="w-3 h-3 bg-white rounded-full" /></div></div> },
      { id: "btn-fab", name: "FAB flottant (mobile)", desc: "Bouton fixe bottom-right, ombre lg, action principale, animate", refs: ["A.4.17.12"],
        wireframe: <div className="h-14 relative bg-gray-100 rounded"><div className="absolute bottom-1 right-1 w-7 h-7 bg-blue-500 rounded-full shadow-md flex items-center justify-center text-white text-[8px]">+</div></div> },
      { id: "btn-destructif", name: "Bouton destructif", desc: "bg-red-500 ou text-red-500, pour suppression, confirmation requise", refs: ["A.4.8"],
        wireframe: <div className="h-8 flex items-center justify-center"><div className="h-5 w-16 bg-red-500 rounded-lg" /></div> },
      { id: "btn-ghost", name: "Bouton ghost / lien", desc: "Pas de background, text-blue-600, hover:underline, inline dans texte", refs: ["A.4.8"],
        wireframe: <div className="h-8 flex items-center justify-center"><div className="h-1 w-12 bg-blue-400 rounded" /></div> },
      { id: "btn-groupe", name: "Groupe de boutons", desc: "Boutons cote a cote, separation visuelle, actions liees et mutuellement exclusives", refs: ["A.4.8"],
        wireframe: <div className="h-8 flex items-center justify-center"><div className="flex"><div className="h-5 w-8 bg-gray-200 rounded-l-lg border border-gray-300" /><div className="h-5 w-8 bg-gray-300 border-y border-gray-300" /><div className="h-5 w-8 bg-gray-200 rounded-r-lg border border-gray-300" /></div></div> },
      { id: "btn-call-voice", name: "Bouton appel vocal", desc: "Rond bleu → rouge actif, icon Phone, etats idle/connecting/connected", refs: ["A.4.17.9"],
        wireframe: <div className="h-8 flex items-center justify-center gap-2"><div className="w-6 h-6 bg-blue-500 rounded-full" /><div className="w-6 h-6 bg-red-500 rounded-full ring-2 ring-red-200" /></div> },
      { id: "btn-call-video", name: "Bouton appel video", desc: "Rond emerald → rouge actif, icon Video, lance Jitsi/Tavus", refs: ["A.4.17.11"],
        wireframe: <div className="h-8 flex items-center justify-center gap-2"><div className="w-6 h-6 bg-emerald-500 rounded-full" /><div className="w-6 h-6 bg-red-500 rounded-full ring-2 ring-red-200" /></div> },
      { id: "btn-close-dismiss", name: "Bouton fermer / dismiss", desc: "X petit, coin superieur droit, pour cards/modals/alerts", refs: ["A.4.8"],
        wireframe: <div className="h-8 flex items-center justify-center gap-3"><div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-[7px] text-gray-500">&#215;</div><div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center text-[7px] text-gray-500">&#215;</div></div> },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 6. FORMULAIRES & INPUTS
  // ────────────────────────────────────────────────────────────
  inputs: {
    title: "Formulaires & Inputs",
    desc: "Champs texte, recherche, selecteurs, pickers, upload, chat input",
    color: "cyan",
    slots: [
      { id: "input-texte", name: "Champ texte standard", desc: "Border rounded, focus ring-blue, label au-dessus, placeholder gris", refs: ["A.4.8"],
        wireframe: <div className="h-12 flex flex-col gap-0.5"><div className="h-1.5 w-1/4 bg-gray-300 rounded" /><div className="flex-1 border border-gray-300 rounded px-1.5 flex items-center"><div className="h-1.5 w-1/3 bg-gray-200 rounded" /></div></div> },
      { id: "input-recherche", name: "Barre de recherche", desc: "Icone Search gauche + input, fond gris leger, coins arrondis pleins", refs: ["A.4.8"],
        wireframe: <div className="h-8 flex items-center"><div className="w-full h-6 bg-gray-100 rounded-full px-2 flex items-center gap-1"><div className="w-3 h-3 bg-gray-300 rounded-full" /><div className="h-1.5 w-1/3 bg-gray-300 rounded" /></div></div> },
      { id: "input-textarea", name: "Zone de texte multi-ligne", desc: "Resize vertical, hauteur min/max, compteur caracteres optionnel", refs: ["A.4.8"],
        wireframe: <div className="h-14 border border-gray-300 rounded p-1 flex flex-col gap-0.5"><div className="h-1.5 w-full bg-gray-200 rounded" /><div className="h-1.5 w-3/4 bg-gray-200 rounded" /><div className="h-1.5 w-1/2 bg-gray-200 rounded" /></div> },
      { id: "input-select", name: "Select / Dropdown", desc: "Fleche ChevronDown, options dropdown, selection unique ou multiple", refs: ["A.4.8"],
        wireframe: <div className="h-8 flex items-center"><div className="w-full h-6 border border-gray-300 rounded px-1.5 flex items-center"><div className="flex-1 h-1.5 w-1/3 bg-gray-200 rounded" /><div className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-gray-400" /></div></div> },
      { id: "input-chat", name: "Chat input bar", desc: "Input + bouton Send, coins arrondis, mode compact sidebar vs full centre", refs: ["A.4.17.7"],
        wireframe: <div className="h-8 flex items-center"><div className="w-full h-6 bg-gray-100 rounded-full px-2 flex items-center gap-1"><div className="flex-1 h-1.5 bg-gray-200 rounded" /><div className="w-4 h-4 bg-blue-500 rounded-full" /></div></div> },
      { id: "input-upload", name: "Upload fichier", desc: "Zone drag-and-drop ou bouton, preview nom fichier, barre progress", refs: ["Nouveau"],
        wireframe: <div className="h-14 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-0.5"><div className="text-[7px] text-gray-400">↑</div><div className="h-1.5 w-1/3 bg-gray-200 rounded" /></div> },
      { id: "input-chaleur", name: "Picker chaleur (3 etats)", desc: "3 emojis selectionnables brule/couve/meurt, toggle visuel, etat actif", refs: ["A.4.17.6"],
        wireframe: <div className="h-8 flex items-center justify-center gap-1"><div className="w-6 h-6 border-2 border-orange-400 rounded flex items-center justify-center text-[8px]">🔥</div><div className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-[8px]">🟡</div><div className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-[8px]">⚪</div></div> },
      { id: "input-date", name: "Selecteur date / heure", desc: "Calendar picker, format quebecois, plage de dates, integration agenda", refs: ["Nouveau"],
        wireframe: <div className="h-8 flex items-center"><div className="w-full h-6 border border-gray-300 rounded px-1.5 flex items-center gap-1"><div className="w-3.5 h-3.5 bg-gray-200 rounded" /><div className="h-1.5 w-1/3 bg-gray-200 rounded" /></div></div> },
      { id: "input-slider", name: "Slider / Range", desc: "Curseur horizontal, valeur min/max, step, label valeur courante", refs: ["Nouveau"],
        wireframe: <div className="h-8 flex items-center px-1"><div className="w-full flex items-center"><div className="flex-1 h-1 bg-gray-200 rounded-full relative"><div className="absolute left-0 top-0 w-2/3 h-1 bg-blue-400 rounded-full" /><div className="absolute left-2/3 -top-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white" /></div></div></div> },
      { id: "input-checkbox", name: "Checkbox / Radio", desc: "Cases a cocher et boutons radio, etats checked/unchecked/disabled", refs: ["Nouveau"],
        wireframe: <div className="h-8 flex items-center justify-center gap-3"><div className="w-3.5 h-3.5 bg-blue-500 rounded" /><div className="w-3.5 h-3.5 border border-gray-300 rounded" /><div className="w-3.5 h-3.5 bg-blue-500 rounded-full" /></div> },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 7. TYPOGRAPHIE
  // ────────────────────────────────────────────────────────────
  typographie: {
    title: "Typographie",
    desc: "Echelle de tailles, poids, couleurs texte, labels, monospace, regles",
    color: "slate",
    slots: [
      { id: "typo-echelle", name: "Echelle de tailles", desc: "text-lg / text-sm / text-xs / text-[9px] / text-[8px] — quand utiliser quoi", refs: ["A.4.7"],
        wireframe: <div className="h-12 flex flex-col justify-between px-1"><div className="h-3.5 w-3/4 bg-gray-400 rounded" /><div className="h-2.5 w-2/3 bg-gray-300 rounded" /><div className="h-1.5 w-1/2 bg-gray-200 rounded" /><div className="h-1 w-1/3 bg-gray-200 rounded" /></div> },
      { id: "typo-poids", name: "Poids de fonte", desc: "font-bold / font-semibold / font-medium / normal — hierarchie visuelle", refs: ["A.4.7"],
        wireframe: <div className="h-10 flex flex-col justify-between px-1"><div className="h-2 w-1/2 bg-gray-700 rounded" /><div className="h-2 w-1/2 bg-gray-500 rounded" /><div className="h-2 w-1/2 bg-gray-300 rounded" /></div> },
      { id: "typo-couleurs-texte", name: "Couleurs de texte", desc: "text-gray-900 / 700 / 500 / 400 — 4 niveaux de hierarchie", refs: ["A.4.7"],
        wireframe: <div className="h-12 flex flex-col justify-between px-1"><div className="h-2 w-2/3 bg-gray-900 rounded" /><div className="h-2 w-2/3 bg-gray-700 rounded" /><div className="h-2 w-2/3 bg-gray-500 rounded" /><div className="h-2 w-2/3 bg-gray-300 rounded" /></div> },
      { id: "typo-labels", name: "Labels & descriptions", desc: "Label bold au-dessus, description light en dessous, aide contextuelle", refs: ["A.4.7"],
        wireframe: <div className="h-14 flex flex-col gap-0.5 px-1"><div className="h-1.5 w-1/4 bg-gray-400 rounded" /><div className="h-5 w-full border border-gray-300 rounded" /><div className="h-1 w-1/3 bg-gray-200 rounded" /></div> },
      { id: "typo-monospace", name: "Code / Monospace", desc: "font-mono, bg-gray-100 px-1.5 rounded, pour IDs, codes bot, URLs", refs: ["A.4.7"],
        wireframe: <div className="h-8 flex items-center px-1"><div className="h-5 px-2 bg-gray-100 border border-gray-200 rounded flex items-center"><div className="h-1.5 w-10 bg-gray-300 rounded" /></div></div> },
      { id: "typo-uppercase", name: "Uppercase & tracking", desc: "uppercase tracking-wide pour titres de section et blocs sidebar", refs: ["A.4.7"],
        wireframe: <div className="h-8 flex items-center px-1"><div className="h-1 w-1/3 bg-gray-400 rounded" /></div> },
      { id: "typo-truncate", name: "Troncature de texte", desc: "truncate, line-clamp-2, overflow-hidden — regles de coupure", refs: ["A.4.7"],
        wireframe: <div className="h-8 flex items-center px-1"><div className="flex-1 h-2 bg-gray-300 rounded overflow-hidden" /><span className="text-[7px] text-gray-400 ml-0.5">...</span></div> },
      { id: "typo-emoji", name: "Usage des emojis", desc: "Taille, espacement, quand utiliser vs icone Lucide, contextes autorises", refs: ["A.4.9"],
        wireframe: <div className="h-8 flex items-center justify-center gap-2"><span className="text-[8px]">👔</span><span className="text-xs">💰</span><span className="text-sm">🎯</span></div> },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 8. COULEURS & GRADIENTS
  // ────────────────────────────────────────────────────────────
  couleurs: {
    title: "Couleurs & Gradients",
    desc: "Palette marque, couleurs bots, gradients, semantiques, opacite, surfaces",
    color: "pink",
    slots: [
      { id: "palette-marque", name: "Palette marque GhostX", desc: "Couleurs primaires de la marque — bleu principal, accents, neutres", refs: ["A.4.12", "A.1"],
        wireframe: <div className="h-8 flex items-center justify-center gap-1">{["bg-blue-500","bg-violet-500","bg-emerald-500","bg-gray-800","bg-gray-100"].map((c,i)=><div key={i} className={`w-5 h-5 rounded ${c}`} />)}</div> },
      { id: "couleurs-12-bots", name: "12 couleurs bots C-Level", desc: "blue/violet/emerald/pink/red/orange/slate/teal/cyan/amber/indigo/zinc", refs: ["A.4.12", "A.4.1"],
        wireframe: <div className="h-8 flex items-center justify-center gap-px">{["bg-blue-400","bg-violet-400","bg-emerald-400","bg-pink-400","bg-red-400","bg-orange-400","bg-slate-400","bg-teal-400","bg-cyan-400","bg-amber-400","bg-indigo-400","bg-zinc-400"].map((c,i)=><div key={i} className={`w-2 h-6 ${c}`} />)}</div> },
      { id: "gradients-dept", name: "Gradients departements (12)", desc: "from-xxx-600 to-xxx-500 par departement, pour headers et cards", refs: ["A.4.12", "A.4.4.5"],
        wireframe: <div className="h-10 flex flex-col gap-0.5"><div className="h-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded" /><div className="h-3 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded" /><div className="h-3 bg-gradient-to-r from-pink-600 to-pink-400 rounded" /></div> },
      { id: "couleurs-semantiques", name: "Couleurs semantiques", desc: "Success (green), Warning (amber), Error (red), Info (blue) — standards", refs: ["A.4.12"],
        wireframe: <div className="h-8 flex items-center justify-center gap-2">{[{dot:"bg-green-400",bar:"bg-green-200"},{dot:"bg-amber-400",bar:"bg-amber-200"},{dot:"bg-red-400",bar:"bg-red-200"},{dot:"bg-blue-400",bar:"bg-blue-200"}].map((s,i)=><div key={i} className="flex items-center gap-0.5"><div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} /><div className={`h-1.5 w-4 rounded ${s.bar}`} /></div>)}</div> },
      { id: "couleurs-modes", name: "Couleurs des 8 modes reflexion", desc: "Brainstorm (amber), Crise (red), Decision (emerald), etc.", refs: ["A.4.12", "A.4.4.3"],
        wireframe: <div className="h-8 flex items-center justify-center gap-0.5">{["bg-amber-400","bg-red-400","bg-emerald-400","bg-blue-400","bg-purple-400","bg-pink-400","bg-teal-400","bg-orange-400"].map((c,i)=><div key={i} className={`h-3.5 w-4 rounded-full ${c}`} />)}</div> },
      { id: "opacite-overlays", name: "Opacite & backdrop", desc: "bg-white/80 backdrop-blur, bg-black/40, niveaux de transparence", refs: ["A.4.12"],
        wireframe: <div className="h-12 relative"><div className="absolute inset-0 bg-gray-800 rounded" /><div className="absolute inset-1 bg-white/80 rounded" /></div> },
      { id: "surfaces-dark", name: "Surfaces sombres", desc: "from-gray-800 to-gray-900 pour avatars, video, cards dark mode", refs: ["A.4.12"],
        wireframe: <div className="h-10 flex gap-1"><div className="flex-1 bg-gradient-to-b from-gray-700 to-gray-800 rounded" /><div className="flex-1 bg-gradient-to-r from-gray-800 to-gray-900 rounded" /></div> },
      { id: "bg-page-sections", name: "Fonds de page et sections", desc: "Fond general, fond sidebar, fond cards, contrastes entre zones", refs: ["A.4.12"],
        wireframe: <div className="h-12 flex gap-px bg-gray-300 rounded overflow-hidden"><div className="w-1/5 bg-gray-100" /><div className="flex-1 bg-white" /><div className="w-1/5 bg-gray-50" /></div> },
      { id: "couleurs-rooms", name: "Couleurs des 3 Rooms", desc: "Board (amber), War (red/rose), Think (cyan) — palette complete", refs: ["A.4.3.5"],
        wireframe: <div className="h-8 flex items-center gap-1"><div className="flex-1 h-5 bg-gradient-to-r from-amber-400 to-amber-300 rounded" /><div className="flex-1 h-5 bg-gradient-to-r from-red-400 to-rose-300 rounded" /><div className="flex-1 h-5 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded" /></div> },
      { id: "gradient-tricolore", name: "Gradient signature tricolore", desc: "from-green-400 via-blue-400 to-purple-400 — separateur identitaire", refs: ["A.4.17.4"],
        wireframe: <div className="h-8 flex items-center px-1"><div className="w-full h-1.5 rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400" /></div> },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 9. BULLES & MESSAGES
  // ────────────────────────────────────────────────────────────
  messages: {
    title: "Bulles & Messages",
    desc: "Chat bubbles, notifications, alertes, messages systeme, toasts",
    color: "indigo",
    slots: [
      { id: "bulle-user", name: "Bulle utilisateur", desc: "Alignee a droite, bg-blue-500 text-white, rounded-2xl coins specifiques", refs: ["A.4.10"],
        wireframe: <div className="h-8 flex justify-end"><div className="h-5 w-2/3 bg-blue-400 rounded-2xl rounded-br-sm" /></div> },
      { id: "bulle-carlos", name: "Bulle CarlOS", desc: "Alignee a gauche, bg-gray-100 text-gray-900, avatar + nom CarlOS", refs: ["A.4.10"],
        wireframe: <div className="h-8 flex items-start gap-1"><div className="w-4 h-4 bg-gray-300 rounded-full shrink-0" /><div className="h-5 w-2/3 bg-gray-200 rounded-2xl rounded-bl-sm" /></div> },
      { id: "bulle-bot", name: "Bulle bot secondaire", desc: "Meme pattern CarlOS mais avatar/nom du bot specifique, couleur accent", refs: ["A.4.10"],
        wireframe: <div className="h-8 flex items-start gap-1"><div className="w-4 h-4 bg-violet-300 rounded-full shrink-0" /><div className="h-5 w-2/3 bg-violet-100 rounded-2xl rounded-bl-sm" /></div> },
      { id: "bulle-system", name: "Message systeme", desc: "Centre, text-gray-400 petit, pas de bulle, pour timestamps/events/separateurs", refs: ["A.4.10"],
        wireframe: <div className="h-6 flex items-center justify-center"><div className="h-1.5 w-1/3 bg-gray-200 rounded" /></div> },
      { id: "bulle-diagnostic", name: "Bulle diagnostic", desc: "Badge Diagnostic sur bulle CarlOS quand question exploratoire", refs: ["A.4.10"],
        wireframe: <div className="h-10 flex items-start gap-1"><div className="w-4 h-4 bg-gray-300 rounded-full shrink-0 mt-3" /><div className="flex flex-col gap-0.5"><div className="h-3 w-8 bg-amber-200 rounded-full" /><div className="h-5 w-20 bg-gray-200 rounded-2xl rounded-bl-sm" /></div></div> },
      { id: "bulle-streaming", name: "Bulle en streaming", desc: "Animation de remplissage progressif, curseur clignotant, skeleton", refs: ["A.4.10"],
        wireframe: <div className="h-8 flex items-start gap-1"><div className="w-4 h-4 bg-gray-300 rounded-full shrink-0" /><div className="h-5 w-16 bg-gray-200 rounded-2xl rounded-bl-sm flex items-center justify-center gap-0.5"><div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" /><div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" /><div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" /></div></div> },
      { id: "team-proposal", name: "TeamProposal card", desc: "Suggestion equipe par CarlOS, 3 bots proposes, bouton Accepter", refs: ["A.4.10"],
        wireframe: <div className="h-12 bg-blue-50 border border-blue-200 rounded-lg p-1.5 flex flex-col justify-between"><div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-300 rounded-full" /><div className="w-3 h-3 bg-emerald-300 rounded-full" /><div className="w-3 h-3 bg-pink-300 rounded-full" /><div className="flex-1" /></div><div className="flex justify-end"><div className="h-3 w-8 bg-blue-400 rounded" /></div></div> },
      { id: "alerte-sentinelle", name: "Alerte sentinelle (4 niveaux)", desc: "border-l-4 colore, badge CRITIQUE/IMPORTANT/INFO/SUCCES, contenu", refs: ["A.4.17.8"],
        wireframe: <div className="h-10 border-l-4 border-red-400 bg-red-50 rounded-r-lg p-1 flex flex-col gap-0.5"><div className="flex items-center gap-1"><div className="h-2.5 w-8 bg-red-200 rounded-full" /></div><div className="h-1.5 w-full bg-red-100 rounded" /></div> },
      { id: "toast-notification", name: "Toast notification", desc: "Apparait en haut/bas, auto-dismiss 3-5s, variants success/error/info", refs: ["Nouveau"],
        wireframe: <div className="h-8 flex justify-end"><div className="w-24 h-6 bg-white rounded-lg border border-gray-200 shadow-sm px-1.5 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-400 rounded-full" /><div className="flex-1 h-1.5 bg-gray-200 rounded" /><div className="text-[7px] text-gray-300">&#215;</div></div></div> },
      { id: "carlos-presence", name: "CarlOS Presence message", desc: "Message contextuel CarlOS adapte a la section active, enrichi", refs: ["A.4.10"],
        wireframe: <div className="h-10 flex items-start gap-1"><div className="w-4 h-4 bg-blue-400 rounded-full shrink-0" /><div className="flex-1 h-7 bg-blue-50 border border-blue-200 rounded-lg p-1"><div className="h-1.5 w-full bg-blue-200 rounded" /></div></div> },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 10. AVATARS & MEDIA
  // ────────────────────────────────────────────────────────────
  media: {
    title: "Avatars & Media",
    desc: "Avatars bots, zones video, YouTube, audio visualizer, images, icones",
    color: "teal",
    slots: [
      { id: "avatar-standby", name: "Avatar bot standby (3:1)", desc: "Image generee aspect-[3/1], overlay nom+role+code, fond sombre", refs: ["A.4.2", "A.4.17.3"],
        wireframe: <div className="h-12 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg flex items-center justify-center relative"><div className="w-6 h-6 bg-gray-500 rounded-full" /><div className="absolute bottom-1 w-full flex justify-center"><div className="h-1.5 w-1/3 bg-white/30 rounded" /></div></div> },
      { id: "avatar-speaking", name: "Avatar bot speaking (glow)", desc: "Pulse ring, wave rings concentriques, Tavus lip-sync overlay", refs: ["A.4.17.10"],
        wireframe: <div className="h-12 flex items-center justify-center"><div className="w-8 h-8 bg-gray-700 rounded-full ring-2 ring-blue-400 ring-offset-1"><div className="w-full h-full rounded-full ring-4 ring-blue-300/30" /></div></div> },
      { id: "avatar-mini", name: "Avatar mini (bulle/roster)", desc: "w-6 h-6 ou w-8 h-8 rounded-full, ring couleur bot, dans bulles/roster", refs: ["A.4.10", "A.4.4.4"],
        wireframe: <div className="h-8 flex items-center justify-center gap-2"><div className="w-4 h-4 bg-gray-300 rounded-full ring-1 ring-blue-400" /><div className="w-5 h-5 bg-gray-300 rounded-full ring-1 ring-emerald-400" /><div className="w-6 h-6 bg-gray-300 rounded-full ring-1 ring-pink-400" /></div> },
      { id: "video-16-9", name: "Zone video 16:9", desc: "Container video standard, controles overlay, ratio fixe, dark bg", refs: ["A.4.17.3", "A.4.17.11"],
        wireframe: <div className="h-12 bg-gray-800 rounded-lg flex items-center justify-center"><div className="w-0 h-0 border-l-[6px] border-t-[4px] border-b-[4px] border-l-white/60 border-t-transparent border-b-transparent" /></div> },
      { id: "youtube-push", name: "YouTube push contextuel", desc: "Video YouTube poussee par CarlOS en lien avec la discussion courante", refs: ["A.4.17.13"],
        wireframe: <div className="h-12 bg-gray-800 rounded-lg flex items-center justify-center"><div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center"><div className="w-0 h-0 border-l-[5px] border-t-[3px] border-b-[3px] border-l-white border-t-transparent border-b-transparent" /></div></div> },
      { id: "audio-visualizer", name: "Audio visualizer (40 barres)", desc: "Barres animees vert (parle) / ambre (tape) / blanc (idle)", refs: ["A.4.17.10"],
        wireframe: <div className="h-12 bg-gray-800 rounded-lg flex items-end justify-center gap-px px-2 pb-1">{Array.from({length:16}).map((_,i)=><div key={i} className="w-1 bg-emerald-400 rounded-t" style={{height:`${Math.max(4, Math.floor(Math.random()*28))}px`}} />)}</div> },
      { id: "image-container", name: "Container image standard", desc: "rounded-lg overflow-hidden, aspect ratio, fallback bg gris", refs: ["A.4.2"],
        wireframe: <div className="h-12 bg-gray-200 rounded-lg flex items-center justify-center"><div className="w-5 h-5 bg-gray-300 rounded" /></div> },
      { id: "placeholder-skeleton", name: "Placeholder / skeleton", desc: "animate-pulse fond gris, memes dimensions que contenu final", refs: ["Nouveau"],
        wireframe: <div className="h-10 bg-gray-200 rounded-lg animate-pulse" /> },
      { id: "icones-tailles", name: "Tailles icones standard", desc: "h-3.5 w-3.5 (inline) / h-4 w-4 (bouton) / h-5 w-5 (header) / h-7 w-7 (feature)", refs: ["A.4.7"],
        wireframe: <div className="h-8 flex items-end justify-center gap-1.5"><div className="w-3 h-3 bg-gray-300 rounded" /><div className="w-3.5 h-3.5 bg-gray-300 rounded" /><div className="w-4 h-4 bg-gray-300 rounded" /><div className="w-5 h-5 bg-gray-300 rounded" /><div className="w-6 h-6 bg-gray-300 rounded" /></div> },
      { id: "jitsi-overlay", name: "Overlay Jitsi conference", desc: "iframe z-30 full-screen meet.jit.si, grille participants, toolbar", refs: ["A.4.17.11"],
        wireframe: <div className="h-14 bg-gray-800 rounded-lg p-1 relative"><div className="grid grid-cols-2 gap-0.5 h-full"><div className="bg-gray-700 rounded" /><div className="bg-gray-700 rounded" /><div className="bg-gray-700 rounded" /><div className="bg-gray-700 rounded" /></div><div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-red-500 rounded-full" /></div> },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 11. INDICATEURS & STATUS
  // ────────────────────────────────────────────────────────────
  indicateurs: {
    title: "Indicateurs & Status",
    desc: "Loading, progress, dots, pulses, scores, badges, tendances",
    color: "orange",
    slots: [
      { id: "loading-spinner", name: "Loading spinner", desc: "Loader2 animate-spin, tailles standard (h-4/h-6/h-8), centrage", refs: ["A.4.11"],
        wireframe: <div className="h-8 flex items-center justify-center gap-3"><div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" /><div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" /></div> },
      { id: "progress-bar", name: "Barre de progression", desc: "Hauteur h-1.5/h-2, coins arrondis, couleur par contexte/seuil", refs: ["A.4.11"],
        wireframe: <div className="h-8 flex items-center px-1"><div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"><div className="w-2/3 h-full bg-blue-400 rounded-full" /></div></div> },
      { id: "status-dot", name: "Status dot (3 etats)", desc: "w-2 h-2 rounded-full vert (actif) / ambre (partiel) / gris (inactif)", refs: ["A.4.11"],
        wireframe: <div className="h-8 flex items-center justify-center gap-3">{[{dot:"bg-green-400",lbl:"bg-green-200"},{dot:"bg-amber-400",lbl:"bg-amber-200"},{dot:"bg-gray-300",lbl:"bg-gray-200"}].map((s,i)=><div key={i} className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${s.dot}`} /><div className={`h-1 w-4 rounded ${s.lbl}`} /></div>)}</div> },
      { id: "pulse-animation", name: "Pulse animation", desc: "animate-pulse pour elements vivants, ring expanding, heartbeat effect", refs: ["A.4.11"],
        wireframe: <div className="h-8 flex items-center justify-center"><div className="relative"><div className="w-3 h-3 bg-blue-500 rounded-full" /><div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping" /></div></div> },
      { id: "score-bar-vitaa", name: "Score bar VITAA (0-100)", desc: "Barre coloree par seuil (<40 rouge, 40-70 ambre, >70 vert) + label + valeur", refs: ["A.4.11"],
        wireframe: <div className="h-14 flex flex-col justify-between px-1">{[{w:"w-4/5",c:"bg-green-400",l:"bg-gray-200"},{w:"w-1/2",c:"bg-amber-400",l:"bg-gray-200"},{w:"w-1/4",c:"bg-red-400",l:"bg-gray-200"}].map((b,i)=><div key={i} className="flex items-center gap-1"><div className="h-1 w-5 rounded bg-gray-200" /><div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${b.w} ${b.c}`} /></div></div>)}</div> },
      { id: "chaleur-indicator", name: "Indicateur chaleur", desc: "3 etats brule/couve/meurt avec emoji + couleur + label", refs: ["A.4.17.6"],
        wireframe: <div className="h-8 flex items-center justify-center gap-2">{[{e:"🔥",c:"bg-orange-200"},{e:"🟡",c:"bg-amber-200"},{e:"⚪",c:"bg-gray-200"}].map((s,i)=><div key={i} className="flex items-center gap-0.5"><span className="text-[8px]">{s.e}</span><div className={`h-1.5 w-5 rounded ${s.c}`} /></div>)}</div> },
      { id: "badge-compteur", name: "Badge compteur", desc: "Rond avec nombre, coin superieur droit, couleur par importance", refs: ["A.4.9"],
        wireframe: <div className="h-10 flex items-center justify-center gap-4"><div className="relative"><div className="w-6 h-6 bg-gray-200 rounded" /><div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" /></div><div className="relative"><div className="w-6 h-6 bg-gray-200 rounded" /><div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" /></div></div> },
      { id: "trend-arrow", name: "Fleche de tendance", desc: "TrendingUp vert / TrendingDown rouge / ArrowRight gris + pourcentage", refs: ["A.4.11"],
        wireframe: <div className="h-8 flex items-center justify-center gap-3"><div className="flex items-center gap-0.5"><span className="text-[8px] text-emerald-500">↑</span><div className="h-1.5 w-4 bg-emerald-200 rounded" /></div><div className="flex items-center gap-0.5"><span className="text-[8px] text-red-500">↓</span><div className="h-1.5 w-4 bg-red-200 rounded" /></div><div className="flex items-center gap-0.5"><span className="text-[8px] text-gray-400">→</span><div className="h-1.5 w-4 bg-gray-200 rounded" /></div></div> },
      { id: "connection-status", name: "Status de connexion", desc: "Dot + label Online/Offline/Connecting pour LiveKit/WebSocket", refs: ["A.4.17.9"],
        wireframe: <div className="h-8 flex items-center justify-center gap-2">{[{d:"bg-green-400",l:"bg-green-200"},{d:"bg-gray-300",l:"bg-gray-200"},{d:"bg-amber-400 animate-pulse",l:"bg-amber-200"}].map((s,i)=><div key={i} className="flex items-center gap-0.5"><div className={`w-1.5 h-1.5 rounded-full ${s.d}`} /><div className={`h-1 w-4 rounded ${s.l}`} /></div>)}</div> },
      { id: "timer-compteur", name: "Timer / compteur", desc: "Chronometre en cours (02:34), format MM:SS, dot animate-pulse", refs: ["A.4.17.9"],
        wireframe: <div className="h-8 flex items-center justify-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /><span className="text-[9px] font-mono text-gray-500">02:34</span></div> },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 12. DATA DISPLAY
  // ────────────────────────────────────────────────────────────
  "data-display": {
    title: "Affichage de Donnees",
    desc: "Tableaux, listes, grilles, tri, filtres, pagination, donnees structurees",
    color: "sky",
    slots: [
      { id: "table-simple", name: "Tableau simple", desc: "Headers, lignes alternees, tri par colonne, bordures subtiles", refs: ["Nouveau"],
        wireframe: <div className="h-16 flex flex-col overflow-hidden rounded border border-gray-200"><div className="flex gap-px bg-gray-300 h-3"><div className="flex-1 bg-gray-200" /><div className="flex-1 bg-gray-200" /><div className="flex-1 bg-gray-200" /></div>{[0,1,2].map(i=><div key={i} className={`flex gap-px h-3 ${i%2===0?"bg-white":"bg-gray-50"}`}><div className="flex-1 flex items-center px-1"><div className="h-1 w-2/3 bg-gray-200 rounded" /></div><div className="flex-1 flex items-center px-1"><div className="h-1 w-1/2 bg-gray-200 rounded" /></div><div className="flex-1 flex items-center px-1"><div className="h-1 w-3/4 bg-gray-200 rounded" /></div></div>)}</div> },
      { id: "liste-items", name: "Liste d'items", desc: "Items empiles verticalement, separateurs, hover highlight, click action", refs: ["A.4.6"],
        wireframe: <div className="h-14 flex flex-col gap-px">{[true,false,false,false].map((active,i)=><div key={i} className={`flex items-center gap-1 px-1 py-0.5 rounded ${active?"bg-blue-50":""}`}><div className={`w-1.5 h-1.5 rounded-full ${active?"bg-blue-400":"bg-gray-300"}`} /><div className={`h-1 flex-1 rounded ${active?"bg-blue-300":"bg-gray-200"}`} /></div>)}</div> },
      { id: "grille-responsive", name: "Grille responsive", desc: "grid-cols-2/3/4 adaptatif, gap uniforme, items de taille egale", refs: ["A.4.6"],
        wireframe: <div className="h-12 grid grid-cols-3 grid-rows-2 gap-0.5">{[0,1,2,3,4,5].map(i=><div key={i} className="bg-gray-200 rounded" />)}</div> },
      { id: "key-value-pair", name: "Paire cle-valeur", desc: "Label bold a gauche + valeur a droite, pour specs et details", refs: ["A.4.6"],
        wireframe: <div className="h-12 flex flex-col gap-1 px-1">{[0,1,2].map(i=><div key={i} className="flex items-center"><div className="h-1.5 w-1/4 bg-gray-400 rounded" /><div className="flex-1" /><div className="h-1.5 w-1/3 bg-gray-200 rounded" /></div>)}</div> },
      { id: "timeline-vertical", name: "Timeline verticale", desc: "Points sur ligne verticale, dates, evenements sequentiels, statuts", refs: ["Nouveau"],
        wireframe: <div className="h-16 flex pl-3 relative"><div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300" />{<div className="flex flex-col justify-between">{[{c:"bg-blue-400"},{c:"bg-emerald-400"},{c:"bg-gray-300"}].map((d,i)=><div key={i} className="flex items-center gap-1.5 relative"><div className={`w-2 h-2 rounded-full ${d.c} z-10`} /><div className="h-1.5 w-10 bg-gray-200 rounded" /></div>)}</div>}</div> },
      { id: "tag-list", name: "Liste de tags", desc: "Tags horizontaux wrapping, couleurs par categorie, removable X", refs: ["A.4.9"],
        wireframe: <div className="h-8 flex items-center gap-1 flex-wrap">{["bg-blue-200 w-6","bg-emerald-200 w-8","bg-pink-200 w-5","bg-amber-200 w-7","bg-violet-200 w-6"].map((c,i)=><div key={i} className={`h-3.5 rounded-full ${c}`} />)}</div> },
      { id: "tree-view", name: "Arborescence (tree)", desc: "Elements imbriques avec indentation, expand/collapse, pour structures", refs: ["Nouveau"],
        wireframe: <div className="h-14 flex flex-col gap-0.5 px-1"><div className="flex items-center gap-0.5"><span className="text-[7px] text-gray-400">&#9660;</span><div className="h-1.5 w-1/3 bg-gray-300 rounded" /></div><div className="pl-3 flex flex-col gap-0.5"><div className="flex items-center gap-0.5"><span className="text-[7px] text-gray-400">&#9654;</span><div className="h-1 w-1/4 bg-gray-200 rounded" /></div><div className="flex items-center gap-0.5"><span className="text-[7px] text-gray-400">&#9660;</span><div className="h-1 w-1/4 bg-gray-200 rounded" /></div><div className="pl-3"><div className="h-1 w-1/5 bg-gray-200 rounded" /></div></div></div> },
      { id: "stat-inline", name: "Stat inline", desc: "Nombre + label sur une ligne, pour compteurs rapides", refs: ["A.4.6"],
        wireframe: <div className="h-8 flex items-center justify-center gap-1"><div className="h-3.5 w-6 bg-gray-300 rounded" /><div className="h-1.5 w-8 bg-gray-200 rounded" /></div> },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 13. COMPOSANTS COMPLEXES
  // ────────────────────────────────────────────────────────────
  complexes: {
    title: "Composants Complexes",
    desc: "Layouts composes, modals, overlays, systemes thematiques, flows",
    color: "gray",
    slots: [
      { id: "room-layout", name: "Room layout (3 types)", desc: "Board (ambre) / War (rouge) / Think (cyan) — membres, actions, objectifs", refs: ["A.4.3.5"],
        wireframe: <div className="h-12 flex gap-1">{[{c:"bg-amber-100 border-amber-200"},{c:"bg-red-100 border-red-200"},{c:"bg-cyan-100 border-cyan-200"}].map((r,i)=><div key={i} className={`flex-1 rounded border p-0.5 ${r.c}`}><div className="h-2 w-2/3 bg-white/60 rounded mb-0.5" /><div className="h-1 w-full bg-white/40 rounded" /></div>)}</div> },
      { id: "dept-tdc", name: "Tour de controle departement", desc: "Header gradient + 4 tabs (Vue/Pipeline/Docs/Diagnostics) + grille blocs", refs: ["A.4.3"],
        wireframe: <div className="h-16 flex flex-col overflow-hidden rounded border border-gray-200"><div className="h-4 bg-gradient-to-r from-blue-400 to-blue-300 flex items-center gap-0.5 px-1"><div className="flex-1" /><div className="w-4 h-2 bg-white/30 rounded" /><div className="w-4 h-2 bg-white/30 rounded" /><div className="w-4 h-2 bg-white/30 rounded" /><div className="w-4 h-2 bg-white/50 rounded" /></div><div className="flex-1 p-0.5 grid grid-cols-3 gap-0.5"><div className="bg-gray-100 rounded" /><div className="bg-gray-100 rounded" /><div className="bg-gray-100 rounded" /></div></div> },
      { id: "focus-mode", name: "Focus Mode layout", desc: "Element en haut + LiveChat en bas, consultation approfondie d'un bloc", refs: ["Nouveau"],
        wireframe: <div className="h-16 flex flex-col gap-0.5"><div className="h-5 bg-gray-200 rounded border border-gray-300" /><div className="flex-1 bg-gray-100 rounded border border-gray-200 flex flex-col gap-0.5 p-0.5"><div className="h-1.5 w-2/3 bg-gray-200 rounded" /><div className="h-1.5 w-1/2 bg-gray-200 rounded" /></div></div> },
      { id: "orbit9-section", name: "Section Orbit9 complete", desc: "Grille membres + matching + cellules + scoring + trisociation", refs: ["A.4.3"],
        wireframe: <div className="h-12 flex gap-0.5">{[{c:"bg-orange-100"},{c:"bg-purple-100"},{c:"bg-teal-100"}].map((s,i)=><div key={i} className={`flex-1 ${s.c} rounded p-0.5 flex flex-col items-center gap-0.5`}><div className="w-4 h-4 bg-white/60 rounded-full" /><div className="h-1 w-2/3 bg-white/40 rounded" /></div>)}</div> },
      { id: "modal-dialog", name: "Modal / Dialog", desc: "Overlay bg-black/40, card centree, titre + contenu + boutons action", refs: ["Nouveau"],
        wireframe: <div className="h-16 bg-gray-800/40 rounded-lg flex items-center justify-center"><div className="w-3/4 bg-white rounded-lg p-1.5 space-y-1 shadow"><div className="h-2 w-1/2 bg-gray-300 rounded" /><div className="h-1.5 w-full bg-gray-200 rounded" /><div className="flex justify-end gap-0.5"><div className="h-3 w-6 bg-gray-200 rounded" /><div className="h-3 w-6 bg-blue-400 rounded" /></div></div></div> },
      { id: "tooltip-popover", name: "Tooltip / Popover", desc: "Petit popup au hover/click, fleche directionnelle, auto-positionnement", refs: ["Nouveau"],
        wireframe: <div className="h-12 flex flex-col items-center justify-end"><div className="bg-gray-800 rounded px-1.5 py-0.5 mb-0.5"><div className="h-1 w-8 bg-gray-600 rounded" /></div><div className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[3px] border-l-transparent border-r-transparent border-t-gray-800 mb-1" /><div className="w-4 h-4 bg-gray-200 rounded" /></div> },
      { id: "dropdown-menu", name: "Dropdown menu", desc: "Menu deroulant, items avec icones, separateurs, keyboard navigation", refs: ["Nouveau"],
        wireframe: <div className="h-14 flex flex-col items-start"><div className="w-16 bg-white rounded-lg border border-gray-200 shadow-sm p-0.5 flex flex-col gap-0.5"><div className="h-2.5 bg-gray-100 rounded px-1 flex items-center"><div className="h-1 w-2/3 bg-gray-300 rounded" /></div><div className="h-2.5 bg-gray-100 rounded px-1 flex items-center"><div className="h-1 w-1/2 bg-gray-300 rounded" /></div><div className="h-px bg-gray-200" /><div className="h-2.5 bg-gray-100 rounded px-1 flex items-center"><div className="h-1 w-2/3 bg-gray-300 rounded" /></div></div></div> },
      { id: "skin-theme", name: "Systeme de skins / theme", desc: "Light premium, pas de dark mode, palette pastel subtile, variables", refs: ["A.4.15"],
        wireframe: <div className="h-10 flex items-center justify-center gap-2"><div className="w-12 bg-white border border-gray-200 rounded p-0.5 text-center"><div className="text-[7px] text-gray-500">Light</div><div className="h-2 bg-gray-100 rounded mt-0.5" /></div><div className="w-12 bg-blue-50 border border-blue-200 rounded p-0.5 text-center"><div className="text-[7px] text-blue-500">Pastel</div><div className="h-2 bg-blue-100 rounded mt-0.5" /></div></div> },
      { id: "onboarding-box", name: "Box onboarding progressive", desc: "Etapes guidees, progress indicator, dismiss, premier usage", refs: ["Nouveau"],
        wireframe: <div className="h-14 bg-blue-50 border border-blue-200 rounded-lg p-1.5 relative"><div className="flex gap-0.5 mb-1"><div className="w-2 h-2 bg-blue-400 rounded-full" /><div className="w-2 h-2 bg-gray-300 rounded-full" /><div className="w-2 h-2 bg-gray-300 rounded-full" /></div><div className="h-2 w-2/3 bg-blue-300 rounded" /><div className="absolute top-1 right-1 text-[7px] text-blue-400">&#215;</div></div> },
      { id: "command-palette", name: "Command palette", desc: "Ctrl+K ouverture, recherche globale, actions rapides, navigation", refs: ["Nouveau"],
        wireframe: <div className="h-16 bg-gray-800/40 rounded-lg flex items-start justify-center pt-2"><div className="w-3/4 bg-white rounded-lg shadow overflow-hidden"><div className="h-5 border-b border-gray-200 px-1.5 flex items-center"><div className="w-3 h-3 bg-gray-200 rounded-full" /><div className="flex-1 h-1.5 ml-1 bg-gray-200 rounded" /></div><div className="p-1 space-y-0.5"><div className="h-3 bg-gray-100 rounded px-1 flex items-center"><div className="h-1 w-2/3 bg-gray-300 rounded" /></div><div className="h-3 bg-gray-50 rounded px-1 flex items-center"><div className="h-1 w-1/2 bg-gray-200 rounded" /></div></div></div></div> },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 14. RESPONSIVE & MOBILE
  // ────────────────────────────────────────────────────────────
  responsive: {
    title: "Responsive & Mobile",
    desc: "Breakpoints, adaptation mobile, masquage sidebars, touch, PWA",
    color: "purple",
    slots: [
      { id: "breakpoints", name: "Breakpoints standard", desc: "sm/md/lg/xl — quand chaque layout change, seuils en pixels", refs: ["Nouveau"],
        wireframe: <div className="h-10 flex items-end gap-0.5 px-1">{[{w:"w-4",l:"sm"},{w:"w-6",l:"md"},{w:"w-10",l:"lg"},{w:"w-14",l:"xl"}].map((b,i)=><div key={i} className={`${b.w} h-6 bg-gray-200 rounded-t flex flex-col items-center justify-end`}><span className="text-[7px] text-gray-400">{b.l}</span></div>)}</div> },
      { id: "sidebar-auto-hide", name: "Sidebars auto-masquage", desc: "Sidebars se cachent sur mobile, bouton hamburger pour ouvrir", refs: ["A.4.16"],
        wireframe: <div className="h-10 flex gap-0.5"><div className="w-3 border border-dashed border-gray-300 rounded" /><div className="flex-1 bg-gray-200 rounded" /></div> },
      { id: "stack-mobile", name: "Stacking mobile", desc: "Colonnes qui empilent verticalement sur petits ecrans", refs: ["Nouveau"],
        wireframe: <div className="h-12 flex gap-2 items-center"><div className="flex gap-0.5 flex-1"><div className="flex-1 h-6 bg-gray-200 rounded" /><div className="flex-1 h-6 bg-gray-300 rounded" /></div><span className="text-[7px] text-gray-400">→</span><div className="flex flex-col gap-0.5 flex-1"><div className="h-3 bg-gray-200 rounded" /><div className="h-3 bg-gray-300 rounded" /></div></div> },
      { id: "touch-targets", name: "Touch targets", desc: "Taille minimum 44x44px pour boutons/liens sur mobile, espacement", refs: ["Nouveau"],
        wireframe: <div className="h-10 flex items-center justify-center gap-3"><div className="w-7 h-7 bg-gray-200 rounded border-2 border-dashed border-green-300" /><div className="w-3 h-3 bg-gray-200 rounded border border-dashed border-red-300" /></div> },
      { id: "mobile-fab", name: "MobileCallFAB", desc: "Bouton flottant mobile pour appel vocal, 4 etats, position fixe", refs: ["A.4.17.12"],
        wireframe: <div className="h-12 relative bg-gray-100 rounded"><div className="absolute bottom-1 right-1 w-6 h-6 bg-blue-500 rounded-full shadow" /></div> },
      { id: "mobile-nav", name: "Navigation mobile", desc: "Bottom bar ou drawer, items principaux, badge notifications", refs: ["Nouveau"],
        wireframe: <div className="h-10 flex flex-col justify-end"><div className="h-5 bg-white border-t border-gray-200 flex items-center justify-around px-2">{[0,1,2,3].map(i=><div key={i} className="w-3.5 h-3.5 bg-gray-300 rounded" />)}</div></div> },
      { id: "glasses-rayban", name: "Integration RayBan Meta", desc: "Push events polling 3s, routage vocal vers sections, commandes", refs: ["A.4.17.12"],
        wireframe: <div className="h-10 flex items-center justify-center"><div className="flex items-center"><div className="w-6 h-3.5 bg-gray-700 rounded-l-full" /><div className="w-3 h-1.5 bg-gray-600" /><div className="w-6 h-3.5 bg-gray-700 rounded-r-full relative"><div className="absolute top-0 right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full" /></div></div><div className="ml-1 flex flex-col gap-0.5"><div className="h-1 w-4 bg-gray-200 rounded" /><div className="h-1 w-3 bg-gray-200 rounded" /></div></div> },
      { id: "pwa-install", name: "PWA / Install prompt", desc: "Manifest, service worker, install banner, offline mode basique", refs: ["Nouveau"],
        wireframe: <div className="h-10 flex items-center justify-center"><div className="w-24 bg-white border border-gray-200 rounded-lg shadow-sm px-1.5 py-1 flex items-center gap-1"><div className="w-4 h-4 bg-gray-200 rounded" /><div className="flex-1"><div className="h-1.5 w-2/3 bg-gray-300 rounded" /></div><div className="h-3.5 w-8 bg-blue-400 rounded text-[7px] text-white flex items-center justify-center" /></div></div> },
    ],
  },
};

// ================================================================
// TOTAL SLOTS COUNT
// ================================================================

const TOTAL_SLOTS = Object.values(CATEGORIES).reduce((sum, cat) => sum + cat.slots.length, 0);

// ================================================================
// COLOR MAP — classes Tailwind par couleur
// ================================================================

const COLOR_MAP: Record<string, { bg: string; border: string; title: string; sub: string; count: string }> = {
  blue:    { bg: "bg-blue-50",    border: "border-blue-200",    title: "text-blue-800",    sub: "text-blue-600",    count: "text-blue-500" },
  violet:  { bg: "bg-violet-50",  border: "border-violet-200",  title: "text-violet-800",  sub: "text-violet-600",  count: "text-violet-500" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", title: "text-emerald-800", sub: "text-emerald-600", count: "text-emerald-500" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   title: "text-amber-800",   sub: "text-amber-600",   count: "text-amber-500" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    title: "text-rose-800",    sub: "text-rose-600",    count: "text-rose-500" },
  cyan:    { bg: "bg-cyan-50",    border: "border-cyan-200",    title: "text-cyan-800",    sub: "text-cyan-600",    count: "text-cyan-500" },
  slate:   { bg: "bg-slate-50",   border: "border-slate-200",   title: "text-slate-800",   sub: "text-slate-600",   count: "text-slate-500" },
  pink:    { bg: "bg-pink-50",    border: "border-pink-200",    title: "text-pink-800",    sub: "text-pink-600",    count: "text-pink-500" },
  indigo:  { bg: "bg-indigo-50",  border: "border-indigo-200",  title: "text-indigo-800",  sub: "text-indigo-600",  count: "text-indigo-500" },
  teal:    { bg: "bg-teal-50",    border: "border-teal-200",    title: "text-teal-800",    sub: "text-teal-600",    count: "text-teal-500" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  title: "text-orange-800",  sub: "text-orange-600",  count: "text-orange-500" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     title: "text-sky-800",     sub: "text-sky-600",     count: "text-sky-500" },
  gray:    { bg: "bg-gray-50",    border: "border-gray-200",    title: "text-gray-800",    sub: "text-gray-600",    count: "text-gray-500" },
  purple:  { bg: "bg-purple-50",  border: "border-purple-200",  title: "text-purple-800",  sub: "text-purple-600",  count: "text-purple-500" },
};

// ================================================================
// SHARED COMPONENTS
// ================================================================

function SlotVide({ slot }: { slot: SlotDef }) {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
      {/* Wireframe preview */}
      {slot.wireframe && (
        <div className="mb-3 rounded-lg bg-gray-50/80 border border-gray-100 p-2 overflow-hidden">
          {slot.wireframe}
        </div>
      )}
      {/* Slot info */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700 leading-tight">{slot.name}</span>
        <Badge variant="outline" className="text-[8px] shrink-0 bg-gray-50 text-gray-400 border-gray-200">VIDE</Badge>
      </div>
      <div className="text-[9px] text-gray-400 leading-relaxed">{slot.desc}</div>
      {slot.refs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {slot.refs.map((r) => (
            <span
              key={r}
              className={cn(
                "text-[8px] px-1.5 py-0.5 rounded font-medium",
                r === "Nouveau" ? "bg-green-50 text-green-600" : "bg-indigo-50 text-indigo-500"
              )}
            >
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryHeader({ cat }: { cat: CategoryDef }) {
  const c = COLOR_MAP[cat.color] || COLOR_MAP.gray;
  return (
    <div className={cn("rounded-xl px-4 py-3 border", c.bg, c.border)}>
      <div className={cn("text-sm font-bold", c.title)}>{cat.title}</div>
      <div className={cn("text-[9px] mt-0.5", c.sub)}>{cat.desc}</div>
      <div className={cn("text-[9px] mt-1 font-medium", c.count)}>
        0 / {cat.slots.length} elements definis
      </div>
    </div>
  );
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function MasterBibleVisuelCiblePage() {
  const [activeTab, setActiveTab] = useState<TabId>("structure");
  const { setActiveView } = useFrameMaster();

  const cat = CATEGORIES[activeTab];

  return (
    <PageLayout
      maxWidth="4xl"
      header={
        <PageHeader
          icon={Crosshair}
          iconColor="text-rose-600"
          title="A.5 Bible Visuelle Cible"
          subtitle={`Bibliotheque de standards — 14 categories, ${TOTAL_SLOTS} composants a definir`}
          onBack={() => setActiveView("bible-visuelle")}
        />
      }
    >
      {/* Tab navigation */}
      <div className="flex flex-wrap gap-1.5 mb-6 border-b pb-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const tabCat = CATEGORIES[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                activeTab === tab.id
                  ? "bg-rose-100 text-rose-700 font-semibold"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="text-[8px] opacity-60">({tabCat.slots.length})</span>
            </button>
          );
        })}
      </div>

      {/* Category content */}
      <div className="space-y-6">
        <CategoryHeader cat={cat} />
        <div className="grid grid-cols-2 gap-3">
          {cat.slots.map((slot) => (
            <SlotVide key={slot.id} slot={slot} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
