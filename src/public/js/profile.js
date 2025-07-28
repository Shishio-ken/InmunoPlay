// public/js/profile.js
document.addEventListener('DOMContentLoaded', () => {
  // ———— Edición de perfil ————
  const modal         = document.getElementById('editProfileModal');
  const openBtn       = document.getElementById('editProfileBtn');
  const closeBtn      = document.getElementById('cancelEditBtn');
  const form          = document.getElementById('editProfileForm');
  const avatarImg     = document.getElementById('userAvatar');
  const avatarInput   = document.getElementById('avatarInput');
  const avatarPreview = document.getElementById('avatarPreview');
  const msgModal      = document.getElementById('messageModal');
  const msgText       = document.getElementById('messageText');
  const msgCloseBtn   = document.getElementById('messageCloseBtn');

  openBtn.onclick  = () => modal.classList.add('active');
  closeBtn.onclick = () => modal.classList.remove('active');

  avatarInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => avatarPreview.src = ev.target.result;
    reader.readAsDataURL(file);
  };

  function showMessage(text, isError = false) {
    msgText.textContent = text;
    msgText.classList.toggle('error', isError);
    msgModal.classList.add('active');
  }
  msgCloseBtn.onclick = () => msgModal.classList.remove('active');

  form.onsubmit = async e => {
    e.preventDefault();
    // validar campos obligatorios
    for (let name of ['username','correo','nombre','apellido']) {
      const input = form.elements[name];
      if (!input.value.trim()) {
        const label = input.closest('.modal-row').querySelector('label').textContent;
        return showMessage(`El campo "${label}" es obligatorio.`, true);
      }
    }
    // validar contraseña
    const pwd     = form.elements['contraseña'].value;
    const confirm = form.elements['confirmar'].value;
    if (pwd && pwd !== confirm) {
      return showMessage('Las contraseñas no coinciden.', true);
    }

    // enviar datos
    const formData = new FormData(form);
    const res      = await fetch('/profile/edit', { method: 'POST', body: formData });
    const data     = await res.json();

    if (data.success) {
      if (data.avatar) avatarImg.src = data.avatar + '?t=' + Date.now();
      showMessage('¡Perfil actualizado correctamente!');
      setTimeout(() => {
        msgModal.classList.remove('active');
        modal.classList.remove('active');
        window.location.reload();
      }, 1200);
    } else {
      showMessage(data.message || 'Error al actualizar perfil.', true);
    }
  };

  // ———— Controles de tema y acento ————
  const root   = document.documentElement;
  const toggle = document.getElementById('darkModeToggle');
  const picker = document.getElementById('accentPicker');

  if (toggle && picker) {
    // valores por defecto / guardados
    const defaultAccent = getComputedStyle(root).getPropertyValue('--accent').trim();
    const storedTheme   = localStorage.getItem('theme')  || 'light';
    const storedAccent  = localStorage.getItem('accent') || defaultAccent;

    // aplica tema
    root.setAttribute('data-theme', storedTheme);
    toggle.checked = (storedTheme === 'dark');

    // aplica acento
    root.style.setProperty('--accent', storedAccent);
    picker.value = rgbToHex(storedAccent);

    // escucha toggle
    toggle.addEventListener('change', () => {
      const theme = toggle.checked ? 'dark' : 'light';
      root.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    });

    // escucha selector de color
    picker.addEventListener('input', () => {
      root.style.setProperty('--accent', picker.value);
      localStorage.setItem('accent', picker.value);
    });
  }

  // helper: convierte "rgb(...)" a "#rrggbb"
  function rgbToHex(rgb) {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = rgb;
    return ctx.fillStyle;
  }
});
