import { Folder, FileText, MessageSquare } from 'lucide-react';
import { GlobalChatBar } from './GlobalChatBar';

const activeBots = [
  { id: 'ceo', name: 'CarlOS', role: 'CEO', avatar: '/agents/ceo-carlos.png', status: 'active' as const, task: 'Supervision' },
  { id: 'cto', name: 'Musk', role: 'CTO', avatar: '/agents/cto-thomas.png', status: 'working' as const, task: 'Audit techno' },
  { id: 'cfo', name: 'Buffett', role: 'CFO', avatar: '/agents/cfo-francois.png', status: 'working' as const, task: 'Budget Q2' },
  { id: 'cmo', name: 'Disney', role: 'CMO', avatar: '/agents/cmo-sofia.png', status: 'idle' as const, task: '' },
  { id: 'cso', name: 'Sun Tzu', role: 'CSO', avatar: '/agents/cso-marc.png', status: 'working' as const, task: 'Pipeline' },
  { id: 'coo', name: 'M. Aurèle', role: 'COO', avatar: '/agents/coo-lise.png', status: 'idle' as const, task: '' },
];

const getStatusDot = (status: 'active' | 'working' | 'idle') => {
  switch (status) {
    case 'active': return 'bg-blue-500';
    case 'working': return 'bg-green-500';
    case 'idle': return 'bg-gray-400';
  }
};

const workspaceLinks = [
  { id: 'projects', label: 'Projets / Cahiers', icon: Folder },
  { id: 'documents', label: 'Mes Documents', icon: FileText },
  { id: 'discussions', label: 'Mes Discussions', icon: MessageSquare },
];

interface BottomBarProps {
  sidebarCollapsed?: boolean;
}

export function BottomBar({ sidebarCollapsed }: BottomBarProps) {
  return (
    <div className="flex border-t bg-white flex-shrink-0">
      {/* GAUCHE — Mon Espace (raccourcis travail) */}
      <div className={`${sidebarCollapsed ? 'w-14' : 'w-56'} border-r flex-shrink-0 transition-all duration-200`}>
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-0.5 py-1.5">
            {workspaceLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  title={link.label}
                  className="h-7 w-7 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="px-2 py-1.5 space-y-0.5">
            {workspaceLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{link.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* CENTRE — Chat bar CarlOS */}
      <div className="flex-1">
        <GlobalChatBar />
      </div>

      {/* DROITE — Équipe bots active */}
      <div className="w-72 border-l flex-shrink-0 px-3 py-2.5 flex flex-col justify-center">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1.5">
          Équipe sur ce dossier
        </h4>
        <div className="flex items-center gap-1">
          {activeBots.map((bot) => (
            <div key={bot.id} className="relative group" title={`${bot.name} (${bot.role}) — ${bot.task || 'En attente'}`}>
              <img
                src={bot.avatar}
                alt={bot.name}
                className={`w-8 h-8 rounded-full object-cover ring-2 ${
                  bot.status === 'working' ? 'ring-green-400' :
                  bot.status === 'active' ? 'ring-blue-400' : 'ring-gray-300 opacity-60'
                }`}
              />
              <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${getStatusDot(bot.status)} ${
                bot.status === 'working' ? 'animate-pulse' : ''
              }`} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                  {bot.name} — {bot.task || 'En attente'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
