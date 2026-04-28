/**
 * RetroactionTab.tsx — Onglet "Rétroaction" de la section Exécution
 *
 * Bilans, apprentissages et recommandations IA.
 * Structure: LivingHero compact violet → Sidebar w-[180px] + Contenu
 * Pattern: COPIE de OperationsView (hero + sidebar + contenu)
 * Données: Réutilise pattern bilanOptimisation existant dans OperationsView mock
 */

import { useState } from "react";
import {
  Home, CheckCircle2, TrendingUp, TrendingDown,
  BarChart3, BookOpen, Lightbulb, AlertTriangle,
  ThumbsUp, ThumbsDown, ArrowRight, Bot,
  Calendar, Filter,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { LivingHero } from "./shared/LivingHero";
import { PHASE_COLORS, BOT_AVATAR_MAP, type PhaseKey } from "./shared/dept-data";
import { SF } from "../core/styles";

// ═══ Types ═══

type RetroSidebarItem = "overview" | "cycles" | "apprentissages" | "recommandations" | "metriques";
type RetroFilter = "tout" | "chantiers" | "operations";
type RetroPeriod = "mois" | "trimestre" | "annee";

interface CompletedCycle {
  id: number;
  titre: string;
  type: "chantier" | "operation";
  dateCompletion: string;
  duree: string;
  scorePerformance: number;
  botPrimaire: string;
  resultats: string;
}

interface Apprentissage {
  type: "positif" | "negatif" | "action";
  message: string;
  source: string;
}

interface Recommandation {
  bot: string;
  message: string;
  priorite: "haute" | "moyenne" | "basse";
  categorie: string;
}

// ═══ Mock data ═══

const MOCK_CYCLES: CompletedCycle[] = [
  { id: 1, titre: "Migration CRM Salesforce", type: "chantier", dateCompletion: "2026-04-10", duree: "3 mois", scorePerformance: 88, botPrimaire: "CTOB", resultats: "Migration complétée. 230 utilisateurs transférés. 2 semaines de retard (intégration API)." },
  { id: 2, titre: "Onboarding Q1 2026", type: "operation", dateCompletion: "2026-03-31", duree: "Cycle Q1", scorePerformance: 94, botPrimaire: "CHROB", resultats: "12 employés onboardés. Satisfaction 94%. Temps moyen réduit de 2 semaines à 8 jours." },
  { id: 3, titre: "Audit sécurité annuel", type: "operation", dateCompletion: "2026-04-05", duree: "Cycle annuel", scorePerformance: 91, botPrimaire: "CISOB", resultats: "42 vulnérabilités corrigées. 3 critiques, 15 hautes. Score passé de 72% à 91%." },
  { id: 4, titre: "Sprint design V2 marque", type: "chantier", dateCompletion: "2026-03-20", duree: "6 semaines", scorePerformance: 76, botPrimaire: "CMOB", resultats: "Nouveau brand book livré. 3 itérations nécessaires (brief initial incomplet)." },
  { id: 5, titre: "Boucle PDCA Mars", type: "operation", dateCompletion: "2026-03-31", duree: "Mensuel", scorePerformance: 85, botPrimaire: "COOB", resultats: "14 KPIs mesurés. 11 dans la cible. 3 actions correctives lancées." },
];

const MOCK_APPRENTISSAGES: Apprentissage[] = [
  { type: "positif", message: "Le pipeline CI/CD a réduit les incidents de déploiement de 67%", source: "Pipeline CI/CD" },
  { type: "positif", message: "L'onboarding structuré en 8 jours augmente la rétention à 6 mois de 23%", source: "Onboarding Q1" },
  { type: "positif", message: "Les revues de code systématiques ont éliminé les bugs critiques en prod", source: "Pipeline CI/CD" },
  { type: "negatif", message: "Le brief incomplet du sprint design a causé 3 itérations évitables", source: "Sprint design V2" },
  { type: "negatif", message: "Sous-estimation du temps d'intégration API dans la migration CRM", source: "Migration CRM" },
  { type: "negatif", message: "Manque de documentation des processus opérationnels existants", source: "Boucle PDCA" },
  { type: "action", message: "Standardiser les briefs créatifs avec un template obligatoire", source: "Sprint design V2" },
  { type: "action", message: "Ajouter un buffer de 30% pour les intégrations tierces", source: "Migration CRM" },
  { type: "action", message: "Créer une base de connaissances opérationnelle dans la Data Room", source: "Boucle PDCA" },
  { type: "action", message: "Automatiser les tests de régression avant chaque cycle", source: "Pipeline CI/CD" },
];

const MOCK_RECOMMANDATIONS: Recommandation[] = [
  { bot: "COOB", message: "La régularité des opérations a augmenté de 8 points ce trimestre. Recommandation: transformer le chantier 'Pipeline CI/CD' en opération permanente avec SLA de 99.5%.", priorite: "haute", categorie: "Pérennisation" },
  { bot: "CEOB", message: "3 chantiers terminés sans retro formelle. Planifier une session de lessons learned consolidée avant le kick-off Q2.", priorite: "haute", categorie: "Gouvernance" },
  { bot: "CFOB", message: "Le coût moyen des chantiers a baissé de 12% grâce à la réutilisation de composants. Capitaliser ce pattern dans le playbook 'Efficience CAPEX'.", priorite: "moyenne", categorie: "Optimisation" },
  { bot: "CTOB", message: "Le temps de résolution des incidents a augmenté de 15% — investiguer la charge de l'équipe tech et évaluer un recrutement.", priorite: "moyenne", categorie: "Capacité" },
];

const MOCK_METRIQUES = [
  { label: "Régularité tendance", value: "87%", delta: "+3 pts", up: true, icon: BarChart3 },
  { label: "Vélocité projets", value: "1.2x", delta: "+0.1x", up: true, icon: TrendingUp },
  { label: "SLA respect", value: "96%", delta: "+2 pts", up: true, icon: CheckCircle2 },
  { label: "Amélioration continue", value: "14%", delta: "+5 pts QoQ", up: true, icon: Lightbulb },
];

// ═══ Composant principal ═══

export function RetroactionTab({ botCode }: { botCode: string }) {
  const [sidebarItem, setSidebarItem] = useState<RetroSidebarItem>("overview");
  const [filter, setFilter] = useState<RetroFilter>("tout");
  const [period, setPeriod] = useState<RetroPeriod>("trimestre");

  const filteredCycles = MOCK_CYCLES.filter(c => {
    if (filter === "chantiers") return c.type === "chantier";
    if (filter === "operations") return c.type === "operation";
    return true;
  });

  return (
    <div>
      {/* Hero — Living Hero compact violet */}
      <LivingHero
        blur1="bg-violet-100/70"
        blur2="bg-purple-100/60"
        subtitleColor="text-violet-600"
        subtitle="Amélioration continue"
        title="Bilan & Apprentissages"
        description="Cycles complétés, leçons apprises et recommandations IA pour améliorer votre exécution."
      >
        <div className="relative w-[360px] h-[140px]">
          <div className="glass-base absolute right-[70px] top-[10px] w-64 h-32 p-4 border-violet-100">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bilans</h4>
              <div className="w-4 h-4 rounded bg-violet-100 text-violet-500 flex items-center justify-center">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6 0h6m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v10m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4"/></svg>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="absolute left-0 top-0 bottom-0 w-[88%] bg-violet-400 rounded-full" /></div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="absolute left-0 top-0 bottom-0 bg-purple-400 rounded-full shadow-[0_0_10px_#a78bfa] anim-progress" /></div>
            </div>
          </div>
        </div>
      </LivingHero>

      {/* Sidebar + Contenu */}
      <div className="flex gap-4 mt-4">
        {/* Sidebar w-[180px] — copie SF pattern */}
        <div className={SF.sidebarW}>
          <div className={SF.sectionLabel}>Navigation</div>
          {([
            { key: "overview" as const, label: "Vue d'ensemble", icon: Home, count: null },
            { key: "cycles" as const, label: "Cycles complétés", icon: CheckCircle2, count: filteredCycles.length },
            { key: "apprentissages" as const, label: "Apprentissages", icon: BookOpen, count: MOCK_APPRENTISSAGES.length },
            { key: "recommandations" as const, label: "Recommandations", icon: Bot, count: MOCK_RECOMMANDATIONS.length },
            { key: "metriques" as const, label: "Métriques", icon: BarChart3, count: null },
          ]).map(item => (
            <button
              key={item.key}
              onClick={() => setSidebarItem(item.key)}
              className={cn(SF.btnBase, sidebarItem === item.key ? SF.btnActive : SF.btnInactive)}
            >
              <item.icon className={sidebarItem === item.key ? SF.iconActive : SF.iconInactive} />
              <span className={sidebarItem === item.key ? SF.labelActive : SF.labelInactive}>{item.label}</span>
              {item.count !== null && <span className={SF.count}>{item.count}</span>}
            </button>
          ))}

          <div className={SF.separator} />
          <div className={SF.sectionLabel}>Période</div>
          {([
            { key: "mois" as const, label: "Ce mois" },
            { key: "trimestre" as const, label: "Ce trimestre" },
            { key: "annee" as const, label: "Cette année" },
          ]).map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(SF.btnBase, period === p.key ? SF.btnActive : SF.btnInactive)}
            >
              <span className={period === p.key ? SF.labelActive : SF.labelInactive}>{p.label}</span>
            </button>
          ))}

          <div className={SF.separator} />
          <div className={SF.sectionLabel}>Type</div>
          {([
            { key: "tout" as const, label: "Tout" },
            { key: "chantiers" as const, label: "Chantiers" },
            { key: "operations" as const, label: "Opérations" },
          ]).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(SF.btnBase, filter === f.key ? SF.btnActive : SF.btnInactive)}
            >
              <span className={filter === f.key ? SF.labelActive : SF.labelInactive}>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 space-y-4">
          {/* Métriques KPI (overview + metriques) */}
          {(sidebarItem === "overview" || sidebarItem === "metriques") && (
            <div className="grid grid-cols-4 gap-3">
              {MOCK_METRIQUES.map((m, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon className="h-3.5 w-3.5 text-violet-500" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{m.label}</span>
                  </div>
                  <div className="text-xl font-extrabold text-gray-900">{m.value}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {m.up ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                    <span className={cn("text-[9px] font-medium", m.up ? "text-emerald-600" : "text-red-600")}>{m.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cycles complétés */}
          {(sidebarItem === "overview" || sidebarItem === "cycles") && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-gray-900">Cycles complétés</span>
                <span className="text-[9px] text-gray-400">{filteredCycles.length} terminés</span>
              </div>
              <div className="space-y-2">
                {filteredCycles.map(cycle => (
                  <div key={cycle.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        {cycle.type === "chantier"
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                          : <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                        }
                        <span className="text-[11px] font-bold text-gray-900 flex-1 truncate">{cycle.titre}</span>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                          cycle.scorePerformance >= 90 ? "bg-emerald-100 text-emerald-700" :
                          cycle.scorePerformance >= 75 ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {cycle.scorePerformance}%
                        </span>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", cycle.type === "chantier" ? "bg-orange-50 text-orange-600" : "bg-cyan-50 text-cyan-600")}>
                          {cycle.type === "chantier" ? "CAPEX" : "OPEX"}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mb-1.5">{cycle.resultats}</p>
                      <div className="flex items-center gap-3">
                        {BOT_AVATAR_MAP[cycle.botPrimaire] && (
                          <img src={BOT_AVATAR_MAP[cycle.botPrimaire]} alt="" className="w-5 h-5 rounded-full object-cover ring-1 ring-gray-200" />
                        )}
                        <span className="text-[9px] text-gray-400">{cycle.duree}</span>
                        <span className="text-[9px] text-gray-400">Terminé le {cycle.dateCompletion}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apprentissages — 3 colonnes (positifs / négatifs / actions) */}
          {(sidebarItem === "overview" || sidebarItem === "apprentissages") && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-3.5 w-3.5 text-violet-500" />
                <span className="text-xs font-bold text-gray-900">Apprentissages</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* Positifs */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-700">Ce qui a bien fonctionné</span>
                  </div>
                  <div className="space-y-1.5">
                    {MOCK_APPRENTISSAGES.filter(a => a.type === "positif").map((a, i) => (
                      <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-emerald-50 rounded-lg px-2.5 py-2 border border-emerald-100">
                        <div>{a.message}</div>
                        <div className="text-[9px] text-emerald-500 mt-1 font-medium">{a.source}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Négatifs */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-[10px] font-bold text-red-700">Ce qu'on doit améliorer</span>
                  </div>
                  <div className="space-y-1.5">
                    {MOCK_APPRENTISSAGES.filter(a => a.type === "negatif").map((a, i) => (
                      <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-red-50 rounded-lg px-2.5 py-2 border border-red-100">
                        <div>{a.message}</div>
                        <div className="text-[9px] text-red-500 mt-1 font-medium">{a.source}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Actions */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-700">Actions à entreprendre</span>
                  </div>
                  <div className="space-y-1.5">
                    {MOCK_APPRENTISSAGES.filter(a => a.type === "action").map((a, i) => (
                      <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-blue-50 rounded-lg px-2.5 py-2 border border-blue-100">
                        <div>{a.message}</div>
                        <div className="text-[9px] text-blue-500 mt-1 font-medium">{a.source}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommandations IA */}
          {(sidebarItem === "overview" || sidebarItem === "recommandations") && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-3.5 w-3.5 text-violet-500" />
                <span className="text-xs font-bold text-gray-900">Recommandations IA</span>
                <span className="text-[9px] text-gray-400">{MOCK_RECOMMANDATIONS.length} suggestions</span>
              </div>
              <div className="space-y-2">
                {MOCK_RECOMMANDATIONS.map((rec, i) => {
                  const prioColor = rec.priorite === "haute" ? "bg-red-100 text-red-700" : rec.priorite === "moyenne" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600";
                  return (
                    <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
                      <div className="p-3 flex gap-3">
                        {BOT_AVATAR_MAP[rec.bot] && (
                          <img src={BOT_AVATAR_MAP[rec.bot]} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", prioColor)}>{rec.priorite}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-violet-50 text-violet-600">{rec.categorie}</span>
                          </div>
                          <p className="text-[10px] text-gray-700 leading-relaxed">{rec.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
