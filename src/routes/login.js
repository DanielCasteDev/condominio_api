const express = require('express');
const router = express.Router();
const User = require('../models/usuarios');
const jwt = require('jsonwebtoken');
require('dotenv').config();



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
  
        // Si la contraseña es correcta, generar el token con los datos adicionales
        const { name, profile, department } = usuario;
        const token = jwt.sign(
            { id: usuario._id, name, profile, department }, // Incluir los campos en el payload
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
  
        // Responder con el token y los datos del usuario
        res.status(200).json({ 
            message: 'Login exitoso', 
            token,
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