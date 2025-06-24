// main.js
import InventarioAPI from './api.js';
import { TablaDinamica } from './ui.js';

//función "Cuando cargue toda la página"
document.addEventListener('DOMContentLoaded', () => {
    const tabla = new TablaDinamica({
        //acceder a todos los elementos de HTML
        selectorTipo: document.getElementById('selector-tipo'),
        buscador: document.getElementById('buscador'),
        tabla: document.getElementById('tabla-dinamica'),
        paginacion: document.getElementById('paginacion-container'),
        btnAgregar: document.getElementById('btn-agregar'),
        onEdit: mostrarFormularioEdicion,
        onDelete: eliminarRegistro,
        onAdd: mostrarFormularioAgregar
    });
    //función "Cuando el tipo cambie"
    tabla.onTipoCambiado = async (tipo) => {
        //mostrar icono de esperar hasta cargar todos los datos
        document.getElementById('tabla-loading').style.display = 'block';
        const datos = await InventarioAPI.listar(tipo);
        document.getElementById('tabla-loading').style.display = 'none';
        if (Array.isArray(datos)) {
            tabla.setDatos(datos);
        } else if (datos && datos.status === 'error') {
            tabla.setDatos([]);
            alert('Error al cargar datos: ' + (datos.message || 'Respuesta no válida'));
        } else {
            tabla.setDatos([]);
            alert('Respuesta inesperada de la API');
        }
    };

    // Carga inicial
    tabla.onTipoCambiado(tabla.tipoActual);

    // Funciones para agregar/editar/eliminar
    // --- MODAL LÓGICA ---
    const modal = document.getElementById('modal-registro');
    const cerrarModalBtn = document.getElementById('cerrar-modal');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalCampos = document.getElementById('modal-campos');
    const modalMensaje = document.getElementById('modal-mensaje');
    const formRegistro = document.getElementById('form-registro');
    const modalId = document.getElementById('modal-id');

    cerrarModalBtn.onclick = () => cerrarModal();
    modal.onclick = (e) => { if (e.target === modal) cerrarModal(); };

    function abrirModal(titulo) {
        modalTitulo.textContent = titulo;
        modalMensaje.textContent = '';
        modal.style.display = 'flex';
    }
    function cerrarModal() {
        modal.style.display = 'none';
        formRegistro.reset();
        modalCampos.innerHTML = '';
        modalId.value = '';
    }

    // Definición de campos por tipo
    const camposPorTipo = {
        herramientas: [
            { name: 'Nombre', key: 'Nombre', type: 'text', required: true },
            { name: 'Cantidad', key: 'Cantidad', type: 'number', required: true },
            { name: 'Estado', key: 'Estado', type: 'select', options: ['Nuevo', 'En uso', 'Dado de baja', 'Reparación'], required: true },
            { name: 'Observación', key: 'Observación', type: 'text', required: false }
        ],
        tecnicos: [
            { name: 'Nombre', key: 'Nombre', type: 'text', required: true },
            { name: 'Especialidad', key: 'Especialidad', type: 'text', required: true },
            { name: 'Teléfono', key: 'Teléfono', type: 'text', required: false },
            { name: 'Correo', key: 'Correo', type: 'email', required: false }
        ]
    };

    function renderizarCampos(tipo, valores = {}) {
        modalCampos.innerHTML = '';
        (camposPorTipo[tipo] || []).forEach(campo => {
            let input = '';
            if (campo.type === 'select') {
                input = `<select name="${campo.key}" id="modal-${campo.key}" ${campo.required ? 'required' : ''}>
                    <option value="">Seleccione</option>
                    ${campo.options.map(op => `<option value="${op}" ${valores[campo.key] === op ? 'selected' : ''}>${op}</option>`).join('')}
                </select>`;
            } else {
                input = `<input type="${campo.type}" name="${campo.key}" id="modal-${campo.key}" value="${valores[campo.key] || ''}" ${campo.required ? 'required' : ''} />`;
            }
            modalCampos.innerHTML += `
                <div style="margin-bottom:12px;">
                    <label for="modal-${campo.key}">${campo.name}</label><br>
                    ${input}
                </div>
            `;
        });
    }

    async function mostrarFormularioAgregar(tipo) {
        modalId.value = '';
        renderizarCampos(tipo);
        abrirModal('Agregar ' + (tipo === 'herramientas' ? 'Herramienta' : 'Técnico'));
        formRegistro.onsubmit = async function(e) {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(formRegistro).entries());
            modalMensaje.textContent = 'Guardando...';
            const resp = await InventarioAPI.agregar(tipo, data);
            if (resp.status === 'success') {
                modalMensaje.textContent = 'Registro agregado correctamente';
                tabla.onTipoCambiado(tipo);
                setTimeout(cerrarModal, 800);
            } else {
                modalMensaje.textContent = resp.message || 'Error al guardar';
            }
        };
    }

    async function mostrarFormularioEdicion(tipo, id) {
        // Buscar el registro por ID
        const registro = tabla.datos.find(r => String(r.ID) === String(id));
        if (!registro) {
            alert('Registro no encontrado');
            return;
        }
        modalId.value = id;
        renderizarCampos(tipo, registro);
        abrirModal('Editar ' + (tipo === 'herramientas' ? 'Herramienta' : 'Técnico'));
        formRegistro.onsubmit = async function(e) {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(formRegistro).entries());
            modalMensaje.textContent = 'Actualizando...';
            const resp = await InventarioAPI.actualizar(tipo, id, data);
            if (resp.status === 'success') {
                modalMensaje.textContent = 'Registro actualizado correctamente';
                tabla.onTipoCambiado(tipo);
                setTimeout(cerrarModal, 800);
            } else {
                modalMensaje.textContent = resp.message || 'Error al actualizar';
            }
        };
    }

    async function eliminarRegistro(tipo, id) {
        if (confirm('¿Seguro que deseas eliminar este registro?')) {
            await InventarioAPI.eliminar(tipo, id);
            tabla.onTipoCambiado(tipo);
        }
    }
});
