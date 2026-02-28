/**
 * AgentSettingsView.tsx — Profil Jumeau Numerique
 * Design dual-panel: Humain (gauche) | Agent AI (droite)
 * Modes de decision, sliders parametres, configuration agent
 * Spec: MEGA-PROMPTS-FIGMA.md lignes 660-823
 */

import { useState } from "react";
import {
  ArrowLeft,
  User,
  Bot,
  Target,
  Zap,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  Mail,
  BookOpen,
  Briefcase,
  GraduationCap,
  Wrench,
  Globe,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { BOT_AVATAR, BOT_SUBTITLE } from "../../api/types";

// ── Modes de decision ──

interface DecisionMode {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const DECISION_MODES: DecisionMode[] = [
  { id: "strategique", label: "Strategique", description: "Analyse long terme, vision globale", icon: Target, color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
  { id: "tactique", label: "Tactique", description: "Decisions rapides, orientation action", icon: Zap, color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200" },
  { id: "analytique", label: "Analytique", description: "Data-driven, metriques et faits", icon: BarChart3, color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200" },
  { id: "creatif", label: "Creatif", description: "Innovation laterale, hors des sentiers", icon: Lightbulb, color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200" },
  { id: "crise", label: "Crise", description: "Urgence, prioritisation immediate", icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50 border-red-200" },
];

// ── Sections profil humain ──

interface ProfileSection {
  id: string;
  label: string;
  icon: React.ElementType;
  count?: number;
  content: string[];
}

const HUMAN_SECTIONS: ProfileSection[] = [
  { id: "contact", label: "Contact", icon: Mail, content: ["carl@ghostx.ai", "cfugere@usinebleue.ai", "+1 (514) xxx-xxxx"] },
  { id: "biographie", label: "Biographie", icon: BookOpen, content: ["26 ans d'experience entrepreneuriale", "7 entreprises fondees", "50M+ en ventes cumulees", "Fondateur du REAI (130+ manufacturiers)"] },
  { id: "objectifs", label: "Objectifs", icon: Target, count: 5, content: ["Lancer GhostX a 100 entreprises", "Deployer Orbit9 au Quebec", "Atteindre 1M$ ARR", "Recruter 9 Pionniers Bleus", "Automatiser 80% des operations"] },
  { id: "experience", label: "Experience", icon: Briefcase, count: 3, content: ["CEO, Usine Bleue AI (2024-present)", "Fondateur, REAI (2019-present)", "Entrepreneur serie (2000-present)"] },
  { id: "formation", label: "Formation", icon: GraduationCap, count: 2, content: ["Administration des affaires", "Certificat en gestion de projet"] },
  { id: "competences", label: "Competences", icon: Wrench, count: 15, content: ["Vente B2B", "Strategie d'affaires", "Leadership", "IA/Automatisation", "Manufacturier", "Gestion de reseau", "Negociation", "Marketing digital"] },
  { id: "langues", label: "Langues", icon: Globe, count: 3, content: ["Francais (natif)", "Anglais (bilingue)", "Espagnol (base)"] },
  { id: "kpis", label: "KPIs Perso", icon: TrendingUp, content: ["Rencontres/semaine: 12", "Deals en cours: 4", "Pipeline: 250K$", "NPS clients: 92"] },
];

// ── Bot configs ──

const BOT_TRISOCIATIONS: Record<string, string> = {
  BCO: "Bezos + Munger + Churchill",
  BCT: "Musk + Curie + Vinci",
  BCF: "Buffett + Munger + Franklin",
  BCM: "Disney + Jobs/Blakely + Oprah",
  BCS: "Sun Tzu + Thiel + Chanel",
  BOO: "Marc Aurele + Deming + Nightingale",
  BFA: "Ford + Toyota + Deming",
  BHR: "Maslow + Drucker + Sandberg",
  BIO: "Gates + Berners-Lee + Turing",
  BCC: "Jobs + Disney + Bernbach",
  BPO: "Jobs + Ries + Cagan",
  BRO: "Bezos + Cardone + Vaynerchuk",
  BLE: "Holmes + Brandeis + Ginsburg",
  BSE: "Schneier + Mitnick + Rivest",
};

const BOT_ROLES: Record<string, string> = {
  BCO: "CEO", BCT: "CTO", BCF: "CFO", BCM: "CMO",
  BCS: "CSO", BOO: "COO", BFA: "Factory", BHR: "CHRO",
  BIO: "CIO", BCC: "CCO", BPO: "CPO", BRO: "CRO",
  BLE: "Legal", BSE: "Security",
};

// ── Slider Component ──

function ParamSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <span className="text-xs font-bold text-gray-900">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
}

// ── Expandable Section ──

function ExpandableSection({ section }: { section: ProfileSection }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <span className="text-sm text-gray-700 flex-1">{section.label}</span>
        {section.count && (
          <span className="text-xs text-gray-400">({section.count})</span>
        )}
        {open ? (
          <ChevronDown className="h-3 w-3 text-gray-400" />
        ) : (
          <ChevronRight className="h-3 w-3 text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-3 pb-2.5 pl-9 space-y-1">
          {section.content.map((item, i) => (
            <p key={i} className="text-xs text-gray-500">{item}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main View ──

export function AgentSettingsView() {
  const { activeBotCode, activeBot, setActiveView } = useFrameMaster();
  const [activeMode, setActiveMode] = useState("strategique");
  const [params, setParams] = useState({
    tolerance_risque: 40,
    rapidite_vs_precision: 30,
    data_vs_intuition: 20,
    mode_consultatif: true,
  });

  const botName = activeBot?.nom || "Carlos";
  const botRole = BOT_ROLES[activeBotCode] || "CEO";
  const avatar = BOT_AVATAR[activeBotCode];
  const trisociation = BOT_TRISOCIATIONS[activeBotCode] || "Trisociation active";

  return (
    <div className="h-full overflow-auto bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-100 to-blue-50 border-b px-6 py-4">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => setActiveView("department")}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Profil Jumeau Numerique</h1>
            <p className="text-xs text-gray-500">Synchronisation entre Carl Entrepreneur et {botName}</p>
          </div>
          <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-300 text-[10px]">
            Sync temps reel
          </Badge>
        </div>
      </div>

      {/* Dual Panel Layout */}
      <div className="px-6 py-5 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── LEFT: Profil Humain ── */}
          <div className="space-y-4">
            {/* Identity Card */}
            <Card className="p-4 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <img
                    src="/agents/carl-fugere.jpg"
                    alt="Carl Fugere"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-200"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                    <User className="h-2 w-2 text-white" />
                  </span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Carl Fugere</h2>
                  <p className="text-xs text-gray-500">CEO & Fondateur</p>
                  <p className="text-xs text-blue-600">Usine Bleue AI</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px]">Entrepreneur</Badge>
                <Badge variant="outline" className="text-[10px]">26 ans XP</Badge>
                <Badge variant="outline" className="text-[10px]">REAI</Badge>
              </div>
            </Card>

            {/* Expandable Sections */}
            <Card className="overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Profil Humain
                </h3>
              </div>
              {HUMAN_SECTIONS.map((section) => (
                <ExpandableSection key={section.id} section={section} />
              ))}
            </Card>
          </div>

          {/* ── RIGHT: Configuration Agent AI ── */}
          <div className="space-y-4">
            {/* Identity Card */}
            <Card className="p-4 border-2" style={{ borderColor: activeBot?.couleur || "#1E40AF" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={botName}
                      className="w-14 h-14 rounded-full object-cover ring-2"
                      style={{ borderColor: activeBot?.couleur || "#1E40AF" }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-blue-200">
                      <Bot className="h-7 w-7 text-gray-500" />
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                    <Bot className="h-2 w-2 text-white" />
                  </span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">{botName}</h2>
                  <p className="text-xs text-gray-500">{botRole} · {BOT_SUBTITLE[activeBotCode] || "Agent AI"}</p>
                  <p className="text-xs text-purple-600">{trisociation}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className="text-[10px] bg-green-100 text-green-700 border-green-300" variant="outline">En ligne</Badge>
                <Badge variant="outline" className="text-[10px]">Trisociation active</Badge>
              </div>
            </Card>

            {/* Decision Modes — Grid 2x2 + 1 */}
            <Card className="overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                  <Bot className="h-3 w-3" />
                  Mode de Decision
                </h3>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {DECISION_MODES.slice(0, 4).map((mode) => {
                    const MIcon = mode.icon;
                    const isActive = activeMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setActiveMode(mode.id)}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all cursor-pointer",
                          isActive ? cn(mode.bgColor, "border-2 shadow-sm") : "bg-white border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <MIcon className={cn("h-3.5 w-3.5", isActive ? mode.color : "text-gray-400")} />
                          <span className={cn("text-xs font-semibold", isActive ? mode.color : "text-gray-700")}>{mode.label}</span>
                          {isActive && <Check className={cn("h-3 w-3 ml-auto", mode.color)} />}
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">{mode.description}</p>
                      </button>
                    );
                  })}
                </div>
                {/* 5th mode centered */}
                <div className="flex justify-center">
                  {DECISION_MODES.slice(4).map((mode) => {
                    const MIcon = mode.icon;
                    const isActive = activeMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setActiveMode(mode.id)}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all cursor-pointer w-1/2",
                          isActive ? cn(mode.bgColor, "border-2 shadow-sm") : "bg-white border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <MIcon className={cn("h-3.5 w-3.5", isActive ? mode.color : "text-gray-400")} />
                          <span className={cn("text-xs font-semibold", isActive ? mode.color : "text-gray-700")}>{mode.label}</span>
                          {isActive && <Check className={cn("h-3 w-3 ml-auto", mode.color)} />}
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">{mode.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Parameter Sliders */}
            <Card className="overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Parametres — Mode {DECISION_MODES.find(m => m.id === activeMode)?.label}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <ParamSlider
                  label="Tolerance risque"
                  value={params.tolerance_risque}
                  onChange={(v) => setParams({ ...params, tolerance_risque: v })}
                />
                <ParamSlider
                  label="Rapidite vs Precision"
                  value={params.rapidite_vs_precision}
                  onChange={(v) => setParams({ ...params, rapidite_vs_precision: v })}
                />
                <ParamSlider
                  label="Data vs Intuition"
                  value={params.data_vs_intuition}
                  onChange={(v) => setParams({ ...params, data_vs_intuition: v })}
                />
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs font-medium text-gray-700">Mode consultatif</span>
                    <p className="text-[10px] text-gray-400">L'agent demande avant d'agir</p>
                  </div>
                  <button
                    onClick={() => setParams({ ...params, mode_consultatif: !params.mode_consultatif })}
                    className={cn(
                      "w-10 h-5 rounded-full transition-colors cursor-pointer relative",
                      params.mode_consultatif ? "bg-blue-600" : "bg-gray-300"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                      params.mode_consultatif ? "translate-x-5" : "translate-x-0.5"
                    )} />
                  </button>
                </div>
              </div>
            </Card>

            {/* Personality Settings */}
            <Card className="overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Personnalite
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-700">Tonalite</p>
                    <p className="text-[10px] text-gray-400">Niveau de formalite</p>
                  </div>
                  <div className="flex gap-1">
                    {["Direct", "Equilibre", "Formel"].map((t) => (
                      <Badge key={t} variant={t === "Direct" ? "default" : "outline"} className="text-[10px] cursor-pointer">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-700">Profondeur d'analyse</p>
                    <p className="text-[10px] text-gray-400">Detail des reponses</p>
                  </div>
                  <div className="flex gap-1">
                    {["Rapide", "Standard", "Approfondi"].map((t) => (
                      <Badge key={t} variant={t === "Standard" ? "default" : "outline"} className="text-[10px] cursor-pointer">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-700">Notifications proactives</p>
                    <p className="text-[10px] text-gray-400">{botName} envoie des suggestions</p>
                  </div>
                  <Badge variant="default" className="text-[10px] cursor-pointer">Active</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
