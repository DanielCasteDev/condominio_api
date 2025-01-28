const express = require('express');
const router = express.Router();
const User = require('../models/usuarios'); // Ruta hacia el modelo de usuario

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

// Obtener usuarios
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

router.post('/login', async (req, res) => {
  try {
      const { phone, password } = req.body;

      // Validar si el teléfono y la contraseña fueron proporcionados
      if (!phone || !password) {
          return res.status(400).json({ message: 'El número de teléfono y la contraseña son obligatorios.' });
      }

      // Buscar al usuario por su número de teléfono
      const usuario = await User.findOne({ phone });

      // Si no se encuentra el usuario
      if (!usuario) {
          return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      // Verificar la contraseña
      const isMatch = await usuario.comparePassword(password);
      if (!isMatch) {
          return res.status(401).json({ message: 'Contraseña incorrecta.' });
      }

      // Si la contraseña es correcta, devolver los datos del usuario
      const { name, profile, department } = usuario;
      res.status(200).json({ 
          message: 'Login exitoso', 
          user: { 
              name, 
              profile, 
              department 
          } 
      });

  } catch (error) {
      console.error('Error al intentar loguearse:', error);
      res.status(500).json({ message: 'Error al intentar loguearse.', error });
  }
});

module.exports = router;