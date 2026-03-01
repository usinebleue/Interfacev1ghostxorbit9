/**
 * NouvellesPage.tsx — Fil d'actualite du reseau Orbit9
 * Enrichi: gradient headers, KPI tops, style news feed
 * Extrait de Orbit9DetailView monolithique
 */

import {
  Search, Users, CheckCircle2, DollarSign, Shield,
  BarChart3, UserPlus, ChevronRight, Newspaper, TrendingUp,
  Clock, Zap,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

export function NouvellesPage() {
  const news = [
    { time: "Il y a 2h", title: "3 partenaires potentiels detectes", desc: "Le Matching Engine a identifie des fournisseurs compatibles dans le secteur robotique. Score moyen: 89%.", type: "opportunite" as const, icon: Search, action: "Voir les matchs" },
    { time: "Il y a 5h", title: "Bot CFO: 47K$ en optimisations", desc: "Votre bot CFO a identifie 3 optimisations de couts ce mois: reneg. assurance (12K$), credit d'impot (25K$), consolidation achats (10K$).", type: "performance" as const, icon: DollarSign, action: "Voir le detail" },
    { time: "Hier", title: "Cercle atteint 5 membres → -15%", desc: "Nouveau palier de rabais debloque! Prochaine etape: 7 membres = -20%. Il reste 4 places.", type: "jalon" as const, icon: CheckCircle2, action: "Inviter" },
    { time: "2 jours", title: "Nouveau membre: AutomaTech", desc: "Integration robotique rejoint votre cercle. Specialite: cobots et cellules automatisees. Bots connectes.", type: "reseau" as const, icon: UserPlus, action: "Voir profil" },
    { time: "3 jours", title: "Mission completee: Audit securite", desc: "Bot Security + Cyber Expert QC ont finalise l'audit. Rapport de 28 pages genere. Score securite: 72/100.", type: "performance" as const, icon: Shield, action: "Lire le rapport" },
    { time: "1 sem", title: "Rapport mensuel — 124 taches completees", desc: "Performance de vos 6 bots C-Level: 124 taches, 3 projets avances, 47K$ en valeur generee.", type: "rapport" as const, icon: BarChart3, action: "Rapport complet" },
  ];

  const colors: Record<string, string> = { opportunite: "blue", performance: "amber", jalon: "green", reseau: "emerald", rapport: "violet" };
  const typeLabels: Record<string, string> = { opportunite: "Opportunite", performance: "Performance", jalon: "Jalon", reseau: "Reseau", rapport: "Rapport" };

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
            <Newspaper className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Nouvelles</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-blue-600">{news.length}</div>
            <div className="text-[10px] text-gray-500">Cette semaine</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-500">
            <TrendingUp className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Opportunites</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-green-600">3</div>
            <div className="text-[10px] text-gray-500">Matchs detectes</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
            <DollarSign className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Valeur generee</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-amber-600">47K$</div>
            <div className="text-[10px] text-gray-500">Ce mois</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <Zap className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Taches bots</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-emerald-600">124</div>
            <div className="text-[10px] text-gray-500">Completees ce mois</div>
          </div>
        </Card>
      </div>

      {/* Fil d'actualite */}
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Fil d'Actualite du Reseau</span>
            </div>
            <div className="flex gap-1">
              {["Toutes", "Opportunites", "Reseau", "Performance"].map((filter) => (
                <button key={filter} className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer",
                  filter === "Toutes" ? "bg-white/90 text-indigo-800 shadow-sm" : "text-white/70 hover:bg-white/20 hover:text-white"
                )}>
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4">
        <div className="space-y-3">
          {news.map((item, i) => {
            const NIcon = item.icon;
            const c = colors[item.type];
            return (
              <div key={i} className={cn("flex gap-3 p-3 rounded-xl border hover:shadow-sm transition-shadow", `border-l-[3px] border-l-${c}-400`)}>
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", `bg-${c}-100`)}>
                  <NIcon className={cn("h-5 w-5", `text-${c}-600`)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge className={cn("text-[9px]", `bg-${c}-100 text-${c}-700`)} variant="outline">{typeLabels[item.type]}</Badge>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{item.time}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <Button variant="outline" size="sm" className="text-[10px] shrink-0 h-8 gap-1 self-center">
                  {item.action} <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}
