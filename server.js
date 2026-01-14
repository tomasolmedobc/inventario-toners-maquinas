const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');

// Rutas
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const devRoutes = require('./routes/devroutes');
const dashboardRoutes = require('./routes/dashboard');

// Controladores
const { mostrarInicio } = require('./controllers/indexController');
const { verificarSesion } = require('./middleware/auth'); // Middleware para proteger rutas

// Inicializar Express
const app = express();

// Configurar variables de entorno
dotenv.config();

// Conectar a MongoDB
connectDB();


// Vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware para parseo de datos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Archivos estáticos
app.use(express.static('public'));

// Configurar sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'clave_secreta_segura',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 horas
}));

// Middleware global para vistas (usuario logueado)
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

// Rutas principales
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/dev', devRoutes);
app.use('/dashboard', dashboardRoutes);

// Ruta raíz protegida (dashboard principal)
app.get('/', verificarSesion, mostrarInicio);

// --- 🔴 Manejo de errores 404 ---
app.use((req, res, next) => {
  res.status(404).render('404', {
    titulo: 'Página no encontrada',
    mensaje: 'La página que buscas no existe.'
  });
});

//  Manejo de errores generales ---
app.use((err, req, res, next) => {
  console.error('🛑 Error del servidor:', err);
  res.status(500).render('500', {
    titulo: 'Error del servidor',
    mensaje: 'Ocurrió un error interno. Intenta más tarde.'
  });
});

// Configurar puerto y host
const HOST = '0.0.0.0'; // Esto escucha en todas las interfaces de red
const PORT = 5000;

app.listen(PORT, HOST, () => {
    console.log(`✅ Servidor corriendo en http://${require('os').networkInterfaces().eth0?.[0]?.address || '10.240.21.226'}:${PORT}`);
});