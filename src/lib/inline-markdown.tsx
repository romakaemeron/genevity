import React from "react";

/**
 * Renders a small inline-markdown subset as React nodes:
 *   - `**bold**`   → <strong>
 *   - `*italic*`   → <em>
 *
 * Seeded service content stores labels like `**Показання:**` inline in plain
 * text fields. This converts them to real markup without dangerouslySetInnerHTML.
 * All other characters (including newlines) are preserved verbatim, so parents
 * using `whitespace-pre-line` keep their line breaks.
 */
export function renderInlineMarkdown(text: string | null | undefined): React.ReactNode {
  if (!text) return text ?? null;
  // Fast path: nothing to format.
  if (!text.includes("*")) return text;

  // **bold** first (so it wins over the single-* italic branch), then *italic*.
  const regex = /\*\*([^*]+)\*\*|\*([^*\n]+)\*/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(<em key={key++}>{match[2]}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return nodes.length === 1 ? nodes[0] : nodes;
}
