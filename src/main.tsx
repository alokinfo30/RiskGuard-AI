import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent dev WebSocket connection errors from bubbling to the unhandled rejection UI overlay
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason &&
    (String(event.reason).includes('WebSocket') ||
      String(event.reason.message || '').includes('WebSocket'))
  ) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  if (
    event.message &&
    (event.message.includes('WebSocket') || event.message.includes('failed to connect'))
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
