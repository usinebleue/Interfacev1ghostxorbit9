/**
 * DashboardView.tsx — Tour de Controle CEO
 * 10 blocs du wireframe (5 C-Level + 5 outils)
 * Presentes dans le STYLE du mockup (grands blocs informatifs, listes reelles)
 * Sprint A — Frame Master V2
 */

import { ArrowRight, Briefcase, DollarSign, Cpu, Megaphone, Target, CheckCircle2, CalendarDays, TrendingUp, Newspaper, BarChart3 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";

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

/* ============ BLOC C-LEVEL : CarlOS (CEO) ============ */
function BlocCEO({ onClick }: { onClick?: () => void }) {
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Briefcase} title="CarlOS" count={3} gradient="bg-gradient-to-r from-blue-600 to-blue-500" />
      <ul className="space-y-2.5">
        <li className="text-xs text-gray-800">
          <span className="font-medium">Budget automatisation</span> — 3 scenarios a approuver
          <p className="text-[11px] text-gray-400">Soumis par Agent CFO · Aujourd'hui</p>
        </li>
        <li className="text-xs text-gray-800">
          <span className="font-medium">Soumission MetalPro v2</span> — revision requise
          <p className="text-[11px] text-gray-400">Soumis par Agent CSO · Hier</p>
        </li>
        <li className="text-xs text-gray-800">
          <span className="font-medium">Revenue +12% MoM</span> — pipeline a 475K$
          <p className="text-[11px] text-gray-400">Rapport auto · Ce matin</p>
        </li>
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent CFO ============ */
function BlocCFO({ onClick }: { onClick?: () => void }) {
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={DollarSign} title="Agent CFO" count={2} gradient="bg-gradient-to-r from-emerald-600 to-emerald-500" />
      <ul className="space-y-2.5">
        <li className="text-xs text-gray-800">
          <div className="flex justify-between"><span className="font-medium">Cash flow</span><span className="text-emerald-600 font-bold">+34K$</span></div>
          <p className="text-[11px] text-gray-400">Positif ce mois-ci</p>
        </li>
        <li className="text-xs text-gray-800">
          <div className="flex justify-between"><span className="font-medium">Factures en retard</span><span className="text-red-500 font-bold">14K$</span></div>
          <p className="text-[11px] text-gray-400">MetalPro 8K$ + AcierPlus 6K$</p>
        </li>
        <li className="text-xs text-gray-800">
          <div className="flex justify-between"><span className="font-medium">Marge brute</span><span className="font-bold">42%</span></div>
          <p className="text-[11px] text-gray-400">Cible 40% — atteint</p>
        </li>
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent CTO ============ */
function BlocCTO({ onClick }: { onClick?: () => void }) {
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-violet-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Cpu} title="Agent CTO" gradient="bg-gradient-to-r from-violet-600 to-violet-500" />
      <ul className="space-y-2.5">
        <li className="text-xs text-gray-800">
          <div className="flex justify-between mb-0.5"><span className="font-medium">Sprint A</span><span className="font-bold">85%</span></div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full" style={{ width: "85%" }} />
          </div>
        </li>
        <li className="text-xs text-gray-800">
          <span className="font-medium">3 bugs critiques</span> resolus cette semaine
          <p className="text-[11px] text-gray-400">0 bloquants restants</p>
        </li>
        <li className="text-xs text-gray-800">
          <span className="font-medium">Deploy V1</span> prevu vendredi
          <p className="text-[11px] text-gray-400">12 endpoints · 535 tests OK</p>
        </li>
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent CMO ============ */
function BlocCMO({ onClick }: { onClick?: () => void }) {
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-pink-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Megaphone} title="Agent CMO" gradient="bg-gradient-to-r from-pink-600 to-pink-500" />
      <ul className="space-y-2.5">
        <li className="text-xs text-gray-800">
          <div className="flex justify-between"><span className="font-medium">Leads generes</span><span className="text-pink-600 font-bold">1.2K</span></div>
          <p className="text-[11px] text-gray-400">+18% vs Q4</p>
        </li>
        <li className="text-xs text-gray-800">
          <div className="flex justify-between"><span className="font-medium">Taux conversion</span><span className="font-bold">3.8%</span></div>
          <p className="text-[11px] text-gray-400">Cible 4% — presque</p>
        </li>
        <li className="text-xs text-gray-800">
          <span className="font-medium">Campagne Q1</span> prete au lancement
          <p className="text-[11px] text-gray-400">Brief Q2 a valider · 3 mars</p>
        </li>
      </ul>
    </Card>
  );
}

/* ============ BLOC C-LEVEL : Agent CSO ============ */
function BlocCSO({ onClick }: { onClick?: () => void }) {
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Target} title="Agent CSO" gradient="bg-gradient-to-r from-red-600 to-red-500" />
      <ul className="space-y-2.5">
        <li className="text-xs text-gray-800">
          <span className="font-medium">Plan strategique 2026</span> valide
          <p className="text-[11px] text-gray-400">Approuve par le CA</p>
        </li>
        <li className="text-xs text-gray-800">
          <span className="font-medium">Pivot #1</span> — IA manufacturiere
          <p className="text-[11px] text-gray-400">Opportunite identifiee · En cours</p>
        </li>
        <li className="text-xs text-gray-800">
          <span className="font-medium">Pivot #2</span> — Orbit9 reseau
          <p className="text-[11px] text-gray-400">Prochaine revue · 5 mars</p>
        </li>
      </ul>
    </Card>
  );
}

/* ============ BLOC OUTIL : Mes Taches ============ */
function BlocTaches({ onClick }: { onClick?: () => void }) {
  const items = [
    { text: "Approuver budget automatisation", agent: "Agent CFO", date: "Aujourd'hui" },
    { text: "Reviser soumission MetalPro", agent: "Agent CSO", date: "Jeudi" },
    { text: "Valider brief marketing Q2", agent: "Agent CMO", date: "3 mars" },
  ];
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={CheckCircle2} title="Mes Taches" count={3} gradient="bg-gradient-to-r from-green-600 to-green-500" />
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-500" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-800 font-medium">{item.text}</p>
              <p className="text-[11px] text-gray-400">{item.agent} · {item.date}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC OUTIL : Mon Calendrier ============ */
function BlocCalendrier({ onClick }: { onClick?: () => void }) {
  const items = [
    { text: "Standup equipe", time: "09:00", type: "meeting" as const },
    { text: "Call MetalPro — soumission", time: "10:30", type: "client" as const },
    { text: "Revue budget Q2 (CFO)", time: "13:00", type: "meeting" as const },
  ];
  const badgeStyle = { meeting: "bg-blue-100 text-blue-700", client: "bg-green-100 text-green-700" };
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={CalendarDays} title="Mon Calendrier" count={3} gradient="bg-gradient-to-r from-cyan-600 to-cyan-500" />
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center justify-between gap-2">
            <p className="text-xs text-gray-800 truncate">{item.text}</p>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-medium text-gray-600">{item.time}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badgeStyle[item.type]}`}>{item.type}</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC OUTIL : Mon Pipeline ============ */
function BlocPipeline({ onClick }: { onClick?: () => void }) {
  const items = [
    { company: "MetalPro inc.", stage: "Soumission", amount: "125K$", pct: 75 },
    { company: "TechnoSoud", stage: "Negociation", amount: "210K$", pct: 60 },
    { company: "Acier Quebec", stage: "Qualification", amount: "85K$", pct: 40 },
  ];
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-amber-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={TrendingUp} title="Mon Pipeline" gradient="bg-gradient-to-r from-amber-600 to-amber-500" />
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i}>
            <div className="flex items-center justify-between mb-0.5">
              <div className="min-w-0">
                <p className="text-xs text-gray-800 font-medium">{item.company}</p>
                <p className="text-[11px] text-gray-400">{item.stage}</p>
              </div>
              <span className="text-xs font-bold text-gray-700 shrink-0">{item.amount}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.pct}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC OUTIL : Infos Industrie ============ */
function BlocInfosIndustrie({ onClick }: { onClick?: () => void }) {
  const items = [
    { title: "IA manufacturiere: adoption +40% en 2026", source: "Les Affaires", time: "2h" },
    { title: "Programme CDPQ pour PME technos", source: "BDC", time: "5h" },
    { title: "Hausse couts acier Q1 prevue a +8%", source: "Metal Bulletin", time: "hier" },
  ];
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={Newspaper} title="Infos Industrie" gradient="bg-gradient-to-r from-indigo-600 to-indigo-500" />
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-800 font-medium">{item.title}</p>
              <p className="text-[11px] text-gray-400">{item.source}</p>
            </div>
            <span className="text-[11px] text-gray-400 shrink-0">{item.time}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BLOC OUTIL : Stats Marche ============ */
function BlocStatsMarche({ onClick }: { onClick?: () => void }) {
  const items = [
    { label: "Secteur manufacturier QC", value: "+3.2%", trend: "up" as const },
    { label: "Demande automatisation", value: "+22% YoY", trend: "up" as const },
    { label: "Cout main-d'oeuvre", value: "+4.1%", trend: "up" as const },
  ];
  const trendColor = { up: "text-green-600", down: "text-red-500", stable: "text-gray-500" };
  return (
    <Card className="p-4 overflow-hidden cursor-pointer hover:ring-2 hover:ring-slate-300 transition-shadow" onClick={onClick}>
      <BlockHeader icon={BarChart3} title="Stats Marche" gradient="bg-gradient-to-r from-slate-600 to-slate-500" />
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center justify-between">
            <p className="text-xs text-gray-800">{item.label}</p>
            <span className={cn("text-xs font-bold", trendColor[item.trend])}>{item.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ BOT SHORTCUTS pour navigation ============ */
const BOT_SHORTCUT: Record<string, Partial<import("../../../app/v2/api/types").BotInfo>> = {
  BCO: { code: "BCO", nom: "CarlOS", titre: "CEO", departement: "Direction", emoji: "👔", actif: true },
  BCF: { code: "BCF", nom: "Agent CFO", titre: "CFO", departement: "Finance", emoji: "💰", actif: true },
  BCT: { code: "BCT", nom: "Agent CTO", titre: "CTO", departement: "Technologie", emoji: "⚙️", actif: true },
  BCM: { code: "BCM", nom: "Agent CMO", titre: "CMO", departement: "Marketing", emoji: "📣", actif: true },
  BCS: { code: "BCS", nom: "Agent CSO", titre: "CSO", departement: "Strategie", emoji: "🎯", actif: true },
};

/* ============ DASHBOARD VIEW ============ */
export function DashboardView() {
  const { setActiveView, setActiveBot } = useFrameMaster();

  const goToBot = (code: string) => {
    const bot = BOT_SHORTCUT[code];
    if (bot) {
      setActiveBot(bot as import("../../../app/v2/api/types").BotInfo);
      setActiveView("department");
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-4 max-w-5xl mx-auto">

        {/* Barre CarlOS proactive */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-blue-50 border rounded-xl px-4 py-3">
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-blue-300 shrink-0">
            <img src="/agents/ceo-carlos.png" alt="CarlOS" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">
              <span className="font-semibold">CarlOS:</span>{" "}
              2 approbations urgentes. Call MetalPro a 10h30. Pipeline a 475K$ (+12%). Vente +12%.
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => setActiveView("discussion")}
          >
            Repondre
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Row 1 : 5 blocs C-Level — briefing par departement */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <BlocCEO onClick={() => goToBot("BCO")} />
          <BlocCFO onClick={() => goToBot("BCF")} />
          <BlocCTO onClick={() => goToBot("BCT")} />
          <BlocCMO onClick={() => goToBot("BCM")} />
          <BlocCSO onClick={() => goToBot("BCS")} />
        </div>

        {/* Row 2 : 5 blocs outils — contenu reel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <BlocTaches onClick={() => setActiveView("discussion")} />
          <BlocCalendrier onClick={() => setActiveView("discussion")} />
          <BlocPipeline onClick={() => setActiveView("discussion")} />
          <BlocInfosIndustrie onClick={() => setActiveView("discussion")} />
          <BlocStatsMarche onClick={() => setActiveView("discussion")} />
        </div>
      </div>
    </ScrollArea>
  );
}
