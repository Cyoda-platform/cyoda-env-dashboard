/**
 * EventBus Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import eventBus, { EventBus } from './eventBus';

describe('EventBus', () => {
  let testBus: EventBus;

  beforeEach(() => {
    testBus = new EventBus();
    eventBus.clear();
  });

  describe('on and emit', () => {
    it('should register and trigger event listeners', () => {
      const callback = vi.fn();
      testBus.on('test', callback);
      testBus.emit('test', 'arg1', 'arg2');
      
      expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support multiple listeners for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      testBus.on('test', callback1);
      testBus.on('test', callback2);
      testBus.emit('test', 'data');
      
      expect(callback1).toHaveBeenCalledWith('data');
      expect(callback2).toHaveBeenCalledWith('data');
    });

    it('should not trigger listeners for different events', () => {
      const callback = vi.fn();
      testBus.on('event1', callback);
      testBus.emit('event2');
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('once', () => {
    it('should trigger listener only once', () => {
      const callback = vi.fn();
      testBus.once('test', callback);
      
      testBus.emit('test', 'first');
      testBus.emit('test', 'second');
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('first');
    });
  });

  describe('off', () => {
    it('should remove specific listener', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      testBus.on('test', callback1);
      testBus.on('test', callback2);
      testBus.off('test', callback1);
      testBus.emit('test');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should remove all listeners for event when no callback provided', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      testBus.on('test', callback1);
      testBus.on('test', callback2);
      testBus.off('test');
      testBus.emit('test');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should remove all event listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      testBus.on('event1', callback1);
      testBus.on('event2', callback2);
      testBus.clear();
      testBus.emit('event1');
      testBus.emit('event2');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('global eventBus instance', () => {
    it('should work with global instance', () => {
      const callback = vi.fn();
      eventBus.on('globalTest', callback);
      eventBus.emit('globalTest', 'data');
      
      expect(callback).toHaveBeenCalledWith('data');
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple arguments', () => {
      const callback = vi.fn();
      testBus.on('test', callback);
      testBus.emit('test', 1, 'two', { three: 3 }, [4, 5]);
      
      expect(callback).toHaveBeenCalledWith(1, 'two', { three: 3 }, [4, 5]);
    });

    it('should handle object payloads', () => {
      const callback = vi.fn();
      const payload = { configDefinitionRequest: {}, title: 'Test' };
      
      testBus.on('streamGrid:open', callback);
      testBus.emit('streamGrid:open', payload);
      
      expect(callback).toHaveBeenCalledWith(payload);
    });
  });
});

