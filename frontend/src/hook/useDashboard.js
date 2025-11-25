// hooks/useDashboard.js
import { useState, useEffect } from 'react';
import produtoService from '../service/produtoService';
import clienteService from '../service/clienteService';
import vendaService from '../service/vendaService';

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      vendasHoje: 0,
      totalProdutos: 0,
      totalClientes: 0,
      estoqueBaixo: 0,
      receitaTotal: 0
    },
    produtosEstoqueBaixo: [],
    vendasRecentes: [],
    loading: true,
    error: null
  });

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

  const carregarDadosDashboard = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      // Carregar dados em paralelo
      const [produtosResponse, clientesResponse, vendasResponse] = await Promise.all([
        produtoService.listarProdutos().catch(error => {
          console.error('Erro ao carregar produtos:', error);
          const produtosLocal = JSON.parse(localStorage.getItem('produtos') || '[]');
          return { produtos: produtosLocal };
        }),
        clienteService.listarClientes().catch(error => {
          console.error('Erro ao carregar clientes:', error);
          const clientesLocal = JSON.parse(localStorage.getItem('clientes') || '[]');
          return { clientes: clientesLocal };
        }),
        // AGORA: listarVendas() sem limite para pegar TODAS as vendas
        vendaService.listarVendas().catch(error => {
          console.error('Erro ao carregar vendas:', error);
          const vendasLocal = JSON.parse(localStorage.getItem('vendas') || '[]');
          return { vendas: vendasLocal };
        })
      ]);

      const produtos = produtosResponse.produtos || produtosResponse || [];
      const clientes = clientesResponse.clientes || clientesResponse || [];
      const todasVendas = vendasResponse.vendas || vendasResponse || [];

      // Filtrar vendas de HOJE
      const vendasHoje = todasVendas.filter(venda => {
        const dataVenda = venda.createdAt || venda.data;
        return isHoje(dataVenda);
      });

      // Ordenar vendas por data (mais recentes primeiro) e pegar as 5 primeiras APENAS para "vendas recentes"
      const vendasRecentes = todasVendas
        .sort((a, b) => new Date(b.createdAt || b.data) - new Date(a.createdAt || a.data))
        .slice(0, 5);

      // Calcular estatísticas
      const receitaHoje = vendasHoje.reduce((acc, venda) => acc + (venda.total || 0), 0);
      const estoqueBaixo = produtos.filter(prod => prod.estoque <= 5).length;
      const produtosBaixo = produtos.filter(prod => prod.estoque <= 5);

      setDashboardData({
        stats: {
          vendasHoje: vendasHoje.length,
          totalProdutos: produtos.length,
          totalClientes: clientes.length,
          estoqueBaixo,
          receitaTotal: receitaHoje
        },
        produtosEstoqueBaixo: produtosBaixo,
        vendasRecentes,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      
      // Fallback completo
      try {
        const produtosLocal = JSON.parse(localStorage.getItem('produtos') || '[]');
        const clientesLocal = JSON.parse(localStorage.getItem('clientes') || '[]');
        const vendasLocal = JSON.parse(localStorage.getItem('vendas') || '[]');
        
        // Filtrar vendas de HOJE no fallback também
        const vendasHoje = vendasLocal.filter(venda => {
          const dataVenda = venda.data || venda.createdAt;
          return isHoje(dataVenda);
        });
        
        const receitaHoje = vendasHoje.reduce((acc, venda) => acc + venda.total, 0);
        const estoqueBaixo = produtosLocal.filter(prod => prod.estoque <= 5).length;
        const produtosBaixo = produtosLocal.filter(prod => prod.estoque <= 5);

        // Ordenar vendas para as recentes (apenas 5 para display)
        const vendasRecentesFallback = vendasLocal
          .sort((a, b) => new Date(b.data || b.createdAt) - new Date(a.data || a.createdAt))
          .slice(0, 5);

        setDashboardData({
          stats: {
            vendasHoje: vendasHoje.length,
            totalProdutos: produtosLocal.length,
            totalClientes: clientesLocal.length,
            estoqueBaixo,
            receitaTotal: receitaHoje
          },
          produtosEstoqueBaixo: produtosBaixo,
          vendasRecentes: vendasRecentesFallback,
          loading: false,
          error: 'Usando dados locais (API indisponível)'
        });
      } catch {
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar dados do dashboard'
        }));
      }
    }
  };

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  return {
    ...dashboardData,
    recarregar: carregarDadosDashboard
  };
};