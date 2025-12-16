const URL_API = 'http://localhost:3001/produto/';
const carrosselWrapper = document.getElementById('carrossel-wrapper');
const contadorCarrinho = document.getElementById('contadorCarrinho');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Atualiza contador do carrinho
function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    contadorCarrinho.textContent = carrinho.length;
}

// Criação dos cards
function criarCardProduto(produto) {
    const card = document.createElement('div');
    card.classList.add('produto-card');

    // Base da API (remove o sufixo /produto/ se existir)
    const API_BASE = URL_API.replace(/\/produto\/?$/, '');

    const img = document.createElement('img');
    img.alt = produto.nomeproduto;
    img.className = 'card-imagem';

    // --- MUDANÇA AQUI: Agora aponta para .jpeg ---
    img.src = `${API_BASE}/imagens/produto/${produto.idproduto}.jpeg`;

    // Se der erro (imagem não existe ou extensão errada), põe a imagem padrão
    img.onerror = () => {
        img.src = 'https://via.placeholder.com/260x180?text=Sem+Imagem';
        img.onerror = null; // Evita loop infinito
    };
    // ---------------------------------------------

    const precoFormatado = produto.precounitario.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const titulo = document.createElement('div');
    titulo.className = 'card-titulo';
    titulo.textContent = produto.nomeproduto;

    const detalheId = document.createElement('div');
    detalheId.className = 'card-detalhe';
    detalheId.textContent = `ID: ${produto.idproduto}`;

    const detalheEstoque = document.createElement('div');
    detalheEstoque.className = 'card-detalhe';
    detalheEstoque.textContent = `Estoque: ${produto.quantidadeemestoque}`;

    const precoDiv = document.createElement('div');
    precoDiv.className = 'card-preco';
    precoDiv.textContent = `${precoFormatado} por par`;

    const selecao = document.createElement('div');
    selecao.className = 'card-selecao-quantidade';
    selecao.innerHTML = `<label for="qtd-${produto.idproduto}">Quantidade (pares):</label>
            <input type="number" id="qtd-${produto.idproduto}" class="input-quantidade" value="1" min="1" step="1" data-produto-id="${produto.idproduto}">`;

    const botao = document.createElement('button');
    botao.className = 'btn-carrinho';
    botao.dataset.produtoId = produto.idproduto;
    botao.textContent = 'Adicionar ao Carrinho';

    card.appendChild(img);
    card.appendChild(titulo);
    card.appendChild(detalheId);
    card.appendChild(detalheEstoque);
    card.appendChild(precoDiv);
    card.appendChild(selecao);
    card.appendChild(botao);

    return card;
}

// Adicionar ao carrinho
function adicionarAoCarrinho(produtoId) {
    const inputQtd = document.querySelector(`.input-quantidade[data-produto-id="${produtoId}"]`);
    const quantidadePares = parseInt(inputQtd.value);

    if (isNaN(quantidadePares) || quantidadePares < 1) {
        alert('Por favor, insira uma quantidade válida (mínimo 1 par).');
        return;
    }

    fetch(`${URL_API}${produtoId}`)
        .then(res => res.json())
        .then(produtoAPI => {
            const item = {
                id: produtoAPI.idproduto,
                nome: produtoAPI.nomeproduto,
                preco: produtoAPI.precounitario,
                quantidade: quantidadePares
            };

            let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
            const existente = carrinho.find(i => i.id === item.id);

            if (existente) {
                existente.quantidade += quantidadePares;
            } else {
                carrinho.push(item);
            }

            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            atualizarContadorCarrinho();
        })
        .catch(() => alert("Erro ao adicionar ao carrinho."));
}

// Renderizar os produtos
function renderizarProdutos(dados) {
    carrosselWrapper.innerHTML = '';
    dados.forEach(p => {
        const card = criarCardProduto(p);
        carrosselWrapper.appendChild(card);
    });

    document.querySelectorAll('.btn-carrinho').forEach(btn => {
        btn.addEventListener('click', e => adicionarAoCarrinho(e.target.dataset.produtoId));
    });
}

// Buscar produtos na API
async function buscarProdutos() {
    try {
        const resposta = await fetch(URL_API);
        const dados = await resposta.json();
        renderizarProdutos(dados);
    } catch {
        carrosselWrapper.innerHTML = `<div class="mensagem-info" style="color:red;">Erro ao carregar os produtos.</div>`;
    }
}

// ====== Controles do carrossel ======
prevBtn.addEventListener('click', () => {
    carrosselWrapper.scrollBy({ left: -300, behavior: 'smooth' });
});

nextBtn.addEventListener('click', () => {
    carrosselWrapper.scrollBy({ left: 300, behavior: 'smooth' });
});

// ====== Inicialização ======
window.onload = () => {
    buscarProdutos();
    atualizarContadorCarrinho();
};