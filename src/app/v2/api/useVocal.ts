/**
 * useVocal.ts — Hook vocaux CarlOS
 * STT: Web Speech API (navigateur natif, gratuit, Chrome/Edge)
 * TTS: speechSynthesis navigateur (francais) — fallback pour ElevenLabs
 * Sprint B — Task 3 Vocaux
 */

import { useState, useRef, useCallback, useEffect } from "react";

// ── Types ──

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

// Web Speech API — pas de types TS natifs
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// ── STT Hook — Microphone → texte ──

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported = typeof window !== "undefined" && (
    "SpeechRecognition" in window || "webkitSpeechRecognition" in window
  );

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Speech Recognition non supporte dans ce navigateur. Utilise Chrome ou Edge.");
      return;
    }

    setError(null);
    setTranscript("");
    setInterimTranscript("");

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "fr-CA"; // Francais quebecois

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result && result[0]) {
          if (result.isFinal) {
            finalText += result[0].transcript;
          } else {
            interimText += result[0].transcript;
          }
        }
      }

      if (finalText) setTranscript(finalText);
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") {
        // Silencieux — pas une erreur
        return;
      }
      if (event.error === "aborted") return;
      setError(`Erreur micro: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript: transcript + (interimTranscript ? " " + interimTranscript : ""),
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript: () => { setTranscript(""); setInterimTranscript(""); },
  };
}

// ── TTS Hook — Texte → voix ──

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback((text: string, msgId?: string) => {
    if (!isSupported) return;

    // Arreter la lecture en cours
    window.speechSynthesis.cancel();

    // Nettoyer le HTML et markdown du texte
    const cleanText = text
      .replace(/<[^>]+>/g, "")         // HTML tags
      .replace(/\*\*([^*]+)\*\*/g, "$1") // **bold**
      .replace(/\*([^*]+)\*/g, "$1")     // *italic*
      .replace(/#{1,6}\s/g, "")          // # headers
      .replace(/```[^`]*```/g, "")       // code blocks
      .replace(/`([^`]+)`/g, "$1")       // inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
      .replace(/[-*+]\s/g, "")           // list bullets
      .replace(/\d+\.\s/g, "")           // numbered lists
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "fr-CA";
    utterance.rate = 1.05;   // Un poil plus rapide — naturel
    utterance.pitch = 1.0;

    // Chercher une voix francaise (preferer Quebec si dispo)
    const voices = window.speechSynthesis.getVoices();
    const frCAVoice = voices.find((v) => v.lang === "fr-CA");
    const frVoice = voices.find((v) => v.lang.startsWith("fr"));
    if (frCAVoice) {
      utterance.voice = frCAVoice;
    } else if (frVoice) {
      utterance.voice = frVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (msgId) setSpeakingMsgId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingMsgId(null);
  }, [isSupported]);

  const toggleSpeak = useCallback((text: string, msgId?: string) => {
    if (isSpeaking && speakingMsgId === msgId) {
      stop();
    } else {
      speak(text, msgId);
    }
  }, [isSpeaking, speakingMsgId, speak, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    isSpeaking,
    speakingMsgId,
    isSupported,
    speak,
    stop,
    toggleSpeak,
  };
}

// ── Auto-TTS state ──

export function useAutoTTS() {
  const [autoTTSEnabled, setAutoTTSEnabled] = useState(false);
  const tts = useTextToSpeech();

  const toggleAutoTTS = useCallback(() => {
    setAutoTTSEnabled((prev) => {
      if (prev) tts.stop(); // Si on desactive, arreter la lecture
      return !prev;
    });
  }, [tts]);

  return {
    autoTTSEnabled,
    toggleAutoTTS,
    tts,
  };
}
