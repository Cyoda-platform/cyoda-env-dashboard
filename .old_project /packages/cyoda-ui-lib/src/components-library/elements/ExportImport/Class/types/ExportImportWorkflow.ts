import BaseExportImport from '../BaseExportImport';
// @ts-ignore
import axios from '@cyoda/ui-lib/src/plugins/axios';
import Instance from '../Instance';
import {useRoute} from "vue-router";

export default class ExportImportWorkflow extends BaseExportImport {

  public exportFormats = [
    {
      extension: 'json',
      description: 'JSON format allows users to re-import file in UI',
    },
    {
      extension: 'zip',
      description: 'ZIP format does not allow users to re-import in UI',
    },
  ];

  private ids: string[] = [];

  public makeImportInstances(data: any) {
    const results: any[] = [];
    const names = data.workflow.map((workflow: any) => workflow.name);
    const namesTxt = names.join(', ');
    const instance = new Instance(`workflows`)
      .setImport(async () => {
        await axios.post(`/platform-api/statemachine/import?needRewrite=true`, data);
      });
    results.push(instance);
    return results;
  }

  private async export(dataToExport: any[], selectedFormat: any) {
    let ids: string[] = [];
    let data: any = undefined;
    if (selectedFormat.extension === 'zip') {
      ids = dataToExport.map((el) => {
        return encodeURIComponent(el.entityClassName);
      });
      const dateResponse = await axios.get(`/platform-api/statemachine/export/zip?entityClasses=${ids.join(',')}&isSingleFile=false`, {
        responseType: 'blob',
      });
      this.sendFile(dateResponse.data, `export_workflow.${selectedFormat.extension}`);
    } else {
      ids = dataToExport.map((el) => {
        return `includeIds=${encodeURIComponent(el.id)}`;
      });
      const {data: dateResponse} = await axios.get(`/platform-api/statemachine/export?${ids.join('&')}`);
      data = dateResponse;
      const names = data.workflow.map((el: any) => el.name);
      this.send(data, `export_workflows.${selectedFormat.extension}`);
    }
  }
}
