import React from 'react';
import { AssetCategory } from '../types/instrument';
import { ALL_INSTRUMENTS } from '../data/defaultInstruments';

interface InstrumentSelectorProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'CRYPTO', label: 'Crypto' },
  { id: 'INDICES', label: 'Indices' },
  { id: 'COMMODITIES', label: 'Commodities' },
  { id: 'FOREX', label: 'Forex' }
];

export const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  selectedSymbol,
  onSelectSymbol,
  selectedCategory,
  onSelectCategory
}) => {
  const filteredInstruments = ALL_INSTRUMENTS.filter(inst => {
    if (selectedCategory === 'ALL') return true;
    return inst.category === (selectedCategory as AssetCategory);
  });

  return (
    <div className="form-group">
      <div className="category-filter">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="input-with-symbol" style={{ marginTop: '8px' }}>
        <select
          id="instrument-select"
          className="custom-select"
          value={selectedSymbol}
          onChange={(e) => onSelectSymbol(e.target.value)}
          aria-label="Select Trading Instrument"
        >
          {selectedCategory === 'ALL' ? (
            <>
              <optgroup label="CRYPTOCURRENCIES">
                {ALL_INSTRUMENTS.filter(i => i.category === 'CRYPTO').map(i => (
                  <option key={i.symbol} value={i.symbol}>
                    {i.symbol}
                  </option>
                ))}
              </optgroup>
              <optgroup label="INDICES">
                {ALL_INSTRUMENTS.filter(i => i.category === 'INDICES').map(i => (
                  <option key={i.symbol} value={i.symbol}>
                    {i.symbol}
                  </option>
                ))}
              </optgroup>
              <optgroup label="COMMODITIES">
                {ALL_INSTRUMENTS.filter(i => i.category === 'COMMODITIES').map(i => (
                  <option key={i.symbol} value={i.symbol}>
                    {i.symbol}
                  </option>
                ))}
              </optgroup>
              <optgroup label="FOREX">
                {ALL_INSTRUMENTS.filter(i => i.category === 'FOREX').map(i => (
                  <option key={i.symbol} value={i.symbol}>
                    {i.symbol}
                  </option>
                ))}
              </optgroup>
            </>
          ) : (
            filteredInstruments.map(i => (
              <option key={i.symbol} value={i.symbol}>
                {i.symbol}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};
