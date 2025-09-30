//import { query } from '../database.js';
const { query } = require('../database');
// Funções do controller

const path = require('path');

exports.abrirCrudPessoa = (req, res) => {
  console.log('pessoaController - Rota /abrirCrudPessoa - abrir o crudPessoa');
  res.sendFile(path.join(__dirname, '../../frontend/pessoa/pessoa.html'));
}

exports.listarPessoa = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pessoa ORDER BY cdpessoa');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.criarPessoa = async (req, res) => {
  try {
    const { cdpessoa, nomepessoa, datanascimentopessoa, tipo, dadosFuncionario, dadosCliente } = req.body;

    if (!nomepessoa) {
      return res.status(400).json({
        error: 'Nome é obrigatório'
      });
    }

    if (!cdpessoa) {
      return res.status(400).json({
        error: 'Código da pessoa é obrigatório'
      });
    }

    // Iniciar transação
    await query('BEGIN');

    try {
      // Inserir pessoa
      const resultPessoa = await query(
        'INSERT INTO pessoa (cdpessoa, nomepessoa, datanascimentopessoa) VALUES ($1, $2, $3) RETURNING *',
        [cdpessoa, nomepessoa, datanascimentopessoa]
      );

      const pessoaCriada = resultPessoa.rows[0];

      // Se for funcionário, inserir na tabela funcionario
      if (tipo === 'funcionario' || (Array.isArray(tipo) && tipo.includes('funcionario'))) {
        const salario = dadosFuncionario?.salario || 0;
        const cargoId = dadosFuncionario?.cargosidcargo || 1; // Cargo padrão

        await query(
          'INSERT INTO funcionario (pessoacdpessoa, salario, cargosidcargo) VALUES ($1, $2, $3)',
          [cdpessoa, salario, cargoId]
        );
      }

      // Se for cliente, inserir na tabela cliente
      if (tipo === 'cliente' || (Array.isArray(tipo) && tipo.includes('cliente'))) {
        const dataCadastro = dadosCliente?.datadecadastrocliente || new Date().toISOString().split('T')[0];

        await query(
          'INSERT INTO cliente (pessoacdpessoa, datadecadastrocliente) VALUES ($1, $2)',
          [cdpessoa, dataCadastro]
        );
      }

      // Confirmar transação
      await query('COMMIT');

      res.status(201).json({
        pessoa: pessoaCriada,
        tipo: tipo,
        message: 'Pessoa criada com sucesso'
      });

    } catch (transactionError) {
      // Reverter transação em caso de erro
      await query('ROLLBACK');
      throw transactionError;
    }

  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'Código da pessoa já existe'
      });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterPessoa = async (req, res) => {
  try {
    const id = req.params.id; // cdpessoa é VARCHAR no banco

    const result = await query(
      'SELECT * FROM pessoa WHERE cdpessoa = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarPessoa = async (req, res) => {
  const id = req.params.id;
  const { nomepessoa, datanascimentopessoa, tipo, dadosFuncionario, dadosCliente } = req.body;

  try {
    await query('BEGIN');

    // Atualiza dados da pessoa
    await query(
      'UPDATE pessoa SET nomepessoa = $1, datanascimentopessoa = $2 WHERE cdpessoa = $3',
      [nomepessoa, datanascimentopessoa, id]
    );

    // Atualiza/insere/remove em funcionario
    if (tipo && tipo.includes('funcionario')) {
      // Se já existe, atualiza; se não, insere
      await query(
        `INSERT INTO funcionario (pessoacdpessoa, salario, cargosidcargo)
         VALUES ($1, $2, $3)
         ON CONFLICT (pessoacdpessoa) DO UPDATE SET salario = $2, cargosidcargo = $3`,
        [id, dadosFuncionario?.salario || 0, dadosFuncionario?.cargosidcargo || 1]
      );
    } else {
      // Remove se existir
      await query('DELETE FROM funcionario WHERE pessoacdpessoa = $1', [id]);
    }

    // Atualiza/insere/remove em cliente
    if (tipo && tipo.includes('cliente')) {
      await query(
        `INSERT INTO cliente (pessoacdpessoa, datadecadastrocliente)
         VALUES ($1, $2)
         ON CONFLICT (pessoacdpessoa) DO UPDATE SET datadecadastrocliente = $2`,
        [id, dadosCliente?.datadecadastrocliente || new Date()]
      );
    } else {
      await query('DELETE FROM cliente WHERE pessoacdpessoa = $1', [id]);
    }

    await query('COMMIT');
    res.json({ message: 'Pessoa atualizada com sucesso!' });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Erro ao atualizar pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.deletarPessoa = async (req, res) => {
  try {
    const id = req.params.id; // cdpessoa é VARCHAR

    const existingPersonResult = await query(
      'SELECT * FROM pessoa WHERE cdpessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    await query(
      'DELETE FROM pessoa WHERE cdpessoa = $1',
      [id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pessoa:', error);
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar pessoa com dependências associadas'
      });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}