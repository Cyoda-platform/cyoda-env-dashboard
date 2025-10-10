import BaseExportImport from '../BaseExportImport';
import * as api from '../../../../../api';
import Instance from '../Instance';

export default class ExportImportReports extends BaseExportImport {
  public makeImportInstances(data: any, params: any) {
    const results: any[] = [];
    const names = data.data.value.map((el)=>el.name);
    const namesTxt = names.join(', ');
    const instance = new Instance(`Reports: ${namesTxt}`)
      .setImport(async () => {
        await api.postImportAllReports(data, params);
      });
    results.push(instance);
    return results;
  }

  private async export(dataToExport: any[]) {
    const {data} = await api.getExportReportsByIds(dataToExport);
    this.send(data, `export_${dataToExport.map((el)=>el.toLowerCase()).join("-AND-")}.json`);
  }
}
