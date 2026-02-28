/**
 * PageTypePage.tsx — Page Type / Normes Graphiques V2
 * Reference visuelle de TOUS les composants et patterns de design
 * Accessible depuis le sidebar sous TRG Industries
 */

import { useState } from "react";
import {
  Users, Bot, Star, DollarSign, TrendingUp, Target,
  CheckCircle2, Clock, Eye, MessageSquare, Send, Plus,
  Zap, Shield, Search, ArrowRight, Rocket, Crown,
  Hand, Handshake, AlertTriangle, Flame, Info,
  Activity, BarChart3, TrendingDown, Minus,
  Gauge, Briefcase, Settings, FileText, Lightbulb,
  Heart,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

export function PageTypePage() {
  const [activeTab, setActiveTab] = useState("composants");

  const tabs = [
    { id: "composants", label: "Composants" },
    { id: "dashboard", label: "Dashboard & Cockpit" },
    { id: "couleurs", label: "Couleurs & Bots" },
    { id: "navigation", label: "Navigation" },
    { id: "cartes", label: "Types de Cartes" },
    { id: "discussions", label: "Discussions & Alertes" },
  ];

  return (
    <div className="space-y-6">

      {/* Sub-tabs — meme logique que TRG et Marketplace */}
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
              <p className="text-4xl font-bold text-emerald-600">text-4xl font-bold — Score global</p>
            </div>
          </Card>

          {/* KPI Cards — 4 colonnes */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">KPI Cards — 4 colonnes (standard)</h3>
            <p className="text-[10px] text-gray-400 mb-3">grid-cols-4 gap-3 — Utilise dans Marketplace, Cellules, Tour de Controle</p>
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
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 w-20 shrink-0">Compteur</span>
                <span className="min-w-[14px] h-3.5 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">7</span>
                <span className="min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">3</span>
                <span className="min-w-[14px] h-3.5 bg-green-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">12</span>
                <span className="text-[10px] text-gray-400 ml-2">— Utilise dans header, sidebar</span>
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

          {/* Barres de progression */}
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

          {/* Icones — regles */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Icones — Regles</h3>
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
                <span className="text-[10px] text-gray-500">— Toujours en couleur (couleur du bot/section)</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-gray-400 w-28 shrink-0">KPI cards (couleur)</span>
                <div className="flex items-center gap-3">
                  <Users className="h-3.5 w-3.5 text-blue-400" />
                  <DollarSign className="h-3.5 w-3.5 text-green-400" />
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <span className="text-[10px] text-gray-500">— Couleur-400 subtile dans les cards</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-gray-400 w-28 shrink-0">Actions (gris)</span>
                <div className="flex items-center gap-3">
                  <Settings className="h-3.5 w-3.5 text-gray-400" />
                  <ArrowRight className="h-3.5 w-3.5 text-gray-400 rotate-180" />
                  <Search className="h-3.5 w-3.5 text-gray-400" />
                  <Eye className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <span className="text-[10px] text-gray-500">— Gris-400 pour actions neutres (back, search, etc.)</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-gray-400 w-28 shrink-0">Taille standard</span>
                <div className="flex items-center gap-3">
                  <Bot className="h-3 w-3 text-gray-500" />
                  <span className="text-[9px] text-gray-400">h-3</span>
                  <Bot className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-[9px] text-gray-400">h-3.5</span>
                  <Bot className="h-4 w-4 text-gray-500" />
                  <span className="text-[9px] text-gray-400">h-4</span>
                  <Bot className="h-5 w-5 text-gray-500" />
                  <span className="text-[9px] text-gray-400">h-5</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══ TAB 2 — DASHBOARD & COCKPIT ═══ */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">

          {/* Tour de Controle — Cards avec header gradient */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Tour de Controle — Cards departement</h3>
            <p className="text-[10px] text-gray-400 mb-3">grid-cols-2 lg:grid-cols-5 gap-3 — Header gradient couleur du bot, contenu compact</p>
            <div className="grid grid-cols-3 gap-3">
              {/* Card BCF */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Finances</span>
                  </div>
                  <span className="text-xs bg-white/25 text-white px-1.5 rounded-full">5</span>
                </div>
                <div className="p-3 space-y-2.5">
                  <div><p className="text-xs text-gray-800">Tresorerie</p><p className="text-xs font-bold text-emerald-600">845,000$</p></div>
                  <div><p className="text-xs text-gray-800">Revenus mensuels</p><p className="text-xs font-bold text-gray-700">125,000$</p></div>
                  <div>
                    <p className="text-xs text-gray-800">Marge brute</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "42%" }} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">42%</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card BCT */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Technologie</span>
                  </div>
                  <span className="text-xs bg-white/25 text-white px-1.5 rounded-full">4</span>
                </div>
                <div className="p-3 space-y-2.5">
                  <div><p className="text-xs text-gray-800">Uptime</p><p className="text-xs font-bold text-violet-600">99.7%</p></div>
                  <div><p className="text-xs text-gray-800">Deploiements</p><p className="text-xs font-bold text-gray-700">12 ce mois</p></div>
                  <div>
                    <p className="text-xs text-gray-800">Securite</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: "88%" }} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">88%</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card BCM */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-pink-600 to-pink-500 px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Marketing</span>
                  </div>
                  <span className="text-xs bg-white/25 text-white px-1.5 rounded-full">3</span>
                </div>
                <div className="p-3 space-y-2.5">
                  <div><p className="text-xs text-gray-800">Leads generes</p><p className="text-xs font-bold text-pink-600">47</p></div>
                  <div><p className="text-xs text-gray-800">Taux conversion</p><p className="text-xs font-bold text-gray-700">12.3%</p></div>
                  <div>
                    <p className="text-xs text-gray-800">Budget utilise</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full" style={{ width: "65%" }} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">65%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Card>

          {/* Cockpit Bot Grid */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Cockpit — Grid 12 bots (4 par rangee)</h3>
            <p className="text-[10px] text-gray-400 mb-3">grid-cols-4 gap-2 — Chaque bot a son avatar + couleur + mini-bulletin</p>
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
          </Card>

          {/* VITAA Health Bars */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Barres de sante VITAA</h3>
            <p className="text-[10px] text-gray-400 mb-3">5 piliers — couleur par score (vert ≥70, ambre 45-69, rouge &lt;45)</p>
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
          </Card>

          {/* Triangle du Feu */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Triangle du Feu — Indicateur diagnostic</h3>
            <p className="text-[10px] text-gray-400 mb-3">4 etats: BRULE (3+ piliers forts), COUVE (2), MEURT (1), SAIN</p>
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
          </Card>

          {/* Pastilles colorees */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Pastilles / Items colores (diagnostics, discussions)</h3>
            <p className="text-[10px] text-gray-400 mb-3">Fond pastel, bordure laterale couleur, icone + titre + description</p>
            <div className="space-y-2">
              {[
                { icon: Shield, color: "blue", title: "Securite OT", desc: "Audit des systemes de controle industriel et cybersecurite" },
                { icon: Bot, color: "violet", title: "Intelligence Artificielle", desc: "Evaluation de la maturite IA et potentiel d'automatisation" },
                { icon: Activity, color: "emerald", title: "Logistique", desc: "Optimisation de la chaine d'approvisionnement et flux" },
                { icon: Gauge, color: "orange", title: "Performance", desc: "Mesure des KPIs operationnels et amelioration continue" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className={cn("flex items-center gap-3 p-3 rounded-xl border-l-[3px] bg-white border", `border-l-${item.color}-400 border-gray-100 hover:shadow-sm transition-shadow cursor-pointer`)}>
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", `bg-${item.color}-50`)}>
                      <Icon className={cn("h-4 w-4", `text-${item.color}-500`)} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{item.title}</p>
                      <p className="text-[10px] text-gray-500">{item.desc}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0 ml-auto" />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Box sizing guide */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Grilles et disposition des boxes</h3>
            <p className="text-[10px] text-gray-400 mb-3">Responsive — s'adapte a la largeur du Canvas</p>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase mb-2">5 colonnes — Tour de Controle</p>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400">Card {i + 1}</div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase mb-2">4 colonnes — KPIs standard</p>
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400">Card {i + 1}</div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase mb-2">3 colonnes — Sections larges</p>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400">Card {i + 1}</div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase mb-2">2 colonnes — Contenu + sidebar</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400">Contenu principal</div>
                  <div className="h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400">Sidebar</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══ TAB 3 — COULEURS & BOTS ═══ */}
      {activeTab === "couleurs" && (
        <div className="space-y-6">

          {/* Palette bots */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Couleurs des 14 Bots C-Level</h3>
            <p className="text-[10px] text-gray-400 mb-3">Chaque bot a un gradient header (-600 a -500) et une couleur accent (-400/-500)</p>
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

          {/* Gradients bot header */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Gradients de header (par bot)</h3>
            <p className="text-[10px] text-gray-400 mb-3">bg-gradient-to-r from-{"{color}"}-600 to-{"{color}"}-500</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "BCO — CEO", from: "from-blue-600", to: "to-blue-500" },
                { label: "BCT — CTO", from: "from-violet-600", to: "to-violet-500" },
                { label: "BCF — CFO", from: "from-emerald-600", to: "to-emerald-500" },
                { label: "BOO — COO", from: "from-orange-600", to: "to-orange-500" },
              ].map((g) => (
                <div key={g.label} className={cn("rounded-lg px-3 py-2 text-white text-[10px] font-bold bg-gradient-to-r", g.from, g.to)}>
                  {g.label}
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

          {/* Couleurs de fond pastel */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Fonds pastel (discussions, alertes, CTA)</h3>
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
          </Card>
        </div>
      )}

      {/* ═══ TAB 4 — NAVIGATION ═══ */}
      {activeTab === "navigation" && (
        <div className="space-y-6">

          {/* Barre d'action Canvas */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Barre d'action du Canvas (header)</h3>
            <p className="text-xs text-gray-500 mb-3">Toujours en haut. Titre + sous-titre + sous-tabs si applicable. JAMAIS de header gradient en double.</p>
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

          {/* Sous-tabs style underline */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Sous-tabs style underline (dans le contenu)</h3>
            <p className="text-xs text-gray-500 mb-3">Utilise dans les pages multi-sous-sections (Gouvernance, Page Type, etc.).</p>
            <div className="flex gap-1 border-b border-gray-200">
              <button className="px-4 py-2 text-xs font-medium border-b-2 border-indigo-600 text-indigo-700 cursor-pointer">Tab Active</button>
              <button className="px-4 py-2 text-xs font-medium border-b-2 border-transparent text-gray-500 cursor-pointer">Tab Inactive</button>
              <button className="px-4 py-2 text-xs font-medium border-b-2 border-transparent text-gray-500 cursor-pointer">Tab Inactive</button>
            </div>
          </Card>

          {/* Pill tabs */}
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

          {/* Regles de navigation */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Regles de navigation</h3>
            <div className="space-y-2">
              {[
                "TITRE dans la barre d'action UNIQUEMENT — jamais dedouble avec un header gradient",
                "SOUS-TABS dans la barre d'action — meme pattern que TRG Industries et Marketplace",
                "UNDERLINE TABS dans le contenu — pour les sections internes (Gouvernance, Page Type)",
                "BACK BUTTON — fleche grise en haut a gauche, ramene a la vue departement",
                "FULL WIDTH — le contenu couvre toute la largeur du Canvas, pas de bande blanche",
                "ICONES en COULEUR dans le sidebar, en GRIS pour les actions neutres",
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-700">{rule}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ═══ TAB 5 — TYPES DE CARTES ═══ */}
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

          {/* Alertes */}
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

      {/* ═══ TAB 6 — DISCUSSIONS & ALERTES ═══ */}
      {activeTab === "discussions" && (
        <div className="space-y-6">

          {/* Bulles de discussion colorees */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Bulles de discussion — couleur par bot</h3>
            <p className="text-[10px] text-gray-400 mb-3">Bordure gauche couleur du bot, fond blanc, hover shadow</p>
            <div className="space-y-2">
              {[
                { bot: "BCO (CEO)", color: "blue", msg: "Je recommande de prioriser le pipeline manufacturier avant l'expansion." },
                { bot: "BCT (CTO)", color: "violet", msg: "L'architecture actuelle supporte 10x la charge. On est solides." },
                { bot: "BCF (CFO)", color: "emerald", msg: "Le cash flow permet 3 mois de runway sans revenu additionnel." },
                { bot: "BCM (CMO)", color: "pink", msg: "La campagne LinkedIn a genere 47 leads qualifies cette semaine." },
              ].map((b) => (
                <div key={b.bot} className={cn("p-3 rounded-xl border-l-[3px] bg-white border", `border-l-${b.color}-400 border-gray-100`)}>
                  <p className={cn("text-xs font-semibold mb-1", `text-${b.color}-700`)}>{b.bot}</p>
                  <p className="text-xs text-gray-600">{b.msg}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Fenetres multi-perspectives colorees */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Multi-perspectives — fenetres colorees</h3>
            <p className="text-[10px] text-gray-400 mb-3">Fond pastel par bot — utilise quand plusieurs bots repondent en parallele</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { bot: "CEO", code: "BCO", color: "blue", msg: "Vision strategique: concentrer les efforts sur les 3 premiers pionniers." },
                { bot: "CFO", code: "BCF", color: "emerald", msg: "Analyse financiere: ROI positif apres 4 mois avec le pricing actuel." },
                { bot: "CTO", code: "BCT", color: "violet", msg: "Faisabilite technique: les APIs sont pretes, deploiement en 48h." },
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
          </Card>

          {/* Sentinelle CarlOS */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Sentinelle CarlOS — coaching contextuel</h3>
            <p className="text-[10px] text-gray-400 mb-3">Messages de coaching qui apparaissent quand CarlOS detecte un pattern</p>
            <div className="space-y-2">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">C</div>
                <div className="flex-1">
                  <p className="text-xs text-amber-800"><span className="font-bold">Sentinelle:</span> Ca fait 3 fois qu'on tourne autour de la meme idee. Les options se repetent — tu veux qu'on cristallise?</p>
                  <div className="flex gap-2 mt-2">
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-amber-200 text-amber-800 font-medium cursor-pointer">Cristalliser</button>
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-white border border-amber-300 text-amber-700 font-medium cursor-pointer">Continuer</button>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">C</div>
                <div className="flex-1">
                  <p className="text-xs text-blue-800"><span className="font-bold">CarlOS:</span> J'ai detecte un lien entre ce thread et ton projet "Expansion Maritimes". Tu veux que je connecte les deux?</p>
                  <div className="flex gap-2 mt-2">
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-blue-200 text-blue-800 font-medium cursor-pointer">Connecter</button>
                    <button className="text-[10px] px-2.5 py-1 rounded-full bg-white border border-blue-300 text-blue-700 font-medium cursor-pointer">Pas maintenant</button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Cockpit Live panel */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Cockpit Live — panneau communication</h3>
            <p className="text-[10px] text-gray-400 mb-3">Fixe en bas sidebar droite — 3 canaux (vocal, appel, video)</p>
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
          </Card>

          {/* Options de message */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Options de message (pastilles cliquables)</h3>
            <p className="text-[10px] text-gray-400 mb-3">Generees par CarlOS en reponse — permettent de challenger, brancher, explorer</p>
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
          </Card>
        </div>
      )}
    </div>
  );
}
