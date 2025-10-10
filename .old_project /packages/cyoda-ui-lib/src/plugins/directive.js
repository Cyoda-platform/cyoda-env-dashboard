import Inputmask from 'inputmask'

let inputMaskInstance;

export default {
    install: (app) => {
        app.directive('mask', {
            mounted(el, binding) {
                inputMaskInstance = new Inputmask(binding.value).mask(el.getElementsByTagName('INPUT')[0]);
            },
            unmounted(el) {
                inputMaskInstance.remove();
            },
        })
    }
}
