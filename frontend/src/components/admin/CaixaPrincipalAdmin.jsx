import React, { useState, useEffect } from 'react';
import logo from '../../assets/logo.png';
import produtoService from '../../service/produtoService';

function CaixaPrincipalAdmin({ user, onFecharCaixa }) {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState([]);
  const [valorRecebido, setValorRecebido] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("dinheiro");
  const [historicoVendas, setHistoricoVendas] = useState([]);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [showFecharCaixaModal, setShowFecharCaixaModal] = useState(false);
  const [saldoFinal, setSaldoFinal] = useState('');
  const [isFechandoCaixa, setIsFechandoCaixa] = useState(false);
  const [loading, setLoading] = useState(true);
  const [caixaAberto, setCaixaAberto] = useState(true);

  // Carregar produtos da API e vendas do localStorage
  useEffect(() => {
    carregarProdutos();
    carregarVendasRecentes();
    verificarCaixaAberto();
  }, []);

  const verificarCaixaAberto = () => {
    const caixaStatus = localStorage.getItem('caixaAberto');
    if (caixaStatus === 'false') {
      setCaixaAberto(false);
    } else {
      setCaixaAberto(true);
      localStorage.setItem('caixaAberto', 'true');
    }
  };

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const response = await produtoService.listarProdutos();
      setProdutos(response.produtos || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      const produtosSalvos = JSON.parse(localStorage.getItem('produtos') || '[]');
      setProdutos(produtosSalvos);
    } finally {
      setLoading(false);
    }
  };

  const carregarVendasRecentes = () => {
    const vendasSalvas = JSON.parse(localStorage.getItem('vendas') || '[]');
    setHistoricoVendas(vendasSalvas.slice(0, 5));
  };

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    p.codigo.includes(busca)
  );

  const adicionarCarrinho = (produto) => {
    if (produto.estoque <= 0) {
      return;
    }

    setCarrinho(prev => {
      const existe = prev.find(item => item.id === produto.id);
      if (existe) {
        if (existe.qtd + 1 > produto.estoque) {
          return prev;
        }
        return prev.map(item =>
          item.id === produto.id ? { ...item, qtd: item.qtd + 1 } : item
        );
      }
      return [...prev, { ...produto, qtd: 1 }];
    });
  };

  const removerItem = (id) => setCarrinho(prev => prev.filter(item => item.id !== id));

  const alterarQuantidade = (id, novaQuantidade) => {
    if (novaQuantidade < 1) {
      removerItem(id);
      return;
    }

    const produto = produtos.find(p => p.id === id);
    if (produto && novaQuantidade > produto.estoque) {
      return;
    }

    setCarrinho(prev => 
      prev.map(item => 
        item.id === id ? { ...item, qtd: novaQuantidade } : item
      )
    );
  };

  const subtotal = carrinho.reduce((acc, item) => acc + item.preco * item.qtd, 0);
  const desconto = 0;
  const total = subtotal - desconto;

  const troco =
    valorRecebido && Number(valorRecebido) > total
      ? (Number(valorRecebido) - total).toFixed(2)
      : 0;

  const finalizarVenda = async () => {
    if (metodoPagamento === "dinheiro" && Number(valorRecebido) < total) {
      alert("Valor recebido insuficiente!");
      return;
    }

    const vendaId = Math.floor(1000 + Math.random() * 9000);
    const novaVenda = {
      id: vendaId,
      data: new Date().toLocaleString('pt-BR'),
      itens: [...carrinho],
      total: total,
      metodoPagamento: metodoPagamento,
      valorRecebido: metodoPagamento === "dinheiro" ? Number(valorRecebido) : total,
      troco: metodoPagamento === "dinheiro" ? troco : 0,
      operador: user.nome
    };

    // Salvar venda no localStorage
    const vendasExistentes = JSON.parse(localStorage.getItem('vendas') || '[]');
    const novasVendas = [novaVenda, ...vendasExistentes];
    localStorage.setItem('vendas', JSON.stringify(novasVendas));

    // Atualizar estoque dos produtos na API
    try {
      for (const itemCarrinho of carrinho) {
        const produto = produtos.find(p => p.id === itemCarrinho.id);
        if (produto) {
          const novoEstoque = produto.estoque - itemCarrinho.qtd;
          await produtoService.atualizarProduto(produto.id, {
            ...produto,
            estoque: novoEstoque
          });
        }
      }
      
      await carregarProdutos();
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      alert('Venda registrada, mas houve erro ao atualizar estoque na API');
    }

    setHistoricoVendas(prev => [novaVenda, ...prev.slice(0, 4)]);
    
    setCarrinho([]);
    setValorRecebido("");
  };

  const handleFecharCaixa = async () => {
    if (!saldoFinal || isNaN(saldoFinal) || parseFloat(saldoFinal) < 0) {
      alert('Por favor, informe um saldo final válido');
      return;
    }

    setIsFechandoCaixa(true);

    try {
      const token = localStorage.getItem('token');
      
      // Tentar fechar caixa no backend
      const response = await fetch('http://localhost:3333/api/caixa/fechar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          saldoFinal: parseFloat(saldoFinal)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || 'Erro ao fechar caixa';
        
        // Se não há caixa aberto, fechar localmente
        if (errorMessage.includes('Nenhum caixa aberto encontrado')) {
          console.warn('Nenhum caixa aberto encontrado no backend. Fechando localmente.');
          fecharCaixaLocalmente();
          return;
        }
        throw new Error(errorMessage);
      }

      // Sucesso no backend
      localStorage.setItem('caixaAberto', 'false');
      setCaixaAberto(false);
      
      setShowFecharCaixaModal(false);
      setSaldoFinal('');
      
      alert('Caixa fechado com sucesso no sistema!');
      
      if (onFecharCaixa) {
        onFecharCaixa();
      }

    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      
      // Fallback: fechar caixa localmente
      if (error.message.includes('Nenhum caixa aberto encontrado') || error.message.includes('Failed to fetch')) {
        fecharCaixaLocalmente();
      } else {
        alert('Erro ao fechar caixa: ' + error.message);
      }
    } finally {
      setIsFechandoCaixa(false);
    }
  };

  const fecharCaixaLocalmente = () => {
    localStorage.setItem('caixaAberto', 'false');
    setCaixaAberto(false);
    
    // Calcular totais das vendas do dia
    const vendasDoDia = JSON.parse(localStorage.getItem('vendas') || '[]');
    const totalVendas = vendasDoDia.reduce((acc, venda) => acc + venda.total, 0);
    
    // Salvar relatório do caixa
    const relatorioCaixa = {
      data: new Date().toLocaleString('pt-BR'),
      saldoFinal: parseFloat(saldoFinal),
      totalVendas: totalVendas,
      operador: user.nome,
      vendasCount: vendasDoDia.length,
      fechamentoLocal: true
    };
    
    const relatoriosExistentes = JSON.parse(localStorage.getItem('relatoriosCaixa') || '[]');
    localStorage.setItem('relatoriosCaixa', JSON.stringify([relatorioCaixa, ...relatoriosExistentes]));
    
    setShowFecharCaixaModal(false);
    setSaldoFinal('');
    
    alert('Caixa fechado localmente! Total de vendas: R$ ' + totalVendas.toFixed(2));
    
    if (onFecharCaixa) {
      onFecharCaixa();
    }
  };

  const abrirCaixa = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3333/api/caixa/abrir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          saldoInicial: 500.00
        })
      });

      if (response.ok) {
        localStorage.setItem('caixaAberto', 'true');
        setCaixaAberto(true);
        alert('Caixa aberto com sucesso no sistema!');
      } else {
        // Se der erro no backend, abrir localmente
        abrirCaixaLocalmente();
      }
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      abrirCaixaLocalmente();
    }
  };

  const abrirCaixaLocalmente = () => {
    localStorage.setItem('caixaAberto', 'true');
    setCaixaAberto(true);
    alert('Caixa aberto localmente!');
  };

  const precisaValorRecebido = metodoPagamento === "dinheiro";

  const abrirDetalhesVenda = (venda) => {
    setVendaSelecionada(venda);
  };

  const fecharDetalhesVenda = () => {
    setVendaSelecionada(null);
  };

  // Ícones SVG inline
  const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  );

  const CashRegisterIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M2 8h20"/>
      <path d="M10 8v10"/>
      <path d="M14 8v10"/>
      <path d="M6 12h4"/>
      <path d="M14 12h4"/>
    </svg>
  );

  const XCircleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="m15 9-6 6"/>
      <path d="m9 9 6 6"/>
    </svg>
  );

  const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  );

  const MinusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14"/>
    </svg>
  );

  const HistoryIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  const EyeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-6 text-black">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center pb-4">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="NextPOS Logo" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold">NextPOS</h1>
            <p className="text-sm text-gray-600">Administrador: {user.nome}</p>
            <p className="text-sm text-gray-600">
              {caixaAberto ? 'Caixa aberto — Troco: R$ 500,00' : 'Caixa fechado'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {historicoVendas.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Vendas hoje</p>
              <p className="text-lg font-bold text-green-600">{historicoVendas.length}</p>
            </div>
          )}
          
          {/* Botão Finalizar Caixa */}
          {caixaAberto ? (
            <button 
              onClick={() => setShowFecharCaixaModal(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center gap-2"
            >
              <CashRegisterIcon /> Finalizar Caixa
            </button>
          ) : (
            <button 
              onClick={abrirCaixa}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center gap-2"
            >
              <CashRegisterIcon /> Abrir Caixa
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className={`flex gap-4 w-full flex-1 ${!caixaAberto ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Lista de produtos */}
        <div className="flex-1 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center bg-gray-100 p-2 rounded mb-4">
            <SearchIcon />
            <input
              placeholder="Buscar produto ou código"
              className="bg-transparent w-full outline-none ml-2 text-lg"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {produtosFiltrados.map(prod => (
              <div
                key={prod.id}
                onClick={() => adicionarCarrinho(prod)}
                className={`border p-4 rounded-lg cursor-pointer transition duration-200 ${
                  prod.estoque <= 0 
                    ? 'border-red-300 bg-red-50 opacity-60' 
                    : 'border-gray-300 hover:bg-gray-50 hover:border-blue-500'
                }`}
              >
                <div className="bg-gray-200 text-gray-600 flex justify-center items-center h-32 rounded mb-3 text-sm">
                  IMAGEM
                </div>
                <p className="font-semibold text-gray-900 mb-1">{prod.nome}</p>
                <p className="text-sm text-gray-600 mb-1">Código: {prod.codigo}</p>
                <p className="text-blue-600 font-bold text-lg">R$ {prod.preco.toFixed(2)}</p>
                <p className={`text-xs mt-1 ${
                  prod.estoque <= 0 
                    ? 'text-red-600 font-bold' 
                    : prod.estoque <= 5 
                    ? 'text-orange-600' 
                    : 'text-gray-500'
                }`}>
                  {prod.estoque <= 0 ? 'SEM ESTOQUE' : `Estoque: ${prod.estoque}`}
                </p>
              </div>
            ))}
            {produtosFiltrados.length === 0 && (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">Nenhum produto encontrado</p>
                <p className="text-sm text-gray-400">Verifique o termo da busca ou cadastre novos produtos</p>
              </div>
            )}
          </div>
        </div>

        {/* Carrinho / Pagamento */}
        <div className="w-96 flex flex-col gap-4">
          {/* Carrinho */}
          <div className="bg-white p-4 rounded-lg shadow flex-1">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">Carrinho</h2>

            {carrinho.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum item adicionado</p>
            ) : (
              <div className="space-y-3">
                {carrinho.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.nome}</p>
                      <p className="text-gray-500 text-sm">R$ {item.preco.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => alterarQuantidade(item.id, item.qtd - 1)}
                        className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                      >
                        <MinusIcon />
                      </button>
                      <span className="font-medium w-8 text-center">{item.qtd}</span>
                      <button 
                        onClick={() => alterarQuantidade(item.id, item.qtd + 1)}
                        className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold">R$ {(item.preco * item.qtd).toFixed(2)}</p>
                      <button 
                        onClick={() => removerItem(item.id)}
                        className="text-red-500 hover:text-red-700 mt-1"
                      >
                        <XCircleIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resumo do pedido */}
            <div className="border-t pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Desconto:</span>
                <span className="font-medium">R$ {desconto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span className="text-blue-600">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">Pagamento</h2>
            
            <div className="space-y-4">
              <select 
                value={metodoPagamento}
                onChange={(e) => {
                  setMetodoPagamento(e.target.value);
                  if (e.target.value !== "dinheiro") {
                    setValorRecebido("");
                  }
                }}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
                <option value="pix">PIX</option>
              </select>

              {precisaValorRecebido && (
                <>
                  <input
                    type="number"
                    placeholder="Valor recebido"
                    value={valorRecebido}
                    onChange={e => setValorRecebido(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    step="0.01"
                    min="0"
                  />

                  {valorRecebido && Number(valorRecebido) >= total && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <p className="text-green-800 font-bold text-center">
                        Troco: R$ {troco}
                      </p>
                    </div>
                  )}
                </>
              )}

              {!precisaValorRecebido && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-blue-800 font-semibold text-center">
                    Pagamento via {metodoPagamento.toUpperCase()}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={finalizarVenda}
                  disabled={carrinho.length === 0 || (precisaValorRecebido && Number(valorRecebido) < total)}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-3 rounded-lg font-semibold transition duration-200"
                >
                  Finalizar Venda (F2)
                </button>

                <button 
                  onClick={() => {
                    setCarrinho([]);
                    setValorRecebido("");
                  }}
                  className="w-full bg-gray-300 hover:bg-gray-400 p-3 rounded-lg font-semibold transition duration-200"
                >
                  Cancelar (ESC)
                </button>
              </div>
            </div>
          </div>

          {/* Histórico de Vendas */}
          {historicoVendas.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-bold text-lg mb-4 border-b pb-2 flex items-center gap-2">
                <HistoryIcon />
                Últimas Vendas
              </h2>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {historicoVendas.slice(0, 5).map(venda => (
                  <div 
                    key={venda.id} 
                    onClick={() => abrirDetalhesVenda(venda)}
                    className="flex justify-between items-center text-sm border-b pb-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition duration-200"
                  >
                    <div>
                      <p className="font-medium">Venda #{venda.id}</p>
                      <p className="text-gray-500">{venda.data.split(' ')[1]}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">R$ {venda.total.toFixed(2)}</p>
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        <EyeIcon /> {venda.metodoPagamento}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popup de Detalhes da Venda */}
      {vendaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-bold">Detalhes da Venda #{vendaSelecionada.id}</h3>
              <button 
                onClick={fecharDetalhesVenda}
                className="text-gray-500 hover:text-gray-700"
              >
                <CloseIcon />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Data e Hora</p>
                  <p className="font-medium">{vendaSelecionada.data}</p>
                </div>
                <div>
                  <p className="text-gray-600">Operador</p>
                  <p className="font-medium">{vendaSelecionada.operador}</p>
                </div>
                <div>
                  <p className="text-gray-600">Método de Pagamento</p>
                  <p className="font-medium capitalize">{vendaSelecionada.metodoPagamento}</p>
                </div>
                <div>
                  <p className="text-gray-600">Valor Recebido</p>
                  <p className="font-medium">R$ {vendaSelecionada.valorRecebido.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Itens da Venda</h4>
                <div className="space-y-2">
                  {vendaSelecionada.itens.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-gray-500 text-sm">
                          {item.qtd} x R$ {item.preco.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        R$ {(item.qtd * item.preco).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {vendaSelecionada.total.toFixed(2)}</span>
                </div>
                {vendaSelecionada.metodoPagamento === "dinheiro" && (
                  <>
                    <div className="flex justify-between">
                      <span>Valor Recebido:</span>
                      <span>R$ {vendaSelecionada.valorRecebido.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-600">
                      <span>Troco:</span>
                      <span>R$ {vendaSelecionada.troco}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>R$ {vendaSelecionada.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Fechar Caixa */}
      {showFecharCaixaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-bold">Fechar Caixa</h3>
              <button 
                onClick={() => setShowFecharCaixaModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isFechandoCaixa}
              >
                <CloseIcon />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Saldo Final em Caixa R$
                </label>
                <input
                  type="number"
                  value={saldoFinal}
                  onChange={(e) => setSaldoFinal(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center"
                  step="0.01"
                  min="0"
                  autoFocus
                  disabled={isFechandoCaixa}
                />
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowFecharCaixaModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  disabled={isFechandoCaixa}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFecharCaixa}
                  disabled={isFechandoCaixa}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isFechandoCaixa ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Fechando...
                    </>
                  ) : (
                    'Confirmar Fechamento'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaixaPrincipalAdmin;