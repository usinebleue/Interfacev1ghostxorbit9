/**
 * ConferenceAIView.tsx — Hub principal Conférence AI (D-114 Phase B)
 * Section complète avec types de rencontres configurables.
 * CarlOS en mode playbook adapté au type.
 *
 * Tab 1: Nouvelle Rencontre — Cards par type + lancement
 * Tab 2: Archives — Meetings passés + rapports
 * Tab 3: Playbooks — Preview des flows (lecture seule V1)
 */

import { useState, useEffect, useCallback } from "react";
import {
  Mic,
  Crown,
  Handshake,
  Compass,
  Wrench,
  Rocket,
  Stethoscope,
  AlertTriangle,
  Lightbulb,
  Swords,
  BarChart3,
  Scale,
  Target,
  Zap,
  Brain,
  Flame,
  Plus,
  Archive,
  BookOpen,
  Clock,
  Users,
  ArrowRight,
  Loader2,
  FileText,
  Video,
  Mail,
  X,
  Send,
  Bot,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { PageLayout } from "./layouts/PageLayout";
import { PageHeader } from "./layouts/PageHeader";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { api } from "../../api/client";
import { MeetingRoomView } from "./MeetingRoomView";

// ═══════════════════════════════════════════════════════════════
// TYPES DE RENCONTRES — Miroir de MEETING_TYPES dans bridge_meetings.py
// ═══════════════════════════════════════════════════════════════

interface MeetingTypeCard {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
}

const BUSINESS_TYPES: MeetingTypeCard[] = [
  {
    id: "podcast",
    label: "Table Ronde Podcast",
    description: "Co-animation podcast avec CarlOS",
    icon: Mic,
    color: "purple",
    gradient: "from-purple-600 to-purple-500",
  },
  {
    id: "board",
    label: "Board Meeting",
    description: "PV + décisions + suivi actions",
    icon: Crown,
    color: "amber",
    gradient: "from-amber-600 to-amber-500",
  },
  {
    id: "client",
    label: "Rencontre Client",
    description: "Notes + besoins + actions",
    icon: Handshake,
    color: "blue",
    gradient: "from-blue-600 to-blue-500",
  },
  {
    id: "aiguillage",
    label: "Aiguillage Client",
    description: "Diagnostic VITAA live",
    icon: Compass,
    color: "emerald",
    gradient: "from-emerald-600 to-emerald-500",
  },
  {
    id: "travail",
    label: "Réunion de Travail",
    description: "Meeting libre, CarlOS documente",
    icon: Wrench,
    color: "gray",
    gradient: "from-gray-600 to-gray-500",
  },
  {
    id: "onboarding",
    label: "Onboarding Pioneer",
    description: "Guide plateforme live",
    icon: Rocket,
    color: "cyan",
    gradient: "from-cyan-600 to-cyan-500",
  },
  {
    id: "diagnostic",
    label: "Diagnostic Live",
    description: "VITAA complet + Triangle du Feu",
    icon: Stethoscope,
    color: "rose",
    gradient: "from-rose-600 to-rose-500",
  },
];

const GHML_TYPES: MeetingTypeCard[] = [
  {
    id: "crise",
    label: "Mode Crise",
    description: "CarlOS COMMANDANT — plan 48h",
    icon: AlertTriangle,
    color: "red",
    gradient: "from-red-600 to-red-500",
  },
  {
    id: "brainstorm",
    label: "Mode Brainstorm",
    description: "Idéation live + vote",
    icon: Lightbulb,
    color: "yellow",
    gradient: "from-yellow-500 to-yellow-400",
  },
  {
    id: "debat",
    label: "Mode Débat",
    description: "Pour / Contre + verdict",
    icon: Swords,
    color: "orange",
    gradient: "from-orange-600 to-orange-500",
  },
  {
    id: "analyse",
    label: "Mode Analyse",
    description: "Deep dive + 5 Pourquoi",
    icon: BarChart3,
    color: "indigo",
    gradient: "from-indigo-600 to-indigo-500",
  },
  {
    id: "decision",
    label: "Mode Décision",
    description: "Go / No-Go structuré",
    icon: Scale,
    color: "teal",
    gradient: "from-teal-600 to-teal-500",
  },
  {
    id: "strategie",
    label: "Mode Stratégie",
    description: "SWOT + plan 3-5 ans",
    icon: Target,
    color: "blue",
    gradient: "from-blue-700 to-blue-600",
  },
  {
    id: "innovation",
    label: "Mode Innovation",
    description: "Trisociation + POC 72h",
    icon: Zap,
    color: "violet",
    gradient: "from-violet-600 to-violet-500",
  },
  {
    id: "resonance",
    label: "Deep Resonance",
    description: "Mentor 1-on-1 socratique",
    icon: Brain,
    color: "pink",
    gradient: "from-pink-600 to-pink-500",
  },
  {
    id: "credo",
    label: "Mode CREDO",
    description: "C→R→E→D→O complet",
    icon: Flame,
    color: "orange",
    gradient: "from-orange-500 to-red-500",
  },
];

// Flow steps par type (pour Tab Playbooks)
const FLOWS: Record<string, string[]> = {
  podcast: ["Intro", "Tour de table", "Discussion", "Synthèse", "Closing"],
  board: ["Ouverture", "Points à l'ordre", "Varia", "Clôture"],
  client: ["Accueil", "Discovery", "Présentation", "Objections", "Next steps"],
  aiguillage: ["Bienvenue", "Questions VITAA", "Triangle du Feu", "Recommandation"],
  travail: ["Libre"],
  onboarding: ["Accueil", "Tour guidé", "Questions", "Premiers pas"],
  diagnostic: ["Introduction", "Piliers VITAA", "Scoring", "Triangle du Feu", "Recommandations", "Plan d'action"],
  crise: ["Alerte", "Évaluation", "Plan d'action", "Assignation", "Suivi"],
  brainstorm: ["Contexte", "Divergence", "Regroupement", "Convergence", "Actions"],
  debat: ["Thèse", "Pour", "Contre", "Synthèse", "Verdict"],
  analyse: ["Problème", "5 Pourquoi", "Data review", "Cause racine", "Recommandation"],
  decision: ["Options", "Critères", "Évaluation", "Débat", "Verdict"],
  strategie: ["Vision", "SWOT", "Priorités", "Plan", "Engagements"],
  innovation: ["Défi", "Trisociation", "What-if", "Prototypage", "Go/No-Go"],
  resonance: ["Libre"],
  credo: ["Connecter", "Rechercher", "Exposer", "Démontrer", "Obtenir"],
};

// Bots pré-configurés par playbook — miroir de bridge_meetings.py invited_bots
const PLAYBOOK_BOTS: Record<string, { code: string; name: string; role: string }[]> = {
  podcast: [{ code: "BCO", name: "CarlOS", role: "Co-animateur" }],
  board: [
    { code: "BCO", name: "CarlOS", role: "Président" },
    { code: "BCF", name: "François", role: "Finances" },
    { code: "BCS", name: "Simon", role: "Stratégie" },
  ],
  client: [
    { code: "BCO", name: "CarlOS", role: "Assistant" },
    { code: "BCS", name: "Simon", role: "Ventes" },
  ],
  aiguillage: [{ code: "BCO", name: "CarlOS", role: "Guide" }],
  travail: [{ code: "BCO", name: "CarlOS", role: "Documenteur" }],
  onboarding: [{ code: "BCO", name: "CarlOS", role: "Guide" }],
  diagnostic: [{ code: "BCO", name: "CarlOS", role: "Diagnosticien" }],
  crise: [
    { code: "BCO", name: "CarlOS", role: "Commandant" },
    { code: "BOO", name: "Julie", role: "Opérations" },
    { code: "BCF", name: "François", role: "Finances" },
    { code: "BSE", name: "Samuel", role: "Sécurité" },
  ],
  brainstorm: [
    { code: "BCO", name: "CarlOS", role: "Facilitateur" },
    { code: "BCT", name: "Alex", role: "Tech" },
    { code: "BCM", name: "Sophie", role: "Marketing" },
  ],
  debat: [
    { code: "BCO", name: "CarlOS", role: "Modérateur" },
    { code: "BCS", name: "Simon", role: "Stratégie" },
    { code: "BCM", name: "Sophie", role: "Marché" },
  ],
  analyse: [
    { code: "BCO", name: "CarlOS", role: "Analyste" },
    { code: "BCT", name: "Alex", role: "Tech" },
    { code: "BCF", name: "François", role: "Finances" },
  ],
  decision: [
    { code: "BCO", name: "CarlOS", role: "Arbitre" },
    { code: "BCF", name: "François", role: "Finances" },
    { code: "BCS", name: "Simon", role: "Stratégie" },
  ],
  strategie: [
    { code: "BCO", name: "CarlOS", role: "Stratège" },
    { code: "BCS", name: "Simon", role: "Stratégie" },
    { code: "BCF", name: "François", role: "Finances" },
  ],
  innovation: [
    { code: "BCO", name: "CarlOS", role: "Disrupteur" },
    { code: "BCT", name: "Alex", role: "Tech" },
    { code: "BIO", name: "Inès", role: "Innovation" },
  ],
  resonance: [{ code: "BCO", name: "CarlOS", role: "Mentor" }],
  credo: [{ code: "BCO", name: "CarlOS", role: "Maître CREDO" }],
};

type Tab = "new" | "archives" | "playbooks";

export function ConferenceAIView() {
  const { setActiveView } = useFrameMaster();
  const [activeTab, setActiveTab] = useState<Tab>("new");
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  // Mini-modal pour créer un meeting
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<MeetingTypeCard | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [creating, setCreating] = useState(false);

  // Si on est dans un meeting live, afficher MeetingRoomView
  const [activeMeeting, setActiveMeeting] = useState<{ type: string; title: string } | null>(null);

  // Invitation modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSlug, setInviteSlug] = useState("");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvites, setSendingInvites] = useState(false);
  const [inviteResults, setInviteResults] = useState<any[]>([]);

  // Load meetings for archives
  useEffect(() => {
    if (activeTab === "archives") {
      setLoadingMeetings(true);
      api.meetingList().then(res => {
        setMeetings(res.meetings || []);
      }).catch(() => {}).finally(() => setLoadingMeetings(false));
    }
  }, [activeTab]);

  // Click "Démarrer" sur une card
  const handleSelectType = useCallback((type: MeetingTypeCard) => {
    setSelectedType(type);
    const now = new Date();
    const dateStr = now.toLocaleDateString("fr-CA", { day: "numeric", month: "short" });
    setModalTitle(`${type.label} — ${dateStr}`);
    setShowModal(true);
  }, []);

  // Créer et lancer le meeting
  const handleLaunch = useCallback(async () => {
    if (!selectedType || !modalTitle.trim()) return;
    setCreating(true);
    try {
      await api.meetingCreate({ title: modalTitle, meeting_type: selectedType.id });
      setActiveMeeting({ type: selectedType.id, title: modalTitle });
      setShowModal(false);
    } catch (err) {
      console.error("Meeting creation failed:", err);
    } finally {
      setCreating(false);
    }
  }, [selectedType, modalTitle]);

  // Ouvrir le modal d'invitation
  const handleOpenInvite = useCallback((slug: string, title: string) => {
    setInviteSlug(slug);
    setInviteTitle(title);
    setInviteEmails("");
    setInviteMessage("");
    setInviteResults([]);
    setShowInviteModal(true);
  }, []);

  // Envoyer les invitations
  const handleSendInvites = useCallback(async () => {
    if (!inviteSlug || !inviteEmails.trim()) return;
    setSendingInvites(true);
    try {
      const emails = inviteEmails.split(/[,;\n]+/).map(e => e.trim()).filter(e => e.includes("@"));
      const res = await api.meetingInvite(inviteSlug, {
        emails,
        message: inviteMessage,
      });
      setInviteResults(res.invitations || []);
    } catch (err) {
      console.error("Invite failed:", err);
    } finally {
      setSendingInvites(false);
    }
  }, [inviteSlug, inviteEmails, inviteMessage]);

  // Si un meeting est actif, afficher la salle
  if (activeMeeting) {
    return <MeetingRoomView meetingType={activeMeeting.type} meetingTitle={activeMeeting.title} />;
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "new", label: "Nouvelle Rencontre", icon: Plus },
    { id: "archives", label: "Archives", icon: Archive },
    { id: "playbooks", label: "Playbooks", icon: BookOpen },
  ];

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence
      header={
        <PageHeader
          icon={Video}
          iconColor="text-blue-600"
          title="Conférence AI"
          subtitle="Meetings intelligents avec CarlOS"
          onBack={() => setActiveView("dashboard")}
          rightSlot={
            <div className="flex gap-1">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors",
                    activeTab === t.id
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
          }
        />
      }
    >
      {/* ── Tab 1: Nouvelle Rencontre ── */}
      {activeTab === "new" && (
        <div className="space-y-6">
          {/* Catégorie A — Business */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Rencontres Business
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {BUSINESS_TYPES.map(type => (
                <MeetingTypeCardComponent
                  key={type.id}
                  type={type}
                  onSelect={handleSelectType}
                />
              ))}
            </div>
          </div>

          {/* Catégorie B — Modes GHML */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Modes de Réflexion GHML
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {GHML_TYPES.map(type => (
                <MeetingTypeCardComponent
                  key={type.id}
                  type={type}
                  onSelect={handleSelectType}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Archives ── */}
      {activeTab === "archives" && (
        <div>
          {loadingMeetings ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Aucun meeting encore.</p>
              <button
                onClick={() => setActiveTab("new")}
                className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Créer votre premier meeting
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {meetings.map(m => (
                <MeetingArchiveRow
                  key={m.slug}
                  meeting={m}
                  onResume={() => {
                    setActiveMeeting({ type: m.meeting_type || "podcast", title: m.title });
                  }}
                  onInvite={handleOpenInvite}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 3: Playbooks ── */}
      {activeTab === "playbooks" && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Chaque type de meeting a un flow structuré. CarlOS suit automatiquement le playbook adapté.
          </p>
          {[...BUSINESS_TYPES, ...GHML_TYPES].map(type => {
            const flow = FLOWS[type.id] || [];
            return (
              <div key={type.id} className="bg-white border rounded-xl overflow-hidden">
                <div className={cn("bg-gradient-to-r px-4 py-2 flex items-center gap-2", type.gradient)}>
                  <type.icon className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">{type.label}</span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-gray-500 mb-2">{type.description}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {flow.map((step, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {i > 0 && <ArrowRight className="h-3.5 w-3.5 text-gray-300" />}
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                          {step}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal création ── */}
      {showModal && selectedType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className={cn("bg-gradient-to-r px-5 py-4 flex items-center gap-3", selectedType.gradient)}>
              <selectedType.icon className="h-5 w-5 text-white" />
              <div>
                <h3 className="text-sm font-bold text-white">{selectedType.label}</h3>
                <p className="text-xs text-white/70">{selectedType.description}</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Titre du meeting</label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={e => setModalTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && handleLaunch()}
                />
              </div>
              {/* Bots assignés au playbook */}
              {selectedType && PLAYBOOK_BOTS[selectedType.id] && (
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 block flex items-center gap-1">
                    <Bot className="h-3.5 w-3.5" /> Bots présents
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PLAYBOOK_BOTS[selectedType.id].map(bot => (
                      <span
                        key={bot.code}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                      >
                        <span className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-[9px] font-bold">
                          {bot.name[0]}
                        </span>
                        {bot.name}
                        <span className="text-purple-400">·</span>
                        <span className="text-purple-500 font-normal">{bot.role}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleLaunch}
                  disabled={creating || !modalTitle.trim()}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2",
                    `bg-gradient-to-r ${selectedType.gradient} hover:opacity-90`,
                    (creating || !modalTitle.trim()) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Démarrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal invitation ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-white" />
                <div>
                  <h3 className="text-sm font-bold text-white">Inviter des participants</h3>
                  <p className="text-xs text-white/70">{inviteTitle}</p>
                </div>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-white/80 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Adresses email (une par ligne ou séparées par virgule)
                </label>
                <textarea
                  value={inviteEmails}
                  onChange={e => setInviteEmails(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="jean@acme.ca&#10;marie@company.com"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Message personnalisé (optionnel)
                </label>
                <input
                  type="text"
                  value={inviteMessage}
                  onChange={e => setInviteMessage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Au plaisir de vous y voir!"
                />
              </div>

              {/* Résultats d'envoi */}
              {inviteResults.length > 0 && (
                <div className="space-y-1">
                  {inviteResults.map((r, i) => (
                    <div key={i} className={cn(
                      "text-xs px-3 py-1.5 rounded-lg",
                      r.status === "sent" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    )}>
                      {r.email} — {r.status === "sent" ? "Invitation envoyée" : r.error || "Erreur"}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={handleSendInvites}
                  disabled={sendingInvites || !inviteEmails.trim()}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-colors flex items-center justify-center gap-2",
                    (sendingInvites || !inviteEmails.trim()) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {sendingInvites ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Envoyer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function MeetingTypeCardComponent({
  type,
  onSelect,
}: {
  type: MeetingTypeCard;
  onSelect: (type: MeetingTypeCard) => void;
}) {
  return (
    <button
      onClick={() => onSelect(type)}
      className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow text-left cursor-pointer group"
    >
      <div className={cn("bg-gradient-to-r px-3 py-2 flex items-center gap-2", type.gradient)}>
        <type.icon className="h-4 w-4 text-white" />
        <span className="text-xs font-bold text-white truncate">{type.label}</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[11px] text-gray-500 leading-relaxed">{type.description}</p>
        <div className="mt-2 flex items-center gap-1 text-[9px] text-gray-400 group-hover:text-blue-600 transition-colors">
          <ArrowRight className="h-3.5 w-3.5" />
          <span className="font-medium">Démarrer</span>
        </div>
      </div>
    </button>
  );
}


function MeetingArchiveRow({
  meeting,
  onResume,
  onInvite,
}: {
  meeting: any;
  onResume: (slug: string) => void;
  onInvite?: (slug: string, title: string) => void;
}) {
  const allTypes = [...BUSINESS_TYPES, ...GHML_TYPES];
  const typeInfo = allTypes.find(t => t.id === meeting.meeting_type);
  const TypeIcon = typeInfo?.icon || FileText;

  const statusColor = {
    live: "text-red-500",
    ended: "text-gray-400",
    scheduled: "text-blue-500",
  }[meeting.status as string] || "text-gray-400";

  const statusLabel = {
    live: "En cours",
    ended: "Terminé",
    scheduled: "Planifié",
  }[meeting.status as string] || meeting.status;

  const duration = meeting.started_at && meeting.ended_at
    ? Math.round((new Date(meeting.ended_at).getTime() - new Date(meeting.started_at).getTime()) / 60000)
    : null;

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          typeInfo ? `bg-gradient-to-r ${typeInfo.gradient}` : "bg-gray-200"
        )}>
          <TypeIcon className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{meeting.title}</p>
          <div className="flex items-center gap-2 text-[11px]">
            <span className={cn("font-medium", statusColor)}>{statusLabel}</span>
            {meeting.created_at && (
              <span className="text-gray-400">
                {new Date(meeting.created_at).toLocaleDateString("fr-CA")}
              </span>
            )}
            {duration && (
              <span className="text-gray-400 flex items-center gap-0.5">
                <Clock className="h-3.5 w-3.5" /> {duration}min
              </span>
            )}
            {meeting.meeting_type && (
              <span className="text-gray-400">{typeInfo?.label || meeting.meeting_type}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {(meeting.status === "live" || meeting.status === "scheduled") && (
          <>
            <button
              onClick={() => onInvite?.(meeting.slug, meeting.title)}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-1"
            >
              <Mail className="h-3.5 w-3.5" /> Inviter
            </button>
            <button
              onClick={() => onResume(meeting.slug)}
              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Rejoindre
            </button>
          </>
        )}
        {meeting.status === "ended" && meeting.ai_summary && Object.keys(meeting.ai_summary).length > 0 && (
          <button
            onClick={() => window.open(`/api/v1/meetings/${meeting.slug}/podcast`, "_blank")}
            className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Rapport
          </button>
        )}
      </div>
    </div>
  );
}
