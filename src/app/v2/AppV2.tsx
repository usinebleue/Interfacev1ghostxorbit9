/**
 * AppV2.tsx — Nouveau root component Frame Master V2
 * Sprint A — Frame Master V2
 */

import { ApiProvider } from "./context/ApiContext";
import { FrameMasterProvider, useFrameMaster } from "./context/FrameMasterContext";
import { ChatProvider } from "./context/ChatContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { FrameMaster } from "./layout/FrameMaster";
import { LoginView } from "../components/LoginView";
import { WelcomeOnboardingView } from "./zones/center/WelcomeOnboardingView";

function AppRouter() {
  const { isAuthenticated, isOnboarded, setAuthenticated, setOnboarded } =
    useFrameMaster();

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setAuthenticated(true)} />;
  }

  if (!isOnboarded) {
    return <WelcomeOnboardingView onComplete={() => setOnboarded(true)} />;
  }

  return (
    <ChatProvider>
      <FrameMaster />
    </ChatProvider>
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
