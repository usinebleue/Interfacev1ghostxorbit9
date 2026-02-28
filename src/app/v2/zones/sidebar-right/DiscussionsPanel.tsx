/**
 * DiscussionsPanel.tsx — "Mes Discussions" — threads actifs et parkes
 * Remplace CollaborateursPanel (Orbit9 plus tard)
 * Sprint B — Persistence discussions
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Clock,
  CheckCircle2,
  Trash2,
  Plus,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster } from "../../context/FrameMasterContext";

const STATUS_CONFIG = {
  active: { label: "Actif", color: "bg-green-500", icon: MessageSquare },
  parked: { label: "Parke", color: "bg-amber-500", icon: Clock },
  completed: { label: "Termine", color: "bg-gray-400", icon: CheckCircle2 },
} as const;

export function DiscussionsPanel() {
  const [open, setOpen] = useState(true);
  const {
    messages,
    threads,
    activeThreadId,
    resumeThread,
    deleteThread,
    newConversation,
  } = useChatContext();
  const { setActiveView } = useFrameMaster();

  // Trier: actifs en premier, puis parkes, puis termines
  const sortedThreads = [...threads].sort((a, b) => {
    const order = { active: 0, parked: 1, completed: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  const activeCount = threads.filter((t) => t.status === "active").length;
  const parkedCount = threads.filter((t) => t.status === "parked").length;
  const totalActive = activeCount + parkedCount;

  const handleClick = (threadId: string) => {
    resumeThread(threadId);
    setActiveView("live-chat");
  };

  const handleNew = () => {
    newConversation();
    setActiveView("live-chat");
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-xs font-semibold text-gray-700 hover:text-gray-900">
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
        Mes Discussions
        {totalActive > 0 && (
          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 bg-blue-100 text-blue-700">
            {totalActive}
          </Badge>
        )}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 space-y-1">
          {/* Discussion active (messages en cours, pas encore dans un thread) */}
          {messages.length > 0 && !activeThreadId && (
            <button
              onClick={() => setActiveView("live-chat")}
              className="w-full flex items-center gap-2 px-2 py-2 rounded text-xs hover:bg-blue-50 transition-colors bg-blue-50/50 border border-blue-100 cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-medium text-gray-700 truncate">
                  {messages.find((m) => m.role === "user")?.content.slice(0, 40) || "Conversation"}...
                </div>
                <div className="text-[10px] text-gray-400">
                  {messages.length} messages — en cours
                </div>
              </div>
            </button>
          )}

          {/* Threads sauvegardés */}
          {sortedThreads.map((thread) => {
            const cfg = STATUS_CONFIG[thread.status] || STATUS_CONFIG.active;
            const isActive = thread.id === activeThreadId;

            return (
              <div
                key={thread.id}
                className={cn(
                  "group flex items-center gap-2 px-2 py-2 rounded text-xs transition-colors cursor-pointer",
                  isActive
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                )}
                onClick={() => handleClick(thread.id)}
              >
                <div className={cn("w-2 h-2 rounded-full shrink-0", cfg.color)} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700 truncate">
                    {thread.title}
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span>{thread.messages?.length || 0} msg</span>
                    <span>·</span>
                    <span>{cfg.label}</span>
                  </div>
                </div>
                {/* Delete — visible on hover */}
                {thread.status !== "active" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThread(thread.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-0.5 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Bouton nouvelle discussion */}
          <button
            onClick={handleNew}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            Nouvelle discussion
          </button>

          {/* Etat vide */}
          {threads.length === 0 && messages.length === 0 && (
            <div className="text-[10px] text-gray-400 px-2 py-2">
              Aucune discussion. Tape dans l'InputBar pour commencer.
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
