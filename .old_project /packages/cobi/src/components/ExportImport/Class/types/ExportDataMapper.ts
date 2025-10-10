import BaseExportImport from "../BaseExportImport";
import Instance from "../Instance";
import axios from "@cyoda/ui-lib/src/plugins/axios";
import BlocklyGenerator from "../../../DataMapper/FunctionalMappingSettings/FunctionalMapping/generators/blockly_generator";

export default class ExportDataMapper extends BaseExportImport {
  private allFunctions = [];
  private allTransformers = [];
  private parameters = {};

  public async makeImportInstances(data: any) {
    if (!Array.isArray(data)) {
      data = [data];
    }
    const results: any[] = [];
    data.forEach((el: any) => {
      const newEl = JSON.parse(JSON.stringify(el));
      const instance = new Instance(el.name)
        .setImportFn(async () => {
          // @ts-ignore
          if (!el.metadata || this.parameters.isGenerateBlockly) {
            const generator = new BlocklyGenerator();
            generator.setMappingConfigDto(el);
            if (this.allFunctions.length === 0) {
              const { data } = await axios.get("/platform-mapping-plugin/config/list-all-functions");
              this.allFunctions = data;
            }

            if (this.allTransformers.length === 0) {
              const { data } = await axios.get("/platform-mapping-plugin/config/list-all-transformers");
              this.allTransformers = data;
            }

            generator.setAllFunctions(this.allFunctions);
            generator.setAllTransformers(this.allTransformers);
            el.metadata = JSON.stringify(generator.transform());
          }
          return await axios.post(`/platform-mapping-plugin/config/save`, el);
        })
        .setSolveProblemMessageFn((errorDescs: any[]) => {
          for (const errorDesc of errorDescs) {
            // Problem in Name
            if (errorDesc.indexOf("with same name") > -1) {
              newEl.name += `_${Date.now()}`;
              return "We will change name to another for solve problem. Continue?";
            }

            // Problem in ID
            if (errorDesc.indexOf("Current constraint owner EntityId") > -1) {
              newEl.id = null;
              return "We will delete id for solve problem. Continue?";
            }
          }
        })
        .setSolveProblemFn(async () => {
          return await axios.post(`/platform-mapping-plugin/config/save`, newEl);
        });
      results.push(instance);
    });
    return results;
  }

  private setParameters(data) {
    this.parameters = JSON.parse(JSON.stringify(data));
  }

  private async export(dataToExport: any[]) {
    this.send(dataToExport);
  }
}
