require("dotenv").config();
const express = require("express");
const cors = require("cors"); // Importar CORS
const connectDB = require("./db");
const multas = require("./src/routes/multas");
const user = require("./src/routes/user");
const notificaciones = require("./src/routes/notificaciones");
const login = require("./src/routes/login");
const verificarToken = require("./src/middleware/verificartoken");

const app = express();

// Conectar a MongoDB
connectDB();

// Configuración de CORS para local y servidor
const corsOptions = {
  origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL_PROD 
    : process.env.FRONTEND_URL_DEV, 
  methods: "GET,POST,PUT,DELETE", 
  allowedHeaders: "Content-Type,Authorization", 
  credentials: true, 
};

// Middleware
app.use(cors(corsOptions)); // Habilitar CORS con opciones personalizadas
app.use(express.json());

// Rutas sin autenticación (login no necesita verificar token)
app.use("/api", login);

// Rutas que requieren autenticación
app.use("/api", verificarToken, multas);
app.use("/api", verificarToken, user);
app.use("/api", verificarToken, notificaciones);

// Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));