/**
 * MasterStrategiePage.tsx — Strategie & Lancement
 * SUMMARY page: Pioneer program, scaling 9 to 81, Boost Camp, go-to-market.
 * Single scrollable page (no tabs): Vision, Suppliers First, Pioneers, Boost Camp, Orbit9, Stack, Competition.
 */

import {
  Rocket, Target, Users, TrendingUp, Zap, ArrowRight,
  Shield, DollarSign, Clock, CheckCircle2, Globe,
  Cpu, BarChart3, Network, Award,
  Layers, Star, ChevronRight, CircleDot,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../components/ui/utils";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ======================================================================
// HELPER COMPONENTS
// ======================================================================

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ======================================================================
// MAIN COMPONENT
// ======================================================================

export function MasterStrategiePage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Rocket}
          iconColor="text-red-600"
          title="Strategie & Lancement"
          subtitle="Pioneer, scaling 9 vers 81, Boost Camp, go-to-market"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ============================================================ */}
      {/* SECTION 1 — Vision Strategique */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Vision Strategique</h3>

        <Card className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
          <div className="text-center mb-5">
            <p className="text-sm font-medium text-gray-700 italic leading-relaxed">
              "La chimie a son tableau periodique.
              <br />
              L'intelligence d'affaires a GHML."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-700">Mission</div>
                  <p className="text-xs text-gray-600 mt-0.5">Democratiser l'acces a l'intelligence C-Level pour les PME. Un C-Suite AI complet pour 3-5% du cout humain.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Globe className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-700">Marche</div>
                  <p className="text-xs text-gray-600 mt-0.5">PME manufacturieres — Quebec d'abord (REAI 130+ manufacturiers), puis expansion Canada, puis international.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-700">Avantage competitif</div>
                  <p className="text-xs text-gray-600 mt-0.5">GHML = framework proprietaire. Pas un chatbot generique. Trisociation + CREDO + Tableau Periodique = methodologie unique.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <DollarSign className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-700">Proposition de valeur</div>
                  <p className="text-xs text-gray-600 mt-0.5">6 cerveaux C-Level 24/7 pour 35,940$/an au lieu de 760K-1.35M$ en equivalents humains.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 2 — Strategie Suppliers First */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Strategie "Suppliers First"</h3>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <Network className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-800 mb-1">Cibler les integrateurs et fournisseurs EN PREMIER</div>
              <p className="text-xs text-gray-600">Effet reseau : chaque fournisseur connecte 5-10 PME clientes. Fournir l'arme, pas le soldat.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                title: "Effet multiplicateur",
                desc: "1 fournisseur = 5-10 PME clientes connectees. Entrer par le fournisseur pour atteindre son reseau.",
                icon: TrendingUp,
                color: "emerald",
              },
              {
                title: "Exclusivite sectorielle",
                desc: "UN leader par secteur. Si c'est pas toi, c'est ton competiteur. Urgence naturelle.",
                icon: Award,
                color: "amber",
              },
              {
                title: "Avantage du premier arrive",
                desc: "6 mois d'avance pendant lesquels tes bots apprennent ton business, ton reseau se construit.",
                icon: Zap,
                color: "blue",
              },
              {
                title: "Orbit9 = moteur de matching",
                desc: "Le reseau se construit organiquement. Chaque membre enrichit le matching pour les autres.",
                icon: CircleDot,
                color: "violet",
              },
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
                  <ItemIcon className={cn("h-4 w-4 mt-0.5 shrink-0", `text-${item.color}-500`)} />
                  <div>
                    <div className="text-xs font-bold text-gray-700">{item.title}</div>
                    <p className="text-[9px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 3 — Programme Pionniers (9 -> 81) */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Programme Pionniers (9 vers 81)</h3>
        <p className="text-xs text-gray-400 mb-4">
          3 phases de scaling : beta privee, referral, croissance organique.
        </p>

        <div className="space-y-4">
          {/* Phase 1 */}
          <Card className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Phase 1 — 9 Pionniers Bleus</span>
                <Badge className="ml-auto bg-white/20 text-white border-white/30 text-[9px]">Beta Privee</Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wide mb-1">Selection</div>
                  <p className="text-xs text-gray-600">Manufacturiers REAI, $100K+ revenus, CEO engage</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wide mb-1">Accompagnement</div>
                  <p className="text-xs text-gray-600">Boost Camp 165 jours (VIST + JUAN + CPRJ)</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wide mb-1">Validation</div>
                  <p className="text-xs text-gray-600">Product-market fit, pricing, UX</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <span>Tournee du Baton de Pelerin — 30 jours chrono, 9 places, portes qui ferment</span>
              </div>
            </div>
          </Card>

          {/* Phase 2 */}
          <Card className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Phase 2 — 81 Clients</span>
                <Badge className="ml-auto bg-white/20 text-white border-white/30 text-[9px]">9 x 9 Referres</Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {[
                  "Multi-tenant active — chaque pionnier a son instance",
                  "Bot-to-Bot collaboration entre instances",
                  "Marketplace operationnelle (Orbit9 matching)",
                  "Chaque pionnier refere 9 contacts qualifies",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Phase 3 */}
          <Card className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm">
            <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Phase 3 — 729+ Scaling Organique</span>
                <Badge className="ml-auto bg-white/20 text-white border-white/30 text-[9px]">Ecosysteme</Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {[
                  "Auto-generation de bots specialises par industrie",
                  "Orbit9 matching automatique entre membres",
                  "Expert Marketplace (consultants, integrateurs, partenaires)",
                  "Expansion geographique hors Quebec",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                    <span className="text-xs text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 4 — Boost Camp 3 Phases */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Boost Camp — 3 Phases (165 jours)</h3>
        <p className="text-xs text-gray-400 mb-4">
          Protocole d'accompagnement intensif Usine Bleue pour chaque pionnier.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              phase: "VIST",
              duration: "15 jours",
              color: "amber",
              title: "Diagnostic",
              desc: "Diagnostic VITAA complet, Triangle du Feu, scoring initial. Comprendre ou en est le dirigeant.",
              items: ["Evaluation 5 piliers VITAA", "Profil Herrmann", "Triangle du Feu (BRULE/COUVE/MEURT)", "Scoring initial 0-100"],
            },
            {
              phase: "JUAN",
              duration: "45 jours",
              color: "blue",
              title: "Matching",
              desc: "Matching Orbit9, cellules de collaboration, trisociation. Connecter le dirigeant au reseau.",
              items: ["Matching Orbit9 scoring", "Cellules de collaboration", "Trisociation LiveKit (3 bots)", "Qualification pipeline 5 etapes"],
            },
            {
              phase: "CPRJ",
              duration: "105 jours",
              color: "emerald",
              title: "Execution",
              desc: "Cahier de projet, documents generes, livrables concrets. Produire des resultats tangibles.",
              items: ["Cahier de projet complet (S00-S05)", "Documents strategiques generes", "Plan d'action avec jalons", "KPIs mesurables"],
            },
          ].map((p) => (
            <Card key={p.phase} className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm">
              <div className={cn("px-4 py-2.5", `bg-${p.color}-100 border-b border-${p.color}-200`)}>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-bold", `text-${p.color}-800`)}>{p.phase}</span>
                  <span className={cn("text-[9px] font-medium", `text-${p.color}-600`)}>{p.duration}</span>
                </div>
                <div className={cn("text-xs font-medium mt-0.5", `text-${p.color}-700`)}>{p.title}</div>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-600 mb-3">{p.desc}</p>
                <div className="space-y-1.5">
                  {p.items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <ArrowRight className={cn("h-3.5 w-3.5 shrink-0", `text-${p.color}-400`)} />
                      <span className="text-[9px] text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 5 — Modele Orbit9 Effet Reseau */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Modele Orbit9 — Effet Reseau</h3>
        <p className="text-xs text-gray-400 mb-4">
          9 cercles concentriques. Chaque niveau multiplie par 3. Anti-cartel integre.
        </p>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm">
          {/* Concentric circles visualization */}
          <div className="flex items-center justify-center mb-5">
            <div className="flex items-center gap-1.5">
              {[
                { n: 1, label: "1" },
                { n: 2, label: "3" },
                { n: 3, label: "9" },
                { n: 4, label: "27" },
                { n: 5, label: "81" },
                { n: 6, label: "243" },
                { n: 7, label: "729" },
                { n: 8, label: "2187" },
                { n: 9, label: "6561" },
              ].map((circle, i) => (
                <div key={circle.n} className="flex items-center gap-1.5">
                  <div className={cn(
                    "rounded-full flex items-center justify-center font-bold border-2",
                    i < 2 ? "w-9 h-9 text-[9px] bg-blue-100 border-blue-300 text-blue-700" :
                    i < 4 ? "w-9 h-9 text-[9px] bg-emerald-100 border-emerald-300 text-emerald-700" :
                    i < 6 ? "w-9 h-9 text-[9px] bg-amber-100 border-amber-300 text-amber-700" :
                    "w-9 h-9 text-[9px] bg-violet-100 border-violet-300 text-violet-700"
                  )}>
                    {circle.label}
                  </div>
                  {i < 8 && (
                    <span className="text-[9px] text-gray-400 font-bold">x3</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <Layers className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-bold text-gray-700">Cellules de collaboration</span>
              </div>
              <p className="text-[9px] text-gray-500">Unite de base du reseau. 3-9 membres par cellule. Scoring automatique. Qualification en 5 etapes.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <Shield className="h-3.5 w-3.5 text-red-500" />
                <span className="text-xs font-bold text-gray-700">Anti-cartel integre</span>
              </div>
              <p className="text-[9px] text-gray-500">Pas de monopole sectoriel. Comparaison des specialites. Distribution equilibree du reseau.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-bold text-gray-700">Multiplication par 3</span>
              </div>
              <p className="text-[9px] text-gray-500">Chaque membre connecte 3 nouveaux. De 1 a 6561 en 9 niveaux. Croissance organique, pas forcee.</p>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 6 — Stack Technologique Avantage Cout */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Stack Technologique — Avantage Cout</h3>
        <p className="text-xs text-gray-400 mb-4">
          80%+ des requetes sur tiers gratuits. Marge SaaS superieure a 85%.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Budget/jour/client", value: "$0.50-2", icon: DollarSign, color: "emerald" },
            { label: "Requetes gratuites", value: "80%+", icon: Zap, color: "blue" },
            { label: "Marge SaaS", value: ">85%", icon: TrendingUp, color: "violet" },
            { label: "Scaling", value: "1 vers N", icon: Cpu, color: "amber" },
          ].map((stat) => {
            const SIcon = stat.icon;
            return (
              <Card key={stat.label} className="p-3 bg-white border border-gray-100 text-center">
                <SIcon className={cn("h-4 w-4 mx-auto mb-1.5", `text-${stat.color}-500`)} />
                <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-gray-700">Routage 5 tiers — Optimisation automatique</span>
            <span className="text-[9px] text-gray-400">(details techniques → Protocoles & Acronymes)</span>
          </div>
          <div className="space-y-2">
            {[
              { tier: "T0", name: "Regex/Cache", cost: "Gratuit", pct: "30-40%", color: "bg-emerald-500" },
              { tier: "T1", name: "Gemini Flash", cost: "Gratuit", pct: "~30%", color: "bg-emerald-400" },
              { tier: "T2", name: "Gemini Pro", cost: "Gratuit", pct: "~20%", color: "bg-amber-400" },
              { tier: "T3", name: "Claude Sonnet", cost: "$0.01-0.05/req", pct: "~15%", color: "bg-orange-400" },
              { tier: "T4", name: "Claude Opus", cost: "$0.15-0.60/req", pct: "~5%", color: "bg-red-400" },
            ].map((t) => (
              <div key={t.tier} className="flex items-center gap-3">
                <span className={cn("text-white font-bold text-[9px] px-2 py-0.5 rounded min-w-[28px] text-center", t.color)}>
                  {t.tier}
                </span>
                <span className="text-xs text-gray-700 min-w-[100px]">{t.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", t.color)}
                    style={{ width: t.pct.replace("~", "").replace("%", "") + "%" }}
                  />
                </div>
                <span className="text-[9px] text-gray-500 min-w-[40px] text-right">{t.pct}</span>
                <span className="text-[9px] text-gray-400 min-w-[80px] text-right">{t.cost}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 7 — Concurrence & Differenciation */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Concurrence & Differenciation</h3>
        <p className="text-xs text-gray-400 mb-4">
          GhostX n'est pas un chatbot. C'est un framework d'intelligence d'affaires structure.
        </p>

        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[120px_1fr_1fr] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Competiteur</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Leur approche</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Avantage GhostX</span>
          </div>

          <div className="divide-y divide-gray-50">
            {[
              {
                competitor: "ChatGPT Enterprise",
                their: "Chat generique, pas de framework structure, pas de multi-agent",
                ours: "GHML = framework structure, Trisociation, CREDO, 12 bots specialises",
              },
              {
                competitor: "Consultants",
                their: "Coute 100-300K$/an par consultant, disponible sur RDV seulement",
                ours: "3-5% du cout, disponible 24/7, multi-expertise simultanee",
              },
              {
                competitor: "ERP / CRM",
                their: "Gestion operationnelle, pas d'intelligence decisionnelle",
                ours: "Intelligence C-Level : diagnostic, strategie, matching, scoring",
              },
              {
                competitor: "Autres AI",
                their: "LLM generiques sans methodologie proprietary, pas de persona",
                ours: "Trisociation + CREDO + Tableau Periodique = methodologie unique",
              },
            ].map((row) => (
              <div
                key={row.competitor}
                className="grid grid-cols-[120px_1fr_1fr] gap-2 px-4 py-3 items-start hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-bold text-gray-800">{row.competitor}</span>
                <div className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                  <span className="text-xs text-gray-500">{row.their}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-700 font-medium">{row.ours}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* FOOTER — Key Numbers */}
      {/* ============================================================ */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Pionniers cibles", value: "9", subtext: "Beta privee", color: "blue" },
            { label: "Scaling cible", value: "81", subtext: "9 x 9 referres", color: "emerald" },
            { label: "Boost Camp", value: "165j", subtext: "VIST+JUAN+CPRJ", color: "amber" },
            { label: "Orbit9 max", value: "6561", subtext: "9 cercles x3", color: "violet" },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 bg-white border border-gray-100 text-center">
              <div className={cn("text-lg font-bold", `text-${stat.color}-600`)}>{stat.value}</div>
              <div className="text-xs font-medium text-gray-700">{stat.label}</div>
              <div className="text-[9px] text-gray-400">{stat.subtext}</div>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
