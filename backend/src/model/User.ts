export interface User {
  id?: string;
  nome: string;
  email: string;
  senha: string;
  role?: 'admin' | 'caixa';
  created_at?: Date;
}

export interface LoginData {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
}