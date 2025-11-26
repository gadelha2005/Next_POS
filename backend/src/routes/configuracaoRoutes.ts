import { Router } from 'express';
import { ConfiguracaoController } from '../controller/configuracaoController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const configuracaoController = new ConfiguracaoController();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// POST /api/configuracoes - Criar configuração (só uma por sistema)
router.post('/', configuracaoController.criarConfiguracao);

// GET /api/configuracoes - Buscar configuração
router.get('/', configuracaoController.buscarConfiguracao);

// PUT /api/configuracoes - Atualizar configuração
router.put('/', configuracaoController.atualizarConfiguracao);

// DELETE /api/configuracoes - Deletar configuração
router.delete('/', configuracaoController.deletarConfiguracao);

export default router;