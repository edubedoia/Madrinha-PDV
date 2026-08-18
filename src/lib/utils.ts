import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fixMojibake(str: string): string {
  if (!str || typeof str !== 'string') return str;

  let result = str;

  // Fix common double-encoded UTF-8 sequences (Portuguese / Latin)
  const map: Record<string, string> = {
    'Ã§': 'ç', 'Ã‡': 'Ç',
    'Ã¡': 'á', 'Ã ': 'à', 'Ã¢': 'â', 'Ã£': 'ã',
    'Ã': 'Á', 'Ã€': 'À', 'Ã‚': 'Â', 'Ãƒ': 'Ã',
    'Ã©': 'é', 'Ãª': 'ê', 'Ã¨': 'è',
    'Ã‰': 'É', 'ÃŠ': 'Ê', 'Ãˆ': 'È',
    'Ã­': 'í', 'Ã¬': 'ì', 'Ã®': 'î',
    'Ã': 'Í', 'ÃŒ': 'Ì', 'ÃŽ': 'Î',
    'Ã³': 'ó', 'Ã´': 'ô', 'Ãµ': 'õ', 'Ã²': 'ò',
    'Ã“': 'Ó', 'Ã”': 'Ô', 'Ã•': 'Õ', 'Ã’': 'Ò',
    'Ãº': 'ú', 'Ã¼': 'ü', 'Ã¹': 'ù',
    'Ãš': 'Ú', 'Ãœ': 'Ü', 'Ã™': 'Ù',
    'Âº': 'º', 'Âª': 'ª', 'Â°': '°', 'Â': '',
    'â€“': '–', 'â€”': '—',
    'â€œ': '"', 'â€': '"', 'â€™': "'", 'â€˜': "'"
  };

  for (const [bad, good] of Object.entries(map)) {
    result = result.split(bad).join(good);
  }

  // Handle replacement characters (\uFFFD or ï¿½) from Windows-1252 / ISO-8859-1 mismatches
  result = result
    .replace(/ï¿½/g, '\uFFFD')
    .replace(/Furdun\uFFFDo/gi, 'Furdunço')
    .replace(/Del\uFFFDcia/gi, 'Delícia')
    .replace(/Edi\uFFFD\uFFFDo/gi, 'Edição')
    .replace(/Promo\uFFFD\uFFFDo/gi, 'Promoção')
    .replace(/A\uFFFDo/gi, 'Ação')
    .replace(/cora\uFFFDo/gi, 'coração')
    .replace(/tradici\uFFFDo/gi, 'tradição')
    .replace(/artes\uFFFD/gi, 'artesã')
    .replace(/produ\uFFFDo/gi, 'produção')
    .replace(/pre\uFFFDo/gi, 'preço')
    .replace(/\uFFFD/g, '');

  return result;
}

export async function readTextFileAutoEncoding(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // 1. Check for BOM (Byte Order Mark)
  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    const text = new TextDecoder('utf-8').decode(bytes.subarray(3));
    return fixMojibake(text);
  }
  if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
    const text = new TextDecoder('utf-16le').decode(bytes.subarray(2));
    return fixMojibake(text);
  }
  if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
    const text = new TextDecoder('utf-16be').decode(bytes.subarray(2));
    return fixMojibake(text);
  }

  // 2. Try strictly fatal UTF-8
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
    const text = utf8Decoder.decode(bytes);
    return fixMojibake(text);
  } catch (e) {
    // 3. Fallback to Windows-1252 / ISO-8859-1 (standard Brazilian Excel CSV export encoding)
    try {
      const win1252Decoder = new TextDecoder('windows-1252');
      const text = win1252Decoder.decode(bytes);
      return fixMojibake(text);
    } catch (e2) {
      const latin1Decoder = new TextDecoder('iso-8859-1');
      const text = latin1Decoder.decode(bytes);
      return fixMojibake(text);
    }
  }
}

export function slugifyFilename(text: string): string {
  if (!text) return 'feira';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-zA-Z0-9_-]/g, '_') // replace non-alphanumeric with underscore
    .replace(/_+/g, '_') // remove duplicate underscores
    .replace(/^_+|_+$/g, ''); // trim underscores
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
