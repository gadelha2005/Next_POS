const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

class UsuarioService {
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
        throw new Error(errorData?.error || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  }

  async getPerfilUsuario() {
    try {
      const response = await this.request('/auth/profile');
      return response;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      
      const userLocalStorage = JSON.parse(localStorage.getItem('user') || 'null');
      if (userLocalStorage) {
        return { user: userLocalStorage };
      }
      
      throw new Error('Não foi possível carregar o perfil do usuário');
    }
  }

  async criarUsuario(usuarioData) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: usuarioData
      });
      
      return response;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw new Error('Não foi possível criar o usuário');
    }
  }

  async login(credenciais) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: credenciais
      });
      
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  async esqueciSenha(email) {
    try {
      const response = await this.request('/auth/forgot-password', {
        method: 'POST',
        body: { email }
      });
      
      return response;
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      throw error;
    }
  }

  async redefinirSenha(token, novaSenha) {
    try {
      const response = await this.request('/auth/reset-password', {
        method: 'POST',
        body: { token, novaSenha }
      });
      
      return response;
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  getUsuarioLocal() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  async obterUsuariosParaDashboard() {
    try {
      const perfil = await this.getPerfilUsuario();
      return {
        usuarios: [perfil.user]
      };
    } catch (error) {
      console.error('Erro ao obter usuários para dashboard:', error);
      
      const userLocal = this.getUsuarioLocal();
      const usuariosFallback = userLocal ? [userLocal] : [];
      
      return { usuarios: usuariosFallback };
    }
  }
}

export default new UsuarioService();