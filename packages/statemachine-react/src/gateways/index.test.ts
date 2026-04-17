import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getWorkflowGateway } from './index';
import { CloudWorkflowGateway } from './CloudWorkflowGateway';
import { LegacyPlatformWorkflowGateway } from './LegacyPlatformWorkflowGateway';

vi.mock('@cyoda/http-api-react', async () => {
  const actual = await vi.importActual<any>('@cyoda/http-api-react');
  return {
    ...actual,
    HelperFeatureFlags: {
      isCyodaCloud: vi.fn(),
    },
  };
});

const { HelperFeatureFlags } = await import('@cyoda/http-api-react');

describe('getWorkflowGateway', () => {
  beforeEach(() => {
    (HelperFeatureFlags.isCyodaCloud as any).mockReset();
  });

  it('returns CloudWorkflowGateway when isCyodaCloud is true', () => {
    (HelperFeatureFlags.isCyodaCloud as any).mockReturnValue(true);

    const gateway = getWorkflowGateway();

    expect(gateway).toBeInstanceOf(CloudWorkflowGateway);
  });

  it('returns LegacyPlatformWorkflowGateway when isCyodaCloud is false', () => {
    (HelperFeatureFlags.isCyodaCloud as any).mockReturnValue(false);

    const gateway = getWorkflowGateway();

    expect(gateway).toBeInstanceOf(LegacyPlatformWorkflowGateway);
  });

  it('returns a fresh instance per call (no cached singleton)', () => {
    (HelperFeatureFlags.isCyodaCloud as any).mockReturnValue(true);

    const a = getWorkflowGateway();
    const b = getWorkflowGateway();

    expect(a).not.toBe(b);
  });
});
