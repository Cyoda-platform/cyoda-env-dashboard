import HelperContent from "./HelperContent";
import {ElButton, ElNotification} from 'element-plus';
import {h} from 'vue';

export default class HelperPollingChanges {
  private configsCompareDialogPollingRef: any = null;
  private loadFn: any = null;
  private id: string = null;
  private data = null;
  private static intervalId = null;
  private dataServer = null;
  private converterToUiFn: any = null;
  private convertToBackendFn: any = null;

  constructor({configsCompareDialogPollingRef, loadFn, id, data, convertToUiFn = null, convertToBackendFn = null}) {
    this.configsCompareDialogPollingRef = configsCompareDialogPollingRef;
    this.loadFn = loadFn;
    this.id = id;
    this.data = data;
    this.startPollingChanges();
    this.converterToUiFn = convertToUiFn;
    this.convertToBackendFn = convertToBackendFn;
  }

  startPollingChanges() {
    if (!this.id) return;
    if (HelperPollingChanges.intervalId) clearInterval(HelperPollingChanges.intervalId);
    HelperPollingChanges.intervalId = setInterval(async () => {
      let {data: dataServer} = await this.loadFn(this.id);
      if (this.converterToUiFn) {
        dataServer = this.converterToUiFn(dataServer);
      }
      if (this.isDifferentData(this.data, dataServer)) {
        this.dataServer = dataServer;
        const notificationInst = ElNotification.info({
          title: 'Changes detected',
          duration: 10_000,
          dangerouslyUseHTMLString: true,
          customClass: 'polling-changes-notify',
          message: h('p', null, [
            h('span', null, [
              'We detected what data was changed on server side ',
              h('br'),
              h(ElButton, {
                type: "info",
                size: "small",
                onClick: () => {
                  this.onClickIgnorePollingChanges();
                  notificationInst.close();
                }
              }, 'Ignore'),
              h(ElButton, {
                type: "primary",
                size: "small",
                onClick: () => {
                  this.onOpenMergeWindowPollingChanges();
                  notificationInst.close();
                }
              }, 'Compare changes'),
            ]),
          ])
        });
      }
    }, 5 * 1000)
  }

  beforeDestroy() {
    clearInterval(HelperPollingChanges.intervalId)
  }

  private onClickIgnorePollingChanges() {
    this.setLastLastUpdatedTime();
  }

  private setLastLastUpdatedTime() {
    this.data.lastUpdated = this.dataServer.lastUpdated;
  }

  private onOpenMergeWindowPollingChanges() {
    this.setLastLastUpdatedTime();
    let dataServer = JSON.parse(JSON.stringify(this.dataServer));
    let data = JSON.parse(JSON.stringify(this.data));
    if (this.convertToBackendFn) {
      dataServer = this.convertToBackendFn(dataServer);
      data = this.convertToBackendFn(data);
    }
    const dataFrom = HelperContent.prettyContent(JSON.stringify(dataServer));
    const dataTo = HelperContent.prettyContent(JSON.stringify(data));
    if (this.configsCompareDialogPollingRef.value) this.configsCompareDialogPollingRef.value.openDialog(dataFrom, dataTo);
  }

  onAcceptTheirs() {
    if (this.converterToUiFn) {
      Object.assign(this.data, JSON.parse(JSON.stringify(this.converterToUiFn(this.dataServer))));
      return;
    }
    Object.assign(this.data, JSON.parse(JSON.stringify(this.dataServer)));
    this.data = JSON.parse(JSON.stringify(this.dataServer));
  }

  onAcceptYours() {
    return;
  }

  onSave(newData) {
    if (this.converterToUiFn) {
      Object.assign(this.data, JSON.parse(JSON.stringify(this.converterToUiFn(newData))));
      return;
    }
    Object.assign(this.data, JSON.parse(JSON.stringify(newData)));
  }

  isDifferentData(currentData, dataServer) {
    const data1 = JSON.parse(JSON.stringify(currentData));
    const data2 = JSON.parse(JSON.stringify(dataServer));
    delete data1.lastUpdated;
    delete data2.lastUpdated;
    const isLastUpdatedEqual = currentData.lastUpdated === dataServer.lastUpdated
    currentData.lastUpdated = dataServer.lastUpdated;
    return JSON.stringify(data1) !== JSON.stringify(data2) && !isLastUpdatedEqual;
  }
}
