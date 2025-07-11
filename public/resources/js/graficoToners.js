/*
document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('graficoTonersPorArea').getContext('2d');
  const filtroSelect = document.getElementById('filtroRango');
  const tablaTop = document.querySelector('#tablaTopAreas tbody');

  let graficoToners;

  async function cargarGrafico(rango = '30') {
    try {
      const res = await fetch(`/api/grafico-toners?rango=${rango}`);
      const data = await res.json();

      if (!res.ok || !data || !data.labels || !data.datasets) {
        console.warn('No se encontraron datos válidos para el gráfico');
        return;
      }

      // Destruir gráfico previo si existe
      if (graficoToners) graficoToners.destroy();

      // Crear gráfico de barras apiladas
      graficoToners = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: data.datasets
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Consumo de tóners por área'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            },
            legend: {
              position: 'top'
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          scales: {
            x: {
              stacked: true
            },
            y: {
              stacked: true,
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad de tóners'
              }
            }
          }
        }
      });

      // Actualizar tabla con Top 5 áreas
      actualizarTablaTop5(data.datasets);
    } catch (error) {
      console.error('Error al cargar gráfico de tóners:', error);
    }
  }

  function actualizarTablaTop5(datasets) {
    // Limpiar tabla
    tablaTop.innerHTML = '';

    // Calcular totales por área
    const topData = datasets
      .map(ds => ({
        area: ds.label,
        total: ds.data.reduce((sum, val) => sum + val, 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Insertar filas
    topData.forEach(({ area, total }) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `<td>${area}</td><td>${total}</td>`;
      tablaTop.appendChild(fila);
    });
  }

  // Cargar gráfico y tabla al inicio
  cargarGrafico();

  // Cargar al cambiar el filtro
  filtroSelect.addEventListener('change', (e) => {
    cargarGrafico(e.target.value);
  });
});
*/

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('graficoTonersPorArea');
  const ctx = canvas.getContext('2d');
  const filtroSelect = document.getElementById('filtroRango');
  const tablaTop = document.querySelector('#tablaTopAreas tbody');

  let graficoToners;

  async function cargarGrafico(rango = '30') {
    try {
      const res = await fetch(`/api/grafico-toners?rango=${rango}`);
      const data = await res.json();

      if (!res.ok || !data || !data.labels || !data.datasets) {
        console.warn('No se encontraron datos válidos para el gráfico');
        return;
      }

      // Destruir gráfico previo si existe
      if (graficoToners) graficoToners.destroy();

      // Crear gráfico de barras apiladas
      graficoToners = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: data.datasets.map(ds => ({
            ...ds,
            barThickness: 30  // Puedes ajustar este valor a gusto
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // permite ajustar el alto con CSS
          plugins: {
            title: {
              display: true,
              text: 'Consumo de tóners por área'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            },
            legend: {
              position: 'top'
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          scales: {
            x: {
              stacked: true,
              categoryPercentage: 0.7, // barras más delgadas
              barPercentage: 0.8
            },
            y: {
              stacked: true,
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad de tóners'
              }
            }
          }
        }
      });

      // Actualizar tabla con Top 5 áreas
      actualizarTablaTop5(data.datasets);
    } catch (error) {
      console.error('Error al cargar gráfico de tóners:', error);
    }
  }

  function actualizarTablaTop5(datasets) {
    tablaTop.innerHTML = '';

    const topData = datasets
      .map(ds => ({
        area: ds.label,
        total: ds.data.reduce((sum, val) => sum + val, 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    topData.forEach(({ area, total }) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `<td>${area}</td><td>${total}</td>`;
      tablaTop.appendChild(fila);
    });
  }

  // Cargar gráfico al iniciar
  cargarGrafico();

  // Cargar al cambiar filtro
  filtroSelect.addEventListener('change', (e) => {
    cargarGrafico(e.target.value);
  });
});
