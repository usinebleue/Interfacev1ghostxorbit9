/**
 * content-formatters.tsx — Formateurs de contenu cristallisé
 *
 * Transforme le texte brut markdown en JSX enrichi.
 * S103 — Rendu riche: tables markdown, code blocks, contenu par spécialité bot.
 * Fallback: whitespace-pre-wrap (comportement actuel préservé pour texte non-markdown)
 */

import React from "react";
import { cn } from "../../components/ui/utils";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from "../../components/ui/table";

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

// ═══ S103 — Parseur de tables markdown ═══

function parseMarkdownTable(text: string): { headers: string[]; rows: string[][]; beforeTable: string; afterTable: string } | null {
  const lines = text.split("\n");
  const tableStartIdx = lines.findIndex(l => l.trim().startsWith("|"));
  if (tableStartIdx < 0) return null;

  const tableLines = [];
  let tableEndIdx = tableStartIdx;
  for (let i = tableStartIdx; i < lines.length; i++) {
    if (lines[i].trim().startsWith("|")) {
      tableLines.push(lines[i]);
      tableEndIdx = i;
    } else if (tableLines.length > 0) {
      break;
    }
  }
  if (tableLines.length < 2) return null;

  const parse = (line: string) => line.split("|").filter(c => c.trim()).map(c => c.trim());
  const headers = parse(tableLines[0]);
  // Skip separator line (|---|---|)
  const dataStart = tableLines[1].includes("---") ? 2 : 1;
  const rows = tableLines.slice(dataStart).map(parse);
  if (rows.length === 0) return null;

  const beforeTable = lines.slice(0, tableStartIdx).join("\n").trim();
  const afterTable = lines.slice(tableEndIdx + 1).join("\n").trim();

  return { headers, rows, beforeTable, afterTable };
}

// ═══ S103 — Rendu code block ═══

function renderCodeBlock(text: string): { element: React.ReactNode; before: string; after: string } | null {
  const match = text.match(/```(\w+)?\n([\s\S]*?)```/);
  if (!match) return null;
  const [fullMatch, lang, code] = match;
  const idx = text.indexOf(fullMatch);
  const before = text.slice(0, idx).trim();
  const after = text.slice(idx + fullMatch.length).trim();
  const element = (
    <div className="rounded-lg overflow-hidden border border-gray-200 my-2">
      {lang && (
        <div className="bg-gray-800 text-gray-300 text-[10px] px-3 py-1 font-mono">{lang}</div>
      )}
      <pre className="bg-gray-900 text-gray-100 text-[11px] p-3 overflow-hidden font-mono leading-relaxed whitespace-pre-wrap break-words">
        <code>{code}</code>
      </pre>
    </div>
  );
  return { element, before, after };
}

// ═══ formatCristallise — Transforme markdown → JSX ═══
// S103: Enrichi avec rendu table + code block par spécialité bot

export function formatCristallise(
  text: string,
  contentTypes?: string[],
  botCode?: string
): React.ReactNode {
  if (!text) return null;

  // Priorité 1: Table markdown (CFO, COO, CSO, ou contenu avec "|")
  if (contentTypes?.includes("tableau") || text.includes("| ")) {
    const table = parseMarkdownTable(text);
    if (table) {
      const isCFO = botCode === "CFOB";
      return (
        <>
          {table.beforeTable && <p className="text-[12px] text-gray-700 mb-2">{formatInline(table.beforeTable)}</p>}
          <div className={cn("rounded-lg overflow-hidden border my-2",
            isCFO ? "border-blue-200" : "border-gray-200")}>
            <Table>
              <TableHeader>
                <TableRow className={isCFO ? "bg-blue-50" : "bg-gray-50"}>
                  {table.headers.map((h, i) => (
                    <TableHead key={i} className="text-[11px] font-semibold">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.rows.map((row, i) => (
                  <TableRow key={i}>
                    {row.map((cell, j) => (
                      <TableCell key={j} className="text-[11px]">{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {table.afterTable && <p className="text-[12px] text-gray-700 mt-2">{formatInline(table.afterTable)}</p>}
        </>
      );
    }
  }

  // Priorité 2: Code block (CTO, CISO)
  if (contentTypes?.includes("code") || text.includes("```")) {
    const codeResult = renderCodeBlock(text);
    if (codeResult) {
      return (
        <>
          {codeResult.before && <p className="text-[12px] text-gray-700 mb-1">{formatInline(codeResult.before)}</p>}
          {codeResult.element}
          {codeResult.after && <p className="text-[12px] text-gray-700 mt-1">{formatInline(codeResult.after)}</p>}
        </>
      );
    }
  }

  // Fallback: markdown → JSX (comportement existant)
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
