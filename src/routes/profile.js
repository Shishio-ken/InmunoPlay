const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../database');  // Asegúrate de que esta ruta sea correcta
const { isLoggedIn } = require('../middlewares/auth');

// Configuración de subida de avatar
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/uploads'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST para editar el perfil
// router.post('/profile/edit', …)
router.post('/profile/edit', isLoggedIn, upload.single('avatar'), async (req, res) => {
  try {
    // 1) lee el campo 'correo' en lugar de 'email'
    const { nombre, apellido, username, correo } = req.body;

    // 2) avatar igualito
    const avatarPath = req.file
      ? `/uploads/${req.file.filename}`
      : req.user.avatar;

    // 3) UPDATE usando 'correo'
    await pool.query(
      `UPDATE usuarios
         SET nombre   = ?,
             apellido = ?,
             username = ?,
             correo   = ?,    -- <-- aquí comes el correo
             avatar   = ?
       WHERE id = ?`,
      [ nombre, apellido, username, correo, avatarPath, req.user.id ]
    );

    // 4) actualizamos req.user para el render
    req.user = {
      ...req.user,
      nombre,
      apellido,
      username,
      correo,            // <-- guardamos aquí el valor recogido
      avatar: avatarPath
    };

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      avatar: avatarPath
    });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
});


module.exports = router;
