import { useState } from 'react';
import {
  Send,
  Mic,
  Paperclip,
  Brain,
  Swords,
  Lightbulb,
  AlertTriangle,
  BarChart3,
  Target,
  Rocket,
  Waves,
  Star,
} from 'lucide-react';
import { Button } from './ui/button';

interface ReflectionMode {
  id: string;
  label: string;
  icon: React.ElementType;
  activeColor: string;
}

const reflectionModes: ReflectionMode[] = [
  { id: 'credo', label: 'CREDO', icon: Star, activeColor: 'bg-blue-600 text-white' },
  { id: 'debate', label: 'Débat', icon: Swords, activeColor: 'bg-red-500 text-white' },
  { id: 'brainstorm', label: 'Brain', icon: Lightbulb, activeColor: 'bg-yellow-500 text-white' },
  { id: 'crisis', label: 'Crise', icon: AlertTriangle, activeColor: 'bg-orange-500 text-white' },
  { id: 'analysis', label: 'Analyse', icon: BarChart3, activeColor: 'bg-green-600 text-white' },
  { id: 'decision', label: 'Décision', icon: Target, activeColor: 'bg-purple-600 text-white' },
  { id: 'strategy', label: 'Strat.', icon: Brain, activeColor: 'bg-indigo-600 text-white' },
  { id: 'innovation', label: 'Innov.', icon: Rocket, activeColor: 'bg-pink-500 text-white' },
  { id: 'deep', label: 'Deep', icon: Waves, activeColor: 'bg-cyan-600 text-white' },
];

export function GlobalChatBar() {
  const [chatInput, setChatInput] = useState('');
  const [activeMode, setActiveMode] = useState<string>('credo');

  const handleSend = () => {
    if (chatInput.trim()) {
      console.log('Send:', chatInput, 'Mode:', activeMode);
      setChatInput('');
    }
  };

  return (
    <div className="bg-white">
      <div className="px-4 py-3">
        <div className="flex items-end gap-3">
          {/* Avatar CarlOS */}
          <img
            src="/agents/ceo-carlos.png"
            alt="CarlOS"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500 flex-shrink-0 mb-1"
          />

          {/* Zone de saisie */}
          <div className="flex-1 flex flex-col border rounded-xl bg-gray-50 px-3 py-2">
            {/* Textarea */}
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Parle à CarlOS..."
              className="w-full bg-transparent resize-none text-sm focus:outline-none min-h-[48px] max-h-[200px]"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && chatInput.trim()) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            {/* Ligne du bas : pièce jointe, modes, puis micro + envoyer */}
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-gray-200 mt-1">
              {/* Pièce jointe */}
              <button className="h-7 px-1.5 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors" title="Pièce jointe">
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Séparateur */}
              <div className="w-px h-5 bg-gray-200" />

              {/* Modes de réflexion — toujours visibles avec nom */}
              {reflectionModes.map((mode) => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(isActive ? '' : mode.id)}
                    className={`h-7 px-2 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? mode.activeColor + ' shadow-sm'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Micro — à côté de Envoyer */}
              <button className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors" title="Message vocal">
                <Mic className="h-4 w-4" />
              </button>

              {/* Envoyer */}
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!chatInput.trim()}
                className="h-8 px-3 gap-1.5 text-xs"
              >
                <Send className="h-4 w-4" />
                Envoyer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
