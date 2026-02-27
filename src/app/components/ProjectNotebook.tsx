import { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Settings, 
  Edit, 
  MessageSquare, 
  RefreshCw, 
  FileText,
  ArrowRight,
  Send,
  Paperclip,
  CheckCircle2,
  Circle,
  Loader2,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { cn } from './ui/utils';

interface Section {
  id: string;
  code: string;
  title: string;
  emoji: string;
  bot: {
    emoji: string;
    name: string;
    role: string;
  };
  progress: number;
}

interface SubSection {
  id: string;
  code: string;
  title: string;
  progress: number;
  status: 'complete' | 'in-progress' | 'pending';
}

const sections: Section[] = [
  { 
    id: 'dp', 
    code: 'DP', 
    title: 'Données', 
    emoji: '📊',
    bot: { emoji: '🔵', name: 'CarlOS', role: 'CEO' },
    progress: 85
  },
  { 
    id: 's00', 
    code: 'S00', 
    title: 'Synthèse', 
    emoji: '📋',
    bot: { emoji: '🔵', name: 'CarlOS', role: 'CEO' },
    progress: 92
  },
  { 
    id: 's01', 
    code: 'S01', 
    title: 'Marché', 
    emoji: '🎯',
    bot: { emoji: '🩷', name: 'CMO', role: 'Marketing' },
    progress: 88
  },
  { 
    id: 's02', 
    code: 'S02', 
    title: 'Techno', 
    emoji: '⚙️',
    bot: { emoji: '🟣', name: 'CTO', role: 'Musk' },
    progress: 65
  },
  { 
    id: 's03', 
    code: 'S03', 
    title: 'Solution', 
    emoji: '💡',
    bot: { emoji: '🟠', name: 'COO', role: 'Operations' },
    progress: 70
  },
  { 
    id: 's04', 
    code: 'S04', 
    title: 'Finance', 
    emoji: '💰',
    bot: { emoji: '🟢', name: 'CFO', role: 'Buffett' },
    progress: 78
  },
  { 
    id: 's05', 
    code: 'S05', 
    title: 'Opérations', 
    emoji: '🚀',
    bot: { emoji: '🟠', name: 'COO', role: 'Operations' },
    progress: 45
  },
];

const subsections: SubSection[] = [
  { id: '2.1', code: '2.1', title: 'État actuel', progress: 100, status: 'complete' },
  { id: '2.2', code: '2.2', title: 'Solutions', progress: 95, status: 'complete' },
  { id: '2.3', code: '2.3', title: 'Specs', progress: 60, status: 'in-progress' },
  { id: '2.4', code: '2.4', title: 'Intégration', progress: 0, status: 'pending' },
];

const teamActivity = [
  { emoji: '🟣', name: 'CTO', activity: 'rédige 2.3' },
  { emoji: '🟢', name: 'CFO', activity: 'calcule ROI' },
  { emoji: '🔴', name: 'CSO', activity: 'prospection pipeline' },
];

const linkedSections = [
  { code: 'S04', title: 'Budget' },
  { code: 'S05', title: 'Timeline' },
  { code: 'DP', title: 'Données' },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'in-progress':
      return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
    case 'pending':
      return <Circle className="h-4 w-4 text-gray-300" />;
    default:
      return null;
  }
};

interface ProjectNotebookProps {
  onBack?: () => void;
}

export function ProjectNotebook({ onBack }: ProjectNotebookProps) {
  const [activeSection, setActiveSection] = useState('s02');
  const [activeSubsection, setActiveSubsection] = useState('2.2');
  const [chatInput, setChatInput] = useState('');

  const currentSection = sections.find(s => s.id === activeSection) || sections[3];

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      {/* En-tête */}
      <div className="bg-white border-b border-t-2 border-t-blue-600 px-4 flex-shrink-0">
        <div className="h-12 flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Separator orientation="vertical" className="h-5 mx-2" />
          <h1 className="text-sm font-semibold">Cahier — Robot Soudure</h1>
        </div>

        {/* Navigation sections */}
        <div className="space-y-1 pb-2">
          <div className="flex items-center gap-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "h-9 px-3",
                  activeSection === section.id && "bg-blue-600 hover:bg-blue-700"
                )}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="text-xs font-mono font-semibold">[{section.code}]</span>
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            {sections.map((section, idx) => (
              <span key={section.id} className={cn(
                "flex-1 truncate text-center",
                activeSection === section.id && "font-semibold text-blue-600"
              )}>
                {section.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Zone de contenu */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full p-6 space-y-6">
            {/* En-tête de section */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{currentSection.emoji}</span>
                <div>
                  <h2 className="text-sm font-bold">
                    SECTION {currentSection.code} — {currentSection.title.toUpperCase()}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">Bot responsable:</span>
                    <span className="text-lg">{currentSection.bot.emoji}</span>
                    <span className="text-sm font-semibold">
                      {currentSection.bot.name} ({currentSection.bot.role})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Progress value={currentSection.progress} className="flex-1 h-2" />
                <span className="text-sm font-semibold text-gray-700 w-12">
                  {currentSection.progress}%
                </span>
              </div>
            </div>

            {/* Navigation sous-sections */}
            <Card className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                {subsections.map((sub) => (
                  <Button
                    key={sub.id}
                    variant={activeSubsection === sub.id ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                    onClick={() => setActiveSubsection(sub.id)}
                  >
                    {getStatusIcon(sub.status)}
                    <span>{sub.code} {sub.title}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Contenu de la sous-section */}
            <Card className="p-6">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-sm font-bold mb-4">## 2.2 Solutions Technologiques</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Après analyse des besoins de production actuels (voir §2.1), 
                  trois solutions ont été évaluées :
                </p>

                <div className="my-6 overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-semibold">Robot</th>
                        <th className="text-left py-2 px-4 font-semibold">Coût</th>
                        <th className="text-left py-2 px-4 font-semibold">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-blue-50">
                        <td className="py-2 px-4 font-semibold">Fanuc ★</td>
                        <td className="py-2 px-4">185K$</td>
                        <td className="py-2 px-4">8 mois</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">UR10e</td>
                        <td className="py-2 px-4">145K$</td>
                        <td className="py-2 px-4">18 mois</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Yaskawa</td>
                        <td className="py-2 px-4">165K$</td>
                        <td className="py-2 px-4">16 mois</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  ★ = Recommandation CTO+CFO
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <p className="mb-1">
                        Cette section a été générée à partir de la conversation du 24 février.
                      </p>
                      <Button variant="link" className="p-0 h-auto text-blue-600">
                        Voir la conversation <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 flex-wrap">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Discuter
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Régénérer
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Exporter
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Canvas droit */}
        <div className="w-80 border-l bg-white">
          <div className="p-6 space-y-6">
            {/* Sous-sections */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                SOUS-SECTIONS
              </h3>
              <div className="space-y-3">
                {subsections.map((sub) => (
                  <div 
                    key={sub.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                      activeSubsection === sub.id ? "bg-blue-50" : "hover:bg-gray-50"
                    )}
                    onClick={() => setActiveSubsection(sub.id)}
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(sub.status)}
                      <span className="text-sm font-medium">{sub.code}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {sub.progress}%
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Détails <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Card>

            {/* Qui travaille */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="text-lg">👥</span>
                QUI TRAVAILLE
              </h3>
              <div className="space-y-3">
                {teamActivity.map((member, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{member.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Liens */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                LIENS
              </h3>
              <div className="space-y-2">
                {linkedSections.map((link) => (
                  <Button
                    key={link.code}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <span className="font-mono text-xs">{link.code}</span>
                    <span className="text-sm">{link.title}</span>
                    <span className="ml-auto">↔</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Légende */}
            <Card className="p-4 bg-gray-50">
              <h3 className="font-semibold mb-3 text-xs uppercase text-gray-600">
                Statuts
              </h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Complet</span>
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-blue-600" />
                  <span>En cours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-gray-300" />
                  <span>En attente</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Barre de chat contextuel en bas */}
      <div className="border-t bg-white px-6 py-3 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-semibold text-gray-700">
              SECTION {currentSection.code}
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs text-gray-500">
              Conversation filtrée pour cette section
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xl">{currentSection.bot.emoji}</div>
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Parle au ${currentSection.bot.name}...`}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && chatInput.trim()) {
                  console.log('Send:', chatInput);
                  setChatInput('');
                }
              }}
            />
            <Button variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button 
              disabled={!chatInput.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Envoyer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
