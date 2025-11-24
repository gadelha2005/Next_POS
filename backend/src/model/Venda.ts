export interface VendaItem {
  id?: string;
  vendaId?: string;
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Venda {
  id?: string;
  numero: number;
  clienteId?: string;
  usuarioId: string;
  caixaId: string;
  itens: VendaItem[];
  subtotal: number;
  desconto: number;
  total: number;
  metodoPagamento: string;
  statusPagamento: string;
  valorRecebido?: number;
  troco?: number;
  dataVenda?: Date;
  createdAt?: Date;
}

export interface CreateVendaData {
  clienteId?: string;
  usuarioId: string;
  caixaId: string;
  itens: {
    produtoId: string;
    quantidade: number;
  }[];
  metodoPagamento: string;
  valorRecebido?: number;
  desconto?: number;
}

export interface UpdateVendaData {
  clienteId?: string;
  desconto?: number;
  statusPagamento?: string;
}

export interface VendaFilters {
  dataInicio?: string;
  dataFim?: string;
  caixaId?: string;
  usuarioId?: string;
  clienteId?: string;
  metodoPagamento?: string;
  statusPagamento?: string;
  page?: number;
  limit?: number;
}