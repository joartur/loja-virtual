const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('express-flash');
const FileStore = require('session-file-store')(session);
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./db/conn');
const User = require('./models/User');
const Produto = require('./models/Produto');
const conn = require('./db/conn');
const produtosRoutes = require('./routes/produtosRoutes');
const ProdutoController = require('./Controllers/ProdutoController');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/admin');
const clienteRoutes = require('./routes/cliente');

const handlebars = require('handlebars');
const app = express();

app.set('view engine', 'handlebars');

app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: 'segredo_secreto',
  store: new SequelizeStore({ db: sequelize }),
  resave: false,
  saveUninitialized: false,
}));

app.use('/admin', adminRoutes);
app.use('/cliente', clienteRoutes);

// Registre os helpers
handlebars.registerHelper('subtract', (a, b) => a - b);
handlebars.registerHelper('add', (a, b) => a + b);
handlebars.registerHelper('range', (start, end) => {
    const range = [];
    for (let i = start; i <= end; i++) {
        range.push(i);
    }
    return range;
});
handlebars.registerHelper('gt', (a, b) => a > b);
handlebars.registerHelper('eq', (a, b) => a === b);
handlebars.registerHelper('lt', (a, b) => a < b); 

// Configuração do Handlebars
app.engine('handlebars', exphbs.engine({ helpers: handlebars.helpers }));
app.set('view engine', 'handlebars');


// Middleware
app.use(express.urlencoded({ extended: true }));

app.use(session({
    name: "session",
    secret: "nosso_secret",
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
        logFn: function(){},
        path: require('path').join(require('os').tmpdir(), 'sessions')
    }),
    cookie: {
        secure: false,
        maxAge: 3600000,
        expires: new Date(Date.now() + 3600000),
        httpOnly: true
    }
}));

app.use(flash());
app.use(express.static('public'));

app.use((req, res, next) => {
    if (req.session.userid) {
        res.locals.session = req.session;
    }
    next();
});

// Rotas
app.use('/produtos', produtosRoutes);
app.use('/', authRoutes);
app.get('/', ProdutoController.showProdutos);

conn.sync()
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch((e) => {
        console.log(e);
    });
