const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('./herlpers');

const ADMIN_KEY = 'SISTEMAS'; // Cambia por tu clave única de administrador

// ===================== Estrategia de Registro =====================
passport.use('local.signup', new LocalStrategy({
  usernameField: 'username',        // Nombre del campo en el formulario
  passwordField: 'contraseña',      // Nombre del campo en el formulario
  passReqToCallback: true           // Permite acceder a req.body
}, async (req, username, contraseña, done) => {
  const { nombre, apellido, correo, confirmar, isAdmin, adminKey } = req.body;

  try {
    // Verificar si el usuario ya existe
    const rows = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    if (rows.length > 0) {
      return done(null, false, req.flash('message', 'El usuario ya existe.'));
    }

    // Verificar si las contraseñas coinciden
    if (contraseña !== confirmar) {
      return done(null, false, req.flash('message', 'Las contraseñas no coinciden.'));
    }

    // Determinar el rol
    let rol = 'estudiante';
    if (isAdmin) {
      if (adminKey === ADMIN_KEY) {
        rol = 'administrador';
      } else {
        return done(null, false, req.flash('message', 'Clave de administrador incorrecta.'));
      }
    }

    // Crear nuevo usuario con contraseña encriptada
    const newUser = {
      username,
      nombre,
      apellido,
      correo,
      contraseña: await helpers.encryptPassword(contraseña),
      rol
    };

    const result = await pool.query('INSERT INTO usuarios SET ?', [newUser]);
    newUser.id = result.insertId;

    return done(null, newUser);
  } catch (error) {
    console.error('Error en registro:', error);
    return done(error);
  }
}));

// ===================== Estrategia de Inicio de Sesión =====================
passport.use('local.signin', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'contraseña',
  passReqToCallback: true
}, async (req, username, contraseña, done) => {
  try {
    // Buscar usuario
    const rows = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    if (rows.length === 0) {
      return done(null, false, req.flash('message', 'Usuario no encontrado.'));
    }

    const user = rows[0];

    // Validar contraseña
    const validPassword = await helpers.matchPassword(contraseña, user.contraseña);
    if (!validPassword) {
      return done(null, false, req.flash('message', 'Contraseña incorrecta.'));
    }

    return done(null, user, req.flash('success', 'Bienvenido ' + user.username));
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    return done(error);
  }
}));

// ===================== Serialización =====================
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const rows = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (rows.length > 0) {
      done(null, rows[0]);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error);
  }
});
