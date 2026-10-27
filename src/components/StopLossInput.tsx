import React from 'react';
import { StopLossUnit, InstrumentSpec } from '../types/instrument';

interface StopLossInputProps {
  spec: InstrumentSpec;
  stopLossDistance: number;
  onStopLossDistanceChange: (val: number) => void;
  selectedUnit: StopLossUnit;
  onSelectUnit: (unit: StopLossUnit) => void;
  usePriceLevels: boolean;
  onTogglePriceLevels: (use: boolean) => void;
  entryPrice?: number;
  onEntryPriceChange: (val?: number) => void;
  stopPrice?: number;
  onStopPriceChange: (val?: number) => void;
}

export const getUnitLabel = (unit: StopLossUnit, spec: InstrumentSpec): string => {
  if (unit === 'price_diff') {
    return spec.quoteCurrency === 'USD' ? 'Price ($)' : `Price (${spec.quoteCurrency})`;
  }
  if (unit === 'pips') return 'Pips';
  if (unit === 'points') return 'Points';
  if (unit === 'percent') return 'Percent (%)';
  if (unit === 'ticks') return 'Ticks';
  return unit;
};

export const StopLossInput: React.FC<StopLossInputProps> = ({
  spec,
  stopLossDistance,
  onStopLossDistanceChange,
  selectedUnit,
  onSelectUnit,
  usePriceLevels,
  onTogglePriceLevels,
  entryPrice,
  onEntryPriceChange,
  stopPrice,
  onStopPriceChange
}) => {
  // Filter out 'ticks' so only Price ($) and Pips (or Points) are visible
  const visibleUnits = spec.supportedStopUnits.filter(unit => unit !== 'ticks');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="form-group">
        <div className="form-label">
          <span>Stop-Loss Configuration</span>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-accent)',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
            onClick={() => onTogglePriceLevels(!usePriceLevels)}
          >
            {usePriceLevels ? 'Direct Distance' : 'Entry & Stop Prices'}
          </button>
        </div>

        {/* Unit switcher buttons */}
        {!usePriceLevels && (
          <div className="unit-switcher" style={{ marginBottom: '8px' }}>
            {visibleUnits.map(unit => (
              <button
                key={unit}
                type="button"
                className={`unit-btn ${selectedUnit === unit ? 'active' : ''}`}
                onClick={() => onSelectUnit(unit)}
              >
                {getUnitLabel(unit, spec)}
              </button>
            ))}
          </div>
        )}

        {!usePriceLevels ? (
          <div className="input-with-symbol">
            <input
              id="stop-distance-input"
              type="number"
              className="custom-input"
              value={stopLossDistance || ''}
              min="0.00001"
              step={selectedUnit === 'pips' || selectedUnit === 'points' ? '1' : '0.01'}
              onChange={(e) => onStopLossDistanceChange(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="e.g. 20"
            />
            <span className="unit-tag">{getUnitLabel(selectedUnit, spec)}</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="form-group">
              <label htmlFor="entry-price-input" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Entry Price</label>
              <input
                id="entry-price-input"
                type="number"
                className="custom-input"
                value={entryPrice || ''}
                step="any"
                onChange={(e) => onEntryPriceChange(parseFloat(e.target.value) || undefined)}
                placeholder="Entry level"
              />
            </div>
            <div className="form-group">
              <label htmlFor="stop-price-input" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Stop-Loss Price</label>
              <input
                id="stop-price-input"
                type="number"
                className="custom-input"
                value={stopPrice || ''}
                step="any"
                onChange={(e) => onStopPriceChange(parseFloat(e.target.value) || undefined)}
                placeholder="Stop level"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
