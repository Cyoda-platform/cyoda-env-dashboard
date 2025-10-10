import { useUserManagerStore } from "../stores/user-manager";

export function useMixin() {

  const userManagerStore = useUserManagerStore();

  function userCan(roles = []) {
    if (roles.includes("admin")) return true;

    if (roles.length === 0) {
      return true;
    } else {
      const me = userManagerStore.me;
      if (me && me.roles) {
        for (const role of me.roles) {
          if (roles.map((el) => el.toLowerCase()).indexOf(role.toLowerCase()) !== -1) {
            return true;
          }
        }
      }
      return false;
    }
  }

  return {
    userCan
  };
}
