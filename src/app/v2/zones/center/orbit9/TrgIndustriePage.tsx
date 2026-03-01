/**
 * TrgIndustriePage.tsx — Dashboard de l'Industrie manufacturiere
 * Inspire du template Dashboard de Carl
 * Extrait de Orbit9DetailView monolithique
 */

import { useState } from "react";
import {
  Clock, DollarSign, TrendingUp, Gauge, Globe,
  Building2, Factory, Wrench, GraduationCap, Network,
  MapPin, Briefcase, Vote, FileText, Download, Eye,
  Lightbulb, Bot,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

export function TrgIndustriePage() {
  const [activeTab, setActiveTab] = useState("vue");
  const tabs = [
    { id: "vue", label: "Vue d'ensemble" },
    { id: "couts", label: "Couts & ROI" },
    { id: "rh", label: "RH & Talents" },
    { id: "opportunites", label: "Opportunites" },
    { id: "etudes", label: "Etudes" },
  ];

  return (
    <div className="space-y-5">
      {/* Header Card avec gradient + KPIs */}
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 border-b">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Indicateurs Cles</span>
            <div className="flex gap-1 ml-auto">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer",
                  activeTab === tab.id ? "bg-white/90 text-indigo-800 shadow-sm" : "text-white/70 hover:bg-white/20 hover:text-white"
                )}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 p-4">
          {[
            { value: "68.5%", label: "TRG Global Moyen", trend: "+4.2%", icon: Gauge, color: "indigo" },
            { value: "2.8M$", label: "Invest. Automatisation", trend: "+12.5%", icon: DollarSign, color: "emerald" },
            { value: "42 min", label: "Temps d'Arret Moyen", trend: "-8.3%", icon: Clock, color: "amber" },
            { value: "18 mois", label: "ROI Moyen Projets", trend: "-3 mois", icon: TrendingUp, color: "green" },
          ].map((kpi) => {
            const KIcon = kpi.icon;
            return (
              <Card key={kpi.label} className="p-0 overflow-hidden">
                <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", `from-${kpi.color}-600 to-${kpi.color}-500`)}>
                  <KIcon className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">{kpi.label}</span>
                </div>
                <div className="px-3 py-2">
                  <div className={cn("text-2xl font-bold", `text-${kpi.color}-600`)}>{kpi.value}</div>
                  <div className="text-[10px] text-gray-500">
                    <span className="font-bold text-green-600">{kpi.trend}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {activeTab === "vue" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2.5 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-900">4 Instances — Ecosysteme Usine Bleue</span>
              </div>
            </div>
            <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Usine Bleue (Admin)", sub: "admin.usinebleue.ai", icon: Building2, color: "blue", desc: "Dashboard complet, bots, CRM, matching, Data Room, War Room", role: "Orchestrateur" },
                { name: "Manufacturier", sub: "app.usinebleue.ai", icon: Factory, color: "emerald", desc: "Chat CarlOS, diagnostics, Mon Usine (OEE/KPIs), cahier projet", role: "Client PME" },
                { name: "Fournisseur", sub: "partner.usinebleue.ai", icon: Wrench, color: "orange", desc: "Profil competences, opportunites matchees, soumissions, portfolio", role: "Partenaire" },
                { name: "Expert Solo", sub: "expert.usinebleue.ai", icon: GraduationCap, color: "purple", desc: "Mandats ponctuels, outils diagnostics, formation CREDO, revenus", role: "Expert" },
              ].map((inst) => {
                const IIcon = inst.icon;
                return (
                  <div key={inst.name} className={cn("p-3 rounded-lg border-l-4", `border-${inst.color}-400 bg-${inst.color}-50/50`)}>
                    <div className="flex items-center gap-2 mb-1">
                      <IIcon className={cn("h-4 w-4", `text-${inst.color}-600`)} />
                      <span className="text-xs font-bold text-gray-800">{inst.name}</span>
                      <Badge variant="outline" className="text-[9px]">{inst.role}</Badge>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono mb-1">{inst.sub}</p>
                    <p className="text-xs text-gray-500">{inst.desc}</p>
                  </div>
                );
              })}
            </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-teal-100 to-emerald-100 px-4 py-2.5 border-b border-teal-200">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-bold text-teal-900">Sources de Donnees — Sous-Bot CMO</span>
              </div>
            </div>
            <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { source: "Statistique Canada", type: "Federal", freq: "Annuel", icon: Building2 },
                { source: "STIQ (Quebec)", type: "Provincial", freq: "Trimestriel", icon: MapPin },
                { source: "MEI Quebec", type: "Provincial", freq: "Annuel", icon: Briefcase },
                { source: "Deloitte Manufacturing", type: "Global", freq: "Annuel", icon: Globe },
                { source: "Reseau Orbit9", type: "Proprietaire", freq: "Continu", icon: Network },
                { source: "Sondages Usine Bleue", type: "Proprietaire", freq: "Mensuel", icon: Vote },
              ].map((s) => {
                const SIcon = s.icon;
                return (
                  <div key={s.source} className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 flex items-start gap-2">
                    <SIcon className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-teal-800">{s.source}</p>
                      <p className="text-[10px] text-teal-600">{s.type} · {s.freq}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "couts" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2.5 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-bold text-amber-900">Couts Moyens par Type de Solution (k$)</span>
              </div>
            </div>
            <div className="p-4">
            <p className="text-xs text-gray-400 mb-3">Investissement total incluant materiel, integration, formation et maintenance annuelle</p>
            {[
              { type: "Robot Collaboratif (Cobot)", materiel: "25-75k$", integration: "35k$", formation: "8k$", maintenance: "6k$/an", total: "124k$" },
              { type: "Robot Industriel 6 axes", materiel: "80-250k$", integration: "120k$", formation: "15k$", maintenance: "18k$/an", total: "403k$" },
              { type: "Robot Mobile AMR", materiel: "40-120k$", integration: "45k$", formation: "10k$", maintenance: "8k$/an", total: "183k$" },
              { type: "Systeme Vision IA", materiel: "15-60k$", integration: "25k$", formation: "5k$", maintenance: "4k$/an", total: "89k$" },
            ].map((row) => (
              <div key={row.type} className="p-3 rounded-lg border border-gray-200 mb-2 last:mb-0">
                <p className="text-sm font-bold text-gray-800 mb-2">{row.type}</p>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: "Materiel", value: row.materiel },
                    { label: "Integration", value: row.integration },
                    { label: "Formation", value: row.formation },
                    { label: "Maintenance/an", value: row.maintenance },
                    { label: "TOTAL (1re annee)", value: row.total, highlight: true },
                  ].map((col) => (
                    <div key={col.label} className={cn("p-2 rounded", col.highlight ? "bg-blue-50 border border-blue-200" : "bg-gray-50")}>
                      <p className="text-[10px] text-gray-500">{col.label}</p>
                      <p className={cn("text-sm font-bold", col.highlight ? "text-blue-700" : "text-gray-800")}>{col.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {activeTab === "rh" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2.5 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-900">Salaires Moyens — Secteur Manufacturier Quebec</span>
              </div>
            </div>
            <div className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: "Ingenieur mecanique", salaire: "78-95K$", demande: "Forte" },
                { role: "Ingenieur automatisation", salaire: "85-110K$", demande: "Tres forte" },
                { role: "Technicien robotique", salaire: "55-72K$", demande: "Forte" },
                { role: "Directeur de production", salaire: "90-125K$", demande: "Moyenne" },
                { role: "Specialiste IA/ML", salaire: "95-140K$", demande: "Extreme" },
                { role: "Soudeur certifie", salaire: "52-68K$", demande: "Forte" },
              ].map((r) => (
                <div key={r.role} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{r.role}</p>
                    <p className="text-sm font-bold text-green-600">{r.salaire}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[9px]",
                    r.demande === "Extreme" ? "text-red-600 bg-red-50" :
                    r.demande === "Tres forte" ? "text-orange-600 bg-orange-50" :
                    r.demande === "Forte" ? "text-amber-600 bg-amber-50" :
                    "text-gray-600"
                  )}>Demande: {r.demande}</Badge>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      )}

      {activeTab === "opportunites" && (
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-indigo-100 to-violet-100 px-4 py-2.5 border-b border-indigo-200">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-bold text-indigo-900">Opportunites sectorielles detectees</span>
            </div>
          </div>
          <div className="p-4">
          <p className="text-xs text-gray-400 mb-3">Basees sur l'analyse croisee des sources de donnees et des tendances du reseau Orbit9.</p>
          {[
            { sector: "Automatisation", opportunity: "Penurie de main-d'oeuvre → ROI cobot en 14 mois", impact: "Eleve", trend: "↑" },
            { sector: "IA Industrielle", opportunity: "23% d'adoption → 77% du marche non-penetre", impact: "Tres eleve", trend: "↑↑" },
            { sector: "Logistique 4.0", opportunity: "42 min d'arrets evitables par jour en moyenne", impact: "Eleve", trend: "↑" },
            { sector: "Energetique", opportunity: "Credits carbone + reduction 15% couts energetiques", impact: "Moyen", trend: "→" },
          ].map((o, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:shadow-sm mb-2 last:mb-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <Lightbulb className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{o.sector}</p>
                <p className="text-xs text-gray-500">{o.opportunity}</p>
              </div>
              <Badge variant="outline" className="text-[9px]">{o.impact}</Badge>
              <span className="text-sm">{o.trend}</span>
            </div>
          ))}
        </div>
        </div>
      )}

      {activeTab === "etudes" && (
        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
            <div className="flex items-start gap-3">
              <Globe className="h-6 w-6 text-teal-600 mt-1 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-teal-800">Rapport Annuel de l'Industrie — Lead Magnet</h3>
                <p className="text-xs text-teal-700 mt-1">Usine Bleue publie LE rapport de reference du manufacturier au Quebec. Position centrale credible = donnees uniques du reseau Orbit9 + sources gouvernementales + sondages proprietaires.</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-[9px] text-teal-700 border-teal-300">50+ entreprises = donnees significatives</Badge>
                  <Badge variant="outline" className="text-[9px] text-teal-700 border-teal-300">Sprint D+</Badge>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2.5 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-900">Etudes disponibles</span>
              </div>
            </div>
            <div className="p-4">
            {[
              { title: "Portrait manufacturier Quebec 2025", source: "STIQ + MEI", pages: 45, type: "Rapport" },
              { title: "Tendances automatisation Canada", source: "Deloitte", pages: 32, type: "Etude" },
              { title: "Benchmark OEE secteur metal", source: "Reseau Orbit9", pages: 12, type: "Benchmark" },
            ].map((doc, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:shadow-sm mb-2 last:mb-0">
                <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{doc.title}</p>
                  <p className="text-[10px] text-gray-400">{doc.source} · {doc.pages} pages</p>
                </div>
                <Badge variant="outline" className="text-[9px]">{doc.type}</Badge>
                <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1"><Download className="h-3 w-3" /> PDF</Button>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
