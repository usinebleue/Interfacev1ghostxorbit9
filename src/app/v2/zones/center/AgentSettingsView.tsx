/**
 * AgentSettingsView.tsx — Reglage Agent AI
 * Design dual-panel: Humain (gauche) | Agent AI (droite)
 * Modes de decision, sliders parametres, trisociation en archetypes
 * D-061: Ghosts = Teintures Cognitives (pas des clones)
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
  Sparkles,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { BOT_AVATAR, BOT_SUBTITLE } from "../../api/types";

// ── Archetypes cognitifs (D-061: teintures, pas des clones) ──

interface Archetype {
  emoji: string;
  nom: string;
  categorie: string;
  signature: string;
}

const GHOST_ARCHETYPES: Record<string, Archetype> = {
  "Bezos":        { emoji: "📦", nom: "L'Architecte Client",      categorie: "Strategie",   signature: "Obsession client, vision a rebours" },
  "Jobs":         { emoji: "🍎", nom: "L'Epureur",                categorie: "Innovation",  signature: "Simplification radicale, zero compromis" },
  "Musk":         { emoji: "🚀", nom: "Le Disrupteur",            categorie: "Innovation",  signature: "Premiers principes, impatience productive" },
  "Sun Tzu":      { emoji: "⚔️", nom: "Le Stratege Silencieux",   categorie: "Strategie",   signature: "Gagner sans combattre, 3 coups d'avance" },
  "Munger":       { emoji: "🧠", nom: "L'Inverseur",              categorie: "Strategie",   signature: "Modeles mentaux croises, retourner le probleme" },
  "Marc Aurele":  { emoji: "🏛️", nom: "Le Stoique",               categorie: "Leadership",  signature: "Maitrise de soi, controle du controlable" },
  "Churchill":    { emoji: "🎩", nom: "L'Inebranlable",           categorie: "Leadership",  signature: "Courage en crise, perseverance absolue" },
  "Disney":       { emoji: "✨", nom: "Le Reveur Realiste",       categorie: "Creativite",  signature: "Storytelling, le client est le heros" },
  "Tesla":        { emoji: "⚡", nom: "Le Catalyseur",            categorie: "Innovation",  signature: "Patterns universels, resonance systemique" },
  "Buffett":      { emoji: "💰", nom: "Le Gardien de Valeur",     categorie: "Finance",     signature: "Patience disciplinee, cercle de competence" },
  "Curie":        { emoji: "🔬", nom: "La Methodique",            categorie: "Analyse",     signature: "Donnees avant conclusions, rigueur scientifique" },
  "Oprah":        { emoji: "💜", nom: "L'Authentique",            categorie: "Leadership",  signature: "Empathie, la verite que personne n'ose dire" },
  "Deming":       { emoji: "📊", nom: "Le Mesureur",              categorie: "Operations",  signature: "On n'ameliore pas ce qu'on ne mesure pas" },
  "Mandela":      { emoji: "✊", nom: "Le Transformateur",        categorie: "Leadership",  signature: "Resilience, le leadership est un service" },
  "Musashi":      { emoji: "🗡️", nom: "L'Artisan",                categorie: "Strategie",   signature: "Maitrise par la pratique quotidienne" },
  "Ohno":         { emoji: "🏭", nom: "Le Flux",                  categorie: "Operations",  signature: "Eliminer le gaspillage, aller voir sur le terrain" },
  "Machiavel":    { emoji: "🦊", nom: "Le Renard",                categorie: "Strategie",   signature: "Pragmatisme lucide, voir le pouvoir tel qu'il est" },
  // Ghosts supplementaires utilises dans les Trisociations
  "Vinci":        { emoji: "🎨", nom: "L'Universel",              categorie: "Creativite",  signature: "Polymathie, fusion art et science" },
  "Thiel":        { emoji: "🔮", nom: "Le Contrarian",            categorie: "Strategie",   signature: "Verites cachees, zero a un" },
  "Chanel":       { emoji: "👗", nom: "L'Elegante",               categorie: "Strategie",   signature: "Marque personnelle, elegance comme arme" },
  "Franklin":     { emoji: "📜", nom: "Le Fondateur Sage",        categorie: "Leadership",  signature: "Pragmatisme, autodiscipline, vertu" },
  "Nightingale":  { emoji: "🕯️", nom: "La Pionniere",             categorie: "Operations",  signature: "Innovation par les donnees, compassion systemique" },
};

const SLOT_LABELS = ["Primaire", "Calibrateur", "Amplificateur"];
const SLOT_COLORS = [
  "from-blue-600 to-blue-500",
  "from-violet-600 to-violet-500",
  "from-amber-600 to-amber-500",
];

// ── Trisociations par bot (ghost names → mapped to archetypes) ──

const BOT_GHOSTS: Record<string, string[]> = {
  BCO: ["Bezos", "Munger", "Churchill"],
  BCT: ["Musk", "Curie", "Vinci"],
  BCF: ["Buffett", "Munger", "Franklin"],
  BCM: ["Disney", "Jobs", "Oprah"],
  BCS: ["Sun Tzu", "Thiel", "Chanel"],
  BOO: ["Marc Aurele", "Deming", "Nightingale"],
  BFA: ["Ohno", "Deming", "Nightingale"],
  BHR: ["Oprah", "Marc Aurele", "Deming"],
  BIO: ["Musk", "Curie", "Tesla"],
  BCC: ["Jobs", "Disney", "Oprah"],
  BPO: ["Jobs", "Musk", "Disney"],
  BRO: ["Thiel", "Bezos", "Chanel"],
  BLE: ["Munger", "Franklin", "Marc Aurele"],
  BSE: ["Sun Tzu", "Curie", "Franklin"],
};

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

// ── Expandable Section (editable) ──

function ExpandableSection({ section, editing, editValues, onEditChange }: {
  section: ProfileSection;
  editing: boolean;
  editValues?: string[];
  onEditChange?: (index: number, value: string) => void;
}) {
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
          {(editValues || section.content).map((item, i) => (
            editing ? (
              <input
                key={i}
                value={item}
                onChange={(e) => onEditChange?.(i, e.target.value)}
                className="text-xs text-gray-700 w-full bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            ) : (
              <p key={i} className="text-xs text-gray-500">{item}</p>
            )
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
  // Editable profile state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState(() =>
    Object.fromEntries(HUMAN_SECTIONS.map(s => [s.id, [...s.content]]))
  );
  const [editName, setEditName] = useState("Carl Fugere");
  const [editTitle, setEditTitle] = useState("CEO & Fondateur");
  const [editOrg, setEditOrg] = useState("Usine Bleue AI");
  // Catalogue teintures
  const [expandedArchetype, setExpandedArchetype] = useState<string | null>(null);

  const botName = activeBot?.nom || "Carlos";
  const botRole = BOT_ROLES[activeBotCode] || "CEO";
  const avatar = BOT_AVATAR[activeBotCode];
  const ghosts = BOT_GHOSTS[activeBotCode] || ["Bezos", "Munger", "Churchill"];
  const ghostSet = new Set(ghosts);

  // All unique archetypes for catalogue (exclude duplicates from Trisociation-only extras)
  const allArchetypes = Object.entries(GHOST_ARCHETYPES);

  const categorieBadgeColor = (cat: string) =>
    cat === "Strategie" ? "text-blue-600 bg-blue-50" :
    cat === "Innovation" ? "text-violet-600 bg-violet-50" :
    cat === "Leadership" ? "text-amber-600 bg-amber-50" :
    cat === "Creativite" ? "text-pink-600 bg-pink-50" :
    cat === "Finance" ? "text-emerald-600 bg-emerald-50" :
    cat === "Analyse" ? "text-cyan-600 bg-cyan-50" :
    "text-orange-600 bg-orange-50";

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header — design system standard */}
      <div className="bg-white border-b px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView("department")}
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="text-sm font-bold text-gray-800">Reglage Agent AI</div>
              <div className="text-xs text-muted-foreground">Synchronisation Carl Entrepreneur — {botName}</div>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-[10px]">
            Sync active
          </Badge>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* ── LEFT: Profil Humain ── */}
            <div className="space-y-4">
              {/* Identity Card — compact */}
              <Card className="p-3 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src="/agents/carl-fugere.jpg"
                      alt="Carl Fugere"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-200"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                      <User className="h-2 w-2 text-white" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingProfile ? (
                      <div className="space-y-1">
                        <input value={editName} onChange={e => setEditName(e.target.value)} className="text-sm font-bold text-gray-900 w-full bg-white border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-xs text-gray-500 w-full bg-white border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        <input value={editOrg} onChange={e => setEditOrg(e.target.value)} className="text-xs text-blue-600 w-full bg-white border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-sm font-bold text-gray-900">{editName}</h2>
                        <p className="text-xs text-gray-500">{editTitle}</p>
                        <p className="text-xs text-blue-600">{editOrg}</p>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 shrink-0"
                    title={editingProfile ? "Sauvegarder" : "Modifier"}
                  >
                    {editingProfile ? <Save className="h-3.5 w-3.5 text-green-600" /> : <Pencil className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px]">Entrepreneur</Badge>
                  <Badge variant="outline" className="text-[10px]">26 ans XP</Badge>
                  <Badge variant="outline" className="text-[10px]">REAI</Badge>
                </div>
              </Card>

              {/* Expandable Sections — editable */}
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                  <User className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Profil Humain</span>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="ml-auto text-white/70 hover:text-white cursor-pointer p-0.5 rounded"
                    title={editingProfile ? "Terminer" : "Modifier"}
                  >
                    {editingProfile ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {HUMAN_SECTIONS.map((section) => (
                  <ExpandableSection
                    key={section.id}
                    section={section}
                    editing={editingProfile}
                    editValues={profileData[section.id]}
                    onEditChange={(idx, val) => {
                      const updated = { ...profileData };
                      updated[section.id] = [...updated[section.id]];
                      updated[section.id][idx] = val;
                      setProfileData(updated);
                    }}
                  />
                ))}
              </Card>
            </div>

            {/* ── RIGHT: Configuration Agent AI ── */}
            <div className="space-y-4">
              {/* Identity Card — compact */}
              <Card className="p-3 border" style={{ borderColor: activeBot?.couleur || "#1E40AF" }}>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={botName}
                        className="w-10 h-10 rounded-full object-cover ring-2"
                        style={{ borderColor: activeBot?.couleur || "#1E40AF" }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-blue-200">
                        <Bot className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                      <Bot className="h-2 w-2 text-white" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold text-gray-900">{botName}</h2>
                    <p className="text-xs text-gray-500">{botRole} · {BOT_SUBTITLE[activeBotCode] || "Agent AI"}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge className="text-[10px] bg-green-100 text-green-700 border-green-300" variant="outline">En ligne</Badge>
                  <Badge variant="outline" className="text-[10px]">Trisociation active</Badge>
                </div>
              </Card>

              {/* Trisociation — Teintures cognitives (lecture seule) */}
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-purple-500">
                  <Sparkles className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Teintures Cognitives</span>
                </div>
                <div className="p-3 space-y-2">
                  {ghosts.map((ghostName, i) => {
                    const arch = GHOST_ARCHETYPES[ghostName];
                    if (!arch) return null;
                    return (
                      <div key={ghostName} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shrink-0 bg-gradient-to-br",
                          SLOT_COLORS[i]
                        )}>
                          {arch.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800">{arch.nom}</span>
                            <Badge variant="outline" className="text-[9px] text-gray-500">{SLOT_LABELS[i]}</Badge>
                          </div>
                          <p className="text-[10px] text-gray-400 truncate">{arch.signature}</p>
                        </div>
                        <Badge variant="outline" className={cn("text-[9px] shrink-0", categorieBadgeColor(arch.categorie))}>{arch.categorie}</Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Catalogue des Teintures Cognitives */}
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
                  <Sparkles className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Catalogue — {allArchetypes.length} Teintures</span>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-1.5">
                    {allArchetypes.map(([name, arch]) => {
                      const isActive = ghostSet.has(name);
                      const isExpanded = expandedArchetype === name;
                      return (
                        <button
                          key={name}
                          onClick={() => setExpandedArchetype(isExpanded ? null : name)}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all cursor-pointer border",
                            isActive ? "bg-violet-50 border-violet-200" : "bg-white border-gray-100 hover:bg-gray-50"
                          )}
                        >
                          <span className="text-sm shrink-0">{arch.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] font-semibold text-gray-800 truncate">{arch.nom}</span>
                              {isActive && <Check className="h-3 w-3 text-violet-600 shrink-0" />}
                            </div>
                            {isExpanded && (
                              <div className="mt-1">
                                <p className="text-[10px] text-gray-500 leading-tight">{arch.signature}</p>
                                <Badge variant="outline" className={cn("text-[8px] mt-1", categorieBadgeColor(arch.categorie))}>{arch.categorie}</Badge>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Decision Modes — compact 5 en ligne */}
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500">
                  <Target className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Mode de Decision</span>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-5 gap-1.5">
                    {DECISION_MODES.map((mode) => {
                      const MIcon = mode.icon;
                      const isActive = activeMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setActiveMode(mode.id)}
                          className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all cursor-pointer",
                            isActive ? cn(mode.bgColor, "border-2 shadow-sm") : "bg-white border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <MIcon className={cn("h-4 w-4", isActive ? mode.color : "text-gray-400")} />
                          <span className={cn("text-[10px] font-semibold leading-tight", isActive ? mode.color : "text-gray-600")}>{mode.label}</span>
                          {isActive && <Check className={cn("h-3 w-3", mode.color)} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Parameter Sliders */}
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-500">
                  <BarChart3 className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Parametres — Mode {DECISION_MODES.find(m => m.id === activeMode)?.label}</span>
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
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-500">
                  <User className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Personnalite</span>
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
    </div>
  );
}
