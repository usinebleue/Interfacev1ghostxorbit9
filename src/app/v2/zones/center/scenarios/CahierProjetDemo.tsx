"use client";

/**
 * CahierProjetDemo.tsx — Acte 3 : Construction du Cahier de Projet SMART
 * 7 sections du cahier, finalisation, resume metrics, download PDF
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  CheckCircle2,
  Download,
  Share2,
  Sparkles,
  Factory,
  Award,
  RotateCcw,
  Eye,
  Scale,
  ArrowRight,
  Target,
  MessageSquare,
  ShieldQuestion,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import {
  ThinkingAnimation,
  BotAvatar,
  TypewriterText,
  CahierProgressBar,
  CahierSectionCard,
  FinalizationAnimation,
  BOT_COLORS,
  SIM_ACTE3,
} from "../shared/cahier-components";

// ========== MARKDOWN EXPORT HELPER ==========

function generateMarkdown(): string {
  const sections = SIM_ACTE3.sections;
  const metrics = SIM_ACTE3.summaryMetrics;

  let md = `# Cahier de Projet SMART\n`;
  md += `## Aliments Boreal inc.\n`;
  md += `**Genere par CarlOS (GhostX) — ${new Date().toLocaleDateString("fr-CA")}**\n\n`;
  md += `---\n\n`;

  for (const sec of sections) {
    md += `### Section ${sec.num} — ${sec.titre}\n\n`;
    const d = sec.content.data as any;

    switch (sec.content.type) {
      case "portrait":
        md += `- **Entreprise** : ${d.nom}\n`;
        md += `- **Secteur** : ${d.secteur}\n`;
        md += `- **Employes** : ${d.employes}\n`;
        md += `- **Lignes de production** : ${d.lignes}\n`;
        md += `- **Chiffre d'affaires** : ${d.ca}\n`;
        md += `- **Tarif electricite** : ${d.tarif}\n`;
        md += `- **Localisation** : ${d.localisation}\n`;
        if (d.extras) {
          md += `\n**Details supplementaires :**\n`;
          for (const e of d.extras) {
            md += `- ${e.label} : ${e.value}\n`;
          }
        }
        break;
      case "diagnostic":
        md += `| Systeme | Probleme | Gaspillage | Priorite |\n`;
        md += `|---------|----------|------------|----------|\n`;
        for (const item of d.items) {
          md += `| ${item.systeme} | ${item.probleme} | ${item.gaspillage} | ${item.priorite} |\n`;
        }
        md += `\n**Total gaspillage recuperable : ${d.total}**\n`;
        break;
      case "solutions":
        for (const sol of d.solutions) {
          md += `#### ${sol.nom} (${sol.priorite})\n`;
          md += `- Impact : ${sol.impact}\n`;
          md += `- Cout : ${sol.cout}\n`;
          md += `- Delai : ${sol.delai}\n`;
          if (sol.details) md += `- ${sol.details}\n`;
          if (sol.fournisseur) md += `- Fournisseur : ${sol.fournisseur}\n`;
          md += `\n`;
        }
        break;
      case "waterfall":
        md += `- **Investissement brut** : ${d.investBrut.toLocaleString("fr-CA")}$\n`;
        for (const sub of d.subventions) {
          md += `- ${sub.programme} : -${sub.montant.toLocaleString("fr-CA")}$ (${sub.desc})\n`;
        }
        md += `- **Investissement net** : ${d.investNet.toLocaleString("fr-CA")}$\n`;
        md += `- **Financement** : ${d.financement.source} — ${d.financement.montant} a ${d.financement.taux} sur ${d.financement.duree}\n`;
        md += `- **Economies annuelles** : ${d.economiesAnnuelles.toLocaleString("fr-CA")}$/an\n`;
        md += `- **ROI** : ${d.roi}\n`;
        break;
      case "timeline":
        for (const p of d.phases) {
          md += `#### ${p.phase} — ${p.titre} (${p.duree})\n`;
          md += `${p.desc}\n\n`;
        }
        md += `**Duree totale : ${d.totalDuree}**\n`;
        break;
      case "kpis":
        md += `| KPI | Actuel | Cible | Reduction | Suivi |\n`;
        md += `|-----|--------|-------|-----------|-------|\n`;
        for (const kpi of d.kpis) {
          md += `| ${kpi.label} | ${kpi.baseline} | ${kpi.cible} | ${kpi.reduction} | ${kpi.frequence} |\n`;
        }
        break;
      case "validation":
        md += `**Statut** : ${d.statut}\n\n`;
        for (const s of d.signataires) {
          md += `- ${s.role} — ${s.nom} (${s.date})\n`;
        }
        break;
    }
    md += `\n---\n\n`;
  }

  md += `## Resume\n\n`;
  for (const m of metrics) {
    md += `- **${m.label}** : ${m.value}\n`;
  }
  md += `\n---\n*Document genere automatiquement par CarlOS (GhostX)*\n`;

  return md;
}

function downloadMarkdown() {
  const md = generateMarkdown();
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Cahier-Projet-SMART-${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ========== MAIN COMPONENT ==========

export function CahierProjetDemo({ onTransition }: { onTransition?: (target: string) => void }) {
  const [stage, setStage] = useState(0);
  const [showBudgetChallenge, setShowBudgetChallenge] = useState(false);
  const [showAltKPIs, setShowAltKPIs] = useState(false);
  const [showPessimiste, setShowPessimiste] = useState(false);
  const [showRiskAnalysis, setShowRiskAnalysis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on stage change
  useEffect(() => {
    if (scrollRef.current) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [stage, showBudgetChallenge, showAltKPIs, showPessimiste, showRiskAnalysis]);

  // Auto-advance sections during building (stages 2 through 5)
  useEffect(() => {
    if (stage === 1.5) {
      const t = setTimeout(() => setStage(2), 500);
      return () => clearTimeout(t);
    }
    if (stage === 2) {
      const t = setTimeout(() => setStage(2.5), 3500);
      return () => clearTimeout(t);
    }
    if (stage === 2.5) {
      const t = setTimeout(() => setStage(3), 3500);
      return () => clearTimeout(t);
    }
    if (stage === 3) {
      const t = setTimeout(() => setStage(3.5), 3500);
      return () => clearTimeout(t);
    }
    if (stage === 3.5) {
      const t = setTimeout(() => setStage(4), 3500);
      return () => clearTimeout(t);
    }
    if (stage === 4) {
      const t = setTimeout(() => setStage(4.5), 3500);
      return () => clearTimeout(t);
    }
    if (stage === 4.5) {
      const t = setTimeout(() => setStage(5), 3500);
      return () => clearTimeout(t);
    }
    if (stage === 5.5) {
      // FinalizationAnimation handles its own timing via onComplete
    }
    if (stage === 6.5) {
      const t = setTimeout(() => setStage(7), 800);
      return () => clearTimeout(t);
    }
    if (stage === 7.5) {
      const t = setTimeout(() => setStage(8), 800);
      return () => clearTimeout(t);
    }
    if (stage === 8.5) {
      const t = setTimeout(() => setStage(9), 800);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const totalSections = SIM_ACTE3.sections.length;

  // Compute how many sections are built based on stage
  const computeSectionsBuilt = (): number => {
    if (stage < 2) return 0;
    if (stage >= 2 && stage < 2.5) return 1;
    if (stage >= 2.5 && stage < 3) return 2;
    if (stage >= 3 && stage < 3.5) return 3;
    if (stage >= 3.5 && stage < 4) return 4;
    if (stage >= 4 && stage < 4.5) return 5;
    if (stage >= 4.5 && stage < 5) return 6;
    return 7;
  };

  const sectionsBuilt = computeSectionsBuilt();
  const cahierProgress = Math.round((sectionsBuilt / totalSections) * 100);

  // Alternate KPI values for the "Ajuster les KPIs" toggle
  const altKPIs = [
    { label: "Consommation (kWh)", baseline: "850,000", cible: "490,000", reduction: "-42%", frequence: "Mensuel" },
    { label: "Couts energetiques", baseline: "245,000$/an", cible: "55,000$/an", reduction: "-78%", frequence: "Mensuel" },
    { label: "Throughput fin de ligne", baseline: "85%", cible: "100%", reduction: "+15pts", frequence: "Hebdomadaire" },
    { label: "Incidents SST", baseline: "12/an", cible: "0", reduction: "-100%", frequence: "Mensuel" },
    { label: "Uptime production", baseline: "94%", cible: "99%", reduction: "+5pts", frequence: "Hebdomadaire" },
    { label: "ROI cumule", baseline: "0$", cible: "508,000$", reduction: "20 mois", frequence: "Mensuel" },
  ];

  return (
    <div
      ref={scrollRef}
      className="flex flex-col gap-4 p-4 max-h-[calc(100vh-120px)] overflow-y-auto"
    >
      {/* ===== STAGE 0: Hero card ===== */}
      {stage >= 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-2xl px-6 py-8 shadow-xl text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="h-10 w-10 text-white/80" />
              <h2 className="text-2xl font-bold text-white">Cahier de Projet SMART</h2>
            </div>
            <p className="text-blue-100 text-sm max-w-md mx-auto mb-2">
              Aliments Boreal inc. — Projet integre : Energie + Palettisation + IoT
            </p>
            <p className="text-blue-200 text-xs max-w-sm mx-auto mb-6">
              7 sections generees automatiquement a partir du diagnostic AI et du jumelage SMART
            </p>
            {stage === 0 && (
              <button
                onClick={() => setStage(1)}
                className="bg-white text-indigo-700 font-bold text-sm px-6 py-3 rounded-full shadow-lg hover:bg-blue-50 transition-all cursor-pointer flex items-center gap-2 mx-auto"
              >
                <Sparkles className="h-4 w-4" />
                Construire le Cahier
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== STAGE 1: CEO message + ThinkingAnimation ===== */}
      {stage >= 1 && stage < 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex gap-3">
            <BotAvatar code="BCO" size="md" />
            <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-blue-400 max-w-lg">
              <div className="text-xs text-blue-700 mb-1.5">CarlOS (CEO)</div>
              <TypewriterText
                text="Je compile toutes les donnees du diagnostic et du jumelage pour construire ton Cahier de Projet. Chaque section est generee et validee par mes specialistes."
                speed={8}
                className="text-sm text-gray-700 leading-relaxed"
                onComplete={() => {
                  setTimeout(() => setStage(1.5), 600);
                }}
              />
            </div>
          </div>
          {stage >= 1 && stage < 1.5 && (
            <div className="mt-3">
              <ThinkingAnimation
                steps={SIM_ACTE3.buildingThinking}
                botName="CarlOS"
                botCode="BCO"
                onComplete={() => setStage(1.5)}
              />
            </div>
          )}
        </div>
      )}

      {/* ===== PROGRESS BAR (visible during building) ===== */}
      {stage >= 2 && stage <= 5.5 && (
        <div className="animate-in fade-in duration-300">
          <CahierProgressBar
            current={sectionsBuilt}
            total={totalSections}
            label={`Construction du cahier — ${sectionsBuilt}/${totalSections} sections`}
          />
        </div>
      )}

      {/* ===== STAGES 2-5: Build all 7 sections ===== */}
      {stage >= 2 && (
        <CahierSectionCard
          section={SIM_ACTE3.sections[0]}
          animate={true}
          isComplete={stage > 2}
          totalSections={totalSections}
        />
      )}
      {stage >= 2.5 && (
        <CahierSectionCard
          section={SIM_ACTE3.sections[1]}
          animate={true}
          isComplete={stage > 2.5}
          totalSections={totalSections}
        />
      )}
      {stage >= 3 && (
        <CahierSectionCard
          section={SIM_ACTE3.sections[2]}
          animate={true}
          isComplete={stage > 3}
          totalSections={totalSections}
        />
      )}
      {stage >= 3.5 && (
        <CahierSectionCard
          section={SIM_ACTE3.sections[3]}
          animate={true}
          isComplete={stage > 3.5}
          totalSections={totalSections}
        />
      )}
      {stage >= 4 && (
        <CahierSectionCard
          section={SIM_ACTE3.sections[4]}
          animate={true}
          isComplete={stage > 4}
          totalSections={totalSections}
        />
      )}
      {stage >= 4.5 && (
        <CahierSectionCard
          section={SIM_ACTE3.sections[5]}
          animate={true}
          isComplete={stage > 4.5}
          totalSections={totalSections}
        />
      )}
      {stage >= 5 && (
        <CahierSectionCard
          section={SIM_ACTE3.sections[6]}
          animate={true}
          isComplete={stage > 5}
          totalSections={totalSections}
        />
      )}

      {/* ===== STAGE 5 → 5.5: Auto-advance after last section ===== */}
      {stage === 5 && (
        <div className="space-y-2 mt-2 animate-in fade-in duration-500">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setStage(5.5)}
              className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Finaliser le document
            </button>
            <button
              onClick={() => setShowRiskAnalysis(true)}
              disabled={showRiskAnalysis}
              className={cn(
                "text-sm px-5 py-2.5 rounded-full shadow transition-all cursor-pointer flex items-center gap-2 font-semibold",
                showRiskAnalysis
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : "bg-white text-red-700 border border-red-200 hover:bg-red-50"
              )}
            >
              <ShieldQuestion className="h-4 w-4" />
              Analyser les risques
            </button>
          </div>
          {/* Risk analysis card */}
          {showRiskAnalysis && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex gap-3">
                <BotAvatar code="BCO" size="md" />
                <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-red-400 flex-1">
                  <div className="text-xs text-red-600 mb-2 font-medium">CarlOS (CEO) — Analyse des risques</div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="text-red-500 font-bold shrink-0">R1</span>
                      <span><strong>Subventions refusees/reduites</strong> — Probabilite: 15%. Impact: ROI passe de 22 a 42 mois. Mitigation: deposer 4 programmes en parallele pour diversifier.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold shrink-0">R2</span>
                      <span><strong>Delai livraison CO2 transcritique</strong> — Probabilite: 30%. Impact: +4-8 semaines sur Phase 2. Mitigation: commander des la confirmation, clause penalite fournisseur.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold shrink-0">R3</span>
                      <span><strong>Resistance au changement equipe</strong> — Probabilite: 25%. Impact: adoption cobot ralentie. Mitigation: formation progressive, champion interne, zero licenciement communique.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-500 font-bold shrink-0">R4</span>
                      <span><strong>Depassement budgetaire</strong> — Probabilite: 20%. Impact: +10-15% sur investissement brut. Mitigation: buffer 15% deja integre, paiements par jalons.</span>
                    </div>
                  </div>
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-800 font-medium">
                    Score de risque global : MODERE — Tous les risques sont mitigeables. Aucun risque fatal identifie.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== STAGE 5.5: Finalization animation ===== */}
      {stage === 5.5 && (
        <FinalizationAnimation onComplete={() => setStage(6)} />
      )}

      {/* ===== STAGE 6: Summary hero card with 3 big metrics ===== */}
      {stage >= 6 && (
        <div className="animate-in fade-in zoom-in-95 duration-700">
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl overflow-hidden shadow-xl">
            <div className="h-2.5 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400" />
            <div className="px-6 py-6">
              <div className="flex items-center justify-center gap-3 mb-5">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-xs text-green-600 font-semibold uppercase tracking-wide">
                    Cahier de Projet SMART
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Document complet — 7/7 sections
                  </h3>
                </div>
              </div>

              {/* 3 big metrics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {SIM_ACTE3.summaryMetrics.map((metric, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-green-200 p-4 text-center shadow-sm"
                  >
                    <div className={cn("text-2xl font-bold", metric.color)}>
                      {metric.value}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* Completed sections list */}
              <div className="space-y-1.5 mb-5">
                {SIM_ACTE3.sections.map((sec, i) => {
                  const Icon = sec.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm bg-white/70 rounded-lg px-3 py-2 border border-green-100"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <div className={cn("w-6 h-6 rounded flex items-center justify-center text-white bg-gradient-to-br shrink-0", sec.color)}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        Section {sec.num} — {sec.titre}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Action buttons: Challenger le budget + Ajuster les KPIs */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowBudgetChallenge((v) => !v);
                    setShowAltKPIs(false);
                  }}
                  className={cn(
                    "text-xs font-semibold px-4 py-2 rounded-full border transition-all cursor-pointer flex items-center gap-1.5",
                    showBudgetChallenge
                      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                      : "bg-white text-gray-600 border-gray-300 hover:border-emerald-300 hover:text-emerald-700"
                  )}
                >
                  <Scale className="h-3.5 w-3.5" />
                  Challenger le budget
                </button>
                <button
                  onClick={() => {
                    setShowAltKPIs((v) => !v);
                    setShowBudgetChallenge(false);
                  }}
                  className={cn(
                    "text-xs font-semibold px-4 py-2 rounded-full border transition-all cursor-pointer flex items-center gap-1.5",
                    showAltKPIs
                      ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                      : "bg-white text-gray-600 border-gray-300 hover:border-indigo-300 hover:text-indigo-700"
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ajuster les KPIs
                </button>
                {stage === 6 && (
                  <button
                    onClick={() => setStage(6.5)}
                    className="ml-auto text-xs font-bold bg-green-600 text-white px-5 py-2 rounded-full shadow hover:bg-green-700 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Continuer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Budget challenge card */}
          {showBudgetChallenge && (
            <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
              <div className="flex gap-3">
                <BotAvatar code="BCO" size="md" />
                <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-blue-400 max-w-lg">
                  <div className="text-xs text-blue-700 mb-1.5">CarlOS (CEO) — Defence budgetaire</div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Le modele financier est solide. Avec 592K$ de subventions sur un investissement brut de 1.1M$,
                    le net tombe a 508K$. Les economies annuelles de 278K$/an rendent le projet cash-flow positif
                    des le mois 1 : +13,700$/mois net. Le ROI de 22 mois est conservateur — si les economies
                    energetiques depassent les projections (ce qui arrive dans 70% des cas selon nos donnees),
                    on parle de 18-19 mois. Le risque financier est minimal : meme sans les subventions STIQ
                    (82K$), le ROI reste sous 26 mois.
                  </p>
                </div>
              </div>
              {/* Post-budget-challenge actions */}
              <div className="flex items-center gap-2 flex-wrap ml-11">
                <button
                  onClick={() => setShowPessimiste(true)}
                  disabled={showPessimiste}
                  className={cn(
                    "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                    showPessimiste
                      ? "bg-red-100 text-red-700 border border-red-300"
                      : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                  )}
                >
                  <ShieldQuestion className="h-3 w-3" /> Scenario pessimiste
                </button>
                <button
                  onClick={() => { setShowBudgetChallenge(false); if (stage === 6) setStage(6.5); }}
                  className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                >
                  <CheckCircle2 className="h-3 w-3" /> Accepter le budget
                </button>
                <button
                  onClick={() => onTransition?.("debat")}
                  className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-all"
                >
                  <MessageSquare className="h-3 w-3" /> Debat CFO vs CEO
                </button>
              </div>
              {/* Pessimist scenario */}
              {showPessimiste && (
                <div className="ml-11 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex gap-3">
                    <BotAvatar code="BCF" size="md" />
                    <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-emerald-400 flex-1">
                      <div className="text-xs text-emerald-600 mb-2 font-medium">Francois (CFO) — Scenario pessimiste</div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Pire cas realiste : les subventions HQ sont reduites de 30% (413K$ au lieu de 592K$), le delai d'approbation
                        est de 14 semaines au lieu de 12, et les economies energetiques atteignent seulement 75% des projections.
                        Dans ce scenario : investissement net = 687K$, economies annuelles = 208K$/an, ROI = 39 mois.
                        Le projet reste rentable mais le cashflow mensuel tombe a +7,800$/mois. Recommandation : prevoir une ligne
                        de credit de 150K$ en tampon.
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 text-center">
                          <div className="font-bold text-red-700">687K$</div>
                          <div className="text-gray-500">Invest. net</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 text-center">
                          <div className="font-bold text-red-700">39 mois</div>
                          <div className="text-gray-500">ROI pessimiste</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1.5 text-center">
                          <div className="font-bold text-green-700">Rentable</div>
                          <div className="text-gray-500">Verdict</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Alt KPIs view */}
          {showAltKPIs && (
            <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white border-2 border-indigo-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-indigo-50 px-4 py-2.5 flex items-center gap-2 border-b border-indigo-200">
                  <Eye className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-bold text-indigo-800">KPIs ajustes (scenario optimiste)</span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {altKPIs.map((kpi, i) => (
                      <div key={i} className="border rounded-lg p-3">
                        <div className="text-xs font-bold text-gray-700 mb-2">{kpi.label}</div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Actuel</span>
                            <span className="text-red-600 font-medium">{kpi.baseline}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Cible</span>
                            <span className="text-green-600 font-bold">{kpi.cible}</span>
                          </div>
                          <div className="bg-green-50 rounded px-2 py-1 text-center">
                            <span className="text-green-700 font-bold">{kpi.reduction}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 text-center">Suivi : {kpi.frequence}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-indigo-600 italic text-center">
                    Scenario optimiste base sur les donnees historiques de projets similaires (top 30%)
                  </div>
                </div>
              </div>
              {/* Post-KPI actions */}
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <button
                  onClick={() => { setShowAltKPIs(false); if (stage === 6) setStage(6.5); }}
                  className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-indigo-500 text-white hover:bg-indigo-600 transition-all"
                >
                  <CheckCircle2 className="h-3 w-3" /> Appliquer ces KPIs
                </button>
                <button
                  onClick={() => setShowAltKPIs(false)}
                  className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-all"
                >
                  <RotateCcw className="h-3 w-3" /> Garder les KPIs standards
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== STAGE 7: Download / Export buttons ===== */}
      {stage >= 7 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-white border-2 border-blue-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">Exporter le Cahier de Projet</div>
                <div className="text-xs text-gray-500">
                  Document complet — 7 sections, 34 pages
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // Simulate PDF download
                  const link = document.createElement("a");
                  link.href = "#";
                  link.download = "Cahier-Projet-SMART-Aliments-Boreal.pdf";
                  link.click();
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Telecharger le Cahier PDF
              </button>

              <button
                onClick={downloadMarkdown}
                className="flex-1 bg-white text-gray-700 text-sm font-bold px-5 py-3 rounded-xl border-2 border-gray-300 hover:border-indigo-400 hover:text-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Exporter en Markdown
              </button>

              <button
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({
                      title: "Cahier de Projet SMART — Aliments Boreal inc.",
                      text: "Cahier genere par CarlOS (GhostX) — 7 sections, 592K$ subventions, ROI 22 mois",
                    }).catch(() => {});
                  }
                }}
                className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-all cursor-pointer shrink-0"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {stage === 7 && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setStage(7.5)}
                  className="text-xs font-bold bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Continuer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== STAGE 8: Ceremony — Integrator message + CarlOS final ===== */}
      {stage >= 8 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
          {/* Integrator message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shrink-0 shadow-sm">
              <Award className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-amber-400 max-w-lg">
              <div className="text-xs text-amber-700 mb-1.5 font-semibold">
                Martin Pellerin, ing. — Energia Solutions
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Le cahier est conforme a notre estimation terrain. On peut demarrer les dossiers HQ et
                STIQ des la semaine prochaine. Mon equipe est disponible — on vise une date de lancement
                Phase 2 dans 4 semaines. Les delais Hydro-Quebec sont de 8-12 semaines pour
                l'approbation, mais on peut commencer les travaux preparatoires en parallele.
              </p>
            </div>
          </div>

          {/* CarlOS ceremony message */}
          <div className="flex gap-3">
            <BotAvatar code="BCO" size="md" />
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-blue-400 max-w-lg">
              <div className="text-xs text-blue-700 mb-1.5 font-semibold">CarlOS (CEO)</div>
              <TypewriterText
                text={SIM_ACTE3.ceremonyMessage}
                speed={6}
                className="text-sm text-gray-700 leading-relaxed"
                onComplete={() => {
                  setTimeout(() => setStage(8.5), 600);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== STAGE 9: Vision Usine Bleue + Restart + Transitions ===== */}
      {stage >= 9 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
          {/* HQ vision card */}
          <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-2xl px-6 py-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Factory className="h-8 w-8 text-white/80" />
              <div>
                <div className="text-xs text-white/70 font-semibold uppercase tracking-wide">
                  Vision Usine Bleue AI
                </div>
                <h3 className="text-lg font-bold text-white">
                  Le futur du developpement economique
                </h3>
              </div>
            </div>
            <p className="text-sm text-white/90 leading-relaxed mb-4">
              {SIM_ACTE3.hqMessage}
            </p>
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Propulse par GhostX — 14 agents AI, 36 teintures cognitives</span>
            </div>
          </div>

          {/* Transition buttons */}
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold uppercase mb-3">
              Prochaines etapes
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onTransition?.("decision")}
                className="flex-1 min-w-[160px] bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-4 py-3 rounded-xl shadow hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Scale className="h-4 w-4" />
                Go/No-Go final
              </button>
              <button
                onClick={() => onTransition?.("analyse")}
                className="flex-1 min-w-[160px] bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-bold px-4 py-3 rounded-xl shadow hover:from-cyan-600 hover:to-teal-600 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Analyser les risques
              </button>
              <button
                onClick={() => {
                  setStage(0);
                  setShowBudgetChallenge(false);
                  setShowAltKPIs(false);
                }}
                className="flex-1 min-w-[160px] bg-white text-gray-700 text-sm font-bold px-4 py-3 rounded-xl border-2 border-gray-300 hover:border-indigo-400 hover:text-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Relancer la simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
