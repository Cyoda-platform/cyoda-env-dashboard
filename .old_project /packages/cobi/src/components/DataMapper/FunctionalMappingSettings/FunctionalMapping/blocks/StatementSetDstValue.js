import JSONGenerator from "../generators/json_generator";
import * as Blockly from "blockly/core";
import "../fields/field_dst_path.js";
import FieldDst from "../../../../../components/DataMapper/FunctionalMappingSettings/FunctionalMapping/fields/field_dst_path";

const mergeImg =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIxMDI0IiB3aWR0aD0iNzY4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik02NDAgNDQ4Yy00Ny42MjUgMC04OC42MjUgMjYuMzEyLTExMC42MjUgNjQuOTA2QzUyMy42MjUgNTEyLjUgNTE4IDUxMiA1MTIgNTEyYy0xMzEuMDYyIDAtMjU1LjQzOC05OS44NDQtMzAwLjgxMi0yMjMuNDM4QzIzOC40NjkgMjY1LjA5NDAwMDAwMDAwMDA1IDI1NiAyMzAuNzE5MDAwMDAwMDAwMDUgMjU2IDE5MmMwLTcwLjY1Ni01Ny4zNDQtMTI4LTEyOC0xMjhTMCAxMjEuMzQ0MDAwMDAwMDAwMDUgMCAxOTJjMCA0Ny4yMTkgMjUuODQ0IDg4LjA2MiA2NCAxMTAuMjgxVjcyMS43NUMyNS44NDQgNzQzLjkzOCAwIDc4NC43NSAwIDgzMmMwIDcwLjYyNSA1Ny4zNDQgMTI4IDEyOCAxMjhzMTI4LTU3LjM3NSAxMjgtMTI4YzAtNDcuMjUtMjUuODQ0LTg4LjA2Mi02NC0xMTAuMjVWNDkxLjQ2OUMyNzYuMTU2IDU4MC41IDM5Mi4zNzUgNjQwIDUxMiA2NDBjNi4zNzUgMCAxMS42MjUtMC40MzggMTcuMzc1LTAuNjI1QzU1MS41IDY3Ny44MTIgNTkyLjUgNzA0IDY0MCA3MDRjNzAuNjI1IDAgMTI4LTU3LjM3NSAxMjgtMTI4Qzc2OCA1MDUuMzQ0IDcxMC42MjUgNDQ4IDY0MCA0NDh6TTEyOCA4OTZjLTM1LjMxMiAwLTY0LTI4LjYyNS02NC02NCAwLTM1LjMxMiAyOC42ODgtNjQgNjQtNjQgMzUuNDA2IDAgNjQgMjguNjg4IDY0IDY0QzE5MiA4NjcuMzc1IDE2My40MDYgODk2IDEyOCA4OTZ6TTEyOCAyNTZjLTM1LjMxMiAwLTY0LTI4LjU5NC02NC02NHMyOC42ODgtNjQgNjQtNjRjMzUuNDA2IDAgNjQgMjguNTk0IDY0IDY0UzE2My40MDYgMjU2IDEyOCAyNTZ6TTY0MCA2NDBjLTM1LjMxMiAwLTY0LTI4LjYyNS02NC02NCAwLTM1LjQwNiAyOC42ODgtNjQgNjQtNjQgMzUuMzc1IDAgNjQgMjguNTk0IDY0IDY0QzcwNCA2MTEuMzc1IDY3NS4zNzUgNjQwIDY0MCA2NDB6Ii8+PC9zdmc+Cg==';

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#7zkw7q
Blockly.Blocks["statement_set_dst_value"] = {
  init: function () {
    this.appendDummyInput('SET_DST_VALUE_LABEL').appendField("Set Dst Value").appendField(
      new Blockly.FieldImage(mergeImg, 12, 15, undefined, onClickCogs), "DST_SET_MODES_IMAGE")
      .appendField(new Blockly.FieldLabelSerializable(""), "DST_SET_MODES")
    this.appendValueInput("VALUE").setCheck(null).appendField("Path").appendField(new FieldDst(), "DST_PATH")
      .appendField("set");
    this.setInputsInline(false);
    this.setColour(0);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("Assign Variable Statement");
    this.setHelpUrl("");


    this.getField('DST_SET_MODES').setVisible(false);
    this.getField('DST_SET_MODES_IMAGE').setVisible(false);

    this.setOnChange(function (changeEvent) {
      if (changeEvent.name === "DST_PATH" || changeEvent instanceof Blockly.Events.FinishedLoading) {
        addMergeIcon(this, this.getFieldValue("DST_PATH"));
      }
    });
  },

  // .appendField(
  //   new Blockly.FieldImage(mergeImg, 12, 15, undefined, onClickCogs),
  //   "DST_SET_MODES"
  // );
};

function onClickCogs(field) {
  JSONGenerator.vue.onOpenDialogSetModesOptions(field);
}

JSONGenerator.forBlock["statement_set_dst_value"] = function (block) {
  const dstPath = block.getFieldValue("DST_PATH");
  const dstSetModes = block.getFieldValue("DST_SET_MODES") || '[]';
  const value = JSONGenerator.valueToCode(block, "VALUE", JSONGenerator.ORDER_ATOMIC) || "null";
  return `{
    "type": "SET_DST_VALUE",
    "dstPath": "${dstPath}",
    "collectElemsSetModes": ${dstSetModes},
    "expression": ${value}
 }`;
};

function addMergeIcon(block, dstPath) {
  const starCount = dstPath.split("").map((el) => el === "*").filter((el) => el).length;
  if (starCount > 0) {
    block.getField('DST_SET_MODES_IMAGE').setVisible(true);
  } else {
    block.getField('DST_SET_MODES_IMAGE').setVisible(false);
  }
}
