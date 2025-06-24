// api.js
// Importa ENDPOINT desde .env.js
import { ENDPOINT } from './.env.js';

//clase para los métodos de la base de datos
export default class InventarioAPI {
    // Listar registros (GET)
    static async listar(action) {
        const url = `${ENDPOINT}?action=${action}`;
        const resp = await fetch(url);
        return await resp.json();
    }
    // Agregar registro (POST) evitando preflight/CORS
    static async agregar(action, data) {
        const resp = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Evita preflight y CORS
            body: JSON.stringify({ ...data, action })
        });
        return await resp.json();
    }
    // Actualizar registro (PUT) evitando preflight/CORS
    static async actualizar(action, id, data) {
        const resp = await fetch(ENDPOINT, {
            method: 'PUT',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Evita preflight y CORS
            body: JSON.stringify({ ...data, action, id })
        });
        return await resp.json();
    }
    // Eliminar registro (DELETE) evitando preflight/CORS
    static async eliminar(action, id) {
        const resp = await fetch(ENDPOINT, {
            method: 'DELETE',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Evita preflight y CORS
            body: JSON.stringify({ action, id })
        });
        return await resp.json();
    }
}

