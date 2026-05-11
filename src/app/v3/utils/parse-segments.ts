/**
 * parse-segments.ts — S102-B — Utilitaire partage pour parser les sections markdown
 *
 * Extrait de DiscussionWindow.tsx L166-184 pour reutilisation dans:
 * - BubbleActions.tsx (section-aware challenger)
 * - CristalliseActions.tsx (workspace challenger)
 */

/** Parse un message bot en segments par headers ### */
export function parseMessageSegments(content: string): { title: string | null; text: string }[] {
  if (!content) return [];
  const parts = content.split(/(?=^#{1,4}\s)/m);
  const segments: { title: string | null; text: string }[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const headerMatch = trimmed.match(/^#{1,4}\s+(.+?)(?:\n|$)/);
    if (headerMatch) {
      segments.push({
        title: headerMatch[1].trim(),
        text: trimmed.replace(/^#{1,4}\s+.+?\n?/, "").trim(),
      });
    } else {
      segments.push({ title: null, text: trimmed });
    }
  }
  return segments;
}
