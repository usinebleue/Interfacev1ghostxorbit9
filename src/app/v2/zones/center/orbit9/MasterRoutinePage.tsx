/**
 * MasterRoutinePage.tsx — Routine Dev & Securite
 * Reference: memory/dev-routine.md (routine beton arme)
 * Covers: development routine, security protocols, audit procedures, all established protocols
 * Single scrollable page (no tabs) — 12 sections with cards, grids, status badges
 */

import {
  Shield, Users, Lock, Unlock, CheckCircle2, Play,
  Search, FileText, Code2, Eye, AlertTriangle,
  Terminal, ArrowRight, ArrowDown, Zap, Server,
  ClipboardCheck, BookOpen, RefreshCw, AlertOctagon,
  Rocket, XCircle, GitBranch, Database, Globe,
  Triangle, FileCheck, Activity, Gauge,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ================================================================
// HELPERS
// ================================================================

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

function SectionNumber({ num, color }: { num: string; color: string }) {
  return (
    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", `bg-${color}-100`)}>
      <span className={cn("text-xs font-bold", `text-${color}-700`)}>{num}</span>
    </div>
  );
}

function CheckItem({ children, checked = false }: { children: React.ReactNode; checked?: boolean }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <div className={cn(
        "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5",
        checked ? "bg-emerald-100 border-emerald-300" : "bg-gray-50 border-gray-300"
      )}>
        {checked && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
      </div>
      <span className="text-xs text-gray-700">{children}</span>
    </div>
  );
}

// ================================================================
// DATA
// ================================================================

const GATE_STEPS = [
  {
    gate: "GATE 1",
    label: "RECHERCHE",
    icon: Search,
    color: "blue",
    locked: true,
    desc: "Grep/Glob, lire docs, chercher patterns existants",
    cmd: 'python3 .claude/hooks/gate.py open research "description"',
  },
  {
    gate: "GATE 2",
    label: "PLAN",
    icon: FileText,
    color: "violet",
    locked: true,
    desc: "Gemini pre-vol, plan ecrit, attendre GO de Carl",
    cmd: 'python3 .claude/hooks/gate.py open plan "description"',
  },
  {
    gate: "GATE 3",
    label: "CODE (auto)",
    icon: Code2,
    color: "amber",
    locked: true,
    desc: "Lire design-system.md → debloque auto (expire 4h)",
    cmd: "Automatique apres lecture de design-system.md",
  },
  {
    gate: "CODER",
    label: "EXECUTION",
    icon: Play,
    color: "emerald",
    locked: false,
    desc: "Seulement ici — codage autorise",
    cmd: "",
  },
  {
    gate: "GATE 4",
    label: "VERIFICATION",
    icon: Eye,
    color: "cyan",
    locked: true,
    desc: "Build, tests, Gemini post-vol, audit cross-page",
    cmd: 'python3 .claude/hooks/gate.py open verify "description"',
  },
];

const RED_ALERTS = [
  { situation: "Pattern pas dans design-system.md", action: "STOP → demander a Carl", severity: "critical" as const },
  { situation: "Fichier critique (bridge_*.py)", action: "STOP → backup AVANT", severity: "critical" as const },
  { situation: "Docs strategiques a modifier", action: "STOP → presenter a Carl, attendre OK", severity: "critical" as const },
  { situation: "Build qui echoue", action: "STOP → corriger avant de continuer", severity: "high" as const },
  { situation: "Gemini sentinel score < 8/10", action: "STOP → corriger TOUTES les deviations", severity: "high" as const },
  { situation: "Gemini sentinel verdict STOP", action: "STOP → revoir le plan avec Carl", severity: "critical" as const },
  { situation: "Credential/API key en dur dans le code", action: "STOP → deplacer dans .env IMMEDIATEMENT", severity: "critical" as const },
  { situation: "test_invariants.py erreur critique", action: "STOP → corriger AVANT de coder", severity: "high" as const },
  { situation: "CORS wildcard detecte", action: "STOP → restreindre a usinebleue.ai", severity: "critical" as const },
  { situation: "Incoherence entre pages", action: "STOP → lister + proposer fix", severity: "high" as const },
  { situation: "Doute sur ce que Carl veut", action: "STOP → demander clarification", severity: "high" as const },
];

const SOURCES_VERITE = [
  { sujet: "Decisions", source: "Journal Decisions", fichier: "JOURNAL-DECISIONS.md" },
  { sujet: "Sprint status", source: "Sprint Tracker", fichier: "memory/MEMORY.md" },
  { sujet: "Sprint details", source: "Roadmap V3.x", fichier: "docs/Roadmap-V3.0.md" },
  { sujet: "Standards UI", source: "Design System", fichier: "memory/design-system.md" },
  { sujet: "Produit/vision", source: "Bible Produit", fichier: "docs/Bible-Produit-GhostX.md" },
  { sujet: "Workflow dev", source: "Routine beton arme", fichier: "memory/dev-routine.md" },
  { sujet: "Config projet", source: "CLAUDE.md", fichier: "CLAUDE.md" },
  { sujet: "Architecture", source: "Architecture Globale", fichier: "docs/Architecture-Globale-GhostX.md" },
  { sujet: "Historique sessions", source: "Sessions Archive", fichier: "memory/sessions-archive.md" },
];

const QUALITY_METRICS = [
  { id: 1, question: "Lu design-system.md avant frontend?", expected: "OUI" },
  { id: 2, question: "Copie patterns depuis source (pas de memoire)?", expected: "OUI" },
  { id: 3, question: "Verifie coherence cross-page?", expected: "OUI" },
  { id: 4, question: "Invente nouveau pattern sans validation?", expected: "NON" },
  { id: 5, question: "Build passe (vite build / import)?", expected: "OUI" },
  { id: 6, question: "Mis a jour la memoire (MEMORY.md)?", expected: "OUI" },
  { id: 7, question: "SPRINT TRACKER a jour dans MEMORY.md?", expected: "OUI" },
  { id: 8, question: "CLAUDE.md priorites coherent avec SPRINT TRACKER?", expected: "OUI" },
  { id: 9, question: "Gemini sentinel PRE-VOL appele avant de coder?", expected: "OUI" },
  { id: 10, question: "Gemini sentinel POST-VOL appele apres avoir code?", expected: "OUI" },
  { id: 11, question: "test_invariants.py roule en debut de session?", expected: "OUI" },
  { id: 12, question: "Aucun credential en dur dans le code modifie?", expected: "OUI" },
];

// ================================================================
// DATA — Anti-Patterns (merged from MasterFlowPage)
// ================================================================

const ANTI_PATTERNS = [
  { bad: "Ecrire un style de memoire", good: "COPIER-COLLER depuis design-system.md" },
  { bad: "Inventer un pattern \"similaire\"", good: "Utiliser le pattern EXACT ou demander Carl" },
  { bad: "Ajouter des ameliorations non demandees", good: "Modifier UNIQUEMENT ce qui est demande" },
  { bad: "Skip l'audit cross-page", good: "Grep + verifier CHAQUE page touchee" },
  { bad: "Taille de texte 10px au lieu de 9px", good: "Toujours utiliser la taille 9px standard" },
  { bad: "Icones trop petites (3x3 au lieu de 3.5x3.5)", good: "Icones: toujours 3.5x3.5 ou 4x4" },
  { bad: "Wrapper sans max-w-4xl mx-auto px-10 py-5 pb-12", good: "Utiliser PageLayout standard" },
];

// ================================================================
// DATA — Rollback & Deploy (merged from MasterFlowPage)
// ================================================================

const ROLLBACK_STEPS = [
  { cmd: "git checkout -- .", desc: "Annuler les changements locaux" },
  { cmd: "cp -r ~/brain-dev-backup-DERNIER/* ~/brain-dev/", desc: "Restaurer depuis backup" },
  { cmd: "sudo systemctl restart brain-bridge", desc: "Redemarrer le service" },
  { cmd: "bash deploy.sh", desc: "Redeployer la version stable" },
];

const QUICK_COMMANDS = [
  { label: "Build frontend", cmd: "cd Interfacev1ghostxorbit9 && npx vite build" },
  { label: "Tests backend", cmd: "python3 -m pytest test_*.py -v" },
  { label: "Deploy", cmd: "bash deploy.sh" },
  { label: "Restart bridge", cmd: "sudo systemctl restart brain-bridge" },
  { label: "Restart API", cmd: "pkill -f uvicorn; nohup python3 -m uvicorn api_rest:app --host 127.0.0.1 --port 8000 &" },
  { label: "Status", cmd: "sudo systemctl status brain-bridge" },
  { label: "Logs live", cmd: "sudo journalctl -u brain-bridge -f" },
];

// ================================================================
// MAIN COMPONENT
// ================================================================

export function MasterRoutinePage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Shield}
          iconColor="text-cyan-600"
          title="Routine & Flow"
          subtitle="Routine, anti-patterns, rollback, deploy, audit"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ============================================================ */}
      {/* 1. Trisociation de Qualite */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <SectionNumber num="1" color="cyan" />
          <h3 className="text-base font-bold text-gray-800">Trisociation de Qualite</h3>
        </div>

        {/* Visual Triangle */}
        <Card className="p-5 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 shadow-sm mb-4">
          <div className="flex flex-col items-center mb-4">
            {/* Top vertex: Carl */}
            <div className="flex flex-col items-center mb-3">
              <div className="w-14 h-14 rounded-xl bg-cyan-100 border-2 border-cyan-300 flex items-center justify-center shadow-sm">
                <Users className="h-4 w-4 text-cyan-700" />
              </div>
              <span className="text-xs font-bold text-cyan-800 mt-1.5">Carl</span>
              <span className="text-[9px] text-cyan-600">vision / decisions</span>
            </div>

            {/* Connecting lines (visual) */}
            <div className="flex items-center gap-1 text-cyan-300 mb-1">
              <div className="w-12 h-px bg-cyan-200 rotate-[30deg]" />
              <span className="text-[9px] font-bold text-cyan-500 px-2">TRISOCIATION</span>
              <div className="w-12 h-px bg-cyan-200 -rotate-[30deg]" />
            </div>

            {/* Bottom vertices: Claude + Gemini */}
            <div className="flex items-center gap-12">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-violet-100 border-2 border-violet-300 flex items-center justify-center shadow-sm">
                  <Code2 className="h-4 w-4 text-violet-700" />
                </div>
                <span className="text-xs font-bold text-violet-800 mt-1.5">Claude</span>
                <span className="text-[9px] text-violet-600">code / execution</span>
              </div>

              <div className="flex items-center gap-1 mt-4">
                <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 rotate-180" />
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center shadow-sm">
                  <Eye className="h-4 w-4 text-amber-700" />
                </div>
                <span className="text-xs font-bold text-amber-800 mt-1.5">Gemini</span>
                <span className="text-[9px] text-amber-600">sentinel / audit</span>
              </div>
            </div>
          </div>

          {/* Role descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
            <div className="bg-white/70 rounded-lg p-2.5 border border-cyan-100">
              <div className="text-[9px] font-bold text-cyan-700 uppercase tracking-wide mb-1">Carl</div>
              <div className="text-[9px] text-gray-600">Conceptualise, decide, valide</div>
            </div>
            <div className="bg-white/70 rounded-lg p-2.5 border border-violet-100">
              <div className="text-[9px] font-bold text-violet-700 uppercase tracking-wide mb-1">Claude</div>
              <div className="text-[9px] text-gray-600">Code, execute, deploie</div>
            </div>
            <div className="bg-white/70 rounded-lg p-2.5 border border-amber-100">
              <div className="text-[9px] font-bold text-amber-700 uppercase tracking-wide mb-1">Gemini</div>
              <div className="text-[9px] text-gray-600">Audite AVANT et APRES chaque bloc</div>
            </div>
          </div>
        </Card>

        {/* Tools */}
        <Card className="p-3 bg-white border border-gray-100 shadow-sm">
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-2">Outils</div>
          <div className="space-y-1.5">
            {[
              { tool: "gemini_sentinel.py [pre|post|sprint]", desc: "Audit Gemini avant/apres/sprint" },
              { tool: "test_invariants.py", desc: "14 SOULs, endpoints, tables, permissions" },
              { tool: ".claude/hooks/frontend-gate.sh", desc: "Hook auto — bloque Edit/Write" },
            ].map((t) => (
              <div key={t.tool} className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <code className="text-[9px] font-mono bg-gray-50 px-1.5 py-0.5 rounded text-gray-700">{t.tool}</code>
                <span className="text-[9px] text-gray-500">{t.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 2. Systeme de Gates (Anti-Bypass V2) */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <SectionNumber num="2" color="blue" />
          <h3 className="text-base font-bold text-gray-800">Systeme de Gates (Anti-Bypass V2)</h3>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          Chaque tache passe par 4 gates obligatoires. Le code n'est autorise qu'apres gates 1-3.
        </p>

        {/* Gate Flow */}
        <div className="space-y-2 mb-4">
          {GATE_STEPS.map((step, i) => (
            <div key={step.gate}>
              <Card className={cn(
                "p-3 border shadow-sm",
                step.locked ? "bg-white border-gray-100" : "bg-emerald-50 border-emerald-200"
              )}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    step.locked ? `bg-${step.color}-100` : "bg-emerald-100"
                  )}>
                    {step.locked ? (
                      <Lock className={cn("h-3.5 w-3.5", `text-${step.color}-600`)} />
                    ) : (
                      <Unlock className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                        step.locked
                          ? `bg-${step.color}-100 text-${step.color}-700 border-${step.color}-200`
                          : "bg-emerald-100 text-emerald-700 border-emerald-200"
                      )}>
                        {step.gate}
                      </span>
                      <span className="text-xs font-bold text-gray-800">{step.label}</span>
                    </div>
                    <div className="text-[9px] text-gray-600 mb-1">{step.desc}</div>
                    {step.cmd && (
                      <code className="text-[9px] font-mono bg-gray-50 px-1.5 py-0.5 rounded text-gray-500 block truncate">
                        {step.cmd}
                      </code>
                    )}
                  </div>
                  <step.icon className={cn("h-4 w-4 shrink-0", `text-${step.color}-400`)} />
                </div>
              </Card>
              {i < GATE_STEPS.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="h-3.5 w-3.5 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Fast-Track */}
        <Card className="p-3 bg-amber-50 border-amber-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">FAST-TRACK</span>
            <Badge variant="outline" className="text-[9px] font-bold bg-amber-100 text-amber-600 border-amber-200">Carl dit "fast-track"</Badge>
          </div>
          <div className="text-[9px] text-amber-700 space-y-1">
            <div>Skip gates 1-2, gate 3 toujours requis (design-system.md)</div>
            <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded block">
              python3 .claude/hooks/gate.py fast-track "description"
            </code>
          </div>
        </Card>

        {/* Gate commands + audit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
          <Card className="p-3 bg-white border border-gray-100">
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Commandes Gate</div>
            <div className="space-y-1">
              {[
                "gate.py status",
                "gate.py open [gate] \"desc\"",
                "gate.py reset",
                "gate.py fast-track \"desc\"",
              ].map((cmd) => (
                <code key={cmd} className="text-[9px] font-mono bg-gray-50 px-1.5 py-0.5 rounded text-gray-600 block">{cmd}</code>
              ))}
            </div>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Audit & Hook</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <code className="text-[9px] font-mono text-gray-600">~/brain-dev/logs/gate_audit.log</code>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <code className="text-[9px] font-mono text-gray-600">.claude/hooks/frontend-gate.sh</code>
              </div>
              <div className="text-[9px] text-gray-500">Bloque Edit/Write automatiquement si gate fermee</div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 3. Phase 1 — Demarrage de Session */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <SectionNumber num="3" color="emerald" />
          <h3 className="text-base font-bold text-gray-800">Phase 1 — Demarrage de Session</h3>
          <Badge variant="outline" className="text-[9px] font-bold">AVANT toute action</Badge>
        </div>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-3">Checklist de demarrage</div>
          <div className="space-y-0.5">
            <CheckItem>Lire <code className="font-mono bg-gray-50 px-1 rounded text-[9px]">MEMORY.md</code> + <code className="font-mono bg-gray-50 px-1 rounded text-[9px]">dev-routine.md</code></CheckItem>
            <CheckItem>Executer <code className="font-mono bg-gray-50 px-1 rounded text-[9px]">python3 test_invariants.py</code></CheckItem>
            <CheckItem>Si erreurs critiques → CORRIGER AVANT de coder</CheckItem>
            <CheckItem>Verifier <code className="font-mono bg-gray-50 px-1 rounded text-[9px]">.env</code> permissions = 600</CheckItem>
            <CheckItem>Verifier CORS = restrictif (usinebleue.ai only)</CheckItem>
            <CheckItem>Identifier la tache: frontend / backend / docs / infra</CheckItem>
          </div>
        </Card>

        <Card className="p-3 bg-gray-50 border-gray-200 mt-3">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-[9px] text-gray-600">
              <code className="font-mono">test_invariants.py</code> verifie: 14 SOULs, fichiers critiques, tables DB, endpoints API, permissions .env, CORS
            </span>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 4. Phase 2 — Pre-Vol */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <SectionNumber num="4" color="violet" />
          <h3 className="text-base font-bold text-gray-800">Phase 2 — Pre-Vol</h3>
          <Badge variant="outline" className="text-[9px] font-bold">AVANT chaque bloc de code</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Frontend checklist */}
          <Card className="p-4 bg-violet-50 border-violet-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="h-4 w-4 text-violet-600" />
              <span className="text-xs font-bold text-violet-800">Frontend (.tsx/.ts)</span>
            </div>
            <div className="space-y-0.5">
              <CheckItem>Lire <code className="font-mono text-[9px]">design-system.md</code> (189 lignes)</CheckItem>
              <CheckItem>Lire le fichier cible</CheckItem>
              <CheckItem>Identifier le pattern dans design-system.md</CheckItem>
              <CheckItem>COPIER-COLLER (jamais de memoire)</CheckItem>
              <CheckItem>Verifier dans 1-2 pages existantes</CheckItem>
            </div>
          </Card>

          {/* Backend checklist */}
          <Card className="p-4 bg-blue-50 border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Server className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-800">Backend (.py)</span>
            </div>
            <div className="space-y-0.5">
              <CheckItem>Lire le fichier cible</CheckItem>
              <CheckItem>Lire les docs pertinentes (Bible, Roadmap)</CheckItem>
              <CheckItem>Verifier si Carl a conceptualise la feature</CheckItem>
              <CheckItem>Backup si fichier critique (bridge_*.py)</CheckItem>
            </div>
          </Card>
        </div>

        {/* Gemini Sentinel Pre-Vol */}
        <Card className="p-4 bg-amber-50 border-amber-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">Gemini Sentinel PRE-VOL</span>
            <Badge variant="outline" className="text-[9px] font-bold bg-amber-100 text-amber-600 border-amber-200">OBLIGATOIRE frontend</Badge>
          </div>
          <div className="space-y-1.5 text-[9px] text-amber-700">
            <code className="font-mono bg-amber-100/50 px-1.5 py-0.5 rounded block">
              python3 gemini_sentinel.py pre "Mon plan: [description]"
            </code>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="flex items-center gap-1.5 bg-red-50 rounded-lg p-1.5 border border-red-100">
                <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span className="font-bold text-red-700">STOP</span>
                <span className="text-red-600 hidden md:inline">→ corriger</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 rounded-lg p-1.5 border border-amber-100">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="font-bold text-amber-700">GO COND.</span>
                <span className="text-amber-600 hidden md:inline">→ noter</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 rounded-lg p-1.5 border border-emerald-100">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="font-bold text-emerald-700">GO</span>
                <span className="text-emerald-600 hidden md:inline">→ proceder</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 5. Phase 3 — En Vol (pendant le codage) */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <SectionNumber num="5" color="amber" />
          <h3 className="text-base font-bold text-gray-800">Phase 3 — En Vol</h3>
          <Badge variant="outline" className="text-[9px] font-bold">Pendant le codage</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Rule 1: Copy-paste */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardCheck className="h-4 w-4 text-violet-500" />
              <span className="text-xs font-bold text-gray-800">Copier-coller obligatoire</span>
            </div>
            <div className="text-[9px] text-gray-600 space-y-1">
              <div>KPI → lignes 109-126</div>
              <div>Gradient Header → lignes 49-67</div>
              <div>Sub-Tabs → lignes 17-23</div>
              <div>Structure Page → lignes 26-47</div>
            </div>
            <div className="text-[9px] font-bold text-violet-600 mt-2">JAMAIS de memoire — TOUJOURS depuis la source</div>
          </Card>

          {/* Rule 2: Cross-page coherence */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold text-gray-800">Coherence cross-page</span>
            </div>
            <div className="text-[9px] text-gray-600 space-y-1">
              <div>Le meme composant existe ailleurs dans l'app?</div>
              <div>Mon code est IDENTIQUE au pattern existant?</div>
              <div>Si NON → CORRIGER avant de continuer</div>
            </div>
          </Card>

          {/* Rule 3: Security in-flight */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold text-gray-800">Securite en vol</span>
            </div>
            <div className="text-[9px] text-gray-600 space-y-1">
              <div>PAS de credentials/API keys en dur</div>
              <div>PAS de wildcard CORS (jamais allow_origins=["*"])</div>
              <div>SQL: parametres bind — JAMAIS f-string</div>
              <div>Rate limiting maintenu sur endpoints publics</div>
              <div>PAS de dangerouslySetInnerHTML sans sanitization</div>
            </div>
          </Card>

          {/* Rule 4: Anti-improvisation */}
          <Card className="p-4 bg-red-50 border-red-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertOctagon className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold text-red-800">Anti-improvisation</span>
            </div>
            <div className="text-[9px] text-red-700 space-y-1">
              <div className="font-bold">Si pattern pas dans design-system.md:</div>
              <div>1. ARRETER</div>
              <div>2. Signaler a Carl</div>
              <div>3. Proposer d'ajouter au standard</div>
              <div>4. ATTENDRE la reponse</div>
            </div>
          </Card>
        </div>

        {/* Anti-Patterns Frontend (merged from Flow) */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm mt-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="h-4 w-4 text-red-500" />
            <span className="text-xs font-bold text-gray-800">Anti-Patterns Frontend</span>
            <Badge variant="outline" className="text-[9px] font-bold bg-red-50 text-red-600 border-red-200">{ANTI_PATTERNS.length} patterns</Badge>
          </div>
          <p className="text-[9px] text-gray-400 mb-3">Ce que Claude fait MAL quand il oublie les regles:</p>
          <div className="space-y-2">
            {ANTI_PATTERNS.map((item) => (
              <div key={item.bad} className="flex items-center gap-3 py-1.5">
                <div className="flex-1 flex items-center gap-1.5">
                  <AlertOctagon className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span className="text-xs text-red-600 line-through">{item.bad}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                <div className="flex-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs text-emerald-700 font-medium">{item.good}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 6. Phase 4 — Post-Vol */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <SectionNumber num="6" color="cyan" />
          <h3 className="text-base font-bold text-gray-800">Phase 4 — Post-Vol</h3>
          <Badge variant="outline" className="text-[9px] font-bold">APRES chaque bloc de code</Badge>
        </div>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm mb-3">
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-3">Checklist post-vol</div>
          <div className="space-y-0.5">
            <CheckItem>Build: <code className="font-mono text-[9px]">npx vite build</code> (frontend) / <code className="font-mono text-[9px]">python3 -c "import ..."</code> (backend)</CheckItem>
            <CheckItem>Audit cross-page si pattern modifie</CheckItem>
            <CheckItem>Gemini Sentinel POST-VOL: <code className="font-mono text-[9px]">python3 gemini_sentinel.py post "fichiers"</code></CheckItem>
            <CheckItem>Score &lt; 9/10 → corriger les deviations</CheckItem>
            <CheckItem>Check securite leger (si backend modifie)</CheckItem>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: "Code compile", icon: CheckCircle2, color: "emerald" },
            { label: "Pattern match design-system", icon: Eye, color: "violet" },
            { label: "Pas de pattern invente", icon: Shield, color: "blue" },
            { label: "Gemini >= 9/10", icon: Gauge, color: "amber" },
          ].map((v) => {
            const VIcon = v.icon;
            return (
              <Card key={v.label} className="p-2.5 bg-white border border-gray-100 text-center">
                <VIcon className={cn("h-4 w-4 mx-auto mb-1", `text-${v.color}-500`)} />
                <div className="text-[9px] font-medium text-gray-600">{v.label}</div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 7. Phase 5 — Propagation des Changements */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <SectionNumber num="7" color="blue" />
          <h3 className="text-base font-bold text-gray-800">Phase 5 — Propagation des Changements</h3>
        </div>

        <p className="text-xs text-gray-400 mb-3">Le maillon manquant — TOUJOURS propager les changements dans les docs</p>

        {/* Quand une decision modifie le scope */}
        <Card className="p-4 bg-blue-50 border-blue-200 shadow-sm mb-3">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-800">Quand une decision (D-xxx) modifie le scope</span>
          </div>
          <div className="space-y-1.5">
            {[
              { num: "1", file: "JOURNAL-DECISIONS.md", action: "Ajouter la decision" },
              { num: "2", file: "MEMORY.md → SPRINT TRACKER", action: "Mettre a jour le status" },
              { num: "3", file: "CLAUDE.md → PRIORITES ACTIVES", action: "Verifier a jour" },
              { num: "4", file: "Roadmap V3.0", action: "Ajouter dans DECISIONS RATTACHEES" },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-blue-600 w-4 text-center">{s.num}</span>
                <ArrowRight className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                <code className="text-[9px] font-mono text-blue-700 bg-blue-100/50 px-1.5 py-0.5 rounded">{s.file}</code>
                <span className="text-[9px] text-blue-600">{s.action}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quand une tache passe a DONE */}
        <Card className="p-4 bg-emerald-50 border-emerald-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800">Quand une tache passe a DONE</span>
          </div>
          <div className="space-y-1.5">
            {[
              { num: "1", file: "MEMORY.md → SPRINT TRACKER", action: "Changer en DONE + (Session XX)" },
              { num: "2", file: "Roadmap V3.0", action: "Marquer DONE dans le tableau" },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-emerald-600 w-4 text-center">{s.num}</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                <code className="text-[9px] font-mono text-emerald-700 bg-emerald-100/50 px-1.5 py-0.5 rounded">{s.file}</code>
                <span className="text-[9px] text-emerald-600">{s.action}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 8. Phase 5B — Fin de Sprint (Securite) */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <SectionNumber num="8" color="red" />
          <h3 className="text-base font-bold text-gray-800">Phase 5B — Fin de Sprint (Securite)</h3>
          <Badge variant="outline" className="text-[9px] font-bold bg-red-50 text-red-600 border-red-200">Chaque fin de sprint</Badge>
        </div>

        {/* 3 Audits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <Card className="p-4 bg-violet-50 border-violet-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-violet-600" />
              <span className="text-xs font-bold text-violet-800">Audit 1</span>
            </div>
            <div className="text-xs font-medium text-violet-700 mb-1">/security-review</div>
            <div className="text-[9px] text-violet-600">Claude natif — scan complet code: secrets, injections, XSS, CORS, permissions</div>
          </Card>

          <Card className="p-4 bg-amber-50 border-amber-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-800">Audit 2</span>
            </div>
            <div className="text-xs font-medium text-amber-700 mb-1">gemini_sentinel.py sprint</div>
            <div className="text-[9px] text-amber-600">Deuxieme regard independant — angles morts que Claude aurait manques</div>
          </Card>

          <Card className="p-4 bg-cyan-50 border-cyan-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-cyan-600" />
              <span className="text-xs font-bold text-cyan-800">Audit 3</span>
            </div>
            <div className="text-xs font-medium text-cyan-700 mb-1">test_invariants.py --strict</div>
            <div className="text-[9px] text-cyan-600">10 categories, ZERO erreurs critiques obligatoire</div>
          </Card>
        </div>

        {/* Checklist fin de sprint */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-3">Checklist fin de sprint</div>
          <div className="space-y-0.5">
            <CheckItem>/security-review passe</CheckItem>
            <CheckItem>Gemini sprint audit passe</CheckItem>
            <CheckItem>test_invariants.py --strict = 0 erreurs</CheckItem>
            <CheckItem>deploy.sh execute avec succes</CheckItem>
            <CheckItem>app.usinebleue.ai accessible et fonctionnel</CheckItem>
            <CheckItem>CarlOS repond dans Telegram (si backend touche)</CheckItem>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 9. Phase 6 — Fin de Session */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <SectionNumber num="9" color="emerald" />
          <h3 className="text-base font-bold text-gray-800">Phase 6 — Fin de Session</h3>
          <Badge variant="outline" className="text-[9px] font-bold">TOUJOURS</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Sauvegarde */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold text-gray-800">Sauvegarde</span>
            </div>
            <div className="text-[9px] text-gray-600 space-y-1">
              <div>1. git commit</div>
              <div>2. deploy.sh (si backend)</div>
              <div>3. systemctl status brain-bridge</div>
            </div>
          </Card>

          {/* Documentation */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-violet-500" />
              <span className="text-xs font-bold text-gray-800">Documentation</span>
            </div>
            <div className="text-[9px] text-gray-600 space-y-1">
              <div>1. MEMORY.md → Sprint Tracker</div>
              <div>2. sessions-archive.md</div>
              <div>3. design-system.md (si nouveau pattern)</div>
              <div>4. Coherence CLAUDE.md ↔ MEMORY.md</div>
            </div>
          </Card>

          {/* Confirmation */}
          <Card className="p-4 bg-emerald-50 border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-800">Confirmer a Carl</span>
            </div>
            <div className="text-[9px] text-emerald-700 space-y-1">
              <div>- Fichiers modifies: [liste]</div>
              <div>- Build: OK/FAIL</div>
              <div>- Deploy: OK/N/A</div>
              <div>- Standards respectes: OUI/NON</div>
              <div>- Sprint tracker a jour: OUI/NON</div>
            </div>
          </Card>
        </div>

        {/* Rollback Procedure (merged from Flow) */}
        <Card className="p-4 bg-red-50 border-red-200 shadow-sm mt-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-xs font-bold text-red-800">Procedure de Rollback</span>
          </div>
          <p className="text-[9px] text-red-600 mb-3">Si Carl dit "rollback" ou si CarlOS ne repond plus:</p>
          <div className="space-y-2.5">
            {ROLLBACK_STEPS.map((s, i) => (
              <div key={s.cmd} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <code className="text-xs bg-white px-2 py-0.5 rounded font-mono text-red-700 border border-red-200">{s.cmd}</code>
                  <div className="text-[9px] text-red-500 mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Deploy Commands (merged from Flow) */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm mt-3">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-800">Commandes Rapides</span>
          </div>
          <div className="space-y-1.5">
            {QUICK_COMMANDS.map((item) => (
              <div key={item.cmd} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <Terminal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-600 min-w-[120px]">{item.label}</span>
                <code className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-700">{item.cmd}</code>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 10. Alertes Rouges — STOP Immediat */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <SectionNumber num="10" color="red" />
          <h3 className="text-base font-bold text-gray-800">Alertes Rouges — STOP Immediat</h3>
        </div>

        <p className="text-xs text-gray-400 mb-3">
          {RED_ALERTS.length} situations qui declenchent un arret immediat — ZERO tolerance
        </p>

        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_70px] gap-2 px-4 py-2.5 bg-red-50 border-b border-red-100">
            <span className="text-[9px] font-bold text-red-600 uppercase tracking-wide">Situation</span>
            <span className="text-[9px] font-bold text-red-600 uppercase tracking-wide">Action</span>
            <span className="text-[9px] font-bold text-red-600 uppercase tracking-wide text-right">Severite</span>
          </div>

          <div className="divide-y divide-gray-50">
            {RED_ALERTS.map((alert) => (
              <div
                key={alert.situation}
                className="grid grid-cols-[1fr_1fr_70px] gap-2 px-4 py-2 items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <AlertOctagon className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    alert.severity === "critical" ? "text-red-500" : "text-amber-500"
                  )} />
                  <span className="text-xs text-gray-700">{alert.situation}</span>
                </div>
                <span className="text-xs text-gray-600">{alert.action}</span>
                <div className="text-right">
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                    alert.severity === "critical"
                      ? "bg-red-100 text-red-700 border-red-200"
                      : "bg-amber-100 text-amber-700 border-amber-200"
                  )}>
                    {alert.severity === "critical" ? "CRITIQUE" : "HAUT"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 11. Sources de Verite */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <SectionNumber num="11" color="blue" />
          <h3 className="text-base font-bold text-gray-800">Sources de Verite</h3>
        </div>

        <p className="text-xs text-gray-400 mb-3">
          Ne JAMAIS confondre — chaque sujet a UNE source de verite unique
        </p>

        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[120px_1fr_1fr] gap-2 px-4 py-2.5 bg-blue-50 border-b border-blue-100">
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wide">Sujet</span>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wide">Source</span>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wide">Fichier</span>
          </div>

          <div className="divide-y divide-gray-50">
            {SOURCES_VERITE.map((sv) => (
              <div
                key={sv.sujet}
                className="grid grid-cols-[120px_1fr_1fr] gap-2 px-4 py-2 items-center hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-medium text-gray-800">{sv.sujet}</span>
                <span className="text-xs text-gray-600">{sv.source}</span>
                <code className="text-[9px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded truncate">{sv.fichier}</code>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* 12. Metriques de Qualite (Auto-evaluation) */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <SectionNumber num="12" color="emerald" />
          <h3 className="text-base font-bold text-gray-800">Metriques de Qualite (Auto-evaluation)</h3>
        </div>

        <p className="text-xs text-gray-400 mb-3">
          12 questions en fin de session — repondre honnetement. Score 12/12 = excellent, &lt;10 = probleme.
        </p>

        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[30px_1fr_60px] gap-2 px-4 py-2.5 bg-emerald-50 border-b border-emerald-100">
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">#</span>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Question</span>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide text-right">Attendu</span>
          </div>

          <div className="divide-y divide-gray-50">
            {QUALITY_METRICS.map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-[30px_1fr_60px] gap-2 px-4 py-2 items-center hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-bold text-gray-500">{m.id}</span>
                <span className="text-xs text-gray-700">{m.question}</span>
                <div className="text-right">
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                    m.expected === "OUI"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-red-100 text-red-700 border-red-200"
                  )}>
                    {m.expected}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Score Legend */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <Card className="p-2.5 bg-emerald-50 border-emerald-200 text-center">
            <div className="text-lg font-bold text-emerald-700">12/12</div>
            <div className="text-[9px] font-bold text-emerald-600">EXCELLENT</div>
          </Card>
          <Card className="p-2.5 bg-amber-50 border-amber-200 text-center">
            <div className="text-lg font-bold text-amber-700">10-11</div>
            <div className="text-[9px] font-bold text-amber-600">ACCEPTABLE</div>
          </Card>
          <Card className="p-2.5 bg-red-50 border-red-200 text-center">
            <div className="text-lg font-bold text-red-700">&lt;10</div>
            <div className="text-[9px] font-bold text-red-600">PROBLEME</div>
          </Card>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FOOTER — Quick Stats */}
      {/* ============================================================ */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Gates", value: "4", icon: Lock, color: "blue" },
            { label: "Phases", value: "6", icon: Rocket, color: "violet" },
            { label: "Alertes", value: String(RED_ALERTS.length), icon: AlertOctagon, color: "red" },
            { label: "Sources verite", value: String(SOURCES_VERITE.length), icon: BookOpen, color: "cyan" },
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
      </div>
    </PageLayout>
  );
}
