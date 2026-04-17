import { describe, it, expect } from 'vitest';
import { nodeHasError } from '../nodeHasError';

describe('nodeHasError', () => {
  const errors = [
    { path: '/states/draft/transitions/0/next', message: 'x' },
    { path: '/name', message: 'y' },
  ];
  it('returns true for an exact path match', () => {
    expect(nodeHasError('/name', errors)).toBe(true);
  });
  it('returns true for an ancestor path of an error', () => {
    expect(nodeHasError('/states/draft', errors)).toBe(true);
    expect(nodeHasError('/states/draft/transitions/0', errors)).toBe(true);
  });
  it('returns false for an unrelated path', () => {
    expect(nodeHasError('/states/review', errors)).toBe(false);
  });
  it('returns false for the empty error list', () => {
    expect(nodeHasError('/states/draft', [])).toBe(false);
  });
  it('does NOT return true for sibling/prefix-only paths', () => {
    // "/states/draft" is NOT a prefix of "/states/draftish/..."; the slash matters.
    expect(nodeHasError('/states/draftish', [{ path: '/states/draft/transitions/0', message: 'x' }])).toBe(false);
  });
});
