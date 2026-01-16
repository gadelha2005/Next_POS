import { prisma } from "../config/prisma";

async function initDatabase() {
  try {
    console.log("Inicializando banco de dados...");

    // Testar conexão
    await prisma.$connect();
    console.log("✓ Conexão com banco de dados estabelecida");

    // Aqui você pode adicionar inicialização de dados padrão se necessário
    // Por exemplo, criar usuário admin, categorias padrão, etc.
  } catch (error: any) {
    if (error.message.includes("authentication")) {
      console.error("❌ Erro de autenticação. Verifique:");
      console.error("1. Usuário e senha no MongoDB");
      console.error("2. IP liberado no Network Access");
      console.error("3. Connection string no .env");
    } else {
      console.error("❌ Erro ao inicializar banco de dados:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

export default initDatabase;
