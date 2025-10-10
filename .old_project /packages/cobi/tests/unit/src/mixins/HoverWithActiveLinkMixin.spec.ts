import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import {useHoverWithActiveLinkMixin} from "../../../../src/mixins/HoverWithActiveLinkMixin";

describe('useHoverWithActiveLinkMixin', () => {
  let activeRelation;
  let isOpen;
  let mixin;

  beforeEach(() => {
    activeRelation = ref(false);
    isOpen = ref(false);
    mixin = useHoverWithActiveLinkMixin(activeRelation, isOpen);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.resetAllMocks();
  });

  it('should initialize with default values', () => {
    expect(mixin.isHoverWithActiveLink.value).toBe(false);
    expect(mixin.isHoverWithActiveLinkTimeoutId.value).toBe(null);
  });

  it('should not start hover when activeRelation is false', () => {
    mixin.startHoverWithActiveLink();
    expect(mixin.isHoverWithActiveLinkTimeoutId.value).toBe(null);
  });

  it('should not start hover when isOpen is true', () => {
    activeRelation.value = true;
    isOpen.value = true;
    mixin.startHoverWithActiveLink();
    expect(mixin.isHoverWithActiveLinkTimeoutId.value).toBe(null);
  });

  it('should start hover when conditions are met', () => {
    activeRelation.value = true;
    isOpen.value = false;
    mixin.startHoverWithActiveLink();
    expect(mixin.isHoverWithActiveLinkTimeoutId.value).not.toBe(null);
  });

  it('should set isHoverWithActiveLink to true after 1500ms', () => {
    activeRelation.value = true;
    isOpen.value = false;
    mixin.startHoverWithActiveLink();

    vi.advanceTimersByTime(1500);

    expect(mixin.isHoverWithActiveLink.value).toBe(true);
  });

  it('should set isOpen to true and reset isHoverWithActiveLink after 1800ms', () => {
    activeRelation.value = true;
    isOpen.value = false;
    mixin.startHoverWithActiveLink();

    vi.advanceTimersByTime(1500);
    expect(mixin.isHoverWithActiveLink.value).toBe(true);

    vi.advanceTimersByTime(300);
    expect(isOpen.value).toBe(true);
    expect(mixin.isHoverWithActiveLink.value).toBe(false);
  });

  it('should stop hover and clear timeouts when stopHoverWithActiveLink is called', () => {
    activeRelation.value = true;
    isOpen.value = false;
    mixin.startHoverWithActiveLink();
    mixin.stopHoverWithActiveLink();

    expect(mixin.isHoverWithActiveLink.value).toBe(false);
    expect(mixin.isHoverWithActiveLinkTimeoutId.value).toBe(null);
  });

  it('should not set isOpen to true if stopHoverWithActiveLink is called before timeout', () => {
    activeRelation.value = true;
    isOpen.value = false;
    mixin.startHoverWithActiveLink();

    vi.advanceTimersByTime(1000);
    mixin.stopHoverWithActiveLink();

    vi.advanceTimersByTime(5000);

    expect(isOpen.value).toBe(false);
    expect(mixin.isHoverWithActiveLink.value).toBe(false);
  });
});
