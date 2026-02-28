/**
 * ChatContext.tsx — Etat chat avec bridge vers useChat hook
 * Sprint A — Frame Master V2
 */

import { createContext, useContext, useState, useCallback } from "react";
import { useChat } from "../api/hooks";
import type { ChatMessage, ReflectionMode, CREDOPhase, Thread } from "../api/types";

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  activeReflectionMode: ReflectionMode;
  currentCREDOPhase: CREDOPhase;
  threads: Thread[];
  activeThreadId: string | null;
}

interface ChatActions {
  sendMessage: (text: string, agent?: string, ghost?: string) => Promise<void>;
  setReflectionMode: (mode: ReflectionMode) => void;
  newConversation: () => void;
  parkThread: () => void;
  resumeThread: (threadId: string) => void;
  completeThread: () => void;
  deleteThread: (threadId: string) => void;
}

type ChatContextType = ChatState & ChatActions;

const ChatCtx = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const {
    messages,
    isTyping,
    sendMessage: rawSend,
    newConversation,
    threads,
    activeThreadId,
    parkThread,
    resumeThread,
    completeThread,
    deleteThread,
  } = useChat();
  const [activeReflectionMode, setReflectionMode] =
    useState<ReflectionMode>("credo");
  const [currentCREDOPhase] = useState<CREDOPhase>("C");

  // Wrap sendMessage to inject active reflection mode + direct:true
  const sendMessage = useCallback(
    async (text: string, agent?: string, ghost?: string) => {
      await rawSend(text, agent, ghost, activeReflectionMode);
    },
    [rawSend, activeReflectionMode]
  );

  const handleNewConversation = useCallback(() => {
    newConversation();
    setReflectionMode("credo");
  }, [newConversation]);

  return (
    <ChatCtx.Provider
      value={{
        messages,
        isTyping,
        activeReflectionMode,
        currentCREDOPhase,
        threads,
        activeThreadId,
        sendMessage,
        setReflectionMode,
        newConversation: handleNewConversation,
        parkThread,
        resumeThread,
        completeThread,
        deleteThread,
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
