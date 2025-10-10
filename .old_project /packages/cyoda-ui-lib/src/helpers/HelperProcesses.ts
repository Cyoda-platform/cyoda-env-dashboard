export default class HelperProcesses {

  static format(process) {
    if (process.parameters?.length > 0) {
      process.parameters.forEach((el) => {
        if (el.valueType === 'INTEGER') {
          el.value['@type'] = 'Integer';
          el.value.value = el.value.value ? parseInt(el.value.value, 10) : '';
        }
      })
    }
    return process;
  }
}
