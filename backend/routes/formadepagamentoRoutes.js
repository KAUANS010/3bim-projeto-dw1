const express = require('express');
const router = express.Router();
const formadepagamentoController = require('./../controllers/formadepagamentoController');

// CRUD de Formadepagamentos

router.get('/abrirCrudFormadepagamento', formadepagamentoController.abrirCrudFormadepagamento);
router.get('/', formadepagamentoController.listarFormadepagamentos);
router.post('/', formadepagamentoController.criarFormadepagamento);
router.get('/:id', formadepagamentoController.obterFormadepagamento);
router.put('/:id', formadepagamentoController.atualizarFormadepagamento);
router.delete('/:id', formadepagamentoController.deletarFormadepagamento);

module.exports = router;