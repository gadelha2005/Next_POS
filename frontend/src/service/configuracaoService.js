const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

class ConfiguracaoService {
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

  async buscarConfiguracao() {
    return this.request('/configuracoes');
  }

  async criarConfiguracao(dadosConfiguracao) {
    return this.request('/configuracoes', {
      method: 'POST',
      body: dadosConfiguracao
    });
  }

  async atualizarConfiguracao(dadosConfiguracao) {
    return this.request('/configuracoes', {
      method: 'PUT',
      body: dadosConfiguracao
    });
  }

  async deletarConfiguracao() {
    return this.request('/configuracoes', {
      method: 'DELETE'
    });
  }
}

export default new ConfiguracaoService();