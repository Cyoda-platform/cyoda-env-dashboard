/**
 * Helper URL Utility
 * Migrated from @cyoda/processing-manager/src/helpers/HelperUrl.ts
 */

import { HelperStorage } from '@cyoda/http-api-react';
import { useAppStore } from '../stores/appStore';

const helperStorage = new HelperStorage();

export class HelperUrl {
  /**
   * Get link to server with proxy support
   * @param endpoint - API endpoint
   * @returns Computed endpoint with node parameter if proxy is enabled
   */
  public static getLinkToServer(endpoint: string): string {
    const appStore = useAppStore.getState();
    const isProxyRequest = helperStorage.get('proxyRequest', true);
    let endpointComputed = endpoint;

    if (isProxyRequest) {
      // Add node parameter for proxy requests
      if (endpointComputed.indexOf('?') > -1) {
        endpointComputed += '&';
      } else {
        endpointComputed += '?';
      }
      endpointComputed += `node=${appStore.node}`;
    } else {
      // Use direct base URL
      if (appStore.baseUrl) {
        endpointComputed = `${appStore.baseUrl}${endpointComputed}`;
      }
    }

    return endpointComputed;
  }
}

export default HelperUrl;

