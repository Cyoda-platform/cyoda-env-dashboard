import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Instances } from './Instances';

vi.mock('./InstancesLegacy', () => ({ InstancesLegacy: () => <div data-testid="legacy" /> }));
vi.mock('./cloud-instances/InstancesCloud', () => ({ InstancesCloud: () => <div data-testid="cloud" /> }));

const mockEntityType = vi.fn(() => 'BUSINESS');
vi.mock('@cyoda/http-api-react', async () => {
  const actual = await vi.importActual<any>('@cyoda/http-api-react');
  return {
    ...actual,
    useGlobalUiSettingsStore: () => ({ entityType: mockEntityType() }),
    HelperFeatureFlags: {
      ...actual.HelperFeatureFlags,
      isCloudBusinessActive: (et: string) => et === 'BUSINESS',
    },
  };
});

describe('Instances router', () => {
  it('renders InstancesCloud when (BUSINESS, cloud-on)', () => {
    mockEntityType.mockReturnValue('BUSINESS');
    render(<Instances />);
    expect(screen.getByTestId('cloud')).toBeInTheDocument();
  });
  it('renders InstancesLegacy otherwise', () => {
    mockEntityType.mockReturnValue('PERSISTENCE');
    render(<Instances />);
    expect(screen.getByTestId('legacy')).toBeInTheDocument();
  });
});
