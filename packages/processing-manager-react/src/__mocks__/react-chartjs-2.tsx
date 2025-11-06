/**
 * Mock for react-chartjs-2
 */

import React from 'react';

// Custom JSON serializer that handles functions
const serializeOptions = (options: any): string => {
  return JSON.stringify(options, (key, value) => {
    if (typeof value === 'function') {
      return '__FUNCTION__';
    }
    return value;
  });
};

export const Bar = ({ data, options }: any) => (
  <div data-testid="bar-chart">
    <div data-testid="chart-data">{JSON.stringify(data)}</div>
    <div data-testid="chart-options">{serializeOptions(options)}</div>
  </div>
);

export const Line = ({ data, options }: any) => (
  <div data-testid="line-chart">
    <div data-testid="chart-data">{JSON.stringify(data)}</div>
    <div data-testid="chart-options">{serializeOptions(options)}</div>
  </div>
);

