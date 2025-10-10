import { mount } from "@vue/test-utils";
// @ts-ignore
import FilterBuilderCondition from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/FilterBuilderCondition.vue";
// @ts-ignore
import cols from "../../data/FilterBuilder/cols.json";
// @ts-ignore
import conditionTypes from "../../data/FilterBuilder/conditionTypes.json";
import {nextTick} from "vue";


describe("FilterBuilderCondition.vue", () => {
  it("Check num of columns for NULL", () => {
    const wrapper = mount(FilterBuilderCondition, {
      stubs: {
        transition: false,
      },
      propsData: {
        cols,
        condition: {
          "@bean": "com.cyoda.core.conditions.nonqueryable.IsNull",
          fieldName: "state",
          operation: "IS_NULL",
        },
        conditionTypes,
      },
    });
    const countCols = wrapper.findAll(".el-col").length;
    expect(countCols).toEqual(3);
  });

  it("Check between", () => {
    const wrapper = mount(FilterBuilderCondition, {
      stubs: {
        transition: false,
      },
      propsData: {
        cols,
        condition: {
          "@bean": "com.cyoda.core.conditions.queryable.Between",
          fieldName: "state",
          operation: "BETWEEN",
          from: { "@type": "java.lang.String", value: "" },
          to: { "@type": "java.lang.String", value: "" },
        },
        conditionTypes,
      },
    });
    const countCols = wrapper.findAll(".el-col").length;
    expect(countCols).toEqual(5);
  });

  it("Check delete button", async () => {
    const wrapper = mount(FilterBuilderCondition, {
      stubs: {
        transition: false,
      },
      propsData: {
        cols,
        condition: {},
        conditionTypes,
      },
    });
    wrapper.find(".el-button.el-button--danger").trigger("click");
    await nextTick();
    const message = document.querySelector(".el-message-box__message");
    if (message) {
      expect(message.textContent).toContain(
        "Do you really want to delete row?"
      );
    }
  });
});
