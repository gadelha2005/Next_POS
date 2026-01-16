// script/init-database.ts - VERSÃO COMPLETA E CORRIGIDA
import { prisma } from '../config/prisma';
import { execSync } from 'child_process';

async function initDatabase() {
  console.log("=== 🗄️ INICIALIZAÇÃO DO BANCO DE DADOS ===");
  
  try {
    // PASSO 1: Gerar Prisma Client
    console.log("1. 📦 Gerando Prisma Client...");
    try {
      execSync('npx prisma generate', { 
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      console.log("✅ Prisma Client gerado");
    } catch (error: any) {
      console.warn("⚠️  Prisma generate falhou:", error.message);
    }

    // PASSO 2: Sincronizar schema (CRÍTICO PARA MONGODB)
    console.log("2. 🔄 Sincronizando schema Prisma -> MongoDB...");
    try {
      execSync('npx prisma db push --accept-data-loss', {
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      console.log("✅ Schema sincronizado com MongoDB");
    } catch (error: any) {
      console.error("❌ Prisma db push falhou:", error.message);
      await syncDatabaseFallback();
    }

    // PASSO 3: Conectar
    console.log("3. 🔗 Conectando ao banco...");
    await prisma.$connect();
    console.log("✅ Conexão estabelecida");

    // PASSO 4: Criar admin se não existir
    console.log("4. 👤 Verificando usuário administrador...");
    
    try {
      const adminExists = await prisma.usuario.findUnique({
        where: { email: 'admin@nextpos.com' }
      });

      if (!adminExists) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        await prisma.usuario.create({
          data: {
            nome: 'Administrador Sistema',
            email: 'admin@nextpos.com',
            senha: hashedPassword,
            role: 'ADMIN'
          }
        });
        console.log("✅ Usuário admin criado: admin@nextpos.com / admin123");
      } else {
        console.log("✅ Usuário admin já existe");
      }
    } catch (error: any) {
      console.warn("⚠️  Não foi possível verificar/criar admin:", error.message);
    }

    console.log("=== ✅ BANCO INICIALIZADO COM SUCESSO ===");

  } catch (error: any) {
    console.error("❌ ERRO NA INICIALIZAÇÃO DO BANCO:", error.message);
    
    // Verificar tipo de erro
    if (error.message.includes('P1001')) {
      console.error("🔌 ERRO: Não foi possível conectar ao MongoDB");
      console.error("   Verifique:");
      console.error("   1. DATABASE_URL no .env");
      console.error("   2. Usuário/senha no MongoDB Atlas");
      console.error("   3. Network Access (0.0.0.0/0)");
    } else if (error.message.includes('does not exist')) {
      console.error("🗃️ ERRO: Collections não existem");
      console.error("   Execute manualmente: npx prisma db push");
    }
    
    // Não propagar erro para não derrubar o servidor
    console.log("⚠️  Continuando sem inicialização completa do banco");
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Ignorar erro de desconexão
    }
  }
}

async function syncDatabaseFallback() {
  console.log("🔄 Tentando fallback de sincronização...");
  
  try {
    // Tenta método alternativo
    const { execSync } = require('child_process');
    execSync('npx prisma migrate dev --name init --create-only', { 
      stdio: 'pipe',
      encoding: 'utf-8' 
    });
    console.log("✅ Fallback executado");
  } catch (error: any) {
    console.error("❌ Fallback também falhou:", error.message);
  }
}

export default initDatabase;