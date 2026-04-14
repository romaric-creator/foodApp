import React, { createContext, useState, useCallback } from "react";

export const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  const showFeedback = useCallback((message, severity = 'success') => {
    setFeedback({ open: true, message, severity });
  }, []);

  const closeFeedback = useCallback(() => {
    setFeedback(f => ({ ...f, open: false }));
  }, []);

  return (
    <FeedbackContext.Provider value={{ feedback, showFeedback, closeFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};
