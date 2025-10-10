import {createPinia, setActivePinia} from "pinia";
import {useAppStore} from "../../../../src/stores/app";

const localVue = {}

describe('appModule', () => {
  let appStore;

  beforeEach(() => {
    setActivePinia(createPinia())
    appStore = useAppStore();
  })

  test('mutations: setActiveMenuLink', () => {
    appStore.setActiveMenuLink('test')
    expect(appStore.activeMenuLink).toBe('test')
  })

  test('mutations: toggleMenu', () => {
    const initialState = appStore.isToggledMenu
    appStore.toggleMenu();
    expect(appStore.isToggledMenu).toBe(!initialState)
  })

  test('getters: getActiveMenuLink', () => {
    appStore.activeMenuLink = 'test'
    expect(appStore.getActiveMenuLink).toBe('test')
  })
})
