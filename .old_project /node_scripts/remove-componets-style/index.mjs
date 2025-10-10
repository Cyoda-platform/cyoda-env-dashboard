import {glob} from "glob";
import fs from "fs";
import Transformers from "./transformers/index.mjs";
import {execa} from 'execa';

const testFiles = [
  // 'CyodaNavigationTop/CyodaNavigationTop.vue',
  // 'CyodaSidebar/CyodaSidebar.vue',
  // 'Login/Login.vue',
  // 'views/ReportsView.vue',
  // 'http-api/src/App.vue',
  // 'statemachine/src/views/WorkflowWrapper.vue',
  // "src/views/Nodes.vue",
  // "ExportImportAll/ExportImportAllDialogFile.vue",
  // "views/Criteria.vue",
  // "DataMapper/DataMapper.vue",
  // "ConfigsCompareDialog/ConfigsCompareDialog.vue",
  // "DataMapper/DataMapperEdit.vue",
  // "/tasks/detail/TasksDetail.vue",
  // "/src/views/Home.vue",
  // "/src/views/EventView.vue",
  // "AdaptableBlotterEntity/DetailTreeItem.vue",
  // "AdaptableBlotter/AdaptableBlotterEntity.vue",
  // "DialogBlockly.vue",
  // "ToolsFunctionalMapping.vue",
  // "DataSourceConfigDialogRequestOperation.vue"
  // "components/HistoryTable.vue",
  // "TransitionWrapper.vue"
  // "Workflow.vue",
  "TargetDataRow.vue"
];

(async () => {
  const files = await glob('../../packages/**/*.vue', {ignore: 'node_modules/**'});
  for (const file of files) {
    let isContinue = true;
    testFiles.forEach((testFile) => {
      if (file.includes(testFile)) isContinue = false;
    })

    // if (isContinue) continue;

    // await execa('prettier', ['--write', '--config', '.prettierrc.json', file]);
    // process.exit();

    console.log(`We work with file ${file}`);
    console.log(`******`);
    let content = fs.readFileSync(file).toString();
    // if (!content.includes('vue-property-decorator') && !content.includes('vue-class-component') && !content.includes('element-ui')) continue;
    if (!content.includes('@Component')) continue;

    content = workerForVuePropertyDecorator(content);
    fs.writeFileSync(file, content);

    await execa('prettier', ['--write', '--config', '.prettierrc.json', file])
    // await execa('eslint', ['--no-eslintrc', '-c', '.eslintrc.cjs', file, '--fix'])
  }
})();

function workerForVuePropertyDecorator(content) {
  Transformers.forEach((transformer) => {
    if (transformer.regex) {
      content = ranRegex(content, transformer);
    }
    if (transformer.task) {
      content = transformer.task(content);
    }
  })
  return content;
}

function ranRegex(content, transformer) {
  const matches = [...content.matchAll(transformer.regex)];
  for (const match of matches) {
    content = transformer.to(content, match);
  }
  return content;
}
