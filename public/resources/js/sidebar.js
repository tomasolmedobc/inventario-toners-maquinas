document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebarMenu');
  const toggleBtn = document.getElementById('toggleSidebar');

  if (!sidebar || !toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    if (window.innerWidth >= 992) {
      // Desktop → achicar
      sidebar.classList.toggle('collapsed');
    } else {
      // Mobile → mostrar / ocultar
      sidebar.classList.toggle('open');
    }
  });
});
