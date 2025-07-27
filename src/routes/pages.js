const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/auth');

// Páginas informativas
router.get('/informative', (req, res) => {
  res.render('pages/informative', { title: 'Información sobre Leucemia' });
});

router.get('/game', (req, res) => {
  res.render('pages/game', { title: 'Juego Educativo' });
});

router.get('/quiz', (req, res) => {
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
