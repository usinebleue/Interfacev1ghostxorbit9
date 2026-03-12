/**
 * DiagnosticIAPage.tsx — Diagnostic IA Usine Bleue "Le Gap Intelligence"
 * Wizard step-by-step: Profil → Départements → Absorption → (Bonus Fournisseur) → Résultats
 * 100% fonctionnel, scoring côté client, auto-save PostgreSQL
 */

import { useState, useEffect, useCallback } from "react";
import {
  Stethoscope, Plus, ChevronLeft, ChevronRight, Building2, Users,
  DollarSign, Target, CheckCircle2, ArrowLeft, Trash2, BarChart3, Clock,
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Progress } from "../../../../components/ui/progress";
import { PageLayout } from "../layouts/PageLayout";
import { api } from "../../../api/client";
import { BOT_AVATAR } from "../../../api/types";
import type { DiagnosticIA } from "../../../api/types";
import {
  DEPARTEMENTS, DEPARTMENT_QUESTIONS, ABSORPTION_QUESTIONS, APPROCHE_CLIENT_QUESTIONS,
  PROFIL_TYPES, DIAGNOSTIC_CATALOGUE, NB_EMPLOYES_OPTIONS, CA_OPTIONS, DEFI_OPTIONS, SEI_WEIGHTS, NIVEAUX_DIA,
  getDepartementsForTaille, getTailleFromEmployes, getQuestionText, getQuestionOptions, getNiveau,
  getDepartementNom, getDepartementGapPhrase, getSecteursForProfil, isSupplySideType,
  type ProfilType, type TailleCategorie, type DepartementInfo, type DiagnosticQuestion,
} from "./diagnostic-questions";

// ── Types internes ──

type WizardStep = "liste" | "type-select" | "catalogue" | "profil" | "departements" | "absorption" | "bonus-approche" | "resultats";

interface ProfilData {
  nom_entreprise: string;
  secteur: string;
  nb_employes: string;
  chiffre_affaires: string;
  defi_principal: string;
  profil_type: ProfilType;
}

// ── BOT names (for display) ──

const BOT_NAMES: Record<string, string> = {
  CEOB: "CarlOS", CFOB: "François", CMOB: "Martine", COOB: "Olivier",
  CPOB: "Fabien", CHROB: "Hélène", CTOB: "Thierry", CSOB: "Sophie",
  CROB: "Raphaël", CINOB: "Inès", CLOB: "Louise", CISOB: "Sébastien",
};

const BOT_ROLES: Record<string, string> = {
  CEOB: "CEO", CFOB: "CFO", CMOB: "CMO", COOB: "COO",
  CPOB: "Production", CHROB: "CHRO", CTOB: "CTO", CSOB: "CSO",
  CROB: "CRO", CINOB: "CINO", CLOB: "CLO", CISOB: "CISO",
};

// ══════════════════════════════════════════════════════════════
// COMPONENT PRINCIPAL
// ══════════════════════════════════════════════════════════════

export function DiagnosticIAPage() {
  const [step, setStep] = useState<WizardStep>("liste");
  const [diagnostics, setDiagnostics] = useState<DiagnosticIA[]>([]);
  const [currentDiagId, setCurrentDiagId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Profil state
  const [profil, setProfil] = useState<ProfilData>({
    nom_entreprise: "", secteur: "", nb_employes: "", chiffre_affaires: "",
    defi_principal: "", profil_type: "MFG",
  });
  const [selectedDiagType, setSelectedDiagType] = useState("maturite-ia");

  // Wizard state
  const [departements, setDepartements] = useState<DepartementInfo[]>([]);
  const [taille, setTaille] = useState<TailleCategorie>("petite");
  const [deptIndex, setDeptIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [reponses, setReponses] = useState<Record<string, number>>({});
  const [scoresDepts, setScoresDepts] = useState<Record<string, number>>({});

  // Absorption & bonus
  const [absorptionIndex, setAbsorptionIndex] = useState(0);
  const [bonusIndex, setBonusIndex] = useState(0);

  // Results
  const [resultData, setResultData] = useState<{
    scoreDIA: number; scoreSEI: number; scoreAbsorption: number;
    niveau: typeof NIVEAUX_DIA[number]; topGaps: { botCode: string; score: number; label: string }[];
    ghostTeam: { botCode: string; score: number; raison: string; priorite: string }[];
  } | null>(null);

  // ── Load diagnostics list ──
  const loadList = useCallback(async () => {
    try {
      const res = await api.diagnosticIAList(1);
      setDiagnostics(res.items || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  // ── Auto-save after each department ──
  const autoSave = useCallback(async (reponsesOverride?: Record<string, number>) => {
    if (!currentDiagId) return;
    const r = reponsesOverride || reponses;
    const deptScores: Record<string, number> = {};
    for (const dept of departements) {
      const qs = DEPARTMENT_QUESTIONS[dept.code];
      if (!qs) continue;
      const answered = qs.filter(q => r[q.id] !== undefined);
      if (answered.length > 0) {
        deptScores[dept.code] = Math.round(answered.reduce((sum, q) => sum + (r[q.id] || 0), 0) / answered.length);
      }
    }
    setScoresDepts(deptScores);
    try {
      await api.diagnosticIAUpdate(currentDiagId, {
        reponses: r,
        scores_departements: deptScores,
        departement_courant: deptIndex,
      });
    } catch { /* silent */ }
  }, [currentDiagId, reponses, departements, deptIndex]);

  // ── Create new diagnostic ──
  const handleNewDiagnostic = async () => {
    setStep("type-select");
    setProfil({ nom_entreprise: "", secteur: "", nb_employes: "", chiffre_affaires: "", defi_principal: "", profil_type: "MFG" });
    setReponses({});
    setScoresDepts({});
    setDeptIndex(0);
    setQuestionIndex(0);
    setAbsorptionIndex(0);
    setBonusIndex(0);
    setResultData(null);
    setCurrentDiagId(null);
    setSelectedDiagType("maturite-ia");
  };

  // ── Resume existing diagnostic ──
  const handleResume = async (diag: DiagnosticIA) => {
    setCurrentDiagId(diag.id);
    setProfil({
      nom_entreprise: diag.nom_entreprise,
      secteur: diag.secteur,
      nb_employes: diag.nb_employes,
      chiffre_affaires: diag.chiffre_affaires,
      defi_principal: diag.defi_principal,
      profil_type: diag.profil_type as ProfilType,
    });
    const t = diag.taille_categorie as TailleCategorie;
    setTaille(t);
    setDepartements(getDepartementsForTaille(t));
    setReponses(diag.reponses || {});
    setScoresDepts(diag.scores_departements || {});
    setDeptIndex(diag.departement_courant || 0);
    setQuestionIndex(0);
    setAbsorptionIndex(0);
    setBonusIndex(0);

    if (diag.status === "complete") {
      computeAndShowResults(diag.reponses || {}, getDepartementsForTaille(t), diag.profil_type as ProfilType);
    } else {
      setStep("departements");
    }
  };

  // ── Delete diagnostic ──
  const handleDelete = async (id: number) => {
    try {
      await api.diagnosticIADelete(id);
      loadList();
    } catch { /* silent */ }
  };

  // ── Submit profil → start departments ──
  const handleProfilSubmit = async () => {
    if (!profil.nom_entreprise || !profil.nb_employes) return;
    const t = getTailleFromEmployes(profil.nb_employes);
    setTaille(t);
    const deps = getDepartementsForTaille(t);
    setDepartements(deps);
    setLoading(true);
    try {
      const res = await api.diagnosticIACreate({
        user_id: 1,
        nom_entreprise: profil.nom_entreprise,
        secteur: profil.secteur,
        nb_employes: profil.nb_employes,
        chiffre_affaires: profil.chiffre_affaires,
        defi_principal: profil.defi_principal,
        profil_type: profil.profil_type,
        taille_categorie: t,
        nb_departements: deps.length,
      });
      setCurrentDiagId(res.id);
      setDeptIndex(0);
      setQuestionIndex(0);
      setStep("departements");
    } catch { /* silent */ }
    setLoading(false);
  };

  // ── Answer a question ──
  const handleAnswer = (questionId: string, score: number) => {
    const updated = { ...reponses, [questionId]: score };
    setReponses(updated);
  };

  // ── Navigation helpers ──
  const currentDept = departements[deptIndex];
  const currentDeptQuestions = currentDept ? DEPARTMENT_QUESTIONS[currentDept.code] || [] : [];
  const currentQuestion: DiagnosticQuestion | undefined =
    step === "departements" ? currentDeptQuestions[questionIndex] :
    step === "absorption" ? ABSORPTION_QUESTIONS[absorptionIndex] :
    step === "bonus-approche" ? APPROCHE_CLIENT_QUESTIONS[bonusIndex] :
    undefined;

  const totalQuestions = departements.length * 4 + ABSORPTION_QUESTIONS.length +
    (isSupplySideType(profil.profil_type) ? APPROCHE_CLIENT_QUESTIONS.length : 0);
  const answeredCount = Object.keys(reponses).length;
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleNext = () => {
    if (step === "departements") {
      if (questionIndex < currentDeptQuestions.length - 1) {
        setQuestionIndex(qi => qi + 1);
      } else if (deptIndex < departements.length - 1) {
        autoSave();
        setDeptIndex(di => di + 1);
        setQuestionIndex(0);
      } else {
        autoSave();
        setStep("absorption");
        setAbsorptionIndex(0);
      }
    } else if (step === "absorption") {
      if (absorptionIndex < ABSORPTION_QUESTIONS.length - 1) {
        setAbsorptionIndex(ai => ai + 1);
      } else if (isSupplySideType(profil.profil_type)) {
        setStep("bonus-approche");
        setBonusIndex(0);
      } else {
        finishDiagnostic();
      }
    } else if (step === "bonus-approche") {
      if (bonusIndex < APPROCHE_CLIENT_QUESTIONS.length - 1) {
        setBonusIndex(bi => bi + 1);
      } else {
        finishDiagnostic();
      }
    }
  };

  const handlePrev = () => {
    if (step === "departements") {
      if (questionIndex > 0) {
        setQuestionIndex(qi => qi - 1);
      } else if (deptIndex > 0) {
        setDeptIndex(di => di - 1);
        const prevDeptCode = departements[deptIndex - 1].code;
        const prevQs = DEPARTMENT_QUESTIONS[prevDeptCode] || [];
        setQuestionIndex(prevQs.length - 1);
      }
    } else if (step === "absorption") {
      if (absorptionIndex > 0) {
        setAbsorptionIndex(ai => ai - 1);
      } else {
        setStep("departements");
        setDeptIndex(departements.length - 1);
        const lastCode = departements[departements.length - 1].code;
        setQuestionIndex((DEPARTMENT_QUESTIONS[lastCode] || []).length - 1);
      }
    } else if (step === "bonus-approche") {
      if (bonusIndex > 0) {
        setBonusIndex(bi => bi - 1);
      } else {
        setStep("absorption");
        setAbsorptionIndex(ABSORPTION_QUESTIONS.length - 1);
      }
    }
  };

  // ── Compute scores & show results ──
  const computeAndShowResults = (r: Record<string, number>, deps: DepartementInfo[], profilType: ProfilType) => {
    const deptScores: Record<string, number> = {};
    for (const dept of deps) {
      const qs = DEPARTMENT_QUESTIONS[dept.code];
      if (!qs) continue;
      const answered = qs.filter(q => r[q.id] !== undefined);
      if (answered.length > 0) {
        deptScores[dept.code] = Math.round(answered.reduce((sum, q) => sum + (r[q.id] || 0), 0) / answered.length);
      }
    }
    setScoresDepts(deptScores);

    const absAnswered = ABSORPTION_QUESTIONS.filter(q => r[q.id] !== undefined);
    const scoreAbsorption = absAnswered.length > 0
      ? Math.round(absAnswered.reduce((sum, q) => sum + (r[q.id] || 0), 0) / absAnswered.length)
      : 0;

    const deptValues = Object.values(deptScores);
    const avgDept = deptValues.length > 0 ? deptValues.reduce((a, b) => a + b, 0) / deptValues.length : 0;
    const scoreDIA = Math.round(avgDept * 0.80 + scoreAbsorption * 0.20);

    let seiTotal = 0;
    let seiWeightTotal = 0;
    for (const [, cfg] of Object.entries(SEI_WEIGHTS)) {
      const available = cfg.depts.filter(d => deptScores[d] !== undefined);
      if (available.length > 0) {
        const avg = available.reduce((sum, d) => sum + (deptScores[d] || 0), 0) / available.length;
        seiTotal += avg * cfg.weight;
        seiWeightTotal += cfg.weight;
      }
    }
    const scoreSEI = seiWeightTotal > 0 ? Math.round(seiTotal / seiWeightTotal) : 0;

    const niveau = getNiveau(scoreDIA);

    const sortedDepts = deps
      .filter(d => deptScores[d.code] !== undefined)
      .sort((a, b) => (deptScores[a.code] || 0) - (deptScores[b.code] || 0));
    const topGaps = sortedDepts.slice(0, 3).map(d => ({
      botCode: d.code,
      score: deptScores[d.code] || 0,
      label: getDepartementNom(d, profilType),
    }));

    const ghostTeam = sortedDepts.map(d => {
      const score = deptScores[d.code] || 0;
      const priorite = score < 40 ? "immediate" : score < 60 ? "phase2" : "optimisation";
      const gap = getDepartementGapPhrase(d, profilType);
      return { botCode: d.code, score, raison: gap, priorite };
    });

    setResultData({ scoreDIA, scoreSEI, scoreAbsorption, niveau, topGaps, ghostTeam });
    setStep("resultats");
  };

  const finishDiagnostic = async () => {
    computeAndShowResults(reponses, departements, profil.profil_type);

    if (currentDiagId) {
      const deptScores: Record<string, number> = {};
      for (const dept of departements) {
        const qs = DEPARTMENT_QUESTIONS[dept.code];
        if (!qs) continue;
        const answered = qs.filter(q => reponses[q.id] !== undefined);
        if (answered.length > 0) {
          deptScores[dept.code] = Math.round(answered.reduce((sum, q) => sum + (reponses[q.id] || 0), 0) / answered.length);
        }
      }
      const absAnswered = ABSORPTION_QUESTIONS.filter(q => reponses[q.id] !== undefined);
      const scoreAbs = absAnswered.length > 0 ? Math.round(absAnswered.reduce((s, q) => s + (reponses[q.id] || 0), 0) / absAnswered.length) : 0;
      const deptValues = Object.values(deptScores);
      const avgDept = deptValues.length > 0 ? deptValues.reduce((a, b) => a + b, 0) / deptValues.length : 0;
      const dia = Math.round(avgDept * 0.80 + scoreAbs * 0.20);

      let seiTotal = 0;
      let seiWeightTotal = 0;
      for (const [, cfg] of Object.entries(SEI_WEIGHTS)) {
        const available = cfg.depts.filter(d => deptScores[d] !== undefined);
        if (available.length > 0) {
          const avg = available.reduce((sum, d) => sum + (deptScores[d] || 0), 0) / available.length;
          seiTotal += avg * cfg.weight;
          seiWeightTotal += cfg.weight;
        }
      }
      const scoreSEI = seiWeightTotal > 0 ? Math.round(seiTotal / seiWeightTotal) : 0;

      try {
        await api.diagnosticIAUpdate(currentDiagId, {
          reponses,
          scores_departements: deptScores,
          score_absorption: scoreAbs,
          score_dia: dia,
          score_sei: scoreSEI,
          niveau: getNiveau(dia).label,
          top_gaps: resultData?.topGaps || [],
          ghost_team: resultData?.ghostTeam || [],
          status: "complete",
        });
      } catch { /* silent */ }
    }
    loadList();
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER — Liste des diagnostics
  // ══════════════════════════════════════════════════════════════

  if (step === "liste") {
    return (
      <PageLayout maxWidth="4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              Diagnostic IA
            </h1>
            <p className="text-sm text-gray-500 mt-1">Évaluez la maturité IA de vos prospects en 30 minutes</p>
          </div>
          <button
            onClick={handleNewDiagnostic}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Plus className="h-4 w-4" /> Nouveau diagnostic
          </button>
        </div>

        {diagnostics.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun diagnostic pour le moment</p>
              <p className="text-sm text-gray-400 mt-1">Cliquez sur "Nouveau diagnostic" pour commencer</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {diagnostics.map(d => (
              <Card key={d.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0" onClick={() => handleResume(d)}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 truncate">{d.nom_entreprise || "Sans nom"}</span>
                      <Badge variant={d.status === "complete" ? "default" : "secondary"} className="text-[9px]">
                        {d.status === "complete" ? "Complété" : "En cours"}
                      </Badge>
                      {d.niveau && (
                        <Badge className="text-[9px]" style={{ backgroundColor: getNiveau(d.score_dia).color + "22", color: getNiveau(d.score_dia).color }}>
                          {d.niveau}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{d.secteur || "—"}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{d.nb_employes || "—"} emp.</span>
                      {d.score_dia > 0 && <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />DIA: {Math.round(d.score_dia)}/100</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{d.created_at ? new Date(d.created_at).toLocaleDateString("fr-CA") : ""}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(d.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Supprimer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageLayout>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER — Sélection du type d'acteur (6 cartes)
  // ══════════════════════════════════════════════════════════════

  if (step === "type-select") {
    return (
      <PageLayout maxWidth="4xl">
        <button onClick={() => setStep("liste")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4" /> Retour à la liste
        </button>

        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">Quel type d'acteur êtes-vous?</h1>
          <p className="text-sm text-gray-500 mt-1">Sélectionnez votre profil pour un diagnostic adapté à votre réalité</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {PROFIL_TYPES.map(pt => (
            <button
              key={pt.code}
              onClick={() => {
                setProfil(p => ({ ...p, profil_type: pt.code }));
                setStep("catalogue");
              }}
              className="p-5 rounded-xl border-2 text-left transition-all hover:shadow-md group"
              style={{ borderColor: profil.profil_type === pt.code ? pt.color : "#e5e7eb" }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 text-white text-sm font-bold" style={{ backgroundColor: pt.color }}>
                {pt.code}
              </div>
              <div className="font-semibold text-sm text-gray-900 group-hover:text-gray-700">{pt.nom}</div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{pt.description}</div>
              <div className="text-xs text-gray-400 mt-2">{pt.stat}</div>
            </button>
          ))}
        </div>
      </PageLayout>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER — Catalogue de diagnostics
  // ══════════════════════════════════════════════════════════════

  if (step === "catalogue") {
    const profilInfo = PROFIL_TYPES.find(p => p.code === profil.profil_type);
    const availableDiags = DIAGNOSTIC_CATALOGUE.filter(d =>
      d.profilTypes === "all" || d.profilTypes.includes(profil.profil_type)
    );

    return (
      <PageLayout maxWidth="4xl">
        <button onClick={() => setStep("type-select")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4" /> Changer le type
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: profilInfo?.color }}>
            {profil.profil_type}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Diagnostics — {profilInfo?.nom}</h1>
            <p className="text-sm text-gray-500">Choisissez un diagnostic adapté à votre réalité</p>
          </div>
        </div>

        <div className="space-y-3">
          {availableDiags.map(diag => (
            <Card key={diag.id} className={`transition-all ${diag.available ? "hover:shadow-md cursor-pointer" : "opacity-60"}`}>
              <CardContent className="py-4">
                <div
                  className="flex items-center gap-4"
                  onClick={() => {
                    if (!diag.available) return;
                    setSelectedDiagType(diag.id);
                    setStep("profil");
                  }}
                >
                  <Stethoscope className="h-8 w-8 text-blue-500 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">{diag.nom}</span>
                      {diag.badge && <Badge className="text-[9px] bg-blue-100 text-blue-700">{diag.badge}</Badge>}
                      {!diag.available && <Badge variant="secondary" className="text-[9px]">Bientôt</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{diag.description}</p>
                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Clock className="h-3.5 w-3.5" /> ~{diag.estimatedMinutes} min
                    </span>
                  </div>
                  {diag.available && <ChevronRight className="h-5 w-5 text-gray-400" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageLayout>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER — Profil d'entrée
  // ══════════════════════════════════════════════════════════════

  if (step === "profil") {
    return (
      <PageLayout maxWidth="4xl">
        <button onClick={() => setStep("catalogue")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4" /> Retour au catalogue
        </button>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Profil de l'entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Type d'acteur (déjà sélectionné) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type d'acteur</label>
              <div className="flex items-center gap-3 p-3 rounded-lg border-2 bg-gray-50" style={{ borderColor: PROFIL_TYPES.find(p => p.code === profil.profil_type)?.color || "#3b82f6" }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PROFIL_TYPES.find(p => p.code === profil.profil_type)?.color }} />
                <div>
                  <span className="text-sm font-medium">{PROFIL_TYPES.find(p => p.code === profil.profil_type)?.nom}</span>
                  <span className="text-xs text-gray-500 ml-2">{PROFIL_TYPES.find(p => p.code === profil.profil_type)?.description}</span>
                </div>
                <button onClick={() => setStep("type-select")} className="ml-auto text-xs text-blue-600 hover:text-blue-700">Changer</button>
              </div>
            </div>

            {/* Nom entreprise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise *</label>
              <input
                type="text"
                value={profil.nom_entreprise}
                onChange={e => setProfil(p => ({ ...p, nom_entreprise: e.target.value }))}
                className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Manufacture Boréal Inc."
              />
            </div>

            {/* Secteur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d'activité</label>
              <select
                value={profil.secteur}
                onChange={e => setProfil(p => ({ ...p, secteur: e.target.value }))}
                className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Sélectionner...</option>
                {getSecteursForProfil(profil.profil_type).map(s => <option key={s.code} value={s.label}>{s.label}</option>)}
              </select>
            </div>

            {/* Nb employés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'employés *</label>
              <div className="grid grid-cols-3 gap-2">
                {NB_EMPLOYES_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setProfil(p => ({ ...p, nb_employes: opt }))}
                    className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                      profil.nb_employes === opt ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {profil.nb_employes && (
                <p className="text-xs text-blue-600 mt-2">
                  → {getTailleFromEmployes(profil.nb_employes) === "petite" ? "6 départements (Essentiel)" :
                     getTailleFromEmployes(profil.nb_employes) === "moyenne" ? "9 départements (Complet)" :
                     "12 départements (C-Suite intégral)"} — ~{getDepartementsForTaille(getTailleFromEmployes(profil.nb_employes)).length * 4 + 6} questions
                </p>
              )}
            </div>

            {/* CA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chiffre d'affaires annuel</label>
              <div className="grid grid-cols-5 gap-2">
                {CA_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setProfil(p => ({ ...p, chiffre_affaires: opt }))}
                    className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                      profil.chiffre_affaires === opt ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Défi principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plus grand défi en ce moment</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {DEFI_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setProfil(p => ({ ...p, defi_principal: opt }))}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      profil.defi_principal === opt ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProfilSubmit}
              disabled={!profil.nom_entreprise || !profil.nb_employes || loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Création..." : "Commencer le diagnostic →"}
            </button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER — Questions (Départements / Absorption / Bonus)
  // ══════════════════════════════════════════════════════════════

  if (step === "departements" || step === "absorption" || step === "bonus-approche") {
    const sectionLabel =
      step === "departements" ? (currentDept ? getDepartementNom(currentDept, profil.profil_type) : "") :
      step === "absorption" ? "Capacité d'absorption" :
      "Approche Client — Capacité de vente conseil";

    const sectionSubLabel =
      step === "departements" ? `Département ${deptIndex + 1}/${departements.length} — Question ${questionIndex + 1}/4` :
      step === "absorption" ? `Question ${absorptionIndex + 1}/${ABSORPTION_QUESTIONS.length}` :
      `Question ${bonusIndex + 1}/${APPROCHE_CLIENT_QUESTIONS.length}`;

    const question = currentQuestion;
    if (!question) return null;

    const qText = getQuestionText(question, profil.profil_type);
    const qOptions = getQuestionOptions(question, profil.profil_type);
    const selectedScore = reponses[question.id];
    const canGoNext = selectedScore !== undefined;

    const deptPartialScore = step === "departements" && currentDept
      ? (() => {
          const qs = currentDeptQuestions.filter(q => reponses[q.id] !== undefined);
          return qs.length > 0 ? Math.round(qs.reduce((s, q) => s + (reponses[q.id] || 0), 0) / qs.length) : null;
        })()
      : null;

    return (
      <PageLayout maxWidth="4xl">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{profil.nom_entreprise}</span>
            <span>{answeredCount}/{totalQuestions} questions — {progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{sectionLabel}</h2>
            <p className="text-sm text-gray-500">{sectionSubLabel}</p>
          </div>
          {step === "departements" && currentDept && (
            <div className="flex items-center gap-2">
              <img src={BOT_AVATAR[currentDept.code] || BOT_AVATAR["CEOB"]} alt={currentDept.code} className="h-8 w-8 rounded-full" />
              {deptPartialScore !== null && (
                <Badge className="text-[9px]" style={{
                  backgroundColor: deptPartialScore < 40 ? "#fef2f2" : deptPartialScore < 60 ? "#fffbeb" : "#f0fdf4",
                  color: deptPartialScore < 40 ? "#dc2626" : deptPartialScore < 60 ? "#d97706" : "#16a34a",
                }}>
                  {deptPartialScore}%
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Question card */}
        <Card>
          <CardContent className="py-6">
            <p className="text-base font-medium text-gray-900 mb-6">{qText}</p>

            <div className="space-y-3">
              {qOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(question.id, opt.score)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all min-h-[48px] ${
                    selectedScore === opt.score
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedScore === opt.score ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    }`}>
                      {selectedScore === opt.score && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={step === "departements" && deptIndex === 0 && questionIndex === 0}
            className="flex items-center gap-1 px-4 py-2.5 text-sm text-gray-600 bg-white border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Précédent
          </button>
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="flex items-center gap-1 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </PageLayout>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER — Résultats
  // ══════════════════════════════════════════════════════════════

  if (step === "resultats" && resultData) {
    const radarData = departements.map(d => ({
      dept: d.nom.split(" / ")[0].substring(0, 12),
      score: scoresDepts[d.code] || 0,
      fullMark: 100,
    }));

    const immediateTeam = resultData.ghostTeam.filter(g => g.priorite === "immediate");
    const phase2Team = resultData.ghostTeam.filter(g => g.priorite === "phase2");

    return (
      <PageLayout maxWidth="4xl">
        <button onClick={() => { setStep("liste"); loadList(); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="h-4 w-4" /> Retour à la liste
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{profil.nom_entreprise}</h1>
              <p className="text-sm text-blue-100 mt-1">
                {profil.secteur} · {profil.nb_employes} employés · {profil.chiffre_affaires}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{resultData.scoreDIA}</div>
              <div className="text-xs text-blue-200 uppercase tracking-wide mt-1">/100</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Badge className="text-sm px-3 py-1" style={{ backgroundColor: resultData.niveau.color + "33", color: "#fff" }}>
              {resultData.niveau.label}
            </Badge>
            <span className="text-sm text-blue-100">{resultData.niveau.description}</span>
          </div>
        </div>

        {/* Page 1 — Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score par département</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="dept" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Score bars */}
            <div className="space-y-2 mt-4">
              {departements.map(d => {
                const score = scoresDepts[d.code] || 0;
                const color = score < 40 ? "#ef4444" : score < 60 ? "#f59e0b" : "#22c55e";
                const label = getDepartementNom(d, profil.profil_type);
                return (
                  <div key={d.code} className="flex items-center gap-3">
                    <img src={BOT_AVATAR[d.code] || BOT_AVATAR["CEOB"]} alt={d.code} className="h-6 w-6 rounded-full shrink-0" />
                    <span className="text-xs text-gray-600 w-28 truncate">{label}</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-xs font-bold w-10 text-right" style={{ color }}>{score}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Page 2 — SEI Gap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Gap IA — Score d'Exposition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900">{resultData.scoreSEI}/100</div>
              <p className="text-sm text-gray-500 mt-1">
                L'IA peut accélérer 94% des tâches de gestion. Votre entreprise en utilise environ {resultData.scoreSEI}%.
              </p>
              <div className="mt-3 flex items-center gap-2 max-w-md mx-auto">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-100 opacity-40" style={{ width: "94%" }} />
                  <div className="h-full bg-blue-600 rounded-full relative z-10" style={{ width: `${resultData.scoreSEI}%` }} />
                </div>
                <span className="text-xs text-gray-500">{100 - resultData.scoreSEI}% inexploité</span>
              </div>
            </div>

            <h3 className="font-semibold text-sm text-gray-700 mb-3">Top 3 Gains Rapides</h3>
            <div className="space-y-3">
              {resultData.topGaps.map((gap, i) => {
                const dept = DEPARTEMENTS.find(d => d.code === gap.botCode);
                return (
                  <div key={gap.botCode} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{gap.label}</span>
                        <Badge variant="destructive" className="text-[9px]">Gap: {100 - gap.score}%</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {dept ? getDepartementGapPhrase(dept, profil.profil_type).substring(0, 120) : ""}...
                      </p>
                    </div>
                    <img src={BOT_AVATAR[gap.botCode] || BOT_AVATAR["CEOB"]} alt={gap.botCode} className="h-8 w-8 rounded-full shrink-0" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Page 3 — Plan d'action 90 jours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Plan d'action 90 jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-sm text-red-700 mb-2">Mois 1 — Quick Wins</h4>
                <ul className="space-y-1.5">
                  {immediateTeam.slice(0, 3).map(g => (
                    <li key={g.botCode} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      Activer {BOT_NAMES[g.botCode]} ({BOT_ROLES[g.botCode]} — {g.score}%)
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    Baseline KPI actuels (avant/après)
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-sm text-amber-700 mb-2">Mois 2 — Expansion</h4>
                <ul className="space-y-1.5">
                  {phase2Team.slice(0, 3).map(g => (
                    <li key={g.botCode} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      Activer {BOT_NAMES[g.botCode]} ({BOT_ROLES[g.botCode]} — {g.score}%)
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    Premier Plan Strategique Ghost Team
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-sm text-green-700 mb-2">Mois 3 — Écosystème</h4>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />Activer les bots restants</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />Connexion réseau Orbit9 (130+ entreprises)</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />Mesure d'impact vs baseline mois 1</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />Re-diagnostic (progression SEI)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Page 4 — Ghost Team recommandé */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Votre Ghost Team recommandé</CardTitle>
          </CardHeader>
          <CardContent>
            {immediateTeam.length > 0 && (
              <>
                <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">Priorité immédiate (Score &lt; 40%)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {immediateTeam.slice(0, 3).map(g => (
                    <div key={g.botCode} className="p-4 border-2 border-red-200 bg-red-50 rounded-xl text-center">
                      <img src={BOT_AVATAR[g.botCode] || BOT_AVATAR["CEOB"]} alt={g.botCode} className="h-12 w-12 rounded-full mx-auto mb-2" />
                      <div className="font-bold text-sm">{BOT_NAMES[g.botCode]}</div>
                      <div className="text-xs text-gray-500">{BOT_ROLES[g.botCode]}</div>
                      <div className="text-lg font-bold mt-1" style={{ color: "#ef4444" }}>{g.score}%</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {phase2Team.length > 0 && (
              <>
                <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">Phase 2 (Score 40-60%)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {phase2Team.map(g => (
                    <div key={g.botCode} className="p-3 border border-amber-200 bg-amber-50 rounded-lg text-center">
                      <img src={BOT_AVATAR[g.botCode] || BOT_AVATAR["CEOB"]} alt={g.botCode} className="h-8 w-8 rounded-full mx-auto mb-1" />
                      <div className="font-medium text-xs">{BOT_NAMES[g.botCode]}</div>
                      <div className="text-sm font-bold mt-0.5" style={{ color: "#d97706" }}>{g.score}%</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-center">
              <p className="text-lg font-bold text-gray-900">12 Directeurs C-Level IA</p>
              <p className="text-sm text-gray-600 mt-1">0 politique de bureau · 24/7 · multilingue</p>
              <p className="text-sm text-blue-600 font-medium mt-2">
                "94% de potentiel. {resultData.scoreSEI}% utilisé. CarlOS ferme le gap."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Absorption score */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Capacité d'absorption</span>
                <span className="text-xs text-gray-500 ml-2">— Aptitude organisationnelle à intégrer l'IA</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${resultData.scoreAbsorption}%` }} />
                </div>
                <span className="text-sm font-bold text-emerald-600">{resultData.scoreAbsorption}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return null;
}
