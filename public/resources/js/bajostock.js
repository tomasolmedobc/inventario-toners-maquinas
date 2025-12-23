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
          <td class="text-danger fw-bold">${prod.cantidad}</td>
        `;
        tablaBody.appendChild(tr);
      });
    } catch (error) {
      console.error("Error al cargar tóners con bajo stock:", error);
    }
  });
  