/**
 * BluePrintView.tsx — Mon Blue Print (canevas central)
 * 3 sous-sections: Live, Hub, Pipeline
 * Pattern: EspaceBureauView / Orbit9DetailView (sub-tabs dans header bar)
 * Design System: bg-white border-b header, bg-gray-50 content, max-w-4xl mx-auto
 * Sprint C — Schema directeur: idee → bots → documents → jumelages → projets
 *
 * BRANCHE SUR API REELLE:
 *   Tab Hub  → GET /api/v1/templates (41 templates) + GET /api/v1/bureau?type=document
 *   Tab Live → GET /api/v1/command/missions + /api/v1/command/briefings
 *   Tab Pipeline → mock (Orbit9 pas encore bati)
 */

import { useState, useEffect } from "react";
import { ArrowLeft, Activity, FileText, GitBranch, LayoutGrid, Clock, ArrowRight, Zap, Users, Loader2, AlertCircle } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { BlueprintSection } from "../../context/FrameMasterContext";
import { BOT_AVATAR } from "../../api/types";
import type { TemplateInfo, BureauItem } from "../../api/types";
import { api } from "../../api/client";
import { CarlOSPresence } from "./CarlOSPresence";

// ── Sub-tabs config (pattern Orbit9DetailView) ──

const BLUEPRINT_TABS: { id: BlueprintSection; label: string; icon: React.ElementType }[] = [
  { id: "live", label: "Live", icon: Activity },
  { id: "hub", label: "Hub", icon: FileText },
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
];

// ── Couleurs par categorie (design system: gradients bot) ──

const CATEGORY_COLORS: Record<string, string> = {
  CEO: "from-blue-600 to-blue-500",
  CTO: "from-violet-600 to-violet-500",
  CFO: "from-emerald-600 to-emerald-500",
  CMO: "from-pink-600 to-pink-500",
  CSO: "from-red-600 to-red-500",
  COO: "from-orange-600 to-orange-500",
  FACTORY: "from-slate-600 to-slate-500",
  "INTERNE-UB": "from-cyan-600 to-cyan-500",
};

// ── 6 C-Level bots pour la grille Live ──

const CLEVEL_BOTS: { code: string; nom: string; role: string; dept: string; deptColor: string }[] = [
  { code: "BCO", nom: "CarlOS", role: "CEO", dept: "Direction", deptColor: "bg-blue-100 text-blue-700" },
  { code: "BCT", nom: "Thierry", role: "CTO", dept: "Technologie", deptColor: "bg-violet-100 text-violet-700" },
  { code: "BCF", nom: "Francois", role: "CFO", dept: "Finance", deptColor: "bg-emerald-100 text-emerald-700" },
  { code: "BCM", nom: "Martine", role: "CMO", dept: "Marketing", deptColor: "bg-pink-100 text-pink-700" },
  { code: "BCS", nom: "Sophie", role: "CSO", dept: "Strategie", deptColor: "bg-red-100 text-red-700" },
  { code: "BOO", nom: "Olivier", role: "COO", dept: "Operations", deptColor: "bg-orange-100 text-orange-700" },
];

// ── Stage labels pour COMMAND missions ──

const STAGE_LABELS: Record<string, { label: string; progress: number }> = {
  scan: { label: "Scan en cours", progress: 25 },
  strategie: { label: "Strategie", progress: 50 },
  execution: { label: "Execution", progress: 75 },
  bilan: { label: "Bilan", progress: 90 },
  done: { label: "Termine", progress: 100 },
};

// ══════════════════════════════════════════
// TAB LIVE — Bots au travail (COMMAND missions reelles)
// ══════════════════════════════════════════

function TabLive() {
  const [missions, setMissions] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.commandMissions(20)
      .then(setMissions)
      .catch(() => setMissions([]))
      .finally(() => setLoading(false));
  }, []);

  // Calculer le status de chaque bot basé sur les missions actives
  const botStatus = (code: string) => {
    const activeMission = missions.find(
      (m) => Array.isArray(m.scan_bots) && (m.scan_bots as string[]).includes(code) && m.current_stage !== "done"
    );
    if (activeMission) {
      const stage = STAGE_LABELS[activeMission.current_stage as string] || { label: "Actif", progress: 50 };
      return { label: stage.label, progress: stage.progress, active: true };
    }
    return { label: "Standby", progress: 0, active: false };
  };

  return (
    <div className="space-y-4">
      {/* Grille 6 bots */}
      <div>
        <div className="text-sm font-bold text-gray-800 mb-3">Equipe C-Level</div>
        <div className="grid grid-cols-3 gap-3">
          {CLEVEL_BOTS.map((bot) => {
            const status = botStatus(bot.code);
            return (
              <Card key={bot.code} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="relative">
                    <img
                      src={BOT_AVATAR[bot.code]}
                      alt={bot.nom}
                      className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm"
                    />
                    {status.active && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 ring-2 ring-white animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{bot.nom}</p>
                    <p className="text-[11px] text-gray-400">{bot.role}</p>
                  </div>
                </div>
                <Badge className={cn("text-[9px] mb-2", bot.deptColor)}>{bot.dept}</Badge>
                <p className="text-[11px] text-gray-500 mb-1.5">{status.label}</p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", status.active ? "bg-blue-500" : "bg-gray-300")}
                    style={{ width: `${status.progress}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Missions COMMAND actives — donnees reelles */}
      <div>
        <div className="text-sm font-bold text-gray-800 mb-3">
          Missions COMMAND
          {loading && <Loader2 className="inline h-3.5 w-3.5 ml-2 animate-spin text-gray-400" />}
        </div>
        {missions.length === 0 && !loading ? (
          <Card className="p-4">
            <p className="text-xs text-gray-400 text-center">Aucune mission active — les bots attendent vos directives</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {missions.slice(0, 5).map((m) => {
              const stage = STAGE_LABELS[(m.current_stage as string) || "scan"] || STAGE_LABELS.scan;
              const isDone = m.current_stage === "done";
              return (
                <Card key={m.id as number} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-800 truncate flex-1">
                      {(m.message_original as string || "Mission").slice(0, 80)}
                    </p>
                    <Badge variant="outline" className={cn(
                      "text-[9px] ml-2",
                      isDone ? "text-green-600 bg-green-50" : "text-blue-600 bg-blue-50"
                    )}>
                      {stage.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] text-gray-400">Trigger: {m.trigger as string || "auto"}</span>
                    <span className="text-[11px] text-gray-400">Urgence: {m.urgency as string || "routine"}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 ease-out",
                        isDone ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                      )}
                      style={{ width: `${stage.progress}%` }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// TAB HUB — Templates REELS & Documents REELS
// ══════════════════════════════════════════

function TabHub() {
  const { setActiveView } = useFrameMaster();
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [recentDocs, setRecentDocs] = useState<BureauItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.templates().catch(() => ({ templates: [], total: 0, categories: [] })),
      api.bureauList("document").catch(() => ({ items: [] })),
    ]).then(([tplRes, docRes]) => {
      setTemplates(tplRes.templates);
      setCategories(tplRes.categories);
      setRecentDocs((docRes as { items: BureauItem[] }).items?.slice(0, 10) || []);
      setError(null);
    }).catch((e) => {
      setError(e.message);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory
    ? templates.filter((t) => t.categorie === activeCategory)
    : templates;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        <span className="text-xs text-gray-400 ml-2">Chargement des templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}

      {/* Filtre par categorie */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
            !activeCategory ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
          )}
        >
          Tous ({templates.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeCategory === cat ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            {cat} ({templates.filter((t) => t.categorie === cat).length})
          </button>
        ))}
      </div>

      {/* Templates — cards avec gradient header (design system) */}
      <div>
        <div className="text-sm font-bold text-gray-800 mb-3">
          Templates disponibles
          <span className="text-[11px] text-gray-400 font-normal ml-2">{filtered.length} templates</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((t) => (
            <div key={t.alias} className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className={cn("bg-gradient-to-r px-4 py-2.5 flex items-center gap-2 border-b", CATEGORY_COLORS[t.categorie] || "from-gray-600 to-gray-500")}>
                <FileText className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">{t.categorie}</span>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-gray-800 mb-1">{t.nom}</p>
                <p className="text-[11px] text-gray-400 mb-2">{t.alias}</p>
                <button
                  onClick={() => setActiveView("live-chat")}
                  className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-100 font-medium cursor-pointer"
                >
                  <ArrowRight className="h-3.5 w-3.5" /> Lancer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents reels depuis Mon Bureau */}
      <div>
        <div className="text-sm font-bold text-gray-800 mb-3">Documents generes</div>
        {recentDocs.length === 0 ? (
          <Card className="p-4">
            <p className="text-xs text-gray-400 text-center">Aucun document genere — lancez un template pour commencer</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentDocs.map((doc) => (
              <Card key={doc.id} className="p-3 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer">
                <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{doc.titre}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-[11px] text-gray-400">
                      {new Date(doc.created_at).toLocaleDateString("fr-CA")}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className={cn(
                  "text-[9px]",
                  doc.status === "actif" ? "text-green-600 bg-green-50" : "text-blue-600 bg-blue-50"
                )}>
                  {doc.status === "actif" ? "Termine" : doc.status}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// TAB PIPELINE — Projets & Jumelages (mock — Orbit9 pas encore bati)
// ══════════════════════════════════════════

function TabPipeline() {
  const PROJETS = [
    { nom: "Automatisation Usine Bleue", partenaire: "Boreal", status: "En production", avancement: 65 },
    { nom: "Integration ERP", partenaire: "TechNord", status: "Planifie", avancement: 15 },
  ];

  const JUMELAGES = [
    { e1: "Usine Bleue", e2: "Alimentation Boreal", type: "Co-innovation", bots: ["BCT", "BCF"] },
    { e1: "Usine Bleue", e2: "TechNord Solutions", type: "Sous-traitance", bots: ["BOO", "BCO"] },
  ];

  return (
    <div className="space-y-4">
      {/* KPI cards — design system standard (cols-3 accepte si 3 KPIs) */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
            <FileText className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Documents</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-blue-600">24</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <Activity className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Projets actifs</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-emerald-600">3</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
            <Users className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Collaborations</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-violet-600">2</div>
          </div>
        </Card>
      </div>

      {/* Projets en cours */}
      <div>
        <div className="text-sm font-bold text-gray-800 mb-3">Projets en cours</div>
        <div className="space-y-2">
          {PROJETS.map((p) => (
            <Card key={p.nom} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-800">{p.nom}</p>
                <Badge variant="outline" className={cn(
                  "text-[9px]",
                  p.status === "En production" ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50"
                )}>
                  {p.status}
                </Badge>
              </div>
              <p className="text-[11px] text-gray-400 mb-2">Partenaire: {p.partenaire}</p>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${p.avancement}%` }} />
              </div>
              <p className="text-[11px] text-gray-400 text-right mt-1">{p.avancement}%</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Jumelages actifs */}
      <div>
        <div className="text-sm font-bold text-gray-800 mb-3">Jumelages actifs</div>
        <div className="grid grid-cols-2 gap-3">
          {JUMELAGES.map((j) => (
            <Card key={`${j.e1}-${j.e2}`} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-violet-400" />
                <Badge variant="outline" className="text-[9px] text-violet-600 bg-violet-50">{j.type}</Badge>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-700">{j.e1}</span>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-700">{j.e2}</span>
              </div>
              <div className="flex gap-1">
                {j.bots.map((code) => (
                  <img
                    key={code}
                    src={BOT_AVATAR[code]}
                    alt={code}
                    className="w-6 h-6 rounded-full ring-2 ring-white/30 shadow-sm"
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// VUE PRINCIPALE — pattern EspaceBureauView / Orbit9DetailView
// ══════════════════════════════════════════

export function BluePrintView() {
  const { activeBlueprintSection, navigateBlueprint, setActiveView } = useFrameMaster();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header bar — bg-white border-b (design system) */}
      <div className="bg-white border-b px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView("department")}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-sm font-bold text-gray-800">Mon Blue Print</div>
              <div className="text-xs text-muted-foreground">Schema directeur — de l'idee a la realisation</div>
            </div>
          </div>

          {/* Sub-tabs a droite (pattern Orbit9DetailView) */}
          <div className="flex gap-1 ml-auto">
            {BLUEPRINT_TABS.map((tab) => {
              const TIcon = tab.icon;
              const isActive = tab.id === activeBlueprintSection;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateBlueprint(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  )}
                >
                  <TIcon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu scrollable — design system: max-w-4xl mx-auto p-4 pb-12 */}
      <div className="flex-1 overflow-auto">
        <CarlOSPresence />
        <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">
          {activeBlueprintSection === "live" && <TabLive />}
          {activeBlueprintSection === "hub" && <TabHub />}
          {activeBlueprintSection === "pipeline" && <TabPipeline />}
        </div>
      </div>
    </div>
  );
}
