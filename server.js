const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const devRoutes = require('./routes/devroutes');
const path = require('path');

// Crear la app
const app = express();

// Configuración de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
connectDB();

// Middleware para leer formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'clave_secreta_segura',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 2 }
}));

// 🔥 Middleware global para pasar el usuario a todas las vistas
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

// Rutas
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/dev', devRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.render('index');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
