import "../../src/plugins/element-ui";
import "../../src/plugins/fontaweome";

import store from "../../src/store.ts";
import { config } from "@vue/test-utils";

global.window ??= Object.create(window);
global.$ = require('jquery');
global.jQuery = require('jquery');

global.ResizeObserver = require('resize-observer-polyfill')
global.$.fn.draggable = jest.fn();

import resize from "vue-resize-directive/dist/Vueresize.js";
Vue.directive("resize", resize);

Vue.prototype.eventBus = new Vue();
Vue.prototype.$store = store;

jest.spyOn(global.console, 'warn').mockImplementation(() => jest.fn());

config.showDeprecationWarnings = false
