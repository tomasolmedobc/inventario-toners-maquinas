document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebarMenu');
    const toggleBtn = document.getElementById('toggleSidebar');
  
    if (!sidebar || !toggleBtn) return;
  
    // Restaurar estado
    if (localStorage.getItem('sidebar') === 'collapsed') {
      sidebar.classList.remove('show');
    }
  
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
  
      localStorage.setItem(
        'sidebar',
        sidebar.classList.contains('show') ? 'expanded' : 'collapsed'
      );
    });
  });
  