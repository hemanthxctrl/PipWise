import { StopLossUnit } from './instrument';

export interface CalculationInput {
  accountBalance: number;            // Default: 5000 USD
  riskPercent: number;               // Presets: 0.25%, 0.5%, 0.75%, 1%, 1.5%, 2% or custom
  stopLossDistance: number;          // Numeric value in current stopLossUnit
  stopLossUnit: StopLossUnit;        // Current unit
  entryPrice?: number;               // Optional explicit entry level
  stopPrice?: number;                // Optional explicit stop loss level
  conversionRate: number;            // Quote/Loss currency to USD rate (1.0 if loss is in USD)
  isCustomRate: boolean;             // True if user adjusted the rate manually
  spreadPips?: number;               // Optional spread in pips/ticks
  commissionPerLot?: number;         // Optional round-turn commission in USD per lot/unit
}

export interface CalculationResult {
  isValid: boolean;
  statusMessage?: string;
  isBelowMinimum: boolean;
  isAboveMaximum: boolean;

  // Position Output
  recommendedQuantity: number;       // In instrument orderUnitName (rounded down safely)
  orderUnitName: string;             // e.g. "Lots", "Contracts"

  // Financial Overview
  riskBudgetUSD: number;             // Targeted risk budget = Balance * risk% / 100
  estimatedLossUSD: number;          // Exact loss at stop for the recommended quantity
  effectiveRiskPercent: number;      // Actual risk % resulting from rounded quantity
  rawLossPerUnitUSD: number;         // Loss in USD incurred by 1 unit/lot

  // Breakdown
  stopLossDistanceStandard: number;  // Distance converted to standard price movement
  spreadCostUSD: number;             // Spread cost included
  commissionCostUSD: number;         // Commission cost included
}
