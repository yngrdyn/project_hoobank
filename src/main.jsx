import React from 'react';

import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { init as initApm } from '@elastic/apm-rum'

const apm = initApm({
  // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
  serviceName: 'Hoobank',
  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl: 'https://test-rum.apm.eastus2.staging.azure.foundit.no',
  // Set service version (required for sourcemap feature)
  serviceVersion: '0.0.1',
});

// Only one tx is enabled at a time
let activeClickSpan = undefined;

apm.observe('transaction:start', (tx) => {
  activeClickSpan = tx.startSpan('coordinates', 'click', { blocking: true, startTime: performance.now() });
});
// apm.observe('transaction:end', (tx) => console.log(`end: ${JSON.stringify(tx, '', 2)}`))

// assuming auto instrumentation is enabled
window.addEventListener('click', (e) => {
  const tx = apm.getCurrentTransaction();
  if (!!tx) {
    tx.addLabels({
      'x': e.clientX,
      'y': e.clientY,
      'width': window.innerWidth,
      'height': window.innerHeight,
    });
    if (!!activeClickSpan) {
      // Only tx with duration will be send to server
      activeClickSpan.end(activeClickSpan._start + 1);
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
