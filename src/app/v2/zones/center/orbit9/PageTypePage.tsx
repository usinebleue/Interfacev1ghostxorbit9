/**
 * PageTypePage.tsx — Bible Visuelle CarlOS
 * Source unique de vérité pour tous les patterns visuels de l'application
 * 7 onglets : Identité | Layout & Nav | Composants | Cards & Data | Bulles & Actions | Visualisations | Archive
 * 12 Bots officiels — ZÉRO intrus (pas de BCC/BPO)
 */

import { useState } from "react";
import {
  Palette, Users, Bot, Star, DollarSign, TrendingUp, Target,
  CheckCircle2, Clock, Eye, MessageSquare, Send, Plus,
  Zap, Shield, Search, ArrowRight, ArrowDown, Crown,
  Hand, Handshake, AlertTriangle, Flame, Info,
  TrendingDown, Minus, Settings, FileText, Lightbulb,
  Sparkles, RotateCcw, Scale, ThumbsUp, ThumbsDown,
  Gauge, Activity, Rocket,
  LayoutGrid, LayoutList, Filter, Loader2, ArrowDownAZ,
  ChevronRight, Trash2, BarChart3, Stethoscope, X, FolderKanban,
  BookOpen,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

export const OFFICIAL_BOTS = [
  { code: "BCO", name: "CarlOS", role: "CEO", color: "blue", emoji: "👔", subtitle: "Agent AI manufacturier", profil: "/agents/generated/ceo-carlos-profil-v3.png", standby: "/agents/generated/ceo-carlos-standby-v3.png" },
  { code: "BCT", name: "Thierry", role: "CTO", color: "violet", emoji: "💻", subtitle: "Technologie & Innovation", profil: "/agents/generated/cto-thierry-profil-v3.png", standby: "/agents/generated/cto-thierry-standby-v3.png" },
  { code: "BCF", name: "François", role: "CFO", color: "emerald", emoji: "💰", subtitle: "Finance & Trésorerie", profil: "/agents/generated/cfo-francois-profil-v3.png", standby: "/agents/generated/cfo-francois-standby-v3.png" },
  { code: "BCM", name: "Martine", role: "CMO", color: "pink", emoji: "📢", subtitle: "Marketing & Croissance", profil: "/agents/generated/cmo-martine-profil-v3.png", standby: "/agents/generated/cmo-martine-standby-v3.png" },
  { code: "BCS", name: "Sophie", role: "CSO", color: "red", emoji: "🎯", subtitle: "Stratégie & Ventes", profil: "/agents/generated/cso-sophie-profil-v3.png", standby: "/agents/generated/cso-sophie-standby-v3.png" },
  { code: "BOO", name: "Olivier", role: "COO", color: "orange", emoji: "⚙️", subtitle: "Opérations & Production", profil: "/agents/generated/coo-olivier-profil-v3.png", standby: "/agents/generated/coo-olivier-standby-v3.png" },
  { code: "BFA", name: "Fabien", role: "CPO", color: "slate", emoji: "🏭", subtitle: "Automatisation & Usine", profil: "/agents/generated/factory-bot-profil-v3.png", standby: "/agents/generated/factory-bot-standby-v3.png" },
  { code: "BHR", name: "Hélène", role: "CHRO", color: "teal", emoji: "🤝", subtitle: "Ressources Humaines", profil: "/agents/generated/chro-helene-profil-v3.png", standby: "/agents/generated/chro-helene-standby-v3.png" },
  { code: "BIO", name: "Inès", role: "CINO", color: "rose", emoji: "📊", subtitle: "Innovation & R&D", profil: "/agents/generated/cino-ines-profil-v3.png", standby: "/agents/generated/cino-ines-standby-v3.png" },
  { code: "BRO", name: "Raphaël", role: "CRO", color: "amber", emoji: "📈", subtitle: "Revenus & Croissance", profil: "/agents/generated/cro-raphael-profil-v3.png", standby: "/agents/generated/cro-raphael-standby-v3.png" },
  { code: "BLE", name: "Louise", role: "CLO", color: "indigo", emoji: "⚖️", subtitle: "Juridique & Conformité", profil: "/agents/generated/clo-louise-profil-v3.png", standby: "/agents/generated/clo-louise-standby-v3.png" },
  { code: "BSE", name: "Sébastien", role: "CISO", color: "zinc", emoji: "🛡️", subtitle: "Sécurité & Cyber", profil: "/agents/generated/ciso-secbot-profil-v3.png", standby: "/agents/generated/ciso-secbot-standby-v3.png" },
];

const tabs = [
  { id: "identite", label: "Identité" },
  { id: "layout-navigation", label: "Layout & Nav" },
  { id: "composants", label: "Composants" },
  { id: "cards-data", label: "Cards & Data" },
  { id: "bulles-actions", label: "Bulles & Actions" },
  { id: "visualisations", label: "Visualisations" },
  { id: "archive", label: "Archive" },
];


// ================================================================
// EXPORTED TAB FUNCTIONS — Used by MasterBibleVisuelCiblePage (FE.3)
// ================================================================

export function FE1TabLayout() {
  return (
    <>
      {/* --- 2.1 Structure de Page Patron --- */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Structure de Page Patron</h3>
        <p className="text-xs text-gray-400 mb-3">h-full flex flex-col bg-gray-50 + header bg-white border-b + flex-1 overflow-auto → max-w-4xl mx-auto p-4 space-y-4 pb-12</p>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-fuchsia-600" />
              <div>
                <div className="text-sm font-bold text-gray-800">Titre de la Section</div>
                <div className="text-xs text-gray-400">Sous-titre contextuel</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {["C", "R", "E", "D", "O"].map((letter, i) => (
                <span key={letter} className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold", i < 2 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400")}>
                  {letter}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="h-8 rounded-lg bg-white border border-gray-200 flex items-center px-3 text-[9px] text-gray-400">Contenu scrollable — max-w-4xl mx-auto</div>
              <div className="h-8 rounded-lg bg-white border border-gray-200 flex items-center px-3 text-[9px] text-gray-400">Cards, bulles, sections...</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2.2 Navigation — Barre & Tabs --- */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">Navigation — Barre d'action + sous-tabs header</h3>
        <p className="text-xs text-gray-400 mb-3">Back button + titre + sous-tabs pill — le pattern standard de toutes les pages canvas</p>
        <div className="space-y-3">
          {/* Barre d'action */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-white border-b px-4 py-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-gray-400 p-1 rounded-lg bg-gray-100"><ArrowRight className="h-4 w-4 rotate-180" /></div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900">Titre de la Section</h1>
                  <p className="text-[9px] text-gray-400">Sous-titre descriptif</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white shadow-sm cursor-pointer"><Bot className="h-3.5 w-3.5" /> Tab Active</button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 cursor-pointer"><Hand className="h-3.5 w-3.5" /> Tab Inactive</button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 cursor-pointer"><Target className="h-3.5 w-3.5" /> Tab Inactive</button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 text-xs text-gray-400 text-center">Contenu de la page ici</div>
          </div>
          {/* Regles */}
          <div className="space-y-2">
            {[
              "TITRE dans la barre d'action UNIQUEMENT — jamais dedouble avec un header gradient",
              "SOUS-TABS dans la barre d'action — meme pattern que TRG Industries et Marketplace",
              "BACK BUTTON — fleche grise en haut a gauche, ramene a la vue departement",
              "FULL WIDTH — le contenu couvre toute la largeur du Canvas",
              "ICONES en COULEUR dans le sidebar, en GRIS pour les actions neutres",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-700">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- 2.3 Structure Département (A1) --- */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">Structure Département (A1)</h3>
        <p className="text-xs text-gray-400 mb-3">Header gradient rectangle + 4 tabs intégrés — le pattern maître de toute l'app (DepartmentTourDeControle.tsx)</p>
        <div>
          <div className="bg-gradient-to-r from-violet-600 to-violet-500 rounded-xl p-4 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Technologie</h2>
              </div>
              <div className="flex gap-1.5">
                {[
                  { label: "Vue d'ensemble", icon: BarChart3, active: true },
                  { label: "Pipeline", icon: Target, active: false, count: 4 },
                  { label: "Documents", icon: FileText, active: false, count: 12 },
                  { label: "Diagnostics", icon: Stethoscope, active: false },
                ].map((t) => (
                  <span
                    key={t.label}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      t.active
                        ? "bg-white/25 text-white shadow-sm"
                        : "text-white/60 hover:bg-white/10 hover:text-white/80"
                    )}
                  >
                    <t.icon className="h-3.5 w-3.5" />
                    {t.label}
                    {t.count && t.count > 0 && (
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", t.active ? "bg-white/20 text-white" : "bg-white/10 text-white/50")}>{t.count}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            <span className="font-medium text-gray-500">Classes clés:</span> bg-gradient-to-r rounded-xl p-4 | Icon box: w-9 h-9 bg-white/20 rounded-lg | Tab active: bg-white/25 text-white shadow-sm | Tab inactive: text-white/60 hover:bg-white/10
          </p>
        </div>
      </div>

      {/* --- 2.4 Structure Mon Espace (A2) --- */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">Structure Mon Espace (A2)</h3>
        <p className="text-xs text-gray-400 mb-3">Variante avec sous-titre — titre + description text-white/70 (EspaceBureauView.tsx)</p>
        <div>
          <div className="bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl p-4 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Mes Idées</h2>
                  <p className="text-sm text-white/70 leading-relaxed">Capturer et développer vos idées</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {["Idées", "Documents", "Outils", "Tâches", "Agenda"].map((label, i) => (
                  <span
                    key={label}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      i === 0
                        ? "bg-white/25 text-white shadow-sm"
                        : "text-white/60 hover:bg-white/10 hover:text-white/90"
                    )}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            <span className="font-medium text-gray-500">Variante:</span> Avec sous-titre text-sm text-white/70 | shrink-0 sur icon box | hover text-white/90
          </p>
        </div>
      </div>

      {/* --- 2.5 Structure Pipeline (A3) --- */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">Structure Pipeline (A3)</h3>
        <p className="text-xs text-gray-400 mb-3">Variante avec badge count TOUJOURS visible — gradient change selon tab actif (MesChantiersView.tsx)</p>
        <div>
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-4 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Mes Discussions</h2>
                  <p className="text-sm text-white/70 leading-relaxed">Conversations avec vos agents IA</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {[
                  { label: "Discussions", count: 8, active: true },
                  { label: "Missions", count: 3, active: false },
                  { label: "Projets", count: 2, active: false },
                  { label: "Chantiers", count: 1, active: false },
                ].map((t) => (
                  <span
                    key={t.label}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      t.active
                        ? "bg-white/25 text-white shadow-sm"
                        : "text-white/60 hover:bg-white/10 hover:text-white/90"
                    )}
                  >
                    {t.label}
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", t.active ? "bg-white/20 text-white" : "bg-white/10 text-white/50")}>{t.count}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            <span className="font-medium text-gray-500">Variante:</span> Badge count TOUJOURS visible | Gradient change selon tab actif (violet/green/indigo/red)
          </p>
        </div>
      </div>

      {/* --- 2.6 CREDO Phase Indicator --- */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">Indicateur CREDO (5 cercles connectés)</h3>
        <p className="text-xs text-gray-400 mb-3">w-7 h-7 rounded-full — actifs bg-blue-600 text-white, inactifs bg-gray-100 — connecteurs w-4 h-0.5</p>
        <div className="flex items-center justify-center gap-1">
          {[
            { letter: "C", label: "Connect", active: true },
            { letter: "R", label: "Research", active: true },
            { letter: "E", label: "Expose", active: true },
            { letter: "D", label: "Demonstrate", active: false },
            { letter: "O", label: "Obtain", active: false },
          ].map((p, i) => (
            <div key={p.letter} className="flex items-center gap-1">
              <div className="flex flex-col items-center gap-1">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold", p.active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400")}>
                  {p.letter}
                </div>
                <span className={cn("text-[9px]", p.active ? "text-blue-600 font-medium" : "text-gray-400")}>{p.label}</span>
              </div>
              {i < 4 && <div className={cn("w-4 h-0.5 mb-4", i < 2 ? "bg-blue-400" : "bg-gray-200")} />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function FE1TabComposants() {
  return (
    <div className="space-y-8">
      {/* ── 3.1 Typographie ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.1 — Typographie</h3>
        <p className="text-xs text-gray-400 mb-3">10 niveaux de hierarchie typographique — du h1 au caption</p>
        <div className="space-y-2 border-l-2 border-gray-200 pl-4">
          <p className="text-lg font-bold text-gray-900">text-lg font-bold — Titre de page</p>
          <p className="text-sm font-bold text-gray-800">text-sm font-bold — Titre de section</p>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-600">text-xs font-bold uppercase — Header de card</p>
          <p className="text-xs text-gray-800">text-xs — Body text principal</p>
          <p className="text-xs text-gray-600">text-xs text-gray-600 — Body secondaire</p>
          <p className="text-[11px] text-gray-400">text-[11px] text-gray-400 — Meta / sous-titre</p>
          <p className="text-[10px] text-gray-400 uppercase">text-[10px] uppercase — Label KPI</p>
          <p className="text-[9px] text-gray-500">text-[9px] — Badge tiny</p>
          <p className="text-2xl font-bold text-blue-600">text-2xl font-bold — Valeur KPI</p>
          <p className="text-4xl font-bold text-emerald-600">text-4xl font-bold — Score global</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 3.2 Boutons ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.2 — Boutons</h3>
        <p className="text-xs text-gray-400 mb-3">Primary / Outline / Ghost / Pill — 4 variantes de boutons</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 w-20 shrink-0">Primary</span>
            <Button size="sm" className="text-xs gap-1 bg-blue-600 hover:bg-blue-700"><Send className="h-3 w-3" /> Action principale</Button>
            <Button size="sm" className="text-xs gap-1 bg-green-600 hover:bg-green-700"><CheckCircle2 className="h-3 w-3" /> Confirmer</Button>
            <Button size="sm" className="text-xs gap-1 bg-orange-600 hover:bg-orange-700"><Plus className="h-3 w-3" /> Ajouter</Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 w-20 shrink-0">Outline</span>
            <Button size="sm" variant="outline" className="text-xs gap-1"><Eye className="h-3 w-3" /> Voir</Button>
            <Button size="sm" variant="outline" className="text-xs gap-1"><MessageSquare className="h-3 w-3" /> Details</Button>
            <Button size="sm" variant="outline" className="text-xs gap-1"><Search className="h-3 w-3" /> Rechercher</Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 w-20 shrink-0">Ghost</span>
            <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 gap-1"><Eye className="h-3 w-3" /> Profil</Button>
            <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 gap-1"><MessageSquare className="h-3 w-3" /> Chat</Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 w-20 shrink-0">Pill action</span>
            <button className="text-xs px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer font-medium">Option A</button>
            <button className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer font-medium">Option B</button>
            <button className="text-xs px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer font-medium">Option C</button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 3.3 Badges ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.3 — Badges</h3>
        <p className="text-xs text-gray-400 mb-3">Status / Type / Compteur — 3 variantes de badges</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 w-20 shrink-0">Status</span>
            <Badge variant="outline" className="text-[9px] text-green-600 bg-green-50 border-green-300">Actif</Badge>
            <Badge variant="outline" className="text-[9px] text-amber-600 bg-amber-50 border-amber-300">En attente</Badge>
            <Badge variant="outline" className="text-[9px] text-red-600 bg-red-50 border-red-300">Critique</Badge>
            <Badge variant="outline" className="text-[9px] text-blue-600 bg-blue-50 border-blue-300">Info</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 w-20 shrink-0">Type</span>
            <Badge variant="outline" className="text-[9px]">Categorie</Badge>
            <Badge className="bg-blue-100 text-blue-700 text-[9px]">EXPERTISE</Badge>
            <Badge className="bg-amber-100 text-amber-700 text-[9px]">MANPOWER</Badge>
            <Badge className="bg-green-100 text-green-700 text-[9px]">NOUVELLE</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 w-20 shrink-0">Compteur</span>
            <span className="min-w-[14px] h-3.5 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">7</span>
            <span className="min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">3</span>
            <span className="min-w-[14px] h-3.5 bg-green-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">12</span>
            <span className="text-[10px] text-gray-400 ml-2">— Utilise dans header, sidebar</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 3.4 Barre de Recherche ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.4 — Barre de Recherche</h3>
        <p className="text-xs text-gray-400 mb-3">Search input standard avec icone</p>
        <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-white">
          <Search className="h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Chercher par industrie, fonction ou besoin..." className="flex-1 text-sm outline-none bg-transparent" />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 3.5 Score Bars ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.5 — Score Bars</h3>
        <p className="text-xs text-gray-400 mb-3">h-2.5 bg-gray-100 rounded-full overflow-hidden — fill couleur avec transition</p>
        <div className="space-y-3">
          {[
            { label: "Impact revenus", score: 92, color: "bg-fuchsia-500" },
            { label: "Faisabilite 12 mois", score: 65, color: "bg-orange-500" },
            { label: "Originalite", score: 75, color: "bg-green-500" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-[10px] text-gray-500 font-medium mb-0.5">{s.label}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.score}%` }} />
                </div>
                <span className="text-xs font-bold text-gray-600 w-8 text-right">{s.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 3.6 Pilules ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.6 — Pilules</h3>
        <p className="text-xs text-gray-400 mb-3">Centrees, rounded-full, pastel — pour fin de flow et navigation entre modes</p>
        <div className="space-y-4">
          <div>
            <p className="text-[10px] text-gray-400 mb-2">Completion</p>
            <div className="flex justify-center">
              <div className="flex items-center gap-2 bg-fuchsia-50 border border-fuchsia-200 rounded-full px-4 py-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-fuchsia-600" />
                <span className="text-xs text-fuchsia-700 font-medium">Innovation terminee — 3 techniques, modele hybride genere</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-2">Transitions (entre modes)</p>
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <button className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-yellow-100 font-medium cursor-pointer"><Lightbulb className="h-3.5 w-3.5" /> Brainstorm</button>
              <button className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-cyan-100 font-medium cursor-pointer"><Eye className="h-3.5 w-3.5" /> Analyse</button>
              <button className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-emerald-100 font-medium cursor-pointer"><FileText className="h-3.5 w-3.5" /> Cahier SMART</button>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-2">Start (lancement)</p>
            <div className="flex justify-center">
              <button className="flex items-center gap-3 bg-fuchsia-600 text-white px-8 py-4 rounded-2xl text-sm font-semibold shadow-lg hover:bg-fuchsia-700 transition-all cursor-pointer">
                <Sparkles className="h-5 w-5" /> Lancer l'Innovation
              </button>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-2">Restart</p>
            <div className="flex justify-center">
              <button className="flex items-center gap-2 bg-gray-200 text-gray-600 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-300 transition-all cursor-pointer">
                <RotateCcw className="h-4 w-4" /> Relancer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 3.7 Icones — Regles ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.7 — Icones — Regles</h3>
        <p className="text-xs text-gray-400 mb-3">Regles de sizing et couleur par contexte</p>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-gray-400 w-28 shrink-0">Sidebar (couleur)</span>
            <div className="flex items-center gap-3">
              <Users className="h-3.5 w-3.5 text-blue-500" />
              <Handshake className="h-3.5 w-3.5 text-emerald-500" />
              <Crown className="h-3.5 w-3.5 text-violet-500" />
              <Rocket className="h-3.5 w-3.5 text-indigo-500" />
              <Star className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <span className="text-[10px] text-gray-500">— Toujours en couleur</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-gray-400 w-28 shrink-0">KPI cards (-400)</span>
            <div className="flex items-center gap-3">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              <DollarSign className="h-3.5 w-3.5 text-green-400" />
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              <Star className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <span className="text-[10px] text-gray-500">— Couleur-400 subtile</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-gray-400 w-28 shrink-0">Actions (gris)</span>
            <div className="flex items-center gap-3">
              <Settings className="h-3.5 w-3.5 text-gray-400" />
              <ArrowRight className="h-3.5 w-3.5 text-gray-400 rotate-180" />
              <Search className="h-3.5 w-3.5 text-gray-400" />
              <Eye className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-500">— Gris-400 pour actions neutres</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-gray-400 w-28 shrink-0">Taille standard</span>
            <div className="flex items-center gap-3">
              <Bot className="h-3 w-3 text-gray-500" /><span className="text-[9px] text-gray-400">h-3</span>
              <Bot className="h-3.5 w-3.5 text-gray-500" /><span className="text-[9px] text-gray-400">h-3.5</span>
              <Bot className="h-4 w-4 text-gray-500" /><span className="text-[9px] text-gray-400">h-4</span>
              <Bot className="h-5 w-5 text-gray-500" /><span className="text-[9px] text-gray-400">h-5</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 3.8 Couleurs de Statut ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.8 — Couleurs de Statut</h3>
        <p className="text-xs text-gray-400 mb-3">5 couleurs de statut semantiques</p>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Succes", color: "green", example: "Actif, Valide, Sain" },
            { label: "Info", color: "blue", example: "En cours, Planifie" },
            { label: "Warning", color: "amber", example: "En attente, Risque" },
            { label: "Danger", color: "red", example: "Critique, Erreur" },
            { label: "Neutre", color: "gray", example: "Inactif, Archive" },
          ].map((s) => (
            <div key={s.label} className={cn("p-3 rounded-lg border text-center", `bg-${s.color}-50 border-${s.color}-200`)}>
              <div className={cn("w-6 h-6 rounded-full mx-auto mb-1", `bg-${s.color}-500`)} />
              <p className={cn("text-xs font-bold", `text-${s.color}-700`)}>{s.label}</p>
              <p className="text-[10px] text-gray-500">{s.example}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 3.9 Fonds Pastel ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.9 — Fonds Pastel</h3>
        <p className="text-xs text-gray-400 mb-3">8 fonds pastel pour discussions, alertes, cards</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "blue-50", bg: "bg-blue-50", border: "border-blue-200" },
            { label: "violet-50", bg: "bg-violet-50", border: "border-violet-200" },
            { label: "emerald-50", bg: "bg-emerald-50", border: "border-emerald-200" },
            { label: "amber-50", bg: "bg-amber-50", border: "border-amber-200" },
            { label: "pink-50", bg: "bg-pink-50", border: "border-pink-200" },
            { label: "orange-50", bg: "bg-orange-50", border: "border-orange-200" },
            { label: "indigo-50", bg: "bg-indigo-50", border: "border-indigo-200" },
            { label: "red-50", bg: "bg-red-50", border: "border-red-200" },
          ].map((c) => (
            <div key={c.label} className={cn("p-3 rounded-lg border text-center", c.bg, c.border)}>
              <p className="text-[10px] font-medium text-gray-600">{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 3.10 Formulaires (B) ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.10 — Formulaires</h3>
        <p className="text-xs text-gray-400 mb-3">Dialog standard + Briefing inline — les 2 patterns de saisie utilisateur</p>
        <div className="space-y-4">

          {/* B1 — Dialog standard */}
          <div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2">B1 — Dialog standard (sm:max-w-md)</p>
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg max-w-md mx-auto overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="text-sm font-bold text-gray-800">Nouvelle Discussion</div>
                <div className="text-xs text-gray-500 mt-0.5">Démarrer une conversation avec un agent</div>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">Titre *</label>
                  <input readOnly defaultValue="Stratégie Q3 2026" className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Description</label>
                  <textarea readOnly rows={2} defaultValue="Planifier les objectifs du trimestre..." className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Priorité</label>
                  <select disabled className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer">
                    <option>Moyenne</option>
                  </select>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
                <span className="px-4 py-2 text-xs text-gray-600 bg-gray-100 rounded-lg cursor-pointer">Annuler</span>
                <span className="px-4 py-2 text-xs text-white bg-gray-900 rounded-lg cursor-pointer flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Créer
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5 text-center">
              <span className="font-medium text-gray-500">Input:</span> px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 |
              <span className="font-medium text-gray-500 ml-1">Submit:</span> bg-gray-900 text-white |
              <span className="font-medium text-gray-500 ml-1">Cancel:</span> bg-gray-100 text-gray-600
            </p>
          </div>

          {/* B2 — Briefing inline (3 couleurs) */}
          <div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2">B2 — Briefing inline (Mission / Projet / Chantier)</p>
            <div className="grid grid-cols-3 gap-3">
              {/* Mission = bleu */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Briefing Mission</span>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Nom</label>
                  <input readOnly defaultValue="Audit sécurité" className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-300" />
                </div>
                <div className="flex gap-1">
                  <span className="text-[9px] font-medium px-2 py-1 rounded-full border bg-red-500 text-white border-red-500">Haute</span>
                  <span className="text-[9px] font-medium px-2 py-1 rounded-full border bg-white text-gray-500 border-gray-200">Moyenne</span>
                  <span className="text-[9px] font-medium px-2 py-1 rounded-full border bg-white text-gray-500 border-gray-200">Basse</span>
                </div>
                <span className="inline-block text-xs font-medium text-white bg-blue-500 px-4 py-1.5 rounded-lg">Lancer</span>
              </div>
              {/* Projet = indigo */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <FolderKanban className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Briefing Projet</span>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Nom</label>
                  <input readOnly defaultValue="Refonte UX" className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-indigo-300 placeholder:text-gray-300" />
                </div>
                <span className="inline-block text-xs font-medium text-white bg-indigo-500 px-4 py-1.5 rounded-lg">Créer</span>
              </div>
              {/* Chantier = amber */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Briefing Chantier</span>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Nom</label>
                  <input readOnly defaultValue="Migration API" className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-amber-300 placeholder:text-gray-300" />
                </div>
                <span className="inline-block text-xs font-medium text-white bg-amber-500 px-4 py-1.5 rounded-lg">Ouvrir</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              <span className="font-medium text-gray-500">Pattern:</span> bg-color-50 border border-color-200 rounded-lg p-3 |
              <span className="font-medium text-gray-500 ml-1">Label compact:</span> text-[9px] font-bold text-gray-500 uppercase |
              <span className="font-medium text-gray-500 ml-1">Priority pills:</span> rouge/orange/gris
            </p>
          </div>

        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 3.11 Recherche & Filtres (C) ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.11 — Recherche & Filtres</h3>
        <p className="text-xs text-gray-400 mb-3">Search bar, filter pills, sort toggles, view mode — la barre d'outils standard</p>
        <div className="space-y-4">

          {/* C1 — Search bar complète */}
          <div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2">C1 — Barre de recherche complète (MesChantiersView pattern)</p>
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input readOnly placeholder="Rechercher une discussion..." className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-300" />
                </div>
                <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 shrink-0">
                  <span className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[9px] font-medium bg-white text-gray-700 shadow-sm">
                    <Clock className="h-3.5 w-3.5" /> Date
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[9px] font-medium text-gray-400">
                    <ArrowDownAZ className="h-3.5 w-3.5" /> Nom
                  </span>
                </div>
                <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 shrink-0">
                  <span className="p-1.5 rounded-md bg-white text-gray-700 shadow-sm">
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </span>
                  <span className="p-1.5 rounded-md text-gray-400">
                    <LayoutList className="h-3.5 w-3.5" />
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg shrink-0">
                  <Plus className="h-3.5 w-3.5" /> Nouvelle discussion
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              <span className="font-medium text-gray-500">Input:</span> pl-9 pr-3 py-2 text-sm + Search icon absolute |
              <span className="font-medium text-gray-500 ml-1">Sort group:</span> bg-gray-100 rounded-lg p-0.5 |
              <span className="font-medium text-gray-500 ml-1">Sort active:</span> bg-white shadow-sm
            </p>
          </div>

          {/* C2 — Search bar variante EspaceBureau */}
          <div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2">C2 — Barre de recherche variante (EspaceBureauView — bouton noir)</p>
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input readOnly placeholder="Rechercher une idée..." className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
                <span className="flex items-center gap-1.5 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg">
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </span>
                <span className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg">
                  <Filter className="h-3.5 w-3.5" /> Filtrer
                </span>
                <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <span className="p-2 bg-gray-900 text-white">
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </span>
                  <span className="p-2 text-gray-400">
                    <LayoutList className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              <span className="font-medium text-gray-500">Variante:</span> Bouton Ajouter bg-gray-900 text-white | Bouton Filtrer outline | Toggle grille/liste avec border
            </p>
          </div>

          {/* C3 — Filter pills */}
          <div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2">C3 — Filter pills (filtrage par bot)</p>
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-[9px] px-2.5 py-1 rounded-full font-medium bg-gray-900 text-white flex items-center gap-1">
                  Toutes (24)
                </span>
                {[
                  { label: "CarlOS CEO", color: "blue" },
                  { label: "Olivier COO", color: "orange" },
                  { label: "Thomas CTO", color: "violet" },
                  { label: "Sophie CSO", color: "red" },
                ].map((bot) => (
                  <span key={bot.label} className="text-[9px] px-2.5 py-1 rounded-full font-medium text-gray-500 bg-gray-100 flex items-center gap-1">
                    <span className={`w-3.5 h-3.5 rounded-full bg-${bot.color}-200`} />
                    {bot.label} (3)
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              <span className="font-medium text-gray-500">Active:</span> bg-gray-900 text-white |
              <span className="font-medium text-gray-500 ml-1">Inactive:</span> text-gray-500 bg-gray-100 |
              <span className="font-medium text-gray-500 ml-1">Taille:</span> text-[9px] px-2.5 py-1 rounded-full
            </p>
          </div>

        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 3.12 Etats Vides & Loading (D) ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.12 — Etats Vides & Loading</h3>
        <p className="text-xs text-gray-400 mb-3">EmptyState et LoadingSpinner — les 2 patterns d'attente</p>
        <div className="grid grid-cols-2 gap-4">

          {/* D1 — EmptyState */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-3 py-1.5 border-b">
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">D1 — EmptyState</p>
            </div>
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-gray-100">
                <MessageSquare className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Aucune discussion</p>
              <p className="text-xs text-gray-400 mt-1">Commencez une conversation avec un agent</p>
            </div>
          </div>

          {/* D2 — LoadingSpinner */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-3 py-1.5 border-b">
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">D2 — LoadingSpinner</p>
            </div>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          </div>

        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          <span className="font-medium text-gray-500">EmptyState:</span> w-12 h-12 rounded-full bg-gray-100 + text-sm text-gray-500 + text-xs text-gray-400 |
          <span className="font-medium text-gray-500 ml-1">Spinner:</span> Loader2 h-6 w-6 animate-spin text-gray-400
        </p>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 3.13 Progress & Scores (F) ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.13 — Progress & Scores</h3>
        <p className="text-xs text-gray-400 mb-3">Barres de progression, scores, seuils de couleur</p>
        <div className="space-y-4">

          {/* F1 — Progress bar standard */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">F1 — Progress bar standard (h-1.5)</p>
            {[
              { label: "Complétion", pct: 75, color: "blue" },
              { label: "Budget", pct: 45, color: "emerald" },
              { label: "Délai", pct: 90, color: "amber" },
            ].map((bar) => (
              <div key={bar.label} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">{bar.label}</span>
                  <span className="text-xs font-bold text-gray-700">{bar.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-${bar.color}-500 transition-all duration-1000 ease-out`} style={{ width: `${bar.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* F2 — Score bar grande */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">F2 — Score bar grande (h-2.5) + seuils couleur</p>
            {[
              { label: "Ventes", score: 85, color: "green" },
              { label: "Innovation", score: 62, color: "amber" },
              { label: "Trésorerie", score: 38, color: "red" },
            ].map((bar) => (
              <div key={bar.label} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">{bar.label}</span>
                  <span className={`text-xs font-bold text-${bar.color}-600`}>{bar.score}/100</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-${bar.color}-500 transition-all duration-1000 ease-out`} style={{ width: `${bar.score}%` }} />
                </div>
              </div>
            ))}
            <div className="flex gap-4 text-[9px] pt-1 border-t border-gray-100">
              <span className="text-green-600">80+ = Vert</span>
              <span className="text-amber-600">60+ = Ambre</span>
              <span className="text-red-600">Sous 60 = Rouge</span>
            </div>
          </div>

          {/* F3 — VITAA dual-track */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">F3 — VITAA dual-track (score vs moyenne superposés)</p>
            {[
              { label: "Ventes", score: 78, avg: 65 },
              { label: "Innovation", score: 55, avg: 70 },
              { label: "Temps", score: 82, avg: 60 },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">{item.label}</span>
                  <div className="flex gap-2 text-[9px]">
                    <span className="text-blue-600 font-bold">{item.score}</span>
                    <span className="text-gray-400">moy: {item.avg}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                  <div className="h-full rounded-full bg-blue-500/30 absolute" style={{ width: `${item.avg}%` }} />
                  <div className={`h-full rounded-full ${item.score >= 80 ? "bg-green-500" : item.score >= 60 ? "bg-amber-500" : "bg-red-500"} relative`} style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
            <div className="flex gap-3 text-[9px] pt-1 border-t border-gray-100">
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-blue-500 inline-block" /> Score</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-blue-500/30 inline-block" /> Moyenne secteur</span>
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 3.14 Status & Badges Specialises (G) ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.14 — Status & Badges Specialises</h3>
        <p className="text-xs text-gray-400 mb-3">Indicateurs visuels de chaleur, status, priorité, état</p>
        <div className="space-y-4">

          {/* G1 — Heat indicators */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-3">G1 — Heat indicators (chaleur des chantiers)</p>
            <div className="flex items-center gap-6">
              {[
                { emoji: "fire", label: "Brûle (3+ piliers)", desc: "Priorité maximale" },
                { emoji: "yellow", label: "Couve (2 piliers)", desc: "Sous surveillance" },
                { emoji: "white", label: "Meurt (1 pilier)", desc: "Intervention requise" },
              ].map((heat) => (
                <div key={heat.label} className="flex items-center gap-2">
                  <Flame className={cn("h-5 w-5", heat.emoji === "fire" ? "text-red-500" : heat.emoji === "yellow" ? "text-amber-400" : "text-gray-300")} />
                  <div>
                    <p className="text-xs font-bold text-gray-700">{heat.label}</p>
                    <p className="text-[9px] text-gray-400">{heat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* G2 — Status dots */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-3">G2 — Status dots (w-2 h-2 rounded-full)</p>
            <div className="flex items-center gap-6">
              {[
                { color: "bg-green-500", label: "En ligne" },
                { color: "bg-amber-500", label: "Occupé" },
                { color: "bg-red-500", label: "Hors ligne" },
                { color: "bg-blue-500", label: "En travail" },
                { color: "bg-gray-300", label: "Inactif" },
              ].map((dot) => (
                <div key={dot.label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${dot.color}`} />
                  <span className="text-xs text-gray-600">{dot.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* G3 — Priority pills */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-3">G3 — Priority pills (toggle selection)</p>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="text-[9px] font-medium px-2 py-1 rounded-full border bg-red-500 text-white border-red-500">Haute</span>
                <span className="text-[9px] font-medium px-2 py-1 rounded-full border bg-white text-gray-500 border-gray-200">Moyenne</span>
                <span className="text-[9px] font-medium px-2 py-1 rounded-full border bg-white text-gray-500 border-gray-200">Basse</span>
              </div>
              <span className="text-[9px] text-gray-300">|</span>
              <div className="flex gap-1">
                <span className="text-[9px] font-medium px-2 py-1 rounded-full border bg-white text-gray-500 border-gray-200">Haute</span>
                <span className="text-[9px] font-medium px-2 py-1 rounded-full border bg-amber-400 text-white border-amber-400">Moyenne</span>
                <span className="text-[9px] font-medium px-2 py-1 rounded-full border bg-white text-gray-500 border-gray-200">Basse</span>
              </div>
              <span className="text-[9px] text-gray-300">|</span>
              <div className="flex gap-1">
                <span className="text-[9px] font-medium px-2 py-1 rounded-full border bg-white text-gray-500 border-gray-200">Haute</span>
                <span className="text-[9px] font-medium px-2 py-1 rounded-full border bg-white text-gray-500 border-gray-200">Moyenne</span>
                <span className="text-[9px] font-medium px-2 py-1 rounded-full border bg-gray-400 text-white border-gray-400">Basse</span>
              </div>
            </div>
          </div>

          {/* G4 — Badge status */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-3">G4 — Badge status (tag labels)</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "en-cours", bg: "bg-blue-100", text: "text-blue-700" },
                { label: "planifié", bg: "bg-amber-100", text: "text-amber-700" },
                { label: "terminé", bg: "bg-green-100", text: "text-green-700" },
                { label: "en-attente", bg: "bg-gray-100", text: "text-gray-600" },
                { label: "stratégie", bg: "bg-indigo-100", text: "text-indigo-700" },
                { label: "innovation", bg: "bg-violet-100", text: "text-violet-700" },
                { label: "technologie", bg: "bg-cyan-100", text: "text-cyan-700" },
                { label: "opérations", bg: "bg-orange-100", text: "text-orange-700" },
                { label: "marketing", bg: "bg-pink-100", text: "text-pink-700" },
                { label: "finance", bg: "bg-emerald-100", text: "text-emerald-700" },
                { label: "sécurité", bg: "bg-red-100", text: "text-red-700" },
                { label: "RH", bg: "bg-teal-100", text: "text-teal-700" },
              ].map((tag) => (
                <span key={tag.label} className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${tag.bg} ${tag.text}`}>
                  {tag.label}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              <span className="font-medium text-gray-500">Pattern:</span> text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-color-100 text-color-700
            </p>
          </div>

          {/* G5 — Nudge banners (CarlOS inline) */}
          <div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2">G5 — Nudge banners (alertes inline CarlOS)</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[9px] font-bold mr-1">CarlOS:</span>
                <span className="flex-1">3 missions en attente de review — voulez-vous qu'on les passe ensemble?</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[9px] font-bold mr-1">CarlOS:</span>
                <span className="flex-1">Le budget marketing est à 92% — action recommandée avant fin de mois</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[9px] font-bold mr-1">CarlOS:</span>
                <span className="flex-1">Audit sécurité complété — score 87/100, en hausse de 12 points</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              <span className="font-medium text-gray-500">3 types:</span> info (blue) | warning (amber) | success (green) |
              <span className="font-medium text-gray-500 ml-1">Pattern:</span> bg-color-50 text-color-700 border-color-200
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export function FE1TabCardsData() {
  return (
    <div className="space-y-8">
      {/* ── 4.1 Card Containers — 3 niveaux ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.1 — Card Containers — 3 niveaux</h3>
        <p className="text-xs text-gray-400 mb-3">Standard (shadow-sm) | Premium (border-2 shadow-lg) | Alerte (border-2 + gradient fond)</p>
        <div className="space-y-3">
          {/* Standard */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-2.5 flex items-center gap-2 border-b">
              <Lightbulb className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Card Standard</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-fuchsia-800">BADGE</span>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-600">bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm</p>
              <p className="text-[10px] text-gray-400 mt-1">Utilise: TechniqueCard, FeasibilitySpectrum, IshikawaDiagram</p>
            </div>
          </div>
          {/* Premium */}
          <div className="bg-gradient-to-b from-fuchsia-50 to-white border-2 border-fuchsia-300 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-fuchsia-100 to-pink-100 px-4 py-3 flex items-center gap-2 border-b border-fuchsia-300">
              <Sparkles className="h-5 w-5 text-fuchsia-700" />
              <div className="flex-1">
                <div className="text-sm font-bold text-fuchsia-900">Card Premium</div>
                <div className="text-xs text-fuchsia-700">border-2 border-{"{color}"}-300 shadow-lg</div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-600">Utilise: SyntheseCard, VerdictCard (Debat, Decision)</p>
            </div>
          </div>
          {/* Alerte */}
          <div className="bg-gradient-to-b from-red-50 to-white border-2 border-red-300 rounded-xl p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-900">Card Alerte</p>
                <p className="text-xs text-red-700 mt-1">border-2 border-red-300 rounded-xl p-5 shadow-lg + gradient fond</p>
                <p className="text-[10px] text-gray-400 mt-1">Utilise: AlertCard (Crise)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.2 En-tetes Gradient Specimens ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.2 — En-tetes Gradient Specimens</h3>
        <p className="text-xs text-gray-400 mb-3">Sature (-500 to -500) pour TechniqueCard | Pastel (-100 to -100) pour Spectre, Synthese</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-2.5 border-b">
              <span className="text-sm font-bold text-white">Header Sature</span>
            </div>
            <div className="p-3">
              <p className="text-[10px] text-gray-500">from-{"{color}"}-500 to-{"{color2}"}-500</p>
            </div>
          </div>
          <div className="border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-fuchsia-100 to-pink-100 px-4 py-2.5 border-b border-fuchsia-200">
              <span className="text-sm font-bold text-fuchsia-900">Header Pastel</span>
            </div>
            <div className="p-3">
              <p className="text-[10px] text-gray-500">from-{"{color}"}-100 to-{"{color2}"}-100 + border-{"{color}"}-200</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.3 Bot Proposal Card ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.3 — Bot Proposal Card</h3>
        <p className="text-xs text-gray-400 mb-3">border rounded-lg px-3 py-2.5 border-l-[3px] border-l-{"{color}"}-400 bg-{"{color}"}-50/30</p>
        <div className="space-y-2">
          <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-violet-400 bg-violet-50/30 border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">Proposition CTO — abonnement predictif avec IoT sur equipements critiques...</p>
          </div>
          <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-emerald-400 bg-emerald-50/30 border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">Proposition CFO — modele de financement par leasing operationnel a 36 mois...</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.4 KPI Cards ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.4 — KPI Cards</h3>
        <p className="text-xs text-gray-400 mb-3">grid-cols-4 gap-3 — gradient header style Cockpit — Marketplace, Cellules, Pionniers, etc.</p>
        <div className="grid grid-cols-4 gap-3">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
              <Users className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Label KPI</span>
            </div>
            <div className="px-3 py-2">
              <div className="text-2xl font-bold text-blue-600">42</div>
              <div className="text-[10px] text-gray-500">Description courte</div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-500">
              <DollarSign className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Montant</span>
            </div>
            <div className="px-3 py-2">
              <div className="text-2xl font-bold text-green-600">2,700$</div>
              <div className="text-[10px] text-gray-500">Par mois</div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <TrendingUp className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Pourcentage</span>
            </div>
            <div className="px-3 py-2">
              <div className="text-2xl font-bold text-emerald-600">85%</div>
              <div className="text-[10px] text-gray-500">En hausse</div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
              <Star className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Score</span>
            </div>
            <div className="px-3 py-2">
              <div className="text-2xl font-bold text-amber-600">4.7/5</div>
              <div className="text-[10px] text-gray-500">Satisfaction</div>
            </div>
          </Card>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.5 Tour de Controle — Dept Cards ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.5 — Tour de Controle — Cards departement</h3>
        <p className="text-xs text-gray-400 mb-3">Header gradient couleur du bot, contenu compact, grid-cols-3</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { dept: "Finances", code: "BCF", color: "emerald", icon: DollarSign, kpis: [{ l: "Tresorerie", v: "845,000$", c: "emerald" }, { l: "Revenus", v: "125,000$", c: "gray" }, { l: "Marge", pct: 42 }] },
            { dept: "Technologie", code: "BCT", color: "violet", icon: Zap, kpis: [{ l: "Uptime", v: "99.7%", c: "violet" }, { l: "Deploys", v: "12 ce mois", c: "gray" }, { l: "Securite", pct: 88 }] },
            { dept: "Marketing", code: "BCM", color: "pink", icon: Target, kpis: [{ l: "Leads", v: "47", c: "pink" }, { l: "Conversion", v: "12.3%", c: "gray" }, { l: "Budget", pct: 65 }] },
          ].map((d) => {
            const Icon = d.icon;
            return (
              <Card key={d.code} className="overflow-hidden">
                <div className={cn("bg-gradient-to-r px-3 py-2 flex items-center justify-between", `from-${d.color}-600 to-${d.color}-500`)}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-white">{d.dept}</span>
                  </div>
                </div>
                <div className="p-3 space-y-2.5">
                  {d.kpis.map((k) => (
                    "pct" in k ? (
                      <div key={k.l}>
                        <p className="text-xs text-gray-800">{k.l}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", `bg-${d.color}-500`)} style={{ width: `${k.pct}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-gray-600">{k.pct}%</span>
                        </div>
                      </div>
                    ) : (
                      <div key={k.l}>
                        <p className="text-xs text-gray-800">{k.l}</p>
                        <p className={cn("text-xs font-bold", k.c === "gray" ? "text-gray-700" : `text-${k.c}-600`)}>{k.v}</p>
                      </div>
                    )
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.6 Cockpit Bot Grid ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.6 — Cockpit Bot Grid</h3>
        <p className="text-xs text-gray-400 mb-3">grid-cols-4 gap-2 — avatar + couleur + mini-bulletin</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { code: "BCO", name: "CarlOS CEO", color: "blue", stats: [{ l: "Travail", v: "3" }, { l: "Decisions", v: "12" }] },
            { code: "BCT", name: "CTO", color: "violet", stats: [{ l: "Deploys", v: "8" }, { l: "Bugs", v: "2" }] },
            { code: "BCF", name: "CFO", color: "emerald", stats: [{ l: "Budget", v: "94%" }, { l: "Alertes", v: "1" }] },
            { code: "BCM", name: "CMO", color: "pink", stats: [{ l: "Leads", v: "47" }, { l: "Campagnes", v: "3" }] },
          ].map((bot) => (
            <Card key={bot.code} className="overflow-hidden">
              <div className={cn("px-2.5 py-1.5 flex items-center gap-2", `bg-gradient-to-r from-${bot.color}-600 to-${bot.color}-500`)}>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-white/30">
                  {bot.code.slice(1, 3)}
                </div>
                <span className="text-[10px] font-bold text-white truncate">{bot.name}</span>
              </div>
              <div className="p-2 space-y-1">
                {bot.stats.map((s) => (
                  <div key={s.l} className="flex items-center justify-between py-[3px]">
                    <span className="text-[10px] text-gray-500">{s.l}</span>
                    <span className="text-xs font-bold text-gray-800">{s.v}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.7 VITAA Health Bars ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.7 — VITAA Health Bars</h3>
        <p className="text-xs text-gray-400 mb-3">5 piliers — couleur par score (vert ≥70, ambre 45-69, rouge &lt;45) — h-2.5</p>
        <div className="space-y-3">
          {[
            { letter: "V", label: "Vente", desc: "Capacite de generation", score: 78, trend: "up" },
            { letter: "I", label: "Idee", desc: "Innovation et creation", score: 62, trend: "stable" },
            { letter: "T", label: "Temps", desc: "Efficacite operationnelle", score: 35, trend: "down" },
            { letter: "A", label: "Argent", desc: "Sante financiere", score: 85, trend: "up" },
            { letter: "A", label: "Actif", desc: "Valeur des actifs", score: 51, trend: "stable" },
          ].map((p) => {
            const color = p.score >= 70 ? "green" : p.score >= 45 ? "amber" : "red";
            const TrendIcon = p.trend === "up" ? TrendingUp : p.trend === "down" ? TrendingDown : Minus;
            return (
              <div key={p.label} className="flex items-center gap-3">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0", `bg-${color}-500`)}>
                  {p.letter}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-gray-800">{p.label}</span>
                    <div className="flex items-center gap-1.5">
                      <TrendIcon className={cn("h-3.5 w-3.5", `text-${color}-500`)} />
                      <span className={cn("text-sm font-bold", `text-${color}-600`)}>{p.score}</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", `bg-${color}-500`)} style={{ width: `${p.score}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.8 Triangle du Feu ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.8 — Triangle du Feu</h3>
        <p className="text-xs text-gray-400 mb-3">4 etats: BRULE (3+), COUVE (2), MEURT (1), SAIN</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "BRULE", icon: Flame, color: "red", desc: "3+ piliers forts" },
            { label: "COUVE", icon: AlertTriangle, color: "amber", desc: "2 piliers en zone" },
            { label: "MEURT", icon: TrendingDown, color: "gray", desc: "1 seul pilier actif" },
            { label: "SAIN", icon: CheckCircle2, color: "green", desc: "Equilibre optimal" },
          ].map((state) => {
            const Icon = state.icon;
            return (
              <div key={state.label} className={cn("p-3 rounded-lg border-l-4 bg-white border", `border-l-${state.color}-500 border-gray-100`)}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("h-4 w-4", `text-${state.color}-500`)} />
                  <span className={cn("text-xs font-bold", `text-${state.color}-700`)}>{state.label}</span>
                </div>
                <p className="text-[10px] text-gray-500">{state.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.9 Discussion Bubbles par Bot ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.9 — Discussion Bubbles par Bot</h3>
        <p className="text-xs text-gray-400 mb-3">Bordure gauche couleur du bot, fond blanc</p>
        <div className="space-y-2">
          {[
            { bot: "BCO (CEO)", color: "blue", msg: "Je recommande de prioriser le pipeline manufacturier avant l'expansion." },
            { bot: "BCT (CTO)", color: "violet", msg: "L'architecture actuelle supporte 10x la charge. On est solides." },
            { bot: "BCF (CFO)", color: "emerald", msg: "Le cash flow permet 3 mois de runway sans revenu additionnel." },
          ].map((b) => (
            <div key={b.bot} className={cn("p-3 rounded-xl border-l-[3px] bg-white border", `border-l-${b.color}-400 border-gray-100`)}>
              <p className={cn("text-xs font-semibold mb-1", `text-${b.color}-700`)}>{b.bot}</p>
              <p className="text-xs text-gray-600">{b.msg}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.10 Multi-perspectives ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.10 — Multi-perspectives</h3>
        <p className="text-xs text-gray-400 mb-3">grid-cols-3 gap-3 — fond pastel par bot</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { bot: "CEO", code: "BCO", color: "blue", msg: "Vision strategique: concentrer sur 3 pionniers." },
            { bot: "CFO", code: "BCF", color: "emerald", msg: "ROI positif apres 4 mois avec le pricing actuel." },
            { bot: "CTO", code: "BCT", color: "violet", msg: "APIs pretes, deploiement en 48h." },
          ].map((b) => (
            <div key={b.code} className={cn("p-3 rounded-xl border", `bg-${b.color}-50 border-${b.color}-200`)}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold", `bg-${b.color}-500`)}>
                  {b.code.charAt(2)}
                </div>
                <span className={cn("text-xs font-bold", `text-${b.color}-700`)}>{b.bot}</span>
              </div>
              <p className="text-xs text-gray-700">{b.msg}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.11 Sentinelle CarlOS ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.11 — Sentinelle CarlOS</h3>
        <p className="text-xs text-gray-400 mb-3">Messages coaching quand CarlOS detecte un pattern</p>
        <div className="space-y-2">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">C</div>
            <div className="flex-1">
              <p className="text-xs text-amber-800"><span className="font-bold">Sentinelle:</span> Ca fait 3 fois qu'on tourne autour de la meme idee. Tu veux qu'on cristallise?</p>
              <div className="flex gap-2 mt-2">
                <button className="text-[10px] px-2.5 py-1 rounded-full bg-amber-200 text-amber-800 font-medium cursor-pointer">Cristalliser</button>
                <button className="text-[10px] px-2.5 py-1 rounded-full bg-white border border-amber-300 text-amber-700 font-medium cursor-pointer">Continuer</button>
              </div>
            </div>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">C</div>
            <div className="flex-1">
              <p className="text-xs text-blue-800"><span className="font-bold">CarlOS:</span> Lien detecte avec ton projet "Expansion Maritimes". Tu veux connecter?</p>
              <div className="flex gap-2 mt-2">
                <button className="text-[10px] px-2.5 py-1 rounded-full bg-blue-200 text-blue-800 font-medium cursor-pointer">Connecter</button>
                <button className="text-[10px] px-2.5 py-1 rounded-full bg-white border border-blue-300 text-blue-700 font-medium cursor-pointer">Pas maintenant</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.12 Options Message ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.12 — Options Message</h3>
        <p className="text-xs text-gray-400 mb-3">Generees par CarlOS — challenger, brancher, explorer</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Challenger cette idee", color: "amber" },
            { label: "Explorer plus en profondeur", color: "blue" },
            { label: "Consulter le CFO", color: "emerald" },
            { label: "Cristalliser", color: "violet" },
          ].map((opt) => (
            <button key={opt.label} className={cn("text-xs px-3 py-1.5 rounded-full border font-medium cursor-pointer transition-colors", `bg-${opt.color}-50 border-${opt.color}-200 text-${opt.color}-700 hover:bg-${opt.color}-100`)}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.13 Cockpit Live ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.13 — Cockpit Live</h3>
        <p className="text-xs text-gray-400 mb-3">Fixe en bas sidebar droite — 3 canaux</p>
        <div className="max-w-xs mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl px-3 py-4">
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">CarlOS Live</span>
            </div>
            <div className="flex gap-2">
              {[
                { label: "Vocal", color: "green", icon: "🎙" },
                { label: "Appel", color: "blue", icon: "📞" },
                { label: "Video", color: "purple", icon: "📹" },
              ].map((ch) => (
                <div key={ch.label} className={cn("flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl border cursor-pointer transition-all", `bg-${ch.color}-50/50 border-${ch.color}-100 hover:border-${ch.color}-300`)}>
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-lg", `bg-${ch.color}-100`)}>
                    {ch.icon}
                  </div>
                  <span className="text-[10px] font-medium text-gray-600">{ch.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.14 Fiche CV Agent ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.14 — Fiche CV Agent</h3>
        <p className="text-xs text-gray-400 mb-3">Avatar + badges competences + footer stats + actions</p>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">SC</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-800">Bot Soudage Cobot</h4>
              <p className="text-[10px] text-gray-500 mb-2">Agent Integration Robotique Soudure</p>
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge variant="outline" className="text-[9px] px-1.5">Programmation cobot</Badge>
                <Badge variant="outline" className="text-[9px] px-1.5">ROI automatisation</Badge>
                <Badge variant="outline" className="text-[9px] px-1.5">Formation</Badge>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />4.9</span>
                  <span>8 utilisateurs</span>
                  <span className="font-bold text-gray-800">125$/mois</span>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1"><Eye className="h-3 w-3" /> Fiche</Button>
                  <Button size="sm" className="text-[10px] h-7 gap-1 bg-blue-600 hover:bg-blue-700"><Plus className="h-3 w-3" /> Ajouter</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.15 Card Opportunite ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.15 — Card Opportunite</h3>
        <p className="text-xs text-gray-400 mb-3">Badges type + budget + competences + mains levees</p>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-blue-100 text-blue-700 text-[9px]">EXPERTISE</Badge>
                <Badge variant="outline" className="text-[9px] text-blue-600 border-blue-300">Intra-Cellule</Badge>
              </div>
              <h4 className="text-sm font-bold text-gray-800">Titre du projet ou cahier</h4>
              <p className="text-[10px] text-gray-400">Client · 90 jours</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">125-175K$</p>
              <p className="text-[10px] text-gray-400">Budget estime</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="outline" className="text-[9px] px-1.5">Competence 1</Badge>
            <Badge variant="outline" className="text-[9px] px-1.5">Competence 2</Badge>
            <Badge variant="outline" className="text-[9px] px-1.5">Competence 3</Badge>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <Hand className="h-3 w-3 text-green-500" />
              <span>3 mains levees</span>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1"><Eye className="h-3 w-3" /> Voir cahier</Button>
              <Button size="sm" className="text-[10px] h-7 gap-1 bg-green-600 hover:bg-green-700"><Hand className="h-3 w-3" /> Lever la main</Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.16 Alertes ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.16 — Alertes</h3>
        <p className="text-xs text-gray-400 mb-3">Fond pastel + icone + texte — pas de CTA standalone</p>
        <div className="space-y-2">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Alerte Warning</p>
              <p className="text-xs text-amber-700">Situation a surveiller — metriques en zone de risque.</p>
            </div>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Alerte Info</p>
              <p className="text-xs text-blue-700">Information contextuelle pour l'utilisateur.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.17 Flow Pipeline ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.17 — Flow Pipeline</h3>
        <p className="text-xs text-gray-400 mb-3">3 cards pastel + fleches de connexion</p>
        <div className="flex items-center gap-2">
          {[
            { title: "ETAPE 1", desc: "Collecte donnees", color: "blue" },
            { title: "ETAPE 2", desc: "Analyse IA", color: "indigo" },
            { title: "ETAPE 3", desc: "Livrable final", color: "emerald" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={cn("flex-1 p-3 rounded-xl border text-center", `bg-${s.color}-50 border-${s.color}-200`)}>
                <p className={cn("text-xs font-bold", `text-${s.color}-700`)}>{s.title}</p>
                <p className="text-[10px] text-gray-500">{s.desc}</p>
              </div>
              {i < 2 && <ArrowRight className="h-4 w-4 text-gray-300 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.18 Cross-links ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.18 — Cross-links</h3>
        <p className="text-xs text-gray-400 mb-3">Liens entre sections de l'application</p>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 bg-orange-50 border-orange-200 cursor-pointer hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs font-bold text-orange-800">Lien vers autre section</p>
                <p className="text-[10px] text-orange-600">Description courte</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 bg-violet-50 border-violet-200 cursor-pointer hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-violet-600" />
              <div>
                <p className="text-xs font-bold text-violet-800">Lien vers autre section</p>
                <p className="text-[10px] text-violet-600">Description courte</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 4.19 Cards Specialisees (E) ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.19 — Cards Specialisees</h3>
        <p className="text-xs text-gray-400 mb-3">Cards discussion (grille + liste), mission/chantier, KPI briefing</p>
        <div className="space-y-4">

          {/* E1 — Card discussion (vue grille) */}
          <div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2">E1 — Card Discussion (vue grille)</p>
            <div className="grid grid-cols-2 gap-3">
              <Card className="group overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white">Thomas CTO</span>
                    <span className="text-[9px] text-white/60 ml-1.5">Agent Technologie</span>
                  </div>
                  <span className="text-white/30 hover:text-white transition-colors p-0.5 opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="px-3 py-3 space-y-2">
                  <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-relaxed">Architecture microservices — migration Q3</h3>
                  <p className="text-[9px] text-gray-400 line-clamp-2 leading-relaxed">Discussion sur la stratégie de migration vers une architecture distribuée...</p>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                      <MessageSquare className="h-3.5 w-3.5" /> 12
                    </span>
                    <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                      <Clock className="h-3.5 w-3.5" /> il y a 2h
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium">en-cours</span>
                  </div>
                </div>
              </Card>

              <Card className="group overflow-hidden hover:shadow-lg transition-all cursor-pointer ring-2 ring-violet-400">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white">CarlOS CEO</span>
                    <span className="text-[9px] text-white/60 ml-1.5">Agent Direction</span>
                  </div>
                </div>
                <div className="px-3 py-3 space-y-2">
                  <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-relaxed">Plan stratégique 2026-2027</h3>
                  <p className="text-[9px] text-gray-400 line-clamp-2 leading-relaxed">Définition des axes prioritaires pour les 18 prochains mois...</p>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                      <MessageSquare className="h-3.5 w-3.5" /> 24
                    </span>
                    <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                      <Clock className="h-3.5 w-3.5" /> il y a 1j
                    </span>
                  </div>
                </div>
              </Card>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              <span className="font-medium text-gray-500">Card:</span> group overflow-hidden hover:shadow-lg |
              <span className="font-medium text-gray-500 ml-1">Active:</span> ring-2 ring-violet-400 |
              <span className="font-medium text-gray-500 ml-1">Avatar:</span> w-8 h-8 bg-white/20 rounded-lg |
              <span className="font-medium text-gray-500 ml-1">Delete:</span> opacity-0 group-hover:opacity-100
            </p>
          </div>

          {/* E2 — Card discussion (vue liste) */}
          <div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2">E2 — Card Discussion (vue liste)</p>
            <div className="space-y-2">
              <Card className="px-4 py-3 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                    <Settings className="h-4 w-4 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700 truncate">Architecture microservices — migration Q3</div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">Thomas CTO</Badge>
                      <span className="text-[9px] text-gray-400">12 msg</span>
                      <span className="text-[9px] text-gray-400">il y a 2h</span>
                    </div>
                  </div>
                  <span className="text-gray-300 hover:text-red-400 transition-colors p-0.5 opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                </div>
              </Card>
              <Card className="px-4 py-3 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Crown className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700 truncate">Plan stratégique 2026-2027</div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">CarlOS CEO</Badge>
                      <span className="text-[9px] text-gray-400">24 msg</span>
                      <span className="text-[9px] text-gray-400">il y a 1j</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                </div>
              </Card>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              <span className="font-medium text-gray-500">Card:</span> px-4 py-3 hover:shadow-md |
              <span className="font-medium text-gray-500 ml-1">Title:</span> text-sm font-medium text-gray-700 truncate |
              <span className="font-medium text-gray-500 ml-1">ChevronRight:</span> h-4 w-4 text-gray-300
            </p>
          </div>

          {/* E3 — Card pipeline (mission/chantier) */}
          <div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2">E3 — Card Pipeline (mission/projet dans département)</p>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-0 overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-3 py-2.5">
                  <p className="text-xs font-bold text-white truncate">Audit processus qualité</p>
                  <span className="text-[9px] text-white/60">Mission active</span>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-[9px] text-gray-500 line-clamp-2">Analyser les goulots de production et proposer des améliorations...</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">en-cours</span>
                    <span className="text-[9px] text-gray-400">il y a 3h</span>
                  </div>
                </div>
              </Card>
              <Card className="p-0 overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-3 py-2.5">
                  <p className="text-xs font-bold text-white truncate">Cartographie compétences</p>
                  <span className="text-[9px] text-white/60">Projet planifié</span>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-[9px] text-gray-500 line-clamp-2">Identifier les gaps de compétences dans l'équipe technique...</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium">planifié</span>
                    <span className="text-[9px] text-gray-400">il y a 1j</span>
                  </div>
                </div>
              </Card>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              <span className="font-medium text-gray-500">Card:</span> p-0 overflow-hidden |
              <span className="font-medium text-gray-500 ml-1">Header:</span> bg-gradient-to-r px-3 py-2.5 |
              <span className="font-medium text-gray-500 ml-1">Tag:</span> text-[9px] px-1.5 py-0.5 rounded bg-color-50
            </p>
          </div>

          {/* E4 — Briefing KPI cards (4 colonnes) */}
          <div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2">E4 — KPI Briefing cards (4 colonnes)</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Target, label: "Missions", value: "12", sub: "3 actives", color: "blue" },
                { icon: FileText, label: "Documents", value: "47", sub: "8 récents", color: "emerald" },
                { icon: Activity, label: "Score", value: "82%", sub: "+5% ce mois", color: "violet" },
                { icon: Clock, label: "Heures", value: "164h", sub: "ce trimestre", color: "amber" },
              ].map((kpi) => (
                <Card key={kpi.label} className="p-0 overflow-hidden">
                  <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-${kpi.color}-600 to-${kpi.color}-500`}>
                    <kpi.icon className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white">{kpi.label}</span>
                  </div>
                  <div className="px-3 py-2">
                    <div className={`text-2xl font-bold text-${kpi.color}-600`}>{kpi.value}</div>
                    <div className="text-[11px] text-gray-500">{kpi.sub}</div>
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              <span className="font-medium text-gray-500">Grid:</span> grid-cols-4 gap-3 |
              <span className="font-medium text-gray-500 ml-1">Card:</span> p-0 overflow-hidden |
              <span className="font-medium text-gray-500 ml-1">Value:</span> text-2xl font-bold (JAMAIS text-xl)
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export function FE1TabBullesActions() {
  return (
    <>
      {/* ── Intro v2 ── */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-bold text-indigo-800">Taxonomie Bulles & Actions — v2</span>
          </div>
          <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Validée Gemini + audit complet</span>
        </div>
        <p className="text-xs text-indigo-700 mb-2">
          Chaque bulle = une responsabilité. Chaque bouton répond à : <strong>"Quelle est ma prochaine action cognitive?"</strong>
        </p>
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div className="bg-white rounded-lg px-2 py-1.5 border border-indigo-100">
            <span className="font-semibold text-indigo-700">Règle #1</span>
            <p className="text-gray-500 mt-0.5">Max 3 boutons visibles → menu "..." pour le reste</p>
          </div>
          <div className="bg-white rounded-lg px-2 py-1.5 border border-indigo-100">
            <span className="font-semibold text-indigo-700">Règle #2</span>
            <p className="text-gray-500 mt-0.5">Jamais suggérer un bouton qui crée une boucle</p>
          </div>
          <div className="bg-white rounded-lg px-2 py-1.5 border border-indigo-100">
            <span className="font-semibold text-indigo-700">Naming</span>
            <p className="text-gray-500 mt-0.5">"Fil parallèle" ✓ · "Nuancer" (≠ Contre-argument)</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* A — CATALOGUE D'ACTIONS (référence, extensible)  */}
      {/* ═══════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-indigo-500" /> A — Catalogue complet des actions
          <span className="text-[10px] text-gray-400 font-normal normal-case">— ajouter ici quand une nouvelle action émerge</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Colonne 1 — Branches & Workflow */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
            <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Branches & Workflow</div>
            {[
              ["🌿", "Fil parallèle", "Ouvrir un sous-fil sans quitter le principal"],
              ["📋", "Synthétiser", "Résumer & extraire les points clés du fil"],
              ["⏸", "Parker ce fil", "Mettre en pause pour revenir plus tard"],
              ["🎯", "Promouvoir en projet", "Transformer en action concrète (Cahier SMART)"],
              ["📤", "Exporter / Partager", "Copier, télécharger ou envoyer à l'équipe"],
            ].map(([e, l, d]) => (
              <div key={String(l)} className="flex items-start gap-2">
                <span className="text-base shrink-0 leading-none">{e}</span>
                <div><div className="text-[11px] font-semibold text-gray-800">{l}</div><div className="text-[10px] text-gray-400">{d}</div></div>
              </div>
            ))}
          </div>
          {/* Colonne 2 — Confrontation & Profondeur */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
            <div className="text-[10px] font-bold text-red-700 uppercase tracking-wide">Confrontation & Profondeur</div>
            {[
              ["⚔️", "Challenger", "Défier la réponse du bot (max 2/bulle, 4/fil)"],
              ["💬", "Nuancer", "Apporter une perspective alternative (≠ Contre-argument)"],
              ["🔀", "Fusionner", "Réconcilier plusieurs perspectives en une synthèse"],
              ["💬", "Débat entre bots", "Lancer un débat structuré entre 2+ bots"],
              ["👥", "Consulter [bot]", "Inviter un autre bot sur la question en cours"],
            ].map(([e, l, d]) => (
              <div key={String(l)} className="flex items-start gap-2">
                <span className="text-base shrink-0 leading-none">{e}</span>
                <div><div className="text-[11px] font-semibold text-gray-800">{l}</div><div className="text-[10px] text-gray-400">{d}</div></div>
              </div>
            ))}
          </div>
          {/* Colonne 3 — Conservation & Mémoire */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Conservation & Mémoire</div>
            {[
              ["💎", "Cristalliser", "Sauvegarder l'insight dans la banque d'idées"],
              ["📌", "Extraire → rapport", "Pousser vers un pré-rapport ou document"],
              ["🔁", "Approfondir", "Demander plus de détail sur ce point spécifique"],
            ].map(([e, l, d]) => (
              <div key={String(l)} className="flex items-start gap-2">
                <span className="text-base shrink-0 leading-none">{e}</span>
                <div><div className="text-[11px] font-semibold text-gray-800">{l}</div><div className="text-[10px] text-gray-400">{d}</div></div>
              </div>
            ))}
          </div>
          {/* Colonne 4 — Nouvelles (Gemini) */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1">
              Actions futures <span className="bg-emerald-200 text-emerald-800 px-1 rounded text-[9px]">Gemini suggest.</span>
            </div>
            {[
              ["⚡", "Plan d'action", "Générer un plan actionnable immédiat — Focus Card & Verdict"],
              ["🛡️", "Évaluer les risques", "Matrice de risques sur la situation — Normal Bot & Focus"],
              ["👤", "Déléguer", "Assigner à un membre de l'équipe — Synthesis & Verdict"],
              ["🔮", "Scénario Et si?", "Explorer des hypothèses alternatives — Normal Bot Brainstorm"],
            ].map(([e, l, d]) => (
              <div key={String(l)} className="flex items-start gap-2">
                <span className="text-base shrink-0 leading-none">{e}</span>
                <div><div className="text-[11px] font-semibold text-gray-800">{l}</div><div className="text-[10px] text-gray-400">{d}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* B — OPTIONS TEXTUELLES vs BOUTONS D'ACTION         */}
      {/* ═══════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-violet-500" /> B — Options textuelles du bot vs Boutons d'action
        </h3>
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-3">
          <p className="text-xs text-violet-800 leading-relaxed">
            <strong>Ce sont deux niveaux distincts.</strong> Les options textuelles répondent à <em>"de quoi on parle?"</em> (contexte-spécifique, générées par le bot).
            Les boutons d'action répondent à <em>"comment je veux traiter ça?"</em> (toujours disponibles, structurels).
            Ils coexistent avec une hiérarchie visuelle claire — options en premier (plus grosses), actions en dessous (plus discrètes).
          </p>
        </div>
        {/* Mock visuel de cohabitation */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm shrink-0 mt-1 ring-2 ring-blue-300">🎩</div>
            <div className="bg-white border border-l-[3px] border-blue-200 border-l-blue-400 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm max-w-sm">
              <div className="text-xs font-semibold text-blue-700 mb-1">CarlOS — CEO</div>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">Le pipeline affiche $73K en attente. Y'a-t-il un prospect sur lequel on devrait accélérer?</p>
              {/* Options textuelles — niveau 1 (contenu) */}
              <div className="mb-2.5">
                <div className="text-[10px] text-gray-400 font-medium mb-1">Options (générées par le bot) :</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Bauches — $45K", "Pourquoi ça stagne?", "Plan closing Q2"].map(o => (
                    <button key={o} className="text-xs px-3 py-1.5 rounded-full bg-blue-50 border border-blue-300 text-blue-700 font-medium cursor-pointer hover:bg-blue-100">{o}</button>
                  ))}
                </div>
              </div>
              {/* Séparateur */}
              <div className="border-t border-gray-100 pt-2">
                <div className="text-[10px] text-gray-400 font-medium mb-1">Actions (toujours disponibles) :</div>
                <div className="flex flex-wrap gap-1.5">
                  <button className="text-[10px] px-2 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 font-medium cursor-pointer">🌿 Fil parallèle</button>
                  <button className="text-[10px] px-2 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-medium cursor-pointer">⚔️ Challenger</button>
                  <button className="text-[10px] px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium cursor-pointer">💎 Cristalliser</button>
                  <button className="text-[10px] px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-500 font-medium cursor-pointer">···</button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-[10px]">
            <span className="text-green-600">✅ Deux niveaux clairs — pas de confusion</span>
            <span className="text-gray-400">Options au-dessus = contenu · Actions en dessous = structure</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════ */}
      {/* BULLE 1 — FOCUS CARD */}
      {/* ══════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════ */}
      {/* C — BULLES DE PRODUCTION (8 types)               */}
      {/* ═══════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-gray-500" /> C — Bulles de production
          <span className="text-[10px] text-gray-400 font-normal normal-case">— boutons assignés par type</span>
        </h3>
        <div className="space-y-4">

        {/* === FOCUS CARD === */}
        <div className="border border-blue-200 rounded-xl overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">1 — Focus Card</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Clic dashboard → nouvelle discussion</span>
            </div>
            <span className="text-[10px] opacity-70">Rôle : ancrer + choisir sujet & mode</span>
          </div>
          <div className="p-4 bg-blue-50">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 ring-2 ring-blue-300 mt-1">🎩</div>
              <div className="bg-white border border-l-[3px] border-blue-200 border-l-blue-400 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm max-w-md">
                <div className="flex items-center gap-1.5 mb-2"><span className="text-xs font-bold text-blue-700">CarlOS</span><span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-semibold">CEO</span></div>
                <div className="space-y-1 mb-2 pb-2 border-b border-gray-100 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Bauches inc.</span><span className="font-semibold text-blue-700">$45 000</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Innovtech</span><span className="font-semibold text-blue-700">$28 500</span></div>
                </div>
                <p className="text-sm text-blue-800 mb-3">Le pipeline montre 73K$ en attente. Y'a-t-il un prospect à accélérer?</p>
                <div className="mb-2">
                  <div className="text-[10px] text-gray-400 font-medium mb-1.5">Options (bot) :</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Top opportunités", "Pourquoi ça stagne?", "Plan closing"].map(o => (
                      <button key={o} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 border border-blue-300 text-blue-700 font-medium cursor-pointer">"{o}"</button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-2">
                  <div className="text-[10px] text-gray-400 font-medium mb-1.5">Actions :</div>
                  <div className="flex flex-wrap gap-1.5">
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 border border-blue-300 text-blue-700 font-medium cursor-pointer">🔍 Analyser</button>
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-300 text-indigo-700 font-medium cursor-pointer">🎯 Décider</button>
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 font-medium cursor-pointer">⚡ Plan d'action</button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <div className="text-[10px] text-gray-400 font-medium w-full mb-1">Mode :</div>
                    {[["👁","Analyse"],["🎯","Stratégie"],["⚖️","Décision"],["🔥","Crise"]].map(([e,l]) => (
                      <button key={String(l)} className="text-[10px] px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-gray-600 font-medium cursor-pointer">{e} {l}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === NORMAL BOT === */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">2 — Réponse Bot (normale)</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Réponse standard</span>
            </div>
            <span className="text-[10px] opacity-70">Rôle : traiter la réponse</span>
          </div>
          <div className="p-4 bg-gray-50">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 ring-2 ring-blue-300 mt-1">🎩</div>
              <div className="bg-white border border-l-[3px] border-gray-200 border-l-blue-400 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm max-w-md">
                <div className="text-xs font-semibold text-blue-700 mb-1">CarlOS — CEO</div>
                <p className="text-sm text-gray-700 mb-3">Sur Bauches, je recommande une approche CREDO directe — valider le budget avant d'exposer la solution tech.</p>
                <div className="mb-2">
                  <div className="text-[10px] text-gray-400 font-medium mb-1.5">Options (bot) :</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Approfondir les finances", "Voir les risques", "Planifier l'appel"].map(o => (
                      <button key={o} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium cursor-pointer">"{o}"</button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-2">
                  <div className="text-[10px] text-gray-400 font-medium mb-1.5">Actions :</div>
                  <div className="flex flex-wrap gap-1.5">
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 font-medium cursor-pointer">🌿 Fil parallèle</button>
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-medium cursor-pointer">⚔️ Challenger</button>
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium cursor-pointer">💎 Cristalliser</button>
                    <button className="text-[10px] px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-500 cursor-pointer">···</button>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Menu ··· : 👥 Consulter · 🔁 Approfondir · 🛡️ Risques · 🔮 Scénario Et si?</div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Challenger se désactive si quota atteint (max 2/bulle, 4/fil)</div>
          </div>
        </div>

        {/* === CHALLENGE === */}
        <div className="border border-red-200 rounded-xl overflow-hidden">
          <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">3 — Challenge</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Déjà dans la friction</span>
            </div>
            <span className="text-[10px] opacity-70">Rôle : pousser ou changer d'angle</span>
          </div>
          <div className="p-4 bg-red-50">
            <div className="flex items-center gap-2 mb-2 ml-11">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 border-2 border-red-200" />
              <div className="w-4 h-px bg-red-300" />
              <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">⚔️ Challenge — CarlOS</span>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 ring-2 ring-red-200 mt-1">🎩</div>
              <div className="bg-white border border-l-[3px] border-red-100 border-l-red-400 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm max-w-md">
                <div className="text-xs font-semibold text-blue-700 mb-1">CarlOS — CEO · Défense</div>
                <p className="text-sm text-gray-700 mb-3">L'approche CREDO est validée par 47 cycles réels. Le coût d'inaction si on n'engage pas Bauches cette semaine est estimé à $28K perdu au concurrent.</p>
                <div className="border-t border-gray-100 pt-2">
                  <div className="text-[10px] text-gray-400 font-medium mb-1.5">Actions :</div>
                  <div className="flex flex-wrap gap-1.5">
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 font-medium cursor-pointer">🌿 Fil parallèle</button>
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 font-medium cursor-pointer">💬 Nuancer</button>
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 font-medium cursor-pointer">🌊 Deep</button>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Mode recommandé : Débat · Deep · Innovation</div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Max 2 challenges par bulle source — bouton grisé après</div>
          </div>
        </div>

        {/* === CONSULTATION === */}
        <div className="border border-violet-200 rounded-xl overflow-hidden">
          <div className="bg-violet-600 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">4 — Consultation</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Bot invité (multi-perspectives)</span>
            </div>
            <span className="text-[10px] opacity-70">Rôle : confronter ou consolider</span>
          </div>
          <div className="p-4 bg-violet-50">
            <div className="flex items-center gap-2 mb-2 ml-11">
              <div className="w-2.5 h-2.5 rounded-full bg-violet-400 border-2 border-violet-200" />
              <div className="w-4 h-px bg-violet-300" />
              <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">👥 Consultation — François CFO</span>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 ring-2 ring-violet-200 mt-1">💰</div>
              <div className="bg-white border border-l-[3px] border-violet-100 border-l-emerald-400 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm max-w-md">
                <div className="text-xs font-semibold text-emerald-700 mb-1">François — CFO</div>
                <p className="text-sm text-gray-700 mb-3">Côté finances, Bauches a un DSO de 67 jours. Si on close un $45K, ça améliore le ratio de trésorerie de 12%. Je recommande d'aller vite.</p>
                <div className="border-t border-gray-100 pt-2">
                  <div className="text-[10px] text-gray-400 font-medium mb-1.5">Actions :</div>
                  <div className="flex flex-wrap gap-1.5">
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-medium cursor-pointer">⚔️ Challenger CFO</button>
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 font-medium cursor-pointer">💬 Débat CEO vs CFO</button>
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-medium cursor-pointer">🔀 Fusionner</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === SYNTHESIS DORÉE === */}
        <div className="border border-amber-300 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">5 — Synthèse (dorée)</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Conclusion du fil</span>
            </div>
            <span className="text-[10px] opacity-70">Rôle : finaliser → agir</span>
          </div>
          <div className="p-4 bg-amber-50">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 ring-2 ring-amber-300 mt-1">🎩</div>
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-md max-w-md">
                <div className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> Synthèse CarlOS</div>
                <p className="text-sm text-amber-900 mb-3">Décision : closer Bauches cette semaine (budget validé, DSO favorable, urgence concurrentielle). Plan : appel lundi → démo mardi → contrat vendredi.</p>
                <div className="border-t border-amber-200 pt-2">
                  <div className="text-[10px] text-gray-400 font-medium mb-1.5">Actions — finalisation seulement :</div>
                  <div className="flex flex-wrap gap-1.5">
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 font-medium cursor-pointer">💎 Cristalliser</button>
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700 font-medium cursor-pointer">📤 Exporter</button>
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium cursor-pointer">🎯 Promouvoir en projet</button>
                  </div>
                  <div className="text-[10px] text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Pas de modes de réflexion — on est en phase de conclusion</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === COACHING === */}
        <div className="border border-blue-200 rounded-xl overflow-hidden">
          <div className="bg-blue-500 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">6 — Coaching</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Intervention proactive de CarlOS</span>
            </div>
            <span className="text-[10px] opacity-70">Rôle : guider le flux</span>
          </div>
          <div className="p-4 bg-blue-50">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 ring-2 ring-blue-300 mt-1">🎩</div>
              <div className="bg-blue-50 border border-blue-200 border-l-[3px] border-l-blue-400 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm max-w-md">
                <div className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1"><Zap className="h-3 w-3" /> CarlOS — Coaching</div>
                <p className="text-sm text-blue-800 mb-3">On tourne sur le même angle depuis 6 échanges. Il n'y aura pas plus d'info ici. C'est le moment de décider ou de cristalliser.</p>
                <div className="text-[10px] text-gray-400 font-medium mb-1.5">Options dynamiques (CarlOS choisit) :</div>
                <div className="flex flex-wrap gap-1.5">
                  <button className="text-[10px] px-2.5 py-1 rounded-full bg-white border border-blue-300 text-blue-700 font-medium cursor-pointer">Parker et nouveau fil</button>
                  <button className="text-[10px] px-2.5 py-1 rounded-full bg-white border border-blue-300 text-blue-700 font-medium cursor-pointer">Forcer la synthèse</button>
                  <button className="text-[10px] px-2.5 py-1 rounded-full bg-white border border-blue-300 text-blue-700 font-medium cursor-pointer">Revenir au sujet</button>
                </div>
                <div className="text-[10px] text-blue-500 mt-2">Pas de boutons d'action additionnels — CarlOS a déjà pris le contrôle</div>
              </div>
            </div>
          </div>
        </div>

        {/* === VOICE === */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-600 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">7 — Voice</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Transcript vocal LiveKit</span>
            </div>
            <span className="text-[10px] opacity-70">Rôle : idem Normal Bot</span>
          </div>
          <div className="p-4 bg-gray-50">
            <p className="text-xs text-gray-600">Même boutons que <strong>Normal Bot</strong> + icône 🎙️ Vocal visible. Pas de traitement différent. Le transcript est injecté comme message assistant standard.</p>
          </div>
        </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* D — BULLES SIMULATION (design ref, pas encore live) */}
      {/* ═══════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> D — Bulles Simulation (design ref)
          <span className="text-[10px] text-gray-400 font-normal normal-case">— existent dans les scénarios, pas encore dans le chat live</span>
        </h3>
        <div className="space-y-3">
          {[
            {
              num: "8", name: "Verdict Card (Go/No-Go)", color: "indigo", desc: "Conclusion structurée d'un mode Décision — matrice pondérée + consensus + plan",
              actions: ["⚔️ Challenger verdict (max 1)", "💬 Nuancer", "📋 Cahier SMART", "📤 Exporter"],
              modes: ["Débat", "Crise", "Analyse"],
              note: "Max 1 challenge du verdict — après : actions concrètes seulement",
            },
            {
              num: "9", name: "Perspectives Card (multi-bots)", color: "violet", desc: "Résultat d'une consultation simultanée de 2+ bots — perspectives juxtaposées",
              actions: ["⚔️ Challenger [bot]", "💬 Débat entre bots", "🔀 Fusionner", "▶ Synthétiser"],
              modes: ["Débat", "Analyse", "Deep"],
              note: "",
            },
            {
              num: "10", name: "Synthèse Card (riche)", color: "amber", desc: "Synthèse élaborée avec axes, données & recommandations — cahier-components",
              actions: ["⚔️ Challenger synthèse (max 1)", "📁 Générer document", "🎯 Promouvoir en projet"],
              modes: [],
              note: "Max 1 challenge — pas de modes de réflexion (on conclut)",
            },
            {
              num: "11", name: "Pré-rapport Card", color: "gray", desc: "Document structuré généré après un diagnostic — prêt à exporter",
              actions: ["📤 Exporter (.md / PDF)", "▶ Voir la suite"],
              modes: [],
              note: "Lecture seule — pas d'interaction cognitive",
            },
          ].map((b) => (
            <div key={b.num} className={cn("border rounded-xl p-3", `border-${b.color}-200 bg-${b.color}-50`)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-xs font-bold", `text-${b.color}-800`)}>{b.num} — {b.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-2">{b.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {b.actions.map(a => (
                      <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium">{a}</span>
                    ))}
                  </div>
                  {b.modes.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 font-medium">Modes :</span>
                      {b.modes.map(m => <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500">{m}</span>)}
                    </div>
                  )}
                  {b.note && <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{b.note}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* E — ANTI-LOOP : 5 règles Sentinelle               */}
      {/* ═══════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> E — Règles anti-boucle (Sentinelle CarlOS)
          <span className="text-[10px] text-gray-400 font-normal normal-case">— validées Gemini · intervention automatique</span>
        </h3>
        <div className="space-y-2">
          {[
            {
              id: "a", trigger: "3× même question user", color: "amber",
              msg: "On tourne autour du même angle depuis un moment. Changeons d'approche.",
              actions: ["Reformuler", "Fil parallèle", "Nuancer"],
            },
            {
              id: "b", trigger: ">4 challenges total dans le fil", color: "red",
              msg: "Les positions sont claires — il n'y a rien de plus qui va sortir. C'est le moment de trancher.",
              actions: ["Synthèse finale", "Décider Go/No-Go", "Cristalliser"],
            },
            {
              id: "c", trigger: ">8 échanges bot sans synthèse", color: "orange",
              msg: "On a bien exploré. Veux-tu synthétiser ou passer à l'action?",
              actions: ["Synthétiser", "Cahier SMART", "Cristalliser et continuer"],
            },
            {
              id: "d", trigger: "Branche à >2 niveaux de profondeur", color: "purple",
              msg: "Tu es à 2+ niveaux de branche. Finalise ou remonte vers le fil principal.",
              actions: ["Synthétiser cette branche", "Retour au fil principal"],
            },
            {
              id: "e", trigger: ">20 min dans un fil sans décision (futur)", color: "gray",
              msg: "Ça fait 20 min sur ce sujet. On synthétise, on parke, ou on force une décision?",
              actions: ["Synthétiser", "Parker ce fil", "Forcer une décision"],
              future: true,
            },
          ].map((r) => (
            <div key={r.id} className={cn("border rounded-xl p-3", r.future ? "border-dashed border-gray-300 bg-gray-50 opacity-60" : `border-${r.color}-200 bg-${r.color}-50`)}>
              <div className="flex items-start gap-3">
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5", r.future ? "bg-gray-200 text-gray-500" : `bg-${r.color}-200 text-${r.color}-800`)}>
                  {r.id.toUpperCase()}{r.future ? " — futur" : ""}
                </span>
                <div className="flex-1">
                  <div className="text-[11px] font-bold text-gray-700 mb-0.5">Déclencheur : <span className="font-normal">{r.trigger}</span></div>
                  <p className="text-[10px] text-gray-500 italic mb-2">"{r.msg}"</p>
                  <div className="flex flex-wrap gap-1">
                    {r.actions.map(a => (
                      <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* F — ACTIONS À AJOUTER (extensible)                */}
      {/* ═══════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Plus className="h-3.5 w-3.5 text-emerald-500" /> F — Ajouter une nouvelle action
          <span className="text-[10px] text-gray-400 font-normal normal-case">— quand une nouvelle action émerge en utilisation réelle</span>
        </h3>
        <div className="bg-emerald-50 border border-dashed border-emerald-300 rounded-xl p-4">
          <p className="text-xs text-emerald-800 mb-3">Pour ajouter une action, documenter ici :</p>
          <div className="grid grid-cols-4 gap-2 text-[10px] mb-3">
            {["Emoji + Nom", "Rôle (1 phrase)", "Sur quelle(s) bulle(s)", "Règle anti-boucle si applicable"].map(h => (
              <div key={h} className="bg-white border border-emerald-200 rounded-lg px-2 py-1.5 font-semibold text-emerald-700">{h}</div>
            ))}
          </div>
          <div className="space-y-2">
            {[
              ["⚡ Plan d'action", "Générer un plan actionnable immédiat", "Focus Card · Verdict Card", "—"],
              ["🛡️ Évaluer les risques", "Matrice de risques sur la situation", "Focus Card · Normal Bot", "1 seul par fil"],
              ["👤 Déléguer", "Assigner à un membre de l'équipe", "Synthesis · Verdict Card", "—"],
              ["🔮 Scénario Et si?", "Explorer des hypothèses alternatives", "Normal Bot (mode Brainstorm)", "Max 2/fil"],
            ].map(([n, r, b, anti]) => (
              <div key={String(n)} className="grid grid-cols-4 gap-2 text-[10px]">
                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 font-medium text-gray-800">{n}</div>
                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-500">{r}</div>
                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-500">{b}</div>
                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-400">{anti}</div>
              </div>
            ))}
            {/* Ligne vide pour ajout futur */}
            <div className="grid grid-cols-4 gap-2 text-[10px]">
              {["+ Nouvelle action", "...", "...", "..."].map((v, i) => (
                <div key={i} className="bg-emerald-50 border border-dashed border-emerald-300 rounded-lg px-2 py-1 text-emerald-400 italic">{v}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* G — CARLOS CHEF D'ORCHESTRE                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Crown className="h-3.5 w-3.5 text-purple-500" /> G — CarlOS Chef d'Orchestre
          <span className="text-[10px] text-gray-400 font-normal normal-case">— Comportements intelligents : questions d'abord + équipe 3 bots</span>
        </h3>

        {/* G.1 — Questions diagnostiques */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-3 w-3 text-blue-500" />
            <span className="text-[11px] font-bold text-gray-700">G.1 — Questions diagnostiques avant de répondre</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-medium">Validé Gemini ✓</span>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">
            Règle : si message &lt; 20 mots <strong>sans contexte actionnable</strong> → CarlOS pose 2-3 questions ciblées AVANT de répondre. Objectif : aller chercher le gras autour de l'os.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {/* Mock Crise */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
              <div className="text-[10px] font-bold text-orange-600 mb-2 flex items-center gap-1">
                <Flame className="h-2.5 w-2.5" /> Crise — User dit "allo"
              </div>
              {/* User bubble */}
              <div className="flex justify-end mb-2">
                <div className="bg-blue-600 text-white text-[10px] rounded-xl px-2.5 py-1.5 max-w-[70%]">allo</div>
              </div>
              {/* CarlOS response */}
              <div className="flex gap-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] shrink-0 mt-0.5">🎩</div>
                <div className="bg-white border border-blue-100 rounded-xl px-2.5 py-2 text-[10px] text-gray-700 shadow-sm">
                  <p className="font-semibold text-blue-700 mb-1.5">Avant d'aller plus loin :</p>
                  <p className="mb-1">1. Quelle est la situation d'urgence?</p>
                  <p className="mb-1">2. Impact estimé en $$ ou en clients?</p>
                  <p>3. Actions déjà prises?</p>
                </div>
              </div>
            </div>

            {/* Mock Analyse */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
              <div className="text-[10px] font-bold text-blue-600 mb-2 flex items-center gap-1">
                <Eye className="h-2.5 w-2.5" /> Analyse — User dit "pipeline?"
              </div>
              <div className="flex justify-end mb-2">
                <div className="bg-blue-600 text-white text-[10px] rounded-xl px-2.5 py-1.5 max-w-[70%]">pipeline?</div>
              </div>
              <div className="flex gap-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] shrink-0 mt-0.5">🎩</div>
                <div className="bg-white border border-blue-100 rounded-xl px-2.5 py-2 text-[10px] text-gray-700 shadow-sm">
                  <p className="font-semibold text-blue-700 mb-1.5">Ciblons :</p>
                  <p className="mb-1">1. Quel aspect t'inquiète — volume, conversion, vitesse?</p>
                  <p className="mb-1">2. Sur quel horizon — Q1, Q2 ou annuel?</p>
                  <p>3. Un prospect spécifique ou tout le pipe?</p>
                </div>
              </div>
            </div>

            {/* Mock Débat */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
              <div className="text-[10px] font-bold text-violet-600 mb-2 flex items-center gap-1">
                <Scale className="h-2.5 w-2.5" /> Débat — User dit "débat"
              </div>
              <div className="flex justify-end mb-2">
                <div className="bg-blue-600 text-white text-[10px] rounded-xl px-2.5 py-1.5 max-w-[70%]">débat</div>
              </div>
              <div className="flex gap-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] shrink-0 mt-0.5">🎩</div>
                <div className="bg-white border border-blue-100 rounded-xl px-2.5 py-2 text-[10px] text-gray-700 shadow-sm">
                  <p className="font-semibold text-blue-700 mb-1.5">Sur quoi on se bat?</p>
                  <p className="mb-1">1. Le sujet à débattre?</p>
                  <p className="mb-1">2. Ta position de départ?</p>
                  <p>3. Tu veux qu'on soit 2 ou 3 dans ce débat?</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* G.2 — Équipe 3 bots */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-3 w-3 text-purple-500" />
            <span className="text-[11px] font-bold text-gray-700">G.2 — Composition automatique — Équipe 3 bots</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200 font-medium">Validé Gemini ✓</span>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">
            Après les questions diagnostiques, CarlOS compose automatiquement l'équipe optimale : <strong>1 bot primaire + 2 bots angles morts</strong>. Max 3 bots actifs. L'utilisateur peut ajuster.
          </p>

          {/* Règle de sélection */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { role: "BOT PRIMAIRE", color: "purple", desc: "Expert #1 du sujet. Répond à la tension principale.", icon: "👑" },
              { role: "ANGLE MORT #1", color: "blue", desc: "Couvre le risque financier, légal ou RH souvent oublié.", icon: "🔭" },
              { role: "ANGLE MORT #2", color: "orange", desc: "Couvre l'impact opérationnel ou client.", icon: "🔭" },
            ].map(({ role, color, desc, icon }) => (
              <div key={role} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-3`}>
                <div className={`text-[10px] font-bold text-${color}-700 mb-1`}>{icon} {role}</div>
                <p className={`text-[10px] text-${color}-800`}>{desc}</p>
              </div>
            ))}
          </div>

          {/* ── Moteur de raisonnement ── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-3">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-bold text-white">Moteur de raisonnement — Comment CarlOS choisit son équipe</span>
              <span className="ml-auto text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">Avenue 2 + pincée Avenue 3</span>
            </div>

            <div className="p-4 space-y-3">
              {/* Étape 1 — Scoring */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700 shrink-0">1</div>
                  <span className="text-[11px] font-bold text-gray-700">Avenue 2 — Score par bot</span>
                  <span className="text-[10px] text-gray-400">≤50ms · déterministe · sans LLM</span>
                </div>
                {/* Formule */}
                <div className="bg-gray-900 text-green-300 rounded-lg px-3 py-2 text-[10px] font-mono mb-2">
                  <span className="text-gray-400"># Formule pour chacun des 12 bots :</span><br/>
                  Score = (mots_clés_détectés × <span className="text-yellow-300">3</span>) + affinité_mode + fit_domaine<br/>
                  <span className="text-gray-400"># → Top 3 = Bot primaire + 2 angles morts</span>
                </div>
                {/* Exemple scoring */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-[10px] text-gray-400 mb-2 italic">Ex: message = "notre pipeline est brisé technologiquement"</div>
                  <div className="space-y-1">
                    {[
                      { code: "BCT", name: "Thierry CTO", kw: 3, mode: 2, dom: 3, total: 8, tag: "PRIMAIRE", color: "violet", stars: "★★★" },
                      { code: "BCF", name: "François CFO", kw: 1, mode: 1, dom: 2, total: 4, tag: "ANGLE MORT", color: "emerald", stars: "★★" },
                      { code: "BOO", name: "Olivier COO", kw: 1, mode: 1, dom: 2, total: 4, tag: "ANGLE MORT", color: "orange", stars: "★★" },
                      { code: "BCO", name: "CarlOS CEO", kw: 0, mode: 2, dom: 1, total: 3, tag: "écarté", color: "gray", stars: "★" },
                    ].map(({ code, name, kw, mode, dom, total, tag, color, stars }) => (
                      <div key={code} className={`flex items-center gap-2 text-[10px] ${color === "gray" ? "opacity-40" : ""}`}>
                        <span className="w-16 font-mono text-gray-500">{code}</span>
                        <span className="w-28 font-medium text-gray-700">{name}</span>
                        <div className="flex gap-1 items-center flex-1">
                          <span className="text-gray-400">kw=</span><span className="font-bold text-purple-700">{kw}×3</span>
                          <span className="text-gray-300 mx-1">+</span>
                          <span className="text-gray-400">mode=</span><span className="font-bold text-blue-600">{mode}</span>
                          <span className="text-gray-300 mx-1">+</span>
                          <span className="text-gray-400">dom=</span><span className="font-bold text-indigo-600">{dom}</span>
                          <span className="text-gray-300 mx-1">=</span>
                          <span className="font-bold text-gray-800 w-4">{total}</span>
                          <span className="text-amber-500 ml-1">{stars}</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                          tag === "PRIMAIRE" ? "bg-violet-100 text-violet-700" :
                          tag === "ANGLE MORT" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-400"
                        }`}>{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <ArrowDown className="h-3 w-3 text-gray-400 shrink-0" />
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Étape 2 — LLM mini */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 shrink-0">2</div>
                  <span className="text-[11px] font-bold text-gray-700">Pincée Avenue 3 — Explication LLM</span>
                  <span className="text-[10px] text-gray-400">~300ms · Gemini Flash T1 · ~$0.001/req</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {/* Prompt envoyé */}
                  <div>
                    <div className="text-[10px] text-gray-400 mb-1 font-medium">Prompt micro envoyé à Gemini Flash :</div>
                    <div className="bg-gray-900 text-green-300 rounded-lg px-3 py-2 text-[10px] font-mono leading-relaxed">
                      <span className="text-gray-400">Explique en 1 phrase claire</span><br/>
                      <span className="text-gray-400">pourquoi [BCT, BCF, BOO]</span><br/>
                      <span className="text-gray-400">sont les bons bots pour:</span><br/>
                      <span className="text-yellow-300">"pipeline techniquement brisé"</span><br/>
                      <span className="text-gray-400">Réponse JSON:</span><br/>
                      <span className="text-blue-300">{"{"}"raison": "..."{"}"}</span>
                    </div>
                  </div>
                  {/* Réponse générée */}
                  <div>
                    <div className="text-[10px] text-gray-400 mb-1 font-medium">Ce que CarlOS affiche à l'utilisateur :</div>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-[10px] text-blue-800 leading-relaxed">
                      <span className="font-semibold">J'ai choisi Thierry</span> car le problème est technique et il doit diagnostiquer la racine. <span className="font-semibold">François</span> couvre l'impact sur le cash-flow si ça dure. <span className="font-semibold">Olivier</span> s'assure que la production ne s'arrête pas pendant qu'on répare.
                    </div>
                  </div>
                </div>
              </div>

              {/* Tableau mapping tensions → équipes */}
              <div className="pt-2 border-t border-gray-100">
                <div className="text-[10px] font-bold text-gray-600 mb-2 uppercase tracking-wide">Mapping tensions → équipes types</div>
                <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 text-[9px] font-bold text-gray-400 bg-gray-50 border-b px-2 py-1.5">
                    <div>Tension détectée</div>
                    <div>Bot Primaire</div>
                    <div>Angle Mort #1</div>
                    <div>Angle Mort #2</div>
                  </div>
                  {[
                    ["Pipeline / ventes / closing", "Sophie CSO 🎯", "François CFO 💰", "Martine CMO 📢"],
                    ["Budget / tréso / coûts / DSO", "François CFO 💰", "CarlOS CEO 🎩", "Olivier COO ⚙️"],
                    ["Serveur / tech / système brisé", "Thierry CTO 💻", "François CFO 💰", "Olivier COO ⚙️"],
                    ["Équipe / culture / RH / conflit", "Hélène CHRO 👥", "CarlOS CEO 🎩", "Olivier COO ⚙️"],
                    ["Marketing / marque / campagne", "Martine CMO 📢", "Sophie CSO 🎯", "François CFO 💰"],
                    ["Stratégie / expansion / M&A", "CarlOS CEO 🎩", "Sophie CSO 🎯", "François CFO 💰"],
                    ["Légal / conformité / risque", "Louise CLO ⚖️", "François CFO 💰", "CarlOS CEO 🎩"],
                    ["Opérations / production / livraison", "Olivier COO ⚙️", "Thierry CTO 💻", "François CFO 💰"],
                  ].map(([tension, p, a1, a2], i) => (
                    <div key={String(tension)} className={`grid grid-cols-4 text-[9px] px-2 py-1.5 border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                      <div className="text-gray-600 font-medium">{tension}</div>
                      <div className="text-violet-700 font-semibold">{p}</div>
                      <div className="text-blue-600">{a1}</div>
                      <div className="text-indigo-600">{a2}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[10px] text-gray-400">
                  Ces équipes sont les <strong>valeurs par défaut</strong> du scoring. Le LLM peut affiner selon le contexte précis.
                </div>
              </div>
            </div>
          </div>

          {/* Mock — Pipeline techniquement brisé */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-wide">Exemple — "Notre pipeline est brisé technologiquement"</div>
            <div className="flex gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs shrink-0">🎩</div>
              <div className="bg-white border border-blue-100 rounded-xl px-3 py-2 text-[10px] text-gray-700 shadow-sm flex-1">
                <p className="font-semibold text-blue-700 mb-1.5">J'ai analysé ton problème. Voici l'équipe optimale :</p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[
                    { emoji: "💻", name: "Thierry", role: "CTO", tag: "PRIMAIRE", color: "violet", desc: "Diagnostic technique" },
                    { emoji: "💰", name: "François", role: "CFO", tag: "ANGLE MORT", color: "emerald", desc: "Impact financier" },
                    { emoji: "⚙️", name: "Olivier", role: "COO", tag: "ANGLE MORT", color: "orange", desc: "Impact opérations" },
                  ].map(({ emoji, name, role, tag, color, desc }) => (
                    <div key={name} className={`bg-${color}-50 border border-${color}-200 rounded-lg p-2 text-center`}>
                      <div className="text-lg mb-0.5">{emoji}</div>
                      <div className={`text-[10px] font-bold text-${color}-700`}>{name}</div>
                      <div className={`text-[9px] text-${color}-500`}>{role}</div>
                      <div className={`mt-1 text-[8px] px-1.5 py-0.5 rounded-full bg-${color}-100 text-${color}-700 font-bold`}>{tag}</div>
                      <div className={`mt-0.5 text-[9px] text-${color}-600`}>{desc}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 text-[10px] py-1.5 rounded-lg bg-purple-600 text-white font-bold cursor-pointer">✓ Démarrer avec cette équipe</button>
                  <button className="text-[10px] px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 cursor-pointer">Modifier</button>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-gray-400">→ L'utilisateur peut accepter l'équipe proposée ou l'ajuster avant de démarrer</div>
          </div>
        </div>

        {/* G.3 — Ajout/retrait en temps réel */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-3 w-3 text-gray-500" />
            <span className="text-[11px] font-bold text-gray-700">G.3 — Ajout / retrait de bots en cours de conversation</span>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">
            Si la conversation révèle un angle mort imprévu → l'utilisateur peut ajouter un bot. Limite : toujours max 3 bots actifs simultanément. CarlOS orchestrerait qui parle.
          </p>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wide">Interface — Gestion de l'équipe en live</div>
            {/* Bots actifs */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-[10px] text-gray-500 font-medium">Équipe active :</span>
              {[
                { emoji: "💻", name: "Thierry CTO", color: "violet" },
                { emoji: "💰", name: "François CFO", color: "emerald" },
              ].map(({ emoji, name, color }) => (
                <div key={name} className={`flex items-center gap-1.5 bg-${color}-50 border border-${color}-200 rounded-full px-2.5 py-1 text-[10px]`}>
                  <span>{emoji}</span>
                  <span className={`font-medium text-${color}-700`}>{name}</span>
                  <button className={`text-${color}-400 hover:text-red-500 cursor-pointer ml-0.5`}>×</button>
                </div>
              ))}
              {/* Slot libre */}
              <div className="flex items-center gap-1 border border-dashed border-gray-300 rounded-full px-2.5 py-1 text-[10px] text-gray-400">
                <Plus className="h-2.5 w-2.5" /> Inviter un 3e bot
              </div>
            </div>
            {/* Bots disponibles */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-gray-400 w-full">Disponibles :</span>
              {[
                ["🎩","CarlOS CEO","blue"],["⚙️","Olivier COO","orange"],
                ["📢","Martine CMO","pink"],["🎯","Sophie CSO","red"],
              ].map(([e,n,c]) => (
                <button key={String(n)} className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-${c}-50 hover:border-${c}-200 cursor-pointer transition-colors`}>
                  <Plus className="h-2 w-2" /> {e} {n}
                </button>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex gap-4 text-[10px]">
              <span className="text-green-600">✅ Max 3 bots — au-delà c'est du bruit</span>
              <span className="text-blue-600">✅ CarlOS orchestre qui parle — pas un chat room</span>
              <span className="text-amber-600">⚠️ Brief auto quand un bot rejoint la convo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-4" />

    </>
  );
}

export function FE1TabVisualisations() {
  return (
    <div className="space-y-8">

      {/* ── 6.1 Split Screen Pour/Contre ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">6.1 — Split Screen Pour/Contre</h3>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">Split screen pour/contre (DebatDemo)</h3>
            <p className="text-[10px] text-gray-400 mb-3">grid grid-cols-2 divide-x — bande h-1 verte/rouge en haut, badges CheckCircle2/Swords</p>
            <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 border-b">
                <span className="text-sm font-bold text-white">Critere: Impact financier</span>
              </div>
              <div className="grid grid-cols-2 divide-x">
                <div>
                  <div className="h-1 bg-green-500" />
                  <div className="p-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full mb-2">
                      <CheckCircle2 className="h-3 w-3" /> Pour
                    </span>
                    <div className="flex items-start gap-2 mt-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">CF</div>
                      <p className="text-xs text-gray-600 leading-relaxed">ROI de 340% en 18 mois. Le modele d'abonnement genere des revenus recurrents previsibles.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="h-1 bg-red-500" />
                  <div className="p-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded-full mb-2">
                      <AlertTriangle className="h-3 w-3" /> Contre
                    </span>
                    <div className="flex items-start gap-2 mt-2">
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">CS</div>
                      <p className="text-xs text-gray-600 leading-relaxed">Investissement initial de 850K$ sans garantie de traction. Risque de cannibalisation du service existant.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

        <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 6.2 Comparaison 3 Colonnes ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">6.2 — Comparaison 3 Colonnes</h3>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">Comparaison 3 colonnes (InnovationDemo)</h3>
            <p className="text-[10px] text-gray-400 mb-3">grid grid-cols-3 gap-3 — header gradient pastel, scores par axe avec h-2.5 bars</p>
            <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-fuchsia-100 to-pink-100 px-4 py-2.5 flex items-center gap-2 border-b border-fuchsia-200">
                <Star className="h-4 w-4 text-fuchsia-700" />
                <div className="text-sm font-bold text-fuchsia-900">Spectre de faisabilite</div>
              </div>
              <div className="grid grid-cols-3 gap-3 p-4">
                {[
                  { nom: "Zero-Panne", color: "fuchsia", scores: [92, 65, 75] },
                  { nom: "Equip-as-Service", color: "orange", scores: [98, 40, 95] },
                  { nom: "Certification", color: "green", scores: [70, 90, 60] },
                ].map((idee) => (
                  <div key={idee.nom} className={cn("border rounded-lg overflow-hidden", `border-${idee.color}-300`)}>
                    <div className={cn("px-3 py-2 border-b bg-gradient-to-r", `from-${idee.color}-50 to-${idee.color}-50/50 border-${idee.color}-200`)}>
                      <div className={cn("text-xs font-bold", `text-${idee.color}-800`)}>{idee.nom}</div>
                    </div>
                    <div className="p-3 space-y-2">
                      {["Impact", "Faisabilite", "Originalite"].map((axe, j) => (
                        <div key={axe}>
                          <div className="text-[10px] text-gray-500 font-medium mb-0.5">{axe}</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", `bg-${idee.color}-500`)} style={{ width: `${idee.scores[j]}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600">{idee.scores[j]}</span>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">Score global</span>
                        <span className={cn("text-sm font-bold", `text-${idee.color}-800`)}>{Math.round(idee.scores.reduce((a, b) => a + b, 0) / 3)}/100</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>

        <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 6.3 SWOT 2x2 ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">6.3 — SWOT 2x2</h3>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">SWOT 2x2 (StrategieDemo)</h3>
            <p className="text-[10px] text-gray-400 mb-3">grid grid-cols-2 — 4 quadrants colores, headers avec icones</p>
            <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2.5 border-b border-purple-200">
                <span className="text-sm font-bold text-purple-900">Analyse SWOT</span>
              </div>
              <div className="grid grid-cols-2">
                {[
                  { titre: "FORCES", bg: "bg-green-50", headerBg: "bg-green-100", text: "text-green-800", border: "border-green-200", items: ["Expertise technique reconnue", "Pipeline R&D solide"] },
                  { titre: "FAIBLESSES", bg: "bg-red-50", headerBg: "bg-red-100", text: "text-red-800", border: "border-red-200", items: ["Dependance client unique", "Processus manuels"] },
                  { titre: "OPPORTUNITES", bg: "bg-blue-50", headerBg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", items: ["Marche en croissance 15%", "Partenariat strategique"] },
                  { titre: "MENACES", bg: "bg-amber-50", headerBg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200", items: ["Nouveaux entrants", "Reglementation"] },
                ].map((q, i) => (
                  <div key={q.titre} className={cn(q.bg, i === 0 && "border-r border-b", i === 1 && "border-b", i === 2 && "border-r", q.border)}>
                    <div className={cn("px-3 py-2", q.headerBg)}>
                      <span className={cn("text-xs font-bold uppercase", q.text)}>{q.titre}</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {q.items.map((item, j) => (
                        <div key={j} className="text-xs text-gray-700">{item}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>

        <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 6.4 Timeline Horizontale ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">6.4 — Timeline Horizontale</h3>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">Timeline horizontale (StrategieDemo)</h3>
            <p className="text-[10px] text-gray-400 mb-3">3 noeuds w-10 h-10 rounded-full + ligne h-0.5 + cards descriptives</p>
            <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm p-4">
              <div className="relative">
                <div className="absolute top-5 left-8 right-8 h-0.5 bg-purple-200 z-0" />
                <div className="grid grid-cols-3 gap-4 relative z-10">
                  {[
                    { phase: "Phase 1", periode: "0-3 mois", titre: "Fondation", icon: Shield },
                    { phase: "Phase 2", periode: "3-9 mois", titre: "Expansion", icon: Rocket },
                    { phase: "Phase 3", periode: "9-18 mois", titre: "Domination", icon: Crown },
                  ].map((p) => {
                    const PhaseIcon = p.icon;
                    return (
                      <div key={p.phase}>
                        <div className="flex justify-center mb-3">
                          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shadow-md ring-4 ring-white">
                            <PhaseIcon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                          <div className="text-xs font-bold text-purple-800">{p.phase}</div>
                          <div className="text-[10px] text-purple-600 font-medium">{p.periode}</div>
                          <div className="text-xs font-semibold text-gray-800 mt-0.5">{p.titre}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
      </div>

        <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 6.5 Sticky Board ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">6.5 — Sticky Board</h3>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">Sticky board (BrainstormDemo)</h3>
            <p className="text-[10px] text-gray-400 mb-3">grid grid-cols-4 — cards avec rotation CSS fractionnelle, badges SCAMPER, votes</p>
            <div className="bg-gray-100 rounded-xl p-4">
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { text: "Service d'abonnement predictif", color: "bg-yellow-100 border-yellow-300", rot: "-rotate-[1deg]", badge: "COMBINER", badgeBg: "bg-blue-100 text-blue-700", bot: "CTO", botColor: "text-violet-700", votes: 4 },
                  { text: "Marketplace de pieces reconditionnees", color: "bg-pink-100 border-pink-300", rot: "rotate-[0.5deg]", badge: "ADAPTER", badgeBg: "bg-green-100 text-green-700", bot: "CMO", botColor: "text-pink-700", votes: 3 },
                  { text: "Formation certifiante en ligne", color: "bg-green-100 border-green-300", rot: "-rotate-[0.5deg]", badge: "SUBSTITUER", badgeBg: "bg-violet-100 text-violet-700", bot: "COO", botColor: "text-orange-700", votes: 5 },
                  { text: "Jumeau numerique pour diagnostic", color: "bg-blue-100 border-blue-300", rot: "rotate-[1.5deg]", badge: "ELIMINER", badgeBg: "bg-red-100 text-red-700", bot: "CFO", botColor: "text-emerald-700", votes: 2 },
                ].map((note) => (
                  <div key={note.text} className={cn("rounded-lg border-2 p-3 shadow-md min-h-[90px] relative", note.color, note.rot)}>
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", note.badgeBg)}>{note.badge}</span>
                    <p className="text-xs text-gray-800 leading-relaxed mt-1.5 pr-4">{note.text}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={cn("text-[10px] font-semibold", note.botColor)}>{note.bot}</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                        <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />{note.votes}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>

        <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 6.6 5 Pourquoi ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">6.6 — 5 Pourquoi</h3>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">Chaine 5 Pourquoi (AnalyseDemo)</h3>
            <p className="text-[10px] text-gray-400 mb-3">Cards depth-colorees cyan→teal + ArrowDown connecteurs + badge CAUSE RACINE</p>
            <div className="space-y-0">
              {[
                { level: 1, q: "Pourquoi le taux de rebut augmente?", a: "Les soudures presentent des defauts visuels recurrents", bg: "bg-cyan-50", border: "border-cyan-200", badge: "bg-cyan-100 text-cyan-800" },
                { level: 2, q: "Pourquoi les defauts visuels?", a: "Les parametres de soudage ne sont pas ajustes aux lots de matiere", bg: "bg-cyan-100", border: "border-cyan-300", badge: "bg-cyan-200 text-cyan-900" },
                { level: 3, q: "Pourquoi pas d'ajustement?", a: "Absence de controle qualite entrant sur les lots", bg: "bg-teal-100", border: "border-teal-300", badge: "bg-teal-200 text-teal-900", isLast: true },
              ].map((step, i) => (
                <div key={step.level}>
                  {i > 0 && (
                    <div className="flex justify-center py-1.5">
                      <ArrowDown className={cn("h-5 w-5", i === 1 ? "text-cyan-300" : "text-teal-400")} />
                    </div>
                  )}
                  <div className={cn("border rounded-lg overflow-hidden", step.border, step.bg)}>
                    <div className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <span className={cn("shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold", step.badge)}>P{step.level}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{step.q}</p>
                          <p className="text-sm text-gray-700 leading-relaxed mt-1">{step.a}</p>
                          {step.isLast && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-100 text-red-800 px-2.5 py-1 rounded-full border border-red-300 mt-2">
                              <AlertTriangle className="h-3 w-3" /> CAUSE RACINE IDENTIFIEE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

        <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 6.7 GO / NO-GO Split ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">6.7 — GO / NO-GO Split</h3>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">GO/NO-GO split (DecisionDemo)</h3>
            <p className="text-[10px] text-gray-400 mb-3">grid-cols-2 divide-x — etoiles poids + ThumbsUp/Down + score bars</p>
            <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b">
                <span className="text-sm font-bold text-gray-800">Faisabilite technique</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500">Poids</span>
                  <span className="text-xs text-amber-500 tracking-tight">{"★★★★☆"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x">
                <div className="p-3 bg-green-50/30">
                  <div className="flex items-center gap-1.5 mb-2">
                    <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-[10px] font-bold text-green-700 uppercase">Go</span>
                    <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-white text-[8px] font-bold">CT</div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">Architecture scalable, APIs pretes en 48h.</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "80%" }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-600 w-6 text-right">8</span>
                  </div>
                </div>
                <div className="p-3 bg-red-50/30">
                  <div className="flex items-center gap-1.5 mb-2">
                    <ThumbsDown className="h-3.5 w-3.5 text-red-600" />
                    <span className="text-[10px] font-bold text-red-700 uppercase">No-Go</span>
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px] font-bold">CS</div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">Risque d'integration avec systemes legacy.</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: "40%" }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-600 w-6 text-right">4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

        <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 6.8 Verdict Card ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">6.8 — Verdict Card</h3>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">VerdictCard (DebatDemo)</h3>
            <p className="text-[10px] text-gray-400 mb-3">Amber-themed premium card — gradient from-amber-50, border-2 border-amber-300, plan numerote</p>
            <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-3 flex items-center gap-2 border-b border-amber-300">
                <Scale className="h-5 w-5 text-amber-700" />
                <div className="text-sm font-bold text-amber-900">Verdict du CEO</div>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <p className="text-sm text-amber-900 leading-relaxed">Verdict: GO CONDITIONNEL — le projet merite d'avancer avec des conditions strictes sur le budget et les metriques.</p>
                </div>
                <div className="text-xs font-semibold text-gray-600 uppercase">Plan d'action</div>
                <div className="space-y-2.5">
                  {[
                    "Valider le POC technique en 30 jours (budget: 50K$)",
                    "Obtenir 3 lettres d'intention de clients pilotes",
                    "Definir les metriques de succes avant Phase 2",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-amber-800">{i + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
      </div>

        <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 6.9 Timer Mode Sombre ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">6.9 — Timer Mode Sombre</h3>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">Timer sombre (CriseDemo)</h3>
            <p className="text-[10px] text-gray-400 mb-3">bg-gradient-to-r from-gray-900 to-red-900 + font-mono + dot pulsant</p>
            <div className="bg-gradient-to-r from-gray-900 to-red-900 rounded-xl px-5 py-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-red-300 uppercase tracking-wider font-bold">Temps restant</span>
                </div>
                <Clock className="h-4 w-4 text-red-400" />
              </div>
              <div className="text-3xl font-mono font-bold text-white mt-1 tracking-widest">04:32</div>
            </div>
          </div>
      </div>

        <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 6.10 Indicateurs de Progression (7 types) ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">6.10 — Indicateurs de Progression (7 types)</h3>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">7 indicateurs de progression (par simulation)</h3>
            <p className="text-[10px] text-gray-400 mb-3">Chaque simulation a son propre indicateur visuel</p>
            <div className="space-y-4">
              {/* CREDO (5 cercles) */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 w-24 shrink-0">CREDO</span>
                <div className="flex items-center gap-1">
                  {["C","R","E","D","O"].map((l, i) => (
                    <div key={l} className="flex items-center gap-1">
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold", i < 3 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400")}>{l}</div>
                      {i < 4 && <div className={cn("w-4 h-0.5", i < 2 ? "bg-blue-400" : "bg-gray-200")} />}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">Innovation, Debat, Analyse, Strategie</span>
              </div>
              {/* OODA (4 cercles) */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 w-24 shrink-0">OODA</span>
                <div className="flex items-center gap-1">
                  {["O","O","D","A"].map((l, i) => (
                    <div key={`ooda-${i}`} className="flex items-center gap-1">
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold", i < 2 ? "bg-red-600 text-white" : i === 2 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500")}>{i < 2 && i === 0 ? <CheckCircle2 className="h-3.5 w-3.5" /> : l}</div>
                      {i < 3 && <div className={cn("w-4 h-0.5", i < 2 ? "bg-orange-400" : "bg-gray-200")} />}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">Crise</span>
              </div>
              {/* Spirale (3 anneaux) */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 w-24 shrink-0">Spirale</span>
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-400" style={{ boxShadow: "0 0 12px rgba(99,102,241,0.4)" }} />
                  <div className="absolute inset-[6px] rounded-full border-2 border-indigo-500" style={{ boxShadow: "0 0 8px rgba(99,102,241,0.3)" }} />
                  <div className="absolute inset-[12px] rounded-full border-2 border-indigo-600" style={{ boxShadow: "0 0 6px rgba(99,102,241,0.5)" }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                </div>
                <span className="text-[10px] text-gray-400">Deep Resonance</span>
              </div>
              {/* Stepper (3 cercles + labels) */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 w-24 shrink-0">Stepper</span>
                <div className="flex items-center gap-1">
                  {["Collecte", "Analyse", "Synthese"].map((l, i) => (
                    <div key={l} className="flex items-center gap-1">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold", i < 2 ? "bg-cyan-500 text-white" : "bg-gray-200 text-gray-500")}>{i + 1}</div>
                        <span className="text-[9px] text-gray-400 mt-0.5">{l}</span>
                      </div>
                      {i < 2 && <div className={cn("w-6 h-0.5 mb-3", i === 0 ? "bg-cyan-400" : "bg-gray-200")} />}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">Diagnostic</span>
              </div>
              {/* Pips horizontaux */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 w-24 shrink-0">Pips</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={cn("h-1.5 w-8 rounded-full", i < 3 ? "bg-teal-500" : "bg-gray-200")} />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">Jumelage</span>
              </div>
              {/* Segments colores */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 w-24 shrink-0">Segments</span>
                <div className="flex gap-0.5 flex-1 max-w-[200px]">
                  {[
                    "bg-green-500", "bg-green-500", "bg-blue-500",
                    "bg-blue-500", "bg-gray-200", "bg-gray-200",
                  ].map((c, i) => (
                    <div key={i} className={cn("flex-1 h-1.5 rounded-full", c)} />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">Decision</span>
              </div>
              {/* Barre pleine largeur */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 w-24 shrink-0">Barre</span>
                <div className="flex-1 max-w-[200px] h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: "65%" }} />
                </div>
                <span className="text-[10px] text-gray-400">Cahier Projet</span>
              </div>
            </div>
          </div>
      </div>

        <div className="border-t border-gray-100 pt-6 mt-6" />

      {/* ── 6.11 Ishikawa Fishbone ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">6.11 — Ishikawa Fishbone</h3>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">Diagramme Ishikawa (AnalyseDemo)</h3>
            <p className="text-[10px] text-gray-400 mb-3">Spine rouge + grid-cols-3 top/bottom + branches 6M colorees</p>
            <div className="bg-gradient-to-b from-gray-50 to-white border border-cyan-200 rounded-xl overflow-hidden shadow-sm p-4">
              {/* Top branches */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  { label: "Methode", color: "cyan", causes: ["Absence de procedure standardisee", "Pas de controle qualite entrant"] },
                  { label: "Machine", color: "orange", causes: ["Calibration irreguliere", "Usure des electrodes"] },
                  { label: "Main-d'oeuvre", color: "violet", causes: ["Formation insuffisante", "Rotation du personnel"] },
                ].map((b) => (
                  <div key={b.label} className={cn("border rounded-lg overflow-hidden", `border-${b.color}-200 bg-${b.color}-50`)}>
                    <div className={cn("px-3 py-1.5 flex items-center gap-1.5 border-b", `bg-${b.color}-100 border-${b.color}-200`)}>
                      <span className={cn("text-xs font-bold", `text-${b.color}-800`)}>{b.label}</span>
                    </div>
                    <div className="px-3 py-2 space-y-1.5">
                      {b.causes.map((c, j) => (
                        <div key={j} className="flex items-start gap-1.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", `bg-${b.color}-400`)} />
                          <p className="text-xs text-gray-800 leading-tight">{c}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Spine connectors top */}
              <div className="flex justify-around px-8 -mb-1">
                {[0, 1, 2].map((i) => <div key={i} className="w-px h-4 bg-cyan-300" />)}
              </div>
              {/* Red spine */}
              <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-lg px-4 py-3 flex items-center justify-center gap-3 shadow-md">
                <AlertTriangle className="h-5 w-5 text-white shrink-0" />
                <span className="text-sm font-bold text-white text-center">Taux de rebut soudure en hausse de 15%</span>
                <AlertTriangle className="h-5 w-5 text-white shrink-0" />
              </div>
              {/* Spine connectors bottom */}
              <div className="flex justify-around px-8 -mt-1">
                {[0, 1, 2].map((i) => <div key={i} className="w-px h-4 bg-cyan-300" />)}
              </div>
              {/* Bottom branches */}
              <div className="grid grid-cols-3 gap-3 mt-3">
                {[
                  { label: "Materiau", color: "green", causes: ["Variation entre lots fournisseur", "Stockage non conforme"] },
                  { label: "Milieu", color: "amber", causes: ["Temperature atelier variable", "Vibrations proximite"] },
                  { label: "Mesure", color: "rose", causes: ["Tolerance visuelles subjectives", "Absence de metrologie"] },
                ].map((b) => (
                  <div key={b.label} className={cn("border rounded-lg overflow-hidden", `border-${b.color}-200 bg-${b.color}-50`)}>
                    <div className={cn("px-3 py-1.5 flex items-center gap-1.5 border-b", `bg-${b.color}-100 border-${b.color}-200`)}>
                      <span className={cn("text-xs font-bold", `text-${b.color}-800`)}>{b.label}</span>
                    </div>
                    <div className="px-3 py-2 space-y-1.5">
                      {b.causes.map((c, j) => (
                        <div key={j} className="flex items-start gap-1.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", `bg-${b.color}-400`)} />
                          <p className="text-xs text-gray-800 leading-tight">{c}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>

    </div>
  );
}

export function FE1TabArchive() {
  return (
    <div className="space-y-8">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-bold text-amber-800 mb-1">Archive — Éléments dépréciés</h3>
        <p className="text-xs text-amber-600">
          Patterns retirés des onglets actifs. Conservés comme référence historique.
          Ne pas utiliser pour de nouvelles pages.
        </p>
      </div>

      {/* ── A.1 Specimens Bulles (doublon de Tab 5) ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">A.1 — Specimens Bulles (anciens)</h3>
        <p className="text-xs text-gray-400 mb-3">Ces specimens de l'onglet Ligne Directrice original sont maintenant dans Bulles & Actions.</p>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">Bulles de conversation (gold standard)</h3>
            <p className="text-[10px] text-gray-400 mb-3">BotBubble (bg-white border-l-[3px] rounded-xl rounded-tl-none) | UserBubble (bg-blue-50 rounded-tr-none)</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {/* Bot Bubble */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden ring-2 ring-blue-200">
                  CO
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-blue-700">CarlOS (CEO)</span>
                  </div>
                  <div className="bg-white border-l-[3px] border-l-blue-400 border border-gray-100 rounded-xl rounded-tl-none px-4 py-3 shadow-sm">
                    <p className="text-sm text-gray-700 leading-relaxed">Message du bot — fond blanc, bordure gauche couleur, coins arrondis sauf top-left.</p>
                  </div>
                </div>
              </div>
              {/* User Bubble */}
              <div className="flex justify-end">
                <div className="bg-blue-50 rounded-xl rounded-tr-none px-4 py-3 max-w-[75%]">
                  <p className="text-sm text-gray-700 leading-relaxed">Message utilisateur — aligne a droite, bg-blue-50, coin top-right plat.</p>
                </div>
              </div>
              {/* Bot Bubble avec ThinkingAnimation */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden ring-2 ring-violet-200">
                  CT
                </div>
                <div className="bg-white border-l-[3px] border-l-violet-400 border border-gray-100 rounded-xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-violet-300 animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 rounded-full bg-violet-200 animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

export function PageTypePage() {
  const [tab, setTab] = useState("identite");
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={BookOpen}
          iconColor="text-indigo-600"
          title="Bible Visuelle CarlOS"
          subtitle="Source unique — Patterns, Composants, Identité"
          onBack={() => setActiveView("dashboard")}
          rightSlot={
            <>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    tab === t.id
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </>
          }
        />
      }
    >

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═══ TAB 1 — IDENTITÉ ═══ */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {tab === "identite" && (
            <>
              {/* --- 1.1 Équipe GhostX --- */}
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-4">Équipe GhostX — 12 Agents C-Level</h3>
                <p className="text-xs text-gray-400 mb-3">Les 12 bots officiels de la plateforme — chaque bot a un profil, un standby, un code couleur et un rôle C-Level</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {OFFICIAL_BOTS.map((bot) => (
                    <div key={bot.code} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                      <div className="relative">
                        <img src={bot.standby} alt={bot.name} className="w-full aspect-video object-cover" />
                        <img src={bot.profil} alt={bot.name} className="absolute -bottom-4 left-3 w-12 h-12 rounded-full border-2 border-white shadow-md" />
                        <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-${bot.color}-100 text-${bot.color}-700`}>{bot.code}</span>
                      </div>
                      <div className="pt-5 pb-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-gray-800">{bot.emoji} {bot.name}</span>
                          <span className="text-xs text-gray-400">{bot.role}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{bot.subtitle}</div>
                        <div className={`h-1 rounded-full bg-${bot.color}-500 mt-2`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- 1.2 Palette Couleurs Officielles --- */}
              <div className="border-t border-gray-100 pt-6 mt-6">
                <h3 className="text-base font-bold text-gray-800 mb-4">Palette Couleurs Officielles</h3>
                <p className="text-xs text-gray-400 mb-3">Chaque bot a une couleur Tailwind assignée — utilisée dans les gradients, badges, accents et indicateurs</p>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {OFFICIAL_BOTS.map(bot => (
                    <div key={bot.code} className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full bg-${bot.color}-500`} />
                      <span className="text-xs font-medium text-gray-700">{bot.name}</span>
                      <span className="text-[9px] text-gray-400">{bot.code} — {bot.color}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- 1.3 En-têtes Gradient par Bot --- */}
              <div className="border-t border-gray-100 pt-6 mt-6">
                <h3 className="text-base font-bold text-gray-800 mb-4">En-têtes Gradient par Bot</h3>
                <p className="text-xs text-gray-400 mb-3">bg-gradient-to-r from-color-600 to-color-400 — utilisé dans les headers département, LiveChat, et cards spécialisées</p>
                <div className="space-y-3">
                  {OFFICIAL_BOTS.map(bot => (
                    <div key={bot.code} className={`rounded-xl p-4 bg-gradient-to-r from-${bot.color}-600 to-${bot.color}-400 text-white`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-lg">{bot.emoji}</div>
                        <div>
                          <div className="text-sm font-bold">{bot.name} — {bot.role}</div>
                          <div className="text-xs text-white/70">{bot.subtitle}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═══ TAB 2 — LAYOUT & NAVIGATION ═══ */}
          {/* ═══════════════════════════════════════════════════════════════ */}
      {tab === "layout-navigation" && <FE1TabLayout />}

      {tab === "composants" && <FE1TabComposants />}


      {tab === "cards-data" && <FE1TabCardsData />}

      {tab === "bulles-actions" && <FE1TabBullesActions />}


      {tab === "visualisations" && <FE1TabVisualisations />}


      {tab === "archive" && <FE1TabArchive />}


    </PageLayout>
  );
}
