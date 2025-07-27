document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.href = "/logout";
    });
  }
});


  // Cambiar avatar dinámicamente
  const avatarInput = document.getElementById('avatarInput');
  const avatar = document.getElementById('avatar');

  avatarInput.addEventListener('change', function () {
    const file = avatarInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        avatar.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  avatar.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      avatarInput.click();
    }
  });
