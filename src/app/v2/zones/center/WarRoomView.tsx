/**
 * WarRoomView.tsx — War Room — Gestion de crise majeure (D-109)
 * Flow: Alerte → Diagnostic rapide → Plan d'urgence → COMMAND → Suivi → Post-mortem
 * Pattern: BoardRoomView (bg-white header, bg-gray-50 content)
 * Design System: sub-tabs bg-gray-900/text-white active, max-w-4xl mx-auto
 */

import { AlertTriangle, Shield, Zap, Clock, Target, MessageSquare } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { BOT_AVATAR } from "../../api/types";
import { PageLayout } from "./layouts/PageLayout";
import { PageHeader } from "./layouts/PageHeader";

// ── Equipe de crise par defaut ──

const CRISIS_TEAM: { code: string; nom: string; role_crise: string; ringColor: string }[] = [
  { code: "CEOB", nom: "CarlOS", role_crise: "Commandant de crise", ringColor: "ring-blue-500" },
  { code: "COOB", nom: "Olivier", role_crise: "Operations d'urgence", ringColor: "ring-orange-500" },
  { code: "CSOB", nom: "Sophie", role_crise: "Analyse des risques", ringColor: "ring-red-500" },
  { code: "CFOB", nom: "Francois", role_crise: "Impact financier", ringColor: "ring-emerald-500" },
];

// ── Steps du flow War Room ──

const WAR_ROOM_STEPS = [
  { id: "alerte", label: "Alerte", icon: AlertTriangle, color: "text-red-500", desc: "Decrire la situation de crise" },
  { id: "diagnostic", label: "Diagnostic", icon: Zap, color: "text-amber-500", desc: "Analyse d'impact par departement" },
  { id: "plan_urgence", label: "Plan d'urgence", icon: Target, color: "text-blue-500", desc: "Actions 24h / 1 sem / 1 mois" },
  { id: "assignation", label: "COMMAND", icon: Shield, color: "text-violet-500", desc: "Missions assignees aux bots" },
  { id: "suivi", label: "Suivi", icon: Clock, color: "text-green-500", desc: "Statut en temps reel" },
  { id: "postmortem", label: "Post-mortem", icon: Target, color: "text-gray-500", desc: "Analyse causes racines" },
];

export function WarRoomView() {
  const { setActiveView, navigateToChat } = useFrameMaster();

  return (
    <PageLayout maxWidth="4xl" header={
      <PageHeader icon={AlertTriangle} iconColor="text-red-500" title="War Room" subtitle="" onBack={() => setActiveView("department")} />
    }>
      {/* Equipe de crise */}
      <div>
        <div className="text-sm font-bold text-gray-800 mb-3">Cellule de crise</div>
        <div className="grid grid-cols-4 gap-3">
          {CRISIS_TEAM.map((member) => (
            <Card key={member.code} className="p-3 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center gap-2">
                <img
                  src={BOT_AVATAR[member.code]}
                  alt={member.nom}
                  className={cn("w-12 h-12 rounded-full ring-3 shadow-md", member.ringColor)}
                />
                <div>
                  <p className="text-xs font-bold text-gray-800">{member.nom}</p>
                  <p className="text-[9px] text-gray-400">{member.role_crise}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Flow steps — card avec gradient header */}
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 flex items-center gap-2 border-b">
          <Shield className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Protocole de crise</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-red-800 ml-auto">{WAR_ROOM_STEPS.length} phases</span>
        </div>
        <div className="p-4 space-y-3">
          {WAR_ROOM_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center gap-3">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", "bg-red-50")}>
                  <span className="text-xs font-bold text-red-600">{i + 1}</span>
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

      {/* Action — bouton activer */}
      <div className="bg-gray-50 px-4 py-4 border rounded-xl flex items-center justify-center">
        <button
          onClick={() => navigateToChat("war-room")}
          className="text-xs bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-red-700 font-medium cursor-pointer"
        >
          <MessageSquare className="h-3.5 w-3.5" /> Activer la War Room
        </button>
      </div>
    </PageLayout>
  );
}
