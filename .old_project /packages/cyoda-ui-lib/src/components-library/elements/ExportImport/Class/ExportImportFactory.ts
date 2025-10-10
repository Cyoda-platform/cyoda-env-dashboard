import ExportImportAlias from './types/ExportImportAlias';
import ExportImportWorkflow from './types/ExportImportWorkflow';
import ExportImportCompoiteIndex from './types/ExportImportCompoiteIndex';
import ExportImportCompoiteIndexPm from './types/ExportImportCompoiteIndexPm';
import ExportImportReports from "./types/ExportImportReports";
import ExportImportReportsStream from "./types/ExportImportReportsStream";

export default class ExportImportFactory {
  public static getFactory(type: string) {
    if (type === 'alias') {
      return new ExportImportAlias(type);
    } else if (type === 'workflow') {
      return new ExportImportWorkflow(type);
    } else if (type === 'compositeIndex' && location.href.includes('processing-manager')) {
      return new ExportImportCompoiteIndexPm(type);
    } else if (type === 'compositeIndex') {
      return new ExportImportCompoiteIndex(type);
    } else if (type === 'reports') {
      return new ExportImportReports(type);
    } else if (type === 'reportsStream') {
      return new ExportImportReportsStream(type);
    }
  }
}
