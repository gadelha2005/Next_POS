import jsPDF from 'jspdf';

class ReciboService {
  
  // Método principal para gerar o recibo
  gerarRecibo(venda) {
    try {
      console.log('Gerando recibo para venda:', venda);
      
      // Criar novo documento PDF
      const doc = new jsPDF();
      
      // Configurações do documento
      const margin = 15;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = margin;
      const lineHeight = 6;
      const sectionSpacing = 8;
      
      // ===== CABEÇALHO DO ESTABELECIMENTO =====
      this.adicionarCabecalho(doc, pageWidth, yPosition);
      yPosition += 25;
      
      // ===== INFORMAÇÕES DA VENDA =====
      yPosition = this.adicionarInformacoesVenda(doc, venda, margin, yPosition, lineHeight, sectionSpacing);
      
      // ===== ITENS DA VENDA =====
      yPosition = this.adicionarItensVenda(doc, venda, margin, yPosition, lineHeight, sectionSpacing, pageWidth);
      
      // ===== TOTAIS E PAGAMENTO =====
      yPosition = this.adicionarTotais(doc, venda, margin, yPosition, lineHeight, sectionSpacing, pageWidth);
      
      // ===== RODAPÉ =====
      this.adicionarRodape(doc, pageWidth, pageHeight);
      
      // ===== SALVAR PDF =====
      const fileName = this.gerarNomeArquivo(venda);
      doc.save(fileName);
      
      console.log('Recibo gerado com sucesso:', fileName);
      return true;
      
    } catch (error) {
      console.error('Erro ao gerar recibo:', error);
      return false;
    }
  }
  
  // ===== MÉTODOS AUXILIARES =====
  
  adicionarCabecalho(doc, pageWidth, yPosition) {
    // Logo/Nome do estabelecimento
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('NEXT POS', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 7;
    
    // Slogan/Descrição
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Sistema de Gestão Comercial', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 5;
    
    // Linha divisória
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
  }
  
  adicionarInformacoesVenda(doc, venda, margin, yPosition, lineHeight, sectionSpacing) {
    // Título do recibo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('RECIBO DE VENDA', margin, yPosition);
    yPosition += lineHeight + sectionSpacing;
    
    // Informações básicas
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Número da venda
    const numeroVenda = venda.id || venda.numero || 'N/A';
    doc.text(`Venda: #${numeroVenda}`, margin, yPosition);
    yPosition += lineHeight;
    
    // Data e hora
    const dataVenda = this.formatarData(venda.createdAt || venda.dataVenda || venda.data);
    doc.text(`Data: ${dataVenda}`, margin, yPosition);
    yPosition += lineHeight;
    
    // Operador
    const operador = venda.operador || venda.usuario?.nome || venda.user?.nome || 'N/A';
    doc.text(`Operador: ${operador}`, margin, yPosition);
    yPosition += lineHeight;
    
    // Cliente se existir
    if (venda.cliente && venda.cliente.nome) {
      doc.text(`Cliente: ${venda.cliente.nome}`, margin, yPosition);
      yPosition += lineHeight;
      
      if (venda.cliente.cpfCnpj) {
        doc.text(`CPF/CNPJ: ${venda.cliente.cpfCnpj}`, margin, yPosition);
        yPosition += lineHeight;
      }
    }
    
    yPosition += sectionSpacing;
    
    // Linha divisória
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, doc.internal.pageSize.width - margin, yPosition);
    yPosition += sectionSpacing;
    
    return yPosition;
  }
  
  adicionarItensVenda(doc, venda, margin, yPosition, lineHeight, sectionSpacing, pageWidth) {
    // Cabeçalho da tabela
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ITENS DA VENDA', margin, yPosition);
    yPosition += lineHeight + 2;
    
    // Linha do cabeçalho
    doc.setDrawColor(150, 150, 150);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
    
    // Itens
    doc.setFont('helvetica', 'normal');
    
    if (venda.itens && venda.itens.length > 0) {
      venda.itens.forEach((item, index) => {
        // Verificar se precisa de nova página
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }
        
        const nomeProduto = item.nome || item.produto?.nome || 'Produto';
        const quantidade = item.qtd || item.quantidade || 1;
        const precoUnitario = item.preco || item.precoUnitario || 0;
        const totalItem = quantidade * precoUnitario;
        
        // Nome do produto (com quebra de linha se necessário)
        const nomeLinhas = doc.splitTextToSize(nomeProduto, 80);
        
        // Primeira linha: Nome e quantidade
        doc.text(nomeLinhas[0], margin, yPosition);
        doc.text(`${quantidade}x`, pageWidth - margin - 40, yPosition, { align: 'right' });
        
        // Linhas adicionais do nome (se houver)
        if (nomeLinhas.length > 1) {
          for (let i = 1; i < nomeLinhas.length; i++) {
            yPosition += lineHeight;
            doc.text(nomeLinhas[i], margin + 5, yPosition);
          }
        }
        
        yPosition += lineHeight;
        
        // Preço unitário e total
        doc.text(`R$ ${precoUnitario.toFixed(2)} un.`, margin + 5, yPosition);
        doc.text(`R$ ${totalItem.toFixed(2)}`, pageWidth - margin - 5, yPosition, { align: 'right' });
        
        yPosition += lineHeight + 2;
        
        // Linha divisória entre itens
        if (index < venda.itens.length - 1) {
          doc.setDrawColor(240, 240, 240);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 3;
        }
      });
    } else {
      doc.text('Nenhum item encontrado', margin, yPosition);
      yPosition += lineHeight;
    }
    
    yPosition += sectionSpacing;
    
    // Linha divisória final
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += sectionSpacing;
    
    return yPosition;
  }
  
  adicionarTotais(doc, venda, margin, yPosition, lineHeight, sectionSpacing, pageWidth) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    
    // Subtotal
    const subtotal = venda.subtotal || venda.total || 0;
    const desconto = venda.desconto || 0;
    const total = venda.total || 0;

    doc.text('Subtotal:', pageWidth - margin - 50, yPosition);
    doc.text(`R$ ${subtotal.toFixed(2)}`, pageWidth - margin - 5, yPosition, { align: 'right' });
    yPosition += lineHeight;
    
    // Desconto (se houver)
    if (desconto > 0) {
        doc.text('Desconto:', pageWidth - margin - 50, yPosition);
        doc.text(`-R$ ${desconto.toFixed(2)}`, pageWidth - margin - 5, yPosition, { align: 'right' });
        yPosition += lineHeight;
    }
    
    // Método de pagamento
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const metodoPagamento = venda.metodoPagamento ? venda.metodoPagamento.toUpperCase() : 'N/A';
    doc.text(`Forma de Pagamento: ${metodoPagamento}`, margin, yPosition);
    yPosition += lineHeight;
    
    // Informações de dinheiro (se aplicável)
    if (venda.metodoPagamento === 'dinheiro' && venda.valorRecebido) {
        doc.text(`Valor Recebido: R$ ${venda.valorRecebido.toFixed(2)}`, margin, yPosition);
        yPosition += lineHeight;
        
        // CORREÇÃO: Converter troco para número antes de usar toFixed
        const troco = Number(venda.troco) || 0;
        if (troco > 0) {
        doc.text(`Troco: R$ ${troco.toFixed(2)}`, margin, yPosition);
        yPosition += lineHeight;
        }
    }
    
    yPosition += 5;
    
    // Total final
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', pageWidth - margin - 50, yPosition);
    doc.text(`R$ ${total.toFixed(2)}`, pageWidth - margin - 5, yPosition, { align: 'right' });
    
    return yPosition + 15;
    }
  
  adicionarRodape(doc, pageWidth, pageHeight) {
    const margin = 15;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    // Mensagem de agradecimento
    doc.text('Obrigado pela preferência!', pageWidth / 2, pageHeight - 20, { align: 'center' });
    doc.text('Volte sempre!', pageWidth / 2, pageHeight - 15, { align: 'center' });
    
    // Linha do rodapé
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
  }
  
  formatarData(dataString) {
    try {
        // Se já for uma data válida (do dashboard)
        if (dataString instanceof Date) {
        return dataString.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        }
        
        // Se for string no formato das telas de caixa: "DD/MM/YYYY, HH:MM:SS"
        if (typeof dataString === 'string' && dataString.includes('/')) {
        // Formato: "26/01/2024, 15:30:25"
        const [dataPart, horaPart] = dataString.split(', ');
        const [dia, mes, ano] = dataPart.split('/');
        const [hora, minuto] = horaPart ? horaPart.split(':') : ['00', '00'];
        
        // Criar data no formato YYYY-MM-DDTHH:MM:SS
        const dataFormatada = new Date(`${ano}-${mes}-${dia}T${hora}:${minuto}:00`);
        return dataFormatada.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        }
        
        // Se for string no formato ISO (do dashboard)
        const data = new Date(dataString);
        if (!isNaN(data.getTime())) {
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        }
        
        // Se não conseguir parsear, retorna a string original
        return dataString || 'Data inválida';
        
    } catch {
        // Fallback: data atual
        return new Date().toLocaleString('pt-BR');
    }
    }
  
  gerarNomeArquivo(venda) {
    const numeroVenda = venda.id || venda.numero || Date.now();
    const data = new Date().toISOString().split('T')[0];
    return `recibo_venda_${numeroVenda}_${data}.pdf`;
  }
}

export default new ReciboService();