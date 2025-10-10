import * as Blockly from "blockly/core";
import HelperFormat from "../../../../../helpers/HelperFormat";
import JSONGenerator from "../generators/json_generator";

export default class FieldDst extends Blockly.FieldTextInput {
  constructor(value, validator, config) {
    super(value, validator, config);
  }

  showEditor_(_e, quietInput) {
    super.showEditor_(_e, quietInput);
    JSONGenerator.vue.onOpenDialogModellingPopUp(this);
    Blockly.common.getMainWorkspace().hideChaff();
  }

  getDisplayText_() {
    return HelperFormat.shortNamePath(this.value_);
  }

  doValueUpdate_(newValue) {
    this.value_ = newValue;
    this.forceRerender();
  }
}

Blockly.fieldRegistry.register('field_dst_value', FieldDst);
