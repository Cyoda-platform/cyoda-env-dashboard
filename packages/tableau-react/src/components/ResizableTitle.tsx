/**
 * ResizableTitle Component
 * Provides resizable column headers for Ant Design Table
 * Based on Ant Design's resizable columns example
 */

import React from 'react';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';

interface ResizableTitleProps extends React.HTMLAttributes<any> {
  onResize?: (e: React.SyntheticEvent, data: ResizeCallbackData) => void;
  width?: number;
}

export const ResizableTitle = (props: any) => {
  const { onResize, width, ...restProps } = props;

  // If no width or onResize, return plain th
  if (!width || !onResize) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={typeof width === 'number' ? width : parseInt(String(width))}
      height={0}
      handle={
        <span
          className="react-resizable-handle react-resizable-handle-se"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

