const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

class VendaService {
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      ...options
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || errorData?.message || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  }

  async listarVendas(filtros = {}) {
    const params = new URLSearchParams(filtros).toString();
    return this.request(`/vendas?${params}`);
  }

  async listarVendasParaDashboard() {
    const hoje = new Date().toISOString().split('T')[0];
    return this.request(`/vendas?dataInicio=${hoje}&dataFim=${hoje}&limite=1000`);
  }

  async buscarVenda(id) {
    return this.request(`/vendas/${id}`);
  }

  async criarVenda(dadosVenda) {
    return this.request('/vendas', {
      method: 'POST',
      body: dadosVenda
    });
  }

  async cancelarVenda(id, motivo = '') {
    return this.request(`/vendas/${id}/cancelar`, {
      method: 'PUT',
      body: { motivo }
    });
  }

  async listarVendasPorCaixa(caixaId) {
    return this.request(`/vendas/caixa/${caixaId}`);
  }

  async getVendasDoDia() {
    const hoje = new Date().toISOString().split('T')[0];
    return this.listarVendas({
      dataInicio: hoje,
      dataFim: hoje
    });
  }

  async obterCaixaAtivo() {
    try {
      const response = await this.request('/caixa/aberto');
      return response.caixa;
    } catch (error) {
      console.warn('Erro ao obter caixa ativo, usando padrão:', error.message);
      return { id: 1, valorInicial: 500.00, status: 'aberto' };
    }
  }

  async formatarDadosVenda(dadosVenda, user) {
    const caixaAtivo = await this.obterCaixaAtivo();
    
    const itensFormatados = dadosVenda.itens.map(item => ({
      produtoId: item.id,
      quantidade: item.qtd
    }));

    return {
      usuarioId: user.id || 1,
      caixaId: caixaAtivo.id || 1,
      itens: itensFormatados,
      metodoPagamento: dadosVenda.metodoPagamento.toUpperCase(),
      valorRecebido: dadosVenda.valorRecebido || dadosVenda.total,
      total: dadosVenda.total,
      troco: dadosVenda.troco || 0,
      desconto: 0,
      clienteId: dadosVenda.clienteId ?? null
    };
  }
}

export default new VendaService();