/**
 * CodeTerminalRenderer.tsx — Terminal code character-by-character (Tim Code)
 *
 * Port de LiveTerminalV3 depuis SimAmorcer L4151-4182.
 * - Character-by-character typing avec curseur block pulse
 * - Header terminal: icone Terminal + "Tim — Terminal" + dots macOS
 * - Badge "En cours..." avec dot animate-pulse pendant le typing
 * - CheckCircle2 quand termine
 *
 * Props: content, speed, title, animate
 */

import { useState, useEffect } from "react";
import { Terminal, CheckCircle2 } from "lucide-react";

interface CodeTerminalRendererProps {
  content: string;
  speed?: number;
  title?: string;
  animate?: boolean;
}

export function CodeTerminalRenderer({ content, speed = 12, title = "Tim — Terminal", animate = true }: CodeTerminalRendererProps) {
  const [chars, setChars] = useState(0);

  // Reset quand le contenu change
  useEffect(() => { setChars(0); }, [content]);

  useEffect(() => {
    if (!animate) return;
    if (chars < content.length) {
      const nextChar = content[chars];
      const delay = nextChar === "\n" ? speed * 4 : speed;
      const timer = setTimeout(() => setChars(prev => prev + 1), delay);
      return () => clearTimeout(timer);
    }
  }, [chars, content, speed, animate]);

  const displayContent = animate ? content.slice(0, chars) : content;
  const done = !animate || chars >= content.length;

  return (
    <div className="bg-gray-950 rounded-lg overflow-hidden">
      <div className="px-3 py-1.5 flex items-center gap-2 border-b border-gray-800">
        <Terminal className="h-3.5 w-3.5 text-green-400" />
        <span className="text-xs font-bold text-green-300">{title}</span>
        {!done && (
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[8px] text-green-400/70">En cours...</span>
          </div>
        )}
        {done && <CheckCircle2 className="h-3.5 w-3.5 text-green-400 ml-auto" />}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>
      <pre className="p-3 text-[9px] leading-relaxed font-mono max-h-[280px] overflow-y-auto">
        <code className="text-green-400">{displayContent}</code>
        {!done && <span className="text-green-300 animate-pulse">█</span>}
      </pre>
    </div>
  );
}
