import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { CreateConfiguracaoData, UpdateConfiguracaoData } from '../model/Configuracao';

export class ConfiguracaoController {
  
  // CREATE - Criar configuração (só deve ter uma configuração)
  async criarConfiguracao(req: Request, res: Response) {
    try {
      const {
        nomeLoja,
        cnpj,
        endereco,
        telefone,
        email,
        tokenApiPagamento,
        chavePix,
        taxaCartaoCredito = 2.99,
        taxaCartaoDebito = 1.99,
        tokenApiNfe,
        serieNfe = "1",
        ambienteNfe = "homologacao",
        moeda = "BRL",
        fusoHorario = "America/Sao_Paulo",
        taxaImposto = 0
      }: CreateConfiguracaoData = req.body;

      // VALIDAÇÕES
      if (!nomeLoja) {
        return res.status(400).json({ error: 'Nome da loja é obrigatório' });
      }

      // Verificar se já existe configuração
      const configuracaoExistente = await prisma.configuracao.findFirst();
      if (configuracaoExistente) {
        return res.status(400).json({ 
          error: 'Configuração já existe. Use a rota de atualização.' 
        });
      }

      // CRIAR CONFIGURAÇÃO
      const configuracao = await prisma.configuracao.create({
        data: {
          nomeLoja,
          cnpj: cnpj || null,
          endereco: endereco || null,
          telefone: telefone || null,
          email: email || null,
          tokenApiPagamento: tokenApiPagamento || null,
          chavePix: chavePix || null,
          taxaCartaoCredito,
          taxaCartaoDebito,
          tokenApiNfe: tokenApiNfe || null,
          serieNfe,
          ambienteNfe,
          moeda,
          fusoHorario,
          taxaImposto
        }
      });

      res.status(201).json({
        message: 'Configuração criada com sucesso',
        configuracao
      });

    } catch (error: any) {
      console.error('Erro ao criar configuração:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // READ - Buscar configuração (sempre retorna a primeira/única)
  async buscarConfiguracao(req: Request, res: Response) {
    try {
      const configuracao = await prisma.configuracao.findFirst();

      if (!configuracao) {
        // Retorna configuração padrão se não existir
        const configuracaoPadrao = {
          nomeLoja: "Minha Loja",
          cnpj: null,
          endereco: null,
          telefone: null,
          email: null,
          tokenApiPagamento: null,
          chavePix: null,
          taxaCartaoCredito: 2.99,
          taxaCartaoDebito: 1.99,
          tokenApiNfe: null,
          serieNfe: "1",
          ambienteNfe: "homologacao",
          moeda: "BRL",
          fusoHorario: "America/Sao_Paulo",
          taxaImposto: 0
        };
        
        return res.json({ configuracao: configuracaoPadrao });
      }

      res.json({ configuracao });

    } catch (error: any) {
      console.error('Erro ao buscar configuração:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // UPDATE - Atualizar configuração
  async atualizarConfiguracao(req: Request, res: Response) {
    try {
      const {
        nomeLoja,
        cnpj,
        endereco,
        telefone,
        email,
        tokenApiPagamento,
        chavePix,
        taxaCartaoCredito,
        taxaCartaoDebito,
        tokenApiNfe,
        serieNfe,
        ambienteNfe,
        moeda,
        fusoHorario,
        taxaImposto
      }: UpdateConfiguracaoData = req.body;

      // Buscar configuração existente
      let configuracaoExistente = await prisma.configuracao.findFirst();

      // Se não existe, criar
      if (!configuracaoExistente) {
        const configuracao = await prisma.configuracao.create({
          data: {
            nomeLoja: nomeLoja || "Minha Loja",
            cnpj: cnpj || null,
            endereco: endereco || null,
            telefone: telefone || null,
            email: email || null,
            tokenApiPagamento: tokenApiPagamento || null,
            chavePix: chavePix || null,
            taxaCartaoCredito: taxaCartaoCredito || 2.99,
            taxaCartaoDebito: taxaCartaoDebito || 1.99,
            tokenApiNfe: tokenApiNfe || null,
            serieNfe: serieNfe || "1",
            ambienteNfe: ambienteNfe || "homologacao",
            moeda: moeda || "BRL",
            fusoHorario: fusoHorario || "America/Sao_Paulo",
            taxaImposto: taxaImposto || 0
          }
        });

        return res.json({
          message: 'Configuração criada com sucesso',
          configuracao
        });
      }

      // Se existe, atualizar
      const configuracao = await prisma.configuracao.update({
        where: { id: configuracaoExistente.id },
        data: {
          ...(nomeLoja && { nomeLoja }),
          ...(cnpj !== undefined && { cnpj: cnpj || null }),
          ...(endereco !== undefined && { endereco: endereco || null }),
          ...(telefone !== undefined && { telefone: telefone || null }),
          ...(email !== undefined && { email: email || null }),
          ...(tokenApiPagamento !== undefined && { tokenApiPagamento: tokenApiPagamento || null }),
          ...(chavePix !== undefined && { chavePix: chavePix || null }),
          ...(taxaCartaoCredito !== undefined && { taxaCartaoCredito }),
          ...(taxaCartaoDebito !== undefined && { taxaCartaoDebito }),
          ...(tokenApiNfe !== undefined && { tokenApiNfe: tokenApiNfe || null }),
          ...(serieNfe && { serieNfe }),
          ...(ambienteNfe && { ambienteNfe }),
          ...(moeda && { moeda }),
          ...(fusoHorario && { fusoHorario }),
          ...(taxaImposto !== undefined && { taxaImposto })
        }
      });

      res.json({
        message: 'Configuração atualizada com sucesso',
        configuracao
      });

    } catch (error: any) {
      console.error('Erro ao atualizar configuração:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // DELETE - Deletar configuração
  async deletarConfiguracao(req: Request, res: Response) {
    try {
      const configuracao = await prisma.configuracao.findFirst();

      if (!configuracao) {
        return res.status(404).json({ error: 'Configuração não encontrada' });
      }

      await prisma.configuracao.delete({
        where: { id: configuracao.id }
      });

      res.json({ message: 'Configuração deletada com sucesso' });

    } catch (error: any) {
      console.error('Erro ao deletar configuração:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}