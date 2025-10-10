<template>
  <div>
    <ErrorHandlerNotification v-if="isShowErrorNotification" @open="onOpen"/>
    <ErrorHandlerTable ref="errorHandlerTableRef" @detailView="onDetailView" @export="onExport" @exportAll="onExportAll"
                       @clearErrors="onClearErrors"/>
    <ErrorHandlerDetailView @export="onExport" ref="errorHandlerDetailViewRef"/>
  </div>
</template>

<script setup lang="ts">
import {ElMessageBox, ElMessage, ElLink} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import {ref, computed, watch, onMounted, getCurrentInstance, h, nextTick} from "vue";

import ErrorHandlerNotification from "./ErrorHandlerNotification.vue";
import ErrorHandlerTable from "./ErrorHandlerTable.vue";

import moment from "moment";
import ErrorHandlerDetailView from "./ErrorHandlerDetailView.vue";
import FileSaver from "file-saver";
import {VersionPlatform} from "../../../types/types";
import HelperContent from "@cyoda/cobi/src/helpers/HelperContent";
import _ from "lodash";
import useErrorHandlerStore from "../../../stores/error-handler";

const route = useRoute();
const router = useRouter();
const errorHandlerStore = useErrorHandlerStore();
const errors = computed(() => {
  return errorHandlerStore.errors;
});
const platformVersion = computed(() => {
  return platform.value.version || "-";
});
const isShowErrorNotification = computed(() => {
  return errors.value.length > 0;
});

function addError(value) {
  return errorHandlerStore.addError(value);
}

function clearErrors() {
  return errorHandlerStore.clearErrors();
}

const errorHandlerTableRef = ref(null);

const errorHandlerDetailViewRef = ref(null);

let platform = ref({});

let uiVersion = ref(import.meta.env.VITE_APP_UI_VERSION!);

let ignoreErrors = ref(["Request failed with status code", "canceled"]);

onMounted(async () => {
  if (import.meta.env.MODE === "production" || true) {
    const app = getCurrentInstance().appContext.app;
    app.config.errorHandler = (err: Error, vm: Vue, info: string) => {
      if (ignoreErrors.value.some((ignoreErr) => err.message.toLowerCase().includes(ignoreErr.toLowerCase()))) {
        console.error(err);
        return;
      }

      ElMessage.error({
        message: h("p", null, [
          h("span", null, "Page may be not work correctly. Please send error to developer. "),
          h(
            ElLink,
            {
              onClick: onOpen
            },
            "Open debug tool"
          )
        ])
      });

      addError({
        message: err.message,
        info,
        stack: err.stack,
        createdAt: moment().format("x"),
        pageUrl: window.location.href,
        uiVersion: uiVersion.value
      });

      console.error(err);
    };

    await router.isReady();
    if (route.query.error) {
      const test: any = null;
      test.filter((el) => el);
    }
  }
});

function onOpen() {
  errorHandlerTableRef.value.isVisible = true;
}

function onDetailView(error) {
  errorHandlerDetailViewRef.value.open(error);
}

async function onExport(error) {
  const data = prepareDataForExport(error);
  const message = error.message
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll(/[^a-zA-Z0-9]/g, "_")
    .replaceAll(/_+/g, "_")
    .replace(/_$/, "");
  const file = new File([HelperContent.prettyContent(JSON.stringify(data))], `file_${moment().format("YYYY-MM-DD HH:mm:ss")}_platform_v${platformVersion.value}_UI_v${uiVersion.value}_error_${message}.json`, {type: "text/plain;charset=utf-8"});
  FileSaver.saveAs(file);
}

async function onExportAll() {
  const groupedData = _.groupBy(errors.value, (el) => {
    return el.message;
  });

  const errorsKeys = Object.keys(groupedData)
    .map((el: any) => {
      return _.maxBy(groupedData[el], (elMax: any) => parseInt(elMax.createdAt, 10));
    })
    .reverse();

  const data = errorsKeys.map((error) => prepareDataForExport(error));
  const file = new File([HelperContent.prettyContent(JSON.stringify(data))], `file_${moment().format("YYYY-MM-DD HH:mm:ss")}_platform_v${platformVersion.value}_UI_v${uiVersion.value}_all_errors.json`, {type: "text/plain;charset=utf-8"});
  FileSaver.saveAs(file);
}

function prepareDataForExport(error) {
  const eventsCount = errors.value.filter((el) => el.message === error.message).length;
  return {
    eventsCount,
    ...error,
    createdAt: moment(parseInt(error.createdAt, 10))
  };
}

function onClearErrors() {
  ElMessageBox.confirm("Do you really want to delete All error on UI and close that window?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        errorHandlerTableRef.value.isVisible = false;
        clearErrors();
      }
    }
  });
}

watch(
  isShowErrorNotification,
  (value: boolean) => {
    if (value) {
      document.body.classList.add("error-handler");
    } else {
      document.body.classList.remove("error-handler");
    }
  },
  {immediate: true}
);
</script>
