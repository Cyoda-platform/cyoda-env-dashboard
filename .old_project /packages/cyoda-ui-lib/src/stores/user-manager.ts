import {defineStore} from 'pinia';
import HelperStorage from '../helpers/HelperStorage';

const helperStorage = new HelperStorage();
const defaultState: any = {
  me: {},
};

export const useUserManagerStore = defineStore('userManager', {
  state: () => helperStorage.get('user-manager', {...defaultState}),
  getters: {
    user: (state) => state.me
  },
  actions: {
    setMe(data: any) {
      this.me = data;
      helperStorage.set('user-manager', this.$state);
    },
    async getFetchUser() {
      return {
        firstName: "Patrick",
        lastName: "Stanton",
        companyName: "Cyoda Ltd.",
        email: "patrick.stanton@cyoda.com",
        dateOfBirth: null,
        position: null,
        phone: null,
        title: null,
        userName: "patrick.stanton@cyoda.com",
        roles: ["ROLE_ADMIN"],
        state: "ACTIVE",
        passwordSet: true,
      };
    },
  },
});
