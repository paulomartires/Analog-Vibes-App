import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

// Prevent server crashes from unhandled promise rejections
if (typeof process !== 'undefined') {
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Don't exit process, just log the error
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Don't exit process, just log the error
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)