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

mostrarBotoes(true, false, false, false, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
bloquearCampos(false);//libera pk e bloqueia os demais campos

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
        if (index === 0) {
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

    bloquearCampos(false);
    searchId.focus();
    try {
        const response = await fetch(`${API_BASE_URL}/pessoa/${id}`);

        if (response.ok) {
            const pessoa = await response.json();
            preencherFormulario(pessoa);

            mostrarBotoes(true, false, true, true, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
            mostrarMensagem('Pessoa encontrada!', 'success');

        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false); //mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
            mostrarMensagem('Pessoa não encontrada. Você pode incluir uma nova pessoa.', 'info');
            bloquearCampos(false);//bloqueia a pk e libera os demais campos
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
    mostrarCamposFuncionario(pessoa.isFuncionario, pessoa.funcionario);

    // Checkbox cliente
    document.getElementById('checkboxCliente').checked = pessoa.isCliente;
}

// Adicione estas funções após preencherFormulario:
function mostrarCamposFuncionario(mostrar, funcionario) {
    let container = document.getElementById('camposFuncionario');
    if (!container) {
        container = document.createElement('div');
        container.id = 'camposFuncionario';
        document.querySelector('.umParaum').appendChild(container);
    }
    container.innerHTML = mostrar ? `
        <label>Salário: <input type="number" id="salarioFuncionario" value="${funcionario?.salario || ''}"></label>
        <label>Cargo: <select id="cargoFuncionario"></select></label>
    ` : '';
    if (mostrar) carregarCargos(funcionario?.cargosidcargo);
}

async function carregarCargos(cargoSelecionado) {
    const res = await fetch(`${API_BASE_URL}/cargo`);
    const cargos = await res.json();
    const select = document.getElementById('cargoFuncionario');
    select.innerHTML = cargos.map(c => `<option value="${c.idcargo}" ${c.idcargo == cargoSelecionado ? 'selected' : ''}>${c.nomecargo}</option>`).join('');
}

// Evento para mostrar/ocultar campos de funcionário
document.getElementById('checkboxFuncionario').addEventListener('change', e => {
    mostrarCamposFuncionario(e.target.checked);
});

// Função para incluir pessoa
async function incluirPessoa() {
    mostrarMensagem('Digite os dados!', 'success');
    currentPersonId = searchId.value;
    // console.log('Incluir nova pessoa - currentPersonId: ' + currentPersonId);
    limparFormulario();
    searchId.value = currentPersonId;
    bloquearCampos(true);

    mostrarBotoes(false, false, false, false, true, true); // mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    document.getElementById('nomepessoa').focus();
    operacao = 'incluir';
    // console.log('fim nova pessoa - currentPersonId: ' + currentPersonId);
}

// Função para alterar pessoa
async function alterarPessoa() {
    mostrarMensagem('Digite os dados!', 'success');
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    document.getElementById('nomepessoa').focus();
    operacao = 'alterar';
}

// Função para excluir pessoa
async function excluirPessoa() {
    mostrarMensagem('Excluindo pessoa...', 'info');
    currentPersonId = searchId.value;
    //bloquear searchId
    searchId.disabled = true;
    bloquearCampos(false); // libera os demais campos
    mostrarBotoes(false, false, false, false, true, true);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)           
    operacao = 'excluir';
}

async function salvarOperacao() {
    //console.log('Operação:', operacao + ' - currentPersonId: ' + currentPersonId + ' - searchId: ' + searchId.value);

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
        if (operacao === 'incluir') {
            const response = await fetch(`${API_BASE_URL}/pessoa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosEnvio)
            });

            if (response.ok) {
                const resultado = await response.json();
                mostrarMensagem('Pessoa criada com sucesso!', 'success');
                carregarpessoa(); // Recarregar a lista
            } else {
                const erro = await response.json();
                mostrarMensagem(erro.error || 'Erro ao criar pessoa', 'error');
                return;
            }

        } else if (operacao === 'alterar') {
            // Para alteração, mantemos a lógica existente por enquanto
            const response = await fetch(`${API_BASE_URL}/pessoa/${currentPersonId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosEnvio) // <-- CERTO, envia todos os dados necessários
            });

            if (response.ok) {
                mostrarMensagem('Pessoa alterada com sucesso!', 'success');
                carregarpessoa(); // Recarregar a lista
            } else {
                const erro = await response.json();
                mostrarMensagem(erro.error || 'Erro ao alterar pessoa', 'error');
                return;
            }

        } else if (operacao === 'excluir') {
            const response = await fetch(`${API_BASE_URL}/pessoa/${currentPersonId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                mostrarMensagem('Pessoa excluída com sucesso!', 'success');
                carregarpessoa(); // Recarregar a lista
            } else {
                const erro = await response.json();
                mostrarMensagem(erro.error || 'Erro ao excluir pessoa', 'error');
                return;
            }
        }

        // Resetar formulário após sucesso
        limparFormulario();
        currentPersonId = null;
        operacao = null;

    } catch (error) {
        console.error('Erro na operação:', error);
        mostrarMensagem('Erro na comunicação com o servidor', 'error');
        return;
    }

    mostrarBotoes(true, false, false, false, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    bloquearCampos(false);//libera pk e bloqueia os demais campos
    document.getElementById('searchId').focus();
}

// Função para cancelar operação
function cancelarOperacao() {
    limparFormulario();
    mostrarBotoes(true, false, false, false, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    bloquearCampos(false);//libera pk e bloqueia os demais campos
    document.getElementById('searchId').focus();
    mostrarMensagem('Operação cancelada', 'info');
}

// Função para carregar lista de pessoa
async function carregarpessoa() {
    try {
        const response = await fetch(`${API_BASE_URL}/pessoa`);

        if (response.ok) {
            const pessoa = await response.json();
            renderizarTabelapessoa(pessoa);
        } else {
            throw new Error('Erro ao carregar pessoa');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de pessoa', 'error');
    }
}

// Função para renderizar tabela de pessoa
function renderizarTabelapessoa(pessoa) {
    pessoaTableBody.innerHTML = '';

    pessoa.sort((a, b) => Number(a.cdpessoa) - Number(b.cdpessoa));

    pessoa.forEach(pessoa => {
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
