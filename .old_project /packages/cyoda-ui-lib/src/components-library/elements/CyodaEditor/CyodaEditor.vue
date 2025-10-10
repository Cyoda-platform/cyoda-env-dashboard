<template>
  <div ref="rootRef" class="cyoda-editor" :class="{
    'editor-disable': !editable
  }" style="height: 400px; width: 100%;"></div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted, onBeforeUnmount, nextTick} from "vue";
import * as monaco from 'monaco-editor';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import prettyData from "@cyoda/cobi/src/helpers/PrettyData";

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

const emit = defineEmits(["update:modelValue", "ready"]);
const rootRef = ref(null);
const props = defineProps({
  modelValue: {default: ""},
  language: {default: "plain"},
  oldString: {default: ""},
  newString: {default: ""},
  diff: {default: false},
  diffReadonly: {default: true},
  editable: {default: true},
  collapseUnchanged: {default: true},
  isObject: {default: false},
  actions: {default: () => ([])}
});

const language = computed(() => {
  if (props.language === 'plain') {
    return 'text/plain'
  }
  if (props.language === 'js') {
    return 'javascript'
  }
  return props.language;
})

let editor: any = null;

onMounted(() => {
  if (!props.diff) {
    editor = monaco.editor.create(rootRef.value, {
      value: getValue(props.modelValue),
      language: language.value,
      automaticLayout: true,
      readOnly: !props.editable,
      renderLineHighlight: "none",
      overviewRulerBorder: false,
      minimap: {enabled: false},
      padding: {
        top: 10
      }
    });

    editor.getModel().onDidChangeContent((e) => {
      updateListenerExtension(editor);
    })

    if (props.actions.length > 0) {
      props.actions.forEach((el) => editor.addAction(el));
    }

    nextTick(() => {
      emit('ready');
    })
    return;
  }


  const originalModel = monaco.editor.createModel(
    props.oldString,
    language.value,
  );

  editor = monaco.editor.createModel(
    props.newString,
    language.value,
  );

  const diffEditor = monaco.editor.createDiffEditor(
    rootRef.value,
    {
      originalEditable: false,
      automaticLayout: true,
      glyphMargin: true,
      ignoreTrimWhitespace: false,
      renderOverviewRuler: false,
      minimap: {enabled: false},
      padding: {
        top: 10
      }
    }
  );
  diffEditor.setModel({
    original: originalModel,
    modified: editor,
  });

  editor.onDidChangeContent((e) => {
    updateListenerExtension(editor);
  })

  nextTick(() => {
    emit('ready');
  })
});

function updateListenerExtension(editor) {
  let value = editor.getValue();
  if (props.isObject) {
    if (!isJsonValid(value)) return;
    value = JSON.parse(value);
  }
  emit("update:modelValue", value);
}

function getPrettyData(value) {
  const options: any = {
    indent_size: 2,
    space_in_empty_paren: true,
    wrap_line_length: 50
  };
  return prettyData.json(value, options);
}

function getValue(value) {
  if (props.isObject) {
    return getPrettyData(JSON.stringify(value));
  }
  return value;
}

function isJsonValid(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

watch(
  [() => props.modelValue, () => props.newString],
  ([modelValue, newString]) => {
    let newValue = modelValue || newString;
    newValue = getValue(newValue);
    if (editor) {
      const editorValue = props.isObject ? getPrettyData(editor.getValue()) : editor.getValue();
      if (newValue !== editorValue) {
        editor.setValue(newValue);
      }
    }
  },
  {immediate: true}
);

watch(language, () => {
  if (!editor) return;
  monaco.editor.setModelLanguage(editor.getModel(), language.value)
})
</script>

<style>
.cyoda-editor {
  border: 1px solid silver;
  min-height: unset !important;
  outline: none;

  .margin-view-overlays {
    background: #f5f5f5;
    border-right: 1px solid silver;
  }

  .lines-content.monaco-editor-background {
    padding-left: 5px !important;
  }

  &.editor-disable .monaco-editor-background, &.editor-disable .minimap {
    background-color: #F5F7FA !important;
  }

  .scroll-decoration {
    display: none;
  }
}

.ͼ1.cm-merge-a .cm-changedLine {
  background-color: rgba(254, 232, 233, 0.4);
}

.ͼ1.cm-merge-b .cm-changedLine {
  background-color: rgba(221, 255, 221, 0.4);
}
</style>
