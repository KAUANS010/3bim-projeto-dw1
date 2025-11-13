// A linha 'const bcrypt = require('bcrypt');' FOI REMOVIDA
// A linha 'const SALT_ROUNDS = 10;' FOI REMOVIDA
const { query } = require('../database');
exports.teste = async (req, res) => {
  console.log("chegou aqui");

}

exports.register = async (req, res) => {
  try {
    const { nome, email, senha, tipo = 'cliente' } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ message: 'Campos obrigatórios faltando' });

    // --- ALTERAÇÃO AQUI ---
    // Trocamos o 'bcrypt.hash' para usar a função 'crypt' do pgcrypto
    // Isso garante que os novos usuários sejam salvos no mesmo formato do seu gerente
    const result = await query(
      'INSERT INTO "users" (email, nome, senha, tipo) VALUES ($1, $2, crypt($3, gen_salt(\'bf\')), $4) RETURNING cduser, email, nome, tipo',
      [email, nome, senha, tipo] // Passamos a senha em texto plano
    );
    // --- FIM DA ALTERAÇÃO ---

    // cria sessão automaticamente
    req.session.user = { id: result.rows[0].cduser, email: result.rows[0].email, nome: result.rows[0].nome, tipo: result.rows[0].tipo };

    res.status(201).json({ cduser: result.rows[0].cduser, email: result.rows[0].email, nome: result.rows[0].nome, tipo: result.rows[0].tipo });
  } catch (err) {
    if (err && err.code === '23505') return res.status(400).json({ message: 'Email já cadastrado' });
    console.error('Erro register:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
};

exports.login = async (req, res) => {
  console.log("chegou no login ")
  console.log('login request - body:', req.body);
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: 'Email e senha são obrigatórios' });

    // --- ALTERAÇÃO PRINCIPAL AQUI ---
    // 1. A query SQL foi alterada.
    //    - Ela não seleciona mais a senha (mais seguro).
    //    - Ela usa 'senha = crypt($2, senha)' para pedir ao PostgreSQL para comparar a senha.
    //    - $1 é o email, $2 é a senha em texto plano.
    const result = await query(
      'SELECT cduser, email, nome, tipo FROM "users" WHERE email = $1 AND senha = crypt($2, senha)',
      [email, senha] // Passa o email e a senha
    );
    // --- FIM DA ALTERAÇÃO ---

    // Se result.rows.length for 0, significa que o email ou a senha estavam errados.
    if (result.rows.length === 0) {
      // console.log("não")
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // 2. A verificação com bcrypt foi REMOVIDA, pois o banco já fez.

    // O usuário retornado pela query já está validado.
    const user = result.rows[0];
    //console.log("sla") --- passou
    // 3. Cria a sessão
    req.session.user = { id: user.cduser, email: user.email, nome: user.nome, tipo: user.tipo };
    //console.log("session.user") --- passou
    // 4. Retorna os dados do usuário (sem a senha)
    res.json({ id: user.cduser, email: user.email, nome: user.nome, tipo: user.tipo });
    //console.log("json") --- passou
  } catch (err) {
    console.error('Erro login:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
};

exports.checkSession = (req, res) => {
   // DEBUG: logs detalhados para inspecionar a requisição e a sessão
  console.log('--- checkSession chamado ---');
  console.log('method:', req.method, 'url:', req.originalUrl);
  console.log('headers.cookie:', req.headers && req.headers.cookie);
  console.log('req.cookies:', req.cookies);
  console.log('sessionID:', req.sessionID);
  console.log('req.session (raw):', req.session);
  console.log('req.session.user:', req.session && req.session.user);

  
  if (req.session && req.session.user) {
    return res.json({ logado: true, user: req.session.user });
  } else {
    return res.json({ logado: false });
  }
};

// Função de logout que estava faltando
exports.isAuthenticated = (req, res, next) => {
  console.log("isauthenticated")
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ message: 'Não autorizado: É necessário estar logado.' });
};

exports.isGerente = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.tipo === 'gerente') {
    return next();
  }
  res.status(403).json({ message: 'Acesso negado: Você precisa ser um gerente para acessar esta página.' });
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao fazer logout' });
    }
    res.clearCookie('sid'); // Limpa o cookie de sessão
    res.json({ message: 'Logout bem-sucedido' });
  });
};