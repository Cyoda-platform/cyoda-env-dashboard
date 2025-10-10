import * as Blockly from "blockly/core";
import JSONGenerator
  from "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/generators/json_generator";
import GeneratedTransformers
  from "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/blocks/GeneratedTransformers";
import transformers from "../../../../../../../../tests/data/Blockly/transformers.json"
import generatedTransformersSnapshot
  from "../../../../../../../../tests/data/test_data/generatedTransformersSnapshot.json"
import HelperFunctionalMapping from "../../../../../../../../src/helpers/HelperFunctionalMapping";
import {getStatementByName} from "../../../../../../../helpers/HelperBlockly";

describe("GeneratedTransformers Tests", () => {

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

  it("Compare result with snapshot", () => {
    const workspace = new Blockly.Workspace();
    GeneratedTransformers.init(transformers, workspace);
    for (const el of transformers) {
      const transformer_name = HelperFunctionalMapping.getTransformerName(el);
      const statement = getStatementByName(transformer_name);

      expect(JSON.stringify(generatedTransformersSnapshot[transformer_name])).toEqual(JSON.stringify(statement));
    }
  });

});
