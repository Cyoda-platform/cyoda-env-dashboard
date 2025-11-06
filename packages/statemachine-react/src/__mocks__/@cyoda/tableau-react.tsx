/**
 * Mock for @cyoda/tableau-react package
 * Used for development when tableau-react is not available
 */

import React from 'react';

// Mock ModellingPopUp component
export interface ModellingPopUpRef {
  open: () => void;
  close: () => void;
}

export interface ModellingPopUpProps {
  entityClassName?: string;
  onSelect?: (columns: any[]) => void;
  children?: React.ReactNode;
}

export const ModellingPopUp = React.forwardRef<ModellingPopUpRef, ModellingPopUpProps>(
  ({ entityClassName, onSelect, children }, ref) => {
    // Mock implementation
    React.useImperativeHandle(ref, () => ({
      open: () => {
        console.log('ModellingPopUp.open() called');
      },
      close: () => {
        console.log('ModellingPopUp.close() called');
      },
    }));

    return <div data-testid="modelling-popup">{children}</div>;
  }
);

ModellingPopUp.displayName = 'ModellingPopUp';

