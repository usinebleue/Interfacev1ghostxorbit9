import {
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Calendar,
  FileCheck,
  TrendingUp,
  CircleDot,
  ExternalLink,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

/* ─────────────────────────────────────────────
   MOCK DATA — sera remplacé par l'API REST
   ───────────────────────────────────────────── */

// Tâches prioritaires (Plane.so + CarlOS)
const tasks = [
  { id: 1, text: 'Approuver budget automatisation', from: 'Buffett (CFO)', priority: 'urgent' as const, due: 'Aujourd\'hui' },
  { id: 2, text: 'Réviser soumission MétalPro', from: 'Sun Tzu (CSO)', priority: 'urgent' as const, due: 'Jeudi' },
  { id: 3, text: 'Valider brief marketing Q2', from: 'Disney (CMO)', priority: 'normal' as const, due: '3 mars' },
  { id: 4, text: 'Feedback audit techno usine #2', from: 'Musk (CTO)', priority: 'normal' as const, due: '5 mars' },
];

// Derniers dossiers travaillés
const recentFiles = [
  { id: 1, name: 'Cahier Robot Soudure', progress: 78, updatedBy: 'CarlOS', time: 'il y a 2h', type: 'cahier' as const },
  { id: 2, name: 'Bilan MétalPro inc.', progress: 45, updatedBy: 'Buffett', time: 'hier', type: 'bilan' as const },
  { id: 3, name: 'Plan Marketing Q2', progress: 35, updatedBy: 'Disney', time: 'hier', type: 'cahier' as const },
  { id: 4, name: 'Subvention MEDTEQ', progress: 15, updatedBy: 'CarlOS', time: 'lundi', type: 'cahier' as const },
];

// Agenda du jour (Google Calendar / Plane)
const todayAgenda = [
  { id: 1, time: '09:00', title: 'Standup équipe', type: 'meeting' as const },
  { id: 2, time: '10:30', title: 'Call MétalPro — soumission', type: 'client' as const },
  { id: 3, time: '13:00', title: 'Revue budget Q2 (CFO)', type: 'meeting' as const },
  { id: 4, time: '15:00', title: 'Demo robot soudure', type: 'client' as const },
];

// Pipeline vente (CSO)
const pipeline = [
  { id: 1, name: 'MétalPro inc.', stage: 'Soumission', value: '125K$', probability: 75 },
  { id: 2, name: 'Acier Québec', stage: 'Qualification', value: '85K$', probability: 40 },
  { id: 3, name: 'TechnoSoud', stage: 'Négociation', value: '210K$', probability: 60 },
  { id: 4, name: 'IndusPièces', stage: 'Prospection', value: '55K$', probability: 20 },
];

// Dossiers en attente d'approbation
const pendingApprovals = [
  { id: 1, title: 'Budget automatisation — 3 scénarios', from: 'Buffett (CFO)', avatar: '/agents/cfo-francois.png', urgency: 'high' as const },
  { id: 2, title: 'Soumission MétalPro v2', from: 'Sun Tzu (CSO)', avatar: '/agents/cso-marc.png', urgency: 'high' as const },
  { id: 3, title: 'Plan contenu LinkedIn Q2', from: 'Disney (CMO)', avatar: '/agents/cmo-sofia.png', urgency: 'low' as const },
];

// Activité récente de l'équipe
const teamUpdates = [
  { id: 1, text: 'Buffett a terminé le budget automatisation', time: '2h', avatar: '/agents/cfo-francois.png' },
  { id: 2, text: 'Musk a identifié 3 options de robots', time: 'hier', avatar: '/agents/cto-thomas.png' },
  { id: 3, text: 'Disney a généré 12 leads LinkedIn', time: 'matin', avatar: '/agents/cmo-sofia.png' },
  { id: 4, text: 'M. Aurèle a optimisé 2 process', time: 'avant-hier', avatar: '/agents/coo-lise.png' },
];

// KPIs rapides
const kpis = [
  { label: 'Revenus', value: '1.2M$', trend: '+8%', positive: true },
  { label: 'Pipeline', value: '475K$', trend: '+12%', positive: true },
  { label: 'Projets actifs', value: '3', trend: '', positive: true },
  { label: 'Tâches en retard', value: '2', trend: '', positive: false },
];

const getPriorityStyle = (p: 'urgent' | 'normal') =>
  p === 'urgent' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50';

const getAgendaColor = (type: 'meeting' | 'client') =>
  type === 'client' ? 'border-l-orange-500 bg-orange-50' : 'border-l-blue-500 bg-blue-50';

export function CockpitView() {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      {/* En-tête */}
      <div className="bg-white border-b px-4 h-12 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold">Tableau de bord</h1>
          <div className="flex items-center gap-2">
            {kpis.map((kpi, i) => (
              <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border">
                <span className="text-xs text-gray-500">{kpi.label}</span>
                <span className="text-xs font-bold">{kpi.value}</span>
                {kpi.trend && (
                  <span className={`text-xs font-semibold ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.trend}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        <span className="text-xs text-gray-400">25 fév. 2026</span>
      </div>

      {/* Contenu — grille dynamique, tout rentre sans scroll */}
      <div className="flex-1 p-3 flex flex-col gap-2.5 min-h-0">
        {/* Bandeau CarlOS proactif */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-3 flex-shrink-0">
          <img src="/agents/ceo-carlos.png" alt="CarlOS" className="w-7 h-7 rounded-full ring-2 ring-blue-500 flex-shrink-0" />
          <p className="text-xs text-gray-700 flex-1">
            <b>CarlOS:</b> 2 approbations urgentes t'attendent. Call MétalPro à 10h30. Pipeline à 475K$ (+12%).
          </p>
          <Button size="sm" className="h-6 text-xs flex-shrink-0 px-2">
            Répondre <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Grille 4 colonnes — rangée du haut */}
        <div className="grid grid-cols-4 gap-2.5 flex-shrink-0">
          {/* À approuver */}
          <Card className="p-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <FileCheck className="h-4 w-4 text-red-500" />
              <h3 className="text-xs font-semibold">À APPROUVER</h3>
              <Badge variant="destructive" className="text-xs px-1 py-0 h-4 ml-auto">{pendingApprovals.length}</Badge>
            </div>
            <div className="space-y-1.5">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group cursor-pointer">
                  <img src={item.avatar} alt="" className="w-5 h-5 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 truncate group-hover:text-blue-600">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.from}</p>
                  </div>
                  {item.urgency === 'high' && <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </Card>

          {/* Mes tâches */}
          <Card className="p-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <h3 className="text-xs font-semibold">MES TÂCHES</h3>
              <Badge variant="secondary" className="text-xs px-1 py-0 h-4 ml-auto">{tasks.length}</Badge>
            </div>
            <div className="space-y-1.5">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-1.5 cursor-pointer group">
                  <CircleDot className={`h-4 w-4 mt-0.5 flex-shrink-0 ${task.priority === 'urgent' ? 'text-red-500' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 truncate group-hover:text-blue-600">{task.text}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">{task.from}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className={`text-xs font-medium ${task.priority === 'urgent' ? 'text-red-500' : 'text-gray-400'}`}>{task.due}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Agenda aujourd'hui */}
          <Card className="p-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <h3 className="text-xs font-semibold">AUJOURD'HUI</h3>
            </div>
            <div className="space-y-1">
              {todayAgenda.map((event) => (
                <div key={event.id} className={`rounded-r px-2 py-1 border-l-2 ${getAgendaColor(event.type)} cursor-pointer`}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-500 w-8">{event.time}</span>
                    <span className="text-xs text-gray-800 truncate">{event.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pipeline vente */}
          <Card className="p-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <h3 className="text-xs font-semibold">PIPELINE</h3>
              <span className="text-xs font-bold text-green-600 ml-auto">475K$</span>
            </div>
            <div className="space-y-1.5">
              {pipeline.map((deal) => (
                <div key={deal.id} className="cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-800 truncate group-hover:text-blue-600 flex-1">{deal.name}</p>
                    <span className="text-xs font-bold text-gray-600 ml-1">{deal.value}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Progress value={deal.probability} className="flex-1 h-1" />
                    <span className="text-xs text-gray-400 w-6">{deal.probability}%</span>
                    <Badge variant="outline" className="text-xs px-1 py-0 h-3.5">{deal.stage}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Rangée du bas — 2 colonnes, prend l'espace restant */}
        <div className="grid grid-cols-2 gap-2.5 flex-1 min-h-0">
          {/* Derniers dossiers */}
          <Card className="p-2.5 flex flex-col min-h-0">
            <div className="flex items-center gap-1.5 mb-2 flex-shrink-0">
              <Clock className="h-4 w-4 text-orange-500" />
              <h3 className="text-xs font-semibold">DERNIERS DOSSIERS</h3>
              <Button variant="link" className="p-0 h-auto text-xs ml-auto">
                Voir tout <ExternalLink className="ml-0.5 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {recentFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    file.type === 'cahier' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {file.type === 'cahier' ? 'CP' : 'BS'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate group-hover:text-blue-600">{file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Progress value={file.progress} className="flex-1 h-1" />
                      <span className="text-xs font-bold text-gray-500 w-6">{file.progress}%</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{file.updatedBy}</p>
                    <p className="text-xs text-gray-300">{file.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Activité de l'équipe */}
          <Card className="p-2.5 flex flex-col min-h-0">
            <div className="flex items-center gap-1.5 mb-2 flex-shrink-0">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <h3 className="text-xs font-semibold">ACTIVITÉ ÉQUIPE</h3>
              <Button variant="link" className="p-0 h-auto text-xs ml-auto">
                Voir tout <ExternalLink className="ml-0.5 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {teamUpdates.map((update) => (
                <div key={update.id} className="flex items-center gap-2">
                  <img src={update.avatar} alt="" className="w-5 h-5 rounded-full flex-shrink-0" />
                  <p className="text-xs text-gray-700 flex-1 leading-tight">{update.text}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{update.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
