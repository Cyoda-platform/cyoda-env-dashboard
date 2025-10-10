import JSONGenerator
  from "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/generators/json_generator";
import {getStatementByName} from "../../../../../../../helpers/HelperBlockly";
import "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/blocks/StatementReturn";

describe("Blockly and JSONGenerator", () => {
  const localVue: any = {};
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

  it("defines JSONGenerator for statement_return", () => {
    const statement = getStatementByName("statement_return");

    const expectedCode = {type: 'RETURN', collectElemsSetModes: [], expression: null}

    expect(JSON.stringify(statement)).toBe(JSON.stringify(expectedCode));
  });
});
