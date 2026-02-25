import { 
  ArrowLeft,
  Globe,
  Building2,
  Users,
  Zap,
  TrendingUp,
  DollarSign,
  Network,
  ArrowDown,
  Shield,
  Lightbulb
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface FranchiseGeneration {
  version: string;
  name: string;
  description: string;
  color: string;
}

interface NetworkStage {
  stage: number;
  title: string;
  emoji: string;
  description: string;
  features: string[];
  value: string;
}

interface RevenueSource {
  stage: number;
  source: string;
  example: string;
}

interface Circle {
  id: string;
  name: string;
  members: number;
  maxMembers: number;
  position: { x: number; y: number };
}

const franchiseGenerations: FranchiseGeneration[] = [
  { version: '1.0', name: 'McDonald\'s', description: '(même menu partout)', color: 'bg-gray-100 text-gray-700' },
  { version: '2.0', name: 'Uber', description: '(même app, chauffeurs locaux)', color: 'bg-blue-100 text-blue-700' },
  { version: '3.0', name: 'Shopify', description: '(même outil, stores uniques)', color: 'bg-green-100 text-green-700' },
  { version: '4.0', name: 'Airbnb', description: '(réseau + expériences locales)', color: 'bg-purple-100 text-purple-700' },
  { version: '5.0', name: 'GhostX Orbit9', description: '(réseau + bots + co-création)', color: 'bg-gradient-to-r from-orange-500 to-red-500 text-white' },
];

const networkStages: NetworkStage[] = [
  {
    stage: 1,
    title: 'UNE ENTREPRISE (outil)',
    emoji: '🏭',
    description: 'Mon entreprise + 6 bots C-Level',
    features: [
      'Je paie mon abo, mes bots travaillent',
      'Valeur = productivité individuelle',
    ],
    value: 'productivité individuelle',
  },
  {
    stage: 2,
    title: 'UN CERCLE (plateforme)',
    emoji: '🌐',
    description: 'Mon cercle (max 9 entreprises)',
    features: [
      'Bots coordonnés entre partenaires',
      'Matching Engine trouve les bons deals',
      'Rabais collectif (-25% max)',
      'Valeur = productivité + collaboration',
    ],
    value: 'productivité + collaboration',
  },
  {
    stage: 3,
    title: 'RÉSEAU DE CERCLES (écosystème)',
    emoji: '🌍',
    description: 'Cercles interconnectés',
    features: [
      'Matching INTER-cercles',
      'Co-créations multi-cercles',
      'VITAA + TimeTokens',
      'Assemblage à la demande (Lego/BitTorrent)',
      'Valeur = productivité + collab + innovation',
    ],
    value: 'productivité + collab + innovation',
  },
  {
    stage: 4,
    title: 'OS ÉCONOMIQUE (infrastructure)',
    emoji: '⚡',
    description: 'GhostX = le système d\'exploitation',
    features: [
      'Smart Contracts (Ethereum/Polygon)',
      'IPTokens (protection PI automatique)',
      'Économie fragmentée sur rails AI',
      'GhostX est INDISPENSABLE',
    ],
    value: 'infrastructure complète',
  },
];

const revenueSources: RevenueSource[] = [
  { stage: 1, source: 'Abonnement (fixe)', example: '9 × 2,246$ = 20,214$/mois' },
  { stage: 2, source: 'Performance (%)', example: '~12,000$/mois (sur économies)' },
  { stage: 3, source: 'Deals cercle (%)', example: '~4,500$/mois (sur transactions)' },
  { stage: 4, source: 'Co-création (part)', example: '~5,000$/mois (sur innovations)' },
];

const circles: Circle[] = [
  { id: 'pioneers', name: 'PIONNIERS', members: 9, maxMembers: 9, position: { x: 50, y: 10 } },
  { id: 'auto', name: 'AUTO', members: 7, maxMembers: 9, position: { x: 20, y: 35 } },
  { id: 'metal', name: 'METAL', members: 5, maxMembers: 9, position: { x: 50, y: 35 } },
  { id: 'serv', name: 'SERV.', members: 6, maxMembers: 9, position: { x: 80, y: 35 } },
  { id: 'cnc', name: 'CNC', members: 4, maxMembers: 9, position: { x: 20, y: 60 } },
  { id: 'qual', name: 'QUAL', members: 3, maxMembers: 9, position: { x: 50, y: 60 } },
  { id: 'innov', name: 'INNOV.', members: 8, maxMembers: 9, position: { x: 80, y: 60 } },
];

const projections = [
  { year: 'An 1', circles: 10, monthly: '~350K$', annual: '4.2M$' },
  { year: 'An 2', circles: 50, monthly: '~1.5M$', annual: '18M$' },
  { year: 'An 3', circles: 200, monthly: '~5M$', annual: '60M$' },
];

interface FranchiseViewProps {
  onBack?: () => void;
}

export function FranchiseView({ onBack }: FranchiseViewProps) {
  const totalRevenue = revenueSources.reduce((sum, source) => {
    const amount = parseInt(source.example.match(/[\d,]+/)?.[0]?.replace(/,/g, '') || '0');
    return sum + amount;
  }, 0);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="gap-2 text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Separator orientation="vertical" className="h-6 bg-white/30" />
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-white" />
              <h1 className="text-xl font-bold text-white">Orbit9 — Modèle Franchise 5.0</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-white" />
            <Badge className="bg-white text-purple-700 hover:bg-white text-sm px-3 py-1 font-bold">
              Vue Réseau
            </Badge>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* La vision */}
          <Card className="p-6 border-2 border-purple-200 bg-white">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold">LA VISION : FRANCHISE INTELLIGENTE 5.0</h2>
              </div>

              <div className="space-y-2">
                {franchiseGenerations.map((gen, idx) => (
                  <div 
                    key={gen.version}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      gen.version === '5.0' 
                        ? 'border-orange-300 shadow-lg' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className={`flex items-center gap-3 ${
                      gen.version === '5.0' ? gen.color : ''
                    }`}>
                      <Badge 
                        className={gen.version === '5.0' 
                          ? 'bg-white text-orange-600 hover:bg-white font-bold' 
                          : gen.color + ' border-0'
                        }
                      >
                        Franchise {gen.version}
                      </Badge>
                      <span className="font-semibold">=</span>
                      <span className={gen.version === '5.0' ? 'font-bold' : 'font-medium'}>
                        {gen.name}
                      </span>
                      <span className={gen.version === '5.0' ? '' : 'text-gray-600'}>
                        {gen.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-lg border-2 border-orange-200">
                <h3 className="font-bold text-lg mb-3 text-orange-900">
                  DIFFÉRENCE FONDAMENTALE :
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-start gap-2">
                    <span className="text-gray-600">•</span>
                    <span>Les franchises 1-4 = <strong>les humains font le travail</strong></span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span className="font-semibold">
                      Franchise 5.0 = <strong className="text-orange-600">les BOTS font le travail</strong>,
                      les humains <strong className="text-purple-600">DÉCIDENT et PROFITENT</strong>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Comment ça marche */}
          <Card className="p-6 border-2 border-blue-200">
            <h2 className="text-2xl font-bold mb-6">COMMENT ÇA MARCHE</h2>
            
            <div className="space-y-6">
              {networkStages.map((stage, idx) => (
                <div key={stage.stage}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-600 text-lg px-3 py-1">
                        ÉTAGE {stage.stage}
                      </Badge>
                      <span className="font-bold text-lg">: {stage.title}</span>
                    </div>

                    <Card className="p-5 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">{stage.emoji}</span>
                          <span className="font-semibold text-lg">{stage.description}</span>
                        </div>
                        <div className="space-y-2">
                          {stage.features.map((feature, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2 text-sm">
                              <ArrowDown className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-800">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {idx < networkStages.length - 1 && (
                    <div className="flex justify-center my-4">
                      <ArrowDown className="h-8 w-8 text-blue-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Modèle de revenus */}
          <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-bold">MODÈLE DE REVENUS PAR ÉTAGE</h2>
              </div>

              <div className="bg-white rounded-lg border-2 border-green-200 overflow-hidden">
                {/* En-tête */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-green-100 font-semibold text-sm">
                  <div className="col-span-1">ÉTAGE</div>
                  <div className="col-span-5">REVENUE GHOSTX</div>
                  <div className="col-span-6">EXEMPLE (1 cercle de 9)</div>
                </div>

                {/* Lignes de revenus */}
                {revenueSources.map((source) => (
                  <div 
                    key={source.stage}
                    className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0"
                  >
                    <div className="col-span-1 flex items-center">
                      <Badge variant="secondary">{source.stage}</Badge>
                    </div>
                    <div className="col-span-5 flex items-center text-sm font-medium">
                      {source.source}
                    </div>
                    <div className="col-span-6 flex items-center text-sm font-semibold text-green-600">
                      {source.example}
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="p-4 bg-green-50 border-t-2 border-green-300">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6 flex items-center font-bold text-lg">
                      TOTAL PAR CERCLE
                    </div>
                    <div className="col-span-6 flex items-center">
                      <div className="space-y-1">
                        <p className="font-bold text-2xl text-green-600">
                          ~41,714$/mois
                        </p>
                        <p className="text-lg font-semibold text-green-700">
                          = 500K$/an
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-green-200" />

              {/* Projections réseau */}
              <div>
                <h3 className="font-bold text-lg mb-4">PROJECTION RÉSEAU :</h3>
                <div className="space-y-3">
                  {projections.map((proj) => (
                    <div 
                      key={proj.year}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-green-200"
                    >
                      <div className="flex items-center gap-4">
                        <Badge className="bg-blue-600 text-base px-3 py-1">
                          {proj.circles} cercles ({proj.year})
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Mensuel</p>
                          <p className="font-bold text-lg text-green-600">{proj.monthly}/mois</p>
                        </div>
                        <span className="text-gray-400">=</span>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Annuel</p>
                          <p className="font-bold text-xl text-green-600">{proj.annual}/an</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Vue réseau live */}
          <Card className="p-6 border-2 border-purple-200">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Network className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold">VUE RÉSEAU LIVE</h2>
              </div>

              {/* Diagramme du réseau */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8 border-2 border-purple-200 min-h-[400px] relative">
                <svg className="w-full h-[400px]" viewBox="0 0 100 80">
                  {/* Lignes de connexion */}
                  <line x1="50" y1="15" x2="20" y2="35" stroke="#9333ea" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="50" y1="15" x2="50" y2="35" stroke="#9333ea" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="50" y1="15" x2="80" y2="35" stroke="#9333ea" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="20" y1="40" x2="20" y2="60" stroke="#9333ea" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="50" y1="40" x2="50" y2="60" stroke="#9333ea" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="80" y1="40" x2="80" y2="60" stroke="#9333ea" strokeWidth="0.5" strokeDasharray="2,2" />
                  
                  {/* Nœuds des cercles */}
                  {circles.map((circle) => (
                    <g key={circle.id}>
                      <circle 
                        cx={circle.position.x} 
                        cy={circle.position.y} 
                        r="8" 
                        fill={circle.id === 'pioneers' ? '#f59e0b' : circle.members === circle.maxMembers ? '#10b981' : '#3b82f6'}
                        stroke="#fff"
                        strokeWidth="1"
                      />
                      <text 
                        x={circle.position.x} 
                        y={circle.position.y - 10} 
                        textAnchor="middle" 
                        className="text-xs font-bold"
                        fill="#1f2937"
                      >
                        {circle.name}
                      </text>
                      <text 
                        x={circle.position.x} 
                        y={circle.position.y + 15} 
                        textAnchor="middle" 
                        className="text-xs"
                        fill="#6b7280"
                      >
                        ({circle.members}/{circle.maxMembers})
                      </text>
                    </g>
                  ))}
                </svg>

                <div className="mt-6 space-y-3">
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="inline-block w-12 h-0.5 bg-purple-400" style={{ borderTop: '2px dashed #9333ea' }} />
                    = connexions inter-cercles actives
                  </p>
                  <p className="text-sm text-gray-600">
                    (Chaque ligne = des bots qui collaborent)
                  </p>
                </div>
              </div>

              {/* Stats réseau */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{circles.length}</p>
                    <p className="text-sm text-gray-700">cercles</p>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      {circles.reduce((sum, c) => sum + c.members, 0)}
                    </p>
                    <p className="text-sm text-gray-700">entreprises</p>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-300">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {circles.reduce((sum, c) => sum + c.members, 0) * 6}
                    </p>
                    <p className="text-sm text-gray-700">bots actifs</p>
                  </div>
                </Card>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <span className="font-semibold">DEALS INTER-CERCLES CE MOIS :</span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">8</p>
                    <p className="text-sm text-gray-600">(valeur: 1.2M$)</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Message final */}
          <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-3">
                  GhostX = L'OS de l'économie fragmentée
                </h3>
                <p className="text-white/90 leading-relaxed mb-4">
                  Comme Windows pour les PC ou iOS pour les iPhone, GhostX devient 
                  l'infrastructure indispensable qui fait fonctionner l'économie des PME. 
                  Plus il y a de cercles, plus le réseau a de la valeur. Effet de réseau 
                  exponentiel × intelligence artificielle = position monopolistique défendable.
                </p>
                <div className="flex gap-3">
                  <Button className="bg-white text-purple-600 hover:bg-white/90">
                    Démarrer mon cercle
                  </Button>
                  <Button variant="outline" className="text-white border-white hover:bg-white/20">
                    Documentation technique
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
