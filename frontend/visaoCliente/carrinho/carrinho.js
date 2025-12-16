function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
}
function carregarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const corpo = document.getElementById('corpo-tabela');
    const totalGeral = document.getElementById('total-geral');
    corpo.innerHTML = '';
    let total = 0;

    // Se o carrinho estiver vazio
    if (carrinho.length === 0) {
        corpo.innerHTML = `<tr><td colspan="6" style="text-align:center;">Seu carrinho está vazio.</td></tr>`;
        
        // --- A CORREÇÃO ESTÁ AQUI ---
        // Forçamos o total a aparecer zerado antes de parar a função
        totalGeral.textContent = "Total: R$ 0,00";
        // ----------------------------

        document.getElementById('btn-finalizar').disabled = true;
        document.getElementById('btn-limpar').disabled = true;
        return; // A função para aqui
    }

    // Se tiver itens, calcula normalmente
    carrinho.forEach((item, index) => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;

        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${item.id}</td>
          <td>${item.nome}</td>
          <td>
            <input type="number" min="1" step="1" value="${item.quantidade}" onchange="atualizarQuantidade(${index}, this.value)">
          </td>
          <td>${formatarPreco(item.preco)}</td>
          <td>${formatarPreco(subtotal)}</td>
          <td><button class="btn-remover" onclick="removerItem(${index})">Remover</button></td>
        `;
        corpo.appendChild(linha);
    });

    totalGeral.textContent = `Total: ${formatarPreco(total)}`;
    document.getElementById('btn-finalizar').disabled = false;
    document.getElementById('btn-limpar').disabled = false;
}

function removerItem(index) {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    carregarCarrinho();
}

function atualizarQuantidade(index, novaQtd) {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    // Garante que é um número inteiro e pelo menos 1
    let qtd = parseInt(novaQtd);
    if (isNaN(qtd) || qtd < 1) qtd = 1;

    carrinho[index].quantidade = qtd;
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    carregarCarrinho();
}

function limparCarrinho() {
    if (confirm("Tem certeza que deseja limpar todo o carrinho?")) {
        localStorage.removeItem('carrinho');
        carregarCarrinho();
    }
}

function finalizarPedido() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }
    // Redireciona para finalizar (verifique se o caminho do arquivo está correto na sua estrutura)
    window.location.href = "finalizar.html"; 
}

// Event Listeners
document.getElementById('btn-finalizar').addEventListener('click', finalizarPedido);
document.getElementById('btn-limpar').addEventListener('click', limparCarrinho);
window.onload = carregarCarrinho;