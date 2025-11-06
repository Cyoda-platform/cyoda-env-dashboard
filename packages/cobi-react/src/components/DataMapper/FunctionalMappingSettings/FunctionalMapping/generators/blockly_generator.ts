import type {FunctionalExpressionConfigDto, FunctionalStatementConfigDto, MappingConfigDto} from "../../../MappingConfigDto.d.ts";
import {v4 as uuidv4} from "uuid";
import HelperFunctionalMapping from "../../../../../utils/functionalMappingHelper";
import {encode} from 'html-entities';
import GeneratedTransformers from "../blocks/GeneratedTransformers";

interface ParamsBlock {
  fields?: { name: string; value: string | undefined; id?: string }[];
  values?: { name: string; value: string }[];
  next?: FunctionalStatementConfigDto;
  mutations?: number;
}

export default class BlocklyGenerator {
  private mappingConfigDto: MappingConfigDto | null = null;
  private allFunctions: any[] = [];
  private allTransformers: any[] = [];
  private allDictionaries: any[] = [];
  private variablesObj: any = {};
  private xmlDataObj: any = {};

  setMappingConfigDto(mappingConfigDto: MappingConfigDto) {
    this.mappingConfigDto = mappingConfigDto;
  }

  setAllFunctions(allFunctions) {
    this.allFunctions = allFunctions;
  }

  setAllTransformers(allTransformers) {
    this.allTransformers = allTransformers;
  }
  setAllDictionaries(allDictionaries) {
    this.allDictionaries = allDictionaries;
  }

  transform() {
    this.mappingConfigDto.entityMappings.forEach((entityMapping) => {
      entityMapping.functionalMappings.forEach((functionalMapping) => {
        let xml = '<xml xmlns="https://developers.google.com/blockly/xml">';
        const statements = JSON.parse(JSON.stringify(functionalMapping.statements));

        statements.forEach((statement, index) => {
          if (statements[index + 1]) {
            this.buildStatementTree(statement, statements[index + 1]);
          }
        });
        const newSatementTree = statements[0];

        xml += this.runVariables(functionalMapping.statements);
        xml += this.buildStatement(newSatementTree);

        xml += "</xml>";
        this.xmlDataObj[functionalMapping.dstPath.replace(/\./g, "_")] = xml;
      });
    });
    return this.xmlDataObj;
  }

  // Run variables
  runVariables(statements: FunctionalStatementConfigDto[]) {
    this.variablesObj = {};
    let xml = "";
    const variablesStatements = statements.filter((statement) => {
      return statement.type === "ASSIGN_VAR";
    });
    if (variablesStatements.length > 0) {
      xml += "<variables>";
      variablesStatements.forEach((variablesStatement) => {
        const id = uuidv4();
        // @ts-ignore
        this.variablesObj[variablesStatement.variableName] = id;
        xml += `<variable id="${id}">${variablesStatement.variableName}</variable>`;
      });
      xml += "</variables>";
    }
    return xml;
  }

  // Run Statement
  runStatement() {
    let xml = "";
    this.mappingConfigDto.entityMappings.forEach((entityMapping) => {
      entityMapping.functionalMappings.forEach((functionalMapping) => {
        const statements = functionalMapping.statements;
        statements.forEach((statement, index) => {
          if (statements[index + 1]) {
            this.buildStatementTree(statement, statements[index + 1]);
          }
        });

        const newSatementTree = statements[0];
        xml += this.buildStatement(newSatementTree);
      });
    });
    return xml;
  }

  // Statements
  buildStatement(statement: FunctionalStatementConfigDto) {
    if (statement.type == "RETURN") {
      return this.buildBlock("statement_return", {
        values: [
          {
            name: "EXPRESSION",
            value: this.buildExpression(statement.expression),
          },
        ],
      });
    } else if (statement.type == "SET_DST_VALUE") {
      return this.buildBlock("statement_set_dst_value", {
        fields: [
          {
            name: "DST_PATH",
            value: statement.dstPath,
          },
          {
            name: "DST_SET_MODES",
            value: JSON.stringify(statement.collectElemsSetModes)!,
          },
        ],
        values: [
          {
            name: "VALUE",
            value: this.buildExpression(statement.expression),
          },
        ],
        next: (statement as any).statement,
      });
    } else if (statement.type == "ASSIGN_VAR") {
      return this.buildBlock("statement_variables_set", {
        fields: [
          {
            name: "VAR",
            value: statement.variableName,
            // @ts-ignore
            id: this.variablesObj[statement.variableName],
          },
        ],
        values: [
          {
            name: "VALUE",
            value: this.buildExpression(statement.expression),
          },
        ],
        next: (statement as any).statement,
      });
    } else if (Object.keys(statement).includes("functionClass")) {
      // @ts-ignore
      return this.buildFunction(statement);
    } else if (Object.keys(statement).length == 2 && Object.keys(statement).includes("value") && Object.keys(statement).includes("@bean")) {
      // @ts-ignore
      return this.buildExpression(statement);
    }
  }

  // Expression
  buildExpression(expression: FunctionalExpressionConfigDto) {
    let partialXml = "";
    if(!expression) return partialXml;
    const name = expression["@bean"].split(".").pop();

    if (expression.constantSource === "DICTIONARY") {
      const dictionary = this.allDictionaries.find((dictionary) => dictionary.entries.find((entry) => entry.name === expression.name));
      const entry = dictionary.entries.find((entry) => entry.name === expression.name)
      const dictionary_name = HelperFunctionalMapping.getDictionaryName(dictionary, entry);
      let value=""
      if (expression['@bean'].includes('Long')) {
        // @ts-ignore
        value = expression.value.value
      } else {
        value = expression.value;
      }
      partialXml = this.buildBlock(dictionary_name, {
        fields: [
          {
            name: "VALUE",
            value,
          },
        ],
      });
    } else if (name == "StringConstantExpressionConfigDto") {
      partialXml = this.buildBlock("expression_string", {
        fields: [
          {
            name: "NAME",
            value: expression.value,
          },
        ],
      });
    } else if (name == "LongConstantExpressionConfigDto") {
      partialXml = this.buildBlock("expression_long", {
        fields: [
          {
            name: "NAME",
            // @ts-ignore
            value: expression.value.value,
          },
        ],
      });
    } else if (name == "DoubleConstantExpressionConfigDto") {
      partialXml = this.buildBlock("expression_double", {
        fields: [
          {
            name: "NAME",
            value: expression.value,
          },
        ],
      });
    } else if (name == "VarReadExpressionConfigDto") {
      partialXml = this.buildBlock("expression_var_read", {
        fields: [
          {
            name: "NAME",
            value: expression.variableName,
            // @ts-ignore
            id: this.variablesObj[expression.variableName],
          },
        ],
      });
    } else if (name == "SrcValueReadExpressionConfigDto") {
      partialXml = this.buildBlock("expression_src_value_read", {
        fields: [
          {
            name: "NAME",
            value: expression.srcPath,
          },
        ],
      });
    } else if (name == "NullValueExpressionConfigDto") {
      partialXml = this.buildBlock("expression_null", {});
    } else if (name == "BooleanConstantExpressionConfigDto") {
      partialXml = this.buildBlock("expression_boolean", {
        fields: [
          {
            name: "VALUE",
            value: expression.value ? "TRUE" : "FALSE",
          },
        ],
      });
    } else if (name == "FunctionExpressionConfigDto") {
      // @ts-ignore
      partialXml = this.buildFunction(expression);
    } else if (name == "MetaValueReadExpressionConfigDto") {
      // @ts-ignore
      partialXml = this.buildBlock("expression_meta_value_read", {
        fields: [
          {
            name: "NAME",
            value: expression.metaPath,
          },
        ],
      });
    }
    return partialXml;
  }

  buildFunction(expression: FunctionalExpressionConfigDto) {
    if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.Concat") {
      const values: any[] = [];
      expression.args.forEach((arg, index) => {
        values.push({
          name: `ADD${index}`,
          value: this.buildExpression(arg),
        });
      });
      return this.buildBlock("function_simple_concat", {
        values,
        mutations: expression.args.length,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.DateToString") {
      const values: any[] = [
        {
          name: "value",
          value: this.buildExpression(expression.args[0]),
        },
        {
          name: "format",
          value: this.buildExpression(expression.args[1]),
        },
      ];
      if(expression.args[2]){
        values.push({
          name: "timeZone",
          value: this.buildExpression(expression.args[2]),
        })
      }
      return this.buildBlock("function_simple_DateToString", {
        values,
        mutations: expression.args.length == 3 ? 1 : 0,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.JoinLists") {
      const values: any[] = [];
      expression.args.forEach((arg, index) => {
        values.push({
          name: `ADD${index}`,
          value: this.buildExpression(arg),
        });
      });
      return this.buildBlock("function_simple_joinLists", {
        values,
        mutations: expression.args.length,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.Equals") {
      const values: any[] = [
        {
          name: "A",
          value: this.buildExpression(expression.args[0]),
        },
        {
          name: "B",
          value: this.buildExpression(expression.args[1]),
        },
      ];
      return this.buildBlock("function_simple_equal", {
        values,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.IfElse") {
      const values: any[] = [
        {
          name: "IF",
          value: this.buildExpression(expression.args[0]),
        },
        {
          name: "THEN",
          value: this.buildExpression(expression.args[1]),
        },
        {
          name: "ELSE",
          value: this.buildExpression(expression.args[2]),
        },
      ];
      return this.buildBlock("function_simple_if_else", {
        values,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.AsMap") {
      const values: any[] = [];
      expression.args.forEach((arg, index) => {
        values.push({
          name: `ADD${index}`,
          value: this.buildExpression(arg),
        });
      });
      return this.buildBlock("function_simple_as_map", {
        values,
        mutations: expression.args.length,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.And") {
      const values: any[] = [];
      expression.args.forEach((arg, index) => {
        values.push({
          name: `ADD${index}`,
          value: this.buildExpression(arg),
        });
      });
      return this.buildBlock("function_simple_and", {
        values,
        mutations: expression.args.length,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.Or") {
      const values: any[] = [];
      expression.args.forEach((arg, index) => {
        values.push({
          name: `ADD${index}`,
          value: this.buildExpression(arg),
        });
      });
      return this.buildBlock("function_simple_or", {
        values,
        mutations: expression.args.length,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.Switch") {
      const values: any[] = [];
      expression.args.forEach((arg, index) => {
        values.push({
          name: `ADD${index}`,
          value: this.buildExpression(arg),
        });
      });
      return this.buildBlock("function_simple_switch", {
        values,
        mutations: expression.args.length,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.GetElementByIndex") {
      const values: any[] = [
        {
          name: "LIST",
          value: this.buildExpression(expression.args[0]),
        },
        {
          name: "INDEX",
          value: this.buildExpression(expression.args[1]),
        },
      ];
      return this.buildBlock("function_simple_get_element_by_index", {
        values,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.GetElementByKey") {
      const values: any[] = [
        {
          name: "LIST",
          value: this.buildExpression(expression.args[0]),
        },
        {
          name: "KEY",
          value: this.buildExpression(expression.args[1]),
        },
      ];
      return this.buildBlock("function_simple_get_element_by_key", {
        values,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.SortComparableElements") {
      const values: any[] = [
        {
          name: "NAME",
          value: this.buildExpression(expression.args[0]),
        },
      ];
      return this.buildBlock("function_simple_sort_comparable_elements", {
        values,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.AvgElement" || expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.MaxComparableElement" || expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.MinComparableElement") {
      const listOp = {
        "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.AvgElement": "AVG",
        "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.MaxComparableElement": "MAX",
        "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.MinComparableElement": "MIN",
      };

      const values: any[] = [
        {
          name: "LIST",
          value: this.buildExpression(expression.args[0]),
        },
      ];
      const fields: any[] = [
        {
          name: "OP",
          value: listOp[expression.functionClass],
        },
      ];
      return this.buildBlock("function_reduce_elements", {
        values,
        fields,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.ConcatElements") {
      const values: any[] = [
        {
          name: "LIST",
          value: this.buildExpression(expression.args[0]),
        },
        {
          name: "DELIMITER",
          value: this.buildExpression(expression.args[1]),
        },
      ];
      return this.buildBlock("function_reduce_concat_elements", {
        values,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.ToList") {
      const values: any[] = [];
      expression.args.forEach((arg, index) => {
        values.push({
          name: `ADD${index}`,
          value: this.buildExpression(arg),
        });
      });
      return this.buildBlock("function_reduce_to_list", {
        values,
        mutations: expression.args.length,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.ToMap") {
      const values: any[] = [
        {
          name: "KEYS",
          value: this.buildExpression(expression.args[0]),
        },
        {
          name: "VALUES",
          value: this.buildExpression(expression.args[1]),
        },
      ];
      return this.buildBlock("function_reduce_to_map", {
        values,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.ToSet") {
      const values: any[] = [
        {
          name: "LIST",
          value: this.buildExpression(expression.args[0]),
        },
      ];
      return this.buildBlock("function_reduce_to_set", {
        values,
      });
    } else if (expression.functionClass == "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.TransformValue") {
      const [transformer, valueTransformer, ...parametersTransformer] = expression.args;
      const transformerUsed = this.allTransformers.find((transformerObj) => {
        return transformerObj.transformerKey === transformer.value;
      });
      const transformer_name = HelperFunctionalMapping.getTransformerName(transformerUsed);
      const values: any[] = [
        {
          name: "VALUE",
          value: this.buildExpression(valueTransformer),
        },
      ];

      const fields: any[] = [];

      const allBlockNames = GeneratedTransformers.predefinedTypes.map((el) => el.blockName);
      if (allBlockNames.includes(transformer_name)) {
        fields.push({
          name: 'TYPE',
          value: expression.args[0].value,
        });
      }

      parametersTransformer.forEach((el, index) => {
        if (index % 2 === 0) {
          const parameter = transformerUsed.requiredParameters.find((requiredParameter) => requiredParameter.name === el.value);
          if (parameter.type === "java.lang.Object") {
            values.push({
              name: el.value,
              value: this.buildExpression(parametersTransformer[index + 1]),
            });
          } else {
            fields.push({
              name: el.value,
              value: parametersTransformer[index + 1].value,
            });
          }
        }
      });

      return this.buildBlock(transformer_name, {
        values,
        fields,
      });
    } else {
      const functionUsed = this.allFunctions.find((funObj) => {
        return funObj.functionClass === expression.functionClass;
      });
      if (functionUsed) {
        const function_name = HelperFunctionalMapping.getFunctionName(functionUsed);
        const values: any[] = [];
        functionUsed.args.forEach((elArg: any, index) => {
          values.push({
            name: elArg.name,
            value: this.buildExpression(expression.args[index]),
          });
        });
        return this.buildBlock(function_name, {
          values,
        });
      }
    }
  }

  buildBlock(name: string, params: ParamsBlock) {
    const id = uuidv4();

    let xmlMutations = "";
    if (params.mutations) {
      xmlMutations += this.buildMutation(params.mutations);
    }
    let xmlFields = "";
    if (params.fields) {
      params.fields.forEach((param) => {
        xmlFields += this.buildField(param.name, param.value, param.id);
      });
    }

    let xmlValues = "";
    if (params.values) {
      params.values.forEach((param) => {
        xmlValues += this.buildValue(param.name, param.value);
      });
    }

    let xmlNext = "";
    if (params.next) {
      xmlNext = this.buildNext(params.next);
    }

    return `<block type="${name}" id="${id}">${xmlMutations}${xmlFields}${xmlValues}${xmlNext}</block>`;
  }

  buildField(name: string, value: string, id?: string) {
    const valueComputed = this.getValue(value);
    return `<field name="${name}" ${id ? `id="${id}"` : ""}>${valueComputed}</field>`;
  }

  getValue(value) {
    if (typeof value === "string") {
      return encode(value);
    }
    return value;
  }

  buildValue(name: string, value: string) {
    return `<value name="${name}">${value}</value>`;
  }

  buildNext(statement: FunctionalStatementConfigDto) {
    return `<next>${this.buildStatement(statement)}</next>`;
  }

  buildMutation(count: number) {
    return `<mutation items="${count}"></mutation>`;
  }

  buildStatementTree(statement: any, nextStatement) {
    statement.statement = nextStatement;
    return statement;
  }
}
