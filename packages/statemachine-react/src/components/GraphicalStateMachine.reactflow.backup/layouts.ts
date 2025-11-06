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
  padding: 10,
});

