import JSONGenerator from "../generators/json_generator";
import * as Blockly from "blockly/core";

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#igogz8
Blockly.Blocks["statement_variables_set"] = {
  init: function () {
    this.appendDummyInput().appendField("Assign Variable");
    this.appendValueInput("VALUE").setCheck(null).appendField("Variable").appendField(new Blockly.FieldVariable(null), "VAR").appendField("set");
    this.setInputsInline(false);
    this.setColour(0);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("Assign Variable Statement");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["statement_variables_set"] = function (block) {
  // Variable setter.
  const varName = JSONGenerator.nameDB_.getName(block.getFieldValue("VAR"), Blockly.VARIABLE_CATEGORY_NAME);
  const value = JSONGenerator.valueToCode(block, "VALUE", JSONGenerator.ORDER_ATOMIC) || "null";
  return `{
  "type": "ASSIGN_VAR",
  "variableName": "${varName}",
  "collectElemsSetModes": [],
  "expression": ${value}
 }`;
};

//https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#8knaef
Blockly.Blocks["statement_variables_get"] = {
  init: function () {
    this.appendDummyInput().appendField(new Blockly.FieldVariable(null), "VAR");
    this.setOutput(true, null);
    this.setColour(0);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["statement_variables_get"] = function (block) {
  // // Variable setter.
  const varName = JSONGenerator.nameDB_.getName(block.getFieldValue("VAR"), Blockly.VARIABLE_CATEGORY_NAME);
  return [varName, JSONGenerator.ORDER_ATOMIC];
};

JSONGenerator.forBlock["text"] = function (block) {
  const varName = block.getFieldValue("TEXT") || "";
  return [varName, JSONGenerator.ORDER_ATOMIC];
};
