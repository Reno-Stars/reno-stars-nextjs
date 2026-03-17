/**
 * Compute how many times to repeat a set of items so one "set" always fills
 * the viewport (prevents a visible gap), plus a total animation duration
 * that keeps per-item scroll speed consistent regardless of item count.
 */
export function computeMarqueeParams(
  itemCount: number,
  itemWidth: number,
  secondsPerItem: number,
  minTrackWidth = 2000,
) {
  const repeatCount =
    itemCount > 0 ? Math.max(1, Math.ceil(minTrackWidth / (itemCount * itemWidth))) : 1;
  const duration = itemCount * repeatCount * secondsPerItem;
  return { repeatCount, duration };
}
