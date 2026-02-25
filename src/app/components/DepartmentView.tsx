import { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Settings, 
  ChevronDown,
  Plus,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';

interface DepartmentData {
  id: string;
  name: string;
  emoji: string;
  role: string;
  color: string;
  botName: string;
}

interface DepartmentViewProps {
  department?: DepartmentData;
  onBack?: () => void;
}

const defaultDepartment: DepartmentData = {
  id: 'direction',
  name: 'Direction',
  emoji: '🔵',
  role: 'CEO',
  color: 'blue',
  botName: 'CarlOS CEO',
};

const decisions = [
  {
    id: 1,
    title: 'Budget automatisation',
    description: 'CFO propose 3 scénarios.',
    impact: 'S02, S04, S05',
    urgent: true,
  },
  {
    id: 2,
    title: "Séquence d'implémentation",
    description: 'COO attend la décision budget.',
    impact: '',
    urgent: false,
  },
];

const projects = [
  { id: 1, name: 'Cahier Robot Soudure', progress: 78, icon: '📋' },
  { id: 2, name: 'Vision 2027', progress: 45, icon: '📋' },
  { id: 3, name: 'Expansion Ontario', progress: 12, icon: '📋' },
];

const teamMembers = [
  { id: 1, name: 'CarlOS', status: 'active' },
  { id: 2, name: 'CTO', status: 'active' },
  { id: 3, name: 'CFO', status: 'active' },
  { id: 4, name: 'CMO', status: 'inactive' },
  { id: 5, name: 'CSO', status: 'inactive' },
  { id: 6, name: 'COO', status: 'active' },
];

const recentDocs = [
  { id: 1, name: 'Brief Équipe', time: 'hier' },
  { id: 2, name: 'Fiche Tens.', time: 'lundi' },
  { id: 3, name: 'Plan Action', time: 'draft' },
];

const capabilities = [
  {
    id: 1,
    title: 'Coordination stratégique multi-départements',
    before: 'Le CEO gère tout seul, réunions interminables',
    after: 'Coordination automatique entre bots',
    timeSaved: '15-25h/mois économisées',
  },
  {
    id: 2,
    title: 'Analyse de décisions multicritères',
    before: 'Décisions à l\'instinct, sans données',
    after: 'Analyse VITAA, scénarios, recommandations',
    timeSaved: '10-20h/mois économisées',
  },
  {
    id: 3,
    title: 'Rédaction de documents stratégiques',
    before: 'Le CEO écrit à 23h, brouillons mal structurés',
    after: 'Documents CREDO auto-générés, complets',
    timeSaved: '20-30h/mois économisées',
  },
  {
    id: 4,
    title: 'Bilan de Santé périodique (VITAA)',
    before: 'Pas de vue d\'ensemble, angles morts invisibles',
    after: 'Scorecard 5 piliers, Triangle du Feu',
    timeSaved: '5-10h/mois économisées',
  },
  {
    id: 5,
    title: 'Suivi et priorisation des projets',
    before: 'Excel éparpillé, oublis fréquents',
    after: 'Dashboard centralisé, alertes proactives',
    timeSaved: '8-15h/mois économisées',
  },
  {
    id: 6,
    title: 'Préparation de réunions stratégiques',
    before: 'Improvisation, ordres du jour incomplets',
    after: 'Agendas structurés, briefings automatiques',
    timeSaved: '6-12h/mois économisées',
  },
];

export function DepartmentView({ department = defaultDepartment, onBack }: DepartmentViewProps) {
  const [chatInput, setChatInput] = useState('');

  return (
    <div className="flex-1 flex h-full">
      {/* Zone principale */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* En-tête */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between mb-3">
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
              <div className="flex items-center gap-3">
                <span className="text-xl">{department.emoji}</span>
                <div>
                  <h1 className="text-xl font-semibold">{department.name} — {department.botName}</h1>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                {department.name} <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500 gap-2">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                En ligne
              </Badge>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Recherche..." className="pl-9 w-48" />
              </div>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contenu avec onglets */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6">
            <Tabs defaultValue="vue" className="space-y-6">
              <TabsList>
                <TabsTrigger value="vue">Vue</TabsTrigger>
                <TabsTrigger value="taches">Tâches</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="capacites">Capacités</TabsTrigger>
              </TabsList>

              {/* Onglet Vue */}
              <TabsContent value="vue" className="space-y-6">
                {/* Résumé du bot */}
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🧠</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-3">{department.botName} travaille sur...</h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        "Je coordonne 3 projets actifs. Le Cahier Robot Soudure est à 78%.
                        Je recommande de finaliser le budget avant de continuer S02."
                      </p>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm">Ouvrir le Cahier</Button>
                        <Button variant="outline" size="sm">Voir le Budget</Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Décisions en attente */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-500" />
                    DÉCISIONS EN ATTENTE
                  </h3>
                  <div className="space-y-4">
                    {decisions.map((decision) => (
                      <div 
                        key={decision.id}
                        className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          {decision.urgent ? (
                            <Zap className="h-5 w-5 text-orange-500 mt-0.5" />
                          ) : (
                            <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{decision.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{decision.description}</p>
                            {decision.impact && (
                              <p className="text-xs text-gray-500 mb-3">Impact: {decision.impact}</p>
                            )}
                            <Button size="sm" variant={decision.urgent ? 'default' : 'outline'}>
                              {decision.urgent ? 'Décider maintenant' : 'Voir les options'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Projets du département */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">PROJETS {department.name.toUpperCase()}</h3>
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div 
                        key={project.id}
                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-2xl">{project.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-2">{project.name}</p>
                          <div className="flex items-center gap-3">
                            <Progress value={project.progress} className="flex-1 h-2" />
                            <span className="text-sm font-semibold text-gray-700 w-12">
                              {project.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau Projet
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Onglet Tâches */}
              <TabsContent value="taches">
                <Card className="p-6">
                  <p className="text-gray-500 text-center py-8">
                    Tâches du département — En développement
                  </p>
                </Card>
              </TabsContent>

              {/* Onglet Documents */}
              <TabsContent value="documents">
                <Card className="p-6">
                  <p className="text-gray-500 text-center py-8">
                    Documents du département — En développement
                  </p>
                </Card>
              </TabsContent>

              {/* Onglet Capacités */}
              <TabsContent value="capacites" className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1">
                    CE QUE {department.botName.toUpperCase()} FAIT POUR VOUS :
                  </h2>
                  <Separator className="my-4" />
                </div>

                <div className="space-y-4">
                  {capabilities.map((capability) => (
                    <Card key={capability.id} className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                        <h3 className="font-semibold text-lg">{capability.title}</h3>
                      </div>
                      
                      <div className="space-y-3 ml-9">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Avant:</p>
                          <p className="text-sm text-gray-700">{capability.before}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-blue-600 mb-1">Avec {department.botName}:</p>
                          <p className="text-sm text-gray-700">{capability.after}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <p className="text-sm font-semibold text-orange-600">
                            {capability.timeSaved}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}

                  <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <div className="text-center space-y-4">
                      <div className="text-2xl">💡</div>
                      <p className="text-lg font-semibold">
                        "Tu veux que {department.botName} commence par une de ces tâches?"
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button>Activer</Button>
                        <Button variant="outline">En savoir plus</Button>
                      </div>
                      <div className="pt-4 border-t mt-4">
                        <p className="font-semibold text-lg mb-1">
                          TOTAL DÉPARTEMENT {department.name.toUpperCase()}:
                        </p>
                        <p className="text-gray-700">
                          80-170h/mois économisées = <span className="font-bold text-green-600">9,600-20,400$/mois</span> en salaires
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Barre de chat fixe en bas */}
        <div className="border-t bg-white px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="text-xl">💬</div>
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Parle à ${department.botName}...`}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && chatInput.trim()) {
                  console.log('Send:', chatInput);
                  setChatInput('');
                }
              }}
            />
            <Button>
              Envoyer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas droit */}
      <div className="w-80 border-l bg-white overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="font-semibold mb-1">Canvas</h2>
            <p className="text-xs text-gray-500">Intelligence Vivante</p>
          </div>

          {/* Impact */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📊</span>
              <h3 className="font-semibold">IMPACT</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">Ce mois:</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span>42h sauvées</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span>5 décisions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span>3 documents</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span className="font-semibold">12K$ valeur</span>
                </div>
              </div>
              <Button variant="link" className="p-0 h-auto text-sm mt-3">
                Détails <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </Card>

          {/* Équipe */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">👥</span>
              <h3 className="font-semibold">ÉQUIPE</h3>
            </div>
            <div className="space-y-2.5">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{member.name}</span>
                  {member.status === 'active' ? (
                    <Circle className="h-4 w-4 fill-green-500 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-300" />
                  )}
                </div>
              ))}
              <div className="pt-3 border-t text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                  <span>= actif</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-3 w-3 text-gray-300" />
                  <span>= standby</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Documents récents */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📄</span>
              <h3 className="font-semibold">DOCS RÉCENTS</h3>
            </div>
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="space-y-1">
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-500">({doc.time})</p>
                </div>
              ))}
              <Button variant="link" className="p-0 h-auto text-sm mt-3">
                Tous <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
