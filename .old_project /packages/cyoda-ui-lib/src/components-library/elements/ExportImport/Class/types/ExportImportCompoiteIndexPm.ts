import ExportImportCompoiteIndex from './ExportImportCompoiteIndex';
import {axiosProcessing} from '../../../../../plugins/axios';

export default class ExportImportCompoiteIndexPm extends ExportImportCompoiteIndex {
  public exportByIdsRequest(ids: string[]) {
    return axiosProcessing.post(`/processing/pm-composite-indexes/export-by-ids?nodeIp=${Vue.prototype.$nodeIp}`, ids);
  }

  public postCompositeIndexesImportRequest(data: any) {
    return axiosProcessing.post(`/processing/pm-composite-indexes/import?nodeIp=${Vue.prototype.$nodeIp}`, data);
  }
}
