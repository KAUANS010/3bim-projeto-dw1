const { query } = require('../database');
const path = require('path');

exports.abrirCrudPedido = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pedido/pedido.html'));
}

exports.listarPedidos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pedido ORDER BY idpedido');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.criarPedido = async (req, res) => {
  try {
    const { datadopedido, clientepessoacdpessoa, funcionariopessoacdpessoa } = req.body;

    // Validação dos campos obrigatórios
    if (!datadopedido || !clientepessoacdpessoa || !funcionariopessoacdpessoa) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const result = await query(
      'INSERT INTO pedido (datadopedido, clientepessoacdpessoa, funcionariopessoacdpessoa) VALUES ($1, $2, $3) RETURNING *',
      [datadopedido, clientepessoacdpessoa, funcionariopessoacdpessoa]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);

    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterPedido = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM pedido WHERE idpedido = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarPedido = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const { datadopedido, clientepessoacdpessoa, funcionariopessoacdpessoa } = req.body;

    // Verifica se o pedido existe
    const existing = await query('SELECT * FROM pedido WHERE idpedido = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    // Atualiza o pedido
    const sql = `
      UPDATE pedido
      SET datadopedido = $1,
          clientepessoacdpessoa = $2,
          funcionariopessoacdpessoa = $3
      WHERE idpedido = $4
      RETURNING *
    `;
    const values = [datadopedido, clientepessoacdpessoa, funcionariopessoacdpessoa, id]; 

    const updateResult = await query(sql, values);
    return res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.deletarPedido = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Verifica se o pedido existe
    const existingPersonResult = await query(
      'SELECT * FROM pedido WHERE idpedido = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Deleta o pedido (as constraints CASCADE cuidarão das dependências)
    await query(
      'DELETE FROM pedido WHERE idpedido = $1',
      [id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar pedido com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}