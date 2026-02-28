/**
 * PionniersPage.tsx — Cercle des Pionniers Bleus
 * Enrichi: modele de croissance 9→81 + cross-link Cellules
 * Extrait de Orbit9DetailView monolithique
 */

import {
  Users, Rocket, DollarSign, Target, Check, Clock, Plus,
  Award, GraduationCap, ArrowRight, Handshake,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

interface PionniersPageProps {
  onNavigate?: (section: string) => void;
}

export function PionniersPage({ onNavigate }: PionniersPageProps) {
  const sectors = [
    { name: "Automatisation", status: "pris" as const, company: "AutomaTech", contact: "Martin L." },
    { name: "Usinage / Metal", status: "pris" as const, company: "Usinage Precision QC", contact: "Jean-P. R." },
    { name: "Plastique", status: "prospect" as const, company: "PlastiForm (en discussion)", contact: "—" },
    { name: "Logistique", status: "pris" as const, company: "LogiFlow", contact: "Sophie D." },
    { name: "Soudage", status: "pris" as const, company: "MetalPro Inc.", contact: "Pierre T." },
    { name: "Alimentaire", status: "disponible" as const, company: "", contact: "" },
    { name: "Pharmaceutique", status: "disponible" as const, company: "", contact: "" },
    { name: "Emballage", status: "prospect" as const, company: "En discussion", contact: "—" },
    { name: "Electronique", status: "disponible" as const, company: "", contact: "" },
  ];

  const pris = sectors.filter(s => s.status === "pris").length;
  const prospects = sectors.filter(s => s.status === "prospect").length;

  return (
    <div className="space-y-5">
      {/* Header Card avec gradient */}
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Cercle des Pionniers</span>
            </div>
            <span className="text-xs font-bold text-white/90">{pris}/9 places</span>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-gray-600">9 places. 9 leaders. 5 secteurs. Les portes ferment.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Confirmes</div><div className="text-2xl font-bold text-indigo-600">{pris}</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">En discussion</div><div className="text-2xl font-bold text-amber-600">{prospects}</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Prix pionnier</div><div className="text-2xl font-bold text-green-600">1,350$</div><div className="text-[10px] text-gray-500">/mois vs 2,500$ vague 2</div></Card>
        <Card className="p-3"><div className="text-[10px] text-gray-400 uppercase">Economie/an</div><div className="text-2xl font-bold text-green-600">13,800$</div><div className="text-[10px] text-gray-500">Garanti a vie</div></Card>
      </div>

      {/* ── MODELE DE CROISSANCE 9 → 81 ── */}
      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <h3 className="text-sm font-bold text-indigo-800 mb-3">Modele de Croissance — 9 Pionniers x9 = 81 Membres</h3>
        <div className="flex items-center justify-between gap-3">
          {[
            { value: "9", label: "Pionniers", desc: "1 leader / secteur", color: "indigo", icon: Rocket },
            { value: "x9", label: "Cellule chacun", desc: "Chaque pionnier recrute", color: "blue", icon: Users },
            { value: "81", label: "Membres actifs", desc: "Reseau auto-suffisant", color: "emerald", icon: Target },
          ].map((step, i) => {
            const SIcon = step.icon;
            return (
              <div key={i} className="flex items-center gap-3 flex-1">
                <div className={cn("p-3 rounded-xl border text-center flex-1", `bg-${step.color}-100 border-${step.color}-200`)}>
                  <SIcon className={cn("h-5 w-5 mx-auto mb-1", `text-${step.color}-600`)} />
                  <p className={cn("text-2xl font-bold", `text-${step.color}-700`)}>{step.value}</p>
                  <p className="text-xs font-semibold text-gray-700">{step.label}</p>
                  <p className="text-[10px] text-gray-500">{step.desc}</p>
                </div>
                {i < 2 && <ArrowRight className="h-5 w-5 text-gray-300 shrink-0" />}
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-indigo-600 mt-3 italic">Chaque pionnier anime sa propre Cellule Orbit9. Effet reseau: les bots de toutes les cellules communiquent entre eux.</p>
      </Card>

      {/* Grille des 9 places */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">9 Places — 1 Leader par Secteur Strategique</h3>
        <div className="grid grid-cols-3 gap-2">
          {sectors.map((s, i) => (
            <div key={i} className={cn(
              "p-3 rounded-lg border transition-all",
              s.status === "pris" ? "bg-indigo-50 border-indigo-200" :
              s.status === "prospect" ? "bg-amber-50 border-amber-200 border-dashed" :
              "bg-gray-50 border-gray-200 border-dashed hover:border-indigo-300 cursor-pointer"
            )}>
              <div className="flex items-center justify-between mb-1">
                <span className={cn("text-xs font-bold", s.status === "pris" ? "text-indigo-700" : s.status === "prospect" ? "text-amber-700" : "text-gray-500")}>{s.name}</span>
                {s.status === "pris" ? <Check className="h-3.5 w-3.5 text-indigo-600" /> :
                 s.status === "prospect" ? <Clock className="h-3.5 w-3.5 text-amber-600" /> :
                 <Plus className="h-3.5 w-3.5 text-gray-400" />}
              </div>
              <p className="text-[10px] text-gray-500">{s.company || "Disponible — cliquez pour ajouter"}</p>
              {s.contact && s.contact !== "—" && <p className="text-[10px] text-gray-400 mt-0.5">Contact: {s.contact}</p>}
              {/* Cross-link vers Cellule pour pionniers confirmes */}
              {s.status === "pris" && onNavigate && (
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate("cellules"); }}
                  className="text-[10px] text-indigo-600 underline mt-1 cursor-pointer hover:text-indigo-800"
                >
                  Voir sa Cellule →
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Package Pioneer */}
      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <h3 className="text-sm font-bold text-indigo-800 mb-3">Package Pionnier — Conditions a Vie</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users, label: "C-Suite complet (6 bots)", detail: "1,350$/mois vs 2,500$ vague 2 = -46% garanti a vie" },
            { icon: Award, label: "Ambassadeur Or automatique", detail: "Statut premium des le jour 1 (normalement 3 cercles + 25 membres requis)" },
            { icon: GraduationCap, label: "Onboarding VIP gratuit", detail: "Carl s'assoit avec toi. Setup complet. Valeur 500$." },
            { icon: DollarSign, label: "Commission 5% sur ton cercle", detail: "Tu recrutes tes partenaires dans ton Orbit9 → tu gagnes sur leur abonnement" },
            { icon: Rocket, label: "6 mois d'avance", detail: "Pendant que la vague 2 attend, tes bots apprennent ton business. Avantage competitif." },
            { icon: Target, label: "Voix au roadmap produit", detail: "Tu influences directement ce qu'on developpe. Acces direct a l'equipe." },
          ].map((perk, i) => {
            const PIcon = perk.icon;
            return (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-indigo-100/50">
                <PIcon className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-indigo-800">{perk.label}</p>
                  <p className="text-[10px] text-indigo-600">{perk.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Script de rencontre */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-1">Script de Rencontre — 45 min, 5 actes</h3>
        <p className="text-[10px] text-gray-400 mb-3">En personne (JAMAIS Zoom). Cafe ou bureau du prospect. iPad avec CarlOS pret a rouler. Pas de PowerPoint.</p>
        <div className="space-y-2">
          {[
            { act: "1", title: "L'Accroche", dur: "5 min", desc: "Tu portes 8 chapeaux. Pas de CFO, CTO, CMO. Tu geres les urgences lundi au vendredi. Je me trompe?", color: "blue" },
            { act: "2", title: "Demo Live iPad", dur: "15 min", desc: "CarlOS analyse en temps reel. Les mots s'ecrivent devant le prospect. Le WOW moment. Active 3 bots.", color: "indigo" },
            { act: "3", title: "Exclusivite Sectorielle", dur: "10 min", desc: "Tableau 9 places physique. 'Ta place [Secteur] = toi ou [concurrent]. Je le rencontre vendredi.'", color: "purple" },
            { act: "4", title: "Conditions Pionnier", dur: "5 min", desc: "1 consultant = 5-10K$/mois. Toi = 6 cerveaux C-Level 24/7 pour 1,350$. = 61$/jour ouvrable.", color: "violet" },
            { act: "5", title: "Le Close", dur: "10 min", desc: "4 closes: Direct / Competitif / Deadline 48h / Affordability. Lien Stripe pret par texto.", color: "fuchsia" },
          ].map((act) => (
            <div key={act.act} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0", `bg-${act.color}-600`)}>{act.act}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800">{act.title}</span>
                  <Badge variant="outline" className="text-[9px]">{act.dur}</Badge>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">{act.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Calendrier sprint */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Calendrier Sprint 30 Jours</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { week: "Sem 1", title: "Les 3 premiers", desc: "Lun-Mer-Ven: 3 rencontres. Dimanche: Post LinkedIn '3/9 prises'", status: "done" },
            { week: "Sem 2", title: "Momentum", desc: "3 suivants. Post: '6 places prises. Il en reste 3.'", status: "active" },
            { week: "Sem 3", title: "Urgence max", desc: "3 derniers. Pression maximale. Post: 'Cercle COMPLET.'", status: "pending" },
            { week: "Sem 4", title: "Fermeture", desc: "Relance indecis 48h. Kick-off collectif visio 9 pionniers.", status: "pending" },
          ].map((w) => (
            <div key={w.week} className={cn("p-3 rounded-lg border", w.status === "done" ? "bg-green-50 border-green-200" : w.status === "active" ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200")}>
              <Badge variant="outline" className={cn("text-[9px] mb-1", w.status === "done" ? "text-green-600" : w.status === "active" ? "text-blue-600" : "")}>{w.week}</Badge>
              <p className="text-xs font-bold text-gray-800">{w.title}</p>
              <p className="text-[10px] text-gray-500 mt-1">{w.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Cross-link Cellules */}
      {onNavigate && (
        <Card className="p-3 bg-emerald-50 border-emerald-200 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => onNavigate("cellules")}>
          <div className="flex items-center gap-2">
            <Handshake className="h-4 w-4 text-emerald-600" />
            <p className="text-xs text-emerald-700">Chaque pionnier anime sa propre <strong>Cellule Orbit9</strong>. <span className="underline">Voir les Cellules actives →</span></p>
          </div>
        </Card>
      )}
    </div>
  );
}
