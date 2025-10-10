import { ref, watch, onMounted, getCurrentInstance } from 'vue';
import {useRoute, useRouter} from "vue-router";

export default function useTabsHistory(tabsHistoryId) {
  const tabsHistoryValue = ref('0');
  const route= useRoute();
  const router= useRouter();

  const onTabsHistoryValue = (tabName) => {
    if (route.query[tabsHistoryId] !== tabName && tabName !== '0') {
      const query = { ...route.query, [tabsHistoryId]: tabName };
      router.push({ query });
    }
  };

  const onRouteQuery = (query) => {
    if (query[tabsHistoryId]) {
      tabsHistoryValue.value = query[tabsHistoryId];
    } else {
      tabsHistoryValue.value = '0';
    }
  };


  watch(() => tabsHistoryValue.value, onTabsHistoryValue);
  watch(() => route.query, onRouteQuery, { deep: true, immediate: true });

  onMounted(() => {
    onRouteQuery(route.query);
  });

  return {
    tabsHistoryValue,
  };
}
