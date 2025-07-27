const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const passport = require('passport');
const { database } = require('./keys');

// Inicializar app
const app = express();
require('./lib/passport');

// Configuraciones
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

// Middlewares
app.use(helmet());
app.use(session({
  secret: 'enrique',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Variables globales
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.message = req.flash('message');
  res.locals.user = req.user || null;
  next();
});

// Rutas principales
app.use(require('./routes'));
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));
app.use(require('./routes/pages'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar servidor
app.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https://i.imgur.com;");
  next();
});
