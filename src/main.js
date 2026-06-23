import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import home from "./views/AppHome.vue";
import productos from "./views/AppProductos.vue";
import App from "./App.vue";
import Login from "./views/Login.vue";
import Checkout from "./views/Checkout.vue";
import Confirmacion from "./views/Confirmacion.vue";
import Admin from "./views/AdminUsuarios.vue";
import PromocionesDetalle from "./views/PromocionesDetalle.vue";
import ProductoDetalle from "./views/ProductoDetalle.vue";
import AdminProductos from './views/AdminProductos.vue'
import ProductoForm from './views/ProductoForm.vue'

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
  },
  {
    path: "/checkout",
    component: Checkout
  },
  {
    path: "/pedido/:idPedido",
    component: Confirmacion
  },
  {
    path: "/admin/usuarios",
    component: Admin
  },
    {
    path: "/promociones/:promocionId",
    component: PromocionesDetalle
  },
      {
    path: "/producto/:productoId",
    component: ProductoDetalle
  },
<<<<<<< HEAD
=======
  {
      path: '/admin/productos',
    name: 'AdminProductos',
    component: AdminProductos
  },
  {
    path: '/producto/nuevo',
    name: 'ProductoNuevo',
    component: ProductoForm
  },
  {
    path: '/producto/editar/:id',
    name: 'ProductoEditar',
    component: ProductoForm
  }

>>>>>>> origin/main
];

const router = createRouter({
  history: createWebHistory(),
  routes
});    

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.mount("#app");
