const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

class ProdutoService {
  getToken() {
    return localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      ...options
    };

    if (!(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, config);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

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

  async criarProduto(dadosProduto, arquivoImagem = null) {
    let body;
    
    if (arquivoImagem) {
      body = new FormData();
      body.append('nome', dadosProduto.nome);
      body.append('categoria', dadosProduto.categoria);
      body.append('preco', dadosProduto.preco.toString());
      body.append('estoque', dadosProduto.estoque.toString());
      
      if (dadosProduto.codigo) body.append('codigo', dadosProduto.codigo);
      if (dadosProduto.codigoBarras) body.append('codigoBarras', dadosProduto.codigoBarras);
      if (dadosProduto.custo) body.append('custo', dadosProduto.custo.toString());
      if (dadosProduto.estoqueMinimo) body.append('estoqueMinimo', dadosProduto.estoqueMinimo.toString());
      
      body.append('imagem', arquivoImagem);
    } else {
      body = JSON.stringify(dadosProduto);
    }

    return this.request('/produtos', {
      method: 'POST',
      body: body
    });
  }

  async atualizarProduto(id, dadosProduto, arquivoImagem = null) {
    let body;
    
    if (arquivoImagem) {
      body = new FormData();
      Object.keys(dadosProduto).forEach(key => {
        if (dadosProduto[key] !== undefined && key !== 'imagem') {
          body.append(key, dadosProduto[key].toString());
        }
      });
      body.append('imagem', arquivoImagem);
    } else {
      body = JSON.stringify(dadosProduto);
    }

    return this.request(`/produtos/${id}`, {
      method: 'PUT',
      body: body
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

  async buscarImagemAutomatica(nomeProduto, codigoBarras = null) {
    return this.request('/produtos/buscar-imagem', {
      method: 'POST',
      body: JSON.stringify({ nomeProduto, codigoBarras })
    });
  }
}

export default new ProdutoService();