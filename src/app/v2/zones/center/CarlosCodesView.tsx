/**
 * CarlosCodesView.tsx — Panneau passif de progression CarlOS Codes
 * PAS d'input propre — tout vient du sidebar chat (cerveau unique)
 * Affiche les etapes CREDO en temps reel via SSE + fichiers lus/modifies
 * Se met a jour automatiquement quand une tache code est lancee via le sidebar
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  CheckCircle2, Clock, FileCode, FolderOpen,
  Eye, Terminal, Code2, Search, Edit3, AlertCircle,
  ChevronRight, Loader2, MessageSquare,
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
    // Garder les 20 dernieres
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks.slice(-20)));
  } catch { /* noop */ }
}

export function CarlosCodesView() {
  const [task, setTask] = useState<TaskState>({
    id: null,
    status: "idle",
    description: "",
    actions: [],
    plan: null,
    error: null,
  });
  const [recentTasks, setRecentTasks] = useState<TaskState[]>(() => loadSavedTasks());
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [task.actions, task.plan]);

  // Ecouter les taches lancees depuis le sidebar chat (via localStorage event)
  useEffect(() => {
    const checkForNewTask = () => {
      try {
        const activeTaskId = localStorage.getItem("carlos-codes-active-task");
        if (activeTaskId && activeTaskId !== task.id) {
          setTask({
            id: activeTaskId,
            status: "connecting",
            description: localStorage.getItem("carlos-codes-active-desc") || "",
            actions: [],
            plan: null,
            error: null,
            startedAt: Date.now(),
          });
          pollTaskStatus(activeTaskId);
        }
      } catch { /* noop */ }
    };

    // Check on mount and listen for storage changes
    checkForNewTask();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "carlos-codes-active-task") checkForNewTask();
    };
    window.addEventListener("storage", handleStorage);

    // Also poll every 3s for same-tab changes
    const interval = setInterval(checkForNewTask, 3000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [task.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sauvegarder les taches quand elles sont done/error
  useEffect(() => {
    if (task.id && (task.status === "done" || task.status === "error")) {
      setRecentTasks((prev) => {
        const updated = [...prev.filter((t) => t.id !== task.id), task];
        saveTasks(updated);
        return updated;
      });
    }
  }, [task.status, task.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll task status via REST (plus simple que SSE pour un panneau passif)
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
            type: a.type,
            path: a.path,
            command: a.command,
            status: a.status,
            result: a.result,
          })),
        }));
        if (data.status === "done" || data.status === "error") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          // Nettoyer le localStorage
          localStorage.removeItem("carlos-codes-active-task");
          localStorage.removeItem("carlos-codes-active-desc");
        }
      } catch { /* noop */ }
    };

    poll(); // premier poll immediat
    pollingRef.current = setInterval(poll, 2000);

    // Auto-stop apres 10 min
    setTimeout(() => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }, 600000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const currentStep = CREDO_STEPS.findIndex((s) => s.id === task.status);
  const statusCfg = STATUS_CONFIG[task.status];
  const StatusIcon = statusCfg.icon;
  const isRunning = !["idle", "done", "error"].includes(task.status);

  return (
    <div className="h-full flex flex-col">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 px-10 py-5">
        <div className="flex items-center gap-3">
          <Code2 className="w-6 h-6 text-white" />
          <div>
            <h1 className="text-xl font-semibold text-white">CarlOS Codes</h1>
            <p className="text-sm text-white/80 mt-0.5">Progression des taches de code — lance via le chat CarlOS</p>
          </div>
        </div>
      </div>

      {/* CREDO Progress bar */}
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

      {/* Main content */}
      <div ref={scrollRef} className="flex-1 px-10 py-5 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Status badge */}
          {task.status !== "idle" && (
            <div className={cn("flex items-center gap-2 text-sm", statusCfg.color)}>
              <StatusIcon className={cn("w-4 h-4", isRunning && "animate-pulse")} />
              <span className="font-medium">{statusCfg.label}</span>
              {task.description && (
                <span className="text-gray-500">— {task.description}</span>
              )}
            </div>
          )}

          {/* Empty state — pas d'input, pointer vers le sidebar */}
          {task.status === "idle" && recentTasks.length === 0 && (
            <Card className="p-6 text-center border-dashed">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">Aucune tache en cours</p>
              <p className="text-xs text-gray-500 mt-1">
                Demande a CarlOS de coder dans le chat a droite.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Exemples: "Ajoute un endpoint /health-detail", "Lis api_rest.py", "Refactorise cette fonction"
              </p>
            </Card>
          )}

          {/* Real-time plan display */}
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

      {/* Footer — pas d'input, indication que tout passe par le sidebar */}
      <div className="px-10 py-3 border-t border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs text-gray-400">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Les taches de code se lancent via le chat CarlOS (sidebar droite)</span>
        </div>
      </div>
    </div>
  );
}
