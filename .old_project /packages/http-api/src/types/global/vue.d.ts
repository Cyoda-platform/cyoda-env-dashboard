declare module "vue/types/vue" {
  interface Vue {
    $auth: any;
  }
}

declare module "vue/types/vue" {
  interface Vue {
    $config?: { [key: string]: string };
  }
}

declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    eventBus?: Vue;
  }
}
