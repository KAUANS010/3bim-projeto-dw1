// backend/controllers/menuController.js

const path = require('path');

// Função que será chamada pela rota para abrir a página do menu
const abrirMenu = (req, res) => {
  try {
    // O ideal é que a verificação de 'gerente' já tenha sido feita pelo middleware na rota.
    // Aqui, apenas enviamos o arquivo HTML.
    const caminhoDoArquivo = path.join(__dirname, '../../frontend/menu.html');
    res.sendFile(caminhoDoArquivo);
  } catch (error) {
    console.error('Erro ao tentar servir o arquivo menu.html:', error);
    res.status(500).json({ message: 'Erro interno ao carregar a página do menu.' });
  }
};

// Função para fazer logout (embora o ideal seja centralizar isso no loginautenticacaoController)
const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao fazer logout' });
    }
    res.clearCookie('sid'); // 'sid' é o nome do cookie de sessão que você definiu no server.js
    res.json({ message: 'Logout bem-sucedido' });
  });
};

// Exportamos as funções para que as rotas possam usá-las
module.exports = {
  abrirMenu,
  logout
};