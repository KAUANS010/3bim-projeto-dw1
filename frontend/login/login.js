document.addEventListener('DOMContentLoaded', function() {
  // Se o usuário já estiver logado, redireciona ele para o local correto.
  verificarSessaoExistente();

  const formLogin = document.getElementById('form-login');
  if(formLogin) {
    formLogin.addEventListener('submit', handleLogin);
  }
});

async function verificarSessaoExistente() {
  try {
    // ADICIONE O ENDEREÇO COMPLETO DO BACKEND
    const response = await fetch('http://localhost:3001/check-session', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      if (data.logado) {
        console.log('Usuário já logado:', data.user.nome);
        redirecionarPorTipo(data.user.tipo);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar sessão existente:', error);
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  if (!email || !senha) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.textContent = 'Entrando...';
  submitBtn.disabled = true;

  try {
    // ADICIONE O ENDEREÇO COMPLETO DO BACKEND
    const response = await fetch('http://localhost:3001/login/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Email ou senha inválidos.');
    }
    
    redirecionarPorTipo(data.tipo);

  } catch (error) {
    console.error('Erro no login:', error.message);
    alert("---> "+  error.message);
  } finally {
    submitBtn.textContent = 'Entrar';
    submitBtn.disabled = false;
  }
}

function redirecionarPorTipo(tipo) {
  switch (tipo) {
    case 'gerente':
      window.location.href = '../menu.html';
      break;
    case 'funcionario':
      // Lembre-se de criar o arquivo 'loja_funcionario.html'
      alert('Login como funcionário bem-sucedido! (Página de funcionário a ser criada)');
      // window.location.href = '/loja_funcionario.html';
      break;
    case 'cliente':
      // Lembre-se de criar o arquivo 'loja_cliente.html'
      alert('Login como cliente bem-sucedido! (Página de cliente a ser criada)');
      // window.location.href = '/loja_cliente.html';
      break;
    default:
      console.error('Tipo de usuário desconhecido:', tipo);
      break;
  }
}