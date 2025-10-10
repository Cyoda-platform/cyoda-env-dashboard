import _ from "lodash";

export default class HelperInstall {
  static setupRouters(routes, options) {
    routes.forEach((el) => {
      if (options.routerOptions && options.routerOptions.meta && options.routerOptions.meta.layout) {
        _.set(el, "meta.layout", options.routerOptions.meta.layout);
      }
      if (["login"].indexOf(el.name) === -1 && el.path !== "*") {
        options.routerOptions.router.addRoute(el);
      }
    });
  }
}
