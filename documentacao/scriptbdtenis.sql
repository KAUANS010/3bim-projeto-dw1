-- ================================================================
-- SCRIPT ADAPTADO (SEU PROJETO + FUNCIONALIDADES DO PROFESSOR)
-- ================================================================

-- 1. Remoção de objetos existentes (Boa prática do script do professor)
-- Ordem reversa da criação para respeitar as chaves estrangeiras
DROP TABLE IF EXISTS public.pagamentohasformapagamento CASCADE;
DROP TABLE IF EXISTS public.pagamento CASCADE;
DROP TABLE IF EXISTS public.pedidohasproduto CASCADE;
DROP TABLE IF EXISTS public.pedido CASCADE;
DROP TABLE IF EXISTS public.produto CASCADE;
DROP TABLE IF EXISTS public.cliente CASCADE;
DROP TABLE IF EXISTS public.funcionario CASCADE;
DROP TABLE IF EXISTS public.cargo CASCADE;
DROP TABLE IF EXISTS public.formadepagamento CASCADE;
DROP TABLE IF EXISTS public.pessoa CASCADE;

-- habilita pgcrypto (para criptografar senhas, como no script do professor)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- 2. CRIAÇÃO DAS TABELAS
-- (Estrutura do seu script com adições do script do professor)
-- =========================

CREATE TABLE public.pessoa (
    cdpessoa VARCHAR(20) PRIMARY KEY,
    nomepessoa VARCHAR(60),
    datanascimentopessoa DATE,
    senhapessoa VARCHAR(100), -- Coluna do script do professor
    emailpessoa VARCHAR(75) UNIQUE -- Coluna do script do professor
);

CREATE TABLE public.cliente (
    pessoacdpessoa VARCHAR(20) PRIMARY KEY REFERENCES public.pessoa(cdpessoa),
    datadecadastrocliente DATE,
    rendacliente DOUBLE PRECISION -- Coluna do script do professor
);

CREATE TABLE public.cargo (
    idcargo SERIAL PRIMARY KEY,
    nomecargo VARCHAR(45)
);

CREATE TABLE public.funcionario (
    pessoacdpessoa VARCHAR(20) PRIMARY KEY REFERENCES public.pessoa(cdpessoa),
    salario DOUBLE PRECISION,
    cargosidcargo INT REFERENCES public.cargo(idcargo)
);

CREATE TABLE public.produto (
    idproduto SERIAL PRIMARY KEY,
    nomeproduto VARCHAR(45),
    quantidadeemestoque INT,
    precounitario DOUBLE PRECISION
);

CREATE TABLE public.pedido (
    idpedido SERIAL PRIMARY KEY,
    datadopedido DATE,
    clientepessoacdpessoa VARCHAR(20) REFERENCES public.cliente(pessoacdpessoa),
    funcionariopessoacdpessoa VARCHAR(20) REFERENCES public.funcionario(pessoacdpessoa)
);

CREATE TABLE public.pedidohasproduto (
    produtoidproduto INT REFERENCES public.produto(idproduto),
    pedidoidpedido INT REFERENCES public.pedido(idpedido),
    quantidade INT,
    precounitario DOUBLE PRECISION,
    PRIMARY KEY (produtoidproduto, pedidoidpedido)
);

CREATE TABLE public.formadepagamento (
    idformapagamento SERIAL PRIMARY KEY,
    nomeformapagamento VARCHAR(100)
);

CREATE TABLE public.pagamento (
    pedidoidpedido INT PRIMARY KEY REFERENCES public.pedido(idpedido),
    datapagamento TIMESTAMP,
    valortotalpagamento DOUBLE PRECISION
);

CREATE TABLE public.pagamentohasformapagamento (
    pagamentoidpedido INT REFERENCES public.pagamento(pedidoidpedido),
    formapagamentoidformapagamento INT REFERENCES public.formadepagamento(idformapagamento),
    valorpago DOUBLE PRECISION,
    PRIMARY KEY (pagamentoidpedido, formapagamentoidformapagamento)
);


-- =========================
-- 3. POPULAÇÃO DAS TABELAS
-- (Seus dados, adaptados para as novas colunas)
-- =========================

-- Pessoa (com senhapessoa e emailpessoa adicionados)
INSERT INTO public.pessoa (cdpessoa, nomepessoa, datanascimentopessoa, senhapessoa, emailpessoa) VALUES
('80','kauan','2008-08-03', 'admin', 'kauan@email.com'),
('1','Ana Silva','1990-01-10', 'senha1', 'ana@email.com'),
('2','Bruno Souza','1985-02-15', 'senha2', 'bruno@email.com'),
('3','Carlos Pereira','1992-03-20', 'senha3', 'carlos@email.com'),
('4','Daniela Costa','1995-04-25', 'senha4', 'daniela@email.com'),
('5','Eduardo Lima','1988-05-30', 'senha5', 'eduardo@email.com'),
('6','Fernanda Rocha','1991-06-10', 'senha6', 'fernanda@email.com'),
('7','Gustavo Alves','1993-07-12', 'senha7', 'gustavo@email.com'),
('8','Helena Dias','1996-08-14', 'senha8', 'helena@email.com'),
('9','Igor Martins','1994-09-16', 'senha9', 'igor@email.com'),
('10','Juliana Torres','1997-10-18', 'senha10', 'juliana@email.com');

-- Cliente (com rendacliente adicionada)
INSERT INTO public.cliente (pessoacdpessoa, datadecadastrocliente, rendacliente) VALUES
('1', '2023-01-01', 2500.00),
('2', '2023-02-01', 3200.00),
('3', '2023-03-01', 1800.00),
('4', '2023-04-01', 4000.00),
('5', '2023-05-01', 2100.00),
('6', '2023-06-01', 3500.00),
('7', '2023-07-01', 2700.00),
('8', '2023-08-01', 5000.00),
('9', '2023-09-01', 3800.00),
('10','2023-10-01', 4500.00);

-- Cargo (seus dados originais)
INSERT INTO public.cargo (nomecargo) VALUES
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

-- Funcionario (seus dados originais)
INSERT INTO public.funcionario (pessoacdpessoa, salario, cargosidcargo) VALUES
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

-- Produto (seus dados originais)
INSERT INTO public.produto (nomeproduto, quantidadeemestoque, precounitario) VALUES
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

-- Pedido (seus dados originais)
INSERT INTO public.pedido (datadopedido, clientepessoacdpessoa, funcionariopessoacdpessoa) VALUES
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

-- PedidoHasProduto (seus dados originais)
INSERT INTO public.pedidohasproduto (produtoidproduto, pedidoidpedido, quantidade, precounitario) VALUES
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

-- FormaDePagamento (seus dados originais)
INSERT INTO public.formadepagamento (nomeformapagamento) VALUES
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

-- Pagamento (seus dados originais)
INSERT INTO public.pagamento (pedidoidpedido, datapagamento, valortotalpagamento) VALUES
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

-- PagamentoHasFormaPagamento (seus dados originais)
INSERT INTO public.pagamentohasformapagamento (pagamentoidpedido, formapagamentoidformapagamento, valorpago) VALUES
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



