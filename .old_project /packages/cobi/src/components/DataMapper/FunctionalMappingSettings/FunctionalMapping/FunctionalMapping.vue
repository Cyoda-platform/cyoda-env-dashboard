<template>
  <div ref="rootRef" class="functional-mapping">
    <el-form class="form form-functional-mapping" ref="form" label-position="left" :model="functionalMappingConfig"
             label-width="120px">
      <el-form-item label="Name">
        <el-input v-model="functionalMappingConfig.name"></el-input>
        <div class="hint">
          <strong>Note:</strong>
          If you do not fill this field this field will be generated automatically
        </div>
      </el-form-item>
    </el-form>

    <el-divider/>

    <div v-if="!errorBlocklyNonExistent" class="actions">
      <div class="left">
        <FunctionalMappingSearch :listAllFunctions="listAllFunctions" :listAllTransformers="listAllTransformers"
                                 @change="onChangeFunctionalMappingSearch" :key="functionalMappingSearchKey"/>
        <el-button size="default" @click="onOpenDialogAddVariable" type="warning">
          Add new variable
          <font-awesome-icon icon="plus"></font-awesome-icon>
        </el-button>
        <el-button size="default" @click="onExportXMLBlockly" type="primary">
          Export XML Blockly
          <font-awesome-icon icon="upload"></font-awesome-icon>
        </el-button>
        <el-upload ref="uploadRef" action="#" :on-change="onImportXMLBlockly" :auto-upload="false">
          <template #trigger>
            <el-button size="default" type="success">
              Import XML Blockly
              <font-awesome-icon icon="download"></font-awesome-icon>
            </el-button>
          </template>
        </el-upload>
      </div>
      <div class="left">
        <el-button size="default" @click="onOpenFunctionDescriptions" type="primary">
          Documentation
          <font-awesome-icon icon="file-alt"></font-awesome-icon>
        </el-button>
      </div>
    </div>

    <div v-show="errorBlocklyNonExistent">
      <el-alert show-icon title="Warning" type="warning">
        <span> Error with Non Existent parameters. Recommended to re-generate this block or all blocks<br/> </span>
      </el-alert>
      <div class="regenerate-actions">
        <el-button @click="onRegenerateBlockly">Regenerate current</el-button>
        <el-button @click="onRegenerateBlocklyAll">Regenerate all blocks</el-button>
      </div>
    </div>
    <div v-show="!errorBlocklyNonExistent">
      <div v-loading="isLoadingBlockly"
           @click="clickOnBlocklyMainBackground"
           :style="{ height: `${blocklyHeight}px` }"
           class="blocklyDiv"
           ref="blocklyDivRef">
      </div>

      <CodeDisplay :code="code"/>
    </div>
    <VariableDialog @add="onSaveVariable" ref="variableDialogRef"/>

    <FunctionDescriptionDialog ref="functionDescriptionDialogRef"/>

    <FunctionDescriptionSearchByClassNameDialog :listAllExamplesFunctions="listAllExamplesFunctions"
                                                :listAllFunctions="listAllFunctions"
                                                :listAllTransformers="listAllTransformers"/>

    <CyodaModellingPopUp @change="onChangeModellingPopUp" :limit="1" :checked="checked" :disablePreview="true"
                         ref="cyodaModellingPopUpRef" :requestClass="selectedEntityMapping.entityClass"/>

    <DialogMappingSetModes ref="dialogMappingSetModesRef" @change="onChangeDialogFunctionalMappingSetModes"
                           :collectElemsSetModes="functionalMappingConfigStatement.collectElemsSetModes"
                           :key="dialogMappingSetModesKey" :path="functionalMappingConfigStatement.dstPath"/>
    <FunctionalMappingDiff ref="functionalMappingDiffRef"/>
  </div>
</template>

<script setup lang="ts">
import {ElMessageBox} from "element-plus";
import {usePlatformMappingStore} from "../../../../stores/platform-mapping";
import {
  ref,
  nextTick,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  inject
} from "vue";

import * as Blockly from "blockly/core";
import "../../../../helpers/ConsoleLogHelper.js";

import JSONGenerator from "./generators/json_generator.js";

import "./blocks/FunctionalMappingConfig";
import "./blocks/Expresssions";
import "./blocks/StatementVariables";
import "./blocks/StatementReturn";
import "./blocks/StatementSetDstValue";
import "./blocks/Functions";
import GeneratedFunctions from "./blocks/GeneratedFunctions";
import GeneratedTransformers from "./blocks/GeneratedTransformers";
import VariableDialog from "./VariableDialog.vue";
import FunctionDescriptionDialog from "./FunctionDescription/FunctionDescriptionDialog.vue";

import HelperFunctionalMapping from "../../../../helpers/HelperFunctionalMapping";
import CyodaModellingPopUp from "@cyoda/ui-lib/src/components-library/patterns/CyodaModelling/CyodaModellingPopUp.vue";
import type {ColDef} from "../../../../types/types";
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";
import FileSaver from "file-saver";
import {XMLBuilder, XMLParser} from "fast-xml-parser";
import HelperContent from "../../../../helpers/HelperContent";
import {v4 as uuidv4} from "uuid";
import CodeDisplay from "./CodeDisplay.vue";
import HelperStorage from "../../../../helpers/HelperStorage";
import FunctionDescriptionSearchByClassNameDialog
  from "./FunctionDescription/FunctionDescriptionSearchByClassNameDialog.vue";
import FunctionalMappingSearch from "./FunctionalMappingSearch.vue";
import BlocklyGenerator from "./generators/blockly_generator";
import HelperMapper from "../../../../helpers/HelperMapper";
import DialogMappingSetModes from "../../DialogMappingSetModes.vue";
import FunctionalMappingDiff from "./FunctionalMappingDiff.vue";
import GeneratedDictionaries from "./blocks/GeneratedDictionaries";
import _ from "lodash";
import * as En from 'blockly/msg/en';

import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import FunctionalMapping from "./FunctionalMapping.vue";

const emit = defineEmits(["codeChange", "update:workspace"]);
const rootRef = ref(null);
const props = defineProps({
  functionalMappingConfig: {
    default: () => {
      return {};
    }
  },
  isDialogDragged: {
    default: false
  },
  selectedEntityMapping: {
    default: () => {
      return {};
    }
  },
  blocklyHeight: {
    default: 450
  }
});

const platformMappingStore = usePlatformMappingStore();
const statements = HelperFunctionalMapping.getStatements();
const expressions = computed(() => {
  let expressions = HelperFunctionalMapping.getExpressions();
  if (props.functionalMappingConfig?.srcPaths?.length === 0) {
    expressions = expressions.filter((el) => el.value !== "expression_src_value_read");
  }
  return expressions;
});
const simpleFunctionsName = computed(() => {
  const data: any[] = [];
  const list = filterFunctionsByType("SIMPLE");
  list.forEach((el) => {
    data.push(HelperFunctionalMapping.getFunctionName(el));
  });
  return data;
});
const reduceFunctionsName = computed(() => {
  const data: any[] = [];
  const list = filterFunctionsByType("REDUCE");
  list.forEach((el: any) => {
    data.push(HelperFunctionalMapping.getFunctionName(el));
  });
  return data;
});
const functionsGroupedByType = computed(() => {
  const data: any = {};
  const functions = listAllFunctions.value.filter((el: any) => {
    return !["SIMPLE", "REDUCE"].includes(el.type) && !HelperFunctionalMapping.predefinedFunctions[el.name];
  });
  functions.forEach((el: any) => {
    if (!data[el.type]) {
      data[el.type] = [];
    }
    data[el.type].push(HelperFunctionalMapping.getFunctionName(el));
  });
  return data;
});
const checked = computed(() => {
  if (blocklyBlockDstPath.value && blocklyBlockDstPath.value.value_) {
    return [{fullPath: blocklyBlockDstPath.value.value_}];
  }
  return [];
});

function getListAllFunctions() {
  return platformMappingStore.getListAllFunctions();
}

function getListAllTransformers() {
  return platformMappingStore.getListAllTransformers();
}

function getListExamplesFunctions() {
  return platformMappingStore.getListExamplesFunctions();
}

function getListExamplesTransformers() {
  return platformMappingStore.getListExamplesTransformers();
}

function postSave(dataMappingConfigDto) {
  return platformMappingStore.postSave(dataMappingConfigDto);
}

function getListAllDictionaries() {
  return platformMappingStore.getListAllDictionaries();
}

const blocklyDivRef = ref(null);

const BLOCKLY_COPY_KEY = "BLOCKLY_COPY_KEY";

const cyodaModellingPopUpRef = ref(null);

const variableDialogRef = ref(null);

const functionDescriptionDialogRef = ref(null);

const uploadRef = ref(null);

const dialogMappingSetModesRef = ref(null);

const functionalMappingDiffRef = ref(null);

const getDataMappingConfigDto = inject("getDataMappingConfigDto");

const code = ref<string>("");
const isBlockBlockly = ref<boolean>(false);
let workspace = null;

let listAllFunctions = ref([]);
let listAllTransformers = ref([]);
let listAllDictionaries = ref([]);
let listAllExamplesFunctions = ref([]);
let listAllExamplesTransformers = ref([]);
const blocklyBlockDstPath = ref(null);
const blocklyBlockSetModes = ref(null);
let isExistBlocklyBufferData = ref(!!HelperStorage.ints().get(FunctionalMapping.BLOCKLY_COPY_KEY, false));
let lastContextMenuClickEvent = ref({offsetX: 0, offsetY: 0});
let functionalMappingConfigStatement = ref({
  dstPath: "",
  collectElemsSetModes: []
});

const transformersBlocklyTypes = computed(() => {
  const types = listAllTransformers.value.map((el: any) => {
    let name = el.inType.split(".").pop();
    if (name === "[B") name = "Bytes";
    return name;
  });
  return [...new Set(types)];
});

const isLoadingBlockly = ref<boolean>(false);
const functionalMappingSearchKey = ref(0);
const errorBlocklyNonExistent = ref<boolean>(false);
const dialogMappingSetModesKey = ref(0);
const parentScrollElement = ref(null);


function getToolbox() {
  const contents = [
    {
      kind: "category",
      name: "Statements",
      colour: "#5c80a6",
      contents: statements.map((statement) => {
        return {
          kind: "block",
          type: statement.value
        }
      })
    },
    {
      kind: "category",
      name: "Expressions",
      colour: "#5ba55b",
      contents: expressions.value.map((expression) => {
        return {
          kind: "block",
          type: expression.value
        }
      })
    },
    {
      kind: "category",
      name: "Transformers",
      colour: "#a5745b",
      contents: transformersBlocklyTypes.value.map((type) => {
        return {
          kind: "category",
          name: type,
          contents: transformersBlocklyNamesByType(type).map((transformer) => {
            return {
              kind: "block",
              type: transformer
            }
          })
        }
      })
    },
    {
      kind: "category",
      name: "Functions",
      colour: "#5b68a5",
      contents: [
        {
          kind: "category",
          name: "Simple",
          contents: [
            {
              kind: "block",
              type: "function_simple_concat"
            },
            {
              kind: "block",
              type: "function_simple_equal"
            },
            {
              kind: "block",
              type: "function_simple_if_else"
            },
            {
              kind: "block",
              type: "function_simple_as_map"
            },
            {
              kind: "block",
              type: "function_simple_get_element_by_index"
            },
            {
              kind: "block",
              type: "function_simple_get_element_by_key"
            },
            {
              kind: "block",
              type: "function_simple_sort_comparable_elements"
            },
            {
              kind: "block",
              type: "function_simple_and"
            },
            {
              kind: "block",
              type: "function_simple_or"
            },
            {
              kind: "block",
              type: "function_simple_switch"
            },
            {
              kind: "block",
              type: "function_simple_joinLists"
            },
            {
              kind: "block",
              type: "function_simple_DateToString"
            },
            ...simpleFunctionsName.value.map((funcName) => {
              return {
                kind: "block",
                type: funcName
              }
            })
          ]
        },
        {
          kind: "category",
          name: "Reduce",
          contents: [
            {
              kind: "block",
              type: "function_reduce_elements"
            },
            {
              kind: "block",
              type: "function_reduce_concat_elements"
            },
            {
              kind: "block",
              type: "function_reduce_to_list"
            },
            {
              kind: "block",
              type: "function_reduce_to_map",
              inputs: {
                KEYS: {
                  block: {
                    type: "function_reduce_to_list"
                  }
                },
                VALUES: {
                  block: {
                    type: "function_reduce_to_list"
                  }
                }
              }
            },
            {
              kind: "block",
              type: "function_reduce_to_set"
            },
            ...reduceFunctionsName.value.map((funcName) => {
              return {
                kind: "block",
                type: funcName
              }
            })
          ]
        },
        ...Object.keys(functionsGroupedByType.value).map((name) => {
          return {
            kind: "category",
            name: getNameOfType(name),
            contents: functionsGroupedByType.value[name].map((funcName) => {
              return {
                kind: "block",
                type: funcName
              }
            })
          }
        })
      ]
    },
  ];

  if (listAllDictionaries.value.length.length > 0) {
    contents.push({
      kind: "category",
      name: "Dropdown expressions",
      colour: "#5b68a5",
      contents: listAllDictionaries.value.map((dictionary) => {
        return {
          kind: "category",
          name: dictionary.provider,
          contents: dictionary.entries.map((entry) => {
            return {
              kind: "block",
              type: getDictionaryName(dictionary, entry)
            }
          })
        }
      })
    })
  }
  return {
    "kind": "categoryToolbox",
    contents
  }
}

async function initAllFunctions() {
  const {data} = await getListAllFunctions();
  listAllFunctions.value = data;
  GeneratedFunctions.init(listAllFunctions.value);
}

async function initExamples() {
  const [dataListAllExamplesFunctions, dataListAllExamplesTransformers] = await Promise.all([getListExamplesFunctions(), getListExamplesTransformers()]);
  listAllExamplesFunctions.value = dataListAllExamplesFunctions.data;
  listAllExamplesTransformers.value = dataListAllExamplesTransformers.data;
}

async function initListTransformers() {
  const {data} = await getListAllTransformers();
  listAllTransformers.value = data;
  GeneratedTransformers.init(listAllTransformers.value, () => {
    return workspace;
  });
}

async function initListAllDictionaries() {
  const {data} = await getListAllDictionaries();
  listAllDictionaries.value = data.dictionaries;
  GeneratedDictionaries.init(listAllDictionaries.value);
}

onMounted(async () => {
  errorBlocklyNonExistent.value = false;
  try {
    isLoadingBlockly.value = false;
    await initAllFunctions();
    await initListTransformers();
    await initListAllDictionaries();
  } finally {
    isLoadingBlockly.value = false;
  }
  await nextTick();

  addBlockly();
  addBlocklyEvents();
  addDomBlocklyEventClickBackground();

  blocklyDivRef.value.addEventListener("contextmenu", contextmenu, false);

  eventBus.$on("functionalMapping:use", functionalMappingUse);

  document.addEventListener("wheel", onScrollPageThrottle, {passive: true});
  parentScrollElement.value = getScrollParent(rootRef.value);
  if (parentScrollElement.value) {
    parentScrollElement.value.addEventListener("scroll", onScrollPageThrottle, {passive: true});
  }
});

function getScrollParent(node) {
  if (node == null) {
    return null;
  }

  if (node.scrollHeight > node.clientHeight) {
    return node;
  } else {
    return getScrollParent(node.parentNode);
  }
}

const onScrollPageThrottle = _.throttle(onScrollPage);

function onScrollPage() {
  const blocklyWidgetDiv = document.querySelector(".blocklyWidgetDiv") as HTMLElement;
  if (blocklyWidgetDiv.style.display === "block") {
    blocklyWidgetDiv.style.display = "none";
  }
}

function functionalMappingUse(value) {
  let name = null;
  let transformerKey = null;
  if (value.transformerKey) {
    name = value.name;
    transformerKey = value.transformerKey;
  } else {
    name = value;
  }

  let parentBlock = workspace.newBlock(name);
  const type = parentBlock.getFieldValue("TYPE");
  if (type && transformerKey) {
    parentBlock.setFieldValue(transformerKey, "TYPE");
  }

  parentBlock.initSvg();

  parentBlock.render();
  parentBlock.moveBy(-workspace.scrollX, -workspace.scrollY);
}

function contextmenu(e) {
  lastContextMenuClickEvent.value = e;
}

onBeforeUnmount(() => {
  blocklyDivRef.value.removeEventListener("contextmenu", contextmenu);
  Blockly.ContextMenuRegistry.registry.unregister("copy");
  Blockly.ContextMenuRegistry.registry.unregister("paste");
  Blockly.ContextMenuRegistry.registry.unregister("cobi_help");

  eventBus.$off("functionalMapping:use");
  workspace?.clear();

  window.removeEventListener("wheel", onScrollPageThrottle);
  if (parentScrollElement.value) {
    parentScrollElement.value.removeEventListener("scroll", onScrollPageThrottle);
    parentScrollElement.value = null;
  }
});

async function addBlockly() {
  Blockly.setLocale(En);
  JSONGenerator.vue = {
    functionalMappingConfig: props.functionalMappingConfig,
    onOpenDialogModellingPopUp,
    onOpenDialogSetModesOptions
  }
  const options = {
    grid: {
      spacing: 25,
      length: 3,
      colour: "#ccc"
    },
    zoom: {
      controls: true
    },
    toolbox: getToolbox()
  }

  workspace = Blockly.inject(blocklyDivRef.value, options);
  emit('update:workspace', workspace);

  Blockly.ContextMenuRegistry.registry.register(registerMenuCopy());
  Blockly.ContextMenuRegistry.registry.register(registerMenuPaste());
  Blockly.ContextMenuRegistry.registry.register(registerMenuHelp());

  if (props.functionalMappingConfig?.statements?.length > 0) {
    try {
      setContentToBlockly();
    } catch (e) {
      if (e.message.indexOf("Unknown block type") > -1) {
        workspace.clear();
      } else if (e.message.indexOf("Ignoring non-existent") > -1 || e.message.indexOf("is already in use and its id is") > -1) {
        await nextTick();

        errorBlocklyNonExistent.value = true;
      }
      console.error(e);
    }
  }
}

function setContentToBlockly() {
  const existStatements = HelperMapper.clearAutoGeneratedFields(props.functionalMappingConfig.statements);
  Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(getXmlForBlockly()), workspace);
  let jsonDataGenerated = JSONGenerator.workspaceToCode(workspace);
  if (jsonDataGenerated) {
    jsonDataGenerated = JSON.parse(jsonDataGenerated);
    const generatedStatements = jsonDataGenerated.statements;
    if (JSON.stringify(generatedStatements) !== JSON.stringify(existStatements)) {
      functionalMappingDiffRef.value.openForm(existStatements, generatedStatements);
    }
  }
}

function fixErrorWithDuplicateVariables(content) {
  const dataXmlObj = parseXml(content);
  const duplacateNames = {};
  if (!dataXmlObj.xml.variables) return content;

  const varaiables = Array.isArray(dataXmlObj.xml.variables.variable) ? dataXmlObj.xml.variables.variable : [dataXmlObj.xml.variables.variable];
  varaiables.forEach((variable) => {
    const name = variable["#text"];
    const id = variable["@_id"];
    if (duplacateNames[name] === undefined) {
      duplacateNames[name] = [id];
    } else {
      duplacateNames[name].push(id);
    }
  });

  let isWasDuplicateVariables = false;

  Object.values(duplacateNames).forEach((ids: string[]) => {
    if (ids.length > 1) {
      ids.forEach((id, index) => {
        if (index > 0) {
          content.replaceAll(id, ids[0]);
          dataXmlObj.xml.variables.variable = dataXmlObj.xml.variables.variable.filter((el) => el["@_id"] !== id);
          isWasDuplicateVariables = true;
        }
      });
    }
  });

  if (isWasDuplicateVariables) {
    const dataXmlObjTmp = parseXml(content);
    dataXmlObjTmp.xml.variables.variable = dataXmlObj.xml.variables.variable;
    return buildXml(dataXmlObjTmp);
  }
  return content;
}

function parseXml(dataXml: string) {
  const parserXml = new XMLParser({
    ignoreAttributes: false,
    numberParseOptions: {
      leadingZeros: false,
      hex: false
    }
  });
  return parserXml.parse(dataXml);
}

function buildXml(dataXmlObj) {
  const builderXml = new XMLBuilder({
    ignoreAttributes: false
  });
  return builderXml.build(dataXmlObj);
}

let isVarCreate = false;

function addBlocklyEvents() {
  workspace.addChangeListener((event) => {
    if (isBlockBlockly.value) return;

    if (event.type === "var_create" && workspace) {
      isVarCreate = true;
    }

    if (event.type === "move" && !isBlockBlockly.value && workspace && event.oldCoordinate.x < -100) {
      isBlockBlockly.value = true;
      isVarCreate = false;
      const dataXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
      workspace.clear();
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(dataXml), workspace);
      setTimeout(() => {
        isBlockBlockly.value = false;
      }, 500);
    }

    code.value = JSONGenerator.workspaceToCode(workspace);
    emit("codeChange", code.value);
  });
}

function addDomBlocklyEventClickBackground() {
  workspace.toolbox.flyout.autoClose = false;
}

// function clickOnBlocklyToolboxContents() {
//   workspace.toolbox_.flyout_.autoClose = false;
//   setTimeout(() => {
//     workspace.recordDragTargets();
//   }, 100);
// }

function clickOnBlocklyMainBackground(event) {
  const blocklyMainBackground = rootRef.value.querySelector(".blocklyMainBackground")!;
  const blocklyFlyoutBackground = rootRef.value.querySelector(".blocklyFlyoutBackground")!;

  if (blocklyMainBackground.contains(event.target) && !blocklyFlyoutBackground.contains(event.target)) {
    workspace.toolbox.flyout.autoClose = false;

    workspace.toolbox.clearSelection();

    workspace.recordDragTargets();
  }
}

function onOpenDialogAddVariable() {
  variableDialogRef.value.dialogVisible = true;
}

function onOpenFunctionDescriptions() {
  functionDescriptionDialogRef.value.dialogVisible = true;
}

function getXmlForBlockly() {
  const dataMappingConfigDto = JSON.parse(JSON.stringify(getDataMappingConfigDto()));
  const selectedEntityMapping = JSON.parse(JSON.stringify(props.selectedEntityMapping));
  selectedEntityMapping.functionalMappings = [props.functionalMappingConfig];
  dataMappingConfigDto.entityMappings = [selectedEntityMapping];

  const generator = new BlocklyGenerator();
  generator.setMappingConfigDto(dataMappingConfigDto);
  generator.setAllFunctions(listAllFunctions.value);
  generator.setAllTransformers(listAllTransformers.value);
  generator.setAllDictionaries(listAllDictionaries.value);
  const result = generator.transform();
  if (Object.values(result).length == 0) return null;
  let blocklyXml: any = Object.values(result)[0];
  return fixErrorWithDuplicateVariables(blocklyXml);
}

function onRegenerateBlockly() {
  return true;
}

function onRegenerateBlocklyAll() {
  ElMessageBox.confirm("Will be done restore blockly, save and refresh page. Continue?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning"
  }).then(async () => {
    let dataMappingConfigDto: any = JSON.parse(JSON.stringify(getDataMappingConfigDto()));
    const generator = new BlocklyGenerator();
    generator.setMappingConfigDto(dataMappingConfigDto);
    generator.setAllFunctions(listAllFunctions.value);
    generator.setAllTransformers(listAllTransformers.value);
    generator.setAllDictionaries(listAllDictionaries.value);
    dataMappingConfigDto = HelperMapper.mappingConfigDtoConvertToBackend(dataMappingConfigDto);
    dataMappingConfigDto.metadata = JSON.stringify(generator.transform());
    await postSave(dataMappingConfigDto);
    document.location.reload();
  });
}

function onSaveVariable(name) {
  workspace.createVariable(name);
}

function filterFunctionsByType(type: "SIMPLE" | "REDUCE") {
  return listAllFunctions.value.filter((el: any) => {
    return el.type === type && !HelperFunctionalMapping.predefinedFunctions[el.name];
  });
}

function getNameOfType(name: string) {
  return name[0].toUpperCase() + name.toLowerCase().substring(1);
}

function onChangeModellingPopUp(checkedDatas: ColDef[]) {
  blocklyBlockDstPath.value.setValue(checkedDatas[0].fullPath);
  blocklyBlockDstPath.value = null;
}

function onOpenDialogModellingPopUp(inst) {
  blocklyBlockDstPath.value = inst;
  cyodaModellingPopUpRef.value.dialogVisible = true;
}

function onOpenDialogSetModesOptions(field) {
  const dstPath = field.getSourceBlock().getFieldValue("DST_PATH");
  const dstSetModes = field.getSourceBlock().getFieldValue("DST_SET_MODES");
  blocklyBlockSetModes.value = field;
  functionalMappingConfigStatement.value.dstPath = dstPath;
  functionalMappingConfigStatement.value.collectElemsSetModes = JSON.parse(dstSetModes || "[]");
  dialogMappingSetModesKey.value += 1;
  setTimeout(() => {
    dialogMappingSetModesRef.value.dialogVisible = true;
  }, 200);
}

function onChangeDialogFunctionalMappingSetModes(value) {
  blocklyBlockSetModes.value.getSourceBlock().getField("DST_SET_MODES").setValue(JSON.stringify(value));
}

function transformersBlocklyNamesByType(type) {
  const values = listAllTransformers.value
    .filter((el: any) => {
      if (type === "Bytes") return el.inType.indexOf(`[B`) > -1;
      return el.inType.indexOf(`.${type}`) > -1;
    })
    .map((el) => {
      return HelperFunctionalMapping.getTransformerName(el);
    });
  return _.uniq(values);
}

function getDictionaryName(dictionary, entry) {
  return HelperFunctionalMapping.getDictionaryName(dictionary, entry);
}

function shortNamePath(name: string) {
  return HelperFormat.shortNamePath(name);
}

function onExportXMLBlockly() {
  const dataXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
  const file = new File([dataXml], `export_blockly.xml`, {type: "text/plain;charset=utf-8"});
  FileSaver(file, file.name, {autoBom: false});
}

function onImportXMLBlockly(file) {
  let reader = new FileReader();
  reader.readAsText(file.raw);
  reader.onload = () => {
    const rawData = (reader as any).result;
    workspace.clear();
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(rawData), workspace);
  };
  uploadRef.value.clearFiles();
}

function registerMenuCopy() {
  return {
    displayText: "Copy Block",
    preconditionFn: () => {
      return "enabled";
    },
    callback: (scope) => {
      const dataDom = Blockly.Xml.blockToDom(scope.block, true);
      const dataText = Blockly.Xml.domToText(dataDom);
      HelperStorage.ints().set(FunctionalMapping.BLOCKLY_COPY_KEY, dataText);
      isExistBlocklyBufferData.value = true;
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: "copy",
    weight: 100
  };
}

function registerMenuPaste() {
  return {
    displayText: "Paste Block",
    preconditionFn: () => {
      return isExistBlocklyBufferData.value ? "enabled" : "disabled";
    },
    callback: (scope) => {
      const rawData = HelperStorage.ints().get(FunctionalMapping.BLOCKLY_COPY_KEY);
      const dom = Blockly.utils.xml.textToDom(rawData);
      const block = Blockly.Xml.domToBlock(dom, scope.workspace);
      const toolboxWidth = scope.workspace.toolbox.width_;
      const flyoutWidth = scope.workspace.toolbox.flyout.width_;
      block.moveBy(lastContextMenuClickEvent.value.offsetX - toolboxWidth - scope.workspace.scrollX - flyoutWidth, lastContextMenuClickEvent.value.offsetY - scope.workspace.scrollY);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: "paste",
    weight: 100
  };
}

function registerMenuHelp() {
  return {
    displayText: "Help",
    preconditionFn: (scope) => {
      return scope.block.type.indexOf("function_") > -1 || scope.block.type.indexOf("transformer_") > -1 ? "enabled" : "hidden";
    },
    callback: (scope) => {
      const data = JSON.parse(JSONGenerator.blockToCode(scope.block)[0].trim());
      const dataObj = {type: "", functionClass: ""};
      if (data.functionClass.indexOf("TransformValue") > -1) {
        dataObj.type = "transformer";
        dataObj.functionClass = data.args[0].value;
      } else {
        dataObj.type = "function";
        dataObj.functionClass = data.functionClass;
      }
      eventBus.$emit("functionDescriptionDialog:search", dataObj);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: "cobi_help",
    weight: 101
  };
}

function onChangeFunctionalMappingSearch(item) {
  const function_name = item.pop();
  functionalMappingUse(function_name);
  functionalMappingSearchKey.value += 1;
}

function getBlocksByType(type) {
  const blocks = [];

  for (const block of workspace.getAllBlocks()) {
    if (block.type == type) {
      blocks.push(block);
    }
  }
  return blocks;
}

watch(
  () => props.isDialogDragged,
  (value) => {
    if (value) {
      onScrollPage();
    }
  }
);

defineExpose({isBlockBlockly, code, workspace, getBlocksByType});
</script>

<style lang="scss">
.functional-mapping {
  .el-cascader {
    margin-right: 15px;
  }

  .blocklyDiv {
    height: 450px;
    width: 100%;
    text-align: left;
  }

  .actions {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;

    .left {
      display: flex;

      button {
        margin-right: 15px;
        margin-left: 0;
      }
    }
  }

  .el-upload-list {
    display: none;
  }

  .form label {
    padding: 0;
  }

  .el-divider {
    margin: 10px 0;
  }

  .form-functional-mapping {
    .el-form-item {
      display: flex;
      margin-bottom: 0;
      width: 100%;
    }

    .el-form-item__content {
      flex-grow: 1;
      margin-left: 0 !important;
    }
  }

  .regenerate-actions {
    margin-top: 15px;
  }
}
</style>
