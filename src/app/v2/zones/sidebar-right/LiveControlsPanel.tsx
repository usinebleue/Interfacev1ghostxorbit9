/**
 * LiveControlsPanel.tsx — Panneau cockpit "CarlOS Live"
 * 3 boutons : Micro (vocal), Telephone (appel), Camera (video)
 * Fixe en bas du sidebar droit, meme hauteur que InputBar (min-h-[136px])
 * Design cockpit premium : dark, glow, sharp
 * Sprint B — Panneau Live Controls
 */

import { useState } from "react";
import { Mic, Phone, Video, Radio, Waves } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../../components/ui/tooltip";
import { cn } from "../../../components/ui/utils";

type LiveChannel = "mic" | "phone" | "video";

export function LiveControlsPanel() {
  const [activeChannel, setActiveChannel] = useState<LiveChannel | null>(null);

  const toggleChannel = (channel: LiveChannel) => {
    setActiveChannel((prev) => (prev === channel ? null : channel));
    // TODO: brancher sur ElevenLabs (mic), WebRTC (phone/video)
  };

  const channels: {
    id: LiveChannel;
    icon: React.ElementType;
    label: string;
    glow: string;
    activeGradient: string;
    ringColor: string;
  }[] = [
    {
      id: "mic",
      icon: Mic,
      label: "Message vocal",
      glow: "shadow-[0_0_20px_rgba(34,197,94,0.4)]",
      activeGradient: "bg-gradient-to-br from-green-400 to-emerald-600",
      ringColor: "ring-green-400/50",
    },
    {
      id: "phone",
      icon: Phone,
      label: "Appel CarlOS",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.4)]",
      activeGradient: "bg-gradient-to-br from-blue-400 to-indigo-600",
      ringColor: "ring-blue-400/50",
    },
    {
      id: "video",
      icon: Video,
      label: "Video CarlOS",
      glow: "shadow-[0_0_20px_rgba(168,85,247,0.4)]",
      activeGradient: "bg-gradient-to-br from-purple-400 to-violet-600",
      ringColor: "ring-purple-400/50",
    },
  ];

  return (
    <div className="min-h-[136px] flex flex-col justify-center bg-gradient-to-b from-gray-900 via-gray-900 to-black px-4 py-4 rounded-t-2xl">
      {/* Header cockpit */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="relative">
          <Radio className="h-3.5 w-3.5 text-green-400" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          CarlOS Live
        </span>
        <Waves className="h-3 w-3 text-green-500/50 animate-pulse" />
      </div>

      {/* 3 boutons cockpit */}
      <div className="flex gap-3 justify-center">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const isActive = activeChannel === channel.id;
          return (
            <Tooltip key={channel.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => toggleChannel(channel.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer",
                    isActive
                      ? cn(
                          channel.activeGradient,
                          "text-white",
                          channel.glow,
                          "scale-105 ring-2",
                          channel.ringColor
                        )
                      : cn(
                          "bg-gray-800/80 text-gray-500",
                          "hover:bg-gray-700/80 hover:text-gray-300",
                          "hover:shadow-lg hover:scale-[1.02]",
                          "border border-gray-700/50"
                        )
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "drop-shadow-lg")} />
                  <span className={cn(
                    "text-[10px] font-semibold tracking-wide",
                    isActive ? "text-white/90" : "text-gray-500"
                  )}>
                    {channel.id === "mic" ? "Vocal" : channel.id === "phone" ? "Appel" : "Video"}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{channel.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
