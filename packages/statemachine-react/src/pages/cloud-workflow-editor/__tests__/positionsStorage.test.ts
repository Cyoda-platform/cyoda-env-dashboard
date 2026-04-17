import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { positionsKey, loadPositions, savePositions } from '../positionsStorage';

const ref = { entityName: 'Customer', modelVersion: 1 };

describe('positionsStorage', () => {
  beforeEach(() => { window.localStorage.clear(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('positionsKey returns the correct shape', () => {
    expect(positionsKey(ref, 'wf')).toBe('cyoda.cloud-workflow-editor.positions:Customer/1/wf');
  });

  it('round-trip: savePositions then loadPositions returns the same map', () => {
    const map = { 'state:draft': { x: 10, y: 20 }, 'state:final': { x: 100, y: 200 } };
    savePositions(ref, 'wf', map);
    expect(loadPositions(ref, 'wf')).toEqual(map);
  });

  it('loadPositions returns null when nothing is stored', () => {
    expect(loadPositions(ref, 'wf')).toBeNull();
  });

  it('loadPositions returns null when stored value is malformed JSON', () => {
    window.localStorage.setItem(positionsKey(ref, 'wf'), 'not-json{{');
    expect(loadPositions(ref, 'wf')).toBeNull();
  });

  it('loadPositions returns null when stored value is not an object', () => {
    window.localStorage.setItem(positionsKey(ref, 'wf'), '"a string"');
    expect(loadPositions(ref, 'wf')).toBeNull();
  });

  it('savePositions swallows errors when localStorage.setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => savePositions(ref, 'wf', { 'state:x': { x: 1, y: 2 } })).not.toThrow();
  });
});
