import React, { useState } from 'react';

function AberturaCaixaAdmin({ user, onAberturaSuccess, onBackToDashboard }) {
    const [valorInicial, setValorInicial] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fecharCaixaExistente = async (token) => {
        try {
            // Primeiro tenta fechar qualquer caixa aberto existente
            const response = await fetch('http://localhost:3333/api/caixa/fechar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    saldoFinal: 0 // Fecha com saldo zero temporariamente
                })
            });

            if (response.ok) {
                console.log('✅ Caixa anterior fechado automaticamente');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erro ao fechar caixa existente:', error);
            return false;
        }
    };

    const handleAbrirCaixa = async () => {
        if (!valorInicial || isNaN(valorInicial) || parseFloat(valorInicial) <= 0) {
            alert('Por favor, informe um valor inicial válido.');
            return;
        }
        
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            console.log('🔑 Token:', token);
            console.log('💰 Valor inicial:', valorInicial);
            
            const requestBody = {
                valorInicial: parseFloat(valorInicial)
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
                const errorData = await response.json();
                
                // Se o erro for "caixa já aberto", tenta fechar e reabrir
                if (errorData.error && errorData.error.includes('Já existe um caixa aberto')) {
                    console.log('🔄 Caixa já aberto detectado, tentando fechar...');
                    
                    const fechou = await fecharCaixaExistente(token);
                    if (fechou) {
                        // Tenta abrir novamente após fechar
                        const retryResponse = await fetch('http://localhost:3333/api/caixa/abrir', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(requestBody)
                        });

                        if (!retryResponse.ok) {
                            const retryError = await retryResponse.text();
                            throw new Error(retryError || 'Erro ao reabrir caixa');
                        }

                        console.log('✅ Caixa reaberto com sucesso após fechamento automático');
                        alert(`Caixa aberto com sucesso! Valor inicial: R$ ${parseFloat(valorInicial).toFixed(2)}\n\n⚠️ O caixa anterior foi fechado automaticamente.`);
                        onAberturaSuccess();
                        return;
                    } else {
                        throw new Error('Não foi possível fechar o caixa anterior automaticamente. Contate o administrador.');
                    }
                }
                
                throw new Error(errorData.error || 'Erro ao abrir caixa');
            }

            const data = await response.json();
            console.log('✅ Success response:', data);

            alert(`Caixa aberto com sucesso! Valor inicial: R$ ${parseFloat(valorInicial).toFixed(2)}`);
            onAberturaSuccess();

        } catch (error) {
            console.error('💥 Erro completo:', error);
            alert('Erro ao abrir caixa: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
            {/* Botão Voltar no canto superior esquerdo */}
            <button
                onClick={onBackToDashboard}
                disabled={isLoading}
                className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition duration-200 disabled:opacity-50"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Voltar ao Dashboard
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
                    Abertura de Caixa
                </h1>
                
                <div className="text-center text-gray-600 mb-8">
                    <p>Olá, <span className="font-semibold">{user.nome}</span></p>
                    <p className="text-sm text-gray-500 mt-1">Administrador</p>
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
                            placeholder="0.00"
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
                    </div>

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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AberturaCaixaAdmin;