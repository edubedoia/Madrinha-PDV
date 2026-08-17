import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { calculateEventSummary, formatCurrency } from '../lib/utils';
import { ArrowLeft, ShoppingBag, Receipt, Gift, Download, AlertCircle, Camera, Trash2, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DeleteEventModal from './DeleteEventModal';
import HelpModal from './HelpModal';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, sales, expenses, donations, products, customLogo, setCustomLogo, addExpense, addDonation, closeEvent } = useAppStore();
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const event = events.find(e => e.id === id);
  const [activeTab, setActiveTab] = useState<'resumo' | 'despesas' | 'doacoes'>('resumo');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [rating, setRating] = useState<number>(5);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomLogo(base64);
      };
      reader.readAsDataURL(file);
    }
  };
  
  if (!event) return <div className="p-4 text-center">Evento não encontrado</div>;

  const summary = calculateEventSummary(event.id, sales, expenses, donations, products, event.hoursWorked);
  const eventSales = sales.filter(s => s.eventId === event.id);
  const eventExpenses = expenses.filter(s => s.eventId === event.id);

  const handleExportCSV = () => {
    // Generate CSV for Sales
    let csv = `RELATORIO DA FEIRA: ${event.name.toUpperCase()}\n`;
    csv += `Data: ${event.date} | Local: ${event.location}\n\n`;
    
    csv += `RESUMO FINANCEIRO\n`;
    csv += `Faturamento Bruto,${summary.revenue}\n`;
    csv += `Custos dos Produtos (CMV),${summary.productCosts}\n`;
    csv += `Despesas Extras,${summary.expenses}\n`;
    csv += `Custos com Doacoes,${summary.donationCosts}\n`;
    csv += `LUCRO LIQUIDO,${summary.netProfit}\n`;
    csv += `Margem de Lucro,${summary.margin.toFixed(2)}%\n`;
    csv += `Retorno (ROI),${summary.roi.toFixed(2)}%\n`;
    csv += `Lucro por Hora,${summary.profitPerHour}\n\n`;

    csv += `VENDAS REGISTRADAS\n`;
    csv += `Data/Hora,Produto,Quantidade,Total,Forma de Pagamento\n`;
    eventSales.forEach(sale => {
      const product = products.find(p => p.id === sale.productId);
      const time = new Date(sale.timestamp).toLocaleTimeString('pt-BR');
      csv += `${time},${product?.name || 'Item Excluido'},${sale.quantity},${sale.total},${sale.paymentMethod}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_feira_${event.date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pb-20 max-w-md mx-auto">
      <div className="bg-orange-600 text-white p-4 pb-6 shadow-xl rounded-b-3xl border-b border-orange-500/30">
        <div className="flex items-center mb-6">
          <Link to="/" className="p-2 -ml-2 text-orange-100 hover:text-white rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="ml-2 flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight truncate">{event.name}</h1>
            <p className="text-sm text-orange-100">
              {format(new Date(event.date + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })} • {event.location}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              title="Ajuda do sistema"
              className="p-1.5 rounded-full bg-black/25 hover:bg-black/50 border border-white/20 text-orange-200 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            {event.status === 'active' ? (
              <button 
                onClick={() => setShowCloseModal(true)}
                className="text-xs bg-neutral-950/40 hover:bg-neutral-950/60 border border-white/20 text-white font-bold px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                Fechar Feira
              </button>
            ) : (
              <span className="text-[11px] bg-black/30 border border-white/15 text-orange-200 font-semibold px-2.5 py-1 rounded-full">
                Finalizada
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              title="Excluir esta feira"
              className="p-1.5 rounded-full bg-black/25 hover:bg-red-950/80 border border-white/20 hover:border-red-500/50 text-white hover:text-red-300 transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/15">
          <div className="flex justify-between items-center gap-3">
            <div>
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider mb-1">Lucro Líquido</p>
              <p className="text-4xl font-extrabold tracking-tight text-white">{formatCurrency(summary.netProfit)}</p>
            </div>
            
            <div className="relative group">
              <input 
                type="file" 
                ref={logoInputRef} 
                onChange={handleLogoUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                title="Clique para trocar ou carregar sua logo oficial"
                className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center p-0 bg-transparent rounded-xl transition-all relative overflow-hidden group active:scale-95 cursor-pointer"
              >
                <img 
                  src={customLogo || "/madrinha_logo.png"} 
                  alt="Madrinha Cozinha Artesanal" 
                  className="w-full h-full object-contain filter drop-shadow-md hover:brightness-105 transition-all" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-[10px] font-semibold">
                  <Camera className="w-4 h-4 mb-0.5 text-orange-300" />
                  <span>Trocar</span>
                </div>
              </button>
            </div>
          </div>
          
          <div className="flex justify-between mt-4 text-sm pt-4 border-t border-white/15">
            <div>
              <p className="text-orange-200 text-xs">Faturamento</p>
              <p className="font-bold text-white mt-0.5">{formatCurrency(summary.revenue)}</p>
            </div>
            <div className="text-right">
              <p className="text-orange-200 text-xs">Despesas & Custos</p>
              <p className="font-bold text-white mt-0.5">{formatCurrency(summary.totalCosts)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        {event.status === 'active' && (
          <Link to={`/event/${event.id}/pos`} className="block w-full">
            <div className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl p-4 flex items-center justify-between mb-6 shadow-md hover:border-orange-500/50 active:scale-[0.98] transition-all">
              <div className="flex items-center">
                <div className="bg-orange-600/20 text-orange-400 p-3 rounded-full mr-4 border border-orange-500/30">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">Modo Venda (PDV)</h2>
                  <p className="text-neutral-400 text-sm">Registro rápido de vendas no balcão</p>
                </div>
              </div>
              <div className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold px-2.5 py-1 rounded-md">ABERTO</div>
            </div>
          </Link>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-xl mb-6">
          <button 
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-sm ${activeTab === 'resumo' ? 'bg-orange-600 text-white shadow-orange-950/40' : 'text-neutral-400 hover:text-neutral-200'}`}
            onClick={() => setActiveTab('resumo')}
          >
            Métricas
          </button>
          <button 
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-sm ${activeTab === 'despesas' ? 'bg-orange-600 text-white shadow-orange-950/40' : 'text-neutral-400 hover:text-neutral-200'}`}
            onClick={() => setActiveTab('despesas')}
          >
            Despesas
          </button>
          <button 
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-sm ${activeTab === 'doacoes' ? 'bg-orange-600 text-white shadow-orange-950/40' : 'text-neutral-400 hover:text-neutral-200'}`}
            onClick={() => setActiveTab('doacoes')}
          >
            Doações
          </button>
        </div>

        {activeTab === 'resumo' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard title="Margem de Lucro" value={`${summary.margin.toFixed(1)}%`} />
              <MetricCard title="Retorno (ROI)" value={`${summary.roi.toFixed(1)}%`} />
              <MetricCard title="Lucro por Hora" value={formatCurrency(summary.profitPerHour)} subtitle={`${event.hoursWorked} horas trabalhadas`} />
              <MetricCard title="Produtos Vendidos" value={summary.totalItemsSold.toString()} subtitle={`${eventSales.length} pedidos`} />
            </div>

            <button 
              onClick={handleExportCSV}
              className="w-full mt-4 flex items-center justify-center p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 font-medium hover:bg-neutral-850 hover:border-neutral-700 active:bg-neutral-800 transition-colors shadow-sm"
            >
              <Download className="w-5 h-5 mr-2 text-orange-400" /> Exportar Planilha de Resultados
            </button>
          </div>
        )}

        {activeTab === 'despesas' && (
          <ExpenseManager eventId={event.id} expenses={eventExpenses} addExpense={addExpense} />
        )}

        {activeTab === 'doacoes' && (
          <div className="space-y-3">
            <div className="bg-purple-950/30 border border-purple-800/40 p-4 rounded-xl mb-4">
              <p className="text-purple-300 text-sm">
                <strong>Custo total de doações:</strong> O valor de produção dos itens doados ({formatCurrency(summary.donationCosts)}) já foi descontado do seu lucro líquido final.
              </p>
            </div>
            {donations.filter(d => d.eventId === event.id).length === 0 ? (
              <div className="text-center py-6 text-neutral-500 text-sm">
                Nenhuma doação registrada nesta feira.
              </div>
            ) : (
              donations.filter(d => d.eventId === event.id).map((don: any) => {
                const product = products.find(p => p.id === don.productId);
                const cost = (product?.cost || 0) * don.quantity;
                return (
                  <div key={don.id} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white">{don.quantity}x {product?.name || 'Item Removido'}</span>
                      <p className="text-xs text-neutral-400 mt-1">{don.reason}</p>
                    </div>
                    <span className="text-red-400 font-medium text-sm text-right">
                      -{formatCurrency(cost)}<br/>
                      <span className="text-[10px] text-neutral-500 uppercase">custo produção</span>
                    </span>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Delete Event Button */}
        <div className="mt-8 pt-6 border-t border-neutral-800/80">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-3.5 px-4 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-800/60 text-red-400 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Excluir Feira</span>
          </button>
        </div>
      </div>

      <DeleteEventModal 
        event={event} 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onSuccess={() => navigate('/')} 
      />

      <HelpModal 
        isOpen={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />

      {showCloseModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-3xl sm:rounded-2xl p-6 pb-8 animate-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-white mb-2">Finalizar Feira</h2>
            <p className="text-neutral-400 mb-6 text-sm">Que nota você dá para este evento?</p>
            
            <div className="flex justify-between mb-8">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => setRating(num)}
                  className={`w-12 h-12 rounded-full text-lg font-bold flex items-center justify-center transition-all ${
                    rating >= num ? 'bg-orange-500 text-white shadow-md' : 'bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setShowCloseModal(false)}
                className="flex-1 py-4 font-semibold text-neutral-300 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  closeEvent(event.id, rating as any, true);
                  setShowCloseModal(false);
                }}
                className="flex-1 py-4 font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-lg transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, subtitle }: { title: string, value: string, subtitle?: string }) {
  return (
    <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-sm">
      <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1">{title}</p>
      <p className="text-xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function ExpenseManager({ eventId, expenses, addExpense }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    
    addExpense({
      eventId,
      description: desc,
      amount: parseFloat(amount.replace(',', '.')),
      category: 'outros'
    });
    setDesc('');
    setAmount('');
    setIsOpen(false);
  };

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 bg-orange-950/30 text-orange-400 font-semibold rounded-xl border border-orange-800/40 hover:bg-orange-900/40 transition-colors mb-4"
      >
        + Registrar Despesa (Taxa, Transporte...)
      </button>

      {isOpen && (
        <form onSubmit={handleAdd} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 mb-6 space-y-3">
          <input 
            type="text" 
            placeholder="Ex: Uber ida e volta" 
            className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 p-3 rounded-lg focus:outline-none focus:border-orange-500"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
          <input 
            type="number" 
            step="0.01"
            placeholder="Valor R$" 
            className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 p-3 rounded-lg focus:outline-none focus:border-orange-500"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <div className="flex space-x-2 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-2 text-neutral-400 hover:text-neutral-200 font-medium">Cancelar</button>
            <button type="submit" className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors">Salvar</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-6 text-neutral-500 text-sm">
            Nenhuma despesa extra registrada.
          </div>
        ) : (
          expenses.map((exp: any) => (
            <div key={exp.id} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex justify-between">
              <span className="font-medium text-white">{exp.description}</span>
              <span className="text-red-400 font-medium">-{formatCurrency(exp.amount)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
