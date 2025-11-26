import { Router, Request, Response } from 'express';
import { ProdutoController } from '../controller/produtoController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const produtoController = new ProdutoController();

router.use(authMiddleware);

router.post('/', (req: Request, res: Response) => 
  produtoController.criarProduto(req, res)
);

router.get('/', (req: Request, res: Response) => 
  produtoController.listarProdutos(req, res)
);

router.get('/estoque/baixo', (req: Request, res: Response) => 
  produtoController.getEstoqueBaixo(req, res)
);

router.get('/:id', (req: Request, res: Response) => 
  produtoController.buscarProduto(req, res)
);

router.get('/codigo/:codigo', (req: Request, res: Response) => 
  produtoController.buscarPorCodigo(req, res)
);

router.put('/:id', (req: Request, res: Response) => 
  produtoController.atualizarProduto(req, res)
);

router.delete('/:id', (req: Request, res: Response) => 
  produtoController.desativarProduto(req, res)
);

router.post('/migrar/localstorage', (req: Request, res: Response) => 
  produtoController.migrarDadosLocalStorage(req, res)
);

export default router;