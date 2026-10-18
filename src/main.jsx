import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app/App';
import { initAuth } from '@/features/auth';

// `npm run dev:mock` serves the whole API (incl. endpoints the backend does not have yet) from the browser.
// The condition is a build-time constant, so this code is dropped from normal builds.
if (import.meta.env.VITE_MOCK === 'true') {
  const { installMockApi } = await import('./shared/mock/mockApi');
  installMockApi();
}

initAuth(); // wires token refresh into the HTTP client and restores a saved session

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
