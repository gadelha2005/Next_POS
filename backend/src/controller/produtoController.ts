import { Request, Response } from 'express';
import { prisma } from "../config/prisma";
import { Produto, CreateProdutoData, UpdateProdutoData } from '../model/Produto';
import imageSearchService from '../service/imageSearchService';

interface CustomRequest extends Request {
  file?: Express.Multer.File;
}

export class ProdutoController {
  
  async criarProduto(req: CustomRequest, res: Response) {
    try {
      const { nome, codigo, codigoBarras, categoria, preco, custo, estoque, estoqueMinimo }: CreateProdutoData = req.body;

      if (!nome || !categoria || !preco || estoque === undefined) {
        return res.status(400).json({ error: 'Nome, categoria, preço e estoque são obrigatórios' });
      }

      if (preco < 0 || estoque < 0) {
        return res.status(400).json({ error: 'Preço e estoque devem ser positivos' });
      }

      let imagemUrl = null;
      if (!req.file) {
        try {
          imagemUrl = await imageSearchService.buscarImagemProduto(nome, codigoBarras);
        } catch (error) {
          imagemUrl = null;
        }
      }

      if (codigo) {
        const produtoExistente = await prisma.produto.findUnique({
          where: { codigo }
        });

        if (produtoExistente) {
          return res.status(400).json({ error: 'Código do produto já existe' });
        }
      }

      const codigoFinal = codigo || `PROD${Date.now()}`;
      const codigoBarrasFinal = codigoBarras || codigoFinal;

      const produtoData: any = {
        nome,
        codigo: codigoFinal,
        codigoBarras: codigoBarrasFinal,
        categoria,
        preco: parseFloat(preco.toString()),
        custo: custo ? parseFloat(custo.toString()) : null,
        estoque: parseInt(estoque.toString()),
        estoqueMinimo: parseInt(estoqueMinimo?.toString() || "5"),
      };

      if (req.file) {
        produtoData.imagem = `/uploads/${req.file.filename}`;
      } else if (imagemUrl) {
        produtoData.imagem = imagemUrl;
      } else {
        produtoData.imagem = null;
      }

      const produto = await prisma.produto.create({
        data: produtoData
      });

      res.status(201).json({
        message: 'Produto criado com sucesso',
        produto
      });

    } catch (error: any) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listarProdutos(req: Request, res: Response) {
    try {
      const { pagina = '1', limite = '10', busca, categoria, ativo = 'true' } = req.query;
      
      const paginaNum = parseInt(pagina as string);
      const limiteNum = parseInt(limite as string);
      const skip = (paginaNum - 1) * limiteNum;
      
      const where: any = { 
        ativo: ativo === 'true' 
      };
      
      if (busca) {
        where.OR = [
          { nome: { contains: busca as string, mode: 'insensitive' } },
          { codigo: { contains: busca as string } },
          { codigoBarras: { contains: busca as string } }
        ];
      }
      
      if (categoria && categoria !== 'todas') {
        where.categoria = categoria as string;
      }

      const [produtos, total] = await Promise.all([
        prisma.produto.findMany({
          where,
          skip,
          take: limiteNum,
          orderBy: { nome: 'asc' }
        }),
        prisma.produto.count({ where })
      ]);

      res.json({
        produtos,
        paginacao: {
          pagina: paginaNum,
          limite: limiteNum,
          total,
          totalPaginas: Math.ceil(total / limiteNum)
        }
      });

    } catch (error: any) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async buscarProduto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const produto = await prisma.produto.findUnique({
        where: { id }
      });

      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json({ produto });

    } catch (error: any) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async buscarPorCodigo(req: Request, res: Response) {
    try {
      const { codigo } = req.params;
      
      const produto = await prisma.produto.findFirst({
        where: {
          OR: [
            { codigoBarras: codigo },
            { codigo: codigo }
          ],
          ativo: true
        }
      });

      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json({ produto });

    } catch (error: any) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async atualizarProduto(req: CustomRequest, res: Response) {
    try {
      const { id } = req.params;
      const { nome, categoria, preco, custo, estoque, estoqueMinimo, ativo }: UpdateProdutoData = req.body;

      const produtoExistente = await prisma.produto.findUnique({
        where: { id }
      });

      if (!produtoExistente) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const dadosAtualizacao: any = {
        updatedAt: new Date()
      };

      if (nome !== undefined) dadosAtualizacao.nome = nome;
      if (categoria !== undefined) dadosAtualizacao.categoria = categoria;
      if (preco !== undefined) dadosAtualizacao.preco = parseFloat(preco.toString());
      if (custo !== undefined) dadosAtualizacao.custo = custo ? parseFloat(custo.toString()) : null;
      if (estoque !== undefined) dadosAtualizacao.estoque = parseInt(estoque.toString());
      if (estoqueMinimo !== undefined) dadosAtualizacao.estoqueMinimo = parseInt(estoqueMinimo.toString());
      if (ativo !== undefined) dadosAtualizacao.ativo = ativo;
      
      if (req.file) {
        dadosAtualizacao.imagem = `/uploads/${req.file.filename}`;
      }

      const produto = await prisma.produto.update({
        where: { id },
        data: dadosAtualizacao
      });

      res.json({
        message: 'Produto atualizado com sucesso',
        produto
      });

    } catch (error: any) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async desativarProduto(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const produto = await prisma.produto.findUnique({
        where: { id }
      });

      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      await prisma.produto.update({
        where: { id },
        data: { 
          ativo: false, 
          updatedAt: new Date() 
        }
      });

      res.json({ message: 'Produto desativado com sucesso' });

    } catch (error: any) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getEstoqueBaixo(req: Request, res: Response) {
    try {
      const produtos = await prisma.produto.findMany({
        where: {
          estoque: {
            lte: prisma.produto.fields.estoqueMinimo
          },
          ativo: true
        },
        orderBy: { estoque: 'asc' }
      });

      res.json({ produtos });

    } catch (error: any) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async migrarDadosLocalStorage(req: Request, res: Response) {
    try {
      const { produtos } = req.body;

      if (!produtos || !Array.isArray(produtos)) {
        return res.status(400).json({ error: 'Dados de produtos inválidos' });
      }

      let migrados = 0;
      const erros: any[] = [];

      for (const produtoLocal of produtos) {
        try {
          const existe = await prisma.produto.findUnique({
            where: { codigo: produtoLocal.codigo }
          });

          if (!existe) {
            await prisma.produto.create({
              data: {
                nome: produtoLocal.nome,
                codigo: produtoLocal.codigo,
                codigoBarras: produtoLocal.codigoBarras || produtoLocal.codigo,
                categoria: produtoLocal.categoria || 'Geral',
                preco: parseFloat(produtoLocal.preco),
                custo: produtoLocal.custo ? parseFloat(produtoLocal.custo) : null,
                estoque: parseInt(produtoLocal.estoque) || 0,
                estoqueMinimo: parseInt(produtoLocal.estoqueMinimo) || 5,
                imagem: produtoLocal.imagem || null,
              }
            });
            migrados++;
          }
        } catch (error: any) {
          erros.push({
            produto: produtoLocal.nome,
            erro: error.message
          });
        }
      }

      res.json({
        message: `Migração concluída: ${migrados} produtos migrados`,
        migrados,
        erros,
        total: produtos.length
      });

    } catch (error: any) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  private async gerarCodigoAutomatico(): Promise<string> {
    const ultimoProduto = await prisma.produto.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { codigo: true }
    });

    let proximoNumero = 1000;
    
    if (ultimoProduto?.codigo) {
      const numeros = ultimoProduto.codigo.match(/\d+/g);
      if (numeros && numeros.length > 0) {
        proximoNumero = parseInt(numeros[0]) + 1;
      }
    }

    return `PROD${proximoNumero}`;
  }
}