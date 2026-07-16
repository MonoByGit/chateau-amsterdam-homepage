// app/admin/content/[section]/page.tsx
import Link from "next/link";
import { getBlocksForSection } from "@/lib/db/content";
import { ContentForm } from "./content-form";

export default async function ContentSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const blocks = await getBlocksForSection("home", section);

  return (
    <div>
      <Link href="/admin/content" className="a-link" style={{ fontSize: "0.8125rem" }}>
        ← Content
      </Link>
      <h1 className="a-h1" style={{ marginTop: "0.5rem", textTransform: "capitalize" }}>
        {section}
      </h1>
      <p className="a-subtitle">Wijzigingen zijn direct live op de homepage zodra je op Opslaan klikt.</p>
      <ContentForm section={section} blocks={blocks} />
    </div>
  );
}
