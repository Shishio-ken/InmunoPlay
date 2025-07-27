document.addEventListener('DOMContentLoaded', () => {
  const puzzleContainer = document.getElementById('puzzle');
  const message = document.getElementById('message');
  const timerEl = document.getElementById('timer');
  const scoreEl = document.getElementById('score');
  const levelEl = document.getElementById('level');
  const nextLevelBtn = document.getElementById('next-level');

  const levelForm = document.getElementById('levelForm');
  const levelSelector = document.getElementById('levelSelector');
  const gameSection = document.getElementById('gameSection');

  let level = 1;
  let timer = 0;
  let score = 0;
  let interval;

  const allImages = [
    '/imagenes/recursos/leul1.png',
    '/imagenes/recursos/leul2.png',
    '/imagenes/recursos/leul3.png',
    '/imagenes/recursos/leul4.png',
    '/imagenes/recursos/leul5.png',
    '/imagenes/recursos/leul6.png'
  ];

  let availableImages = [...allImages];

  levelForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const selected = document.getElementById('selectedLevel').value;
    if (!selected) return alert('Selecciona un nivel válido');

    level = parseInt(selected);
    levelEl.textContent = `Nivel: ${level}`;
    levelSelector.style.display = 'none';
    gameSection.style.display = 'block';

    initPuzzle(level);
  });

  function initPuzzle(level) {
    puzzleContainer.innerHTML = '';
    message.textContent = '';
    nextLevelBtn.classList.add('hidden');

    const gridSize = level === 1 ? 3 : level === 2 ? 4 : 5;
    const totalPieces = gridSize * gridSize;
    const pieceSize = 450 / gridSize;

    puzzleContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${pieceSize}px)`;

    if (availableImages.length === 0) {
      availableImages = [...allImages];
    }

    const imgIndex = Math.floor(Math.random() * availableImages.length);
    const bgImage = availableImages.splice(imgIndex, 1)[0];

    const correctOrder = Array.from({ length: totalPieces }, (_, i) => i);
    const shuffledOrder = correctOrder.slice().sort(() => Math.random() - 0.5);

    shuffledOrder.forEach(pos => {
      const piece = document.createElement('div');
      piece.className = 'piece';
      piece.draggable = true;
      piece.dataset.position = pos;

      const x = -(pos % gridSize) * pieceSize;
      const y = -Math.floor(pos / gridSize) * pieceSize;
      piece.style.width = `${pieceSize}px`;
      piece.style.height = `${pieceSize}px`;
      piece.style.backgroundImage = `url('${bgImage}')`;
      piece.style.backgroundPosition = `${x}px ${y}px`;

      puzzleContainer.appendChild(piece);
    });

    let dragSrc = null;
    const pieces = document.querySelectorAll('.piece');
    pieces.forEach(piece => {
      piece.addEventListener('dragstart', () => dragSrc = piece);
      piece.addEventListener('dragover', e => e.preventDefault());
      piece.addEventListener('drop', function () {
        if (dragSrc === this) return;
        const srcPos = dragSrc.dataset.position;
        const targetPos = this.dataset.position;
        const srcBg = dragSrc.style.backgroundPosition;
        const targetBg = this.style.backgroundPosition;

        dragSrc.dataset.position = targetPos;
        dragSrc.style.backgroundPosition = targetBg;
        this.dataset.position = srcPos;
        this.style.backgroundPosition = srcBg;

        checkWin();
      });
    });

    clearInterval(interval);
    timer = 0;
    timerEl.textContent = 'Tiempo: 0 s';
    interval = setInterval(() => {
      timer++;
      timerEl.textContent = `Tiempo: ${timer} s`;
    }, 1000);
  }

  function checkWin() {
    const currentOrder = Array.from(document.querySelectorAll('.piece'))
      .map(p => parseInt(p.dataset.position));
    const gridSize = level === 1 ? 3 : level === 2 ? 4 : 5;
    const correctOrder = Array.from({ length: gridSize * gridSize }, (_, i) => i);

    if (currentOrder.every((v, i) => v === correctOrder[i])) {
      clearInterval(interval);
      let pointsEarned = Math.max(100 - timer * 2, 10);
      score += pointsEarned;
      scoreEl.textContent = `Puntaje: ${score}`;
      message.textContent = `¡Bien hecho! Completado en ${timer} s (+${pointsEarned} puntos).`;
      nextLevelBtn.classList.remove('hidden');
    } else {
      message.textContent = '';
    }
  }

  nextLevelBtn.addEventListener('click', () => {
    level++;
    levelEl.textContent = `Nivel: ${level}`;
    initPuzzle(level);
  });
});
