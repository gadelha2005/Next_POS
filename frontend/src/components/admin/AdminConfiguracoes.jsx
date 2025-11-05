import React, { useState } from "react";

export default function AdminConfiguracoes() {
  const [formData, setFormData] = useState({
    nomeLoja: "Minha Loja",
    cnpj: "00.000.000/0000-00",
    endereco: "",
    telefone: "",
    email: "contato@loja.com",
    moeda: "BRL - Real Brasileiro",
    fusoHorario: "UTC-3 - Brasília",
    taxaImposto: "0,00"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados salvos:", formData);
    alert("Alterações salvas com sucesso!");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Configurações</h1>
      <p className="text-gray-500 mb-6">
        Gerencie as configurações do sistema
      </p>

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
                Nome da Loja
              </label>
              <input
                name="nomeLoja"
                value={formData.nomeLoja}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Minha Loja"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CNPJ</label>
              <input
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
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
                className="w-full border border-gray-300 rounded-lg p-2"
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
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                E-mail
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="contato@loja.com"
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
              <input
                name="moeda"
                value={formData.moeda}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Fuso Horário
              </label>
              <input
                name="fusoHorario"
                value={formData.fusoHorario}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Taxa de Imposto (%)
              </label>
              <input
                name="taxaImposto"
                value={formData.taxaImposto}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="0,00"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}