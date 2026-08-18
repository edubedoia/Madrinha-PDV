import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Product, Event, Sale, Expense, Donation } from './types';
import { fixMojibake } from './lib/utils';

interface AppState {
  products: Product[];
  events: Event[];
  sales: Sale[];
  expenses: Expense[];
  donations: Donation[];
  customLogo: string | null;
  
  // Actions
  setCustomLogo: (logo: string | null) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addEvent: (event: Omit<Event, 'id' | 'status'>) => string;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  closeEvent: (id: string, rating: Event['rating'], wouldReturn: boolean) => void;
  
  addSale: (sale: Omit<Sale, 'id' | 'timestamp'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addDonation: (donation: Omit<Donation, 'id'>) => void;
  
  deleteSale: (id: string) => void;
  deleteExpense: (id: string) => void;
  deleteDonation: (id: string) => void;
  sanitizeAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      products: [],
      events: [],
      sales: [],
      expenses: [],
      donations: [],
      customLogo: null,
      
      setCustomLogo: (logo) => set({ customLogo: logo }),
      
      addProduct: (product) => set((state) => ({
        products: [...state.products, { 
          ...product, 
          name: fixMojibake(product.name),
          id: uuidv4() 
        }]
      })),
      
      updateProduct: (id, productUpdate) => set((state) => ({
        products: state.products.map(p => p.id === id ? { 
          ...p, 
          ...productUpdate,
          name: productUpdate.name ? fixMojibake(productUpdate.name) : p.name
        } : p)
      })),
      
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
      
      addEvent: (event) => {
        const id = uuidv4();
        set((state) => ({
          events: [...state.events, { 
            ...event, 
            name: fixMojibake(event.name),
            location: fixMojibake(event.location),
            id, 
            status: 'active' 
          }]
        }));
        return id;
      },
      
      updateEvent: (id, eventUpdate) => set((state) => ({
        events: state.events.map(e => e.id === id ? { 
          ...e, 
          ...eventUpdate,
          name: eventUpdate.name ? fixMojibake(eventUpdate.name) : e.name,
          location: eventUpdate.location ? fixMojibake(eventUpdate.location) : e.location
        } : e)
      })),
      
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(e => e.id !== id),
        sales: state.sales.filter(s => s.eventId !== id),
        expenses: state.expenses.filter(exp => exp.eventId !== id),
        donations: state.donations.filter(d => d.eventId !== id)
      })),
      
      closeEvent: (id, rating, wouldReturn) => set((state) => ({
        events: state.events.map(e => e.id === id ? { ...e, status: 'closed', rating, wouldReturn } : e)
      })),
      
      addSale: (sale) => set((state) => ({
        sales: [...state.sales, { ...sale, id: uuidv4(), timestamp: Date.now() }]
      })),
      
      addExpense: (expense) => set((state) => ({
        expenses: [...state.expenses, { 
          ...expense, 
          description: fixMojibake(expense.description),
          id: uuidv4() 
        }]
      })),
      
      addDonation: (donation) => set((state) => ({
        donations: [...state.donations, { 
          ...donation, 
          reason: fixMojibake(donation.reason),
          id: uuidv4() 
        }]
      })),
      
      deleteSale: (id) => set((state) => ({
        sales: state.sales.filter(s => s.id !== id)
      })),
      
      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),
      
      deleteDonation: (id) => set((state) => ({
        donations: state.donations.filter(d => d.id !== id)
      })),

      sanitizeAllData: () => set((state) => ({
        products: state.products.map(p => ({ ...p, name: fixMojibake(p.name) })),
        events: state.events.map(e => ({
          ...e,
          name: fixMojibake(e.name),
          location: fixMojibake(e.location)
        })),
        expenses: state.expenses.map(exp => ({ ...exp, description: fixMojibake(exp.description) })),
        donations: state.donations.map(d => ({ ...d, reason: fixMojibake(d.reason) }))
      }))
    }),
    {
      name: 'madrinha-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.sanitizeAllData();
        }
      }
    }
  )
);
