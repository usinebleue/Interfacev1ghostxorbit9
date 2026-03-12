/**
 * ChatContext.tsx — Etat chat avec bridge vers useChat hook
 * Sprint B — LiveChat interactif + cristallisation
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useChat, useCrystals } from "../api/hooks";
import { useTextToSpeech } from "../api/useVocal";
import { useCanvasActions } from "./CanvasActionContext";
import { useFrameMaster } from "./FrameMasterContext";
import type { ChatMessage, ReflectionMode, CREDOPhase, Thread, MessageType, Crystal } from "../api/types";

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  activeReflectionMode: ReflectionMode;
  currentCREDOPhase: CREDOPhase;
  threads: Thread[];
  activeThreadId: string | null;
  crystals: Crystal[];
  autoTTSEnabled: boolean;
  videoAvatarEnabled: boolean;
  activeRoster: string[];
}

interface BranchMeta {
  msgType?: MessageType;
  parentId?: string;
  branchLabel?: string;
}

interface ChatActions {
  sendMessage: (text: string, agent?: string, ghost?: string, meta?: BranchMeta) => Promise<void>;
  sendMultiPerspective: (text: string, agents: string[]) => Promise<void>;
  injectVoiceMessage: (role: "user" | "assistant", content: string, agent?: string) => void;
  setReflectionMode: (mode: ReflectionMode) => void;
  newConversation: () => void;
  parkThread: () => void;
  resumeThread: (threadId: string) => void;
  completeThread: () => void;
  deleteThread: (threadId: string) => void;
  crystallize: (msgContent: string, botCode: string) => Crystal;
  deleteCrystal: (id: string) => void;
  exportCrystals: () => string;
  toggleAutoTTS: () => void;
  toggleVideoAvatar: () => void;
  addBotToRoster: (code: string) => void;
  removeBotFromRoster: (code: string) => void;
  acceptTeamProposal: (bots: string[]) => void;
}

type ChatContextType = ChatState & ChatActions;

const ChatCtx = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const {
    messages,
    isTyping,
    sendMessage: rawSend,
    sendMultiPerspective: rawMulti,
    injectVoiceMessage,
    injectFocusCard,
    newConversation,
    threads,
    activeThreadId,
    parkThread,
    resumeThread,
    completeThread,
    deleteThread,
    setCanvasActionsCallback,
    activeRoster,
    addBotToRoster,
    removeBotFromRoster,
    acceptTeamProposal,
  } = useChat();
  const { crystals, addCrystal, deleteCrystal, exportCrystals } = useCrystals();
  const { dispatchBatch, focusData, clearFocusMode } = useCanvasActions();
  const { activeView, activeBotCode, activeOrbit9Section, activeEspaceSection, activeStrategiqueSection, chatSourceView } = useFrameMaster();

  // Connecter le hook chat au Canvas Action Bus
  useEffect(() => {
    setCanvasActionsCallback((actions) => {
      dispatchBatch(actions);
    });
  }, [setCanvasActionsCallback, dispatchBatch]);

  // Focus Card — clic sur un bloc du dashboard = nouvelle discussion dédiée
  // focusData persiste pour garder le header gradient affiché (CenterZone → FocusModeLayout)
  // clearFocusMode est appelé par le bouton X du header (onClose)
  useEffect(() => {
    if (!focusData) return;
    // Parker la conversation en cours (si elle a des messages) et repartir à zéro
    newConversation();
    // Injecter la carte focus comme premier message du nouveau fil (bulle de discussion)
    injectFocusCard({
      title: focusData.title,
      elementType: focusData.elementType,
      data: focusData.data,
      bot: focusData.bot,
    });
  }, [focusData]); // eslint-disable-line react-hooks/exhaustive-deps
  const [activeReflectionMode, setReflectionMode] =
    useState<ReflectionMode>("credo");
  const [currentCREDOPhase] = useState<CREDOPhase>("C");
  const [autoTTSEnabled, setAutoTTSEnabled] = useState(false);
  const [videoAvatarEnabled, setVideoAvatarEnabled] = useState(false);
  const tts = useTextToSpeech();
  const prevMsgCountRef = useRef(messages.length);

  // Auto-TTS: lire automatiquement les nouvelles reponses bot
  useEffect(() => {
    if (!autoTTSEnabled || !tts.isSupported) return;
    if (messages.length <= prevMsgCountRef.current) {
      prevMsgCountRef.current = messages.length;
      return;
    }
    prevMsgCountRef.current = messages.length;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "assistant" && lastMsg.content && !lastMsg.isStreaming
        && lastMsg.msgType !== "voice") {
      // Petit delai pour laisser le rendu finir
      // Skip voice messages — deja parles par ElevenLabs via LiveKit
      setTimeout(() => tts.speak(lastMsg.content, lastMsg.id), 300);
    }
  }, [messages, autoTTSEnabled, tts]);

  const toggleAutoTTS = useCallback(() => {
    setAutoTTSEnabled((prev) => {
      if (prev) tts.stop();
      return !prev;
    });
  }, [tts]);

  const toggleVideoAvatar = useCallback(() => {
    setVideoAvatarEnabled((prev) => !prev);
  }, []);

  // D-101 — Résoudre la sous-section active pour le GPS du Flow
  const resolveSubSection = useCallback((): string | undefined => {
    if (activeView === "department") return activeBotCode; // CEOB→direction, CFOB→finance, etc.
    if (activeView === "orbit9-detail") return activeOrbit9Section || undefined;
    if (activeView === "espace-bureau") return activeEspaceSection;
    if (activeView === "strategique") return activeStrategiqueSection;
    return undefined;
  }, [activeView, activeBotCode, activeOrbit9Section, activeEspaceSection, activeStrategiqueSection]);

  // Wrap sendMessage to inject active reflection mode + GPS du Flow context
  const sendMessage = useCallback(
    async (text: string, agent?: string, ghost?: string, meta?: BranchMeta) => {
      const subSection = resolveSubSection();
      // D-109: Si on vient d'une Room, utiliser chatSourceView comme active_view
      const effectiveView = chatSourceView || activeView;
      await rawSend(text, agent, ghost, activeReflectionMode, {
        ...meta,
        activeView: effectiveView,
        activeSubSection: chatSourceView ? undefined : subSection,
      });
    },
    [rawSend, activeReflectionMode, activeView, resolveSubSection, chatSourceView]
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
        autoTTSEnabled,
        videoAvatarEnabled,
        activeRoster,
        sendMessage,
        sendMultiPerspective,
        injectVoiceMessage,
        setReflectionMode,
        newConversation: handleNewConversation,
        parkThread,
        resumeThread,
        completeThread,
        deleteThread,
        crystallize,
        deleteCrystal,
        exportCrystals,
        toggleAutoTTS,
        toggleVideoAvatar,
        addBotToRoster,
        removeBotFromRoster,
        acceptTeamProposal,
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
