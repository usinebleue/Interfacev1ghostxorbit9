/**
 * MesChantiersView.tsx — Pipeline Discussion → Mission → Chantier
 * CarlOS = gardien de l'organisation — il guide la promotion et l'abandon
 * 3 tabs synchro avec FrameMaster: Discussions | Missions | Chantiers
 * Navigation croisee: chaque entite lien vers ses parents/enfants
 * Briefing forms style "Mission Impossible" — parametres complets
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Flame,
  Target,
  MessageSquare,
  ChevronRight,
  Plus,
  Loader2,
  Check,
  X,
  Trash2,
  Search,
  ArrowUpRight,
  Clock,
  FileText,
  FolderKanban,
  Calendar,
  ArrowDownAZ,
  Rocket,
  BookOpen,
  Layers,
  Zap,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { useChantiers, useMissions, useDiscussions, useBureau, useProjets } from "../../api/hooks";
import { api } from "../../api/client";
import { BOT_AVATAR, REFLECTION_MODES } from "../../api/types";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { PageLayout } from "./layouts/PageLayout";

// ── Config ──

const CHALEUR_CONFIG = {
  brule: { gradient: "bg-gradient-to-r from-red-600 to-orange-500", dot: "bg-red-500", label: "Brule", border: "border-l-red-500", bg: "bg-red-50/50" },
  couve: { gradient: "bg-gradient-to-r from-amber-500 to-yellow-400", dot: "bg-amber-400", label: "Couve", border: "border-l-amber-400", bg: "bg-amber-50/30" },
  meurt: { gradient: "bg-gradient-to-r from-gray-400 to-gray-300", dot: "bg-gray-300", label: "Meurt", border: "border-l-gray-300", bg: "bg-gray-50" },
} as const;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Actif", color: "bg-green-500" },
  en_cours: { label: "En cours", color: "bg-blue-500" },
  en_attente: { label: "En attente", color: "bg-amber-400" },
  completee: { label: "Termine", color: "bg-gray-400" },
  archivee: { label: "Archive", color: "bg-gray-300" },
};

type TabId = "discussions" | "missions" | "projets" | "chantiers";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "discussions", label: "Discussions", icon: MessageSquare },
  { id: "missions", label: "Missions", icon: Target },
  { id: "projets", label: "Projets", icon: FolderKanban },
  { id: "chantiers", label: "Chantiers", icon: Flame },
];

const CHANTIER_TYPES = [
  { id: "strategique", label: "Strategique", color: "bg-blue-500" },
  { id: "technologique", label: "Technologique", color: "bg-violet-500" },
  { id: "organisationnel", label: "Organisationnel", color: "bg-green-500" },
  { id: "culturel", label: "Culturel", color: "bg-pink-500" },
  { id: "environnemental", label: "Environnemental", color: "bg-emerald-500" },
  { id: "operationnel", label: "Operationnel", color: "bg-orange-500" },
] as const;

// ── 12 bots C-Level (select options) ──

const BOT_OPTIONS = [
  { code: "BCO", label: "CarlOS", short: "CEO" },
  { code: "BCT", label: "Thierry", short: "CTO" },
  { code: "BCF", label: "Francois", short: "CFO" },
  { code: "BCM", label: "Martine", short: "CMO" },
  { code: "BCS", label: "Sophie", short: "CSO" },
  { code: "BOO", label: "Olivier", short: "COO" },
  { code: "BFA", label: "Fabien", short: "CPO" },
  { code: "BHR", label: "Helene", short: "CHRO" },
  { code: "BIO", label: "Ines", short: "CINO" },
  { code: "BRO", label: "Raphael", short: "CRO" },
  { code: "BLE", label: "Louise", short: "CLO" },
  { code: "BSE", label: "Sebastien", short: "CISO" },
] as const;

const BOT_GRADIENTS: Record<string, string> = {
  BCO: "from-blue-600 to-blue-500",
  BCT: "from-violet-600 to-violet-500",
  BCF: "from-emerald-600 to-emerald-500",
  BCM: "from-pink-600 to-pink-500",
  BCS: "from-red-600 to-red-500",
  BOO: "from-orange-600 to-orange-500",
  BFA: "from-amber-600 to-amber-500",
  BHR: "from-teal-600 to-teal-500",
  BIO: "from-rose-600 to-rose-500",
  BRO: "from-amber-600 to-amber-500",
  BLE: "from-indigo-600 to-indigo-500",
  BSE: "from-gray-600 to-gray-500",
};

// ── Playbook type gradients (harmonisés avec CHANTIER_TYPES) ──

const PLAYBOOK_GRADIENTS: Record<string, string> = {
  strategique: "from-blue-600 to-blue-500",
  technologique: "from-violet-600 to-violet-500",
  organisationnel: "from-green-600 to-green-500",
  culturel: "from-pink-600 to-pink-500",
  environnemental: "from-emerald-600 to-emerald-500",
  operationnel: "from-orange-600 to-orange-500",
};

// ── Presets Projets — templates courants par type de chantier ──

const PRESET_PROJETS = [
  {
    id: "audit-si",
    titre: "Audit SI & Infrastructure",
    description: "Cartographier les systemes existants, evaluer la maturite technologique et identifier les gaps critiques.",
    type: "technologique",
    bots: ["BCT", "BIO"],
    missions_suggerees: 3,
  },
  {
    id: "plan-marketing",
    titre: "Plan Marketing Strategique",
    description: "Definir le positionnement, les canaux d'acquisition et le plan de contenu pour les 12 prochains mois.",
    type: "strategique",
    bots: ["BCM", "BCS"],
    missions_suggerees: 4,
  },
  {
    id: "lean-ops",
    titre: "Optimisation Lean Operations",
    description: "Cartographier les processus, eliminer les gaspillages et implanter les indicateurs de performance.",
    type: "operationnel",
    bots: ["BOO", "BFA"],
    missions_suggerees: 5,
  },
  {
    id: "bilan-carbone",
    titre: "Bilan Carbone & Conformite ESG",
    description: "Mesurer l'empreinte carbone, identifier les leviers de reduction et preparer la certification.",
    type: "environnemental",
    bots: ["BOO", "BCF"],
    missions_suggerees: 3,
  },
  {
    id: "culture-innovation",
    titre: "Programme Innovation Interne",
    description: "Deployer un programme d'ideation, former les equipes et structurer le pipeline d'innovation.",
    type: "culturel",
    bots: ["BIO", "BHR"],
    missions_suggerees: 4,
  },
  {
    id: "restructuration",
    titre: "Restructuration Organisationnelle",
    description: "Redefinir les roles, optimiser les equipes et accompagner le changement avec un plan de transition.",
    type: "organisationnel",
    bots: ["BHR", "BOO"],
    missions_suggerees: 4,
  },
] as const;

type PrioriteLevel = "haute" | "moyenne" | "basse";
const PRIORITE_TO_NUMBER: Record<PrioriteLevel, number> = { haute: 80, moyenne: 50, basse: 20 };

// ── Mission Briefing Form — style "Mission Impossible" ──

interface MissionBriefingData {
  titre: string;
  description: string;
  bot_primaire: string;
  priorite: number;
  contexte: Record<string, unknown>;
}

function MissionBriefingForm({ onSubmit, onCancel, defaultBot }: {
  onSubmit: (data: MissionBriefingData) => void;
  onCancel: () => void;
  defaultBot?: string;
}) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [botPrimaire, setBotPrimaire] = useState(defaultBot || "BCO");
  const [priorite, setPriorite] = useState<PrioriteLevel>("moyenne");
  const [objectif, setObjectif] = useState("");
  const [delai, setDelai] = useState("");
  const titreRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titreRef.current?.focus(); }, []);

  const handleSubmit = () => {
    if (!titre.trim()) return;
    onSubmit({
      titre: titre.trim(),
      description: description.trim(),
      bot_primaire: botPrimaire,
      priorite: PRIORITE_TO_NUMBER[priorite],
      contexte: {
        ...(objectif && { objectif_specifique: objectif }),
        ...(delai && { delai_cible: delai }),
      },
    });
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2.5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Briefing Mission</span>
        </div>
        <button onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Titre */}
      <div>
        <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Nom de la mission</label>
        <input
          ref={titreRef}
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
          placeholder="Ex: Audit fournisseurs Q2..."
          className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-300"
        />
      </div>

      {/* Brief */}
      <div>
        <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Brief</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description courte de la mission..."
          rows={2}
          className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-300 resize-none"
        />
      </div>

      {/* Bot primaire + Priorite */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Bot responsable</label>
          <select
            value={botPrimaire}
            onChange={(e) => setBotPrimaire(e.target.value)}
            className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer"
          >
            {BOT_OPTIONS.map((b) => (
              <option key={b.code} value={b.code}>{b.short} — {b.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Priorite</label>
          <div className="flex items-center gap-1">
            {(["haute", "moyenne", "basse"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriorite(p)}
                className={cn(
                  "text-[9px] font-medium px-2 py-1 rounded-full border cursor-pointer transition-colors",
                  priorite === p
                    ? p === "haute" ? "bg-red-500 text-white border-red-500"
                    : p === "moyenne" ? "bg-amber-400 text-white border-amber-400"
                    : "bg-gray-400 text-white border-gray-400"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                )}
              >
                {p === "haute" ? "Haute" : p === "moyenne" ? "Moyenne" : "Basse"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Objectif + Delai */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Objectif</label>
          <input
            type="text"
            value={objectif}
            onChange={(e) => setObjectif(e.target.value)}
            placeholder="Resultat attendu..."
            className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-300"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Delai cible</label>
          <input
            type="text"
            value={delai}
            onChange={(e) => setDelai(e.target.value)}
            placeholder="Ex: 2 semaines, 15 mars..."
            className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!titre.trim()}
          className="text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 px-4 py-1.5 rounded-lg cursor-pointer transition-colors"
        >
          Lancer la mission
        </button>
      </div>
    </div>
  );
}

// ── Chantier Briefing Form — style "Mission Impossible" ──

interface ChantierBriefingData {
  titre: string;
  description: string;
  chaleur: string;
  bot_codes: string[];
  type_chantier: string;
  objectifs: string[];
  echeance: string;
  participants: { type: string; code?: string; nom?: string; role: string }[];
}

function ChantierBriefingForm({ onSubmit, onCancel }: {
  onSubmit: (data: ChantierBriefingData) => void;
  onCancel: () => void;
}) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [chaleur, setChaleur] = useState<"brule" | "couve" | "meurt">("couve");
  const [selectedBots, setSelectedBots] = useState<Set<string>>(new Set());
  const [typeChantier, setTypeChantier] = useState("operationnel");
  const [objectifs, setObjectifs] = useState<string[]>([]);
  const [newObjectif, setNewObjectif] = useState("");
  const [echeance, setEcheance] = useState("");
  const titreRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titreRef.current?.focus(); }, []);

  const toggleBot = (code: string) => {
    setSelectedBots((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const addObjectif = () => {
    if (newObjectif.trim()) {
      setObjectifs(prev => [...prev, newObjectif.trim()]);
      setNewObjectif("");
    }
  };

  const handleSubmit = () => {
    if (!titre.trim()) return;
    const participants = Array.from(selectedBots).map((code, i) => ({
      type: "bot" as const, code, role: i === 0 ? "pilote" : "support",
    }));
    onSubmit({
      titre: titre.trim(),
      description: description.trim(),
      chaleur,
      bot_codes: Array.from(selectedBots),
      type_chantier: typeChantier,
      objectifs,
      echeance,
      participants,
    });
  };

  const chaleurOptions = [
    { id: "brule" as const, label: "Brule", activeBg: "bg-red-500", dot: "bg-red-500" },
    { id: "couve" as const, label: "Couve", activeBg: "bg-amber-400", dot: "bg-amber-400" },
    { id: "meurt" as const, label: "Meurt", activeBg: "bg-gray-400", dot: "bg-gray-300" },
  ];

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2.5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Briefing Chantier</span>
        </div>
        <button onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Titre */}
      <div>
        <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Nom du chantier</label>
        <input
          ref={titreRef}
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
          placeholder="Ex: Expansion marche US, Certification ISO..."
          className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-300"
        />
      </div>

      {/* Brief */}
      <div>
        <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Brief</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Vision et objectifs du chantier..."
          rows={2}
          className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-300 resize-none"
        />
      </div>

      {/* Chaleur */}
      <div>
        <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Niveau de chaleur</label>
        <div className="flex items-center gap-1.5">
          {chaleurOptions.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setChaleur(c.id)}
              className={cn(
                "text-[9px] font-medium px-2.5 py-1 rounded-full border cursor-pointer transition-colors flex items-center gap-1",
                chaleur === c.id
                  ? `${c.activeBg} text-white border-transparent`
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              )}
            >
              <div className={cn("w-1.5 h-1.5 rounded-full", chaleur === c.id ? "bg-white/70" : c.dot)} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type de chantier */}
      <div>
        <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Type de transformation</label>
        <div className="flex flex-wrap gap-1">
          {CHANTIER_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeChantier(t.id)}
              className={cn(
                "text-[9px] font-medium px-2 py-0.5 rounded-full border cursor-pointer transition-colors",
                typeChantier === t.id
                  ? `${t.color} text-white border-transparent`
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Objectifs + Echeance */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Objectifs</label>
          <div className="space-y-1">
            {objectifs.map((obj, i) => (
              <div key={i} className="flex items-center gap-1 text-[9px] text-gray-600">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span className="truncate">{obj}</span>
                <button onClick={() => setObjectifs(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-400 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newObjectif}
                onChange={(e) => setNewObjectif(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addObjectif(); } }}
                placeholder="+ Objectif..."
                className="flex-1 text-[9px] px-2 py-1 border rounded bg-white outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Echeance</label>
          <input
            type="date"
            value={echeance}
            onChange={(e) => setEcheance(e.target.value)}
            className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Departements impliques */}
      <div>
        <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Departements impliques</label>
        <div className="flex flex-wrap gap-1">
          {BOT_OPTIONS.map((b) => (
            <button
              key={b.code}
              type="button"
              onClick={() => toggleBot(b.code)}
              className={cn(
                "text-[9px] font-medium px-2 py-0.5 rounded-full border cursor-pointer transition-colors",
                selectedBots.has(b.code)
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-blue-50"
              )}
            >
              {b.short}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!titre.trim()}
          className="text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-40 px-4 py-1.5 rounded-lg cursor-pointer transition-colors"
        >
          Ouvrir le chantier
        </button>
      </div>
    </div>
  );
}

// ── Projet Briefing Form ──

interface ProjetBriefingData {
  titre: string;
  description: string;
  chantier_id?: number;
  bot_primaire: string;
  objectifs: string[];
  echeance: string;
}

function ProjetBriefingForm({ onSubmit, onCancel, chantiers, defaultValues }: {
  onSubmit: (data: ProjetBriefingData) => void;
  onCancel: () => void;
  chantiers: { id: number; titre: string }[];
  defaultValues?: { titre?: string; description?: string; bot_primaire?: string; objectifs?: string[] };
}) {
  const [titre, setTitre] = useState(defaultValues?.titre || "");
  const [description, setDescription] = useState(defaultValues?.description || "");
  const [chantierId, setChantierId] = useState<string>("");
  const [botPrimaire, setBotPrimaire] = useState(defaultValues?.bot_primaire || "BCO");
  const [objectifs, setObjectifs] = useState<string[]>(defaultValues?.objectifs || []);
  const [newObjectif, setNewObjectif] = useState("");
  const [echeance, setEcheance] = useState("");
  const titreRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titreRef.current?.focus(); }, []);

  // Reset when defaultValues change (preset selected)
  useEffect(() => {
    if (defaultValues) {
      setTitre(defaultValues.titre || "");
      setDescription(defaultValues.description || "");
      setBotPrimaire(defaultValues.bot_primaire || "BCO");
      setObjectifs(defaultValues.objectifs || []);
    }
  }, [defaultValues?.titre]);

  const addObjectif = () => {
    if (newObjectif.trim()) {
      setObjectifs(prev => [...prev, newObjectif.trim()]);
      setNewObjectif("");
    }
  };

  const handleSubmit = () => {
    if (!titre.trim()) return;
    onSubmit({
      titre: titre.trim(),
      description: description.trim(),
      chantier_id: chantierId ? Number(chantierId) : undefined,
      bot_primaire: botPrimaire,
      objectifs,
      echeance,
    });
  };

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 space-y-2.5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FolderKanban className="h-3.5 w-3.5 text-indigo-600" />
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Briefing Projet</span>
        </div>
        <button onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Nom du projet</label>
        <input
          ref={titreRef}
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
          placeholder="Ex: Migration ERP Phase 1..."
          className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-300"
        />
      </div>

      <div>
        <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Objectif et perimetre du projet..."
          rows={2}
          className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-300 resize-none"
        />
      </div>

      <div className="flex items-start gap-3">
        <div className="flex-1">
          <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Chantier parent</label>
          <select
            value={chantierId}
            onChange={(e) => setChantierId(e.target.value)}
            className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer"
          >
            <option value="">Aucun (independant)</option>
            {chantiers.map((ch) => (
              <option key={ch.id} value={ch.id}>{ch.titre}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Bot primaire</label>
          <select
            value={botPrimaire}
            onChange={(e) => setBotPrimaire(e.target.value)}
            className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer"
          >
            {BOT_OPTIONS.map((b) => (
              <option key={b.code} value={b.code}>{b.short} — {b.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Objectifs</label>
          <div className="space-y-1">
            {objectifs.map((obj, i) => (
              <div key={i} className="flex items-center gap-1 text-[9px] text-gray-600">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span className="truncate">{obj}</span>
                <button onClick={() => setObjectifs(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-400 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <input
              type="text"
              value={newObjectif}
              onChange={(e) => setNewObjectif(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addObjectif(); } }}
              placeholder="+ Objectif..."
              className="w-full text-[9px] px-2 py-1 border rounded bg-white outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-300"
            />
          </div>
        </div>
        <div>
          <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 block">Echeance</label>
          <input
            type="date"
            value={echeance}
            onChange={(e) => setEcheance(e.target.value)}
            className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300"
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!titre.trim()}
          className="text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 px-4 py-1.5 rounded-lg cursor-pointer transition-colors"
        >
          Creer le projet
        </button>
      </div>
    </div>
  );
}

// ── Main Component ──

export function MesChantiersView() {
  const { activeDiscussionTab, navigateDiscussionTab, setActiveView } = useFrameMaster();
  const activeTab = activeDiscussionTab as TabId;
  const [showInput, setShowInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pipelineSort, setPipelineSort] = useState<"date" | "nom">("date");
  const [viewMode, setViewMode] = useState<"carte" | "liste">("carte");
  // Phase 1A — briefing pour creer une mission dans un chantier specifique
  const [addMissionForChantierId, setAddMissionForChantierId] = useState<number | null>(null);
  // Phase 1B — inline input pour creer une discussion depuis une mission
  const [addDiscussionForMissionId, setAddDiscussionForMissionId] = useState<number | null>(null);
  // Phase 3 — regroupement missions orphelines en chantier
  const [showGroupFlow, setShowGroupFlow] = useState(false);
  const [selectedOrphanIds, setSelectedOrphanIds] = useState<Set<number>>(new Set());
  // Phase 3 — briefing chantier pour le groupement
  const [showGroupBriefing, setShowGroupBriefing] = useState(false);
  // Phase 7 — Playbooks
  const [showPlaybooks, setShowPlaybooks] = useState(false);
  const [playbooks, setPlaybooks] = useState<import("../../api/types").PlaybookSummary[]>([]);
  const [deployingPlaybook, setDeployingPlaybook] = useState<string | null>(null);
  // Preset projet — pre-fill le formulaire (dynamic from API + static fallback)
  const [selectedPreset, setSelectedPreset] = useState<typeof PRESET_PROJETS[number] | null>(null);
  // Templates projets catalogue (from API)
  const [templatesProjets, setTemplatesProjets] = useState<import("../../api/types").TemplateProjetCatalogue[]>([]);
  // Missions catalogue (from API)
  const [missionsCatalogue, setMissionsCatalogue] = useState<import("../../api/types").MissionCatalogue[]>([]);
  const [missionDeptFilter, setMissionDeptFilter] = useState<string | null>(null);
  const [projetTypeFilter, setProjetTypeFilter] = useState<string | null>(null);
  const [playbookTypeFilter, setPlaybookTypeFilter] = useState<string | null>(null);

  const { chantiers, loading: loadingChantiers, refresh: refreshChantiers } = useChantiers();
  const { projets, loading: loadingProjets, refresh: refreshProjets } = useProjets();
  const { missions, loading: loadingMissions, refresh: refreshMissions } = useMissions();
  const { discussions, promote: promoteDiscussion } = useDiscussions();
  const { items: bureauItems } = useBureau();
  const {
    threads, activeThreadId,
    resumeThread, deleteThread, newConversation,
  } = useChatContext();

  // ── Handlers enrichis (briefing complet) ──

  const handleNewChantier = useCallback(async (data: ChantierBriefingData) => {
    await api.createChantier({
      titre: data.titre,
      description: data.description,
      chaleur: data.chaleur,
      bot_codes: data.bot_codes,
      type_chantier: data.type_chantier,
      objectifs: data.objectifs,
      echeance: data.echeance || undefined,
      participants: data.participants,
    });
    await refreshChantiers();
    setShowInput(false);
  }, [refreshChantiers]);

  // Auto-load playbooks on mount
  useEffect(() => {
    api.listPlaybooks().then(list => setPlaybooks(list || [])).catch(() => {});
    api.listTemplatesProjetsCatalogue().then(list => setTemplatesProjets(list || [])).catch(() => {});
    api.listMissionsCatalogue().then(list => setMissionsCatalogue(list || [])).catch(() => {});
  }, []);

  const handleLoadPlaybooks = useCallback(async () => {
    const list = await api.listPlaybooks();
    setPlaybooks(list || []);
    setShowPlaybooks(true);
  }, []);

  const handleDeployPlaybook = useCallback(async (playbookId: string) => {
    setDeployingPlaybook(playbookId);
    try {
      await api.deployPlaybook(playbookId);
      await refreshChantiers();
      await refreshProjets();
      await refreshMissions();
      setShowPlaybooks(false);
    } finally {
      setDeployingPlaybook(null);
    }
  }, [refreshChantiers, refreshProjets, refreshMissions]);

  const handleNewProjet = useCallback(async (data: ProjetBriefingData) => {
    await api.createProjet({
      titre: data.titre,
      description: data.description,
      chantier_id: data.chantier_id,
      bot_primaire: data.bot_primaire,
      objectifs: data.objectifs,
      echeance: data.echeance || undefined,
    });
    await refreshProjets();
    setShowInput(false);
  }, [refreshProjets]);

  const handleNewMission = useCallback(async (data: MissionBriefingData) => {
    const m = await api.createMission({
      titre: data.titre,
      description: data.description,
      bot_primaire: data.bot_primaire,
      priorite: data.priorite,
      contexte: data.contexte,
    });
    if (m) newConversation();
    setShowInput(false);
    await refreshMissions();
  }, [newConversation, refreshMissions]);

  // Phase 1A — creer une mission rattachee a un chantier specifique
  const handleNewMissionForChantier = useCallback(async (data: MissionBriefingData, chantierId: number) => {
    await api.createMission({
      titre: data.titre,
      description: data.description,
      chantier_id: chantierId,
      bot_primaire: data.bot_primaire,
      priorite: data.priorite,
      contexte: data.contexte,
    });
    await refreshMissions();
    setAddMissionForChantierId(null);
  }, [refreshMissions]);

  // Phase 1B — lancer une conversation liee a une mission
  const handleNewDiscussionForMission = useCallback((missionId: number) => {
    newConversation();
    // Stocker le lien mission pending — sera rattache quand le thread sera cree
    sessionStorage.setItem("ghostx-pending-mission-link", String(missionId));
    setActiveView("live-chat");
  }, [newConversation, setActiveView]);

  const handlePromote = useCallback(async (threadId: string, titre: string) => {
    const disc = discussions.find(d => d.external_id === threadId);
    if (disc) {
      await promoteDiscussion(disc.id, titre);
      await refreshMissions();
    }
  }, [discussions, promoteDiscussion, refreshMissions]);

  // Phase 3 — handler pour grouper les orphelines en chantier (avec briefing enrichi)
  const handleGroupOrphans = useCallback(async (data: ChantierBriefingData) => {
    if (selectedOrphanIds.size === 0) return;
    const ch = await api.createChantier({
      titre: data.titre,
      description: data.description,
      chaleur: data.chaleur,
      bot_codes: data.bot_codes,
    });
    if (ch?.id) {
      await api.assignMissionsToChantier(ch.id, Array.from(selectedOrphanIds));
      await refreshMissions();
      await refreshChantiers();
    }
    setShowGroupFlow(false);
    setShowGroupBriefing(false);
    setSelectedOrphanIds(new Set());
  }, [selectedOrphanIds, refreshMissions, refreshChantiers]);

  // Filtrage
  const filteredThreads = threads
    .filter(t => !searchTerm || (t.title || "").toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (pipelineSort === "nom") return (a.title || "").localeCompare(b.title || "", "fr");
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  const filteredMissions = missions
    .filter(m => !searchTerm || m.titre.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => pipelineSort === "nom" ? a.titre.localeCompare(b.titre, "fr") : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const filteredProjets = projets
    .filter(p => !searchTerm || p.titre.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => pipelineSort === "nom" ? a.titre.localeCompare(b.titre, "fr") : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const filteredChantiers = chantiers
    .filter(ch => !searchTerm || ch.titre.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => pipelineSort === "nom" ? a.titre.localeCompare(b.titre, "fr") : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const searchPlaceholders: Record<TabId, string> = {
    discussions: "Rechercher une discussion...",
    missions: "Rechercher une mission...",
    projets: "Rechercher un projet...",
    chantiers: "Rechercher un chantier...",
  };

  const addLabels: Record<TabId, string> = {
    discussions: "Nouvelle discussion",
    missions: "Nouvelle mission",
    projets: "Nouveau projet",
    chantiers: "Nouveau chantier",
  };

  const handleAdd = () => {
    if (activeTab === "discussions") {
      newConversation();
      setActiveView("live-chat");
    } else {
      setShowInput(true);
    }
  };

  // Navigation croisee
  const goToMissions = () => { navigateDiscussionTab("missions"); setSearchTerm(""); };
  const goToProjets = () => { navigateDiscussionTab("projets"); setSearchTerm(""); };
  const goToChantiers = () => { navigateDiscussionTab("chantiers"); setSearchTerm(""); };
  const goToDiscussions = () => { navigateDiscussionTab("discussions"); setSearchTerm(""); };

  // CarlOS Gardien — nudges
  const activeThreads = threads.filter(t => t.status === "active");
  const stagnantThreads = threads.filter(t => {
    const age = Date.now() - new Date(t.updatedAt).getTime();
    return t.status === "active" && age > 7 * 24 * 60 * 60 * 1000;
  });
  const tooManyActive = activeThreads.length >= 3;
  const missionsAt100 = missions.filter(m => m.progression >= 100 && m.status !== "completee" && m.status !== "archivee");
  // Phase 3 — missions orphelines (sans chantier)
  const orphanMissions = missions.filter(m => !m.chantier_id && m.status !== "completee" && m.status !== "archivee");

  type Nudge = { message: string; type: "warning" | "info" | "success" };
  const nudges: Nudge[] = [];
  if (stagnantThreads.length > 0) {
    nudges.push({ message: `${stagnantThreads.length} discussion${stagnantThreads.length > 1 ? "s" : ""} inactive${stagnantThreads.length > 1 ? "s" : ""} depuis 7 jours. On les reprend ou on classe?`, type: "warning" });
  }
  if (tooManyActive) {
    nudges.push({ message: `${activeThreads.length} discussions ouvertes. On en clos une pour garder le focus?`, type: "info" });
  }
  if (missionsAt100.length > 0) {
    nudges.push({ message: `${missionsAt100.length} mission${missionsAt100.length > 1 ? "s" : ""} a 100%. On ferme ou il reste des elements?`, type: "success" });
  }
  // Phase 3 — nudge orphelines
  if (orphanMissions.length >= 3 && !showGroupFlow) {
    nudges.push({ message: `${orphanMissions.length} missions independantes. On les organise en chantier? Ca va t'aider a voir la progression globale.`, type: "info" });
  }

  return (
    <PageLayout maxWidth="5xl">

        {/* CarlOS Gardien — nudges */}
        {nudges.length > 0 && (
          <div className="space-y-1.5">
            {nudges.map((nudge, i) => (
              <div key={i} className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border",
                nudge.type === "warning" && "bg-amber-50 text-amber-700 border-amber-200",
                nudge.type === "info" && "bg-blue-50 text-blue-700 border-blue-200",
                nudge.type === "success" && "bg-green-50 text-green-700 border-green-200",
              )}>
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[9px] font-bold mr-1">CarlOS:</span>
                <span className="flex-1">{nudge.message}</span>
                {/* Phase 3 — bouton Organiser pour le nudge orphelines */}
                {nudge.message.includes("independantes") && (
                  <button
                    onClick={() => { setShowGroupFlow(true); navigateDiscussionTab("missions"); }}
                    className="text-[9px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-300 hover:bg-blue-100 cursor-pointer shrink-0"
                  >
                    Organiser
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Navigation Pipeline — rectangle gradient (pattern Pionniers) */}
        {(() => {
          const PIPELINE_GRADIENTS: Record<TabId, string> = {
            discussions: "from-violet-600 to-purple-600",
            missions: "from-green-600 to-emerald-600",
            projets: "from-indigo-600 to-blue-600",
            chantiers: "from-red-600 to-orange-600",
          };
          const PIPELINE_TITLES: Record<TabId, string> = {
            discussions: "Discussions",
            missions: "Missions",
            projets: "Projets",
            chantiers: "Chantiers",
          };
          const PIPELINE_SUBS: Record<TabId, string> = {
            discussions: "Explorez vos idees avec CarlOS et votre equipe",
            missions: "Objectifs tactiques — jours a semaines",
            projets: "Initiatives organisees — semaines a mois",
            chantiers: "Transformations strategiques — mois a trimestres",
          };
          const ActiveIcon = TABS.find(t => t.id === activeTab)?.icon || MessageSquare;
          return (
            <div className={cn("bg-gradient-to-r rounded-xl p-4 transition-all", PIPELINE_GRADIENTS[activeTab])}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                    <ActiveIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{PIPELINE_TITLES[activeTab]}</h2>
                    <p className="text-sm text-white/70 leading-relaxed">{PIPELINE_SUBS[activeTab]}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const count = tab.id === "discussions" ? threads.length
                      : tab.id === "missions" ? missions.length
                      : tab.id === "projets" ? projets.length
                      : chantiers.length;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => { navigateDiscussionTab(tab.id); setSearchTerm(""); setShowInput(false); }}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                          isActive
                            ? "bg-white/25 text-white shadow-sm"
                            : "text-white/60 hover:bg-white/10 hover:text-white/90"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {tab.label}
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                          isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/50"
                        )}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Header — search + sort + view + add */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholders[activeTab]}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-300"
            />
          </div>
          {/* Tri */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 shrink-0">
            <button onClick={() => setPipelineSort("date")} className={cn("flex items-center gap-1 px-2 py-1.5 rounded-md text-[9px] font-medium transition-colors cursor-pointer", pipelineSort === "date" ? "bg-white text-gray-700 shadow-sm" : "text-gray-400 hover:text-gray-600")}>
              <Clock className="h-3.5 w-3.5" /> Date
            </button>
            <button onClick={() => setPipelineSort("nom")} className={cn("flex items-center gap-1 px-2 py-1.5 rounded-md text-[9px] font-medium transition-colors cursor-pointer", pipelineSort === "nom" ? "bg-white text-gray-700 shadow-sm" : "text-gray-400 hover:text-gray-600")}>
              <ArrowDownAZ className="h-3.5 w-3.5" /> Nom
            </button>
          </div>
          {/* Vue */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 shrink-0">
            <button onClick={() => setViewMode("carte")} className={cn("p-1.5 rounded-md transition-colors cursor-pointer", viewMode === "carte" ? "bg-white text-gray-700 shadow-sm" : "text-gray-400 hover:text-gray-600")}>
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setViewMode("liste")} className={cn("p-1.5 rounded-md transition-colors cursor-pointer", viewMode === "liste" ? "bg-white text-gray-700 shadow-sm" : "text-gray-400 hover:text-gray-600")}>
              <LayoutList className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            {addLabels[activeTab]}
          </button>
        </div>

        {/* Briefing forms (missions + chantiers) — remplace InlineInput */}
        {showInput && activeTab === "chantiers" && (
          <ChantierBriefingForm
            onSubmit={handleNewChantier}
            onCancel={() => setShowInput(false)}
          />
        )}
        {showInput && activeTab === "missions" && (
          <MissionBriefingForm
            onSubmit={handleNewMission}
            onCancel={() => setShowInput(false)}
          />
        )}
        {showInput && activeTab === "projets" && (
          <ProjetBriefingForm
            onSubmit={(data) => { handleNewProjet(data); setSelectedPreset(null); }}
            onCancel={() => { setShowInput(false); setSelectedPreset(null); }}
            chantiers={chantiers}
            defaultValues={selectedPreset ? {
              titre: selectedPreset.titre,
              description: selectedPreset.description,
              bot_primaire: selectedPreset.bots[0],
            } : undefined}
          />
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: DISCUSSIONS                       */}
        {/* ══════════════════════════════════════ */}
        {activeTab === "discussions" && (
          <div>
            {filteredThreads.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">
                {searchTerm ? "Aucune discussion ne correspond." : "Aucune discussion. Lance une nouvelle conversation pour commencer."}
              </div>
            ) : (
              <div className={viewMode === "carte" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-2"}>
                {filteredThreads.map((thread) => {
                  const msgCount = thread.messages?.length || 0;
                  const shouldSuggestPromotion = msgCount >= 5 && !thread.missionId;
                  const linkedMission = thread.missionId
                    ? missions.find(m => String(m.id) === thread.missionId)
                    : null;
                  const botCode = thread.primaryBot || "BCO";
                  const botAvatar = BOT_AVATAR[botCode];
                  const botGradient = BOT_GRADIENTS[botCode] || "from-blue-600 to-blue-500";
                  const botInfo = BOT_OPTIONS.find(b => b.code === botCode);
                  const modeInfo = REFLECTION_MODES.find(m => m.id === thread.mode);
                  const lastMsg = thread.messages?.[thread.messages.length - 1];
                  const dateStr = thread.createdAt ? new Date(thread.createdAt).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) : "";
                  const threadClick = () => { resumeThread(thread.id); setActiveView("live-chat"); };
                  if (viewMode === "liste") {
                    return (
                      <Card key={thread.id} className={cn("px-4 py-3 hover:shadow-md transition-shadow cursor-pointer group", thread.id === activeThreadId && "ring-2 ring-violet-400")} onClick={threadClick}>
                        <div className="flex items-center gap-3">
                          {botAvatar ? (
                            <img src={botAvatar} alt={botCode} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className={cn("w-8 h-8 bg-gradient-to-r rounded-lg flex items-center justify-center shrink-0", botGradient)}>
                              <MessageSquare className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-700 truncate">{thread.title || "Discussion sans titre"}</div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{botInfo?.label || botCode}</Badge>
                              <span className="text-[9px] text-gray-400">{msgCount} msg</span>
                              {dateStr && <span className="text-[9px] text-gray-400">{dateStr}</span>}
                              {modeInfo && modeInfo.id !== "credo" && <span className={cn("text-[9px] text-white px-1.5 py-0 rounded-full", modeInfo.color)}>{modeInfo.label}</span>}
                              {linkedMission && <span className="text-[9px] text-green-600">{linkedMission.titre}</span>}
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); deleteThread(thread.id); }} className="text-gray-300 hover:text-red-400 transition-colors p-0.5 cursor-pointer opacity-0 group-hover:opacity-100">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                        </div>
                      </Card>
                    );
                  }
                  // Vue carte
                  return (
                    <Card
                      key={thread.id}
                      className={cn(
                        "group overflow-hidden hover:shadow-lg transition-all cursor-pointer",
                        thread.id === activeThreadId && "ring-2 ring-violet-400"
                      )}
                      onClick={threadClick}
                    >
                      <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center gap-2.5", botGradient)}>
                        {botAvatar ? (
                          <img src={botAvatar} alt={botCode} className="w-8 h-8 rounded-lg object-cover border-2 border-white/30 shrink-0" />
                        ) : (
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                            <MessageSquare className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-white">{botInfo?.label || botCode}</span>
                          <span className="text-[9px] text-white/60 ml-1.5">Agent {botInfo?.short}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteThread(thread.id); }}
                          className="text-white/30 hover:text-white transition-colors p-0.5 cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="px-3 py-3 space-y-2">
                        <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-relaxed">{thread.title || "Discussion sans titre"}</h3>
                        {lastMsg && (
                          <p className="text-[9px] text-gray-400 line-clamp-2 leading-relaxed">{lastMsg.text?.slice(0, 120)}</p>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {msgCount}
                          </span>
                          {dateStr && (
                            <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                              <Clock className="h-3.5 w-3.5" />
                              {dateStr}
                            </span>
                          )}
                          {modeInfo && modeInfo.id !== "credo" && (
                            <span className={cn("text-[9px] text-white px-1.5 py-0.5 rounded-full font-medium", modeInfo.color)}>
                              {modeInfo.label}
                            </span>
                          )}
                          {thread.status === "parked" && (
                            <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-medium">
                              Parkee
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {linkedMission && (
                            <button
                              onClick={(e) => { e.stopPropagation(); goToMissions(); }}
                              className="text-[9px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 hover:bg-green-100 cursor-pointer"
                            >
                              <Target className="h-3.5 w-3.5" />
                              {linkedMission.titre}
                            </button>
                          )}
                          {shouldSuggestPromotion && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePromote(thread.id, thread.title || "Discussion sans titre");
                              }}
                              className="text-[9px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 hover:bg-blue-100 cursor-pointer"
                            >
                              <ArrowUpRight className="h-3.5 w-3.5" />
                              Promouvoir
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: MISSIONS                          */}
        {/* ══════════════════════════════════════ */}
        {activeTab === "missions" && (
          <div className="space-y-2">
            {/* Phase 3 — Grouping flow: organiser des missions orphelines en chantier */}
            {showGroupFlow && orphanMissions.length > 0 && !showGroupBriefing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">Selectionner les missions a regrouper</span>
                  </div>
                  <button onClick={() => { setShowGroupFlow(false); setSelectedOrphanIds(new Set()); }} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {orphanMissions.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:bg-blue-100 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedOrphanIds.has(m.id)}
                        onChange={() => {
                          setSelectedOrphanIds((prev) => {
                            const next = new Set(prev);
                            next.has(m.id) ? next.delete(m.id) : next.add(m.id);
                            return next;
                          });
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="truncate">{m.titre}</span>
                      {m.bot_primaire && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{m.bot_primaire}</Badge>
                      )}
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setShowGroupFlow(false); setSelectedOrphanIds(new Set()); }}
                    className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer px-2 py-1"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => setShowGroupBriefing(true)}
                    disabled={selectedOrphanIds.size === 0}
                    className="text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 px-3 py-1 rounded-lg cursor-pointer"
                  >
                    Suivant ({selectedOrphanIds.size} missions)
                  </button>
                </div>
              </div>
            )}
            {/* Phase 3 — briefing du chantier pour le groupement */}
            {showGroupBriefing && (
              <ChantierBriefingForm
                onSubmit={handleGroupOrphans}
                onCancel={() => { setShowGroupBriefing(false); setShowGroupFlow(false); setSelectedOrphanIds(new Set()); }}
              />
            )}
            {/* Templates Missions — gradient cards groupees par departement */}
            {!showInput && !showGroupFlow && missionsCatalogue.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Target className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Types de missions recurrentes ({missionsCatalogue.length})</span>
                </div>
                {/* Filtre departement */}
                <div className="flex gap-1.5 flex-wrap mb-3">
                  <button onClick={() => setMissionDeptFilter(null)} className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer", !missionDeptFilter ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}>
                    Tous ({missionsCatalogue.length})
                  </button>
                  {[...new Set(missionsCatalogue.map(mc => mc.bot_primaire))].map(bot => {
                    const bi = BOT_OPTIONS.find(b => b.code === bot);
                    return (
                      <button key={bot} onClick={() => setMissionDeptFilter(bot === missionDeptFilter ? null : bot)}
                        className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer", missionDeptFilter === bot ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
                      >
                        {bi?.label || bot} ({missionsCatalogue.filter(mc => mc.bot_primaire === bot).length})
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {(missionDeptFilter ? missionsCatalogue.filter(mc => mc.bot_primaire === missionDeptFilter) : missionsCatalogue.slice(0, 9)).map((mc) => {
                    const botName = BOT_OPTIONS.find(b => b.code === mc.bot_primaire)?.label || mc.bot_primaire;
                    const gradient = BOT_GRADIENTS[mc.bot_primaire] || "from-green-600 to-green-500";
                    const freqLabel = mc.frequence_typique === "mensuelle" ? "Mensuel" : mc.frequence_typique === "trimestrielle" ? "Trimestriel" : mc.frequence_typique === "annuelle" ? "Annuel" : mc.frequence_typique === "ponctuelle" ? "Ponctuel" : mc.frequence_typique;
                    return (
                      <Card
                        key={mc.id}
                        className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => setShowInput(true)}
                      >
                        <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center gap-2.5", gradient)}>
                          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                            <Target className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-bold text-white truncate">{mc.titre}</h3>
                            <span className="text-[9px] text-white/60">{botName}</span>
                          </div>
                        </div>
                        <div className="px-3 py-2.5 space-y-1.5">
                          <p className="text-[9px] text-gray-500 line-clamp-2 leading-relaxed">{mc.description}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-medium">{freqLabel}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{mc.duree_typique}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                {!missionDeptFilter && missionsCatalogue.length > 9 && (
                  <button onClick={() => setMissionDeptFilter("")} className="text-[9px] text-green-600 hover:text-green-700 mt-2 cursor-pointer">
                    Voir les {missionsCatalogue.length - 9} autres types...
                  </button>
                )}
                <div className="border-t border-gray-100 mt-3" />
              </div>
            )}
            {loadingMissions ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : filteredMissions.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">
                {searchTerm ? "Aucune mission ne correspond." : "Aucune mission. Promeus une discussion ou cree une mission directement."}
              </div>
            ) : (
              <div className={viewMode === "carte" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-2"}>
              {filteredMissions.map((m) => {
                const statusCfg = STATUS_LABELS[m.status] || STATUS_LABELS.active;
                const parentChantier = m.chantier_id ? chantiers.find(ch => ch.id === m.chantier_id) : null;
                const parentProjet = m.projet_id ? projets.find(p => p.id === m.projet_id) : null;
                const linkedThreadCount = m.thread_ids?.length || 0;
                const linkedDocsCount = bureauItems.filter(bi => bi.mission_id === m.id).length;
                const botInfo = BOT_OPTIONS.find(b => b.code === m.bot_primaire);
                const botAvatar = BOT_AVATAR[m.bot_primaire || "BCO"];
                const botGradient = BOT_GRADIENTS[m.bot_primaire || "BCO"] || "from-green-600 to-emerald-500";
                const missionClick = () => {
                  if (m.thread_ids?.[0]) { resumeThread(m.thread_ids[0]); setActiveView("live-chat"); }
                  else { newConversation(); setActiveView("live-chat"); }
                };
                if (viewMode === "liste") {
                  return (
                    <Card key={m.id} className="px-4 py-3 hover:shadow-md transition-shadow cursor-pointer" onClick={missionClick}>
                      <div className="flex items-center gap-3">
                        {botAvatar ? (
                          <img src={botAvatar} alt={m.bot_primaire} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className={cn("w-8 h-8 bg-gradient-to-r rounded-lg flex items-center justify-center shrink-0", botGradient)}>
                            <Target className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-700 truncate">{m.titre}</div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {m.bot_primaire && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{botInfo?.label || m.bot_primaire}</Badge>}
                            <span className="text-[9px] text-gray-400">{statusCfg.label}</span>
                            {parentChantier && <span className="text-[9px] text-amber-600">{parentChantier.titre}</span>}
                            {linkedThreadCount > 0 && <span className="text-[9px] text-violet-500">{linkedThreadCount} disc.</span>}
                          </div>
                        </div>
                        {m.progression != null && (
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-medium text-gray-500">{m.progression}%</span>
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${m.progression}%` }} />
                            </div>
                          </div>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                      </div>
                    </Card>
                  );
                }
                // Vue carte
                return (
                  <Card key={m.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={missionClick}>
                    <div className={cn("flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r", botGradient)}>
                      {botAvatar ? (
                        <img src={botAvatar} alt={m.bot_primaire} className="w-8 h-8 rounded-lg object-cover border-2 border-white/30 shrink-0" />
                      ) : (
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                          <Target className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-white truncate">{m.titre}</h3>
                        <span className="text-[9px] text-white/60">{botInfo?.label || m.bot_primaire} — Leader</span>
                      </div>
                      {m.progression != null && <span className="text-xs font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">{m.progression}%</span>}
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      {m.description && <p className="text-[9px] text-gray-400 line-clamp-2">{m.description}</p>}
                      <div className="flex items-center gap-2 flex-wrap">
                        {m.bot_primaire && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{botInfo?.label || m.bot_primaire}</Badge>}
                        <div className="flex items-center gap-1">
                          <div className={cn("w-1.5 h-1.5 rounded-full", statusCfg.color)} />
                          <span className="text-[9px] text-gray-400">{statusCfg.label}</span>
                        </div>
                        {linkedThreadCount > 0 && (
                          <button onClick={(e) => { e.stopPropagation(); goToDiscussions(); }} className="flex items-center gap-0.5 text-[9px] text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-full hover:bg-violet-100 cursor-pointer">
                            <MessageSquare className="h-3.5 w-3.5" /> {linkedThreadCount} disc.
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleNewDiscussionForMission(m.id); }} className="flex items-center gap-0.5 text-[9px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full hover:bg-blue-100 cursor-pointer">
                          <Plus className="h-3.5 w-3.5" /> Discussion
                        </button>
                        {parentProjet && (
                          <button onClick={(e) => { e.stopPropagation(); goToProjets(); }} className="flex items-center gap-0.5 text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full hover:bg-indigo-100 cursor-pointer">
                            <FolderKanban className="h-3.5 w-3.5" /> {parentProjet.titre}
                          </button>
                        )}
                        {parentChantier && (
                          <button onClick={(e) => { e.stopPropagation(); goToChantiers(); }} className="flex items-center gap-0.5 text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full hover:bg-amber-100 cursor-pointer">
                            <Flame className="h-3.5 w-3.5" /> {parentChantier.titre}
                          </button>
                        )}
                        {linkedDocsCount > 0 && (
                          <span className="flex items-center gap-0.5 text-[9px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-full">
                            <FileText className="h-3.5 w-3.5" /> {linkedDocsCount} doc{linkedDocsCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: PROJETS                             */}
        {/* ══════════════════════════════════════ */}
        {activeTab === "projets" && (
          <div>
            {/* Templates Projets — cartes pre-configurees (API + static fallback) */}
            {!showInput && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Templates — Demarrer avec une base solide ({templatesProjets.length > 0 ? templatesProjets.length : PRESET_PROJETS.length})</span>
                </div>
                {/* Filtre par type */}
                <div className="flex gap-1.5 flex-wrap mb-3">
                  <button onClick={() => setProjetTypeFilter(null)} className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer", !projetTypeFilter ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}>
                    Tous
                  </button>
                  {CHANTIER_TYPES.map(ct => (
                    <button key={ct.id} onClick={() => setProjetTypeFilter(ct.id === projetTypeFilter ? null : ct.id)}
                      className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer", projetTypeFilter === ct.id ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {(templatesProjets.length > 0 ? templatesProjets : PRESET_PROJETS).filter(preset => {
                    if (!projetTypeFilter) return true;
                    const type = "type_chantier_typique" in preset ? (preset as import("../../api/types").TemplateProjetCatalogue).type_chantier_typique : (preset as typeof PRESET_PROJETS[number]).type;
                    return type === projetTypeFilter;
                  }).map((preset) => {
                    const isApi = "type_chantier_typique" in preset;
                    const type = isApi ? (preset as import("../../api/types").TemplateProjetCatalogue).type_chantier_typique : (preset as typeof PRESET_PROJETS[number]).type;
                    const titre = preset.titre;
                    const desc = preset.description;
                    const bots = isApi ? [(preset as import("../../api/types").TemplateProjetCatalogue).bot_primaire, ...(preset as import("../../api/types").TemplateProjetCatalogue).bots_support] : (preset as typeof PRESET_PROJETS[number]).bots;
                    const nbMissions = isApi ? (preset as import("../../api/types").TemplateProjetCatalogue).missions_suggerees?.length || 0 : (preset as typeof PRESET_PROJETS[number]).missions_suggerees;
                    const duree = isApi ? (preset as import("../../api/types").TemplateProjetCatalogue).duree_estimee : undefined;
                    const gradient = PLAYBOOK_GRADIENTS[type] || "from-gray-600 to-gray-500";
                    const botNames = (bots as string[]).map(bc => BOT_OPTIONS.find(b => b.code === bc)?.label || bc).join(" + ");
                    return (
                      <Card
                        key={preset.id}
                        className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => {
                          setSelectedPreset({ id: preset.id, titre, description: desc, type: type as typeof PRESET_PROJETS[number]["type"], bots: bots as readonly string[], missions_suggerees: nbMissions as number } as typeof PRESET_PROJETS[number]);
                          setShowInput(true);
                        }}
                      >
                        <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center gap-2.5", gradient)}>
                          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                            <BookOpen className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-bold text-white truncate">{titre}</h3>
                            <span className="text-[9px] text-white/60 capitalize">{type}</span>
                          </div>
                        </div>
                        <div className="px-3 py-2.5 space-y-1.5">
                          <p className="text-[9px] text-gray-500 line-clamp-2 leading-relaxed">{desc}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">{nbMissions} missions</span>
                            {duree && <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{duree}</span>}
                            <span className="text-[9px] text-gray-400 ml-auto truncate">{botNames}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                <div className="border-t border-gray-100 mt-4" />
              </div>
            )}
            {loadingProjets ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : filteredProjets.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">
                {searchTerm ? "Aucun projet ne correspond." : "Aucun projet. Les projets organisent les missions d'un meme chantier."}
              </div>
            ) : (
              <div className={viewMode === "carte" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-2"}>
                {filteredProjets.map((p) => {
                  const projetMissions = missions.filter(m => m.projet_id === p.id);
                  const parentChantier = p.chantier_id
                    ? chantiers.find(ch => ch.id === p.chantier_id)
                    : null;
                  const botInfo = BOT_OPTIONS.find(b => b.code === p.bot_primaire);
                  const pBotAvatar = BOT_AVATAR[p.bot_primaire || "BCO"];
                  const pBotGradient = BOT_GRADIENTS[p.bot_primaire || "BCO"] || "from-indigo-600 to-indigo-500";
                  if (viewMode === "liste") {
                    return (
                      <Card key={p.id} className="px-4 py-3 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-3">
                          {pBotAvatar ? (
                            <img src={pBotAvatar} alt={p.bot_primaire} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className={cn("w-8 h-8 bg-gradient-to-r rounded-lg flex items-center justify-center shrink-0", pBotGradient)}>
                              <FolderKanban className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-700 truncate">{p.titre}</div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {p.bot_primaire && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{botInfo?.label || p.bot_primaire}</Badge>}
                              <span className="text-[9px] text-gray-400">{projetMissions.length} mission{projetMissions.length !== 1 ? "s" : ""}</span>
                              {parentChantier && <span className="text-[9px] text-amber-600">{parentChantier.titre}</span>}
                              {p.echeance && <span className="text-[9px] text-gray-400">{new Date(p.echeance).toLocaleDateString("fr-CA")}</span>}
                            </div>
                          </div>
                          {p.progression != null && (
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-medium text-gray-500">{p.progression}%</span>
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${p.progression}%` }} />
                              </div>
                            </div>
                          )}
                          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                        </div>
                      </Card>
                    );
                  }
                  // Vue carte
                  return (
                    <Card
                      key={p.id}
                      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className={cn("flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r", pBotGradient)}>
                        {pBotAvatar ? (
                          <img src={pBotAvatar} alt={p.bot_primaire} className="w-8 h-8 rounded-lg object-cover border-2 border-white/30 shrink-0" />
                        ) : (
                          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                            <FolderKanban className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-white truncate">{p.titre}</h3>
                          <span className="text-[9px] text-white/60">{botInfo?.label || p.bot_primaire} — Leader</span>
                        </div>
                        <span className="text-xs font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">{p.progression ?? 0}%</span>
                      </div>
                      <div className="px-4 py-3 space-y-2">
                        {p.description && (
                          <div className="text-[9px] text-gray-400 line-clamp-2">{p.description}</div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {p.bot_primaire && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{botInfo?.label || p.bot_primaire}</Badge>
                          )}
                          {parentChantier && (
                            <button
                              onClick={(e) => { e.stopPropagation(); goToChantiers(); }}
                              className="flex items-center gap-0.5 text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full hover:bg-amber-100 cursor-pointer"
                            >
                              <Flame className="h-3.5 w-3.5" />
                              {parentChantier.titre}
                            </button>
                          )}
                          {p.echeance && (
                            <span className="flex items-center gap-0.5 text-[9px] text-gray-500">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(p.echeance).toLocaleDateString("fr-CA")}
                            </span>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); goToMissions(); }}
                            className="flex items-center gap-0.5 text-[9px] text-gray-400 hover:text-blue-500 cursor-pointer"
                          >
                            <Target className="h-3.5 w-3.5" />
                            {projetMissions.length} mission{projetMissions.length !== 1 ? "s" : ""}
                          </button>
                        </div>
                        {projetMissions.length > 0 && (
                          <div className="space-y-1">
                            {projetMissions.slice(0, 3).map(m => {
                              const sCfg = STATUS_LABELS[m.status] || STATUS_LABELS.active;
                              return (
                                <div key={m.id} className="flex items-center gap-2 text-[9px] text-gray-500">
                                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", sCfg.color)} />
                                  <span className="truncate flex-1">{m.titre}</span>
                                  <span className="text-gray-400">{m.progression}%</span>
                                </div>
                              );
                            })}
                            {projetMissions.length > 3 && (
                              <span className="text-[9px] text-gray-400">+{projetMissions.length - 3} autres</span>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: CHANTIERS                         */}
        {/* ══════════════════════════════════════ */}
        {activeTab === "chantiers" && (
          <div>
            {/* ── Playbooks & Presets — toujours visible ── */}
            {!showInput && (
              <div className="space-y-4 mb-5">
                {/* Playbooks section */}
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Rocket className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Playbooks — Lancer un chantier complet en 1 clic ({playbooks.length})</span>
                  </div>
                  {/* Filtre par type de chantier */}
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    <button onClick={() => setPlaybookTypeFilter(null)} className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer", !playbookTypeFilter ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}>
                      Tous ({playbooks.length})
                    </button>
                    {CHANTIER_TYPES.map(ct => {
                      const count = playbooks.filter(pb => pb.type_chantier === ct.id).length;
                      if (count === 0) return null;
                      return (
                        <button key={ct.id} onClick={() => setPlaybookTypeFilter(ct.id === playbookTypeFilter ? null : ct.id)}
                          className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer", playbookTypeFilter === ct.id ? "bg-gray-900 text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200")}
                        >
                          {ct.label} ({count})
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {playbooks.filter(pb => !playbookTypeFilter || pb.type_chantier === playbookTypeFilter).map((pb) => {
                      const gradient = PLAYBOOK_GRADIENTS[pb.type_chantier] || "from-red-600 to-orange-500";
                      const botNames = pb.bots_suggeres.map(bc => BOT_OPTIONS.find(b => b.code === bc)?.label || bc).join(", ");
                      return (
                        <Card
                          key={pb.id}
                          className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                          onClick={() => handleDeployPlaybook(pb.id)}
                        >
                          <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center gap-2.5", gradient)}>
                            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                              <Rocket className="h-3.5 w-3.5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs font-bold text-white truncate">{pb.titre_template}</h3>
                              <span className="text-[9px] text-white/60 capitalize">{pb.type_chantier}</span>
                            </div>
                            {deployingPlaybook === pb.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-white shrink-0" />
                            ) : (
                              <Zap className="h-3.5 w-3.5 text-white/40 group-hover:text-white transition-colors shrink-0" />
                            )}
                          </div>
                          <div className="px-3 py-2.5 space-y-1.5">
                            <p className="text-[9px] text-gray-500 line-clamp-2 leading-relaxed">{pb.description}</p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-medium">{pb.nb_projets} projets</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 font-medium">{pb.nb_missions} missions</span>
                              <span className="text-[9px] text-gray-400 ml-auto truncate">{botNames}</span>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                    {playbooks.length === 0 && (
                      <div className="col-span-3 text-xs text-gray-400 text-center py-4">Chargement des playbooks...</div>
                    )}
                  </div>
                </div>

                {/* Separateur */}
                <div className="border-t border-gray-100" />
              </div>
            )}
            {loadingChantiers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : filteredChantiers.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">
                {searchTerm ? "Aucun chantier ne correspond." : "Aucun chantier. Les chantiers regroupent les missions qui convergent."}
              </div>
            ) : (
              <div className={viewMode === "carte" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-2"}>
                {filteredChantiers.map((ch) => {
                  const cfg = CHALEUR_CONFIG[ch.chaleur] || CHALEUR_CONFIG.couve;
                  const chantierMissions = missions.filter(m => m.chantier_id === ch.id);
                  const chantierProjets = projets.filter(p => p.chantier_id === ch.id);
                  const typeCfg = CHANTIER_TYPES.find(t => t.id === ch.type_chantier);
                  const totalCount = (ch.missions_count ?? chantierMissions.length) + chantierProjets.length;
                  const chLeaderCode = ch.bot_codes?.[0] || "BCO";
                  const chLeaderAvatar = BOT_AVATAR[chLeaderCode];
                  const chLeaderInfo = BOT_OPTIONS.find(b => b.code === chLeaderCode);
                  if (viewMode === "liste") {
                    return (
                      <Card key={ch.id} className="px-4 py-3 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-3">
                          {chLeaderAvatar ? (
                            <img src={chLeaderAvatar} alt={chLeaderCode} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", cfg.gradient)}>
                              <Flame className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-700 truncate">{ch.titre}</div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[9px] text-gray-400">{cfg.label}</span>
                              {typeCfg && <span className={cn("text-[9px] text-white px-1.5 py-0 rounded-full", typeCfg.color)}>{typeCfg.label}</span>}
                              <span className="text-[9px] text-gray-400">{chantierProjets.length} projet{chantierProjets.length !== 1 ? "s" : ""}</span>
                              <span className="text-[9px] text-gray-400">{ch.missions_count ?? chantierMissions.length} mission{(ch.missions_count ?? chantierMissions.length) !== 1 ? "s" : ""}</span>
                              {ch.echeance && <span className="text-[9px] text-gray-400">{new Date(ch.echeance).toLocaleDateString("fr-CA")}</span>}
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-500 shrink-0">{totalCount}</span>
                          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                        </div>
                      </Card>
                    );
                  }
                  // Vue carte
                  return (
                    <Card
                      key={ch.id}
                      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className={cn("flex items-center gap-2.5 px-4 py-2.5", cfg.gradient)}>
                        {chLeaderAvatar ? (
                          <img src={chLeaderAvatar} alt={chLeaderCode} className="w-8 h-8 rounded-lg object-cover border-2 border-white/30 shrink-0" />
                        ) : (
                          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                            <Flame className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-white truncate">{ch.titre}</h3>
                          <span className="text-[9px] text-white/60">{chLeaderInfo?.label || chLeaderCode} — Leader</span>
                        </div>
                        <span className="text-xs font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">{ch.missions_count ?? chantierMissions.length}</span>
                      </div>
                      <div className="px-4 py-3 space-y-2">
                        {ch.description && (
                          <div className="text-[9px] text-gray-400 line-clamp-2">{ch.description}</div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                            <span className="text-xs text-gray-500">{cfg.label}</span>
                            {typeCfg && (
                              <span className={cn("text-[9px] text-white px-1.5 py-0.5 rounded-full", typeCfg.color)}>
                                {typeCfg.label}
                              </span>
                            )}
                            {ch.echeance && (
                              <span className="flex items-center gap-0.5 text-[9px] text-gray-500">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(ch.echeance).toLocaleDateString("fr-CA")}
                              </span>
                            )}
                            {ch.bot_codes && ch.bot_codes.length > 0 && (
                              <div className="flex items-center gap-0.5">
                                {ch.bot_codes.slice(0, 4).map(bc => (
                                  <Badge key={bc} variant="secondary" className="text-[9px] px-1 py-0 h-3.5">{bc}</Badge>
                                ))}
                                {ch.bot_codes.length > 4 && (
                                  <span className="text-[9px] text-gray-400">+{ch.bot_codes.length - 4}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {chantierProjets.length > 0 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); goToProjets(); }}
                                className="flex items-center gap-0.5 text-[9px] text-indigo-500 hover:text-indigo-700 cursor-pointer"
                              >
                                <FolderKanban className="h-3.5 w-3.5" />
                                {chantierProjets.length} projet{chantierProjets.length !== 1 ? "s" : ""}
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); goToMissions(); }}
                              className="flex items-center gap-0.5 text-[9px] text-gray-400 hover:text-blue-500 cursor-pointer"
                            >
                              <Target className="h-3.5 w-3.5" />
                              {ch.missions_count ?? chantierMissions.length} mission{(ch.missions_count ?? chantierMissions.length) !== 1 ? "s" : ""}
                            </button>
                          </div>
                        </div>
                        {chantierMissions.length > 0 && (
                          <div className="space-y-1">
                            {chantierMissions.slice(0, 3).map(m => {
                              const sCfg = STATUS_LABELS[m.status] || STATUS_LABELS.active;
                              return (
                                <div key={m.id} className="flex items-center gap-2 text-[9px] text-gray-500">
                                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", sCfg.color)} />
                                  <span className="truncate flex-1">{m.titre}</span>
                                  <span className="text-gray-400">{m.progression}%</span>
                                </div>
                              );
                            })}
                            {chantierMissions.length > 3 && (
                              <span className="text-[9px] text-gray-400">+{chantierMissions.length - 3} autres</span>
                            )}
                          </div>
                        )}
                        {addMissionForChantierId === ch.id ? (
                          <MissionBriefingForm
                            onSubmit={(data) => handleNewMissionForChantier(data, ch.id)}
                            onCancel={() => setAddMissionForChantierId(null)}
                          />
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setAddMissionForChantierId(ch.id); }}
                            className="flex items-center gap-1 text-[9px] text-blue-500 hover:text-blue-700 font-medium cursor-pointer mt-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Mission
                          </button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

    </PageLayout>
  );
}
