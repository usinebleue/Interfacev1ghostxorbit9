/**
 * CarlosCodesView.tsx — Claude Code intégré dans l'app
 * Poll /api/v1/dev/live pour messages Vision-Claude (lunettes Ray-Ban → Claude Code)
 * + tâches locales lancées via sidebar chat (localStorage)
 * Remplace vision-live.html — tout dans l'app maintenant
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  CheckCircle2, Clock, FileCode, FolderOpen,
  Eye, Terminal, Code2, Search, Edit3, AlertCircle,
  ChevronRight, Loader2, MessageSquare, Activity,
} from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { cn } from "@/app/components/ui/utils";

const BASE_URL = "/api/v1";
const API_KEY = import.meta.env.VITE_API_KEY || "missing-key";
const TASKS_STORAGE_KEY = "carlos-codes-tasks";

type TaskStatus = "idle" | "connecting" | "researching" | "exposing" | "executing" | "verifying" | "done" | "error";

interface CodeAction {
  type: string;
  path?: string;
  command?: string;
  status: "pending" | "running" | "done" | "error";
  result?: string;
}

interface TaskState {
  id: string | null;
  status: TaskStatus;
  description: string;
  actions: CodeAction[];
  plan: string | null;
  error: string | null;
  startedAt?: number;
}

interface DevMessage {
  message: string;
  sender: string;
  ts: number;
}

interface DevLiveData {
  active: boolean;
  stage: string;
  messages: DevMessage[];
  replies: DevMessage[];
  msg_count: number;
  reply_count: number;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: typeof Clock; color: string }> = {
  idle:         { label: "Pret",         icon: Terminal,      color: "text-gray-500" },
  connecting:   { label: "C - Contexte", icon: Search,        color: "text-blue-600" },
  researching:  { label: "R - Recherche", icon: FolderOpen,   color: "text-purple-600" },
  exposing:     { label: "E - Plan",     icon: Eye,           color: "text-amber-600" },
  executing:    { label: "D - Execution", icon: Code2,        color: "text-emerald-600" },
  verifying:    { label: "O - Verification", icon: CheckCircle2, color: "text-red-600" },
  done:         { label: "Termine",      icon: CheckCircle2,  color: "text-green-600" },
  error:        { label: "Erreur",       icon: AlertCircle,   color: "text-red-600" },
};

const CREDO_STEPS: { id: TaskStatus; label: string; letter: string }[] = [
  { id: "connecting",  label: "Connecter",  letter: "C" },
  { id: "researching", label: "Rechercher", letter: "R" },
  { id: "exposing",    label: "Exposer",    letter: "E" },
  { id: "executing",   label: "Demontrer",  letter: "D" },
  { id: "verifying",   label: "Obtenir",    letter: "O" },
];

/** Persister les taches dans localStorage */
function loadSavedTasks(): TaskState[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTasks(tasks: TaskState[]) {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks.slice(-20)));
  } catch { /* noop */ }
}

function formatElapsed(startTs: number): string {
  const secs = Math.floor((Date.now() - startTs) / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${mins}m ${rem}s`;
}

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
}

export function CarlosCodesView() {
  // --- Vision-Claude polling state ---
  const [devData, setDevData] = useState<DevLiveData | null>(null);
  const [devError, setDevError] = useState(false);
  const devPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- CarlOS Codes task state (localStorage) ---
  const [task, setTask] = useState<TaskState>({
    id: null, status: "idle", description: "", actions: [], plan: null, error: null,
  });
  const [recentTasks, setRecentTasks] = useState<TaskState[]>(() => loadSavedTasks());
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer tick for elapsed display
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Poll /api/v1/dev/live ---
  useEffect(() => {
    const fetchDevLive = async () => {
      try {
        const res = await fetch(`${BASE_URL}/dev/live`, {
          headers: { "X-API-Key": API_KEY },
        });
        if (!res.ok) { setDevError(true); return; }
        const data: DevLiveData = await res.json();
        setDevData(data);
        setDevError(false);
      } catch { setDevError(true); }
    };

    fetchDevLive();
    devPollRef.current = setInterval(fetchDevLive, 3000);
    return () => { if (devPollRef.current) clearInterval(devPollRef.current); };
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [devData?.msg_count, task.actions, task.plan]);

  // --- CarlOS Codes task from localStorage ---
  useEffect(() => {
    const checkForNewTask = () => {
      try {
        const activeTaskId = localStorage.getItem("carlos-codes-active-task");
        if (activeTaskId && activeTaskId !== task.id) {
          setTask({
            id: activeTaskId,
            status: "connecting",
            description: localStorage.getItem("carlos-codes-active-desc") || "",
            actions: [], plan: null, error: null, startedAt: Date.now(),
          });
          pollTaskStatus(activeTaskId);
        }
      } catch { /* noop */ }
    };

    checkForNewTask();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "carlos-codes-active-task") checkForNewTask();
    };
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(checkForNewTask, 3000);
    return () => { window.removeEventListener("storage", handleStorage); clearInterval(interval); };
  }, [task.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (task.id && (task.status === "done" || task.status === "error")) {
      setRecentTasks((prev) => {
        const updated = [...prev.filter((t) => t.id !== task.id), task];
        saveTasks(updated);
        return updated;
      });
    }
  }, [task.status, task.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const pollTaskStatus = useCallback((taskId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    const poll = async () => {
      try {
        const res = await fetch(`${BASE_URL}/codes/task/${taskId}`, {
          headers: { "X-API-Key": API_KEY },
        });
        if (!res.ok) return;
        const data = await res.json();
        setTask((prev) => ({
          ...prev,
          status: data.status || prev.status,
          description: data.description || prev.description,
          plan: data.plan || data.summary || prev.plan,
          error: data.error || null,
          actions: (data.actions || []).map((a: CodeAction) => ({
            type: a.type, path: a.path, command: a.command, status: a.status, result: a.result,
          })),
        }));
        if (data.status === "done" || data.status === "error") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          localStorage.removeItem("carlos-codes-active-task");
          localStorage.removeItem("carlos-codes-active-desc");
        }
      } catch { /* noop */ }
    };
    poll();
    pollingRef.current = setInterval(poll, 2000);
    setTimeout(() => { if (pollingRef.current) clearInterval(pollingRef.current); }, 600000);
  }, []);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const currentStep = CREDO_STEPS.findIndex((s) => s.id === task.status);
  const hasDevMessages = devData && devData.messages.length > 0;
  const allMessages = devData?.messages || [];

  return (
    <div className="h-full flex flex-col">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 px-10 py-5">
        <div className="flex items-center gap-3">
          <Code2 className="w-6 h-6 text-white" />
          <div>
            <h1 className="text-xl font-semibold text-white">Claude Code</h1>
            <p className="text-sm text-white/80 mt-0.5">Vision-Claude + taches de code en temps reel</p>
          </div>
          {devData && (
            <div className={cn(
              "ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              devData.active ? "bg-green-400/20 text-green-100" : "bg-white/10 text-white/60"
            )}>
              <Activity className={cn("w-3 h-3", devData.active && "animate-pulse")} />
              {devData.active ? "Actif" : "Inactif"}
            </div>
          )}
        </div>
      </div>

      {/* CREDO Progress bar — only visible when a code task is running */}
      {task.status !== "idle" && (
        <div className="px-10 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-1">
            {CREDO_STEPS.map((step, i) => {
              const isDone = currentStep > i;
              const isActive = currentStep === i;
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                      isDone ? "bg-green-100 text-green-700" :
                      isActive ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300" :
                      "bg-gray-50 text-gray-400"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : isActive ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span className="font-bold">{step.letter}</span>
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                  </div>
                  {i < CREDO_STEPS.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 mx-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status bar — active dev task */}
      {devData?.active && devData.stage && (
        <div className="px-10 py-2.5 border-b border-gray-100 bg-orange-50">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 text-orange-500 animate-spin shrink-0" />
            <span className="text-orange-700 font-medium truncate">{devData.stage}</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div ref={scrollRef} className="flex-1 px-10 py-5 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">

          {/* Vision-Claude Messages feed */}
          {hasDevMessages && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Messages ({allMessages.length})
              </h3>
              {allMessages.map((msg, i) => {
                const isCarl = msg.sender === "carl";
                return (
                  <div key={i} className={cn("flex", isCarl ? "justify-start" : "justify-end")}>
                    <div className={cn(
                      "max-w-[80%] rounded-xl px-4 py-2.5 text-sm",
                      isCarl
                        ? "bg-gray-100 text-gray-800 rounded-bl-sm"
                        : "bg-blue-600 text-white rounded-br-sm"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-[9px] font-semibold",
                          isCarl ? "text-gray-500" : "text-blue-200"
                        )}>
                          {isCarl ? "Carl" : "Claude"}
                        </span>
                        <span className={cn(
                          "text-[9px]",
                          isCarl ? "text-gray-400" : "text-blue-300"
                        )}>
                          {formatTime(msg.ts)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CarlOS Code task status */}
          {task.status !== "idle" && (
            <>
              {/* Status badge + timer */}
              <div className="flex items-center gap-2 text-sm">
                {(() => {
                  const cfg = STATUS_CONFIG[task.status];
                  const Icon = cfg.icon;
                  const isRunning = !["idle", "done", "error"].includes(task.status);
                  return (
                    <>
                      <Icon className={cn("w-4 h-4", cfg.color, isRunning && "animate-pulse")} />
                      <span className={cn("font-medium", cfg.color)}>{cfg.label}</span>
                      {task.description && <span className="text-gray-500">— {task.description}</span>}
                      {isRunning && task.startedAt && (
                        <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatElapsed(task.startedAt)}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Plan */}
              {task.plan && task.status !== "done" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Plan en cours</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-gray-700">{task.plan}</p>
                </div>
              )}

              {/* Done summary */}
              {task.plan && task.status === "done" && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Resultat</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-gray-700">{task.plan}</p>
                </div>
              )}

              {/* Actions log */}
              {task.actions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Actions ({task.actions.length})</h3>
                  {task.actions.map((action, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                      {action.type === "read_file" && <FileCode className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                      {action.type === "write_file" && <FileCode className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                      {action.type === "edit_file" && <Edit3 className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      {(action.type === "glob_search" || action.type === "grep_search") && <Search className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                      {action.type === "bash_command" && <Terminal className="w-3.5 h-3.5 text-green-600 shrink-0" />}
                      <span className="font-mono truncate">{action.path || action.command || action.type}</span>
                      {action.status === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto shrink-0" />}
                      {action.status === "running" && <Loader2 className="w-3.5 h-3.5 text-blue-500 ml-auto shrink-0 animate-spin" />}
                      {action.status === "error" && <AlertCircle className="w-3.5 h-3.5 text-red-500 ml-auto shrink-0" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {task.error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  {task.error}
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {task.status === "idle" && !hasDevMessages && recentTasks.length === 0 && (
            <Card className="p-6 text-center border-dashed">
              <Code2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">Aucune activite Claude Code</p>
              <p className="text-xs text-gray-500 mt-1">
                Les messages Vision-Claude et les taches de code apparaitront ici en temps reel.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Sources: lunettes Ray-Ban Meta + commandes dans le chat CarlOS
              </p>
            </Card>
          )}

          {/* Dev connection error */}
          {devError && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Connexion au canal dev interrompue — nouvelle tentative dans 3s</span>
            </div>
          )}

          {/* Recent tasks history */}
          {recentTasks.length > 0 && task.status === "idle" && (
            <div className="space-y-2 mt-6">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Taches recentes</h3>
              {recentTasks.slice().reverse().map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                  {t.status === "done" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  )}
                  <span className="truncate">{t.description}</span>
                  <span className="text-[9px] text-gray-400 ml-auto shrink-0">
                    {t.actions.length} actions
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 py-3 border-t border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs text-gray-400">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Vision-Claude (lunettes) + chat CarlOS — tout converge ici</span>
        </div>
      </div>
    </div>
  );
}
