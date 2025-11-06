/**
 * Tests for EntityNavigation component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EntityNavigation from '../EntityNavigation';
import type { MappingConfigDto } from '../../../types';

describe('EntityNavigation', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should not render when there is only one entity mapping', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    const { container } = render(
      <EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render when there are no entity mappings', () => {
    const config: MappingConfigDto = {
      entityMappings: [],
    } as MappingConfigDto;

    const { container } = render(
      <EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when there are multiple entity mappings', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity2', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    render(<EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />);

    expect(screen.getByText('Previous Entity')).toBeInTheDocument();
    expect(screen.getByText('Next Entity')).toBeInTheDocument();
  });

  it('should display correct entity count', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity2', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity3', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    render(<EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />);

    expect(screen.getByText('Entity 1 of 3')).toBeInTheDocument();
  });

  it('should disable Previous button on first entity', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity2', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    render(<EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />);

    const prevButton = screen.getByText('Previous Entity').closest('button');
    expect(prevButton).toBeDisabled();
  });

  it('should enable Next button on first entity', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity2', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    render(<EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />);

    const nextButton = screen.getByText('Next Entity').closest('button');
    expect(nextButton).not.toBeDisabled();
  });

  it('should navigate to next entity when Next button is clicked', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity2', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    render(<EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />);

    const nextButton = screen.getByText('Next Entity').closest('button');
    fireEvent.click(nextButton!);

    expect(screen.getByText('Entity 2 of 2')).toBeInTheDocument();
  });

  it('should call onChange when Next button is clicked', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity2', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    render(<EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />);

    const nextButton = screen.getByText('Next Entity').closest('button');
    fireEvent.click(nextButton!);

    expect(mockOnChange).toHaveBeenCalledWith(1);
  });

  it('should navigate to previous entity when Previous button is clicked', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity2', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    render(<EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />);

    // Navigate to second entity
    const nextButton = screen.getByText('Next Entity').closest('button');
    fireEvent.click(nextButton!);

    // Navigate back to first entity
    const prevButton = screen.getByText('Previous Entity').closest('button');
    fireEvent.click(prevButton!);

    expect(screen.getByText('Entity 1 of 2')).toBeInTheDocument();
  });

  it('should call onChange when Previous button is clicked', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity2', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    render(<EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />);

    // Navigate to second entity
    const nextButton = screen.getByText('Next Entity').closest('button');
    fireEvent.click(nextButton!);

    mockOnChange.mockClear();

    // Navigate back to first entity
    const prevButton = screen.getByText('Previous Entity').closest('button');
    fireEvent.click(prevButton!);

    expect(mockOnChange).toHaveBeenCalledWith(0);
  });

  it('should disable Next button on last entity', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity2', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    render(<EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />);

    // Navigate to last entity
    const nextButton = screen.getByText('Next Entity').closest('button');
    fireEvent.click(nextButton!);

    expect(nextButton).toBeDisabled();
  });

  it('should enable Previous button on last entity', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity2', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    render(<EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />);

    // Navigate to last entity
    const nextButton = screen.getByText('Next Entity').closest('button');
    fireEvent.click(nextButton!);

    const prevButton = screen.getByText('Previous Entity').closest('button');
    expect(prevButton).not.toBeDisabled();
  });

  it('should handle navigation with three entities', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity2', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity3', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    render(<EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />);

    expect(screen.getByText('Entity 1 of 3')).toBeInTheDocument();

    const nextButton = screen.getByText('Next Entity').closest('button');
    fireEvent.click(nextButton!);
    expect(screen.getByText('Entity 2 of 3')).toBeInTheDocument();

    fireEvent.click(nextButton!);
    expect(screen.getByText('Entity 3 of 3')).toBeInTheDocument();
  });

  it('should call onChange on mount', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity2', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    render(<EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />);

    expect(mockOnChange).toHaveBeenCalledWith(0);
  });

  it('should work without onChange callback', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity2', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    render(<EntityNavigation dataMappingConfigDto={config} />);

    const nextButton = screen.getByText('Next Entity').closest('button');
    fireEvent.click(nextButton!);

    expect(screen.getByText('Entity 2 of 2')).toBeInTheDocument();
  });

  it('should display navigation icons', () => {
    const config: MappingConfigDto = {
      entityMappings: [
        { entityClass: 'Entity1', isPolymorphicList: false, isShowNoneMappingFields: false },
        { entityClass: 'Entity2', isPolymorphicList: false, isShowNoneMappingFields: false },
      ],
    } as MappingConfigDto;

    const { container } = render(
      <EntityNavigation dataMappingConfigDto={config} onChange={mockOnChange} />
    );

    const leftIcon = container.querySelector('.anticon-left');
    const rightIcon = container.querySelector('.anticon-right');

    expect(leftIcon).toBeInTheDocument();
    expect(rightIcon).toBeInTheDocument();
  });
});

