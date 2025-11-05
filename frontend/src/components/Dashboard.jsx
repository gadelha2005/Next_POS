import React, { useState, useEffect } from 'react';

function Dashboard({ user, onLogout }) {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProfileData(data.user);
            }
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onLogout();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <img 
                                src="/src/assets/logo.png" 
                                alt="Logo Next Pos" 
                                className="h-8 w-8 mr-2"
                            />
                            <h1 className="text-xl font-bold text-gray-800">NextPOS Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Olá, {user.nome}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white rounded-lg shadow p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                Bem-vindo ao NextPOS, {user.nome}! 🎉
                            </h2>
                            <p className="text-gray-600">
                                Sistema de Ponto de Venda
                            </p>
                        </div>

                        {/* Status da Autenticação */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">
                                        Autenticação JWT funcionando perfeitamente!
                                    </h3>
                                    <p className="text-sm text-green-600 mt-1">
                                        Sua sessão está segura e válida.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Informações do Usuário */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Informações do Perfil</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Nome:</label>
                                        <p className="text-gray-800">{user.nome}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Email:</label>
                                        <p className="text-gray-800">{user.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">ID do Usuário:</label>
                                        <p className="text-gray-800">{user.id}</p>
                                    </div>
                                    {profileData && profileData.created_at && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Membro desde:</label>
                                            <p className="text-gray-800">
                                                {new Date(profileData.created_at).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Status do Sistema</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                        <span className="text-sm text-gray-600">Backend: Online</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                        <span className="text-sm text-gray-600">Database: Conectado</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                        <span className="text-sm text-gray-600">Autenticação: Ativa</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                        <span className="text-sm text-gray-600">Perfil: Carregado</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ações Rápidas */}
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Ações Rápidas</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition text-center">
                                    Vendas
                                </button>
                                <button className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition text-center">
                                    Produtos
                                </button>
                                <button className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition text-center">
                                    Relatórios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;