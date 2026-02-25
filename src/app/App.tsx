import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CanvasPanel } from './components/CanvasPanel';
import { CockpitView } from './components/CockpitView';
import { DepartmentView } from './components/DepartmentView';
import { ProjectNotebook } from './components/ProjectNotebook';
import { HealthDashboard } from './components/HealthDashboard';
import { AITeamView } from './components/AITeamView';
import { DocumentsView } from './components/DocumentsView';
import { CircleView } from './components/CircleView';
import { MatchingView } from './components/MatchingView';
import { CoCreationView } from './components/CoCreationView';
import { TimeTokensView } from './components/TimeTokensView';
import { PioneersView } from './components/PioneersView';
import { FranchiseView } from './components/FranchiseView';
import { GovernanceView } from './components/GovernanceView';
import { LoginView } from './components/LoginView';
import { OnboardingView } from './components/OnboardingView';
import { RoadmapView } from './components/RoadmapView';

type ViewType = 'login' | 'onboarding' | 'cockpit' | 'chat' | 'department' | 'notebook' | 'health' | 'ai-team' | 'documents' | 'circle' | 'matching' | 'cocreation' | 'tokens' | 'pioneers' | 'franchise' | 'governance' | 'roadmap';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('cockpit'); // Changé de 'login' à 'cockpit'
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Changé de false à true
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true); // Changé de false à true

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView('onboarding');
  };

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    setCurrentView('cockpit');
  };

  // Si pas authentifié, afficher la page de login
  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} onSignup={() => console.log('Signup')} />;
  }

  // Si authentifié mais pas complété l'onboarding
  if (isAuthenticated && !hasCompletedOnboarding) {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Barre supérieure */}
      <TopBar />
      
      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar de navigation */}
        <Sidebar 
          onNavigate={(view) => setCurrentView(view as ViewType)}
          onDepartmentClick={() => setCurrentView('department')}
          onProjectClick={() => setCurrentView('notebook')}
          onHealthClick={() => setCurrentView('health')}
          onAITeamClick={() => setCurrentView('ai-team')}
          onDocumentsClick={() => setCurrentView('documents')}
          onCircleClick={() => setCurrentView('circle')}
          onMatchingClick={() => setCurrentView('matching')}
          onCoCreationClick={() => setCurrentView('cocreation')}
          onTokensClick={() => setCurrentView('tokens')}
          onPioneersClick={() => setCurrentView('pioneers')}
          onFranchiseClick={() => setCurrentView('franchise')}
          onGovernanceClick={() => setCurrentView('governance')}
          onRoadmapClick={() => setCurrentView('roadmap')}
        />
        
        {/* Zone centrale - Dynamique selon la vue */}
        {currentView === 'cockpit' && <CockpitView />}
        {currentView === 'chat' && (
          <>
            <ChatArea />
            <CanvasPanel />
          </>
        )}
        {currentView === 'department' && (
          <DepartmentView onBack={() => setCurrentView('cockpit')} />
        )}
        {currentView === 'notebook' && (
          <ProjectNotebook onBack={() => setCurrentView('cockpit')} />
        )}
        {currentView === 'health' && (
          <HealthDashboard onBack={() => setCurrentView('cockpit')} />
        )}
        {currentView === 'ai-team' && (
          <AITeamView onBack={() => setCurrentView('cockpit')} />
        )}
        {currentView === 'documents' && (
          <DocumentsView onBack={() => setCurrentView('cockpit')} />
        )}
        {currentView === 'circle' && (
          <CircleView onBack={() => setCurrentView('cockpit')} />
        )}
        {currentView === 'matching' && (
          <MatchingView onBack={() => setCurrentView('cockpit')} />
        )}
        {currentView === 'cocreation' && (
          <CoCreationView onBack={() => setCurrentView('cockpit')} />
        )}
        {currentView === 'tokens' && (
          <TimeTokensView onBack={() => setCurrentView('cockpit')} />
        )}
        {currentView === 'pioneers' && (
          <PioneersView onBack={() => setCurrentView('cockpit')} />
        )}
        {currentView === 'franchise' && (
          <FranchiseView onBack={() => setCurrentView('cockpit')} />
        )}
        {currentView === 'governance' && (
          <GovernanceView onBack={() => setCurrentView('cockpit')} />
        )}
        {currentView === 'roadmap' && (
          <RoadmapView onBack={() => setCurrentView('cockpit')} />
        )}
      </div>
    </div>
  );
}