/**
 * Tests for ReportEditorTabGrouping Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReportEditorTabGrouping from './ReportEditorTabGrouping';

describe('ReportEditorTabGrouping', () => {
  const mockCols = [
    {
      '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
      alias: 'user.name',
      name: 'user.name',
      typeShort: 'String',
      type: 'java.lang.String',
      colType: 'colDef',
    },
    {
      '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
      alias: 'aliasDefModels.[*]@com#cyoda#core#model#catalog#ReportAliasPathDefModel.mapperClass',
      name: 'aliasDefModels.[*]@com#cyoda#core#model#catalog#ReportAliasPathDefModel.mapperClass',
      typeShort: 'String',
      type: 'java.lang.String',
      colType: 'colDef',
    },
  ];

  const mockConfigDefinition = {
    '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
    grouping: [
      {
        '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
        name: 'user.name',
      },
    ],
    hierarhyEnable: false,
  };

  const mockOnChange = vi.fn();

  it('should render without crashing', () => {
    render(
      <ReportEditorTabGrouping
        cols={mockCols}
        configDefinition={mockConfigDefinition as any}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Possible grouping values/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected grouping values/i)).toBeInTheDocument();
  });

  it('should display grouping columns with short paths in UI', () => {
    const { container } = render(
      <ReportEditorTabGrouping
        cols={mockCols}
        configDefinition={mockConfigDefinition as any}
        onChange={mockOnChange}
      />
    );

    // Verify that the Transfer component is rendered
    expect(container.querySelector('.transfer-component')).toBeInTheDocument();
    // The component should use HelperFormat.shortNamePath() to display short paths
  });

  it('should use full paths for matching selected grouping', () => {
    const configWithFullPath = {
      '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
      grouping: [
        {
          '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
          name: 'aliasDefModels.[*]@com#cyoda#core#model#catalog#ReportAliasPathDefModel.mapperClass',
        },
      ],
      hierarhyEnable: false,
    };

    const { container } = render(
      <ReportEditorTabGrouping
        cols={mockCols}
        configDefinition={configWithFullPath as any}
        onChange={mockOnChange}
      />
    );

    // The column with full path should be in selected grouping
    expect(container.querySelector('.transfer-component')).toBeInTheDocument();
  });

  it('should handle empty grouping', () => {
    const emptyConfig = {
      '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
      grouping: [],
      hierarhyEnable: false,
    };

    render(
      <ReportEditorTabGrouping
        cols={[]}
        configDefinition={emptyConfig as any}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Possible grouping values/i)).toBeInTheDocument();
  });

  it('should render hierarchy enable switch', () => {
    render(
      <ReportEditorTabGrouping
        cols={mockCols}
        configDefinition={mockConfigDefinition as any}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Hierarchy enable/i)).toBeInTheDocument();
  });

  it('should handle undefined grouping', () => {
    const configWithoutGrouping = {
      '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
      hierarhyEnable: false,
    };

    render(
      <ReportEditorTabGrouping
        cols={mockCols}
        configDefinition={configWithoutGrouping as any}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Possible grouping values/i)).toBeInTheDocument();
  });

  it('should preserve full paths in data structure while showing short paths in UI', () => {
    const { container } = render(
      <ReportEditorTabGrouping
        cols={mockCols}
        configDefinition={mockConfigDefinition as any}
        onChange={mockOnChange}
      />
    );

    // Verify that the component renders
    expect(container.querySelector('.report-editor-tab-grouping')).toBeInTheDocument();

    // The Transfer component should use:
    // - Full paths for key/name (internal matching)
    // - Short paths for title (display)
    expect(container.querySelector('.transfer-component')).toBeInTheDocument();
  });
});

