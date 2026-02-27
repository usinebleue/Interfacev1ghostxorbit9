import { 
  ArrowLeft,
  Layers,
  CheckCircle2,
  Circle,
  Star,
  Zap,
  TrendingUp,
  Rocket,
  Shield,
  DollarSign
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface RoadmapViewProps {
  onBack?: () => void;
}

const allPages = [
  { id: 1, name: 'Login', category: 'PRINCIPALE', status: 'done' },
  { id: 2, name: 'Onboarding (4 étapes)', category: 'PRINCIPALE', status: 'done' },
  { id: 3, name: 'Cockpit CEO (dashboard)', category: 'PRINCIPALE', status: 'done' },
  { id: 4, name: 'Département Direction (CarlOS)', category: 'PRINCIPALE', status: 'done' },
  { id: 5, name: 'Département Technologie (CTO)', category: 'PRINCIPALE', status: 'progress' },
  { id: 6, name: 'Département Finance (CFO)', category: 'PRINCIPALE', status: 'progress' },
  { id: 7, name: 'Département Marketing (CMO)', category: 'PRINCIPALE', status: 'planned' },
  { id: 8, name: 'Département Vente (CSO)', category: 'PRINCIPALE', status: 'planned' },
  { id: 9, name: 'Département Opérations (COO)', category: 'PRINCIPALE', status: 'planned' },
  { id: 10, name: 'Chat CarlOS (pleine page)', category: 'PRINCIPALE', status: 'done' },
  { id: 11, name: 'Cahier de Projet (sections)', category: 'PRINCIPALE', status: 'done' },
  { id: 12, name: 'Mes Documents', category: 'PRINCIPALE', status: 'done' },
  { id: 13, name: 'Mon Bilan de Santé', category: 'PRINCIPALE', status: 'done' },
  { id: 14, name: 'Mon Équipe AI', category: 'PRINCIPALE', status: 'done' },
  { id: 15, name: 'Mon Cercle', category: 'ORBIT9', status: 'done' },
  { id: 16, name: 'Matching Engine', category: 'ORBIT9', status: 'done' },
  { id: 17, name: 'Co-Créations', category: 'ORBIT9', status: 'done' },
  { id: 18, name: 'TimeTokens & Contributions', category: 'ORBIT9', status: 'done' },
  { id: 19, name: 'Gouvernance Cercle', category: 'SPÉCIALES', status: 'done' },
  { id: 20, name: 'Cercle des Pionniers (exclusif)', category: 'SPÉCIALES', status: 'done' },
  { id: 21, name: 'Franchise 5.0 (vue réseau)', category: 'SPÉCIALES', status: 'done' },
  { id: 22, name: 'Profil / Paramètres', category: 'SPÉCIALES', status: 'planned' },
];

const sprints = [
  {
    id: 'A',
    title: 'CASH IMMÉDIAT',
    duration: 'Mois 1-2',
    priority: 5,
    color: 'from-green-500 to-emerald-600',
    items: [
      '1. Login + Onboarding',
      '2. Chat CarlOS (LE produit)',
      '3. Cockpit CEO (première impression)',
      '4. Mon Bilan de Santé (quick win jour 1)',
      '5. Cahier de Projet (livrable tangible)',
    ],
    result: 'On peut vendre le CEO Solo 249$ et livrer de la valeur en 24h.',
    revenue: '249$/mois',
  },
  {
    id: 'B',
    title: 'UPSELL BOTS',
    duration: 'Mois 2-3',
    priority: 4,
    color: 'from-blue-500 to-purple-600',
    items: [
      '6. Départements (6 pages, même structure)',
      '7. Mon Équipe AI (config bots)',
      '8. Mes Documents (CREDO auto-générés)',
    ],
    result: 'Le client voit les 6 départements et veut activer les bots = upsell à 495$/b',
    revenue: '2,995$/mois',
  },
  {
    id: 'C',
    title: 'CERCLES',
    duration: 'Mois 3-6',
    priority: 3,
    color: 'from-purple-500 to-pink-600',
    items: [
      '9. Orbit9 Mon Cercle',
      '10. Matching Engine',
      '11. Cercle des Pionniers',
      '12. Gouvernance',
    ],
    result: 'Les cercles se forment, coordination inter-bots activée, effet réseau démarre.',
    revenue: 'Rabais -25% + Deals',
  },
  {
    id: 'D',
    title: 'ÉCOSYSTÈME',
    duration: 'Mois 6-12',
    priority: 2,
    color: 'from-orange-500 to-red-600',
    items: [
      '13. Co-Créations',
      '14. TimeTokens & Contributions',
      '15. Franchise 5.0 (vue réseau)',
    ],
    result: 'L\'écosystème de co-création est vivant, le moat est construit.',
    revenue: 'Parts sur innovations',
  },
];

const layers = [
  {
    number: 1,
    title: 'CarlOS Solo',
    price: '249$',
    description: 'Chat + Bilan + Cahier = Quick wins en 24h',
    color: 'bg-blue-50 border-blue-300',
    badge: 'bg-blue-600',
  },
  {
    number: 2,
    title: 'C-Suite',
    price: '2,995$',
    description: '6 bots × 6 départements × 90+ tâches = l\'arsenal',
    color: 'bg-purple-50 border-purple-300',
    badge: 'bg-purple-600',
  },
  {
    number: 3,
    title: 'Orbit9 Cercles',
    price: 'Inclus',
    description: 'Réseau social de bots = collaboration automatisée',
    color: 'bg-pink-50 border-pink-300',
    badge: 'bg-pink-600',
  },
  {
    number: 4,
    title: 'Franchise 5.0',
    price: 'Écosystème',
    description: 'Co-création + VITAA + TimeTokens + Smart Contracts → GhostX = OS de l\'économie fragmentée',
    color: 'bg-orange-50 border-orange-300',
    badge: 'bg-orange-600',
  },
];

export function RoadmapView({ onBack }: RoadmapViewProps) {
  const completedPages = allPages.filter(p => p.status === 'done').length;
  const progressPercentage = Math.round((completedPages / allPages.length) * 100);

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
        <h1 className="text-sm font-semibold">Roadmap & Vision Stratégique</h1>
      </div>

      {/* Contenu */}
      <div className="flex-1 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Vision 1-Image */}
          <Card className="p-6 border-2 border-purple-300 bg-gradient-to-br from-purple-100 to-blue-100">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Layers className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">GHOSTX = Netflix du conseil stratégique</h2>
                  <p className="text-sm text-gray-600">La vision en 4 couches</p>
                </div>
              </div>

              <Separator className="bg-purple-200" />

              <div className="space-y-3">
                {layers.map((layer) => (
                  <Card 
                    key={layer.number}
                    className={`p-4 border-2 ${layer.color}`}
                  >
                    <div className="flex items-center gap-4">
                      <Badge className={`${layer.badge} text-xs px-3 py-1 font-bold`}>
                        COUCHE {layer.number}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-sm font-semibold">{layer.title}</h3>
                          <Badge variant="outline" className="font-semibold">
                            {layer.price}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">→ {layer.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Separator className="bg-purple-200" />

              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-lg border-2 border-orange-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-orange-600" />
                    <h3 className="text-sm font-semibold text-orange-900">LE MOAT :</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>GHML (220 éléments)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Network Effect (n²)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Proprietary Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Multi-Bot Lock-in</span>
                    </div>
                  </div>
                  <Separator className="my-3 bg-orange-200" />
                  <p className="text-center font-bold text-orange-900 text-sm italic">
                    "La valeur attire la valeur."
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Toutes les pages */}
          <Card className="p-6 border-2 border-blue-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">TOUTES LES PAGES</h2>
                <Badge className="bg-blue-600 text-xs px-3 py-1">
                  22 écrans + sous-pages
                </Badge>
              </div>

              <Separator />

              {/* Groupé par catégorie */}
              {['PRINCIPALE', 'ORBIT9', 'SPÉCIALES'].map((category) => (
                <div key={category} className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-600 uppercase tracking-wider">
                    {category} ({allPages.filter(p => p.category === category).length} pages)
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {allPages
                      .filter(p => p.category === category)
                      .map((page) => (
                        <div 
                          key={page.id}
                          className={`flex items-center gap-2 p-3 rounded-lg border ${
                            page.status === 'done' 
                              ? 'bg-green-50 border-green-200' 
                              : page.status === 'progress'
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          {page.status === 'done' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : page.status === 'progress' ? (
                            <Circle className="h-4 w-4 text-blue-600 flex-shrink-0 fill-blue-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium">{page.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Ordre de construction */}
          <Card className="p-6 border-2 border-green-200">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <h2 className="text-sm font-bold">ORDRE DE CONSTRUCTION</h2>
                  <p className="text-sm text-gray-600">
                    Règle : Construire CE QUI FAIT DU CASH en premier
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                {sprints.map((sprint) => (
                  <Card 
                    key={sprint.id}
                    className="overflow-hidden border-2"
                  >
                    {/* Header du sprint */}
                    <div className={`bg-gradient-to-r ${sprint.color} p-4`}>
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-white text-gray-900 hover:bg-white text-xs px-3 py-1 font-bold">
                            SPRINT {sprint.id}
                          </Badge>
                          <h3 className="text-sm font-bold">{sprint.title}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i}
                                className={`h-4 w-4 ${
                                  i < sprint.priority 
                                    ? 'fill-yellow-300 text-yellow-300' 
                                    : 'text-white/30'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge className="bg-white/20 text-white hover:bg-white/20">
                            {sprint.duration}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Contenu du sprint */}
                    <div className="p-5 space-y-4">
                      <div className="space-y-2">
                        {sprint.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-start gap-3">
                          <Zap className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-green-900 mb-2">
                              RÉSULTAT :
                            </p>
                            <p className="text-sm text-gray-700">{sprint.result}</p>
                          </div>
                          <Badge className="bg-green-600 text-white hover:bg-green-600 text-xs px-3 py-1">
                            <DollarSign className="h-4 w-4 inline mr-1" />
                            {sprint.revenue}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>

          {/* Metrics de progression */}
          <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
            <div className="space-y-4">
              <h2 className="text-sm font-bold">PROGRESSION ACTUELLE</h2>
              <Separator />
              
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 bg-white border-2 border-green-300">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">Complétées</p>
                    <p className="text-sm font-bold text-green-600">
                      {allPages.filter(p => p.status === 'done').length}
                    </p>
                    <p className="text-xs text-gray-500">pages</p>
                  </div>
                </Card>
                <Card className="p-4 bg-white border-2 border-blue-300">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">En cours</p>
                    <p className="text-sm font-bold text-blue-600">
                      {allPages.filter(p => p.status === 'progress').length}
                    </p>
                    <p className="text-xs text-gray-500">pages</p>
                  </div>
                </Card>
                <Card className="p-4 bg-white border-2 border-gray-300">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">Planifiées</p>
                    <p className="text-sm font-bold text-gray-600">
                      {allPages.filter(p => p.status === 'planned').length}
                    </p>
                    <p className="text-xs text-gray-500">pages</p>
                  </div>
                </Card>
                <Card className="p-4 bg-white border-2 border-purple-300">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-sm font-bold text-purple-600">
                      {allPages.length}
                    </p>
                    <p className="text-xs text-gray-500">pages</p>
                  </div>
                </Card>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Progression globale</span>
                  <span className="font-bold text-purple-600">{progressPercentage}%</span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Message final */}
          <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold mb-2">
                  Construction par couches successives
                </h3>
                <p className="text-white/90 leading-relaxed">
                  Chaque sprint ajoute une couche de valeur. Sprint A = produit vendable. 
                  Sprint B = upsell. Sprint C = effet réseau. Sprint D = moat défendable. 
                  Cette approche garantit du cash flow dès le mois 2 tout en construisant 
                  un écosystème qui devient progressivement imprenable.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
