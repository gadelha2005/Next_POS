// hooks/useRelatorios.js
import { useState, useEffect } from 'react';
import produtoService from '../service/produtoService';
import vendaService from '../service/vendaService';

export const useRelatorios = () => {
  const [dadosRelatorios, setDadosRelatorios] = useState({
    receitaTotal: 0,
    totalVendas: 0,
    ticketMedio: 0,
    produtosAtivos: 0,
    produtosMaisVendidos: [],
    formasPagamento: {},
    loading: true,
    error: null
  });

  const processarDadosVendas = (vendas, produtos) => {
    if (!vendas || vendas.length === 0) {
      return {
        receitaTotal: 0,
        totalVendas: 0,
        ticketMedio: 0,
        produtosMaisVendidos: [],
        formasPagamento: {}
      };
    }

    // Calcular receita total e totais - AGORA com TODAS as vendas
    const receitaTotal = vendas.reduce((acc, venda) => acc + (venda.total || 0), 0);
    const totalVendas = vendas.length;
    const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0;

    // Produtos mais vendidos - processa TODAS as vendas
    const produtosVendidos = {};
    vendas.forEach(venda => {
      if (venda.itens && Array.isArray(venda.itens)) {
        venda.itens.forEach(item => {
          const produtoId = item.produtoId;
          const quantidade = item.quantidade || 0;
          
          // Buscar nome do produto na lista de produtos
          const produto = produtos.find(p => p.id === produtoId);
          const nomeProduto = produto ? produto.nome : `Produto ${produtoId}`;
          
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

    // Formas de pagamento - processa TODAS as vendas
    const formasPagamento = {};
    vendas.forEach(venda => {
      const metodo = venda.metodoPagamento ? 
        venda.metodoPagamento.toLowerCase() : 'desconhecido';
      formasPagamento[metodo] = (formasPagamento[metodo] || 0) + 1;
    });

    return {
      receitaTotal,
      totalVendas,
      ticketMedio,
      produtosMaisVendidos,
      formasPagamento
    };
  };

  const carregarDadosRelatorios = async () => {
    try {
      setDadosRelatorios(prev => ({ ...prev, loading: true, error: null }));
      
      // Carregar dados em paralelo
      const [produtosResponse, vendasResponse] = await Promise.all([
        produtoService.listarProdutos().catch(error => {
          console.error('Erro ao carregar produtos:', error);
          // Fallback para localStorage
          const produtosLocal = JSON.parse(localStorage.getItem('produtos') || '[]');
          return { produtos: produtosLocal };
        }),
        // AGORA: listarVendas() sem filtros para pegar TODAS as vendas
        vendaService.listarVendas().catch(error => {
          console.error('Erro ao carregar vendas:', error);
          // Fallback para localStorage
          const vendasLocal = JSON.parse(localStorage.getItem('vendas') || '[]');
          return { vendas: vendasLocal };
        })
      ]);

      const produtos = produtosResponse.produtos || produtosResponse || [];
      const vendas = vendasResponse.vendas || vendasResponse || [];

      // Processar dados - AGORA com TODAS as vendas
      const dadosProcessados = processarDadosVendas(vendas, produtos);
      const produtosAtivos = produtos.length;

      setDadosRelatorios({
        ...dadosProcessados,
        produtosAtivos,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error);
      
      // Fallback completo com localStorage
      try {
        const produtosLocal = JSON.parse(localStorage.getItem('produtos') || '[]');
        const vendasLocal = JSON.parse(localStorage.getItem('vendas') || '[]');
        
        // Processa TODAS as vendas do localStorage
        const dadosProcessados = processarDadosVendas(vendasLocal, produtosLocal);
        
        setDadosRelatorios({
          ...dadosProcessados,
          produtosAtivos: produtosLocal.length,
          loading: false,
          error: 'Usando dados locais (API indisponível)'
        });
      } catch {
        setDadosRelatorios(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar dados dos relatórios'
        }));
      }
    }
  };

  useEffect(() => {
    carregarDadosRelatorios();
  }, []);

  return {
    ...dadosRelatorios,
    recarregar: carregarDadosRelatorios
  };
};