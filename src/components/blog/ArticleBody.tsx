import { marked, Renderer, type Tokens } from "marked";

marked.setOptions({ gfm: true, breaks: true });

// Add IDs to headings for ToC — marked v18 heading renderer uses Tokens.Heading
const renderer = new Renderer();
renderer.heading = function(token: Tokens.Heading) {
  const text = this.parser.parseInline(token.tokens);
  const id = text
    .replace(/<[^>]*>/g, '') // strip any HTML tags from the text
    .toLowerCase()
    .replace(/[^\wа-яёіїєґ\s]/gi, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
  return `<h${token.depth} id="${id}">${text}</h${token.depth}>\n`;
};

export function parseMarkdown(md: string): string {
  // Ensure --- / *** / ___ on their own line get blank lines around them
  // so marked's breaks:true doesn't prevent <hr> detection
  const normalized = md.replace(/^(-{3,}|\*{3,}|_{3,})\s*$/gm, '\n\n$1\n\n');
  return marked(normalized, { renderer }) as string;
}

interface Props { html: string; }

// html is server-generated from markdown (developer-controlled CMS content), not raw user input.
export default function ArticleBody({ html }: Props) {
  return (
    <div
      className="prose-genevity"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
