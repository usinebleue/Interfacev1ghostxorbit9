/**
 * DashboardView.tsx — Tour de Controle CEO
 * 10 blocs du wireframe (5 C-Level + 5 outils)
 * DYNAMIQUE — charge les donnees depuis le kit entreprise actif
 * Sprint A/B — Frame Master V2
 */

import { useEffect, useState } from "react";
import { Briefcase, DollarSign, Cpu, Megaphone, Target, Loader2, Settings, Users, Lightbulb, HeartHandshake, Package, ShieldAlert, Scale, Zap, MessageSquare, Flame } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";

import { useCanvasActions } from "../../context/CanvasActionContext";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useChantiers, useMissions } from "../../api/hooks";
import { api } from "../../api/client";
import type { KitActiveResponse } from "../../api/types";
import { PageLayout } from "./layouts/PageLayout";

/* ============ BLOCK HEADER — style gradient Bilan de Sante ============ */
function BlockHeader({ icon: Icon, title, count, gradient }: {
  icon: React.ElementType;
  title: string;
  count?: number;
  gradient?: string;
}) {
  if (gradient) {
    return (
      <div className={cn("flex items-center gap-2.5 -mx-4 -mt-4 mb-3 px-4 py-2.5", gradient)}>
        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex-1">{title}</h3>
        {count !== undefined && (
          <span className="text-xs font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">{count}</span>
        )}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-gray-500" />
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">{title}</h3>
      {count !== undefined && (
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
          {count}
        </Badge>
      )}
    </div>
  );
}

/* ============ HELPERS — formatage ============ */
function fmtMoney(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}G$`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M$`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K$`;
  return `${n}$`;
}

function fmtPct(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  if (n <= 1 && n > 0) return `${(n * 100).toFixed(1)}%`;
  return `${n}%`;
}

/* ============ BLOC C-LEVEL : CarlOS (CEO) ============ */
function BlocCEO({ onClick, kpi }: { onClick?: () => void; kpi?: Record<string, unknown> }) {
  const items: Array<{ label: string; detail: string; sub: string }> = [];
  if (kpi) {
    if (kpi.priorite_1) items.push({ label: "Priorite #1", detail: String(kpi.priorite_1).slice(0, 60), sub: "Focus strategique" });
    if (kpi.score_sante_globale !== undefined) items.push({ label: "Sante globale", detail: `${kpi.score_sante_globale}/100`, sub: kpi.triangle_feu ? `Triangle: ${kpi.triangle_feu}` : "" });
    if (kpi.decisions_ce_mois !== undefined) items.push({ label: "Decisions ce mois", detail: String(kpi.decisions_ce_mois), sub: kpi.projets_actifs ? `${kpi.projets_actifs} projets actifs` : "" });
    if (kpi.plan_strategique) items.push({ label: "Plan strategique", detail: String(kpi.plan_strategique).slice(0, 50), sub: "" });
    if (kpi.nb_sites) items.push({ label: "Sites", detail: Number(kpi.nb_sites).toLocaleString(), sub: kpi.nb_pays ? `${kpi.nb_pays} pays` : "" });
    if (kpi.revenus_milliards_usd) items.push({ label: "Revenus", detail: `${kpi.revenus_milliards_usd}G$ US`, sub: "" });
  }
  if (items.length === 0) {
    items.push({ label: "Tour de controle", detail: "Aucune donnee", sub: "Selectionnez une instance" });
  }
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Briefcase} title="CarlOS — CEO" count={items.length} gradient="bg-gradient-to-r from-blue-600 to-blue-500" />
      <ul className="space-y-2.5">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
            <span className="font-medium">{item.label}</span> — {item.detail}
            {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent CFO ============ */
function BlocCFO({ onClick, kpi }: { onClick?: () => void; kpi?: Record<string, unknown> }) {
  const items: Array<{ label: string; value: string; valueColor: string; sub: string }> = [];
  if (kpi) {
    // PME (tresorerie, mrr, marge_brute_pct)
    if (kpi.tresorerie !== undefined) items.push({ label: "Tresorerie", value: fmtMoney(Number(kpi.tresorerie)), valueColor: "text-emerald-600", sub: kpi.runway_mois ? `Runway: ${kpi.runway_mois} mois` : "" });
    if (kpi.mrr !== undefined) items.push({ label: "MRR", value: fmtMoney(Number(kpi.mrr)), valueColor: "text-emerald-600", sub: kpi.arr ? `ARR: ${fmtMoney(Number(kpi.arr))}` : "" });
    if (kpi.marge_brute_pct !== undefined) items.push({ label: "Marge brute", value: fmtPct(Number(kpi.marge_brute_pct)), valueColor: "font-bold", sub: "" });
    // Grande entreprise (revenus_milliards_usd, ebitda)
    if (kpi.revenus_milliards_usd !== undefined) items.push({ label: "Revenus", value: `${kpi.revenus_milliards_usd}G$ US`, valueColor: "text-emerald-600", sub: "" });
    if (kpi.ebitda_milliards_usd !== undefined) items.push({ label: "EBITDA", value: `${kpi.ebitda_milliards_usd}G$ US`, valueColor: "text-emerald-600", sub: kpi.marge_ebitda_pct ? `Marge: ${kpi.marge_ebitda_pct}%` : "" });
    if (kpi.benefice_net_milliards_usd !== undefined) items.push({ label: "Benefice net", value: `${kpi.benefice_net_milliards_usd}G$ US`, valueColor: "font-bold", sub: "" });
    if (kpi.free_cash_flow_milliards !== undefined) items.push({ label: "FCF", value: `${kpi.free_cash_flow_milliards}G$`, valueColor: "text-emerald-600", sub: "" });
    if (kpi.alerte) items.push({ label: "Alerte", value: "!", valueColor: "text-red-500", sub: String(kpi.alerte).slice(0, 60) });
    // Fonds (actifs_sous_gestion, rendement)
    if (kpi.actifs_sous_gestion_milliards !== undefined) items.push({ label: "AUM", value: `${kpi.actifs_sous_gestion_milliards}G$`, valueColor: "text-emerald-600", sub: "" });
    if (kpi.rendement_annuel_pct !== undefined) items.push({ label: "Rendement annuel", value: fmtPct(Number(kpi.rendement_annuel_pct)), valueColor: "text-emerald-600", sub: "" });
  }
  if (items.length === 0) items.push({ label: "Finances", value: "—", valueColor: "", sub: "Aucune donnee" });
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={DollarSign} title="François — CFO" count={items.length > 1 ? items.length : undefined} gradient="bg-gradient-to-r from-emerald-600 to-emerald-500" />
      <ul className="space-y-2.5">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
            <div className="flex justify-between"><span className="font-medium">{item.label}</span><span className={cn(item.valueColor, "font-bold")}>{item.value}</span></div>
            {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent CTO ============ */
function BlocCTO({ onClick, kpi }: { onClick?: () => void; kpi?: Record<string, unknown> }) {
  const items: Array<{ label: string; value: string; pct?: number; sub: string }> = [];
  if (kpi) {
    if (kpi.uptime_platform !== undefined) items.push({ label: "Uptime", value: `${kpi.uptime_platform}%`, pct: Number(kpi.uptime_platform), sub: "" });
    if (kpi.features_shipped_mois !== undefined) items.push({ label: "Features ce mois", value: String(kpi.features_shipped_mois), sub: kpi.bugs_critiques !== undefined ? `${kpi.bugs_critiques} bugs critiques` : "" });
    if (kpi.couverture_tests_pct !== undefined) items.push({ label: "Tests", value: `${kpi.couverture_tests_pct}%`, pct: Number(kpi.couverture_tests_pct), sub: "" });
    if (kpi.dette_technique_score !== undefined) items.push({ label: "Dette technique", value: `${kpi.dette_technique_score}/10`, sub: "" });
    // Grande entreprise
    if (kpi.erp) items.push({ label: "ERP", value: String(kpi.erp).slice(0, 30), sub: "" });
    if (kpi.ia_caisse) items.push({ label: "IA", value: String(kpi.ia_caisse).slice(0, 40), sub: "" });
    if (kpi.cto_nom) items.push({ label: "CTO", value: String(kpi.cto_nom), sub: "" });
  }
  if (items.length === 0) items.push({ label: "Tech", value: "—", sub: "Aucune donnee" });
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-violet-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Cpu} title="Thierry — CTO" gradient="bg-gradient-to-r from-violet-600 to-violet-500" />
      <ul className="space-y-2.5">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
            <div className="flex justify-between mb-0.5"><span className="font-medium">{item.label}</span><span className="font-bold">{item.value}</span></div>
            {item.pct !== undefined && (
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min(item.pct, 100)}%` }} />
              </div>
            )}
            {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent CMO ============ */
function BlocCMO({ onClick, kpi }: { onClick?: () => void; kpi?: Record<string, unknown> }) {
  const items: Array<{ label: string; value: string; valueColor: string; sub: string }> = [];
  if (kpi) {
    if (kpi.leads_generes_mois !== undefined) items.push({ label: "Leads generes", value: String(kpi.leads_generes_mois), valueColor: "text-pink-600", sub: kpi.leads_qualifies_mois ? `${kpi.leads_qualifies_mois} qualifies` : "" });
    if (kpi.taux_conversion_lead !== undefined) items.push({ label: "Conversion", value: fmtPct(Number(kpi.taux_conversion_lead)), valueColor: "font-bold", sub: "" });
    if (kpi.campagnes_actives !== undefined) items.push({ label: "Campagnes actives", value: String(kpi.campagnes_actives), valueColor: "font-bold", sub: "" });
    if (kpi.trafic_site_mensuel) items.push({ label: "Trafic site", value: Number(kpi.trafic_site_mensuel).toLocaleString(), valueColor: "text-pink-600", sub: "" });
    // Grande entreprise
    if (kpi.positionnement) items.push({ label: "Positionnement", value: String(kpi.positionnement).slice(0, 40), valueColor: "", sub: "" });
    if (kpi.programme_fidelite) items.push({ label: "Fidelite", value: String(kpi.programme_fidelite).slice(0, 30), valueColor: "", sub: "" });
    if (Array.isArray(kpi.marques)) items.push({ label: "Marques", value: `${kpi.marques.length} marques`, valueColor: "text-pink-600", sub: (kpi.marques as string[]).slice(0, 3).join(", ") });
  }
  if (items.length === 0) items.push({ label: "Marketing", value: "—", valueColor: "", sub: "Aucune donnee" });
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-pink-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Megaphone} title="Martine — CMO" gradient="bg-gradient-to-r from-pink-600 to-pink-500" />
      <ul className="space-y-2.5">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
            <div className="flex justify-between"><span className="font-medium">{item.label}</span><span className={cn(item.valueColor, "font-bold")}>{item.value}</span></div>
            {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent CSO ============ */
function BlocCSO({ onClick, kpi }: { onClick?: () => void; kpi?: Record<string, unknown> }) {
  const items: Array<{ label: string; detail: string; sub: string }> = [];
  if (kpi) {
    if (kpi.avantage_concurrentiel) items.push({ label: "Avantage", detail: String(kpi.avantage_concurrentiel).slice(0, 60), sub: "" });
    if (kpi.strategie) items.push({ label: "Strategie", detail: String(kpi.strategie).slice(0, 60), sub: "" });
    if (kpi.parts_de_marche_estimee !== undefined) items.push({ label: "Part de marche", detail: fmtPct(Number(kpi.parts_de_marche_estimee)), sub: kpi.concurrents_directs ? `${kpi.concurrents_directs} concurrents` : "" });
    if (kpi.partenariats_actifs !== undefined) items.push({ label: "Partenariats", detail: `${kpi.partenariats_actifs} actifs`, sub: kpi.partenariats_pipeline ? `${kpi.partenariats_pipeline} en pipeline` : "" });
    if (kpi.expansion) items.push({ label: "Expansion", detail: String(kpi.expansion).slice(0, 60), sub: "" });
    if (kpi.pipeline_ma) items.push({ label: "M&A", detail: String(kpi.pipeline_ma).slice(0, 50), sub: "" });
    if (Array.isArray(kpi.risques_strategiques)) items.push({ label: "Risques", detail: `${(kpi.risques_strategiques as string[]).length} identifies`, sub: (kpi.risques_strategiques as string[])[0]?.slice(0, 50) || "" });
  }
  if (items.length === 0) items.push({ label: "Strategie", detail: "—", sub: "Aucune donnee" });
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Target} title="Sophie — CSO" gradient="bg-gradient-to-r from-red-600 to-red-500" />
      <ul className="space-y-2.5">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
            <span className="font-medium">{item.label}</span> — {item.detail}
            {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent COO ============ */
function BlocCOO({ onClick, kpi }: { onClick?: () => void; kpi?: Record<string, unknown> }) {
  const items: Array<{ label: string; value: string; sub: string }> = [];
  if (kpi) {
    if (kpi.satisfaction_client !== undefined) items.push({ label: "Satisfaction client", value: `${kpi.satisfaction_client}/10`, sub: "" });
    if (kpi.processus_documentes_pct !== undefined) items.push({ label: "Processus doc.", value: fmtPct(Number(kpi.processus_documentes_pct)), sub: "" });
    if (kpi.tickets_support_mois !== undefined) items.push({ label: "Tickets support", value: String(kpi.tickets_support_mois), sub: "" });
    if (kpi.nb_sites !== undefined) items.push({ label: "Sites", value: Number(kpi.nb_sites).toLocaleString(), sub: kpi.nb_pays ? `${kpi.nb_pays} pays` : "" });
    if (kpi.programme_efficience) items.push({ label: "Programme", value: String(kpi.programme_efficience).slice(0, 30), sub: "" });
  }
  if (items.length === 0) items.push({ label: "Operations", value: "—", sub: "Aucune donnee" });
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-orange-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Settings} title="Olivier — COO" gradient="bg-gradient-to-r from-orange-600 to-orange-500" />
      <ul className="space-y-2.5">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
            <div className="flex justify-between"><span className="font-medium">{item.label}</span><span className="font-bold">{item.value}</span></div>
            {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent RH ============ */
function BlocRH({ onClick, kpi }: { onClick?: () => void; kpi?: Record<string, unknown> }) {
  const items: Array<{ label: string; value: string; sub: string }> = [];
  if (kpi) {
    if (kpi.nb_employes !== undefined) items.push({ label: "Employes", value: Number(kpi.nb_employes).toLocaleString(), sub: "" });
    if (kpi.taux_roulement_pct !== undefined) items.push({ label: "Roulement", value: fmtPct(Number(kpi.taux_roulement_pct)), sub: "" });
    if (kpi.postes_ouverts !== undefined) items.push({ label: "Postes ouverts", value: String(kpi.postes_ouverts), sub: "" });
    if (kpi.score_engagement !== undefined) items.push({ label: "Engagement", value: `${kpi.score_engagement}/10`, sub: "" });
  }
  if (items.length === 0) items.push({ label: "Ressources humaines", value: "—", sub: "Aucune donnee" });
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-teal-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Users} title="Hélène — CHRO" gradient="bg-gradient-to-r from-teal-600 to-teal-500" />
      <ul className="space-y-2.5">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
            <div className="flex justify-between"><span className="font-medium">{item.label}</span><span className="font-bold">{item.value}</span></div>
            {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent Innovation ============ */
function BlocInnovation({ onClick, kpi }: { onClick?: () => void; kpi?: Record<string, unknown> }) {
  const items: Array<{ label: string; value: string; sub: string }> = [];
  if (kpi) {
    if (kpi.projets_rd !== undefined) items.push({ label: "Projets R&D", value: String(kpi.projets_rd), sub: "" });
    if (kpi.brevets !== undefined) items.push({ label: "Brevets", value: String(kpi.brevets), sub: "" });
    if (kpi.budget_innovation_pct !== undefined) items.push({ label: "Budget innov.", value: fmtPct(Number(kpi.budget_innovation_pct)), sub: "" });
  }
  if (items.length === 0) items.push({ label: "Innovation", value: "—", sub: "Aucune donnee" });
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-rose-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Lightbulb} title="Inès — CINO" gradient="bg-gradient-to-r from-rose-600 to-rose-500" />
      <ul className="space-y-2.5">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
            <div className="flex justify-between"><span className="font-medium">{item.label}</span><span className="font-bold">{item.value}</span></div>
            {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent Securite ============ */
function BlocClients({ onClick, kpi }: { onClick?: () => void; kpi?: Record<string, unknown> }) {
  const items: Array<{ label: string; value: string; sub: string }> = [];
  if (kpi) {
    if (kpi.nps !== undefined) items.push({ label: "NPS", value: String(kpi.nps), sub: "" });
    if (kpi.clients_actifs !== undefined) items.push({ label: "Clients actifs", value: Number(kpi.clients_actifs).toLocaleString(), sub: "" });
    if (kpi.taux_retention_pct !== undefined) items.push({ label: "Retention", value: fmtPct(Number(kpi.taux_retention_pct)), sub: "" });
    if (kpi.satisfaction_client !== undefined) items.push({ label: "Satisfaction", value: `${kpi.satisfaction_client}/10`, sub: "" });
  }
  if (items.length === 0) items.push({ label: "Securite & Conformite", value: "—", sub: "Aucune donnee" });
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-zinc-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={HeartHandshake} title="Sébastien — CISO" gradient="bg-gradient-to-r from-zinc-600 to-zinc-500" />
      <ul className="space-y-2.5">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
            <div className="flex justify-between"><span className="font-medium">{item.label}</span><span className="font-bold">{item.value}</span></div>
            {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent Usine / Produit ============ */
function BlocProduit({ onClick, kpi }: { onClick?: () => void; kpi?: Record<string, unknown> }) {
  const items: Array<{ label: string; value: string; sub: string }> = [];
  if (kpi) {
    if (kpi.produits_actifs !== undefined) items.push({ label: "Produits actifs", value: String(kpi.produits_actifs), sub: "" });
    if (kpi.roadmap_items !== undefined) items.push({ label: "Items roadmap", value: String(kpi.roadmap_items), sub: "" });
    if (kpi.adoption_pct !== undefined) items.push({ label: "Adoption", value: fmtPct(Number(kpi.adoption_pct)), sub: "" });
  }
  if (items.length === 0) items.push({ label: "Usine & Produit", value: "—", sub: "Aucune donnee" });
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-slate-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Package} title="Fabien — CPO" gradient="bg-gradient-to-r from-slate-600 to-slate-500" />
      <ul className="space-y-2.5">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
            <div className="flex justify-between"><span className="font-medium">{item.label}</span><span className="font-bold">{item.value}</span></div>
            {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent Risques ============ */
function BlocRisques({ onClick, kpi }: { onClick?: () => void; kpi?: Record<string, unknown> }) {
  const items: Array<{ label: string; value: string; sub: string }> = [];
  if (kpi) {
    if (kpi.risques_critiques !== undefined) items.push({ label: "Risques critiques", value: String(kpi.risques_critiques), sub: "" });
    if (kpi.conformite_pct !== undefined) items.push({ label: "Conformite", value: fmtPct(Number(kpi.conformite_pct)), sub: "" });
    if (kpi.incidents_mois !== undefined) items.push({ label: "Incidents ce mois", value: String(kpi.incidents_mois), sub: "" });
  }
  if (items.length === 0) items.push({ label: "Risques", value: "—", sub: "Aucune donnee" });
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-amber-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={ShieldAlert} title="Raphaël — CRO" gradient="bg-gradient-to-r from-amber-600 to-amber-500" />
      <ul className="space-y-2.5">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
            <div className="flex justify-between"><span className="font-medium">{item.label}</span><span className="font-bold">{item.value}</span></div>
            {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent Legal ============ */
function BlocLegal({ onClick, kpi }: { onClick?: () => void; kpi?: Record<string, unknown> }) {
  const items: Array<{ label: string; value: string; sub: string }> = [];
  if (kpi) {
    if (kpi.contrats_actifs !== undefined) items.push({ label: "Contrats actifs", value: String(kpi.contrats_actifs), sub: "" });
    if (kpi.litiges !== undefined) items.push({ label: "Litiges", value: String(kpi.litiges), sub: "" });
    if (kpi.conformite_rgpd !== undefined) items.push({ label: "RGPD", value: String(kpi.conformite_rgpd), sub: "" });
  }
  if (items.length === 0) items.push({ label: "Legal", value: "—", sub: "Aucune donnee" });
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Scale} title="Louise — CLO" gradient="bg-gradient-to-r from-indigo-600 to-indigo-500" />
      <ul className="space-y-2.5">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
            <div className="flex justify-between"><span className="font-medium">{item.label}</span><span className="font-bold">{item.value}</span></div>
            {item.sub && <p className="text-[11px] text-gray-400">{item.sub}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ DASHBOARD VIEW ============ */
export function DashboardView() {
  // Focus: dispatch "focus" → CenterZone affiche FocusModeLayout (header gradient + LiveChat)
  const { dispatch } = useCanvasActions();
  const { sendMessage, threads } = useChatContext();
  const { navigateDiscussionTab, setActiveView } = useFrameMaster();
  const { chantiers } = useChantiers();
  const { missions } = useMissions();
  const [kitData, setKitData] = useState<KitActiveResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getActiveKit()
      .then(data => setKitData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = kitData?.kpis_departements;

  // Pipeline stats
  const activeThreads = threads.filter(t => t.status === "active");
  const parkedThreads = threads.filter(t => t.status === "parked");
  const missionsEnCours = missions.filter(m => m.status === "active" || m.status === "en_cours");
  const missionsEnAttente = missions.filter(m => m.status === "en_attente");
  const missionsCompletees = missions.filter(m => m.status === "completee");
  const chantiersBrule = chantiers.filter(ch => ch.chaleur === "brule");
  const chantiersCouve = chantiers.filter(ch => ch.chaleur === "couve");
  const avgProgression = chantiers.length > 0
    ? Math.round(chantiers.reduce((sum, ch) => sum + (ch.progression || 0), 0) / chantiers.length)
    : 0;

  const navigateTo = (tab: "discussions" | "missions" | "chantiers") => {
    navigateDiscussionTab(tab);
    setActiveView("mes-chantiers");
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <PageLayout maxWidth="5xl">

        {/* Pipeline KPI — 3 box: Discussions | Missions | Chantiers */}
        <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "50ms", animationFillMode: "both" }}>
          {/* Box Discussions */}
          <Card className="p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo("discussions")}>
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
              <MessageSquare className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Discussions</span>
            </div>
            <div className="px-3 py-2 space-y-1">
              <div className="text-2xl font-bold text-violet-600">{activeThreads.length}</div>
              <div className="text-[9px] text-gray-400">active{activeThreads.length !== 1 ? "s" : ""}</div>
              {parkedThreads.length > 0 && (
                <div className="text-[9px] text-amber-500">{parkedThreads.length} parkee{parkedThreads.length !== 1 ? "s" : ""}</div>
              )}
            </div>
          </Card>

          {/* Box Missions */}
          <Card className="p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo("missions")}>
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
              <Target className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Missions</span>
            </div>
            <div className="px-3 py-2 space-y-1">
              <div className="text-2xl font-bold text-blue-600">{missionsEnCours.length}</div>
              <div className="text-[9px] text-gray-400">en cours</div>
              <div className="flex items-center gap-2 text-[9px]">
                {missionsEnAttente.length > 0 && <span className="text-amber-500">{missionsEnAttente.length} en attente</span>}
                {missionsCompletees.length > 0 && <span className="text-gray-400">{missionsCompletees.length} terminee{missionsCompletees.length !== 1 ? "s" : ""}</span>}
              </div>
            </div>
          </Card>

          {/* Box Chantiers */}
          <Card className="p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo("chantiers")}>
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-500">
              <Flame className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Chantiers</span>
            </div>
            <div className="px-3 py-2 space-y-1">
              <div className="text-2xl font-bold text-amber-600">{chantiers.length}</div>
              <div className="text-[9px] text-gray-400">
                {chantiersBrule.length > 0 && <span className="text-red-500">{chantiersBrule.length} brule{chantiersBrule.length !== 1 ? "nt" : ""} </span>}
                {chantiersCouve.length > 0 && <span className="text-amber-500">{chantiersCouve.length} couve{chantiersCouve.length !== 1 ? "nt" : ""}</span>}
              </div>
              {chantiers.length > 0 && (
                <div className="text-[9px] text-gray-400">progression {avgProgression}%</div>
              )}
            </div>
          </Card>
        </div>

        {/* Grille 12 bots Bot Team CarlOS — 4 colonnes, 3 rangées */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
            <BlocCEO onClick={() => dispatch({ type: "focus", layer: "cerveau", data: { title: "CarlOS — Tactique", element_type: "kpi_ceo", data: kpis?.CEO }, bot: "CEOB" })} kpi={kpis?.CEO} />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "150ms", animationFillMode: "both" }}>
            <BlocCFO onClick={() => dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent CFO — Finances", element_type: "kpi_cfo", data: kpis?.CFO }, bot: "CFOB" })} kpi={kpis?.CFO} />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
            <BlocCTO onClick={() => dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent CTO — Technologie", element_type: "kpi_cto", data: kpis?.CTO }, bot: "CTOB" })} kpi={kpis?.CTO} />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "250ms", animationFillMode: "both" }}>
            <BlocCMO onClick={() => dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent CMO — Marketing", element_type: "kpi_cmo", data: kpis?.CMO }, bot: "CMOB" })} kpi={kpis?.CMO} />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
            <BlocCSO onClick={() => dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent CSO — Strategie", element_type: "kpi_cso", data: kpis?.CSO }, bot: "CSOB" })} kpi={kpis?.CSO} />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "350ms", animationFillMode: "both" }}>
            <BlocCOO onClick={() => dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent COO — Operations", element_type: "kpi_coo", data: kpis?.COO }, bot: "COOB" })} kpi={kpis?.COO} />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
            <BlocRH onClick={() => dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent RH — Ressources Humaines", element_type: "kpi_rh", data: kpis?.RH }, bot: "CHROB" })} kpi={kpis?.RH} />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "450ms", animationFillMode: "both" }}>
            <BlocInnovation onClick={() => dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent Innovation", element_type: "kpi_innovation", data: kpis?.IO }, bot: "CINOB" })} kpi={kpis?.IO} />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "500ms", animationFillMode: "both" }}>
            <BlocClients onClick={() => dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent Securite", element_type: "kpi_securite", data: kpis?.SE }, bot: "CISOB" })} kpi={kpis?.SE} />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "550ms", animationFillMode: "both" }}>
            <BlocProduit onClick={() => dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent Usine & Produit", element_type: "kpi_usine", data: kpis?.FA }, bot: "CPOB" })} kpi={kpis?.FA} />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "600ms", animationFillMode: "both" }}>
            <BlocRisques onClick={() => dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent Risques", element_type: "kpi_risques", data: kpis?.RO }, bot: "CROB" })} kpi={kpis?.RO} />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "650ms", animationFillMode: "both" }}>
            <BlocLegal onClick={() => dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent Legal", element_type: "kpi_legal", data: kpis?.LE }, bot: "CLOB" })} kpi={kpis?.LE} />
          </div>
        </div>

        {/* Diagnostic Express — entry point questionnaire (BLOC 6) */}
        <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "700ms", animationFillMode: "both" }}
          onClick={() => {
            sendMessage("/questionnaire start", "CEOB");
            dispatch({ type: "focus", layer: "cerveau", data: { title: "Diagnostic Express", element_type: "questionnaire", data: {} }, bot: "CEOB" });
          }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-800">Diagnostic Express</h3>
            <p className="text-[9px] text-gray-400 mt-0.5">CarlOS analyse votre entreprise en 4 phases — reponses personnalisees</p>
          </div>
          <span className="text-[9px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-semibold shrink-0">
            Lancer
          </span>
        </Card>
    </PageLayout>
  );
}
