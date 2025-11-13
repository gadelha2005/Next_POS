// src/controller/caixa/caixaController.ts
import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export class CaixaController {
  async abrirCaixa(req: Request, res: Response) {
    try {
      const { valorInicial } = req.body;
      const usuarioId = req.userId;

      if (!usuarioId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      if (!valorInicial || isNaN(valorInicial) || valorInicial < 0) {
        return res
          .status(400)
          .json({ error: "Valor inicial é obrigatório e deve ser positivo" });
      }

      const caixaAberto = await prisma.caixa.findFirst({
        where: {
          usuarioId,
          status: "aberto",
        },
      });

      if (caixaAberto) {
        return res
          .status(400)
          .json({ error: "Já existe um caixa aberto para este usuário" });
      }

      const caixa = await prisma.caixa.create({
        data: {
          valorInicial: parseFloat(valorInicial),
          usuarioId: usuarioId,
          status: "aberto",
        },
      });

      res.status(201).json({
        message: "Caixa aberto com sucesso",
        caixa,
      });
    } catch (error: any) {
      console.error("Erro ao abrir caixa:", error.message);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async fecharCaixa(req: Request, res: Response) {
    try {
      const { saldoFinal } = req.body;
      const usuarioId = req.userId;

      if (!usuarioId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      if (!saldoFinal || isNaN(saldoFinal) || saldoFinal < 0) {
        return res
          .status(400)
          .json({ error: "Saldo final é obrigatório e deve ser positivo" });
      }

      const caixaAberto = await prisma.caixa.findFirst({
        where: {
          usuarioId,
          status: "aberto",
        },
      });

      if (!caixaAberto) {
        return res
          .status(404)
          .json({ error: "Nenhum caixa aberto encontrado" });
      }

      const caixa = await prisma.caixa.update({
        where: { id: caixaAberto.id },
        data: {
          saldoFinal: parseFloat(saldoFinal),
          dataFechamento: new Date(),
          status: "fechado",
        },
      });

      res.json({
        message: "Caixa fechado com sucesso",
        caixa,
      });
    } catch (error: any) {
      console.error("Erro ao fechar caixa:", error.message);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async getCaixaAberto(req: Request, res: Response) {
    try {
      const usuarioId = req.userId;

      if (!usuarioId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const caixaAberto = await prisma.caixa.findFirst({
        where: {
          usuarioId,
          status: "aberto",
        },
      });

      res.json({ caixa: caixaAberto });
    } catch (error: any) {
      console.error("Erro ao buscar caixa aberto:", error.message);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async getCaixaStatus(req: Request, res: Response) {
    try {
      const usuarioId = req.userId;

      if (!usuarioId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const caixaAberto = await prisma.caixa.findFirst({
        where: {
          usuarioId,
          status: "aberto",
        },
      });

      res.json({
        temCaixaAberto: !!caixaAberto,
        caixa: caixaAberto,
      });
    } catch (error: any) {
      console.error("Erro ao verificar status do caixa:", error.message);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async limparCaixasAbertos(req: Request, res: Response) {
    try {
      const usuarioId = req.userId;

      if (!usuarioId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      // Fecha todos os caixas abertos do usuário
      const caixasFechados = await prisma.caixa.updateMany({
        where: {
          usuarioId,
          status: "aberto",
        },
        data: {
          status: "fechado",
          dataFechamento: new Date(),
          saldoFinal: 0,
        },
      });

      res.json({
        message: `${caixasFechados.count} caixa(s) fechado(s) com sucesso`,
        caixasFechados: caixasFechados.count,
      });
    } catch (error: any) {
      console.error("Erro ao limpar caixas abertos:", error.message);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
}
