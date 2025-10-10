<template>
  <div v-show="isSearchCondition" class="cyoda-modelling-item" :class="computedEntityViewerClass">
    <div :class="{ inner: true, 'checked-path': getChecked, 'inner-related': joinItem }">
      <el-tooltip class="item" effect="dark" :content="label.fullPath" placement="top">
        <font-awesome-icon
          @click="onClickEye"
          class="eye"
          :class="{
            'is-leaf': reportInfoRow.type === 'LEAF' && onlyDynamic,
            'is-joins': isJoinAvailable
          }"
          icon="eye"
        />
      </el-tooltip>
      <span v-if="isChildAvailable" @click="onClick">
        <font-awesome-icon v-if="isShowGroupClass" :icon="['fas', 'caret-down']"/>
        <font-awesome-icon v-else :icon="['fas', 'caret-right']"/>
      </span>

      <font-awesome-icon @click="onClickJoin" class="join-link"
                         :class="{ active: isShowJoin || !disableJoinView, disabled: disableJoinView }"
                         v-if="isJoinAvailable" icon="link"/>

      <template v-if="canBeSelected && onlyView === false">
        <el-checkbox :disabled="isDisabled" :key="fullPath" :label="label" :class="{ 'no-child': !isChildAvailable }">
          {{ reportInfoRow.columnName }}
          <template v-if="isMap">
            <el-tooltip
              :show-after="500"
              class="item"
              effect="dark"
              content="To select multiple keys for map fields, please use Aliases"
              placement="top">
              <font-awesome-icon :icon="['fas', 'circle-info']"/>
            </el-tooltip>
          </template>
          <span v-if="isJoinAvailable"> ({{ HelperEntities.getShortNameOfEntity(joinItem.targetEntityClass) }})</span>
        </el-checkbox>
      </template>
      <template v-else>
        <span class="name">
          <el-link v-if="isChildAvailable" @click="onClick">
            {{ reportInfoRow.columnName }}
          </el-link>
          <template v-else>
            <template v-if="isJoinAvailable && onlyView">
              <el-link class="wrap-join-link" @click="onClickJoin" type="primary">
                {{ reportInfoRow.columnName }}
                ({{ HelperEntities.getShortNameOfEntity(joinItem.targetEntityClass) }})
              </el-link>
            </template>
            <template v-else>
              {{ reportInfoRow.columnName }}
            </template>
          </template>
        </span>
      </template>

      <div class="wrap-form" v-if="isAvailableForm && getTypes.length > 0 && onlyView === false">
        <CyodaModellingItemClassForm class="inner-form" :isAvailableSubmit="false" :types="getTypes" :values="values"
                                     @change="onChangeForm"/>
      </div>
    </div>
    <template v-if="isChildAvailable">
      <CyodaModellingGroupClass :disablePreview="disablePreview" :onlyView="onlyView" :onlyRange="onlyRange"
                                :isOpenAllSelected="isOpenAllSelected" :isCondenseThePaths="isCondenseThePaths"
                                :search="search" :limit="limit" :checked="checked" v-show="isShowGroupClass"
                                :type="reportInfoRow.type" :requestClass="requestClass"
                                :requestParams="allRequestParams" :parentColDef="parentColDef"/>
    </template>
    <template v-if="isJoinAvailable">
      <CyodaModellingGroup class="inner-group" v-if="isShowJoin" :disablePreview="disablePreview" :onlyRange="onlyRange"
                           :limit="limit" :isOpenAllSelected="isOpenAllSelected"
                           :isCondenseThePaths="isCondenseThePaths" :search="search" :checked="checked"
                           :requestClass="joinItem.targetEntityClass" :reportInfoRows="reportingInfoRows"
                           :relatedPaths="relatedPathsInner" :parentColDef="joinItem && label"/>
    </template>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, nextTick, computed, watch} from "vue";

import CyodaModellingGroupClass from "./CyodaModellingGroupClass.vue";
import {
  ColDefValue,
  ReportingInfoRow,
  RequestParam
} from "../../../types/types";
import CyodaModellingItemClassForm from "./Forms/CyodaModellingItemClassForm.vue";

import * as api from "../../../api";
import HelperModelling from "../../../helpers/HelperModelling";
import HelperFormat from "../../../helpers/HelperFormat";
import {useModellingStore} from "../../../stores/modelling";
import {useEntityViewerStore} from "../../../stores/entity-viewer";
import CyodaModellingGroup from "./CyodaModellingGroup.vue";
import eventBus from "../../../plugins/eventBus";
import HelperEntities from "../../../helpers/HelperEntities";

const props = defineProps({
  reportInfoRow: {
    default: () => {
      return {};
    }
  },
  requestClass: {
    default: ""
  },
  checked: {
    default: () => {
      return [];
    }
  },
  limit: {
    default: null
  },
  onlyRange: {
    default: false
  },
  isOpenAllSelected: {
    default: false
  },
  isCondenseThePaths: {
    default: false
  },
  search: {
    default: ""
  },
  relatedPaths: {
    default: () => {
      return [];
    }
  },
  parentColDef: {
    default: () => {
      return {};
    }
  },
  onlyView: {
    default: false
  },
  disablePreview: {
    default: false
  }
});
const modellingStore = useModellingStore();
const entityViewerStore = useEntityViewerStore();

const searchResult = computed(() => {
  return modellingStore.searchResult;
});
const entitys = computed(() => {
  return entityViewerStore.entitys;
});
const onlyDynamic = computed(() => {
  return entityViewerStore.onlyDynamic;
});
const disableJoinView = computed(() => {
  return entitys.value.find((el) => el.to === joinItem.value!.targetEntityClass);
});
const computedEntityViewerClass = computed(() => {
  let classes = [];
  if (joinItem.value) {
    classes = [`related-${HelperEntities.getShortNameOfEntity(joinItem.value.targetEntityClass)}`];
    if (disableJoinView.value) {
      classes.push("rel-active");
    }
  } else {
    if (isGenericField.value) {
      classes.push("generic-field");
    }
  }
  return classes.join(" ");
});
const isChildAvailable = computed(() => {
  let element: ReportingInfoRow = {} as ReportingInfoRow;
  if (props.reportInfoRow.elementInfo) {
    element = props.reportInfoRow.elementInfo;
  }
  if (props.reportInfoRow.elementType) {
    element = props.reportInfoRow.elementType;
  }
  return notPrimitiveList.includes(props.reportInfoRow.type) && element.type !== "LEAF";
});
const isJoinAvailable = computed(() => {
  return joinItem.value && Object.keys(joinItem.value).length > 0;
});
const joinItem = computed(() => {
  return props.relatedPaths.find((el) => el.columnPath.replace(".[*]", "") === props.reportInfoRow.columnName);
});
const canBeSelected = computed(() => {
  if (props.reportInfoRow.type === "LEAF") {
    return true;
  }
  if (props.reportInfoRow.elementInfo) {
    return props.reportInfoRow.elementInfo.type === "LEAF";
  }
  if (props.reportInfoRow.elementType) {
    return props.reportInfoRow.elementType.type === "LEAF";
  }
  return false;
});
const allRequestParams = computed(() => {
  let allRequestParams: RequestParam[] = [];
  if (isChildAvailable.value) {
    if (notPrimitiveList.includes(props.reportInfoRow.type)) {
      allRequestParams = getClasses(props.reportInfoRow, props.reportInfoRow.columnPath);
      allRequestParams.sort((a, b) => {
        if (a.columnPath > b.columnPath) {
          return 1;
        }
        if (a.columnPath < b.columnPath) {
          return -1;
        }
        return 0;
      });
    }
  }
  return allRequestParams;
});
const isDisabled = computed(() => {
  if (props.limit) {
    return props.checked.length >= props.limit && !getChecked.value;
  }
  return false;
});
const getTypes = computed(() => {
  const types: string[] = [];
  if (props.reportInfoRow.type === "LIST") {
    types.push("Integer");
  }
  if (props.reportInfoRow.type === "MAP" && props.reportInfoRow.keyInfo) {
    const type = props.reportInfoRow.keyInfo.split(".").pop();
    types.push(type!);
  }
  return types;
});
const isAvailableForm = computed(() => {
  let isAvailable = false;
  if (props.reportInfoRow.elementType && props.reportInfoRow.elementType.type === "LEAF") {
    isAvailable = true;
  }

  if (props.reportInfoRow.elementInfo && props.reportInfoRow.elementInfo.type === "LEAF") {
    isAvailable = true;
  }
  return isAvailable;
});
const getChecked = computed(() => {
  return props.checked.find((path) => {
    const selectedPathBySegments = path.fullPath.replace(/\.\[[^]]*\]/g, "").split(/@|\./);
    const fullPathOfRowSegments = fullPath.value.replace(/\.\[[^]]*\]/g, "").split(/@|\./);
    for (let i = 0; i < fullPathOfRowSegments.length; i++) {
      if (selectedPathBySegments[i] !== fullPathOfRowSegments[i]) {
        return false;
      }
    }
    return true;
  });
});
const fullPath = computed(() => {
  const path: string[] = [];
  if (props.parentColDef.fullPath) {
    path.push(props.parentColDef.fullPath);
  }
  path.push(getElement().columnPath);
  return path.join(".");
});
const isSearchCondition = computed(() => {
  if (!props.search) {
    return true;
  }
  return searchResult.value.some((path: string) => {
    let result = false;
    if (path.indexOf("@") !== -1) {
      let compareString = props.reportInfoRow.columnPath;
      if (compareString.indexOf("@") === -1) {
        compareString += "@";
      }
      result = path.indexOf(compareString) !== -1;
    } else {
      result = path.indexOf(props.reportInfoRow.columnPath) !== -1;
    }
    if (result) {
      isShowGroupClass.value = true;
      isShowJoin.value = true;
    }
    return result;
  });
});

function addSearchPath(fullPath) {
  return modellingStore.addSearchPath(fullPath);
}

function removeSearchPath(fullPath) {
  return modellingStore.removeSearchPath(fullPath);
}

function addEntity(value) {
  return entityViewerStore.addEntity(value);
}

let relatedPathsInner = ref([]);

let label = ref({});

const isShowGroupClass = ref<boolean>(false);

const isShowJoin = ref<boolean>(false);

let notPrimitiveList = reactive(["EMBEDDED", "LIST", "MAP"]);

let values = ref([]);

let reportingInfoRows = ref([]);

fillForm();

const isMap = computed(() => {
  return props.reportInfoRow.type === "MAP";
});

function fillForm() {
  const checked = getChecked.value;
  if (getTypes.value.length > 0 && checked) {
    const selectedPathBySegments = checked.fullPath.replace(/\[|\]/g, "").replace('..', `.$|dot|`).split(/@|\./).filter(el => el);
    const fullPathOfRowSegments = fullPath.value.replace(/\[|\]/g, "").split(/@|\./).filter(el => el);

    const result = selectedPathBySegments[fullPathOfRowSegments.length - 1];

    if (result && result.length > 0) {
      values.value.push(result.replace('$|dot|', '.'));
    }
  } else {
    values.value = [];
  }
}

function onClick() {
  if (isGenericField.value) return;
  isShowGroupClass.value = !isShowGroupClass.value;
}

async function onClickJoin() {
  if (props.onlyView) {
    if (!disableJoinView.value) {
      addEntity({
        from: props.requestClass,
        to: joinItem.value!.targetEntityClass
      });
    }
  } else {
    isShowJoin.value = !isShowJoin.value;
  }
}

function onChangeForm(form: string[]) {
  const columnPath = `${props.reportInfoRow.columnPath}.[${form[0]}]`;
  let columnPathWithNameSpace = columnPath;
  if (props.parentColDef.fullPath) {
    columnPathWithNameSpace = `${props.parentColDef.fullPath}.${columnPath}`;
  }
  const value = label.value.parts.value[label.value.parts.value.length - 1];
  label.value.fullPath = label.value.fullPath.replace(label.value.fullPath, columnPathWithNameSpace);
  if (value) {
    value.path = columnPath;
  }
}

function getElement() {
  let element = props.reportInfoRow;
  if (element.elementType) {
    element = element.elementType;
  }
  if (element.elementInfo) {
    element = element.elementInfo;
  }
  return element;
}

const isGenericField = computed(() => {
  let element = props.reportInfoRow;
  if (element.declaredClass) return false;
  if (element.elementInfo) return false;
  if (element.clazzType) return false;
  return element && !element.elementType;
});

function getClasses(row: ReportingInfoRow, baseColumnPath: string, types: string[] = []) {
  const allRequestParams: RequestParam[] = [];
  if (row.declaredClass) {
    allRequestParams.push({
      reportClass: row.declaredClass.class,
      columnPath: row.columnPath,
      requestClass: props.requestClass,
      types,
      baseColumnPath
    });
  }

  if (row.subClasses) {
    row.subClasses.forEach((el) => {
      allRequestParams.push({
        reportClass: el.class,
        columnPath: row.columnPath,
        requestClass: props.requestClass,
        types,
        baseColumnPath
      });
    });
  }

  if (row.elementType) {
    if (row.keyInfo) {
      const type = row.keyInfo.split(".").pop();

      types.push(type);
    }
    allRequestParams.push(...getClasses(row.elementType, baseColumnPath, types));
  }

  if (row.elementInfo) {
    types.push("Integer");
    allRequestParams.push(...getClasses(row.elementInfo, baseColumnPath, types));
  }
  if (allRequestParams.length > 0) {
    addReportClassShort(allRequestParams);
  }
  return allRequestParams;
}

function addReportClassShort(allRequestParams: RequestParam[]) {
  const exampleArr = allRequestParams[0].reportClass.split(".");
  const length = allRequestParams.length;
  let strForSearch = "";
  for (const curr of exampleArr) {
    let foundNum = 0;
    allRequestParams.forEach((el) => {
      if (el.reportClass.includes(`${curr}.`)) {
        foundNum += 1;
      }
    });
    if (foundNum === length) {
      strForSearch += `${curr}.`;
    } else {
      break;
    }
  }
  allRequestParams.forEach((el) => {
    el.reportClassShort = el.reportClass.replace(strForSearch, "");
  });
}

watch(
  () => props.reportInfoRow,
  () => {
    const element = getElement();
    const checked = getChecked.value;
    if (checked && checked.fullPath.replace(/\.\[.*\]/g, "") === fullPath.value.replace(/\.\[.*\]/g, "")) {
      label.value = checked;
    } else {
      let parentPartsValue: ColDefValue[] = [];
      if (props.parentColDef && Object.keys(props.parentColDef).length > 0) {
        parentPartsValue = props.parentColDef.parts.value;
      }
      label.value = {
        fullPath: fullPath.value,
        parts: {
          "@meta": "com.cyoda.core.reports.columndefs.ReportColPartDef[]",
          value: [
            ...parentPartsValue,
            {
              rootClass: props.requestClass,
              path: element.columnPath,
              type: element.clazzType!
            }
          ]
        },
        colType: element.clazzType!
      };
    }
  },
  {immediate: true}
);

watch(
  () => props.search,
  () => {
    if (props.search && props.reportInfoRow.columnName.toLowerCase().indexOf(props.search.toLowerCase()) !== -1) {
      if (searchResult.value.indexOf(fullPath.value) === -1) {
        addSearchPath(fullPath.value);
      }
    } else if (searchResult.value.indexOf(fullPath.value) !== -1) {
      removeSearchPath(fullPath.value);
    }
  }
);

watch(fullPath, (val) => {
  label.value.fullPath = val;
});

watch([isShowJoin, joinItem], async () => {
  if (isShowJoin.value && joinItem.value && joinItem.value.targetEntityClass) {
    const {data} = await api.getReportingInfo(joinItem.value.targetEntityClass, "", "", props.onlyRange);
    reportingInfoRows.value = HelperModelling.sortData(HelperModelling.filterData(data));
    const {data: relatedData} = await api.getReportingRelatedPaths(joinItem.value.targetEntityClass);
    relatedPathsInner.value = relatedData;
  }
}, {immediate: true});

async function onClickEye() {
  if (props.reportInfoRow.type !== "LEAF" || !onlyDynamic.value || props.disablePreview) {
    return;
  }

  const element = getElement();
  let parentPartsValue: ColDefValue[] = [];
  if (props.parentColDef && Object.keys(props.parentColDef).length > 0) {
    parentPartsValue = props.parentColDef.parts.value;
  }

  const requestClass = (props.parentColDef && props.parentColDef.parts && props.parentColDef.parts.value[0].rootClass) || props.requestClass;
  const configDefinitionRequest = {
    "@bean": "com.cyoda.core.streamdata.StreamDataRequest",
    sdDef: {
      requestClass,
      rangeCondition: {
        "@bean": "com.cyoda.core.conditions.queryable.GreaterThan",
        fieldName: "creationDate",
        operation: "GREATER_THAN",
        value: {
          "@type": "java.util.Date",
          value: "1900-01-01T00:00:00.000+03:00"
        }
      },
      rangeOrder: "ASC",
      condition: {
        "@bean": "com.cyoda.core.conditions.GroupCondition",
        operator: "AND",
        conditions: []
      },
      columns: [
        {
          "@bean": "com.cyoda.core.reports.columns.ReportSimpleColumn",
          name: label.value.fullPath,
        }
      ],
      colDefs: [
        {
          fullPath: label.value.fullPath,
          parts: {
            "@meta": "com.cyoda.core.reports.columndefs.ReportColPartDef[]",
            value: [
              ...parentPartsValue,
              {
                rootClass: props.requestClass,
                path: element.columnPath,
                type: element.clazzType!
              }
            ]
          },
          colType: label.value.colType
        }
      ],
      aliasDefs: []
    },
    pointTime: null,
    offset: 0,
    length: 100,
    fromPosIndex: 0
  };

  eventBus.$emit('streamGrid:open', {
    configDefinitionRequest,
    title: `Unique values for "${HelperFormat.shortNamePath(label.value.fullPath)}" for 100 rows`,
  });
}

watch(
  () => props.isOpenAllSelected,
  (val: boolean) => {
    if (val && getChecked.value) {
      onClick();
      onClickJoin();
    }
    if (!val && getChecked.value) {
      isShowGroupClass.value = false;
      isShowJoin.value = false;
    }
  },
  {immediate: true}
);
</script>

<style lang="scss">
.cyoda-modelling-item {
  position: relative;
  margin-bottom: 10px;
  margin-top: 10px;

  .name a {
    color: #000;
    height: 19px;
    margin-left: 5px;
  }

  .generic-field {
    display: none;

    svg {
      display: none;
    }

    .name a {
      color: #a8a8a8;
    }

    .eye {
      display: none !important;
    }
  }

  .inner-form {
    position: absolute;
    right: 0;
    top: -4px;
  }

  .no-child {
    margin-left: 0px;
  }

  .icon {
    margin-right: 5px;
  }

  .inner {
    /*display: flex;*/
    padding-left: 18px;
    position: relative;
    margin-bottom: 2px;
    display: inline-block;
    padding-right: 180px;
    font-size: 14px;
    vertical-align: middle;
  }

  .inner-related {
    padding-left: 42px;
    margin-left: -22px;

    > .el-checkbox {
      margin-left: 4px;
    }
  }

  .el-checkbox {
    height: 19px !important;
  }

  .inner:hover .eye {
    display: inline-block;
  }

  .eye {
    color: #bcbcbc;
    display: none;
    position: absolute;
    font-size: 14px;
    left: 0;
    top: 3px;
    cursor: pointer;

    &.is-leaf {
      color: #409eff;
    }
  }

  .wrap-form {
    width: 150px;
    margin-left: 10px;
  }

  > .checked-path {
    color: #409eff !important;

    > div > .name > a {
      color: #409eff !important;
    }

    > svg {
      color: #409eff !important;
    }

    & > .el-checkbox, & > div > .el-checkbox {
      color: #409eff !important;
    }

    & > .name a {
      color: #409eff !important;
    }

    .el-link--inner {
      color: #409eff !important;
    }
  }

  .join-link {
    margin-left: -21px;
    margin-right: 1px;
    opacity: 0.5;
    cursor: pointer;

    &.active {
      opacity: 1;
    }

    &.disabled {
      opacity: 0.5;
    }
  }

  .inner-group {
    padding-left: 40px;
  }

  &.rel-active .name {
    opacity: 0.5;
    font-weight: bold;
  }

  .wrap-join-link {
    padding-left: 7px;
    overflow: visible;
  }
}
</style>
