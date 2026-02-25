import { useState } from 'react';
import { 
  Search, 
  Settings, 
  TrendingUp, 
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer 
} from 'recharts';

interface Department {
  id: string;
  name: string;
  emoji: string;
  role: string;
  color: string;
  bgColor: string;
  stats: string[];
  score: number;
  status: 'green' | 'yellow' | 'red';
}

const departments: Department[] = [
  {
    id: 'direction',
    name: 'DIRECTION',
    emoji: '🔵',
    role: 'CarlOS',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    stats: ['3 projets', '5 idées'],
    score: 82,
    status: 'green',
  },
  {
    id: 'tech',
    name: 'TECHNOLOGIE',
    emoji: '🟣',
    role: 'CTO',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    stats: ['2 audits', '1 autom.'],
    score: 71,
    status: 'yellow',
  },
  {
    id: 'finance',
    name: 'FINANCE',
    emoji: '🟢',
    role: 'CFO',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    stats: ['Budget OK', 'ROI +15%'],
    score: 89,
    status: 'green',
  },
  {
    id: 'marketing',
    name: 'MARKETING',
    emoji: '🩷',
    role: 'CMO',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    stats: ['2 camps', '12 leads'],
    score: 67,
    status: 'yellow',
  },
  {
    id: 'strategy',
    name: 'STRATÉGIE',
    emoji: '🔴',
    role: 'CSO',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    stats: ['Veille OK', '3 risques'],
    score: 74,
    status: 'green',
  },
  {
    id: 'operations',
    name: 'OPÉRATIONS',
    emoji: '🟠',
    role: 'COO',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    stats: ['4 process', '2 optim.'],
    score: 78,
    status: 'green',
  },
];

const vitaaData = [
  { subject: 'Vente', value: 72, fullMark: 100 },
  { subject: 'Idée', value: 85, fullMark: 100 },
  { subject: 'Argent', value: 68, fullMark: 100 },
  { subject: 'Temps', value: 45, fullMark: 100 },
  { subject: 'Actif', value: 78, fullMark: 100 },
];

const recentActivities = [
  {
    id: 1,
    text: 'CFO a terminé le budget automatisation',
    time: 'il y a 2h',
    icon: CheckCircle2,
    color: 'text-green-600',
  },
  {
    id: 2,
    text: 'CTO a identifié 3 options de robots',
    time: 'hier',
    icon: CheckCircle2,
    color: 'text-green-600',
  },
  {
    id: 3,
    text: 'CMO a généré 12 leads LinkedIn',
    time: 'ce matin',
    icon: CheckCircle2,
    color: 'text-green-600',
  },
  {
    id: 4,
    text: 'COO a optimisé 2 process',
    time: 'avant-hier',
    icon: CheckCircle2,
    color: 'text-green-600',
  },
];

const projects = [
  {
    id: 1,
    name: 'Cahier Robot Soudure',
    progress: 78,
    deadline: '12 mars',
    icon: '📋',
  },
  {
    id: 2,
    name: 'Plan Marketing Q2',
    progress: 35,
    deadline: '1 avril',
    icon: '📋',
  },
  {
    id: 3,
    name: 'Subvention MEDTEQ',
    progress: 15,
    deadline: '15 mars',
    icon: '📋',
  },
];

const getStatusColor = (status: 'green' | 'yellow' | 'red') => {
  switch (status) {
    case 'green':
      return 'bg-green-500';
    case 'yellow':
      return 'bg-yellow-500';
    case 'red':
      return 'bg-red-500';
  }
};

const getStatusText = (status: 'green' | 'yellow' | 'red') => {
  switch (status) {
    case 'green':
      return 'ÉTAT: vert';
    case 'yellow':
      return 'ÉTAT: jaune';
    case 'red':
      return 'ÉTAT: rouge';
  }
};

export function CockpitView() {
  const [chatInput, setChatInput] = useState('');

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Cockpit CEO</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Recherche..." 
                className="pl-9 w-64"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Bienvenue */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">BIENVENUE CARL</h2>
              <p className="text-gray-600">
                CarlOS travaille sur <span className="font-semibold">3 projets</span>. 
                <span className="ml-4">12 tâches en cours.</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">25 février 2026</p>
            </div>
          </div>

          {/* Résumé CarlOS */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💬</div>
              <div className="flex-1">
                <h3 className="font-semibold mb-3">RÉSUMÉ CARLÖS (proactif, généré automatiquement)</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  "Cette semaine, 2 décisions importantes attendent :<br />
                  <span className="ml-4">1. Le budget automatisation (CFO a préparé 3 scénarios)</span><br />
                  <span className="ml-4">2. La soumission pour MétalPro (deadline jeudi).</span><br />
                  Le Bilan de Santé montre un progrès sur Vente (+12%)."
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">Voir les détails</Button>
                  <Button size="sm">
                    Répondre à CarlOS <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Départements - Grille */}
          <div className="grid grid-cols-3 gap-4">
            {departments.map((dept) => (
              <Card key={dept.id} className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{dept.emoji}</span>
                        <h3 className="font-semibold text-sm">{dept.name}</h3>
                      </div>
                      <p className={`text-xs font-medium ${dept.color}`}>{dept.role}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {dept.stats.map((stat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                        <span className="text-gray-700">{stat}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Score</span>
                      <span className="text-lg font-bold">{dept.score}</span>
                    </div>
                    <Progress value={dept.score} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <div className={`h-2 w-2 rounded-full ${getStatusColor(dept.status)}`} />
                    <span className="text-xs font-medium text-gray-600">
                      {getStatusText(dept.status)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Bilan de Santé + Activité */}
          <div className="grid grid-cols-2 gap-6">
            {/* Bilan de Santé */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📊</span>
                <h3 className="font-semibold">BILAN DE SANTÉ</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">(Radar VITAA)</p>
              
              <div className="w-full" style={{ height: '256px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={vitaaData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Temps: 45</span>
                  <Badge variant="destructive" className="text-xs">FAIBLE</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-500">Triangle: COUVE 🟡</Badge>
                </div>
                <p className="text-sm italic text-gray-600 mt-3">
                  "Temps est ton talon"
                </p>
              </div>
            </Card>

            {/* Activité Récente */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔥</span>
                <h3 className="font-semibold">ACTIVITÉ RÉCENTE</h3>
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${activity.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.text}</p>
                        <p className="text-xs text-gray-500 mt-1">({activity.time})</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button variant="link" className="mt-4 p-0 h-auto text-sm">
                Voir tout <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Card>
          </div>

          {/* Projets en cours */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">PROJETS EN COURS</h3>
            <div className="space-y-4">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">{project.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm mb-2">{project.name}</p>
                    <div className="flex items-center gap-3">
                      <Progress value={project.progress} className="flex-1 h-2" />
                      <span className="text-sm font-semibold text-gray-700 w-12">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{project.deadline}</span>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Projet
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Barre de chat fixe en bas */}
      <div className="border-t bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="text-xl">💬</div>
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Parle à CarlOS..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && chatInput.trim()) {
                console.log('Send:', chatInput);
                setChatInput('');
              }
            }}
          />
          <Button>
            Envoyer <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}