import React from 'react';

function AdminPrincipalScreen({ user, onLogout }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-purple-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">A</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">NextPOS</h1>
                                    <p className="text-sm text-gray-500">Painel Administrativo</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">Olá,</p>
                                <p className="text-lg font-bold text-purple-600">{user.nome}</p>
                            </div>
                            <button
                                onClick={onLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Sair</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        👑 Painel Administrativo
                    </h2>
                    <p className="text-lg text-gray-600">
                        Gerencie todo o sistema NextPOS
                    </p>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto mb-8 border border-purple-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Acesso Administrativo</h3>
                                <p className="text-gray-600">Você tem permissões totais no sistema</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Tipo de acesso</p>
                            <p className="text-lg font-bold text-purple-600">Administrador</p>
                        </div>
                    </div>
                </div>

                {/* Admin Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {/* Gerenciar Usuários */}
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-200 border border-blue-100">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Usuários</h3>
                        </div>
                        <p className="text-gray-600 mb-4">Gerencie acessos e permissões</p>
                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition duration-200">
                            Gerenciar
                        </button>
                    </div>

                    {/* Produtos */}
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-200 border border-green-100">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Produtos</h3>
                        </div>
                        <p className="text-gray-600 mb-4">Estoque, preços e categorias</p>
                        <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition duration-200">
                            Gerenciar
                        </button>
                    </div>

                    {/* Relatórios */}
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-200 border border-purple-100">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Relatórios</h3>
                        </div>
                        <p className="text-gray-600 mb-4">Vendas, métricas e analytics</p>
                        <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-medium transition duration-200">
                            Visualizar
                        </button>
                    </div>

                    {/* Configurações */}
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-200 border border-orange-100">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Configurações</h3>
                        </div>
                        <p className="text-gray-600 mb-4">Sistema e preferências</p>
                        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition duration-200">
                            Configurar
                        </button>
                    </div>
                </div>

                {/* Admin Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <div className="text-2xl font-bold text-blue-600">15</div>
                        <p className="text-gray-600">Usuários Ativos</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <div className="text-2xl font-bold text-green-600">248</div>
                        <p className="text-gray-600">Produtos Cadastrados</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <div className="text-2xl font-bold text-purple-600">R$ 12.847</div>
                        <p className="text-gray-600">Vendas Hoje</p>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Informações do Administrador</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Nome</p>
                            <p className="text-lg font-medium text-gray-900">{user.nome}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-lg font-medium text-gray-900">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tipo de Acesso</p>
                            <p className="text-lg font-medium text-purple-600">Administrador</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">ID do Usuário</p>
                            <p className="text-lg font-medium text-gray-900">#{user.id}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminPrincipalScreen;