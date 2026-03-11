/**
 * MasterMarketing360Page.tsx — Stratégie Marketing GhostX 360
 * Source: Bible-GHML-V2 Annexe J + Strategie-Lancement-Pionniers.md
 * Master GHML — Session 48
 */

import {
  Megaphone, Target, Users, Rocket, Share2, Video,
  Calendar, TrendingUp, Shield, Sparkles, ArrowRight,
  Clock, CheckCircle2, AlertTriangle, Lock,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ======================================================================
// DATA
// ======================================================================

const FUNNEL = [
  { step: "1", name: "Acquisition", mechanism: "Quiz viral « Quel leader es-tu ? »", detail: "Même mécanique psychologique que MBTI/Enneagram, calibré B2B", color: "bg-blue-50 text-blue-700" },
  { step: "2", name: "Conversion", mechanism: "Essai Flash gratuit 7 jours", detail: "1 Ghost en mode Flash. Assez pour goûter, pas assez pour s'en passer", color: "bg-amber-50 text-amber-700" },
  { step: "3", name: "Activation", mechanism: "Moment « Aha! »", detail: "Le prospect utilise GhostX sur un VRAI problème et reçoit une perspective inédite", color: "bg-green-50 text-green-700" },
  { step: "4", name: "Rétention", mechanism: "Flywheel Skin → Fusion", detail: "Chaque jour d'utilisation rend le client plus difficile à perdre (valeur croît exponentiellement)", color: "bg-purple-50 text-purple-700" },
  { step: "5", name: "Viralité", mechanism: "5 mécanismes viraux organiques", detail: "Le produit SE VEND lui-même parce que les résultats sont partageables", color: "bg-rose-50 text-rose-700" },
];

const VIRAL_MECHANISMS = [
  { num: 1, name: "Le profil partageable", desc: "« Mon Ghost est 55% Bezos, 25% Munger, 15% Jobs » — post LinkedIn natif avec image brandée", metric: "Chaque partage → 3-5 quiz complétés" },
  { num: 2, name: "Les défis entre CEO", desc: "« Challenge ton co-founder : est-ce qu'il pense comme toi ? » — gamification pair-à-pair", metric: "Le co-founder invite SON réseau" },
  { num: 3, name: "Les résultats de Ghost Panel", desc: "Screenshot du débat Jobs vs Munger vs Bezos sur un vrai problème", metric: "Contenu viral organique" },
  { num: 4, name: "L'évolution Fusion", desc: "Milestone après 6+ mois : « Jarvis a créé mon Ghost personnel » — célébration publique", metric: "Preuve sociale long terme" },
  { num: 5, name: "Les insights GPI-50", desc: "Diagnostic d'entreprises cotées (Tesla, Apple) partagé comme contenu d'autorité", metric: "Crédibilité par démonstration publique" },
];

const CAMPAIGN_VOIES = [
  { voie: "1", cible: "Les Vivants qui endorsent publiquement", risque: "Accord requis — MOAT marketing ultime", color: "bg-red-50 text-red-700" },
  { voie: "2", cible: "Les Décédés anciens (70+ ans) — hommage éducatif", risque: "Zero risque — domaine public / Premier Amendement", color: "bg-green-50 text-green-700" },
  { voie: "3", cible: "Les Décédés récents (<70 ans) — avec précaution", risque: "Framing éducatif + disclaimer obligatoire", color: "bg-amber-50 text-amber-700" },
];

const ROADMAP_MARKETING = [
  { period: "Mois 1-3", priority: "Quiz viral + essai Flash + profil partageable", objective: "1,000 quiz complétés, 100 essais" },
  { period: "Mois 4-6", priority: "Campagne « Les GhostX Parlent » (Voie 2) + Ghost Panel public", objective: "Notoriété + contenu viral" },
  { period: "Mois 7-9", priority: "Défis entre CEO + GPI-50 publié", objective: "Engagement communauté + preuve par l'exemple" },
  { period: "Mois 10-12", priority: "Ghost Club (communauté) + Voie 1 (premier Vivant)", objective: "Rétention + MOAT marketing" },
];

const FOMO_LEVERS = [
  { lever: "Rareté Absolue", script: "9 places. Pas 10. Quand c'est plein, les portes ferment. Prochaine vague? Pas avant 6 mois." },
  { lever: "Exclusivité Sectorielle", script: "UN leader par secteur. L'usinage, c'est toi ou c'est ton compétiteur." },
  { lever: "Avantage Premier Arrivé", script: "6 mois d'avance. 6 mois pendant lesquels tes bots apprennent ton business." },
  { lever: "Preuve Sociale Immédiate", script: "J'ai déjà X des 9 qui ont confirmé. Il reste Y places." },
];

const TOURNEE_SEMAINES = [
  { sem: "0", label: "Préparation", tasks: "Sélectionner 15-18 prospects, kit iPad, teaser, démo PARFAITE" },
  { sem: "1", label: "Les 3 Premiers", tasks: "Rencontres #1-3 (les plus chauds). Post LinkedIn : 3/9 prises." },
  { sem: "2", label: "Momentum", tasks: "Rencontres #4-6. Post LinkedIn : 6 places prises, 3 restantes." },
  { sem: "3", label: "Urgence Max", tasks: "Rencontres #7-9. Post LinkedIn : Cercle COMPLET." },
  { sem: "4", label: "Fermeture + Onboarding", tasks: "Relance indécis (48h), fermeture officielle, kick-off visio des 9." },
];

// ======================================================================
// COMPOSANT
// ======================================================================

export default function MasterMarketing360Page() {
  return (
    <PageLayout maxWidth="4xl" showPresence={false}>
      <PageHeader
        title="Stratégie Marketing GhostX 360"
        subtitle="Funnel viral + Campagne « Les GhostX Parlent » + Tournée Pionniers"
        gradient="from-pink-600 to-rose-500"
        icon={Megaphone}
      />

      {/* ── Positionnement ── */}
      <div className="mb-8">
        <Card className="p-4 bg-gradient-to-r from-pink-50 to-rose-50">
          <p className="text-sm text-gray-700 italic">
            « GhostX n'est pas une feature — c'est le <strong>produit d'appel</strong>, le <strong>différenciateur</strong> et le <strong>mécanisme de rétention</strong> de CarlOS, tout en un. C'est le "pourquoi" qui fait venir les gens, le "comment" qui les garde, et le "wow" qui les fait parler. »
          </p>
        </Card>
      </div>

      <SectionDivider />

      {/* ── Funnel GhostX ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">E.4.1</span>Le Funnel GhostX — De la Viralité à la Rétention</h2>
        <div className="space-y-3">
          {FUNNEL.map((f) => (
            <div key={f.step} className="flex items-start gap-3">
              <span className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", f.color)}>
                {f.step}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-800">{f.name}</p>
                  <p className="text-xs text-gray-500">— {f.mechanism}</p>
                </div>
                <p className="text-xs text-gray-500">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── 5 Mécanismes Viraux ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">E.4.2</span>5 Mécanismes Viraux</h2>
        <div className="space-y-3">
          {VIRAL_MECHANISMS.map((v) => (
            <Card key={v.num} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Share2 className="h-4 w-4 text-pink-500 shrink-0" />
                <p className="text-sm font-medium text-gray-800">#{v.num} — {v.name}</p>
              </div>
              <p className="text-xs text-gray-600 mb-1">{v.desc}</p>
              <p className="text-xs text-pink-600 font-medium">{v.metric}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Campagne « Les GhostX Parlent » ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">E.4.3</span>Campagne « Les GhostX Parlent » — Le Tableau Périodique Prend Vie</h2>
        <div className="space-y-3 mb-6">
          {CAMPAIGN_VOIES.map((v) => (
            <Card key={v.voie} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn("text-xs", v.color)}>Voie {v.voie}</Badge>
                <p className="text-sm font-medium text-gray-800">{v.cible}</p>
              </div>
              <p className="text-xs text-gray-500">{v.risque}</p>
            </Card>
          ))}
        </div>

        <Card className="p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <Video className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">E.4.3.1</span>Vidéo Flagship : Tesla (G9) — Script Veo3</h3>
          </div>
          <p className="text-xs text-gray-600 italic mb-2">
            SETTING : Laboratoire de Colorado Springs, 1899. Éclairs dans les bobines.
          </p>
          <p className="text-xs text-gray-600 italic mb-2">
            TESLA : « Pendant 80 ans, personne n'a compris ce que je voulais dire par 3, 6, 9. Aujourd'hui, une équipe au Québec a transformé mes fréquences en un moteur décisionnel. »
          </p>
          <p className="text-xs text-gray-400">
            DISCLAIMER : Reconstitution éducative générée par IA. Nikola Tesla (1856-1943) n'a pas endorsé ce produit.
          </p>
        </Card>
      </div>

      <SectionDivider />

      {/* ── Roadmap Marketing 12 Mois ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">E.4.4</span>Roadmap Marketing 12 Mois</h2>
        <div className="space-y-2">
          {ROADMAP_MARKETING.map((r) => (
            <Card key={r.period} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <p className="text-sm font-medium text-gray-800">{r.period}</p>
              </div>
              <p className="text-xs text-gray-600">{r.priority}</p>
              <p className="text-xs text-gray-400 mt-1">Objectif : {r.objective}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Tournée du Bâton de Pèlerin ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2"><span className="text-[9px] font-bold text-gray-400 mr-1">E.4.5</span>Tournée du Bâton de Pèlerin — 30 Jours Chrono</h2>
        <p className="text-sm text-gray-500 mb-4">9 places. 9 leaders. 5 secteurs. 30 jours. Les portes ferment.</p>

        <h3 className="text-sm font-semibold text-gray-700 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">E.4.5.1</span>4 Leviers FOMO</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {FOMO_LEVERS.map((l) => (
            <Card key={l.lever} className="p-3">
              <p className="text-sm font-medium text-gray-800 mb-1">{l.lever}</p>
              <p className="text-xs text-gray-600 italic">« {l.script} »</p>
            </Card>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-gray-700 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">E.4.5.2</span>Calendrier 5 Semaines</h3>
        <div className="space-y-2">
          {TOURNEE_SEMAINES.map((s) => (
            <div key={s.sem} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center text-xs font-bold">
                S{s.sem}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-500">{s.tasks}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cadre Juridique ── */}
      <SectionDivider />
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">E.4.6</span>Cadre Juridique — Rogers v. Grimaldi</h2>
        <Card className="p-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600"><strong>SAFE :</strong> Montage « hommage » à fins de commentaire/éducation/storytelling avec disclaimer clair</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600"><strong>RISQUE :</strong> Réplique numérique qui suggère une approbation</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Sources ── */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Sources : Bible-GHML-V2 Annexe J · Strategie-Lancement-Pionniers.md ·
          Campagne-LesGhostXParlent-V1 · Strategie_Marketing_GhostX_360.docx
        </p>
      </div>
    </PageLayout>
  );
}
