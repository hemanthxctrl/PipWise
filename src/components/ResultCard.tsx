import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { CalculationResult } from '../types/calculator';

interface ResultCardProps {
  result: CalculationResult;
  balance: number;
  riskPercent: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  balance,
  riskPercent
}) => {
  void balance;
  const isInvalid = !result.isValid;

  return (
    <div className="result-card">
      {/* Hero Output */}
      <div className="result-hero">
        <span className="result-label">Recommended Position Size</span>
        <div className="result-value-row">
          <span className="result-hero-value">
            {isInvalid ? '0.00' : result.recommendedQuantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </span>
          <span className="result-unit-badge">{result.orderUnitName}</span>
        </div>
      </div>

      {/* Validation or Warning Notices */}
      {result.statusMessage && (
        <div className={`alert-box ${isInvalid ? 'alert-danger' : 'alert-warning'}`}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{result.statusMessage}</span>
        </div>
      )}

      {/* Financial Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-item">
          <span className="metric-title">Target Risk Budget</span>
          <span className="metric-number">${result.riskBudgetUSD.toFixed(2)} ({riskPercent}%)</span>
        </div>

        <div className="metric-item">
          <span className="metric-title">Estimated Loss at Stop</span>
          <span className={`metric-number ${result.estimatedLossUSD > result.riskBudgetUSD ? 'danger' : 'success'}`}>
            ${result.estimatedLossUSD.toFixed(2)} ({result.effectiveRiskPercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Capital Safety Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <ShieldCheck size={14} style={{ color: 'var(--accent-green)' }} />
        <span>Strict Capital Protection: Size rounded down to lot step</span>
      </div>
    </div>
  );
};
