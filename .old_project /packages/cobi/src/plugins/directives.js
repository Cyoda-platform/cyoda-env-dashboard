const removeSlash = {
  beforeMount(el, binding) {
    const input = el.querySelector("input");
    input.addEventListener("blur", function () {
      binding.instance[binding.arg] = input.value.replace(/\/$/, "");
    });
  },
}

const addSlash = {
  beforeMount(el, binding) {
    const input = el.querySelector("input");
    input.addEventListener("blur", function () {
      const firstChar = input.value.trim().charAt(0);
      if (firstChar !== "/" && input.value.length > 0) {
        binding.instance[binding.arg] = `/${input.value}`;
      }
    });
  },
}

export default {
  install: (app) => {
    if(!app._context.directives['remove-slash']) app.directive('remove-slash', removeSlash)
    if(!app._context.directives['add-slash']) app.directive('add-slash', addSlash)
  }
}
