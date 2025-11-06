// =============================================================================
// ARQUIVO: src/App.tsx (O CÓDIGO CORRETO E FINAL)
// =============================================================================
import { useState, useEffect, FormEvent } from 'react';
import './App.css'; // Agora ele vai encontrar o App.css que você já criou

// =============================================================================
// (!!) ATENÇÃO, GURI: TROQUE A URL ABAIXO PELA SUA (!!)
//
// Cole aqui a URL do seu backend da Missão 10
// (aquela do 'missao-10-backend-lela.onrender.com')
// =============================================================================
const API_URL = "https://missao-10-backend-lela.onrender.com/products";
// =============================================================================


// Definindo o "formato" de um Produto (TypeScript)
interface IProduto {
  id: string;
  name: string;
  price: number;
  stock?: number;
}

// =============================================================================
// COMPONENTE PRINCIPAL DA APLICAÇÃO
// =============================================================================
function App() {
  // --- Estados do nosso App ---
  
  // Estado para guardar a lista de produtos que vem da API
  const [produtos, setProdutos] = useState<IProduto[]>([]);
  
  // Estado para controlar o formulário
  const [nomeProduto, setNomeProduto] = useState('');
  const [precoProduto, setPrecoProduto] = useState('');

  // Estado para gerenciar o feedback para o usuário
  const [status, setStatus] = useState('carregando'); // 'carregando', 'erro', 'sucesso'
  const [statusEnvio, setStatusEnvio] = useState('parado'); // 'parado', 'enviando'

  // --- Funções ---

  /**
   * REQUISITO GET: Busca a lista de produtos na API.
   */
  const fetchProdutos = async () => {
    setStatus('carregando');
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Falha ao buscar dados da API.');
      }
      const data: IProduto[] = await response.json();
      setProdutos(data);
      setStatus('sucesso');
    } catch (error) {
      console.error(error);
      setStatus('erro');
    }
  };

  /**
   * REQUISITO POST: Envia um novo produto para a API.
   */
  const handleCadastroSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Impede o recarregamento da página
    setStatusEnvio('enviando');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nomeProduto,
          price: parseFloat(precoProduto) // Converte o texto "123.50" para o número 123.50
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao cadastrar produto.');
      }

      // Limpa o formulário
      setNomeProduto('');
      setPrecoProduto('');
      
      // Recarrega a lista de produtos para mostrar o novo item
      fetchProdutos(); 

    } catch (error) {
      console.error(error);
      alert('Erro ao cadastrar. Verifique o console.');
    } finally {
      setStatusEnvio('parado');
    }
  };

  // --- Efeito de Carregamento Inicial ---
  
  // Isso roda uma vez quando o componente é carregado
  useEffect(() => {
    fetchProdutos();
  }, []); // O array vazio [] significa "rodar apenas uma vez"

  // --- Renderização (O que aparece na tela) ---
  return (
    <div className="App">
      <h1>Missão 10 – A Grande Conexão (Full Stack)</h1>
      <hr />

      {/* Requisito: Criar um formulário no frontend */}
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

      <hr />

      {/* Requisito: Exibir os dados recebidos do backend */}
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

export default App;
