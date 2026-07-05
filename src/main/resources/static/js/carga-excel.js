// =============================================
// CONFIGURACIÓN DE LA API
// =============================================
const API_COLABORADORES = 'http://localhost:8080/api/colaboradores';

// =============================================
// VARIABLES GLOBALES
// =============================================
let datosCargados = [];

// =============================================
// INICIALIZAR
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            procesarArchivo({ target: { files: files } });
        }
    });
});

// =============================================
// DESCARGAR PLANTILLA
// =============================================
function descargarPlantilla() {
    // Crear un libro de Excel con una hoja
    const wb = XLSX.utils.book_new();
    
    // Datos de ejemplo para la plantilla
    const datos = [
        ['codigoVentas', 'nombreCompleto', 'correo', 'fechaNacimiento', 'rol', 'horasSemanales', 'horario', 'horaEntradaEstandar', 'horaSalidaEstandar', 'sucursal', 'activo'],
        ['V001', 'Ana Maria Perez', 'ana.perez@bancolombia.com', '1990-05-15', 'ASESORIA', 42, 'LUNES_VIERNES', '08:00', '17:00', 'Principal', 'true'],
        ['V002', 'Carlos Rodriguez', 'carlos.rodriguez@bancolombia.com', '1985-11-20', 'SERVICIO', 48, 'LUNES_SABADO', '07:00', '16:00', 'Principal', 'true'],
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(datos);
    
    // Ajustar ancho de columnas
    ws['!cols'] = [
        { wch: 15 }, // codigoVentas
        { wch: 25 }, // nombreCompleto
        { wch: 30 }, // correo
        { wch: 15 }, // fechaNacimiento
        { wch: 10 }, // rol
        { wch: 15 }, // horasSemanales
        { wch: 15 }, // horario
        { wch: 15 }, // horaEntradaEstandar
        { wch: 15 }, // horaSalidaEstandar
        { wch: 15 }, // sucursal
        { wch: 10 }, // activo
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Colaboradores');
    
    // Descargar
    XLSX.writeFile(wb, 'Plantilla_Colaboradores.xlsx');
}

// =============================================
// PROCESAR ARCHIVO EXCEL
// =============================================
function procesarArchivo(event) {
    const files = event.target.files;
    if (files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            if (jsonData.length === 0) {
                alert('El archivo está vacío o no tiene el formato correcto');
                return;
            }
            
            // Validar columnas
            const columnasEsperadas = [
                'codigoVentas', 'nombreCompleto', 'correo', 'fechaNacimiento',
                'rol', 'horasSemanales', 'horario', 'horaEntradaEstandar',
                'horaSalidaEstandar', 'sucursal', 'activo'
            ];
            
            const columnasArchivo = Object.keys(jsonData[0]);
            const columnasFaltantes = columnasEsperadas.filter(col => !columnasArchivo.includes(col));
            
            if (columnasFaltantes.length > 0) {
                alert(`❌ Columnas faltantes en el archivo:\n${columnasFaltantes.join(', ')}\n\nUsa la plantilla descargable.`);
                return;
            }
            
            // Procesar datos
            datosCargados = jsonData.map((row, index) => {
                return {
                    fila: index + 2, // +2 por el encabezado
                    codigoVentas: String(row.codigoVentas || '').trim(),
                    nombreCompleto: String(row.nombreCompleto || '').trim(),
                    correo: String(row.correo || '').trim(),
                    fechaNacimiento: String(row.fechaNacimiento || '').trim(),
                    rol: String(row.rol || '').trim(),
                    horasSemanales: parseInt(row.horasSemanales) || 0,
                    horario: String(row.horario || '').trim(),
                    horaEntradaEstandar: String(row.horaEntradaEstandar || '').trim(),
                    horaSalidaEstandar: String(row.horaSalidaEstandar || '').trim(),
                    sucursal: String(row.sucursal || '').trim(),
                    activo: String(row.activo || '').trim().toLowerCase() === 'true' || 
                            row.activo === true || 
                            String(row.activo || '').trim() === '1',
                    valido: true,
                    errores: []
                };
            });
            
            // Validar cada registro
            datosCargados = datosCargados.map(item => validarRegistro(item));
            
            // Mostrar vista previa
            mostrarVistaPrevia(datosCargados);
            
            // Mostrar contador
            const total = datosCargados.length;
            const validos = datosCargados.filter(d => d.valido).length;
            document.getElementById('totalRegistros').textContent = `${validos} válidos de ${total}`;
            document.getElementById('vistaPrevia').style.display = 'block';
            
        } catch (error) {
            console.error('Error al leer el archivo:', error);
            alert('❌ Error al leer el archivo. Verifica que sea un Excel válido.');
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// =============================================
// VALIDAR REGISTRO
// =============================================
function validarRegistro(item) {
    const errores = [];
    
    if (!item.codigoVentas) errores.push('Código de ventas requerido');
    if (!item.nombreCompleto) errores.push('Nombre requerido');
    if (!item.correo) errores.push('Correo requerido');
    if (!item.fechaNacimiento) errores.push('Fecha de nacimiento requerida');
    if (!item.rol || !['ASESORIA', 'SERVICIO'].includes(item.rol)) errores.push('Rol debe ser ASESORIA o SERVICIO');
    if (item.horasSemanales < 20 || item.horasSemanales > 60) errores.push('Horas semanales debe ser entre 20 y 60');
    if (!item.horario || !['LUNES_VIERNES', 'LUNES_SABADO'].includes(item.horario)) errores.push('Horario debe ser LUNES_VIERNES o LUNES_SABADO');
    if (!item.horaEntradaEstandar) errores.push('Hora entrada requerida (formato HH:MM)');
    if (!item.horaSalidaEstandar) errores.push('Hora salida requerida (formato HH:MM)');
    if (!item.sucursal) errores.push('Sucursal requerida');
    
    // Validar formato de fecha
    if (item.fechaNacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(item.fechaNacimiento)) {
        errores.push('Fecha de nacimiento debe ser YYYY-MM-DD');
    }
    
    // Validar formato de horas
    if (item.horaEntradaEstandar && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(item.horaEntradaEstandar)) {
        errores.push('Hora entrada debe ser HH:MM');
    }
    if (item.horaSalidaEstandar && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(item.horaSalidaEstandar)) {
        errores.push('Hora salida debe ser HH:MM');
    }
    
    item.errores = errores;
    item.valido = errores.length === 0;
    return item;
}

// =============================================
// MOSTRAR VISTA PREVIA
// =============================================
function mostrarVistaPrevia(datos) {
    const tbody = document.getElementById('cuerpoVistaPrevia');
    
    if (datos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center text-muted py-4">
                    <i class="fas fa-info-circle"></i> No hay datos para mostrar
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    datos.forEach((item, index) => {
        const estadoClase = item.valido ? 'badge-exito' : 'badge-error';
        const estadoTexto = item.valido ? '✅ Válido' : '❌ Error';
        const erroresTexto = item.errores.length > 0 ? item.errores.join('; ') : '';
        
        html += `
            <tr class="${item.valido ? '' : 'table-danger'}">
                <td>${item.fila}</td>
                <td>${item.codigoVentas || '-'}</td>
                <td>${item.nombreCompleto || '-'}</td>
                <td>${item.correo || '-'}</td>
                <td>${item.fechaNacimiento || '-'}</td>
                <td>${item.rol || '-'}</td>
                <td>${item.horasSemanales || '-'}</td>
                <td>${item.horario || '-'}</td>
                <td>${item.horaEntradaEstandar || '-'}</td>
                <td>${item.horaSalidaEstandar || '-'}</td>
                <td>${item.sucursal || '-'}</td>
                <td>
                    <span class="badge ${estadoClase}">${estadoTexto}</span>
                    ${erroresTexto ? `<br><small class="text-danger">${erroresTexto}</small>` : ''}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// =============================================
// CONFIRMAR CARGA - CON MENSAJES CLAROS
// =============================================
async function confirmarCarga() {
    const validos = datosCargados.filter(d => d.valido);
    
    if (validos.length === 0) {
        alert('No hay registros válidos para cargar');
        return;
    }
    
    if (!confirm(`¿Confirmar carga de ${validos.length} colaborador(es)?`)) {
        return;
    }
    
    let exitosos = 0;
    let fallidos = 0;
    let errores = [];
    let duplicados = [];
    
    for (const item of validos) {
        try {
            const colaborador = {
                codigoVentas: item.codigoVentas,
                nombreCompleto: item.nombreCompleto,
                correo: item.correo,
                fechaNacimiento: item.fechaNacimiento,
                rol: item.rol,
                horasSemanales: item.horasSemanales,
                horario: item.horario,
                horaEntradaEstandar: item.horaEntradaEstandar,
                horaSalidaEstandar: item.horaSalidaEstandar,
                sucursal: item.sucursal,
                activo: item.activo
            };
            
            const response = await fetch(API_COLABORADORES, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(colaborador)
            });
            
            const responseText = await response.text();
            
            if (response.ok) {
                exitosos++;
            } else {
                fallidos++;
                // Intentar parsear el error
                let mensajeError = responseText;
                try {
                    const errorJson = JSON.parse(responseText);
                    if (errorJson.message) {
                        mensajeError = errorJson.message;
                    }
                } catch (e) {
                    // Si no es JSON, usar el texto plano
                }
                
                // Identificar errores comunes
                let errorAmigable = mensajeError;
                if (mensajeError.includes('duplicate') || mensajeError.includes('Unique') || mensajeError.includes('already exists')) {
                    errorAmigable = `El código de ventas "${item.codigoVentas}" ya existe en el sistema`;
                    duplicados.push(`Fila ${item.fila}: ${item.codigoVentas} - ${item.nombreCompleto}`);
                } else if (mensajeError.includes('null') || mensajeError.includes('not-null')) {
                    errorAmigable = `Datos incompletos: ${mensajeError}`;
                } else {
                    errorAmigable = mensajeError;
                }
                
                errores.push(`Fila ${item.fila} (${item.codigoVentas}): ${errorAmigable}`);
            }
        } catch (error) {
            fallidos++;
            errores.push(`Fila ${item.fila}: Error de conexión - ${error.message}`);
        }
    }
    
    // Construir mensaje resumen
    let mensaje = `📊 RESULTADO DE LA CARGA:\n\n`;
    mensaje += `✅ Creados correctamente: ${exitosos}\n`;
    mensaje += `❌ Con errores: ${fallidos}\n`;
    
    if (duplicados.length > 0) {
        mensaje += `\n⚠️ COLABORADORES DUPLICADOS:\n`;
        duplicados.forEach(d => mensaje += `   - ${d}\n`);
        mensaje += `\n💡 Sugerencia: Verifica que los códigos de ventas sean únicos.\n`;
    }
    
    if (errores.length > 0) {
        mensaje += `\n❌ DETALLE DE ERRORES:\n`;
        errores.slice(0, 10).forEach(e => mensaje += `   - ${e}\n`);
        if (errores.length > 10) {
            mensaje += `   ... y ${errores.length - 10} errores más\n`;
        }
    }
    
    alert(mensaje);
    
    // Limpiar vista
    limpiarVista();
}

// =============================================
// LIMPIAR VISTA
// =============================================
function limpiarVista() {
    datosCargados = [];
    document.getElementById('vistaPrevia').style.display = 'none';
    document.getElementById('fileInput').value = '';
    document.getElementById('totalRegistros').textContent = '0 registros';
    document.getElementById('cuerpoVistaPrevia').innerHTML = `
        <tr>
            <td colspan="12" class="text-center text-muted py-4">
                <i class="fas fa-info-circle"></i> Sube un archivo para ver la vista previa
            </td>
        </tr>
    `;
}