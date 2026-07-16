/**
 * Deterministic display rating/review-count for products that don't yet
 * have real reviews from the backend. Seeded by product id so the same
 * product always shows the same rating across renders and reloads, rather
 * than jumping around on every request.
 */
function seedFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const RATING_OPTIONS = [3.5, 4, 4, 4.5, 4.5, 5];

export function getDisplayRating(id: string, rating?: number | null): number {
  if (rating && rating > 0) return rating;
  const seed = seedFromId(id);
  return RATING_OPTIONS[seed % RATING_OPTIONS.length];
}

export function getDisplayReviewCount(id: string, count?: number | null): number {
  if (count && count > 0) return count;
  const seed = seedFromId(`${id}-reviews`);
  return 12 + (seed % 480);
}
