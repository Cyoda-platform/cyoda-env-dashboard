import * as Blockly from "blockly/core";
import JSONGenerator
  from "../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/generators/json_generator";
import * as process from "process";

export function getStatementByName(name, defaultValues = {}) {
  const workspace = new Blockly.Workspace();
  const block = workspace.newBlock(name);
  if (Object.keys(defaultValues).length > 0) {
    Object.keys(defaultValues).forEach((key) => {
      block.setFieldValue(defaultValues[key], key);
    })
  }
  const jsonDataGenerated = JSONGenerator.workspaceToCode(workspace);

  return JSON.parse(jsonDataGenerated).statements[0];
}

export function getBlockByName(name) {
  const workspace = new Blockly.Workspace();
  return workspace.newBlock(name);
}
