// backend/routes/pedidohasprodutoRoutes.js

const express = require('express');
const router = express.Router();
const pedidohasprodutoController = require('../controllers/pedidohasprodutoController');

// --- ROTAS ESPECÍFICAS PRIMEIRO ---

// Rota para a página do CRUD (se houver uma)
// Ex: GET /pedidohasproduto/crud
router.get('/abrirCrudpedidohasproduto', pedidohasprodutoController.abrirCrudpedidohasproduto);

// Rota para buscar todos os itens de um pedido específico
// Tornamos a rota mais específica para evitar conflitos.
// Ex: GET /pedidohasproduto/itens-do-pedido/5
router.get('/itens-do-pedido/:idpedido', pedidohasprodutoController.obterItensDeUmpedidohasproduto);

// Rota para buscar um item específico pela chave primária composta (pedido e produto)
// Ex: GET /pedidohasproduto/item/5/10
router.get('/item/:idpedido/:idproduto', pedidohasprodutoController.obterpedidohasproduto);

// --- ROTAS GENÉRICAS DEPOIS ---

// Rota para listar TODOS os itens de TODOS os pedidos (geralmente não muito útil, mas mantendo a estrutura)
// Ex: GET /pedidohasproduto/
router.get('/', pedidohasprodutoController.listarpedidohasprodutos);

// Rota para criar um novo item de pedido
// Ex: POST /pedidohasproduto/
router.post('/', pedidohasprodutoController.criarpedidohasproduto);

// Rota para atualizar um item específico pela chave primária composta
// Ex: PUT /pedidohasproduto/item/5/10
router.put('/item/:idpedido/:idproduto', pedidohasprodutoController.atualizarpedidohasproduto);

// Rota para deletar um item específico pela chave primária composta
// Ex: DELETE /pedidohasproduto/item/5/10
router.delete('/item/:idpedido/:idproduto', pedidohasprodutoController.deletarpedidohasproduto);

module.exports = router;
