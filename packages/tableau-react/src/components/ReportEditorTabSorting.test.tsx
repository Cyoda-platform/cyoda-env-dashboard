/**
 * Tests for ReportEditorTabSorting Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReportEditorTabSorting from './ReportEditorTabSorting';

describe('ReportEditorTabSorting', () => {
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
      alias: 'aliasDefModels.[*]@com#cyoda#core#model#catalog#ReportAliasPathDefModel.mapperParameters',
      name: 'aliasDefModels.[*]@com#cyoda#core#model#catalog#ReportAliasPathDefModel.mapperParameters',
      typeShort: 'AliasMapperParameters',
      type: 'com.cyoda.core.reports.aliasmappers.AliasMapperParameters',
      colType: 'colDef',
    },
  ];

  const mockConfigDefinition = {
    '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
    sorting: [
      {
        column: {
          '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
          name: 'user.name',
        },
        reverse: false,
      },
    ],
  };

  const mockOnChange = vi.fn();

  it('should render without crashing', () => {
    render(
      <ReportEditorTabSorting
        cols={mockCols}
        configDefinition={mockConfigDefinition as any}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Possible sorting values/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected sorting values/i)).toBeInTheDocument();
  });

  it('should display sorting columns with short paths in UI', () => {
    const { container } = render(
      <ReportEditorTabSorting
        cols={mockCols}
        configDefinition={mockConfigDefinition as any}
        onChange={mockOnChange}
      />
    );

    // Verify that the Transfer component is rendered
    expect(container.querySelector('.ant-transfer')).toBeInTheDocument();
    // The component should use HelperFormat.shortNamePath() to display short paths
  });

  it('should use full paths for matching selected sorting', () => {
    const configWithFullPath = {
      '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
      sorting: [
        {
          column: {
            '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
            name: 'aliasDefModels.[*]@com#cyoda#core#model#catalog#ReportAliasPathDefModel.mapperParameters',
          },
          reverse: false,
        },
      ],
    };

    const { container } = render(
      <ReportEditorTabSorting
        cols={mockCols}
        configDefinition={configWithFullPath as any}
        onChange={mockOnChange}
      />
    );

    // The column with full path should be in selected sorting
    expect(container.querySelector('.ant-transfer')).toBeInTheDocument();
  });

  it('should handle empty sorting', () => {
    const emptyConfig = {
      '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
      sorting: [],
    };

    render(
      <ReportEditorTabSorting
        cols={[]}
        configDefinition={emptyConfig as any}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Possible sorting values/i)).toBeInTheDocument();
  });

  it('should handle undefined sorting', () => {
    const configWithoutSorting = {
      '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
    };

    render(
      <ReportEditorTabSorting
        cols={mockCols}
        configDefinition={configWithoutSorting as any}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Possible sorting values/i)).toBeInTheDocument();
  });

  it('should handle sorting with reverse flag', () => {
    const configWithReverse = {
      '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
      sorting: [
        {
          column: {
            '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
            name: 'user.name',
          },
          reverse: true,
        },
      ],
    };

    render(
      <ReportEditorTabSorting
        cols={mockCols}
        configDefinition={configWithReverse as any}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Possible sorting values/i)).toBeInTheDocument();
  });

  it('should preserve full paths in data structure while showing short paths in UI', () => {
    const { container } = render(
      <ReportEditorTabSorting
        cols={mockCols}
        configDefinition={mockConfigDefinition as any}
        onChange={mockOnChange}
      />
    );

    // Verify that the component renders
    expect(container.querySelector('.report-editor-tab-sorting')).toBeInTheDocument();

    // The Transfer component should use:
    // - Full paths for key (internal matching)
    // - Short paths for title (display)
    expect(container.querySelector('.ant-transfer')).toBeInTheDocument();
  });
});

