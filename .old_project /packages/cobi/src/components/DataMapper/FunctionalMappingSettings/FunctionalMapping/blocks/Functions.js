import JSONGenerator from "../generators/json_generator";
import * as Blockly from "blockly/core";
import 'blockly/blocks'; // Do not remove

// Start Simple Concat
Blockly.Blocks["function_simple_concat"] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this {Blockly.Block}
   */
  init: function () {
    this.appendDummyInput().appendField("Concat");
    this.setStyle("list_blocks");
    this.itemCount_ = 2;
    this.updateShape_();
    this.setOutput(true, "Array");
    this.setMutator(new Blockly.icons.MutatorIcon(['text_create_join_item'], this));
    this.setTooltip("Concatenate all args. Min args count - 2, Max args count - unbounded");
  },
  /**
   * Create XML to represent list inputs.
   * @return {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("items", this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute("items"), 10);
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function (workspace) {
    const containerBlock = workspace.newBlock("lists_create_with_container");
    containerBlock.initSvg();
    let connection = containerBlock.getInput("STACK").connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock = workspace.newBlock("lists_create_with_item");
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function (containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    // Count number of inputs.
    const connections = [];
    while (itemBlock && !itemBlock.isInsertionMarker()) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    // Disconnect any children that don't belong.
    for (let i = 0; i < this.itemCount_; i++) {
      const connection = this.getInput("ADD" + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) === -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    if (this.itemCount_ < 2) this.itemCount_ = 2;
    this.updateShape_();
    // Reconnect any child blocks.
    for (let i = 0; i < this.itemCount_; i++) {
      Blockly.icons.MutatorIcon.reconnect(connections[i], this, "ADD" + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  saveConnections: function (containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    let i = 0;
    while (itemBlock) {
      const input = this.getInput("ADD" + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this {Blockly.Block}
   */
  updateShape_: function () {
    if (this.itemCount_ && this.getInput("EMPTY")) {
      this.removeInput("EMPTY");
    } else if (!this.itemCount_ && !this.getInput("EMPTY")) {
      this.appendDummyInput("EMPTY").appendField(Blockly.Msg["LISTS_CREATE_EMPTY_TITLE"]);
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        this.appendValueInput("ADD" + i).setAlign(Blockly.inputs.Align.RIGHT);
      }
    }
    // Remove deleted inputs.
    while (this.getInput("ADD" + i)) {
      this.removeInput("ADD" + i);
      i++;
    }
  },
};

JSONGenerator.forBlock["math_number"] = function (block) {
  // Numeric value.
  const code = Number(block.getFieldValue("NUM"));
  const order = code >= 0 ? JSONGenerator.ORDER_ATOMIC : JSONGenerator.ORDER_UNARY_NEGATION;
  return [code, order];
};

JSONGenerator.forBlock["function_simple_concat"] = function (block) {
  // Create a list with any number of elements of any type.
  const elements = new Array(block.itemCount_);
  for (let i = 0; i < block.itemCount_; i++) {
    elements[i] = JSONGenerator.valueToCode(block, "ADD" + i, JSONGenerator.ORDER_NONE) || "null";
  }
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.Concat",
        "args":[${elements.filter((el) => el).join(", ")}]
        }`;
  return [code, JSONGenerator.ORDER_ATOMIC];
};

// End Simple Concat

// Start Equal
Blockly.Blocks["function_simple_equal"] = {
  init: function () {
    this.appendValueInput("A").appendField("Equal").setCheck(null);
    this.appendValueInput("B")
      .setCheck(null)
      // .appendField(new Blockly.FieldDropdown([["=","EQ"]]), "OP");
      .appendField("=");
    this.setInputsInline(true);
    this.setOutput(true, "Boolean");
    this.setTooltip("Function checks that two args equal each other");
    this.setColour(260);
  },
};

JSONGenerator.forBlock["function_simple_equal"] = function (block) {
  const value_a = JSONGenerator.valueToCode(block, "A", JSONGenerator.ORDER_ATOMIC);
  const value_b = JSONGenerator.valueToCode(block, "B", JSONGenerator.ORDER_ATOMIC);
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.Equals",
        "args":[${[value_a, value_b].filter((el) => el).join(", ")}]
        }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// End Equal

// Start If Else
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#av3rix
Blockly.Blocks["function_simple_if_else"] = {
  init: function () {
    this.appendDummyInput().appendField("If Else");
    this.appendValueInput("IF").setCheck(null).appendField("Test");
    this.appendValueInput("THEN").setCheck(null).appendField("If true");
    this.appendValueInput("ELSE").setCheck(null).appendField("If false");
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip("If/Else function. Takes 3 args. First arg is condition. Returns second arg if condition is TRUE, else returns third arg");
  },
};

JSONGenerator.forBlock["function_simple_if_else"] = function (block) {
  const value_if = JSONGenerator.valueToCode(block, "IF", JSONGenerator.ORDER_ATOMIC);
  const value_then = JSONGenerator.valueToCode(block, "THEN", JSONGenerator.ORDER_ATOMIC);
  const value_else = JSONGenerator.valueToCode(block, "ELSE", JSONGenerator.ORDER_ATOMIC);
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.IfElse",
        "args":[${[value_if, value_then, value_else].filter((el) => el).join(", ")}]
        }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// End If Else

// Start As Map
Blockly.Blocks["function_simple_as_map"] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this {Blockly.Block}
   */
  init: function () {
    this.appendDummyInput().appendField("As Map");
    this.setStyle("list_blocks");
    this.itemCount_ = 2;
    this.updateShape_();
    this.setOutput(true, "Array");
    this.setMutator(new Blockly.icons.MutatorIcon(['text_create_join_item'], this));
    this.setTooltip("Converts pairs of args to map. Min number of args - 2. Odd argument: key of type String. Even argument: value of type Object");
  },
  /**
   * Create XML to represent list inputs.
   * @return {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("items", this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute("items"), 10);
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function (workspace) {
    const containerBlock = workspace.newBlock("lists_create_with_container");
    containerBlock.initSvg();
    let connection = containerBlock.getInput("STACK").connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock = workspace.newBlock("lists_create_with_item");
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function (containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    // Count number of inputs.
    const connections = [];
    while (itemBlock && !itemBlock.isInsertionMarker()) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    // Disconnect any children that don't belong.
    for (let i = 0; i < this.itemCount_; i++) {
      const connection = this.getInput("ADD" + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) === -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (let i = 0; i < this.itemCount_; i++) {
      Blockly.icons.MutatorIcon.reconnect(connections[i], this, "ADD" + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  saveConnections: function (containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    let i = 0;
    while (itemBlock) {
      const input = this.getInput("ADD" + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this {Blockly.Block}
   */
  updateShape_: function () {
    if (this.itemCount_ && this.getInput("EMPTY")) {
      this.removeInput("EMPTY");
    } else if (!this.itemCount_ && !this.getInput("EMPTY")) {
      this.appendDummyInput("EMPTY").appendField(Blockly.Msg["LISTS_CREATE_EMPTY_TITLE"]);
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        const input = this.appendValueInput("ADD" + i).setAlign(Blockly.inputs.Align.RIGHT);
        if (i % 2 === 0) {
          input.appendField("Key");
        } else if (i % 2 === 1) {
          input.appendField("Value");
        }
      }
    }
    // Remove deleted inputs.
    while (this.getInput("ADD" + i)) {
      this.removeInput("ADD" + i);
      i++;
    }
  },
};

JSONGenerator.forBlock["function_simple_as_map"] = function (block) {
  // Create a list with any number of elements of any type.
  const elements = new Array(block.itemCount_);
  for (let i = 0; i < block.itemCount_; i++) {
    elements[i] = JSONGenerator.valueToCode(block, "ADD" + i, JSONGenerator.ORDER_NONE) || "null";
  }
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.AsMap",
        "args":[${elements.filter((el) => el).join(", ")}]
        }`;
  return [code, JSONGenerator.ORDER_ATOMIC];
};
// End As Map

// Start GetElementByIndex
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#bzob7p
Blockly.Blocks["function_simple_get_element_by_index"] = {
  init: function () {
    this.appendValueInput("LIST").setCheck(null).appendField("In list");
    this.appendValueInput("INDEX").setCheck(null).appendField("get by index");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip("Gets element from list by index");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["function_simple_get_element_by_index"] = function (block) {
  const value_list = JSONGenerator.valueToCode(block, "LIST", JSONGenerator.ORDER_ATOMIC);
  const value_index = JSONGenerator.valueToCode(block, "INDEX", JSONGenerator.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.GetElementByIndex",
        "args":[${[value_list, value_index].filter((el) => el).join(", ")}]
        }`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, JSONGenerator.ORDER_NONE];
};
// End GetElementByIndex

// Start GetElementByKey
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#bzob7p
Blockly.Blocks["function_simple_get_element_by_key"] = {
  init: function () {
    this.appendValueInput("LIST").setCheck(null).appendField("In map");
    this.appendValueInput("KEY").setCheck(null).appendField("get by key");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip("Gets element from map by key");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["function_simple_get_element_by_key"] = function (block) {
  const value_list = JSONGenerator.valueToCode(block, "LIST", JSONGenerator.ORDER_ATOMIC) || null;
  const value_key = JSONGenerator.valueToCode(block, "KEY", JSONGenerator.ORDER_ATOMIC) || null;
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.GetElementByKey",
        "args":[${[value_list, value_key].filter((el) => el).join(", ")}]
        }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// End GetElementByIndex

// Start SortComparableElements
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#bzob7p
Blockly.Blocks["function_simple_sort_comparable_elements"] = {
  init: function () {
    this.appendDummyInput().appendField("Sort List");
    this.appendValueInput("NAME").setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip("Sorts comparable elements");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["function_simple_sort_comparable_elements"] = function (block) {
  const value_name = JSONGenerator.valueToCode(block, "NAME", JSONGenerator.ORDER_ATOMIC);
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.SortComparableElements",
        "args":[${value_name}]
        }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// End GetElementByIndex

// Start TransformValue
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#xptkcb
Blockly.Blocks["function_simple_transform_value"] = {
  init: function () {
    this.appendDummyInput().appendField("Transformer Key");
    this.appendValueInput("TRANSFORMER_KEY").setCheck(null);
    this.appendDummyInput().appendField("Value");
    this.appendValueInput("NAME").setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip("Function transforms input expression using provided transformer");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["function_simple_transform_value"] = function (block) {
  const value_transformer_key = JSONGenerator.valueToCode(block, "TRANSFORMER_KEY", JSONGenerator.ORDER_ATOMIC);
  const value_name = JSONGenerator.valueToCode(block, "NAME", JSONGenerator.ORDER_ATOMIC);
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.TransformValue",
        "args":[${[value_transformer_key, value_name].filter((el) => el).join(", ")}]
        }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// End TransformValue

// Start AvgElement
Blockly.Blocks["function_reduce_elements"] = {
  init: function () {
    this.appendValueInput("LIST")
      .setCheck(null)
      .appendField(
        new Blockly.FieldDropdown([
          ["Average", "AVG"],
          ["Max", "MAX"],
          ["Min", "MIN"],
        ]),
        "OP"
      )
      .appendField("Of List");
    this.setInputsInline(false);
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip("Reduce function. Gets Average/Min/Max element from list of comparable elements");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["function_reduce_elements"] = function (block) {
  const value_list = JSONGenerator.valueToCode(block, "LIST", JSONGenerator.ORDER_ATOMIC);
  const dropdown_op = block.getFieldValue("OP");
  const listOp = {
    AVG: "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.AvgElement",
    MAX: "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.MaxComparableElement",
    MIN: "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.MinComparableElement",
  };
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "${listOp[dropdown_op]}",
        "args": [${value_list}]
        }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// End AvgElement

// Start ConcatElements
Blockly.Blocks["function_reduce_concat_elements"] = {
  init: function () {
    this.appendValueInput("LIST").setCheck(null).appendField("Concat List");
    this.appendValueInput("DELIMITER").setCheck("String").appendField("Delimiter");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip("Reduce function. Converts list of values to single value by joining them with delimiter");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["function_reduce_concat_elements"] = function (block) {
  const value_list = JSONGenerator.valueToCode(block, "LIST", JSONGenerator.ORDER_ATOMIC);
  const value_delimiter = JSONGenerator.valueToCode(block, "DELIMITER", JSONGenerator.ORDER_ATOMIC);
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.ConcatElements",
        "args":[${[value_list, value_delimiter].filter((el) => el).join(", ")}]
        }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// End ConcatElements

// Start ToList
Blockly.Blocks["function_reduce_to_list"] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this {Blockly.Block}
   */
  init: function () {
    this.appendDummyInput().appendField("To List");
    this.setStyle("list_blocks");
    this.itemCount_ = 1;
    this.updateShape_();
    this.setOutput(true, "Array");
    this.setTooltip("Reduce function. Converts list of values to List");
  },
  /**
   * Create XML to represent list inputs.
   * @return {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("items", this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute("items"), 10);
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function (workspace) {
    const containerBlock = workspace.newBlock("lists_create_with_container");
    containerBlock.initSvg();
    let connection = containerBlock.getInput("STACK").connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock = workspace.newBlock("lists_create_with_item");
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function (containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    // Count number of inputs.
    const connections = [];
    while (itemBlock && !itemBlock.isInsertionMarker()) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    // Disconnect any children that don't belong.
    for (let i = 0; i < this.itemCount_; i++) {
      const connection = this.getInput("ADD" + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) == -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (let i = 0; i < this.itemCount_; i++) {
      Blockly.icons.MutatorIcon.reconnect(connections[i], this, "ADD" + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  saveConnections: function (containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    let i = 0;
    while (itemBlock) {
      const input = this.getInput("ADD" + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this {Blockly.Block}
   */
  updateShape_: function () {
    if (this.itemCount_ && this.getInput("EMPTY")) {
      this.removeInput("EMPTY");
    } else if (!this.itemCount_ && !this.getInput("EMPTY")) {
      this.appendDummyInput("EMPTY").appendField(Blockly.Msg["LISTS_CREATE_EMPTY_TITLE"]);
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        this.appendValueInput("ADD" + i).setAlign(Blockly.inputs.Align.RIGHT);
      }
    }
    // Remove deleted inputs.
    while (this.getInput("ADD" + i)) {
      this.removeInput("ADD" + i);
      i++;
    }
  },
};

JSONGenerator.forBlock["function_reduce_to_list"] = function (block) {
  // Create a list with any number of elements of any type.
  const elements = new Array(block.itemCount_);
  for (let i = 0; i < block.itemCount_; i++) {
    elements[i] = JSONGenerator.valueToCode(block, "ADD" + i, JSONGenerator.ORDER_NONE) || "null";
  }
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.ToList",
        "args":[${elements.filter((el) => el).join(", ")}]
        }`;
  return [code, JSONGenerator.ORDER_ATOMIC];
};
// End MaxComparableElement

// Start ToMap
Blockly.Blocks["function_reduce_to_map"] = {
  init: function () {
    this.appendDummyInput().appendField("To Map");
    this.appendValueInput("KEYS").setCheck(null).appendField("Keys");
    this.appendValueInput("VALUES").setCheck(null).appendField("Values");
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip("Reduce function. Converts list of keys and list of values to Map<String, Object>");
    this.setHelpUrl("");
  },
};
JSONGenerator.forBlock["function_reduce_to_map"] = function (block) {
  const value_keys = JSONGenerator.valueToCode(block, "KEYS", JSONGenerator.ORDER_ATOMIC);
  const value_values = JSONGenerator.valueToCode(block, "VALUES", JSONGenerator.ORDER_ATOMIC);
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.ToMap",
        "args":[${[value_keys, value_values].filter((el) => el).join(", ")}]
        }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// End ToMap

// Start ToSet
Blockly.Blocks["function_reduce_to_set"] = {
  init: function () {
    this.appendDummyInput().appendField("Convert List To Set");
    this.appendValueInput("LIST").setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip("Reduce function. Converts list of values to Set");
    this.setHelpUrl("");
  },
};

JSONGenerator.forBlock["function_reduce_to_set"] = function (block) {
  const value_list = JSONGenerator.valueToCode(block, "LIST", JSONGenerator.ORDER_ATOMIC);
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.reduce.ToSet",
        "args":[${value_list}]
        }`;
  return [code, JSONGenerator.ORDER_NONE];
};
// End ToSet

// Simple And
Blockly.Blocks["function_simple_and"] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this {Blockly.Block}
   */
  init: function () {
    this.appendDummyInput().appendField("and");
    this.setStyle("list_blocks");
    this.itemCount_ = 2;
    this.updateShape_();
    this.setOutput(true, "Array");
    this.setMutator(new Blockly.icons.MutatorIcon(['text_create_join_item'], this));
    this.setTooltip("Concatenate all args. Min args count - 2, Max args count - unbounded");
  },
  /**
   * Create XML to represent list inputs.
   * @return {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("items", this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute("items"), 10);
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function (workspace) {
    const containerBlock = workspace.newBlock("lists_create_with_container");
    containerBlock.initSvg();
    let connection = containerBlock.getInput("STACK").connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock = workspace.newBlock("lists_create_with_item");
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function (containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    // Count number of inputs.
    const connections = [];
    while (itemBlock && !itemBlock.isInsertionMarker()) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    // Disconnect any children that don't belong.
    for (let i = 0; i < this.itemCount_; i++) {
      const connection = this.getInput("ADD" + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) === -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (let i = 0; i < this.itemCount_; i++) {
      Blockly.icons.MutatorIcon.reconnect(connections[i], this, "ADD" + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  saveConnections: function (containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    let i = 0;
    while (itemBlock) {
      const input = this.getInput("ADD" + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this {Blockly.Block}
   */
  updateShape_: function () {
    if (this.itemCount_ && this.getInput("EMPTY")) {
      this.removeInput("EMPTY");
    } else if (!this.itemCount_ && !this.getInput("EMPTY")) {
      this.appendDummyInput("EMPTY").appendField(Blockly.Msg["LISTS_CREATE_EMPTY_TITLE"]);
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        const input = this.appendValueInput("ADD" + i).setAlign(Blockly.inputs.Align.RIGHT);
        input.appendField(`param${i + 1}`);
      }
    }
    // Remove deleted inputs.
    while (this.getInput("ADD" + i)) {
      this.removeInput("ADD" + i);
      i++;
    }
  },
};

JSONGenerator.forBlock["function_simple_and"] = function (block) {
  // Create a list with any number of elements of any type.
  const elements = new Array(block.itemCount_);
  for (let i = 0; i < block.itemCount_; i++) {
    elements[i] = JSONGenerator.valueToCode(block, "ADD" + i, JSONGenerator.ORDER_NONE) || "null";
  }
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.And",
        "args":[${elements.filter((el) => el).join(", ")}]
        }`;
  return [code, JSONGenerator.ORDER_ATOMIC];
};
// End And

// Simple Or
Blockly.Blocks["function_simple_or"] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this {Blockly.Block}
   */
  init: function () {
    this.appendDummyInput().appendField("or");
    this.setStyle("list_blocks");
    this.itemCount_ = 2;
    this.updateShape_();
    this.setOutput(true, "Array");
    this.setMutator(new Blockly.icons.MutatorIcon(['text_create_join_item'], this));
    this.setTooltip("Concatenate all args. Min args count - 2, Max args count - unbounded");
  },
  /**
   * Create XML to represent list inputs.
   * @return {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("items", this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute("items"), 10);
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function (workspace) {
    const containerBlock = workspace.newBlock("lists_create_with_container");
    containerBlock.initSvg();
    let connection = containerBlock.getInput("STACK").connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock = workspace.newBlock("lists_create_with_item");
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function (containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    // Count number of inputs.
    const connections = [];
    while (itemBlock && !itemBlock.isInsertionMarker()) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    // Disconnect any children that don't belong.
    for (let i = 0; i < this.itemCount_; i++) {
      const connection = this.getInput("ADD" + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) == -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (let i = 0; i < this.itemCount_; i++) {
      Blockly.icons.MutatorIcon.reconnect(connections[i], this, "ADD" + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  saveConnections: function (containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    let i = 0;
    while (itemBlock) {
      const input = this.getInput("ADD" + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this {Blockly.Block}
   */
  updateShape_: function () {
    if (this.itemCount_ && this.getInput("EMPTY")) {
      this.removeInput("EMPTY");
    } else if (!this.itemCount_ && !this.getInput("EMPTY")) {
      this.appendDummyInput("EMPTY").appendField(Blockly.Msg["LISTS_CREATE_EMPTY_TITLE"]);
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        const input = this.appendValueInput("ADD" + i).setAlign(Blockly.inputs.Align.RIGHT);
        input.appendField(`param${i + 1}`);
      }
    }
    // Remove deleted inputs.
    while (this.getInput("ADD" + i)) {
      this.removeInput("ADD" + i);
      i++;
    }
  },
};

JSONGenerator.forBlock["function_simple_or"] = function (block) {
  // Create a list with any number of elements of any type.
  const elements = new Array(block.itemCount_);
  for (let i = 0; i < block.itemCount_; i++) {
    elements[i] = JSONGenerator.valueToCode(block, "ADD" + i, JSONGenerator.ORDER_NONE) || "null";
  }
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.Or",
        "args":[${elements.filter((el) => el).join(", ")}]
        }`;
  return [code, JSONGenerator.ORDER_ATOMIC];
};
// End And

// Switch Or
Blockly.Blocks["function_simple_switch"] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this {Blockly.Block}
   */
  init: function () {
    this.appendDummyInput().appendField("switch");
    this.setStyle("list_blocks");
    this.itemCount_ = 2;
    this.updateShape_();
    this.setOutput(true, "Array");
    this.setMutator(new Blockly.icons.MutatorIcon(['text_create_join_item'], this));
    this.setTooltip("Concatenate all args. Min args count - 2, Max args count - unbounded");
  },
  /**
   * Create XML to represent list inputs.
   * @return {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("items", this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute("items"), 10);
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function (workspace) {
    const containerBlock = workspace.newBlock("lists_create_with_container");
    containerBlock.initSvg();
    let connection = containerBlock.getInput("STACK").connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock = workspace.newBlock("lists_create_with_item");
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function (containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    // Count number of inputs.
    const connections = [];
    while (itemBlock && !itemBlock.isInsertionMarker()) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    // Disconnect any children that don't belong.
    for (let i = 0; i < this.itemCount_; i++) {
      const connection = this.getInput("ADD" + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) == -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (let i = 0; i < this.itemCount_; i++) {
      Blockly.icons.MutatorIcon.reconnect(connections[i], this, "ADD" + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  saveConnections: function (containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    let i = 0;
    while (itemBlock) {
      const input = this.getInput("ADD" + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this {Blockly.Block}
   */
  updateShape_: function () {
    if (this.itemCount_ && this.getInput("EMPTY")) {
      this.removeInput("EMPTY");
    } else if (!this.itemCount_ && !this.getInput("EMPTY")) {
      this.appendDummyInput("EMPTY").appendField(Blockly.Msg["LISTS_CREATE_EMPTY_TITLE"]);
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        const input = this.appendValueInput("ADD" + i).setAlign(Blockly.inputs.Align.RIGHT);
        if (i % 2 === 0) {
          input.appendField("Assertion");
        } else if (i % 2 === 1) {
          input.appendField("Value");
        }
      }
    }
    // Remove deleted inputs.
    while (this.getInput("ADD" + i)) {
      this.removeInput("ADD" + i);
      i++;
    }
  },
};

JSONGenerator.forBlock["function_simple_switch"] = function (block) {
  // Create a list with any number of elements of any type.
  const elements = new Array(block.itemCount_);
  for (let i = 0; i < block.itemCount_; i++) {
    elements[i] = JSONGenerator.valueToCode(block, "ADD" + i, JSONGenerator.ORDER_NONE) || "null";
  }
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.Switch",
        "args":[${elements.filter((el) => el).join(", ")}]
        }`;
  return [code, JSONGenerator.ORDER_ATOMIC];
};
// End And

// Start joinLists
Blockly.Blocks["function_simple_joinLists"] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this {Blockly.Block}
   */
  init: function () {
    this.appendDummyInput().appendField("joinLists");
    this.setStyle("list_blocks");
    this.itemCount_ = 2;
    this.updateShape_();
    this.setOutput(true, "Array");
    this.setMutator(new Blockly.icons.MutatorIcon(['text_create_join_item'], this));
    this.setTooltip("Multivariate function takes two lists as minimum arguments, appends elements and return new list the contain the total elements  Multiple lists can be provided as input");
  },
  /**
   * Create XML to represent list inputs.
   * @return {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("items", this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute("items"), 10);
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function (workspace) {
    const containerBlock = workspace.newBlock("lists_create_with_container");
    containerBlock.initSvg();
    let connection = containerBlock.getInput("STACK").connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock = workspace.newBlock("lists_create_with_item");
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function (containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    // Count number of inputs.
    const connections = [];
    while (itemBlock && !itemBlock.isInsertionMarker()) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    // Disconnect any children that don't belong.
    for (let i = 0; i < this.itemCount_; i++) {
      const connection = this.getInput("ADD" + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) === -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (let i = 0; i < this.itemCount_; i++) {
      Blockly.icons.MutatorIcon.reconnect(connections[i], this, "ADD" + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  saveConnections: function (containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    let i = 0;
    while (itemBlock) {
      const input = this.getInput("ADD" + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this {Blockly.Block}
   */
  updateShape_: function () {
    if (this.itemCount_ && this.getInput("EMPTY")) {
      this.removeInput("EMPTY");
    } else if (!this.itemCount_ && !this.getInput("EMPTY")) {
      this.appendDummyInput("EMPTY").appendField(Blockly.Msg["LISTS_CREATE_EMPTY_TITLE"]);
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput("ADD" + i)) {
        const input = this.appendValueInput("ADD" + i).setAlign(Blockly.inputs.Align.RIGHT);
        input.appendField(`list${i + 1}`);
      }
    }
    // Remove deleted inputs.
    while (this.getInput("ADD" + i)) {
      this.removeInput("ADD" + i);
      i++;
    }
  },
};

JSONGenerator.forBlock["function_simple_joinLists"] = function (block) {
  // Create a list with any number of elements of any type.
  const elements = new Array(block.itemCount_);
  for (let i = 0; i < block.itemCount_; i++) {
    elements[i] = JSONGenerator.valueToCode(block, "ADD" + i, JSONGenerator.ORDER_NONE) || "null";
  }
  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.JoinLists",
        "args":[${elements.filter((el) => el).join(", ")}]
        }`;
  return [code, JSONGenerator.ORDER_ATOMIC];
};
// End joinLists

// Start Simple Concat
Blockly.Blocks["function_simple_DateToString"] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this {Blockly.Block}
   */
  init: function () {
    this.appendDummyInput().appendField("DateToString");
    this.setInputsInline(false);
    this.appendValueInput("value").setCheck(null).appendField("value");
    this.appendValueInput("format").setCheck(null).appendField("format");
    this.setStyle("list_blocks");
    this.timeZone_ = 0;
    this.updateShape_();
    this.setOutput(true, "String");
    this.setMutator(new Blockly.icons.MutatorIcon(["time_zone"], this));
    this.setTooltip("Concatenate all args. Min args count - 2, Max args count - unbounded");
  },
  /**
   * Create XML to represent list inputs.
   * @return {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("items", this.timeZone_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    this.timeZone_ = parseInt(xmlElement.getAttribute("items"), 10);
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function (workspace) {
    const containerBlock = workspace.newBlock("optional_parameters");
    containerBlock.initSvg();
    const connection = containerBlock.nextConnection;
    if (this.timeZone_ === 1) {
      const itemBlock = workspace.newBlock("time_zone");
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function (containerBlock) {
    let clauseBlock = containerBlock.nextConnection.targetBlock();
    if(clauseBlock){
      this.timeZone_=1;
    } else {
      this.timeZone_=0;
    }
    this.updateShape_();
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  saveConnections: function () {},
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this {Blockly.Block}
   */
  updateShape_: function () {
    if (this.timeZone_ === 1) {
    if(!this.getInput("timeZone")) this.appendValueInput("timeZone").setCheck(null).appendField("timeZone");
    } else if (this.getInput("timeZone")) {
      this.removeInput("timeZone");
    }
  },
};

Blockly.Blocks["time_zone"] = {
  init: function () {
    this.appendDummyInput().appendField("time zone").appendField(null, "TIME_ZONE");
    this.setPreviousStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["optional_parameters"] = {
  init: function () {
    this.setStyle("list_blocks");
    this.appendDummyInput().appendField("Optional Parameters");
    this.setTooltip(Blockly.Msg["LISTS_CREATE_WITH_CONTAINER_TOOLTIP"]);
    this.setNextStatement(true, null);
    this.contextMenu = false;
  },
};

JSONGenerator.forBlock["function_simple_DateToString"] = function (block) {
  const value = JSONGenerator.valueToCode(block, "value", JSONGenerator.ORDER_NONE);
  const format = JSONGenerator.valueToCode(block, "format", JSONGenerator.ORDER_ATOMIC);
  let timeZone=null;
  if(block.timeZone_){
    timeZone = JSONGenerator.valueToCode(block, "timeZone", JSONGenerator.ORDER_ATOMIC);
  }

  const code = `{
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionExpressionConfigDto",
        "functionClass": "com.cyoda.plugins.mapping.core.parser.functions.impl.simple.DateToString",
        "args":[${[value, format, timeZone].filter((el) => el).join(", ")}]
        }`;
  return [code, JSONGenerator.ORDER_ATOMIC];
};

// End Simple Concat
