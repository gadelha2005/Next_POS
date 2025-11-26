class ImageSearchService {
  
  async buscarImagemOpenFoodFacts(nomeProduto: string, codigoBarras: string | null = null): Promise<string | null> {
    try {
      let url: string;
      
      // Prioridade: buscar por código de barras se disponível
      if (codigoBarras) {
        url = `https://world.openfoodfacts.org/api/v0/product/${codigoBarras}.json`;
      } else {
        // Buscar por nome
        const query = encodeURIComponent(nomeProduto);
        url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=1`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Open Food Facts API error: ${response.status}`);
      }
      
      const data = await response.json() as any;
      
      // Se busca por código de barras
      if (codigoBarras && data.product) {
        if (data.product.image_url) {
          return data.product.image_url;
        }
        if (data.product.image_front_small_url) {
          return data.product.image_front_small_url;
        }
        if (data.product.image_front_url) {
          return data.product.image_front_url;
        }
      }
      
      // Se busca por nome
      if (!codigoBarras && data.products && data.products.length > 0) {
        const produto = data.products[0];
        if (produto.image_url) {
          return produto.image_url;
        }
        if (produto.image_front_small_url) {
          return produto.image_front_small_url;
        }
        if (produto.image_front_url) {
          return produto.image_front_url;
        }
      }
      
      return null;
      
    } catch (error) {
      return null;
    }
  }

  getImagemLocal(nomeProduto: string): string {
    const nomeLower = nomeProduto.toLowerCase();
    
    const bancoImagens: { [key: string]: string } = {
      'arroz': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&fit=crop',
      'feijão': 'https://images.unsplash.com/photo-1598965675045-45c1c57cf5d8?w=400&fit=crop',
      'feijao': 'https://images.unsplash.com/photo-1598965675045-45c1c57cf5d8?w=400&fit=crop',
      'açúcar': 'https://images.unsplash.com/photo-1571781926291-47774e7d0fd6?w=400&fit=crop',
      'acucar': 'https://images.unsplash.com/photo-1571781926291-47774e7d0fd6?w=400&fit=crop',
      'macarrão': 'https://images.unsplash.com/photo-1551462147-37885a1c3f0f?w=400&fit=crop',
      'macarrao': 'https://images.unsplash.com/photo-1551462147-37885a1c3f0f?w=400&fit=crop',
      'farinha': 'https://images.unsplash.com/photo-1571781926291-47774e7d0fd6?w=400&fit=crop',
      'óleo': 'https://images.unsplash.com/photo-1573383678327-1898c02c36dd?w=400&fit=crop',
      'oleo': 'https://images.unsplash.com/photo-1573383678327-1898c02c36dd?w=400&fit=crop',
      'leite': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&fit=crop',
      'queijo': 'https://images.unsplash.com/photo-1552767055-b270b7d76bd6?w=400&fit=crop',
      'manteiga': 'https://images.unsplash.com/photo-1589985270824-347b3c5d34a5?w=400&fit=crop',
      'pão': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&fit=crop',
      'pao': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&fit=crop',
      'refrigerante': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&fit=crop',
      'cerveja': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&fit=crop',
      'suco': 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&fit=crop',
      'água': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&fit=crop',
      'agua': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&fit=crop',
      'café': 'https://images.unsplash.com/photo-1587080413959-06b859fb1071?w=400&fit=crop',
      'cafe': 'https://images.unsplash.com/photo-1587080413959-06b859fb1071?w=400&fit=crop',
      'sabão': 'https://images.unsplash.com/photo-1600857062244-5c0071b9772a?w=400&fit=crop',
      'sabao': 'https://images.unsplash.com/photo-1600857062244-5c0071b9772a?w=400&fit=crop',
      'detergente': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&fit=crop',
      'shampoo': 'https://images.unsplash.com/photo-1610548822784-6d6dee0c9c26?w=400&fit=crop',
      'chocolate': 'https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=400&fit=crop'
    };

    for (const [key, url] of Object.entries(bancoImagens)) {
      if (nomeLower.includes(key)) {
        return url;
      }
    }

    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&fit=crop';
  }

  async buscarImagemProduto(nomeProduto: string, codigoBarras: string | null = null): Promise<string | null> {
    if (!nomeProduto || nomeProduto.trim() === '') {
      return null;
    }

    const timeoutPromise = new Promise<string>((resolve) => 
      setTimeout(() => resolve('timeout'), 4000)
    );

    try {
      const openFoodPromise = this.buscarImagemOpenFoodFacts(nomeProduto, codigoBarras);
      const resultado = await Promise.race([openFoodPromise, timeoutPromise]);

      if (resultado === 'timeout') {
        return this.getImagemLocal(nomeProduto);
      }

      if (resultado) {
        return resultado;
      }

      return this.getImagemLocal(nomeProduto);

    } catch (error) {
      return this.getImagemLocal(nomeProduto);
    }
  }
}

export default new ImageSearchService();