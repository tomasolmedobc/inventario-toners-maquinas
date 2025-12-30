document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    const navLinks = document.querySelectorAll('#sidebar .nav-link');
    const currentPath = window.location.pathname;
  
    /* ======================
       Link activo
    ====================== */
    navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  
    /* ======================
       Restaurar estado
    ====================== */
    if (localStorage.getItem('sidebar') === 'collapsed') {
      sidebar.classList.add('collapsed');
    }
  
    /* ======================
       Toggle sidebar
    ====================== */
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
  
      localStorage.setItem(
        'sidebar',
        sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded'
      );
    });
  });
  