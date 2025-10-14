/**
 * View Wrapper Component
 * Migrated from @cyoda/processing-manager/src/components/ViewWrapper.vue
 */

import { ReactNode } from 'react';

interface ViewWrapperProps {
  children: ReactNode;
}

export default function ViewWrapper({ children }: ViewWrapperProps) {
  return <div className="view-wrapper">{children}</div>;
}

