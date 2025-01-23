const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    profile: { type: String, required: true },
    department: { type: String, required: true },
    tower: { type: String, required: true },
}, {
    timestamps: true, // Agrega campos de fecha de creación y actualización automáticamente
});



module.exports = mongoose.model('Usuario', UsuarioSchema);
