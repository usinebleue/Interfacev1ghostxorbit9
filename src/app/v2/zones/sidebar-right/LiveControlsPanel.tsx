/**
 * LiveControlsPanel.tsx — Panneau cockpit "CarlOS Live"
 * 3 boutons : Micro (vocal), Telephone (appel), Camera (video)
 * Fixe en bas du sidebar droit, meme hauteur que InputBar
 * Design cockpit : sharp, live, organique — montre que CarlOS est vivant
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
    activeColor: string;
    hoverColor: string;
  }[] = [
    {
      id: "mic",
      icon: Mic,
      label: "Message vocal",
      activeColor: "bg-green-500 text-white shadow-green-500/30",
      hoverColor: "hover:bg-green-50 hover:text-green-600",
    },
    {
      id: "phone",
      icon: Phone,
      label: "Appel CarlOS",
      activeColor: "bg-blue-500 text-white shadow-blue-500/30",
      hoverColor: "hover:bg-blue-50 hover:text-blue-600",
    },
    {
      id: "video",
      icon: Video,
      label: "Video CarlOS",
      activeColor: "bg-purple-500 text-white shadow-purple-500/30",
      hoverColor: "hover:bg-purple-50 hover:text-purple-600",
    },
  ];

  return (
    <div className="px-3 py-3 bg-gradient-to-t from-gray-50 to-white">
      {/* Header cockpit */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative">
          <Radio className="h-3.5 w-3.5 text-green-500" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          CarlOS Live
        </span>
      </div>

      {/* 3 boutons cockpit */}
      <div className="flex gap-2 justify-center">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const isActive = activeChannel === channel.id;
          return (
            <Tooltip key={channel.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => toggleChannel(channel.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200 cursor-pointer",
                    "border border-gray-200",
                    isActive
                      ? cn(channel.activeColor, "shadow-lg border-transparent scale-105")
                      : cn(
                          "bg-white text-gray-400",
                          channel.hoverColor,
                          "hover:border-gray-300 hover:shadow-sm"
                        )
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className={cn(
                    "text-[10px] font-medium",
                    isActive ? "text-white" : "text-gray-500"
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
