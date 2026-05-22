/** BlueprintBot.tsx — Blueprint de l'Agent IA. Extracted from BlueprintDepartement.tsx */

import { useState, useEffect } from "react";
import {
  Target, DollarSign, TrendingUp, Settings, Save, CheckCircle2,
  Eye, ChevronRight, ChevronDown, Users, Plus, Zap, Activity, BarChart3, Star,
  MessageCircle, Cpu, Sparkles, ShieldAlert, Layers,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { cn } from "../../../components/ui/utils";
import { useIsMobile } from "../../../components/ui/use-mobile";
import { VitaaTable } from "./blueprint-helpers";
import { MobileSidebarSheet } from "../../core/MobileSidebarSheet";
import { api } from "../../../v2/api/client";
import { INTEGRATIONS, type IntegrationDef } from "../../IntegrationsPanel";

// ── Blueprint Bot — Profil, Trisociation, Skills, APIs, Performance ──

// ── Logo intégration (Google S2 Favicon → Clearbit → initiale colorée) h-8 w-8 ──
function IntegrationLogo({ domain, name, color }: { domain: string; name?: string; color: string }) {
  const [srcIndex, setSrcIndex] = useState(0);
  const safeName = name ?? "";
  const sources = domain ? [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    `https://logo.clearbit.com/${domain}`,
  ] : [];
  if (!domain || srcIndex >= sources.length) {
    return (
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0", color)}>
        {safeName.charAt(0).toUpperCase() || "?"}
      </div>
    );
  }
  return (
    <img
      key={srcIndex}
      src={sources[srcIndex]}
      alt={name}
      onError={() => setSrcIndex(prev => prev + 1)}
      className="h-8 w-8 rounded-lg object-contain bg-white border border-gray-100 p-1 shrink-0"
    />
  );
}

// Lookup map: provider → {logoDomain, color, name} — construit depuis IntegrationsPanel
const INTEGRATION_BRAND_MAP = Object.fromEntries(
  INTEGRATIONS.map(i => [i.provider, { logoDomain: i.logoDomain, color: i.color, name: i.name }])
);

// Logos systèmes (LLM, TTS, DB, infra — non éditables par l'usager)
const CORE_BRAND_MAP: Record<string, { logoDomain: string; color: string }> = {
  "Gemini Pro 2.0":   { logoDomain: "google.com",     color: "bg-blue-500"    },
  "Gemini Flash 2.0": { logoDomain: "google.com",     color: "bg-sky-500"     },
  "Claude Sonnet 4":  { logoDomain: "anthropic.com",  color: "bg-violet-500"  },
  "Claude Opus 4":    { logoDomain: "anthropic.com",  color: "bg-violet-600"  },
  "ElevenLabs TTS":   { logoDomain: "elevenlabs.io",  color: "bg-emerald-500" },
  "Deepgram STT":     { logoDomain: "deepgram.com",   color: "bg-cyan-500"    },
  "LiveKit WebRTC":   { logoDomain: "livekit.io",     color: "bg-orange-500"  },
  "PostgreSQL":       { logoDomain: "postgresql.org", color: "bg-indigo-500"  },
  "Docker":           { logoDomain: "docker.com",     color: "bg-blue-600"    },
};

// Mapping emoji → icône Lucide (design system — pas d'émojis dans l'UI)
const SUBBOT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "♟️": Target,        "🎯": ShieldAlert,   "💬": MessageCircle, "🧠": Sparkles,
  "📊": BarChart3,     "🔧": Settings,      "💰": DollarSign,    "📈": TrendingUp,
  "⚠️": ShieldAlert,  "📋": Layers,        "🤝": Users,         "💡": Zap,
  "📣": Activity,      "🔐": ShieldAlert,   "🏗️": Cpu,           "🚀": Zap,
  "👁️": Eye,           "⭐": Star,          "🌐": Activity,      "📁": Layers,
  "🔍": Eye,           "🛡️": ShieldAlert,  "📝": Layers,        "⚡": Zap,
  "🏆": Star,          "🤖": Cpu,           "📢": Activity,      "🔬": Eye,
  "💼": Layers,        "🧩": Cpu,           "🎪": Star,          "🔑": ShieldAlert,
};

// Ghost Archetypes (from AgentSettingsView)
const GHOST_ARCHETYPES: Record<string, { emoji: string; nom: string; categorie: string; signature: string }> = {
  "Bezos": { emoji: "📦", nom: "L'Architecte Client", categorie: "Strategie", signature: "Obsession client, vision à rebours" },
  "Sun Tzu": { emoji: "⚔️", nom: "Le Stratège Silencieux", categorie: "Strategie", signature: "Gagner sans combattre" },
  "Munger": { emoji: "🧠", nom: "L'Inverseur", categorie: "Strategie", signature: "Modèles mentaux croisés" },
  "Thiel": { emoji: "🔮", nom: "Le Contrarian", categorie: "Strategie", signature: "Vérités cachées, zéro à un" },
  "Chanel": { emoji: "👗", nom: "L'Élégante", categorie: "Strategie", signature: "Marque personnelle comme arme" },
  "Jobs": { emoji: "🍎", nom: "L'Épureur", categorie: "Innovation", signature: "Simplification radicale" },
  "Musk": { emoji: "🚀", nom: "Le Disrupteur", categorie: "Innovation", signature: "Premiers principes, objectifs 10×" },
  "Tesla": { emoji: "⚡", nom: "Le Catalyseur", categorie: "Innovation", signature: "Patterns universels, résonance" },
  "Vinci": { emoji: "🎨", nom: "L'Universel", categorie: "Creativite", signature: "Fusion art et science" },
  "Marc Aurèle": { emoji: "🏛️", nom: "Le Stoïque", categorie: "Leadership", signature: "Maîtrise de soi" },
  "Churchill": { emoji: "🎩", nom: "L'Inébranlable", categorie: "Leadership", signature: "Persévérance absolue" },
  "Oprah": { emoji: "💜", nom: "L'Authentique", categorie: "Leadership", signature: "Empathie et vérité" },
  "Franklin": { emoji: "📜", nom: "Le Fondateur Sage", categorie: "Leadership", signature: "Pragmatisme, bâtir pour durer" },
  "Buffett": { emoji: "💰", nom: "Le Gardien de Valeur", categorie: "Finance", signature: "Patience disciplinée" },
  "Curie": { emoji: "🔬", nom: "La Méthodique", categorie: "Analyse", signature: "Données avant conclusions" },
  "Deming": { emoji: "📊", nom: "Le Mesureur", categorie: "Operations", signature: "On améliore ce qu'on mesure" },
  "Ohno": { emoji: "🏭", nom: "Le Flux", categorie: "Operations", signature: "Éliminer le gaspillage" },
  "Nightingale": { emoji: "🕯️", nom: "La Pionnière", categorie: "Operations", signature: "Innovation par les données" },
  "Mandela": { emoji: "✊", nom: "Le Transformateur", categorie: "Leadership", signature: "Leadership = service" },
};

const BOT_GHOSTS: Record<string, string[]> = {
  CEOB: ["Bezos", "Munger", "Churchill"], CTOB: ["Musk", "Curie", "Vinci"],
  CFOB: ["Buffett", "Munger", "Franklin"], CMOB: ["Jobs", "Tesla", "Oprah"],
  CSOB: ["Sun Tzu", "Thiel", "Chanel"], COOB: ["Marc Aurèle", "Deming", "Nightingale"],
  CPOB: ["Ohno", "Deming", "Nightingale"], CHROB: ["Oprah", "Marc Aurèle", "Deming"],
  CINOB: ["Musk", "Curie", "Tesla"], CROB: ["Thiel", "Bezos", "Chanel"],
  CLOB: ["Munger", "Franklin", "Marc Aurèle"], CISOB: ["Sun Tzu", "Curie", "Franklin"],
};

const BOT_PROFILES_BP: Record<string, { style: string; forces: string[]; approche: string; scores: Record<string, number> }> = {
  CEOB: { style: "Directif et visionnaire", forces: ["Vision strategique", "Prise de decision", "Leadership", "Gestion de crise"], approche: "Part du resultat client et remonte vers la strategie.", scores: { strategique: 95, analytique: 75, creatif: 70, operationnel: 60, relationnel: 80 } },
  CTOB: { style: "Innovateur et methodique", forces: ["Architecture technique", "Innovation", "Resolution complexe", "Prototypage"], approche: "Premiers principes, challenge les contraintes.", scores: { strategique: 70, analytique: 90, creatif: 95, operationnel: 80, relationnel: 55 } },
  CFOB: { style: "Prudent et discipline", forces: ["Analyse financiere", "Gestion du risque", "Valorisation", "Budget"], approche: "Valeur intrinseque avant prix apparent.", scores: { strategique: 80, analytique: 95, creatif: 40, operationnel: 70, relationnel: 50 } },
  CMOB: { style: "Creatif et empathique", forces: ["Positionnement", "Storytelling", "Audience", "Innovation marketing"], approche: "Simplifie le message, connexion emotionnelle.", scores: { strategique: 65, analytique: 60, creatif: 95, operationnel: 50, relationnel: 90 } },
  CSOB: { style: "Stratege et incisif", forces: ["Analyse concurrentielle", "Planification", "Anticipation", "Marche"], approche: "Analyse les forces avant toute recommandation.", scores: { strategique: 95, analytique: 85, creatif: 60, operationnel: 50, relationnel: 45 } },
  COOB: { style: "Methodique et fiable", forces: ["Processus", "Qualite", "Logistique", "Amelioration continue"], approche: "Mesure tout, elimine le gaspillage.", scores: { strategique: 60, analytique: 80, creatif: 40, operationnel: 95, relationnel: 65 } },
  CPOB: { style: "Pragmatique et terrain", forces: ["Planification production", "Lean manufacturing", "Maintenance preventive", "5S / Kaizen"], approche: "Elimine le gaspillage, optimise chaque poste.", scores: { strategique: 45, analytique: 75, creatif: 35, operationnel: 98, relationnel: 55 } },
  CHROB: { style: "Bienveillante et structuree", forces: ["Recrutement", "Retention des talents", "Culture d'entreprise", "Formation"], approche: "Chaque employe est un investissement, pas un cout.", scores: { strategique: 65, analytique: 60, creatif: 55, operationnel: 70, relationnel: 95 } },
  CINOB: { style: "Curieux et disruptif", forces: ["Veille technologique", "R&D", "Propriete intellectuelle", "Transfert techno"], approche: "Explorer les frontieres, valider par l'experimentation.", scores: { strategique: 75, analytique: 90, creatif: 95, operationnel: 45, relationnel: 50 } },
  CROB: { style: "Chasseur et persuasif", forces: ["Developpement d'affaires", "Closing", "Pipeline CRM", "Pricing"], approche: "Chaque interaction est une opportunite de creer de la valeur.", scores: { strategique: 80, analytique: 70, creatif: 65, operationnel: 60, relationnel: 90 } },
  CLOB: { style: "Rigoureux et protecteur", forces: ["Conformite legale", "Contrats", "Propriete intellectuelle", "Loi 25 / RGPD"], approche: "Proteger l'entreprise avant, pas apres le probleme.", scores: { strategique: 70, analytique: 90, creatif: 30, operationnel: 65, relationnel: 45 } },
  CISOB: { style: "Vigilant et methodique", forces: ["Cybersecurite", "Audit de vulnerabilites", "Plan de reponse", "Conformite NIST"], approche: "La securite est un processus continu, pas un produit.", scores: { strategique: 65, analytique: 95, creatif: 40, operationnel: 85, relationnel: 40 } },
};

const BOT_CAPACITES_BP: Record<string, { equivHumain: string; coutHumain: string; tachesCount: number; heuresMois: string; coutIA: string }> = {
  CEOB: { equivHumain: "CEO conseil", coutHumain: "100-200K$", tachesCount: 22, heuresMois: "80-120h", coutIA: "47$" },
  CTOB: { equivHumain: "CTO fractionnaire", coutHumain: "150-300K$", tachesCount: 23, heuresMois: "120-180h", coutIA: "62$" },
  CFOB: { equivHumain: "CFO fractionnaire", coutHumain: "150-250K$", tachesCount: 22, heuresMois: "100-160h", coutIA: "38$" },
  CMOB: { equivHumain: "Directeur marketing", coutHumain: "120-200K$", tachesCount: 24, heuresMois: "100-160h", coutIA: "55$" },
  CSOB: { equivHumain: "Consultant strategie", coutHumain: "120-200K$", tachesCount: 19, heuresMois: "80-120h", coutIA: "41$" },
  COOB: { equivHumain: "Directeur operations", coutHumain: "120-200K$", tachesCount: 20, heuresMois: "120-200h", coutIA: "52$" },
  CPOB: { equivHumain: "Directeur usine", coutHumain: "100-180K$", tachesCount: 21, heuresMois: "140-220h", coutIA: "58$" },
  CHROB: { equivHumain: "DRH fractionnaire", coutHumain: "100-180K$", tachesCount: 18, heuresMois: "80-140h", coutIA: "35$" },
  CINOB: { equivHumain: "VP Innovation", coutHumain: "130-220K$", tachesCount: 17, heuresMois: "60-100h", coutIA: "44$" },
  CROB: { equivHumain: "VP Ventes", coutHumain: "120-250K$", tachesCount: 24, heuresMois: "100-160h", coutIA: "49$" },
  CLOB: { equivHumain: "Avocat d'entreprise", coutHumain: "150-300K$", tachesCount: 15, heuresMois: "60-100h", coutIA: "32$" },
  CISOB: { equivHumain: "CISO fractionnaire", coutHumain: "140-250K$", tachesCount: 24, heuresMois: "100-160h", coutIA: "56$" },
};

const SLOT_LABELS_BP = ["Primaire", "Calibrateur", "Amplificateur"];
const SLOT_COLORS = ["from-blue-600 to-blue-500", "from-violet-600 to-violet-500", "from-amber-600 to-amber-500"];
const SLOT_BG = ["bg-blue-50 border-blue-200", "bg-violet-50 border-violet-200", "bg-amber-50 border-amber-200"];
const SLOT_TEXT_C = ["text-blue-700", "text-violet-700", "text-amber-700"];

// Type partagé pour les entrées API
type ApiEntry = { name: string; status: "active" | "config" | "off"; icon: string; color: string; provider?: string };

// Connexions système (LLM routing + infra — toujours actives, pas user-configurables)
const BOT_CORE_APIS: Record<string, ApiEntry[]> = {
  CEOB:  [{ name: "Gemini Pro 2.0", icon: "LLM", color: "bg-blue-500", status: "active" }, { name: "Claude Sonnet 4", icon: "LLM", color: "bg-violet-500", status: "active" }, { name: "ElevenLabs TTS", icon: "TTS", color: "bg-emerald-500", status: "active" }, { name: "Deepgram STT", icon: "STT", color: "bg-cyan-500", status: "active" }, { name: "LiveKit WebRTC", icon: "RTC", color: "bg-orange-500", status: "active" }, { name: "PostgreSQL", icon: "DB", color: "bg-indigo-500", status: "active" }],
  CTOB:  [{ name: "Gemini Pro 2.0", icon: "LLM", color: "bg-blue-500", status: "active" }, { name: "ElevenLabs TTS", icon: "TTS", color: "bg-emerald-500", status: "active" }, { name: "PostgreSQL", icon: "DB", color: "bg-indigo-500", status: "active" }, { name: "Docker", icon: "CNT", color: "bg-blue-600", status: "active" }],
  CFOB:  [{ name: "Gemini Pro 2.0", icon: "LLM", color: "bg-blue-500", status: "active" }, { name: "ElevenLabs TTS", icon: "TTS", color: "bg-emerald-500", status: "active" }, { name: "PostgreSQL", icon: "DB", color: "bg-indigo-500", status: "active" }],
  CMOB:  [{ name: "Gemini Pro 2.0", icon: "LLM", color: "bg-blue-500", status: "active" }, { name: "ElevenLabs TTS", icon: "TTS", color: "bg-emerald-500", status: "active" }, { name: "PostgreSQL", icon: "DB", color: "bg-indigo-500", status: "active" }],
  CSOB:  [{ name: "Gemini Pro 2.0", icon: "LLM", color: "bg-blue-500", status: "active" }, { name: "ElevenLabs TTS", icon: "TTS", color: "bg-emerald-500", status: "active" }, { name: "PostgreSQL", icon: "DB", color: "bg-indigo-500", status: "active" }],
  COOB:  [{ name: "Gemini Pro 2.0", icon: "LLM", color: "bg-blue-500", status: "active" }, { name: "ElevenLabs TTS", icon: "TTS", color: "bg-emerald-500", status: "active" }, { name: "PostgreSQL", icon: "DB", color: "bg-indigo-500", status: "active" }],
  CPOB:  [{ name: "Gemini Flash 2.0", icon: "LLM", color: "bg-sky-500", status: "active" }, { name: "ElevenLabs TTS", icon: "TTS", color: "bg-emerald-500", status: "active" }, { name: "PostgreSQL", icon: "DB", color: "bg-indigo-500", status: "active" }],
  CHROB: [{ name: "Gemini Pro 2.0", icon: "LLM", color: "bg-blue-500", status: "active" }, { name: "ElevenLabs TTS", icon: "TTS", color: "bg-emerald-500", status: "active" }, { name: "PostgreSQL", icon: "DB", color: "bg-indigo-500", status: "active" }],
  CINOB: [{ name: "Claude Opus 4", icon: "LLM", color: "bg-violet-500", status: "active" }, { name: "Gemini Pro 2.0", icon: "LLM", color: "bg-blue-500", status: "active" }, { name: "ElevenLabs TTS", icon: "TTS", color: "bg-emerald-500", status: "active" }, { name: "PostgreSQL", icon: "DB", color: "bg-indigo-500", status: "active" }],
  CROB:  [{ name: "Gemini Pro 2.0", icon: "LLM", color: "bg-blue-500", status: "active" }, { name: "ElevenLabs TTS", icon: "TTS", color: "bg-emerald-500", status: "active" }, { name: "PostgreSQL", icon: "DB", color: "bg-indigo-500", status: "active" }],
  CLOB:  [{ name: "Claude Sonnet 4", icon: "LLM", color: "bg-violet-500", status: "active" }, { name: "ElevenLabs TTS", icon: "TTS", color: "bg-emerald-500", status: "active" }, { name: "PostgreSQL", icon: "DB", color: "bg-indigo-500", status: "active" }],
  CISOB: [{ name: "Gemini Pro 2.0", icon: "LLM", color: "bg-blue-500", status: "active" }, { name: "ElevenLabs TTS", icon: "TTS", color: "bg-emerald-500", status: "active" }, { name: "PostgreSQL", icon: "DB", color: "bg-indigo-500", status: "active" }],
};


const VITAA_BOT: Record<string, { letter: string; label: string; score: number; avg: number; color: string }[]> = {
  CEOB: [
    { letter: "V", label: "Vente (leads qualifies)", score: 68, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (insights generes)", score: 82, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (taches/heure)", score: 91, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (ROI genere)", score: 74, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (docs produits)", score: 56, avg: 50, color: "bg-red-500" },
  ],
  CTOB: [
    { letter: "V", label: "Vente (solutions tech)", score: 42, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (architectures)", score: 94, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (sprints livres)", score: 88, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (cout infra)", score: 71, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (code + docs)", score: 85, avg: 50, color: "bg-red-500" },
  ],
  CFOB: [
    { letter: "V", label: "Vente (pricing)", score: 55, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (modeles financiers)", score: 78, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (rapports auto)", score: 92, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (tresorerie)", score: 96, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (etats financiers)", score: 88, avg: 50, color: "bg-red-500" },
  ],
  CMOB: [
    { letter: "V", label: "Vente (leads marketing)", score: 82, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (campagnes)", score: 91, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (contenu/sem)", score: 76, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (ROAS)", score: 64, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (brand assets)", score: 72, avg: 50, color: "bg-red-500" },
  ],
  CSOB: [
    { letter: "V", label: "Vente (pipeline)", score: 88, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (strategies)", score: 85, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (analyses/sem)", score: 70, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (marges)", score: 72, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (plans strat)", score: 65, avg: 50, color: "bg-red-500" },
  ],
  COOB: [
    { letter: "V", label: "Vente (delivery)", score: 48, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (processus)", score: 62, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (efficacite)", score: 95, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (couts ops)", score: 84, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (SOPs)", score: 90, avg: 50, color: "bg-red-500" },
  ],
  CPOB: [
    { letter: "V", label: "Vente (capacite prod)", score: 38, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (ameliorations)", score: 55, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (OEE/TRS)", score: 92, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (cout/unite)", score: 88, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (equipements)", score: 78, avg: 50, color: "bg-red-500" },
  ],
  CHROB: [
    { letter: "V", label: "Vente (marque employeur)", score: 52, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (programmes RH)", score: 68, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (embauche moy)", score: 74, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (cout embauche)", score: 62, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (talents retenus)", score: 71, avg: 50, color: "bg-red-500" },
  ],
  CINOB: [
    { letter: "V", label: "Vente (produits R&D)", score: 35, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (brevets/concepts)", score: 96, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (prototypes)", score: 65, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (budget R&D)", score: 58, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (PI deposee)", score: 45, avg: 50, color: "bg-red-500" },
  ],
  CROB: [
    { letter: "V", label: "Vente (closing rate)", score: 92, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (offres)", score: 72, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (cycle vente)", score: 78, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (revenus)", score: 90, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (propositions)", score: 68, avg: 50, color: "bg-red-500" },
  ],
  CLOB: [
    { letter: "V", label: "Vente (contrats signes)", score: 45, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (cadres legaux)", score: 70, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (revisions)", score: 85, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (risques evites)", score: 92, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (politiques)", score: 82, avg: 50, color: "bg-red-500" },
  ],
  CISOB: [
    { letter: "V", label: "Vente (certifications)", score: 40, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (defenses)", score: 75, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (scans/jour)", score: 94, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (incidents evites)", score: 88, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (politiques sec)", score: 80, avg: 50, color: "bg-red-500" },
  ],
};

const BOT_SECTION_META: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "sec-overview", label: "Vue d'ensemble", icon: Eye },
  { id: "sec-taches", label: "Types de taches", icon: Layers },
  { id: "sec-outils", label: "Outils & APIs", icon: Cpu },
  { id: "sec-config", label: "Configuration", icon: Settings },
];

// ── Sous-bots & tâches complètes par département (basé sur modules réels) ──
type SousBotEntry = { nom: string; emoji: string; couleur: string; bgColor: string; borderColor: string; modules: string[]; taches: string[] };
const BOT_SUBTEAM: Record<string, SousBotEntry[]> = {
  CEOB: [
    { nom: "Stratège & M&A", emoji: "♟️", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", modules: ["carlos_strategie_auto", "carlos_competitive_analysis", "carlos_ma_opportunities"], taches: ["Plan stratégique 90 jours", "Analyse concurrentielle complète", "Identification opportunités M&A", "Due diligence rapide", "Wargaming scénarios", "Pivot stratégique", "Score compétitif sectoriel"] },
    { nom: "Décisions & Risques", emoji: "🎯", couleur: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200", modules: ["carlos_decision_journal", "carlos_risk_assessment", "carlos_crise_ooda"], taches: ["Journal décisions structuré", "Évaluation risques CEO-level", "Score risque 0-100", "Protocole crise OODA", "Arbre de décision", "Triage 24h/7j/ignorer", "Plan contingence"] },
    { nom: "Intelligence & Dashboard", emoji: "📊", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", modules: ["carlos_predictive", "carlos_dashboard_ceo", "carlos_rapports_consolides", "carlos_proactivite"], taches: ["Dashboard CEO temps réel", "Rapport C-Suite consolidé", "Prévisions 90 jours", "Alertes VITAA proactives", "Briefing quotidien automatique", "Indicateurs santé PME", "Benchmark multi-tenant"] },
    { nom: "Coaching & Réflexion", emoji: "🎓", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", modules: ["carlos_coaching_systematique", "carlos_ghost_frameworks", "carlos_pipelines_cognitifs"], taches: ["Session coaching CEO systématique", "Ghost frameworks (Bezos/Musk/Munger)", "Pipelines cognitifs enchaînés", "Deep Resonance mode", "Brainstorming 10× first principles", "Inverseur à rebours", "8+1 modes de réflexion"] },
    { nom: "Workflows & COMMAND", emoji: "🔄", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", modules: ["carlos_workflow_engine", "carlos_command_v2", "carlos_autonomie_d3"], taches: ["Workflows multi-étapes automatisés", "COMMAND délégation intelligente", "Mission Queue multi-agent", "Escalade intelligente", "Autonomie niveau D3", "Actions bot-to-bot"] },
    { nom: "Gouvernance & Templates", emoji: "🏛️", couleur: "text-indigo-700", bgColor: "bg-indigo-50", borderColor: "border-indigo-200", modules: ["carlos_comite_direction", "carlos_multitenant", "carlos_templates_strategiques"], taches: ["Comité direction Bot-to-Bot", "Intelligence multi-tenant", "Réunions C-Suite simulées", "Templates stratégiques PME QC", "Coordination 12 bots", "Protocole CREDO adaptatif"] },
  ],
  CTOB: [
    { nom: "Architecture & Infra", emoji: "🏗️", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", modules: ["tim_architecture", "tim_infrastructure", "tim_cost_optimizer"], taches: ["Design architecture système", "Score dette technique", "Plan migration cloud", "Optimisation coûts infra", "Scalabilité horizontale", "Revue tech stack", "DR & haute disponibilité"] },
    { nom: "Sécurité & Incidents", emoji: "🔒", couleur: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200", modules: ["tim_security_audit", "tim_incident_response", "tim_data_privacy"], taches: ["Audit sécurité applicatif", "Gestion incidents production", "Conformité Loi 25 / LPRPDE", "Chiffrement données", "Accès IAM review", "Post-mortem incidents", "Plan réponse brèche"] },
    { nom: "DevOps & Performance", emoji: "🚀", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", modules: ["tim_devops_pipeline", "tim_docker_manager", "tim_monitoring", "tim_performance"], taches: ["Pipeline CI/CD", "Gestion containers Docker/K8s", "Monitoring & alertes", "Analyse performance", "Deploy automatisé", "SLA & uptime tracking", "Rollback stratégie"] },
    { nom: "Code & Tests", emoji: "💻", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", modules: ["tim_code_review", "tim_testing_framework", "tim_git_operations"], taches: ["Code review automatisé", "Framework de tests", "Couverture de tests", "Git flow & branches", "Refactoring guidé", "Détection anti-patterns", "Documentation code"] },
    { nom: "Data & Analytics", emoji: "📊", couleur: "text-cyan-700", bgColor: "bg-cyan-50", borderColor: "border-cyan-200", modules: ["tim_data_strategy", "tim_etl_pipeline", "tim_bi_dashboard", "tim_data_quality", "tim_data_governance"], taches: ["Stratégie de données", "Pipeline ETL", "Dashboard BI", "Qualité des données", "Gouvernance données", "Analytique prédictive", "Customer analytics"] },
    { nom: "Innovation & API", emoji: "🔬", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", modules: ["tim_innovation_lab", "tim_tech_radar", "tim_tech_vendor", "tim_api_management"], taches: ["POC nouvelles techno", "Radar technologique", "Évaluation fournisseurs tech", "Design API REST/GraphQL", "Benchmark IA/ML", "Open source stratégie", "Patent scouting"] },
  ],
  CFOB: [
    { nom: "Calculs & Ratios", emoji: "🧮", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", modules: ["frank_engine", "frank_ratios"], taches: ["NPV / IRR / Payback", "Breakeven analysis", "Burn rate & runway", "ROI / WACC / DSCR", "Ratios benchmarks sectoriels", "Coût de revient manufacturier", "Analyse de rentabilité"] },
    { nom: "Analytics & Dashboard", emoji: "📊", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", modules: ["frank_analytics", "frank_dashboard", "frank_ml_prediction"], taches: ["Frank Score 0-100", "Pareto 80/20 financier", "Dashboard CFO temps réel", "Tendances N vs N-1", "Prévisions ML", "Alertes anomalies", "Rapport direction mensuel"] },
    { nom: "Financement & Crédit", emoji: "🏦", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", modules: ["frank_dossier_credit", "frank_capital_allocation", "frank_flinks"], taches: ["Dossier crédit bancaire PME", "Allocation capital optimale", "Lecture compte bancaire Flinks", "Scoring crédit", "Structuration financement", "Évaluation entreprise", "Fundraising pipeline"] },
    { nom: "Fiscal & Subventions", emoji: "📋", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", modules: ["frank_fiscal", "frank_compliance_endtoend", "frank_subventions", "frank_rsde_prefill"], taches: ["Calendrier fiscal CRA/ARQ", "RS&DE pré-remplissage T661", "Matching subventions QC/Canada", "Conformité fiscale bout en bout", "Optimisation impôt PME", "CELI / REÉR corporatif", "Audit préparation"] },
    { nom: "Prix & Risque", emoji: "💰", couleur: "text-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-200", modules: ["frank_pricing_strategy", "frank_risk_management", "frank_evaluation"], taches: ["Stratégie de prix manufacturier", "Gestion risques financiers", "Valorisation PME multiples", "Analyse sensibilité prix", "Hedging risque devise", "Prévisions trésorerie"] },
    { nom: "Documents & Paie", emoji: "📄", couleur: "text-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-200", modules: ["frank_ocr", "frank_xlsx", "frank_paie_integration", "frank_autonomous_bookkeeping"], taches: ["OCR factures PDF/image", "Génération Excel rapports", "Intégration paie Nethris/Folks", "Tenue de livres autonome ML", "Rapprochement bancaire", "États financiers auto"] },
  ],
  CMOB: [
    { nom: "Brand & Relations Presse", emoji: "🎨", couleur: "text-pink-700", bgColor: "bg-pink-50", borderColor: "border-pink-200", modules: ["mathilde_brand_strategy", "mathilde_pr_media"], taches: ["Plateforme de marque B2B", "Guide de voix & ton", "Positionnement sectoriel", "Relations presse & médias", "Communication crise marque", "Narratif investisseurs"] },
    { nom: "Contenu & SEO", emoji: "✍️", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", modules: ["mathilde_content_creator", "mathilde_seo", "mathilde_industry_news"], taches: ["Article blogue SEO optimisé", "Pages produit / landing", "Script vidéo & podcast", "Audit SEO technique", "Mots-clés industriels", "Veille sectorielle", "Calendrier éditorial"] },
    { nom: "Campagnes & Email", emoji: "📣", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", modules: ["mathilde_ads_campaign", "mathilde_email_marketing", "mathilde_event_marketing"], taches: ["Campagnes Google/LinkedIn Ads", "Séquences email nurturing", "Automation marketing", "Budget média", "Organisation événement", "Webinar planning", "A/B test créatifs"] },
    { nom: "Personas & Journey", emoji: "👤", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", modules: ["mathilde_customer_persona", "mathilde_journey_mapping", "mathilde_influencer_scout"], taches: ["Personas B2B détaillés", "Customer journey map", "Points de friction identifiés", "Scouting influenceurs sectoriels", "Segmentation clients", "Message par persona"] },
    { nom: "Analytics & Social", emoji: "📊", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", modules: ["mathilde_marketing_analytics", "mathilde_social_media", "mathilde_community_manager", "mathilde_conversion_optimizer"], taches: ["Rapport performance marketing", "Stratégie LinkedIn/Meta/X", "Community management B2B", "Optimisation taux conversion", "Attribution multi-canal", "NPS & satisfaction client"] },
  ],
  CSOB: [
    { nom: "Planification stratégique", emoji: "♟️", couleur: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200", modules: ["simone_strategic_planning", "simone_scenario_planning", "simone_growth_strategy"], taches: ["Plan stratégique 3 ans", "OKR entreprise", "Scénarios + contingences", "Stratégie croissance organique", "Axes prioritaires pondérés", "Expansion géographique", "Stress test stratégique"] },
    { nom: "Intelligence marché", emoji: "🔍", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", modules: ["simone_market_intelligence", "simone_wargaming"], taches: ["Analyse sectorielle approfondie", "Profils concurrents détaillés", "Wargaming réponses concurrentes", "Tendances de fond", "Rapport veille mensuel", "Forces de Porter", "Opportunités émergentes"] },
    { nom: "Partenariats & Alliances", emoji: "🤝", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", modules: ["simone_partnership_scout", "simone_alliance_manager", "simone_deal_structurer"], taches: ["Identification partenaires cibles", "Structuration alliances stratégiques", "Négociation termes partenariat", "Contrats JV & co-développement", "Due diligence partenaire", "Pipeline partenariats"] },
    { nom: "Écosystème & Channels", emoji: "🌐", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", modules: ["simone_ecosystem_builder", "simone_channel_partner", "simone_co_marketing"], taches: ["Construction écosystème", "Programme partenaires distributeurs", "Co-marketing conjoint", "Canaux de distribution", "Stratégie go-to-market", "Réseau revendeurs"] },
    { nom: "Analytics partenariats", emoji: "📊", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", modules: ["simone_partnership_analytics", "simone_partner_success", "simone_integration_manager"], taches: ["KPIs partenariats", "Succès & rétention partenaires", "Intégration post-alliance", "Rapport ROI partenariat", "Onboarding partenaires", "Expansion comptes communs"] },
  ],
  COOB: [
    { nom: "Lean & Processus", emoji: "⚙️", couleur: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", modules: ["olivier_lean_six_sigma", "olivier_process_mining", "olivier_workflow_automation"], taches: ["Cartographie processus VSM", "Lean Six Sigma PME", "Process mining automatisé", "Automatisation workflows", "Élimination gaspillage 7 muda", "Standardisation procédures", "Kaizen chantiers"] },
    { nom: "KPIs & Capacité", emoji: "📊", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", modules: ["olivier_kpi_dashboard", "olivier_capacity_planning"], taches: ["Dashboard opérationnel temps réel", "Planification capacité usine", "OEE suivi", "Rapport performance hebdo", "Benchmarks industrie", "Goulots détection", "Prévisions charge"] },
    { nom: "Supply Chain & Stocks", emoji: "🚚", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", modules: ["olivier_supply_chain", "olivier_inventory_manager", "olivier_logistics_optimizer"], taches: ["Optimisation stocks ABC", "Gestion fournisseurs", "Logistique transport optimisée", "Délais livraison tracking", "Réduction coûts appro", "MRP planning", "Audit supply chain"] },
    { nom: "Maintenance & Qualité", emoji: "🔧", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", modules: ["olivier_maintenance_predict", "olivier_quality_control", "olivier_safety_monitor"], taches: ["Maintenance prédictive ML", "SPC contrôle statistique", "ISO 9001 audit interne", "Non-conformités + correctifs", "Sécurité CNESST", "AMDEC équipements", "Gestion défauts qualité"] },
    { nom: "Énergie & Fournisseurs", emoji: "🌱", couleur: "text-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-200", modules: ["olivier_energy_optimizer", "olivier_vendor_management", "olivier_compliance_tracker"], taches: ["Optimisation énergétique usine", "Gestion fournisseurs scorecards", "Conformité opérationnelle", "Réduction empreinte carbone", "Évaluation fournisseurs", "Contrats approvisionnement"] },
  ],
  CPOB: [
    { nom: "Diagnostic & Visite Terrain", emoji: "🔍", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", modules: ["paco_diagnostic_terrain", "paco_smart_visit", "paco_chronometreur"], taches: ["Visite industrielle SMART", "Diagnostic terrain complet", "Chronométrage postes de travail", "Identification goulots", "Rapport visite structuré", "Photos + annotations IA", "Plan d'action prioritaire"] },
    { nom: "Cartographie & Layout", emoji: "🗺️", couleur: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", modules: ["paco_cartographe_flux", "paco_layout_usine"], taches: ["Value Stream Mapping (VSM)", "Plan layout usine", "Flux matières optimisés", "Analyse spaghetti", "Zones 5S délimitées", "Réaménagement proposé"] },
    { nom: "Automatisation PLC", emoji: "🤖", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", modules: ["paco_plc_codegen", "paco_plc_comm", "paco_api_industrielle"], taches: ["Génération code PLC (Ladder/ST)", "Spécifications automates", "Connexion API industrielles", "Protocoles Modbus/OPC-UA", "Intégration SCADA/MES", "Séquences automatisées"] },
    { nom: "Vision IA & Prédiction", emoji: "👁️", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", modules: ["paco_vision_ia", "paco_prediction_ml", "paco_normes_db"], taches: ["Inspection visuelle IA", "Prédictions statistiques ML", "Détection défauts vision", "Base normes industrielles", "Maintenance prédictive", "Qualité en ligne IA"] },
    { nom: "ROI & Subventions", emoji: "💰", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", modules: ["paco_roi_calculator", "paco_subventions_indus", "paco_simulation"], taches: ["Calculateur ROI automatisation", "Matching subventions industrie", "Simulation avant/après", "Payback période", "Analyse coûts-bénéfices", "Dossier financement équipements"] },
    { nom: "OEM & Planification", emoji: "🏭", couleur: "text-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-200", modules: ["paco_catalogue_oem", "paco_veille_oem", "paco_project_planner", "paco_generateur_cprj"], taches: ["Catalogue équipements OEM QC", "Veille techno fournisseurs", "Plan projet automatisation", "Génération CPRJ complet", "CRM intégrateurs système", "Mine d'or patterns validés"] },
  ],
  CHROB: [
    { nom: "Talent & Recrutement", emoji: "🎯", couleur: "text-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-200", modules: ["helene_talent_scout", "helene_interview_coordinator"], taches: ["Affichage poste SEO optimisé", "Sourcing candidats passifs", "Grille entrevue structurée", "Évaluation compétences", "Vérification références", "Offre & négociation", "Marque employeur"] },
    { nom: "Formation & Onboarding", emoji: "📚", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", modules: ["helene_learning_dev", "helene_onboarding"], taches: ["Plan formation annuel", "Parcours onboarding 90 jours", "Matrice compétences", "PDI employés", "E-learning module", "Certification interne", "Coaching gestionnaires"] },
    { nom: "Culture & Engagement", emoji: "💜", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", modules: ["helene_culture_monitor", "helene_employee_engagement"], taches: ["Sondage engagement eNPS", "Programme reconnaissance", "Gestion conflits", "Indicateurs culture", "Communication interne", "Événements cohésion"] },
    { nom: "Performance & Succession", emoji: "📊", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", modules: ["helene_performance_manager", "helene_retention_analytics", "helene_succession_planning"], taches: ["Évaluation performance 360", "Analyse rétention & turnover", "Plan relève dirigeants", "PIP structure", "Rétention talents clés", "Succession critique"] },
    { nom: "Conformité & Rémunération", emoji: "⚖️", couleur: "text-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-200", modules: ["helene_hr_compliance", "helene_compensation", "helene_benefits_optimizer"], taches: ["Conformité CNESST / loi travail QC", "Échelles salariales marché", "Avantages sociaux optimisés", "Dossier disciplinaire", "Politique RH conforme", "Équité salariale"] },
  ],
  CINOB: [
    { nom: "R&D & RS&DE", emoji: "🔬", couleur: "text-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-200", modules: ["ines_rsde_manager", "ines_innovation_pipeline", "ines_prototype_builder"], taches: ["Gestion projets RS&DE T661", "Pipeline innovation structuré", "Construction prototypes", "Rapport RS&DE complet", "Validation hypothèses", "Transfert technologique", "Documentation R&D"] },
    { nom: "Industrie 4.0", emoji: "🤖", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", modules: ["ines_industry_4_0", "ines_jumeau_numerique"], taches: ["Diagnostic maturité 4.0", "Jumeau numérique industriel", "IoT déploiement plan", "MES intégration", "Automatisation pilote", "IIOT connectivité", "Roadmap transformation digitale"] },
    { nom: "Produit & Roadmap", emoji: "🎯", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", modules: ["ines_product_strategy", "ines_roadmap_planner", "ines_feature_prioritizer"], taches: ["Stratégie produit manufacturier", "Roadmap produit priorisée", "Priorisation features (RICE/MoSCoW)", "Lancement produit coordonné", "PLM cycle de vie", "Market fit validation"] },
    { nom: "Veille & Concurrence", emoji: "📡", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", modules: ["ines_veille_techno", "ines_competitive_product"], taches: ["Veille technologique continue", "Analyse concurrentielle produit", "Benchmark techno", "Tendances sectorielles", "Opportunités IA/ML", "Rapport veille mensuel"] },
    { nom: "Tests & UX Industriel", emoji: "🧪", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", modules: ["ines_ab_testing", "ines_ux_designer", "ines_user_research"], taches: ["Tests A/B produit", "Design UX interfaces industrielles", "Recherche utilisateurs B2B", "Feedback clients structuré", "Maquettes & wireframes", "Tests utilisabilité"] },
    { nom: "Analytics Produit", emoji: "📊", couleur: "text-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-200", modules: ["ines_product_analytics", "ines_product_lifecycle", "ines_product_documentation"], taches: ["Analytique produit B2B", "Gestion cycle de vie PLM", "Documentation produit", "KPIs produit", "Reporting adoption", "Données usage terrain"] },
  ],
  CROB: [
    { nom: "Pipeline & Leads", emoji: "🎯", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", modules: ["rich_sales_pipeline", "rich_lead_generation", "rich_opportunity_scorer"], taches: ["Pipeline CRM structuré", "Prospection ICP ciblée", "Scoring opportunités ML", "Qualification BANT/MEDDIC", "Séquence outreach", "Rapport pipeline hebdo", "Prévisions revenus"] },
    { nom: "Propositions & Closing", emoji: "🏆", couleur: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", modules: ["rich_proposal_generator", "rich_deal_structurer"], taches: ["Proposition commerciale personnalisée", "Deal structuring complexe", "Gestion objections", "Démo script adapté", "Lettre d'intention", "Négociation termes", "Closing stratégies"] },
    { nom: "Pricing & Contrats", emoji: "💰", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", modules: ["rich_pricing_optimizer", "rich_contract_negotiator"], taches: ["Optimisation prix dynamique", "Négociation contrats", "Analyse élasticité", "Modèles pricing SaaS/récurrent", "Grilles tarifaires", "Conditions paiement"] },
    { nom: "Analytics & Prévisions", emoji: "📊", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", modules: ["rich_revenue_analytics", "rich_win_loss_analysis", "rich_sales_forecasting"], taches: ["Analytique revenus détaillée", "Analyse win/loss", "Prévisions ventes ML", "Tendances saisonnières", "Cohortes clients", "ARR/MRR tracking"] },
    { nom: "Expansion & Fidélisation", emoji: "🚀", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", modules: ["rich_customer_expansion", "rich_upsell_crosssell"], taches: ["Stratégie upsell/cross-sell", "Expansion comptes clés", "QBR clients", "NPS & rétention", "Renouvellement contrats", "Programme fidélité"] },
  ],
  CLOB: [
    { nom: "Contrats & Rédaction", emoji: "📄", couleur: "text-indigo-700", bgColor: "bg-indigo-50", borderColor: "border-indigo-200", modules: ["loulou_contract_analyzer", "loulou_contract_generator"], taches: ["Analyse contrats complexes", "Génération contrats types PME", "NDA personnalisé", "CGV / conditions service", "Contrat emploi QC", "Lettre d'intention", "Clauses risque surlignées"] },
    { nom: "Conformité & Veille", emoji: "⚖️", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", modules: ["loulou_compliance_checker", "loulou_regulatory_monitor", "loulou_corporate_governance"], taches: ["Conformité Loi 25 / RGPD", "Veille réglementaire QC/Canada", "Gouvernance corporative PME", "Politique confidentialité", "Programme conformité", "Audit légal interne", "Résolutions CA"] },
    { nom: "PI & Droit du travail", emoji: "🔐", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", modules: ["loulou_ip_protection", "loulou_legal_research", "loulou_employment_law"], taches: ["Stratégie marques de commerce", "Brevets & secrets commerciaux", "Recherche juridique ciblée", "Droit du travail QC", "Non-concurrence & confidentialité", "Licensing PI"] },
    { nom: "Litiges & Risques", emoji: "🛡️", couleur: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200", modules: ["loulou_litigation_support", "loulou_risk_assessment"], taches: ["Analyse risque légal", "Support pre-litige", "Médiation structurée", "Gestion réclamations", "Structure juridique optimale", "Plan gestion risques légaux"] },
  ],
  CISOB: [
    { nom: "Audit & Scan", emoji: "🔍", couleur: "text-slate-700", bgColor: "bg-slate-50", borderColor: "border-slate-200", modules: ["sebastien_security_audit", "sebastien_vulnerability_scanner", "sebastien_penetration_test"], taches: ["Audit sécurité PME manufacturière", "Scan vulnérabilités réseau", "Pentest applicatif planifié", "Revue accès & permissions", "Test phishing interne", "Rapport risques priorisé", "Score sécurité NIST"] },
    { nom: "Incidents & Reprise", emoji: "🚨", couleur: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200", modules: ["sebastien_incident_response", "sebastien_disaster_recovery"], taches: ["Plan réponse incidents", "Playbook brèche données", "PRA/PCA manufacturier", "Forensic rapide", "Communication incident", "Post-mortem sécurité", "RTO/RPO définis"] },
    { nom: "Protection & Chiffrement", emoji: "🔐", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", modules: ["sebastien_access_control", "sebastien_encryption_manager", "sebastien_threat_intelligence"], taches: ["IAM & accès privilégiés", "Chiffrement données sensibles", "CTI veille menaces", "Certificats TLS/SSL", "Segmentation réseau", "OT/SCADA sécurité"] },
    { nom: "Conformité & Formation", emoji: "📋", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", modules: ["sebastien_compliance_monitor", "sebastien_security_training", "sebastien_security_reporting"], taches: ["Conformité NIST CSF / Loi 25", "Formation sensibilisation employés", "Rapports sécurité direction", "Politique sécurité SI", "Registre risques cyber", "Audit fournisseurs"] },
  ],
};

// ── Modes de décision (de AgentSettingsView) ──
const DECISION_MODES: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; gradient: string; description: string; comportement: string; exemple: string }[] = [
  { id: "strategique", label: "Strategique", icon: Target, color: "text-blue-600", bgColor: "bg-blue-50 border-blue-300", gradient: "from-blue-600 to-blue-500", description: "Vision long terme, implications systemiques", comportement: "Pense a 3-5 ans, analyse les effets de second ordre.", exemple: "Quels sont les risques invisibles a 3 ans?" },
  { id: "tactique", label: "Tactique", icon: Zap, color: "text-amber-600", bgColor: "bg-amber-50 border-amber-300", gradient: "from-amber-600 to-amber-500", description: "Action concrete dans les 48h", comportement: "Compresse l'analyse, pousse vers des actions immediates.", exemple: "Quelle est l'action precise pour demain matin?" },
  { id: "analytique", label: "Analytique", icon: BarChart3, color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-300", gradient: "from-emerald-600 to-emerald-500", description: "Data-driven, hypotheses testables", comportement: "Demande les donnees avant de conclure. Structure en comparatifs.", exemple: "Quelles donnees me manquent pour valider?" },
  { id: "creatif", label: "Creatif", icon: Sparkles, color: "text-purple-600", bgColor: "bg-purple-50 border-purple-300", gradient: "from-purple-600 to-fuchsia-500", description: "Angles inattendus, rapprochements", comportement: "Sort des sentiers battus. Propose 3 options non-conventionnelles.", exemple: "Et si on faisait l'exact oppose?" },
  { id: "crise", label: "Crise", icon: ShieldAlert, color: "text-red-600", bgColor: "bg-red-50 border-red-300", gradient: "from-red-600 to-red-500", description: "Triage immediat, zero superflu", comportement: "Repond direct. Structure en: 24h / 7j / ignorer.", exemple: "L'unique chose a regler aujourd'hui?" },
];

// ── Catégories d'archétypes pour le catalogue ──
const ARCHETYPE_CATEGORIES = ["Strategie", "Innovation", "Leadership", "Finance", "Analyse", "Creativite", "Operations"];
const CATEGORY_META: Record<string, { emoji: string; badgeClass: string }> = {
  Strategie:   { emoji: "⚔️",  badgeClass: "text-blue-600 bg-blue-50 border-blue-200" },
  Innovation:  { emoji: "🚀",  badgeClass: "text-violet-600 bg-violet-50 border-violet-200" },
  Leadership:  { emoji: "🏛️",  badgeClass: "text-amber-600 bg-amber-50 border-amber-200" },
  Finance:     { emoji: "💰",  badgeClass: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  Analyse:     { emoji: "🔬",  badgeClass: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  Creativite:  { emoji: "✨",  badgeClass: "text-pink-600 bg-pink-50 border-pink-200" },
  Operations:  { emoji: "🏭",  badgeClass: "text-orange-600 bg-orange-50 border-orange-200" },
};

// ── Missions & objectifs par bot ──
const BOT_MISSIONS: Record<string, { mission: string; objectifs: { label: string; progres: number; cible: string }[]; chantiers: { nom: string; statut: "actif" | "pause" | "complete" }[] }> = {
  CEOB: {
    mission: "Orchestrer l'ensemble des operations de l'entreprise, prendre les decisions strategiques et coordonner l'equipe de 11 agents specialises.",
    objectifs: [
      { label: "Augmenter le score VITAA global a 65/100", progres: 72, cible: "Q2 2026" },
      { label: "Deployer 3 playbooks Pioneer par trimestre", progres: 45, cible: "Q2 2026" },
      { label: "Reduire le temps de decision de 48h a 4h", progres: 88, cible: "Q1 2026" },
    ],
    chantiers: [
      { nom: "Blueprint Direction", statut: "actif" },
      { nom: "Gouvernance IA", statut: "actif" },
      { nom: "Onboarding Pioneer", statut: "pause" },
    ],
  },
  CTOB: {
    mission: "Maintenir et faire evoluer l'architecture technique, superviser les deploiements et assurer la fiabilite de la plateforme.",
    objectifs: [
      { label: "Uptime 99.9% sur VPS1 et VPS2", progres: 98, cible: "Continu" },
      { label: "Reduire la dette technique de 40%", progres: 35, cible: "Q3 2026" },
      { label: "Migrer 3 services vers architecture microservices", progres: 20, cible: "Q3 2026" },
    ],
    chantiers: [
      { nom: "Migration Telnyx", statut: "pause" },
      { nom: "Infrastructure 2 VPS", statut: "complete" },
      { nom: "Pipeline CI/CD", statut: "actif" },
    ],
  },
  CFOB: {
    mission: "Gerer la sante financiere, produire les previsions et rapports, controler les couts et maximiser la rentabilite.",
    objectifs: [
      { label: "Marge brute > 60%", progres: 82, cible: "Q2 2026" },
      { label: "Budget API < 150$/mois", progres: 94, cible: "Continu" },
      { label: "Produire le rapport financier mensuel automatise", progres: 60, cible: "Q2 2026" },
    ],
    chantiers: [
      { nom: "Modelisation financiere SaaS", statut: "actif" },
      { nom: "Audit couts Q1", statut: "complete" },
    ],
  },
  CMOB: {
    mission: "Developper la notoriete de la marque, generer des leads qualifies et creer du contenu engageant pour les PME manufacturieres.",
    objectifs: [
      { label: "Generer 50 MQL/mois", progres: 38, cible: "Q3 2026" },
      { label: "Publier 12 contenus/mois sur LinkedIn", progres: 75, cible: "Continu" },
      { label: "Taux d'ouverture newsletters > 35%", progres: 65, cible: "Q2 2026" },
    ],
    chantiers: [
      { nom: "Campagne lancement Pioneer", statut: "actif" },
      { nom: "Refonte site web", statut: "pause" },
    ],
  },
  CSOB: {
    mission: "Analyser le marche et la concurrence, definir le positionnement strategique et identifier les opportunites de croissance.",
    objectifs: [
      { label: "Completer l'analyse concurrentielle Q2", progres: 55, cible: "Q2 2026" },
      { label: "Identifier 10 segments de marche inexploites", progres: 70, cible: "Q2 2026" },
      { label: "Plan strategique 2026-2028", progres: 25, cible: "Q3 2026" },
    ],
    chantiers: [
      { nom: "Veille concurrentielle", statut: "actif" },
      { nom: "Strategie expansion US", statut: "pause" },
    ],
  },
  COOB: {
    mission: "Optimiser les processus operationnels, gerer la chaine d'approvisionnement et assurer la qualite de livraison.",
    objectifs: [
      { label: "Reduire les delais de livraison de 20%", progres: 45, cible: "Q3 2026" },
      { label: "Taux de satisfaction client > 90%", progres: 82, cible: "Continu" },
      { label: "Documenter 100% des SOPs critiques", progres: 68, cible: "Q2 2026" },
    ],
    chantiers: [
      { nom: "Optimisation workflow", statut: "actif" },
      { nom: "Certification ISO 9001", statut: "pause" },
    ],
  },
  CPOB: {
    mission: "Gerer la planification de production, optimiser le rendement usine et deployer les pratiques Lean manufacturing.",
    objectifs: [
      { label: "OEE/TRS > 75%", progres: 68, cible: "Q3 2026" },
      { label: "Zero arret non planifie/mois", progres: 40, cible: "Q3 2026" },
      { label: "Reduire les rejets de 30%", progres: 55, cible: "Q2 2026" },
    ],
    chantiers: [
      { nom: "Programme 5S", statut: "actif" },
      { nom: "Maintenance preventive IoT", statut: "pause" },
    ],
  },
  CHROB: {
    mission: "Recruter et retenir les meilleurs talents, developper la culture d'entreprise et assurer la conformite RH.",
    objectifs: [
      { label: "Taux de retention > 85%", progres: 78, cible: "Continu" },
      { label: "Temps d'embauche moyen < 30 jours", progres: 62, cible: "Q2 2026" },
      { label: "100% des employes formes sur Brain Team", progres: 35, cible: "Q3 2026" },
    ],
    chantiers: [
      { nom: "Programme d'accueil", statut: "actif" },
      { nom: "Sondage engagement", statut: "complete" },
    ],
  },
  CINOB: {
    mission: "Piloter la recherche et developpement, identifier les technologies emergentes et proteger la propriete intellectuelle.",
    objectifs: [
      { label: "Deposer 2 brevets en 2026", progres: 15, cible: "Q4 2026" },
      { label: "Lancer 1 POC par trimestre", progres: 50, cible: "Continu" },
      { label: "Veille techno hebdomadaire", progres: 90, cible: "Continu" },
    ],
    chantiers: [
      { nom: "POC Agent autonome V2", statut: "actif" },
      { nom: "Etude faisabilite edge AI", statut: "pause" },
    ],
  },
  CROB: {
    mission: "Maximiser les revenus par le developpement d'affaires, la gestion du pipeline CRM et l'optimisation du cycle de vente.",
    objectifs: [
      { label: "Pipeline qualifie > 500K$", progres: 62, cible: "Q2 2026" },
      { label: "Taux de closing > 25%", progres: 78, cible: "Continu" },
      { label: "Revenu recurrent mensuel (MRR) > 50K$", progres: 38, cible: "Q4 2026" },
    ],
    chantiers: [
      { nom: "Programme referral REAI", statut: "actif" },
      { nom: "Expansion marche Ontario", statut: "pause" },
    ],
  },
  CLOB: {
    mission: "Proteger les interets legaux de l'entreprise, gerer les contrats et assurer la conformite reglementaire (Loi 25, CNESST).",
    objectifs: [
      { label: "Conformite Loi 25 a 100%", progres: 85, cible: "Q2 2026" },
      { label: "Reviser tous les contrats fournisseurs", progres: 60, cible: "Q2 2026" },
      { label: "Politique de confidentialite V2", progres: 90, cible: "Q1 2026" },
    ],
    chantiers: [
      { nom: "Audit conformite Loi 25", statut: "actif" },
      { nom: "Revision contrats SaaS", statut: "actif" },
    ],
  },
  CISOB: {
    mission: "Proteger l'infrastructure contre les cybermenaces, gerer les vulnerabilites et maintenir la posture de securite.",
    objectifs: [
      { label: "Zero breche de securite", progres: 100, cible: "Continu" },
      { label: "Score NIST CSF > 3.5/5", progres: 55, cible: "Q3 2026" },
      { label: "Tests de penetration trimestriels", progres: 50, cible: "Continu" },
    ],
    chantiers: [
      { nom: "Hardening VPS1 + VPS2", statut: "complete" },
      { nom: "Programme sensibilisation phishing", statut: "actif" },
    ],
  },
};

// ── Stats performance differenciees par bot ──
const BOT_STATS: Record<string, { messages: string; taches: string; tempsRep: string; deltaMsgs: string; deltaTaches: string; deltaTemps: string }> = {
  CEOB: { messages: "1,247", taches: "89", tempsRep: "2.3s", deltaMsgs: "+18%", deltaTaches: "12 en cours", deltaTemps: "-0.4s" },
  CTOB: { messages: "834", taches: "142", tempsRep: "1.8s", deltaMsgs: "+24%", deltaTaches: "8 en cours", deltaTemps: "-0.2s" },
  CFOB: { messages: "612", taches: "67", tempsRep: "3.1s", deltaMsgs: "+12%", deltaTaches: "5 en cours", deltaTemps: "-0.6s" },
  CMOB: { messages: "956", taches: "78", tempsRep: "2.7s", deltaMsgs: "+31%", deltaTaches: "9 en cours", deltaTemps: "-0.3s" },
  CSOB: { messages: "487", taches: "45", tempsRep: "4.2s", deltaMsgs: "+8%", deltaTaches: "3 en cours", deltaTemps: "+0.1s" },
  COOB: { messages: "723", taches: "112", tempsRep: "2.0s", deltaMsgs: "+15%", deltaTaches: "14 en cours", deltaTemps: "-0.5s" },
  CPOB: { messages: "541", taches: "156", tempsRep: "1.5s", deltaMsgs: "+22%", deltaTaches: "11 en cours", deltaTemps: "-0.3s" },
  CHROB: { messages: "398", taches: "52", tempsRep: "3.5s", deltaMsgs: "+9%", deltaTaches: "6 en cours", deltaTemps: "-0.2s" },
  CINOB: { messages: "312", taches: "38", tempsRep: "5.1s", deltaMsgs: "+45%", deltaTaches: "4 en cours", deltaTemps: "+0.8s" },
  CROB: { messages: "1,089", taches: "94", tempsRep: "1.9s", deltaMsgs: "+28%", deltaTaches: "15 en cours", deltaTemps: "-0.7s" },
  CLOB: { messages: "267", taches: "41", tempsRep: "4.8s", deltaMsgs: "+5%", deltaTaches: "3 en cours", deltaTemps: "-0.1s" },
  CISOB: { messages: "445", taches: "98", tempsRep: "1.2s", deltaMsgs: "+19%", deltaTaches: "7 en cours", deltaTemps: "-0.4s" },
};

// ── Configuration par bot ──
const BOT_CONFIG: Record<string, { temperature: number; tonalite: string; modele: string; langue: string; escalade: string; delegation: string[] }> = {
  CEOB: { temperature: 0.7, tonalite: "Conversationnel", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "—", delegation: ["CTOB", "CFOB", "CSOB"] },
  CTOB: { temperature: 0.4, tonalite: "Technique", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB si budget > 10K$", delegation: ["CISOB", "CINOB"] },
  CFOB: { temperature: 0.3, tonalite: "Formel", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB si montant > 50K$", delegation: ["CLOB"] },
  CMOB: { temperature: 0.8, tonalite: "Creatif", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB si campagne > 5K$", delegation: ["CROB"] },
  CSOB: { temperature: 0.5, tonalite: "Analytique", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB si pivot strategique", delegation: ["CROB", "CMOB"] },
  COOB: { temperature: 0.4, tonalite: "Directif", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB si arret production", delegation: ["CPOB"] },
  CPOB: { temperature: 0.3, tonalite: "Terrain", modele: "Gemini Flash 2.0", langue: "Francais (QC)", escalade: "COOB si defaut qualite", delegation: [] },
  CHROB: { temperature: 0.6, tonalite: "Bienveillant", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB si litige", delegation: [] },
  CINOB: { temperature: 0.9, tonalite: "Exploratoire", modele: "Claude Opus 4", langue: "Francais (QC)", escalade: "CTOB si faisabilite technique", delegation: [] },
  CROB: { temperature: 0.6, tonalite: "Persuasif", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB si deal > 100K$", delegation: [] },
  CLOB: { temperature: 0.2, tonalite: "Juridique", modele: "Claude Sonnet 4", langue: "Francais (QC)", escalade: "CEOB si risque legal eleve", delegation: [] },
  CISOB: { temperature: 0.3, tonalite: "Alerte", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB + CTOB si breche detectee", delegation: [] },
};

// ── Tâches directes du bot principal — basées sur modules réels ──
type PrimaryTaskGroup = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string; borderColor: string; textColor: string;
  tasks: string[];
};

const BOT_PRIMARY_TASKS: Record<string, PrimaryTaskGroup[]> = {
  CEOB: [
    { label: "Orchestration & Intelligence", icon: Target, bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700", tasks: [
      "Session CREDO complète (C→R→E→D→O)", "Board Room — tour de table 12 bots", "War Room — gestion de crise multi-agent",
      "Think Room — exploration stratégique", "Wargaming — simulation scénarios adversaires",
      "Délégation intelligente aux sous-agents", "Briefing voix (LiveKit)", "Analyse document PDF/image",
      "Transcription réunion → résumé structuré",
    ]},
    { label: "Diagnostic BTML", icon: BarChart3, bgColor: "bg-violet-50", borderColor: "border-violet-200", textColor: "text-violet-700", tasks: [
      "Triangle du Feu (/feu) — BRÛLE / COUVE / MEURT", "Score VITAA — Vente, Idée, Temps, Argent, Actif",
      "Tableau Périodique BTML (220+ éléments)", "Journal de décisions structuré",
      "Navigation phases CREDO (/phase, /avancer)", "Activation Ghost cognitif G1-G12",
    ]},
    { label: "Commandes & Intégrations", icon: Zap, bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-700", tasks: [
      "/agenda — Vue calendrier complète", "/rdv — Créer rendez-vous Google Calendar",
      "/briefing — Briefing du jour", "/libre — Disponibilités",
      "Rapport Google Docs (génération automatique)", "Wrap-up de session",
    ]},
    { label: "OKR & Leadership", icon: Star, bgColor: "bg-amber-50", borderColor: "border-amber-200", textColor: "text-amber-700", tasks: [
      "OKR — définition, alignement et suivi trimestriel", "Score leadership — évaluation 360°",
      "Executive dashboard personnalisé temps réel", "Playbook leadership stratégique PME",
      "Orchestration multi-agent avancée (COMMAND)", "Stratégie cognitive aetherlang",
      "Rapport PDF C-Suite généré automatiquement",
    ]},
  ],
  CTOB: [
    { label: "Architecture & Infrastructure", icon: Cpu, bgColor: "bg-violet-50", borderColor: "border-violet-200", textColor: "text-violet-700", tasks: [
      "Design infrastructure (VPS, cloud, containers)", "Évaluation architecture logicielle",
      "Sécurité API et firewalls", "Performance et bottlenecks",
      "Choix de stack technologique", "Migration données et cloud",
    ]},
    { label: "Opérations Tech", icon: Settings, bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700", tasks: [
      "Code review avec critères de qualité", "CI/CD pipeline et déploiement",
      "Docker et containerisation", "Monitoring temps réel",
      "Incident response et troubleshooting", "Cost optimization infra",
      "GitHub — gestion repos, PR et branches", "Kubernetes orchestration & scaling",
      "AiRadar — veille technologique IA en temps réel",
    ]},
    { label: "IA & LLM", icon: Sparkles, bgColor: "bg-cyan-50", borderColor: "border-cyan-200", textColor: "text-cyan-700", tasks: [
      "Sélection modèle IA par tier (T0→T4)", "Optimisation tokens et prompts",
      "Routage 5-tiers intelligent", "Gestion erreurs et fallbacks API",
      "Budget tech quotidien ($5/jour cible)",
    ]},
  ],
  CFOB: [
    { label: "Analyse Financière", icon: BarChart3, bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-700", tasks: [
      "Budget vs réalité — écarts et causes", "Prévisions revenus et coûts",
      "Cash flow et trésorerie court terme", "Point mort et seuil de rentabilité",
      "Marge brute vs marge nette", "Coût de revient par produit",
    ]},
    { label: "Stratégie Capital", icon: TrendingUp, bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700", tasks: [
      "Allocation capital (Margin of Safety — Buffett)", "Évaluation investissements (ROI, payback)",
      "Structure fiscale PME Québec", "Crédit d'impôt SR&DE",
      "Programmes BDC, DEC, CNESST", "Financement optimal et structure dette",
    ]},
    { label: "Opérations Comptables", icon: Activity, bgColor: "bg-amber-50", borderColor: "border-amber-200", textColor: "text-amber-700", tasks: [
      "Audit financier", "Paie et avantages sociaux",
      "Conformité fiscale", "Ratios financiers clés",
      "Analyse fournisseurs et négociation",
      "Xero — comptabilité cloud intégrée", "Modélisation financière startup",
      "CFO Advisor — recommandations automatiques",
    ]},
  ],
  CMOB: [
    { label: "Stratégie Marché", icon: Target, bgColor: "bg-pink-50", borderColor: "border-pink-200", textColor: "text-pink-700", tasks: [
      "Positionnement produit et marque", "Analyse concurrentielle",
      "Customer journey mapping", "Segmentation de marché",
      "Pricing strategy", "Stratégie d'acquisition clients",
    ]},
    { label: "Contenu & Communication", icon: MessageCircle, bgColor: "bg-purple-50", borderColor: "border-purple-200", textColor: "text-purple-700", tasks: [
      "Marketing de contenu (blog, vidéo, réseaux)", "Copywriting B2B",
      "Storytelling de marque", "Relations publiques",
      "Gestion réseaux sociaux", "Email marketing",
    ]},
    { label: "Campagnes & Production", icon: Zap, bgColor: "bg-orange-50", borderColor: "border-orange-200", textColor: "text-orange-700", tasks: [
      "Campagnes numériques (SEO/SEM)", "Études de marché",
      "Salons et événements", "Design packaging et identité visuelle",
    ]},
    { label: "CRM & Automatisation Marketing", icon: Activity, bgColor: "bg-rose-50", borderColor: "border-rose-200", textColor: "text-rose-700", tasks: [
      "HubSpot CRM — gestion contacts et pipeline", "SEO technique — audit et mots-clés",
      "Séquences email marketing automatisées", "Monitoring concurrents en temps réel",
      "ActiveCampaign — automation avancée", "Apollo.io — prospection B2B",
      "Création visuels Canva", "Rapport PDF marketing généré automatiquement",
    ]},
  ],
  CSOB: [
    { label: "Analyse Stratégique", icon: Eye, bgColor: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-700", tasks: [
      "SWOT complet (forces/faiblesses/opportunités/menaces)", "Porter 5 Forces — analyse compétitive",
      "Blue Ocean vs Red Ocean", "Benchmark compétiteurs",
      "Analyse tendances sectorielles",
      "Perplexity Deep Search — veille stratégique en profondeur",
      "Battlecard concurrents — fiche de combat", "Recherche académique approfondie (ArXiv/Scholar)",
      "Stratégie cognitive aetherlang",
    ]},
    { label: "Wargaming", icon: ShieldAlert, bgColor: "bg-orange-50", borderColor: "border-orange-200", textColor: "text-orange-700", tasks: [
      "Simulation réactions concurrents", "Scénarios what-if (optimiste / réaliste / pessimiste)",
      "Jeux de guerre commerciaux", "Stratégies de riposte",
      "Anticipated moves (mouvements attendus)",
    ]},
    { label: "Expansion", icon: TrendingUp, bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700", tasks: [
      "Entrée sur nouveaux marchés", "Croissance organique vs inorganique",
      "M&A strategy", "Partenariats stratégiques", "Internationalisation",
    ]},
  ],
  COOB: [
    { label: "Optimisation Processus", icon: Settings, bgColor: "bg-orange-50", borderColor: "border-orange-200", textColor: "text-orange-700", tasks: [
      "Lean manufacturing — élimination des 7 gaspillages", "Six Sigma DMAIC",
      "Gestion chaîne d'approvisionnement", "Logistique et entreposage",
      "Gestion des inventaires", "Import/Export et douanes",
    ]},
    { label: "Qualité & KPI", icon: BarChart3, bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700", tasks: [
      "Mise en place ISO 9001/14001/45001", "Contrôle qualité",
      "KPI et tableaux de bord", "Amélioration continue PDCA",
      "Planning de production (APS)",
    ]},
    { label: "Gestion de Projets", icon: Layers, bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-700", tasks: [
      "Décomposition en tâches actionnables", "Assignation des responsables",
      "Suivi d'avancement", "Gestion des dépendances", "Livraison et bilan de projet",
      "Jira — gestion tickets et sprints", "Notion — documentation et wiki",
      "Linear — tracking sprints agiles", "Asana — gestion projets multi-équipes",
    ]},
  ],
  CPOB: [
    { label: "Diagnostic Terrain", icon: Eye, bgColor: "bg-amber-50", borderColor: "border-amber-200", textColor: "text-amber-700", tasks: [
      "Genchi Genbutsu (aller voir sur le terrain)", "Identification des 7 gaspillages (Muda)",
      "Analyse flux de valeur (VSM)", "Diagnostic d'automatisation",
      "ROI investissements manufacturiers", "Recommandations modernisation usine",
    ]},
    { label: "Automatisation & Robotique", icon: Cpu, bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700", tasks: [
      "Intégration robotique complète", "Vision artificielle industrielle",
      "Cobotique et collaboration", "AGV/AMR (robots mobiles)",
      "Systèmes de convoyage", "Contrôle qualité automatisé",
    ]},
    { label: "Projets Manufacturiers", icon: Layers, bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-700", tasks: [
      "Cahier de charges SMART (/cprj)", "Rapport diagnostic détaillé",
      "Recherche intégrateurs Québec", "Estimation projets",
      "Formation opérateurs", "Maintenance prédictive et IoT",
      "Rapport PDF projet manufacturier généré automatiquement",
    ]},
  ],
  CHROB: [
    { label: "Recrutement", icon: Users, bgColor: "bg-teal-50", borderColor: "border-teal-200", textColor: "text-teal-700", tasks: [
      "Sourcing opérateurs spécialisés", "Processus de sélection",
      "Immigration économique (EIMT, mobilité)", "Évaluation psychométrique",
      "Onboarding et intégration", "Chasse de têtes — cadres",
      "LinkedIn Recruiter — sourcing automatisé", "Slack — communications RH en temps réel",
      "Zoom — entretiens vidéo et onboarding virtuel",
    ]},
    { label: "Rétention & Culture", icon: Star, bgColor: "bg-pink-50", borderColor: "border-pink-200", textColor: "text-pink-700", tasks: [
      "Diagnostic roulement (turnover)", "Programmes de rétention",
      "Culture d'entreprise", "Gestion de la performance",
      "Optimisation avantages sociaux", "Succession planning",
    ]},
    { label: "Conformité & Sécurité", icon: ShieldAlert, bgColor: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-700", tasks: [
      "CNESST et santé-sécurité", "Mutuelle de prévention",
      "Droit du travail Québec", "Gestion des conflits",
      "Normes du travail", "Formation et développement",
    ]},
  ],
  CINOB: [
    { label: "Industrie 4.0", icon: Cpu, bgColor: "bg-rose-50", borderColor: "border-rose-200", textColor: "text-rose-700", tasks: [
      "ERP/MES manufacturier", "IoT industriel",
      "Jumeau numérique (Digital Twin)", "Maintenance prédictive",
      "Smart factory assessment", "Transformation numérique usine",
    ]},
    { label: "Innovation & R&D", icon: Sparkles, bgColor: "bg-violet-50", borderColor: "border-violet-200", textColor: "text-violet-700", tasks: [
      "Design thinking et prototypage", "Propriété intellectuelle — brevets",
      "Commercialisation produit", "Innovation ouverte",
      "Veille technologique sectorielle", "Radar technologies émergentes",
      "Recherche papers académiques (ArXiv/Scholar)", "Assistant brevets — analyse et dépôt PI",
      "AiRadar — veille IA et technologies émergentes",
    ]},
    { label: "Financement Innovation", icon: DollarSign, bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-700", tasks: [
      "Crédit SR&DE (fédéral)", "CRSNG et Mitacs (transfert techno)",
      "Programmes gouvernementaux PME Québec", "Financement innovation — Investissement Québec",
    ]},
  ],
  CROB: [
    { label: "Pipeline & CRM", icon: BarChart3, bgColor: "bg-amber-50", borderColor: "border-amber-200", textColor: "text-amber-700", tasks: [
      "Gestion pipeline de ventes", "Qualification de leads",
      "Scoring et priorisation", "Automation des ventes",
      "Prévisions de revenus", "CRM strategy",
    ]},
    { label: "Outils CRM & Connectivité", icon: Activity, bgColor: "bg-yellow-50", borderColor: "border-yellow-200", textColor: "text-yellow-700", tasks: [
      "Salesforce — CRM enterprise complet", "LinkedIn Sales Navigator — prospection",
      "ActiveCampaign — nurturing et séquences automatisées", "Apollo.io — séquences outbound B2B",
      "Slack — coordination équipe ventes", "Zoom — calls de vente et démos",
      "Rapport PDF proposition commerciale générée automatiquement",
    ]},
    { label: "Vente Complexe B2B", icon: Target, bgColor: "bg-orange-50", borderColor: "border-orange-200", textColor: "text-orange-700", tasks: [
      "Cycles de vente long (3-12 mois)", "Mapping multi-décideurs (stakeholders)",
      "Proposition de valeur", "Négociation de contrats",
      "Techniques de closing", "Pricing strategy",
    ]},
    { label: "Développement des Affaires", icon: TrendingUp, bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700", tasks: [
      "Expansion de comptes clés", "Développement marché export",
      "Prospection B2B", "E-commerce B2B", "Compensation plans et incentives",
    ]},
  ],
  CLOB: [
    { label: "Droit Commercial", icon: Layers, bgColor: "bg-indigo-50", borderColor: "border-indigo-200", textColor: "text-indigo-700", tasks: [
      "Rédaction et négociation contrats", "Achat/vente d'entreprises",
      "NDA — accords de confidentialité", "Contrats de distribution",
      "Termes et conditions", "Partenariats et alliances",
    ]},
    { label: "Propriété Intellectuelle", icon: ShieldAlert, bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700", tasks: [
      "Brevets et marques de commerce", "Droits d'auteur",
      "Secrets commerciaux", "Portefeuille PI — gestion et stratégie",
      "Licences et royalties",
    ]},
    { label: "Conformité & Litiges", icon: Activity, bgColor: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-700", tasks: [
      "Loi 25 / LPRPDE (protection des données)", "Code civil Québec",
      "Lois du travail", "Gestion litiges commerciaux", "Assurances commerciales",
      "Conformité réglementaire — scan automatique", "Assistant brevets et PI",
    ]},
  ],
  CISOB: [
    { label: "Cybersécurité", icon: ShieldAlert, bgColor: "bg-gray-50", borderColor: "border-gray-200", textColor: "text-gray-700", tasks: [
      "Audit de sécurité complet", "Vulnerability assessment",
      "Penetration testing", "Incident response",
      "Malware analysis", "Ransomware protection",
    ]},
    { label: "Sécurité OT/SCADA Manufacturier", icon: Cpu, bgColor: "bg-slate-50", borderColor: "border-slate-200", textColor: "text-slate-700", tasks: [
      "Sécurité OT (Operational Technology)", "Sécurité SCADA/ICS",
      "Convergence IT/OT", "Protection plancher manufacturier",
      "Isolation réseau critique", "Sécurité des robots",
    ]},
    { label: "Conformité & Prévention", icon: Eye, bgColor: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-700", tasks: [
      "LPRPDE et Loi 25", "Protection données personnelles",
      "Formation sécurité employés", "Monitoring 24/7",
      "Plan de continuité d'affaires",
    ]},
    { label: "Aegis Security Suite", icon: ShieldAlert, bgColor: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-700", tasks: [
      "Aegis Audit — audit sécurité complet automatisé", "Aegis Shield — protection périmètre réseau",
      "Aegis Gate — contrôle d'accès et identités", "Vulnerability Scanner — détection CVE en temps réel",
      "Compliance scan — NIST / ISO 27001 / Loi 25", "Rapport PDF sécurité exécutif",
    ]},
  ],
};

// Mode d'exécution principal par bot + liste complète (depuis carlos_core.py)
const BOT_MODES_PRINCIPAL: Record<string, string> = {
  CEOB: "Stratégie", CTOB: "Analyse",     CFOB: "Décision", CMOB: "Innovation",
  CSOB: "Stratégie", COOB: "Débat",       CPOB: "Analyse",  CHROB: "Brainstorm",
  CINOB: "Innovation", CROB: "Décision",  CLOB: "Analyse",  CISOB: "Crise",
};
const ALL_MODES = ["Débat", "Brainstorm", "Crise", "Analyse", "Décision", "Stratégie", "Innovation", "Deep Resonance", "Ghost Mode"];

// ── Section: Déployer chantiers recommandés (Phase 4) ──
function DeployBlueprintButton({ botCode }: { botCode: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; seeded: { titre: string }[] } | null>(null);

  async function handleDeploy() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/chantiers/seed-from-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department_codes: [botCode] }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-800">{result.count} chantiers pré-montés créés</span>
        </div>
        <div className="space-y-1">
          {(result.seeded ?? []).slice(0, 5).map((s, i) => (
            <div key={i} className="text-[10px] text-emerald-700">• {s.titre}</div>
          ))}
          {(result.seeded ?? []).length > 5 && (
            <div className="text-[9px] text-emerald-500">+ {(result.seeded ?? []).length - 5} autres...</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleDeploy}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/50 text-violet-700 hover:bg-violet-100 hover:border-violet-400 transition-all cursor-pointer disabled:opacity-50"
    >
      {loading ? (
        <Activity className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      <span className="text-xs font-bold">
        {loading ? "Déploiement en cours..." : "Déployer les chantiers recommandés"}
      </span>
    </button>
  );
}

// ── Section: APIs & Connexions ──
function BotApisSection({ botCode }: { botCode: string }) {
  const coreApis = BOT_CORE_APIS[botCode] || BOT_CORE_APIS.CEOB;
  const [activeProviders, setActiveProviders] = useState<Set<string>>(new Set());
  const [loadingInt, setLoadingInt] = useState(true);

  useEffect(() => {
    fetch("/api/v1/integrations/user")
      .then(r => r.json())
      .catch(() => ({}))
      .then(data => {
        const list = data.integrations || (Array.isArray(data) ? data : []);
        setActiveProviders(new Set(list.map((i: { provider: string }) => i.provider)));
      })
      .finally(() => setLoadingInt(false));
  }, [botCode]);

  // Source de vérité: INTEGRATIONS (37 providers depuis IntegrationsPanel)
  const activeThirdParty = INTEGRATIONS.filter(i => activeProviders.has(i.provider));
  const availableThirdParty = INTEGRATIONS.filter(i => !activeProviders.has(i.provider));

  const renderCore = (a: ApiEntry) => {
    const brand = CORE_BRAND_MAP[a.name];
    return (
      <div key={a.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-white border-gray-200 shadow-sm">
        <IntegrationLogo domain={brand?.logoDomain ?? ""} name={a.name} color={brand?.color ?? a.color} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-gray-800 truncate">{a.name}</div>
          <div className="text-[10px] font-medium text-emerald-600">Système</div>
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
      </div>
    );
  };

  const renderThird = (i: IntegrationDef, active: boolean) => (
    <div key={i.provider} className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all",
      active ? "bg-white border-gray-200 shadow-sm" : "bg-gray-50/50 border-gray-100"
    )}>
      <IntegrationLogo domain={i.logoDomain} name={i.name} color={i.color} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-gray-800 truncate">{i.name}</div>
        <div className={cn("text-[10px] font-medium truncate", active ? "text-emerald-600" : "text-gray-400")}>
          {active ? "Connecté" : i.category}
        </div>
      </div>
      <button className={cn(
        "text-[9px] px-2.5 py-1 rounded-full font-medium border cursor-pointer transition-all shrink-0",
        active
          ? "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
          : "bg-[#00B4D8]/10 text-[#0090AC] border-[#00B4D8]/30 hover:bg-[#00B4D8]/20"
      )}>
        {active ? "Gérer" : "Activer"}
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Connexions système + intégrations actives */}
      <Card className="p-0 gap-0 overflow-hidden rounded-xl border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Activity className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900 flex-1">Connexions Actives</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            {coreApis.length + activeThirdParty.length} live
          </span>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          {coreApis.map(renderCore)}
          {activeThirdParty.map(i => renderThird(i, true))}
        </div>
      </Card>

      {/* Toutes les intégrations disponibles (source: IntegrationsPanel) */}
      <Card className="p-0 gap-0 overflow-hidden rounded-xl border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Cpu className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900 flex-1">Intégrations Disponibles</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
            {loadingInt ? "…" : availableThirdParty.length}
          </span>
        </div>
        {loadingInt ? (
          <div className="p-4 flex items-center justify-center gap-2 text-gray-400">
            <Activity className="h-4 w-4 animate-spin" />
            <span className="text-xs">Chargement…</span>
          </div>
        ) : (
          <div className="p-3 grid grid-cols-2 gap-2">
            {availableThirdParty.map(i => renderThird(i, false))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Avatar paths pour tous les bots ──
const BOT_AVATAR_MAP: Record<string, string> = {
  CEOB: "/agents/generated/ceo-carlos-profil-v3.png",
  CTOB: "/agents/generated/cto-thierry-profil-v3.png",
  CFOB: "/agents/generated/cfo-francois-profil-v3.png",
  CMOB: "/agents/generated/cmo-martine-profil-v3.png",
  CSOB: "/agents/generated/cso-sophie-profil-v3.png",
  COOB: "/agents/generated/coo-olivier-profil-v3.png",
  CPOB: "/agents/generated/factory-bot-profil-v3.png",
  CHROB: "/agents/generated/chro-helene-profil-v3.png",
  CINOB: "/agents/generated/cino-ines-profil-v3.png",
  CROB: "/agents/generated/cro-raphael-profil-v3.png",
  CLOB: "/agents/generated/clo-louise-profil-v3.png",
  CISOB: "/agents/generated/ciso-secbot-profil-v3.png",
};

const BOT_DISPLAY: Record<string, { name: string; role: string; dept: string }> = {
  CEOB: { name: "CarlOS", role: "CEO", dept: "Direction" },
  CTOB: { name: "Tim", role: "CTO", dept: "Technologie & Innovation" },
  CFOB: { name: "Frank", role: "CFO", dept: "Finance & Tresorerie" },
  CMOB: { name: "Mathilde", role: "CMO", dept: "Marketing & Croissance" },
  CSOB: { name: "Simone", role: "CSO", dept: "Strategie & Ventes" },
  COOB: { name: "Olivier", role: "COO", dept: "Operations & Production" },
  CPOB: { name: "Paco", role: "CPO", dept: "Automatisation & Usine" },
  CHROB: { name: "Helene", role: "CHRO", dept: "Ressources Humaines" },
  CINOB: { name: "Ines", role: "CINO", dept: "Innovation & R&D" },
  CROB: { name: "Rich", role: "CRO", dept: "Revenus & Croissance" },
  CLOB: { name: "Loulou", role: "CLO", dept: "Juridique & Conformite" },
  CISOB: { name: "Sebastien", role: "CISO", dept: "Securite & Cyber" },
};

const BOT_GRADIENT: Record<string, string> = {
  CEOB: "from-blue-600 to-indigo-600", CTOB: "from-violet-600 to-purple-600",
  CFOB: "from-emerald-600 to-teal-600", CMOB: "from-pink-600 to-rose-600",
  CSOB: "from-red-600 to-orange-600", COOB: "from-orange-600 to-amber-600",
  CPOB: "from-amber-600 to-yellow-600", CHROB: "from-teal-600 to-cyan-600",
  CINOB: "from-rose-600 to-pink-600", CROB: "from-amber-600 to-orange-600",
  CLOB: "from-indigo-600 to-blue-600", CISOB: "from-gray-600 to-slate-600",
};

// ── Section: Équipe sous-bots + compétences ──
function BotSubteamSection({ botCode }: { botCode: string }) {
  const team = BOT_SUBTEAM[botCode] || BOT_SUBTEAM.CEOB;
  const totalTaches = team.reduce((n, s) => n + s.taches.length, 0);
  // Tous ouverts par défaut — l'utilisateur peut fermer ceux qu'il veut
  const [openSet, setOpenSet] = useState<Set<string>>(new Set(team.map(sb => sb.nom)));
  const toggle = (nom: string) => setOpenSet(prev => {
    const next = new Set(prev);
    next.has(nom) ? next.delete(nom) : next.add(nom);
    return next;
  });

  return (
    <Card className="p-0 gap-0 overflow-hidden rounded-xl border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
        <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <span className="text-sm font-bold text-gray-900 flex-1">Équipe spécialisée</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">{team.length} sous-bots</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-medium">{totalTaches} compétences</span>
      </div>

      <div className="p-3 space-y-2">
        {team.map(sb => {
          const isOpen = openSet.has(sb.nom);
          const SbIcon = SUBBOT_ICON_MAP[sb.emoji] ?? Star;
          return (
            <div key={sb.nom} className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-[#00B4D8]/10 text-left cursor-pointer hover:bg-[#00B4D8]/20 transition-colors"
                onClick={() => toggle(sb.nom)}
              >
                <SbIcon className="h-4 w-4 text-gray-700 stroke-[2.5] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate">{sb.nom}</div>
                  <div className="text-[10px] text-gray-500">{sb.taches.length} compétence{sb.taches.length > 1 ? "s" : ""}</div>
                </div>
                <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform duration-200", isOpen ? "rotate-0" : "-rotate-90")} />
              </button>

              {isOpen && (
                <div className="px-3 pb-3 pt-2 space-y-1">
                  {sb.taches.map(t => (
                    <div key={t} className={cn(
                      "flex items-center gap-2 text-xs text-gray-700 py-1 px-2.5 border-l-2 rounded-r-sm",
                      sb.bgColor, sb.borderColor
                    )}>
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Section: Tâches directes du bot principal ──
function BotPrimarySection({ botCode }: { botCode: string }) {
  const groups = BOT_PRIMARY_TASKS[botCode] || BOT_PRIMARY_TASKS.CEOB;
  const totalTasks = groups.reduce((n, g) => n + g.tasks.length, 0);
  const [openSet, setOpenSet] = useState<Set<string>>(new Set(groups.map(g => g.label)));
  const toggle = (label: string) => setOpenSet(prev => {
    const next = new Set(prev);
    next.has(label) ? next.delete(label) : next.add(label);
    return next;
  });

  return (
    <Card className="p-0 gap-0 overflow-hidden rounded-xl border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
        <Target className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <span className="text-sm font-bold text-gray-900 flex-1">Tâches directes</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-medium">{totalTasks} capacités</span>
      </div>
      <div className="p-3 space-y-2">
        {groups.map(g => {
          const isOpen = openSet.has(g.label);
          const GIcon = g.icon;
          return (
            <div key={g.label} className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-[#00B4D8]/10 text-left cursor-pointer hover:bg-[#00B4D8]/20 transition-colors"
                onClick={() => toggle(g.label)}
              >
                <GIcon className="h-4 w-4 text-gray-700 stroke-[2.5] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate">{g.label}</div>
                  <div className="text-[10px] text-gray-500">{g.tasks.length} capacité{g.tasks.length > 1 ? "s" : ""}</div>
                </div>
                <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform duration-200", isOpen ? "rotate-0" : "-rotate-90")} />
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-2 space-y-1">
                  {g.tasks.map(t => (
                    <div key={t} className={cn(
                      "flex items-center gap-2 text-xs text-gray-700 py-1 px-2.5 border-l-2 rounded-r-sm",
                      g.bgColor, g.borderColor
                    )}>
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Section: Modes d'exécution ──
function BotModesSection({ botCode }: { botCode: string }) {
  const principal = BOT_MODES_PRINCIPAL[botCode] || "Stratégie";
  return (
    <Card className="p-0 gap-0 overflow-hidden rounded-xl border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
        <Zap className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <span className="text-sm font-bold text-gray-900 flex-1">Modes d'exécution</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">{ALL_MODES.length} modes</span>
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-2">
          {ALL_MODES.map(m => (
            <div key={m} className={cn(
              "text-xs px-3 py-1.5 rounded-full font-medium border transition-all",
              m === principal
                ? "bg-[#00B4D8]/15 text-[#0090AC] border-[#00B4D8]/40 font-bold"
                : "bg-gray-50 text-gray-600 border-gray-200"
            )}>
              {m === principal && <span className="mr-1.5">★</span>}
              {m}
            </div>
          ))}
        </div>
        <div className="mt-2.5 text-[10px] text-gray-400">
          Mode principal : <span className="font-bold text-[#0090AC]">{principal}</span>
        </div>
      </div>
    </Card>
  );
}

// ── Section: Configuration Complete (Parametres + Mode Decision + Trisociation + Catalogue) ──
function BotConfigSection({ botCode }: { botCode: string }) {
  const initial = BOT_CONFIG[botCode] || BOT_CONFIG.CEOB;
  const d = BOT_DISPLAY[botCode] || BOT_DISPLAY.CEOB;
  const ghosts = BOT_GHOSTS[botCode] || BOT_GHOSTS.CEOB;
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [canvasId, setCanvasId] = useState<number | null>(null);
  const [activeMode, setActiveMode] = useState("strategique");
  const [localGhosts, setLocalGhosts] = useState<string[]>(ghosts);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  // Charger la config sauvegardée depuis le canvas au montage
  useEffect(() => {
    api.getOrCreateCanvas(`blueprint_${botCode}_config`).then(canvas => {
      setCanvasId(canvas.id);
      if (canvas.data?.trisociation_ghosts && Array.isArray(canvas.data.trisociation_ghosts)) {
        setLocalGhosts(canvas.data.trisociation_ghosts as string[]);
      }
      if (canvas.data?.decision_mode && typeof canvas.data.decision_mode === "string") {
        setActiveMode(canvas.data.decision_mode);
      }
    }).catch(() => {/* silently ignore */});
  }, [botCode]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let id = canvasId;
      if (!id) {
        const canvas = await api.getOrCreateCanvas(`blueprint_${botCode}_config`);
        id = canvas.id;
        setCanvasId(id);
      }
      await api.updateCanvas(id, {
        trisociation_ghosts: localGhosts,
        decision_mode: activeMode,
        updated_at: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silently ignore
    } finally {
      setSaving(false);
    }
  };
  const currentMode = DECISION_MODES.find(m => m.id === activeMode)!;
  const ghostSet = new Set(localGhosts);
  const allArchetypes = Object.entries(GHOST_ARCHETYPES);
  const handleAssign = (name: string) => {
    if (editingSlot === null) return;
    const next = [...localGhosts];
    next[editingSlot] = name;
    setLocalGhosts(next);
    setEditingSlot(null);
  };

  return (
    <div className="space-y-3">
      {/* ── 1. Mode de Decision ── */}
      <Card className="p-0 gap-0 overflow-hidden rounded-xl border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
        <div className={cn("bg-gradient-to-r px-4 py-2.5 flex items-center gap-2", currentMode.gradient)}>
          <Target className="h-4 w-4 text-white" />
          <span className="text-xs font-bold text-white flex-1">Mode de Decision</span>
          <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">{currentMode.label}</span>
        </div>
        <div className="p-3 space-y-2.5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
            {DECISION_MODES.map(mode => {
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
          <div className={cn("rounded-lg border p-2.5 space-y-1", currentMode.bgColor)}>
            <p className={cn("text-[10px] font-bold", currentMode.color)}>{currentMode.description}</p>
            <p className="text-[10px] text-gray-700 leading-relaxed">{currentMode.comportement}</p>
            <div className="flex items-start gap-1.5 bg-white/60 rounded-md px-2 py-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-[9px] text-gray-600 italic">"{currentMode.exemple}"</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 2. Trisociation — Skins Cognitifs ── */}
      <Card className="p-0 gap-0 overflow-hidden rounded-xl border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Zap className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900 flex-1">Skins Cognitifs — Trisociation</span>
          <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full">{localGhosts.length} actifs</span>
        </div>
        <div className="p-3 space-y-2">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Configurez les 3 archetypes qui definissent le comportement, le style de reflexion et les priorites de {d.name}.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {localGhosts.map((ghostName, i) => {
              const arch = GHOST_ARCHETYPES[ghostName];
              if (!arch) return null;
              const isEditing = editingSlot === i;
              return (
                <div key={i} className={cn("border rounded-xl overflow-hidden", SLOT_BG[i], isEditing && "ring-2 ring-violet-300")}>
                  <div className={cn("bg-gradient-to-r px-2.5 py-1.5 flex items-center gap-1.5", SLOT_COLORS[i])}>
                    <span className="text-sm">{arch.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[8px] font-bold text-white/70 uppercase">{SLOT_LABELS_BP[i]}</div>
                      <div className="text-[10px] font-bold text-white truncate">{arch.nom}</div>
                    </div>
                  </div>
                  <div className="p-2">
                    <span className={cn("text-[8px] font-medium px-1.5 py-0.5 rounded-full border", CATEGORY_META[arch.categorie]?.badgeClass || "text-gray-600 bg-gray-50 border-gray-200")}>{arch.categorie}</span>
                    <p className="text-[8px] text-gray-500 italic truncate mt-1">"{arch.signature}"</p>
                    <button onClick={() => setEditingSlot(isEditing ? null : i)} className={cn("w-full mt-1.5 text-[9px] px-2 py-1 rounded-full flex items-center justify-center gap-1 font-medium cursor-pointer border transition-all",
                      i === 0 ? "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" :
                      i === 1 ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" :
                      "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    )}>
                      <Settings className="h-3.5 w-3.5" /> {isEditing ? "Fermer" : "Modifier"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {editingSlot !== null && (
            <div className="border border-dashed border-violet-200 rounded-xl p-3 bg-violet-50/30">
              <div className="text-[9px] font-bold text-violet-600 uppercase tracking-wider mb-2">
                Choisir une teinture pour le slot {SLOT_LABELS_BP[editingSlot]}
              </div>
              <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                {ARCHETYPE_CATEGORIES.map(cat => {
                  const catMeta = CATEGORY_META[cat];
                  const items = allArchetypes.filter(([, a]) => a.categorie === cat);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat}>
                      <div className="flex items-center gap-1.5 px-1 py-1">
                        <span className="text-sm">{catMeta.emoji}</span>
                        <span className="text-[9px] font-bold text-gray-600">{cat}</span>
                        <span className="text-[8px] text-gray-400">({items.length})</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {items.map(([name, arch]) => {
                          const isCurrent = name === localGhosts[editingSlot];
                          const isUsed = ghostSet.has(name) && !isCurrent;
                          return (
                            <button key={name} onClick={() => !isUsed && handleAssign(name)} className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all",
                              isCurrent ? "border-violet-300 bg-violet-50 shadow-sm" :
                              isUsed ? "border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed" :
                              "border-gray-100 hover:bg-gray-50 hover:border-gray-200 cursor-pointer"
                            )}>
                              <span className="text-sm shrink-0">{arch.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-[9px] font-bold text-gray-800 truncate">{arch.nom}</div>
                                <div className="text-[8px] text-gray-500 truncate">{arch.signature.slice(0, 40)}...</div>
                              </div>
                              {isCurrent && <CheckCircle2 className="h-3.5 w-3.5 text-violet-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── 3. Parametres Agent ── */}
      <Card className="p-0 gap-0 overflow-hidden rounded-xl border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Settings className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900 flex-1">Parametres — {d.name}</span>
        </div>
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50/50">
            <span className="text-xs font-medium text-gray-700">Escalade</span>
            <span className="text-[9px] font-bold text-gray-800">{initial.escalade}</span>
          </div>
          {initial.delegation.length > 0 && (
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Delegation vers</span>
              <div className="flex flex-wrap gap-1.5">
                {initial.delegation.map(code => {
                  const dd = BOT_DISPLAY[code];
                  return dd ? (
                    <span key={code} className="text-[9px] px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-medium">{dd.name} ({dd.role})</span>
                  ) : null;
                })}
                <button className="text-[9px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-dashed border-gray-300 font-medium cursor-pointer hover:bg-gray-100 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Sauvegarder ── */}
      <div className="flex items-center justify-center">
        <button onClick={handleSave} disabled={saving} className={cn(
          "text-xs px-6 py-2.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all shadow-sm disabled:opacity-60",
          saved ? "bg-emerald-600 text-white" : "bg-violet-600 text-white hover:bg-violet-700"
        )}>
          {saved ? <><CheckCircle2 className="h-3.5 w-3.5" /> Sauvegardé!</> : saving ? <><Activity className="h-3.5 w-3.5 animate-spin" /> Sauvegarde...</> : <><Save className="h-3.5 w-3.5" /> Sauvegarder la configuration</>}
        </button>
      </div>
    </div>
  );
}

export function BlueprintBot({ botCode, headerGradient }: { botCode: string; headerGradient: string }) {
  const isMobile = useIsMobile();
  const [activeAnchor, setActiveAnchor] = useState(BOT_SECTION_META[0].id);
  const vitaa = VITAA_BOT[botCode] || VITAA_BOT.CEOB;
  const profile = BOT_PROFILES_BP[botCode] || BOT_PROFILES_BP.CEOB;
  const cap = BOT_CAPACITES_BP[botCode] || BOT_CAPACITES_BP.CEOB;
  const display = BOT_DISPLAY[botCode] || BOT_DISPLAY.CEOB;
  const avatar = BOT_AVATAR_MAP[botCode] || BOT_AVATAR_MAP.CEOB;
  const gradient = BOT_GRADIENT[botCode] || BOT_GRADIENT.CEOB;
  const missions = BOT_MISSIONS[botCode] || BOT_MISSIONS.CEOB;
  const botStats = BOT_STATS[botCode] || BOT_STATS.CEOB;

  const SCORE_LABELS: Record<string, string> = { strategique: "Strategique", analytique: "Analytique", creatif: "Creatif", operationnel: "Operationnel", relationnel: "Relationnel" };
  const SCORE_COLORS: Record<string, string> = { strategique: "bg-blue-500", analytique: "bg-emerald-500", creatif: "bg-purple-500", operationnel: "bg-orange-500", relationnel: "bg-pink-500" };

  const kpis = [
    { label: "Messages", value: botStats.messages, sub: botStats.deltaMsgs + " ce mois", icon: MessageCircle, gradient: "from-blue-600 to-blue-500", color: "text-blue-600" },
    { label: "Taches", value: botStats.taches, sub: botStats.deltaTaches, icon: CheckCircle2, gradient: "from-emerald-600 to-emerald-500", color: "text-emerald-600" },
    { label: "Temps rep.", value: botStats.tempsRep, sub: botStats.deltaTemps + " vs mois dernier", icon: Activity, gradient: "from-violet-600 to-violet-500", color: "text-violet-600" },
    { label: "Cout/mois", value: cap.coutIA, sub: cap.coutHumain + " si humain", icon: DollarSign, gradient: "from-amber-600 to-amber-500", color: "text-amber-600" },
  ];

  const scrollToSection = (id: string) => {
    setActiveAnchor(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-3">
      {/* ── HERO — Photo + Mission — full width ── */}
      <div className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden", gradient)}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-4 p-4">
          <img src={avatar} alt={display.name} className="w-20 h-20 rounded-xl object-cover border-2 border-white/30 shadow-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">{display.name}</h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{display.role}</span>
              <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                Actif
              </span>
            </div>
            <p className="text-xs text-white/90 leading-relaxed">{missions.mission}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/15 text-white font-medium">{display.dept}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/15 text-white font-medium">{profile.style}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/15 text-white font-medium">{cap.tachesCount} taches/mois</span>
            </div>
          </div>
        </div>
      </div>

      <div className={cn("flex gap-3", isMobile && "flex-col gap-0")}>
      {(() => {
        const sidebarContent = (<>
          {BOT_SECTION_META.map(s => {
            const isActive = activeAnchor === s.id;
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => scrollToSection(s.id)} className={cn(
                "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
              )}>
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-blue-500" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>{s.label}</span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-blue-400" />}
                </div>
              </button>
            );
          })}
        </>);
        return isMobile ? (
          <MobileSidebarSheet currentLabel={BOT_SECTION_META.find(s => s.id === activeAnchor)?.label ?? "Bot"} itemCount={BOT_SECTION_META.length}>
            {sidebarContent}
          </MobileSidebarSheet>
        ) : (
          <div className="w-[180px] shrink-0 space-y-0.5 sticky top-0 self-start">
            {sidebarContent}
          </div>
        );
      })()}
      <div className="flex-1 min-w-0 space-y-4">

        {/* ── VUE D'ENSEMBLE ── */}
        <div id="sec-overview" className="space-y-3">
          {/* VITAA + Profil Psychometrique côte à côte */}
          <div className="grid grid-cols-2 gap-3">
            <VitaaTable data={vitaa} title={`VITAA — ${display.name}`} />
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <Star className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900 flex-1">Profil Psychometrique</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{profile.style}</span>
              </div>
              <div className="p-2.5 space-y-2">
                {Object.entries(profile.scores).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-medium text-gray-600">{SCORE_LABELS[key] || key}</span>
                      <span className={cn("text-[9px] font-bold", val >= 80 ? "text-emerald-600" : val >= 60 ? "text-blue-600" : "text-gray-500")}>{val}/100</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", SCORE_COLORS[key] || "bg-gray-400")} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4 KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpis.map(k => {
              const Icon = k.icon;
              return (
                <div key={k.label} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                    <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                    <span className="text-sm font-bold text-gray-900">{k.label}</span>
                  </div>
                  <div className="px-4 py-3">
                    <div className={cn("text-2xl font-bold", k.color)}>{k.value}</div>
                    <div className="text-[10px] text-gray-500">{k.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ROI compact + Objectifs côte à côte */}
          <div className="grid grid-cols-2 gap-3">
            {/* ROI small box */}
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <DollarSign className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900">ROI — Equiv. Humain</span>
              </div>
              <div className="p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-[9px] text-gray-500 uppercase font-bold">Agent IA</div>
                  <div className="text-xl font-bold text-emerald-600">{cap.coutIA}/mois</div>
                  <div className="text-[9px] text-gray-400">{cap.tachesCount} taches · {cap.heuresMois}</div>
                </div>
                <div className="text-lg font-bold text-gray-300">vs</div>
                <div className="flex-1">
                  <div className="text-[9px] text-gray-500 uppercase font-bold">{cap.equivHumain}</div>
                  <div className="text-xl font-bold text-red-500">{cap.coutHumain}/an</div>
                  <div className="text-[9px] text-gray-400">Meme scope</div>
                </div>
              </div>
            </div>

            {/* Objectifs */}
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <Target className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900 flex-1">Objectifs</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{missions.objectifs.length} actifs</span>
              </div>
              <div className="p-2.5 space-y-2">
                {missions.objectifs.map((obj, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-medium text-gray-800 truncate flex-1 mr-2">{obj.label}</span>
                      <span className={cn("text-[9px] font-bold shrink-0", obj.progres >= 75 ? "text-emerald-600" : obj.progres >= 50 ? "text-blue-600" : "text-amber-600")}>{obj.progres}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", obj.progres >= 75 ? "bg-emerald-500" : obj.progres >= 50 ? "bg-blue-500" : "bg-amber-500")} style={{ width: `${obj.progres}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── ÉQUIPE SOUS-BOTS & TÂCHES ── */}
        <div id="sec-taches" className="space-y-3">
          <BotPrimarySection botCode={botCode} />
          <BotSubteamSection botCode={botCode} />
          <BotModesSection botCode={botCode} />
        </div>


        {/* ── OUTILS & CONNEXIONS ── */}
        <div id="sec-outils">
          <BotApisSection botCode={botCode} />
        </div>

        {/* ── CONFIGURATION ── */}
        <div id="sec-config">
          <BotConfigSection botCode={botCode} />
        </div>
      </div>
      </div>
    </div>
  );
}
