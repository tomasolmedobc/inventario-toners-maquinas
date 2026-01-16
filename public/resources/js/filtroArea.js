    function editar(id, nombre) {
        const nuevo = prompt('Editar área', nombre);
        if (!nuevo) return;
    
        fetch(`/dashboard/areas/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevo })
        }).then(() => location.reload());
    }
    function normalizar(areaVieja, index) {
        const input = document.getElementById(`area-${index}`);
        const nueva = input.value.trim();
        
            if (!nueva) {
            alert('Ingresá el área correcta');
            return;
            }
        
            fetch('/dashboard/areas/normalizar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                areaVieja,
                areaNueva: nueva
            })
            })
            .then(res => res.json())
            .then(() => location.reload());
        }
        