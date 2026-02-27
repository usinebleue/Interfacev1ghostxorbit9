/**
 * ChatContext.tsx — Etat chat avec bridge vers useChat hook
 * Sprint A — Frame Master V2
 */

import { createContext, useContext, useState, useCallback } from "react";
import { useChat } from "../api/hooks";
import type { ChatMessage, ReflectionMode, CREDOPhase } from "../api/types";

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  activeReflectionMode: ReflectionMode;
  currentCREDOPhase: CREDOPhase;
}

interface ChatActions {
  sendMessage: (text: string, agent?: string, ghost?: string) => Promise<void>;
  setReflectionMode: (mode: ReflectionMode) => void;
  newConversation: () => void;
}

type ChatContextType = ChatState & ChatActions;

const ChatCtx = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { messages, isTyping, sendMessage, newConversation } = useChat();
  const [activeReflectionMode, setReflectionMode] =
    useState<ReflectionMode>("credo");
  const [currentCREDOPhase] = useState<CREDOPhase>("C");

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
        sendMessage,
        setReflectionMode,
        newConversation: handleNewConversation,
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
