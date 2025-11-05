// AdminVendas.jsx
import { useState, useEffect } from "react";
import { Search, XCircle, Eye } from "lucide-react";

export default function AdminVendas() {
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState([]);
  const [valorRecebido, setValorRecebido] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("dinheiro");
  const [produtos, setProdutos] = useState([]);
  
  useEffect(() => {
    // Carregar produtos do localStorage
    const produtosStorage = JSON.parse(localStorage.getItem('produtos') || '[]');
    if (produtosStorage.length === 0) {
      // Dados padrão
      const produtosPadrao = [
        { id: 1, nome: "Coca-Cola 2L", preco: 8.99, estoque: 50, codigo: "43242" },
        { id: 2, nome: "Arroz 5kg", preco: 10.00, estoque: 100, codigo: "12433" },
        { id: 3, nome: "Feijão 1kg", preco: 7.55, estoque: 25, codigo: "53422" },
      ];
      localStorage.setItem('produtos', JSON.stringify(produtosPadrao));
      setProdutos(produtosPadrao);
    } else {
      setProdutos(produtosStorage);
    }
  }, []);

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) || p.codigo.includes(busca)
  );

  const adicionarCarrinho = (produto) => {
    if (produto.estoque <= 0) {
      alert("Produto sem estoque!");
      return;
    }

    setCarrinho(prev => {
      const existe = prev.find(item => item.id === produto.id);
      if (existe) {
        if (existe.qtd >= produto.estoque) {
          alert("Estoque insuficiente!");
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
    if (novaQuantidade > produto.estoque) {
      alert("Estoque insuficiente!");
      return;
    }

    setCarrinho(prev => 
      prev.map(item => 
        item.id === id ? { ...item, qtd: novaQuantidade } : item
      )
    );
  };

  const subtotal = carrinho.reduce((acc, item) => acc + item.preco * item.qtd, 0);
  const total = subtotal;

  const finalizarVenda = () => {
    if (carrinho.length === 0) {
      alert("Carrinho vazio!");
      return;
    }

    if (metodoPagamento === "dinheiro" && (!valorRecebido || Number(valorRecebido) < total)) {
      alert("Valor recebido insuficiente!");
      return;
    }

    // Atualizar estoque
    const novosProdutos = produtos.map(produto => {
      const itemCarrinho = carrinho.find(item => item.id === produto.id);
      if (itemCarrinho) {
        return {
          ...produto,
          estoque: produto.estoque - itemCarrinho.qtd
        };
      }
      return produto;
    });

    setProdutos(novosProdutos);
    localStorage.setItem('produtos', JSON.stringify(novosProdutos));

    // Salvar venda
    const venda = {
      id: Date.now(),
      data: new Date().toLocaleString('pt-BR'),
      itens: carrinho,
      total: total,
      metodoPagamento: metodoPagamento,
      valorRecebido: metodoPagamento === "dinheiro" ? Number(valorRecebido) : total,
      troco: metodoPagamento === "dinheiro" ? (Number(valorRecebido) - total) : 0
    };

    const vendas = JSON.parse(localStorage.getItem('vendas') || '[]');
    vendas.push(venda);
    localStorage.setItem('vendas', JSON.stringify(vendas));

    alert(`Venda #${venda.id} concluída! Total: R$ ${total.toFixed(2)}`);
    setCarrinho([]);
    setValorRecebido("");
  };

  const precisaValorRecebido = metodoPagamento === "dinheiro";
  const troco = precisaValorRecebido && valorRecebido ? (Number(valorRecebido) - total) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-6 text-black">
      {/* Header */}
      <div className="flex justify-between items-center pb-4">
        <div>
          <h1 className="text-2xl font-bold">NextPOS - Admin</h1>
          <p className="text-sm text-gray-500">Modo Administrador - Vendas</p>
        </div>
      </div>

      <div className="flex gap-4 w-full">
        {/* Lista de produtos */}
        <div className="flex-1 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center bg-gray-100 p-2 rounded mb-4">
            <Search className="text-gray-500" size={20} />
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
                className={`border p-4 rounded cursor-pointer transition ${
                  prod.estoque > 0 
                    ? "hover:bg-gray-50 hover:border-blue-500" 
                    : "opacity-50 cursor-not-allowed bg-gray-100"
                }`}
              >
                <div className="bg-gray-200 text-gray-600 flex justify-center items-center h-32 rounded mb-2">
                  IMG
                </div>
                <p className="font-semibold">{prod.nome}</p>
                <p className="text-sm text-gray-500">Código: {prod.codigo}</p>
                <p className="text-blue-600 font-semibold">R$ {prod.preco.toFixed(2)}</p>
                <p className={`text-xs ${prod.estoque <= 5 ? 'text-red-500' : 'text-gray-500'}`}>
                  Estoque: {prod.estoque}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Carrinho / Pagamento */}
        <div className="w-80 flex flex-col gap-4">
          {/* Carrinho */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Carrinho</h2>

            {carrinho.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum item adicionado</p>
            ) : (
              carrinho.map(item => (
                <div key={item.id} className="flex justify-between items-center mb-2">
                  <div className="flex-1">
                    <p className="font-medium">{item.nome}</p>
                    <p className="text-gray-500 text-sm">R$ {item.preco.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => alterarQuantidade(item.id, item.qtd - 1)}
                      className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="font-medium w-8 text-center">{item.qtd}</span>
                    <button 
                      onClick={() => alterarQuantidade(item.id, item.qtd + 1)}
                      className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold">R$ {(item.preco * item.qtd).toFixed(2)}</p>
                    <button 
                      onClick={() => removerItem(item.id)}
                      className="text-red-500 hover:text-red-700 mt-1"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}

            <div className="border-t pt-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold mt-1">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Pagamento</h2>

            <select
              className="w-full border p-2 rounded mb-2"
              value={metodoPagamento}
              onChange={(e) => {
                setMetodoPagamento(e.target.value);
                if (e.target.value !== "dinheiro") {
                  setValorRecebido("");
                }
              }}
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
                  className="w-full border p-2 rounded mb-2"
                  step="0.01"
                  min="0"
                />

                {valorRecebido && Number(valorRecebido) >= total && (
                  <div className="text-green-600 font-bold mb-2">
                    Troco: R$ {troco.toFixed(2)}
                  </div>
                )}
              </>
            )}

            <button
              onClick={finalizarVenda}
              disabled={carrinho.length === 0 || (precisaValorRecebido && (!valorRecebido || Number(valorRecebido) < total))}
              className="w-full bg-blue-600 text-white p-2 rounded mb-2 disabled:bg-gray-400"
            >
              Finalizar Venda
            </button>

            <button 
              onClick={() => {
                setCarrinho([]);
                setValorRecebido("");
              }}
              className="w-full bg-gray-300 p-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}