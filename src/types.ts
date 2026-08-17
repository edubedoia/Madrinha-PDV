export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash';

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
}

export interface Sale {
  id: string;
  eventId: string;
  productId: string;
  quantity: number;
  total: number;
  paymentMethod: PaymentMethod;
  timestamp: number;
}

export interface Expense {
  id: string;
  eventId: string;
  category: 'taxa' | 'transporte' | 'alimentacao' | 'embalagem' | 'outros';
  description: string;
  amount: number;
}

export interface Donation {
  id: string;
  eventId: string;
  productId: string;
  quantity: number;
  reason: string;
}

export interface Event {
  id: string;
  name: string;
  location: string;
  date: string;
  hoursWorked: number;
  status: 'active' | 'closed';
  rating?: 1 | 2 | 3 | 4 | 5;
  wouldReturn?: boolean;
}

export interface EventSummary {
  revenue: number;
  productCosts: number;
  expenses: number;
  netProfit: number;
  roi: number;
  profitPerHour: number;
  totalItemsSold: number;
}
