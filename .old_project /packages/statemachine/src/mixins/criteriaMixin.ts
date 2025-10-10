import {ref, watch, computed} from 'vue';
import HelperFilter from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/HelperFilter";

export function useCriteriaMixin(criteria) {
  const criteriaJSON = ref(null);

  const isCodeCriteria = computed(() => {
    return (
      criteria &&
      criteria.condition &&
      criteria.condition["@bean"] &&
      criteria.condition["@bean"].indexOf("ConfigurableUnaryCondition") !== -1
    ) || false;
  });

  watch(
    () => criteria.condition,
    (val) => {
      if (val && !("conditions" in val) && !isCodeCriteria.value) {
        const obj = HelperFilter.getGroup();
        if (val) {
          obj.conditions[0] = val;
        }
        criteriaJSON.value = obj;
      }
    },
    {immediate: true}
  );

  return {
    criteriaJSON,
    isCodeCriteria,
  };
}
