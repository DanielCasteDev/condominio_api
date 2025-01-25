const express = require('express');
const router = express.Router();
const moment = require('moment');
const Notificacion = require('../models/notificaciones');

router.post('/insertar_notis', async (req, res) => {
    try {
        const { descripcion, fechamulta, departamento, multa } = req.body;

        // Validar los campos obligatorios
        if (!descripcion || !fechamulta || !departamento || !multa) {
            return res.status(400).json({ message: 'Descripción, fecha de multa, departamento y multa son obligatorios' });
        }

        // Asegurarnos de que la fecha se almacene en formato UTC
        const fechaFormateada = moment(fechamulta).utc().toISOString(); // Convertir la fecha a UTC en formato ISO

        // Crear nueva notificación con los datos proporcionados
        const nuevaNotificacion = new Notificacion({ descripcion, fechamulta: fechaFormateada, departamento, multa });

        // Guardar en la base de datos
        await nuevaNotificacion.save();

        // Respuesta de éxito
        res.status(201).json({ message: 'Notificación registrada exitosamente', notificacion: nuevaNotificacion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar la notificación' });
    }
});

// Ruta para obtener las notificaciones
router.get('/notificaciones', async (req, res) => {
    try {
      // Obtener todas las notificaciones de la base de datos
      const notificaciones = await Notificacion.find().sort({ fechamulta: -1 }); // Ordenar por fecha de multa (más recientes primero)
  
      // Si no hay notificaciones
      if (!notificaciones || notificaciones.length === 0) {
        return res.status(404).json({ message: 'No se encontraron notificaciones.' });
      }
  
      // Respuesta con las notificaciones
      res.status(200).json(notificaciones);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener las notificaciones.' });
    }
  });



router.delete('/notificaciones', async (req, res) => {
  const { departamento } = req.body;

  if (!departamento) {
    return res.status(400).json({ error: 'El departamento es requerido.' });
  }

  try {
    // Eliminar todas las notificaciones del departamento especificado
    const result = await Notificacion.deleteMany({ departamento });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No se encontraron notificaciones para ese departamento.' });
    }

    res.status(200).json({ message: `Se eliminaron ${result.deletedCount} notificaciones del departamento: ${departamento}` });
  } catch (error) {
    console.error('Error al borrar las notificaciones:', error);
    res.status(500).json({ error: 'Hubo un problema al intentar borrar las notificaciones.' });
  }
});

module.exports = router;