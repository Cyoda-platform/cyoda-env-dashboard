import * as Blockly from "blockly/core";
import HelperFunctionalMapping from "../../../../../../../../src/helpers/HelperFunctionalMapping";
import GeneratedDictionaries
  from "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/blocks/GeneratedDictionaries";
import JSONGenerator
  from "../../../../../../../../src/components/DataMapper/FunctionalMappingSettings/FunctionalMapping/generators/json_generator";

describe("Тесты GeneratedDictionaries", () => {
  it("должен инициализировать блоки Blockly и JSONGenerator для словарей", () => {
    const listAllDictionaries = [
      {
        provider: "test",
        entries: [
          {
            name: "entry1",
            values: [1, 2, 3],
            type: "Long",
          },
          {
            name: "entry2",
            values: ["value1", "value2", "value3"],
            type: "String",
          },
        ],
      },
    ];

    vi.spyOn(HelperFunctionalMapping, "getDictionaryName").mockImplementation(
      (dictionary, entry) => `dictionary_${dictionary.provider}_${entry.name}`
    );

    GeneratedDictionaries.init(listAllDictionaries);

    const workspace = new Blockly.Workspace();

    listAllDictionaries.forEach((dictionary) => {
      dictionary.entries.forEach((entry) => {
        const dictionaryName = HelperFunctionalMapping.getDictionaryName(dictionary, entry);

        expect(Blockly.Blocks[dictionaryName]).toBeDefined();

        expect(JSONGenerator.forBlock[dictionaryName]).toBeDefined();

        const block = workspace.newBlock(dictionaryName);

        const testValue = entry.values[0].toString();
        block.setFieldValue(testValue, "VALUE");

        let valueField;
        if (entry.type.includes("Long")) {
          valueField = {
            "@type": "Long",
            "value": Number(testValue),
          };
        } else if (entry.type.includes("String")) {
          valueField = testValue;
        }

        const expectedJsonObj = {
          "@bean": entry.type,
          "constantSource": "DICTIONARY",
          "value": valueField,
          "name": entry.name,
        };

        const [generatedJsonStr] = JSONGenerator.forBlock[dictionaryName](block);
        const generatedJsonObj = JSON.parse(generatedJsonStr);

        expect(generatedJsonObj).toEqual(expectedJsonObj);
      });
    });

    workspace.dispose();
  });
});
