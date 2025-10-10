import {useAuthStore} from "../stores/auth";

export function checkForPublic(to, next) {
    const authStore = useAuthStore();
    if (to.matched.some((record) => !record.meta.isPublic)) {
        if (!authStore.isLoggedIn) {
            authStore.logout();
            next({
                path: "/login",
                query: {redirect: to.fullPath},
            });
        } else {
            next();
        }
    } else {
        next();
    }
}


