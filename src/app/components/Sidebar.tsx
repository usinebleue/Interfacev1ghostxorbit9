import { 
  Home,
  MessageSquare, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  Calendar,
  Briefcase,
  Heart,
  HelpCircle,
  Lock,
  Globe,
  UserCircle,
  Bot,
  Folder,
  Activity,
  Shield,
  TrendingUp
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { cn } from './ui/utils';
import { useState } from 'react';

type ItemStatus = 'live' | 'demo' | 'soon';

interface NavItem {
  label: string;
  id: string;
  icon?: React.ElementType;
  status: ItemStatus;
  emoji?: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  onNavigate?: (view: 'cockpit' | 'chat') => void;
  onDepartmentClick?: () => void;
  onProjectClick?: () => void;
  onHealthClick?: () => void;
  onAITeamClick?: () => void;
  onDocumentsClick?: () => void;
  onCircleClick?: () => void;
  onMatchingClick?: () => void;
  onCoCreationClick?: () => void;
  onTokensClick?: () => void;
  onPioneersClick?: () => void;
  onFranchiseClick?: () => void;
  onGovernanceClick?: () => void;
  onRoadmapClick?: () => void;
}

const navSections: NavSection[] = [
  {
    title: 'COCKPIT',
    items: [
      { label: 'Tableau de bord', id: 'cockpit', icon: Home, status: 'live' },
    ],
  },
  {
    title: 'DÉPARTEMENTS',
    items: [
      { label: 'Direction', id: 'direction', emoji: '🔵', badge: 'CEO', status: 'live' },
      { label: 'Technologie', id: 'tech', emoji: '🟣', badge: 'CTO', status: 'demo' },
      { label: 'Finance', id: 'finance', emoji: '🟢', badge: 'CFO', status: 'demo' },
      { label: 'Marketing', id: 'marketing', emoji: '🩷', badge: 'CMO', status: 'soon' },
      { label: 'Stratégie', id: 'strategy', emoji: '🔴', badge: 'CSO', status: 'soon' },
      { label: 'Opérations', id: 'operations', emoji: '🟠', badge: 'COO', status: 'soon' },
    ],
  },
  {
    title: 'MON ESPACE',
    items: [
      { label: 'Mes Projets / Cahiers', id: 'projects', icon: Folder, status: 'live' },
      { label: 'Mes Documents', id: 'documents', icon: FileText, status: 'live' },
      { label: 'Mon Bilan de Santé', id: 'health', icon: Activity, status: 'demo' },
      { label: 'Chat CarlOS', id: 'chat', icon: MessageSquare, status: 'live', emoji: '💬' },
    ],
  },
  {
    title: 'ORBIT9',
    items: [
      { label: 'Mon Cercle', id: 'circle', icon: Users, status: 'soon' },
      { label: 'Matching', id: 'matching', icon: Heart, status: 'soon' },
      { label: 'Co-Créations', id: 'cocreations', icon: Briefcase, status: 'soon' },
      { label: 'TimeTokens', id: 'tokens', icon: BarChart3, status: 'soon' },
      { label: '🏆 Pionniers', id: 'pioneers', status: 'live', emoji: '👑' },
      { label: 'Franchise 5.0', id: 'franchise', icon: Globe, status: 'live' },
      { label: 'Gouvernance', id: 'governance', icon: Shield, status: 'live' },
    ],
  },
  {
    title: 'PARAMÈTRES',
    items: [
      { label: 'Mon Profil', id: 'profile', icon: UserCircle, status: 'live' },
      { label: 'Mon Équipe AI', id: 'ai-team', icon: Bot, status: 'demo' },
      { label: 'Mon Compte', id: 'account', icon: Settings, status: 'live' },
      { label: '🗺️ Roadmap', id: 'roadmap', icon: TrendingUp, status: 'live' },
    ],
  },
];

const getStatusIndicator = (status: ItemStatus) => {
  switch (status) {
    case 'live':
      return <div className="h-2 w-2 rounded-full bg-green-500" />;
    case 'demo':
      return <div className="h-2 w-2 rounded-full bg-orange-400" />;
    case 'soon':
      return <Lock className="h-3 w-3 text-gray-400" />;
  }
};

export function Sidebar({ onNavigate, onDepartmentClick, onProjectClick, onHealthClick, onAITeamClick, onDocumentsClick, onCircleClick, onMatchingClick, onCoCreationClick, onTokensClick, onPioneersClick, onFranchiseClick, onGovernanceClick, onRoadmapClick }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('cockpit');

  return (
    <div className="w-64 border-r bg-white h-full flex flex-col">
      {/* En-tête */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">UB</span>
          </div>
          <div>
            <p className="font-semibold text-sm">Usine Bleue</p>
            <p className="text-xs text-gray-500">app.usinebleue.ai</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-6">
          {navSections.map((section, sectionIdx) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;
                  const isDisabled = item.status === 'soon';
                  
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-2 h-9 px-2 text-sm",
                        isActive && "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700",
                        isDisabled && "opacity-60 cursor-not-allowed"
                      )}
                      onClick={() => {
                        if (!isDisabled) {
                          setActiveItem(item.id);
                          if (onNavigate) {
                            if (item.id === 'cockpit') {
                              onNavigate('cockpit');
                            } else if (item.id === 'chat') {
                              onNavigate('chat');
                            }
                          }
                          // Si c'est un département, ouvrir la vue département
                          if (section.title === 'DÉPARTEMENTS' && onDepartmentClick) {
                            onDepartmentClick();
                          }
                          // Si c'est Mes Projets, ouvrir le cahier
                          if (item.id === 'projects' && onProjectClick) {
                            onProjectClick();
                          }
                          // Si c'est Mon Bilan de Santé, ouvrir le bilan
                          if (item.id === 'health' && onHealthClick) {
                            onHealthClick();
                          }
                          // Si c'est Mon Équipe AI, ouvrir l'équipe
                          if (item.id === 'ai-team' && onAITeamClick) {
                            onAITeamClick();
                          }
                          // Si c'est Mes Documents, ouvrir les documents
                          if (item.id === 'documents' && onDocumentsClick) {
                            onDocumentsClick();
                          }
                          // Si c'est Mon Cercle, ouvrir le cercle
                          if (item.id === 'circle' && onCircleClick) {
                            onCircleClick();
                          }
                          // Si c'est Matching, ouvrir le matching
                          if (item.id === 'matching' && onMatchingClick) {
                            onMatchingClick();
                          }
                          // Si c'est Co-Créations, ouvrir les co-créations
                          if (item.id === 'cocreations' && onCoCreationClick) {
                            onCoCreationClick();
                          }
                          // Si c'est TimeTokens, ouvrir les tokens
                          if (item.id === 'tokens' && onTokensClick) {
                            onTokensClick();
                          }
                          // Si c'est Pionniers, ouvrir la vue pionniers
                          if (item.id === 'pioneers' && onPioneersClick) {
                            onPioneersClick();
                          }
                          // Si c'est Franchise, ouvrir la vue franchise
                          if (item.id === 'franchise' && onFranchiseClick) {
                            onFranchiseClick();
                          }
                          // Si c'est Gouvernance, ouvrir la vue gouvernance
                          if (item.id === 'governance' && onGovernanceClick) {
                            onGovernanceClick();
                          }
                          // Si c'est Roadmap, ouvrir la vue roadmap
                          if (item.id === 'roadmap' && onRoadmapClick) {
                            onRoadmapClick();
                          }
                        }
                      }}
                      disabled={isDisabled}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {item.emoji ? (
                          <span className="text-base flex-shrink-0">{item.emoji}</span>
                        ) : Icon ? (
                          <Icon className="h-4 w-4 flex-shrink-0" />
                        ) : null}
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                            {item.badge}
                          </Badge>
                        )}
                        {getStatusIndicator(item.status)}
                      </div>
                    </Button>
                  );
                })}
              </div>
              {sectionIdx < navSections.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-3 space-y-1">
        <Button variant="ghost" className="w-full justify-start gap-2 h-9 px-2">
          <HelpCircle className="h-4 w-4" />
          <span className="text-sm">Aide</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 h-9 px-2">
          <Bot className="h-4 w-4" />
          <span className="text-sm">Carl 24/7</span>
          <div className="ml-auto h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </Button>
      </div>
    </div>
  );
}