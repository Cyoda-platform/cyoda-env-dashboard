import JSONGenerator from "../generators/json_generator";
import * as Blockly from "blockly/core";

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#8gm2w5
// Start String
Blockly.Blocks["expression_string"] = {
  init: function () {
    this.appendDummyInput().appendField("String").appendField(new Blockly.FieldTextInput(""), "NAME");
    this.setOutput(true, null);
    this.setColour(120);
    this.setTooltip("String expression");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["expression_string"] = function (block) {
  const text_name = block.getFieldValue("NAME");
  const code = `{
    "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.StringConstantExpressionConfigDto",
    "constantSource": "INPUT",
    "value": "${text_name}"
  }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// End String

// Start Long
Blockly.Blocks["expression_long"] = {
  init: function () {
    this.appendDummyInput().appendField("Long").appendField(new Blockly.FieldTextInput(""), "NAME");
    this.setOutput(true, null);
    this.setColour(120);
    this.setTooltip("Long expression");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["expression_long"] = function (block) {
  const text_name = block.getFieldValue("NAME");
  const code = `{
    "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.LongConstantExpressionConfigDto",
    "constantSource": "INPUT",
    "value": {
          "@type": "Long",
          "value": ${text_name}
       }
  }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// End Long

// Start Double
Blockly.Blocks["expression_double"] = {
  init: function () {
    this.appendDummyInput().appendField("Double").appendField(new Blockly.FieldTextInput(""), "NAME");
    this.setOutput(true, null);
    this.setColour(120);
    this.setTooltip("Double expression");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["expression_double"] = function (block) {
  const text_name = block.getFieldValue("NAME");
  const code = `{
    "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.DoubleConstantExpressionConfigDto",
    "constantSource": "INPUT",
    "value": ${text_name}
  }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// End Double

// Start Var Read
Blockly.Blocks["expression_var_read"] = {
  init: function () {
    this.appendDummyInput().appendField("Var Read").appendField(new Blockly.FieldVariable(null), "NAME");
    this.setOutput(true, null);
    this.setColour(120);
    this.setTooltip("Variable read expression");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["expression_var_read"] = function (block) {
  const variable_name = JSONGenerator.nameDB_.getName(block.getFieldValue("NAME"), Blockly.VARIABLE_CATEGORY_NAME);
  const code = `{
    "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.VarReadExpressionConfigDto",
     "variableName": "${variable_name}"
  }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// Start Var Read

// Start Var Read
Blockly.Blocks["expression_src_value_read"] = {
  init: function () {
    const dropdownFields = JSONGenerator.vue.functionalMappingConfig.srcPaths.map((el) => {
      return [el, el];
    });

    this.appendDummyInput().appendField("Src Path").appendField(new Blockly.FieldDropdown(dropdownFields), "NAME");
    this.setOutput(true, null);
    this.setColour(120);
    this.setTooltip("Source Path expression");
  },
};

JSONGenerator.forBlock["expression_src_value_read"] = function (block) {
  const text_name = block.getFieldValue("NAME");
  const code = `{
    "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.SrcValueReadExpressionConfigDto",
    "srcPath": "${text_name}"
  }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// Start Var Read

// Start Meta Value
Blockly.Blocks["expression_meta_value_read"] = {
  init: function () {
    this.appendDummyInput().appendField("Meta Path").appendField(new Blockly.FieldTextInput(""), "NAME");
    this.setOutput(true, null);
    this.setColour(120);
    this.setTooltip("Meta Path expression");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["expression_meta_value_read"] = function (block) {
  const text_name = block.getFieldValue("NAME");
  const code = `{
    "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.MetaValueReadExpressionConfigDto",
    "metaPath": "${text_name}"
  }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// Start Var Read

// Start Null
Blockly.Blocks["expression_null"] = {
  init: function () {
    this.appendDummyInput().appendField("Null");
    this.setOutput(true, null);
    this.setColour(120);
    this.setTooltip("Null expression");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["expression_null"] = function () {
  let code = `{
                "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.NullValueExpressionConfigDto"
                }`;
  return [code, JSONGenerator.ORDER_NONE];
};

// Start Boolean
Blockly.Blocks["expression_boolean"] = {
  init: function () {
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["true", "TRUE"],
        ["false", "FALSE"],
      ]),
      "VALUE"
    );
    this.setOutput(true, null);
    this.setColour(120);
    this.setTooltip("Boolean true");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["expression_boolean"] = function (block) {
  const value = block.getFieldValue("VALUE");
  const code = `{
                "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.BooleanConstantExpressionConfigDto",
                "constantSource": "INPUT",
                "value": ${value === "TRUE"}
                }`;
  return [code, JSONGenerator.ORDER_NONE];
}
