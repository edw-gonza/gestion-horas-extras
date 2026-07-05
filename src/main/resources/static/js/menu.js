// =============================================
// CARGA DEL MENÚ EN TODAS LAS PÁGINAS
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    // Cargar el menú desde el archivo externo
    fetch('/pages/menu.html')
        .then(response => response.text())
        .then(html => {
            // Insertar el menú al inicio del body
            document.body.insertAdjacentHTML('afterbegin', html);
            
            // Ejecutar la función de marcado después de cargar el menú
            if (typeof marcarMenuActivo === 'function') {
                marcarMenuActivo();
            }
        })
        .catch(error => {
            console.error('Error al cargar el menú:', error);
        });
});