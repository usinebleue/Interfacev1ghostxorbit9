/**
 * MasterAnglesMortsPage.tsx — 13 Angles Morts & Analyse de Risques
 * Source: Modele-Affaires-GhostX.md + Reponse-Strategique-Audit-Hostile.md
 * Master GHML — Session 48
 */

import {
  AlertTriangle, Shield, Scale, Lock, Server, DollarSign,
  Clock, Users, Zap, Swords, Database, Globe, Activity,
  MessageSquare, CheckCircle2, ArrowRight, FileText,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ======================================================================
// DATA — 13 Angles Morts
// ======================================================================

const ANGLES_MORTS: {
  id: string; title: string; icon: React.ElementType; impact: string;
  impactColor: string; prob: string; probColor: string; priorite: string;
  prioriteColor: string; desc: string; actions: string[];
}[] = [
  {
    id: "AM-01", title: "Responsabilite Legale", icon: Scale,
    impact: "Critique", impactColor: "red", prob: "Moyenne", probColor: "amber",
    priorite: "P0", prioriteColor: "red",
    desc: "Conseil IA menant a une mauvaise decision financiere ou strategique. Risque de poursuite.",
    actions: ["Avocat specialise IA + contrats", "Disclaimers 'outil aide a la decision'", "Assurance E&O professionnelle"],
  },
  {
    id: "AM-02", title: "Confidentialite & Loi 25", icon: Lock,
    impact: "Critique", impactColor: "red", prob: "Moyenne", probColor: "amber",
    priorite: "P0", prioriteColor: "red",
    desc: "Donnees financieres sensibles transitant par API tierces. Loi 25 Quebec exige EFVP + consentement journalise.",
    actions: ["Hebergement QC (OVH Montreal)", "DPA avec tous les fournisseurs API", "Chiffrement AES-256 au repos + TLS en transit"],
  },
  {
    id: "AM-03", title: "Dependance API", icon: Server,
    impact: "Eleve", impactColor: "red", prob: "Faible", probColor: "emerald",
    priorite: "P1", prioriteColor: "amber",
    desc: "Google ou Anthropic change ses prix ou conditions. Le routage 5 tiers mitigue partiellement.",
    actions: ["3e fournisseur backup (Groq/Mistral)", "Routage multi-provider actif", "Plan souverainete 6 mois: 100% local"],
  },
  {
    id: "AM-04", title: "Cout d'Acquisition (CAC)", icon: DollarSign,
    impact: "Eleve", impactColor: "red", prob: "Elevee", probColor: "red",
    priorite: "P1", prioriteColor: "amber",
    desc: "CAC estime 2,800$ — peut grimper si le canal reseau REAI ne convertit pas comme prevu.",
    actions: ["Budget marketing defini", "Canal REAI = warm leads", "Orbit9 effet domino = CAC 0$ Gen 2+"],
  },
  {
    id: "AM-05", title: "Churn (Resiliation)", icon: Users,
    impact: "Eleve", impactColor: "red", prob: "Moyenne", probColor: "amber",
    priorite: "P1", prioriteColor: "amber",
    desc: "PME volatiles — risque de perception 'jouet'. Un 5% churn mensuel = 46% perte annuelle.",
    actions: ["Contrats annuels avec rabais", "Quick Wins en 72h", "Valeur demontree mensuellement (rapports ROI)"],
  },
  {
    id: "AM-06", title: "Onboarding Lent", icon: Clock,
    impact: "Moyen", impactColor: "amber", prob: "Moyenne", probColor: "amber",
    priorite: "P2", prioriteColor: "blue",
    desc: "Si le client ne voit pas de valeur en 72h, il decroche. L'onboarding doit etre quasi-instantane.",
    actions: ["Quick Win < 24h (premier diagnostic gratuit)", "Templates pre-remplis", "3 modes: Solo/Transition/Full C-Suite"],
  },
  {
    id: "AM-07", title: "Support Client Humain", icon: MessageSquare,
    impact: "Moyen", impactColor: "amber", prob: "Certaine", probColor: "red",
    priorite: "P2", prioriteColor: "blue",
    desc: "Meme avec IA, les PME veulent parler a un humain quand ca bloque. Projections: 1er hire a 30 clients.",
    actions: ["Carl = support 0-30 clients", "1er hire Customer Success a 30 clients", "Chatbot FAQ + ticket system a 100 clients"],
  },
  {
    id: "AM-08", title: "Heavy Users (Variabilite)", icon: Activity,
    impact: "Moyen", impactColor: "amber", prob: "Moyenne", probColor: "amber",
    priorite: "P2", prioriteColor: "blue",
    desc: "Top 10% des users consomment 5x plus d'API. Cout peut depasser le revenu.",
    actions: ["Monitoring par client", "Fair Use Policy", "Tier 0 cache agressif pour repetitions"],
  },
  {
    id: "AM-09", title: "Competition BigTech", icon: Swords,
    impact: "Faible", impactColor: "emerald", prob: "Faible", probColor: "emerald",
    priorite: "P3", prioriteColor: "gray",
    desc: "ChatGPT, Gemini pourraient lancer des agents business. Mais generiques, pas specialises PME QC.",
    actions: ["GHML = moat cognitif defensif", "Positionnement QC/francophone", "Network effects Orbit9 = lock-in"],
  },
  {
    id: "AM-10", title: "Propriete des Donnees", icon: Database,
    impact: "Faible", impactColor: "emerald", prob: "Faible", probColor: "emerald",
    priorite: "P3", prioriteColor: "gray",
    desc: "Clients doivent pouvoir exporter et supprimer leurs donnees a tout moment.",
    actions: ["Export JSON/PDF inclus", "Suppression sur demande", "Clauses claires dans CGV"],
  },
  {
    id: "AM-11", title: "Monnaie & Fiscalite", icon: Globe,
    impact: "Faible", impactColor: "emerald", prob: "Faible", probColor: "emerald",
    priorite: "P3", prioriteColor: "gray",
    desc: "Facturation CAD uniquement au debut. TPS/TVQ applicables.",
    actions: ["CAD + TPS/TVQ standard", "Stripe Billing", "Expansion USD au Canada anglais"],
  },
  {
    id: "AM-12", title: "Disponibilite & SLA", icon: Activity,
    impact: "Moyen", impactColor: "amber", prob: "Faible", probColor: "emerald",
    priorite: "P3", prioriteColor: "gray",
    desc: "Un crash de 2h = perte de confiance. SLA 99.5% vise.",
    actions: ["2e serveur VPS a 50 clients", "Health monitoring automatise", "Incident response < 30 min"],
  },
  {
    id: "AM-13", title: "Dependance Telegram (Resolue)", icon: MessageSquare,
    impact: "Faible", impactColor: "emerald", prob: "Faible", probColor: "emerald",
    priorite: "P3", prioriteColor: "gray",
    desc: "Initialement 100% Telegram. Maintenant web app live = canal principal.",
    actions: ["Frontend web = canal principal (DONE)", "Telegram = canal secondaire", "Mobile app planifiee"],
  },
];

const PRE_LAUNCH: { priorite: string; color: string; items: string[] }[] = [
  {
    priorite: "P0 — Avant de vendre",
    color: "red",
    items: [
      "Avocat IA/tech — conditions d'utilisation + disclaimers",
      "Assurance E&O professionnelle",
      "Stripe/facturation + TPS/TVQ",
      "DPA avec Anthropic, Google, ElevenLabs",
    ],
  },
  {
    priorite: "P1 — Avant 10 clients",
    color: "amber",
    items: [
      "Monitoring API par client",
      "Template pitch + deck + one-pager",
      "Onboarding VIP pipeline (< 72h)",
      "Canal support (email + calendly)",
    ],
  },
  {
    priorite: "P2 — Avant 30 clients",
    color: "blue",
    items: [
      "Hire #1 Customer Success",
      "SLA 99.5% + 2e serveur",
      "Fair Use Policy documentee",
      "Rapports ROI mensuels automatises",
    ],
  },
];

// ======================================================================
// MAIN COMPONENT
// ======================================================================

export function MasterAnglesMortsPage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={AlertTriangle}
          iconColor="text-rose-600"
          title="Angles Morts & Risques"
          subtitle="13 angles morts identifies, matrice de priorite, checklist pre-lancement"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* PRINCIPE FONDAMENTAL */}
      <Card className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-0 shadow-md">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">Principe Fondamental</div>
            <p className="text-xs text-gray-300 leading-relaxed">
              NOTHING IS FINAL — GhostX est un architecte, pas un batisseur. Chaque output est un brouillon structure
              qui aide a la decision, pas un conseil definitif. C'est la protection legale fondamentale.
            </p>
          </div>
        </div>
      </Card>

      <SectionDivider />

      {/* MATRICE SYNTHESE */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">G.1.1</span>Matrice de Priorite — Vue d'Ensemble</h3>
        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[60px_1fr_70px_70px_50px] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-500 uppercase">#</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Angle Mort</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Impact</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Prob.</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Prio</span>
          </div>
          <div className="divide-y divide-gray-50">
            {ANGLES_MORTS.map((am) => (
              <div key={am.id} className="grid grid-cols-[60px_1fr_70px_70px_50px] gap-2 px-4 py-2.5 items-center">
                <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-[9px] w-fit">{am.id}</Badge>
                <span className="text-xs text-gray-700 font-medium">{am.title}</span>
                <Badge className={cn("text-[9px] w-fit", `bg-${am.impactColor}-100 text-${am.impactColor}-700 border-${am.impactColor}-200`)}>{am.impact}</Badge>
                <Badge className={cn("text-[9px] w-fit", `bg-${am.probColor}-100 text-${am.probColor}-700 border-${am.probColor}-200`)}>{am.prob}</Badge>
                <Badge className={cn("text-[9px] w-fit font-bold", `bg-${am.prioriteColor}-100 text-${am.prioriteColor}-700 border-${am.prioriteColor}-200`)}>{am.priorite}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* DETAIL — 13 Angles Morts */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">G.1.2</span>Detail — 13 Angles Morts</h3>
        <div className="space-y-3">
          {ANGLES_MORTS.map((am) => {
            const Icon = am.icon;
            return (
              <Card key={am.id} className="p-4 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", `bg-${am.prioriteColor}-100`)}>
                    <Icon className={cn("h-4 w-4", `text-${am.prioriteColor}-600`)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-[9px]">{am.id}</Badge>
                      <span className="text-sm font-bold text-gray-800">{am.title}</span>
                      <Badge className={cn("text-[9px] ml-auto", `bg-${am.prioriteColor}-100 text-${am.prioriteColor}-700 border-${am.prioriteColor}-200`)}>{am.priorite}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 leading-relaxed">{am.desc}</p>
                    <div className="space-y-1">
                      {am.actions.map((action) => (
                        <div key={action} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="text-[9px] text-gray-600">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* CHECKLIST PRE-LANCEMENT */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">G.1.3</span>Checklist Pre-Lancement</h3>
        <div className="space-y-3">
          {PRE_LAUNCH.map((group) => (
            <Card key={group.priorite} className={cn("p-4 bg-white border shadow-sm", `border-${group.color}-200`)}>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={cn("text-[9px] font-bold", `bg-${group.color}-100 text-${group.color}-700 border-${group.color}-200`)}>{group.priorite}</Badge>
              </div>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <ArrowRight className={cn("h-3.5 w-3.5 shrink-0", `text-${group.color}-400`)} />
                    <span className="text-xs text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* POSITIONNEMENT VS ALADDIN */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">G.1.4</span>Positionnement Strategique vs Aladdin</h3>
        <Card className="p-4 bg-blue-50 border border-blue-100 shadow-sm mb-3">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-bold">GhostX = System of Reasoning</span> (aide a la decision) vs Aladdin = System of Record (gestion de portefeuille).
              GhostX est un <span className="font-bold">copilote complementaire du mid-market</span>, pas un concurrent d'Aladdin.
            </p>
          </div>
        </Card>
        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[120px_1fr_1fr] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-500 uppercase">Critere</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Aladdin (BlackRock)</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">GhostX</span>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { critere: "Cible", aladdin: "Grands fonds (1G$+)", ghostx: "PME + fonds mid-market" },
              { critere: "Prix", aladdin: "1-5M$/an", ghostx: "6K-600K$/an" },
              { critere: "Focus", aladdin: "Gestion de risque", ghostx: "Intelligence decisionnelle" },
              { critere: "Deploiement", aladdin: "6-12 mois", ghostx: "< 72h" },
              { critere: "Langue", aladdin: "Anglais", ghostx: "Francais QC natif" },
              { critere: "IA", aladdin: "Modeles proprietaires", ghostx: "GHML + multi-LLM (5 tiers)" },
            ].map((row) => (
              <div key={row.critere} className="grid grid-cols-[120px_1fr_1fr] gap-2 px-4 py-2.5 items-center">
                <span className="text-[9px] font-bold text-gray-500">{row.critere}</span>
                <span className="text-xs text-gray-600">{row.aladdin}</span>
                <span className="text-xs text-gray-700 font-medium">{row.ghostx}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* 6 PATTERNS GHML VALIDES */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1"><span className="text-[9px] font-bold text-gray-400 mr-1">G.1.5</span>6 Patterns GHML Valides au Combat</h3>
        <p className="text-xs text-gray-400 mb-4">Proposes suite a l'audit hostile Deep Think, valides par Carl.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { code: "L-01", name: "Antitrust Firewall", desc: "Protection anti-cartel dans les cercles Orbit9" },
            { code: "F-02", name: "Friction Temporelle", desc: "Delai obligatoire avant decisions critiques" },
            { code: "P-09", name: "Mandat Statutaire", desc: "Chaque bot documente ses limites de competence" },
            { code: "O-01", name: "Opportunite Asymetrique", desc: "Detection d'opportunites a faible risque / haut gain" },
            { code: "D-03", name: "Score Confiance Donnees", desc: "Chaque donnee porte son niveau de fiabilite" },
            { code: "A-04", name: "Fatigue d'Alerte", desc: "Anti-pattern: ne pas noyer l'utilisateur d'alertes" },
          ].map((p) => (
            <Card key={p.code} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-[9px] font-mono">{p.code}</Badge>
                <span className="text-xs font-bold text-gray-800">{p.name}</span>
              </div>
              <p className="text-[9px] text-gray-500">{p.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* SOURCES */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">G.1.6</span>Documents Source</h3>
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-2">
            {[
              { name: "Modele-Affaires-GhostX.md", desc: "13 Angles Morts, cout/client, projections" },
              { name: "Reponse-Strategique-Audit-Hostile.md", desc: "6 patterns GHML, narratifs corriges, pitch LP" },
              { name: "MEGA-PROMPT-DEEP-THINK-360.md", desc: "Framework audit 6 volets, 7 tests, recalibration" },
              { name: "Audit-Deep-Think-V2-Logique-GHML.md", desc: "Critique cognitive, Lazy Loading, Shadow Debate" },
            ].map((doc) => (
              <div key={doc.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <code className="text-[9px] font-mono text-gray-700">{doc.name}</code>
                <span className="text-[9px] text-gray-400">— {doc.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
