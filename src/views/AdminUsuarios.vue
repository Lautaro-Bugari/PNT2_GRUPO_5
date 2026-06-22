<script setup>
import { ref, onMounted } from "vue";
import { useStoreCarrito } from "../stores/storeCarrito";

const storeCarrito = useStoreCarrito();
const users = "https://6a14f50691ff9a63de0731e9.mockapi.io/api/users"
const listaUsuarios = ref([]);
const usuarioSeleccionado = ref(null);
const carritoUsuario = ref(null);
const mostrarFormularioCrear = ref(false);
const usuarioAEditar = ref(null);

const cargarUsuarios = async () => {
  try {
    const response = await fetch(users);
    listaUsuarios.value = await response.json();
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
};

const mostrarDetalles = async(user) => {
    usuarioSeleccionado.value = user;
    carritoUsuario.value = null;
    try {
        const carritosData = await storeCarrito.obtenerTodosLosCarritos();
        const carritoEncontrado = carritosData.find(carrito => carrito.userId === user.id);
        if (carritoEncontrado) {
            carritoUsuario.value = carritoEncontrado;
        } else {
            carritoUsuario.value = { itemsProductos: [] }
        }
    } catch (error) {
        console.error("Error al cargar carrito del usuario:", error);
    }
};

const nuevoUsuario = ref({
  username: "",
  email: "",
  password: "",
  avatar: 'https://avatars.githubusercontent.com/u/21501190'
});

const crearUsuario = async () => {
  try {
    const response = await fetch(users, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUsuario.value)
    })
    if (response.ok) {

      await cargarUsuarios()
      nuevoUsuario.value = { username: '', email: '', password: '', avatar: 'https://avatars.githubusercontent.com/u/21501190' }
      mostrarFormularioCrear.value = false
    }
  } catch (error) {
    console.error("Error al crear usuario:", error)
  }
}

const eliminarUsuario = async (id, name) => {
  const confirmar = confirm("¿Estás seguro de que deseas eliminar a este usuario?");
  
  if (confirmar) {
    try {
      const response = await fetch(`${users}/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        await cargarUsuarios()
        if (usuarioSeleccionado.value && usuarioSeleccionado.value.id === id) {
          usuarioSeleccionado.value = null
        }
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
    }
  }
}

const iniciarEdicion = (user) => {
  usuarioAEditar.value = { ...user }
}

const guardarEdicion = async () => {
  try {
    const response = await fetch(`${users}/${usuarioAEditar.value.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuarioAEditar.value)
    })
    if (response.ok) {
      await cargarUsuarios()
      usuarioAEditar.value = null
    }
  } catch (error) {
    console.error("Error al editar usuario:", error)
  }
}

onMounted(() => {
  cargarUsuarios();
});
</script>

<template>
  <div class="contenedor-admin">
    <h1 class="titulo-admin">Panel de Administración: Usuarios</h1>
    
    <div class="barra-acciones">
      <button v-if="!mostrarFormularioCrear" @click="mostrarFormularioCrear = true" class="boton boton-primario">
        Crear Nuevo Usuario
      </button>
      <button v-else @click="mostrarFormularioCrear = false" class="boton boton-secundario">
        Cancelar Creación
      </button>
    </div>
    
    <div v-if="mostrarFormularioCrear" class="contenedor-formulario">
      <h3>Crear Nuevo Usuario</h3>
      <form @submit.prevent="crearUsuario" class="formulario-admin">
        <div class="grupo-formulario">
          <label>Nombre</label>
          <input type="text" v-model="nuevoUsuario.username" required />
        </div>

        <div class="grupo-formulario">
          <label>Email</label>
          <input type="email" v-model="nuevoUsuario.email" required />
        </div>

        <div class="grupo-formulario">
          <label>Contraseña</label>
          <input type="text" v-model="nuevoUsuario.password" required />
        </div>

        <button type="submit" class="boton boton-exito">Guardar</button>
      </form>
    </div>

    <div v-if="usuarioAEditar" class="contenedor-formulario modo-edicion">
      <h3>Editar Usuario (ID: {{ usuarioAEditar.id }})</h3>
      <form @submit.prevent="guardarEdicion" class="formulario-admin">
        <div class="grupo-formulario">
          <label>Username</label>
          <input type="text" v-model="usuarioAEditar.username" required />
        </div>

        <div class="grupo-formulario">
          <label>Email</label>
          <input type="email" v-model="usuarioAEditar.email" required />
        </div>

        <div class="grupo-formulario">
          <label>Contraseña</label>
          <input type="text" v-model="usuarioAEditar.password" required />
        </div>

        <div class="acciones-formulario">
          <button type="submit" class="boton boton-exito">Actualizar Datos</button>
          <button type="button" @click="usuarioAEditar = null" class="boton boton-secundario">Cancelar</button>
        </div>
      </form>
    </div>

    <table class="tabla-admin">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Contraseña</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in listaUsuarios" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.password }}</td>
          <td class="acciones-tabla">
            <button @click="mostrarDetalles(user)" class="boton-accion boton-ver">Ver Detalle</button>
            <button @click="iniciarEdicion(user)" class="boton-accion boton-editar">Editar</button>
            <button @click="eliminarUsuario(user.id, user.username)" class="boton-accion boton-eliminar">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="usuarioSeleccionado" class="contenedor-detalles">
      <h2>Detalles del Usuario</h2>
      <div class="grilla-detalles">
        <p>Nombre:{{ usuarioSeleccionado.username }}</p>
        <p>Email:{{ usuarioSeleccionado.email }}</p>
        <p>Contraseña:{{ usuarioSeleccionado.password }}</p>
        <p>ID:{{ usuarioSeleccionado.id }}</p>
      </div>

      <div class="historial-carrito">
        <h3>Historial de Compras:</h3>
        <div v-if="carritoUsuario && carritoUsuario.itemsProductos && carritoUsuario.itemsProductos.length">
          <ul class="lista-carrito">
            <li v-for="(item, index) in carritoUsuario.itemsProductos" :key="index">
              <p>Producto ID: {{ item.id }}</p>
              <p class="etiqueta-cantidad">Cantidad: {{ item.cantidad }}</p>
            </li>
          </ul>
        </div>
        <p v-else class="carrito-vacio">Este usuario no tiene productos en su carrito actualmente.</p>
      </div>
      
      <button @click="usuarioSeleccionado = null" class="boton boton-secundario">Cerrar Detalles</button>
    </div>
  </div>
</template>

<style scoped>
.contenedor-admin {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

.titulo-admin {
  font-size: 28px;
  color : #df3636;
  margin-bottom: 25px;
  border-bottom: 2px solid #eaeaea;
  padding-bottom: 10px;
}

.barra-acciones {
  margin-bottom: 20px;
}

.boton {
  padding: 10px 18px;
  font-size: 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.boton-primario {
  background-color: #a62626;
  color: white;
}
.boton-primario:hover { background-color: #851e1e; }

.boton-secundario {
  background-color: #6e757c;
  color: white;
}
.boton-secundario:hover { background-color: #5a6065; }

.boton-exito {
  background-color: #198754;
  color: white;
}
.boton-exito:hover { background-color: #157347; }


.boton-accion {
  background: none;
  border: 1px solid #ddd;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
  font-size: 16px;
  transition: all 0.2s;
}

.boton-ver:hover {
  background-color: #e8f4fd; border-color: #bee5eb;
}

.boton-editar:hover {
  background-color: #fff3cd; border-color: #ffeeba; 
}

.boton-eliminar:hover {
  background-color: #f8d7da; border-color: #f5c6cb;
}

.contenedor-formulario {
  background-color: #f9f9f9;
  border: 1px solid #e2e2e2;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
}
.contenedor-formulario.modo-edicion {
  border-left: 4px solid #ffc107;
}
.formulario-admin {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 500px;
}
.grupo-formulario {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.grupo-formulario label {
  font-size: 14px;
  font-weight: 600;
  color: #555;
}
.grupo-formulario input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 15px;
}
.acciones-formulario {
  display: flex;
  gap: 10px;
}

.tabla-admin {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #eee;
  margin-bottom: 25px;
}
.tabla-admin th {
  background-color: #f8f9fa;
  color: #495057;
  padding: 14px 16px;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}
.tabla-admin td {
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}
.tabla-admin tbody tr:hover {
  background-color: #fdfdfd;
}
code {
  background-color: #f1f1f1;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.contenedor-detalles {
  margin-top: 30px;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.grilla-detalles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
}
.grilla-detalles p {
  margin: 0;
}
.historial-carrito {
  margin-bottom: 25px;
}
.lista-carrito {
  list-style: none;
  padding: 0;
}
.lista-carrito li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f1f3f5;
  margin-bottom: 6px;
  border-radius: 4px;
  max-width: 400px;
}
.etiqueta-cantidad {
  background-color: #6c757d;
  color: white;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 13px;
}
.carrito-vacio {
  color: #6c757d;
  font-style: italic;
}
</style>