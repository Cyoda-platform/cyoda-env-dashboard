export default class HelperConstants {
  static LOGIN: string = "auth:login";

  static LOGOUT: string = "auth:logout";

  static NEWTASKS: string = "tasks:new";

  static MAX_FILE_SIZE_KB = 100;

  static MIN_FILE_SIZE_FOR_EDIT_KB = 32;

  static getDataSourceConfigDialogRequestKey(id) {
    return `data-source-config-dialog-request:${id}`;
  }
}
