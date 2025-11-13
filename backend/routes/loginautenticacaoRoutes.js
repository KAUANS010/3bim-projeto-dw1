const express = require('express');
const router = express.Router();
const controller = require('../controllers/loginautenticacaoController');

// Rotars de autenticação usadas pelo frontend
router.get('/',controller.teste);
router.post('/login', controller.login);
router.post('/register', controller.register);
router.get('/check-session', controller.checkSession);
router.post('/logout', controller.logout);

module.exports = router;