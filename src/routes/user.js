const express = require('express');
const router = express.Router();
const User = require('../models/usuarios'); 

// Insertar usuarios
router.post('/insertar_usuario', async (req, res) => {
    try {
        const { name, email, phone, profile, department, tower, password } = req.body;

        // Validar datos
        if (!name || !email || !phone || !profile || !department || !tower || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // Crear nuevo usuario
        const nuevoUsuario = new User({ name, email, phone, profile, department, tower, password });
        await nuevoUsuario.save();

        res.status(201).json({ message: 'Usuario registrado exitosamente', usuario: nuevoUsuario });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ message: 'Error al registrar el usuario', error });
    }
});
// Obtener usuario
router.get('/obtener_usuarios', async (req, res) => {
  try {
      const usuarios = await User.find();

      res.json(usuarios.map(usuario => ({
          id: usuario._id, // ID del documento en MongoDB
          name: usuario.name,
          email: usuario.email,
          phone: usuario.phone,
          profile: usuario.profile,
          department: usuario.department,
          tower: usuario.tower,
      })));
  } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      res.status(500).json({ message: 'Error al obtener los usuarios', error });
  }
});

module.exports = router;