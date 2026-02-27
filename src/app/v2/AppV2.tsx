/**
 * AppV2.tsx — Nouveau root component Frame Master V2
 * Sprint A — Frame Master V2
 */

import { ApiProvider } from "./context/ApiContext";
import { FrameMasterProvider, useFrameMaster } from "./context/FrameMasterContext";
import { ChatProvider } from "./context/ChatContext";
import { FrameMaster } from "./layout/FrameMaster";
import { LoginView } from "../components/LoginView";
import { OnboardingView } from "../components/OnboardingView";

function AppRouter() {
  const { isAuthenticated, isOnboarded, setAuthenticated, setOnboarded } =
    useFrameMaster();

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setAuthenticated(true)} />;
  }

  if (!isOnboarded) {
    return <OnboardingView onComplete={() => setOnboarded(true)} />;
  }

  return (
    <ChatProvider>
      <FrameMaster />
    </ChatProvider>
  );
}

export default function AppV2() {
  return (
    <ApiProvider>
      <FrameMasterProvider>
        <AppRouter />
      </FrameMasterProvider>
    </ApiProvider>
  );
}
