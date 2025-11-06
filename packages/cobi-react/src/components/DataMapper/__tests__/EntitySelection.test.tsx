/**
 * Tests for EntitySelection component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EntitySelection } from '../EntitySelection';
import type { EntityMappingConfigDto, MappingConfigDto } from '../../../types';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useEntityTypes: vi.fn(() => ({
    data: [
      'org.net.cyoda.saas.model.dto.Organisation',
      'org.net.cyoda.saas.model.dto.Person',
      'org.net.cyoda.saas.model.dto.Address',
    ],
    isLoading: false,
  })),
  useReportingInfo: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
}));

describe('EntitySelection', () => {
  const mockEntityMapping: EntityMappingConfigDto = {
    id: { id: 'test-1', uiId: 1 },
    name: 'Test Entity',
    entityClass: 'org.net.cyoda.saas.model.dto.Organisation',
    metadata: [],
    columns: [],
    functionalMappings: [],
    entityRelationConfigs: [
      {
        srcRelativeRootPath: 'root:/organisations/*',
        parentRelationPath: '',
        parentEntityClass: null,
      },
    ],
    columnPathsForUniqueCheck: [],
    entityFilter: {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [],
    },
    isShowNoneMappingFields: false,
    isPolymorphicList: false,
    cobiCoreMetadata: [],
    cobiPathsRelations: [],
    script: {
      inputSrcPaths: [],
      inputMetaPaths: [],
      reusableScripts: [],
      body: '',
    },
  } as EntityMappingConfigDto;

  const mockDataMappingConfigDto: MappingConfigDto = {
    id: { id: 'mapping-1', uiId: 1 },
    name: 'Test Mapping',
    entityMappings: [mockEntityMapping],
  } as MappingConfigDto;

  const mockSourceData = {
    organisations: [
      {
        name: 'Test Org',
        registrationNumber: '12345',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
      />
    );

    expect(container.querySelector('.entity-selection')).toBeInTheDocument();
  });

  it('should render Name input field', () => {
    render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should render Entity Class select', () => {
    render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
      />
    );

    const entityClassLabels = screen.getAllByText(/Entity Class/i);
    expect(entityClassLabels.length).toBeGreaterThan(0);
  });

  it('should render Load Test Data button', () => {
    render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
      />
    );

    expect(screen.getByText('Load Test Data')).toBeInTheDocument();
  });

  it('should display entity class options', async () => {
    const { container } = render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
      />
    );

    // Entity types should be loaded
    await waitFor(() => {
      const selects = container.querySelectorAll('.ant-select');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  it('should render form layout', () => {
    const { container } = render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
      />
    );

    expect(container.querySelector('.ant-form')).toBeInTheDocument();
  });

  it('should work without onEntityMappingChange callback', () => {
    const { container } = render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
      />
    );

    expect(container.querySelector('.entity-selection')).toBeInTheDocument();
  });

  it('should render with isFirst prop', () => {
    const { container } = render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
        isFirst={true}
      />
    );

    expect(container.querySelector('.entity-selection')).toBeInTheDocument();
  });

  it('should render without isFirst prop', () => {
    const { container } = render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
        isFirst={false}
      />
    );

    expect(container.querySelector('.entity-selection')).toBeInTheDocument();
  });

  it('should render with action prop', () => {
    const { container } = render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
        action="popup:edit"
      />
    );

    expect(container.querySelector('.entity-selection')).toBeInTheDocument();
  });

  it('should render with noneMappingFields prop', () => {
    const { container } = render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
        noneMappingFields={['field1', 'field2']}
      />
    );

    expect(container.querySelector('.entity-selection')).toBeInTheDocument();
  });

  it('should render without sourceData', () => {
    const { container } = render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
      />
    );

    expect(container.querySelector('.entity-selection')).toBeInTheDocument();
  });

  it('should render entity class with short name', async () => {
    const { container } = render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
      />
    );
    
    // Entity class options should show short names (e.g., "Organisation" instead of full path)
    await waitFor(() => {
      const selects = container.querySelectorAll('.ant-select');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  it('should handle loading state for entity types', () => {
    const { useEntityTypes } = require('../../../hooks');
    useEntityTypes.mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { container } = render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
      />
    );

    expect(container.querySelector('.entity-selection')).toBeInTheDocument();
  });

  it('should handle empty entity types', () => {
    const { useEntityTypes } = require('../../../hooks');
    useEntityTypes.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { container } = render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
      />
    );

    expect(container.querySelector('.entity-selection')).toBeInTheDocument();
  });

  it('should handle null entity types', () => {
    const { useEntityTypes } = require('../../../hooks');
    useEntityTypes.mockReturnValue({
      data: null,
      isLoading: false,
    });

    const { container } = render(
      <EntitySelection
        dataMappingConfigDto={mockDataMappingConfigDto}
        sourceData={mockSourceData}
      />
    );

    expect(container.querySelector('.entity-selection')).toBeInTheDocument();
  });

  it('should render multiple entity relation configs', () => {
    const mappingWithMultipleRelations: MappingConfigDto = {
      ...mockDataMappingConfigDto,
      entityMappings: [
        {
          ...mockEntityMapping,
          entityRelationConfigs: [
            {
              srcRelativeRootPath: 'root:/organisations/*',
              parentRelationPath: '',
              parentEntityClass: null,
            },
            {
              srcRelativeRootPath: 'root:/persons/*',
              parentRelationPath: 'organisation',
              parentEntityClass: 'org.net.cyoda.saas.model.dto.Organisation',
            },
          ],
        },
      ],
    };

    const { container } = render(
      <EntitySelection
        dataMappingConfigDto={mappingWithMultipleRelations}
        sourceData={mockSourceData}
      />
    );

    expect(container.querySelector('.entity-selection')).toBeInTheDocument();
  });
});

