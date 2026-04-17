/**
 * Hook: when `isDirty`, blocks in-app navigation (RR useBlocker — covers the
 * browser back button via popstate) with an AntD Modal.confirm, and registers
 * a beforeunload listener for tab close / refresh.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-workflow-editor-design.md §3.7
 */
import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { App } from 'antd';

export function useDirtyGuard(isDirty: boolean): void {
  const { modal } = App.useApp();

  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    modal.confirm({
      title: 'Discard unsaved changes?',
      okText: 'Discard',
      cancelText: 'Stay',
      onOk: () => blocker.proceed?.(),
      onCancel: () => blocker.reset?.(),
    });
  }, [blocker, modal]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}
