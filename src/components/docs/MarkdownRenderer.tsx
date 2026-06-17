import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import AsciiDiagram from "@/components/ui/AsciiDiagram";

/** A fenced block looks like a diagram when it has box-drawing characters. */
function isDiagram(text: string): boolean {
  return /[─│┌┐└┘├┤┬┴┼]/.test(text);
}

function getCodeText(children: unknown): string {
  // react-markdown gives <pre><code>…</code></pre>; dig the raw text out of the
  // <code> child element.
  const code = Array.isArray(children) ? children[0] : children;
  const text = (code as { props?: { children?: unknown } })?.props?.children;
  return Array.isArray(text) ? text.join("") : String(text ?? "");
}

const components: Components = {
  // Route language-less diagram fences to the auto-fitting renderer; everything
  // else (e.g. ```bash) stays a normally styled code block.
  pre(props) {
    const text = getCodeText(props.children);
    if (isDiagram(text)) {
      return (
        <div className="diagram-block">
          <AsciiDiagram text={text.replace(/\n$/, "")} />
        </div>
      );
    }
    return <pre>{props.children}</pre>;
  },
};

/**
 * Cyberpunk-themed Markdown renderer used both on the public docs pages and in
 * the CRM live preview. Styling lives in `.prose-terminal` (globals.css).
 */
export default function MarkdownRenderer({ source }: { source: string }) {
  return (
    <div className="prose-terminal">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            { behavior: "wrap", properties: { className: ["heading-anchor"] } },
          ],
        ]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
