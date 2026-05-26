import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import home from "./views/AppHome.vue";
import productos from "./views/AppProductos.vue";
import App from "./App.vue";
import { createPinia } from "pinia";

const routes = [
  {
    path: "/",
    component: home
  },
  {
    path: "/Productos",
    component: productos
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});    

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.mount("#app");