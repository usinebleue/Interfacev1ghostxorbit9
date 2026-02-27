import {
  Zap,
  Bell,
  Settings,
  User,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const alerts = [
  {
    id: 1,
    type: 'urgent' as const,
    text: 'Budget automatisation — 3 scénarios prêts',
    source: 'Buffett (CFO)',
    avatar: '/agents/cfo-francois.png',
  },
  {
    id: 2,
    type: 'warning' as const,
    text: 'Soumission MétalPro — deadline jeudi',
    source: 'Sun Tzu (CSO)',
    avatar: '/agents/cso-marc.png',
  },
  {
    id: 3,
    type: 'info' as const,
    text: 'Bilan de Santé: Vente +12% ce mois',
    source: 'CarlOS (CEO)',
    avatar: '/agents/ceo-carlos.png',
  },
];

const getAlertStyle = (type: 'urgent' | 'warning' | 'info') => {
  switch (type) {
    case 'urgent': return 'border-l-red-500 bg-red-50';
    case 'warning': return 'border-l-yellow-500 bg-yellow-50';
    case 'info': return 'border-l-blue-500 bg-blue-50';
  }
};

export function InfoPanel() {
  return (
    <div className="bg-white min-h-full">
      {/* En-tête — Icônes user + CarlOS Live */}
      <div className="h-12 px-3 border-b flex items-center">
        <div className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-sm">CarlOS Live</h3>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Settings className="h-4 w-4" />
          </Button>
          <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      {/* Alertes importantes */}
      <div className="px-4 py-3 border-b">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Alertes
        </h4>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-r-lg p-2 border-l-4 ${getAlertStyle(alert.type)}`}
            >
              <div className="flex items-start gap-2">
                <img
                  src={alert.avatar}
                  alt={alert.source}
                  className="w-5 h-5 rounded-full object-cover flex-shrink-0 mt-0.5"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 leading-tight">{alert.text}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{alert.source}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score VITAA */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Bilan VITAA</span>
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            COUVE
          </Badge>
        </div>
        <div className="grid grid-cols-5 gap-1 text-center">
          {[
            { label: 'V', score: 72, color: 'text-green-600' },
            { label: 'I', score: 85, color: 'text-blue-600' },
            { label: 'T', score: 45, color: 'text-red-600' },
            { label: 'A', score: 68, color: 'text-yellow-600' },
            { label: 'A*', score: 78, color: 'text-purple-600' },
          ].map((p, i) => (
            <div key={i} className="py-1">
              <p className="text-xs font-bold text-gray-400">{p.label}</p>
              <p className={`text-sm font-bold ${p.color}`}>{p.score}</p>
            </div>
          ))}
        </div>
        <p className="text-xs italic text-gray-500 mt-1 text-center">
          "Temps est ton talon d'Achille"
        </p>
      </div>

      {/* Résumé proactif CarlOS */}
      <div className="px-4 py-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          CarlOS dit...
        </h4>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-700 leading-relaxed">
            "2 décisions t'attendent cette semaine : le budget automatisation et la soumission MétalPro. Le Bilan de Santé montre un progrès sur Vente (+12%)."
          </p>
        </div>
      </div>
    </div>
  );
}
