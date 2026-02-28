/**
 * ChatContext.tsx — Etat chat avec bridge vers useChat hook
 * Sprint B — LiveChat interactif + cristallisation
 */

import { createContext, useContext, useState, useCallback } from "react";
import { useChat, useCrystals } from "../api/hooks";
import type { ChatMessage, ReflectionMode, CREDOPhase, Thread, MessageType, Crystal } from "../api/types";

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  activeReflectionMode: ReflectionMode;
  currentCREDOPhase: CREDOPhase;
  threads: Thread[];
  activeThreadId: string | null;
  crystals: Crystal[];
}

interface BranchMeta {
  msgType?: MessageType;
  parentId?: string;
  branchLabel?: string;
}

interface ChatActions {
  sendMessage: (text: string, agent?: string, ghost?: string, meta?: BranchMeta) => Promise<void>;
  sendMultiPerspective: (text: string, agents: string[]) => Promise<void>;
  setReflectionMode: (mode: ReflectionMode) => void;
  newConversation: () => void;
  parkThread: () => void;
  resumeThread: (threadId: string) => void;
  completeThread: () => void;
  deleteThread: (threadId: string) => void;
  crystallize: (msgContent: string, botCode: string) => Crystal;
  deleteCrystal: (id: string) => void;
  exportCrystals: () => string;
}

type ChatContextType = ChatState & ChatActions;

const ChatCtx = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const {
    messages,
    isTyping,
    sendMessage: rawSend,
    sendMultiPerspective: rawMulti,
    newConversation,
    threads,
    activeThreadId,
    parkThread,
    resumeThread,
    completeThread,
    deleteThread,
  } = useChat();
  const { crystals, addCrystal, deleteCrystal, exportCrystals } = useCrystals();
  const [activeReflectionMode, setReflectionMode] =
    useState<ReflectionMode>("credo");
  const [currentCREDOPhase] = useState<CREDOPhase>("C");

  // Wrap sendMessage to inject active reflection mode + branch meta
  const sendMessage = useCallback(
    async (text: string, agent?: string, ghost?: string, meta?: BranchMeta) => {
      await rawSend(text, agent, ghost, activeReflectionMode, meta);
    },
    [rawSend, activeReflectionMode]
  );

  // B.1 — Multi-perspectives wrapper
  const sendMultiPerspective = useCallback(
    async (text: string, agents: string[]) => {
      await rawMulti(text, agents, activeReflectionMode);
    },
    [rawMulti, activeReflectionMode]
  );

  const handleNewConversation = useCallback(() => {
    newConversation();
    setReflectionMode("credo");
  }, [newConversation]);

  // Crystallize a bot response — extract title from first line, save to banque
  const crystallize = useCallback(
    (msgContent: string, botCode: string): Crystal => {
      const lines = msgContent.split("\n").filter((l) => l.trim());
      const titre = lines[0]?.replace(/^\*\*(.+?)\*\*/, "$1").replace(/^#+\s*/, "").slice(0, 80) || "Idee cristallisee";
      const threadTitle = messages.find((m) => m.role === "user")?.content.slice(0, 50) || "Conversation";

      return addCrystal({
        titre,
        contenu: msgContent,
        source: threadTitle,
        bot: botCode,
        mode: activeReflectionMode,
        tags: [],
      });
    },
    [addCrystal, messages, activeReflectionMode]
  );

  return (
    <ChatCtx.Provider
      value={{
        messages,
        isTyping,
        activeReflectionMode,
        currentCREDOPhase,
        threads,
        activeThreadId,
        crystals,
        sendMessage,
        sendMultiPerspective,
        setReflectionMode,
        newConversation: handleNewConversation,
        parkThread,
        resumeThread,
        completeThread,
        deleteThread,
        crystallize,
        deleteCrystal,
        exportCrystals,
      }}
    >
      {children}
    </ChatCtx.Provider>
  );
}

export function useChatContext(): ChatContextType {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useChatContext must be inside ChatProvider");
  return ctx;
}
