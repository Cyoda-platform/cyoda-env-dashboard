<template>
  <div class="instances">
    <div class="actions">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select
            :loading="isLoadingEntities"
            @change="onChangeEntityClassName"
            clearable
            filterable
            v-model="form.entityClassName"
            placeholder="Select entity"
          >
            <el-option
              v-for="workflowEnabledType in workflowEnabledTypesOptions"
              :key="workflowEnabledType.value"
              :label="workflowEnabledType.label"
              :value="workflowEnabledType.value"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input
            :disabled="!form.entityClassName"
            v-model="form.filter"
            placeholder="Search by id"
            clearable
          />
          <div class="hint">
            To search for multiple values, please enter the IDs separated by commas
          </div>
        </el-col>
        <el-col :span="6">
          <el-button :disabled="!form.entityClassName" @click="onRun" type="primary">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </el-button>
          <el-button @click="onToggleAdvanced" type="warning"> Advanced </el-button>
        </el-col>
      </el-row>

      <el-collapse-transition>
        <div v-show="isShowAdvanced">
          <el-divider />
          <RangeCondition :form="form" />
        </div>
      </el-collapse-transition>
    </div>
    <el-divider />

    <el-table v-loading="isLoading" :data="tableData" border style="width: 100%">
      <el-table-column prop="entityId" label="Entity Id">
        <template v-slot:default="{ row }">
          <span v-if="row.deleted" class="deleted">
            {{ row.entityId }} <small>(deleted)</small>
          </span>
          <span v-else>
            {{ row.entityId }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="entityClassNameLabel" label="Entity Name" />
      <el-table-column prop="currentWorkflowId" label="Current Workflow">
        <template v-slot:default="{ row }">
          <span v-if="row.currentWorkflowId">
            <a class="link" :href="getWorkflowLink(row)">
              {{ getWorkflowName(row) }}
            </a>
          </span>
          <span v-else> </span>
        </template>
      </el-table-column>
      <el-table-column prop="state" label="State" />
      <el-table-column prop="creationDate" label="Created">
        <template v-slot:default="{ row }">
          {{ $filters.mktimeToDateTime(row.creationDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="lastUpdateTime" label="Updated">
        <template v-slot:default="{ row }">
          {{ $filters.mktimeToDateTime(row.lastUpdateTime) }}
        </template>
      </el-table-column>
      <el-table-column width="100px" label="Action">
        <template v-slot:default="{ row }">
          <CyodaButton size="default" type="primary" :to="geDetailLink(row)">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </CyodaButton>
        </template>
      </el-table-column>
    </el-table>

    <div class="navigation">
      <el-button
        :disabled="lastResponse.pagingFilter.offset <= 0 || isLoading"
        @click="onClickPrev"
        type="primary"
      >
        <font-awesome-icon :icon="['fas', 'chevron-left']" />
        Prev
      </el-button>
      <el-button :disabled="!lastResponse.hasMore || isLoading" @click="onClickNext" type="primary">
        Next
        <font-awesome-icon :icon="['fas', 'chevron-right']" />
      </el-button>
      <template v-if="lastResponse.hasMore || currentPage > 1">
        <el-divider direction="vertical" />
        Page {{ currentPage }}
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useStatemachineStore } from '../stores/statemachine'
import { getPersistedType } from '../helpers/HelperData'
import RangeCondition from '../components/RangeCondition.vue'
import CyodaButton from '@cyoda/cobi/src/components/CyodaButton/CyodaButton.vue'
import HelperEntities from '@cyoda/ui-lib/src/helpers/HelperEntities.ts'
import HelperFeatureFlags from '@cyoda/ui-lib/src/helpers/HelperFeatureFlags.ts'
import HelperStorage from '@cyoda/ui-lib/src/helpers/HelperStorage.ts'
import { useGlobalUiSettingsStore } from '@cyoda/ui-lib/src/stores/globalUiSettings.ts'

const helperStorage = new HelperStorage()
const statemachineStore = useStatemachineStore()
const route = useRoute()
const workflowEnabledTypes = ref([])
const isLoading = ref(false)
const isLoadingEntities = ref(false)
const isShowAdvanced = ref(false)

const lastResponse = ref({
  '@bean': 'com.cyoda.core.model.PartialResultsListDto',
  hasMore: false,
  items: [],
  rangeOrder: 'ASC',
  pagingFilter: {
    offset: 0,
    maxResults: 0
  }
})

const formDefault = {
  filter: '',
  entityClassName: route.query.entityClassName,
  paging: {
    offset: 0,
    maxResults: 20
  },
  rangeOrder: 'ASC',
  rangeCondition: {
    '@bean': '',
    fieldName: '',
    operation: '',
    value: {
      '@type': '',
      value: ''
    }
  }
}

let form = reactive({
  filter: route.query.filter || '',
  entityClassName: route.query.entityClassName || '',
  paging: route.query.paging ? JSON.parse(route.query.paging) : { offset: 0, maxResults: 20 },
  rangeOrder: route.query.rangeOrder || 'ASC',
  rangeCondition: route.query.rangeCondition
    ? JSON.parse(route.query.rangeCondition)
    : { '@bean': '', fieldName: '', operation: '', value: { '@type': '', value: '' } }
})

const currentPage = ref(Math.floor(Number(form.paging.offset) / Number(form.paging.maxResults)) + 1)

const workflowList = ref([])
const router = useRouter()

const globalUiSettings = useGlobalUiSettingsStore()
const entityType = computed(() => {
  return globalUiSettings.entityType
})

async function loadData() {
  if (!form.entityClassName) return
  try {
    isLoading.value = true
    const requestData = {
      entityClassName: form.entityClassName,
      rangeOrder: form.rangeOrder,
      paging: form.paging
    }
    if (form.rangeCondition['@bean']) {
      requestData.rangeCondition = form.rangeCondition
    }
    if (form.filter.trim().length > 0) {
      requestData.entityIds = form.filter
        .split(',')
        .map((el) => el.trim())
        .filter((el) => el)
    }
    const { data } = await statemachineStore.postInstances(requestData)
    lastResponse.value = data

    const query = {
      filter: form.filter,
      entityClassName: form.entityClassName,
      paging: JSON.stringify(form.paging),
      rangeOrder: form.rangeOrder,
      rangeCondition: JSON.stringify(formDefault.rangeCondition)
    }

    router.push({ query })
  } finally {
    isLoading.value = false
  }
}

function reset() {
  Object.assign(form, JSON.parse(JSON.stringify(formDefault)))
  currentPage.value = 1
}

const tableData = computed(() => {
  return lastResponse.value.items.map((el) => {
    let entityClassNameLabel = el.entityClassName
    if (HelperFeatureFlags.isUseModelsInfo()) {
      const entityRow = workflowEnabledTypes.value.find((item) => item.name === el.entityClassName)
      if (entityRow) entityClassNameLabel += ` (${HelperEntities.entityTypeMapper(entityRow.type)})`
    }
    return {
      ...el,
      entityClassNameLabel
    }
  })
})

async function loadWorkflowsData() {
  const { data } = await statemachineStore.getWorkflowEnabledTypes()
  workflowEnabledTypes.value = data
}

async function getAllWorkflowsList() {
  const { data } = await statemachineStore.getAllWorkflowsList(form.entityClassName)
  workflowList.value = data
}

const workflowEnabledTypesOptions = computed(() => {
  return HelperEntities.getOptionsFromData(workflowEnabledTypes.value, entityType.value)
})

function onClickPrev() {
  form.paging.offset -= form.paging.maxResults
  if (form.paging.offset < 0) form.paging.offset = 0

  currentPage.value -= 1
  if (currentPage.value < 0) currentPage.value = 0
  loadData()
}

function onClickNext() {
  form.paging.offset += form.paging.maxResults
  currentPage.value += 1
  loadData()
}

function onToggleAdvanced() {
  isShowAdvanced.value = !isShowAdvanced.value
}

function onRun() {
  form.paging = { offset: 0, maxResults: 20 }
  currentPage.value = 1
  loadData()
}

onMounted(async () => {
  try {
    isLoadingEntities.value = true
    await getAllWorkflowsList()
    await Promise.all([loadData(), loadWorkflowsData()])
  } finally {
    isLoadingEntities.value = false
  }
})

function onChangeEntityClassName(value) {
  reset()
  form.entityClassName = value
}

function getWorkflowName(row) {
  const workflow: any = workflowList.value.find((el) => el.id === row.currentWorkflowId)
  return workflow?.name || row.currentWorkflowId
}

function getWorkflowLink(row) {
  return `/statemachine/workflow/${row.currentWorkflowId}?persistedType=${getPersistedType(row.persisted)}&entityClassName=${row.entityClassName}`
}

function geDetailLink(row) {
  return router.resolve({
    path: `/statemachine/instances/${row.entityId}`,
    query: {
      entityClassName: row.entityClassName,
      currentWorkflowId: row.currentWorkflowId,
      persistedType: [false, true].includes(row.persisted)
        ? getPersistedType(row.persisted)
        : undefined
    }
  })
}
</script>

<style scoped lang="scss">
.instances {
  .actions {
    margin: 15px 0;
  }

  .navigation {
    margin-top: 15px;
  }

  .hint {
    font-size: 12px;
    color: #a1a0a0;
    line-height: normal;
    display: block;
    margin-top: 5px;
    width: 100%;
  }

  .deleted {
    color: #f56c6c;
  }

  .link {
    color: #409eff;

    &:hover {
      text-decoration: none;
    }
  }
}
</style>
