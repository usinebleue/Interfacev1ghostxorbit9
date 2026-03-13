/**
 * OnboardingView.tsx — Flow 3 etapes pour nouveaux utilisateurs
 * Etape 1: Bienvenue + Profil entreprise (nom, secteur, taille)
 * Etape 2: Enjeu principal
 * Etape 3: Lancer le premier diagnostic VITAA
 * Sauvegarde via POST /api/v1/onboarding puis redirige vers dashboard
 */

import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Target,
  Activity,
  CheckCircle2,
  Users,
  Factory,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../components/ui/utils";
import { api } from "../../api/client";
import { useFrameMaster } from "../../context/FrameMasterContext";

const SECTEURS = [
  "Usinage / Metal",
  "Alimentaire / Transformation",
  "Plastique / Composites",
  "Bois / Meubles",
  "Electronique / High-tech",
  "Distribution / Logistique",
  "Integration / Automatisation",
  "Services professionnels",
  "Construction / Infrastructure",
  "Autre",
];

const TAILLES = [
  { label: "1-10 employes", value: "micro" },
  { label: "11-50 employes", value: "petite" },
  { label: "51-200 employes", value: "moyenne" },
  { label: "201-500 employes", value: "grande" },
  { label: "500+ employes", value: "tres-grande" },
];

interface OnboardingViewProps {
  onComplete?: () => void;
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const { setActiveView } = useFrameMaster();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 data
  const [nomEntreprise, setNomEntreprise] = useState("");
  const [secteur, setSecteur] = useState("");
  const [taille, setTaille] = useState("");

  // Step 2 data
  const [enjeu, setEnjeu] = useState("");

  const canProceed = () => {
    if (step === 1) return nomEntreprise.length >= 2 && secteur && taille;
    if (step === 2) return enjeu.length >= 5;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Save onboarding data
      await api.onboardingSave({
        step: "complete",
        responses: {
          nom_entreprise: nomEntreprise,
          secteur,
          taille,
          enjeu_principal: enjeu,
        },
      });
    } catch {
      // non-blocking
    }
    setSaving(false);
    onComplete?.();
    setActiveView("health"); // Vers diagnostic VITAA
  };

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s, idx) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                  s < step
                    ? "bg-green-500 text-white"
                    : s === step
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-gray-200 text-gray-500"
                )}
              >
                {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {idx < 2 && (
                <div className={cn("w-16 h-0.5 mx-2", s < step ? "bg-green-500" : "bg-gray-200")} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Profil Entreprise */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                <Building2 className="h-7 w-7 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Bienvenue sur GhostX</h2>
              <p className="text-gray-500">Parle-moi de ton entreprise pour que CarlOS s'adapte a toi.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'entreprise</label>
                <input
                  type="text"
                  value={nomEntreprise}
                  onChange={(e) => setNomEntreprise(e.target.value)}
                  placeholder="Ex: MetalPro QC"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Factory className="h-3.5 w-3.5 inline mr-1" />
                  Secteur d'activite
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SECTEURS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSecteur(s)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm text-left border transition-all cursor-pointer",
                        secteur === s
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Users className="h-3.5 w-3.5 inline mr-1" />
                  Taille
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAILLES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTaille(t.value)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm border transition-all cursor-pointer",
                        taille === t.value
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Enjeu Principal */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                <Target className="h-7 w-7 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Ton enjeu #1</h2>
              <p className="text-gray-500">Si tu devais regler UN SEUL probleme dans les 90 prochains jours, ce serait quoi?</p>
            </div>

            <textarea
              value={enjeu}
              onChange={(e) => setEnjeu(e.target.value)}
              placeholder="Ex: On perd trop de temps sur des soumissions qu'on gagne pas. Notre taux de conversion est sous 15%..."
              rows={5}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
            />

            <div className="bg-purple-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-medium text-purple-900 mb-2">Exemples de priorites courantes :</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Manque de liquidites / cash flow serre</li>
                <li>Difficulte a recruter / garder les talents</li>
                <li>Processus inefficaces / perte de temps</li>
                <li>Croissance stagnante / manque de nouveaux clients</li>
                <li>Trop dependant d'un gros client</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 3 — Lancer le diagnostic */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <Activity className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Pret pour le diagnostic?</h2>
              <p className="text-gray-500">CarlOS va analyser la sante de ton entreprise avec le Diagnostic VITAA.</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">CarlOS:</p>
                  <p className="text-gray-700 mt-1 leading-relaxed">
                    "Parfait {nomEntreprise ? nomEntreprise : ""}! Je vais te poser quelques questions pour comprendre ou
                    ton entreprise se situe sur les 5 piliers VITAA: Vente, Idee, Temps, Argent, Actif.
                    Ca prend environ 10-15 minutes et tu vas recevoir un bilan complet avec des recommandations."
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-xs text-gray-500">departements analyses</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-purple-600">~15</p>
                <p className="text-xs text-gray-500">minutes</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">1</p>
                <p className="text-xs text-gray-500">plan d'action</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : setActiveView("dashboard")}
            className="text-sm"
          >
            {step === 1 ? "Passer" : "Precedent"}
          </Button>

          <span className="text-sm text-gray-400">Etape {step}/3</span>

          <Button
            onClick={() => step < 3 ? setStep(step + 1) : handleFinish()}
            disabled={!canProceed() || saving}
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm"
          >
            {step === 3 ? (saving ? "Enregistrement..." : "Lancer le diagnostic") : "Suivant"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
