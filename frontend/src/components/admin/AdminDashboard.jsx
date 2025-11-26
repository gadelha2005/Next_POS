import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, ShoppingCart, Users, Package, RefreshCw, AlertCircle, Eye, X, Download } from "lucide-react";
import { useEffect, useState } from "react";
import produtoService from '../../service/produtoService';
import clienteService from '../../service/clienteService'; 
import vendaService from '../../service/vendaService'; 
import ReciboService from '../../service/reciboService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    vendasHoje: 0,
    totalProdutos: 0,
    totalClientes: 0,
    estoqueBaixo: 0,
    receitaTotal: 0
  });

  const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState([]);
  const [vendasRecentes, setVendasRecentes] = useState([]);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [showDetalhesVenda, setShowDetalhesVenda] = useState(false);
  const [baixandoRecibo, setBaixandoRecibo] = useState(false);

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  const baixarRecibo = async (venda) => {
    try {
      setBaixandoRecibo(true);
      
      // Formatar os dados da venda para o recibo
      const dadosVendaRecibo = {
        id: venda.id,
        numero: venda.id,
        data: venda.createdAt || venda.data,
        createdAt: venda.createdAt || venda.data,
        itens: venda.itens || [],
        total: venda.total || 0,
        subtotal: venda.total || 0,
        desconto: venda.desconto || 0,
        metodoPagamento: venda.metodoPagamento || 'N/A',
        valorRecebido: venda.valorRecebido || venda.total || 0,
        troco: venda.troco || 0,
        operador: venda.usuario?.nome || venda.operador || 'Operador',
        usuario: venda.usuario || { nome: 'Operador' },
        user: venda.user || { nome: 'Operador' },
        cliente: venda.cliente || null
      };

      // Gerar o recibo
      const sucesso = await ReciboService.gerarRecibo(dadosVendaRecibo);
      
      if (sucesso) {
        console.log('Recibo baixado com sucesso');
      } else {
        console.error('Erro ao baixar recibo');
        alert('Erro ao baixar recibo. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao baixar recibo:', error);
      alert('Erro ao baixar recibo: ' + error.message);
    } finally {
      setBaixandoRecibo(false);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'Data inválida';
    
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dataString;
    }
  };

  // Função para verificar se uma data é hoje
  const isHoje = (dataString) => {
    if (!dataString) return false;
    
    try {
      const dataVenda = new Date(dataString);
      const hoje = new Date();
      
      return dataVenda.toDateString() === hoje.toDateString();
    } catch {
      return false;
    }
  };

  // Função para gerar dados do gráfico baseado nas vendas reais - CORRIGIDA A ORDEM
  const gerarDadosGrafico = (vendas) => {
    if (!vendas || vendas.length === 0) {
      // Retorna dados vazios na ordem correta: Domingo a Sábado
      return [
        { name: "Dom", vendas: 0, dataCompleta: "Domingo" },
        { name: "Seg", vendas: 0, dataCompleta: "Segunda-feira" },
        { name: "Ter", vendas: 0, dataCompleta: "Terça-feira" },
        { name: "Qua", vendas: 0, dataCompleta: "Quarta-feira" },
        { name: "Qui", vendas: 0, dataCompleta: "Quinta-feira" },
        { name: "Sex", vendas: 0, dataCompleta: "Sexta-feira" },
        { name: "Sáb", vendas: 0, dataCompleta: "Sábado" }
      ];
    }

    // Obter os últimos 7 dias começando do Domingo
    const hoje = new Date();
    const ultimos7Dias = [];
    
    // Encontrar o último Domingo
    const ultimoDomingo = new Date(hoje);
    ultimoDomingo.setDate(hoje.getDate() - hoje.getDay()); // Subtrai os dias desde o último Domingo
    
    // Gerar os 7 dias a partir do Domingo
    for (let i = 0; i < 7; i++) {
      const data = new Date(ultimoDomingo);
      data.setDate(ultimoDomingo.getDate() + i);
      ultimos7Dias.push(data.toDateString());
    }

    // Nomes dos dias da semana em português na ordem correta
    const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const nomesCompletos = [
      'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
      'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];

    // Calcular vendas por dia na ordem correta
    const vendasPorDia = ultimos7Dias.map((dataString, index) => {
      const data = new Date(dataString);
      const nomeDia = nomesDias[index];
      const nomeCompleto = nomesCompletos[index];
      
      const vendasDoDia = vendas.filter(venda => {
        const dataVenda = new Date(venda.createdAt || venda.data);
        return dataVenda.toDateString() === dataString;
      });

      const totalVendas = vendasDoDia.reduce((acc, venda) => acc + (venda.total || 0), 0);

      return {
        name: nomeDia,
        vendas: totalVendas,
        dataCompleta: data.toLocaleDateString('pt-BR') + ` (${nomeCompleto})`
      };
    });

    return vendasPorDia;
  };

  const carregarDadosDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('Iniciando carregamento...');
      
      // Carregar dados em paralelo
      const [produtosResponse, clientesResponse, vendasResponse] = await Promise.all([
        produtoService.listarProdutos().catch(error => {
          console.error('Erro ao carregar produtos:', error);
          throw new Error('Erro ao carregar produtos');
        }),
        clienteService.listarClientes().catch(error => {
          console.error('Erro ao carregar clientes:', error);
          throw new Error('Erro ao carregar clientes');
        }),
        vendaService.listarVendas().catch(error => {
          console.error('Erro ao carregar vendas:', error);
          throw new Error('Erro ao carregar vendas');
        })
      ]);

      const produtos = produtosResponse.produtos || [];
      const clientes = clientesResponse.clientes || [];
      const todasVendas = vendasResponse.vendas || vendasResponse || [];

      // Filtrar vendas de HOJE
      const vendasHoje = todasVendas.filter(venda => {
        const dataVenda = venda.createdAt || venda.data;
        return isHoje(dataVenda);
      });

      // Ordenar vendas por data (mais recentes primeiro) e pegar as 5 primeiras
      const vendasRecentesOrdenadas = todasVendas
        .sort((a, b) => new Date(b.createdAt || b.data) - new Date(a.createdAt || a.data))
        .slice(0, 5);

      // Gerar dados do gráfico com vendas reais
      const dadosGraficoReais = gerarDadosGrafico(todasVendas);

      // Calcular estatísticas
      const receitaHoje = vendasHoje.reduce((acc, venda) => acc + (venda.total || 0), 0);
      const estoqueBaixo = produtos.filter(prod => prod.estoque <= 5).length;
      const produtosBaixo = produtos.filter(prod => prod.estoque <= 5);

      // Atualizar info de debug
      setDebugInfo(`Vendas: ${todasVendas.length} | Hoje: ${vendasHoje.length} | Receita: R$ ${receitaHoje.toFixed(2)}`);

      setStats({
        vendasHoje: vendasHoje.length,
        totalProdutos: produtos.length,
        totalClientes: clientes.length,
        estoqueBaixo: estoqueBaixo,
        receitaTotal: receitaHoje
      });

      setProdutosEstoqueBaixo(produtosBaixo);
      setVendasRecentes(vendasRecentesOrdenadas);
      setDadosGrafico(dadosGraficoReais);
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError(error.message);
      setDebugInfo(`Erro: ${error.message}`);
      carregarDadosFallback();
    } finally {
      setLoading(false);
    }
  };

  const carregarDadosFallback = () => {
    try {
      setDebugInfo('Usando fallback para localStorage...');
      
      // Fallback: carregar do localStorage se a API falhar
      const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const vendas = JSON.parse(localStorage.getItem('vendas') || '[]');
      
      // Filtrar vendas de HOJE no fallback também
      const vendasHoje = vendas.filter(venda => {
        const dataVenda = venda.data || venda.createdAt;
        return isHoje(dataVenda);
      });
      
      const receitaHoje = vendasHoje.reduce((acc, venda) => acc + (venda.total || 0), 0);
      const estoqueBaixo = produtos.filter(prod => prod.estoque <= 5).length;
      const produtosBaixo = produtos.filter(prod => prod.estoque <= 5);

      // Ordenar vendas para as recentes
      const vendasRecentesFallback = vendas
        .sort((a, b) => new Date(b.data || b.createdAt) - new Date(a.data || a.createdAt))
        .slice(0, 5);

      // Gerar dados do gráfico com fallback
      const dadosGraficoFallback = gerarDadosGrafico(vendas);

      setDebugInfo(`Fallback - Vendas: ${vendas.length} | Hoje: ${vendasHoje.length}`);

      setStats({
        vendasHoje: vendasHoje.length,
        totalProdutos: produtos.length,
        totalClientes: clientes.length,
        estoqueBaixo: estoqueBaixo,
        receitaTotal: receitaHoje
      });

      setProdutosEstoqueBaixo(produtosBaixo);
      setVendasRecentes(vendasRecentesFallback);
      setDadosGrafico(dadosGraficoFallback);
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError);
      setError('Não foi possível carregar os dados');
      setDebugInfo('Erro no fallback');
    }
  };

  // Função para abrir detalhes da venda
  const abrirDetalhesVenda = (venda) => {
    setVendaSelecionada(venda);
    setShowDetalhesVenda(true);
  };

  // Função para fechar detalhes da venda
  const fecharDetalhesVenda = () => {
    setShowDetalhesVenda(false);
    setVendaSelecionada(null);
  };

  // Tooltip customizado para o gráfico
  const CustomTooltip = ({ active, payload}) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.dataCompleta}</p>
          <p className="text-blue-600 font-bold">
            R$ {payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu negócio</p>
        </div>
        
        <div className="flex items-center gap-4">
          {error && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <button 
            onClick={carregarDadosDashboard}
            disabled={loading}
            className="border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      
      {debugInfo && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-1">Informações do Sistema</h4>
          <p className="text-xs text-blue-600">{debugInfo}</p>
        </div>
      )}

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
        {/* Gráfico de Vendas - AGORA NA ORDEM CORRETA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vendas da Semana</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Total: R$ {dadosGrafico.reduce((acc, dia) => acc + dia.vendas, 0).toFixed(2)}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGrafico}>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="vendas" 
                fill="#3b82f6" 
                radius={[6, 6, 0, 0]}
                name="Vendas"
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              {dadosGrafico.some(dia => dia.vendas > 0) 
                ? 'Dados baseados em vendas da semana atual' 
                : 'Nenhuma venda registrada na semana atual'
              }
            </p>
          </div>
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
                    Nenhum produto cadastrado no sistema
                  </p>
                </div>
              </div>
            )}

            {stats.totalClientes === 0 && (
              <div className="flex items-start space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-purple-800">Sem Clientes</p>
                  <p className="text-sm text-purple-600">
                    Nenhum cliente cadastrado no sistema
                  </p>
                </div>
              </div>
            )}

            {stats.estoqueBaixo === 0 && stats.vendasHoje > 0 && stats.totalProdutos > 0 && stats.totalClientes > 0 && (
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
                    Preço: <span className="font-semibold">R$ {produto.preco?.toFixed(2) || '0.00'}</span>
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
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendasRecentes.map((venda, index) => {
                const isVendaHoje = isHoje(venda.createdAt || venda.data);
                return (
                  <tr key={venda.id || index} className={`border-b hover:bg-gray-50 ${isVendaHoje ? 'bg-blue-50' : ''}`}>
                    <td className="p-3 font-medium">
                      #{venda.id || `TEMP-${index + 1}`}
                      {isVendaHoje && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">Hoje</span>}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {formatarData(venda.createdAt || venda.data)}
                    </td>
                    <td className="p-3 text-sm">{venda.itens ? venda.itens.length : 0} itens</td>
                    <td className="p-3 font-semibold">R$ {venda.total ? venda.total.toFixed(2) : '0.00'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        venda.metodoPagamento === 'DINHEIRO' || venda.metodoPagamento === 'dinheiro' 
                          ? 'bg-blue-100 text-blue-800'
                          : venda.metodoPagamento === 'CARTAO' || venda.metodoPagamento === 'cartao'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {venda.metodoPagamento ? venda.metodoPagamento.toLowerCase() : 'N/A'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => abrirDetalhesVenda(venda)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <Eye size={14} />
                        Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {vendasRecentes.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nenhuma venda registrada</p>
          )}
        </div>
      </div>

      {/* Popup de Detalhes da Venda */}
       {showDetalhesVenda && vendaSelecionada && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-bold">Detalhes da Venda #{vendaSelecionada.id}</h3>
          <button 
            onClick={fecharDetalhesVenda}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Botão de Baixar Recibo */}
          <div className="flex justify-end">
            <button
              onClick={() => baixarRecibo(vendaSelecionada)}
              disabled={baixandoRecibo}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center gap-2"
            >
              {baixandoRecibo ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Baixar Recibo
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Data e Hora</p>
              <p className="font-medium">{formatarData(vendaSelecionada.createdAt || vendaSelecionada.data)}</p>
            </div>
            <div>
              <p className="text-gray-600">Operador</p>
              <p className="font-medium">{vendaSelecionada.usuario?.nome ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Método de Pagamento</p>
              <p className="font-medium capitalize">{vendaSelecionada.metodoPagamento || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Valor Recebido</p>
              <p className="font-medium">R$ {vendaSelecionada.valorRecebido ? vendaSelecionada.valorRecebido.toFixed(2) : '0.00'}</p>
            </div>
            {vendaSelecionada.cliente && (
              <div className="col-span-2">
                <p className="text-gray-600">Cliente</p>
                <p className="font-medium">
                  {vendaSelecionada.cliente.nome}
                  {vendaSelecionada.cliente.cpfCnpj && (
                    <span className="text-gray-500 text-sm block">
                      CPF/CNPJ: {vendaSelecionada.cliente.cpfCnpj}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-2">Itens da Venda</h4>
            <div className="space-y-2">
              {vendaSelecionada.itens && vendaSelecionada.itens.length > 0 ? (
                vendaSelecionada.itens.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{item.produto?.nome || item.nome}</p>
                      <p className="text-gray-500 text-sm">
                        {item.quantidade || item.qtd || 1} x R$ {item.precoUnitario || item.preco || 0}
                      </p>
                    </div>
                    <p className="font-semibold">
                      R$ {((item.quantidade || item.qtd || 1) * (item.precoUnitario || item.preco || 0)).toFixed(2)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum item encontrado</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {vendaSelecionada.total ? vendaSelecionada.total.toFixed(2) : '0.00'}</span>
            </div>
            {vendaSelecionada.metodoPagamento === "dinheiro" && vendaSelecionada.valorRecebido && (
              <>
                <div className="flex justify-between">
                  <span>Valor Recebido:</span>
                  <span>R$ {vendaSelecionada.valorRecebido.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-green-600">
                  <span>Troco:</span>
                  <span>R$ {vendaSelecionada.troco ? vendaSelecionada.troco.toFixed(2) : '0.00'}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>R$ {vendaSelecionada.total ? vendaSelecionada.total.toFixed(2) : '0.00'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
);
}