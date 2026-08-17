import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { useParams, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { ArrowLeft, Minus, Plus, CreditCard, Banknote, Smartphone, CheckCircle2, Gift } from 'lucide-react';
import { PaymentMethod } from '../types';

export default function POS() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, products, addSale, addDonation } = useAppStore();
  
  const event = events.find(e => e.id === id);
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  
  // Feedback state for when a sale is completed
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('Venda Registrada!');

  if (!event) return <div>Evento não encontrado</div>;

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const updateQuantity = (product: any, delta: number) => {
    setCart(current => {
      const existing = current.find(item => item.product.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + delta;
        if (newQuantity <= 0) {
          return current.filter(item => item.product.id !== product.id);
        }
        return current.map(item => item.product.id === product.id ? { ...item, quantity: newQuantity } : item);
      }
      if (delta > 0) {
        return [...current, { product, quantity: 1 }];
      }
      return current;
    });
  };

  const getQuantity = (productId: string) => {
    return cart.find(item => item.product.id === productId)?.quantity || 0;
  };

  const completeAction = (message: string) => {
    setFeedbackMessage(message);
    setSaleCompleted(true);
    setTimeout(() => {
      setCart([]);
      setShowPayment(false);
      setSaleCompleted(false);
    }, 1200);
  };

  const handlePayment = (method: PaymentMethod) => {
    cart.forEach(item => {
      addSale({
        eventId: event.id,
        productId: item.product.id,
        quantity: item.quantity,
        total: item.product.price * item.quantity,
        paymentMethod: method
      });
    });
    completeAction('Venda Registrada!');
  };

  const handleDonation = () => {
    cart.forEach(item => {
      addDonation({
        eventId: event.id,
        productId: item.product.id,
        quantity: item.quantity,
        reason: 'Doação via PDV'
      });
    });
    completeAction('Doação Registrada!');
  };

  if (saleCompleted) {
    return (
      <div className="h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <CheckCircle2 className="w-24 h-24 text-emerald-400 mb-4 animate-in zoom-in" />
        <h2 className="text-3xl font-bold text-white">{feedbackMessage}</h2>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="flex flex-col h-screen bg-neutral-950 pb-safe">
        <div className="bg-neutral-900 border-b border-neutral-800 p-4 flex items-center shadow-md">
          <button onClick={() => setShowPayment(false)} className="p-2 -ml-2 text-neutral-400 hover:text-white rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold ml-2 text-white">Forma de Pagamento</h1>
        </div>
        
        <div className="flex-1 p-6 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <p className="text-neutral-400 text-sm uppercase tracking-wider font-semibold mb-2">Total a cobrar</p>
            <p className="text-5xl font-extrabold text-white tracking-tight">{formatCurrency(total)}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3.5">
            <PaymentButton 
              icon={<Smartphone className="w-8 h-8 mb-2 text-emerald-400" />} 
              label="PIX" 
              onClick={() => handlePayment('pix')} 
              className="bg-emerald-950/40 border-emerald-700/60 hover:bg-emerald-900/50 text-emerald-300"
            />
            <PaymentButton 
              icon={<CreditCard className="w-8 h-8 mb-2 text-blue-400" />} 
              label="Crédito" 
              onClick={() => handlePayment('credit')} 
              className="bg-blue-950/40 border-blue-700/60 hover:bg-blue-900/50 text-blue-300"
            />
            <PaymentButton 
              icon={<CreditCard className="w-8 h-8 mb-2 text-indigo-400" />} 
              label="Débito" 
              onClick={() => handlePayment('debit')} 
              className="bg-indigo-950/40 border-indigo-700/60 hover:bg-indigo-900/50 text-indigo-300"
            />
            <PaymentButton 
              icon={<Banknote className="w-8 h-8 mb-2 text-amber-400" />} 
              label="Dinheiro" 
              onClick={() => handlePayment('cash')} 
              className="bg-amber-950/40 border-amber-700/60 hover:bg-amber-900/50 text-amber-300"
            />
            <PaymentButton 
              icon={<Gift className="w-8 h-8 mb-2 text-purple-400" />} 
              label="Doação (Custo CMV)" 
              onClick={handleDonation} 
              className="bg-purple-950/40 border-purple-700/60 hover:bg-purple-900/50 text-purple-300 col-span-2"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-950 pb-safe">
      <div className="bg-neutral-900 border-b border-neutral-800 p-4 flex items-center shadow-md sticky top-0 z-10">
        <button onClick={() => navigate(`/event/${event.id}`)} className="p-2 -ml-2 text-neutral-400 hover:text-white rounded-lg">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="ml-2">
          <h1 className="text-lg font-bold leading-tight text-white">Novo Pedido</h1>
          <p className="text-xs text-neutral-400 line-clamp-1">{event.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full">
        {products.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            <p>Nenhum produto cadastrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 pb-24">
            {products.map(product => {
              const qty = getQuantity(product.id);
              return (
                <div 
                  key={product.id} 
                  className={`bg-neutral-900 rounded-2xl p-4 flex justify-between items-center transition-all border ${
                    qty > 0 ? 'border-orange-500 bg-orange-950/20 ring-1 ring-orange-500' : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex-1 pr-2" onClick={() => qty === 0 && updateQuantity(product, 1)}>
                    <h3 className="font-bold text-lg text-white">{product.name}</h3>
                    <p className="text-orange-400 font-semibold">{formatCurrency(product.price)}</p>
                  </div>
                  
                  {qty > 0 ? (
                    <div className="flex items-center space-x-3 bg-neutral-800 border border-neutral-700 rounded-full p-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateQuantity(product, -1); }}
                        className="w-10 h-10 bg-neutral-700 hover:bg-neutral-600 rounded-full flex items-center justify-center text-white active:scale-95 transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-6 text-center font-bold text-lg text-white">{qty}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateQuantity(product, 1); }}
                        className="w-10 h-10 bg-neutral-700 hover:bg-neutral-600 rounded-full flex items-center justify-center text-white active:scale-95 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateQuantity(product, 1); }}
                      className="w-12 h-12 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-300 hover:bg-neutral-700 active:bg-neutral-600 transition-colors"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 p-4 pb-safe shadow-2xl">
          <div className="max-w-md mx-auto">
            <button 
              onClick={() => setShowPayment(true)}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg py-4 px-6 rounded-2xl flex justify-between items-center active:scale-[0.98] transition-all shadow-lg shadow-orange-950/50"
            >
              <span>Cobrar</span>
              <span>{formatCurrency(total)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentButton({ icon, label, onClick, className }: { icon: React.ReactNode, label: string, onClick: () => void, className: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-5 rounded-2xl border active:scale-95 transition-all font-semibold ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
