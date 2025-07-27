document.addEventListener('DOMContentLoaded', function() {
  console.log("Script externo cargado");

  const cantidad = document.getElementById('cantidad');
  const contenedor = document.getElementById('opcionesContainer');

  cantidad.addEventListener('change', () => {
    console.log("Cambio detectado");
    contenedor.innerHTML = '';
    const num = parseInt(cantidad.value);

    for (let i = 1; i <= num; i++) {
      contenedor.innerHTML += `
        <div class="form-group mb-3">
          <label>Opción ${i}</label>
          <input type="text" class="form-control" name="opciones[]" placeholder="Texto de la opción ${i}" required>
          <div class="form-check mt-1">
            <input class="form-check-input" type="radio" name="opcion_correcta" value="${i - 1}" required>
            <label class="form-check-label">Esta es la correcta</label>
          </div>
        </div>
      `;
    }
  });
});
