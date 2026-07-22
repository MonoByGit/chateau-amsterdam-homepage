// app/admin/content/[section]/content-form.tsx
"use client";

import { useActionState } from "react";
import { saveSection } from "./actions";

type Block = { fieldKey: string; valueNl: string; valueEn: string };

async function submitSection(section: string, page: string, _prevState: string | null, formData: FormData): Promise<string> {
  await saveSection(section, page, formData);
  return "Opgeslagen";
}

function formatFieldLabel(key: string): { title: string; isImage: boolean } {
  const isImage = key.includes("image_url") || key.includes("photo");
  const humanized = key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: isImage ? `🖼️ ${humanized} (Afbeelding URL)` : humanized,
    isImage,
  };
}

export function ContentForm({ section, page = "home", blocks }: { section: string; page?: string; blocks: Block[] }) {
  const [status, formAction, isPending] = useActionState(submitSection.bind(null, section, page), null);

  return (
    <form action={formAction} style={{ marginTop: "1.5rem" }}>
      <div className="a-card">
        {blocks.map((block) => {
          const meta = formatFieldLabel(block.fieldKey);
          return (
            <div key={block.fieldKey} className="a-card-row">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="a-label" style={{ fontWeight: 600, color: meta.isImage ? "var(--a-accent-text)" : "var(--a-text)" }}>
                  {meta.title}
                </span>
                <span className="a-eyebrow" style={{ opacity: 0.5 }}>{block.fieldKey}</span>
              </div>
              <div style={{ marginTop: "0.625rem", display: "grid", gap: "1rem", gridTemplateColumns: meta.isImage ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))" }}>
                {meta.isImage ? (
                  <label className="a-field">
                    <span className="a-label">Afbeeldingspad / URL</span>
                    <input
                      type="text"
                      name={`${block.fieldKey}__nl`}
                      defaultValue={block.valueNl}
                      className="a-input"
                    />
                    <input type="hidden" name={`${block.fieldKey}__en`} defaultValue={block.valueNl} />
                  </label>
                ) : (
                  <>
                    <label className="a-field">
                      <span className="a-label">Nederlands (NL)</span>
                      <textarea
                        name={`${block.fieldKey}__nl`}
                        defaultValue={block.valueNl}
                        rows={2}
                        className="a-textarea"
                      />
                    </label>
                    <label className="a-field">
                      <span className="a-label">Engels (EN)</span>
                      <textarea
                        name={`${block.fieldKey}__en`}
                        defaultValue={block.valueEn}
                        rows={2}
                        className="a-textarea"
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          );
        })}
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
