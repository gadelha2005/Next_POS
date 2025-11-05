import { prisma } from '../config/prisma';


async function initDatabase() {
  try {
    console.log('🔄 Inicializando banco de dados...');

    // Testar conexão
    await prisma.$connect();



  } catch (error: any) {
    if (error.message.includes('authentication')) {
      console.error('Erro de autenticação. Verifique:');
      console.error('1. Usuário e senha no MongoDB');
      console.error('2. IP liberado no Network Access');
      console.error('3. Connection string no .env');
    }
  } finally {
    await prisma.$disconnect();
  }
}

export default initDatabase;