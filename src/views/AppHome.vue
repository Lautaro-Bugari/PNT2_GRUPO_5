<script setup>
import { ref, onMounted } from "vue"
import { useStoreProducto } from "../stores/storeProducto"
import { useStorePromos } from "../stores/storePromos"
import AvisoLogin from "./AvisoLogin.vue"
import { useAuthStore } from '../stores/authStore'
import { useStoreCarrito } from "../stores/storeCarrito"
import { useRouter } from 'vue-router'


const promos = ref([])
const novedades = ref([])
const storeProducto = useStoreProducto()
const storePromos = useStorePromos()
const avisoLoginVisible = ref(false)
const authStore = useAuthStore()
const storeCarrito = useStoreCarrito()
const router = useRouter()

onMounted(async () => {
  await storePromos.actualizarPromociones()
  promos.value = await storePromos.getPromociones()
  const productosObtenidos = await storeProducto.getProductos()
  const hoy = new Date()
  novedades.value = productosObtenidos.filter(p => {
    const fechaP = new Date(p.fechaIngreso)
    return fechaP.getMonth() === hoy.getMonth() && fechaP.getFullYear() === hoy.getFullYear()
  })
})

const verificarLogin = (producto) => {
  if (!authStore.usuarioLogueado) {
    idProductoSeleccionado = producto.id
    avisoLoginVisible.value = true
    return
  } 
    storeCarrito.agregarAlCarrito(producto)
}
</script>


<template>
  <div>
    <AvisoLogin 
      v-if="avisoLoginVisible"
      @cerrar="avisoLoginVisible = false"
      @login="router.push({ path: '/login', query: { redirect: `/productos/${idProductoSeleccionado}` } })"
    />
    <div class="banner-foto">
      <div class="banner-texto">
        <h1>Bienvenido a la Central de Golosinas</h1>
        <p>Somos el proveedor de confianza para tu kiosko</p>
      </div>
    </div>
    <div class="bloque-seccion">
    <div class="contenedor-titulo-seccion">
      <h2 class="titulo-seccion">Ofertas</h2>
    </div>
    <div class="lista-productos">
      <div v-for="promocion in promos.slice(0, 4)" :key="promocion.id" class="tarjeta-individual">
        <img :src="promocion.imagen" class="imagen-producto">
        <h3 class="titulo-producto">{{ promocion.nombre }}</h3>
        <p class="precio-producto">Precio: ${{ promocion.precio }}</p>
        <button class="boton-carrito" @click="verificarLogin(promocion)">
          Agregar al carrito
        </button>
      </div>
      <div>
        <h2>Novedades</h2>
        <div v-for="novedad in novedades":key="novedad.id">
          <img :src="novedad.imagen" width="400">
          <h3>{{ novedad.nombre }}</h3>
          <p>Precio: ${{ novedad.precio }}</p>
          <button @click="verificarLogin(novedad)">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
    
  </div>
  </div>
</template>

<style scoped>
.banner-foto {
  background-image: url('/imagenes/banner.jpg');
  background-size: cover;
  background-position: center;
  margin-top: 150px;
  padding: 200px 20px;
  text-align: center;
}

.banner-texto {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.banner-texto h1 {
  color: #ffffff;
  font-size: 70px;
  text-shadow: 3px 3px 6px rgba(223, 13, 13, 0.9);
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 15px;
  padding: 20px 40px;
  margin: 0 0 40px 0;
  display: inline-block;
}

.banner-texto p {
  color: #ffffff;
  font-size: 30px;
  text-shadow: 3px 3px 6px rgba(223, 13, 13, 0.9);
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 15px;
  padding: 20px 40px;
  margin: 0;
  display: inline-block;
}

.bloque-seccion {
  padding: 5px 180px 60px 180px;
  background-color: #f9f9f9;
  margin-top: -30px;
}

.contenedor-titulo-seccion {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 30px;
}

.titulo-seccion {
  font-size: 50px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding-bottom: 7px;
  display: inline-block;
  text-align: center;
  border-bottom: 4px solid #d32f2f; 
}


.lista-productos {
display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  justify-content: center;
  max-width: 1300px;
  margin: 0 auto;
  width: 100%;
}

.tarjeta-individual {
  background-color: #ffffff;
  border-radius: 15px;
  padding: 25px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 420px;
  border: 1px solid rgba(0, 0, 0, 0.06); 
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06); 
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease;
}

.tarjeta-individual:hover {
  transform: translateY(-8px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.12);
}

.imagen-producto {
  width: 100%;
  height: 200px;
  object-fit: contain;
  margin-bottom: 15px;
}

.titulo-producto {
font-size: 20px;
  color: #1a1a1a;
  font-weight: 700;
  text-transform: capitalize;
  margin: 15px 0 0 0;
  line-height: 1.3;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.titulo-producto::after {
  content: '';
  width: 70%;
  height: 3px;
  background-color: #e0e0e0;
  margin: 12px 0 20px 0;
  display: block;
}

.precio-producto {
  font-size: 22px;
  color: #d32f2f;
  font-weight: 700;
  margin: 0 0 25px 0;          
  letter-spacing: -0.5px;
  width: 100%;
}

.boton-carrito {
  background-color: #d32f2f;
  color: #ffffff;
  border: 2px solid #d32f2f;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
  margin-top: auto; 
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.boton-carrito:hover {
  background-color: #ffffff;
  color: #d32f2f;
  border-color: #d32f2f;
}
</style>
