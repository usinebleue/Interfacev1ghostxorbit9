import { useState } from 'react';
import { 
  ArrowLeft, 
  Settings,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ChevronRight,
  Calendar,
  Lock,
  MessageSquare,
  Send
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Input } from './ui/input';

interface Member {
  id: string;
  name: string;
  shortName: string;
  sector: string;
  contact: string;
  joinDate: string;
  plan: string;
  connections: {
    type: string;
    color: string;
    activity: string;
  }[];
  deals: {
    title: string;
    amount: string;
    status: string;
  }[];
  vitaaContribution: {
    v: number;
    i: number;
    t: number;
    a: number;
    astar: number;
    score: number;
    percentage: number;
  };
}

interface CircleActivity {
  id: string;
  type: 'deal' | 'subsidy' | 'member';
  time: string;
  title: string;
  description: string;
  amount?: string;
}

const members: Member[] = [
  {
    id: 'carl',
    name: 'Carl Industries',
    shortName: 'CARL\nCEO',
    sector: 'Fabrication',
    contact: 'Carl Bergeron, CEO',
    joinDate: 'Mars 2026',
    plan: 'C-Suite',
    connections: [
      { type: 'CEO', color: '🔵', activity: '34 échanges ce mois' },
      { type: 'CTO', color: '🟣', activity: '12 échanges ce mois' },
      { type: 'CFO', color: '🟢', activity: '18 échanges ce mois' },
    ],
    deals: [],
    vitaaContribution: { v: 9, i: 8, t: 6, a: 7, astar: 8, score: 38, percentage: 20 },
  },
  {
    id: 'automation',
    name: 'AutomationPlus Inc.',
    shortName: 'AUTO\nPlus',
    sector: 'Intégration robotique',
    contact: 'Marc Dupuis, Président',
    joinDate: 'Mars 2026',
    plan: 'C-Suite',
    connections: [
      { type: 'CEO', color: '🔵', activity: '23 échanges ce mois' },
      { type: 'CTO', color: '🟣', activity: 'Specs robot alignées (actif)' },
      { type: 'CFO', color: '🟢', activity: 'Budget partagé sur projet X' },
    ],
    deals: [
      { title: 'Robot soudure', amount: '185K$', status: 'en cours' },
      { title: 'Maintenance préventive', amount: '25K$/an', status: 'négociation' },
    ],
    vitaaContribution: { v: 8, i: 6, t: 7, a: 5, astar: 9, score: 35, percentage: 18 },
  },
  {
    id: 'martin',
    name: 'Martin Comptabilité',
    shortName: 'MARTIN\nCompt.',
    sector: 'Services financiers',
    contact: 'Sophie Martin, CPA',
    joinDate: 'Mars 2026',
    plan: 'C-Suite',
    connections: [],
    deals: [],
    vitaaContribution: { v: 7, i: 9, t: 8, a: 6, astar: 7, score: 37, percentage: 19 },
  },
  {
    id: 'acier',
    name: 'AcierQC',
    shortName: 'ACIER\nQC',
    sector: 'Métallurgie',
    contact: 'Jean Tremblay, Directeur',
    joinDate: 'Mars 2026',
    plan: 'C-Suite',
    connections: [],
    deals: [],
    vitaaContribution: { v: 6, i: 7, t: 5, a: 8, astar: 6, score: 32, percentage: 17 },
  },
  {
    id: 'metal',
    name: 'MétalPro',
    shortName: 'METAL\nPro',
    sector: 'Fabrication',
    contact: 'Marie Leblanc, PDG',
    joinDate: 'Mars 2026',
    plan: 'C-Suite',
    connections: [],
    deals: [],
    vitaaContribution: { v: 5, i: 6, t: 6, a: 7, astar: 5, score: 29, percentage: 15 },
  },
];

const activities: CircleActivity[] = [
  {
    id: '1',
    type: 'deal',
    time: 'Il y a 2h',
    title: 'DEAL FACILITÉ',
    description: 'AutoPlus ↔ MétalPro\nRobot soudure, 185K$\nCommission GhostX: 5,550$ (3%)',
  },
  {
    id: '2',
    type: 'subsidy',
    time: 'Hier',
    title: 'SUBVENTION IDENTIFIÉE',
    description: 'MEDTEQ pour PrécisionCNC\nPotentiel: 150K$ | Dossier en cours',
  },
  {
    id: '3',
    type: 'member',
    time: 'Lundi',
    title: 'NOUVEAU MEMBRE',
    description: 'FinanceVert a rejoint (9/9 ✓)\nPalier -25% atteint pour TOUS!',
  },
];

interface CircleViewProps {
  onBack?: () => void;
  onMemberClick?: (memberId: string) => void;
}

export function CircleView({ onBack, onMemberClick }: CircleViewProps) {
  const [chatInput, setChatInput] = useState('');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const handleMemberClick = (memberId: string) => {
    setSelectedMember(memberId);
    if (onMemberClick) {
      onMemberClick(memberId);
    }
  };

  // Si un membre est sélectionné, afficher la vue détaillée
  if (selectedMember) {
    const member = members.find(m => m.id === selectedMember);
    if (!member) return null;

    return (
      <div className="flex-1 flex flex-col h-full">
        {/* En-tête */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedMember(null)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Mon Cercle
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold">{member.name} — Membre du Cercle Pionniers</h1>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6">
              <div className="space-y-6">
                {/* En-tête du profil */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏭</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{member.name}</h2>
                      <p className="text-gray-600">Secteur: {member.sector}</p>
                      <p className="text-gray-600">Contact: {member.contact}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className="bg-blue-600">Plan: {member.plan}</Badge>
                    <p className="text-sm text-gray-600">Membre depuis: {member.joinDate}</p>
                  </div>
                </div>

                <Separator />

                {/* Connexions */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">CONNEXIONS AVEC TOI :</h3>
                  <div className="space-y-3">
                    {member.connections.map((conn, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <span className="text-xl">{conn.color}</span>
                        <div className="flex-1">
                          <p className="font-medium">
                            {conn.type} ↔ {conn.type}:
                          </p>
                          <p className="text-sm text-gray-600">{conn.activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Deals en cours */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">DEALS EN COURS :</h3>
                    <Badge>{member.deals.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {member.deals.map((deal, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">• {deal.title} ({deal.amount})</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {deal.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Contribution VITAA */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">CONTRIBUTION VITAA AU CERCLE :</h3>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="flex items-center gap-6 mb-2">
                      <span className="font-mono font-semibold">V:{member.vitaaContribution.v}</span>
                      <span className="font-mono font-semibold">I:{member.vitaaContribution.i}</span>
                      <span className="font-mono font-semibold">T:{member.vitaaContribution.t}</span>
                      <span className="font-mono font-semibold">A:{member.vitaaContribution.a}</span>
                      <span className="font-mono font-semibold">A*:{member.vitaaContribution.astar}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-blue-600">
                        Score: {member.vitaaContribution.score.toFixed(1)}
                      </span>
                      <span className="text-gray-600">
                        → ~{member.vitaaContribution.percentage}% du cercle
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Vue principale du cercle
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
            <h1 className="text-xl font-semibold">Orbit9 — Mon Cercle</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-600 gap-1">
              🌐 Cercle Pionniers
            </Badge>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Gouvernance
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Zone principale */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Carte du cercle */}
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    🌐 CERCLE DES PIONNIERS
                  </h2>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">9/9 membres</Badge>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">Palier: -25%</span>
                      <Lock className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Créé le 15 mars 2026</p>
              </div>

              {/* Diagramme du réseau - Version simplifiée avec grille */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 mb-4">
                <div className="grid grid-cols-3 gap-6">
                  {/* Rangée 1 */}
                  <div className="col-start-2 flex justify-center">
                    <button
                      onClick={() => handleMemberClick('carl')}
                      className="bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md whitespace-pre-line text-center"
                    >
                      CARL{'\n'}CEO
                    </button>
                  </div>

                  {/* Rangée 2 */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleMemberClick('martin')}
                      className="bg-white border-2 border-gray-300 px-3 py-2 rounded-lg font-semibold text-xs hover:border-blue-500 transition-colors shadow whitespace-pre-line text-center"
                    >
                      MARTIN{'\n'}Compt.
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleMemberClick('automation')}
                      className="bg-white border-2 border-gray-300 px-3 py-2 rounded-lg font-semibold text-xs hover:border-blue-500 transition-colors shadow whitespace-pre-line text-center"
                    >
                      AUTO{'\n'}Plus
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleMemberClick('acier')}
                      className="bg-white border-2 border-gray-300 px-3 py-2 rounded-lg font-semibold text-xs hover:border-blue-500 transition-colors shadow whitespace-pre-line text-center"
                    >
                      ACIER{'\n'}QC
                    </button>
                  </div>

                  {/* Rangée 3 */}
                  <div className="flex justify-center">
                    <div className="bg-white border-2 border-gray-300 px-3 py-2 rounded-lg font-semibold text-xs shadow whitespace-pre-line text-center">
                      JULIE{'\n'}Cons.
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleMemberClick('metal')}
                      className="bg-white border-2 border-gray-300 px-3 py-2 rounded-lg font-semibold text-xs hover:border-blue-500 transition-colors shadow whitespace-pre-line text-center"
                    >
                      METAL{'\n'}Pro
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-white border-2 border-gray-300 px-3 py-2 rounded-lg font-semibold text-xs shadow whitespace-pre-line text-center">
                      PREC.{'\n'}CNC
                    </div>
                  </div>

                  {/* Rangée 4 */}
                  <div className="flex justify-center">
                    <div className="bg-white border-2 border-gray-300 px-3 py-2 rounded-lg font-semibold text-xs shadow whitespace-pre-line text-center">
                      LOGI{'\n'}Tech
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-white border-2 border-gray-300 px-3 py-2 rounded-lg font-semibold text-xs shadow whitespace-pre-line text-center">
                      REAL{'\n'}Comp
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-white border-2 border-gray-300 px-3 py-2 rounded-lg font-semibold text-xs shadow whitespace-pre-line text-center">
                      FIN.{'\n'}Vert
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 text-center mt-6">
                  ─── = connexion bot active
                </p>
              </div>
            </Card>

            {/* Activité du cercle */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">ACTIVITÉ DU CERCLE</h2>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">📌</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-600">{activity.time}</span>
                          <span className="text-sm">—</span>
                          <span className="font-semibold">{activity.title}</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Canvas droit */}
        <div className="w-80 border-l bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Stats du cercle */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">STATS CERCLE</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Membres:</span>
                  <span className="font-semibold">9/9</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Deals:</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Valeur:</span>
                  <span className="font-semibold text-green-600">1.2M$</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">TT émis:</span>
                  <span className="font-semibold">450</span>
                </div>
                <Separator />
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-sm">Palier: -25%</span>
                  </div>
                  <p className="text-xs text-gray-600">(ne descend JAMAIS)</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Historique
                </Button>
              </div>
            </Card>

            {/* Coordination inter-bots */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">COORDINATION INTER-BOTS</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span>🔵↔🔵</span>
                  <span className="font-medium">CEO</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>🟣↔🟣</span>
                  <span className="font-medium">CTO</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>🟢↔🟢</span>
                  <span className="font-medium">CFO</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>🟠↔🟠</span>
                  <span className="font-medium">COO</span>
                </div>
                <Separator className="my-3" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">36</p>
                  <p className="text-xs text-gray-600">connexions actives</p>
                </div>
              </div>
            </Card>

            {/* Opportunités */}
            <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <h3 className="font-semibold">OPPORTUNITÉS DÉTECTÉES</h3>
              </div>
              <p className="text-sm mb-3">
                <span className="font-bold text-orange-600">3 nouvelles</span> cette semaine
              </p>
              <Button size="sm" className="w-full gap-2">
                Voir <ChevronRight className="h-4 w-4" />
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Barre de chat en bas */}
      <div className="border-t bg-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="text-xl">💬</div>
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Parle à CarlOS de ton cercle..."
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
            Envoyer <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
