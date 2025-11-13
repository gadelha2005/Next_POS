// src/routes/produtos.ts
import { Router } from 'express';
import { ProdutoController } from '../controller/produtoController';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const produtoController = new ProdutoController();

// Criar diretório de uploads se não existir
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'produto-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// ROTAS CRUD PRODUTOS

// POST /api/produtos - Criar novo produto (com upload de imagem)
router.post('/', upload.single('imagem'), produtoController.criarProduto);

// GET /api/produtos - Listar produtos com paginação e filtros
router.get('/', produtoController.listarProdutos);

// GET /api/produtos/estoque/baixo - Produtos com estoque baixo
router.get('/estoque/baixo', produtoController.getEstoqueBaixo);

// GET /api/produtos/:id - Buscar produto por ID
router.get('/:id', produtoController.buscarProduto);

// GET /api/produtos/codigo/:codigo - Busca rápida por código ou código de barras
router.get('/codigo/:codigo', produtoController.buscarPorCodigo);

// PUT /api/produtos/:id - Atualizar produto (com upload de imagem opcional)
router.put('/:id', upload.single('imagem'), produtoController.atualizarProduto);

// DELETE /api/produtos/:id - Desativar produto (soft delete)
router.delete('/:id', produtoController.desativarProduto);

// POST /api/produtos/migrar - Migrar dados do localStorage para o banco
router.post('/migrar/localstorage', produtoController.migrarDadosLocalStorage);

export default router;