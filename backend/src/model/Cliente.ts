export interface Cliente {
  id?: string;
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  createdAt?: Date;
}

export interface CreateClienteData {
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}

export interface UpdateClienteData {
  nome?: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}

export interface ClienteFilters {
  busca?: string;
  cpfCnpj?: string;
  email?: string;
  page?: number;
  limit?: number;
}