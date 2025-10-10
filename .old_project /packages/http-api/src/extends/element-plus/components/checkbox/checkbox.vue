<script setup>
import { ElementMixin } from "vue-slicksort";
import ElCheckbox from "element-plus/packages/checkbox/src/checkbox.vue";

export default {
  mixins: [ElementMixin],
  name: "CyodaCheckbox",
  extends: ElCheckbox
};
</script>
