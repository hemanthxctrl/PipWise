import { InstrumentDefinition } from '../types/instrument';

export const ALL_INSTRUMENTS: InstrumentDefinition[] = [
  // CRYPTOCURRENCIES
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', category: 'CRYPTO', defaultQuoteCurrency: 'USD' },
  { symbol: 'ETHUSD', name: 'Ethereum / US Dollar', category: 'CRYPTO', defaultQuoteCurrency: 'USD' },

  // INDICES
  { symbol: 'NAS100', name: 'Nasdaq 100 CFD', category: 'INDICES', defaultQuoteCurrency: 'USD' },
  { symbol: 'JP225', name: 'Japan 225 CFD', category: 'INDICES', defaultQuoteCurrency: 'JPY' },

  // COMMODITIES
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', category: 'COMMODITIES', defaultQuoteCurrency: 'USD' },
  { symbol: 'XAGUSD', name: 'Silver / US Dollar', category: 'COMMODITIES', defaultQuoteCurrency: 'USD' },
  { symbol: 'USOIL', name: 'US Crude Oil (WTI)', category: 'COMMODITIES', defaultQuoteCurrency: 'USD' },

  // FOREX
  { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'FOREX', defaultQuoteCurrency: 'USD' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', category: 'FOREX', defaultQuoteCurrency: 'USD' },
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', category: 'FOREX', defaultQuoteCurrency: 'USD' },
  { symbol: 'NZDUSD', name: 'New Zealand Dollar / US Dollar', category: 'FOREX', defaultQuoteCurrency: 'USD' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'FOREX', defaultQuoteCurrency: 'JPY' },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', category: 'FOREX', defaultQuoteCurrency: 'CHF' },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', category: 'FOREX', defaultQuoteCurrency: 'CAD' }
];

export const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'All Instruments',
  CRYPTO: 'Crypto',
  INDICES: 'Indices',
  COMMODITIES: 'Commodities',
  FOREX: 'Forex'
};
