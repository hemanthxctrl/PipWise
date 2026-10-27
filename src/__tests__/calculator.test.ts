import { describe, it, expect } from 'vitest';
import { DEFAULT_INSTRUMENT_SPECS } from '../data/defaultSpecs';
import { calculatePositionSize, roundDownToStep } from '../engine/calculator';
import { convertStopLossToPriceDiff, convertPriceDiffToTargetUnit } from '../engine/unitConverter';
import { CalculationInput } from '../types/calculator';

describe('PipWise Universal Lot Size Calculation Engine', () => {

  // 1. Decimal-Safe Rounding Grid Tests
  describe('Decimal-Safe Rounding', () => {
    it('rounds down to 0.01 lot step without floating point overflow', () => {
      expect(roundDownToStep(0.14899999999999, 0.01, 0.01)).toBe(0.14);
      expect(roundDownToStep(1.999, 0.01, 0.01)).toBe(1.99);
      expect(roundDownToStep(0.009, 0.01, 0.01)).toBe(0); // Below minimum
    });

    it('handles 0.1 step (e.g. Indices / ETH)', () => {
      expect(roundDownToStep(5.37, 0.1, 0.1)).toBe(5.3);
    });
  });

  // 2. All 14 Instruments under Universal Specifications
  describe('Universal Specifications — All 14 Instruments', () => {
    const baseInput: CalculationInput = {
      accountBalance: 5000, // $5,000 default balance
      riskPercent: 1.0,     // 1% risk preset = $50 risk budget
      stopLossDistance: 20,
      stopLossUnit: 'pips',
      conversionRate: 1.0,
      isCustomRate: false
    };

    // EURUSD
    it('calculates EURUSD position size accurately ($10/pip standard lot)', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.EURUSD;
      const res = calculatePositionSize({ ...baseInput, stopLossDistance: 20, stopLossUnit: 'pips' }, spec);
      expect(res.isValid).toBe(true);
      expect(res.riskBudgetUSD).toBe(50);
      // 20 pips on 1 lot = $200 loss. $50 budget / $200 = 0.25 lots
      expect(res.recommendedQuantity).toBe(0.25);
      expect(res.estimatedLossUSD).toBe(50.00);
      expect(res.estimatedLossUSD).toBeLessThanOrEqual(res.riskBudgetUSD);
    });

    // GBPUSD
    it('calculates GBPUSD position size accurately', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.GBPUSD;
      const res = calculatePositionSize({ ...baseInput, stopLossDistance: 25, stopLossUnit: 'pips' }, spec);
      expect(res.isValid).toBe(true);
      // 25 pips on 1 lot = $250 loss. $50 / $250 = 0.20 lots
      expect(res.recommendedQuantity).toBe(0.20);
      expect(res.estimatedLossUSD).toBe(50.00);
    });

    // AUDUSD
    it('calculates AUDUSD position size accurately', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.AUDUSD;
      const res = calculatePositionSize({ ...baseInput, stopLossDistance: 30, stopLossUnit: 'pips' }, spec);
      expect(res.isValid).toBe(true);
      // 30 pips on 1 lot = $300. $50 / $300 = 0.1666... -> rounds down to 0.16
      expect(res.recommendedQuantity).toBe(0.16);
      expect(res.estimatedLossUSD).toBe(48.00);
      expect(res.estimatedLossUSD).toBeLessThanOrEqual(res.riskBudgetUSD);
    });

    // NZDUSD
    it('calculates NZDUSD position size accurately', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.NZDUSD;
      const res = calculatePositionSize({ ...baseInput, stopLossDistance: 15, stopLossUnit: 'pips' }, spec);
      expect(res.isValid).toBe(true);
      // 15 pips on 1 lot = $150. $50 / $150 = 0.333... -> 0.33
      expect(res.recommendedQuantity).toBe(0.33);
      expect(res.estimatedLossUSD).toBeLessThanOrEqual(res.riskBudgetUSD);
    });

    // USDJPY (Requires conversion rate)
    it('calculates USDJPY position size with explicit USDJPY rate', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.USDJPY;
      const res = calculatePositionSize({
        ...baseInput,
        stopLossDistance: 20,
        stopLossUnit: 'pips',
        conversionRate: 155.0, // 1 USD = 155 JPY
        isCustomRate: true
      }, spec);
      expect(res.isValid).toBe(true);
      // 20 pips = 0.20 JPY diff. On 100k contract = 20,000 JPY loss per lot.
      // 20,000 JPY / 155 = $129.032 loss per lot.
      // $50 / $129.032 = 0.3875 lots -> 0.38 lots
      expect(res.recommendedQuantity).toBe(0.38);
      expect(res.estimatedLossUSD).toBeLessThanOrEqual(res.riskBudgetUSD);
    });

    // USDCHF
    it('calculates USDCHF position size with conversion rate', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.USDCHF;
      const res = calculatePositionSize({
        ...baseInput,
        stopLossDistance: 25,
        stopLossUnit: 'pips',
        conversionRate: 0.88,
        isCustomRate: true
      }, spec);
      expect(res.isValid).toBe(true);
      expect(res.estimatedLossUSD).toBeLessThanOrEqual(res.riskBudgetUSD);
    });

    // USDCAD
    it('calculates USDCAD position size with conversion rate', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.USDCAD;
      const res = calculatePositionSize({
        ...baseInput,
        stopLossDistance: 20,
        stopLossUnit: 'pips',
        conversionRate: 1.40,
        isCustomRate: true
      }, spec);
      expect(res.isValid).toBe(true);
      expect(res.estimatedLossUSD).toBeLessThanOrEqual(res.riskBudgetUSD);
    });

    // XAUUSD (Gold)
    it('calculates Gold (XAUUSD) defaulting to USD price movement', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.XAUUSD;
      // User specifies $3.00 stop-loss distance
      const res = calculatePositionSize({
        ...baseInput,
        stopLossDistance: 3.00,
        stopLossUnit: 'price_diff'
      }, spec);
      expect(res.isValid).toBe(true);
      // 1 lot = 100 oz. $3.00 move * 100 oz = $300 loss per lot.
      // $50 risk budget / $300 = 0.1666... -> rounds down to 0.16 lots
      expect(res.recommendedQuantity).toBe(0.16);
      expect(res.estimatedLossUSD).toBe(48.00);
      expect(res.estimatedLossUSD).toBeLessThanOrEqual(50.00);
    });

    // XAGUSD (Silver)
    it('calculates Silver (XAGUSD) with 5,000 oz contract', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.XAGUSD;
      // $0.20 price movement
      const res = calculatePositionSize({
        ...baseInput,
        stopLossDistance: 0.20,
        stopLossUnit: 'price_diff'
      }, spec);
      expect(res.isValid).toBe(true);
      // 1 lot = 5,000 oz. $0.20 move * 5,000 = $1,000 loss per lot.
      // $50 budget / $1,000 = 0.05 lots
      expect(res.recommendedQuantity).toBe(0.05);
      expect(res.estimatedLossUSD).toBe(50.00);
    });

    // USOIL (Crude Oil)
    it('calculates USOIL with 1,000 barrel contract', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.USOIL;
      // $1.00 move on oil
      const res = calculatePositionSize({
        ...baseInput,
        stopLossDistance: 1.00,
        stopLossUnit: 'price_diff'
      }, spec);
      expect(res.isValid).toBe(true);
      // 1 lot = 1,000 barrels. $1.00 * 1,000 = $1,000 loss per lot.
      // $50 / $1,000 = 0.05 lots
      expect(res.recommendedQuantity).toBe(0.05);
      expect(res.estimatedLossUSD).toBe(50.00);
    });

    // NAS100 (Indices)
    it('calculates NAS100 with index point movement', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.NAS100;
      // 25 index points move
      const res = calculatePositionSize({
        ...baseInput,
        stopLossDistance: 25,
        stopLossUnit: 'points'
      }, spec);
      expect(res.isValid).toBe(true);
      // 25 points on 1 contract = $25 loss. $50 budget / $25 = 2.0 contracts
      expect(res.recommendedQuantity).toBe(2.0);
      expect(res.estimatedLossUSD).toBe(50.00);
    });

    // JP225 (Indices with JPY conversion)
    it('calculates JP225 with JPY conversion', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.JP225;
      // 100 points stop loss, USDJPY = 150
      const res = calculatePositionSize({
        ...baseInput,
        stopLossDistance: 100,
        stopLossUnit: 'points',
        conversionRate: 150.0,
        isCustomRate: true
      }, spec);
      expect(res.isValid).toBe(true);
      expect(res.estimatedLossUSD).toBeLessThanOrEqual(res.riskBudgetUSD);
    });

    // BTCUSD (Crypto)
    it('calculates BTCUSD position size with $500 price move', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.BTCUSD;
      const res = calculatePositionSize({
        ...baseInput,
        stopLossDistance: 500,
        stopLossUnit: 'price_diff'
      }, spec);
      expect(res.isValid).toBe(true);
      // 1 lot = 1 BTC. $500 move = $500 loss per lot. $50 / $500 = 0.10 lots
      expect(res.recommendedQuantity).toBe(0.10);
      expect(res.estimatedLossUSD).toBe(50.00);
    });

    // ETHUSD (Crypto)
    it('calculates ETHUSD position size with $40 price move', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.ETHUSD;
      const res = calculatePositionSize({
        ...baseInput,
        stopLossDistance: 40,
        stopLossUnit: 'price_diff'
      }, spec);
      expect(res.isValid).toBe(true);
      // 1 lot = 1 ETH. $40 move = $40 loss per lot. $50 / $40 = 1.25 lots
      expect(res.recommendedQuantity).toBe(1.25);
      expect(res.estimatedLossUSD).toBe(50.00);
    });
  });

  // 3. User-Configured Specifications
  describe('Configurable Instrument Specifications', () => {
    it('calculates custom contract size (e.g. 10 oz mini gold contract)', () => {
      const customGoldSpec = {
        ...DEFAULT_INSTRUMENT_SPECS.XAUUSD,
        contractSize: 10,
        tickValue: 0.10 // 10 oz mini contract: $0.01 tick = $0.10
      };

      const res = calculatePositionSize({
        accountBalance: 5000,
        riskPercent: 1.0, // $50
        stopLossDistance: 3.00, // $3 move = $30 loss per 1.0 lot
        stopLossUnit: 'price_diff',
        conversionRate: 1.0,
        isCustomRate: false
      }, customGoldSpec);

      expect(res.isValid).toBe(true);
      // $50 / $30 = 1.666... -> 1.66 lots
      expect(res.recommendedQuantity).toBe(1.66);
      expect(res.estimatedLossUSD).toBeLessThanOrEqual(50.00);
    });
  });

  // 4. Edge Cases: Minimum Quantity Exceeding Budget
  describe('Risk Budget Protection & Edge Cases', () => {
    it('returns "No valid position size" when minimum quantity exceeds risk budget', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.EURUSD; // Min: 0.01 lot
      const res = calculatePositionSize({
        accountBalance: 20,
        riskPercent: 1.0, // $0.20 budget
        stopLossDistance: 600,
        stopLossUnit: 'pips',
        conversionRate: 1.0,
        isCustomRate: false
      }, spec);

      expect(res.isValid).toBe(false);
      expect(res.statusMessage).toContain('No valid position size');
      expect(res.recommendedQuantity).toBe(0);
    });

    it('requires verified conversion rate when loss currency is not USD', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.USDJPY;
      const res = calculatePositionSize({
        accountBalance: 5000,
        riskPercent: 1.0,
        stopLossDistance: 20,
        stopLossUnit: 'pips',
        conversionRate: 0, // Missing rate
        isCustomRate: false
      }, spec);

      expect(res.isValid).toBe(false);
      expect(res.statusMessage).toContain('Conversion rate required');
    });

    it('includes spread and commission costs without double counting', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.EURUSD;
      const resWithoutCost = calculatePositionSize({
        accountBalance: 5000,
        riskPercent: 1.0, // $50
        stopLossDistance: 20,
        stopLossUnit: 'pips',
        conversionRate: 1.0,
        isCustomRate: false
      }, spec);

      const resWithCost = calculatePositionSize({
        accountBalance: 5000,
        riskPercent: 1.0, // $50
        stopLossDistance: 20,
        stopLossUnit: 'pips',
        conversionRate: 1.0,
        isCustomRate: false,
        spreadPips: 1.5,
        commissionPerLot: 5.0
      }, spec);

      expect(resWithCost.isValid).toBe(true);
      expect(resWithCost.recommendedQuantity).toBeLessThanOrEqual(resWithoutCost.recommendedQuantity);
      expect(resWithCost.estimatedLossUSD).toBeLessThanOrEqual(resWithCost.riskBudgetUSD);
    });
  });

  // 5. Unit Converter tests
  describe('Stop-Loss Unit Interconversions', () => {
    it('converts between Forex pips and price difference seamlessly', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.EURUSD;
      const priceDiff = convertStopLossToPriceDiff(25, 'pips', spec);
      expect(priceDiff).toBe(0.0025);

      const pipsBack = convertPriceDiffToTargetUnit(priceDiff, 'pips', spec);
      expect(pipsBack).toBe(25);
    });

    it('converts Crypto percentage move based on entry price', () => {
      const spec = DEFAULT_INSTRUMENT_SPECS.BTCUSD;
      const entryPrice = 90000;
      const priceDiff = convertStopLossToPriceDiff(2.0, 'percent', spec, entryPrice);
      expect(priceDiff).toBe(1800);

      const percentBack = convertPriceDiffToTargetUnit(1800, 'percent', spec, entryPrice);
      expect(percentBack).toBe(2.0);
    });
  });
});
