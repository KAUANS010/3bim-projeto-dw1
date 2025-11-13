/*
const express = require('express');
const router = express.Router();
const controller = require('../controllers/loginautenticacaoController');

// Rotars de autenticação usadas pelo frontend
router.get('/',controller.teste);
router.post('/login', controller.login);
router.post('/register', controller.register);
router.get('/checksession', controller.checksession);
router.post('/logout', controller.logout);

module.exports = router;
*/




const express = require('express');
const router = express.Router();
const loginautenticacaoController = require('../controllers/loginautenticacaoController');

// Rotas de autenticação

router.get('/', loginautenticacaoController.abrirTelaLogin);

router.post('/verificarEmail', loginautenticacaoController.verificarEmail);
router.post('/verificarSenha', loginautenticacaoController.verificarSenha);
router.get('/verificaSeUsuarioEstaLogado', loginautenticacaoController.verificaSeUsuarioEstaLogado);
router.get('/logout', loginautenticacaoController.logout);

// Rotas 
router.get('/', loginautenticacaoController.listarPessoas);
router.post('/', loginautenticacaoController.criarPessoa);
router.get('/:id', loginautenticacaoController.obterPessoa);
// router.put('/:id', loginautenticacaoController.atualizarPessoa);
// router.delete('/:id', loginautenticacaoController.deletarPessoa);

module.exports = router;
