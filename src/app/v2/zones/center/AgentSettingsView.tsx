/**
 * AgentSettingsView.tsx — Profil Agent AI (CV + Profil Psychométrique)
 * Gauche: Fiche technique (rôle, département, mode décision, compétences)
 * Droite: Profil cognitif (trisociation, style de communication, forces)
 * D-061: Ghosts = Teintures Cognitives (archétypes, pas des clones)
 * Session 37: Redesign CV + psychométrique
 */

import { useState, useEffect, useMemo } from "react";
import {
  Bot,
  Target,
  Zap,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  Check,
  Sparkles,
  Brain,
  ChevronDown,
  ChevronRight,
  Quote,
  Cpu,
  Pencil,
  Shield,
  MessageCircle,
  TrendingUp,
  Award,
  ClipboardList,
  Clock,
  Users,
  Activity,
  FileText,
  Star,
  Timer,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { BOT_AVATAR, BOT_SUBTITLE } from "../../api/types";
import { api } from "../../api/client";
import { useMissions } from "../../api/hooks";
import { PageLayout } from "./layouts/PageLayout";
import { PageHeader } from "./layouts/PageHeader";

// ── Archétypes cognitifs ──

interface Archetype {
  emoji: string;
  nom: string;
  categorie: string;
  signature: string;
  impact: string;
}

const GHOST_ARCHETYPES: Record<string, Archetype> = {
  "Bezos": { emoji: "📦", nom: "L'Architecte Client", categorie: "Strategie", signature: "Obsession client, vision à rebours depuis le résultat final", impact: "Commence toujours par «quel problème client ça résout?» avant d'analyser les moyens." },
  "Sun Tzu": { emoji: "⚔️", nom: "Le Stratège Silencieux", categorie: "Strategie", signature: "Gagner sans combattre — l'ennemi doit être vaincu avant la bataille", impact: "Analyse les forces en présence. Cherche le levier maximal pour minimum d'effort." },
  "Munger": { emoji: "🧠", nom: "L'Inverseur", categorie: "Strategie", signature: "Modèles mentaux croisés — retourner le problème révèle la vérité", impact: "Inverse chaque problème: identifie d'abord ce qui ferait échouer. Croise plusieurs disciplines." },
  "Musashi": { emoji: "🗡️", nom: "L'Artisan", categorie: "Strategie", signature: "Maîtrise par la pratique quotidienne", impact: "Insiste sur l'excellence d'exécution avant la croissance." },
  "Machiavel": { emoji: "🦊", nom: "Le Renard", categorie: "Strategie", signature: "Pragmatisme lucide — voir le pouvoir tel qu'il est", impact: "Nomme ce que les autres taisent sur les jeux politiques et les intérêts réels." },
  "Thiel": { emoji: "🔮", nom: "Le Contrarian", categorie: "Strategie", signature: "Vérités cachées, zéro à un", impact: "Questionne systématiquement les évidences du secteur." },
  "Chanel": { emoji: "👗", nom: "L'Élégante", categorie: "Strategie", signature: "La marque personnelle comme arme stratégique", impact: "Privilégie le positionnement et l'identité distinctive avant le prix." },
  "Jobs": { emoji: "🍎", nom: "L'Épureur", categorie: "Innovation", signature: "Simplification radicale — ôter tout ce qui n'est pas nécessaire", impact: "Pousse vers la solution la plus simple. Refuse la complexité inutile." },
  "Musk": { emoji: "🚀", nom: "Le Disrupteur", categorie: "Innovation", signature: "Premiers principes, objectifs impossibles", impact: "Repart de zéro face aux contraintes. Propose des objectifs 10×." },
  "Tesla": { emoji: "⚡", nom: "Le Catalyseur", categorie: "Innovation", signature: "Patterns universels, résonance systémique", impact: "Relie des éléments disparates entre domaines. Identifie les patterns récurrents." },
  "Vinci": { emoji: "🎨", nom: "L'Universel", categorie: "Creativite", signature: "Polymathie — fusion art et science", impact: "Fait des ponts entre disciplines opposées." },
  "Marc Aurèle": { emoji: "🏛️", nom: "Le Stoïque", categorie: "Leadership", signature: "Maîtrise de soi — contrôler ce qui est contrôlable", impact: "Sépare les faits des interprétations. Recentre sur ce qui dépend de vous." },
  "Churchill": { emoji: "🎩", nom: "L'Inébranlable", categorie: "Leadership", signature: "La persévérance transforme la défaite en victoire", impact: "Ne capitule jamais. Cherche le levier de retournement." },
  "Oprah": { emoji: "💜", nom: "L'Authentique", categorie: "Leadership", signature: "Empathie profonde — dire la vérité avec amour", impact: "Nomme l'éléphant dans la pièce. Intègre la dimension humaine." },
  "Mandela": { emoji: "✊", nom: "Le Transformateur", categorie: "Leadership", signature: "Résilience absolue — le leadership est un service", impact: "Place l'impact humain avant l'impact financier." },
  "Franklin": { emoji: "📜", nom: "Le Fondateur Sage", categorie: "Leadership", signature: "Autodiscipline, pragmatisme — bâtir pour durer", impact: "Évalue chaque décision sur 10 ans et la réputation." },
  "Buffett": { emoji: "💰", nom: "Le Gardien de Valeur", categorie: "Finance", signature: "Patience disciplinée, valeur intrinsèque", impact: "Refuse les décisions hors du cercle de compétence. Recommande la patience." },
  "Curie": { emoji: "🔬", nom: "La Méthodique", categorie: "Analyse", signature: "Données avant conclusions — rigueur scientifique", impact: "Structure l'analyse avec des hypothèses testables." },
  "Deming": { emoji: "📊", nom: "Le Mesureur", categorie: "Operations", signature: "On n'améliore que ce qu'on mesure", impact: "Impose des métriques claires. Construit des boucles de rétroaction." },
  "Ohno": { emoji: "🏭", nom: "Le Flux", categorie: "Operations", signature: "Éliminer le gaspillage — aller voir sur le terrain", impact: "Traque les étapes sans valeur ajoutée." },
  "Nightingale": { emoji: "🕯️", nom: "La Pionnière", categorie: "Operations", signature: "Innovation systémique par les données", impact: "Change les systèmes, pas les symptômes." },
};

// ── Slots Trisociation ──

const SLOT_LABELS = ["Primaire", "Calibrateur", "Amplificateur"];
const SLOT_ROLES = [
  "Modèle dominant — colore la majorité des analyses",
  "Modèle régulateur — équilibre la pensée principale",
  "Modèle catalyseur — amplifie sur les sujets complexes",
];
const SLOT_GRADIENTS = ["from-blue-600 to-blue-500", "from-violet-600 to-violet-500", "from-amber-600 to-amber-500"];
const SLOT_LIGHT_BG = ["bg-blue-50 border-blue-200", "bg-violet-50 border-violet-200", "bg-amber-50 border-amber-200"];
const SLOT_TEXT = ["text-blue-700", "text-violet-700", "text-amber-700"];
const SLOT_BTN = ["border-blue-300 text-blue-700 hover:bg-blue-100", "border-violet-300 text-violet-700 hover:bg-violet-100", "border-amber-300 text-amber-700 hover:bg-amber-100"];
const SLOT_BTN_ACTIVE = ["bg-blue-600 text-white border-blue-600", "bg-violet-600 text-white border-violet-600", "bg-amber-600 text-white border-amber-600"];

// ── Trisociations par bot ──

const BOT_GHOSTS: Record<string, string[]> = {
  CEOB: ["Bezos", "Munger", "Churchill"],
  CTOB: ["Musk", "Curie", "Vinci"],
  CFOB: ["Buffett", "Munger", "Franklin"],
  CMOB: ["Jobs", "Tesla", "Oprah"],
  CSOB: ["Sun Tzu", "Thiel", "Chanel"],
  COOB: ["Marc Aurèle", "Deming", "Nightingale"],
  CPOB: ["Ohno", "Deming", "Nightingale"],
  CHROB: ["Oprah", "Marc Aurèle", "Deming"],
  CINOB: ["Musk", "Curie", "Tesla"],
  CROB: ["Thiel", "Bezos", "Chanel"],
  CLOB: ["Munger", "Franklin", "Marc Aurèle"],
  CISOB: ["Sun Tzu", "Curie", "Franklin"],
};

// ── Catégories ──

const CATEGORY_ORDER = ["Strategie", "Innovation", "Leadership", "Finance", "Analyse", "Creativite", "Operations"];
const CATEGORY_META: Record<string, { emoji: string; badgeClass: string }> = {
  Strategie:   { emoji: "⚔️",  badgeClass: "text-blue-600 bg-blue-50 border-blue-200" },
  Innovation:  { emoji: "🚀",  badgeClass: "text-violet-600 bg-violet-50 border-violet-200" },
  Leadership:  { emoji: "🏛️",  badgeClass: "text-amber-600 bg-amber-50 border-amber-200" },
  Finance:     { emoji: "💰",  badgeClass: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  Analyse:     { emoji: "🔬",  badgeClass: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  Creativite:  { emoji: "✨",  badgeClass: "text-pink-600 bg-pink-50 border-pink-200" },
  Operations:  { emoji: "🏭",  badgeClass: "text-orange-600 bg-orange-50 border-orange-200" },
};

function archetypeBadgeClass(cat: string) {
  return CATEGORY_META[cat]?.badgeClass ?? "text-gray-600 bg-gray-50 border-gray-200";
}

// ── Modes de décision ──

interface DecisionMode {
  id: string; label: string; icon: React.ElementType;
  color: string; bgColor: string; gradient: string;
  description: string; comportement: string; exemple: string;
}

const DECISION_MODES: DecisionMode[] = [
  { id: "strategique", label: "Stratégique", icon: Target, color: "text-blue-600", bgColor: "bg-blue-50 border-blue-300", gradient: "from-blue-600 to-blue-500", description: "Vision long terme, implications systémiques", comportement: "Pense à 3-5 ans, analyse les effets de second ordre.", exemple: "«Quels sont les risques invisibles à 3 ans?»" },
  { id: "tactique", label: "Tactique", icon: Zap, color: "text-amber-600", bgColor: "bg-amber-50 border-amber-300", gradient: "from-amber-600 to-amber-500", description: "Action concrète dans les 48h", comportement: "Compresse l'analyse, pousse vers des actions immédiates.", exemple: "«Quelle est l'action précise pour demain matin?»" },
  { id: "analytique", label: "Analytique", icon: BarChart3, color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-300", gradient: "from-emerald-600 to-emerald-500", description: "Data-driven, hypothèses testables", comportement: "Demande les données avant de conclure. Structure en comparatifs.", exemple: "«Quelles données me manquent pour valider?»" },
  { id: "creatif", label: "Créatif", icon: Lightbulb, color: "text-purple-600", bgColor: "bg-purple-50 border-purple-300", gradient: "from-purple-600 to-fuchsia-500", description: "Angles inattendus, rapprochements", comportement: "Sort des sentiers battus. Propose 3 options non-conventionnelles.", exemple: "«Et si on faisait l'exact opposé?»" },
  { id: "crise", label: "Crise", icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50 border-red-300", gradient: "from-red-600 to-red-500", description: "Triage immédiat, zéro superflu", comportement: "Répond direct. Structure en: 24h / 7j / ignorer.", exemple: "«L'unique chose à régler aujourd'hui?»" },
];

// ── Profil psychométrique par bot ──

const BOT_PROFILES: Record<string, {
  style: string; forces: string[]; approche: string;
  scores: { strategique: number; analytique: number; creatif: number; operationnel: number; relationnel: number };
}> = {
  CEOB: { style: "Directif et visionnaire", forces: ["Vision stratégique", "Prise de décision", "Leadership mobilisateur", "Gestion de crise"], approche: "Part toujours du résultat voulu pour le client et remonte vers la stratégie.", scores: { strategique: 95, analytique: 75, creatif: 70, operationnel: 60, relationnel: 80 } },
  CTOB: { style: "Innovateur et méthodique", forces: ["Architecture technique", "Innovation disruptive", "Résolution complexe", "Prototypage rapide"], approche: "Repart des premiers principes et challenge les contraintes perçues.", scores: { strategique: 70, analytique: 90, creatif: 95, operationnel: 80, relationnel: 55 } },
  CFOB: { style: "Prudent et discipliné", forces: ["Analyse financière", "Gestion du risque", "Valorisation", "Planification budgétaire"], approche: "Évalue la valeur intrinsèque avant le prix apparent. Patient.", scores: { strategique: 80, analytique: 95, creatif: 40, operationnel: 70, relationnel: 50 } },
  CMOB: { style: "Créatif et empathique", forces: ["Positionnement de marque", "Storytelling", "Analyse d'audience", "Innovation marketing"], approche: "Simplifie le message jusqu'à l'essentiel. Connexion émotionnelle.", scores: { strategique: 65, analytique: 60, creatif: 95, operationnel: 50, relationnel: 90 } },
  CSOB: { style: "Stratège et incisif", forces: ["Analyse concurrentielle", "Planification stratégique", "Anticipation", "Positionnement marché"], approche: "Analyse les forces en présence avant toute recommandation.", scores: { strategique: 95, analytique: 85, creatif: 60, operationnel: 50, relationnel: 45 } },
  COOB: { style: "Méthodique et fiable", forces: ["Optimisation processus", "Gestion qualité", "Logistique", "Amélioration continue"], approche: "Mesure tout, élimine le gaspillage, construit des systèmes robustes.", scores: { strategique: 60, analytique: 80, creatif: 40, operationnel: 95, relationnel: 65 } },
  CPOB: { style: "Pragmatique et terrain", forces: ["Planification production", "Contrôle qualité", "Lean manufacturing", "Gestion d'usine"], approche: "Va sur le terrain. Élimine les étapes sans valeur ajoutée.", scores: { strategique: 45, analytique: 75, creatif: 35, operationnel: 95, relationnel: 50 } },
  CHROB: { style: "Empathique et structuré", forces: ["Gestion des talents", "Culture d'entreprise", "Résolution de conflits", "Développement RH"], approche: "Place l'humain au centre de chaque décision organisationnelle.", scores: { strategique: 55, analytique: 65, creatif: 50, operationnel: 70, relationnel: 95 } },
  CINOB: { style: "Technique et visionnaire", forces: ["Architecture IT", "Cybersécurité", "Transformation digitale", "Infrastructure cloud"], approche: "Construit des systèmes scalables en partant des premiers principes.", scores: { strategique: 70, analytique: 95, creatif: 75, operationnel: 85, relationnel: 40 } },
  CROB: { style: "Dynamique et orienté résultat", forces: ["Vente consultative", "Pipeline management", "Closing", "Revenue ops"], approche: "Toujours en mode solution. Cherche le chemin le plus court vers le deal.", scores: { strategique: 70, analytique: 65, creatif: 60, operationnel: 75, relationnel: 90 } },
  CLOB: { style: "Rigoureux et protecteur", forces: ["Conformité réglementaire", "Gestion contractuelle", "Propriété intellectuelle", "Gestion du risque légal"], approche: "Évalue chaque décision par ses implications légales à long terme.", scores: { strategique: 75, analytique: 90, creatif: 30, operationnel: 60, relationnel: 55 } },
  CISOB: { style: "Vigilant et systématique", forces: ["Cybersécurité", "Gestion des risques", "Audit sécurité", "Conformité"], approche: "Anticipe les menaces. Construit des défenses en profondeur.", scores: { strategique: 70, analytique: 95, creatif: 45, operationnel: 85, relationnel: 40 } },
};

// ── Rôles ──

const BOT_ROLES: Record<string, string> = {
  CEOB: "CEO", CTOB: "CTO", CFOB: "CFO", CMOB: "CMO",
  CSOB: "CSO", COOB: "COO", CPOB: "Production", CHROB: "CHRO",
  CINOB: "CIO", CROB: "CRO",
  CLOB: "CLO", CISOB: "CISO",
};

// ── SA8 — Capacités & ROI par bot (specs techniques) ──

const BOT_CAPACITES: Record<string, {
  equivHumain: string; coutHumain: string;
  tachesCount: number; heuresMois: string;
  exemples: string[];
}> = {
  CEOB: { equivHumain: "CEO conseil / Coach executif", coutHumain: "100-200K$", tachesCount: 15, heuresMois: "80-120h", exemples: ["Preparation CA", "Decisions strategiques", "Vision & roadmap", "Gestion parties prenantes"] },
  CFOB: { equivHumain: "CFO fractionnaire", coutHumain: "150-250K$", tachesCount: 18, heuresMois: "100-160h", exemples: ["Budget annuel", "Analyse ROI projets", "Tresorerie", "Subventions & financement"] },
  CTOB: { equivHumain: "CTO fractionnaire", coutHumain: "150-300K$", tachesCount: 16, heuresMois: "120-180h", exemples: ["Architecture techno", "Selection fournisseurs", "Cybersecurite", "Automatisation"] },
  CMOB: { equivHumain: "Directeur marketing", coutHumain: "120-200K$", tachesCount: 14, heuresMois: "100-160h", exemples: ["Strategie marketing", "Generation leads", "Positionnement", "Campagnes"] },
  CSOB: { equivHumain: "Consultant strategie", coutHumain: "120-200K$", tachesCount: 12, heuresMois: "80-120h", exemples: ["Analyse concurrentielle", "Plan strategique", "Diversification", "M&A screening"] },
  COOB: { equivHumain: "Directeur operations", coutHumain: "120-200K$", tachesCount: 15, heuresMois: "120-200h", exemples: ["Optimisation processus", "Gestion qualite", "Lean manufacturing", "Chaine d'approvisionnement"] },
  CPOB: { equivHumain: "Directeur usine", coutHumain: "100-180K$", tachesCount: 30, heuresMois: "120-200h", exemples: ["Monitoring TRS machines", "Suivi maintenance GMAO", "Alertes SST", "Rapports production"] },
  CHROB: { equivHumain: "VP Ressources humaines", coutHumain: "100-180K$", tachesCount: 25, heuresMois: "80-140h", exemples: ["Sondages engagement", "Suivi formation", "Rapports roulement", "Screening CV"] },
  CINOB: { equivHumain: "VP Innovation / R&D", coutHumain: "120-200K$", tachesCount: 20, heuresMois: "80-120h", exemples: ["Veille technologique", "Gestion portfolio PI", "Rapports R&D", "Benchmark innovation"] },
  CROB: { equivHumain: "VP Ventes / Revenus", coutHumain: "120-200K$", tachesCount: 25, heuresMois: "100-160h", exemples: ["Suivi pipeline ventes", "Forecasting", "Rapports performance reps", "Scoring leads"] },
  CLOB: { equivHumain: "Directeur juridique", coutHumain: "120-200K$", tachesCount: 20, heuresMois: "60-100h", exemples: ["Suivi contrats", "Alertes conformite", "Gestion registre Loi 25", "Veille reglementaire"] },
  CISOB: { equivHumain: "Directeur cybersecurite", coutHumain: "120-200K$", tachesCount: 20, heuresMois: "80-140h", exemples: ["Monitoring cybersecurite", "Alertes vulnerabilites", "Rapports conformite SOC2/NIST", "Tests automatises"] },
};

const BOT_DEPT: Record<string, string> = {
  CEOB: "Direction Générale", CTOB: "Technologie", CFOB: "Finance", CMOB: "Marketing",
  CSOB: "Stratégie", COOB: "Opérations", CPOB: "Production", CHROB: "Ressources Humaines",
  CINOB: "Systèmes d'Information", CROB: "Revenus",
  CLOB: "Juridique", CISOB: "Sécurité",
};

// ── Standby images (16:9 v3) ──

const BOT_STANDBY: Record<string, string> = {
  CEOB: "/agents/generated/ceo-carlos-standby-v3.png",
  CTOB: "/agents/generated/cto-thierry-standby-v3.png",
  CFOB: "/agents/generated/cfo-francois-standby-v3.png",
  CMOB: "/agents/generated/cmo-martine-standby-v3.png",
  CSOB: "/agents/generated/cso-sophie-standby-v3.png",
  COOB: "/agents/generated/coo-olivier-standby-v3.png",
  CPOB: "/agents/generated/factory-bot-standby-v3.png",
  CHROB: "/agents/generated/chro-helene-standby-v3.png",
  CINOB: "/agents/generated/cino-ines-standby-v3.png",
  CROB: "/agents/generated/cro-raphael-standby-v3.png",
  CLOB: "/agents/generated/clo-louise-standby-v3.png",
  CISOB: "/agents/generated/ciso-secbot-standby-v3.png",
};

// ── Score Bar component ──

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 w-24 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-bold text-gray-600 w-8">{value}</span>
    </div>
  );
}

// ── Catalogue Category ──

function CatalogueCategory({ cat, archetypes, activeSet, editingSlot, onAssign }: {
  cat: string; archetypes: [string, Archetype][]; activeSet: Set<string>; editingSlot: number | null; onAssign: (name: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const meta = CATEGORY_META[cat];
  const activeCount = archetypes.filter(([n]) => activeSet.has(n)).length;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
        <span className="text-base">{meta.emoji}</span>
        <span className="text-xs font-bold text-gray-800 flex-1 text-left">{cat}</span>
        {activeCount > 0 && (
          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", meta.badgeClass)}>
            {activeCount} active{activeCount > 1 ? "s" : ""}
          </span>
        )}
        <span className="text-xs text-gray-400">{archetypes.length}</span>
        {open ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
      </button>
      {open && (
        <div className="divide-y divide-gray-50">
          {archetypes.map(([name, arch]) => {
            const isActive = activeSet.has(name);
            return (
              <div key={name} className={cn("px-3 py-2.5", isActive ? "bg-violet-50/60" : "bg-white")}>
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 shrink-0">{arch.emoji}</span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-gray-900">{arch.nom}</span>
                      <Badge variant="outline" className={cn("text-[9px]", archetypeBadgeClass(arch.categorie))}>{arch.categorie}</Badge>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[9px] text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded-full font-semibold">
                          <Check className="h-2.5 w-2.5" /> Actif
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 italic leading-snug">"{arch.signature}"</p>
                    <p className="text-[11px] text-gray-700 leading-snug">{arch.impact}</p>
                    {editingSlot !== null && (
                      <button onClick={() => onAssign(name)}
                        className={cn("mt-1 text-[10px] font-semibold px-3 py-1 rounded-lg text-white cursor-pointer transition-opacity hover:opacity-90", `bg-gradient-to-r ${SLOT_GRADIENTS[editingSlot]}`)}>
                        Assigner en {SLOT_LABELS[editingSlot]} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// VUE PRINCIPALE — CV + Profil Psychométrique
// ════════════════════════════════════════════════════════════════

export function AgentSettingsView() {
  const { activeBotCode, activeBot, setActiveView } = useFrameMaster();
  const [activeMode, setActiveMode] = useState("strategique");
  const [localGhosts, setLocalGhosts] = useState<string[]>(
    BOT_GHOSTS[activeBotCode] || ["Bezos", "Munger", "Churchill"]
  );
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  // ── Données réelles depuis les API ──
  const { missions } = useMissions();
  const [decisions, setDecisions] = useState<{ total: number; entries: any[] }>({ total: 0, entries: [] });
  const [commandMissions, setCommandMissions] = useState<any[]>([]);
  const [briefings, setBriefings] = useState<any[]>([]);

  useEffect(() => {
    api.listDecisions({ bot_code: activeBotCode, limit: 50 }).then((r) => setDecisions({ total: r.total || 0, entries: r.entries || [] })).catch(() => {});
    api.commandMissions(50).then((r) => setCommandMissions(Array.isArray(r) ? r : [])).catch(() => {});
    api.listBriefings(activeBotCode, undefined, 50).then((r) => setBriefings(Array.isArray(r?.briefings) ? r.briefings : [])).catch(() => {});
  }, [activeBotCode]);

  const botMissions = useMemo(() => {
    const all = missions.filter((m) => m.bot_assigne === activeBotCode || m.responsable === activeBotCode);
    const completed = all.filter((m) => m.statut === "termine");
    const active = all.filter((m) => m.statut === "en_cours");
    return { all, completed, active };
  }, [missions, activeBotCode]);

  const botCommandMissions = useMemo(() =>
    commandMissions.filter((m: any) => m.bot_code === activeBotCode || m.bot_assigne === activeBotCode),
  [commandMissions, activeBotCode]);

  const botName = activeBot?.nom || "Carlos";
  const botRole = BOT_ROLES[activeBotCode] || "CEO";
  const botDept = BOT_DEPT[activeBotCode] || "Direction";
  const avatar = BOT_AVATAR[activeBotCode];
  const standby = BOT_STANDBY[activeBotCode] || BOT_STANDBY.CEOB;
  const profile = BOT_PROFILES[activeBotCode] || BOT_PROFILES.CEOB;
  const ghosts = localGhosts;
  const ghostSet = new Set(ghosts);

  const allArchetypes = Object.entries(GHOST_ARCHETYPES);
  const catalogueByCategory = CATEGORY_ORDER.map(cat => ({
    cat, items: allArchetypes.filter(([, a]) => a.categorie === cat),
  })).filter(g => g.items.length > 0);

  const currentMode = DECISION_MODES.find(m => m.id === activeMode)!;

  function handleAssign(archName: string) {
    if (editingSlot === null) return;
    const next = [...localGhosts];
    next[editingSlot] = archName;
    setLocalGhosts(next);
    setEditingSlot(null);
  }

  return (
    <PageLayout maxWidth="5xl" spacing="space-y-4" header={
      <PageHeader
        icon={Bot}
        iconColor="text-blue-600"
        title="Profil Agent AI"
        onBack={() => setActiveView("department")}
        rightSlot={
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-[9px]">
            En ligne
          </Badge>
        }
      />
    }>

          {/* ══ BANNER — Image standby 16:9 avec overlay identité ══ */}
          <div className="relative rounded-xl overflow-hidden shadow-sm">
            <img src={standby} alt={botName} className="w-full aspect-[3/1] object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-4">
              {avatar && (
                <img src={avatar} alt={botName} className="w-16 h-16 rounded-full object-cover ring-3 ring-white/50 shadow-xl shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xl font-extrabold text-white drop-shadow-lg">{botName}</div>
                <div className="text-sm text-white/80 font-medium">{botRole} — {botDept}</div>
                <div className="text-xs text-white/60 mt-0.5">{BOT_SUBTITLE[activeBotCode] || "Agent AI Usine Bleue"}</div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <span className="text-[9px] font-semibold text-white/90 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">Trisociation active</span>
                <span className="text-[9px] font-semibold text-green-300 bg-green-500/30 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> En ligne
                </span>
              </div>
            </div>
          </div>

          {/* ══ 2 COLONNES — Technique (gauche) + Cognitif (droite) ══ */}
          <div className="grid grid-cols-2 gap-4">

            {/* ── COLONNE GAUCHE: Fiche Technique ── */}
            <div className="space-y-4">

              {/* Mode de Décision */}
              <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                <div className={cn("bg-gradient-to-r px-4 py-2.5 flex items-center gap-2", currentMode.gradient)}>
                  <Target className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">Mode de Décision</span>
                  <span className="ml-auto text-[9px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">{currentMode.label}</span>
                </div>
                <div className="p-3 space-y-2.5">
                  <div className="grid grid-cols-5 gap-1.5">
                    {DECISION_MODES.map((mode) => {
                      const MIcon = mode.icon;
                      const isActive = activeMode === mode.id;
                      return (
                        <button key={mode.id} onClick={() => setActiveMode(mode.id)}
                          className={cn("flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer",
                            isActive ? cn(mode.bgColor, "shadow-sm") : "bg-gray-50 border-gray-200 hover:bg-white")}>
                          <MIcon className={cn("h-3.5 w-3.5", isActive ? mode.color : "text-gray-400")} />
                          <span className={cn("text-[9px] font-bold", isActive ? mode.color : "text-gray-500")}>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className={cn("rounded-lg border p-2.5 space-y-1.5", currentMode.bgColor)}>
                    <p className={cn("text-[10px] font-bold", currentMode.color)}>{currentMode.description}</p>
                    <p className="text-[10px] text-gray-700 leading-relaxed">{currentMode.comportement}</p>
                    <div className="flex items-start gap-1.5 bg-white/60 rounded-md px-2 py-1.5">
                      <Quote className="h-3 w-3 text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-gray-600 italic">{currentMode.exemple}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compétences clés */}
              <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2.5 flex items-center gap-2">
                  <Award className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">Compétences Clés</span>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {profile.forces.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-gray-700 bg-gray-50 rounded-lg px-2.5 py-2">
                        <Shield className="h-3 w-3 text-blue-500 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Approche */}
              <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">Style de Communication</span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Style</span>
                    <Badge variant="outline" className="text-[10px] text-indigo-700 bg-indigo-50 border-indigo-200">{profile.style}</Badge>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-relaxed bg-indigo-50/50 rounded-lg p-2.5 border border-indigo-100">
                    {profile.approche}
                  </p>
                </div>
              </div>
            </div>

            {/* ── COLONNE DROITE: Profil Cognitif ── */}
            <div className="space-y-4">

              {/* Profil Psychométrique — barres de score */}
              <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2.5 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">Profil Psychométrique</span>
                </div>
                <div className="p-3 space-y-2">
                  <ScoreBar label="Stratégique" value={profile.scores.strategique} color="bg-blue-500" />
                  <ScoreBar label="Analytique" value={profile.scores.analytique} color="bg-emerald-500" />
                  <ScoreBar label="Créatif" value={profile.scores.creatif} color="bg-purple-500" />
                  <ScoreBar label="Opérationnel" value={profile.scores.operationnel} color="bg-orange-500" />
                  <ScoreBar label="Relationnel" value={profile.scores.relationnel} color="bg-pink-500" />
                </div>
              </div>

              {/* Trisociation — 3 teintures */}
              <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2.5 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">Teintures Cognitives</span>
                  <span className="ml-auto text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full">Trisociation</span>
                </div>
                <div className="p-3 space-y-2.5">
                  {ghosts.map((ghostName, i) => {
                    const arch = GHOST_ARCHETYPES[ghostName];
                    if (!arch) return null;
                    const isEditing = editingSlot === i;
                    return (
                      <div key={`${ghostName}-${i}`} className={cn(
                        "border rounded-lg overflow-hidden transition-all",
                        isEditing ? "ring-2 ring-offset-1 " + (i === 0 ? "ring-blue-400" : i === 1 ? "ring-violet-400" : "ring-amber-400") : "",
                        SLOT_LIGHT_BG[i]
                      )}>
                        <div className={cn("px-3 py-1.5 bg-gradient-to-r flex items-center gap-2", SLOT_GRADIENTS[i])}>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white/90">{SLOT_LABELS[i]}</span>
                          <span className="text-[9px] text-white/60 ml-auto">{SLOT_ROLES[i]}</span>
                        </div>
                        <div className="p-2.5 flex items-start gap-2.5">
                          <span className="text-2xl shrink-0">{arch.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn("text-xs font-bold", SLOT_TEXT[i])}>{arch.nom}</span>
                              <Badge variant="outline" className={cn("text-[8px]", archetypeBadgeClass(arch.categorie))}>{arch.categorie}</Badge>
                            </div>
                            <p className="text-[10px] text-gray-500 italic mt-0.5">"{arch.signature}"</p>
                          </div>
                          <button onClick={() => setEditingSlot(isEditing ? null : i)}
                            className={cn("text-[9px] font-semibold px-2 py-1 rounded-md border transition-all cursor-pointer shrink-0",
                              isEditing ? SLOT_BTN_ACTIVE[i] : cn("bg-white/80", SLOT_BTN[i]))}>
                            <Pencil className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Aptitudes rapides */}
              <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">Points Forts</span>
                </div>
                <div className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {ghosts.map((g) => {
                      const a = GHOST_ARCHETYPES[g];
                      if (!a) return null;
                      return (
                        <span key={g} className="text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-2 py-1 rounded-full font-medium">
                          {a.emoji} {a.nom}
                        </span>
                      );
                    })}
                    {profile.forces.slice(0, 2).map((f, i) => (
                      <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ STATISTIQUES DE MISSIONS — KPI row (REAL DATA) ══ */}
          <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-500 px-4 py-2.5 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-white" />
              <span className="text-xs font-bold text-white">Statistiques de Missions</span>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <div className="text-2xl font-extrabold text-gray-800">{botMissions.completed.length}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Missions completees</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
                  <Star className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                  <div className="text-2xl font-extrabold text-gray-800">{botMissions.all.length > 0 ? `${Math.round((botMissions.completed.length / botMissions.all.length) * 100)}%` : "—"}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Taux de succes</div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
                  <Timer className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  <div className="text-2xl font-extrabold text-gray-800">{botCommandMissions.length}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Missions COMMAND</div>
                </div>
                <div className="bg-violet-50 border border-violet-100 rounded-lg p-3 text-center">
                  <Activity className="h-5 w-5 text-violet-500 mx-auto mb-1" />
                  <div className="text-2xl font-extrabold text-gray-800">{botMissions.active.length}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Missions actives</div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ SPECS TECHNIQUES & ROI (SA8 data) ══ */}
          {(() => {
            const cap = BOT_CAPACITES[activeBotCode];
            if (!cap) return null;
            return (
              <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="bg-gradient-to-r from-indigo-700 to-purple-600 px-4 py-2.5 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">Specs Techniques & ROI</span>
                  <span className="ml-auto text-[9px] bg-white/20 text-white/80 px-2 py-0.5 rounded-full">
                    {cap.tachesCount} taches automatisees
                  </span>
                </div>
                <div className="p-3 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center">
                      <Users className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
                      <div className="text-[11px] font-bold text-gray-800">{cap.equivHumain}</div>
                      <div className="text-[9px] text-gray-500 mt-0.5">Equivalent humain</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
                      <DollarSign className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                      <div className="text-lg font-extrabold text-gray-800">{cap.coutHumain}</div>
                      <div className="text-[9px] text-gray-500 mt-0.5">Cout humain/an</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
                      <Timer className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                      <div className="text-lg font-extrabold text-gray-800">{cap.heuresMois}</div>
                      <div className="text-[9px] text-gray-500 mt-0.5">Heures/mois</div>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <div className="text-[9px] font-semibold text-gray-600 mb-1.5">Taches automatisees ({cap.tachesCount})</div>
                    <div className="flex flex-wrap gap-1.5">
                      {cap.exemples.map((ex, i) => (
                        <span key={i} className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-full font-medium">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ══ 2 COLONNES — Activité Récente + Collaboration ══ */}
          <div className="grid grid-cols-2 gap-4">

            {/* Activité Récente (REAL DATA — decisions + missions) */}
            <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-4 py-2.5 flex items-center gap-2">
                <Clock className="h-4 w-4 text-white" />
                <span className="text-xs font-bold text-white">Activite Recente</span>
              </div>
              <div className="p-3 space-y-2">
                {(() => {
                  const items: { label: string; time: string; icon: React.ElementType; color: string }[] = [];
                  // Dernières missions
                  botMissions.all.slice(0, 2).forEach((m) => {
                    items.push({
                      label: m.titre || m.nom || "Mission",
                      time: m.updated_at ? new Date(m.updated_at).toLocaleDateString("fr-CA") : "",
                      icon: m.statut === "termine" ? CheckCircle2 : Activity,
                      color: m.statut === "termine" ? "text-emerald-500 bg-emerald-50" : "text-blue-500 bg-blue-50",
                    });
                  });
                  // Dernières décisions
                  decisions.entries.slice(0, 2).forEach((d: any) => {
                    items.push({
                      label: d.titre || d.description?.slice(0, 40) || "Decision",
                      time: d.created_at ? new Date(d.created_at).toLocaleDateString("fr-CA") : "",
                      icon: ClipboardList,
                      color: "text-amber-500 bg-amber-50",
                    });
                  });
                  if (items.length === 0) items.push({ label: "Aucune activite recente", time: "", icon: Clock, color: "text-gray-400 bg-gray-50" });
                  return items.slice(0, 4).map((item, i) => {
                    const IIcon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-gray-50 last:border-0">
                        <div className={cn("p-1.5 rounded-lg shrink-0", item.color)}>
                          <IIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-gray-700 font-medium truncate">{item.label}</div>
                          <div className="text-[9px] text-gray-400">{item.time}</div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Collaboration Équipe (REAL DATA — computed from missions) */}
            <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-2.5 flex items-center gap-2">
                <Users className="h-4 w-4 text-white" />
                <span className="text-xs font-bold text-white">Collaboration Equipe</span>
              </div>
              <div className="p-3 space-y-2">
                {(() => {
                  // Compute collaborators from real missions — which bots work together
                  const COLLAB_ROLES: Record<string, string> = {
                    CEOB: "Direction", CTOB: "Technologie", CFOB: "Finance",
                    CMOB: "Marketing", CSOB: "Strategie", COOB: "Operations",
                    CPOB: "Production", CHROB: "RH", CINOB: "Innovation",
                    CROB: "Vente", CLOB: "Legal", CISOB: "Securite",
                  };
                  // Count how often other bots appear in same missions/chantiers
                  const botCounts: Record<string, number> = {};
                  missions.forEach((m) => {
                    const assignee = m.bot_assigne || m.responsable || "";
                    if (assignee && assignee !== activeBotCode) {
                      botCounts[assignee] = (botCounts[assignee] || 0) + 1;
                    }
                  });
                  const sorted = Object.entries(botCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
                  if (sorted.length === 0) {
                    return <div className="text-[11px] text-gray-400 text-center py-2">Aucune collaboration detectee</div>;
                  }
                  return sorted.map(([code, count], i) => {
                    const avatar = BOT_AVATAR[code];
                    return (
                      <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-gray-50 last:border-0">
                        {avatar ? (
                          <img src={avatar} alt={code} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-gray-700 font-medium">{code}</div>
                          <div className="text-[9px] text-gray-400">{COLLAB_ROLES[code] || "Agent"}</div>
                        </div>
                        <span className={cn("text-[9px] font-medium px-2 py-0.5 rounded-full",
                          count >= 5 ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                          count >= 2 ? "bg-blue-50 text-blue-600 border border-blue-200" :
                          "bg-gray-50 text-gray-500 border border-gray-200"
                        )}>{count} missions</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* ══ HISTORIQUE DÉCISIONNEL + DOCUMENTS GÉNÉRÉS ══ */}
          <div className="grid grid-cols-2 gap-4">

            {/* Historique Décisionnel (REAL DATA) */}
            <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2.5 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-white" />
                <span className="text-xs font-bold text-white">Historique Decisionnel</span>
                <span className="ml-auto text-[9px] bg-white/20 text-white/80 px-2 py-0.5 rounded-full">{decisions.total}</span>
              </div>
              <div className="p-3 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Decisions contribuees</span>
                  <span className="font-bold text-gray-800">{decisions.total}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Missions COMMAND</span>
                  <span className="font-bold text-gray-800">{botCommandMissions.length}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Briefings compiles</span>
                  <span className="font-bold text-gray-800">{briefings.length}</span>
                </div>
                {decisions.entries.length > 0 && (
                  <div className="border-t border-gray-100 pt-2 mt-1 space-y-1.5">
                    {decisions.entries.slice(0, 3).map((d: any) => (
                      <div key={d.id} className="text-[9px] text-gray-500 truncate">
                        <span className="font-medium text-gray-700">D-{String(d.id).padStart(3, "0")}</span> {d.titre || d.description?.slice(0, 40)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Briefings & Documents (REAL DATA) */}
            <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-500 px-4 py-2.5 flex items-center gap-2">
                <FileText className="h-4 w-4 text-white" />
                <span className="text-xs font-bold text-white">Briefings & Documents</span>
                <span className="ml-auto text-[9px] bg-white/20 text-white/80 px-2 py-0.5 rounded-full">{briefings.length}</span>
              </div>
              <div className="p-3 space-y-2.5">
                {briefings.length === 0 ? (
                  <div className="text-[11px] text-gray-400 text-center py-2">Aucun briefing compile pour ce bot</div>
                ) : (
                  briefings.slice(0, 4).map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-600 truncate flex-1 mr-2">{b.titre || b.type_briefing}</span>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                        b.type_briefing === "daily" ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"
                      )}>{b.type_briefing === "daily" ? "Daily" : "Board"}</span>
                    </div>
                  ))
                )}
                <div className="border-t border-gray-100 pt-2 mt-1">
                  <div className="flex items-center justify-between text-[9px] text-gray-400">
                    <span>Missions completees</span>
                    <span className="font-bold text-gray-600">{botMissions.completed.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-gray-400">
                    <span>Missions totales</span>
                    <span className="font-bold text-gray-600">{botMissions.all.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ CATALOGUE — pleine largeur ══ */}
          <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
            <div className={cn("px-4 py-2.5 flex items-center gap-2 transition-all",
              editingSlot !== null ? `bg-gradient-to-r ${SLOT_GRADIENTS[editingSlot]}` : "bg-gradient-to-r from-indigo-600 to-violet-500")}>
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">
                {editingSlot !== null ? `Assigner en ${SLOT_LABELS[editingSlot]}` : `Catalogue — ${allArchetypes.length} Teintures`}
              </span>
              <span className="ml-auto text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">
                {editingSlot !== null ? (
                  <button onClick={() => setEditingSlot(null)} className="cursor-pointer hover:opacity-80">Annuler ✕</button>
                ) : `${ghostSet.size} actives`}
              </span>
            </div>
            {editingSlot !== null && (
              <div className={cn("px-4 py-2 border-b text-[11px] font-medium",
                editingSlot === 0 ? "bg-blue-50 text-blue-800 border-blue-100" :
                editingSlot === 1 ? "bg-violet-50 text-violet-800 border-violet-100" : "bg-amber-50 text-amber-800 border-amber-100")}>
                Sélectionne l'archétype qui remplacera <strong>{ghosts[editingSlot]}</strong> dans le slot {SLOT_LABELS[editingSlot]}
              </div>
            )}
            <div className="p-3 space-y-2">
              {catalogueByCategory.map(({ cat, items }) => (
                <CatalogueCategory key={cat} cat={cat} archetypes={items} activeSet={ghostSet} editingSlot={editingSlot} onAssign={handleAssign} />
              ))}
            </div>
          </div>

    </PageLayout>
  );
}
