import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CanvasPanel } from './components/CanvasPanel';
import { DepartmentView } from './components/DepartmentView';
import { CircleView } from './components/CircleView';
import { MatchingView } from './components/MatchingView';
import { CoCreationView } from './components/CoCreationView';
import { TimeTokensView } from './components/TimeTokensView';
import { PioneersView } from './components/PioneersView';
import { FranchiseView } from './components/FranchiseView';
import { GovernanceView } from './components/GovernanceView';
import { LoginView } from './components/LoginView';
import { OnboardingView } from './components/OnboardingView';
import { InfoPanel } from './components/InfoPanel';
import { BottomBar } from './components/BottomBar';

type ViewType = 'login' | 'onboarding' | 'department' | 'chat' | 'circle' | 'matching' | 'cocreation' | 'tokens' | 'pioneers' | 'franchise' | 'governance';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('department');
  const [selectedDepartment, setSelectedDepartment] = useState('direction');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView('onboarding');
  };

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    setCurrentView('department');
    setSelectedDepartment('direction');
  };

  const handleDepartmentSelect = (id: string) => {
    setSelectedDepartment(id);
    setCurrentView('department');
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} onSignup={() => console.log('Signup')} />;
  }

  if (isAuthenticated && !hasCompletedOnboarding) {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  const isChatView = currentView === 'chat';

  if (isChatView) {
    return (
      <div className="h-screen flex bg-white">
        <Sidebar
          onDepartmentSelect={handleDepartmentSelect}
          onCircleClick={() => setCurrentView('circle')}
          onMatchingClick={() => setCurrentView('matching')}
          onCoCreationClick={() => setCurrentView('cocreation')}
          onTokensClick={() => setCurrentView('tokens')}
          onPioneersClick={() => setCurrentView('pioneers')}
          onFranchiseClick={() => setCurrentView('franchise')}
          onGovernanceClick={() => setCurrentView('governance')}
          activeDepartment={selectedDepartment}
        />
        <ChatArea />
        <CanvasPanel />
      </div>
    );
  }

  const sidebarProps = {
    onDepartmentSelect: handleDepartmentSelect,
    onCircleClick: () => setCurrentView('circle'),
    onMatchingClick: () => setCurrentView('matching'),
    onCoCreationClick: () => setCurrentView('cocreation'),
    onTokensClick: () => setCurrentView('tokens'),
    onPioneersClick: () => setCurrentView('pioneers'),
    onFranchiseClick: () => setCurrentView('franchise'),
    onGovernanceClick: () => setCurrentView('governance'),
    hideFooter: true,
    collapsed: sidebarCollapsed,
    onToggleCollapse: () => setSidebarCollapsed(!sidebarCollapsed),
    activeDepartment: selectedDepartment,
  };

  const goHome = () => {
    setCurrentView('department');
    setSelectedDepartment('direction');
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Zone principale — 3 colonnes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar gauche */}
        <div className={`${sidebarCollapsed ? 'w-14' : 'w-56'} border-r bg-white flex-shrink-0 overflow-y-auto transition-all duration-200`}>
          <Sidebar {...sidebarProps} />
        </div>

        {/* Centre */}
        <div className="flex-1 overflow-y-auto">
          {currentView === 'department' && (
            <DepartmentView departmentId={selectedDepartment} />
          )}
          {currentView === 'circle' && <CircleView onBack={goHome} />}
          {currentView === 'matching' && <MatchingView onBack={goHome} />}
          {currentView === 'cocreation' && <CoCreationView onBack={goHome} />}
          {currentView === 'tokens' && <TimeTokensView onBack={goHome} />}
          {currentView === 'pioneers' && <PioneersView onBack={goHome} />}
          {currentView === 'franchise' && <FranchiseView onBack={goHome} />}
          {currentView === 'governance' && <GovernanceView onBack={goHome} />}
        </div>

        {/* Info panel droit */}
        <div className="w-72 border-l bg-white flex-shrink-0 overflow-y-auto">
          <InfoPanel />
        </div>
      </div>

      {/* BANDE FIXE DU BAS */}
      <BottomBar sidebarCollapsed={sidebarCollapsed} />
    </div>
  );
}
