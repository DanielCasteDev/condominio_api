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

router.get('/obtener_ultima_multa_todos', async (req, res) => {
    try {
        // Obtener todos los usuarios y sus últimas multas
        const usuariosConUltimaMulta = await User.aggregate([
            {
                $lookup: {
                    from: 'multas', // Nombre de la colección de multas
                    localField: 'department', // Relacionamos el campo department del usuario con el campo departamento de la multa
                    foreignField: 'departamento', // Relacionamos departamento en la colección Multa
                    as: 'multas' // El nombre del campo donde se guardarán las multas
                }
            },
            {
                $unwind: {
                    path: '$multas', // Descomponemos el array de multas
                    preserveNullAndEmptyArrays: true // Para incluir usuarios sin multas
                }
            },
            {
                $sort: { 'multas.fechamulta': -1 } // Ordenamos por fecha de multa descendente
            },
            {
                $group: {
                    _id: '$_id', // Agrupamos por usuario
                    name: { $first: '$name' }, // Conservamos el nombre del usuario
                    department: { $first: '$department' }, // Conservamos el departamento del usuario
                    tower: { $first: '$tower' }, // Conservamos la torre del usuario
                    ultimaMulta: { $first: '$multas' } // Conservamos la última multa
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    department: 1,
                    tower: 1,
                    ultimaMulta: {
                        $ifNull: ['$ultimaMulta', null] // Si no hay multas, devolvemos null
                    }
                }
            }
        ]);

        // Formatear las fechas de las multas
        usuariosConUltimaMulta.forEach(usuario => {
            if (usuario.ultimaMulta) {
                usuario.ultimaMulta.fechamulta = moment(usuario.ultimaMulta.fechamulta).utc().format('YYYY-MM-DD');
            }
        });

        // Devolver los usuarios con su última multa (o null si no tienen)
        res.json(usuariosConUltimaMulta);
    } catch (error) {
        console.error('Error al obtener la última multa de todos los usuarios:', error);
        res.status(500).json({ message: 'Error al obtener la última multa de todos los usuarios' });
    }
});

router.get('/obtener_historial_multas/:departamento', async (req, res) => {
    try {
        const { departamento } = req.params; // Obtener el departamento de los parámetros de la URL

        // Validar que se proporcionó un departamento
        if (!departamento) {
            return res.status(400).json({ message: 'El departamento es obligatorio' });
        }

        // Buscar todas las multas del departamento y ordenarlas por fecha descendente
        const historial = await Multa.find({ departamento }).sort({ fechamulta: -1 });

        // Formatear las fechas de las multas
        const historialFormateado = historial.map(multa => ({
            ...multa._doc, // Conservar todos los campos de la multa
            fechamulta: moment(multa.fechamulta).utc().format('YYYY-MM-DD') // Formatear la fecha
        }));

        // Devolver el historial formateado
        res.json(historialFormateado);
    } catch (error) {
        console.error('Error al obtener el historial de multas:', error);
        res.status(500).json({ message: 'Error al obtener el historial de multas' });
    }
});


module.exports = router;
