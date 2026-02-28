/**
 * Orbit9DetailView.tsx — Pages fonctionnelles Orbit9
 * Navigation par tabs (comme departements) + contenu interactif
 * Sprint B — Pages fonctionnelles, pas blueprints
 */

import { useState } from "react";
import {
  ArrowLeft, Search, Handshake, Crown, Rocket, Store, Calendar,
  Newspaper, Gauge, Globe, Users, TrendingUp, Shield, Zap,
  CheckCircle2, Clock, DollarSign, Target, Star, ArrowRight,
  BarChart3, Building2, Factory, Wrench, GraduationCap, Network,
  Plus, ExternalLink, Send, MapPin, Phone, Mail,
  ChevronRight, AlertTriangle, Flame, Check, X,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";

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
    { name: "Usinage Precision QC", sector: "Usinage CNC", status: "actif", discount: "-25%", since: "Fev 2026" },
    { name: "MetalPro Inc.", sector: "Soudage robotise", status: "actif", discount: "-25%", since: "Fev 2026" },
    { name: "PlastiForm", sector: "Moulage plastique", status: "invite", discount: "—", since: "—" },
    { name: "AutomaTech", sector: "Integration robotique", status: "actif", discount: "-25%", since: "Mars 2026" },
    { name: "LogiFlow", sector: "Logistique 4.0", status: "actif", discount: "-25%", since: "Mars 2026" },
  ];
  return (
    <div className="space-y-5">
      {/* Status cercle */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Membres</div><div className="text-2xl font-bold text-emerald-600">5/9</div><div className="text-[10px] text-gray-500">4 places disponibles</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Rabais actif</div><div className="text-2xl font-bold text-emerald-600">-15%</div><div className="text-[10px] text-gray-500">-25% a 9 membres</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Connexions</div><div className="text-2xl font-bold text-blue-600">10</div><div className="text-[10px] text-gray-500">Metcalfe: n(n-1)/2</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Coordination</div><div className="text-2xl font-bold text-green-600">Active</div><div className="text-[10px] text-gray-500">Bots inter-entreprises</div></Card>
      </div>

      {/* Progression rabais */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Progression du rabais</h3>
        <div className="space-y-2">
          {[
            { count: 1, pct: 0, label: "Solo" }, { count: 3, pct: 10, label: "-10%" },
            { count: 5, pct: 15, label: "-15%" }, { count: 7, pct: 20, label: "-20%" },
            { count: 9, pct: 25, label: "-25% MAX" },
          ].map((tier) => (
            <div key={tier.count} className="flex items-center gap-3">
              <span className="text-xs w-16 text-gray-500">{tier.count} membre{tier.count > 1 ? "s" : ""}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", 5 >= tier.count ? "bg-emerald-500" : "bg-gray-200")} style={{ width: `${(tier.pct / 25) * 100}%` }} />
              </div>
              <Badge variant={5 >= tier.count ? "default" : "outline"} className="text-[10px] w-16 justify-center">{tier.label}</Badge>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 italic">Le palier atteint ne descend JAMAIS, meme si des membres quittent.</p>
      </Card>

      {/* Membres du cercle */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">Membres du cercle</h3>
          <Button size="sm" className="gap-1.5 text-xs"><Plus className="h-3 w-3" /> Inviter</Button>
        </div>
        <div className="space-y-2">
          {members.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">{m.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{m.name}</p>
                <p className="text-[10px] text-gray-400">{m.sector}</p>
              </div>
              <Badge variant="outline" className={cn("text-[10px]", m.status === "actif" ? "text-green-600 border-green-300" : "text-amber-600 border-amber-300")}>{m.status === "actif" ? "Actif" : "Invite"}</Badge>
              <span className="text-xs text-gray-500">{m.since}</span>
            </div>
          ))}
          {/* Places vides */}
          {[1, 2, 3, 4].map((i) => (
            <div key={`empty-${i}`} className="flex items-center gap-3 p-2 rounded-lg border border-dashed border-gray-200 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-300"><Plus className="h-4 w-4" /></div>
              <p className="text-sm text-gray-400">Place disponible</p>
            </div>
          ))}
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
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Matchs actifs</div><div className="text-2xl font-bold text-blue-600">3</div><div className="text-[10px] text-gray-500">En cours de validation</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Opportunites detectees</div><div className="text-2xl font-bold text-amber-600">7</div><div className="text-[10px] text-gray-500">Intra + Inter cercles</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Temps moyen matching</div><div className="text-2xl font-bold text-green-600">48h</div><div className="text-[10px] text-gray-500">vs 3-6 mois humain</div></Card>
      </div>

      {/* Matchs en cours */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Opportunites detectees par CarlOS</h3>
        {[
          { need: "Robot de soudage collaboratif", from: "Usinage Precision QC", match: "AutomaTech", score: 94, status: "negociation", value: "125K$" },
          { need: "Certification ISO 13485", from: "PlastiForm", match: "Expert externe", score: 87, status: "proposition", value: "15K$" },
          { need: "Optimisation logistique", from: "MetalPro Inc.", match: "LogiFlow", score: 91, status: "validation", value: "45K$" },
        ].map((match, i) => (
          <div key={i} className="p-3 rounded-lg border border-gray-100 mb-2 last:mb-0 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">{match.need}</p>
                <p className="text-[10px] text-gray-500">{match.from} → {match.match}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-[10px] mb-1">{match.value}</Badge>
                <div className="flex items-center gap-1">
                  <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${match.score}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-blue-600">{match.score}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-[9px]", match.status === "negociation" ? "bg-amber-100 text-amber-700" : match.status === "proposition" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700")} variant="outline">{match.status}</Badge>
              <span className="text-[10px] text-gray-400">Bots CFO/CTO/CSO negocient en parallele</span>
            </div>
          </div>
        ))}
      </Card>

      {/* Criteres de matching */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Moteur de Matching (P-420)</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Search className="h-4 w-4 text-blue-600 mb-1" />
            <p className="text-xs font-semibold text-blue-800">Intra-Cercle</p>
            <p className="text-[10px] text-blue-600">Recherche dans les 9 membres</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Network className="h-4 w-4 text-purple-600 mb-1" />
            <p className="text-xs font-semibold text-purple-800">Inter-Cercles</p>
            <p className="text-[10px] text-purple-600">Recherche dans tout le reseau</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <Zap className="h-4 w-4 text-amber-600 mb-1" />
            <p className="text-xs font-semibold text-amber-800">Co-Creation</p>
            <p className="text-[10px] text-amber-600">15+ cherchent la meme chose</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════
// SECTION: GOUVERNANCE
// ══════════════════════════════════════════

function GouvernancePage() {
  return (
    <div className="space-y-5">
      {/* 4 Axiomes */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">4 Axiomes Non-Negociables</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "Process > Gens", desc: "Roles structures et elus, pas de hierarchie classique", icon: Crown, color: "text-amber-600", bg: "bg-amber-50" },
            { title: "Domaine Souverain", desc: "Chaque cercle gere son propre perimetre independamment", icon: Shield, color: "text-blue-600", bg: "bg-blue-50" },
            { title: "Tension = Carburant", desc: "Les besoins non-resolus alimentent l'evolution du cercle", icon: Zap, color: "text-red-600", bg: "bg-red-50" },
            { title: "Evolution Continue", desc: "Une gouvernance change a la fois — pas de grands overhauls", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          ].map((ax, i) => {
            const AIcon = ax.icon;
            return (
              <div key={i} className={cn("p-3 rounded-lg border", ax.bg)}>
                <div className="flex items-center gap-2 mb-1">
                  <AIcon className={cn("h-4 w-4", ax.color)} />
                  <span className="text-xs font-bold text-gray-800">{ax.title}</span>
                </div>
                <p className="text-[10px] text-gray-600">{ax.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* TimeTokens */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">TimeTokens — Suivi des Contributions</h3>
        <p className="text-xs text-gray-500 mb-3">Chaque contribution est trackee automatiquement par les bots. Zero auto-declaration.</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-violet-50 rounded-lg border border-violet-200 text-center">
            <p className="text-lg font-bold text-violet-700">1,240</p>
            <p className="text-[10px] text-violet-600">TT accumules</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
            <p className="text-lg font-bold text-green-700">V1</p>
            <p className="text-[10px] text-green-600">Off-chain (SQLite)</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <p className="text-lg font-bold text-blue-700">5D</p>
            <p className="text-[10px] text-blue-600">VITAA x Impact x Momentum</p>
          </div>
        </div>
      </Card>

      {/* Matrice de sortie */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Matrice de Sortie — 4 Quadrants</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { q: "Q1", title: "Volontaire + Bons termes", desc: "Buyout TimeTokens, transition 90 jours", color: "bg-green-50 border-green-200 text-green-700" },
            { q: "Q2", title: "Volontaire + Conflit", desc: "Mediation CREDO-integrative, arbitrage neutre", color: "bg-amber-50 border-amber-200 text-amber-700" },
            { q: "Q3", title: "Involontaire (Performance)", desc: "3 niveaux d'avertissement, plan d'amelioration", color: "bg-orange-50 border-orange-200 text-orange-700" },
            { q: "Q4", title: "Involontaire (Externe)", desc: "Clause de succession, suppleant prend le relai", color: "bg-red-50 border-red-200 text-red-700" },
          ].map((q) => (
            <div key={q.q} className={cn("p-3 rounded-lg border", q.color)}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold">{q.q}</span>
                <span className="text-xs font-semibold">{q.title}</span>
              </div>
              <p className="text-[10px]">{q.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════
// SECTION: PIONNIERS BLEUS
// ══════════════════════════════════════════

function PionniersPage() {
  const sectors = [
    { name: "Usinage", status: "pris", company: "Usinage Precision QC" },
    { name: "Soudage", status: "pris", company: "MetalPro Inc." },
    { name: "Plastique", status: "prospect", company: "En discussion" },
    { name: "Automatisation", status: "pris", company: "AutomaTech" },
    { name: "Logistique", status: "pris", company: "LogiFlow" },
    { name: "Alimentaire", status: "disponible", company: "" },
    { name: "Pharmaceutique", status: "disponible", company: "" },
    { name: "Emballage", status: "prospect", company: "En discussion" },
    { name: "Electronique", status: "disponible", company: "" },
  ];

  const pris = sectors.filter(s => s.status === "pris").length;
  const prospects = sectors.filter(s => s.status === "prospect").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Places prises</div><div className="text-2xl font-bold text-indigo-600">{pris}/9</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">En discussion</div><div className="text-2xl font-bold text-amber-600">{prospects}</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Prix pionnier</div><div className="text-2xl font-bold text-green-600">1,350$</div><div className="text-[10px] text-gray-500">/mois · vs 1,800$ reg.</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Economie/an</div><div className="text-2xl font-bold text-green-600">5,400$</div><div className="text-[10px] text-gray-500">Garanti a vie</div></Card>
      </div>

      {/* Grille des 9 places */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">9 Places — 1 Leader par Secteur</h3>
        <div className="grid grid-cols-3 gap-2">
          {sectors.map((s, i) => (
            <div key={i} className={cn(
              "p-3 rounded-lg border text-center transition-all",
              s.status === "pris" ? "bg-indigo-50 border-indigo-200" :
              s.status === "prospect" ? "bg-amber-50 border-amber-200 border-dashed" :
              "bg-gray-50 border-gray-200 border-dashed hover:border-indigo-300 cursor-pointer"
            )}>
              <div className="flex items-center justify-center gap-1 mb-1">
                {s.status === "pris" ? <Check className="h-3 w-3 text-indigo-600" /> :
                 s.status === "prospect" ? <Clock className="h-3 w-3 text-amber-600" /> :
                 <Plus className="h-3 w-3 text-gray-400" />}
                <span className={cn("text-xs font-bold", s.status === "pris" ? "text-indigo-700" : s.status === "prospect" ? "text-amber-700" : "text-gray-500")}>{s.name}</span>
              </div>
              <p className="text-[10px] text-gray-500">{s.company || "Disponible"}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Offre Pioneer */}
      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <h3 className="text-sm font-bold text-indigo-800 mb-3">Offre Pionnier — Conditions a Vie</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users, label: "C-Suite complet (6 bots)", detail: "1,350$/mois (vs 1,800$) = -25% A VIE" },
            { icon: Star, label: "Ambassadeur Or automatique", detail: "Statut premium des le jour 1 (normalement 3 cercles + 25 membres)" },
            { icon: CheckCircle2, label: "Onboarding VIP gratuit", detail: "Carl s'assoit avec toi. Setup complet. Valeur 500$" },
            { icon: DollarSign, label: "Commission 5%", detail: "Tu recrutes tes partenaires → tu gagnes sur leur abonnement" },
          ].map((perk, i) => {
            const PIcon = perk.icon;
            return (
              <div key={i} className="flex items-start gap-2">
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
        <h3 className="text-sm font-bold text-gray-800 mb-2">Script de Rencontre — 45 min, 5 actes</h3>
        <div className="space-y-1.5">
          {[
            { act: "1", title: "Le Hook", dur: "5 min", desc: "Tu portes 8 chapeaux. Pas de CFO, pas de CTO. Tu geres des feux..." },
            { act: "2", title: "Demo Live", dur: "15 min", desc: "CarlOS sur iPad. Les mots s'ecrivent en temps reel. Moment WOW." },
            { act: "3", title: "Exclusivite", dur: "10 min", desc: "Tableau 9 places. 'Ton secteur est dispo. Je rencontre [concurrent] vendredi.'" },
            { act: "4", title: "Valeur", dur: "5 min", desc: "Un consultant = 5-10K$/mois. Toi = 6 cerveaux 24/7 pour 1,350$." },
            { act: "5", title: "Le Close", dur: "10 min", desc: "Direct / Competitif / Deadline 48h / Affordability (102$/jour ouvrable)" },
          ].map((act) => (
            <div key={act.act} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-bold shrink-0">{act.act}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-800">{act.title}</span>
                  <span className="text-[10px] text-gray-400">{act.dur}</span>
                </div>
                <p className="text-[10px] text-gray-500">{act.desc}</p>
              </div>
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
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Experts disponibles</div><div className="text-2xl font-bold text-orange-600">130+</div><div className="text-[10px] text-gray-500">Fournisseurs REAI</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Completion bot</div><div className="text-2xl font-bold text-blue-600">80%</div><div className="text-[10px] text-gray-500">Brouillon automatique</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Commission matching</div><div className="text-2xl font-bold text-green-600">15-20%</div><div className="text-[10px] text-gray-500">Par mandat expert</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Triple revenus</div><div className="text-2xl font-bold text-purple-600">3x</div><div className="text-[10px] text-gray-500">Sub + Commission + Membership</div></Card>
      </div>

      {/* Flow 80/20 */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Modele 80/20 — Bot + Expert</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <Zap className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-blue-800">Bot genere 80%</p>
            <p className="text-[10px] text-blue-600">Brouillon structure automatique</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-300 shrink-0" />
          <div className="flex-1 p-3 bg-orange-50 rounded-lg border border-orange-200 text-center">
            <GraduationCap className="h-5 w-5 text-orange-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-orange-800">Expert finalise 20%</p>
            <p className="text-[10px] text-orange-600">Revision, ajustement, validation</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-300 shrink-0" />
          <div className="flex-1 p-3 bg-green-50 rounded-lg border border-green-200 text-center">
            <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-green-800">Bot s'ameliore</p>
            <p className="text-[10px] text-green-600">Corrections = entrainement</p>
          </div>
        </div>
      </Card>

      {/* Mandats recents */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Mandats recents</h3>
        {[
          { type: "Contrat commercial", bot: "Legal Bot", expert: "Me Tremblay", status: "En cours", value: "2,500$" },
          { type: "Audit securite", bot: "Security Bot", expert: "Cyber Expert QC", status: "Complete", value: "8,000$" },
          { type: "Plan marketing digital", bot: "CMO Bot", expert: "—", status: "Brouillon 80%", value: "—" },
        ].map((m, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 border-b last:border-b-0 border-gray-50">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{m.type}</p>
              <p className="text-[10px] text-gray-400">{m.bot} → {m.expert}</p>
            </div>
            <Badge variant="outline" className="text-[10px]">{m.status}</Badge>
            <span className="text-xs font-bold text-gray-700">{m.value}</span>
          </div>
        ))}
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
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Prochain evenement</div><div className="text-lg font-bold text-rose-600">15 mars</div><div className="text-[10px] text-gray-500">Rassemblement Pionniers</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Frequence (Or)</div><div className="text-lg font-bold text-amber-600">Trim.</div><div className="text-[10px] text-gray-500">4x/an + diners prives</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Grande Offensive</div><div className="text-lg font-bold text-indigo-600">Sprint D</div><div className="text-[10px] text-gray-500">Expansion regionale</div></Card>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Calendrier des evenements</h3>
        {[
          { date: "15 mars", title: "Kickoff Pionniers Bleus", type: "Visio", desc: "Presentation des 9 pionniers. CarlOS configure les bots.", status: "confirme" },
          { date: "28 mars", title: "Demo Live — Coordination Inter-Bots", type: "Presentiel", desc: "Les bots collaborent en direct sur un cas reel du cercle.", status: "planifie" },
          { date: "Q2 2026", title: "Rassemblement Cercle #1", type: "Presentiel", desc: "Bilan, coordination, nouvelles opportunites. 9 membres reunis.", status: "a venir" },
        ].map((evt, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 mb-2 last:mb-0 border border-gray-100">
            <div className="w-16 text-center shrink-0">
              <p className="text-xs font-bold text-rose-600">{evt.date}</p>
              <Badge variant="outline" className="text-[9px] mt-1">{evt.type}</Badge>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{evt.title}</p>
              <p className="text-[10px] text-gray-500">{evt.desc}</p>
            </div>
            <Badge className={cn("text-[9px] shrink-0 h-fit", evt.status === "confirme" ? "bg-green-100 text-green-700" : evt.status === "planifie" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600")} variant="outline">{evt.status}</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════
// SECTION: BENCHMARK
// ══════════════════════════════════════════

function BenchmarkPage() {
  const pillars = [
    { letter: "V", name: "Vente", score: 72, avg: 65, color: "bg-blue-500" },
    { letter: "I", name: "Idee", score: 45, avg: 55, color: "bg-purple-500" },
    { letter: "T", name: "Temps", score: 88, avg: 70, color: "bg-emerald-500" },
    { letter: "A", name: "Argent", score: 31, avg: 50, color: "bg-amber-500" },
    { letter: "A", name: "Actif", score: 62, avg: 60, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-5">
      {/* VITAA Comparison */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Benchmark VITAA — Toi vs Secteur</h3>
        <div className="space-y-3">
          {pillars.map((p) => (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 w-4">{p.letter}</span>
                  <span className="text-sm text-gray-700">{p.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={cn("font-bold", p.score >= p.avg ? "text-green-600" : "text-red-600")}>Toi: {p.score}</span>
                  <span className="text-gray-400">Secteur: {p.avg}</span>
                </div>
              </div>
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full opacity-30")} style={{ width: `${p.avg}%`, backgroundColor: "gray" }} />
                <div className={cn("h-full rounded-full absolute top-0 left-0", p.color)} style={{ width: `${p.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3 types de benchmark */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 border-l-4 border-blue-300">
          <BarChart3 className="h-4 w-4 text-blue-600 mb-1" />
          <p className="text-xs font-bold text-gray-800">Externe</p>
          <p className="text-[10px] text-gray-500">vs competiteurs et mediane sectorielle</p>
        </Card>
        <Card className="p-3 border-l-4 border-emerald-300">
          <Users className="h-4 w-4 text-emerald-600 mb-1" />
          <p className="text-xs font-bold text-gray-800">Pairs (Cercle)</p>
          <p className="text-[10px] text-gray-500">vs les 8 autres membres (anonymise)</p>
        </Card>
        <Card className="p-3 border-l-4 border-violet-300">
          <TrendingUp className="h-4 w-4 text-violet-600 mb-1" />
          <p className="text-xs font-bold text-gray-800">Historique</p>
          <p className="text-[10px] text-gray-500">Ta trajectoire sur 6 mois</p>
        </Card>
      </div>

      {/* Triangle du Feu */}
      <Card className="p-4 bg-red-50 border-red-200">
        <div className="flex items-center gap-3">
          <Flame className="h-6 w-6 text-red-600" />
          <div>
            <p className="text-sm font-bold text-red-800">Triangle du Feu: COUVE</p>
            <p className="text-xs text-red-600">2 piliers en risque (Idee 45, Argent 31). Intervention ciblee recommandee.</p>
          </div>
        </div>
      </Card>
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
        <h3 className="text-sm font-bold text-gray-800 mb-3">Fil d'Actualite</h3>
        {[
          { time: "Il y a 2h", title: "3 partenaires potentiels detectes", desc: "Le Matching Engine a identifie des fournisseurs compatibles pour ton projet robotique", type: "opportunite", icon: Search },
          { time: "Hier", title: "Cercle atteint 5 membres", desc: "Rabais passe a -15%. Prochaine etape: 7 membres = -20%", type: "jalon", icon: CheckCircle2 },
          { time: "2 jours", title: "47K$ en nouvelles opportunites", desc: "Ton bot CFO a identifie 3 optimisations de couts pour ce mois", type: "performance", icon: TrendingUp },
          { time: "3 jours", title: "Nouveau member: AutomaTech", desc: "Integration robotique rejoint ton cercle. Bots connectes.", type: "reseau", icon: Users },
          { time: "1 sem", title: "Rapport mensuel disponible", desc: "Performance de tes 6 bots C-Level — 124 taches completees", type: "rapport", icon: BarChart3 },
        ].map((news, i) => {
          const NIcon = news.icon;
          return (
            <div key={i} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 border-b last:border-b-0 border-gray-50">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                news.type === "opportunite" ? "bg-blue-100" : news.type === "jalon" ? "bg-green-100" : news.type === "performance" ? "bg-amber-100" : news.type === "reseau" ? "bg-emerald-100" : "bg-gray-100"
              )}>
                <NIcon className={cn("h-3.5 w-3.5",
                  news.type === "opportunite" ? "text-blue-600" : news.type === "jalon" ? "text-green-600" : news.type === "performance" ? "text-amber-600" : news.type === "reseau" ? "text-emerald-600" : "text-gray-600"
                )} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-800">{news.title}</p>
                  <span className="text-[10px] text-gray-400">{news.time}</span>
                </div>
                <p className="text-xs text-gray-500">{news.desc}</p>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════
// SECTION: TRG INDUSTRIE
// ══════════════════════════════════════════

function TrgIndustriePage() {
  return (
    <div className="space-y-5">
      {/* Metriques industrie */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Salaire moyen ingenieur</div><div className="text-lg font-bold text-teal-600">92K$</div><div className="text-[10px] text-gray-500">Quebec 2025</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Taux adoption IA</div><div className="text-lg font-bold text-blue-600">23%</div><div className="text-[10px] text-gray-500">PME manufacturieres QC</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Cout moyen par robot</div><div className="text-lg font-bold text-orange-600">185K$</div><div className="text-[10px] text-gray-500">Robot collaboratif (cobot)</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">OEE moyen secteur</div><div className="text-lg font-bold text-green-600">67%</div><div className="text-[10px] text-gray-500">vs 85% world-class</div></Card>
      </div>

      {/* 4 Instances */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">4 Instances — Vues par Role</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "Usine Bleue (Admin)", sub: "admin.usinebleue.ai", icon: Building2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", desc: "Dashboard complet, tous les bots, CRM, matching, Data Room", role: "Orchestrateur" },
            { name: "Manufacturier", sub: "app.usinebleue.ai", icon: Factory, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Chat CarlOS, diagnostic, Mon Usine (OEE/KPIs), cahier projet", role: "Client" },
            { name: "Fournisseur", sub: "partner.usinebleue.ai", icon: Wrench, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", desc: "Profil competences, opportunites matchees, soumissions", role: "Partenaire" },
            { name: "Expert Solo", sub: "expert.usinebleue.ai", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", desc: "Mandats ponctuels, outils diagnostics, formation CREDO", role: "Expert" },
          ].map((inst) => {
            const IIcon = inst.icon;
            return (
              <div key={inst.name} className={cn("p-3 rounded-lg border-l-4", inst.border, inst.bg)}>
                <div className="flex items-center gap-2 mb-1">
                  <IIcon className={cn("h-4 w-4", inst.color)} />
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
        <h3 className="text-sm font-bold text-gray-800 mb-3">Sources de Donnees — CMO Sub-Bot</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { source: "StatCan", type: "Federal", freq: "Annuel" },
            { source: "STIQ", type: "Quebec", freq: "Trim." },
            { source: "MEI", type: "Quebec", freq: "Annuel" },
            { source: "Deloitte Manuf.", type: "Global", freq: "Annuel" },
            { source: "Reseau Orbit9", type: "Proprietaire", freq: "Continu" },
            { source: "Sondages UB", type: "Proprietaire", freq: "Mensuel" },
          ].map((s) => (
            <div key={s.source} className="p-2 rounded bg-teal-50 border border-teal-200">
              <p className="text-xs font-bold text-teal-800">{s.source}</p>
              <p className="text-[10px] text-teal-600">{s.type} · {s.freq}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Lead Magnet */}
      <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
        <div className="flex items-start gap-3">
          <Globe className="h-6 w-6 text-teal-600 mt-1 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-teal-800">Rapport Annuel de l'Industrie — Lead Magnet</h3>
            <p className="text-xs text-teal-700 mt-1">Usine Bleue publie LE rapport de reference du manufacturier au Quebec. Position centrale credible = donnees uniques. Les prospects telechargeront le rapport → entreront dans le funnel → decouvrent CarlOS → deviennent clients.</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-[9px] text-teal-700 border-teal-300">50+ entreprises = donnees significatives</Badge>
              <Badge variant="outline" className="text-[9px] text-teal-700 border-teal-300">Sprint D+</Badge>
            </div>
          </div>
        </div>
      </Card>
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
      <div className="flex-1 overflow-auto p-5 max-w-4xl">
        <Renderer />
      </div>
    </div>
  );
}
