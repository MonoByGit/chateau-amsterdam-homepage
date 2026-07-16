export function computeReorderedIds(
  orderedIds: string[],
  id: string,
  direction: "up" | "down"
): string[] | null {
  const index = orderedIds.indexOf(id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= orderedIds.length) {
    return null;
  }

  const next = [...orderedIds];
  [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  return next;
}
