import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Event } from '../types';
import { Trash2, X, Lock, AlertTriangle } from 'lucide-react';

interface DeleteEventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const REQUIRED_PASSWORD = 'deletoupqkiss';

export default function DeleteEventModal({ event, isOpen, onClose, onSuccess }: DeleteEventModalProps) {
  const { deleteEvent } = useAppStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen || !event) return null;

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === REQUIRED_PASSWORD) {
      deleteEvent(event.id);
      setPassword('');
      setError(false);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setError(true);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="bg-neutral-900 border border-red-500/30 w-full max-w-md rounded-3xl sm:rounded-2xl p-6 pb-8 sm:pb-6 animate-in slide-in-from-bottom-4 sm:zoom-in-95 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2.5 text-red-400">
            <div className="p-2 rounded-xl bg-red-950/60 border border-red-800/50">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Excluir Feira</h2>
          </div>
          <button 
            type="button" 
            onClick={handleClose} 
            className="p-2 -mr-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-red-950/30 border border-red-900/40 p-3.5 rounded-xl mb-4 text-xs text-red-200 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-100 mb-0.5">Atenção: Ação irreversível!</p>
            <p className="text-red-300/90 leading-relaxed">
              Você está excluindo a feira <strong className="text-white">"{event.name}"</strong>. Todas as vendas, despesas e dados registrados nela serão permanentemente apagados.
            </p>
          </div>
        </div>

        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-orange-400" />
              Digite a senha de confirmação:
            </label>
            <input 
              required
              type="password"
              autoFocus
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Digite a senha..."
              className="w-full bg-neutral-800 border border-neutral-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-white placeholder-neutral-500 rounded-xl px-4 py-3 text-sm transition-all"
            />
            {error && (
              <p className="text-red-400 text-xs font-medium mt-1.5">
                ❌ Senha incorreta! A feira não foi excluída.
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-2">
            <button 
              type="button" 
              onClick={handleClose} 
              className="flex-1 py-3.5 font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors text-sm"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3.5 font-bold text-white bg-red-600 hover:bg-red-500 active:scale-[0.98] rounded-xl shadow-lg shadow-red-950/50 transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
