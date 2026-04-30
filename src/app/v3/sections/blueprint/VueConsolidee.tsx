/** VueConsolidee.tsx — Vue consolidee des 11 departements (CEOB uniquement). Extracted from BlueprintDepartement.tsx */

import { useState, useEffect } from "react";
import {
  Loader2, Heart, Users, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { DomainBadge } from "../../data/source-badge";
import { api } from "../../../v2/api/client";
import {
  getBlueprintConfig,
  getVisibleSubSections,
  getFieldsForTier,
  calculateCompletionScore,
  type SizeTier,
} from "../../../v2/zones/center/blueprint/blueprint-config";

import {
  type KeyFieldValue, type DeptScore,
  VUE_CONSOLIDEE_OTHER_BOTS as OTHER_BOTS,
  DEPT_KEY_FIELDS,
  VUE_CONSOLIDEE_MOCK_SCORES,
} from "../../data/mock/blueprint.mock";

export function VueConsolidee({ tier }: { tier: SizeTier }) {
  const [scores, setScores] = useState<DeptScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const results: DeptScore[] = [];
      for (const bot of OTHER_BOTS) {
        const cfg = getBlueprintConfig(bot.code);
        if (!cfg) continue;
        let score = 0;
        let gaps = 0;
        const gapLabels: string[] = [];
        const keyFields: KeyFieldValue[] = [];
        try {
          const res = await api.getOrCreateCanvas(`blueprint_${bot.code}`);
          const d = (res.data && typeof res.data === "object") ? res.data as Record<string, unknown> : {};
          score = calculateCompletionScore(cfg, tier, d);
          for (const s of getVisibleSubSections(cfg, tier)) {
            const p = s.pertinence[tier];
            if (p === "C" || p === "R") {
              const fields = getFieldsForTier(s.fields, tier);
              const filled = fields.filter(f => { const v = d[`${s.id}.${f.id}`]; return v !== undefined && v !== "" && v !== "[]"; }).length;
              if (filled === 0 && fields.length > 0) { gaps++; gapLabels.push(s.label); }
            }
          }
          // Extraire les champs-clés pour le résumé
          const deptFields = DEPT_KEY_FIELDS[bot.code] || [];
          for (const kf of deptFields) {
            const raw = d[`${kf.sectionId}.${kf.fieldId}`];
            const value = raw !== undefined && raw !== null && raw !== "" ? String(raw) : "";
            keyFields.push({ label: kf.label, value });
          }
        } catch { /* empty */ }
        results.push({ code: bot.code, score, sections: getVisibleSubSections(cfg, tier).length, gaps, gapLabels, keyFields });
      }
      setScores(results);
      setLoading(false);
    })();
  }, [tier]);

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  // Si tous les scores sont à 0 (aucun blueprint rempli = demo/simulation), injecter des données mock
  const allEmpty = scores.every(d => d.score === 0);
  const effectiveScores = allEmpty
    ? scores.map(d => ({ ...d, ...(VUE_CONSOLIDEE_MOCK_SCORES[d.code] || {}) }))
    : scores;

  const avg = effectiveScores.length > 0 ? Math.round(effectiveScores.reduce((s, d) => s + d.score, 0) / effectiveScores.length) : 0;
  const totalGaps = effectiveScores.reduce((s, d) => s + d.gaps, 0);
  const filledKeyFields = effectiveScores.reduce((s, d) => s + d.keyFields.filter(kf => kf.value).length, 0);
  const totalKeyFields = effectiveScores.reduce((s, d) => s + d.keyFields.length, 0);
  const sorted = [...effectiveScores].sort((a, b) => b.gaps - a.gaps || a.score - b.score);

  return (
    <div className="space-y-3">
      {/* ── VITAAFAST — VITAA (5 piliers) + FAAS (4 piliers) côte à côte ── */}
      <div className="flex items-center gap-2 mb-1">
        <DomainBadge domain="blueprint-sections" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* VITAA — 5 piliers d'affaires */}
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
            <Heart className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900 flex-1">VITAA — Piliers d'affaires</span>
          </div>
          <div className="p-2.5 space-y-1.5">
            {[
              { letter: "V", label: "Vente", score: 38, color: "bg-blue-500" },
              { letter: "I", label: "Idee", score: 42, color: "bg-purple-500" },
              { letter: "T", label: "Temps", score: 61, color: "bg-emerald-500" },
              { letter: "A", label: "Argent", score: 55, color: "bg-amber-500" },
              { letter: "A", label: "Actif", score: 29, color: "bg-red-500" },
            ].map((p) => (
              <div key={p.letter + p.label}>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0", p.color)}>{p.letter}</div>
                  <span className="text-[9px] font-medium text-gray-800 flex-1">{p.label}</span>
                  <span className={cn("text-xs font-bold", p.score >= 50 ? "text-green-600" : p.score >= 35 ? "text-amber-600" : "text-red-600")}>{p.score}</span>
                  <span className={cn("text-[9px] px-1 py-0.5 rounded border font-medium",
                    p.score < 35 ? "text-red-600 bg-red-50 border-red-200" :
                    p.score < 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
                    "text-green-600 bg-green-50 border-green-200"
                  )}>{p.score < 35 ? "critique" : p.score < 50 ? "risque" : "sain"}</span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden ml-7">
                  <div className={cn("h-full rounded-full absolute", p.color)} style={{ width: `${p.score}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-1.5 border-t border-gray-100 mt-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-gray-500 uppercase">Score VITAA</span>
                <span className="text-sm font-bold text-gray-800">45/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAAS — 4 piliers relationnels */}
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
            <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900 flex-1">FAAS — Capital social</span>
          </div>
          <div className="p-2.5 space-y-1.5">
            {[
              { letter: "F", label: "Fraternite", score: 52, color: "bg-rose-500", desc: "Cohesion equipe, retention, culture" },
              { letter: "A", label: "Alliance", score: 35, color: "bg-pink-500", desc: "Partenaires B2B, co-creation, REAI" },
              { letter: "A", label: "Associes", score: 28, color: "bg-fuchsia-500", desc: "CA, mentors, conseillers, pairs" },
              { letter: "S", label: "Social", score: 44, color: "bg-violet-500", desc: "Reputation, thought leadership" },
            ].map((p) => (
              <div key={p.letter + p.label}>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0", p.color)}>{p.letter}</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-medium text-gray-800">{p.label}</span>
                    <p className="text-[9px] text-gray-400 leading-tight truncate">{p.desc}</p>
                  </div>
                  <span className={cn("text-xs font-bold", p.score >= 50 ? "text-green-600" : p.score >= 35 ? "text-amber-600" : "text-red-600")}>{p.score}</span>
                  <span className={cn("text-[9px] px-1 py-0.5 rounded border font-medium",
                    p.score < 35 ? "text-red-600 bg-red-50 border-red-200" :
                    p.score < 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
                    "text-green-600 bg-green-50 border-green-200"
                  )}>{p.score < 35 ? "critique" : p.score < 50 ? "risque" : "sain"}</span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden ml-7">
                  <div className={cn("h-full rounded-full absolute", p.color)} style={{ width: `${p.score}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-1.5 border-t border-gray-100 mt-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-gray-500 uppercase">Score FAAS</span>
                <span className="text-sm font-bold text-gray-800">40/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sorted.map(dept => {
          const info = OTHER_BOTS.find(b => b.code === dept.code)!;
          const isExpanded = expandedDept === dept.code;
          const filledFields = dept.keyFields.filter(kf => kf.value);

          return (
            <div
              key={dept.code}
              className={cn(
                "rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer",
                isExpanded && "border-blue-200 shadow-md"
              )}
              onClick={() => setExpandedDept(isExpanded ? null : dept.code)}
            >
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <span className="text-sm font-bold text-gray-900 flex-1">{info.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{info.bot}</span>
                <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{dept.score}%</span>
              </div>
              <div className="px-3 py-2 space-y-1.5">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", dept.score >= 70 ? "bg-emerald-500" : dept.score >= 40 ? "bg-amber-400" : "bg-red-500")} style={{ width: `${dept.score}%` }} />
                </div>
                {dept.gaps > 0 ? (
                  <div className="text-[9px] text-red-500 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{dept.gaps} gap{dept.gaps > 1 ? "s" : ""}: {dept.gapLabels.slice(0, 2).join(", ")}</span>
                  </div>
                ) : (
                  <div className="text-[9px] text-emerald-500 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aucun gap critique
                  </div>
                )}

                {/* Résumé données clés — toujours visible si renseignées */}
                {filledFields.length > 0 && (
                  <div className="border-t border-gray-100 pt-1.5 space-y-0.5">
                    {(isExpanded ? dept.keyFields : filledFields.slice(0, 2)).map((kf, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-400">{kf.label}</span>
                        {kf.value ? (
                          <span className="text-[9px] font-medium text-gray-700 max-w-[60%] text-right truncate">{kf.value}</span>
                        ) : (
                          <span className="text-[9px] text-gray-300 italic">—</span>
                        )}
                      </div>
                    ))}
                    {!isExpanded && filledFields.length > 2 && (
                      <span className="text-[9px] text-blue-400 font-medium">+{filledFields.length - 2} données...</span>
                    )}
                  </div>
                )}

                {/* Expanded: champs vides aussi */}
                {isExpanded && filledFields.length === 0 && dept.keyFields.length > 0 && (
                  <div className="border-t border-gray-100 pt-1.5 space-y-0.5">
                    {dept.keyFields.map((kf, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-400">{kf.label}</span>
                        <span className="text-[9px] text-gray-300 italic">Non renseigné</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
