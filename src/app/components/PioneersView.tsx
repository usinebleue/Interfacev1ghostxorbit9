import { 
  ArrowLeft,
  Crown,
  Award,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Lightbulb,
  DollarSign,
  CheckCircle2,
  Star,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface Pioneer {
  place: number;
  sector: string;
  company: string;
  status: 'patient-zero' | 'confirmed';
  isCurrentUser?: boolean;
}

interface ImpactMetric {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}

const pioneers: Pioneer[] = [
  { place: 1, sector: 'Automatisation', company: 'Carl (Usine Bleue)', status: 'patient-zero', isCurrentUser: true },
  { place: 2, sector: 'Intégration', company: 'AutomationPlus', status: 'confirmed' },
  { place: 3, sector: 'Usinage', company: 'MétalPro Inc', status: 'confirmed' },
  { place: 4, sector: 'Comptabilité', company: 'Réal & Associés', status: 'confirmed' },
  { place: 5, sector: 'Consultation', company: 'Julie Tremblay', status: 'confirmed' },
  { place: 6, sector: 'CNC', company: 'PrécisionCNC', status: 'confirmed' },
  { place: 7, sector: 'Logistique', company: 'LogiTech QC', status: 'confirmed' },
  { place: 8, sector: 'Fournisseur', company: 'AcierQC', status: 'confirmed' },
  { place: 9, sector: 'Finance', company: 'FinanceVert', status: 'confirmed' },
];

const benefits = [
  'C-Suite complet (6 bots) — prix bloqué',
  'Ambassadeur Or — sans conditions',
  'Onboarding VIP — gratuit',
  'Commission 5% — sur tout le cercle',
  'Voix au roadmap — accès direct à l\'équipe UB',
  'Features Priority — premier accès aux nouveautés',
];

const impactMetrics: ImpactMetric[] = [
  { icon: DollarSign, label: 'Valeur totale créée', value: '2.4M$', color: 'text-green-600' },
  { icon: Users, label: 'Deals inter-membres', value: '18 (valeur: 1.8M$)', color: 'text-blue-600' },
  { icon: FileText, label: 'Documents produits', value: '342', color: 'text-purple-600' },
  { icon: Clock, label: 'Heures économisées (total)', value: '4,200h', color: 'text-orange-600' },
  { icon: Lightbulb, label: 'Co-créations lancées', value: '2', color: 'text-yellow-600' },
  { icon: Award, label: 'Subventions obtenues', value: '450K$', color: 'text-emerald-600' },
];

interface PioneersViewProps {
  onBack?: () => void;
}

export function PioneersView({ onBack }: PioneersViewProps) {
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
        <h1 className="text-sm font-semibold">Cercle des Pionniers</h1>
      </div>

      {/* Contenu */}
      <div className="flex-1 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Statut pionnier */}
          <Card className="p-6 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-xl">
            <div className="space-y-6">
              {/* Badge pionnier */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Crown className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🏆</span>
                    <h2 className="text-sm font-bold text-amber-900">
                      CARL FUGÈRE — PIONNIER #1
                    </h2>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-600" />
                      <span className="text-sm">
                        Ambassadeur: <strong className="text-amber-700">Or</strong> (automatique, à vie)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Tarif: <strong className="text-green-700">2,246$/mois</strong> (garanti À VIE)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">
                        Commission: <strong className="text-blue-700">5%</strong> sur les revenus du cercle
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">
                        Membre depuis: <strong className="text-purple-700">Jour 1</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-amber-200" />

              {/* Avantages exclusifs */}
              <div className="bg-white rounded-lg p-5 border-2 border-amber-200 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-amber-900">
                    AVANTAGES PIONNIERS (exclusifs, à vie) :
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {benefits.map((benefit, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-gray-800">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Les 9 Pionniers */}
          <Card className="p-6 border-2 border-amber-200">
            <h2 className="text-sm font-bold mb-6 flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600" />
              LES 9 PIONNIERS
            </h2>

            <div className="bg-white rounded-lg border overflow-hidden">
              {/* En-tête du tableau */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-amber-100 border-b font-semibold text-sm">
                <div className="col-span-1">PLACE</div>
                <div className="col-span-3">SECTEUR</div>
                <div className="col-span-5">ENTREPRISE</div>
                <div className="col-span-3">STATUS</div>
              </div>

              {/* Liste des pionniers */}
              {pioneers.map((pioneer) => (
                <div 
                  key={pioneer.place}
                  className={`grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 transition-colors ${
                    pioneer.isCurrentUser 
                      ? 'bg-amber-50 border-l-4 border-l-amber-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="col-span-1 flex items-center">
                    <Badge 
                      variant={pioneer.place === 1 ? 'default' : 'secondary'}
                      className={pioneer.place === 1 ? 'bg-amber-600' : ''}
                    >
                      #{pioneer.place}
                    </Badge>
                  </div>
                  <div className="col-span-3 flex items-center text-sm font-medium">
                    {pioneer.sector}
                  </div>
                  <div className="col-span-5 flex items-center text-sm">
                    {pioneer.company}
                    {pioneer.isCurrentUser && (
                      <Badge variant="outline" className="ml-2 text-xs border-amber-500 text-amber-700">
                        Vous
                      </Badge>
                    )}
                  </div>
                  <div className="col-span-3 flex items-center">
                    {pioneer.status === 'patient-zero' ? (
                      <Badge className="bg-purple-600 gap-1">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        Patient Zéro
                      </Badge>
                    ) : (
                      <Badge className="bg-green-600 gap-1">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        Confirmé
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-900">
                  COMPLET — Prochaine vague dans 6 mois
                </span>
              </div>
              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Waitlist Vague 2: <strong>34 inscrits</strong>
                </span>
              </div>
            </div>
          </Card>

          {/* Impact du cercle */}
          <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
            <h2 className="text-sm font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              IMPACT DU CERCLE (DASHBOARD COLLECTIF)
            </h2>

            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-600 mb-4">
                DEPUIS LA CRÉATION (6 mois) :
              </p>
              <div className="grid grid-cols-3 gap-4">
                {impactMetrics.map((metric, idx) => {
                  const Icon = metric.icon;
                  return (
                    <div 
                      key={idx}
                      className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`h-4 w-4 ${metric.color}`} />
                        <span className="text-xs text-gray-600 font-medium">
                          {metric.label}
                        </span>
                      </div>
                      <p className={`text-sm font-bold ${metric.color}`}>
                        {metric.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Revenue GhostX */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                REVENUE GHOSTX DU CERCLE :
              </h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium">Abonnements :</span>
                  <span className="font-bold text-green-600">
                    20,214$/mois <span className="text-xs text-gray-600">(9 × C-Suite Pionnier)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium">Performance :</span>
                  <span className="font-bold text-blue-600">
                    12,000$/mois <span className="text-xs text-gray-600">(10-15% de la valeur)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium">Deals :</span>
                  <span className="font-bold text-purple-600">
                    4,500$/mois <span className="text-xs text-gray-600">(3-5% des transactions)</span>
                  </span>
                </div>
              </div>

              <Separator className="my-4 bg-green-200" />

              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium mb-1 opacity-90">TOTAL MENSUEL</p>
                    <p className="text-sm font-bold">36,714$/mois</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium mb-1 opacity-90">TOTAL ANNUEL</p>
                    <p className="text-sm font-bold">440K$/an</p>
                  </div>
                </div>
                <p className="text-sm mt-3 opacity-90 text-center">
                  pour <strong>1 cercle</strong> de 9 membres!
                </p>
              </div>

              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-900 text-center">
                  💡 <strong>Ta commission de 5%</strong> sur le cercle = 
                  <strong className="text-sm font-semibold"> ~1,835$/mois</strong> (~22K$/an)
                </p>
              </div>
            </div>
          </Card>

          {/* Message spécial */}
          <Card className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold mb-2">
                  Merci d'être Pionnier #1 🙏
                </h3>
                <p className="text-white/90 leading-relaxed mb-4">
                  Tu as cru en Usine Bleue dès le jour 1. Tes avantages sont 
                  gravés dans le marbre : prix, commission, accès VIP — pour toujours. 
                  Ton feedback façonne directement le produit. Tu n'es pas un client, 
                  tu es un co-constructeur.
                </p>
                <div className="flex gap-3">
                  <Button className="bg-white text-purple-600 hover:bg-white/90">
                    Accès équipe UB
                  </Button>
                  <Button variant="outline" className="text-white border-white hover:bg-white/20">
                    Roadmap prioritaire
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
