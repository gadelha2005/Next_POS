import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X } from "lucide-react";

export default function AdminProdutos() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    categoria: '',
    preco: '',
    estoque: ''
  });

  // Carregar produtos do localStorage
  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = () => {
    const produtosSalvos = JSON.parse(localStorage.getItem('produtos') || '[]');
    setProducts(produtosSalvos);
  };

  const salvarProdutos = (novosProdutos) => {
    localStorage.setItem('produtos', JSON.stringify(novosProdutos));
    setProducts(novosProdutos);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const abrirModalNovo = () => {
    setFormData({
      nome: '',
      codigo: '',
      categoria: '',
      preco: '',
      estoque: ''
    });
    setEditingProduct(null);
    setShowModal(true);
  };

  const abrirModalEditar = (product) => {
    setFormData({
      nome: product.nome,
      codigo: product.codigo,
      categoria: product.categoria,
      preco: product.preco.toString(),
      estoque: product.estoque.toString()
    });
    setEditingProduct(product);
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const novoProduto = {
      id: editingProduct ? editingProduct.id : Date.now(),
      nome: formData.nome,
      codigo: formData.codigo,
      categoria: formData.categoria,
      preco: parseFloat(formData.preco),
      estoque: parseInt(formData.estoque)
    };

    let novosProdutos;
    if (editingProduct) {
      // Editar produto existente
      novosProdutos = products.map(p => 
        p.id === editingProduct.id ? novoProduto : p
      );
    } else {
      // Adicionar novo produto
      novosProdutos = [...products, novoProduto];
    }

    salvarProdutos(novosProdutos);
    fecharModal();
  };

  const handleDelete = (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      const novosProdutos = products.filter(p => p.id !== productId);
      salvarProdutos(novosProdutos);
    }
  };

  const ProductRow = ({ product }) => {
    const stockColor = product.estoque <= 5 ? "bg-red-500" : 
                      product.estoque <= 10 ? "bg-yellow-500" : "bg-blue-500";

    return (
      <tr className="border-b hover:bg-gray-50">
        <td className="p-3">{product.nome}</td>
        <td className="p-3">{product.codigo}</td>
        <td className="p-3">{product.categoria}</td>
        <td className="p-3">R$ {product.preco.toFixed(2)}</td>
        <td className="p-3">
          <span className={`${stockColor} text-white px-3 py-1 rounded-md text-sm`}>
            {product.estoque} un.
          </span>
        </td>
        <td className="p-3 flex justify-center gap-2">
          <button 
            onClick={() => abrirModalEditar(product)}
            className="bg-gray-200 p-2 rounded hover:bg-gray-300 transition"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => handleDelete(product.id)}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
          >
            <Trash2 size={16} />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Produtos</h1>
      <p className="text-gray-500 mb-6">Gerencie seu catálogo de produtos</p>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Lista de Produtos ({products.length})</h2>
          <button 
            onClick={abrirModalNovo}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={18} /> Novo Produto
          </button>
        </div>

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3">Produto</th>
              <th className="p-3">Código</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Estoque</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  Nenhum produto cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Adicionar/Editar Produto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-bold">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button 
                onClick={fecharModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Produto</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Código</label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <input
                  type="text"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="preco"
                    value={formData.preco}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Estoque</label>
                  <input
                    type="number"
                    name="estoque"
                    value={formData.estoque}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingProduct ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}