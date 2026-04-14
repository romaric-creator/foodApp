import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { FeedbackProvider } from './contexts/FeedbackContext';
import FeedbackSnackbar from './components/FeedbackSnackbar';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <FeedbackProvider>
      <App />
      <FeedbackSnackbar />
    </FeedbackProvider>
  </React.StrictMode>
);
