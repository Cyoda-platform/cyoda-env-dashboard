// @ts-ignore
import * as fs from "fs";
import BlocklyGenerator
  from "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/generators/blockly_generator";

describe("blockly_generator.spec.ts", () => {
  it("Transform JSON to Blockly", async () => {
    for (let i = 1; i < 19; i++) {
      // @ts-ignore
      const configText = fs.readFileSync(`${__dirname}/../../../../../../../data/Blockly/configs/export_config${i}.json`, "utf8");
      // @ts-ignore
      const allFunctions = fs.readFileSync(`${__dirname}/../../../../../../../data/Blockly/functions.json`, "utf8");
      // @ts-ignore
      const allTransformers = fs.readFileSync(`${__dirname}/../../../../../../../data/Blockly/transformers.json`, "utf8");
      const generator = new BlocklyGenerator();
      generator.setMappingConfigDto(JSON.parse(configText));
      generator.setAllFunctions(JSON.parse(allFunctions));
      generator.setAllTransformers(JSON.parse(allTransformers));
      const xml = generator.transform();
      // console.log(xml);
    }
  });
});
