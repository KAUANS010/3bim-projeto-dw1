const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Rota para abrir o menu (GET /menu/)
router.get('/', menuController.abrirMenu);

// Rota de logout (POST /menu/logout) — mantém compatibilidade com o controller atual
router.post('/logout', menuController.logout);

// Exporta o router corretamente
module.exports = router;