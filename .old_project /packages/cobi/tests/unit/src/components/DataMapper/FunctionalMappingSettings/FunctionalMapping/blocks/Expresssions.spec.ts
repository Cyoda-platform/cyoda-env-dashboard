import "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/blocks/Expresssions";
import {getStatementByName} from "../../../../../../../helpers/HelperBlockly";
import JSONGenerator
  from "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/generators/json_generator";

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
describe("Blockly Expressions", () => {

  it("generates JSON for expression_string block", () => {
    const statement = getStatementByName("expression_string")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.StringConstantExpressionConfigDto',
      constantSource: 'INPUT',
      value: ''
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for expression_long block", () => {
    const statement = getStatementByName("expression_long", {
      NAME: 0
    });

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.LongConstantExpressionConfigDto',
      constantSource: 'INPUT',
      value: {'@type': 'Long', value: 0}
    };
    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for expression_double block", () => {
    const statement = getStatementByName("expression_double", {
      NAME: 0
    });

    const expectedJson =  {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.DoubleConstantExpressionConfigDto',
      constantSource: 'INPUT',
      value: 0
    };
    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for expression_var_read block", () => {
    const statement = getStatementByName("expression_var_read");

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.VarReadExpressionConfigDto',
      variableName: 'i'
    };
    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for expression_src_value_read block", () => {
    const statement = getStatementByName("expression_src_value_read");

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.SrcValueReadExpressionConfigDto',
      srcPath: 'result/1/1/kind'
    };
    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for expression_meta_value_read block", () => {
    const statement = getStatementByName("expression_meta_value_read");

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.MetaValueReadExpressionConfigDto',
      metaPath: ''
    };
    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for expression_null block", () => {
    const statement = getStatementByName("expression_null");

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.NullValueExpressionConfigDto'
    };
    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for expression_boolean block", () => {
    const statement = getStatementByName("expression_boolean");

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.BooleanConstantExpressionConfigDto',
      constantSource: 'INPUT',
      value: true
    };
    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });


});
