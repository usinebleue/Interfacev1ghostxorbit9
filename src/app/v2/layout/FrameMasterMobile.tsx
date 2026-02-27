/**
 * FrameMasterMobile.tsx — Layout mobile avec bottom tab bar
 * Sprint A — Frame Master V2
 */

import { useState } from "react";
import { Menu, Settings } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useFrameMaster } from "../context/FrameMasterContext";
import { BOT_EMOJI } from "../api/types";
import { CenterZone } from "../zones/center/CenterZone";
import { MobileTabBar } from "../mobile/MobileTabBar";
import { MobileMenu } from "../mobile/MobileMenu";

export function FrameMasterMobile() {
  const { activeBotCode, activeBot } = useFrameMaster();
  const [menuOpen, setMenuOpen] = useState(false);
  const botEmoji = BOT_EMOJI[activeBotCode] || "🤖";

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Header compact */}
      <header className="h-12 border-b flex items-center px-3 gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 flex-1">
          <span className="text-lg">{botEmoji}</span>
          <span className="text-sm font-medium truncate">
            {activeBot?.nom || "CarlOS"}
          </span>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </header>

      {/* Zone centrale plein ecran */}
      <div className="flex-1 overflow-hidden">
        <CenterZone />
      </div>

      {/* Bottom tab bar */}
      <MobileTabBar />

      {/* Menu drawer */}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
