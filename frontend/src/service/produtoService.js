const API_BASE_URL = 'http://localhost:3333/api';

class ProdutoService {
  getToken() {
    // Pega o token atualizado a cada requisição
    return localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  }


  // CRUD de Produtos
  async listarProdutos(filtros = {}) {
    const params = new URLSearchParams(filtros).toString();
    return this.request(`/produtos?${params}`);
  }

  async buscarProduto(id) {
    return this.request(`/produtos/${id}`);
  }

  async buscarPorCodigo(codigo) {
    return this.request(`/produtos/codigo/${codigo}`);
  }

  async criarProduto(dadosProduto) {
    return this.request('/produtos', {
      method: 'POST',
      body: JSON.stringify(dadosProduto)
    });
  }

  async atualizarProduto(id, dadosProduto) {
    return this.request(`/produtos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dadosProduto)
    });
  }

  async desativarProduto(id) {
    return this.request(`/produtos/${id}`, {
      method: 'DELETE'
    });
  }

  async getEstoqueBaixo() {
    return this.request('/produtos/estoque/baixo');
  }

  async migrarDadosLocalStorage(produtos) {
    return this.request('/produtos/migrar/localstorage', {
      method: 'POST',
      body: JSON.stringify({ produtos })
    });
  }
}

export default new ProdutoService();