<template>
  <ViewWrapper>
    <div class="row">
      <div class="col-sm-7">
        <h3>Nodes ({{ nodes.length }})</h3>
        <PmNode v-for="(node, index) in nodes" :key="index" :node="node" />
      </div>
    </div>
  </ViewWrapper>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import PmBlogMainPage from "../components/PmBlogMainPage/PmBlogMainPage.vue";
import PmNode from "../components/PmNode/PmNode.vue";

import ViewWrapper from "../components/ViewWrapper.vue";
import {useProcessingStore} from "../stores/processing";

const processingStore = useProcessingStore();
const nodes = computed(() => {
  return processingStore.nodes;
});

let posts = ref([
  {
    title: "True digital intelligence needs brains AND guts",
    description: `Image credit: bacteria in the human microbiome, IBM Research Zurich,
        Some rights reserved Cyoda would like to thank Danielle Nagler CEO of Adaptable Tools
        for contributing to this article. In…`,
    link: "https://cyoda.com/true-digital-intelligence-needs-brains-and-guts/"
  },
  {
    title: "What does FpML look like ?",
    description: `FpML (Financial Product Markup Language) is the highly complex data model
        for OTC product, this video is a visualisation of the model, the version
        shown here is 5.8.…`,
    link: "https://cyoda.com/what-does-fpml-look-like/"
  },
  {
    title: "So you really want to know what the Cyoda Platform is, eh?",
    description: `Point-in-Time: 22.05.2018 Preface Suppose you intend to digitalise a business
        process in your company, or you’re worried about how expensive your existing IT
        infrastructure has become, how slow…`,
    link: "https://cyoda.com/want-to-know-what-the-cyoda-platform-is/"
  }
]);
</script>
