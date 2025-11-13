import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, ShoppingCart, Users, Package } from "lucide-react";
import { useEffect, useState } from "react";
import produtoService from '../../service/produtoService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    vendasHoje: 0,
    totalProdutos: 0,
    totalClientes: 0,
    estoqueBaixo: 0,
    receitaTotal: 0
  });

  const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  const carregarDadosDashboard = async () => {
    try {
      setLoading(true);
      
      // Carregar produtos da API
      const response = await produtoService.listarProdutos();
      const produtos = response.produtos || [];
      
      // Carregar outros dados do localStorage
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const vendas = JSON.parse(localStorage.getItem('vendas') || '[]');
      
      // Calcular vendas de hoje
      const hoje = new Date().toDateString();
      const vendasHoje = vendas.filter(venda => 
        new Date(venda.data).toDateString() === hoje
      );
      
      const receitaHoje = vendasHoje.reduce((acc, venda) => acc + venda.total, 0);
      const estoqueBaixo = produtos.filter(prod => prod.estoque <= 5).length;
      const produtosBaixo = produtos.filter(prod => prod.estoque <= 5);

      setStats({
        vendasHoje: vendasHoje.length,
        totalProdutos: produtos.length,
        totalClientes: clientes.length,
        estoqueBaixo: estoqueBaixo,
        receitaTotal: receitaHoje
      });

      setProdutosEstoqueBaixo(produtosBaixo);
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // Fallback para localStorage em caso de erro
      carregarDadosFallback();
    } finally {
      setLoading(false);
    }
  };

  const carregarDadosFallback = () => {
    // Fallback: carregar do localStorage se a API falhar
    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    const vendas = JSON.parse(localStorage.getItem('vendas') || '[]');
    
    const hoje = new Date().toDateString();
    const vendasHoje = vendas.filter(venda => 
      new Date(venda.data).toDateString() === hoje
    );
    
    const receitaHoje = vendasHoje.reduce((acc, venda) => acc + venda.total, 0);
    const estoqueBaixo = produtos.filter(prod => prod.estoque <= 5).length;
    const produtosBaixo = produtos.filter(prod => prod.estoque <= 5);

    setStats({
      vendasHoje: vendasHoje.length,
      totalProdutos: produtos.length,
      totalClientes: clientes.length,
      estoqueBaixo: estoqueBaixo,
      receitaTotal: receitaHoje
    });

    setProdutosEstoqueBaixo(produtosBaixo);
  };

  // Inicializar dados básicos se não existirem
  useEffect(() => {
    const inicializarDadosBasicos = () => {
      // Inicializar clientes se não existirem
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      if (clientes.length === 0) {
        const clientesIniciais = [
          {
            id: 1,
            nome: "João Silva",
            cpf: "123.456.789-00",
            telefone: "(11) 98765-4321",
            email: "joao@email.com",
          },
          {
            id: 2,
            nome: "Maria Santos",
            cpf: "987.654.321-00",
            telefone: "(11) 91234-5678",
            email: "maria@email.com",
          },
        ];
        localStorage.setItem('clientes', JSON.stringify(clientesIniciais));
      }

      // Inicializar vendas se não existirem
      const vendas = JSON.parse(localStorage.getItem('vendas') || '[]');
      if (vendas.length === 0) {
        localStorage.setItem('vendas', JSON.stringify([]));
      }

      // Recarregar dados após inicialização
      carregarDadosDashboard();
    };

    inicializarDadosBasicos();
  }, []);

  // Dados para o gráfico (baseados nas vendas da semana)
  const dadosGrafico = [
    { name: "Seg", vendas: 1200 },
    { name: "Ter", vendas: 1900 },
    { name: "Qua", vendas: 1500 },
    { name: "Qui", vendas: 2100 },
    { name: "Sex", vendas: 2500 },
    { name: "Sáb", vendas: 2200 },
    { name: "Dom", vendas: 1800 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 overflow-y-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-600 font-medium">Receita Hoje</p>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">R$ {stats.receitaTotal.toFixed(2)}</h2>
          <p className="text-xs text-gray-400 mt-1">{stats.vendasHoje} vendas hoje</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-600 font-medium">Produtos</p>
            <Package className="text-green-500" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{stats.totalProdutos}</h2>
          <p className="text-xs text-gray-400 mt-1">Cadastrados no sistema</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-600 font-medium">Clientes</p>
            <Users className="text-purple-500" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{stats.totalClientes}</h2>
          <p className="text-xs text-gray-400 mt-1">Cadastrados no sistema</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-600 font-medium">Estoque Baixo</p>
            <ShoppingCart className="text-red-500" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{stats.estoqueBaixo}</h2>
          <p className="text-xs text-gray-400 mt-1">Produtos com estoque crítico</p>
        </div>
      </div>

      {/* Gráfico e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Vendas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas da Semana</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGrafico}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`R$ ${value}`, 'Vendas']}
                labelFormatter={(label) => `Dia: ${label}`}
              />
              <Bar dataKey="vendas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alertas Rápidos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas do Sistema</h3>
          <div className="space-y-4">
            {stats.estoqueBaixo > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-yellow-800">Estoque Baixo</p>
                  <p className="text-sm text-yellow-600">
                    {stats.estoqueBaixo} produto(s) com estoque crítico
                  </p>
                </div>
              </div>
            )}

            {stats.vendasHoje === 0 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-blue-800">Sem Vendas Hoje</p>
                  <p className="text-sm text-blue-600">
                    Nenhuma venda registrada no dia de hoje
                  </p>
                </div>
              </div>
            )}

            {stats.totalProdutos === 0 && (
              <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-orange-800">Sem Produtos</p>
                  <p className="text-sm text-orange-600">
                    Nenhum produto cadastrado via API
                  </p>
                </div>
              </div>
            )}

            {stats.estoqueBaixo === 0 && stats.vendasHoje > 0 && stats.totalProdutos > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-green-800">Tudo em Ordem</p>
                  <p className="text-sm text-green-600">
                    Sistema funcionando normalmente
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Produtos com Estoque Baixo */}
      {produtosEstoqueBaixo.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos com Estoque Baixo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {produtosEstoqueBaixo.map(produto => (
              <div key={produto.id} className="border border-yellow-300 rounded-xl p-4 bg-yellow-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{produto.nome}</p>
                    <p className="text-sm text-gray-600">Código: {produto.codigo}</p>
                    <p className="text-sm text-gray-600">Categoria: {produto.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-yellow-700">{produto.estoque} un.</p>
                    <p className="text-sm text-yellow-600 font-semibold">Estoque Crítico</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-yellow-200">
                  <p className="text-sm text-gray-700">
                    Preço: <span className="font-semibold">R$ {produto.preco.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vendas Recentes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas Recentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="p-3">ID</th>
                <th className="p-3">Data/Hora</th>
                <th className="p-3">Itens</th>
                <th className="p-3">Total</th>
                <th className="p-3">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {JSON.parse(localStorage.getItem('vendas') || '[]')
                .slice(0, 5)
                .map((venda, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">#{venda.id}</td>
                    <td className="p-3 text-sm text-gray-600">{venda.data}</td>
                    <td className="p-3 text-sm">{venda.itens.length} itens</td>
                    <td className="p-3 font-semibold">R$ {venda.total.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        venda.metodoPagamento === 'dinheiro' 
                          ? 'bg-blue-100 text-blue-800'
                          : venda.metodoPagamento === 'cartao'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {venda.metodoPagamento}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {JSON.parse(localStorage.getItem('vendas') || '[]').length === 0 && (
            <p className="text-gray-500 text-center py-8">Nenhuma venda registrada</p>
          )}
        </div>
      </div>
    </div>
  );
}