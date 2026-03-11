import { useState } from 'react';
import { 
  ArrowRight, 
  Upload, 
  Linkedin,
  Zap,
  Target,
  Activity,
  Trophy,
  CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface OnboardingViewProps {
  onComplete?: () => void;
}

const steps = [
  { number: 1, title: 'Ton entreprise', icon: Target },
  { number: 2, title: 'Tes enjeux (#1 priorité)', icon: Zap },
  { number: 3, title: 'Bilan de Santé rapide (5 min)', icon: Activity },
  { number: 4, title: 'Ton premier Quick Win', icon: Trophy },
];

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyDescription, setCompanyDescription] = useState('');
  const [mainIssue, setMainIssue] = useState('');
  const [healthAnswers, setHealthAnswers] = useState({
    vision: '',
    innovation: '',
    talent: '',
    agility: '',
    alignment: '',
  });
  const [quickWin, setQuickWin] = useState('');

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return companyDescription.length > 10;
      case 2:
        return mainIssue.length > 5;
      case 3:
        return Object.values(healthAnswers).every(v => v.length > 0);
      case 4:
        return true; // Always can complete
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl p-8 shadow-2xl border-2 border-purple-100">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              BIENVENUE SUR GHOSTX 👋
            </h1>
            <p className="text-gray-600">
              Configuration initiale - {currentStep}/4
            </p>
          </div>

          <Separator />

          {/* Progress indicator */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              {steps.map((step, idx) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step.number < currentStep
                        ? 'bg-green-500 text-white'
                        : step.number === currentStep
                        ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.number < currentStep ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step labels */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {steps.map((step) => (
                <div key={step.number}>
                  <p
                    className={`text-xs font-medium ${
                      step.number === currentStep
                        ? 'text-blue-600'
                        : step.number < currentStep
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Step Content */}
          <div className="min-h-[400px]">
            {/* ÉTAPE 1 - TON ENTREPRISE */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-600 text-lg px-4 py-1">
                    ÉTAPE 1/4
                  </Badge>
                  <h2 className="text-2xl font-bold">TON ENTREPRISE</h2>
                </div>

                <Card className="p-5 bg-blue-50 border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🔵</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-blue-900">CarlOS:</p>
                      <p className="text-gray-700 leading-relaxed">
                        "Salut! Je suis CarlOS, ton CEO AI. Avant de commencer, 
                        j'ai besoin de comprendre ton business. Pas besoin d'un 
                        roman — dis-moi ce que tu fais et combien vous êtes."
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="space-y-3">
                  <Label htmlFor="company-desc" className="text-base font-semibold">
                    Dis-moi en quelques mots ce que fait ton entreprise :
                  </Label>
                  <Textarea
                    id="company-desc"
                    placeholder="Ex: On fabrique des pièces d'aluminium pour l'aéronautique. On est 45 employés et on fait environ 8M$ de CA..."
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-gray-500">
                    {companyDescription.length} caractères
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">OU :</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="gap-2 h-auto py-4">
                      <Upload className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-semibold">Importer un business plan</p>
                        <p className="text-xs text-gray-500">PDF, Word, etc.</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="gap-2 h-auto py-4">
                      <Linkedin className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-semibold">LinkedIn URL</p>
                        <p className="text-xs text-gray-500">Page entreprise</p>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 - TES ENJEUX */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className="bg-purple-600 text-lg px-4 py-1">
                    ÉTAPE 2/4
                  </Badge>
                  <h2 className="text-2xl font-bold">TES ENJEUX</h2>
                </div>

                <Card className="p-5 bg-purple-50 border-2 border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🔵</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-purple-900">CarlOS:</p>
                      <p className="text-gray-700 leading-relaxed">
                        "Parfait! Maintenant, si tu devais régler UN SEUL problème 
                        dans les 90 prochains jours, ce serait quoi? Pas de langue 
                        de bois — c'est quoi ton vrai mal de tête?"
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="space-y-3">
                  <Label htmlFor="main-issue" className="text-base font-semibold">
                    Ta priorité #1 (un seul enjeu) :
                  </Label>
                  <Textarea
                    id="main-issue"
                    placeholder="Ex: On perd trop de temps sur des soumissions qu'on gagne pas. Notre taux de conversion est sous 15% et ça nous coûte une fortune..."
                    value={mainIssue}
                    onChange={(e) => setMainIssue(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-blue-900">
                      💡 Exemples de priorités communes :
                    </p>
                    <ul className="space-y-1 text-gray-700 ml-4">
                      <li>• Manque de liquidités / cash flow serré</li>
                      <li>• Difficulté à recruter / garder les talents</li>
                      <li>• Trop dépendant d'un gros client</li>
                      <li>• Processus inefficaces / perte de temps</li>
                      <li>• Croissance stagnante / manque de nouveaux clients</li>
                    </ul>
                  </div>
                </Card>
              </div>
            )}

            {/* ÉTAPE 3 - BILAN DE SANTÉ */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-600 text-lg px-4 py-1">
                    ÉTAPE 3/4
                  </Badge>
                  <h2 className="text-2xl font-bold">BILAN DE SANTÉ RAPIDE</h2>
                </div>

                <Card className="p-5 bg-green-50 border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🔵</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-green-900">CarlOS:</p>
                      <p className="text-gray-700 leading-relaxed">
                        "5 questions rapides pour évaluer la santé globale de 
                        ton entreprise. Note de 1 à 10 où tu te situes."
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="space-y-4">
                  {/* Vision */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      1. Vision - As-tu une vision claire à 3-5 ans?
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="range"
                        min="1"
                        max="10"
                        value={healthAnswers.vision || '5'}
                        onChange={(e) =>
                          setHealthAnswers({ ...healthAnswers, vision: e.target.value })
                        }
                        className="flex-1"
                      />
                      <Badge className="bg-blue-600 w-12 justify-center">
                        {healthAnswers.vision || 5}/10
                      </Badge>
                    </div>
                  </div>

                  {/* Innovation */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      2. Innovation - Innoves-tu régulièrement?
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="range"
                        min="1"
                        max="10"
                        value={healthAnswers.innovation || '5'}
                        onChange={(e) =>
                          setHealthAnswers({ ...healthAnswers, innovation: e.target.value })
                        }
                        className="flex-1"
                      />
                      <Badge className="bg-purple-600 w-12 justify-center">
                        {healthAnswers.innovation || 5}/10
                      </Badge>
                    </div>
                  </div>

                  {/* Talent */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      3. Talent - Ton équipe est-elle au top?
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="range"
                        min="1"
                        max="10"
                        value={healthAnswers.talent || '5'}
                        onChange={(e) =>
                          setHealthAnswers({ ...healthAnswers, talent: e.target.value })
                        }
                        className="flex-1"
                      />
                      <Badge className="bg-green-600 w-12 justify-center">
                        {healthAnswers.talent || 5}/10
                      </Badge>
                    </div>
                  </div>

                  {/* Agility */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      4. Agility - Réagis-tu vite aux changements?
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="range"
                        min="1"
                        max="10"
                        value={healthAnswers.agility || '5'}
                        onChange={(e) =>
                          setHealthAnswers({ ...healthAnswers, agility: e.target.value })
                        }
                        className="flex-1"
                      />
                      <Badge className="bg-orange-600 w-12 justify-center">
                        {healthAnswers.agility || 5}/10
                      </Badge>
                    </div>
                  </div>

                  {/* Alignment */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      5. Alignment - Tout le monde rame dans la même direction?
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="range"
                        min="1"
                        max="10"
                        value={healthAnswers.alignment || '5'}
                        onChange={(e) =>
                          setHealthAnswers({ ...healthAnswers, alignment: e.target.value })
                        }
                        className="flex-1"
                      />
                      <Badge className="bg-red-600 w-12 justify-center">
                        {healthAnswers.alignment || 5}/10
                      </Badge>
                    </div>
                  </div>
                </div>

                <Card className="p-4 bg-blue-50 border-blue-200">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> Ce bilan rapide permet à CarlOS de 
                    calibrer ses recommandations. Tu pourras faire un bilan 
                    complet plus tard.
                  </p>
                </Card>
              </div>
            )}

            {/* ÉTAPE 4 - TON PREMIER QUICK WIN */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className="bg-amber-600 text-lg px-4 py-1">
                    ÉTAPE 4/4
                  </Badge>
                  <h2 className="text-2xl font-bold">TON PREMIER QUICK WIN</h2>
                </div>

                <Card className="p-5 bg-amber-50 border-2 border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🔵</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="font-semibold text-amber-900">CarlOS:</p>
                      <p className="text-gray-700 leading-relaxed">
                        "Parfait! Basé sur ce que tu m'as dit, voici ce que je te 
                        recommande comme premier Quick Win:"
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-8 w-8 text-blue-600" />
                      <h3 className="text-xl font-bold">
                        Quick Win recommandé par CarlOS
                      </h3>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-blue-600">1</Badge>
                        <div>
                          <p className="font-semibold">Analyser ton pipeline de soumissions</p>
                          <p className="text-sm text-gray-600">
                            Identifier les patterns des soumissions gagnées vs perdues
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge className="bg-purple-600">2</Badge>
                        <div>
                          <p className="font-semibold">Créer un scoring de qualification</p>
                          <p className="text-sm text-gray-600">
                            Éviter de perdre du temps sur les mauvais prospects
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge className="bg-green-600">3</Badge>
                        <div>
                          <p className="font-semibold">Template de soumission optimisé</p>
                          <p className="text-sm text-gray-600">
                            Réduire le temps de préparation de 40%
                          </p>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Impact estimé :</span>
                        <Badge className="bg-green-600 text-base px-3 py-1">
                          +25% taux de conversion
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Temps requis :</span>
                        <Badge variant="outline" className="text-base px-3 py-1">
                          2-3 semaines
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-blue-50 border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <Zap className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900 mb-2">
                        Prêt à commencer?
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Je vais créer ton premier cahier de projet et te guider 
                        étape par étape. Tu pourras discuter avec moi à tout moment 
                        dans le chat, et je ferai travailler mes 5 collègues C-Level 
                        selon les besoins.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          <Separator />

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              ← Précédent
            </Button>

            <div className="text-sm text-gray-500">
              Étape {currentStep} sur 4
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {currentStep === 4 ? 'Terminer' : 'Suivant'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
