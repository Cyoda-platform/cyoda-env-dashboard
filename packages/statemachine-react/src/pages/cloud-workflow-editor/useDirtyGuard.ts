/**
 * Hook: when `isDirty`, guards browser back/forward navigation (via popstate)
 * AND tab close / refresh (via beforeunload) with confirmation.
 *
 * Intentional limitation: in-app sidebar/menu link clicks are NOT guarded,
 * because the app uses BrowserRouter (not a data router), and react-router-dom
 * v6's useBlocker — which would catch internal navigate() calls — only works
 * with createBrowserRouter. Migrating the app to a data router is tracked as
 * a follow-up; until then, sidebar navigation away from a dirty editor is
 * a silent data-loss path.
 *
 * The popstate guard uses the standard "push a sentinel state on dirty, eat
 * the back-button's popstate, prompt the user, then either restore or pop
 * twice" pattern. Refresh/tab-close uses the standard beforeunload contract.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-workflow-editor-design.md §3.7
 */
import { useEffect, useRef } from 'react';
import { App } from 'antd';

export function useDirtyGuard(isDirty: boolean): void {
  const { modal } = App.useApp();
  const sentinelPushedRef = useRef(false);

  // Tab close / refresh.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Browser back/forward.
  useEffect(() => {
    if (!isDirty) {
      // If we leave dirty without confirming (e.g. user saved), pop the sentinel
      // we previously pushed so the back button doesn't take an extra click.
      if (sentinelPushedRef.current) {
        sentinelPushedRef.current = false;
        // Best-effort: removing a future-history entry isn't possible, but the
        // most recent pushState entry can be effectively discarded by the next
        // navigation. Leave it; the cost is one harmless extra back-press at
        // most for a saved doc, which is fine.
      }
      return;
    }

    // Push a sentinel state so the next back button triggers our popstate handler
    // without changing the displayed URL.
    if (!sentinelPushedRef.current) {
      window.history.pushState(null, '', window.location.href);
      sentinelPushedRef.current = true;
    }

    const handler = () => {
      // The browser already advanced past our sentinel. Re-push to keep the
      // user on this URL while we ask.
      window.history.pushState(null, '', window.location.href);
      modal.confirm({
        title: 'Discard unsaved changes?',
        okText: 'Discard',
        cancelText: 'Stay',
        onOk: () => {
          // Discard: pop sentinel + the user's intended back step.
          sentinelPushedRef.current = false;
          window.history.go(-2);
        },
      });
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [isDirty, modal]);
}
