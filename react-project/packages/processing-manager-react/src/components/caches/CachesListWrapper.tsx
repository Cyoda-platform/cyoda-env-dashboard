/**
 * Caches List Wrapper Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabCachesList/PmShardsDetailTabCachesList.vue
 */

import React from 'react';
import { CachesListView } from '@cyoda/http-api-react';
import {
  usePlatformCommonCachesList,
  usePlatformCommonInvalidateCache,
  usePlatformCommonCacheKeys,
} from '../../hooks';

export const CachesListWrapper: React.FC = () => {
  const getCachesListRequest = () => {
    return usePlatformCommonCachesList();
  };

  const getInvalidateCacheRequest = (cacheType: string) => {
    return usePlatformCommonInvalidateCache(cacheType);
  };

  const getCacheKeysRequest = (cacheType: string) => {
    return usePlatformCommonCacheKeys(cacheType);
  };

  return (
    <div>
      <CachesListView
        getCachesListRequestFn={getCachesListRequest}
        getInvalidateCacheRequestFn={getInvalidateCacheRequest}
        getCacheKeysRequestFn={getCacheKeysRequest}
      />
    </div>
  );
};

export default CachesListWrapper;

