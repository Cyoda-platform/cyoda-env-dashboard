import JSONGenerator
  from "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/generators/json_generator";
import {getStatementByName} from "../../../../../../../helpers/HelperBlockly";
import "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/blocks/StatementVariables";
import * as Blockly from "blockly/core";

describe("Blockly and JSONGenerator", () => {
  const localVue: any = {}
  localVue.functionalMappingConfig = {
    "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionalMappingConfigDto",
    "srcPaths": ["result/1/1/kind"],
    "name": null,
    "statements": [],
    "dstPath": "org@net#cyoda#saas#model#dto#Organisation.addresses.[*]@net#cyoda#saas#model#dto#Address.line2",
    "collectElemsSetModes": [{"type": "OVERRIDE"}],
    "metaPaths": []
  }

  JSONGenerator.vue = localVue;

  it("defines JSONGenerator for statement_variables_set", () => {
    const statement = getStatementByName("statement_variables_set");

    const expectedCode = {
      type: 'ASSIGN_VAR',
      variableName: 'i',
      collectElemsSetModes: [],
      expression: null
    }

    expect(JSON.stringify(statement)).toBe(JSON.stringify(expectedCode));
  });

  it("defines JSONGenerator for statement_variables_get", () => {
    const workspace = new Blockly.Workspace();
    workspace.newBlock("statement_variables_get");
    const jsonDataGenerated = JSONGenerator.workspaceToCode(workspace);

    const expectedCode =  `{
  "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionalMappingConfigDto",
  "srcPaths": ["result/1/1/kind"],
  "statements": [i],
  "dstPath": "org@net#cyoda#saas#model#dto#Organisation.addresses.[*]@net#cyoda#saas#model#dto#Address.line2"
}`

    expect(jsonDataGenerated).toBe(expectedCode);
  });
});
