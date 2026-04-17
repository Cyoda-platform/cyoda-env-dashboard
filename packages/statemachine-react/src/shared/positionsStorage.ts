/**
 * localStorage helpers for caching graph node positions per workflow.
 * Spec: docs/superpowers/specs/2026-04-17-cloud-workflow-editor-layout-pivot.md §3.5
 */
import type { ModelRef } from '../gateways';
import type { PositionsMap } from '../types';

export function positionsKey(modelRef: ModelRef, workflowName: string): string {
  return `cyoda.cloud-workflow-editor.positions:${modelRef.entityName}/${modelRef.modelVersion}/${workflowName}`;
}

export function loadPositions(modelRef: ModelRef, workflowName: string): PositionsMap | null {
  try {
    const raw = window.localStorage.getItem(positionsKey(modelRef, workflowName));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as PositionsMap)
      : null;
  } catch {
    return null;
  }
}

export function savePositions(modelRef: ModelRef, workflowName: string, positions: PositionsMap): void {
  try {
    window.localStorage.setItem(positionsKey(modelRef, workflowName), JSON.stringify(positions));
  } catch {
    // Best-effort. Swallow quota / unavailability errors.
  }
}
