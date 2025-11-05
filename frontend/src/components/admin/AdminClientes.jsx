import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X } from "lucide-react";

export default function AdminClientes() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: ''
  });

  // Carregar clientes do localStorage
  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = () => {
    const clientesSalvos = JSON.parse(localStorage.getItem('clientes') || '[]');
    setCustomers(clientesSalvos);
  };

  const salvarClientes = (novosClientes) => {
    localStorage.setItem('clientes', JSON.stringify(novosClientes));
    setCustomers(novosClientes);
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
      cpf: '',
      telefone: '',
      email: ''
    });
    setEditingCustomer(null);
    setShowModal(true);
  };

  const abrirModalEditar = (customer) => {
    setFormData({
      nome: customer.nome,
      cpf: customer.cpf,
      telefone: customer.telefone,
      email: customer.email
    });
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const novoCliente = {
      id: editingCustomer ? editingCustomer.id : Date.now(),
      nome: formData.nome,
      cpf: formData.cpf,
      telefone: formData.telefone,
      email: formData.email
    };

    let novosClientes;
    if (editingCustomer) {
      // Editar cliente existente
      novosClientes = customers.map(c => 
        c.id === editingCustomer.id ? novoCliente : c
      );
    } else {
      // Adicionar novo cliente
      novosClientes = [...customers, novoCliente];
    }

    salvarClientes(novosClientes);
    fecharModal();
  };

  const handleDelete = (customerId) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      const novosClientes = customers.filter(c => c.id !== customerId);
      salvarClientes(novosClientes);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Clientes</h1>
      <p className="text-gray-500 mb-6">Gerencie sua base de clientes</p>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Lista de Clientes ({customers.length})</h2>
          <button 
            onClick={abrirModalNovo}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={18} /> Novo Cliente
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-2">Nome</th>
              <th className="p-2">CPF/CNPJ</th>
              <th className="p-2">Telefone</th>
              <th className="p-2">E-mail</th>
              <th className="p-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{customer.nome}</td>
                <td className="p-2">{customer.cpf}</td>
                <td className="p-2">{customer.telefone}</td>
                <td className="p-2">{customer.email}</td>
                <td className="p-2 text-center">
                  <button 
                    onClick={() => abrirModalEditar(customer)}
                    className="inline-flex items-center justify-center bg-blue-100 text-blue-600 p-2 rounded-md hover:bg-blue-200 mr-2 transition"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(customer.id)}
                    className="inline-flex items-center justify-center bg-red-100 text-red-600 p-2 rounded-md hover:bg-red-200 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  Nenhum cliente cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Adicionar/Editar Cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-bold">
                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
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
                <label className="block text-sm font-medium mb-1">Nome Completo</label>
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
                <label className="block text-sm font-medium mb-1">CPF/CNPJ</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
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
                  {editingCustomer ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}