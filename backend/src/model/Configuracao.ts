export interface Configuracao {
  id?: string;
  nomeLoja: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  
  // Configurações de Pagamento
  tokenApiPagamento?: string;
  chavePix?: string;
  taxaCartaoCredito: number;
  taxaCartaoDebito: number;
  
  // Configurações de NF-e
  tokenApiNfe?: string;
  serieNfe: string;
  ambienteNfe: string;
  
  // Configurações do Sistema
  moeda: string;
  fusoHorario: string;
  taxaImposto: number;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateConfiguracaoData {
  nomeLoja: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  tokenApiPagamento?: string;
  chavePix?: string;
  taxaCartaoCredito?: number;
  taxaCartaoDebito?: number;
  tokenApiNfe?: string;
  serieNfe?: string;
  ambienteNfe?: string;
  moeda?: string;
  fusoHorario?: string;
  taxaImposto?: number;
}

export interface UpdateConfiguracaoData {
  nomeLoja?: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  tokenApiPagamento?: string;
  chavePix?: string;
  taxaCartaoCredito?: number;
  taxaCartaoDebito?: number;
  tokenApiNfe?: string;
  serieNfe?: string;
  ambienteNfe?: string;
  moeda?: string;
  fusoHorario?: string;
  taxaImposto?: number;
}