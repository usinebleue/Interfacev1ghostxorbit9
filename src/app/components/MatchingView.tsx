import { useState } from 'react';
import { 
  ArrowLeft, 
  Search,
  TrendingUp,
  Mail,
  MessageSquare,
  X,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';

interface Need {
  id: string;
  title: string;
  detectedBy: string;
  botColor: string;
  forProject: string;
  urgency: 'high' | 'medium' | 'low';
  matchCount: number;
}

interface Match {
  id: string;
  name: string;
  sector: string;
  location: string;
  joinedDate: string;
  circle: string;
  circleMembers: string;
  reasons: string[];
  vitaa: {
    v: number;
    i: number;
    t: number;
    a: number;
    astar: number;
  };
  compatibility: number;
  isAnonymized: boolean;
  anonymizedName?: string;
}

const needs: Need[] = [
  {
    id: '1',
    title: 'Certification ISO 13485',
    detectedBy: 'CTO Bot',
    botColor: '🟣',
    forProject: 'Cahier Micro-Usinage Médical',
    urgency: 'high',
    matchCount: 3,
  },
  {
    id: '2',
    title: 'Expert en subventions',
    detectedBy: 'CFO Bot',
    botColor: '🟢',
    forProject: 'Dossier MEDTEQ',
    urgency: 'medium',
    matchCount: 5,
  },
  {
    id: '3',
    title: 'Fournisseur acier médical',
    detectedBy: 'COO Bot',
    botColor: '🟠',
    forProject: 'Production implants',
    urgency: 'medium',
    matchCount: 2,
  },
];

const matches: Match[] = [
  {
    id: '1',
    name: 'QualitéPlus Inc.',
    sector: 'Qualité / Certification',
    location: 'Drummondville, QC',
    joinedDate: 'Janvier 2026',
    circle: 'Innovation',
    circleMembers: '7/9 membres',
    reasons: [
      'Certifié ISO 13485 depuis 2019',
      '12 projets médicaux complétés',
      'Disponible Q2 2026',
      'Budget compatible',
    ],
    vitaa: { v: 5, i: 6, t: 9, a: 4, astar: 7 },
    compatibility: 87,
    isAnonymized: false,
  },
  {
    id: '2',
    name: 'Entreprise certifiée ISO en Mauricie',
    sector: 'Qualité / Certification',
    location: 'Mauricie, QC',
    joinedDate: 'Février 2026',
    circle: 'Non révélé',
    circleMembers: 'Non révélé',
    reasons: [
      'Certifié ISO 13485',
      'Expérience dispositifs médicaux',
      'Disponibilité confirmée',
    ],
    vitaa: { v: 6, i: 5, t: 8, a: 5, astar: 6 },
    compatibility: 78,
    isAnonymized: true,
    anonymizedName: 'Entreprise certifiée ISO en Mauricie',
  },
];

const userVitaa = { v: 7, i: 8, t: 5, a: 6, astar: 9 };

const getUrgencyBadge = (urgency: 'high' | 'medium' | 'low') => {
  switch (urgency) {
    case 'high':
      return (
        <Badge className="bg-red-600 gap-1">
          <Zap className="h-4 w-4" />
          Haute
        </Badge>
      );
    case 'medium':
      return <Badge className="bg-orange-500">Moyenne</Badge>;
    case 'low':
      return <Badge className="bg-gray-500">Basse</Badge>;
  }
};

interface MatchingViewProps {
  onBack?: () => void;
}

export function MatchingView({ onBack }: MatchingViewProps) {
  const [selectedNeed, setSelectedNeed] = useState<string | null>('1');
  const [selectedMatch, setSelectedMatch] = useState<string | null>('1');

  const currentNeed = needs.find(n => n.id === selectedNeed);
  const currentMatch = matches.find(m => m.id === selectedMatch);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      {/* En-tête */}
      <div className="bg-white border-b border-t-2 border-t-blue-600 px-4 h-12 flex items-center flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Separator orientation="vertical" className="h-5 mx-2" />
        <h1 className="text-sm font-semibold">Orbit9 — Matching</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Zone principale */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Besoins détectés */}
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xs font-semibold mb-2">
                  BESOINS DÉTECTÉS PAR TES BOTS
                </h2>
                <p className="text-sm text-gray-600">
                  CarlOS analyse tes projets et détecte ce dont tu as besoin :
                </p>
              </div>

              <div className="space-y-4">
                {needs.map((need) => (
                  <div
                    key={need.id}
                    className={`p-5 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedNeed === need.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedNeed(need.id)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Search className="h-4 w-4 text-blue-600" />
                            <h3 className="font-semibold">
                              BESOIN {need.id} — {need.title}
                            </h3>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Détecté par: </span>
                              <span className="font-medium">
                                {need.botColor} {need.detectedBy}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Pour: </span>
                              <span className="font-medium">{need.forProject}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getUrgencyBadge(need.urgency)}
                          <Badge variant="secondary" className="font-semibold">
                            {need.matchCount} matchs
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant={selectedNeed === need.id ? 'default' : 'outline'}
                        size="sm" 
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNeed(need.id);
                        }}
                      >
                        Voir les matchs <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Match détaillé */}
            {currentMatch && currentNeed && (
              <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
                <div className="space-y-6">
                  {/* En-tête du match */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h2 className="text-sm font-bold text-green-800 mb-1">
                            MEILLEUR MATCH : {currentMatch.name}
                          </h2>
                          {currentMatch.isAnonymized && (
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <p className="text-xs text-orange-700 font-medium">
                                Informations anonymisées jusqu'à acceptation mutuelle
                              </p>
                            </div>
                          )}
                        </div>
                        <Badge className="bg-green-600 text-xs px-3 py-1">
                          {currentMatch.compatibility}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{currentMatch.sector}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            {currentMatch.isAnonymized ? 'Location révélée après match' : currentMatch.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            Dans le réseau depuis: {currentMatch.joinedDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            Cercle: {currentMatch.circle} {!currentMatch.isAnonymized && `(${currentMatch.circleMembers})`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Pourquoi ce match */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      POURQUOI CE MATCH :
                    </h3>
                    <div className="space-y-2">
                      {currentMatch.reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Compatibilité VITAA */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      COMPATIBILITÉ VITAA :
                    </h3>
                    <div className="bg-white rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Toi:</span>
                        <div className="flex gap-4 font-mono text-sm">
                          <span>V:{userVitaa.v}</span>
                          <span>I:{userVitaa.i}</span>
                          <span>T:{userVitaa.t}</span>
                          <span>A:{userVitaa.a}</span>
                          <span>A*:{userVitaa.astar}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Eux:</span>
                        <div className="flex gap-4 font-mono text-sm">
                          <span>V:{currentMatch.vitaa.v}</span>
                          <span>I:{currentMatch.vitaa.i}</span>
                          <span>T:{currentMatch.vitaa.t}</span>
                          <span>A:{currentMatch.vitaa.a}</span>
                          <span>A*:{currentMatch.vitaa.astar}</span>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">Complémentarité:</span>
                          <span className="font-bold text-green-600">{currentMatch.compatibility}%</span>
                        </div>
                        <Progress value={currentMatch.compatibility} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
                      <Mail className="h-4 w-4" />
                      Envoyer une proposition
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Discuter avec CarlOS d'abord
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Note sur l'anonymisation */}
            <Card className="p-5 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-900">
                    NOTE: Les infos des entreprises sont ANONYMISÉES
                  </h3>
                  <p className="text-sm text-blue-800">
                    Jusqu'à ce que les 2 parties acceptent le match.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">
                        ❌ Avant le match:
                      </p>
                      <p className="text-gray-700 italic">
                        "Entreprise certifiée ISO en Mauricie"
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">
                        ✅ Après le match:
                      </p>
                      <p className="text-gray-700 italic">
                        "QualitéPlus Inc, Drummondville"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Canvas droit */}
        <div className="w-80 border-l bg-white">
          <div className="p-6 space-y-6">
            {/* Stats réseau */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold">RÉSEAU</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Entreprises</span>
                  <span className="font-bold text-sm">350</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cercles</span>
                  <span className="font-bold text-sm">42</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Secteurs</span>
                  <span className="font-bold text-sm">12</span>
                </div>
                <Separator />
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Ton cercle:</p>
                  <p className="font-bold text-blue-600">Pionniers</p>
                  <p className="text-xs text-gray-600">(9 membres)</p>
                </div>
              </div>
            </Card>

            {/* Matchs suggérés */}
            <Card className="p-4 bg-gradient-to-br from-green-50 to-blue-50">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold">MATCHS SUGGÉRÉS</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm mb-1">
                    <span className="font-bold text-green-600">3 nouveaux</span>
                  </p>
                  <p className="text-xs text-gray-600">cette semaine</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Pertinence:</span>
                    <span className="font-bold text-green-600">92%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: '92%' }}
                      />
                    </div>
                  </div>
                </div>
                <Button size="sm" className="w-full gap-2 mt-3">
                  Voir tout <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Filtres rapides */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">FILTRES RAPIDES</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Urgence haute
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Québec seulement
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Compatibilité 80%+
                </Button>
              </div>
            </Card>

            {/* Activité récente */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">ACTIVITÉ RÉCENTE</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Match accepté</p>
                    <p className="text-xs text-gray-600">Il y a 2h</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Nouveau besoin détecté</p>
                    <p className="text-xs text-gray-600">Il y a 5h</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Proposition envoyée</p>
                    <p className="text-xs text-gray-600">Hier</p>
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

// Import manquant
import { Briefcase } from 'lucide-react';
