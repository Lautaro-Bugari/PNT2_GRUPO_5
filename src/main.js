import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import home from "./views/AppHome.vue";
import productos from "./views/AppProductos.vue";
import App from "./App.vue";
import Login from "./views/Login.vue";
import Checkout from "./views/Checkout.vue";
import Confirmacion from "./views/Confirmacion.vue";
import DetalleProducto from "./views/DetalleProducto.vue";
import Carrito from "./views/Carrito.vue";

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
    path: "/productos/:id",
    component: DetalleProducto
  },
  {
    path: "/carrito",
    component: Carrito
  },
  {
    path: "/login",    
    component: Login
  },
  {
    path: "/checkout",
    component: Checkout
  },
  {
    path: "/pedido/:idPedido",
    component: Confirmacion
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