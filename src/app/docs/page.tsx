import { redirect } from "next/navigation";
import { firstDocSlug } from "@/lib/docs";

export default function DocsIndex() {
  const slug = firstDocSlug();
  if (slug) redirect(`/docs/${slug}`);
  return (
    <div className="py-16 text-center text-fg-dim">
      No documentation pages found.
    </div>
  );
}
