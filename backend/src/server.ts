import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoute";
import caixaRoutes from "./routes/caixaRoutes";
import produtoRoutes from "./routes/produtoRoutes"
import initDatabase from "./script/init-database";
import clienteRoutes from './routes/clienteRoutes';
import vendaRoutes from './routes/vendaRoutes';
import configuracaoRoutes from './routes/configuracaoRoutes';
import path from "path";
import emailService from "./service/emailService";

dotenv.config();

const app = express();

// CORS SIMPLES QUE FUNCIONA
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Arquivos Estáticos das Imagens
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/caixa", caixaRoutes);
app.use("/api/produtos", produtoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use("/api/vendas" , vendaRoutes);
app.use('/api/configuracoes', configuracaoRoutes);

// Rota de saúde
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "NextPOS API is running",
    timestamp: new Date().toISOString(),
  });
});

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "NextPOS API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Middleware de tratamento de erro
app.use((error: any, req: any, res: any, next: any) => {
  console.error("Erro não tratado:", error.message);
  res.status(500).json({ error: "Erro interno do servidor" });
});

// Rota não encontrada
app.use("*", (req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);

  // Inicializar banco de dados
  await initDatabase();

  // Verificação silenciosa do serviço de email
  await emailService.verifyConnection();
});

export default app;