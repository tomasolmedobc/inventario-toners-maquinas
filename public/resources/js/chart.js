document.addEventListener('DOMContentLoaded', () => {
    const data = window.graficoData;
  
    if (!data || Object.keys(data).length === 0) return;
  
    const labels = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
  
    const datasets = Object.entries(data).map(([area, cantidades], index) => ({
      label: area,
      data: cantidades,
      backgroundColor: getColor(index),
    }));
  
    const ctx = document.getElementById('graficoToners').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Consumo mensual de tóners por área'
          }
        }
      }
    });
  });
  
  function getColor(index) {
    const colores = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)'
    ];
    return colores[index % colores.length];
  }
  