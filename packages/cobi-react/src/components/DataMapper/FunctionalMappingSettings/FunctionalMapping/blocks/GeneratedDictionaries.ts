import JSONGenerator from "../generators/json_generator";
import * as Blockly from "blockly/core";
import HelperFunctionalMapping from "../../../../../utils/functionalMappingHelper";

export default class GeneratedDictionaries {
  static init(listAllDictionaries) {
    listAllDictionaries.forEach((dictionary) => {
      dictionary.entries.forEach((entry) => {
        const dictionary_name = HelperFunctionalMapping.getDictionaryName(dictionary, entry);
        Blockly.Blocks[dictionary_name] = {
          init: function () {
            // @ts-ignore
            this.appendDummyInput().appendField(entry.name);
            const options = [];
            entry.values.forEach((el) => {
              options.push([el.toString(), el.toString()]);
            })
            // @ts-ignore
            this.appendDummyInput().appendField(
              new Blockly.FieldDropdown(
                options
              ),
              "VALUE"
            );
            // @ts-ignore
            this.setOutput(true, null);
            // @ts-ignore
            this.setColour(50);
            // @ts-ignore
            this.setHelpUrl("");
          },
        };

        JSONGenerator.forBlock[dictionary_name] = function (block) {
          const value = block.getFieldValue("VALUE");
          let valueSelected = entry.values.find((el) => el.toString() === value);
          if(entry.type.includes("Long")){
            valueSelected = `{
              "@type": "Long",
              "value": ${valueSelected}
              }`
          } else if(entry.type.includes("String")){
            valueSelected=`"${valueSelected}"`;
          }
          const code = `{
                "@bean": "${entry.type}",
                "constantSource": "DICTIONARY",
                "value": ${valueSelected},
                "name": "${entry.name}"
                }`;
          return [code, JSONGenerator.ORDER_NONE];
        }
      })
    });
  }
}
