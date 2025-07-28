
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const ans = btn.nextElementSibling;
      ans.style.display = ans.style.display === 'block' ? 'none' : 'block';
    });
  });
