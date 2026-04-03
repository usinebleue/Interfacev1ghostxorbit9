"use client";

/**
 * SimDashboardCreateur.tsx — Simulation Dashboard Createur Ghost Cognitif
 * 4 tabs: Vue d'ensemble, Mes Ghosts, Royautes, Leaderboard
 * Self-contained: mock data, light premium design, French quebecois
 */

import { useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Brain,
  TrendingUp,
  DollarSign,
  Trophy,
  Package,
  Star,
  ChevronUp,
  ChevronDown,
  Clock,
  CheckCircle2,
  Plus,
  Play,
  Crown,
  Zap,
  Award,
  Target,
  ArrowUpRight,
  Eye,
  Sparkles,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";

const UB_BLUE = "#073E5A";

// ═══════════════════════════════════════
// TYPES & DATA
// ═══════════════════════════════════════

type Tab = "overview" | "ghosts" | "royalties" | "leaderboard";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Vue d'ensemble", icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { key: "ghosts", label: "Mes Ghosts", icon: <Brain className="h-3.5 w-3.5" /> },
  { key: "royalties", label: "Royautes", icon: <DollarSign className="h-3.5 w-3.5" /> },
  { key: "leaderboard", label: "Leaderboard", icon: <Trophy className="h-3.5 w-3.5" /> },
];

const REVENUE_MONTHS = [
  { month: "Oct", value: 12000, pct: 17 },
  { month: "Nov", value: 18000, pct: 25 },
  { month: "Dec", value: 28000, pct: 39 },
  { month: "Jan", value: 45000, pct: 63 },
  { month: "Fev", value: 58000, pct: 81 },
  { month: "Mar", value: 72000, pct: 100 },
];

const ACTIVITY_FEED = [
  { color: "border-emerald-400 bg-emerald-50", text: "Marc Dubois a installe votre Ghost", time: "il y a 2h" },
  { color: "border-amber-400 bg-amber-50", text: "Royaute recue: 234$ (facturable de 15,600$ par Technologie ABC)", time: "il y a 5h" },
  { color: "border-blue-400 bg-blue-50", text: "Nouvelle evaluation 5/5: \"Ce Ghost m'a aide a closer un deal de 80K$\"", time: "hier" },
  { color: "border-purple-400 bg-purple-50", text: "Votre Ghost a ete recommande dans 3 Blueprints", time: "hier" },
  { color: "border-amber-400 bg-amber-50", text: "Vous etes #2 au classement des Ghosts Manufacturing", time: "cette semaine" },
];

const LEADERBOARD_DATA = [
  { rank: 1, badge: "crown", ghost: "Stratege 7 Entreprises", creator: "Carl Fugere", installs: 156, revenue: "8.7M$", royalties: "312K$", rating: 5.0 },
  { rank: 2, badge: "trophy", ghost: "Maitre Vendeur Equipements", creator: "Jean-Pierre T.", installs: 203, revenue: "2.3M$", royalties: "72K$", rating: 4.9 },
  { rank: 3, badge: "trophy", ghost: "Experte Lean Manufacturing", creator: "Marie-Claude L.", installs: 89, revenue: "890K$", royalties: "28K$", rating: 4.8 },
  { rank: 4, badge: "zap", ghost: "Reine Marketing B2B", creator: "Sophie N.", installs: 67, revenue: "670K$", royalties: "21K$", rating: 4.7 },
  { rank: 5, badge: "trophy", ghost: "Veteran Supply Chain", creator: "Robert G.", installs: 45, revenue: "450K$", royalties: "14K$", rating: 4.6 },
  { rank: 6, badge: "zap", ghost: "Coach Leadership", creator: "Isabelle M.", installs: 41, revenue: "380K$", royalties: "12K$", rating: 4.8 },
  { rank: 7, badge: "zap", ghost: "Architecte Solutions Cloud", creator: "David B.", installs: 38, revenue: "340K$", royalties: "11K$", rating: 4.5 },
  { rank: 8, badge: "none", ghost: "Expert Financement PME", creator: "Luc P.", installs: 34, revenue: "290K$", royalties: "9K$", rating: 4.4 },
  { rank: 9, badge: "none", ghost: "Maitre Chantier Construction", creator: "Andre M.", installs: 29, revenue: "250K$", royalties: "8K$", rating: 4.6 },
  { rank: 10, badge: "none", ghost: "Specialiste Import-Export", creator: "Kim T.", installs: 25, revenue: "210K$", royalties: "7K$", rating: 4.3 },
];

const PAYMENT_HISTORY = [
  { month: "Mars 2026", amount: "58,200$", status: "paid" },
  { month: "Fevrier 2026", amount: "45,100$", status: "paid" },
  { month: "Janvier 2026", amount: "28,800$", status: "paid" },
  { month: "Decembre 2025", amount: "18,400$", status: "paid" },
];

// ═══════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════

function KPICard({ icon, label, value, trend, trendLabel, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendLabel: string;
  color: string;
}) {
  const isPositive = trend.startsWith("+") || trend.startsWith("\u2191");
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
          isPositive ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"
        )}>
          {isPositive ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {trend}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{trendLabel}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ═══════════════════════════════════════
// TAB 1 — VUE D'ENSEMBLE
// ═══════════════════════════════════════

function TabOverview() {
  return (
    <div className="space-y-6">
      {/* Hero — Creator Profile */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white text-xl font-bold shadow-lg ring-2 ring-amber-200">
            JPT
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Jean-Pierre Tremblay</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200 shadow-sm">
                <Trophy className="h-3.5 w-3.5" />
                Fondateur
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-0.5">Maitre Vendeur Equipements Lourds</p>
            <p className="text-xs text-gray-400 mt-1">Membre depuis Janvier 2026</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          label="Revenus ce mois"
          value="72,450$"
          trend="\u219123%"
          trendLabel="vs mois dernier"
          color="bg-emerald-50"
        />
        <KPICard
          icon={<Package className="h-5 w-5 text-blue-600" />}
          label="Installations totales"
          value="203"
          trend="\u219112"
          trendLabel="cette semaine"
          color="bg-blue-50"
        />
        <KPICard
          icon={<BarChart3 className="h-5 w-5 text-purple-600" />}
          label="Facturable genere"
          value="2.3M$"
          trend="\u219118%"
          trendLabel="via les utilisateurs de mes Ghosts"
          color="bg-purple-50"
        />
        <KPICard
          icon={<Star className="h-5 w-5 text-amber-600" />}
          label="Note moyenne"
          value="4.9/5"
          trend="\u21910.1"
          trendLabel="base sur 847 avis"
          color="bg-amber-50"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader title="Revenus mensuels" subtitle="Progression des 6 derniers mois" />
        <div className="flex items-end gap-3 h-48 mt-4 px-2">
          {REVENUE_MONTHS.map((m, i) => {
            const barColors = [
              "from-blue-400 to-blue-500",
              "from-blue-400 to-cyan-500",
              "from-cyan-400 to-teal-500",
              "from-teal-400 to-emerald-500",
              "from-emerald-400 to-emerald-500",
              "from-emerald-500 to-green-500",
            ];
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-gray-700">
                  {(m.value / 1000).toFixed(0)}K$
                </span>
                <div className="w-full relative group">
                  <div
                    className={cn(
                      "w-full rounded-t-lg bg-gradient-to-t transition-all duration-300",
                      barColors[i]
                    )}
                    style={{ height: `${Math.max(m.pct * 1.6, 12)}px` }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-1">{m.month}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-2 px-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">
            Tendance: +502% en 6 mois
          </span>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader title="Activite recente" />
        <div className="space-y-3">
          {ACTIVITY_FEED.map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border-l-4",
                item.color
              )}
            >
              <div className="flex-1">
                <p className="text-sm text-gray-800">{item.text}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// TAB 2 — MES GHOSTS
// ═══════════════════════════════════════

function TabMesGhosts() {
  return (
    <div className="space-y-5">
      {/* Ghost 1 — Active */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Maitre Vendeur Equipements Lourds</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Actif
                </span>
                <span className="text-xs text-gray-400">Publie depuis 4 mois</span>
              </div>
            </div>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            Basique
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Installations</p>
              <p className="text-lg font-bold text-gray-900">156 <span className="text-sm font-normal text-gray-400">actives</span></p>
              <p className="text-xs text-gray-400">203 total, 47 desabonnes</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Revenue Store</p>
              <p className="text-lg font-bold text-gray-900">101,500 UT</p>
              <p className="text-xs text-gray-400">ventes + 9,400 UT/mois abo</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Revenue Royautes</p>
              <p className="text-lg font-bold text-emerald-700">58,000$/mois</p>
              <p className="text-xs text-gray-400">facturable total 2.3M$/mois</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Top utilisateur</p>
              <p className="text-sm font-semibold text-gray-900">Hydraulique Pro Inc.</p>
              <p className="text-xs text-emerald-600 font-medium">340K$ facture ce mois</p>
            </div>
          </div>

          {/* VITAA Impact */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Impact VITAA moyen</p>
            <div className="flex gap-2">
              {[
                { label: "V", value: "+32%", color: "bg-emerald-100 text-emerald-800" },
                { label: "I", value: "+18%", color: "bg-blue-100 text-blue-800" },
                { label: "T", value: "+12%", color: "bg-purple-100 text-purple-800" },
                { label: "Ar", value: "+24%", color: "bg-amber-100 text-amber-800" },
                { label: "Ac", value: "+15%", color: "bg-teal-100 text-teal-800" },
              ].map(v => (
                <div key={v.label} className={cn("flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold", v.color)}>
                  <span>{v.label}</span>
                  <span>{v.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm hover:shadow-md transition-all">
              <Sparkles className="h-3.5 w-3.5" />
              Ameliorer en Ghost Pro
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              <Eye className="h-3.5 w-3.5" />
              Voir les analytics detailles
            </button>
          </div>
        </div>
      </div>

      {/* Ghost 2 — In creation */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Negociateur B2B Expert</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  En creation
                </span>
                <span className="text-xs text-gray-400">Session 2/3 completee</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-600">Reprenez la ou vous avez laisse</p>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2.5 rounded-full" style={{ width: "66%" }} />
          </div>
          <p className="text-xs text-gray-400">66% complete</p>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-amber-500 text-white shadow-sm hover:bg-amber-600 transition-colors">
            <Play className="h-3.5 w-3.5" />
            Continuer l'Atelier Heritage
          </button>
        </div>
      </div>

      {/* Create new Ghost */}
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center gap-3 hover:border-gray-300 hover:bg-gray-50/50 transition-all cursor-pointer group">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
          <Plus className="h-6 w-6 text-gray-400 group-hover:text-gray-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">Creer un nouveau Ghost</p>
          <p className="text-xs text-gray-400 mt-1">Transformez une autre expertise en Ghost Cognitif</p>
          <p className="text-xs text-gray-400">Lancez un nouvel Atelier Video Heritage</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// TAB 3 — ROYAUTES
// ═══════════════════════════════════════

function TabRoyalties() {
  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Royautes ce mois</p>
          <p className="text-2xl font-bold text-gray-900">72,450$</p>
          <p className="text-xs text-gray-400 mt-1">58K$ facturable + 9.4K UT Store + 5K$ bonus</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Royautes cumulatives</p>
          <p className="text-2xl font-bold text-gray-900">287,800$</p>
          <p className="text-xs text-gray-400 mt-1">Depuis janvier 2026</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Prochain versement</p>
          <p className="text-2xl font-bold text-emerald-700">72,450$</p>
          <p className="text-xs text-gray-400 mt-1">Le 15 avril 2026</p>
        </div>
      </div>

      {/* Breakdown table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <SectionHeader title="Ventilation des revenus — Mars 2026" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-2.5 text-xs font-medium text-gray-500">Source</th>
                <th className="px-5 py-2.5 text-xs font-medium text-gray-500 text-right">Montant</th>
                <th className="px-5 py-2.5 text-xs font-medium text-gray-500 text-right">% du total</th>
                <th className="px-5 py-2.5 text-xs font-medium text-gray-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-gray-50/50">
                <td className="px-5 py-3 font-medium text-gray-900">Royaute sur facturable</td>
                <td className="px-5 py-3 text-right font-bold text-gray-900">58,000$</td>
                <td className="px-5 py-3 text-right">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">80%</span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">25% de la commission BT sur 2.3M$</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-5 py-3 font-medium text-gray-900">Ventes Store (85/15)</td>
                <td className="px-5 py-3 text-right font-bold text-gray-900">8,600$</td>
                <td className="px-5 py-3 text-right">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">12%</span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">203 installations x 500 UT x 85%</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-5 py-3 font-medium text-gray-900">Abonnements usage</td>
                <td className="px-5 py-3 text-right font-bold text-gray-900">1,500$</td>
                <td className="px-5 py-3 text-right">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">2%</span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">156 actifs x 50 UT x 85% x 0.89$</td>
              </tr>
              <tr className="hover:bg-gray-50/50 bg-emerald-50/30">
                <td className="px-5 py-3 font-medium text-emerald-800 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" />
                  Bonus performance
                </td>
                <td className="px-5 py-3 text-right font-bold text-emerald-700">4,350$</td>
                <td className="px-5 py-3 text-right">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">6%</span>
                </td>
                <td className="px-5 py-3 text-xs text-emerald-600">+5% bonus (facturable &gt; 100K$/mois) — Active!</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td className="px-5 py-3 text-gray-900">Total</td>
                <td className="px-5 py-3 text-right text-gray-900">72,450$</td>
                <td className="px-5 py-3 text-right">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">100%</span>
                </td>
                <td className="px-5 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <SectionHeader title="Historique des versements" />
        <div className="space-y-2">
          {PAYMENT_HISTORY.map((p) => (
            <div key={p.month} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-gray-800">{p.month}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-900">{p.amount}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  Verse
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commission structure */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-5 w-5 text-amber-600" />
          <h3 className="text-sm font-bold text-gray-900">Votre taux de royaute</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Base (Programme Fondateur)</span>
            <span className="text-sm font-bold text-gray-900">35%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-emerald-700">Bonus (facturable &gt; 100K$/mois)</span>
            <span className="text-sm font-bold text-emerald-700">+5%</span>
          </div>
          <div className="border-t border-amber-200 pt-2 mt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">Taux effectif sur la commission Brain Team</span>
            <span className="text-lg font-bold text-amber-800">40%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// TAB 4 — LEADERBOARD
// ═══════════════════════════════════════

function TabLeaderboard() {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Top 10 Ghosts Cognitifs — Mars 2026</h3>
            <p className="text-xs text-gray-400 mt-0.5">Classement par revenus totaux generes</p>
          </div>
          <Trophy className="h-5 w-5 text-amber-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 w-10">#</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Ghost</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Createur</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 text-right">Installations</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 text-right">Facturable</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 text-right">Royautes</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 text-right">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {LEADERBOARD_DATA.map((row) => {
                const isUser = row.rank === 2;
                const badgeIcon = row.badge === "crown"
                  ? <Crown className="h-4 w-4 text-amber-500" />
                  : row.badge === "trophy"
                    ? <Trophy className="h-4 w-4 text-amber-500" />
                    : row.badge === "zap"
                      ? <Zap className="h-4 w-4 text-blue-500" />
                      : null;

                return (
                  <tr
                    key={row.rank}
                    className={cn(
                      "transition-colors",
                      isUser
                        ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-l-amber-400"
                        : row.rank % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50/50",
                      !isUser && "hover:bg-gray-50"
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-sm font-bold",
                        row.rank === 1 ? "text-amber-600" : row.rank <= 3 ? "text-gray-700" : "text-gray-400"
                      )}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {badgeIcon}
                        <span className={cn(
                          "font-medium",
                          isUser ? "text-amber-900" : "text-gray-900"
                        )}>
                          {row.ghost}
                        </span>
                        {isUser && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 font-semibold">
                            VOUS
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.creator}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{row.installs}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{row.revenue}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">{row.royalties}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-0.5 text-amber-600 font-medium">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {row.rating.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Growth potential card */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Potentiel de croissance</h3>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Avec 203 installations et un facturable de 2.3M$/mois, vous etes a <span className="font-bold text-blue-700">72%</span> du palier suivant.
        </p>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
          <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full relative" style={{ width: "72%" }}>
            <div className="absolute -right-1 -top-1 w-5 h-5 rounded-full bg-white border-2 border-emerald-500 shadow" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <ArrowUpRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600">
              Pour atteindre <span className="font-semibold">#1</span>: +100 installations ou doubler le facturable par utilisateur
            </p>
          </div>
          <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-3">
            <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800">
              <span className="font-semibold">Conseil:</span> Mettez a jour votre Ghost avec de nouveaux scenarios pour augmenter l'adoption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function SimDashboardCreateur({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      {/* Header */}
      <div
        className="shrink-0 px-4 py-3 flex items-center justify-between border-b"
        style={{ backgroundColor: UB_BLUE }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white">Dashboard Createur</h1>
            <p className="text-xs text-white/60">Ghost Cognitif — Revenus & Performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/30">
            JPT
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="shrink-0 px-4 py-2 bg-white border-b border-gray-100">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium gap-1.5 rounded-lg flex items-center transition-all",
                activeTab === tab.key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "overview" && <TabOverview />}
        {activeTab === "ghosts" && <TabMesGhosts />}
        {activeTab === "royalties" && <TabRoyalties />}
        {activeTab === "leaderboard" && <TabLeaderboard />}
      </div>
    </div>
  );
}
