/**
 * TrgIndustriePage.tsx — Dashboard de l'Industrie manufacturiere
 * DONNEES REELLES 2024-2026
 * Sources: STIQ Barometre 16e ed, ISQ, MEIE, REAI, IFR, BDC, FCEI, IQ
 * Derniere mise a jour: Mars 2026
 */

import { useState } from "react";
import {
  Clock, DollarSign, TrendingUp, Gauge, Globe,
  Building2, Factory, Wrench, GraduationCap, Network,
  MapPin, Briefcase, Vote, FileText, Download, Eye,
  Lightbulb, Bot, AlertTriangle, BarChart3, Cpu,
  Shield, Users, Zap,
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
      {/* Header Card avec gradient + KPIs REELS */}
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 border-b">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Indicateurs Cles — Donnees 2024-2026</span>
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
            { value: "218 G$", label: "Revenus Manuf. QC", trend: "+22.8% vs 2019", icon: DollarSign, color: "emerald", source: "ISQ 2024" },
            { value: "417K", label: "Emplois Manufacturiers", trend: "-0.8% vs 2023", icon: Users, color: "blue", source: "STIQ 2025" },
            { value: "43%", label: "Adoption IA (PME)", trend: "+39pts vs 2019", icon: Cpu, color: "violet", source: "STIQ/MEIE 2025" },
            { value: "65.90$/h", label: "Productivite QC", trend: "-10.5% vs Ontario", icon: Gauge, color: "amber", source: "ISQ 2024" },
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
                  <div className="text-[9px] text-gray-500">
                    <span className={cn("font-bold", kpi.trend.startsWith("-") && kpi.label !== "Productivite QC" ? "text-red-500" : "text-green-600")}>{kpi.trend}</span>
                  </div>
                  <div className="text-[9px] text-gray-400 italic">{kpi.source}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {activeTab === "vue" && (
        <div className="space-y-4">
          {/* Indicateurs secondaires REELS */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-cyan-100 to-blue-100 px-4 py-2.5 border-b border-cyan-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-600" />
                <span className="text-sm font-bold text-cyan-900">Portrait Manufacturier Quebec 2024-2026</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Etablissements", value: "13,694", detail: "Employeurs (800+ en automatisation)", source: "ISQ/REAI 2024" },
                  { label: "ERP Adoption", value: "51%", detail: "Seulement 3% completement connecte", source: "MEIE 2025" },
                  { label: "Maturite Numerique Haute", value: "19%", detail: "24% font 4 types d'innovation", source: "MEIE/STIQ 2025" },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">{s.label}</p>
                    <p className="text-lg font-bold text-gray-800">{s.value}</p>
                    <p className="text-[9px] text-gray-500">{s.detail}</p>
                    <p className="text-[9px] text-gray-400 italic mt-1">{s.source}</p>
                  </div>
                ))}
              </div>

              {/* Technologies adoption bars */}
              <p className="text-xs font-bold text-gray-700 mb-2">Taux d'Adoption Technologique (PME QC 2024-2026)</p>
              <div className="space-y-2">
                {[
                  { tech: "CAO/DAO", rate: 61, source: "MEIE" },
                  { tech: "ERP/MRP", rate: 51, source: "MEIE" },
                  { tech: "Infonuagique", rate: 49, source: "StatCan" },
                  { tech: "IA / Machine Learning", rate: 43, source: "STIQ/MEIE" },
                  { tech: "Robotique / FMS / MES", rate: 38, source: "MEIE" },
                  { tech: "Impression 3D", rate: 16, source: "MEIE" },
                ].map((t) => (
                  <div key={t.tech} className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-600 min-w-[120px]">{t.tech}</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-1000",
                          t.rate >= 50 ? "bg-emerald-500" : t.rate >= 30 ? "bg-blue-500" : t.rate >= 15 ? "bg-amber-500" : "bg-violet-500"
                        )}
                        style={{ width: `${t.rate}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-gray-700 min-w-[28px] text-right">{t.rate}%</span>
                    <span className="text-[9px] text-gray-400 min-w-[35px]">{t.source}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Structure industrielle */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2.5 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-900">Top Secteurs — 62% du PIB Manufacturier</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { secteur: "Transport / Aerospatiale", poids: "17.1%", icon: Factory },
                  { secteur: "Produits Metalliques", poids: "14.6%", icon: Wrench },
                  { secteur: "Aliments", poids: "13.5%", icon: Building2 },
                  { secteur: "Premiere Transfo. Metaux", poids: "12.9%", icon: Wrench },
                  { secteur: "Machines", poids: "8.5%", icon: Wrench },
                  { secteur: "Chimie", poids: "8.5%", icon: Zap },
                ].map((s) => {
                  const SIcon = s.icon;
                  return (
                    <div key={s.secteur} className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2">
                      <SIcon className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-800">{s.secteur}</p>
                        <p className="text-[9px] text-emerald-600 font-bold">{s.poids} du PIB</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-gray-400 mt-2 italic">Source: STIQ Barometre 16e edition 2025</p>
            </div>
          </div>

          {/* Sources reelles */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-teal-100 to-emerald-100 px-4 py-2.5 border-b border-teal-200">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-bold text-teal-900">Sources de Donnees — 28 References Citees</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { source: "ISQ (Inst. Statistique QC)", type: "Provincial", freq: "Mensuel/Annuel", icon: MapPin },
                  { source: "STIQ Barometre 16e ed.", type: "Provincial", freq: "Annuel", icon: BarChart3 },
                  { source: "MEIE (Min. Economie)", type: "Provincial", freq: "Annuel", icon: Building2 },
                  { source: "Statistique Canada", type: "Federal", freq: "Mensuel", icon: Globe },
                  { source: "REAI (130+ membres)", type: "Associatif", freq: "Annuel", icon: Network },
                  { source: "IFR World Robotics", type: "International", freq: "Annuel", icon: Factory },
                  { source: "Invest. Quebec (Grand V)", type: "Provincial", freq: "Annuel", icon: DollarSign },
                  { source: "FCEI / BDC", type: "Federal", freq: "Trimestriel", icon: Briefcase },
                  { source: "Scale AI / Mila", type: "Ecosysteme IA", freq: "Continu", icon: Cpu },
                ].map((s) => {
                  const SIcon = s.icon;
                  return (
                    <div key={s.source} className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 flex items-start gap-2">
                      <SIcon className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-teal-800">{s.source}</p>
                        <p className="text-[9px] text-teal-600">{s.type} · {s.freq}</p>
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
          {/* Grand V + PME Investment */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2.5 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-900">Investissements — Le Fossé Financier</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg border-l-4 border-l-emerald-400 bg-emerald-50/50">
                  <p className="text-xs font-bold text-gray-800 mb-1">Programme "Grand V" (IQ)</p>
                  <p className="text-2xl font-bold text-emerald-600">1 G$</p>
                  <p className="text-[9px] text-gray-500">225 projets en 5 mois (moy. 13.7M$/projet)</p>
                  <p className="text-[9px] text-gray-400">Objectif triennal: 4.5 G$ — Source: IQ 2024-2025</p>
                </div>
                <div className="p-3 rounded-lg border-l-4 border-l-amber-400 bg-amber-50/50">
                  <p className="text-xs font-bold text-gray-800 mb-1">Budget Moyen PME / an</p>
                  <p className="text-2xl font-bold text-amber-600">40,715$</p>
                  <p className="text-[9px] text-gray-500">Previsions 12 prochains mois: 34,559$</p>
                  <p className="text-[9px] text-gray-400">80% autofinance — Source: MEIE 2025</p>
                </div>
              </div>

              <Card className="p-3 bg-red-50 border-red-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                  <div className="text-[9px] text-red-700">
                    <span className="font-bold">Fracture critique:</span> L'Etat finance les champions a coups de millions. La PME de 15 employes gere sa numerisation avec un budget equivalent au prix d'une berline d'entree de gamme.
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* ROI */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-emerald-100 to-green-100 px-4 py-2.5 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-900">ROI de la Transformation Numerique</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-center">
                  <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Retour moyen</p>
                  <p className="text-2xl font-bold text-emerald-600">1.60$</p>
                  <p className="text-[9px] text-gray-500">par dollar investi en techno</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                  <p className="text-[9px] text-emerald-600 uppercase font-bold mb-1">Leaders numeriques</p>
                  <p className="text-2xl font-bold text-emerald-700">2.40$</p>
                  <p className="text-[9px] text-emerald-600">par dollar investi</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { impact: "Productivite augmentee", pct: "56%", desc: "des PME QC citent ce gain" },
                  { impact: "Taches repetitives reduites", pct: "56%", desc: "liberation de temps" },
                  { impact: "Couts diminues", pct: "36%", desc: "economies operationnelles" },
                  { impact: "Qualite amelioree", pct: "30%", desc: "moins de rebuts" },
                  { impact: "Rentabilite < 2 ans", pct: "55%", desc: "des PME canadiennes (FCEI)" },
                ].map((r) => (
                  <div key={r.impact} className="flex items-center gap-2 p-2 rounded bg-gray-50">
                    <span className="text-xs text-gray-700 flex-1">{r.impact}</span>
                    <span className="text-xs font-bold text-emerald-600">{r.pct}</span>
                    <span className="text-[9px] text-gray-400">{r.desc}</span>
                  </div>
                ))}
              </div>

              <Card className="p-3 bg-blue-50 border-blue-200 mt-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="text-[9px] text-blue-700">L'IA generative permet d'economiser 2.05h pour chaque 0.97h investie (FCEI 2025)</span>
                </div>
              </Card>

              <p className="text-[9px] text-gray-400 mt-2 italic">Sources: STIQ 16e ed. 2025 / FCEI 2025</p>
            </div>
          </div>

          {/* Couts par type (on garde ces donnees raisonnables) */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2.5 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-bold text-amber-900">Couts Moyens par Type de Solution (k$)</span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-400 mb-3">Investissement total incluant materiel, integration, formation et maintenance annuelle</p>
              <div className="flex items-center gap-1.5 mb-3 p-2 rounded bg-amber-50 border border-amber-200">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-[9px] text-amber-700 font-medium">ESTIMATIONS — Fourchettes basees sur donnees IFR 2024, REAI et fournisseurs Quebec. Varient selon marque, complexite et integrateur.</span>
              </div>
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
                        <p className="text-[9px] text-gray-500">{col.label}</p>
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
          {/* Obstacles RH */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-red-100 to-orange-100 px-4 py-2.5 border-b border-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-bold text-red-900">Obstacles a l'Adoption — 2024-2026</span>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2.5">
                {[
                  { obstacle: "Manque de connaissances sur l'IA", pct: 67, source: "STIQ 2025" },
                  { obstacle: "Manque de personnel qualifie", pct: 66, source: "STIQ 2025" },
                  { obstacle: "Manque de temps", pct: 66, source: "STIQ 2025" },
                  { obstacle: "Difficulte a evaluer le ROI", pct: 53, source: "STIQ 2025" },
                  { obstacle: "Manque de competences numeriques", pct: 51, source: "FCEI 2025" },
                  { obstacle: "Couts eleves", pct: 48, source: "FCEI 2025" },
                ].map((o) => (
                  <div key={o.obstacle}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-700 flex-1">{o.obstacle}</span>
                      <span className="text-xs font-bold text-gray-700">{o.pct}%</span>
                      <span className="text-[9px] text-gray-400">{o.source}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", o.pct >= 60 ? "bg-red-400" : o.pct >= 50 ? "bg-amber-400" : "bg-blue-400")}
                        style={{ width: `${o.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Card className="p-3 bg-amber-50 border-amber-200 mt-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <span className="text-[9px] text-amber-700">Changement de paradigme: L'obstacle n'est plus le refus de changer mais l'incapacite a absorber et evaluer le changement (STIQ 2025)</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Salaires */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2.5 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-900">Salaires Moyens — Secteur Manufacturier Quebec 2025</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: "Analyste de donnees", salaire: "68-71K$", demande: "Forte", source: "ZipRecruiter 2025" },
                  { role: "Data Analyst Senior", salaire: "87-106K$", demande: "Tres forte", source: "Payscale 2025" },
                  { role: "Ingenieur automatisation", salaire: "85-110K$", demande: "Tres forte", source: "Indeed 2025" },
                  { role: "Ingenieur mecanique", salaire: "78-95K$", demande: "Forte", source: "Indeed 2025" },
                  { role: "Specialiste IA/ML", salaire: "95-140K$", demande: "Extreme", source: "LinkedIn 2025" },
                  { role: "Technicien robotique", salaire: "55-72K$", demande: "Forte", source: "Indeed 2025" },
                  { role: "Directeur de production", salaire: "90-125K$", demande: "Moyenne", source: "Indeed 2025" },
                  { role: "Soudeur certifie", salaire: "52-68K$", demande: "Forte", source: "STIQ 2025" },
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

              <div className="mt-3 p-3 rounded-lg bg-violet-50 border border-violet-200">
                <p className="text-xs font-bold text-violet-800 mb-1">Strategie "IA-Augmented" (Zero Data Scientist)</p>
                <p className="text-[9px] text-violet-600">
                  Usine Bleue utilise statsforecast + LLMs au lieu d'embaucher un Data Scientist a 87K$/an.
                  L'IA abstraie la complexite mathematique pour un cout de 20-50$/mois en API.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "opportunites" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-indigo-100 to-violet-100 px-4 py-2.5 border-b border-indigo-200">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-bold text-indigo-900">Opportunites Strategiques — Donnees Reelles 2024-2026</span>
              </div>
            </div>
            <div className="p-4">
              {[
                { sector: "IA Generative & Predictive", opportunity: "43% adoption mais 47% n'utilisent toujours pas l'IA — marche massif non penetre", impact: "Tres eleve", trend: "↑↑", data: "+39 pts depuis 2019 (4% → 43%)", source: "STIQ/MEIE 2025" },
                { sector: "ERP & Integration Systemes", opportunity: "51% ont un ERP mais SEULEMENT 3% completement connecte — dette technique massive", impact: "Critique", trend: "↑↑↑", data: "14% d'interconnexion elevee", source: "MEIE 2025" },
                { sector: "Cybersecurite OT", opportunity: "Convergence IT/OT + Loi 25 = besoin explosif. Etait 13% de l'offre en 2019", impact: "Eleve", trend: "↑↑", data: "Cloud a 48.5% = surface d'attaque elargie", source: "FCCQ 2024" },
                { sector: "Automatisation PME", opportunity: "73% utilisent l'automatisation MAIS investissement moyen PME = 40,715$/an seulement", impact: "Eleve", trend: "↑", data: "ROI cobot 14-18 mois, 1.60$/$ investi", source: "MEIE/FCEI 2025" },
                { sector: "ESG & Developpement Durable", opportunity: "Grand V lie les milliards a la 'productivite durable' — nouveau critere obligatoire", impact: "Moyen-eleve", trend: "↑", data: "IoT + IA pour optimiser conso energetique", source: "IQ 2024-2025" },
                { sector: "Diversification Export", opportunity: "76% exportent aux USA — risque tarifaire Trump 2025 = urgence diversification", impact: "Strategique", trend: "→↑", data: "29% des innovantes exportent hors USA (vs 15% autres)", source: "STIQ 2025" },
              ].map((o, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-100 hover:shadow-sm mb-2 last:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span className="text-sm font-semibold text-gray-800 flex-1">{o.sector}</span>
                    <Badge variant="outline" className={cn("text-[9px]",
                      o.impact === "Critique" ? "text-red-600 bg-red-50" :
                      o.impact === "Tres eleve" ? "text-orange-600 bg-orange-50" :
                      "text-indigo-600"
                    )}>{o.impact}</Badge>
                    <span className="text-sm">{o.trend}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{o.opportunity}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-blue-600">{o.data}</span>
                    <span className="text-[9px] text-gray-400 italic">{o.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Robotique mondiale */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-slate-100 to-gray-100 px-4 py-2.5 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-bold text-gray-900">Contexte Mondial — Densite Robotique (IFR 2024-2025)</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { pays: "Coree du Sud", densite: "1,012", trend: "Leader mondial" },
                  { pays: "Singapour", densite: "770", trend: "2e mondial" },
                  { pays: "Chine", densite: "470", trend: "Doublement en 4 ans" },
                  { pays: "Canada", densite: "~200", trend: "3,800 installations 2024 (-12%)" },
                ].map((p) => (
                  <div key={p.pays} className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-gray-800">{p.pays}</span>
                      <span className="text-xs font-bold text-blue-600">{p.densite} / 10K emp.</span>
                    </div>
                    <p className="text-[9px] text-gray-500">{p.trend}</p>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-gray-400 mt-2 italic">Densite = robots pour 10,000 employes. Moyenne mondiale record: 162 en 2023 (double d'il y a 7 ans). Source: IFR 2025</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "etudes" && (
        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
            <div className="flex items-start gap-3">
              <Globe className="h-6 w-6 text-teal-600 mt-1 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-teal-800">Barometre Usine Bleue — Lead Magnet Strategique</h3>
                <p className="text-xs text-teal-700 mt-1">Usine Bleue publie LE rapport de reference du manufacturier au Quebec. Position centrale credible = donnees exclusives reseau Orbit9 + 28 sources gouvernementales + micro-sondages CarlOS. Successeur direct de l'etude REAI/Deloitte 2019.</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-[9px] text-teal-700 border-teal-300">Gratuit = Marketing</Badge>
                  <Badge variant="outline" className="text-[9px] text-teal-700 border-teal-300">Oracle Premium = Monetisation</Badge>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2.5 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-900">Etudes de Reference 2024-2026</span>
              </div>
            </div>
            <div className="p-4">
              {[
                { title: "Barometre industriel quebecois 16e edition", source: "STIQ", year: "2025", pages: "80+", type: "Barometre", url: "stiq.com" },
                { title: "Enquete numerique manufacturier QC", source: "MEIE", year: "2025", pages: "30+", type: "Enquete", url: "cdn-contenu.quebec.ca" },
                { title: "Rapport annuel d'activites 2024-2025", source: "Investissement Quebec", year: "2025", pages: "100+", type: "Rapport", url: "investquebec.com" },
                { title: "World Robotics Report — Industrial Robots", source: "IFR", year: "2025", pages: "350+", type: "Rapport", url: "ifr.org" },
                { title: "Transformation numerique des PME canadiennes", source: "FCEI", year: "2025", pages: "25+", type: "Etude", url: "cfib-fcei.ca" },
                { title: "Adoption et utilisation de l'IA au Quebec", source: "ISQ / StatCan", year: "2025", pages: "20+", type: "Portrait", url: "statistique.quebec.ca" },
                { title: "Impact de l'IA sur les entreprises au Quebec", source: "Aviseo / CPQ", year: "2024", pages: "40+", type: "Etude", url: "aviseo.ca" },
                { title: "Rapport ecosysteme tech Quebec 2025", source: "Quebec Tech", year: "2025", pages: "50+", type: "Rapport", url: "quebectech.com" },
              ].map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:shadow-sm mb-2 last:mb-0">
                  <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-800">{doc.title}</p>
                    <p className="text-[9px] text-gray-400">{doc.source} · {doc.year} · {doc.pages} pages</p>
                  </div>
                  <Badge variant="outline" className="text-[9px]">{doc.type}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
