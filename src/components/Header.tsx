import React from 'react';
import { Sun, Moon, Download, SlidersHorizontal, WifiOff } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  isInstallable: boolean;
  onPromptInstall: () => void;
  isOffline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenSettings,
  isInstallable,
  onPromptInstall,
  isOffline
}) => {
  return (
    <header className="app-header">
      <div className="brand-section">
        <img src="/pipwise-icon.png" alt="PipWise Logo" className="brand-logo" />
        <h1 className="brand-title">
          <span className="brand-pip">Pip</span>
          <span className="brand-wise">Wise</span>
          {isOffline && (
            <span title="Working Offline" style={{ display: 'inline-flex', color: 'var(--accent-amber)', marginLeft: '4px' }}>
              <WifiOff size={16} />
            </span>
          )}
        </h1>
      </div>

      <div className="header-actions">
        {isInstallable && (
          <button
            type="button"
            className="install-btn"
            onClick={onPromptInstall}
            title="Install PipWise to Home Screen"
          >
            <Download size={14} />
            Install App
          </button>
        )}

        <button
          type="button"
          className="icon-button"
          onClick={onOpenSettings}
          title="Configure Instrument Specifications"
          aria-label="Instrument settings"
        >
          <SlidersHorizontal size={18} />
        </button>

        <button
          type="button"
          className="icon-button"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
