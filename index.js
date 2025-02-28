require("dotenv").config();
const express = require("express");
const cors = require("cors"); // Importar CORS
const connectDB = require("./db");
const multas = require("./src/routes/multas");
const user = require("./src/routes/user");
const notificaciones = require("./src/routes/notificaciones");
const login = require("./src/routes/login");
const verificarToken = require("./src/middleware/verificartoken");
// const allowedOrigins = ['https://daniel-condo.vercel.app', 'http://localhost:5173'];
const whatsapp = require("./src/routes/whatsapp");
const app = express();
 
// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors()); // Habilitar CORS
app.use(express.json());

// app.use((req, res, next) => {
//    const origin = req.headers.origin;
//        if (allowedOrigins.includes(origin)) {
//         next();
//     } else {
//        res.status(403).json({ error: 'Acceso no permitido' });
//     } });

// Rutas sin autenticación (login no necesita verificar token)
app.use("/api", login);
app.use("/api", whatsapp);

// Rutas que requieren autenticación
app.use("/api", verificarToken, multas);
app.use("/api", verificarToken, user);
app.use("/api", verificarToken, notificaciones);


// Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
