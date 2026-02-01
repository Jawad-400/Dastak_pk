import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Workerauthworker from './components/workerauthworker';
import './styles.css';

// Check URL to decide which page to show
const path = window.location.pathname;

const root = ReactDOM.createRoot(document.getElementById('root'));

if (path === '/worker-portal.html' || path.includes('worker-portal')) {
  root.render(
    <React.StrictMode>
      <Workerauthworker />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}