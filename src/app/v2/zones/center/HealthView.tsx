/**
 * HealthView.tsx — Sante Globale de l'entreprise
 * Bilan de sante + scores departementaux + alertes
 * Sprint A — Frame Master V2
 */

import { Card } from "../../../components/ui/card";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { cn } from "../../../components/ui/utils";
import { Heart, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

/* ============ SCORE GAUGE ============ */
function ScoreGauge({ score, label }: { score: number; label: string }) {
  const scoreColor = score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-500" : "text-red-500";
  const barColor = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";
  const TrendIcon = score >= 80 ? TrendingUp : score >= 60 ? Minus : TrendingDown;
  const trendColor = score >= 80 ? "text-green-500" : score >= 60 ? "text-gray-400" : "text-red-500";
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm text-gray-700 w-28">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", barColor)} style={{ width: `${score}%` }} />
      </div>
      <span className={cn("text-sm font-bold w-10 text-right", scoreColor)}>{score}%</span>
      <TrendIcon className={cn("h-3.5 w-3.5", trendColor)} />
    </div>
  );
}

/* ============ DATA ============ */
const DEPTS = [
  { label: "Direction", score: 92 },
  { label: "Finance", score: 88 },
  { label: "Technologie", score: 85 },
  { label: "Strategie", score: 82 },
  { label: "Marketing", score: 78 },
  { label: "Operations", score: 71 },
  { label: "RH", score: 65 },
  { label: "Securite", score: 58 },
  { label: "Production", score: 74 },
  { label: "Vente", score: 80 },
  { label: "Legal", score: 69 },
  { label: "Innovation", score: 76 },
];

const ALERTES = [
  { text: "Securite en zone rouge — 58% sous le seuil de 65%", level: "critical" as const },
  { text: "RH en zone jaune — turnover Q1 au-dessus de la cible", level: "warning" as const },
  { text: "Legal — 2 dossiers de conformite en retard", level: "warning" as const },
];

/* ============ HEALTH VIEW ============ */
export function HealthView() {
  const scoreGlobal = 72;
  const deptsSorted = [...DEPTS].sort((a, b) => b.score - a.score);

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-4 max-w-4xl mx-auto">

        {/* Bilan de Sante — header orange */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-5 flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">Bilan de Sante Globale</h2>
              <p className="text-sm text-white/70">Evaluation du 26 fevrier 2026</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-bold text-green-600">{scoreGlobal}</span>
              <span className="text-lg text-white/60">/100</span>
            </div>
          </div>

          {/* Score global bar */}
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Score global</span>
              <span className="text-sm font-bold text-gray-700">{scoreGlobal}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-green-500 rounded-full" style={{ width: `${scoreGlobal}%` }} />
            </div>
          </div>

          {/* Scores par departement */}
          <div className="px-5 pb-4 pt-2 divide-y divide-gray-50">
            {deptsSorted.map((d) => (
              <ScoreGauge key={d.label} score={d.score} label={d.label} />
            ))}
          </div>
        </Card>

        {/* Alertes Sante */}
        <Card className="p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Alertes Sante</h3>
          </div>
          <ul className="space-y-2">
            {ALERTES.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={cn(
                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                  a.level === "critical" ? "bg-red-500" : "bg-amber-400"
                )} />
                <span className="text-gray-700">{a.text}</span>
              </li>
            ))}
          </ul>
        </Card>

      </div>
    </ScrollArea>
  );
}
