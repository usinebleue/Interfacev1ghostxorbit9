import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Plus, Search, Settings, ArrowLeft, Paperclip, Mic, CheckCircle2, Circle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Avatar } from './ui/avatar';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'cto' | 'cfo' | 'cso' | 'coo' | 'cmo';
  content: string;
  timestamp: Date;
  actions?: MessageAction[];
  alert?: string;
}

interface MessageAction {
  id: string;
  label: string;
  variant?: 'default' | 'outline' | 'secondary';
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  pinned?: boolean;
}

const conversations: Conversation[] = [
  { id: '1', title: 'Robot Soudure', timestamp: 'Il y a 2h', pinned: true },
  { id: '2', title: 'Vision 2027', timestamp: 'Hier' },
  { id: '3', title: 'Budget Q2', timestamp: 'Lundi' },
  { id: '4', title: 'Analyse concurrence', timestamp: 'La semaine dernière' },
];

const teamWorkload = [
  { name: 'CarlOS', progress: 90, color: 'bg-blue-600' },
  { name: 'CTO', progress: 60, color: 'bg-purple-600' },
  { name: 'CFO', progress: 35, color: 'bg-green-600' },
  { name: 'CSO', progress: 65, color: 'bg-red-600' },
];

const decisionBranches = [
  { id: 'A', title: 'Quel robot', children: [
    { id: 'A1', label: 'Fanuc', status: 'selected' },
    { id: 'A2', label: 'UR10e', status: 'pending' },
    { id: 'A3', label: 'Yaskawa', status: 'pending' },
  ]},
  { id: 'B', title: 'Budget', children: [
    { id: 'B1', label: '185K$', status: 'selected' },
  ]},
  { id: 'C', title: 'Timeline', children: [
    { id: 'C1', label: 'en attente', status: 'pending' },
  ]},
];

const getRoleAvatar = (role: string) => {
  const configs = {
    assistant: { emoji: '🔵', name: 'CarlOS', gradient: 'from-blue-600 to-purple-600' },
    cto: { emoji: '🟣', name: 'CTO', gradient: 'from-purple-600 to-purple-800' },
    cfo: { emoji: '🟢', name: 'CFO', gradient: 'from-green-600 to-green-800' },
    cso: { emoji: '🔴', name: 'CSO', gradient: 'from-red-600 to-red-800' },
    coo: { emoji: '🟠', name: 'COO', gradient: 'from-orange-600 to-orange-800' },
    cmo: { emoji: '🩷', name: 'CMO', gradient: 'from-pink-600 to-pink-800' },
    user: { emoji: '👤', name: 'Carl', gradient: 'from-blue-500 to-blue-700' },
  };
  return configs[role as keyof typeof configs] || configs.user;
};

export function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'J\'ai analysé les 3 options de robots soudure. Voici mon recommandation :\n\n1. Fanuc CRX-10    → 185K$, ROI 14m\n2. Universal UR10e  → 145K$, ROI 18m\n3. Yaskawa HC10DT  → 165K$, ROI 16m\n\nLe CTO Bot recommande option 1.\nLe CFO Bot valide le budget.\nTu veux qu\'on cristallise?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      actions: [
        { id: '1', label: '1. Fanuc ✓', variant: 'default' },
        { id: '2', label: '2. UR10e', variant: 'outline' },
        { id: '3', label: '3. Yaskawa', variant: 'outline' },
        { id: '4', label: 'Comparer en détail', variant: 'secondary' },
      ],
    },
    {
      id: '2',
      role: 'user',
      content: 'Le Fanuc me parle. Mais avant, je veux voir si on peut avoir une subvention MEDTEQ pour ça.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: '3',
      role: 'assistant',
      content: 'Bonne idée! J\'ai lancé le CSO Bot sur la recherche de subventions. Résultat préliminaire : MEDTEQ offre jusqu\'à 50% sur les projets de robotique médicale.',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      alert: '⚡ NOUVEAU : Le CFO Bot a recalculé le ROI avec subvention : ROI passe de 14 mois à 8 mois!',
      actions: [
        { id: '1', label: 'Oui, prépare le dossier', variant: 'default' },
        { id: '2', label: 'Montre-moi le calcul ROI d\'abord', variant: 'outline' },
        { id: '3', label: 'Attends, j\'ai une autre idée', variant: 'outline' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeConversation, setActiveConversation] = useState('1');
  const [currentPhase, setCurrentPhase] = useState<'C' | 'R' | 'E' | 'D' | 'O'>('R');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Parfait ! Je m\'en occupe immédiatement.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPhaseColor = (phase: string) => {
    const colors = {
      C: 'bg-amber-500',
      R: 'bg-blue-500',
      E: 'bg-purple-500',
      D: 'bg-emerald-500',
      O: 'bg-red-500',
    };
    return colors[phase as keyof typeof colors] || 'bg-gray-500';
  };

  const getPhaseLabel = (phase: string) => {
    const labels = {
      C: 'CRISTALLISER',
      R: 'RECHERCHER',
      E: 'EXPLORER',
      D: 'DÉCIDER',
      O: 'ORGANISER',
    };
    return labels[phase as keyof typeof labels] || 'CHAT';
  };

  return (
    <div className="flex-1 flex h-full">
      {/* Liste des conversations */}
      <div className="w-64 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <Button className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle conversation
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <Button
                key={conv.id}
                variant={activeConversation === conv.id ? 'secondary' : 'ghost'}
                className="w-full justify-start h-auto py-3 px-3"
                onClick={() => setActiveConversation(conv.id)}
              >
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="flex items-center gap-2 w-full">
                    {conv.pinned && <span className="text-xs">📌</span>}
                    <span className="font-medium text-sm truncate flex-1">{conv.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">{conv.timestamp}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Zone de conversation */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* En-tête */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold">Chat avec CarlOS</h1>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-gray-500">En ligne</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Search className="h-4 w-4" />
                Historique
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-6 pb-4">
            {messages.map((message) => {
              const roleConfig = getRoleAvatar(message.role);
              const isUser = message.role === 'user';
              
              return (
                <div key={message.id} className="space-y-2">
                  <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <div className={`h-full w-full bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center text-white text-sm font-medium`}>
                        {roleConfig.emoji}
                      </div>
                    </Avatar>
                    
                    <div className={`flex-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-700">{roleConfig.name}</span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border text-gray-900'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                      </div>

                      {message.alert && (
                        <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm text-orange-900 font-medium">{message.alert}</p>
                        </div>
                      )}

                      {message.actions && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.actions.map((action) => (
                            <Button
                              key={action.id}
                              variant={action.variant || 'outline'}
                              size="sm"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <div className="h-full w-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </Avatar>
                <div className="bg-white border rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Barre de chat en bas */}
        <div className="border-t bg-white">
          <div className="px-6 py-2">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-2 w-2 rounded-full ${getPhaseColor(currentPhase)}`} />
              <span className="text-xs font-medium text-gray-600">
                PHASE: {getPhaseLabel(currentPhase)} ({currentPhase})
              </span>
              <span className="text-xs text-gray-400">{getPhaseColor(currentPhase).replace('bg-', '')}</span>
            </div>
          </div>
          <div className="px-6 pb-4">
            <div className="flex items-end gap-3">
              <div className="text-xl pb-2">💬</div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Parle à CarlOS..."
                className="resize-none min-h-[48px] max-h-[120px] flex-1"
                rows={1}
              />
              <div className="flex gap-2 pb-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas droit - Contexte dynamique */}
      <div className="w-80 border-l bg-white overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Document en cours */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">En ce moment CarlOS prépare:</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📄</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Brief Équipe Robot Soudure</p>
                </div>
              </div>
              <Progress value={87} className="h-2" />
              <p className="text-xs text-gray-600 font-medium">87% complet</p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">Ouvrir</Button>
                <Button size="sm" variant="outline" className="flex-1">Commenter</Button>
              </div>
            </div>
          </Card>

          {/* Branches de décision */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🌳</span>
              <h3 className="font-semibold">BRANCHES</h3>
            </div>
            
            <div className="space-y-4">
              {decisionBranches.map((branch) => (
                <div key={branch.id} className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">{branch.id}. {branch.title}</p>
                  <div className="pl-4 space-y-1">
                    {branch.children.map((child) => (
                      <div key={child.id} className="flex items-center gap-2">
                        {child.status === 'selected' ? (
                          <CheckCircle2 className="h-4 w-4 text-blue-600 fill-blue-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-300" />
                        )}
                        <span className="text-sm text-gray-700">
                          {child.id} {child.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <Separator className="my-3" />

              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600 fill-blue-600" />
                  <span>= cristallisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-3 w-3 text-gray-300" />
                  <span>= en cours</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Qui travaille */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">👥</span>
              <h3 className="font-semibold">QUI TRAVAILLE</h3>
            </div>
            
            <div className="space-y-4">
              {teamWorkload.map((member) => (
                <div key={member.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{member.name}</span>
                    <span className="text-xs text-gray-500">{member.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${member.color} transition-all duration-300`}
                      style={{ width: `${member.progress}%` }}
                    />
                  </div>
                </div>
              ))}

              <Button variant="outline" size="sm" className="w-full mt-3">
                Configurer
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}