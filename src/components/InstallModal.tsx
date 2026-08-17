import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, Smartphone, X, CheckCircle2, ExternalLink } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already in standalone / installed mode
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsStandalone(true);
        setIsOpen(false);
      }
      setDeferredPrompt(null);
    } else {
      setIsOpen(true);
    }
  };

  // If already installed and running standalone, don't show prompt button
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Floating or header button to trigger install */}
      <div className="mb-4 bg-gradient-to-r from-orange-950/80 to-neutral-900 border border-orange-500/30 p-3.5 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-orange-500/40 p-1 flex items-center justify-center flex-shrink-0 shadow-inner">
            <img 
              src="/madrinha_logo.png" 
              alt="Madrinha App" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Instalar Madrinha PDV</h4>
            <p className="text-xs text-neutral-400">Acesse direto da tela inicial, offline</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleInstallClick}
          className="bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Instalar</span>
        </button>
      </div>

      {/* Instructions Modal (especially for iOS or manual install) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-white">Como Instalar o App</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-4 text-sm text-neutral-300">
                <p className="text-xs text-neutral-400">
                  No iPhone ou iPad, siga os 2 passos abaixo no navegador <strong className="text-white">Safari</strong>:
                </p>
                
                <div className="flex items-start gap-3 bg-neutral-800/80 p-3 rounded-xl border border-neutral-700/60">
                  <div className="bg-neutral-700 p-2 rounded-lg text-orange-400 mt-0.5">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">1. Toque em Compartilhar</p>
                    <p className="text-xs text-neutral-400">Na barra inferior do Safari (ícone de quadrado com seta para cima).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-neutral-800/80 p-3 rounded-xl border border-neutral-700/60">
                  <div className="bg-neutral-700 p-2 rounded-lg text-orange-400 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">2. Adicionar à Tela de Início</p>
                    <p className="text-xs text-neutral-400">Role para baixo na lista de opções e selecione "Adicionar à Tela de Início".</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-orange-400 pt-1">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Pronto! O ícone da Madrinha aparecerá na tela do seu celular.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-neutral-300">
                <p className="text-xs text-neutral-400">
                  Para instalar no Android / Chrome ou computador:
                </p>

                <div className="space-y-2.5 bg-neutral-800/80 p-3.5 rounded-xl border border-neutral-700/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-600/30 text-orange-400 font-bold flex items-center justify-center text-[10px]">1</span>
                    <span>Abra o link compartilhado no <strong>Google Chrome</strong>.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-600/30 text-orange-400 font-bold flex items-center justify-center text-[10px]">2</span>
                    <span>Toque nos <strong>3 pontinhos</strong> (menu do navegador no canto superior direito).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-600/30 text-orange-400 font-bold flex items-center justify-center text-[10px]">3</span>
                    <span>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-400">
                  Certifique-se de acessar pela URL oficial compartilhada (fora do modo de pré-visualização).
                </p>
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-5 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2.5 rounded-xl text-xs transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
