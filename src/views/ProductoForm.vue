<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoreProducto } from '../stores/storeProducto'

const route = useRoute()
const router = useRouter()
const storeProducto = useStoreProducto()

const esEdicion = computed(() => !!route.params.id)
const categorias = ref([])
const cargando = ref(true)

const form = ref({
  id: null,
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  categoriaId: null,
  habilitado: false
})

const cargarCategorias = async () => {
  try {
    const res = await fetch('http://localhost:8000/categorias')
    const data = await res.json()
    categorias.value = data.data || []
  } catch (error) {
    console.error('Error cargando categorías:', error)
  }
}

const cargarProducto = async () => {
  if (!esEdicion.value) return
  try {
    const producto = await storeProducto.getProductoById(route.params.id)
    if (producto) {
      form.value = { ...producto }
    } else {
      alert('Producto no encontrado')
      router.push('/admin/productos')
    }
  } catch (error) {
    console.error(error)
    alert('Error al cargar el producto')
  }
}

onMounted(async () => {
  await cargarCategorias()
  await cargarProducto()
  cargando.value = false
})

const guardar = async () => {
  try {
    if (esEdicion.value) {
      await storeProducto.updateProducto(form.value.id, form.value)
    } else {
      await storeProducto.createProducto(form.value)
    }
    router.push('/admin/productos')
  } catch (error) {
    console.error(error)
    alert('Error al guardar el producto')
  }
}

const cancelar = () => router.push('/admin/productos')
</script>

<template>
  <div >
    <h1>{{ esEdicion ? 'Editar Producto' : 'Nuevo Producto' }}</h1>
    <form @submit.prevent="guardar">
      <div>
        <label for="nombre">Nombre *</label>
        <input id="nombre" v-model="form.nombre" type="text" required />
      </div>

      <div >
        <label for="descripcion">Descripción *</label>
        <textarea 
        id="descripcion" 
        v-model="form.descripcion" 
        required 
        minlength="10"
        maxlength="500"
        ></textarea>
        <small v-if="form.descripcion.length < 10 && form.descripcion.length > 0">
            La descripción debe tener al menos 10 caracteres.
        </small>
</div>

      <div>
        <label for="precio">Precio *</label>
        <input id="precio" v-model.number="form.precio" type="number" step="0.01" min="0" required />
      </div>

      <div >
        <label for="stock">Stock *</label>
        <input id="stock" v-model.number="form.stock" type="number" min="0" required />
      </div>

      <div >
        <label for="categoria">Categoría *</label>
        <select id="categoria" v-model="form.categoriaId" required>
          <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
            {{ cat.nombre }}
          </option>
        </select>
      </div>

      <div class="campo checkbox">
        <label>
          <input v-model="form.habilitado" type="checkbox" />
          Producto habilitado
        </label>
      </div>

      <div class="acciones">
        <button type="submit" class="btn-guardar">💾 Guardar</button>
        <button type="button" class="btn-cancelar" @click="cancelar">❌ Cancelar</button>
      </div>
    </form>
  </div>
</template>