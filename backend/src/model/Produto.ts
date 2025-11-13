

export interface Produto {
  id?: string;
  nome: string;
  codigo: string;
  codigoBarras?: string;
  categoria: string;
  preco: number;
  custo?: number;
  estoque: number;
  estoqueMinimo: number;
  imagem?: string;
  ativo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProdutoData {
  nome: string;
  codigo?: string; 
  codigoBarras?: string;
  categoria: string;
  preco: number;
  custo?: number;
  estoque: number;
  estoqueMinimo?: number;
  imagem?: string;
}

export interface UpdateProdutoData {
  nome?: string;
  categoria?: string;
  preco?: number;
  custo?: number;
  estoque?: number;
  estoqueMinimo?: number;
  imagem?: string;
  ativo?: boolean;
}

export interface ProdutoFilters {
  busca?: string;
  categoria?: string;
  ativo?: boolean;
  estoqueMinimo?: boolean; 
}

export interface ProdutoBuscaRapida {
  codigo?: string;
  codigoBarras?: string;
  nome?: string;
}