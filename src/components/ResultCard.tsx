import React from 'react';
import { AlertCircle } from 'lucide-react';
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
      </div>
    </div>
  );
};
