// models/usuarios.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const UsuarioSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    profile: { type: String, required: true },
    department: { type: String, required: true },
    tower: { type: String, required: true },
    password: { type: String, required: true }, 
    token: { type: String }, // Campo para almacenar el token
    userId: { type: String, unique: true, default: uuidv4 }, // Agregamos el campo userId
}, {
    timestamps: true, 
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

// Crear el modelo Usuario
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Exportar el modelo
module.exports = Usuario;