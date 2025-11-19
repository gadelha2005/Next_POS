import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { CreateClienteData, UpdateClienteData } from '../model/Cliente';

export class ClienteController {
  
  // CREATE - Criar novo cliente
  async criarCliente(req: Request, res: Response) {
    try {
      const { nome, cpfCnpj, telefone, email, endereco }: CreateClienteData = req.body;

      // VALIDAÇÕES
      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      // Verificar CPF/CNPJ único (se fornecido)
      if (cpfCnpj) {
        const clienteExistente = await prisma.cliente.findUnique({
          where: { cpfCnpj }
        });
        if (clienteExistente) {
          return res.status(400).json({ error: 'CPF/CNPJ já cadastrado' });
        }
      }

      // Verificar email único (se fornecido)
      if (email) {
        const emailExistente = await prisma.cliente.findUnique({
          where: { email }
        });
        if (emailExistente) {
          return res.status(400).json({ error: 'Email já cadastrado' });
        }
      }

      // CRIAR CLIENTE
      const cliente = await prisma.cliente.create({
        data: {
          nome,
          cpfCnpj: cpfCnpj || null,
          telefone: telefone || null,
          email: email || null,
          endereco: endereco || null,
        }
      });

      res.status(201).json({
        message: 'Cliente criado com sucesso',
        cliente
      });

    } catch (error: any) {
      console.error('Erro ao criar cliente:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // READ - Listar clientes com busca e paginação
  async listarClientes(req: Request, res: Response) {
    try {
      const { page = '1', limit = '10', busca, cpfCnpj, email } = req.query;
      
      const paginaNum = parseInt(page as string);
      const limiteNum = parseInt(limit as string);
      const skip = (paginaNum - 1) * limiteNum;
      
      // CONSTRUIR FILTROS
      const where: any = {};
      
      if (busca) {
        where.OR = [
          { nome: { contains: busca as string, mode: 'insensitive' } },
          { cpfCnpj: { contains: busca as string } },
          { email: { contains: busca as string } }
        ];
      }
      
      if (cpfCnpj) {
        where.cpfCnpj = { contains: cpfCnpj as string };
      }
      
      if (email) {
        where.email = { contains: email as string };
      }

      const [clientes, total] = await Promise.all([
        prisma.cliente.findMany({
          where,
          skip,
          take: limiteNum,
          orderBy: { nome: 'asc' }
        }),
        prisma.cliente.count({ where })
      ]);

      res.json({
        clientes,
        paginacao: {
          pagina: paginaNum,
          limite: limiteNum,
          total,
          totalPaginas: Math.ceil(total / limiteNum)
        }
      });

    } catch (error: any) {
      console.error('Erro ao listar clientes:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // READ - Buscar cliente por ID
  async buscarCliente(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const cliente = await prisma.cliente.findUnique({
        where: { id }
      });

      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json({ cliente });

    } catch (error: any) {
      console.error('Erro ao buscar cliente:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // UPDATE - Atualizar cliente
  async atualizarCliente(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, cpfCnpj, telefone, email, endereco }: UpdateClienteData = req.body;

      // VERIFICAR SE CLIENTE EXISTE
      const clienteExistente = await prisma.cliente.findUnique({
        where: { id }
      });

      if (!clienteExistente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      // VALIDAR CPF/CNPJ ÚNICO (se fornecido e diferente do atual)
      if (cpfCnpj && cpfCnpj !== clienteExistente.cpfCnpj) {
        const cpfExistente = await prisma.cliente.findUnique({
          where: { cpfCnpj }
        });
        if (cpfExistente) {
          return res.status(400).json({ error: 'CPF/CNPJ já cadastrado' });
        }
      }

      // VALIDAR EMAIL ÚNICO (se fornecido e diferente do atual)
      if (email && email !== clienteExistente.email) {
        const emailExistente = await prisma.cliente.findUnique({
          where: { email }
        });
        if (emailExistente) {
          return res.status(400).json({ error: 'Email já cadastrado' });
        }
      }

      // ATUALIZAR CLIENTE
      const cliente = await prisma.cliente.update({
        where: { id },
        data: {
          ...(nome && { nome }),
          ...(cpfCnpj && { cpfCnpj }),
          ...(telefone && { telefone }),
          ...(email && { email }),
          ...(endereco && { endereco }),
        }
      });

      res.json({
        message: 'Cliente atualizado com sucesso',
        cliente
      });

    } catch (error: any) {
      console.error('Erro ao atualizar cliente:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}