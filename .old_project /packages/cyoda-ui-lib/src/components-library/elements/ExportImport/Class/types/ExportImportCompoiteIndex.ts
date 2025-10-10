import BaseExportImport from '../BaseExportImport';
import * as api from '../../../../../api';
import Instance from '../Instance';

import {CompositeIndexExport, IndexConfiguration} from '../../../../../types/types';
import eventBus from "../../../../../plugins/eventBus";

export default class ExportImportCompoiteIndex extends BaseExportImport {
  public exportByIdsRequest(ids: string[]) {
    return api.postCompositeIndexesExportByIds(ids);
  }

  public postCompositeIndexesImportRequest(data: CompositeIndexExport) {
    return api.postCompositeIndexesImport(data);
  }

  public makeImportInstances(data: CompositeIndexExport) {
    const results: any[] = [];
    const entityClassShort = data.data.value[0].entityClass.split('.').pop();
    const name = data.data.value.map((el) => el.name).join(', ');
    const instance = new Instance(`${entityClassShort}: ${name}`)
      .setImport(async () => {
        await this.postCompositeIndexesImportRequest(data);
        eventBus.$emit('exportImport:success', {entityClass: data.data.value[0].entityClass});
      });
    results.push(instance);
    return results;
  }

  private async export(dataToExport: IndexConfiguration[]) {
    const ids = dataToExport.map((el) => {
      return el.indexId;
    });
    const {data: dateResponse} = await this.exportByIdsRequest(ids);
    const entityShortClassName = dateResponse.data.value[0].entityClass.split('.').pop();
    const names = dateResponse.data.value.map((el: any) => el.name);
    const namesTxt = names.join('_');
    this.send(dateResponse, `export_composite_indexes_for_${entityShortClassName}_${namesTxt}.json`);
  }
}
