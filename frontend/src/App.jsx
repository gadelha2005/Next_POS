// App.js (completo e corrigido)
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import CadastroScreen from './components/CadastroScreen';
import CaixaPrincipalScreen from './components/caixa/CaixaPrincipalScreen';
import AdminDashboard from './components/admin/AdminDashboard';
import AberturaCaixa from './components/caixa/AberturaCaixa';
import AdminLayout from './components/admin/AdminLayout';
import AdminProdutos from './components/admin/AdminProdutos';
import AdminClientes from './components/admin/AdminClientes';
import AdminRelatorios from './components/admin/AdminRelatorios';
import AdminConfiguracoes from './components/admin/AdminConfiguracoes';
import AberturaCaixaAdmin from './components/admin/AberturaCaixaAdmin';
import CaixaPrincipalAdmin from './components/admin/CaixaPrincipalAdmin';

// Componente para rotas do admin
function AdminRoutes({ user, logout, caixaAberto, handleAberturaCaixaSuccess, handleFecharCaixa }) {
  const navigate = useNavigate();
  
  return (
    <AdminLayout user={user} onLogout={logout}>
      <Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="produtos" element={<AdminProdutos />} />
        <Route path="clientes" element={<AdminClientes />} />
        <Route path="relatorios" element={<AdminRelatorios />} />
        <Route path="configuracoes" element={<AdminConfiguracoes />} />
        <Route path="vendas" element={
          !caixaAberto ? (
            <AberturaCaixaAdmin 
              user={user} 
              onAberturaSuccess={handleAberturaCaixaSuccess}
              onBackToDashboard={() => navigate('/admin/dashboard')}
            />
          ) : (
            <CaixaPrincipalAdmin 
              user={user} 
              onFecharCaixa={handleFecharCaixa}
            />
          )
        } />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}

function App() {
    const [currentScreen, setCurrentScreen] = useState('login');
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [caixaAberto, setCaixaAberto] = useState(false);

    // Verificar autenticação e status do caixa
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (!token || !savedUser) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const userData = data.user;
                setUser(userData);
                setIsAuthenticated(true);

                if (userData.role === 'caixa') {
                    await checkCaixaStatus(token);
                } else {
                    setIsLoading(false);
                }
            } else {
                logout();
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            logout();
        }
    };

    const checkCaixaStatus = async (token) => {
        try {
            const response = await fetch('http://localhost:3333/api/caixa/status', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCaixaAberto(data.temCaixaAberto);
                
                if (data.caixa) {
                    localStorage.setItem('caixaAberto', JSON.stringify(data.caixa));
                }
            }
        } catch (error) {
            console.error('Erro ao verificar caixa:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        
        if (userData.role === 'caixa') {
            checkCaixaStatus(localStorage.getItem('token'));
        } else {
            setIsLoading(false);
        }
    };

    const handleRegisterSuccess = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        
        if (userData.role === 'caixa') {
            checkCaixaStatus(localStorage.getItem('token'));
        } else {
            setIsLoading(false);
        }
    };

    const handleAberturaCaixaSuccess = () => {
        setCaixaAberto(true);
        checkCaixaStatus(localStorage.getItem('token'));
    };

    const handleFecharCaixa = () => {
        setCaixaAberto(false);
        localStorage.removeItem('caixaAberto');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('caixaAberto');
        setUser(null);
        setIsAuthenticated(false);
        setCaixaAberto(false);
        setCurrentScreen('login');
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    // Rotas para usuários autenticados
    if (isAuthenticated && user) {
        return (
            <Router>
                <Routes>
                    {/* Rotas do Admin */}
                    {user.role === 'admin' && (
                        <Route path="/admin/*" element={
                            <AdminRoutes 
                                user={user} 
                                logout={logout}
                                caixaAberto={caixaAberto}
                                handleAberturaCaixaSuccess={handleAberturaCaixaSuccess}
                                handleFecharCaixa={handleFecharCaixa}
                            />
                        } />
                    )}

                    {/* Rotas do Caixa */}
                    {user.role === 'caixa' && (
                        <Route path="/*" element={
                            !caixaAberto ? (
                                <AberturaCaixa 
                                    user={user} 
                                    onAberturaSuccess={handleAberturaCaixaSuccess}
                                    onLogout={logout}
                                    isAdmin={false}
                                />
                            ) : (
                                <CaixaPrincipalScreen 
                                    user={user} 
                                    onLogout={logout}
                                    onFecharCaixa={handleFecharCaixa}
                                    isAdmin={false}
                                />
                            )
                        } />
                    )}

                    {/* Redirecionamento padrão */}
                    <Route path="*" element={
                        <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/'} replace />
                    } />
                </Routes>
            </Router>
        );
    }

    // Tela de login/cadastro para usuários não autenticados
    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
            {currentScreen === 'login' ? (
                <LoginScreen 
                    onSwitchToCadastro={() => setCurrentScreen('cadastro')}
                    onLoginSuccess={handleLoginSuccess}
                />
            ) : (
                <CadastroScreen 
                    onSwitchToLogin={() => setCurrentScreen('login')}
                    onRegisterSuccess={handleRegisterSuccess}
                />
            )}
        </div>
    );
}

export default App;