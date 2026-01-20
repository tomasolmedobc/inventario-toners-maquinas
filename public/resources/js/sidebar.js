document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('toggleSidebar');
  const sidebar = document.getElementById('sidebarMenu');
  const STORAGE_KEY = 'sidebar-collapsed';

  // ===============================
  // CARGA INICIAL (solo desktop)
  // ===============================
  if (window.innerWidth >= 992) {
    const isCollapsed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
    }
  }

  // ===============================
  // TOGGLE
  // ===============================
  btn?.addEventListener('click', (e) => {
    e.stopPropagation();

    if (window.innerWidth < 992) {
      // MOBILE → abrir / cerrar
      sidebar.classList.toggle('open');
    } else {
      // DESKTOP → colapsar
      sidebar.classList.toggle('collapsed');

      // Guardar estado
      localStorage.setItem(
        STORAGE_KEY,
        sidebar.classList.contains('collapsed')
      );
    }
  });

  // ===============================
  // CERRAR TOCANDO FUERA (mobile)
  // ===============================
  document.addEventListener('click', (e) => {
    if (
      window.innerWidth < 992 &&
      sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      !btn.contains(e.target)
    ) {
      sidebar.classList.remove('open');
    }
  });

  // ===============================
  // CAMBIO DE RESOLUCIÓN
  // ===============================
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) {
      sidebar.classList.remove('open');

      // restaurar estado guardado
      const isCollapsed = localStorage.getItem(STORAGE_KEY) === 'true';
      sidebar.classList.toggle('collapsed', isCollapsed);
    } else {
      sidebar.classList.remove('collapsed');
      sidebar.classList.remove('open');
    }
  });
});
