// tabla_dinamica.js
const ENDPOINTS = {
    herramientas: 'https://script.google.com/macros/s/AKfycbwdUbRv1jujTsSEhjbUrQy8GEJ_QufCSMv5ru-g86-41khOqTzmTVpmalN9tQj7Yy06/exec?token=interamericanapruebas&action=herramientas',
    tecnicos: 'https://script.google.com/macros/s/AKfycbwdUbRv1jujTsSEhjbUrQy8GEJ_QufCSMv5ru-g86-41khOqTzmTVpmalN9tQj7Yy06/exec?token=interamericanapruebas&action=tecnicos'
};

let datos = [];
let datosFiltrados = [];
let paginaActual = 1;
const registrosPorPagina = 20;
let headers = [];
let tipoActual = 'herramientas';

function mostrarTabla() {
    const table = document.getElementById('tabla-dinamica');
    const thead = document.getElementById('tabla-thead');
    const tbody = document.getElementById('tabla-tbody');
    // Encabezados
    thead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '<th>Acciones</th></tr>';
    // Paginación
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const pagina = datosFiltrados.slice(inicio, fin);
    // Filas
    tbody.innerHTML = pagina.map((row, idx) =>
        '<tr>' +
        headers.map(h => `<td>${row[h]}</td>`).join('') +
        `<td><button onclick="editarRegistro(${inicio + idx})">Editar</button></td>` +
        '</tr>'
    ).join('');
    document.getElementById('paginacion').innerText = `Página ${paginaActual} de ${Math.ceil(datosFiltrados.length / registrosPorPagina)}`;
    document.getElementById('btn-anterior').disabled = paginaActual === 1;
    document.getElementById('btn-siguiente').disabled = fin >= datosFiltrados.length;
}

async function cargarDatos(tipo) {
    tipoActual = tipo;
    document.getElementById('tabla-loading').style.display = 'block';
    document.getElementById('tabla-dinamica').style.display = 'none';
    try {
        const resp = await fetch(ENDPOINTS[tipo]);
        datos = await resp.json();
        if (!Array.isArray(datos) || datos.length === 0) {
            document.getElementById('tabla-loading').innerText = 'No hay datos.';
            return;
        }
        headers = Object.keys(datos[0]);
        datosFiltrados = [...datos];
        paginaActual = 1;
        mostrarTabla();
        document.getElementById('tabla-loading').style.display = 'none';
        document.getElementById('tabla-dinamica').style.display = 'table';
    } catch (e) {
        document.getElementById('tabla-loading').innerText = 'Error al cargar los datos.';
    }
}

function buscarDatos() {
    const query = document.getElementById('buscador').value.toLowerCase();
    datosFiltrados = datos.filter(row =>
        headers.some(h => String(row[h]).toLowerCase().includes(query))
    );
    paginaActual = 1;
    mostrarTabla();
}

function cambiarPagina(delta) {
    paginaActual += delta;
    mostrarTabla();
}

function editarRegistro(idx) {
    alert('Funcionalidad de edición pendiente para el registro #' + (idx + 1));
}

function agregarRegistro() {
    alert('Funcionalidad para agregar nuevo registro pendiente');
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('selector-tipo').addEventListener('change', e => cargarDatos(e.target.value));
    document.getElementById('buscador').addEventListener('input', buscarDatos);
    document.getElementById('btn-anterior').addEventListener('click', () => cambiarPagina(-1));
    document.getElementById('btn-siguiente').addEventListener('click', () => cambiarPagina(1));
    document.getElementById('btn-agregar').addEventListener('click', agregarRegistro);
    cargarDatos('herramientas');
});
