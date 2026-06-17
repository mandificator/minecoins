export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Navigation lives in the global left sidebar (DOCS submenu); here we just
  // give the article a comfortable, airy reading column.
  return <div className="mx-auto max-w-3xl px-6 py-10">{children}</div>;
}
