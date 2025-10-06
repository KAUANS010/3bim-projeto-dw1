//import { query } from '../database.js';
const { query } = require('../database');
// Funções do controller

const path = require('path');

exports.abrirCrudProduto = (req, res) => {
  console.log('produtoController - Rota /abrirCrudProduto - abrir o crudProduto');
  res.sendFile(path.join(__dirname, '../../frontend/produto/produto.html'));
}

exports.listarProdutos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM produto ORDER BY idproduto');
    // console.log('Resultado do SELECT:', result.rows);//verifica se está retornando algo
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.criarProduto = async (req, res) => {
  //  console.log('Criando produto com dados:', req.body);
  try {
    const { idproduto, nomeproduto, quantidadeemestoque, precounitario} = req.body;

    // Validação básica
    if (!nomeproduto) {
      return res.status(400).json({
        error: 'Texto, nota máxima e texto complementar são obrigatórios'
      });
    }

    const result = await query(
      'INSERT INTO produto (idproduto, nomeproduto, quantidadeemestoque, precounitario ) VALUES ($1, $2, $3, $4) RETURNING *',
      [idproduto, nomeproduto, quantidadeemestoque, precounitario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar produto:', error);


    // Verifica se é erro de violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterProduto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM produto WHERE idproduto = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarProduto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nomeproduto} = req.body;

   
    // Verifica se a produto existe
    const existingPersonResult = await query(
      'SELECT * FROM produto WHERE idproduto = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrada' });
    }

    // Constrói a query de atualização dinamicamente para campos não nulos
    const currentPerson = existingPersonResult.rows[0];
    const updatedFields = {
      nomeproduto: nomeproduto !== undefined ? nomeproduto : currentPerson.nomeproduto     
    };
 
    // Atualiza a produto
    const updateResult = await query(
      'UPDATE produto SET nomeproduto = $1 WHERE idproduto = $2 RETURNING *',
      [updatedFields.nomeproduto, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarProduto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Verifica se a produto existe
    const existingPersonResult = await query(
      'SELECT * FROM produto WHERE idproduto = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrada' });
    }

    // Deleta a produto (as constraints CASCADE cuidarão das dependências)
    await query(
      'DELETE FROM produto WHERE idproduto = $1',
      [id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar produto:', error);

    // Verifica se é erro de violação de foreign key (dependências)
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar produto com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

