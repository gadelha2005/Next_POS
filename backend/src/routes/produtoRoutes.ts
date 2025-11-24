import { Router, Request, Response } from 'express';
import { ProdutoController } from '../controller/produtoController';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import imageSearchService from '../service/imageSearchService';

const router = Router();
const produtoController = new ProdutoController();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'produto-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Use apenas JPEG, PNG, GIF ou WebP.'));
    }
  }
});

const handleMulterError = (error: any, req: Request, res: Response, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Tamanho máximo: 5MB.' });
    }
    return res.status(400).json({ error: `Erro no upload: ${error.message}` });
  } else if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
};

router.use(authMiddleware);

router.post('/', upload.single('imagem'), handleMulterError, (req: Request, res: Response) => 
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

router.put('/:id', upload.single('imagem'), handleMulterError, (req: Request, res: Response) => 
  produtoController.atualizarProduto(req, res)
);

router.delete('/:id', (req: Request, res: Response) => 
  produtoController.desativarProduto(req, res)
);

router.post('/migrar/localstorage', (req: Request, res: Response) => 
  produtoController.migrarDadosLocalStorage(req, res)
);

router.post('/buscar-imagem', async (req: Request, res: Response) => {
  try {
    const { nomeProduto, codigoBarras } = req.body;

    if (!nomeProduto) {
      return res.status(400).json({ error: 'Nome do produto é obrigatório' });
    }

    const imagemUrl = await imageSearchService.buscarImagemProduto(nomeProduto, codigoBarras);

    res.json({
      success: true,
      imagemUrl,
      mensagem: imagemUrl ? 'Imagem encontrada com sucesso' : 'Nenhuma imagem encontrada'
    });

  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar imagem',
      imagemUrl: null
    });
  }
});

router.get('/imagem/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const imagePath = path.join(uploadsDir, filename);
  
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: 'Imagem não encontrada' });
  }
  
  res.sendFile(imagePath);
});

export default router;