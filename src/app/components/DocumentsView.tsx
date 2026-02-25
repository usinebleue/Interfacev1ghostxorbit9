import { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Download,
  ExternalLink,
  Filter,
  MessageSquare,
  Calendar,
  Paperclip
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';

interface Document {
  id: string;
  title: string;
  subtitle: string;
  type: 'credo' | 'cahier' | 'bilan' | 'rapport' | 'export';
  credoPhase?: 'C' | 'R' | 'E' | 'D' | 'O';
  date: string;
  metadata?: string;
  linkedTo?: string;
  status: 'completed' | 'in-progress';
  progress?: number;
}

const credoColors = {
  C: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', emoji: '🟡' },
  R: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', emoji: '🔵' },
  E: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', emoji: '🟣' },
  D: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', emoji: '🟢' },
  O: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', emoji: '🔴' },
};

const documents: Document[] = [
  {
    id: '1',
    title: 'Fiche Tension — Automatisation Production',
    subtitle: 'Document CREDO',
    type: 'credo',
    credoPhase: 'C',
    date: '20 fév',
    linkedTo: 'Cahier Robot Soudure',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Diagnostic — Robotique vs Main d\'Oeuvre',
    subtitle: 'Document CREDO',
    type: 'credo',
    credoPhase: 'R',
    date: '21 fév',
    metadata: '12 pages',
    linkedTo: 'Cahier',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Brief Équipe — Décision Robot Soudure',
    subtitle: 'Document CREDO',
    type: 'credo',
    credoPhase: 'E',
    date: '24 fév',
    metadata: 'Synthèse 3 options',
    status: 'completed',
  },
  {
    id: '4',
    title: 'Argumentaire ROI — Fanuc CRX-10 + MEDTEQ',
    subtitle: 'Document CREDO',
    type: 'credo',
    credoPhase: 'D',
    date: '25 fév',
    metadata: 'Business case complet',
    status: 'completed',
  },
  {
    id: '5',
    title: 'Plan d\'Action — Implémentation Robot',
    subtitle: 'Document CREDO',
    type: 'credo',
    credoPhase: 'O',
    date: '25 fév',
    status: 'in-progress',
    progress: 67,
  },
];

type FilterType = 'tous' | 'credo' | 'cahiers' | 'bilans' | 'rapports' | 'exports';

const filters: { id: FilterType; label: string }[] = [
  { id: 'tous', label: 'Tous' },
  { id: 'credo', label: 'CREDO' },
  { id: 'cahiers', label: 'Cahiers' },
  { id: 'bilans', label: 'Bilans' },
  { id: 'rapports', label: 'Rapports' },
  { id: 'exports', label: 'Exports' },
];

interface DocumentsViewProps {
  onBack?: () => void;
}

export function DocumentsView({ onBack }: DocumentsViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('tous');

  const filteredDocuments = documents.filter(doc => {
    if (activeFilter === 'tous') return true;
    return doc.type === activeFilter;
  });

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* En-tête */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Cockpit
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-xl font-semibold">Mes Documents</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {documents.length} documents
            </Badge>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Filtres */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex items-center gap-2 flex-wrap">
                {filters.map(filter => (
                  <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter(filter.id)}
                    className="h-8"
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Documents CREDO */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">DOCUMENTS CREDO (Auto-générés)</h2>
              <Badge variant="secondary" className="text-xs">
                {filteredDocuments.filter(d => d.type === 'credo').length}
              </Badge>
            </div>

            <div className="space-y-3">
              {filteredDocuments.map(doc => {
                const colors = doc.credoPhase ? credoColors[doc.credoPhase] : null;
                
                return (
                  <Card 
                    key={doc.id} 
                    className={`p-5 hover:shadow-md transition-shadow ${
                      colors ? `border-l-4 ${colors.border}` : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icône et phase CREDO */}
                      <div className="flex-shrink-0 flex items-center gap-3">
                        <div className="text-3xl">📄</div>
                        {colors && doc.credoPhase && (
                          <div className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 ${colors.border} ${colors.bg}`}>
                            <div className="text-center">
                              <div className={`font-bold text-sm ${colors.text}`}>
                                {doc.credoPhase}
                              </div>
                              <div className="text-lg leading-none">
                                {colors.emoji}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {doc.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Généré le {doc.date}</span>
                              </div>
                              {doc.metadata && (
                                <>
                                  <span>•</span>
                                  <span>{doc.metadata}</span>
                                </>
                              )}
                              {doc.linkedTo && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Paperclip className="h-3.5 w-3.5" />
                                    <span>Lié au {doc.linkedTo}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Barre de progression pour documents en cours */}
                        {doc.status === 'in-progress' && doc.progress !== undefined && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                En cours...
                              </span>
                              <span className="text-sm font-semibold text-blue-600">
                                {doc.progress}% complet
                              </span>
                            </div>
                            <Progress value={doc.progress} className="h-2" />
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {doc.status === 'completed' ? (
                            <>
                              <Button variant="default" size="sm" className="gap-2">
                                <ExternalLink className="h-3.5 w-3.5" />
                                Ouvrir
                              </Button>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Download className="h-3.5 w-3.5" />
                                Exporter PDF
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="default" size="sm" className="gap-2">
                                <ExternalLink className="h-3.5 w-3.5" />
                                Ouvrir
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                Compléter avec CarlOS
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Légende des couleurs CREDO */}
          <Card className="p-5 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-900">
                COULEURS = Phases CREDO :
              </h3>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(credoColors).map(([phase, colors]) => (
                  <div 
                    key={phase}
                    className={`flex items-center gap-2 p-3 rounded-lg border ${colors.border} ${colors.bg}`}
                  >
                    <div className={`font-bold ${colors.text}`}>{phase}</div>
                    <div className="text-lg">{colors.emoji}</div>
                    <div className="text-xs text-gray-600">
                      {phase === 'C' && 'Clarifier'}
                      {phase === 'R' && 'Réfléchir'}
                      {phase === 'E' && 'Élaborer'}
                      {phase === 'D' && 'Décider'}
                      {phase === 'O' && 'Opérer'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Section vide pour autres types */}
          {activeFilter !== 'tous' && activeFilter !== 'credo' && filteredDocuments.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Aucun document dans cette catégorie
              </h3>
              <p className="text-sm text-gray-600">
                Les documents de type "{activeFilter}" apparaîtront ici.
              </p>
            </Card>
          )}

          {/* Informations supplémentaires */}
          <Card className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">💡</span>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">
                  Documents générés automatiquement
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Tous les documents CREDO sont générés automatiquement par CarlOS 
                  au fur et à mesure de tes conversations. Chaque phase du processus 
                  CREDO produit des documents spécifiques pour t'aider à structurer 
                  ta réflexion et faciliter la prise de décision.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Créer un nouveau document
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-3.5 w-3.5" />
                    Tout exporter
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
