document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.getElementById('theme-checkbox');
    
    // Evento para cambiar el tema
checkbox.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark'); // Guardar el tema en el localStorage
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light'); // Guardar el tema en el localStorage
        }
    });
    
    // Obtener el tema guardado en el localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        if(savedTheme === 'dark') {
            checkbox.checked = true; // Marcar el checkbox si el tema guardado es oscuro
        }
    } else {
        // Si no hay tema guardado, establecer el tema oscuro por defecto
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark'); // Guardar el tema en el localStorage
        checkbox.checked = true; // Marcar el checkbox como seleccionado
    }
});
