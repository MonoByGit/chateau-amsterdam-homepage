// app/admin/content/page.tsx
import Link from "next/link";
import { getAllSections } from "@/lib/db/content";

export default async function ContentPage() {
  const sections = await getAllSections("home");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Content</h1>
      <p className="mt-1 text-sm text-gray-500">
        Kies een sectie van de homepage om de NL/EN tekst te bewerken.
      </p>
      <ul className="mt-6 divide-y divide-gray-200 rounded border border-gray-200">
        {sections.map((section) => (
          <li key={section}>
            <Link
              href={`/admin/content/${section}`}
              className="block px-4 py-3 text-sm font-medium text-blue-600 hover:bg-gray-50 hover:underline"
            >
              {section}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
