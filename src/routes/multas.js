const express = require('express');
const moment = require('moment'); // Usamos moment para manejar las fechas
const router = express.Router();
const Multa = require('../models/multa');
const User = require('../models/usuarios');

// Ruta para insertar multas
router.post('/insertar_multas', async (req, res) => {
    try {
        const { descripcion, fechamulta, departamento, multa } = req.body;

        // Validar los campos obligatorios
        if (!descripcion || !fechamulta || !departamento || !multa) {
            return res.status(400).json({ message: 'Descripción, fecha de multa, departamento y multa son obligatorios' });
        }

        // Asegurarnos de que la fecha se almacene en formato UTC
        const fechaFormateada = moment(fechamulta).utc().toISOString(); // Convertir la fecha a UTC en formato ISO

        // Crear nueva multa con los datos proporcionados
        const nuevaMulta = new Multa({ descripcion, fechamulta: fechaFormateada, departamento, multa });

        // Guardar en la base de datos
        await nuevaMulta.save();

        // Respuesta de éxito
        res.status(201).json({ message: 'Multa registrada exitosamente', multa: nuevaMulta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar la multa' });
    }
});

// Ruta para obtener las multas junto con los usuarios
router.get('/obtener_multas_con_usuario', async (req, res) => {
    try {
        // Obtener todos los usuarios y las multas asociadas
        const usuariosConMultas = await User.aggregate([
            {
                $lookup: {
                    from: 'multas', // Nombre de la colección de multas
                    localField: 'department', // Relacionamos el campo department del usuario con el campo departamento de la multa
                    foreignField: 'departamento', // Relacionamos departamento en la colección Multa
                    as: 'multas' // El nombre del campo donde se guardarán las multas
                }
            }
        ]);

        // Depuración: Verificar que los usuarios tienen o no multas
        console.log(usuariosConMultas);

        // Si no se encuentran usuarios, se retorna un mensaje
        if (usuariosConMultas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron usuarios' });
        }

        // Formatear las fechas de las multas para devolverlas sin hora
        usuariosConMultas.forEach(usuario => {
            usuario.multas.forEach(multa => {
                // Formateamos la fecha de la multa usando moment, eliminando la hora
                multa.fechamulta = moment(multa.fechamulta).utc().format('YYYY-MM-DD'); // Solo mostramos la fecha (sin hora)
            });
        });

        // Devolver los usuarios con las multas asociadas (vacío si no tienen)
        res.json(usuariosConMultas);
    } catch (error) {
        console.error('Error al obtener los usuarios y multas:', error);
        res.status(500).json({ message: 'Error al obtener los usuarios y multas' });
    }
});

module.exports = router;
