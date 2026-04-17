/**
 * InstanceDetail — thin router. Branches between cloud and legacy components.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-instances-design.md §3.5
 */
import React from 'react';
import { useGlobalUiSettingsStore, HelperFeatureFlags } from '@cyoda/http-api-react';
import { InstanceDetailLegacy } from './InstanceDetailLegacy';
import { InstanceDetailCloud } from './cloud-instances/InstanceDetailCloud';

export const InstanceDetail: React.FC = () => {
  const { entityType } = useGlobalUiSettingsStore();
  if (HelperFeatureFlags.isCloudBusinessActive(entityType)) {
    return <InstanceDetailCloud />;
  }
  return <InstanceDetailLegacy />;
};

export default InstanceDetail;
