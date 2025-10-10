import FileSaver from 'file-saver';

export default class BaseExportImport {
  private type: string = '';
  public exportFormats: { extension: string, description: string }[] = [];

  constructor(type: string) {
    this.type = type;
  }

  public send(data: any, name = '') {
    const file = new File([JSON.stringify(data)], name || `export_${this.type}.json`, {type: 'text/plain;charset=utf-8'});
    FileSaver(file, file.name, {autoBom: false});
  }

  public sendFile(data: any, name = '') {
    FileSaver(data, name, {autoBom: false});
  }
}
