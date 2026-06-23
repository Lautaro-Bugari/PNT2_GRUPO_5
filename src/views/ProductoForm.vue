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
  <div class="contenedor-formulario-producto">
    <div class="tarjeta-formulario-producto">
      <h1 class="titulo-formulario">{{ esEdicion ? 'Editar Producto' : 'Nuevo Producto' }}</h1>
      
      <form @submit.prevent="guardar" class="formulario-producto">
        <div class="grupo-input">
          <label for="nombre" class="etiqueta-formulario">Nombre *</label>
          <input id="nombre" v-model="form.nombre" type="text" class="input-formulario" required />
        </div>
        
        <div class="grupo-input">
          <label for="descripcion" class="etiqueta-formulario">Descripción *</label>
          <textarea 
            id="descripcion" 
            v-model="form.descripcion" 
            class="textarea-formulario"
            required 
            minlength="10"
            maxlength="500"
          ></textarea>
          <small v-if="form.descripcion.length < 10 && form.descripcion.length > 0" class="texto-error-validacion">
            La descripción debe tener al menos 10 caracteres.
          </small>
        </div>
        
        <div class="grupo-input">
          <label for="precio" class="etiqueta-formulario">Precio *</label>
          <input id="precio" v-model.number="form.precio" type="number" step="0.01" min="0" class="input-formulario" required />
        </div>
        
        <div class="grupo-input">
          <label for="stock" class="etiqueta-formulario">Stock *</label>
          <input id="stock" v-model.number="form.stock" type="number" min="0" class="input-formulario" required />
        </div>
        
        <div class="grupo-input">
          <label for="categoria" class="etiqueta-formulario">Categoría *</label>
          <select id="categoria" v-model="form.categoriaId" class="select-formulario" required>
            <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
              {{ cat.nombre }}
            </option>
          </select>
        </div>
        
        <div class="campo checkbox-contenedor">
          <label class="etiqueta-checkbox">
            <input v-model="form.habilitado" type="checkbox" class="input-checkbox" />
            Producto habilitado
          </label>
        </div>
        
        <div class="acciones-formulario">
          <button type="submit" class="btn-guardar">💾 Guardar</button>
          <button type="button" class="btn-cancelar" @click="cancelar">❌ Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.contenedor-formulario-producto {
  min-height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  padding: 40px 20px;
  color: #2b2b2b;
}

.tarjeta-formulario-producto {
  background: #ffffff;
  width: 100%;
  max-width: 550px;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaeaea;
}

.titulo-formulario {
  font-size: 26px;
  font-weight: 800;
  color: #e60000;
  margin: 0 0 30px 0;
  text-align: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
}

.formulario-producto {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.grupo-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.etiqueta-formulario {
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

.input-formulario,
.select-formulario,
.textarea-formulario {
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  color: #333;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
}

.textarea-formulario {
  min-height: 100px;
  resize: vertical;
}

.input-formulario:focus,
.select-formulario:focus,
.textarea-formulario:focus {
  outline: none;
  border-color: #e60000;
  box-shadow: 0 0 0 3px rgba(230, 0, 0, 0.1);
}

.texto-error-validacion {
  color: #dc3545;
  font-size: 13px;
  font-weight: 500;
  margin-top: 2px;
}

.checkbox-contenedor {
  margin: 5px 0;
}

.etiqueta-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
}

.input-checkbox {
  accent-color: #e60000;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.acciones-formulario {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.btn-guardar,
.btn-cancelar {
  flex: 1;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-guardar:active,
.btn-cancelar:active {
  transform: scale(0.98);
}

.btn-guardar {
  background-color: #e60000;
  color: #fff;
}

.btn-guardar:hover {
  background-color: #c90000;
}

.btn-cancelar {
  background-color: #ffffff;
  color: #444;
  border: 1px solid #ccc;
}

.btn-cancelar:hover {
  background-color: #f1f1f1;
  border-color: #888;
}
</style>