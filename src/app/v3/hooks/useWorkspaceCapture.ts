/**
 * useWorkspaceCapture.ts — Hook de capture des réponses bot dans le workspace
 *
 * Watch `messages` du ChatContext. Quand `pendingCapture` est set et qu'un
 * nouveau message assistant (non-streaming) arrive → addSimV3Cristallise + clear pending.
 *
 * Pattern artefacts progressifs: le workspace CAPTURE les réponses du chat.
 */

import { useEffect, useRef } from "react";
import { useChatContext } from "../../v2/context/ChatContext";
import { useAmorcer } from "../AmorcerContext";

export function useWorkspaceCapture() {
  const { messages } = useChatContext();
  const { pendingCapture, setPendingCapture, addSimV3Cristallise, activeBotCode } = useAmorcer();
  const prevMsgCountRef = useRef(messages.length);

  useEffect(() => {
    // Only trigger on new messages added
    if (messages.length <= prevMsgCountRef.current) {
      prevMsgCountRef.current = messages.length;
      return;
    }
    prevMsgCountRef.current = messages.length;

    // Only capture when we're waiting for a section response
    if (!pendingCapture) return;

    // Get the last message
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;

    // Only capture assistant messages that are complete (not streaming)
    if (lastMsg.role !== "assistant") return;
    if (!lastMsg.content || lastMsg.content.length < 20) return;

    // Capture the response into the cristallisé store
    addSimV3Cristallise(lastMsg.content, activeBotCode, pendingCapture);
    setPendingCapture(null);
  }, [messages, pendingCapture, setPendingCapture, addSimV3Cristallise, activeBotCode]);
}
