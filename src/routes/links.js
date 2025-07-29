const express = require('express');
const router = express.Router();
const pool = require('../database');
const { isLoggedIn } = require('../middlewares/auth');
const bcrypt = require('bcryptjs');

// Mostrar formulario + listado de preguntas en /links/add
router.get('/add', isLoggedIn, async (req, res) => {
  try {
    const preguntas = await pool.query('SELECT * FROM preguntas');

    for (const pregunta of preguntas) {
      // Ahora traemos también la columna 'retroalimentacion'
      const opciones = await pool.query(
        'SELECT id, texto_opcion, es_correcta, retroalimentacion FROM opciones WHERE id_pregunta = ?',
        [pregunta.id]
      );
      pregunta.opciones = opciones;
    }

    res.render('links/add', { preguntas });
  } catch (err) {
    console.error('Error al cargar preguntas:', err);
    res.status(500).send('Error al cargar las preguntas');
  }
});

// Procesar formulario y guardar en la base de datos
router.post('/add', isLoggedIn, async (req, res) => {
  try {
    const { enunciado, cantidad, correcta } = req.body;
    const n = parseInt(cantidad, 10);
    if (!enunciado || isNaN(n) || correcta === undefined) {
      return res.status(400).send('Datos incompletos');
    }

    // Guardamos la pregunta
    const result = await pool.query(
      'INSERT INTO preguntas (enunciado) VALUES (?)',
      [enunciado]
    );
    const preguntaId = result.insertId;

    // Por cada opción: texto, si es correcta y la retroalimentación
    for (let i = 1; i <= n; i++) {
      const texto      = req.body[`opcion${i}`]     || '';
      const feedback   = req.body[`feedback${i}`]   || '';
      const esCorrecta = (parseInt(correcta, 10) === i) ? 1 : 0;

      if (texto.trim()) {
        await pool.query(
          `INSERT INTO opciones
             (id_pregunta, texto_opcion, es_correcta, retroalimentacion)
           VALUES (?,?,?,?)`,
          [preguntaId, texto.trim(), esCorrecta, feedback.trim()]
        );
      }
    }

    req.flash('success', '¡Pregunta guardada correctamente!');
    res.redirect('/links/add');
  } catch (error) {
    console.error('Error al insertar en la base de datos:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Mostrar formulario de edición
router.get('/edit/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  try {
    const [pregunta] = await pool.query('SELECT * FROM preguntas WHERE id = ?', [id]);
    if (!pregunta) return res.redirect('/links/add');

    // Traemos todas las columnas de opciones, incluida retroalimentacion
    const opciones = await pool.query(
      'SELECT id, texto_opcion, es_correcta, retroalimentacion FROM opciones WHERE id_pregunta = ?',
      [id]
    );

    res.render('links/edit', { pregunta, opciones });
  } catch (err) {
    console.error('Error al cargar para editar:', err);
    res.status(500).send('Error al cargar la pregunta');
  }
});

// Guardar cambios al editar una pregunta
router.post('/edit/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  try {
    const { enunciado } = req.body;
    // 1) validamos el enunciado
    if (!enunciado || !enunciado.trim()) {
      return res.status(400).send('El enunciado es obligatorio');
    }

    // 2) obtenemos los arrays
    // req.body.opciones puede venir string o array
    let opciones = req.body.opciones || [];
    let feedbacks = req.body.retroalimentaciones || [];
    const correcta = req.body.opcion_correcta;

    // forzamos array
    if (!Array.isArray(opciones)) opciones = [opciones];
    if (!Array.isArray(feedbacks)) feedbacks = [feedbacks];

    // 3) validamos que todas las opciones tengan texto
    if (opciones.some(txt => !txt.trim())) {
      return res.status(400).send('Todas las opciones deben tener texto');
    }
    // 4) validamos que haya una correcta seleccionada
    const correctaIdx = parseInt(correcta, 10);
    if (isNaN(correctaIdx) || correctaIdx < 0 || correctaIdx >= opciones.length) {
      return res.status(400).send('Debe seleccionar una opción correcta');
    }

    // 5) actualizamos el enunciado
    await pool.query('UPDATE preguntas SET enunciado = ? WHERE id = ?', [enunciado.trim(), id]);

    // 6) eliminamos viejas opciones y reinsertamos
    await pool.query('DELETE FROM opciones WHERE id_pregunta = ?', [id]);
    for (let i = 0; i < opciones.length; i++) {
      const texto    = opciones[i].trim();
      const feedback = (feedbacks[i] || '').trim();
      const esCorr   = (i === correctaIdx) ? 1 : 0;

      await pool.query(
        `INSERT INTO opciones
           (id_pregunta, texto_opcion, es_correcta, retroalimentacion)
         VALUES (?,?,?,?)`,
        [id, texto, esCorr, feedback]
      );
    }

    req.flash('success', 'Pregunta actualizada correctamente.');
    res.redirect('/links/add');
  } catch (err) {
    console.error('Error al actualizar la pregunta:', err);
    res.status(500).send('Error al actualizar la pregunta');
  }
});

// Eliminar pregunta
router.post('/delete/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM preguntas WHERE id = ?', [id]);
    req.flash('success', 'Pregunta eliminada correctamente.');
    res.redirect('/links/add');
  } catch (err) {
    res.status(500).send('Error al eliminar');
  }
});


// Usuarios
// Ruta para mostrar usuarios
router.get('/users', isLoggedIn, async (req, res) => {
  try {
    const usuarios = await pool.query("SELECT * FROM usuarios");

    const profesores = usuarios.filter(user => user.rol === 'administrador');
    const estudiantes = usuarios.filter(user => user.rol === 'estudiante');

    res.render('links/users', {
      title: 'Gestión de Usuarios',
      profesores,
      estudiantes
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar usuarios');
  }
});

// Obtener todos los usuarios (GET)
router.get('/api', isLoggedIn, async (req, res) => {
  try {
    const usuarios = await pool.query('SELECT id, nombre, apellido, correo, rol FROM usuarios');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener un usuario por ID (GET)
router.get('/api/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, nombre, apellido, correo, rol FROM usuarios WHERE id = ?',
      [id]
    );
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Crear nuevo usuario (POST)
router.post('/api', isLoggedIn, async (req, res) => {
  const { nombre, apellido, correo, rol, contraseña } = req.body;
  try {
    // Hashear la contraseña (o asignar una por defecto segura)
    const hashedPassword = await bcrypt.hash(contraseña || '1234', 10);

    await pool.query(
      'INSERT INTO usuarios (nombre, apellido, correo, rol, username, contraseña) VALUES (?, ?, ?, ?, ?, ?)',
      [
        nombre,
        apellido || '',
        correo,
        rol,
        correo,          // username por defecto
        hashedPassword
      ]
    );

    res.status(201).json({ message: 'Usuario creado' });
  } catch (err) {
    console.error('Error al crear usuario:', err);  // <- agrega log
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Editar usuario (PUT)
router.put('/api/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, correo, rol, contraseña } = req.body;

  try {
    if (contraseña && contraseña.trim() !== '') {
      const hashedPassword = await bcrypt.hash(contraseña, 10);
      await pool.query(
        'UPDATE usuarios SET nombre = ?, apellido = ?, correo = ?, rol = ?, contraseña = ? WHERE id = ?',
        [nombre, apellido, correo, rol, hashedPassword, id]
      );
    } else {
      await pool.query(
        'UPDATE usuarios SET nombre = ?, apellido = ?, correo = ?, rol = ? WHERE id = ?',
        [nombre, apellido, correo, rol, id]
      );
    }
    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario (DELETE)
router.delete('/api/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
