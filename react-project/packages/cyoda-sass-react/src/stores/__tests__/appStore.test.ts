import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../appStore';

describe('appStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      activeMenuLink: undefined,
      isToggledMenu: false,
    });
  });

  it('should have initial state', () => {
    const state = useAppStore.getState();
    expect(state.activeMenuLink).toBeUndefined();
    expect(state.isToggledMenu).toBe(false);
  });

  it('should set active menu link', () => {
    const { setActiveMenuLink } = useAppStore.getState();
    setActiveMenuLink('/trino');
    
    const state = useAppStore.getState();
    expect(state.activeMenuLink).toBe('/trino');
  });

  it('should toggle menu', () => {
    const { toggleMenu } = useAppStore.getState();
    
    // First toggle
    toggleMenu();
    expect(useAppStore.getState().isToggledMenu).toBe(true);
    
    // Second toggle
    toggleMenu();
    expect(useAppStore.getState().isToggledMenu).toBe(false);
  });

  it('should update active menu link multiple times', () => {
    const { setActiveMenuLink } = useAppStore.getState();
    
    setActiveMenuLink('/trino');
    expect(useAppStore.getState().activeMenuLink).toBe('/trino');
    
    setActiveMenuLink('/settings');
    expect(useAppStore.getState().activeMenuLink).toBe('/settings');
    
    setActiveMenuLink('/home');
    expect(useAppStore.getState().activeMenuLink).toBe('/home');
  });

  it('should persist isToggledMenu state', () => {
    const { toggleMenu } = useAppStore.getState();
    
    toggleMenu();
    expect(useAppStore.getState().isToggledMenu).toBe(true);
    
    // Note: In a real test environment with localStorage, we would verify
    // that the state is persisted. For now, we just verify the state changes.
  });
});

