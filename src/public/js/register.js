
  const contraseñaInput = document.getElementById('contraseña');
  const confirmarInput = document.getElementById('confirmar');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  const form = document.getElementById('signupForm');

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

  contraseñaInput.addEventListener('input', () => {
    const val = contraseñaInput.value;
    const nivel = evaluarFortaleza(val);
    strengthBar.className = `strength-bar ${nivel}`;
    if (nivel === 'weak') {
      strengthText.innerText = 'Contraseña débil';
      strengthText.style.color = '#e74c3c';
    } else if (nivel === 'medium') {
      strengthText.innerText = 'Contraseña media';
      strengthText.style.color = '#f39c12';
    } else {
      strengthText.innerText = 'Contraseña segura';
      strengthText.style.color = '#27ae60';
    }
  });

  form.addEventListener('submit', function (e) {
    const pass = contraseñaInput.value;
    const confirm = confirmarInput.value;
    const nivel = evaluarFortaleza(pass);
    if (pass !== confirm) {
      e.preventDefault();
      alert('Las contraseñas no coinciden');
    } else if (nivel !== 'strong') {
      e.preventDefault();
      alert('Tu contraseña debe ser segura para poder registrarte.');
    }
  });
