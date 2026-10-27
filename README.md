# PipWise

PipWise is a simple, mobile-friendly trading position size calculator designed to help traders manage risk and calculate lot sizes accurately.

## Features

* **Mobile-Friendly**: Clean, responsive layout designed for phones and desktops.
* **Accurate Lot Sizing**: Calculates exact position sizes with strict risk protection (rounds down to lot step).
* **Multi-Asset Support**: Forex, Gold (XAUUSD), Silver, Crude Oil, Indices (NAS100), and Crypto.
* **Flexible Inputs**: Calculate by pips, points, price difference ($), or exact entry/stop price levels.
* **Works Offline**: Installable Progressive Web App (PWA) with full offline functionality.
* **Dark & Light Modes**: Fast theme switching for any lighting environment.

## Getting Started

```bash
# Clone the repository
git clone https://github.com/hemanthxctrl/PipWise.git
cd PipWise

# Install dependencies
npm install

# Start development server
npm run dev
```

## Tech Stack

* **Frontend**: React 19, TypeScript
* **Build Tool**: Vite
* **PWA**: vite-plugin-pwa (Workbox)
* **Styling**: Vanilla CSS
