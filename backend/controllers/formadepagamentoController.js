//import { query } from '../database.js';
const { query } = require('../database');
// Funções do controller

const path = require('path');

exports.abrirCrudFormadepagamento = (req, res) => {
  console.log('formadepagamentoController - Rota /abrirCrudFormadepagamento - abrir o crudFormadepagamento');
  res.sendFile(path.join(__dirname, '../../frontend/formadepagamento/formadepagamento.html'));
}

exports.listarFormadepagamentos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM formadepagamento ORDER BY idformapagamento');
     console.log('Resultado do SELECT:', result.rows);//verifica se está retornando algo
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar forma de pagamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}


exports.criarFormadepagamento = async (req, res) => {
  //  console.log('Criando formadepagamento com dados:', req.body);
  try {
    const { idformapagamento, nomeformapagamento} = req.body;

    // Validação básica
    if (!nomeformapagamento) {
      return res.status(400).json({
        error: 'O nome do forma de pagamento é obrigatório'
      });
    }

    const result = await query(
      'INSERT INTO formadepagamento (idformapagamento, nomeformapagamento) VALUES ($1, $2) RETURNING *',
      [idformapagamento, nomeformapagamento]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar forma de pagamento:', error);

   

    // Verifica se é erro de violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterFormadepagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

   // console.log("estou no obter formadepagamento id="+ id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM formadepagamento WHERE idformapagamento = $1',
      [id]
    );

    //console.log(result)

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Forma de pagamento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter forma de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarFormadepagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nomeformapagamento} = req.body;

   
    // Verifica se a formadepagamento existe
    const existingPersonResult = await query(
      'SELECT * FROM formadepagamento WHERE idformapagamento = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Forma de pagamento não encontrada' });
    }

    // Constrói a query de atualização dinamicamente para campos não nulos
    const currentPerson = existingPersonResult.rows[0];
    const updatedFields = {
      nomeformapagamento: nomeformapagamento !== undefined ? nomeformapagamento : currentPerson.nomeformapagamento     
    };

    // Atualiza a formadepagamento
    const updateResult = await query(
      'UPDATE formadepagamento SET nomeformapagamento = $1 WHERE idformapagamento = $2 RETURNING *',
      [updatedFields.nomeformapagamento,  id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar forma de pagamento:', error);

  
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarFormadepagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Verifica se a formadepagamento existe
    const existingPersonResult = await query(
      'SELECT * FROM formadepagamento WHERE idformapagamento = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Forma de pagamento não encontrada' });
    }

    // Deleta a formadepagamento (as constraints CASCADE cuidarão das dependências)
    await query(
      'DELETE FROM formadepagamento WHERE idformapagamento = $1',
      [id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar forma de pagamento:', error);

    // Verifica se é erro de violação de foreign key (dependências)
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar forma de pagamento com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}


