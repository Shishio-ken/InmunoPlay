document.addEventListener('DOMContentLoaded', () => {
  const root   = document.documentElement;
  const toggle = document.getElementById('darkModeToggle');
  const picker = document.getElementById('accentPicker');
  const reset  = document.getElementById('resetColorsBtn');

  const defaultAccent = '#7a5fa2'; // tu morado por defecto
  const defaultTheme  = 'light';

  // 1) carga inicial
  const storedTheme  = localStorage.getItem('theme')  || defaultTheme;
  const storedAccent = localStorage.getItem('accent') || getComputedStyle(root).getPropertyValue('--accent').trim();

  root.setAttribute('data-theme', storedTheme);
  root.style.setProperty('--accent', storedAccent);

  // sincroniza UI
  toggle.checked = storedTheme === 'dark';
  // convierte rgb → hex si es necesario, o simplemente:
  picker.value   = storedAccent;

  // 2) listeners normales
  toggle.addEventListener('change', () => {
    const theme = toggle.checked ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  });

  picker.addEventListener('input', () => {
    root.style.setProperty('--accent', picker.value);
    localStorage.setItem('accent', picker.value);
  });

  // 3) listener RESET
  reset.addEventListener('click', () => {
    // restablece variables
    root.setAttribute('data-theme', defaultTheme);
    root.style.setProperty('--accent', defaultAccent);

    // actualiza UI
    toggle.checked = false;
    picker.value   = defaultAccent;

    // limpia almacenamiento
    localStorage.removeItem('theme');
    localStorage.removeItem('accent');
  });
});
