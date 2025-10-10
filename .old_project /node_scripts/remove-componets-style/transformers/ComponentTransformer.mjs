import JSON5 from 'json5';
import _ from "lodash";

let refsList = [];
let mapActions = [];
let mapProps = [];
let mapComputed = [];
let toReplaceAll = [];
let mapEmits = [];
let mapDefineExpose = [];
let usedStores = [];
let usedStoresImports = [];

let storesList = [
  {
    'store': 'useAppStore',
    'path': '@/stores/app',
  },
  {
    'store': 'useChainingConfigStore',
    'path': '@/stores/chaining-config',
  },
  {
    'store': 'useCobiProcessingStore',
    'path': '@/stores/cobi-processing',
  },
  {
    'store': 'useDataSourceConfigStore',
    'path': '@/stores/data-source-config',
  },
  {
    'store': 'usePlatformMappingStore',
    'path': '@/stores/platform-mapping',
  },
  {
    'store': 'useAuthStore',
    'path': '@cyoda/ui-lib/src/store/auth',
  },
  {
    'store': 'useEntityViewerStore',
    'path': '@cyoda/ui-lib/src/store/entity-viewer',
  },
  {
    'store': 'useErrorHandlerStore',
    'path': '../../../store/error-handler',
  },
  {
    'store': 'useModellingStore',
    'path': '@cyoda/ui-lib/src/store/modelling',
  },
  {
    'store': 'useUserManagerStore',
    'path': '@cyoda/ui-lib/src/store/user-manager',
  },
]

export default [
  {
    // replace (this as any). to this.
    task(content) {
      content = content.replaceAll('(this as any).', 'this.');
      return content;
    }
  },
  // {
  //   // Remove comments: Disabled
  //   regex: /\/\/ .*/g,
  //   to(content, matches) {
  //     if (matches[0].includes('@TODO')) return content;
  //     content = content.replace(matches[0], '');
  //     return content;
  //   }
  // },
  {
    // replace @Action
    regex: /\@Action(.|\n)*? (private|public) (.*)!: \(((.|\n)*?)\).*;/gm,
    to(content, matches) {
      if (matches.length > 0) {
        addToUsedStores('statemachine');
        const [param] = matches[4].replace(/(\r\n|\n|\r)/gm, '').trim().split(':');
        const actionFunction = `function ${matches[3]}(${matches[4] || ''}) {
                        return statemachineStore.${matches[3]}(${param ? `${param}` : ''});
                    }\n`;
        mapActions.push(actionFunction);
        addToMapDefineExpose(matches[2], matches[3]);
      }
      content = content.replace(matches[0], '');
      return content;
    }
  },
  {
    // replace @Getter
    regex: /\@Getter(.|\n)*? (private|public) (.*)!:.*;/gm,
    to(content, matches) {
      if (matches.length > 0) {
        content = content.replace(matches[0], '');
        addToUsedStores('statemachine');
        mapComputed.push(`const ${matches[3]} = computed(() => {
                return statemachineStore.${matches[3]};
                })`);
        const reg = new RegExp(`this\.${matches[3]}\\b`, 'g');
        content = content.replaceAll(reg, `${matches[3]}.value`);
        addToMapDefineExpose(matches[2], matches[3]);
      }

      return content;
    }
  },
  {
    // replace @Prop
    regex: /@Prop\({ default: \(\) => \({}\) }\)/gm,
    to(content, matches) {
      if (matches.length > 0) {
        content = content.replaceAll(matches[0], `@Prop({
        default: () => {
          return {};
          },
        })`);
      }
      return content;
    }
  },
  {
    // replace @Prop
    regex: /\@Prop\(({(.|\n)*?})?\)\s*(private|public)?\s*(readonly)?\s*(.*)!.*;/gm,
    to(content, matches) {
      if (matches.length > 0) {
        mapProps.push(`${matches[5]}: ${matches[1]}`);
        content = content.replaceAll(matches[0], '');
        const reg = new RegExp(`this\.${matches[5]}\\b`, 'g');
        content = content.replaceAll(reg, `props.${matches[5]}`);
      }

      return content;
    }
  },
  {
    // replace @Ref
    regex: /@Ref\(([^)]*)\)\s*(public|private)?\s*(readonly)?\s*([^!:]+)!:.*;/gm,
    to(content, matches) {
      if (matches.length > 0) {
        const name = (matches[1] || matches[4]).replaceAll('"', '').replaceAll("'", '');
        const nameRef = `${name}Ref`;
        content = content.replaceAll(matches[0], `const ${nameRef} = ref(null);\n`);
        content = content.replaceAll(`ref="${name}"`, `ref="${nameRef}"`);
        const reg = new RegExp(`this\.${name}\\b`, 'g');
        content = content.replaceAll(reg, `${nameRef}.value`);
      }

      return content;
    }
  },
  {
    // replace @Watch
    regex: /@Watch\((.*)\)(.|\n)*?\((.*)\) {((.|\n)*?)\n[ ]{2}}/gm,
    to(content, matches) {
      if (matches.length > 0) {
        const value = matches[1];
        let [name, ...parameters] = value.split(",");
        name = name.replaceAll('"', '')
        const asyncTxt = matches[4].includes('await') || matches[4].includes('nextTick') ? `async ` : '';
        content = content.replace(matches[0], `
                            watch(${name}, ${asyncTxt}(${matches[3] || ''}) => {
                                 ${matches[4]}
                            }${parameters.length > 0 ? `, ${parameters.join(',')}` : ''});
                        `);
      }

      return content;
    }
  },
  {
    // Created
    regex: /(private)?\s*(async)?\s*created\(\)\s{([\s\S]*?)\n\s{2}}/g,
    to(content, matches) {
      const asyncTxt = matches[2] === 'async' || matches[3].includes('nextTick') ? `async ` : '';
      const functionTxt = `(${asyncTxt}function (){
            ${matches[3]}
          })()`;
      content = content.replace(matches[0], asyncTxt.length > 0 ? functionTxt : matches[3]);
      return content;
    }
  },
  {
    // replace mounted
    regex: /(readonly|public|private)? (async )?mounted\(\) ?{((.|\n)*?\n[ ]{2})}/gm,
    to(content, matches) {

      if (matches.length > 0) {
        content = content.replace(matches[0], `onMounted(${matches[2] || ''} () => { ${matches[3]} });`);
      }

      return content;
    }
  },
  {
    // replace beforeDestroy
    regex: /(readonly|public|private)? beforeDestroy\(\) ?{((.|\n)*?\n[ ]{2})}/gm,
    to(content, matches) {
      if (matches.length > 0) {
        content = content.replace(matches[0], `onBeforeUnmount(() => { ${matches[2]} });`);
      }

      return content;
    }
  },
  {
    // mapActions
    regex: /\.{3}(mapActions|mapMutations)\((.*?),(.*)\)/gm,
    to(content, matches) {
      const module = matches[2]
        .replaceAll("'", '')
        .replaceAll('"', '');
      const actions = JSON5.parse(matches[3].replaceAll("'", '"').trim());
      addToUsedStores(module);
      if (Array.isArray(actions)) {
        _.uniq(actions).forEach((el) => {
          let param = getUsedParamsFromByFunctionName(el, content);
          const actionFunction = `function ${el}(${param}) {
                        return ${module}Store.${el}(${param ? `${param}` : ''});
                    }\n`;
          const reg = new RegExp(`this\.${el}\\b`, 'g');
          content = content.replaceAll(reg, el);
          mapActions.push(actionFunction);
        });
      } else if (Object.keys(actions).length > 0) {
        Object.keys(actions).forEach((functionName) => {
          const action = actions[functionName];
          let param = getUsedParamsFromByFunctionName(functionName, content);
          const actionFunction = `function ${functionName}(${param}) {
                        return ${module}Store.${action}(${param ? `${param}` : ''});
                    }\n`;
          const reg = new RegExp(`this\.${functionName}\\b`, 'g');
          content = content.replaceAll(reg, functionName);
          mapActions.push(actionFunction);
        })
      }
      return content;
    }
  },
  {
    // mapGetters
    regex: /\.{3}(mapGetters|mapState)\((.*?),(.*?)\)/gms,
    to(content, matches) {
      const module = matches[2]
        .replaceAll("'", '')
        .replaceAll('"', '');

      let values = [];

      if (matches[3].includes('[')) {
        values = JSON.parse(matches[3].replaceAll("'", '').trim());
      } else if (matches[3].includes(':') && matches[3].includes('{')) {
        const matchObjects = [...matches[3].matchAll(/\s(\w*):/g)];
        values = matchObjects.map((el) => el[1]);
      }
      if (Array.isArray(values)) {
        addToUsedStores(module);
        values.forEach((el) => {
          mapComputed.push(`const ${el} = computed(() => {
                         return ${module}Store.${el};
                     })`);
          const reg = new RegExp(`this\.${el}\\b`, 'g');
          content = content.replaceAll(reg, `${el}.value`);
        });
      }
      return content;
    }
  },
  {
    // $notify
    regex: /\$notify(\..*)?\(({(.|\n)*?})\);?/g,
    to(content, matches) {
      if (matches.length > 0) {
        const type = (matches[1] || '').replace('.', '');
        let code = matches[2];
        if (type) {
          code = code.replace('{', `{ type: "${type}",`);
        }
        content = content.replace(matches[0], `ElNotification(${code})`);
      }
      return content;
    }
  },
  {
    // $delete
    regex: /this\.\$delete\((.*), (.*)\);/g,
    to(content, matches) {
      if (matches.length > 0) {
        content = content.replace(matches[0], `delete ${matches[1]}[${matches[2]}]\n`);
      }
      return content;
    }
  },
  {
    // $set
    regex: /this\.\$set\((.*), (.*), (.*)\);/g,
    to(content, matches) {
      if (matches.length > 0) {
        content = content.replace(matches[0], `${matches[1]}[${matches[2]}] = ${matches[3]}\n`);
      }
      return content;
    }
  },
  {
    // $emit
    regex: /this\.\$emit\((.*),/g,
    to(content, matches) {
      if (matches.length > 0) {
        const newData = matches[0].replace('this.$emit(', 'emit(');
        content = content.replace(matches[0], newData);
        mapEmits.push(matches[1])
      }
      return content;
    }
  },
  {
    // $confirm
    task(content) {
      content = content.replaceAll('$confirm(', 'ElMessageBox.confirm(');
      return content;
    }
  },
  // {
  //   // Remove $nextTick: Disabled
  //   regex: /\$nextTick.*{([\s\S]*?)}\);?/g,
  //   to(content, matches) {
  //     if (matches.length > 0) {
  //       content = content.replace(matches[0], `await nextTick(); \n ${matches[1]}`);
  //     }
  //     return content;
  //   }
  // },
  {
    // Router
    regex: /\$router\./gsm,
    to(content, matches) {
      if (content.includes('$router.')) {
        content = content.replaceAll('$router.', 'router.');
      }
      return content;
    }
  },
  {
    // Route
    regex: /\$route\./gsm,
    to(content, matches) {
      if (content.includes('$route')) {
        content = content.replace('$route.', 'route.');
      }
      return content;
    }
  },
  {
    // ref for boolean;
    regex: /(readonly|public|private) ?(\w+)(: )?(.*)? = (false|true)(;)/gm,
    to(content, matches) {
      content = content.replace(matches[0], `const ${matches[2]} = ref<boolean>(${matches[5]})${matches[7] || ";"}`);
      content = applyNewVariableForRef(matches[2], content);
      addToMapDefineExpose(matches[1], matches[2]);
      return content;
    }
  },
  {
    // ref for string "";
    regex: /(readonly|public|private) ?(\w+)(: )?(.*)? = "(.*)"(;)/gm,
    to(content, matches) {
      content = content.replace(matches[0], `const ${matches[2]} = ref<string>("${matches[5] || ''}")${matches[6] || ";"}`);
      content = applyNewVariableForRef(matches[2], content);
      addToMapDefineExpose(matches[1], matches[2]);
      return content;
    }
  },
  {
    // ref for string number;
    regex: /(readonly|public|private) ?(\w+)(: )?(.*)? = (\d*|null|undefined)(;)/gm,
    to(content, matches) {
      content = content.replace(matches[0], `const ${matches[2]} = ref(${matches[5] || ''})${matches[6] || ";"}`);
      content = applyNewVariableForRef(matches[2], content);
      addToMapDefineExpose(matches[1], matches[2]);
      return content;
    }
  },
  {
    // ref value for case private reportDefinition: ReportHistoryData = {} as ReportHistoryData;
    regex: /(readonly|public|private) ?(.*?)?(: \w+)? = (\{\})( as ([^;]*))?(;)?$/gm,
    to(content, matches) {
      content = content.replace(matches[0], `let ${matches[2]} = ref({});`);
      content = applyNewVariableForRef(matches[2], content);
      addToMapDefineExpose(matches[1], matches[2]);
      return content;
    }
  },
  {
    // ref value
    regex: /(readonly|public|private) ?(async)? ?(\w+)([^=|\n|(]*)? = ((.|\n)*?);/gm,
    to(content, matches) {
      content = content.replace(matches[0], `let ${matches[3]} = ref(${matches[5]});`);
      content = applyNewVariableForRef(matches[3], content);
      addToMapDefineExpose(matches[1], matches[3]);
      return content;
    }
  },
  {
    // ref value for other cases
    regex: /(readonly|public|private) ?(\w+)(: )?(\w+)? ([A-z0-9\[\]\{\} ."+\-:;,\|\n]*) ?= ?((.|\n).*?);/gm,
    to(content, matches) {
      content = content.replace(matches[0], `let ${matches[2]} = ref(${matches[6].replaceAll(' ', '').replace(/(\r\n|\n|\r)/gm, '')});`);
      content = applyNewVariableForRef(matches[2], content);
      addToMapDefineExpose(matches[1], matches[2]);
      return content;
    }
  },
  {
    // private login!: any => '';
    regex: /(readonly|public|private) (.*)!: (.*)(;)/gm,
    to(content, matches) {
      content = content.replace(matches[0], '');
      addToMapDefineExpose(matches[1], matches[2]);
      return content;
    }
  },
  {
    // Replace "private var = value" = > "let var = ref(value) ";
    regex: /(readonly|public|private) (\w+)(: )?(.*)? = (.*);/gm,
    to(content, matches) {
      let ref = 'ref';
      if (matches[4]) {
        ref += `<${matches[4]}>`;
      }
      content = content.replace(matches[0], `let ${matches[2]} = ${ref}(${matches[5] || ''})${matches[6] || ";"}`);
      content = applyNewVariableForRef(matches[2], content);

      addToMapDefineExpose(matches[1], matches[2]);
      return content;
    }
  },
  {
    // this.\$refs.[\["]?(\w+)["\]]*[ as ]*(\w*)
    regex: /this.\$refs.[\["]?(\w+)["\]]*[ as ]*(\w*)/gm,
    to(content, matches) {
      if (matches.length > 0) {
        content = content.replace(matches[0], `${matches[1]}Ref.value`);
        addToRefsList(matches[1]);
      }
      return content;
    }
  },
  {
    // (this.$refs.form as any)
    regex: /\(?this.\$refs.[\["]?(\w+)["\]]*[ as ]*(\w*)\)?/gm,
    to(content, matches) {
      if (matches.length > 0) {
        content = content.replace(matches[0], `${matches[1]}Ref.value`);
        addToRefsList(matches[1]);
      }
      return content;
    }
  },
  {
    // replace get to computed
    regex: /(readonly|public|private)? ?get (.*)\((.*)?\)(:)? ?(.*)? \{((.|\n)*?\n[ ]{2})}/gm,
    to(content, matches) {
      if (matches.length > 0) {
        content = content.replace(matches[0], '');
        mapComputed.push(`const ${matches[2]} = computed(() => {${matches[6]}})`);
        const reg = new RegExp(`this\.${matches[2]}\\b`, 'g');
        addToReplaceAll(reg, `${matches[2]}.value`);
        addToMapDefineExpose(matches[1], matches[2]);
      }

      return content;
    }
  },
  {
    // Methods
    regex: /^[\s]{2}(readonly|public|private)? ?(async )?(\w+)\((.*)?\)\s*{$/gm,
    to(content, matches) {
      content = content.replace(matches[0], `${matches[2] || ''}function ${matches[3]}(${matches[4] || ''}) {`);
      const reg = new RegExp(`this\.${matches[2]}\\b`, 'g');
      content = content.replace(reg, matches[2]);
      addToMapDefineExpose(matches[1], matches[3]);
      return content;
    }
  },
  {
    // Remove Components
    regex: /\@Component.*extends Vue {(.*)}.*<\/script>/gsm,
    to(content, matches) {
      if (matches.length > 0) {
        matches[1] = addBlocksToComponent(matches[1]);
        content = content.replace(matches[0], matches[1] + "</script>");
      }
      return content;
    }
  },
  {
    // Remove Mixins nad replace it with @TODO
    regex: /\@Component.*extends Mixins\((.*?)\) {(.*)}.*<\/script>/gsmi,
    to(content, matches) {
      if (matches.length > 0) {
        const todo = `// @TODO Mixins: ${matches[1]}\n`;
        matches[2] = `${todo} ${addBlocksToComponent(matches[2])} \n </script>`;
        content = content.replace(matches[0], matches[2]);
      }
      return content;
    }
  },
  {
    // to Replace All
    task(content) {
      toReplaceAll.forEach((el) => {
        content = content.replaceAll(el.from, el.to);
      })
      return content;
    }
  },
  {
    // replace readonly|public|private to function
    regex: /(readonly|public|private) ?(async)? ?(\w+)/g,
    to(content, matches) {
      if (matches[0].length > 0) {
        content = content.replace(matches[0], `${matches[2] || ''} function ${matches[3]}`);
        addToMapDefineExpose(matches[1], matches[3]);
      }
      return content;
    }
  },
  {
    // vuex to pinia dispatch|commit
    regex: /store\.(dispatch|commit)\(([^,)]*)(, (.*))?\)/g,
    to(content, matches) {
      if (matches[0].length > 0) {
        const [module, action] = matches[2]
          .replaceAll("'", '')
          .replaceAll('"', '')
          .split('/');
        content = content.replace(matches[0], `${module}Store.${action}(${matches[4] || ''})`)
        addToUsedStores(module);
      }
      return content;
    }
  },
  {
    // vuex to pinia getters|state
    regex: /store\.(getters|state)\[(.*)\]/g,
    to(content, matches) {
      if (matches[0].length > 0) {
        const [module, action] = matches[2]
          .replaceAll("'", '')
          .replaceAll('"', '')
          .split('/');
        content = content.replace(matches[0], `${module}Store.${action}`)
        addToUsedStores(module);
      }
      return content;
    }
  },
  {
    // watch missing props
    regex: /watch\((\(\) => )?([^,]*)/g,
    to(content, matches) {
      if (matches[0].length > 0) {
        const propFull = matches[2].replace('() => ','').replace(/(\r\n|\n|\r)/gm, '').trim();
        const prop = propFull.split('.')[0];
        const arrowFun = matches[1] || '() => ';
        const propsMatch = content.match(/const props(.|\n)*?}\);\n/gm);
        if (propsMatch && (propsMatch[0].includes(prop+':') || propsMatch[0].includes(prop+'.')) && prop !== 'props') {
          content = content.replace(matches[0], `watch(${arrowFun} props.${propFull}`)
        }
      }
      return content;
    }
  },
  {
    // Add missing imports
    regex: /<script.*>\n((.|\n)*)<\/script>/gm,
    to(content, matches) {
      let newContent = matches[1];

      let importVue = [];
      if (/ref[<|(]/.test((content))) {
        importVue.push('ref');
      }

      if (content.includes('reactive(')) {
        importVue.push('reactive');
      }

      if (content.includes('nextTick')) {
        importVue.push('nextTick');
      }

      if (content.includes('computed(')) {
        importVue.push('computed');
      }

      if (content.includes('watch(')) {
        importVue.push('watch');
      }

      if (content.includes('onMounted')) {
        importVue.push('onMounted');
      }

      if (content.includes('onBeforeUnmount')) {
        importVue.push('onBeforeUnmount');
      }

      if (content.includes('defineProps')) {
        importVue.push('defineProps');
      }

      if (content.includes('defineEmits')) {
        importVue.push('defineEmits');
      }

      if (content.includes('defineExpose')) {
        importVue.push('defineExpose');
      }

      if (importVue.length > 0 && !content.includes('from "vue"')) {
        newContent = `import { ${importVue.join(', ')} } from "vue";\n ${newContent}`;
      }

      const importVueRouter = [];

      if (content.includes("router.") && !content.includes('from "vue-router"')) {
        importVueRouter.push("useRouter");
      }

      if (content.includes("route.") && !content.includes('from "vue-router"')) {
        importVueRouter.push("useRoute");
      }

      if (importVueRouter.length > 0) {
        newContent = `import { ${importVueRouter.join(', ')} } from "vue-router";\n ${newContent}`;
      }

      const elementUiComponents = [];
      if (content.includes('ElNotification') && !content.includes('element-plus')) {
        elementUiComponents.push('ElNotification');
      }

      if (content.includes('ElMessageBox') && !content.includes('element-plus')) {
        elementUiComponents.push('ElMessageBox');
      }

      if (elementUiComponents.length > 0) {
        newContent = `import { ${elementUiComponents.join(', ')} } from "element-plus";\n ${newContent}`;
      }

      if (usedStoresImports.length > 0) {
        usedStoresImports.forEach((el) => {
          newContent = `${el};\n ${newContent}`;
        })
      }

      // if (usedStores.length > 0) {
      //   const usedStoresContent = usedStores.join("\n") + '\n';
      //   usedStores.forEach((el) => {
      //       if(!newContent.includes(el)) {
      //           newContent = `${el}\n${newContent}`;
      //       }
      //   })
      //
      //   // content = content.replaceAll('const store = useStore();', usedStoresContent);
      // }

      content = content.replace(matches[1], newContent);

      return content;
    }
  },
  {
    // Remove Vue.component @TODO
    regex: /Vue\.component\((.*),(.*)\);/g,
    to(content, matches) {
      if (matches.length > 0) {
        const todo = `// @TODO Vue.component: ${matches[2]}\n`
        content = content.replace(matches[0], todo);
      }
      return content;
    }
  },
  {
    // Remove data like that "let setReassignRelation: (val: any) => void;" OR "private getListAllDataMappings: () => any;"
    regex: /.*(void|any);\n/g,
    to(content, matches) {
      if (matches.length > 0) {
        content = content.replace(matches[0], '');
      }
      return content;
    }
  },
  {
    // public $refs!: { ... }
    regex: /public \$refs!: {(.|\n)*?\n\s{2}};?/g,
    to(content, matches) {
      if (matches.length > 0) {
        content = content.replace(matches[0], '');
      }
      return content;
    }
  },
  {
    // remove this.
    task(content) {
      content = content.replaceAll('this.', '');
      content = content.replaceAll('(this as any).', '');
      return content;
    }
  },
  {
    // replace $store to store.
    task(content) {
      return content.replaceAll('$store.', 'store.');
    }
  },
  {
    // replace slot-scope: Disabled
    // task(content) {
    //   return content.replaceAll('slot-scope="', 'v-slot:default="');
    // }
  },
  {
    // reset variables
    task(content) {
      refsList = [];
      mapActions = [];
      mapProps = [];
      mapComputed = [];
      toReplaceAll = [];
      mapEmits = [];
      mapDefineExpose = [];
      usedStores = [];
      usedStoresImports = [];
      return content;
    }
  },
]


function applyNewVariableForRef(name, content) {
  const reg = new RegExp(`this\.${name}\\b`, 'g');
  return content.replaceAll(reg, `${name}.value`);
}

function applyNewVariableForReactive(name, content) {
  const reg = new RegExp(`this\.${name}\\b`, 'g');
  return content.replaceAll(reg, `${name}`);
}

function addToRefsList(name) {
  const refRow = `const ${name}Ref=ref(null);\n`;
  if (refsList.includes(refRow)) return;
  refsList.push(refRow);
}

function addBlocksToComponent(content) {
  refsList.forEach((el) => {
    content = `${el}${content}`;
  });

  if (mapActions.length > 0) {
    content = `${mapActions.join('\n')}${content}`;
  }

  if (mapComputed.length > 0) {
    content = `${mapComputed.join('\n')}\n${content}`;
  }

  if (usedStores.length > 0) {
    const usedStoresContent = usedStores.join("\n") + '\n';
    content = `${usedStoresContent}${content}`;
  }

  if (content.includes('router.')) {
    const router = 'const router = useRouter();\n';
    content = `${router}${content}`;
  }

  if (content.includes('route.')) {
    const route = 'const route = useRoute();\n';
    content = `${route}${content}`;
  }

  if (mapProps.length > 0) {
    content = `const props = defineProps({${mapProps.join(',\n')}});\n${content}`;
  }

  if (mapEmits.length > 0) {
    content = `const emit = defineEmits([${mapEmits.join(',')}]);\n${content}`;
  }

  if (mapDefineExpose.length > 0) {
    content = `${content}\n defineExpose({${mapDefineExpose.join(', ')}});`;
  }
  return content;
}


function removeEmptyTrimmedLines(content) {
  var lines = content.split("\n");
  var last_line = lines[lines.length - 1];
  var new_lines = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line.trim() !== "") {
      new_lines.push(line);
    }
  }
  return new_lines.join("\n");
}

function getUsedParamsFromByFunctionName(functionName, content) {
  const regex = new RegExp(`${functionName}\\(((.|\\n)*?)\\)`);
  const matchesParams = content.match(regex);
  let param = '';
  if (matchesParams && matchesParams.length > 0) {
    param = matchesParams[1].replaceAll('this.', '').split('.').pop();
    if (
      ['true', 'false', 'null', 'undefined'].includes(param) ||
      param.includes('{') ||
      param.includes('=') ||
      matchesParams[1].includes('[') ||
      matchesParams[1].includes('{')
    ) param = 'value';
  }
  return param;
}

function addToReplaceAll(from, to) {
  toReplaceAll.push({from, to});
}

function addToMapDefineExpose(type, name) {
  if (type !== "public") return;
  const newName = name.trim();
  mapDefineExpose.push(newName);
}

function addToUsedStores(module) {
  const useNameStore = `use${capitalizeFirstLetter(module)}Store`;
  const store = ` const ${module}Store = ${useNameStore}();`
  const storeImportEl = storesList.find((el) => el.store === useNameStore);
  let storeImport = "";
  if (storeImportEl) storeImport = `import { ${storeImportEl.store} } from "${storeImportEl.path}";`;
  if (!usedStores.includes(store)) usedStores.push(store);
  if (storeImportEl && !usedStoresImports.includes(storeImport)) usedStoresImports.push(storeImport);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
