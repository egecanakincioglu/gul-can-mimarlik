import { ASPECT, ASPECT_TOLERANCE, fitsAspect } from '@/content/aspects';

export type RatioSpec = { key: string; label: string; name: string; aspect: number };

/** Slot ratios the content model knows, plus the two used outside the gallery (comparison and video). */
export const RATIOS: Record<'wide' | 'landscape' | 'portrait' | 'square' | 'compare' | 'video' | 'og', RatioSpec> = {
  wide: { key: 'wide', label: '21:9', name: 'Geniş', aspect: ASPECT.wide },
  landscape: { key: 'landscape', label: '3:2', name: 'Yatay', aspect: ASPECT.landscape },
  portrait: { key: 'portrait', label: '4:5', name: 'Dikey', aspect: ASPECT.portrait },
  square: { key: 'square', label: '1:1', name: 'Kare', aspect: ASPECT.square },
  compare: { key: 'compare', label: '4:3', name: 'Önce/Sonra', aspect: 4 / 3 },
  og: { key: 'og', label: '1.91:1', name: 'Paylaşım', aspect: 1200 / 630 },
  video: { key: 'video', label: '16:9', name: 'Video', aspect: 16 / 9 },
};

type Size = { width: number; height: number };

export const fitsRatio = (media: Size, ratio: RatioSpec) => fitsAspect(media, ratio.aspect, ASPECT_TOLERANCE);

/** Turkish reason an image cannot fill a slot, or null when it fits. */
export const unfitReason = (media: Size, ratio: RatioSpec): string | null =>
  fitsRatio(media, ratio) ? null : `Oran uymuyor: ${media.width}×${media.height} görsel ${ratio.label} alanı kaplamaz.`;

export const fileName = (file: string) => file.split('/').filter(Boolean).pop() ?? file;
