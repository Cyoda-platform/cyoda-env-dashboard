<template>
  <div class="transformer-children">
    <el-row :gutter="20">
      <el-col :span="10">
        <el-form-item :rules="rules" :prop="'transformer.children.' + indexChildren + '.transformerKey'">
          <el-select @change="onChangeTransformerKey" popper-class="transformer-select" filterable clearable
                     v-model="children.transformerKey" placeholder="Select">
            <el-option v-for="item in optionsTransformerKey" :key="item.value" :label="item.label" :value="item.value">
              <div>{{ item.label }}</div>
              <div class="item-description"><strong>Description:</strong> {{ item.description }}</div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="10">
        <template v-if="selectedTransformer.description">
          <strong>Description:</strong><br/>
          {{ selectedTransformer.description }}
          <template v-if="isDateTransformer">
            <div>
              <el-link @click="openDateDocumentation" type="primary">Documentation</el-link>
              <JavaDocDate ref="javaDocDateRef"/>
            </div>
          </template>
        </template>
        <template v-else>&nbsp;</template>
      </el-col>
      <el-col v-if="(addFirst && indexChildren != 0) || addFirst == false" :span="4">
        <el-button @click="onDeleteTransformer" type="danger" plain>
          <font-awesome-icon icon="trash"/>
        </el-button>
      </el-col>
    </el-row>
    <template v-if="selectedTransformer.requiredParameters && selectedTransformer.requiredParameters.length > 0">
      <h4>Required Parameters</h4>
      <el-row :gutter="20">
        <el-col :span="12" v-for="(parameter, indexParameter) in children.parameters" :key="indexParameter">
          <TransformerChildrenRestriction class="transformer-children-restriction" :parameter="parameter"
                                          :restrictions="selectedTransformer.requiredParameters[indexParameter].restrictions"
                                          :indexParameter="indexParameter" :indexChildren="indexChildren"/>
          <template v-if="isDateTransformer && indexParameter === 0">
            <TransformersChildrenParametersForToDateArbitraryFormat :parameter="children.parameters[0]"/>
          </template>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import {usePlatformMappingStore} from "../../../stores/platform-mapping";
import {ElMessageBox} from "element-plus";
import {ref, computed, watch} from "vue";

import TransformerChildrenRestriction
  from "../../../components/DataMapper/Transformers/TransformerChildrenRestriction.vue";

import JavaDocDate from "../../JavaDocDate/JavaDocDate.vue";
import TransformersChildrenParametersForToDateArbitraryFormat
  from "./parameters/TransformersChildrenParametersForToDateArbitraryFormat.vue";

const props = defineProps({
  indexChildren: {
    default: 0
  },
  addFirst: {
    default: false
  },
  children: {
    default: () => {
      return {};
    }
  },
  previousTransformer: {
    default: () => {
      return {};
    }
  }
});
const platformMappingStore = usePlatformMappingStore();
const listAllTransformers = computed(() => {
  return platformMappingStore.listAllTransformers;
});
const optionsTransformerKey = computed(() => {
  return listAllTransformers.value
    .filter((el: any) => el.inType === props.previousTransformer.outType)
    .map((el: any) => {
      return {
        value: el.transformerKey,
        label: el.transformerKey.split(".").pop().replace("$", " -> "),
        description: el.description
      };
    });
});
const selectedTransformer = computed(() => {
  return listAllTransformers.value.find((el: any) => el.transformerKey == props.children.transformerKey) || {};
});
const isDateTransformer = computed(() => {
  return selectedTransformer.value?.transformerKey?.indexOf("ToDateArbitraryFormat") > -1;
});

const javaDocDateRef = ref(null);

const dialogVisible = ref<boolean>(false);
const emit = defineEmits(['delete']);

let rules = ref({
  required: true,
  message: "Please fill field",
  trigger: "change"
});

function onChangeTransformerKey() {
  props.children.parameters = [];
  if (selectedTransformer.value && selectedTransformer.value.requiredParameters && selectedTransformer.value.requiredParameters.length > 0) {
    selectedTransformer.value?.requiredParameters.forEach((requiredParameter: any) => {
      let bean = "";
      if (requiredParameter.type.indexOf("Integer") > -1) {
        bean = "com.cyoda.core.namedparameters.IntegerParameter";
      } else if (requiredParameter.type.indexOf("Float") > -1) {
        bean = "com.cyoda.core.namedparameters.FloatParameter";
      } else {
        bean = "com.cyoda.core.namedparameters.StringParameter";
      }
      props.children.parameters.push({
        "@bean": bean,
        name: requiredParameter.name,
        value: requiredParameter.defaultValue || "",
        parameterType: requiredParameter.type
      });
    });
  }
}

watch(
  () => props.previousTransformer,
  () => {
    const allOptionsClasses = optionsTransformerKey.value.map((el: any) => el.value);
    const isOptionsIsEmpty = optionsTransformerKey.value.length === 0;
    const isInAllVariantsNotExistSelectedKey = allOptionsClasses.indexOf(props.children.transformerKey) == -1;
    if ((isOptionsIsEmpty || isInAllVariantsNotExistSelectedKey) && props.children.transformerKey) {
      props.children.transformerKey = "";
    }
  },
  {immediate: true}
);

function onDeleteTransformer() {
  ElMessageBox.confirm("Do you really want to remove?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        emit("delete");
      }
    }
  });
}

function openDateDocumentation() {
  javaDocDateRef.value.dialogVisible = true;
}

defineExpose({dialogVisible});
</script>

<style lang="scss">
.transformer-children {
  .transformer-children-restriction {
    margin-bottom: 10px;
  }
}

.transformer-select {
  .el-select-dropdown__item {
    height: auto;
    min-height: 34px;
    line-height: 1.3;
    padding-bottom: 10px;
    padding-top: 10px;
    border-bottom: 1px solid rgb(220, 223, 230);

    .item-description {
      color: #8492a6;
      font-size: 13px;
      max-width: 800px;
      white-space: normal;
      padding-right: 15px;
    }
  }
}
</style>
