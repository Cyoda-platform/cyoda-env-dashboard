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
    const store = useEntityViewerStore.getState();
    const entity: EntityViewerEntity = { from: '', to: 'com.cyoda.core.Entity' };
    
    store.addEntity(entity);
    
    expect(store.entitys).toHaveLength(1);
    expect(store.entitys[0]).toEqual(entity);
  });

  it('should not add duplicate entity', () => {
    const store = useEntityViewerStore.getState();
    const entity: EntityViewerEntity = { from: '', to: 'com.cyoda.core.Entity' };
    
    store.addEntity(entity);
    store.addEntity(entity);
    
    expect(store.entitys).toHaveLength(1);
  });

  it('should remove entity', () => {
    const store = useEntityViewerStore.getState();
    const entity1: EntityViewerEntity = { from: '', to: 'com.cyoda.core.Entity' };
    const entity2: EntityViewerEntity = { from: '', to: 'com.cyoda.core.User' };
    
    store.addEntity(entity1);
    store.addEntity(entity2);
    store.removeEntity(entity1);
    
    expect(store.entitys).toHaveLength(1);
    expect(store.entitys[0]).toEqual(entity2);
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
    const store = useEntityViewerStore.getState();
    
    store.setOnlyDynamic(false);
    expect(store.onlyDynamic).toBe(false);
    
    store.setOnlyDynamic(true);
    expect(store.onlyDynamic).toBe(true);
  });

  it('should add multiple entities', () => {
    const store = useEntityViewerStore.getState();
    const entities: EntityViewerEntity[] = [
      { from: '', to: 'com.cyoda.core.Entity' },
      { from: 'com.cyoda.core.Entity', to: 'com.cyoda.core.User' },
      { from: 'com.cyoda.core.User', to: 'com.cyoda.core.Transaction' },
    ];
    
    entities.forEach(entity => store.addEntity(entity));
    
    expect(store.entitys).toHaveLength(3);
    expect(store.entitys).toEqual(entities);
  });
});

