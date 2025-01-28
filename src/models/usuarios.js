const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UsuarioSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    profile: { type: String, required: true },
    department: { type: String, required: true },
    tower: { type: String, required: true },
    password: { type: String, required: true }, // Nuevo campo para la contraseña
}, {
    timestamps: true, // Agrega campos de fecha de creación y actualización automáticamente
});

// Método para encriptar la contraseña antes de guardar el usuario
UsuarioSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Método para comparar contraseñas
UsuarioSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);