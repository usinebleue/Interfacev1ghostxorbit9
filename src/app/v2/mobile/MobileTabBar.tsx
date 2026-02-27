/**
 * MobileTabBar.tsx — 5 onglets bottom navigation
 * Sprint A — Frame Master V2
 */

import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  FolderKanban,
  User,
} from "lucide-react";
import { useFrameMaster } from "../context/FrameMasterContext";
import { cn } from "../../components/ui/utils";

type TabId = "dashboard" | "chat" | "bots" | "projets" | "profil";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Board", icon: LayoutDashboard },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "bots", label: "Bots", icon: Bot },
  { id: "projets", label: "Projets", icon: FolderKanban },
  { id: "profil", label: "Profil", icon: User },
];

export function MobileTabBar() {
  const { activeView, setActiveView } = useFrameMaster();

  const currentTab: TabId =
    activeView === "dashboard" ? "dashboard" : "chat";

  const handleTab = (id: TabId) => {
    if (id === "dashboard") setActiveView("dashboard");
    else if (id === "chat") setActiveView("discussion");
    // bots, projets, profil — placeholder pour maintenant
  };

  return (
    <nav className="h-14 border-t bg-background flex items-center shrink-0">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTab(tab.id)}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-colors",
            currentTab === tab.id
              ? "text-blue-600"
              : "text-muted-foreground"
          )}
        >
          <tab.icon className="h-5 w-5" />
          <span className="text-[10px]">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
