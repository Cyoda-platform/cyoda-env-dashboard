import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InstanceDetail } from './InstanceDetail';

vi.mock('./InstanceDetailLegacy', () => ({ InstanceDetailLegacy: () => <div data-testid="legacy" /> }));
vi.mock('./cloud-instances/InstanceDetailCloud', () => ({ InstanceDetailCloud: () => <div data-testid="cloud" /> }));

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

describe('InstanceDetail router', () => {
  it('renders InstanceDetailCloud when (BUSINESS, cloud-on)', () => {
    mockEntityType.mockReturnValue('BUSINESS');
    render(<InstanceDetail />);
    expect(screen.getByTestId('cloud')).toBeInTheDocument();
  });
  it('renders InstanceDetailLegacy otherwise', () => {
    mockEntityType.mockReturnValue('PERSISTENCE');
    render(<InstanceDetail />);
    expect(screen.getByTestId('legacy')).toBeInTheDocument();
  });
});
