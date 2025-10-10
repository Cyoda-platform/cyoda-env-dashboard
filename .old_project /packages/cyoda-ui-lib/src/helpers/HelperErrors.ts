import {ElMessageBox, ElNotification} from 'element-plus';
import ERROR_MESSAGES from "../disctionaries/errorMessages.json";

export default class HelperErrors {
  public static handler(data: any) {
    // For statemachine and fix for validation. When validation back from server side
    const warningMessage = document.querySelector('.helper-errors');
    if (warningMessage) {
      return;
    }

    if (data && data.response && data.response.status && [401, 403].includes(data.response.status) && data.response.data && !data.response?.data?.message?.includes('Invalid username or password')) {
      return;
    }

    if(data.message==='canceled') return;


    if (data && data.response && data.response.status > 200 && data.response.data && !data.response.data.message && !data.response.data.detail) {
      ElMessageBox.alert(`Server response status ${data.response.status}`, 'Server error', {
        dangerouslyUseHTMLString: true,
        customClass: 'helper-errors'
      });
      return;
    }

    if (data.message === 'Network Error') {
      ElMessageBox.alert('Please check your network configurations', 'Network Error', {
        dangerouslyUseHTMLString: true,
        customClass: 'helper-errors'
      });
      return;
    }

    if (data.response && data.response.data) {
      /* eslint-disable */
      data = data.response.data;
      /* eslint-enable */
    }

    const title = 'Error!';
    let content = '';
    if (data.errors && Array.isArray(data.errors)) {
      const errorsArr: string[] = [];
      data.errors.forEach((error: string, index: number) => {
        errorsArr.push(`${index + 1}) ${error}`);
      });
      content = errorsArr.join('<br/>');
    } else if (HelperErrors.isErrorExistInDictionary(data.errors)) {
      const messages = HelperErrors.getAllErrorMessagesFromDictionaries(data.errors);
      messages.forEach((message) => {
        ElNotification({
          title: "Error",
          message,
          type: 'error',
        });
      })
      return;
    } else if (data.message) {
      content = data.message;
    } else if (data.detail) {
      content = data.detail;
    }
    ElMessageBox.alert(content, title, {
      dangerouslyUseHTMLString: true,
      customClass: 'helper-errors',
    });
  }

  static isErrorExistInDictionary(errors) {
    if (typeof errors !== 'object') return false;
    return Object.values(errors).some((error) => {
      return ERROR_MESSAGES[error];
    })
  }

  static getAllErrorMessagesFromDictionaries(errors) {
    return Object.values(errors).map((error) => {
      return ERROR_MESSAGES[error] || error;
    });
  }
}
