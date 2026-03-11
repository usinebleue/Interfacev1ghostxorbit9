/**
 * AppV2.tsx — Nouveau root component Frame Master V2
 * Sprint A — Frame Master V2
 */

import { ApiProvider } from "./context/ApiContext";
import { FrameMasterProvider, useFrameMaster } from "./context/FrameMasterContext";
import { ChatProvider } from "./context/ChatContext";
import { CanvasActionProvider } from "./context/CanvasActionContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { FrameMaster } from "./layout/FrameMaster";
import { LoginView } from "../components/LoginView";
import { WelcomeOnboardingView } from "./zones/center/WelcomeOnboardingView";
import { MeetingGuestPage } from "./zones/center/MeetingGuestPage";

function AppRouter() {
  const { isAuthenticated, isOnboarded, setAuthenticated, setOnboarded } =
    useFrameMaster();

  // Route bypass: /meeting/{slug} = page guest externe (pas d'auth)
  const path = window.location.pathname;
  const meetingMatch = path.match(/^\/meeting\/([a-z0-9]+)$/);
  if (meetingMatch) {
    return <MeetingGuestPage slug={meetingMatch[1]} />;
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setAuthenticated(true)} />;
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
        <FrameMasterProvider>
          <AppRouter />
        </FrameMasterProvider>
      </ApiProvider>
    </ErrorBoundary>
  );
}
