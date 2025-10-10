

declare module "vue/types/vue" {
  interface Vue {
    eventBus: Vue;
    $v: any;
    $auth: any;
  }
}

declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    eventBus?: Vue;
  }
}

declare module "cyoda-ui-lib/src/types/types";
