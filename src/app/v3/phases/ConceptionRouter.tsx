/**
 * ConceptionRouter.tsx — Router unifie pour la phase Conception
 *
 * Encapsule les 3 chemins de routing fragmentes en un seul point d'entree:
 * 1. activeDocumentKey → DocumentWorkspaceView (Blueprint Atelier)
 * 2. activeDeliverable → LiveDocForgeLivrable (Livrable genere)
 * 3. fallback → LivePhaseView (4 etapes auto-capture)
 */

import { DocumentWorkspaceView } from "./DocumentWorkspaceView";
import { LiveDocForgeLivrable } from "./LiveDocForgeLivrable";
import { LivePhaseView } from "./LivePhaseView";

interface ConceptionRouterProps {
  activeDocumentKey: string | null;
  activeDocumentSection: string | null;
  activeDeliverable: string | null;
  activeBotCode: string;
  reflexionContext: string | null;
  draftLibraryId: number | null; // C.81 — aligner avec AmorcerContext (number | null)
  onPhaseComplete: () => void;
  onDeliverableBack: () => void;
  onStartJumelage?: () => void;
}

export function ConceptionRouter({
  activeDocumentKey,
  activeDocumentSection,
  activeDeliverable,
  activeBotCode,
  reflexionContext,
  draftLibraryId,
  onPhaseComplete,
  onDeliverableBack,
  onStartJumelage,
}: ConceptionRouterProps) {
  if (activeDocumentKey) {
    return (
      <DocumentWorkspaceView
        documentKey={activeDocumentKey}
        botCode={activeBotCode}
        initialSectionId={activeDocumentSection || undefined}
        context={reflexionContext}
        onPhaseComplete={onPhaseComplete}
      />
    );
  }

  // Smart default: Tim CTO → code atelier, Paco CPO → wizard CPRJ
  const effectiveDeliverable = activeDeliverable
    || (activeBotCode === "CTOB" ? "code"
        : activeBotCode === "CPOB" ? "cprj"
        : null);

  if (effectiveDeliverable) {
    return (
      <LiveDocForgeLivrable
        deliverableType={effectiveDeliverable}
        context={reflexionContext}
        onBack={onDeliverableBack}
        onStartJumelage={onStartJumelage}
        draftLibraryId={draftLibraryId ?? undefined}
      />
    );
  }

  return (
    <LivePhaseView
      phaseKey="creation"
      context={reflexionContext}
      onPhaseComplete={onPhaseComplete}
    />
  );
}
