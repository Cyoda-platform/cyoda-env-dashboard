<script setup>
import { ContainerMixin } from "vue-slicksort";
import ElCheckboxGroup from "element-plus/packages/checkbox/src/checkbox-group.vue";

export default {
  mixins: [ContainerMixin],
  name: "CyodaCheckboxGroup",
  extends: ElCheckboxGroup
};
</script>
