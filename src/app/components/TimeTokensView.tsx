import { useState } from 'react';
import { 
  ArrowLeft,
  TrendingUp,
  Calendar,
  Award,
  Info,
  ChevronRight,
  Lock,
  DollarSign
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface Contribution {
  id: string;
  amount: number;
  description: string;
  pillar: string;
  pillarName: string;
  measuredBy: string;
  date: string;
  period: 'this-week' | 'last-week';
}

interface BalanceBreakdown {
  source: string;
  amount: number;
  color: string;
}

const balance = {
  total: 1847,
  estimatedValue: 18470,
  breakdown: [
    { source: 'Cercle Pionniers', amount: 892, color: 'text-blue-600' },
    { source: 'Co-Création Médical', amount: 648, color: 'text-purple-600' },
    { source: 'Contributions solo', amount: 307, color: 'text-green-600' },
  ] as BalanceBreakdown[],
};

const contributions: Contribution[] = [
  {
    id: '1',
    amount: 45,
    description: 'Coordination Cercle',
    pillar: 'T',
    pillarName: 'Temps',
    measuredBy: 'COO Bot',
    date: 'Il y a 1 jour',
    period: 'this-week',
  },
  {
    id: '2',
    amount: 120,
    description: 'Design dispositif médical',
    pillar: 'I',
    pillarName: 'Idée',
    measuredBy: 'CTO Bot',
    date: 'Il y a 2 jours',
    period: 'this-week',
  },
  {
    id: '3',
    amount: 35,
    description: '3 clients référés',
    pillar: 'V',
    pillarName: 'Vente',
    measuredBy: 'CMO Bot',
    date: 'Il y a 3 jours',
    period: 'this-week',
  },
  {
    id: '4',
    amount: 200,
    description: 'Prototype usinage validé',
    pillar: 'I',
    pillarName: 'Idée',
    measuredBy: 'CTO Bot',
    date: 'Il y a 8 jours',
    period: 'last-week',
  },
  {
    id: '5',
    amount: 30,
    description: 'Investissement 15K$ phase 2',
    pillar: 'A',
    pillarName: 'Argent',
    measuredBy: 'CFO Bot',
    date: 'Il y a 9 jours',
    period: 'last-week',
  },
  {
    id: '6',
    amount: 15,
    description: '8h de tests qualité',
    pillar: 'T',
    pillarName: 'Temps',
    measuredBy: 'COO Bot',
    date: 'Il y a 10 jours',
    period: 'last-week',
  },
];

const evolutionData = [
  { month: 'J', value: 400 },
  { month: 'F', value: 800 },
  { month: 'M', value: 1200 },
  { month: 'A', value: 1580 },
  { month: 'M', value: 1847 },
];

const getPillarColor = (pillar: string) => {
  switch (pillar) {
    case 'V':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'I':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'T':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'A':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'A*':
      return 'bg-teal-100 text-teal-700 border-teal-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

interface TimeTokensViewProps {
  onBack?: () => void;
}

export function TimeTokensView({ onBack }: TimeTokensViewProps) {
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
            <h1 className="text-xl font-semibold">Orbit9 — TimeTokens</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Balance:</span>
            <Badge className="bg-purple-600 text-lg px-3 py-1">
              {balance.total.toLocaleString()} TT
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Zone principale */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Balance */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <h2 className="text-sm text-gray-600 mb-1">BALANCE TOTALE :</h2>
                    <p className="text-4xl font-bold text-purple-900">
                      {balance.total.toLocaleString()} TT
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Répartition :</h3>
                  <div className="space-y-2">
                    {balance.breakdown.map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between bg-white p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          <span className="text-sm">{item.source}</span>
                        </div>
                        <span className={`font-bold ${item.color}`}>
                          {item.amount.toLocaleString()} TT
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Valeur estimée :</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ~{balance.estimatedValue.toLocaleString()}$ CAD
                    </p>
                    <p className="text-xs text-gray-600">
                      (basé sur les revenus des projets)
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Historique des contributions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                HISTORIQUE DES CONTRIBUTIONS
              </h2>

              {/* Cette semaine */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">CETTE SEMAINE</h3>
                </div>
                <div className="space-y-3">
                  {contributions.filter(c => c.period === 'this-week').map((contrib) => (
                    <div 
                      key={contrib.id}
                      className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-600 font-bold">
                              +{contrib.amount} TT
                            </Badge>
                            <span className="font-semibold">{contrib.description}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Pilier:</span>
                              <Badge 
                                variant="outline"
                                className={`font-semibold border ${getPillarColor(contrib.pillar)}`}
                              >
                                {contrib.pillarName} ({contrib.pillar})
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-600">Mesuré par: </span>
                              <span className="font-medium">{contrib.measuredBy}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-4">
                          {contrib.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Semaine dernière */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">SEMAINE DERNIÈRE</h3>
                </div>
                <div className="space-y-2">
                  {contributions.filter(c => c.period === 'last-week').map((contrib) => (
                    <div 
                      key={contrib.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Badge variant="secondary" className="font-semibold">
                          +{contrib.amount} TT
                        </Badge>
                        <span className="text-sm">{contrib.description}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {contrib.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              <Button variant="outline" className="w-full gap-2">
                Voir tout l'historique <ChevronRight className="h-4 w-4" />
              </Button>
            </Card>

            {/* Comment ça marche */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">COMMENT ÇA MARCHE</h2>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    Tes bots mesurent tes contributions AUTOMATIQUEMENT.
                  </p>
                  <div className="space-y-2 text-sm text-gray-700 pl-7">
                    <p>✓ Pas de self-reporting.</p>
                    <p>✓ Pas de "j'ai travaillé 40h".</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-2 text-sm text-gray-700">
                  <p>
                    <strong className="text-purple-700">Le CTO Bot</strong> sait combien de specs tu as produites.
                  </p>
                  <p>
                    <strong className="text-green-700">Le CFO Bot</strong> sait combien tu as investi.
                  </p>
                  <p>
                    <strong className="text-orange-700">Le COO Bot</strong> sait combien d'heures ont été mises.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="font-medium">V1 = Off-chain</span>
                    </div>
                    <Badge variant="secondary">maintenant</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-medium">V2 = Audit trail PostgreSQL</span>
                    </div>
                    <Badge variant="outline">2027</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="font-medium">V3 = Smart Contracts</span>
                    </div>
                    <Badge variant="outline">2028</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Canvas droit */}
        <div className="w-80 border-l bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Formule TT-RG */}
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="space-y-3">
                <h3 className="font-semibold text-center">FORMULE TT-RG</h3>
                
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-center font-mono text-xl font-bold text-purple-600 mb-3">
                    TT = A×D×I×Z
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold">A</span>
                      <span className="text-gray-700">Allocation</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">D</span>
                      <span className="text-gray-700">Densité</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">I</span>
                      <span className="text-gray-700">Impact</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Z</span>
                      <span className="text-gray-700">Momentum</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-sm font-semibold text-amber-900 text-center">
                    5D: ×Pilier VITAA
                  </p>
                </div>

                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Info className="h-3.5 w-3.5" />
                  En savoir plus
                </Button>
              </div>
            </Card>

            {/* Évolution */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">ÉVOLUTION</h3>
              <div style={{ height: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">Croissance mensuelle</p>
                <p className="text-2xl font-bold text-purple-600">
                  {evolutionData[evolutionData.length - 1].value.toLocaleString()}
                </p>
              </div>
            </Card>

            {/* IPTokens */}
            <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-orange-600" />
                  <h3 className="font-semibold">MES IPTokens</h3>
                </div>

                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🏆</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">2</p>
                      <p className="text-xs text-gray-600">brevets déposés</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>PI protégée via IPToken</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">Irréversible</span>
                    </p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full gap-2">
                  Détails <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>

            {/* Stats rapides */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">STATS RAPIDES</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Contributions ce mois</span>
                  <span className="font-bold">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">TT gagnés ce mois</span>
                  <span className="font-bold text-purple-600">+647 TT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pilier principal</span>
                  <Badge className="bg-purple-600">Idée (I)</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Croissance</span>
                  <div className="flex items-center gap-1 text-green-600 font-bold">
                    <TrendingUp className="h-4 w-4" />
                    +16.9%
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
