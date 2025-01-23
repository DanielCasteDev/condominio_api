const mongoose = require('mongoose');

const MultaSchema = new mongoose.Schema({
    descripcion: { type: String, required: true },
    fechamulta: { type: Date, required: true },
    departamento: { type: String, required: true },
    multa: { type: String, required: true },

}, {
    timestamps: true,
});

module.exports = mongoose.model('Multa', MultaSchema);
