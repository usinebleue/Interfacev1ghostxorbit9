/**
 * FEMonReseauPage.tsx — FE.9 Mon Réseau
 * Maquette visuelle des 7 tabs de la section Mon Réseau (C.2.2.5)
 * RÉUTILISE les pages orbit9 existantes + enrichit avec nouveaux concepts
 * Réseau élite augmenté AI — processus sélection rigoureux (inspiré REAI)
 * Session 51
 */

import { useState } from "react";
import {
  Network, User, Shield, TrendingUp, Eye, Lock, Star,
  Handshake, Sparkles, BarChart3, FileText, BookOpen,
  CheckCircle2, Crown, Rocket, Users, Scale, Video,
  AlertTriangle, Gauge, Activity, MessageSquare,
  Globe, Clock, Bot, GraduationCap, Award,
  Bell, ArrowRight, Zap,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";

// === IMPORT des pages existantes (NE PAS DUPLIQUER) ===
import { CellulesPage } from "./CellulesPage";
import { JumelageLivePage } from "./JumelageLivePage";
import { PionniersPage } from "./PionniersPage";
import { GouvernancePage } from "./GouvernancePage";
import { TrgIndustriePage } from "./TrgIndustriePage";

// ================================================================
// TYPES
// ================================================================

type TabId = "profil" | "cellules" | "jumelage" | "pionniers" | "gouvernance" | "dashboard" | "industrie";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "profil", label: "Mon Profil", icon: User },
  { id: "cellules", label: "Mes Cellules", icon: Handshake },
  { id: "jumelage", label: "Jumelage", icon: Sparkles },
  { id: "pionniers", label: "Pionniers", icon: Crown },
  { id: "gouvernance", label: "Gouvernance", icon: Scale },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "industrie", label: "Industrie", icon: Globe },
];

// ================================================================
// DATA — Mon Profil (contenu unique, pas de page existante)
// ================================================================

const PROFIL = {
  nom: "Usine Bleue AI",
  type: "Intégrateur",
  secteur: "Automatisation & IA industrielle",
  ville: "Montréal, QC",
  employes: 8,
  fondee: 2024,
  stadeOrbit9: 7,
  vitaaScore: 82,
  scoreReputation: 92,
  nbCollaborations: 14,
  specialites: ["IA industrielle", "Gestion CEO", "Diagnostic VITAA", "Jumeau numérique", "Formation 4.0"],
};

const CERTIFICATIONS = [
  { label: "ISO 9001:2015", cat: "Qualité", status: "verifie" as const, exp: "2027-06" },
  { label: "ISO 14001", cat: "Environnement", status: "verifie" as const, exp: "2027-03" },
  { label: "C-TPAT", cat: "Sécurité", status: "verifie" as const, exp: "2028-01" },
  { label: "RBQ — Licence entrepreneur", cat: "Réglementaire", status: "verifie" as const, exp: "2027-12" },
  { label: "Programme Innovation MEI", cat: "Gouvernement", status: "en-cours" as const, exp: null },
  { label: "Assurance responsabilité 2M$", cat: "Assurance", status: "verifie" as const, exp: "2026-12" },
];

const AVIS = [
  { auteur: "MetalPro Sherbrooke", role: "Client manufacturier", score: 5, texte: "Intégration IA excellente. Équipe réactive, livrables à temps. Recommandé sans hésitation.", date: "2026-02-20" },
  { auteur: "TechnoBot QC", role: "Partenaire cellule Alpha", score: 4, texte: "Bonne collaboration sur le chantier soudage robotisé. Communication claire et structurée.", date: "2026-03-01" },
  { auteur: "Alimentation Boréal", role: "Client manufacturier", score: 5, texte: "Diagnostic VITAA transformateur. On voit enfin clair dans nos priorités d'investissement.", date: "2026-01-15" },
  { auteur: "Precision CNC Beauce", role: "Partenaire cellule Gamma", score: 5, texte: "Support technique impeccable. CarlOS nous a sauvé 2 semaines sur le MES.", date: "2026-02-28" },
];

// DATA — Dashboard (mock pour ROI/temps sauvé — concept unique)
const CELLULES_SANTE = [
  { id: "CELL-001", nom: "Cellule Alpha — Métal & Robot", score: 87, chaleur: "brule" as const, heuresSauvees: 42, nbChantiers: 2 },
  { id: "CELL-002", nom: "Cellule Beta — Agroalimentaire 4.0", score: 79, chaleur: "brule" as const, heuresSauvees: 28, nbChantiers: 1 },
  { id: "CELL-003", nom: "Cellule Gamma — Usinage Avancé", score: 72, chaleur: "couve" as const, heuresSauvees: 8, nbChantiers: 1 },
];

// ================================================================
// TAB 1: MON PROFIL (contenu unique — pas de page existante)
// ================================================================

function TabProfil() {
  return (
    <div className="space-y-5">
      {/* Fiche entreprise */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-sky-600" />
          <h3 className="text-sm font-semibold text-gray-900">Fiche Entreprise</h3>
          <Badge className="text-[9px] bg-emerald-100 text-emerald-700 border-emerald-200 ml-auto">Profil Vérifié</Badge>
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-gray-900">{PROFIL.nom}</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs text-gray-600">
              <div><span className="font-semibold text-gray-800">Type:</span> {PROFIL.type}</div>
              <div><span className="font-semibold text-gray-800">Secteur:</span> {PROFIL.secteur}</div>
              <div><span className="font-semibold text-gray-800">Ville:</span> {PROFIL.ville}</div>
              <div><span className="font-semibold text-gray-800">Employés:</span> {PROFIL.employes}</div>
              <div><span className="font-semibold text-gray-800">Fondée:</span> {PROFIL.fondee}</div>
              <div><span className="font-semibold text-gray-800">Stade Orbit9:</span> {PROFIL.stadeOrbit9}/9</div>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PROFIL.specialites.map((s) => (
                <span key={s} className="text-[9px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200 font-medium">{s}</span>
              ))}
            </div>
          </div>

          {/* Score Réputation */}
          <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl border border-sky-100">
            <div className="text-4xl font-black text-sky-700">{PROFIL.scoreReputation}</div>
            <div className="text-[9px] font-bold text-sky-600 uppercase tracking-widest mt-1">Réputation</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full h-2 transition-all" style={{ width: `${PROFIL.scoreReputation}%` }} />
            </div>
            <div className="text-[9px] text-gray-500 mt-1.5">{PROFIL.nbCollaborations} collaborations</div>
            <div className="flex items-center gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Certifications */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-gray-900">Certifications & Sceaux de Qualité</h3>
          <span className="ml-auto text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
            {CERTIFICATIONS.filter((c) => c.status === "verifie").length}/{CERTIFICATIONS.length} vérifiées
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CERTIFICATIONS.map((cert) => (
            <div key={cert.label} className={cn(
              "flex items-center gap-2 p-3 rounded-lg border",
              cert.status === "verifie" && "bg-emerald-50/60 border-emerald-200",
              cert.status === "en-cours" && "bg-amber-50/60 border-amber-200",
            )}>
              {cert.status === "verifie" ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <Clock className="h-4 w-4 text-amber-500 shrink-0" />}
              <div>
                <div className="text-xs font-medium text-gray-800">{cert.label}</div>
                <div className="text-[9px] text-gray-500">{cert.cat}{cert.exp ? ` — Exp. ${cert.exp}` : ""}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Confiance Bidirectionnelle */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Handshake className="h-4 w-4 text-violet-600" />
          <h3 className="text-sm font-semibold text-gray-900">Confiance Bidirectionnelle</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3 italic">
          La confiance se joue des deux côtés. Les donneurs d'ordre ET les fournisseurs se qualifient mutuellement.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-[9px] font-bold text-blue-700 uppercase tracking-widest mb-2">Donneur d'Ordre</div>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {["Historique paiements à temps", "Clarté des spécifications", "Respect des engagements", "Communication réactive", "Volume contrats récurrents"].map((item) => (
                <li key={item} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest mb-2">Fournisseur / Sous-Traitant</div>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {["Livraison dans les délais", "Qualité conforme (taux rejet)", "Certifications à jour", "Capacité réelle vs annoncée", "Support après-vente"].map((item) => (
                <li key={item} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Avis & Références */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-900">Avis & Références Vérifiés</h3>
          <span className="ml-auto text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{AVIS.length} avis</span>
        </div>
        <div className="space-y-2.5">
          {AVIS.map((a) => (
            <div key={a.auteur} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-xs font-semibold text-gray-800">{a.auteur}</span>
                  <span className="text-[9px] text-gray-500 ml-2">{a.role}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("h-3.5 w-3.5", i < a.score ? "text-amber-400 fill-amber-400" : "text-gray-200")} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-600 italic">« {a.texte} »</p>
              <div className="text-[9px] text-gray-400 mt-1">{a.date}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Visibilité */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Visibilité & Contrôle des Données</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">Vous contrôlez ce que les autres membres voient avant un matching Orbit9.</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Nom entreprise", visible: true },
            { label: "Secteur & spécialités", visible: true },
            { label: "Certifications", visible: true },
            { label: "Score réputation", visible: true },
            { label: "Nb employés", visible: true },
            { label: "Chiffre d'affaires", visible: false },
            { label: "Clients actuels", visible: false },
            { label: "Avis détaillés", visible: true },
            { label: "Données financières", visible: false },
          ].map((item) => (
            <div key={item.label} className={cn(
              "flex items-center gap-1.5 p-2.5 rounded-lg text-xs border font-medium",
              item.visible ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-400",
            )}>
              {item.visible ? <Eye className="h-3.5 w-3.5 shrink-0" /> : <Lock className="h-3.5 w-3.5 shrink-0" />}
              {item.label}
            </div>
          ))}
        </div>
      </Card>

      {/* Processus de Sélection */}
      <Card className="p-5 bg-gradient-to-br from-orange-50/50 to-amber-50/50 border-orange-200">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-orange-700" />
          <h3 className="text-sm font-semibold text-orange-800">Processus de Sélection Rigoureux (inspiré REAI)</h3>
        </div>
        <p className="text-xs text-gray-600 mb-3 italic">
          Réseau élite augmenté AI — on ne prend pas n'importe qui.
          Même les fournisseurs invités gratuitement passent par le processus complet.
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { step: "1", title: "Invitation", desc: "Client UB a besoin d'un fournisseur → CarlOS invite le prospect gratuitement", icon: Bell },
            { step: "2", title: "Qualification AI", desc: "CarlOS valide: réputation web, NEQ, LinkedIn, références, certifications, litiges, santé financière", icon: Bot },
            { step: "3", title: "Critères REAI", desc: "Entreprise 2+ ans, assurances valides, 0 litige majeur, 1+ certification, 2+ références, charte signée", icon: CheckCircle2 },
            { step: "4", title: "Admission", desc: "Score calculé → Profil créé → Sceaux vérifiés → CarlOS assigné → Premier jumelage possible", icon: Crown },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="p-3 bg-white/80 rounded-lg border border-orange-100">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[9px] font-black bg-orange-200 text-orange-800 w-4 h-4 rounded-full flex items-center justify-center">{s.step}</span>
                  <Icon className="h-3.5 w-3.5 text-orange-600" />
                  <span className="text-[9px] font-bold text-orange-800">{s.title}</span>
                </div>
                <p className="text-[9px] text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-3 p-2 bg-orange-100/60 rounded-lg">
          <p className="text-[9px] text-orange-800 font-semibold text-center">
            FLYWHEEL: Fournisseur invité gratuitement → découvre CarlOS → devient client → invite SES fournisseurs → réseau grossit
          </p>
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// ENRICHMENT: CarlOS Médiateur Proactif (ajouté aux Cellules)
// Concept nouveau — interception meetings, détection tensions
// ================================================================

function CarlOSMediateurCard() {
  return (
    <Card className="p-5 bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-semibold text-violet-800">CarlOS — Médiateur Proactif dans les Meetings</h3>
        <Badge className="text-[9px] bg-violet-100 text-violet-700 border-violet-200 ml-auto">Futur</Badge>
      </div>
      <p className="text-xs text-gray-600 mb-3 italic">
        CarlOS écoute les meetings entre membres d'une cellule, détecte les tensions en temps réel,
        intervient pour corriger les interactions et génère automatiquement les action items.
      </p>
      <div className="space-y-1.5 mb-3">
        {[
          { type: "intervention", texte: "Détection: SoudurePlus a dit « on va essayer » — langage flou avec historique 2 retards/3. Intervention envoyée.", time: "il y a 2h" },
          { type: "action", texte: "Action items générés du meeting du 8 mars: 4 tâches assignées automatiquement.", time: "hier" },
          { type: "alerte", texte: "Budget chantier CR-1 à 78% — recommandation: réviser scope PR-1.3 avant dépassement.", time: "il y a 3 jours" },
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
          { label: "Transcription live", desc: "Deepgram capte chaque mot en temps réel", icon: Activity },
          { label: "Détection tensions", desc: "Analyse sémantique des engagements flous", icon: AlertTriangle },
          { label: "Actions auto", desc: "Tâches assignées sans effort humain", icon: CheckCircle2 },
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

// ================================================================
// ENRICHMENT: Franchise Intelligente (ajouté aux Pionniers)
// Concept nouveau — intégrateurs déploient CarlOS pour leurs clients
// ================================================================

function FranchiseIntelligenteCard() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Rocket className="h-4 w-4 text-orange-600" />
        <h3 className="text-sm font-semibold text-gray-900">Franchise Intelligente</h3>
        <Badge className="text-[9px] bg-orange-100 text-orange-700 border-orange-200 ml-auto">Vision</Badge>
      </div>
      <p className="text-xs text-gray-500 mb-3 italic">
        Un intégrateur rejoint → reçoit CarlOS pour SES clients → ses clients embarquent → le réseau grossit de l'intérieur. Scale sans vendre direct.
      </p>
      <div className="grid grid-cols-4 gap-2">
        {[
          { step: "1", title: "Intégrateur rejoint", desc: "Formation CarlOS, certification partenaire, outils de vente", icon: Users },
          { step: "2", title: "Déploie CarlOS", desc: "Offre CarlOS à ses propres clients manufacturiers", icon: Bot },
          { step: "3", title: "Clients embarquent", desc: "Ses clients entrent dans le réseau Orbit9 automatiquement", icon: Network },
          { step: "4", title: "Réseau grossit", desc: "Les clients invitent LEURS fournisseurs → flywheel infini", icon: TrendingUp },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.step} className="p-3 bg-orange-50/50 rounded-lg border border-orange-100">
              <div className="flex items-center gap-1.5 mb-1.5">
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

// ================================================================
// ENRICHMENT: Meetings Cellule (ajouté aux Cellules — FE.5 TAB 2)
// Meetings SUR la plateforme avec CarlOS médiateur proactif
// ================================================================

function MeetingsCelluleCard() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Video className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">Meetings Cellule — Prochains</h3>
        <Badge className="text-[9px] bg-blue-100 text-blue-700 border-blue-200 ml-auto">LiveKit</Badge>
      </div>
      <p className="text-xs text-gray-500 mb-3 italic">
        Meetings SUR la plateforme. CarlOS transcrit, détecte les tensions et génère les action items en temps réel.
      </p>
      <div className="space-y-2">
        {[
          { cellule: "Alpha — Métal & Robot", date: "2026-03-12 14:00", participants: ["Usine Bleue", "MetalPro", "TechnoBot"], sujet: "Revue avancement soudage robotisé + budget Phase 2", status: "planifie" },
          { cellule: "Beta — Agroalimentaire 4.0", date: "2026-03-14 10:00", participants: ["Alimentation Boréal", "FroidTech", "PackPro"], sujet: "Kick-off Chaîne du Froid 4.0 — specs + échéancier", status: "planifie" },
          { cellule: "Alpha — Métal & Robot", date: "2026-03-08 14:00", participants: ["Usine Bleue", "MetalPro", "TechnoBot"], sujet: "Revue specs torches Lincoln — validation devis", status: "termine" },
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
              <div className="text-xs font-semibold text-gray-800">{meeting.cellule}</div>
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
              )}>{meeting.status === "termine" ? "Terminé" : "Planifié"}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ================================================================
// ENRICHMENT: Performance Cellule (ajouté aux Cellules — FE.5 TAB 2)
// Heures sauvées, livrables à temps, ROI, score confiance
// ================================================================

function PerformanceCelluleCard() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-900">Performance des Cellules</h3>
      </div>
      <div className="space-y-2.5">
        {[
          { cellule: "Alpha — Métal & Robot", heuresSauvees: 42, livrables: "87%", roi: "2.4x", confiance: 92 },
          { cellule: "Beta — Agroalimentaire 4.0", heuresSauvees: 28, livrables: "91%", roi: "1.8x", confiance: 88 },
          { cellule: "Gamma — Usinage Avancé", heuresSauvees: 8, livrables: "100%", roi: "—", confiance: 75 },
        ].map((cell) => (
          <div key={cell.cellule} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-xs font-semibold text-gray-800 mb-2">{cell.cellule}</div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-sm font-bold text-sky-600">{cell.heuresSauvees}h</div>
                <div className="text-[9px] text-gray-500">Heures sauvées</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-emerald-600">{cell.livrables}</div>
                <div className="text-[9px] text-gray-500">Livrables à temps</div>
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

// ================================================================
// ENRICHMENT: Pipeline Jumelage Overview (ajouté au Jumelage — FE.5 TAB 3)
// Vue de TOUS les jumelages actifs par étape + flow ACTION
// ================================================================

const JUMELAGES_PIPELINE = [
  { id: "J-001", client: "MetalPro Sherbrooke", besoin: "Robot soudage MIG/TIG automatisé", etape: "cahier" as const, dateDetection: "2026-02-10" },
  { id: "J-002", client: "QC Plasturgie", besoin: "Cellule injection automatisée + vision qualité", etape: "qualification" as const, dateDetection: "2026-03-01" },
  { id: "J-003", client: "Alimentation Boréal", besoin: "Emballage automatisé ligne #3 — HACCP", etape: "match" as const, dateDetection: "2026-01-20" },
  { id: "J-004", client: "SoudurePlus", besoin: "Upgrade torches robotisées Lincoln", etape: "detection" as const, dateDetection: "2026-03-08" },
];

const ETAPES_JUMELAGE = [
  { id: "detection", label: "Détection CarlOS", desc: "CarlOS détecte le bon moment (VITAA, conversations)", icon: Sparkles, color: "text-amber-500" },
  { id: "qualification", label: "Qualification & Upload", desc: "Kit complet: specs, budgets, dessins, échéancier", icon: FileText, color: "text-blue-600" },
  { id: "cahier", label: "Cahier de Jumelage", desc: "CarlOS génère le document structuré pro", icon: BookOpen, color: "text-violet-600" },
  { id: "validation", label: "Validation Expert", desc: "Expert humain valide avant envoi au fournisseur", icon: CheckCircle2, color: "text-emerald-600" },
  { id: "match", label: "Match & Contrat", desc: "Rencontre → Négociation → Contrat signé", icon: Handshake, color: "text-green-600" },
];

function JumelagePipelineOverview() {
  return (
    <div className="space-y-5">
      {/* Pipeline visuel */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-900">Pipeline de Jumelage — Vue d'ensemble</h3>
          <span className="ml-auto text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{JUMELAGES_PIPELINE.length} en cours</span>
        </div>

        {/* Étapes visuelles avec compteurs */}
        <div className="flex items-center justify-between mb-5 px-2">
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
                  {count > 0 && (
                    <span className="text-[9px] font-bold text-orange-600 mt-0.5">{count}</span>
                  )}
                </div>
                {i < ETAPES_JUMELAGE.length - 1 && (
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 mx-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Liste jumelages actifs */}
        <div className="space-y-2">
          {JUMELAGES_PIPELINE.map((j) => {
            const etape = ETAPES_JUMELAGE.find((e) => e.id === j.etape)!;
            const EtapeIcon = etape.icon;
            return (
              <div key={j.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <EtapeIcon className={cn("h-4 w-4 shrink-0", etape.color)} />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-gray-800">{j.client}</div>
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

      {/* Flow ACTION détaillé */}
      <Card className="p-5 bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-200">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-4 w-4 text-orange-600" />
          <h3 className="text-sm font-semibold text-orange-800">CarlOS Drive le Jumelage — Flow ACTION</h3>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {ETAPES_JUMELAGE.map((etape, i) => {
            const Icon = etape.icon;
            return (
              <div key={etape.id} className="p-2.5 bg-white/80 rounded-lg border border-orange-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-black bg-orange-200 text-orange-800 w-4 h-4 rounded-full flex items-center justify-center">{i + 1}</span>
                  <Icon className={cn("h-3.5 w-3.5", etape.color)} />
                </div>
                <div className="text-[9px] font-bold text-gray-800 mb-0.5">{etape.label}</div>
                <p className="text-[9px] text-gray-600 leading-relaxed">{etape.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-3 p-2 bg-orange-100/60 rounded-lg">
          <p className="text-[9px] text-orange-800 font-semibold text-center">
            CarlOS médie l'EXÉCUTION après le contrat signé. Le fournisseur invité gratuitement entre par la détection.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// ENRICHMENT: Mouvement Pionniers AI (ajouté aux Pionniers — FE.5 TAB 4)
// Leaders de l'automatisation du Québec prennent le virage AI
// ================================================================

function MouvementPionniersCard() {
  return (
    <Card className="p-5 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
      <div className="flex items-center gap-2 mb-3">
        <Crown className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-semibold text-violet-800">Mouvement Pionniers AI — Automatisation Québec</h3>
      </div>
      <p className="text-xs text-gray-600 mb-3">
        Les leaders de l'automatisation du Québec qui prennent le virage AI avec CarlOS.
        Même les intégrateurs ont besoin de prendre le virage — CarlOS les augmente, pas les remplace.
      </p>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-white/80 rounded-lg border border-violet-100 text-center">
          <div className="text-2xl font-black text-violet-700">9</div>
          <div className="text-[9px] text-gray-500 font-medium">Places pionniers</div>
        </div>
        <div className="p-3 bg-white/80 rounded-lg border border-violet-100 text-center">
          <div className="text-2xl font-black text-emerald-600">5</div>
          <div className="text-[9px] text-gray-500 font-medium">Secteurs stratégiques</div>
        </div>
        <div className="p-3 bg-white/80 rounded-lg border border-violet-100 text-center">
          <div className="text-2xl font-black text-orange-600">81</div>
          <div className="text-[9px] text-gray-500 font-medium">Objectif membres (9x9)</div>
        </div>
      </div>
    </Card>
  );
}

// ================================================================
// ENRICHMENT: Programme Partenaires (ajouté aux Pionniers — FE.5 TAB 4)
// Onboarding intégrateurs: formation, certification, outils, revenus
// ================================================================

function ProgrammePartenairesCard() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Award className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-900">Programme Partenaires — Intégrateurs</h3>
        <Badge className="text-[9px] bg-indigo-100 text-indigo-700 border-indigo-200 ml-auto">Futur</Badge>
      </div>
      <p className="text-xs text-gray-500 mb-3 italic">
        Onboarding des partenaires-intégrateurs: formation CarlOS, certification, outils de vente, territoire exclusif, revenus partagés.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Formation CarlOS", desc: "Certification partenaire officielle. Maîtrise des 12 bots C-Level + VITAA + jumelage", icon: GraduationCap },
          { label: "Outils de Vente", desc: "Kit complet: script 45 min, démo iPad, ROI calculator, cas clients sectoriels", icon: Zap },
          { label: "Revenus Partagés", desc: "Commission 5% sur les abonnements de ton réseau. Territoire sectoriel exclusif garanti", icon: TrendingUp },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-1.5 mb-1.5">
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

// ================================================================
// ENRICHMENT: Standards Qualité (ajouté à Gouvernance — FE.5 TAB 5)
// Seuils minimaux, réévaluation annuelle
// ================================================================

function StandardsQualiteCard() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-semibold text-gray-900">Standards Qualité — Seuils Minimaux</h3>
      </div>
      <p className="text-xs text-gray-500 mb-3 italic">
        Réévaluation annuelle de chaque membre. Le réseau élite maintient ses standards.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Certifications à jour", seuil: "Min. 1 active", status: "ok" },
          { label: "Assurances valides", seuil: "Responsabilité + spécifique", status: "ok" },
          { label: "Score réputation", seuil: "> 70/100", status: "ok" },
          { label: "Litiges ouverts", seuil: "0 majeur", status: "ok" },
          { label: "Taux livraison à temps", seuil: "> 80%", status: "ok" },
          { label: "Charte réseau signée", seuil: "Obligatoire", status: "ok" },
          { label: "Activité réseau", seuil: "Min. 1 interaction/90 jours", status: "warning" },
          { label: "Références vérifiées", seuil: "Min. 2 actives", status: "ok" },
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
              <div className="text-xs font-medium text-gray-800">{std.label}</div>
              <div className="text-[9px] text-gray-500">{std.seuil}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ================================================================
// TAB 6: DASHBOARD (contenu unique — ROI/temps sauvé par CarlOS)
// ================================================================

function TabDashboard() {
  return (
    <div className="space-y-5">
      {/* KPIs globaux */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Heures sauvées", value: "234h", sub: "Ce trimestre", icon: Clock, color: "text-sky-600", bg: "from-sky-50 to-blue-50" },
          { label: "Interventions CarlOS", value: "47", sub: "Médiations proactives", icon: Bot, color: "text-violet-600", bg: "from-violet-50 to-purple-50" },
          { label: "Valeur contrats", value: "1.31M$", sub: "Facilités par le réseau", icon: TrendingUp, color: "text-emerald-600", bg: "from-emerald-50 to-green-50" },
          { label: "Score réseau", value: "87/100", sub: "Santé globale", icon: Activity, color: "text-orange-600", bg: "from-orange-50 to-amber-50" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className={cn("p-4 bg-gradient-to-br border-0", kpi.bg)}>
              <Icon className={cn("h-4 w-4 mb-2", kpi.color)} />
              <div className="text-2xl font-black text-gray-900">{kpi.value}</div>
              <div className="text-[9px] font-medium text-gray-600">{kpi.label}</div>
              <div className="text-[9px] text-gray-400">{kpi.sub}</div>
            </Card>
          );
        })}
      </div>

      {/* ROI Détaillé */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-gray-900">ROI — Temps & Argent Sauvés par CarlOS</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: "Retards interceptés 72h d'avance", heures: "89h", argent: "45K$", count: 12 },
            { label: "Malentendus résolus en meeting (temps réel)", heures: "56h", argent: "28K$", count: 23 },
            { label: "Action items auto-générés (vs notes manuelles)", heures: "34h", argent: "12K$", count: 47 },
            { label: "Tensions détectées et désamorcées", heures: "55h", argent: "67K$", count: 8 },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-800">{row.label}</div>
                <div className="text-[9px] text-gray-500">{row.count} occurrences</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-sky-600">{row.heures} sauvées</div>
                <div className="text-[9px] font-medium text-emerald-600">{row.argent} économisés</div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800">TOTAL TRIMESTRE</span>
            <div className="text-right">
              <span className="text-sm font-black text-sky-700">234h</span>
              <span className="text-xs text-gray-500 mx-2">·</span>
              <span className="text-sm font-black text-emerald-700">152K$</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Santé des Cellules */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-gray-900">Santé des Cellules</h3>
        </div>
        <div className="space-y-2">
          {CELLULES_SANTE.map((cell) => (
            <div key={cell.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={cn("w-2 h-8 rounded-full",
                cell.chaleur === "brule" && "bg-red-400",
                cell.chaleur === "couve" && "bg-amber-400",
              )} />
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-800">{cell.nom}</div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div className={cn("rounded-full h-1.5",
                      cell.score >= 80 && "bg-emerald-500",
                      cell.score >= 60 && cell.score < 80 && "bg-amber-500",
                      cell.score < 60 && "bg-red-500",
                    )} style={{ width: `${cell.score}%` }} />
                  </div>
                  <span className="text-[9px] font-bold text-gray-600">{cell.score}/100</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-emerald-600 font-bold">{cell.heuresSauvees}h sauvées</div>
                <div className="text-[9px] text-gray-400">{cell.nbChantiers} chantier{cell.nbChantiers > 1 ? "s" : ""}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// PAGE PRINCIPALE — FE.9 Mon Réseau
// Suit le pattern PlaybookUsineBleuePage (Blueprint)
// ================================================================

export function FEMonReseauPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profil");

  // Cross-tab navigation handler pour les pages importées
  const handleNavigate = (section: string) => {
    if (section === "cellules") setActiveTab("cellules");
    if (section === "jumelage") setActiveTab("jumelage");
    if (section === "gouvernance") setActiveTab("gouvernance");
    if (section === "marketplace") setActiveTab("cellules");
    if (section === "pionniers") setActiveTab("pionniers");
  };

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Network}
          iconColor="text-orange-600"
          title="Mon Réseau"
          subtitle="Réseau élite augmenté AI — cellules, jumelage, pionniers"
          rightSlot={
            <div className="flex items-center gap-1 flex-wrap">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold rounded-lg transition-colors",
                      activeTab === tab.id
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          }
        />
      }
    >
      {activeTab === "profil" && <TabProfil />}

      {activeTab === "cellules" && (
        <div className="space-y-5">
          <CarlOSMediateurCard />
          <MeetingsCelluleCard />
          <CellulesPage onNavigate={handleNavigate} />
          <PerformanceCelluleCard />
        </div>
      )}

      {activeTab === "jumelage" && (
        <div className="space-y-5">
          <JumelagePipelineOverview />
          <div className="border-t border-gray-200 pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-900">Lancer un Jumelage</h3>
              <span className="text-[9px] text-gray-400">— Flow interactif CarlOS</span>
            </div>
            <JumelageLivePage onNavigate={handleNavigate} />
          </div>
        </div>
      )}

      {activeTab === "pionniers" && (
        <div className="space-y-5">
          <MouvementPionniersCard />
          <PionniersPage onNavigate={handleNavigate} />
          <FranchiseIntelligenteCard />
          <ProgrammePartenairesCard />
        </div>
      )}

      {activeTab === "gouvernance" && (
        <div className="space-y-5">
          <GouvernancePage onNavigate={handleNavigate} />
          <StandardsQualiteCard />
        </div>
      )}

      {activeTab === "dashboard" && <TabDashboard />}

      {activeTab === "industrie" && <TrgIndustriePage />}
    </PageLayout>
  );
}
