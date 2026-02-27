import {
  Home,
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  Settings,
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
  TrendingUp,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { useState } from 'react';

type ItemStatus = 'live' | 'demo' | 'soon';

interface NavItem {
  label: string;
  id: string;
  icon?: React.ElementType;
  status: ItemStatus;
  emoji?: string;
  avatar?: string;
  badge?: string;
}

interface NavSection {
  title: string;
  key: string;
  items: NavItem[];
}

interface SidebarProps {
  onNavigate?: (view: 'cockpit' | 'chat') => void;
  onDepartmentSelect?: (id: string) => void;
  onCircleClick?: () => void;
  onMatchingClick?: () => void;
  onCoCreationClick?: () => void;
  onTokensClick?: () => void;
  onPioneersClick?: () => void;
  onFranchiseClick?: () => void;
  onGovernanceClick?: () => void;
  hideFooter?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  activeDepartment?: string;
}

const navSections: NavSection[] = [
  {
    title: 'DÉPARTEMENTS',
    key: 'departments',
    items: [
      { label: 'CarlOS — CEO', id: 'direction', avatar: '/agents/ceo-carlos.png', badge: 'CEO', status: 'live' },
      { label: 'Musk — CTO', id: 'tech', avatar: '/agents/cto-thomas.png', badge: 'CTO', status: 'demo' },
      { label: 'Buffett — CFO', id: 'finance', avatar: '/agents/cfo-francois.png', badge: 'CFO', status: 'demo' },
      { label: 'Disney — CMO', id: 'marketing', avatar: '/agents/cmo-sofia.png', badge: 'CMO', status: 'soon' },
      { label: 'Sun Tzu — CSO', id: 'strategy', avatar: '/agents/cso-marc.png', badge: 'CSO', status: 'soon' },
      { label: 'M. Aurèle — COO', id: 'operations', avatar: '/agents/coo-lise.png', badge: 'COO', status: 'soon' },
    ],
  },
  {
    title: 'ORBIT9',
    key: 'orbit9',
    items: [
      { label: 'Mon Cercle', id: 'circle', icon: Users, status: 'soon' },
      { label: 'Matching', id: 'matching', icon: Heart, status: 'soon' },
      { label: 'Co-Créations', id: 'cocreations', icon: Briefcase, status: 'soon' },
      { label: 'TimeTokens', id: 'tokens', icon: BarChart3, status: 'soon' },
      { label: 'Pionniers', id: 'pioneers', icon: Shield, status: 'live', emoji: '👑' },
      { label: 'Franchise 5.0', id: 'franchise', icon: Globe, status: 'live' },
      { label: 'Gouvernance', id: 'governance', icon: Shield, status: 'live' },
    ],
  },
];

const departmentIds = ['direction', 'tech', 'finance', 'marketing', 'strategy', 'operations'];

const getStatusIndicator = (status: ItemStatus) => {
  switch (status) {
    case 'live':
      return <div className="h-2 w-2 rounded-full bg-green-500" />;
    case 'demo':
      return <div className="h-2 w-2 rounded-full bg-orange-400" />;
    case 'soon':
      return <Lock className="h-4 w-4 text-gray-400" />;
  }
};

export function Sidebar({ onNavigate, onDepartmentSelect, onCircleClick, onMatchingClick, onCoCreationClick, onTokensClick, onPioneersClick, onFranchiseClick, onGovernanceClick, hideFooter, collapsed: controlledCollapsed, onToggleCollapse, activeDepartment }: SidebarProps) {
  const [activeItem, setActiveItem] = useState(activeDepartment || 'direction');
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const toggleCollapse = onToggleCollapse ?? (() => setInternalCollapsed(!internalCollapsed));
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleItemClick = (item: NavItem, sectionTitle: string) => {
    setActiveItem(item.id);
    // Départements → vue bot
    if (departmentIds.includes(item.id) && onDepartmentSelect) {
      onDepartmentSelect(item.id);
    }
    // Orbit9
    if (item.id === 'circle' && onCircleClick) onCircleClick();
    if (item.id === 'matching' && onMatchingClick) onMatchingClick();
    if (item.id === 'cocreations' && onCoCreationClick) onCoCreationClick();
    if (item.id === 'tokens' && onTokensClick) onTokensClick();
    if (item.id === 'pioneers' && onPioneersClick) onPioneersClick();
    if (item.id === 'franchise' && onFranchiseClick) onFranchiseClick();
    if (item.id === 'governance' && onGovernanceClick) onGovernanceClick();
  };

  const renderItem = (item: NavItem, sectionTitle: string) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;

    if (collapsed) {
      return (
        <button
          key={item.id}
          onClick={() => handleItemClick(item, sectionTitle)}
          title={item.label}
          className={cn(
            "w-full h-9 flex items-center justify-center rounded transition-colors",
            isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
          )}
        >
          {item.avatar ? (
            <img src={item.avatar} alt={item.label} className={cn("w-6 h-6 rounded-full object-cover", isActive ? "ring-2 ring-blue-500" : "ring-1 ring-gray-300")} />
          ) : Icon ? (
            <Icon className="h-4 w-4" />
          ) : (
            <span className="text-sm">{item.emoji}</span>
          )}
        </button>
      );
    }

    return (
      <Button
        key={item.id}
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 h-8 px-2 text-sm",
          isActive && "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
        )}
        onClick={() => handleItemClick(item, sectionTitle)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {item.avatar ? (
            <img src={item.avatar} alt={item.label} className={cn("w-5 h-5 rounded-full object-cover flex-shrink-0", isActive ? "ring-2 ring-blue-500" : "ring-1 ring-gray-300")} />
          ) : item.emoji ? (
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
  };

  return (
    <div className="bg-white flex flex-col h-full">
      {/* En-tête FIXE — Logo + toggle */}
      <div className="h-12 px-3 border-b flex items-center flex-shrink-0">
        {collapsed ? (
          <button
            onClick={toggleCollapse}
            className="w-full h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Agrandir le menu"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">UB</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight">Usine Bleue</p>
                <p className="text-xs text-gray-400">app.usinebleue.ai</p>
              </div>
            </div>
            <button
              onClick={toggleCollapse}
              className="h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
              title="Réduire le menu"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation — SCROLLABLE */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn("py-2 space-y-0.5", collapsed ? "px-1" : "px-2")}>
          {navSections.map((section) => {
            const isOpen = !collapsedSections[section.key];
            return (
              <div key={section.key}>
                {!collapsed ? (
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                    {section.title}
                  </button>
                ) : (
                  <div className="h-px bg-gray-100 my-1" />
                )}
                {(isOpen || collapsed) && (
                  <div className="space-y-0.5">
                    {section.items.map((item) => renderItem(item, section.title))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {!hideFooter && (
        <div className="border-t p-2 space-y-0.5 flex-shrink-0">
          <Button variant="ghost" className="w-full justify-start gap-2 h-8 px-2 text-sm">
            <HelpCircle className="h-4 w-4" />
            {!collapsed && <span>Aide</span>}
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 h-8 px-2 text-sm">
            <Bot className="h-4 w-4" />
            {!collapsed && <span>Carl 24/7</span>}
            <div className="ml-auto h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </Button>
        </div>
      )}
    </div>
  );
}
