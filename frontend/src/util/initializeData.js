// src/utils/initializeData.js
export const initializeData = () => {
  // Inicializar produtos se não existirem
  if (!localStorage.getItem('produtos') || JSON.parse(localStorage.getItem('produtos')).length === 0) {
    const produtosIniciais = [
      { id: 1, nome: "Coca-Cola 2L", codigo: "789012", categoria: "Bebidas", preco: 8.99, estoque: 50 },
      { id: 2, nome: "Arroz 5kg", codigo: "123456", categoria: "Alimentos", preco: 25.90, estoque: 30 },
      { id: 3, nome: "Feijão 1kg", codigo: "234567", categoria: "Alimentos", preco: 7.50, estoque: 5 },
    ];
    localStorage.setItem('produtos', JSON.stringify(produtosIniciais));
  }

  // Inicializar clientes se não existirem
  if (!localStorage.getItem('clientes') || JSON.parse(localStorage.getItem('clientes')).length === 0) {
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

  // Inicializar vendas vazias se não existirem
  if (!localStorage.getItem('vendas')) {
    localStorage.setItem('vendas', JSON.stringify([]));
  }

  // Inicializar configurações se não existirem
  if (!localStorage.getItem('configuracoes')) {
    const configuracoesIniciais = {
      nomeLoja: "Minha Loja",
      cnpj: "00.000.000/0000-00",
      endereco: "",
      telefone: "",
      email: "contato@loja.com",
      moeda: "BRL - Real Brasileiro",
      fusoHorario: "UTC-3 - Brasília",
      taxaImposto: "0,00"
    };
    localStorage.setItem('configuracoes', JSON.stringify(configuracoesIniciais));
  }
};