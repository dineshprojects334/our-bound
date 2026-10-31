import { test } from 'node:test';
import assert from 'node:assert/strict';

const resume = (() => {
  let count = 0;
  return {
    fn: () => {
      count += 1;
      return Promise.resolve();
    },
    get count() {
      return count;
    },
  };
})();

class MockAudioContext {
  state = 'suspended';
  resume = resume.fn;
  createOscillator() {
    return {
      type: '',
      frequency: { setValueAtTime() {} },
      connect() {},
      start() {},
      stop() {},
    };
  }
  createGain() {
    return {
      gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      connect() {},
    };
  }
  createBufferSource() {
    return {
      buffer: null,
      connect() {},
      start() {},
      stop() {},
    };
  }
  createBuffer() {
    return { getChannelData() { return new Float32Array(1); } };
  }
  createBiquadFilter() {
    return {
      type: '',
      frequency: { value: 0 },
      Q: { value: 0 },
      connect() {},
    };
  }
  destination = {};
  sampleRate = 44100;
  currentTime = 0;
}

Object.defineProperty(globalThis, 'window', {
  value: {
    AudioContext: MockAudioContext,
    addEventListener() {},
  },
  configurable: true,
});

const { sounds } = await import('../src/utils/sound.ts');

test('sound system unlocks audio context on user interaction', async () => {
  assert.equal(typeof sounds.unlock, 'function');

  sounds.unlock();
  assert.equal(resume.count > 0, true);
});
