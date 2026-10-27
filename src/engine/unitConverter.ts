import { StopLossUnit, InstrumentSpec } from '../types/instrument';

/**
 * Converts any supported stop loss unit input into the standard price difference.
 */
export function convertStopLossToPriceDiff(
  distance: number,
  unit: StopLossUnit,
  spec: InstrumentSpec,
  entryPrice?: number
): number {
  if (distance <= 0) return 0;

  switch (unit) {
    case 'price_diff':
      return distance;

    case 'pips':
      return distance * spec.pipSize;

    case 'ticks':
      return distance * spec.tickSize;

    case 'points':
      return distance * spec.pipSize;

    case 'percent':
      if (!entryPrice || entryPrice <= 0) {
        return 0;
      }
      return (entryPrice * distance) / 100;

    default:
      return distance;
  }
}

/**
 * Converts a standard price difference back into a target unit
 * when user switches stop loss input units.
 */
export function convertPriceDiffToTargetUnit(
  priceDiff: number,
  targetUnit: StopLossUnit,
  spec: InstrumentSpec,
  entryPrice?: number
): number {
  if (priceDiff <= 0) return 0;

  switch (targetUnit) {
    case 'price_diff':
      return Number(priceDiff.toFixed(spec.priceDecimals));

    case 'pips':
      return Number((priceDiff / spec.pipSize).toFixed(1));

    case 'ticks':
      return Math.round(priceDiff / spec.tickSize);

    case 'points':
      return Number((priceDiff / spec.pipSize).toFixed(1));

    case 'percent':
      if (!entryPrice || entryPrice <= 0) return 0;
      return Number(((priceDiff / entryPrice) * 100).toFixed(2));

    default:
      return priceDiff;
  }
}
