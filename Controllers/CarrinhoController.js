const Carrinho = require('../models/Carrinho');
const Produto = require('../models/Produto');

class CarrinhoController {
  // Exibir carrinho
  static async viewCarrinho(req, res) {
    const userId = req.session.userid;

    // Buscar todos os produtos do carrinho do usuário logado
    const carrinho = await Carrinho.findAll({
      where: { UserId: userId },
      include: Produto
    });

    // Criar uma nova lista com cópias dos itens, evitando propriedades de protótipo
    const carrinhoData = carrinho.map(item => ({
      Produto: {
        id: item.Produto.id,
        name: item.Produto.name,
        image: item.Produto.image,
        price: item.Produto.price,
        priceFormatted: item.Produto.priceFormatted // Verifique se isso está sendo atribuído corretamente
      },
      quantity: item.quantity
    }));
    
    // Calcular o total do carrinho
    const total = parseFloat(carrinho.reduce((acc, item) => acc + (item.Produto.price * item.quantity), 0)).toFixed(2);

    // Passe 'carrinhoData' e 'total' formatado para o template
    res.render('carrinho/view', { carrinho: carrinhoData, total });
  }

  static async getCarrinho(req, res, next) {
    try {
        const userId = req.session.userid;
        const carrinho = await Carrinho.findAll({
            where: { UserId: userId }
        });

        const quantidadeProdutos = carrinho.reduce((acc, item) => acc + item.quantity, 0);

        res.locals.quantidadeProdutos = quantidadeProdutos;
        next();
    } catch (err) {
        console.error('Erro ao obter quantidade de produtos no carrinho:', err);
        res.locals.quantidadeProdutos = 0;
        next();
    }
 }

  // Adicionar produto ao carrinho
  static async addProduto(req, res) {
    const produtoId = req.params.id;
    const userId = req.session.userid;

    try {
        const produto = await Produto.findOne({ where: { id: produtoId } });
        if (!produto) {
            console.log(`Produto não encontrado com ID: ${produtoId}`);
            return res.status(404).send('Produto não encontrado');
        }

        // Verificar se o produto já está no carrinho
        const carrinhoItem = await Carrinho.findOne({ where: { ProdutoId: produtoId, UserId: userId } });
        if (carrinhoItem) {
            // Atualizar quantidade
            carrinhoItem.quantity += 1;
            await carrinhoItem.save();
        } else {
            // Adicionar novo item no carrinho
            await Carrinho.create({ ProdutoId: produtoId, UserId: userId, quantity: 1 });
        }

        res.redirect('/carrinho');
    } catch (err) {
        console.error('Erro ao adicionar produto ao carrinho:', err);
        res.status(500).send('Erro ao adicionar produto ao carrinho');
    }
}

  // Adicionar produto ao carrinho via corpo da requisição
  static async addToCart(req, res) {
    const { id } = req.body;
    const userId = req.session.userid;

    try {
      const produto = await Produto.findByPk(id);

      if (!produto) {
        req.flash('message', 'Produto não encontrado.');
        res.redirect('/produtos');
        return;
      }

      await Carrinho.create({ ProdutoId: id, UserId: userId });
      req.flash('message', 'Produto adicionado ao carrinho!');
      res.redirect('/carrinho');
    } catch (err) {
      console.error(err);
      req.flash('message', 'Erro ao adicionar produto ao carrinho.');
      res.redirect('/produtos');
    }
  }

  static async removeProduto(req, res) {
    const produtoId = req.params.id;
    const userId = req.session.userid;

    try {
        // Encontrar o item do carrinho que deve ser removido
        const item = await Carrinho.findOne({ where: { ProdutoId: produtoId, UserId: userId } });

        if (!item) {
            req.flash('message', 'Item não encontrado no carrinho.');
            return res.redirect('/carrinho');
        }

        // Remover o item do carrinho
        await item.destroy();

        req.flash('message', 'Produto removido do carrinho com sucesso!');
        res.redirect('/carrinho');
    } catch (err) {
        console.error(err);
        req.flash('message', 'Erro ao remover o produto do carrinho.');
        res.redirect('/carrinho');
    }
 }
}

module.exports = CarrinhoController;