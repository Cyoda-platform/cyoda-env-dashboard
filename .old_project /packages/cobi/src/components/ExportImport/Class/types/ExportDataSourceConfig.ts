import BaseExportImport from "../BaseExportImport";
import Instance from "../Instance";
import axios from "@cyoda/ui-lib/src/plugins/axios";

export default class ExportDataSourceConfig extends BaseExportImport {
  public async makeImportInstances(data: any) {
    const results: any[] = [];
    data.forEach((el: any) => {
      let newEl = JSON.parse(JSON.stringify(el));
      const instance = new Instance(el.name)
        .setImportFn(async () => {
          return await axios.post(`/data-source-config/save`, el);
        })
        .setSolveProblemMessageFn((errorDescs: any[]) => {
          const messages: string[] = [];
          const newElChange = JSON.parse(JSON.stringify(el));
          for (const errorDesc of errorDescs) {
            // Problem in Name
            if (errorDesc.indexOf("with same name") > -1) {
              newElChange.name += `_${Date.now()}`;
              messages.push("We will change name to another for solve problem");
            } else if (errorDesc.indexOf("DataMappingConfig with id") > -1) {
              const match = errorDesc.match(/\[(.*)\]/);
              if (match[1]) {
                const endpoint = newElChange.endpoints.find((el) => el.dataMappingConfigId === match[1]);
                if (endpoint) {
                  endpoint.dataMappingConfigId = null;
                  messages.push(`We will remove DataMappingConfig with id ${match[1]} for solve problem`);
                }
              }
            }
          }
          newEl = JSON.parse(JSON.stringify(newElChange));
          if (messages.length > 0) {
            messages.push("Continue?");
          }
          return messages.join(". ");
        })
        .setSolveProblemFn(async () => {
          return await axios.post(`/data-source-config/save`, newEl);
        });
      results.push(instance);
    });
    return results;
  }

  private async export(dataToExport: any[]) {
    this.send(dataToExport);
  }
}
