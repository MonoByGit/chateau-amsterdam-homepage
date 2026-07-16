// app/admin/content/[section]/page.tsx
import { getBlocksForSection } from "@/lib/db/content";
import { ContentForm } from "./content-form";

export default async function ContentSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const blocks = await getBlocksForSection("home", section);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Content: {section}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Wijzigingen zijn direct live op de homepage zodra je op Opslaan klikt.
      </p>
      <ContentForm section={section} blocks={blocks} />
    </div>
  );
}
