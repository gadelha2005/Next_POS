import React, { useState } from 'react';

function CadastroScreen({ onSwitchToLogin, onRegisterSuccess }) {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { id, value } = e.target;
        // Mapear os ids para os nomes corretos no estado
        const fieldName = id === 'emailCadastro' ? 'email' : 
                         id === 'senhaCadastro' ? 'senha' : 
                         id === 'confirmarSenha' ? 'confirmarSenha' : id;
        
        setFormData({
            ...formData,
            [fieldName]: value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validações
        if (!formData.nome || !formData.email || !formData.senha || !formData.confirmarSenha) {
            setError('Preencha todos os campos');
            return;
        }

        if (formData.senha !== formData.confirmarSenha) {
            setError('As senhas não coincidem');
            return;
        }

        if (formData.senha.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (!formData.email.includes('@')) {
            setError('Email inválido');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const { confirmarSenha: _, ...registerData } = formData;
            
            const response = await fetch('http://localhost:3333/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro no cadastro');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            if (onRegisterSuccess) {
                onRegisterSuccess(data.user);
            }

        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#fdfdfd] border-2 border-gray-300 w-[663px] h-[680px] rounded-[40px] flex flex-col justify-center items-center mx-auto my-auto fixed inset-0">
            
            <img 
                src="/src/assets/logo.png" 
                alt="Logo Next Pos" 
                className="mb-6 -mt-2"
            />
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2 -mt-5">
                NextPOS
            </h1>
            
            <h2 className="text-lg text-gray-600 mb-8">
                Sistema de Ponto de Venda
            </h2>

            <div className="flex gap-4 mb-6 -mt-5">
                <button 
                    onClick={onSwitchToLogin}
                    className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition"
                >
                    Login
                </button>
                
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
                    Cadastro
                </button>
            </div>

            <div className="w-full max-w-xs">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-3" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                            Nome Completo
                        </label>
                        <input 
                            type="text" 
                            id="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Seu nome completo"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="emailCadastro" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input 
                            type="email" 
                            id="emailCadastro"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="seu@email.com"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="senhaCadastro" className="block text-sm font-medium text-gray-700 mb-1">
                            Senha
                        </label>
                        <input 
                            type="password" 
                            id="senhaCadastro"
                            value={formData.senha}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Crie uma senha"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar Senha
                        </label>
                        <input 
                            type="password" 
                            id="confirmarSenha"
                            value={formData.confirmarSenha}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Confirme sua senha"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#002AD3] text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition duration-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CadastroScreen;