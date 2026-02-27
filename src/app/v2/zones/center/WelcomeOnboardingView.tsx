/**
 * WelcomeOnboardingView.tsx — Onboarding : page intro concept
 * Apres l'intro, l'utilisateur entre dans le FrameMaster
 * et la simulation CREDO joue dans la fenetre de chat (CenterZone)
 * Sprint A — Frame Master V2
 */

import {
  GitBranch,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Play,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";

const CREDO_PHASES = [
  { letter: "C", label: "Connecter", color: "bg-blue-500" },
  { letter: "R", label: "Rechercher", color: "bg-indigo-500" },
  { letter: "E", label: "Exposer", color: "bg-violet-500" },
  { letter: "D", label: "Demontrer", color: "bg-purple-500" },
  { letter: "O", label: "Obtenir", color: "bg-fuchsia-500" },
];

const TEAM_BOTS = [
  { code: "BCO", name: "CEO", avatar: "/agents/ceo-carlos.png" },
  { code: "BCT", name: "CTO", avatar: "/agents/cto-thomas.png" },
  { code: "BCF", name: "CFO", avatar: "/agents/cfo-francois.png" },
  { code: "BCM", name: "CMO", avatar: "/agents/cmo-sofia.png" },
  { code: "BCS", name: "CSO", avatar: "/agents/cso-marc.png" },
  { code: "BOO", name: "COO", avatar: "/agents/coo-lise.png" },
];

export function WelcomeOnboardingView({
  onComplete,
}: {
  onComplete: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950 flex flex-col items-center justify-center p-8">
      {/* Logo + titre */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <Sparkles className="h-8 w-8 text-blue-400" />
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Ghost<span className="text-blue-400">X</span>
          </h1>
        </div>
        <p className="text-xl text-blue-200 font-medium">
          Comment GhostX developpe vos idees
        </p>
        <p className="text-sm text-blue-300/60 mt-2 max-w-md mx-auto">
          Decouvrez comment une equipe de dirigeants IA collabore pour
          transformer vos intuitions en plans d'action concrets.
        </p>
      </div>

      {/* 3 cartes concept */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
        {/* Carte 1 — Equipe C-Level */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">
              Equipe C-Level
            </h3>
          </div>
          <p className="text-sm text-blue-200/80 mb-4">
            14 dirigeants IA specialises — CEO, CFO, CTO, CMO... Chacun apporte
            son expertise unique a vos decisions.
          </p>
          <div className="flex -space-x-2">
            {TEAM_BOTS.map((bot) => (
              <div
                key={bot.code}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-900 bg-gray-700"
                title={bot.name}
              >
                <img
                  src={bot.avatar}
                  alt={bot.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-blue-900 bg-blue-800 flex items-center justify-center">
              <span className="text-[10px] text-blue-300 font-bold">+8</span>
            </div>
          </div>
        </div>

        {/* Carte 2 — Branches */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">
              Branches d'idees
            </h3>
          </div>
          <p className="text-sm text-blue-200/80 mb-4">
            Chaque idee se ramifie en perspectives multiples. Challengez,
            combinez, cristallisez — comme un boardroom.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <div className="h-1 w-16 bg-green-500/60 rounded" />
              <div className="h-1 w-12 bg-amber-500/60 rounded ml-4" />
              <div className="h-1 w-20 bg-violet-500/60 rounded ml-2" />
            </div>
            <ArrowRight className="h-4 w-4 text-green-400" />
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          </div>
        </div>

        {/* Carte 3 — CREDO */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">
              Protocole CREDO
            </h3>
          </div>
          <p className="text-sm text-blue-200/80 mb-4">
            5 phases structurees pour passer d'une intuition a un plan d'action
            concret et mesurable.
          </p>
          <div className="flex items-center gap-1">
            {CREDO_PHASES.map((p) => (
              <div key={p.letter}>
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white",
                    p.color
                  )}
                >
                  {p.letter}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onComplete}
        className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-base font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 hover:shadow-blue-500/40"
      >
        <Play className="h-5 w-5" />
        Lancer la simulation
      </button>
      <p className="text-xs text-blue-300/40 mt-3">
        ~2 minutes — Simulation interactive
      </p>
    </div>
  );
}
