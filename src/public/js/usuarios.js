document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('userModal');
  const form = document.getElementById('userForm');
  const cancelBtn = document.getElementById('cancelBtn');
  const newUserBtn = document.getElementById('newUserBtn');
  const formError = document.getElementById('formError');

  const userIdField = document.getElementById('userId');
  const nameField = document.getElementById('userName');
  const lastNameField = document.getElementById('userLastName');
  const emailField = document.getElementById('userEmail');
  const roleField = document.getElementById('userRole');

  // Mostrar modal nuevo usuario
  newUserBtn?.addEventListener('click', () => {
    form.reset();
    formError.textContent = '';
    document.getElementById('modalTitle').textContent = 'Nuevo usuario';
    userIdField.value = '';
    modal.classList.add('active');
  });

  // Cerrar modal
  cancelBtn?.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Editar usuario
  document.querySelectorAll('.editUser').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const res = await fetch(`/links/api`);
      const users = await res.json();
      const user = users.find(u => u.id == id);
      if (!user) return;

      formError.textContent = '';
      document.getElementById('modalTitle').textContent = 'Editar usuario';
      userIdField.value = user.id;
      nameField.value = user.nombre;
      emailField.value = user.correo;
      roleField.value = user.rol;
      lastNameField.value = user.apellido || '';
      modal.classList.add('active');
    });
  });

  // Eliminar usuario
  document.querySelectorAll('.deleteUser').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;

      const res = await fetch(`/links/api/${id}`, { method: 'DELETE' });
      const data = await res.json();
      alert(data.message);
      location.reload();
    });
  });

  // Guardar (crear o editar)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = userIdField.value;
    const nombre = nameField.value.trim();
    const apellido = lastNameField.value.trim();
    const correo = emailField.value.trim();
    const rol = roleField.value;

    if (!nombre || !correo || !rol) {
      formError.textContent = 'Todos los campos son obligatorios.';
      return;
    }

    const body = { nombre, apellido, correo, rol };

    try {
      let res;
      if (id) {
        // Editar
        res = await fetch(`/links/api/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        // Crear
        res = await fetch(`/links/api`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }

      const result = await res.json();
      if (result.message) {
        alert(result.message);
        modal.classList.remove('active');
        location.reload();
      } else {
        throw new Error(result.error || 'Error inesperado');
      }
    } catch (err) {
      console.error(err);
      formError.textContent = err.message;
    }
  });
});
