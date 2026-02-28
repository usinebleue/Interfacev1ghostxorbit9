/**
 * EvenementsPage.tsx — Calendrier des evenements Orbit9
 * Extrait de Orbit9DetailView monolithique
 */

import { Calendar, Star, Rocket } from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

export function EvenementsPage() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 border-t-[3px] border-t-rose-400"><div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Prochain</span><Calendar className="h-3.5 w-3.5 text-rose-400" /></div><div className="text-2xl font-bold text-rose-600">15 mars</div><div className="text-[10px] text-gray-500">Kickoff Pionniers</div></Card>
        <Card className="p-3 border-t-[3px] border-t-amber-400"><div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Frequence (Or)</span><Star className="h-3.5 w-3.5 text-amber-400" /></div><div className="text-2xl font-bold text-amber-600">4x/an</div><div className="text-[10px] text-gray-500">Trimestriel + diners prives</div></Card>
        <Card className="p-3 border-t-[3px] border-t-indigo-400"><div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Grande Offensive</span><Rocket className="h-3.5 w-3.5 text-indigo-400" /></div><div className="text-2xl font-bold text-indigo-600">Sprint D</div><div className="text-[10px] text-gray-500">Expansion regionale</div></Card>
        <Card className="p-3 border-t-[3px] border-t-emerald-400"><div className="flex items-center justify-between mb-1"><span className="text-[10px] text-gray-400 uppercase">Participants</span><Star className="h-3.5 w-3.5 text-emerald-400" /></div><div className="text-2xl font-bold text-emerald-600">9</div><div className="text-[10px] text-gray-500">Pionniers confirmes</div></Card>
      </div>

      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-rose-100 to-pink-100 px-4 py-2.5 border-b border-rose-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-rose-600" />
            <span className="text-sm font-bold text-rose-900">Calendrier des evenements</span>
          </div>
        </div>
        <div className="p-4">
        <div className="space-y-2">
          {[
            { date: "15 mars 2026", title: "Kickoff Pionniers Bleus", type: "Visio", desc: "Presentation des 9 pionniers. Onboarding collectif. CarlOS configure les bots de chaque membre.", status: "confirme" as const, participants: 9 },
            { date: "28 mars 2026", title: "Demo Live — Coordination Inter-Bots", type: "Presentiel", desc: "Cas reel du cercle: les bots collaborent en direct. Specs propagees, budget syncronise.", status: "planifie" as const, participants: 0 },
            { date: "Q2 2026", title: "Rassemblement Cercle #1", type: "Presentiel", desc: "Bilan trimestre, metriques d'impact, nouvelles opportunites detectees. 9 membres reunis.", status: "a_venir" as const, participants: 0 },
            { date: "Q3 2026", title: "Demo Investisseurs", type: "Evenement", desc: "Presentation aux investisseurs potentiels. Showcase de l'impact Orbit9.", status: "a_venir" as const, participants: 0 },
          ].map((evt, i) => (
            <div key={i} className="flex gap-4 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
              <div className="w-20 text-center shrink-0 py-1">
                <p className="text-xs font-bold text-rose-600">{evt.date}</p>
                <Badge variant="outline" className="text-[9px] mt-1">{evt.type}</Badge>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{evt.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{evt.desc}</p>
                {evt.participants > 0 && <p className="text-[10px] text-gray-400 mt-1">{evt.participants} participants confirmes</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={cn("text-[9px]",
                  evt.status === "confirme" ? "bg-green-100 text-green-700" :
                  evt.status === "planifie" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
                )} variant="outline">{evt.status === "confirme" ? "Confirme" : evt.status === "planifie" ? "Planifie" : "A venir"}</Badge>
                {evt.status === "confirme" && <Button size="sm" variant="outline" className="text-[10px] h-7">Rejoindre</Button>}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
