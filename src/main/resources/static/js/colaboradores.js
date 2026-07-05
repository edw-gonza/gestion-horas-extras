// =============================================
// CONFIGURACIÓN DE LA API
// =============================================
const API_URL = 'http://localhost:8080/api/colaboradores';

// =============================================
// VARIABLES GLOBALES
// =============================================
let colaboradores = [];
let modoEdicion = false;

// =============================================
// CARGAR COLABORADORES
// =============================================
async function cargarColaboradores() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar colaboradores');
        
        colaboradores = await response.json();
        renderizarTabla(colaboradores);
        actualizarContadores(colaboradores);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('cuerpoTabla').innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle"></i> Error al cargar datos. 
                    <button class="btn btn-sm btn-outline-primary ms-2" onclick="cargarColaboradores()">
                        Reintentar
                    </button>
                </td>
            </tr>
        `;
    }
}

// =============================================
// RENDERIZAR TABLA
// =============================================
function renderizarTabla(lista) {
    const tbody = document.getElementById('cuerpoTabla');
    
    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-4">
                    <i class="fas fa-info-circle"></i> No hay colaboradores registrados
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    lista.forEach((col, index) => {
        const estadoClase = col.activo ? 'bg-success' : 'bg-danger';
        const estadoTexto = col.activo ? 'Activo' : 'Inactivo';
        const rowClase = col.activo ? '' : 'inactivo-row';
        const rolColor = col.rol === 'ASESORIA' ? 'primary' : 'warning';

        html += `
            <tr class="${rowClase}">
                <td>${index + 1}</td>
                <td><strong>${col.codigoVentas}</strong></td>
                <td>${col.nombreCompleto}</td>
                <td><small>${col.correo}</small></td>
                <td><span class="badge bg-${rolColor} badge-rol">${col.rol}</span></td>
                <td><span class="badge bg-info">${col.horario === 'LUNES_VIERNES' ? 'L-V' : 'L-S'}</span></td>
                <td class="text-center">${col.horasSemanales}h</td>
                <td>${col.sucursal}</td>
                <td><span class="badge ${estadoClase}">${estadoTexto}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editarColaborador(${col.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm ${col.activo ? 'btn-outline-warning' : 'btn-outline-success'} me-1" onclick="toggleEstado(${col.id})" title="${col.activo ? 'Desactivar' : 'Activar'}">
                        <i class="fas ${col.activo ? 'fa-user-slash' : 'fa-user-check'}"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarColaborador(${col.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// =============================================
// ACTUALIZAR CONTADORES
// =============================================
function actualizarContadores(lista) {
    const activos = lista.filter(c => c.activo).length;
    const inactivos = lista.length - activos;
    document.getElementById('totalActivos').textContent = `Activos: ${activos}`;
    document.getElementById('totalInactivos').textContent = `Inactivos: ${inactivos}`;
}

// =============================================
// ABRIR MODAL PARA NUEVO COLABORADOR
// =============================================
function abrirModalNuevo() {
    modoEdicion = false;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Nuevo Colaborador';
    document.getElementById('formColaborador').reset();
    document.getElementById('id').value = '';
    document.getElementById('activo').checked = true;
    document.getElementById('horasSemanales').value = 42;
    document.getElementById('horaEntradaEstandar').value = '08:00';
    document.getElementById('horaSalidaEstandar').value = '17:00';
    document.getElementById('codigoVentas').readOnly = false;
}

// =============================================
// EDITAR COLABORADOR
// =============================================
async function editarColaborador(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Error al obtener colaborador');
        
        const col = await response.json();
        modoEdicion = true;
        
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Editar Colaborador';
        document.getElementById('id').value = col.id;
        document.getElementById('codigoVentas').value = col.codigoVentas;
        document.getElementById('nombreCompleto').value = col.nombreCompleto;
        document.getElementById('correo').value = col.correo;
        document.getElementById('fechaNacimiento').value = col.fechaNacimiento;
        document.getElementById('rol').value = col.rol;
        document.getElementById('horario').value = col.horario;
        document.getElementById('horasSemanales').value = col.horasSemanales;
        document.getElementById('horaEntradaEstandar').value = col.horaEntradaEstandar;
        document.getElementById('horaSalidaEstandar').value = col.horaSalidaEstandar;
        document.getElementById('sucursal').value = col.sucursal;
        document.getElementById('activo').checked = col.activo;
        document.getElementById('codigoVentas').readOnly = true;
        
        const modal = new bootstrap.Modal(document.getElementById('colaboradorModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos del colaborador');
    }
}

// =============================================
// GUARDAR COLABORADOR - SOLUCIÓN FINAL
// =============================================
async function guardarColaborador() {
    const codigoVentas = document.getElementById('codigoVentas').value.trim();
    const nombre = document.getElementById('nombreCompleto').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const fechaNac = document.getElementById('fechaNacimiento').value;
    const rol = document.getElementById('rol').value;
    const horario = document.getElementById('horario').value;
    const horas = document.getElementById('horasSemanales').value;
    const horaEntrada = document.getElementById('horaEntradaEstandar').value;
    const horaSalida = document.getElementById('horaSalidaEstandar').value;
    const sucursal = document.getElementById('sucursal').value.trim();
    const activo = document.getElementById('activo').checked;

    if (!codigoVentas || !nombre || !correo || !fechaNac || !horas || !horaEntrada || !horaSalida || !sucursal) {
        alert('Por favor, complete todos los campos obligatorios (*)');
        return;
    }

    const colaborador = {
        codigoVentas,
        nombreCompleto: nombre,
        correo,
        fechaNacimiento: fechaNac,
        rol,
        horario,
        horasSemanales: parseInt(horas),
        horaEntradaEstandar: horaEntrada,
        horaSalidaEstandar: horaSalida,
        sucursal,
        activo
    };

    const id = document.getElementById('id').value;
    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(colaborador)
        });

        if (!response.ok) {
            throw new Error('Error al guardar colaborador');
        }

        // =============================================
        // PUNTO FINAL: RECARGAR LA PÁGINA DIRECTAMENTE
        // =============================================
        window.location.reload();

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar el colaborador. Verifique que el código de ventas no esté duplicado.');
    }
}

// =============================================
// ACTIVAR / DESACTIVAR
// =============================================
async function toggleEstado(id) {
    const colaborador = colaboradores.find(c => c.id === id);
    if (!colaborador) return;

    const accion = colaborador.activo ? 'desactivar' : 'activar';
    if (!confirm(colaborador.activo ? '¿Desactivar este colaborador?' : '¿Activar este colaborador?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}/${accion}`, { method: 'PATCH' });
        if (!response.ok) throw new Error('Error al cambiar estado');
        cargarColaboradores();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cambiar el estado');
    }
}

// =============================================
// ELIMINAR
// =============================================
async function eliminarColaborador(id) {
    if (!confirm('¿Eliminar este colaborador?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar');
        cargarColaboradores();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar');
    }
}

// =============================================
// INICIALIZAR
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    cargarColaboradores();
    
    // Asociar el botón Guardar
    document.getElementById('btnGuardar').addEventListener('click', guardarColaborador);
    
    // Cuando se cierra el modal, habilitar el campo código de ventas
    document.getElementById('colaboradorModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('codigoVentas').readOnly = false;
    });
});