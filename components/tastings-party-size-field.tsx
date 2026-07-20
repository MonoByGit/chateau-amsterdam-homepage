// components/tastings-party-size-field.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { TOURS_TASTINGS_COPY as C } from "@/lib/content/tours-tastings";

const MIN = 1;
const MAX = 20;

export function PartySizeField({ defaultValue = 2 }: { defaultValue?: number }) {
  const { t } = useLanguage();
  const [value, setValue] = useState(defaultValue);

  const clamp = (next: number) => Math.min(MAX, Math.max(MIN, next));

  return (
    <div className="tastings-field">
      <label htmlFor="partySize">
        <span className="fn">01</span>
        <span className="fl">{t(C.fieldPartySize.nl, C.fieldPartySize.en)}</span>
      </label>
      <div className="tastings-stepper">
        <button
          type="button"
          className="tastings-stepper-btn"
          aria-label={t(C.partySizeDecrease.nl, C.partySizeDecrease.en)}
          disabled={value <= MIN}
          onClick={() => setValue((current) => clamp(current - 1))}
        >
          −
        </button>
        <input
          required
          id="partySize"
          type="number"
          name="partySize"
          min={MIN}
          max={MAX}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isNaN(next)) return;
            setValue(clamp(next));
          }}
          className="tastings-stepper-value"
        />
        <button
          type="button"
          className="tastings-stepper-btn"
          aria-label={t(C.partySizeIncrease.nl, C.partySizeIncrease.en)}
          disabled={value >= MAX}
          onClick={() => setValue((current) => clamp(current + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}
