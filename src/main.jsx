import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { DecisionProvider } from './context/DecisionContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DecisionProvider>
        <App />
      </DecisionProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
