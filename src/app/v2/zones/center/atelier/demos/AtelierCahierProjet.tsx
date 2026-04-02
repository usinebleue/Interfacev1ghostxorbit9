/**
 * AtelierCahierProjet.tsx — Self-contained simulation "Cahier de Projet" V3
 * GAUCHE: Chat riche avec actions inline (challenge budget, ajuster KPIs, risques)
 * DROITE: Document cahier 7 sections qui se batit progressivement — pattern DocForge
 * Pattern: CarlOS guide -> sections generees -> utilisateur valide/challenge -> cahier complet
 * Data: SIM_ACTE3 (cahier-smart-data.ts)
 * Self-contained: TopBar, sub-tabs, split-screen, SBubble/SBtn/AutoAdvance
 */

"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Home,
  Building2,
  Users,
  Brain,
  Globe,
  Shield,
  MessageSquare,
  FileText,
  CheckCircle2,
  Gauge,
  Wrench,
  DollarSign,
  Calendar,
  BarChart3,
  ClipboardCheck,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Target,
  Send,
  Pin,
  Download,
  Lock,
  Mic,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { SIM_ACTE3 } from "../../cahier-smart-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

type Stage =
  | "intro"
  | "thinking"
  | "profil"
  | "diagnostic"
  | "solutions"
  | "budget"
  | "timeline"
  | "kpis"
  | "validation"
  | "summary"
  | "ceremony";

const STAGE_ORDER: Stage[] = [
  "intro", "thinking", "profil", "diagnostic", "solutions",
  "budget", "timeline", "kpis", "validation", "summary", "ceremony",
];

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Introduction",
  thinking: "Construction...",
  profil: "Section 1 — Profil",
  diagnostic: "Section 2 — Diagnostic",
  solutions: "Section 3 — Solutions",
  budget: "Section 4 — Budget",
  timeline: "Section 5 — Plan",
  kpis: "Section 6 — KPIs",
  validation: "Section 7 — Validation",
  summary: "Resume",
  ceremony: "Cahier complet",
};

const SECTION_ICONS: Record<number, React.ElementType> = {
  1: Building2,
  2: Gauge,
  3: Wrench,
  4: DollarSign,
  5: Calendar,
  6: BarChart3,
  7: ClipboardCheck,
};

const DEPT_SUBTABS = ["Vue d'ensemble", "Blueprint", "Sante", "Chantiers", "Projets", "Missions", "Taches", "Discussions", "Documents"];

// ═══════════════════════════════════════
// CHALLENGE DATA
// ═══════════════════════════════════════

const BUDGET_CHALLENGE =
  "Le budget de 1.1M$ brut semble eleve, mais decomposons : le CO2 transcritique (450K$) c'est 3x le cout d'un systeme HFC classique, MAIS les HFC seront interdits en 2028 — donc on evite un remplacement obligatoire dans 2 ans. Le cobot UR10e (185K$) se paye en 14 mois avec les economies de main d'oeuvre. Les subventions de 592K$ ramenent l'investissement net a 508K$ — soit 2.3% du CA annuel d'Aliments Boreal. Le financement BDC a 4.5% donne un cash-flow net positif de +13,700$/mois des le jour 1.";

const RISK_ANALYSIS = [
  { id: "R1", label: "Subventions refusees", prob: "Faible (2%)", impact: "Eleve", mitigation: "Depot simultane 4 programmes, 98% taux historique Energia" },
  { id: "R2", label: "Delai livraison CO2", prob: "Moyen (15%)", impact: "Moyen", mitigation: "Buffer 15% par phase, penalites contractuelles Energia" },
  { id: "R3", label: "Resistance au changement", prob: "Moyen (20%)", impact: "Faible", mitigation: "Formation Phase 1 AVANT cobots, 0 licenciements" },
  { id: "R4", label: "Depassement budgetaire", prob: "Faible (8%)", impact: "Moyen", mitigation: "Contrat forfaitaire Energia, 10% contingence incluse" },
];

const KPI_CHALLENGE =
  "Les cibles sont basees sur 23 projets similaires chez Energia — pas des projections theoriques. La reduction de -36% en consommation energetique est le MINIMUM observe (moyenne a -42%). Le throughput de +15% est conservateur — le cobot seul augmente la cadence de palettisation de +85%, le 15% tient compte du goulot en amont. Les 0 incidents SST sont realistes car le cobot elimine 100% du levage repetitif.";

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function AtelierCahierProjet({ onBack }: { onBack?: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [typed, setTyped] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // Challenge states
  const [showBudgetChallenge, setShowBudgetChallenge] = useState(false);
  const [showRiskAnalysis, setShowRiskAnalysis] = useState(false);
  const [showKpiChallenge, setShowKpiChallenge] = useState(false);

  // Document section fill state (right panel)
  const [sectionsFilled, setSectionsFilled] = useState<number[]>([]);
  const [extractedNotes, setExtractedNotes] = useState<string[]>([]);

  const si = STAGE_ORDER.indexOf(stage);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage, typed, showBudgetChallenge, showRiskAnalysis, showKpiChallenge]);

  useEffect(() => {
    if (rightRef.current) rightRef.current.scrollTop = 0;
  }, [stage]);

  const fillSection = (num: number) => {
    if (!sectionsFilled.includes(num)) {
      setSectionsFilled((prev) => [...prev, num]);
    }
  };

  const handleExtract = (key: string) => {
    if (!extractedNotes.includes(key)) {
      setExtractedNotes((prev) => [...prev, key]);
    }
  };

  const handleReset = () => {
    setStage("intro");
    setTyped(false);
    setShowBudgetChallenge(false);
    setShowRiskAnalysis(false);
    setShowKpiChallenge(false);
    setSectionsFilled([]);
    setExtractedNotes([]);
  };

  const goNext = (s: Stage) => { setTyped(false); setStage(s); };

  const discussionContext =
    si <= 1 ? "Cahier de Projet — Demarrage" :
    si <= 3 ? "Cahier de Projet — Sections 1-2" :
    si <= 5 ? "Cahier de Projet — Budget & Solutions" :
    si <= 8 ? "Cahier de Projet — Plan & KPIs" :
    "Cahier de Projet — Finalisation";

  const filledCount = sectionsFilled.length;

  // ═══════════════════════════════════════
  // CHAT CONTENT (Left Panel)
  // ═══════════════════════════════════════
  const chatContent = (
    <>
      {/* CEO intro */}
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText
                text="L'integrateur est selectionne — Energia Solutions, score de 94%. Maintenant on construit le Cahier de Projet SMART : un document complet en 7 sections qui structure tout le projet. C'est le livrable final que le client et l'integrateur vont signer."
                speed={10}
                className="text-sm text-gray-700"
                onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("thinking")} icon={Send} label="Construire le cahier" />}
            </>
          ) : (
            <p className="text-[9px] text-gray-400 italic">Energia Solutions selectionne (94%). Construction du Cahier SMART.</p>
          )}
        </SBubble>
      )}

      {/* Building thinking */}
      {si >= 1 && si <= 1 && (
        <>
          <SBubble code="CEOB" collapsed={false}>
            <div className="space-y-2">
              {SIM_ACTE3.buildingThinking.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-[9px] text-gray-600 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 400}ms`, animationFillMode: "both", animationDuration: "500ms" }}>
                  <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center shrink-0">
                    <step.icon className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span>{step.text}</span>
                  <div className="flex gap-0.5 ml-auto">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              ))}
            </div>
          </SBubble>
          <AutoAdvance onComplete={() => { fillSection(1); fillSection(2); goNext("profil"); }} delay={3000} />
        </>
      )}

      {/* Section 1-2: Profil + Diagnostic */}
      {si >= 2 && (
        <>
          <SBubble code="CEOB" collapsed={si > 2}>
            {si === 2 ? (
              <>
                <TypewriterText
                  text="Les 2 premieres sections sont generees : le profil complet d'Aliments Boreal (85 employes, 4 lignes, 45 SKUs, 18M$ CA) et l'analyse detaillee des 5 systemes critiques. On a 278,000$/an en pertes recuperables — refrigeration et palettisation en tete."
                  speed={8}
                  className="text-sm text-gray-700"
                  onComplete={() => setTyped(true)}
                />
                {typed && (
                  <SBtn onClick={() => goNext("diagnostic")} icon={ArrowRight} label="Generer les solutions" />
                )}
              </>
            ) : (
              <p className="text-[9px] text-gray-400 italic">Sections 1-2 generees — Profil + Diagnostic 278K$/an pertes</p>
            )}
          </SBubble>

          {si === 2 && typed && (
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-xl rounded-tr-none px-3 py-2 max-w-[85%] shadow-sm">
                <p className="text-[9px]">C'est impressionnant la vitesse. Les chiffres du diagnostic sont bons — on avait estime a peu pres la meme chose en interne.</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Thinking for sections 3-4 */}
      {si >= 3 && si <= 3 && (
        <>
          <SBubble code="CEOB" collapsed={false}>
            <div className="space-y-2">
              {[
                { icon: Wrench, text: "Conception du concept preliminaire..." },
                { icon: DollarSign, text: "Calcul du montage financier..." },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-[9px] text-gray-600 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 400}ms`, animationFillMode: "both", animationDuration: "500ms" }}>
                  <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center shrink-0">
                    <step.icon className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span>{step.text}</span>
                  <div className="flex gap-0.5 ml-auto">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              ))}
            </div>
          </SBubble>
          <AutoAdvance onComplete={() => { fillSection(3); fillSection(4); goNext("solutions"); }} delay={2500} />
        </>
      )}

      {/* Section 3-4: Solutions + Budget */}
      {si >= 4 && (
        <>
          <SBubble code="CEOB" collapsed={si > 4}>
            {si === 4 ? (
              <TypewriterText
                text="Sections 3 et 4 ajoutees : le concept preliminaire detaille les 4 solutions (CO2 transcritique, chaudieres condensation, cobot UR10e, HVAC+IoT) et le montage financier montre un investissement net de 508K$ apres 592K$ de subventions."
                speed={8}
                className="text-sm text-gray-700"
                onComplete={() => setTyped(true)}
              />
            ) : (
              <p className="text-[9px] text-gray-400 italic">Sections 3-4 — Solutions + Budget 508K$ net</p>
            )}
          </SBubble>

          {si >= 4 && (
            <SBubble code="CFOB" collapsed={si > 4}>
              {si === 4 ? (
                <TypewriterText
                  text="Le financement BDC Pret vert a 4.5% sur 60 mois donne une mensualite de 9,480$. Avec 23,200$/mois d'economies, le cash-flow net est positif de +13,700$/mois des le premier jour."
                  speed={8}
                  className="text-sm text-gray-700"
                  onComplete={() => {}}
                />
              ) : (
                <p className="text-[9px] text-gray-400 italic">Frank — Cash-flow +13,700$/mois</p>
              )}
            </SBubble>
          )}

          {si === 4 && typed && (
            <div className="space-y-3 ml-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowBudgetChallenge(true)}
                  disabled={showBudgetChallenge}
                  className={cn(
                    "text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                    showBudgetChallenge
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  )}
                >
                  <Target className="h-3.5 w-3.5" /> Challenger le budget
                </button>
                <button
                  onClick={() => goNext("budget")}
                  className="text-[9px] bg-emerald-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-emerald-700 font-medium cursor-pointer"
                >
                  <ArrowRight className="h-3.5 w-3.5" /> Generer le plan
                </button>
              </div>

              {/* Budget challenge */}
              {showBudgetChallenge && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                  <div className="flex gap-3">
                    <BotAvatar code="CFOB" size="md" />
                    <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-emerald-400 flex-1">
                      <div className="text-xs text-emerald-600 mb-2 font-medium">Frank (CFO) — Defense du budget</div>
                      <TypewriterText
                        text={BUDGET_CHALLENGE}
                        speed={5}
                        className="text-sm text-gray-700 leading-relaxed"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap ml-11">
                    <button
                      onClick={() => handleExtract("budget")}
                      className={cn(
                        "text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        extractedNotes.includes("budget")
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <Pin className="h-3.5 w-3.5" /> {extractedNotes.includes("budget") ? "Extrait" : "Extraire l'argumentaire"}
                    </button>
                    <button
                      onClick={() => goNext("budget")}
                      className="text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 transition-all"
                    >
                      <ArrowRight className="h-3.5 w-3.5" /> Continuer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Thinking for sections 5-6-7 */}
      {si >= 5 && si <= 5 && (
        <>
          <SBubble code="CEOB" collapsed={false}>
            <div className="space-y-2">
              {[
                { icon: Calendar, text: "Planification des 4 phases..." },
                { icon: BarChart3, text: "Definition des KPIs de suivi..." },
                { icon: CheckCircle2, text: "Preparation de la page de validation..." },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-[9px] text-gray-600 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 400}ms`, animationFillMode: "both", animationDuration: "500ms" }}>
                  <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center shrink-0">
                    <step.icon className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span>{step.text}</span>
                  <div className="flex gap-0.5 ml-auto">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              ))}
            </div>
          </SBubble>
          <AutoAdvance onComplete={() => { fillSection(5); fillSection(6); fillSection(7); goNext("timeline"); }} delay={2500} />
        </>
      )}

      {/* Section 5-6-7: Timeline + KPIs + Validation */}
      {si >= 6 && (
        <>
          <SBubble code="CEOB" collapsed={si > 6}>
            {si === 6 ? (
              <TypewriterText
                text="Les 3 dernieres sections sont completes : le plan d'implantation en 4 phases sur 20 semaines sans arret de production, les 6 KPIs de suivi, et la page de validation avec les 3 signataires."
                speed={8}
                className="text-sm text-gray-700"
                onComplete={() => setTyped(true)}
              />
            ) : (
              <p className="text-[9px] text-gray-400 italic">Sections 5-6-7 — Plan 20 semaines + KPIs + Validation</p>
            )}
          </SBubble>

          {si === 6 && typed && (
            <div className="space-y-3 ml-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowRiskAnalysis(true)}
                  disabled={showRiskAnalysis}
                  className={cn(
                    "text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                    showRiskAnalysis
                      ? "bg-red-100 text-red-700 border border-red-300"
                      : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                  )}
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> Analyser les risques
                </button>
                <button
                  onClick={() => setShowKpiChallenge(true)}
                  disabled={showKpiChallenge}
                  className={cn(
                    "text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                    showKpiChallenge
                      ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                      : "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                  )}
                >
                  <Target className="h-3.5 w-3.5" /> Challenger les KPIs
                </button>
                <button
                  onClick={() => goNext("summary")}
                  className="text-[9px] bg-emerald-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-emerald-700 font-medium cursor-pointer"
                >
                  <BarChart3 className="h-3.5 w-3.5" /> Voir le resume
                </button>
              </div>

              {/* Risk analysis */}
              {showRiskAnalysis && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                  <div className="border border-red-200 rounded-xl overflow-hidden">
                    <div className="bg-red-50 px-4 py-2.5 flex items-center gap-2 border-b border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-xs font-bold text-red-800">Analyse des risques — 4 risques identifies</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {RISK_ANALYSIS.map((risk) => (
                        <div key={risk.id} className="border rounded-lg p-2.5 bg-gray-50">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">{risk.id}</span>
                            <span className="text-xs font-bold text-gray-800">{risk.label}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-[9px]">
                            <div><span className="text-gray-500">Prob:</span> <span className="font-medium text-gray-700">{risk.prob}</span></div>
                            <div><span className="text-gray-500">Impact:</span> <span className="font-medium text-gray-700">{risk.impact}</span></div>
                            <div className="col-span-3"><span className="text-gray-500">Mitigation:</span> <span className="text-gray-700">{risk.mitigation}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleExtract("risques")}
                      className={cn(
                        "text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        extractedNotes.includes("risques")
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <Pin className="h-3.5 w-3.5" /> {extractedNotes.includes("risques") ? "Risques notes" : "Noter les risques"}
                    </button>
                    <button
                      onClick={() => goNext("summary")}
                      className="text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 transition-all"
                    >
                      <BarChart3 className="h-3.5 w-3.5" /> Resume du cahier
                    </button>
                  </div>
                </div>
              )}

              {/* KPI challenge */}
              {showKpiChallenge && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                  <div className="flex gap-3">
                    <BotAvatar code="CEOB" size="md" />
                    <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-indigo-400 flex-1">
                      <div className="text-xs text-indigo-600 mb-2 font-medium">CarlOS — Defense des cibles KPI</div>
                      <TypewriterText
                        text={KPI_CHALLENGE}
                        speed={5}
                        className="text-sm text-gray-700 leading-relaxed"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap ml-11">
                    <button
                      onClick={() => handleExtract("kpis")}
                      className={cn(
                        "text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        extractedNotes.includes("kpis")
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <Pin className="h-3.5 w-3.5" /> {extractedNotes.includes("kpis") ? "Extrait" : "Extraire la justification"}
                    </button>
                    <button
                      onClick={() => goNext("summary")}
                      className="text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 transition-all"
                    >
                      <BarChart3 className="h-3.5 w-3.5" /> Resume du cahier
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Summary */}
      {si >= 9 && (
        <>
          <SBubble code="CEOB" collapsed={si > 9}>
            {si === 9 ? (
              <>
                <TypewriterText
                  text={SIM_ACTE3.ceremonyMessage}
                  speed={8}
                  className="text-sm text-gray-700"
                  onComplete={() => setTyped(true)}
                />
                {typed && <SBtn onClick={() => goNext("ceremony")} icon={Sparkles} label="Finaliser le cahier" />}
              </>
            ) : (
              <p className="text-[9px] text-gray-400 italic">Resume — 592K$ subventions, plan 4 phases, cahier complet</p>
            )}
          </SBubble>
        </>
      )}

      {/* Ceremony */}
      {si >= 10 && (
        <>
          <SBubble code="CEOB" collapsed={false}>
            <TypewriterText
              text={SIM_ACTE3.hqMessage}
              speed={8}
              className="text-sm text-gray-700"
              onComplete={() => setTyped(true)}
            />
            {typed && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={handleReset}
                  className="text-xs bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-gray-200 font-medium cursor-pointer border border-gray-200"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Recommencer
                </button>
              </div>
            )}
          </SBubble>
        </>
      )}
    </>
  );

  // ═══════════════════════════════════════
  // RIGHT PANEL — Document DocForge
  // ═══════════════════════════════════════
  const rightContent = (
    <div className="space-y-3">
      {/* Document header with progress */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-emerald-100 to-green-100 px-4 py-3 border-b border-emerald-200">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-700" />
            <div>
              <h3 className="text-sm font-bold text-emerald-900">Cahier de Projet SMART</h3>
              <p className="text-[9px] text-emerald-700/70">Les sections se remplissent au fil de la construction</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 bg-emerald-200/50 rounded-full h-1.5">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(filledCount / 7) * 100}%` }}
              />
            </div>
            <span className="text-[9px] font-bold text-emerald-800">{filledCount}/7</span>
          </div>
          {/* Section icons row */}
          <div className="mt-2 flex items-center gap-1">
            {SIM_ACTE3.sections.map((section) => {
              const SIcon = SECTION_ICONS[section.num] || FileText;
              const isFilled = sectionsFilled.includes(section.num);
              return (
                <div key={section.num} className="flex items-center gap-0.5">
                  <div className={cn(
                    "w-6 h-6 rounded flex items-center justify-center transition-all",
                    isFilled ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400",
                  )}>
                    {isFilled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <SIcon className="h-3.5 w-3.5" />}
                  </div>
                  {section.num < 7 && (
                    <div className={cn("w-2 h-0.5", isFilled ? "bg-emerald-400" : "bg-gray-200")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7 Sections */}
      {SIM_ACTE3.sections.map((section) => {
        const isFilled = sectionsFilled.includes(section.num);
        const SIcon = SECTION_ICONS[section.num] || FileText;
        return (
          <DocSectionCard
            key={section.num}
            title={`${section.num}. ${section.titre}`}
            icon={SIcon}
            filled={isFilled}
          >
            {isFilled && <SectionContent content={section.content} />}
          </DocSectionCard>
        );
      })}

      {/* Summary metrics */}
      {si >= 9 && (
        <div className="bg-white border-2 border-emerald-300 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-emerald-100 to-green-100 px-4 py-2.5 flex items-center gap-2 border-b border-emerald-200">
            <BarChart3 className="h-4 w-4 text-emerald-700" />
            <span className="text-sm font-bold text-emerald-900">Resume du projet</span>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-3 gap-2">
              {SIM_ACTE3.summaryMetrics.map((m, i) => (
                <div key={i} className="bg-gray-50 rounded-xl px-2.5 py-2 text-center">
                  <div className="text-[9px] text-gray-500 mb-0.5">{m.label}</div>
                  <div className={cn("text-sm font-bold", m.color)}>{m.value}</div>
                </div>
              ))}
            </div>

            {extractedNotes.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 mt-3">
                <p className="text-[9px] font-bold text-green-800 mb-1 flex items-center gap-1">
                  <Pin className="h-3.5 w-3.5" /> Notes de validation ({extractedNotes.length})
                </p>
                <div className="space-y-1">
                  {extractedNotes.includes("budget") && (
                    <p className="text-[9px] text-green-700">Budget: 508K$ net, cash-flow +13,700$/mois, HFC interdit 2028</p>
                  )}
                  {extractedNotes.includes("risques") && (
                    <p className="text-[9px] text-green-700">Risques: 4 identifies, tous avec mitigation, risque global = Faible</p>
                  )}
                  {extractedNotes.includes("kpis") && (
                    <p className="text-[9px] text-green-700">KPIs: bases sur 23 projets reels, cibles conservatrices confirmees</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ceremony card */}
      {stage === "ceremony" && (
        <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-400 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="text-sm font-bold text-white">Cahier de Projet — Complete</span>
            <CheckCircle2 className="h-4 w-4 text-white ml-auto" />
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-white/80 border border-emerald-200 rounded-lg p-3">
              <p className="text-xs text-emerald-800 leading-relaxed">{SIM_ACTE3.hqMessage}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-[9px] bg-white text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-gray-50 font-medium cursor-pointer">
                <Download className="h-3.5 w-3.5" /> Exporter le cahier
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold">Propulse par GhostX AI — Usine Bleue</span>
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════
  // LAYOUT
  // ═══════════════════════════════════════
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sim header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3">
        <button onClick={() => onBack?.()} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <FileText className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-bold text-gray-800">Cahier de Projet</span>
        <span className="text-xs text-gray-400">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {STAGE_ORDER.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-emerald-500" : i < si ? "w-2 bg-emerald-300" : "w-2 bg-gray-200"
            )} />
          ))}
        </div>
        <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-1" title="Recommencer">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Color line */}
      <div className="h-1 shrink-0 bg-emerald-500" />

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Discussion (40%) */}
        <div className="w-[40%] min-w-[280px] flex flex-col border-r border-gray-200 bg-white">
          {/* Chat header */}
          <div className="h-12 px-3 shrink-0 flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <span className="text-[11px] text-white font-medium truncate flex-1">{discussionContext}</span>
            <MessageSquare className="h-3.5 w-3.5 text-white/70" />
          </div>

          {/* Phase bar — emerald for cahier */}
          <div className="shrink-0 px-3 py-1.5 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {[
                { code: "CEOB" },
                { code: "CFOB" },
              ].map(b => (
                <div key={b.code} className="flex items-center gap-1 bg-white/70 rounded-full px-1.5 py-0.5">
                  <BotAvatar code={b.code} size="sm" />
                  <span className="text-[8px] font-medium text-gray-600">{BOT_COLORS[b.code]?.name}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              ))}
            </div>
            <span className="text-[9px] font-bold text-emerald-700 ml-auto">{STAGE_LABELS[stage]}</span>
            <span className="text-[9px] text-gray-400">{si + 1}/{STAGE_ORDER.length}</span>
          </div>

          <div ref={chatRef} className="flex-1 overflow-auto p-3 space-y-3">{chatContent}</div>

          {/* Message input */}
          <div className="shrink-0 border-t border-gray-200 px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-[9px] text-gray-400">Ecrivez un message...</div>
            <button className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100"><Mic className="h-3.5 w-3.5" /></button>
            <button className="p-1.5 text-blue-500 rounded-lg hover:bg-blue-50"><Send className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        {/* RIGHT — Content (60%) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TopBar — 6 sections */}
          <div className="h-12 px-2 shrink-0 flex items-center" style={{ backgroundColor: UB_BLUE }}>
            <div className="flex-1 flex items-center gap-0.5">
              {[
                { id: "home", icon: Home, label: "Accueil" },
                { id: "dept", icon: Building2, label: "Mon Departement" },
                { id: "salles", icon: Users, label: "Mes Salles" },
                { id: "equipe", icon: Brain, label: "Mon Equipe" },
                { id: "reseau", icon: Globe, label: "Mon Reseau" },
                { id: "admin", icon: Shield, label: "Admin" },
              ].map(nav => (
                <button key={nav.id} className={cn(
                  "h-8 gap-1 px-2 text-[9px] rounded-md flex items-center transition-all",
                  nav.id === "dept" ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/10"
                )}>
                  <nav.icon className="h-3.5 w-3.5" />
                  <span>{nav.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[9px] text-white/40">Simulation</span>
              <button onClick={handleReset} className="text-white/40 hover:text-white">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="shrink-0 bg-white border-b px-4 py-1.5 flex items-center gap-1 overflow-x-auto">
            {DEPT_SUBTABS.map((tab, i) => (
              <button key={tab} className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all",
                i === 3 ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              )}>
                {tab}
              </button>
            ))}
          </div>

          {/* Right panel header */}
          <div className="shrink-0 px-4 py-2 bg-white border-b flex items-center gap-2">
            <BotAvatar code="CEOB" size="sm" />
            <BotAvatar code="CFOB" size="sm" />
            <span className="text-[9px] text-gray-400 ml-auto">Bots actifs</span>
          </div>

          <div ref={rightRef} className="flex-1 overflow-y-auto px-4 py-3">
            {rightContent}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════

function SBubble({ code, children, collapsed }: { code: string; children: React.ReactNode; collapsed: boolean }) {
  const bot = BOT_COLORS[code];
  if (!bot) return null;
  if (collapsed) {
    return (
      <div className="flex gap-2 items-center opacity-60">
        <BotAvatar code={code} size="sm" />
        <div className="text-[9px] text-gray-400">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <BotAvatar code={code} size="md" />
      <div className={cn("bg-white border rounded-xl rounded-tl-none px-3 py-2.5 max-w-[88%] shadow-sm border-l-2", bot.border)}>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-[11px] font-semibold", bot.text)}>{bot.name}</span>
          <span className="text-[9px] text-gray-400">{bot.role}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function SBtn({ onClick, icon: Icon, label, color }: { onClick: () => void; icon: React.ElementType; label: string; color?: string }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button onClick={onClick}
        className={cn("text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow",
          color || "bg-emerald-600 hover:bg-emerald-700")}>
        <Icon className="h-3.5 w-3.5" /> {label}
      </button>
    </div>
  );
}

function AutoAdvance({ onComplete, delay }: { onComplete: () => void; delay: number }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, delay);
    return () => clearTimeout(timer);
  }, [onComplete, delay]);
  return null;
}

// ═══════════════════════════════════════
// DOCUMENT SECTION CARD
// ═══════════════════════════════════════

function DocSectionCard({
  title,
  icon: Icon,
  filled,
  children,
}: {
  title: string;
  icon: React.ElementType;
  filled: boolean;
  children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className={cn(
        "bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-500",
        filled ? "border-gray-200" : "border-dashed border-gray-300 opacity-60"
      )}
    >
      <button
        onClick={() => filled && setExpanded(!expanded)}
        className={cn(
          "w-full px-4 py-2 flex items-center gap-2 border-b",
          filled ? "bg-gray-50 border-gray-200 cursor-pointer hover:bg-gray-100" : "bg-gray-50/50 border-gray-200/50 cursor-default"
        )}
      >
        {filled ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Lock className="h-3.5 w-3.5 text-gray-300" />
        )}
        <Icon className={cn("h-3.5 w-3.5", filled ? "text-gray-600" : "text-gray-300")} />
        <span className={cn("text-xs font-medium", filled ? "text-gray-700" : "text-gray-400")}>{title}</span>
        {!filled && <span className="text-[9px] text-gray-400 ml-auto italic">En attente...</span>}
        {filled && (
          <ArrowRight className={cn("h-3.5 w-3.5 text-gray-400 ml-auto transition-transform", expanded && "rotate-90")} />
        )}
      </button>
      {filled && expanded && children && <div className="p-3">{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════
// SECTION CONTENT RENDERERS
// ═══════════════════════════════════════

function SectionContent({ content }: { content: typeof SIM_ACTE3.sections[0]["content"] }) {
  switch (content.type) {
    case "portrait": {
      const d = content.data;
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-bold text-blue-800">{d.nom}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {d.extras.map((ex: { label: string; value: string }, i: number) => (
              <div key={i} className="bg-gray-50 rounded px-2 py-1">
                <div className="text-[9px] text-gray-500">{ex.label}</div>
                <div className="text-xs font-medium text-gray-800">{ex.value}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "diagnostic": {
      const d = content.data;
      return (
        <div className="space-y-2">
          {d.items.map((item: { systeme: string; priorite: string; gaspillage: string; probleme: string }, i: number) => {
            const prioriteColor = item.priorite === "Critique" ? "bg-red-100 text-red-700" :
              item.priorite === "Haute" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600";
            return (
              <div key={i} className="border rounded-lg p-2 bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-800">{item.systeme}</span>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", prioriteColor)}>
                    {item.priorite}
                  </span>
                  <span className="text-[9px] text-red-600 font-bold ml-auto">{item.gaspillage}</span>
                </div>
                <p className="text-[9px] text-gray-600">{item.probleme}</p>
              </div>
            );
          })}
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
            <span className="text-xs font-bold text-red-800">{d.total}</span>
          </div>
        </div>
      );
    }

    case "solutions": {
      const d = content.data;
      return (
        <div className="space-y-2">
          {d.solutions.map((sol: { priorite: string; nom: string; details: string; cout: string; impact: string; delai: string }, i: number) => (
            <div key={i} className="border rounded-lg p-2.5 bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded font-bold",
                  sol.priorite === "P1" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700",
                )}>
                  {sol.priorite}
                </span>
                <span className="text-xs font-bold text-gray-800">{sol.nom}</span>
              </div>
              <p className="text-[9px] text-gray-600 mb-1">{sol.details}</p>
              <div className="flex items-center gap-3">
                <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">{sol.cout}</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">{sol.impact}</span>
                <span className="text-[9px] text-gray-500 ml-auto">{sol.delai}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "waterfall": {
      const d = content.data;
      const rows = [
        { label: "Investissement brut", value: `${(d.investBrut / 1000).toFixed(0)}K$`, color: "text-gray-800", bg: "" },
        ...d.subventions.map((s: { programme: string; montant: number }) => ({
          label: s.programme, value: `-${(s.montant / 1000).toFixed(0)}K$`, color: "text-emerald-600", bg: "bg-emerald-50",
        })),
        { label: "Investissement net", value: `${(d.investNet / 1000).toFixed(0)}K$`, color: "text-blue-700 font-bold", bg: "bg-blue-50" },
      ];
      return (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className={cn("flex items-center justify-between rounded-lg px-3 py-1.5", row.bg || "bg-gray-50")}>
              <span className="text-[9px] text-gray-700">{row.label}</span>
              <span className={cn("text-xs font-bold", row.color)}>{row.value}</span>
            </div>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
              <div className="text-[9px] text-emerald-600">Economies annuelles</div>
              <div className="text-sm font-bold text-emerald-700">{(d.economiesAnnuelles / 1000).toFixed(0)}K$/an</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
              <div className="text-[9px] text-amber-600">ROI</div>
              <div className="text-sm font-bold text-amber-700">{d.roi}</div>
            </div>
          </div>
        </div>
      );
    }

    case "timeline": {
      const d = content.data;
      return (
        <div className="space-y-2">
          {d.phases.map((phase: { phase: string; titre: string; duree: string; desc: string }, i: number) => (
            <div key={i} className="border rounded-lg p-2.5 bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-bold">{phase.phase}</span>
                <span className="text-xs font-bold text-gray-800">{phase.titre}</span>
                <span className="text-[9px] text-gray-500 ml-auto">{phase.duree}</span>
              </div>
              <p className="text-[9px] text-gray-600">{phase.desc}</p>
            </div>
          ))}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg px-3 py-2 text-center">
            <span className="text-xs font-bold text-cyan-800">Duree totale : {d.totalDuree}</span>
          </div>
        </div>
      );
    }

    case "kpis": {
      const d = content.data;
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-[9px]">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-2 py-1.5 text-gray-500 font-medium">KPI</th>
                <th className="text-center px-2 py-1.5 text-gray-500 font-medium">Baseline</th>
                <th className="text-center px-2 py-1.5 text-gray-500 font-medium">Cible</th>
                <th className="text-center px-2 py-1.5 text-gray-500 font-medium">Delta</th>
              </tr>
            </thead>
            <tbody>
              {d.kpis.map((kpi: { label: string; baseline: string; cible: string; reduction: string }, i: number) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-2 py-1.5 text-gray-700 font-medium">{kpi.label}</td>
                  <td className="text-center px-2 py-1.5 text-gray-500">{kpi.baseline}</td>
                  <td className="text-center px-2 py-1.5 text-emerald-600 font-bold">{kpi.cible}</td>
                  <td className="text-center px-2 py-1.5 text-green-600 font-bold">{kpi.reduction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "validation": {
      const d = content.data;
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "text-[9px] px-2 py-0.5 rounded-full font-bold",
              d.statut === "Pret pour signature" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600",
            )}>
              {d.statut}
            </span>
          </div>
          {d.signataires.map((sig: { role: string; nom: string; date: string }, i: number) => (
            <div key={i} className="border rounded-lg p-2.5 bg-gray-50 flex items-center gap-3">
              <ClipboardCheck className="h-4 w-4 text-green-600 shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-800">{sig.role}</div>
                <div className="text-[9px] text-gray-500">{sig.nom}</div>
              </div>
              <span className="text-[9px] text-gray-400">{sig.date}</span>
            </div>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}
