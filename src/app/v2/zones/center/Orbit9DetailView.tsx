/**
 * Orbit9DetailView.tsx — Pages fonctionnelles Orbit9
 * Navigation par tabs (comme departements) + contenu interactif
 * Sprint B — Inspire des templates Admin Interface Design de Carl
 */

import { useState } from "react";
import {
  ArrowLeft, Search, Handshake, Crown, Rocket, Store, Calendar,
  Newspaper, Gauge, Globe, Users, TrendingUp, Shield, Zap,
  CheckCircle2, Clock, DollarSign, Target, Star, ArrowRight,
  BarChart3, Building2, Factory, Wrench, GraduationCap, Network,
  Plus, ExternalLink, Send, MapPin, Phone, Mail, FileText,
  ChevronRight, AlertTriangle, Flame, Check, X, Eye, Download,
  MessageSquare, Bot, Lightbulb, Award, Lock, Unlock, Hand,
  BookOpen, Settings, RefreshCw, CircleDot, Sparkles, Activity,
  PieChart, Briefcase, Scale, Vote, UserPlus, Share2, Filter,
  Link, ArrowUpRight, Play, Info, HelpCircle, Layers,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";

// ── Navigation groups avec sous-sections ──

interface SubSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface Orbit9Group {
  id: string;
  sections: SubSection[];
}

const GROUPS: Orbit9Group[] = [
  {
    id: "reseau",
    sections: [
      { id: "collaboration", label: "Cercles", icon: Handshake },
      { id: "matching", label: "Matching", icon: Search },
      { id: "gouvernance", label: "Gouvernance", icon: Crown },
    ],
  },
  {
    id: "croissance",
    sections: [
      { id: "pionniers", label: "Pionniers", icon: Rocket },
      { id: "marketplace", label: "Marketplace", icon: Store },
      { id: "evenements", label: "Evenements", icon: Calendar },
    ],
  },
  {
    id: "intelligence",
    sections: [
      { id: "benchmark", label: "Benchmark", icon: Gauge },
      { id: "nouvelles", label: "Nouvelles", icon: Newspaper },
      { id: "trg-industrie", label: "TRG Industrie", icon: Globe },
    ],
  },
];

function findGroup(sectionId: string): Orbit9Group | undefined {
  return GROUPS.find(g => g.sections.some(s => s.id === sectionId));
}

// ══════════════════════════════════════════
// SECTION: CERCLES / COLLABORATION
// ══════════════════════════════════════════

function CerclesPage() {
  const members = [
    { name: "Usinage Precision QC", sector: "Usinage CNC", status: "actif" as const, role: "Fondateur", since: "Fev 2026", avatar: "UP", bots: 6 },
    { name: "MetalPro Inc.", sector: "Soudage robotise", status: "actif" as const, role: "Membre", since: "Fev 2026", avatar: "MP", bots: 3 },
    { name: "AutomaTech", sector: "Integration robotique", status: "actif" as const, role: "Membre", since: "Mars 2026", avatar: "AT", bots: 6 },
    { name: "LogiFlow", sector: "Logistique 4.0", status: "actif" as const, role: "Membre", since: "Mars 2026", avatar: "LF", bots: 1 },
    { name: "PlastiForm", sector: "Moulage plastique", status: "invite" as const, role: "—", since: "—", avatar: "PF", bots: 0 },
  ];

  const pris = members.filter(m => m.status === "actif").length;

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 uppercase">Membres</span>
            <Users className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{pris}/9</div>
          <div className="text-[10px] text-gray-500">{9 - pris} places disponibles</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 uppercase">Rabais actif</span>
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">-15%</div>
          <div className="text-[10px] text-gray-500">Prochain palier: -20% a 7</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 uppercase">Connexions Bot-to-Bot</span>
            <Network className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-600">10</div>
          <div className="text-[10px] text-gray-500">Loi de Metcalfe: n(n-1)/2</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 uppercase">Economie collective</span>
            <TrendingUp className="h-3.5 w-3.5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-600">2,700$</div>
          <div className="text-[10px] text-gray-500">/mois pour le cercle</div>
        </Card>
      </div>

      {/* Grille progression rabais */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Progression du rabais de groupe</h3>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <div key={n} className="flex-1 flex flex-col items-center">
              <div className={cn(
                "w-full h-3 rounded-sm transition-all",
                n <= pris ? "bg-emerald-500" : n <= pris + 1 ? "bg-emerald-200" : "bg-gray-100"
              )} />
              <span className="text-[9px] text-gray-400 mt-0.5">{n}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>0% (solo)</span>
          <span className="font-semibold text-emerald-600">← Vous etes ici: -15%</span>
          <span>-25% (9 max)</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 italic">Le palier atteint ne redescend JAMAIS, meme si des membres quittent le cercle.</p>
      </Card>

      {/* Tableau des membres */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Membres du Cercle Orbit9</h3>
            <p className="text-[10px] text-gray-400">Max 9 membres. 1 client = 1 seul cercle. Bots collaborent automatiquement.</p>
          </div>
          <Button size="sm" className="gap-1.5 text-xs"><UserPlus className="h-3 w-3" /> Inviter un partenaire</Button>
        </div>

        {/* Header tableau */}
        <div className="grid grid-cols-12 gap-2 px-2 py-1.5 bg-gray-50 rounded text-[10px] font-semibold text-gray-500 uppercase mb-1">
          <span className="col-span-4">Entreprise</span>
          <span className="col-span-2">Secteur</span>
          <span className="col-span-1">Role</span>
          <span className="col-span-1">Bots</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2">Actions</span>
        </div>

        <div className="space-y-1">
          {members.map((m, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="col-span-4 flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold",
                  m.status === "actif" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                )}>{m.avatar}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.name}</p>
                  <p className="text-[10px] text-gray-400">Depuis {m.since}</p>
                </div>
              </div>
              <span className="col-span-2 text-xs text-gray-600">{m.sector}</span>
              <span className="col-span-1 text-xs text-gray-500">{m.role}</span>
              <span className="col-span-1 text-xs text-gray-600">{m.bots > 0 ? `${m.bots} actifs` : "—"}</span>
              <div className="col-span-2">
                <Badge variant="outline" className={cn("text-[10px]",
                  m.status === "actif" ? "text-green-600 border-green-300 bg-green-50" : "text-amber-600 border-amber-300 bg-amber-50"
                )}>
                  {m.status === "actif" ? "En ligne" : "Invitation envoyee"}
                </Badge>
              </div>
              <div className="col-span-2 flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 gap-1"><Eye className="h-3 w-3" /> Profil</Button>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 gap-1"><MessageSquare className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}

          {/* Places vides */}
          {Array.from({ length: 9 - members.length }).map((_, i) => (
            <div key={`empty-${i}`} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg border border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition-all">
              <div className="col-span-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-300"><Plus className="h-4 w-4" /></div>
                <span className="text-sm text-gray-400">Place disponible</span>
              </div>
              <span className="col-span-8 text-xs text-gray-300">Invitez un partenaire pour debloquer le prochain palier de rabais</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Features Coordination Inter-Bots */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Coordination Inter-Bots — Ce que le cercle debloque</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: RefreshCw, title: "Specs propagees auto", desc: "Changement de specs chez un membre → mis a jour automatiquement chez tous les partenaires", active: true },
            { icon: DollarSign, title: "Budget partage visible", desc: "Chaque membre voit le budget global du projet. Transparence totale.", active: true },
            { icon: Clock, title: "Timeline synchronisee", desc: "Deadlines et jalons synces entre tous les bots du cercle", active: true },
            { icon: Search, title: "Matching intra-cercle", desc: "CarlOS detecte les besoins et match avec les capacites des autres membres", active: true },
            { icon: Bot, title: "Bots qui se parlent", desc: "Les bots CTO/CFO/COO des entreprises negocient specs, budget et delais automatiquement", active: false },
            { icon: Sparkles, title: "Co-creation intelligente", desc: "CarlOS detecte quand 3+ membres ont le meme besoin et propose un projet commun", active: false },
          ].map((feat, i) => {
            const FIcon = feat.icon;
            return (
              <div key={i} className={cn("p-3 rounded-lg border transition-all", feat.active ? "bg-white border-emerald-200" : "bg-gray-50 border-gray-200 opacity-60")}>
                <div className="flex items-center gap-2 mb-1.5">
                  <FIcon className={cn("h-4 w-4", feat.active ? "text-emerald-600" : "text-gray-400")} />
                  <span className="text-xs font-bold text-gray-800">{feat.title}</span>
                  {!feat.active && <Badge variant="outline" className="text-[8px]">Sprint D</Badge>}
                </div>
                <p className="text-[10px] text-gray-500">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* CarlOS Proactif — Cercle Builder */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">C</div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-blue-800">CarlOS — Facilitateur de Cercle Proactif</h3>
            <p className="text-xs text-blue-600 mt-1 italic">"Carl, j'ai remarque quelque chose. Tu travailles regulierement avec Automation Plus, Acier Quebec et PrecisionCNC. Si vous formiez un Cercle Orbit9, vos bots se coordonneraient et vous economiseriez TOUS 15%. Tu veux que je prepare les invitations?"</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="text-xs gap-1 bg-blue-600 hover:bg-blue-700"><Send className="h-3 w-3" /> Preparer les invitations</Button>
              <Button size="sm" variant="outline" className="text-xs gap-1 border-blue-300 text-blue-700"><Users className="h-3 w-3" /> Voir mes contacts analyses</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════
// SECTION: MATCHING ENGINE
// ══════════════════════════════════════════

function MatchingPage() {
  return (
    <div className="space-y-5">
      {/* KPI */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Matchs actifs</span><Handshake className="h-3.5 w-3.5 text-blue-400" /></div>
          <div className="text-2xl font-bold text-blue-600">3</div>
          <div className="text-[10px] text-gray-500">En negociation</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Opportunites</span><Lightbulb className="h-3.5 w-3.5 text-amber-400" /></div>
          <div className="text-2xl font-bold text-amber-600">7</div>
          <div className="text-[10px] text-gray-500">Detectees cette semaine</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Valeur pipeline</span><DollarSign className="h-3.5 w-3.5 text-green-400" /></div>
          <div className="text-2xl font-bold text-green-600">285K$</div>
          <div className="text-[10px] text-gray-500">Projets potentiels</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Temps moyen</span><Clock className="h-3.5 w-3.5 text-violet-400" /></div>
          <div className="text-2xl font-bold text-violet-600">48h</div>
          <div className="text-[10px] text-gray-500">vs 3-6 mois humain</div>
        </Card>
      </div>

      {/* Alerte main levee */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <Hand className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800">Systeme Main Levee — Repondez rapidement</p>
          <p className="text-xs text-amber-700">Les opportunites sont attribuees au premier partenaire qualifie qui leve la main. Plus vous repondez vite, plus vous obtenez les meilleurs mandats.</p>
        </div>
      </div>

      {/* Opportunites detectees — style cartes missions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">Opportunites detectees par CarlOS</h3>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-[10px] cursor-pointer">Toutes</Badge>
            <Badge variant="outline" className="text-[10px] cursor-pointer">Intra-Cercle</Badge>
            <Badge variant="outline" className="text-[10px] cursor-pointer">Inter-Cercles</Badge>
          </div>
        </div>

        {[
          {
            title: "Robot de soudage collaboratif",
            client: "Usinage Precision QC",
            match: "AutomaTech",
            score: 94,
            budget: "125-175K$",
            timeline: "90 jours",
            status: "negociation" as const,
            type: "intra",
            missions: ["Evaluation faisabilite cobot", "Specs integration cellule", "Formation operateurs"],
            competences: ["Expertise robotique industrielle", "Integration soudure automatisee", "Programmation cobot"],
            pourquoi: ["Client a haut potentiel (projet recurrent)", "Match 94% avec vos competences", "Meme cercle = coordination directe"],
          },
          {
            title: "Certification ISO 13485 — Pharmaceutique",
            client: "PlastiForm",
            match: "Expert externe (reseau)",
            score: 87,
            budget: "12-18K$",
            timeline: "120 jours",
            status: "disponible" as const,
            type: "inter",
            missions: ["Audit documentation existante", "Gap analysis ISO 13485", "Plan de remediation"],
            competences: ["Certification ISO", "Connaissance secteur pharmaceutique", "Audit qualite"],
            pourquoi: ["Nouveau client potentiel pour le cercle", "Expertise rare = honoraires premium", "Portfolio pharmaceutique valorise"],
          },
          {
            title: "Optimisation logistique entrepot",
            client: "MetalPro Inc.",
            match: "LogiFlow",
            score: 91,
            budget: "35-55K$",
            timeline: "60 jours",
            status: "negociation" as const,
            type: "intra",
            missions: ["Analyse flux actuels", "Design nouveau layout", "Implementation WMS"],
            competences: ["Logistique 4.0", "Systemes WMS", "Optimisation flux"],
            pourquoi: ["Projet mesurable (ROI 6 mois)", "Relation existante dans le cercle", "Mandat recurrent possible"],
          },
        ].map((opp, i) => (
          <Card key={i} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {opp.status === "disponible" && <Badge className="bg-green-100 text-green-700 text-[9px]">NOUVELLE OPPORTUNITE</Badge>}
                  <Badge variant="outline" className={cn("text-[9px]", opp.type === "intra" ? "text-blue-600 border-blue-300" : "text-purple-600 border-purple-300")}>{opp.type === "intra" ? "Intra-Cercle" : "Inter-Cercles"}</Badge>
                </div>
                <h4 className="text-sm font-bold text-gray-800">{opp.title}</h4>
                <p className="text-xs text-gray-500">{opp.client} · {opp.timeline}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">{opp.budget}</p>
                <p className="text-[10px] text-gray-400">Budget estime</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Missions a realiser</p>
                {opp.missions.map((m, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-xs text-gray-600 mb-0.5">
                    <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" /> {m}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Competences requises</p>
                {opp.competences.map((c, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-xs text-gray-600 mb-0.5">
                    <CircleDot className="h-3 w-3 text-blue-500 shrink-0" /> {c}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Pourquoi cette opportunite</p>
                {opp.pourquoi.map((p, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-xs text-gray-600 mb-0.5">
                    <Sparkles className="h-3 w-3 text-amber-500 shrink-0" /> {p}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Match:</span>
                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${opp.score}%` }} />
                </div>
                <span className="text-xs font-bold text-blue-600">{opp.score}%</span>
              </div>
              <div className="flex gap-2">
                {opp.status === "disponible" ? (
                  <Button size="sm" className="text-xs gap-1 bg-green-600 hover:bg-green-700"><Hand className="h-3 w-3" /> Lever la main</Button>
                ) : (
                  <Button size="sm" variant="outline" className="text-xs gap-1"><Eye className="h-3 w-3" /> Voir negociation</Button>
                )}
                <Button size="sm" variant="outline" className="text-xs gap-1"><MessageSquare className="h-3 w-3" /> Details complets</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 3 niveaux de matching */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Moteur de Matching — 3 Niveaux</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, title: "Intra-Cercle", desc: "Match au sein de vos 9 membres. Coordination directe, bots connectes, delais rapides.", color: "blue", count: 4 },
            { icon: Network, title: "Inter-Cercles", desc: "Recherche dans tout le reseau Orbit9. Des centaines de partenaires potentiels.", color: "purple", count: 2 },
            { icon: Zap, title: "Co-Creation", desc: "CarlOS detecte quand 15+ membres cherchent la meme chose et propose un projet commun.", color: "amber", count: 1 },
          ].map((level) => {
            const LIcon = level.icon;
            return (
              <div key={level.title} className={cn("p-4 rounded-lg border", `bg-${level.color}-50 border-${level.color}-200`)}>
                <div className="flex items-center justify-between mb-2">
                  <LIcon className={cn("h-5 w-5", `text-${level.color}-600`)} />
                  <Badge variant="outline" className="text-[9px]">{level.count} actifs</Badge>
                </div>
                <p className="text-sm font-bold text-gray-800 mb-1">{level.title}</p>
                <p className="text-[10px] text-gray-600">{level.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════
// SECTION: GOUVERNANCE
// Inspire de la template "Gouvernance Augmentee par IA" de Carl
// ══════════════════════════════════════════

function GouvernancePage() {
  const [activeTab, setActiveTab] = useState("principes");

  const tabs = [
    { id: "principes", label: "Principes", icon: BookOpen },
    { id: "roles", label: "Roles", icon: Users },
    { id: "timetokens", label: "TimeTokens", icon: DollarSign },
    { id: "sortie", label: "Matrice Sortie", icon: Scale },
  ];

  return (
    <div className="space-y-5">
      {/* Header gradient — comme le template de Carl */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Scale className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-bold">Gouvernance Augmentee par IA</h2>
            <p className="text-xs text-white/70">Systeme Holacratique avec Agents Intelligence Artificielle</p>
          </div>
        </div>
        <p className="text-xs text-white/80">Le pouvoir ne reside pas dans une personne mais dans un PROCESSUS defini. Inspire Holacracy — adapte pour la collaboration IA + Humain.</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
        {tabs.map((tab) => {
          const TIcon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer flex-1 justify-center",
              activeTab === tab.id ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}>
              <TIcon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenu par tab */}
      {activeTab === "principes" && (
        <div className="space-y-3">
          {[
            { num: 1, title: "Base sur les TENSIONS", desc: "Une tension = un ecart entre la situation actuelle et ce qui pourrait etre.", examples: ["Le budget du projet n'est pas clair (probleme)", "On pourrait automatiser ce processus (opportunite)", "Le role du CTO n'inclut pas la gestion des subventions (manque de clarte)"], icon: Zap, color: "amber" },
            { num: 2, title: "Roles dynamiques, pas hierarchie statique", desc: "Les agents IA ET les humains occupent des roles avec accountabilites precises. Ces roles evoluent bases sur les tensions rencontrees.", examples: ["CEO-AI a des accountabilites definies qui peuvent evoluer", "Roles ajustes mensuellement via reunions de gouvernance"], icon: RefreshCw, color: "blue" },
            { num: 3, title: "Deux types de reunions distinctes", desc: "Gouvernance (structure) vs Tactique (operations). Jamais melangees.", examples: ["Gouvernance: 'Clarifier qui gere les subventions — CFO-AI ou CTO-AI?'", "Tactique: 'Le devis pour Acier Quebec est en retard de 3 jours'"], icon: Layers, color: "purple" },
            { num: 4, title: "Processus d'integration des propositions", desc: "Chaque proposition est testee avec les objections valides, pas par consensus mais par consentement.", examples: ["Proposition → Questions → Reactions → Objections → Integration", "Une objection est valide si elle protege un role existant"], icon: CheckCircle2, color: "green" },
            { num: 5, title: "Transparence radicale des donnees", desc: "Chaque bot partage ses metriques, ses decisions et ses rationnels. Tout est auditable.", examples: ["Historique complet de chaque decision par les bots", "Dashboards temps reel accessibles a tous les membres"], icon: Eye, color: "teal" },
          ].map((principle) => {
            const PIcon = principle.icon;
            return (
              <Card key={principle.num} className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", `bg-${principle.color}-100`)}>
                    <PIcon className={cn("h-5 w-5", `text-${principle.color}-600`)} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-800">Principe {principle.num}: {principle.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{principle.desc}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase">Exemples:</p>
                      {principle.examples.map((ex, j) => (
                        <div key={j} className="flex items-start gap-1.5 text-xs text-gray-600">
                          <ChevronRight className={cn("h-3 w-3 mt-0.5 shrink-0", `text-${principle.color}-500`)} />
                          <span>{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "roles" && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Roles dans le Cercle Orbit9</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: "Facilitateur", occupant: "CarlOS (CEO-AI)", accountabilites: ["Faciliter les reunions de gouvernance", "S'assurer que le processus est respecte", "Detecter les tensions non-exprimees"], type: "ia" },
                { role: "Secretaire", occupant: "COO-AI", accountabilites: ["Enregistrer les decisions", "Maintenir les registres", "Planifier les reunions"], type: "ia" },
                { role: "Leader du Cercle", occupant: "Carl (Fondateur)", accountabilites: ["Vision strategique", "Allocation des ressources", "Decisions finales sur la direction"], type: "humain" },
                { role: "Representant", occupant: "Elu par le cercle", accountabilites: ["Representer le cercle dans les cercles superieurs", "Reporter les tensions du cercle", "Proteger les interets du cercle"], type: "humain" },
              ].map((r, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={cn("text-[9px]", r.type === "ia" ? "text-violet-600 border-violet-300 bg-violet-50" : "text-blue-600 border-blue-300 bg-blue-50")}>
                      {r.type === "ia" ? "Agent IA" : "Humain"}
                    </Badge>
                    <span className="text-xs font-bold text-gray-800">{r.role}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-2">Occupe par: {r.occupant}</p>
                  <div className="space-y-1">
                    {r.accountabilites.map((a, j) => (
                      <div key={j} className="flex items-center gap-1.5 text-[10px] text-gray-600">
                        <CheckCircle2 className="h-2.5 w-2.5 text-green-500 shrink-0" /> {a}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "timetokens" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-violet-700">1,240</p>
              <p className="text-xs text-violet-600">TT accumules</p>
              <p className="text-[10px] text-gray-400 mt-1">Vos contributions</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-green-700">V1</p>
              <p className="text-xs text-green-600">Off-chain (SQLite)</p>
              <p className="text-[10px] text-gray-400 mt-1">Phase actuelle</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">5D</p>
              <p className="text-xs text-blue-600">Formule TT-RG</p>
              <p className="text-[10px] text-gray-400 mt-1">Allocation x Densite x Impact x Z x Pilier</p>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Pourquoi les Bots rendent les Smart Contracts 100x meilleurs</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs font-bold text-red-700 mb-2">DAO Traditionnelle</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-red-600"><X className="h-3 w-3 shrink-0" /> Humains auto-declarent leurs contributions</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-red-600"><X className="h-3 w-3 shrink-0" /> "J'ai travaille 40h" — vraiment?</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-red-600"><X className="h-3 w-3 shrink-0" /> Gaming du systeme, conflits, bureaucratie</div>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-bold text-green-700 mb-2">Solution GhostX</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-green-600"><Check className="h-3 w-3 shrink-0" /> Bots trackent automatiquement</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-green-600"><Check className="h-3 w-3 shrink-0" /> CTO Bot mesure les heures de dev</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-green-600"><Check className="h-3 w-3 shrink-0" /> Zero self-reporting, zero gaming</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Evolution en 3 phases</h3>
            <div className="flex gap-3">
              {[
                { phase: "Phase 1", label: "Off-Chain", desc: "SQLite local, tracking par bots, rapports mensuels", status: "actif", color: "green" },
                { phase: "Phase 2", label: "Hybrid", desc: "PostgreSQL centralise, API REST, audit trail immutable", status: "12-24 mois", color: "blue" },
                { phase: "Phase 3", label: "On-Chain", desc: "Ethereum/Polygon L2, smart contracts, distribution auto", status: "24-36 mois", color: "violet" },
              ].map((p) => (
                <div key={p.phase} className={cn("flex-1 p-3 rounded-lg border", `bg-${p.color}-50 border-${p.color}-200`)}>
                  <Badge variant="outline" className={cn("text-[9px] mb-2", p.status === "actif" ? "bg-green-100 text-green-700" : "")}>{p.status}</Badge>
                  <p className="text-xs font-bold text-gray-800">{p.phase} — {p.label}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{p.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "sortie" && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Matrice de Sortie — 4 Quadrants</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { q: "Q1", title: "Volontaire + Bons termes", desc: "Rachat TimeTokens a valeur marchande. Transition planifiee sur 90 jours. Bots continuent le suivi.", icon: Check, color: "green" },
                { q: "Q2", title: "Volontaire + Conflit", desc: "Mediation CREDO-integrative par CarlOS. Arbitrage neutre si echec. Protection PI via TimeTokens.", icon: Scale, color: "amber" },
                { q: "Q3", title: "Involontaire (Performance)", desc: "3 niveaux d'avertissement progressifs. Plan d'amelioration 60 jours. CarlOS coache.", icon: AlertTriangle, color: "orange" },
                { q: "Q4", title: "Evenement externe", desc: "Clause de succession automatique. Suppleant prend le relai. Continuite orbitale garantie.", icon: Shield, color: "red" },
              ].map((quad) => {
                const QIcon = quad.icon;
                return (
                  <div key={quad.q} className={cn("p-4 rounded-lg border", `bg-${quad.color}-50 border-${quad.color}-200`)}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", `bg-${quad.color}-100`)}>
                        <QIcon className={cn("h-4 w-4", `text-${quad.color}-600`)} />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-[9px]">{quad.q}</Badge>
                        <p className="text-xs font-bold text-gray-800">{quad.title}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{quad.desc}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4 bg-violet-50 border-violet-200">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-violet-600" />
              <h3 className="text-sm font-bold text-violet-800">Protection de la Propriete Intellectuelle</h3>
            </div>
            <p className="text-xs text-violet-700">Chaque contribution intellectuelle est trackee via TimeTokens et attribuee de facon <strong>irreversible</strong>. Quitter un cercle = perdre l'acces aux TimeTokens accumules. Les TimeTokens convertissent en: revenus distribues, equite dans les co-creations, commission sur les nouveaux membres.</p>
          </Card>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// SECTION: PIONNIERS BLEUS
// ══════════════════════════════════════════

function PionniersPage() {
  const sectors = [
    { name: "Automatisation", status: "pris" as const, company: "AutomaTech", contact: "Martin L." },
    { name: "Usinage / Metal", status: "pris" as const, company: "Usinage Precision QC", contact: "Jean-P. R." },
    { name: "Plastique", status: "prospect" as const, company: "PlastiForm (en discussion)", contact: "—" },
    { name: "Logistique", status: "pris" as const, company: "LogiFlow", contact: "Sophie D." },
    { name: "Soudage", status: "pris" as const, company: "MetalPro Inc.", contact: "Pierre T." },
    { name: "Alimentaire", status: "disponible" as const, company: "", contact: "" },
    { name: "Pharmaceutique", status: "disponible" as const, company: "", contact: "" },
    { name: "Emballage", status: "prospect" as const, company: "En discussion", contact: "—" },
    { name: "Electronique", status: "disponible" as const, company: "", contact: "" },
  ];

  const pris = sectors.filter(s => s.status === "pris").length;
  const prospects = sectors.filter(s => s.status === "prospect").length;

  return (
    <div className="space-y-5">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Cercle des Pionniers</h2>
            <p className="text-xs text-white/70">9 places. 9 leaders. 5 secteurs. Les portes ferment.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{pris}/9</div>
            <p className="text-xs text-white/70">Places confirmees</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Confirmes</div><div className="text-2xl font-bold text-indigo-600">{pris}</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">En discussion</div><div className="text-2xl font-bold text-amber-600">{prospects}</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Prix pionnier</div><div className="text-2xl font-bold text-green-600">1,350$</div><div className="text-[10px] text-gray-500">/mois vs 2,500$ vague 2</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Economie/an</div><div className="text-2xl font-bold text-green-600">13,800$</div><div className="text-[10px] text-gray-500">Garanti a vie</div></Card>
      </div>

      {/* Grille des 9 places */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">9 Places — 1 Leader par Secteur Strategique</h3>
        <div className="grid grid-cols-3 gap-2">
          {sectors.map((s, i) => (
            <div key={i} className={cn(
              "p-3 rounded-lg border transition-all",
              s.status === "pris" ? "bg-indigo-50 border-indigo-200" :
              s.status === "prospect" ? "bg-amber-50 border-amber-200 border-dashed" :
              "bg-gray-50 border-gray-200 border-dashed hover:border-indigo-300 cursor-pointer"
            )}>
              <div className="flex items-center justify-between mb-1">
                <span className={cn("text-xs font-bold", s.status === "pris" ? "text-indigo-700" : s.status === "prospect" ? "text-amber-700" : "text-gray-500")}>{s.name}</span>
                {s.status === "pris" ? <Check className="h-3.5 w-3.5 text-indigo-600" /> :
                 s.status === "prospect" ? <Clock className="h-3.5 w-3.5 text-amber-600" /> :
                 <Plus className="h-3.5 w-3.5 text-gray-400" />}
              </div>
              <p className="text-[10px] text-gray-500">{s.company || "Disponible — cliquez pour ajouter"}</p>
              {s.contact && s.contact !== "—" && <p className="text-[10px] text-gray-400 mt-0.5">Contact: {s.contact}</p>}
            </div>
          ))}
        </div>
      </Card>

      {/* Package Pioneer */}
      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <h3 className="text-sm font-bold text-indigo-800 mb-3">Package Pionnier — Conditions a Vie</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users, label: "C-Suite complet (6 bots)", detail: "1,350$/mois vs 2,500$ vague 2 = -46% garanti a vie" },
            { icon: Award, label: "Ambassadeur Or automatique", detail: "Statut premium des le jour 1 (normalement 3 cercles + 25 membres requis)" },
            { icon: GraduationCap, label: "Onboarding VIP gratuit", detail: "Carl s'assoit avec toi. Setup complet. Valeur 500$." },
            { icon: DollarSign, label: "Commission 5% sur ton cercle", detail: "Tu recrutes tes partenaires dans ton Orbit9 → tu gagnes sur leur abonnement" },
            { icon: Rocket, label: "6 mois d'avance", detail: "Pendant que la vague 2 attend, tes bots apprennent ton business. Avantage competitif." },
            { icon: Target, label: "Voix au roadmap produit", detail: "Tu influences directement ce qu'on developpe. Acces direct a l'equipe." },
          ].map((perk, i) => {
            const PIcon = perk.icon;
            return (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-indigo-100/50">
                <PIcon className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-indigo-800">{perk.label}</p>
                  <p className="text-[10px] text-indigo-600">{perk.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Script de rencontre */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-1">Script de Rencontre — 45 min, 5 actes</h3>
        <p className="text-[10px] text-gray-400 mb-3">En personne (JAMAIS Zoom). Cafe ou bureau du prospect. iPad avec CarlOS pret a rouler. Pas de PowerPoint.</p>
        <div className="space-y-2">
          {[
            { act: "1", title: "L'Accroche", dur: "5 min", desc: "Tu portes 8 chapeaux. Pas de CFO, CTO, CMO. Tu geres les urgences lundi au vendredi. Je me trompe?", color: "blue" },
            { act: "2", title: "Demo Live iPad", dur: "15 min", desc: "CarlOS analyse en temps reel. Les mots s'ecrivent devant le prospect. Le WOW moment. Active 3 bots.", color: "indigo" },
            { act: "3", title: "Exclusivite Sectorielle", dur: "10 min", desc: "Tableau 9 places physique. 'Ta place [Secteur] = toi ou [concurrent]. Je le rencontre vendredi.'", color: "purple" },
            { act: "4", title: "Conditions Pionnier", dur: "5 min", desc: "1 consultant = 5-10K$/mois. Toi = 6 cerveaux C-Level 24/7 pour 1,350$. = 61$/jour ouvrable.", color: "violet" },
            { act: "5", title: "Le Close", dur: "10 min", desc: "4 closes: Direct / Competitif / Deadline 48h / Affordability. Lien Stripe pret par texto.", color: "fuchsia" },
          ].map((act) => (
            <div key={act.act} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0", `bg-${act.color}-600`)}>{act.act}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800">{act.title}</span>
                  <Badge variant="outline" className="text-[9px]">{act.dur}</Badge>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">{act.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Calendrier sprint */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Calendrier Sprint 30 Jours</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { week: "Sem 1", title: "Les 3 premiers", desc: "Lun-Mer-Ven: 3 rencontres. Dimanche: Post LinkedIn '3/9 prises'", status: "done" },
            { week: "Sem 2", title: "Momentum", desc: "3 suivants. Post: '6 places prises. Il en reste 3.'", status: "active" },
            { week: "Sem 3", title: "Urgence max", desc: "3 derniers. Pression maximale. Post: 'Cercle COMPLET.'", status: "pending" },
            { week: "Sem 4", title: "Fermeture", desc: "Relance indecis 48h. Kick-off collectif visio 9 pionniers.", status: "pending" },
          ].map((w) => (
            <div key={w.week} className={cn("p-3 rounded-lg border", w.status === "done" ? "bg-green-50 border-green-200" : w.status === "active" ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200")}>
              <Badge variant="outline" className={cn("text-[9px] mb-1", w.status === "done" ? "text-green-600" : w.status === "active" ? "text-blue-600" : "")}>{w.week}</Badge>
              <p className="text-xs font-bold text-gray-800">{w.title}</p>
              <p className="text-[10px] text-gray-500 mt-1">{w.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════
// SECTION: MARKETPLACE
// ══════════════════════════════════════════

function MarketplacePage() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Bots specialises</span><Bot className="h-3.5 w-3.5 text-violet-400" /></div><div className="text-2xl font-bold text-violet-600">15</div><div className="text-[10px] text-gray-500">6 actifs · 4 en dev · 5 demandes</div></Card>
        <Card className="p-3"><div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Experts reseau</span><GraduationCap className="h-3.5 w-3.5 text-orange-400" /></div><div className="text-2xl font-bold text-orange-600">130+</div><div className="text-[10px] text-gray-500">Fournisseurs REAI</div></Card>
        <Card className="p-3"><div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Taux completion IA</span><Sparkles className="h-3.5 w-3.5 text-blue-400" /></div><div className="text-2xl font-bold text-blue-600">80%</div><div className="text-[10px] text-gray-500">Brouillon automatique</div></Card>
        <Card className="p-3"><div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Satisfaction</span><Star className="h-3.5 w-3.5 text-amber-400" /></div><div className="text-2xl font-bold text-amber-600">92%</div><div className="text-[10px] text-gray-500">Score moyen</div></Card>
      </div>

      {/* Flow 80/20 */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Modele 80/20 — Bot genere, Expert finalise</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <Bot className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-blue-800">Bot genere 80%</p>
            <p className="text-[10px] text-blue-600">Structure, brouillon, donnees. En 2h vs 15-20h humain.</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-300 shrink-0" />
          <div className="flex-1 p-3 bg-orange-50 rounded-lg border border-orange-200 text-center">
            <GraduationCap className="h-6 w-6 text-orange-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-orange-800">Expert finalise 20%</p>
            <p className="text-[10px] text-orange-600">Revision, ajustement, validation terrain. Expertise humaine.</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-300 shrink-0" />
          <div className="flex-1 p-3 bg-green-50 rounded-lg border border-green-200 text-center">
            <RefreshCw className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-green-800">Bot s'ameliore</p>
            <p className="text-[10px] text-green-600">Chaque correction = entrainement. Le bot devient expert.</p>
          </div>
        </div>
      </Card>

      {/* Bots specialises — grille */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">Catalogue des Bots Specialises</h3>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-[10px] cursor-pointer">Tous</Badge>
            <Badge variant="outline" className="text-[10px] cursor-pointer bg-green-50 text-green-700">Actifs</Badge>
            <Badge variant="outline" className="text-[10px] cursor-pointer">En dev</Badge>
            <Badge variant="outline" className="text-[10px] cursor-pointer">Demandes</Badge>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: "Bot Subventions", parent: "CFO", uses: 42, rating: 4.8, status: "actif" as const, desc: "Identifie et prepare les demandes de subventions automatiquement" },
            { name: "Bot Diagnostic", parent: "CTO", uses: 38, rating: 4.7, status: "actif" as const, desc: "Evaluations technologiques (robotique, IA, logistique)" },
            { name: "Bot Devis", parent: "CFO", uses: 25, rating: 4.5, status: "actif" as const, desc: "Generation automatique de devis et propositions" },
            { name: "Bot Planification", parent: "COO", uses: 0, rating: 0, status: "en_dev" as const, desc: "Planification de production et ordonnancement" },
            { name: "Bot Qualite ISO", parent: "CTO", uses: 0, rating: 0, status: "demande" as const, desc: "Gestion documentaire et audits ISO" },
            { name: "Bot Formation", parent: "CHRO", uses: 0, rating: 0, status: "demande" as const, desc: "Programmes de formation et e-learning" },
          ].map((bot, i) => (
            <div key={i} className={cn("p-3 rounded-lg border transition-all hover:shadow-sm",
              bot.status === "actif" ? "bg-white border-green-200" :
              bot.status === "en_dev" ? "bg-blue-50/50 border-blue-200" :
              "bg-gray-50 border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-1.5">
                <Badge variant="outline" className={cn("text-[9px]",
                  bot.status === "actif" ? "text-green-600 bg-green-50" :
                  bot.status === "en_dev" ? "text-blue-600 bg-blue-50" :
                  "text-gray-500"
                )}>{bot.status === "actif" ? "Actif" : bot.status === "en_dev" ? "En dev" : "Demande"}</Badge>
                <span className="text-[9px] text-gray-400">{bot.parent} AI</span>
              </div>
              <p className="text-xs font-bold text-gray-800">{bot.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{bot.desc}</p>
              {bot.uses > 0 && (
                <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                  <span>{bot.uses} utilisations</span>
                  <span>· ★ {bot.rating}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Demander un bot */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-3">
          <Plus className="h-8 w-8 text-blue-600 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-blue-800">Demander un nouveau bot specialise</h3>
            <p className="text-xs text-blue-600">Decrivez le besoin et CarlOS evaluera la faisabilite avec l'equipe.</p>
          </div>
          <Button size="sm" className="gap-1 text-xs bg-blue-600 hover:bg-blue-700"><Send className="h-3 w-3" /> Soumettre</Button>
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════
// SECTION: EVENEMENTS
// ══════════════════════════════════════════

function EvenementsPage() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3"><div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Prochain</span><Calendar className="h-3.5 w-3.5 text-rose-400" /></div><div className="text-lg font-bold text-rose-600">15 mars</div><div className="text-[10px] text-gray-500">Kickoff Pionniers</div></Card>
        <Card className="p-3"><div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Frequence (Or)</span><Star className="h-3.5 w-3.5 text-amber-400" /></div><div className="text-lg font-bold text-amber-600">Trimestriel</div><div className="text-[10px] text-gray-500">4x/an + diners prives</div></Card>
        <Card className="p-3"><div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Grande Offensive</span><Rocket className="h-3.5 w-3.5 text-indigo-400" /></div><div className="text-lg font-bold text-indigo-600">Sprint D</div><div className="text-[10px] text-gray-500">Expansion regionale</div></Card>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Calendrier des evenements</h3>
        <div className="space-y-2">
          {[
            { date: "15 mars 2026", title: "Kickoff Pionniers Bleus", type: "Visio", desc: "Presentation des 9 pionniers. Onboarding collectif. CarlOS configure les bots de chaque membre.", status: "confirme" as const, participants: 9 },
            { date: "28 mars 2026", title: "Demo Live — Coordination Inter-Bots", type: "Presentiel", desc: "Cas reel du cercle: les bots collaborent en direct. Specs propagees, budget syncronise.", status: "planifie" as const, participants: 0 },
            { date: "Q2 2026", title: "Rassemblement Cercle #1", type: "Presentiel", desc: "Bilan trimestre, metriques d'impact, nouvelles opportunites detectees. 9 membres reunis.", status: "a_venir" as const, participants: 0 },
            { date: "Q3 2026", title: "Demo Investisseurs", type: "Evenement", desc: "Presentation aux investisseurs potentiels. Showcase de l'impact Orbit9.", status: "a_venir" as const, participants: 0 },
          ].map((evt, i) => (
            <div key={i} className="flex gap-4 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
              <div className="w-20 text-center shrink-0 py-1">
                <p className="text-xs font-bold text-rose-600">{evt.date}</p>
                <Badge variant="outline" className="text-[9px] mt-1">{evt.type}</Badge>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{evt.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{evt.desc}</p>
                {evt.participants > 0 && <p className="text-[10px] text-gray-400 mt-1">{evt.participants} participants confirmes</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={cn("text-[9px]",
                  evt.status === "confirme" ? "bg-green-100 text-green-700" :
                  evt.status === "planifie" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
                )} variant="outline">{evt.status === "confirme" ? "Confirme" : evt.status === "planifie" ? "Planifie" : "A venir"}</Badge>
                {evt.status === "confirme" && <Button size="sm" variant="outline" className="text-[10px] h-7">Rejoindre</Button>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════
// SECTION: BENCHMARK
// ══════════════════════════════════════════

function BenchmarkPage() {
  const pillars = [
    { letter: "V", name: "Vente", score: 72, avg: 65, color: "bg-blue-500", status: "sain" },
    { letter: "I", name: "Idee", score: 45, avg: 55, color: "bg-purple-500", status: "risque" },
    { letter: "T", name: "Temps", score: 88, avg: 70, color: "bg-emerald-500", status: "sain" },
    { letter: "A", name: "Argent", score: 31, avg: 50, color: "bg-amber-500", status: "critique" },
    { letter: "A", name: "Actif", score: 62, avg: 60, color: "bg-red-500", status: "sain" },
  ];

  const critiques = pillars.filter(p => p.status === "critique" || p.status === "risque").length;

  return (
    <div className="space-y-5">
      {/* VITAA Comparison */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">Benchmark VITAA — Toi vs Secteur</h3>
          <Badge variant="outline" className="text-[10px]">Derniere mise a jour: aujourd'hui</Badge>
        </div>
        <div className="space-y-3">
          {pillars.map((p) => (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={cn("w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold", p.color)}>{p.letter}</div>
                  <span className="text-sm font-medium text-gray-700">{p.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className={cn("font-bold", p.score >= p.avg ? "text-green-600" : "text-red-600")}>Toi: {p.score}</span>
                  <span className="text-gray-400">Secteur: {p.avg}</span>
                  <Badge variant="outline" className={cn("text-[9px]",
                    p.status === "sain" ? "text-green-600 bg-green-50" :
                    p.status === "risque" ? "text-amber-600 bg-amber-50" :
                    "text-red-600 bg-red-50"
                  )}>{p.status}</Badge>
                </div>
              </div>
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gray-200 absolute" style={{ width: `${p.avg}%` }} />
                <div className={cn("h-full rounded-full absolute", p.color)} style={{ width: `${p.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Triangle du Feu */}
      <Card className={cn("p-4", critiques >= 3 ? "bg-red-50 border-red-300" : critiques >= 2 ? "bg-amber-50 border-amber-300" : "bg-green-50 border-green-300")}>
        <div className="flex items-center gap-3">
          <Flame className={cn("h-8 w-8", critiques >= 3 ? "text-red-600" : critiques >= 2 ? "text-amber-600" : "text-green-600")} />
          <div>
            <p className="text-sm font-bold">{critiques >= 3 ? "Triangle du Feu: BRULE" : critiques >= 2 ? "Triangle du Feu: COUVE" : critiques === 1 ? "Triangle du Feu: MEURT" : "Triangle du Feu: SAIN"}</p>
            <p className="text-xs text-gray-600">{critiques} pilier{critiques > 1 ? "s" : ""} en zone critique/risque. {critiques >= 2 ? "Intervention ciblee recommandee." : "Situation sous controle."}</p>
          </div>
          <Button size="sm" variant="outline" className="ml-auto text-xs gap-1"><Target className="h-3 w-3" /> Plan d'action</Button>
        </div>
      </Card>

      {/* 3 types de benchmark */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 border-l-4 border-blue-400">
          <BarChart3 className="h-5 w-5 text-blue-600 mb-2" />
          <p className="text-sm font-bold text-gray-800">Benchmark Externe</p>
          <p className="text-xs text-gray-500 mt-1">Compare avec les competiteurs et la mediane sectorielle de ton industrie.</p>
          <Button size="sm" variant="outline" className="text-[10px] mt-3 gap-1"><Eye className="h-3 w-3" /> Voir le rapport</Button>
        </Card>
        <Card className="p-4 border-l-4 border-emerald-400">
          <Users className="h-5 w-5 text-emerald-600 mb-2" />
          <p className="text-sm font-bold text-gray-800">Benchmark Pairs</p>
          <p className="text-xs text-gray-500 mt-1">Compare avec les 8 autres membres de ton Cercle Orbit9 (anonymise).</p>
          <Button size="sm" variant="outline" className="text-[10px] mt-3 gap-1"><Eye className="h-3 w-3" /> Voir le rapport</Button>
        </Card>
        <Card className="p-4 border-l-4 border-violet-400">
          <TrendingUp className="h-5 w-5 text-violet-600 mb-2" />
          <p className="text-sm font-bold text-gray-800">Benchmark Historique</p>
          <p className="text-xs text-gray-500 mt-1">Ta propre trajectoire sur les 6 derniers mois. Mesure ta progression.</p>
          <Button size="sm" variant="outline" className="text-[10px] mt-3 gap-1"><Eye className="h-3 w-3" /> Voir le rapport</Button>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// SECTION: NOUVELLES
// ══════════════════════════════════════════

function NouvellesPage() {
  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">Fil d'Actualite du Reseau</h3>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-[10px] cursor-pointer">Toutes</Badge>
            <Badge variant="outline" className="text-[10px] cursor-pointer">Opportunites</Badge>
            <Badge variant="outline" className="text-[10px] cursor-pointer">Reseau</Badge>
            <Badge variant="outline" className="text-[10px] cursor-pointer">Performance</Badge>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { time: "Il y a 2h", title: "3 partenaires potentiels detectes", desc: "Le Matching Engine a identifie des fournisseurs compatibles dans le secteur robotique. Score moyen: 89%.", type: "opportunite" as const, icon: Search, action: "Voir les matchs" },
            { time: "Il y a 5h", title: "Bot CFO: 47K$ en optimisations", desc: "Votre bot CFO a identifie 3 optimisations de couts ce mois: reneg. assurance (12K$), credit d'impot (25K$), consolidation achats (10K$).", type: "performance" as const, icon: DollarSign, action: "Voir le detail" },
            { time: "Hier", title: "Cercle atteint 5 membres → -15%", desc: "Nouveau palier de rabais debloque! Prochaine etape: 7 membres = -20%. Il reste 4 places.", type: "jalon" as const, icon: CheckCircle2, action: "Inviter" },
            { time: "2 jours", title: "Nouveau membre: AutomaTech", desc: "Integration robotique rejoint votre cercle. Specialite: cobots et cellules automatisees. Bots connectes.", type: "reseau" as const, icon: UserPlus, action: "Voir profil" },
            { time: "3 jours", title: "Mission completee: Audit securite", desc: "Bot Security + Cyber Expert QC ont finalise l'audit. Rapport de 28 pages genere. Score securite: 72/100.", type: "performance" as const, icon: Shield, action: "Lire le rapport" },
            { time: "1 sem", title: "Rapport mensuel — 124 taches completees", desc: "Performance de vos 6 bots C-Level: 124 taches, 3 projets avances, 47K$ en valeur generee.", type: "rapport" as const, icon: BarChart3, action: "Rapport complet" },
          ].map((news, i) => {
            const NIcon = news.icon;
            const colors = { opportunite: "blue", performance: "amber", jalon: "green", reseau: "emerald", rapport: "gray" };
            const c = colors[news.type];
            return (
              <div key={i} className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", `bg-${c}-100`)}>
                  <NIcon className={cn("h-4 w-4", `text-${c}-600`)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-800">{news.title}</p>
                    <span className="text-[10px] text-gray-400">{news.time}</span>
                  </div>
                  <p className="text-xs text-gray-500">{news.desc}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] shrink-0 h-8 gap-1">
                  {news.action} <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════
// SECTION: TRG INDUSTRIE
// Inspire du Dashboard de l'Industrie de Carl
// ══════════════════════════════════════════

function TrgIndustriePage() {
  const [activeTab, setActiveTab] = useState("vue");
  const tabs = [
    { id: "vue", label: "Vue d'ensemble" },
    { id: "couts", label: "Couts & ROI" },
    { id: "rh", label: "RH & Talents" },
    { id: "opportunites", label: "Opportunites" },
    { id: "etudes", label: "Etudes" },
  ];

  return (
    <div className="space-y-5">
      {/* Header gradient — comme le template Dashboard de l'Industrie */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-violet-700 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Dashboard de l'Industrie</h2>
            <p className="text-xs text-white/70">Statistiques et tendances du secteur manufacturier</p>
          </div>
          <Badge className="bg-white/20 text-white text-[10px]">Mise a jour: Fevrier 2026</Badge>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            { value: "68.5%", label: "Taux d'Efficacite Global Moyen", trend: "+4.2%", icon: Gauge },
            { value: "2.8M$", label: "Investissement en Automatisation", trend: "+12.5%", icon: DollarSign },
            { value: "42 min", label: "Temps d'Arret Moyen", trend: "-8.3%", icon: Clock },
            { value: "18 mois", label: "ROI Moyen Projets Auto.", trend: "-3 mois", icon: TrendingUp },
          ].map((kpi) => {
            const KIcon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white/10 rounded-lg p-3 backdrop-blur">
                <div className="flex items-center justify-between mb-1">
                  <KIcon className="h-4 w-4 text-white/70" />
                  <span className={cn("text-[10px] font-bold", kpi.trend.startsWith("+") && !kpi.trend.includes("mois") ? "text-green-300" : "text-green-300")}>{kpi.trend}</span>
                </div>
                <p className="text-xl font-bold">{kpi.value}</p>
                <p className="text-[10px] text-white/70">{kpi.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sub-tabs */}
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

      {activeTab === "vue" && (
        <div className="space-y-4">
          {/* 4 Instances */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">4 Instances — Ecosysteme Usine Bleue</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Usine Bleue (Admin)", sub: "admin.usinebleue.ai", icon: Building2, color: "blue", desc: "Dashboard complet, bots, CRM, matching, Data Room, War Room", role: "Orchestrateur" },
                { name: "Manufacturier", sub: "app.usinebleue.ai", icon: Factory, color: "emerald", desc: "Chat CarlOS, diagnostics, Mon Usine (OEE/KPIs), cahier projet", role: "Client PME" },
                { name: "Fournisseur", sub: "partner.usinebleue.ai", icon: Wrench, color: "orange", desc: "Profil competences, opportunites matchees, soumissions, portfolio", role: "Partenaire" },
                { name: "Expert Solo", sub: "expert.usinebleue.ai", icon: GraduationCap, color: "purple", desc: "Mandats ponctuels, outils diagnostics, formation CREDO, revenus", role: "Expert" },
              ].map((inst) => {
                const IIcon = inst.icon;
                return (
                  <div key={inst.name} className={cn("p-3 rounded-lg border-l-4", `border-${inst.color}-400 bg-${inst.color}-50/50`)}>
                    <div className="flex items-center gap-2 mb-1">
                      <IIcon className={cn("h-4 w-4", `text-${inst.color}-600`)} />
                      <span className="text-xs font-bold text-gray-800">{inst.name}</span>
                      <Badge variant="outline" className="text-[9px]">{inst.role}</Badge>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono mb-1">{inst.sub}</p>
                    <p className="text-xs text-gray-500">{inst.desc}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Sources de donnees */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-4 w-4 text-teal-600" />
              <h3 className="text-sm font-bold text-gray-800">Sources de Donnees — Sous-Bot CMO</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { source: "Statistique Canada", type: "Federal", freq: "Annuel", icon: Building2 },
                { source: "STIQ (Quebec)", type: "Provincial", freq: "Trimestriel", icon: MapPin },
                { source: "MEI Quebec", type: "Provincial", freq: "Annuel", icon: Briefcase },
                { source: "Deloitte Manufacturing", type: "Global", freq: "Annuel", icon: Globe },
                { source: "Reseau Orbit9", type: "Proprietaire", freq: "Continu", icon: Network },
                { source: "Sondages Usine Bleue", type: "Proprietaire", freq: "Mensuel", icon: Vote },
              ].map((s) => {
                const SIcon = s.icon;
                return (
                  <div key={s.source} className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 flex items-start gap-2">
                    <SIcon className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-teal-800">{s.source}</p>
                      <p className="text-[10px] text-teal-600">{s.type} · {s.freq}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "couts" && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Couts Moyens par Type de Solution (k$)</h3>
            <p className="text-xs text-gray-400 mb-3">Investissement total incluant materiel, integration, formation et maintenance annuelle</p>
            {[
              { type: "Robot Collaboratif (Cobot)", materiel: "25-75k$", integration: "35k$", formation: "8k$", maintenance: "6k$/an", total: "124k$" },
              { type: "Robot Industriel 6 axes", materiel: "80-250k$", integration: "120k$", formation: "15k$", maintenance: "18k$/an", total: "403k$" },
              { type: "Robot Mobile AMR", materiel: "40-120k$", integration: "45k$", formation: "10k$", maintenance: "8k$/an", total: "183k$" },
              { type: "Systeme Vision IA", materiel: "15-60k$", integration: "25k$", formation: "5k$", maintenance: "4k$/an", total: "89k$" },
            ].map((row) => (
              <div key={row.type} className="p-3 rounded-lg border border-gray-200 mb-2 last:mb-0">
                <p className="text-sm font-bold text-gray-800 mb-2">{row.type}</p>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: "Materiel", value: row.materiel },
                    { label: "Integration", value: row.integration },
                    { label: "Formation", value: row.formation },
                    { label: "Maintenance/an", value: row.maintenance },
                    { label: "TOTAL (1re annee)", value: row.total, highlight: true },
                  ].map((col) => (
                    <div key={col.label} className={cn("p-2 rounded", col.highlight ? "bg-blue-50 border border-blue-200" : "bg-gray-50")}>
                      <p className="text-[10px] text-gray-500">{col.label}</p>
                      <p className={cn("text-sm font-bold", col.highlight ? "text-blue-700" : "text-gray-800")}>{col.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {activeTab === "rh" && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Salaires Moyens — Secteur Manufacturier Quebec</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: "Ingenieur mecanique", salaire: "78-95K$", demande: "Forte" },
                { role: "Ingenieur automatisation", salaire: "85-110K$", demande: "Tres forte" },
                { role: "Technicien robotique", salaire: "55-72K$", demande: "Forte" },
                { role: "Directeur de production", salaire: "90-125K$", demande: "Moyenne" },
                { role: "Specialiste IA/ML", salaire: "95-140K$", demande: "Extreme" },
                { role: "Soudeur certifie", salaire: "52-68K$", demande: "Forte" },
              ].map((r) => (
                <div key={r.role} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{r.role}</p>
                    <p className="text-sm font-bold text-green-600">{r.salaire}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[9px]",
                    r.demande === "Extreme" ? "text-red-600 bg-red-50" :
                    r.demande === "Tres forte" ? "text-orange-600 bg-orange-50" :
                    r.demande === "Forte" ? "text-amber-600 bg-amber-50" :
                    "text-gray-600"
                  )}>Demande: {r.demande}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "opportunites" && (
        <Card className="p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Opportunites sectorielles detectees</h3>
          <p className="text-xs text-gray-400 mb-3">Basees sur l'analyse croisee des sources de donnees et des tendances du reseau Orbit9.</p>
          {[
            { sector: "Automatisation", opportunity: "Penurie de main-d'oeuvre → ROI cobot en 14 mois", impact: "Eleve", trend: "↑" },
            { sector: "IA Industrielle", opportunity: "23% d'adoption → 77% du marche non-penetre", impact: "Tres eleve", trend: "↑↑" },
            { sector: "Logistique 4.0", opportunity: "42 min d'arrets evitables par jour en moyenne", impact: "Eleve", trend: "↑" },
            { sector: "Energetique", opportunity: "Credits carbone + reduction 15% couts energetiques", impact: "Moyen", trend: "→" },
          ].map((o, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:shadow-sm mb-2 last:mb-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <Lightbulb className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{o.sector}</p>
                <p className="text-xs text-gray-500">{o.opportunity}</p>
              </div>
              <Badge variant="outline" className="text-[9px]">{o.impact}</Badge>
              <span className="text-sm">{o.trend}</span>
            </div>
          ))}
        </Card>
      )}

      {activeTab === "etudes" && (
        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
            <div className="flex items-start gap-3">
              <Globe className="h-6 w-6 text-teal-600 mt-1 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-teal-800">Rapport Annuel de l'Industrie — Lead Magnet</h3>
                <p className="text-xs text-teal-700 mt-1">Usine Bleue publie LE rapport de reference du manufacturier au Quebec. Position centrale credible = donnees uniques du reseau Orbit9 + sources gouvernementales + sondages proprietaires.</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-[9px] text-teal-700 border-teal-300">50+ entreprises = donnees significatives</Badge>
                  <Badge variant="outline" className="text-[9px] text-teal-700 border-teal-300">Sprint D+</Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Etudes disponibles</h3>
            {[
              { title: "Portrait manufacturier Quebec 2025", source: "STIQ + MEI", pages: 45, type: "Rapport" },
              { title: "Tendances automatisation Canada", source: "Deloitte", pages: 32, type: "Etude" },
              { title: "Benchmark OEE secteur metal", source: "Reseau Orbit9", pages: 12, type: "Benchmark" },
            ].map((doc, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:shadow-sm mb-2 last:mb-0">
                <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{doc.title}</p>
                  <p className="text-[10px] text-gray-400">{doc.source} · {doc.pages} pages</p>
                </div>
                <Badge variant="outline" className="text-[9px]">{doc.type}</Badge>
                <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1"><Download className="h-3 w-3" /> PDF</Button>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// SECTION RENDERERS MAP
// ══════════════════════════════════════════

const SECTION_RENDERERS: Record<string, () => JSX.Element> = {
  collaboration: CerclesPage,
  matching: MatchingPage,
  gouvernance: GouvernancePage,
  pionniers: PionniersPage,
  marketplace: MarketplacePage,
  evenements: EvenementsPage,
  benchmark: BenchmarkPage,
  nouvelles: NouvellesPage,
  "trg-industrie": TrgIndustriePage,
};

const SECTION_TITLES: Record<string, string> = {
  collaboration: "Cercles Orbit9",
  matching: "Matching Engine",
  gouvernance: "Gouvernance",
  pionniers: "Pionniers Bleus",
  marketplace: "Marketplace Experts",
  evenements: "Evenements",
  benchmark: "Benchmark",
  nouvelles: "Nouvelles",
  "trg-industrie": "TRG de l'Industrie",
};

const GROUP_LABELS: Record<string, string> = {
  reseau: "Reseau & Collaboration",
  croissance: "Croissance",
  intelligence: "Intelligence & Donnees",
};

// ══════════════════════════════════════════
// MAIN VIEW
// ══════════════════════════════════════════

export function Orbit9DetailView() {
  const { activeOrbit9Section, setActiveView, navigateOrbit9 } = useFrameMaster();
  const sectionId = activeOrbit9Section || "collaboration";
  const group = findGroup(sectionId);
  if (!group) return null;

  const Renderer = SECTION_RENDERERS[sectionId];
  if (!Renderer) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header avec tabs de navigation — meme pattern que departements */}
      <div className="bg-white border-b px-4 py-3 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setActiveView("department")}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900">{GROUP_LABELS[group.id] || "Orbit9"}</h1>
            <p className="text-[10px] text-gray-400">Mon Reseau Orbit 9</p>
          </div>
        </div>

        {/* Tabs — sous-sections du groupe */}
        <div className="flex gap-1">
          {group.sections.map((sec) => {
            const SIcon = sec.icon;
            const isActive = sec.id === sectionId;
            return (
              <button
                key={sec.id}
                onClick={() => navigateOrbit9(sec.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}
              >
                <SIcon className="h-3.5 w-3.5" />
                {sec.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5 max-w-5xl">
        <Renderer />
      </div>
    </div>
  );
}
