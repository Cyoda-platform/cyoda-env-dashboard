import BaseExportImport from '../BaseExportImport';
import * as api from '../../../../../api';
import Instance from '../Instance';
import {CatalogItemExportImportContainer} from "../../../../../types/types";

export default class ExportImportAlias extends BaseExportImport {
  public async makeImportInstances(data: CatalogItemExportImportContainer) {
    const results: any[] = [];
    const names=data.aliases.map((el)=>el.name);
    const instance = new Instance(names).setImport(() => api.postCatalogItemImport(data));
    results.push(instance);
    return results;
  }

  private async export(dataToExport: any[]) {
    const ids = dataToExport.map((el) => {
      return el.id;
    });
    const {data} = await api.getCatalogItemExportByIds(ids);
    this.send(data);
  }
}
