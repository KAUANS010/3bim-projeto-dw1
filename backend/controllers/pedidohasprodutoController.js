//import { query } from '../database.js';
const { query } = require('../database');
// Funções do controller

const path = require('path');

exports.abrirCrudpedidohasproduto = (req, res) => {
 // console.log('pedidohasprodutoController - Rota /abrirCrudpedidohasproduto - abrir o crudpedidohasproduto');
  res.sendFile(path.join(__dirname, '../../frontend/pedidohasproduto/pedidohasproduto.html'));
}

exports.listarpedidohasprodutos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pedidohasproduto ORDER BY pedidoidpedido');
   // console.log('Resultado do SELECT:', result.rows);//verifica se está retornando algo
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pedidohasprodutos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}


/////////////////////////////////////////////////////////////////////
// Função para criar um novo item de pedido
///////////////////////////////////////////////////////////////////// 
// Função para criar um novo item de pedido no banco de dados.
exports.criarpedidohasproduto = async (req, res) => {
  try {
    const { pedidoidpedido, produtoidproduto, quantidade, precounitario } = req.body;

    // Verifica se os dados necessários foram fornecidos.
    if (!pedidoidpedido || !produtoidproduto || !quantidade || !precounitario) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios: pedidoidpedido, produtoidproduto, quantidade, precounitario.' });
    }

    // Você pode adicionar mais verificações aqui, por exemplo,
    // se o pedido e o produto existem.

    // Executa a query de inserção.
    const result = await query(
      'INSERT INTO pedidohasproduto (pedidoidpedido, produtoidproduto, quantidade, precounitario) VALUES ($1, $2, $3,$4) RETURNING *',
      [pedidoidpedido, produtoidproduto, quantidade, precounitario]
    );


    // Retorna o item recém-criado.
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pedidohasproduto:', error);

    // Trata erros de PK duplicada (se a combinação de pedido_id e produto_id já existe).
    if (error.code === '23505') {
      return res.status(409).json({ error: 'O item do pedido já existe. Use a função de atualização para modificar.' });
    }

    // Trata erros de foreign key (se o pedido ou produto não existirem).
    if (error.code === '23503') {
      return res.status(400).json({ error: 'O ID do pedido ou do produto não existe.' });
    }

    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


/////////////////////////////////////////////////////////////////////
// função para obter itens de um pedido específico
/////////////////////////////////////////////////////////////////////

exports.obterItensDeUmpedidohasproduto = async (req, res) => {
  try {
    console.log("Requisição recebida para obter itens de um pedido especifico: rota pedidohasproduto/:idPedido");
    // 1. Extrai o ID do pedido dos parâmetros da requisição
    const { idPedido } = req.params;

    // 2. A query SQL com o parâmetro seguro ($1)
    const result = await query(
      'SELECT php.pedidoidpedido , php.produtoidproduto , nomeproduto , php.quantidade , php.precounitario' +
      ' FROM pedidohasproduto php, produto p ' +
      ' WHERE php.pedidoidpedido = $1 and  php.produtoidproduto = p.idproduto ORDER BY php.produtoidproduto;',
      [idPedido]
    );

    // 4. Verifica se foram encontrados itens
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Nenhum item encontrado para este pedido.' });
    }

    // 5. Retorna os itens encontrados
    res.status(200).json(result.rows);

  } catch (error) {
    // 6. Em caso de erro, retorna uma mensagem de erro genérica
    console.error('Erro ao obter itens do pedido:', error);
    res.status(500).json({ message: 'Erro ao processar a requisição.', error: error.message });
  }
};

exports.obterpedidohasproduto = async (req, res) => {
  try {
    console.log("Requisição recebida para obter pedidohasproduto (chave composta): rota pedidohasproduto/:idpedido/:idproduto");
    
    //chave composta idpedido e idproduto
    const { idpedido, idproduto } = req.params;
    const idPedido = parseInt(idpedido);
    const idProduto = parseInt(idproduto);

    //console.log("estou no obter pedidohasproduto =>" + " IdPedido=" + idPedido + " idProduto= " + idProduto);
    // Verifica se ambos os IDs são números válidos
    if (isNaN(idPedido) || isNaN(idProduto)) {
      return res.status(400).json({ error: 'IDs devem ser números válidos' });
    }

    const result = await query(
      'SELECT php.pedidoidpedido , php.produtoidproduto , nomeproduto , php.quantidade , php.precounitario' +
      ' FROM pedidohasproduto php, produto p ' +
      ' WHERE php.pedidoidpedido = $1 AND php.produtoidproduto=$2 AND php.produtoidproduto = p.idproduto;',
      [idPedido, idProduto]
    );

    //console.log(result)

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'pedidohasproduto não encontrado' });
    }

    res.json(result.rows); //retorna todos os itens do pedido
  } catch (error) {
    console.error('Erro ao obter pedidohasproduto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarpedidohasproduto = async (req, res) => {
  try {
    // Imprime todos os parâmetros da requisição para debugar
    console.log("---------------rota atualizar produto ------------------------");
    // console.log("Requisição recebida para atualizar item:");
    // console.log("Parâmetros da URL (req.params):", req.params);
    // console.log("Corpo da requisição (req.body):", req.body);
    // console.log("---------------------------------------");

    // Extraímos ambos os IDs dos parâmetros da requisição, considerando a PK composta
    const { idpedido, idproduto } = req.params;
    const dadosParaAtualizar = req.body;

    //    console.log("idpedido:", idpedido, "idproduto:", idproduto);
    //    console.log("dadosParaAtualizar:", dadosParaAtualizar);

    // Verifica se ambos os IDs são números válidos
    if (isNaN(parseInt(idpedido)) || isNaN(parseInt(idproduto))) {
      return res.status(400).json({ error: 'IDs devem ser números válidos' });
    }

    // Verifica se a pedidohasproduto existe  


    // Verifica se a pedidohasproduto existe
    const existingPersonResult = await query(
      'SELECT * FROM pedidohasproduto WHERE pedidoidpedido = $1 AND produtoidproduto = $2',
      [idpedido, idproduto]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'pedidohasproduto não encontrado' });
    }

    // Constrói a query de atualização dinamicamente para campos idpedido, idproduto, quantidade, precounitario  
    const updatedFields = {};
    if (dadosParaAtualizar.quantidade !== undefined) {
      updatedFields.quantidade = dadosParaAtualizar.quantidade;
    }
    if (dadosParaAtualizar.precounitario !== undefined) {
      updatedFields.precounitario = dadosParaAtualizar.precounitario;
    }

    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
    }

    // console.log("Campos a serem atualizados:", updatedFields);
    //  console.log("ID da pedidohasproduto a ser atualizada:", idpedido, idproduto);


    // Atualiza a pedidohasproduto
    const updateResult = await query( // Ajuste na query para considerar a PK composta
      'UPDATE pedidohasproduto SET quantidade = $1, precounitario = $2 WHERE pedidoidpedido = $3 AND produtoidproduto = $4 RETURNING *',
      [updatedFields.quantidade, updatedFields.precounitario, idpedido, idproduto]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pedidohasproduto:', error);


    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarpedidohasproduto = async (req, res) => {
  try {
    // 1. Extraímos ambos os IDs da chave primária composta da URL
    const { idpedido, idproduto } = req.params;

    // Imprime os IDs para depuração
    console.log("---------------- rota deletar pedido -----------------------");
    // console.log("Requisição recebida para deletar item:");
    // console.log("Parâmetros da URL (req.params):", req.params);
    // console.log("---------------------------------------");

    // 2. Verifica se ambos os IDs são números válidos
    if (isNaN(parseInt(idpedido)) || isNaN(parseInt(idproduto))) {
      return res.status(400).json({ error: 'IDs de pedido e produto devem ser números válidos.' });
    }

    // 3. Verifica se o item do pedido existe antes de tentar deletar
    const existingItemResult = await query(
      'SELECT * FROM pedidohasproduto WHERE pedidoidpedido = $1 AND produtoidproduto = $2',
      [idpedido, idproduto]
    );

    if (existingItemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item do pedido não encontrado.' });
    }

    // 4. Deleta o item usando a chave primária composta
    const deleteResult = await query(
      'DELETE FROM pedidohasproduto WHERE pedidoidpedido = $1 AND produtoidproduto = $2',
      [idpedido, idproduto]
    );

    // Se a deleção foi bem-sucedida (uma linha afetada), retorna 204
    if (deleteResult.rowCount > 0) {
      res.status(204).send();
    } else {
      // Caso raro, se a verificação inicial passou mas a deleção não afetou nenhuma linha
      res.status(404).json({ error: 'Item do pedido não encontrado para exclusão.' });
    }

  } catch (error) {
    console.error('Erro ao deletar item do pedido:', error);

    // A maioria dos erros aqui será interna, já que a verificação de FK não se aplica
    // diretamente, pois a tabela de junção não tem dependentes.
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

