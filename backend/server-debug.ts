import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS universal
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Rota auth de teste
app.post("/api/auth/login", (req, res) => {
  console.log("Login attempt:", req.body);
  res.json({ 
    message: "Login route working!", 
    status: "success",
    token: "debug-token-123",
    user: { id: 1, nome: "Debug User", email: "debug@test.com" }
  });
});

app.post("/api/auth/register", (req, res) => {
  res.json({ 
    message: "Register route working!", 
    status: "success" 
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Debug server running" });
});

app.get("/", (req, res) => {
  res.json({ 
    message: "NextPOS Debug API",
    routes: ["/api/auth/login", "/api/auth/register", "/health"]
  });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🔧 Debug server on port ${PORT}`);
});

export default app;