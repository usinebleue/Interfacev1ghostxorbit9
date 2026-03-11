/**
 * ChatBox.tsx — Chat unifie pour sidebar droit
 * CarlOS = cerveau unique — texte, voix, video, ET code
 * Le sidebar droit est LE point d'entree CarlOS sur le web
 * V3 : Timestamps robustes, auto-scroll, avatar fallback, code task indicator
 */

import { useRef, useEffect, useState, useCallback } from "react";
import { Bot, Copy, Check, User, Code2, Loader2, CheckCircle2, AlertCircle, Maximize2, Plus } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { InputBar } from "../center/InputBar";
import { BOT_AVATAR } from "../../api/types";

/** Safely convert any timestamp value to a formatted time string */
function formatTimestamp(ts: unknown): string {
  try {
    const date = ts instanceof Date ? ts : new Date(ts as string | number);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return "";
  }
}

/** Code task tracking — polls SSE for inline progress */
interface CodeTaskProgress {
  taskId: string;
  status: "connecting" | "researching" | "exposing" | "executing" | "verifying" | "done" | "error";
  description: string;
  actionsCount: number;
  error?: string;
}

const BASE_URL = "/api/v1";
const API_KEY = import.meta.env.VITE_API_KEY || "missing-key";

export function ChatBox() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { messages, isTyping, sendMessage, newConversation } = useChatContext();
  const { activeBotCode, activeBot, activeView, setActiveView } = useFrameMaster();
  const [copied, setCopied] = useState<string | null>(null);
  const [codeTask, setCodeTask] = useState<CodeTaskProgress | null>(null);
  const [movedToCanvas, setMovedToCanvas] = useState(false);
  const hasNavigatedRef = useRef(false);

  // Auto-navigate vers LiveChat apres le 1er echange complet (user + bot done)
  useEffect(() => {
    if (hasNavigatedRef.current) return;
    // Besoin d'au moins 1 user + 1 bot message qui a fini le streaming
    const userMsgs = messages.filter((m) => m.role === "user");
    const botMsgs = messages.filter((m) => m.role === "assistant" && !m.isStreaming);
    if (userMsgs.length >= 1 && botMsgs.length >= 1) {
      hasNavigatedRef.current = true;
      setMovedToCanvas(true);
      setActiveView("live-chat");
    }
  }, [messages, setActiveView]);

  // Reset quand nouvelle conversation (messages vides)
  useEffect(() => {
    if (messages.length === 0) {
      hasNavigatedRef.current = false;
      setMovedToCanvas(false);
    }
  }, [messages.length]);

  // Auto-scroll vers le bas — utilise scrollIntoView pour fiabilite
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, codeTask]);

  // Detecter les canvas_actions code task dans les messages
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;
    const codeAction = lastMsg.canvasActions?.find(
      (a) => a.type === "navigate" && a.view === "carlos-codes"
    );
    if (codeAction && codeAction.data) {
      const taskId = (codeAction.data as Record<string, string>).task_id;
      if (taskId && taskId !== codeTask?.taskId) {
        setCodeTask({ taskId, status: "connecting", description: "", actionsCount: 0 });
        pollCodeTask(taskId);
      }
    }
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll code task status
  const pollCodeTask = useCallback((taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BASE_URL}/codes/task/${taskId}`, {
          headers: { "X-API-Key": API_KEY },
        });
        if (!res.ok) return;
        const data = await res.json();
        setCodeTask({
          taskId,
          status: data.status,
          description: data.description || "",
          actionsCount: data.actions?.length || 0,
          error: data.error || undefined,
        });
        if (data.status === "done" || data.status === "error") {
          clearInterval(interval);
        }
      } catch {
        // silently ignore poll errors
      }
    }, 2000);
    // Auto-stop after 5 min
    setTimeout(() => clearInterval(interval), 300000);
  }, []);

  const copyToClipboard = (messageId: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(messageId);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const botName = activeBot?.nom || "CarlOS";
  const botAvatar = BOT_AVATAR[activeBotCode] || BOT_AVATAR["CEOB"];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50">
        <img
          src={botAvatar}
          alt={botName}
          className="w-6 h-6 rounded-full ring-2 ring-blue-200"
          onError={(e) => { (e.target as HTMLImageElement).src = BOT_AVATAR["CEOB"]; }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-900 truncate">{botName}</div>
          <div className="text-[9px] text-gray-500">CarlOS — Cerveau unifie</div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={newConversation}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Nouvelle conversation"
          >
            <Plus className="h-3.5 w-3.5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Bandeau "discussion dans le canvas" */}
      {movedToCanvas && activeView === "live-chat" && (
        <button
          onClick={() => setActiveView("live-chat")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border-b border-blue-100 text-[9px] text-blue-700 font-medium hover:bg-blue-100 transition-colors w-full"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Discussion en cours dans le canvas central
        </button>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3"
      >
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">
              Commence une conversation avec {botName}
            </p>
            <p className="text-[9px] text-gray-400 mt-1">
              Texte, voix, code — tout passe ici
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="group">
            {message.role === "user" ? (
              /* Message utilisateur */
              <div className="flex items-start gap-2 justify-end">
                <div className="max-w-[80%]">
                  <div className="bg-blue-600 text-white px-3 py-2 rounded-l-lg rounded-tr-lg text-xs">
                    {message.content}
                  </div>
                  <div className="text-[9px] text-gray-400 mt-1 text-right">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            ) : message.role === "system" ? (
              /* Message systeme (coaching) */
              <div className="flex justify-center">
                <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-[9px] text-amber-700 max-w-[90%]">
                  {message.content}
                </div>
              </div>
            ) : (
              /* Message bot */
              <div className="flex items-start gap-2">
                <img
                  src={botAvatar}
                  alt={botName}
                  className="w-5 h-5 rounded-full ring-1 ring-gray-200 shrink-0 mt-0.5"
                  onError={(e) => { (e.target as HTMLImageElement).src = BOT_AVATAR["CEOB"]; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-100 px-3 py-2 rounded-r-lg rounded-tl-lg text-xs text-gray-900 whitespace-pre-wrap break-words">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-0.5 h-3.5 bg-blue-500 ml-1 animate-pulse" />
                    )}
                  </div>
                  {/* Options CREDO — toujours visibles */}
                  {message.options && message.options.length > 0 && !message.isStreaming && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {message.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(opt, activeBotCode)}
                          disabled={isTyping}
                          className="text-[9px] px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50 font-medium"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-[9px] text-gray-400">
                      {formatTimestamp(message.timestamp)}
                    </div>
                    <button
                      onClick={() => copyToClipboard(message.id, message.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 p-0.5 rounded"
                      title="Copier"
                    >
                      {copied === message.id ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Code Task Progress Indicator — inline dans le chat */}
        {codeTask && codeTask.status !== "done" && codeTask.status !== "error" && (
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0 mt-0.5">
              <Code2 className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-orange-50 border border-orange-200 px-3 py-2 rounded-r-lg rounded-tl-lg">
                <div className="flex items-center gap-2 text-xs text-orange-700">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="font-medium">
                    {codeTask.status === "connecting" && "Connexion..."}
                    {codeTask.status === "researching" && "Recherche en cours..."}
                    {codeTask.status === "exposing" && "Analyse du plan..."}
                    {codeTask.status === "executing" && "Execution du code..."}
                    {codeTask.status === "verifying" && "Verification..."}
                  </span>
                </div>
                {codeTask.actionsCount > 0 && (
                  <div className="text-[9px] text-orange-500 mt-1">
                    {codeTask.actionsCount} action{codeTask.actionsCount > 1 ? "s" : ""} en cours
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Code Task Done */}
        {codeTask && codeTask.status === "done" && (
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="bg-green-50 border border-green-200 px-3 py-2 rounded-r-lg rounded-tl-lg text-xs text-green-700">
              Tache de code terminee ({codeTask.actionsCount} actions)
            </div>
          </div>
        )}

        {/* Code Task Error */}
        {codeTask && codeTask.status === "error" && (
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="bg-red-50 border border-red-200 px-3 py-2 rounded-r-lg rounded-tl-lg text-xs text-red-700">
              Erreur: {codeTask.error || "Tache echouee"}
            </div>
          </div>
        )}

        {/* Indicateur "en train d'ecrire" */}
        {isTyping && (
          <div className="flex items-start gap-2">
            <img
              src={botAvatar}
              alt={botName}
              className="w-5 h-5 rounded-full ring-1 ring-gray-200 shrink-0 mt-0.5"
              onError={(e) => { (e.target as HTMLImageElement).src = BOT_AVATAR["CEOB"]; }}
            />
            <div className="bg-gray-100 px-3 py-2 rounded-r-lg rounded-tl-lg">
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-[9px] text-gray-500 ml-1">{botName} reflechit...</span>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* InputBar compacte */}
      <div className="border-t bg-gray-50">
        <InputBar compact />
      </div>
    </div>
  );
}