/**
 * WorkflowsCloudStub — minimal manual-smoke page for the WorkflowGateway.
 *
 * Replaced by the real cloud Workflows page in sub-branch 3
 * (entity-model picker + workflows table + row actions + URL state persistence).
 * This stub exists only to exercise gateway calls end-to-end during sub-branch 2.
 */

import React, { useState } from 'react';
import { useWorkflowsList } from '../hooks/useStatemachine';
import type { ModelRef } from '../gateways';

export const WorkflowsCloudStub: React.FC = () => {
  const [entityName, setEntityName] = useState('');
  const [modelVersion, setModelVersion] = useState('1');
  const [activeRef, setActiveRef] = useState<ModelRef | null>(null);

  const { data: workflows, isLoading, error } = useWorkflowsList(activeRef);

  return (
    <div style={{ padding: 24 }}>
      <h2>Cloud workflows (stub)</h2>
      <p>
        Manual-smoke page for the workflow gateway. The real cloud Workflows
        page (with model picker + URL state + row actions) lands in sub-branch 3.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <label>
          Entity name
          <input
            aria-label="entity name"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            style={{ marginLeft: 4 }}
          />
        </label>
        <label>
          Model version
          <input
            aria-label="model version"
            value={modelVersion}
            onChange={(e) => setModelVersion(e.target.value)}
            style={{ marginLeft: 4, width: 60 }}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            const v = parseInt(modelVersion, 10);
            if (!entityName || Number.isNaN(v)) return;
            setActiveRef({ entityName, modelVersion: v });
          }}
        >
          Load
        </button>
      </div>

      {isLoading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>Error: {(error as Error).message}</p>}
      {workflows && (
        <ul>
          {workflows.map((w) => (
            <li key={w.name}>
              <strong>{w.name}</strong>
              {w.desc ? ` — ${w.desc}` : ''} (active: {String(w.active)})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
