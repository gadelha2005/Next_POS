import { Router } from 'express';
import { ClienteController } from '../controller/clienteController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const clienteController = new ClienteController();


router.use(authMiddleware);

// POST /api/clientes - Criar novo cliente
router.post('/', clienteController.criarCliente);

// GET /api/clientes - Listar clientes (com busca e paginação)
router.get('/', clienteController.listarClientes);

// GET /api/clientes/:id - Buscar cliente por ID
router.get('/:id', clienteController.buscarCliente);

// PUT /api/clientes/:id - Atualizar cliente
router.put('/:id', clienteController.atualizarCliente);

export default router;