// public/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
  // —— Elementos del mensaje genérico ——
  const msgModal    = document.getElementById('messageModal');
  const msgText     = document.getElementById('messageText');
  const msgCloseBtn = document.getElementById('messageCloseBtn');

  function showMessage(text, isError = false) {
    msgText.textContent = text;
    msgText.classList.toggle('error', isError);
    msgModal.classList.add('active');
  }
  msgCloseBtn.addEventListener('click', () => msgModal.classList.remove('active'));

  // —— Toggle campo clave admin (Signup) ——
  const isAdminChk    = document.getElementById('isAdmin');
  const adminKeyField = document.getElementById('adminKeyField');
  if (isAdminChk && adminKeyField) {
    isAdminChk.addEventListener('change', () => {
      adminKeyField.style.display = isAdminChk.checked ? 'block' : 'none';
    });
  }

  // —— LOGIN ——  
  const loginForm = document.querySelector('.login-box form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const user = loginForm.username.value.trim();
      const pwd  = loginForm.contraseña.value.trim();

      if (!user) {
        showMessage('El nombre de usuario es obligatorio.', true);
        return;
      }
      if (!pwd) {
        showMessage('La contraseña es obligatoria.', true);
        return;
      }
      // Si pasa validación, enviamos el form
      loginForm.submit();
    });
  }

  // —— SIGNUP ——  
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    // Validación al enviar
    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      // 1) Compruebo campos no vacíos
      const campos = [
        { name: 'username', label: 'Nombre de usuario' },
        { name: 'nombre',   label: 'Nombre' },
        { name: 'apellido', label: 'Apellido' },
        { name: 'correo',   label: 'Correo electrónico' },
        { name: 'contraseña', label: 'Contraseña' },
        { name: 'confirmar',  label: 'Confirmar contraseña' }
      ];
      for (let {name,label} of campos) {
        const val = signupForm.elements[name].value.trim();
        if (!val) {
          showMessage(`El campo "${label}" es obligatorio.`, true);
          return;
        }
      }
      // 2) Contraseñas coincidan
      const pwd     = signupForm.elements['contraseña'].value;
      const confirm = signupForm.elements['confirmar'].value;
      if (pwd !== confirm) {
        showMessage('Las contraseñas no coinciden.', true);
        return;
      }
      // 3) Si es admin, clave obligatoria
      if (isAdminChk?.checked) {
        const key = signupForm.elements['adminKey'].value.trim();
        if (!key) {
          showMessage('Debes ingresar la clave de administrador.', true);
          return;
        }
      }
      // Si todo ok → envío
      signupForm.submit();
    });

    // —— Medidor de fuerza de contraseña ——
    const pwdInput     = signupForm.querySelector('#contraseña');
    const strengthBar  = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    if (pwdInput && strengthBar && strengthText) {
      pwdInput.addEventListener('input', () => {
        const val = pwdInput.value;
        let score = 0;
        if (val.length >= 8)    score++;
        if (/[A-Z]/.test(val))   score++;
        if (/[0-9]/.test(val))   score++;
        if (/[\W]/.test(val))    score++;
        // Reset clases
        strengthBar.className = 'strength-bar';
        if (score <= 1) {
          strengthBar.classList.add('weak');
          strengthText.textContent = 'Muy débil';
        } else if (score <= 3) {
          strengthBar.classList.add('medium');
          strengthText.textContent = 'Media';
        } else {
          strengthBar.classList.add('strong');
          strengthText.textContent = 'Fuerte';
        }
      });
    }
  }
});
