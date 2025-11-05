// script/init-database.ts
import { prisma } from '../config/prisma';

async function initDatabase() {
  try {
    // Testar conexão primeiro
    await prisma.$connect();

    // Verificar se a tabela existe e tem a estrutura correta
    try {
      const userCount = await prisma.usuario.count();
      const adminUser = await prisma.usuario.findFirst({
        where: { 
          email: 'admin@nextpos.com',
          role: 'ADMIN'
        }
      });
    } catch (error) {
      // Forçar a sincronização do schema
      await syncDatabase();
    }

  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function syncDatabase() {
  try {
    // Usar db push para sincronizar o schema
    const { execSync } = require('child_process');
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  } catch (error) {
    console.error('Erro ao sincronizar schema:', error);
  }
}

export default initDatabase;