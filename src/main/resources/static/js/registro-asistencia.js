// =============================================
// CONFIGURACIÓN DE LA API
// =============================================
const API_COLABORADORES = 'http://localhost:8080/api/colaboradores';
const API_ASISTENCIA = 'http://localhost:8080/api/asistencia';
const API_NOVEDADES = 'http://localhost:8080/api/novedades';

// =============================================
// VARIABLES GLOBALES
// =============================================
let colaboradores = [];
let colaboradoresExcepcion = [];
let fechaSeleccionada = new Date();
let detalleRegistros = [];

// =============================================
// INICIALIZAR
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fechaRegistro').value = hoy;
    fechaSeleccionada = new Date();
    actualizarFechaMostrada();
    
    cargarColaboradores();
    
    document.getElementById('fechaRegistro').addEventListener('change', function() {
        fechaSeleccionada = new Date(this.value + 'T00:00:00');
        actualizarFechaMostrada();
        cargarColaboradores();
        colaboradoresExcepcion = [];
    });
});

// =============================================
// ACTUALIZAR FECHA MOSTRADA
// =============================================
function actualizarFechaMostrada() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('fechaMostrada').textContent = fechaSeleccionada.toLocaleDateString('es-ES', options);
    
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    document.getElementById('diaSemana').textContent = dias[fechaSeleccionada.getDay()];
}

// =============================================
// CARGAR COLABORADORES CON FILTRO INTELIGENTE
// =============================================
async function cargarColaboradores() {
    try {
        const response = await fetch(API_COLABORADORES + '/activos');
        if (!response.ok) throw new Error('Error al cargar colaboradores');
        
        let lista = await response.json();
        
        const esSabado = fechaSeleccionada.getDay() === 6;
        
        if (esSabado) {
            const fechaStr = fechaSeleccionada.toISOString().split('T')[0];
            const responseAsistencia = await fetch(`${API_ASISTENCIA}/fecha/${fechaStr}`);
            let colaboradoresConMarcacion = [];
            if (responseAsistencia.ok) {
                const registros = await responseAsistencia.json();
                colaboradoresConMarcacion = registros.map(r => r.colaborador.id);
            }
            
            lista = lista.filter(c => 
                c.horario === 'LUNES_SABADO' || 
                colaboradoresConMarcacion.includes(c.id) ||
                colaboradoresExcepcion.some(ex => ex.id === c.id)
            );
        }
        
        colaboradores = lista;
        renderizarTabla(colaboradores);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('cuerpoTabla').innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle"></i> Error al cargar datos
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
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="fas fa-info-circle"></i> No hay colaboradores disponibles
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    lista.forEach((col, index) => {
        const estadoClase = col.activo ? 'badge-registrado' : 'badge-pendiente';
        const estadoTexto = col.activo ? 'Activo' : 'Inactivo';

        html += `
            <tr>
                <td>
                    <input type="checkbox" class="checkbox-masivo checkbox-individual" data-id="${col.id}" ${col.activo ? '' : 'disabled'}>
                </td>
                <td><strong>${col.codigoVentas}</strong></td>
                <td>${col.nombreCompleto}</td>
                <td><span class="badge bg-${col.rol === 'ASESORIA' ? 'primary' : 'warning'}">${col.rol}</span></td>
                <td><span class="badge bg-info">${col.horario === 'LUNES_VIERNES' ? 'L-V' : 'L-S'}</span></td>
                <td>${col.sucursal}</td>
                <td><span class="badge bg-secondary">Sin novedad</span></td>
                <td><span class="badge ${estadoClase}">${estadoTexto}</span></td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// =============================================
// SELECCIONAR TODOS
// =============================================
function seleccionarTodos() {
    const seleccionarTodos = document.getElementById('seleccionarTodos').checked;
    const checkboxes = document.querySelectorAll('.checkbox-individual');
    checkboxes.forEach(cb => {
        if (!cb.disabled) {
            cb.checked = seleccionarTodos;
        }
    });
}

// =============================================
// MARCAR ASISTENCIA
// =============================================
async function marcarAsistencia() {
    const fecha = document.getElementById('fechaRegistro').value;
    const horaEntrada = document.getElementById('horaEntrada').value;
    const horaSalida = document.getElementById('horaSalida').value;

    if (!fecha || !horaEntrada || !horaSalida) {
        alert('Por favor, complete todos los campos');
        return;
    }

    const checkboxes = document.querySelectorAll('.checkbox-individual:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));

    if (ids.length === 0) {
        alert('Seleccione al menos un colaborador');
        return;
    }

    if (!confirm(`¿Marcar asistencia para ${ids.length} colaborador(es)?`)) {
        return;
    }

    try {
        const params = new URLSearchParams();
        ids.forEach(id => params.append('colaboradorIds', id));
        params.append('fecha', fecha);
        params.append('horaEntrada', horaEntrada);
        params.append('horaSalida', horaSalida);

        const url = `${API_ASISTENCIA}/marcacion-masiva?${params.toString()}`;
        
        const response = await fetch(url, { method: 'POST' });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error: ${response.status} - ${errorText}`);
        }

        const resultado = await response.json();
        alert(`✅ Asistencia marcada para ${resultado.length} colaborador(es)`);
        
        cargarColaboradores();

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al marcar asistencia: ' + error.message);
    }
}

// =============================================
// REGISTRO EXCEPCIÓN - SÁBADOS
// =============================================

async function abrirModalExcepcion() {
    const esSabado = fechaSeleccionada.getDay() === 6;
    if (!esSabado) {
        alert('El registro excepción solo está disponible para sábados.');
        return;
    }

    try {
        const response = await fetch(API_COLABORADORES + '/activos');
        if (!response.ok) throw new Error('Error al cargar colaboradores');
        const todos = await response.json();
        
        const idsEnGrilla = colaboradores.map(c => c.id);
        const disponibles = todos.filter(c => 
            c.horario === 'LUNES_VIERNES' && 
            !idsEnGrilla.includes(c.id)
        );
        
        renderizarTablaExcepcion(disponibles);
        
        const modal = new bootstrap.Modal(document.getElementById('modalExcepcion'));
        modal.show();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar colaboradores L-V');
    }
}

function renderizarTablaExcepcion(lista) {
    const tbody = document.getElementById('cuerpoExcepcion');
    
    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <i class="fas fa-info-circle"></i> No hay colaboradores L-V disponibles para agregar
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    lista.forEach((col, index) => {
        html += `
            <tr>
                <td>
                    <input type="checkbox" class="checkbox-excepcion" data-id="${col.id}">
                </td>
                <td><strong>${col.codigoVentas}</strong></td>
                <td>${col.nombreCompleto}</td>
                <td>${col.sucursal}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function seleccionarTodosExcepcion(checkbox) {
    const checkboxes = document.querySelectorAll('.checkbox-excepcion');
    checkboxes.forEach(cb => cb.checked = checkbox.checked);
}

async function agregarExcepcion() {
    const checkboxes = document.querySelectorAll('.checkbox-excepcion:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));

    if (ids.length === 0) {
        alert('Seleccione al menos un colaborador');
        return;
    }

    try {
        const response = await fetch(API_COLABORADORES + '/activos');
        const todos = await response.json();
        const seleccionados = todos.filter(c => ids.includes(c.id));
        
        colaboradoresExcepcion = [...colaboradoresExcepcion, ...seleccionados];
        
        bootstrap.Modal.getInstance(document.getElementById('modalExcepcion')).hide();
        cargarColaboradores();
        
        alert(`✅ ${seleccionados.length} colaborador(es) agregado(s) a la grilla`);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar colaboradores');
    }
}

// =============================================
// DETALLE DE REGISTROS POR SEMANA
// =============================================

async function abrirDetalle() {
    const seccion = document.getElementById('seccionDetalle');
    if (seccion.style.display === 'none') {
        seccion.style.display = 'block';
        await cargarSelectColaboradores();
        const hoy = new Date();
        const diaSemana = hoy.getDay();
        const lunes = new Date(hoy);
        lunes.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
        const domingo = new Date(lunes);
        domingo.setDate(lunes.getDate() + 6);
        document.getElementById('detalleFechaInicio').value = lunes.toISOString().split('T')[0];
        document.getElementById('detalleFechaFin').value = domingo.toISOString().split('T')[0];
        cargarDetalleSemana();
    } else {
        ocultarDetalle();
    }
}

function ocultarDetalle() {
    document.getElementById('seccionDetalle').style.display = 'none';
}

async function cargarSelectColaboradores() {
    try {
        const response = await fetch(API_COLABORADORES + '/activos');
        if (!response.ok) throw new Error('Error al cargar colaboradores');
        const colaboradores = await response.json();
        
        const select = document.getElementById('selectColaboradorDetalle');
        select.innerHTML = '<option value="">Seleccionar colaborador...</option>';
        colaboradores.forEach(col => {
            const option = document.createElement('option');
            option.value = col.id;
            option.textContent = `${col.codigoVentas} - ${col.nombreCompleto}`;
            select.appendChild(option);
        });
        
        if (colaboradores.length > 0) {
            select.value = colaboradores[0].id;
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar colaboradores');
    }
}

async function cargarDetalleSemana() {
    const colaboradorId = document.getElementById('selectColaboradorDetalle').value;
    const fechaInicio = document.getElementById('detalleFechaInicio').value;
    const fechaFin = document.getElementById('detalleFechaFin').value;

    if (!colaboradorId || !fechaInicio || !fechaFin) {
        document.getElementById('cuerpoDetalle').innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="fas fa-info-circle"></i> Selecciona un colaborador y una semana
                </td>
            </tr>
        `;
        return;
    }

    try {
        const url = `${API_ASISTENCIA}/colaborador/${colaboradorId}/semana/${fechaInicio}/${fechaFin}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar registros');
        
        detalleRegistros = await response.json();
        renderizarDetalle(detalleRegistros);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('cuerpoDetalle').innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle"></i> Error al cargar registros
                </td>
            </tr>
        `;
    }
}

function renderizarDetalle(registros) {
    const tbody = document.getElementById('cuerpoDetalle');
    
    if (registros.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="fas fa-info-circle"></i> No hay registros para esta semana
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    registros.forEach((reg, index) => {
        const novedad = reg.novedad || '-';
        html += `
            <tr>
                <td>${reg.fecha}</td>
                <td>${reg.horaEntrada}</td>
                <td>${reg.horaSalida}</td>
                <td>${reg.minutosTrabajados} min</td>
                <td>${novedad}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirEditarRegistro(${reg.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarRegistro(${reg.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

async function abrirEditarRegistro(id) {
    try {
        const registro = detalleRegistros.find(r => r.id === id);
        if (!registro) {
            alert('Registro no encontrado');
            return;
        }

        document.getElementById('editRegistroId').value = registro.id;
        document.getElementById('editFecha').value = registro.fecha;
        document.getElementById('editColaborador').value = registro.colaborador.nombreCompleto;
        document.getElementById('editHoraEntrada').value = registro.horaEntrada;
        document.getElementById('editHoraSalida').value = registro.horaSalida;
        document.getElementById('editMinutos').value = `${registro.minutosTrabajados} minutos`;

        const modal = new bootstrap.Modal(document.getElementById('modalEditarRegistro'));
        modal.show();

    } catch (error) {
        console.error('Error:', error);
        alert('Error al abrir el registro');
    }
}

async function guardarEdicionRegistro() {
    const id = document.getElementById('editRegistroId').value;
    const horaEntrada = document.getElementById('editHoraEntrada').value;
    const horaSalida = document.getElementById('editHoraSalida').value;

    if (!horaEntrada || !horaSalida) {
        alert('Por favor, complete ambas horas');
        return;
    }

    try {
        const registro = detalleRegistros.find(r => r.id === parseInt(id));
        if (!registro) {
            alert('Registro no encontrado');
            return;
        }

        const registroActualizado = {
            ...registro,
            horaEntrada: horaEntrada,
            horaSalida: horaSalida
        };

        const response = await fetch(`${API_ASISTENCIA}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registroActualizado)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error: ${response.status} - ${errorText}`);
        }

        bootstrap.Modal.getInstance(document.getElementById('modalEditarRegistro')).hide();
        alert('✅ Registro actualizado correctamente');
        
        cargarDetalleSemana();

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al actualizar registro: ' + error.message);
    }
}

async function eliminarRegistro(id) {
    if (!confirm('¿Eliminar este registro permanentemente?')) return;

    try {
        const response = await fetch(`${API_ASISTENCIA}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error: ${response.status} - ${errorText}`);
        }

        alert('✅ Registro eliminado correctamente');
        
        cargarDetalleSemana();

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar registro: ' + error.message);
    }
}