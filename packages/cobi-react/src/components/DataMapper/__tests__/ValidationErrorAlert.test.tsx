import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ValidationErrorAlert from '../ValidationErrorAlert';
import type { EntityMappingConfigDto } from '../../../types';

describe('ValidationErrorAlert', () => {
  const mockEntityMapping: EntityMappingConfigDto = {
    id: { uiId: 1 },
    name: 'Test Entity',
    entityClass: 'TestClass',
    columns: [],
    functionalMappings: [],
    cobiCoreMetadata: [],
    sourceRelativeRootPath: '',
  };

  it('should not render when isSaveButtonTouched is false', () => {
    const { container } = render(
      <ValidationErrorAlert
        entityMapping={mockEntityMapping}
        isSaveButtonTouched={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render when there are no errors', () => {
    const { container } = render(
      <ValidationErrorAlert
        entityMapping={mockEntityMapping}
        isSaveButtonTouched={true}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render when entityMapping is null', () => {
    const { container } = render(
      <ValidationErrorAlert
        entityMapping={null}
        isSaveButtonTouched={true}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});

