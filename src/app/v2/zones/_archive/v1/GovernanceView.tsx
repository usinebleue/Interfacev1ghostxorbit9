import {
  ArrowLeft,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit,
  Lock
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface Axiom {
  number: number;
  title: string;
  description: string;
  subtitle?: string;
  color: string;
}

interface Role {
  emoji: string;
  title: string;
  holder: string;
  description: string;
  color: string;
}

interface ExitQuadrant {
  id: string;
  title: string;
  process: string;
  timeline: string;
  color: string;
  icon: React.ElementType;
}

const axioms: Axiom[] = [
  {
    number: 1,
    title: 'PROCESSUS > PERSONNES',
    description: 'L\'autorité est dans la structure, pas dans les individus',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    number: 2,
    title: 'DOMAINE SOUVERAIN',
    description: 'Chaque cercle gère son périmètre, aucune interférence',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    number: 3,
    title: 'TENSION = CARBURANT',
    description: 'Tout écart entre réalité et potentiel = tension légitime',
    subtitle: '(= stade "Connecter" du CREDO)',
    color: 'bg-orange-50 border-orange-200',
  },
  {
    number: 4,
    title: 'ÉVOLUTION CONTINUE',
    description: 'La gouvernance évolue une tension à la fois',
    color: 'bg-green-50 border-green-200',
  },
];

const roles: Role[] = [
  {
    emoji: '👑',
    title: 'Facilitateur',
    holder: 'Carl Fugère',
    description: 'élu par le cercle',
    color: 'bg-amber-50 border-amber-300',
  },
  {
    emoji: '📋',
    title: 'Secrétaire',
    holder: 'Julie Tremblay',
    description: 'élu par le cercle',
    color: 'bg-blue-50 border-blue-300',
  },
  {
    emoji: '🔗',
    title: 'Rep-Lien',
    holder: 'Marc Dupuis',
    description: 'connexion avec Usine Bleue',
    color: 'bg-purple-50 border-purple-300',
  },
];

const exitQuadrants: ExitQuadrant[] = [
  {
    id: 'q1',
    title: 'Q1: Rachat TT',
    process: 'Transition 90j',
    timeline: 'VOLONTAIRE × BON TERME',
    color: 'bg-green-50 border-green-300',
    icon: CheckCircle2,
  },
  {
    id: 'q2',
    title: 'Q2: Médiation',
    process: 'CREDO-Intégrative',
    timeline: 'VOLONTAIRE × CONFLIT',
    color: 'bg-yellow-50 border-yellow-300',
    icon: AlertTriangle,
  },
  {
    id: 'q3',
    title: 'Q3: Warning 3x',
    process: 'Plan correction',
    timeline: 'INVOLONTAIRE × BON TERME',
    color: 'bg-orange-50 border-orange-300',
    icon: AlertTriangle,
  },
  {
    id: 'q4',
    title: 'Q4: Succession',
    process: 'Assurance croisée',
    timeline: 'INVOLONTAIRE × CONFLIT',
    color: 'bg-red-50 border-red-300',
    icon: XCircle,
  },
];

interface GovernanceViewProps {
  onBack?: () => void;
}

export function GovernanceView({ onBack }: GovernanceViewProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* En-tête */}
      <div className="bg-white border-b border-t-2 border-t-blue-600 px-4 h-12 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Separator orientation="vertical" className="h-5 mx-2" />
        <h1 className="text-sm font-semibold">Orbit9 — Gouvernance</h1>
      </div>

      {/* Contenu */}
      <div className="flex-1 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Gouvernance Holacratique */}
          <Card className="p-6 border-2 border-purple-200">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">GOUVERNANCE HOLACRATIQUE</h2>
                  <p className="text-sm text-gray-600">Principes non-négociables du cercle</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-4">4 AXIOMES (non-négociables) :</h3>
                <div className="space-y-4">
                  {axioms.map((axiom) => (
                    <Card 
                      key={axiom.number}
                      className={`p-5 border-2 ${axiom.color}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-purple-600 text-xs px-3 py-1 font-bold">
                            {axiom.number}
                          </Badge>
                          <h4 className="text-sm font-semibold">{axiom.title}</h4>
                        </div>
                        <p className="text-gray-700 ml-12">{axiom.description}</p>
                        {axiom.subtitle && (
                          <p className="text-sm text-gray-600 italic ml-12">
                            {axiom.subtitle}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Rôles élus */}
          <Card className="p-6 border-2 border-blue-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-bold">RÔLES ÉLUS</h2>
                </div>
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Proposer un changement de rôle
                </Button>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                {roles.map((role) => (
                  <Card 
                    key={role.title}
                    className={`p-5 border-2 ${role.color}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{role.emoji}</span>
                        <h3 className="text-sm font-semibold">{role.title}</h3>
                      </div>
                      <Separator />
                      <div>
                        <p className="font-semibold text-gray-900">{role.holder}</p>
                        <p className="text-sm text-gray-600">({role.description})</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-blue-900">À propos des rôles :</p>
                  <ul className="space-y-1 text-gray-700 ml-4">
                    <li>• <strong>Facilitateur</strong> : Anime les réunions, garde le processus</li>
                    <li>• <strong>Secrétaire</strong> : Documente les décisions, tient le registre</li>
                    <li>• <strong>Rep-Lien</strong> : Fait le pont entre le cercle et Usine Bleue</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Matrice de sortie */}
          <Card className="p-6 border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <h2 className="text-sm font-bold">MATRICE DE SORTIE</h2>
                  <p className="text-sm text-gray-600">
                    Protocoles pour gérer les départs du cercle
                  </p>
                </div>
              </div>

              <Separator className="bg-red-200" />

              {/* Tableau de la matrice */}
              <div className="bg-white rounded-lg border-2 border-red-200 overflow-hidden">
                {/* En-tête */}
                <div className="grid grid-cols-3 border-b-2 border-red-200">
                  <div className="p-4 bg-red-100 border-r-2 border-red-200" />
                  <div className="p-4 bg-red-100 border-r-2 border-red-200 font-bold text-center">
                    BON TERME
                  </div>
                  <div className="p-4 bg-red-100 font-bold text-center">
                    CONFLIT
                  </div>
                </div>

                {/* Ligne VOLONTAIRE */}
                <div className="grid grid-cols-3 border-b-2 border-red-200">
                  <div className="p-4 bg-red-100 border-r-2 border-red-200 font-bold flex items-center">
                    VOLONTAIRE
                  </div>
                  <div className="p-4 border-r-2 border-red-200">
                    <Card className={`p-4 border-2 ${exitQuadrants[0].color}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <h4 className="font-bold">{exitQuadrants[0].title}</h4>
                      </div>
                      <p className="text-sm text-gray-700">{exitQuadrants[0].process}</p>
                    </Card>
                  </div>
                  <div className="p-4">
                    <Card className={`p-4 border-2 ${exitQuadrants[1].color}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <h4 className="font-bold">{exitQuadrants[1].title}</h4>
                      </div>
                      <p className="text-sm text-gray-700">{exitQuadrants[1].process}</p>
                    </Card>
                  </div>
                </div>

                {/* Ligne INVOLONTAIRE */}
                <div className="grid grid-cols-3">
                  <div className="p-4 bg-red-100 border-r-2 border-red-200 font-bold flex items-center">
                    INVOLONTAIRE
                  </div>
                  <div className="p-4 border-r-2 border-red-200">
                    <Card className={`p-4 border-2 ${exitQuadrants[2].color}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <h4 className="font-bold">{exitQuadrants[2].title}</h4>
                      </div>
                      <p className="text-sm text-gray-700">{exitQuadrants[2].process}</p>
                    </Card>
                  </div>
                  <div className="p-4">
                    <Card className={`p-4 border-2 ${exitQuadrants[3].color}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <h4 className="font-bold">{exitQuadrants[3].title}</h4>
                      </div>
                      <p className="text-sm text-gray-700">{exitQuadrants[3].process}</p>
                    </Card>
                  </div>
                </div>
              </div>

              <Separator className="bg-red-200" />

              {/* Protection PI */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-5 rounded-lg border-2 border-purple-200">
                <div className="flex items-start gap-3">
                  <Lock className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-bold text-purple-900">Protection PI :</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Contributions trackées via <strong>TimeTokens</strong> et attribuées{' '}
                      <strong className="text-purple-700">IRRÉVERSIBLEMENT</strong> via{' '}
                      <strong>IPTokens</strong>.
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Badge className="bg-purple-600">TimeTokens actif</Badge>
                      <Badge className="bg-blue-600">IPTokens actif</Badge>
                      <Badge className="bg-green-600">Protection garantie</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Détails des quadrants */}
          <Card className="p-6 border-2 border-gray-200">
            <h3 className="text-sm font-semibold mb-4">DÉTAILS DES SCÉNARIOS DE SORTIE</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <h4 className="font-bold text-green-900">Q1: Rachat TT</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1 ml-6">
                    <li>• Rachat des TimeTokens au prix marché</li>
                    <li>• Période de transition de 90 jours</li>
                    <li>• Conservation des IPTokens à vie</li>
                    <li>• Référence positive garantie</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <h4 className="font-bold text-yellow-900">Q2: Médiation</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1 ml-6">
                    <li>• Processus CREDO-Intégrative</li>
                    <li>• Médiateur neutre (Rep-Lien)</li>
                    <li>• Résolution sous 30 jours max</li>
                    <li>• Rachat selon arbitrage</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <h4 className="font-bold text-orange-900">Q3: Warning 3x</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1 ml-6">
                    <li>• 3 avertissements formels</li>
                    <li>• Plan de correction obligatoire</li>
                    <li>• Période probatoire 60 jours</li>
                    <li>• Si échec → Q4</li>
                  </ul>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <h4 className="font-bold text-red-900">Q4: Succession</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1 ml-6">
                    <li>• Sortie immédiate du cercle</li>
                    <li>• Assurance croisée activée</li>
                    <li>• TimeTokens gelés 12 mois</li>
                    <li>• IPTokens conservés (PI protégée)</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Message final */}
          <Card className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold mb-2">
                  Gouvernance transparente et équitable
                </h3>
                <p className="text-white/90 leading-relaxed mb-4">
                  Cette structure de gouvernance protège tous les membres du cercle, 
                  garantit l'équité des contributions via TimeTokens, et assure que 
                  la propriété intellectuelle reste protégée même en cas de départ. 
                  Les règles sont claires, appliquées par processus, et évoluent 
                  démocratiquement.
                </p>
                <div className="flex gap-3">
                  <Button className="bg-white text-purple-600 hover:bg-white/90">
                    Consulter la constitution complète
                  </Button>
                  <Button variant="outline" className="text-white border-white hover:bg-white/20">
                    Proposer une amélioration
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
