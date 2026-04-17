/**
 * Instances — thin router. Branches between cloud and legacy components.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-instances-design.md §3.5
 */
import React from 'react';
import { useGlobalUiSettingsStore, HelperFeatureFlags } from '@cyoda/http-api-react';
import { InstancesLegacy } from './InstancesLegacy';
import { InstancesCloud } from './cloud-instances/InstancesCloud';

export const Instances: React.FC = () => {
  const { entityType } = useGlobalUiSettingsStore();
  if (HelperFeatureFlags.isCloudBusinessActive(entityType)) {
    return <InstancesCloud />;
  }
  return <InstancesLegacy />;
};

export default Instances;
