/**
 * AppV2.tsx — Nouveau root component Frame Master V2
 * Sprint A — Frame Master V2
 * Sprint F4 — Multi-User MVP (AuthProvider)
 */

import { ApiProvider } from "./context/ApiContext";
import { FrameMasterProvider, useFrameMaster } from "./context/FrameMasterContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { CanvasActionProvider } from "./context/CanvasActionContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { FrameMaster } from "./layout/FrameMaster";
import { LoginView } from "../components/LoginView";
import { WelcomeOnboardingView } from "./zones/center/WelcomeOnboardingView";
import { MeetingGuestPage } from "./zones/center/MeetingGuestPage";

function AppRouter() {
  const { isOnboarded, setAuthenticated, setOnboarded } = useFrameMaster();
  const auth = useAuth();

  // Route bypass: /meeting/{slug} = page guest externe (pas d'auth)
  const path = window.location.pathname;
  const meetingMatch = path.match(/^\/meeting\/([a-z0-9]+)$/);
  if (meetingMatch) {
    return <MeetingGuestPage slug={meetingMatch[1]} />;
  }

  // Loading spinner while checking JWT on mount
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
          // Sync FrameMaster state with AuthContext
          setAuthenticated(true);
        }}
      />
    );
  }

  if (!isOnboarded) {
    return <WelcomeOnboardingView onComplete={() => setOnboarded(true)} />;
  }

  return (
    <CanvasActionProvider>
      <ChatProvider>
        <FrameMaster />
      </ChatProvider>
    </CanvasActionProvider>
  );
}

export default function AppV2() {
  return (
    <ErrorBoundary>
      <ApiProvider>
        <AuthProvider>
          <FrameMasterProvider>
            <AppRouter />
          </FrameMasterProvider>
        </AuthProvider>
      </ApiProvider>
    </ErrorBoundary>
  );
}
