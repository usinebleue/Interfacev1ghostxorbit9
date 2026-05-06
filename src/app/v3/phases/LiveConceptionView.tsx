/**
 * LiveConceptionView.tsx — Phase Conception V3 (composant natif)
 *
 * Remplace ConceptionWizard de SimAmorcer dans le rendering switch.
 * MEME LAYOUT que ConceptionWizard (sidebar w-48 + ConceptionBlock cards)
 * MAIS contenu FONCTIONNEL : chaque section envoie un prompt dans le chat.
 * Pas de stage gating — toutes les sections sont accessibles.
 */

import { useState } from "react";
import {
  Flame,
  Target,
  FolderOpen,
  ListChecks,
  Users,
  DollarSign,
  Calendar,
  Hammer,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { useChatContext } from "../../v2/context/ChatContext";
import { useAmorcer } from "../AmorcerContext";

// ═══ Section definitions (memes titres/icones que CONCEPTION_SECTIONS SimAmorcer) ═══
const CONCEPTION_SECTIONS = [
  { id: 1, title: "Vue d\u2019ensemble du chantier", icon: Flame, prompt: "D\u00e9finis la vue d\u2019ensemble du chantier \u2014 titre, description, p\u00e9rim\u00e8tre et chaleur" },
  { id: 2, title: "Objectifs & Crit\u00e8res de succ\u00e8s", icon: Target, prompt: "D\u00e9finis les objectifs SMART et les crit\u00e8res de succ\u00e8s mesurables du chantier" },
  { id: 3, title: "Projets identifi\u00e9s", icon: FolderOpen, prompt: "Identifie les projets n\u00e9cessaires pour atteindre les objectifs du chantier" },
  { id: 4, title: "Missions par projet", icon: Target, prompt: "D\u00e9compose chaque projet en missions concr\u00e8tes avec responsables et \u00e9ch\u00e9ances" },
  { id: 5, title: "T\u00e2ches par mission", icon: ListChecks, prompt: "D\u00e9taille les t\u00e2ches de chaque mission \u2014 actions, dur\u00e9e et d\u00e9pendances" },
  { id: 6, title: "\u00c9quipe & Attribution", icon: Users, prompt: "Propose la composition d\u2019\u00e9quipe et l\u2019attribution des r\u00f4les pour ce chantier" },
  { id: 7, title: "Budget & Ressources", icon: DollarSign, prompt: "Estime le budget et les ressources n\u00e9cessaires \u2014 humain, tech, mat\u00e9riel" },
  { id: 8, title: "Timeline & Jalons", icon: Calendar, prompt: "Cr\u00e9e la timeline du chantier avec les jalons cl\u00e9s et les d\u00e9pendances" },
] as const;

type SectionStatus = "todo" | "launched" | "validated";

interface LiveConceptionViewProps {
  context: string | null;
}

export function LiveConceptionView({ context }: LiveConceptionViewProps) {
  const [activeSection, setActiveSection] = useState(1);
  const [sectionStatus, setSectionStatus] = useState<Record<number, SectionStatus>>(
    Object.fromEntries(CONCEPTION_SECTIONS.map(s => [s.id, "todo"])) as Record<number, SectionStatus>
  );

  const { sendMessage } = useChatContext();
  const { activeBotCode } = useAmorcer();

  const validatedCount = Object.values(sectionStatus).filter(s => s === "validated").length;
  const progress = Math.round((validatedCount / 8) * 100);
  const allValidated = validatedCount === 8;

  const handleAsk = (sectionId: number) => {
    const section = CONCEPTION_SECTIONS.find(s => s.id === sectionId)!;
    const contextSuffix = context ? ` (contexte : ${context})` : "";
    sendMessage(section.prompt + contextSuffix, activeBotCode);
    setSectionStatus(prev => ({ ...prev, [sectionId]: "launched" }));
  };

  const handleChallenge = (sectionId: number) => {
    const section = CONCEPTION_SECTIONS.find(s => s.id === sectionId)!;
    sendMessage(`Challenge la section "${section.title}" \u2014 identifie les faiblesses et angles morts`, activeBotCode);
  };

  const handleAdjust = (sectionId: number) => {
    const section = CONCEPTION_SECTIONS.find(s => s.id === sectionId)!;
    sendMessage(`Ajuste la section "${section.title}" en prenant en compte les retours et corrections`, activeBotCode);
  };

  const handleValidate = (sectionId: number) => {
    setSectionStatus(prev => ({ ...prev, [sectionId]: "validated" }));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12">
      <div className="flex gap-4">
        {/* ═══ TOC SIDEBAR ═══ */}
        <div className="w-48 shrink-0 space-y-1">
          <div className="flex items-center gap-2 px-2 py-2">
            <Hammer className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-bold text-gray-800">Conception du Chantier</span>
          </div>

          {CONCEPTION_SECTIONS.map(s => {
            const isActive = s.id === activeSection;
            const status = sectionStatus[s.id];
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[10px] text-left transition-all cursor-pointer ${
                  status === "validated"
                    ? "bg-emerald-50 text-emerald-700 font-medium"
                    : isActive
                    ? "bg-yellow-50 text-yellow-700 font-medium"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {status === "validated" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : isActive || status === "launched" ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                <span className="truncate">{s.title}</span>
              </button>
            );
          })}

          <div className="mt-3 px-2 space-y-1">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] text-gray-500">{validatedCount}/8 valid\u00e9es</p>
          </div>
        </div>

        {/* ═══ CONTENT ═══ */}
        <div className="flex-1 space-y-3">
          {CONCEPTION_SECTIONS.filter(s => s.id === activeSection || sectionStatus[s.id] !== "todo").map(s => {
            const status = sectionStatus[s.id];
            const isActive = s.id === activeSection;
            const borderColor = status === "validated" ? "border-emerald-400" : (isActive || status === "launched") ? "border-yellow-400" : "border-gray-200";

            return (
              <div key={s.id} className={`rounded-lg border border-gray-200 border-l-[3px] ${borderColor} bg-white shadow-sm overflow-hidden`}>
                <div className="px-4 py-3 flex items-center gap-2">
                  <Hammer className="h-3.5 w-3.5 text-yellow-600" />
                  <span className="text-xs font-bold text-gray-800 flex-1">{s.id}. {s.title}</span>
                  {status === "validated" && (
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Valid\u00e9
                    </span>
                  )}
                  {status === "launched" && (
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-600">En cours</span>
                  )}
                </div>

                <div className="px-4 pb-3 space-y-3">
                  {status === "todo" && (
                    <button
                      onClick={() => handleAsk(s.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-bold hover:bg-yellow-100 transition-colors"
                    >
                      <Rocket className="h-3.5 w-3.5" />
                      Demander {"\u00e0"} l{"\u2019"}\u00e9quipe AI
                    </button>
                  )}

                  {(status === "launched" || status === "validated") && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleChallenge(s.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[10px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Rechallenger
                      </button>
                      <button
                        onClick={() => handleAdjust(s.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[10px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Ajuster
                      </button>
                      {status === "launched" && (
                        <button
                          onClick={() => handleValidate(s.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Valider
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {allValidated && (
            <div className="mt-6 rounded-xl bg-gradient-to-r from-yellow-100 to-emerald-100 border-2 border-emerald-300 p-5 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Hammer className="h-6 w-6 text-yellow-500" />
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <Rocket className="h-6 w-6 text-emerald-500 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Chantier conceptualis\u00e9</p>
                <p className="text-xs text-gray-600">Toutes les sections sont valid\u00e9es. Pr\u00eat pour l{"\u2019"}ex\u00e9cution.</p>
              </div>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-emerald-700 transition-colors">
                Lancer le Chantier
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
