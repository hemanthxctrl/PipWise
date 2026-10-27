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
import { convertPriceDiffToTargetUnit, convertStopLossToPriceDiff } from './engine/unitConverter';
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

  // Sanitize activeSpec to guarantee 'ticks' is never a supported unit or default
  const activeSpec: InstrumentSpec = React.useMemo(() => {
    const supported = rawSpec.supportedStopUnits.filter(u => u !== 'ticks');
    const finalSupported = supported.length > 0
      ? supported
      : (rawSpec.category === 'FOREX' ? ['price_diff', 'pips'] : ['price_diff', 'points']);
    let defaultUnit = rawSpec.defaultStopUnit;
    if (defaultUnit === 'ticks') {
      defaultUnit = rawSpec.category === 'FOREX' ? 'pips' : 'price_diff';
    }
    return {
      ...rawSpec,
      supportedStopUnits: finalSupported,
      defaultStopUnit: defaultUnit
    };
  }, [rawSpec]);

  // Migrate any saved custom specs in localStorage that contain 'ticks'
  useEffect(() => {
    try {
      const rawStored = window.localStorage.getItem('pipwise_instrument_specs');
      if (rawStored && rawStored.includes('ticks')) {
        const parsed = JSON.parse(rawStored) as Record<string, InstrumentSpec>;
        let hasChanges = false;
        const cleaned: Record<string, InstrumentSpec> = {};
        for (const [key, spec] of Object.entries(parsed)) {
          const supported = (spec.supportedStopUnits || []).filter(u => u !== 'ticks');
          let def = spec.defaultStopUnit;
          if (def === 'ticks') {
            def = spec.category === 'FOREX' ? 'pips' : 'price_diff';
            hasChanges = true;
          }
          if (supported.length !== (spec.supportedStopUnits || []).length) {
            hasChanges = true;
          }
          cleaned[key] = {
            ...spec,
            supportedStopUnits: supported.length > 0 ? supported : ['price_diff', 'pips'],
            defaultStopUnit: def
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

  // Stop loss states
  const [stopLossDistance, setStopLossDistance] = useState<number>(() => {
    if (symbol === 'XAUUSD') return 3.0; // Default $3 gold move
    if (activeSpec.defaultStopUnit === 'pips') return 20;
    if (activeSpec.defaultStopUnit === 'points') return 25;
    return 10;
  });

  const [selectedUnit, setSelectedUnit] = useState<StopLossUnit>(() => {
    return activeSpec.defaultStopUnit === 'ticks'
      ? (activeSpec.category === 'FOREX' ? 'pips' : 'price_diff')
      : activeSpec.defaultStopUnit;
  });
  const [usePriceLevels, setUsePriceLevels] = useState<boolean>(false);
  const [entryPrice, setEntryPrice] = useState<number | undefined>(undefined);
  const [stopPrice, setStopPrice] = useState<number | undefined>(undefined);

  // If a previously saved preference or state has 'ticks', migrate it safely
  useEffect(() => {
    if ((selectedUnit as string) === 'ticks') {
      const targetUnit: StopLossUnit =
        activeSpec.category === 'FOREX'
          ? 'pips'
          : (activeSpec.supportedStopUnits.includes('price_diff') ? 'price_diff' : 'points');

      // Preserve actual stop-loss price distance by converting tick count using tickSize
      const priceDiff = stopLossDistance * (activeSpec.tickSize || 1);
      if (priceDiff > 0 && !isNaN(priceDiff)) {
        const convertedDistance = convertPriceDiffToTargetUnit(priceDiff, targetUnit, activeSpec, entryPrice);
        setSelectedUnit(targetUnit);
        setStopLossDistance(convertedDistance);
      } else {
        // If conversion is not possible, require the user to re-enter
        setSelectedUnit(targetUnit);
        setStopLossDistance(0);
      }
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

  // Reset stop unit when instrument changes
  useEffect(() => {
    setSelectedUnit(activeSpec.defaultStopUnit);
    if (activeSpec.symbol === 'XAUUSD') {
      setStopLossDistance(3.0);
    } else if (activeSpec.defaultStopUnit === 'pips') {
      setStopLossDistance(20);
    } else if (activeSpec.defaultStopUnit === 'points') {
      setStopLossDistance(25);
    } else {
      setStopLossDistance(10);
    }
  }, [symbol, activeSpec.defaultStopUnit, activeSpec.symbol]);

  // Handle switching stop-loss units seamlessly without changing effective distance
  const handleSelectUnit = (newUnit: StopLossUnit) => {
    if (newUnit === selectedUnit) return;
    const currentPriceDiff = convertStopLossToPriceDiff(stopLossDistance, selectedUnit, activeSpec, entryPrice);
    const convertedDistance = convertPriceDiffToTargetUnit(currentPriceDiff, newUnit, activeSpec, entryPrice);
    setSelectedUnit(newUnit);
    setStopLossDistance(convertedDistance);
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
