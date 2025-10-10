import qs from 'qs';

/**
 * Serialize parameters for axios requests
 * Migrated from @cyoda/ui-lib/src/helpers/HelperSerializeParams
 */
export function serializeParams(params: any): string {
  return qs.stringify(params, {
    indices: false,
    skipNulls: true,
    filter: function (prefix, value) {
      if (typeof value !== 'object') return value;

      // Convert empty strings to null
      Object.keys(value).forEach((key) => {
        if (value[key] === '') {
          value[key] = null;
        }
      });
      
      return value;
    },
  });
}

export default serializeParams;

