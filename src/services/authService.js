import { u } from "vue-router/dist/useApi-D6ckOsFy.js";

const USUARIOS_REGISTRADOS = [
  { email: "kiosko@gmail.com", password: "123456", nombre: "Kiosco123" },
];

export const authService = {
    login(email, password) {
        const usuarioEncontrado = USUARIOS_REGISTRADOS.find(
            (usuario) => usuario.email === email && usuario.password === password
        );
        let resultado = null;
        if (usuarioEncontrado) {
            resultado = { email: usuarioEncontrado.email, nombre: usuarioEncontrado.nombre };
        }
        return resultado;
    }
}