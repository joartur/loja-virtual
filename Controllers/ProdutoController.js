const Produto = require('../models/Produto')
const User = require('../models/User')
const { Op } = require('sequelize')

class ProdutoController {

    static teste(req,res){
        res.status(401).json({message: 'Testando a rota'})
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
    
        const limit = 1; 
        const page = parseInt(req.query.page) || 1; 
    
        const { count, rows: produtosData } = await Produto.findAndCountAll({
            include: User,
            where: {
                title: { [Op.like]: `%${search}%` }
            },
            order: [['createdAt', order]],
            limit: limit,
            offset: (page - 1) * limit,
        });
    
        const produtos = produtosData.map((resultado) => resultado.get({ plain: true }));
    
        let produtosQty = produtos.length;
        const totalPages = Math.ceil(count / limit);
    
        res.render('produtos/home', {
            produtos,
            search,
            produtosQty,
            totalPages,
            currentPage: page,
            order,
        });
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
    
        const produtos = user.produtos.map((resultado) => resultado.dataValues);
    
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
    
    
    static createProduto(req,res){
        res.render('produtos/create')
    }

    static async createProdutoSave(req,res){
        const produto = {
            title: req.body.title,
            UserId: req.session.userid
        }

        await Produto.create(produto);
        req.flash('message', 'Pensamento criado com sucesso!')
        req.session.save(()=>{
            res.redirect('/produtos/dashboard')
        })
    }

    static async removeProduto(req, res){
        const id = req.body.id;
        const UserId = req.session.userid;

        await Produto.destroy({where: {id:id, UserId: UserId}})

        req.flash('message', 'Pensamento removido com sucesso!')
        req.session.save(()=>{
            res.redirect('/produtos/dashboard')
        })
    }

        static async updateProduto(req,res){
            const id = req.params.id;
            const produto = await Produto.findOne({where: {id:id}, raw: true});
            res.render('produtos/edit', {produto})
        }

        static async updateProdutoSave(req,res){
            const id = req.body.id;

            const produto = {
                title: req.body.title
            }

            await Produto.update(produto, {where: {id:id}})

            req.flash('message', 'Pensamento atualizado com sucesso!')
            
            req.session.save(()=>{
                res.redirect('/produtos/dashboard')
            })
        }

}

module.exports = ProdutoController