export default [
    {
        regex: /import .* from .*(vue-facing-decorator|vue-property-decorator|vuex).*;?/gm,
        to(content, matches) {
            if (matches[0].includes('vue-facing-decorator') || matches[0].includes('vue-property-decorator')) {
                content = content.replace(matches[0], '');
            }
            return content;
        }
    },
    {
        regex: /import .* from .*(vuex).*;?/gm,
        to(content, matches) {
            if(!content.includes('useStore()')) {
              content = content.replace(matches[0], '');
            }
            return content;
        }
    }
]
