// Espera o conteúdo da página ser carregado para iniciar as verificações.
document.addEventListener('DOMContentLoaded', () => {
  verificarLoginEAutorizacao();
});

/**
 * Função principal que verifica se o usuário está logado e se tem permissão para ver a página.
 */
async function verificarLoginEAutorizacao() {
  try {
    // ADICIONE O ENDEREÇO COMPLETO DO BACKEND
    const response = await fetch('http://localhost:3001/check-session', {
      method: 'GET',
      credentials: 'include' // Essencial para enviar/receber cookies de sessão
    });

    if (!response.ok) {
      console.error('Erro ao verificar sessão.');
      window.location.href = 'login/login.html'; // Redireciona por segurança
      return;
    }

    const data = await response.json();
    // --- DEBUG: imprime no console ---
   alert('check-session response:', data);



    // Se 'logado' for falso ou se o tipo do usuário não for 'gerente'
    if (!data.logado || data.user.tipo !== 'gerente') {
      alert('Acesso negado. Você precisa ser um gerente para acessar esta página.');
      window.location.href = 'login/login.html';
    } else {
      // Se o usuário é um gerente logado, exibe o nome dele e a página carrega normalmente.
      console.log('Acesso autorizado para o gerente:', data.user.nome);
      const selectUsuario = document.getElementById("oUsuario");
      if (selectUsuario) {
        selectUsuario.options[0].text = data.user.nome;
      }
    }
  } catch (error) {
    console.error('Falha na comunicação com o servidor:', error);
    alert('Não foi possível verificar seu login. Redirecionando para a página inicial.');
    window.location.href = 'login/login.html';
  }
}

/**
 * Gerencia as ações do dropdown do usuário (Gerenciar Conta / Sair).
 * Esta função é chamada pelo HTML.
 * @param {string} action - A ação selecionada ('gerenciar-conta' or 'sair').
 */
function handleUserAction(action) {
  if (action === "gerenciar-conta") {
    alert("Funcionalidade 'Gerenciar Conta' ainda não implementada.");
  } else if (action === "sair") {
    fazerLogout();
  }
  // Reseta o dropdown para a opção padrão
  document.getElementById("oUsuario").value = "";
}

/**
 * Executa o processo de logout.
 */
async function fazerLogout() {
 try {
    // ADICIONE O ENDEREÇO COMPLETO DO BACKEND
    await fetch('http://localhost:3001/logout', {
      method: 'POST',
      credentials: 'include'
    });

    alert("Você foi desconectado.");
    // ROTA CORRIGIDA: Caminho absoluto a partir da raiz do site
    window.location.href = 'login/login.html'; 
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    alert('Ocorreu um erro ao tentar sair. Tente novamente.');
  }
}