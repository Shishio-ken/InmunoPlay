const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const bcrypt = require('bcryptjs');

// Estrategia de registro
passport.use('local.signup', new LocalStrategy({
  usernameField: 'username',       // campo en tu formulario
  passwordField: 'contraseña',     // campo en tu formulario
  passReqToCallback: true
}, async (req, username, password, done) => {
  const { nombre, apellido, correo } = req.body;

  try {
    // Verificar si existe
    const rows = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    if (rows.length > 0) {
      return done(null, false, req.flash('message', 'El usuario ya existe.'));
    }

    // Crear usuario
    const nuevoUsuario = {
      username,
      nombre,
      apellido,
      correo,
      contraseña: await bcrypt.hash(password, 10)
    };

    const result = await pool.query('INSERT INTO usuarios SET ?', [nuevoUsuario]);
    nuevoUsuario.id = result.insertId;

    return done(null, nuevoUsuario);
  } catch (err) {
    return done(err);
  }
}));

// Estrategia de inicio de sesión
passport.use('local.signin', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'contraseña',
  passReqToCallback: true
}, async (req, username, password, done) => {
  try {
    const rows = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    if (rows.length === 0) {
      return done(null, false, req.flash('message', 'El usuario no existe.'));
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.contraseña);

    if (validPassword) {
      return done(null, user);
    } else {
      return done(null, false, req.flash('message', 'Contraseña incorrecta.'));
    }
  } catch (err) {
    return done(err);
  }
}));

// Serializar usuario
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar usuario
passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  if (rows.length > 0) {
    done(null, rows[0]); // Esto está perfecto
  } else {
    done(null, false);
  }
});

