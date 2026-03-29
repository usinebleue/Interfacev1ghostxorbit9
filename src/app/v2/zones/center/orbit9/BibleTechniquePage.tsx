/**
 * BibleTechniquePage.tsx — Bible Technique BTML
 * Reference technique complete de la plateforme CarlOS / GhostX
 * 8 onglets : Bots & Skills | API & Endpoints | Backend | Base de Donnees | Infrastructure | Integrations | Securite | Cerveau BTML
 * 12 Bots officiels — BTML = Brain Team Modeling Language (terme officiel)
 */

import { useState } from "react";
import {
  Server, Users, Globe, Database, Shield, Cpu, Link2, Atom,
  ArrowRight, CheckCircle2, Clock, AlertTriangle,
  Terminal, HardDrive, Lock, Wifi, Layers,
  Mic, Video, Phone, Brain, Cloud, FileCode,
  Zap, Activity, Eye, Key, MonitorSpeaker, Radio,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ═══════════════════════════════════════════════════════════════
// DATA — 12 Official Bots
// ═══════════════════════════════════════════════════════════════

const BOTS_DATA = [
  {
    code: "CEOB", name: "CarlOS", role: "CEO", color: "blue",
    trisociation: "Bezos + Munger + Churchill",
    soul: "/home/deploy/.openclaw/workspace-ceo/SOUL.md",
    soulSize: "10,130 chars, 12 sections",
    skills: ["Diagnostic VITAA", "Triangle du Feu", "CREDO orchestration", "Team assembly", "Decision scoring", "8+1 Modes de reflexion"],
  },
  {
    code: "CTOB", name: "Tim", role: "CTO", color: "violet",
    trisociation: "Musk + Curie + Vinci",
    soul: "/home/deploy/.openclaw/workspace-cto/SOUL.md",
    soulSize: "~8,000 chars",
    skills: ["Architecture tech", "Code review", "Innovation pipeline", "Stack evaluation", "Technical debt audit"],
  },
  {
    code: "CFOB", name: "Frank", role: "CFO", color: "emerald",
    trisociation: "Buffett + Munger + Franklin",
    soul: "/home/deploy/.openclaw/workspace-cfo/SOUL.md",
    soulSize: "~7,500 chars",
    skills: ["Analyse financiere", "Budget planning", "Cash flow forecast", "ROI scoring", "Risk assessment"],
  },
  {
    code: "CMOB", name: "Mathilde", role: "CMO", color: "pink",
    trisociation: "Disney + Jobs/Blakely + Oprah",
    soul: "/home/deploy/.openclaw/workspace-cmo/SOUL.md",
    soulSize: "~7,200 chars",
    skills: ["Marketing strategy", "Brand positioning", "Content pipeline", "Customer journey", "Growth hacking"],
  },
  {
    code: "CSOB", name: "Simone", role: "CSO", color: "red",
    trisociation: "Sun Tzu + Thiel + Chanel",
    soul: "/home/deploy/.openclaw/workspace-cso/SOUL.md",
    soulSize: "~7,800 chars",
    skills: ["Sales strategy", "Pipeline management", "Competitive analysis", "Deal closing", "Territory planning"],
  },
  {
    code: "COOB", name: "Olivier", role: "COO", color: "orange",
    trisociation: "Marc Aurele + Deming + Nightingale",
    soul: "/home/deploy/.openclaw/workspace-coo/SOUL.md",
    soulSize: "~7,000 chars",
    skills: ["Operations management", "Process optimization", "KPI tracking", "Supply chain", "Quality control"],
  },
  {
    code: "CPOB", name: "Paco", role: "CPO", color: "slate",
    trisociation: "Ford + Ohno + Goldratt",
    soul: "/home/deploy/.openclaw/workspace-factory/SOUL.md",
    soulSize: "~6,500 chars",
    skills: ["Automatisation usine", "Lean manufacturing", "Production planning", "Equipment ROI", "Capacity analysis"],
  },
  {
    code: "CHROB", name: "Helene", role: "CHRO", color: "teal",
    trisociation: "Sandberg + Branson + Laszlo Bock",
    soul: "SOUL dynamique",
    soulSize: "~5,500 chars",
    skills: ["Recrutement", "Culture organisationnelle", "Formation", "Retention", "Conformite RH"],
  },
  {
    code: "CINOB", name: "Ines", role: "CINO", color: "rose",
    trisociation: "Curie + Edison + Dyson",
    soul: "SOUL dynamique",
    soulSize: "~5,500 chars",
    skills: ["Innovation pipeline", "R&D management", "Patent strategy", "Tech scouting", "Prototype validation"],
  },
  {
    code: "CROB", name: "Rich", role: "CRO", color: "amber",
    trisociation: "Bezos + Salesforce + HubSpot",
    soul: "SOUL dynamique",
    soulSize: "~5,500 chars",
    skills: ["Revenue operations", "Funnel optimization", "Cross-sell/Upsell", "Pricing strategy", "Churn prevention"],
  },
  {
    code: "CLOB", name: "Loulou", role: "CLO", color: "indigo",
    trisociation: "RGB + Compliance + Ethics",
    soul: "SOUL dynamique",
    soulSize: "~5,000 chars",
    skills: ["Conformite legale", "Contrats", "Propriete intellectuelle", "Risques juridiques", "Reglementation"],
  },
  {
    code: "CISOB", name: "Sebastien", role: "CISO", color: "zinc",
    trisociation: "NSA + Schneier + Zero Trust",
    soul: "SOUL dynamique",
    soulSize: "~5,000 chars",
    skills: ["Cybersecurite", "Audit securite", "Incident response", "Data protection", "Compliance RGPD"],
  },
];

// ═══════════════════════════════════════════════════════════════
// DATA — API Endpoints
// ═══════════════════════════════════════════════════════════════

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  status: "live" | "en-cours" | "a-faire";
}

interface EndpointGroup {
  category: string;
  icon: React.ElementType;
  endpoints: Endpoint[];
}

const API_ENDPOINTS: EndpointGroup[] = [
  // ── 1. Health & Status (2) ──
  { category: "Health & Status", icon: Activity, endpoints: [
    { method: "GET", path: "/api/v1/health", description: "System health (status + version + uptime)", status: "live" },
    { method: "GET", path: "/api/v1/status", description: "Status enrichi — DB, services, API rates (C.6)", status: "live" },
  ]},
  // ── 2. Auth & Sessions (7) ──
  { category: "Auth & Sessions", icon: Key, endpoints: [
    { method: "POST", path: "/api/v1/auth/login", description: "JWT auth — SHA256 credentials", status: "live" },
    { method: "POST", path: "/api/v1/auth/refresh", description: "Refresh access token depuis refresh token", status: "live" },
    { method: "GET", path: "/api/v1/auth/me", description: "Profil user connecte + memberships", status: "live" },
    { method: "GET", path: "/api/v1/auth/sessions", description: "Sessions JWT actives du user", status: "live" },
    { method: "DELETE", path: "/api/v1/auth/sessions/{id}", description: "Revoquer une session JWT", status: "live" },
    { method: "POST", path: "/api/v1/auth/logout", description: "Invalider le token courant", status: "live" },
    { method: "POST", path: "/api/v1/auth/switch-tenant", description: "Switcher de tenant", status: "live" },
  ]},
  // ── 3. Onboarding (2) ──
  { category: "Onboarding", icon: Users, endpoints: [
    { method: "POST", path: "/api/v1/onboarding", description: "Sauvegarder reponses + avancer step", status: "live" },
    { method: "GET", path: "/api/v1/onboarding/{user_id}", description: "Statut d'onboarding", status: "live" },
  ]},
  // ── 4. Chat (4) ──
  { category: "Chat", icon: Terminal, endpoints: [
    { method: "POST", path: "/api/v1/chat", description: "Envoyer message au pipeline CarlOS", status: "live" },
    { method: "POST", path: "/api/v1/chat/stream", description: "Chat streaming SSE — tokens progressifs", status: "live" },
    { method: "POST", path: "/api/v1/chat/multi", description: "Consulter 2-3 bots en parallele", status: "live" },
    { method: "POST", path: "/api/v1/chat/vision", description: "Vision CarlOS — Gemini Vision 2 etapes", status: "live" },
  ]},
  // ── 5. Voice (3) ──
  { category: "Voice", icon: Mic, endpoints: [
    { method: "POST", path: "/api/v1/voice/token", description: "Token LiveKit pour room vocale", status: "live" },
    { method: "POST", path: "/api/v1/voice/event", description: "Webhook transcript vocal (agent)", status: "live" },
    { method: "GET", path: "/api/v1/voice/events/{room}", description: "Poll transcripts (cursor-based)", status: "live" },
  ]},
  // ── 6. Dev Channel & Vision (8) ��─
  { category: "Dev Channel & Vision", icon: Eye, endpoints: [
    { method: "POST", path: "/api/v1/dev/message", description: "Carl (lunettes) → Claude Code", status: "live" },
    { method: "GET", path: "/api/v1/dev/messages", description: "Claude Code poll messages Carl", status: "live" },
    { method: "POST", path: "/api/v1/dev/reply", description: "Claude Code → Carl (lunettes)", status: "live" },
    { method: "GET", path: "/api/v1/dev/replies", description: "VisionClaw poll reponses Claude", status: "live" },
    { method: "GET", path: "/api/v1/dev/live", description: "Vision-Live etat temps reel", status: "live" },
    { method: "POST", path: "/api/v1/dev/clear", description: "Clear messages et replies", status: "live" },
    { method: "POST", path: "/api/v1/glasses/push", description: "Push event lunettes Ray-Ban", status: "live" },
    { method: "GET", path: "/api/v1/glasses/events/{user_id}", description: "Poll push events lunettes", status: "live" },
  ]},
  // ── 7. Telephonie & SMS (8) ──
  { category: "Telephonie & SMS", icon: Phone, endpoints: [
    { method: "POST", path: "/api/v1/sms/webhook", description: "Webhook SMS entrant", status: "live" },
    { method: "POST", path: "/api/v1/sms/send", description: "Envoyer SMS via CarlOS", status: "live" },
    { method: "GET", path: "/api/v1/phone/twiml", description: "TwiML appel entrant Twilio", status: "live" },
    { method: "POST", path: "/api/v1/phone/incoming", description: "Webhook appel entrant", status: "live" },
    { method: "POST", path: "/api/v1/phone/verify-pin", description: "Verification NIP N2", status: "live" },
    { method: "GET", path: "/api/v1/phone/active-room", description: "Room phone active recente", status: "live" },
    { method: "POST", path: "/api/v1/phone/outbound", description: "Appel sortant vers numero externe", status: "live" },
    { method: "POST", path: "/api/v1/phone/telnyx-incoming", description: "Webhook Telnyx Call Control", status: "live" },
  ]},
  // ── 8. Bureau & Documents (13) ──
  { category: "Bureau & Documents", icon: FileCode, endpoints: [
    { method: "GET", path: "/api/v1/bureau", description: "Items bureau (projets/docs/outils)", status: "live" },
    { method: "POST", path: "/api/v1/bureau", description: "Creer un item bureau", status: "live" },
    { method: "POST", path: "/api/v1/bureau/{id}", description: "Modifier un item", status: "live" },
    { method: "POST", path: "/api/v1/bureau/{id}/delete", description: "Supprimer un item", status: "live" },
    { method: "POST", path: "/api/v1/bureau/upload", description: "Upload fichier (multipart)", status: "live" },
    { method: "GET", path: "/api/v1/bureau/download/{f}", description: "Telecharger fichier", status: "live" },
    { method: "GET", path: "/api/v1/templates", description: "Templates Lego disponibles", status: "live" },
    { method: "GET", path: "/api/v1/templates/{alias}/preview", description: "Preview template + placeholders", status: "live" },
    { method: "POST", path: "/api/v1/documents/generate", description: "Generer PDF depuis template", status: "live" },
    { method: "GET", path: "/api/v1/documents/download/{f}", description: "Telecharger document genere", status: "live" },
    { method: "POST", path: "/api/v1/cahier", description: "Lancer generation Cahier de Projets", status: "live" },
    { method: "GET", path: "/api/v1/cahier/{job_id}", description: "Statut job generation cahier", status: "live" },
    { method: "GET", path: "/api/v1/cahier/{job_id}/download", description: "Telecharger PDF cahier", status: "live" },
  ]},
  // ── 9. COMMAND Engine (7) ──
  { category: "COMMAND Engine", icon: Zap, endpoints: [
    { method: "POST", path: "/api/v1/command/detect", description: "Detecter COMMAND vs CREDO", status: "live" },
    { method: "POST", path: "/api/v1/command/start", description: "Lancer mission COMMAND async", status: "live" },
    { method: "GET", path: "/api/v1/command/status/{id}", description: "Statut mission en cours", status: "live" },
    { method: "GET", path: "/api/v1/command/missions", description: "Missions COMMAND recentes", status: "live" },
    { method: "POST", path: "/api/v1/command/compile/daily", description: "Compiler briefings quotidiens", status: "live" },
    { method: "POST", path: "/api/v1/command/compile/board-meeting", description: "Compiler briefing Board Meeting", status: "live" },
    { method: "GET", path: "/api/v1/command/briefings", description: "Briefings compiles (filtrable)", status: "live" },
  ]},
  // ── 10. Tensions VITAA (6) ──
  { category: "Tensions VITAA", icon: Activity, endpoints: [
    { method: "GET", path: "/api/v1/tensions", description: "Lister tensions (filtrable: status)", status: "live" },
    { method: "POST", path: "/api/v1/tensions", description: "Creer tension manuellement", status: "live" },
    { method: "POST", path: "/api/v1/tensions/classify", description: "Auto-classifier message en tension", status: "live" },
    { method: "GET", path: "/api/v1/tensions/{id}", description: "Detail d'une tension", status: "live" },
    { method: "POST", path: "/api/v1/tensions/{id}/resolve", description: "Resoudre une tension", status: "live" },
    { method: "POST", path: "/api/v1/tensions/{id}/launch-mission", description: "Lancer mission depuis tension", status: "live" },
  ]},
  // ── 11. Decision Log (4) ──
  { category: "Decision Log", icon: Activity, endpoints: [
    { method: "GET", path: "/api/v1/decisions", description: "Decisions (filtrable: bot, status)", status: "live" },
    { method: "GET", path: "/api/v1/decisions/{id}", description: "Detail d'une decision", status: "live" },
    { method: "POST", path: "/api/v1/decisions", description: "Enregistrer une decision", status: "live" },
    { method: "POST", path: "/api/v1/decisions/{id}/reverse", description: "Reverser une decision", status: "live" },
  ]},
  // ── 12. Diagnostics (7) ──
  { category: "Diagnostics", icon: Eye, endpoints: [
    { method: "GET", path: "/api/v1/diagnostic", description: "Diagnostic vivant utilisateur", status: "live" },
    { method: "POST", path: "/api/v1/diagnostic", description: "Creer/MAJ diagnostic vivant", status: "live" },
    { method: "POST", path: "/api/v1/diagnostic-ia", description: "Creer diagnostic IA (12 depts)", status: "live" },
    { method: "GET", path: "/api/v1/diagnostic-ia", description: "Lister diagnostics IA", status: "live" },
    { method: "GET", path: "/api/v1/diagnostic-ia/{id}", description: "Detail diagnostic IA", status: "live" },
    { method: "PUT", path: "/api/v1/diagnostic-ia/{id}", description: "MAJ diagnostic IA", status: "live" },
    { method: "DELETE", path: "/api/v1/diagnostic-ia/{id}", description: "Supprimer diagnostic IA", status: "live" },
  ]},
  // ── 13. Catalogues (7) ──
  { category: "Catalogues", icon: Layers, endpoints: [
    { method: "GET", path: "/api/v1/diagnostics/catalogue/universels", description: "Diagnostics universels", status: "live" },
    { method: "GET", path: "/api/v1/diagnostics/catalogue/sectoriels", description: "Diagnostics sectoriels", status: "live" },
    { method: "GET", path: "/api/v1/diagnostics/catalogue/gaps", description: "Matrice gaps→fournisseurs", status: "live" },
    { method: "GET", path: "/api/v1/diagnostics/catalogue/enrichis", description: "43 diagnostics enrichis + data_points", status: "live" },
    { method: "GET", path: "/api/v1/missions/catalogue", description: "Types missions recurrentes", status: "live" },
    { method: "GET", path: "/api/v1/templates-projets/catalogue", description: "Templates projets reutilisables", status: "live" },
    { method: "GET", path: "/api/v1/templates-documentaires/catalogue", description: "132 templates documentaires", status: "live" },
  ]},
  // ��─ 14. Entreprise & Canvas (10) ──
  { category: "Entreprise & Canvas", icon: Globe, endpoints: [
    { method: "GET", path: "/api/v1/entreprise-profil", description: "Profil entreprise du tenant", status: "live" },
    { method: "PUT", path: "/api/v1/entreprise-profil", description: "Creer/MAJ profil entreprise", status: "live" },
    { method: "POST", path: "/api/v1/entreprise-profil/enrich", description: "Enrichir via recherche web/Gemini", status: "live" },
    { method: "POST", path: "/api/v1/entreprise-profil/extract-document", description: "Extraire depuis document uploade", status: "live" },
    { method: "POST", path: "/api/v1/canvas", description: "Creer canvas (SWOT, BMC, Lean)", status: "live" },
    { method: "GET", path: "/api/v1/canvas", description: "Lister canvas (filtrable: type)", status: "live" },
    { method: "GET", path: "/api/v1/canvas/{id}", description: "Obtenir canvas par id", status: "live" },
    { method: "PUT", path: "/api/v1/canvas/{id}", description: "MAJ canvas", status: "live" },
    { method: "DELETE", path: "/api/v1/canvas/{id}", description: "Supprimer canvas", status: "live" },
    { method: "GET", path: "/api/v1/canvas/by-type/{type}", description: "Get/create canvas par type (upsert)", status: "live" },
  ]},
  // ── 15. Chantiers (6) ──
  { category: "Chantiers", icon: Layers, endpoints: [
    { method: "GET", path: "/api/v1/chantiers", description: "Lister (filtrable: status, chaleur, categorie)", status: "live" },
    { method: "GET", path: "/api/v1/chantiers/{id}", description: "Detail + missions liees", status: "live" },
    { method: "POST", path: "/api/v1/chantiers", description: "Creer un chantier", status: "live" },
    { method: "PUT", path: "/api/v1/chantiers/{id}", description: "MAJ chantier", status: "live" },
    { method: "DELETE", path: "/api/v1/chantiers/{id}", description: "Archiver (soft delete)", status: "live" },
    { method: "POST", path: "/api/v1/chantiers/{id}/assign-missions", description: "Assigner missions orphelines", status: "live" },
  ]},
  // ── 16. Projets (5) ──
  { category: "Projets", icon: Layers, endpoints: [
    { method: "GET", path: "/api/v1/projets", description: "Lister (filtrable: chantier_id, status)", status: "live" },
    { method: "GET", path: "/api/v1/projets/{id}", description: "Detail + missions liees", status: "live" },
    { method: "POST", path: "/api/v1/projets", description: "Creer un projet", status: "live" },
    { method: "PUT", path: "/api/v1/projets/{id}", description: "MAJ projet", status: "live" },
    { method: "DELETE", path: "/api/v1/projets/{id}", description: "Archiver (soft delete)", status: "live" },
  ]},
  // ── 17. Missions User (7) ──
  { category: "Missions User", icon: Layers, endpoints: [
    { method: "GET", path: "/api/v1/missions-user", description: "Lister (filtrable: chantier, projet, status)", status: "live" },
    { method: "GET", path: "/api/v1/missions-user/{id}", description: "Detail mission", status: "live" },
    { method: "POST", path: "/api/v1/missions-user", description: "Creer mission", status: "live" },
    { method: "PUT", path: "/api/v1/missions-user/{id}", description: "MAJ mission", status: "live" },
    { method: "DELETE", path: "/api/v1/missions-user/{id}", description: "Archiver (soft delete)", status: "live" },
    { method: "POST", path: "/api/v1/missions-user/{id}/complete", description: "Marquer completee", status: "live" },
    { method: "POST", path: "/api/v1/missions-user/{id}/thread", description: "Rattacher un thread/discussion", status: "live" },
  ]},
  // ── 18. Taches User (6) ──
  { category: "Taches User", icon: Layers, endpoints: [
    { method: "GET", path: "/api/v1/taches-user", description: "Lister (filtrable: mission, projet, chantier)", status: "live" },
    { method: "GET", path: "/api/v1/taches-user/{id}", description: "Detail tache", status: "live" },
    { method: "POST", path: "/api/v1/taches-user", description: "Creer tache", status: "live" },
    { method: "PUT", path: "/api/v1/taches-user/{id}", description: "MAJ tache", status: "live" },
    { method: "DELETE", path: "/api/v1/taches-user/{id}", description: "Archiver (soft delete)", status: "live" },
    { method: "POST", path: "/api/v1/taches-user/{id}/complete", description: "Marquer complete", status: "live" },
  ]},
  // ─��� 19. Taches Plane.so (5) ──
  { category: "Taches Plane.so", icon: Layers, endpoints: [
    { method: "GET", path: "/api/v1/taches", description: "Taches ouvertes Plane.so", status: "live" },
    { method: "GET", path: "/api/v1/taches/{id}", description: "Detail + commentaires", status: "live" },
    { method: "POST", path: "/api/v1/taches", description: "Creer tache Plane.so", status: "live" },
    { method: "POST", path: "/api/v1/taches/{id}/complete", description: "Marquer completee", status: "live" },
    { method: "POST", path: "/api/v1/taches/{id}/comment", description: "Ajouter commentaire", status: "live" },
  ]},
  // ── 20. Idees (3) ──
  { category: "Idees", icon: Zap, endpoints: [
    { method: "GET", path: "/api/v1/idees", description: "Lister (filtrable: chantier, projet, mission)", status: "live" },
    { method: "POST", path: "/api/v1/idees", description: "Creer une idee", status: "live" },
    { method: "DELETE", path: "/api/v1/idees/{id}", description: "Supprimer une idee", status: "live" },
  ]},
  // ── 21. Discussions (7) ──
  { category: "Discussions", icon: Terminal, endpoints: [
    { method: "GET", path: "/api/v1/discussions", description: "Lister (filtrable: status, bot)", status: "live" },
    { method: "GET", path: "/api/v1/discussions/stale", description: "Discussions inactives depuis N heures", status: "live" },
    { method: "GET", path: "/api/v1/discussions/{id}", description: "Detail discussion", status: "live" },
    { method: "POST", path: "/api/v1/discussions", description: "Creer discussion", status: "live" },
    { method: "PUT", path: "/api/v1/discussions/{id}", description: "MAJ discussion", status: "live" },
    { method: "POST", path: "/api/v1/discussions/{id}/promote", description: "Promouvoir en chantier/mission", status: "live" },
    { method: "POST", path: "/api/v1/discussions/{id}/archive", description: "Archiver", status: "live" },
  ]},
  // ── 22. Calendar (6) ──
  { category: "Calendar", icon: Clock, endpoints: [
    { method: "GET", path: "/api/v1/calendar/today", description: "Events du jour", status: "live" },
    { method: "GET", path: "/api/v1/calendar/range", description: "Events entre start et end", status: "live" },
    { method: "GET", path: "/api/v1/calendar/free", description: "Creneaux libres", status: "live" },
    { method: "GET", path: "/api/v1/calendar/slots", description: "Creneaux CarlOS pour une date", status: "live" },
    { method: "POST", path: "/api/v1/calendar/create", description: "Creer evenement", status: "live" },
    { method: "POST", path: "/api/v1/calendar/event", description: "Creer event + invitations", status: "live" },
  ]},
  // ── 23. Orbit9 (19) ──
  { category: "Orbit9 Matching", icon: Globe, endpoints: [
    { method: "GET", path: "/api/v1/orbit9/members", description: "Membres (filtrable: status, secteur)", status: "live" },
    { method: "POST", path: "/api/v1/orbit9/members", description: "Creer membre", status: "live" },
    { method: "GET", path: "/api/v1/orbit9/members/{id}", description: "Detail membre", status: "live" },
    { method: "GET", path: "/api/v1/orbit9/cellules", description: "Cellules (filtrable: type)", status: "live" },
    { method: "POST", path: "/api/v1/orbit9/cellules", description: "Creer cellule", status: "live" },
    { method: "POST", path: "/api/v1/orbit9/cellules/{id}/join", description: "Ajouter membre (anti-cartel)", status: "live" },
    { method: "POST", path: "/api/v1/orbit9/match", description: "Scoring LLM Gemini Flash + keyword", status: "live" },
    { method: "GET", path: "/api/v1/orbit9/matches", description: "Lister matches (filtrable: status)", status: "live" },
    { method: "GET", path: "/api/v1/orbit9/matches/{id}", description: "Detail match", status: "live" },
    { method: "POST", path: "/api/v1/orbit9/matches/{id}/select", description: "Selectionner gagnant(s)", status: "live" },
    { method: "POST", path: "/api/v1/orbit9/matches/{id}/create-chantier", description: "Creer chantier reseau", status: "live" },
    { method: "POST", path: "/api/v1/orbit9/matches/{id}/jumelage-questions", description: "Generer questions jumelage LLM", status: "live" },
    { method: "POST", path: "/api/v1/orbit9/matches/{id}/score-detail", description: "Score detaille + explication", status: "live" },
    { method: "POST", path: "/api/v1/orbit9/scout/{id}", description: "Bot Scout — scan ecosysteme QC", status: "live" },
    { method: "POST", path: "/api/v1/orbit9/invite", description: "Inviter nouveau membre", status: "live" },
    { method: "GET", path: "/api/v1/orbit9/qualification/{id}", description: "Etape qualification", status: "live" },
    { method: "POST", path: "/api/v1/orbit9/qualification/{id}", description: "Avancer qualification", status: "live" },
    { method: "POST", path: "/api/v1/orbit9/trisociation/start", description: "Demarrer trisociation LiveKit", status: "live" },
    { method: "GET", path: "/api/v1/orbit9/pioneers/{vertical}", description: "Pioneers par vertical", status: "live" },
  ]},
  // ── 24. Flow Engine (9) ──
  { category: "Flow Engine", icon: Zap, endpoints: [
    { method: "POST", path: "/api/v1/flow/advance", description: "Avancer step section ACTION", status: "live" },
    { method: "GET", path: "/api/v1/flow/step/{section}", description: "Step courant", status: "live" },
    { method: "POST", path: "/api/v1/flow/reset/{section}", description: "Reset flow section", status: "live" },
    { method: "GET", path: "/api/v1/flow/config/{section}", description: "Config section (DATA/ACTION)", status: "live" },
    { method: "POST", path: "/api/v1/flow/branch", description: "Fork CREDO → branche mode autonome", status: "live" },
    { method: "POST", path: "/api/v1/flow/branch/advance", description: "Avancer branche de mode", status: "live" },
    { method: "GET", path: "/api/v1/flow/branch/status", description: "Etat branche active", status: "live" },
    { method: "POST", path: "/api/v1/flow/branch/complete", description: "Completer branche → CREDO", status: "live" },
    { method: "POST", path: "/api/v1/flow/branch/cancel", description: "Annuler branche → CREDO", status: "live" },
  ]},
  // ── 25. Meetings (13) ──
  { category: "Meetings", icon: Video, endpoints: [
    { method: "POST", path: "/api/v1/meetings", description: "Creer meeting + slug + room", status: "live" },
    { method: "GET", path: "/api/v1/meetings", description: "Lister meetings (filtrable: status)", status: "live" },
    { method: "GET", path: "/api/v1/meetings/{slug}", description: "Details meeting (public)", status: "live" },
    { method: "POST", path: "/api/v1/meetings/{slug}/join", description: "Guest rejoint → token LiveKit", status: "live" },
    { method: "POST", path: "/api/v1/meetings/{slug}/start", description: "Demarrer + Egress + multi-bot", status: "live" },
    { method: "POST", path: "/api/v1/meetings/{slug}/end", description: "Arreter + post-processing podcast", status: "live" },
    { method: "GET", path: "/api/v1/meetings/{slug}/transcript", description: "Transcription complete", status: "live" },
    { method: "GET", path: "/api/v1/meetings/{slug}/podcast", description: "Contenu podcast genere", status: "live" },
    { method: "POST", path: "/api/v1/meetings/{slug}/podcast/regenerate", description: "Re-generer podcast", status: "live" },
    { method: "GET", path: "/api/v1/meetings/{slug}/recording", description: "Audio enregistrement", status: "live" },
    { method: "POST", path: "/api/v1/meetings/{slug}/invite", description: "Envoyer invitations email", status: "live" },
    { method: "GET", path: "/api/v1/meetings/{slug}/invitations", description: "Lister invitations", status: "live" },
    { method: "POST", path: "/api/v1/meetings/invite/{token}/respond", description: "Accept/Decline invitation", status: "live" },
  ]},
  // ── 26. Multi-Tenant & Users (5) ──
  { category: "Tenants & Users", icon: Users, endpoints: [
    { method: "GET", path: "/api/v1/tenants", description: "Tenants du user", status: "live" },
    { method: "GET", path: "/api/v1/tenants/{id}", description: "Detail tenant", status: "live" },
    { method: "GET", path: "/api/v1/users", description: "Users du tenant (admin)", status: "live" },
    { method: "POST", path: "/api/v1/users/invite", description: "Inviter user (admin)", status: "live" },
    { method: "PUT", path: "/api/v1/users/{id}/membership", description: "MAJ membership (admin)", status: "live" },
  ]},
  // ���─ 27. Gouvernance (6) ──
  { category: "Gouvernance", icon: Shield, endpoints: [
    { method: "GET", path: "/api/v1/approvals", description: "Approbations (filtrable: status)", status: "live" },
    { method: "POST", path: "/api/v1/approvals/{id}/approve", description: "Approuver (manager)", status: "live" },
    { method: "POST", path: "/api/v1/approvals/{id}/reject", description: "Rejeter (manager)", status: "live" },
    { method: "GET", path: "/api/v1/governance/config", description: "Config gouvernance tenant + user", status: "live" },
    { method: "PUT", path: "/api/v1/governance/config", description: "MAJ config gouvernance", status: "live" },
    { method: "GET", path: "/api/v1/governance/autonomy/{bot}", description: "Niveau autonomie effectif bot", status: "live" },
  ]},
  // ���─ 28. Chat Rooms H2H (3 + WS) ──
  { category: "Chat Rooms H2H", icon: Terminal, endpoints: [
    { method: "POST", path: "/api/v1/chat-rooms", description: "Creer chat room", status: "live" },
    { method: "GET", path: "/api/v1/chat-rooms", description: "Chat rooms du user", status: "live" },
    { method: "GET", path: "/api/v1/chat-rooms/{id}/messages", description: "Messages room (limit=100)", status: "live" },
  ]},
  // ── 29. Cross-Org Portefeuille (5) ���─
  { category: "Cross-Org Portefeuille", icon: Globe, endpoints: [
    { method: "GET", path: "/api/v1/cross-org/portfolio", description: "Entreprises du portefeuille", status: "live" },
    { method: "POST", path: "/api/v1/cross-org/portfolio", description: "Ajouter entreprise", status: "live" },
    { method: "GET", path: "/api/v1/cross-org/{id}/summary", description: "Sommaire entreprise", status: "live" },
    { method: "GET", path: "/api/v1/cross-org/alerts", description: "Alertes temps reel", status: "live" },
    { method: "GET", path: "/api/v1/cross-org/synergies", description: "Synergies detectees", status: "live" },
  ]},
  // ── 30. Prospect Engine (16) ���─
  { category: "Prospect Engine", icon: Users, endpoints: [
    { method: "POST", path: "/api/v1/prospect/session", description: "Session prospect anonyme", status: "live" },
    { method: "POST", path: "/api/v1/prospect/session/{id}/message", description: "Message → reponse CarlOS", status: "live" },
    { method: "PUT", path: "/api/v1/prospect/session/{id}/capture", description: "Capturer email/tel", status: "live" },
    { method: "GET", path: "/api/v1/prospect/session/{id}/gains", description: "Dashboard gains de valeur", status: "live" },
    { method: "GET", path: "/api/v1/prospect/session/{id}/pre-rapport", description: "Pre-rapport teaser", status: "live" },
    { method: "GET", path: "/api/v1/prospect/sessions", description: "Sessions prospect (admin)", status: "live" },
    { method: "POST", path: "/api/v1/prospect/playbooks", description: "Creer playbook prospect", status: "live" },
    { method: "GET", path: "/api/v1/prospect/playbooks", description: "Lister playbooks", status: "live" },
    { method: "GET", path: "/api/v1/prospect/playbooks/{id}", description: "Detail playbook", status: "live" },
    { method: "PUT", path: "/api/v1/prospect/playbooks/{id}", description: "MAJ playbook", status: "live" },
    { method: "DELETE", path: "/api/v1/prospect/playbooks/{id}", description: "Supprimer playbook", status: "live" },
    { method: "POST", path: "/api/v1/prospect/campaigns", description: "Creer campagne", status: "live" },
    { method: "GET", path: "/api/v1/prospect/campaigns", description: "Lister campagnes", status: "live" },
    { method: "GET", path: "/api/v1/prospect/campaigns/{id}", description: "Detail campagne", status: "live" },
    { method: "POST", path: "/api/v1/prospect/campaigns/{id}/targets", description: "Ajouter cibles", status: "live" },
    { method: "GET", path: "/api/v1/prospect/campaigns/{id}/targets", description: "Lister cibles", status: "live" },
  ]},
  // ── 31. Trust Reviews (7) ──
  { category: "Trust Reviews", icon: Shield, endpoints: [
    { method: "POST", path: "/api/v1/trust-reviews", description: "Creer evaluation trust (5 criteres)", status: "live" },
    { method: "GET", path: "/api/v1/trust-reviews/{id}", description: "Detail evaluation", status: "live" },
    { method: "GET", path: "/api/v1/trust-reviews", description: "Lister evaluations", status: "live" },
    { method: "PUT", path: "/api/v1/trust-reviews/{id}", description: "Modifier (moderation)", status: "live" },
    { method: "DELETE", path: "/api/v1/trust-reviews/{id}", description: "Supprimer evaluation", status: "live" },
    { method: "GET", path: "/api/v1/trust/org/{id}", description: "Sommaire trust org + badge", status: "live" },
    { method: "GET", path: "/api/v1/trust/org/{id}/can-review/{target}", description: "Verifier si peut evaluer", status: "live" },
  ]},
  // ── 32. Comptabilite CFOB (10) ──
  { category: "Comptabilite CFOB", icon: Activity, endpoints: [
    { method: "GET", path: "/api/v1/accounting/status", description: "Etat connexion comptable", status: "live" },
    { method: "GET", path: "/api/v1/accounting/summary", description: "Resume financier haut-niveau", status: "live" },
    { method: "GET", path: "/api/v1/accounting/invoices", description: "Comptes clients (factures)", status: "live" },
    { method: "GET", path: "/api/v1/accounting/bills", description: "Comptes payables", status: "live" },
    { method: "GET", path: "/api/v1/accounting/accounts", description: "Plan comptable", status: "live" },
    { method: "GET", path: "/api/v1/accounting/reports/pnl", description: "Etat des resultats (P&L)", status: "live" },
    { method: "GET", path: "/api/v1/accounting/reports/balance", description: "Bilan (Balance Sheet)", status: "live" },
    { method: "GET", path: "/api/v1/accounting/reports/cashflow", description: "Flux de tresorerie", status: "live" },
    { method: "POST", path: "/api/v1/accounting/sync", description: "Forcer sync comptable", status: "live" },
    { method: "GET", path: "/api/v1/accounting/cfob-context", description: "Contexte financier pour CFOB", status: "live" },
  ]},
  // ── 33. DocForge (25) ──
  { category: "DocForge", icon: FileCode, endpoints: [
    { method: "GET", path: "/api/v1/docforge/libraries", description: "Bibliotheques DocForge", status: "live" },
    { method: "POST", path: "/api/v1/docforge/libraries", description: "Creer bibliotheque", status: "live" },
    { method: "GET", path: "/api/v1/docforge/libraries/{id}", description: "Detail + stats", status: "live" },
    { method: "POST", path: "/api/v1/docforge/libraries/{id}", description: "Modifier bibliotheque", status: "live" },
    { method: "POST", path: "/api/v1/docforge/libraries/{id}/delete", description: "Supprimer + blocs/faits", status: "live" },
    { method: "POST", path: "/api/v1/docforge/libraries/{id}/ingest-drive", description: "Importer depuis Drive", status: "live" },
    { method: "POST", path: "/api/v1/docforge/libraries/{id}/ingest-text", description: "Importer texte colle", status: "live" },
    { method: "POST", path: "/api/v1/docforge/libraries/{id}/process", description: "Pipeline complet (5 etapes)", status: "live" },
    { method: "GET", path: "/api/v1/docforge/libraries/{id}/progress", description: "Progression pipeline", status: "live" },
    { method: "GET", path: "/api/v1/docforge/libraries/{id}/blocks", description: "Blocs de la bibliotheque", status: "live" },
    { method: "GET", path: "/api/v1/docforge/blocks/{id}", description: "Detail bloc", status: "live" },
    { method: "POST", path: "/api/v1/docforge/blocks/{id}", description: "Modifier bloc", status: "live" },
    { method: "POST", path: "/api/v1/docforge/blocks/{id}/approve", description: "Approuver bloc", status: "live" },
    { method: "POST", path: "/api/v1/docforge/blocks/{id}/reject", description: "Rejeter bloc", status: "live" },
    { method: "GET", path: "/api/v1/docforge/libraries/{id}/facts", description: "Faits (filtrable: status)", status: "live" },
    { method: "POST", path: "/api/v1/docforge/facts/{id}/resolve", description: "Resoudre contradiction", status: "live" },
    { method: "GET", path: "/api/v1/docforge/libraries/{id}/preview", description: "Preview Markdown assemble", status: "live" },
    { method: "POST", path: "/api/v1/docforge/libraries/{id}/publish-drive", description: "Publier sur Google Drive", status: "live" },
    { method: "GET", path: "/api/v1/docforge/templates", description: "Templates filesystem legacy", status: "live" },
    { method: "GET", path: "/api/v1/docforge/templates-v2", description: "Templates DB (filtrable: type)", status: "live" },
    { method: "POST", path: "/api/v1/docforge/templates-v2", description: "Creer template custom", status: "live" },
    { method: "GET", path: "/api/v1/docforge/templates-v2/{id}", description: "Detail template", status: "live" },
    { method: "POST", path: "/api/v1/docforge/templates-v2/{id}", description: "Modifier template", status: "live" },
    { method: "POST", path: "/api/v1/docforge/templates-v2/{id}/delete", description: "Supprimer template custom", status: "live" },
    { method: "POST", path: "/api/v1/docforge/templates-v2/seed", description: "Seed templates systeme", status: "live" },
  ]},
  // ── 34. Autres (30) ──
  { category: "Bots & Kit", icon: Cpu, endpoints: [
    { method: "GET", path: "/api/v1/bots", description: "14 Bots C-Level avec statut", status: "live" },
    { method: "POST", path: "/api/v1/bots/{code}/activate", description: "Activer un bot", status: "live" },
    { method: "POST", path: "/api/v1/kit/set", description: "Switcher dossier client actif", status: "live" },
    { method: "GET", path: "/api/v1/kit/active", description: "Kit entreprise actif + metadata", status: "live" },
    { method: "GET", path: "/api/v1/clients", description: "Tous les clients (PostgreSQL)", status: "live" },
    { method: "GET", path: "/api/v1/clients/{slug}", description: "Detail client par slug", status: "live" },
    { method: "POST", path: "/api/v1/questionnaire", description: "Demarrer/continuer bilan de sante", status: "live" },
    { method: "GET", path: "/api/v1/suggestions", description: "Pastilles contextuelles canvas", status: "live" },
  ]},
  { category: "Memory & Pulse", icon: Brain, endpoints: [
    { method: "GET", path: "/api/v1/memory/search", description: "Recherche knowledge.json", status: "live" },
    { method: "GET", path: "/api/v1/memory/activities", description: "Activites recentes (Telegram+Web)", status: "live" },
    { method: "GET", path: "/api/v1/memory/summary", description: "Resume memoire CarlOS", status: "live" },
    { method: "GET", path: "/api/v1/pulse", description: "Signaux business: tensions, VITAA alerts", status: "live" },
  ]},
  { category: "Playbooks & Codes", icon: Terminal, endpoints: [
    { method: "GET", path: "/api/v1/playbooks", description: "Playbooks disponibles", status: "live" },
    { method: "POST", path: "/api/v1/playbooks/deploy/{id}", description: "Deployer playbook", status: "live" },
    { method: "POST", path: "/api/v1/codes/task", description: "Lancer tache CarlOS Codes (Claude CLI)", status: "live" },
    { method: "GET", path: "/api/v1/codes/task/{id}", description: "Statut tache Codes", status: "live" },
    { method: "GET", path: "/api/v1/codes/task/{id}/stream", description: "SSE stream events temps reel", status: "live" },
  ]},
  { category: "Reference & Config", icon: Server, endpoints: [
    { method: "POST", path: "/api/v1/drive/browse", description: "Browse dossier Drive", status: "live" },
    { method: "POST", path: "/api/v1/drive/search", description: "Deep search Drive par keyword", status: "live" },
    { method: "GET", path: "/api/v1/verticals", description: "13 verticaux d'industrie", status: "live" },
    { method: "GET", path: "/api/v1/regions", description: "Regions geographiques", status: "live" },
    { method: "GET", path: "/api/v1/subscription/tiers", description: "Tiers d'abonnement", status: "live" },
    { method: "GET", path: "/api/v1/subscription/current", description: "Abonnement actuel du user", status: "live" },
    { method: "POST", path: "/api/v1/user/baptize", description: "Nommer son CarlOS", status: "live" },
    { method: "PUT", path: "/api/v1/user/mode", description: "Switch mode Perso/Pro", status: "live" },
    { method: "GET", path: "/api/v1/ut/balance", description: "Solde UT du mois", status: "live" },
    { method: "GET", path: "/api/v1/ut/transactions", description: "Historique transactions UT", status: "live" },
    { method: "GET", path: "/api/v1/training/stats", description: "Stats training patterns Mine d'Or", status: "live" },
    { method: "GET", path: "/api/v1/admin/pricing", description: "Overrides pricing (admin)", status: "live" },
    { method: "POST", path: "/api/v1/admin/pricing", description: "Creer override prix", status: "live" },
    { method: "DELETE", path: "/api/v1/admin/pricing/{id}", description: "Supprimer override", status: "live" },
  ]},
];

// ═══════════════════════════════════════════════════════════════
// DATA — Backend Modules
// ═══════════════════════════════════════════════════════════════

const BACKEND_MODULES = [
  // ── Core (5) ──
  { name: "bridge.py", description: "Entry point — Telegram polling, 5-tier routing, response formatting", category: "core", lines: "2,443" },
  { name: "bridge_btml_connector.py", description: "BTML concepts to responses — jargon invisibility, CREDO phase transitions", category: "core", lines: "412" },
  { name: "bridge_state_machine.py", description: "7 user states: Dashboard, Selection, Qualification, TRAVAIL_CREDO, Wrap-up, Onboarding, Interception", category: "core", lines: "910" },
  { name: "context_builder.py", description: "SOUL templates loader, session history, system_blocks assembly", category: "core", lines: "1,172" },
  { name: "api_clients.py", description: "ClientAnthropic (prompt caching) + ClientGoogle, BudgetTracker ($5/day), RateLimiter", category: "core", lines: "725" },
  // ── Config (2) ──
  { name: "config_bridge.py", description: "Central config — API keys (.env), Tier enum, AgentRole, budget/rate-limit constants", category: "config", lines: "592" },
  { name: "config_overrides.py", description: "Calibration dynamique des parametres BTML", category: "config", lines: "308" },
  // ── Agents (1) ──
  { name: "agents.py", description: "12 C-Level agents (CEOB→CISOB) + 8+1 reflection modes + trisociations", category: "agents", lines: "1,368" },
  // ── Framework BTML (5) ──
  { name: "session_credo.py", description: "CREDO cycle engine — 5 phases: Connect, Research, Expose, Demonstrate, Obtain", category: "framework", lines: "1,064" },
  { name: "piliers_aiavt.py", description: "VITAA 5-pillar framework — Argent, Idee, Actif, Vente, Temps + Triangle du Feu", category: "framework", lines: "427" },
  { name: "tableau_periodique.py", description: "220+ BTML proprietary elements — 4 groups (S/P/T/H), 7 periods", category: "framework", lines: "969" },
  { name: "ghostx_wrapper.py", description: "GhostX cognitive emulation — 14 Ghosts, Bezos/Jobs/Musk mental models", category: "framework", lines: "510" },
  { name: "btml_primitives.py", description: "BTML primitives fondamentales — Element+Catalyseur+Champ→Reaction→Compose", category: "framework", lines: "297" },
  // ── Engines (4) ──
  { name: "bridge_command.py", description: "COMMAND engine — CommandLive + CommandCompiler + CommandDetector (D-091)", category: "engine", lines: "1,264" },
  { name: "knowledge_extractor.py", description: "Post-message extraction — decisions/facts/insights via Gemini Flash (fire-and-forget)", category: "engine", lines: "235" },
  { name: "bridge_proactive.py", description: "GPS du Flow Proactif — sections DATA vs ACTION, auto-advance (D-101)", category: "engine", lines: "458" },
  { name: "carlos_core.py", description: "CarlOS Cognitive Core — orchestration intelligente (D-115)", category: "engine", lines: "432" },
  // ── Data Layer (2) ──
  { name: "database.py", description: "SQLAlchemy ORM — 66 tables, schema migrations, tous les modeles", category: "data", lines: "3,047" },
  { name: "bridge_database.py", description: "PostgreSQL wrapper — seul point d'acces pour toutes les operations CRUD", category: "data", lines: "6,529" },
  // ── Communications (6) ──
  { name: "bridge_phone.py", description: "Telephony bridge — Twilio SIP, NIP authentication", category: "comms", lines: "394" },
  { name: "bridge_telnyx.py", description: "Telnyx migration — code pret, en attente credentials Carl (D-097)", category: "comms", lines: "485" },
  { name: "carlos_livekit_agent.py", description: "LiveKit voice agent — Deepgram STT + CarlOS API + ElevenLabs TTS, 12 voix", category: "comms", lines: "1,066" },
  { name: "carlos_voice_bridge.py", description: "Pont sync serveur vocal Twilio — conversion audio bidirectionnelle", category: "comms", lines: "1,150" },
  { name: "transcribe_vocaux.py", description: "Whisper voice message transcription pour vocaux Telegram", category: "comms", lines: "216" },
  { name: "ws_manager.py", description: "WebSocket Connection Manager pour Chat H2H temps reel", category: "comms", lines: "103" },
  // ── Documents & DocForge (6) ──
  { name: "docforge_engine.py", description: "Moteur DocForge V2 — classify→extract→dedup→fact-check→assemble", category: "docforge", lines: "764" },
  { name: "docforge_drive.py", description: "Acces Google Drive pour DocForge — import/export documents", category: "docforge", lines: "224" },
  { name: "bridge_documents.py", description: "Pipeline Documents — Templates Lego → PDF → generation", category: "docforge", lines: "916" },
  { name: "bridge_cahier.py", description: "Module Cahier de Projets — pre-rapport + generation async", category: "docforge", lines: "1,804" },
  { name: "generate_cahier_pdf.py", description: "Generation PDF Cahier de Projet SMART (~35 pages)", category: "docforge", lines: "1,848" },
  { name: "template_engine.py", description: "Moteur de templates Markdown leger (Jinja2)", category: "docforge", lines: "196" },
  // ── Integrations (7) ──
  { name: "bridge_calendar.py", description: "Google Calendar — /agenda, /rdv, /libre, /briefing", category: "integrations", lines: "357" },
  { name: "bridge_gdocs.py", description: "Google Docs wrap-up creation via service account", category: "integrations", lines: "140" },
  { name: "bridge_plane.py", description: "Plane.so task management — BridgePlane REST API client", category: "integrations", lines: "606" },
  { name: "bridge_accounting.py", description: "Comptabilite universelle — P&L, bilan, cashflow, sync, contexte CFOB", category: "integrations", lines: "851" },
  { name: "bridge_analytics.py", description: "Intelligence marketing GA4 + Google Search Console", category: "integrations", lines: "338" },
  { name: "bridge_equipment_catalog.py", description: "Catalogue equipements industriels (DigiKey + Mouser)", category: "integrations", lines: "422" },
  { name: "bridge_social.py", description: "Social Media pour le CMO Bot — posts, calendrier editorial", category: "integrations", lines: "587" },
  // ── Business Logic (7) ──
  { name: "bridge_questionnaire.py", description: "Bilan de Sante Manufacturier V3 — conversationnel CREDO", category: "business", lines: "1,908" },
  { name: "bridge_prospect.py", description: "Moteur CarlOS Prospect — sessions anonymes, qualification, gains", category: "business", lines: "669" },
  { name: "bridge_meetings.py", description: "Meetings multi-participants avec CarlOS co-animateur", category: "business", lines: "1,085" },
  { name: "bridge_invitation.py", description: "Systeme d'invitations email pour meetings", category: "business", lines: "309" },
  { name: "bridge_podcast.py", description: "Pipeline contenu meeting → podcast (D-114)", category: "business", lines: "392" },
  { name: "bridge_subventions.py", description: "Module Subventions pour le CFO Bot", category: "business", lines: "592" },
  { name: "bridge_crm.py", description: "CRM SQLite pour Usine Bleue AI", category: "business", lines: "920" },
  // ── Security (4) ──
  { name: "rbac.py", description: "Role-Based Access Control — admin/manager/member/viewer", category: "security", lines: "159" },
  { name: "bridge_sentinel.py", description: "Module securite central GhostX Sentinel", category: "security", lines: "609" },
  { name: "sentinel_watchdog.py", description: "Service watchdog independant — monitoring + alertes", category: "security", lines: "575" },
  { name: "sentinel_crypto.py", description: "Chiffrement et masquage PII", category: "security", lines: "121" },
  // ── Monitoring & Misc (5) ──
  { name: "message_logger.py", description: "MESSAGE-LOG.md writer — tokens, cost, latency tracking", category: "monitoring", lines: "219" },
  { name: "media_processor.py", description: "Traitement medias Telegram — photos, videos, PDF, DOCX", category: "monitoring", lines: "312" },
  { name: "profil_extractor.py", description: "Auto-extraction profil entreprise + objectifs strategiques", category: "monitoring", lines: "563" },
  { name: "gains_calculator.py", description: "Calculateur gains de valeur CarlOS Prospect", category: "monitoring", lines: "368" },
  { name: "bridge_codes.py", description: "CarlOS Codes — Claude Code CLI (Pro Max)", category: "monitoring", lines: "239" },
  // ── API REST (1) ──
  { name: "api_rest.py", description: "FastAPI REST API — 282 endpoints, 53 groupes, scoring engine, multi-tenant", category: "api", lines: "10,355" },
];

// ═══════════════════════════════════════════════════════════════
// DATA — Database Tables
// ═══════════════════════════════════════════════════════════════

interface DbTableGroup {
  group: string;
  tables: { name: string; description: string; columns: string[]; status: "live" }[];
}

const DB_TABLE_GROUPS: DbTableGroup[] = [
  // ── Multi-Tenant & Auth (6 tables) ──
  { group: "Multi-Tenant & Auth", tables: [
    { name: "tenants", description: "Organisations/entreprises", columns: ["id (SERIAL PK)", "name", "slug (UNIQUE)", "type_tenant", "plan_type", "settings (JSONB)", "actif", "created_at"], status: "live" },
    { name: "users", description: "Utilisateurs CarlOS", columns: ["id (SERIAL PK)", "email (UNIQUE)", "password_hash", "nom", "current_mode", "last_login", "created_at"], status: "live" },
    { name: "memberships", description: "Lien user↔tenant avec role", columns: ["id (SERIAL PK)", "user_id (FK)", "tenant_id (FK)", "role", "department_scope (JSONB)", "is_primary", "actif"], status: "live" },
    { name: "active_sessions", description: "Sessions JWT (revocation)", columns: ["id (SERIAL PK)", "user_id", "token_hash", "device_info", "ip_address", "revoked", "created_at"], status: "live" },
    { name: "mfa_secrets", description: "TOTP MFA + backup codes", columns: ["id (SERIAL PK)", "user_id (UNIQUE FK)", "totp_secret", "backup_codes (JSONB)", "is_active"], status: "live" },
    { name: "auth_events", description: "Audit log authentification", columns: ["id (SERIAL PK)", "user_id", "event_type", "ip_address", "user_agent", "success", "details (JSONB)"], status: "live" },
  ]},
  // ── Governance & Orchestration (6 tables) ──
  { group: "Governance & Orchestration", tables: [
    { name: "decision_log", description: "Decisions CarlOS — D-001 a D-109+", columns: ["id (SERIAL PK)", "user_id", "bot_code", "type_decision", "titre", "description", "contexte (JSONB)", "resultat (JSONB)", "reversible", "autonomy_level", "tenant_id"], status: "live" },
    { name: "command_missions", description: "Missions COMMAND (D-091)", columns: ["id (SERIAL PK)", "user_id", "tenant_id (FK)", "message_original", "trigger", "urgency", "stage", "scan_bots (JSONB)", "stage_results (JSONB)", "summary"], status: "live" },
    { name: "compiled_briefings", description: "Briefings pre-compiles (80% pre-calcule)", columns: ["id (SERIAL PK)", "user_id", "bot_code", "type_briefing", "titre", "contenu", "data (JSONB)", "stale"], status: "live" },
    { name: "tensions", description: "Tensions business — unite atomique CarlOS (D-100)", columns: ["id (SERIAL PK)", "user_id", "type_vitaa", "intensite", "titre", "description", "bot_codes (JSONB)", "mission_id", "status"], status: "live" },
    { name: "pending_approvals", description: "Actions bot en attente d'approbation (D-098)", columns: ["id (SERIAL PK)", "tenant_id (FK)", "bot_code", "action_type", "action_params (JSONB)", "severity", "status", "expires_at"], status: "live" },
    { name: "user_bot_configs", description: "Config autonomie par user×tenant×bot", columns: ["id (SERIAL PK)", "user_id", "tenant_id", "bot_code", "autonomy_level", "blocked_actions (JSONB)", "max_cost_per_interaction"], status: "live" },
  ]},
  // ── Hierarchie de Travail (6 tables) ──
  { group: "Hierarchie: Chantiers→Projets→Missions→Taches", tables: [
    { name: "chantiers", description: "Initiatives strategiques (semaines/mois)", columns: ["id (SERIAL PK)", "tenant_id", "titre", "type_chantier", "chaleur", "score_vente/idee/temps/argent/actif", "progression", "status", "bot_codes (JSONB)", "objectifs (JSONB)"], status: "live" },
    { name: "projets", description: "Projets (dans un chantier)", columns: ["id (SERIAL PK)", "tenant_id", "chantier_id (FK)", "titre", "status", "progression", "bot_primaire", "objectifs (JSONB)", "echeance"], status: "live" },
    { name: "missions", description: "Missions tactiques (jours/semaines)", columns: ["id (SERIAL PK)", "tenant_id", "chantier_id (FK)", "projet_id (FK)", "titre", "status", "progression", "bot_primaire", "tension_id (FK)", "thread_ids (JSONB)"], status: "live" },
    { name: "taches", description: "Taches atomiques (heures/jours)", columns: ["id (SERIAL PK)", "tenant_id", "mission_id (FK)", "titre", "status", "priorite", "bot_primaire", "assignee_type", "echeance"], status: "live" },
    { name: "idees", description: "Idees cristallisees (attachables a tout niveau)", columns: ["id (SERIAL PK)", "tenant_id", "titre", "contenu", "source", "bot", "chantier_id (FK)", "projet_id (FK)", "mission_id (FK)"], status: "live" },
    { name: "discussions", description: "Conversations transitoires (metadata, messages en localStorage)", columns: ["id (SERIAL PK)", "tenant_id", "external_id (UNIQUE)", "titre", "status", "bot_primaire", "section", "message_count"], status: "live" },
  ]},
  // ── Diagnostics (2 tables) ──
  { group: "Diagnostics", tables: [
    { name: "diagnostics", description: "Diagnostic vivant — snapshot VITAA (D-108)", columns: ["id (SERIAL PK)", "user_id (UNIQUE)", "score_vente/idee/temps/argent/actif", "chaleur", "herrmann_bleu/vert/rouge/jaune", "onboarding_complete", "contexte (JSONB)"], status: "live" },
    { name: "diagnostic_ia", description: "Diagnostic IA Usine Bleue — 12 departements", columns: ["id (SERIAL PK)", "user_id", "nom_entreprise", "secteur", "reponses (JSONB)", "scores_departements (JSONB)", "score_dia", "top_gaps (JSONB)", "status"], status: "live" },
  ]},
  // ── Bureau & Entreprise (3 tables) ──
  { group: "Bureau & Entreprise", tables: [
    { name: "bureau_items", description: "Items workspace (documents, outils)", columns: ["id (SERIAL PK)", "tenant_id", "type_item", "titre", "status", "bot", "tags (JSONB)", "mission_id", "chantier_id"], status: "live" },
    { name: "entreprise_profils", description: "Profil entreprise (1 par tenant)", columns: ["id (SERIAL PK)", "tenant_id (UNIQUE)", "nom", "industrie", "taille", "forces/faiblesses (JSONB)", "score_vente/idee/temps/argent/actif", "trust_score_*"], status: "live" },
    { name: "canvas_items", description: "Canvas visuels (SWOT, BMC, Lean, VITAA)", columns: ["id (SERIAL PK)", "tenant_id", "type_canvas", "titre", "data (JSONB)", "created_at"], status: "live" },
  ]},
  // ── Orbit9 (8 tables) ──
  { group: "Orbit9 Network", tables: [
    { name: "orbit9_members", description: "Membres reseau (manufacturiers, fournisseurs)", columns: ["id (SERIAL PK)", "user_id", "tenant_id", "nom", "secteur", "status", "specialites (JSONB)", "vitaa_scores (JSONB)", "trust_score", "vertical_id"], status: "live" },
    { name: "orbit9_cellules", description: "Cellules (groupes de 9 complementaires)", columns: ["id (SERIAL PK)", "tenant_id", "nom", "type_cellule", "membre_ids (JSONB)", "max_membres", "status", "gouvernance (JSONB)"], status: "live" },
    { name: "orbit9_matches", description: "Resultats matching (besoin vs candidats)", columns: ["id (SERIAL PK)", "demandeur_id", "besoin", "candidats (JSONB)", "gagnant_ids (JSONB)", "status", "scores_detail (JSONB)"], status: "live" },
    { name: "orbit9_cellule_tenants", description: "Membership multi-tenant cellules", columns: ["id (SERIAL PK)", "cellule_id (FK)", "tenant_id (FK)", "role", "joined_at"], status: "live" },
    { name: "orbit9_gouvernance_records", description: "Records gouvernance holacratique", columns: ["id (SERIAL PK)", "cellule_id", "type", "tension_description", "proposition", "resultat"], status: "live" },
    { name: "cellule_roles", description: "Roles holacratiques dans une cellule", columns: ["id (SERIAL PK)", "cellule_id", "role_name", "purpose", "accountabilities (JSONB)", "held_by_member_id"], status: "live" },
    { name: "qualification_stage_data", description: "Qualification step-by-step Orbit9", columns: ["id (SERIAL PK)", "member_id", "stage", "field_name", "field_value", "validated"], status: "live" },
    { name: "trust_reviews", description: "Evaluations trust bidirectionnelles (type Uber)", columns: ["id (SERIAL PK)", "reviewer_org_id", "reviewed_org_id", "score_qualite/delai/communication/prix/fiabilite", "score_global", "status"], status: "live" },
  ]},
  // ── Meetings & Communication (5 tables) ──
  { group: "Meetings & Communication", tables: [
    { name: "meetings", description: "Meetings multi-participants avec CarlOS", columns: ["id (SERIAL PK)", "slug (UNIQUE)", "title", "host_user_id", "room_name", "status", "bot_codes (ARRAY)", "transcript_json (JSONB)"], status: "live" },
    { name: "meeting_participants", description: "Participants meetings", columns: ["id (SERIAL PK)", "meeting_id (FK)", "display_name", "identity", "role", "joined_at"], status: "live" },
    { name: "meeting_invitations", description: "Invitations meetings (tracking)", columns: ["id (SERIAL PK)", "meeting_id", "email", "status", "token (UNIQUE)", "sent_at", "responded_at"], status: "live" },
    { name: "vocal_sessions", description: "Historique sessions vocales", columns: ["id (SERIAL PK)", "room_name (UNIQUE)", "user_id", "agent_code", "exchanges (JSONB)", "started_at"], status: "live" },
    { name: "chat_rooms", description: "Chat rooms H2H + bot", columns: ["id (SERIAL PK)", "tenant_id", "name", "type_room", "member_ids (JSONB)", "bot_codes (JSONB)", "actif"], status: "live" },
  ]},
  // ── Core Telegram (5 tables) ──
  { group: "Core Telegram", tables: [
    { name: "clients", description: "Profils clients/entreprises", columns: ["id (SERIAL PK)", "slug (UNIQUE)", "nom_entreprise", "secteur", "donnees (JSONB)", "score_vitaa", "created_at"], status: "live" },
    { name: "bilans_sante", description: "Sessions Bilan de Sante", columns: ["id (SERIAL PK)", "client_id (FK)", "phase", "donnees_collectees (JSONB)", "progression_pct", "complete"], status: "live" },
    { name: "activites", description: "Audit trail toutes interactions", columns: ["id (SERIAL PK)", "client_id (FK)", "type_activite", "agent", "tier", "cout_api", "created_at"], status: "live" },
    { name: "whitelist", description: "Users Telegram autorises", columns: ["id (SERIAL PK)", "chat_id (UNIQUE)", "nom", "role", "actif"], status: "live" },
    { name: "session_states", description: "State machine persistence", columns: ["id (SERIAL PK)", "chat_id (UNIQUE)", "etat", "agent_actif", "contexte (JSONB)", "historique (JSONB)"], status: "live" },
  ]},
  // ── Phone Auth (2 tables) ──
  { group: "Phone Auth", tables: [
    { name: "phone_auth", description: "NIP authentication whitelist (D-089)", columns: ["id (SERIAL PK)", "phone_number (UNIQUE)", "pin_hash", "bot_code", "actif", "tentatives_echec"], status: "live" },
    { name: "phone_sessions", description: "Sessions appel actives (TTL 10min)", columns: ["id (SERIAL PK)", "call_sid (UNIQUE)", "phone_number", "authentifie", "room_name", "expires_at"], status: "live" },
  ]},
  // ── DocForge (4 tables) ──
  { group: "DocForge", tables: [
    { name: "docforge_templates", description: "Templates structure documents", columns: ["id (SERIAL PK)", "alias (UNIQUE)", "titre", "sections (JSONB)", "mega_prompt", "type_template", "actif"], status: "live" },
    { name: "docforge_libraries", description: "Bibliotheques documents organisees", columns: ["id (SERIAL PK)", "tenant_id", "titre", "template_alias", "nb_blocs", "nb_faits", "completude_pct", "status"], status: "live" },
    { name: "docforge_blocks", description: "Blocs contenu dans sections", columns: ["id (SERIAL PK)", "library_id (FK)", "section_id", "contenu_md", "source_type", "confiance", "status"], status: "live" },
    { name: "docforge_facts", description: "Registre verite cross-document", columns: ["id (SERIAL PK)", "library_id (FK)", "sujet", "valeur", "source_block_ids (JSONB)", "status", "valeurs_alternatives (JSONB)"], status: "live" },
  ]},
  // ── Prospection (4 tables) ──
  { group: "Prospection", tables: [
    { name: "prospect_sessions", description: "Sessions prospection conversationnelles", columns: ["id (SERIAL PK)", "prospect_id", "channel", "current_phase", "scores_departements (JSONB)", "contact_email", "status"], status: "live" },
    { name: "prospect_playbooks", description: "Playbooks prospection customisables", columns: ["id (SERIAL PK)", "org_id", "nom", "intro_script", "target_profil_types (JSONB)", "status"], status: "live" },
    { name: "prospect_campaigns", description: "Campagnes de prospection", columns: ["id (SERIAL PK)", "owner_org_id", "playbook_id", "nom", "target_count", "converted_count", "status"], status: "live" },
    { name: "campaign_targets", description: "Cibles de campagne", columns: ["id (SERIAL PK)", "campaign_id", "entreprise", "contact_nom", "status", "session_id", "call_attempts"], status: "live" },
  ]},
  // ── Fonds & Portefeuille (5 tables) ──
  { group: "Fonds & Portefeuille", tables: [
    { name: "fund_portfolio", description: "Liens fonds→entreprises portefeuille", columns: ["id (SERIAL PK)", "fund_id (FK)", "company_id (FK)", "investment_amount", "sharing_level", "status"], status: "live" },
    { name: "fund_kpis_cache", description: "KPIs agreges par entreprise", columns: ["id (SERIAL PK)", "fund_id", "company_id", "score_vitaa (JSONB)", "triangle_feu", "derniere_maj"], status: "live" },
    { name: "fund_alerts", description: "Alertes temps reel fonds", columns: ["id (SERIAL PK)", "fund_id", "company_id", "severity", "titre", "acknowledged", "created_at"], status: "live" },
    { name: "fund_cross_intel", description: "Synergies detectees entre entreprises", columns: ["id (SERIAL PK)", "fund_id", "company_a_id", "company_b_id", "type_synergie", "score", "status"], status: "live" },
    { name: "fund_managers", description: "Gestionnaires de fonds", columns: ["id (SERIAL PK)", "user_id", "fund_id", "role", "sectors_assigned (JSONB)", "regions_assigned (JSONB)"], status: "live" },
  ]},
  // ── Subscriptions & UT (6 tables) ──
  { group: "Abonnements & UT Economy", tables: [
    { name: "subscription_tiers", description: "Tiers abonnement (Free→Pioneer)", columns: ["id (SERIAL PK)", "code (UNIQUE)", "nom", "monthly_price_base", "ut_included", "features (JSONB)", "max_bots"], status: "live" },
    { name: "user_subscriptions", description: "Abonnements actifs", columns: ["id (SERIAL PK)", "user_id", "tenant_id", "tier_id", "status", "started_at", "stripe_subscription_id"], status: "live" },
    { name: "pricing_overrides", description: "Pricing custom par type acteur", columns: ["id (SERIAL PK)", "tenant_id", "tier_id", "type_acteur", "monthly_price", "actif"], status: "live" },
    { name: "ut_consumption", description: "Consommation UT mensuelle", columns: ["id (SERIAL PK)", "user_id", "tenant_id", "period_month", "base_allocation", "consumed", "overage_consumed"], status: "live" },
    { name: "ut_contribution", description: "Contribution/reputation UT Orbit9", columns: ["id (SERIAL PK)", "member_id (FK)", "cellule_id", "densite", "impact", "tt_rg_score", "accumulated_tt"], status: "live" },
    { name: "ut_transactions", description: "Journal transactions UT unifie", columns: ["id (SERIAL PK)", "user_id", "tenant_id", "type", "amount", "reference_type", "description"], status: "live" },
  ]},
  // ── Geographie & Verticaux (3 tables) ──
  { group: "Geographie & Verticaux", tables: [
    { name: "verticals", description: "13 verticaux d'industrie", columns: ["id (SERIAL PK)", "code (UNIQUE)", "nom", "volume_qc", "status", "pro_enabled", "perso_enabled"], status: "live" },
    { name: "geographic_regions", description: "Hierarchie pays→province→region", columns: ["id (SERIAL PK)", "code (UNIQUE)", "country_code", "province_code", "nom", "level", "parent_id (FK self)"], status: "live" },
    { name: "regional_pioneers", description: "Badges Pioneer par vertical×type×region", columns: ["id (SERIAL PK)", "member_id", "vertical_id", "type_acteur", "position_number", "badge"], status: "live" },
  ]},
  // ── Marketplace & Social (5 tables) ──
  { group: "Marketplace & Social Feed", tables: [
    { name: "bot_store_items", description: "Items marketplace bots", columns: ["id (SERIAL PK)", "creator_user_id", "item_type", "name", "category", "pricing_tiers (JSONB)", "status", "avg_rating"], status: "live" },
    { name: "store_reviews", description: "Reviews marketplace", columns: ["id (SERIAL PK)", "item_id", "reviewer_user_id", "rating", "comment"], status: "live" },
    { name: "store_purchases", description: "Achats marketplace", columns: ["id (SERIAL PK)", "user_id", "item_id", "tier", "price", "ut_spent"], status: "live" },
    { name: "feed_posts", description: "Timeline sociale Orbit9", columns: ["id (SERIAL PK)", "author_user_id", "tenant_id", "post_type", "title", "content", "engagement_score"], status: "live" },
    { name: "feed_interactions", description: "Interactions posts (like/comment/share)", columns: ["id (SERIAL PK)", "post_id", "user_id", "type", "content"], status: "live" },
  ]},
  // ── Auto-Scout & Playbooks (4 tables) ──
  { group: "Auto-Scout & Playbooks", tables: [
    { name: "scout_configs", description: "Config auto-scout nightly", columns: ["id (SERIAL PK)", "user_id", "bot_code", "vertical_id", "search_criteria (JSONB)", "frequency", "is_active"], status: "live" },
    { name: "daily_briefings", description: "Briefings auto-scout matinaux", columns: ["id (SERIAL PK)", "user_id", "briefing_date", "results (JSONB)", "generated_at", "read_at"], status: "live" },
    { name: "playbook_templates", description: "Templates playbooks (catalogue)", columns: ["id (SERIAL PK)", "code (UNIQUE)", "name", "department_code", "sections (JSONB)", "is_system_template", "deployment_count"], status: "live" },
    { name: "playbook_deployments", description: "Deployements playbook", columns: ["id (SERIAL PK)", "user_id", "tenant_id", "template_id", "resulting_chantier_id", "deployed_at"], status: "live" },
  ]},
  // ── Autres (3 tables) ──
  { group: "Autres", tables: [
    { name: "chat_messages", description: "Messages dans chat rooms H2H", columns: ["id (SERIAL PK)", "room_id (FK)", "sender_user_id", "sender_bot_code", "content", "message_type", "extra (JSONB)"], status: "live" },
    { name: "cross_tenant_shares", description: "Partage cross-tenant polymorphique", columns: ["id (SERIAL PK)", "resource_type", "resource_id", "owner_tenant_id", "shared_with_tenant_id", "permission", "cellule_id"], status: "live" },
    { name: "schema_migrations", description: "Tracking migrations SQL", columns: ["id (SERIAL PK)", "version (UNIQUE)", "description", "applied_at"], status: "live" },
  ]},
];

// ═══════════════════════════════════════════════════════════════
// DATA — Infrastructure
// ═══════════════════════════════════════════════════════════════

const INFRA_VPS = [
  {
    name: "VPS1 — usinebleue-dev",
    ip: "51.222.31.180",
    role: "DEV + staging",
    provider: "OVH",
    storage: "193GB + 492GB block (/mnt/brain-storage)",
    services: ["brain-bridge (Telegram bot)", "Claude Code dev", "LiveKit agent", "DocuSeal Docker :3100", "Tim Training (systemd timers)", "VisionClaw / dev_channel.py"],
    ssh: "ssh -p 2222 deploy@51.222.31.180",
    domain: "dev.usinebleue.ai",
    status: "live" as const,
  },
  {
    name: "VPS2 — usinebleue-live",
    ip: "51.222.25.203",
    role: "PRODUCTION",
    provider: "OVH",
    storage: "96GB (88GB free), 12GB RAM",
    services: ["PostgreSQL 16 Docker (carlosdb)", "uvicorn API :8000", "Nginx + SSL", "VPS2 Guardian (health/scan/backup)"],
    ssh: "ssh -p 2222 -i ~/.ssh/id_brain_nexus deploy@51.222.25.203",
    domain: "app.usinebleue.ai",
    ssl: "Let's Encrypt (expires 2026-06-02)",
    status: "live" as const,
  },
];

// ═══════════════════════════════════════════════════════════════
// DATA — Integrations
// ═══════════════════════════════════════════════════════════════

const INTEGRATIONS = [
  {
    name: "LiveKit",
    icon: Mic,
    category: "Voice/Video",
    description: "Voice and video rooms, agent dispatch, SIP trunk integration",
    details: [
      "Details complets → Stack Communication (voice pipeline, pont vocal, canvas auto-nav)",
    ],
    status: "live" as const,
  },
  {
    name: "ElevenLabs",
    icon: MonitorSpeaker,
    category: "TTS",
    description: "Text-to-Speech — 12 voix distinctes, une par bot C-Level",
    details: [
      "Details complets → Stack Communication (12 voix, model, voice IDs)",
    ],
    status: "live" as const,
  },
  {
    name: "Deepgram",
    icon: Wifi,
    category: "STT",
    description: "Speech-to-Text — nova-3 fr pour transcription temps reel",
    details: [
      "Details complets → Stack Communication (voice pipeline)",
    ],
    status: "live" as const,
  },
  {
    name: "Telnyx",
    icon: Phone,
    category: "Telephony",
    description: "Migration Twilio vers Telnyx — bridge_telnyx.py pret, en attente credentials",
    details: [
      "Details complets → Stack Communication (telephonie, NIP N2, Telnyx credentials)",
    ],
    status: "en-cours" as const,
  },
  {
    name: "Tavus",
    icon: Video,
    category: "Video Avatar",
    description: "Video avatar lip-sync — Lucas Studio replica, $0.37/min",
    details: [
      "Details complets → Stack Communication (video avatar, activation, room convention)",
    ],
    status: "live" as const,
  },
  {
    name: "Google Gemini",
    icon: Brain,
    category: "LLM",
    description: "Flash (T1, free) + Pro (T2, free) — 80%+ des requetes",
    details: [
      "T1 Gemini Flash: 1500 req/day, gratuit, ~30% du trafic",
      "T2 Gemini Pro: 500 req/day, gratuit, ~20% du trafic",
      "Knowledge extraction: Gemini Flash fire-and-forget",
      "Orbit9 scoring: Gemini Flash pour match scoring",
    ],
    status: "live" as const,
  },
  {
    name: "Anthropic Claude",
    icon: Brain,
    category: "LLM",
    description: "Sonnet (T3) + Opus (T4) — requetes complexes, ~20% du trafic",
    details: [
      "T3 Claude Sonnet: ~$0.01-0.05/req, ~15% du trafic",
      "T4 Claude Opus: ~$0.15-0.60/req, ~5% du trafic",
      "Prompt caching on SOUL templates: ~90% input token savings",
      "Budget cible: $5/day max, 80%+ sur tiers gratuits",
    ],
    status: "live" as const,
  },
  {
    name: "Plane.so",
    icon: Layers,
    category: "Project Management",
    description: "Task management pour Mon Bureau — API REST integration",
    details: [
      "bridge_plane.py: BridgePlane class, REST API client",
      "Synchro taches avec Mon Bureau projets",
      "Integration bidirectionnelle projets/taches",
    ],
    status: "live" as const,
  },
  {
    name: "Google Drive",
    icon: Cloud,
    category: "Storage",
    description: "File backup + sync via service account (rclone)",
    details: [
      "GhostX-Master folder: 1IRU1xnc3Me_Ku5jAxs8ZZXIc055O8QCJ",
      "Service account: brain-drive-service-account.json",
      "Upload via rclone copy avec --drive-root-folder-id",
      "OAuth perso casse — service account fonctionne",
    ],
    status: "live" as const,
  },
  {
    name: "Groq",
    icon: Zap,
    category: "Fast Inference",
    description: "Inference rapide pour pipelines temps-reel (fallback/acceleration)",
    details: [
      "Utilise pour certains pipelines necessitant latence ultra-basse",
      "Complement aux tiers Gemini/Claude pour cas specifiques",
    ],
    status: "live" as const,
  },
  {
    name: "DocuSeal",
    icon: FileCode,
    category: "E-Signature",
    description: "Signature electronique — Docker container sur VPS1 (port 3100)",
    details: [
      "Container Docker local, port 3100 (UFW DENY externe)",
      "Integration avec pipeline Documents pour signature de contrats",
    ],
    status: "live" as const,
  },
  {
    name: "Whisper (OpenAI)",
    icon: Mic,
    category: "Transcription",
    description: "Transcription batch des messages vocaux Telegram",
    details: [
      "transcribe_vocaux.py: batch processing des vocaux Telegram",
      "Complement a Deepgram (STT temps reel) pour vocaux async",
    ],
    status: "live" as const,
  },
  {
    name: "GA4 + Search Console",
    icon: Activity,
    category: "Analytics",
    description: "Intelligence marketing — bridge_analytics.py (338 lignes)",
    details: [
      "Google Analytics 4: metriques trafic et conversions",
      "Google Search Console: performance SEO et indexation",
      "Donnees injectees dans contexte CMO Bot (Mathilde)",
    ],
    status: "live" as const,
  },
  {
    name: "DigiKey + Mouser",
    icon: Cpu,
    category: "Equipment Catalog",
    description: "Catalogue equipements industriels — bridge_equipment_catalog.py",
    details: [
      "Recherche composants et equipements industriels",
      "Integration avec CPO Bot (Paco) pour ROI automatisation",
      "422 lignes, APIs DigiKey et Mouser",
    ],
    status: "live" as const,
  },
];

// ═══════════════════════════════════════════════════════════════
// DATA — Security
// ═══════════════════════════════════════════════════════════════

const SECURITY_ITEMS = [
  { category: "Firewall", item: "UFW", description: "deny incoming, allow 2222/80/443 uniquement", status: "live" as const },
  { category: "Firewall", item: "CORS", description: "allow_origins=[\"https://app.usinebleue.ai\"] — plus de wildcard", status: "live" as const },
  { category: "Auth", item: "JWT Auth", description: "JWT complet — access + refresh tokens, sessions revocables, switch-tenant", status: "live" as const },
  { category: "Auth", item: "API Key", description: "Rotee, pas de fallback hardcode, RuntimeError si absente", status: "live" as const },
  { category: "Auth", item: "Login", description: "Server-side /api/v1/auth/login SHA256 — credentials plus dans le JS bundle", status: "live" as const },
  { category: "Auth", item: "Phone NIP", description: "NIP N2 (D-089) — CLID + PIN dans phone_auth PostgreSQL", status: "live" as const },
  { category: "Auth", item: "MFA/TOTP", description: "Support TOTP avec backup codes — table mfa_secrets", status: "live" as const },
  { category: "Auth", item: "RBAC", description: "Role-Based Access Control — admin/manager/member/viewer (rbac.py)", status: "live" as const },
  { category: "Rate Limiting", item: "Rate Limit", description: "30 req/min par API key (in-memory sliding window)", status: "live" as const },
  { category: "Rate Limiting", item: "Budget Tracker", description: "$5/day max — BudgetTracker dans api_clients.py", status: "live" as const },
  { category: "Input", item: "Validation", description: "Max 12,000 chars, slug regex ^[a-z0-9\\-]+$", status: "live" as const },
  { category: "Headers", item: "Nginx Headers", description: "HSTS, CSP, Permissions-Policy", status: "live" as const },
  { category: "Headers", item: "Swagger", description: "Desactive en production (_DEBUG env var)", status: "live" as const },
  { category: "Sentinel", item: "Watchdog", description: "sentinel_watchdog.py — monitoring independant + alertes (575 lignes)", status: "live" as const },
  { category: "Sentinel", item: "Crypto PII", description: "sentinel_crypto.py — chiffrement et masquage donnees personnelles", status: "live" as const },
  { category: "Sentinel", item: "QC Protocol", description: "sentinel_qc.py — Protocole VERITE composantes E/I/T/E (496 lignes)", status: "live" as const },
  { category: "Audit", item: "Auth Events", description: "Table auth_events — log complet login/logout/failures/IP/user_agent", status: "live" as const },
  { category: "Audit", item: "Decision Log", description: "Toutes les actions bot tracees — reversible, autonomy_level, pre/post state", status: "live" as const },
  { category: "Isolation", item: "Multi-tenant", description: "tenant_id sur toutes les tables — isolation complete des donnees entre orgs", status: "live" as const },
  { category: "Cleanup", item: "Voice Events TTL", description: "TTL 2h cleanup automatique des voice events", status: "live" as const },
  { category: "Files", item: "Permissions", description: "chmod 600 sur .env, credentials_*.json, token_*.json, data/.sentinel_key", status: "live" as const },
];

// ═══════════════════════════════════════════════════════════════
// TABS DEFINITION
// ═══════════════════════════════════════════════════════════════

const tabs = [
  { id: "bots-skills", label: "Bots & Skills" },
  { id: "api-endpoints", label: "API & Endpoints" },
  { id: "backend", label: "Backend" },
  { id: "database", label: "Base de Données" },
  { id: "infra", label: "Infrastructure" },
  { id: "integrations", label: "Intégrations" },
  { id: "securite", label: "Sécurité" },
  { id: "cerveau-btml", label: "Cerveau BTML" },
];

// ═══════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: "live" | "en-cours" | "a-faire" }) {
  const config = {
    "live": { label: "LIVE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "en-cours": { label: "EN COURS", className: "bg-amber-100 text-amber-700 border-amber-200" },
    "a-faire": { label: "A FAIRE", className: "bg-gray-100 text-gray-500 border-gray-200" },
  }[status];

  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", config.className)}>
      {config.label}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-700",
    POST: "bg-emerald-100 text-emerald-700",
    PUT: "bg-amber-100 text-amber-700",
    DELETE: "bg-red-100 text-red-700",
    PATCH: "bg-violet-100 text-violet-700",
  };

  return (
    <span className={cn("text-[9px] font-bold font-mono px-1.5 py-0.5 rounded min-w-[42px] text-center inline-block", colors[method] || "bg-gray-100 text-gray-700")}>
      {method}
    </span>
  );
}

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ═══════════════════════════════════════════════════════════════
// TAB CONTENT COMPONENTS
// ═══════════════════════════════════════════════════════════════

function TabBotsSkills() {
  const { setActiveView } = useFrameMaster();
  return (
    <>
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.1.1</span>Equipe GhostX — 12 Agents C-Level</h3>
        <p className="text-xs text-gray-400 mb-3">
          Chaque bot possede une Trisociation (3 OS combines: Primaire + Calibrateur + Amplificateur), un fichier SOUL unique, et un ensemble de skills specialises.
          Le BTML (Brain Team Modeling Language) modele l'intelligence d'affaires comme la chimie modele la matiere.
        </p>
      </div>

      {/* Bot Grid */}
      <div className="space-y-3">
        {BOTS_DATA.map((bot) => (
          <Card key={bot.code} className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-start gap-4">
              {/* Bot Code Badge */}
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0",
                `bg-${bot.color}-500`
              )}>
                {bot.code}
              </div>

              {/* Bot Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-gray-800">{bot.name}</span>
                  <Badge variant="outline" className="text-[9px] font-bold">{bot.role}</Badge>
                  <StatusBadge status="live" />
                </div>

                {/* Trisociation */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">Trisociation:</span>
                  <span className="text-xs text-gray-700 font-medium">{bot.trisociation}</span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {bot.skills.map((skill) => (
                    <span key={skill} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* SOUL file */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-400">SOUL:</span>
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-600">{bot.soul}</code>
                  <span className="text-[9px] text-gray-400">({bot.soulSize})</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SectionDivider />

      {/* Cross-ref vers Bible GHML Complete */}
      <Card className="p-4 bg-violet-50 border border-violet-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <Atom className="h-5 w-5 text-violet-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-violet-800">Framework BTML — Reference Complete</div>
            <p className="text-xs text-violet-600 mt-0.5">CREDO, VITAA, 12 Ghosts, 8+1 Modes, Tableau Periodique, Triangle du Feu — tout est detaille dans la Bible BTML Complete (A.3).</p>
          </div>
          <button
            onClick={() => setActiveView("bible-ghml")}
            className="px-3 py-1.5 text-xs font-bold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors shrink-0"
          >
            Voir A.3
          </button>
        </div>
      </Card>
    </>
  );
}

function TabApiEndpoints() {
  const totalEndpoints = API_ENDPOINTS.reduce((sum, g) => sum + g.endpoints.length, 0);
  const liveCount = API_ENDPOINTS.reduce((sum, g) => sum + g.endpoints.filter(e => e.status === "live").length, 0);

  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.2.1</span>API REST — FastAPI sur VPS2</h3>
        <p className="text-xs text-gray-400 mb-3">
          {totalEndpoints} endpoints | {liveCount} LIVE | Port 8000 (bind 127.0.0.1) | Nginx proxy <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">/api/v1/</code>
        </p>
      </div>

      <div className="space-y-4">
        {API_ENDPOINTS.map((group) => {
          const GroupIcon = group.icon;
          return (
            <Card key={group.category} className="p-4 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <GroupIcon className="h-4 w-4 text-gray-500" />
                <span className="font-bold text-sm text-gray-800">{group.category}</span>
                <span className="text-[9px] text-gray-400">{group.endpoints.length} endpoints</span>
              </div>

              <div className="space-y-2">
                {group.endpoints.map((ep) => (
                  <div key={`${ep.method}-${ep.path}`} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
                    <MethodBadge method={ep.method} />
                    <code className="text-xs font-mono text-gray-700 flex-1">{ep.path}</code>
                    <span className="text-[9px] text-gray-400 hidden md:block">{ep.description}</span>
                    <StatusBadge status={ep.status} />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <SectionDivider />

      {/* Auth Details */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.2.2</span>Authentification</h3>
        <p className="text-xs text-gray-400 mb-3">Toutes les requetes API necessitent un header <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">X-API-Key</code></p>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-gray-700">API Key:</span> Variable <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">GHOSTX_API_KEY</code> dans .env — RuntimeError si absente
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-gray-700">Login:</span> POST /api/v1/auth/login avec SHA256 hash — credentials ne sont plus dans le JS bundle
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-gray-700">Rate Limit:</span> 30 req/min par API key — sliding window in-memory
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

function TabBackend() {
  const categories = [...new Set(BACKEND_MODULES.map(m => m.category))];
  const categoryLabels: Record<string, string> = {
    core: "Core — Point d'entree et orchestration",
    config: "Configuration",
    agents: "Agents C-Level",
    framework: "Framework BTML",
    engine: "Engines (COMMAND, Flow, Knowledge)",
    data: "Data Layer (ORM + Wrapper)",
    comms: "Communications (Voice, Phone, WebSocket)",
    docforge: "Documents & DocForge",
    integrations: "Integrations externes",
    business: "Business Logic (Prospect, Meetings, CRM)",
    security: "Securite (RBAC, Sentinel)",
    monitoring: "Monitoring, Media & Outils",
    api: "API REST (FastAPI)",
  };

  return (
    <>
      {/* Message Flow */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.3.1</span>Message Flow — Pipeline de traitement</h3>
        <p className="text-xs text-gray-400 mb-3">Chaque message passe par un pipeline de classification, enrichissement et routage vers le tier optimal</p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Telegram/Web", color: "bg-blue-100 text-blue-700" },
              { label: "bridge.py", color: "bg-gray-100 text-gray-700" },
              { label: "Tier 0 Regex", color: "bg-green-100 text-green-700" },
              { label: "State Machine", color: "bg-violet-100 text-violet-700" },
              { label: "BTMLConnector", color: "bg-orange-100 text-orange-700" },
              { label: "Classificateur", color: "bg-pink-100 text-pink-700" },
              { label: "ContextBuilder", color: "bg-indigo-100 text-indigo-700" },
              { label: "API Call (T0-T4)", color: "bg-red-100 text-red-700" },
              { label: "Knowledge Extract", color: "bg-amber-100 text-amber-700" },
              { label: "Response", color: "bg-emerald-100 text-emerald-700" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-1.5">
                <span className={cn("text-[9px] font-bold px-2 py-1 rounded", step.color)}>{step.label}</span>
                {i < 9 && <ArrowRight className="h-3.5 w-3.5 text-gray-300" />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Tier Routing */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.3.2</span>Routage 5 Tiers — Optimisation cout vs capacite</h3>
        <p className="text-xs text-gray-400 mb-3">Distribution cible: 80%+ sur tiers gratuits, budget max $5/jour</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {[
            { tier: "T0", name: "Regex/Cache", cost: "Gratuit", pct: "30-40%", color: "bg-emerald-500" },
            { tier: "T1", name: "Gemini Flash", cost: "Gratuit", pct: "~30%", color: "bg-emerald-400" },
            { tier: "T2", name: "Gemini Pro", cost: "Gratuit", pct: "~20%", color: "bg-amber-400" },
            { tier: "T3", name: "Claude Sonnet", cost: "$0.01-0.05", pct: "~15%", color: "bg-orange-400" },
            { tier: "T4", name: "Claude Opus", cost: "$0.15-0.60", pct: "~5%", color: "bg-red-400" },
          ].map((t) => (
            <Card key={t.tier} className="p-3 bg-white border border-gray-100 text-center">
              <div className={cn("text-white font-bold text-xs px-2 py-1 rounded mb-2 inline-block", t.color)}>
                {t.tier}
              </div>
              <div className="text-xs font-medium text-gray-700">{t.name}</div>
              <div className="text-[9px] text-gray-400 mt-1">{t.cost}/req</div>
              <div className="text-sm font-bold text-gray-800 mt-1">{t.pct}</div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Modules by Category */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.3.3</span>Modules Python — {BACKEND_MODULES.length} fichiers</h3>
        <p className="text-xs text-gray-400 mb-3">Architecture backend complete — chaque module a une responsabilite unique</p>

        {categories.map((cat) => (
          <div key={cat} className="mb-4">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              {categoryLabels[cat] || cat}
            </div>
            <div className="space-y-1.5">
              {BACKEND_MODULES.filter(m => m.category === cat).map((mod) => (
                <div key={mod.name} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-700 shrink-0 min-w-[200px]">
                    {mod.name}
                  </code>
                  <span className="text-xs text-gray-600 flex-1">{mod.description}</span>
                  <span className="text-[9px] text-gray-400 shrink-0">{mod.lines} lignes</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionDivider />

      {/* State Machine */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.3.4</span>State Machine V2 — 7 etats utilisateur</h3>
        <p className="text-xs text-gray-400 mb-3">JarvisStateMachine dans bridge_state_machine.py — gere le contexte conversationnel</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { state: "DASHBOARD", desc: "Accueil / Navigation" },
            { state: "SELECTION", desc: "Choix de bot/mode" },
            { state: "QUALIFICATION", desc: "Questions diagnostiques" },
            { state: "TRAVAIL_CREDO", desc: "Session CREDO active" },
            { state: "WRAP_UP", desc: "Resume / Delivrable" },
            { state: "ONBOARDING", desc: "Premier contact" },
            { state: "INTERCEPTION", desc: "Commande speciale" },
          ].map((s) => (
            <Card key={s.state} className="p-2.5 bg-white border border-gray-100">
              <code className="text-[9px] font-mono font-bold text-violet-600">{s.state}</code>
              <div className="text-[9px] text-gray-500 mt-0.5">{s.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Session Management */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.3.5</span>Session Management</h3>
        <p className="text-xs text-gray-400 mb-3">Auto-archive a: 8000 tokens OU 50 messages OU 24h idle</p>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Anthropic prompt caching sur SOUL templates — ~90% savings input tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Navigation universelle: lettres (A, N, P, Q, S, B, D, F, T, X, Z, M, R, ?) + chiffres contextuels</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Menu GhostX: G (menu), G1-G12 (activer ghost), G0 (desactiver)</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

function TabDatabase() {
  const totalTables = DB_TABLE_GROUPS.reduce((sum, g) => sum + g.tables.length, 0);
  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.4.1</span>PostgreSQL 16 — Docker (carlosdb) sur VPS2</h3>
        <p className="text-xs text-gray-400 mb-3">
          {totalTables} tables | {DB_TABLE_GROUPS.length} groupes | Port 127.0.0.1:5432 | SQLAlchemy ORM dans <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">database.py</code> (3,047 lignes) | Wrapper <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">bridge_database.py</code> (6,529 lignes)
        </p>
      </div>

      <div className="space-y-6">
        {DB_TABLE_GROUPS.map((group) => (
          <div key={group.group}>
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{group.group}</span>
              <span className="text-[9px] text-gray-400">{group.tables.length} tables</span>
            </div>
            <div className="space-y-2">
              {group.tables.map((table) => (
                <Card key={table.name} className="p-3 bg-white border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-1.5">
                    <code className="text-xs font-mono font-bold text-gray-800">{table.name}</code>
                    <StatusBadge status={table.status} />
                    <span className="text-[9px] text-gray-400">{table.description}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {table.columns.map((col) => {
                      const isPk = col.includes("PK");
                      const isFk = col.includes("FK");
                      const isJson = col.includes("JSONB") || col.includes("ARRAY");
                      const isUnique = col.includes("UNIQUE") && !isPk;
                      return (
                        <span
                          key={col}
                          className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded font-mono",
                            isPk ? "bg-blue-100 text-blue-700 font-bold" :
                            isFk ? "bg-violet-100 text-violet-700" :
                            isUnique ? "bg-teal-100 text-teal-700" :
                            isJson ? "bg-amber-100 text-amber-700" :
                            "bg-white text-gray-600 border border-gray-200"
                          )}
                        >
                          {col}
                        </span>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionDivider />

      {/* DB Access Pattern */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.4.2</span>Pattern d'acces</h3>
        <p className="text-xs text-gray-400 mb-3">bridge_database.py = seul point d'acces — JAMAIS de queries SQL directes ailleurs</p>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span><code className="bg-gray-100 px-1 py-0.5 rounded font-mono">api_rest.py</code> appelle <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">bridge_database.py</code> pour toutes les operations CRUD</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Connection: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">psycopg2</code> avec pool de connexions</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Container Docker: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">carlosdb</code> (PostgreSQL 16 Alpine)</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Pas d'ORM — SQL brut avec parametres pour eviter injections</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Legend */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.4.3</span>Legende des types</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-blue-100 text-blue-700 font-bold">PK</span>
            <span className="text-xs text-gray-500">Cle primaire</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-violet-100 text-violet-700">FK</span>
            <span className="text-xs text-gray-500">Cle etrangere</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-teal-100 text-teal-700">UNIQUE</span>
            <span className="text-xs text-gray-500">Contrainte unique</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-amber-100 text-amber-700">JSONB</span>
            <span className="text-xs text-gray-500">Donnees JSON binaires / ARRAY</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-white text-gray-600 border border-gray-200">colonne</span>
            <span className="text-xs text-gray-500">Colonne standard</span>
          </div>
        </div>
      </div>
    </>
  );
}

function TabInfrastructure() {
  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.5.1</span>Infrastructure — 2 VPS OVH</h3>
        <p className="text-xs text-gray-400 mb-3">Architecture separee DEV / PROD depuis Session 32 (Sprint Securite)</p>
      </div>

      {/* VPS Cards */}
      <div className="space-y-4">
        {INFRA_VPS.map((vps) => (
          <Card key={vps.name} className="p-5 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="h-4 w-4 text-gray-500" />
              <span className="font-bold text-sm text-gray-800">{vps.name}</span>
              <StatusBadge status={vps.status} />
              <Badge variant="outline" className="text-[9px] font-bold">{vps.role}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">IP</div>
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">{vps.ip}</code>
              </div>
              <div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Provider</div>
                <span className="text-xs text-gray-600">{vps.provider}</span>
              </div>
              <div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Storage</div>
                <span className="text-xs text-gray-600">{vps.storage}</span>
              </div>
              <div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">SSH</div>
                <code className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded font-mono break-all">{vps.ssh}</code>
              </div>
              {"domain" in vps && vps.domain && (
                <div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Domain</div>
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">{vps.domain}</code>
                </div>
              )}
              {"ssl" in vps && vps.ssl && (
                <div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">SSL</div>
                  <span className="text-xs text-gray-600">{vps.ssl}</span>
                </div>
              )}
            </div>

            <div>
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Services</div>
              <div className="flex flex-wrap gap-1.5">
                {vps.services.map((svc) => (
                  <span key={svc} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SectionDivider />

      {/* Deploy Pipeline */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.5.2</span>Pipeline de Deploiement</h3>
        <p className="text-xs text-gray-400 mb-3">deploy.sh copie de VPS1 vers VPS2, restart uvicorn et exclut les fichiers sensibles</p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-3">
            {[
              { step: "1", label: "Code dans ~/brain-dev (VPS1)", detail: "Developpement + tests avec Claude Code" },
              { step: "2", label: "Tests: python3 -m pytest test_*.py", detail: "Validation avant deploiement" },
              { step: "3", label: "Frontend: npx vite build", detail: "Build du bundle React (nginx sert dist/ directement)" },
              { step: "4", label: "bash deploy.sh", detail: "scp vers VPS2, exclut .env + credentials + tokens" },
              { step: "5", label: "Restart services sur VPS2", detail: "pkill uvicorn + relance api_rest.py sur :8000" },
              { step: "6", label: "Verification", detail: "CarlOS repond dans Telegram + app.usinebleue.ai accessible" },
            ].map((s, i) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {s.step}
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700">{s.label}</div>
                  <div className="text-[9px] text-gray-400">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Nginx */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.5.3</span>Nginx Configuration</h3>
        <p className="text-xs text-gray-400 mb-3">
          Fichier: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">/etc/nginx/sites-available/usinebleue-app</code>
        </p>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Proxy: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">/api/v1/</code> vers <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">127.0.0.1:8000</code></span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Static: Vite build dans <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">dist/</code></span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Headers: HSTS, CSP, Permissions-Policy (Sprint Securite S32)</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>SSL: Let's Encrypt auto-renew (expires 2026-06-02)</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Systemd */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.5.4</span>Services Systemd</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">brain-bridge (VPS1)</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Telegram bot (bridge.py)</div>
              <div><code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">sudo systemctl restart brain-bridge</code></div>
            </div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">uvicorn API (VPS2)</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>FastAPI REST sur :8000</div>
              <div><code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">pkill -f uvicorn; nohup python3 -m uvicorn api_rest:app ...</code></div>
            </div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">VPS2 Guardian</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Health check 5min, scan daily 7h, backup daily 3h</div>
              <div><code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">~/security-tools/vps1_guardian.py</code></div>
            </div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">LiveKit Agent (VPS1)</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Voice/Video agent dispatch</div>
              <div><code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">python3 carlos_livekit_agent.py dev</code></div>
            </div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">Tim Training (VPS1)</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Check toutes les 15min + scheduled 2x/jour</div>
              <div><code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">tim-training-check.timer + tim-training-scheduled.timer</code></div>
            </div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="font-bold text-xs text-gray-700 mb-2">DocuSeal (VPS1)</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>E-signature Docker container (port 3100, UFW DENY)</div>
              <div><code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">docker container (local only)</code></div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function TabIntegrations() {
  const { setActiveView } = useFrameMaster();
  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.6.1</span>Stack Integrations — {INTEGRATIONS.length} services</h3>
        <p className="text-xs text-gray-400 mb-3">
          LiveKit + ElevenLabs + Deepgram + Telnyx + Tavus + Gemini + Claude + Plane.so + Google Drive
        </p>
      </div>

      {/* Cross-reference: voice/video/telephony details → Stack Communication */}
      <Card className="p-3 bg-teal-50 border-teal-200 shadow-sm mb-4">
        <div className="flex items-start gap-2">
          <Radio className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs text-teal-700">Voice, video, telephonie: details complets dans </span>
            <button
              onClick={() => setActiveView("master-communication")}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
            >
              Stack Communication &rarr;
            </button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {INTEGRATIONS.map((integration) => {
          const IntIcon = integration.icon;
          return (
            <Card key={integration.name} className="p-4 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <IntIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-800">{integration.name}</span>
                    <Badge variant="outline" className="text-[9px] font-medium">{integration.category}</Badge>
                    <StatusBadge status={integration.status} />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{integration.description}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="space-y-1.5">
                  {integration.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ArrowRight className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-gray-600">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

    </>
  );
}

function TabSecurite() {
  const groupedSecurity = SECURITY_ITEMS.reduce<Record<string, typeof SECURITY_ITEMS>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <>
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.7.1</span>Securite — Sprint Securite (Session 32)</h3>
        <p className="text-xs text-gray-400 mb-3">
          {SECURITY_ITEMS.length} mesures deployees | UFW, CORS, API key, rate limit, auth server-side, input validation
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedSecurity).map(([category, items]) => (
          <Card key={category} className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-red-500" />
              <span className="font-bold text-sm text-gray-800">{category}</span>
              <span className="text-[9px] text-gray-400">{items.length} mesures</span>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.item} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-1.5 min-w-[120px]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-medium text-gray-700">{item.item}</span>
                  </div>
                  <span className="text-xs text-gray-500 flex-1">{item.description}</span>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <SectionDivider />

      {/* Commandes de secours */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.7.2</span>Commandes de Secours</h3>
        <p className="text-xs text-gray-400 mb-3">En cas d'urgence — ces commandes sont toujours disponibles</p>

        <div className="space-y-2">
          {[
            { label: "CarlOS est mort?", cmd: "sudo systemctl restart brain-bridge" },
            { label: "Logs en temps reel", cmd: "sudo journalctl -u brain-bridge -f" },
            { label: "Voir les changements", cmd: "git diff" },
            { label: "Annuler tout", cmd: "git checkout -- ." },
            { label: "Lister les backups", cmd: "ls ~/brain-dev-backup-*" },
            { label: "Status du service", cmd: "sudo systemctl status brain-bridge" },
            { label: "Derniers logs", cmd: "sudo journalctl -u brain-bridge --tail 50" },
          ].map((item) => (
            <div key={item.cmd} className="flex items-center gap-3 py-1.5">
              <Terminal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-600 min-w-[160px]">{item.label}</span>
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-700">{item.cmd}</code>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Fichiers critiques */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.7.3</span>Fichiers Critiques — NE JAMAIS modifier sans backup</h3>
        <p className="text-xs text-gray-400 mb-3">Ces fichiers peuvent casser le systeme entier si mal modifies</p>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-1.5">
            {[
              "bridge_btml_connector.py — point d'entree, si ca casse TOUT tombe",
              "bridge.py — Telegram polling et routage",
              "config_bridge.py — configuration centrale",
              "context_builder.py — SOUL templates et contexte",
              ".env — API keys (ANTHROPIC, GOOGLE, TELEGRAM)",
              "systemd service file — gestion du service",
            ].map((file) => (
              <div key={file} className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <code className="text-xs text-gray-700">{file}</code>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Backup Protocol */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.7.4</span>Protocole de Backup</h3>
        <p className="text-xs text-gray-400 mb-3">TOUJOURS backup avant de coder — regle #1 absolue</p>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">1</span>
              <span>Avant tout changement: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">cp -r ~/brain-dev ~/brain-dev-backup-$(date +%Y%m%d_%H%M)</code></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">2</span>
              <span>Snapshot securite: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">snapshots/sprint62_fixes_20260217_1851/</code></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">3</span>
              <span>deploy.sh exclut: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">.env, credentials, tokens</code> du git add</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">4</span>
              <span>VPS2 Guardian: backup automatique daily a 3h</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 8 — CERVEAU BTML
// ═══════════════════════════════════════════════════════════════

function TabCerveauBTML() {
  return (
    <>
      {/* ── A.2.8.1 — C'est quoi le Cerveau BTML? ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.1</span>C'est quoi le Cerveau BTML?</h3>
        <Card className="p-4 bg-gradient-to-b from-violet-50 to-white border border-violet-200 shadow-sm">
          <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
            <p>
              <strong>Imagine un cerveau artificiel</strong> qu'on construit piece par piece, comme un LEGO geant.
              Ce cerveau s'appelle le <strong>Cerveau BTML</strong> — c'est le moteur d'intelligence qui fait
              fonctionner les 12 bots C-Level de CarlOS.
            </p>
            <p>
              Au lieu d'utiliser un cerveau "generique" (comme ChatGPT ou Gemini), on <strong>entraine notre propre
              cerveau</strong> pour qu'il pense comme un dirigeant d'entreprise manufacturiere au Quebec.
              C'est comme la difference entre un medecin generaliste et un specialiste — notre cerveau est un
              <strong> specialiste des PME manufacturieres</strong>.
            </p>
            <p>
              Le cerveau est base sur <strong>DeepSeek-R1</strong>, un modele open-source de 14 milliards de parametres
              (imagine 14 milliards de petits boutons qu'on peut ajuster). On le personnalise avec nos propres
              donnees d'affaires grace a une technique appelee <strong>QLoRA</strong> — au lieu de tout reapprendre
              de zero, on ajuste seulement les boutons les plus importants.
            </p>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ── A.2.8.2 — Le Stack Technique ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.2</span>Le Stack Technique — Les outils du labo</h3>
        <p className="text-xs text-gray-400 mb-3">Tout ce qu'il faut pour construire et entrainer le cerveau, comme les outils dans un atelier</p>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
              <Brain className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Modele de base</span>
            </div>
            <div className="p-3 space-y-1.5 text-xs text-gray-600">
              <div><strong>DeepSeek-R1-Distill-Qwen-14B</strong></div>
              <div>14 milliards de parametres</div>
              <div>Specialise en raisonnement (chain-of-thought)</div>
              <div className="text-[9px] text-gray-400">Open-source — on peut le modifier librement</div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
              <Cpu className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Fine-tuning (QLoRA)</span>
            </div>
            <div className="p-3 space-y-1.5 text-xs text-gray-600">
              <div><strong>r=64, alpha=128</strong>, dropout 0.1</div>
              <div>4-bit NF4 + double quantization</div>
              <div>Ajuste ~2% des parametres (economique)</div>
              <div className="text-[9px] text-gray-400">Comme accorder un piano au lieu d'en construire un neuf</div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <Cloud className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">GPU Cloud (RunPod)</span>
            </div>
            <div className="p-3 space-y-1.5 text-xs text-gray-600">
              <div><strong>A6000 / A40 / L40</strong> — 48GB VRAM</div>
              <div>~5h pour un entrainement complet</div>
              <div>~2-4$ par session (spot instances)</div>
              <div className="text-[9px] text-gray-400">Comme louer un super-ordinateur a l'heure</div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
              <FileCode className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Framework</span>
            </div>
            <div className="p-3 space-y-1.5 text-xs text-gray-600">
              <div><strong>HuggingFace Transformers</strong> + PEFT + TRL</div>
              <div>SFTTrainer (Supervised Fine-Tuning)</div>
              <div>BitsAndBytes pour quantization 4-bit</div>
              <div className="text-[9px] text-gray-400">Les meilleurs outils open-source du marche</div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ── A.2.8.3 — Les 6 Primitives BTML ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.3</span>Les 6 Primitives BTML — L'alphabet du cerveau</h3>
        <p className="text-xs text-gray-400 mb-3">Comme la chimie a ses atomes, BTML a 6 briques de base. Tout ce que le cerveau apprend est construit avec ces 6 pieces.</p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-3 bg-white border border-gray-100 text-center">
            <div className="text-2xl mb-1">🧱</div>
            <div className="text-xs font-bold text-gray-800 mb-1">ELEMENT</div>
            <div className="text-[9px] text-gray-500">Une connaissance, un concept, une donnee</div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100 text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs font-bold text-gray-800 mb-1">CATALYSEUR</div>
            <div className="text-[9px] text-gray-500">Ce qui declenche une transformation (ex: une crise)</div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100 text-center">
            <div className="text-2xl mb-1">🧲</div>
            <div className="text-xs font-bold text-gray-800 mb-1">CHAMP</div>
            <div className="text-[9px] text-gray-500">Le contexte qui influence la reaction (ex: le marche)</div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100 text-center">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-xs font-bold text-gray-800 mb-1">REACTION</div>
            <div className="text-[9px] text-gray-500">Le processus de transformation (ex: diagnostic)</div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100 text-center">
            <div className="text-2xl mb-1">💎</div>
            <div className="text-xs font-bold text-gray-800 mb-1">COMPOSE</div>
            <div className="text-[9px] text-gray-500">Le resultat — une decision, un plan, une strategie</div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100 text-center">
            <div className="text-2xl mb-1">🌊</div>
            <div className="text-xs font-bold text-gray-800 mb-1">RESONANCE</div>
            <div className="text-[9px] text-gray-500">L'impact qui se propage dans l'entreprise</div>
          </Card>
        </div>

        <Card className="p-3 bg-gray-50 border border-gray-200">
          <div className="text-xs text-gray-600 text-center">
            <strong>Pattern Universel:</strong> ELEMENT + CATALYSEUR + CHAMP → <span className="text-red-600 font-bold">REACTION</span> → COMPOSE
          </div>
          <div className="text-[9px] text-gray-400 text-center mt-1">
            Constante PHI (φ) = 1.618033... — le nombre d'or qui calibre les intensites de reaction
          </div>
          <div className="text-[9px] text-gray-400 text-center">
            Fichier: <code className="bg-white px-1 py-0.5 rounded font-mono">btml_primitives.py</code> (297 lignes)
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ── A.2.8.4 — La Fabrique de Données ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.4</span>La Fabrique de Donnees — 38+ generateurs</h3>
        <p className="text-xs text-gray-400 mb-3">
          Pour entrainer un cerveau, il faut de la "nourriture" — des exemples de questions et reponses. On a 38+ scripts Python
          qui fabriquent cette nourriture automatiquement, organises en 6 familles.
        </p>

        <div className="space-y-3">
          <Card className="p-3 bg-white border-l-[3px] border-l-violet-400 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-700">Core BTML</span>
              <Badge variant="outline" className="text-[9px]">8 scripts</Badge>
            </div>
            <div className="text-xs text-gray-600 mb-1">Les fondamentaux: CREDO, Trisociation, 8+1 modes de reflexion, piliers VITAA</div>
            <code className="text-[9px] text-gray-400 font-mono">gen_credo_*, gen_trisociation_*, gen_modes_reflexion_*</code>
          </Card>
          <Card className="p-3 bg-white border-l-[3px] border-l-blue-400 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-700">Business Reality</span>
              <Badge variant="outline" className="text-[9px]">7 scripts</Badge>
            </div>
            <div className="text-xs text-gray-600 mb-1">1000 entreprises simulees, 12 archetypes de CEO, 7 etats emotionnels</div>
            <code className="text-[9px] text-gray-400 font-mono">gen_ghost_racing_*, gen_ceo_archetypes_*, gen_emotional_*</code>
          </Card>
          <Card className="p-3 bg-white border-l-[3px] border-l-red-400 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-700">Contexte Quebec</span>
              <Badge variant="outline" className="text-[9px]">6 scripts</Badge>
            </div>
            <div className="text-xs text-gray-600 mb-1">30,000 manufacturiers QC, expressions quebecoises, realite PME locale</div>
            <code className="text-[9px] text-gray-400 font-mono">gen_quebec_*, gen_secteur_*, gen_francais_*</code>
          </Card>
          <Card className="p-3 bg-white border-l-[3px] border-l-emerald-400 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-700">Applique</span>
              <Badge variant="outline" className="text-[9px]">8 scripts</Badge>
            </div>
            <div className="text-xs text-gray-600 mb-1">SWOT, plans d'affaires, analyse competitive, diagnostics structures</div>
            <code className="text-[9px] text-gray-400 font-mono">gen_swot_*, gen_business_plan_*, gen_competitive_*</code>
          </Card>
          <Card className="p-3 bg-white border-l-[3px] border-l-amber-400 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-700">Avance</span>
              <Badge variant="outline" className="text-[9px]">5 scripts</Badge>
            </div>
            <div className="text-xs text-gray-600 mb-1">Diagnostics multi-departements, scenarios complexes, multi-turn</div>
            <code className="text-[9px] text-gray-400 font-mono">gen_diagnostics_*, gen_training_multi_*, gen_scenario_*</code>
          </Card>
          <Card className="p-3 bg-white border-l-[3px] border-l-pink-400 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-700">Ghost Army</span>
              <Badge variant="outline" className="text-[9px]">4 scripts</Badge>
            </div>
            <div className="text-xs text-gray-600 mb-1">Scraping REEL d'entreprises publiques (TSX + NYSE) via yfinance — donnees financieres live</div>
            <code className="text-[9px] text-gray-400 font-mono">ghost_army.py, ghost_army_pipeline.py</code>
          </Card>
        </div>

        <Card className="p-3 bg-blue-50 border-blue-200 mt-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-bold text-blue-700">Resultat: 52 fichiers JSONL, ~200,000 paires question-reponse</span>
          </div>
          <div className="text-[9px] text-blue-600 mt-1">Chaque paire = une question + la reponse ideale que le cerveau doit apprendre</div>
        </Card>
      </div>

      <SectionDivider />

      {/* ── A.2.8.5 — Ghost Army & Ghost Racing ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.5</span>Ghost Army & Ghost Racing — Les simulateurs</h3>
        <p className="text-xs text-gray-400 mb-3">Comme un simulateur de vol entraine un pilote sans risque, nos simulateurs creent des scenarios d'affaires realistes.</p>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-600 to-pink-500">
              <Globe className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Ghost Army</span>
            </div>
            <div className="p-3 space-y-2 text-xs text-gray-600">
              <p><strong>Armee de fantomes</strong> qui espionne les entreprises publiques pour apprendre d'elles.</p>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                  <span>40 tickers TSX + 50 tickers NYSE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                  <span>Scraping via yfinance (cours, revenue, marges)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                  <span>Genere des scenarios d'affaires reels</span>
                </div>
              </div>
              <code className="text-[9px] text-gray-400 font-mono block">ghost_army.py (644L) + ghost_army_pipeline.py (733L)</code>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-500">
              <Activity className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Ghost Racing V2</span>
            </div>
            <div className="p-3 space-y-2 text-xs text-gray-600">
              <p><strong>Course de fantomes</strong> — 1000 entreprises fictives qui s'affrontent en simulation.</p>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  <span>5 tiers de complexite (micro → corporation)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  <span>12 archetypes de CEO (567 lignes de profils)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  <span>7 etats emotionnels (stress, euphorie, doute...)</span>
                </div>
              </div>
              <code className="text-[9px] text-gray-400 font-mono block">ghost_racing_engine_v2.py (~600L)</code>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ── A.2.8.6 — L'Assemblage du Dataset ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.6</span>L'Assemblage — Du vrac au repas complet</h3>
        <p className="text-xs text-gray-400 mb-3">
          Tous les fichiers JSONL sont melanges, nettoyes et organises en un seul dataset d'entrainement.
          Comme assembler les ingredients d'une recette avant de cuisiner.
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-3">
            {[
              { step: "1", label: "Collecte", detail: "52 fichiers JSONL sont lus depuis le dossier data/" },
              { step: "2", label: "Nettoyage", detail: "Doublons elimines, format normalise, encodage verifie" },
              { step: "3", label: "Melange", detail: "Les donnees sont shufflees (melangees aleatoirement)" },
              { step: "4", label: "Split", detail: "95% entrainement (80,991 paires) + 5% evaluation (4,263 paires)" },
              { step: "5", label: "Export", detail: "master_train.jsonl + master_eval.jsonl — prets pour RunPod" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {s.step}
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700">{s.label}</div>
                  <div className="text-[9px] text-gray-400">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex items-center gap-2 mt-3">
          <code className="text-[9px] text-gray-400 font-mono">assemble_dataset_trinal.py</code>
          <span className="text-[9px] text-gray-400">(439L)</span>
          <span className="text-[9px] text-gray-400">+</span>
          <code className="text-[9px] text-gray-400 font-mono">assemble_dataset_v5.py</code>
          <span className="text-[9px] text-gray-400">(623L)</span>
        </div>
      </div>

      <SectionDivider />

      {/* ── A.2.8.7 — L'Entraînement sur RunPod ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.7</span>L'Entrainement — La cuisson du cerveau</h3>
        <p className="text-xs text-gray-400 mb-3">
          On loue un super-ordinateur avec GPU sur RunPod, on lui donne le dataset, et il ajuste les parametres du modele.
          Comme cuire un gateau: les ingredients (donnees) + le four (GPU) + la recette (hyperparametres) = le cerveau entraine.
        </p>

        <Card className="p-0 overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-red-500">
            <Zap className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Hyperparametres — La recette exacte</span>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
              {[
                ["Methode", "QLoRA (Quantized Low-Rank Adaptation)"],
                ["Rank (r)", "64 — complexite de l'adaptation"],
                ["Alpha", "128 — force de l'apprentissage"],
                ["Dropout", "0.1 — previent la memorisation bete"],
                ["Quantization", "4-bit NF4 + double quant"],
                ["Epochs", "1 — un seul passage sur les donnees"],
                ["Batch size", "4 (avec gradient accumulation 4)"],
                ["Learning rate", "2e-4 avec cosine scheduler"],
                ["Max sequence", "2048 tokens"],
                ["GPU requis", "48GB VRAM minimum (A6000/A40/L40)"],
                ["Duree", "~5 heures pour 80K paires"],
                ["Cout", "~2-4$ par session (spot instances)"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-1.5 py-1 border-b border-gray-50">
                  <span className="text-[9px] font-bold text-gray-500 min-w-[90px]">{label}</span>
                  <span className="text-[9px] text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <code className="text-[9px] text-gray-400 font-mono">scripts/finetune_deepseek_trinal.py</code>
        <span className="text-[9px] text-gray-400 ml-1">(403 lignes) — le script qui tourne sur RunPod</span>
      </div>

      <SectionDivider />

      {/* ── A.2.8.8 — Tim, le Robot Entraîneur ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.8</span>Tim (CTOB) — Le Robot Entraineur</h3>
        <p className="text-xs text-gray-400 mb-3">
          Tim est le CTO Bot. Son travail: gerer tout le cycle d'entrainement automatiquement, sans intervention humaine.
          Il lit ses missions depuis la base de donnees, les execute, et notifie Carl du resultat.
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm mb-3">
          <div className="text-xs font-bold text-gray-700 mb-3">7 commandes de Tim:</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { cmd: "launch", desc: "Demarre un entrainement sur RunPod" },
              { cmd: "check", desc: "Verifie l'etat du pod (toutes les 15 min)" },
              { cmd: "harvest", desc: "Recupere le modele termine" },
              { cmd: "status", desc: "Rapport de situation complet" },
              { cmd: "scheduled", desc: "Verification planifiee (2x/jour)" },
              { cmd: "sweep", desc: "Nettoie les pods zombies" },
              { cmd: "abort", desc: "Arrete un entrainement en urgence" },
            ].map((c) => (
              <div key={c.cmd} className="flex items-center gap-2 py-1.5 border-b border-gray-50">
                <code className="text-[9px] font-mono font-bold text-violet-600 min-w-[70px]">{c.cmd}</code>
                <span className="text-[9px] text-gray-500">{c.desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 bg-white border border-gray-100">
            <div className="text-xs font-bold text-gray-700 mb-1">Systemd Timers</div>
            <div className="text-[9px] text-gray-500 space-y-1">
              <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" /><span>Check: toutes les 15 minutes</span></div>
              <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" /><span>Scheduled: 2x par jour</span></div>
              <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" /><span>Sweep: nettoyage pods zombies</span></div>
            </div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="text-xs font-bold text-gray-700 mb-1">Lifecycle Modele</div>
            <div className="text-[9px] text-gray-500 space-y-1">
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" /><span>DEV → test sur VPS1</span></div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" /><span>14 questions de validation</span></div>
              <div className="flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" /><span>PROD → deploye sur VPS2 via SSH</span></div>
            </div>
          </Card>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <code className="text-[9px] text-gray-400 font-mono">tim_training_ops.py</code>
          <span className="text-[9px] text-gray-400">(849L)</span>
          <span className="text-[9px] text-gray-400">+</span>
          <code className="text-[9px] text-gray-400 font-mono">brain_model_manager.py</code>
          <span className="text-[9px] text-gray-400">(467L)</span>
        </div>
      </div>

      <SectionDivider />

      {/* ── A.2.8.9 — Trial-Brain: Les 3 Phases Cognitives ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.9</span>Trial-Brain — Les 3 Phases Cognitives</h3>
        <p className="text-xs text-gray-400 mb-3">
          La version la plus avancee du cerveau BTML. Au lieu de juste repondre, il pense en 3 phases,
          comme un scientifique qui a une intuition, la teste, puis valide sa decouverte.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-0 overflow-hidden border-2 border-amber-200">
            <div className="bg-gradient-to-b from-amber-50 to-white px-3 py-2 border-b text-center">
              <div className="text-lg font-bold">⚡</div>
              <div className="text-xs font-bold text-amber-700">[IMPULSION]</div>
              <div className="text-[9px] text-amber-500 mt-0.5">Phase 1 — L'intuition</div>
            </div>
            <div className="p-3 text-[9px] text-gray-600 space-y-1">
              <p>Le cerveau capte le probleme et genere une <strong>premiere reaction instinctive</strong>.</p>
              <p>Comme un entrepreneur qui "sent" qu'il y a un probleme avant de pouvoir l'expliquer.</p>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden border-2 border-red-200">
            <div className="bg-gradient-to-b from-red-50 to-white px-3 py-2 border-b text-center">
              <div className="text-lg font-bold">🔥</div>
              <div className="text-xs font-bold text-red-700">[RESISTANCE]</div>
              <div className="text-[9px] text-red-500 mt-0.5">Phase 2 — Le test</div>
            </div>
            <div className="p-3 text-[9px] text-gray-600 space-y-1">
              <p>Le cerveau <strong>challenge sa propre intuition</strong>. Il cherche les failles, les contre-arguments.</p>
              <p>Comme un avocat du diable interne — "est-ce que tu es sur de ca?"</p>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden border-2 border-violet-200">
            <div className="bg-gradient-to-b from-violet-50 to-white px-3 py-2 border-b text-center">
              <div className="text-lg font-bold">🌊</div>
              <div className="text-xs font-bold text-violet-700">[RESONANCE]</div>
              <div className="text-[9px] text-violet-500 mt-0.5">Phase 3 — La synthese</div>
            </div>
            <div className="p-3 text-[9px] text-gray-600 space-y-1">
              <p>Le cerveau <strong>fusionne intuition + critique</strong> en une reponse robuste et nuancee.</p>
              <p>Comme un CEO qui a ecoute tous les avis et prend sa decision finale.</p>
            </div>
          </Card>
        </div>

        <Card className="p-3 bg-gray-50 border border-gray-200">
          <div className="text-xs text-gray-600 text-center">
            <strong>Pattern 3-6-9 (Tesla G9):</strong> 3 phases × structure 3-6-9 = calibration naturelle des reponses
          </div>
          <div className="text-[9px] text-gray-400 text-center mt-1">
            80,991 paires d'entrainement + 4,263 paires d'evaluation — la plus grosse version du cerveau
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ── A.2.8.10 — Le Cycle Perpétuel ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.10</span>Le Moteur Perpetuel — Le cerveau qui s'ameliore tout seul</h3>
        <p className="text-xs text-gray-400 mb-3">
          Le Graal: un systeme autonome qui scrape, genere, assemble, entraine, et recommence — 24h/24, sans intervention humaine.
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            {["🌐 Scrape", "→", "📝 Genere", "→", "📦 Assemble", "→", "🧠 Entraine", "→", "✅ Valide", "→", "🚀 Deploie", "→", "😴 Dort", "→", "🔁"].map((item, i) => (
              <span key={i} className={cn(
                "text-xs",
                item === "→" || item === "🔁" ? "text-gray-300 font-bold" : "font-medium bg-gray-50 px-2 py-1 rounded border border-gray-100",
              )}>
                {item}
              </span>
            ))}
          </div>
          <div className="text-[9px] text-gray-400 text-center">
            <code className="font-mono">ghml_perpetual_engine.py</code> (~400 lignes) — Daemon autonome, cycle 24h
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ── A.2.8.11 — Historique des Versions ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.11</span>Historique des Versions du Cerveau</h3>

        <div className="space-y-2">
          {[
            { version: "V1", date: "Fev 2026", dataset: "~2,000", desc: "Premier prototype — QLoRA basique sur DeepSeek-R1-14B", status: "live" as const },
            { version: "V2", date: "Fev 2026", dataset: "~4,000", desc: "Ghost Racing ajoute — archetypes CEO", status: "live" as const },
            { version: "V3", date: "Fev 2026", dataset: "~6,000", desc: "Multi-turn conversations + contexte quebecois", status: "live" as const },
            { version: "V4", date: "Fev 2026", dataset: "~7,000", desc: "Etats emotionnels + scenarios avances", status: "live" as const },
            { version: "V5", date: "Mars 2026", dataset: "8,091", desc: "Assembleur V5 — donnees enrichies + Ghost Army V1", status: "live" as const },
            { version: "V6", date: "Mars 2026", dataset: "~30,000", desc: "Ghost Army pipeline complet — scraping reel TSX/NYSE", status: "live" as const },
            { version: "V7", date: "Mars 2026", dataset: "~50,000", desc: "Perdu a 77% — mission 102 completee (crash GPU)", status: "en-cours" as const },
            { version: "Trial-Brain V1", date: "Mars 2026", dataset: "80,991", desc: "3 phases cognitives [IMPULSION/RESISTANCE/RESONANCE] + pattern 3-6-9", status: "en-cours" as const },
          ].map((v) => (
            <Card key={v.version} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="min-w-[100px]">
                  <div className="text-xs font-bold text-gray-800">{v.version}</div>
                  <div className="text-[9px] text-gray-400">{v.date}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-600">{v.desc}</div>
                </div>
                <div className="text-right min-w-[70px]">
                  <div className="text-xs font-bold text-violet-600">{v.dataset}</div>
                  <div className="text-[9px] text-gray-400">paires</div>
                </div>
                <StatusBadge status={v.status} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── A.2.8.12 — Fichiers Clés ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.12</span>Fichiers Cles du Cerveau BTML</h3>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-1.5">
            {[
              { file: "btml_primitives.py", lines: "297", desc: "6 primitives + constante PHI + pattern universel" },
              { file: "tim_training_ops.py", lines: "849", desc: "Bot executor — 7 commandes (launch/check/harvest/...)" },
              { file: "brain_model_manager.py", lines: "467", desc: "Lifecycle DEV→PROD + 14 questions de validation" },
              { file: "ghost_army_pipeline.py", lines: "733", desc: "Pipeline 4 phases + deploy_model_to_dev()" },
              { file: "ghost_army.py", lines: "644", desc: "Scraper yfinance (40 TSX + 50 NYSE)" },
              { file: "ghost_racing_engine_v2.py", lines: "~600", desc: "1000 entreprises × 12 archetypes × 7 emotions" },
              { file: "ghml_perpetual_engine.py", lines: "~400", desc: "Daemon autonome — cycle perpetuel 24h" },
              { file: "assemble_dataset_trinal.py", lines: "439", desc: "Assembleur master (80,991 paires)" },
              { file: "scripts/finetune_deepseek_trinal.py", lines: "403", desc: "Script QLoRA pour RunPod" },
              { file: "data/ceo_archetypes.py", lines: "567", desc: "12 archetypes de CEO" },
              { file: "data/emotional_states.py", lines: "418", desc: "7 etats cognitifs" },
              { file: "data/quebec_context.py", lines: "571", desc: "Contexte PME Quebec (30K manufacturiers)" },
            ].map((f) => (
              <div key={f.file} className="flex items-center gap-3 py-1 border-b border-gray-50 last:border-0">
                <code className="text-[9px] font-mono font-bold text-gray-700 min-w-[220px]">{f.file}</code>
                <span className="text-[9px] text-violet-600 font-bold min-w-[35px]">{f.lines}L</span>
                <span className="text-[9px] text-gray-500">{f.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ── A.2.8.13 — ROADMAP du Cerveau BTML ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">A.2.8.13</span>Roadmap — Vers un Cerveau BTML Super Performant</h3>
        <p className="text-xs text-gray-400 mb-3">Le plan pour passer d'un cerveau "bon" a un cerveau "exceptionnel" — plus de donnees, plus de puissance, plus d'autonomie.</p>

        {/* Phase 1 */}
        <Card className="p-0 overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
            <Zap className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Phase 1 — Cerveau V2</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-blue-800">1-3 mois</span>
          </div>
          <div className="p-3 space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span><strong>80K → 500K paires</strong> — Ghost Army couvre 500+ entreprises (TSX + NYSE + NASDAQ)</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span><strong>Evaluation systematique</strong> — Benchmarks MMLU + reasoning + metriques business-specific</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span><strong>Pipeline DEV→STAGING→PROD</strong> — Tests automatises avant chaque promotion</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span><strong>Feedback loop V1</strong> — Les corrections manuelles de Carl nourrissent le prochain dataset</span>
            </div>
          </div>
        </Card>

        {/* Phase 2 */}
        <Card className="p-0 overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
            <Brain className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Phase 2 — Cerveau V3</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-violet-800">3-6 mois</span>
          </div>
          <div className="p-3 space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
              <span><strong>Modele plus puissant</strong> — Migration vers Qwen2.5-72B ou Llama 3.1 70B (5× plus de parametres)</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
              <span><strong>Mixture of Experts (MoE)</strong> — Chaque bot = un expert specialise (CFO = finance, CMO = marketing)</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
              <span><strong>RAG integre</strong> — Les bots consultent la base de connaissances entreprise en temps reel</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
              <span><strong>Feedback loop auto</strong> — Les interactions en production ameliorent le dataset automatiquement (DPO)</span>
            </div>
          </div>
        </Card>

        {/* Phase 3 */}
        <Card className="p-0 overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <Atom className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Phase 3 — Cerveau V4 "Full Autonomy"</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-emerald-800">6-12 mois</span>
          </div>
          <div className="p-3 space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Multi-modal</strong> — Texte + image + voix + video dans un seul cerveau</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Agent autonome</strong> — Le cerveau execute des actions (pas juste du texte) via COMMAND</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Self-improvement</strong> — Le modele genere ses propres donnees d'entrainement (RLHF/DPO loop)</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Cluster GPU dedie</strong> — Plus de RunPod spot — infrastructure propre pour stabilite</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Objectif</strong> — Outperform GPT-4 sur les taches PME manufacturing (benchmark dedie)</span>
            </div>
          </div>
        </Card>

        {/* Stack Idéal Futur */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-700">
            <Cpu className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Stack Ideal Futur</span>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
              {[
                ["Base model", "DeepSeek-V3 ou Qwen3 (128K context)"],
                ["Training", "Full fine-tune sur 8×H100 (pas juste LoRA)"],
                ["Inference", "vLLM ou TensorRT-LLM (latence <100ms)"],
                ["Architecture", "MoE avec routing BTML (1 expert par bot)"],
                ["Dataset", "1M+ paires, feedback loop production"],
                ["Ghost Army", "5,000+ entreprises scrapees en continu"],
                ["Evaluation", "Benchmark PME dedie + MMLU + HumanEval"],
                ["Budget cible", "<50$/mois (economies d'echelle GPU)"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-1.5 py-1.5 border-b border-gray-50">
                  <span className="text-[9px] font-bold text-gray-500 min-w-[90px]">{label}</span>
                  <span className="text-[9px] text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function BibleTechniquePage() {
  const [tab, setTab] = useState("bots-skills");
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Server}
          iconColor="text-emerald-600"
          title="Bible Technique BTML"
          subtitle="Reference technique complete — Bots, API, Backend, DB, Infra, Integrations, Securite, Cerveau BTML"
          onBack={() => setActiveView("dashboard")}
          rightSlot={
            <>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    tab === t.id
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </>
          }
        />
      }
    >
      {tab === "bots-skills" && <TabBotsSkills />}
      {tab === "api-endpoints" && <TabApiEndpoints />}
      {tab === "backend" && <TabBackend />}
      {tab === "database" && <TabDatabase />}
      {tab === "infra" && <TabInfrastructure />}
      {tab === "integrations" && <TabIntegrations />}
      {tab === "securite" && <TabSecurite />}
      {tab === "cerveau-btml" && <TabCerveauBTML />}
    </PageLayout>
  );
}
