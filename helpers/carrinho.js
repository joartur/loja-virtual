const Carrinho = require('../models/Carrinho');
const Produto = require('../models/Produto');

// Função para obter a quantidade de produtos no carrinho do usuário
async function getQuantidadeProdutos(userId) {
    try {
      const carrinho = await Carrinho.findAll({
        where: { UserId: userId }
      });
  
      const quantidadeProdutos = carrinho.reduce((acc, item) => acc + item.quantity, 0);
  
      console.log('Quantidade de produtos:', quantidadeProdutos); // Verifique o valor aqui
  
      return quantidadeProdutos;
    } catch (err) {
      console.error('Erro ao obter a quantidade de produtos no carrinho:', err);
      return 0;
    }
  }

module.exports = { getQuantidadeProdutos };