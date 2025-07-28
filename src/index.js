// index.js (en la raíz del proyecto)
const express       = require('express');
const morgan        = require('morgan');
const { engine }    = require('express-handlebars');
const path          = require('path');
const flash         = require('connect-flash');
const session       = require('express-session');
const MySQLStore    = require('express-mysql-session')(session);
const helmet        = require('helmet');
const passport      = require('passport');
const pool          = require('./database');    // tu pool MySQL
const { database }  = require('./keys');
const customHelpers = require('./lib/handlebars');

// 1) Importamos las preguntas estáticas desde un módulo de servidor.
//    Crea src/data/staticQuestions.js y exporta allí el array.
const staticQuestions = require('./data/staticQuestions');

const app = express();
require('./lib/passport');

// —— Settings ——
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));

// Helper para serializar a JSON desde Handlebars
customHelpers.json = obj => JSON.stringify(obj, null, 2);

app.engine('.hbs', engine({
  defaultLayout: 'main',
  layoutsDir:  path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname:     '.hbs',
  helpers:     customHelpers
}));
app.set('view engine', '.hbs');

// —— Middlewares ——
app.use(helmet());

// Sesión con store en MySQL
app.use(session({
  secret:            'enrique',
  resave:            false,
  saveUninitialized: false,
  store:             new MySQLStore(database)
}));

app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Variables globales para todas las vistas
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.message = req.flash('message');
  res.locals.user    = req.user ? JSON.parse(JSON.stringify(req.user)) : null;
  next();
});

// —— Rutas propias ——
app.use(require('./routes/profile'));
app.use(require('./routes'));
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
app.use('/links',     require('./routes/links'));
app.use(require('./routes/pages'));

// Archivos estáticos y uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// CSP: permitimos inline scripts (quiz.hbs los necesita para inyectar JSON)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https://i.imgur.com;"
  );
  next();
});

// —— Función para cargar preguntas dinámicas desde la BD ——
async function obtenerPreguntasDeLaBD() {
  const filas = await pool.query('SELECT * FROM preguntas');
  const dinámicas = [];
  for (const p of filas) {
    const opts = await pool.query(
      'SELECT texto_opcion, es_correcta, retroalimentacion FROM opciones WHERE id_pregunta = ?',
      [p.id]
    );
    dinámicas.push({
      question:      p.enunciado,
      options:       opts.map(o => o.texto_opcion),
      correctAnswer: opts.findIndex(o => o.es_correcta === 1),
      feedbacks:     opts.map(o => o.retroalimentacion || '')
    });
  }
  return dinámicas;
}

// —— Ruta que renderiza la página del quiz ——
app.get('/quiz', async (req, res) => {
  const dynamicQuestions = await obtenerPreguntasDeLaBD();
  res.render('quiz', { staticQuestions, dynamicQuestions });
});

// —— Ruta que devuelve los datos en JSON (opcional) ——
app.get('/quiz-data.json', async (req, res) => {
  const dynamicQuestions = await obtenerPreguntasDeLaBD();
  res.json({
    static:  staticQuestions,
    dynamic: dynamicQuestions
  });
});


// —— Iniciar servidor ——
app.listen(app.get('port'), () => {
  console.log('✅ Server on port', app.get('port'));
});
