# NextPOS - Sistema de Ponto de Venda

Um sistema completo de ponto de venda (POS) desenvolvido com tecnologias modernas, incluindo autenticação, gestão de produtos, clientes, vendas e relatórios.

NextPOS: https://next-pos-frontend.vercel.app/

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [Funcionalidades](#funcionalidades)
- [API Endpoints](#api-endpoints)
- [Autores](#autores)

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Bundler e dev server
- **Tailwind CSS** - Estilização
- **Axios** - Cliente HTTP
- **React Router** - Roteamento

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Banco de dados
- **JWT** - Autenticação
- **Nodemailer** - Serviço de email

## 📁 Estrutura do Projeto

```
NextPOS/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços (API, autenticação)
│   │   ├── App.jsx          # Componente raiz
│   │   └── main.jsx         # Ponto de entrada
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Servidor Express
│   ├── src/
│   │   ├── routes/          # Rotas da API
│   │   ├── controllers/      # Lógica de negócio
│   │   ├── models/          # Modelos MongoDB
│   │   ├── middleware/      # Middlewares
│   │   ├── service/         # Serviços
│   │   ├── script/          # Scripts utilitários
│   │   └── index.js         # Servidor principal
│   ├── .env                 # Variáveis de ambiente
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                # Este arquivo
```

## 🚀 Instalação

### Pré-requisitos
- Node.js v16+ instalado
- npm ou yarn
- MongoDB conta (local ou cloud)
- Gmail com senha de app (para emails)

### Passo 1: Clonar o Repositório

```bash
git clone <seu-repositorio>
cd NextPOS
```

### Passo 2: Instalar Dependências do Backend

```bash
cd backend
npm install
```

### Passo 3: Instalar Dependências do Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuração

### Backend (.env)

Crie um arquivo `.env` na pasta `backend/`:

```env
# Banco de Dados
DATABASE_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/nextpos

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui

# Servidor
PORT=3333
NODE_ENV=production

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
EMAIL_FROM=seu_email@gmail.com

# CORS - URLs permitidas
ALLOWED_ORIGINS=http://localhost:5173,https://seu-frontend.vercel.app
```

### Frontend (.env)

Crie um arquivo `.env` na pasta `frontend/`:

```env
VITE_API_URL=http://localhost:3333
VITE_APP_NAME=NextPOS
```

**Para produção no Vercel:**
```env
VITE_API_URL=https://seu-backend.vercel.app
VITE_APP_NAME=NextPOS
```

## 🏃 Como Executar

### Executar Backend Localmente

```bash
cd backend
npm run dev
```

O servidor estará disponível em `http://localhost:3333`

### Executar Frontend Localmente

```bash
cd frontend
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Verificar Saúde da API

```bash
curl http://localhost:3333/health
```

## ✨ Funcionalidades

### Autenticação
- ✅ Login com email e senha
- ✅ Cadastro de novos usuários
- ✅ Recuperação de senha por email
- ✅ Reset de senha
- ✅ Logout seguro

### Gestão de Produtos
- ✅ CRUD completo de produtos
- ✅ Upload de imagens
- ✅ Categorias de produtos
- ✅ Controle de estoque

### Gestão de Clientes
- ✅ CRUD de clientes
- ✅ Histórico de compras
- ✅ Informações de contato

### Vendas e Caixa
- ✅ Abertura e fechamento de caixa
- ✅ Registro de vendas
- ✅ Múltiplas formas de pagamento
- ✅ Relatórios de vendas

### Relatórios
- ✅ Relatório de vendas por período
- ✅ Análise de produtos mais vendidos
- ✅ Estatísticas de clientes

### Configurações
- ✅ Perfil do usuário
- ✅ Configurações da loja
- ✅ Gerenciamento de funcionários

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/forgot-password` - Solicitar reset de senha
- `POST /api/auth/reset-password` - Resetar senha
- `GET /api/auth/profile` - Obter perfil do usuário

### Produtos
- `GET /api/produtos` - Listar produtos
- `POST /api/produtos` - Criar produto
- `GET /api/produtos/:id` - Obter produto
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Deletar produto

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Deletar cliente

### Vendas
- `GET /api/vendas` - Listar vendas
- `POST /api/vendas` - Criar venda
- `GET /api/vendas/:id` - Obter venda

### Caixa
- `POST /api/caixa/abrir` - Abrir caixa
- `POST /api/caixa/fechar` - Fechar caixa
- `GET /api/caixa/status` - Status do caixa

## 🔒 Segurança

- JWT para autenticação
- Senhas com hash bcrypt
- CORS configurado
- Validação de entrada
- Proteção contra CSRF

## 📝 Variáveis de Ambiente Importantes

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL do MongoDB | `mongodb+srv://...` |
| `JWT_SECRET` | Chave secreta JWT | Uma string aleatória |
| `ALLOWED_ORIGINS` | URLs permitidas no CORS | `http://localhost:5173` |
| `SMTP_USER` | Email para enviar mensagens | `seu@email.com` |
| `SMTP_PASS` | Senha de app do Gmail | Gerar no Google Account |

## 🐛 Troubleshooting

### CORS Error
- Verifique `ALLOWED_ORIGINS` no `.env` do backend
- Garanta que o frontend URL está na lista

### Conexão MongoDB Falha
- Verifique `DATABASE_URL`
- Confirme que sua máquina IP está na whitelist do MongoDB

### Email não funciona
- Use [senha de app do Gmail](https://myaccount.google.com/apppasswords)
- Não use a senha da conta diretamente

### Token Expirado
- Faça logout e login novamente
- Limpe localStorage se necessário

## 📦 Deploy

### Deploy do Backend (Vercel)

```bash
cd backend
vercel deploy
```

### Deploy do Frontend (Vercel)

```bash
cd frontend
npm run build
vercel deploy
```

## 👨‍💻 Autores

- **Pedro Gadelha** 
- **Pedro Roberto** 
- **Tiago Rodrigues** 
- **Mateus Farias** 

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Última atualização:** Novembro 2025