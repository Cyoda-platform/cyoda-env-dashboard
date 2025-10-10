import {createRouter, createWebHistory} from "vue-router";
import {
  checkForPublic,
} from "@cyoda/ui-lib/src/helpers/HelperRouter";
import routes from './routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

function setBreadcrumb(to: any) {
  if (to.meta && to.meta.breadcrumbs) {
    const breadcrumbs = JSON.parse(JSON.stringify(to.meta.breadcrumbs));
    breadcrumbs.forEach((el: any) => {
      // eslint-disable-next-line
      el.name = replaceBreadcrumb(to, el.name);
      // eslint-disable-next-line
      el.link = replaceBreadcrumb(to, el.link);
    });
    to.meta.breadcrumbsComputed = breadcrumbs;
  }
}

function replaceBreadcrumb(to: any, field: string) {
  if (field.indexOf("{") !== -1 && field.indexOf("}") !== -1) {
    const paramsNames = [...(field as any).matchAll(/\{(.*?)\}/g)];
    paramsNames.forEach((paramsName) => {
      field = field.replace(paramsName[0], to.params[paramsName[1]]);
    });
  }
  return field;
}

router.beforeEach((to, from, next) => {
  setBreadcrumb(to);
  checkForPublic(to, next);
});

export default router;
