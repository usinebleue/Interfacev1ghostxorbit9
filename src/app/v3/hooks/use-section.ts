/**
 * use-section.ts — Hook pour naviguer entre sections
 *
 * Fournit: section active, helpers de navigation, GPS params backend.
 * Consommé par: WorkspacePhasesPanel, ControlTowerPanel
 */

import { useCallback, useMemo } from "react";
import { useAmorcer } from "../AmorcerContext";
import { getSection, getSectionGPS, getSectionsByGroup, type SectionDef, type SectionGroup } from "../core/section-registry";
import { SECTION_ICONS, BOT_DEPT_ICONS, DEFAULT_ICON } from "../core/icons";

/** Accès à la section active + helpers de navigation */
export function useSection() {
  const { rightSection, setRightSection, activeBotCode } = useAmorcer();

  /** Naviguer vers une section par ID */
  const navigate = useCallback((sectionId: string | null) => {
    setRightSection(sectionId);
  }, [setRightSection]);

  /** Retour au cockpit (section par défaut) */
  const goBack = useCallback(() => {
    setRightSection("cockpit");
  }, [setRightSection]);

  /** SectionDef de la section active (si elle existe dans le registre) */
  const activeSection: SectionDef | undefined = useMemo(() => {
    if (!rightSection) return undefined;
    return getSection(rightSection);
  }, [rightSection]);

  /** GPS params pour le backend */
  const gps = useMemo(() => {
    if (!rightSection) return { view: "cockpit" as const, sub: null };
    return getSectionGPS(rightSection) ?? { view: "cockpit" as const, sub: null };
  }, [rightSection]);

  /** Icône de la section active */
  const sectionIcon = useMemo(() => {
    if (rightSection && SECTION_ICONS[rightSection]) return SECTION_ICONS[rightSection];
    if (BOT_DEPT_ICONS[activeBotCode]) return BOT_DEPT_ICONS[activeBotCode];
    return DEFAULT_ICON;
  }, [rightSection, activeBotCode]);

  /** Lister les sections d'un groupe */
  const listGroup = useCallback((group: SectionGroup) => {
    return getSectionsByGroup(group);
  }, []);

  return {
    rightSection,
    activeSection,
    navigate,
    goBack,
    gps,
    sectionIcon,
    listGroup,
  };
}
