const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('express-flash');
const FileStore = require('session-file-store')(session);
const User = require('./models/User');
const Produto = require('./models/Produto');
const conn = require('./db/conn');
const ProdutoController = require('./Controllers/ProdutoController');
const produtosRoutes = require('./routes/produtosRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const carrinhoRoutes = require('./routes/carrinhoRoutes'); 

const handlebars = require('handlebars');
const app = express();

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

handlebars.create({
    allowProtoPropertiesByDefault: true
  });

handlebars.registerHelper('truncate', function(str, len) {
    return str.substring(0, len) + (str.length > len ? '...' : ''); // reduz o texto
  });

// Configuração do Handlebars
app.engine('handlebars', exphbs.engine({ helpers: handlebars.helpers }));
app.set('view engine', 'handlebars');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// Verificação de autenticação
const checkAuth = (req, res, next) => {
    if (req.session && req.session.userid) {
      next();
    } else {
      req.flash('message', 'Você precisa estar logado para acessar esta página.');
      res.redirect('/login');
    }
  };

app.use(flash());
app.use(express.static('public'));

app.use((req, res, next) => {
    if (req.session.userid) {
        res.locals.session = req.session;
    }
    next();
});

// Rotas
app.use('/', carrinhoRoutes);
app.use('/produtos', produtosRoutes);
app.use('/', authRoutes);
app.get('/', ProdutoController.showProdutos);
app.put('/produtos/update/:id', ProdutoController.updateProdutoSave);
app.use('/', carrinhoRoutes);
app.use('/admin', adminRoutes);

app.set('views', './views');

conn.sync()
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch((e) => {
        console.log(e);
    });

    module.exports = { checkAuth };