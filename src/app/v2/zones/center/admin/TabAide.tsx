/**
 * TabAide.tsx — Help section with detailed admin guide + FAQ
 * Sections empilees: Guide des sections + FAQ
 * All content inline — no external knowledge-base dependency
 */

import { useState } from "react";
import {
  HelpCircle,
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Wrench,
  Activity,
  Globe,
  Settings,
  Brain,
  Phone,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { BlockHeader, TabSectionHeader } from "../shared/SectionComponents";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Props {
  mode: string;
  tenantId?: number;
  onNav?: (tab: string) => void;
}

interface AdminSection {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  godOnly?: boolean;
}

interface FAQEntry {
  q: string;
  a: string;
}

// ═══════════════════════════════════════
// Guide des sections — description detaillee de chaque tab admin
// ═══════════════════════════════════════

const ADMIN_SECTIONS: AdminSection[] = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Tableau de bord",
    description: "Vue d'ensemble des indicateurs cles de votre systeme. Nombre d'instances, utilisateurs, membres du reseau Orbit9, matchs realises et balance d'unites de temps. Utilisez les raccourcis pour acceder rapidement aux sections les plus utilisees.",
  },
  {
    id: "instances",
    icon: Building2,
    title: "Instances",
    description: "Gestion des instances (tenants) de la plateforme. Chaque instance represente une organisation cliente avec son propre espace de travail. Creez, modifiez ou desactivez des instances. Gerez aussi les verticaux industriels (manufacturier, construction, etc.) et les regions geographiques.",
    godOnly: true,
  },
  {
    id: "users",
    icon: Users,
    title: "Utilisateurs",
    description: "Gestion des utilisateurs de la plateforme. Invitez de nouveaux membres par email, assignez des roles (admin, gestionnaire, membre, invite). Consultez les sessions actives et revoquez l'acces si necessaire. Chaque utilisateur peut avoir des permissions specifiques par departement.",
  },
  {
    id: "packages",
    icon: CreditCard,
    title: "Packages & Offres",
    description: "Configuration des plans d'abonnement et du pricing. Consultez les tiers disponibles (Free, Solo, Direction, C-Suite, Pioneer) avec leurs features et limites. Creez des overrides de prix pour des clients specifiques selon leur type d'acteur (manufacturier, integrateur, etc.) et leur niveau. Suivez l'utilisation des unites de temps (UT).",
  },
  {
    id: "outils",
    icon: Wrench,
    title: "Outils",
    description: "Centre de creation et gestion des outils operationnels. Consultez les playbooks disponibles pour automatiser des processus. Creez et gerez des templates documentaires avec DocForge. Visualisez l'activite recente du protocole COMMAND qui orchestre les missions entre les bots.",
  },
  {
    id: "monitoring",
    icon: Activity,
    title: "Monitoring",
    description: "Surveillance du systeme en temps reel. Verifiez la sante des services (API, PostgreSQL, LiveKit, Nginx, Redis). Consultez les logs de securite (connexions, tentatives echouees, revocations). En mode God, visualisez la distribution des requetes API par tier et les couts associes.",
    godOnly: true,
  },
  {
    id: "reseau",
    icon: Globe,
    title: "Réseau",
    description: "Vue d'ensemble de l'écosystème Orbit9. Indicateurs globaux: nombre de membres, cellules de trisociation, matchs réalisés. Analyse par secteur industriel. Consultez l'activité récente des jumelages entre entreprises.",
  },
  {
    id: "parametres",
    icon: Settings,
    title: "Paramètres",
    description: "Configuration globale du système. Réglez la gouvernance et les règles d'autonomie des 12 bots (de observateur à autopilote). Configurez les connexions API (Google, CRM, ERP, etc.) et testez-les. Suivez la progression de l'onboarding pour chaque étape clé.",
  },
  {
    id: "training",
    icon: Brain,
    title: "Trial-Brain",
    description: "Statistiques d'entraînement du modèle IA propriétaire. Nombre de runs total, actifs et complétés. Meilleur loss atteint. Suivi des missions d'entraînement assignées à Tim (CTO Bot). Consultez les stages de progression de chaque run.",
    godOnly: true,
  },
  {
    id: "telephonie",
    icon: Phone,
    title: "Téléphonie",
    description: "Gestion des communications téléphoniques. Historique des appels entrants et sortants. Codes NIP pour l'authentification téléphonique (chaque utilisateur a un PIN unique). Sessions vocales via LiveKit incluant les appels web et téléphoniques.",
  },
];

// ═══════════════════════════════════════
// FAQ — Questions frequentes avec reponses detaillees
// ═══════════════════════════════════════

const FAQ_ITEMS: FAQEntry[] = [
  {
    q: "Comment inviter un nouvel utilisateur?",
    a: "Allez dans Utilisateurs > Invitations. Entrez l'adresse email et sélectionnez un rôle. L'utilisateur recevra un lien d'invitation par email.",
  },
  {
    q: "Comment creer un nouveau package?",
    a: "L'édition des tiers d'abonnement sera bientôt disponible directement dans Packages & Offres. Pour l'instant, les modifications de prix se font via les overrides de prix.",
  },
  {
    q: "Que signifient les niveaux d'autonomie des bots?",
    a: "Niveau 1 (Observateur): le bot suggère mais n'agit pas. Niveau 2 (Conseiller): le bot recommande des actions. Niveau 3 (Copilote): le bot agit avec confirmation. Niveau 4 (Délégué): le bot agit de façon autonome avec reporting. Niveau 5 (Autopilote): le bot agit en totale autonomie.",
  },
  {
    q: "Comment fonctionne le systeme d'unites de temps (UT)?",
    a: "Chaque plan inclut un nombre d'UT par mois. 1 UT = 1$ CAD. Les requêtes IA consomment des UT selon leur complexité (D1 simple, D2 moyen, D3 complexe). L'usage est visible dans Packages & Offres > Usage UT.",
  },
  {
    q: "Comment tester une connexion API?",
    a: "Allez dans Paramètres > Connexions API. Chaque service a un bouton 'Tester' qui vérifie que la connexion fonctionne. Un indicateur vert confirme le succès.",
  },
  {
    q: "Qu'est-ce qu'une cellule Orbit9?",
    a: "Une cellule regroupe 3 entreprises complémentaires pour de la trisociation: un demandeur, un fournisseur et un catalyseur. Les cellules sont créées automatiquement lors des matchs Orbit9.",
  },
  {
    q: "Comment fonctionne le protocole COMMAND?",
    a: "COMMAND orchestre les missions entre les bots. Il détecte automatiquement les commandes dans les conversations, les dispatche aux bots concernés, et suit l'exécution. Les missions COMMAND sont visibles dans Outils.",
  },
  {
    q: "Que faire si un service est en panne?",
    a: "Vérifiez le Monitoring > Santé système. Si un service est rouge, contactez l'équipe technique. Les services critiques sont API (backend), PostgreSQL (base de données), et LiveKit (vocal/vidéo).",
  },
];

// ═══════════════════════════════════════
// TabAide — Composant principal
// ═══════════════════════════════════════

export function TabAide({ mode, tenantId, onNav }: Props) {
  const [openQ, setOpenQ] = useState<number | null>(null);

  // Filter sections based on mode (godOnly sections hidden for non-god)
  const visibleSections = ADMIN_SECTIONS.filter(
    (s) => !s.godOnly || mode === "god"
  );

  return (
    <div className="space-y-6">
      <TabSectionHeader
        icon={HelpCircle}
        title="Aide"
        subtitle="Guide d'utilisation de l'administration"
        gradient="from-indigo-600 to-indigo-500"
      />

      {/* ══════════════════════════════════════════════
          Section 1 — Guide des sections
          ══════════════════════════════════════════════ */}
      <div>
        <BlockHeader
          icon={HelpCircle}
          title="Guide des sections"
          gradient="from-blue-600 to-blue-500"
          count={visibleSections.length}
        />
        <div className="space-y-2 mt-2">
          {visibleSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.id}
                className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                  <Icon className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">
                    {section.title}
                  </span>
                  {section.godOnly && (
                    <span className="text-[9px] font-medium text-white/70 ml-auto">
                      God Mode
                    </span>
                  )}
                </div>
                <div className="px-3 py-2 space-y-2">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {section.description}
                  </p>
                  <button
                    onClick={() => onNav?.(section.id)}
                    className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                  >
                    Aller <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          Section 2 — FAQ
          ══════════════════════════════════════════════ */}
      <div>
        <BlockHeader
          icon={HelpCircle}
          title="Questions frequentes"
          gradient="from-amber-600 to-amber-500"
          count={FAQ_ITEMS.length}
        />
        <div className="space-y-1 mt-2">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openQ === idx;
            return (
              <Card
                key={idx}
                className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div
                  className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenQ(isOpen ? null : idx)}
                >
                  <span className="text-xs font-medium text-gray-700 flex-1">
                    {item.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  )}
                </div>
                {isOpen && (
                  <div className="px-3 py-2 border-t text-xs text-gray-600 leading-relaxed bg-gray-50/50">
                    {item.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
