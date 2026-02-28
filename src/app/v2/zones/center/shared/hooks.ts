/**
 * hooks.ts — Hooks partages pour toutes les simulations
 * useStageNavigation: navigation avec historique + back
 * usePausableTimer: timer pausable pour les phases auto-advance
 * Sprint A — Frame Master V2
 */

import { useState, useCallback, useRef, useEffect } from "react";

// ─── useStageNavigation — navigation avec historique + back ───

export interface StageNavigationResult {
  stage: number;
  history: number[];
  canGoBack: boolean;
  advance: (next: number) => void;
  goBack: () => void;
  reset: () => void;
}

export function useStageNavigation(initialStage = 0): StageNavigationResult {
  const [stage, setStage] = useState(initialStage);
  const [history, setHistory] = useState<number[]>([initialStage]);

  const advance = useCallback((next: number) => {
    setStage(next);
    setHistory(prev => [...prev, next]);
  }, []);

  const goBack = useCallback(() => {
    setHistory(prev => {
      if (prev.length <= 1) return prev;
      const newHistory = prev.slice(0, -1);
      setStage(newHistory[newHistory.length - 1]);
      return newHistory;
    });
  }, []);

  const reset = useCallback(() => {
    setStage(initialStage);
    setHistory([initialStage]);
  }, [initialStage]);

  return {
    stage,
    history,
    canGoBack: history.length > 1,
    advance,
    goBack,
    reset,
  };
}

// ─── usePausableTimer — timer that user can pause/resume ───

export interface PausableTimerResult {
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
}

export function usePausableTimer(
  callback: () => void,
  delay: number | null,
  enabled = true,
): PausableTimerResult {
  const [isPaused, setIsPaused] = useState(false);
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(delay ?? 0);
  const startTimeRef = useRef<number>(0);

  savedCallback.current = callback;

  useEffect(() => {
    if (!enabled || delay === null || isPaused) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    timeoutRef.current = setTimeout(() => {
      savedCallback.current();
    }, remainingRef.current);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [delay, enabled, isPaused]);

  // Reset remaining when delay changes
  useEffect(() => {
    remainingRef.current = delay ?? 0;
  }, [delay]);

  const pause = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      remainingRef.current -= Date.now() - startTimeRef.current;
      if (remainingRef.current < 0) remainingRef.current = 0;
    }
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const toggle = useCallback(() => {
    setIsPaused(p => !p);
  }, []);

  return { isPaused, pause, resume, toggle };
}

// ─── useAntiLoop — guard against infinite challenge/refinement loops ───

export interface AntiLoopResult {
  count: number;
  canDo: boolean;
  increment: () => void;
  reset: () => void;
}

export function useAntiLoop(maxCount: number): AntiLoopResult {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  return {
    count,
    canDo: count < maxCount,
    increment,
    reset,
  };
}
