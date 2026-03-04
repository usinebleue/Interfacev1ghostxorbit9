/**
 * BoardRoomView.tsx — Board Room — Conseil d'Administration robotique (D-099)
 * Table ronde des 6 C-Level + ordre du jour + resolutions
 * Pattern: EspaceBureauView / Orbit9DetailView (bg-white header, bg-gray-50 content)
 * Design System: sub-tabs bg-gray-900/text-white active, max-w-4xl mx-auto
 * Sprint C — CA Robotique
 */

import { ArrowLeft, Crown, MessageSquare, Calendar, FileText } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { BOT_AVATAR } from "../../api/types";
import { CarlOSPresence } from "./CarlOSPresence";

// ── 6 administrateurs C-Level ──

const BOARD_MEMBERS: { code: string; nom: string; titre: string; ringColor: string; derniere_position: string }[] = [
  { code: "BCO", nom: "CarlOS", titre: "CEO — Direction", ringColor: "ring-blue-500", derniere_position: "Priorise expansion manufacturiere Q2" },
  { code: "BCT", nom: "Thierry", titre: "CTO — Technologie", ringColor: "ring-violet-500", derniere_position: "Recommande migration cloud avant scale" },
  { code: "BCF", nom: "Francois", titre: "CFO — Finance", ringColor: "ring-emerald-500", derniere_position: "Approuve budget R&D sous conditions" },
  { code: "BCM", nom: "Martine", titre: "CMO — Marketing", ringColor: "ring-pink-500", derniere_position: "Propose repositionnement marque B2B" },
  { code: "BCS", nom: "Sophie", titre: "CSO — Strategie", ringColor: "ring-red-500", derniere_position: "Alerte sur risque concentration clients" },
  { code: "BOO", nom: "Olivier", titre: "COO — Operations", ringColor: "ring-orange-500", derniere_position: "Capacite production atteinte a 87%" },
];

// ── Ordre du jour simule ──

const AGENDA_ITEMS = [
  { id: 1, titre: "Expansion vers le marche ontarien", priorite: "haute", proposeur: "BCO" },
  { id: 2, titre: "Investissement ligne de production #3", priorite: "haute", proposeur: "BOO" },
  { id: 3, titre: "Strategie IA interne — automatisation", priorite: "moyenne", proposeur: "BCT" },
];

// ── Resolutions recentes simulees ──

const RESOLUTIONS = [
  { id: "R-2026-008", titre: "Approbation budget Q2 — 450K$", date: "1 mars 2026", votes: { pour: 5, contre: 1 }, status: "Adoptee" },
  { id: "R-2026-007", titre: "Partenariat Alimentation Boreal", date: "28 fev 2026", votes: { pour: 6, contre: 0 }, status: "Adoptee" },
];

export function BoardRoomView() {
  const { setActiveView } = useFrameMaster();

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
            <Crown className="h-4 w-4 text-amber-600" />
            <div>
              <div className="text-sm font-bold text-gray-800">Board Room</div>
              <div className="text-xs text-muted-foreground">Conseil d'Administration — 6 C-Level</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu scrollable — design system: max-w-4xl mx-auto p-4 pb-12 */}
      <div className="flex-1 overflow-auto">
        <CarlOSPresence />
        <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">

          {/* Table ronde — 6 membres */}
          <div>
            <div className="text-sm font-bold text-gray-800 mb-3">Membres du conseil</div>
            <div className="grid grid-cols-3 gap-3">
              {BOARD_MEMBERS.map((member) => (
                <Card key={member.code} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={BOT_AVATAR[member.code]}
                      alt={member.nom}
                      className={cn("w-14 h-14 rounded-full ring-3 shadow-md", member.ringColor)}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800">{member.nom}</p>
                      <p className="text-[10px] text-gray-400">{member.titre}</p>
                    </div>
                  </div>
                  <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-gray-300 bg-gray-50/50">
                    <p className="text-xs text-gray-600 leading-relaxed italic">"{member.derniere_position}"</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Ordre du jour — card avec gradient header (design system) */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-2.5 flex items-center gap-2 border-b">
              <Calendar className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Ordre du jour</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-amber-800 ml-auto">{AGENDA_ITEMS.length} points</span>
            </div>
            <div className="p-4 space-y-3">
              {AGENDA_ITEMS.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-amber-700">{item.id}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800">{item.titre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <img src={BOT_AVATAR[item.proposeur]} alt="" className="w-4 h-4 rounded-full" />
                      <span className="text-[10px] text-gray-400">Propose par {item.proposeur}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[9px]",
                    item.priorite === "haute" ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50"
                  )}>
                    {item.priorite}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Resolutions recentes */}
          <div>
            <div className="text-sm font-bold text-gray-800 mb-3">Resolutions recentes</div>
            <div className="space-y-2">
              {RESOLUTIONS.map((res) => (
                <Card key={res.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-bold text-gray-800">{res.id}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] text-green-600 bg-green-50">{res.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">{res.titre}</p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {res.date}
                    </div>
                    <span>Pour: {res.votes.pour} | Contre: {res.votes.contre}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Action — bouton lancer debat (design system: footer action pattern) */}
          <div className="bg-gray-50 px-4 py-4 border rounded-xl flex items-center justify-center">
            <button
              onClick={() => setActiveView("live-chat")}
              className="text-xs bg-amber-600 text-white px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-amber-700 font-medium cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Lancer un debat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
