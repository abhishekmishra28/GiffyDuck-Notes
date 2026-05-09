import { useEffect } from 'react';
import { AppRouter } from '@/router';
import { useAuthInit } from '@/hooks/useAuthInit';
import { useThemeStore } from '@/store/themeStore';
import { Toaster } from 'sonner';

export default function App() {
  useAuthInit();
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </>
  );
}
