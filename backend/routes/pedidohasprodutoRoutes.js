
const express = require('express');
const router = express.Router();
const pedidohasprodutoController = require('./../controllers/pedidohasprodutoController');

// CRUD de pedidohasprodutos
// Rotas para a PK composta: pedido_id e produto_id
router.get('/:idpedido/:idproduto', pedidohasprodutoController.obterpedidohasproduto);
router.put('/:idpedido/:idproduto', pedidohasprodutoController.atualizarpedidohasproduto);
router.delete('/:idpedido/:idproduto', pedidohasprodutoController.deletarpedidohasproduto);

// Outras rotas sem a PK composta
router.get('/abrirCrudpedidohasproduto', pedidohasprodutoController.abrirCrudpedidohasproduto);
router.get('/', pedidohasprodutoController.listarpedidohasprodutos);


// Rota para obter todos os itens de um pedido específico
router.get('/:idPedido', pedidohasprodutoController.obterItensDeUmpedidohasproduto);
router.post('/', pedidohasprodutoController.criarpedidohasproduto);

module.exports = router;
