const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

class ClienteService {
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
        throw new Error(errorData?.error || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  }

  // CRUD de Clientes
  async listarClientes(filtros = {}) {
    const params = new URLSearchParams(filtros).toString();
    return this.request(`/clientes?${params}`);
  }

  async buscarCliente(id) {
    return this.request(`/clientes/${id}`);
  }

  async criarCliente(dadosCliente) {
    return this.request('/clientes', {
      method: 'POST',
      body: JSON.stringify(dadosCliente)
    });
  }

  async atualizarCliente(id, dadosCliente) {
    return this.request(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dadosCliente)
    });
  }
}

export default new ClienteService();