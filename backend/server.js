const express = require('express');
const app = express();
const path = require('path');



const cors = require('cors');



const cookieParser = require('cookie-parser');
const session = require('express-session');

// Importar a configuração do banco PostgreSQL
const db = require('./database'); // Ajuste o caminho conforme necessário

// Configurações do servidor - quando em produção, você deve substituir o IP e a porta pelo do seu servidor remoto
//const HOST = '192.168.1.100'; // Substitua pelo IP do seu servidor remoto
const HOST = 'localhost'; // Para desenvolvimento local
const PORT_FIXA = 3001; // Porta fixa

// serve a pasta frontend como arquivos estáticos

// serve a pasta frontend como arquivos estáticos

const caminhoFrontend = path.join(__dirname, '../frontend');
console.log('Caminho frontend:', caminhoFrontend);

app.use(express.static(caminhoFrontend));



app.use(cookieParser());

// adicionar session middleware (colocar antes das rotas)
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'troque_essa_chave_em_producao',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8,
    sameSite: 'none', // permite enviar cookie em requests cross-origin (apenas para DEV)
    secure: false     // em produção com sameSite:'none' deve ser true e usar HTTPS
  }
}));
// servir assets públicos (session-manager.js)
app.use('/public', express.static(path.join(__dirname, 'public')));


// --- INÍCIO DA ALTERAÇÃO ---

// Middleware para permitir CORS (Cross-Origin Resource Sharing)
// AQUI VOCÊ LISTA AS ORIGENS DO SEU FRONTEND (Onde o login.html está rodando)
const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:3001', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS origin:', origin); // DEBUG: mostra qual origin está chegando
    // Permite requisições sem 'origin' (curl, Postman, etc)
    if (!origin) return callback(null, true);

    // Em desenvolvimento, permitir qualquer origin para facilitar (remova/ajuste em produção)
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Em produção apenas orígens listadas
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'A política de CORS para este site não permite acesso da Origem especificada.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // Permite o envio de cookies (sessão)
}));

// --- FIM DA ALTERAÇÃO ---


// Middleware para interpretar o corpo das requisições como JSON
app.use(express.json());


// 1. Importa o arquivo que define as rotas de login, logout, etc.
//const loginautenticacaoRoutes = require('./routes/loginautenticacaoRoutes');

// 2. Diz ao Express para usar essas rotas.
//app.use(loginautenticacaoRoutes);


// --- INÍCIO DA ALTERAÇÃO ---
// O BLOCO DE CÓDIGO MANUAL DE CORS QUE ESTAVA AQUI FOI REMOVIDO.
// Ele era redundante com o 'app.use(cors({...}))' acima e causava conflito.
// --- FIM DA ALTERAÇÃO ---


// Middleware para adicionar a instância do banco de dados às requisições
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Middlewares
// app.use(express.json()); // <-- REMOVIDO DAQUI, pois já foi definido lá em cima (linha 79)

// Middleware de tratamento de erros JSON malformado
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON malformado',
      message: 'Verifique a sintaxe do JSON enviado'
    });
  }
  next(err);
});

// só mexa nessa parte
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Importando as rotas
// const loginRoutes = require('./routes/loginRoutes');
// app.use('/login', loginRoutes);

const menuRoutes = require('./routes/menuRoutes');
app.use('/menu', menuRoutes);

const pessoaRoutes = require('./routes/pessoaRoutes');
app.use('/pessoa', pessoaRoutes);

const produtoRoutes = require('./routes/produtoRoutes');
app.use('/produto', produtoRoutes);

const cargoRoutes = require('./routes/cargoRoutes');
app.use('/cargo', cargoRoutes);

const pedidoRoutes = require('./routes/pedidoRoutes');
app.use('/pedido', pedidoRoutes);

const pedidohasprodutoRoutes = require('./routes/pedidohasprodutoRoutes');
app.use('/pedidohasproduto', pedidohasprodutoRoutes);

const formadepagamentoRoutes = require('./routes/formadepagamentoRoutes');
app.use('/formadepagamento', formadepagamentoRoutes);

const loginautenticacaoRoutes = require('./routes/loginautenticacaoRoutes');
app.use('/login', loginautenticacaoRoutes);
+app.use('/', loginautenticacaoRoutes);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Rota padrão
app.get('/', (req, res) => {
  res.json({
    message: 'O server está funcionando - essa é a rota raiz!',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString()
  });
});


// Rota para testar a conexão com o banco
app.get('/health', async (req, res) => {
  try {
    const connectionTest = await db.testConnection();

    if (connectionTest) {
      res.status(200).json({
        status: 'OK',
        message: 'Servidor e banco de dados funcionando',
        database: 'PostgreSQL',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        status: 'ERROR',
        message: 'Problema na conexão com o banco de dados',
        database: 'PostgreSQL',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Erro no health check:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Erro interno do servidor',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);

  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado',
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe`,
    timestamp: new Date().toISOString()
  });
});



// Inicialização do servidor
const startServer = async () => {
  try {
    // Testar conexão com o banco antes de iniciar o servidor
    console.log(caminhoFrontend);
    console.log('Testando conexão com PostgreSQL...');
    const connectionTest = await db.testConnection();

    if (!connectionTest) {
      console.error('❌ Falha na conexão com PostgreSQL');
      process.exit(1);
    }

    console.log('✅ PostgreSQL conectado com sucesso');

    const PORT = process.env.PORT || PORT_FIXA;

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
      console.log(`📊 Health check disponível em http://${HOST}:${PORT}/health`);
      console.log(`🗄️ Banco de dados: PostgreSQL`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Tratamento de sinais para encerramento graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Encerrando servidor...');

  try {
    await db.pool.end();
    console.log('✅ Conexões com PostgreSQL encerradas');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao encerrar conexões:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 SIGTERM recebido, encerrando servidor...');

  try {
    await db.pool.end();
    console.log('✅ Conexões com PostgreSQL encerradas');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao encerrar conexões:', error);
    process.exit(1);
  }
});

// Iniciar o servidor
startServer();