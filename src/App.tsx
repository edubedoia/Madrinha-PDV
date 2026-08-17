import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Package, Calendar, HelpCircle } from 'lucide-react';
import { cn } from './lib/utils';

import Dashboard from './components/Dashboard';
import Products from './components/Products';
import EventDetails from './components/EventDetails';
import POS from './components/POS';
import HelpModal from './components/HelpModal';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isPos = location.pathname.includes('/pos');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  return (
    <div className={cn("min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between", isPos ? "pb-12" : "pb-24")}>
      <div className="flex-1 w-full">
        {children}
      </div>

      {/* Floating transparent footer badge/button on all screens */}
      <div className={cn(
        "w-full flex justify-center items-center py-2 px-4 z-30 pointer-events-none",
        isPos ? "pb-3" : "mb-16"
      )}>
        <button 
          type="button"
          onClick={() => setIsHelpOpen(true)}
          title="Abrir Central de Ajuda"
          className="pointer-events-auto bg-orange-600/50 hover:bg-orange-600/80 active:bg-orange-600 backdrop-blur-sm border border-orange-400/40 text-white text-[11px] font-semibold tracking-wide px-4 py-1.5 rounded-full shadow-md transition-all select-none cursor-pointer flex items-center gap-1.5"
        >
          <span>® 2026 - Madrinha Cozinha Artesanal</span>
          <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px] font-bold">?</span>
        </button>
      </div>

      {!isPos && (
        <nav className="fixed bottom-0 w-full bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 pb-safe z-40">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto">
            <NavItem to="/" icon={<Calendar className="w-6 h-6" />} label="Feiras" active={location.pathname === '/' || location.pathname.includes('/event/')} />
            <NavItem to="/products" icon={<Package className="w-6 h-6" />} label="Produtos" active={location.pathname === '/products'} />
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium text-neutral-400 hover:text-orange-400 active:scale-95 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-6 h-6" />
              <span>Ajuda</span>
            </button>
          </div>
        </nav>
      )}

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

function NavItem({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-colors",
        active ? "text-orange-500" : "text-neutral-400 hover:text-neutral-200"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/event/:id/pos" element={<POS />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
