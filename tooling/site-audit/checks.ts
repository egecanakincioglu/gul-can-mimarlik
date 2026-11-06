// Pure decision functions of the audit; the browser code in run.ts only collects the facts.
export function hasHorizontalOverflow(scrollWidth: number, innerWidth: number): boolean {
  return scrollWidth > innerWidth;
}

export interface AxeViolation {
  id: string;
  nodes: { target: unknown[] }[];
}

export function summarizeAxe(violations: readonly AxeViolation[]): string[] {
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
}

export interface ConsoleEntry {
  type: string;
  text: string;
}

/** Console errors and uncaught page errors fail the audit; warnings and logs do not. */
export function consoleProblems(entries: readonly ConsoleEntry[]): string[] {
  return entries.filter((e) => e.type === 'error' || e.type === 'pageerror').map((e) => `${e.type}: ${e.text}`);
}

const FULL_BLEED_MAX_SOURCE = 1920;

export interface ImageFacts {
  src: string;
  /** Pixel width of the file the browser selected (decoded separately; img.naturalWidth is density-corrected). */
  naturalWidth: number;
  /** Rendered width in CSS px. */
  displayWidth: number;
  /** Viewport width in CSS px, without the scrollbar. */
  viewportWidth: number;
  dpr: number;
  hasSrcset: boolean;
  hasSizes: boolean;
  /** Pixel width of the original file under public/, when known; the page cannot serve more than that. */
  originalWidth?: number;
}

function isVector(src: string): boolean {
  return /^data:image\/svg\+xml/i.test(src) || /\.svg([?#]|$)/i.test(src);
}

/**
 * The selected source is at least display width x min(DPR, 2) and at most twice that;
 * every srcset image has sizes. A full-bleed image (displayed at least as wide as the viewport) cannot have a source
 * for every wide screen, so its lower bound is capped at 1920 px; its upper bound stays twice the uncapped width.
 * An SVG source skips the upper bound. Hidden images and images without a natural width (not decoded) skip the
 * size check.
 */
export function imageProblem(img: ImageFacts): string | null {
  if (img.hasSrcset && !img.hasSizes) return `${img.src}: srcset without sizes`;
  if (img.displayWidth <= 0 || img.naturalWidth <= 0) return null;
  const needed = img.displayWidth * Math.min(img.dpr, 2);
  const fullBleed = img.displayWidth >= img.viewportWidth;
  const wanted = fullBleed ? Math.min(needed, FULL_BLEED_MAX_SOURCE) : needed;
  const minimum = img.originalWidth ? Math.min(wanted, img.originalWidth) : wanted;
  if (img.naturalWidth < minimum) {
    return `${img.src}: ${img.naturalWidth}px source is below the ${Math.ceil(minimum)}px needed`;
  }
  // A vector scales without extra bytes, so its intrinsic size says nothing about the weight of the file.
  if (img.naturalWidth > needed * 2 && !isVector(img.src)) {
    return `${img.src}: ${img.naturalWidth}px source is more than twice the ${Math.ceil(needed)}px needed`;
  }
  return null;
}

/** Path of the original file under public/ for a local image URL (plain or /_next/image?url=), or null. */
export function originalImagePath(src: string): string | null {
  let url: URL;
  try {
    url = new URL(src, 'http://local');
  } catch {
    return null;
  }
  const target = url.pathname === '/_next/image' ? url.searchParams.get('url') : url.pathname;
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.includes('..')) return null;
  return target.slice(1);
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Width from the PNG IHDR chunk; null for other formats, which stay uncapped. */
export function readPngWidth(bytes: Uint8Array): number | null {
  if (bytes.length < 24 || PNG_SIGNATURE.some((b, i) => bytes[i] !== b)) return null;
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(16);
}

export interface ModalFacts {
  isOpenDialog: boolean;
  ariaHidden: string | null;
  visibility: string;
  rectCount: number;
}

/** A hidden aria-modal element (the closed menu) is not an open modal. */
export function isOpenModal(f: ModalFacts): boolean {
  return f.isOpenDialog || (f.ariaHidden !== 'true' && f.visibility !== 'hidden' && f.rectCount > 0);
}
