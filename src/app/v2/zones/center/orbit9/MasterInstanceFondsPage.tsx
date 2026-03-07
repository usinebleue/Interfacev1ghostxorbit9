/**
 * MasterInstanceFondsPage.tsx — Instance Fonds d'Investissement (Niveau 2)
 * Source: Spec-Instance-Fonds-Investissement.md + Plan-Conquete-9-Fonds.md
 * Master GHML — Session 48
 */

import {
  Building2, Layers, Database, Shield, Users, Globe,
  TrendingUp, BarChart3, Target, Zap, ArrowRight,
  CheckCircle2, DollarSign, Network, Crown, Star,
  FileText, AlertTriangle, Brain, PieChart, Lock,
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
// DATA
// ======================================================================

const ARCHITECTURE_LEVELS = [
  { level: "Niveau 1", name: "Instance Entreprise", desc: "CarlOS pour une PME individuelle", color: "blue", icon: Building2 },
  { level: "Niveau 2", name: "Instance Fonds", desc: "Vue portefeuille pour gestionnaire de fonds", color: "emerald", icon: PieChart },
  { level: "Niveau 3", name: "Ecosysteme", desc: "Vue multi-fonds, intelligence croisee", color: "violet", icon: Globe },
];

const FONDS_CIBLES = [
  { name: "CDPQ", aum: "517G$", type: "Caisse de depot", temp: "Tiede", maturiteIA: "Elevee" },
  { name: "BDC", aum: "43G$", type: "Banque dev.", temp: "Chaud", maturiteIA: "Moyenne" },
  { name: "Fonds FTQ", aum: "23G$", type: "Travailleur", temp: "Tiede", maturiteIA: "Faible" },
  { name: "Novacap", aum: "10.5G$", type: "PE", temp: "Froid", maturiteIA: "Elevee" },
  { name: "IQ", aum: "7.5G$", type: "Gouvernement", temp: "Chaud", maturiteIA: "Moyenne" },
  { name: "Claridge", aum: "5.25G$", type: "Family office", temp: "Tiede", maturiteIA: "Moyenne" },
  { name: "Fondaction", aum: "4.28G$", type: "ESG/CSN", temp: "Chaud", maturiteIA: "Faible" },
  { name: "CRCD", aum: "2.81G$", type: "Desjardins", temp: "Tiede", maturiteIA: "Faible" },
  { name: "Teralys", aum: "2.5G$", type: "Fonds de fonds", temp: "Chaud", maturiteIA: "Elevee" },
];

const PRICING_FONDS = [
  { tier: "Starter", prix: "9,995$/mois", detail: "≤100 PME portefeuille", features: ["Dashboard portefeuille", "Alertes Triangle du Feu", "Rapports trimestriels"] },
  { tier: "Pro", prix: "24,995$/mois", detail: "≤1,000 PME", features: ["+ Heatmap VITAA", "Synergies intra-portefeuille", "Intelligence croisee"] },
  { tier: "Enterprise", prix: "49,995$/mois", detail: "Illimite", features: ["+ Multi-fonds", "API custom", "MILA predictif", "White-label"] },
];

const DOMINO_PHASES = [
  { phase: "Phase 1", name: "Cheval de Troie", desc: "Teralys (fonds de fonds) — 4 LPs = CDPQ+FTQ+Fondaction+IQ. Convaincre 1 = atteindre 4.", timing: "Q2 2026" },
  { phase: "Phase 2", name: "Effet Domino", desc: "Fondaction (Plan B) → BDC (federal, PME focus). Les premiers clients validant pour les suivants.", timing: "Q3-Q4 2026" },
  { phase: "Phase 3", name: "Consortium", desc: "3+ fonds ensemble = partage de couts, intelligence croisee, gouvernance partagee.", timing: "2027" },
  { phase: "Phase 4", name: "Export", desc: "Modele valide au QC → Canada → Francophonie → Global.", timing: "2028+" },
];

const RAISONS_MASSUES = [
  { titre: "Souverainete", desc: "Donnees financieres QC hebergees au QC, pas chez BlackRock" },
  { titre: "Cout", desc: "10-50K$/mois vs 1-5M$/an pour Aladdin" },
  { titre: "Anti-Herding", desc: "Eviter le comportement moutonnier des grands fonds" },
  { titre: "Ecosysteme", desc: "REAI + 130 manufacturiers = reseau deja en place" },
  { titre: "Timing", desc: "Post-Northvolt, les fonds cherchent des outils de detection" },
  { titre: "Dev. economique", desc: "Orbit9 = impact reel sur les PME du portefeuille" },
  { titre: "Langue", desc: "Francais QC natif, pas traduit de l'anglais" },
];

const DB_TABLES = [
  { name: "fund_portfolio", desc: "Liens fonds → entreprises avec % participation" },
  { name: "fund_kpis_cache", desc: "KPIs agreges pre-calcules (refresh quotidien)" },
  { name: "fund_alerts", desc: "Alertes Triangle du Feu pour le portefeuille" },
  { name: "fund_cross_intel", desc: "Intelligence croisee inter-entreprises" },
  { name: "fund_managers", desc: "Utilisateurs gestionnaires avec permissions RLS" },
];

// ======================================================================
// MAIN COMPONENT
// ======================================================================

export function MasterInstanceFondsPage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Building2}
          iconColor="text-emerald-600"
          title="Instance Fonds (Niveau 2)"
          subtitle="Architecture portefeuille, 9 fonds cibles (616G$ AUM), strategie domino, pricing"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ARCHITECTURE 3 NIVEAUX */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Architecture 3 Niveaux</h3>
        <div className="flex flex-col md:flex-row gap-3">
          {ARCHITECTURE_LEVELS.map((lvl, i) => {
            const Icon = lvl.icon;
            return (
              <div key={lvl.level} className="flex-1 flex items-center gap-2">
                <Card className={cn("flex-1 p-4 border shadow-sm", `border-${lvl.color}-200`)}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", `bg-${lvl.color}-100`)}>
                      <Icon className={cn("h-4 w-4", `text-${lvl.color}-600`)} />
                    </div>
                    <Badge className={cn("text-[9px]", `bg-${lvl.color}-100 text-${lvl.color}-700 border-${lvl.color}-200`)}>{lvl.level}</Badge>
                  </div>
                  <div className="text-xs font-bold text-gray-800">{lvl.name}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{lvl.desc}</div>
                </Card>
                {i < 2 && <ArrowRight className="h-4 w-4 text-gray-300 shrink-0 hidden md:block" />}
              </div>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* 9 FONDS CIBLES */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">9 Fonds Quebecois Cibles</h3>
        <p className="text-xs text-gray-400 mb-4">~616G$ AUM cumule, 7,000+ entreprises portefeuille.</p>

        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_70px_90px_60px_80px] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-500 uppercase">Fonds</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">AUM</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Type</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Temp.</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">IA Maturite</span>
          </div>
          <div className="divide-y divide-gray-50">
            {FONDS_CIBLES.map((f) => (
              <div key={f.name} className="grid grid-cols-[1fr_70px_90px_60px_80px] gap-2 px-4 py-2.5 items-center">
                <span className="text-xs font-bold text-gray-800">{f.name}</span>
                <span className="text-xs text-gray-600">{f.aum}</span>
                <span className="text-[9px] text-gray-500">{f.type}</span>
                <Badge className={cn("text-[9px] w-fit",
                  f.temp === "Chaud" ? "bg-red-100 text-red-700 border-red-200" :
                  f.temp === "Tiede" ? "bg-amber-100 text-amber-700 border-amber-200" :
                  "bg-blue-100 text-blue-700 border-blue-200"
                )}>{f.temp}</Badge>
                <Badge className={cn("text-[9px] w-fit",
                  f.maturiteIA === "Elevee" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                  f.maturiteIA === "Moyenne" ? "bg-amber-100 text-amber-700 border-amber-200" :
                  "bg-gray-100 text-gray-500 border-gray-200"
                )}>{f.maturiteIA}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-3 p-3 bg-violet-50 border border-violet-100 shadow-sm">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-violet-600 shrink-0" />
            <p className="text-xs text-violet-700">
              <span className="font-bold">Premier domino recommande: Teralys</span> — fonds de fonds dont les 4 LPs sont CDPQ, FTQ, Fondaction et IQ.
              Convaincre Teralys = atteindre 4 fonds d'un coup.
            </p>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* STRATEGIE DOMINO */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Strategie Domino (4 phases)</h3>
        <div className="space-y-2">
          {DOMINO_PHASES.map((p, i) => (
            <Card key={p.phase} className="p-4 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  i === 0 ? "bg-red-100" : i === 1 ? "bg-amber-100" : i === 2 ? "bg-emerald-100" : "bg-violet-100"
                )}>
                  <span className={cn("text-sm font-bold",
                    i === 0 ? "text-red-600" : i === 1 ? "text-amber-600" : i === 2 ? "text-emerald-600" : "text-violet-600"
                  )}>{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-800">{p.phase} — {p.name}</span>
                    <Badge className="ml-auto bg-gray-100 text-gray-500 border-gray-200 text-[9px]">{p.timing}</Badge>
                  </div>
                  <p className="text-xs text-gray-600">{p.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 7 RAISONS MASSUES */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">7 Raisons Massues pour les Fonds</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {RAISONS_MASSUES.map((r) => (
            <Card key={r.titre} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-gray-800">{r.titre}</span>
              </div>
              <p className="text-[9px] text-gray-500 ml-5">{r.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* PRICING FONDS */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Pricing Instance Fonds</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRICING_FONDS.map((p, i) => (
            <Card key={p.tier} className={cn("p-0 overflow-hidden bg-white border shadow-sm",
              i === 2 ? "border-violet-200 ring-1 ring-violet-100" : "border-gray-100"
            )}>
              <div className={cn("px-4 py-3",
                i === 0 ? "bg-blue-50 border-b border-blue-100" :
                i === 1 ? "bg-emerald-50 border-b border-emerald-100" :
                "bg-violet-50 border-b border-violet-100"
              )}>
                <div className="text-xs font-bold text-gray-800">{p.tier}</div>
                <div className="text-lg font-bold text-gray-900">{p.prix}</div>
                <div className="text-[9px] text-gray-500">{p.detail}</div>
              </div>
              <div className="p-4 space-y-1.5">
                {p.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[9px] text-gray-600">{f}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* SCHEMA DB */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">Schema PostgreSQL (5 tables)</h3>
        <p className="text-xs text-gray-400 mb-4">Tables additionnelles pour l'instance fonds, avec RLS.</p>

        <div className="space-y-2">
          {DB_TABLES.map((t) => (
            <Card key={t.name} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <code className="text-xs font-mono font-bold text-gray-800">{t.name}</code>
                <span className="text-[9px] text-gray-500">— {t.desc}</span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-3 p-3 bg-blue-50 border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-700">
              <span className="font-bold">4 niveaux de permissions:</span> Minimal (score agrege), Standard (VITAA), Complet (financiers), Collaboratif (inter-fonds).
            </p>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* INTEGRATION MILA */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Integration MILA (IA Predictive)</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { model: "Predictif Churn", desc: "Detection precoce de PME a risque dans le portefeuille" },
            { model: "Anomalie Detection", desc: "Identification de patterns financiers inhabituels" },
            { model: "Synergie NLP", desc: "Matching semantique entre competences des PME" },
            { model: "Scoring Evolution", desc: "Trajectoire VITAA predictive a 6-12 mois" },
          ].map((m) => (
            <Card key={m.model} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                <span className="text-xs font-bold text-gray-800">{m.model}</span>
              </div>
              <p className="text-[9px] text-gray-500">{m.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ROI MATH */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">ROI Math — 9 Fonds</h3>
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 shadow-sm">
          <div className="text-center space-y-3">
            <div>
              <div className="text-[9px] text-gray-500 uppercase">Total AUM 9 fonds</div>
              <div className="text-2xl font-bold text-gray-800">~616G$</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-emerald-100">
                <div className="text-[9px] text-gray-500">0.2% amelioration</div>
                <div className="text-lg font-bold text-emerald-600">1,232M$</div>
                <div className="text-[9px] text-gray-400">gain annuel</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-emerald-100">
                <div className="text-[9px] text-gray-500">Cout GhostX</div>
                <div className="text-lg font-bold text-gray-700">3.06M$</div>
                <div className="text-[9px] text-gray-400">an (9 x 28K$/mois)</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-emerald-100">
                <div className="text-[9px] text-gray-500">ROI</div>
                <div className="text-lg font-bold text-violet-700">403x</div>
                <div className="text-[9px] text-gray-400">retour</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* SOURCES */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Documents Source</h3>
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-2">
            {[
              { name: "Spec-Instance-Fonds-Investissement.md", desc: "1,426 lignes — architecture Level 2 complete" },
              { name: "Plan-Conquete-9-Fonds.md", desc: "583 lignes — strategie domino, 590G$" },
              { name: "Proposition-Valeur-GhostX-Fonds.md", desc: "1,320 lignes — 9 dimensions de valeur" },
              { name: "MEGA-PROMPT-BLACKROCK-ALADDIN.md", desc: "428 lignes — competitive intelligence" },
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
