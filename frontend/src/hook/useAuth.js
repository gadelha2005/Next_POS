import { useState, useEffect } from 'react';
import { apiService } from '../service/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = apiService.getUserData();

      if (token && savedUser) {
        // Verificar se o token ainda é válido
        try {
          await apiService.getProfile();
          setUser(savedUser);
          setIsAuthenticated(true);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
          // Token inválido, fazer logout
          apiService.logout();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      apiService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, senha) => {
    try {
      setIsLoading(true);
      const data = await apiService.login(email, senha);
      
      apiService.saveUserData(data.token, data.user);
      setUser(data.user);
      setIsAuthenticated(true);
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Erro ao fazer login' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nome, email, senha) => {
    try {
      setIsLoading(true);
      const data = await apiService.register(nome, email, senha);
      
      apiService.saveUserData(data.token, data.user);
      setUser(data.user);
      setIsAuthenticated(true);
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Erro ao fazer cadastro' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
}