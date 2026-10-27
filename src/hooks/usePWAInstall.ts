import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const checkIsStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    ('standalone' in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true) ||
    document.referrer.startsWith('android-app://')
  );
};

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(checkIsStandalone);
  const [isSessionInstalled, setIsSessionInstalled] = useState<boolean>(false);

  useEffect(() => {
    // 1. Initial standalone check
    const standaloneInitial = checkIsStandalone();
    setIsStandalone(standaloneInitial);

    // 2. Listen to display mode media query changes
    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      const currentStandalone = e.matches || checkIsStandalone();
      setIsStandalone(currentStandalone);
      if (currentStandalone) {
        setDeferredPrompt(null);
      }
    };

    if (standaloneMediaQuery.addEventListener) {
      standaloneMediaQuery.addEventListener('change', handleDisplayModeChange);
    } else {
      standaloneMediaQuery.addListener(handleDisplayModeChange);
    }

    // 3. Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // If already running in standalone mode or already installed in this session, never show prompt
      if (checkIsStandalone() || isSessionInstalled) {
        setDeferredPrompt(null);
        return;
      }

      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 4. Handle appinstalled event
    const handleAppInstalled = () => {
      setIsSessionInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (standaloneMediaQuery.removeEventListener) {
        standaloneMediaQuery.removeEventListener('change', handleDisplayModeChange);
      } else {
        standaloneMediaQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, [isSessionInstalled]);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsSessionInstalled(true);
      }
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    } finally {
      // Clear deferred prompt so it cannot be reused
      setDeferredPrompt(null);
    }
  };

  // Only installable if NOT standalone, NOT installed in this session, and a usable deferred prompt exists
  const isInstallable = !isStandalone && !isSessionInstalled && deferredPrompt !== null;
  const isInstalled = isStandalone || isSessionInstalled;

  return { isInstallable, isInstalled, promptInstall };
}
