import BaseExportImport from "../BaseExportImport";
import Instance from "../Instance";
import axios from "@cyoda/ui-lib/src/plugins/axios";

export default class ExportDataChainingConfig extends BaseExportImport {
  public async makeImportInstances(data: any) {
    const results: any[] = [];
    data.forEach((el: any) => {
      let newEl = JSON.parse(JSON.stringify(el));
      const instance = new Instance(el.name)
        .setImportFn(async () => {
          return await axios.post(`/chaining-config/save`, el);
        })
        .setSolveProblemMessageFn((errorDescs: any[]) => {
          const messages: string[] = [];
          const newElChange = JSON.parse(JSON.stringify(el));
          for (const errorDesc of errorDescs) {
            // Problem in Name
            if (errorDesc.indexOf("with same name") > -1) {
              newElChange.name += `_${Date.now()}`;
              messages.push("We will change name to another for solve problem");
            }
          }
          newEl = JSON.parse(JSON.stringify(newElChange));
          if (messages.length > 0) {
            messages.push("Continue?");
          }
          return messages.join(". ");
        })
        .setSolveProblemFn(async () => {
          return await axios.post(`/chaining-config/save`, newEl);
        });
      results.push(instance);
    });
    return results;
  }

  private async export(dataToExport: any[]) {
    this.send(dataToExport);
  }
}
