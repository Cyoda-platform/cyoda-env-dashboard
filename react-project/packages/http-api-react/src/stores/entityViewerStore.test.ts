/**
 * EntityViewerStore Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useEntityViewerStore } from './entityViewerStore';
import type { EntityViewerEntity } from '../types';

describe('EntityViewerStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useEntityViewerStore.getState();
    store.clearEntities();
    store.setOnlyDynamic(true);
  });

  it('should have initial state', () => {
    const store = useEntityViewerStore.getState();
    expect(store.entitys).toEqual([]);
    expect(store.onlyDynamic).toBe(true);
  });

  it('should add entity', () => {
    const entity: EntityViewerEntity = { from: '', to: 'com.cyoda.core.Entity' };

    useEntityViewerStore.getState().addEntity(entity);

    const state = useEntityViewerStore.getState();
    expect(state.entitys).toHaveLength(1);
    expect(state.entitys[0]).toEqual(entity);
  });

  it('should not add duplicate entity', () => {
    const entity: EntityViewerEntity = { from: '', to: 'com.cyoda.core.Entity' };

    useEntityViewerStore.getState().addEntity(entity);
    useEntityViewerStore.getState().addEntity(entity);

    const state = useEntityViewerStore.getState();
    expect(state.entitys).toHaveLength(1);
  });

  it('should remove entity', () => {
    const entity1: EntityViewerEntity = { from: '', to: 'com.cyoda.core.Entity' };
    const entity2: EntityViewerEntity = { from: '', to: 'com.cyoda.core.User' };

    useEntityViewerStore.getState().addEntity(entity1);
    useEntityViewerStore.getState().addEntity(entity2);
    useEntityViewerStore.getState().removeEntity(entity1);

    const state = useEntityViewerStore.getState();
    expect(state.entitys).toHaveLength(1);
    expect(state.entitys[0]).toEqual(entity2);
  });

  it('should clear all entities', () => {
    const store = useEntityViewerStore.getState();
    const entity1: EntityViewerEntity = { from: '', to: 'com.cyoda.core.Entity' };
    const entity2: EntityViewerEntity = { from: '', to: 'com.cyoda.core.User' };
    
    store.addEntity(entity1);
    store.addEntity(entity2);
    store.clearEntities();
    
    expect(store.entitys).toEqual([]);
  });

  it('should set onlyDynamic flag', () => {
    useEntityViewerStore.getState().setOnlyDynamic(false);
    expect(useEntityViewerStore.getState().onlyDynamic).toBe(false);

    useEntityViewerStore.getState().setOnlyDynamic(true);
    expect(useEntityViewerStore.getState().onlyDynamic).toBe(true);
  });

  it('should add multiple entities', () => {
    const entities: EntityViewerEntity[] = [
      { from: '', to: 'com.cyoda.core.Entity' },
      { from: 'com.cyoda.core.Entity', to: 'com.cyoda.core.User' },
      { from: 'com.cyoda.core.User', to: 'com.cyoda.core.Transaction' },
    ];

    entities.forEach(entity => useEntityViewerStore.getState().addEntity(entity));

    const state = useEntityViewerStore.getState();
    expect(state.entitys).toHaveLength(3);
    expect(state.entitys).toEqual(entities);
  });
});

