/**
 * SSH Store Tests
 * Tests for the SSH configuration state management store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSshStore } from '../sshStore';

describe('sshStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useSshStore.getState();
    store.reset();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useSshStore.getState();

      expect(state.connection).toBeNull();
      expect(state.commands).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Connection Actions', () => {
    it('should set connection', () => {
      const store = useSshStore.getState();
      const testConnection = {
        host: 'test-host',
        port: 22,
        username: 'testuser',
      };

      store.setConnection(testConnection);

      expect(useSshStore.getState().connection).toEqual(testConnection);
    });

    it('should update connection', () => {
      const store = useSshStore.getState();

      // Set initial connection
      store.setConnection({ host: 'host1', port: 22 });

      // Update connection
      const newConnection = { host: 'host2', port: 2222, username: 'user' };
      store.setConnection(newConnection);

      expect(useSshStore.getState().connection).toEqual(newConnection);
    });

    it('should set connection to null', () => {
      const store = useSshStore.getState();

      // Set some connection first
      store.setConnection({ host: 'test' });
      expect(useSshStore.getState().connection).toBeTruthy();

      // Set to null
      store.setConnection(null);
      expect(useSshStore.getState().connection).toBeNull();
    });

    it('should handle complex connection config', () => {
      const store = useSshStore.getState();
      const complexConnection = {
        host: 'ssh.example.com',
        port: 2222,
        username: 'admin',
        password: 'secret',
        privateKey: 'key-content',
        passphrase: 'passphrase',
      };

      store.setConnection(complexConnection);

      expect(useSshStore.getState().connection).toEqual(complexConnection);
    });
  });

  describe('Commands Actions', () => {
    it('should add a command', () => {
      const store = useSshStore.getState();
      const command = {
        id: '1',
        command: 'ls -la',
        timestamp: new Date().toISOString(),
      };

      store.addCommand(command);

      const state = useSshStore.getState();
      expect(state.commands).toHaveLength(1);
      expect(state.commands[0]).toEqual(command);
    });

    it('should add multiple commands', () => {
      const store = useSshStore.getState();

      store.addCommand({ id: '1', command: 'ls' });
      store.addCommand({ id: '2', command: 'pwd' });
      store.addCommand({ id: '3', command: 'whoami' });

      const state = useSshStore.getState();
      expect(state.commands).toHaveLength(3);
      expect(state.commands[0].id).toBe('1');
      expect(state.commands[1].id).toBe('2');
      expect(state.commands[2].id).toBe('3');
    });

    it('should clear commands', () => {
      const store = useSshStore.getState();

      // Add some commands
      store.addCommand({ id: '1', command: 'ls' });
      store.addCommand({ id: '2', command: 'pwd' });

      expect(useSshStore.getState().commands).toHaveLength(2);

      // Clear commands
      store.clearCommands();

      expect(useSshStore.getState().commands).toEqual([]);
    });
  });

  describe('Loading Actions', () => {
    it('should set loading to true', () => {
      const store = useSshStore.getState();

      store.setLoading(true);

      expect(useSshStore.getState().loading).toBe(true);
    });

    it('should set loading to false', () => {
      const store = useSshStore.getState();

      store.setLoading(false);

      expect(useSshStore.getState().loading).toBe(false);
    });
  });

  describe('Error Actions', () => {
    it('should set error message', () => {
      const store = useSshStore.getState();
      const errorMsg = 'SSH connection failed';

      store.setError(errorMsg);

      expect(useSshStore.getState().error).toBe(errorMsg);
    });

    it('should clear error', () => {
      const store = useSshStore.getState();

      // Set error first
      store.setError('Error');
      expect(useSshStore.getState().error).toBe('Error');

      // Clear error
      store.setError(null);
      expect(useSshStore.getState().error).toBeNull();
    });
  });

  describe('Reset Action', () => {
    it('should reset store to initial state', () => {
      const store = useSshStore.getState();

      // Modify state
      store.setConnection({ host: 'test', port: 22 });
      store.addCommand({ id: '1', command: 'ls' });
      store.setLoading(true);
      store.setError('Test error');

      // Verify state changed
      expect(useSshStore.getState().connection).toEqual({ host: 'test', port: 22 });
      expect(useSshStore.getState().commands).toHaveLength(1);
      expect(useSshStore.getState().loading).toBe(true);
      expect(useSshStore.getState().error).toBe('Test error');

      // Reset
      store.reset();

      // Verify reset to initial state
      const resetState = useSshStore.getState();
      expect(resetState.connection).toBeNull();
      expect(resetState.commands).toEqual([]);
      expect(resetState.loading).toBe(false);
      expect(resetState.error).toBeNull();
    });
  });



  describe('Connection Workflow', () => {
    it('should handle connection workflow', () => {
      const store = useSshStore.getState();

      // Step 1: Set connection
      const connection = {
        host: 'server.example.com',
        port: 22,
        username: 'admin',
      };
      store.setConnection(connection);

      expect(useSshStore.getState().connection).toEqual(connection);

      // Step 2: Execute commands
      store.addCommand({ id: '1', command: 'ls -la' });
      store.addCommand({ id: '2', command: 'pwd' });

      expect(useSshStore.getState().commands).toHaveLength(2);

      // Step 3: Disconnect
      store.setConnection(null);

      expect(useSshStore.getState().connection).toBeNull();
      expect(useSshStore.getState().commands).toHaveLength(2); // Commands should remain
    });

    it('should handle reconnection', () => {
      const store = useSshStore.getState();

      // Initial connection
      store.setConnection({ host: 'host1' });
      store.addCommand({ id: '1', command: 'ls' });

      // Disconnect
      store.setConnection(null);

      // Reconnect with new connection
      store.setConnection({ host: 'host2' });

      const state = useSshStore.getState();
      expect(state.connection?.host).toBe('host2');
      expect(state.commands).toHaveLength(1); // Commands persist
    });

    it('should handle command history management', () => {
      const store = useSshStore.getState();

      // Add commands
      store.addCommand({ id: '1', command: 'ls' });
      store.addCommand({ id: '2', command: 'pwd' });
      store.addCommand({ id: '3', command: 'whoami' });

      expect(useSshStore.getState().commands).toHaveLength(3);

      // Clear history
      store.clearCommands();

      expect(useSshStore.getState().commands).toEqual([]);
    });
  });
});

