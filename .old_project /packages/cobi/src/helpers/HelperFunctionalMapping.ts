import GeneratedTransformers
  from "../components/DataMapper/FunctionalMappingSettings/FunctionalMapping/blocks/GeneratedTransformers";

export default class HelperFunctionalMapping {
  static predefinedFunctions = {
    ifElse: "function_simple_if_else",
    sortComparableElements: "function_simple_sort_comparable_elements",
    getElementByIndex: "function_simple_get_element_by_index",
    transform: "function_simple_transform_value",
    equals: "function_simple_equal",
    getElementByKey: "function_simple_get_element_by_key",
    concat: "function_simple_concat",
    toSet: "function_reduce_to_set",
    toList: "function_reduce_to_list",
    // 'minComparableElement',
    concatElements: "function_reduce_concat_elements",
    toMap: "function_reduce_to_map",
    and: "function_simple_and",
    or: "function_simple_or",
    switch: "function_simple_switch",
    asMap: "function_simple_as_map",
    joinLists: "function_simple_joinLists",
    DateToString: "function_simple_DateToString",
    // 'maxElement',
    // 'maxComparableElement':'function_reduce_maxComparableElement'
  };

  static getFunctionName(functionObj) {
    const type = functionObj.type.toLowerCase();
    const function_name = this.predefinedFunctions[functionObj.name] || `function_${type}_${functionObj.name}`;
    return function_name;
  }

  static getTransformerName(el) {
    const {predefinedType} = GeneratedTransformers.getPredefinedTypeByKey(el.transformerKey)
    if (predefinedType) {
      return predefinedType.blockName;
    }
    const name = el.transformerKey.toLowerCase().split(".").pop().replace("$", "_");
    return `transformer_${name}`;
  }

  static getDictionaryName(dictionary, entry) {
    return `dictionary_${dictionary.provider.toLowerCase()}_${entry.name.toLowerCase()}`;
  }

  static getStatements() {
    return [
      {
        value: "statement_variables_set",
        name: "Assign Variable",
      },
      {
        value: "statement_set_dst_value",
        name: "Set Dst Value",
      },
      {
        value: "statement_return",
        name: "Return",
      },
    ];
  }

  static getExpressions() {
    return [
      {
        value: "expression_string",
        name: "String",
      },
      {
        value: "expression_long",
        name: "Long",
      },
      {
        value: "expression_double",
        name: "Double",
      },
      {
        value: "expression_var_read",
        name: "Var Read",
      },
      {
        value: "expression_src_value_read",
        name: "Src Value Read",
      },
      {
        value: "expression_meta_value_read",
        name: "Meta Value Read",
      },
      {
        value: "expression_null",
        name: "Null",
      },
      {
        value: "expression_boolean",
        name: "Boolean",
      },
    ];
  }

  static getFunctions(allFunctions) {
    const datas: any = {};
    allFunctions.forEach((el: any) => {
      const type = el.type.charAt(0).toUpperCase() + el.type.toLowerCase().slice(1);
      if (!datas[type]) {
        datas[type] = [];
      }
      datas[type].push(el);
    });
    return datas;
  }

  static getTransformers(allTransformers) {
    const datas: any = {};
    allTransformers.forEach((el: any) => {
      let type = el.inType.split(".").pop();
      if (type === '[B') type = "Bytes";
      if (!datas[type]) {
        datas[type] = [];
      }
      datas[type].push(el);
    });
    return datas;
  }
}
