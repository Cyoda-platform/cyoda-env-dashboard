import HelperFunctionalMapping from "../../../../src/helpers/HelperFunctionalMapping";

describe("HelperFunctionalMapping Tests", () => {
  it("should return correct function name for predefined function", () => {
    const functionObj = { type: "IFELSE", name: "ifElse" };
    const functionName = HelperFunctionalMapping.getFunctionName(functionObj);
    expect(functionName).toEqual("function_simple_if_else");
  });

  it("should return correct function name for custom function", () => {
    const functionObj = { type: "CUSTOM", name: "MyFunction" };
    const functionName = HelperFunctionalMapping.getFunctionName(functionObj);
    expect(functionName).toEqual("function_custom_MyFunction");
  });

  it("should return correct transformer name for predefined transformer", () => {
    const el = { transformerKey: "com.cyoda.plugins.mapping.core.parser.valuetransformers.StringValueTransformer$ToBoolean" };
    const transformerName = HelperFunctionalMapping.getTransformerName(el);
    expect(transformerName).toEqual("transformer_string_value_transformer_to_selected_type");
  });

  it("should return correct transformer name for custom transformer", () => {
    const el = { transformerKey: "com.example.CustomTransformer$MyTransformer" };
    const transformerName = HelperFunctionalMapping.getTransformerName(el);
    expect(transformerName).toEqual("transformer_customtransformer_mytransformer");
  });

  it("should return correct dictionary name", () => {
    const dictionary = { provider: "MyProvider" };
    const entry = { name: "MyEntry" };
    const dictionaryName = HelperFunctionalMapping.getDictionaryName(dictionary, entry);
    expect(dictionaryName).toEqual("dictionary_myprovider_myentry");
  });

  it("should return correct list of statements", () => {
    const statements = HelperFunctionalMapping.getStatements();
    const expectedStatements = [
      { value: "statement_variables_set", name: "Assign Variable" },
      { value: "statement_set_dst_value", name: "Set Dst Value" },
      { value: "statement_return", name: "Return" },
    ];
    expect(statements).toEqual(expectedStatements);
  });

  it("should return correct list of expressions", () => {
    const expressions = HelperFunctionalMapping.getExpressions();
    const expectedExpressions = [
      { value: "expression_string", name: "String" },
      { value: "expression_long", name: "Long" },
      { value: "expression_double", name: "Double" },
      { value: "expression_var_read", name: "Var Read" },
      { value: "expression_src_value_read", name: "Src Value Read" },
      { value: "expression_meta_value_read", name: "Meta Value Read" },
      { value: "expression_null", name: "Null" },
      { value: "expression_boolean", name: "Boolean" },
    ];
    expect(expressions).toEqual(expectedExpressions);
  });

  it("should group functions by type", () => {
    const allFunctions = [
      { type: "type1", name: "Function1" },
      { type: "type2", name: "Function2" },
      { type: "type1", name: "Function3" },
    ];
    const groupedFunctions = HelperFunctionalMapping.getFunctions(allFunctions);
    const expectedGroupedFunctions = {
      Type1: [{ type: "type1", name: "Function1" }, { type: "type1", name: "Function3" }],
      Type2: [{ type: "type2", name: "Function2" }],
    };
    expect(groupedFunctions).toEqual(expectedGroupedFunctions);
  });

  it("should group transformers by type", () => {
    const allTransformers = [
      { inType: "com.example.Type1", name: "Transformer1" },
      { inType: "com.example.Type2", name: "Transformer2" },
      { inType: "[B", name: "BytesTransformer" },
    ];
    const groupedTransformers = HelperFunctionalMapping.getTransformers(allTransformers);
    const expectedGroupedTransformers = {
      Type1: [{ inType: "com.example.Type1", name: "Transformer1" }],
      Type2: [{ inType: "com.example.Type2", name: "Transformer2" }],
      Bytes: [{ inType: "[B", name: "BytesTransformer" }],
    };
    expect(groupedTransformers).toEqual(expectedGroupedTransformers);
  });
});
