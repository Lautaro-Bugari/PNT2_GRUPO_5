import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import home from "./views/AppHome.vue";
import productos from "./views/AppProductos.vue";
import App from "./App.vue";
import Login from "./views/Login.vue";
import { createPinia } from "pinia";

const routes = [
  {
    path: "/",
    component: home
  },
  {
    path: "/productos",
    component: productos
  },
  {
    path: "/login",    
    component: Login
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

const pinia = createPinia();
app.use(pinia);