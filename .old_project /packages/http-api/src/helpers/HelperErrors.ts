import { ElMessageBox } from 'element-plus'
import { AxiosError } from "axios";

export default class HelperErrors {
  public static handler(data: AxiosError) {
    if (data.response && data.response.data) {
      /* eslint-disable */
      data = data.response.data;
      /* eslint-enable */
    }

    const title: string = "Error!";
    let content: string = "";
    if (data.message && data.message.length > 0) {
      content = data.message;
    } else {
      // @ts-ignore
      content = data.error;
    }
    ElMessageBox.alert(content, title);
  }
}
