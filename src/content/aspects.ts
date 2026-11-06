import type { GallerySlot } from './types';

/** Width over height of each gallery slot, as laid out by the project gallery. */
export const ASPECT: Record<GallerySlot, number> = { wide: 21 / 9, landscape: 3 / 2, portrait: 4 / 5, square: 1 };

/** Gallery images are cropped with object-cover, so a moderate mismatch is fine. */
export const ASPECT_TOLERANCE = 0.3;

export const fitsAspect = (media: { width: number; height: number }, aspect: number, tolerance: number) =>
  Math.abs(media.width / media.height / aspect - 1) <= tolerance;
