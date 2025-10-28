/**
 * Cytoscape Stylesheet
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/GraphicalStatemachineMap/style.ts
 */

import type { Stylesheet } from 'cytoscape';

export const style: Stylesheet[] = [
  {
    selector: 'node',
    style: {
      'label': 'data(title)',
      'color': '#ffffff', // White text for dark theme
      'text-background-color': '#374151', // Dark gray background for labels
      'text-background-opacity': 0.9,
      'text-background-padding': '4px',
      'text-max-width': 180,
      'text-wrap': 'wrap',
      'width': 60,
      'height': 60,
      'background-color': '#10b981', // Bright green fallback - very visible
      'border-width': 2,
      'border-color': '#ffffff',
    },
  },
  {
    selector: 'edge',
    style: {
      'label': 'data(title)',
      'color': '#ffffff', // White text for dark theme
      'text-background-color': '#374151', // Dark gray background for labels
      'text-background-opacity': 0.9,
      'line-color': '#F7AD11',
      'z-compound-depth': 'bottom',
      'width': 5,
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#912624',
      'arrow-scale': 1.1,
      'curve-style': 'bezier',
      'control-point-step-size': 240,
    },
  },
  {
    selector: '.edge',
    style: {
      'line-color': '#F7AD11',
      'target-arrow-color': '#912624',
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
      'background-color': '#10b981', // Bright emerald green
      'border-width': 3,
      'border-color': '#059669',
    },
  },
  {
    selector: '.node-state.current-state',
    style: {
      'background-color': '#F7AD11',
      'border-color': '#148751',
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
      'background-color': '#059669', // Darker emerald green
      'border-width': 3,
      'border-color': '#10b981',
    },
  },
  {
    selector: '.node-process',
    style: {
      'background-color': '#3b82f6', // Bright blue
      'border-width': 3,
      'border-color': '#2563eb',
      'shape': 'heptagon',
    },
  },
  {
    selector: '.edge-process',
    style: {
      'line-color': '#213063',
      'curve-style': 'haystack',
    },
  },
  {
    selector: '.compound-processes',
    style: {
      'background-color': '#2d3748',
      'background-opacity': '0.8',
      'z-compound-depth': 'orphan',
    },
  },
  {
    selector: '.compound-processes-source',
    style: {
      'background-color': '#213063',
      'width': 10,
      'height': 10,
    },
  },
  {
    selector: '.compound-criteria',
    style: {
      'background-color': '#2d3748',
      'background-opacity': '0.8',
      'z-compound-depth': 'orphan',
    },
  },
  {
    selector: '.compound-criteria-hidden',
    style: {
      'background-color': '#4b5563',
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
      'background-color': '#9ca3af',
      'z-compound-depth': 'top',
      'shape': 'diamond',
      'background-image': 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCIgdmlld0JveD0iMCAwIDMxLjM1NyAzMS4zNTciIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMxLjM1NyAzMS4zNTc7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMTUuMjU1LDBjNS40MjQsMCwxMC43NjQsMi40OTgsMTAuNzY0LDguNDczYzAsNS41MS02LjMxNCw3LjYyOS03LjY3LDkuNjJjLTEuMDE4LDEuNDgxLTAuNjc4LDMuNTYyLTMuNDc1LDMuNTYyICAgYy0xLjgyMiwwLTIuNzEyLTEuNDgyLTIuNzEyLTIuODM4YzAtNS4wNDYsNy40MTQtNi4xODgsNy40MTQtMTAuMzQzYzAtMi4yODctMS41MjItMy42NDMtNC4wNjYtMy42NDMgICBjLTUuNDI0LDAtMy4zMDYsNS41OTItNy40MTQsNS41OTJjLTEuNDgzLDAtMi43NTYtMC44OS0yLjc1Ni0yLjU4NEM1LjMzOSwzLjY4MywxMC4wODQsMCwxNS4yNTUsMHogTTE1LjA0NCwyNC40MDYgICBjMS45MDQsMCwzLjQ3NSwxLjU2NiwzLjQ3NSwzLjQ3NmMwLDEuOTEtMS41NjgsMy40NzYtMy40NzUsMy40NzZjLTEuOTA3LDAtMy40NzYtMS41NjQtMy40NzYtMy40NzYgICBDMTEuNTY4LDI1Ljk3MywxMy4xMzcsMjQuNDA2LDE1LjA0NCwyNC40MDZ6IiBmaWxsPSIjMjEzMDYzIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==',
      'background-width': '40%',
      'background-height': '40%',
      'background-image-opacity': 0.7,
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

