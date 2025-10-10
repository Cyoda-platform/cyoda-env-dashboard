import { mount } from "@vue/test-utils";
import FilterBuilderGroup from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/FilterBuilderGroup.vue";
import configDefinition from "../../data/FilterBuilder/configDefinition.json";
import cols from "../../data/FilterBuilder/cols.json";

describe("FilterBuilderGroup.vue", () => {
  let wrapper: any = {};

  beforeEach(() => {
    wrapper = mount(FilterBuilderGroup, {
      stubs: {
        transition: false,
      },
      propsData: {
        showErrors: false,
        level: 0,
        cols,
        condition: configDefinition.condition,
      },
    });
  });

  it("changed count of rows after add", () => {
    const initCount = (wrapper as any).vm.condition.conditions.length;
    (wrapper as any).vm.onNewCondition();
    const conditionLength = (wrapper as any).vm.condition.conditions.length;
    expect(conditionLength > initCount).toBe(true);

    (wrapper as any).vm.onNewGroup();
    const conditionLengthWithGroup = (wrapper as any).vm.condition.conditions
      .length;
    expect(conditionLengthWithGroup > conditionLength).toBe(true);
  });

  it("delete row", () => {
    const initCount = (wrapper as any).vm.condition.conditions.length;
    wrapper.vm.onRemove(1);
    const initAfterRemove = (wrapper as any).vm.condition.conditions.length;
    expect(initAfterRemove < initCount).toBe(true);
  });
});
