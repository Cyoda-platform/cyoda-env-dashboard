import BaseExportImport from '../BaseExportImport';
import * as api from '../../../../../api';
import Instance from '../Instance';

export default class ExportImportReportsStream extends BaseExportImport {
  public makeImportInstances(data: any, params: any) {
    const results: any[] = [];
    const names = data.data.value.map((el)=>el.name);
    const namesTxt = names.join(', ');
    const instance = new Instance(`Stream Reports: ${namesTxt}`)
      .setImport(async () => {
        await api.postImportAllReportsStream(data, params);
      });
    results.push(instance);
    return results;
  }

  private async export(dataToExport: any[]) {
    const {data} = await api.getExportReportsStreamByIds(dataToExport);
    this.send(data, `export_${dataToExport.map((el)=>el.toLowerCase()).join("-AND-")}.json`);
  }
}
