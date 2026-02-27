/**
 * CenterZone.tsx — Router entre Dashboard, Department et Discussion
 * InputBar fixe en bas (meme niveau que "Ma Productivite" dans sidebar)
 * Sprint A — Frame Master V2
 */

import { useFrameMaster } from "../../context/FrameMasterContext";
import { DashboardView } from "./DashboardView";
import { CockpitView } from "./CockpitView";
import { HealthView } from "./HealthView";
import { DepartmentTourDeControle } from "./DepartmentTourDeControle";
import { DiscussionView } from "./DiscussionView";
import { BranchPatternsDemo } from "./BranchPatternsDemo";
import { InputBar } from "./InputBar";

export function CenterZone() {
  const { activeView } = useFrameMaster();

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Vue principale */}
      <div className="flex-1 overflow-hidden">
        {activeView === "dashboard" && <DashboardView />}
        {activeView === "cockpit" && <CockpitView />}
        {activeView === "health" && <HealthView />}
        {activeView === "department" && <DepartmentTourDeControle />}
        {activeView === "discussion" && <DiscussionView />}
        {activeView === "branches" && <BranchPatternsDemo />}
      </div>

      {/* InputBar fixe en bas — a cote de Ma Productivite */}
      <InputBar />
    </div>
  );
}
