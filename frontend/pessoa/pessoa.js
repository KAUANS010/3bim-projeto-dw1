// Configuração da API, IP e porta.
const API_BASE_URL = 'http://localhost:3001';
let currentPersonId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('pessoaForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const pessoaTableBody = document.getElementById('pessoaTableBody');
const messageContainer = document.getElementById('messageContainer');

// Carregar lista de pessoa ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarpessoa();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarPessoa);
btnIncluir.addEventListener('click', incluirPessoa);
btnAlterar.addEventListener('click', alterarPessoa);
btnExcluir.addEventListener('click', excluirPessoa);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

// Evento para mostrar/ocultar campos de funcionário
document.getElementById('checkboxFuncionario').addEventListener('change', e => {
    // ALTERAÇÃO 2.1: Garante que os campos apareçam editáveis se a operação for 'incluir' ou 'alterar'
    const isEditing = operacao === 'incluir' || operacao === 'alterar';
    mostrarCamposFuncionario(e.target.checked, null, isEditing);
});


mostrarBotoes(true, false, false, false, false, false); // mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
bloquearCampos(false); //libera pk e bloqueia os demais campos

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}

function bloquearCampos(bloquearPrimeiro) {
    const inputs = document.querySelectorAll('input, select,checkbox'); // Seleciona todos os inputs e selects do DOCUMENTO
    inputs.forEach((input, index) => {
        // console.log(`Input ${index}: ${input.name}, disabled: ${input.disabled}`);
        if (input.id === 'searchId') {
            // Primeiro elemento - bloqueia se bloquearPrimeiro for true, libera se for false
            input.disabled = bloquearPrimeiro;
        } else {
            // Demais elementos - faz o oposto do primeiro
            input.disabled = !bloquearPrimeiro;
        }
    });
}

// Função para limpar formulário
function limparFormulario() {
    form.reset();
    document.getElementById('checkboxFuncionario').checked = false;
    document.getElementById('checkboxCliente').checked = false;
    // ALTERAÇÃO 2.2: Garante que os campos de funcionário sejam removidos ao limpar/cancelar
    mostrarCamposFuncionario(false);
}

function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

// Função para formatar data para exibição
function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Função para converter data para formato ISO
function converterDataParaISO(dataString) {
    if (!dataString) return null;
    return new Date(dataString).toISOString();
}

// Função para buscar pessoa por ID
async function buscarPessoa() {
    const id = searchId.value.trim();
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }
    
    operacao = null; // Reseta a operação
    bloquearCampos(false);
    searchId.focus();
    try {
        const response = await fetch(`${API_BASE_URL}/pessoa/${id}`);

        if (response.ok) {
            const pessoa = await response.json();
            preencherFormulario(pessoa);

            mostrarBotoes(true, false, true, true, false, false); // mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
            mostrarMensagem('Pessoa encontrada!', 'success');

        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false); //mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
            mostrarMensagem('Pessoa não encontrada. Você pode incluir uma nova pessoa.', 'info');
            bloquearCampos(false); //bloqueia a pk e libera os demais campos
            //enviar o foco para o campo de nome
        } else {
            throw new Error('Erro ao buscar pessoa');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar pessoa', 'error');
    }
}

// Função para preencher formulário com dados da pessoa
function preencherFormulario(pessoa) {
    currentPersonId = pessoa.cdpessoa;
    searchId.value = pessoa.cdpessoa;
    document.getElementById('nomepessoa').value = pessoa.nomepessoa || '';

    // Formatação da data para input type="date"
    if (pessoa.datanascimentopessoa) {
        const data = new Date(pessoa.datanascimentopessoa);
        const dataFormatada = data.toISOString().split('T')[0];
        document.getElementById('datanascimentopessoa').value = dataFormatada;
    } else {
        document.getElementById('datanascimentopessoa').value = '';
    }

    // Checkbox funcionário e campos extras
    const chkFuncionario = document.getElementById('checkboxFuncionario');
    chkFuncionario.checked = pessoa.isFuncionario;

    // ALTERAÇÃO 2.3: Mostra os campos do funcionário como desabilitados (apenas leitura) após a busca.
    // O terceiro parâmetro (isEditing) controla se os campos estarão habilitados ou não.
    mostrarCamposFuncionario(pessoa.isFuncionario, pessoa.funcionario, false);

    // Checkbox cliente
    document.getElementById('checkboxCliente').checked = pessoa.isCliente;
}


// ALTERAÇÃO 2.4: A função agora aceita um parâmetro 'isEditing'
function mostrarCamposFuncionario(mostrar, funcionario, isEditing = false) {
    let container = document.getElementById('camposFuncionario');
    if (!container) {
        container = document.createElement('div');
        container.id = 'camposFuncionario';
        // Ajuste para inserir o container dentro do div 'funcionario' para manter a organização
        document.querySelector('.funcionario').appendChild(container);
    }

    // O atributo 'disabled' é adicionado aos campos se isEditing for falso
    container.innerHTML = mostrar ? `
        <label>Salário: <input type="number" id="salarioFuncionario" value="${funcionario?.salario || ''}" ${!isEditing ? 'disabled' : ''}></label>
        <label>Cargo: <select id="cargoFuncionario" ${!isEditing ? 'disabled' : ''}></select></label>
    ` : '';

    if (mostrar) {
        carregarCargos(funcionario?.cargosidcargo);
    }
}

async function carregarCargos(cargoSelecionado) {
    try {
        const res = await fetch(`${API_BASE_URL}/cargo`);
        const cargos = await res.json();
        const select = document.getElementById('cargoFuncionario');
        if (select) {
            select.innerHTML = cargos.map(c => `<option value="${c.idcargo}" ${c.idcargo == cargoSelecionado ? 'selected' : ''}>${c.nomecargo}</option>`).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar cargos:', error);
        mostrarMensagem('Erro ao carregar lista de cargos', 'error');
    }
}

// Função para incluir pessoa
async function incluirPessoa() {
    operacao = 'incluir'; // Define a operação ANTES de qualquer manipulação de UI
    currentPersonId = searchId.value;
    
    limparFormulario();
    searchId.value = currentPersonId;
    
    mostrarMensagem('Digite os dados para inclusão!', 'info');
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nomepessoa').focus();
}

// Função para alterar pessoa
async function alterarPessoa() {
    operacao = 'alterar';
    mostrarMensagem('Altere os dados desejados e salve!', 'info');
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nomepessoa').focus();

    // ALTERAÇÃO 2.5: Habilita os campos de funcionário (se existirem) ao entrar no modo de alteração
    const salarioInput = document.getElementById('salarioFuncionario');
    const cargoSelect = document.getElementById('cargoFuncionario');
    if (salarioInput) salarioInput.disabled = false;
    if (cargoSelect) cargoSelect.disabled = false;
}

// Função para excluir pessoa
async function excluirPessoa() {
    operacao = 'excluir';
    mostrarMensagem('Confirme a exclusão clicando em Salvar.', 'warning');
    // Apenas mostra os botões de confirmação, não altera os campos
    mostrarBotoes(false, false, false, false, true, true);
}

async function salvarOperacao() {
    const formData = new FormData(form);
    const pessoa = {
        cdpessoa: searchId.value,
        nomepessoa: formData.get('nomepessoa'),
        datanascimentopessoa: formData.get('datanascimentopessoa') || null
    };

    // Determinar o tipo de pessoa
    const tipos = [];
    if (document.getElementById('checkboxFuncionario').checked) {
        tipos.push('funcionario');
    }
    if (document.getElementById('checkboxCliente').checked) {
        tipos.push('cliente');
    }

    // Dados específicos para funcionário (pegando dos inputs dinâmicos)
    let dadosFuncionario = null;
    if (tipos.includes('funcionario')) {
        dadosFuncionario = {
            salario: Number(document.getElementById('salarioFuncionario')?.value) || 0,
            cargosidcargo: Number(document.getElementById('cargoFuncionario')?.value) || 1
        };
    }

    // Dados específicos para cliente
    let dadosCliente = null;
    if (tipos.includes('cliente')) {
        dadosCliente = {
            datadecadastrocliente: new Date().toISOString().split('T')[0]
        };
    }

    // Preparar dados para envio
    const dadosEnvio = {
        ...pessoa,
        tipo: tipos.length > 0 ? tipos : null,
        dadosFuncionario,
        dadosCliente
    };

    try {
        let response;
        let successMessage = '';

        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/pessoa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosEnvio)
            });
            successMessage = 'Pessoa criada com sucesso!';
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/pessoa/${currentPersonId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosEnvio)
            });
            successMessage = 'Pessoa alterada com sucesso!';
        } else if (operacao === 'excluir') {
            response = await fetch(`${API_BASE_URL}/pessoa/${currentPersonId}`, {
                method: 'DELETE'
            });
            successMessage = 'Pessoa excluída com sucesso!';
        } else {
            return; // Nenhuma operação definida
        }

        if (response.ok) {
            mostrarMensagem(successMessage, 'success');
            carregarpessoa();
        } else {
            const erro = await response.json();
            mostrarMensagem(erro.error || `Erro na operação de ${operacao}`, 'error');
            return; // Retorna para não limpar o formulário e permitir correção
        }

    } catch (error) {
        console.error('Erro na operação:', error);
        mostrarMensagem('Erro na comunicação com o servidor', 'error');
        return;
    }

    // Resetar estado da aplicação após sucesso
    limparFormulario();
    currentPersonId = null;
    operacao = null;
    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    document.getElementById('searchId').focus();
    searchId.value = '';
}

// Função para cancelar operação
function cancelarOperacao() {
    limparFormulario();
    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    searchId.value = '';
    document.getElementById('searchId').focus();
    mostrarMensagem('Operação cancelada', 'info');
    operacao = null;
    currentPersonId = null;
}

// Função para carregar lista de pessoa
async function carregarpessoa() {
    try {
        const response = await fetch(`${API_BASE_URL}/pessoa`);
        if (response.ok) {
            const pessoas = await response.json();
            renderizarTabelapessoa(pessoas);
        } else {
            throw new Error('Erro ao carregar pessoas');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de pessoas', 'error');
    }
}

// Função para renderizar tabela de pessoa
function renderizarTabelapessoa(pessoas) {
    pessoaTableBody.innerHTML = '';
    pessoas.sort((a, b) => Number(a.cdpessoa) - Number(b.cdpessoa));
    pessoas.forEach(pessoa => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button class="btn-id" onclick="selecionarPessoa(${pessoa.cdpessoa})">
                    ${pessoa.cdpessoa}
                </button>
            </td>
            <td>${pessoa.nomepessoa}</td>
            <td>${formatarData(pessoa.datanascimentopessoa)}</td>                 
        `;
        pessoaTableBody.appendChild(row);
    });
}

// Função para selecionar pessoa da tabela
async function selecionarPessoa(id) {
    searchId.value = id;
    await buscarPessoa();
}