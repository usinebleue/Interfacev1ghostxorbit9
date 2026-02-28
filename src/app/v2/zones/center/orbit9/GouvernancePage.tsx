/**
 * GouvernancePage.tsx — Gouvernance Augmentee par IA
 * Systeme Holacratique avec Agents IA
 * Extrait de Orbit9DetailView monolithique
 */

import { useState } from "react";
import {
  Users, CheckCircle2, Eye, ChevronRight, Scale,
  Zap, RefreshCw, Layers, Lock, BookOpen, DollarSign,
  AlertTriangle, Shield, Check, X,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";

interface GouvernancePageProps {
  onNavigate?: (section: string) => void;
}

export function GouvernancePage({ onNavigate }: GouvernancePageProps) {
  const [activeTab, setActiveTab] = useState("principes");

  const tabs = [
    { id: "principes", label: "Principes", icon: BookOpen },
    { id: "roles", label: "Roles", icon: Users },
    { id: "timetokens", label: "TimeTokens", icon: DollarSign },
    { id: "sortie", label: "Matrice Sortie", icon: Scale },
  ];

  return (
    <div className="space-y-5">
      {/* Header Card avec gradient + sub-tabs a droite */}
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 border-b">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Gouvernance Augmentee par IA</span>
            <div className="flex gap-1 ml-auto">
              {tabs.map((tab) => {
                const TIcon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer",
                    activeTab === tab.id ? "bg-white/90 text-violet-800 shadow-sm" : "text-white/70 hover:bg-white/20 hover:text-white"
                  )}>
                    <TIcon className="h-3 w-3" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-gray-600">Le pouvoir ne reside pas dans une personne mais dans un PROCESSUS defini. Inspire Holacracy — adapte pour la collaboration IA + Humain.</p>
        </div>
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

          {/* Cross-link vers Cellules */}
          {onNavigate && (
            <Card className="p-3 bg-emerald-50 border-emerald-200 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => onNavigate("cellules")}>
              <p className="text-xs text-emerald-700">Ces regles s'appliquent a toutes les <strong>Cellules Orbit9</strong>. <span className="underline">Voir les Cellules actives →</span></p>
            </Card>
          )}
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
