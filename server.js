const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const userLocals = require('./middleware/userLocals');
const areasMiddleware = require('./middleware/areasMiddleware');
// Rutas
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const devRoutes = require('./routes/devroutes');
const dashboardRoutes = require('./routes/dashboard');

// Controladores y middleware
const { mostrarInicio } = require('./controllers/indexController');
const { verificarSesion } = require('./middleware/auth');

// Cargar variables de entorno
dotenv.config();

// Inicializar app
const app = express();

// Conectar a MongoDB (local o prod según .env)
connectDB();

// Vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'clave_local_dev',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 2 // 2 horas
    }
  })
);

app.use((req, res, next) => {
  res.locals.usuario = req.session?.usuario || null;
  next();
});



// Rutas
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/dev', devRoutes);
app.use('/dashboard', dashboardRoutes);

// Dashboard protegido
app.get(
  '/',
  verificarSesion,
  (req, res, next) => {
    if (!['user', 'jefe', 'admin'].includes(req.session.usuario.rol)) {
      return res.status(403).render('403');
    }
    next();
  },
  mostrarInicio
);


// 404
app.use((req, res) => {
  res.status(404).render('404', {
    titulo: 'Página no encontrada',
    mensaje: 'La página que buscas no existe.'
  });
});

// Error general
app.use((err, req, res, next) => {
  console.error('🛑 Error:', err);
  res.status(500).render('500', {
    titulo: 'Error del servidor',
    mensaje: 'Ocurrió un error interno'
  });
});

// Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
/*
// Configurar puerto y host
const HOST = '0.0.0.0'; // Esto escucha en todas las interfaces de red
const PORT = 5000;

app.listen(PORT, HOST, () => {
    console.log(`✅ Servidor corriendo en http://${require('os').networkInterfaces().eth0?.[0]?.address || '10.240.21.226'}:${PORT}`);
});
*/