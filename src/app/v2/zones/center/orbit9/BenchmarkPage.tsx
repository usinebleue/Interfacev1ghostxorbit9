/**
 * BenchmarkPage.tsx — Benchmark VITAA + Triangle du Feu
 * Extrait de Orbit9DetailView monolithique
 */

import {
  Eye, Target, BarChart3, Users, TrendingUp, Flame,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

export function BenchmarkPage() {
  const pillars = [
    { letter: "V", name: "Vente", score: 72, avg: 65, color: "bg-blue-500", status: "sain" },
    { letter: "I", name: "Idee", score: 45, avg: 55, color: "bg-purple-500", status: "risque" },
    { letter: "T", name: "Temps", score: 88, avg: 70, color: "bg-emerald-500", status: "sain" },
    { letter: "A", name: "Argent", score: 31, avg: 50, color: "bg-amber-500", status: "critique" },
    { letter: "A", name: "Actif", score: 62, avg: 60, color: "bg-red-500", status: "sain" },
  ];

  const critiques = pillars.filter(p => p.status === "critique" || p.status === "risque").length;

  return (
    <div className="space-y-5">
      {/* VITAA Comparison */}
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-violet-100 to-indigo-100 px-4 py-2.5 border-b border-violet-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-bold text-violet-900">Benchmark VITAA — Toi vs Secteur</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-violet-300 text-violet-700">Derniere mise a jour: aujourd'hui</Badge>
          </div>
        </div>
        <div className="p-4">
        <div className="space-y-3">
          {pillars.map((p) => (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={cn("w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold", p.color)}>{p.letter}</div>
                  <span className="text-sm font-medium text-gray-700">{p.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className={cn("font-bold", p.score >= p.avg ? "text-green-600" : "text-red-600")}>Toi: {p.score}</span>
                  <span className="text-gray-400">Secteur: {p.avg}</span>
                  <Badge variant="outline" className={cn("text-[9px]",
                    p.status === "sain" ? "text-green-600 bg-green-50" :
                    p.status === "risque" ? "text-amber-600 bg-amber-50" :
                    "text-red-600 bg-red-50"
                  )}>{p.status}</Badge>
                </div>
              </div>
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gray-200 absolute" style={{ width: `${p.avg}%` }} />
                <div className={cn("h-full rounded-full absolute", p.color)} style={{ width: `${p.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Triangle du Feu */}
      <Card className={cn("p-4", critiques >= 3 ? "bg-red-50 border-red-300" : critiques >= 2 ? "bg-amber-50 border-amber-300" : "bg-green-50 border-green-300")}>
        <div className="flex items-center gap-3">
          <Flame className={cn("h-8 w-8", critiques >= 3 ? "text-red-600" : critiques >= 2 ? "text-amber-600" : "text-green-600")} />
          <div>
            <p className="text-sm font-bold">{critiques >= 3 ? "Triangle du Feu: BRULE" : critiques >= 2 ? "Triangle du Feu: COUVE" : critiques === 1 ? "Triangle du Feu: MEURT" : "Triangle du Feu: SAIN"}</p>
            <p className="text-xs text-gray-600">{critiques} pilier{critiques > 1 ? "s" : ""} en zone critique/risque. {critiques >= 2 ? "Intervention ciblee recommandee." : "Situation sous controle."}</p>
          </div>
          <Button size="sm" variant="outline" className="ml-auto text-xs gap-1"><Target className="h-3 w-3" /> Plan d'action</Button>
        </div>
      </Card>

      {/* 3 types de benchmark */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500">
            <BarChart3 className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Benchmark Externe</span>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-500">Compare avec les competiteurs et la mediane sectorielle de ton industrie.</p>
            <Button size="sm" variant="outline" className="text-[10px] mt-3 gap-1"><Eye className="h-3 w-3" /> Voir le rapport</Button>
          </div>
        </div>
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <Users className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Benchmark Pairs</span>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-500">Compare avec les 8 autres membres de ton Cercle Orbit9 (anonymise).</p>
            <Button size="sm" variant="outline" className="text-[10px] mt-3 gap-1"><Eye className="h-3 w-3" /> Voir le rapport</Button>
          </div>
        </div>
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500">
            <TrendingUp className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Benchmark Historique</span>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-500">Ta propre trajectoire sur les 6 derniers mois. Mesure ta progression.</p>
            <Button size="sm" variant="outline" className="text-[10px] mt-3 gap-1"><Eye className="h-3 w-3" /> Voir le rapport</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
