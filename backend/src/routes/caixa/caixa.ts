// src/routes/caixa/caixa.ts
import { Router } from 'express';
import { CaixaController } from '../../controller/caixa/caixaController';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const caixaController = new CaixaController();

// Todas as rotas exigem autenticação
router.use(authMiddleware);
 
router.post('/abrir', caixaController.abrirCaixa);
router.post('/fechar', caixaController.fecharCaixa);
router.get('/aberto', caixaController.getCaixaAberto);
router.get('/status', caixaController.getCaixaStatus);
router.post('/caixa/limpar', authMiddleware, caixaController.limparCaixasAbertos);


export default router;