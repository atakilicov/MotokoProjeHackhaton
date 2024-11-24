import React from 'react';
import ReactDOM from 'react-dom/client';
import RedditStyleApp from './RedditStyleApp';
import '../index.css'; // CSS dosyasını burada dahil edin

const App = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <RedditStyleApp />
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
