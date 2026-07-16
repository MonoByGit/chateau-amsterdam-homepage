// components/admin/image-picker.test.tsx
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ImagePicker } from "./image-picker";

const media = [
  { id: "media-1", url: "https://example.test/one.jpg", filename: "one.jpg", altText: "Eerste afbeelding" },
  { id: "media-2", url: "https://example.test/two.jpg", filename: "two.jpg", altText: "Tweede afbeelding" },
];

describe("ImagePicker", () => {
  it("calls onChange with the clicked item's id", () => {
    const onChange = vi.fn();
    render(<ImagePicker media={media} value={null} onChange={onChange} />);

    fireEvent.click(screen.getByRole("option", { name: "Tweede afbeelding" }));

    expect(onChange).toHaveBeenCalledWith("media-2");
  });

  it("marks the item matching value as selected", () => {
    render(<ImagePicker media={media} value="media-1" onChange={vi.fn()} />);

    expect(screen.getByRole("option", { name: "Eerste afbeelding" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "Tweede afbeelding" })).toHaveAttribute("aria-selected", "false");
  });
});
