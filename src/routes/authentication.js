const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares/auth');

// Mostrar formulario de registro
router.get('/signup', isNotLoggedIn, (req, res) => {
  res.render('auth/signup');
});

// Procesar registro
router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
  successRedirect: '/', // va al index después de registrarse
  failureRedirect: '/signup',
  failureFlash: true // muestra mensaje de error
}));

// Mostrar formulario de login
router.get('/signin', isNotLoggedIn, (req, res) => {
  res.render('auth/signin');
});

// Procesar login
router.post('/signin', isNotLoggedIn, passport.authenticate('local.signin', {
  successRedirect: '/',
  failureRedirect: '/signin',
  failureFlash: true
}));

// Cerrar sesión
router.get('/logout', isLoggedIn, (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
