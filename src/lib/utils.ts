import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function calculateEventSummary(
  eventId: string, 
  sales: any[], 
  expenses: any[], 
  donations: any[], 
  products: any[],
  hoursWorked: number
) {
  const eventSales = sales.filter(s => s.eventId === eventId);
  const eventExpenses = expenses.filter(e => e.eventId === eventId);
  const eventDonations = donations.filter(d => d.eventId === eventId);
  
  const revenue = eventSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItemsSold = eventSales.reduce((sum, sale) => sum + sale.quantity, 0);
  
  // Calculate cost of goods sold (COGS)
  const productCosts = eventSales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.productId);
    return sum + ((product?.cost || 0) * sale.quantity);
  }, 0);
  
  // Calculate cost of donations
  const donationCosts = eventDonations.reduce((sum, donation) => {
    const product = products.find(p => p.id === donation.productId);
    return sum + ((product?.cost || 0) * donation.quantity);
  }, 0);
  
  const totalExpenses = eventExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const totalCosts = productCosts + donationCosts + totalExpenses;
  const netProfit = revenue - totalCosts;
  
  const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
  const profitPerHour = hoursWorked > 0 ? netProfit / hoursWorked : 0;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return {
    revenue,
    productCosts,
    donationCosts,
    expenses: totalExpenses,
    totalCosts,
    netProfit,
    roi,
    margin,
    profitPerHour,
    totalItemsSold
  };
}
