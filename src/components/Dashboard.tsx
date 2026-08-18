import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, MapPin, Clock, ArrowRight, X, Trash2, HelpCircle, Database } from 'lucide-react';
import InstallModal from './InstallModal';
import DeleteEventModal from './DeleteEventModal';
import HelpModal from './HelpModal';
import BackupModal from './BackupModal';
import { Event } from '../types';

export default function Dashboard() {
  const { events, addEvent } = useAppStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    hoursWorked: '6'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventId = addEvent({
      name: formData.name,
      location: formData.location,
      date: formData.date,
      hoursWorked: parseFloat(formData.hoursWorked)
    });
    setIsModalOpen(false);
    navigate(`/event/${eventId}`);
  };

  const activeEvents = events.filter(e => e.status === 'active');
  const pastEvents = events.filter(e => e.status === 'closed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6 pt-2">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
            <img 
              src="/madrinha_logo.png" 
              alt="Madrinha Cozinha Artesanal" 
              className="w-full h-full object-contain filter drop-shadow"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">Diário de Feiras</h1>
            <p className="text-neutral-400 text-xs">Madrinha Cozinha Artesanal</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            type="button"
            onClick={() => setIsBackupOpen(true)}
            className="p-3 rounded-full bg-neutral-800 text-orange-400 border border-neutral-700 hover:bg-neutral-700 active:scale-95 transition-all shadow-md flex items-center justify-center cursor-pointer"
            title="Backup & Restauração de Dados"
          >
            <Database className="w-5 h-5" />
          </button>
          <button 
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="p-3 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 active:scale-95 transition-all shadow-md flex items-center justify-center cursor-pointer"
            title="Como usar o aplicativo (Ajuda)"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 text-white p-3 rounded-full shadow-lg hover:bg-orange-500 active:scale-95 transition-all cursor-pointer"
            title="Cadastrar Nova Feira"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <InstallModal />

      {activeEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">Feiras em Andamento</h2>
          <div className="space-y-3">
            {activeEvents.map(event => (
              <div key={event.id} className="relative group">
                <Link to={`/event/${event.id}`} className="block">
                  <div className="bg-orange-600 text-white p-5 pr-14 rounded-2xl shadow-lg flex justify-between items-center active:scale-[0.98] transition-transform border border-orange-500/40">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{event.name}</h3>
                      <div className="flex items-center text-orange-100 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.location}
                      </div>
                    </div>
                    <div className="bg-black/20 p-2.5 rounded-full backdrop-blur-sm mr-1">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  title="Excluir Feira"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEventToDelete(event);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/30 hover:bg-black/60 text-orange-200 hover:text-red-300 transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Histórico de Feiras</h2>
        {pastEvents.length === 0 ? (
          <div className="text-center py-12 bg-neutral-900 rounded-2xl border border-neutral-800">
            <p className="text-neutral-500">Nenhuma feira finalizada ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastEvents.map(event => (
              <div key={event.id} className="relative group">
                <Link to={`/event/${event.id}`} className="block">
                  <div className="bg-neutral-900 p-4 pr-24 rounded-2xl border border-neutral-800 flex justify-between items-center hover:border-neutral-700 active:bg-neutral-850 transition-colors">
                    <div>
                      <h3 className="font-semibold text-white">{event.name}</h3>
                      <p className="text-xs text-neutral-400 mt-1 capitalize">
                        {format(new Date(event.date + 'T12:00:00'), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex items-center text-orange-400 font-medium text-sm">
                      Ver <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  title="Excluir Feira"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEventToDelete(event);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-neutral-800/80 hover:bg-red-950 text-neutral-400 hover:text-red-400 border border-neutral-700/50 hover:border-red-900/60 transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteEventModal
        event={eventToDelete}
        isOpen={Boolean(eventToDelete)}
        onClose={() => setEventToDelete(null)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />

      {/* Modal Nova Feira */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-3xl sm:rounded-2xl p-6 pb-8 sm:pb-6 animate-in slide-in-from-bottom-4 sm:zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Iniciar Nova Feira</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 -mr-2 text-neutral-400 hover:bg-neutral-800 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Nome do Evento</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:bg-neutral-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl px-4 py-3"
                  placeholder="Ex: Feira de Domingo na Praça"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Local / Endereço</label>
                <input 
                  required
                  type="text" 
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:bg-neutral-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl px-4 py-3"
                  placeholder="Ex: Praça da Liberdade"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Data</label>
                  <input 
                    required
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 text-white focus:bg-neutral-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Horas de Trabalho</label>
                  <input 
                    required
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.hoursWorked}
                    onChange={e => setFormData({ ...formData, hoursWorked: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:bg-neutral-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-600 text-white font-semibold py-4 rounded-xl mt-6 hover:bg-orange-500 active:scale-[0.98] transition-transform shadow-lg shadow-orange-950/40"
              >
                Criar Evento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
