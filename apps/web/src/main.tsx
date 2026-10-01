import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './app/App';
import { store, persistor } from './store';
import { Auth0ProviderWithNavigate } from './components/Auth0ProviderWithNavigate';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>,
);
