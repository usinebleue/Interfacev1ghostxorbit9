/**
 * AmorcerLayoutMobile.tsx — Layout mobile V3
 * Rendu conditionnel depuis FrameMasterAmorcer quand useIsMobile() = true.
 * 3 onglets plein ecran : Controle, Discussion, Workspace
 * Toggle sidebar retractee (72px icones) via bouton dans la bottom bar
 * Auto-switch de tab quand navigation depuis le tour de controle
 * Desktop reste 100% inchange.
 */

import { useState, useEffect, useRef } from "react";
import { ControlTowerPanel } from "./ControlTowerPanel";
import { DiscussionWindow } from "./DiscussionWindow";
import { WorkspacePhasesPanel } from "./WorkspacePhasesPanel";
import { MobileTabBarV3, type MobileTab } from "./MobileTabBarV3";
import { MeetingVideoStrip } from "./meeting/MeetingVideoStrip";
import { useAmorcer } from "./AmorcerContext";
import { useFrameMaster } from "../v2/context/FrameMasterContext";
import { cn } from "../components/ui/utils";

export function AmorcerLayoutMobile() {
  const [activeTab, setActiveTab] = useState<MobileTab>("discussion");
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const { rightSection, activeBotCode, activePhase, cockpitTab, activeMeeting, meetingControls } = useAmorcer();
  const { setLeftCollapsed } = useFrameMaster();

  // ═══ Expanded quand onglet Controle actif, collapsed sinon ═══
  useEffect(() => {
    setLeftCollapsed(activeTab !== "controle");
  }, [activeTab, setLeftCollapsed]);

  // ═══ Cacher sidebar quand on va sur l'onglet Controle ═══
  useEffect(() => {
    if (activeTab === "controle") setSidebarVisible(false);
  }, [activeTab]);

  // ═══ Auto-switch tab quand navigation depuis tour de controle ═══
  const prevBotRef = useRef(activeBotCode);
  const prevSectionRef = useRef(rightSection);

  // Changement de bot → aller sur Discussion
  useEffect(() => {
    if (activeBotCode !== prevBotRef.current) {
      prevBotRef.current = activeBotCode;
      setActiveTab("discussion");
    }
  }, [activeBotCode]);

  // Changement de section → aller sur Workspace
  useEffect(() => {
    if (rightSection !== prevSectionRef.current) {
      prevSectionRef.current = rightSection;
      if (rightSection) {
        setActiveTab("workspace");
      }
    }
  }, [rightSection]);

  // Orbit9 → cockpitTab change à "orbit9" mais rightSection reste null
  // On doit capter ce cas pour auto-switch vers workspace
  const prevCockpitTabRef = useRef(cockpitTab);
  useEffect(() => {
    if (cockpitTab !== prevCockpitTabRef.current) {
      prevCockpitTabRef.current = cockpitTab;
      if (cockpitTab === "orbit9") {
        setActiveTab("workspace");
      }
    }
  }, [cockpitTab]);

  // ═══ Auto-switch vers discussion quand une reunion demarre ═══
  const prevMeetingRef = useRef(activeMeeting);
  useEffect(() => {
    if (activeMeeting && !prevMeetingRef.current) {
      setActiveTab("discussion");
    }
    prevMeetingRef.current = activeMeeting;
  }, [activeMeeting]);

  // Changement de phase de travail (execution, reflexion, etc.) → aller sur Workspace
  // Couvre les cas ou rightSection reste null (ex: bouton Execution)
  const prevPhaseRef = useRef(activePhase);
  const WORK_PHASES = ["execution", "reflexion", "creation", "retroaction"];
  const IDLE_PHASES = ["observation", "attention", "moderation", "discussion"];
  useEffect(() => {
    if (activePhase !== prevPhaseRef.current) {
      const prev = prevPhaseRef.current;
      prevPhaseRef.current = activePhase;
      if (WORK_PHASES.includes(activePhase) && IDLE_PHASES.includes(prev)) {
        setActiveTab("workspace");
      }
    }
  }, [activePhase]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white" style={{ height: '100dvh' }}>

      {/* Zone principale : sidebar retractee (toggle) + contenu */}
      <div className="flex-1 overflow-hidden flex">

        {/* Sidebar retractee — 72px, visible si toggle ON et pas sur onglet Controle */}
        {sidebarVisible && activeTab !== "controle" && (
          <aside className="w-[72px] shrink-0 h-full flex flex-col overflow-hidden">
            <ControlTowerPanel />
          </aside>
        )}

        {/* Zone contenu */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "discussion" && <DiscussionWindow />}
          {/* WorkspacePhasesPanel — toujours monte si meeting active (preserve LiveKit), hidden si pas sur l'onglet */}
          {(activeTab === "workspace" || !!activeMeeting) && (
            <div className={cn("h-full overflow-hidden", activeTab !== "workspace" && "hidden")}>
              <WorkspacePhasesPanel />
            </div>
          )}
          {activeTab === "controle" && (
            <aside className="h-full flex flex-col overflow-hidden">
              <ControlTowerPanel />
            </aside>
          )}
        </div>

      </div>

      {/* Meeting bar — toujours en bas, meme position sur tous les onglets */}
      {meetingControls && meetingControls.meetingStatus !== "idle" && (
        <MeetingVideoStrip
          meetingStatus={meetingControls.meetingStatus}
          meetingTitle={activeMeeting?.title || ""}
          participants={meetingControls.participants}
          micEnabled={meetingControls.micEnabled}
          cameraEnabled={meetingControls.cameraEnabled}
          elapsedTime={meetingControls.elapsedTime}
          onToggleMic={meetingControls.toggleMic}
          onToggleCamera={meetingControls.toggleCamera}
          onEndMeeting={meetingControls.endMeeting}
        />
      )}

      {/* Bottom tab bar avec toggle sidebar */}
      <MobileTabBarV3
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sidebarVisible={sidebarVisible}
        onToggleSidebar={() => setSidebarVisible(v => !v)}
      />
    </div>
  );
}
