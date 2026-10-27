import React from 'react';
import { RefreshCw } from 'lucide-react';

interface ConversionRateBarProps {
  lossCurrency: string;
  conversionRate: number;
  onRateChange: (rate: number) => void;
  isCustomRate: boolean;
  onResetRate: () => void;
  defaultRate: number;
}

export const ConversionRateBar: React.FC<ConversionRateBarProps> = ({
  lossCurrency,
  conversionRate,
  onRateChange,
  isCustomRate,
  onResetRate,
  defaultRate
}) => {
  if (lossCurrency === 'USD') return null;

  return (
    <div className="alert-box alert-info" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
          Conversion: USD / {lossCurrency} {isCustomRate && <strong style={{ color: 'var(--accent-amber)' }}>(Manual Rate)</strong>}
        </span>
        {isCustomRate && (
          <button
            type="button"
            onClick={onResetRate}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-blue)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              fontWeight: 600
            }}
          >
            <RefreshCw size={12} /> Reset to {defaultRate}
          </button>
        )}
      </div>

      <div className="input-with-symbol" style={{ width: '100%' }}>
        <input
          id="conversion-rate-input"
          type="number"
          className="custom-input"
          style={{ padding: '6px 10px', fontSize: '0.85rem' }}
          value={conversionRate || ''}
          step="any"
          onChange={(e) => onRateChange(parseFloat(e.target.value) || 0)}
          placeholder={`USD/${lossCurrency} rate`}
        />
        <span className="unit-tag">{lossCurrency}</span>
      </div>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        Rates are required for offline precision. Never uses simulated or stale hidden rates.
      </p>
    </div>
  );
};
