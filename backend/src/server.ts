// server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoute";
import caixaRoutes from "./routes/caixaRoutes";
import produtoRoutes from "./routes/produtoRoutes"
import initDatabase from "./script/init-database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS mais permissivo para desenvolvimento
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Arquivos Estáticos das Imagens
app.use('/uploads', express.static('uploads'));

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/caixa", caixaRoutes);
app.use("/api/produtos", produtoRoutes);

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

// Inicializar servidor
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Banco de dados: ${process.env.DB_NAME}`);
  console.log(`Health check: http://localhost:${PORT}/health`);

  // Inicializar banco de dados
  await initDatabase();
});
