const { v4: uuidv4 } = require('uuid');
const express = require('express');
const router = express.Router();
const User = require('../models/usuarios'); // Importar el modelo User
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Importar bcrypt
require('dotenv').config();

router.post('/login', async (req, res) => {
    try {
        const { phone, password, rememberSession } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ message: 'El número de teléfono y la contraseña son obligatorios.' });
        }

        const usuario = await User.findOne({ phone });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const isMatch = await usuario.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta.' });
        }

        const userId = usuario.userId || uuidv4();

        const { name, profile, department } = usuario;
        const token = jwt.sign(
            { id: usuario._id, name, profile, department, userId }, 
            process.env.JWT_SECRET,
            { expiresIn: rememberSession ? '50d' : '30s' } 
        );

        // Siempre guardar el token en la base de datos
        usuario.token = token;
        usuario.userId = userId;
        await usuario.save();

        // Responder sin el token
        res.status(200).json({ 
            message: 'Login exitoso', 
            user: { 
                name, 
                profile, 
                department,
                userId
            } 
        });

    } catch (error) {
        console.error('Error al intentar loguearse:', error);
        res.status(500).json({ message: 'Error al intentar loguearse.', error });
    }
});

// Nueva ruta para obtener el token
router.get('/token/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const usuario = await User.findOne({ userId });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json({ token: usuario.token });

    } catch (error) {
        console.error('Error al obtener el token:', error);
        res.status(500).json({ message: 'Error al obtener el token.', error });
    }
});

router.post('/update-password', async (req, res) => {
    const { userId, newPassword } = req.body;
  
    try {
      // Buscar al usuario en la base de datos por userId
      const user = await User.findOne({ userId });
  
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
  
      // Actualizar la contraseña del usuario
      user.password = newPassword; // No necesitas hashear manualmente aquí
      await user.save(); // El pre('save') se encargará de hashear la contraseña
  
      res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      res.status(500).json({ message: 'Error al cambiar la contraseña.', error });
    }
});
router.post('/logout-all-devices', async (req, res) => {
    const { userId } = req.body;
  
    try {
      // Buscar al usuario en la base de datos por userId
      const user = await User.findOne({ userId }); // Cambiar Usuario por User
  
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
  
      // Borrar el token del usuario
      user.token = null;
      await user.save();
  
      res.status(200).json({ message: 'Sesión cerrada en todos los dispositivos.' });
    } catch (error) {
      console.error('Error al cerrar la sesión en todos los dispositivos:', error);
      res.status(500).json({ message: 'Error al cerrar la sesión en todos los dispositivos.', error });
    }
});

module.exports = router;