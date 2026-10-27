export type AssetCategory = 'CRYPTO' | 'INDICES' | 'COMMODITIES' | 'FOREX';

export type StopLossUnit = 'pips' | 'price_diff' | 'ticks' | 'points' | 'percent';

export interface InstrumentDefinition {
  symbol: string;
  name: string;
  category: AssetCategory;
  defaultQuoteCurrency: string;
}

export interface InstrumentSpec {
  symbol: string;
  name: string;
  category: AssetCategory;
  quoteCurrency: string;             // Currency that the instrument is quoted in (e.g. USD, JPY, EUR)
  lossCurrency: string;              // Currency that loss is natively generated in (e.g. USD, JPY)

  // Contract & Pricing Mechanics
  contractSize: number;              // Standard contract units per 1.0 standard lot
  priceDecimals: number;             // Formatting decimals for market prices
  pipSize: number;                   // Size of 1 pip/point (e.g. 0.0001 for EURUSD, 0.01 for USDJPY, 0.1 for XAUUSD)
  tickSize: number;                  // Minimum price movement tick
  tickValue: number;                 // Value in lossCurrency of 1 tick per 1.0 standard lot

  // Order Units & Sizing
  orderUnitName: string;             // e.g. "Lots", "Contracts"
  minQuantity: number;               // Minimum order quantity (e.g. 0.01 lot)
  maxQuantity: number;               // Maximum order quantity (e.g. 100.0 lots)
  quantityStep: number;              // Increment step (e.g. 0.01)

  // Supported Stop Loss Units
  supportedStopUnits: StopLossUnit[];
  defaultStopUnit: StopLossUnit;
}
