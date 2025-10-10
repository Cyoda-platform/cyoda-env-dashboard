import ExportDataMapper from "../../../components/ExportImport/Class/types/ExportDataMapper";
import ExportDataSourceConfig from "../../../components/ExportImport/Class/types/ExportDataSourceConfig";
import ExportDataChainingConfig from "./types/ExportDataChainingConfig";

export default class ExportImportFactory {
  public static getFactory(type: string) {
    if (type === "data-mapper") {
      return new ExportDataMapper(type);
    } else if (type === "data-source-config") {
      return new ExportDataSourceConfig(type);
    } else if (type === "data-chaining-config") {
      return new ExportDataChainingConfig(type);
    }
  }
}
