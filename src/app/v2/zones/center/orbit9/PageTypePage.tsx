/**
 * PageTypePage.tsx — Page Type / Normes Graphiques V4
 * Reference officielle GhostX — Ligne directrice extraite des 11 simulations
 * 4 onglets: Ligne Directrice | Composants | Visualisations | Patterns App
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
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

export function PageTypePage() {
  const [activeTab, setActiveTab] = useState("ligne-directrice");

  const tabs = [
    { id: "ligne-directrice", label: "Ligne Directrice" },
    { id: "composants", label: "Composants" },
    { id: "visualisations", label: "Visualisations" },
    { id: "patterns-app", label: "Patterns App" },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header — gold standard structure */}
      <div className="bg-white border-b px-4 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-indigo-600" />
          <div>
            <div className="text-sm font-bold text-gray-800">Page Type — Normes Graphiques</div>
            <div className="text-xs text-gray-500">Reference officielle GhostX</div>
          </div>
        </div>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                activeTab === tab.id
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═══ TAB 1 — LIGNE DIRECTRICE ═══ */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "ligne-directrice" && (
            <>
              {/* --- Structure de page --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Structure de page (patron gold — 11/11 simulations)</h3>
                <p className="text-[10px] text-gray-400 mb-3">h-full flex flex-col bg-gray-50 + header bg-white border-b + flex-1 overflow-auto → max-w-4xl mx-auto p-4 space-y-4 pb-12</p>
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
                      <div className="h-8 rounded-lg bg-white border border-gray-200 flex items-center px-3 text-[10px] text-gray-400">Contenu scrollable — max-w-4xl mx-auto</div>
                      <div className="h-8 rounded-lg bg-white border border-gray-200 flex items-center px-3 text-[10px] text-gray-400">Cards, bulles, sections...</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Card containers 3 niveaux --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Card containers — 3 niveaux de hierarchie</h3>
                <p className="text-[10px] text-gray-400 mb-3">Standard (shadow-sm) | Premium (border-2 shadow-lg) | Alerte (border-2 + gradient fond)</p>
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

              {/* --- Gradient Headers (2 styles) --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Gradient headers — 2 styles (TOUJOURS dans une card, jamais standalone)</h3>
                <p className="text-[10px] text-gray-400 mb-3">Sature (-500 to -500) pour TechniqueCard | Pastel (-100 to -100) pour Spectre, Synthese</p>
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

              {/* --- Bot Bubble + User Bubble + BotAvatar --- */}
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

              {/* --- Bot Proposal --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Bot Proposal (proposition dans une card technique)</h3>
                <p className="text-[10px] text-gray-400 mb-3">border rounded-lg px-3 py-2.5 border-l-[3px] border-l-{"{color}"}-400 bg-{"{color}"}-50/30</p>
                <div className="space-y-2">
                  <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-violet-400 bg-violet-50/30 border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">Proposition CTO — abonnement predictif avec IoT sur equipements critiques...</p>
                  </div>
                  <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-emerald-400 bg-emerald-50/30 border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">Proposition CFO — modele de financement par leasing operationnel a 36 mois...</p>
                  </div>
                </div>
              </div>

              {/* --- Score Bars h-2.5 --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Score bars (h-2.5 — standard simulations)</h3>
                <p className="text-[10px] text-gray-400 mb-3">h-2.5 bg-gray-100 rounded-full overflow-hidden — fill couleur avec transition</p>
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

              {/* --- Pilules (4 types) --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Pilules — completion, transition, start, restart</h3>
                <p className="text-[10px] text-gray-400 mb-3">Centrees, rounded-full, pastel — pour fin de flow et navigation entre modes</p>
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

              {/* --- CREDO Phase Indicator --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Indicateur CREDO (5 cercles connectes)</h3>
                <p className="text-[10px] text-gray-400 mb-3">w-7 h-7 rounded-full — actifs bg-blue-600 text-white, inactifs bg-gray-100 — connecteurs w-4 h-0.5</p>
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
                        <span className={cn("text-[10px]", p.active ? "text-blue-600 font-medium" : "text-gray-400")}>{p.label}</span>
                      </div>
                      {i < 4 && <div className={cn("w-4 h-0.5 mb-4", i < 2 ? "bg-blue-400" : "bg-gray-200")} />}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═══ TAB 2 — COMPOSANTS ═══ */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "composants" && (
            <>
              {/* --- Typographie --- */}
              <div>
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
              </div>

              {/* --- Boutons --- */}
              <div>
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
              </div>

              {/* --- Badges --- */}
              <div>
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
                    <span className="text-[10px] text-gray-400 w-20 shrink-0">Compteur</span>
                    <span className="min-w-[14px] h-3.5 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">7</span>
                    <span className="min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">3</span>
                    <span className="min-w-[14px] h-3.5 bg-green-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">12</span>
                    <span className="text-[10px] text-gray-400 ml-2">— Utilise dans header, sidebar</span>
                  </div>
                </div>
              </div>

              {/* --- Barre de recherche --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">Barre de recherche</h3>
                <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-white">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Chercher par industrie, fonction ou besoin..." className="flex-1 text-sm outline-none bg-transparent" readOnly />
                </div>
              </div>

              {/* --- Icones — regles --- */}
              <div>
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

              {/* --- Couleurs 14 Bots + Gradients --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Couleurs des 14 Bots C-Level</h3>
                <p className="text-[10px] text-gray-400 mb-3">Gradient header: from-{"{color}"}-600 to-{"{color}"}-500 | Accent: {"{color}"}-400/-500</p>
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
              </div>

              {/* --- Gradients bot header --- */}
              <div>
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
              </div>

              {/* --- KPI Cards 4 colonnes --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">KPI Cards — 4 colonnes (standard)</h3>
                <p className="text-[10px] text-gray-400 mb-3">grid-cols-4 gap-3 — Marketplace, Cellules, Tour de Controle</p>
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
              </div>

              {/* --- Navigation --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">Navigation — Barre d'action + sous-tabs header</h3>
                <div className="space-y-3">
                  {/* Barre d'action */}
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

              {/* --- Couleurs de statut --- */}
              <div>
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
              </div>

              {/* --- Fonds pastel --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">Fonds pastel (discussions, alertes)</h3>
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
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═══ TAB 3 — VISUALISATIONS ═══ */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "visualisations" && (
            <>
              {/* --- Split Screen Pour/Contre (DebatDemo) --- */}
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

              {/* --- Comparaison 3 colonnes (InnovationDemo) --- */}
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

              {/* --- SWOT 2x2 (StrategieDemo) --- */}
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

              {/* --- Timeline horizontale (StrategieDemo) --- */}
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

              {/* --- Sticky Board (BrainstormDemo) --- */}
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

              {/* --- Chaine 5 Pourquoi (AnalyseDemo) --- */}
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

              {/* --- GO/NO-GO Split (DecisionDemo) --- */}
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

              {/* --- VerdictCard (DebatDemo) --- */}
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

              {/* --- Timer sombre (CriseDemo) --- */}
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

              {/* --- 7 Indicateurs de progression --- */}
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

              {/* --- Ishikawa Fishbone (AnalyseDemo) --- */}
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
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ═══ TAB 4 — PATTERNS APP ═══ */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "patterns-app" && (
            <>
              {/* --- Tour de Controle --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Tour de Controle — Cards departement</h3>
                <p className="text-[10px] text-gray-400 mb-3">Header gradient couleur du bot, contenu compact, grid-cols-3</p>
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

              {/* --- Cockpit Bot Grid --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Cockpit — Grid bots (4 par rangee)</h3>
                <p className="text-[10px] text-gray-400 mb-3">grid-cols-4 gap-2 — avatar + couleur + mini-bulletin</p>
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

              {/* --- VITAA Health Bars --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Barres de sante VITAA</h3>
                <p className="text-[10px] text-gray-400 mb-3">5 piliers — couleur par score (vert ≥70, ambre 45-69, rouge &lt;45) — h-2.5</p>
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

              {/* --- Triangle du Feu --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Triangle du Feu — Indicateur diagnostic</h3>
                <p className="text-[10px] text-gray-400 mb-3">4 etats: BRULE (3+), COUVE (2), MEURT (1), SAIN</p>
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

              {/* --- Discussion bubbles (LiveChat) --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Bulles de discussion — couleur par bot (LiveChat)</h3>
                <p className="text-[10px] text-gray-400 mb-3">Bordure gauche couleur du bot, fond blanc</p>
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

              {/* --- Multi-perspectives --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Multi-perspectives — 3 bots paralleles</h3>
                <p className="text-[10px] text-gray-400 mb-3">grid-cols-3 gap-3 — fond pastel par bot</p>
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

              {/* --- Sentinelle CarlOS --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Sentinelle CarlOS — coaching contextuel</h3>
                <p className="text-[10px] text-gray-400 mb-3">Messages coaching quand CarlOS detecte un pattern</p>
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

              {/* --- Options de message --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Options de message (pastilles cliquables)</h3>
                <p className="text-[10px] text-gray-400 mb-3">Generees par CarlOS — challenger, brancher, explorer</p>
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

              {/* --- Cockpit Live --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Cockpit Live — panneau communication</h3>
                <p className="text-[10px] text-gray-400 mb-3">Fixe en bas sidebar droite — 3 canaux</p>
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

              {/* --- Fiche CV Agent --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Fiche CV Agent IA (Marketplace)</h3>
                <p className="text-[10px] text-gray-400 mb-3">Avatar + badges competences + footer stats + actions</p>
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

              {/* --- Card Opportunite --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Card Opportunite / Cahier (Marketplace)</h3>
                <p className="text-[10px] text-gray-400 mb-3">Badges type + budget + competences + mains levees</p>
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

              {/* --- Alertes --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Alertes (warning / info)</h3>
                <p className="text-[10px] text-gray-400 mb-3">Fond pastel + icone + texte — pas de CTA standalone</p>
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

              {/* --- Flow Pipeline --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Flow Pipeline (etapes horizontales)</h3>
                <p className="text-[10px] text-gray-400 mb-3">3 cards pastel + fleches de connexion</p>
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

              {/* --- Cross-links --- */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">Cross-links entre sections</h3>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
