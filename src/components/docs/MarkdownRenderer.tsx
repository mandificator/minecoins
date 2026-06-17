import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import AsciiDiagram from "@/components/ui/AsciiDiagram";
import Mermaid from "@/components/docs/Mermaid";

/** A fenced block looks like a diagram when it has box-drawing characters. */
function isDiagram(text: string): boolean {
  return /[─│┌┐└┘├┤┬┴┼]/.test(text);
}

function getCodeChild(children: unknown): { className: string; text: string } {
  // react-markdown gives <pre><code class="language-x">…</code></pre>.
  const code = Array.isArray(children) ? children[0] : children;
  const props = (code as { props?: { className?: string; children?: unknown } })
    ?.props;
  const text = props?.children;
  return {
    className: props?.className ?? "",
    text: Array.isArray(text) ? text.join("") : String(text ?? ""),
  };
}

const components: Components = {
  // ```mermaid → themed Mermaid diagram; language-less box-drawing → auto-fit
  // ASCII; everything else (e.g. ```bash) → a normally styled code block.
  pre(props) {
    const { className, text } = getCodeChild(props.children);
    if (className.includes("language-mermaid")) {
      return <Mermaid code={text.replace(/\n$/, "")} />;
    }
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
