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

  // Debug logging - enabled for debugging
  console.log('ResizableTitle render - ALL PROPS:', props);

  // Try to get width from various sources
  let columnWidth = width;

  // Check if width is in style
  if (!columnWidth && restProps.style?.width) {
    const styleWidth = restProps.style.width;
    // Parse width if it's a string like "150px"
    columnWidth = typeof styleWidth === 'string'
      ? parseInt(styleWidth)
      : styleWidth;
  }

  // Check children array for column data
  if (!columnWidth && Array.isArray(restProps.children)) {
    const columnData = restProps.children.find((child: any) => child?.props?.column);
    if (columnData?.props?.column?.width) {
      columnWidth = columnData.props.column.width;
    }
  }

  console.log('ResizableTitle computed:', {
    width,
    columnWidth,
    hasOnResize: !!onResize,
    styleWidth: restProps.style?.width,
  });

  if (!columnWidth) {
    console.log('ResizableTitle: returning plain th (no width found)');
    return <th {...restProps} />;
  }

  if (!onResize) {
    console.log('ResizableTitle: returning plain th (no onResize)');
    return <th {...restProps} style={{ ...restProps.style, width: columnWidth }} />;
  }

  console.log('ResizableTitle: rendering Resizable with width:', columnWidth);

  return (
    <Resizable
      width={typeof columnWidth === 'number' ? columnWidth : parseInt(String(columnWidth))}
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
      <th {...restProps} style={{ ...restProps.style, width: columnWidth }} />
    </Resizable>
  );
};

