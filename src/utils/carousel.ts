/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Shortest signed distance between two slide indices on a looped track of
 * `count` slides — e.g. with 5 slides, the distance from 0 to 4 is -1, not 4.
 * Used to decide how "far" a slide is from the active one so looped carousels
 * don't have a jarring discontinuity at the wrap-around point.
 */
export function loopedDistance(index: number, selected: number, count: number): number {
  if (count === 0) return 0;
  const raw = index - selected;
  const wrapped = ((raw % count) + count) % count; // 0..count-1
  return wrapped > count / 2 ? wrapped - count : wrapped;
}

/**
 * Plain signed distance for non-looped carousels — unlike `loopedDistance`,
 * this never wraps around, since there's no wrap-around point to smooth over.
 */
export function plainDistance(index: number, selected: number): number {
  return index - selected;
}

/**
 * Maps a slide's distance from the active slide to a visual weight in the
 * 0..1 range (1 = active, 0 = fully receded). Distances beyond 2 slides are
 * treated the same so far-off slides don't keep shrinking indefinitely.
 */
export function distanceToWeight(distance: number): number {
  const abs = Math.min(Math.abs(distance), 2);
  return 1 - abs / 2;
}
