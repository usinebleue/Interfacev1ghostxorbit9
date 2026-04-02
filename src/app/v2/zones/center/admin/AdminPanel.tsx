/**
 * AdminPanel.tsx — Administration a 2 niveaux (11 tabs consolides)
 * mode="god"     → 11 tabs, cross-tenant (accessible via /admin)
 * mode="instance" → 9 tabs, scope tenant (accessible via /reglages)
 * Pattern: SectionFrame (meme structure que DepartmentTourDeControle)
 */

import { useMemo } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Rocket,
  ScrollText,
  Store,
  Settings,
  Brain,
  Phone,
  HelpCircle,
  Shield,
  Server,
  Eye,
} from "lucide-react";
import { SectionFrame } from "../shared/SectionFrame";
import { useFrameMaster } from "../../../context/FrameMasterContext";
import { useAuth } from "../../../context/AuthContext";
import { useTenant } from "../../../context/TenantContext";
import type { TabDef } from "../shared/section-types";

// Tab components (11 tabs consolides — restructures S73)
import { TabDashboard } from "./TabDashboard";
import { TabInstances } from "./TabInstances";
import { TabUsers } from "./TabUsers";
import { TabPackages } from "./TabPackages";
import { TabOutils } from "./TabOutils";
import { TabMonitoring } from "./TabMonitoring";
import { TabReseau } from "./TabReseau";
import { TabParametres } from "./TabParametres";
import { TabTraining } from "./TabTraining";
import { TabTelephonie } from "./TabTelephonie";
import { TabAide } from "./TabAide";
import { TabBibleTechnique } from "./TabBibleTechnique";
import { SimulationSprint1 } from "./SimulationSprint1";
// SimulationVideoS74 moved to ScenarioHub as immersive experience

// ═══════════════════════════════════════
// Tab definitions avec gating
// ═══════════════════════════════════════

interface AdminTabDef extends TabDef {
  godOnly?: boolean;
}

const ALL_ADMIN_TABS: AdminTabDef[] = [
  { id: "dashboard",   label: "Tableau de bord", icon: LayoutDashboard },
  { id: "instances",   label: "Instances",        icon: Building2,    godOnly: true },
  { id: "users",       label: "Utilisateurs",     icon: Users },
  { id: "packages",    label: "Packages & Offres", icon: CreditCard },
  { id: "outils",      label: "Outils",           icon: Rocket },
  { id: "monitoring",  label: "Monitoring",        icon: ScrollText },
  { id: "reseau",      label: "Réseau",           icon: Store },
  { id: "parametres",  label: "Paramètres",       icon: Settings },
  { id: "training",    label: "Trial-Brain",      icon: Brain,       godOnly: true },
  { id: "telephonie",  label: "Téléphonie",       icon: Phone },
  { id: "aide",        label: "Aide",             icon: HelpCircle },
  { id: "bible-technique", label: "Bible Technique", icon: Server, godOnly: true },
  { id: "simulation", label: "Simulation Sprint", icon: Eye, godOnly: true },
];

// ═══════════════════════════════════════
// AdminPanel — Composant principal
// ═══════════════════════════════════════

interface AdminPanelProps {
  mode?: "god" | "instance";
}

export function AdminPanel({ mode: modeProp }: AdminPanelProps) {
  const { activeAdminTab, navigateAdminTab } = useFrameMaster();
  const { membership } = useAuth();
  const { isDieu } = useTenant();

  const mode = modeProp || (isDieu ? "god" : "instance");
  const tenantId = membership?.tenant_id;
  const tab = activeAdminTab || "dashboard";

  const visibleTabs = useMemo(() => {
    return ALL_ADMIN_TABS.filter(t => {
      if (t.godOnly && mode !== "god") return false;
      return true;
    }) as TabDef[];
  }, [mode]);

  const tabProps = { mode, tenantId };

  return (
    <SectionFrame
      title={mode === "god" ? "Administration" : "Réglages"}
      subtitle={mode === "god" ? "God Mode" : "Mon Instance"}
      icon={Shield}
      iconColor="text-blue-600"
      tabs={visibleTabs}
      activeTab={tab}
      onTabChange={navigateAdminTab}
      maxWidth="5xl"
    >
      {tab === "dashboard"   && <TabDashboard {...tabProps} onNav={navigateAdminTab} />}
      {tab === "instances"   && <TabInstances {...tabProps} />}
      {tab === "users"       && <TabUsers {...tabProps} />}
      {tab === "packages"    && <TabPackages {...tabProps} />}
      {tab === "outils"      && <TabOutils {...tabProps} />}
      {tab === "monitoring"  && <TabMonitoring {...tabProps} />}
      {tab === "reseau"      && <TabReseau {...tabProps} />}
      {tab === "parametres"  && <TabParametres {...tabProps} />}
      {tab === "training"    && <TabTraining {...tabProps} />}
      {tab === "telephonie"  && <TabTelephonie {...tabProps} />}
      {tab === "aide"        && <TabAide {...tabProps} onNav={navigateAdminTab} />}
      {tab === "bible-technique" && <TabBibleTechnique {...tabProps} />}
      {tab === "simulation" && <SimulationSprint1 />}
    </SectionFrame>
  );
}
