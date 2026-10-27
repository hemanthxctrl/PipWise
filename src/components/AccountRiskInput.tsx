import React from 'react';

interface AccountRiskInputProps {
  balance: number;
  onBalanceChange: (val: number) => void;
  riskPercent: number;
  onRiskPercentChange: (val: number) => void;
  isCustomRisk: boolean;
  onToggleCustomRisk: (isCustom: boolean) => void;
}

const RISK_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0];

export const AccountRiskInput: React.FC<AccountRiskInputProps> = ({
  balance,
  onBalanceChange,
  riskPercent,
  onRiskPercentChange,
  isCustomRisk,
  onToggleCustomRisk
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Account Balance */}
      <div className="form-group">
        <label htmlFor="account-balance-input" className="form-label">
          <span>Account Balance (USD)</span>
        </label>
        <div className="input-with-symbol">
          <input
            id="account-balance-input"
            type="number"
            className="custom-input"
            value={balance || ''}
            min="1"
            step="100"
            onChange={(e) => onBalanceChange(Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="5000"
          />
          <span className="unit-tag">USD</span>
        </div>
      </div>

      {/* Risk Percentage Presets */}
      <div className="form-group">
        <div className="form-label">
          <span>Risk Preset</span>
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
            onClick={() => onToggleCustomRisk(!isCustomRisk)}
          >
            {isCustomRisk ? 'Use Presets' : 'Custom Risk %'}
          </button>
        </div>

        {!isCustomRisk ? (
          <div className="risk-presets-row">
            {RISK_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`preset-btn ${riskPercent === preset ? 'active' : ''}`}
                onClick={() => onRiskPercentChange(preset)}
              >
                {preset}%
              </button>
            ))}
          </div>
        ) : (
          <div className="input-with-symbol">
            <input
              id="custom-risk-input"
              type="number"
              className="custom-input"
              value={riskPercent || ''}
              min="0.01"
              max="100"
              step="0.1"
              onChange={(e) => onRiskPercentChange(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="1.0"
            />
            <span className="unit-tag">%</span>
          </div>
        )}
      </div>
    </div>
  );
};
