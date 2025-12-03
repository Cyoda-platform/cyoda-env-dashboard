/**
 * Cytoscape Layout Configurations
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/GraphicalStatemachineMap/layouts.ts
 */

export const childrenLayout = {
  name: 'grid',
  nodeDimensionsIncludeLabels: true,
  padding: 10,
};

export const coreLayout = (name = 'breadthfirst') => ({
  name,
  directed: true,
  nodeDimensionsIncludeLabels: true,
  padding: 150, // Increased padding for more spacing between nodes
  spacingFactor: 2.5, // Add extra spacing between nodes (for layouts that support it)
  avoidOverlap: true, // Prevent nodes from overlapping
  avoidOverlapPadding: 100, // Minimum distance between nodes
});

