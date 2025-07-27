document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('carouselTrack');
  const slides = document.querySelectorAll('.bloque');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const counter = document.getElementById('counter');
  const totalSlides = slides.length;
  let currentIndex = 0;

  const updateCarousel = () => {
    const slideWidth = slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    counter.textContent = `${currentIndex + 1} de ${totalSlides}`;
  };

  nextBtn.addEventListener('click', () => {
    if (currentIndex < totalSlides - 1) {
      currentIndex++;
      updateCarousel();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  updateCarousel();

  // Modal
  document.querySelectorAll('.clickable-img').forEach(img => {
    img.addEventListener('click', () => {
      const modal = document.getElementById('modalImagen');
      const modalImg = document.getElementById('imgModal');
      modal.style.display = 'flex';
      modalImg.src = img.src;
      modalImg.alt = img.alt;
    });
  });

  document.getElementById('modalImagen').addEventListener('click', () => {
    document.getElementById('modalImagen').style.display = 'none';
    document.getElementById('imgModal').src = '';
  });
});

