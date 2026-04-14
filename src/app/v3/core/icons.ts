/**
 * icons.ts — Catalogue centralisé d'icônes V3 Frame Amorcer
 *
 * CHANGER UNE ICÔNE ICI = changée PARTOUT dans le frame V3.
 * Sources: BlueprintDepartement (DEPT_DASH_ICON), WorkspacePhasesPanel (SECTION_ICON)
 */

import {
  Crown,
  DollarSign,
  Cpu,
  Factory,
  Settings,
  TrendingUp,
  Megaphone,
  Compass,
  Users,
  ShieldCheck,
  Scale,
  Lightbulb,
  Gauge,
  Flame,
  Layers,
  Database,
  BookOpen,
  Video,
  Atom,
  Home,
} from "lucide-react";

// ═══ Icônes par département/bot (source: BlueprintDepartement L5797-5801) ═══
export const BOT_DEPT_ICONS: Record<string, React.ElementType> = {
  CEOB: Crown,
  CFOB: DollarSign,
  CTOB: Cpu,
  CPOB: Factory,
  COOB: Settings,
  CROB: TrendingUp,
  CMOB: Megaphone,
  CSOB: Compass,
  CHROB: Users,
  CISOB: ShieldCheck,
  CLOB: Scale,
  CINOB: Lightbulb,
};

// ═══ Icônes par section du workspace (source: WorkspacePhasesPanel L110) ═══
export const SECTION_ICONS: Record<string, React.ElementType> = {
  cockpit: Gauge,
  chantiers: Flame,
  blueprint: Layers,
  dataroom: Database,
  playbooks: BookOpen,
  conferenceai: Video,
  orbit9: Atom,
  home: Home,
};

// ═══ Fallback ═══
export const DEFAULT_ICON = Home;
