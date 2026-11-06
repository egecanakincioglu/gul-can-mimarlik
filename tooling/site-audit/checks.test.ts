import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findChrome } from './chrome.ts';
import {
  consoleProblems,
  hasHorizontalOverflow,
  imageProblem,
  isOpenModal,
  originalImagePath,
  readPngWidth,
  summarizeAxe,
  type ImageFacts,
} from './checks.ts';
import { DEVICES, isScreenshotDevice, sweepWidths } from './devices.ts';

test('device set has the 10 viewports', () => {
  assert.equal(DEVICES.length, 10);
  assert.deepEqual(DEVICES.map((d) => `${d.width}x${d.height}`).sort(), [
    '1024x768',
    '1440x900',
    '1920x1080',
    '2560x1440',
    '320x568',
    '360x800',
    '390x844',
    '414x896',
    '768x1024',
    '844x390',
  ]);
  assert.deepEqual(
    DEVICES.filter((d) => !d.touch).map((d) => d.width),
    [1440, 1920, 2560],
  );
});

test('exactly five viewports get screenshots', () => {
  assert.deepEqual(
    DEVICES.filter(isScreenshotDevice)
      .map((d) => `${d.width}x${d.height}`)
      .sort(),
    ['1024x768', '1440x900', '390x844', '768x1024', '844x390'],
  );
});

test('sweep runs from 320 to 2560 in steps of 16 and includes 640', () => {
  const w = sweepWidths();
  assert.equal(w[0], 320);
  assert.equal(w.at(-1), 2560);
  assert.equal(w.length, 141);
  assert.ok(w.includes(640));
  assert.ok(w.every((x, i) => i === 0 || x - w[i - 1] === 16));
});

test('overflow decision: equal width passes, one pixel over fails', () => {
  assert.equal(hasHorizontalOverflow(390, 390), false);
  assert.equal(hasHorizontalOverflow(391, 390), true);
});

test('axe violations are summarized per rule with their targets', () => {
  assert.deepEqual(summarizeAxe([]), []);
  assert.deepEqual(summarizeAxe([{ id: 'target-size', nodes: [{ target: ['a.x'] }, { target: ['nav', 'button'] }] }]), [
    'target-size: a.x | nav button',
  ]);
});

test('console: errors and page errors fail, warnings and logs do not', () => {
  assert.deepEqual(
    consoleProblems([
      { type: 'log', text: 'a' },
      { type: 'warn', text: 'b' },
      { type: 'error', text: 'c' },
      { type: 'pageerror', text: 'd' },
    ]),
    ['error: c', 'pageerror: d'],
  );
});

const img = (o: Partial<ImageFacts>): ImageFacts => ({
  src: '/a.jpg',
  naturalWidth: 800,
  displayWidth: 400,
  viewportWidth: 1000,
  dpr: 2,
  hasSrcset: false,
  hasSizes: false,
  ...o,
});

test('image size: exact fit and exactly double pass', () => {
  assert.equal(imageProblem(img({})), null);
  assert.equal(imageProblem(img({ naturalWidth: 1600 })), null);
});

test('image size: too small and more than double fail', () => {
  assert.match(imageProblem(img({ naturalWidth: 799 }))!, /below/);
  assert.match(imageProblem(img({ naturalWidth: 1601 }))!, /twice/);
  assert.equal(imageProblem(img({ src: '/brand/logo.svg?v=2', naturalWidth: 5000 })), null);
  assert.match(imageProblem(img({ src: '/brand/logo.png', naturalWidth: 5000 }))!, /twice/);
});

test('image size: DPR counts at most 2', () => {
  assert.equal(imageProblem(img({ dpr: 3, naturalWidth: 800 })), null);
});

test('image size: hidden or widthless images skip the size check', () => {
  assert.equal(imageProblem(img({ displayWidth: 0, naturalWidth: 5000 })), null);
  assert.equal(imageProblem(img({ naturalWidth: 0 })), null);
});

test('image size: full-bleed lower bound is capped at 1920', () => {
  const wide = { displayWidth: 2560, viewportWidth: 2560, dpr: 1 };
  assert.equal(imageProblem(img({ ...wide, naturalWidth: 1920 })), null);
  assert.match(imageProblem(img({ ...wide, naturalWidth: 1919 }))!, /below the 1920px/);
  assert.equal(imageProblem(img({ displayWidth: 1024, viewportWidth: 1024, dpr: 2, naturalWidth: 1920 })), null);
});

test('image size: full-bleed upper bound stays twice the uncapped width', () => {
  const wide = { displayWidth: 2560, viewportWidth: 2560, dpr: 1 };
  assert.equal(imageProblem(img({ ...wide, naturalWidth: 5120 })), null);
  assert.match(imageProblem(img({ ...wide, naturalWidth: 5121 }))!, /twice/);
});

test('image size: an image narrower than the viewport keeps the plain rule', () => {
  const wide = { displayWidth: 2000, viewportWidth: 2560, dpr: 1 };
  assert.match(imageProblem(img({ ...wide, naturalWidth: 1920 }))!, /below the 2000px/);
  assert.equal(imageProblem(img({ ...wide, naturalWidth: 2000 })), null);
});

test('srcset needs sizes', () => {
  assert.match(imageProblem(img({ hasSrcset: true }))!, /sizes/);
  assert.equal(imageProblem(img({ hasSrcset: true, hasSizes: true })), null);
});

test('chrome path: CHROME_PATH wins, then known locations per platform', () => {
  assert.equal(
    findChrome({ CHROME_PATH: '/x' }, 'linux', () => true),
    '/x',
  );
  assert.equal(
    findChrome({}, 'linux', (p) => p === '/usr/bin/google-chrome-stable'),
    '/usr/bin/google-chrome-stable',
  );
  assert.match(
    findChrome({}, 'win32', (p) => p.includes('(x86)'))!,
    /Program Files \(x86\)/,
  );
  assert.equal(
    findChrome({}, 'win32', () => false),
    null,
  );
});

test('imageProblem caps the needed width at the original file width', () => {
  const small = img({ naturalWidth: 800, displayWidth: 1000, dpr: 2, viewportWidth: 1440 });
  assert.match(imageProblem(small) ?? '', /below the 2000px needed/);
  assert.equal(imageProblem({ ...small, originalWidth: 800 }), null);
  assert.match(imageProblem({ ...small, originalWidth: 900 }) ?? '', /below the 900px needed/);
});

test('originalImagePath resolves local image URLs', () => {
  assert.equal(
    originalImagePath('http://localhost:3000/_next/image?url=%2Fimages%2Fp1-cover.png&w=1920&q=75'),
    'images/p1-cover.png',
  );
  assert.equal(originalImagePath('http://localhost:3000/images/p1-cover.png'), 'images/p1-cover.png');
  assert.equal(originalImagePath('http://localhost:3000/_next/image?url=https%3A%2F%2Fx.test%2Fa.png&w=64'), null);
  assert.equal(originalImagePath('http://localhost:3000/_next/image?url=%2F..%2Fsecret.png'), null);
  assert.equal(originalImagePath('data:image/png;base64,AAAA'), null);
});

test('readPngWidth reads the IHDR width of a real file and ignores other data', () => {
  const file = readFileSync(new URL('../../public/images/p1-cover.png', import.meta.url));
  const width = readPngWidth(file);
  assert.ok(width && width > 0 && width < 20000);
  assert.equal(readPngWidth(new Uint8Array(40)), null);
  assert.equal(readPngWidth(new Uint8Array(4)), null);
});

test('isOpenModal ignores a hidden aria-modal element and counts a visible one', () => {
  const hidden = { isOpenDialog: false, ariaHidden: 'true', visibility: 'hidden', rectCount: 1 };
  assert.equal(isOpenModal(hidden), false);
  assert.equal(isOpenModal({ ...hidden, ariaHidden: null, visibility: 'visible' }), true);
  assert.equal(isOpenModal({ ...hidden, ariaHidden: null, visibility: 'hidden' }), false);
  assert.equal(isOpenModal({ ...hidden, ariaHidden: null, visibility: 'visible', rectCount: 0 }), false);
  assert.equal(isOpenModal({ ...hidden, isOpenDialog: true }), true);
});
