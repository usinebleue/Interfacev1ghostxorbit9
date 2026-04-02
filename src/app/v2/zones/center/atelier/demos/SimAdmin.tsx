"use client";

/**
 * SimAdmin.tsx — Simulation du panneau Admin (B4)
 * 12 stages: dashboard → utilisateurs → packages → monitoring → parametres
 *   → telephonie → securite → trial-brain → api-usage → notifications → billing → carlos-guide
 * Self-contained: TopBar, sub-tabs, split-screen 40/60, SBubble/SBtn/AutoAdvance
 */

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Home,
  Building2,
  Users,
  Brain,
  Globe,
  Shield,
  MessageSquare,
  Target,
  CheckCircle2,
  Send,
  BarChart3,
  TrendingUp,
  Zap,
  Settings,
  Activity,
  Clock,
  ArrowRight,
  Crown,
  AlertTriangle,
  Phone,
  Lock,
  Server,
  Database,
  Bell,
  CreditCard,
  UserPlus,
  UserCheck,
  Eye,
  FileText,
  Wifi,
  HardDrive,
  Cpu,
  Key,
  RefreshCw,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";

const UB_BLUE = "#073E5A";

type Stage =
  | "dashboard-admin"
  | "utilisateurs"
  | "packages"
  | "monitoring"
  | "parametres"
  | "telephonie"
  | "securite"
  | "trial-brain"
  | "api-usage"
  | "notifications"
  | "billing"
  | "carlos-guide";

const STAGE_ORDER: Stage[] = [
  "dashboard-admin", "utilisateurs", "packages", "monitoring", "parametres",
  "telephonie", "securite", "trial-brain", "api-usage", "notifications",
  "billing", "carlos-guide",
];

const STAGE_LABELS: Record<Stage, string> = {
  "dashboard-admin": "Dashboard Admin",
  utilisateurs: "Utilisateurs",
  packages: "Packages",
  monitoring: "Monitoring",
  parametres: "Parametres",
  telephonie: "Telephonie",
  securite: "Securite",
  "trial-brain": "Trial-Brain",
  "api-usage": "Usage API",
  notifications: "Notifications",
  billing: "Facturation",
  "carlos-guide": "CarlOS Guide",
};

// Mock users
const MOCK_USERS = [
  { nom: "Carl Fugere", email: "carl@usinebleue.ai", role: "Admin", derniere: "Il y a 5 min", actif: true },
  { nom: "Marie-Eve L.", email: "marie@usinebleue.ai", role: "Manager", derniere: "Il y a 2h", actif: true },
  { nom: "Jean-Philippe R.", email: "jp@usinebleue.ai", role: "Utilisateur", derniere: "Hier", actif: true },
  { nom: "Sophie T.", email: "sophie@usinebleue.ai", role: "Utilisateur", derniere: "3 jours", actif: false },
  { nom: "Antoine B.", email: "antoine@usinebleue.ai", role: "Utilisateur", derniere: "Il y a 1h", actif: true },
];

// API logs mock
const API_LOGS = [
  { time: "10:42:31", endpoint: "/api/v1/chat", status: 200, latence: "234ms", bot: "CEOB" },
  { time: "10:42:28", endpoint: "/api/v1/missions", status: 200, latence: "89ms", bot: "CTOB" },
  { time: "10:42:15", endpoint: "/api/v1/chat", status: 200, latence: "312ms", bot: "CMOB" },
  { time: "10:41:58", endpoint: "/api/v1/documents", status: 200, latence: "45ms", bot: "CFOB" },
  { time: "10:41:42", endpoint: "/api/v1/chat", status: 429, latence: "12ms", bot: "CROB" },
  { time: "10:41:30", endpoint: "/api/v1/voice/event", status: 200, latence: "67ms", bot: "CEOB" },
];

export function SimAdmin({ onBack }: { onBack?: () => void }) {
  const [stage, setStage] = useState<Stage>("dashboard-admin");
  const chatRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);
  const goNext = (s: Stage) => setStage(s);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage]);

  const chatContent = (
    <div className="space-y-3">
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          <TypewriterText text="Bienvenue dans l'Admin. Ici tu geres ton instance CarlOS: utilisateurs, securite, monitoring, telephonie et facturation. Tout est sous controle." speed={8}
            onComplete={() => si === 0 && setTimeout(() => goNext("utilisateurs"), 2500)} />
          {si === 0 && <AutoAdvance onComplete={() => goNext("utilisateurs")} delay={6000} />}
        </SBubble>
      )}

      {si >= 1 && (
        <SBubble code="CEOB" collapsed={si > 1}>
          <TypewriterText text="5 utilisateurs sur ton instance. Carl (Admin), Marie-Eve (Manager), 3 utilisateurs standards. Sophie est inactive depuis 3 jours — tu veux la relancer?" speed={8}
            onComplete={() => {}} />
          {si === 1 && <SBtn onClick={() => goNext("packages")} icon={CreditCard} label="Voir les packages" />}
        </SBubble>
      )}

      {si >= 2 && (
        <SBubble code="CEOB" collapsed={si > 2}>
          <TypewriterText text="Tu es sur le plan Pioneer (99$/mois). Il inclut 12 bots, 5 utilisateurs, telephonie, et 500 missions/mois. Tu en as utilise 347 ce mois-ci." speed={8}
            onComplete={() => {}} />
          {si === 2 && <SBtn onClick={() => goNext("monitoring")} icon={Activity} label="Voir le monitoring" />}
        </SBubble>
      )}

      {si >= 3 && (
        <SBubble code="CTOB" collapsed={si > 3}>
          <TypewriterText text="Monitoring en temps reel: API latence moyenne 156ms, uptime 99.7% sur 30 jours. 1 erreur 429 (rate limit) il y a 13 minutes — rien de critique. Le systeme est stable." speed={8}
            onComplete={() => {}} />
          {si === 3 && <SBtn onClick={() => goNext("parametres")} icon={Settings} label="Parametres instance" />}
        </SBubble>
      )}

      {si >= 4 && (
        <SBubble code="CEOB" collapsed={si > 4}>
          <TypewriterText text="Parametres de ton instance: nom, logo, couleurs, timezone (EST), langue (Francais). Tu peux personnaliser l'apparence pour tes utilisateurs." speed={8}
            onComplete={() => {}} />
          {si === 4 && <SBtn onClick={() => goNext("telephonie")} icon={Phone} label="Configuration telephonie" />}
        </SBubble>
      )}

      {si >= 5 && (
        <SBubble code="CEOB" collapsed={si > 5}>
          <TypewriterText text="Telephonie Telnyx active. Numero: +1 438-544-5442. SIP configure, NIP actif. 23 appels ce mois-ci, duree moyenne 4.2 minutes. Cout: 3.47$." speed={8}
            onComplete={() => {}} />
          {si === 5 && <SBtn onClick={() => goNext("securite")} icon={Lock} label="Securite" />}
        </SBubble>
      )}

      {si >= 6 && (
        <SBubble code="CISOB" collapsed={si > 6}>
          <TypewriterText text="Securite: API key rotee il y a 14 jours. UFW actif, CORS restrictif, rate limit 30/min. 0 tentative d'intrusion detectee. Audit log: 1,247 actions ce mois. Tout est vert." speed={8}
            onComplete={() => {}} />
          {si === 6 && <SBtn onClick={() => goNext("trial-brain")} icon={Brain} label="Trial-Brain (God Mode)" />}
        </SBubble>
      )}

      {si >= 7 && (
        <SBubble code="CTOB" collapsed={si > 7}>
          <TypewriterText text="Trial-Brain: entrainement IA interne. Run V8 en cours — DeepSeek-R1 14B, 351 steps, loss 0.42. Dataset: 2,847 exemples. Prochain run planifie dans 6 heures." speed={8}
            onComplete={() => {}} />
          {si === 7 && <SBtn onClick={() => goNext("api-usage")} icon={BarChart3} label="Usage API" />}
        </SBubble>
      )}

      {si >= 8 && (
        <SBubble code="CFOB" collapsed={si > 8}>
          <TypewriterText text="Usage API ce mois: Gemini Flash 68% (gratuit), Gemini Pro 18% (gratuit), Claude Sonnet 11% (4.23$), Claude Opus 3% (2.87$). Total: 7.10$/mois. Budget cible: 15$/mois — tu es bien en dessous." speed={8}
            onComplete={() => {}} />
          {si === 8 && <SBtn onClick={() => goNext("notifications")} icon={Bell} label="Notifications" />}
        </SBubble>
      )}

      {si >= 9 && (
        <SBubble code="CEOB" collapsed={si > 9}>
          <TypewriterText text="Notifications configurees: email pour alertes critiques, Telegram pour les rapports bots, in-app pour tout le reste. Tu recois en moyenne 12 notifs/jour." speed={8}
            onComplete={() => {}} />
          {si === 9 && <SBtn onClick={() => goNext("billing")} icon={CreditCard} label="Facturation" />}
        </SBubble>
      )}

      {si >= 10 && (
        <SBubble code="CFOB" collapsed={si > 10}>
          <TypewriterText text="Facturation: plan Pioneer 99$/mois + usage API 7.10$ + telephonie 3.47$ = 109.57$/mois total. Prochain paiement le 1er avril. Carte Visa se terminant par 4242." speed={8}
            onComplete={() => {}} />
          {si === 10 && <SBtn onClick={() => goNext("carlos-guide")} icon={CheckCircle2} label="Recapitulatif" />}
        </SBubble>
      )}

      {si >= 11 && (
        <SBubble code="CEOB" collapsed={false}>
          <TypewriterText text="Ton instance est en bonne sante. Uptime 99.7%, securite OK, budget sous controle (109.57$/mois), 5 utilisateurs actifs. Besoin d'aide pour configurer quelque chose?" speed={8}
            onComplete={() => {}} />
        </SBubble>
      )}
    </div>
  );

  function RightContent() {
    switch (stage) {
      case "dashboard-admin": return <ContentDashboard />;
      case "utilisateurs": return <ContentUtilisateurs />;
      case "packages": return <ContentPackages />;
      case "monitoring": return <ContentMonitoring />;
      case "parametres": return <ContentParametres />;
      case "telephonie": return <ContentTelephonie />;
      case "securite": return <ContentSecurite />;
      case "trial-brain": return <ContentTrialBrain />;
      case "api-usage": return <ContentApiUsage />;
      case "notifications": return <ContentNotifications />;
      case "billing": return <ContentBilling />;
      case "carlos-guide": return <ContentGuide />;
      default: return null;
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden text-[9px]">
      {/* Sim header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b">
        <div className="flex items-center gap-2">
          <button onClick={() => onBack ? onBack() : window.history.back()} className="text-gray-400 hover:text-gray-600 cursor-pointer"><ArrowLeft className="h-3.5 w-3.5" /></button>
          <span className="font-bold text-[11px]">Simulation — Administration</span>
        </div>
        <div className="flex items-center gap-1.5">
          {STAGE_ORDER.map((s, i) => (
            <div key={s} className={cn("w-1.5 h-1.5 rounded-full transition-colors", i < si ? "bg-blue-500" : i === si ? "bg-blue-600 ring-2 ring-blue-200" : "bg-gray-200")} title={STAGE_LABELS[s]} />
          ))}
          <button onClick={() => setStage("dashboard-admin")} className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="h-0.5 bg-gradient-to-r from-gray-500 via-blue-500 to-gray-400" />

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Chat 40% */}
        <div className="w-[40%] flex flex-col border-r bg-white">
          <div className="h-12 flex items-center px-3 gap-2 text-white shrink-0" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate">Administration</p>
              <p className="text-[8px] opacity-70">CarlOS — Gestion instance</p>
            </div>
            <MessageSquare className="h-4 w-4 opacity-60" />
          </div>

          <div className="h-7 flex items-center px-3 gap-2 bg-gray-100 border-b border-gray-200">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-[9px] font-medium text-gray-700">Admin</span>
            <span className="text-[8px] text-gray-400 ml-auto">{STAGE_LABELS[stage]}</span>
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {chatContent}
          </div>

          <div className="border-t px-3 py-2 flex items-center gap-2">
            <input type="text" placeholder="Question admin..." className="flex-1 text-[9px] bg-gray-50 rounded-full px-3 py-1.5 border outline-none focus:ring-1 focus:ring-blue-300" readOnly />
            <Send className="h-3.5 w-3.5 text-gray-300" />
          </div>
        </div>

        {/* RIGHT — Content 60% */}
        <div className="w-[60%] flex flex-col overflow-hidden">
          <div className="h-10 flex items-center px-3 gap-1 text-white shrink-0" style={{ backgroundColor: UB_BLUE }}>
            {[
              { icon: Home, label: "Accueil" },
              { icon: Building2, label: "Mon Departement" },
              { icon: Users, label: "Mes Salles" },
              { icon: Brain, label: "Mon Equipe" },
              { icon: Globe, label: "Mon Reseau" },
              { icon: Shield, label: "Admin", active: true },
            ].map(n => (
              <div key={n.label} className={cn(
                "flex items-center gap-1 px-2 py-1 rounded text-[9px] cursor-pointer transition-colors",
                n.active ? "bg-white/20 font-bold" : "opacity-60 hover:opacity-80"
              )}>
                <n.icon className="h-3.5 w-3.5" />{n.label}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 bg-white border-b overflow-x-auto">
            {[
              { label: "Dashboard", stage: "dashboard-admin" as Stage },
              { label: "Utilisateurs", stage: "utilisateurs" as Stage },
              { label: "Monitoring", stage: "monitoring" as Stage },
              { label: "Securite", stage: "securite" as Stage },
              { label: "Telephonie", stage: "telephonie" as Stage },
              { label: "Facturation", stage: "billing" as Stage },
              { label: "Trial-Brain", stage: "trial-brain" as Stage },
            ].map(t => (
              <button key={t.label} onClick={() => goNext(t.stage)}
                className={cn("px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer",
                  t.stage === stage ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            <RightContent />
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // CONTENT COMPONENTS
  // ═══════════════════════════════════════

  function ContentDashboard() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Dashboard Administration</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: "Utilisateurs", val: "5", icon: Users, color: "text-blue-600" },
            { label: "Missions/mois", val: "347", icon: Target, color: "text-emerald-600" },
            { label: "Cout API", val: "7.10$", icon: BarChart3, color: "text-amber-600" },
            { label: "Uptime", val: "99.7%", icon: Activity, color: "text-emerald-600" },
          ].map(k => (
            <div key={k.label} className="bg-white border rounded-lg p-2.5 text-center">
              <k.icon className={cn("h-4 w-4 mx-auto mb-1", k.color)} />
              <p className={cn("text-sm font-bold", k.color)}>{k.val}</p>
              <p className="text-[7px] text-gray-400">{k.label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border rounded-lg p-3">
            <p className="text-[9px] font-bold mb-2">Activite recente</p>
            {[
              { action: "Carl a lance une mission COMMAND", time: "Il y a 5 min" },
              { action: "Tim a complete l'audit infra", time: "Il y a 23 min" },
              { action: "Marie-Eve a invite Jean-Philippe", time: "Il y a 1h" },
              { action: "Frank a genere le rapport Q3", time: "Il y a 2h" },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b last:border-0">
                <span className="text-[8px] text-gray-600">{a.action}</span>
                <span className="text-[7px] text-gray-400">{a.time}</span>
              </div>
            ))}
          </div>
          <div className="bg-white border rounded-lg p-3">
            <p className="text-[9px] font-bold mb-2">Sante systeme</p>
            {[
              { label: "API REST", status: "ok" },
              { label: "PostgreSQL", status: "ok" },
              { label: "LiveKit Voice", status: "ok" },
              { label: "Telnyx SIP", status: "ok" },
              { label: "Gemini API", status: "ok" },
              { label: "Claude API", status: "warning" },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b last:border-0">
                <span className="text-[8px] text-gray-600">{s.label}</span>
                <div className="flex items-center gap-1">
                  <div className={cn("w-2 h-2 rounded-full", s.status === "ok" ? "bg-emerald-400" : "bg-amber-400")} />
                  <span className={cn("text-[7px]", s.status === "ok" ? "text-emerald-600" : "text-amber-600")}>{s.status === "ok" ? "OK" : "Lent"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function ContentUtilisateurs() {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold">Utilisateurs — 5/10</p>
          <button className="text-[8px] bg-blue-600 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1 cursor-pointer hover:bg-blue-700">
            <UserPlus className="h-3.5 w-3.5" /> Inviter
          </button>
        </div>
        <div className="space-y-1.5">
          {MOCK_USERS.map((u, i) => (
            <div key={i} className="bg-white border rounded-lg p-2.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                {u.nom.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold">{u.nom}</p>
                <p className="text-[8px] text-gray-400">{u.email}</p>
              </div>
              <span className={cn("text-[8px] px-2 py-0.5 rounded-full font-medium",
                u.role === "Admin" ? "bg-purple-100 text-purple-700" : u.role === "Manager" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
              )}>{u.role}</span>
              <div className="flex items-center gap-1">
                <div className={cn("w-2 h-2 rounded-full", u.actif ? "bg-emerald-400" : "bg-gray-300")} />
                <span className="text-[7px] text-gray-400">{u.derniere}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentPackages() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Packages disponibles</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { nom: "Starter", prix: "29$/mois", bots: 3, users: 2, missions: 100, actif: false },
            { nom: "Pioneer", prix: "99$/mois", bots: 12, users: 5, missions: 500, actif: true },
            { nom: "Enterprise", prix: "299$/mois", bots: 12, users: 25, missions: 2000, actif: false },
          ].map(p => (
            <div key={p.nom} className={cn("bg-white border rounded-xl p-3", p.actif && "border-blue-500 ring-2 ring-blue-100")}>
              {p.actif && <span className="text-[7px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Actif</span>}
              <p className="text-[11px] font-bold mt-1">{p.nom}</p>
              <p className="text-sm font-bold text-blue-600 mt-1">{p.prix}</p>
              <div className="mt-2 space-y-1">
                <p className="text-[8px] text-gray-500">{p.bots} bots AI</p>
                <p className="text-[8px] text-gray-500">{p.users} utilisateurs</p>
                <p className="text-[8px] text-gray-500">{p.missions} missions/mois</p>
                <p className="text-[8px] text-gray-500">Telephonie incluse</p>
                <p className="text-[8px] text-gray-500">Support prioritaire</p>
              </div>
              <button className={cn("w-full mt-2 text-[8px] py-1.5 rounded-lg font-bold cursor-pointer",
                p.actif ? "bg-gray-100 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-700"
              )}>{p.actif ? "Plan actuel" : "Upgrader"}</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentMonitoring() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Monitoring Temps Reel</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Latence moy.", val: "156ms", color: "text-emerald-600" },
            { label: "Requetes/min", val: "4.2", color: "text-blue-600" },
            { label: "Erreurs 24h", val: "3", color: "text-amber-600" },
          ].map(k => (
            <div key={k.label} className="bg-white border rounded-lg p-2.5 text-center">
              <p className={cn("text-sm font-bold", k.color)}>{k.val}</p>
              <p className="text-[7px] text-gray-400">{k.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white border rounded-lg p-3 mb-3">
          <p className="text-[9px] font-bold mb-2">Logs API (derniere heure)</p>
          <div className="space-y-1">
            {API_LOGS.map((log, i) => (
              <div key={i} className="flex items-center gap-2 py-1 border-b last:border-0 font-mono">
                <span className="text-[7px] text-gray-400 w-14">{log.time}</span>
                <span className={cn("text-[7px] font-bold w-8",
                  log.status === 200 ? "text-emerald-600" : "text-red-600"
                )}>{log.status}</span>
                <span className="text-[8px] text-gray-600 flex-1 truncate">{log.endpoint}</span>
                <span className="text-[7px] text-gray-400">{log.latence}</span>
                <BotAvatar code={log.bot} size="sm" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <p className="text-[9px] font-bold mb-2">Latence par bot (moy. 24h)</p>
          {[
            { bot: "CEOB", latence: 189, max: 300 },
            { bot: "CTOB", latence: 134, max: 300 },
            { bot: "CFOB", latence: 112, max: 300 },
            { bot: "CMOB", latence: 201, max: 300 },
          ].map(b => {
            const c = BOT_COLORS[b.bot];
            return (
              <div key={b.bot} className="flex items-center gap-2 py-1">
                <BotAvatar code={b.bot} size="sm" />
                <span className="text-[8px] w-14 font-medium">{c?.name}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                  <div className={cn("h-1.5 rounded-full", b.latence > 200 ? "bg-amber-400" : "bg-emerald-400")} style={{ width: `${(b.latence / b.max) * 100}%` }} />
                </div>
                <span className="text-[8px] text-gray-500 w-10 text-right">{b.latence}ms</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function ContentParametres() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Parametres Instance</p>
        <div className="space-y-2">
          {[
            { label: "Nom de l'instance", val: "Usine Bleue AI", icon: Building2 },
            { label: "Timezone", val: "America/Toronto (EST)", icon: Clock },
            { label: "Langue", val: "Francais (Canada)", icon: Globe },
            { label: "Domaine", val: "app.usinebleue.ai", icon: Wifi },
            { label: "Theme", val: "Light Premium", icon: Eye },
          ].map(p => (
            <div key={p.label} className="bg-white border rounded-lg p-3 flex items-center gap-3">
              <p.icon className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-[9px] font-bold">{p.label}</p>
                <p className="text-[8px] text-gray-500">{p.val}</p>
              </div>
              <button className="text-[7px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer">Modifier</button>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-white border rounded-lg p-3">
          <p className="text-[9px] font-bold mb-2">Logo et couleurs</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-[11px] font-bold">UB</div>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: UB_BLUE }} title="UB Blue" />
              <div className="w-6 h-6 rounded-full bg-blue-500" title="Accent" />
              <div className="w-6 h-6 rounded-full bg-emerald-500" title="Success" />
              <div className="w-6 h-6 rounded-full bg-amber-500" title="Warning" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ContentTelephonie() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Telephonie Telnyx</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Appels/mois", val: "23", color: "text-blue-600" },
            { label: "Duree moy.", val: "4.2 min", color: "text-emerald-600" },
            { label: "Cout/mois", val: "3.47$", color: "text-amber-600" },
          ].map(k => (
            <div key={k.label} className="bg-white border rounded-lg p-2.5 text-center">
              <p className={cn("text-sm font-bold", k.color)}>{k.val}</p>
              <p className="text-[7px] text-gray-400">{k.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="bg-white border rounded-lg p-3">
            <p className="text-[9px] font-bold mb-2">Configuration SIP</p>
            {[
              { label: "Numero principal", val: "+1 438-544-5442" },
              { label: "Connection ID", val: "telnyx_conn_...4f2a" },
              { label: "NIP actif", val: "Oui (Carl: 6284)" },
              { label: "LiveKit Trunk", val: "Configure" },
            ].map(c => (
              <div key={c.label} className="flex justify-between py-1 border-b last:border-0">
                <span className="text-[8px] text-gray-500">{c.label}</span>
                <span className="text-[8px] font-medium">{c.val}</span>
              </div>
            ))}
          </div>
          <div className="bg-white border rounded-lg p-3">
            <p className="text-[9px] font-bold mb-2">Derniers appels</p>
            {[
              { de: "+1 514-991-2284", duree: "3:42", date: "Aujourd'hui 10:15", bot: "CEOB" },
              { de: "+1 438-544-5442", duree: "6:18", date: "Hier 14:30", bot: "CMOB" },
              { de: "+1 514-991-2284", duree: "2:55", date: "Hier 09:45", bot: "CEOB" },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-2 py-1 border-b last:border-0">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[8px] text-gray-600 flex-1">{a.de}</span>
                <span className="text-[7px] text-gray-400">{a.duree}</span>
                <BotAvatar code={a.bot} size="sm" />
                <span className="text-[7px] text-gray-400">{a.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function ContentSecurite() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Securite</p>
        <div className="space-y-2">
          {[
            { label: "API Key", status: "ok", detail: "Rotee il y a 14 jours", icon: Key },
            { label: "UFW Firewall", status: "ok", detail: "Ports 2222, 80, 443 ouverts", icon: Shield },
            { label: "CORS", status: "ok", detail: "Restrictif: app.usinebleue.ai uniquement", icon: Lock },
            { label: "Rate Limiting", status: "ok", detail: "30 req/min par API key", icon: Zap },
            { label: "2FA", status: "warning", detail: "Non active — recommande", icon: Lock },
            { label: "Sessions", status: "ok", detail: "3 sessions actives", icon: UserCheck },
          ].map(s => (
            <div key={s.label} className="bg-white border rounded-lg p-3 flex items-center gap-3">
              <s.icon className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-[9px] font-bold">{s.label}</p>
                <p className="text-[8px] text-gray-500">{s.detail}</p>
              </div>
              <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full",
                s.status === "ok" ? "bg-emerald-50" : "bg-amber-50"
              )}>
                <div className={cn("w-2 h-2 rounded-full", s.status === "ok" ? "bg-emerald-400" : "bg-amber-400")} />
                <span className={cn("text-[7px] font-medium", s.status === "ok" ? "text-emerald-600" : "text-amber-600")}>{s.status === "ok" ? "OK" : "Attention"}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-white border rounded-lg p-3">
          <p className="text-[9px] font-bold mb-2">Audit Log (dernieres 24h)</p>
          {[
            { action: "Login reussi", user: "Carl Fugere", time: "10:42" },
            { action: "API key utilisee", user: "System", time: "10:41" },
            { action: "Mission COMMAND lancee", user: "Carl Fugere", time: "10:38" },
            { action: "Login reussi", user: "Marie-Eve L.", time: "08:15" },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b last:border-0 text-[8px]">
              <span className="text-gray-600">{a.action}</span>
              <span className="text-gray-500">{a.user}</span>
              <span className="text-gray-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentTrialBrain() {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-purple-600" />
          <p className="text-[11px] font-bold">Trial-Brain — Entrainement IA</p>
          <span className="text-[7px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold ml-auto">God Mode</span>
        </div>
        <div className="bg-white border rounded-xl p-3 mb-3">
          <p className="text-[9px] font-bold mb-2">Run V8 — En cours</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {[
              { label: "Modele", val: "DeepSeek-R1 14B" },
              { label: "Dataset", val: "2,847 exemples" },
              { label: "Steps", val: "351 / 500" },
              { label: "Loss", val: "0.42" },
              { label: "GPU", val: "A100 80GB (RunPod)" },
              { label: "ETA", val: "~2h restantes" },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded p-1.5">
                <p className="text-[7px] text-gray-400">{m.label}</p>
                <p className="text-[9px] font-bold">{m.val}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[8px] text-gray-500 mb-1">
            <span>Progression</span><span>70%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full">
            <div className="h-1.5 bg-purple-500 rounded-full" style={{ width: "70%" }} />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <p className="text-[9px] font-bold mb-2">Historique runs</p>
          {[
            { version: "V7", status: "complete", loss: "0.77", result: "Lost at 77%" },
            { version: "V6", status: "complete", loss: "0.89", result: "Baseline" },
            { version: "V5", status: "abandonne", loss: "1.23", result: "Overfitting" },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b last:border-0 text-[8px]">
              <span className="font-bold">{r.version}</span>
              <span className="text-gray-500">Loss: {r.loss}</span>
              <span className={cn("font-medium", r.status === "complete" ? "text-emerald-600" : "text-red-500")}>{r.result}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentApiUsage() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Usage API — Mars 2026</p>
        <div className="space-y-2">
          {[
            { tier: "T0 — Cache/Regex", pct: 35, cout: "0.00$", color: "bg-gray-400" },
            { tier: "T1 — Gemini Flash", pct: 33, cout: "0.00$", color: "bg-emerald-400" },
            { tier: "T2 — Gemini Pro", pct: 18, cout: "0.00$", color: "bg-blue-400" },
            { tier: "T3 — Claude Sonnet", pct: 11, cout: "4.23$", color: "bg-amber-400" },
            { tier: "T4 — Claude Opus", pct: 3, cout: "2.87$", color: "bg-red-400" },
          ].map(t => (
            <div key={t.tier} className="bg-white border rounded-lg p-2.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold">{t.tier}</span>
                <span className="text-[8px] text-gray-500">{t.cout}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div className={cn("h-2 rounded-full", t.color)} style={{ width: `${t.pct}%` }} />
                </div>
                <span className="text-[9px] font-bold w-8 text-right">{t.pct}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
          <p className="text-[9px] font-bold text-emerald-700">Budget: 7.10$ / 15.00$ (47%)</p>
          <p className="text-[8px] text-emerald-600 mt-1">86% des requetes sur les tiers gratuits. Distribution optimale.</p>
        </div>
      </div>
    );
  }

  function ContentNotifications() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Configuration Notifications</p>
        <div className="space-y-2">
          {[
            { canal: "Email", actif: true, types: "Alertes critiques, rapports hebdo" },
            { canal: "Telegram", actif: true, types: "Rapports bots, missions completees" },
            { canal: "In-App", actif: true, types: "Tout (discussions, taches, mentions)" },
            { canal: "SMS", actif: false, types: "Urgences seulement" },
          ].map(n => (
            <div key={n.canal} className="bg-white border rounded-lg p-3 flex items-center gap-3">
              <Bell className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-[9px] font-bold">{n.canal}</p>
                <p className="text-[8px] text-gray-500">{n.types}</p>
              </div>
              <div className={cn("w-8 h-4 rounded-full relative cursor-pointer transition-colors",
                n.actif ? "bg-blue-500" : "bg-gray-300"
              )}>
                <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform",
                  n.actif ? "left-4" : "left-0.5"
                )} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-white border rounded-lg p-3">
          <p className="text-[9px] font-bold mb-2">Stats notifications (30 jours)</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Envoyees", val: "362" },
              { label: "Lues", val: "89%" },
              { label: "Moy/jour", val: "12" },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded p-2 text-center">
                <p className="text-[11px] font-bold">{s.val}</p>
                <p className="text-[7px] text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function ContentBilling() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Facturation</p>
        <div className="bg-white border rounded-xl p-3 mb-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[9px] font-bold">Facture courante — Mars 2026</p>
            <span className="text-[8px] text-gray-400">Prochain paiement: 1 avril</span>
          </div>
          <div className="space-y-1.5">
            {[
              { item: "Plan Pioneer", cout: "99.00$" },
              { item: "Usage API (Claude)", cout: "7.10$" },
              { item: "Telephonie Telnyx", cout: "3.47$" },
            ].map(f => (
              <div key={f.item} className="flex justify-between py-1 border-b last:border-0">
                <span className="text-[9px] text-gray-600">{f.item}</span>
                <span className="text-[9px] font-medium">{f.cout}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1.5 border-t-2">
              <span className="text-[9px] font-bold">Total</span>
              <span className="text-[11px] font-bold text-blue-600">109.57$</span>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <p className="text-[9px] font-bold mb-2">Methode de paiement</p>
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-[9px] font-medium">Visa se terminant par 4242</p>
              <p className="text-[8px] text-gray-400">Expire 12/2027</p>
            </div>
            <button className="text-[7px] text-blue-600 font-medium ml-auto cursor-pointer">Modifier</button>
          </div>
        </div>
        <div className="mt-3 bg-white border rounded-lg p-3">
          <p className="text-[9px] font-bold mb-2">Historique factures</p>
          {[
            { mois: "Fevrier 2026", montant: "104.23$", status: "Payee" },
            { mois: "Janvier 2026", montant: "99.00$", status: "Payee" },
            { mois: "Decembre 2025", montant: "99.00$", status: "Payee" },
          ].map((f, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b last:border-0 text-[8px]">
              <span className="text-gray-600">{f.mois}</span>
              <span className="font-medium">{f.montant}</span>
              <span className="text-emerald-600">{f.status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentGuide() {
    return (
      <div className="px-4 py-3">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 text-center mb-3">
          <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <p className="text-sm font-bold text-blue-900">Instance en Bonne Sante</p>
          <p className="text-[9px] text-blue-600 mt-1">Tous les systemes sont operationnels</p>
        </div>
        <div className="space-y-2">
          {[
            { icon: Users, label: "5 utilisateurs actifs / 10 max", color: "text-blue-600" },
            { icon: Activity, label: "Uptime 99.7% (30 jours)", color: "text-emerald-600" },
            { icon: Shield, label: "Securite: 5/6 criteres verts", color: "text-emerald-600" },
            { icon: CreditCard, label: "Budget: 109.57$/mois (sous controle)", color: "text-blue-600" },
            { icon: BarChart3, label: "API: 86% sur tiers gratuits", color: "text-emerald-600" },
            { icon: AlertTriangle, label: "2FA non active — a configurer", color: "text-amber-600" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-2 bg-white border rounded-lg p-2.5">
              <a.icon className={cn("h-3.5 w-3.5 shrink-0", a.color)} />
              <span className="text-[9px]">{a.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button className="flex-1 text-[8px] bg-blue-600 text-white py-2 rounded-lg font-bold cursor-pointer hover:bg-blue-700">Retour au Dashboard</button>
          <button className="flex-1 text-[8px] bg-white border text-gray-600 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-50">Contacter Support</button>
        </div>
      </div>
    );
  }
}

// ═══════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════

function SBubble({ code, children, collapsed }: { code: string; children: React.ReactNode; collapsed: boolean }) {
  const bot = BOT_COLORS[code];
  if (!bot) return null;
  if (collapsed) {
    return (
      <div className="flex gap-2 items-center opacity-60">
        <BotAvatar code={code} size="sm" />
        <div className="text-[9px] text-gray-400">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <BotAvatar code={code} size="md" />
      <div className={cn("bg-white border rounded-xl rounded-tl-none px-3 py-2.5 max-w-[88%] shadow-sm border-l-2", bot.border)}>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-[11px] font-semibold", bot.text)}>{bot.name}</span>
          <span className="text-[9px] text-gray-400">{bot.role}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function SBtn({ onClick, icon: Icon, label }: { onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button onClick={onClick}
        className="text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-blue-600 hover:bg-blue-700">
        <Icon className="h-3.5 w-3.5" /> {label}
      </button>
    </div>
  );
}

function AutoAdvance({ onComplete, delay }: { onComplete: () => void; delay: number }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, delay);
    return () => clearTimeout(timer);
  }, [onComplete, delay]);
  return null;
}
