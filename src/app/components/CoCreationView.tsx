import { useState } from 'react';
import { 
  ArrowLeft,
  Rocket,
  Users,
  TrendingUp,
  Send,
  ExternalLink,
  FileText,
  CheckCircle2,
  Circle,
  Loader,
  Lightbulb,
  ChevronRight,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Partner {
  id: string;
  name: string;
  role: string;
  vitaaShare: number;
  timeTokens: number;
  color: string;
}

interface Phase {
  id: number;
  name: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

interface CoCreationProject {
  id: string;
  title: string;
  phase: string;
  partnerCount: number;
  estimatedValue: string;
  partners: Partner[];
  phases: Phase[];
  progress: number;
  activities: string[];
  totalTimeTokens: number;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  estimatedValue: string;
  potentialPartners: number;
}

const projects: CoCreationProject[] = [
  {
    id: '1',
    title: 'Micro-Usinage Médical',
    phase: 'Exécution',
    partnerCount: 4,
    estimatedValue: '2-5M$/an sur 3 ans',
    totalTimeTokens: 1240,
    progress: 52,
    partners: [
      { id: '1', name: 'MétalPro', role: 'Usinage', vitaaShare: 28.0, timeTokens: 348, color: '#3b82f6' },
      { id: '2', name: 'GhostX', role: 'Idée+Match', vitaaShare: 25.2, timeTokens: 312, color: '#8b5cf6' },
      { id: '3', name: 'MedDesign', role: 'Design', vitaaShare: 18.4, timeTokens: 228, color: '#10b981' },
      { id: '4', name: 'FinanceVert', role: 'Capital', vitaaShare: 15.8, timeTokens: 196, color: '#f59e0b' },
      { id: '5', name: 'QualitéPlus', role: 'ISO 13485', vitaaShare: 12.6, timeTokens: 156, color: '#ef4444' },
    ],
    phases: [
      { id: 1, name: 'Certification', status: 'completed' },
      { id: 2, name: 'Prototype', status: 'in-progress' },
      { id: 3, name: 'Production', status: 'upcoming' },
      { id: 4, name: 'Vente', status: 'upcoming' },
    ],
    activities: [
      'CTO↔CTO: Specs prototype alignées',
      'CFO↔CFO: Budget Phase 2 validé',
      'GhostX: 2 brevets déposés (IPToken)',
    ],
  },
  {
    id: '2',
    title: 'Automatisation Soudure',
    phase: 'Planification',
    partnerCount: 3,
    estimatedValue: '800K-1.2M$/an',
    totalTimeTokens: 680,
    progress: 25,
    partners: [
      { id: '1', name: 'AutoPlus', role: 'Robotique', vitaaShare: 35.0, timeTokens: 238, color: '#3b82f6' },
      { id: '2', name: 'GhostX', role: 'Coordination', vitaaShare: 30.0, timeTokens: 204, color: '#8b5cf6' },
      { id: '3', name: 'AcierQC', role: 'Production', vitaaShare: 35.0, timeTokens: 238, color: '#10b981' },
    ],
    phases: [
      { id: 1, name: 'Étude', status: 'completed' },
      { id: 2, name: 'Équipement', status: 'in-progress' },
      { id: 3, name: 'Implémentation', status: 'upcoming' },
    ],
    activities: [
      'COO↔COO: Process mapping complété',
      'GhostX: Subvention MEDTEQ identifiée',
    ],
  },
];

const opportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Consortium Inspection Automatisée',
    description: '15 manufacturiers dans 4 cercles cherchent des solutions d\'inspection automatisée. Opportunité de créer un consortium.',
    estimatedValue: '500K-1M$',
    potentialPartners: 6,
  },
];

const getPhaseIcon = (status: Phase['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'in-progress':
      return <Loader className="h-5 w-5 text-blue-600 animate-spin" />;
    case 'upcoming':
      return <Circle className="h-5 w-5 text-gray-300" />;
  }
};

interface CoCreationViewProps {
  onBack?: () => void;
}

export function CoCreationView({ onBack }: CoCreationViewProps) {
  const [chatInput, setChatInput] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('1');

  const currentProject = projects.find(p => p.id === selectedProject) || projects[0];
  
  // Préparer les données pour le pie chart
  const pieChartData = currentProject.partners.map(p => ({
    name: p.name,
    value: p.vitaaShare,
    color: p.color,
  }));

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
            <h1 className="text-xl font-semibold">Orbit9 — Co-Créations</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-600">
              {projects.length} projets actifs
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Zone principale */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Projet actif principal */}
            <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="space-y-6">
                {/* En-tête du projet */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Rocket className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🚀</span>
                      <h2 className="text-xl font-bold">PROJET ACTIF #{currentProject.id}</h2>
                    </div>
                    <h3 className="text-2xl font-bold text-purple-900 mb-3">
                      {currentProject.title}
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Phase: </span>
                        <Badge className="bg-blue-600">{currentProject.phase}</Badge>
                      </div>
                      <div>
                        <span className="text-gray-600">Partenaires: </span>
                        <span className="font-semibold">{currentProject.partnerCount} + GhostX</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Valeur estimée: </span>
                        <span className="font-semibold text-green-600">
                          {currentProject.estimatedValue}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Partenaires */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">PARTENAIRES :</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {currentProject.partners.map((partner) => (
                      <Card 
                        key={partner.id}
                        className="p-4 bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: partner.color }}
                            />
                            <h4 className="font-semibold text-sm">{partner.name}</h4>
                          </div>
                          <p className="text-xs text-gray-600">{partner.role}</p>
                          <div className="pt-2 border-t">
                            <p className="text-lg font-bold text-purple-600">
                              {partner.vitaaShare.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Timeline */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">TIMELINE :</h3>
                    <span className="text-sm font-semibold text-purple-600">
                      {currentProject.progress}% complété
                    </span>
                  </div>
                  <Progress value={currentProject.progress} className="h-3 mb-4" />
                  <div className="space-y-3">
                    {currentProject.phases.map((phase) => (
                      <div 
                        key={phase.id}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg"
                      >
                        {getPhaseIcon(phase.status)}
                        <div className="flex-1">
                          <span className="font-medium">Phase {phase.id}: {phase.name}</span>
                        </div>
                        <Badge 
                          variant={
                            phase.status === 'completed' ? 'default' :
                            phase.status === 'in-progress' ? 'secondary' : 'outline'
                          }
                          className={
                            phase.status === 'completed' ? 'bg-green-600' :
                            phase.status === 'in-progress' ? 'bg-blue-600' : ''
                          }
                        >
                          {phase.status === 'completed' && '✅ Complété'}
                          {phase.status === 'in-progress' && '🔄 en cours'}
                          {phase.status === 'upcoming' && '○ à venir'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Dernière activité */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">DERNIÈRE ACTIVITÉ :</h3>
                  <div className="space-y-2">
                    {currentProject.activities.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-purple-600">•</span>
                        <span className="text-gray-700">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                    <ExternalLink className="h-4 w-4" />
                    Ouvrir le projet
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Voir le cahier
                  </Button>
                </div>
              </div>
            </Card>

            {/* Opportunités de co-création */}
            {opportunities.map((opp) => (
              <Card 
                key={opp.id}
                className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-5 w-5 text-yellow-900" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">💡</span>
                        <h3 className="font-semibold text-lg">DÉTECTÉE PAR GHOSTX</h3>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed mb-4">
                        "{opp.description}"
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600">Valeur estimée: </span>
                          <span className="font-semibold text-green-600">{opp.estimatedValue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600">Partenaires potentiels: </span>
                          <span className="font-semibold">{opp.potentialPartners} identifiés</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button className="gap-2 bg-yellow-600 hover:bg-yellow-700">
                      Explorer cette opportunité <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                      Pas maintenant
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Autres projets */}
            {projects.length > 1 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">AUTRES PROJETS ACTIFS</h3>
                {projects.filter(p => p.id !== selectedProject).map((project) => (
                  <Card 
                    key={project.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Rocket className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-semibold">{project.title}</h4>
                          <p className="text-sm text-gray-600">
                            Phase: {project.phase} • {project.partnerCount} partenaires
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Canvas droit */}
        <div className="w-80 border-l bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Répartition VITAA */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">RÉPARTITION VITAA</h3>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                {currentProject.partners.map((partner) => (
                  <div key={partner.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: partner.color }}
                      />
                      <span>{partner.name}</span>
                    </div>
                    <span className="font-semibold">{partner.vitaaShare.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-4 text-center">
                Basé sur contribution VITAA réelle
              </p>
              <Button variant="outline" size="sm" className="w-full mt-3 gap-2">
                Détails <ChevronRight className="h-3 w-3" />
              </Button>
            </Card>

            {/* TimeTokens */}
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-purple-600" />
                <h3 className="font-semibold">TIMETOKENS</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total émis</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {currentProject.totalTimeTokens.toLocaleString()}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  {currentProject.partners.map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between">
                      <span className="text-gray-700">{partner.name}:</span>
                      <span className="font-semibold">{partner.timeTokens}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Historique
                </Button>
              </div>
            </Card>

            {/* Métriques rapides */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">MÉTRIQUES</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progression</span>
                  <span className="font-bold text-blue-600">{currentProject.progress}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Partenaires</span>
                  <span className="font-bold">{currentProject.partnerCount + 1}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Phases complétées</span>
                  <span className="font-bold">
                    {currentProject.phases.filter(p => p.status === 'completed').length}/{currentProject.phases.length}
                  </span>
                </div>
                <Separator />
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Valeur potentielle</p>
                  <p className="font-bold text-green-600">{currentProject.estimatedValue}</p>
                </div>
              </div>
            </Card>

            {/* Prochaines étapes */}
            <Card className="p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold">PROCHAINES ÉTAPES</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span className="text-gray-700">Validation prototype Q2 2026</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span className="text-gray-700">Dépôt brevet additionnel</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span className="text-gray-700">Présentation investisseurs</span>
                </div>
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
            placeholder="Parle à CarlOS des co-créations..."
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
