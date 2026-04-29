/**
 * Orbit9View.tsx — Shell Orbit9 V3 (routing tabs internes)
 *
 * Pattern: COPIE de BlueprintView.tsx (shell avec tabs internes)
 * Le LivingHero est dans Orbit9Dashboard (conditionnel à la vue d'ensemble)
 *
 * Utilisé par: WorkspacePhasesPanel (quand isOrbit9 = true)
 */

import { useAmorcer } from "../../AmorcerContext";

import { Orbit9Dashboard } from "./Orbit9Dashboard";
import { Orbit9Blueprint } from "./Orbit9Blueprint";
import { Orbit9Opportunites } from "./Orbit9Opportunites";

export function Orbit9View() {
  const { o9Section } = useAmorcer();

  return (
    <>
      {o9Section === "dashboard" && <Orbit9Dashboard />}
      {o9Section === "blueprint" && <Orbit9Blueprint />}
      {o9Section === "opportunites" && <Orbit9Opportunites />}
    </>
  );
}

