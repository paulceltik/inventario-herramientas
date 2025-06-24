// ui.js
export class TablaDinamica {
    constructor({ selectorTipo, buscador, tabla, paginacion, btnAgregar, onEdit, onDelete, onAdd }) {
        this.selectorTipo = selectorTipo;
        this.buscador = buscador;
        this.tabla = tabla;
        this.paginacion = paginacion;
        this.btnAgregar = btnAgregar;
        this.onEdit = onEdit;
        this.onDelete = onDelete;
        this.onAdd = onAdd;

        this.datos = [];
        this.datosFiltrados = [];
        this.paginaActual = 1;
        this.registrosPorPagina = 20;
        this.headers = [];
        this.tipoActual = 'herramientas';

        this.init();
    }

    init() {
        this.selectorTipo.addEventListener('change', () => this.cambiarTipo());
        this.buscador.addEventListener('input', () => this.buscar());
        this.paginacion.querySelector('#btn-anterior').addEventListener('click', () => this.cambiarPagina(-1));
        this.paginacion.querySelector('#btn-siguiente').addEventListener('click', () => this.cambiarPagina(1));
        this.btnAgregar.addEventListener('click', () => this.onAdd(this.tipoActual));
    }

    // Recibe y almacena los datos de la tabla, asegurando que sea un array
    setDatos(datos) {
        this.datos = Array.isArray(datos) ? datos : [];
        this.buscar();
    }

    buscar() {
        const query = this.buscador.value.toLowerCase();
        this.datosFiltrados = this.datos.filter(row =>
            this.headers.some(h => String(row[h]).toLowerCase().includes(query))
        );
        this.paginaActual = 1;
        this.render();
    }

    cambiarPagina(delta) {
        this.paginaActual += delta;
        this.render();
    }

    cambiarTipo() {
        this.tipoActual = this.selectorTipo.value;
        this.paginaActual = 1;
        this.buscador.value = '';
        this.onTipoCambiado && this.onTipoCambiado(this.tipoActual);
    }

    render() {
        // Renderizar tabla y paginación
        const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
        const fin = inicio + this.registrosPorPagina;
        const pagina = this.datosFiltrados.slice(inicio, fin);

        // Encabezados + acciones
        this.headers = this.datos.length > 0 ? Object.keys(this.datos[0]) : [];
        const thead = this.tabla.querySelector('thead');
        thead.innerHTML = '<tr>' + this.headers.map(h => `<th>${h}</th>`).join('') + '<th>Acciones</th></tr>';

        // Filas
        const tbody = this.tabla.querySelector('tbody');
        tbody.innerHTML = pagina.map(row =>
            '<tr>' +
            this.headers.map(h => `<td>${row[h]}</td>`).join('') +
            `<td>
                <button class="editar" data-id="${row.ID}">Editar</button>
                <button class="eliminar" data-id="${row.ID}">Eliminar</button>
            </td></tr>`
        ).join('');

        // Eventos acciones
        tbody.querySelectorAll('.editar').forEach(btn =>
            btn.onclick = () => this.onEdit(this.tipoActual, btn.dataset.id)
        );
        tbody.querySelectorAll('.eliminar').forEach(btn =>
            btn.onclick = () => this.onDelete(this.tipoActual, btn.dataset.id)
        );

        // Paginación
        this.paginacion.querySelector('#paginacion').innerText =
            `Página ${this.paginaActual} de ${Math.max(1, Math.ceil(this.datosFiltrados.length / this.registrosPorPagina))}`;
        this.paginacion.querySelector('#btn-anterior').disabled = this.paginaActual === 1;
        this.paginacion.querySelector('#btn-siguiente').disabled = fin >= this.datosFiltrados.length;

        // Mostrar tabla
        this.tabla.style.display = this.datosFiltrados.length ? 'table' : 'none';
    }
}
