import * as Blockly from 'blockly/core';
import beautify from "js-beautify";

const JSONGenerator = new Blockly.Generator("JSON");

JSONGenerator.ORDER_ATOMIC = 0;
JSONGenerator.ORDER_NONE = 0;

JSONGenerator.init = function (workspace) {
  // Call Blockly.Generator's init.
  Object.getPrototypeOf(this).init.call(this);

  if (!this.nameDB_) {
    this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
  } else {
    this.nameDB_.reset();
  }

  this.nameDB_.setVariableMap(workspace.getVariableMap());
  this.nameDB_.populateVariables(workspace);
  this.nameDB_.populateProcedures(workspace);
};
JSONGenerator.finish = function (code) {
  const functionalMappingConfig = JSONGenerator.vue.functionalMappingConfig;
  const finalCode = `{
                "@bean": "${functionalMappingConfig["@bean"] || "com.cyoda.plugins.mapping.core.dtos.functional.FunctionalMappingConfigDto"}",
                "srcPaths": [${functionalMappingConfig.srcPaths
    .map((el) => {
      return `"${el}"`;
    })
    .join(", ")}],
                "statements": [${code}],
                "dstPath": "${functionalMappingConfig.dstPath}"
                }`;
  const options = {
    indent_size: 2,
    space_in_empty_paren: true,
    wrap_line_length: 50,
  };
  return beautify.js(finalCode, options);
};

JSONGenerator.scrub_ = function (block, code) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = JSONGenerator.blockToCode(nextBlock);
  if (nextBlock) {
    return `${code},${nextCode}`;
  } else {
    return code;
  }
};

// START functional_mapping_config
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#yjfxye

Blockly.Blocks["functional_mapping_config"] = {
  init: function () {
    this.appendDummyInput().appendField("Functional Mapping");
    this.appendStatementInput("statements").setCheck(null).appendField("Statements");
    this.setColour(0);
    this.setTooltip("Functional Mapping Config");
    this.setHelpUrl("");
  },
};

JSONGenerator["functional_mapping_config"] = function (block) {
  const functionalMappingConfig = JSONGenerator.vue.functionalMappingConfig;

  let define_blocks = block.getInputTargetBlock("statements");
  const statements = [];
  if (define_blocks) {
    do {
      statements.push(JSONGenerator.blockToCode(define_blocks, true));
    } while ((define_blocks = define_blocks.getNextBlock()));
  }
  let code = `{
                "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionalMappingConfigDto",
                "srcPaths": [${functionalMappingConfig.srcPaths
    .map((el) => {
      return `"${el}"`;
    }).join(", ")}],
                "statements": [${statements.join(",\n")}],
                "dstPath": "${functionalMappingConfig.dstPath}"
              }`;
  return code;
};

// END functional_mapping_config

export default JSONGenerator;
