/**
 * Cytoscape Stylesheet
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/GraphicalStatemachineMap/style.ts
 * Updated: Added theme support for light/dark modes
 */

import type { Stylesheet as CytoscapeStylesheet } from 'cytoscape';

export const getStyleForTheme = (theme: 'light' | 'dark'): CytoscapeStylesheet[] => {
  const labelTextColor = theme === 'light' ? '#111827' : '#ffffff';
  const labelBgColor = theme === 'light' ? '#ffffff' : '#1f2937';
  const labelBgOpacity = theme === 'light' ? 0.9 : 0.95;
  const compoundBgColor = theme === 'light' ? '#e5e7eb' : '#2d3748';
  const compoundHiddenBgColor = theme === 'light' ? '#d1d5db' : '#4b5563';

  return [
    {
      selector: 'node',
      style: {
        'label': 'data(title)',
        'color': labelTextColor,
        'text-background-color': labelBgColor,
        'text-background-opacity': labelBgOpacity,
        'text-background-padding': '4px',
        'text-max-width': 180,
        'text-wrap': 'wrap',
        'width': 45,
        'height': 45,
        'background-color': '#14b8a6', // Neon teal fallback
        'border-width': 2,
        'border-color': '#5eead4', // Lighter teal border
      },
    },
    {
      selector: 'edge',
      style: {
        'label': 'data(title)',
        'color': labelTextColor,
        'text-background-color': labelBgColor,
        'text-background-opacity': labelBgOpacity,
        'line-color': '#a78bfa', // Neon purple
        'z-compound-depth': 'bottom',
        'width': 5,
        'target-arrow-shape': 'triangle',
        'target-arrow-color': '#c084fc', // Lighter purple for arrow
        'arrow-scale': 1.1,
        'curve-style': 'bezier',
        'control-point-step-size': 240,
      },
    },
  {
    selector: '.edge',
    style: {
      'line-color': '#a78bfa', // Neon purple
      'target-arrow-color': '#c084fc', // Lighter purple
    },
  },
  {
    selector: '.hide-titles-edge',
    style: {
      label: '',
    },
  },
  {
    selector: '.node-state',
    style: {
      'background-color': '#14b8a6', // Neon teal
      'border-width': 3,
      'border-color': '#5eead4', // Lighter teal glow
    },
  },
  {
    selector: '.node-state.current-state',
    style: {
      'background-color': '#f59e0b', // Neon amber/orange
      'border-color': '#fbbf24', // Lighter amber glow
      'border-width': '8px',
    },
  },
  {
    selector: '.hidden',
    style: {
      display: 'none',
    },
  },
  {
    selector: '.node-state-none',
    style: {
      'background-color': '#0d9488', // Darker teal
      'border-width': 3,
      'border-color': '#14b8a6', // Neon teal
    },
  },
  {
    selector: '.node-process',
    style: {
      'background-color': '#3b82f6', // Blue
      'border-width': 3,
      'border-color': '#60a5fa', // Lighter blue glow
      'shape': 'heptagon',
    },
  },
  {
    selector: '.edge-process',
    style: {
      'line-color': '#6b7280', // Neutral gray
      'curve-style': 'haystack',
      'width': 2, // Thinner than transitions
    },
  },
  {
    selector: '.compound-processes',
    style: {
      'background-color': compoundBgColor,
      'background-opacity': '0.8',
      'z-compound-depth': 'orphan',
    },
  },
  {
    selector: '.compound-processes-source',
    style: {
      'background-color': '#3b82f6', // Blue
      'width': 10,
      'height': 10,
    },
  },
  {
    selector: '.compound-criteria',
    style: {
      'background-color': compoundBgColor,
      'background-opacity': '0.8',
      'z-compound-depth': 'orphan',
    },
  },
  {
    selector: '.compound-criteria-hidden',
    style: {
      'background-color': compoundHiddenBgColor,
      'background-opacity': 0.4,
      'label': '',
      'padding': 0,
      'width': 40,
      'height': 30,
      'z-compound-depth': 'bottom',
    },
  },
  {
    selector: '.hide-titles',
    style: {
      label: '',
    },
  },
  {
    selector: '.node-criteria',
    style: {
      'background-color': '#ec4899', // Neon pink
      'border-color': '#f9a8d4', // Lighter pink glow
      'border-width': 3,
      'z-compound-depth': 'top',
      'shape': 'diamond',
      'background-image': 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCIgdmlld0JveD0iMCAwIDMxLjM1NyAzMS4zNTciIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMxLjM1NyAzMS4zNTc7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMTUuMjU1LDBjNS40MjQsMCwxMC43NjQsMi40OTgsMTAuNzY0LDguNDczYzAsNS41MS02LjMxNCw3LjYyOS03LjY3LDkuNjJjLTEuMDE4LDEuNDgxLTAuNjc4LDMuNTYyLTMuNDc1LDMuNTYyICAgYy0xLjgyMiwwLTIuNzEyLTEuNDgyLTIuNzEyLTIuODM4YzAtNS4wNDYsNy40MTQtNi4xODgsNy40MTQtMTAuMzQzYzAtMi4yODctMS41MjItMy42NDMtNC4wNjYtMy42NDMgICBjLTUuNDI0LDAtMy4zMDYsNS41OTItNy40MTQsNS41OTJjLTEuNDgzLDAtMi43NTYtMC44OS0yLjc1Ni0yLjU4NEM1LjMzOSwzLjY4MywxMC4wODQsMCwxNS4yNTUsMHogTTE1LjA0NCwyNC40MDYgICBjMS45MDQsMCwzLjQ3NSwxLjU2NiwzLjQ3NSwzLjQ3NmMwLDEuOTEtMS41NjgsMy40NzYtMy40NzUsMy40NzZjLTEuOTA3LDAtMy40NzYtMS41NjQtMy40NzYtMy40NzYgICBDMTEuNTY4LDI1Ljk3MywxMy4xMzcsMjQuNDA2LDE1LjA0NCwyNC40MDZ6IiBmaWxsPSIjZmZmZmZmIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==',
      'background-width': '40%',
      'background-height': '40%',
      'background-image-opacity': 0.9,
    },
  },
  {
    selector: '.edge-manual',
    style: {
      'line-style': 'dashed',
      'width': 7,
    },
  },
  ];
};

// Export default style for backward compatibility
export const style = getStyleForTheme('dark');

