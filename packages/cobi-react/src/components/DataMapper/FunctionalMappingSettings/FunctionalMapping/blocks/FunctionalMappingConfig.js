import * as Blockly from "blockly/core";
import JSONGenerator from "../generators/json_generator";
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

JSONGenerator.forBlock["functional_mapping_config"] = function (block) {
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
                  })
                  .join(", ")}],
                "statements": [${statements.join(",\n")}],
                "dstPath": "${functionalMappingConfig.dstPath}"
              }`;
  return code;
};
