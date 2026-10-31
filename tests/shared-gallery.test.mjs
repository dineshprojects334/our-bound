import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldUseLocalGalleryFallback } from '../src/lib/galleryPersistence.js';

test('shared gallery should never fall back to browser storage in production', () => {
  assert.equal(shouldUseLocalGalleryFallback({ viteApiBase: '/.netlify/functions', isDev: false }), false);
  assert.equal(shouldUseLocalGalleryFallback({ viteApiBase: '', isDev: true }), true);
});
