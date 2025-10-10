import {ref, computed, watch, onMounted} from 'vue';
import HelperStorage from "../helpers/HelperStorage";
import {v4 as uuidv4} from "uuid";
import moment from "moment";
import {ElMessage as Message} from "element-plus";
import {useRoute, useRouter} from "vue-router";

export function useAutoSavingMixin() {
  const autoDataStorageKey = ref(null);
  const autoSaveList = ref([]);
  const sourceDataDto = ref(null);
  const isEnableAutoSaving = ref(false);

  const router = useRouter();
  const route = useRoute();

  onMounted(() => {
    autoSaveList.value = JSON.parse(JSON.stringify(HelperStorage.ints().get(autoDataStorageKey.value, [])));
  })

  const autoSave = (source) => {
    if (!autoDataStorageKey.value || !isEnableAutoSaving.value) {
      return;
    }
    sourceDataDto.value = source;

    if (!source || !source.virtual) {
      source.virtual = {};
    }

    const index = autoSaveList.value.findIndex((el) => el.virtual.id === source.virtual.id);
    source.virtual.updatedAt = moment().format("DD.MM.YYYY H:mm:ss");
    if (!source.lastUpdated) {
      source.lastUpdated = Number(moment().add(5, "years").format("x"));
    }
    if (index > -1) {
      autoSaveList.value[index] = source;
    } else {
      const id = uuidv4();
      source.virtual.id = source.id || id;
      source.virtual.createdAt = moment().format("DD.MM.YYYY H:mm:ss");

      autoSaveList.value.push(source);
      if (!source.id && window.location.pathname.indexOf("undefined") === -1) {
        history.pushState(
          {},
          null,
          `${window.location.pathname}/${id}?virtual=true&action=new`
        );
      }
    }
    HelperStorage.ints().set(autoDataStorageKey.value, autoSaveList.value);
  };

  const deleteAutoSaveRecordById = (id) => {
    autoSaveList.value = autoSaveList.value.filter((el) => el.virtual && el.virtual.id !== id);
    HelperStorage.ints().set(autoDataStorageKey.value, autoSaveList.value);
  };

  const findAutoSaveRecordById = (id) => {
    return autoSaveList.value.find((el) => el.virtual && el.virtual.id === id);
  };

  const notFoundVirtualRecord = (ctx, url) => {
    Message({
      duration: 5000,
      type: "warning",
      message: 'That record does not exist. You may have been given a link for a record that was not saved.',
    });
    router.push(url);
  };

  const copyAutoSaveRecord = (source) => {
    const data = JSON.parse(JSON.stringify(source));
    const id = uuidv4();
    data.name += " Copy";
    data.virtual = {
      id,
      createdAt: moment().format("DD.MM.YYYY H:mm:ss"),
      updatedAt: moment().format("DD.MM.YYYY H:mm:ss"),
    };
    autoSaveList.value.push(data);
    HelperStorage.ints().set(autoDataStorageKey.value, autoSaveList.value);
  };

  const clearOldAutoSaveRecords = () => {
    const keyParts = autoDataStorageKey.value.split(":").slice(0, -1).join(":");
    for (const key in localStorage) {
      if (key.indexOf('autoSave:') === -1 || key.indexOf(keyParts) !== -1) continue;
      localStorage.removeItem(key);
    }
  };

  const isAvailableDraft = computed(() => {
    return !!findAutoSaveRecordById(route.params.id);
  });

  const currentAutoSaveRecord = computed(() => {
    return findAutoSaveRecordById(route.params.id);
  });

  const allAutoSaveRecords = computed(() => {
    return autoSaveList.value;
  });

  const autoSaveRecordsForIndex = computed(() => {
    return autoSaveList.value.filter((el) => el.virtual && !el.id);
  });

  return {
    autoDataStorageKey,
    autoSaveList,
    sourceDataDto,
    isEnableAutoSaving,
    autoSave,
    deleteAutoSaveRecordById,
    findAutoSaveRecordById,
    notFoundVirtualRecord,
    copyAutoSaveRecord,
    clearOldAutoSaveRecords,
    isAvailableDraft,
    currentAutoSaveRecord,
    allAutoSaveRecords,
    autoSaveRecordsForIndex,
  };
}
