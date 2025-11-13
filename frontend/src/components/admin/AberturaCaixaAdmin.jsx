import React, { useState } from 'react';

function AberturaCaixaAdmin({ user, onAberturaSuccess, onVoltarMenu }) {
    const [valorInicial, setValorInicial] = useState('500.00'); // Valor padrão
    const [isLoading, setIsLoading] = useState(false);

    const handleAbrirCaixa = async () => {
        if (!valorInicial || isNaN(valorInicial) || parseFloat(valorInicial) <= 0) {
            return;
        }
        
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            
            const requestBody = {
                valorInicial: parseFloat(valorInicial) // Campo correto que a API espera
            };


            const response = await fetch('http://localhost:3333/api/caixa/abrir', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.error || 'Erro ao abrir caixa';
                throw new Error(JSON.stringify(errorData) || errorMessage);
            }

            // Sucesso - atualizar localStorage e chamar callback
            localStorage.setItem('caixaAberto', 'true');
            localStorage.setItem('saldoInicial', valorInicial);
            
            onAberturaSuccess();

        } catch (error) {
            console.error('Erro ao abrir caixa:', error);
        } 
        finally {
            setIsLoading(false);
        }
    };

    const handleVoltarMenu = () => {
        onVoltarMenu();
    };

    const handleClose = () => {
        handleVoltarMenu();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
            {/* Botão X no canto superior direito */}
            <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition duration-200"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo */}
                <div className="flex justify-center">
                    <img 
                        src="/src/assets/logo.png" 
                        alt="Logo Next Pos" 
                        className="h-16 w-16"
                    />
                </div>
                
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
                    Abertura de Caixa - Admin
                </h1>
                
                <div className="text-center text-gray-600 mb-8">
                    <p>Olá, <span className="font-semibold">{user.nome}</span></p>
                    <p className="text-sm text-gray-500 mt-1">Função: Administrador</p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 border-2 border-gray-200">
                    <div className="mb-6">
                        <label htmlFor="valorInicial" className="block text-sm font-medium text-gray-700 mb-2">
                            Valor inicial R$
                        </label>
                        <input
                            type="number"
                            id="valorInicial"
                            value={valorInicial}
                            onChange={(e) => setValorInicial(e.target.value)}
                            placeholder="500.00"
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center"
                            step="0.01"
                            min="0"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleAbrirCaixa();
                                }
                            }}
                            disabled={isLoading}
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">
                            Valor sugerido: R$ 500,00
                        </p>
                    </div>

                    <hr className="my-6 border-gray-300" />

                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={handleAbrirCaixa}
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Abrindo...
                                </span>
                            ) : 'Abrir Caixa'}
                        </button>
                        
                        <button
                            onClick={handleVoltarMenu}
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50"
                        >
                            Voltar ao Menu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AberturaCaixaAdmin;