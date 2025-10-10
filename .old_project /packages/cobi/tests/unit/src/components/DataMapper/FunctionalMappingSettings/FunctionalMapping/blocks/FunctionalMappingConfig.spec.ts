import "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/blocks/FunctionalMappingConfig";
import {getStatementByName} from "../../../../../../../helpers/HelperBlockly";
import JSONGenerator
  from "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/generators/json_generator";

const localVue:any = {};

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
describe("Blockly FunctionalMappingConfig", () => {

  it("generates JSON for functional_mapping_config block", () => {
    const statement = getStatementByName("functional_mapping_config")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionalMappingConfigDto',
      srcPaths: [ 'result/1/1/kind' ],
      statements: [],
      dstPath: 'org@net#cyoda#saas#model#dto#Organisation.addresses.[*]@net#cyoda#saas#model#dto#Address.line2'
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

});
