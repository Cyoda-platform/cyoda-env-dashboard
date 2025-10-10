import * as Blockly from "blockly/core";
import { describe, it, expect, vi } from 'vitest';
import HelperFunctionalMapping from "../../../../../../../../src/helpers/HelperFunctionalMapping";
import GeneratedFunctions
  from "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/blocks/GeneratedFunctions";
import JSONGenerator
  from "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/generators/json_generator";

describe("GeneratedFunctions Tests", () => {
  it("should initialize Blockly blocks and JSONGenerator for custom functions", () => {
    const listAllFunctions = [
      {
        name: "CustomFunction1",
        functionClass: "com.cyoda.plugins.mapping.core.parser.functions.impl.CustomFunction1",
        description: "Test function 1",
        args: [
          { name: "arg1" },
          { name: "arg2" },
        ],
      },
    ];

    vi.spyOn(HelperFunctionalMapping, "getFunctionName").mockImplementation((func) => `function_${func.name}`);

    GeneratedFunctions.init(listAllFunctions);

    const workspace = new Blockly.Workspace();

    Blockly.Blocks["expression_string"] = {
      init: function () {
        this.appendDummyInput().appendField(new Blockly.FieldTextInput(""), "NAME");
        this.setOutput(true, "String");
        this.setColour(160);
      },
    };

    JSONGenerator.forBlock["expression_string"] = function (block) {
      const value = block.getFieldValue('NAME');
      const code = JSON.stringify(value);
      return [code, JSONGenerator.ORDER_ATOMIC];
    };

    listAllFunctions.forEach((func) => {
      const functionName = HelperFunctionalMapping.getFunctionName(func);

      expect(Blockly.Blocks[functionName]).toBeDefined();
      expect(JSONGenerator.forBlock[functionName]).toBeDefined();

      const block = workspace.newBlock(functionName);

      func.args.forEach((arg, index) => {
        const stringBlock = workspace.newBlock("expression_string");
        stringBlock.setFieldValue(`${arg.name}_value${index + 1}`, "NAME");

        const inputConnection = block.getInput(arg.name).connection;
        inputConnection.connect(stringBlock.outputConnection);
      });

      const expectedJson = {
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": func.functionClass,
        "args": func.args.map((arg, index) => `${arg.name}_value${index + 1}`),
      };

      const [generatedJsonStr] = JSONGenerator.forBlock[functionName](block);
      const generatedJson = JSON.parse(generatedJsonStr);

      expect(generatedJson).toEqual(expectedJson);
    });

    workspace.dispose();
  });
});
