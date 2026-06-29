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
import AdminPedidos from "./views/AdminPedidos.vue";
import MisPedidos from './views/MisPedidos.vue'
import AdminPromociones from './views/AdminPromociones.vue'
import PromocionForm from './views/PromocionForm.vue'
import AdminCategorias from './views/AdminCategorias.vue'
import CategoriaForm from './views/CategoriaForm.vue'
import AdminEstadisticas from './views/AdminEstadisticas.vue'


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
    path: '/mis-pedidos',
    name: 'MisPedidos',
    component: MisPedidos
  },
    {
    path: "/promociones/:promocionId",
    component: PromocionesDetalle
  },
      {
    path: "/producto/:productoId",
    component: ProductoDetalle
  },
  {
      path: "/admin/productos",
    name: "AdminProductos",
    component: AdminProductos
  },
  {
    path: "/producto/nuevo",
    name: "ProductoNuevo",
    component: ProductoForm
  },
  {
    path: "/producto/editar/:id",
    name: "ProductoEditar",
    component: ProductoForm
  },
  {
    path: "/admin/pedidos",
    name: "AdminPedidos",
    component: AdminPedidos
  },
  {
    path: '/admin/promociones',
    name: 'AdminPromociones',
    component: AdminPromociones
  },
  {
    path: '/promocion/nuevo',
    name: 'PromocionNuevo',
    component: PromocionForm
  },
  {
    path: '/promocion/editar/:id',
    name: 'PromocionEditar',
    component: PromocionForm
  },
    {
    path: '/admin/categorias',
    name: 'AdminCategorias',
    component: AdminCategorias
  },
  {
    path: '/categoria/nuevo',
    name: 'CategoriaNuevo',
    component: CategoriaForm
  },
  {
    path: '/categoria/editar/:id',
    name: 'CategoriaEditar',
    component: CategoriaForm
  },

  {
    path: '/admin/estadisticas',
    name: 'AdminEstadisticas',
    component: AdminEstadisticas
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
