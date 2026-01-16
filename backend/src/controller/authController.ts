import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { LoginData, RegisterData } from '../model/User';
import emailService from '../service/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_super_secreto';

export class AuthController {
  async register(req: Request, res: Response) {
    console.log("=== 🔥 REGISTER ENDPOINT ACESSADO ===");
    console.log("📦 Headers:", req.headers);
    console.log("📝 Body recebido:", req.body);
    console.log("🔐 JWT_SECRET configurado?", !!process.env.JWT_SECRET);
    console.log("🗄️  Prisma importado?", !!prisma);

    try {
      const { nome, email, senha }: RegisterData = req.body;
      console.log(`1. 📊 Dados extraídos - Nome: "${nome}", Email: "${email}", Senha: "${senha ? '***' : 'null'}"`);

      // Validação
      if (!nome || !email || !senha) {
        console.log("❌ VALIDAÇÃO: Dados incompletos");
        return res.status(400).json({ 
          error: 'Todos os campos são obrigatórios',
          debug: { nome: !!nome, email: !!email, senha: !!senha }
        });
      }

      if (senha.length < 6) {
        console.log("❌ VALIDAÇÃO: Senha muito curta");
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
      }

      console.log("2. 🔍 Verificando se usuário já existe...");
      try {
        const existingUser = await prisma.usuario.findUnique({
          where: { email }
        });
        console.log(`🔍 Resultado findUnique: ${existingUser ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
        
        if (existingUser) {
          console.log(`❌ Usuário já cadastrado: ${email}`);
          return res.status(400).json({ error: 'Email já cadastrado' });
        }
      } catch (findError: any) {
        console.error("❌ ERRO no findUnique:", findError.message);
        console.error("Código:", findError.code);
        throw findError;
      }

      console.log("3. 🔐 Criando hash da senha...");
      const hashedPassword = await bcrypt.hash(senha, 12);
      console.log("✅ Hash criado");

      const role = 'caixa';
      console.log("4. 🗄️ Criando usuário no banco...");

      const user = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: hashedPassword,
          role
        }
      });
      
      console.log(`✅✅✅ USUÁRIO CRIADO COM SUCESSO!`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Nome: ${user.nome}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   CreatedAt: ${user.createdAt}`);

      console.log("5. 🎫 Gerando token JWT...");
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log("✅ Token gerado");

      console.log("=== 🎉 REGISTER CONCLUÍDO COM SUCESSO ===");
      
      res.status(201).json({
        message: 'Usuário criado com sucesso',
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role
        }
      });

    } catch (error: any) {
      console.error('❌❌❌ ERRO FATAL NO REGISTER CONTROLLER:');
      console.error('📌 Mensagem:', error.message);
      console.error('🔢 Código do erro:', error.code);
      console.error('🏷️  Nome do erro:', error.name);
      console.error('📊 Meta (dados do erro):', error.meta);
      console.error('🔗 Stack trace (primeiras 3 linhas):');
      if (error.stack) {
        error.stack.split('\n').slice(0, 3).forEach((line: string) => console.error('   ', line));
      }

      // Diagnóstico de erros comuns do Prisma
      if (error.code === 'P2002') {
        console.error('💡 DIAGNÓSTICO: Violação de constraint única');
        console.error('   Provavelmente: email já existe no banco');
      } else if (error.code === 'P2021') {
        console.error('💡 DIAGNÓSTICO: Tabela/Collection não existe');
        console.error('   A collection "usuarios" não foi criada no MongoDB');
        console.error('   SOLUÇÃO: Execute "npx prisma db push" localmente');
      } else if (error.code === 'P1001') {
        console.error('💡 DIAGNÓSTICO: Não pode conectar ao banco');
        console.error('   Verifique:');
        console.error('   1. DATABASE_URL no Vercel');
        console.error('   2. Usuário/senha do MongoDB');
        console.error('   3. IP liberado no MongoDB Atlas (0.0.0.0/0)');
      } else if (error.code === 'P1017') {
        console.error('💡 DIAGNÓSTICO: Server closed the connection');
        console.error('   Timeout ou problema de rede');
      }

      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
          name: error.name
        } : undefined
      });
    }
  }

  async login(req: Request, res: Response) {
    console.log("=== 🔥 LOGIN ENDPOINT ACESSADO ===");
    console.log("📦 Headers:", req.headers);
    console.log("📝 Body recebido:", req.body);

    try {
      const { email, senha }: LoginData = req.body;
      console.log(`1. 📊 Dados extraídos - Email: "${email}", Senha: "${senha ? '***' : 'null'}"`);

      if (!email || !senha) {
        console.log("❌ VALIDAÇÃO: Email ou senha faltando");
        return res.status(400).json({ 
          error: 'Email e senha são obrigatórios',
          debug: { email: !!email, senha: !!senha }
        });
      }

      console.log("2. 🔍 Buscando usuário no banco...");
      let user;
      try {
        user = await prisma.usuario.findUnique({
          where: { email }
        });
        console.log(`🔍 Resultado findUnique: ${user ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
        
        if (!user) {
          console.log(`❌ Usuário não encontrado: ${email}`);
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }
      } catch (findError: any) {
        console.error("❌ ERRO no findUnique (login):", findError.message);
        console.error("Código:", findError.code);
        throw findError;
      }

      console.log("3. 🔐 Verificando senha...");
      const isPasswordValid = await bcrypt.compare(senha, user.senha);
      console.log(`🔐 Senha válida? ${isPasswordValid ? 'SIM' : 'NÃO'}`);

      if (!isPasswordValid) {
        console.log("❌ Senha incorreta");
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      console.log("4. 🎫 Gerando token JWT...");
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log("✅ Token gerado");

      console.log("=== 🎉 LOGIN CONCLUÍDO COM SUCESSO ===");
      console.log(`👤 Usuário: ${user.nome} (${user.email})`);
      
      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role
        }
      });

    } catch (error: any) {
      console.error('❌❌❌ ERRO FATAL NO LOGIN CONTROLLER:');
      console.error('📌 Mensagem:', error.message);
      console.error('🔢 Código do erro:', error.code);
      console.error('🏷️  Nome do erro:', error.name);
      
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    console.log("=== 👤 GET PROFILE ENDPOINT ===");
    console.log("User ID from token:", req.userId);
    
    try {
      if (!req.userId) {
        console.log("❌ Nenhum userId no request");
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      console.log(`🔍 Buscando usuário ID: ${req.userId}`);
      const user = await prisma.usuario.findUnique({
        where: { id: req.userId }
      });

      if (!user) {
        console.log(`❌ Usuário não encontrado: ${req.userId}`);
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const { senha, ...userWithoutPassword } = user;
      console.log(`✅ Perfil encontrado: ${user.email}`);

      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error('Erro em getProfile:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    console.log("=== 🔑 FORGOT PASSWORD ENDPOINT ===");
    console.log("Email recebido:", req.body.email);
    
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      const user = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!user) {
        console.log(`⚠️ Email não encontrado: ${email} (mas retornando sucesso por segurança)`);
        return res.json({ 
          message: 'Se o email existir em nosso sistema, enviaremos instruções de recuperação.' 
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.usuario.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry
        }
      });

      console.log(`✅ Token de reset criado para: ${email}`);
      
      await emailService.sendPasswordResetEmail(email, resetToken);

      res.json({ 
        message: 'Se o email existir em nosso sistema, enviaremos instruções de recuperação.' 
      });

    } catch (error: any) {
      console.error('Erro em forgotPassword:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async resetPassword(req: Request, res: Response) {
    console.log("=== 🔄 RESET PASSWORD ENDPOINT ===");
    console.log("Token recebido:", req.body.token ? '***' : 'null');
    
    try {
      const { token, novaSenha, confirmacaoSenha } = req.body;

      if (!token || !novaSenha || !confirmacaoSenha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      if (novaSenha !== confirmacaoSenha) {
        return res.status(400).json({ error: 'As senhas não coincidem' });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
      }

      const user = await prisma.usuario.findFirst({
        where: { 
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        console.log(`❌ Token inválido ou expirado: ${token}`);
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }

      const hashedPassword = await bcrypt.hash(novaSenha, 12);

      await prisma.usuario.update({
        where: { id: user.id },
        data: {
          senha: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      console.log(`✅ Senha resetada para usuário: ${user.email}`);

      res.json({ 
        message: 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.' 
      });

    } catch (error: any) {
      console.error('Erro em resetPassword:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}