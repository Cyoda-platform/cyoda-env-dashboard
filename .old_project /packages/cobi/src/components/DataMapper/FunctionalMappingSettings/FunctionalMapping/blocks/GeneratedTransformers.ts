import JSONGenerator from "../generators/json_generator";
import * as Blockly from "blockly/core";
import HelperFunctionalMapping from "../../../../../helpers/HelperFunctionalMapping";

export default class GeneratedTransformers {
  static numberTypes = {
    "java.lang.Long": "com.cyoda.plugins.mapping.core.dtos.functional.LongConstantExpressionConfigDto",
    "java.lang.Double": "com.cyoda.plugins.mapping.core.dtos.functional.DoubleConstantExpressionConfigDto",
    "java.lang.Integer": "com.cyoda.plugins.mapping.core.dtos.functional.IntegerConstantExpressionConfigDto",
    "java.lang.Float": "com.cyoda.plugins.mapping.core.dtos.functional.DoubleConstantExpressionConfigDto",
    "java.math.BigDecimal": "com.cyoda.plugins.mapping.core.dtos.functional.LongConstantExpressionConfigDto",
    "java.math.BigInteger": "com.cyoda.plugins.mapping.core.dtos.functional.IntegerConstantExpressionConfigDto",
  };

  static predefinedTypes = [
    {
      blockName: 'transformer_string_value_transformer_to_selected_type',
      title: 'StringValueTransformer',
      transformerKeys: [
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToBoolean',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToBigDecimal',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToBigInteger',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToByte',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToDouble',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToFloat',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToInt',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToLong',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToShort',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$EncodeAsBigInteger',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToClass',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToUuid',
      ]
    },
    {
      blockName: 'transformer_string_value_transformer_to_selected_type_by_predefined_format',
      title: 'StringValueTransformer',
      transformerKeys: [
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToBigDecimalByPredefinedFormat',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToDoubleByPredefinedFormat',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToLongByPredefinedFormat',
      ],
      dependsField: 'pattern'
    },
    {
      blockName: 'transformer_string_value_transformer_to_selected_type_by_arbitrary_format',
      title: 'StringValueTransformer',
      transformerKeys: [
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToDoubleByArbitraryFormat',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToLongByArbitraryFormat',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToBigDecimalByArbitraryFormat',
      ]
    },
    {
      blockName: 'transformer_string_value_transformer_by_case',
      title: 'StringValueTransformer',
      transformerKeys: [
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToUpperCase',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToLowerCase',
      ]
    },
    {
      blockName: 'transformer_string_value_transformer_to_date_time_predefined_format',
      title: 'StringValueTransformer',
      transformerKeys: [
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToDatePredefinedFormat',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToLocalDatePredefinedFormat',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToLocalTimePredefinedFormat',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToLocalDateTimePredefinedFormat',
      ],
      dependsField: 'format'
    },
    {
      blockName: 'transformer_string_value_transformer_to_date_time_arbitrary_format',
      title: 'StringValueTransformer',
      transformerKeys: [
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToDateArbitraryFormat',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToLocalDateArbitraryFormat',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToLocalTimeArbitraryFormat',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToLocalDateTimeArbitraryFormat',
      ]
    },
    {
      blockName: 'transformer_int_value_transformer_to_selected_type',
      title: 'IntValueTransformer',
      transformerKeys: [
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$ToBigDecimal',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$ToBigInteger',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$ToBoolean',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$ToByte',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$ToDouble',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$ToFloat',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$ToLong',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$ToShort',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$ToString',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$ToBinaryString',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$ToHexString',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$ToOctalString',
      ]
    },
    {
      blockName: 'transformer_int_value_transformer_math',
      title: 'IntValueTransformer',
      transformerKeys: [
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$Pow',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$Multiply',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.IntValueTransformer$Add',
      ]
    },
    {
      blockName: 'transformer_source_object_value_transformer_to_selected_type',
      title: 'SourceObjectValueTransformer',
      transformerKeys: [
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectValueTransformer$ToBoolean',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectValueTransformer$ToBigDecimal',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectValueTransformer$ToBigInteger',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectValueTransformer$ToByte',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectValueTransformer$ToBytes',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectValueTransformer$ToDouble',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectValueTransformer$ToFloat',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectValueTransformer$ToInt',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectValueTransformer$ToLong',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectValueTransformer$ToShort',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectValueTransformer$ToString',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectValueTransformer$EncodeAsBigInteger',
      ]
    },
    {
      blockName: 'transformer_source_object_hard_code_transformer_to_hard_code',
      title: 'SourceObjectHardCodeTransformer',
      transformerKeys: [
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectHardCodeTransformer$ToHardCodeString',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectHardCodeTransformer$ToHardCodeInt',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.SourceObjectHardCodeTransformer$ToHardCodeFloat',
      ]
    },
    {
      blockName: 'transformer_double_value_transformer_to_selected_type',
      title: 'DoubleValueTransformer',
      transformerKeys: [
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.DoubleValueTransformer$ToLong',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.DoubleValueTransformer$ToBigInteger',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.DoubleValueTransformer$ToInt',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.DoubleValueTransformer$ToShort',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.DoubleValueTransformer$ToFloat',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.DoubleValueTransformer$ToBigDecimal',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.DoubleValueTransformer$ToByte',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.DoubleValueTransformer$ToString',
        'com.cyoda.plugins.mapping.core.parser.valuetransformers.DoubleValueTransformer$ToHexString',
      ]
    }
  ]

  static init(listAllTransformers, workspaceCallback) {
    for (const el of listAllTransformers) {
      const {predefinedType, index} = GeneratedTransformers.getPredefinedTypeByKey(el.transformerKey)
      const transformer_name = HelperFunctionalMapping.getTransformerName(el);

      if (Blockly.Blocks[transformer_name] || (predefinedType && index>0)) continue;

      const titles = el.transformerKey.split(".").pop().replace("$", " ").split(" ");

      Blockly.Blocks[transformer_name] = {
        init: function () {
          if (predefinedType) {
            const newTitle = `${predefinedType.title} ->`;
            (this as any).appendDummyInput().appendField(new Blockly.FieldLabel((newTitle)));
            (this as any).appendDummyInput().appendField(
              new Blockly.FieldDropdown(
                GeneratedTransformers.getOptionsFromKeys(predefinedType.transformerKeys),
                (this as any).setDropdownList
              ),
              "TYPE"
            );
          } else {
            titles.forEach((title, index) => {
              const newTitle = index === 0 ? `${title} ->` : title;
              (this as any).appendDummyInput().appendField(new Blockly.FieldLabel(newTitle));
            });
          }
          (this as any).appendValueInput("VALUE").setCheck(null).setAlign(Blockly.inputs.Align.RIGHT).appendField("Value");
          (this as any).setOutput(true, null);
          (this as any).setColour(30);
          (this as any).setTooltip(el.description);
          (this as any).setHelpUrl("");
          (this as any).setInputsInline(false);

          el.requiredParameters.forEach((elArg) => {
            if (elArg.type === "java.lang.Object") {
              (this as any).appendValueInput(elArg.name).setCheck(null).setAlign(Blockly.inputs.Align.RIGHT).appendField(GeneratedTransformers.capitalizeFirstLetter(elArg.name));
            } else {
              let elArgNew = JSON.parse(JSON.stringify(elArg));
              if (predefinedType && !(this as any).isInFlyout) {
                elArgNew = GeneratedTransformers.getWithAllOptions(elArgNew, listAllTransformers, predefinedType);
              }
              // @ts-ignore
              this.appendDummyInput(elArg.name.toUpperCase()).setAlign(Blockly.inputs.Align.RIGHT).appendField(GeneratedTransformers.capitalizeFirstLetter(elArg.name), `${elArg.name}Label`).appendField(GeneratedTransformers.typeInput(elArgNew), elArg.name);
            }
          });
        },
        changeType(sourceBlock) {
          const dependsField = predefinedType && predefinedType.dependsField;
          const type = sourceBlock.getFieldValue('TYPE');
          const selectedItem = listAllTransformers.find((item) => item.transformerKey === type);
          if (!selectedItem) return;

          const elArg = selectedItem.requiredParameters.find((elArg) => elArg.name === dependsField);
          if (!elArg || !dependsField || !sourceBlock.getInput(dependsField.toUpperCase())) return;
          sourceBlock.getInput(dependsField.toUpperCase()).removeField(dependsField);
          sourceBlock.getInput(dependsField.toUpperCase()).removeField(`${dependsField}Label`);
          sourceBlock.getInput(dependsField.toUpperCase()).appendField(GeneratedTransformers.capitalizeFirstLetter(elArg.name), `${dependsField}Label`).appendField(GeneratedTransformers.typeInput(elArg), elArg.name);
        },
        onchange: function (e) {
          // Apply new type when user drag from sidebar to workspace
          if (e instanceof Blockly.Events.BlockCreate && GeneratedTransformers.getBlockFromEvent(e)) {
            const sourceBlock= GeneratedTransformers.getBlockFromEvent(e);
            // @ts-ignore
            if(!sourceBlock.isInFlyout && sourceBlock.changeType) {
              // @ts-ignore
              sourceBlock.changeType(sourceBlock);
            }
            return;
          }

          // When "finished loading" we want set all values on the place. For restore information
          if (e.type === 'finished_loading' && predefinedType && predefinedType.dependsField) {
            const sourceBlock = (this as any);

            const selectedValue = sourceBlock.getFieldValue(predefinedType.dependsField);
            setTimeout(() => {
              // @ts-ignore
              sourceBlock.changeType(sourceBlock);
              if(sourceBlock.getFieldValue(predefinedType.dependsField)) {
                sourceBlock.setFieldValue(selectedValue, predefinedType.dependsField);
              }
            }, 100);
            return;
          }

          // When we change blocks we want change tooltip olso and related fields
          if(!e.workspaceId || !e.blockId || !(e instanceof Blockly.Events.BlockChange)) return;
          const workspace = Blockly.Workspace.getById(e.workspaceId);
          const sourceBlock=workspace.getBlockById(e.blockId);
          const type = sourceBlock.getFieldValue('TYPE');

          if (type){
            const selectedItem = listAllTransformers.find((item) => item.transformerKey === type);
            sourceBlock.setTooltip(selectedItem.description);
          }
          // @ts-ignore
          if (e.name !== "TYPE") return;
          // const sourceBlock =  (this as any).getSourceBlock();
          // @ts-ignore
          sourceBlock.changeType(sourceBlock);
        },
      };

      JSONGenerator.forBlock[transformer_name] = function (block) {
        const values: any[] = [];
        if (predefinedType) {
          values.push(`
           {
            "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.StringConstantExpressionConfigDto",
            "constantSource": "INPUT",
            "value": "${block.getFieldValue('TYPE')}"
           }
          `);
        } else {
          values.push(`
           {
            "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.StringConstantExpressionConfigDto",
            "constantSource": "INPUT",
            "value": "${el.transformerKey}"
           }
          `);
        }
        values.push(JSONGenerator.valueToCode(block, "VALUE", JSONGenerator.ORDER_ATOMIC) || "null");
        for (const elArg of el.requiredParameters) {
          let value: any = "";
          if (block.getFieldValue(elArg.name) === "") {
            value = null;
          } else {
            value = block.getFieldValue(elArg.name);
          }

          if (value === null && elArg.type === "java.lang.String") {
            value = "";
          }

          values.push(`
            {
            "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.StringConstantExpressionConfigDto",
            "constantSource": "INPUT",
            "value": "${elArg.name}"
            }
          `);

          if (elArg.type === "java.lang.Object") {
            values.push(JSONGenerator.valueToCode(block, elArg.name, JSONGenerator.ORDER_ATOMIC) || "null");
          } else if (GeneratedTransformers.numberTypes[elArg.type]) {
            values.push(`{
              "@bean": "${GeneratedTransformers.numberTypes[elArg.type]}",
              "constantSource": "INPUT",
              "value": ${value}
            }`);
          } else {
            values.push(`{
              "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.StringConstantExpressionConfigDto",
              "constantSource": "INPUT",
              "value": "${value}"
            }`);
          }
        }
        const code = `{
                "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
                "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.TransformValue",
                "args": [${values.filter((el) => el).join(", ")}]
                }`;
        return [code, JSONGenerator.ORDER_NONE];
      };
    }
  }

  static capitalizeFirstLetter(string) {
    return (string.charAt(0).toUpperCase() + string.slice(1)).replace(".", " ");
  }

  static typeInput(parameter) {
    let typeInput: any = new Blockly.FieldTextInput(parameter.defaultValue || "");
    parameter.restrictions.forEach((el) => {
      if (el.type === "STR_CHOICE") {
        const options: any[] = [];
        el.parameter.forEach((elPar: string) => {
          options.push([elPar, elPar]);
        });
        typeInput = new Blockly.FieldDropdown(options);
      } else if (el.type.indexOf("INT_") > -1 || el.type.indexOf("FLOAT_") > -1) {
        typeInput = new Blockly.FieldNumber(parameter.defaultValue || 0, GeneratedTransformers.minNumbers(parameter), GeneratedTransformers.maxNumbers(parameter));
      }
    });
    return typeInput;
  }

  static minNumbers(parameter) {
    let min = -Infinity;
    parameter.restrictions.forEach((el) => {
      if (el.type === "INT_GT") {
        min = el.parameter + 1;
      } else if (el.type === "INT_GTE") {
        min = el.parameter;
      }
    });
    return min;
  }

  static maxNumbers(parameter) {
    let max = Infinity;
    parameter.restrictions.forEach((el) => {
      if (el.type === "INT_LT") {
        max = el.parameter - 1;
      } else if (el.type === "INT_LTE") {
        max = el.parameter;
      }
    });
    return max;
  }

  static getOptionsFromKeys(keys) {
    return keys.map((el) => {
      const name = el.split('$').pop();
      return [name, el];
    })
  }

  static getPredefinedTypeByKey(key) {
    const predefinedType=GeneratedTransformers.predefinedTypes.find((el) => el.transformerKeys.includes(key));
    return {
      predefinedType,
      index: predefinedType && predefinedType.transformerKeys.indexOf(key) || undefined
    }
  }

  static getWithAllOptions(elArg, listAllTransformers, predefinedType) {
    if (elArg.restrictions.length === 0) return elArg

    const option = elArg.restrictions[0].parameter;
    predefinedType.transformerKeys.forEach(key => {
      const transformer = listAllTransformers.find((transformer) => transformer.transformerKey === key);
      const parameter = transformer.requiredParameters.find((el) => el.name === predefinedType.dependsField);
      if (parameter && parameter.restrictions) {
        const restriction = parameter.restrictions.find((el) => el.type === 'STR_CHOICE');
        restriction.parameter.forEach((el) => {
          if(!option.includes(el)) option.push(el);
        })
      }
    });
    return elArg;
  }

  static getBlockFromEvent(e){
    if(e.workspaceId && e.blockId){
      const workspace = Blockly.Workspace.getById(e.workspaceId);
      return workspace.getBlockById(e.blockId);
    }

    return null;
  }
}
