;(async function(){
  // 1) Carga de datos
  const resp = await fetch('/quiz-data.json');
  if (!resp.ok) {
    console.error('No pude cargar /quiz-data.json');
    return;
  }
  const { static: staticSet, dynamic: dynamicSet } = await resp.json();

  // 2) Referencias DOM
  const configDiv     = document.getElementById('test-config');
  const startBtn      = document.getElementById('startQuizBtn');
  const testSelect    = document.getElementById('testSelect');
  const countConfig   = document.getElementById('count-config');
  const countSelect   = document.getElementById('questionCount');
  const quizApp       = document.getElementById('quiz-app');

  // (y tus refs internas de quiz…)
  const questionNumberEl   = document.getElementById('question-number');
  const questionTextEl     = document.getElementById('question-text');
  const optionsContainer   = document.getElementById('options-container');
  const nextBtn            = document.getElementById('next-btn');
  const feedbackEl         = document.getElementById('feedback');
  const progressBarEl      = document.getElementById('progress-bar');
  const questionScreen     = document.getElementById('question-screen');
  const resultsScreen      = document.getElementById('results-screen');
  const finalScoreEl       = document.getElementById('final-score');
  const resultsMessageEl   = document.getElementById('results-message');
  const celebrationEl      = document.getElementById('celebration');
  const restartBtn         = document.getElementById('restart-btn');
  const reviewContainer    = document.getElementById('review-container');

  // 3) Estado
  let allQuestions   = [];
  let questions      = [];
  let currentIndex   = 0;
  let score          = 0;
  let answersReview  = [];

  // 4) Auxiliares
  function shuffle(arr){
    for(let i=arr.length-1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]] = [arr[j],arr[i]];
    }
    return arr;
  }

  function buildTest(){
    allQuestions = testSelect.value === 'static'
      ? staticSet.slice()
      : dynamicSet.slice();
    const pool = shuffle(allQuestions.slice());
    const n = testSelect.value === 'dynamic'
            ? pool.length
            : Math.min(parseInt(countSelect.value,10), pool.length);
    questions      = pool.slice(0, n);
    answersReview  = [];
  }

  function loadQuestion(){
    const q = questions[currentIndex];
    questionNumberEl.textContent = `Pregunta ${currentIndex+1} de ${questions.length}`;
    questionTextEl.textContent   = q.question;
    progressBarEl.style.width    = `${(currentIndex/questions.length)*100}%`;

    optionsContainer.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('div');
      btn.className        = 'option';
      btn.textContent      = opt;
      btn.dataset.index    = idx;
      btn.dataset.feedback = Array.isArray(q.feedbacks)
                             ? (q.feedbacks[idx]||'')
                             : '';
      btn.addEventListener('click', () => selectOption(btn, idx));
      optionsContainer.appendChild(btn);
    });

    nextBtn.disabled       = true;
    feedbackEl.textContent = '';
    feedbackEl.className   = 'feedback';
  }

  function selectOption(el, idx){
    if (optionsContainer.querySelector('.selected')) return;
    const q       = questions[currentIndex];
    const correct = idx === q.correctAnswer;
    const fb      = el.dataset.feedback.trim();

    optionsContainer.querySelectorAll('.option').forEach(o=>{
      o.classList.add('disabled');
      o.style.pointerEvents = 'none';
    });

    el.classList.add('selected');
    if (correct) {
      el.classList.add('correct');
      feedbackEl.textContent = fb || '¡Correcto!';
      feedbackEl.classList.add('correct-feedback');
      score++;
    } else {
      el.classList.add('incorrect');
      const good = optionsContainer.querySelector(`.option[data-index="${q.correctAnswer}"]`);
      if (good) good.classList.add('correct');
      feedbackEl.textContent = fb || 'Incorrecto';
      feedbackEl.classList.add('incorrect-feedback');
    }

    answersReview.push({
      question:    q.question,
      options:     q.options,
      userIdx:     idx,
      correctIdx:  q.correctAnswer
    });

    nextBtn.disabled = false;
  }

  function showResults(){
    questionScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');

    finalScoreEl.textContent = `${score} / ${questions.length}`;
    const pct = (score/questions.length)*100;
    resultsMessageEl.textContent =
      pct===100 ? '¡Perfecto!' :
      pct>=80  ? '¡Muy bien!' :
      pct>=60  ? 'Buen trabajo' :
                 'Sigue practicando';
    celebrationEl.textContent =
      pct===100 ? '🏆🎉' :
      pct>=80  ? '🎉' :
      pct>=60  ? '👍' :
                 '💪';

    reviewContainer.innerHTML = '';
    answersReview.forEach((ans,i)=>{
      const div = document.createElement('div');
      div.className = 'review-item';
      div.innerHTML = `
        <h4>Q${i+1}: ${ans.question}</h4>
        <p>Tu respuesta: <span class="user-answer">${ans.options[ans.userIdx]||'(ninguna)'}</span></p>
        <p>Respuesta correcta: <span class="correct-answer">${ans.options[ans.correctIdx]}</span></p>
      `;
      reviewContainer.appendChild(div);
    });
  }

  function resetQuiz(){
    currentIndex = 0;
    score        = 0;
    questionScreen.classList.remove('hidden');
    resultsScreen.classList.add('hidden');
    reviewContainer.innerHTML = '';
    buildTest();
    loadQuestion();
  }

  // 5) OCULTAR / MOSTRAR el select de número de preguntas
  testSelect.addEventListener('change', () => {
    if (testSelect.value === 'dynamic') {
      countConfig.classList.add('hidden');
    } else {
      countConfig.classList.remove('hidden');
    }
  });

  // 6) Arranque al pulsar “Comenzar Test”
  startBtn.addEventListener('click', () => {
    testSelect.disabled  = true;
    countSelect.disabled = true;
    startBtn.disabled    = true;

    configDiv.classList.add('hidden');
    quizApp.classList.remove('hidden');

    resetQuiz();
  });

  nextBtn.addEventListener('click', ()=>{
    if (currentIndex < questions.length-1) {
      currentIndex++;
      loadQuestion();
    } else {
      showResults();
    }
  });

  restartBtn.addEventListener('click', ()=>{
    testSelect.disabled  = false;
    countSelect.disabled = false;
    startBtn.disabled    = false;
    configDiv.classList.remove('hidden');
    quizApp.classList.add('hidden');
  });

})();
