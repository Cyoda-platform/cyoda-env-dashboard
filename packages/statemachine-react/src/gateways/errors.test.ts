import { describe, it, expect } from 'vitest';
import {
  CannotDeleteLastWorkflowError,
  RenameIncompleteError,
  NotImplementedInLegacyError,
} from './errors';

describe('gateway errors', () => {
  describe('CannotDeleteLastWorkflowError', () => {
    it('is an Error subclass with the expected name and message', () => {
      const err = new CannotDeleteLastWorkflowError('Customer', 1, 'OnlyWorkflow');
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('CannotDeleteLastWorkflowError');
      expect(err.entityName).toBe('Customer');
      expect(err.modelVersion).toBe(1);
      expect(err.workflowName).toBe('OnlyWorkflow');
      expect(err.message).toContain('Customer');
      expect(err.message).toContain('OnlyWorkflow');
    });
  });

  describe('RenameIncompleteError', () => {
    it('carries both names and the underlying cause', () => {
      const cause = new Error('network down');
      const err = new RenameIncompleteError('OldName', 'NewName', cause);
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('RenameIncompleteError');
      expect(err.oldName).toBe('OldName');
      expect(err.newName).toBe('NewName');
      expect(err.cause).toBe(cause);
      expect(err.message).toContain('OldName');
      expect(err.message).toContain('NewName');
    });
  });

  describe('NotImplementedInLegacyError', () => {
    it('exposes the operation name in the message', () => {
      const err = new NotImplementedInLegacyError('loadWorkflow');
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('NotImplementedInLegacyError');
      expect(err.operation).toBe('loadWorkflow');
      expect(err.message).toContain('loadWorkflow');
      expect(err.message).toContain('legacy');
    });
  });
});
