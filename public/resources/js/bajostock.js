document.addEventListener("DOMContentLoaded", async () => {
    const tablaBody = document.querySelector("#tablaBajoStock tbody");
    const mensajeSinDatos = document.getElementById("mensajeSinDatos");
  
    try {
      const res = await fetch("/api/toners-bajo-stock");
      const data = await res.json();
  
      if (data.length === 0) {
        mensajeSinDatos.style.display = "block";
        return;
      }
  
      data.forEach(prod => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${prod.marca || "-"}</td>
        <td>${prod.modelo || "-"}</td>
        
        <td>
          <button class="btn btn-sm btn-info btn-detalle"
            data-compat='${JSON.stringify(prod.compatibilidad || [])}'>
            Ver
          </button>
        </td>
        <td class="text-danger fw-bold">${prod.cantidad}</td>
      `;
      
        tablaBody.appendChild(tr);
      });
    } catch (error) {
      console.error("Error al cargar tóners con bajo stock:", error);
    }
  
  
    document.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-detalle')) return;
    
      const compat = JSON.parse(e.target.dataset.compat || '[]');
      const lista = document.getElementById('listaCompatibilidad');
      lista.innerHTML = '';
    
      if (!compat.length) {
        lista.innerHTML = '<li class="list-group-item">Sin compatibilidad registrada</li>';
      } else {
        compat.forEach(c => {
          const li = document.createElement('li');
          li.className = 'list-group-item';
          li.textContent = c;
          lista.appendChild(li);
        });
      }
    
      new bootstrap.Modal(document.getElementById('modalDetalleToner')).show();
    });
    
  });
  