// =============================================
// CONFIGURACIÓN DE LA API
// =============================================
const API_COLABORADORES = 'http://localhost:8080/api/colaboradores';
const API_CALCULO = 'http://localhost:8080/api/calculo';

// =============================================
// VARIABLES GLOBALES
// =============================================
let reporteData = [];

// =============================================
// INICIALIZAR
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Cargar semana actual
    cargarSemanaActual();
});

// =============================================
// CARGAR SEMANA ACTUAL
// =============================================
function cargarSemanaActual() {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
    
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    
    document.getElementById('fechaInicio').value = lunes.toISOString().split('T')[0];
    document.getElementById('fechaFin').value = domingo.toISOString().split('T')[0];
    
    cargarReporte();
}

// =============================================
// CARGAR REPORTE
// =============================================
async function cargarReporte() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;

    if (!fechaInicio || !fechaFin) {
        alert('Por favor, seleccione ambas fechas');
        return;
    }

    try {
        // 1. Obtener colaboradores activos
        const responseCol = await fetch(API_COLABORADORES + '/activos');
        if (!responseCol.ok) throw new Error('Error al cargar colaboradores');
        const colaboradores = await responseCol.json();

        if (colaboradores.length === 0) {
            document.getElementById('cuerpoTabla').innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        <i class="fas fa-info-circle"></i> No hay colaboradores activos
                    </td>
                </tr>
            `;
            document.getElementById('resumenCards').style.display = 'none';
            return;
        }

        // 2. Calcular horas extras para cada colaborador
        reporteData = [];
        let totalExtras = 0;
        let colaboradoresConExtras = 0;

        for (const col of colaboradores) {
            const url = `${API_CALCULO}/colaborador/${col.id}/semana?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
            const responseCalc = await fetch(url);
            
            if (responseCalc.ok) {
                const resultado = await responseCalc.json();
                
                const saldoRealMinutos = resultado.saldoRealMinutos || 0;
                const horasExtrasMinutos = resultado.horasExtrasMinutos || 0;
                const minutosTrabajados = resultado.minutosTrabajados || 0;
                
                const horasExtrasHoras = parseFloat(resultado.horasExtrasHoras.replace(',', '.')) || 0;
                
                reporteData.push({
                    colaborador: col,
                    minutosTrabajados: minutosTrabajados,
                    minutosTrabajadosHoras: resultado.minutosTrabajadosHoras || '0.00',
                    horasTeoricasMinutos: resultado.horasTeoricasMinutos || (col.horasSemanales * 60),
                    saldoRealMinutos: saldoRealMinutos,
                    saldoRealHoras: resultado.saldoRealHoras || '0.00',
                    horasExtrasMinutos: horasExtrasMinutos,
                    horasExtrasHoras: horasExtrasHoras
                });
                
                if (horasExtrasMinutos > 0) {
                    totalExtras += horasExtrasHoras;
                    colaboradoresConExtras++;
                }
            }
        }

        // 3. Renderizar tabla
        renderizarTabla(reporteData);
        
        // 4. Actualizar resumen
        const promedio = reporteData.length > 0 ? totalExtras / reporteData.length : 0;
        document.getElementById('totalColaboradores').textContent = reporteData.length;
        document.getElementById('totalConExtras').textContent = colaboradoresConExtras;
        document.getElementById('totalHorasExtras').textContent = totalExtras.toFixed(2);
        document.getElementById('promedioHorasExtras').textContent = promedio.toFixed(2);
        document.getElementById('resumenCards').style.display = 'flex';
        document.getElementById('rangoFechas').textContent = `${fechaInicio} al ${fechaFin}`;

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('cuerpoTabla').innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle"></i> Error al cargar reporte: ${error.message}
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
                    <i class="fas fa-info-circle"></i> No hay datos para mostrar
                </td>
            </tr>
        `;
        return;
    }

    // Ordenar por saldo real (de mayor a menor)
    lista.sort((a, b) => b.saldoRealMinutos - a.saldoRealMinutos);

    let html = '';
    lista.forEach((item, index) => {
        const col = item.colaborador;
        const saldoReal = item.saldoRealMinutos;
        
        // Determinar color y texto para el saldo
        let saldoClase = '';
        let saldoTexto = '';
        if (saldoReal > 0) {
            saldoClase = 'text-success';
            saldoTexto = `+${item.saldoRealHoras}h`;
        } else if (saldoReal === 0) {
            saldoClase = 'text-secondary';
            saldoTexto = '0.00h';
        } else {
            saldoClase = 'text-danger';
            saldoTexto = `${item.saldoRealHoras}h`;
        }

        // Horas extras (ya aplica la regla de negocio)
        let extrasClase = item.horasExtrasMinutos > 0 ? 'text-success fw-bold' : 'text-secondary';
        let extrasTexto = item.horasExtrasMinutos > 0 ? `+${item.horasExtrasHoras.toFixed(2)}h` : '0h';

        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${col.codigoVentas}</strong></td>
                <td>${col.nombreCompleto}</td>
                <td>${col.sucursal}</td>
                <td><span class="badge bg-info">${col.horario === 'LUNES_VIERNES' ? 'L-V' : 'L-S'}</span></td>
                <td>${col.horasSemanales}h</td>
                <td>${item.minutosTrabajadosHoras}h</td>
                <td class="${saldoClase}">${saldoTexto}</td>
                <td class="${extrasClase}">${extrasTexto}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// =============================================
// EXPORTAR A EXCEL (CSV)
// =============================================
function exportarExcel() {
    if (reporteData.length === 0) {
        alert('No hay datos para exportar. Genera un reporte primero.');
        return;
    }

    let csv = 'Código,Nombre,Sucursal,Horario,Horas Semanales,Horas Trabajadas,Saldo Real,Horas Extras\n';
    
    reporteData.forEach(item => {
        const col = item.colaborador;
        const horario = col.horario === 'LUNES_VIERNES' ? 'L-V' : 'L-S';
        const horasTrabajadas = item.minutosTrabajadosHoras || '0.00';
        const saldoReal = item.saldoRealHoras || '0.00';
        const horasExtras = item.horasExtrasHoras.toFixed(2);
        
        csv += `${col.codigoVentas},${col.nombreCompleto},${col.sucursal},${horario},${col.horasSemanales},${horasTrabajadas},${saldoReal},${horasExtras}\n`;
    });

    // Agregar totales al final
    const totalExtras = reporteData.reduce((sum, item) => sum + item.horasExtrasHoras, 0);
    const totalTrabajadas = reporteData.reduce((sum, item) => sum + (parseFloat(item.minutosTrabajadosHoras) || 0), 0);
    csv += `\nTOTALES,,,${reporteData.length} colaboradores,${totalTrabajadas.toFixed(2)}h,${totalExtras.toFixed(2)}h\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    link.download = `Reporte_HorasExtras_${fechaInicio}_${fechaFin}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}