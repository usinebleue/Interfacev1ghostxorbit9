/**
 * Orbit9Blueprint.tsx — Blueprint Collaboration V3 (DocForge)
 *
 * Pattern: COPIE de BlueprintView.tsx (sidebar w-[180px] + contenu par section)
 * 11 sections: Vue consolidée → Profil → Capacités → Cellules → VITAAFAST →
 *              Gouvernance → Rôles → TimeTokens → Pionniers → Croissance → Sortie
 *
 * Utilisé par: Orbit9View (o9Section === "blueprint")
 */

import { useState } from "react";
import {
  BarChart3, UserCircle, Package, Atom, Activity, Shield, Users,
  Coins, Rocket, TrendingUp, LogOut, AlertTriangle,
  Building2, MapPin, Award, Eye, Zap, Scale,
  Network, Crown, FileCheck, Clock, CheckCircle2,
  Handshake, Target, MessageCircle, Vote, Layers, Search,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { SF } from "../../core/styles";
import { O9ScoreBar, PionnierDot } from "./orbit9-helpers";
import { O9_PIONNIERS } from "./orbit9-data";
import { BOT_AVATAR_MAP } from "../shared/dept-data";
import { LivingHero } from "../shared/LivingHero";

// ═══ Sidebar config ═══

const BP_SIDEBAR: ({ id: string; label: string; icon: React.ElementType; count?: string } | null)[] = [
  { id: "vue-consolidee", label: "Vue consolidée", icon: BarChart3 },
  { id: "profil", label: "Mon profil réseau", icon: UserCircle },
  { id: "capacites", label: "Capacités & Offres", icon: Package },
  null,
  { id: "cellules", label: "Cellules", icon: Atom, count: "4" },
  { id: "jumelage", label: "Jumelage", icon: Handshake, count: "4" },
  { id: "vitaa-faas", label: "VITAA FAAS", icon: Activity },
  null,
  { id: "gouvernance", label: "Gouvernance & Rôles", icon: Shield },
  { id: "timetokens", label: "TimeTokens", icon: Coins },
  null,
  { id: "pionniers", label: "Pionniers & Croissance", icon: Rocket, count: "5/9" },
];

// ═══ Helper — Card avec header UB pastel (Pattern EXACT CockpitView) ═══

function BPCard({ icon: Icon, title, badge, badgeColor, children }: {
  icon: React.ElementType; title: string; badge?: string; badgeColor?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
        <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <span className="text-sm font-bold text-gray-900 flex-1">{title}</span>
        {badge && <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0", badgeColor || "bg-cyan-50 text-cyan-700")}>{badge}</span>}
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

// ═══ COMPOSANT PRINCIPAL ═══

export function Orbit9Blueprint() {
  const [activeSection, setActiveSection] = useState("vue-consolidee");

  return (
    <div className="space-y-4">
      {/* Hero animé — Blueprint Collaboration */}
      <LivingHero blur1="bg-cyan-100/70" blur2="bg-teal-100/60" subtitleColor="text-cyan-600" subtitle="Blueprint Réseau" title="Votre stratégie collaborative." description="Profil, cellules, gouvernance et croissance réseau."
        footer={
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold text-gray-500">Complétion</span>
            <div className="flex-1 h-2 bg-gray-200/60 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full transition-all duration-700" style={{ width: "35%" }} />
            </div>
            <span className="text-[10px] font-bold text-cyan-600">35%</span>
          </div>
        }>
        <div className="relative flex items-center justify-center overflow-visible" style={{ width: 340, height: 160 }}>
          <svg viewBox="0 0 240 140" className="overflow-visible" style={{ width: 300, height: 180 }}>
            {/* Noeud racine */}
            <rect x="95" y="10" width="50" height="24" rx="8" className="org-node anim-org-root" />
            <text x="120" y="26" textAnchor="middle" className="text-[8px] font-bold fill-gray-700">Blueprint</text>
            {/* Ligne verticale descendante */}
            <line x1="120" y1="34" x2="120" y2="55" stroke="#38bdf8" strokeWidth="2" opacity="0.4" />
            <rect x="119" y="34" width="2" height="21" fill="url(#bp-flow-v)" className="anim-org-line-vert" />
            {/* Ligne horizontale */}
            <line x1="40" y1="55" x2="200" y2="55" stroke="#38bdf8" strokeWidth="1.5" opacity="0.3" />
            <rect x="40" y="54" width="160" height="2" fill="url(#bp-flow-h)" className="anim-org-line-hor" />
            {/* Noeuds enfants */}
            <rect x="15" y="62" width="50" height="22" rx="6" className="org-node anim-org-child-1" />
            <text x="40" y="77" textAnchor="middle" className="text-[7px] fill-gray-600">Profil</text>
            <rect x="95" y="62" width="50" height="22" rx="6" className="org-node anim-org-child-2" />
            <text x="120" y="77" textAnchor="middle" className="text-[7px] fill-gray-600">Cellules</text>
            <rect x="175" y="62" width="50" height="22" rx="6" className="org-node anim-org-child-3" />
            <text x="200" y="77" textAnchor="middle" className="text-[7px] fill-gray-600">VITAA</text>
            {/* Sous-noeuds */}
            <line x1="40" y1="84" x2="40" y2="100" stroke="#38bdf8" strokeWidth="1" opacity="0.25" />
            <circle cx="40" cy="105" r="8" fill="rgba(56,189,248,0.1)" stroke="#38bdf8" strokeWidth="0.75" />
            <text x="40" y="108" textAnchor="middle" className="text-[5px] fill-cyan-600">87%</text>
            <line x1="120" y1="84" x2="120" y2="100" stroke="#38bdf8" strokeWidth="1" opacity="0.25" />
            <circle cx="120" cy="105" r="8" fill="rgba(56,189,248,0.1)" stroke="#38bdf8" strokeWidth="0.75" />
            <text x="120" y="108" textAnchor="middle" className="text-[5px] fill-cyan-600">4</text>
            <line x1="200" y1="84" x2="200" y2="100" stroke="#38bdf8" strokeWidth="1" opacity="0.25" />
            <circle cx="200" cy="105" r="8" fill="rgba(56,189,248,0.1)" stroke="#38bdf8" strokeWidth="0.75" />
            <text x="200" y="108" textAnchor="middle" className="text-[5px] fill-cyan-600">8.4</text>
            <defs>
              <linearGradient id="bp-flow-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity="0" /><stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" /><stop offset="100%" stopColor="#38bdf8" stopOpacity="0" /></linearGradient>
              <linearGradient id="bp-flow-h" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#38bdf8" stopOpacity="0" /><stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" /><stop offset="100%" stopColor="#38bdf8" stopOpacity="0" /></linearGradient>
            </defs>
          </svg>
        </div>
      </LivingHero>

      <div className="flex gap-3">
      {/* Sidebar w-[180px] — Pattern BlueprintView */}
      <div className={SF.sidebarW}>
        {BP_SIDEBAR.map((item, idx) => {
          if (!item) return <div key={`sep-${idx}`} className={SF.separator} />;
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button key={item.id} type="button" onClick={() => setActiveSection(item.id)}
              className={cn(SF.btnBase, isActive ? SF.btnActive : SF.btnInactive)}>
              <Icon className={cn(isActive ? SF.iconActive : SF.iconInactive)} />
              <span className={cn(isActive ? SF.labelActive : SF.labelInactive)}>{item.label}</span>
              {item.count && <span className="text-[9px] text-gray-400">{item.count}</span>}
            </button>
          );
        })}
      </div>

      {/* Contenu dynamique */}
      <div className={SF.content}>
        {activeSection === "vue-consolidee" && <SectionVueConsolidee />}
        {activeSection === "profil" && <SectionProfil />}
        {activeSection === "capacites" && <SectionCapacites />}
        {activeSection === "cellules" && <SectionCellules />}
        {activeSection === "jumelage" && <SectionJumelage />}
        {activeSection === "vitaa-faas" && <SectionVitaaFaas />}
        {activeSection === "gouvernance" && <SectionGouvernanceRoles />}
        {activeSection === "timetokens" && <SectionTimeTokens />}
        {activeSection === "pionniers" && <SectionPionniersCroissance />}
      </div>
      </div>
    </div>
  );
}

// ═══ 1. VUE CONSOLIDÉE — État de votre réseau en un coup d'œil ═══

function SectionVueConsolidee() {
  const KPI_SUMMARY = [
    { label: "Profil", value: "87%", icon: UserCircle, color: "text-blue-600" },
    { label: "Capacités", value: "5", icon: Package, color: "text-cyan-600" },
    { label: "Cellules", value: "4", icon: Atom, color: "text-teal-600" },
    { label: "Jumelage", value: "4", icon: Handshake, color: "text-violet-600" },
    { label: "VITAA", value: "8.4", icon: Activity, color: "text-emerald-600" },
    { label: "Gouvernance", value: "5", icon: Shield, color: "text-amber-600" },
    { label: "Rôles", value: "4", icon: Users, color: "text-pink-600" },
    { label: "TimeTokens", value: "1,847", icon: Coins, color: "text-orange-600" },
    { label: "Pionniers", value: "5/9", icon: Rocket, color: "text-indigo-600" },
    { label: "Croissance", value: "9→81", icon: TrendingUp, color: "text-rose-600" },
    { label: "Matrice sortie", value: "4", icon: LogOut, color: "text-slate-600" },
  ];

  return (
    <div className="space-y-3">
      <BPCard icon={BarChart3} title="Score réseau global" badge="+5 pts ce mois" badgeColor="bg-emerald-50 text-emerald-700">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-cyan-600">78%</div>
          <div className="flex-1">
            <O9ScoreBar value={78} color="bg-cyan-500" />
            <p className="text-[10px] text-gray-500 mt-1">Moyenne de vos 4 cellules — Top 15% du réseau Brain Team</p>
          </div>
        </div>
      </BPCard>

      {/* KPI Summary — 9 sections en un coup d'œil (pattern V2) */}
      <BPCard icon={Eye} title="Résumé par section">
        <div className="grid grid-cols-3 gap-2">
          {KPI_SUMMARY.map(k => {
            const KIcon = k.icon;
            return (
              <div key={k.label} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                <KIcon className={cn("h-3.5 w-3.5 shrink-0", k.color)} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-800">{k.value}</div>
                  <div className="text-[9px] text-gray-500 truncate">{k.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </BPCard>

      <div className="grid grid-cols-2 gap-3">
        {[
          { name: "Les Titans", score: 92, members: "6/9", type: "Interne", trend: "+8%" },
          { name: "Escouade Ventes", score: 71, members: "3/9", type: "Interne", trend: "+3%" },
          { name: "Innovation Lab", score: 68, members: "4/9", type: "Interne", trend: "+12%" },
          { name: "Collab MetalPro", score: 74, members: "5/9", type: "Externe", trend: "-2%" },
        ].map(cell => (
          <div key={cell.name} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
              <Atom className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
              <span className="text-xs font-bold text-gray-900 flex-1 truncate">{cell.name}</span>
              <span className="text-[9px] font-bold text-emerald-600">{cell.trend}</span>
            </div>
            <div className="px-3 py-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-800">{cell.score}%</span>
                <span className="text-[10px] text-gray-500">{cell.members}</span>
              </div>
              <O9ScoreBar value={cell.score} color="bg-cyan-500" />
            </div>
          </div>
        ))}
      </div>

      <BPCard icon={AlertTriangle} title="Alertes réseau" badge="2" badgeColor="bg-red-50 text-red-700">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            <div>
              <span className="text-xs font-medium text-gray-800">MetalPro — confiance en baisse</span>
              <p className="text-[10px] text-gray-500">Score descendu de 78% à 62% — inactivité 3 semaines</p>
            </div>
          </div>
          <div className="flex items-start gap-2 border-t border-gray-50 pt-2">
            <span className="mt-0.5 w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            <div>
              <span className="text-xs font-medium text-gray-800">Innovation Lab — sous seuil VITAA</span>
              <p className="text-[10px] text-gray-500">Score Temps 38% (min requis: 40%)</p>
            </div>
          </div>
        </div>
      </BPCard>
    </div>
  );
}

// ═══ 2. MON PROFIL RÉSEAU — La fiche que les autres voient ═══

function SectionProfil() {
  return (
    <div className="space-y-3">
      <BPCard icon={Building2} title="Fiche entreprise" badge="Publique">
        <div className="space-y-3">
          {[
            { label: "Entreprise", value: "Usine Bleue AI", icon: Building2 },
            { label: "Secteur", value: "Manufacturier — Automatisation", icon: Package },
            { label: "Région", value: "Montérégie, Québec", icon: MapPin },
            { label: "Taille", value: "45 employés — CA 8.2M$", icon: Users },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-2 py-1 border-b border-gray-50">
              <f.icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-[10px] font-bold text-gray-500 w-20 shrink-0">{f.label}</span>
              <span className="text-xs text-gray-800 flex-1">{f.value}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">ISO 9001</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">ISO 14001</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-bold">CWB</span>
          </div>
        </div>
      </BPCard>

      <BPCard icon={Shield} title="Indice de confiance" badge="87%" badgeColor="bg-emerald-50 text-emerald-700">
        <div className="space-y-2">
          <O9ScoreBar value={87} color="bg-emerald-500" />
          {[
            { label: "Profil complété", value: 95 },
            { label: "Engagements tenus", value: 92 },
            { label: "Activité réseau", value: 78 },
            { label: "Avis positifs (12)", value: 88 },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 w-32 shrink-0">{m.label}</span>
              <div className="flex-1"><O9ScoreBar value={m.value} color="bg-emerald-400" /></div>
            </div>
          ))}
        </div>
      </BPCard>

      <BPCard icon={Award} title="Badges & Distinctions">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700"><Crown className="h-3.5 w-3.5" /> Pionnier V1</span>
          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-600"><Award className="h-3.5 w-3.5" /> Ambassadeur Or</span>
          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Qualifié Brain Team</span>
        </div>
      </BPCard>

      {/* Scores VITAA individuels (pattern V2) */}
      <BPCard icon={Activity} title="Scores VITAA" badge="Mon profil">
        <div className="space-y-2">
          {[
            { key: "V", label: "Vente", value: 72, color: "bg-blue-500" },
            { key: "I", label: "Idée", value: 65, color: "bg-violet-500" },
            { key: "T", label: "Temps", value: 58, color: "bg-amber-500" },
            { key: "A₁", label: "Argent", value: 71, color: "bg-emerald-500" },
            { key: "A₂", label: "Actif", value: 80, color: "bg-cyan-500" },
          ].map(p => (
            <div key={p.key} className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-700 w-6 shrink-0">{p.key}</span>
              <span className="text-[10px] text-gray-600 w-14 shrink-0">{p.label}</span>
              <div className="flex-1"><O9ScoreBar value={p.value} color={p.color} /></div>
              <span className="text-[10px] font-bold text-gray-700 w-8 text-right">{p.value}%</span>
            </div>
          ))}
          <p className="text-[9px] text-gray-400 text-center pt-1">Score global: 69.2% — Seuil réseau: 40% minimum par pilier</p>
        </div>
      </BPCard>

      <BPCard icon={Zap} title="Personnalisation profil">
        <div className="space-y-2">
          {[
            { label: "Photo de profil", done: true },
            { label: "Description entreprise", done: true },
            { label: "Spécialités (min. 3)", done: true },
            { label: "Certifications", done: true },
            { label: "Vidéo de présentation", done: false },
            { label: "Portfolio projets (min. 2)", done: false },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", item.done ? "text-emerald-500" : "text-gray-300")} />
              <span className={cn("text-xs", item.done ? "text-gray-700" : "text-gray-400")}>{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <span className="text-[10px] text-gray-500">Complété:</span>
            <div className="flex-1"><O9ScoreBar value={67} color="bg-cyan-500" /></div>
            <span className="text-[10px] font-bold text-gray-700">67%</span>
          </div>
        </div>
      </BPCard>

      <button className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-700 text-xs font-medium hover:bg-cyan-100 transition-colors cursor-pointer">
        <Eye className="h-3.5 w-3.5" /> Prévisualiser comme les autres me voient
      </button>
    </div>
  );
}

// ═══ 3. CAPACITÉS & OFFRES — Ce que vous apportez au réseau ═══

function SectionCapacites() {
  return (
    <div className="space-y-3">
      <BPCard icon={Package} title="Spécialités offertes">
        <div className="space-y-2">
          {[
            { label: "Automatisation industrielle", level: 95, badge: "Expert" },
            { label: "Intégration robotique", level: 88, badge: "Expert" },
            { label: "Vision artificielle", level: 72, badge: "Intermédiaire" },
            { label: "Programmation PLC/SCADA", level: 85, badge: "Avancé" },
            { label: "Intelligence artificielle manufacturière", level: 68, badge: "Intermédiaire" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
              <span className="text-xs text-gray-700 flex-1 truncate">{s.label}</span>
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                s.badge === "Expert" ? "bg-emerald-50 text-emerald-700" :
                s.badge === "Avancé" ? "bg-blue-50 text-blue-700" :
                "bg-amber-50 text-amber-700"
              )}>{s.badge}</span>
              <div className="w-16 shrink-0"><O9ScoreBar value={s.level} color="bg-cyan-500" /></div>
            </div>
          ))}
        </div>
      </BPCard>

      <BPCard icon={Zap} title="Équipements & Actifs">
        <div className="flex flex-wrap gap-1.5">
          {["Robots FANUC (3)", "Caméras Cognex", "PLC Siemens S7", "Ligne d'assemblage auto", "Labo R&D 500pi²", "Imprimante 3D métal"].map(e => (
            <span key={e} className="text-[9px] px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">{e}</span>
          ))}
        </div>
      </BPCard>

      <BPCard icon={Activity} title="Capacité actuelle" badge="Disponible" badgeColor="bg-emerald-50 text-emerald-700">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Charge de travail</span>
            <span className="text-xs font-bold text-gray-800">72%</span>
          </div>
          <O9ScoreBar value={72} color="bg-blue-500" />
          <p className="text-[10px] text-gray-500">Capacité résiduelle disponible pour projets collaboratifs — environ 2 mandats simultanés</p>
        </div>
      </BPCard>

      {/* Ce que nous cherchons — besoins urgents (pattern V2) */}
      <BPCard icon={Search} title="Ce que nous cherchons" badge="4 besoins" badgeColor="bg-amber-50 text-amber-700">
        <div className="space-y-2">
          {[
            { label: "Soudure TIG/MIG", urgence: "Élevée", color: "bg-red-500" },
            { label: "Usinage CNC 5 axes", urgence: "Moyenne", color: "bg-amber-500" },
            { label: "Transport logistique", urgence: "Moyenne", color: "bg-amber-500" },
            { label: "Tests qualité NDT", urgence: "Faible", color: "bg-blue-500" },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
              <span className={cn("w-2 h-2 rounded-full shrink-0", b.color)} />
              <span className="text-xs text-gray-700 flex-1">{b.label}</span>
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                b.urgence === "Élevée" ? "bg-red-50 text-red-700" :
                b.urgence === "Moyenne" ? "bg-amber-50 text-amber-700" :
                "bg-blue-50 text-blue-700"
              )}>{b.urgence}</span>
            </div>
          ))}
        </div>
      </BPCard>

      {/* Suggestion CarlOS AI (pattern V2) */}
      <div className="rounded-xl border-2 border-cyan-200 bg-cyan-50/30 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-cyan-100/50">
          <img src={BOT_AVATAR_MAP.CEOB} alt="CarlOS" className="w-6 h-6 rounded-full ring-1 ring-cyan-300 object-cover" />
          <span className="text-xs font-bold text-cyan-800 flex-1">Suggestion CarlOS</span>
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700">IA</span>
        </div>
        <div className="px-4 py-3 space-y-2">
          <p className="text-xs text-gray-700 leading-relaxed">
            <span className="font-bold">Match 87%</span> — <span className="text-cyan-700 font-medium">MetalPro Industries</span> offre exactement la soudure TIG/MIG et l'usinage CNC que vous cherchez. Ils sont dans votre cellule externe.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">Confiance 92%</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-bold">Montérégie</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">ISO 9001</span>
          </div>
          <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-700 transition-colors cursor-pointer">
            <Handshake className="h-3.5 w-3.5" /> Initier le jumelage
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ 4. CELLULES — Vos groupes de collaboration ═══

function SectionCellules() {
  const CELLS = [
    { name: "Les Titans", type: "Interne", members: 6, max: 9, score: 92, rabais: 18, phase: "Exécution", avatars: [BOT_AVATAR_MAP.CEOB, BOT_AVATAR_MAP.CMOB, BOT_AVATAR_MAP.CROB, BOT_AVATAR_MAP.CSOB] },
    { name: "Escouade Ventes", type: "Interne", members: 3, max: 9, score: 71, rabais: 10, phase: "Création", avatars: [BOT_AVATAR_MAP.CROB, BOT_AVATAR_MAP.COOB, BOT_AVATAR_MAP.CHROB] },
    { name: "Innovation Lab", type: "Interne", members: 4, max: 9, score: 68, rabais: 12, phase: "Réflexion", avatars: [BOT_AVATAR_MAP.CTOB, BOT_AVATAR_MAP.CINOB, BOT_AVATAR_MAP.CISOB] },
    { name: "Collab MetalPro", type: "Externe", members: 5, max: 9, score: 74, rabais: 15, phase: "Observation", avatars: [BOT_AVATAR_MAP.CPOB, BOT_AVATAR_MAP.CLOB, BOT_AVATAR_MAP.COOB] },
  ];

  return (
    <div className="space-y-3">
      {/* KPIs cellules */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Membres total", value: "18", sub: "/ 36 max" },
          { label: "Rabais actif moyen", value: "14%", sub: "palier 3" },
          { label: "Économie / mois", value: "3.2K$", sub: "+18% QoQ" },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all p-3 text-center">
            <div className="text-2xl font-bold text-gray-800">{k.value}</div>
            <div className="text-[10px] text-gray-500">{k.label}</div>
            <div className="text-[9px] text-gray-400">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Progression rabais */}
      <BPCard icon={TrendingUp} title="Progression rabais" badge="Palier 3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <div key={n} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn("w-full h-3 rounded-full", n <= 6 ? "bg-cyan-500" : "bg-gray-200")} />
              <span className="text-[8px] text-gray-400">{n}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-2">6 membres = palier 3 (15-20%). Le rabais ne descend JAMAIS. Prochain palier: 7 membres.</p>
      </BPCard>

      {/* Cards cellules */}
      {CELLS.map(cell => (
        <div key={cell.name} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
            <Network className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900 flex-1">{cell.name}</span>
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium",
              cell.type === "Interne" ? "bg-teal-50 text-teal-600" : "bg-cyan-50 text-cyan-600"
            )}>{cell.type}</span>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {cell.avatars.slice(0, 4).map((a, i) => (
                  <img key={i} src={a} alt="" className="w-6 h-6 rounded-full ring-1 ring-white object-cover" />
                ))}
                {cell.members > 4 && <span className="text-[9px] text-gray-400 ml-1">+{cell.members - 4}</span>}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-600">{cell.members}/{cell.max} membres — {cell.phase}</span>
                  <span className="text-xs font-bold text-cyan-600">{cell.score}%</span>
                </div>
                <O9ScoreBar value={cell.score} color="bg-cyan-500" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══ 4b. JUMELAGE — Pipeline de matching et collaborations (pattern V2) ═══

function SectionJumelage() {
  const PIPELINE_STAGES = [
    { label: "Découverte", count: 12, color: "bg-blue-500" },
    { label: "Qualification", count: 6, color: "bg-violet-500" },
    { label: "Introduction", count: 4, color: "bg-amber-500" },
    { label: "Collaboration", count: 3, color: "bg-cyan-500" },
    { label: "Intégration", count: 1, color: "bg-emerald-500" },
  ];

  const MATCHES = [
    { name: "MetalPro Industries", score: 92, sector: "Métallurgie", region: "Montérégie", status: "Introduction", bots: [BOT_AVATAR_MAP.CPOB, BOT_AVATAR_MAP.CEOB], specialites: ["Soudure TIG/MIG", "Usinage CNC"] },
    { name: "RoboVision Québec", score: 87, sector: "Vision artificielle", region: "Québec", status: "Qualification", bots: [BOT_AVATAR_MAP.CTOB, BOT_AVATAR_MAP.CINOB], specialites: ["Caméras 3D", "Inspection auto"] },
    { name: "TechnoSoudure Inc.", score: 81, sector: "Assemblage", region: "Estrie", status: "Découverte", bots: [BOT_AVATAR_MAP.CSOB, BOT_AVATAR_MAP.CROB], specialites: ["Soudure robotisée", "Assemblage"] },
    { name: "LogiTrans Solutions", score: 74, sector: "Logistique", region: "Lanaudière", status: "Découverte", bots: [BOT_AVATAR_MAP.COOB, BOT_AVATAR_MAP.CFOB], specialites: ["Transport", "Entreposage"] },
  ];

  return (
    <div className="space-y-3">
      {/* Pipeline visuel — 5 étapes (pattern V2) */}
      <BPCard icon={Handshake} title="Pipeline de jumelage" badge="26 actifs" badgeColor="bg-violet-50 text-violet-700">
        <div className="space-y-3">
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-2">
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0", stage.color)}>{i + 1}</div>
              <span className="text-xs text-gray-700 w-24 shrink-0">{stage.label}</span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden relative">
                <div className={cn("h-full rounded-full transition-all duration-700", stage.color)} style={{ width: `${(stage.count / 12) * 100}%` }} />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-gray-700">{stage.count}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <span className="text-[10px] text-gray-500">Taux de conversion global:</span>
            <span className="text-xs font-bold text-emerald-600">8.3%</span>
            <span className="text-[10px] text-gray-400">(Découverte → Intégration)</span>
          </div>
        </div>
      </BPCard>

      {/* KPIs jumelage */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Matches actifs", value: "4", sub: "score moyen 84%" },
          { label: "Trisociations", value: "2", sub: "LiveKit complétées" },
          { label: "Valeur pipeline", value: "42K$", sub: "potentiel annuel" },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all p-3 text-center">
            <div className="text-2xl font-bold text-gray-800">{k.value}</div>
            <div className="text-[10px] text-gray-500">{k.label}</div>
            <div className="text-[9px] text-gray-400">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Cards matches (pattern BPCard) */}
      {MATCHES.map(m => (
        <div key={m.name} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
            <Building2 className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900 flex-1 truncate">{m.name}</span>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full",
              m.score >= 90 ? "bg-emerald-50 text-emerald-700" :
              m.score >= 80 ? "bg-cyan-50 text-cyan-700" :
              "bg-amber-50 text-amber-700"
            )}>{m.score}%</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
              <Package className="h-3 w-3 text-gray-400" />
              <span>{m.sector}</span>
              <span className="text-gray-300">•</span>
              <MapPin className="h-3 w-3 text-gray-400" />
              <span>{m.region}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {m.specialites.map(s => (
                <span key={s} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">{s}</span>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-gray-50">
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-gray-500">Bots assignés:</span>
                {m.bots.map((a, i) => (
                  <img key={i} src={a} alt="" className="w-5 h-5 rounded-full ring-1 ring-white object-cover" />
                ))}
              </div>
              <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full",
                m.status === "Introduction" ? "bg-amber-50 text-amber-700" :
                m.status === "Qualification" ? "bg-violet-50 text-violet-700" :
                "bg-blue-50 text-blue-700"
              )}>{m.status}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Bandeau info */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-2">
        <Target className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="text-[9px] text-blue-700">Le jumelage utilise la trisociation — rencontre CarlOS + 2 spécialistes en temps réel via LiveKit pour valider la compatibilité.</span>
      </div>
    </div>
  );
}

// ═══ 5. VITAA FAAS — Scoring collectif 9 piliers ═══

function SectionVitaaFaas() {
  const PILIERS = [
    { key: "V", label: "Vente", solo: 72, cellule: 89 },
    { key: "I", label: "Idée", solo: 65, cellule: 81 },
    { key: "T", label: "Temps", solo: 58, cellule: 74 },
    { key: "A", label: "Argent", solo: 71, cellule: 85 },
    { key: "A", label: "Actif", solo: 80, cellule: 92 },
    { key: "F", label: "Fraternité", solo: 0, cellule: 67 },
    { key: "A", label: "Alliance", solo: 0, cellule: 73 },
    { key: "S", label: "Social", solo: 0, cellule: 61 },
    { key: "T", label: "Technologie", solo: 0, cellule: 78 },
  ];

  return (
    <div className="space-y-3">
      <BPCard icon={Activity} title="Score collectif" badge="e^(V×I×T)">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-4xl font-bold text-cyan-600">8.4</div>
            <p className="text-[10px] text-gray-500">Score collectif</p>
          </div>
          <div className="flex-1 text-right">
            <div className="text-lg font-bold text-gray-400">vs 4.2 solo</div>
            <p className="text-[10px] text-emerald-600 font-bold">+100% en cellule</p>
          </div>
        </div>
      </BPCard>

      <BPCard icon={BarChart3} title="Comparaison Solo vs Cellule">
        <div className="space-y-2.5">
          {PILIERS.map((p, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-bold text-gray-700">{p.key} — {p.label}</span>
                <span className="text-[9px] text-gray-500">{p.solo > 0 ? `${p.solo}%` : "—"} → {p.cellule}%</span>
              </div>
              <div className="flex gap-1 items-center">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  {p.solo > 0 && <div className="h-full bg-gray-300 rounded-full" style={{ width: `${p.solo}%` }} />}
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${p.cellule}%` }} />
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
            <span className="flex items-center gap-1 text-[9px] text-gray-500"><span className="w-3 h-2 bg-gray-300 rounded-full" /> Solo</span>
            <span className="flex items-center gap-1 text-[9px] text-cyan-600"><span className="w-3 h-2 bg-cyan-500 rounded-full" /> En cellule</span>
          </div>
        </div>
      </BPCard>
    </div>
  );
}

// ═══ 6. GOUVERNANCE & RÔLES — Principes holacratiques + Rôles + Matrice de sortie (condensé) ═══

function SectionGouvernanceRoles() {
  const PRINCIPES = [
    { icon: Zap, title: "Les tensions sont du carburant", desc: "Chaque tension = une opportunité d'amélioration. Pas un problème, une source d'énergie." },
    { icon: Users, title: "Rôles dynamiques, pas hiérarchie", desc: "Les rôles sont élus et tournent tous les 90 jours. Pas de titre permanent." },
    { icon: MessageCircle, title: "2 types de réunions", desc: "Tactique (opérations courantes) et Gouvernance (structure et rôles)." },
    { icon: Vote, title: "Consentement, pas consensus", desc: "On avance sauf objection raisonnable. Pas besoin que tout le monde soit d'accord." },
    { icon: Eye, title: "Transparence radicale", desc: "Toutes les décisions, métriques et discussions sont visibles par tous les membres." },
  ];

  const ROLES = [
    { role: "Leader", who: "Carl F.", desc: "Anime les réunions, facilite les tensions, représente la cellule", avatar: BOT_AVATAR_MAP.CEOB, color: "bg-blue-50 text-blue-700" },
    { role: "Trésorier", who: "Nathalie R.", desc: "Gère les TimeTokens, valide les transactions, rapport mensuel", avatar: BOT_AVATAR_MAP.CFOB, color: "bg-emerald-50 text-emerald-700" },
    { role: "Secrétaire", who: "Sophie B.", desc: "Documente les décisions, maintient le registre, PV des réunions", avatar: BOT_AVATAR_MAP.CSOB, color: "bg-violet-50 text-violet-700" },
    { role: "Lien", who: "Jean-P. L.", desc: "Représente la cellule au niveau réseau, interface inter-cellules", avatar: BOT_AVATAR_MAP.CROB, color: "bg-amber-50 text-amber-700" },
  ];

  const QUADRANTS = [
    { title: "Volontaire + Bon termes", color: "bg-emerald-50 border-emerald-200", items: ["Préavis 90 jours", "Rachat parts au juste prix", "Accès 6 mois aux ressources"] },
    { title: "Volontaire + Mauvais termes", color: "bg-amber-50 border-amber-200", items: ["Préavis 30 jours", "Gel progressif des accès", "Médiation obligatoire"] },
    { title: "Involontaire + Bon termes", color: "bg-blue-50 border-blue-200", items: ["Restructuration cellule", "Réaffectation si possible", "Indemnité TimeTokens"] },
    { title: "Involontaire + Mauvais termes", color: "bg-red-50 border-red-200", items: ["Exclusion immédiate", "Protection PI activée", "Arbitrage Brain Team"] },
  ];

  return (
    <div className="space-y-3">
      {/* Principes S3 */}
      {PRINCIPES.map(p => (
        <BPCard key={p.title} icon={p.icon} title={p.title}>
          <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
        </BPCard>
      ))}

      <BPCard icon={Target} title="Processus décisionnel">
        <div className="flex items-center gap-1">
          {["Proposition", "Questions", "Réactions", "Objections", "Intégration"].map((step, i) => (
            <div key={step} className="flex items-center gap-1">
              <div className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[9px] font-bold">{i + 1}</div>
              {i < 4 && <div className="w-3 h-0.5 bg-cyan-300" />}
            </div>
          ))}
        </div>
        <div className="flex gap-1 mt-1.5">
          {["Proposition", "Questions", "Réactions", "Objections", "Intégration"].map(s => (
            <span key={s} className="text-[8px] text-gray-500 flex-1 text-center">{s}</span>
          ))}
        </div>
      </BPCard>

      {/* Rôles actifs */}
      <BPCard icon={Users} title="Rôles actifs">
        <div className="space-y-2">
          {ROLES.map(r => (
            <div key={r.role} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
              <img src={r.avatar} alt={r.who} className="w-7 h-7 rounded-full ring-1 ring-gray-200 object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800">{r.role}</span>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", r.color)}>{r.who}</span>
                </div>
                <p className="text-[10px] text-gray-500 truncate">{r.desc}</p>
              </div>
            </div>
          ))}
          <p className="text-[9px] text-gray-400 text-center">Prochaine rotation: 15 mai 2026</p>
        </div>
      </BPCard>

      {/* Règles actives */}
      <BPCard icon={Shield} title="Règles actives">
        <div className="space-y-1.5">
          {[
            "Max 9 membres par cellule",
            "Trisociation obligatoire avant collaboration",
            "Score VITAA minimum 40%",
            "Anti-cartel: max 2 entreprises même secteur par cellule",
            "Rotation des rôles tous les 90 jours",
          ].map(r => (
            <div key={r} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="text-xs text-gray-700">{r}</span>
            </div>
          ))}
        </div>
      </BPCard>

      {/* Matrice de sortie (condensée) */}
      <BPCard icon={LogOut} title="Matrice de sortie">
        <div className="grid grid-cols-2 gap-2">
          {QUADRANTS.map(q => (
            <div key={q.title} className={cn("rounded-lg border p-2", q.color)}>
              <span className="text-[9px] font-bold text-gray-800 block mb-1">{q.title}</span>
              {q.items.map(item => (
                <div key={item} className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                  <span className="text-[9px] text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </BPCard>
    </div>
  );
}

// ═══ 8. TIMETOKENS — Économie de collaboration ═══

function SectionTimeTokens() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Solde", value: "1,847 UT", sub: "≈ 2.4K$ en services" },
          { label: "Gagnés ce mois", value: "+312 UT", sub: "7 contributions" },
          { label: "TokenScore", value: "8.4", sub: "Top 12% réseau" },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all p-3 text-center">
            <div className="text-2xl font-bold text-gray-800">{k.value}</div>
            <div className="text-[10px] text-gray-500">{k.label}</div>
            <div className="text-[9px] text-gray-400">{k.sub}</div>
          </div>
        ))}
      </div>

      <BPCard icon={Scale} title="Répartition Slicing Pie">
        <div className="space-y-2">
          {[
            { label: "Créateur", pct: 35, color: "bg-cyan-500" },
            { label: "Exécuteur", pct: 30, color: "bg-blue-500" },
            { label: "Plateforme", pct: 25, color: "bg-violet-500" },
            { label: "Validateurs", pct: 10, color: "bg-gray-400" },
          ].map(d => (
            <div key={d.label} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 w-20 shrink-0">{d.label}</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", d.color)} style={{ width: `${d.pct}%` }} />
              </div>
              <span className="text-[10px] font-bold text-gray-700 w-8 text-right">{d.pct}%</span>
            </div>
          ))}
        </div>
      </BPCard>

      <BPCard icon={Clock} title="Transactions récentes">
        <div className="space-y-2">
          {[
            { desc: "Audit qualité pour MetalPro", amount: "+85 UT", color: "text-emerald-600", date: "il y a 2j" },
            { desc: "Formation robotique reçue", amount: "-120 UT", color: "text-red-600", date: "il y a 5j" },
            { desc: "Validation devis Escouade", amount: "+45 UT", color: "text-emerald-600", date: "il y a 1 sem." },
          ].map((tx, i) => (
            <div key={i} className={cn("flex items-center gap-2 py-1", i > 0 && "border-t border-gray-50")}>
              <span className="text-xs text-gray-700 flex-1">{tx.desc}</span>
              <span className={cn("text-xs font-bold shrink-0", tx.color)}>{tx.amount}</span>
              <span className="text-[9px] text-gray-400 shrink-0">{tx.date}</span>
            </div>
          ))}
        </div>
      </BPCard>
    </div>
  );
}

// ═══ 9. PIONNIERS & CROISSANCE — Grille 3×3 + modèle 9→81 (condensé) ═══

function SectionPionniersCroissance() {
  const GROWTH_PHASES = [
    { label: "Seed", range: "1-9", desc: "Fondation du noyau", active: false, done: true },
    { label: "Pionniers", range: "9-27", desc: "Premiers adopteurs qualifiés", active: true, done: false },
    { label: "Traction", range: "27-81", desc: "Croissance organique réseau", active: false, done: false },
    { label: "Masse critique", range: "81-243", desc: "Effets de réseau activés", active: false, done: false },
    { label: "Écosystème", range: "243-729", desc: "Marché auto-alimenté", active: false, done: false },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Confirmés", value: "5/9", color: "text-emerald-600" },
          { label: "Prospects", value: "2", color: "text-amber-600" },
          { label: "Prix Pionnier", value: "1,350$/m", color: "text-cyan-600" },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all p-3 text-center">
            <div className={cn("text-2xl font-bold", k.color)}>{k.value}</div>
            <div className="text-[10px] text-gray-500">{k.label}</div>
          </div>
        ))}
      </div>

      <BPCard icon={Rocket} title="Grille sectorielle">
        <div className="grid grid-cols-3 gap-2">
          {O9_PIONNIERS.map(p => (
            <div key={p.id} className={cn("rounded-lg border p-2.5 text-center",
              p.status === "pris" ? "bg-emerald-50 border-emerald-200" :
              p.status === "prospect" ? "bg-amber-50 border-amber-200" :
              "bg-gray-50 border-gray-200"
            )}>
              <span className="text-[10px] font-bold text-gray-800 block">{p.label}</span>
              <PionnierDot status={p.status} />
              {p.entreprise && <span className="text-[8px] text-gray-500 block mt-0.5 truncate">{p.entreprise}</span>}
            </div>
          ))}
        </div>
      </BPCard>

      <BPCard icon={Award} title="Package Pionnier — 6 bénéfices lifetime">
        <div className="space-y-1.5">
          {[
            "Tarif C-Suite réduit de 46% à vie",
            "Badge Ambassadeur Or permanent",
            "Onboarding VIP personnalisé",
            "Commission 5% sur références",
            "Avance de 6 mois sur les fonctionnalités",
            "Voix dans la roadmap produit",
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span className="text-xs text-gray-700">{b}</span>
            </div>
          ))}
        </div>
      </BPCard>

      <BPCard icon={TrendingUp} title="Modèle de croissance">
        <div className="space-y-2.5">
          {GROWTH_PHASES.map((p, i) => (
            <div key={p.label} className="flex items-center gap-3">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",
                p.done ? "bg-emerald-500 text-white" : p.active ? "bg-cyan-500 text-white ring-2 ring-cyan-200" : "bg-gray-100 text-gray-400"
              )}>{i + 1}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-bold", p.active ? "text-cyan-700" : p.done ? "text-emerald-700" : "text-gray-500")}>{p.label}</span>
                  <span className="text-[9px] text-gray-400">{p.range}</span>
                  {p.active && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-bold">Actuel</span>}
                  {p.done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                </div>
                <p className="text-[10px] text-gray-500">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </BPCard>

      <BPCard icon={MapPin} title="Stratégie Domino géographique">
        <div className="space-y-1.5">
          {[
            { region: "Québec", status: "En cours", pct: 35 },
            { region: "Ontario", status: "Planifié", pct: 0 },
            { region: "Canada", status: "Horizon 2027", pct: 0 },
            { region: "Nord-Est US", status: "Horizon 2028", pct: 0 },
          ].map(r => (
            <div key={r.region} className="flex items-center gap-2">
              <span className="text-xs text-gray-700 w-24 shrink-0">{r.region}</span>
              <div className="flex-1"><O9ScoreBar value={r.pct} color="bg-cyan-500" /></div>
              <span className="text-[9px] text-gray-500 w-20 text-right">{r.status}</span>
            </div>
          ))}
        </div>
      </BPCard>
    </div>
  );
}
