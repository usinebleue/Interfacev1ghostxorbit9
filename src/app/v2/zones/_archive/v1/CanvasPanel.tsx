import { 
  Activity, 
  TrendingUp, 
  Users, 
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

const stats = [
  { 
    label: 'Chiffre d\'affaires', 
    value: '1.2M€', 
    change: '+12%',
    icon: DollarSign,
    color: 'text-green-600'
  },
  { 
    label: 'Projets actifs', 
    value: '24', 
    change: '+3',
    icon: Activity,
    color: 'text-blue-600'
  },
  { 
    label: 'Équipe', 
    value: '47', 
    change: '+5',
    icon: Users,
    color: 'text-purple-600'
  },
];

const recentActivities = [
  {
    id: 1,
    title: 'Rapport mensuel généré',
    time: 'Il y a 5 min',
    status: 'success' as const,
  },
  {
    id: 2,
    title: 'Réunion planifiée',
    time: 'Il y a 12 min',
    status: 'success' as const,
  },
  {
    id: 3,
    title: 'Budget à valider',
    time: 'Il y a 1h',
    status: 'pending' as const,
  },
];

const currentTasks = [
  { id: 1, name: 'Analyse Q1 2026', progress: 75 },
  { id: 2, name: 'Recrutement Dev', progress: 45 },
  { id: 3, name: 'Audit financier', progress: 90 },
];

export function CanvasPanel() {
  return (
    <div className="w-96 border-l bg-gray-50 h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* En-tête */}
        <div>
          <h2 className="font-semibold text-lg mb-1">Canvas CarlOS</h2>
          <p className="text-xs text-gray-500">Vue d'ensemble en temps réel</p>
        </div>

        {/* Statistiques */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Indicateurs clés
          </h3>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`p-2 bg-gray-100 rounded-lg ${stat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Tâches en cours */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Tâches en cours
          </h3>
          <Card className="p-4 space-y-4">
            {currentTasks.map((task) => (
              <div key={task.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{task.name}</span>
                  <span className="text-xs text-gray-500">{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-2" />
              </div>
            ))}
          </Card>
        </div>

        {/* Activité récente */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Activité récente
          </h3>
          <Card className="p-4 space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                {activity.status === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Performance */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Performance
          </h3>
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Tendance positive</p>
                <p className="text-xs text-gray-500">+18% ce mois</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Productivité</span>
                <span className="font-medium">94%</span>
              </div>
              <Progress value={94} className="h-2" />
              
              <div className="flex justify-between text-xs mt-3">
                <span className="text-gray-600">Satisfaction</span>
                <span className="font-medium">87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
