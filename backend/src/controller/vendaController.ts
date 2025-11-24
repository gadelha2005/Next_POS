import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { Venda, CreateVendaData, UpdateVendaData, VendaFilters } from '../model/Venda';

export class VendaController {
  
  // CREATE - Criar nova venda
  async criarVenda(req: Request, res: Response) {
    try {
      const { clienteId, usuarioId, caixaId, itens, metodoPagamento, valorRecebido, desconto = 0 }: CreateVendaData = req.body;

      // Validações básicas
      if (!usuarioId || !caixaId || !itens || !metodoPagamento) {
        return res.status(400).json({ error: 'Usuário, caixa, itens e método de pagamento são obrigatórios' });
      }

      if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ error: 'A venda deve conter pelo menos um item' });
      }

      // Verificar se caixa existe e está aberto
      const caixa = await prisma.caixa.findUnique({
        where: { id: caixaId }
      });

      if (!caixa) {
        return res.status(404).json({ error: 'Caixa não encontrado' });
      }

      if (caixa.status !== 'aberto') {
        return res.status(400).json({ error: 'Caixa fechado. Não é possível realizar vendas' });
      }

      // Buscar informações dos produtos e validar estoque
      const produtosIds = itens.map(item => item.produtoId);
      const produtos = await prisma.produto.findMany({
        where: { 
          id: { in: produtosIds },
          ativo: true
        }
      });

      // Validar estoque e preparar itens da venda
      const itensVenda = [];
      let subtotal = 0;

      for (const item of itens) {
        const produto = produtos.find(p => p.id === item.produtoId);
        
        if (!produto) {
          return res.status(404).json({ error: `Produto não encontrado: ${item.produtoId}` });
        }

        if (produto.estoque < item.quantidade) {
          return res.status(400).json({ 
            error: `Estoque insuficiente para ${produto.nome}. Disponível: ${produto.estoque}, Solicitado: ${item.quantidade}` 
          });
        }

        const precoUnitario = produto.preco;
        const itemSubtotal = precoUnitario * item.quantidade;
        
        itensVenda.push({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario,
          subtotal: itemSubtotal
        });

        subtotal += itemSubtotal;
      }

      // Calcular totais
      const total = subtotal - desconto;
      let troco = 0;

      if (metodoPagamento === 'dinheiro' && valorRecebido) {
        if (valorRecebido < total) {
          return res.status(400).json({ error: 'Valor recebido insuficiente' });
        }
        troco = valorRecebido - total;
      }

      // Gerar número sequencial da venda
      const ultimaVenda = await prisma.venda.findFirst({
        orderBy: { numero: 'desc' }
      });
      
      const numeroVenda = ultimaVenda ? ultimaVenda.numero + 1 : 1;

      // Criar venda no banco
      const venda = await prisma.venda.create({
        data: {
          numero: numeroVenda,
          clienteId: clienteId || null,
          usuarioId,
          caixaId,
          subtotal,
          desconto,
          total,
          metodoPagamento,
          statusPagamento: 'aprovado',
          valorRecebido: metodoPagamento === 'dinheiro' ? valorRecebido : total,
          troco: metodoPagamento === 'dinheiro' ? troco : 0,
          dataVenda: new Date(),
          itens: {
            create: itensVenda
          }
        },
        include: {
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  codigo: true,
                  preco: true
                }
              }
            }
          },
          cliente: {
            select: {
              id: true,
              nome: true,
              cpfCnpj: true
            }
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          },
          caixa: {
            select: {
              id: true,
              valorInicial: true,
              status: true
            }
          }
        }
      });

      // Atualizar estoque dos produtos
      for (const item of itens) {
        await prisma.produto.update({
          where: { id: item.produtoId },
          data: {
            estoque: {
              decrement: item.quantidade
            }
          }
        });
      }

      res.status(201).json({
        message: 'Venda realizada com sucesso',
        venda
      });

    } catch (error: any) {
      console.error('Erro ao criar venda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // READ - Listar vendas com paginação e filtros
  async listarVendas(req: Request, res: Response) {
    try {
      const { 
        dataInicio, 
        dataFim, 
        caixaId, 
        usuarioId, 
        clienteId, 
        metodoPagamento, 
        statusPagamento,
        pagina = '1', 
        limite = '10' 
      } = req.query;

      const paginaNum = parseInt(pagina as string);
      const limiteNum = parseInt(limite as string);
      const skip = (paginaNum - 1) * limiteNum;

      // Construir filtros
      const where: any = {};

      if (dataInicio || dataFim) {
        where.dataVenda = {};
        if (dataInicio) where.dataVenda.gte = new Date(dataInicio as string);
        if (dataFim) where.dataVenda.lte = new Date(dataFim as string);
      }

      if (caixaId) where.caixaId = caixaId;
      if (usuarioId) where.usuarioId = usuarioId;
      if (clienteId) where.clienteId = clienteId;
      if (metodoPagamento) where.metodoPagamento = metodoPagamento;
      if (statusPagamento) where.statusPagamento = statusPagamento;

      const [vendas, total] = await Promise.all([
        prisma.venda.findMany({
          where,
          skip,
          take: limiteNum,
          include: {
            itens: {
              include: {
                produto: {
                  select: {
                    id: true,
                    nome: true,
                    codigo: true
                  }
                }
              }
            },
            cliente: {
              select: {
                id: true,
                nome: true
              }
            },
            usuario: {
              select: {
                id: true,
                nome: true
              }
            },
            caixa: {
              select: {
                id: true,
                valorInicial: true
              }
            }
          },
          orderBy: { dataVenda: 'desc' }
        }),
        prisma.venda.count({ where })
      ]);

      res.json({
        vendas,
        paginacao: {
          pagina: paginaNum,
          limite: limiteNum,
          total,
          totalPaginas: Math.ceil(total / limiteNum)
        }
      });

    } catch (error: any) {
      console.error('Erro ao listar vendas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // READ - Buscar venda por ID
  async buscarVenda(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const venda = await prisma.venda.findUnique({
        where: { id },
        include: {
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  codigo: true,
                  preco: true
                }
              }
            }
          },
          cliente: {
            select: {
              id: true,
              nome: true,
              cpfCnpj: true,
              telefone: true,
              email: true
            }
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          },
          caixa: {
            select: {
              id: true,
              valorInicial: true,
              status: true
            }
          }
        }
      });

      if (!venda) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      res.json({ venda });

    } catch (error: any) {
      console.error('Erro ao buscar venda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // UPDATE - Cancelar venda
  async cancelarVenda(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const venda = await prisma.venda.findUnique({
        where: { id },
        include: {
          itens: true
        }
      });

      if (!venda) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      if (venda.statusPagamento === 'cancelado') {
        return res.status(400).json({ error: 'Venda já está cancelada' });
      }

      // Estornar estoque dos produtos
      for (const item of venda.itens) {
        await prisma.produto.update({
          where: { id: item.produtoId },
          data: {
            estoque: {
              increment: item.quantidade
            }
          }
        });
      }

      // Marcar venda como cancelada
      const vendaCancelada = await prisma.venda.update({
        where: { id },
        data: {
          statusPagamento: 'cancelado'
        },
        include: {
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  codigo: true
                }
              }
            }
          }
        }
      });

      res.json({
        message: 'Venda cancelada com sucesso',
        venda: vendaCancelada
      });

    } catch (error: any) {
      console.error('Erro ao cancelar venda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // READ - Vendas por caixa
  async listarVendasPorCaixa(req: Request, res: Response) {
    try {
      const { caixaId } = req.params;

      const vendas = await prisma.venda.findMany({
        where: { 
          caixaId,
          statusPagamento: 'aprovado'
        },
        include: {
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  codigo: true
                }
              }
            }
          },
          usuario: {
            select: {
              id: true,
              nome: true
            }
          }
        },
        orderBy: { dataVenda: 'asc' }
      });

      const totalVendas = vendas.reduce((acc, venda) => acc + venda.total, 0);

      res.json({
        vendas,
        totalVendas,
        quantidadeVendas: vendas.length
      });

    } catch (error: any) {
      console.error('Erro ao listar vendas por caixa:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}