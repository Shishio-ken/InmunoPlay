document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const btn    = document.getElementById('navToggle');
    const links  = document.querySelectorAll('.nav-links a');

    btn.addEventListener('click', () => {
      header.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });

    // Al hacer clic en cualquier enlace, cerramos el panel
    links.forEach(a =>
      a.addEventListener('click', () => {
        header.classList.remove('open');
        document.body.classList.remove('menu-open');
      })
    );
  });