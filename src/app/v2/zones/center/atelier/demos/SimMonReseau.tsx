"use client";

/**
 * SimMonReseau.tsx — Simulation Orbit9 Network (B5)
 * 14 stages: profil-reseau → cellules → jumelage → match-detail → trisociation-cellule
 *   → chantiers-reseau → marketplace → dashboard-industrie → evenements → pionniers
 *   → scout-bot → transaction → qualification → recap
 * Self-contained: TopBar, sub-tabs, split-screen 40/60, SBubble/SBtn/AutoAdvance
 */

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Home,
  Building2,
  Users,
  Brain,
  Globe,
  Shield,
  MessageSquare,
  Target,
  CheckCircle2,
  Send,
  Star,
  BarChart3,
  TrendingUp,
  Zap,
  Search,
  ArrowRight,
  Briefcase,
  Award,
  MapPin,
  Factory,
  Handshake,
  Calendar,
  Radio,
  ShoppingBag,
  Compass,
  Layers,
  Network,
  Sparkles,
  Eye,
  ThumbsUp,
  Clock,
  FileText,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";

const UB_BLUE = "#073E5A";

type Stage =
  | "profil-reseau"
  | "cellules"
  | "jumelage"
  | "match-detail"
  | "trisociation-cellule"
  | "chantiers-reseau"
  | "marketplace"
  | "dashboard-industrie"
  | "evenements"
  | "pionniers"
  | "scout-bot"
  | "transaction"
  | "qualification"
  | "recap";

const STAGE_ORDER: Stage[] = [
  "profil-reseau", "cellules", "jumelage", "match-detail", "trisociation-cellule",
  "chantiers-reseau", "marketplace", "dashboard-industrie", "evenements", "pionniers",
  "scout-bot", "transaction", "qualification", "recap",
];

const STAGE_LABELS: Record<Stage, string> = {
  "profil-reseau": "Profil Reseau",
  cellules: "Cellules",
  jumelage: "Jumelage",
  "match-detail": "Detail Match",
  "trisociation-cellule": "Trisociation",
  "chantiers-reseau": "Chantiers Reseau",
  marketplace: "Marketplace",
  "dashboard-industrie": "Industrie",
  evenements: "Evenements",
  pionniers: "Pionniers",
  "scout-bot": "Scout Bot",
  transaction: "Transaction",
  qualification: "Qualification",
  recap: "Recapitulatif",
};

// Mock entreprises reseau
const ENTREPRISES_RESEAU = [
  { nom: "Precitec Automatisation", secteur: "Integrateur", ville: "Laval", score: 92, specialite: "Robots industriels" },
  { nom: "Distribution Boreal", secteur: "Distributeur", ville: "Quebec", score: 87, specialite: "Equipements manufacturing" },
  { nom: "Alimentation Boreal", secteur: "Manufacturier", ville: "Rimouski", score: 85, specialite: "Transformation alimentaire" },
  { nom: "MetalPro Inc.", secteur: "Manufacturier", ville: "Sherbrooke", score: 78, specialite: "Usinage CNC" },
  { nom: "GreenTech Solutions", secteur: "Integrateur", ville: "Montreal", score: 81, specialite: "Automatisation verte" },
];

// Cellules mockees
const CELLULES = [
  { nom: "Cellule Automatisation Alimentaire", membres: 3, type: "manufacturier-integrateur-distributeur", activite: "Haute", color: "border-l-emerald-400" },
  { nom: "Cellule Innovation CNC", membres: 3, type: "manufacturier-integrateur-equipementier", activite: "Moyenne", color: "border-l-blue-400" },
  { nom: "Cellule Logistique Durable", membres: 4, type: "manufacturier-distributeur-transporteur-tech", activite: "Nouvelle", color: "border-l-amber-400" },
];

// Matchs jumelage
const MATCHS = [
  { entreprise: "Precitec Automatisation", score: 92, complementarite: "Excellente", risque: "Faible", raison: "Integrateur robot + votre besoin automatisation usine" },
  { entreprise: "Distribution Boreal", score: 87, complementarite: "Bonne", risque: "Moyen", raison: "Distributeur equipements, canal de vente complementaire" },
  { entreprise: "GreenTech Solutions", score: 81, complementarite: "Moderee", risque: "Faible", raison: "Tech verte, alignement ESG et innovation" },
];

export function SimMonReseau({ onBack }: { onBack?: () => void }) {
  const [stage, setStage] = useState<Stage>("profil-reseau");
  const chatRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);
  const goNext = (s: Stage) => setStage(s);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage]);

  const activeBots = (() => {
    if (["jumelage", "match-detail", "trisociation-cellule"].includes(stage)) return ["CEOB", "CSOB", "CROB"];
    if (stage === "scout-bot") return ["CEOB", "CSOB"];
    if (stage === "transaction" || stage === "qualification") return ["CEOB", "CROB", "CFOB"];
    return ["CEOB"];
  })();

  const chatContent = (
    <div className="space-y-3">
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          <TypewriterText text="Bienvenue dans ton Reseau Orbit9. 130+ manufacturiers connectes au REAI. Je vais te montrer comment le systeme trouve des partenaires, cree des cellules et facilite les transactions." speed={8}
            onComplete={() => si === 0 && setTimeout(() => goNext("cellules"), 2500)} />
          {si === 0 && <AutoAdvance onComplete={() => goNext("cellules")} delay={6000} />}
        </SBubble>
      )}

      {si >= 1 && (
        <SBubble code="CEOB" collapsed={si > 1}>
          <TypewriterText text="Tu as 3 cellules actives. Une cellule, c'est un trio d'entreprises complementaires qui travaillent ensemble: manufacturier + integrateur + distributeur. La magie de la trisociation." speed={8}
            onComplete={() => {}} />
          {si === 1 && <SBtn onClick={() => goNext("jumelage")} icon={Handshake} label="Lancer un jumelage" />}
        </SBubble>
      )}

      {si >= 2 && (
        <SBubble code="CSOB" collapsed={si > 2}>
          <TypewriterText text="J'ai scanne le reseau. 3 matchs potentiels pour toi. Precitec Automatisation est le meilleur: score 92%, integrateur robot, complementarite excellente avec ton besoin d'automatisation usine." speed={8}
            onComplete={() => {}} />
          {si === 2 && <SBtn onClick={() => goNext("match-detail")} icon={Eye} label="Voir le detail du match" />}
        </SBubble>
      )}

      {si >= 3 && (
        <SBubble code="CSOB" collapsed={si > 3}>
          <TypewriterText text="Precitec Automatisation (Laval): 15 employes, specialise en robots industriels, clients dans l'alimentaire et le pharma. VITAA: V=88, I=91, T=75, A=82, A=79. Complementarite elevee sur 4 piliers." speed={8}
            onComplete={() => {}} />
          {si === 3 && <SBtn onClick={() => goNext("trisociation-cellule")} icon={Network} label="Tester en Trisociation" />}
        </SBubble>
      )}

      {si >= 4 && (
        <SBubble code="CEOB" collapsed={si > 4}>
          <TypewriterText text="Session de trisociation en cours: toi (manufacturier), Precitec (integrateur) et Distribution Boreal (distributeur). Nos 3 CarlOS collaborent en temps reel pour trouver des synergies." speed={8}
            onComplete={() => {}} />
          {si === 4 && <SBtn onClick={() => goNext("chantiers-reseau")} icon={Briefcase} label="Chantiers reseau" />}
        </SBubble>
      )}

      {si >= 5 && (
        <SBubble code="CEOB" collapsed={si > 5}>
          <TypewriterText text="2 chantiers collaboratifs cross-entreprises en cours. Le chantier 'Ligne automatisee Phase 2' implique 3 membres de ta cellule. Avancement global: 45%." speed={8}
            onComplete={() => {}} />
          {si === 5 && <SBtn onClick={() => goNext("marketplace")} icon={ShoppingBag} label="Marketplace" />}
        </SBubble>
      )}

      {si >= 6 && (
        <SBubble code="CROB" collapsed={si > 6}>
          <TypewriterText text="Marketplace du reseau: 47 produits/services listes par les membres. J'ai detecte 3 solutions qui repondent directement a tes besoins actuels en automatisation." speed={8}
            onComplete={() => {}} />
          {si === 6 && <SBtn onClick={() => goNext("dashboard-industrie")} icon={TrendingUp} label="Dashboard industrie" />}
        </SBubble>
      )}

      {si >= 7 && (
        <SBubble code="CSOB" collapsed={si > 7}>
          <TypewriterText text="Tendances industrie Quebec: +12% investissements en automatisation, penurie main-d'oeuvre persiste (-8,400 postes), 3 nouveaux programmes de subventions annonces cette semaine." speed={8}
            onComplete={() => {}} />
          {si === 7 && <SBtn onClick={() => goNext("evenements")} icon={Calendar} label="Evenements" />}
        </SBubble>
      )}

      {si >= 8 && (
        <SBubble code="CEOB" collapsed={si > 8}>
          <TypewriterText text="3 evenements reseau a venir: Meetup Automatisation (8 avril), Conference Orbit9 Summit (22 avril), Atelier Jumelage Regional (6 mai). Tu veux t'inscrire?" speed={8}
            onComplete={() => {}} />
          {si === 8 && <SBtn onClick={() => goNext("pionniers")} icon={Award} label="Pionniers" />}
        </SBubble>
      )}

      {si >= 9 && (
        <SBubble code="CEOB" collapsed={si > 9}>
          <TypewriterText text="Les Pionniers: 9 entreprises early adopters qui testent CarlOS. Carl Fugere (Usine Bleue), Marie Tremblay (Precitec), Jean Lavoie (Alimentation Boreal)... Tous ont vu +15% productivite en 3 mois." speed={8}
            onComplete={() => {}} />
          {si === 9 && <SBtn onClick={() => goNext("scout-bot")} icon={Compass} label="Scout Bot" />}
        </SBubble>
      )}

      {si >= 10 && (
        <SBubble code="CSOB" collapsed={si > 10}>
          <TypewriterText text="Scout Bot actif! J'ai detecte une nouvelle entreprise dans le reseau: TechnoSoudure Plus (Trois-Rivieres). Specialisee en soudure robotisee, 22 employes, match potentiel 79% avec toi pour un projet de ligne d'assemblage." speed={8}
            onComplete={() => {}} />
          {si === 10 && <SBtn onClick={() => goNext("transaction")} icon={Handshake} label="Initier une transaction" />}
        </SBubble>
      )}

      {si >= 11 && (
        <SBubble code="CROB" collapsed={si > 11}>
          <TypewriterText text="Transaction initiee avec Precitec Automatisation. Proposition: integration de 2 robots sur ta ligne d'emballage. Valeur estimee: 185,000$. Etape 1: qualification en cours." speed={8}
            onComplete={() => {}} />
          {si === 11 && <SBtn onClick={() => goNext("qualification")} icon={Target} label="Qualification" />}
        </SBubble>
      )}

      {si >= 12 && (
        <SBubble code="CEOB" collapsed={si > 12}>
          <TypewriterText text="Qualification en 5 etapes: Besoin confirme (fait), Budget approuve (Frank valide), Faisabilite technique (Tim analyse), Proposition formelle (en attente), Accord (a venir). On avance bien." speed={8}
            onComplete={() => {}} />
          {si === 12 && <SBtn onClick={() => goNext("recap")} icon={CheckCircle2} label="Recapitulatif" />}
        </SBubble>
      )}

      {si >= 13 && (
        <SBubble code="CEOB" collapsed={false}>
          <TypewriterText text="Resume Orbit9: 3 cellules actives, match Precitec (92%), transaction 185k$ en qualification, Scout Bot actif, 3 evenements a venir. Ton reseau est vivant et en croissance." speed={8}
            onComplete={() => {}} />
        </SBubble>
      )}
    </div>
  );

  function RightContent() {
    switch (stage) {
      case "profil-reseau": return <ContentProfil />;
      case "cellules": return <ContentCellules />;
      case "jumelage": return <ContentJumelage />;
      case "match-detail": return <ContentMatchDetail />;
      case "trisociation-cellule": return <ContentTrisociation />;
      case "chantiers-reseau": return <ContentChantiers />;
      case "marketplace": return <ContentMarketplace />;
      case "dashboard-industrie": return <ContentDashboard />;
      case "evenements": return <ContentEvenements />;
      case "pionniers": return <ContentPionniers />;
      case "scout-bot": return <ContentScout />;
      case "transaction": return <ContentTransaction />;
      case "qualification": return <ContentQualification />;
      case "recap": return <ContentRecap />;
      default: return null;
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden text-[9px]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b">
        <div className="flex items-center gap-2">
          <button onClick={() => onBack ? onBack() : window.history.back()} className="text-gray-400 hover:text-gray-600 cursor-pointer"><ArrowLeft className="h-3.5 w-3.5" /></button>
          <span className="font-bold text-[11px]">Simulation — Mon Reseau Orbit9</span>
        </div>
        <div className="flex items-center gap-1.5">
          {STAGE_ORDER.map((s, i) => (
            <div key={s} className={cn("w-1.5 h-1.5 rounded-full transition-colors", i < si ? "bg-emerald-500" : i === si ? "bg-emerald-600 ring-2 ring-emerald-200" : "bg-gray-200")} title={STAGE_LABELS[s]} />
          ))}
          <button onClick={() => setStage("profil-reseau")} className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400" />

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Chat 40% */}
        <div className="w-[40%] flex flex-col border-r bg-white">
          <div className="h-12 flex items-center px-3 gap-2 text-white shrink-0" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate">Reseau Orbit9</p>
              <p className="text-[8px] opacity-70">GhostX Team — {activeBots.length} bots actifs</p>
            </div>
            <MessageSquare className="h-4 w-4 opacity-60" />
          </div>

          <div className="h-7 flex items-center px-3 gap-2 bg-emerald-50 border-b border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-medium text-emerald-700">Reseau</span>
            <span className="text-[8px] text-emerald-400 ml-auto">{STAGE_LABELS[stage]}</span>
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {chatContent}
          </div>

          <div className="border-t px-3 py-2 flex items-center gap-2">
            <input type="text" placeholder="Chercher dans le reseau..." className="flex-1 text-[9px] bg-gray-50 rounded-full px-3 py-1.5 border outline-none focus:ring-1 focus:ring-emerald-300" readOnly />
            <Send className="h-3.5 w-3.5 text-gray-300" />
          </div>
        </div>

        {/* RIGHT — Content 60% */}
        <div className="w-[60%] flex flex-col overflow-hidden">
          <div className="h-10 flex items-center px-3 gap-1 text-white shrink-0" style={{ backgroundColor: UB_BLUE }}>
            {[
              { icon: Home, label: "Accueil" },
              { icon: Building2, label: "Mon Departement" },
              { icon: Users, label: "Mes Salles" },
              { icon: Brain, label: "Mon Equipe" },
              { icon: Globe, label: "Mon Reseau", active: true },
              { icon: Shield, label: "Admin" },
            ].map(n => (
              <div key={n.label} className={cn(
                "flex items-center gap-1 px-2 py-1 rounded text-[9px] cursor-pointer transition-colors",
                n.active ? "bg-white/20 font-bold" : "opacity-60 hover:opacity-80"
              )}>
                <n.icon className="h-3.5 w-3.5" />{n.label}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 bg-white border-b overflow-x-auto">
            {[
              { label: "Profil", stage: "profil-reseau" as Stage },
              { label: "Cellules", stage: "cellules" as Stage },
              { label: "Jumelage", stage: "jumelage" as Stage },
              { label: "Marketplace", stage: "marketplace" as Stage },
              { label: "Industrie", stage: "dashboard-industrie" as Stage },
              { label: "Evenements", stage: "evenements" as Stage },
              { label: "Pionniers", stage: "pionniers" as Stage },
            ].map(t => (
              <button key={t.label} onClick={() => goNext(t.stage)}
                className={cn("px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer",
                  t.stage === stage || (t.stage === "jumelage" && ["jumelage", "match-detail", "trisociation-cellule"].includes(stage))
                    ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-b">
            <span className="text-[8px] text-gray-400 uppercase tracking-wider font-medium">Actifs:</span>
            {activeBots.map(code => {
              const b = BOT_COLORS[code];
              return b ? (
                <div key={code} className="flex items-center gap-1">
                  <BotAvatar code={code} size="sm" />
                  <span className="text-[9px] font-medium">{b.name}</span>
                </div>
              ) : null;
            })}
          </div>

          <div className="flex-1 overflow-y-auto">
            <RightContent />
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // CONTENT COMPONENTS
  // ═══════════════════════════════════════

  function ContentProfil() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Profil Reseau — Usine Bleue AI</p>
        <div className="bg-white border rounded-xl p-4 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-[11px] font-bold">UB</div>
            <div>
              <p className="text-sm font-bold">Usine Bleue AI</p>
              <p className="text-[9px] text-gray-500">Manufacturier — Services technologiques</p>
              <p className="text-[8px] text-gray-400">Rimouski, QC — 26 ans d'experience</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { pilier: "V", label: "Vente", score: 82, color: "bg-blue-400" },
              { pilier: "I", label: "Idee", score: 91, color: "bg-purple-400" },
              { pilier: "T", label: "Temps", score: 68, color: "bg-amber-400" },
              { pilier: "A", label: "Argent", score: 75, color: "bg-emerald-400" },
              { pilier: "A", label: "Actif", score: 88, color: "bg-red-400" },
            ].map((p, i) => (
              <div key={i} className="text-center">
                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-0.5">
                  <div className={cn("h-1.5 rounded-full", p.color)} style={{ width: `${p.score}%` }} />
                </div>
                <p className="text-[9px] font-bold">{p.score}</p>
                <p className="text-[7px] text-gray-400">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Cellules", val: "3", icon: Network },
            { label: "Matchs", val: "12", icon: Handshake },
            { label: "Transactions", val: "4", icon: Briefcase },
          ].map(k => (
            <div key={k.label} className="bg-white border rounded-lg p-2.5 text-center">
              <k.icon className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
              <p className="text-sm font-bold text-emerald-600">{k.val}</p>
              <p className="text-[7px] text-gray-400">{k.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentCellules() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Cellules Actives — 3</p>
        <div className="space-y-2">
          {CELLULES.map((c, i) => (
            <div key={i} className={cn("bg-white border border-l-2 rounded-xl p-3", c.color)}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-bold">{c.nom}</p>
                <span className={cn("text-[7px] px-2 py-0.5 rounded-full font-medium",
                  c.activite === "Haute" ? "bg-emerald-100 text-emerald-700" : c.activite === "Moyenne" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                )}>{c.activite}</span>
              </div>
              <p className="text-[8px] text-gray-500 mb-2">{c.type}</p>
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[8px] text-gray-500">{c.membres} membres</span>
                <div className="flex -space-x-1 ml-auto">
                  {["CEOB", "CSOB", "CROB"].slice(0, c.membres).map(code => (
                    <BotAvatar key={code} code={code} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-3 w-full text-[8px] bg-emerald-600 text-white py-2 rounded-lg font-bold cursor-pointer hover:bg-emerald-700 flex items-center justify-center gap-1.5">
          <Network className="h-3.5 w-3.5" /> Creer une nouvelle cellule
        </button>
      </div>
    );
  }

  function ContentJumelage() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Jumelage — 3 Matchs Detectes</p>
        <div className="space-y-2">
          {MATCHS.map((m, i) => (
            <div key={i} className="bg-white border rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => i === 0 && goNext("match-detail")}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Factory className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold">{m.entreprise}</p>
                    <p className="text-[8px] text-gray-500">{m.raison}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-bold text-emerald-600">{m.score}%</p>
                  <p className="text-[7px] text-gray-400">Match</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={cn("text-[7px] px-2 py-0.5 rounded-full",
                  m.complementarite === "Excellente" ? "bg-emerald-100 text-emerald-700" : m.complementarite === "Bonne" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                )}>Complementarite: {m.complementarite}</span>
                <span className={cn("text-[7px] px-2 py-0.5 rounded-full",
                  m.risque === "Faible" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>Risque: {m.risque}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentMatchDetail() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Precitec Automatisation — Match 92%</p>
        <div className="bg-white border rounded-xl p-4 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Factory className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[9px] font-bold">Precitec Automatisation</p>
              <p className="text-[8px] text-gray-500">Integrateur — Robots industriels</p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[8px] text-gray-400">Laval, QC — 15 employes</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5 mb-3">
            {[
              { pilier: "V", score: 88, color: "bg-blue-400" },
              { pilier: "I", score: 91, color: "bg-purple-400" },
              { pilier: "T", score: 75, color: "bg-amber-400" },
              { pilier: "A", score: 82, color: "bg-emerald-400" },
              { pilier: "A", score: 79, color: "bg-red-400" },
            ].map((p, i) => (
              <div key={i} className="text-center">
                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-0.5">
                  <div className={cn("h-1.5 rounded-full", p.color)} style={{ width: `${p.score}%` }} />
                </div>
                <p className="text-[9px] font-bold">{p.score}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {[
              { label: "Complementarite", val: "Excellente — couvre 4/5 piliers", color: "text-emerald-600" },
              { label: "Risque", val: "Faible — entreprise etablie 12 ans", color: "text-emerald-600" },
              { label: "Clients communs", val: "2 (alimentaire, pharma)", color: "text-blue-600" },
              { label: "Distance", val: "580 km (remote OK)", color: "text-gray-600" },
            ].map(d => (
              <div key={d.label} className="flex justify-between py-1 border-b last:border-0">
                <span className="text-[8px] text-gray-500">{d.label}</span>
                <span className={cn("text-[8px] font-medium", d.color)}>{d.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 text-[8px] bg-emerald-600 text-white py-2 rounded-lg font-bold cursor-pointer hover:bg-emerald-700">Initier contact</button>
          <button className="flex-1 text-[8px] bg-white border text-gray-600 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-50">Sauvegarder</button>
        </div>
      </div>
    );
  }

  function ContentTrisociation() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Trisociation Cellule — Session Live</p>
        <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold text-emerald-800">Conference AI en cours</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[7px] text-red-600 font-medium">LIVE</span>
            </div>
          </div>
          <div className="flex justify-around">
            {[
              { nom: "Usine Bleue", role: "Manufacturier", code: "CEOB" },
              { nom: "Precitec", role: "Integrateur", code: "CSOB" },
              { nom: "Dist. Boreal", role: "Distributeur", code: "CROB" },
            ].map(p => (
              <div key={p.nom} className="text-center">
                <BotAvatar code={p.code} size="md" />
                <p className="text-[8px] font-bold mt-1">{p.nom}</p>
                <p className="text-[7px] text-gray-500">{p.role}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <p className="text-[9px] font-bold mb-2">Synergies detectees</p>
          {[
            { synergie: "Ligne emballage automatisee", impact: "Haut", valeur: "185,000$" },
            { synergie: "Distribution commune region Est", impact: "Moyen", valeur: "45,000$/an" },
            { synergie: "R&D capteurs qualite", impact: "Haut", valeur: "A evaluer" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[9px]">{s.synergie}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-[7px] px-1.5 py-0.5 rounded-full font-medium",
                  s.impact === "Haut" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                )}>{s.impact}</span>
                <span className="text-[8px] font-bold">{s.valeur}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentChantiers() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Chantiers Collaboratifs</p>
        <div className="space-y-2">
          {[
            { nom: "Ligne automatisee Phase 2", membres: 3, progress: 45, statut: "en-cours", valeur: "185,000$" },
            { nom: "Canal distribution Est du Quebec", membres: 2, progress: 72, statut: "en-cours", valeur: "45,000$/an" },
          ].map((ch, i) => (
            <div key={i} className="bg-white border rounded-xl p-3">
              <div className="flex justify-between mb-2">
                <p className="text-[9px] font-bold">{ch.nom}</p>
                <span className="text-[8px] text-emerald-600 font-bold">{ch.valeur}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[8px] text-gray-500">{ch.membres} entreprises</span>
                <span className={cn("text-[7px] px-1.5 py-0.5 rounded-full font-medium ml-auto",
                  "bg-blue-100 text-blue-700"
                )}>En cours</span>
              </div>
              <div className="flex justify-between text-[8px] text-gray-500 mb-1">
                <span>Avancement</span><span>{ch.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full">
                <div className="h-1.5 bg-emerald-400 rounded-full" style={{ width: `${ch.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentMarketplace() {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold">Marketplace — 47 produits/services</p>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
            <Search className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[8px] text-gray-400">Rechercher...</span>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { nom: "Robot FANUC LR Mate 200iD", fournisseur: "Precitec", prix: "45,000$", cat: "Robotique" },
            { nom: "Systeme convoyeur modulaire", fournisseur: "MetalPro", prix: "28,000$", cat: "Manutention" },
            { nom: "Service integration IoT", fournisseur: "GreenTech", prix: "Sur devis", cat: "Service" },
            { nom: "Capteur qualite vision 3D", fournisseur: "TechnoVision", prix: "8,500$", cat: "Capteurs" },
            { nom: "Formation operateur robot", fournisseur: "Precitec", prix: "3,200$/personne", cat: "Formation" },
          ].map((p, i) => (
            <div key={i} className="bg-white border rounded-lg p-2.5 flex items-center gap-3 cursor-pointer hover:shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold">{p.nom}</p>
                <p className="text-[8px] text-gray-500">{p.fournisseur}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-emerald-600">{p.prix}</p>
                <span className="text-[7px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{p.cat}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentDashboard() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Dashboard Industrie — Quebec</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Investissements auto.", val: "+12%", icon: TrendingUp, color: "text-emerald-600" },
            { label: "Postes vacants", val: "-8,400", icon: Users, color: "text-red-600" },
            { label: "Subventions", val: "3 nouvelles", icon: Zap, color: "text-blue-600" },
          ].map(k => (
            <div key={k.label} className="bg-white border rounded-lg p-2.5 text-center">
              <k.icon className={cn("h-4 w-4 mx-auto mb-1", k.color)} />
              <p className={cn("text-[11px] font-bold", k.color)}>{k.val}</p>
              <p className="text-[7px] text-gray-400">{k.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white border rounded-lg p-3 mb-3">
          <p className="text-[9px] font-bold mb-2">Tendances sectorielles</p>
          {[
            { tendance: "Automatisation alimentaire", direction: "hausse", impact: "+22% demande" },
            { tendance: "Penurie soudeurs qualifies", direction: "critique", impact: "Opportunite robots" },
            { tendance: "Normes ESG manufacturier", direction: "nouveau", impact: "Conformite 2027" },
            { tendance: "IA generative en production", direction: "hausse", impact: "Adoption rapide" },
          ].map((t, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b last:border-0">
              <span className="text-[8px] text-gray-600">{t.tendance}</span>
              <span className={cn("text-[7px] px-1.5 py-0.5 rounded-full font-medium",
                t.direction === "hausse" ? "bg-emerald-100 text-emerald-700" : t.direction === "critique" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
              )}>{t.impact}</span>
            </div>
          ))}
        </div>
        <div className="bg-white border rounded-lg p-3">
          <p className="text-[9px] font-bold mb-2">Nouvelles du reseau</p>
          {[
            { titre: "Precitec remporte le contrat Saputo", date: "28 mars" },
            { titre: "Programme MESI: 50M$ pour l'automatisation", date: "26 mars" },
            { titre: "Nouvelle cellule formee en Beauce", date: "24 mars" },
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b last:border-0 text-[8px]">
              <span className="text-gray-600">{n.titre}</span>
              <span className="text-gray-400">{n.date}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentEvenements() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Evenements Reseau</p>
        <div className="space-y-2">
          {[
            { nom: "Meetup Automatisation Manufacturiere", date: "8 avril 2026", lieu: "Montreal", type: "Meetup", inscrits: 34 },
            { nom: "Orbit9 Summit 2026", date: "22 avril 2026", lieu: "Quebec", type: "Conference", inscrits: 120 },
            { nom: "Atelier Jumelage Regional", date: "6 mai 2026", lieu: "Sherbrooke", type: "Atelier", inscrits: 18 },
          ].map((e, i) => (
            <div key={i} className="bg-white border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-emerald-500" />
                <div className="flex-1">
                  <p className="text-[9px] font-bold">{e.nom}</p>
                  <p className="text-[8px] text-gray-500">{e.date} — {e.lieu}</p>
                </div>
                <span className="text-[7px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{e.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-gray-500">{e.inscrits} inscrits</span>
                <button className="text-[8px] bg-emerald-600 text-white px-3 py-1 rounded-full font-bold cursor-pointer hover:bg-emerald-700">S'inscrire</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentPionniers() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Pionniers — 9 Early Adopters</p>
        <div className="space-y-2">
          {[
            { nom: "Carl Fugere", entreprise: "Usine Bleue AI", gain: "+23% productivite", mois: 4 },
            { nom: "Marie Tremblay", entreprise: "Precitec Auto.", gain: "+18% ventes", mois: 3 },
            { nom: "Jean Lavoie", entreprise: "Alimentation Boreal", gain: "+15% efficacite", mois: 3 },
            { nom: "Pierre Gagnon", entreprise: "MetalPro Inc.", gain: "+12% qualite", mois: 2 },
            { nom: "Anne Bouchard", entreprise: "GreenTech Sol.", gain: "+20% innovation", mois: 2 },
          ].map((p, i) => (
            <div key={i} className="bg-white border rounded-lg p-2.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <Award className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold">{p.nom}</p>
                <p className="text-[8px] text-gray-500">{p.entreprise}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-emerald-600">{p.gain}</p>
                <p className="text-[7px] text-gray-400">{p.mois} mois</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentScout() {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="h-4 w-4 text-emerald-600 animate-spin" style={{ animationDuration: "3s" }} />
          <p className="text-[11px] font-bold">Scout Bot — Detection Proactive</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3">
          <p className="text-[9px] font-bold text-emerald-800 mb-1">Nouveau match detecte!</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Factory className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[9px] font-bold">TechnoSoudure Plus</p>
              <p className="text-[8px] text-gray-500">Trois-Rivieres — 22 employes</p>
              <p className="text-[8px] text-emerald-600">Soudure robotisee — Match 79%</p>
            </div>
          </div>
          <p className="text-[8px] text-emerald-700">Raison du match: expertise en soudure robotisee complementaire a votre projet de ligne d'assemblage. Potentiel de collaboration identifie par CarlOS.</p>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <p className="text-[9px] font-bold mb-2">Historique Scout (30 jours)</p>
          {[
            { entreprise: "Precitec Auto.", score: "92%", date: "Il y a 12j", action: "Contacte" },
            { entreprise: "Dist. Boreal", score: "87%", date: "Il y a 18j", action: "Cellule cree" },
            { entreprise: "TechnoSoudure", score: "79%", date: "Aujourd'hui", action: "Nouveau" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b last:border-0 text-[8px]">
              <span className="text-gray-600">{s.entreprise}</span>
              <span className="font-bold text-emerald-600">{s.score}</span>
              <span className={cn("px-1.5 py-0.5 rounded-full text-[7px] font-medium",
                s.action === "Nouveau" ? "bg-amber-100 text-amber-700" : s.action === "Cellule cree" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
              )}>{s.action}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ContentTransaction() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Transaction — Precitec Automatisation</p>
        <div className="bg-white border rounded-xl p-3 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <Handshake className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-[9px] font-bold">Integration 2 robots ligne emballage</p>
              <p className="text-[8px] text-gray-500">Precitec Automatisation → Usine Bleue AI</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Valeur", val: "185,000$" },
              { label: "Echeancier", val: "4 mois" },
              { label: "Statut", val: "Qualification" },
            ].map(k => (
              <div key={k.label} className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-[9px] font-bold">{k.val}</p>
                <p className="text-[7px] text-gray-400">{k.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {["Match", "Qualification", "Proposition", "Negociation", "Accord"].map((e, i) => (
              <div key={e} className="flex items-center gap-1">
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold",
                  i < 2 ? "bg-emerald-500 text-white" : i === 2 ? "bg-emerald-200 text-emerald-700" : "bg-gray-200 text-gray-400"
                )}>{i + 1}</div>
                {i < 4 && <div className={cn("w-4 h-0.5", i < 1 ? "bg-emerald-400" : "bg-gray-200")} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function ContentQualification() {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold mb-3">Qualification — 5 Etapes</p>
        <div className="space-y-2">
          {[
            { etape: "Besoin confirme", status: "done", detail: "Automatisation emballage = priorite Q2", bot: "CEOB" },
            { etape: "Budget approuve", status: "done", detail: "Frank: budget disponible, ROI 14 mois", bot: "CFOB" },
            { etape: "Faisabilite technique", status: "active", detail: "Tim analyse les specs Precitec", bot: "CTOB" },
            { etape: "Proposition formelle", status: "pending", detail: "En attente de l'analyse technique", bot: "CROB" },
            { etape: "Accord et signature", status: "pending", detail: "Decision finale Carl", bot: "CEOB" },
          ].map((e, i) => {
            const c = BOT_COLORS[e.bot];
            return (
              <div key={i} className={cn("bg-white border rounded-lg p-3", e.status === "active" && "border-emerald-300 bg-emerald-50/30")}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center",
                    e.status === "done" ? "bg-emerald-500" : e.status === "active" ? "bg-emerald-200 animate-pulse" : "bg-gray-200"
                  )}>
                    {e.status === "done" ? <CheckCircle2 className="h-3.5 w-3.5 text-white" /> :
                      <span className="text-[7px] font-bold text-gray-500">{i + 1}</span>}
                  </div>
                  <p className={cn("text-[9px] font-bold", e.status === "done" ? "text-emerald-700" : e.status === "active" ? "text-emerald-800" : "text-gray-400")}>{e.etape}</p>
                  <div className="ml-auto flex items-center gap-1">
                    <BotAvatar code={e.bot} size="sm" />
                    <span className="text-[7px] text-gray-400">{c?.name}</span>
                  </div>
                </div>
                <p className="text-[8px] text-gray-500 ml-7">{e.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function ContentRecap() {
    return (
      <div className="px-4 py-3">
        <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 border-2 border-emerald-200 rounded-xl p-4 text-center mb-3">
          <Globe className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
          <p className="text-sm font-bold text-emerald-900">Session Reseau Terminee</p>
          <p className="text-[9px] text-emerald-600 mt-1">Ton reseau Orbit9 est actif et en croissance</p>
        </div>
        <div className="space-y-2">
          {[
            { icon: Network, label: "3 cellules actives, 9 membres", color: "text-emerald-600" },
            { icon: Handshake, label: "Match Precitec 92% — transaction 185k$ en qualification", color: "text-blue-600" },
            { icon: Compass, label: "Scout Bot actif — TechnoSoudure detecte (79%)", color: "text-amber-600" },
            { icon: Calendar, label: "3 evenements a venir (Meetup, Summit, Atelier)", color: "text-purple-600" },
            { icon: Award, label: "9 pionniers, +15% productivite moyenne", color: "text-amber-600" },
            { icon: ShoppingBag, label: "47 produits/services sur la Marketplace", color: "text-emerald-600" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-2 bg-white border rounded-lg p-2.5">
              <a.icon className={cn("h-3.5 w-3.5 shrink-0", a.color)} />
              <span className="text-[9px]">{a.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button className="flex-1 text-[8px] bg-emerald-600 text-white py-2 rounded-lg font-bold cursor-pointer hover:bg-emerald-700">Retour au Dashboard</button>
          <button className="flex-1 text-[8px] bg-white border text-gray-600 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-50">Voir Mon Departement</button>
        </div>
      </div>
    );
  }
}

// ═══════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════

function SBubble({ code, children, collapsed }: { code: string; children: React.ReactNode; collapsed: boolean }) {
  const bot = BOT_COLORS[code];
  if (!bot) return null;
  if (collapsed) {
    return (
      <div className="flex gap-2 items-center opacity-60">
        <BotAvatar code={code} size="sm" />
        <div className="text-[9px] text-gray-400">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <BotAvatar code={code} size="md" />
      <div className={cn("bg-white border rounded-xl rounded-tl-none px-3 py-2.5 max-w-[88%] shadow-sm border-l-2", bot.border)}>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-[11px] font-semibold", bot.text)}>{bot.name}</span>
          <span className="text-[9px] text-gray-400">{bot.role}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function SBtn({ onClick, icon: Icon, label }: { onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button onClick={onClick}
        className="text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-emerald-600 hover:bg-emerald-700">
        <Icon className="h-3.5 w-3.5" /> {label}
      </button>
    </div>
  );
}

function AutoAdvance({ onComplete, delay }: { onComplete: () => void; delay: number }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, delay);
    return () => clearTimeout(timer);
  }, [onComplete, delay]);
  return null;
}
