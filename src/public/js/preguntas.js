document.addEventListener('DOMContentLoaded', () => {
  const cantidadSelect = document.getElementById('cantidad');
  const opcionesContainer = document.getElementById('opcionesContainer');
  const preguntaForm = document.getElementById('preguntaForm');

  // --- Modal (ya existente) ---
  const msgModal = document.getElementById('messageModal');
  const msgText = document.getElementById('messageText');
  const msgCloseBtn = document.getElementById('messageCloseBtn');

  function showMessage(text) {
    msgText.textContent = text;
    msgModal.classList.add('active');
  }
  msgCloseBtn.addEventListener('click', () => msgModal.classList.remove('active'));

  // --- Generación dinámica de opciones ---
  cantidadSelect.addEventListener('change', () => {
    opcionesContainer.innerHTML = '';
    const n = parseInt(cantidadSelect.value);

    if (!n) return;

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

  // --- Validación al enviar ---
  preguntaForm.addEventListener('submit', (e) => {
    const enunciado = preguntaForm.enunciado.value.trim();
    const cantidad = parseInt(cantidadSelect.value);

    // 1) Verificar enunciado
    if (!enunciado) {
      e.preventDefault();
      showMessage('Debes escribir la pregunta.');
      return;
    }

    // 2) Verificar cantidad seleccionada
    if (!cantidad) {
      e.preventDefault();
      showMessage('Debes seleccionar el número de respuestas.');
      return;
    }

    // 3) Verificar texto en opciones
    for (let i = 1; i <= cantidad; i++) {
      const opcionTexto = document.getElementById(`opcion${i}`).value.trim();
      if (!opcionTexto) {
        e.preventDefault();
        showMessage(`La opción ${i} está vacía.`);
        return;
      }
    }

    // 4) Verificar que haya al menos una opción correcta seleccionada
    const correctaSeleccionada = preguntaForm.querySelector('input[name="correcta"]:checked');
    if (!correctaSeleccionada) {
      e.preventDefault();
      showMessage('Debes marcar una opción como correcta.');
      return;
    }

    // 5) Verificar que cada retroalimentación no sea demasiado corta (opcional)
    for (let i = 1; i <= cantidad; i++) {
      const feedback = document.getElementById(`feedback${i}`).value.trim();
      if (feedback && feedback.length < 5) {
        e.preventDefault();
        showMessage(`La retroalimentación de la opción ${i} es demasiado corta.`);
        return;
      }
    }
  });
});