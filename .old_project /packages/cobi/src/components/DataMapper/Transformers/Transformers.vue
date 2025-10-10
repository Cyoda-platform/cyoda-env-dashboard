<template>
  <div class="transformers">
    <div class="dialog-title-info" v-if="column.srcColumnPath">
      <div><strong>Relation:</strong> {{ column.srcColumnPath }} -> {{ shortNamePath(column.dstCyodaColumnPath) }}<br/>
      </div>
      <div><strong>Final Type:</strong> {{ column.dstCyodaColumnPathType.split(".").pop().toLowerCase() }}</div>
      <div>
        <strong>Inbound data:</strong>
        {{ getInboundData }} ({{ inboundTypeOfData }})
      </div>
    </div>
    <div class="text-right">
      <el-button size="default" @click="onOpenFunctionDescriptions" type="primary">
        Documentation
        <font-awesome-icon icon="file-alt"></font-awesome-icon>
      </el-button>
    </div>
    <el-form-item v-show="false" :rules="{ validator: checkLastTransform }" prop="lastTransform"></el-form-item>
    <template v-if="transformer.children.length == 0">
      <el-empty description="no transformers yet">
        <el-button @click="onAdd" type="primary">
          Add Transformer
          <font-awesome-icon icon="plus"/>
        </el-button>
      </el-empty>
    </template>
    <template v-else>
      <div v-for="(children, indexChildren) in transformer.children" :key="indexChildren">
        <h3>Transformer {{ indexChildren + 1 }}</h3>
        <TransformerChildren @delete="onDeleteTransformer(indexChildren)"
                             :previousTransformer="getPreviousTransformer(transformer.children[indexChildren - 1], indexChildren)"
                             :indexChildren="indexChildren" :addFirst="addFirst" :children="children"/>
        <el-divider></el-divider>
      </div>
      <el-button @click="onAdd" type="primary">
        Add Transformer
        <font-awesome-icon icon="plus"/>
      </el-button>
    </template>
    <FunctionDescriptionDialog :isShowUseBtn="false" :isShowFunctions="false" ref="functionDescriptionDialogRef"/>
  </div>
</template>

<script setup lang="ts">
import {usePlatformMappingStore} from "../../../stores/platform-mapping";
import {ref, computed, onMounted, provide} from "vue";

import TransformerChildren from "../../../components/DataMapper/Transformers/TransformerChildren.vue";

import HelperFormat from "../../../helpers/HelperFormat";
import HelperMapper from "../../../helpers/HelperMapper";
import FunctionDescriptionDialog
  from "../FunctionalMappingSettings/FunctionalMapping/FunctionDescription/FunctionDescriptionDialog.vue";

const props = defineProps({
  transformer: {
    default: () => {
      return {};
    }
  },
  addFirst: {
    default: false
  },
  column: {
    default: () => {
      return {};
    },
    required: true
  }
});
const platformMappingStore = usePlatformMappingStore();
const listAllTransformers = computed(() => {
  return platformMappingStore.listAllTransformers;
});
const sourceDataComputed = computed(() => {
  return platformMappingStore.sourceDataComputed;
});
const isHaveErrorWithLastType = computed(() => {
  const lastTransformer = props.transformer.children[props.transformer.children.length - 1];
  if (!lastTransformer) return false;
  const transformer = listAllTransformers.value.find((el: any) => el.transformerKey === lastTransformer.transformerKey);
  if (transformer) {
    if (transformer.outType !== props.column.dstCyodaColumnPathType) {
      return true;
    }
  }
  return false;
});
const getInboundData = computed(() => {
  if (!props.column.srcColumnPath) return "";
  return HelperMapper.getValueFromSourceData(sourceDataComputed.value, props.column.srcColumnPath, platformMappingStore.dataType);
});

provide('getInboundData', getInboundData);

const inboundTypeOfData = computed(() => {
  if (!props.column.srcColumnPath) return "";
  return HelperMapper.getTypeOfData(getInboundData.value, props.column.srcColumnPath, platformMappingStore.dataType);
});

const functionDescriptionDialogRef = ref(null);

const dialogVisible = ref<boolean>(false);

onMounted(() => {
  if (props.addFirst && props.transformer.children.length == 0) {
    onAdd();
  }
});

function onAdd() {
  props.transformer.children.push({
    type: "SINGLE",
    transformerKey: "",
    parameters: []
  });
}

function getPreviousTransformer(child: any, index: number) {
  if (index == 0) {
    return {
      inType: "",
      outType: "java.lang.Object",
      description: "",
      requiredParameters: []
    };
  }
  return listAllTransformers.value.find((el: any) => el.transformerKey == child.transformerKey);
}

function onDeleteTransformer(index: number) {
  props.transformer.children.splice(index, 1);
}

function checkLastTransform(rule: any, value: any, callback: any) {
  if (props.transformer.children.length === 0) {
    callback();
    return;
  }
  const lastTransformer = props.transformer.children[props.transformer.children.length - 1];
  if (lastTransformer.transformerKey) {
    if (isHaveErrorWithLastType.value) {
      callback(new Error(`Please select last transformer with out type ${props.column.dstCyodaColumnPathType}`));
    } else {
      callback();
    }
  } else {
    callback(new Error(`You do not select transformer for last transformer`));
  }
}

function shortNamePath(name: string) {
  return HelperFormat.shortNamePath(name);
}

function onOpenFunctionDescriptions() {
  functionDescriptionDialogRef.value.dialogVisible = true;
}

defineExpose({dialogVisible, onAdd});
</script>
<style lang="scss">
.transformers {
  h3 {
    margin: 16px 0;
  }

  h4 {
    margin: 10px 0;
  }

  .alert-is-enum-field {
    margin-top: 10px;
  }

  .text-right {
    text-align: right;
  }
}
</style>
