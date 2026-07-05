// =============================================
// CONFIGURACIÓN DE LA API
// =============================================
const API_NOVEDADES = 'http://localhost:8080/api/novedades';
const API_COLABORADORES = 'http://localhost:8080/api/colaboradores';

// =============================================
// VARIABLES GLOBALES
// =============================================
let colaboradores = [];

// =============================================
// INICIALIZAR
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    cargarNovedades();
    cargarColaboradores();

    // Mostrar campo de fecha fin según el tipo de novedad
    document.getElementById('tipoIndividual').addEventListener('change', function() {
        const divFechaFin = document.getElementById('divFechaFin');
        const tipo = this.value;
        
        // Tipos que requieren rango de fechas
        const tiposConRango = ['PERMISO', 'PERMISO_MEDICO', 'CALAMIDAD', 'INCAPACIDAD'];
        // Tipos que son solo un día
        const tiposUnDia = ['CUMPLEAÑOS'];
        
        if (tiposConRango.includes(tipo)) {
            divFechaFin.style.display = 'block';
            document.getElementById('fechaFinIndividual').required = true;
        } else if (tiposUnDia.includes(tipo)) {
            divFechaFin.style.display = 'none';
            document.getElementById('fechaFinIndividual').required = false;
            document.getElementById('fechaFinIndividual').value = '';
        }
    });
});

// =============================================
// CARGAR COLABORADORES PARA EL SELECT
// =============================================
async function cargarColaboradores() {
    try {
        const response = await fetch(API_COLABORADORES + '/activos');
        if (!response.ok) throw new Error('Error al cargar colaboradores');
        
        colaboradores = await response.json();
        const select = document.getElementById('colaboradorIndividual');
        select.innerHTML = '<option value="">Seleccionar...</option>';
        
        colaboradores.forEach(col => {
            const option = document.createElement('option');
            option.value = col.id;
            option.textContent = `${col.codigoVentas} - ${col.nombreCompleto}`;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// =============================================
// CARGAR NOVEDADES
// =============================================
async function cargarNovedades() {
    try {
        const response = await fetch(API_NOVEDADES);
        if (!response.ok) throw new Error('Error al cargar novedades');
        
        const novedades = await response.json();
        renderizarTabla(novedades);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('cuerpoTabla').innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle"></i> Error al cargar novedades
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
                    <i class="fas fa-info-circle"></i> No hay novedades registradas
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    lista.forEach((nov, index) => {
        const nombreCol = nov.colaborador ? nov.colaborador.nombreCompleto : 'Todos';
        const ambito = nov.colaborador ? 'Individual' : 'Grupal';
        const ambitoClase = nov.colaborador ? 'badge-individual' : 'badge-grupal';

        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${nombreCol}</td>
                <td><span class="badge bg-${getColorTipo(nov.tipo)}">${nov.tipo}</span></td>
                <td>${nov.fechaInicio}</td>
                <td>${nov.fechaFin || '-'}</td>
                <td>${nov.descripcion || '-'}</td>
                <td><span class="badge ${ambitoClase}">${ambito}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarNovedad(${nov.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// =============================================
// COLORES POR TIPO
// =============================================
function getColorTipo(tipo) {
    const colores = {
        'FESTIVO': 'success',
        'VIERNES_FELIZ': 'info',
        'PERMISO': 'primary',
        'PERMISO_MEDICO': 'danger',
        'CUMPLEAÑOS': 'warning',
        'CALAMIDAD': 'dark',
        'INCAPACIDAD': 'secondary'
    };
    return colores[tipo] || 'secondary';
}

// =============================================
// ABRIR MODAL GRUPAL
// =============================================
function abrirModalGrupal(tipo) {
    document.getElementById('tipoGrupal').value = tipo;
    const titulo = tipo === 'FESTIVO' ? 'Festivo' : 'Viernes Feliz';
    document.getElementById('modalGrupalTitle').innerHTML = 
        `<i class="fas fa-users"></i> ${titulo} (Grupal)`;
    document.getElementById('fechaGrupal').value = new Date().toISOString().split('T')[0];
    document.getElementById('descripcionGrupal').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('modalGrupal'));
    modal.show();
}

// =============================================
// GUARDAR NOVEDAD GRUPAL
// =============================================
async function guardarGrupal() {
    const tipo = document.getElementById('tipoGrupal').value;
    const fecha = document.getElementById('fechaGrupal').value;
    const descripcion = document.getElementById('descripcionGrupal').value.trim();

    if (!fecha) {
        alert('Por favor, seleccione una fecha');
        return;
    }

    const endpoint = tipo === 'FESTIVO' ? '/festivo' : '/viernes-feliz';
    let url = `${API_NOVEDADES}${endpoint}?fecha=${fecha}`;
    if (descripcion) {
        url += `&descripcion=${encodeURIComponent(descripcion)}`;
    }

    try {
        const response = await fetch(url, { method: 'POST' });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }
        
        bootstrap.Modal.getInstance(document.getElementById('modalGrupal')).hide();
        cargarNovedades();
        alert('✅ Novedad grupal creada correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al crear novedad grupal');
    }
}

// =============================================
// ABRIR MODAL INDIVIDUAL
// =============================================
function abrirModalIndividual(tipoRango) {
    document.getElementById('formIndividual').reset();
    document.getElementById('fechaFinIndividual').value = '';
    document.getElementById('fechaFinIndividual').required = false;
    
    // Configurar según el tipo de novedad
    if (tipoRango === 'RANGO') {
        document.getElementById('modalIndividualTitle').innerHTML = 
            '<i class="fas fa-calendar-range"></i> Novedad por Rango de Fechas';
        document.getElementById('divFechaFin').style.display = 'block';
        document.getElementById('fechaFinIndividual').required = true;
        // Preseleccionar tipos con rango
        document.getElementById('tipoIndividual').value = 'PERMISO';
    } else {
        document.getElementById('modalIndividualTitle').innerHTML = 
            '<i class="fas fa-user"></i> Novedad de 1 Día';
        document.getElementById('divFechaFin').style.display = 'none';
        document.getElementById('fechaFinIndividual').required = false;
        document.getElementById('tipoIndividual').value = 'CUMPLEAÑOS';
    }
    
    document.getElementById('fechaInicioIndividual').value = new Date().toISOString().split('T')[0];
    document.getElementById('descripcionIndividual').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('modalIndividual'));
    modal.show();
}

// =============================================
// GUARDAR NOVEDAD INDIVIDUAL
// =============================================
async function guardarIndividual() {
    const colaboradorId = document.getElementById('colaboradorIndividual').value;
    const tipo = document.getElementById('tipoIndividual').value;
    const fechaInicio = document.getElementById('fechaInicioIndividual').value;
    const fechaFin = document.getElementById('fechaFinIndividual').value;
    const descripcion = document.getElementById('descripcionIndividual').value.trim();

    if (!colaboradorId) {
        alert('Por favor, seleccione un colaborador');
        return;
    }

    if (!fechaInicio) {
        alert('Por favor, seleccione la fecha de inicio');
        return;
    }

    // Validar que los tipos con rango tengan fecha fin
    const tiposConRango = ['PERMISO', 'PERMISO_MEDICO', 'CALAMIDAD', 'INCAPACIDAD'];
    if (tiposConRango.includes(tipo) && !fechaFin) {
        alert('Este tipo de novedad requiere una fecha de fin');
        return;
    }

    // Validar que fecha fin no sea menor que fecha inicio
    if (fechaFin && fechaFin < fechaInicio) {
        alert('La fecha de fin no puede ser menor que la fecha de inicio');
        return;
    }

    let url = '';
    const endpoint = {
        'PERMISO': '/permiso',
        'PERMISO_MEDICO': '/permiso-medico',
        'CUMPLEAÑOS': '/cumpleanos',
        'CALAMIDAD': '/calamidad',
        'INCAPACIDAD': '/incapacidad'
    }[tipo];

    if (tiposConRango.includes(tipo)) {
        // Novedades con rango de fechas
        url = `${API_NOVEDADES}${endpoint}?colaboradorId=${colaboradorId}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
        if (descripcion) url += `&descripcion=${encodeURIComponent(descripcion)}`;
    } else {
        // Novedades de un solo día (CUMPLEAÑOS)
        url = `${API_NOVEDADES}${endpoint}?colaboradorId=${colaboradorId}&fecha=${fechaInicio}`;
        if (descripcion) url += `&descripcion=${encodeURIComponent(descripcion)}`;
    }

    try {
        const response = await fetch(url, { method: 'POST' });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }
        
        bootstrap.Modal.getInstance(document.getElementById('modalIndividual')).hide();
        cargarNovedades();
        alert('✅ Novedad individual creada correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al crear novedad individual');
    }
}

// =============================================
// ELIMINAR NOVEDAD
// =============================================
async function eliminarNovedad(id) {
    if (!confirm('¿Eliminar esta novedad?')) return;

    try {
        const response = await fetch(`${API_NOVEDADES}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar novedad');
        
        cargarNovedades();
        alert('✅ Novedad eliminada correctamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar novedad');
    }
}