import { useState } from 'react';
import { ArrowLeft, Settings, Circle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';

interface Bot {
  id: string;
  avatar: string;
  agentName: string;
  name: string;
  role: string;
  trisociation: string[];
  color: string;
  borderColor: string;
  active: boolean;
  messageCount: number;
  tonality: number;
  tonalityLabel: string;
  depth: number;
  depthLabel: string;
}

interface Ghost {
  id: number;
  name: string;
  active: boolean;
}

const bots: Bot[] = [
  {
    id: 'carlos',
    avatar: '/agents/ceo-carlos.png',
    agentName: 'CarlOS',
    name: 'CEO',
    role: 'Direction',
    trisociation: ['Bezos', 'Munger', 'Churchill'],
    color: 'blue',
    borderColor: 'ring-blue-500',
    active: true,
    messageCount: 342,
    tonality: 80,
    tonalityLabel: 'Direct',
    depth: 60,
    depthLabel: 'Deep',
  },
  {
    id: 'cto',
    avatar: '/agents/cto-thomas.png',
    agentName: 'Musk',
    name: 'CTO',
    role: 'Technologie',
    trisociation: ['Musk', 'Curie', 'Vinci'],
    color: 'purple',
    borderColor: 'ring-purple-500',
    active: true,
    messageCount: 156,
    tonality: 80,
    tonalityLabel: 'Direct',
    depth: 80,
    depthLabel: 'Deep',
  },
  {
    id: 'cfo',
    avatar: '/agents/cfo-francois.png',
    agentName: 'Buffett',
    name: 'CFO',
    role: 'Finance',
    trisociation: ['Buffett', 'Munger', 'Franklin'],
    color: 'green',
    borderColor: 'ring-green-500',
    active: true,
    messageCount: 98,
    tonality: 40,
    tonalityLabel: 'Prudent',
    depth: 70,
    depthLabel: 'Deep',
  },
  {
    id: 'cmo',
    avatar: '/agents/cmo-sofia.png',
    agentName: 'Disney',
    name: 'CMO',
    role: 'Marketing',
    trisociation: ['Disney', 'Jobs/Blakely', 'Oprah'],
    color: 'pink',
    borderColor: 'ring-pink-500',
    active: true,
    messageCount: 67,
    tonality: 85,
    tonalityLabel: 'Créatif',
    depth: 65,
    depthLabel: 'Deep',
  },
  {
    id: 'cso',
    avatar: '/agents/cso-marc.png',
    agentName: 'Sun Tzu',
    name: 'CSO',
    role: 'Vente',
    trisociation: ['Sun Tzu', 'Thiel', 'Chanel'],
    color: 'red',
    borderColor: 'ring-red-500',
    active: true,
    messageCount: 112,
    tonality: 70,
    tonalityLabel: 'Stratégique',
    depth: 75,
    depthLabel: 'Deep',
  },
  {
    id: 'coo',
    avatar: '/agents/coo-lise.png',
    agentName: 'Marc Aurèle',
    name: 'COO',
    role: 'Opérations',
    trisociation: ['Marc Aurèle', 'Deming', 'Nightingale'],
    color: 'orange',
    borderColor: 'ring-orange-500',
    active: true,
    messageCount: 89,
    tonality: 60,
    tonalityLabel: 'Pragmatique',
    depth: 70,
    depthLabel: 'Deep',
  },
];

const ghosts: Ghost[] = [
  { id: 1, name: 'Bezos', active: true },
  { id: 2, name: 'Jobs', active: false },
  { id: 3, name: 'Musk', active: true },
  { id: 4, name: 'Sun Tzu', active: true },
  { id: 5, name: 'Munger', active: true },
  { id: 6, name: 'Marc A', active: true },
  { id: 7, name: 'Churchill', active: true },
  { id: 8, name: 'Disney', active: true },
  { id: 9, name: 'Tesla', active: true },
  { id: 10, name: 'Buffett', active: true },
  { id: 11, name: 'Curie', active: true },
  { id: 12, name: 'Oprah', active: true },
];

interface AITeamViewProps {
  onBack?: () => void;
}

export function AITeamView({ onBack }: AITeamViewProps) {
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const activeBotsCount = bots.filter(b => b.active).length;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      {/* En-tête */}
      <div className="bg-white border-b border-t-2 border-t-blue-600 px-4 h-12 flex items-center flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Separator orientation="vertical" className="h-5 mx-2" />
        <h1 className="text-sm font-semibold">Mon Équipe AI</h1>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Section des bots */}
          <div>
            <h2 className="text-sm font-semibold mb-4">TES 6 C-LEVEL AI</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {bots.map((bot) => (
                <Card 
                  key={bot.id} 
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-4">
                    {/* En-tête du bot */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={bot.avatar}
                          alt={bot.agentName}
                          className={`w-12 h-12 rounded-full object-cover ring-2 ${bot.borderColor}`}
                        />
                        <div>
                          <h3 className="text-sm font-semibold">{bot.agentName} — {bot.name}</h3>
                          <p className="text-sm text-gray-600">{bot.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {bot.active ? (
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-medium text-green-700">ACTIF</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-gray-400" />
                            <span className="text-xs font-medium text-gray-500">INACTIF</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Trisociation */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Trisociation:
                      </p>
                      <p className="text-sm font-medium">
                        {bot.trisociation.join(' × ')}
                      </p>
                    </div>

                    {/* Messages */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Messages échangés</span>
                      <Badge variant="secondary" className="font-semibold">
                        {bot.messageCount}
                      </Badge>
                    </div>

                    {/* Tonalité */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tonalité:</span>
                        <span className="text-xs text-gray-600">
                          {bot.tonalityLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full bg-${bot.color}-600 transition-all`}
                              style={{ width: `${bot.tonality}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-mono text-gray-500 w-12 text-right">
                          {bot.tonality}%
                        </span>
                      </div>
                    </div>

                    {/* Profondeur */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Profondeur:</span>
                        <span className="text-xs text-gray-600">
                          {bot.depthLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full bg-${bot.color}-600 transition-all`}
                              style={{ width: `${bot.depth}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-mono text-gray-500 w-12 text-right">
                          {bot.depth}%
                        </span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => setSelectedBot(bot.id)}
                    >
                      <Settings className="h-4 w-4" />
                      Configurer
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Section des Ghosts */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold mb-2">
                  GHOSTS DISPONIBLES (Modèles Cognitifs)
                </h2>
                <p className="text-sm text-gray-600">
                  Les 12 Ghosts de GhostX — Active-les pour changer la perspective de tes bots :
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-4 gap-4">
                {ghosts.map((ghost) => (
                  <div
                    key={ghost.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      ghost.active
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {ghost.active ? (
                        <CheckCircle2 className="h-4 w-4 text-blue-600 fill-blue-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">
                          G{ghost.id} {ghost.name}
                        </p>
                        {ghost.id === 9 && (
                          <p className="text-xs text-gray-500">(constant)</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 fill-blue-600" />
                    <span className="text-gray-700">= dans ta Trisociation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-gray-300" />
                    <span className="text-gray-700">= disponible</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button className="gap-2">
                  <Settings className="h-4 w-4" />
                  Personnaliser les Trisociations
                </Button>
              </div>
            </div>
          </Card>

          {/* Informations supplémentaires */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-xl">💡</span>
                Comment fonctionnent les Trisociations ?
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Chaque bot C-Level combine 3 modèles cognitifs (Ghosts) pour créer une 
                personnalité unique et équilibrée. Par exemple, CarlOS CEO mélange la vision 
                stratégique de Bezos, la sagesse de Munger, et le leadership de Churchill.
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="sm">
                  En savoir plus
                </Button>
                <Button variant="outline" size="sm">
                  Voir les exemples
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
