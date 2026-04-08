/**
 * DepartmentTourDeControle.tsx — Tour de Controle par departement
 * MEME PATTERN que DashboardView (CarlOS) : bandeau proactif + 2 rangees de 5 Cards
 * CEOB (Tactique) = meme structure 10 tabs que les autres bots
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useMemo } from "react";
import { Settings, Stethoscope, Flame, ListChecks, Rocket, Bot, Layers, Inbox, Brain, Search, SortAsc, SortDesc, ChevronDown, Plus, LayoutGrid, List, Columns, Table2, Building2, Target, Shield, TrendingUp, DollarSign, Compass, Database, BookOpen } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useCanvasActions } from "../../context/CanvasActionContext";
import { BOT_SUBTITLE } from "../../api/types";
import { api } from "../../api/client";
import { useTaches, useBureau, useChantiers, useProjets } from "../../api/hooks";
import type { Mission, DiagnosticCatalogue, TemplateDocumentaire, PlaybookSummary } from "../../api/types";
import { PageLayout } from "./layouts/PageLayout";
import { SectionFrame } from "./shared/SectionFrame";
import { PLAYBOOK_TEMPLATES, BOT_INFO, STATUS_CONFIG, CHALEUR_CONFIG } from "./shared/section-config";
import type { TabDef } from "./shared/section-types";
import { HierarchieGHML } from "./shared/HierarchieGHML";
// CatalogueUnifie retire — contenu redistribue dans Chantiers (playbooks), Documents (templates), Sante (diagnostics)
import { DiscussionView } from "./DiscussionView";
import type { NavMode } from "./shared/NavigationToolbar";
// DocumentsView retire — remplace par DocumentsUnifie (meme pattern HierarchieTab)
import { SanteGlobaleView } from "./SanteGlobaleView";
import { TabSommaire, TabObjectifs, HierarchieTab } from "./BlueprintView";
import { AgendaPage } from "./MonBureauView";
import { DocumentsUnifie } from "./shared/DocumentsUnifie";
import { BlueprintDepartement, BlueprintDataRoom, BlueprintPlaybooks, BlueprintConferenceAI, DeptDashboardView } from "./blueprint/BlueprintDepartement";

/* ============ BLOCK HEADER — meme style que DashboardView ============ */
function BlockHeader({ icon: Icon, title, count, gradient }: {
  icon: React.ElementType;
  title: string;
  count?: number;
  gradient: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 px-3 py-2.5", gradient)}>
      <Icon className="h-4 w-4 text-white" />
      <h3 className="text-sm font-bold text-white flex-1">{title}</h3>
      {count !== undefined && (
        <span className="text-xs font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">{count}</span>
      )}
    </div>
  );
}

/* ============ BLOC GENERIQUE — 1 Card avec gradient header + 3 items ============ */
interface BlocItem {
  primary: string;
  secondary: string;
  value?: string;
  valueColor?: string;
  pct?: number;
  pctColor?: string;
}

interface BlocConfig {
  icon: React.ElementType;
  title: string;
  gradient: string;
  ringColor: string;
  count?: number;
  items: BlocItem[];
}

function Bloc({ config, onClick }: { config: BlocConfig; onClick?: () => void }) {
  return (
    <Card className={cn("p-0 overflow-hidden rounded-xl shadow-sm transition-shadow", onClick ? "cursor-pointer hover:shadow-md" : "")} onClick={onClick}>
      <BlockHeader icon={config.icon} title={config.title} count={config.count} gradient={config.gradient} />
      <ul className="px-3 py-3 space-y-2.5">
        {config.items.map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
            {item.pct !== undefined ? (
              <>
                <div className="flex justify-between mb-0.5">
                  <span className="font-medium">{item.primary}</span>
                  <span className="font-bold">{item.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", item.pctColor || "bg-blue-500")} style={{ width: `${item.pct}%` }} />
                </div>
                {item.secondary && <p className="text-[11px] text-gray-400 mt-0.5">{item.secondary}</p>}
              </>
            ) : item.value ? (
              <>
                <div className="flex justify-between">
                  <span className="font-medium">{item.primary}</span>
                  <span className={cn("font-bold", item.valueColor || "text-gray-700")}>{item.value}</span>
                </div>
                <p className="text-[11px] text-gray-400">{item.secondary}</p>
              </>
            ) : (
              <>
                <span className="font-medium">{item.primary}</span>
                {item.secondary && <p className="text-[11px] text-gray-400">{item.secondary}</p>}
              </>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ IMPORTS ICONS ============ */
import {
  DollarSign, PiggyBank, Receipt, TrendingUp, FileText,
  Cpu, Server, Bug, Shield,
  Factory, Cog, BarChart3, CheckCircle2, Wrench,
  Megaphone, Target, Users, Handshake, Lightbulb,
  CalendarDays, Newspaper, Scale, ShieldCheck,
  Gauge, LineChart, Package, ClipboardList,
  GraduationCap, HeartPulse, AlertTriangle, Lock,
  Briefcase, Globe, Zap, Eye, MessageSquare, Sparkles, Upload, Activity, Video,
} from "lucide-react";

/* ============ CONFIGS PAR DEPARTEMENT — 10 blocs chacun ============ */

type DeptTdcConfig = {
  botName: string;
  summary: string;
  row1: BlocConfig[];
  row2: BlocConfig[];
};

/* ============ SECTION HEADER — Pattern Sante (gradient + sub-tabs intégrés) ============ */
interface SubTabDef {
  id: string;
  label: string;
  icon?: React.ElementType;
  gradient: string;
  count?: number;
}

function SectionHeader({ icon: Icon, title, subtitle, tabs, activeTab, onTabChange, gradient }: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  tabs: SubTabDef[];
  activeTab: string;
  onTabChange: (id: string) => void;
  /** Couleur fixe du header (couleur du bot) — si absent, utilise la couleur du sub-tab actif */
  gradient?: string;
}) {
  const currentGradient = gradient || tabs.find(t => t.id === activeTab)?.gradient || tabs[0]?.gradient || "from-blue-600 to-blue-500";
  return (
    <div className={cn("bg-gradient-to-r rounded-xl p-4 transition-all duration-300", currentGradient)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                  activeTab === tab.id
                    ? "bg-white/25 text-white shadow-sm"
                    : "text-white/60 hover:bg-white/10 hover:text-white/80"
                )}
              >
                {TabIcon && <TabIcon className="h-3.5 w-3.5" />}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============ PLAYBOOK GRID — meme pattern que HierarchieTab (search, sort, 4 vues) ============ */
function PlaybookGrid({ playbooks, onFocus, viewMode, setViewMode }: {
  playbooks: PlaybookSummary[];
  onFocus: (label: string, type: string, data: unknown) => void;
  viewMode: "cards" | "list" | "kanban" | "spreadsheet";
  setViewMode: (m: "cards" | "list" | "kanban" | "spreadsheet") => void;
}) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"titre" | "type" | "dept" | "projets">("dept");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showSort, setShowSort] = useState(false);
  const [deptFilter, setDeptFilter] = useState<string | null>(null);

  // Helper: premier bot suggere = departement responsable
  const pbBot = (pb: PlaybookSummary) => (pb.bots_suggeres || [])[0] || "";
  const pbBotLabel = (pb: PlaybookSummary) => BOT_INFO[pbBot(pb)]?.short || pbBot(pb) || "—";
  const pbBotGradient = (pb: PlaybookSummary) => BOT_INFO[pbBot(pb)]?.gradient || "from-indigo-600 to-indigo-500";

  // Departements uniques pour les chips de filtre — ordre C-suite logique
  const CSUITE_ORDER = ["CEOB","CTOB","CFOB","CMOB","CSOB","COOB","CPOB","CHROB","CINOB","CROB","CLOB","CISOB"];
  const deptChips = useMemo(() => {
    const codes = Array.from(new Set(playbooks.map(pbBot).filter(Boolean)));
    return codes
      .sort((a, b) => (CSUITE_ORDER.indexOf(a) === -1 ? 99 : CSUITE_ORDER.indexOf(a)) - (CSUITE_ORDER.indexOf(b) === -1 ? 99 : CSUITE_ORDER.indexOf(b)))
      .map(c => ({ code: c, label: BOT_INFO[c]?.short || c, short: BOT_INFO[c]?.short || c }));
  }, [playbooks]);

  const filtered = useMemo(() => {
    let items = [...playbooks];
    if (deptFilter) items = items.filter(p => pbBot(p) === deptFilter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p => p.titre_template.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.type_chantier?.toLowerCase().includes(q));
    }
    items.sort((a, b) => {
      let cmp = 0;
      if (sortField === "titre") cmp = a.titre_template.localeCompare(b.titre_template);
      else if (sortField === "type") cmp = (a.type_chantier || "").localeCompare(b.type_chantier || "");
      else if (sortField === "dept") cmp = pbBotLabel(a).localeCompare(pbBotLabel(b));
      else if (sortField === "projets") cmp = (a.nb_projets || 0) - (b.nb_projets || 0);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return items;
  }, [playbooks, search, sortField, sortDir, deptFilter]);

  const SORT_OPTS = [
    { field: "dept" as const, label: "Departement" },
    { field: "titre" as const, label: "Nom" },
    { field: "type" as const, label: "Type" },
    { field: "projets" as const, label: "Projets" },
  ];

  const VIEW_MODES = [
    { id: "cards" as const, icon: LayoutGrid },
    { id: "list" as const, icon: List },
    { id: "kanban" as const, icon: Columns },
    { id: "spreadsheet" as const, icon: Table2 },
  ];

  if (playbooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
        <Inbox className="h-6 w-6" />
        <span className="text-xs">Aucun playbook disponible</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Toolbar compact — meme ligne */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input type="text" placeholder="Rechercher playbooks..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white" />
        </div>
        {/* Sort */}
        <div className="relative">
          <button onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1 px-2 py-1.5 text-[9px] font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            {sortDir === "asc" ? <SortAsc className="h-3.5 w-3.5" /> : <SortDesc className="h-3.5 w-3.5" />}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
              {SORT_OPTS.map(opt => (
                <button key={opt.field} onClick={() => { setSortField(opt.field); setSortDir(sortField === opt.field && sortDir === "asc" ? "desc" : "asc"); setShowSort(false); }}
                  className={cn("w-full text-left px-3 py-1.5 text-[9px] font-medium hover:bg-gray-50 transition-colors cursor-pointer", sortField === opt.field ? "text-blue-600 bg-blue-50" : "text-gray-600")}>
                  {opt.label} {sortField === opt.field && (sortDir === "asc" ? "↑" : "↓")}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Dept filter chips */}
        <div className="flex items-center gap-1">
          <button onClick={() => setDeptFilter(null)}
            className={cn("px-2 py-1 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
              !deptFilter ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50")}>
            Tous
          </button>
          {deptChips.map(d => (
            <button key={d.code} onClick={() => setDeptFilter(d.code)}
              className={cn("px-2 py-1 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
                deptFilter === d.code ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50")}>
              {d.label}
            </button>
          ))}
        </div>
        {/* View modes */}
        <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg p-0.5">
          {VIEW_MODES.map(vm => (
            <button key={vm.id} onClick={() => setViewMode(vm.id)}
              className={cn("p-1.5 rounded-md transition-colors cursor-pointer", viewMode === vm.id ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50")}>
              <vm.icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Content — 4 modes */}
      {viewMode === "list" ? (
        <div className="space-y-1">
          {filtered.map(pb => (
            <div key={pb.id} onClick={() => onFocus(`Playbook: ${pb.titre_template}`, "playbook", pb)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
              <Rocket className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span className="text-[9px] font-bold flex-1 truncate">{pb.titre_template}</span>
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold text-white bg-gradient-to-r", pbBotGradient(pb))}>{pbBotLabel(pb)}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">{pb.type_chantier}</span>
              <span className="text-[9px] text-gray-400">{pb.nb_projets} proj. · {pb.nb_missions} miss.</span>
            </div>
          ))}
        </div>
      ) : viewMode === "spreadsheet" ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-[9px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-1.5 font-bold text-gray-500">Nom</th>
                <th className="text-left px-3 py-1.5 font-bold text-gray-500">Dept</th>
                <th className="text-left px-3 py-1.5 font-bold text-gray-500">Type</th>
                <th className="text-center px-3 py-1.5 font-bold text-gray-500">Projets</th>
                <th className="text-center px-3 py-1.5 font-bold text-gray-500">Missions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(pb => (
                <tr key={pb.id} onClick={() => onFocus(`Playbook: ${pb.titre_template}`, "playbook", pb)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-3 py-1.5 font-medium">{pb.titre_template}</td>
                  <td className="px-3 py-1.5"><span className={cn("px-1.5 py-0.5 rounded font-bold text-white bg-gradient-to-r", pbBotGradient(pb))}>{pbBotLabel(pb)}</span></td>
                  <td className="px-3 py-1.5"><span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">{pb.type_chantier}</span></td>
                  <td className="px-3 py-1.5 text-center">{pb.nb_projets}</td>
                  <td className="px-3 py-1.5 text-center">{pb.nb_missions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : viewMode === "kanban" ? (
        /* Kanban par departement (bot) — grid responsive */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {deptChips.map(dept => {
            const deptItems = filtered.filter(p => pbBot(p) === dept.code);
            if (deptItems.length === 0) return null;
            return (
              <div key={dept.code}>
                <div className={cn("text-[9px] font-bold text-white uppercase tracking-wider px-2 py-1.5 rounded-t-lg bg-gradient-to-r", BOT_INFO[dept.code]?.gradient || "from-gray-500 to-gray-400")}>{dept.label}</div>
                <div className="space-y-1.5 border border-gray-200 rounded-b-lg p-2 bg-white">
                  {deptItems.map(pb => (
                    <button key={pb.id} onClick={() => onFocus(`Playbook: ${pb.titre_template}`, "playbook", pb)}
                      className="w-full text-left border rounded-lg p-2 hover:shadow-md transition-all cursor-pointer group">
                      <p className="text-[9px] font-bold text-gray-800 group-hover:text-indigo-600 truncate">{pb.titre_template}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[8px] px-1 py-0.5 rounded bg-indigo-50 text-indigo-600">{pb.type_chantier}</span>
                        <span className="text-[8px] text-gray-400">{pb.nb_projets} proj. · {pb.nb_missions} miss.</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Cards (defaut) */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filtered.map(pb => (
            <div key={pb.id} className="w-full overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all group">
              <div className={cn("px-3 py-2 flex items-center gap-2 bg-gradient-to-r", pbBotGradient(pb))}>
                <Rocket className="h-3.5 w-3.5 text-white shrink-0" />
                <button onClick={() => onFocus(`Playbook: ${pb.titre_template}`, "playbook", pb)}
                  className="text-[9px] font-bold text-white flex-1 truncate text-left cursor-pointer hover:underline">
                  {pb.titre_template}
                </button>
              </div>
              <div className="px-3 py-2">
                {pb.description && <p className="text-[9px] text-gray-400 line-clamp-2 mb-1.5">{pb.description}</p>}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold text-white bg-gradient-to-r", pbBotGradient(pb))}>{pbBotLabel(pb)}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">{pb.type_chantier}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{pb.nb_projets} proj. · {pb.nb_missions} missions</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ TEMPLATE GRID — meme pattern que PlaybookGrid (search, sort, dept filter, 4 vues) ============ */
function TemplateGrid({ templates, onFocus, viewMode, setViewMode }: {
  templates: TemplateDocumentaire[];
  onFocus: (label: string, type: string, data: unknown) => void;
  viewMode: "cards" | "list" | "kanban" | "spreadsheet";
  setViewMode: (m: "cards" | "list" | "kanban" | "spreadsheet") => void;
}) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"titre" | "categorie" | "dept" | "pages">("dept");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showSort, setShowSort] = useState(false);
  const [deptFilter, setDeptFilter] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<string | null>(null);

  const tplBot = (t: TemplateDocumentaire) => t.departement || "";
  const tplBotLabel = (t: TemplateDocumentaire) => BOT_INFO[tplBot(t)]?.short || tplBot(t) || "—";
  const tplBotGradient = (t: TemplateDocumentaire) => BOT_INFO[tplBot(t)]?.gradient || "from-violet-600 to-violet-500";

  const CSUITE_ORDER = ["CEOB","CTOB","CFOB","CMOB","CSOB","COOB","CPOB","CHROB","CINOB","CROB","CLOB","CISOB"];
  const deptChips = useMemo(() => {
    const codes = Array.from(new Set(templates.map(tplBot).filter(Boolean)));
    return codes
      .sort((a, b) => (CSUITE_ORDER.indexOf(a) === -1 ? 99 : CSUITE_ORDER.indexOf(a)) - (CSUITE_ORDER.indexOf(b) === -1 ? 99 : CSUITE_ORDER.indexOf(b)))
      .map(c => ({ code: c, label: BOT_INFO[c]?.short || c }));
  }, [templates]);

  const catChips = useMemo(() => {
    return Array.from(new Set(templates.map(t => t.categorie).filter(Boolean))).sort();
  }, [templates]);

  const filtered = useMemo(() => {
    let items = [...templates];
    if (deptFilter) items = items.filter(t => tplBot(t) === deptFilter);
    if (catFilter) items = items.filter(t => t.categorie === catFilter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(t => t.titre.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.categorie?.toLowerCase().includes(q));
    }
    items.sort((a, b) => {
      let cmp = 0;
      if (sortField === "titre") cmp = a.titre.localeCompare(b.titre);
      else if (sortField === "categorie") cmp = (a.categorie || "").localeCompare(b.categorie || "");
      else if (sortField === "dept") cmp = tplBotLabel(a).localeCompare(tplBotLabel(b));
      else if (sortField === "pages") cmp = parseInt(a.pages_estimees || "0") - parseInt(b.pages_estimees || "0");
      return sortDir === "desc" ? -cmp : cmp;
    });
    return items;
  }, [templates, search, sortField, sortDir, deptFilter, catFilter]);

  const SORT_OPTS = [
    { field: "dept" as const, label: "Departement" },
    { field: "titre" as const, label: "Nom" },
    { field: "categorie" as const, label: "Categorie" },
    { field: "pages" as const, label: "Pages" },
  ];

  const VIEW_MODES = [
    { id: "cards" as const, icon: LayoutGrid },
    { id: "list" as const, icon: List },
    { id: "kanban" as const, icon: Columns },
    { id: "spreadsheet" as const, icon: Table2 },
  ];

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
        <Inbox className="h-6 w-6" />
        <span className="text-xs">Aucun template disponible</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar — meme layout que DocumentsUnifie */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input type="text" placeholder="Rechercher templates..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white" />
        </div>
        <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">{filtered.length} items</span>
        {/* Sort */}
        <div className="relative">
          <button onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1 px-2 py-1.5 text-[9px] font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            {sortDir === "asc" ? <SortAsc className="h-3.5 w-3.5" /> : <SortDesc className="h-3.5 w-3.5" />}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
              {SORT_OPTS.map(opt => (
                <button key={opt.field} onClick={() => { setSortField(opt.field); setSortDir(sortField === opt.field && sortDir === "asc" ? "desc" : "asc"); setShowSort(false); }}
                  className={cn("w-full text-left px-3 py-1.5 text-[9px] font-medium hover:bg-gray-50 transition-colors cursor-pointer", sortField === opt.field ? "text-blue-600 bg-blue-50" : "text-gray-600")}>
                  {opt.label} {sortField === opt.field && (sortDir === "asc" ? "↑" : "↓")}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* View modes */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
          {VIEW_MODES.map(vm => (
            <button key={vm.id} onClick={() => setViewMode(vm.id)}
              className={cn("p-1.5 transition-colors cursor-pointer", viewMode === vm.id ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-gray-600")}>
              <vm.icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Filter pills — Agent sur une ligne, Categorie sur l'autre */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[9px] text-gray-400 font-medium">Agent:</span>
        <button onClick={() => setDeptFilter(null)}
          className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
            !deptFilter ? "bg-violet-600 text-white border-violet-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
          Tous
        </button>
        {deptChips.map(d => (
          <button key={d.code} onClick={() => setDeptFilter(d.code)}
            className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
              deptFilter === d.code ? "bg-violet-600 text-white border-violet-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
            {d.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[9px] text-gray-400 font-medium">Categorie:</span>
        <button onClick={() => setCatFilter(null)}
          className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
            !catFilter ? "bg-amber-600 text-white border-amber-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
          Toutes
        </button>
        {catChips.map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)}
            className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
              catFilter === cat ? "bg-amber-600 text-white border-amber-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
            {cat}
          </button>
        ))}
      </div>

      {/* Content — 4 modes */}
      {viewMode === "list" ? (
        <div className="space-y-1">
          {filtered.map(tpl => (
            <div key={tpl.id} onClick={() => onFocus(`Template: ${tpl.titre}`, "document_editor", { template: tpl, mode: "scratch" })}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
              <FileText className="h-3.5 w-3.5 text-violet-500 shrink-0" />
              <span className="text-[9px] font-bold flex-1 truncate">{tpl.titre}</span>
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold text-white bg-gradient-to-r", tplBotGradient(tpl))}>{tplBotLabel(tpl)}</span>
              {tpl.categorie && <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 font-medium">{tpl.categorie}</span>}
              {tpl.pages_estimees && <span className="text-[9px] text-gray-400">{tpl.pages_estimees} p.</span>}
            </div>
          ))}
        </div>
      ) : viewMode === "spreadsheet" ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-[9px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-1.5 font-bold text-gray-500">Nom</th>
                <th className="text-left px-3 py-1.5 font-bold text-gray-500">Dept</th>
                <th className="text-left px-3 py-1.5 font-bold text-gray-500">Categorie</th>
                <th className="text-center px-3 py-1.5 font-bold text-gray-500">Pages</th>
                <th className="text-left px-3 py-1.5 font-bold text-gray-500">Frequence</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tpl => (
                <tr key={tpl.id} onClick={() => onFocus(`Template: ${tpl.titre}`, "document_editor", { template: tpl, mode: "scratch" })}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-3 py-1.5 font-medium">{tpl.titre}</td>
                  <td className="px-3 py-1.5"><span className={cn("px-1.5 py-0.5 rounded font-bold text-white bg-gradient-to-r", tplBotGradient(tpl))}>{tplBotLabel(tpl)}</span></td>
                  <td className="px-3 py-1.5"><span className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 font-medium">{tpl.categorie}</span></td>
                  <td className="px-3 py-1.5 text-center">{tpl.pages_estimees || "—"}</td>
                  <td className="px-3 py-1.5 text-gray-500">{tpl.frequence || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : viewMode === "kanban" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {deptChips.map(dept => {
            const deptItems = filtered.filter(t => tplBot(t) === dept.code);
            if (deptItems.length === 0) return null;
            return (
              <div key={dept.code}>
                <div className={cn("text-[9px] font-bold text-white uppercase tracking-wider px-2 py-1.5 rounded-t-lg bg-gradient-to-r", BOT_INFO[dept.code]?.gradient || "from-gray-500 to-gray-400")}>{dept.label} ({deptItems.length})</div>
                <div className="space-y-1.5 border border-gray-200 rounded-b-lg p-2 bg-white max-h-[300px] overflow-y-auto">
                  {deptItems.map(tpl => (
                    <button key={tpl.id} onClick={() => onFocus(`Template: ${tpl.titre}`, "document_editor", { template: tpl, mode: "scratch" })}
                      className="w-full text-left border rounded-lg p-2 hover:shadow-md transition-all cursor-pointer group">
                      <p className="text-[9px] font-bold text-gray-800 group-hover:text-violet-600 truncate">{tpl.titre}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {tpl.categorie && <span className="text-[8px] px-1 py-0.5 rounded bg-violet-50 text-violet-600">{tpl.categorie}</span>}
                        {tpl.pages_estimees && <span className="text-[8px] text-gray-400">{tpl.pages_estimees} p.</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Cards (defaut) */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filtered.map(tpl => (
            <div key={tpl.id} className="w-full overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all group">
              <div className={cn("px-3 py-2 flex items-center gap-2 bg-gradient-to-r", tplBotGradient(tpl))}>
                <FileText className="h-3.5 w-3.5 text-white shrink-0" />
                <button onClick={() => onFocus(`Template: ${tpl.titre}`, "document_editor", { template: tpl, mode: "scratch" })}
                  className="text-[9px] font-bold text-white flex-1 truncate text-left cursor-pointer hover:underline">
                  {tpl.titre}
                </button>
              </div>
              <div className="px-3 py-2">
                {tpl.description && <p className="text-[9px] text-gray-400 line-clamp-2 mb-1.5">{tpl.description}</p>}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold text-white bg-gradient-to-r", tplBotGradient(tpl))}>{tplBotLabel(tpl)}</span>
                  {tpl.categorie && <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 font-medium">{tpl.categorie}</span>}
                  {tpl.pages_estimees && <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{tpl.pages_estimees} pages</span>}
                  {tpl.frequence && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{tpl.frequence}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ TABS DEPARTEMENT (11 tabs — structure identique 12 departements) ============ */
type DeptTabId = "cockpit" | "blueprint" | "dataroom" | "playbooks" | "conferenceai" | "sante" | "chantiers" | "projets" | "missions" | "taches" | "discussions" | "documents" | "agenda" | "performance";
const DEPT_TABS: TabDef[] = [
  { id: "cockpit", label: "Vue d'ensemble", icon: Gauge },
  { id: "blueprint", label: "Blueprint", icon: Layers },
  { id: "dataroom", label: "Data Room", icon: Database },
  { id: "playbooks", label: "Playbook Store", icon: BookOpen },
  { id: "conferenceai", label: "Conference AI", icon: Video },
  { id: "sante", label: "Sante", icon: HeartPulse },
  { id: "chantiers", label: "Chantiers", icon: Flame },
  { id: "projets", label: "Projets", icon: Package },
  { id: "missions", label: "Missions", icon: ListChecks },
  { id: "taches", label: "Taches", icon: CheckCircle2 },
  { id: "discussions", label: "Discussions", icon: MessageSquare },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "performance", label: "Performance AI", icon: Bot },
];

const DEPT_HEADER_GRADIENT: Record<string, string> = {
  CEOB: "from-blue-700 to-blue-500",
  CFOB: "from-emerald-600 to-emerald-500",
  CTOB: "from-violet-600 to-violet-500",
  CPOB: "from-slate-700 to-slate-600",
  COOB: "from-orange-600 to-orange-500",
  CROB: "from-amber-600 to-amber-500",
  CMOB: "from-pink-600 to-pink-500",
  CSOB: "from-red-600 to-red-500",
  CHROB: "from-teal-600 to-teal-500",
  CISOB: "from-zinc-700 to-zinc-600",
  CLOB: "from-indigo-600 to-indigo-500",
  CINOB: "from-rose-600 to-rose-500",
};

/* Icon par departement pour le header gradient */
const DEPT_ICON: Record<string, React.ElementType> = {
  CEOB: Zap, CFOB: DollarSign, CTOB: Cpu, CPOB: Factory, COOB: Settings,
  CROB: TrendingUp, CMOB: Megaphone, CSOB: Target, CHROB: Users,
  CISOB: ShieldCheck, CLOB: Scale, CINOB: Lightbulb,
};

/* Mapping bot code → department key for diagnostics */
const BOT_TO_DEPT: Record<string, string> = {
  CEOB: "direction", CTOB: "technologie", CFOB: "finance", CMOB: "marketing",
  CSOB: "strategie", COOB: "operations", CPOB: "production", CHROB: "rh",
  CINOB: "innovation", CROB: "ventes", CLOB: "legal", CISOB: "securite",
};

const DEPT_TDC: Record<string, DeptTdcConfig> = {

  /* --- FINANCE (CFOB) --- */
  CFOB: {
    botName: "Agent CFO",
    summary: "Cash flow positif +34K$. 2 factures en retard (14K$). Marge brute a 42% — au-dessus de la cible.",
    row1: [
      { icon: DollarSign, title: "Tresorerie", gradient: "bg-gradient-to-r from-emerald-700 to-emerald-600", ringColor: "hover:ring-emerald-300", count: 2, items: [
        { primary: "Cash flow mensuel", value: "+34K$", valueColor: "text-emerald-600", secondary: "Positif 3e mois consecutif" },
        { primary: "Comptes recevables", value: "82K$", secondary: "12 factures ouvertes" },
        { primary: "Reserves disponibles", value: "145K$", secondary: "6 mois de runway" },
      ]},
      { icon: PiggyBank, title: "Budget", gradient: "bg-gradient-to-r from-emerald-600 to-emerald-500", ringColor: "hover:ring-emerald-300", items: [
        { primary: "Budget Q1 utilise", pct: 68, pctColor: "bg-emerald-500", secondary: "Sur la cible" },
        { primary: "Marketing +15% depassement", secondary: "Alerte envoyee au CMO" },
        { primary: "Investissements R&D", value: "22K$", secondary: "Approuve — en cours" },
      ]},
      { icon: Receipt, title: "Facturation", gradient: "bg-gradient-to-r from-emerald-500 to-teal-500", ringColor: "hover:ring-teal-300", count: 2, items: [
        { primary: "MetalPro inc.", value: "8K$", valueColor: "text-red-500", secondary: "Retard 45 jours" },
        { primary: "AcierPlus", value: "6K$", valueColor: "text-red-500", secondary: "Retard 30 jours" },
        { primary: "TechnoSoud", value: "15K$", valueColor: "text-emerald-600", secondary: "Paye hier" },
      ]},
      { icon: TrendingUp, title: "Rentabilite", gradient: "bg-gradient-to-r from-teal-600 to-teal-500", ringColor: "hover:ring-teal-300", items: [
        { primary: "Marge brute", value: "42%", valueColor: "text-emerald-600", secondary: "Cible 40% — depasse" },
        { primary: "EBITDA", value: "18%", secondary: "Stable vs Q4" },
        { primary: "Cout acquisition client", value: "2.4K$", secondary: "En baisse de 12%" },
      ]},
      { icon: FileText, title: "Rapports", gradient: "bg-gradient-to-r from-teal-500 to-cyan-500", ringColor: "hover:ring-cyan-300", count: 1, items: [
        { primary: "Rapport mensuel fevrier", secondary: "A approuver · Soumis aujourd'hui" },
        { primary: "Previsions Q2", secondary: "En preparation par Agent CFO" },
        { primary: "Audit annuel 2025", secondary: "Complete — archive" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Finance", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 2, items: [
        { primary: "Approuver rapport mensuel", secondary: "Agent CFO · Aujourd'hui" },
        { primary: "Relancer MetalPro (8K$)", secondary: "Retard 45 jours · Urgent" },
        { primary: "Reviser budget marketing", secondary: "Depassement 15% · 3 mars" },
      ]},
      { icon: CalendarDays, title: "Agenda Finance", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Cloture mensuelle", secondary: "28 fevrier" },
        { primary: "Revue budget Q2 (CFO)", secondary: "3 mars · 13:00" },
        { primary: "Rencontre comptable", secondary: "5 mars · 10:00" },
      ]},
      { icon: LineChart, title: "Indicateurs", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "DSO (delai encaissement)", value: "38 jours", secondary: "Cible: 30 jours" },
        { primary: "Ratio courant", value: "2.1x", valueColor: "text-emerald-600", secondary: "Sain" },
        { primary: "Burn rate mensuel", value: "24K$", secondary: "Stable" },
      ]},
      { icon: Newspaper, title: "Veille Finance", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Taux directeur maintenu a 4.25%", secondary: "Banque du Canada · Hier" },
        { primary: "Credit d'impot RS&DE 2026", secondary: "Revenu Quebec · 3 jours" },
        { primary: "Programme BDC pour PME", secondary: "BDC · Cette semaine" },
      ]},
      { icon: BarChart3, title: "Benchmarks", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Marge industrie mfg", value: "35-40%", secondary: "Vous: 42% — au-dessus" },
        { primary: "DSO industrie", value: "42 jours", secondary: "Vous: 38 — mieux" },
        { primary: "Ratio dette/equite", value: "1.2x", secondary: "Vous: 0.8x — sain" },
      ]},
    ],
  },

  /* --- TECHNOLOGIE (CTOB) --- */
  CTOB: {
    botName: "Agent CTO",
    summary: "Sprint A a 85%. 0 bug bloquant. Deploy V1 prevu vendredi. 535 tests OK.",
    row1: [
      { icon: Cpu, title: "Sprint Actif", gradient: "bg-gradient-to-r from-violet-700 to-violet-600", ringColor: "hover:ring-violet-300", items: [
        { primary: "Sprint A — Interface Web", pct: 85, pctColor: "bg-violet-500", secondary: "Livraison vendredi" },
        { primary: "12 endpoints API REST", secondary: "Tous fonctionnels" },
        { primary: "535 tests passent", value: "98%", valueColor: "text-green-600", secondary: "3 pre-existants en echec" },
      ]},
      { icon: Server, title: "Infrastructure", gradient: "bg-gradient-to-r from-violet-600 to-violet-500", ringColor: "hover:ring-violet-300", items: [
        { primary: "VPS OVH", value: "99.9%", valueColor: "text-green-600", secondary: "Uptime 30 jours" },
        { primary: "PostgreSQL", value: "OK", valueColor: "text-green-600", secondary: "5 modeles · 127.0.0.1:5432" },
        { primary: "CPU / RAM", value: "23%", secondary: "Charge normale" },
      ]},
      { icon: Bug, title: "Bugs", gradient: "bg-gradient-to-r from-violet-500 to-purple-500", ringColor: "hover:ring-purple-300", items: [
        { primary: "Bugs critiques", value: "0", valueColor: "text-green-600", secondary: "3 resolus cette semaine" },
        { primary: "Bugs mineurs", value: "4", secondary: "Non-bloquants" },
        { primary: "Google OAuth", secondary: "Casse — sprint dedie requis" },
      ]},
      { icon: Shield, title: "Securite", gradient: "bg-gradient-to-r from-purple-600 to-purple-500", ringColor: "hover:ring-purple-300", items: [
        { primary: "Derniere analyse", secondary: "Il y a 2 jours · 0 critique" },
        { primary: "Dependances a jour", pct: 92, pctColor: "bg-purple-500", secondary: "3 mises a jour mineures" },
        { primary: "API Keys", value: "OK", valueColor: "text-green-600", secondary: "Rotation prevue Q2" },
      ]},
      { icon: Settings, title: "DevOps", gradient: "bg-gradient-to-r from-purple-500 to-fuchsia-500", ringColor: "hover:ring-fuchsia-300", items: [
        { primary: "Dernier deploy", secondary: "Aujourd'hui 16:15 · OK" },
        { primary: "Backup auto", value: "OK", valueColor: "text-green-600", secondary: "Quotidien 03:00" },
        { primary: "Monitoring", secondary: "systemd + journalctl actif" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Tech", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 3, items: [
        { primary: "Finaliser Interface V1", secondary: "Sprint A · Vendredi" },
        { primary: "Ajouter tests HealthView", secondary: "Agent CTO · Cette semaine" },
        { primary: "Corriger CORS API", secondary: "Fait aujourd'hui" },
      ]},
      { icon: CalendarDays, title: "Agenda Tech", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Demo Interface V1", secondary: "Vendredi · 14:00" },
        { primary: "Sprint B planning", secondary: "3 mars · 09:00" },
        { primary: "Review securite", secondary: "7 mars · 10:00" },
      ]},
      { icon: TrendingUp, title: "Metriques", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Cout API/jour", value: "1.20$", secondary: "Budget 5$ — en-dessous" },
        { primary: "Latence moyenne", value: "340ms", secondary: "T1-T2 · acceptable" },
        { primary: "Requetes/jour", value: "847", secondary: "+22% vs semaine derniere" },
      ]},
      { icon: Newspaper, title: "Veille Tech", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Claude 4.6 disponible", secondary: "Anthropic · Cette semaine" },
        { primary: "Vite 6.4 release candidate", secondary: "Vitejs · 3 jours" },
        { primary: "FastAPI 0.115 security fix", secondary: "Tiangolo · Hier" },
      ]},
      { icon: BarChart3, title: "Stack Score", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Couverture tests", value: "92%", valueColor: "text-green-600", secondary: "535/580 tests" },
        { primary: "Dette technique", value: "Faible", valueColor: "text-green-600", secondary: "Refactoring planifie Sprint B" },
        { primary: "Temps de deploy", value: "45s", secondary: "deploy.sh → systemd" },
      ]},
    ],
  },

  /* --- PRODUCTION (CPOB) --- */
  CPOB: {
    botName: "Agent Production",
    summary: "Ligne A a 94% capacite. 1 maintenance preventive prevue. Stock matiere a 78%.",
    row1: [
      { icon: Factory, title: "Lignes Production", gradient: "bg-gradient-to-r from-slate-700 to-slate-600", ringColor: "hover:ring-slate-300", items: [
        { primary: "Ligne A — Assemblage", pct: 94, pctColor: "bg-slate-500", secondary: "Capacite nominale" },
        { primary: "Ligne B — Usinage", pct: 82, pctColor: "bg-slate-500", secondary: "1 poste vacant" },
        { primary: "Ligne C — Finition", pct: 88, pctColor: "bg-slate-500", secondary: "OK" },
      ]},
      { icon: Gauge, title: "Qualite", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Taux de rejet", value: "1.2%", valueColor: "text-green-600", secondary: "Cible <2% — atteint" },
        { primary: "Non-conformites", value: "3", secondary: "2 mineures, 1 en cours" },
        { primary: "Audits planifies", secondary: "ISO 9001 — avril" },
      ]},
      { icon: Wrench, title: "Maintenance", gradient: "bg-gradient-to-r from-gray-600 to-gray-500", ringColor: "hover:ring-gray-300", count: 1, items: [
        { primary: "Preventive Ligne A", secondary: "Planifiee 3 mars · 4h" },
        { primary: "CNC #4 — revision", secondary: "Completee hier" },
        { primary: "Prochain arret planifie", secondary: "15 mars · Fin de semaine" },
      ]},
      { icon: Package, title: "Inventaire", gradient: "bg-gradient-to-r from-gray-500 to-zinc-500", ringColor: "hover:ring-zinc-300", items: [
        { primary: "Stock matiere premiere", pct: 78, pctColor: "bg-amber-500", secondary: "Commander avant 5 mars" },
        { primary: "Pieces de rechange", value: "OK", valueColor: "text-green-600", secondary: "Stock suffisant" },
        { primary: "Produits finis", value: "124", secondary: "En attente d'expedition" },
      ]},
      { icon: ClipboardList, title: "Commandes", gradient: "bg-gradient-to-r from-zinc-600 to-zinc-500", ringColor: "hover:ring-zinc-300", count: 3, items: [
        { primary: "MetalPro — Lot 2026-A", secondary: "En production · Livraison 7 mars" },
        { primary: "TechnoSoud — Composants", secondary: "Planifie · Debut 4 mars" },
        { primary: "AcierQC — Structures", secondary: "File d'attente · 10 mars" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Prod", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 2, items: [
        { primary: "Planifier maintenance Ligne A", secondary: "Agent Production · 3 mars" },
        { primary: "Commander matiere premiere", secondary: "Seuil 78% — urgent" },
        { primary: "Former operateur poste B2", secondary: "RH · Cette semaine" },
      ]},
      { icon: CalendarDays, title: "Agenda Prod", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Revue production hebdo", secondary: "Lundi · 08:00" },
        { primary: "Maintenance Ligne A", secondary: "3 mars · 06:00-10:00" },
        { primary: "Livraison MetalPro", secondary: "7 mars" },
      ]},
      { icon: TrendingUp, title: "KPIs Prod", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "OEE global", value: "87%", valueColor: "text-green-600", secondary: "Cible 85% — depasse" },
        { primary: "Temps de cycle moyen", value: "12.4 min", secondary: "Stable" },
        { primary: "Pieces/heure", value: "48", secondary: "+3% vs mois dernier" },
      ]},
      { icon: Newspaper, title: "Veille Prod", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Hausse acier Q1: +8%", secondary: "Metal Bulletin · Cette semaine" },
        { primary: "Subvention automatisation PME", secondary: "MEI Quebec · Nouveau" },
        { primary: "Norme CSA W47.1 mise a jour", secondary: "CSA Group · Fevrier" },
      ]},
      { icon: BarChart3, title: "Benchmarks Prod", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "OEE industrie mfg", value: "82%", secondary: "Vous: 87% — superieur" },
        { primary: "Taux rejet industrie", value: "2-3%", secondary: "Vous: 1.2% — excellent" },
        { primary: "Delai livraison", value: "10-15j", secondary: "Vous: 8j — rapide" },
      ]},
    ],
  },

  /* --- OPERATION (COOB) --- */
  COOB: {
    botName: "Agent COO",
    summary: "5 alertes operationnelles. Logistique fluide. 3 processus en optimisation.",
    row1: [
      { icon: Settings, title: "Operations", gradient: "bg-gradient-to-r from-orange-700 to-orange-600", ringColor: "hover:ring-orange-300", count: 5, items: [
        { primary: "Efficacite globale", pct: 91, pctColor: "bg-orange-500", secondary: "Cible 90% — atteint" },
        { primary: "Temps d'arret non planifie", value: "2.1h", secondary: "Ce mois — acceptable" },
        { primary: "Satisfaction interne", value: "4.2/5", secondary: "Sondage mensuel" },
      ]},
      { icon: Package, title: "Logistique", gradient: "bg-gradient-to-r from-orange-600 to-orange-500", ringColor: "hover:ring-orange-300", items: [
        { primary: "Expeditions en cours", value: "8", secondary: "3 aujourd'hui" },
        { primary: "Delai moyen livraison", value: "4.2 jours", valueColor: "text-green-600", secondary: "Cible: 5 jours" },
        { primary: "Retours/reclamations", value: "0.8%", valueColor: "text-green-600", secondary: "Excellent" },
      ]},
      { icon: ClipboardList, title: "Processus", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Automatisation reception", pct: 65, pctColor: "bg-amber-500", secondary: "En cours d'implantation" },
        { primary: "Lean manufacturing", secondary: "3 chantiers actifs · Kaizen" },
        { primary: "5S — zone usinage", secondary: "Audit prevu 10 mars" },
      ]},
      { icon: Handshake, title: "Fournisseurs", gradient: "bg-gradient-to-r from-amber-500 to-yellow-500", ringColor: "hover:ring-yellow-300", items: [
        { primary: "Fournisseurs actifs", value: "24", secondary: "3 en evaluation" },
        { primary: "AcierPro — delai", secondary: "Conforme · 98% on-time" },
        { primary: "Nouveau: TechMetal QC", secondary: "Evaluation en cours" },
      ]},
      { icon: Gauge, title: "Performance", gradient: "bg-gradient-to-r from-yellow-600 to-yellow-500", ringColor: "hover:ring-yellow-300", items: [
        { primary: "Cout par unite", value: "12.30$", secondary: "Cible 13$ — en-dessous" },
        { primary: "Taux utilisation equip.", value: "88%", secondary: "Stable" },
        { primary: "Productivite/employe", value: "+4%", valueColor: "text-green-600", secondary: "vs Q4 2025" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Ops", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 3, items: [
        { primary: "Finaliser chantier Lean #2", secondary: "Agent COO · Cette semaine" },
        { primary: "Evaluer TechMetal QC", secondary: "Nouveau fournisseur · 5 mars" },
        { primary: "Audit 5S zone usinage", secondary: "Planifie 10 mars" },
      ]},
      { icon: CalendarDays, title: "Agenda Ops", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Standup operations", secondary: "Quotidien · 08:30" },
        { primary: "Revue fournisseurs", secondary: "5 mars · 14:00" },
        { primary: "Audit 5S", secondary: "10 mars · 09:00" },
      ]},
      { icon: TrendingUp, title: "KPIs Ops", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "OTIF (on-time in-full)", value: "96%", valueColor: "text-green-600", secondary: "Cible 95%" },
        { primary: "Couts logistique", value: "-3%", valueColor: "text-green-600", secondary: "vs budget" },
        { primary: "Inventaire turns", value: "8.2x", secondary: "Industrie: 6x" },
      ]},
      { icon: Newspaper, title: "Veille Ops", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Tarifs transport +5% Q2", secondary: "Trans-Canada · Prevision" },
        { primary: "Norme ISO 45001 update", secondary: "ISO · Fevrier 2026" },
        { primary: "Subvention efficacite energetique", secondary: "Hydro-Quebec · Actif" },
      ]},
      { icon: BarChart3, title: "Benchmarks Ops", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "OTIF industrie", value: "92%", secondary: "Vous: 96% — excellent" },
        { primary: "Cout logistique/CA", value: "8-12%", secondary: "Vous: 7% — optimal" },
        { primary: "Rotation stock", value: "6x", secondary: "Vous: 8.2x — superieur" },
      ]},
    ],
  },

  /* --- VENTE (CROB) --- */
  CROB: {
    botName: "Agent CRO",
    summary: "Pipeline a 475K$. 2 deals en negociation. Taux closing a 32% — au-dessus de la cible.",
    row1: [
      { icon: TrendingUp, title: "Pipeline", gradient: "bg-gradient-to-r from-amber-700 to-amber-600", ringColor: "hover:ring-amber-300", items: [
        { primary: "Pipeline total", value: "475K$", valueColor: "text-amber-600", secondary: "+12% MoM" },
        { primary: "MetalPro v2 — Soumission", value: "125K$", secondary: "75% probabilite" },
        { primary: "TechnoSoud — Nego", value: "210K$", secondary: "60% probabilite" },
      ]},
      { icon: Users, title: "Leads", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", count: 5, items: [
        { primary: "Nouveaux leads ce mois", value: "23", secondary: "+8 vs mois dernier" },
        { primary: "Leads qualifies (SQL)", value: "12", secondary: "52% taux qualification" },
        { primary: "Source #1: referral REAI", value: "40%", secondary: "Reseau manufacturier" },
      ]},
      { icon: Handshake, title: "Deals Actifs", gradient: "bg-gradient-to-r from-orange-600 to-orange-500", ringColor: "hover:ring-orange-300", items: [
        { primary: "En negociation", value: "4", secondary: "Valeur: 380K$" },
        { primary: "Soumissions envoyees", value: "3", secondary: "Valeur: 195K$" },
        { primary: "Closing prevu Q1", value: "2", secondary: "MetalPro + AcierQC" },
      ]},
      { icon: Target, title: "Objectifs", gradient: "bg-gradient-to-r from-orange-500 to-red-500", ringColor: "hover:ring-red-300", items: [
        { primary: "CA mensuel", pct: 78, pctColor: "bg-amber-500", secondary: "78K$ / 100K$ cible" },
        { primary: "Taux closing", value: "32%", valueColor: "text-green-600", secondary: "Cible 28% — depasse" },
        { primary: "Valeur moyenne deal", value: "42K$", secondary: "+15% vs 2025" },
      ]},
      { icon: DollarSign, title: "Revenus", gradient: "bg-gradient-to-r from-red-600 to-red-500", ringColor: "hover:ring-red-300", items: [
        { primary: "CA cumule Q1", value: "215K$", secondary: "Cible Q1: 300K$" },
        { primary: "Recurrence (MRR)", value: "18K$", valueColor: "text-green-600", secondary: "6 contrats actifs" },
        { primary: "Revenue +12% MoM", secondary: "Tendance positive" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Vente", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 2, items: [
        { primary: "Relancer MetalPro soumission", secondary: "Agent CRO · Aujourd'hui" },
        { primary: "Preparer demo TechnoSoud", secondary: "Jeudi · 10:00" },
        { primary: "Qualifier lead AlumiPlus", secondary: "Nouveau · Cette semaine" },
      ]},
      { icon: CalendarDays, title: "Agenda Vente", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Call MetalPro — soumission", secondary: "Aujourd'hui · 10:30" },
        { primary: "Demo TechnoSoud", secondary: "Jeudi · 14:00" },
        { primary: "Revue pipeline hebdo", secondary: "Vendredi · 09:00" },
      ]},
      { icon: LineChart, title: "Metriques Vente", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Cycle de vente moyen", value: "45 jours", secondary: "Industrie: 60 jours" },
        { primary: "Ratio lead → client", value: "18%", secondary: "En hausse" },
        { primary: "Retention clients", value: "94%", valueColor: "text-green-600", secondary: "Excellent" },
      ]},
      { icon: Newspaper, title: "Veille Vente", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Programme PARI pour PME mfg", secondary: "CNRC · Nouveau" },
        { primary: "Salon MACH 2026 — exposants", secondary: "Avril · Montreal" },
        { primary: "Tendance automatisation +22%", secondary: "McKinsey · Q1 2026" },
      ]},
      { icon: BarChart3, title: "Benchmarks Vente", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Taux closing industrie", value: "25%", secondary: "Vous: 32% — superieur" },
        { primary: "Cycle vente B2B mfg", value: "60-90j", secondary: "Vous: 45j — rapide" },
        { primary: "CAC industrie", value: "3-5K$", secondary: "Vous: 2.4K$ — efficient" },
      ]},
    ],
  },

  /* --- MARKETING (CMOB) --- */
  CMOB: {
    botName: "Agent CMO",
    summary: "1.2K leads generes. Taux conversion 3.8%. Campagne Q1 prete au lancement.",
    row1: [
      { icon: Megaphone, title: "Campagnes", gradient: "bg-gradient-to-r from-pink-700 to-pink-600", ringColor: "hover:ring-pink-300", items: [
        { primary: "Campagne Q1 — IA Mfg", pct: 95, pctColor: "bg-pink-500", secondary: "Lancement 3 mars" },
        { primary: "Email nurturing", value: "28%", secondary: "Taux d'ouverture" },
        { primary: "Budget depense", value: "12K$", secondary: "Sur 15K$ alloue" },
      ]},
      { icon: Globe, title: "Digital", gradient: "bg-gradient-to-r from-pink-600 to-pink-500", ringColor: "hover:ring-pink-300", items: [
        { primary: "Visites site web", value: "4.2K", secondary: "+22% ce mois" },
        { primary: "LinkedIn followers", value: "1.8K", secondary: "+120 ce mois" },
        { primary: "SEO — mots-cles top 10", value: "18", secondary: "+3 vs mois dernier" },
      ]},
      { icon: Users, title: "Leads", gradient: "bg-gradient-to-r from-rose-600 to-rose-500", ringColor: "hover:ring-rose-300", count: 12, items: [
        { primary: "Leads total ce mois", value: "1.2K", valueColor: "text-pink-600", secondary: "+18% vs Q4" },
        { primary: "MQL (marketing qualified)", value: "340", secondary: "28% du total" },
        { primary: "Transferes aux ventes", value: "45", secondary: "Ce mois" },
      ]},
      { icon: Eye, title: "Marque", gradient: "bg-gradient-to-r from-rose-500 to-red-500", ringColor: "hover:ring-red-300", items: [
        { primary: "Notoriete assistee", value: "34%", secondary: "Sondage Q1 — +8pts" },
        { primary: "NPS (promoteurs)", value: "72", valueColor: "text-green-600", secondary: "Excellent" },
        { primary: "Mentions presse", value: "5", secondary: "Les Affaires, BDC, MEI" },
      ]},
      { icon: Lightbulb, title: "Contenu", gradient: "bg-gradient-to-r from-red-600 to-red-500", ringColor: "hover:ring-red-300", items: [
        { primary: "Articles publies", value: "8", secondary: "Blog + LinkedIn" },
        { primary: "Etude de cas MetalPro", secondary: "En redaction · 80%" },
        { primary: "Video demo produit", secondary: "Tournage prevu 10 mars" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Mktg", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 2, items: [
        { primary: "Valider brief campagne Q2", secondary: "Agent CMO · 3 mars" },
        { primary: "Approuver etude de cas", secondary: "MetalPro · Cette semaine" },
        { primary: "Brief video demo", secondary: "Tournage 10 mars" },
      ]},
      { icon: CalendarDays, title: "Agenda Mktg", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Lancement campagne Q1", secondary: "3 mars" },
        { primary: "Revue contenu hebdo", secondary: "Mercredi · 10:00" },
        { primary: "Tournage video", secondary: "10 mars · 13:00" },
      ]},
      { icon: LineChart, title: "Metriques Mktg", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Cout par lead (CPL)", value: "12$", secondary: "Cible 15$ — optimal" },
        { primary: "Taux conversion", value: "3.8%", secondary: "Cible 4% — presque" },
        { primary: "ROI marketing", value: "4.2x", valueColor: "text-green-600", secondary: "Excellent" },
      ]},
      { icon: Newspaper, title: "Veille Mktg", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "LinkedIn B2B: reach organique -15%", secondary: "Social Media Today · Hier" },
        { primary: "IA generative pour contenu B2B", secondary: "HubSpot · Cette semaine" },
        { primary: "Salon MACH 2026 — stand dispo", secondary: "Avril · Montreal" },
      ]},
      { icon: BarChart3, title: "Benchmarks Mktg", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "CPL industrie B2B", value: "25-50$", secondary: "Vous: 12$ — tres bon" },
        { primary: "Taux conversion B2B", value: "2-3%", secondary: "Vous: 3.8% — superieur" },
        { primary: "ROI moyen mktg", value: "3x", secondary: "Vous: 4.2x — excellent" },
      ]},
    ],
  },

  /* --- STRATEGIE (CSOB) --- */
  CSOB: {
    botName: "Agent CSO",
    summary: "Plan strategique 2026 valide. 2 pivots en cours. Prochaine revue le 5 mars.",
    row1: [
      { icon: Target, title: "Plan Strategique", gradient: "bg-gradient-to-r from-red-700 to-red-600", ringColor: "hover:ring-red-300", items: [
        { primary: "Plan 2026 — valide", secondary: "Approuve par le CA · Janvier" },
        { primary: "3 axes prioritaires", secondary: "IA Mfg · Orbit9 · International" },
        { primary: "Revue trimestrielle", secondary: "Prochaine: 5 mars" },
      ]},
      { icon: Lightbulb, title: "Pivots", gradient: "bg-gradient-to-r from-red-600 to-red-500", ringColor: "hover:ring-red-300", count: 2, items: [
        { primary: "Pivot #1 — IA manufacturiere", secondary: "En cours · Traction forte" },
        { primary: "Pivot #2 — Reseau Orbit9", secondary: "Phase exploration · 5 mars" },
        { primary: "Pivot #3 — International", secondary: "Q3 2026 · En planification" },
      ]},
      { icon: Eye, title: "Veille Concurrentielle", gradient: "bg-gradient-to-r from-rose-600 to-rose-500", ringColor: "hover:ring-rose-300", items: [
        { primary: "3 concurrents directs", secondary: "MfgAI, AutoFab, SmartShop" },
        { primary: "Avantage distinctif", secondary: "GHML + Orbit9 = unique" },
        { primary: "Part de marche QC", value: "~8%", secondary: "Cible 15% en 2027" },
      ]},
      { icon: Handshake, title: "Partenariats", gradient: "bg-gradient-to-r from-rose-500 to-pink-500", ringColor: "hover:ring-pink-300", items: [
        { primary: "REAI — 130+ manufacturiers", secondary: "Reseau actif · Source leads #1" },
        { primary: "BDC — programme PME", secondary: "En discussion · Financement" },
        { primary: "CDPQ — potentiel", secondary: "Premier contact Q2" },
      ]},
      { icon: Globe, title: "Expansion", gradient: "bg-gradient-to-r from-pink-600 to-pink-500", ringColor: "hover:ring-pink-300", items: [
        { primary: "Ontario — phase pilote", secondary: "Q3 2026 · 5 prospects" },
        { primary: "USA — exploration", secondary: "2027 · Midwest manufacturing" },
        { primary: "Europe — pas avant 2028", secondary: "Focus Canada d'abord" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Strat.", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 2, items: [
        { primary: "Preparer revue trimestrielle", secondary: "Agent CSO · 5 mars" },
        { primary: "Analyser pivot Orbit9", secondary: "Potentiel reseau · En cours" },
        { primary: "Benchmark concurrents Q1", secondary: "MfgAI update · Cette semaine" },
      ]},
      { icon: CalendarDays, title: "Agenda Strat.", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Revue strategique Q1", secondary: "5 mars · 09:00" },
        { primary: "Board meeting", secondary: "15 mars · 14:00" },
        { primary: "Session Orbit9", secondary: "20 mars · 10:00" },
      ]},
      { icon: LineChart, title: "KPIs Strat.", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Croissance CA YoY", value: "+24%", valueColor: "text-green-600", secondary: "Cible +20%" },
        { primary: "Nouveaux marches", value: "2", secondary: "IA Mfg + Orbit9" },
        { primary: "Satisfaction client", value: "NPS 72", valueColor: "text-green-600", secondary: "Top quartile" },
      ]},
      { icon: Newspaper, title: "Veille Strat.", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "IA mfg: marche 12B$ en 2028", secondary: "McKinsey · Janvier 2026" },
        { primary: "PME QC: 68% veulent automatiser", secondary: "STIQ · Sondage 2026" },
        { primary: "Politique IA du Quebec", secondary: "MESI · En consultation" },
      ]},
      { icon: BarChart3, title: "Benchmarks Strat.", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Croissance SaaS B2B", value: "20-30%", secondary: "Vous: 24% — dans la norme" },
        { primary: "Retention nette (NRR)", value: "110%+", secondary: "Cible a atteindre" },
        { primary: "LTV/CAC ratio", value: "3x+", secondary: "Vous: 4.8x — excellent" },
      ]},
    ],
  },

  /* --- RH (CHROB) --- */
  CHROB: {
    botName: "Agent CHRO",
    summary: "1 embauche a confirmer. Climat social bon (4.2/5). Formation IA planifiee.",
    row1: [
      { icon: Users, title: "Effectifs", gradient: "bg-gradient-to-r from-teal-700 to-teal-600", ringColor: "hover:ring-teal-300", items: [
        { primary: "Employes actifs", value: "47", secondary: "3 temps partiel" },
        { primary: "Taux roulement", value: "8%", valueColor: "text-green-600", secondary: "Industrie: 15% — excellent" },
        { primary: "Postes ouverts", value: "2", secondary: "Operateur CNC + Dev" },
      ]},
      { icon: GraduationCap, title: "Formation", gradient: "bg-gradient-to-r from-teal-600 to-teal-500", ringColor: "hover:ring-teal-300", items: [
        { primary: "Formation IA pour equipe", secondary: "Planifiee 12 mars · 20 places" },
        { primary: "Heures formation/employe", value: "18h", secondary: "Cible 20h/an" },
        { primary: "Programme mentorat", secondary: "6 paires actives" },
      ]},
      { icon: HeartPulse, title: "Climat Social", gradient: "bg-gradient-to-r from-emerald-600 to-emerald-500", ringColor: "hover:ring-emerald-300", items: [
        { primary: "Score engagement", value: "4.2/5", valueColor: "text-green-600", secondary: "Sondage fevrier" },
        { primary: "Absenteisme", value: "3.1%", secondary: "Industrie: 5% — bon" },
        { primary: "Grievances ouvertes", value: "0", valueColor: "text-green-600", secondary: "Aucune" },
      ]},
      { icon: DollarSign, title: "Remuneration", gradient: "bg-gradient-to-r from-emerald-500 to-green-500", ringColor: "hover:ring-green-300", items: [
        { primary: "Masse salariale mensuelle", value: "185K$", secondary: "Budget: 190K$" },
        { primary: "Salaire moyen", value: "52K$", secondary: "Competitif region" },
        { primary: "Avantages sociaux", value: "18%", secondary: "Du salaire — standard" },
      ]},
      { icon: ClipboardList, title: "Recrutement", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 1, items: [
        { primary: "Operateur CNC senior", secondary: "3 candidats · Entrevues en cours" },
        { primary: "Developpeur Full-Stack", secondary: "Affiche · 12 candidatures" },
        { primary: "Delai embauche moyen", value: "28 jours", secondary: "Industrie: 35 jours" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches RH", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 1, items: [
        { primary: "Confirmer embauche CNC", secondary: "Agent CHRO · Cette semaine" },
        { primary: "Organiser formation IA", secondary: "12 mars · Logistique" },
        { primary: "Revue salariale annuelle", secondary: "Planifiee avril" },
      ]},
      { icon: CalendarDays, title: "Agenda RH", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Entrevue CNC — candidat #2", secondary: "Jeudi · 10:00" },
        { primary: "Formation IA equipe", secondary: "12 mars · 09:00-16:00" },
        { primary: "Comite sante-securite", secondary: "15 mars · 13:00" },
      ]},
      { icon: LineChart, title: "KPIs RH", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Temps moyen embauche", value: "28j", secondary: "Cible: 30j — atteint" },
        { primary: "Taux retention 1 an", value: "92%", valueColor: "text-green-600", secondary: "Excellent" },
        { primary: "Satisfaction onboarding", value: "4.5/5", secondary: "Nouveau process" },
      ]},
      { icon: Newspaper, title: "Veille RH", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Salaire minimum QC +0.50$", secondary: "CNESST · Mai 2026" },
        { primary: "Penurie main-d'oeuvre mfg", secondary: "STIQ · Toujours critique" },
        { primary: "Loi 96 — formation francais", secondary: "OQLF · En vigueur" },
      ]},
      { icon: BarChart3, title: "Benchmarks RH", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Roulement industrie mfg", value: "15%", secondary: "Vous: 8% — superieur" },
        { primary: "Engagement moyen", value: "3.6/5", secondary: "Vous: 4.2 — au-dessus" },
        { primary: "Formation/employe", value: "12h", secondary: "Vous: 18h — bon" },
      ]},
    ],
  },

  /* --- SECURITE (CISOB) --- */
  CISOB: {
    botName: "Agent Securite",
    summary: "4 alertes actives. 1 tentative suspecte detectee. Conformite a 94%.",
    row1: [
      { icon: ShieldCheck, title: "Etat Securite", gradient: "bg-gradient-to-r from-zinc-800 to-zinc-700", ringColor: "hover:ring-zinc-300", count: 4, items: [
        { primary: "Score securite global", pct: 94, pctColor: "bg-green-500", secondary: "Cible 95% — presque" },
        { primary: "Alertes actives", value: "4", valueColor: "text-red-500", secondary: "1 critique, 3 warning" },
        { primary: "Derniere analyse", secondary: "Aujourd'hui · 06:00" },
      ]},
      { icon: AlertTriangle, title: "Menaces", gradient: "bg-gradient-to-r from-zinc-700 to-zinc-600", ringColor: "hover:ring-zinc-300", count: 1, items: [
        { primary: "Tentative connexion suspecte", secondary: "IP 185.x.x.x · Il y a 12 min" },
        { primary: "Scan de ports detecte", secondary: "Bloque · Hier 23:45" },
        { primary: "Phishing email bloque", secondary: "3 employes cibles · Ce matin" },
      ]},
      { icon: Lock, title: "Acces", gradient: "bg-gradient-to-r from-gray-700 to-gray-600", ringColor: "hover:ring-gray-300", items: [
        { primary: "Comptes actifs", value: "52", secondary: "47 employes + 5 services" },
        { primary: "MFA active", value: "96%", valueColor: "text-green-600", secondary: "2 comptes sans MFA" },
        { primary: "Derniere revue acces", secondary: "15 fevrier · OK" },
      ]},
      { icon: Shield, title: "Conformite", gradient: "bg-gradient-to-r from-gray-600 to-gray-500", ringColor: "hover:ring-gray-300", items: [
        { primary: "Loi 25 (vie privee)", pct: 92, pctColor: "bg-blue-500", secondary: "2 items restants" },
        { primary: "ISO 27001", secondary: "En preparation · Q3 2026" },
        { primary: "Politique securite", secondary: "Mise a jour fevrier — OK" },
      ]},
      { icon: Server, title: "Infrastructure", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Firewall", value: "OK", valueColor: "text-green-600", secondary: "Regles a jour" },
        { primary: "Backup chiffre", value: "OK", valueColor: "text-green-600", secondary: "Quotidien 03:00" },
        { primary: "SSL/TLS", secondary: "Certificats valides · Exp. juin" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Securite", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 3, items: [
        { primary: "Investiguer connexion suspecte", secondary: "Sentinel · Urgent" },
        { primary: "Activer MFA sur 2 comptes", secondary: "Agent Securite · Cette semaine" },
        { primary: "Finaliser plan Loi 25", secondary: "2 items restants · 10 mars" },
      ]},
      { icon: CalendarDays, title: "Agenda Securite", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Test de penetration", secondary: "7 mars · Externe" },
        { primary: "Formation phishing equipe", secondary: "12 mars · 14:00" },
        { primary: "Revue politique securite", secondary: "1er avril" },
      ]},
      { icon: LineChart, title: "KPIs Securite", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Temps reponse incident", value: "< 15 min", valueColor: "text-green-600", secondary: "Cible: 30 min" },
        { primary: "Faux positifs", value: "12%", secondary: "En baisse — ML ajuste" },
        { primary: "Uptime securite", value: "99.97%", valueColor: "text-green-600", secondary: "SLA respecte" },
      ]},
      { icon: Newspaper, title: "Veille Securite", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Ransomware ciblant PME mfg", secondary: "CCCS · Alerte cette semaine" },
        { primary: "Faille critique Node.js", secondary: "CVE-2026-xxxx · Patchee" },
        { primary: "Guide NIST pour PME", secondary: "NIST · Mise a jour Q1" },
      ]},
      { icon: BarChart3, title: "Benchmarks Sec.", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Incidents/an PME mfg", value: "3-5", secondary: "Vous: 1 — excellent" },
        { primary: "Budget sec. / CA", value: "3-5%", secondary: "Vous: 4% — adequat" },
        { primary: "MFA adoption", value: "78%", secondary: "Vous: 96% — superieur" },
      ]},
    ],
  },

  /* --- LEGAL (CLOB) --- */
  CLOB: {
    botName: "Agent Legal",
    summary: "3 contrats en attente de signature. 0 litige actif. Conformite Loi 25 a 92%.",
    row1: [
      { icon: Scale, title: "Contrats", gradient: "bg-gradient-to-r from-indigo-700 to-indigo-600", ringColor: "hover:ring-indigo-300", count: 3, items: [
        { primary: "MetalPro — renouvellement", secondary: "A signer · Valeur 125K$" },
        { primary: "TechnoSoud — nouveau", secondary: "Revue juridique en cours" },
        { primary: "Bail entrepot #2", secondary: "Negociation · Exp. juin" },
      ]},
      { icon: Shield, title: "Conformite", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Loi 25 — vie privee", pct: 92, pctColor: "bg-indigo-500", secondary: "2 items restants" },
        { primary: "Normes du travail", value: "OK", valueColor: "text-green-600", secondary: "Conforme" },
        { primary: "Licences logicielles", value: "OK", valueColor: "text-green-600", secondary: "Toutes a jour" },
      ]},
      { icon: FileText, title: "Propriete Intel.", gradient: "bg-gradient-to-r from-blue-600 to-blue-500", ringColor: "hover:ring-blue-300", items: [
        { primary: "GHML — marque deposee", secondary: "Enregistree OPIC · 2025" },
        { primary: "CarlOS — brevet pending", secondary: "Soumis · En examen" },
        { primary: "Orbit9 — marque", secondary: "A deposer · Q2 2026" },
      ]},
      { icon: AlertTriangle, title: "Litiges", gradient: "bg-gradient-to-r from-blue-500 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Litiges actifs", value: "0", valueColor: "text-green-600", secondary: "Aucun en cours" },
        { primary: "Dernier regle", secondary: "Fournisseur ABC · Sept 2025" },
        { primary: "Provision litiges", value: "15K$", secondary: "Reserve prudente" },
      ]},
      { icon: ClipboardList, title: "Reglementaire", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Declarations annuelles", value: "OK", valueColor: "text-green-600", secondary: "REQ + ARC" },
        { primary: "Assurances", secondary: "Renouvellement avril · A revoir" },
        { primary: "Politique IA interne", secondary: "A rediger · Q2 2026" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Legal", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 3, items: [
        { primary: "Signer contrat MetalPro", secondary: "Agent Legal · Urgent" },
        { primary: "Reviser contrat TechnoSoud", secondary: "En cours · Cette semaine" },
        { primary: "Deposer marque Orbit9", secondary: "Q2 2026 · A planifier" },
      ]},
      { icon: CalendarDays, title: "Agenda Legal", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Signature MetalPro", secondary: "3 mars · Notaire" },
        { primary: "Revue assurances", secondary: "15 mars · Courtier" },
        { primary: "Echeance bail entrepot", secondary: "Juin 2026 · A negocier" },
      ]},
      { icon: LineChart, title: "KPIs Legal", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Contrats signes Q1", value: "8", secondary: "Cible 10" },
        { primary: "Delai moyen signature", value: "12 jours", secondary: "En amelioration" },
        { primary: "Couts juridiques", value: "4.2K$", secondary: "Ce mois — dans le budget" },
      ]},
      { icon: Newspaper, title: "Veille Legal", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Loi 25 — guide pratique PME", secondary: "CAI Quebec · Fevrier" },
        { primary: "Reforme droit du travail QC", secondary: "Projet de loi · En etude" },
        { primary: "IA et responsabilite legale", secondary: "Barreau QC · Webinaire" },
      ]},
      { icon: BarChart3, title: "Benchmarks Legal", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Couts juridiques PME", value: "3-8K$/mois", secondary: "Vous: 4.2K$ — raisonnable" },
        { primary: "Litiges/an PME", value: "1-2", secondary: "Vous: 0 — excellent" },
        { primary: "Conformite Loi 25", value: "~60%", secondary: "Vous: 92% — avance" },
      ]},
    ],
  },

  /* --- INNOVATION (CINOB — Inès / CINO) --- */
  CINOB: {
    botName: "Agent CINO",
    summary: "3 projets R&D actifs. 1 brevet en examen. Prototype IA vision en test.",
    row1: [
      { icon: Lightbulb, title: "Projets R&D", gradient: "bg-gradient-to-r from-fuchsia-700 to-fuchsia-600", ringColor: "hover:ring-fuchsia-300", count: 3, items: [
        { primary: "IA Vision qualite", pct: 72, pctColor: "bg-fuchsia-500", secondary: "Prototype en test · Ligne A" },
        { primary: "Orbit9 — moteur reseau", pct: 45, pctColor: "bg-fuchsia-500", secondary: "Sprint B · Architecture" },
        { primary: "Bot-to-Bot protocol", pct: 20, pctColor: "bg-fuchsia-500", secondary: "Sprint D · Exploration" },
      ]},
      { icon: Zap, title: "Prototypes", gradient: "bg-gradient-to-r from-fuchsia-600 to-fuchsia-500", ringColor: "hover:ring-fuchsia-300", items: [
        { primary: "IA Vision — camera test", secondary: "Ligne A · Detection defauts 94%" },
        { primary: "Chatbot multi-agent", secondary: "Interface V1 · Fonctionnel" },
        { primary: "Voice AI (ElevenLabs)", secondary: "Sprint B · Planifie" },
      ]},
      { icon: FileText, title: "Brevets & PI", gradient: "bg-gradient-to-r from-purple-600 to-purple-500", ringColor: "hover:ring-purple-300", items: [
        { primary: "GHML — brevet pending", secondary: "OPIC · En examen" },
        { primary: "Trisociation — a deposer", secondary: "Q2 2026 · Agent Legal" },
        { primary: "Publications tech", value: "2", secondary: "Blog + conference" },
      ]},
      { icon: Globe, title: "Veille Innovation", gradient: "bg-gradient-to-r from-purple-500 to-violet-500", ringColor: "hover:ring-violet-300", items: [
        { primary: "IA generative pour mfg", secondary: "Tendance forte · +40% adoption" },
        { primary: "Digital twin manufacturing", secondary: "En emergence · A explorer" },
        { primary: "Edge AI sur machines", secondary: "Cout en baisse · Opportunite" },
      ]},
      { icon: TrendingUp, title: "Roadmap Produit", gradient: "bg-gradient-to-r from-violet-600 to-violet-500", ringColor: "hover:ring-violet-300", items: [
        { primary: "Sprint A — Interface Web", secondary: "En cours · Fin 3 mars" },
        { primary: "Sprint B — Voice + Demo", secondary: "3-14 mars" },
        { primary: "Sprint C — Onboarding", secondary: "14-28 mars" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Innov.", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 2, items: [
        { primary: "Evaluer resultats IA Vision", secondary: "Agent CPO · Cette semaine" },
        { primary: "Planifier Sprint B", secondary: "3 mars · Avec Agent CTO" },
        { primary: "Deposer brevet Trisociation", secondary: "Q2 2026 · Agent Legal" },
      ]},
      { icon: CalendarDays, title: "Agenda Innov.", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Demo IA Vision", secondary: "Vendredi · 14:00" },
        { primary: "Sprint B kickoff", secondary: "3 mars · 09:00" },
        { primary: "Conf IA manufacturiere", secondary: "22 mars · Montreal" },
      ]},
      { icon: LineChart, title: "KPIs Innov.", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Budget R&D", value: "22K$", secondary: "Ce mois · Budget: 25K$" },
        { primary: "Time to prototype", value: "3 sem.", secondary: "En amelioration" },
        { primary: "Ideas pipeline", value: "14", secondary: "3 priorisees" },
      ]},
      { icon: Newspaper, title: "Veille R&D", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Claude 4.6 — multimodal avance", secondary: "Anthropic · Cette semaine" },
        { primary: "Computer vision pour QC", secondary: "Landing AI · Nouveau produit" },
        { primary: "ElevenLabs — voice cloning", secondary: "Pricing PME · A evaluer" },
      ]},
      { icon: BarChart3, title: "Benchmarks R&D", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "R&D / CA industrie", value: "3-5%", secondary: "Vous: 7% — investissement fort" },
        { primary: "Time to market", value: "6-12 mois", secondary: "Vous: 5 sem sprint — rapide" },
        { primary: "Brevets PME tech", value: "0-1", secondary: "Vous: 1 + 1 pending" },
      ]},
    ],
  },

  /* --- DIRECTION (CEOB) --- */
  CEOB: {
    botName: "CarlOS — Direction",
    summary: "CEO Bot — Chef d'orchestre de la GhostX Team. Consultez CarlOS pour activer vos KPIs.",
    row1: [
      { icon: Zap, title: "Pilotage Strategique", gradient: "bg-gradient-to-r from-blue-700 to-blue-600", ringColor: "hover:ring-blue-300", items: [
        { primary: "Decisions actives", value: "0", secondary: "Parlez a CarlOS pour decider" },
        { primary: "Chantiers en cours", value: "0", secondary: "Creez un chantier pour commencer" },
        { primary: "Bots actifs", value: "12", valueColor: "text-blue-600", secondary: "Ghost Team complete" },
      ]},
      { icon: Target, title: "Objectifs CEO", gradient: "bg-gradient-to-r from-blue-600 to-blue-500", ringColor: "hover:ring-blue-300", items: [
        { primary: "Vision & roadmap", secondary: "Discutez avec CarlOS" },
        { primary: "Objectif trimestre", secondary: "Lancez un diagnostic VITAA" },
        { primary: "Prochaine etape", secondary: "Completez votre profil" },
      ]},
      { icon: Shield, title: "Gouvernance", gradient: "bg-gradient-to-r from-blue-500 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Protocole CREDO", value: "Actif", valueColor: "text-green-600", secondary: "5 phases operationnelles" },
        { primary: "Protocole COMMAND", value: "Actif", valueColor: "text-green-600", secondary: "Multi-domaine" },
        { primary: "Decision Log", value: "Pret", valueColor: "text-blue-600", secondary: "Capture automatique" },
      ]},
      { icon: BarChart3, title: "KPIs Entreprise", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Revenus", value: "—", secondary: "Lancez un diagnostic" },
        { primary: "Pipeline ventes", value: "—", secondary: "Renseignez votre profil" },
        { primary: "Marge brute", value: "—", secondary: "Completez le questionnaire" },
      ]},
      { icon: Globe, title: "Reseau & Expansion", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Contacts Orbit9", value: "0", secondary: "Explorez le reseau" },
        { primary: "Cellules actives", value: "0", secondary: "Lancez un jumelage" },
        { primary: "Opportunites", value: "0", secondary: "Le matching s'active avec le diagnostic" },
      ]},
    ],
    row2: [
      { icon: MessageSquare, title: "Communication", gradient: "bg-gradient-to-r from-blue-600 to-blue-500", ringColor: "hover:ring-blue-300", items: [
        { primary: "Chat CarlOS", value: "Pret", valueColor: "text-green-600", secondary: "Texte + vocal + video" },
        { primary: "Ghost Team", value: "12 bots", secondary: "Multi-perspectives actif" },
        { primary: "Documents", value: "Pret", valueColor: "text-green-600", secondary: "Templates + generation AI" },
      ]},
      { icon: ClipboardList, title: "Missions", gradient: "bg-gradient-to-r from-violet-600 to-violet-500", ringColor: "hover:ring-violet-300", items: [
        { primary: "Missions actives", value: "0", secondary: "Creez depuis le Pipeline" },
        { primary: "Missions completees", value: "0", secondary: "Suivez vos progres" },
        { primary: "Taches en cours", value: "0", secondary: "Assignez a votre equipe" },
      ]},
      { icon: HeartPulse, title: "Sante", gradient: "bg-gradient-to-r from-rose-600 to-rose-500", ringColor: "hover:ring-rose-300", items: [
        { primary: "Score VITAA", value: "—", secondary: "Lancez un diagnostic" },
        { primary: "Triangle du Feu", value: "—", secondary: "Lancez un diagnostic" },
        { primary: "Derniere analyse", value: "—", secondary: "Aucune" },
      ]},
      { icon: Eye, title: "Veille", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Alertes sectorielles", value: "0", secondary: "Actif apres le diagnostic" },
        { primary: "Veille concurrentielle", secondary: "Alimentee par CarlOS" },
        { primary: "Tendances industrie", secondary: "Demandez a CarlOS" },
      ]},
      { icon: GraduationCap, title: "Intelligence", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Diagnostics", value: "5 disponibles", secondary: "Sante Globale > Diagnostics" },
        { primary: "Recommandations AI", secondary: "Generees apres diagnostic" },
        { primary: "Apprentissage continu", secondary: "CarlOS evolue avec vous" },
      ]},
    ],
  },
};

/* ============ SA8 — SPECS TECHNIQUES & ROI PAR BOT ============ */
const BOT_CAPACITES: Record<string, {
  equivHumain: string; coutHumain: string;
  tachesCount: number; heuresMois: string;
  exemples: string[];
}> = {
  CEOB: { equivHumain: "CEO conseil / Coach executif", coutHumain: "100-200K$", tachesCount: 15, heuresMois: "80-120h", exemples: ["Preparation CA", "Decisions strategiques", "Vision & roadmap", "Gestion parties prenantes"] },
  CFOB: { equivHumain: "CFO fractionnaire", coutHumain: "150-250K$", tachesCount: 18, heuresMois: "100-160h", exemples: ["Budget annuel", "Analyse ROI projets", "Tresorerie", "Subventions & financement"] },
  CTOB: { equivHumain: "CTO fractionnaire", coutHumain: "150-300K$", tachesCount: 16, heuresMois: "120-180h", exemples: ["Architecture techno", "Selection fournisseurs", "Cybersecurite", "Automatisation"] },
  CMOB: { equivHumain: "Directeur marketing", coutHumain: "120-200K$", tachesCount: 14, heuresMois: "100-160h", exemples: ["Strategie marketing", "Generation leads", "Positionnement", "Campagnes"] },
  CSOB: { equivHumain: "Consultant strategie", coutHumain: "120-200K$", tachesCount: 12, heuresMois: "80-120h", exemples: ["Analyse concurrentielle", "Plan strategique", "Diversification", "M&A screening"] },
  COOB: { equivHumain: "Directeur operations", coutHumain: "120-200K$", tachesCount: 15, heuresMois: "120-200h", exemples: ["Optimisation processus", "Gestion qualite", "Lean manufacturing", "Chaine d'approvisionnement"] },
  CPOB: { equivHumain: "Directeur usine", coutHumain: "100-180K$", tachesCount: 30, heuresMois: "120-200h", exemples: ["Monitoring TRS machines", "Suivi maintenance GMAO", "Alertes SST", "Rapports production"] },
  CHROB: { equivHumain: "VP Ressources humaines", coutHumain: "100-180K$", tachesCount: 25, heuresMois: "80-140h", exemples: ["Sondages engagement", "Suivi formation", "Rapports roulement", "Screening CV"] },
  CINOB: { equivHumain: "VP Innovation / R&D", coutHumain: "120-200K$", tachesCount: 20, heuresMois: "80-120h", exemples: ["Veille technologique", "Gestion portfolio PI", "Rapports R&D", "Benchmark innovation"] },
  CROB: { equivHumain: "VP Ventes / Revenus", coutHumain: "120-200K$", tachesCount: 25, heuresMois: "100-160h", exemples: ["Suivi pipeline ventes", "Forecasting", "Rapports performance reps", "Scoring leads"] },
  CLOB: { equivHumain: "Directeur juridique", coutHumain: "120-200K$", tachesCount: 20, heuresMois: "60-100h", exemples: ["Suivi contrats", "Alertes conformite", "Gestion registre Loi 25", "Veille reglementaire"] },
  CISOB: { equivHumain: "Directeur cybersecurite", coutHumain: "120-200K$", tachesCount: 20, heuresMois: "80-140h", exemples: ["Monitoring cybersecurite", "Alertes vulnerabilites", "Rapports conformite SOC2/NIST", "Tests automatises"] },
};

/* ============ TRISOCIATION DATA — 3 OS combines par bot ============ */
const BOT_TRISOCIATION: Record<string, { primaire: string; calibrateur: string; amplificateur: string }> = {
  CEOB: { primaire: "Bezos (Vision)", calibrateur: "Munger (Judgement)", amplificateur: "Churchill (Leadership)" },
  CTOB: { primaire: "Musk (Execution)", calibrateur: "Curie (Methode)", amplificateur: "Vinci (Invention)" },
  CFOB: { primaire: "Buffett (Valeur)", calibrateur: "Munger (Rationalite)", amplificateur: "Franklin (Discipline)" },
  CMOB: { primaire: "Disney (Storytelling)", calibrateur: "Jobs/Blakely (Branding)", amplificateur: "Oprah (Influence)" },
  CSOB: { primaire: "Sun Tzu (Strategie)", calibrateur: "Thiel (Contrarian)", amplificateur: "Chanel (Disruption)" },
  COOB: { primaire: "Marc Aurele (Stoicisme)", calibrateur: "Deming (Qualite)", amplificateur: "Nightingale (Systemes)" },
  CPOB: { primaire: "Tesla (Innovation)", calibrateur: "Deming (Processus)", amplificateur: "Ford (Echelle)" },
  CHROB: { primaire: "Oprah (Empathie)", calibrateur: "Maslow (Besoins)", amplificateur: "Drucker (Organisation)" },
  CINOB: { primaire: "Curie (Recherche)", calibrateur: "Vinci (Creation)", amplificateur: "Tesla (Futurisme)" },
  CROB: { primaire: "Jobs (Persuasion)", calibrateur: "Bezos (Obsession client)", amplificateur: "Buffett (Patience)" },
  CLOB: { primaire: "Franklin (Prudence)", calibrateur: "Marc Aurele (Ethique)", amplificateur: "Sun Tzu (Protection)" },
  CISOB: { primaire: "Sun Tzu (Defense)", calibrateur: "Musk (Resilience)", amplificateur: "Curie (Precision)" },
};

/* ============ PERFORMANCE AI — SUB-SECTIONS ============ */
type PerfSubTab = "info" | "performance" | "roles" | "composition" | "reglages";
const PERF_SUB_TABS: { id: PerfSubTab; label: string }[] = [
  { id: "info", label: "Info" },
  { id: "performance", label: "Performance" },
  { id: "roles", label: "Roles & Permissions" },
  { id: "composition", label: "Composition" },
  { id: "reglages", label: "Réglages" },
];

function PerformanceAIContent({ activeBotCode, subtitle, DeptIcon, headerGradient, stats, collaborators, botChantiers }: {
  activeBotCode: string;
  subtitle: string;
  DeptIcon: React.ElementType;
  headerGradient: string;
  stats: Record<string, number>;
  collaborators: string[];
  botChantiers: any[];
}) {
  const [subTab, setSubTab] = useState<PerfSubTab>("info");
  const cap = BOT_CAPACITES[activeBotCode];
  const tri = BOT_TRISOCIATION[activeBotCode];

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-50 p-1 rounded-lg overflow-x-auto">
        {PERF_SUB_TABS.map(st => (
          <button
            key={st.id}
            onClick={() => setSubTab(st.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
              subTab === st.id ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Sub-tab: Info */}
      {subTab === "info" && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r text-white", BOT_INFO[activeBotCode]?.gradient || "from-gray-500 to-gray-400")}>
                <DeptIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">{BOT_INFO[activeBotCode]?.label || activeBotCode} — {BOT_INFO[activeBotCode]?.short || ""}</h3>
                <p className="text-[9px] text-gray-500">{subtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-800">{stats.chantiers}</p>
                <p className="text-[9px] text-gray-500">Chantiers</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-800">{stats.projets}</p>
                <p className="text-[9px] text-gray-500">Projets</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-800">{stats.docs + stats.playbooks + stats.diags}</p>
                <p className="text-[9px] text-gray-500">Catalogue</p>
              </div>
            </div>
          </Card>
          {/* Collaborators */}
          <Card className="p-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Equipe de collaboration</h3>
            {collaborators.length === 0 ? (
              <p className="text-[9px] text-gray-400 text-center py-4">Aucun collaborateur identifie</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {collaborators.map(code => {
                  const info = BOT_INFO[code];
                  const CollabIcon = DEPT_ICON[code];
                  const shared = botChantiers.filter((ch: any) => (ch.bot_codes || []).includes(code)).length;
                  return (
                    <div key={code} className="flex items-center gap-2.5 p-2.5 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r text-white shrink-0", info?.gradient || "from-gray-500 to-gray-400")}>
                        {CollabIcon ? <CollabIcon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{info?.label || code}</p>
                        <p className="text-[9px] text-gray-500">{info?.short || ""} · {shared} chantier{shared > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Sub-tab: Performance */}
      {subTab === "performance" && cap && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-700 to-purple-600 px-4 py-2.5 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-white" />
              <span className="text-xs font-bold text-white">Specs Techniques & ROI</span>
              <span className="ml-auto text-[9px] bg-white/20 text-white/80 px-2 py-0.5 rounded-full">
                {cap.tachesCount} taches automatisees
              </span>
            </div>
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center">
                  <Users className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-gray-800">{cap.equivHumain}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Equivalent humain</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
                  <DollarSign className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                  <div className="text-lg font-extrabold text-gray-800">{cap.coutHumain}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Cout humain/an</div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
                  <CalendarDays className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                  <div className="text-lg font-extrabold text-gray-800">{cap.heuresMois}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Heures/mois</div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-2">
                <div className="text-[9px] font-semibold text-gray-600 mb-1.5">Taches automatisees ({cap.tachesCount})</div>
                <div className="flex flex-wrap gap-1.5">
                  {cap.exemples.map((ex, i) => (
                    <span key={i} className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-full font-medium">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
          {/* Chantiers partages */}
          <Card className="p-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Chantiers avec cette equipe</h3>
            <div className="space-y-2">
              {botChantiers.map((ch: any) => (
                <div key={ch.id} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-[9px] font-bold text-gray-400">#{ch.id}</span>
                  <span className="text-xs text-gray-700 flex-1 truncate">{ch.titre}</span>
                  <div className="flex gap-1">
                    {(ch.bot_codes || []).map((b: string) => (
                      <span key={b} className={cn("text-[9px] px-1.5 py-0.5 rounded text-white", b === activeBotCode ? "bg-blue-600" : "bg-gray-400")}>
                        {BOT_INFO[b]?.short || b}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Sub-tab: Roles & Permissions */}
      {subTab === "roles" && (
        <Card className="p-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Roles & Permissions — {BOT_INFO[activeBotCode]?.short || activeBotCode}</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
              <span className="text-xs text-gray-700">Lire et analyser les donnees de son departement</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
              <span className="text-xs text-gray-700">Creer et mettre a jour des missions et taches</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
              <span className="text-xs text-gray-700">Generer des rapports et diagnostics</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
              <span className="text-xs text-gray-700">Collaborer avec les autres bots C-Level</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
              <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="text-xs text-gray-700">Decisions strategiques — necessite validation CEO</span>
            </div>
          </div>
        </Card>
      )}

      {/* Sub-tab: Composition (Trisociation) */}
      {subTab === "composition" && tri && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className={cn("px-4 py-2.5 bg-gradient-to-r", headerGradient)}>
              <span className="text-xs font-bold text-white">Trisociation — 3 OS combines</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">P</div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Primaire</p>
                  <p className="text-[11px] text-gray-600">{tri.primaire}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-violet-50 border border-violet-100 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">C</div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Calibrateur</p>
                  <p className="text-[11px] text-gray-600">{tri.calibrateur}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">A</div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Amplificateur</p>
                  <p className="text-[11px] text-gray-600">{tri.amplificateur}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Sub-tab: Reglages */}
      {subTab === "reglages" && (
        <Card className="p-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Reglages — {BOT_INFO[activeBotCode]?.short || activeBotCode}</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-700">Voix</span>
              <span className="text-xs font-medium text-gray-900">ElevenLabs — {BOT_INFO[activeBotCode]?.short || activeBotCode}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-700">Comportement</span>
              <span className="text-xs font-medium text-gray-900">Proactif</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-700">Personnalite</span>
              <span className="text-xs font-medium text-gray-900">SOUL template actif</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-700">Mode reflexion prefere</span>
              <span className="text-xs font-medium text-gray-900">CREDO (par defaut)</span>
            </div>
          </div>
          <p className="text-[9px] text-gray-400 text-center">Configuration avancee disponible prochainement</p>
        </Card>
      )}
    </div>
  );
}

/* ============ COMPOSANT PRINCIPAL ============ */
export function DepartmentTourDeControle() {
  const { activeBotCode, activeBot, setActiveView, activeDeptTab, navigateDeptTab } = useFrameMaster();
  const { dispatch } = useCanvasActions();
  const deptTab = activeDeptTab as DeptTabId;
  const setDeptTab = navigateDeptTab;
  const [hierViewMode, setHierViewMode] = useState<"cards" | "list" | "kanban" | "spreadsheet">("cards");
  const [tplViewMode, setTplViewMode] = useState<"cards" | "list" | "kanban" | "spreadsheet">("cards");
  const [hierParentFilter, setHierParentFilter] = useState<{ type: string; id: number; titre: string } | null>(null);
  // Sub-tab state for sections with SectionHeader pattern
  const [blueprintSub, setBlueprintSub] = useState("profil");
  const [chantiersSub, setChantiersSub] = useState("tous");
  const [projetsSub, setProjetsSub] = useState("tous");
  const [missionsSub, setMissionsSub] = useState("tous");
  const [tachesSub, setTachesSub] = useState("tous");
  const [discSub, setDiscSub] = useState("tous");
  const [docsSub, setDocsSub] = useState("tous");
  const [santeSub, setSanteSub] = useState("vue-ensemble");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticCatalogue[]>([]);
  const [templates, setTemplates] = useState<TemplateDocumentaire[]>([]);
  const [apiPlaybooks, setApiPlaybooks] = useState<PlaybookSummary[]>([]);
  const { taches } = useTaches();
  const { items: bureauItems } = useBureau();

  // Load data for Missions / Documents / Diagnostics / Playbooks tabs
  // Note: deptTab reset to "cockpit" is handled by navigateToDepartment in context
  useEffect(() => {
    const deptKey = BOT_TO_DEPT[activeBotCode] || "";
    api.listMissions().then(r => {
      const all = r.missions || [];
      // CEO (CEOB) voit TOUTES les missions — les autres bots voient seulement les leurs
      setMissions(activeBotCode === "CEOB" ? all : all.filter(m => m.bot_primaire === activeBotCode));
    }).catch(() => {});
    api.listDiagnosticsEnrichis(deptKey).then(d => setDiagnostics(d || [])).catch(() => {});
    // CEO (CEOB) voit TOUS les templates — les autres bots voient les leurs
    const templateFilter = activeBotCode === "CEOB" ? undefined : activeBotCode;
    api.listTemplatesDocumentaires(templateFilter).then(t => setTemplates(t || [])).catch(() => {});
    api.listPlaybooks().then(pbs => {
      // Filtrer par bot sauf CEOB qui voit tout
      const filtered = activeBotCode === "CEOB" ? pbs : pbs.filter(p => p.bots_suggeres?.includes(activeBotCode));
      setApiPlaybooks(filtered || []);
    }).catch(() => {});
  }, [activeBotCode]);

  // API data — chantiers et projets filtrés par bot
  const { chantiers: allChantiers } = useChantiers();
  const { projets: allProjets } = useProjets();
  // CEO (CEOB) voit TOUT — les autres bots voient seulement leurs chantiers/projets
  const botChantiers = useMemo(() =>
    activeBotCode === "CEOB" ? allChantiers : allChantiers.filter(ch => ch.bot_codes?.includes(activeBotCode)),
    [allChantiers, activeBotCode]
  );
  const botProjets = useMemo(() =>
    activeBotCode === "CEOB" ? allProjets : allProjets.filter(p => p.bot_primaire === activeBotCode || p.bot_codes?.includes(activeBotCode)),
    [allProjets, activeBotCode]
  );
  const botPlaybooks = useMemo(() =>
    PLAYBOOK_TEMPLATES.filter(pb => pb.bots.includes(activeBotCode)),
    [activeBotCode]
  );
  // Bots that collaborate with this one (from same chantiers)
  const collaborators = useMemo(() => {
    const codes = new Set<string>();
    botChantiers.forEach(ch => (ch.bot_codes || []).forEach((b: string) => { if (b !== activeBotCode) codes.add(b); }));
    return Array.from(codes);
  }, [botChantiers, activeBotCode]);

  const config = DEPT_TDC[activeBotCode];

  // Fallback si pas de config pour ce departement
  if (!config) {
    return (
      <PageLayout maxWidth="5xl">
          <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-gray-50 border rounded-xl px-4 py-3">
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-600">
              Tour de Controle en cours de configuration pour ce departement.
            </p>
          </div>
      </PageLayout>
    );
  }

  const subtitle = BOT_SUBTITLE[activeBotCode] || config.botName;
  const headerGradient = DEPT_HEADER_GRADIENT[activeBotCode] || "from-slate-600 to-slate-500";
  const DeptIcon = DEPT_ICON[activeBotCode] || Briefcase;
  const iconColor = `text-${headerGradient.split("from-")[1]?.split(" ")[0]?.replace(/(-\d+)$/, "") || "slate"}-600`;

  const handleBlocClick = (bloc: BlocConfig) => {
    const elementType = bloc.title.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

    dispatch({
      type: "focus",
      layer: "cerveau",
      data: {
        title: `${config.botName} — ${bloc.title}`,
        element_type: elementType,
        data: { items: bloc.items },
      },
      bot: activeBotCode,
    });
    // PAS de setActiveView("live-chat") — focusData déclenche le split-screen Atelier dans CenterZone
  };

  const handleFocus = (title: string, elementType: string, data: unknown) => {
    // Dispatch met focusData → CenterZone affiche le split-screen Atelier (LiveChat + FocusModeLayout)
    dispatch({ type: "focus", layer: "cerveau", data: { title, element_type: elementType, data }, bot: activeBotCode });
  };

  // KPI stats for cockpit
  const tachesOpen = taches.filter((t: any) => t.state_detail?.group !== "completed");
  const docs = bureauItems.filter((b: any) => b.type_item === "document");
  const outils = bureauItems.filter((b: any) => b.type_item === "outil");
  const stats = {
    chantiers: botChantiers.length,
    projets: botProjets.length,
    projetsDone: botProjets.filter(p => p.status === "completee" || p.status === "complete").length,
    missionsApi: missions.length,
    docs: templates.length,
    diags: diagnostics.length,
    playbooks: botPlaybooks.length,
    tachesOpen: tachesOpen.length,
    docsCount: docs.length,
    outilsCount: outils.length,
  };

  return (
    <SectionFrame
      title={subtitle}
      subtitle=""
      icon={DeptIcon}
      iconColor={iconColor}
      tabs={DEPT_TABS}
      activeTab={deptTab}
      onTabChange={(tab) => setDeptTab(tab as DeptTabId)}
      maxWidth="5xl"
    >

        {/* ══════════════════════════════════════════ */}
        {/* TAB 1 — COCKPIT (KPIs + blocs essentiels)  */}
        {/* ══════════════════════════════════════════ */}
        {deptTab === "cockpit" && (
          <DeptDashboardView botCode={activeBotCode} />
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB 2 — BLUEPRINT (plan d'affaires)        */}
        {/* Blueprint Vivant — MEME composant pour TOUS les bots (CEOB = 11 sections, le plus complet) */}
        {/* ══════════════════════════════════════════ */}
        {deptTab === "blueprint" && (
          <BlueprintDepartement botCode={activeBotCode} headerGradient={headerGradient} />
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB — DATA ROOM */}
        {/* ══════════════════════════════════════════ */}
        {deptTab === "dataroom" && (
          <BlueprintDataRoom botCode={activeBotCode} headerGradient={headerGradient} />
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB — PLAYBOOK STORE */}
        {/* ══════════════════════════════════════════ */}
        {deptTab === "playbooks" && (
          <BlueprintPlaybooks botCode={activeBotCode} headerGradient={headerGradient} />
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB — CONFERENCE AI (vue focalisee sur les playbooks conference depuis le Store) */}
        {/* ══════════════════════════════════════════ */}
        {deptTab === "conferenceai" && (
          <BlueprintConferenceAI headerGradient={headerGradient} onNavigateToStore={() => setDeptTab("playbooks" as DeptTabId)} />
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB 4 — CHANTIERS (SectionHeader + sub-tabs) */}
        {/* ══════════════════════════════════════════ */}
        {deptTab === "chantiers" && (() => {
          const subTabs: SubTabDef[] = [
            { id: "tous", label: "Tous", gradient: "from-blue-600 to-blue-500", count: botChantiers.length },
            { id: "interne", label: "Internes", gradient: "from-slate-600 to-slate-500" },
            { id: "client", label: "Clients", gradient: "from-emerald-600 to-emerald-500" },
            { id: "partenaire", label: "Partenaires", gradient: "from-amber-600 to-amber-500" },
            { id: "playbooks", label: "Playbooks", icon: Rocket, gradient: "from-indigo-600 to-indigo-500", count: apiPlaybooks.length },
          ];
          return (
            <div className="space-y-3">
              <SectionHeader icon={Flame} title="Chantiers" subtitle="" tabs={subTabs} activeTab={chantiersSub} onTabChange={setChantiersSub} gradient={headerGradient} />
              {chantiersSub === "playbooks" ? (
                <PlaybookGrid playbooks={apiPlaybooks} onFocus={handleFocus} viewMode={hierViewMode} setViewMode={setHierViewMode} />
              ) : (
                <HierarchieTab
                  key={`dept-hier-${activeBotCode}-chantiers-${chantiersSub}`}
                  level="chantiers"
                  compact
                  categorieFilter={chantiersSub === "tous" ? undefined : chantiersSub}
                  goTo={(tab, filter) => {
                    const mapped = tab as string;
                    if (mapped === "chantiers" || mapped === "projets" || mapped === "missions" || mapped === "taches") {
                      setDeptTab(mapped as DeptTabId);
                      setHierParentFilter(filter || null);
                    }
                  }}
                  parentFilter={hierParentFilter}
                  viewMode={hierViewMode}
                  setViewMode={setHierViewMode}
                />
              )}
            </div>
          );
        })()}

        {/* ══════════════════════════════════════════ */}
        {/* TAB 5 — PROJETS (SectionHeader + sub-tabs) */}
        {/* ══════════════════════════════════════════ */}
        {deptTab === "projets" && (() => {
          const subTabs: SubTabDef[] = [
            { id: "tous", label: "Tous", gradient: "from-blue-600 to-blue-500", count: botProjets.length },
            { id: "interne", label: "Internes", gradient: "from-slate-600 to-slate-500" },
            { id: "client", label: "Clients", gradient: "from-emerald-600 to-emerald-500" },
            { id: "partenaire", label: "Partenaires", gradient: "from-amber-600 to-amber-500" },
            { id: "templates", label: "Templates", icon: Rocket, gradient: "from-gray-500 to-gray-400" },
          ];
          return (
            <div className="space-y-3">
              <SectionHeader icon={Package} title="Projets" subtitle="" tabs={subTabs} activeTab={projetsSub} onTabChange={setProjetsSub} gradient={headerGradient} />
              {projetsSub === "templates" ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
                  <Inbox className="h-6 w-6" />
                  <span className="text-xs">Templates a venir</span>
                  <p className="text-[9px] text-gray-300 text-center">Les templates de projets seront disponibles prochainement.</p>
                </div>
              ) : (
                <HierarchieTab
                  key={`dept-hier-${activeBotCode}-projets-${projetsSub}`}
                  level="projets"
                  compact
                  categorieFilter={projetsSub === "tous" ? undefined : projetsSub}
                  goTo={(tab, filter) => {
                    const mapped = tab as string;
                    if (mapped === "chantiers" || mapped === "projets" || mapped === "missions" || mapped === "taches") {
                      setDeptTab(mapped as DeptTabId);
                      setHierParentFilter(filter || null);
                    }
                  }}
                  parentFilter={hierParentFilter}
                  viewMode={hierViewMode}
                  setViewMode={setHierViewMode}
                />
              )}
            </div>
          );
        })()}

        {/* ══════════════════════════════════════════ */}
        {/* TAB 6 — MISSIONS (SectionHeader + sub-tabs) */}
        {/* ══════════════════════════════════════════ */}
        {deptTab === "missions" && (() => {
          const subTabs: SubTabDef[] = [
            { id: "tous", label: "Toutes", gradient: "from-blue-600 to-blue-500", count: missions.length },
            { id: "interne", label: "Internes", gradient: "from-slate-600 to-slate-500" },
            { id: "client", label: "Clients", gradient: "from-emerald-600 to-emerald-500" },
            { id: "partenaire", label: "Partenaires", gradient: "from-amber-600 to-amber-500" },
            { id: "templates", label: "Templates", icon: Rocket, gradient: "from-gray-500 to-gray-400" },
          ];
          return (
            <div className="space-y-3">
              <SectionHeader icon={ListChecks} title="Missions" subtitle="" tabs={subTabs} activeTab={missionsSub} onTabChange={setMissionsSub} gradient={headerGradient} />
              {missionsSub === "templates" ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
                  <Inbox className="h-6 w-6" />
                  <span className="text-xs">Templates a venir</span>
                  <p className="text-[9px] text-gray-300 text-center">Les templates de missions seront disponibles prochainement.</p>
                </div>
              ) : (
                <HierarchieTab
                  key={`dept-hier-${activeBotCode}-missions-${missionsSub}`}
                  level="missions"
                  compact
                  categorieFilter={missionsSub === "tous" ? undefined : missionsSub}
                  goTo={(tab, filter) => {
                    const mapped = tab as string;
                    if (mapped === "chantiers" || mapped === "projets" || mapped === "missions" || mapped === "taches") {
                      setDeptTab(mapped as DeptTabId);
                      setHierParentFilter(filter || null);
                    }
                  }}
                  parentFilter={hierParentFilter}
                  viewMode={hierViewMode}
                  setViewMode={setHierViewMode}
                />
              )}
            </div>
          );
        })()}

        {/* ══════════════════════════════════════════ */}
        {/* TAB 7 — TACHES (SectionHeader + sub-tabs) */}
        {/* ══════════════════════════════════════════ */}
        {deptTab === "taches" && (() => {
          const subTabs: SubTabDef[] = [
            { id: "tous", label: "Toutes", gradient: "from-blue-600 to-blue-500", count: tachesOpen.length },
            { id: "interne", label: "Internes", gradient: "from-slate-600 to-slate-500" },
            { id: "client", label: "Clients", gradient: "from-emerald-600 to-emerald-500" },
            { id: "partenaire", label: "Partenaires", gradient: "from-amber-600 to-amber-500" },
            { id: "templates", label: "Templates", icon: Rocket, gradient: "from-gray-500 to-gray-400" },
          ];
          return (
            <div className="space-y-3">
              <SectionHeader icon={CheckCircle2} title="Taches" subtitle="" tabs={subTabs} activeTab={tachesSub} onTabChange={setTachesSub} gradient={headerGradient} />
              {tachesSub === "templates" ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
                  <Inbox className="h-6 w-6" />
                  <span className="text-xs">Templates a venir</span>
                  <p className="text-[9px] text-gray-300 text-center">Les templates de taches seront disponibles prochainement.</p>
                </div>
              ) : (
                <HierarchieTab
                  key={`dept-hier-${activeBotCode}-taches-${tachesSub}`}
                  level="taches"
                  compact
                  categorieFilter={tachesSub === "tous" ? undefined : tachesSub}
                  goTo={(tab, filter) => {
                    const mapped = tab as string;
                    if (mapped === "chantiers" || mapped === "projets" || mapped === "missions" || mapped === "taches") {
                      setDeptTab(mapped as DeptTabId);
                      setHierParentFilter(filter || null);
                    }
                  }}
                  parentFilter={hierParentFilter}
                  viewMode={hierViewMode}
                  setViewMode={setHierViewMode}
                />
              )}
            </div>
          );
        })()}

        {/* ══════════════════════════════════════════ */}
        {/* TAB 8 — DISCUSSIONS (SectionHeader + sub-tabs) */}
        {/* ══════════════════════════════════════════ */}
        {deptTab === "discussions" && (() => {
          const subTabs: SubTabDef[] = [
            { id: "tous", label: "Tous", gradient: "from-cyan-600 to-cyan-500" },
            { id: "par-chantier", label: "Par Chantier", gradient: "from-blue-600 to-blue-500" },
            { id: "par-projet", label: "Par Projet", gradient: "from-violet-600 to-violet-500" },
            { id: "par-mission", label: "Par Mission", gradient: "from-amber-600 to-amber-500" },
            { id: "par-tache", label: "Par Tache", gradient: "from-gray-500 to-gray-400" },
          ];
          return (
            <div className="space-y-3">
              <SectionHeader icon={MessageSquare} title="Discussions" subtitle="" tabs={subTabs} activeTab={discSub} onTabChange={setDiscSub} gradient={headerGradient} />
              <DiscussionView botFilter={activeBotCode} hideHeader navMode={discSub as NavMode} />
            </div>
          );
        })()}

        {/* ══════════════════════════════════════════ */}
        {/* TAB 9 — DOCUMENTS (SectionHeader + sub-tabs) */}
        {/* ══════════════════════════════════════════ */}
        {deptTab === "documents" && (() => {
          const subTabs: SubTabDef[] = [
            { id: "tous", label: "Tous", gradient: "from-teal-600 to-teal-500" },
            { id: "par-chantier", label: "Par Chantier", gradient: "from-blue-600 to-blue-500" },
            { id: "par-projet", label: "Par Projet", gradient: "from-violet-600 to-violet-500" },
            { id: "par-mission", label: "Par Mission", gradient: "from-amber-600 to-amber-500" },
            { id: "par-tache", label: "Par Tache", gradient: "from-gray-500 to-gray-400" },
            { id: "templates", label: "Templates", icon: FileText, gradient: "from-violet-600 to-violet-500", count: templates.length },
          ];
          return (
            <div className="space-y-3">
              <SectionHeader icon={FileText} title="Documents" subtitle="" tabs={subTabs} activeTab={docsSub} onTabChange={setDocsSub} gradient={headerGradient} />
              {docsSub === "templates" ? (
                <TemplateGrid templates={templates} onFocus={handleFocus} viewMode={tplViewMode} setViewMode={setTplViewMode} />
              ) : (
                <DocumentsUnifie botFilter={activeBotCode} hideHeader navMode={docsSub as NavMode} />
              )}
            </div>
          );
        })()}

        {/* ══════════════════════════════════════════ */}
        {/* TAB 3 — SANTE + DIAGNOSTICS                 */}
        {/* ══════════════════════════════════════════ */}
        {deptTab === "sante" && (() => {
          const santeSubTabs: SubTabDef[] = [
            { id: "vue-ensemble", label: "Vue d'ensemble", icon: Activity, gradient: headerGradient },
            { id: "diagnostics", label: "Diagnostics", icon: Stethoscope, gradient: headerGradient },
            { id: "resultats", label: "Resultats", icon: BarChart3, gradient: headerGradient },
          ];
          return (
            <div className="space-y-3">
              <SectionHeader icon={HeartPulse} title="Sante" subtitle={activeBotCode === "CEOB" ? "Vue globale entreprise" : subtitle} tabs={santeSubTabs} activeTab={santeSub} onTabChange={setSanteSub} gradient={headerGradient} />
              <SanteGlobaleView botCode={activeBotCode} santeSub={santeSub} />
            </div>
          );
        })()}


        {/* ══════════════════════════════════════════ */}
        {/* TAB — AGENDA                               */}
        {/* ══════════════════════════════════════════ */}
        {deptTab === "agenda" && (
          <AgendaPage />
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB — PERFORMANCE AI (sub-sections)        */}
        {/* ══════════════════════════════════════════ */}
        {deptTab === "performance" && (
          <PerformanceAIContent
            activeBotCode={activeBotCode}
            subtitle={subtitle}
            DeptIcon={DeptIcon}
            headerGradient={headerGradient}
            stats={stats}
            collaborators={collaborators}
            botChantiers={botChantiers}
          />
        )}


    </SectionFrame>
  );
}
