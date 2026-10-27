import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InstrumentSelector } from './components/InstrumentSelector';
import { AccountRiskInput } from './components/AccountRiskInput';
import { StopLossInput } from './components/StopLossInput';
import { ConversionRateBar } from './components/ConversionRateBar';
import { ResultCard } from './components/ResultCard';
import { InstrumentSettingsModal } from './components/InstrumentSettingsModal';
import { DEFAULT_INSTRUMENT_SPECS } from './data/defaultSpecs';
import { InstrumentSpec, StopLossUnit } from './types/instrument';
import { CalculationInput } from './types/calculator';
import { calculatePositionSize } from './engine/calculator';
import { convertStopLossToPriceDiff } from './engine/unitConverter';
import { useLocalStorage } from './hooks/useLocalStorage';
import { usePWAInstall } from './hooks/usePWAInstall';

const DEFAULT_CONVERSION_RATES: Record<string, number> = {
  JPY: 155.0,
  CHF: 0.88,
  CAD: 1.40
};

export const App: React.FC = () => {
  // 1. Persistence & Preferences
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('pipwise_theme', 'dark');
  const [symbol, setSymbol] = useLocalStorage<string>('pipwise_symbol', 'XAUUSD');
  const [category, setCategory] = useLocalStorage<string>('pipwise_category', 'ALL');
  const [balance, setBalance] = useLocalStorage<number>('pipwise_balance', 5000);
  const [riskPercent, setRiskPercent] = useLocalStorage<number>('pipwise_risk_pct', 1.0);
  const [isCustomRisk, setIsCustomRisk] = useLocalStorage<boolean>('pipwise_custom_risk', false);

  // User-customized instrument specifications stored in LocalStorage
  const [customSpecs, setCustomSpecs] = useLocalStorage<Record<string, InstrumentSpec>>(
    'pipwise_instrument_specs',
    {}
  );

  // PWA Install & Network Hook
  const { isInstallable, promptInstall } = usePWAInstall();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme attribute application
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Active instrument specification (custom override if saved, otherwise default)
  const rawSpec: InstrumentSpec =
    customSpecs[symbol] || DEFAULT_INSTRUMENT_SPECS[symbol] || DEFAULT_INSTRUMENT_SPECS.XAUUSD;

  // Sanitize activeSpec to guarantee 'pips' is the only supported unit and default
  const activeSpec: InstrumentSpec = React.useMemo(() => {
    return {
      ...rawSpec,
      supportedStopUnits: ['pips'] as StopLossUnit[],
      defaultStopUnit: 'pips' as StopLossUnit
    };
  }, [rawSpec]);

  // Migrate any saved custom specs in localStorage to pip-only stop loss configuration
  useEffect(() => {
    try {
      const rawStored = window.localStorage.getItem('pipwise_instrument_specs');
      if (rawStored) {
        const parsed = JSON.parse(rawStored) as Record<string, InstrumentSpec>;
        let hasChanges = false;
        const cleaned: Record<string, InstrumentSpec> = {};
        for (const [key, spec] of Object.entries(parsed)) {
          if (
            spec.defaultStopUnit !== 'pips' ||
            !spec.supportedStopUnits ||
            spec.supportedStopUnits.length !== 1 ||
            spec.supportedStopUnits[0] !== 'pips'
          ) {
            hasChanges = true;
          }
          cleaned[key] = {
            ...spec,
            supportedStopUnits: ['pips'] as StopLossUnit[],
            defaultStopUnit: 'pips' as StopLossUnit
          };
        }
        if (hasChanges) {
          setCustomSpecs(cleaned);
        }
      }
    } catch (e) {
      console.warn('Error migrating customSpecs:', e);
    }
  }, [setCustomSpecs]);

  // Stop loss distance state: sensible defaults in pips for instruments
  const getDefaultPipsForSymbol = (sym: string): number => {
    if (sym === 'XAUUSD') return 30; // 30 pips = $3.00 gold move (0.10 pipSize)
    if (sym === 'NAS100' || sym === 'JP225') return 25;
    if (sym === 'USOIL') return 50;
    return 20;
  };

  const [stopLossDistance, setStopLossDistance] = useState<number>(() => {
    return getDefaultPipsForSymbol(symbol);
  });

  const [selectedUnit, setSelectedUnit] = useState<StopLossUnit>('pips');
  const [usePriceLevels, setUsePriceLevels] = useState<boolean>(false);
  const [entryPrice, setEntryPrice] = useState<number | undefined>(undefined);
  const [stopPrice, setStopPrice] = useState<number | undefined>(undefined);

  // If previous state had a non-pips unit (e.g. price_diff or ticks), migrate distance to pips accurately
  useEffect(() => {
    if ((selectedUnit as string) !== 'pips') {
      const currentPriceDiff = convertStopLossToPriceDiff(stopLossDistance, selectedUnit, activeSpec, entryPrice);
      const convertedPips = activeSpec.pipSize > 0
        ? Number((currentPriceDiff / activeSpec.pipSize).toFixed(1))
        : getDefaultPipsForSymbol(activeSpec.symbol);
      setSelectedUnit('pips');
      setStopLossDistance(convertedPips > 0 ? convertedPips : getDefaultPipsForSymbol(activeSpec.symbol));
    }
  }, [selectedUnit, activeSpec, stopLossDistance, entryPrice]);

  // Exchange rate for non-USD loss currencies
  const defaultRate = DEFAULT_CONVERSION_RATES[activeSpec.lossCurrency] || 1.0;
  const [conversionRate, setConversionRate] = useState<number>(defaultRate);
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);

  // Update conversion rate default when symbol changes
  useEffect(() => {
    if (activeSpec.lossCurrency !== 'USD') {
      const def = DEFAULT_CONVERSION_RATES[activeSpec.lossCurrency] || 1.0;
      setConversionRate(def);
      setIsCustomRate(false);
    } else {
      setConversionRate(1.0);
      setIsCustomRate(false);
    }
  }, [activeSpec.lossCurrency, symbol]);

  // Reset stop unit to pips and set default distance when symbol changes
  useEffect(() => {
    setSelectedUnit('pips');
    setStopLossDistance(getDefaultPipsForSymbol(symbol));
  }, [symbol]);

  // Handle switching stop-loss units seamlessly (if invoked)
  const handleSelectUnit = (newUnit: StopLossUnit) => {
    setSelectedUnit(newUnit);
  };

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleUpdateSpec = (updated: InstrumentSpec) => {
    setCustomSpecs(prev => ({
      ...prev,
      [symbol]: updated
    }));
  };

  const handleResetSpec = () => {
    setCustomSpecs(prev => {
      const copy = { ...prev };
      delete copy[symbol];
      return copy;
    });
  };

  // 2. Perform Financial Calculation
  const calcInput: CalculationInput = {
    accountBalance: balance,
    riskPercent,
    stopLossDistance,
    stopLossUnit: selectedUnit,
    entryPrice: usePriceLevels ? entryPrice : undefined,
    stopPrice: usePriceLevels ? stopPrice : undefined,
    conversionRate,
    isCustomRate
  };

  const calcResult = calculatePositionSize(calcInput, activeSpec);

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isInstallable={isInstallable}
        onPromptInstall={promptInstall}
        isOffline={isOffline}
      />

      {/* Main Form Card — opens directly without broker selection */}
      <div className="calculator-card">
        {/* Instrument Selector */}
        <InstrumentSelector
          selectedSymbol={symbol}
          onSelectSymbol={setSymbol}
          selectedCategory={category}
          onSelectCategory={setCategory}
        />

        {/* Account Balance & Risk Presets */}
        <AccountRiskInput
          balance={balance}
          onBalanceChange={setBalance}
          riskPercent={riskPercent}
          onRiskPercentChange={setRiskPercent}
          isCustomRisk={isCustomRisk}
          onToggleCustomRisk={setIsCustomRisk}
        />

        {/* Stop-Loss Input & Unit Switcher */}
        <StopLossInput
          spec={activeSpec}
          stopLossDistance={stopLossDistance}
          onStopLossDistanceChange={setStopLossDistance}
          selectedUnit={selectedUnit}
          onSelectUnit={handleSelectUnit}
          usePriceLevels={usePriceLevels}
          onTogglePriceLevels={setUsePriceLevels}
          entryPrice={entryPrice}
          onEntryPriceChange={setEntryPrice}
          stopPrice={stopPrice}
          onStopPriceChange={setStopPrice}
        />

        {/* Non-USD Currency Conversion Bar */}
        <ConversionRateBar
          lossCurrency={activeSpec.lossCurrency}
          conversionRate={conversionRate}
          onRateChange={(rate) => {
            setConversionRate(rate);
            setIsCustomRate(true);
          }}
          isCustomRate={isCustomRate}
          onResetRate={() => {
            setConversionRate(defaultRate);
            setIsCustomRate(false);
          }}
          defaultRate={defaultRate}
        />
      </div>

      {/* Primary Result Card */}
      <ResultCard
        result={calcResult}
        balance={balance}
        riskPercent={riskPercent}
      />

      {/* Creator Credit Footer */}
      <footer className="app-footer">
        Designed &amp; Developed by <span className="footer-author">Hemanth</span>
      </footer>

      {/* Instrument Specification Drawer Modal */}
      <InstrumentSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        spec={activeSpec}
        onUpdateSpec={handleUpdateSpec}
        onResetToDefaults={handleResetSpec}
      />
    </div>
  );
};
