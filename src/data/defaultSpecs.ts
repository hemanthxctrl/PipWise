import { InstrumentSpec } from '../types/instrument';

/**
 * Universal default specifications for all 14 instruments.
 * Forex: Standard 100k base units, 0.0001 pip (0.01 for JPY).
 * Gold (XAUUSD): 100 troy oz per lot, USD price movement.
 * Silver (XAGUSD): 5,000 troy oz per lot.
 * Crude Oil (USOIL): 1,000 barrels per lot.
 * Indices (NAS100, JP225): Point-based contract specifications.
 * Crypto (BTCUSD, ETHUSD): 1 coin per 1.0 standard lot.
 * All contract sizes and increments remain user-editable in settings.
 */
export const DEFAULT_INSTRUMENT_SPECS: Record<string, InstrumentSpec> = {
  // CRYPTOCURRENCIES
  BTCUSD: {
    symbol: 'BTCUSD',
    name: 'Bitcoin / US Dollar',
    category: 'CRYPTO',
    quoteCurrency: 'USD',
    lossCurrency: 'USD',
    contractSize: 1, // 1 BTC per 1.0 lot
    priceDecimals: 2,
    pipSize: 1.0,
    tickSize: 0.1,
    tickValue: 0.1,
    orderUnitName: 'Lots',
    minQuantity: 0.01,
    maxQuantity: 50.0,
    quantityStep: 0.01,
    supportedStopUnits: ['price_diff', 'pips'],
    defaultStopUnit: 'price_diff'
  },
  ETHUSD: {
    symbol: 'ETHUSD',
    name: 'Ethereum / US Dollar',
    category: 'CRYPTO',
    quoteCurrency: 'USD',
    lossCurrency: 'USD',
    contractSize: 1,
    priceDecimals: 2,
    pipSize: 1.0,
    tickSize: 0.05,
    tickValue: 0.05,
    orderUnitName: 'Lots',
    minQuantity: 0.05,
    maxQuantity: 100.0,
    quantityStep: 0.01,
    supportedStopUnits: ['price_diff', 'pips'],
    defaultStopUnit: 'price_diff'
  },

  // INDICES
  NAS100: {
    symbol: 'NAS100',
    name: 'Nasdaq 100 CFD',
    category: 'INDICES',
    quoteCurrency: 'USD',
    lossCurrency: 'USD',
    contractSize: 1, // 1 index point = $1.00 USD per contract/lot
    priceDecimals: 2,
    pipSize: 1.0,
    tickSize: 0.25,
    tickValue: 0.25,
    orderUnitName: 'Contracts',
    minQuantity: 0.1,
    maxQuantity: 500.0,
    quantityStep: 0.1,
    supportedStopUnits: ['price_diff', 'points'],
    defaultStopUnit: 'points'
  },
  JP225: {
    symbol: 'JP225',
    name: 'Japan 225 CFD',
    category: 'INDICES',
    quoteCurrency: 'JPY',
    lossCurrency: 'JPY',
    contractSize: 100, // 100 JPY per 1 index point per lot
    priceDecimals: 1,
    pipSize: 1.0,
    tickSize: 5.0,
    tickValue: 500,
    orderUnitName: 'Contracts',
    minQuantity: 0.1,
    maxQuantity: 500.0,
    quantityStep: 0.1,
    supportedStopUnits: ['price_diff', 'points'],
    defaultStopUnit: 'points'
  },

  // COMMODITIES
  XAUUSD: {
    symbol: 'XAUUSD',
    name: 'Gold / US Dollar',
    category: 'COMMODITIES',
    quoteCurrency: 'USD',
    lossCurrency: 'USD',
    contractSize: 100, // 100 troy ounces per standard lot
    priceDecimals: 2,
    pipSize: 0.10,
    tickSize: 0.01,
    tickValue: 1.00, // $0.01 tick * 100 oz = $1.00 tick value
    orderUnitName: 'Lots',
    minQuantity: 0.01,
    maxQuantity: 100.0,
    quantityStep: 0.01,
    supportedStopUnits: ['price_diff', 'pips'],
    defaultStopUnit: 'price_diff'
  },
  XAGUSD: {
    symbol: 'XAGUSD',
    name: 'Silver / US Dollar',
    category: 'COMMODITIES',
    quoteCurrency: 'USD',
    lossCurrency: 'USD',
    contractSize: 5000, // 5,000 troy ounces per standard lot
    priceDecimals: 3,
    pipSize: 0.01,
    tickSize: 0.001,
    tickValue: 5.00, // $0.001 * 5,000 oz = $5.00 tick value
    orderUnitName: 'Lots',
    minQuantity: 0.01,
    maxQuantity: 50.0,
    quantityStep: 0.01,
    supportedStopUnits: ['price_diff', 'pips'],
    defaultStopUnit: 'price_diff'
  },
  USOIL: {
    symbol: 'USOIL',
    name: 'US Crude Oil (WTI)',
    category: 'COMMODITIES',
    quoteCurrency: 'USD',
    lossCurrency: 'USD',
    contractSize: 1000, // 1,000 barrels per standard lot
    priceDecimals: 2,
    pipSize: 0.01,
    tickSize: 0.01,
    tickValue: 10.00, // $0.01 * 1,000 bbl = $10.00 tick value
    orderUnitName: 'Lots',
    minQuantity: 0.01,
    maxQuantity: 100.0,
    quantityStep: 0.01,
    supportedStopUnits: ['price_diff', 'pips'],
    defaultStopUnit: 'price_diff'
  },

  // FOREX (100,000 standard lot size)
  EURUSD: {
    symbol: 'EURUSD',
    name: 'Euro / US Dollar',
    category: 'FOREX',
    quoteCurrency: 'USD',
    lossCurrency: 'USD',
    contractSize: 100000,
    priceDecimals: 5,
    pipSize: 0.0001,
    tickSize: 0.00001,
    tickValue: 1.00, // $10 per pip ($1 per pipette)
    orderUnitName: 'Lots',
    minQuantity: 0.01,
    maxQuantity: 100.0,
    quantityStep: 0.01,
    supportedStopUnits: ['price_diff', 'pips'],
    defaultStopUnit: 'pips'
  },
  GBPUSD: {
    symbol: 'GBPUSD',
    name: 'British Pound / US Dollar',
    category: 'FOREX',
    quoteCurrency: 'USD',
    lossCurrency: 'USD',
    contractSize: 100000,
    priceDecimals: 5,
    pipSize: 0.0001,
    tickSize: 0.00001,
    tickValue: 1.00,
    orderUnitName: 'Lots',
    minQuantity: 0.01,
    maxQuantity: 100.0,
    quantityStep: 0.01,
    supportedStopUnits: ['price_diff', 'pips'],
    defaultStopUnit: 'pips'
  },
  AUDUSD: {
    symbol: 'AUDUSD',
    name: 'Australian Dollar / US Dollar',
    category: 'FOREX',
    quoteCurrency: 'USD',
    lossCurrency: 'USD',
    contractSize: 100000,
    priceDecimals: 5,
    pipSize: 0.0001,
    tickSize: 0.00001,
    tickValue: 1.00,
    orderUnitName: 'Lots',
    minQuantity: 0.01,
    maxQuantity: 100.0,
    quantityStep: 0.01,
    supportedStopUnits: ['price_diff', 'pips'],
    defaultStopUnit: 'pips'
  },
  NZDUSD: {
    symbol: 'NZDUSD',
    name: 'New Zealand Dollar / US Dollar',
    category: 'FOREX',
    quoteCurrency: 'USD',
    lossCurrency: 'USD',
    contractSize: 100000,
    priceDecimals: 5,
    pipSize: 0.0001,
    tickSize: 0.00001,
    tickValue: 1.00,
    orderUnitName: 'Lots',
    minQuantity: 0.01,
    maxQuantity: 100.0,
    quantityStep: 0.01,
    supportedStopUnits: ['price_diff', 'pips'],
    defaultStopUnit: 'pips'
  },
  USDJPY: {
    symbol: 'USDJPY',
    name: 'US Dollar / Japanese Yen',
    category: 'FOREX',
    quoteCurrency: 'JPY',
    lossCurrency: 'JPY',
    contractSize: 100000,
    priceDecimals: 3,
    pipSize: 0.01,
    tickSize: 0.001,
    tickValue: 100, // 100 JPY per pipette on 100k
    orderUnitName: 'Lots',
    minQuantity: 0.01,
    maxQuantity: 100.0,
    quantityStep: 0.01,
    supportedStopUnits: ['price_diff', 'pips'],
    defaultStopUnit: 'pips'
  },
  USDCHF: {
    symbol: 'USDCHF',
    name: 'US Dollar / Swiss Franc',
    category: 'FOREX',
    quoteCurrency: 'CHF',
    lossCurrency: 'CHF',
    contractSize: 100000,
    priceDecimals: 5,
    pipSize: 0.0001,
    tickSize: 0.00001,
    tickValue: 1.00, // 10 CHF per pip
    orderUnitName: 'Lots',
    minQuantity: 0.01,
    maxQuantity: 100.0,
    quantityStep: 0.01,
    supportedStopUnits: ['price_diff', 'pips'],
    defaultStopUnit: 'pips'
  },
  USDCAD: {
    symbol: 'USDCAD',
    name: 'US Dollar / Canadian Dollar',
    category: 'FOREX',
    quoteCurrency: 'CAD',
    lossCurrency: 'CAD',
    contractSize: 100000,
    priceDecimals: 5,
    pipSize: 0.0001,
    tickSize: 0.00001,
    tickValue: 1.00, // 10 CAD per pip
    orderUnitName: 'Lots',
    minQuantity: 0.01,
    maxQuantity: 100.0,
    quantityStep: 0.01,
    supportedStopUnits: ['price_diff', 'pips'],
    defaultStopUnit: 'pips'
  }
};
