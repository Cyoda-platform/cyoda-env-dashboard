import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Input, Tree } from 'antd';
import type { TreeDataNode } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { WorkflowEditorStoreContext, useWorkflowEditorStore } from './storeContext';
import { nodeHasError } from './nodeHasError';

function buildTreeData(doc: any): TreeDataNode[] {
  if (!doc) return [];
  return [
    {
      key: '/',
      title: 'Workflow',
      children: Object.entries(doc.states ?? {}).map(([name, state]: any) => ({
        key: `/states/${name}`,
        title: name,
        children: (state.transitions ?? []).map((t: any, i: number) => ({
          key: `/states/${name}/transitions/${i}`,
          title: t.name || '(unnamed)',
        })),
      })),
    },
  ];
}

function decorate(
  nodes: TreeDataNode[],
  errors: any[],
  renaming: string | null,
  setRenaming: (k: string | null) => void,
  store: any,
): TreeDataNode[] {
  return nodes.map((n) => {
    const path = String(n.key);
    const hasErr = nodeHasError(path, errors as any);
    const isStateNode = /^\/states\/[^/]+$/.test(path);
    const stateName = isStateNode ? path.replace('/states/', '') : null;
    const titleEl = (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {hasErr && (
          <span data-testid="node-error-dot">
            <Badge status="error" />
          </span>
        )}
        {isStateNode && renaming === path ? (
          <Input
            size="small"
            defaultValue={stateName!}
            autoFocus
            onPressEnter={(e) => {
              const v = (e.target as HTMLInputElement).value.trim();
              if (v && v !== stateName) store.getState().renameState(stateName!, v);
              setRenaming(null);
            }}
            onBlur={() => setRenaming(null)}
          />
        ) : (
          <span
            onDoubleClick={() => isStateNode && setRenaming(path)}
            title={isStateNode ? 'Double-click to rename' : ''}
          >
            {n.title as React.ReactNode}
          </span>
        )}
      </span>
    );
    return {
      ...n,
      title: titleEl,
      children: n.children ? decorate(n.children, errors, renaming, setRenaming, store) : undefined,
    };
  });
}

export const WorkflowTree: React.FC = () => {
  const store = useContext(WorkflowEditorStoreContext)!;
  const doc = useWorkflowEditorStore((s) => s.current);
  const errors = useWorkflowEditorStore((s) => s.errors);
  const selected = useWorkflowEditorStore((s) => s.selectedPath);
  const expandedList = useWorkflowEditorStore(useShallow((s) => Array.from(s.expandedPaths)));
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(400);
  const [renaming, setRenaming] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setHeight(Math.max(entry.contentRect.height - 8, 200)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(
    () => decorate(buildTreeData(doc), errors as any, renaming, setRenaming, store),
    [doc, errors, renaming, store],
  );

  return (
    <div ref={ref} style={{ height: '100%', overflow: 'hidden' }}>
      <Tree
        height={height}
        treeData={data}
        selectedKeys={[selected]}
        expandedKeys={expandedList}
        onSelect={(keys) => keys[0] && store.getState().setSelected(String(keys[0]))}
        onExpand={(_keys, info) => store.getState().toggleExpand(String(info.node.key))}
      />
    </div>
  );
};
