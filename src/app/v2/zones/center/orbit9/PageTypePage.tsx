/**
 * PageTypePage.tsx — Page Type / Normes Graphiques
 * Reference visuelle de tous les composants et patterns de design
 * Accessible depuis le sidebar sous TRG Industries
 */

import { useState } from "react";
import {
  Users, Bot, Star, DollarSign, TrendingUp, Target,
  CheckCircle2, Clock, Eye, MessageSquare, Send, Plus,
  Zap, Shield, Search, ArrowRight, Rocket, Crown,
  Hand, Handshake, AlertTriangle, Flame, Info,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

export function PageTypePage() {
  const [activeTab, setActiveTab] = useState("composants");

  const tabs = [
    { id: "composants", label: "Composants" },
    { id: "couleurs", label: "Couleurs & Bots" },
    { id: "navigation", label: "Navigation" },
    { id: "cartes", label: "Types de Cartes" },
  ];

  return (
    <div className="space-y-6">

      {/* Sub-tabs — meme logique de navigation que TRG et Marketplace */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn(
            "px-4 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer",
            activeTab === tab.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-700"
          )}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB 1 — COMPOSANTS ═══ */}
      {activeTab === "composants" && (
        <div className="space-y-6">

          {/* Typographie */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Typographie</h3>
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
            </div>
          </Card>

          {/* KPI Cards */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">KPI Cards (4 colonnes)</h3>
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-400 uppercase">Label KPI</span>
                  <Users className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-600">42</div>
                <div className="text-[10px] text-gray-500">Description courte</div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-400 uppercase">Montant</span>
                  <DollarSign className="h-3.5 w-3.5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-600">2,700$</div>
                <div className="text-[10px] text-gray-500">Par mois</div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-400 uppercase">Pourcentage</span>
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-600">85%</div>
                <div className="text-[10px] text-gray-500">En hausse</div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-400 uppercase">Score</span>
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-600">4.7/5</div>
                <div className="text-[10px] text-gray-500">Satisfaction</div>
              </Card>
            </div>
          </Card>

          {/* Boutons */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Boutons</h3>
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
          </Card>

          {/* Badges */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Badges</h3>
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
                <span className="text-[10px] text-gray-400 w-20 shrink-0">Agent</span>
                <Badge variant="outline" className="text-[9px] text-violet-600 border-violet-300 bg-violet-50">Agent IA</Badge>
                <Badge variant="outline" className="text-[9px] text-blue-600 border-blue-300 bg-blue-50">Humain</Badge>
              </div>
            </div>
          </Card>

          {/* Barre de recherche */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Barre de recherche</h3>
            <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-white">
              <Search className="h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Chercher par industrie, fonction ou besoin..." className="flex-1 text-sm outline-none bg-transparent" readOnly />
            </div>
          </Card>

          {/* Progress bar */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Barres de progression</h3>
            <div className="space-y-3">
              {[
                { label: "Score match", value: 94, color: "bg-blue-500" },
                { label: "Progression", value: 65, color: "bg-emerald-500" },
                { label: "Risque", value: 31, color: "bg-red-500" },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{bar.label}</span>
                    <span className="text-xs font-bold text-gray-800">{bar.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", bar.color)} style={{ width: `${bar.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ═══ TAB 2 — COULEURS & BOTS ═══ */}
      {activeTab === "couleurs" && (
        <div className="space-y-6">

          {/* Palette bots */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Couleurs des 14 Bots C-Level</h3>
            <div className="grid grid-cols-7 gap-2">
              {[
                { code: "BCO", name: "CEO", color: "blue" },
                { code: "BCT", name: "CTO", color: "violet" },
                { code: "BCF", name: "CFO", color: "emerald" },
                { code: "BCM", name: "CMO", color: "pink" },
                { code: "BCS", name: "CSO", color: "red" },
                { code: "BOO", name: "COO", color: "orange" },
                { code: "BFA", name: "Factory", color: "slate" },
                { code: "BHR", name: "CHRO", color: "teal" },
                { code: "BIO", name: "CIO", color: "cyan" },
                { code: "BCC", name: "CCO", color: "rose" },
                { code: "BPO", name: "CPO", color: "fuchsia" },
                { code: "BRO", name: "CRO", color: "amber" },
                { code: "BLE", name: "Legal", color: "indigo" },
                { code: "BSE", name: "Security", color: "zinc" },
              ].map((bot) => (
                <div key={bot.code} className="text-center">
                  <div className={cn("w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-white text-[10px] font-bold", `bg-${bot.color}-600`)}>
                    {bot.code}
                  </div>
                  <p className="text-[10px] font-bold text-gray-700 mt-1">{bot.name}</p>
                  <p className="text-[9px] text-gray-400">{bot.color}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Couleurs de statut */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Couleurs de statut</h3>
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
          </Card>

          {/* Message bubbles couleur */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Couleurs pastel dans les discussions</h3>
            <div className="space-y-2">
              {[
                { bot: "BCO (CEO)", color: "blue" },
                { bot: "BCT (CTO)", color: "violet" },
                { bot: "BCF (CFO)", color: "emerald" },
              ].map((b) => (
                <div key={b.bot} className={cn("p-3 rounded-xl border-l-[3px] bg-white border", `border-l-${b.color}-400 border-gray-100`)}>
                  <p className={cn("text-xs font-semibold mb-1", `text-${b.color}-700`)}>{b.bot}</p>
                  <p className="text-xs text-gray-600">Exemple de message avec la couleur identitaire du bot en bordure gauche.</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ═══ TAB 3 — NAVIGATION ═══ */}
      {activeTab === "navigation" && (
        <div className="space-y-6">

          {/* Barre d'action Canvas */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Barre d'action du Canvas (header)</h3>
            <p className="text-xs text-gray-500 mb-3">Toujours en haut. Titre + sous-titre + sous-tabs si applicable.</p>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-white border-b px-4 py-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-gray-400 p-1 rounded-lg bg-gray-100"><ArrowRight className="h-4 w-4 rotate-180" /></div>
                  <div>
                    <h1 className="text-sm font-bold text-gray-900">Titre de la Section</h1>
                    <p className="text-[10px] text-gray-400">Sous-titre descriptif</p>
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
          </Card>

          {/* Sous-tabs style underline (dans le contenu) */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Sous-tabs style underline (dans le contenu)</h3>
            <p className="text-xs text-gray-500 mb-3">Utilise dans les pages avec beaucoup de sous-sections (ex: Gouvernance, TRG).</p>
            <div className="flex gap-1 border-b border-gray-200">
              <button className="px-4 py-2 text-xs font-medium border-b-2 border-indigo-600 text-indigo-700 cursor-pointer">Tab Active</button>
              <button className="px-4 py-2 text-xs font-medium border-b-2 border-transparent text-gray-500 cursor-pointer">Tab Inactive</button>
              <button className="px-4 py-2 text-xs font-medium border-b-2 border-transparent text-gray-500 cursor-pointer">Tab Inactive</button>
            </div>
          </Card>

          {/* Pill tabs (dans le contenu) */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Pill tabs (toggle dans le contenu)</h3>
            <p className="text-xs text-gray-500 mb-3">Utilise pour basculer entre 2-4 vues dans une section.</p>
            <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-white shadow-sm text-gray-900 flex-1 justify-center cursor-pointer"><CheckCircle2 className="h-3.5 w-3.5" /> Active</button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-gray-500 flex-1 justify-center cursor-pointer">Inactive</button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-gray-500 flex-1 justify-center cursor-pointer">Inactive</button>
            </div>
          </Card>

          {/* Cross-links */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Cross-links entre sections</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 bg-orange-50 border-orange-200 cursor-pointer hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2">
                  <Handshake className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-xs font-bold text-orange-800">Lien vers autre section</p>
                    <p className="text-[10px] text-orange-600">Description courte du lien</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 bg-violet-50 border-violet-200 cursor-pointer hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-violet-600" />
                  <div>
                    <p className="text-xs font-bold text-violet-800">Lien vers autre section</p>
                    <p className="text-[10px] text-violet-600">Description courte du lien</p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      )}

      {/* ═══ TAB 4 — TYPES DE CARTES ═══ */}
      {activeTab === "cartes" && (
        <div className="space-y-6">

          {/* Header gradient */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Header gradient (dans le contenu, pas dans la nav)</h3>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Titre de Section</h2>
                  <p className="text-xs text-white/70">Sous-titre descriptif</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">4/9</div>
                  <p className="text-xs text-white/70">Progression</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Card fiche CV agent */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Fiche CV Agent IA</h3>
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
                  <p className="text-[10px] text-gray-400 mb-2"><span className="font-semibold">Secteurs:</span> Metal, Soudage, Assemblage</p>
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
          </Card>

          {/* Card opportunite / cahier */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Card Opportunite / Cahier</h3>
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
          </Card>

          {/* CTA CarlOS proactif */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">CTA CarlOS Proactif</h3>
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">C</div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-blue-800">CarlOS — Titre de l'intervention</h3>
                  <p className="text-xs text-blue-600 mt-1 italic">"Message contextuel de CarlOS avec suggestion proactive..."</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="text-xs gap-1 bg-blue-600 hover:bg-blue-700"><Send className="h-3 w-3" /> Action principale</Button>
                    <Button size="sm" variant="outline" className="text-xs gap-1 border-blue-300 text-blue-700"><Eye className="h-3 w-3" /> Action secondaire</Button>
                  </div>
                </div>
              </div>
            </Card>
          </Card>

          {/* Alerte / Warning */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Alertes</h3>
            <div className="space-y-2">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Alerte Warning</p>
                  <p className="text-xs text-amber-700">Description de l'alerte ou situation a surveiller.</p>
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
          </Card>

          {/* Flow pipeline */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Flow Pipeline (etapes horizontales)</h3>
            <div className="flex items-center gap-2">
              {[
                { step: "1", title: "ETAPE 1", desc: "Description courte", color: "blue" },
                { step: "2", title: "ETAPE 2", desc: "Description courte", color: "indigo" },
                { step: "3", title: "ETAPE 3", desc: "Description courte", color: "emerald" },
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
          </Card>
        </div>
      )}
    </div>
  );
}
