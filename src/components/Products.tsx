import React, { useState, useRef } from 'react';
import { useAppStore } from '../store';
import { formatCurrency, readTextFileAutoEncoding, fixMojibake } from '../lib/utils';
import { Plus, Edit2, Trash2, X, Package, Upload, HelpCircle } from 'lucide-react';
import HelpModal from './HelpModal';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    cost: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: fixMojibake(formData.name.trim()),
      price: parseFloat(formData.price.replace(',', '.')),
      cost: parseFloat(formData.cost.replace(',', '.'))
    };

    if (editingId) {
      updateProduct(editingId, productData);
    } else {
      addProduct(productData);
    }
    
    closeModal();
  };

  const openEdit = (product: any) => {
    setFormData({
      name: product.name,
      price: product.price.toString().replace('.', ','),
      cost: product.cost.toString().replace('.', ',')
    });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setFormData({ name: '', price: '', cost: '' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const csv = await readTextFileAutoEncoding(file);
      if (!csv) return;

      const lines = csv.split(/\r?\n/);
      if (lines.length === 0) return;

      let importedCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Detect separator: comma or semicolon or tab
        const delimiter = line.includes(';') ? ';' : (line.includes('\t') ? '\t' : ',');
        const parts = line.split(delimiter).map(p => fixMojibake(p.trim().replace(/^["']|["']$/g, '')));

        if (parts.length >= 2) {
          const name = parts[0];
          // Clean price and cost string (remove currency prefix like R$, replace comma with period)
          const cleanNumber = (val: string) => {
            if (!val) return NaN;
            return parseFloat(val.replace(/[^0-9,-.]/g, '').replace(',', '.'));
          };

          const price = cleanNumber(parts[1]);
          const cost = parts.length >= 3 ? cleanNumber(parts[2]) : 0;

          // Check if this row is a header (e.g. "Nome", "Preço", "Custo")
          if (isNaN(price)) {
            continue;
          }

          if (name && !isNaN(price)) {
            addProduct({
              name,
              price,
              cost: isNaN(cost) ? 0 : cost
            });
            importedCount++;
          }
        }
      }
      
      alert(`${importedCount} produto(s) importado(s) com sucesso em UTF-8!`);
    } catch (err) {
      console.error('Erro ao ler CSV:', err);
      alert('Erro ao processar o arquivo CSV. Verifique a codificação do arquivo.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex justify-between items-center mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Seus Produtos</h1>
          <p className="text-neutral-400 text-sm">{products.length} {products.length === 1 ? 'item cadastrado' : 'itens cadastrados'}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="p-2.5 rounded-full bg-neutral-800 text-orange-400 border border-neutral-700 hover:bg-neutral-700 active:scale-95 transition-all shadow-sm flex items-center justify-center"
            title="Ajuda & Como Importar CSV"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            accept=".csv,text/csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={triggerFileInput}
            className="bg-neutral-800 text-neutral-300 p-2.5 rounded-full border border-neutral-700 hover:bg-neutral-700 hover:text-white active:scale-95 transition-all"
            title="Importar Planilha CSV (Nome, Preço, Custo)"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 text-white p-2.5 rounded-full shadow-lg hover:bg-orange-500 active:scale-95 transition-all"
            title="Adicionar Produto"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 bg-neutral-900 rounded-2xl border border-neutral-800">
          <Package className="w-12 h-12 mx-auto text-neutral-600 mb-3" />
          <p className="text-neutral-300 font-medium">Nenhum produto cadastrado.</p>
          <p className="text-sm text-neutral-500 mt-1">Adicione produtos ou importe uma planilha CSV.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex justify-between items-center hover:border-neutral-700 transition-colors">
              <div>
                <h3 className="font-semibold text-white text-base">{product.name}</h3>
                <div className="flex space-x-4 mt-1 text-sm">
                  <span className="text-emerald-400 font-medium">Venda: {formatCurrency(product.price)}</span>
                  <span className="text-neutral-400">Custo: {formatCurrency(product.cost)}</span>
                </div>
              </div>
              <div className="flex space-x-1">
                <button onClick={() => openEdit(product)} className="p-2 text-neutral-400 hover:text-orange-400 rounded-lg hover:bg-neutral-800 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => {
                  if (confirm('Tem certeza que deseja excluir?')) deleteProduct(product.id);
                }} className="p-2 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-3xl sm:rounded-2xl p-6 pb-8 sm:pb-6 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={closeModal} className="p-2 -mr-2 text-neutral-400 hover:bg-neutral-800 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Nome do Produto</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:bg-neutral-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl px-4 py-3"
                  placeholder="Ex: Betchup"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Preço de Venda (R$)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:bg-neutral-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl px-4 py-3"
                    placeholder="26,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Custo (R$)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:bg-neutral-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl px-4 py-3"
                    placeholder="8,50"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-600 text-white font-semibold py-4 rounded-xl mt-6 hover:bg-orange-500 active:scale-[0.98] transition-transform shadow-lg shadow-orange-950/40"
              >
                Salvar Produto
              </button>
            </form>
          </div>
        </div>
      )}

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />
    </div>
  );
}
