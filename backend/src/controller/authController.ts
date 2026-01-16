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
    try {
      const { nome, email, senha }: RegisterData = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      if (senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
      }

      const existingUser = await prisma.usuario.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const hashedPassword = await bcrypt.hash(senha, 12);
      const role = 'caixa';

      const user = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: hashedPassword,
          role
        }
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

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
      console.error('Erro em register:', error.message || error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, senha }: LoginData = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const user = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const isPasswordValid = await bcrypt.compare(senha, user.senha);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

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
      console.error('Erro em login:', error.message || error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const user = await prisma.usuario.findUnique({
        where: { id: req.userId }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const { senha, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error('Erro em getProfile:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      const user = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!user) {
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

      res.json({ 
        message: 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.' 
      });

    } catch (error: any) {
      console.error('Erro em resetPassword:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}