/**
 * WorkspaceHierarchie.tsx — Renderer hiérarchique drill-down V1
 *
 * Rend le drill-down Opérations (Opération > Processus > Routine > Étape)
 * avec le même pattern visuel que ChantierDrillDown.
 *
 * Source: OperationsDrillDown de SimAmorcer, re-exporté via sim-content-map.
 */

import type { RendererProps } from "../types";
import { OperationsDrillDown } from "../../simulation/sim-content-map";

export function WorkspaceHierarchie({ sectionConfig }: RendererProps) {
  return <OperationsDrillDown />;
}
