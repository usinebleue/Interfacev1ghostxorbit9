/**
 * AtelierLayout.tsx — Shell split-screen partage pour tous les Ateliers
 * Header + chat gauche (40%) + contenu droite (60%)
 * Sprint B — Atelier Simulations
 */

"use client";

import { useRef, useEffect } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { ACTION_STYLES } from "./atelier-actions";

interface AtelierLayoutProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  stage: number;
  stageCount: number;
  stageLabel?: string;
  onBack: () => void;
  onReset: () => void;
  chatContent: React.ReactNode;
  atelierContent: React.ReactNode;
  actions?: { label: string; variant: "primary" | "secondary"; onClick: () => void }[];
}

export function AtelierLayout({
  title,
  icon: Icon,
  iconColor,
  stage,
  stageCount,
  stageLabel,
  onBack,
  onReset,
  chatContent,
  atelierContent,
  actions,
}: AtelierLayoutProps) {
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat when content changes
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="shrink-0 bg-white border-b px-4 py-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Icon className={cn("h-4 w-4", iconColor)} />
        <span className="text-sm font-bold text-gray-800">{title}</span>
        {stageLabel && (
          <span className="text-xs text-gray-500 ml-1">— {stageLabel}</span>
        )}

        {/* Stage dots */}
        <div className="flex items-center gap-1 ml-auto">
          {Array.from({ length: stageCount }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i < stage ? "bg-green-400" : i === stage ? "bg-blue-500 scale-125" : "bg-gray-200"
              )}
            />
          ))}
        </div>

        <button
          onClick={onReset}
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-2"
          title="Recommencer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Split-screen: Chat (40%) | Atelier (60%) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — Chat */}
        <div className="w-[40%] min-w-[280px] flex flex-col border-r border-gray-200 bg-white">
          <div
            ref={chatRef}
            className="flex-1 overflow-auto p-4 space-y-4"
          >
            {chatContent}
          </div>

          {/* Action bar */}
          {actions && actions.length > 0 && (
            <div className="shrink-0 border-t bg-gray-50 px-4 py-2.5 flex items-center gap-2">
              {actions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                    ACTION_STYLES[action.variant]
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right panel — Atelier content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          {atelierContent}
        </div>
      </div>
    </div>
  );
}
