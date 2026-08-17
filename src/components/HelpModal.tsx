import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  Calendar, 
  Package, 
  ShoppingBag, 
  Receipt, 
  Download, 
  FileSpreadsheet, 
  Smartphone, 
  Trash2, 
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTopic, setActiveTopic] = useState<'all' | 'events' | 'products' | 'pos' | 'finance' | 'install'>('all');

  if (!isOpen) return null;

  const downloadCsvExample = () => {
    const csvContent = "Nome do Produto,Preco de Venda,Custo de Producao\nPimenta Biquinho Defumada,25.00,10.00\nGeleia de Pimenta c/ Abacaxi,28.00,11.50\nMolho Habanero Extra Forte,32.00,13.00\nConserva Tradicional da Madrinha,22.00,9.00\nKit 3 Molhos Especiais,75.00,32.00";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_produtos_madrinha.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95">
        
        {/* Header */}
        <div className="p-5 pb-3 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/90 rounded-t-3xl sm:rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Central de Ajuda</h2>
              <p className="text-xs text-neutral-400">Guia prático do Madrinha PDV</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 -mr-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-5 py-2.5 bg-neutral-950/50 border-b border-neutral-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTopic('all')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${activeTopic === 'all' ? 'bg-orange-600 text-white shadow-sm' : 'bg-neutral-800/80 text-neutral-400 hover:text-white'}`}
          >
            Tudo
          </button>
          <button
            onClick={() => setActiveTopic('events')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${activeTopic === 'events' ? 'bg-orange-600 text-white shadow-sm' : 'bg-neutral-800/80 text-neutral-400 hover:text-white'}`}
          >
            📅 Feiras
          </button>
          <button
            onClick={() => setActiveTopic('products')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${activeTopic === 'products' ? 'bg-orange-600 text-white shadow-sm' : 'bg-neutral-800/80 text-neutral-400 hover:text-white'}`}
          >
            📦 Produtos & CSV
          </button>
          <button
            onClick={() => setActiveTopic('pos')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${activeTopic === 'pos' ? 'bg-orange-600 text-white shadow-sm' : 'bg-neutral-800/80 text-neutral-400 hover:text-white'}`}
          >
            🛒 Vendas / PDV
          </button>
          <button
            onClick={() => setActiveTopic('finance')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${activeTopic === 'finance' ? 'bg-orange-600 text-white shadow-sm' : 'bg-neutral-800/80 text-neutral-400 hover:text-white'}`}
          >
            💰 Fechamento
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] text-sm">
          
          {/* TOPIC 1: EVENTOS / FEIRAS */}
          {(activeTopic === 'all' || activeTopic === 'events') && (
            <div className="bg-neutral-950/60 border border-neutral-800/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2.5 text-orange-400 font-bold text-sm">
                <Calendar className="w-4 h-4" />
                <h3>1. Como Cadastrar e Gerenciar Feiras</h3>
              </div>
              
              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Criar nova feira:</strong> Na tela inicial, toque no botão laranja <strong className="text-white">"+"</strong>, informe o nome do evento, local e data.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Acessar o PDV da feira:</strong> Toque no card da feira em andamento para abrir as opções de vendas e controle.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Excluir uma feira:</strong> Toque no ícone da lixeira <Trash2 className="w-3.5 h-3.5 inline text-red-400" /> e digite a senha <code className="bg-neutral-800 text-orange-300 px-1.5 py-0.5 rounded font-mono text-[11px]">deletoupqkiss</code> para confirmar.</span>
                </li>
              </ul>
            </div>
          )}

          {/* TOPIC 2: PRODUTOS E CSV */}
          {(activeTopic === 'all' || activeTopic === 'products') && (
            <div className="bg-neutral-950/60 border border-neutral-800/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2.5 text-orange-400 font-bold text-sm">
                <Package className="w-4 h-4" />
                <h3>2. Cadastro e Upload de Produtos (CSV)</h3>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Você pode cadastrar os produtos um a um ou importar uma planilha inteira de uma só vez:
              </p>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-2 text-xs text-neutral-300">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Formato esperado da Planilha CSV:
                </p>
                <p className="text-neutral-400">
                  O arquivo deve ter 3 colunas: <strong className="text-neutral-200">Nome</strong>, <strong className="text-neutral-200">Preço de Venda</strong> e <strong className="text-neutral-200">Custo</strong> (separados por vírgula ou ponto e vírgula).
                </p>
                <div className="bg-neutral-950 p-2.5 rounded-lg font-mono text-[11px] text-orange-200 border border-neutral-800 space-y-1">
                  <p className="text-neutral-500 font-sans text-[10px]">Exemplo de linhas no arquivo:</p>
                  <p>Pimenta Biquinho Defumada, 25.00, 10.00</p>
                  <p>Geleia de Pimenta c/ Abacaxi, 28.00, 11.50</p>
                  <p>Molho Habanero Extra Forte, 32.00, 13.00</p>
                </div>

                <button
                  type="button"
                  onClick={downloadCsvExample}
                  className="w-full mt-2 py-2.5 px-3 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Modelo de Planilha CSV (.csv)</span>
                </button>
              </div>

              <ul className="space-y-1.5 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span>Para importar, acesse a aba <strong>Produtos</strong> e clique em <strong>"Importar CSV"</strong>.</span>
                </li>
              </ul>
            </div>
          )}

          {/* TOPIC 3: VENDAS / PDV */}
          {(activeTopic === 'all' || activeTopic === 'pos') && (
            <div className="bg-neutral-950/60 border border-neutral-800/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2.5 text-orange-400 font-bold text-sm">
                <ShoppingBag className="w-4 h-4" />
                <h3>3. Como Usar o PDV Rápido na Feira</h3>
              </div>

              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Adicionar ao carrinho:</strong> Toque no card de qualquer produto para adicionar unidades.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Formas de pagamento:</strong> Selecione Pix, Cartão de Débito, Cartão de Crédito ou Dinheiro.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Calculadora de troco:</strong> Ao escolher Dinheiro, informe o valor pago pelo cliente para ver o troco exato na hora.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Desconto:</strong> Você pode aplicar descontos rápidos em reais antes de fechar a venda.</span>
                </li>
              </ul>
            </div>
          )}

          {/* TOPIC 4: FECHAMENTO, DESPESAS E RELATÓRIO */}
          {(activeTopic === 'all' || activeTopic === 'finance') && (
            <div className="bg-neutral-950/60 border border-neutral-800/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2.5 text-orange-400 font-bold text-sm">
                <Receipt className="w-4 h-4" />
                <h3>4. Despesas, Doações e Relatório Final</h3>
              </div>

              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Despesas do dia:</strong> Na tela de detalhes da feira, registre gastos com combustível, gelo, taxa de banca, etc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Doações e cortesias:</strong> Registre produtos doados ou dados como cortesia para acompanhar o impacto real no custo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Fechar a feira:</strong> Clique em "Fechar Feira", dê sua nota (estrelas) e registre se vale a pena voltar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Exportar Resumo:</strong> Use o botão de download/compartilhar para gerar o relatório consolidado com lucro líquido e margem.</span>
                </li>
              </ul>
            </div>
          )}

          {/* TOPIC 5: INSTALAÇÃO E LOGO */}
          {(activeTopic === 'all' || activeTopic === 'install') && (
            <div className="bg-neutral-950/60 border border-neutral-800/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2.5 text-orange-400 font-bold text-sm">
                <Smartphone className="w-4 h-4" />
                <h3>5. Instalação no Celular & Troca de Logo</h3>
              </div>

              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Trocar a Logo:</strong> Toque sobre a imagem da logo no topo da tela inicial ou na feira para escolher qualquer imagem da sua galeria.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Instalar no iPhone (iOS):</strong> No Safari, toque no ícone de Compartilhar e escolha <strong className="text-white">"Adicionar à Tela de Início"</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Instalar no Android:</strong> No Chrome, toque nos 3 pontinhos do menu e escolha <strong className="text-white">"Instalar aplicativo"</strong>.</span>
                </li>
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900 rounded-b-3xl sm:rounded-b-2xl flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-98 cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
