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

// Función para normalizar el origen (eliminar la barra final)
const normalizeOrigin = (origin) => {
  return origin.endsWith("/") ? origin.slice(0, -1) : origin;
};

// Configuración de CORS para local y servidor
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL_DEV,
      process.env.FRONTEND_URL_PROD,
    ];

    // Normalizar los orígenes permitidos
    const normalizedAllowedOrigins = allowedOrigins.map(normalizeOrigin);

    // Normalizar el origen de la solicitud
    const normalizedOrigin = normalizeOrigin(origin);

    // Verificar si el origen está permitido
    if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
      callback(null, true); // Permitir el origen
    } else {
      callback(new Error("Origen no permitido por CORS")); // Rechazar el origen
    }
  },
  methods: "GET,POST,PUT,DELETE", // Métodos permitidos
  allowedHeaders: "Content-Type,Authorization", // Cabeceras permitidas
  credentials: true, // Permitir credenciales (cookies, tokens)
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