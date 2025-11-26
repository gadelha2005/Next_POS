import React, { useState, useEffect } from "react";
import configuracaoService from '../../service/configuracaoService';

export default function AdminConfiguracoes() {
  const [formData, setFormData] = useState({
    nomeLoja: "",
    cnpj: "",
    endereco: "",
    telefone: "",
    email: "",
    moeda: "BRL",
    fusoHorario: "America/Sao_Paulo",
    taxaImposto: 0,
    taxaCartaoCredito: 2.99,
    taxaCartaoDebito: 1.99,
    serieNfe: "1",
    ambienteNfe: "homologacao"
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Carregar configurações ao montar o componente
  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      const response = await configuracaoService.buscarConfiguracao();
      
      if (response.configuracao) {
        // Mapear os dados da API para o estado local
        setFormData({
          nomeLoja: response.configuracao.nomeLoja || "",
          cnpj: response.configuracao.cnpj || "",
          endereco: response.configuracao.endereco || "",
          telefone: response.configuracao.telefone || "",
          email: response.configuracao.email || "",
          moeda: response.configuracao.moeda || "BRL",
          fusoHorario: response.configuracao.fusoHorario || "America/Sao_Paulo",
          taxaImposto: response.configuracao.taxaImposto || 0,
          taxaCartaoCredito: response.configuracao.taxaCartaoCredito || 2.99,
          taxaCartaoDebito: response.configuracao.taxaCartaoDebito || 1.99,
          serieNfe: response.configuracao.serieNfe || "1",
          ambienteNfe: response.configuracao.ambienteNfe || "homologacao"
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erro ao carregar configurações: ' + error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Converter números para float quando necessário
    if (['taxaImposto', 'taxaCartaoCredito', 'taxaCartaoDebito'].includes(name)) {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      // Preparar dados para a API
      const dadosParaAPI = {
        nomeLoja: formData.nomeLoja,
        cnpj: formData.cnpj || null,
        endereco: formData.endereco || null,
        telefone: formData.telefone || null,
        email: formData.email || null,
        moeda: formData.moeda,
        fusoHorario: formData.fusoHorario,
        taxaImposto: formData.taxaImposto,
        taxaCartaoCredito: formData.taxaCartaoCredito,
        taxaCartaoDebito: formData.taxaCartaoDebito,
        serieNfe: formData.serieNfe,
        ambienteNfe: formData.ambienteNfe
      };

      // Usar PUT para atualizar (a API cria se não existir)
      await configuracaoService.atualizarConfiguracao(dadosParaAPI);
      
      setMessage({ 
        type: 'success', 
        text: 'Configurações salvas com sucesso!' 
      });

    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erro ao salvar configurações: ' + error.message 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Recarregar dados originais
    carregarConfiguracoes();
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-gray-500 mb-6">Carregando configurações...</p>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Configurações</h1>
      <p className="text-gray-500 mb-6">
        Gerencie as configurações do sistema
      </p>

      {/* Mensagens de feedback */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8 max-w-3xl bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
      >
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Informações da Loja
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nome da Loja *
              </label>
              <input
                name="nomeLoja"
                value={formData.nomeLoja}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Minha Loja"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CNPJ</label>
              <input
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Endereço
              </label>
              <input
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Rua, número, bairro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Telefone
              </label>
              <input
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                E-mail
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contato@loja.com"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Configurações de Pagamento
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Taxa Cartão de Crédito (%)
              </label>
              <input
                name="taxaCartaoCredito"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.taxaCartaoCredito}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Taxa Cartão de Débito (%)
              </label>
              <input
                name="taxaCartaoDebito"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.taxaCartaoDebito}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1.99"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Configurações do Sistema
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Moeda
              </label>
              <select
                name="moeda"
                value={formData.moeda}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="BRL">BRL - Real Brasileiro</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Fuso Horário
              </label>
              <select
                name="fusoHorario"
                value={formData.fusoHorario}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="America/Sao_Paulo">UTC-3 - Brasília</option>
                <option value="America/New_York">UTC-5 - Nova York</option>
                <option value="Europe/London">UTC+0 - Londres</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Taxa de Imposto (%)
              </label>
              <input
                name="taxaImposto"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.taxaImposto}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Série NF-e
              </label>
              <input
                name="serieNfe"
                value={formData.serieNfe}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Ambiente NF-e
              </label>
              <select
                name="ambienteNfe"
                value={formData.ambienteNfe}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="homologacao">Homologação</option>
                <option value="producao">Produção</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2 disabled:bg-gray-400"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}