import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Package,
  Trophy,
  Wallet,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import produtoService from '../../service/produtoService';
import vendaService from '../../service/vendaService';

export default function AdminRelatorios() {
  const [dadosRelatorios, setDadosRelatorios] = useState({
    receitaTotal: 0,
    totalVendas: 0,
    ticketMedio: 0,
    produtosAtivos: 0,
    produtosMaisVendidos: [],
    formasPagamento: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarDadosRelatorios();
  }, []);

  const processarProdutosMaisVendidos = (vendas, produtos) => {
    const produtosVendidos = {};
    
    vendas.forEach(venda => {
      if (venda.itens && Array.isArray(venda.itens)) {
        venda.itens.forEach(item => {
          // Buscar nome do produto pelo produtoId
          const produtoEncontrado = produtos.find(p => p.id === item.produtoId);
          const nomeProduto = produtoEncontrado ? produtoEncontrado.nome : `Produto ${item.produtoId}`;
          const quantidade = item.quantidade || item.qtd || 0;
          
          if (produtosVendidos[nomeProduto]) {
            produtosVendidos[nomeProduto] += quantidade;
          } else {
            produtosVendidos[nomeProduto] = quantidade;
          }
        });
      }
    });

    return Object.entries(produtosVendidos)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([nome, quantidade]) => ({ nome, quantidade }));
  };

  const carregarDadosRelatorios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados em paralelo
      const [produtosResponse, vendasResponse] = await Promise.all([
        produtoService.listarProdutos().catch(error => {
          console.error('Erro ao carregar produtos:', error);
          throw new Error('Erro ao carregar produtos');
        }),
        vendaService.listarVendas().catch(error => {
          console.error('Erro ao carregar vendas:', error);
          throw new Error('Erro ao carregar vendas');
        })
      ]);

      const produtos = produtosResponse.produtos || [];
      const vendas = vendasResponse.vendas || [];

      // Cálculo de receita e vendas
      const receitaTotal = vendas.reduce((acc, venda) => acc + (venda.total || 0), 0);
      const totalVendas = vendas.length;
      const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0;
      const produtosAtivos = produtos.length;

      // Cálculo de produtos mais vendidos
      const produtosMaisVendidos = processarProdutosMaisVendidos(vendas, produtos);

      // Cálculo de formas de pagamento
      const formasPagamento = {};
      vendas.forEach(venda => {
        const metodo = venda.metodoPagamento ? venda.metodoPagamento.toLowerCase() : 'desconhecido';
        formasPagamento[metodo] = (formasPagamento[metodo] || 0) + 1;
      });

      setDadosRelatorios({
        receitaTotal,
        totalVendas,
        ticketMedio,
        produtosAtivos,
        produtosMaisVendidos,
        formasPagamento
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error);
      setError(error.message);
      carregarDadosFallback();
    } finally {
      setLoading(false);
    }
  };

  const carregarDadosFallback = () => {
    try {
      // Fallback: carregar do localStorage se a API falhar
      const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
      const vendas = JSON.parse(localStorage.getItem('vendas') || '[]');
      
      const receitaTotal = vendas.reduce((acc, venda) => acc + (venda.total || 0), 0);
      const totalVendas = vendas.length;
      const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0;
      const produtosAtivos = produtos.length;

      // Cálculo de produtos mais vendidos (fallback)
      const produtosVendidos = {};
      vendas.forEach(venda => {
        if (venda.itens) {
          venda.itens.forEach(item => {
            const nomeProduto = item.nome || `Produto ${item.id}`;
            const quantidade = item.qtd || item.quantidade || 0;
            
            if (produtosVendidos[nomeProduto]) {
              produtosVendidos[nomeProduto] += quantidade;
            } else {
              produtosVendidos[nomeProduto] = quantidade;
            }
          });
        }
      });

      const produtosMaisVendidos = Object.entries(produtosVendidos)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([nome, quantidade]) => ({ nome, quantidade }));

      // Cálculo de formas de pagamento (fallback)
      const formasPagamento = {};
      vendas.forEach(venda => {
        const metodo = venda.metodoPagamento || 'desconhecido';
        formasPagamento[metodo] = (formasPagamento[metodo] || 0) + 1;
      });

      setDadosRelatorios({
        receitaTotal,
        totalVendas,
        ticketMedio,
        produtosAtivos,
        produtosMaisVendidos,
        formasPagamento
      });
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError);
      setError('Não foi possível carregar os dados');
    }
  };

  const Card = ({ title, value, subtitle, icon }) => {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-gray-700 text-sm font-medium">{title}</h2>
            {icon}
          </div>
          <div className="text-2xl font-bold mb-1">{value}</div>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>
      </div>
    );
  };

  const ProdutoMaisVendidoCard = () => {
    if (dadosRelatorios.produtosMaisVendidos.length === 0) {
      return (
        <Card
          title="Produtos mais vendidos"
          value="—"
          subtitle="Nenhuma venda registrada"
          icon={<Trophy className="text-yellow-500" size={20} />}
        />
      );
    }

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-gray-700 text-sm font-medium">Produtos mais vendidos</h2>
          <Trophy className="text-yellow-500" size={20} />
        </div>
        <div className="space-y-2">
          {dadosRelatorios.produtosMaisVendidos.map((produto, index) => (
            <div key={produto.nome} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 truncate flex-1 mr-2">
                {index + 1}. {produto.nome}
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {produto.quantidade} un.
              </span>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-sm mt-3">Top 3 produtos</p>
      </div>
    );
  };

  const FormasPagamentoCard = () => {
    if (Object.keys(dadosRelatorios.formasPagamento).length === 0) {
      return (
        <Card
          title="Formas de pagamento"
          value="—"
          subtitle="Nenhuma venda registrada"
          icon={<Wallet className="text-purple-600" size={20} />}
        />
      );
    }

    const totalVendas = dadosRelatorios.totalVendas;

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-gray-700 text-sm font-medium">Formas de pagamento</h2>
          <Wallet className="text-purple-600" size={20} />
        </div>
        <div className="space-y-2">
          {Object.entries(dadosRelatorios.formasPagamento).map(([metodo, quantidade]) => {
            const porcentagem = totalVendas > 0 ? ((quantidade / totalVendas) * 100).toFixed(1) : 0;
            return (
              <div key={metodo} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{metodo}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-purple-600">
                    {quantidade}
                  </span>
                  <span className="text-xs text-gray-500">({porcentagem}%)</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-gray-500 text-sm mt-3">Distribuição por método</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Relatórios</h1>
          <p className="text-gray-500">Análise de desempenho do negócio</p>
        </div>
        
        <div className="flex items-center gap-4">
          {error && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <button 
            onClick={carregarDadosRelatorios}
            disabled={loading}
            className="border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          title="Receita Total"
          value={`R$ ${dadosRelatorios.receitaTotal.toFixed(2)}`}
          subtitle={`Em ${dadosRelatorios.totalVendas} vendas`}
          icon={<DollarSign className="text-blue-600" size={20} />}
        />
        
        <Card
          title="Total de Vendas"
          value={dadosRelatorios.totalVendas}
          subtitle="Transações realizadas"
          icon={<TrendingUp className="text-green-600" size={20} />}
        />
        
        <Card
          title="Ticket Médio"
          value={`R$ ${dadosRelatorios.ticketMedio.toFixed(2)}`}
          subtitle="Valor médio por venda"
          icon={<CreditCard className="text-blue-600" size={20} />}
        />
        
        <Card
          title="Produtos Ativos"
          value={dadosRelatorios.produtosAtivos}
          subtitle="Produtos Cadastrados"
          icon={<Package className="text-green-600" size={20} />}
        />
        
        <ProdutoMaisVendidoCard />
        <FormasPagamentoCard />
      </div>

      {/* Estatísticas Adicionais */}
      {dadosRelatorios.totalVendas > 0 && (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Estatísticas Detalhadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dadosRelatorios.totalVendas}
              </div>
              <div className="text-sm text-gray-600">Total de Vendas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                R$ {dadosRelatorios.receitaTotal.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Faturamento Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(dadosRelatorios.formasPagamento).length}
              </div>
              <div className="text-sm text-gray-600">Formas de Pagamento Utilizadas</div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem quando não há dados */}
      {dadosRelatorios.totalVendas === 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <Package className="text-yellow-500 mx-auto mb-3" size={32} />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Nenhuma venda registrada
          </h3>
          <p className="text-yellow-600">
            Realize vendas no sistema para visualizar os relatórios e estatísticas.
          </p>
        </div>
      )}
    </div>
  );
}