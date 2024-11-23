import React from 'react';
import ReactDOM from 'react-dom/client';
import NameInput from './NameInput';

const App = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '20px' }}>
      <h1 style={{ color: '#333' }}>Story Writing App</h1>
      <NameInput />
    </div>
  );
};

// Ensure DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error('Root element not found!');
  }
});