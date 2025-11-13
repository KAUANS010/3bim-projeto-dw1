-- =========================
-- CRIAÇÃO DO BANCO DE DADOS
-- =========================
-- Descomente as linhas abaixo se quiser recriar o schema
--DROP SCHEMA public CASCADE;
--CREATE SCHEMA public;

-- Conecte-se ao banco de dados desejado antes de executar

-- =========================
-- TABELAS
-- =========================

CREATE TABLE pessoa (
    cdpessoa VARCHAR(20) PRIMARY KEY,
    nomepessoa VARCHAR(60),
    datanascimentopessoa DATE
);

CREATE TABLE cliente (
    pessoacdpessoa VARCHAR(20) PRIMARY KEY REFERENCES pessoa(cdpessoa),
    datadecadastrocliente DATE
);

CREATE TABLE cargo (
    idcargo SERIAL PRIMARY KEY,
    nomecargo VARCHAR(45)
);

CREATE TABLE funcionario (
    pessoacdpessoa VARCHAR(20) PRIMARY KEY REFERENCES pessoa(cdpessoa),
    salario DOUBLE PRECISION,
    cargosidcargo INT REFERENCES cargo(idcargo)
);

CREATE TABLE produto (
    idproduto SERIAL PRIMARY KEY,
    nomeproduto VARCHAR(45),
    quantidadeemestoque INT,
    precounitario DOUBLE PRECISION
);

CREATE TABLE pedido (
    idpedido SERIAL PRIMARY KEY,
    datadopedido DATE,
    clientepessoacdpessoa VARCHAR(20) REFERENCES cliente(pessoacdpessoa),
    funcionariopessoacdpessoa VARCHAR(20) REFERENCES funcionario(pessoacdpessoa)
);

CREATE TABLE pedidohasproduto (
    produtoidproduto INT REFERENCES produto(idproduto),
    pedidoidpedido INT REFERENCES pedido(idpedido),
    quantidade INT,
    precounitario DOUBLE PRECISION,
    PRIMARY KEY (produtoidproduto, pedidoidpedido)
);

CREATE TABLE formadepagamento (
    idformapagamento SERIAL PRIMARY KEY,
    nomeformapagamento VARCHAR(100)
);

CREATE TABLE pagamento (
    pedidoidpedido INT PRIMARY KEY REFERENCES pedido(idpedido),
    datapagamento TIMESTAMP,
    valortotalpagamento DOUBLE PRECISION
);

CREATE TABLE pagamentohasformapagamento (
    pagamentoidpedido INT REFERENCES pagamento(pedidoidpedido),
    formapagamentoidformapagamento INT REFERENCES formadepagamento(idformapagamento),
    valorpago DOUBLE PRECISION,
    PRIMARY KEY (pagamentoidpedido, formapagamentoidformapagamento)
);


-- habilita pgcrypto (necessário para crypt())
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- tabela users baseada no seu pedido
CREATE TABLE IF NOT EXISTS "users" (
  cduser SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  senha TEXT NOT NULL, -- armazenará hash (bcrypt via pgcrypto)
  tipo TEXT NOT NULL CHECK (tipo IN ('cliente','funcionario','gerente')),
  quandocriado TIMESTAMP DEFAULT NOW()
);



-- =========================
-- POPULAÇÃO DAS TABELAS
-- =========================

-- Pessoa
INSERT INTO pessoa VALUES
('1','Ana Silva','1990-01-10'),
('2','Bruno Souza','1985-02-15'),
('3','Carlos Pereira','1992-03-20'),
('4','Daniela Costa','1995-04-25'),
('5','Eduardo Lima','1988-05-30'),
('6','Fernanda Rocha','1991-06-10'),
('7','Gustavo Alves','1993-07-12'),
('8','Helena Dias','1996-08-14'),
('9','Igor Martins','1994-09-16'),
('10','Juliana Torres','1997-10-18');

-- Cliente
INSERT INTO cliente VALUES
('1','2023-01-01'),
('2','2023-02-01'),
('3','2023-03-01'),
('4','2023-04-01'),
('5','2023-05-01'),
('6','2023-06-01'),
('7','2023-07-01'),
('8','2023-08-01'),
('9','2023-09-01'),
('10','2023-10-01');

-- Cargo
INSERT INTO cargo (nomecargo) VALUES
('Vendedor'),
('Gerente'),
('Caixa'),
('Supervisor'),
('Assistente'),
('Estoquista'),
('RH'),
('Financeiro'),
('TI'),
('Marketing');

-- Funcionario
INSERT INTO funcionario VALUES
('1',2000,1),
('2',5000,2),
('3',1800,3),
('4',3000,4),
('5',2200,5),
('6',2500,6),
('7',3500,7),
('8',2700,8),
('9',4000,9),
('10',2800,10);

-- Produto
INSERT INTO produto (nomeproduto, quantidadeemestoque, precounitario) VALUES
('Nike Air Max',50,699.90),
('Adidas Ultraboost',40,799.90),
('Puma Suede Classic',60,399.90),
('Converse Chuck Taylor',80,299.90),
('Vans Old Skool',70,349.90),
('Mizuno Wave Prophecy',30,999.90),
('Asics Gel Nimbus',35,899.90),
('New Balance 574',55,449.90),
('Fila Disruptor II',45,379.90),
('Reebok Classic Leather',65,329.90);

-- Pedido
INSERT INTO pedido (datadopedido, clientepessoacdpessoa, funcionariopessoacdpessoa) VALUES
('2023-01-05','1','2'),
('2023-02-10','3','4'),
('2023-03-15','5','6'),
('2023-04-20','7','8'),
('2023-05-25','9','10'),
('2023-06-30','1','3'),
('2023-07-10','2','5'),
('2023-08-15','3','7'),
('2023-09-18','4','9'),
('2023-10-22','5','1');

-- PedidoHasProduto (CORRIGIDO - com preços e quantidades realistas)
INSERT INTO pedidohasproduto VALUES
(1,1,1,699.90),  -- 1 Nike Air Max por R$ 699,90
(2,2,1,799.90),  -- 1 Adidas Ultraboost por R$ 799,90
(3,3,2,399.90),  -- 2 Puma Suede Classic por R$ 399,90 cada
(4,4,1,299.90),  -- 1 Converse Chuck Taylor por R$ 299,90
(5,5,1,349.90),  -- 1 Vans Old Skool por R$ 349,90
(6,6,1,999.90),  -- 1 Mizuno Wave Prophecy por R$ 999,90
(7,7,1,899.90),  -- 1 Asics Gel Nimbus por R$ 899,90
(8,8,1,449.90),  -- 1 New Balance 574 por R$ 449,90
(9,9,2,379.90),  -- 2 Fila Disruptor II por R$ 379,90 cada
(10,10,1,329.90); -- 1 Reebok Classic Leather por R$ 329,90

-- FormaDePagamento
INSERT INTO formadepagamento (nomeformapagamento) VALUES
('Dinheiro'),
('Cartao Debito'),
('Cartao Credito'),
('Pix'),
('Boleto'),
('Transferencia'),
('Vale Alimentacao'),
('Cheque'),
('Criptomoeda'),
('Carteira Digital');

-- Pagamento (CORRIGIDO - valores compatíveis com os produtos)
INSERT INTO pagamento VALUES
(1,'2023-01-06 10:00:00',699.90),   -- Nike Air Max: 1 × 699.90
(2,'2023-02-11 11:00:00',799.90),   -- Adidas Ultraboost: 1 × 799.90
(3,'2023-03-16 14:00:00',799.80),   -- Puma Suede Classic: 2 × 399.90
(4,'2023-04-21 15:30:00',299.90),   -- Converse Chuck Taylor: 1 × 299.90
(5,'2023-05-26 16:45:00',349.90),   -- Vans Old Skool: 1 × 349.90
(6,'2023-06-30 17:00:00',999.90),   -- Mizuno Wave Prophecy: 1 × 999.90
(7,'2023-07-11 12:20:00',899.90),   -- Asics Gel Nimbus: 1 × 899.90
(8,'2023-08-16 13:10:00',449.90),   -- New Balance 574: 1 × 449.90
(9,'2023-09-19 14:40:00',759.80),   -- Fila Disruptor II: 2 × 379.90
(10,'2023-10-23 09:25:00',329.90);  -- Reebok Classic Leather: 1 × 329.90

-- PagamentoHasFormaPagamento (CORRIGIDO - valores compatíveis)
INSERT INTO pagamentohasformapagamento VALUES
(1,1,699.90),  -- Pagamento completo em dinheiro
(2,2,799.90),  -- Pagamento completo no cartão débito
(3,3,799.80),  -- Pagamento completo no cartão crédito
(4,4,299.90),  -- Pagamento completo via Pix
(5,5,349.90),  -- Pagamento completo via boleto
(6,6,999.90),  -- Pagamento completo via transferência
(7,7,899.90),  -- Pagamento completo via vale alimentação
(8,8,449.90),  -- Pagamento completo via cheque
(9,9,759.80),  -- Pagamento completo via criptomoeda
(10,10,329.90); -- Pagamento completo via carteira digital


-- ================================================================
--      CRIAÇÃO E POPULAÇÃO DA TABELA DE USUÁRIOS
-- ================================================================

-- cria a tabela "users" que foi excluída.
-- A estrutura deve corresponder ao que o backend espera.
CREATE TABLE "users" (
    cduser SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'cliente' -- (gerente, funcionario, cliente)
);

-- Passo 1: Garantir que a extensão pgcrypto está habilitada
-- (Necessário para a função crypt())
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Passo 2: Limpar a tabela "users" para recomeçar do zero
-- RESTART IDENTITY zera o contador do cduser (serial)
TRUNCATE "users" RESTART IDENTITY CASCADE;

-- Passo 3: Criar o usuário GERENTE (Kauan)
-- Conforme seu pedido: A senha em texto puro será 'admin'
INSERT INTO "users" (email, nome, senha, tipo) VALUES
('kauan@loja.com', 'Kauan (Gerente)', crypt('admin', gen_salt('bf')), 'gerente');

-- Passo 4: Popular "users" com dados dos FUNCIONÁRIOS
-- A senha será: 'funcionario' + o 'cdpessoa' do funcionário
-- Ex: Se Bruno Souza for cdpessoa='123', sua senha será 'funcionario123'
INSERT INTO "users" (email, nome, senha, tipo)
SELECT
  concat('func', p.cdpessoa, '@loja.com') AS email,
  p.nomepessoa AS nome,
  crypt(concat('funcionario', p.cdpessoa), gen_salt('bf')) AS senha,
  'funcionario' AS tipo
FROM funcionario f
JOIN pessoa p ON f.pessoacdpessoa = p.cdpessoa
ON CONFLICT (email) DO NOTHING; -- Não faz nada se o email já existir

-- Passo 5: Popular "users" com dados dos CLIENTES
-- A senha será: 'cliente' + o 'cdpessoa' do cliente
-- Ex: Se Ana Silva for cdpessoa='456', sua senha será 'cliente456'
INSERT INTO "users" (email, nome, senha, tipo)
SELECT
  concat('cliente', p.cdpessoa, '@loja.com') AS email,
  p.nomepessoa AS nome,
  crypt(concat('cliente', p.cdpessoa), gen_salt('bf')) AS senha,
  'cliente' AS tipo
FROM cliente c
JOIN pessoa p ON c.pessoacdpessoa = p.cdpessoa
ON CONFLICT (email) DO NOTHING; -- Não faz nada se o email já existir

-- Passo 6: Verificar os dados (Opcional)
-- Você verá que a coluna "senha" agora tem códigos longos. ISSO ESTÁ CORRETO.
SELECT email, nome, tipo, senha FROM "users";