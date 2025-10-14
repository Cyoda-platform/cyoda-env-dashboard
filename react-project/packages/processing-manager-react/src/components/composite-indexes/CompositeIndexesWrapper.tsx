/**
 * Composite Indexes Wrapper Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabCompositeIndexes/PmCompositeIndexes.vue
 */

import React from 'react';
import { CompositeIndexes } from '@cyoda/http-api-react';
import {
  usePlatformCommonCompositeIndexesList,
  useEntitiesListPossible,
  usePlatformCommonCompositeIndexesReindex,
  usePlatformCommonCompositeIndexesDelete,
  usePlatformCommonCompositeIndexesCreate,
} from '../../hooks';

export const CompositeIndexesWrapper: React.FC = () => {
  const getAllCompositeIndexesRequest = (entity: string) => {
    return usePlatformCommonCompositeIndexesList({ entity });
  };

  const getReportingFetchTypesRequest = () => {
    return useEntitiesListPossible();
  };

  const postCompositeIndexesReindexRequest = (indexId: string) => {
    return usePlatformCommonCompositeIndexesReindex({ indexId });
  };

  const postCompositeIndexesDeleteRequest = (indexId: string) => {
    return usePlatformCommonCompositeIndexesDelete({ indexId });
  };

  const postCompositeIndexesCreateRequest = (form: string) => {
    return usePlatformCommonCompositeIndexesCreate({ data: form });
  };

  return (
    <div>
      <CompositeIndexes
        getAllCompositeIndexesRequestFn={getAllCompositeIndexesRequest}
        getReportingFetchTypesRequestFn={getReportingFetchTypesRequest}
        postCompositeIndexesReindexRequestFn={postCompositeIndexesReindexRequest}
        postCompositeIndexesDeleteRequestFn={postCompositeIndexesDeleteRequest}
        postCompositeIndexesCreateRequestFn={postCompositeIndexesCreateRequest}
      />
    </div>
  );
};

export default CompositeIndexesWrapper;

