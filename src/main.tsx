import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {QueryClientProvider} from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import {queryClient} from './lib/queries';
import {registerServiceWorker} from './lib/registerSW';

// Register service worker for PWA
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
