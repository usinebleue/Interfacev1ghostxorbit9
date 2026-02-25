import { useState } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  ArrowRight,
  Send,
  AlertTriangle,
  Target,
  Calendar,
  Edit
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface HealthDashboardProps {
  onBack?: () => void;
}

const vitaaData = [
  { subject: 'Vente', value: 72, fullMark: 100 },
  { subject: 'Idée', value: 85, fullMark: 100 },
  { subject: 'Argent', value: 68, fullMark: 100 },
  { subject: 'Temps', value: 45, fullMark: 100 },
  { subject: 'Actif', value: 81, fullMark: 100 },
];

const recommendations = [
  {
    id: 1,
    pillar: 'TEMPS',
    current: 45,
    target: 65,
    priority: 'critical',
    title: 'TEMPS (45 → 65 nécessaire)',
    description: 'Tu disperses ton énergie. COO Bot peut automatiser 3 processus qui te libèrent 15h/semaine.',
    action: 'Activer COO Bot',
    icon: '🔥',
  },
  {
    id: 2,
    pillar: 'VENTE',
    current: 72,
    target: 80,
    priority: 'high',
    title: 'VENTE (72 → 80 en 3 mois)',
    description: 'Tu as les idées mais pas assez de pipeline. CMO Bot peut générer 20 leads/semaine.',
    action: 'Activer CMO Bot',
    icon: '🎯',
  },
];

const history = [
  { month: 'Fév', score: 68, change: '+6' },
  { month: 'Jan', score: 62, change: '+7' },
  { month: 'Déc', score: 55, change: '+4' },
  { month: 'Nov', score: 51, change: '-' },
];

const objectives = [
  { pillar: 'Temps', current: 45, target: 65, weeks: 8 },
  { pillar: 'Vente', current: 72, target: 80, weeks: 12 },
];

const getPillarColor = (value: number) => {
  if (value >= 80) return 'text-green-600';
  if (value >= 65) return 'text-blue-600';
  if (value >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

const getPillarBgColor = (value: number) => {
  if (value >= 80) return 'bg-green-50 border-green-200';
  if (value >= 65) return 'bg-blue-50 border-blue-200';
  if (value >= 50) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
};

export function HealthDashboard({ onBack }: HealthDashboardProps) {
  const [chatInput, setChatInput] = useState('');
  
  const globalScore = (vitaaData.reduce((sum, item) => sum + item.value, 0) / vitaaData.length).toFixed(1);
  const triangleStatus = 'COUVE';
  const triangleEmoji = '🟡';

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* En-tête */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Cockpit
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-xl font-semibold">Mon Bilan de Santé</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Dernière MAJ:</span>
            <Badge variant="secondary">Aujourd'hui</Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Zone principale */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Scorecard VITAA */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">SCORECARD VITAA</h2>
              
              <div className="grid grid-cols-2 gap-8">
                {/* Graphique Radar */}
                <div>
                  <div className="w-full" style={{ height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={vitaaData}>
                        <PolarGrid />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fontSize: 14, fontWeight: 500 }}
                        />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Score"
                          dataKey="value"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.4}
                          strokeWidth={2}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Scores détaillés */}
                <div className="space-y-4">
                  {vitaaData.map((item) => (
                    <div key={item.subject} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{item.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${getPillarColor(item.value)}`}>
                            {item.value}/100
                          </span>
                          {item.value < 50 && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={item.value} 
                        className="h-2"
                      />
                    </div>
                  ))}

                  <Separator className="my-4" />

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">SCORE GLOBAL:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {globalScore}/100
                      </span>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${getPillarBgColor(45)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">TRIANGLE DU FEU:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{triangleStatus}</span>
                          <span className="text-xl">{triangleEmoji}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-700">
                        (4 piliers actifs, Temps trop faible)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recommandations CarlOS */}
            <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🔥</span>
                <h2 className="text-lg font-semibold">
                  POUR PASSER DE {triangleStatus} À BRÛLE :
                </h2>
              </div>

              <div className="space-y-6">
                {recommendations.map((rec, idx) => (
                  <div 
                    key={rec.id}
                    className="bg-white rounded-lg p-5 border shadow-sm"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2 text-gray-900">
                          {idx + 1}. {rec.title}
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed mb-4">
                          "{rec.description}"
                        </p>
                        <Button className="gap-2">
                          {rec.action} <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={rec.priority === 'critical' ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {rec.priority === 'critical' ? 'URGENT' : 'IMPORTANT'}
                        </Badge>
                        <div className="text-right mt-2">
                          <Progress 
                            value={(rec.current / rec.target) * 100} 
                            className="w-24 h-2"
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            {rec.current}/{rec.target}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Double Diagnostic */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">DOUBLE DIAGNOSTIC</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-semibold text-sm mb-1">Timbre Savoir</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">S</Badge>
                      <Badge variant="secondary" className="font-mono text-xs">P</Badge>
                      <Badge variant="secondary" className="font-mono text-xs">T</Badge>
                      <Badge variant="secondary" className="font-mono text-xs">H</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Analyser</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <p className="font-semibold text-sm mb-1">Timbre Valeur</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">A</Badge>
                      <Badge variant="secondary" className="font-mono text-xs">I</Badge>
                      <Badge variant="secondary" className="font-mono text-xs">A*</Badge>
                      <Badge variant="secondary" className="font-mono text-xs">V</Badge>
                      <Badge variant="secondary" className="font-mono text-xs">T</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Analyser</Button>
                </div>

                <Button variant="link" className="w-full mt-4">
                  Voir le diagnostic complet <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Canvas droit */}
        <div className="w-80 border-l bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Historique */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold">HISTORIQUE</h3>
              </div>
              
              <div className="space-y-3">
                {history.map((entry, idx) => (
                  <div 
                    key={entry.month}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      idx === 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{entry.month}</p>
                      <p className="text-xs text-gray-600">{entry.score} pts</p>
                    </div>
                    {entry.change !== '-' && (
                      <Badge variant="secondary" className="text-xs">
                        {entry.change}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-sm">Tendance: ↑</span>
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-green-600">+19 pts</span> en 4 mois
                </p>
              </div>
            </Card>

            {/* Objectifs */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-600" />
                  <h3 className="font-semibold">OBJECTIFS</h3>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {objectives.map((obj) => (
                  <div key={obj.pillar} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{obj.pillar}</span>
                      <span className="text-xs text-gray-600">
                        {obj.current}→{obj.target}
                      </span>
                    </div>
                    <Progress 
                      value={(obj.current / obj.target) * 100} 
                      className="h-2"
                    />
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{obj.weeks} sem.</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" className="w-full mt-4">
                Modifier
              </Button>
            </Card>

            {/* Conseils rapides */}
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900">💡 Conseil du jour</p>
                <p className="text-sm text-gray-700">
                  "Concentre-toi sur ton pilier TEMPS cette semaine. 
                  Une amélioration de 10 points te fera passer à BRÛLE."
                </p>
                <Button size="sm" className="w-full">
                  Activer le plan
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Barre de chat en bas */}
      <div className="border-t bg-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="text-xl">💬</div>
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Parle à CarlOS de ton bilan..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && chatInput.trim()) {
                console.log('Send:', chatInput);
                setChatInput('');
              }
            }}
          />
          <Button
            disabled={!chatInput.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Envoyer <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
