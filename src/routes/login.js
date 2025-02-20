const { v4: uuidv4 } = require('uuid');  // Para generar un UUID
const express = require('express');
const router = express.Router();
const User = require('../models/usuarios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/login', async (req, res) => {
    try {
        const { phone, password, rememberSession } = req.body;

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

        // Generar un ID único para el usuario si no tiene uno asignado
        const userId = usuario.userId || uuidv4(); // Si no tiene un ID, generamos uno

        // Generar el token con los datos adicionales
        const { name, profile, department } = usuario;
        const token = jwt.sign(
            { id: usuario._id, name, profile, department, userId }, 
            process.env.JWT_SECRET,
            { expiresIn: rememberSession ? '50d' : '1m' } 
        );

        // Guardar el token en la base de datos SOLO si se selecciona "recordar sesión"
        if (rememberSession) {
            usuario.token = token;
            usuario.userId = userId;  // Guardar el userId en la base de datos
            await usuario.save();
        }

        // Responder con el token y los datos del usuario
        res.status(200).json({ 
            message: 'Login exitoso', 
            token,
            user: { 
                name, 
                profile, 
                department,
                userId  // Incluir el userId
            } 
        });

    } catch (error) {
        console.error('Error al intentar loguearse:', error);
        res.status(500).json({ message: 'Error al intentar loguearse.', error });
    }
});



module.exports = router;
