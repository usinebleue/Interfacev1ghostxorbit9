/**
 * MasterDettePage.tsx — Dette Technique
 * Reference GHML: Nettoyage, incoherences, chantiers de fond
 * Summary page — scannable, FINAL STATE, cards + grids + status badges
 */

import {
  AlertTriangle, FileCode, Paintbrush, Tag, RefreshCw,
  CheckCircle2, Clock, ArrowRight, Shield, Wrench,
  ListChecks, Ban, Eye, Layers, Code2, Server,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ================================================================
// HELPER — Status Badge
// ================================================================

function StatusBadge({ status }: { status: "done" | "en-retard" | "a-faire" | "futur" | "live" }) {
  const config = {
    "done": { label: "DONE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "live": { label: "LIVE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "en-retard": { label: "EN RETARD", className: "bg-red-100 text-red-700 border-red-200" },
    "a-faire": { label: "A FAIRE", className: "bg-amber-100 text-amber-700 border-amber-200" },
    "futur": { label: "FUTUR", className: "bg-blue-100 text-blue-600 border-blue-200" },
  }[status];

  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", config.className)}>
      {config.label}
    </span>
  );
}

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ================================================================
// DATA
// ================================================================

const BTML_FILES = [
  { file: "tableau_periodique.py", occurrences: "~70", examples: "ElementBTML, Spirale BTML, espace BTML" },
  { file: "session_credo.py", occurrences: "~10", examples: "ProjetBTML, architecture BTML, Tableau Periodique BTML" },
  { file: "orchestrateur.py", occurrences: "~12", examples: "primitives BTML, reactions BTML, Registres BTML" },
  { file: "modes_depart.py", occurrences: "~3", examples: "Modes de Depart BTML V2, Constantes BTML" },
  { file: "piliers_aiavt.py", occurrences: "~2", examples: "Piliers BTML V2, Double Diagnostic BTML" },
  { file: "routeur.py", occurrences: "~1", examples: "mode de reflexion BTML" },
  { file: "message_logger.py", occurrences: "~1", examples: "Bridge BTML V2/V3" },
  { file: "timetoken.py", occurrences: "~1", examples: "espace BTML" },
];

const KNOWN_ISSUES = [
  { issue: "Double PageLayout quand Page Type via Orbit9DetailView", severity: "medium" as const },
  { issue: "Score thresholds: VITAA (>=70/45/<45) vs Tab 6 F2 (80/60/<60) — lequel est bon?", severity: "medium" as const },
  { issue: "Icon box sizes: w-9 vs w-10 dans les gradient headers", severity: "low" as const },
  { issue: "Tab active state: bg-white/25 vs bg-white/30", severity: "low" as const },
  { issue: "BOT_BAND_COLORS dans CenterZone inclut encore BCC et BPO (ligne 61-62)", severity: "high" as const },
  { issue: "Google OAuth casse — sprint dedie necessaire", severity: "high" as const },
  { issue: "Swagger active en dev (variable _DEBUG)", severity: "low" as const },
];

const CRITICAL_FILES = [
  { file: "bridge_btml_connector.py", desc: "Point d'entree — si ca casse, TOUT tombe" },
  { file: "bridge.py", desc: "Telegram polling et routage 5 tiers" },
  { file: "config_bridge.py", desc: "Configuration centrale — API keys, tiers, budget" },
  { file: "context_builder.py", desc: "SOUL templates et contexte conversationnel" },
  { file: "bridge_database.py", desc: "Seul point d'acces PostgreSQL" },
  { file: ".env", desc: "API keys (ANTHROPIC, GOOGLE, TELEGRAM, GHOSTX)" },
  { file: "systemd service file", desc: "Gestion du service brain-bridge" },
];

// ================================================================
// MAIN COMPONENT
// ================================================================

export function MasterDettePage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={AlertTriangle}
          iconColor="text-rose-600"
          title="Dette Technique"
          subtitle="Nettoyage, incoherences, chantiers de fond"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ============================================================ */}
      {/* 1. Vue d'Ensemble */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">C.5.1</span>Vue d'Ensemble</h3>

        <Card className="p-4 bg-rose-50 border-rose-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <div>
              <div className="font-bold text-sm text-rose-800 mb-2">5 volets de nettoyage identifies</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { num: "1", label: "BTML Rename", status: "en-retard" as const },
                  { num: "2", label: "BCC+BPO Intrus", status: "a-faire" as const },
                  { num: "3", label: "Appellations", status: "a-faire" as const },
                  { num: "4", label: "Nomenclature", status: "futur" as const },
                  { num: "5", label: "Purge CSS", status: "a-faire" as const },
                ].map((v) => (
                  <div key={v.num} className="text-center p-2 bg-white rounded-lg border border-rose-100">
                    <div className="text-lg font-bold text-rose-600">V{v.num}</div>
                    <div className="text-[9px] text-gray-600 font-medium">{v.label}</div>
                    <div className="mt-1"><StatusBadge status={v.status} /></div>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1 text-xs text-rose-700">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-bold">Sprint dedie necessaire — PAS au milieu d'un sprint feature</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 shrink-0" />
                  <span>Backup complet OBLIGATOIRE avant toute modification</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 2. Volet 1 — BTML -> GHML Rename */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.5.2</span>Volet 1 — BTML &rarr; GHML Rename</h3>
          <StatusBadge status="en-retard" />
          <Badge variant="outline" className="text-[9px] font-bold">Sprint 7-8</Badge>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          ~100 remplacements dans 8 fichiers Python — script automatise prevu
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-1.5">
            {/* Header */}
            <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide flex-1">Fichier</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide w-16 text-center">Occur.</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide w-64 hidden md:block">Exemples</span>
            </div>

            {BTML_FILES.map((f) => (
              <div key={f.file} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <code className="text-xs font-mono text-gray-700 flex-1">{f.file}</code>
                <span className="text-xs font-bold text-gray-600 w-16 text-center">{f.occurrences}</span>
                <span className="text-[9px] text-gray-400 w-64 truncate hidden md:block">{f.examples}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-3 bg-amber-50 border-amber-200 mt-3">
          <div className="space-y-1 text-xs text-amber-700">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="font-bold">NE PAS renommer les noms de FICHIERS</span>
            </div>
            <div className="text-[9px] text-amber-600 ml-5">
              btml_primitives.py, bridge_btml_connector.py restent tels quels — les imports ne changent pas
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 3. Volet 2 — Eliminer BCC + BPO (Intrus) */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.5.3</span>Volet 2 — Eliminer BCC + BPO</h3>
          <StatusBadge status="a-faire" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Carl confirme (S42): ces 2 bots NE SONT PAS dans la plateforme — glisses via consolidations/confusions
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="h-4 w-4 text-red-500" />
              <span className="font-bold text-sm text-red-700">BCC (Catherine / CCO)</span>
              <Badge variant="outline" className="text-[9px] font-bold bg-cyan-100 text-cyan-700 border-cyan-200">cyan</Badge>
            </div>
            <div className="text-xs text-red-600 space-y-1">
              <div>~45 occurrences dans le code</div>
              <div className="text-[9px] text-red-500">simulation-data.ts, CarlOSPresence.tsx, types.ts, agents.py, context_builder.py...</div>
            </div>
          </Card>

          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="h-4 w-4 text-red-500" />
              <span className="font-bold text-sm text-red-700">BPO (Philippe / CPO)</span>
              <Badge variant="outline" className="text-[9px] font-bold bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200">fuchsia</Badge>
            </div>
            <div className="text-xs text-red-600 space-y-1">
              <div>~66 occurrences dans le code</div>
              <div className="text-[9px] text-red-500">memes fichiers + LiveChat.tsx, cahier-smart-data.ts...</div>
            </div>
          </Card>
        </div>

        <Card className="p-3 bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-bold text-xs text-emerald-700">Les 12 vrais bots</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["BCO", "BCT", "BCF", "BCM", "BCS", "BOO", "BFA", "BHR", "BIO", "BRO", "BLE", "BSE"].map((code) => (
              <span key={code} className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                {code}
              </span>
            ))}
          </div>
          <div className="text-[9px] text-emerald-600 mt-2">Voix ElevenLabs: deja nettoye (S42) — BOT_VOICES dans carlos_livekit_agent.py = 12 seulement</div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 4. Volet 3 — Appellations Incoherentes */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.5.4</span>Volet 3 — Appellations Incoherentes</h3>
          <StatusBadge status="a-faire" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Anciens noms de bots, codes obsoletes, references mortes — "du code propre sans rien briser" (Carl S42)
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-2">
            {[
              { ancien: "CIO (Isabelle)", nouveau: "CINO (Ines)", status: "Renomme S42 — verifier partout", done: true },
              { ancien: "cio-isabelle-standby-*.png", nouveau: "cino-ines-standby-v3.png", status: "Images renommees S42", done: true },
              { ancien: "BPO → Philippe / CPO", nouveau: "SUPPRIME (intrus)", status: "A nettoyer", done: false },
              { ancien: "BCC → Catherine / CCO", nouveau: "SUPPRIME (intrus)", status: "A nettoyer", done: false },
              { ancien: "BTML (ancien nom)", nouveau: "GHML (Ghost Modeling Language)", status: "~100 occurrences en retard", done: false },
            ].map((item) => (
              <div key={item.ancien} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                {item.done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                )}
                <code className="text-xs font-mono text-gray-500 line-through min-w-[180px]">{item.ancien}</code>
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                <code className="text-xs font-mono text-gray-800 min-w-[180px]">{item.nouveau}</code>
                <span className="text-[9px] text-gray-400 ml-auto">{item.status}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 5. Volet 4 — Refonte Nomenclature (FUTUR) */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.5.5</span>Volet 4 — Refonte Nomenclature</h3>
          <StatusBadge status="futur" />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Vision Carl (S42): codes lisibles bases sur le role — APRES volets 1-3
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-red-500" />
              <span className="font-bold text-xs text-red-700">Actuel — cryptique</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["BCO", "BCT", "BCF", "BCM", "BCS", "BOO"].map((code) => (
                <code key={code} className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600">
                  {code}
                </code>
              ))}
            </div>
            <div className="text-[9px] text-red-500 mt-2">Confondant, ne scale pas, pas intuitif</div>
          </Card>

          <Card className="p-4 bg-emerald-50 border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-emerald-500" />
              <span className="font-bold text-xs text-emerald-700">Vision — lisible</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["CEOB", "CTOB", "CFOB", "CMOB", "CSOB", "COOB"].map((code) => (
                <code key={code} className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600">
                  {code}
                </code>
              ))}
            </div>
            <div className="text-[9px] text-emerald-500 mt-2">Base sur le role, intuitif, scalable</div>
          </Card>
        </div>

        <Card className="p-3 bg-white border border-gray-100">
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span><strong>12 C-Level = 12 equipes</strong> (CEO, CTO, CFO, CMO, CSO, COO, CPO, CHRO, CINO, CRO, CLO, CISO)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Bots futurs se rangent sous leur C-Level sans noms propres individuels</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Le systeme de nommage doit supporter N bots par equipe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span><strong>Impact:</strong> renommage massif frontend + backend + LiveKit + ElevenLabs</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 6. Volet 5 — Purge Styles CSS */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.5.6</span>Volet 5 — Purge Styles CSS</h3>
          <StatusBadge status="a-faire" />
          <Badge variant="outline" className="text-[9px] font-bold">S44</Badge>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          ~1000 styles ecrits de memoire, incoherents entre pages — objectif: UNE structure standardisee
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-2">
            {[
              { problem: "Padding incoherents", detail: "p-4 / p-6 / px-5 au lieu de px-10 py-5 (standard)", icon: Paintbrush, color: "pink" },
              { problem: "Font sizes random", detail: "Tailles de texte variables entre pages similaires", icon: Code2, color: "violet" },
              { problem: "Gaps variables", detail: "gap-2 / gap-3 / gap-4 utilises sans coherence", icon: Layers, color: "blue" },
              { problem: "Wrapper manquant", detail: "Certaines pages sans max-w-4xl mx-auto px-10 py-5 pb-12", icon: Wrench, color: "amber" },
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <div key={item.problem} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <ItemIcon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", `text-${item.color}-500`)} />
                  <div>
                    <span className="text-xs font-medium text-gray-700">{item.problem}</span>
                    <span className="text-xs text-gray-500 ml-2">{item.detail}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-3 bg-blue-50 border-blue-200 mt-3">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-bold text-blue-700">Methode: audit page par page vs design-system.md</span>
          </div>
          <div className="text-[9px] text-blue-600">Reference: <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">memory/design-system.md</code> (189 lignes, TOUS les patterns)</div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 7. Incoherences Systeme Connues */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.5.7</span>Incoherences Systeme Connues</h3>
        </div>

        <div className="space-y-2">
          {KNOWN_ISSUES.map((item) => (
            <Card key={item.issue} className={cn(
              "p-3 border",
              item.severity === "high" ? "bg-red-50 border-red-200" :
              item.severity === "medium" ? "bg-amber-50 border-amber-200" :
              "bg-gray-50 border-gray-200"
            )}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  item.severity === "high" ? "text-red-500" :
                  item.severity === "medium" ? "text-amber-500" :
                  "text-gray-400"
                )} />
                <span className={cn(
                  "text-xs",
                  item.severity === "high" ? "text-red-700 font-bold" :
                  item.severity === "medium" ? "text-amber-700 font-medium" :
                  "text-gray-600"
                )}>{item.issue}</span>
                <Badge variant="outline" className={cn(
                  "text-[9px] font-bold ml-auto",
                  item.severity === "high" ? "bg-red-100 text-red-600 border-red-200" :
                  item.severity === "medium" ? "bg-amber-100 text-amber-600 border-amber-200" :
                  "bg-gray-100 text-gray-500 border-gray-200"
                )}>
                  {item.severity === "high" ? "HAUTE" : item.severity === "medium" ? "MOYENNE" : "BASSE"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 8. Plan d'Execution */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">C.5.8</span>Plan d'Execution</h3>
        <p className="text-xs text-gray-400 mb-3">
          Checklist ordonnee — volets 1-3 + 5 dans un sprint, volet 4 en sprint separe
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-3">
            {[
              { step: "1", label: "Backup complet", detail: "cp -r ~/brain-dev ~/brain-dev-backup-$(date +%Y%m%d_%H%M)", icon: Shield, color: "blue" },
              { step: "2", label: "Script automatise volets 1-3", detail: "~100 remplacements BTML→GHML + suppression BCC/BPO + appellations", icon: RefreshCw, color: "violet" },
              { step: "3", label: "Audit CSS volet 5", detail: "Page par page vs design-system.md — padding, fonts, gaps, wrappers", icon: Paintbrush, color: "pink" },
              { step: "4", label: "Tests complets", detail: "pytest + npx vite build + test live CarlOS dans Telegram + app.usinebleue.ai", icon: ListChecks, color: "emerald" },
              { step: "5", label: "Volet 4 nomenclature", detail: "Sprint SEPARE apres stabilisation des volets 1-3-5", icon: Tag, color: "amber" },
            ].map((s) => {
              const StepIcon = s.icon;
              return (
                <div key={s.step} className="flex items-start gap-3">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", `bg-${s.color}-100`)}>
                    <span className={cn("text-xs font-bold", `text-${s.color}-700`)}>{s.step}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StepIcon className={cn("h-3.5 w-3.5", `text-${s.color}-500`)} />
                      <span className="text-xs font-medium text-gray-700">{s.label}</span>
                    </div>
                    <div className="text-[9px] text-gray-500 mt-0.5 ml-5">{s.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 9. Fichiers Critiques */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.5.9</span>Fichiers Critiques</h3>
          <Badge variant="outline" className="text-[9px] font-bold bg-red-50 text-red-600 border-red-200">NE PAS toucher sans backup</Badge>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Ces fichiers peuvent casser le systeme entier si mal modifies
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-2">
            {CRITICAL_FILES.map((f) => (
              <div key={f.file} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <code className="text-xs font-mono font-bold text-gray-800">{f.file}</code>
                  <span className="text-xs text-gray-500 ml-2">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-3 bg-gray-50 border-gray-200 mt-3">
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span>Snapshot securite: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">snapshots/sprint62_fixes_20260217_1851/</code></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span>deploy.sh exclut: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">.env, credentials, tokens</code> du git add</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span>VPS2 Guardian: backup automatique daily a 3h</span>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
