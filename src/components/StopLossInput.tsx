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

const UNIT_LABELS: Record<StopLossUnit, string> = {
  price_diff: 'Price ($)',
  pips: 'Pips',
  ticks: 'Ticks',
  points: 'Points',
  percent: 'Percent (%)'
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
            {spec.supportedStopUnits.map(unit => (
              <button
                key={unit}
                type="button"
                className={`unit-btn ${selectedUnit === unit ? 'active' : ''}`}
                onClick={() => onSelectUnit(unit)}
              >
                {UNIT_LABELS[unit]}
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
            <span className="unit-tag">{UNIT_LABELS[selectedUnit]}</span>
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
