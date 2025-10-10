<template>
  <div class="workflows">
    <div class="flex">
      <div class="flex" style="flex: 1; justify-content: unset">
        <el-form
          :model="form"
          label-width="auto"
          style="min-width: 100px; margin-right: 15px; flex: 1; max-width: 400px"
        >
          <el-form-item label="">
            <el-input v-model="form.filter" placeholder="Filter" clearable />
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="onClickNew">
          <font-awesome-icon :icon="['fas', 'plus']" />
          Create new workflow
        </el-button>
      </div>
      <ExportImport :dataToExport="dataToExport" type="workflow" />
    </div>

    <data-tables
      ref="dataTableRef"
      @headerDragend="onHeaderDragend"
      @sortChange="onSortChange"
      v-model:pageSize="form.pageSize"
      v-model:currentPage="form.currentPage"
      :pagination-props="{ pageSizes: [5, 10, 20, 50] }"
      :table-props="{
        border: true
      }"
      @selection-change="handleSelectionChange"
      v-loading="isLoading"
      class="table"
      border
      :data="tableData"
      :default-sort="{ prop: 'creationDate', order: 'descending' }"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column sortable prop="entityClassNameLabel" label="Entity" />
      <el-table-column sortable prop="name" label="Name" width="180" />
      <el-table-column sortable prop="active" label="Active" width="100">
        <template v-slot:default="{ row }">
          <StateComponent :state="row.active"></StateComponent>
        </template>
      </el-table-column>
      <el-table-column sortable prop="persisted" label="Persisted" width="130">
        <template v-slot:default="{ row }">
          <StateComponent :state="row.persisted"></StateComponent>
        </template>
      </el-table-column>
      <el-table-column
        sortable
        prop="creationDate"
        label="Creation Date"
        sort-by="creationDateMkTime"
        width="200"
      >
        <template v-slot:default="{ row }">
          {{ $filters.mktimeToDateTime(row.creationDate) }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="260">
        <template #default="{ row }">
          <el-tooltip :show-after="500" effect="dark" content="Workflow" placement="top">
            <CyodaButton type="primary" size="default" :to="onOpenNew(row)">
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
            </CyodaButton>
          </el-tooltip>
          <el-tooltip :show-after="500" effect="dark" content="Instances" placement="top">
            <CyodaButton type="primary" size="default" :to="onOpenInstances(row)">
              <font-awesome-icon :icon="['fas', 'table']" />
            </CyodaButton>
          </el-tooltip>
          <el-tooltip :show-after="500" effect="dark" content="Copy workflow" placement="top">
            <el-button type="primary" size="default" @click="onCopyWorkflow(row)">
              <font-awesome-icon :icon="['fas', 'copy']" />
            </el-button>
          </el-tooltip>
          <el-tooltip :show-after="500" effect="dark" content="Delete" placement="top">
            <el-button @click="onClickDelete(row)" type="danger" size="default">
              <font-awesome-icon :icon="['fas', 'trash']" />
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </data-tables>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useStatemachineStore } from '../stores/statemachine'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import moment from 'moment'
import StateComponent from '../components/States/StateComponent.vue'
import ExportImport from '@cyoda/ui-lib/src/components-library/elements/ExportImport/ExportImport.vue'
import { getPersistedType } from '../helpers/HelperData'
import { ElMessageBox, ElTable } from 'element-plus'
import HelperStorage from '@cyoda/cobi/src/helpers/HelperStorage'
import { useTableSaveStateMixin } from '@cyoda/ui-lib/src/mixins/TableSaveStateMixin'
import HelperFeatureFlags from '@cyoda/ui-lib/src/helpers/HelperFeatureFlags.ts'
import HelperEntities from '@cyoda/ui-lib/src/helpers/HelperEntities.ts'
import CyodaButton from '@cyoda/cobi/src/components/CyodaButton/CyodaButton.vue'
import { useUserStore } from '@cyoda/ui-lib/src/stores/user.ts'
import { useGlobalUiSettingsStore } from '@cyoda/ui-lib/src/stores/globalUiSettings.ts'

const storage = new HelperStorage()
const statemachineStore = useStatemachineStore()
let form = reactive({
  filter: '',
  currentPage: 1,
  pageSize: 10
})
const workflows = ref([])
const dataToExport = ref([])
const isLoading = ref(false)
const router = useRouter()
const dataTableRef = ref(null)
const workflowEnabledTypes = ref([])
const helperStorage = new HelperStorage()

const { onHeaderDragend, onSortChange } = useTableSaveStateMixin(
  'workflowsTable',
  dataTableRef,
  form
)

async function getAllWorkflowsList() {
  try {
    isLoading.value = true
    const { data } = await statemachineStore.getAllWorkflowsList(form.entityClassName)
    workflows.value = data
  } finally {
    isLoading.value = false
  }
}

async function loadWorkflowsData() {
  const { data } = await statemachineStore.getWorkflowEnabledTypes()
  workflowEnabledTypes.value = data
}

const globalUiSettings = useGlobalUiSettingsStore()
const entityType = computed(() => {
  return globalUiSettings.entityType
})

const tableData = computed(() => {
  return workflows.value
    .map((el) => {
      let entityClassNameLabel = el.entityShortClassName
      if (HelperFeatureFlags.isUseModelsInfo()) {
        const entityRow = workflowEnabledTypes.value.find(
          (item) => item.name === el.entityClassName
        )
        if (entityRow) {
          entityClassNameLabel += ` (${HelperEntities.entityTypeMapper(entityRow.type)})`
          el.entityType = entityRow.type
        }
      }
      return {
        ...el,
        creationDateMkTime: moment(el.creationDate).format('x'),
        entityClassNameLabel
      }
    })
    .filter((el) => {
      const filter = form.filter.toLowerCase()
      return (
        !form.filter ||
        el.name.toLowerCase().includes(filter) ||
        el.entityClassNameLabel.toLowerCase().includes(filter)
      )
    })
    .filter((el) => {
      if (HelperFeatureFlags.isUseModelsInfo()) {
        return el.entityType === entityType.value
      }
      return true
    })
})

function handleSelectionChange(val) {
  dataToExport.value = val
}

function onClickNew() {
  router.push(`/statemachine/workflow/new`)
}

function onOpenNew(row) {
  return `/statemachine/workflow/${row.id}?persistedType=${getPersistedType(row.persisted)}&entityClassName=${row.entityClassName}`
}

function onOpenInstances(row) {
  return `/statemachine/instances?entityClassName=${row.entityClassName}`
}

async function onCopyWorkflow(row) {
  const { data } = await statemachineStore.copyWorkflow(getPersistedType(row.persisted), row.id)
  const url = `/statemachine/workflow/${data}?persistedType=${getPersistedType(row.persisted)}&entityClassName=${row.entityClassName}`
  router.push(url)
}

function onClickDelete(row) {
  ElMessageBox.confirm('Are you sure you want to delete workflow?', 'Delete confirmation', {
    callback: async (action) => {
      if (action === 'confirm') {
        try {
          isLoading.value = true
          await statemachineStore.deleteWorkflow(row.id)
          getAllWorkflowsList()
        } finally {
          isLoading.value = false
        }
      }
    }
  })
}

onMounted(() => {
  getAllWorkflowsList()
  loadWorkflowsData()
})

watch(
  form,
  () => {
    storage.set(`statemachine:workflows:filter`, form)
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.workflows {
  margin-top: 16px;

  .flex {
    display: flex;
    justify-content: space-between;
  }

  &__entity-type {
    margin-left: 16px;
  }

  &__action-divider {
    position: relative;
    top: 12px;
    margin-left: 25px;
  }
}
</style>
