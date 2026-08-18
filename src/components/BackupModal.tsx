import React, { useState, useRef } from 'react';
import { useAppStore } from '../store';
import { 
  Database, 
  Download, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileJson, 
  Package, 
  Calendar, 
  ShoppingBag,
  RefreshCw,
  Info
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BackupModal({ isOpen, onClose }: BackupModalProps) {
  const { 
    products, 
    events, 
    sales, 
    expenses, 
    donations, 
    customLogo, 
    restoreBackup 
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
      
      const backupPayload = {
        app: "Madrinha PDV",
        version: 1,
        exportedAt: now.toISOString(),
        products,
        events,
        sales,
        expenses,
        donations,
        customLogo
      };

      const jsonStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `backup_madrinha_pdv_${dateStr}_${timeStr}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMsg(`Backup gerado com sucesso! (${products.length} produtos, ${events.length} feiras)`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Erro ao exportar backup:', err);
      setErrorMsg('Falha ao gerar arquivo de backup.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Arquivo JSON inválido.');
        }

        setPreviewData(parsed);
      } catch (err: any) {
        console.error('Erro ao ler JSON:', err);
        setErrorMsg('Arquivo JSON inválido ou corrompido.');
        setSelectedFile(null);
        setPreviewData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!previewData) return;

    try {
      const result = restoreBackup(previewData, restoreMode);
      setSuccessMsg(
        `Restauração concluída! ${result.productsCount} produtos e ${result.eventsCount} feiras carregados.`
      );
      setPreviewData(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Erro ao restaurar:', err);
      setErrorMsg(err.message || 'Erro ao restaurar os dados.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95">
        
        {/* Header */}
        <div className="p-5 pb-3 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/90 rounded-t-3xl sm:rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Backup & Restauração</h2>
              <p className="text-xs text-neutral-400">Proteja e transfira todos os dados do PDV</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 -mr-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(90vh-130px)] text-sm">
          
          {/* Notification Banners */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-950/70 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: EXPORTAR BACKUP */}
          <div className="bg-neutral-950/60 border border-neutral-800/90 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                <Download className="w-4 h-4" />
                <h3>1. Exportar Dados Atuais (Download JSON)</h3>
              </div>
              <span className="text-[11px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-mono">
                100% Offline
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Gera um arquivo seguro com todos os seus produtos cadastrados, feiras, histórico de vendas, despesas e configurações.
            </p>

            {/* Current Stats Pill */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="bg-neutral-900 border border-neutral-800/80 rounded-xl p-2.5 text-center">
                <span className="text-base font-bold text-white block">{products.length}</span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Produtos</span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800/80 rounded-xl p-2.5 text-center">
                <span className="text-base font-bold text-white block">{events.length}</span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Feiras</span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800/80 rounded-xl p-2.5 text-center">
                <span className="text-base font-bold text-white block">{sales.length}</span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Vendas</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-950/40 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo de Backup (.json)</span>
            </button>
          </div>

          {/* SECTION 2: RESTAURAR BACKUP */}
          <div className="bg-neutral-950/60 border border-neutral-800/90 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
              <Upload className="w-4 h-4" />
              <h3>2. Restaurar / Importar Backup</h3>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Envie um arquivo <code className="bg-neutral-800 text-orange-300 px-1 py-0.5 rounded font-mono text-[11px]">.json</code> gerado anteriormente para recuperar todas as suas informações em qualquer celular ou navegador.
            </p>

            <input
              type="file"
              accept=".json,application/json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-4 bg-neutral-900 hover:bg-neutral-850 border border-dashed border-neutral-700 hover:border-orange-500/60 rounded-xl text-xs font-medium text-neutral-300 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileJson className="w-6 h-6 text-orange-400" />
                <span>Toque aqui para selecionar o arquivo <strong>.json</strong></span>
              </button>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileJson className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-white truncate">{selectedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewData(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-xs text-neutral-400 hover:text-red-400 px-2 py-1"
                  >
                    Trocar
                  </button>
                </div>

                {previewData && (
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 text-xs space-y-2">
                    <p className="text-neutral-400 font-semibold text-[11px] uppercase tracking-wider">Conteúdo identificado:</p>
                    <div className="grid grid-cols-2 gap-1.5 text-neutral-300 text-[11px]">
                      <span>📦 {previewData.products?.length || 0} Produtos</span>
                      <span>📅 {previewData.events?.length || 0} Feiras</span>
                      <span>🛒 {previewData.sales?.length || 0} Vendas</span>
                      <span>💰 {previewData.expenses?.length || 0} Despesas</span>
                    </div>
                  </div>
                )}

                {/* Restore Options */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-semibold text-neutral-300 block">Modo de Restauração:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRestoreMode('replace')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${restoreMode === 'replace' ? 'bg-orange-600/20 border-orange-500 text-white font-bold' : 'bg-neutral-950 border-neutral-800 text-neutral-400'}`}
                    >
                      <span className="block font-bold">Substituir Tudo</span>
                      <span className="text-[10px] text-neutral-400 font-normal">Substitui o banco de dados atual</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRestoreMode('merge')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${restoreMode === 'merge' ? 'bg-orange-600/20 border-orange-500 text-white font-bold' : 'bg-neutral-950 border-neutral-800 text-neutral-400'}`}
                    >
                      <span className="block font-bold">Mesclar Dados</span>
                      <span className="text-[10px] text-neutral-400 font-normal">Adiciona sem apagar o que já tem</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmRestore}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Restaurar Agora</span>
                </button>
              </div>
            )}
          </div>

          {/* INFO CARD */}
          <div className="bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-3 text-xs text-neutral-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Dica de Segurança:</strong> Salve o arquivo de backup no seu Google Drive, WhatsApp ou envie por e-mail para ter sempre uma cópia segura dos seus dados de feiras e vendas.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900 rounded-b-3xl sm:rounded-b-2xl flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-xl text-xs transition-all active:scale-98 cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
