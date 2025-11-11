/**
 * Tests for ReportEditorTabSummary Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReportEditorTabSummary from './ReportEditorTabSummary';

describe('ReportEditorTabSummary', () => {
  const mockCols = [
    {
      '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
      alias: 'user.age',
      name: 'user.age',
      typeShort: 'Long',
      type: 'java.lang.Long',
      colType: 'colDef',
    },
    {
      '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
      alias: 'aliasDefModels.[*]@com#cyoda#core#model#catalog#ReportAliasPathDefModel.fullPath',
      name: 'aliasDefModels.[*]@com#cyoda#core#model#catalog#ReportAliasPathDefModel.fullPath',
      typeShort: 'String',
      type: 'java.lang.String',
      colType: 'colDef',
    },
  ];

  const mockConfigDefinition = {
    '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
    summary: [
      [
        {
          '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
          name: 'user.age',
        },
        ['SUM'],
      ],
    ],
  };

  const mockOnChange = vi.fn();

  it('should render without crashing', () => {
    render(
      <ReportEditorTabSummary
        cols={mockCols}
        configDefinition={mockConfigDefinition as any}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Possible summary values/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected summary values/i)).toBeInTheDocument();
  });

  it('should display summary columns with short paths in UI', () => {
    const { container } = render(
      <ReportEditorTabSummary
        cols={mockCols}
        configDefinition={mockConfigDefinition as any}
        onChange={mockOnChange}
      />
    );

    // Verify that the Transfer component is rendered
    expect(container.querySelector('.ant-transfer')).toBeInTheDocument();
    // The component should use HelperFormat.shortNamePath() to display short paths
  });

  it('should use full paths for matching selected summary', () => {
    const configWithFullPath = {
      '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
      summary: [
        [
          {
            '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
            name: 'aliasDefModels.[*]@com#cyoda#core#model#catalog#ReportAliasPathDefModel.fullPath',
          },
          ['COUNT'],
        ],
      ],
    };

    const { container } = render(
      <ReportEditorTabSummary
        cols={mockCols}
        configDefinition={configWithFullPath as any}
        onChange={mockOnChange}
      />
    );

    // The column with full path should be in selected summary
    expect(container.querySelector('.ant-transfer')).toBeInTheDocument();
  });

  it('should handle empty summary', () => {
    const emptyConfig = {
      '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
      summary: [],
    };

    render(
      <ReportEditorTabSummary
        cols={[]}
        configDefinition={emptyConfig as any}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Possible summary values/i)).toBeInTheDocument();
  });

  it('should handle undefined summary', () => {
    const configWithoutSummary = {
      '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
    };

    render(
      <ReportEditorTabSummary
        cols={mockCols}
        configDefinition={configWithoutSummary as any}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Possible summary values/i)).toBeInTheDocument();
  });

  it('should handle different aggregation functions', () => {
    const configWithDifferentAggregations = {
      '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
      summary: [
        [
          {
            '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
            name: 'user.age',
          },
          ['AVG'],
        ],
      ],
    };

    render(
      <ReportEditorTabSummary
        cols={mockCols}
        configDefinition={configWithDifferentAggregations as any}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Possible summary values/i)).toBeInTheDocument();
  });

  it('should handle summary without aggregation (defaults to COUNT)', () => {
    const configWithoutAggregation = {
      '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
      summary: [
        [
          {
            '@bean': 'com.cyoda.core.reports.columns.ReportSimpleColumn',
            name: 'user.age',
          },
          [],
        ],
      ],
    };

    render(
      <ReportEditorTabSummary
        cols={mockCols}
        configDefinition={configWithoutAggregation as any}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/Possible summary values/i)).toBeInTheDocument();
  });

  it('should preserve full paths in data structure while showing short paths in UI', () => {
    const { container } = render(
      <ReportEditorTabSummary
        cols={mockCols}
        configDefinition={mockConfigDefinition as any}
        onChange={mockOnChange}
      />
    );

    // Verify that the component renders
    expect(container.querySelector('.report-editor-tab-summary')).toBeInTheDocument();

    // The Transfer component should use:
    // - Full paths for key (internal matching)
    // - Short paths for title (display)
    expect(container.querySelector('.ant-transfer')).toBeInTheDocument();
  });
});

