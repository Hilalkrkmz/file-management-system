import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);