/**
 * NouvellesPage.tsx — Fil d'actualite du reseau Orbit9
 * Extrait de Orbit9DetailView monolithique
 */

import {
  Search, Users, CheckCircle2, DollarSign, Shield,
  BarChart3, UserPlus, ChevronRight,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

export function NouvellesPage() {
  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">Fil d'Actualite du Reseau</h3>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-[10px] cursor-pointer">Toutes</Badge>
            <Badge variant="outline" className="text-[10px] cursor-pointer">Opportunites</Badge>
            <Badge variant="outline" className="text-[10px] cursor-pointer">Reseau</Badge>
            <Badge variant="outline" className="text-[10px] cursor-pointer">Performance</Badge>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { time: "Il y a 2h", title: "3 partenaires potentiels detectes", desc: "Le Matching Engine a identifie des fournisseurs compatibles dans le secteur robotique. Score moyen: 89%.", type: "opportunite" as const, icon: Search, action: "Voir les matchs" },
            { time: "Il y a 5h", title: "Bot CFO: 47K$ en optimisations", desc: "Votre bot CFO a identifie 3 optimisations de couts ce mois: reneg. assurance (12K$), credit d'impot (25K$), consolidation achats (10K$).", type: "performance" as const, icon: DollarSign, action: "Voir le detail" },
            { time: "Hier", title: "Cercle atteint 5 membres → -15%", desc: "Nouveau palier de rabais debloque! Prochaine etape: 7 membres = -20%. Il reste 4 places.", type: "jalon" as const, icon: CheckCircle2, action: "Inviter" },
            { time: "2 jours", title: "Nouveau membre: AutomaTech", desc: "Integration robotique rejoint votre cercle. Specialite: cobots et cellules automatisees. Bots connectes.", type: "reseau" as const, icon: UserPlus, action: "Voir profil" },
            { time: "3 jours", title: "Mission completee: Audit securite", desc: "Bot Security + Cyber Expert QC ont finalise l'audit. Rapport de 28 pages genere. Score securite: 72/100.", type: "performance" as const, icon: Shield, action: "Lire le rapport" },
            { time: "1 sem", title: "Rapport mensuel — 124 taches completees", desc: "Performance de vos 6 bots C-Level: 124 taches, 3 projets avances, 47K$ en valeur generee.", type: "rapport" as const, icon: BarChart3, action: "Rapport complet" },
          ].map((news, i) => {
            const NIcon = news.icon;
            const colors: Record<string, string> = { opportunite: "blue", performance: "amber", jalon: "green", reseau: "emerald", rapport: "gray" };
            const c = colors[news.type];
            return (
              <div key={i} className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", `bg-${c}-100`)}>
                  <NIcon className={cn("h-4 w-4", `text-${c}-600`)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-800">{news.title}</p>
                    <span className="text-[10px] text-gray-400">{news.time}</span>
                  </div>
                  <p className="text-xs text-gray-500">{news.desc}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] shrink-0 h-8 gap-1">
                  {news.action} <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
