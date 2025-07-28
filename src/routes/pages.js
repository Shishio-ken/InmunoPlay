const express = require('express');
const router = express.Router();
const pool = require('../database');
const { isLoggedIn } = require('../middlewares/auth');

router.get('/quiz', isLoggedIn, async (req, res) => {
  // 1) Trae y da forma a dynamicQuestions desde tu BD
  const rawPreg = await pool.query('SELECT * FROM preguntas');
  const dynamicQuestions = [];
  for (let p of rawPreg) {
    const opts = await pool.query(
      'SELECT texto_opcion, es_correcta, retroalimentacion FROM opciones WHERE id_pregunta = ?',
      [p.id]
    );
    dynamicQuestions.push({
      question: p.enunciado,
      options: opts.map(o => o.texto_opcion),
      correctAnswer: opts.findIndex(o => o.es_correcta),
      feedbacks: opts.map(o => o.retroalimentacion)
    });
  }
  res.render('pages/quiz', { dynamicQuestions });
});

// Servir el JS con las preguntas dinámicas
router.get('/js/dynamicQuestions.js', isLoggedIn, async (req, res) => {
  // Obtén dinámicas igual que en /quiz (o reutiliza)
  // Por brevedad, asumimos ya tienes dynamicQuestions en memoria:
  // Aquí por simplicidad vamos a recargar:
  const rawPreg = await pool.query('SELECT * FROM preguntas');
  const arr = [];
  for (let p of rawPreg) {
    const opts = await pool.query('SELECT texto_opcion, es_correcta, retroalimentacion FROM opciones WHERE id_pregunta = ?', [p.id]);
    arr.push({
      question: p.enunciado,
      options: opts.map(o => o.texto_opcion),
      correctAnswer: opts.findIndex(o => o.es_correcta),
      feedbacks: opts.map(o => o.retroalimentacion)
    });
  }
  res.type('application/javascript')
     .send(`window.dynamicQuestions = ${JSON.stringify(arr)};`);
});

// Páginas informativas
router.get('/informative', isLoggedIn, (req, res) => {
  res.render('pages/informative', { title: 'Información sobre Leucemia' });
});

router.get('/game', isLoggedIn, (req, res) => {
  res.render('pages/game', { title: 'Juego Educativo' });
});

router.get('/quiz', isLoggedIn, (req, res) => {
  res.render('pages/quiz', { title: 'Quiz' });
});

router.get('/users', isLoggedIn, (req, res) => {
  res.render('links/users', { title: 'Administrar Usuarios' });
});

router.get('/juego/nivel/:nivel', isLoggedIn, (req, res) => {
  const { nivel } = req.params;
  // Aquí podrías filtrar preguntas, velocidad, etc., según el nivel
  res.render('pages/jugar', { nivelSeleccionado: nivel });
});

router.get('/profile', isLoggedIn, async (req, res) => {
  const user = req.user;

  res.render('links/profile', {
    nombre: user.nombre,
    apellido: user.apellido,
    correo: user.correo,
    username: user.username,
    rol: user.rol
  });
});

// Páginas médicas
router.get('/lcpt', (req, res) => res.render('pages/lcpt'));
router.get('/lgc_lmc', (req, res) => res.render('pages/lgc_lmc'));
router.get('/linfoides1', (req, res) => res.render('pages/linfoides1'));
router.get('/linfoides2', (req, res) => res.render('pages/linfoides2'));
router.get('/lia1', (req, res) => res.render('pages/lia1'));
router.get('/lia2', (req, res) => res.render('pages/lia2'));
router.get('/lia3', (req, res) => res.render('pages/lia3'));
router.get('/llc', (req, res) => res.render('pages/llc'));

router.get('/lma_m0', (req, res) => res.render('pages/lma_m0'));
router.get('/lma_m1', (req, res) => res.render('pages/lma_m1'));
router.get('/lma_m2', (req, res) => res.render('pages/lma_m2'));
router.get('/lma_m3', (req, res) => res.render('pages/lma_m3'));
router.get('/lma_m4', (req, res) => res.render('pages/lma_m4'));
router.get('/lma_m5a', (req, res) => res.render('pages/lma_m5a'));
router.get('/lma_m5b', (req, res) => res.render('pages/lma_m5b'));
router.get('/lma_m6', (req, res) => res.render('pages/lma_m6'));
router.get('/lma_m7', (req, res) => res.render('pages/lma_m7'));

router.get('/lmmc', (req, res) => res.render('pages/lmmc'));
router.get('/lnk', (req, res) => res.render('pages/lnk'));
router.get('/lp', (req, res) => res.render('pages/lp'));

module.exports = router;
