import JSONGenerator from "../generators/json_generator";
import * as Blockly from "blockly/core";

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#5sb6sy
Blockly.Blocks["statement_return"] = {
  init: function () {
    this.appendValueInput("EXPRESSION").appendField("Return").setCheck(null);
    this.setColour(230);
    this.setPreviousStatement(true, null);
    this.setTooltip("Return statement");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["statement_return"] = function (block) {
  const value = JSONGenerator.valueToCode(block, "EXPRESSION", JSONGenerator.ORDER_ATOMIC) || "null";
  // // TODO: Assemble JavaScript into code variable.
  const code = `
   {
      "type": "RETURN",
      "collectElemsSetModes": [],
      "expression": ${value}
    }`;
  return code;
};
