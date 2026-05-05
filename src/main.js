import { createApp } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";
import Inaki from "./views/Inaki.vue";
import Lauti from "./views/Lauti.vue";


const routes = [
  {
    path: "/Inaki",
    component: Inaki
  },
  {
    path: "/Lauti",
    component: Lauti
  }
];

const router = createRouter({
  history: createMemoryHistory(),
  routes
});    

const app = createApp({});
app.use(router);
app.mount("#app");