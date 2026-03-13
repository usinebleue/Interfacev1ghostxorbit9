/**
 * SallesHubView.tsx — Hub de salles (9 categories, 26+ playbooks)
 * Clic categorie → liste playbooks → choix Conference AI / Mode Texte → lancement
 * Plan V6 — Sprint F1
 */

import { useState } from "react";
import {
  DoorOpen,
  Lightbulb,
  AlertTriangle,
  Crown,
  TrendingUp,
  Users,
  Handshake,
  Podcast,
  Wrench,
  Search,
  Video,
  MessageSquare,
} from "lucide-react";
import { PageLayout } from "./layouts/PageLayout";
import { PageHeader } from "./layouts/PageHeader";
import { Card } from "../../../components/ui/card";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";

interface Playbook {
  id: string;
  label: string;
  description: string;
}

interface Category {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  playbooks: Playbook[];
}

const CATEGORIES: Category[] = [
  {
    id: "creativite",
    label: "Creativite",
    subtitle: "Think Room — brainstorm, innovation, resonance",
    icon: Lightbulb,
    color: "from-amber-500 to-yellow-400",
    playbooks: [
      { id: "brainstorm", label: "Brainstorm", description: "Generation d'idees en equipe" },
      { id: "innovation", label: "Innovation", description: "Exploration de nouvelles solutions" },
      { id: "resonance", label: "Deep Resonance", description: "Reflexion profonde guidee" },
    ],
  },
  {
    id: "crises",
    label: "Crises",
    subtitle: "War Room — gestion de crises et postmortems",
    icon: AlertTriangle,
    color: "from-red-500 to-rose-400",
    playbooks: [
      { id: "crise", label: "Gestion de Crise", description: "Protocole d'urgence structure" },
      { id: "postmortem", label: "Postmortem", description: "Analyse post-incident" },
    ],
  },
  {
    id: "gouvernance",
    label: "Gouvernance",
    subtitle: "Board Room — CA, comites, revues trimestrielles",
    icon: Crown,
    color: "from-violet-500 to-purple-400",
    playbooks: [
      { id: "board", label: "Conseil d'Administration", description: "Reunion du CA" },
      { id: "comex", label: "Comite Executif", description: "Reunion COMEX" },
      { id: "qbr", label: "Revue Trimestrielle", description: "QBR — Quarterly Business Review" },
      { id: "mbr", label: "Revue Mensuelle", description: "MBR — Monthly Business Review" },
      { id: "standup", label: "Standup", description: "Point quotidien rapide" },
    ],
  },
  {
    id: "ventes",
    label: "Ventes & Clients",
    subtitle: "Meetings clients, aiguillage, closing",
    icon: TrendingUp,
    color: "from-emerald-500 to-green-400",
    playbooks: [
      { id: "client", label: "Meeting Client", description: "Rencontre client structuree" },
      { id: "aiguillage", label: "Aiguillage", description: "Qualification et orientation" },
      { id: "closing", label: "Closing", description: "Session de closing structuree" },
      { id: "demo_produit", label: "Demo Produit", description: "Demonstration produit impactante" },
    ],
  },
  {
    id: "rh",
    label: "RH & Recrutement",
    subtitle: "Onboarding, entrevues, integration",
    icon: Users,
    color: "from-teal-500 to-cyan-400",
    playbooks: [
      { id: "onboarding", label: "Onboarding", description: "Integration nouvel employe" },
      { id: "pre_entrevue", label: "Pre-entrevue", description: "Screening et evaluation initiale" },
      { id: "entrevue_technique", label: "Entrevue Technique", description: "Evaluation competences techniques" },
      { id: "entrevue_culture", label: "Entrevue Culture", description: "Evaluation alignement culturel" },
    ],
  },
  {
    id: "matching",
    label: "Matching Orbit9",
    subtitle: "Jumelage inter-entreprises, trisociation",
    icon: Handshake,
    color: "from-blue-500 to-indigo-400",
    playbooks: [
      { id: "jumelage", label: "Jumelage 1-on-1", description: "Mise en relation structuree" },
      { id: "trisociation", label: "Trisociation", description: "3 entreprises + 3 bots" },
    ],
  },
  {
    id: "contenu",
    label: "Contenu",
    subtitle: "Podcasts, capsules, creation de contenu",
    icon: Podcast,
    color: "from-pink-500 to-rose-400",
    playbooks: [
      { id: "podcast", label: "Podcast", description: "Enregistrement podcast structure" },
    ],
  },
  {
    id: "operationnel",
    label: "Operationnel",
    subtitle: "Travail, kickoff, sprint reviews, diagnostics",
    icon: Wrench,
    color: "from-slate-500 to-gray-400",
    playbooks: [
      { id: "travail", label: "Session de Travail", description: "Travail collaboratif structure" },
      { id: "kickoff", label: "Kickoff", description: "Lancement de projet" },
      { id: "sprint_review", label: "Sprint Review", description: "Revue de sprint" },
      { id: "one_on_one", label: "One-on-One", description: "Meeting 1-a-1" },
      { id: "diagnostic", label: "Diagnostic", description: "Session de diagnostic" },
    ],
  },
  {
    id: "analyse",
    label: "Analyse & Decision",
    subtitle: "Analyse, debats, decisions strategiques, CREDO",
    icon: Search,
    color: "from-indigo-500 to-blue-400",
    playbooks: [
      { id: "analyse", label: "Analyse", description: "Analyse approfondie" },
      { id: "decision", label: "Prise de Decision", description: "Decision structuree" },
      { id: "debat", label: "Debat", description: "Debat contradictoire" },
      { id: "strategie", label: "Strategie", description: "Reflexion strategique" },
      { id: "credo", label: "Session CREDO", description: "Protocole CREDO complet" },
    ],
  },
];

export function SallesHubView() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { setActiveView } = useFrameMaster();

  const category = CATEGORIES.find((c) => c.id === selectedCategory);

  const handleLaunchConference = (_playbookId: string) => {
    setActiveView("conference-ai");
  };

  const handleLaunchTexte = (_playbookId: string) => {
    setActiveView("live-chat");
  };

  // Vue categorie detail
  if (category) {
    const CatIcon = category.icon;
    return (
      <PageLayout
        maxWidth="4xl"
        showPresence={false}
        header={
          <PageHeader
            icon={DoorOpen}
            iconColor="text-amber-600"
            title={category.label}
            subtitle={category.subtitle}
            onBack={() => setSelectedCategory(null)}
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {category.playbooks.map((pb) => (
            <Card
              key={pb.id}
              className="p-0 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div
                className={cn(
                  "bg-gradient-to-r px-4 py-3 flex items-center gap-3",
                  category.color
                )}
              >
                <CatIcon className="h-5 w-5 text-white shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">{pb.label}</p>
                  <p className="text-[9px] text-white/80">{pb.description}</p>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center gap-2">
                <button
                  onClick={() => handleLaunchConference(pb.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Video className="h-3.5 w-3.5" /> Conference AI
                </button>
                <button
                  onClick={() => handleLaunchTexte(pb.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Mode Texte
                </button>
              </div>
            </Card>
          ))}
        </div>
      </PageLayout>
    );
  }

  // Vue hub — grid 9 categories
  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={DoorOpen}
          iconColor="text-amber-600"
          title="Mes Salles"
          subtitle="Choisissez une categorie pour commencer"
        />
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card
              key={cat.id}
              className="p-0 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setSelectedCategory(cat.id)}
            >
              <div
                className={cn(
                  "bg-gradient-to-r px-4 py-4 flex items-center gap-3",
                  cat.color
                )}
              >
                <Icon className="h-6 w-6 text-white shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">{cat.label}</p>
                  <p className="text-[9px] text-white/80">{cat.subtitle}</p>
                </div>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-[9px] text-gray-500 font-medium">
                  {cat.playbooks.length} playbook{cat.playbooks.length > 1 ? "s" : ""}
                </span>
                <span className="text-[9px] text-blue-600 font-bold group-hover:underline">
                  Explorer
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </PageLayout>
  );
}
