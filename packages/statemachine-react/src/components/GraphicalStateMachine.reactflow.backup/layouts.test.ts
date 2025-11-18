import { describe, it, expect } from 'vitest';
import { childrenLayout, coreLayout } from './layouts';

describe('GraphicalStateMachine.reactflow.backup Layouts', () => {
  describe('childrenLayout', () => {
    it('should have grid layout name', () => {
      expect(childrenLayout.name).toBe('grid');
    });

    it('should include node labels in dimensions', () => {
      expect(childrenLayout.nodeDimensionsIncludeLabels).toBe(true);
    });

    it('should have padding of 10', () => {
      expect(childrenLayout.padding).toBe(10);
    });

    it('should have all required properties', () => {
      expect(childrenLayout).toHaveProperty('name');
      expect(childrenLayout).toHaveProperty('nodeDimensionsIncludeLabels');
      expect(childrenLayout).toHaveProperty('padding');
    });

    it('should be a valid Cytoscape layout configuration', () => {
      expect(typeof childrenLayout).toBe('object');
      expect(childrenLayout).not.toBeNull();
    });
  });

  describe('coreLayout', () => {
    describe('Default Configuration', () => {
      it('should use breadthfirst layout by default', () => {
        const layout = coreLayout();
        expect(layout.name).toBe('breadthfirst');
      });

      it('should be directed', () => {
        const layout = coreLayout();
        expect(layout.directed).toBe(true);
      });

      it('should include node labels in dimensions', () => {
        const layout = coreLayout();
        expect(layout.nodeDimensionsIncludeLabels).toBe(true);
      });

      it('should have padding of 10', () => {
        const layout = coreLayout();
        expect(layout.padding).toBe(10);
      });

      it('should have all required properties', () => {
        const layout = coreLayout();
        expect(layout).toHaveProperty('name');
        expect(layout).toHaveProperty('directed');
        expect(layout).toHaveProperty('nodeDimensionsIncludeLabels');
        expect(layout).toHaveProperty('padding');
      });

      it('should not have spacingFactor property', () => {
        const layout = coreLayout();
        expect(layout).not.toHaveProperty('spacingFactor');
      });

      it('should not have avoidOverlap property', () => {
        const layout = coreLayout();
        expect(layout).not.toHaveProperty('avoidOverlap');
      });
    });

    describe('Custom Layout Names', () => {
      it('should accept breadthfirst layout name', () => {
        const layout = coreLayout('breadthfirst');
        expect(layout.name).toBe('breadthfirst');
      });

      it('should accept dagre layout name', () => {
        const layout = coreLayout('dagre');
        expect(layout.name).toBe('dagre');
      });

      it('should accept cose layout name', () => {
        const layout = coreLayout('cose');
        expect(layout.name).toBe('cose');
      });

      it('should accept circle layout name', () => {
        const layout = coreLayout('circle');
        expect(layout.name).toBe('circle');
      });

      it('should accept grid layout name', () => {
        const layout = coreLayout('grid');
        expect(layout.name).toBe('grid');
      });

      it('should accept concentric layout name', () => {
        const layout = coreLayout('concentric');
        expect(layout.name).toBe('concentric');
      });

      it('should accept custom layout name', () => {
        const layout = coreLayout('custom-layout');
        expect(layout.name).toBe('custom-layout');
      });
    });

    describe('Configuration Consistency', () => {
      it('should maintain same configuration regardless of layout name', () => {
        const layout1 = coreLayout('breadthfirst');
        const layout2 = coreLayout('dagre');

        expect(layout1.directed).toBe(layout2.directed);
        expect(layout1.nodeDimensionsIncludeLabels).toBe(layout2.nodeDimensionsIncludeLabels);
        expect(layout1.padding).toBe(layout2.padding);
      });

      it('should return new object on each call', () => {
        const layout1 = coreLayout();
        const layout2 = coreLayout();

        expect(layout1).not.toBe(layout2);
        expect(layout1).toEqual(layout2);
      });

      it('should return new object for different layout names', () => {
        const layout1 = coreLayout('breadthfirst');
        const layout2 = coreLayout('dagre');

        expect(layout1).not.toBe(layout2);
        expect(layout1.name).not.toBe(layout2.name);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string as layout name', () => {
        const layout = coreLayout('');
        expect(layout.name).toBe('');
        expect(layout.directed).toBe(true);
      });

      it('should handle undefined as layout name (uses default)', () => {
        const layout = coreLayout(undefined);
        expect(layout.name).toBe('breadthfirst');
      });

      it('should be a valid Cytoscape layout configuration', () => {
        const layout = coreLayout();
        expect(typeof layout).toBe('object');
        expect(layout).not.toBeNull();
      });
    });

    describe('Real-world Scenarios', () => {
      it('should create layout for state machine graph', () => {
        const layout = coreLayout('breadthfirst');
        
        expect(layout.name).toBe('breadthfirst');
        expect(layout.directed).toBe(true);
      });

      it('should create layout with compact spacing', () => {
        const layout = coreLayout();
        
        // This backup version has smaller padding for compact layouts
        expect(layout.padding).toBe(10);
      });

      it('should support hierarchical layouts', () => {
        const layout = coreLayout('dagre');
        
        expect(layout.name).toBe('dagre');
        expect(layout.directed).toBe(true);
      });

      it('should support force-directed layouts', () => {
        const layout = coreLayout('cose');
        
        expect(layout.name).toBe('cose');
      });
    });
  });

  describe('Layout Comparison', () => {
    it('should have same padding values', () => {
      const coreLayoutConfig = coreLayout();
      
      expect(coreLayoutConfig.padding).toBe(10);
      expect(childrenLayout.padding).toBe(10);
      expect(coreLayoutConfig.padding).toBe(childrenLayout.padding);
    });

    it('should both include node labels in dimensions', () => {
      const coreLayoutConfig = coreLayout();
      
      expect(coreLayoutConfig.nodeDimensionsIncludeLabels).toBe(true);
      expect(childrenLayout.nodeDimensionsIncludeLabels).toBe(true);
    });

    it('should have different layout names', () => {
      const coreLayoutConfig = coreLayout();
      
      expect(coreLayoutConfig.name).toBe('breadthfirst');
      expect(childrenLayout.name).toBe('grid');
      expect(coreLayoutConfig.name).not.toBe(childrenLayout.name);
    });

    it('should have different properties', () => {
      const coreLayoutConfig = coreLayout();
      
      // Core layout has directed property
      expect(coreLayoutConfig).toHaveProperty('directed');
      
      // Children layout doesn't have directed property
      expect(childrenLayout).not.toHaveProperty('directed');
    });

    it('should have minimal configuration compared to main version', () => {
      const layout = coreLayout();
      
      // This backup version doesn't have spacingFactor and avoidOverlap
      expect(layout).not.toHaveProperty('spacingFactor');
      expect(layout).not.toHaveProperty('avoidOverlap');
      
      // But has the core properties
      expect(layout).toHaveProperty('name');
      expect(layout).toHaveProperty('directed');
      expect(layout).toHaveProperty('nodeDimensionsIncludeLabels');
      expect(layout).toHaveProperty('padding');
    });
  });

  describe('Backup Version Characteristics', () => {
    it('should use compact padding for both layouts', () => {
      const coreLayoutConfig = coreLayout();
      
      expect(coreLayoutConfig.padding).toBe(10);
      expect(childrenLayout.padding).toBe(10);
    });

    it('should have simpler configuration than main version', () => {
      const layout = coreLayout();
      
      const propertyCount = Object.keys(layout).length;
      
      // Should have exactly 4 properties: name, directed, nodeDimensionsIncludeLabels, padding
      expect(propertyCount).toBe(4);
    });

    it('should be suitable for compact graph rendering', () => {
      const layout = coreLayout();
      
      // Compact padding suggests this is for smaller, more compact graphs
      expect(layout.padding).toBeLessThanOrEqual(10);
    });
  });
});

