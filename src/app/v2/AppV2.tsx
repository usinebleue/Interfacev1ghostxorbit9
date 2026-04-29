/**
 * AppV2.tsx — Nouveau root component Frame Master V2
 * Sprint A — Frame Master V2
 * Sprint F4 — Multi-User MVP (AuthProvider)
 */

import { ApiProvider } from "./context/ApiContext";
import { FrameMasterProvider, useFrameMaster } from "./context/FrameMasterContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TenantProvider } from "./context/TenantContext";
import { ChatProvider } from "./context/ChatContext";
import { CanvasActionProvider } from "./context/CanvasActionContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { FrameMaster } from "./layout/FrameMaster";
import { LoginView } from "../components/LoginView";
import { WelcomeOnboardingView } from "./zones/center/WelcomeOnboardingView";
import { MeetingGuestPage } from "./zones/center/MeetingGuestPage";
import { SimulationFullPage } from "./zones/center/atelier/SimulationFullPage";
import { FrameMasterAmorcer } from "../v3/FrameMasterAmorcer";

function AppRouter() {
  const { isOnboarded, setAuthenticated, setOnboarded } = useFrameMaster();
  const auth = useAuth();

  const path = window.location.pathname;

  // Route bypass: /meeting/{slug} = page guest externe (pas d'auth)
  const meetingMatch = path.match(/^\/meeting\/([a-z0-9]+)$/);
  if (meetingMatch) {
    return <MeetingGuestPage slug={meetingMatch[1]} />;
  }

  // Route bypass: /simulation/{id} = full-page simulation (pas d'auth)
  const simMatch = path.match(/^\/simulation\/([a-z0-9-]+)$/);
  if (simMatch) {
    return <SimulationFullPage simulationId={simMatch[1]} />;
  }

  // Auth check EN PREMIER — avant tout routing V2/V3 (Fix R8)
  if (auth.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-gray-400 animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <LoginView
        onLogin={() => {
          setAuthenticated(true);
        }}
      />
    );
  }

  if (!isOnboarded) {
    return <WelcomeOnboardingView onComplete={() => setOnboarded(true)} />;
  }

  // /v2 → V2 classique
  if (path === "/v2") {
    return (
      <CanvasActionProvider>
        <ChatProvider>
          <FrameMaster />
        </ChatProvider>
      </CanvasActionProvider>
    );
  }

  // / (défaut) → V3 Frame Master Amorcer
  return (
    <CanvasActionProvider>
      <ChatProvider>
        <FrameMasterAmorcer />
      </ChatProvider>
    </CanvasActionProvider>
  );
}

export default function AppV2() {
  return (
    <ErrorBoundary>
      <ApiProvider>
        <AuthProvider>
          <TenantProvider>
            <FrameMasterProvider>
              <AppRouter />
            </FrameMasterProvider>
          </TenantProvider>
        </AuthProvider>
      </ApiProvider>
    </ErrorBoundary>
  );
}
