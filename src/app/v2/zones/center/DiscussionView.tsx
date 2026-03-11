/**
 * DiscussionView.tsx — Gestionnaire de discussions (threads)
 * Liste organisée par statut: Active / Parquées / Terminées
 * Phase 1.5 — Chef d'Orchestre
 */

import { useState } from "react";
import { MessageSquare, Clock, CheckCircle, PlayCircle, PlusCircle, Trash2, ArrowRight, MessageCircle } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { Thread } from "../../api/types";
import { PageLayout } from "./layouts/PageLayout";
import { PageHeader } from "./layouts/PageHeader";

// Map bot code → emoji + name (miroir de LiveChat BOT_COLORS)
const BOT_META: Record<string, { emoji: string; name: string; color: string }> = {
  CEOB: { emoji: "👔", name: "CarlOS",    color: "text-blue-700 bg-blue-50 border-blue-200" },
  CTOB: { emoji: "💻", name: "Thierry",   color: "text-violet-700 bg-violet-50 border-violet-200" },
  CFOB: { emoji: "💰", name: "François",  color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  CMOB: { emoji: "📣", name: "Martine",   color: "text-pink-700 bg-pink-50 border-pink-200" },
  CSOB: { emoji: "🎯", name: "Sophie",    color: "text-red-700 bg-red-50 border-red-200" },
  COOB: { emoji: "⚙️", name: "Olivier",   color: "text-orange-700 bg-orange-50 border-orange-200" },
  CROB: { emoji: "📈", name: "Raphaël",   color: "text-cyan-700 bg-cyan-50 border-cyan-200" },
  CHROB: { emoji: "👥", name: "Hélène",    color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  CISOB: { emoji: "🛡️", name: "Sécurité",  color: "text-gray-700 bg-gray-50 border-gray-200" },
  CLOB: { emoji: "⚖️", name: "Louise",    color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return `Il y a ${days}j`;
}

function isStagnant(updatedAt: string): boolean {
  return Date.now() - new Date(updatedAt).getTime() > 7 * 24 * 60 * 60 * 1000;
}

interface ThreadCardProps {
  thread: Thread;
  isActive?: boolean;
  onContinuer?: () => void;
  onReprendre?: () => void;
  onParker?: () => void;
  onSupprimer?: () => void;
  onRevoir?: () => void;
  dimmed?: boolean;
}

function ThreadCard({ thread, isActive, onContinuer, onReprendre, onParker, onSupprimer, onRevoir, dimmed }: ThreadCardProps) {
  const bot = BOT_META[thread.primaryBot] || BOT_META.CEOB;
  const userMsgCount = thread.messages.filter(m => m.role === "user").length;
  const stagnant = isStagnant(thread.updatedAt);

  return (
    <div className={cn(
      "bg-white rounded-xl border p-4 transition-all",
      isActive && "border-blue-200 shadow-sm",
      stagnant && !dimmed && "border-red-100",
      dimmed && "opacity-60"
    )}>
      <div className="flex items-start justify-between gap-3">
        {/* Infos */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {/* Status dot */}
            <span className={cn(
              "w-2 h-2 rounded-full shrink-0",
              isActive ? "bg-blue-500" : thread.status === "parked" ? "bg-amber-400" : "bg-gray-300"
            )} />
            <p className="text-sm font-semibold text-gray-800 truncate">{thread.title}</p>
            {stagnant && !dimmed && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 shrink-0">
                Inactif 7j+
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className={cn("flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-[10px] font-medium", bot.color)}>
              {bot.emoji} {bot.name}
            </span>
            <span>{userMsgCount} échange{userMsgCount !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span>{formatRelativeTime(thread.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
        {/* ACTIVE */}
        {onContinuer && (
          <button
            onClick={onContinuer}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer font-medium"
          >
            <MessageCircle className="h-3 w-3" />
            Continuer
          </button>
        )}
        {onParker && (
          <button
            onClick={onParker}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer font-medium"
          >
            <Clock className="h-3 w-3" />
            Parker
          </button>
        )}

        {/* PARQUÉES */}
        {onReprendre && (
          <button
            onClick={onReprendre}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer font-medium"
          >
            <ArrowRight className="h-3 w-3" />
            Reprendre
          </button>
        )}

        {/* TERMINÉES */}
        {onRevoir && (
          <button
            onClick={onRevoir}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer font-medium"
          >
            <MessageSquare className="h-3 w-3" />
            Revoir
          </button>
        )}

        {/* Supprimer */}
        {onSupprimer && (
          <button
            onClick={onSupprimer}
            className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer ml-auto"
            title="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export function DiscussionView() {
  const {
    threads, activeThreadId,
    parkThread, resumeThread, completeThread, deleteThread, newConversation,
  } = useChatContext();
  const { setActiveView } = useFrameMaster();

  const activeThreads = threads.filter(t => t.status === "active");
  const parkedThreads = threads.filter(t => t.status === "parked");
  const completedThreads = threads.filter(t => t.status === "completed");
  const total = threads.length;

  const goToChat = () => setActiveView("live-chat");

  const handleContinuer = () => {
    goToChat();
  };

  const handleReprendre = (threadId: string) => {
    resumeThread(threadId);
    goToChat();
  };

  const handleRevoir = (threadId: string) => {
    resumeThread(threadId);
    goToChat();
  };

  return (
    <PageLayout maxWidth="2xl" showPresence={false} spacing="space-y-6" header={
      <PageHeader
        icon={MessageSquare}
        iconColor="text-blue-600"
        title="Mes Discussions"
        subtitle={total === 0 ? "Aucune discussion" : `${total} discussion${total !== 1 ? "s" : ""} · ${activeThreads.length} active${activeThreads.length !== 1 ? "s" : ""}`}
        rightSlot={
          <button
            onClick={() => { newConversation(); goToChat(); }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer font-medium"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Nouvelle discussion
          </button>
        }
      />
    }>

          {total === 0 && (
            <div className="text-center py-16 text-gray-400">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Aucune discussion pour l'instant</p>
              <p className="text-xs mt-1 opacity-70">Démarrez une discussion avec votre Bot Team C-Level</p>
              <button
                onClick={() => { newConversation(); goToChat(); }}
                className="mt-4 flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer font-medium mx-auto"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Lancer une discussion
              </button>
            </div>
          )}

          {/* ACTIVE */}
          {activeThreads.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <PlayCircle className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Active ({activeThreads.length})
                </span>
                <div className="flex-1 h-px bg-blue-100" />
              </div>
              <div className="space-y-2">
                {activeThreads.map(t => (
                  <ThreadCard
                    key={t.id}
                    thread={t}
                    isActive={t.id === activeThreadId}
                    onContinuer={handleContinuer}
                    onParker={t.id === activeThreadId ? parkThread : undefined}
                    onSupprimer={() => deleteThread(t.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* PARQUÉES */}
          {parkedThreads.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Parquées ({parkedThreads.length})
                </span>
                <div className="flex-1 h-px bg-amber-100" />
              </div>
              <div className="space-y-2">
                {parkedThreads.map(t => (
                  <ThreadCard
                    key={t.id}
                    thread={t}
                    onReprendre={() => handleReprendre(t.id)}
                    onSupprimer={() => deleteThread(t.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* TERMINÉES */}
          {completedThreads.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Terminées ({completedThreads.length})
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="space-y-2">
                {completedThreads.slice(0, 5).map(t => (
                  <ThreadCard
                    key={t.id}
                    thread={t}
                    dimmed
                    onRevoir={() => handleRevoir(t.id)}
                    onSupprimer={() => deleteThread(t.id)}
                  />
                ))}
                {completedThreads.length > 5 && (
                  <p className="text-[11px] text-gray-400 text-center py-1">
                    + {completedThreads.length - 5} autres conversations terminées
                  </p>
                )}
              </div>
            </section>
          )}
    </PageLayout>
  );
}
