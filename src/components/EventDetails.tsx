import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { calculateEventSummary, formatCurrency, slugifyFilename } from '../lib/utils';
import { ArrowLeft, ShoppingBag, Receipt, Gift, Download, AlertCircle, Trash2, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DeleteEventModal from './DeleteEventModal';
import HelpModal from './HelpModal';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, sales, expenses, donations, products, addExpense, addDonation, closeEvent } = useAppStore();
  
  const event = events.find(e => e.id === id);
  const [activeTab, setActiveTab] = useState<'resumo' | 'despesas' | 'doacoes'>('resumo');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [rating, setRating] = useState<number>(5);
  
  if (!event) return <div className="p-4 text-center">Evento não encontrado</div>;

  const summary = calculateEventSummary(event.id, sales, expenses, donations, products, event.hoursWorked);
  const eventSales = sales.filter(s => s.eventId === event.id);
  const eventExpenses = expenses.filter(s => s.eventId === event.id);
  const eventDonations = donations.filter(d => d.eventId === event.id);

  const handleExportCSV = () => {
    // Escape cell values for CSV
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes(';') || str.includes('\n') || str.includes('"')
        ? `"${str}"`
        : str;
    };

    // Format date for display in report
    let formattedDate = event.date;
    try {
      if (event.date.includes('-')) {
        const [year, month, day] = event.date.split('-');
        formattedDate = `${day}/${month}/${year}`;
      }
    } catch {
      formattedDate = event.date;
    }

    // Build CSV with UTF-8 BOM so Excel opens it with perfect accents
    let csv = `\uFEFF`;
    csv += `RELATORIO DE RESULTADOS - MADRINHA COZINHA ARTESANAL\n`;
    csv += `Nome da Feira,${escapeCsv(event.name)}\n`;
    csv += `Data de Realizacao,${escapeCsv(formattedDate)} (${escapeCsv(event.date)})\n`;
    csv += `Local de Realizacao,${escapeCsv(event.location)}\n`;
    csv += `Horas Trabalhadas,${escapeCsv(event.hoursWorked)}h\n`;
    csv += `Status do Evento,${escapeCsv(event.status === 'closed' ? 'Fechada / Encerrada' : 'Em Andamento')}\n`;
    if (event.rating) {
      csv += `Avaliacao da Feira,${escapeCsv(event.rating)} Estrelas\n`;
    }
    csv += `Data de Exportacao,${escapeCsv(new Date().toLocaleString('pt-BR'))}\n\n`;
    
    csv += `--- RESUMO FINANCEIRO CONSOLIDADO ---\n`;
    csv += `Indicador,Valor\n`;
    csv += `Faturamento Bruto,${escapeCsv(summary.revenue.toFixed(2))}\n`;
    csv += `Custo das Mercadorias Vendidas (CMV),${escapeCsv(summary.productCosts.toFixed(2))}\n`;
    csv += `Despesas Operacionais Extras,${escapeCsv(summary.expenses.toFixed(2))}\n`;
    csv += `Custo com Doacoes e Cortesias,${escapeCsv(summary.donationCosts.toFixed(2))}\n`;
    csv += `Custo Total Consolidado,${escapeCsv(summary.totalCosts.toFixed(2))}\n`;
    csv += `LUCRO LIQUIDO REAL,${escapeCsv(summary.netProfit.toFixed(2))}\n`;
    csv += `Margem de Lucro Real,${escapeCsv(summary.margin.toFixed(2))}%\n`;
    csv += `Retorno sobre Investimento (ROI),${escapeCsv(summary.roi.toFixed(2))}%\n`;
    csv += `Lucro Medio por Hora,${escapeCsv(summary.profitPerHour.toFixed(2))}\n`;
    csv += `Total de Itens Vendidos,${escapeCsv(summary.totalItemsSold)}\n`;
    csv += `Total de Pedidos/Vendas,${escapeCsv(eventSales.length)}\n\n`;

    // Payment methods summary
    const payMap: Record<string, number> = {};
    eventSales.forEach(s => {
      const method = s.paymentMethod || 'Outro';
      payMap[method] = (payMap[method] || 0) + s.total;
    });
    csv += `--- FATURAMENTO POR FORMA DE PAGAMENTO ---\n`;
    csv += `Forma de Pagamento,Total Faturado\n`;
    Object.entries(payMap).forEach(([method, total]) => {
      csv += `${escapeCsv(method)},${escapeCsv(total.toFixed(2))}\n`;
    });
    csv += `\n`;

    csv += `--- DETALHAMENTO DE VENDAS REGISTRADAS ---\n`;
    csv += `Horario,Produto,Quantidade,Preco Unitario,Total da Venda,Forma de Pagamento\n`;
    if (eventSales.length === 0) {
      csv += `Nenhuma venda registrada nesta feira.\n`;
    } else {
      eventSales.forEach(sale => {
        const product = products.find(p => p.id === sale.productId);
        const time = new Date(sale.timestamp).toLocaleTimeString('pt-BR');
        const unitPrice = sale.quantity > 0 ? (sale.total / sale.quantity).toFixed(2) : '0.00';
        csv += `${escapeCsv(time)},${escapeCsv(product?.name || 'Item Excluido')},${escapeCsv(sale.quantity)},${escapeCsv(unitPrice)},${escapeCsv(sale.total.toFixed(2))},${escapeCsv(sale.paymentMethod)}\n`;
      });
    }
    csv += `\n`;

    csv += `--- DETALHAMENTO DE DESPESAS EXTRAS ---\n`;
    csv += `Descricao,Categoria,Valor\n`;
    if (eventExpenses.length === 0) {
      csv += `Nenhuma despesa extra registrada.\n`;
    } else {
      eventExpenses.forEach(exp => {
        csv += `${escapeCsv(exp.description)},${escapeCsv(exp.category)},${escapeCsv(exp.amount.toFixed(2))}\n`;
      });
    }
    csv += `\n`;

    csv += `--- DETALHAMENTO DE DOACOES E CORTESIAS ---\n`;
    csv += `Produto,Quantidade,Custo Unitario,Custo Total,Motivo / Destinatario\n`;
    if (eventDonations.length === 0) {
      csv += `Nenhuma doacao registrada.\n`;
    } else {
      eventDonations.forEach(don => {
        const product = products.find(p => p.id === don.productId);
        const unitCost = product?.cost || 0;
        const totalCost = unitCost * don.quantity;
        csv += `${escapeCsv(product?.name || 'Item Removido')},${escapeCsv(don.quantity)},${escapeCsv(unitCost.toFixed(2))},${escapeCsv(totalCost.toFixed(2))},${escapeCsv(don.reason || '')}\n`;
      });
    }

    const cleanFairName = slugifyFilename(event.name);
    const fileName = `relatorio_${cleanFairName}_${event.date}.csv`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
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
            
            <div className="w-18 h-18 sm:w-22 sm:h-22 flex-shrink-0 flex items-center justify-center p-0">
              <img 
                src="/madrinha_logo.png" 
                alt="Madrinha Cozinha Artesanal" 
                className="w-full h-full object-contain filter drop-shadow-md" 
                referrerPolicy="no-referrer"
              />
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
