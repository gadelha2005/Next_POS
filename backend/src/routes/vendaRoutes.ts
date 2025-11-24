import { Router, Request, Response } from 'express';
import { VendaController } from '../controller/vendaController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const vendaController = new VendaController();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// ROTAS CRUD VENDAS

// POST /api/vendas - Criar nova venda
router.post('/', (req: Request, res: Response) => 
  vendaController.criarVenda(req, res)
);

// GET /api/vendas - Listar vendas com paginação e filtros
router.get('/', (req: Request, res: Response) => 
  vendaController.listarVendas(req, res)
);

// GET /api/vendas/:id - Buscar venda por ID
router.get('/:id', (req: Request, res: Response) => 
  vendaController.buscarVenda(req, res)
);

// PUT /api/vendas/:id/cancelar - Cancelar venda
router.put('/:id/cancelar', (req: Request, res: Response) => 
  vendaController.cancelarVenda(req, res)
);

// GET /api/vendas/caixa/:caixaId - Listar vendas por caixa
router.get('/caixa/:caixaId', (req: Request, res: Response) => 
  vendaController.listarVendasPorCaixa(req, res)
);

export default router;