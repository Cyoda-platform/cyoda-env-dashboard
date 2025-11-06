/**
 * Tests for Source Configuration Store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSourceConfigStore } from './sourceConfigStore';
import type { CsvUploadConfig } from '../types';

describe('sourceConfigStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useSourceConfigStore.getState().reset();
  });

  it('should have default state', () => {
    const state = useSourceConfigStore.getState();

    expect(state.uploadConfigSampleUploadUrl).toBe('encompass/upload-config/sample-upload');
    expect(state.uploadFileUploadUrl).toBe('encompass/upload-file/upload');
    expect(state.editingConfig).toBeNull();
    expect(state.uploadProgress).toEqual({});
    expect(state.isCreateDialogOpen).toBe(false);
    expect(state.isUploadDialogOpen).toBe(false);
    expect(state.filterText).toBe('');
  });

  it('should set editing config', () => {
    const config: CsvUploadConfig = {
      id: '1',
      name: 'Test Config',
      fileType: 'CSV',
      columnMappingConfigs: [],
    };

    useSourceConfigStore.getState().setEditingConfig(config);

    expect(useSourceConfigStore.getState().editingConfig).toEqual(config);
  });

  it('should clear editing config', () => {
    const config: CsvUploadConfig = {
      id: '1',
      name: 'Test Config',
      fileType: 'CSV',
      columnMappingConfigs: [],
    };

    useSourceConfigStore.getState().setEditingConfig(config);
    expect(useSourceConfigStore.getState().editingConfig).toEqual(config);

    useSourceConfigStore.getState().setEditingConfig(null);
    expect(useSourceConfigStore.getState().editingConfig).toBeNull();
  });

  it('should set upload progress', () => {
    const progress = {
      configId: '1',
      fileName: 'test.csv',
      progress: 50,
      status: 'uploading' as const,
    };

    useSourceConfigStore.getState().setUploadProgress('1', progress);

    expect(useSourceConfigStore.getState().uploadProgress['1']).toEqual(progress);
  });

  it('should clear upload progress', () => {
    const progress = {
      configId: '1',
      fileName: 'test.csv',
      progress: 100,
      status: 'completed' as const,
    };

    useSourceConfigStore.getState().setUploadProgress('1', progress);
    expect(useSourceConfigStore.getState().uploadProgress['1']).toEqual(progress);

    useSourceConfigStore.getState().clearUploadProgress('1');
    expect(useSourceConfigStore.getState().uploadProgress['1']).toBeUndefined();
  });

  it('should toggle create dialog', () => {
    expect(useSourceConfigStore.getState().isCreateDialogOpen).toBe(false);

    useSourceConfigStore.getState().setCreateDialogOpen(true);
    expect(useSourceConfigStore.getState().isCreateDialogOpen).toBe(true);

    useSourceConfigStore.getState().setCreateDialogOpen(false);
    expect(useSourceConfigStore.getState().isCreateDialogOpen).toBe(false);
  });

  it('should toggle upload dialog', () => {
    expect(useSourceConfigStore.getState().isUploadDialogOpen).toBe(false);

    useSourceConfigStore.getState().setUploadDialogOpen(true);
    expect(useSourceConfigStore.getState().isUploadDialogOpen).toBe(true);

    useSourceConfigStore.getState().setUploadDialogOpen(false);
    expect(useSourceConfigStore.getState().isUploadDialogOpen).toBe(false);
  });

  it('should set filter text', () => {
    expect(useSourceConfigStore.getState().filterText).toBe('');

    useSourceConfigStore.getState().setFilterText('test');
    expect(useSourceConfigStore.getState().filterText).toBe('test');

    useSourceConfigStore.getState().setFilterText('');
    expect(useSourceConfigStore.getState().filterText).toBe('');
  });

  it('should reset store', () => {
    // Set some state
    useSourceConfigStore.getState().setFilterText('test');
    useSourceConfigStore.getState().setCreateDialogOpen(true);
    useSourceConfigStore.getState().setEditingConfig({
      id: '1',
      name: 'Test',
      fileType: 'CSV',
      columnMappingConfigs: [],
    });

    // Reset
    useSourceConfigStore.getState().reset();

    // Check all state is reset
    const state = useSourceConfigStore.getState();
    expect(state.filterText).toBe('');
    expect(state.isCreateDialogOpen).toBe(false);
    expect(state.editingConfig).toBeNull();
    expect(state.uploadProgress).toEqual({});
  });
});

