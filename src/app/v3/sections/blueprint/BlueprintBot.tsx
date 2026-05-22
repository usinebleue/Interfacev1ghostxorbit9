/** BlueprintBot.tsx — Blueprint de l'Agent IA. Extracted from BlueprintDepartement.tsx */

import { useState, useEffect } from "react";
import {
  Target, DollarSign, TrendingUp, Settings, Save, CheckCircle2,
  Eye, ChevronRight, Users, Plus, Zap, Activity, BarChart3, Star,
  MessageCircle, Cpu, Sparkles, ShieldAlert, Layers,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { cn } from "../../../components/ui/utils";
import { useIsMobile } from "../../../components/ui/use-mobile";
import { VitaaTable } from "./blueprint-helpers";
import { MobileSidebarSheet } from "../../core/MobileSidebarSheet";
import { api } from "../../../v2/api/client";

// ── Blueprint Bot — Profil, Trisociation, Skills, APIs, Performance ──

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
  CEOB: { equivHumain: "CEO conseil", coutHumain: "100-200K$", tachesCount: 15, heuresMois: "80-120h", coutIA: "47$" },
  CTOB: { equivHumain: "CTO fractionnaire", coutHumain: "150-300K$", tachesCount: 16, heuresMois: "120-180h", coutIA: "62$" },
  CFOB: { equivHumain: "CFO fractionnaire", coutHumain: "150-250K$", tachesCount: 18, heuresMois: "100-160h", coutIA: "38$" },
  CMOB: { equivHumain: "Directeur marketing", coutHumain: "120-200K$", tachesCount: 14, heuresMois: "100-160h", coutIA: "55$" },
  CSOB: { equivHumain: "Consultant strategie", coutHumain: "120-200K$", tachesCount: 12, heuresMois: "80-120h", coutIA: "41$" },
  COOB: { equivHumain: "Directeur operations", coutHumain: "120-200K$", tachesCount: 15, heuresMois: "120-200h", coutIA: "52$" },
  CPOB: { equivHumain: "Directeur usine", coutHumain: "100-180K$", tachesCount: 20, heuresMois: "140-220h", coutIA: "58$" },
  CHROB: { equivHumain: "DRH fractionnaire", coutHumain: "100-180K$", tachesCount: 14, heuresMois: "80-140h", coutIA: "35$" },
  CINOB: { equivHumain: "VP Innovation", coutHumain: "130-220K$", tachesCount: 10, heuresMois: "60-100h", coutIA: "44$" },
  CROB: { equivHumain: "VP Ventes", coutHumain: "120-250K$", tachesCount: 16, heuresMois: "100-160h", coutIA: "49$" },
  CLOB: { equivHumain: "Avocat d'entreprise", coutHumain: "150-300K$", tachesCount: 12, heuresMois: "60-100h", coutIA: "32$" },
  CISOB: { equivHumain: "CISO fractionnaire", coutHumain: "140-250K$", tachesCount: 18, heuresMois: "100-160h", coutIA: "56$" },
};

const SLOT_LABELS_BP = ["Primaire", "Calibrateur", "Amplificateur"];
const SLOT_COLORS = ["from-blue-600 to-blue-500", "from-violet-600 to-violet-500", "from-amber-600 to-amber-500"];
const SLOT_BG = ["bg-blue-50 border-blue-200", "bg-violet-50 border-violet-200", "bg-amber-50 border-amber-200"];
const SLOT_TEXT_C = ["text-blue-700", "text-violet-700", "text-amber-700"];

const BOT_APIS: Record<string, { name: string; status: "active" | "config" | "off"; icon: string; color: string }[]> = {
  CEOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "Claude Sonnet 4", status: "active", icon: "LLM", color: "bg-violet-500" },
    { name: "ElevenLabs (Chris)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Deepgram Nova-3", status: "active", icon: "STT", color: "bg-cyan-500" },
    { name: "LiveKit WebRTC", status: "active", icon: "RTC", color: "bg-orange-500" },
    { name: "Tavus Video Avatar", status: "active", icon: "VID", color: "bg-pink-500" },
    { name: "PostgreSQL (carlosdb)", status: "active", icon: "DB", color: "bg-indigo-500" },
    { name: "Telnyx Telephonie", status: "active", icon: "TEL", color: "bg-teal-500" },
    { name: "Google Calendar", status: "config", icon: "CAL", color: "bg-amber-500" },
    { name: "Slack Notifications", status: "off", icon: "MSG", color: "bg-purple-500" },
  ],
  CTOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "GitHub Copilot", status: "active", icon: "DEV", color: "bg-gray-800" },
    { name: "ElevenLabs (Daniel)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Sentry", status: "active", icon: "MON", color: "bg-red-500" },
    { name: "PostgreSQL", status: "active", icon: "DB", color: "bg-indigo-500" },
    { name: "Docker Engine", status: "active", icon: "CNT", color: "bg-blue-600" },
    { name: "Nginx Reverse Proxy", status: "active", icon: "SRV", color: "bg-green-600" },
    { name: "AWS CloudWatch", status: "config", icon: "INF", color: "bg-cyan-600" },
    { name: "Vercel Deploy", status: "off", icon: "CD", color: "bg-gray-700" },
  ],
  CFOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "QuickBooks Online", status: "active", icon: "FIN", color: "bg-emerald-600" },
    { name: "ElevenLabs (James)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "PostgreSQL", status: "active", icon: "DB", color: "bg-indigo-500" },
    { name: "Stripe Payments", status: "config", icon: "PAY", color: "bg-violet-500" },
    { name: "Wave Accounting", status: "config", icon: "FIN", color: "bg-blue-400" },
    { name: "Dext (factures)", status: "off", icon: "OCR", color: "bg-teal-500" },
  ],
  CMOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "ElevenLabs (Sarah)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Canva API", status: "active", icon: "DSN", color: "bg-cyan-500" },
    { name: "Google Analytics 4", status: "active", icon: "ANA", color: "bg-amber-500" },
    { name: "HubSpot Marketing", status: "config", icon: "MKT", color: "bg-orange-500" },
    { name: "Mailchimp", status: "config", icon: "EML", color: "bg-amber-600" },
    { name: "Meta Ads Manager", status: "config", icon: "ADS", color: "bg-blue-600" },
    { name: "Hootsuite", status: "off", icon: "SOC", color: "bg-gray-600" },
  ],
  CSOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "ElevenLabs (Nicole)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "LinkedIn Sales Nav", status: "config", icon: "CRM", color: "bg-blue-700" },
    { name: "Apollo.io", status: "config", icon: "PRO", color: "bg-violet-500" },
    { name: "ZoomInfo", status: "off", icon: "DAT", color: "bg-orange-600" },
    { name: "Pipedrive", status: "off", icon: "CRM", color: "bg-green-600" },
  ],
  COOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "ElevenLabs (Marcus)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Notion", status: "active", icon: "DOC", color: "bg-gray-800" },
    { name: "Monday.com", status: "config", icon: "PMO", color: "bg-red-500" },
    { name: "Jira", status: "config", icon: "TKT", color: "bg-blue-600" },
    { name: "Slack", status: "config", icon: "MSG", color: "bg-purple-500" },
    { name: "Power Automate", status: "off", icon: "AUT", color: "bg-blue-500" },
  ],
  CPOB: [
    { name: "Gemini Flash 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "ElevenLabs (Tom)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Epicor ERP", status: "config", icon: "ERP", color: "bg-orange-600" },
    { name: "SCADA Interface", status: "config", icon: "IOT", color: "bg-teal-600" },
    { name: "Siemens MindSphere", status: "off", icon: "IOT", color: "bg-cyan-700" },
    { name: "MES (Mfg Exec)", status: "off", icon: "MES", color: "bg-gray-600" },
  ],
  CHROB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "ElevenLabs (Emily)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "BambooHR", status: "config", icon: "RH", color: "bg-teal-500" },
    { name: "Indeed Posting", status: "config", icon: "JOB", color: "bg-blue-500" },
    { name: "Workday", status: "off", icon: "RH", color: "bg-orange-500" },
    { name: "Teams (comm interne)", status: "off", icon: "MSG", color: "bg-violet-600" },
  ],
  CINOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "Claude Opus 4", status: "active", icon: "LLM", color: "bg-violet-500" },
    { name: "ElevenLabs (Aria)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Miro (ideation)", status: "active", icon: "WB", color: "bg-amber-500" },
    { name: "Google Patents", status: "config", icon: "PAT", color: "bg-amber-600" },
    { name: "Figma API", status: "off", icon: "DSN", color: "bg-purple-500" },
  ],
  CROB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "ElevenLabs (Brian)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "HubSpot CRM", status: "active", icon: "CRM", color: "bg-orange-500" },
    { name: "PandaDoc", status: "active", icon: "DOC", color: "bg-green-500" },
    { name: "Calendly", status: "config", icon: "CAL", color: "bg-blue-400" },
    { name: "Gong.io (calls)", status: "config", icon: "ANA", color: "bg-purple-600" },
    { name: "Salesforce", status: "off", icon: "CRM", color: "bg-blue-600" },
  ],
  CLOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "Claude Sonnet 4", status: "active", icon: "LLM", color: "bg-violet-500" },
    { name: "ElevenLabs (Grace)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "DocuSign", status: "config", icon: "SGN", color: "bg-amber-500" },
    { name: "Clio (gestion juridique)", status: "config", icon: "LAW", color: "bg-indigo-500" },
    { name: "LexisNexis", status: "off", icon: "RCH", color: "bg-red-600" },
  ],
  CISOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "ElevenLabs (Adam)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Snyk", status: "active", icon: "SEC", color: "bg-purple-600" },
    { name: "Cloudflare WAF", status: "active", icon: "WAF", color: "bg-orange-500" },
    { name: "CrowdStrike", status: "config", icon: "EDR", color: "bg-red-600" },
    { name: "HashiCorp Vault", status: "config", icon: "KEY", color: "bg-gray-700" },
    { name: "Nessus Scanner", status: "off", icon: "SCN", color: "bg-teal-600" },
  ],
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

// ── Types de taches par bot (4 catégories × 4-5 taches) ──
const BOT_TASKS_TYPES: Record<string, { categorie: string; emoji: string; couleur: string; bgColor: string; borderColor: string; taches: string[] }[]> = {
  CEOB: [
    { categorie: "Decision stratégique", emoji: "🎯", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", taches: ["Arbitrage C-Level", "Plan stratégique 90 jours", "Allocation des ressources", "Validation priorités trimestrielles", "Wargaming concurrentiel"] },
    { categorie: "Communication dirigeant", emoji: "📣", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", taches: ["Pitch investisseurs", "Message all-hands", "Narratif partenariats", "Communication crise", "Présentation conseil"] },
    { categorie: "Coaching & alignement", emoji: "🤝", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", taches: ["Session CREDO C-suite", "Résolution conflits équipe", "Alignement vision-exécution", "Coaching décision complexe"] },
    { categorie: "Analyse & veille", emoji: "🔍", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", taches: ["Scan opportunités M&A", "Analyse risques stratégiques", "Benchmark industrie", "Due diligence rapide", "Rapport de situation"] },
  ],
  CTOB: [
    { categorie: "Architecture & code", emoji: "🏗️", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", taches: ["Design architecture système", "Code review complet", "Refactoring critique", "Migration cloud", "API design"] },
    { categorie: "Sécurité & DevOps", emoji: "🔒", couleur: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200", taches: ["Audit vulnérabilités", "Pipeline CI/CD", "Gestion incidents prod", "Backup stratégie", "Monitoring & alertes"] },
    { categorie: "Innovation technique", emoji: "🚀", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", taches: ["POC nouvelles techno", "Évaluation stack", "R&D solution IA", "Prototype rapide", "Benchmark performance"] },
    { categorie: "Data & intégrations", emoji: "📊", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", taches: ["Pipeline ETL", "Intégration API tierce", "Data governance", "BI dashboard", "Qualité données"] },
  ],
  CFOB: [
    { categorie: "Analyse financière", emoji: "📈", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", taches: ["États financiers mensuels", "Analyse de rentabilité", "Calcul coût de revient", "Valorisation entreprise", "Ratios financiers"] },
    { categorie: "Budget & prévisions", emoji: "🎯", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", taches: ["Budget annuel", "Cashflow prévisionnel", "Scénarios financiers", "Budget par département", "Prévisions 18 mois"] },
    { categorie: "Fiscalité & conformité", emoji: "📋", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", taches: ["RS&DE pré-remplissage", "Optimisation fiscale", "Conformité CRA/ARQ", "Subventions disponibles", "Audit préparation"] },
    { categorie: "Financement & risque", emoji: "🏦", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", taches: ["Dossier crédit bancaire", "Analyse risque crédit", "Capital allocation", "Pricing stratégique", "Gestion trésorerie"] },
  ],
  CMOB: [
    { categorie: "Contenu & copywriting", emoji: "✍️", couleur: "text-pink-700", bgColor: "bg-pink-50", borderColor: "border-pink-200", taches: ["Article de blogue SEO", "Textes landing pages", "Email marketing séquence", "Script vidéo/podcast", "Pitch deck narratif"] },
    { categorie: "Campagnes & acquisition", emoji: "📣", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", taches: ["Plan campagne Google Ads", "Stratégie Meta/LinkedIn", "Calendrier éditorial", "A/B test créatifs", "Budget média"] },
    { categorie: "Branding & positionnement", emoji: "🎨", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", taches: ["Plateforme de marque", "Message clé par persona", "Analyse concurrentielle marque", "Refonte positionnement", "Guide de voix"] },
    { categorie: "Analytics & conversion", emoji: "📊", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", taches: ["Rapport performance campagne", "Funnel conversion", "Personas clients", "Customer journey map", "NPS & satisfaction"] },
  ],
  CSOB: [
    { categorie: "Planification stratégique", emoji: "♟️", couleur: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200", taches: ["Plan stratégique 3 ans", "OKR entreprise", "Carte stratégique", "Diagnostic SWOT", "Définition axes prioritaires"] },
    { categorie: "Veille & intelligence marché", emoji: "🔍", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", taches: ["Analyse sectorielle", "Profil concurrents", "Tendances marché", "Rapport veille mensuel", "Opportunités émergentes"] },
    { categorie: "Wargaming & scénarios", emoji: "⚔️", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", taches: ["Simulation scénarios", "Analyse forces Porter", "Plan contingence", "Stress test stratégique", "Anticiper réactions concurrents"] },
    { categorie: "Croissance & partenariats", emoji: "🤝", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", taches: ["Identification partenaires", "Structuration alliances", "Évaluation marchés cibles", "Stratégie entrée marché", "Deal structuring"] },
  ],
  COOB: [
    { categorie: "Processus & efficacité", emoji: "⚙️", couleur: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", taches: ["Cartographie processus", "Amélioration continue", "Procédures opérationnelles", "Gestion des exceptions", "Standardisation workflows"] },
    { categorie: "KPIs & performance", emoji: "📊", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", taches: ["Tableau de bord opérationnel", "Suivi KPIs hebdo", "Analyse écarts", "Rapport performance mensuel", "Benchmarks industrie"] },
    { categorie: "Qualité & conformité", emoji: "✅", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", taches: ["Audit qualité interne", "Non-conformités", "Plan correctif", "Préparation certification", "Gestion fournisseurs qualité"] },
    { categorie: "Logistique & supply chain", emoji: "🚚", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", taches: ["Optimisation stocks", "Gestion fournisseurs", "Planification capacité", "Gestion délais livraison", "Réduction gaspillage"] },
  ],
  CPOB: [
    { categorie: "Production & planification", emoji: "🏭", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", taches: ["Plan de production", "Ordonnancement ateliers", "Calcul capacité machines", "Gestion goulets", "Équilibre lignes"] },
    { categorie: "Lean & amélioration", emoji: "🔧", couleur: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", taches: ["Kaizen chantier", "Analyse gaspillage 7 muda", "5S implantation", "VSM value stream map", "Réduction temps cycle"] },
    { categorie: "Maintenance & fiabilité", emoji: "⚙️", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", taches: ["Plan maintenance préventive", "Analyse pannes AMDEC", "TPM déploiement", "Indicateurs OEE", "Gestion pièces de rechange"] },
    { categorie: "Sécurité industrielle", emoji: "🦺", couleur: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200", taches: ["Analyse risques SST", "Protocoles sécurité machine", "Enquête accident", "Formation opérateurs", "Conformité CNESST"] },
  ],
  CHROB: [
    { categorie: "Recrutement & sélection", emoji: "🎯", couleur: "text-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-200", taches: ["Affichage de poste optimisé", "Grille d'entrevue structurée", "Évaluation candidats", "Vérification références", "Offre d'emploi négociation"] },
    { categorie: "Formation & développement", emoji: "📚", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", taches: ["Plan de formation annuel", "Matrice compétences", "Onboarding structuré", "Plan développement individuel", "Coaching gestionnaires"] },
    { categorie: "Culture & engagement", emoji: "💜", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", taches: ["Sondage engagement", "Programme reconnaissance", "Gestion conflits", "Ateliers cohésion d'équipe", "Communication interne"] },
    { categorie: "Conformité RH & droit", emoji: "⚖️", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", taches: ["Politique RH conforme", "Gestion disciplinaire", "Dossier employé", "Conformité CNESST", "Paie & avantages sociaux"] },
  ],
  CINOB: [
    { categorie: "R&D & innovation", emoji: "🔬", couleur: "text-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-200", taches: ["Projet R&D structuré", "Rapport RS&DE", "Prototype validation", "Roadmap innovation", "Transfert technologique"] },
    { categorie: "Veille technologique", emoji: "📡", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", taches: ["Scan technologies émergentes", "Benchmark Industrie 4.0", "Évaluation fournisseurs techno", "Rapport tendances", "Opportunités IA/automation"] },
    { categorie: "Industrie 4.0 & digital", emoji: "🤖", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", taches: ["Jumeau numérique plan", "IoT déploiement", "Automatisation pilote", "MES intégration", "Diagnostic maturité 4.0"] },
    { categorie: "Propriété intellectuelle", emoji: "📜", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", taches: ["Inventaire PI", "Stratégie brevets", "Contrats NDA/IP", "Licensing opportunités", "Veille brevets concurrents"] },
  ],
  CROB: [
    { categorie: "Développement d'affaires", emoji: "🎯", couleur: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", taches: ["Prospection cibles ICP", "Séquence outreach", "Qualification leads", "Analyse pipeline", "Prévisions revenus"] },
    { categorie: "Présentation & closing", emoji: "🏆", couleur: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", taches: ["Deck de vente personnalisé", "Démo produit script", "Gestion objections", "Structuration deal", "Lettre de confirmation"] },
    { categorie: "CRM & pipeline", emoji: "📊", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", taches: ["Hygiène CRM", "Scoring opportunités", "Rapport pipeline hebdo", "Analyse win/loss", "Cycle de vente optimisé"] },
    { categorie: "Fidélisation & expansion", emoji: "💼", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", taches: ["Stratégie upsell/cross-sell", "Programme fidélité", "QBR client", "NPS & rétention", "Expansion comptes"] },
  ],
  CLOB: [
    { categorie: "Contrats & rédaction", emoji: "📄", couleur: "text-indigo-700", bgColor: "bg-indigo-50", borderColor: "border-indigo-200", taches: ["Contrat commercial standard", "NDA personnalisé", "CGV / conditions service", "Contrat emploi", "Lettre d'intention"] },
    { categorie: "Conformité réglementaire", emoji: "⚖️", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", taches: ["Conformité Loi 25 / RGPD", "Vérification réglementaire sectorielle", "Politique de confidentialité", "Programme conformité", "Audit légal interne"] },
    { categorie: "Propriété intellectuelle", emoji: "🔐", couleur: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", taches: ["Stratégie marques de commerce", "Dépôt brevet préliminaire", "Contrats licensing", "Protection secrets commerciaux", "Clauses non-concurrence"] },
    { categorie: "Litiges & risques", emoji: "🛡️", couleur: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200", taches: ["Analyse risque légal", "Gestion pre-litige", "Médiation structurée", "Gouvernance corporative", "Structure juridique optimale"] },
  ],
  CISOB: [
    { categorie: "Audit & vulnérabilités", emoji: "🔍", couleur: "text-slate-700", bgColor: "bg-slate-50", borderColor: "border-slate-200", taches: ["Scan vulnérabilités réseau", "Pentest applicatif", "Revue code sécurité", "Audit accès & permissions", "Test phishing interne"] },
    { categorie: "Conformité & gouvernance", emoji: "📋", couleur: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", taches: ["Conformité NIST CSF", "LPRPDE / Loi 25 cyber", "Politique sécurité SI", "Registre des risques", "Plan directeur sécurité"] },
    { categorie: "Réponse aux incidents", emoji: "🚨", couleur: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200", taches: ["Plan réponse incidents", "Playbook brèche données", "Forensic rapide", "Communication incident", "Post-mortem sécurité"] },
    { categorie: "Protection & continuité", emoji: "🛡️", couleur: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", taches: ["Stratégie backup / DRP", "Chiffrement données sensibles", "Gestion identités IAM", "OT/SCADA sécurité", "Sensibilisation employés"] },
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
          {result.seeded.slice(0, 5).map((s, i) => (
            <div key={i} className="text-[10px] text-emerald-700">• {s.titre}</div>
          ))}
          {result.seeded.length > 5 && (
            <div className="text-[9px] text-emerald-500">+ {result.seeded.length - 5} autres...</div>
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
  const apis = BOT_APIS[botCode] || BOT_APIS.CEOB;
  const active = apis.filter(a => a.status === "active");
  const rest = apis.filter(a => a.status !== "active");
  const renderApi = (a: typeof apis[0]) => (
    <div key={a.name} className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all",
      a.status === "active" ? "bg-white border-gray-200 shadow-sm" :
      a.status === "config" ? "bg-amber-50/50 border-amber-200" : "bg-gray-50 border-gray-100 opacity-60"
    )}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-[9px] font-bold shrink-0", a.status === "off" ? "bg-gray-300" : a.color)}>{a.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-gray-800 truncate">{a.name}</div>
        <div className={cn("text-[9px] font-medium", a.status === "active" ? "text-emerald-600" : a.status === "config" ? "text-amber-600" : "text-gray-400")}>{a.status === "active" ? "Connecté" : a.status === "config" ? "À configurer" : "Désactivé"}</div>
      </div>
      <button className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium border cursor-pointer transition-all shrink-0",
        a.status === "active" ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" :
        a.status === "config" ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" :
        "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
      )}>
        {a.status === "active" ? "Déconnecter" : a.status === "config" ? "Configurer" : "Activer"}
      </button>
    </div>
  );
  return (
    <div className="space-y-3">
      <Card className="p-0 gap-0 overflow-hidden rounded-xl border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Activity className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900 flex-1">Connexions Actives</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{active.length} live</span>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">{active.map(renderApi)}</div>
      </Card>
      {rest.length > 0 && (
        <Card className="p-0 gap-0 overflow-hidden rounded-xl border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Cpu className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900 flex-1">À configurer / Disponibles</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{rest.length}</span>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">{rest.map(renderApi)}</div>
        </Card>
      )}
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

// ── Section: Types de taches par bot ──
function BotTasksSection({ botCode }: { botCode: string }) {
  const cats = BOT_TASKS_TYPES[botCode] || BOT_TASKS_TYPES.CEOB;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Layers className="h-4 w-4 text-gray-500" />
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Types de tâches executables</span>
        <span className="ml-auto text-[10px] text-gray-400">{cats.reduce((n, c) => n + c.taches.length, 0)} tâches</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {cats.map(cat => (
          <div key={cat.categorie} className={cn("rounded-xl border p-3 space-y-2", cat.bgColor, cat.borderColor)}>
            <div className="flex items-center gap-1.5">
              <span className="text-base">{cat.emoji}</span>
              <span className={cn("text-[11px] font-bold", cat.couleur)}>{cat.categorie}</span>
              <span className={cn("ml-auto text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white/60", cat.couleur)}>{cat.taches.length}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {cat.taches.map(t => (
                <span key={t} className={cn("text-[9px] px-2 py-0.5 rounded-full bg-white/70 font-medium border border-white/80", cat.couleur)}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
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

        {/* ── TYPES DE TACHES ── */}
        <div id="sec-taches">
          <BotTasksSection botCode={botCode} />
        </div>

        {/* ── DÉPLOYER CHANTIERS RECOMMANDÉS (Phase 4) ── */}
        <div id="sec-deploy-chantiers">
          <DeployBlueprintButton botCode={botCode} />
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
