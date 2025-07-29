document.addEventListener('DOMContentLoaded', () => {
  const msgModal = document.getElementById('messageModal');
  const msgText = document.getElementById('messageText');
  const msgCloseBtn = document.getElementById('messageCloseBtn');

  function showMessage(text) {
    msgText.textContent = text;
    msgModal.classList.add('active');
  }
  msgCloseBtn.addEventListener('click', () => msgModal.classList.remove('active'));

  const puzzleContainer = document.getElementById('puzzle');
  const messageEl = document.getElementById('message');
  const timerEl = document.getElementById('timer');
  const scoreEl = document.getElementById('score');
  const levelEl = document.getElementById('level');
  const nextLevelBtn = document.getElementById('next-level');

  const modalBackdrop = document.getElementById('infoModal');
  const modalText = document.getElementById('modalText');
  const modalClose = document.getElementById('modalClose');

  const levelForm = document.getElementById('levelForm');
  const levelSelector = document.getElementById('levelSelector');
  const gameSection = document.getElementById('gameSection');

  let level = 1;
  let timer = 0;
  let score = 0;
  let interval = null;
  let availableImages;
  let currentImage = null;
  let selectedPiece = null;
  let dragSrc = null;

  const allImages = [
    '/imagenes/recursos/leul1.png',
    '/imagenes/recursos/leul2.png',
    '/imagenes/recursos/leul3.png',
    '/imagenes/recursos/leul4.png',
    '/imagenes/recursos/leul5.png',
    '/imagenes/recursos/leul6.png'
  ];
  availableImages = [...allImages];

  const imageInfo = {
    '/imagenes/recursos/leul1.png': 'Leucemia linfoblástica aguda L1. Linfoblastos pequeños, poseen escaso citoplasma basófilo sin gránulos; el núcleo ocupa la mayor parte de la superficie y la cromatina es laxa gruesa, no denotan tan facilmente sus nucléolos debido al tamaño de la célula en ocasiones en las células de mayor tamaño pueden ser visibles sus nucleolos. Los linfoblastos pueden llegar a presentar la forma de raqueta o "espejos de mano". Médula ósea. Tinción de Wright. Objetivo de inmersión 100×.',
    '/imagenes/recursos/leul2.png': 'Leucemia linfoblástica aguda L1. Linfoblastos de tamaño pequeño homogéneo, escaso citoplasma basófilo, cromatina laxa gruesa, algunos presentan forma de raqueta o de espejo de mano. Médula ósea. Tinción de Wright. Objetivo de inmersión 100×.',
    '/imagenes/recursos/leul3.png': 'Leucemia linfoblástica aguda L1. Celularidad homogénea: linfoblastos de tamaño pequeño, escasos de tamaño medio, las mas grandes pueden envidenciar nucleolos (A) y una cromatina más fina. Médula ósea. Tinción de Wright. Objetivo de inmersión 100×.',
    '/imagenes/recursos/leul4.png': 'Leucemia linfoblástica aguda L1. Celularidad homogénea en tamaño. Linfoblastos con aspecto de raqueta o “espejo de mano”. Médula ósea. Tinción de Wright. Objetivo de inmersión 100×.',
    '/imagenes/recursos/leul5.png': 'Leucemia linfoblástica aguda L1. Linfoblastos con aspecto de raqueta o “espejo de mano”. Médula ósea. Tinción de Wright. Objetivo de inmersión 100×',
    '/imagenes/recursos/leul6.png': 'Leucemia linfoblástica aguda L1. Celularidad homogénea en tamaño. Linfoblastos con aspecto de raqueta o“espejo de mano”. Médula ósea. Tinción de Wright. Objetivo de inmersión 100×.'
  };

  levelForm.addEventListener('submit', e => {
    e.preventDefault();
    const sel = document.getElementById('selectedLevel').value;
    if (!sel) {
      showMessage('Debes seleccionar un nivel antes de comenzar el juego.');
      return;
    }
    level = parseInt(sel, 10);
    levelEl.textContent = `Nivel: ${level}`;
    levelSelector.style.display = 'none';
    gameSection.style.display = 'block';
    initPuzzle(level);
  });

  function initPuzzle(level) {
    puzzleContainer.innerHTML = '';
    messageEl.textContent = '';
    nextLevelBtn.classList.add('hidden');
    selectedPiece = null;
    dragSrc = null;
    modalBackdrop.classList.remove('active');

    const gridSize = level === 1 ? 3 : level === 2 ? 4 : 5;
    const totalPieces = gridSize * gridSize;

    // 🟢 Ajustar dinámicamente el ancho disponible del contenedor
    const containerWidth = Math.min(puzzleContainer.offsetWidth || window.innerWidth * 0.9, 400);
    const pieceSize = Math.floor(containerWidth / gridSize);

    puzzleContainer.style.width = `${pieceSize * gridSize}px`;
    puzzleContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${pieceSize}px)`;

    if (availableImages.length === 0) availableImages = [...allImages];
    const imgIndex = Math.floor(Math.random() * availableImages.length);
    currentImage = availableImages.splice(imgIndex, 1)[0];

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
      piece.style.backgroundImage = `url('${currentImage}')`;
      piece.style.backgroundSize = `${pieceSize * gridSize}px ${pieceSize * gridSize}px`;
      piece.style.backgroundPosition = `${x}px ${y}px`;

      // Eventos para desktop
      piece.addEventListener('dragstart', () => dragSrc = piece);
      piece.addEventListener('dragover', e => e.preventDefault());
      piece.addEventListener('drop', () => {
        swapPieces(dragSrc, piece);
      });

      // Eventos para móvil
      piece.addEventListener('click', () => handlePieceSelection(piece));
      piece.addEventListener('touchstart', e => {
        e.preventDefault();
        handlePieceSelection(piece);
      });

      puzzleContainer.appendChild(piece);
    });

    clearInterval(interval);
    timer = 0;
    timerEl.textContent = 'Tiempo: 0 s';
    interval = setInterval(() => {
      timer++;
      timerEl.textContent = `Tiempo: ${timer} s`;
    }, 1000);
  }

  function handlePieceSelection(piece) {
    if (!selectedPiece) {
      selectedPiece = piece;
      piece.classList.add('selected');
    } else if (selectedPiece === piece) {
      piece.classList.remove('selected');
      selectedPiece = null;
    } else {
      swapPieces(selectedPiece, piece);
      selectedPiece.classList.remove('selected');
      selectedPiece = null;
    }
  }

  function swapPieces(a, b) {
    if (!a || !b || a === b) return;
    const posA = a.dataset.position;
    const posB = b.dataset.position;
    const bgA = a.style.backgroundPosition;
    const bgB = b.style.backgroundPosition;

    a.dataset.position = posB;
    a.style.backgroundPosition = bgB;
    b.dataset.position = posA;
    b.style.backgroundPosition = bgA;

    checkWin();
  }

  function checkWin() {
    const pieces = Array.from(document.querySelectorAll('.piece'));
    const current = pieces.map(p => parseInt(p.dataset.position, 10));
    const gridSize = level === 1 ? 3 : level === 2 ? 4 : 5;
    const correct = Array.from({ length: gridSize * gridSize }, (_, i) => i);
    if (current.every((v, i) => v === correct[i])) {
      clearInterval(interval);
      const points = Math.max(100 - timer * 2, 10);
      score += points;
      scoreEl.textContent = `Puntaje: ${score}`;
      messageEl.textContent = `¡Bien hecho! Completado en ${timer} s (+${points} pts).`;
      modalText.textContent = imageInfo[currentImage] || 'Información no disponible.';
      modalBackdrop.classList.add('active');
      nextLevelBtn.classList.remove('hidden');
    }
  }

  modalClose.addEventListener('click', () => {
    modalBackdrop.classList.remove('active');
  });
  modalBackdrop.addEventListener('click', e => {
    if (e.target === modalBackdrop) {
      modalBackdrop.classList.remove('active');
    }
  });

  nextLevelBtn.addEventListener('click', () => {
    level++;
    levelEl.textContent = `Nivel: ${level}`;
    initPuzzle(level);
  });
});
