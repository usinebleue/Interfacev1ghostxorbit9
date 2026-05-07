/**
 * content-formatters.tsx — Formateurs de contenu cristallisé
 *
 * Transforme le texte brut markdown en JSX enrichi.
 * Fallback: whitespace-pre-wrap (comportement actuel préservé pour texte non-markdown)
 */

import React from "react";

// ═══ Détection markdown ═══

function hasMarkdown(text: string): boolean {
  return /^#{1,4}\s|^\*\s|^-\s|^\d+\.\s|\*\*[^*]+\*\*|\*[^*]+\*/m.test(text);
}

// ═══ Inline formatting ═══

function formatInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const raw = match[0];
    if (raw.startsWith("**") && raw.endsWith("**")) {
      parts.push(<strong key={match.index} className="font-semibold text-gray-900">{raw.slice(2, -2)}</strong>);
    } else if (raw.startsWith("*") && raw.endsWith("*")) {
      parts.push(<em key={match.index} className="italic">{raw.slice(1, -1)}</em>);
    }
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// ═══ formatCristallise — Transforme markdown → JSX ═══

export function formatCristallise(text: string): React.ReactNode {
  if (!text) return null;

  // Si pas de markdown détecté → fallback whitespace-pre-wrap
  if (!hasMarkdown(text)) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line → spacer
    if (!trimmed) {
      elements.push(<div key={i} className="h-1.5" />);
      i++;
      continue;
    }

    // Headings: # ## ### ####
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      if (level <= 2) {
        elements.push(
          <h3 key={i} className="text-xs font-bold text-gray-900 mt-3 mb-1">
            {formatInline(content)}
          </h3>
        );
      } else {
        elements.push(
          <h4 key={i} className="text-[11px] font-bold text-gray-800 mt-2.5 mb-0.5">
            {formatInline(content)}
          </h4>
        );
      }
      i++;
      continue;
    }

    // Unordered list items: - item or * item
    if (/^[-*]\s+/.test(trimmed)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*[-*]\s+/, "");
        listItems.push(
          <li key={i} className="flex items-start gap-1.5">
            <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
            <span>{formatInline(itemText)}</span>
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-0.5 my-1">
          {listItems}
        </ul>
      );
      continue;
    }

    // Ordered list items: 1. item
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: React.ReactNode[] = [];
      let num = 1;
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*\d+\.\s+/, "");
        listItems.push(
          <li key={i} className="flex items-start gap-1.5">
            <span className="text-[10px] font-bold text-gray-500 mt-0.5 w-3 shrink-0 text-right">{num}.</span>
            <span>{formatInline(itemText)}</span>
          </li>
        );
        i++;
        num++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-0.5 my-1">
          {listItems}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="my-0.5">
        {formatInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0">{elements}</div>;
}
