import { InstrumentSpec } from '../types/instrument';
import { CalculationInput, CalculationResult } from '../types/calculator';
import { convertStopLossToPriceDiff } from './unitConverter';

/**
 * Decimal-safe rounding to the nearest quantity grid step.
 * Uses integer math to eliminate JavaScript IEEE-754 floating point imprecision.
 */
export function roundDownToStep(rawQty: number, step: number, minQty: number): number {
  if (rawQty < minQty) {
    return 0; // Does not meet minimum requirement
  }

  // Determine decimals from step
  const stepStr = step.toString();
  const decimals = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
  const factor = Math.pow(10, Math.min(decimals + 2, 8));

  const scaledQty = Math.round(rawQty * factor);
  const scaledStep = Math.round(step * factor);
  const scaledMin = Math.round(minQty * factor);

  if (scaledQty < scaledMin) {
    return 0;
  }

  // Calculate how many increments above min
  const surplus = scaledQty - scaledMin;
  const stepsAbove = Math.floor(surplus / scaledStep);
  const resultScaled = scaledMin + stepsAbove * scaledStep;

  // Format back to required decimal precision
  const unscaled = resultScaled / factor;
  return Number(unscaled.toFixed(decimals));
}

/**
 * PipWise Position Sizing & Risk Calculation Engine
 * Strictly guarantees that estimatedLossUSD <= riskBudgetUSD.
 */
export function calculatePositionSize(
  input: CalculationInput,
  spec: InstrumentSpec
): CalculationResult {
  const {
    accountBalance,
    riskPercent,
    stopLossDistance,
    stopLossUnit,
    entryPrice,
    stopPrice,
    conversionRate,
    spreadPips = 0,
    commissionPerLot = 0
  } = input;

  // 1. Validation checks
  if (accountBalance <= 0 || isNaN(accountBalance)) {
    return createInvalidResult('Account balance must be greater than zero.', spec);
  }

  if (riskPercent <= 0 || isNaN(riskPercent)) {
    return createInvalidResult('Risk percentage must be greater than zero.', spec);
  }

  // Determine effective stop distance
  let effectiveDistance = stopLossDistance;

  // If entry and stop price levels are explicitly supplied, derive distance
  if (entryPrice !== undefined && stopPrice !== undefined && entryPrice > 0 && stopPrice > 0) {
    const priceDiff = Math.abs(entryPrice - stopPrice);
    if (priceDiff <= 0) {
      return createInvalidResult('Stop loss price must differ from entry price.', spec);
    }
    effectiveDistance = priceDiff;
  }

  if (effectiveDistance <= 0 || isNaN(effectiveDistance)) {
    return createInvalidResult('Stop loss distance must be greater than zero.', spec);
  }

  // 2. Conversion rate validation
  // When loss currency is not USD, we require a valid positive exchange rate
  const needsConversion = spec.lossCurrency !== 'USD';
  if (needsConversion && (!conversionRate || conversionRate <= 0 || isNaN(conversionRate))) {
    return createInvalidResult(`Conversion rate required to convert ${spec.lossCurrency} to USD.`, spec);
  }

  const effectiveConversionRate = needsConversion ? conversionRate : 1.0;

  // 3. Convert stop loss to standard price difference
  const standardPriceDiff = (entryPrice !== undefined && stopPrice !== undefined && entryPrice > 0 && stopPrice > 0)
    ? effectiveDistance
    : convertStopLossToPriceDiff(effectiveDistance, stopLossUnit, spec, entryPrice);

  if (standardPriceDiff <= 0) {
    return createInvalidResult('Invalid stop loss distance calculation.', spec);
  }

  // 4. Target Risk Budget
  const riskBudgetUSD = (accountBalance * riskPercent) / 100;

  // 5. Calculate Loss Per 1.0 Standard Lot in Loss Currency
  // Loss per lot = (Price Difference / Tick Size) * Tick Value
  const lossPerLotInLossCurrency = (standardPriceDiff / spec.tickSize) * spec.tickValue;

  // Convert to USD:
  // For USD-quoted instruments (EURUSD, BTCUSD, XAUUSD): 1.0
  // For USDJPY, JP225, USDCHF, USDCAD: exchange rate divides or multiplies
  const lossPerLotUSD = lossPerLotInLossCurrency / effectiveConversionRate;

  // Add optional spread & commission
  const spreadPriceDiff = spreadPips > 0 ? spreadPips * spec.pipSize : 0;
  const spreadLossPerLotUSD = spreadPriceDiff > 0
    ? ((spreadPriceDiff / spec.tickSize) * spec.tickValue / effectiveConversionRate)
    : 0;

  const commissionPerLotUSD = commissionPerLot > 0 ? commissionPerLot : 0;

  const totalLossPerLotUSD = lossPerLotUSD + spreadLossPerLotUSD + commissionPerLotUSD;

  if (totalLossPerLotUSD <= 0) {
    return createInvalidResult('Unable to determine loss per unit with current specifications.', spec);
  }

  // 6. Raw Position Size
  const rawQuantity = riskBudgetUSD / totalLossPerLotUSD;

  // 7. Decimal-safe Rounding DOWN to quantityStep
  const recommendedQuantity = roundDownToStep(rawQuantity, spec.quantityStep, spec.minQuantity);

  // Check if minimum quantity exceeds risk budget
  if (recommendedQuantity < spec.minQuantity) {
    const minLossUSD = spec.minQuantity * totalLossPerLotUSD;
    return {
      isValid: false,
      statusMessage: `No valid position size. Minimum order (${spec.minQuantity} ${spec.orderUnitName}) risks $${minLossUSD.toFixed(2)} (${((minLossUSD / accountBalance) * 100).toFixed(2)}%), exceeding risk budget of $${riskBudgetUSD.toFixed(2)}.`,
      isBelowMinimum: true,
      isAboveMaximum: false,
      recommendedQuantity: 0,
      orderUnitName: spec.orderUnitName,
      riskBudgetUSD,
      estimatedLossUSD: 0,
      effectiveRiskPercent: 0,
      rawLossPerUnitUSD: totalLossPerLotUSD,
      stopLossDistanceStandard: standardPriceDiff,
      spreadCostUSD: 0,
      commissionCostUSD: 0
    };
  }

  // Check maximum quantity constraint
  let finalQuantity = recommendedQuantity;
  let isAboveMaximum = false;
  if (finalQuantity > spec.maxQuantity) {
    finalQuantity = spec.maxQuantity;
    isAboveMaximum = true;
  }

  // 8. Exact Estimated Loss & Actual Risk Percentage
  const estimatedLossUSD = finalQuantity * totalLossPerLotUSD;
  const effectiveRiskPercent = (estimatedLossUSD / accountBalance) * 100;

  return {
    isValid: true,
    statusMessage: isAboveMaximum ? `Position capped at maximum (${spec.maxQuantity} ${spec.orderUnitName}).` : undefined,
    isBelowMinimum: false,
    isAboveMaximum,
    recommendedQuantity: finalQuantity,
    orderUnitName: spec.orderUnitName,
    riskBudgetUSD,
    estimatedLossUSD: Number(estimatedLossUSD.toFixed(2)),
    effectiveRiskPercent: Number(effectiveRiskPercent.toFixed(3)),
    rawLossPerUnitUSD: totalLossPerLotUSD,
    stopLossDistanceStandard: standardPriceDiff,
    spreadCostUSD: Number((finalQuantity * spreadLossPerLotUSD).toFixed(2)),
    commissionCostUSD: Number((finalQuantity * commissionPerLotUSD).toFixed(2))
  };
}

function createInvalidResult(message: string, spec: InstrumentSpec): CalculationResult {
  return {
    isValid: false,
    statusMessage: message,
    isBelowMinimum: false,
    isAboveMaximum: false,
    recommendedQuantity: 0,
    orderUnitName: spec.orderUnitName,
    riskBudgetUSD: 0,
    estimatedLossUSD: 0,
    effectiveRiskPercent: 0,
    rawLossPerUnitUSD: 0,
    stopLossDistanceStandard: 0,
    spreadCostUSD: 0,
    commissionCostUSD: 0
  };
}
