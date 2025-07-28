document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('feedbackModal');
  if (!modal) return;  // nada que hacer si no existe

  const closeBtn = document.getElementById('closeFeedback');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // opcional: auto-cerrar tras 5s
  setTimeout(() => {
    modal.classList.remove('active');
  }, 5000);
});
