import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import caixaRoutes from "./routes/caixaRoutes";
import produtoRoutes from "./routes/produtoRoutes";
import initDatabase from "./config/init-database";
import clienteRoutes from "./routes/clienteRoutes";
import vendaRoutes from "./routes/vendaRoutes";
import configuracaoRoutes from "./routes/configuracaoRoutes";
import path from "path";
import emailService from "./service/emailService";

dotenv.config();

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:3333",
      "https://next-pos-frontend.vercel.app",
      "https://next-pos-frontend-*.vercel.app",      
      "https://next-pos-frontend-git-*.vercel.app" 
    ];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Verificar se a origem é permitida
  const isAllowed = allowedOrigins.includes(origin) || !origin;

  if (isAllowed) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());

// Arquivos Estáticos das Imagens
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/caixa", caixaRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/vendas", vendaRoutes);
app.use("/api/configuracoes", configuracaoRoutes);

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

  try {
    // Inicializar banco de dados
    await initDatabase();
    console.log("Banco de dados inicializado");

    // Verificação do serviço de email
    await emailService.verifyConnection();
    console.log("Serviço de email verificado");
  } catch (error) {
    console.error("Erro durante inicialização:", error);
  }
});

export default app;