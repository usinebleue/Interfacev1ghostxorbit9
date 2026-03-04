/**
 * DashboardView.tsx — Tour de Controle CEO
 * 10 blocs du wireframe (5 C-Level + 5 outils)
 * DYNAMIQUE — charge les donnees depuis le kit entreprise actif
 * Sprint A/B — Frame Master V2
 */

import { useEffect, useState } from "react";
import { Briefcase, DollarSign, Cpu, Megaphone, Target, CheckCircle2, CalendarDays, TrendingUp, Newspaper, BarChart3, Loader2 } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useCanvasActions } from "../../context/CanvasActionContext";
import { api } from "../../api/client";
import type { KitActiveResponse, KpisDepartements, VentesPipeline, ProjetActif, EntrepriseInfo } from "../../api/types";
import { CarlOSPresence } from "./CarlOSPresence";

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
      <BlockHeader icon={Briefcase} title="CarlOS" count={items.length} gradient="bg-gradient-to-r from-blue-600 to-blue-500" />
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
      <BlockHeader icon={DollarSign} title="Agent CFO" count={items.length > 1 ? items.length : undefined} gradient="bg-gradient-to-r from-emerald-600 to-emerald-500" />
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
      <BlockHeader icon={Cpu} title="Agent CTO" gradient="bg-gradient-to-r from-violet-600 to-violet-500" />
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
      <BlockHeader icon={Megaphone} title="Agent CMO" gradient="bg-gradient-to-r from-pink-600 to-pink-500" />
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
      <BlockHeader icon={Target} title="Agent CSO" gradient="bg-gradient-to-r from-red-600 to-red-500" />
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

/* ============ BLOC OUTIL : Projets Actifs ============ */
function BlocProjets({ onClick, projets }: { onClick?: () => void; projets?: ProjetActif[] }) {
  const items = (projets || []).slice(0, 3);
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={CheckCircle2} title="Projets Actifs" count={projets?.length} gradient="bg-gradient-to-r from-green-600 to-green-500" />
      <ul className="space-y-2.5">
        {items.length > 0 ? items.map((item, i) => (
          <li key={i}>
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-xs text-gray-800 font-medium truncate">{item.nom}</p>
              {item.avancement !== undefined && <span className="text-xs font-bold text-gray-700 shrink-0">{item.avancement}%</span>}
            </div>
            {item.avancement !== undefined && (
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${item.avancement}%` }} />
              </div>
            )}
            <p className="text-[11px] text-gray-400">{item.responsable || ""}{item.deadline ? ` · ${item.deadline}` : ""}</p>
          </li>
        )) : (
          <li className="text-xs text-gray-400">Aucun projet actif</li>
        )}
      </ul>
    </Card>
  );
}

/* ============ BLOC OUTIL : Mon Calendrier ============ */
const MOCK_AGENDA = [
  { heure: "09:00", titre: "Appel stratégique — Équipe direction", type: "reunion" },
  { heure: "11:30", titre: "Revue tableau de bord Q1", type: "analyse" },
  { heure: "14:00", titre: "Rencontre prospect — Groupe Bélanger", type: "vente" },
  { heure: "16:30", titre: "Point hebdo CarlOS", type: "suivi" },
];
function BlocCalendrier({ onClick }: { onClick?: () => void }) {
  const today = new Date();
  const label = today.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" });
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={CalendarDays} title="Mon Calendrier" gradient="bg-gradient-to-r from-cyan-600 to-cyan-500" />
      <p className="text-[10px] text-cyan-600 font-medium mb-2 capitalize">{label}</p>
      <ul className="space-y-1.5">
        {MOCK_AGENDA.map((ev, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-[10px] text-gray-400 w-10 shrink-0 mt-0.5">{ev.heure}</span>
            <span className="text-xs text-gray-700 leading-snug">{ev.titre}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC OUTIL : Mon Pipeline ============ */
function BlocPipeline({ onClick, ventes }: { onClick?: () => void; ventes?: VentesPipeline | null }) {
  const prospects = ventes?.top_prospects?.slice(0, 3) || [];
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-amber-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={TrendingUp} title="Pipeline" gradient="bg-gradient-to-r from-amber-600 to-amber-500" />
      {ventes?.pipeline_total !== undefined && (
        <div className="text-sm font-bold text-gray-800 mb-2">{fmtMoney(ventes.pipeline_total)} total</div>
      )}
      <ul className="space-y-3">
        {prospects.length > 0 ? prospects.map((item, i) => (
          <li key={i}>
            <div className="flex items-center justify-between mb-0.5">
              <div className="min-w-0">
                <p className="text-xs text-gray-800 font-medium truncate">{item.nom}</p>
                <p className="text-[11px] text-gray-400">{item.etape}{item.secteur ? ` · ${item.secteur}` : ""}</p>
              </div>
              <span className="text-xs font-bold text-gray-700 shrink-0">{fmtMoney(item.valeur)}</span>
            </div>
            {item.probabilite !== undefined && (
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${item.probabilite * 100}%` }} />
              </div>
            )}
          </li>
        )) : (
          <li className="text-xs text-gray-400">Aucune donnee pipeline</li>
        )}
      </ul>
    </Card>
  );
}

/* ============ BLOC OUTIL : Infos Industrie ============ */
function BlocInfosIndustrie({ onClick, contexte }: { onClick?: () => void; contexte?: Record<string, unknown> | null }) {
  const items: Array<{ title: string; source: string }> = [];
  if (contexte) {
    if (contexte.marche) items.push({ title: String(contexte.marche).slice(0, 60), source: "Secteur" });
    if (contexte.taille_globale_2025_gusd) items.push({ title: `Marche mondial: ${contexte.taille_globale_2025_gusd}G$ US`, source: `CAGR ${contexte.cagr_pct || "N/A"}` });
    if (Array.isArray(contexte.tendances_majeures)) {
      (contexte.tendances_majeures as string[]).slice(0, 2).forEach(t => {
        items.push({ title: t.split(" — ")[0].slice(0, 50), source: "Tendance" });
      });
    }
  }
  if (items.length === 0) items.push({ title: "Aucune donnee sectorielle", source: "" });
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Newspaper} title="Infos Industrie" gradient="bg-gradient-to-r from-indigo-600 to-indigo-500" />
      <ul className="space-y-2.5">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-800 font-medium">{item.title}</p>
              {item.source && <p className="text-[11px] text-gray-400">{item.source}</p>}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC OUTIL : Stats Operations ============ */
function BlocStatsOps({ onClick, kpi }: { onClick?: () => void; kpi?: Record<string, unknown> }) {
  const items: Array<{ label: string; value: string; trend: "up" | "down" | "stable" }> = [];
  if (kpi) {
    if (kpi.satisfaction_client !== undefined) items.push({ label: "Satisfaction client", value: `${kpi.satisfaction_client}/10`, trend: "up" });
    if (kpi.tickets_support_mois !== undefined) items.push({ label: "Tickets support", value: String(kpi.tickets_support_mois), trend: "stable" });
    if (kpi.processus_documentes_pct !== undefined) items.push({ label: "Processus doc.", value: fmtPct(Number(kpi.processus_documentes_pct)), trend: "up" });
    if (kpi.nb_sites !== undefined) items.push({ label: "Sites", value: Number(kpi.nb_sites).toLocaleString(), trend: "stable" });
    if (kpi.volume_carburant_gallons !== undefined) items.push({ label: "Volume carburant", value: `${(Number(kpi.volume_carburant_gallons) / 1e9).toFixed(1)}G gal`, trend: "stable" });
    if (kpi.programme_efficience) items.push({ label: "Programme", value: String(kpi.programme_efficience).slice(0, 25), trend: "up" });
  }
  if (items.length === 0) items.push({ label: "Operations", value: "—", trend: "stable" });
  const trendColor = { up: "text-green-600", down: "text-red-500", stable: "text-gray-600" };
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-slate-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={BarChart3} title="Operations" gradient="bg-gradient-to-r from-slate-600 to-slate-500" />
      <ul className="space-y-2.5">
        {items.slice(0, 3).map((item, i) => (
          <li key={i} className="flex items-center justify-between">
            <p className="text-xs text-gray-800">{item.label}</p>
            <span className={cn("text-xs font-bold", trendColor[item.trend])}>{item.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ DASHBOARD VIEW ============ */
export function DashboardView() {
  const { setActiveView } = useFrameMaster();
  const { dispatch } = useCanvasActions();
  const [kitData, setKitData] = useState<KitActiveResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getActiveKit()
      .then(data => setKitData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = kitData?.kpis_departements;
  const ventes = kitData?.ventes;
  const projets = kitData?.projets_actifs;
  const contexte = kitData?.contexte_sectoriel;
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 max-w-5xl mx-auto px-5 py-5">

        <CarlOSPresence />

        {/* Row 1 : 5 blocs C-Level — stagger animate-in */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
            <BlocCEO
              onClick={() => { dispatch({ type: "focus", layer: "cerveau", data: { title: "CarlOS — Tour de Contrôle", element_type: "kpi_ceo", data: kpis?.CEO }, bot: "BCO" }); setActiveView("live-chat"); }}
              kpi={kpis?.CEO}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "180ms", animationFillMode: "both" }}>
            <BlocCFO
              onClick={() => { dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent CFO — Finances", element_type: "kpi_cfo", data: kpis?.CFO }, bot: "BCF" }); setActiveView("live-chat"); }}
              kpi={kpis?.CFO}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "260ms", animationFillMode: "both" }}>
            <BlocCTO
              onClick={() => { dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent CTO — Technologie", element_type: "kpi_cto", data: kpis?.CTO }, bot: "BCT" }); setActiveView("live-chat"); }}
              kpi={kpis?.CTO}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "340ms", animationFillMode: "both" }}>
            <BlocCMO
              onClick={() => { dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent CMO — Marketing", element_type: "kpi_cmo", data: kpis?.CMO }, bot: "BCM" }); setActiveView("live-chat"); }}
              kpi={kpis?.CMO}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "420ms", animationFillMode: "both" }}>
            <BlocCSO
              onClick={() => { dispatch({ type: "focus", layer: "cerveau", data: { title: "Agent CSO — Stratégie", element_type: "kpi_cso", data: kpis?.CSO }, bot: "BCS" }); setActiveView("live-chat"); }}
              kpi={kpis?.CSO}
            />
          </div>
        </div>

        {/* Row 2 : 5 blocs outils — stagger animate-in (décalé après row 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "500ms", animationFillMode: "both" }}>
            <BlocProjets
              onClick={() => { dispatch({ type: "focus", layer: "cerveau", data: { title: "Projets Actifs", element_type: "projets", data: projets }, bot: "BCO" }); setActiveView("live-chat"); }}
              projets={projets || undefined}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "580ms", animationFillMode: "both" }}>
            <BlocCalendrier
              onClick={() => { dispatch({ type: "focus", layer: "cerveau", data: { title: "Mon Calendrier", element_type: "calendrier", data: null }, bot: "BCO" }); setActiveView("live-chat"); }}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "660ms", animationFillMode: "both" }}>
            <BlocPipeline
              onClick={() => { dispatch({ type: "focus", layer: "cerveau", data: { title: "Pipeline Ventes", element_type: "pipeline", data: ventes }, bot: "BCO" }); setActiveView("live-chat"); }}
              ventes={ventes}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "740ms", animationFillMode: "both" }}>
            <BlocInfosIndustrie
              onClick={() => { dispatch({ type: "focus", layer: "cerveau", data: { title: "Infos Industrie", element_type: "industrie", data: contexte }, bot: "BCS" }); setActiveView("live-chat"); }}
              contexte={contexte}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: "820ms", animationFillMode: "both" }}>
            <BlocStatsOps
              onClick={() => { dispatch({ type: "focus", layer: "cerveau", data: { title: "Opérations", element_type: "ops", data: kpis?.COO }, bot: "BOO" }); setActiveView("live-chat"); }}
              kpi={kpis?.COO}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
