/**
 * export-utils.ts — Utilitaires d'export pour les simulations
 * Export en Markdown et JSON, declenchement de telechargement
 * Sprint A — Frame Master V2
 */

/** Declenche un telechargement de fichier dans le navigateur */
export function downloadFile(content: string, filename: string, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Export generique en Markdown */
export function exportMarkdown(title: string, sections: { heading: string; content: string }[]) {
  const lines = [`# ${title}`, ``, `> Exporte depuis GhostX — ${new Date().toLocaleString("fr-CA")}`, ``];

  for (const section of sections) {
    lines.push(`## ${section.heading}`, ``);
    lines.push(section.content, ``);
  }

  const md = lines.join("\n");
  const filename = `${title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${Date.now()}.md`;
  downloadFile(md, filename, "text/markdown");
}

/** Export generique en JSON */
export function exportJSON(title: string, data: Record<string, unknown>) {
  const payload = {
    title,
    exportedAt: new Date().toISOString(),
    source: "GhostX Simulation",
    data,
  };
  const json = JSON.stringify(payload, null, 2);
  const filename = `${title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${Date.now()}.json`;
  downloadFile(json, filename, "application/json");
}

/** Sauvegarde l'etat d'une simulation dans localStorage */
export function saveSimulationState(modeId: string, state: Record<string, unknown>) {
  try {
    const key = `ghostx-simulation-${modeId}`;
    localStorage.setItem(key, JSON.stringify({
      savedAt: new Date().toISOString(),
      state,
    }));
  } catch {
    // localStorage might be full or disabled — silently fail
  }
}

/** Charge l'etat d'une simulation depuis localStorage */
export function loadSimulationState(modeId: string): Record<string, unknown> | null {
  try {
    const key = `ghostx-simulation-${modeId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const { state } = JSON.parse(stored);
    return state;
  } catch {
    return null;
  }
}

/** Supprime l'etat sauvegarde d'une simulation */
export function clearSimulationState(modeId: string) {
  try {
    localStorage.removeItem(`ghostx-simulation-${modeId}`);
  } catch {
    // silently fail
  }
}
