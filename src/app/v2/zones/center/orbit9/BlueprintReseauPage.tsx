/**
 * BlueprintReseauPage.tsx — RD.8 Blueprint Reseau Orbit9
 * Meme frame que le Blueprint interne (PlaybookUsineBleuePage)
 * mais pour la collaboration inter-entreprises manufacturier ↔ fournisseurs.
 * Cellules Orbit9 = chantiers/projets partages entre membres du reseau.
 * Session 51 — Modelisation
 */

import { useState } from "react";
import {
  Network, Handshake, Store, Sparkles, Crown,
  Rocket, Users, Globe, Package, Target,
  ChevronRight, ChevronDown, Flame, Bot,
  CheckCircle2, Clock, AlertTriangle, Lock,
  Layers, Zap, BarChart3, Eye,
  Shield, Factory, Wrench, Code2,
  FileText, Route, ListChecks, Calendar,
  TrendingUp, Search, Bell, Star,
  ArrowRight, ArrowUpRight, Cpu,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ================================================================
// TYPES — Meme hierarchie que Blueprint interne
// ================================================================

type TabId = "overview" | "profil" | "cellules" | "chantiers" | "projets" | "missions" | "prime-spot" | "pipeline" | "membres";

interface Membre {
  id: string;
  nom: string;
  type: "manufacturier" | "integrateur" | "equipementier" | "distributeur" | "consultant";
  secteur: string;
  ville: string;
  stadeOrbit9: number;  // 1-9
  specialites: string[];
  nbEmployes: number;
  vitaaScore: number;  // 0-100
}

interface MissionReseau {
  label: string;
  assignee: string;      // membre ou bot
  type: "interne" | "externe" | "ouverte";
  cote: "mfg" | "fournisseur" | "partage";
  missionLiee?: string;
}

interface ProjetCollab {
  id: string;
  label: string;
  desc: string;
  status: "done" | "en-cours" | "a-faire" | "bloque";
  leadMembre: string;
  missions: string[];
}

interface ChantierPartage {
  id: string;
  num: number;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  chaleur: "brule" | "couve" | "meurt";
  type: string;
  cellule: string;
  membres: string[];
  projets: ProjetCollab[];
  objectif: string;
  timing: string;
  valeurEstimee: string;
}

interface Cellule {
  id: string;
  nom: string;
  membres: Membre[];
  score: number;
  status: "active" | "formation" | "prospect";
  dateCreation: string;
  nbChantiers: number;
  secteurPrincipal: string;
}

// ================================================================
// DATA — MEMBRES DU RESEAU (exemples reels QC)
// ================================================================

const MEMBRES: Membre[] = [
  { id: "M-001", nom: "Usine Bleue AI", type: "integrateur", secteur: "Automatisation & IA", ville: "Montreal", stadeOrbit9: 7, specialites: ["IA industrielle", "Gestion CEO", "Diagnostic VITAA"], nbEmployes: 8, vitaaScore: 82 },
  { id: "M-002", nom: "MetalPro Sherbrooke", type: "manufacturier", secteur: "Metallurgie", ville: "Sherbrooke", stadeOrbit9: 3, specialites: ["Usinage CNC", "Soudage robotise", "Decoupe laser"], nbEmployes: 85, vitaaScore: 61 },
  { id: "M-003", nom: "TechnoBot QC", type: "equipementier", secteur: "Robotique", ville: "Quebec", stadeOrbit9: 5, specialites: ["Cobots UR", "Cellules robotiques", "Vision industrielle"], nbEmployes: 22, vitaaScore: 74 },
  { id: "M-004", nom: "Alimentation Boreal", type: "manufacturier", secteur: "Agroalimentaire", ville: "Saguenay", stadeOrbit9: 2, specialites: ["Transformation alimentaire", "Chaine du froid", "HACCP"], nbEmployes: 120, vitaaScore: 48 },
  { id: "M-005", nom: "FroidTech Solutions", type: "equipementier", secteur: "Refrigeration industrielle", ville: "Trois-Rivieres", stadeOrbit9: 4, specialites: ["Systemes froid", "Ammoniac NH3", "Efficacite energetique"], nbEmployes: 35, vitaaScore: 67 },
  { id: "M-006", nom: "PackPro International", type: "equipementier", secteur: "Emballage", ville: "Laval", stadeOrbit9: 4, specialites: ["Emballage automatise", "Etiquetage", "Palettisation"], nbEmployes: 45, vitaaScore: 71 },
  { id: "M-007", nom: "AutomaTech Inc.", type: "integrateur", secteur: "Automatisation", ville: "Drummondville", stadeOrbit9: 5, specialites: ["PLC Allen-Bradley", "SCADA", "Integration MES"], nbEmployes: 18, vitaaScore: 78 },
  { id: "M-008", nom: "SoudurePlus", type: "distributeur", secteur: "Soudage & Coupage", ville: "Granby", stadeOrbit9: 3, specialites: ["Equipement Lincoln/Miller", "Consommables", "Formation soudeurs"], nbEmployes: 28, vitaaScore: 59 },
  { id: "M-009", nom: "Precision CNC Beauce", type: "manufacturier", secteur: "Usinage", ville: "Saint-Georges", stadeOrbit9: 4, specialites: ["Usinage 5 axes", "Prototypage rapide", "Pieces complexes"], nbEmployes: 62, vitaaScore: 65 },
  { id: "M-010", nom: "EcoVert Energie", type: "consultant", secteur: "Efficacite energetique", ville: "Sherbrooke", stadeOrbit9: 3, specialites: ["Audit energetique", "Subventions Hydro-QC", "Decarbonation"], nbEmployes: 6, vitaaScore: 72 },
  { id: "M-011", nom: "QC Plasturgie", type: "manufacturier", secteur: "Plasturgie", ville: "Victoriaville", stadeOrbit9: 2, specialites: ["Injection plastique", "Moules", "Extrusion"], nbEmployes: 95, vitaaScore: 52 },
  { id: "M-012", nom: "Robotik Solutions", type: "integrateur", secteur: "Robotique", ville: "Levis", stadeOrbit9: 6, specialites: ["Fanuc", "ABB", "Simulation 3D"], nbEmployes: 15, vitaaScore: 81 },
];

// ================================================================
// DATA — CELLULES ORBIT9
// ================================================================

const CELLULES: Cellule[] = [
  {
    id: "CELL-001", nom: "Cellule Alpha — Metal & Robot",
    membres: [MEMBRES[1], MEMBRES[2], MEMBRES[7]],  // MetalPro + TechnoBot + SoudurePlus
    score: 87, status: "active", dateCreation: "2026-02-15", nbChantiers: 2,
    secteurPrincipal: "Metallurgie + Automatisation",
  },
  {
    id: "CELL-002", nom: "Cellule Beta — Agroalimentaire 4.0",
    membres: [MEMBRES[3], MEMBRES[4], MEMBRES[5]],  // Alimentation Boreal + FroidTech + PackPro
    score: 79, status: "active", dateCreation: "2026-02-20", nbChantiers: 1,
    secteurPrincipal: "Agroalimentaire + Chaine du froid",
  },
  {
    id: "CELL-003", nom: "Cellule Gamma — Usinage Avance",
    membres: [MEMBRES[8], MEMBRES[6], MEMBRES[9]],  // Precision CNC + AutomaTech + EcoVert
    score: 72, status: "formation", dateCreation: "2026-03-01", nbChantiers: 1,
    secteurPrincipal: "Usinage + Efficacite",
  },
  {
    id: "CELL-004", nom: "Cellule Delta — Plasturgie Verte",
    membres: [MEMBRES[10], MEMBRES[11], MEMBRES[9]],  // QC Plasturgie + Robotik + EcoVert
    score: 68, status: "prospect", dateCreation: "2026-03-05", nbChantiers: 0,
    secteurPrincipal: "Plasturgie + Decarbonation",
  },
];

// ================================================================
// DATA — CHANTIERS PARTAGES (inter-entreprises)
// ================================================================

const CHANTIERS_RESEAU: ChantierPartage[] = [
  {
    id: "CR-1", num: 1, label: "Automatisation Soudage Robotise",
    desc: "MetalPro a besoin d'automatiser sa ligne de soudage. TechnoBot fournit les cobots, SoudurePlus les consommables et la formation. Chantier partage 3 membres.",
    icon: Cpu, color: "violet", chaleur: "brule", type: "technologique",
    cellule: "CELL-001", membres: ["MetalPro Sherbrooke", "TechnoBot QC", "SoudurePlus"],
    objectif: "Ligne soudage robotisee operationnelle, +40% productivite",
    timing: "3-6 mois", valeurEstimee: "350K$",
    projets: [
      { id: "PR-1.1", label: "Audit Ligne Actuelle", desc: "Evaluation capacite, goulots, qualite soudure actuelle. Mesures OEE baseline.", status: "done", leadMembre: "MetalPro Sherbrooke",
        missions: ["MetalPro: Fournir donnees OEE 6 derniers mois", "TechnoBot: Audit physique ligne soudage (2 jours)", "TechnoBot: Rapport analyse faisabilite robot", "SoudurePlus: Inventaire consommables actuels + recommandations"] },
      { id: "PR-1.2", label: "Selection & Design Cellule Robot", desc: "Choix cobots, design layout, simulation 3D. Budget valide.", status: "en-cours", leadMembre: "TechnoBot QC",
        missions: ["TechnoBot: Design cellule robot (3 options layout)", "TechnoBot: Simulation 3D + cycle time estime", "MetalPro: Validation contraintes plancher (espace, elec, air)", "SoudurePlus: Spec torches robot + positionneurs", "MetalPro: GO budget (350K$ — presentation CA)"] },
      { id: "PR-1.3", label: "Installation & Mise en Route", desc: "Installation physique, programmation, validation qualite.", status: "a-faire", leadMembre: "TechnoBot QC",
        missions: ["TechnoBot: Installation cobots + integration (4 semaines)", "TechnoBot: Programmation 12 programmes soudage", "SoudurePlus: Livraison + setup consommables robot", "MetalPro: Personnel dedie pour formation", "TechnoBot: Validation qualite soudure (CWB)", "MetalPro: Test production 2 semaines"] },
      { id: "PR-1.4", label: "Formation & Transfert", desc: "Formation operateurs, maintenance preventive, documentation.", status: "a-faire", leadMembre: "SoudurePlus",
        missions: ["SoudurePlus: Formation soudeurs (operation cobot, 3 jours)", "TechnoBot: Formation maintenance preventive", "TechnoBot: Documentation technique complete", "MetalPro: Nommer champion interne robot", "MetalPro: Metriques post-install (OEE cible vs reel)"] },
    ],
  },
  {
    id: "CR-2", num: 2, label: "Chaine du Froid 4.0",
    desc: "Alimentation Boreal modernise sa chaine du froid. FroidTech fournit les systemes, PackPro l'emballage automatise. Conformite HACCP + tracabilite complete.",
    icon: Shield, color: "teal", chaleur: "brule", type: "operationnel",
    cellule: "CELL-002", membres: ["Alimentation Boreal", "FroidTech Solutions", "PackPro International"],
    objectif: "Tracabilite 100%, conformite HACCP, -25% pertes produit",
    timing: "4-8 mois", valeurEstimee: "500K$",
    projets: [
      { id: "PR-2.1", label: "Audit Chaine du Froid", desc: "Cartographie complete: reception → entreposage → transformation → emballage → expedition.", status: "done", leadMembre: "FroidTech Solutions",
        missions: ["FroidTech: Audit complet 5 zones temperature (3 jours)", "FroidTech: Rapport gaps vs normes MAPAQ/ACIA", "Alimentation Boreal: Historique bris chaine froid (12 mois)", "PackPro: Audit ligne emballage actuelle", "Alimentation Boreal: Budget approuve direction"] },
      { id: "PR-2.2", label: "Systeme Monitoring IoT", desc: "Capteurs temperature + humidite + alertes temps reel.", status: "en-cours", leadMembre: "FroidTech Solutions",
        missions: ["FroidTech: Selection capteurs IoT (WiFi/LoRa)", "FroidTech: Installation 45 points de mesure", "FroidTech: Dashboard monitoring temps reel", "Alimentation Boreal: Nommer responsable qualite IoT", "FroidTech: Formation equipe alertes + procedures"] },
      { id: "PR-2.3", label: "Emballage Automatise HACCP", desc: "Ligne emballage automatisee avec tracabilite lot complete.", status: "a-faire", leadMembre: "PackPro International",
        missions: ["PackPro: Design ligne emballage (2 options)", "PackPro: Integration etiquetage tracabilite GS1", "Alimentation Boreal: Spec produits (12 formats)", "PackPro: Installation + mise en route (6 semaines)", "FroidTech: Integration monitoring → ligne emballage"] },
      { id: "PR-2.4", label: "Certification & Documentation", desc: "Dossier HACCP mis a jour, certification SQF, formation.", status: "a-faire", leadMembre: "Alimentation Boreal",
        missions: ["Alimentation Boreal: Mise a jour plan HACCP", "FroidTech: Documentation validation chaine froid", "PackPro: Documentation validation emballage", "Alimentation Boreal: Formation equipe nouvelles procedures", "Alimentation Boreal: Audit pre-certification SQF"] },
    ],
  },
  {
    id: "CR-3", num: 3, label: "Cellule Usinage 5 Axes — Efficacite",
    desc: "Precision CNC modernise avec AutomaTech (integration MES) et EcoVert (efficacite energetique). Objectif: reduire couts energetiques de 30% tout en augmentant la productivite.",
    icon: Factory, color: "emerald", chaleur: "couve", type: "technologique",
    cellule: "CELL-003", membres: ["Precision CNC Beauce", "AutomaTech Inc.", "EcoVert Energie"],
    objectif: "MES integre, -30% energie, +20% productivite",
    timing: "4-6 mois", valeurEstimee: "280K$",
    projets: [
      { id: "PR-3.1", label: "Audit Energetique & Processus", desc: "Double audit: efficacite energetique (EcoVert) + processus manufacturing (AutomaTech).", status: "en-cours", leadMembre: "EcoVert Energie",
        missions: ["EcoVert: Audit energetique complet (electrique + air comprime + chauffage)", "AutomaTech: Audit processus manufacturing (OEE par machine)", "Precision CNC: Donnees Hydro-QC 24 mois + logs machines", "EcoVert: Rapport recommandations + ROI par mesure", "AutomaTech: Rapport gaps MES (manque visibilite production)"] },
      { id: "PR-3.2", label: "Implementation MES", desc: "Systeme MES connecte aux 8 machines CNC 5 axes.", status: "a-faire", leadMembre: "AutomaTech Inc.",
        missions: ["AutomaTech: Selection MES (Epicor/Plex/MachineMetrics)", "AutomaTech: Integration API 8 machines CNC", "AutomaTech: Dashboard production temps reel", "Precision CNC: Formation operateurs (saisie donnees)", "AutomaTech: KPIs automatises (OEE, TRS, rendement)"] },
      { id: "PR-3.3", label: "Mesures Efficacite Energetique", desc: "Recuperation chaleur, variateurs, eclairage LED, air comprime optimise.", status: "a-faire", leadMembre: "EcoVert Energie",
        missions: ["EcoVert: Demande subvention Hydro-QC (EfficiNERGIE)", "EcoVert: Installation variateurs vitesse (5 moteurs)", "EcoVert: Recuperation chaleur compresseurs", "Precision CNC: Remplacement eclairage → LED", "EcoVert: Suivi metriques post-installation (6 mois)"] },
    ],
  },
  {
    id: "CR-4", num: 4, label: "Integration MES MetalPro (Phase 2)",
    desc: "Suite du chantier soudage — MetalPro veut connecter TOUTES ses machines. AutomaTech apporte le MES, TechnoBot l'expertise robot-MES.",
    icon: Code2, color: "blue", chaleur: "couve", type: "technologique",
    cellule: "CELL-001", membres: ["MetalPro Sherbrooke", "AutomaTech Inc.", "TechnoBot QC"],
    objectif: "MES complet usine, visibilite production temps reel",
    timing: "3-5 mois", valeurEstimee: "180K$",
    projets: [
      { id: "PR-4.1", label: "Cartographie Machines & Data", desc: "Inventaire 22 machines, protocoles communication, data disponible.", status: "a-faire", leadMembre: "AutomaTech Inc.",
        missions: ["AutomaTech: Inventaire 22 machines (marque, age, protocole)", "AutomaTech: Test connectivite OPC-UA/Modbus/MTConnect", "MetalPro: Priorite machines (top 10 critique)", "TechnoBot: Integration robot soudage → MES"] },
      { id: "PR-4.2", label: "Deploiement MES Progressive", desc: "Phase 1: 10 machines critiques. Phase 2: reste de l'usine.", status: "a-faire", leadMembre: "AutomaTech Inc.",
        missions: ["AutomaTech: Installation MES phase 1 (10 machines)", "AutomaTech: Dashboard production + alertes", "MetalPro: Formation superviseurs", "AutomaTech: Phase 2 — 12 machines restantes"] },
    ],
  },
  {
    id: "CR-5", num: 5, label: "Programme Formation Continue Reseau",
    desc: "Formation croisee entre les 12 membres du reseau. Chacun partage son expertise. SoudurePlus forme en soudage, TechnoBot en robotique, EcoVert en energie.",
    icon: Users, color: "amber", chaleur: "couve", type: "organisationnel",
    cellule: "Reseau complet", membres: ["Tous les membres"],
    objectif: "12 ateliers/an, montee en competences croisee",
    timing: "Permanent (trimestriel)", valeurEstimee: "Inclus membership",
    projets: [
      { id: "PR-5.1", label: "Calendrier Ateliers Q2 2026", desc: "3 ateliers planifies: Robotique, Energie, Lean.", status: "en-cours", leadMembre: "Usine Bleue AI",
        missions: ["TechnoBot: Atelier 'Intro Cobots pour PME' (avril)", "EcoVert: Atelier 'Subventions Hydro-QC 2026' (mai)", "AutomaTech: Atelier 'MES 101 — Pourquoi et Comment' (juin)", "Usine Bleue: Logistique + inscription + suivi"] },
      { id: "PR-5.2", label: "Base de Connaissances Partagee", desc: "Wiki interne reseau: best practices, contacts, retours terrain.", status: "a-faire", leadMembre: "Usine Bleue AI",
        missions: ["Usine Bleue: Structure wiki (categories, tags, permissions)", "Tous: Contribuer 1 article par trimestre", "Usine Bleue: Moderation + qualite contenu"] },
    ],
  },
];

// ================================================================
// COMPUTED STATS
// ================================================================

const NB_CHANTIERS = CHANTIERS_RESEAU.length;
const NB_PROJETS = CHANTIERS_RESEAU.reduce((s, ch) => s + ch.projets.length, 0);
const NB_MISSIONS = CHANTIERS_RESEAU.reduce((s, ch) => s + ch.projets.reduce((s2, p) => s2 + p.missions.length, 0), 0);
const PROJETS_DONE = CHANTIERS_RESEAU.reduce((s, ch) => s + ch.projets.filter((p) => p.status === "done").length, 0);
const PROJETS_EN_COURS = CHANTIERS_RESEAU.reduce((s, ch) => s + ch.projets.filter((p) => p.status === "en-cours").length, 0);
const VALEUR_TOTALE = "1.31M$";

// ================================================================
// CONSTANTS
// ================================================================

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: Layers },
  { id: "profil", label: "Mon Profil", icon: Shield },
  { id: "cellules", label: "Cellules", icon: Handshake },
  { id: "chantiers", label: "Chantiers", icon: Flame },
  { id: "projets", label: "Projets", icon: Package },
  { id: "missions", label: "Missions", icon: ListChecks },
  { id: "prime-spot", label: "Prime Spot", icon: Star },
  { id: "pipeline", label: "Pipeline", icon: Route },
  { id: "membres", label: "Membres", icon: Users },
];

interface BlueprintNav {
  tab: TabId;
  chantierId: string | null;
  projetId: string | null;
  celluleId: string | null;
  goTo: (tab: TabId, chantierId?: string | null, projetId?: string | null, celluleId?: string | null) => void;
}

const STATUS_CONFIG = {
  "done": { label: "DONE", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  "en-cours": { label: "EN COURS", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  "a-faire": { label: "A FAIRE", bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
  "bloque": { label: "BLOQUE", bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
};

const CHALEUR_CONFIG = {
  "brule": { label: "BRULE", icon: Flame, color: "text-red-500" },
  "couve": { label: "COUVE", icon: Clock, color: "text-amber-500" },
  "meurt": { label: "MEURT", icon: Lock, color: "text-gray-400" },
};

const TYPE_COLORS: Record<string, string> = {
  "manufacturier": "from-blue-600 to-blue-500",
  "integrateur": "from-violet-600 to-violet-500",
  "equipementier": "from-emerald-600 to-emerald-500",
  "distributeur": "from-amber-600 to-amber-500",
  "consultant": "from-teal-600 to-teal-500",
};

const CELLULE_STATUS = {
  "active": { label: "Active", bg: "bg-emerald-100", text: "text-emerald-700" },
  "formation": { label: "En formation", bg: "bg-amber-100", text: "text-amber-700" },
  "prospect": { label: "Prospect", bg: "bg-gray-100", text: "text-gray-600" },
};

// ================================================================
// HELPER COMPONENTS
// ================================================================

function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", cfg.bg, cfg.text, cfg.border)}>
      {cfg.label}
    </span>
  );
}

function MembreBadge({ nom, type }: { nom: string; type?: string }) {
  const gradient = TYPE_COLORS[type || ""] || "from-gray-600 to-gray-500";
  return (
    <span className={cn("text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-gradient-to-r", gradient)}>
      {nom.split(" ")[0]}
    </span>
  );
}

// ================================================================
// TAB: VUE D'ENSEMBLE
// ================================================================

function TabOverview({ nav }: { nav: BlueprintNav }) {
  return (
    <div className="space-y-6">
      {/* KPIs Reseau */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "CELLULES", value: String(CELLULES.length), color: "text-orange-600", bg: "bg-orange-50" },
          { label: "MEMBRES", value: String(MEMBRES.length), color: "text-blue-600", bg: "bg-blue-50" },
          { label: "CHANTIERS", value: String(NB_CHANTIERS), color: "text-red-600", bg: "bg-red-50" },
          { label: "VALEUR TOTALE", value: VALEUR_TOTALE, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-lg p-3 text-center", s.bg)}>
            <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
            <div className="text-[9px] text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "PROJETS", value: String(NB_PROJETS), color: "text-violet-600", bg: "bg-violet-50" },
          { label: "MISSIONS", value: String(NB_MISSIONS), color: "text-pink-600", bg: "bg-pink-50" },
          { label: "DONE", value: String(PROJETS_DONE), color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "EN COURS", value: String(PROJETS_EN_COURS), color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-lg p-3 text-center", s.bg)}>
            <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
            <div className="text-[9px] text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Difference avec Blueprint interne */}
      <Card className="p-4 bg-orange-50/50 border-orange-200">
        <div className="flex items-center gap-2 mb-3">
          <Network className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-bold text-orange-800">Blueprint Reseau vs Blueprint Interne</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs font-bold text-blue-700">Blueprint Interne (RD.7)</div>
            <div className="text-[9px] text-gray-600 space-y-1">
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-blue-400" /> 1 entreprise, ses propres chantiers</div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-blue-400" /> Equipe interne: CEO + bots AI</div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-blue-400" /> Missions assignees aux bots C-Level</div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-blue-400" /> Gestion de projet classique</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold text-orange-700">Blueprint Reseau (RD.8)</div>
            <div className="text-[9px] text-gray-600 space-y-1">
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-orange-400" /> N entreprises, chantiers PARTAGES</div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-orange-400" /> Cellules: 3 membres complementaires</div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-orange-400" /> Missions internes + externes + ouvertes</div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-orange-400" /> Prime Spot: marketplace missions ouvertes</div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-orange-400" /> CarlOS de chaque cote synchronise</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Cellules actives — clickable */}
      <div>
        <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Cellules Actives</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CELLULES.map((cell) => {
            const st = CELLULE_STATUS[cell.status];
            return (
              <Card
                key={cell.id}
                className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                onClick={() => nav.goTo("cellules", null, null, cell.id)}
              >
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-3 py-2 flex items-center gap-2">
                  <Handshake className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-bold text-white flex-1 truncate">{cell.nom}</span>
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", st.bg, st.text)}>{st.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-white/60" />
                </div>
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    {cell.membres.map((m) => (
                      <MembreBadge key={m.id} nom={m.nom} type={m.type} />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-[9px] text-gray-400">
                    <span>{cell.nbChantiers} chantier{cell.nbChantiers > 1 ? "s" : ""}</span>
                    <span>Score: {cell.score}%</span>
                    <span>{cell.secteurPrincipal}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Chantiers brulants */}
      <div>
        <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Chantiers les plus chauds</div>
        <div className="space-y-2">
          {CHANTIERS_RESEAU.filter((c) => c.chaleur === "brule").map((ch) => {
            const ChaleurIcon = CHALEUR_CONFIG[ch.chaleur].icon;
            const done = ch.projets.filter((p) => p.status === "done").length;
            return (
              <Card
                key={ch.id}
                className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                onClick={() => nav.goTo("chantiers", ch.id)}
              >
                <div className={cn("bg-gradient-to-r px-3 py-2 flex items-center gap-2",
                  ch.color === "violet" ? "from-violet-600 to-violet-500" :
                  ch.color === "teal" ? "from-teal-600 to-teal-500" :
                  "from-blue-600 to-blue-500")}>
                  <ch.icon className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-bold text-white flex-1 truncate">{ch.label}</span>
                  <ChaleurIcon className={cn("h-3.5 w-3.5", CHALEUR_CONFIG[ch.chaleur].color)} />
                  <span className="text-[9px] text-white/80">{done}/{ch.projets.length}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-white/60" />
                </div>
                <div className="px-3 py-2">
                  <p className="text-[9px] text-gray-500 mb-1.5">{ch.desc.slice(0, 120)}...</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {ch.membres.map((m) => (
                      <span key={m} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{m}</span>
                    ))}
                    <span className="text-[9px] font-bold text-emerald-600 ml-auto">{ch.valeurEstimee}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// TAB: MON PROFIL RÉSEAU — CV Entreprise vérifié (type Uber Pro)
// ================================================================

const CERTIFICATIONS = [
  { label: "ISO 9001:2015", categorie: "Qualité", status: "verifie", expiration: "2027-06" },
  { label: "ISO 14001", categorie: "Environnement", status: "verifie", expiration: "2027-03" },
  { label: "C-TPAT", categorie: "Sécurité", status: "verifie", expiration: "2028-01" },
  { label: "RBQ — Licence entrepreneur", categorie: "Réglementaire", status: "verifie", expiration: "2027-12" },
  { label: "Programme Innovation — MEI", categorie: "Gouvernement", status: "en-cours", expiration: null },
  { label: "HACCP", categorie: "Alimentaire", status: "non-applicable", expiration: null },
];

const AVIS_REFERENCES = [
  { auteur: "MetalPro Sherbrooke", role: "Client manufacturier", score: 5, texte: "Intégration IA excellente. Équipe réactive, livrables à temps. Recommandé.", date: "2026-02-20" },
  { auteur: "TechnoBot QC", role: "Partenaire cellule", score: 4, texte: "Bonne collaboration sur le chantier soudage robotisé. Communication claire.", date: "2026-03-01" },
  { auteur: "Alimentation Boréal", role: "Client manufacturier", score: 5, texte: "Diagnostic VITAA transformateur. On voit enfin clair dans nos priorités.", date: "2026-01-15" },
];

function TabProfil() {
  const profil = MEMBRES[0]; // Usine Bleue AI — le profil de l'utilisateur
  const scoreReputation = 92;

  return (
    <div className="space-y-6">
      {/* Fiche Entreprise */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-sky-600" />
          <h3 className="text-sm font-semibold text-gray-900">Fiche Entreprise — Profil Réseau</h3>
          <span className="ml-auto text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Vérifié</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{profil.nom}</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
              <div><span className="font-medium text-gray-800">Type:</span> {profil.type}</div>
              <div><span className="font-medium text-gray-800">Secteur:</span> {profil.secteur}</div>
              <div><span className="font-medium text-gray-800">Ville:</span> {profil.ville}</div>
              <div><span className="font-medium text-gray-800">Employés:</span> {profil.nbEmployes}</div>
              <div><span className="font-medium text-gray-800">Stade Orbit9:</span> {profil.stadeOrbit9}/9</div>
              <div><span className="font-medium text-gray-800">VITAA Score:</span> {profil.vitaaScore}/100</div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profil.specialites.map((s) => (
                <span key={s} className="text-[9px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200">{s}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl">
            <div className="text-3xl font-black text-sky-700">{scoreReputation}</div>
            <div className="text-[9px] font-bold text-sky-600 uppercase tracking-wide mt-1">Score Réputation</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div className="bg-sky-500 rounded-full h-1.5" style={{ width: `${scoreReputation}%` }} />
            </div>
            <div className="text-[8px] text-gray-500 mt-1">Basé sur {AVIS_REFERENCES.length} collaborations</div>
          </div>
        </div>
      </Card>

      {/* Certifications & Sceaux de Qualité */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-900">Certifications & Sceaux de Qualité</h3>
          <span className="ml-auto text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {CERTIFICATIONS.filter((c) => c.status === "verifie").length}/{CERTIFICATIONS.length} vérifiées
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CERTIFICATIONS.map((cert) => (
            <div key={cert.label} className={cn(
              "flex items-center gap-2 p-2.5 rounded-lg border text-xs",
              cert.status === "verifie" && "bg-emerald-50/50 border-emerald-200",
              cert.status === "en-cours" && "bg-amber-50/50 border-amber-200",
              cert.status === "non-applicable" && "bg-gray-50 border-gray-200 opacity-50",
            )}>
              {cert.status === "verifie" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
              {cert.status === "en-cours" && <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
              {cert.status === "non-applicable" && <Lock className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
              <div>
                <div className="font-medium text-gray-800">{cert.label}</div>
                <div className="text-[9px] text-gray-500">{cert.categorie}{cert.expiration ? ` — Exp. ${cert.expiration}` : ""}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 p-2 bg-sky-50 rounded border border-dashed border-sky-200">
          <p className="text-[9px] text-sky-700">
            Les certifications sont vérifiées par CarlOS via validation documentaire.
            Chaque sceau visible par les autres membres = confiance accrue dans le matching Orbit9.
          </p>
        </div>
      </Card>

      {/* Confiance Bidirectionnelle */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Handshake className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-semibold text-gray-900">Confiance Bidirectionnelle</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3 italic">
          La confiance se joue des deux côtés — donneurs d'ordre ET sous-traitants se qualifient mutuellement.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-[9px] font-bold text-blue-700 uppercase tracking-wide mb-2">Côté Donneur d'Ordre</div>
            <ul className="space-y-1 text-xs text-gray-700">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Historique paiements à temps</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Clarté des spécifications</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Respect des engagements</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Communication réactive</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Volume contrats récurrents</li>
            </ul>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-wide mb-2">Côté Fournisseur / Sous-Traitant</div>
            <ul className="space-y-1 text-xs text-gray-700">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Livraison dans les délais</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Qualité conforme (taux rejet)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Certifications à jour</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Capacité réelle vs annoncée</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Support après-vente</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Avis & Références */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-gray-900">Avis & Références</h3>
          <span className="ml-auto text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            {AVIS_REFERENCES.length} avis vérifiés
          </span>
        </div>
        <div className="space-y-2">
          {AVIS_REFERENCES.map((avis) => (
            <div key={avis.auteur} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-xs font-semibold text-gray-800">{avis.auteur}</span>
                  <span className="text-[9px] text-gray-500 ml-2">{avis.role}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("h-3.5 w-3.5", i < avis.score ? "text-amber-400 fill-amber-400" : "text-gray-200")} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-600 italic">{avis.texte}</p>
              <div className="text-[9px] text-gray-400 mt-1">{avis.date}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Visibilité & Contrôle */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="h-4 w-4 text-gray-600" />
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
              "flex items-center gap-1.5 p-2 rounded text-xs border",
              item.visible ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-500",
            )}>
              {item.visible ? <Eye className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {item.label}
            </div>
          ))}
        </div>
        <div className="mt-3 p-2 bg-violet-50 rounded border border-dashed border-violet-200">
          <p className="text-[9px] text-violet-700">
            CarlOS présente les opportunités avec les infos publiques. Les données privées ne sont révélées
            qu'après accord mutuel des deux parties — confiance progressive, comme un dating professionnel.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// TAB: CELLULES
// ================================================================

function TabCellules({ nav }: { nav: BlueprintNav }) {
  const selected = nav.celluleId ? CELLULES.find((c) => c.id === nav.celluleId) : null;

  if (selected) {
    const chantiers = CHANTIERS_RESEAU.filter((ch) => ch.cellule === selected.id);
    return (
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-[9px] flex-wrap">
          <button onClick={() => nav.goTo("cellules")} className="text-orange-600 hover:underline font-medium">← Cellules</button>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="font-bold text-gray-700">{selected.nom}</span>
        </div>

        {/* Header cellule */}
        <Card className="p-4 bg-orange-50/50 border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <Handshake className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-bold text-orange-800">{selected.nom}</span>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", CELLULE_STATUS[selected.status].bg, CELLULE_STATUS[selected.status].text)}>{CELLULE_STATUS[selected.status].label}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {[
              { label: "SCORE MATCH", value: `${selected.score}%`, color: "text-orange-600", bg: "bg-orange-50" },
              { label: "CHANTIERS", value: String(chantiers.length), color: "text-red-600", bg: "bg-red-50" },
              { label: "MEMBRES", value: String(selected.membres.length), color: "text-blue-600", bg: "bg-blue-50" },
              { label: "CREATION", value: selected.dateCreation.slice(5), color: "text-gray-600", bg: "bg-gray-50" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-lg p-2 text-center", s.bg)}>
                <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
                <div className="text-[9px] text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Membres de la cellule */}
          <div className="space-y-2">
            {selected.membres.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r text-white text-[9px] font-bold", TYPE_COLORS[m.type])}>
                  {m.nom.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-800">{m.nom}</div>
                  <div className="text-[9px] text-gray-500">{m.type} — {m.ville} — {m.nbEmployes} employes</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-orange-600">Stade {m.stadeOrbit9}</div>
                  <div className="text-[9px] text-gray-400">VITAA {m.vitaaScore}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chantiers de cette cellule */}
        <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Chantiers de la cellule</div>
        <div className="space-y-2">
          {chantiers.map((ch) => {
            const done = ch.projets.filter((p) => p.status === "done").length;
            return (
              <Card key={ch.id} className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-all" onClick={() => nav.goTo("chantiers", ch.id)}>
                <div className={cn("bg-gradient-to-r px-3 py-2 flex items-center gap-2",
                  ch.color === "violet" ? "from-violet-600 to-violet-500" :
                  ch.color === "teal" ? "from-teal-600 to-teal-500" :
                  ch.color === "emerald" ? "from-emerald-600 to-emerald-500" :
                  ch.color === "blue" ? "from-blue-600 to-blue-500" :
                  "from-amber-600 to-amber-500")}>
                  <ch.icon className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-bold text-white flex-1">{ch.label}</span>
                  <span className="text-[9px] text-white/80">{done}/{ch.projets.length} projets</span>
                  <ChevronRight className="h-3.5 w-3.5 text-white/60" />
                </div>
                <div className="px-3 py-2">
                  <p className="text-[9px] text-gray-500">{ch.desc.slice(0, 100)}...</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[9px] text-gray-400">
                    <span className="font-bold text-emerald-600">{ch.valeurEstimee}</span>
                    <span>{ch.timing}</span>
                  </div>
                </div>
              </Card>
            );
          })}
          {chantiers.length === 0 && (
            <Card className="p-4 text-center text-xs text-gray-400">Aucun chantier actif dans cette cellule</Card>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "CELLULES", value: String(CELLULES.length), color: "text-orange-600", bg: "bg-orange-50" },
          { label: "ACTIVES", value: String(CELLULES.filter((c) => c.status === "active").length), color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "EN FORMATION", value: String(CELLULES.filter((c) => c.status === "formation").length), color: "text-amber-600", bg: "bg-amber-50" },
          { label: "PROSPECTS", value: String(CELLULES.filter((c) => c.status === "prospect").length), color: "text-gray-600", bg: "bg-gray-50" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-lg p-3 text-center", s.bg)}>
            <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
            <div className="text-[9px] text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {CELLULES.map((cell) => {
          const st = CELLULE_STATUS[cell.status];
          return (
            <Card key={cell.id} className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-all" onClick={() => nav.goTo("cellules", null, null, cell.id)}>
              <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-3 py-2 flex items-center gap-2">
                <Handshake className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-bold text-white flex-1 truncate">{cell.nom}</span>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", st.bg, st.text)}>{st.label}</span>
                <span className="text-[9px] text-white/80">Score {cell.score}%</span>
                <ChevronRight className="h-3.5 w-3.5 text-white/60" />
              </div>
              <div className="px-3 py-2">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  {cell.membres.map((m) => (
                    <MembreBadge key={m.id} nom={m.nom} type={m.type} />
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[9px] text-gray-400">
                  <span>{cell.nbChantiers} chantier{cell.nbChantiers > 1 ? "s" : ""}</span>
                  <span>{cell.secteurPrincipal}</span>
                  <span>Cree {cell.dateCreation}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
// TAB: CHANTIERS
// ================================================================

function TabChantiers({ nav }: { nav: BlueprintNav }) {
  const selected = nav.chantierId ? CHANTIERS_RESEAU.find((c) => c.id === nav.chantierId) : null;

  if (selected) {
    const done = selected.projets.filter((p) => p.status === "done").length;
    const enCours = selected.projets.filter((p) => p.status === "en-cours").length;
    const nbMissions = selected.projets.reduce((s, p) => s + p.missions.length, 0);
    const ChaleurIcon = CHALEUR_CONFIG[selected.chaleur].icon;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-1 text-[9px] flex-wrap">
          <button onClick={() => nav.goTo("chantiers")} className="text-orange-600 hover:underline font-medium">← Chantiers</button>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="font-bold text-gray-700">{selected.label}</span>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <selected.icon className={cn("h-4 w-4", `text-${selected.color}-600`)} />
            <span className="text-sm font-bold text-gray-800">{selected.label}</span>
            <ChaleurIcon className={cn("h-3.5 w-3.5", CHALEUR_CONFIG[selected.chaleur].color)} />
          </div>
          <p className="text-xs text-gray-500 mb-3">{selected.desc}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {[
              { label: "PROJETS", value: String(selected.projets.length), color: "text-violet-600", bg: "bg-violet-50" },
              { label: "MISSIONS", value: String(nbMissions), color: "text-pink-600", bg: "bg-pink-50" },
              { label: "DONE", value: String(done), color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "VALEUR", value: selected.valeurEstimee, color: "text-blue-600", bg: "bg-blue-50" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-lg p-2 text-center", s.bg)}>
                <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
                <div className="text-[9px] text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selected.membres.map((m) => (
              <span key={m} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{m}</span>
            ))}
            <span className="text-[9px] text-gray-400 ml-2">Cellule: {selected.cellule}</span>
          </div>
        </Card>

        {/* Projets du chantier */}
        <div className="space-y-2">
          {selected.projets.map((p) => (
            <Card key={p.id} className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-all" onClick={() => nav.goTo("projets", selected.id, p.id)}>
              <div className={cn("bg-gradient-to-r px-3 py-2 flex items-center gap-2",
                p.status === "done" ? "from-emerald-600 to-emerald-500" :
                p.status === "en-cours" ? "from-amber-600 to-amber-500" :
                p.status === "bloque" ? "from-red-600 to-red-500" :
                "from-gray-500 to-gray-400")}>
                <Package className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-bold text-white flex-1 truncate">{p.label}</span>
                <StatusBadge status={p.status} />
                <span className="text-[9px] text-white/80">{p.missions.length} missions</span>
                <ChevronRight className="h-3.5 w-3.5 text-white/60" />
              </div>
              <div className="px-3 py-2">
                <p className="text-[9px] text-gray-500 mb-1">{p.desc.slice(0, 120)}</p>
                <div className="text-[9px] text-gray-400">Lead: {p.leadMembre}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "CHANTIERS", value: String(NB_CHANTIERS), color: "text-red-600", bg: "bg-red-50" },
          { label: "PROJETS", value: String(NB_PROJETS), color: "text-violet-600", bg: "bg-violet-50" },
          { label: "DONE", value: String(PROJETS_DONE), color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "EN COURS", value: String(PROJETS_EN_COURS), color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-lg p-3 text-center", s.bg)}>
            <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
            <div className="text-[9px] text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {CHANTIERS_RESEAU.map((ch) => {
          const ChaleurIcon = CHALEUR_CONFIG[ch.chaleur].icon;
          const done = ch.projets.filter((p) => p.status === "done").length;
          const colorMap: Record<string, string> = {
            violet: "from-violet-600 to-violet-500",
            teal: "from-teal-600 to-teal-500",
            emerald: "from-emerald-600 to-emerald-500",
            blue: "from-blue-600 to-blue-500",
            amber: "from-amber-600 to-amber-500",
          };
          return (
            <Card key={ch.id} className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-all" onClick={() => nav.goTo("chantiers", ch.id)}>
              <div className={cn("bg-gradient-to-r px-3 py-2 flex items-center gap-2", colorMap[ch.color] || "from-gray-600 to-gray-500")}>
                <ch.icon className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-bold text-white flex-1 truncate">{ch.num}. {ch.label}</span>
                <ChaleurIcon className={cn("h-3.5 w-3.5", CHALEUR_CONFIG[ch.chaleur].color)} />
                <span className="text-[9px] text-white/80">{done}/{ch.projets.length}</span>
                <ChevronRight className="h-3.5 w-3.5 text-white/60" />
              </div>
              <div className="px-3 py-2">
                <p className="text-[9px] text-gray-500 mb-1.5">{ch.desc.slice(0, 120)}...</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {ch.membres.map((m) => (
                    <span key={m} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{m}</span>
                  ))}
                  <span className="text-[9px] font-bold text-emerald-600 ml-auto">{ch.valeurEstimee}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
// TAB: PROJETS
// ================================================================

function TabProjets({ nav }: { nav: BlueprintNav }) {
  const allProjets = CHANTIERS_RESEAU.flatMap((ch) => ch.projets.map((p) => ({ ...p, chantier: ch })));
  const selected = nav.projetId ? allProjets.find((p) => p.id === nav.projetId) : null;

  if (selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-1 text-[9px] flex-wrap">
          <button onClick={() => nav.goTo("projets")} className="text-orange-600 hover:underline font-medium">← Projets</button>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <button onClick={() => nav.goTo("chantiers", selected.chantier.id)} className="text-orange-600 hover:underline">{selected.chantier.label}</button>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="font-bold text-gray-700">{selected.label}</span>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-bold text-gray-800">{selected.label}</span>
            <StatusBadge status={selected.status} />
          </div>
          <p className="text-xs text-gray-500 mb-3">{selected.desc}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {[
              { label: "MISSIONS", value: String(selected.missions.length), color: "text-pink-600", bg: "bg-pink-50" },
              { label: "LEAD", value: selected.leadMembre.split(" ")[0], color: "text-blue-600", bg: "bg-blue-50" },
              { label: "CHANTIER", value: selected.chantier.label.split(" ")[0], color: "text-red-600", bg: "bg-red-50" },
              { label: "STATUS", value: STATUS_CONFIG[selected.status].label, color: "text-gray-600", bg: "bg-gray-50" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-lg p-2 text-center", s.bg)}>
                <div className={cn("text-sm font-bold", s.color)}>{s.value}</div>
                <div className="text-[9px] text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Missions du projet */}
        <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Missions ({selected.missions.length})</div>
        <div className="space-y-2">
          {selected.missions.map((m, i) => {
            const parts = m.split(": ");
            const assignee = parts[0];
            const desc = parts.slice(1).join(": ");
            const isMfg = MEMBRES.some((mb) => mb.type === "manufacturier" && assignee.includes(mb.nom.split(" ")[0]));
            const gradient = isMfg ? "from-blue-600 to-blue-500" : "from-emerald-600 to-emerald-500";
            return (
              <Card key={i} className="p-0 overflow-hidden">
                <div className={cn("bg-gradient-to-r px-3 py-2 flex items-center gap-2", gradient)}>
                  <ListChecks className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-bold text-white flex-1 truncate">{assignee}</span>
                  <span className="text-[9px] text-white/60">M-{i + 1}</span>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[9px] text-gray-600">{desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // List view — tous les projets groupes par chantier
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "PROJETS", value: String(allProjets.length), color: "text-violet-600", bg: "bg-violet-50" },
          { label: "DONE", value: String(allProjets.filter((p) => p.status === "done").length), color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "EN COURS", value: String(allProjets.filter((p) => p.status === "en-cours").length), color: "text-amber-600", bg: "bg-amber-50" },
          { label: "A FAIRE", value: String(allProjets.filter((p) => p.status === "a-faire").length), color: "text-gray-600", bg: "bg-gray-50" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-lg p-3 text-center", s.bg)}>
            <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
            <div className="text-[9px] text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {CHANTIERS_RESEAU.map((ch) => (
        <div key={ch.id}>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-4">{ch.label}</div>
          <div className="space-y-2">
            {ch.projets.map((p) => (
              <Card key={p.id} className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-all" onClick={() => nav.goTo("projets", ch.id, p.id)}>
                <div className={cn("bg-gradient-to-r px-3 py-2 flex items-center gap-2",
                  p.status === "done" ? "from-emerald-600 to-emerald-500" :
                  p.status === "en-cours" ? "from-amber-600 to-amber-500" :
                  "from-gray-500 to-gray-400")}>
                  <Package className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-bold text-white flex-1 truncate">{p.label}</span>
                  <StatusBadge status={p.status} />
                  <span className="text-[9px] text-white/80">{p.missions.length} missions</span>
                  <ChevronRight className="h-3.5 w-3.5 text-white/60" />
                </div>
                <div className="px-3 py-2">
                  <p className="text-[9px] text-gray-500">{p.desc.slice(0, 100)}</p>
                  <div className="text-[9px] text-gray-400 mt-1">Lead: {p.leadMembre}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ================================================================
// TAB: MISSIONS
// ================================================================

function TabMissions({ nav }: { nav: BlueprintNav }) {
  const allMissions = CHANTIERS_RESEAU.flatMap((ch) =>
    ch.projets.flatMap((p) =>
      p.missions.map((m) => ({ raw: m, projet: p, chantier: ch }))
    )
  );

  // Classifier missions
  const mfgMissions = allMissions.filter((m) => {
    const assignee = m.raw.split(":")[0].trim();
    return MEMBRES.some((mb) => mb.type === "manufacturier" && assignee.includes(mb.nom.split(" ")[0]));
  });
  const fournisseurMissions = allMissions.filter((m) => !mfgMissions.includes(m));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "MISSIONS TOTALES", value: String(allMissions.length), color: "text-pink-600", bg: "bg-pink-50" },
          { label: "MANUFACTURIER", value: String(mfgMissions.length), color: "text-blue-600", bg: "bg-blue-50" },
          { label: "FOURNISSEURS", value: String(fournisseurMissions.length), color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "CHANTIERS", value: String(NB_CHANTIERS), color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-lg p-3 text-center", s.bg)}>
            <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
            <div className="text-[9px] text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Missions par chantier */}
      {CHANTIERS_RESEAU.map((ch) => (
        <div key={ch.id}>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-4">
            {ch.label} — {ch.projets.reduce((s, p) => s + p.missions.length, 0)} missions
          </div>
          <div className="space-y-1.5">
            {ch.projets.flatMap((p) =>
              p.missions.map((m, i) => {
                const parts = m.split(": ");
                const assignee = parts[0];
                const desc = parts.slice(1).join(": ");
                const isMfg = MEMBRES.some((mb) => mb.type === "manufacturier" && assignee.includes(mb.nom.split(" ")[0]));
                return (
                  <div key={`${p.id}-${i}`} className="flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50">
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", isMfg ? "bg-blue-500" : "bg-emerald-500")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-gray-700">{assignee}</span>
                        <span className="text-[9px] text-gray-300">•</span>
                        <span className="text-[9px] text-gray-400">{p.label}</span>
                      </div>
                      <p className="text-[9px] text-gray-500">{desc}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}

      {/* Legende */}
      <div className="flex items-center gap-4 text-[9px] text-gray-400 pt-2 border-t">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Manufacturier (client)</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Fournisseur / Integrateur</div>
      </div>
    </div>
  );
}

// ================================================================
// TAB: PRIME SPOT (missions ouvertes — marketplace)
// ================================================================

function TabPrimeSpot() {
  const MISSIONS_OUVERTES = [
    { id: "MO-001", titre: "Installation Cobot Soudage (UR10e)", mfg: "MetalPro Sherbrooke", secteur: "Metallurgie", budget: "45K$", urgence: "haute", competences: ["Robotique UR", "Soudage MIG/TIG", "Integration PLC"], deadline: "2026-04-15" },
    { id: "MO-002", titre: "Audit Energetique Usine Complete", mfg: "QC Plasturgie", secteur: "Plasturgie", budget: "12K$", urgence: "moyenne", competences: ["Audit energetique", "Injection plastique", "Hydro-QC"], deadline: "2026-05-01" },
    { id: "MO-003", titre: "Integration MES Ligne Emballage", mfg: "Alimentation Boreal", secteur: "Agroalimentaire", budget: "28K$", urgence: "haute", competences: ["MES/SCADA", "Emballage automatise", "HACCP"], deadline: "2026-04-30" },
    { id: "MO-004", titre: "Formation Operateurs CNC 5 Axes", mfg: "Precision CNC Beauce", secteur: "Usinage", budget: "8K$", urgence: "basse", competences: ["CNC 5 axes", "Formation technique", "Programmation FAO"], deadline: "2026-06-01" },
    { id: "MO-005", titre: "Design Cellule Palettisation", mfg: "Alimentation Boreal", secteur: "Agroalimentaire", budget: "65K$", urgence: "moyenne", competences: ["Robotique palettisation", "Convoyeurs", "Vision industrielle"], deadline: "2026-05-15" },
  ];

  return (
    <div className="space-y-4">
      {/* Explication Prime Spot */}
      <Card className="p-4 bg-amber-50/50 border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-bold text-amber-800">Prime Spot — Missions Ouvertes</span>
        </div>
        <p className="text-xs text-gray-600">
          Quand un manufacturier a un besoin d'expertise externe, sa mission devient <strong>ouverte</strong>.
          Les fournisseurs du reseau voient ces opportunites ici et levent la main.
          CarlOS qualifie le match et connecte les deux parties.
        </p>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "MISSIONS OUVERTES", value: String(MISSIONS_OUVERTES.length), color: "text-amber-600", bg: "bg-amber-50" },
          { label: "VALEUR TOTALE", value: "158K$", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "URGENTES", value: String(MISSIONS_OUVERTES.filter((m) => m.urgence === "haute").length), color: "text-red-600", bg: "bg-red-50" },
          { label: "SECTEURS", value: "4", color: "text-blue-600", bg: "bg-blue-50" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-lg p-3 text-center", s.bg)}>
            <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
            <div className="text-[9px] text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {MISSIONS_OUVERTES.map((mo) => (
          <Card key={mo.id} className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-all">
            <div className={cn("bg-gradient-to-r px-3 py-2 flex items-center gap-2",
              mo.urgence === "haute" ? "from-red-600 to-red-500" :
              mo.urgence === "moyenne" ? "from-amber-600 to-amber-500" :
              "from-gray-500 to-gray-400")}>
              <Star className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-bold text-white flex-1 truncate">{mo.titre}</span>
              <span className="text-[9px] font-bold text-white bg-white/20 px-1.5 py-0.5 rounded">{mo.budget}</span>
            </div>
            <div className="px-3 py-2 space-y-1.5">
              <div className="flex items-center gap-2 text-[9px]">
                <span className="text-gray-500">Demandeur:</span>
                <span className="font-bold text-blue-600">{mo.mfg}</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-400">{mo.secteur}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {mo.competences.map((c) => (
                  <span key={c} className="text-[8px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded border border-violet-100 font-medium">{c}</span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-[9px] text-gray-400">
                <span>Deadline: {mo.deadline}</span>
                <span className={cn("font-bold",
                  mo.urgence === "haute" ? "text-red-500" :
                  mo.urgence === "moyenne" ? "text-amber-500" : "text-gray-400")}>
                  Urgence: {mo.urgence}
                </span>
                <button className="ml-auto text-[9px] font-bold text-orange-600 hover:underline flex items-center gap-1">
                  Lever la main <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// TAB: PIPELINE MATCHING
// ================================================================

function TabPipeline() {
  const STAGES = [
    { label: "Prospects", count: 8, color: "bg-gray-400", desc: "Entreprises identifiees, pas encore contactees" },
    { label: "Contact Initial", count: 5, color: "bg-blue-500", desc: "Premier echange, diagnostic VITAA en cours" },
    { label: "Qualification", count: 4, color: "bg-violet-500", desc: "VITAA complete, matching en cours" },
    { label: "Cellule Formee", count: 3, color: "bg-amber-500", desc: "Cellule matchee, 1er chantier en discussion" },
    { label: "Chantier Actif", count: 2, color: "bg-emerald-500", desc: "Chantier lance, collaboration en cours" },
    { label: "Recurrence", count: 1, color: "bg-orange-500", desc: "2e+ chantier, relation etablie" },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-blue-50/50 border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Route className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold text-blue-800">Pipeline Matching Orbit9</span>
        </div>
        <p className="text-xs text-gray-600">
          Funnel de collaboration: de l'identification d'un prospect a la recurrence de chantiers partages.
          CarlOS guide chaque etape — le membre ne decide que GO ou STOP.
        </p>
      </Card>

      {/* Funnel visuel */}
      <div className="space-y-2">
        {STAGES.map((st, i) => {
          const width = 100 - (i * 12);
          return (
            <div key={st.label} className="flex items-center gap-3">
              <div className="w-28 text-right">
                <span className="text-[9px] font-bold text-gray-600">{st.label}</span>
              </div>
              <div className="flex-1">
                <div
                  className={cn("h-8 rounded-lg flex items-center px-3", st.color)}
                  style={{ width: `${width}%` }}
                >
                  <span className="text-sm font-bold text-white">{st.count}</span>
                </div>
              </div>
              <div className="w-48">
                <span className="text-[9px] text-gray-400">{st.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Metriques conversion */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[
          { label: "CONVERSION TOTALE", value: "12.5%", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "TEMPS MOYEN QUALIF", value: "14 jours", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "VALEUR PIPELINE", value: "2.1M$", color: "text-violet-600", bg: "bg-violet-50" },
          { label: "NPS RESEAU", value: "78", color: "text-orange-600", bg: "bg-orange-50" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-lg p-3 text-center", s.bg)}>
            <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
            <div className="text-[9px] text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// TAB: MEMBRES
// ================================================================

function TabMembres() {
  const typeGroups = ["manufacturier", "integrateur", "equipementier", "distributeur", "consultant"] as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "MEMBRES", value: String(MEMBRES.length), color: "text-blue-600", bg: "bg-blue-50" },
          { label: "MANUFACTURIERS", value: String(MEMBRES.filter((m) => m.type === "manufacturier").length), color: "text-blue-600", bg: "bg-blue-50" },
          { label: "FOURNISSEURS", value: String(MEMBRES.filter((m) => m.type !== "manufacturier").length), color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "VITAA MOYEN", value: `${Math.round(MEMBRES.reduce((s, m) => s + m.vitaaScore, 0) / MEMBRES.length)}%`, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-lg p-3 text-center", s.bg)}>
            <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
            <div className="text-[9px] text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {typeGroups.map((type) => {
        const members = MEMBRES.filter((m) => m.type === type);
        if (members.length === 0) return null;
        return (
          <div key={type}>
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-4">{type}s ({members.length})</div>
            <div className="space-y-2">
              {members.map((m) => (
                <Card key={m.id} className="p-0 overflow-hidden">
                  <div className={cn("bg-gradient-to-r px-3 py-2 flex items-center gap-2", TYPE_COLORS[m.type])}>
                    <Users className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-bold text-white flex-1">{m.nom}</span>
                    <span className="text-[9px] text-white/80">Stade {m.stadeOrbit9}</span>
                    <span className="text-[9px] text-white/80">VITAA {m.vitaaScore}%</span>
                  </div>
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2 text-[9px] text-gray-500 mb-1.5">
                      <span>{m.ville}</span>
                      <span>•</span>
                      <span>{m.secteur}</span>
                      <span>•</span>
                      <span>{m.nbEmployes} employes</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {m.specialites.map((sp) => (
                        <span key={sp} className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{sp}</span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function BlueprintReseauPage() {
  const { setActiveView } = useFrameMaster();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [chantierId, setChantierId] = useState<string | null>(null);
  const [projetId, setProjetId] = useState<string | null>(null);
  const [celluleId, setCelluleId] = useState<string | null>(null);

  const nav: BlueprintNav = {
    tab: activeTab,
    chantierId,
    projetId,
    celluleId,
    goTo: (tab, chId = null, pId = null, cId = null) => {
      setActiveTab(tab);
      setChantierId(chId);
      setProjetId(pId);
      setCelluleId(cId);
    },
  };

  return (
    <PageLayout maxWidth="4xl" showPresence={false} onBack={() => setActiveView("dashboard")}>
      <PageHeader
        icon={Network}
        title="Blueprint Reseau Orbit9"
        subtitle={`${CELLULES.length} cellules • ${MEMBRES.length} membres • ${NB_CHANTIERS} chantiers partages • ${NB_MISSIONS} missions`}
        gradient="from-orange-700 to-orange-500"
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-6 border-b border-gray-100">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => nav.goTo(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-colors",
                active ? "bg-orange-50 text-orange-700 border-b-2 border-orange-500" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <TabOverview nav={nav} />}
      {activeTab === "profil" && <TabProfil />}
      {activeTab === "cellules" && <TabCellules nav={nav} />}
      {activeTab === "chantiers" && <TabChantiers nav={nav} />}
      {activeTab === "projets" && <TabProjets nav={nav} />}
      {activeTab === "missions" && <TabMissions nav={nav} />}
      {activeTab === "prime-spot" && <TabPrimeSpot />}
      {activeTab === "pipeline" && <TabPipeline />}
      {activeTab === "membres" && <TabMembres />}
    </PageLayout>
  );
}
