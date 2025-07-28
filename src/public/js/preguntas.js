document.addEventListener('DOMContentLoaded', () => {
  const cantidadSelect     = document.getElementById('cantidad');
  const opcionesContainer  = document.getElementById('opcionesContainer');

  cantidadSelect.addEventListener('change', () => {
    opcionesContainer.innerHTML = '';
    const n = parseInt(cantidadSelect.value);
    for (let i = 1; i <= n; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'form-group mb-4';
      wrapper.innerHTML = `
        <label for="opcion${i}">Opción ${i}:</label>
        <input type="text"
               class="form-control"
               name="opcion${i}"
               id="opcion${i}"
               placeholder="Texto de la opción ${i}"
               required>

        <div class="form-check mt-2">
          <input class="form-check-input"
                 type="radio"
                 name="correcta"
                 id="correcta${i}"
                 value="${i}"
                 required>
          <label class="form-check-label" for="correcta${i}">
            Marcar como correcta
          </label>
        </div>

        <label for="feedback${i}" class="mt-2">Retroalimentación ${i}:</label>
        <textarea class="form-control feedback-textarea"
                  name="feedback${i}"
                  id="feedback${i}"
                  placeholder="Explica por qué esta opción está bien o mal"></textarea>
      `;
      opcionesContainer.appendChild(wrapper);
    }
  });
});
