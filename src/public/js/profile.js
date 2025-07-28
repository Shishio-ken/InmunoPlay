document.addEventListener('DOMContentLoaded', () => {
  // --- Modal edición ---
  const modal = document.getElementById('editProfileModal');
  const openBtn = document.getElementById('editProfileBtn');
  const closeBtn = document.getElementById('cancelEditBtn');
  const form = document.getElementById('editProfileForm');

  const msgModal = document.getElementById('messageModal');
  const msgText = document.getElementById('messageText');
  const msgCloseBtn = document.getElementById('messageCloseBtn');

  openBtn.onclick = () => modal.classList.add('active');
  closeBtn.onclick = () => modal.classList.remove('active');
  msgCloseBtn.onclick = () => msgModal.classList.remove('active');

  function showMessage(text, isError = false) {
    msgText.textContent = text;
    msgText.classList.toggle('error', isError);
    msgModal.classList.add('active');
  }

  // --- Password strength ---
  const pwdEdit = document.getElementById('contraseña');
  const confirmEdit = document.getElementById('confirmar');
  const strengthBarEdit = document.getElementById('strength-bar-edit');
  const strengthTextEdit = document.getElementById('strength-text-edit');

  function evaluarFortaleza(pass) {
    let score = 0;
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[\W_]/.test(pass)) score++;
    if (pass.length >= 8) score++;

    if (score <= 2) return 'weak';
    else if (score <= 4) return 'medium';
    else return 'strong';
  }

  pwdEdit.addEventListener('input', () => {
    const val = pwdEdit.value;
    const nivel = evaluarFortaleza(val);
    strengthBarEdit.className = `strength-bar ${nivel}`;
    if (nivel === 'weak') {
      strengthTextEdit.innerText = 'Contraseña débil';
      strengthTextEdit.style.color = '#e74c3c';
    } else if (nivel === 'medium') {
      strengthTextEdit.innerText = 'Contraseña media';
      strengthTextEdit.style.color = '#f39c12';
    } else {
      strengthTextEdit.innerText = 'Contraseña segura';
      strengthTextEdit.style.color = '#27ae60';
    }
  });

  // --- Envío del formulario ---
  form.onsubmit = async e => {
    e.preventDefault();

    // validar campos obligatorios
    for (let name of ['username', 'correo', 'nombre', 'apellido']) {
      const input = form.elements[name];
      if (!input.value.trim()) {
        const label = input.closest('.modal-row').querySelector('label').textContent;
        return showMessage(`El campo "${label}" es obligatorio.`, true);
      }
    }

    // validar contraseña si hay cambios
    const pass = pwdEdit.value;
    const confirm = confirmEdit.value;
    const nivel = evaluarFortaleza(pass);

    if (pass) {
      if (pass !== confirm) {
        return showMessage('Las contraseñas no coinciden.', true);
      }
      if (nivel !== 'strong') {
        return showMessage('Tu contraseña debe ser segura para poder actualizarla.', true);
      }
    }

    // enviar datos
    const formData = new FormData(form);
    const res = await fetch('/profile/edit', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
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

  // --- Tema y acento ---
  const root = document.documentElement;
  const toggle = document.getElementById('darkModeToggle');
  const picker = document.getElementById('accentPicker');
  const resetBtn = document.getElementById('resetColorsBtn');

  if (toggle && picker) {
    const defaultAccent = getComputedStyle(root).getPropertyValue('--accent').trim();
    const storedTheme = localStorage.getItem('theme') || 'light';
    const storedAccent = localStorage.getItem('accent') || defaultAccent;

    root.setAttribute('data-theme', storedTheme);
    toggle.checked = (storedTheme === 'dark');
    root.style.setProperty('--accent', storedAccent);
    picker.value = rgbToHex(storedAccent);

    toggle.addEventListener('change', () => {
      const theme = toggle.checked ? 'dark' : 'light';
      root.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    });

    picker.addEventListener('input', () => {
      root.style.setProperty('--accent', picker.value);
      localStorage.setItem('accent', picker.value);
    });

    resetBtn.addEventListener('click', () => {
      root.setAttribute('data-theme', 'light');
      root.style.setProperty('--accent', defaultAccent);
      picker.value = rgbToHex(defaultAccent);
      toggle.checked = false;
      localStorage.removeItem('theme');
      localStorage.removeItem('accent');
    });
  }

  function rgbToHex(rgb) {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = rgb;
    return ctx.fillStyle;
  }
});
