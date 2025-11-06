/**
 * Grafana Store Tests
 * Tests for the Grafana charts state management store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGrafanaStore } from '../grafanaStore';

describe('grafanaStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useGrafanaStore.getState();
    store.reset();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useGrafanaStore.getState();
      
      expect(state.charts).toEqual([]);
      expect(state.selectedChart).toBeNull();
    });
  });

  describe('Charts Actions', () => {
    it('should set charts', () => {
      const store = useGrafanaStore.getState();
      const testCharts = [
        { id: '1', name: 'CPU Usage', panelId: 1 },
        { id: '2', name: 'Memory Usage', panelId: 2 },
      ];
      
      store.setCharts(testCharts);
      
      expect(useGrafanaStore.getState().charts).toEqual(testCharts);
    });

    it('should set empty charts array', () => {
      const store = useGrafanaStore.getState();
      
      // Set some charts first
      store.setCharts([{ id: '1', name: 'Chart 1' }]);
      expect(useGrafanaStore.getState().charts).toHaveLength(1);
      
      // Set to empty
      store.setCharts([]);
      expect(useGrafanaStore.getState().charts).toEqual([]);
    });

    it('should update charts', () => {
      const store = useGrafanaStore.getState();
      
      // Set initial charts
      store.setCharts([{ id: '1', name: 'Chart 1' }]);
      
      // Update with new charts
      const newCharts = [
        { id: '2', name: 'Chart 2' },
        { id: '3', name: 'Chart 3' },
      ];
      store.setCharts(newCharts);
      
      expect(useGrafanaStore.getState().charts).toEqual(newCharts);
      expect(useGrafanaStore.getState().charts).toHaveLength(2);
    });
  });

  describe('Add Chart Action', () => {
    it('should add a chart', () => {
      const store = useGrafanaStore.getState();
      const newChart = { id: '1', name: 'CPU Usage', panelId: 1 };
      
      store.addChart(newChart);
      
      const state = useGrafanaStore.getState();
      expect(state.charts).toHaveLength(1);
      expect(state.charts[0]).toEqual(newChart);
    });

    it('should add multiple charts', () => {
      const store = useGrafanaStore.getState();
      
      store.addChart({ id: '1', name: 'Chart 1' });
      store.addChart({ id: '2', name: 'Chart 2' });
      store.addChart({ id: '3', name: 'Chart 3' });
      
      const state = useGrafanaStore.getState();
      expect(state.charts).toHaveLength(3);
      expect(state.charts[0].id).toBe('1');
      expect(state.charts[1].id).toBe('2');
      expect(state.charts[2].id).toBe('3');
    });

    it('should add chart to existing charts', () => {
      const store = useGrafanaStore.getState();
      
      // Set initial charts
      store.setCharts([{ id: '1', name: 'Chart 1' }]);
      
      // Add new chart
      store.addChart({ id: '2', name: 'Chart 2' });
      
      const state = useGrafanaStore.getState();
      expect(state.charts).toHaveLength(2);
    });
  });

  describe('Remove Chart Action', () => {
    it('should remove a chart by id', () => {
      const store = useGrafanaStore.getState();
      
      // Set initial charts
      store.setCharts([
        { id: '1', name: 'Chart 1' },
        { id: '2', name: 'Chart 2' },
        { id: '3', name: 'Chart 3' },
      ]);
      
      // Remove chart with id '2'
      store.removeChart('2');
      
      const state = useGrafanaStore.getState();
      expect(state.charts).toHaveLength(2);
      expect(state.charts.find(c => c.id === '2')).toBeUndefined();
      expect(state.charts.find(c => c.id === '1')).toBeDefined();
      expect(state.charts.find(c => c.id === '3')).toBeDefined();
    });

    it('should handle removing non-existent chart', () => {
      const store = useGrafanaStore.getState();
      
      store.setCharts([
        { id: '1', name: 'Chart 1' },
        { id: '2', name: 'Chart 2' },
      ]);
      
      // Try to remove non-existent chart
      store.removeChart('999');
      
      // Charts should remain unchanged
      const state = useGrafanaStore.getState();
      expect(state.charts).toHaveLength(2);
    });

    it('should remove all charts one by one', () => {
      const store = useGrafanaStore.getState();
      
      store.setCharts([
        { id: '1', name: 'Chart 1' },
        { id: '2', name: 'Chart 2' },
      ]);
      
      store.removeChart('1');
      expect(useGrafanaStore.getState().charts).toHaveLength(1);
      
      store.removeChart('2');
      expect(useGrafanaStore.getState().charts).toHaveLength(0);
    });
  });

  describe('Selected Chart Actions', () => {
    it('should set selected chart', () => {
      const store = useGrafanaStore.getState();
      const testChart = { id: '1', name: 'Selected Chart', panelId: 1 };
      
      store.setSelectedChart(testChart);
      
      expect(useGrafanaStore.getState().selectedChart).toEqual(testChart);
    });

    it('should set selected chart to null', () => {
      const store = useGrafanaStore.getState();
      
      // Set a chart first
      store.setSelectedChart({ id: '1', name: 'Chart 1' });
      expect(useGrafanaStore.getState().selectedChart).toBeTruthy();
      
      // Set to null
      store.setSelectedChart(null);
      expect(useGrafanaStore.getState().selectedChart).toBeNull();
    });

    it('should update selected chart', () => {
      const store = useGrafanaStore.getState();
      
      // Set initial selected chart
      store.setSelectedChart({ id: '1', name: 'Chart 1' });
      
      // Update to different chart
      store.setSelectedChart({ id: '2', name: 'Chart 2' });
      
      const state = useGrafanaStore.getState();
      expect(state.selectedChart?.id).toBe('2');
      expect(state.selectedChart?.name).toBe('Chart 2');
    });
  });

  describe('Reset Action', () => {
    it('should reset store to initial state', () => {
      const store = useGrafanaStore.getState();
      
      // Modify state
      store.setCharts([
        { id: '1', name: 'Chart 1' },
        { id: '2', name: 'Chart 2' },
      ]);
      store.setSelectedChart({ id: '1', name: 'Chart 1' });
      
      // Verify state changed
      expect(useGrafanaStore.getState().charts).toHaveLength(2);
      expect(useGrafanaStore.getState().selectedChart).toBeTruthy();
      
      // Reset
      store.reset();
      
      // Verify reset to initial state
      const resetState = useGrafanaStore.getState();
      expect(resetState.charts).toEqual([]);
      expect(resetState.selectedChart).toBeNull();
    });
  });



  describe('Complex Scenarios', () => {
    it('should handle adding and removing charts', () => {
      const store = useGrafanaStore.getState();
      
      // Add charts
      store.addChart({ id: '1', name: 'Chart 1' });
      store.addChart({ id: '2', name: 'Chart 2' });
      store.addChart({ id: '3', name: 'Chart 3' });
      
      expect(useGrafanaStore.getState().charts).toHaveLength(3);
      
      // Remove one
      store.removeChart('2');
      
      expect(useGrafanaStore.getState().charts).toHaveLength(2);
      
      // Add another
      store.addChart({ id: '4', name: 'Chart 4' });
      
      expect(useGrafanaStore.getState().charts).toHaveLength(3);
    });

    it('should handle chart selection workflow', () => {
      const store = useGrafanaStore.getState();
      
      // Set charts
      const charts = [
        { id: '1', name: 'CPU Usage', panelId: 1 },
        { id: '2', name: 'Memory Usage', panelId: 2 },
        { id: '3', name: 'Disk I/O', panelId: 3 },
      ];
      store.setCharts(charts);
      
      // Select first chart
      store.setSelectedChart(charts[0]);
      expect(useGrafanaStore.getState().selectedChart?.id).toBe('1');
      
      // Select second chart
      store.setSelectedChart(charts[1]);
      expect(useGrafanaStore.getState().selectedChart?.id).toBe('2');
      
      // Deselect
      store.setSelectedChart(null);
      expect(useGrafanaStore.getState().selectedChart).toBeNull();
    });

    it('should handle chart management with selection', () => {
      const store = useGrafanaStore.getState();
      
      // Add charts
      const chart1 = { id: '1', name: 'Chart 1' };
      const chart2 = { id: '2', name: 'Chart 2' };
      
      store.addChart(chart1);
      store.addChart(chart2);
      
      // Select first chart
      store.setSelectedChart(chart1);
      
      // Remove selected chart
      store.removeChart('1');
      
      const state = useGrafanaStore.getState();
      expect(state.charts).toHaveLength(1);
      // Note: selectedChart might still reference the removed chart
      // This is expected behavior - the component should handle this
    });

    it('should handle bulk operations', () => {
      const store = useGrafanaStore.getState();
      
      // Set multiple charts at once
      const charts = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Chart ${i + 1}`,
        panelId: i + 1,
      }));
      
      store.setCharts(charts);
      expect(useGrafanaStore.getState().charts).toHaveLength(10);
      
      // Clear all
      store.setCharts([]);
      expect(useGrafanaStore.getState().charts).toHaveLength(0);
    });
  });
});

