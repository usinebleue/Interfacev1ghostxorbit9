/**
 * LiveControlsPanel.tsx — Panneau cockpit "CarlOS Live"
 * 3 boutons : Micro (vocal), Telephone (appel), Camera (video)
 * Fixe en bas du sidebar droit, meme hauteur que InputBar (min-h-[136px])
 * Design premium light — subtle, elegant, vivant
 * Sprint B — Panneau Live Controls
 */

import { useState } from "react";
import { Mic, Phone, Video, Radio } from "lucide-react";
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
    activeBg: string;
    activeText: string;
    activeRing: string;
    hoverBg: string;
    iconColor: string;
  }[] = [
    {
      id: "mic",
      icon: Mic,
      label: "Message vocal",
      activeBg: "bg-green-50",
      activeText: "text-green-600",
      activeRing: "ring-2 ring-green-300",
      hoverBg: "hover:bg-green-50/60",
      iconColor: "text-green-500",
    },
    {
      id: "phone",
      icon: Phone,
      label: "Appel CarlOS",
      activeBg: "bg-blue-50",
      activeText: "text-blue-600",
      activeRing: "ring-2 ring-blue-300",
      hoverBg: "hover:bg-blue-50/60",
      iconColor: "text-blue-500",
    },
    {
      id: "video",
      icon: Video,
      label: "Video CarlOS",
      activeBg: "bg-purple-50",
      activeText: "text-purple-600",
      activeRing: "ring-2 ring-purple-300",
      hoverBg: "hover:bg-purple-50/60",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-[136px] flex flex-col justify-center bg-white px-3 py-4">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em]">
          CarlOS Live
        </span>
      </div>

      {/* 3 boutons */}
      <div className="flex gap-2">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const isActive = activeChannel === channel.id;
          return (
            <Tooltip key={channel.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => toggleChannel(channel.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200 cursor-pointer border",
                    isActive
                      ? cn(channel.activeBg, channel.activeRing, "border-transparent shadow-sm scale-[1.03]")
                      : cn(
                          "bg-gray-50/50 border-gray-100",
                          channel.hoverBg,
                          "hover:border-gray-200 hover:shadow-sm"
                        )
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                    isActive
                      ? cn(channel.activeBg, channel.activeText)
                      : "bg-gray-100 text-gray-400 group-hover:text-gray-500"
                  )}>
                    <Icon className={cn(
                      "h-4.5 w-4.5",
                      isActive ? channel.activeText : channel.iconColor + "/60"
                    )} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium",
                    isActive ? channel.activeText : "text-gray-400"
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
