import { marked, Renderer, type Tokens } from "marked";

marked.setOptions({ gfm: true, breaks: true });

const renderer = new Renderer();
renderer.heading = function(token: Tokens.Heading) {
  const text = this.parser.parseInline(token.tokens);
  const id = text
    .replace(/<[^>]*>/g, '')
    .toLowerCase()
    .replace(/[^\wа-яёіїєґ\s]/gi, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
  return `<h${token.depth} id="${id}">${text}</h${token.depth}>\n`;
};

// Adds target="_blank" rel="noopener noreferrer" to all external links.
function processExternalLinks(html: string): string {
  return html.replace(
    /<a\s([^>]*href="(https?:\/\/[^"]+)"[^>]*)>/gi,
    (match, attrs) => {
      if (/\btarget=/.test(attrs)) return match;
      return `<a ${attrs} target="_blank" rel="noopener noreferrer">`;
    }
  );
}

// Adds id="..." to <h2>–<h4> tags based on text content, for TOC anchor links.
function addHeadingIds(html: string): string {
  return html.replace(
    /<(h[2-4])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, inner) => {
      if (/\bid=/.test(attrs)) return match;
      const text = inner.replace(/<[^>]*>/g, '');
      const id = text
        .toLowerCase()
        .replace(/[^\wа-яёіїєґ\s]/gi, '')
        .replace(/\s+/g, '-')
        .slice(0, 60)
        .replace(/^-+|-+$/g, '');
      if (!id) return match;
      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    }
  );
}

export interface TocItem { id: string; text: string; level: number; }

export function parseTocItems(html: string): TocItem[] {
  return [...html.matchAll(/<(h[23])[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => ({
    id: m[2],
    text: m[3].replace(/<[^>]*>/g, "").trim(),
    level: parseInt(m[1][1]),
  }));
}

export function parseMarkdown(md: string): string {
  const normalized = md.replace(/^(-{3,}|\*{3,}|_{3,})\s*$/gm, '\n\n$1\n\n');
  return marked(normalized, { renderer }) as string;
}

// Detects HTML vs markdown and processes accordingly.
export function processBody(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "";
  const html = trimmed.startsWith("<") ? addHeadingIds(trimmed) : parseMarkdown(trimmed);
  return processExternalLinks(html);
}

interface Props { html: string; }

// html is server-generated from markdown or WYSIWYG (admin-controlled CMS content), not raw user input.
export default function ArticleBody({ html }: Props) {
  return (
    <div
      className="prose-genevity"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
