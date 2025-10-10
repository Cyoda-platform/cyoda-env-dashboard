import {computed, nextTick, onMounted, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";

const helperStorage = new HelperStorage();

export function useTableSaveStateMixin(tableStoreId: string, tableRef: any, form: any = null) {


  const route = useRoute();
  const router = useRouter();

  const saveToStorage = (data) => {
    const storedColumns = helperStorage.get(storeKey.value, []);
    const column = storedColumns.find((el) => el.property === data.property && el.label === data.label);
    storedColumns.forEach((el) => el.order = "");

    if (column) {
      column.width = data.width;
      column.order = data.order;
    } else {
      storedColumns.push({
        property: data.property,
        label: data.label,
        width: data.width,
        order: data.order,
      })
    }
    helperStorage.set(storeKey.value, storedColumns);
  };


  onMounted(() => {
    const storedColumns = helperStorage.get(storeKey.value, []);
    nextTick(() => {
      const allTableColumns = tableRef.value.$refs?.tableHeaderRef?.columnRows[0] || tableRef.value.elTableRef.$refs.tableHeaderRef.columnRows[0];
      storedColumns.forEach((storedColumn) => {
        const existColumn = allTableColumns.find((el) => el.property === storedColumn.property && el.label === storedColumn.label);
        if (existColumn) {
          existColumn.width = storedColumn.width;
          if (storedColumn.order) {
            nextTick(() => {
              tableRef.value.elTableRef.sort(storedColumn.property, storedColumn.order);
            });
          }
        }
      });
    })
  });


  function onHeaderDragend(newWidth, oldWidth, column) {
    saveToStorage(column);
  }

  function onSortChange({column}) {
    saveToStorage(column);
  }

  const storeKey = computed((el) => {
    return `tableSaveState:${tableStoreId}`;
  });

  if (form) {
    let formHistoryTimeoutId: any = null;
    watch(() => form, (value) => {
      if (formHistoryTimeoutId) clearTimeout(formHistoryTimeoutId);
      formHistoryTimeoutId = setTimeout(() => {
        let query = JSON.parse(JSON.stringify(route.query)) || {};
        query = {
          ...query,
          ...value
        };
        router.push({query})
      }, 1000);
    }, {deep: true})

    watch(() => route.query, (query: any) => {
      if (Object.keys(query).length > 0) {
        for (const el of Object.keys(query)) {
          if (!(el in form) || form[el] === query[el]) continue;

          if (["currentPage", "pageSize"].includes(el)) {
            form[el] = parseInt(query[el])
          } else {
            form[el] = query[el];
          }
        }
      }
    }, {deep: true, immediate: true})
  }


  return {
    onHeaderDragend,
    onSortChange
  }
}
