document.addEventListener('DOMContentLoaded', () => {
    const filtro = document.getElementById('filtro');
    const graficoCanvas = document.getElementById('graficoToners');
    let grafico;
  
    const cargarGrafico = async (rango = '30') => {
      try {
        const res = await fetch(`/api/grafico-toners?rango=${rango}`);
        const json = await res.json();
        const { labels, datasets } = json;
  
        if (grafico) grafico.destroy();
  
        grafico = new Chart(graficoCanvas, {
          type: 'bar',
          data: {
            labels,
            datasets
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Consumo de Tóners por Mes y Área'
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const area = context.dataset.label || 'Área';
                    const cantidad = context.parsed.y;
                    const mes = context.label;
                    return `${area}: ${cantidad} tóners en ${mes}`;
                  }
                }
              },
              legend: {
                position: 'top'
              }
            },
            scales: {
              x: {
                stacked: true,
                title: {
                  display: true,
                  text: 'Mes'
                }
              },
              y: {
                stacked: true,
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Cantidad de tóners entregados'
                }
              }
            }
          }
        });
      } catch (err) {
        console.error('Error al cargar gráfico:', err);
      }
    };
  
    cargarGrafico();
  
    filtro.addEventListener('change', () => {
      const rangoSeleccionado = filtro.value;
      cargarGrafico(rangoSeleccionado);
    });
  });
  