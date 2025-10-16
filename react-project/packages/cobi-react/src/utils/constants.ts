export class HelperConstants {
  static MAX_FILE_SIZE_KB = 100;
  static MIN_FILE_SIZE_FOR_EDIT_KB = 32;

  static getDataSourceConfigDialogRequestKey(id: string): string {
    return `data-source-config-dialog-request:${id}`;
  }
}

