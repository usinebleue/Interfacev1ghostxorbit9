/**
 * MasterBibleOfficielle.tsx — Bible Visuelle Officielle
 * Structure calquee 1:1 sur l'architecture app (Tab 1 = C.2.2.x)
 * Chaque composant = preview visuel + statut (LIVE/MOCK/MANQUE)
 * Session 52 — Audit automatise + placement
 */

import { useState } from "react";
import {
  Layout, Crown, Briefcase, Users, Network, Settings,
  DoorOpen, Lightbulb, AlertTriangle, Eye, Activity,
  Sparkles, FileText, Wrench, CheckSquare, CalendarDays,
  DollarSign, Cpu, Factory, Megaphone, Target,
  TrendingUp, Scale, Shield, User, HelpCircle,
  BookOpen, ChevronRight, Gauge, Flame, BarChart3,
  Upload, MessageSquare, Zap, Package, Volume2,
  Mic, Video, Copy, Send,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";

// ================================================================
// TABS — 8 sections calquees sur C.2.2.x
// ================================================================

const TABS = [
  { id: "structure", label: "1. Structure App", icon: Layout },
  { id: "primitives", label: "2. Primitives", icon: Eye },
  { id: "entreprise", label: "3. Mon Entreprise", icon: Crown },
  { id: "bureau", label: "4. Mon Bureau", icon: Briefcase },
  { id: "salles", label: "5. Mes Salles", icon: DoorOpen },
  { id: "equipe", label: "6. Mon Equipe AI", icon: Users },
  { id: "reseau", label: "7. Mon Reseau", icon: Network },
  { id: "reglages", label: "8. Reglages", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ================================================================
// HELPERS
// ================================================================

function SubSection({ code, title, source }: { code: string; title: string; source?: string }) {
  return (
    <div className="bg-gradient-to-r from-gray-200 to-transparent rounded-lg px-4 py-2 mt-6 mb-3">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{code}</span>
        <span className="text-xs font-bold text-gray-700">{title}</span>
      </div>
      {source && <div className="text-[9px] text-gray-400 mt-0.5 font-mono">{source}</div>}
    </div>
  );
}

function StatusTag({ status }: { status: "live" | "mock" | "manque" }) {
  const styles = {
    live: "bg-emerald-50 text-emerald-700 border-emerald-200",
    mock: "bg-amber-50 text-amber-700 border-amber-200",
    manque: "bg-red-50 text-red-600 border-red-200",
  };
  const labels = { live: "LIVE", mock: "MOCK", manque: "MANQUE" };
  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase", styles[status])}>
      {labels[status]}
    </span>
  );
}

function ComponentCard({ title, status, source, children }: {
  title: string;
  status: "live" | "mock" | "manque";
  source?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className={cn("p-0 overflow-hidden", status === "manque" && "border-dashed border-gray-300")}>
      <div className="px-3 py-2 border-b bg-gray-50 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-gray-800">{title}</div>
          {source && <div className="text-[9px] text-gray-400 mt-0.5 font-mono">{source}</div>}
        </div>
        <StatusTag status={status} />
      </div>
      {children && <div className="p-3">{children}</div>}
    </Card>
  );
}

function MissingSlot({ label, desc }: { label: string; desc?: string }) {
  return (
    <Card className="p-3 border-dashed border-red-200 bg-red-50/20">
      <div className="flex items-center gap-2">
        <StatusTag status="manque" />
        <div>
          <div className="text-xs font-medium text-gray-500">{label}</div>
          {desc && <div className="text-[9px] text-gray-400 mt-0.5">{desc}</div>}
        </div>
      </div>
    </Card>
  );
}

// ================================================================
// EXPORT — Page principale
// ================================================================

export function MasterBibleOfficielle() {
  const [activeTab, setActiveTab] = useState<TabId>("structure");

  function renderTab() {
    switch (activeTab) {
      case "structure": return <TabStructure />;
      case "primitives": return <TabPrimitives />;
      case "entreprise": return <TabEntreprise />;
      case "bureau": return <TabBureau />;
      case "salles": return <TabSalles />;
      case "equipe": return <TabEquipeAI />;
      case "reseau": return <TabReseau />;
      case "reglages": return <TabReglages />;
    }
  }

  return (
    <PageLayout>
      <PageHeader
        icon={Layout}
        iconColor="text-emerald-600"
        title="Bible Visuelle Officielle"
        subtitle="Audit reel — chaque composant avec preview visuel"
      />
      <div className="flex flex-wrap gap-1.5 mb-6 px-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                isActive ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
      {/* Legende */}
      <div className="flex gap-3 mb-4 px-1">
        <StatusTag status="live" />
        <span className="text-[9px] text-gray-500">= Existe et fonctionne</span>
        <StatusTag status="mock" />
        <span className="text-[9px] text-gray-500">= Existe avec donnees fictives</span>
        <StatusTag status="manque" />
        <span className="text-[9px] text-gray-500">= N'existe pas encore</span>
      </div>
      <div className="space-y-4">{renderTab()}</div>
    </PageLayout>
  );
}

// ================================================================
// TAB 1 — Structure App
// ================================================================

function TabStructure() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-bold text-white bg-gray-800 px-2 py-0.5 rounded">1</span>
        <span className="text-sm font-bold text-gray-800">Structure App — Arbre de navigation (C.2.2.x)</span>
      </div>

      {/* Architecture 3 zones — preview visuel */}
      <ComponentCard title="Architecture 3 Zones" status="live" source="HeaderBar.tsx + SidebarLeft.tsx + CenterZone.tsx + SidebarRight.tsx">
        <div className="grid grid-cols-12 gap-1 h-32">
          {/* Top bar */}
          <div className="col-span-12 bg-[#073E5A] rounded-t-lg flex items-center px-2 gap-2">
            <div className="w-4 h-4 bg-white/20 rounded" />
            <div className="flex gap-1 flex-1 justify-center">
              {["TdC", "Cockpit", "Pipeline", "Sante"].map(n => (
                <span key={n} className="text-[9px] text-white/70 px-1.5 py-0.5 rounded bg-white/10">{n}</span>
              ))}
            </div>
            <div className="w-4 h-4 bg-white/20 rounded-full" />
          </div>
          {/* 3 columns */}
          <div className="col-span-2 bg-white border-r flex flex-col gap-1 p-1 rounded-bl-lg">
            <div className="text-[9px] font-bold text-gray-400 px-1">Sidebar</div>
            {["Entreprise", "Bureau", "Salles", "Equipe", "Reseau"].map(s => (
              <div key={s} className="text-[9px] text-gray-500 bg-gray-50 rounded px-1 py-0.5">{s}</div>
            ))}
          </div>
          <div className="col-span-8 bg-gray-50 flex items-center justify-center">
            <span className="text-[9px] text-gray-400">Canvas Central (48 routes)</span>
          </div>
          <div className="col-span-2 bg-white border-l flex flex-col items-center gap-1 p-1 rounded-br-lg">
            <div className="text-[9px] font-bold text-gray-400">Chat</div>
            <div className="w-full h-4 bg-blue-50 rounded" />
            <div className="w-full h-4 bg-gray-50 rounded" />
          </div>
        </div>
      </ComponentCard>

      {/* Navigation tree */}
      {[
        { code: "C.2.2.1", label: "Mon Entreprise", tab: "Tab 3", color: "blue", items: ["Direction (CEOB)", "Tour de Controle", "Cockpit", "Blueprint", "Sante Globale"] },
        { code: "C.2.2.2", label: "Mon Bureau", tab: "Tab 4", color: "indigo", items: ["Idees", "Documents", "Outils", "Taches", "Agenda"] },
        { code: "C.2.2.3", label: "Mes Salles", tab: "Tab 5", color: "amber", items: ["Board Room", "War Room", "Think Room"] },
        { code: "C.2.2.4", label: "Mon Equipe AI", tab: "Tab 6", color: "violet", items: ["11 departements — meme pattern 4 tabs chacun"] },
        { code: "C.2.2.5", label: "Mon Reseau", tab: "Tab 7", color: "orange", items: ["Profil", "Cellules", "Jumelage", "Pionniers", "Gouvernance", "Dashboard", "Industrie"] },
        { code: "C.2.2.7", label: "Reglages", tab: "Tab 8", color: "gray", items: ["Profil", "Generaux", "Agents AI", "FAQ", "Abonnement"] },
      ].map(s => (
        <Card key={s.code} className={`p-3 bg-${s.color}-50/30 border-${s.color}-100`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-bold text-gray-400">{s.code}</span>
            <span className="text-xs font-semibold text-gray-800">{s.label}</span>
            <Badge className={`text-[9px] bg-${s.color}-100 text-${s.color}-700 border-${s.color}-200`}>{s.tab}</Badge>
          </div>
          <div className="flex flex-wrap gap-1 ml-4">
            {s.items.map(i => (
              <span key={i} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{i}</span>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ================================================================
// TAB 2 — Primitives
// ================================================================

function TabPrimitives() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-bold text-white bg-gray-800 px-2 py-0.5 rounded">2</span>
        <span className="text-sm font-bold text-gray-800">Primitives — Composants reutilisables</span>
      </div>

      {/* 2.1 Cards */}
      <SubSection code="2.1" title="Cards" source="components/ui/card.tsx" />
      <ComponentCard title="Card Standard" status="live" source="bg-white border rounded-xl">
        <div className="flex gap-3">
          <Card className="p-3 flex-1"><div className="text-[9px] text-gray-500">Card simple (p-3)</div></Card>
          <Card className="p-4 flex-1"><div className="text-[9px] text-gray-500">Card standard (p-4)</div></Card>
        </div>
      </ComponentCard>

      <ComponentCard title="Card KPI avec gradient header" status="live" source="DashboardView, CockpitView, HealthView">
        <div className="flex gap-3">
          {[
            { label: "Pipeline", value: "12", gradient: "from-blue-600 to-blue-500" },
            { label: "Missions", value: "8", gradient: "from-emerald-600 to-emerald-500" },
            { label: "Alertes", value: "3", gradient: "from-red-600 to-red-500" },
          ].map(k => (
            <Card key={k.label} className="p-0 overflow-hidden flex-1">
              <div className={`bg-gradient-to-r ${k.gradient} px-3 py-2 flex items-center gap-1.5`}>
                <Gauge className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white uppercase">{k.label}</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-xl font-bold text-gray-900">{k.value}</div>
                <div className="text-[9px] text-gray-400">actifs</div>
              </div>
            </Card>
          ))}
        </div>
      </ComponentCard>

      {/* 2.2 Badges */}
      <SubSection code="2.2" title="Badges & Status" source="components/ui/badge.tsx" />
      <ComponentCard title="Badge variants" status="live">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">Live</span>
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">Partiel</span>
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">Planifie</span>
        </div>
      </ComponentCard>

      {/* 2.3 Boutons */}
      <SubSection code="2.3" title="Boutons" source="components/ui/button.tsx" />
      <ComponentCard title="Button patterns utilises" status="live">
        <div className="flex flex-wrap gap-2 items-center">
          <button className="h-9 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg">Primaire</button>
          <button className="h-9 px-4 py-2 border border-gray-200 text-xs font-medium rounded-lg text-gray-700">Outline</button>
          <button className="h-8 px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-lg">Petit</button>
          <button className="text-[9px] px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 font-medium">Pilule action</button>
          <button className="text-[9px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 font-medium">Tag filtre</button>
        </div>
      </ComponentCard>

      {/* 2.4 Couleurs bots */}
      <SubSection code="2.4" title="12 Couleurs Bot" source="BOT_COLORS dans LiveChat.tsx" />
      <ComponentCard title="Gradient par departement" status="live">
        <div className="grid grid-cols-4 gap-2">
          {[
            { code: "CEOB", label: "CEO", from: "from-blue-600", to: "to-blue-500" },
            { code: "CTOB", label: "CTO", from: "from-violet-600", to: "to-violet-500" },
            { code: "CFOB", label: "CFO", from: "from-emerald-600", to: "to-emerald-500" },
            { code: "CMOB", label: "CMO", from: "from-pink-600", to: "to-pink-500" },
            { code: "CSOB", label: "CSO", from: "from-red-600", to: "to-red-500" },
            { code: "COOB", label: "COO", from: "from-orange-600", to: "to-orange-500" },
            { code: "CPOB", label: "CPO", from: "from-slate-700", to: "to-slate-600" },
            { code: "CHROB", label: "CHRO", from: "from-teal-600", to: "to-teal-500" },
            { code: "CROB", label: "CRO", from: "from-amber-600", to: "to-amber-500" },
            { code: "CINOB", label: "CINO", from: "from-rose-600", to: "to-rose-500" },
            { code: "CLOB", label: "CLO", from: "from-indigo-600", to: "to-indigo-500" },
            { code: "CISOB", label: "CISO", from: "from-zinc-700", to: "to-zinc-600" },
          ].map(b => (
            <div key={b.code} className={`bg-gradient-to-r ${b.from} ${b.to} rounded-lg px-2 py-1.5 text-center`}>
              <div className="text-[9px] font-bold text-white">{b.code}</div>
              <div className="text-[9px] text-white/70">{b.label}</div>
            </div>
          ))}
        </div>
      </ComponentCard>

      {/* 2.5 Typographie */}
      <SubSection code="2.5" title="Typographie" source="Tailwind classes standardisees" />
      <ComponentCard title="Hierarchie texte" status="live">
        <div className="space-y-2">
          <div className="text-sm font-bold text-gray-800">Titre de section (text-sm font-bold)</div>
          <div className="text-xs font-medium text-gray-700">Label / sous-titre (text-xs font-medium)</div>
          <div className="text-xs text-gray-600">Corps de texte (text-xs text-gray-600)</div>
          <div className="text-[9px] text-gray-400">Meta / caption (text-[9px] text-gray-400)</div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">LABEL UPPERCASE (text-[9px] uppercase tracking-wider)</div>
        </div>
      </ComponentCard>

      {/* 2.6 Layout */}
      <SubSection code="2.6" title="PageLayout + PageHeader" source="layouts/PageLayout.tsx + PageHeader.tsx" />
      <ComponentCard title="Wrapper standard" status="live">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-white px-3 py-2 border-b flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center"><Layout className="h-3.5 w-3.5 text-blue-600" /></div>
            <div>
              <div className="text-xs font-bold text-gray-800">Titre Page</div>
              <div className="text-[9px] text-gray-400">Sous-titre</div>
            </div>
            <div className="ml-auto flex gap-1">
              <span className="text-[9px] px-2 py-0.5 rounded-lg bg-gray-900 text-white">Tab actif</span>
              <span className="text-[9px] px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500">Tab</span>
            </div>
          </div>
          <div className="bg-gray-50 p-3 text-center text-[9px] text-gray-400">
            max-w-4xl mx-auto px-10 py-5 pb-12
          </div>
        </div>
      </ComponentCard>

      {/* 2.7 Inputs */}
      <SubSection code="2.7" title="Inputs" source="components/ui/input.tsx + textarea.tsx" />
      <ComponentCard title="Champs de formulaire" status="live">
        <div className="space-y-2">
          <input className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 placeholder:text-gray-400" placeholder="Input texte standard" readOnly />
          <textarea className="w-full min-h-[60px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 resize-none placeholder:text-gray-400" placeholder="Textarea (chat, formulaires)" readOnly />
        </div>
      </ComponentCard>
    </div>
  );
}

// ================================================================
// TAB 3 — Mon Entreprise (C.2.2.1)
// ================================================================

function TabEntreprise() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-bold text-white bg-gray-800 px-2 py-0.5 rounded">3</span>
        <span className="text-sm font-bold text-gray-800">Mon Entreprise — C.2.2.1</span>
      </div>

      {/* 3.1 Direction */}
      <SubSection code="3.1" title="Direction (CarlOS / CEOB)" source="DashboardView.tsx → department CEOB" />
      <ComponentCard title="Bloc C-Level (12 bots sur dashboard)" status="mock" source="DashboardView.tsx — grid-cols-4 gap-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "CEO", gradient: "from-blue-600 to-blue-500", icon: Crown },
            { label: "CFO", gradient: "from-emerald-600 to-emerald-500", icon: DollarSign },
            { label: "CTO", gradient: "from-violet-600 to-violet-500", icon: Cpu },
            { label: "CMO", gradient: "from-pink-600 to-pink-500", icon: Megaphone },
          ].map(b => {
            const Icon = b.icon;
            return (
              <Card key={b.label} className="p-0 overflow-hidden">
                <div className={`bg-gradient-to-r ${b.gradient} px-2 py-1.5 flex items-center gap-1`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                  <span className="text-[9px] font-bold text-white uppercase">{b.label}</span>
                </div>
                <div className="px-2 py-1.5 space-y-1">
                  <div className="text-[9px] text-gray-600">Item exemple</div>
                  <div className="text-[9px] text-gray-600">Item exemple</div>
                </div>
              </Card>
            );
          })}
        </div>
      </ComponentCard>

      {/* 3.2 Tour de Controle */}
      <SubSection code="3.2" title="Tour de Controle" source="DashboardView.tsx — 556 lignes" />
      <ComponentCard title="Pipeline KPI (3 cartes haut)" status="mock" source="grid-cols-3 gap-3">
        <div className="grid grid-cols-3 gap-2">
          {["Discussions", "Missions", "Chantiers"].map(p => (
            <Card key={p} className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-2 py-1.5">
                <span className="text-[9px] font-bold text-white">{p}</span>
              </div>
              <div className="px-2 py-1.5">
                <span className="text-lg font-bold text-gray-900">5</span>
                <span className="text-[9px] text-gray-400 ml-1">actifs</span>
              </div>
            </Card>
          ))}
        </div>
      </ComponentCard>

      {/* 3.3 Cockpit */}
      <SubSection code="3.3" title="Cockpit" source="CockpitView.tsx — 905 lignes" />
      <ComponentCard title="KPI Gauges + 12 bots x 4 angles" status="mock" source="grid-cols-4 gap-2">
        <div className="grid grid-cols-4 gap-2">
          {["Score VITAA", "Triangle Feu", "vs Secteur", "Departements"].map(k => (
            <Card key={k} className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-2 py-1">
                <span className="text-[9px] font-bold text-white">{k}</span>
              </div>
              <div className="px-2 py-1">
                <span className="text-sm font-bold text-gray-900">72</span>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-[9px] text-gray-400 mt-2">+ 12 rangees de bots x 4 colonnes (identite + 3 angles)</div>
      </ComponentCard>

      {/* 3.4 Blueprint */}
      <SubSection code="3.4" title="Blueprint" source="BluePrintView.tsx — 480 lignes — 3 sub-tabs" />
      <ComponentCard title="3 tabs: Live / Hub / Pipeline" status="live" source="PageHeader rightSlot = tabs">
        <div className="space-y-2">
          <div className="flex gap-1">
            {["Live", "Hub", "Pipeline"].map((t, i) => (
              <span key={t} className={cn("text-[9px] px-2 py-0.5 rounded-lg font-medium", i === 0 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500")}>{t}</span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-2"><div className="text-[9px] text-gray-500">Bots en travail (6 cards)</div></Card>
            <Card className="p-2"><div className="text-[9px] text-gray-500">Templates (141 templates)</div></Card>
            <Card className="p-2"><div className="text-[9px] text-gray-500">Projets + KPIs</div></Card>
          </div>
        </div>
      </ComponentCard>

      {/* 3.5 Sante */}
      <SubSection code="3.5" title="Sante Globale" source="HealthView.tsx — 557 lignes — 3 sub-tabs" />
      <ComponentCard title="3 tabs: Etat / Diagnostics / Departements" status="mock" source="gradient header + sub-tabs">
        <div className="space-y-2">
          <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-bold text-white">Sante de l'Entreprise</span>
            <div className="flex gap-1">
              {["Etat", "Diagnostics", "Par Dept"].map((t, i) => (
                <span key={t} className={cn("text-[9px] px-2 py-0.5 rounded-lg font-medium", i === 0 ? "bg-white/25 text-white" : "text-white/60")}>{t}</span>
              ))}
            </div>
          </div>
          <div className="text-[9px] text-gray-500">VITAA 5 piliers + Quick Wins + Benchmark + Score par dept</div>
        </div>
      </ComponentCard>
    </div>
  );
}

// ================================================================
// TAB 4 — Mon Bureau (C.2.2.2)
// ================================================================

function TabBureau() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-bold text-white bg-gray-800 px-2 py-0.5 rounded">4</span>
        <span className="text-sm font-bold text-gray-800">Mon Bureau — C.2.2.2</span>
      </div>

      {/* Header commun */}
      <ComponentCard title="Header gradient avec 5 tabs" status="live" source="EspaceBureauView.tsx — gradient animated">
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-xs font-bold text-white">Idees</span>
          </div>
          <div className="flex gap-1">
            {["Idees", "Documents", "Outils", "Taches", "Agenda"].map((t, i) => (
              <span key={t} className={cn("text-[9px] px-2 py-0.5 rounded-lg font-medium", i === 0 ? "bg-white/25 text-white" : "text-white/60")}>{t}</span>
            ))}
          </div>
        </div>
      </ComponentCard>

      {/* 4.1 Idees */}
      <SubSection code="4.1" title="Idees" source="EspaceBureauView.tsx → idees — REAL PostgreSQL" />
      <ComponentCard title="Cards idees (grid/list toggle)" status="live" source="useIdees() hook — grid-cols-2 gap-3">
        <div className="grid grid-cols-2 gap-2">
          <Card className="p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-2 py-1.5 flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-white/20" />
              <span className="text-[9px] text-white font-bold">CarlOS</span>
            </div>
            <div className="p-2">
              <div className="text-xs font-bold text-gray-800">Titre idee</div>
              <div className="text-[9px] text-gray-500 mt-0.5">Contenu de l'idee capturee...</div>
              <div className="flex gap-1 mt-1">
                <span className="text-[9px] bg-blue-50 text-blue-600 px-1 rounded">tag</span>
              </div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-2 py-1.5 flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-white/20" />
              <span className="text-[9px] text-white font-bold">Thierry CTO</span>
            </div>
            <div className="p-2">
              <div className="text-xs font-bold text-gray-800">Autre idee</div>
              <div className="text-[9px] text-gray-500 mt-0.5">Description...</div>
            </div>
          </Card>
        </div>
      </ComponentCard>

      {/* 4.2 Documents */}
      <SubSection code="4.2" title="Documents" source="EspaceBureauView.tsx → documents — REAL PostgreSQL + Templates" />
      <ComponentCard title="3 sub-tabs: Generes / Templates / Importes" status="live" source="useBureau() + useTemplates() — 141 templates">
        <div className="space-y-2">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
            {["Mes Documents", "Templates", "Importes"].map((t, i) => (
              <span key={t} className={cn("text-[9px] px-2 py-1 rounded-md font-medium", i === 1 ? "bg-white shadow-sm text-gray-800" : "text-gray-500")}>{t}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 p-2 border-2 border-dashed border-gray-200 rounded-lg text-center">
            <Upload className="h-4 w-4 text-gray-300 mx-auto" />
            <span className="text-[9px] text-gray-400">Zone upload drag & drop (importes)</span>
          </div>
        </div>
      </ComponentCard>

      {/* 4.3 Outils */}
      <SubSection code="4.3" title="Outils" source="EspaceBureauView.tsx → OUTILS_MANUFACTURIERS (8 outils statiques)" />
      <ComponentCard title="8 outils manufacturiers" status="mock" source="grid-cols-2 gap-3 — click → chat CPOB">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Calculateur OEE", icon: Gauge, gradient: "from-emerald-600 to-emerald-500" },
            { label: "ROI Automatisation", icon: BarChart3, gradient: "from-blue-600 to-blue-500" },
            { label: "Prix Materiaux", icon: Package, gradient: "from-amber-600 to-amber-500" },
            { label: "Audit Qualite", icon: Scale, gradient: "from-red-600 to-red-500" },
          ].map(o => {
            const Icon = o.icon;
            return (
              <Card key={o.label} className="p-0 overflow-hidden">
                <div className={`bg-gradient-to-r ${o.gradient} px-2 py-1.5 flex items-center gap-1.5`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                  <span className="text-[9px] font-bold text-white uppercase">{o.label}</span>
                </div>
                <div className="p-2">
                  <span className="text-[9px] text-gray-400">Fabien — CPO</span>
                </div>
              </Card>
            );
          })}
        </div>
      </ComponentCard>

      {/* 4.4 Taches */}
      <SubSection code="4.4" title="Taches" source="EspaceBureauView.tsx → REAL Plane.so API" />
      <ComponentCard title="4 widgets priorite + detail panel" status="live" source="useTaches() → grid-cols-4 gap-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Urgentes", color: "red", count: 2 },
            { label: "Hautes", color: "orange", count: 5 },
            { label: "Moyennes", color: "blue", count: 8 },
            { label: "Basses", color: "green", count: 3 },
          ].map(p => (
            <Card key={p.label} className="p-0 overflow-hidden">
              <div className={`bg-gradient-to-r from-${p.color}-600 to-${p.color}-500 px-2 py-1 flex items-center gap-1`}>
                <span className="text-[9px] font-bold text-white">{p.label}</span>
                <span className="text-[9px] bg-white/25 text-white px-1 rounded-full ml-auto">{p.count}</span>
              </div>
              <div className="p-1.5">
                <div className={`text-[9px] text-gray-600 border-l-2 border-${p.color}-400 pl-1.5 py-0.5`}>Tache exemple</div>
              </div>
            </Card>
          ))}
        </div>
      </ComponentCard>

      {/* 4.5 Agenda */}
      <SubSection code="4.5" title="Agenda" source="EspaceBureauView.tsx → MOCK (Google Calendar a connecter)" />
      <ComponentCard title="Vue semaine 5 colonnes" status="mock" source="grid-cols-5 gap-3">
        <div className="grid grid-cols-5 gap-1">
          {["Lun", "Mar", "Mer", "Jeu", "Ven"].map(j => (
            <div key={j} className="text-center">
              <div className="text-[9px] font-bold text-gray-600 mb-1">{j}</div>
              <Card className="p-1.5">
                <div className="text-[9px] text-gray-400">09:00</div>
                <div className="text-[9px] font-medium text-gray-700">Standup</div>
              </Card>
            </div>
          ))}
        </div>
      </ComponentCard>
    </div>
  );
}

// ================================================================
// TAB 5 — Mes Salles (C.2.2.3)
// ================================================================

function TabSalles() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-bold text-white bg-gray-800 px-2 py-0.5 rounded">5</span>
        <span className="text-sm font-bold text-gray-800">Mes Salles — C.2.2.3</span>
      </div>

      {[
        { code: "5.1", title: "Board Room", gradient: "from-amber-600 to-amber-500", icon: Crown, color: "amber", members: 6, source: "BoardRoomView.tsx — 144 lignes", desc: "CA robotique — 6 membres C-Level, ordre du jour, resolutions" },
        { code: "5.2", title: "War Room", gradient: "from-red-600 to-red-500", icon: AlertTriangle, color: "red", members: 4, source: "WarRoomView.tsx — 102 lignes", desc: "Gestion crise — 4 bots, 6 etapes (Alerte → Post-mortem)" },
        { code: "5.3", title: "Think Room", gradient: "from-amber-500 to-yellow-500", icon: Lightbulb, color: "amber", members: 4, source: "ThinkRoomView.tsx — 102 lignes", desc: "Innovation — 4 bots, 6 etapes (Vision → Go/No-Go)" },
      ].map(room => {
        const Icon = room.icon;
        return (
          <div key={room.code}>
            <SubSection code={room.code} title={room.title} source={room.source} />
            <ComponentCard title={room.title} status="mock" source={`${room.members} bots — click → navigateToChat()`}>
              <div className="space-y-2">
                <div className={`bg-gradient-to-r ${room.gradient} rounded-lg px-3 py-2 flex items-center gap-2`}>
                  <Icon className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">{room.title}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {Array.from({ length: Math.min(room.members, 3) }).map((_, i) => (
                    <Card key={i} className="p-1.5 text-center">
                      <div className={`w-6 h-6 rounded-full bg-${room.color}-100 mx-auto mb-0.5`} />
                      <div className="text-[9px] text-gray-500">Bot {i + 1}</div>
                    </Card>
                  ))}
                </div>
                <div className="text-[9px] text-gray-500">{room.desc}</div>
                <button className={`w-full text-[9px] px-3 py-1.5 rounded-lg bg-${room.color}-600 text-white font-medium`}>Entrer en session</button>
              </div>
            </ComponentCard>
          </div>
        );
      })}
    </div>
  );
}

// ================================================================
// TAB 6 — Mon Equipe AI (C.2.2.4)
// ================================================================

function TabEquipeAI() {
  const BOTS_12 = [
    { code: "CEOB", nom: "CarlOS", role: "CEO AI — President Directeur General", from: "from-blue-600", to: "to-blue-500", ring: "ring-blue-400", bg: "bg-blue-500", icon: Crown, profil: "/agents/generated/ceo-carlos-profil-v3.png", standby: "/agents/generated/ceo-carlos-standby-v3.png" },
    { code: "CTOB", nom: "Thierry", role: "CTO AI — Directeur Technologie", from: "from-violet-600", to: "to-violet-500", ring: "ring-violet-400", bg: "bg-violet-500", icon: Cpu, profil: "/agents/generated/cto-thierry-profil-v3.png", standby: "/agents/generated/cto-thierry-standby-v3.png" },
    { code: "CFOB", nom: "Francois", role: "CFO AI — Directeur Finances", from: "from-emerald-600", to: "to-emerald-500", ring: "ring-emerald-400", bg: "bg-emerald-500", icon: DollarSign, profil: "/agents/generated/cfo-francois-profil-v3.png", standby: "/agents/generated/cfo-francois-standby-v3.png" },
    { code: "CMOB", nom: "Martine", role: "CMO AI — Directrice Marketing", from: "from-pink-600", to: "to-pink-500", ring: "ring-pink-400", bg: "bg-pink-500", icon: Megaphone, profil: "/agents/generated/cmo-martine-profil-v3.png", standby: "/agents/generated/cmo-martine-standby-v3.png" },
    { code: "CSOB", nom: "Sophie", role: "CSO AI — Directrice Strategie", from: "from-red-600", to: "to-red-500", ring: "ring-red-400", bg: "bg-red-500", icon: Target, profil: "/agents/generated/cso-sophie-profil-v3.png", standby: "/agents/generated/cso-sophie-standby-v3.png" },
    { code: "COOB", nom: "Olivier", role: "COO AI — Directeur Operations", from: "from-orange-600", to: "to-orange-500", ring: "ring-orange-400", bg: "bg-orange-500", icon: Settings, profil: "/agents/generated/coo-olivier-profil-v3.png", standby: "/agents/generated/coo-olivier-standby-v3.png" },
    { code: "CPOB", nom: "Fabien", role: "CPO AI — Directeur Production", from: "from-slate-700", to: "to-slate-600", ring: "ring-slate-400", bg: "bg-slate-600", icon: Factory, profil: "/agents/generated/factory-bot-profil-v3.png", standby: "/agents/generated/factory-bot-standby-v3.png" },
    { code: "CHROB", nom: "Helene", role: "CHRO AI — Directrice RH", from: "from-teal-600", to: "to-teal-500", ring: "ring-teal-400", bg: "bg-teal-500", icon: Users, profil: "/agents/generated/chro-helene-profil-v3.png", standby: "/agents/generated/chro-helene-standby-v3.png" },
    { code: "CINOB", nom: "Ines", role: "CINO AI — Directrice Innovation", from: "from-rose-600", to: "to-rose-500", ring: "ring-rose-400", bg: "bg-rose-500", icon: Lightbulb, profil: "/agents/generated/cino-ines-profil-v3.png", standby: "/agents/generated/cino-ines-standby-v3.png" },
    { code: "CROB", nom: "Raphael", role: "CRO AI — Directeur Revenus", from: "from-amber-600", to: "to-amber-500", ring: "ring-amber-400", bg: "bg-amber-500", icon: TrendingUp, profil: "/agents/generated/cro-raphael-profil-v3.png", standby: "/agents/generated/cro-raphael-standby-v3.png" },
    { code: "CLOB", nom: "Louise", role: "CLO AI — Directrice Juridique", from: "from-indigo-600", to: "to-indigo-500", ring: "ring-indigo-400", bg: "bg-indigo-500", icon: Scale, profil: "/agents/generated/clo-louise-profil-v3.png", standby: "/agents/generated/clo-louise-standby-v3.png" },
    { code: "CISOB", nom: "Sebastien", role: "CISO AI — Directeur Cybersecurite", from: "from-zinc-700", to: "to-zinc-600", ring: "ring-zinc-400", bg: "bg-zinc-600", icon: Shield, profil: "/agents/generated/ciso-secbot-profil-v3.png", standby: "/agents/generated/ciso-secbot-standby-v3.png" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-bold text-white bg-gray-800 px-2 py-0.5 rounded">6</span>
        <span className="text-sm font-bold text-gray-800">Mon Equipe AI — C.2.2.4</span>
      </div>

      {/* ===== 6.1 Systeme d'identite ===== */}
      <SubSection code="6.1" title="Identite des 12 Bots C-Level" source="simulation-data.ts + types.ts + agents.py" />

      {/* 6.1.1 — 4 tailles d'avatar */}
      <ComponentCard title="6.1.1 — 4 tailles d'avatar" status="live" source="w-10/w-8/w-6/w-5 — utilise partout">
        <div className="flex items-end gap-6">
          {[
            { label: "Grand (LiveChat)", size: "w-10 h-10" },
            { label: "Moyen (Cards/Headers)", size: "w-8 h-8" },
            { label: "Cockpit (Grilles)", size: "w-6 h-6" },
            { label: "Petit (Presence)", size: "w-5 h-5" },
          ].map(a => (
            <div key={a.label} className="flex flex-col items-center gap-1">
              <div className={`${a.size} rounded-full bg-blue-500 ring-2 ring-blue-300 flex items-center justify-center`}>
                <span className="text-white font-bold" style={{ fontSize: a.size.includes("10") ? 12 : a.size.includes("8") ? 10 : a.size.includes("6") ? 8 : 7 }}>C</span>
              </div>
              <div className="text-[9px] text-gray-500 text-center">{a.label}</div>
              <div className="text-[9px] font-mono text-gray-400">{a.size}</div>
            </div>
          ))}
        </div>
      </ComponentCard>

      {/* 6.1.2 — Avatar avec ring couleur bot — VRAIS PHOTOS */}
      <ComponentCard title="6.1.2 — Avatar avec ring couleur bot (profil)" status="live" source="ring-2 ring-{color} — /agents/generated/*-profil-v3.png">
        <div className="grid grid-cols-6 gap-3">
          {BOTS_12.map(b => (
            <div key={b.code} className="flex flex-col items-center gap-1">
              <img src={b.profil} alt={b.nom} className={`w-10 h-10 rounded-full ring-2 ${b.ring} object-cover`} />
              <div className="text-[9px] font-medium text-gray-700">{b.nom}</div>
              <div className="text-[9px] text-gray-400">{b.code}</div>
            </div>
          ))}
        </div>
      </ComponentCard>

      {/* 6.1.2b — Standby (corps complet) */}
      <ComponentCard title="6.1.2b — Images standby (corps complet)" status="live" source="/agents/generated/*-standby-v3.png">
        <div className="grid grid-cols-6 gap-2">
          {BOTS_12.map(b => (
            <div key={b.code} className="flex flex-col items-center gap-1">
              <div className={`w-12 h-16 rounded-lg overflow-hidden ring-1 ${b.ring}`}>
                <img src={b.standby} alt={`${b.nom} standby`} className="w-full h-full object-cover object-top" />
              </div>
              <div className="text-[9px] font-medium text-gray-700">{b.nom}</div>
            </div>
          ))}
        </div>
      </ComponentCard>

      {/* 6.1.3 — Tableau systeme d'identite complet */}
      <ComponentCard title="6.1.3 — Tableau systeme d'identite — 12 Bots" status="live" source="BOT_METADATA dans simulation-data.ts">
        <div className="space-y-0.5">
          {/* Header */}
          <div className="grid grid-cols-12 gap-1 px-2 py-1 bg-gray-100 rounded-t-lg">
            <div className="col-span-1 text-[9px] font-bold text-gray-500">Photo</div>
            <div className="col-span-1 text-[9px] font-bold text-gray-500">Code</div>
            <div className="col-span-2 text-[9px] font-bold text-gray-500">Nom</div>
            <div className="col-span-4 text-[9px] font-bold text-gray-500">Role</div>
            <div className="col-span-4 text-[9px] font-bold text-gray-500">Fichier image</div>
          </div>
          {BOTS_12.map(b => (
            <div key={b.code} className="grid grid-cols-12 gap-1 px-2 py-1.5 border-b border-gray-50 items-center">
              <div className="col-span-1">
                <img src={b.profil} alt={b.nom} className={`w-6 h-6 rounded-full ring-1 ${b.ring} object-cover`} />
              </div>
              <div className="col-span-1">
                <span className={`text-[9px] font-bold px-1 py-0.5 rounded bg-gradient-to-r ${b.from} ${b.to} text-white`}>{b.code}</span>
              </div>
              <div className="col-span-2 text-xs font-medium text-gray-800">{b.nom}</div>
              <div className="col-span-4 text-[9px] text-gray-600">{b.role}</div>
              <div className="col-span-4 text-[9px] font-mono text-gray-400 truncate">{b.profil.split("/").pop()}</div>
            </div>
          ))}
          {/* Intrus warning */}
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <div>
                <div className="text-[9px] font-bold text-red-700">Intrus a retirer</div>
                <div className="text-[9px] text-red-600">BCC (Catherine/CCO) et BPO (Philippe/CPO) existent dans le code (~111 occurrences) mais ne font PAS partie de la plateforme. Sprint nettoyage requis.</div>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* 6.2 — Galerie Agents AI avec ANIMATIONS */}
      <SubSection code="6.2" title="Galerie Agents AI — 12 cartes animees" source="AgentGalleryPage.tsx — ~1100 lignes (FE.4b)" />
      <ComponentCard title="6.2 — Galerie Agents AI (12 cartes avec SVG animes)" status="live" source="AgentGalleryPage.tsx — 11 keyframes CSS, SVG inline par bot">
        {/* Reference des animations */}
        <div className="p-2 mb-3 bg-violet-50 border border-violet-200 rounded-lg">
          <div className="text-[9px] font-bold text-violet-700 mb-1">11 Keyframes CSS (AG_KEYFRAMES exportees)</div>
          <div className="grid grid-cols-3 gap-1">
            {[
              "ag-node-pulse", "ag-circuit-flow", "ag-circuit-flow-rev",
              "ag-bar-breathe", "ag-scan-down", "ag-ring-pulse",
              "ag-shield-pulse", "ag-spark", "ag-float", "ag-wave-flow",
            ].map(k => (
              <span key={k} className="text-[9px] font-mono bg-white px-1.5 py-0.5 rounded border border-violet-100 text-violet-600">{k}</span>
            ))}
          </div>
        </div>
        {/* Chaque bot = image standby + element unique anime */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { code: "CEOB", nom: "CarlOS", uniqueDesc: "Hologramme 3D + dashboards animes", dotColor: "#60a5fa", suitPaths: 10 },
            { code: "CTOB", nom: "Thierry", uniqueDesc: "Cerveau holographique + tablette tech", dotColor: "#a78bfa", suitPaths: 8 },
            { code: "CFOB", nom: "Francois", uniqueDesc: "Ecrans Bloomberg + courbes financieres", dotColor: "#34d399", suitPaths: 8 },
            { code: "CMOB", nom: "Martine", uniqueDesc: "Cards UI flottantes + elements creatifs", dotColor: "#f472b6", suitPaths: 8 },
            { code: "CSOB", nom: "Sophie", uniqueDesc: "Carte mondiale + connexions + echiquier", dotColor: "#f87171", suitPaths: 7 },
            { code: "COOB", nom: "Olivier", uniqueDesc: "Dashboard HUD operationnel + etincelles", dotColor: "#fb923c", suitPaths: 8 },
            { code: "CHROB", nom: "Helene", uniqueDesc: "Organigramme holographique interactif", dotColor: "#2dd4bf", suitPaths: 7 },
            { code: "CINOB", nom: "Ines", uniqueDesc: "Cerveau neural 3D flottant holographique", dotColor: "#fb7185", suitPaths: 6 },
            { code: "CROB", nom: "Raphael", uniqueDesc: "Ecrans courbes ventes + tablette HUD", dotColor: "#fbbf24", suitPaths: 7 },
            { code: "CLOB", nom: "Louise", uniqueDesc: "Dashboard juridique holo + graphiques", dotColor: "#818cf8", suitPaths: 7 },
            { code: "CISOB", nom: "Sebastien", uniqueDesc: "Bouclier cybersecurite + menaces carte", dotColor: "#a1a1aa", suitPaths: 8 },
            { code: "CPOB", nom: "Fabien", uniqueDesc: "Tablette production holo + etincelles soudure", dotColor: "#94a3b8", suitPaths: 7 },
          ].map(agent => {
            const bot = BOTS_12.find(b => b.code === agent.code)!;
            return (
              <Card key={agent.code} className="p-0 overflow-hidden">
                {/* Image standby avec overlay gradient */}
                <div className="relative h-20 overflow-hidden">
                  <img src={bot.standby} alt={agent.nom} className="w-full h-full object-cover object-top" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${bot.from.replace("from-", "from-")}/30 to-transparent`} />
                  <div className="absolute bottom-1 left-1.5 flex items-center gap-1">
                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded bg-gradient-to-r ${bot.from} ${bot.to} text-white`}>{agent.code}</span>
                    <span className="text-[9px] font-bold text-white drop-shadow-lg">{agent.nom}</span>
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  <div className="text-[9px] text-gray-700 font-medium">{agent.uniqueDesc}</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.dotColor }} />
                    <span className="text-[9px] font-mono text-gray-400">{agent.dotColor}</span>
                    <span className="text-[9px] text-gray-400 ml-auto">{agent.suitPaths} suit paths</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-[9px] text-gray-600">
            <span className="font-bold">Chaque carte =</span> image standby-v3.png + SVG overlay (320x192) + suitPaths circuits animes + uniqueElement specifique + dots couleur bot + glow filter
          </div>
          <div className="text-[9px] text-gray-400 mt-0.5">
            Source unique: AgentGalleryPage.tsx — AGENTS[] config exportee + AG_KEYFRAMES exportees
          </div>
        </div>
      </ComponentCard>

      {/* 6.3 — Gradients officiels */}
      <SubSection code="6.3" title="12 Gradients officiels" source="BOT_COLORS dans LiveChat.tsx + DepartmentTourDeControle.tsx" />
      <ComponentCard title="6.3 — Palette gradients par departement" status="live" source="bg-gradient-to-r from-{color}-600 to-{color}-500">
        <div className="grid grid-cols-4 gap-2">
          {BOTS_12.map(b => (
            <div key={b.code} className={`bg-gradient-to-r ${b.from} ${b.to} rounded-lg px-2 py-1.5 text-center`}>
              <div className="text-[9px] font-bold text-white">{b.code}</div>
              <div className="text-[9px] text-white/70">{b.nom}</div>
            </div>
          ))}
        </div>
      </ComponentCard>

      {/* ===== 6.4 Pattern departement ===== */}
      <SubSection code="6.4" title="Pattern Commun — 4 tabs par departement" source="DepartmentTourDeControle.tsx — 1082 lignes" />
      <ComponentCard title="Gradient header + 4 tabs" status="live" source="Tab 1 mock, Tab 2-4 API reelle">
        <div className="space-y-2">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20" />
              <span className="text-xs font-bold text-white">Francois — CFO</span>
            </div>
            <div className="flex gap-1">
              {["Vue ensemble", "Pipeline", "Documents", "Diagnostics"].map((t, i) => (
                <span key={t} className={cn("text-[9px] px-1.5 py-0.5 rounded-lg font-medium", i === 0 ? "bg-white/25 text-white" : "text-white/60")}>{t}</span>
              ))}
            </div>
          </div>
          <div className="text-[9px] text-gray-500">Tab 1: 10 blocs KPI (5+5) — <StatusTag status="mock" /></div>
          <div className="text-[9px] text-gray-500">Tab 2: Missions filtrees par bot — <StatusTag status="live" /></div>
          <div className="text-[9px] text-gray-500">Tab 3: Templates documentaires — <StatusTag status="live" /></div>
          <div className="text-[9px] text-gray-500">Tab 4: Diagnostics enrichis — <StatusTag status="live" /></div>
        </div>
      </ComponentCard>

      <ComponentCard title="10 Blocs Vue d'ensemble (5+5)" status="mock" source="grid-cols-5 gap-2.5 — 2 rangees">
        <div className="grid grid-cols-5 gap-1">
          {["Tresorerie", "Budget", "Factures", "Rentab.", "Rapports"].map(b => (
            <Card key={b} className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-1.5 py-1">
                <span className="text-[9px] font-bold text-white">{b}</span>
              </div>
              <div className="p-1"><span className="text-[9px] text-gray-400">3 items</span></div>
            </Card>
          ))}
        </div>
      </ComponentCard>

      {/* ===== 6.5 Les 11 departements ===== */}
      <SubSection code="6.5" title="11 Departements (meme pattern 4 tabs)" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {BOTS_12.filter(b => b.code !== "CEOB").map((d) => {
          const Icon = d.icon;
          return (
            <Card key={d.code} className="p-0 overflow-hidden">
              <div className={`bg-gradient-to-r ${d.from} ${d.to} px-2 py-1.5 flex items-center gap-1.5`}>
                <Icon className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white">{d.nom}</span>
                <span className="text-[9px] text-white/60 ml-auto">{d.code}</span>
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="text-[9px] text-gray-500">{d.role.split(" — ")[1]}</span>
                <StatusTag status="live" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
// TAB 7 — Mon Reseau (C.2.2.5)
// ================================================================

function TabReseau() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-bold text-white bg-gray-800 px-2 py-0.5 rounded">7</span>
        <span className="text-sm font-bold text-gray-800">Mon Reseau — C.2.2.5 — Orbit9</span>
      </div>

      <SubSection code="7.1" title="Profil Reseau" source="FEMonReseauPage.tsx → TabProfil" />
      <ComponentCard title="Fiche entreprise + Certifications + Score" status="mock" source="grid-cols-3 — donnees statiques">
        <div className="flex gap-2">
          <Card className="p-2 flex-1"><div className="text-[9px] text-gray-500">Fiche entreprise</div><div className="text-[9px] text-gray-400">Nom, secteur, ville, employes</div></Card>
          <Card className="p-2 flex-1 bg-sky-50"><div className="text-[9px] text-gray-500">Score reputation</div><div className="text-sm font-bold text-sky-600 text-center mt-1">87/100</div></Card>
          <Card className="p-2 flex-1"><div className="text-[9px] text-gray-500">Certifications</div><div className="text-[9px] text-gray-400">ISO, RBQ, sceaux</div></Card>
        </div>
      </ComponentCard>

      <SubSection code="7.2" title="Cellules" source="CellulesPage.tsx — REAL API" />
      <ComponentCard title="KPI + Table membres + Matches" status="live" source="api.listOrbit9Members() + api.listOrbit9Matches()">
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1">
            {["Membres", "Connexions", "Economies"].map(k => (
              <Card key={k} className="p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-2 py-1"><span className="text-[9px] font-bold text-white">{k}</span></div>
                <div className="px-2 py-1"><span className="text-sm font-bold text-gray-900">9</span></div>
              </Card>
            ))}
          </div>
          <div className="text-[9px] text-gray-500">Table grid-cols-12: Entreprise | Secteur | Role | Bots | Status | Actions</div>
        </div>
      </ComponentCard>

      <SubSection code="7.3" title="Jumelage" source="JumelageLivePage.tsx — REAL API multi-etapes" />
      <ComponentCard title="Pipeline 6 etapes avec API" status="live" source="launchOrbit9Match() + generateJumelageQuestions()">
        <div className="flex gap-1">
          {["Besoin", "Analyse", "Scan", "Top 3", "Questions", "Match"].map((s, i) => (
            <div key={s} className={cn("flex-1 text-center py-1 rounded text-[9px] font-medium", i < 3 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500")}>
              {s}
            </div>
          ))}
        </div>
      </ComponentCard>

      <SubSection code="7.4" title="Pionniers" source="PionniersPage.tsx" />
      <ComponentCard title="Grille 9 places (3x3) + KPIs" status="mock" source="9 secteurs — confirmes/prospect/disponible">
        <div className="grid grid-cols-3 gap-1">
          {["Confirme", "Confirme", "Prospect", "Prospect", "Disponible", "Disponible", "Disponible", "Disponible", "Disponible"].map((s, i) => (
            <div key={i} className={cn("py-1.5 text-center rounded text-[9px] font-medium border", s === "Confirme" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : s === "Prospect" ? "bg-amber-50 border-dashed border-amber-200 text-amber-600" : "bg-gray-50 border-dashed border-gray-200 text-gray-400")}>
              {s}
            </div>
          ))}
        </div>
      </ComponentCard>

      <SubSection code="7.5" title="Gouvernance" source="GouvernancePage.tsx — 4 sub-tabs" />
      <ComponentCard title="Principes / Roles / TimeTokens / Matrice" status="mock" source="Holacracy adaptee — mock">
        <div className="flex gap-1">
          {["Principes", "Roles", "TimeTokens", "Sortie"].map(t => (
            <span key={t} className="text-[9px] px-2 py-0.5 rounded-lg bg-violet-100 text-violet-700 font-medium">{t}</span>
          ))}
        </div>
      </ComponentCard>

      <SubSection code="7.6" title="Dashboard Reseau" source="FEMonReseauPage.tsx → TabDashboard" />
      <MissingSlot label="Dashboard Reseau" desc="Concept seulement — metriques cellules, ROI, sante. A implementer." />

      <SubSection code="7.7" title="Industrie" source="NouvellesPage.tsx + EvenementsPage.tsx" />
      <ComponentCard title="Nouvelles + Evenements + Veille" status="mock" source="Mock data — fil automatisation/robotique">
        <div className="flex gap-2">
          <Card className="p-2 flex-1"><div className="text-[9px] text-gray-500">Nouvelles</div><div className="text-[9px] text-gray-400">Feed sectoriel</div></Card>
          <Card className="p-2 flex-1"><div className="text-[9px] text-gray-500">Evenements</div><div className="text-[9px] text-gray-400">Salons, formations</div></Card>
          <Card className="p-2 flex-1"><div className="text-[9px] text-gray-500">Veille</div><div className="text-[9px] text-gray-400">Tendances, subventions</div></Card>
        </div>
      </ComponentCard>
    </div>
  );
}

// ================================================================
// TAB 8 — Reglages (C.2.2.7)
// ================================================================

function TabReglages() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-bold text-white bg-gray-800 px-2 py-0.5 rounded">8</span>
        <span className="text-sm font-bold text-gray-800">Reglages — C.2.2.7</span>
      </div>

      <SubSection code="8.1" title="Mon Profil" source="Aucun fichier — A CONSTRUIRE" />
      <MissingSlot label="Page Profil Utilisateur" desc="Avatar, nom, courriel, telephone, entreprise — sprint dedie" />

      <SubSection code="8.2" title="Reglages Generaux" source="Aucun fichier — A CONSTRUIRE" />
      <MissingSlot label="Notifications + Langue + Securite" desc="Toggles, selects, 2FA — sprint dedie" />

      <SubSection code="8.3" title="Reglages Agents AI" source="AgentSettingsView.tsx — 736 lignes" />
      <ComponentCard title="Profil agent complet (2 colonnes)" status="live" source="Banner 16:9 + Technique gauche + Cognitif droite">
        <div className="space-y-2">
          {/* Banner preview */}
          <div className="h-16 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-lg relative overflow-hidden">
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 ring-2 ring-white/50" />
              <div>
                <div className="text-[9px] font-bold text-white">CarlOS — CEO</div>
                <div className="text-[9px] text-white/60">Direction</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* Gauche */}
            <div className="space-y-1">
              <Card className="p-2">
                <div className="text-[9px] font-bold text-gray-600">Mode Decision</div>
                <div className="flex gap-0.5 mt-1">
                  {["Strat", "Tact", "Anal", "Creat", "Crise"].map((m, i) => (
                    <span key={m} className={cn("text-[9px] px-1 py-0.5 rounded", i === 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400")}>{m}</span>
                  ))}
                </div>
              </Card>
              <Card className="p-2">
                <div className="text-[9px] font-bold text-gray-600">Competences + Style comm</div>
              </Card>
            </div>
            {/* Droite */}
            <div className="space-y-1">
              <Card className="p-2">
                <div className="text-[9px] font-bold text-gray-600">Profil Psychometrique</div>
                <div className="space-y-1 mt-1">
                  {[
                    { label: "Strategique", pct: 90, color: "bg-blue-500" },
                    { label: "Analytique", pct: 75, color: "bg-emerald-500" },
                    { label: "Creatif", pct: 60, color: "bg-purple-500" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-1">
                      <span className="text-[9px] text-gray-400 w-14 text-right">{s.label}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full"><div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} /></div>
                      <span className="text-[9px] font-bold text-gray-600 w-6">{s.pct}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-2">
                <div className="text-[9px] font-bold text-gray-600">Trisociation (3 Ghosts)</div>
                <div className="flex gap-1 mt-1">
                  {["Bezos", "Munger", "Churchill"].map((g, i) => (
                    <span key={g} className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", i === 0 ? "bg-blue-50 text-blue-700" : i === 1 ? "bg-violet-50 text-violet-700" : "bg-amber-50 text-amber-700")}>{g}</span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </ComponentCard>

      <SubSection code="8.4" title="FAQ CarlOS" source="Aucun fichier — A CONSTRUIRE" />
      <MissingSlot label="FAQ contextuelle" desc="CarlOS repond aux questions — guide intelligent" />

      <SubSection code="8.5" title="Abonnement" source="Aucun fichier — A CONSTRUIRE" />
      <MissingSlot label="Plan + Facturation + Limites" desc="Gestion abonnement — sprint dedie" />
    </div>
  );
}
