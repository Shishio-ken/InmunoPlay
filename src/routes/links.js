const express = require('express');
const router = express.Router();
const pool = require('../database');
const { isLoggedIn } = require('../middlewares/auth');

// Mostrar formulario + listado de preguntas en /links/add
router.get('/add', isLoggedIn, async (req, res) => {
  try {
    const preguntas = await pool.query('SELECT * FROM preguntas');

    for (const pregunta of preguntas) {
      const opciones = await pool.query(
        'SELECT texto_opcion, es_correcta FROM opciones WHERE id_pregunta = ?',
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
  const { enunciado, opciones, opcion_correcta } = req.body;

  try {
    if (!enunciado || !opciones || opcion_correcta === undefined) {
      return res.status(400).send('Datos incompletos');
    }

    const listaOpciones = Array.isArray(opciones) ? opciones : [opciones];
    const correctaIndex = parseInt(opcion_correcta);

    const result = await pool.query('INSERT INTO preguntas (enunciado) VALUES (?)', [enunciado]);
    const preguntaId = result.insertId;

    for (let i = 0; i < listaOpciones.length; i++) {
      const texto = listaOpciones[i];
      const esCorrecta = (i === correctaIndex);

      if (texto.trim()) {
        await pool.query(
          'INSERT INTO opciones (id_pregunta, texto_opcion, es_correcta) VALUES (?, ?, ?)',
          [preguntaId, texto, esCorrecta]
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

// Listar todas las preguntas en /links (opcional)
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const preguntas = await pool.query('SELECT * FROM preguntas');

    for (const pregunta of preguntas) {
      const opciones = await pool.query(
        'SELECT texto_opcion, es_correcta FROM opciones WHERE id_pregunta = ?',
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

// Eliminar pregunta
router.get('/delete/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM preguntas WHERE id = ?', [id]);
    req.flash('success', 'Pregunta eliminada correctamente.');
    res.redirect('/links/add');
  } catch (err) {
    console.error('Error al eliminar pregunta:', err);
    res.status(500).send('Error al eliminar');
  }
});

// Mostrar formulario de edición
router.get('/edit/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;

  try {
    const preguntas = await pool.query('SELECT * FROM preguntas WHERE id = ?', [id]);
    const opciones = await pool.query('SELECT * FROM opciones WHERE id_pregunta = ?', [id]);

    if (preguntas.length > 0) {
      res.render('links/edit', {
        pregunta: preguntas[0],
        opciones
      });
    } else {
      res.redirect('/links/add');
    }
  } catch (err) {
    console.error('Error al cargar para editar:', err);
    res.status(500).send('Error al cargar la pregunta');
  }
});

// Guardar cambios al editar una pregunta
router.post('/edit/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { enunciado, opciones, opcion_correcta } = req.body;

  try {
    if (!enunciado || !opciones || opcion_correcta === undefined) {
      return res.status(400).send('Datos incompletos');
    }

    const listaOpciones = Array.isArray(opciones) ? opciones : [opciones];
    const correctaIndex = parseInt(opcion_correcta);

    await pool.query('UPDATE preguntas SET enunciado = ? WHERE id = ?', [enunciado, id]);
    await pool.query('DELETE FROM opciones WHERE id_pregunta = ?', [id]);

    for (let i = 0; i < listaOpciones.length; i++) {
      const texto = listaOpciones[i];
      const esCorrecta = (i === correctaIndex);

      if (texto.trim()) {
        await pool.query(
          'INSERT INTO opciones (id_pregunta, texto_opcion, es_correcta) VALUES (?, ?, ?)',
          [id, texto, esCorrecta]
        );
      }
    }
    req.flash('success', 'Pregunta actualizada correctamente.');
    res.redirect('/links/add');
  } catch (err) {
    console.error('Error al actualizar la pregunta:', err);
    res.status(500).send('Error al actualizar la pregunta');
  }
});

// Ruta para mostrar usuarios
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
    const usuarios = await pool.query('SELECT id, nombre, correo, rol FROM usuarios');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear nuevo usuario (POST)
router.post('/api', isLoggedIn, async (req, res) => {
  const { nombre, correo, rol } = req.body;
  try {
    await pool.query('INSERT INTO usuarios (nombre, correo, rol, username, contraseña) VALUES (?, ?, ?, ?, ?)', [
      nombre,
      correo,
      rol,
      correo, // puedes generar un username desde correo
      '1234' // contraseña temporal, idealmente hasheada
    ]);
    res.status(201).json({ message: 'Usuario creado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Editar usuario (PUT)
router.put('/api/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol } = req.body;
  try {
    await pool.query('UPDATE usuarios SET nombre = ?, correo = ?, rol = ? WHERE id = ?', [
      nombre,
      correo,
      rol,
      id
    ]);
    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
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
