/**
 * ThinkRoomView.tsx — Think Room — Lancement de gros projets (D-109)
 * Flow: Vision → Brainstorm → Evaluation → Blueprint → Roadmap → Go/No-Go
 * Pattern: BoardRoomView (bg-white header, bg-gray-50 content)
 * Design System: sub-tabs bg-gray-900/text-white active, max-w-4xl mx-auto
 */

import { Lightbulb, Brain, Target, FileText, Map, CheckCircle2, MessageSquare } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { BOT_AVATAR } from "../../api/types";
import { PageLayout } from "./layouts/PageLayout";
import { PageHeader } from "./layouts/PageHeader";

// ── Equipe Think Room par defaut ──

const THINK_TEAM: { code: string; nom: string; role_think: string; ringColor: string }[] = [
  { code: "BCO", nom: "CarlOS", role_think: "Architecte de vision", ringColor: "ring-blue-500" },
  { code: "BCS", nom: "Sophie", role_think: "Analyse strategique", ringColor: "ring-red-500" },
  { code: "BCT", nom: "Thierry", role_think: "Faisabilite technique", ringColor: "ring-violet-500" },
  { code: "BCF", nom: "Francois", role_think: "Modelisation financiere", ringColor: "ring-emerald-500" },
];

// ── Steps du flow Think Room ──

const THINK_ROOM_STEPS = [
  { id: "vision", label: "Vision", icon: Lightbulb, color: "text-amber-500", desc: "Partager l'idee ou le projet" },
  { id: "brainstorm", label: "Brainstorm", icon: Brain, color: "text-purple-500", desc: "Exploration multi-bot sans censure" },
  { id: "evaluation", label: "Evaluation", icon: Target, color: "text-blue-500", desc: "Matrice de decision multicritere" },
  { id: "blueprint", label: "Blueprint", icon: FileText, color: "text-green-500", desc: "Structure du projet section par section" },
  { id: "roadmap", label: "Roadmap", icon: Map, color: "text-indigo-500", desc: "Jalons, dependances, ressources" },
  { id: "go_nogo", label: "Go / No-Go", icon: CheckCircle2, color: "text-emerald-500", desc: "Decision finale avec resume executif" },
];

export function ThinkRoomView() {
  const { setActiveView, navigateToChat } = useFrameMaster();

  return (
    <PageLayout maxWidth="4xl" header={
      <PageHeader icon={Lightbulb} iconColor="text-amber-500" title="Think Room" subtitle="Lancement de projet — De la vision au Go/No-Go" onBack={() => setActiveView("department")} />
    }>
      {/* Equipe Think */}
      <div>
        <div className="text-sm font-bold text-gray-800 mb-3">Equipe de reflexion</div>
        <div className="grid grid-cols-4 gap-3">
          {THINK_TEAM.map((member) => (
            <Card key={member.code} className="p-3 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center gap-2">
                <img
                  src={BOT_AVATAR[member.code]}
                  alt={member.nom}
                  className={cn("w-12 h-12 rounded-full ring-3 shadow-md", member.ringColor)}
                />
                <div>
                  <p className="text-xs font-bold text-gray-800">{member.nom}</p>
                  <p className="text-[9px] text-gray-400">{member.role_think}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Flow steps — card avec gradient header */}
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2.5 flex items-center gap-2 border-b">
          <Brain className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Processus de creation</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-amber-800 ml-auto">{THINK_ROOM_STEPS.length} phases</span>
        </div>
        <div className="p-4 space-y-3">
          {THINK_ROOM_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-amber-600">{i + 1}</span>
                </div>
                <Icon className={cn("h-4 w-4 shrink-0", step.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800">{step.label}</p>
                  <p className="text-[9px] text-gray-400">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action — bouton lancer */}
      <div className="bg-gray-50 px-4 py-4 border rounded-xl flex items-center justify-center">
        <button
          onClick={() => navigateToChat("think-room")}
          className="text-xs bg-amber-500 text-white px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-amber-600 font-medium cursor-pointer"
        >
          <MessageSquare className="h-3.5 w-3.5" /> Ouvrir la Think Room
        </button>
      </div>
    </PageLayout>
  );
}
