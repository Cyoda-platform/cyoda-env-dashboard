import JSONGenerator from "../generators/json_generator";
import * as Blockly from "blockly/core";
import HelperFunctionalMapping from "../../../../../utils/functionalMappingHelper";

export default class GeneratedFunctions {
  static init(listAllFunctions) {
    listAllFunctions.forEach((el) => {
      if (!HelperFunctionalMapping.predefinedFunctions[el.name]) {
        const function_name = HelperFunctionalMapping.getFunctionName(el);
        Blockly.Blocks[function_name] = {
          init: function () {
            // @ts-ignore
            this.appendDummyInput().appendField(el.name);

            el.args.forEach((elArg) => {
              // @ts-ignore
              this.appendValueInput(elArg.name).setCheck(null).appendField(elArg.name);
            });

            // @ts-ignore
            this.setOutput(true, null);
            // @ts-ignore
            this.setColour(260);
            // @ts-ignore
            this.setTooltip(el.description);
            // @ts-ignore
            this.setHelpUrl("");
          },
        };

        JSONGenerator.forBlock[function_name] = function (block) {
          const values = [];
          el.args.forEach((elArg) => {
            // @ts-ignore
            values.push(JSONGenerator.valueToCode(block, elArg.name, JSONGenerator.ORDER_ATOMIC));
          });
          const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "${el.functionClass}",
        "args":[${values.filter((el) => el).join(", ")}]
        }`;
          return [code, JSONGenerator.ORDER_NONE];
        };
      }
    });
  }
}
