import "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/blocks/Functions.js";
import {getStatementByName} from "../../../../../../../helpers/HelperBlockly";
import JSONGenerator
  from "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/generators/json_generator";
import * as Blockly from "blockly/core";

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
describe("Blockly Functions", () => {

  it("generates JSON for functional_mapping_config block", () => {
    const statement = getStatementByName("function_simple_concat")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.Concat',
      args: [null, null]
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));

    const workspace = new Blockly.Workspace();
    const block = workspace.newBlock("function_simple_concat");

    // @ts-ignore
    expect(block.itemCount_).toBe(2);
    expect(block.outputConnection).toBeDefined();

    const xmlText = `<xml xmlns="https://developers.google.com/blockly/xml"><block type="function_simple_concat" id="bn|MvpCY@?^b*u-6!E3D" x="254" y="11"><mutation items="3"></mutation><value name="ADD0"><block type="expression_string" id=";O6A2cUE].,_Uk1Xk[=*"><field name="NAME">1</field></block></value><value name="ADD1"><block type="expression_string" id="Pytgi.oFm)^HS(XYG?^R"><field name="NAME">2</field></block></value><value name="ADD2"><block type="expression_string" id="cA]OPj(o16\`Bkq^sXjub"><field name="NAME">3</field></block></value></block></xml>`;
    const xml = Blockly.utils.xml.textToDom(xmlText);
    const blockXml = xml.firstChild.firstChild;
    // @ts-ignore
    block.domToMutation(blockXml);
    // @ts-ignore
    expect(block.itemCount_).toBe(3);

    const mockConnection = {
      connect: vi.fn()
    };

    const listsCreateWithContainer = new Blockly.Block(workspace, "lists_create_with_container");

    // @ts-ignore
    expect(block.itemCount_).toBe(3);

    // @ts-ignore
    block.saveConnections(listsCreateWithContainer);

  });

  it("generates JSON for function_simple_equal block", () => {
    const statement = getStatementByName("function_simple_equal")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.Equals',
      args: []
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_simple_if_else block", () => {
    const statement = getStatementByName("function_simple_if_else")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.IfElse',
      args: []
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_simple_as_map block", () => {
    const statement = getStatementByName("function_simple_as_map")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.AsMap',
      args: [null, null]
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_simple_get_element_by_index block", () => {
    const statement = getStatementByName("function_simple_get_element_by_index")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.GetElementByIndex',
      args: []
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_simple_get_element_by_key block", () => {
    const statement = getStatementByName("function_simple_get_element_by_key")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.GetElementByKey',
      args: []
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_simple_sort_comparable_elements block", () => {
    const statement = getStatementByName("function_simple_sort_comparable_elements")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.SortComparableElements',
      args: []
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_simple_transform_value block", () => {
    const statement = getStatementByName("function_simple_transform_value")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.TransformValue',
      args: []
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_reduce_elements block", () => {
    const statement = getStatementByName("function_simple_transform_value")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.TransformValue',
      args: []
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_reduce_elements block", () => {
    const statement = getStatementByName("function_simple_transform_value")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.TransformValue',
      args: []
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_reduce_concat_elements block", () => {
    const statement = getStatementByName("function_reduce_concat_elements")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.ConcatElements',
      args: []
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_reduce_to_list block", () => {
    const statement = getStatementByName("function_reduce_to_list")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.ToList',
      args: [null]
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for ffunction_reduce_to_map block", () => {
    const statement = getStatementByName("function_reduce_to_map")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.ToMap',
      args: []
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_reduce_to_set block", () => {
    const statement = getStatementByName("function_reduce_to_set")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.ToSet',
      args: []
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_simple_and block", () => {
    const statement = getStatementByName("function_simple_and")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.And',
      args: [null, null]
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_simple_or block", () => {
    const statement = getStatementByName("function_simple_or")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.Or',
      args: [null, null]
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_simple_switch block", () => {
    const statement = getStatementByName("function_simple_switch")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.Switch',
      args: [ null, null ]
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_reduce_to_set block", () => {
    const statement = getStatementByName("function_reduce_to_set")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.ToSet',
      args: []
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_simple_joinLists block", () => {
    const statement = getStatementByName("function_simple_joinLists")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.JoinLists',
      args: [null, null]
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });

  it("generates JSON for function_simple_DateToString block", () => {
    const statement = getStatementByName("function_simple_DateToString")

    const expectedJson = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto',
      functionClass: 'com.cyoda.plugins.mapping.core.parser.functions.impl.simple.DateToString',
      args: []
    };

    expect(JSON.stringify(expectedJson)).toEqual(JSON.stringify(statement));
  });
});
