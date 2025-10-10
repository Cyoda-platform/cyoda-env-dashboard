// test.spec.js

import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { outputResponse, handlerError } from '../../../../src/helpers/HelperChatbot';

describe('outputResponse', () => {
  it('should set result and ready immediately when immediate is true', () => {
    const responseText = 'Test response';
    const isLoading = ref(true);
    const { result, ready } = outputResponse({ text: responseText, immediate: true }, isLoading);
    expect(result.value).toBe(responseText);
    expect(ready.value).toBe(true);
  });

  it('should process response asynchronously when immediate is false', async () => {
    const responseText = 'This is a test response';
    const isLoading = ref(true);
    const { result, ready } = outputResponse({ text: responseText }, isLoading);
    expect(result.value).toBe('');
    expect(ready.value).toBe(false);
    await vi.waitFor(() => {
      if (!ready.value) {
        throw new Error('Not ready yet');
      }
    }, { timeout: 5000 });
    expect(result.value.trim()).toBe(responseText);
    expect(ready.value).toBe(true);
  });
});

describe('handlerError', () => {
  it('should handle canceled error', () => {
    const e = { message: 'canceled' };
    const element = { repeats: [] };
    handlerError(e, element);
    expect(element.repeats).toEqual([
      [
        {
          type: 'text',
          text: 'The request was canceled',
        },
      ],
    ]);
  });

  it('should handle other errors', () => {
    const e = { message: 'some error' };
    const element = { repeats: [] };
    handlerError(e, element);
    expect(element.repeats).toEqual([
      [
        {
          type: 'text',
          text: 'Request returned an error. Please try again',
        },
      ],
    ]);
  });
});
