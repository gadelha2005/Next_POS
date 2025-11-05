import React, { useState } from 'react';

function LoginScreen({ onSwitchToCadastro, onLoginSuccess }) {
    const [formData, setFormData] = useState({
        email: '',
        senha: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.senha) {
            setError('Preencha todos os campos');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3333/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro no login');
            }

            // Salva o token e dados do usuário
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Chama a função de sucesso
            if (onLoginSuccess) {
                onLoginSuccess(data.user);
            }

        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#fdfdfd] border-2 border-gray-300 w-[663px] h-[650px] rounded-[40px] flex flex-col justify-center items-center mx-auto my-auto fixed inset-0">
            
            <img 
                src="/src/assets/logo.png" 
                alt="Logo Next Pos" 
                className="mb-6 -mt-10"
            />
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                NextPOS
            </h1>
            
            <h2 className="text-lg text-gray-600 mb-8">
                Sistema de Ponto de Venda
            </h2>

            
            <div className="flex gap-4 mb-8">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
                    Login
                </button>
                
                <button 
                    onClick={onSwitchToCadastro}
                    className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition"
                >
                    Cadastro
                </button>
            </div>

            <div className="w-full max-w-xs">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input 
                            type="email" 
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="seu@email.com"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                            Senha
                        </label>
                        <input 
                            type="password" 
                            id="senha"
                            value={formData.senha}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Sua senha"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="text-right">
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                            Esqueci a senha
                        </a>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#002AD3] text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Entrando...
                            </span>
                        ) : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginScreen;