// =============================================================================
// ARQUIVO: src/App.tsx (VERSÃO FINAL COM ROTA PRIVADA - BÔNUS)
// =============================================================================
import { useState, useEffect, FormEvent, ReactNode } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css'; 

// =============================================================================
// (!!) ATENÇÃO, GURI: TROQUE A URL ABAIXO PELA SUA (!!)
// Cole aqui a URL do seu backend da Missão 10
// =============================================================================
const API_URL = "https://missao-10-backend-lela.onrender.com/products";
// =============================================================================

// A "frase-senha" secreta que você pediu
const PASSPHRASE_SECRETA = "confia-no-guri";

// =============================================================================
// LÓGICA DE AUTENTICAÇÃO (O "CORAÇÃO" DO BÔNUS)
// =============================================================================
// Hook customizado para gerenciar o "login"
function useAuth() {
  // O token fica salvo no localStorage para "lembrar" do usuário
  const [token, setToken] = useState(localStorage.getItem('user_token'));
  const navigate = useNavigate();
  const location = useLocation();

  const login = (passphrase: string): boolean => {
    if (passphrase === PASSPHRASE_SECRETA) {
      const newToken = "fake-token-123456"; // Em um app real, a API enviaria isso
      localStorage.setItem('user_token', newToken);
      setToken(newToken);
      
      // Envia o usuário de volta para onde ele tentou ir
      const from = (location.state as any)?.from?.pathname || "/app";
      navigate(from, { replace: true });
      return true;
    }
    return false; // Senha errada
  };

  const logout = () => {
    localStorage.removeItem('user_token');
    setToken(null);
    navigate("/login");
  };

  return { token, login, logout };
}

// =============================================================================
// O "SEGURANÇA" (PRIVATE ROUTE)
// =============================================================================
function PrivateRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('user_token');
  const location = useLocation();

  if (!token) {
    // Se não está logado, manda para /login e "lembra" de onde ele veio
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se está logado, deixa ele ver a página
  return <>{children}</>;
}


// =============================================================================
// PÁGINA DE LOGIN
// =============================================================================
function LoginPage({ authLogin }: { authLogin: (pass: string) => boolean }) {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const isSuccess = authLogin(passphrase);
    
    if (!isSuccess) {
      setError("Frase-senha incorreta. Tente de novo.");
      // O EFEITO "UAU!" (Shake)
      setIsShaking(true);
      // Remove a classe de shake após a animação
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <h2>Acesso Restrito</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Token (Frase-Senha)</label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              // Adiciona a classe 'shake' se o estado for verdadeiro
              className={isShaking ? 'shake' : ''}
              required
            />
          </div>
          <button type="submit">Entrar</button>
          
          {error && <p className="error-message">{error}</p>}

          <p className="passphrase-hint">
            (Para fins de teste, a frase-senha é: **{PASSPHRASE_SECRETA}**)
          </p>
        </form>
      </div>
    </div>
  );
}


// =============================================================================
// PÁGINA DO DASHBOARD (O NOSSO APP ANTIGO)
// =============================================================================
function DashboardPage({ authLogout }: { authLogout: () => void }) {
  // (Esta é a lógica do seu App.tsx anterior, agora "empacotada" aqui)
  const [produtos, setProdutos] = useState<IProduto[]>([]);
  const [nomeProduto, setNomeProduto] = useState('');
  const [precoProduto, setPrecoProduto] = useState('');
  const [status, setStatus] = useState('carregando');
  const [statusEnvio, setStatusEnvio] = useState('parado');

  const fetchProdutos = async () => {
    setStatus('carregando');
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Falha ao buscar dados da API.');
      const data: IProduto[] = await response.json();
      setProdutos(data);
      setStatus('sucesso');
    } catch (error) {
      console.error(error);
      setStatus('erro');
    }
  };

  const handleCadastroSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusEnvio('enviando');
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nomeProduto,
          price: parseFloat(precoProduto)
        }),
      });
      if (!response.ok) throw new Error('Falha ao cadastrar produto.');
      setNomeProduto('');
      setPrecoProduto('');
      fetchProdutos();
    } catch (error) {
      console.error(error);
      alert('Erro ao cadastrar. Verifique o console.');
    } finally {
      setStatusEnvio('parado');
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  return (
    <div className="App">
      <button onClick={authLogout} style={{ width: 'auto', float: 'right', background: '#555' }}>
        Sair
      </button>
      <h1>Missão 10 – A Grande Conexão</h1>
      <div className="card">
        <h2>Cadastrar Novo Produto</h2>
        <form onSubmit={handleCadastroSubmit}>
          <div className="form-group">
            <label>Nome do Produto:</label>
            <input
              type="text"
              value={nomeProduto}
              onChange={(e) => setNomeProduto(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Preço (R$):</label>
            <input
              type="number"
              step="0.01"
              value={precoProduto}
              onChange={(e) => setPrecoProduto(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={statusEnvio === 'enviando'}>
            {statusEnvio === 'enviando' ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Lista de Produtos (Vindos do Airtable)</h2>
        {status === 'carregando' && <p>Carregando produtos da API...</p>}
        {status === 'erro' && <p>Erro ao carregar produtos. Verifique se a API do backend está no ar e se o CORS foi habilitado.</p>}
        {status === 'sucesso' && (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Preço</th>
              </tr>
            </thead>
            <tbody>
              {produtos.length === 0 && (
                <tr>
                  <td colSpan={2}>Nenhum produto cadastrado ainda.</td>
                </tr>
              )}
              {produtos.map((produto) => (
                <tr key={produto.id}>
                  <td>{produto.name}</td>
                  <td>R$ {produto.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


// =============================================================================
// O PONTO DE ENTRADA PRINCIPAL (O ROTEADOR)
// =============================================================================
function App() {
  // Inicializa a lógica de autenticação
  const { token, login, logout } = useAuth();

  return (
    <Routes>
      {/* Rota de Login */}
      <Route path="/login" element={<LoginPage authLogin={login} />} />

      {/* Rota do App (Protegida) */}
      <Route 
        path="/app" 
        element={
          <PrivateRoute>
            <DashboardPage authLogout={logout} />
          </PrivateRoute>
        } 
      />

      {/* Rota "Raiz" - Redireciona para o app se logado, ou para o login se não */}
      <Route 
        path="/"
        element={token ? <Navigate to="/app" /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
