const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('express-flash');
const FileStore = require('session-file-store')(session);
const User = require('./models/User');
const Produto = require('./models/Produto');
const conn = require('./db/conn');
const ProdutoController = require('./Controllers/ProdutoController');
const AdminController = require('./Controllers/AdminController');
const CarrinhoController = require('./Controllers/CarrinhoController');
const handlebars = require('./helpers/handlebarsHelpers');
const produtosRoutes = require('./routes/produtosRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const carrinhoRoutes = require('./routes/carrinhoRoutes');
const { getQuantidadeProdutos } = require('./helpers/carrinho');
const path = require('path');

const app = express();

// Configuração do Handlebars
app.engine('handlebars', exphbs.engine({ helpers: handlebars.helpers }));
app.set('view engine', 'handlebars');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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

app.use(AdminController.layout);

app.use(flash());
app.use(express.static('public'));

app.use((req, res, next) => {
    if (req.session.userid) {
        res.locals.session = req.session;
    }
    next();
});

app.use(async (req, res, next) => {
    if (req.session.userid) {
      const quantidadeProdutos = await getQuantidadeProdutos(req.session.userid);
      res.locals.quantidadeProdutos = quantidadeProdutos;
    } else {
      res.locals.quantidadeProdutos = 0; // Garantir que a variável seja definida mesmo quando o usuário não está logado
    }
    next();
  });

// Rotas
app.use('/', authRoutes);
app.use('/', carrinhoRoutes);
app.use('/admin', adminRoutes);
app.use('/produtos', produtosRoutes);
app.get('/', ProdutoController.showProdutos);
app.put('/produtos/update/:id', ProdutoController.updateProdutoSave);
app.use(CarrinhoController.getCarrinho);

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