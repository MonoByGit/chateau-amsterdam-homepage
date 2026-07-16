// app/admin/content/[section]/content-form.tsx
"use client";

import { useActionState } from "react";
import { saveSection } from "./actions";

type Block = { fieldKey: string; valueNl: string; valueEn: string };

async function submitSection(section: string, _prevState: string | null, formData: FormData): Promise<string> {
  await saveSection(section, formData);
  return "Opgeslagen";
}

export function ContentForm({ section, blocks }: { section: string; blocks: Block[] }) {
  const [status, formAction, isPending] = useActionState(submitSection.bind(null, section), null);

  return (
    <form action={formAction} className="mt-6 space-y-6">
      {blocks.map((block) => (
        <div key={block.fieldKey} className="border-b border-gray-200 pb-4">
          <label className="block text-sm font-medium text-gray-700">{block.fieldKey}</label>
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">NL</span>
              <textarea
                name={`${block.fieldKey}__nl`}
                defaultValue={block.valueNl}
                rows={2}
                className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">EN</span>
              <textarea
                name={`${block.fieldKey}__en`}
                defaultValue={block.valueEn}
                rows={2}
                className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Bezig met opslaan…" : "Opslaan"}
      </button>
      {status ? <p className="text-sm text-green-600">{status}</p> : null}
    </form>
  );
}
