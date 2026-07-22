// app/admin/content/[section]/content-form.tsx
"use client";

import { useActionState } from "react";
import { saveSection } from "./actions";

type Block = { fieldKey: string; valueNl: string; valueEn: string };

async function submitSection(section: string, page: string, _prevState: string | null, formData: FormData): Promise<string> {
  await saveSection(section, page, formData);
  return "Opgeslagen";
}

export function ContentForm({ section, page = "home", blocks }: { section: string; page?: string; blocks: Block[] }) {
  const [status, formAction, isPending] = useActionState(submitSection.bind(null, section, page), null);

  return (
    <form action={formAction} style={{ marginTop: "1.5rem" }}>
      <div className="a-card">
        {blocks.map((block) => (
          <div key={block.fieldKey} className="a-card-row">
            <span className="a-eyebrow">{block.fieldKey}</span>
            <div style={{ marginTop: "0.625rem", display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <label className="a-field">
                <span className="a-label">NL</span>
                <textarea
                  name={`${block.fieldKey}__nl`}
                  defaultValue={block.valueNl}
                  rows={2}
                  className="a-textarea"
                />
              </label>
              <label className="a-field">
                <span className="a-label">EN</span>
                <textarea
                  name={`${block.fieldKey}__en`}
                  defaultValue={block.valueEn}
                  rows={2}
                  className="a-textarea"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button type="submit" disabled={isPending} className="a-btn a-btn--primary">
          {isPending ? "Bezig met opslaan…" : "Opslaan"}
        </button>
        {status ? <span className="a-badge a-badge--success">{status}</span> : null}
      </div>
    </form>
  );
}
