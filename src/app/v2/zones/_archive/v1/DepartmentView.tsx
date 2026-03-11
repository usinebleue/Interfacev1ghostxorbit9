import { useState } from 'react';
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  FileCheck,
  TrendingUp,
  CircleDot,
  ExternalLink,
  Settings,
  Server,
  Bug,
  Cpu,
  DollarSign,
  PiggyBank,
  Receipt,
  Megaphone,
  Target,
  BarChart3,
  Handshake,
  FileText,
  Cog,
  ShieldCheck,
  Package,
  Users,
  Gauge,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

/* ─────────────────────────────────────────────
   CONFIG PAR DÉPARTEMENT
   ───────────────────────────────────────────── */

interface BotConfig {
  id: string;
  name: string;
  ghost: string;
  role: string;
  avatar: string;
  color: string;
  ringColor: string;
  summary: string;
  kpis: { label: string; value: string; trend?: string; positive?: boolean }[];
  widgets: Widget[];
}

interface Widget {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  badge?: string;
  items: WidgetItem[];
}

interface WidgetItem {
  id: number;
  primary: string;
  secondary?: string;
  value?: string;
  progress?: number;
  urgent?: boolean;
  tag?: string;
}

const botConfigs: Record<string, BotConfig> = {
  direction: {
    id: 'direction', name: 'Direction', ghost: 'CarlOS', role: 'CEO',
    avatar: '/agents/ceo-carlos.png', color: 'text-blue-600', ringColor: 'ring-blue-500',
    summary: '2 approbations urgentes. Call MétalPro à 10h30. Pipeline à 475K$ (+12%). Vente +12%.',
    kpis: [
      { label: 'Revenus', value: '1.2M$', trend: '+8%', positive: true },
      { label: 'Pipeline', value: '475K$', trend: '+12%', positive: true },
      { label: 'Projets', value: '3' },
      { label: 'Retard', value: '2', positive: false },
    ],
    widgets: [
      {
        title: 'À APPROUVER', icon: FileCheck, iconColor: 'text-red-500', badge: '3',
        items: [
          { id: 1, primary: 'Budget automatisation — 3 scénarios', secondary: 'Buffett (CFO)', urgent: true },
          { id: 2, primary: 'Soumission MétalPro v2', secondary: 'Sun Tzu (CSO)', urgent: true },
          { id: 3, primary: 'Plan contenu LinkedIn Q2', secondary: 'Disney (CMO)' },
        ],
      },
      {
        title: 'MES TÂCHES', icon: CheckCircle2, iconColor: 'text-blue-500', badge: '4',
        items: [
          { id: 1, primary: 'Approuver budget automatisation', secondary: 'Buffett · Aujourd\'hui', urgent: true },
          { id: 2, primary: 'Réviser soumission MétalPro', secondary: 'Sun Tzu · Jeudi', urgent: true },
          { id: 3, primary: 'Valider brief marketing Q2', secondary: 'Disney · 3 mars' },
          { id: 4, primary: 'Feedback audit techno usine #2', secondary: 'Musk · 5 mars' },
        ],
      },
      {
        title: 'AUJOURD\'HUI', icon: Calendar, iconColor: 'text-purple-500',
        items: [
          { id: 1, primary: 'Standup équipe', value: '09:00', tag: 'meeting' },
          { id: 2, primary: 'Call MétalPro — soumission', value: '10:30', tag: 'client' },
          { id: 3, primary: 'Revue budget Q2 (CFO)', value: '13:00', tag: 'meeting' },
          { id: 4, primary: 'Demo robot soudure', value: '15:00', tag: 'client' },
        ],
      },
      {
        title: 'PIPELINE', icon: TrendingUp, iconColor: 'text-green-500',
        items: [
          { id: 1, primary: 'MétalPro inc.', secondary: 'Soumission', value: '125K$', progress: 75 },
          { id: 2, primary: 'Acier Québec', secondary: 'Qualification', value: '85K$', progress: 40 },
          { id: 3, primary: 'TechnoSoud', secondary: 'Négociation', value: '210K$', progress: 60 },
          { id: 4, primary: 'IndusPièces', secondary: 'Prospection', value: '55K$', progress: 20 },
        ],
      },
    ],
  },
  tech: {
    id: 'tech', name: 'Technologie', ghost: 'Musk', role: 'CTO',
    avatar: '/agents/cto-thomas.png', color: 'text-purple-600', ringColor: 'ring-purple-500',
    summary: 'Audit usine #2 terminé. 3 options de robots identifiées. Stack API stable (99.2% uptime).',
    kpis: [
      { label: 'Uptime', value: '99.2%', trend: '+0.3%', positive: true },
      { label: 'Audits', value: '2' },
      { label: 'Intégrations', value: '8' },
      { label: 'Bugs', value: '3', positive: false },
    ],
    widgets: [
      {
        title: 'AUDITS EN COURS', icon: Cpu, iconColor: 'text-purple-500', badge: '2',
        items: [
          { id: 1, primary: 'Audit usine #2 — robots soudure', secondary: 'Terminé · 3 options', progress: 100 },
          { id: 2, primary: 'Audit ligne assemblage #1', secondary: 'En cours · scan IoT', progress: 45 },
          { id: 3, primary: 'Évaluation ERP migration', secondary: 'Planifié · mars', progress: 0 },
        ],
      },
      {
        title: 'STACK & INTÉGRATIONS', icon: Server, iconColor: 'text-blue-500',
        items: [
          { id: 1, primary: 'API CarlOS (Telegram)', secondary: 'Opérationnel', tag: 'ok' },
          { id: 2, primary: 'Plane.so (Tâches)', secondary: 'Connecté', tag: 'ok' },
          { id: 3, primary: 'Google Calendar', secondary: 'Token expiré', tag: 'error' },
          { id: 4, primary: 'PostgreSQL (CarlOS DB)', secondary: '99.9% uptime', tag: 'ok' },
        ],
      },
      {
        title: 'TICKETS PRIORITAIRES', icon: Bug, iconColor: 'text-red-500', badge: '3',
        items: [
          { id: 1, primary: 'Google OAuth refresh broken', secondary: 'Calendar/Docs · P1', urgent: true },
          { id: 2, primary: 'Latence API Tier 3 > 2s', secondary: 'Claude Sonnet · P2' },
          { id: 3, primary: 'Webhook Plane 404', secondary: 'Free tier limit · P3' },
        ],
      },
      {
        title: 'AUTOMATISATIONS', icon: Cog, iconColor: 'text-green-500',
        items: [
          { id: 1, primary: 'Robot soudure — 3 options évaluées', secondary: 'Budget requis · CFO', progress: 78 },
          { id: 2, primary: 'Ligne assemblage — analyse IoT', secondary: 'Scan en cours', progress: 35 },
          { id: 3, primary: 'Palettisation automatique', secondary: 'Prospection', progress: 10 },
        ],
      },
    ],
  },
  finance: {
    id: 'finance', name: 'Finance', ghost: 'Buffett', role: 'CFO',
    avatar: '/agents/cfo-francois.png', color: 'text-green-600', ringColor: 'ring-green-500',
    summary: 'Budget Q2 prêt (3 scénarios). ROI automatisation +15%. Subvention MEDTEQ en attente.',
    kpis: [
      { label: 'Budget Q2', value: '340K$' },
      { label: 'ROI projets', value: '+15%', positive: true },
      { label: 'Subventions', value: '2' },
      { label: 'Coûts IA', value: '1.2$/j', positive: true },
    ],
    widgets: [
      {
        title: 'BUDGETS', icon: DollarSign, iconColor: 'text-green-500',
        items: [
          { id: 1, primary: 'Budget automatisation', secondary: '3 scénarios prêts · En attente approbation', urgent: true, value: '85-150K$' },
          { id: 2, primary: 'Budget marketing Q2', secondary: 'Approuvé', value: '45K$', progress: 100 },
          { id: 3, primary: 'Budget opérations', secondary: 'En cours', value: '120K$', progress: 60 },
        ],
      },
      {
        title: 'ROI PROJETS', icon: TrendingUp, iconColor: 'text-blue-500',
        items: [
          { id: 1, primary: 'Robot Soudure', secondary: 'Payback 14 mois', value: '+22%', progress: 78 },
          { id: 2, primary: 'Ligne assemblage', secondary: 'Payback 18 mois', value: '+15%', progress: 45 },
          { id: 3, primary: 'ERP migration', secondary: 'Payback 24 mois', value: '+8%', progress: 12 },
        ],
      },
      {
        title: 'SUBVENTIONS', icon: PiggyBank, iconColor: 'text-purple-500', badge: '2',
        items: [
          { id: 1, primary: 'MEDTEQ — automatisation', secondary: 'Soumis · deadline 15 mars', value: '75K$', progress: 60 },
          { id: 2, primary: 'CDPQ — expansion', secondary: 'En préparation', value: '200K$', progress: 15 },
          { id: 3, primary: 'RSRI — innovation', secondary: 'Admissible · Q3', value: '50K$', progress: 0 },
        ],
      },
      {
        title: 'COÛTS & FACTURATION', icon: Receipt, iconColor: 'text-orange-500',
        items: [
          { id: 1, primary: 'Coûts IA (CarlOS)', secondary: 'Ce mois', value: '36$' },
          { id: 2, primary: 'Abonnements SaaS', secondary: '8 outils', value: '2.4K$/m' },
          { id: 3, primary: 'Factures en attente', secondary: '3 clients', value: '45K$', urgent: true },
        ],
      },
    ],
  },
  marketing: {
    id: 'marketing', name: 'Marketing', ghost: 'Disney', role: 'CMO',
    avatar: '/agents/cmo-sofia.png', color: 'text-pink-600', ringColor: 'ring-pink-500',
    summary: '12 leads LinkedIn générés cette semaine. Plan contenu Q2 en attente d\'approbation. 2 campagnes actives.',
    kpis: [
      { label: 'Leads', value: '12', trend: '+8', positive: true },
      { label: 'Campagnes', value: '2' },
      { label: 'Contenu', value: '15 posts' },
      { label: 'Conversion', value: '3.2%', positive: true },
    ],
    widgets: [
      {
        title: 'CAMPAGNES ACTIVES', icon: Megaphone, iconColor: 'text-pink-500', badge: '2',
        items: [
          { id: 1, primary: 'LinkedIn — Automatisation PME', secondary: '8 leads · 2.1K impressions', progress: 65 },
          { id: 2, primary: 'Email — Webinaire Robot', secondary: '4 leads · 340 ouvertures', progress: 40 },
          { id: 3, primary: 'Google Ads — Q2 (planifié)', secondary: 'Budget en attente CFO', progress: 0 },
        ],
      },
      {
        title: 'LEADS & PIPELINE MKT', icon: Target, iconColor: 'text-orange-500',
        items: [
          { id: 1, primary: 'MétalPro inc.', secondary: 'LinkedIn · Chaud', tag: 'hot' },
          { id: 2, primary: 'Acier Québec', secondary: 'Email · Qualifié', tag: 'warm' },
          { id: 3, primary: 'IndusPièces', secondary: 'LinkedIn · Nouveau', tag: 'new' },
          { id: 4, primary: 'SoudurePlus', secondary: 'Webinaire · Tiède', tag: 'warm' },
        ],
      },
      {
        title: 'CONTENU PLANIFIÉ', icon: Calendar, iconColor: 'text-blue-500',
        items: [
          { id: 1, primary: 'Article: ROI automatisation', secondary: 'Blog · Mercredi', value: 'Draft' },
          { id: 2, primary: 'Post LinkedIn: Témoignage', secondary: 'Réseau · Vendredi', value: 'Planifié' },
          { id: 3, primary: 'Webinaire: Industrie 4.0', secondary: '12 mars · 45 inscrits', value: 'Confirmé' },
        ],
      },
      {
        title: 'ANALYTICS', icon: BarChart3, iconColor: 'text-green-500',
        items: [
          { id: 1, primary: 'Site web', secondary: '2.3K visites/sem', value: '+12%' },
          { id: 2, primary: 'LinkedIn', secondary: '8.5K impressions', value: '+25%' },
          { id: 3, primary: 'Taux conversion', secondary: 'Lead → Client', value: '3.2%' },
          { id: 4, primary: 'Coût par lead', secondary: 'Tous canaux', value: '85$' },
        ],
      },
    ],
  },
  strategy: {
    id: 'strategy', name: 'Vente', ghost: 'Sun Tzu', role: 'CSO',
    avatar: '/agents/cso-marc.png', color: 'text-red-600', ringColor: 'ring-red-500',
    summary: 'Pipeline à 475K$. Soumission MétalPro deadline jeudi. 3 prospects en qualification.',
    kpis: [
      { label: 'Pipeline', value: '475K$', trend: '+12%', positive: true },
      { label: 'Win rate', value: '35%' },
      { label: 'Soumissions', value: '2' },
      { label: 'Prospects', value: '12' },
    ],
    widgets: [
      {
        title: 'SOUMISSIONS', icon: FileText, iconColor: 'text-red-500', badge: '2',
        items: [
          { id: 1, primary: 'MétalPro — Robot soudure', secondary: 'Deadline jeudi · 125K$', urgent: true, progress: 85 },
          { id: 2, primary: 'Acier Québec — Palettisation', secondary: '15 mars · 85K$', progress: 40 },
          { id: 3, primary: 'TechnoSoud — Ligne complète', secondary: 'En préparation · 210K$', progress: 15 },
        ],
      },
      {
        title: 'PIPELINE COMPLET', icon: TrendingUp, iconColor: 'text-green-500',
        items: [
          { id: 1, primary: 'MétalPro inc.', secondary: 'Soumission', value: '125K$', progress: 75 },
          { id: 2, primary: 'TechnoSoud', secondary: 'Négociation', value: '210K$', progress: 60 },
          { id: 3, primary: 'Acier Québec', secondary: 'Qualification', value: '85K$', progress: 40 },
          { id: 4, primary: 'IndusPièces', secondary: 'Prospection', value: '55K$', progress: 20 },
        ],
      },
      {
        title: 'CLIENTS ACTIFS', icon: Handshake, iconColor: 'text-blue-500',
        items: [
          { id: 1, primary: 'FabriquePro inc.', secondary: 'Contrat actif · Satisfait', value: '180K$' },
          { id: 2, primary: 'SteelMax', secondary: 'Phase 2 en cours', value: '95K$' },
          { id: 3, primary: 'AssembloTech', secondary: 'Renouvellement Q2', value: '120K$' },
        ],
      },
      {
        title: 'PROSPECTION', icon: Target, iconColor: 'text-orange-500',
        items: [
          { id: 1, primary: '5 nouveaux contacts LinkedIn', secondary: 'Cette semaine · Disney', tag: 'new' },
          { id: 2, primary: '3 demandes entrantes', secondary: 'Site web · À qualifier', tag: 'new' },
          { id: 3, primary: 'Salon Automatisation MTL', secondary: '20 mars · 15 RDV planifiés', tag: 'event' },
        ],
      },
    ],
  },
  operations: {
    id: 'operations', name: 'Opérations', ghost: 'M. Aurèle', role: 'COO',
    avatar: '/agents/coo-lise.png', color: 'text-orange-600', ringColor: 'ring-orange-500',
    summary: '2 process optimisés cette semaine. Ligne assemblage #1 à 87% efficacité. 4 projets actifs.',
    kpis: [
      { label: 'Efficacité', value: '87%', trend: '+3%', positive: true },
      { label: 'Process', value: '4' },
      { label: 'Incidents', value: '1', positive: false },
      { label: 'Qualité', value: '98.5%', positive: true },
    ],
    widgets: [
      {
        title: 'PROCESS EN COURS', icon: Cog, iconColor: 'text-orange-500', badge: '4',
        items: [
          { id: 1, primary: 'Optimisation ligne assemblage #1', secondary: 'Gain +12% efficacité', progress: 87 },
          { id: 2, primary: 'Réduction setup time soudure', secondary: 'De 45min → 20min', progress: 65 },
          { id: 3, primary: 'Lean 5S — entrepôt', secondary: 'Phase 3/5', progress: 60 },
          { id: 4, primary: 'Automatisation QC visuel', secondary: 'POC en cours', progress: 25 },
        ],
      },
      {
        title: 'KPIs PRODUCTION', icon: Gauge, iconColor: 'text-blue-500',
        items: [
          { id: 1, primary: 'OEE global', secondary: 'Overall Equipment Effectiveness', value: '72%' },
          { id: 2, primary: 'Taux de rejet', secondary: 'Ce mois', value: '1.5%' },
          { id: 3, primary: 'Temps de cycle moyen', secondary: 'Ligne principale', value: '4.2 min' },
          { id: 4, primary: 'Livraison à temps', secondary: 'Clients', value: '94%' },
        ],
      },
      {
        title: 'QUALITÉ & CONFORMITÉ', icon: ShieldCheck, iconColor: 'text-green-500',
        items: [
          { id: 1, primary: 'ISO 9001 — audit interne', secondary: 'Planifié avril', tag: 'ok' },
          { id: 2, primary: 'Non-conformité #NC-24', secondary: 'Soudure lot B-12 · Résolu', tag: 'ok' },
          { id: 3, primary: 'Formation opérateur #3', secondary: 'En cours · 60% complété', progress: 60 },
        ],
      },
      {
        title: 'RESSOURCES & PLANNING', icon: Users, iconColor: 'text-purple-500',
        items: [
          { id: 1, primary: 'Équipe production', secondary: '12 opérateurs · 2 superviseurs', value: '14' },
          { id: 2, primary: 'Charge usine', secondary: 'Cette semaine', value: '85%', progress: 85 },
          { id: 3, primary: 'Maintenance préventive', secondary: 'Robot #3 · vendredi', tag: 'planned' },
        ],
      },
    ],
  },
};

/* ─────────────────────────────────────────────
   RENDU
   ───────────────────────────────────────────── */

interface DepartmentViewProps {
  departmentId?: string;
  onBack?: () => void;
}

export function DepartmentView({ departmentId = 'direction', onBack }: DepartmentViewProps) {
  const config = botConfigs[departmentId] || botConfigs.direction;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      {/* Header bot */}
      <div className="bg-white border-b px-4 h-12 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src={config.avatar} alt={config.ghost} className={`w-7 h-7 rounded-full ring-2 ${config.ringColor}`} />
          <h1 className="text-sm font-bold">{config.ghost} — {config.role}</h1>
          <Badge variant="secondary" className="text-xs h-5">{config.name}</Badge>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          {config.kpis.map((kpi, i) => (
            <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border">
              <span className="text-xs text-gray-500">{kpi.label}</span>
              <span className="text-xs font-bold">{kpi.value}</span>
              {kpi.trend && (
                <span className={`text-xs font-semibold ${kpi.positive !== false ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.trend}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs: Dashboard | Chat | Réglages */}
      <Tabs defaultValue="dashboard" className="flex-1 flex flex-col min-h-0">
        <div className="bg-white border-b px-4 flex-shrink-0">
          <TabsList className="h-9">
            <TabsTrigger value="dashboard" className="text-xs">Tableau de bord</TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">Réglages</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Dashboard */}
        <TabsContent value="dashboard" className="flex-1 flex flex-col p-3 gap-2.5 min-h-0 mt-0">
          {/* Bandeau proactif */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-3 flex-shrink-0">
            <img src={config.avatar} alt={config.ghost} className={`w-7 h-7 rounded-full ring-2 ${config.ringColor} flex-shrink-0`} />
            <p className="text-xs text-gray-700 flex-1">
              <b>{config.ghost}:</b> {config.summary}
            </p>
            <Button size="sm" className="h-6 text-xs flex-shrink-0 px-2">
              Répondre <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {/* 4 widgets en grille */}
          <div className="grid grid-cols-4 gap-2.5 flex-shrink-0">
            {config.widgets.map((widget, wi) => (
              <Card key={wi} className="p-2.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <widget.icon className={`h-4 w-4 ${widget.iconColor}`} />
                  <h3 className="text-xs font-semibold">{widget.title}</h3>
                  {widget.badge && (
                    <Badge variant="destructive" className="text-xs px-1 py-0 h-4 ml-auto">{widget.badge}</Badge>
                  )}
                </div>
                <div className="space-y-1.5">
                  {widget.items.map((item) => (
                    <div key={item.id} className="cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                          {item.urgent && <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-800 truncate group-hover:text-blue-600">{item.primary}</p>
                            {item.secondary && <p className="text-xs text-gray-400">{item.secondary}</p>}
                          </div>
                        </div>
                        {item.value && <span className="text-xs font-bold text-gray-600 flex-shrink-0 ml-1">{item.value}</span>}
                        {item.tag && (
                          <Badge variant="outline" className={`text-xs px-1 py-0 h-3.5 flex-shrink-0 ml-1 ${
                            item.tag === 'error' ? 'border-red-300 text-red-500' :
                            item.tag === 'hot' ? 'border-red-300 text-red-500' :
                            item.tag === 'ok' ? 'border-green-300 text-green-600' :
                            item.tag === 'client' ? 'border-orange-300 text-orange-600' :
                            'border-gray-300 text-gray-500'
                          }`}>{item.tag}</Badge>
                        )}
                      </div>
                      {item.progress !== undefined && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Progress value={item.progress} className="flex-1 h-1" />
                          <span className="text-xs text-gray-400 w-6">{item.progress}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Zone activité en bas */}
          <div className="grid grid-cols-2 gap-2.5 flex-1 min-h-0">
            <Card className="p-2.5 flex flex-col min-h-0">
              <div className="flex items-center gap-1.5 mb-2 flex-shrink-0">
                <Clock className="h-4 w-4 text-orange-500" />
                <h3 className="text-xs font-semibold">DERNIERS DOSSIERS</h3>
                <Button variant="link" className="p-0 h-auto text-xs ml-auto">
                  Voir tout <ExternalLink className="ml-0.5 h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {[
                  { id: 1, name: 'Cahier Robot Soudure', progress: 78, by: config.ghost, time: '2h', type: 'CP' },
                  { id: 2, name: 'Bilan MétalPro inc.', progress: 45, by: 'Buffett', time: 'hier', type: 'BS' },
                  { id: 3, name: 'Plan Marketing Q2', progress: 35, by: 'Disney', time: 'hier', type: 'CP' },
                ].map((file) => (
                  <div key={file.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      file.type === 'CP' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>{file.type}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate group-hover:text-blue-600">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Progress value={file.progress} className="flex-1 h-1" />
                        <span className="text-xs font-bold text-gray-500 w-6">{file.progress}%</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">{file.by}</p>
                      <p className="text-xs text-gray-300">{file.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-2.5 flex flex-col min-h-0">
              <div className="flex items-center gap-1.5 mb-2 flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <h3 className="text-xs font-semibold">ACTIVITÉ</h3>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {[
                  { id: 1, text: `${config.ghost} a mis à jour le tableau de bord`, time: '1h', avatar: config.avatar },
                  { id: 2, text: 'Buffett a terminé le budget automatisation', time: '2h', avatar: '/agents/cfo-francois.png' },
                  { id: 3, text: 'Musk a identifié 3 options de robots', time: 'hier', avatar: '/agents/cto-thomas.png' },
                  { id: 4, text: 'Disney a généré 12 leads LinkedIn', time: 'matin', avatar: '/agents/cmo-sofia.png' },
                ].map((update) => (
                  <div key={update.id} className="flex items-center gap-2">
                    <img src={update.avatar} alt="" className="w-5 h-5 rounded-full flex-shrink-0" />
                    <p className="text-xs text-gray-700 flex-1 leading-tight">{update.text}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">{update.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Chat */}
        <TabsContent value="chat" className="flex-1 flex items-center justify-center mt-0">
          <div className="text-center text-gray-400">
            <img src={config.avatar} alt={config.ghost} className={`w-16 h-16 rounded-full ring-4 ${config.ringColor} mx-auto mb-3`} />
            <p className="font-semibold text-gray-600">Chat avec {config.ghost}</p>
            <p className="text-xs mt-1">Utilise la barre de chat en bas pour parler à {config.ghost}</p>
          </div>
        </TabsContent>

        {/* Tab Réglages */}
        <TabsContent value="settings" className="flex-1 p-4 mt-0">
          <div className="max-w-2xl mx-auto space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Personnalité de {config.ghost}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">Tonalité</p>
                    <p className="text-xs text-gray-400">Niveau de formalité des réponses</p>
                  </div>
                  <div className="flex gap-1">
                    {['Direct', 'Équilibré', 'Formel'].map((t) => (
                      <Badge key={t} variant={t === 'Direct' ? 'default' : 'outline'} className="text-xs cursor-pointer">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">Profondeur d'analyse</p>
                    <p className="text-xs text-gray-400">Détail des réponses</p>
                  </div>
                  <div className="flex gap-1">
                    {['Rapide', 'Standard', 'Approfondi'].map((t) => (
                      <Badge key={t} variant={t === 'Standard' ? 'default' : 'outline'} className="text-xs cursor-pointer">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">Mode proactif</p>
                    <p className="text-xs text-gray-400">{config.ghost} envoie des suggestions automatiquement</p>
                  </div>
                  <Badge variant="default" className="text-xs cursor-pointer">Activé</Badge>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Ghost cognitif actif</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img src={config.avatar} alt={config.ghost} className={`w-10 h-10 rounded-full ring-2 ${config.ringColor}`} />
                <div>
                  <p className="text-sm font-bold">{config.ghost}</p>
                  <p className="text-xs text-gray-500">{config.role} · Trisociation active</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Notifications</h3>
              <div className="space-y-2">
                {['Alertes urgentes', 'Résumé quotidien', 'Mises à jour dossiers', 'Suggestions proactives'].map((n) => (
                  <div key={n} className="flex items-center justify-between">
                    <p className="text-xs">{n}</p>
                    <Badge variant="default" className="text-xs cursor-pointer">On</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
