import { defineStore } from "pinia";
import HelperStorage from "../helpers/HelperStorage";
import { axiosPublic } from "@cyoda/ui-lib/src/plugins/axios";
import { useUserManagerStore } from "./user-manager";
import { useUserStore } from "./user";

const helperStorage = new HelperStorage();
const defaultState = {
  token: "",
  refreshToken: "",
  userId: "",
  username: "",
  type: null
};

export const useAuthStore = defineStore({
  id: "auth",
  state: () => ({
    ...helperStorage.get("auth", { ...defaultState })
  }),

  actions: {
    async login(form) {
      const userManagerStore = useUserManagerStore();
      const userStore = useUserStore();
      const { data } = await axiosPublic.post("/auth/login", form);
      data.type = "default";
      this.saveData(data);
      const currentUser = await userManagerStore.getFetchUser(data.username);
      const { data: accountInfo } = await userStore.accountInfo();
      userManagerStore.setMe(currentUser);
      userStore.saveData(accountInfo);
    },
    saveData(data) {
      this.$patch(data);
      helperStorage.set("auth", this.$state);
    },
    async logout(isClearData = false) {
      if (isClearData) {
        helperStorage.clear();
      } else {
        helperStorage.set("auth", defaultState);
      }

      const $auth0 = window.$auth0;
      if (this.type === "auth0" && $auth0) {
        if ($auth0.isAuthenticated.value) await $auth0.logout(({ logoutParams: { returnTo: import.meta.env.VITE_APP_AUTH0_REDIRECT_URI || window.location.origin } }));
      }
      this.$patch(defaultState);
    },
    async refreshAccessToken() {
      const $auth0 = window.$auth0;
      if (this.type === "auth0" && $auth0) {
        const token = await $auth0.getAccessTokenSilently();
        this.saveData({
          token
        });
        return;
      }
      const refreshToken = this.refreshToken;
      const { data } = await axiosPublic.get("/auth/token", {
        headers: {
          "Authorization": `Bearer ${refreshToken}`
        }
      });
      const auth = helperStorage.get("auth");
      auth.token = data.token;
      this.saveData(auth);
    },

    async authStateChanged(state) {
      if (state.isAuthenticated) {
        // You can implement the logic for handling the authenticated state here
        const userManagerStore = useUserManagerStore();
        const authService = this.$store.authService; // Replace with the actual AuthService store
        if (authService.isAuthenticated) {
          const accessToken = await authService.getTokenSilently();
          const userData = {
            token: `${accessToken}`,
            user: {
              name: `${authService.user.name}`,
              email: `${authService.user.email}`
            }
          };
          this.login(userData);
          const tokenInfo = authService.parseJwt();
          userManagerStore.userManager.setMe({
            firstName: authService.user.name,
            lastName: null,
            companyName: null,
            email: authService.user.email,
            dateOfBirth: null,
            position: null,
            phone: null,
            title: null,
            userName: authService.user.name,
            roles: tokenInfo.user_roles,
            state: "ACTIVE",
            passwordSet: true
          });
        }
      } else {
        this.logout();
      }
    }
  },

  getters: {
    isLoggedIn() {
      return !!this.token;
    }
  }
});

