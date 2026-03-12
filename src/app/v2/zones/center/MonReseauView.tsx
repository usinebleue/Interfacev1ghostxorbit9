/**
 * MonReseauView.tsx — Mon Reseau (fusion RD.8 + FE.9)
 * 10 tabs: Profil, Cellules, Jumelage, Chantiers Reseau, Pionniers, Gouvernance, Dashboard, Nouvelles, Evenements, Industrie
 * Utilise SectionFrame pour la coherence visuelle
 * Reutilise les pages existantes + enrichissements FE.9
 */

import { useState } from "react";
import {
  Network, Shield, Handshake, Flame, Users, BarChart3,
  Clock, Lock, Star,
  CheckCircle2, AlertTriangle, Eye, Globe,
  Activity, Gauge, TrendingUp, Zap,
  Award,
  Bot, Video, Bell, Sparkles, Crown,
  FileText, BookOpen, GraduationCap, ArrowRight,
  Rocket, Newspaper, Calendar,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { ReseauSection } from "../../context/FrameMasterContext";
import { SectionFrame } from "./shared/SectionFrame";
import { HierarchieGHML } from "./shared/HierarchieGHML";
import type { TabDef } from "./shared/section-types";

// Reuse existing pages (NO duplication)
import { CellulesPage } from "./orbit9/CellulesPage";
import { JumelageLivePage } from "./orbit9/JumelageLivePage";
import { PionniersPage } from "./orbit9/PionniersPage";
import { GouvernancePage } from "./orbit9/GouvernancePage";
import { NouvellesPage } from "./orbit9/NouvellesPage";
import { EvenementsPage } from "./orbit9/EvenementsPage";
import { TrgIndustriePage } from "./orbit9/TrgIndustriePage";

// ================================================================
// TYPES
// ================================================================

type ReseauTabId = ReseauSection;

interface Membre {
  id: string;
  nom: string;
  type: "manufacturier" | "integrateur" | "equipementier" | "distributeur" | "consultant";
  secteur: string;
  ville: string;
  stadeOrbit9: number;
  specialites: string[];
  nbEmployes: number;
  vitaaScore: number;
}


// ================================================================
// DATA — Profil entreprise (FE.9)
// ================================================================

const PROFIL = {
  nom: "Usine Bleue AI",
  type: "Integrateur en automatisation & IA",
  secteur: "Automatisation industrielle",
  ville: "Montreal, QC",
  employes: 8,
  fondee: 2024,
  stadeOrbit9: 7,
  vitaaScore: 82,
  scoreReputation: 92,
  nbCollaborations: 14,
  specialites: ["IA industrielle", "Gestion CEO augmentee", "Diagnostic VITAA", "Automatisation 4.0"],
};

const CERTIFICATIONS = [
  { label: "ISO 9001:2015", cat: "Qualite", status: "verifie", exp: "2027-03" },
  { label: "ISO 14001", cat: "Environnement", status: "verifie", exp: "2027-06" },
  { label: "C-TPAT", cat: "Securite", status: "verifie", exp: "2027-01" },
  { label: "RBQ", cat: "Construction", status: "en-cours", exp: "2026-12" },
  { label: "Programme Innovation MEI", cat: "Innovation", status: "verifie", exp: "2028-01" },
  { label: "Assurance 2M$", cat: "Responsabilite", status: "verifie", exp: "2027-03" },
];

const AVIS = [
  { auteur: "MetalPro Sherbrooke", role: "Manufacturier", score: 5, texte: "Integration robotique impeccable. CarlOS nous a fait gagner 3 semaines.", date: "2026-02" },
  { auteur: "FroidTech Solutions", role: "Equipementier", score: 4, texte: "Bon diagnostic VITAA, recommandations actionnables. Follow-up proactif.", date: "2026-01" },
  { auteur: "AutomaTech Inc.", role: "Integrateur", score: 5, texte: "Le jumelage Orbit9 fonctionne. 2 projets concrets en 3 mois.", date: "2026-03" },
  { auteur: "Precision CNC Beauce", role: "Manufacturier", score: 4, texte: "Audit energetique precis. Subventions identifiees rapidement.", date: "2026-02" },
];

// ================================================================
// DATA — Membres et Cellules (RD.8)
// ================================================================

const MEMBRES: Membre[] = [
  { id: "M-001", nom: "Usine Bleue AI", type: "integrateur", secteur: "Automatisation & IA", ville: "Montreal", stadeOrbit9: 7, specialites: ["IA industrielle", "Diagnostic VITAA"], nbEmployes: 8, vitaaScore: 82 },
  { id: "M-002", nom: "MetalPro Sherbrooke", type: "manufacturier", secteur: "Metallurgie", ville: "Sherbrooke", stadeOrbit9: 3, specialites: ["Usinage CNC", "Soudage robotise"], nbEmployes: 85, vitaaScore: 61 },
  { id: "M-003", nom: "TechnoBot QC", type: "equipementier", secteur: "Robotique", ville: "Quebec", stadeOrbit9: 5, specialites: ["Cobots UR", "Vision industrielle"], nbEmployes: 22, vitaaScore: 74 },
  { id: "M-004", nom: "Alimentation Boreal", type: "manufacturier", secteur: "Agroalimentaire", ville: "Saguenay", stadeOrbit9: 2, specialites: ["Transformation alimentaire", "HACCP"], nbEmployes: 120, vitaaScore: 48 },
  { id: "M-005", nom: "FroidTech Solutions", type: "equipementier", secteur: "Refrigeration", ville: "Trois-Rivieres", stadeOrbit9: 4, specialites: ["Systemes froid", "NH3"], nbEmployes: 35, vitaaScore: 67 },
  { id: "M-006", nom: "PackPro International", type: "equipementier", secteur: "Emballage", ville: "Laval", stadeOrbit9: 4, specialites: ["Emballage auto", "Palettisation"], nbEmployes: 45, vitaaScore: 71 },
  { id: "M-007", nom: "AutomaTech Inc.", type: "integrateur", secteur: "Automatisation", ville: "Drummondville", stadeOrbit9: 5, specialites: ["PLC", "SCADA", "MES"], nbEmployes: 18, vitaaScore: 78 },
  { id: "M-008", nom: "SoudurePlus", type: "distributeur", secteur: "Soudage", ville: "Granby", stadeOrbit9: 3, specialites: ["Lincoln/Miller", "Formation soudeurs"], nbEmployes: 28, vitaaScore: 59 },
  { id: "M-009", nom: "Precision CNC Beauce", type: "manufacturier", secteur: "Usinage", ville: "Saint-Georges", stadeOrbit9: 4, specialites: ["Usinage 5 axes", "Prototypage"], nbEmployes: 62, vitaaScore: 65 },
  { id: "M-010", nom: "EcoVert Energie", type: "consultant", secteur: "Efficacite energetique", ville: "Sherbrooke", stadeOrbit9: 3, specialites: ["Audit energetique", "Subventions"], nbEmployes: 6, vitaaScore: 72 },
  { id: "M-011", nom: "QC Plasturgie", type: "manufacturier", secteur: "Plasturgie", ville: "Victoriaville", stadeOrbit9: 2, specialites: ["Injection plastique", "Moules"], nbEmployes: 95, vitaaScore: 52 },
  { id: "M-012", nom: "Robotik Solutions", type: "integrateur", secteur: "Robotique", ville: "Levis", stadeOrbit9: 6, specialites: ["Fanuc", "ABB", "Simulation 3D"], nbEmployes: 15, vitaaScore: 81 },
];

const CELLULES = [
  { id: "CELL-001", nom: "Cellule Alpha — Metal & Robot", membres: ["MetalPro Sherbrooke", "TechnoBot QC", "SoudurePlus"], score: 87, status: "active" as const, nbChantiers: 2, secteur: "Metallurgie + Automatisation" },
  { id: "CELL-002", nom: "Cellule Beta — Agroalimentaire 4.0", membres: ["Alimentation Boreal", "FroidTech Solutions", "PackPro International"], score: 79, status: "active" as const, nbChantiers: 1, secteur: "Agroalimentaire + Chaine du froid" },
  { id: "CELL-003", nom: "Cellule Gamma — Usinage Avance", membres: ["Precision CNC Beauce", "AutomaTech Inc.", "EcoVert Energie"], score: 72, status: "formation" as const, nbChantiers: 1, secteur: "Usinage + Efficacite" },
  { id: "CELL-004", nom: "Cellule Delta — Plasturgie Verte", membres: ["QC Plasturgie", "Robotik Solutions", "EcoVert Energie"], score: 68, status: "prospect" as const, nbChantiers: 0, secteur: "Plasturgie + Decarbonation" },
];


const TYPE_MEMBER_COLORS: Record<string, string> = {
  manufacturier: "from-blue-600 to-blue-500",
  integrateur: "from-violet-600 to-violet-500",
  equipementier: "from-emerald-600 to-emerald-500",
  distributeur: "from-amber-600 to-amber-500",
  consultant: "from-teal-600 to-teal-500",
};

const CELLULE_STATUS_CFG: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: "Active", bg: "bg-emerald-100", text: "text-emerald-700" },
  formation: { label: "En formation", bg: "bg-amber-100", text: "text-amber-700" },
  prospect: { label: "Prospect", bg: "bg-gray-100", text: "text-gray-600" },
};

// ================================================================
// TABS CONFIG
// ================================================================

const RESEAU_TABS: TabDef[] = [
  { id: "profil", label: "Mon Profil", icon: Shield },
  { id: "cellules", label: "Mes Cellules", icon: Handshake },
  { id: "jumelage", label: "Jumelage", icon: Network },
  { id: "chantiers", label: "Chantiers Reseau", icon: Flame },
  { id: "pionniers", label: "Pionniers", icon: Users },
  { id: "gouvernance", label: "Gouvernance", icon: Award },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "nouvelles", label: "Nouvelles", icon: Newspaper },
  { id: "evenements", label: "Evenements", icon: Calendar },
  { id: "industrie", label: "Industrie", icon: Globe },
];

// ================================================================
// MEMBRE BADGE
// ================================================================

function MembreBadge({ nom, type }: { nom: string; type?: string }) {
  const gradient = TYPE_MEMBER_COLORS[type || ""] || "from-gray-600 to-gray-500";
  return (
    <span className={cn("text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-gradient-to-r", gradient)}>
      {nom.split(" ")[0]}
    </span>
  );
}

// ================================================================
// TAB: MON PROFIL (from FE.9)
// ================================================================

function TabProfil() {
  return (
    <div className="space-y-4">
      {/* Fiche Entreprise */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">{PROFIL.nom}</h3>
              <p className="text-[9px] text-white/70">{PROFIL.type} — {PROFIL.ville}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="text-[9px] bg-white/20 text-white border-0">Stade {PROFIL.stadeOrbit9}/9</Badge>
              <Badge className="text-[9px] bg-emerald-500/30 text-white border-0">Verifie</Badge>
            </div>
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{PROFIL.vitaaScore}</div>
            <div className="text-[9px] text-gray-500">Score VITAA</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{PROFIL.scoreReputation}/100</div>
            <div className="text-[9px] text-gray-500">Reputation</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">{PROFIL.nbCollaborations}</div>
            <div className="text-[9px] text-gray-500">Collaborations</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-violet-600">{PROFIL.employes}</div>
            <div className="text-[9px] text-gray-500">Employes</div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {PROFIL.specialites.map(s => (
              <span key={s} className="text-[9px] px-2 py-0.5 bg-orange-50 text-orange-700 rounded font-medium">{s}</span>
            ))}
          </div>
        </div>
      </Card>

      {/* Certifications */}
      <Card className="p-4 space-y-3">
        <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-orange-500" />
          Certifications & Sceaux
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CERTIFICATIONS.map(cert => (
            <div key={cert.label} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", cert.status === "verifie" ? "text-emerald-500" : "text-amber-500")} />
              <div>
                <div className="text-[9px] font-bold text-gray-700">{cert.label}</div>
                <div className="text-[9px] text-gray-400">{cert.cat} — exp. {cert.exp}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Avis */}
      <Card className="p-4 space-y-3">
        <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-amber-500" />
          Avis & References ({AVIS.length})
        </h3>
        <div className="space-y-2">
          {AVIS.map((a, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-gray-700">{a.auteur}</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={cn("h-3.5 w-3.5", s <= a.score ? "text-amber-400 fill-amber-400" : "text-gray-200")} />
                  ))}
                </div>
              </div>
              <p className="text-[9px] text-gray-600 leading-relaxed">{a.texte}</p>
              <span className="text-[9px] text-gray-400">{a.role} — {a.date}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Confiance Bidirectionnelle (FE.9) */}
      <Card className="p-4 space-y-3">
        <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <Handshake className="h-3.5 w-3.5 text-violet-500" />
          Confiance Bidirectionnelle
        </h3>
        <p className="text-[9px] text-gray-500 italic">
          La confiance se joue des deux cotes. Donneurs d'ordre ET fournisseurs se qualifient mutuellement.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-[9px] font-bold text-blue-700 uppercase tracking-widest mb-2">Donneur d'Ordre</div>
            <ul className="space-y-1 text-[9px] text-gray-700">
              {["Historique paiements a temps", "Clarte des specifications", "Respect des engagements", "Communication reactive", "Volume contrats recurrents"].map((item) => (
                <li key={item} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest mb-2">Fournisseur / Sous-Traitant</div>
            <ul className="space-y-1 text-[9px] text-gray-700">
              {["Livraison dans les delais", "Qualite conforme (taux rejet)", "Certifications a jour", "Capacite reelle vs annoncee", "Support apres-vente"].map((item) => (
                <li key={item} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Visibilite & Controle */}
      <Card className="p-4 space-y-3">
        <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5 text-blue-500" />
          Visibilite & Controle des Donnees
        </h3>
        <p className="text-[9px] text-gray-500 mb-1">Vous controlez ce que les autres membres voient avant un matching Orbit9.</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Nom entreprise", visible: true },
            { label: "Secteur & specialites", visible: true },
            { label: "Certifications", visible: true },
            { label: "Score reputation", visible: true },
            { label: "Nb employes", visible: true },
            { label: "Chiffre d'affaires", visible: false },
            { label: "Clients actuels", visible: false },
            { label: "Avis detailles", visible: true },
            { label: "Donnees financieres", visible: false },
          ].map((item) => (
            <div key={item.label} className={cn(
              "flex items-center gap-1.5 p-2 rounded-lg text-[9px] border font-medium",
              item.visible ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-400",
            )}>
              {item.visible ? <Eye className="h-3.5 w-3.5 shrink-0" /> : <Lock className="h-3.5 w-3.5 shrink-0" />}
              {item.label}
            </div>
          ))}
        </div>
      </Card>

      {/* Processus de Selection Rigoureux (FE.9) */}
      <Card className="p-4 space-y-3 bg-gradient-to-br from-orange-50/50 to-amber-50/50 border-orange-200">
        <h3 className="text-xs font-bold text-orange-800 flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-orange-600" />
          Processus de Selection Rigoureux (inspire REAI)
        </h3>
        <p className="text-[9px] text-gray-600 italic">
          Reseau elite augmente AI — on ne prend pas n'importe qui. Meme les fournisseurs invites gratuitement passent par le processus complet.
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { step: "1", title: "Invitation", desc: "Client UB a besoin d'un fournisseur → CarlOS invite le prospect gratuitement", icon: Bell },
            { step: "2", title: "Qualification AI", desc: "CarlOS valide: reputation web, NEQ, LinkedIn, references, certifications, litiges, sante financiere", icon: Bot },
            { step: "3", title: "Criteres REAI", desc: "Entreprise 2+ ans, assurances valides, 0 litige majeur, 1+ certification, 2+ references, charte signee", icon: CheckCircle2 },
            { step: "4", title: "Admission", desc: "Score calcule → Profil cree → Sceaux verifies → CarlOS assigne → Premier jumelage possible", icon: Crown },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="p-2.5 bg-white/80 rounded-lg border border-orange-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-black bg-orange-200 text-orange-800 w-4 h-4 rounded-full flex items-center justify-center">{s.step}</span>
                  <Icon className="h-3.5 w-3.5 text-orange-600" />
                  <span className="text-[9px] font-bold text-orange-800">{s.title}</span>
                </div>
                <p className="text-[9px] text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="p-2 bg-orange-100/60 rounded-lg">
          <p className="text-[9px] text-orange-800 font-semibold text-center">
            FLYWHEEL: Fournisseur invite gratuitement → decouvre CarlOS → devient client → invite SES fournisseurs → reseau grossit
          </p>
        </div>
      </Card>
    </div>
  );
}


// ================================================================
// TAB: DASHBOARD (from FE.9)
// ================================================================

function TabDashboard() {
  return (
    <div className="space-y-4">
      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Heures Sauvees", value: "340h", sub: "Cumulatif reseau", color: "emerald", icon: Clock },
          { label: "Interventions CarlOS", value: "127", sub: "Mediations actives", color: "blue", icon: Activity },
          { label: "Valeur Contrats", value: "1.31M$", sub: "Pipeline actif", color: "violet", icon: TrendingUp },
          { label: "Score Reseau", value: "87/100", sub: "Sante moyenne", color: "orange", icon: Gauge },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-0 overflow-hidden">
              <div className={cn("flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r", `from-${kpi.color}-600 to-${kpi.color}-500`)}>
                <Icon className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white uppercase">{kpi.label}</span>
              </div>
              <div className="px-3 py-2">
                <div className={cn("text-xl font-bold", `text-${kpi.color}-600`)}>{kpi.value}</div>
                <div className="text-[9px] text-gray-400">{kpi.sub}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ROI Detaille */}
      <Card className="p-4 space-y-3">
        <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5 text-violet-500" />
          ROI Detaille
        </h3>
        <div className="space-y-2">
          {[
            { label: "Retards interceptes", value: "23", gain: "68 000$", color: "emerald" },
            { label: "Malentendus resolus", value: "47", gain: "32 000$", color: "blue" },
            { label: "Action items auto", value: "156", gain: "45h economisees", color: "violet" },
            { label: "Tensions detectees", value: "12", gain: "3 conflits evites", color: "orange" },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <span className="text-[9px] text-gray-700">{r.label}</span>
              <div className="flex items-center gap-3">
                <span className={cn("text-xs font-bold", `text-${r.color}-600`)}>{r.value}</span>
                <span className="text-[9px] text-gray-500">{r.gain}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sante des Cellules */}
      <Card className="p-4 space-y-3">
        <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5 text-emerald-500" />
          Sante des Cellules
        </h3>
        <div className="space-y-2">
          {CELLULES.filter(c => c.status === "active").map(cell => {
            const cfg = CELLULE_STATUS_CFG[cell.status];
            return (
              <div key={cell.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-800">{cell.nom}</span>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", cfg.bg, cfg.text)}>{cfg.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={cn("h-2 rounded-full", cell.score >= 80 ? "bg-emerald-500" : cell.score >= 60 ? "bg-amber-500" : "bg-red-500")}
                      style={{ width: `${cell.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{cell.score}/100</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[9px] text-gray-500">
                  <span>{cell.nbChantiers} chantiers</span>
                  <span>{cell.membres.length} membres</span>
                  <span>{cell.secteur}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Membres du reseau */}
      <Card className="p-4 space-y-3">
        <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-blue-500" />
          Membres du Reseau ({MEMBRES.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {MEMBRES.map(m => (
            <div key={m.id} className="p-2.5 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MembreBadge nom={m.nom} type={m.type} />
                <span className="text-[9px] font-bold text-gray-700 flex-1 truncate">{m.nom}</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-gray-500">
                <span>{m.ville}</span>
                <span>VITAA {m.vitaaScore}</span>
                <span>S{m.stadeOrbit9}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// ENRICHMENT COMPONENTS (from FE.9)
// ================================================================

const JUMELAGES_PIPELINE = [
  { id: "J-001", client: "MetalPro Sherbrooke", besoin: "Robot soudage MIG/TIG automatise", etape: "cahier" as const, dateDetection: "2026-02-10" },
  { id: "J-002", client: "QC Plasturgie", besoin: "Cellule injection automatisee + vision qualite", etape: "qualification" as const, dateDetection: "2026-03-01" },
  { id: "J-003", client: "Alimentation Boreal", besoin: "Emballage automatise ligne #3 — HACCP", etape: "match" as const, dateDetection: "2026-01-20" },
  { id: "J-004", client: "SoudurePlus", besoin: "Upgrade torches robotisees Lincoln", etape: "detection" as const, dateDetection: "2026-03-08" },
];

const ETAPES_JUMELAGE = [
  { id: "detection", label: "Detection CarlOS", desc: "CarlOS detecte le bon moment (VITAA, conversations)", icon: Sparkles, color: "text-amber-500" },
  { id: "qualification", label: "Qualification & Upload", desc: "Kit complet: specs, budgets, dessins, echeancier", icon: FileText, color: "text-blue-600" },
  { id: "cahier", label: "Cahier de Jumelage", desc: "CarlOS genere le document structure pro", icon: BookOpen, color: "text-violet-600" },
  { id: "validation", label: "Validation Expert", desc: "Expert humain valide avant envoi au fournisseur", icon: CheckCircle2, color: "text-emerald-600" },
  { id: "match", label: "Match & Contrat", desc: "Rencontre → Negociation → Contrat signe", icon: Handshake, color: "text-green-600" },
];

function CarlOSMediateurCard() {
  return (
    <Card className="p-4 space-y-3 bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200">
      <div className="flex items-center gap-2">
        <Bot className="h-3.5 w-3.5 text-violet-600" />
        <h3 className="text-xs font-bold text-violet-800">CarlOS — Mediateur Proactif dans les Meetings</h3>
        <Badge className="text-[9px] bg-violet-100 text-violet-700 border-violet-200 ml-auto">Futur</Badge>
      </div>
      <p className="text-[9px] text-gray-600 italic">
        CarlOS ecoute les meetings entre membres d'une cellule, detecte les tensions en temps reel,
        intervient pour corriger les interactions et genere automatiquement les action items.
      </p>
      <div className="space-y-1.5">
        {[
          { type: "intervention", texte: "Detection: SoudurePlus a dit « on va essayer » — langage flou avec historique 2 retards/3. Intervention envoyee.", time: "il y a 2h" },
          { type: "action", texte: "Action items generes du meeting du 8 mars: 4 taches assignees automatiquement.", time: "hier" },
          { type: "alerte", texte: "Budget chantier CR-1 a 78% — recommandation: reviser scope PR-1.3 avant depassement.", time: "il y a 3 jours" },
        ].map((log, i) => (
          <div key={i} className="flex items-start gap-2 p-2 bg-white/70 rounded border border-violet-100">
            {log.type === "intervention" && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />}
            {log.type === "action" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />}
            {log.type === "alerte" && <Bell className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className="text-[9px] text-gray-700">{log.texte}</p>
              <span className="text-[9px] text-gray-400">{log.time}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Transcription live", desc: "Deepgram capte chaque mot en temps reel", icon: Activity },
          { label: "Detection tensions", desc: "Analyse semantique des engagements flous", icon: AlertTriangle },
          { label: "Actions auto", desc: "Taches assignees sans effort humain", icon: CheckCircle2 },
        ].map((feat) => {
          const Icon = feat.icon;
          return (
            <div key={feat.label} className="p-2 bg-white/60 rounded border border-violet-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-[9px] font-bold text-violet-800">{feat.label}</span>
              </div>
              <p className="text-[9px] text-gray-600">{feat.desc}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function MeetingsCelluleCard() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Video className="h-3.5 w-3.5 text-blue-600" />
        <h3 className="text-xs font-bold text-gray-800">Meetings Cellule — Prochains</h3>
        <Badge className="text-[9px] bg-blue-100 text-blue-700 border-blue-200 ml-auto">LiveKit</Badge>
      </div>
      <p className="text-[9px] text-gray-500 italic">
        Meetings SUR la plateforme. CarlOS transcrit, detecte les tensions et genere les action items en temps reel.
      </p>
      <div className="space-y-2">
        {[
          { cellule: "Alpha — Metal & Robot", date: "2026-03-12 14:00", participants: ["Usine Bleue", "MetalPro", "TechnoBot"], sujet: "Revue avancement soudage robotise + budget Phase 2", status: "planifie" },
          { cellule: "Beta — Agroalimentaire 4.0", date: "2026-03-14 10:00", participants: ["Alimentation Boreal", "FroidTech", "PackPro"], sujet: "Kick-off Chaine du Froid 4.0 — specs + echeancier", status: "planifie" },
          { cellule: "Alpha — Metal & Robot", date: "2026-03-08 14:00", participants: ["Usine Bleue", "MetalPro", "TechnoBot"], sujet: "Revue specs torches Lincoln — validation devis", status: "termine" },
        ].map((meeting) => (
          <div key={meeting.date + meeting.cellule} className={cn(
            "flex items-center gap-3 p-3 rounded-lg border",
            meeting.status === "termine" ? "bg-gray-50 border-gray-200" : "bg-blue-50/50 border-blue-200",
          )}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              meeting.status === "termine" ? "bg-gray-100" : "bg-blue-100",
            )}>
              <Video className={cn("h-4 w-4", meeting.status === "termine" ? "text-gray-400" : "text-blue-600")} />
            </div>
            <div className="flex-1">
              <div className="text-[9px] font-bold text-gray-800">{meeting.cellule}</div>
              <div className="text-[9px] text-gray-600">{meeting.sujet}</div>
              <div className="flex items-center gap-1.5 mt-1">
                {meeting.participants.map((p) => (
                  <span key={p} className="text-[9px] bg-white text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">{p}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[9px] font-bold text-gray-700">{meeting.date}</div>
              <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                meeting.status === "termine" ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-700",
              )}>{meeting.status === "termine" ? "Termine" : "Planifie"}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PerformanceCelluleCard() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
        <h3 className="text-xs font-bold text-gray-800">Performance des Cellules</h3>
      </div>
      <div className="space-y-2">
        {[
          { cellule: "Alpha — Metal & Robot", heuresSauvees: 42, livrables: "87%", roi: "2.4x", confiance: 92 },
          { cellule: "Beta — Agroalimentaire 4.0", heuresSauvees: 28, livrables: "91%", roi: "1.8x", confiance: 88 },
          { cellule: "Gamma — Usinage Avance", heuresSauvees: 8, livrables: "100%", roi: "—", confiance: 75 },
        ].map((cell) => (
          <div key={cell.cellule} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-[9px] font-bold text-gray-800 mb-2">{cell.cellule}</div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-sm font-bold text-sky-600">{cell.heuresSauvees}h</div>
                <div className="text-[9px] text-gray-500">Heures sauvees</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-emerald-600">{cell.livrables}</div>
                <div className="text-[9px] text-gray-500">Livrables a temps</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-violet-600">{cell.roi}</div>
                <div className="text-[9px] text-gray-500">ROI chantiers</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-orange-600">{cell.confiance}/100</div>
                <div className="text-[9px] text-gray-500">Confiance inter-membres</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function JumelagePipelineOverview() {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <h3 className="text-xs font-bold text-gray-800">Pipeline de Jumelage — Vue d'ensemble</h3>
          <span className="ml-auto text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{JUMELAGES_PIPELINE.length} en cours</span>
        </div>
        <div className="flex items-center justify-between px-2">
          {ETAPES_JUMELAGE.map((etape, i) => {
            const Icon = etape.icon;
            const count = JUMELAGES_PIPELINE.filter((j) => j.etape === etape.id).length;
            return (
              <div key={etape.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2",
                    count > 0 ? "bg-orange-100 border-orange-300" : "bg-gray-50 border-gray-200",
                  )}>
                    <Icon className={cn("h-4 w-4", count > 0 ? etape.color : "text-gray-400")} />
                  </div>
                  <span className="text-[9px] font-medium text-gray-600 mt-1 text-center max-w-[80px]">{etape.label}</span>
                  {count > 0 && <span className="text-[9px] font-bold text-orange-600 mt-0.5">{count}</span>}
                </div>
                {i < ETAPES_JUMELAGE.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-gray-300 mx-2" />}
              </div>
            );
          })}
        </div>
        <div className="space-y-2">
          {JUMELAGES_PIPELINE.map((j) => {
            const etape = ETAPES_JUMELAGE.find((e) => e.id === j.etape)!;
            const EtapeIcon = etape.icon;
            return (
              <div key={j.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <EtapeIcon className={cn("h-4 w-4 shrink-0", etape.color)} />
                <div className="flex-1">
                  <div className="text-[9px] font-bold text-gray-800">{j.client}</div>
                  <div className="text-[9px] text-gray-500">{j.besoin}</div>
                </div>
                <span className={cn("text-[9px] font-medium px-2 py-0.5 rounded-full border",
                  j.etape === "detection" && "bg-amber-50 text-amber-700 border-amber-200",
                  j.etape === "qualification" && "bg-blue-50 text-blue-700 border-blue-200",
                  j.etape === "cahier" && "bg-violet-50 text-violet-700 border-violet-200",
                  j.etape === "match" && "bg-green-50 text-green-700 border-green-200",
                )}>{etape.label}</span>
                <span className="text-[9px] text-gray-400">{j.dateDetection}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function MouvementPionniersCard() {
  return (
    <Card className="p-4 space-y-3 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
      <div className="flex items-center gap-2">
        <Crown className="h-3.5 w-3.5 text-violet-600" />
        <h3 className="text-xs font-bold text-violet-800">Mouvement Pionniers AI — Automatisation Quebec</h3>
      </div>
      <p className="text-[9px] text-gray-600">
        Les leaders de l'automatisation du Quebec qui prennent le virage AI avec CarlOS.
      </p>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-white/80 rounded-lg border border-violet-100 text-center">
          <div className="text-2xl font-black text-violet-700">9</div>
          <div className="text-[9px] text-gray-500 font-medium">Places pionniers</div>
        </div>
        <div className="p-3 bg-white/80 rounded-lg border border-violet-100 text-center">
          <div className="text-2xl font-black text-emerald-600">5</div>
          <div className="text-[9px] text-gray-500 font-medium">Secteurs strategiques</div>
        </div>
        <div className="p-3 bg-white/80 rounded-lg border border-violet-100 text-center">
          <div className="text-2xl font-black text-orange-600">81</div>
          <div className="text-[9px] text-gray-500 font-medium">Objectif membres (9x9)</div>
        </div>
      </div>
    </Card>
  );
}

function FranchiseIntelligenteCard() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Rocket className="h-3.5 w-3.5 text-orange-600" />
        <h3 className="text-xs font-bold text-gray-800">Franchise Intelligente</h3>
        <Badge className="text-[9px] bg-orange-100 text-orange-700 border-orange-200 ml-auto">Vision</Badge>
      </div>
      <p className="text-[9px] text-gray-500 italic">
        Un integrateur rejoint → recoit CarlOS pour SES clients → ses clients embarquent → le reseau grossit de l'interieur.
      </p>
      <div className="grid grid-cols-4 gap-2">
        {[
          { step: "1", title: "Integrateur rejoint", desc: "Formation CarlOS, certification partenaire", icon: Users },
          { step: "2", title: "Deploie CarlOS", desc: "Offre CarlOS a ses propres clients", icon: Bot },
          { step: "3", title: "Clients embarquent", desc: "Entrent dans Orbit9 automatiquement", icon: Network },
          { step: "4", title: "Reseau grossit", desc: "Clients invitent LEURS fournisseurs → flywheel", icon: TrendingUp },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.step} className="p-2.5 bg-orange-50/50 rounded-lg border border-orange-100">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-black bg-orange-200 text-orange-800 w-4 h-4 rounded-full flex items-center justify-center">{s.step}</span>
                <Icon className="h-3.5 w-3.5 text-orange-600" />
              </div>
              <div className="text-[9px] font-bold text-gray-800 mb-0.5">{s.title}</div>
              <p className="text-[9px] text-gray-600">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ProgrammePartenairesCard() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Award className="h-3.5 w-3.5 text-indigo-600" />
        <h3 className="text-xs font-bold text-gray-800">Programme Partenaires — Integrateurs</h3>
        <Badge className="text-[9px] bg-indigo-100 text-indigo-700 border-indigo-200 ml-auto">Futur</Badge>
      </div>
      <p className="text-[9px] text-gray-500 italic">
        Onboarding des partenaires-integrateurs: formation CarlOS, certification, outils de vente, revenus partages.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Formation CarlOS", desc: "Certification partenaire officielle. Maitrise des 12 bots C-Level + VITAA + jumelage", icon: GraduationCap },
          { label: "Outils de Vente", desc: "Kit complet: script 45 min, demo iPad, ROI calculator, cas clients sectoriels", icon: Zap },
          { label: "Revenus Partages", desc: "Commission 5% sur les abonnements de ton reseau. Territoire sectoriel exclusif garanti", icon: TrendingUp },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-3.5 w-3.5 text-indigo-600" />
                <span className="text-[9px] font-bold text-indigo-800">{item.label}</span>
              </div>
              <p className="text-[9px] text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function StandardsQualiteCard() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="h-3.5 w-3.5 text-emerald-600" />
        <h3 className="text-xs font-bold text-gray-800">Standards Qualite — Seuils Minimaux</h3>
      </div>
      <p className="text-[9px] text-gray-500 italic">
        Reevaluation annuelle de chaque membre. Le reseau elite maintient ses standards.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Certifications a jour", seuil: "Min. 1 active", status: "ok" },
          { label: "Assurances valides", seuil: "Responsabilite + specifique", status: "ok" },
          { label: "Score reputation", seuil: "> 70/100", status: "ok" },
          { label: "Litiges ouverts", seuil: "0 majeur", status: "ok" },
          { label: "Taux livraison a temps", seuil: "> 80%", status: "ok" },
          { label: "Charte reseau signee", seuil: "Obligatoire", status: "ok" },
          { label: "Activite reseau", seuil: "Min. 1 interaction/90 jours", status: "warning" },
          { label: "References verifiees", seuil: "Min. 2 actives", status: "ok" },
        ].map((std) => (
          <div key={std.label} className={cn(
            "flex items-center gap-2 p-2.5 rounded-lg border",
            std.status === "ok" ? "bg-emerald-50/50 border-emerald-200" : "bg-amber-50/50 border-amber-200",
          )}>
            {std.status === "ok"
              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              : <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            }
            <div>
              <div className="text-[9px] font-medium text-gray-800">{std.label}</div>
              <div className="text-[9px] text-gray-500">{std.seuil}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ================================================================
// MAIN VIEW
// ================================================================

export function MonReseauView() {
  const { activeReseauSection, navigateReseau } = useFrameMaster();

  const handleNavigate = (section: string) => {
    const valid: ReseauTabId[] = ["profil", "cellules", "jumelage", "chantiers", "pionniers", "gouvernance", "dashboard", "nouvelles", "evenements", "industrie"];
    if (valid.includes(section as ReseauTabId)) navigateReseau(section as ReseauTabId);
  };

  const renderTab = () => {
    switch (activeReseauSection) {
      case "profil":
        return <TabProfil />;
      case "cellules":
        return (
          <div className="space-y-4">
            <CarlOSMediateurCard />
            <MeetingsCelluleCard />
            <CellulesPage onNavigate={handleNavigate} />
            <PerformanceCelluleCard />
          </div>
        );
      case "jumelage":
        return (
          <div className="space-y-4">
            <JumelagePipelineOverview />
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <h3 className="text-xs font-bold text-gray-800">Lancer un Jumelage</h3>
                <span className="text-[9px] text-gray-400">— Flow interactif CarlOS</span>
              </div>
              <JumelageLivePage onNavigate={handleNavigate} />
            </div>
          </div>
        );
      case "chantiers":
        return <HierarchieGHML key="reseau-chantiers" typeChantier="réseau" showStats />;
      case "pionniers":
        return (
          <div className="space-y-4">
            <MouvementPionniersCard />
            <PionniersPage onNavigate={handleNavigate} />
            <FranchiseIntelligenteCard />
            <ProgrammePartenairesCard />
          </div>
        );
      case "gouvernance":
        return (
          <div className="space-y-4">
            <GouvernancePage onNavigate={handleNavigate} />
            <StandardsQualiteCard />
          </div>
        );
      case "dashboard":
        return <TabDashboard />;
      case "nouvelles":
        return <NouvellesPage />;
      case "evenements":
        return <EvenementsPage />;
      case "industrie":
        return <TrgIndustriePage />;
      default:
        return <TabProfil />;
    }
  };

  return (
    <SectionFrame
      title="Mon Reseau"
      subtitle=""
      icon={Network}
      iconColor="text-orange-600"
      tabs={RESEAU_TABS}
      activeTab={activeReseauSection}
      onTabChange={(tab) => navigateReseau(tab as ReseauTabId)}
    >
      {renderTab()}
    </SectionFrame>
  );
}
