import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/home.vue";

const routes = [{ path: "/", name: "home", component: HomeView }];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, _from, savedPosition) {
        if (to.hash) {
            return { el: to.hash };
        }

        if (savedPosition) {
            return savedPosition;
        } else {
            return { left: 0, top: 0 };
        }
    },
});

export default router;
