import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Sliders } from 'lucide-react';
import { InstrumentSpec } from '../types/instrument';

interface InstrumentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  spec: InstrumentSpec;
  onUpdateSpec: (updated: InstrumentSpec) => void;
  onResetToDefaults: () => void;
}

export const InstrumentSettingsModal: React.FC<InstrumentSettingsModalProps> = ({
  isOpen,
  onClose,
  spec,
  onUpdateSpec,
  onResetToDefaults
}) => {
  const [formState, setFormState] = useState<InstrumentSpec>(spec);

  useEffect(() => {
    setFormState(spec);
  }, [spec]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSpec(formState);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} style={{ color: 'var(--accent-blue)' }} />
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{spec.symbol} Specifications</h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configure contract mechanics</div>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="spec-contract-size" className="form-label">
              Contract Size (Units per 1.0 standard lot)
            </label>
            <input
              id="spec-contract-size"
              type="number"
              className="custom-input"
              value={formState.contractSize}
              onChange={(e) => setFormState({ ...formState, contractSize: parseFloat(e.target.value) || 0 })}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Standard: 100 oz (Gold), 5000 oz (Silver), 1000 bbl (Oil), 100,000 (Forex)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label htmlFor="spec-tick-size" className="form-label">Tick Size</label>
              <input
                id="spec-tick-size"
                type="number"
                step="any"
                className="custom-input"
                value={formState.tickSize}
                onChange={(e) => setFormState({ ...formState, tickSize: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="spec-tick-val" className="form-label">Tick Value ({formState.lossCurrency})</label>
              <input
                id="spec-tick-val"
                type="number"
                step="any"
                className="custom-input"
                value={formState.tickValue}
                onChange={(e) => setFormState({ ...formState, tickValue: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label htmlFor="spec-min-qty" className="form-label">Minimum Order Qty</label>
              <input
                id="spec-min-qty"
                type="number"
                step="any"
                className="custom-input"
                value={formState.minQuantity}
                onChange={(e) => setFormState({ ...formState, minQuantity: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="spec-qty-step" className="form-label">Quantity Step</label>
              <input
                id="spec-qty-step"
                type="number"
                step="any"
                className="custom-input"
                value={formState.quantityStep}
                onChange={(e) => setFormState({ ...formState, quantityStep: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="spec-unit-name" className="form-label">Order Unit Name</label>
            <input
              id="spec-unit-name"
              type="text"
              className="custom-input"
              value={formState.orderUnitName}
              onChange={(e) => setFormState({ ...formState, orderUnitName: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="secondary-btn" onClick={onResetToDefaults} title="Restore Defaults">
            <RotateCcw size={16} /> Reset
          </button>
          <button type="button" className="primary-btn" onClick={handleSave}>
            Save Specifications
          </button>
        </div>
      </div>
    </div>
  );
};
