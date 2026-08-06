import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--text-main)',
              border: '1px solid var(--surface-border)',
              boxShadow: 'var(--shadow-md)'
            },
            success: {
              iconTheme: {
                primary: 'var(--success)',
                secondary: 'var(--surface)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--danger)',
                secondary: 'var(--surface)',
              },
            },
          }}
        />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);