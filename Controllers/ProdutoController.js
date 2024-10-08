const Produto = require('../models/Produto');
const User = require('../models/User');
const { Op } = require('sequelize');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/produtos/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

class ProdutoController {

    static async getAllProducts(req, res) {
        try {
            // Recupera todos os produtos do banco de dados
            const produtos = await Produto.findAll();
            console.log('Produtos recuperados:', produtos); // Verifique o que está sendo recuperado

            // Verifica se a lista de produtos está vazia
            const emptyProdutos = produtos.length === 0;
            res.render('produtos/dashboard', { produtos, emptyProdutos });
        } catch (err) {
            console.error('Erro ao buscar produtos:', err);
            res.status(500).send('Erro ao buscar produtos.');
        }
    }

    static async filtroProdutos(req, res) {
        const { marca, minPrice, maxPrice, categoria } = req.query;

        try {
            const produtos = await Produto.findAll({
                where: {
                    ...(marca && { marca: { [Op.like]: `%${marca}%` } }),
                    ...(minPrice && { price: { [Op.gte]: parseFloat(minPrice) } }),
                    ...(maxPrice && { price: { [Op.lte]: parseFloat(maxPrice) } }),
                    ...(categoria && { category: { [Op.like]: `%${categoria}%` } })
                },
                order: [['createdAt', 'DESC']]
            });

            res.render('produtos/filtro', {
                produtos,
                marca,
                minPrice,
                maxPrice,
                categoria
            });
        } catch (err) {
            console.error('Erro ao buscar produtos:', err);
            res.status(500).send('Erro ao buscar produtos.');
        }
    }

    static async showProdutos(req, res) {
        let search = '';
        if (req.query.search) {
            search = req.query.search;
        }
    
        let order = 'DESC';
        if (req.query.order === 'old') {
            order = 'ASC';
        }
    
        const limit = 12; 
        const page = parseInt(req.query.page) || 1; 
    
        // Buscar produtos e contar resultados
        const { count, rows: produtosData } = await Produto.findAndCountAll({
            include: User,
            where: {
                name: { [Op.like]: `%${search}%` }
            },
            order: [['createdAt', order]],
            limit: limit,
            offset: (page - 1) * limit,
        });
    
        // Mapear produtos e transformar em objeto plano
        const produtos = produtosData.map((resultado) => resultado.get({ plain: true }));
        let produtosQty = produtos.length;
        const totalPages = Math.ceil(count / limit);

        // Buscar produtos por categoria
        const produtosPorCategoria = await Produto.findAll({
            attributes: ['category'],
            group: ['category']
        });
        
        // Organizar produtos em categorias
        let categoriasProdutos = {};
        produtosPorCategoria.forEach(produto => {
            categoriasProdutos[produto.category] = produtos.filter(p => p.category === produto.category);
        });
    
        res.render('produtos/home', {
            produtos,
            search,
            produtosQty,
            totalPages,
            currentPage: page,
            order,
            categoriasProdutos
        });
    }

    static async showProduto(req, res) {
        try {
            const id = req.params.id;
    
            // Busca o produto pelo ID
            const produto = await Produto.findByPk(id);
    
            if (!produto) {
                return res.status(404).send('Produto não encontrado.');
            }
    
            // Converte o produto para um objeto plano
            const produtoData = produto.get({ plain: true });
    
            // Renderiza a view com os detalhes do produto
            res.render('produtos/produto_detalhes', { produto: produtoData });
        } catch (err) {
            console.error('Erro ao buscar produto:', err);
            res.status(500).send('Erro ao buscar produto.');
        }
    }

    static async dashboard(req, res) {
        const userId = req.session.userid;

        const limit = 1; 
        const page = req.query.page || 1; 

        const user = await User.findOne({
            where: { id: userId },
            include: {
                model: Produto,
                limit: limit,
                offset: (page - 1) * limit,
                order: [['createdAt', 'DESC']],
            },
            plain: true,
        });

        if (!user) {
            return res.redirect('/login');
        }

        if (user.userRole !== 'admin') {
            return res.redirect('/produtos'); // Redireciona se não for administrador
        }

        const produtos = user.Produtos.map((resultado) => resultado.dataValues);

        const produtosCount = await Produto.count({ where: { UserId: userId } });
        const totalPages = Math.ceil(produtosCount / limit);

        let emptyProdutos = false;
        if (produtos.length === 0) {
            emptyProdutos = true;
        }

        res.render('produtos/dashboard', {
            produtos,
            emptyProdutos,
            totalPages,
            currentPage: parseInt(page),
        });
    }

    static async detalhesProduto(req, res) {
        const produtoId = req.params.id;
        console.log(`ID do Produto recebido: ${produtoId}`);
        
        try {
            const produto = await Produto.findByPk(produtoId);
            if (!produto) {
                console.log('Produto não encontrado.');
                req.flash('message', 'Produto não encontrado.');
                return res.redirect('/produtos');
            }
    
            const produtoDetalhes = {
                id: produto.id,
                name: produto.name,
                marca: produto.marca,
                description: produto.description,
                price: produto.price,
                image: produto.image, // Certifique-se de que esta propriedade contém apenas o nome do arquivo
                quant: produto.quant,
                category: produto.category
            };
            
            res.render('produtos/produto_detalhes', { produto: produtoDetalhes });
        } catch (err) {
            console.error(err);
            req.flash('message', 'Erro ao buscar o produto.');
            res.redirect('/produtos');
        }
    }

    static async clientDashboard(req, res) {
        try {
            const userId = req.session.userid;
    
            // Recupera os produtos do usuário logado
            const produtos = await Produto.findAll({
                where: { UserId: userId },
                order: [['createdAt', 'DESC']],
            });
    
            // Verifica se a lista de produtos está vazia
            const emptyProdutos = produtos.length === 0;
    
            // Log dos produtos recuperados para depuração
            console.log('Produtos do cliente:', produtos);
    
            // Renderiza a view com os dados
            res.render('produtos/cliente_dashboard', {
                produtos: produtos.map(produto => produto.toJSON()), // Converte para JSON se necessário
                emptyProdutos,
            });
        } catch (err) {
            console.error('Erro ao buscar produtos do cliente:', err);
            res.redirect('/');
        }
    }

    static async adminDashboard(req, res) {
        try {
            // Recupera todos os produtos do banco de dados
            const produtos = await Produto.findAll({
                order: [['createdAt', 'DESC']],
            });
    
            // Verifica se a lista de produtos está vazia
            const emptyProdutos = produtos.length === 0;
    
            // Exibe no console os produtos recuperados para depuração
            console.log('Produtos:', produtos);
    
            // Renderiza a view com os dados
            res.render('produtos/admin_dashboard', {
                produtos: produtos.map(produto => produto.toJSON()), // Converte para JSON se necessário
                emptyProdutos,
            });
        } catch (err) {
            console.error('Erro ao buscar produtos:', err);
            res.status(500).send('Erro ao buscar produtos.');
        }
    }

    static createProduto(req, res) {
        res.render('produtos/create');
    }
    
    static async createProdutoSave(req, res) {
        const { name, marca, description, price, quant, category } = req.body;
        const image = req.file ? `uploads/produtos/${req.file.filename}` : null;

        try {
            await Produto.create({
                name,
                marca,
                description,
                price,
                image,
                quant,
                category,
                UserId: req.session.userid // Associe o produto ao usuário logado
            });

            req.flash('message', 'Produto adicionado com sucesso!');
            req.session.save(() => {
                res.redirect('/produtos/admin/dashboard');
            });
        } catch (err) {
            console.error(err);
            req.flash('message', 'Erro ao criar produto!');
            res.render('produtos/create');
        }
    }

    static async removeProduto(req, res) {
        const id = req.params.id; // ID do produto a ser excluído
    
        try {
            // Verifica se o produto existe
            const produto = await Produto.findByPk(id);
            if (!produto) {
                req.flash('message', 'Produto não encontrado.');
                return res.redirect('/produtos/admin/dashboard');
            }
    
            // Verifica se o usuário é administrador
            if (req.session.userRole !== 'admin') {
                req.flash('message', 'Apenas administradores podem excluir produtos.');
                return res.redirect('/produtos/admin/dashboard');
            }
    
            // Remove o produto
            await Produto.destroy({ where: { id } });
    
            req.flash('message', 'Produto excluído com sucesso!');
            res.redirect('/produtos/admin/dashboard');
        } catch (err) {
            console.error('Erro ao excluir produto:', err);
            req.flash('message', 'Erro ao excluir produto.');
            res.redirect('/produtos/admin/dashboard');
        }
    }

    static async updateProduto(req, res) {
        const id = req.params.id;
        try {
            const produto = await Produto.findOne({ where: { id: id }, raw: true });
            if (!produto) {
                req.flash('message', 'Produto não encontrado!');
                return res.redirect('/produtos/admin/dashboard');
            }
            res.render('produtos/edit', { produto });
        } catch (err) {
            console.error('Erro ao buscar produto para edição:', err);
            res.redirect('/produtos/admin/dashboard');
        }
    }

    static async updateProdutoSave(req, res) {
        const id = req.body.id;
        const produtoAtualizado = {
            name: req.body.name,
            marca: req.body.marca,
            description: req.body.description,
            price: req.body.price,
            quant: req.body.quant,
            category: req.body.category
        };

        // Atualizar imagem se um novo arquivo foi enviado
        if (req.file) {
            produtoAtualizado.image = `uploads/produtos/${req.file.filename}`;
        }

        try {
            await Produto.update(produtoAtualizado, { where: { id: id } });
            req.flash('message', 'Produto atualizado com sucesso!');
            res.redirect('/produtos/admin/dashboard');
        } catch (err) {
            console.error('Erro ao atualizar produto:', err);
            req.flash('message', 'Erro ao atualizar produto!');
            res.redirect(`/produtos/edit/${id}`);
        }
    }
}

module.exports = ProdutoController;