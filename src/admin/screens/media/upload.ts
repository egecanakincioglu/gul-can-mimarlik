import type { MediaItem } from '@/content/types';

export const UPLOADED_STATUS = 'Yüklendi. Şimdi görsel açıklamasını yazın.';

const slugify = (name: string) =>
  name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'gorsel';

const readDimensions = (url: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('unreadable'));
    img.src = url;
  });

/** Object URLs live until revoked; stored library items never point at one after they are removed. */
export const revokeIfBlob = (file: string) => {
  if (file.startsWith('blob:')) URL.revokeObjectURL(file);
};

/** Builds a library item from an image file. Rejects (after revoking the object URL) when the file cannot be decoded. */
export const createMediaItem = async (file: File, seq: number): Promise<MediaItem> => {
  const url = URL.createObjectURL(file);
  try {
    const { width, height } = await readDimensions(url);
    const id = `${slugify(file.name)}-${Date.now().toString(36)}${seq}`;
    return { id, file: url, width, height, alt: '', focal: { x: 50, y: 50 }, illustrative: null };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
};
