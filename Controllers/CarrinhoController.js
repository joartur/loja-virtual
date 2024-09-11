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
  
      // Verificar se ainda há estoque disponível
      if (produto.quant <= 0) {
        req.flash('message', 'Produto indisponível.');
        return res.redirect(`/produtos/${produtoId}`);
      }
  
      // Verificar se o produto já está no carrinho
      const carrinhoItem = await Carrinho.findOne({ where: { ProdutoId: produtoId, UserId: userId } });
  
      if (carrinhoItem) {
        // Atualizar quantidade no carrinho
        carrinhoItem.quantity += 1;
        await carrinhoItem.save();
      } else {
        // Adicionar novo item no carrinho
        await Carrinho.create({ ProdutoId: produtoId, UserId: userId, quantity: 1 });
      }
  
      // Atualizar a quantidade no estoque
      produto.quant -= 1;
      await produto.save();
  
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

  static async atualizarProduto(req, res) {
    const produtoId = req.params.id;
    const userId = req.session.userid;
    const { action } = req.body;  // Verifica se é aumentar ou diminuir a quantidade
  
    try {
      // Buscar o item do carrinho
      const item = await Carrinho.findOne({ where: { ProdutoId: produtoId, UserId: userId } });
  
      if (!item) {
        req.flash('message', 'Item não encontrado no carrinho.');
        return res.redirect('/carrinho');
      }
  
      // Buscar o produto
      const produto = await Produto.findByPk(produtoId);
  
      if (!produto) {
        req.flash('message', 'Produto não encontrado.');
        return res.redirect('/carrinho');
      }
  
      // Verificar se a ação é aumentar ou diminuir a quantidade
      if (action === 'increase') {
        // Verificar se há estoque disponível
        if (produto.quant <= 0) {
          req.flash('message', 'Produto indisponível.');
          return res.redirect('/carrinho');
        }
        item.quantity += 1;
        produto.quant -= 1;  // Diminuir o estoque do produto
      } else if (action === 'decrease' && item.quantity > 1) {
        item.quantity -= 1;
        produto.quant += 1;  // Aumentar o estoque do produto
      } else if (action === 'decrease' && item.quantity === 1) {
        // Se a quantidade for 1 e o botão de diminuir for clicado, remova o item
        await item.destroy();
        produto.quant += 1;  // Aumentar o estoque do produto
        req.flash('message', 'Produto removido do carrinho.');
        return res.redirect('/carrinho');
      }
  
      // Salvar a nova quantidade no carrinho e atualizar o estoque do produto
      await item.save();
      await produto.save();
  
      req.flash('message', 'Quantidade atualizada com sucesso!');
      res.redirect('/carrinho');
    } catch (err) {
      console.error(err);
      req.flash('message', 'Erro ao atualizar a quantidade.');
      res.redirect('/carrinho');
    }
  }

  static async removeProduto(req, res) {
    const produtoId = req.params.id;
    const userId = req.session.userid;
  
    try {
      const item = await Carrinho.findOne({ where: { ProdutoId: produtoId, UserId: userId } });
  
      if (!item) {
        req.flash('message', 'Item não encontrado no carrinho.');
        return res.redirect('/carrinho');
      }
  
      // Remover o item do carrinho
      await item.destroy();
  
      // Atualizar a quantidade de estoque do produto
      const produto = await Produto.findByPk(produtoId);
      produto.quant += item.quantity; // Incrementa a quantidade do produto removido
      await produto.save();
  
      req.flash('message', 'Produto removido do carrinho com sucesso!');
      res.redirect('/carrinho');
    } catch (err) {
      console.error('Erro ao remover o produto do carrinho:', err);
      req.flash('message', 'Erro ao remover o produto do carrinho.');
      res.redirect('/carrinho');
    }
  }
}

module.exports = CarrinhoController;